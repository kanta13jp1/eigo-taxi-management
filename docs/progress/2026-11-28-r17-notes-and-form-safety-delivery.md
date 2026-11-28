# 2026年11月28日（Round 17）送迎メモ常時可視化・往復チケット不足警告・フォーム二重送信防止 検証・配信報告

> **運用境界の維持**: 顧客確認 `CUST-01`〜`CUST-06` は `NOT_RUN`（0/6）、`thirdPartyPassed: 0`、`release: "HOLD"`（本番運用未開始）を維持しています。本検証は **公開フロントエンドのデモ経路** であり、実 Google OAuth ログイン・実 GAS／スプレッドシート／カレンダー書込み・物理モバイル実機検証および顧客本人確認の合格には該当しません。

## 1. 変更対象と期待動作（DAILY-C01）

1. **登録済み「送迎メモ（`pickupNote`）」・予約「連絡メモ（`note`）」の全主要画面可視化と住所折り返し改善**（[src/components/TeacherDashboard.tsx](../../src/components/TeacherDashboard.tsx), [src/components/ParentPortal.tsx](../../src/components/ParentPortal.tsx)）
   - 従来は生徒登録時に入力した常時の注意事項（`pickupNote`）が管理画面の「本日の送迎」カード・生徒カード・保護者画面に表示されず、「全送迎スケジュール・履歴」テーブルでは予約の `note` が非表示かつ住所が `truncate` で途中省略されていた。
   - 「本日の送迎」カードおよび「生徒・チケット管理」カードに `📌 送迎メモ:` を常時表示し、「全送迎スケジュール・履歴」テーブルに `💬` 連絡メモを併記した。あわせて両箇所の `truncate` を `[overflow-wrap:anywhere]` へ改め、マンション名や号室まで見切れなく読めるよう改善した。保護者ポータル「登録済みのご住所・連絡先」にも `送迎メモ:`（未入力時は `未登録`）を表示した。さらに R16 の非ブロッカー指摘（NB-01）だった残留 `cancelRideId` クリーンアップ `useEffect` 依存配列へ `cancelPending` を追加した。
2. **予約登録モーダルの往復連動「チケット不足警告」・モバイル縦積み日時レイアウト・全フォーム同期二重送信防止**（[src/components/AddRideModal.tsx](../../src/components/AddRideModal.tsx), [src/components/AddStudentModal.tsx](../../src/components/AddStudentModal.tsx), [src/components/AddTicketModal.tsx](../../src/components/AddTicketModal.tsx)）
   - `AddRideModal` で送迎区分（片道＝1枚／往復＝2枚）に応じ、残チケットが不足する場合は赤系の事前警告（`role="status"` / `aria-live="polite"`）へ自動切替し、完了前にチケット追加が必要である旨を明示した（残数 1 枚で往復を選んだ場合に即座に不足警告へ切り替わる）。日付・時刻グリッドも `grid-cols-1 sm:grid-cols-2` として 375px モバイル幅での入力見切れを解消した。
   - 予約登録・生徒登録・チケット追加の全 3 モーダルフォームに同期 `submittingRef`（React 再描画前の連打二重送信を遮断）と `mountedRef`（通信完了前の閉じ・アンマウント後の安全保護）を統一導入した。

## 2. 事前検証・独立 AI レビュー（DAILY-C02）

- **独立 AI レビュー（`deep-reviewer` / 会話 `f914de1e-71fa-4053-ae25-e991dc183703`）**: 変更 6 ファイルの静的監査にて **APPROVE**（ブロッカー 0 件）。詳細は [review-20261128-r17/frontend-review.json](../traceability/reports/review-20261128-r17/frontend-review.json)。
- **静的検査・ビルド CSS**: `tsc --noEmit` PASS、`oxlint src/` 0 warnings / 0 errors、死んだ Tailwind v4 / アニメクラス 0 件、`dist/assets/index-M521UVcn.css` への `.focus\:outline-none`・`.backdrop-blur-sm`・`.shadow-sm`・`.grid-cols-1`・`sm\:grid-cols-2`・`\[overflow-wrap\:anywhere\]`・`.border-rose-200`・`.bg-rose-50`・`.text-rose-800`・`.text-amber-800` 実ルール出力を確認。
- **オフライン契約・トレーサビリティ負例**: `npm run test:traceability` **34/34 PASS**、新設 [test_notes_and_form_safety.cjs](../../scripts/test_notes_and_form_safety.cjs) **6/6 PASS**（[r17-notes-and-form-safety.json](../../outputs/daily-20261128/r17/r17-notes-and-form-safety.json)）、`test_dashboard_cancel_and_filter.cjs` **5/5 PASS**、`test_student_low_ticket_ui.cjs` **5/5 PASS** 他既存オフライン契約全本 PASS。
- **Playwright ローカル回帰 4 スイート**: `test_trace_ui.mjs` 6/6、`test_booking_modal_scroll.mjs` 2/2、`tests/reviewer-ui/run.mjs` 8/8、`scripts/run_local_acceptance.mjs` 14/14（計 **30/30 PASS**）。

