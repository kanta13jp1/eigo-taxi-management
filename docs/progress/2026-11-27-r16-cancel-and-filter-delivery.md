# 2026年11月27日（Round 16）本日の送迎直接取消・取消確認モーダル一元化・残少クイック絞り込み 検証・配信報告

> **運用境界の維持**: 顧客確認 `CUST-01`〜`CUST-06` は `NOT_RUN`（0/6）、`thirdPartyPassed: 0`、`release: "HOLD"`（本番運用未開始）を維持しています。本検証は **公開フロントエンドのデモ経路** であり、実 Google OAuth ログイン・実 GAS／スプレッドシート／カレンダー書込み・物理モバイル実機検証および顧客本人確認の合格には該当しません。

## 1. 変更対象と期待動作（DAILY-C01）

1. **取消確認モーダルの `useModalDialog` 一元化と通信完了待機・エラー保持**（[src/hooks/useModalDialog.ts](../../src/hooks/useModalDialog.ts), [src/components/TeacherDashboard.tsx](../../src/components/TeacherDashboard.tsx), [src/components/ParentPortal.tsx](../../src/components/ParentPortal.tsx)）
   - 従来は `confirmCancellation` が `await onCancelRide(targetId)` の完了を待たず即時ダイアログを閉じており、通信中のボタン無効化・`Escape`／背景クリック抑止が機能せず、さらにネイティブ `<dialog>` の連続 `Escape`（`CloseWatcher`）による状態不整合や背景スクロール抑止欠落があった。
   - 両画面の取消確認モーダルを `useModalDialog`（`role="dialog"` / `aria-modal="true"` / `body.style.overflow = 'hidden'` / フォーカストラップ / 初期フォーカス「戻る」）へ統一し、処理中は「取消処理中…」表示と全離脱操作ブロックを維持。失敗時はダイアログ内に `role="alert"` でエラーを表示して閉じずに保持し、成功後にトリガーボタンが消滅した場合は `#main-content` へ安全にフォーカス復帰するよう改善した。あわせて完了処理と取消処理の相互排他・残留 ID クリア・管理者確認ダイアログへの「備考」表示を追加。
2. **管理者「本日の送迎」カードへの直接「取消」ボタン追加**（[src/components/TeacherDashboard.tsx](../../src/components/TeacherDashboard.tsx)）
   - 当日直前のキャンセル連絡時に「送迎スケジュール一覧」タブへ移動せず、「本日の送迎」カードの予定中予約から直接確認モーダルを開いて取り消せるよう「取消」ボタンを追加（375px モバイル幅でも `flex-wrap` で横溢れゼロ）。
3. **「チケット残り2枚以下」サマリーカードと生徒一覧のクイック絞り込み連携**（[src/components/TeacherDashboard.tsx](../../src/components/TeacherDashboard.tsx)）
   - 「生徒・チケット管理」タブに `全員` / `残り2枚以下のみ` 絞り込みトグル（`role="group"`・`aria-pressed`）と 0 件時リカバリー（「全員を表示」）を追加。上部「チケット残り2枚以下」カード押下時に自動で `残り2枚以下のみ` へ絞り込み、「登録生徒数」カードおよび「生徒・チケット管理」タブ直接押下時は `全員` 表示を維持。

## 2. 事前検証・独立 AI レビュー（DAILY-C02）

- **独立 AI レビュー（`deep-reviewer` / 会話 `8dd6b6ac-4f71-455b-af6f-9ac5f198f07f`）**: 初回レビューの指摘 5 件（エラー捕捉・`useModalDialog` 一元化・相互排他＆残留 ID クリア・フォーカス復帰フォールバック・契約テスト拡充）をすべて修正し、再レビューにて **APPROVE**（ブロッカー 0 件）。詳細は [review-20261127-r16/frontend-review.json](../traceability/reports/review-20261127-r16/frontend-review.json)。
- **静的検査・ビルド CSS**: `npx tsc --noEmit` PASS、`npx oxlint src/` 0 warnings / 0 errors、死んだ Tailwind v4 / アニメクラス 0 件、`dist/assets/index-COuYlynp.css` への `.focus\:outline-none`・`.backdrop-blur-sm`・`.border-rose-300`・`.text-rose-700`・`.text-amber-800`・`.overscroll-contain`・`.flex-wrap` 実ルール出力を確認。
- **オフライン契約・トレーサビリティ負例**: `npm run test:traceability` **34/34 PASS**、新設 [test_dashboard_cancel_and_filter.cjs](../../scripts/test_dashboard_cancel_and_filter.cjs) **5/5 PASS**、`test_student_low_ticket_ui.cjs` **5/5 PASS** 他全 10 本 PASS。
- **Playwright ローカル回帰 4 スイート**: `test_trace_ui.mjs` 6/6、`test_booking_modal_scroll.mjs` 2/2、`tests/reviewer-ui/run.mjs` 8/8、`scripts/run_local_acceptance.mjs` 14/14（計 **30/30 PASS**）。

