import { NextResponse } from "next/server";
import { runRag } from "@/lib/rag";

export async function POST(request: Request) {
  const body = await request.json();
  const messages = body.messages ?? [];
  const lastMessage = messages[messages.length - 1]?.content ?? "";

  if (!lastMessage) {
    return NextResponse.json({ reply: "Ask a question to get started." }, { status: 400 });
  }

  try {
    const result = await runRag(lastMessage, body.businessId);
    const sourcesText = result.sources
      .map((source) => `- ${source.title} (${source.url ?? ""})`)
      .join("\n");
    const reply = `${result.answer}\n\nSources:\n${sourcesText || "No sources found."}`;
    return NextResponse.json({ reply, sources: result.sources });
  } catch (error) {
    return NextResponse.json(
      {
        reply: "AI is unavailable. Please request human support.",
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
}
