import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Research Paper Q&A",
  description: "Local RAG for academic papers — powered by LiteParse",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen text-gray-900">{children}</body>
    </html>
  );
}
