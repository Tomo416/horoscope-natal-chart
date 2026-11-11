import { NextResponse } from "next/server";
import { calculateChart } from "@/lib/astroApi";
import { TOKYO } from "@/data/prefectures";
import type { BirthInput } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<BirthInput>;
    if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return NextResponse.json({ error: "生年月日を正しく入力してください" }, { status: 400 });
    }
    const timeUnknown = !!body.timeUnknown || !body.time;
    if (!timeUnknown && !/^\d{2}:\d{2}$/.test(body.time!)) {
      return NextResponse.json({ error: "出生時間の形式が正しくありません" }, { status: 400 });
    }
    const input: BirthInput = {
      date: body.date,
      time: timeUnknown ? null : body.time!,
      timeUnknown,
      lat: Number.isFinite(body.lat) ? body.lat! : TOKYO.lat,
      lon: Number.isFinite(body.lon) ? body.lon! : TOKYO.lon,
      tzone: Number.isFinite(body.tzone) ? body.tzone! : 9,
      placeName: body.placeName || `${TOKYO.name}（デフォルト）`,
    };
    const chart = await calculateChart(input);
    return NextResponse.json(chart);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
