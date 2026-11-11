"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PLANETS } from "@/data/planets";
import { SIGNS, ELEMENT_COLORS, signOf, degreeInSign } from "@/data/signs";
import { ASPECTS } from "@/data/aspects";
import type { ChartData } from "@/lib/types";

const SIZE = 600;
const C = SIZE / 2;
const R_OUTER = 290;
const R_SIGN_IN = 245;
const R_PLANET = 210;
const R_HOUSE_IN = 120;
const R_ASPECT = 115;

interface Tip { x: number; y: number; content: ReactNode; pinned: boolean }

export default function HoroscopeChart({ chart }: { chart: ChartData }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);

  // アセンダントを左（9時方向）に。時間不明時は牡羊座0度を左に置く
  const base = chart.ascendant ?? 0;
  const pt = (lon: number, r: number) => {
    const t = ((180 + lon - base) * Math.PI) / 180;
    return { x: C + r * Math.cos(t), y: C - r * Math.sin(t) };
  };

  // 天体記号が重ならないよう表示位置をずらす
  const displayLon = useMemo(() => {
    const sorted = [...chart.planets].sort((a, b) => a.longitude - b.longitude);
    const out: Record<string, number> = {};
    let prev = -999;
    for (const p of sorted) {
      const l = p.longitude - prev < 7 ? prev + 7 : p.longitude;
      out[p.key] = l;
      prev = l;
    }
    return out;
  }, [chart.planets]);

  // 画面外タップで閉じる
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setTip(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const position = (e: React.MouseEvent | React.PointerEvent) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlers = (content: ReactNode) => ({
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") setTip((t) => (t?.pinned ? t : { ...position(e), content, pinned: false }));
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") setTip((t) => (t?.pinned ? t : null));
    },
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      setTip({ ...position(e), content, pinned: true });
    },
    style: { cursor: "pointer" },
  });

  const houses = chart.input.timeUnknown ? undefined : chart.houses;
  const planetLon = Object.fromEntries(chart.planets.map((p) => [p.key, p.longitude]));

  return (
    <div ref={wrapRef} className="relative mx-auto w-full max-w-[600px] select-none" onClick={() => setTip(null)}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full" role="img" aria-label="ホロスコープチャート">
        <circle cx={C} cy={C} r={R_OUTER} fill="#fff" stroke="#334155" strokeWidth={2} />

        {/* 12星座の枠 */}
        {SIGNS.map((s) => {
          const a0 = s.index * 30;
          const p1 = pt(a0, R_OUTER), p2 = pt(a0 + 30, R_OUTER);
          const p3 = pt(a0 + 30, R_SIGN_IN), p4 = pt(a0, R_SIGN_IN);
          const d = `M${p1.x},${p1.y} A${R_OUTER},${R_OUTER} 0 0 0 ${p2.x},${p2.y} L${p3.x},${p3.y} A${R_SIGN_IN},${R_SIGN_IN} 0 0 1 ${p4.x},${p4.y} Z`;
          const mid = pt(a0 + 15, (R_OUTER + R_SIGN_IN) / 2);
          const content = (
            <>
              <div className="text-base font-bold">{s.symbol} {s.name}</div>
              <div className="text-xs text-slate-500">エレメント：{s.element}　/ {s.catchCopy}</div>
              <div className="mt-1">{s.nature}</div>
            </>
          );
          return (
            <g key={s.index} {...handlers(content)}>
              <path d={d} fill={ELEMENT_COLORS[s.element]} fillOpacity={0.55} stroke="#334155" strokeWidth={1} />
              <text x={mid.x} y={mid.y} fontSize={22} textAnchor="middle" dominantBaseline="central">{s.symbol}</text>
            </g>
          );
        })}

        <circle cx={C} cy={C} r={R_SIGN_IN} fill="none" stroke="#334155" />
        <circle cx={C} cy={C} r={R_HOUSE_IN} fill="#f8fafc" stroke="#94a3b8" />

        {/* 1度ごとの目盛り */}
        {Array.from({ length: 72 }, (_, i) => {
          const a = pt(i * 5, R_SIGN_IN), b = pt(i * 5, R_SIGN_IN - (i % 2 ? 4 : 8));
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#94a3b8" />;
        })}

        {/* ハウス線（時間判明時のみ） */}
        {houses?.map((cusp, i) => {
          const a = pt(cusp, R_SIGN_IN), b = pt(cusp, R_HOUSE_IN);
          const next = houses[(i + 1) % 12];
          const span = (((next - cusp) % 360) + 360) % 360;
          const label = pt(cusp + span / 2, R_HOUSE_IN + 12);
          const isAngle = i === 0 || i === 3 || i === 6 || i === 9;
          return (
            <g key={i}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={isAngle ? "#0f172a" : "#cbd5e1"} strokeWidth={isAngle ? 2 : 1} />
              <text x={label.x} y={label.y} fontSize={10} fill="#64748b" textAnchor="middle" dominantBaseline="central">{i + 1}</text>
            </g>
          );
        })}
        {chart.ascendant !== undefined && (() => {
          const p = pt(chart.ascendant, R_OUTER + 2);
          return <text x={p.x - 4} y={p.y - 8} fontSize={11} textAnchor="end" fontWeight="bold">ASC</text>;
        })()}

        {/* アスペクト線（透明な太い判定用ラインを重ねる） */}
        {chart.aspects.map((asp, i) => {
          const info = ASPECTS[asp.key];
          // 0度は実位置だと線が点になるため、ずらした表示位置同士を結ぶ
          const src = asp.key === "conjunction" ? displayLon : planetLon;
          const r = asp.key === "conjunction" ? R_PLANET - 24 : R_ASPECT;
          const a = pt(src[asp.a], r), b = pt(src[asp.b], r);
          const content = (
            <>
              <div className="text-base font-bold" style={{ color: info.color }}>{info.name}</div>
              <div className="text-xs text-slate-500">「{info.nickname}」</div>
              <div className="mt-1">{PLANETS[asp.a].symbol}{PLANETS[asp.a].name} と {PLANETS[asp.b].symbol}{PLANETS[asp.b].name}</div>
              <div className="mt-1">{info.meaning}</div>
            </>
          );
          return (
            <g key={i} {...handlers(content)}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={info.color} strokeWidth={asp.key === "conjunction" ? 3 : 1.5} strokeDasharray={info.dash} opacity={0.85} />
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={16} pointerEvents="stroke" />
            </g>
          );
        })}

        {/* 天体 */}
        {chart.planets.map((p) => {
          const info = PLANETS[p.key];
          const sign = signOf(p.longitude);
          const real = pt(p.longitude, R_SIGN_IN);
          const tick = pt(p.longitude, R_SIGN_IN - 12);
          const pos = pt(displayLon[p.key], R_PLANET);
          const content = (
            <>
              <div className="text-base font-bold" style={{ color: info.color }}>{info.symbol} {info.name}{p.retrograde && <span className="ml-1 text-xs">（逆行中）</span>}</div>
              <div className="text-xs text-slate-500">{info.catchCopy}</div>
              <div className="mt-1">{sign.symbol} {sign.name} {degreeInSign(p.longitude)}</div>
              <div className="mt-1">{info.role}</div>
            </>
          );
          return (
            <g key={p.key} {...handlers(content)}>
              <line x1={real.x} y1={real.y} x2={tick.x} y2={tick.y} stroke={info.color} strokeWidth={2} />
              <circle cx={pos.x} cy={pos.y} r={16} fill="#fff" stroke={info.color} strokeWidth={1.5} />
              <text x={pos.x} y={pos.y} fontSize={18} fill={info.color} textAnchor="middle" dominantBaseline="central">{info.symbol}</text>
            </g>
          );
        })}
      </svg>

      {tip && (
        <div
          className="pointer-events-none absolute z-10 w-64 rounded-lg border border-slate-200 bg-white/95 p-3 text-sm text-slate-800 shadow-lg"
          style={{
            left: Math.min(Math.max(tip.x - 128, 0), (wrapRef.current?.clientWidth ?? 600) - 256),
            top: tip.y + 16,
          }}
        >
          {tip.content}
        </div>
      )}
    </div>
  );
}
