import "server-only";
import { findAspects } from "./aspects";
import type { BirthInput, ChartData, PlanetKey, PlanetPosition } from "./types";

/**
 * 外部占星術計算APIクライアント
 * AstrologyAPI.com 互換の `POST /western_horoscope` を想定（Basic認証: USER_ID:API_KEY）。
 * 別のAPIを使う場合は `callWesternHoroscope` と `normalize` を差し替えてください。
 */

const BASE_URL = process.env.ASTRO_API_BASE_URL ?? "https://json.astrologyapi.com/v1";

const NAME_MAP: Record<string, PlanetKey> = {
  sun: "sun", moon: "moon", mercury: "mercury", venus: "venus", mars: "mars",
  jupiter: "jupiter", saturn: "saturn", uranus: "uranus", neptune: "neptune", pluto: "pluto",
};

interface RawPlanet { name: string; full_degree: number | string; is_retro?: string | boolean; house?: number }
interface RawHouse { house: number; degree: number | string }
interface RawResponse {
  planets?: RawPlanet[];
  houses?: RawHouse[];
  ascendant?: number | string;
  midheaven?: number | string;
}

async function callWesternHoroscope(input: BirthInput, hour: number, min: number): Promise<RawResponse> {
  const key = process.env.ASTRO_API_KEY;
  const userId = process.env.ASTRO_API_USER_ID;
  if (!key) throw new Error("ASTRO_API_KEY が設定されていません（.env.local を確認してください）");

  const [year, month, day] = input.date.split("-").map(Number);
  const headers: Record<string, string> = { "Content-Type": "application/json", "Accept-Language": "en" };
  headers.Authorization = userId
    ? "Basic " + Buffer.from(`${userId}:${key}`).toString("base64")
    : `Bearer ${key}`;

  const res = await fetch(`${BASE_URL}/western_horoscope`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      day, month, year, hour, min,
      lat: input.lat, lon: input.lon, tzone: input.tzone,
      house_type: "placidus",
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`占星術APIエラー: ${res.status} ${await res.text()}`);
  return res.json();
}

function normalizePlanets(raw: RawResponse): PlanetPosition[] {
  const list: PlanetPosition[] = [];
  for (const p of raw.planets ?? []) {
    const k = NAME_MAP[p.name.toLowerCase()];
    if (!k) continue;
    list.push({
      key: k,
      longitude: Number(p.full_degree),
      retrograde: p.is_retro === true || p.is_retro === "true",
      house: p.house,
    });
  }
  if (list.length < 10) throw new Error("占星術APIのレスポンスに10天体が揃っていません");
  return list;
}

const signIdx = (lon: number) => Math.floor((((lon % 360) + 360) % 360) / 30);

export async function calculateChart(input: BirthInput): Promise<ChartData> {
  // 時間不明時は正午でリクエスト
  const [h, m] = input.timeUnknown || !input.time ? [12, 0] : input.time.split(":").map(Number);
  const main = await callWesternHoroscope(input, h, m);
  const planets = normalizePlanets(main);

  const chart: ChartData = { input, planets, aspects: findAspects(planets) };

  if (!input.timeUnknown) {
    chart.ascendant = Number(main.ascendant);
    chart.midheaven = Number(main.midheaven);
    chart.houses = (main.houses ?? [])
      .sort((a, b) => a.house - b.house)
      .map((x) => Number(x.degree));
  } else {
    // 0:00 と 23:59 の月の位置を取得し、月星座が変わる境界日か判定
    const [start, end] = await Promise.all([
      callWesternHoroscope(input, 0, 0),
      callWesternHoroscope(input, 23, 59),
    ]);
    const moonOf = (r: RawResponse) => normalizePlanets(r).find((p) => p.key === "moon")!.longitude;
    const s = signIdx(moonOf(start));
    const e = signIdx(moonOf(end));
    chart.moonBoundary = { crosses: s !== e, signAtStart: s, signAtEnd: e };
  }
  return chart;
}
