import type { PlanetKey } from "@/lib/types";

export interface PlanetInfo {
  key: PlanetKey;
  symbol: string;
  name: string;
  catchCopy: string;
  role: string; // ツールチップ用の1行解説
  detail: string;
  color: string;
}

/** 10天体の初心者向け解説辞書 */
export const PLANETS: Record<PlanetKey, PlanetInfo> = {
  sun: {
    key: "sun", symbol: "☉", name: "太陽", color: "#f59e0b",
    catchCopy: "あなたの「主人公らしさ」",
    role: "人生の目的や、自分らしく輝ける方向を表します。",
    detail: "太陽は、あなたが人生でめざす方向や、自信をもって表現できる「本来の自分」を表します。いわゆる「〇〇座生まれ」の星座はこの太陽の位置で決まります。年齢を重ねるほど、太陽の性質がはっきり表れてくると言われます。",
  },
  moon: {
    key: "moon", symbol: "☽", name: "月", color: "#94a3b8",
    catchCopy: "素顔のあなたと心の居場所",
    role: "感情の動きや、リラックスしたときの素の自分を表します。",
    detail: "月は、気持ちの反応やくつろいでいるときの素顔、安心できる環境を表します。家族や親しい人の前で出る「本音のあなた」です。月は約2日半で星座を移るため、生まれた時間によって星座が変わることがあります。",
  },
  mercury: {
    key: "mercury", symbol: "☿", name: "水星", color: "#10b981",
    catchCopy: "考え方と話し方のクセ",
    role: "考え方、話し方、学び方、情報の扱い方を表します。",
    detail: "水星は、頭の使い方やコミュニケーションのスタイルを表します。物事をどう理解し、どう言葉にするか、どんな勉強法が合っているかのヒントになります。",
  },
  venus: {
    key: "venus", symbol: "♀", name: "金星", color: "#ec4899",
    catchCopy: "好きなものと恋のかたち",
    role: "恋愛の傾向、美意識、楽しみ方を表します。",
    detail: "金星は、あなたが「好き」「心地よい」と感じるもの、恋愛での振る舞い、おしゃれや芸術のセンスを表します。人生を楽しむためのキーワードがわかる星です。",
  },
  mars: {
    key: "mars", symbol: "♂", name: "火星", color: "#ef4444",
    catchCopy: "やる気のスイッチと行動力",
    role: "行動力、情熱、闘争心の出し方を表します。",
    detail: "火星は、何かに取り組むときのエネルギーの出し方や、怒りや競争心の表れ方を表します。仕事の進め方や、困難にぶつかったときの立ち向かい方のヒントになります。",
  },
  jupiter: {
    key: "jupiter", symbol: "♃", name: "木星", color: "#8b5cf6",
    catchCopy: "幸運と成長のありか",
    role: "幸運、発展、のびのび成長できる分野を表します。",
    detail: "木星は「幸運の星」とも呼ばれ、あなたが自然に伸びていける分野や、おおらかさ・寛大さの表れ方を表します。約12年で星座を一周するため、同じ学年の人と共通しやすい星です。",
  },
  saturn: {
    key: "saturn", symbol: "♄", name: "土星", color: "#78716c",
    catchCopy: "試練の先にある実力",
    role: "責任感、努力、時間をかけて身につける力を表します。",
    detail: "土星は、苦手意識やプレッシャーを感じやすいテーマを表しますが、それは時間をかけて努力すると大きな実力に変わる分野でもあります。「人生の先生」のような星です。",
  },
  uranus: {
    key: "uranus", symbol: "♅", name: "天王星", color: "#06b6d4",
    catchCopy: "常識をくつがえす個性",
    role: "独創性、変化、自由を求める気持ちを表します。",
    detail: "天王星は、ひらめきや改革、型にはまらない個性を表します。約7年ごとに星座を移るため、世代全体の価値観の特徴として表れやすい星です。",
  },
  neptune: {
    key: "neptune", symbol: "♆", name: "海王星", color: "#3b82f6",
    catchCopy: "夢と想像力の世界",
    role: "想像力、直感、夢やあこがれを表します。",
    detail: "海王星は、目に見えないものを感じ取る力、芸術性、やさしさや共感力を表します。約14年ごとに星座を移るため、世代の「夢のかたち」を表す星でもあります。",
  },
  pluto: {
    key: "pluto", symbol: "♇", name: "冥王星", color: "#7f1d1d",
    catchCopy: "生まれ変わるほどの底力",
    role: "極限の集中力、再生、深い変容の力を表します。",
    detail: "冥王星は、物事を根本から変える力や、一度決めたら徹底する深いエネルギーを表します。非常にゆっくり動くため、世代全体のテーマとして表れます。",
  },
};

export const PLANET_ORDER: PlanetKey[] = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
];
