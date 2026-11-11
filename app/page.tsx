"use client";

import { useState } from "react";
import BirthForm from "@/components/BirthForm";
import HoroscopeChart from "@/components/HoroscopeChart";
import ChartSummary from "@/components/ChartSummary";
import Report from "@/components/Report";
import { buildReport } from "@/lib/report";
import { calculateChart } from "@/lib/astroCalc";
import type { BirthInput, ChartData } from "@/lib/types";

export default function Home() {
  const [chart, setChart] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (input: BirthInput) => {
    setLoading(true); setError(""); setChart(null);
    // 天体計算はブラウザ内で実行（サーバー・外部APIは不要）
    setTimeout(() => {
      try {
        setChart(calculateChart(input));
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
        <h1 className="text-3xl font-bold">はじめてのホロスコープ</h1>
        <p className="mt-2 text-slate-600">生まれた日の星空から、あなたの個性をやさしく読み解きます。</p>
      </header>

      <BirthForm onSubmit={handleSubmit} loading={loading} />

      {error && <div className="no-print rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {chart && (
        <div className="no-print flex justify-end">
          <button type="button" onClick={() => window.print()}
            className="rounded-lg border border-indigo-600 px-5 py-2 font-bold text-indigo-700 hover:bg-indigo-50">
            🖨 印刷する
          </button>
        </div>
      )}

      {chart && (
        <div className="print-only border-b-2 border-slate-800 pb-2">
          <h1 className="text-2xl font-bold">ホロスコープ鑑定書{chart.input.name ? `　${chart.input.name} 様` : ""}</h1>
          <p className="mt-1 text-sm">
            生年月日：{chart.input.date.replace(/^(\d+)-(\d+)-(\d+)$/, (_, y, m, d) => `${y}年${Number(m)}月${Number(d)}日`)}
            　出生時間：{chart.input.time ?? "不明（正午で計算）"}
            　出生地：{chart.input.placeName}
          </p>
          <p className="text-xs text-slate-500">作成日：{new Date().toLocaleDateString("ja-JP")}</p>
        </div>
      )}

      {chart && (
        <section className="card space-y-6 rounded-2xl bg-white p-4 shadow sm:p-6">
          <h2 className="text-xl font-bold">あなたのホロスコープ</h2>
          <p className="no-print text-sm text-slate-500">星や星座の記号、線にマウスを乗せる（スマホではタップする）と解説が表示されます。</p>
          <HoroscopeChart chart={chart} />
          <ChartSummary chart={chart} />
        </section>
      )}

      {chart && (
        <section className="card page-break rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">✨ あなたへの鑑定レポート</h2>
          <Report sections={buildReport(chart)} />
        </section>
      )}
    </main>
  );
}
