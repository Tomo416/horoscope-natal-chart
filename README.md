# はじめてのホロスコープ（解説付きインタラクティブ・ホロスコープ診断）

天体計算は外部の占星術APIに任せ、アプリ側は **SVG描画** と **Claude による初心者向け解説** を担当する Next.js アプリです。

## ディレクトリ構成
```
app/
  layout.tsx / page.tsx / globals.css
  api/chart/route.ts    … 占星術API呼び出し（時間不明→正午計算、月星座境界判定）
  api/report/route.ts   … Claude API で鑑定レポート生成
components/
  BirthForm.tsx         … 入力フォーム（時間不明チェック・47都道府県）
  HoroscopeChart.tsx    … SVGホロスコープ＋ツールチップ（ホバー／タップ）
  ChartSummary.tsx      … 天体一覧・時間不明時の注意・月星座の両候補
  Report.tsx            … レポート表示
lib/
  types.ts / astroApi.ts（APIアダプタ）/ aspects.ts（アスペクト判定）
data/
  planets.ts / signs.ts / aspects.ts / prefectures.ts … 初心者向けマスターデータ
index.html              … 以前のスタンドアロン版プロトタイプ（未変更）
```

## セットアップ
```bash
cp .env.example .env.local   # キーを設定
npm install
npm run dev
```
| 変数 | 説明 |
|---|---|
| `ASTRO_API_BASE_URL` | 既定 `https://json.astrologyapi.com/v1`（`POST /western_horoscope` 互換） |
| `ASTRO_API_USER_ID` / `ASTRO_API_KEY` | Basic認証。USER_ID未設定時は `Bearer ASTRO_API_KEY` |
| `ANTHROPIC_API_KEY` | Claude API キー |
| `ANTHROPIC_MODEL` | 既定 `claude-sonnet-5-5` |

別の占星術APIを使う場合は `lib/astroApi.ts` の `callWesternHoroscope` / `normalizePlanets` を差し替えてください。

## 時間不明時の挙動
- 12:00 でAPIへリクエストし、アセンダント・ハウスを描画／解説から除外
- 同日の 0:00 と 23:59 も取得し、月星座が変わる日は両方の候補を補足表示＆レポートでも両方解説
