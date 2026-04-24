import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { LiteParse } from "liteparse";

const parser = new LiteParse();
const store: { source: string; text: string }[] = [];

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const files = form.getAll("files") as File[];

  mkdirSync("/tmp/papers", { recursive: true });
  store.length = 0;

  for (const file of files) {
    const buf = Buffer.from(await file.arrayBuffer());
    const path = join("/tmp/papers", file.name);
    writeFileSync(path, buf);

    const result = await parser.parseFile(path);
    const words = result.text.split(/\s+/);
    for (let i = 0; i < words.length; i += 400) {
      store.push({ source: file.name, text: words.slice(i, i + 400).join(" ") });
    }
  }

  return NextResponse.json({ indexed: store.length });
}

export { store };
