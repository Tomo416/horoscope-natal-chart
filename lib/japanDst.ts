/**
 * 日本のサマータイム（夏時刻法 1948〜1951年）
 * 期間中は時計が1時間進んでいた（UTC+10）。出典: IANA tz database (Asia/Tokyo)
 * 各期間は現地の時計表示での [開始, 終了)。
 * 終了日の 0:00〜0:59 は2回あるため、先（夏時刻側）として扱う。
 */
const PERIODS: [string, string][] = [
  ["1948-05-02T00:00", "1948-09-12T01:00"],
  ["1949-04-03T00:00", "1949-09-11T01:00"],
  ["1950-05-07T00:00", "1950-09-10T01:00"],
  ["1951-05-06T00:00", "1951-09-09T01:00"],
];

/** 日付 YYYY-MM-DD と時刻 HH:mm（日本の時計表示）がサマータイム中か */
export function isJapanDst(date: string, h: number, m: number): boolean {
  const wall = `${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return PERIODS.some(([s, e]) => wall >= s && wall < e);
}
