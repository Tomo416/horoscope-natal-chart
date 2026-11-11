import type { AspectKey } from "@/lib/types";

export interface AspectInfo {
  key: AspectKey;
  angle: number;
  orb: number; // 許容度数
  name: string;
  nickname: string; // 日常語への言い換え
  color: string;
  dash?: string;
  meaning: string; // ツールチップ用の1行解説
  detail: string;
}

/** 主要アスペクトの初心者向け解説辞書 */
export const ASPECTS: Record<AspectKey, AspectInfo> = {
  conjunction: {
    key: "conjunction", angle: 0, orb: 8, name: "コンジャンクション（0度）",
    nickname: "合体・一心同体", color: "#f59e0b",
    meaning: "2つの星の力がひとつに溶け合い、その性質がとても強く出ます。",
    detail: "2つの天体がほぼ同じ場所に重なっている状態です。お互いの性質が混ざり合い、良くも悪くもその組み合わせがあなたの大きな特徴になります。",
  },
  sextile: {
    key: "sextile", angle: 60, orb: 5, name: "セクスタイル（60度）",
    nickname: "仲良しの協力関係", color: "#22c55e", dash: "6 4",
    meaning: "2つの星が軽やかに助け合い、チャンスや才能を活かしやすくします。",
    detail: "2つの天体が友達のように協力し合う関係です。少し意識して使うと、才能が花開きやすい「ちょうどいい追い風」になります。",
  },
  square: {
    key: "square", angle: 90, orb: 7, name: "スクエア（90度）",
    nickname: "ぶつかり合って成長する関係", color: "#ef4444",
    meaning: "2つの星が衝突して葛藤を生みますが、乗り越えると大きな原動力になります。",
    detail: "2つの天体がぶつかり合う関係で、心の中に「こうしたいけど、ああもしたい」という葛藤を生みます。ただしその摩擦が、努力や成長の強いエネルギー源になります。",
  },
  trine: {
    key: "trine", angle: 120, orb: 7, name: "トライン（120度）",
    nickname: "生まれつきの才能・スムーズな流れ", color: "#3b82f6",
    meaning: "2つの星が自然に調和し、無理なく発揮できる才能や幸運を表します。",
    detail: "2つの天体がとても相性よく流れ合う関係です。努力しなくても自然にできてしまう「得意なこと」として表れやすく、本人は才能に気づきにくいこともあります。",
  },
  opposition: {
    key: "opposition", angle: 180, orb: 8, name: "オポジション（180度）",
    nickname: "向かい合う綱引き", color: "#a855f7",
    meaning: "2つの星が正反対から引っ張り合い、バランスを取ることがテーマになります。",
    detail: "2つの天体が正反対の位置で向かい合う関係です。両極端の間で揺れやすい一方、人との関わりを通してバランス感覚を身につけると、視野の広さという強みになります。",
  },
};

export const ASPECT_ORDER: AspectKey[] = ["conjunction", "sextile", "square", "trine", "opposition"];
