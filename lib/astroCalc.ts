import * as A from "astronomy-engine";
import { findAspects } from "./aspects";
import type { BirthInput, ChartData, PlanetKey, PlanetPosition } from "./types";

/**
 * 天体計算（無料・オープンソースの astronomy-engine を使用。ブラウザ内で計算し、外部通信なし）
 * 天文学の計算式で黄経を求めるため、AIによる推測は一切入らない。
 * ハウスはプラシーダス方式。
 */

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const norm = (d: number) => ((d % 360) + 360) % 360;

const BODIES: Record<Exclude<PlanetKey, "sun" | "moon">, A.Body> = {
  mercury: A.Body.Mercury, venus: A.Body.Venus, mars: A.Body.Mars, jupiter: A.Body.Jupiter,
  saturn: A.Body.Saturn, uranus: A.Body.Uranus, neptune: A.Body.Neptune, pluto: A.Body.Pluto,
};

/** その日時の真黄道座標（日付の分点）での地心黄経 */
function longitudes(date: Date): Record<PlanetKey, number> {
  const t = A.MakeTime(date);
  const rot = A.Rotation_EQJ_ECT(t);
  const lonOf = (body: A.Body) => {
    const v = A.RotateVector(rot, A.GeoVector(body, t, true));
    return norm(deg(Math.atan2(v.y, v.x)));
  };
  const out = { sun: A.SunPosition(t).elon, moon: A.EclipticGeoMoon(t).lon } as Record<PlanetKey, number>;
  for (const [k, b] of Object.entries(BODIES)) out[k as PlanetKey] = lonOf(b);
  return out;
}

function planetsAt(date: Date): PlanetPosition[] {
  const now = longitudes(date);
  const later = longitudes(new Date(date.getTime() + 3600_000));
  return (Object.keys(now) as PlanetKey[]).map((key) => {
    let d = later[key] - now[key];
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return { key, longitude: now[key], retrograde: d < 0 };
  });
}

function obliquity(date: Date): number {
  const T = (date.getTime() / 86400000 + 2440587.5 - 2451545.0) / 36525;
  return (84381.406 - 46.836769 * T - 0.0001831 * T * T + 0.0020034 * T ** 3) / 3600;
}

const raToLon = (ra: number, eps: number) =>
  norm(deg(Math.atan2(Math.sin(rad(ra)), Math.cos(rad(ra)) * Math.cos(rad(eps)))));

function placidusRA(ramc: number, lat: number, eps: number, offset: number, F: number, upper: boolean) {
  let ra = ramc + offset;
  for (let i = 0; i < 50; i++) {
    const k = Math.sin(rad(ra)) * Math.tan(rad(lat)) * Math.tan(rad(eps));
    const ac = deg(Math.acos(Math.max(-1, Math.min(1, upper ? -k : k))));
    const next = upper ? ramc + ac / F : ramc + 180 - ac / F;
    if (Math.abs(next - ra) < 1e-9) return next;
    ra = next;
  }
  return ra;
}

function housesAt(date: Date, lat: number, lon: number) {
  const eps = obliquity(date);
  const ramc = norm((A.SiderealTime(date) + lon / 15) * 15);
  const asc = norm(deg(Math.atan2(
    Math.cos(rad(ramc)),
    -(Math.sin(rad(ramc)) * Math.cos(rad(eps)) + Math.tan(rad(lat)) * Math.sin(rad(eps)))
  )));
  const mc = raToLon(ramc, eps);
  const h11 = raToLon(placidusRA(ramc, lat, eps, 30, 3, true), eps);
  const h12 = raToLon(placidusRA(ramc, lat, eps, 60, 1.5, true), eps);
  const h2 = raToLon(placidusRA(ramc, lat, eps, 120, 1.5, false), eps);
  const h3 = raToLon(placidusRA(ramc, lat, eps, 150, 3, false), eps);
  const cusps = [asc, h2, h3, norm(mc + 180), norm(h11 + 180), norm(h12 + 180),
    norm(asc + 180), norm(h2 + 180), norm(h3 + 180), mc, h11, h12];
  return { asc, mc, cusps };
}

function houseOf(lon: number, cusps: number[]) {
  for (let i = 0; i < 12; i++) {
    if (norm(lon - cusps[i]) < norm(cusps[(i + 1) % 12] - cusps[i])) return i + 1;
  }
  return 12;
}

/** 現地時刻（tzone時間）→ UTC Date */
function toUTC(dateStr: string, h: number, m: number, tzone: number) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h, m) - tzone * 3600_000);
}

const signIdx = (lon: number) => Math.floor(norm(lon) / 30);

export function calculateChart(input: BirthInput): ChartData {
  // 時間不明時は正午で計算
  const [h, m] = input.timeUnknown || !input.time ? [12, 0] : input.time.split(":").map(Number);
  const date = toUTC(input.date, h, m, input.tzone);
  const planets = planetsAt(date);
  const chart: ChartData = { input, planets, aspects: findAspects(planets) };

  if (!input.timeUnknown) {
    const { asc, mc, cusps } = housesAt(date, input.lat, input.lon);
    chart.ascendant = asc;
    chart.midheaven = mc;
    chart.houses = cusps;
    for (const p of planets) p.house = houseOf(p.longitude, cusps);
  } else {
    // その日の 0:00 と 23:59 で月星座が変わるか判定
    const s = signIdx(A.EclipticGeoMoon(A.MakeTime(toUTC(input.date, 0, 0, input.tzone))).lon);
    const e = signIdx(A.EclipticGeoMoon(A.MakeTime(toUTC(input.date, 23, 59, input.tzone))).lon);
    chart.moonBoundary = { crosses: s !== e, signAtStart: s, signAtEnd: e };
  }
  return chart;
}
