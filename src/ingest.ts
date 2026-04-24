import * as fs from "fs";
import * as path from "path";
import { LiteParse } from "liteparse";
import { connect } from "vectordb";

const PAPERS_DIR = process.argv[3] || "./papers";
const DB_DIR = "./.lancedb";

async function ingest(): Promise<void> {
  const parser = new LiteParse();
  const db = await connect(DB_DIR);

  const files = fs.readdirSync(PAPERS_DIR).filter((f) => f.endsWith(".pdf"));
  if (files.length === 0) {
    console.log(`No PDFs found in ${PAPERS_DIR}`);
    return;
  }

  const records: object[] = [];

  for (const file of files) {
    const filePath = path.join(PAPERS_DIR, file);
    console.log(`Parsing ${file}...`);

    const result = await parser.parseFile(filePath);
    const chunks = chunkText(result.text, 512);

    for (const [i, chunk] of chunks.entries()) {
      records.push({
        id: `${file}-${i}`,
        source: file,
        page: result.pages?.[i]?.pageNumber ?? 0,
        text: chunk,
        // Placeholder — replace with real embeddings via Ollama or Anthropic
        vector: new Array(768).fill(0),
      });
    }
  }

  await db.createTable("papers", records, { writeMode: "overwrite" });
  console.log(`\nIndexed ${records.length} chunks from ${files.length} papers.`);
}

function chunkText(text: string, maxWords: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }
  return chunks;
}

ingest().catch(console.error);
