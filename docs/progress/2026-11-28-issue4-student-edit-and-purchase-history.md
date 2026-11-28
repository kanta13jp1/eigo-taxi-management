# 2026年11月28日（Issue #4）生徒情報編集・チケット購入履歴表示の設計・検証報告

> **運用境界の維持**: 顧客確認 `CUST-01`〜`CUST-06` は `NOT_RUN`（0/6）、`thirdPartyPassed: 0`、`release: "HOLD"`（本番運用未開始）を維持しています。本ブランチ（`feat/issue-4-student-edit-and-purchase-history`）では Firebase 検証サイト（`eigo-taxi-test.web.app`）および実 Google Apps Script（GAS）への配備は行っていません。

## 1. Issue #4 項目の棚卸し（Fit / Gap とスコープ判定）

[Issue #4](https://github.com/kanta13jp1/eigo-taxi-management/issues/4) の 3 項目について現行コードベースとの差分を棚卸しし、安全かつ不可逆リスクの低い 2 機能を今回実装しました。

| Issue #4 項目 | 現行状態・判定 | 今回の方針・実装内容 |
| :--- | :--- | :--- |
| **1. アクセス制御（誤操作防止）** | **Fit（既実装）** | Google OAuth（ID トークン検証）＋ サーバー側 `AUTH_GOOGLE_USERS_JSON` 許可リスト ＋ `#/admin` / `#/parent/<publicEntryId>` ルート分離（`PORTAL_MISMATCH`・`reviewOnly` 制限）により保護済みのため、不安全なクライアント側簡易 PIN ロックは追加せず現状設計を維持。 |
| **2. 生徒情報の編集・削除** | **編集のみ今回実装 / 削除は保留** | `updateStudent` を `gas/Code.gs`・`ApiService`・`EditStudentModal` へ実装（氏名・保護者氏名・電話番号・住所・送迎メモの 5 項目のみ更新可、`id`・`ticketBalance`・`createdAt` 改変を拒否し残高は `addTickets`/`completeRide` 監査経路を維持、通常管理者 `requireAdmin_` 限定）。`deleteStudent` は予約履歴・購入履歴・`AUTH_GOOGLE_USERS_JSON` との参照整合性や退会・返金ポリシーの顧客合意が未決のため本 PR では保留。 |
| **3. チケット購入履歴表示** | **今回実装** | 既存 7 列シート `チケット購入履歴`・`eigo_taxi_purchases` を使い（8/12/7 列スキーマ不変）、`getPurchases` を実装。保護者・`reviewOnly` へは `canAccess_` / `mayAccessStudent` で割当生徒分のみ返却。`App.tsx` では `getStudents`/`getRides` と分離して取得し、未対応 GAS 接続時でも他機能へ波及させず購入履歴欄のみエラー通知を表示する。 |

## 2. 変更対象一覧

- [gas/Code.gs](../../gas/Code.gs): `doPost` へ `getPurchases`・`updateStudent` を追加、`purchase_` ヘルパーおよび `mutate_("updateStudent", ...)`（ロールバック・数式インジェクション防御 `sheetValue_`・`requireAdmin_`・`ticketBalance` 改変拒否）を実装。
- [src/services/api.ts](../../src/services/api.ts): `StudentProfileUpdate` 型、`ApiService.getPurchases()`、`ApiService.updateStudent()` を追加し、`live()` 配列応答検証へ `'getPurchases'` を追加。
- [src/components/EditStudentModal.tsx](../../src/components/EditStudentModal.tsx): WAI-ARIA モーダル（`useModalDialog`・`submittingRef`・`mountedRef`・必須検証・フォーカス移動・読取専用 ID/残高表示）を新規作成。
- [src/components/TeacherDashboard.tsx](../../src/components/TeacherDashboard.tsx): 生徒カードへ通常管理者向け `編集` ボタン（`reviewOnly` 非表示）、第 4 タブ `購入履歴`（生徒絞り込み・合計枚数/金額・エラー表示）を追加。
- [src/components/ParentPortal.tsx](../../src/components/ParentPortal.tsx): 選択中生徒の `チケット購入履歴` カードおよび取得エラー案内を追加。
- [src/App.tsx](../../src/App.tsx): `purchases` / `purchasesError` / `editingStudent` 状態管理、`fetchPurchases` の Graceful Degrade 取得、`handleUpdateStudent`、`EditStudentModal` 連携を追加（React フック種別 `{ useState, useEffect, useCallback }` を維持）。
- [scripts/test_gas.cjs](../../scripts/test_gas.cjs): `GAS-03` / `GAS-08` 拡張および `GAS-86`〜`GAS-89` を追加。
- [scripts/test_issue4_student_edit_and_purchases.cjs](../../scripts/test_issue4_student_edit_and_purchases.cjs): オフライン挙動・描画契約 5 件（`ISS4-01`〜`ISS4-05`）を新規作成。

## 3. 検証結果と未確認範囲（2026-11-28）

- **静的検査・ビルド**: `tsc --noEmit`、`oxlint src/`、`npm run build` PASS。
- **GAS VM 契約試験（`node scripts/test_gas.cjs`）**: 89/89 PASS（Google サービス・ロック競合はオフライン VM スタブ。**実 GAS への配備・実シート書込み・実 Calendar 連携は `not-run`**）。
- **オフライン契約・React 描画・Playwright 回帰**: `test_issue4_student_edit_and_purchases.cjs` 5/5、`test_notes_and_form_safety.cjs` 6/6、`test_portals.cjs`、`test_reservation_retry_ui.cjs`、`test_trace_ui.mjs` 6/6、`tests/reviewer-ui/run.mjs` 8/8、`scripts/run_local_acceptance.mjs` 14/14 PASS。
- **ローカル実ブラウザ目視検証**: `dist` ビルドのローカルサーバー上で 1280px・375px の 4 スクリーンショットを取得し、`read_file` で目視確認済み（`outputs/daily-20261128/issue4/screenshots/`。公開 `eigo-taxi-test.web.app` への配備および物理スマホ実機確認は `not-run`）。
- **独立 AI レビュー（`deep-reviewer`）**: ブロッカー 0 件を確認（[review.json](../traceability/reports/review-20261128-issue4/review.json)）。
- **厳格トレーサビリティ**: `baseline` / `docs:generate` / `docs:index` / `docs:check` / `docs:check:strict` PASS、`npm run test:traceability` 34/34 PASS。
