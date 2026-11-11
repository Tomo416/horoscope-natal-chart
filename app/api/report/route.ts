import { NextResponse } from "next/server";
import { PLANETS } from "@/data/planets";
import { SIGNS, signOf, degreeInSign } from "@/data/signs";
import { ASPECTS } from "@/data/aspects";
import type { ChartData } from "@/lib/types";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5";

const SYSTEM = `あなたは西洋占星術を知らない初心者にもやさしく語りかける、経験豊かな占星術師です。
渡された天体データ（外部APIで計算済み。数値は絶対に変更・再計算しないこと）だけを根拠に、日本語の鑑定レポートを書いてください。

# ルール
- 必ず「〇〇座に太陽があるため、〜な性格です」のように【根拠（星と星座）】と【性格・傾向】をセットで書く。
- 専門用語は日常の言葉に言い換える。例：スクエア→「ぶつかり合って成長する関係」、トライン→「自然に助け合う関係」、第10ハウス→「仕事や社会での立場を表す場所」。専門用語を出す場合は必ず括弧で言い換えを添える。
- 否定的な断定を避け、課題は「伸びしろ」として前向きに伝える。
- 見出しはMarkdownの「## 」で、指定された構成の順番どおりに出力する。各セクション3〜5文程度。
- データに含まれないもの（アセンダントなど）には触れない。`;

function buildPrompt(chart: ChartData): string {
  const lines = chart.planets.map((p) => {
    const s = signOf(p.longitude);
    return `- ${PLANETS[p.key].name}: ${s.name} ${degreeInSign(p.longitude)}${p.retrograde ? "（逆行）" : ""}${p.house && !chart.input.timeUnknown ? ` / 第${p.house}ハウス` : ""}`;
  });
  const aspects = chart.aspects.slice(0, 8).map(
    (a) => `- ${PLANETS[a.a].name} と ${PLANETS[a.b].name}: ${ASPECTS[a.key].name}（${ASPECTS[a.key].nickname}）誤差${a.orb}度`
  );
  const sections = [
    "## 1. あなたの基本性格と人生のテーマ（太陽星座）",
    "## 2. 素の自分と心の安心ポイント（月星座）",
    ...(chart.ascendant !== undefined ? ["## 3. 第一印象と無意識の行動パターン（アセンダント）"] : []),
    "## 恋愛の傾向と好きなこと（金星星座）",
    "## 行動力と仕事のスタイル（火星星座）",
    "## 特に強く出ている星のつながり",
  ].map((s, i) => s.replace(/^## (\d+\. )?/, `## ${i + 1}. `));

  let extra = "";
  if (chart.input.timeUnknown) {
    extra += "\n※出生時間が不明のため、正午の配置で計算しています。アセンダントとハウスは扱わないでください。";
    const mb = chart.moonBoundary;
    if (mb?.crosses) {
      extra += `\n※この日は1日の途中で月が${SIGNS[mb.signAtStart].name}から${SIGNS[mb.signAtEnd].name}へ移動しています。月星座のセクションでは両方の可能性をそれぞれ解説し、「生まれた時間がわかればどちらか判明する」ことを添えてください。`;
    }
  } else if (chart.ascendant !== undefined) {
    extra += `\nアセンダント: ${signOf(chart.ascendant).name} ${degreeInSign(chart.ascendant)}`;
  }

  return `# 天体データ
生年月日: ${chart.input.date} ${chart.input.time ?? "（時間不明）"} / 出生地: ${chart.input.placeName}
${lines.join("\n")}${extra}

# 主要アスペクト（誤差が小さい＝強い順）
${aspects.join("\n") || "- なし"}

# 出力する構成（この見出しをそのまま使う）
${sections.join("\n")}`;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY が設定されていません" }, { status: 500 });
  try {
    const chart = (await req.json()) as ChartData;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        system: SYSTEM,
        messages: [{ role: "user", content: buildPrompt(chart) }],
      }),
    });
    if (!res.ok) throw new Error(`Claude APIエラー: ${res.status} ${await res.text()}`);
    const data = await res.json();
    const text = (data.content ?? [])
      .filter((c: { type: string }) => c.type === "text")
      .map((c: { text: string }) => c.text)
      .join("");
    return NextResponse.json({ report: text });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
