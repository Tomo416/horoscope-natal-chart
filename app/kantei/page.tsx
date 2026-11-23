"use client";

import { useState } from "react";
import Link from "next/link";
import BirthForm from "@/components/BirthForm";
import { calculateChart } from "@/lib/astroCalc";
import { buildThemeReport, type ThemeReport } from "@/lib/themeReport";
import type { BirthInput, ChartData } from "@/lib/types";

const ICON: Record<string, string> = { work: "💼", money: "💰", relation: "🤝", love: "💗", life: "🌟" };

export default function Kantei() {
  const [chart, setChart] = useState<ChartData | null>(null);
  const [report, setReport] = useState<ThemeReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (input: BirthInput) => {
    setLoading(true); setError(""); setChart(null); setReport(null);
    setTimeout(() => {
      try {
        const c = calculateChart(input);
        setChart(c); setReport(buildThemeReport(c));
        setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth" }), 50);
      } catch (e) {
        setError("計算中にエラーが発生しました: " + (e as Error).message);
      } finally {
        setLoading(false);
      }
    }, 0);
  };

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header className="no-print text-center">
        <h1 className="text-3xl font-bold">テーマ別鑑定</h1>
        <p className="mt-2 text-slate-600">仕事・お金・人間関係・恋愛・人生の傾向を、生まれた日の星から読み解きます。</p>
        <p className="mt-2 text-sm"><Link href="/" className="text-indigo-700 underline">ホロスコープを見る</Link></p>
      </header>

      <BirthForm onSubmit={handleSubmit} loading={loading} />

      {error && <div className="no-print rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {chart && report && (
        <>
          <div id="result" className="no-print flex flex-wrap items-center justify-between gap-3">
            <nav className="flex flex-wrap gap-2 text-sm">
              {report.sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="rounded-full border border-indigo-200 bg-white px-3 py-1 text-indigo-700 hover:bg-indigo-50">
                  {ICON[s.id]} {s.title}
                </a>
              ))}
            </nav>
            <button type="button" onClick={() => window.print()}
              className="rounded-lg border border-indigo-600 px-5 py-2 font-bold text-indigo-700 hover:bg-indigo-50">
              🖨 印刷する
            </button>
          </div>

          <div className="print-only border-b-2 border-slate-800 pb-2">
            <h1 className="text-2xl font-bold">テーマ別鑑定書{chart.input.name ? `　${chart.input.name} 様` : ""}</h1>
            <p className="mt-1 text-sm">
              生年月日：{chart.input.date.replace(/^(\d+)-(\d+)-(\d+)$/, (_, y, m, d) => `${y}年${Number(m)}月${Number(d)}日`)}
              　出生時間：{chart.input.time ?? "不明（正午で計算）"}
              　出生地：{chart.input.placeName}
            </p>
            <p className="text-xs text-slate-500">作成日：{new Date().toLocaleDateString("ja-JP")}</p>
          </div>

          {report.notes.length > 0 && (
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              {report.notes.map((n, i) => <p key={i}>{n}</p>)}
            </div>
          )}

          {report.sections.map((s, i) => (
            <section key={s.id} id={s.id} className={`card scroll-mt-4 space-y-4 rounded-2xl bg-white p-6 shadow ${i > 0 ? "page-break" : ""}`}>
              <h2 className="text-xl font-bold">{ICON[s.id]} {s.title}</h2>
              <p className="rounded-lg bg-indigo-50 p-3 font-semibold text-indigo-900">{s.lead}</p>
              {s.chips && (
                <div>
                  <p className="text-sm font-semibold text-slate-600">向いている仕事の例</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {s.chips.map((c) => <span key={c} className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-900">{c}</span>)}
                  </div>
                </div>
              )}
              <div className="space-y-3 leading-relaxed text-slate-800">
                {s.blocks.map((b, j) => (
                  <div key={j} className="avoid-break">
                    <h3 className="border-l-4 border-indigo-400 pl-2 text-sm font-bold text-indigo-900">{b.label}</h3>
                    <p className="mt-1">{b.text}</p>
                  </div>
                ))}
              </div>
              <div className="avoid-break rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-bold text-emerald-900">アドバイス</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-emerald-950">
                  {s.advice.map((a, j) => <li key={j}>{a}</li>)}
                </ul>
              </div>
              <p className="text-xs text-slate-500">読み解きに使った星：{s.basis.join("　")}</p>
            </section>
          ))}
        </>
      )}

      <footer className="no-print text-center text-xs text-slate-400">
        市区町村の位置：国土数値情報（行政区域データ）（国土交通省）をもとに作成
      </footer>
    </main>
  );
}
