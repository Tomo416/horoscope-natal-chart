import { ASPECTS, ASPECT_ORDER } from "@/data/aspects";
import type { Aspect, PlanetPosition } from "./types";

/**
 * APIが返した天体の黄経からアスペクトを判定する（単純な幾何計算のみ）。
 * 天体位置そのものの計算は外部APIに任せている。
 */
export function findAspects(planets: PlanetPosition[]): Aspect[] {
  const result: Aspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      let diff = Math.abs(planets[i].longitude - planets[j].longitude) % 360;
      if (diff > 180) diff = 360 - diff;
      for (const key of ASPECT_ORDER) {
        const info = ASPECTS[key];
        const orb = Math.abs(diff - info.angle);
        if (orb <= info.orb) {
          result.push({ key, a: planets[i].key, b: planets[j].key, orb: Math.round(orb * 100) / 100 });
          break;
        }
      }
    }
  }
  return result.sort((x, y) => x.orb - y.orb);
}
