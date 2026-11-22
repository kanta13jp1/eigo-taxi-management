# eigo-taxi-management Workspace Rules

## 1. リリース・顧客確認・Git 境界（不変制約）
- **顧客受入と本番凍結**: `CUST-01`〜`CUST-06` は `NOT_RUN`、`thirdPartyPassed: 0`、`release: "HOLD"` を維持し、本番運用開始・顧客確認データ改変を行わない。公開テストサイト（`https://eigo-taxi-test.web.app/`）での検証は公開デモモード範囲として明示する。
- **ステージ除外対象**: `outputs/daily-20261121/stage` および既存の未追跡成果物（`heartbeat-live62.*`、`latest-confirm-dialog.png`、`ppt/`、`ppt62/` 等）を `git add` / コミット対象に含めない。
- **非変更対象スクリプト副作用の遮断**: `gas/Code.gs` を変更していない作業で `scripts/test_gas.cjs` を無配慮に実行しない（実行すると `docs/acceptance/service-checks/latest.json` とタイムスタンプ付きフォルダを自動生成するため、確認後は必ず整理する）。

## 2. フロントエンド技術標準（WAI-ARIA / WCAG / Tailwind v3）
- **Tailwind CSS v3.4.19 厳守**: 本リポジトリは Tailwind v3.4.19（`plugins: []`、`tailwindcss-animate` 未導入）である。`focus:outline-hidden`、`shadow-xs`、`backdrop-blur-xs`、`animate-in`、`fade-in`、`zoom-in-95`、`slide-in-from-*` 等の未出力クラスを使用しない。変更時は `dist/assets/index-*.css` への実ルール出力を確認する。
- **モーダル実装の一元化**: カスタムモーダル（`role="dialog"`）は必ず [src/hooks/useModalDialog.ts](src/hooks/useModalDialog.ts) を使用し、個別コンポーネントへ `Escape` リスナーや `document.body.style.overflow` 操作を重複実装しない。
- **WCAG 2.1 SC 1.3.1 見出し階層**: `Navbar` の単一 `<h1>` 配下で `<h1> -> <h2> -> <h3>` の階層順序を守り、レベル飛び級を作らない。
- **脆弱セレクター禁止**: Playwright テストでは `h3` などの見出しタグ名に依存せず、`getByRole('heading', { name })` 等アクセシブルロール＋名称を優先する。

## 3. ガバナンス・証跡ゲート順序
- [AI_SOURCE_REVIEW_POLICY.md](docs/traceability/AI_SOURCE_REVIEW_POLICY.md) と [DAILY_TEST_SITE_DELIVERY_POLICY_20261106.md](docs/acceptance/DAILY_TEST_SITE_DELIVERY_POLICY_20261106.md) を厳守する。
- **厳格ゲート前順序**: ① 公開検証環境デプロイ → ② SHA-256 配信照合 → ③ 実ブラウザ標準・機能監査とスクリーンショット全枚の `read_file` 目視確認 → ④ 実ファイル SHA-256 を含む独立 AI レビュー JSON（`docs/traceability/reports/review-<YYYYMMDD>/frontend-review.json`）作成、をすべて完了するまで `node scripts/traceability_cli.cjs baseline` を実行しない。
- 具体的な環境設定・コマンド・既知の出力先指定は、ワークスペーススキル `.agents/skills/eigo-taxi-delivery-verification/SKILL.md` を参照する。
