# 11月20日 累計34件の実装修正・受入試験34項目と受入証跡の最新化

小林さん、お疲れ様です。

11月20日の追加対応により、実装修正は**累計34件**、実施した異なる受入試験は**累計34項目**となりました（先行2件は Claude Code Fable 5.2 の対応分、追加32件が後続の対応分です）。また、最新ソースコードに合わせて全ローカル受入証跡ハッシュを再更新し、`npm run docs:check`（構造・トレーサビリティ整合検査）を完全パスさせました。

### 【今回の追加修正内容（33〜34件目）】
* **33件目（`TeacherDashboard.tsx`）**：全送迎スケジュール一覧テーブルの「完了済」バッジ直下に完了日時（`completedAt`）を表示し、いつ送迎が完了したかの実績を一覧画面からも即座に確認できるよう改善しました。
* **34件目（`LoginScreen.tsx`）**：ログイン画面の「Googleでログイン」「ログインの準備を再試行」「管理者／保護者デモを開く」ボタンへ `type="button"` を明示し、意図しないフォーム送信を防止しました。

### 【今回実施した受入試験（33〜34項目目）】
* **`SAT-36`（カレンダー確認・実送迎・実績確認［公開デモ］）**：公開検証サイトの管理者デモ画面で送迎完了（`7 → 6枚`）を実行後、「送迎スケジュール一覧」に `完了済 (-1回)` とともに完了日時（`2026/11/20 1:41:56`）が正しく表示されることを確認しました。（※実Googleカレンダーの照合は実Google連携環境での別途確認対象です）
* **`SAT-39`（両画面アクセスと残少解除・ログアウト非表示［公開デモ］）**：公開検証サイトの管理者デモで山本 颯太さん（残1枚）へ10枚・0円を追加（`1 → 11枚`）してログアウトし、保護者デモへ入り直して残高11枚と残少警告の消失を確認しました。また、管理者・保護者双方でログアウト・再読込後に台帳が表示されないこと、および `LoginScreen` の `type="button"` 属性を確認しました。

### 【ローカル受入証跡の最新化（`npm run docs:check` 完全パス）】
* 全ローカルテスト（`test_gas.cjs` 85/85、`run_local_acceptance.mjs` `LOCAL-UI-01`〜`14`、`tests/reviewer-ui/run.mjs` `REVIEW-UI-01`〜`08`、`test_trace_ui.mjs` `UI-01`〜`06`、`test_booking_modal_scroll.mjs`、`test_portals.cjs`、`test_google_auth*.cjs`、`test_portal_mismatch_ui.cjs`、`test_reservation_retry_ui.cjs`、`test_release_contract.cjs`、`local_acceptance_safety.test.mjs`、`test_traceability.py` 34/34）を最新ソースで再実行し、すべて PASS した証跡（`outputs/refresh-20261120/` 等）へ更新しました。

---

### 【公開環境・確認範囲】
* **検証サイト**: https://eigo-taxi-test.web.app/
* **反映版 (`sourceDigest`)**: `5138e1a569360502cb08db166b5694ab6ca5707c0f414c3849b1bdb1f9c3cf6a`（ビルド時刻: `2026-11-19T16:41:13.911Z`）
* **配信照合**: [public-verification.json](../acceptance/deployment/public-verification.json) / [public-2026-11-19T16-41-52-458Z.json](../acceptance/deployment-verification/public-2026-11-19T16-41-52-458Z.json)（全7ファイル SHA-256 一致）
* **顧客確認・本番状況**: 小林様の顧客確認6手順（`CUST-01`〜`CUST-06`）は 0/6件（未実施）、顧客用の検証データはそのまま維持しており、**本番運用は開始していません**。
