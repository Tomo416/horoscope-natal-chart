export type Element = "火" | "地" | "風" | "水";

export interface SignInfo {
  index: number; // 0=牡羊座 … 11=魚座
  symbol: string;
  name: string;
  en: string;
  element: Element;
  catchCopy: string;
  nature: string; // ツールチップ用の基本性質
}

export const ELEMENT_COLORS: Record<Element, string> = {
  火: "#fecaca",
  地: "#d9f99d",
  風: "#fef08a",
  水: "#bfdbfe",
};

/** 12星座の初心者向け解説辞書 */
export const SIGNS: SignInfo[] = [
  { index: 0, symbol: "♈", name: "牡羊座", en: "Aries", element: "火",
    catchCopy: "まっさきに飛び出すパイオニア",
    nature: "思い立ったらすぐ行動。正直で情熱的、新しいことを始めるのが得意です。" },
  { index: 1, symbol: "♉", name: "牡牛座", en: "Taurus", element: "地",
    catchCopy: "五感で味わうマイペースな安定派",
    nature: "落ち着いていて忍耐強く、美味しいもの・美しいもの・心地よさを大切にします。" },
  { index: 2, symbol: "♊", name: "双子座", en: "Gemini", element: "風",
    catchCopy: "好奇心いっぱいの情報通",
    nature: "頭の回転が速く話し上手。いろいろなことに興味を持ち、軽やかに動きます。" },
  { index: 3, symbol: "♋", name: "蟹座", en: "Cancer", element: "水",
    catchCopy: "身内を守るあたたかな心",
    nature: "感受性が豊かで面倒見がよく、家族や仲間を大切に守ろうとします。" },
  { index: 4, symbol: "♌", name: "獅子座", en: "Leo", element: "火",
    catchCopy: "舞台の真ん中で輝く主役",
    nature: "明るく堂々として、自分を表現するのが好き。周りを元気にする華があります。" },
  { index: 5, symbol: "♍", name: "乙女座", en: "Virgo", element: "地",
    catchCopy: "細やかに整える実務の達人",
    nature: "観察力が鋭く几帳面。人の役に立つことや、物事をきちんと整えることが得意です。" },
  { index: 6, symbol: "♎", name: "天秤座", en: "Libra", element: "風",
    catchCopy: "バランスと調和の美意識",
    nature: "人当たりがよく公平。センスがよく、人と人との関係を心地よく整えます。" },
  { index: 7, symbol: "♏", name: "蠍座", en: "Scorpio", element: "水",
    catchCopy: "深く一途に向き合う探究者",
    nature: "集中力と洞察力が強く、好きなものや人にはとことん深く関わります。" },
  { index: 8, symbol: "♐", name: "射手座", en: "Sagittarius", element: "火",
    catchCopy: "自由に遠くをめざす冒険家",
    nature: "楽天的で好奇心旺盛。旅や学びを通して、広い世界を知ることを好みます。" },
  { index: 9, symbol: "♑", name: "山羊座", en: "Capricorn", element: "地",
    catchCopy: "コツコツ頂上をめざす努力家",
    nature: "責任感が強く現実的。目標に向かって計画的に積み上げていく力があります。" },
  { index: 10, symbol: "♒", name: "水瓶座", en: "Aquarius", element: "風",
    catchCopy: "未来を見つめる自由な個性派",
    nature: "独創的でフラット。常識にとらわれず、仲間や社会全体のことを考えます。" },
  { index: 11, symbol: "♓", name: "魚座", en: "Pisces", element: "水",
    catchCopy: "やさしさで包む夢見る共感者",
    nature: "想像力と思いやりにあふれ、人の気持ちに寄り添うのが自然にできます。" },
];

export const signOf = (longitude: number): SignInfo =>
  SIGNS[Math.floor((((longitude % 360) + 360) % 360) / 30)];

export const degreeInSign = (longitude: number): string => {
  const d = (((longitude % 360) + 360) % 360) % 30;
  const deg = Math.floor(d);
  const min = Math.floor((d - deg) * 60);
  return `${deg}°${String(min).padStart(2, "0")}′`;
};
