---
name: eigo-taxi-delivery-verification
description: >-
  Run local static checks, contract suites, Playwright browser suites, Firebase hosting
  mighty-test deployment, SHA-256 verification, live standards audits, screenshot inspection,
  and strict traceability baselines for eigo-taxi-management. Use whenever modifying src/,
  frontend tests, or preparing a test-site delivery in this repository.
---

# eigo-taxi-management デリバリー検証・標準監査ランブック

## Step 0: Windows 実行環境の固定
ブラウザ検証・Vite ビルドは Node.js >= 24.12.0 とシステム Chrome を明示指定して実行する。

```powershell
$env:PATH = "C:\Users\kanta\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;" + $env:PATH
$env:EIGO_CHROMIUM_EXECUTABLE = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
```

## Step 1: 静的検査・ビルド CSS 検査
1. `npx tsc --noEmit`（終了コード 0）
2. `npx oxlint src/`（0 warnings / 0 errors）
3. `src/` 内に死んだ Tailwind v4 / アニメクラス（`outline-hidden|shadow-xs|backdrop-blur-xs|animate-in|fade-in|zoom-in-95|slide-in-from-bottom-5`）が 0 件であることを確認する。
4. `npm run build` 実行後、`dist/assets/index-*.css` に必要なスタイル（例: `.focus\:outline-none`・`.backdrop-blur-sm`・`.shadow-sm`）が実際に出力されていることを確認する。

## Step 2: オフライン契約テスト＋ブラウザ回帰スイート
**出力先指定や事前削除のルールを誤ると別ディレクトリ汚染または `EEXIST` エラーになるため厳守する。**

1. トレーサビリティ負例試験: `npm run test:traceability`（34/34 PASS）
2. 変更影響に応じたオフライン契約スクリプト（`scripts/test_portals.cjs`, `test_google_auth.cjs`, `test_google_signout_retry.cjs`, `test_google_auth_retry_ui.cjs`, `test_portal_mismatch_ui.cjs`, `test_student_low_ticket_ui.cjs`, `test_release_contract.cjs`, `test_reservation_retry_ui.cjs`）。
   - `src/App.tsx` を変更した場合、`outputs/refresh-20261120/offline/reservation-retry-ui.json` を最新 `stdout` と `src/App.tsx` の SHA-256 で更新する。
   - `gas/Code.gs` 未変更時は `test_gas.cjs` を不用意に回さない（回した場合は `docs/acceptance/service-checks/` の生成物を整理する）。
3. ブラウザ検証 4 スイート:
   - `test_trace_ui.mjs`（**環境変数必須** — 未指定だと `docs/traceability/reports/r2/browser` を汚染する）:
     ```powershell
     $env:EIGO_UI_TEST_OUTPUT_DIR = 'outputs\r19-adoption-20261111\regression\trace-ui'
     node scripts/test_trace_ui.mjs
     ```
   - 残り 3 スイートは `mkdir(..., { recursive: false })` を使うため、実行前に出力フォルダを削除する:
     ```powershell
     Remove-Item -Recurse -Force -ErrorAction SilentlyContinue `
       outputs\refresh-20261120\modal-scroll, `
       outputs\refresh-20261120\reviewer, `
       outputs\refresh-20261120\local
     $env:EIGO_MODAL_SCROLL_OUTPUT_DIR = 'outputs\refresh-20261120\modal-scroll'
     node scripts/test_booking_modal_scroll.mjs
     node tests\reviewer-ui\run.mjs outputs\refresh-20261120\reviewer
     node scripts/run_local_acceptance.mjs --out outputs\refresh-20261120\local
     ```

## Step 3: テストサイト配信＆SHA-256 スナップショット検証
1. `npm run deploy:mighty-test` を実行し、[docs/acceptance/deployment/build-manifest.json](docs/acceptance/deployment/build-manifest.json) の `builtAt`・`baseCommit`・`sourceDigest` を控える。
2. CDN キャッシュ伝播のため **5秒待機**してから実行する（初回不一致時はさらに 5秒待って 1回リトライ）:
   ```powershell
   Start-Sleep -Seconds 5
   node scripts/verify_mighty_release.cjs
   node scripts/verify_mighty_release_snapshot.cjs
   ```

## Step 4: 公開デモ実ブラウザ標準監査＋目視画像検査
1. `https://eigo-taxi-test.web.app/`（`#/admin`・`#/parent`、PC `1280x900`・モバイル `375x667`）に対し Playwright で以下を検証する:
   - **WAI-ARIA モーダル**: `Tab`/`Shift+Tab` が `[role="dialog"]` 外へ漏れないこと、`body.style.overflow === 'hidden'` 抑止・解除、`disabled` 初期要素スキップ、`Escape` でトリガー要素へフォーカス復帰。
   - **Tailwind v3 算出スタイル**: DOM に死んだクラス 0 件、かつ `getComputedStyle` 検証（注意: `.focus:outline-none:focus` は v3 では `outline: 2px solid transparent` ＝ `outlineColor: "rgba(0, 0, 0, 0)"` を生成するため、`outlineStyle === 'none' || outlineColor === 'rgba(0, 0, 0, 0)'` で判定する）。
   - **WCAG 見出し階層**: 各タブ・画面・モーダルで可視見出しに飛び級（`curr.level > prev.level + 1`）が 0 件であること。
2. 主要状態（管理者画面・モーダル開状態・モバイル画面等）のスクリーンショットを取得し、**すべての `.png` を必ず `read_file` で開いて目視確認**する。

## Step 5: レビュー証跡記録・厳格トレーサビリティゲート（順序厳守）
1. 変更ソースファイル・テスト・証跡ファイルの実 SHA-256 をディスクから算出する。
2. `docs/traceability/reports/review-<YYYYMMDD>/frontend-review.json` を作成し、独立レビュー所見・画像目視所見・ハッシュ・制限事項（`CUST-01..06` = `NOT_RUN`、`thirdPartyPassed: 0`、`release: "HOLD"` 等）を記録する。
3. 進捗レポート `docs/progress/<YYYY-MM-DD>-*.md` を作成する。
4. 最後にベースライン記録と厳格検証を実行する:
   ```powershell
   node scripts/traceability_cli.cjs baseline
   npm run docs:generate
   npm run docs:index
   npm run docs:check
   npm run docs:check:strict
   npx tsc --noEmit
   npx oxlint src/
   ```
