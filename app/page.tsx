"use client";

import { useState, useRef } from "react";

type Message = { role: "user" | "assistant"; text: string };

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [indexed, setIndexed] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleIndex() {
    if (!files.length) return;
    setIndexing(true);
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    await fetch("/api/ingest", { method: "POST", body: form });
    setIndexed(true);
    setIndexing(false);
  }

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || loading) return;
    const q = question.trim();
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);
    const res = await fetch("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q }),
    });
    const data = await res.json();
    setMessages((m) => [...m, { role: "assistant", text: data.answer }]);
    setLoading(false);
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-1">📄 Research Paper Q&A</h1>
      <p className="text-gray-500 mb-6">Upload academic PDFs and ask questions — runs fully locally via LiteParse.</p>

      {!indexed ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700"
          >
            Select PDFs
          </button>
          {files.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">{files.length} file(s) selected</p>
              <ul className="text-xs text-gray-500 mb-4 space-y-1">
                {files.map((f) => <li key={f.name}>📄 {f.name}</li>)}
              </ul>
              <button
                onClick={handleIndex}
                disabled={indexing}
                className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {indexing ? "Indexing papers..." : "Index Papers"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
            ✅ {files.length} paper(s) indexed — ask anything below.
          </div>

          <div className="bg-white rounded-xl border border-gray-200 h-96 overflow-y-auto p-4 mb-4 space-y-4">
            {messages.length === 0 && (
              <p className="text-gray-400 text-sm text-center mt-8">Your answers will appear here.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                    m.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2.5 rounded-2xl text-sm text-gray-500 animate-pulse">Searching papers...</div>
              </div>
            )}
          </div>

          <form onSubmit={handleAsk} className="flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your papers..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              Ask
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
