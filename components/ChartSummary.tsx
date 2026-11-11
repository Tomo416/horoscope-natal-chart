import { PLANETS, PLANET_ORDER } from "@/data/planets";
import { SIGNS, signOf, degreeInSign } from "@/data/signs";
import { ASPECTS, ASPECT_ORDER } from "@/data/aspects";
import type { ChartData } from "@/lib/types";

export default function ChartSummary({ chart }: { chart: ChartData }) {
  const mb = chart.moonBoundary;
  return (
    <div className="space-y-4">
      {chart.input.timeUnknown && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm">
          出生時間が不明のため、正午の星の配置で計算しています。時間によって変わる
          「アセンダント（生まれた瞬間に東の地平線にあった星座＝第一印象）」と「12ハウス（人生の12の舞台）」は除外しています。
        </div>
      )}
      {mb?.crosses && (
        <div className="rounded-lg border border-sky-300 bg-sky-50 p-4 text-sm">
          🌙 この日は1日のうちに月が <b>{SIGNS[mb.signAtStart].name}</b> から <b>{SIGNS[mb.signAtEnd].name}</b> へ移動しています。
          あなたの月星座はどちらかの可能性があります。
          <ul className="mt-2 list-disc pl-5">
            <li><b>{SIGNS[mb.signAtStart].name}</b>の月：{SIGNS[mb.signAtStart].nature}</li>
            <li><b>{SIGNS[mb.signAtEnd].name}</b>の月：{SIGNS[mb.signAtEnd].nature}</li>
          </ul>
          両方の説明を読んで「素の自分に近い」と感じる方が、あなたの月星座かもしれません。
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-xs">
        {ASPECT_ORDER.map((k) => (
          <span key={k} className="flex items-center gap-1">
            <svg width="24" height="6"><line x1="0" y1="3" x2="24" y2="3" stroke={ASPECTS[k].color} strokeWidth="2" strokeDasharray={ASPECTS[k].dash} /></svg>
            {ASPECTS[k].name}
          </span>
        ))}
      </div>

      <table className="avoid-break w-full overflow-hidden rounded-lg bg-white text-sm shadow">
        <thead className="bg-slate-100">
          <tr><th className="p-2 text-left">天体</th><th className="p-2 text-left">星座</th><th className="p-2 text-left">役割</th></tr>
        </thead>
        <tbody>
          {PLANET_ORDER.map((k) => {
            const p = chart.planets.find((x) => x.key === k);
            if (!p) return null;
            const s = signOf(p.longitude);
            return (
              <tr key={k} className="border-t">
                <td className="p-2 whitespace-nowrap" style={{ color: PLANETS[k].color }}>{PLANETS[k].symbol} {PLANETS[k].name}</td>
                <td className="p-2 whitespace-nowrap">{s.symbol} {s.name} {degreeInSign(p.longitude)}{p.retrograde ? " ℞" : ""}</td>
                <td className="p-2 text-slate-600">{PLANETS[k].catchCopy}</td>
              </tr>
            );
          })}
          {chart.ascendant !== undefined && (
            <tr className="border-t">
              <td className="p-2 font-semibold">ASC</td>
              <td className="p-2">{signOf(chart.ascendant).symbol} {signOf(chart.ascendant).name} {degreeInSign(chart.ascendant)}</td>
              <td className="p-2 text-slate-600">第一印象・無意識の振る舞い</td>
            </tr>
          )}
        </tbody>
      </table>

    </div>
  );
}
