import { SIGNS, signOf } from "@/data/signs";
import { PLANETS } from "@/data/planets";
import { READINGS } from "@/data/readings";
import {
  SIGN_THEMES, ELEMENT_TEXT, MODALITY_TEXT, HOUSE10, HOUSE2, HOUSE7, VENUS_PATTERN, RELATION_PATTERN,
} from "@/data/themeReadings";
import type { ChartData, PlanetKey, AspectKey } from "./types";

export interface ThemeBlock { label: string; text: string }
export interface ThemeSection {
  id: string;
  title: string;
  lead: string;          // ひとことで
  basis: string[];       // 根拠となる星の配置
  chips?: string[];      // 向いている仕事など
  blocks: ThemeBlock[];  // 本文
  advice: string[];      // アドバイス
}
export interface ThemeReport { timeKnown: boolean; notes: string[]; sections: ThemeSection[] }

const MODALITY = ["活動", "不動", "柔軟"] as const;
const WORK_ENV: Record<string, string> = {
  活動: "新しいことを任され、自分の判断で進められる環境",
  不動: "ひとつのことに腰を据えて、長く専門性を磨ける環境",
  柔軟: "変化があり、いろいろな人や仕事に関われる環境",
};
const REL_HINT: Record<string, string> = {
  火: "思ったことを率直に伝え合える人との縁を大切にすると、人間関係が楽になります。",
  地: "約束と信頼を大事にする人と、ゆっくり関係を育てると安定します。",
  風: "いろいろな人と気軽に関わりつつ、本音を話せる相手を何人か持つと心強いです。",
  水: "気持ちを分かち合える少数の人との深い関係が、心の支えになります。",
};
const LOVE_HINT: Record<string, string> = {
  火: "気持ちは言葉と行動で素直に伝えると、恋が大きく育ちます。",
  地: "時間をかけて信頼を積み重ねるほど、揺るがない愛になります。",
  風: "会話と、お互いの自由を大切にすると、長く続く関係になります。",
  水: "気持ちを我慢しすぎず、安心できる相手に甘えることで愛が深まります。",
};
const norm = (d: number) => ((d % 360) + 360) % 360;
const first = (s: string) => (s.match(/^.*?。/) ?? [s])[0];

/** 平均月交点（ドラゴンヘッド）の黄経 */
function meanNode(input: ChartData["input"]) {
  const [y, m, d] = input.date.split("-").map(Number);
  const [h, mi] = input.timeUnknown || !input.time ? [12, 0] : input.time.split(":").map(Number);
  const jd = Date.UTC(y, m - 1, d, h - input.tzone, mi) / 86400000 + 2440587.5;
  const T = (jd - 2451545) / 36525;
  return norm(125.04452 - 1934.136261 * T);
}

