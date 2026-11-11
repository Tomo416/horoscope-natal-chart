"use client";

import { useState } from "react";
import { PREFECTURES, TOKYO } from "@/data/prefectures";
import type { BirthInput } from "@/lib/types";

export default function BirthForm({ onSubmit, loading }: { onSubmit: (v: BirthInput) => void; loading: boolean }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("12:00");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [prefCode, setPrefCode] = useState(TOKYO.code);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    // 時間不明時は東京をデフォルトに
    const pref = timeUnknown ? TOKYO : PREFECTURES.find((p) => p.code === prefCode) ?? TOKYO;
    onSubmit({
      date,
      time: timeUnknown ? null : time,
      timeUnknown,
      lat: pref.lat,
      lon: pref.lon,
      tzone: 9,
      placeName: `${pref.name}（${pref.city}）`,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow">
      <label className="block">
        <span className="font-semibold">生年月日 <span className="text-red-500">*</span></span>
        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)}
          min="1900-01-01" max="2100-12-31"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
      </label>

      <div>
        <span className="font-semibold">出生時間（任意）</span>
        <input type="time" value={time} disabled={timeUnknown} onChange={(e) => setTime(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 disabled:bg-slate-100 disabled:text-slate-400" />
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} />
          時間がわからない
        </label>
        {timeUnknown && (
          <p className="mt-1 text-xs text-slate-500">
            正午（12:00）・東京で計算します。時間で変わる「アセンダント」と「ハウス」は表示しません。
          </p>
        )}
      </div>

      <label className="block">
        <span className="font-semibold">出生地</span>
        <select value={timeUnknown ? TOKYO.code : prefCode} disabled={timeUnknown}
          onChange={(e) => setPrefCode(Number(e.target.value))}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 disabled:bg-slate-100">
          {PREFECTURES.map((p) => (
            <option key={p.code} value={p.code}>{p.name}</option>
          ))}
        </select>
      </label>

      <button type="submit" disabled={loading || !date}
        className="w-full rounded-lg bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
        {loading ? "星を読んでいます…" : "ホロスコープを作成する"}
      </button>
    </form>
  );
}
