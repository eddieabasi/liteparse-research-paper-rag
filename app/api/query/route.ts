import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { store } from "../ingest/route";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const { question } = await req.json();

  const context = store
    .slice(0, 10)
    .map((c) => `[${c.source}]\n${c.text}`)
    .join("\n\n---\n\n");

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Answer the question using only the research paper excerpts below. Cite the source file for each fact.\n\nContext:\n${context}\n\nQuestion: ${question}`,
      },
    ],
  });

  const answer = response.content[0].type === "text" ? response.content[0].text : "";
  return NextResponse.json({ answer });
}
