import OpenAI from "openai";
import { query } from "@/lib/db";

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
  const openai = getOpenAIClient();

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question
  });

  const embeddingVector = embedding.data[0]?.embedding ?? [];
  const chunks = await query<{
    id: string;
    title: string;
    url: string | null;
    content: string;
    embedding: string | null;
  }>(
    `select id, title, url, content, embedding
     from kb_chunks
     ${businessId ? "where business_id = ?" : ""}
     limit 200`,
    businessId ? [businessId] : []
  );

  const scored = chunks
    .map((chunk) => {
      const embedding = chunk.embedding ? (JSON.parse(chunk.embedding) as number[]) : [];
      const similarity = cosineSimilarity(embeddingVector, embedding);
      return { ...chunk, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 6);

  if (!scored.length) {
    return {
      answer: "I couldn't find relevant sources. Please rephrase your question or contact an agent.",
      sources: []
    };
  }

  const context = scored
    .map((chunk, index) => `Source ${index + 1}: ${chunk.title}\n${chunk.content}\nURL: ${chunk.url ?? ""}`)
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
    sources: scored.map((chunk) => ({
      id: chunk.id,
      title: chunk.title,
      url: chunk.url,
      excerpt: chunk.content,
      similarity: chunk.similarity
    }))
  };
};

const cosineSimilarity = (a: number[], b: number[]) => {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};