export function buildThemeReport(chart: ChartData): ThemeReport {
  const timeKnown = !chart.input.timeUnknown && chart.houses !== undefined;
  const lon = (k: PlanetKey) => chart.planets.find((p) => p.key === k)!.longitude;
  const sg = (k: PlanetKey) => signOf(lon(k));
  const house = (k: PlanetKey) => chart.planets.find((p) => p.key === k)!.house;
  const moonUnsure = !timeKnown && !!chart.moonBoundary?.crosses;
  const moonSigns = moonUnsure ? [SIGNS[chart.moonBoundary!.signAtStart], SIGNS[chart.moonBoundary!.signAtEnd]] : [sg("moon")];
  const at = (k: PlanetKey) => `${PLANETS[k].name}：${sg(k).name}`;

  const sun = sg("sun"), mars = sg("mars"), merc = sg("mercury"), venus = sg("venus"), jup = sg("jupiter"), sat = sg("saturn");
  const mc = timeKnown && chart.midheaven !== undefined ? signOf(chart.midheaven) : undefined;
  const asc = timeKnown && chart.ascendant !== undefined ? signOf(chart.ascendant) : undefined;
  const c2 = timeKnown ? signOf(chart.houses![1]) : undefined;
  const c7 = timeKnown ? signOf(chart.houses![6]) : undefined;
  const node = signOf(meanNode(chart.input));
  const inHouse = (n: number) => timeKnown ? chart.planets.filter((p) => p.house === n).map((p) => p.key) : [];

  // アスペクト（出生時間がないときは月を含むものは使わない）
  const asps = chart.aspects.filter((a) => timeKnown || (a.a !== "moon" && a.b !== "moon"));
  const findAsp = (x: PlanetKey, y: PlanetKey) => asps.find((a) => (a.a === x && a.b === y) || (a.a === y && a.b === x));
  const softKeys: AspectKey[] = ["sextile", "trine"];

  // エレメント・区分のバランス
  const weight: Partial<Record<PlanetKey, number>> = { sun: 2, moon: 2, mercury: 1.5, venus: 1.5, mars: 1.5, jupiter: 1, saturn: 1, uranus: 0.5, neptune: 0.5, pluto: 0.5 };
  const el: Record<string, number> = { 火: 0, 地: 0, 風: 0, 水: 0 }, mo: Record<string, number> = { 活動: 0, 不動: 0, 柔軟: 0 };
  for (const p of chart.planets) {
    if (p.key === "moon" && moonUnsure) continue;
    const s = signOf(p.longitude); const w = weight[p.key] ?? 1;
    el[s.element] += w; mo[MODALITY[s.index % 3]] += w;
  }
  if (asc) { el[asc.element] += 2; mo[MODALITY[asc.index % 3]] += 2; }
  const elSorted = Object.entries(el).sort((a, b) => b[1] - a[1]);
  const elMany = elSorted[0][0], elFew = elSorted[3][1] <= 1.5 ? elSorted[3][0] : undefined;
  const moMain = Object.entries(mo).sort((a, b) => b[1] - a[1])[0][0];

  const sections: ThemeSection[] = [];

  /* ---------- 仕事 ---------- */
  {
    const main = mc ?? sun;
    const jobs = [...new Set([...SIGN_THEMES[main.index].jobs.slice(0, 4), ...SIGN_THEMES[sun.index].jobs.slice(0, 3), ...SIGN_THEMES[mars.index].jobs.slice(0, 2)])].slice(0, 8);
    const blocks: ThemeBlock[] = [];
    if (mc) blocks.push({ label: `天職の方向（MC：${mc.name}）`, text: SIGN_THEMES[mc.index].career });
    blocks.push({ label: `あなたの持ち味（太陽：${sun.name}）`, text: SIGN_THEMES[sun.index].career });
    blocks.push({ label: `働き方のスタイル（火星：${mars.name}）`, text: READINGS[mars.index].mars });
    blocks.push({ label: `頭の使い方の才能（水星：${merc.name}）`, text: SIGN_THEMES[merc.index].talent });
    for (const k of inHouse(10)) blocks.push({ label: `仕事のハウスに${PLANETS[k].name}`, text: HOUSE10[k] });
    sections.push({
      id: "work", title: "仕事・適職と適性",
      lead: first(SIGN_THEMES[main.index].career),
      basis: [mc ? `MC：${mc.name}` : "", at("sun"), at("mars"), at("mercury"), ...inHouse(10).map((k) => `10ハウス：${PLANETS[k].name}`)].filter(Boolean),
      chips: jobs, blocks,
      advice: [`力を発揮しやすいのは「${WORK_ENV[moMain]}」です。`, `${mars.name}の火星を活かすなら：${first(READINGS[mars.index].mars)}`],
    });
  }

  /* ---------- お金 ---------- */
  {
    const blocks: ThemeBlock[] = [];
    if (c2) blocks.push({ label: `お金との向き合い方（2ハウス：${c2.name}）`, text: SIGN_THEMES[c2.index].money });
    blocks.push({ label: `お金の使い方・入り方（金星：${venus.name}）`, text: SIGN_THEMES[venus.index].money });
    blocks.push({ label: `豊かさを呼ぶ鍵（木星：${jup.name}）`, text: SIGN_THEMES[jup.index].luck });
    for (const k of inHouse(2)) blocks.push({ label: `お金のハウスに${PLANETS[k].name}`, text: HOUSE2[k] });
    const advice = [`豊かさの入り口：${first(SIGN_THEMES[jup.index].luck)}`];
    if (elFew === "地") advice.push("お金は「見える化」が味方です。収入と支出を書き出すだけで、豊かさが残りやすくなります。");
    const vs = findAsp("venus", "saturn"), vn = findAsp("venus", "neptune");
    if (vs && !softKeys.includes(vs.key)) advice.push("自分にお金を使うことに遠慮しがちです。自分を満たす小さなご褒美が、豊かさを呼び込みます。");
    if (vn && !softKeys.includes(vn.key)) advice.push("情に流されてお金を出しすぎないよう、貸し借りや投資は一度持ち帰って考えて。");
    sections.push({
      id: "money", title: "お金・豊かさ",
      lead: first(SIGN_THEMES[venus.index].money),
      basis: [c2 ? `2ハウス：${c2.name}` : "", at("venus"), at("jupiter"), ...inHouse(2).map((k) => `2ハウス：${PLANETS[k].name}`)].filter(Boolean),
      blocks, advice,
    });
  }

  /* ---------- 人間関係 ---------- */
  {
    const blocks: ThemeBlock[] = [];
    if (asc) blocks.push({ label: `人からの第一印象（ASC：${asc.name}）`, text: READINGS[asc.index].asc });
    if (moonUnsure) {
      blocks.push({ label: `心が安心できる関係（月：${moonSigns[0].name}か${moonSigns[1].name}）`, text: `生まれた時間によって月の星座が変わる日です。【${moonSigns[0].name}の場合】${SIGN_THEMES[moonSigns[0].index].bond}【${moonSigns[1].name}の場合】${SIGN_THEMES[moonSigns[1].index].bond}` });
    } else blocks.push({ label: `心が安心できる関係（月：${moonSigns[0].name}）`, text: SIGN_THEMES[moonSigns[0].index].bond });
    blocks.push({ label: `会話のスタイル（水星：${merc.name}）`, text: SIGN_THEMES[merc.index].comm });
    const advice: string[] = [];
    for (const [pair, txt] of Object.entries(RELATION_PATTERN)) {
      const [x, y] = pair.split("-") as PlanetKey[];
      const a = findAsp(x, y); if (!a) continue;
      const soft = softKeys.includes(a.key) || (a.key === "conjunction" && (y === "jupiter" || pair === "sun-moon"));
      blocks.push({ label: `${PLANETS[x].name}と${PLANETS[y].name}の角度`, text: soft ? txt.soft : txt.hard });
      if (!soft) advice.push(txt.hard.replace(/^.*?。/, "").trim() || txt.hard);
    }
    if (elFew === "風") advice.push(ELEMENT_TEXT["風"].advice);
    if (elFew === "水") advice.push(ELEMENT_TEXT["水"].advice);
    if (!advice.length) {
      const tip = SIGN_THEMES[merc.index].comm.replace(/^.*?。/, "").trim();
      if (tip) advice.push(tip);
      advice.push(REL_HINT[(moonUnsure ? sun : moonSigns[0]).element]);
    }
    sections.push({
      id: "relation", title: "人間関係",
      lead: first(SIGN_THEMES[(moonUnsure ? sun : moonSigns[0]).index].bond),
      basis: [asc ? `ASC：${asc.name}` : "", moonUnsure ? `月：${moonSigns[0].name}か${moonSigns[1].name}` : `月：${moonSigns[0].name}`, at("mercury")].filter(Boolean),
      blocks, advice: advice.slice(0, 3),
    });
  }

  /* ---------- 恋愛 ---------- */
  {
    const blocks: ThemeBlock[] = [];
    blocks.push({ label: `愛し方・好きになるもの（金星：${venus.name}）`, text: READINGS[venus.index].venus });
    blocks.push({ label: `恋の動き方・惹かれるタイプ（火星：${mars.name}）`, text: SIGN_THEMES[mars.index].attract });
    if (c7) blocks.push({ label: `縁のあるパートナー（7ハウス：${c7.name}）`, text: SIGN_THEMES[c7.index].partner });
    for (const k of inHouse(7)) blocks.push({ label: `パートナーのハウスに${PLANETS[k].name}`, text: HOUSE7[k] });
    const advice: string[] = [];
    for (const [k, txt] of Object.entries(VENUS_PATTERN)) {
      const a = findAsp("venus", k as PlanetKey); if (!a) continue;
      const soft = softKeys.includes(a.key) || (a.key === "conjunction" && (k === "jupiter" || k === "moon"));
      blocks.push({ label: `恋愛パターン（金星と${PLANETS[k as PlanetKey].name}）`, text: soft ? txt.soft : txt.hard });
      if (!soft) advice.push(txt.hard.replace(/^.*?。/, "").trim() || txt.hard);
    }
    if (!advice.length) advice.push(LOVE_HINT[venus.element]);
    sections.push({
      id: "love", title: "恋愛パターン",
      lead: first(READINGS[venus.index].venus),
      basis: [at("venus"), at("mars"), c7 ? `7ハウス：${c7.name}` : "", ...inHouse(7).map((k) => `7ハウス：${PLANETS[k].name}`)].filter(Boolean),
      blocks, advice: advice.slice(0, 3),
    });
  }

  /* ---------- 人生の傾向とアドバイス ---------- */
  {
    const blocks: ThemeBlock[] = [];
    blocks.push({ label: `人生のテーマ（太陽：${sun.name}）`, text: READINGS[sun.index].sun });
    blocks.push({ label: `人生の流れ（${elMany}の星座が多い）`, text: ELEMENT_TEXT[elMany].many });
    if (elFew) blocks.push({ label: `補うと良い力（${elFew}の星座が少ない）`, text: ELEMENT_TEXT[elFew].few });
    blocks.push({ label: `行動のパターン（${moMain}宮が多い）`, text: MODALITY_TEXT[moMain] });
    blocks.push({ label: `幸運の鍵（木星：${jup.name}）`, text: SIGN_THEMES[jup.index].luck });
    blocks.push({ label: `時間をかけて身につける力（土星：${sat.name}）`, text: SIGN_THEMES[sat.index].lesson });
    blocks.push({ label: `人生で向かっていく方向（ドラゴンヘッド：${node.name}）`, text: SIGN_THEMES[node.index].node });
    const advice = [
      ...(elFew ? [ELEMENT_TEXT[elFew].advice] : []),
      first(SIGN_THEMES[sat.index].lesson.replace(/^.*?。/, "")) || SIGN_THEMES[sat.index].lesson,
      first(SIGN_THEMES[node.index].node.replace(/^.*?。/, "")) || first(SIGN_THEMES[node.index].node),
    ].filter(Boolean);
    sections.push({
      id: "life", title: "人生の傾向とアドバイス",
      lead: first(READINGS[sun.index].sun),
      basis: [at("sun"), `多いエレメント：${elMany}`, elFew ? `少ないエレメント：${elFew}` : "", at("jupiter"), at("saturn"), `ドラゴンヘッド：${node.name}`].filter(Boolean),
      blocks, advice,
    });
  }

  const notes = timeKnown ? [] : [
    "出生時間がわからないため、ハウス・アセンダント・MCを使わず、天体の星座と角度だけで読んでいます（惑星読み）。",
    ...(moonUnsure ? ["生まれた日のうちに月の星座が変わるため、月は二つの候補を併記しています。"] : []),
  ];
  return { timeKnown, notes, sections };
}
