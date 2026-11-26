# Round 14: サイトレビュー不具合修正（PR #9 / Issues #5〜#8）検証・テストサイト配信報告（2026-11-27）

公開テスト環境（`https://eigo-taxi-test.web.app/`）への再認証完了を受け、PR #9（ブランチ `fix/site-review-issues-20261125`、修正コミット `2b320ec23f2058253a566b2e61391a54dcfa07b1`）のビルド・回帰検証・公開デプロイ・SHA-256 配信照合・実ブラウザ標準監査・画像目視・独立 AI 監査および厳格トレーサビリティベースライン更新を実施した。

> **運用境界の維持**: 顧客確認 `CUST-01`〜`CUST-06` は `NOT_RUN`、`thirdPartyPassed: 0`、`release: "HOLD"` のままであり、本番運用開始は行っていない。公開画面検証は公開デモ経路およびローカル検証フィクスチャ（実 Google 本人認証・実 GAS/スプレッドシート/Calendar 連携・実機確認なし）の範囲に限定される。

## 対象 Issue と修正内容

- **Issue #5**:
  - `src/components/ParentPortal.tsx`: 残高カードのグラデーションを `from-emerald-700 to-teal-800` へ濃色化し、バッジ・本文・残数低下警告（`bg-amber-950/45 border-amber-300/60 text-amber-50` / `text-amber-100`）の WCAG AA コントラストを確保。
  - `src/components/TeacherDashboard.tsx`: 完了処理エラー（`completionError`）に「閉じる」ボタン追加およびタブ／カード切替時のクリア（`selectTab`）、残存していた生の `students` / `rides` 配列参照を `safeStudents` / `safeRides` へ正規化、同期注記（`text-slate-600`）および表内取消ボタン（`text-rose-700`）の視認性を改善。
  - `src/App.tsx`: フッターおよび法的ボタン3件のテキストを `text-slate-600` へ改善（フック制約 `{ useState, useEffect, useCallback }` 維持）。
- **Issue #6**:
  - `src/components/TermsModal.tsx`: `role="tablist"` を `flex-wrap` 対応にして 320px 幅でのタブ見切れを解消し、3つの `role="tabpanel"` を常時マウントしつつ `hidden` / `tabIndex` を切り替えることで非選択タブの孤立 `aria-controls` IDREF を解消。
- **Issue #7**:
  - `src/components/AccountManagement.tsx`: `session?.mode === 'demo'` 時は `getManagedUsers()` の初期読込を抑止して穏当な `role="status"` 案内へ切り替え（fail-closed ガード維持）、第三者登録フォームへ `htmlFor`/`id` と `autoComplete="off"` を設定。
  - `src/components/AddStudentModal.tsx`: 第三者入力欄の `autoComplete` をすべて `autoComplete="off"` へ統一。
- **Issue #8**:
  - `public/favicon.svg` を `#047857` シャトルアイコンへ刷新し、未使用 `public/icons.svg` を削除、`index.html` に `description` および `theme-color` メタタグを追加。

## 実施した検証・証跡

1. **ビルド・CSS 実ルール・オフライン契約テスト**
   - `npx tsc --noEmit` PASS、`npx oxlint src/` 0 warnings / 0 errors、死んだ Tailwind v4 / `animate-in` 系クラス 0 件。
   - `npm run build` 出力（`dist/assets/index-C1hp1v-I.css`）に `.focus\:outline-none`・`.from-emerald-700`・`.to-teal-800`・`.bg-emerald-950\/35`・`.bg-amber-950\/45`・`.text-slate-600`・`.text-rose-700`・`.flex-wrap` 等の実ルール出力を確認。
   - `npm run test:traceability` 34/34 PASS、およびオフライン契約スクリプト 8 本（`test_student_low_ticket_ui`, `test_reservation_retry_ui`, `test_release_contract`, `test_portals`, `test_google_auth`, `test_google_signout_retry`, `test_google_auth_retry_ui`, `test_portal_mismatch_ui`）全件 PASS。
2. **Playwright 回帰 4 スイート（LF バイト列基準で実行）**
   - `scripts/test_trace_ui.mjs` (`UI-01`〜`UI-06` 6/6 PASS)
   - `scripts/test_booking_modal_scroll.mjs` (`375x500` / `812x375` 2/2 PASS)
   - `tests/reviewer-ui/run.mjs` (`REVIEW-UI-01`〜`REVIEW-UI-08` 8/8 PASS)
   - `scripts/run_local_acceptance.mjs` (`LOCAL-UI-01`〜`LOCAL-UI-14` 14/14 PASS)
3. **公開テストサイト配信＆SHA-256 照合**
   - `npm run deploy:mighty-test` (`builtAt`: `2026-11-26T18:20:31.477Z` / `baseCommit`: `2b320ec23f2058253a566b2e61391a54dcfa07b1` / `sourceDigest`: `0b77363bfa65bdeff67322aec73ff3fc218aaccb37ee6fb5ab85dbd7d20c013b`)
   - `verify_mighty_release.cjs` および `verify_mighty_release_snapshot.cjs`（`docs/acceptance/deployment-verification/public-2026-11-26T18-22-35-923Z.json`）：全 6 URL で HTTP 200・SHA-256 一致（`"pass": true`）、`distHashes` に `dist/icons.svg` 不在を確認。
4. **公開デモ実ブラウザ標準監査＋全 6 枚スクリーンショット目視確認**
   - 記録ファイル: `outputs/daily-20261127/public-ui-r14.json` および `outputs/daily-20261127/screenshots-r14/*.png`（6枚すべてを `read_file` で目視確認）。
   - DOM 監査 8 条件すべてで `contrastFailures: []`（最小コントラスト比 4.51:1〜4.76:1）、`deadClasses: []`、`headingSkips: []`、`danglingIdrefs: []`、`overflowX: false` を確認。
5. **独立 AI レビュー＆厳格ゲート**
   - `deep-reviewer`（conversationId: `8eef3345-302f-43d6-8d9e-ef09ac5b8b46`）による独立レビュー完了（ブロッカーなし、`NON-BLOCKING / PASS`）。
   - レビュー証跡: `docs/traceability/reports/review-20261127-r14/frontend-review.json`
