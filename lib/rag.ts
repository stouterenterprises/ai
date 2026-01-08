import OpenAI from "openai";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type RagSource = {
  id: string;
  title: string;
  url: string | null;
  excerpt: string;
  similarity: number;
};

export type RagResult = {
  answer: string;
  sources: RagSource[];
};

const getOpenAIClient = () => {
  const apiKey = process.env.AI_PROVIDER_KEY;
  if (!apiKey) {
    throw new Error("AI provider key is missing");
  }
  return new OpenAI({ apiKey });
};

export const runRag = async (question: string, businessId?: string): Promise<RagResult> => {
  const supabase = createServerSupabaseClient();
  const openai = getOpenAIClient();

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question
  });

  const query = embedding.data[0]?.embedding ?? [];
  const { data, error } = await supabase.rpc("match_kb_chunks", {
    query_embedding: query,
    match_count: 6,
    filter_business_id: businessId ?? null
  });

  if (error || !data) {
    return {
      answer: "I couldn't find relevant sources. Please rephrase your question or contact an agent.",
      sources: []
    };
  }

  const context = data
    .map((chunk: any, index: number) =>
      `Source ${index + 1}: ${chunk.title}\n${chunk.content}\nURL: ${chunk.url ?? ""}`
    )
    .join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an AI support assistant. Answer only with the provided sources. Cite sources by title and URL. Refuse unsupported questions."
      },
      {
        role: "user",
        content: `Question: ${question}\n\nSources:\n${context}`
      }
    ]
  });

  return {
    answer: completion.choices[0]?.message?.content ?? "No answer generated.",
    sources: data.map((chunk: any) => ({
      id: chunk.id,
      title: chunk.title,
      url: chunk.url,
      excerpt: chunk.content,
      similarity: chunk.similarity
    }))
  };
};
