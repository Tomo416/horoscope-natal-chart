import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "はじめてのホロスコープ診断",
  description: "解説付きインタラクティブ・ホロスコープ診断",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gradient-to-b from-indigo-50 to-slate-100 text-slate-900">{children}</body>
    </html>
  );
}