## 3. 検証サイト配備・公開 SHA-256 照合（DAILY-C03・C04）

- **配備先**: Firebase project `eigo-taxi-app` / Hosting site `eigo-taxi-test`（`https://eigo-taxi-test.web.app/`）のみ。
- **反映版**:
  - Hosting Version: `3775af5aa84763e0`
  - `builtAt`: `2026-11-28T00:52:54.899Z`（2026-11-28 09:52:54 JST）
  - `baseCommit`: `f0a0da0fb39815090cdeda2972b295d4da0b766d`
  - `sourceDigest`: `632e9bfe71922f1014f89e0ab0c0244dc4f5d105ed8ebc2e4c15e3e6c31140ee`
- **公開 6 応答 SHA-256 照合**: `/`, `/index.html`, `/release.json`, `/assets/index-M521UVcn.css`, `/assets/index-s9ZRqGsu.js`, `/favicon.svg` の **6/6 件 HTTP 200・SHA-256 完全一致**（[public-2026-11-28T00-54-25-012Z.json](../acceptance/deployment-verification/public-2026-11-28T00-54-25-012Z.json)）。

## 4. 反映後の公開画面検証・目視確認（DAILY-C05）

- **監査結果**（[public-ui-r17.json](../../outputs/daily-20261128/r17/public-ui-r17.json)）: **6/6 PASS**、`pageerror` 0 件、`console.error` 0 件、見出し飛び級 0 件、死滅クラス 0 件、横はみ出し 0px。
  - `1280×900` 管理者デモ（`#/admin`）: 「本日の送迎」カードの `📌 送迎メモ:`＋`💬 メモ:` 併記、「全送迎スケジュール・履歴」テーブルの住所全文折り返し＋`💬` メモ表示、「生徒・チケット管理」カードの住所全文折り返し＋`📌 送迎メモ:` 表示、予約登録モーダルの残数 1 枚＋往復切替による不足警告表示・`Tab`/`Shift+Tab` 閉じ込め・`Escape` フォーカス復帰を確認。
  - `375×667` モバイル管理者・保護者デモ（`#/admin`・`#/parent`）: 予約モーダルでの日時入力縦積み・不足警告表示（横はみ出し 0）、保護者画面「登録済みのご住所・連絡先」での `送迎メモ:` 表示を確認。
- **スクリーンショット全 6 枚を `read_file` で目視確認済み**: `outputs/daily-20261128/r17/screenshots/`（`admin-today-notes-1280.png`, `admin-schedule-notes-1280.png`, `admin-students-notes-1280.png`, `admin-booking-shortage-1280.png`, `admin-booking-shortage-375.png`, `parent-notes-375.png`）。

## 5. 配布資料・残課題・次の 1 件（DAILY-C06）

- **進捗追補 PowerPoint（24 ページ）**: 既存 23 ページ原本を保持して [progress-2026-11-28-r17-daily.pptx](../deliverables/2026-11-10-premeeting/progress-2026-11-28-r17-daily.pptx) を作成し、ZIP 整合・再取込・はみ出し 0・重なり 0（[validation.json](../../outputs/daily-20261128/r17/ppt/validation.json)）および描画プレビュー画像（`slide-24-r17.png`）を目視確認済み（PowerPoint アプリ上の表示は未確認）。
- **次の 1 件**: AT-28 独立した検証用の復旧コピーにおける保護範囲と参照式の実測値照合（会社 Google アカウント側 GCP プロジェクト `994752997370` の Sheets API 有効化または専用検証手順による確認）、および Issue #4（生徒情報の画面編集・削除、チケット購入履歴一覧表示、アクセス制御方針）の仕様確定。