## 3. 検証サイト配備・公開 SHA-256 照合（DAILY-C03・C04）

- **配備先**: Firebase project `eigo-taxi-app` / Hosting site `eigo-taxi-test`（`https://eigo-taxi-test.web.app/`）のみ。
- **反映版**:
  - Hosting Version: `23cb92b1ecfa50d2`
  - `builtAt`: `2026-11-27T11:45:03.201Z`（2026-11-27 20:45:03 JST）
  - `baseCommit`: `a657acd5980f439a3159d06a6acf3f4e3a2b4bad`
  - `sourceDigest`: `24e506a420eaf15acbee94d4ec772a568374a1c34c3155c019c37673c5ea29d9`
- **公開 6 応答 SHA-256 照合**: `/`, `/index.html`, `/release.json`, `/assets/index-COuYlynp.css`, `/assets/index-BK8d4znc.js`, `/favicon.svg` の **6/6 件 HTTP 200・SHA-256 完全一致**（[public-2026-11-27T11-46-50-690Z.json](../acceptance/deployment-verification/public-2026-11-27T11-46-50-690Z.json)）。

## 4. 反映後の公開画面検証・目視確認（DAILY-C05）

- **監査結果**（[public-ui-r16.json](../../outputs/daily-20261127/r16/public-ui-r16.json)）: **6/6 PASS**、`pageerror` 0 件、`console.error` 0 件、見出し飛び級 0 件、死滅クラス 0 件、横はみ出し 0px。
  - `1280×900` 管理者デモ（`#/admin`）: 「本日の送迎」カード 2 件の直接「取消」表示→確認モーダル（`aria-modal="true"`, `body.style.overflow === 'hidden'`, 初期フォーカス「戻る」, `Tab`/`Shift+Tab` 閉じ込め, `Escape` でトリガー復帰）→「取消を確定」後の `#main-content` フォーカス復帰→「チケット残り2枚以下」カード押下による残数 `1・0` 絞り込みと「全員」復帰を確認。
  - `375×667` モバイル管理者・保護者デモ（`#/admin`・`#/parent`）: ボタン折り返し（横はみ出し 0）、保護者取消モーダルのスクロール抑止・フォーカストラップ・`Escape` 復帰・確定後の `#main-content` 復帰を確認。
- **スクリーンショット全 5 枚を `read_file` で目視確認済み**: `outputs/daily-20261127/r16/screenshots/`（`admin-today-1280.png`, `admin-cancel-dialog-1280.png`, `admin-students-low-filter-1280.png`, `admin-today-375.png`, `parent-cancel-dialog-375.png`）。

## 5. 配布資料・残課題・次の 1 件（DAILY-C06）

- **進捗追補 PowerPoint（23 ページ）**: 既存 22 ページ原本を保持して [progress-2026-11-27-r16-daily.pptx](../deliverables/2026-11-10-premeeting/progress-2026-11-27-r16-daily.pptx) を作成し、ZIP 整合・再取込・はみ出し 0・重なり 0（[validation.json](../../outputs/daily-20261127/r16/ppt/validation.json)）および描画プレビュー画像（`slide-23-r16.png`）を目視確認済み（PowerPoint アプリ上の表示は未確認）。
- **次の 1 件**: AT-28 独立した検証用の復旧コピーにおける保護範囲と参照式の実測値照合（会社 Google アカウント側 GCP プロジェクト `994752997370` の Sheets API 有効化または専用検証手順による確認）。
