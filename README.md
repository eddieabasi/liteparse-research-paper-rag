# LiteParse — Research Paper Q&A (Local RAG)

A fully local RAG system for academic PDFs. Drop in a folder of papers and ask questions across all of them — no cloud, no API keys required.

## What it does
- Batch parses a folder of PDFs locally using LiteParse
- Cross-paper Q&A with citations (paper title + page number)
- Runs fully offline with Ollama embeddings and LLM
- Spatial bounding boxes enable exact page/column citations

## Stack
- **Parser:** LiteParse (local, zero cloud)
- **Orchestration:** LlamaIndex.TS
- **Embeddings:** nomic-embed-text via Ollama
- **Vector store:** LanceDB (embedded)
- **LLM:** Ollama (llama3) or Claude API

## Quickstart

```bash
npm install
cp .env.example .env   # optional: add ANTHROPIC_API_KEY for Claude
npx ts-node src/ingest.ts --input ./papers/
npx ts-node src/query.ts
```

## Project structure
```
.
├── src/
│   ├── ingest.ts        # Parse + embed papers
│   ├── query.ts         # CLI Q&A interface
│   └── config.ts        # LLM / vector store config
├── papers/              # Drop your PDFs here
├── package.json
├── tsconfig.json
└── .env.example
```
