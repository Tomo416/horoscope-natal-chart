"use client";

import { useState } from "react";
import BirthForm from "@/components/BirthForm";
import HoroscopeChart from "@/components/HoroscopeChart";
import ChartSummary from "@/components/ChartSummary";
import Report from "@/components/Report";
import { buildReport } from "@/lib/report";
import type { BirthInput, ChartData } from "@/lib/types";

export default function Home() {
  const [chart, setChart] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (input: BirthInput) => {
    setLoading(true); setError(""); setChart(null);
    try {
      const res = await fetch("/api/chart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChart(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header className="text-center">
        <h1 className="text-3xl font-bold">はじめてのホロスコープ</h1>
        <p className="mt-2 text-slate-600">生まれた日の星空から、あなたの個性をやさしく読み解きます。</p>
      </header>

      <BirthForm onSubmit={handleSubmit} loading={loading} />

      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {chart && (
        <section className="space-y-6 rounded-2xl bg-white p-4 shadow sm:p-6">
          <h2 className="text-xl font-bold">あなたのホロスコープ</h2>
          <p className="text-sm text-slate-500">星や星座の記号、線にマウスを乗せる（スマホではタップする）と解説が表示されます。</p>
          <HoroscopeChart chart={chart} />
          <ChartSummary chart={chart} />
        </section>
      )}

      {chart && (
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">✨ あなたへの鑑定レポート</h2>
          <Report sections={buildReport(chart)} />
        </section>
      )}
    </main>
  );
}
