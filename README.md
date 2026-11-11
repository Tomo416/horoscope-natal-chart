# はじめてのホロスコープ（解説付きインタラクティブ・ホロスコープ診断）

天体計算は無料のオープンソースライブラリ astronomy-engine（MITライセンス・外部通信なし）に任せ、アプリ側は **SVG描画** と **Claude による初心者向け解説** を担当する Next.js アプリです。

## ディレクトリ構成
```
app/
  layout.tsx / page.tsx / globals.css
  api/chart/route.ts    … 天体計算（時間不明→正午計算、月星座境界判定）
  api/report/route.ts   … Claude API で鑑定レポート生成
components/
  BirthForm.tsx         … 入力フォーム（時間不明チェック・47都道府県）
  HoroscopeChart.tsx    … SVGホロスコープ＋ツールチップ（ホバー／タップ）
  ChartSummary.tsx      … 天体一覧・時間不明時の注意・月星座の両候補
  Report.tsx            … レポート表示
lib/
  types.ts / astroCalc.ts（天体・ハウス計算）/ aspects.ts（アスペクト判定）
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
| `ANTHROPIC_API_KEY` | Claude API キー |
| `ANTHROPIC_MODEL` | 既定 `claude-sonnet-5-5` |
| `APP_USER` / `APP_PASSWORD` | **必須**。サイト全体のBasic認証。未設定だと本番は503で停止 |
| `RATE_LIMIT_PER_HOUR` | IPごとのAPI呼び出し上限（既定20） |

有料の占星術APIは使用していません。課金が発生しうるのは Claude API のみです。

## 時間不明時の挙動
- 12:00 で計算し、アセンダント・ハウスを描画／解説から除外
- 同日の 0:00 と 23:59 の月も計算し、月星座が変わる日は両方の候補を補足表示＆レポートでも両方解説

## 不正利用対策
- サイト全体をパスワード保護（`middleware.ts`）。パスワードを知らない人は外部APIを呼べません
- `APP_PASSWORD` 未設定の本番環境は自動で公開停止（設定漏れで無防備にならない）
- IPごとの回数制限（補助）
- 念のため Anthropic コンソールの Spend limit を設定してください
