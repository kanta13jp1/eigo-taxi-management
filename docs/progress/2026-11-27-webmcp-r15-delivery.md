# 2026年11月27日　Antigravity MCP / MCP Apps / W3C WebMCP 統合のテストサイト反映・公開検証報告

> **位置づけ**: `origin/main`（Round 14 / PR #9 および PR #10、コミット `98e4a27`）を保持したまま、未配備だった **Antigravity MCP サーバー（`mcp/`）・MCP App UI（`ui://eigo-taxi/dashboard.html`）・プラグイン（`.agents/plugins/eigo-taxi-mcp/`）・W3C WebMCP ブリッジ（[WebMcpBridge.tsx](../../src/components/WebMcpBridge.tsx) / [App.tsx](../../src/App.tsx)）** を検証サイト `https://eigo-taxi-test.web.app/` へ統合配備し、公開 SHA-256 照合・公開実ブラウザ監査・全スクリーンショット目視確認・独立 AI レビューおよび厳格トレーサビリティベースライン更新を完了した記録です。

## 1. 実装・統合内容（Round 14 非退行＋WebMCP）

- **[src/App.tsx](../../src/App.tsx)**: Round 14 のフッター `text-slate-600` および `{ useState, useEffect, useCallback }` フック制約を保持したまま、`WebMcpBridge`、失敗伝播用 `rethrow`、および `history.replaceState` によるデモ遷移（ブリッジアンマウント防止）を統合。
- **[src/components/WebMcpBridge.tsx](../../src/components/WebMcpBridge.tsx)**: `document.modelContext ?? navigator.modelContext` へセッション権限同期ツールを登録（未認証時は `eigo_taxi_get_status` / `eigo_taxi_enter_demo` のみで PII 非露出、管理者 10 種・閲覧限定管理者 8 種・保護者 6 種、アンマウント／ログアウト時 `AbortController` 解除）。
- **`mcp/`・`.agents/plugins/eigo-taxi-mcp/`**: Stdio / Streamable HTTP（非ループバック無認証拒否、最小 `/health`、`timingSafeEqual` Bearer 検証）・14 ツール / 4 リソース / 2 プロンプト・CSP 準拠単一 HTML ダッシュボードを配備し、グローバルプラグイン（`~/.gemini/config/plugins/eigo-taxi-mcp/`）と SHA-256 一致・`agy plugin validate --strict` 合格を確認。

## 2. ビルド・試験・公開 SHA-256 照合・実画面監査

1. **静的検査・オフライン契約・`mcp/`・Playwright ローカル回帰 4 スイート**:
   - `npx tsc --noEmit` PASS、`npx oxlint src/` 0 warnings / 0 errors、死んだ Tailwind v4 クラス 0 件、生成 CSS（`dist/assets/index-C1hp1v-I.css`）実出力確認。
   - `mcp/`：`npm run typecheck`・`npm test` **8/8 PASS**。
   - `npm run test:traceability` **34/34 PASS**、オフライン契約 9 本（[test_webmcp_bridge.cjs](../../scripts/test_webmcp_bridge.cjs) 含む）全 PASS。
   - Playwright 回帰 4 スイート：`test_trace_ui.mjs` 6/6、`test_booking_modal_scroll.mjs` 2/2、`tests/reviewer-ui/run.mjs` 8/8、`scripts/run_local_acceptance.mjs` 14/14 全 PASS。
2. **検証サイト配備＆公開 6 応答 SHA-256 照合（DAILY-C03・C04）**:
   - Hosting Version: `882b71593ffa7310`（`eigo-taxi-app` / `eigo-taxi-test`）
   - `builtAt`: `2026-11-26T20:13:21.650Z` / `baseCommit`: `98e4a27f3709d80b7ebb2eeb03361e229a31700d` / `sourceDigest`: `99284e780dec40fbaa902a59d8f12cfab31af69a1bd781e09a9bf3de06403208`
   - [public-2026-11-26T20-15-12-443Z.json](../acceptance/deployment-verification/public-2026-11-26T20-15-12-443Z.json): **6/6 URL HTTP 200・SHA-256 完全一致（`"pass": true`）**。
3. **公開デモ実ブラウザ監査＋目視確認＋独立 AI レビュー（DAILY-C02・C05）**:
   - [public-ui-webmcp.json](../../outputs/daily-20261127/public-ui-webmcp.json): 未認証 2 ツール（PII なし）→ WebMCP 管理者デモ 10 ツール（不正 ID `isError: true`、予約作成・完了反映）→ ログアウト 2 ツール復帰 → 375px 保護者デモ 6 ツール（横はみ出し 0・`from-emerald-700 to-teal-800` 保持）→ 320px `TermsModal` 3 タブ折り返し（`288 === 288`・3 `tabpanel`・`Escape` フォーカス復帰）すべて PASS、`pageerror` / `console.error` 0 件。
   - スクリーンショット全 4 枚（`outputs/daily-20261127/screenshots-webmcp/*.png`）を `read_file` で直接目視確認済み。
   - 独立サブエージェント `deep-reviewer`（会話 `0053bd83-d484-4f57-84b4-84f01d84ee8e`）が **APPROVE**（ブロッカー 0 件）。詳細は [review-20261127-webmcp/frontend-review.json](../traceability/reports/review-20261127-webmcp/frontend-review.json)。

## 3. 未確認範囲・外部ブロック・運用境界

- **顧客確認・本番凍結**: `CUST-01`〜`CUST-06` は `NOT_RUN`（0/6）、`thirdPartyPassed: 0`、`release: "HOLD"`（本番運用未開始）。
- **公開デモ範囲の限定**: 本監査は公開フロントエンドのデモ経路＋合成 `document.modelContext` 範囲であり、実 Google OAuth ログイン、実 GAS／スプレッドシート／カレンダー書込み、物理 iOS/Android 実機検証は含みません。
- **共有スプレッドシート API ブロック**: GCP プロジェクト `994752997370` で Google Sheets API が無効のため、共有表の直接更新および AT-28 `protectedRanges` API 実測は未実施（`BLOCKED / not-run`）。
