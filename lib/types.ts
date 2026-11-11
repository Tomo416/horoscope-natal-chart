export type PlanetKey =
  | "sun" | "moon" | "mercury" | "venus" | "mars"
  | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto";

export type AspectKey = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export interface BirthInput {
  date: string; // YYYY-MM-DD
  time: string | null; // HH:mm（不明なら null）
  timeUnknown: boolean;
  lat: number;
  lon: number;
  tzone: number; // 例: 9（日本標準時）
  placeName: string;
  name?: string; // 印刷用のお名前（任意）
}

export interface PlanetPosition {
  key: PlanetKey;
  longitude: number; // 黄経 0-360
  retrograde: boolean;
  house?: number;
}

export interface Aspect {
  key: AspectKey;
  a: PlanetKey;
  b: PlanetKey;
  orb: number;
}

export interface MoonBoundary {
  /** その日の 0:00 と 23:59 で月星座が異なるか */
  crosses: boolean;
  signAtStart: number;
  signAtEnd: number;
}

export interface ChartData {
  input: BirthInput;
  planets: PlanetPosition[];
  /** 時間不明時は undefined（アセンダント・ハウスは除外） */
  ascendant?: number;
  midheaven?: number;
  houses?: number[]; // 12ハウスのカスプ黄経
  aspects: Aspect[];
  moonBoundary?: MoonBoundary;
  /** 日本のサマータイム（1948〜1951年）で1時間補正したか */
  dstApplied?: boolean;
}
