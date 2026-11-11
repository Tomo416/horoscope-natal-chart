# はじめてのホロスコープ（解説付きインタラクティブ・ホロスコープ診断）

天体計算は無料のオープンソースライブラリ astronomy-engine（MITライセンス・商用利用可）でブラウザ内計算し、アプリ側は **SVG描画** と **解説辞書による初心者向けレポート** を担当する Next.js アプリです。外部の有料API・AIは一切使わないため、料金はかかりません。

## ディレクトリ構成
```
app/
  layout.tsx / page.tsx / globals.css
components/
  BirthForm.tsx         … 入力フォーム（時間不明チェック・47都道府県）
  HoroscopeChart.tsx    … SVGホロスコープ＋ツールチップ（ホバー／タップ）
  ChartSummary.tsx      … 天体一覧・時間不明時の注意・月星座の両候補
  Report.tsx            … レポート表示
lib/
  types.ts / astroCalc.ts（天体・ハウス計算／時間不明→正午計算、月星座境界判定）/ report.ts（辞書から鑑定レポート生成）/ aspects.ts（アスペクト判定）
data/
  planets.ts / signs.ts / aspects.ts / prefectures.ts / readings.ts … 初心者向けマスターデータ
index.html              … 以前のスタンドアロン版プロトタイプ（未変更）
  .github/workflows/deploy.yml … GitHub Pages への自動デプロイ
```

## セットアップ
```bash
npm install
npm run dev
```
APIキーや環境変数の設定は不要です。

## 時間不明時の挙動
- 12:00 で計算し、アセンダント・ハウスを描画／解説から除外
- 同日の 0:00 と 23:59 の月も計算し、月星座が変わる日は両方の候補を補足表示＆レポートでも両方解説

## GitHub Pages へのデプロイ
サーバー不要の静的サイト（`output: "export"`）として書き出し、GitHub Actions で自動公開します。

1. リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にする（初回のみ）
2. `main` に push すると `.github/workflows/deploy.yml` が実行され、
   `https://<ユーザー名>.github.io/horoscope-natal-chart/` に公開されます
