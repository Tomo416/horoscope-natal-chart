"use client";

import { useState } from "react";
import { PREFECTURES, TOKYO } from "@/data/prefectures";
import type { BirthInput } from "@/lib/types";

/** 和暦 → 西暦。開始日（改元日）と最終年を持つ */
const ERAS = [
  { key: "西暦", offset: 0, start: "1900-01-01", end: "2100-12-31" },
  { key: "令和", offset: 2018, start: "2019-05-01", end: "2100-12-31" },
  { key: "平成", offset: 1988, start: "1989-01-08", end: "2019-04-30" },
  { key: "昭和", offset: 1925, start: "1926-12-25", end: "1989-01-07" },
  { key: "大正", offset: 1911, start: "1912-07-30", end: "1926-12-24" },
  { key: "明治", offset: 1867, start: "1900-01-01", end: "1912-07-29" },
] as const;
type EraKey = (typeof ERAS)[number]["key"];

const pad = (n: number) => String(n).padStart(2, "0");
const toHalf = (s: string) => s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));

/** 西暦年 → 「昭和23年」のような表記（確認表示用） */
function warekiLabel(iso: string) {
  const era = ERAS.slice(1).find((e) => iso >= e.start && iso <= e.end);
  if (!era) return "";
  const n = Number(iso.slice(0, 4)) - era.offset;
  return `${era.key}${n === 1 ? "元" : n}年`;
}

export default function BirthForm({ onSubmit, loading }: { onSubmit: (v: BirthInput) => void; loading: boolean }) {
  const [name, setName] = useState("");
  const [era, setEra] = useState<EraKey>("昭和");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [prefCode, setPrefCode] = useState(TOKYO.code);

  // 入力値 → ISO日付（不正なら理由を返す）
  const resolveDate = (): { iso?: string; error?: string } => {
    const ys = toHalf(year).trim();
    const y = ys === "元" ? 1 : Number(ys), m = Number(month), d = Number(day);
    if (!year || !m || !d) return {};
    if (!Number.isInteger(y) || y < 1) return { error: "年は数字（または「元」）で入力してください" };
    const e = ERAS.find((x) => x.key === era)!;
    const gy = y + e.offset;
    const dt = new Date(Date.UTC(gy, m - 1, d));
    if (dt.getUTCMonth() !== m - 1) return { error: `${m}月${d}日は存在しない日付です` };
    const iso = `${gy}-${pad(m)}-${pad(d)}`;
    if (iso < e.start || iso > e.end) return { error: `${era}${y === 1 ? "元" : y}年${m}月${d}日は${era}の期間外です（${e.start.replace(/-/g, "/")}〜${e.end.replace(/-/g, "/")}）` };
    if (iso < "1900-01-01" || iso > "2100-12-31") return { error: "1900〜2100年の範囲で入力してください" };
    return { iso };
  };
  const { iso, error } = resolveDate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!iso) return;
    const t = toHalf(time).replace(/[^0-9:]/g, "");
    const hm = /^\d{1,2}:\d{2}$/.test(t) ? t : /^\d{3,4}$/.test(t) ? `${t.slice(0, -2)}:${t.slice(-2)}` : "";
    const unknown = timeUnknown || !hm;
    const pref = unknown ? TOKYO : PREFECTURES.find((p) => p.code === prefCode) ?? TOKYO;
    onSubmit({
      name: name.trim() || undefined,
      date: iso,
      time: unknown ? null : hm.padStart(5, "0"),
      timeUnknown: unknown,
      lat: pref.lat,
      lon: pref.lon,
      tzone: 9,
      placeName: `${pref.name}（${pref.city}）`,
    });
  };

  const field = "rounded border border-slate-300 px-3 py-2";

  return (
    <form onSubmit={submit} className="no-print space-y-4 rounded-2xl bg-white p-6 shadow">
      <label className="block">
        <span className="font-semibold">お名前（任意・印刷時に表示）</span>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例：山田 花子"
          className={`mt-1 w-full ${field}`} />
      </label>

      <div>
        <span className="font-semibold">生年月日 <span className="text-red-500">*</span></span>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <select value={era} onChange={(e) => setEra(e.target.value as EraKey)} className={field} aria-label="年号">
            {ERAS.map((x) => <option key={x.key}>{x.key}</option>)}
          </select>
          <input inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)}
            placeholder={era === "西暦" ? "1975" : "50 / 元"} className={`${field} w-24`} aria-label="年" />年
          <select value={month} onChange={(e) => setMonth(e.target.value)} className={field} aria-label="月">
            <option value="">--</option>
            {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
          </select>月
          <select value={day} onChange={(e) => setDay(e.target.value)} className={field} aria-label="日">
            <option value="">--</option>
            {Array.from({ length: 31 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
          </select>日
        </div>
        {iso && <p className="mt-1 text-sm text-slate-600">→ {iso.replace(/^(\d+)-0?(\d+)-0?(\d+)$/, "$1年$2月$3日")}（{warekiLabel(iso)}）</p>}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div>
        <span className="font-semibold">出生時間（任意）</span>
        <input value={time} disabled={timeUnknown} onChange={(e) => setTime(e.target.value)}
          inputMode="numeric" placeholder="例：8:30 または 0830（24時間表記）"
          className={`mt-1 w-full ${field} disabled:bg-slate-100 disabled:text-slate-400`} />
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} />
          時間がわからない（空欄のままでも「不明」として扱います）
        </label>
        {(timeUnknown || !time) && (
          <p className="mt-1 text-xs text-slate-500">
            正午（12:00）・東京で計算します。時間で変わる「アセンダント」と「ハウス」は表示しません。
          </p>
        )}
      </div>

      <label className="block">
        <span className="font-semibold">出生地</span>
        <select value={timeUnknown || !time ? TOKYO.code : prefCode} disabled={timeUnknown || !time}
          onChange={(e) => setPrefCode(Number(e.target.value))}
          className={`mt-1 w-full ${field} disabled:bg-slate-100`}>
          {PREFECTURES.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
        </select>
      </label>

      <button type="submit" disabled={loading || !iso}
        className="w-full rounded-lg bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
        {loading ? "計算中…" : "ホロスコープを作成する"}
      </button>
    </form>
  );
}
