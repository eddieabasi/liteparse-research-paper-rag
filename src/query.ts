import * as readline from "readline";
import { connect } from "vectordb";
import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";

const DB_DIR = "./.lancedb";

async function query(): Promise<void> {
  const db = await connect(DB_DIR);
  const table = await db.openTable("papers");
  const anthropic = new Anthropic();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q: string) => new Promise<string>((r) => rl.question(q, r));

  console.log("Research Paper Q&A — type 'exit' to quit\n");

  while (true) {
    const question = await ask("You: ");
    if (question.toLowerCase() === "exit") break;

    // Placeholder vector search — replace with real embeddings
    const results = await table.search(new Array(768).fill(0)).limit(5).execute();

    const context = results.map((r: any) => `[${r.source}]\n${r.text}`).join("\n\n---\n\n");

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Answer the question using only the provided research paper excerpts. Cite the source file for each fact.\n\nContext:\n${context}\n\nQuestion: ${question}`,
        },
      ],
    });

    const answer = response.content[0].type === "text" ? response.content[0].text : "";
    console.log(`\nAssistant: ${answer}\n`);
  }

  rl.close();
}

query().catch(console.error);
