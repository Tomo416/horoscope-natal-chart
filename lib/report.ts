import { PLANETS } from "@/data/planets";
import { SIGNS, signOf } from "@/data/signs";
import { ASPECTS } from "@/data/aspects";
import { READINGS, type SignReading } from "@/data/readings";
import type { ChartData, PlanetKey } from "./types";

export interface ReportSection {
  title: string;
  paragraphs: string[];
}

/**
 * 解説辞書を組み合わせて鑑定レポートを作る（外部API・AIは使わない＝無料）
 * 「〇〇座に△△があるため〜」と、根拠と性格をセットで記述する。
 */
export function buildReport(chart: ChartData): ReportSection[] {
  const lonOf = (k: PlanetKey) => chart.planets.find((p) => p.key === k)!.longitude;
  const line = (k: PlanetKey, field: keyof SignReading) => {
    const s = signOf(lonOf(k));
    return `${s.name}${s.symbol}に${PLANETS[k].name}があるため、${READINGS[s.index][field]}`;
  };

  const sections: ReportSection[] = [];

  sections.push({
    title: "あなたの基本性格と人生のテーマ（太陽星座）",
    paragraphs: [line("sun", "sun"), `${PLANETS.sun.name}は${PLANETS.sun.role}`],
  });

  const mb = chart.moonBoundary;
  if (mb?.crosses) {
    const a = SIGNS[mb.signAtStart], b = SIGNS[mb.signAtEnd];
    sections.push({
      title: "素の自分と心の安心ポイント（月星座）",
      paragraphs: [
        `あなたが生まれた日は、1日のうちに月が${a.name}から${b.name}へ移動しています。生まれた時間によって、月星座はどちらかになります。`,
        `【${a.name}の月の場合】${READINGS[a.index].moon}`,
        `【${b.name}の月の場合】${READINGS[b.index].moon}`,
        "両方を読んで「素の自分に近い」と感じる方が、あなたの月星座かもしれません。出生時間がわかれば、はっきり判明します。",
      ],
    });
  } else {
    sections.push({
      title: "素の自分と心の安心ポイント（月星座）",
      paragraphs: [line("moon", "moon")],
    });
  }

  if (chart.ascendant !== undefined && !chart.input.timeUnknown) {
    const s = signOf(chart.ascendant);
    sections.push({
      title: "第一印象と無意識の行動パターン（アセンダント）",
      paragraphs: [
        `生まれた瞬間に東の地平線から昇っていた星座（アセンダント）が${s.name}${s.symbol}のため、${READINGS[s.index].asc}`,
      ],
    });
  }

  sections.push({ title: "恋愛の傾向と好きなこと（金星星座）", paragraphs: [line("venus", "venus")] });
  sections.push({ title: "行動力と仕事のスタイル（火星星座）", paragraphs: [line("mars", "mars")] });

  // 誤差が小さい（＝影響が強い）アスペクトを上位3つ。個人天体（太陽〜火星）を含むものを優先
  const personal: PlanetKey[] = ["sun", "moon", "mercury", "venus", "mars"];
  const top = [...chart.aspects]
    .sort((x, y) => {
      const px = personal.includes(x.a) || personal.includes(x.b) ? 0 : 1;
      const py = personal.includes(y.a) || personal.includes(y.b) ? 0 : 1;
      return px - py || x.orb - y.orb;
    })
    .slice(0, 3);
  sections.push({
    title: "特に強く出ている星のつながり",
    paragraphs: top.length
      ? top.map((asp) => {
          const info = ASPECTS[asp.key];
          const A = PLANETS[asp.a], B = PLANETS[asp.b];
          return `${A.name}（${A.catchCopy}）と${B.name}（${B.catchCopy}）が「${info.nickname}」の角度で結ばれています。${info.detail}`;
        })
      : ["目立って強い星のつながりはありません。それぞれの星が独立して、のびのびと働く配置です。"],
  });

  return sections;
}
