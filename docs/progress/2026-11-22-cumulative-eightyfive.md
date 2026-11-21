# 11月22日 累計85件の実装修正・受入試験85項目（AddStudentModal 補完/送信ロック / AddTicketModal ロック/残高プレビュー連携 / LoginScreen 誤入口フォーカス・再試行状態・体験ランドマーク）

小林さん、お疲れ様です。

11月22日の追加対応により、実装修正は**累計85件**、実施した異なる受入試験は**累計85項目**となりました（先行2件は Claude Code Fable 5.2 の対応分、追加83件が後続の対応分です）。今回は Round 7 として Agent Swarms（`/swarm`、`workspace: "share"` による3ファイル並列実装＋独立 `verifier-7` 監査）を活用して実装・統合しました。

### 【今回の追加修正内容（83〜85件目）】
* **83件目（`AddStudentModal.tsx`）**：新規生徒登録モーダル内の装飾 Lucide アイコン6件（ヘッダー `UserPlus`・閉じる `X`・`User`・`Phone`・`MapPin`・送信 `UserPlus`）すべてへ `aria-hidden="true"` を適用しました。また、登録送信中（`isSubmitting === true`）に6入力項目すべて（生徒氏名・保護者氏名・電話番号・初期チケット枚数・送迎場所・注意メモ）を `disabled={isSubmitting}`＋`disabled:opacity-50` でロックし、生徒／保護者氏名へ `autoComplete="name"`、住所へ `autoComplete="street-address"`（電話番号の `autoComplete="tel"` は維持）を設定しました。
* **84件目（`AddTicketModal.tsx`）**：チケット追加モーダル内の装飾 Lucide アイコン3件（`Ticket`・`X`・`PlusCircle`）すべてへ `aria-hidden="true"` を適用しました。また、送信中（`isSubmitting === true`）に対象生徒セレクト・追加枚数・受取金額・メモ入力を `disabled`＋`disabled:opacity-50` でロックし、残数プレビュー要素へ `id="ticket-balance-preview"` と `role="status"` を追加して `#ticket-count` 入力の `aria-describedby` と関連付けました。
* **85件目（`LoginScreen.tsx`）**：保護者用入口から管理者入口へ誘導するリンク（`<a href="#/admin">`）へ `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500` を追加し、「ログインの準備を再試行」ボタンへ `aria-busy={busy}` を設定しました。さらに体験用セクションへ `aria-labelledby="demo-entry-heading"`（見出し `id="demo-entry-heading"`）と補足文 `id="demo-entry-note"` を付与し、「管理者デモを開く」「保護者デモを開く」ボタンへ `aria-describedby="demo-entry-note"` を関連付けました。

### 【今回実施した受入試験（83〜85項目目）】
* **83項目目（AddStudentModal アイコン非読み上げ・autoComplete・送信ロック準備検証［公開デモ］）**：公開検証サイト（`https://eigo-taxi-test.web.app/#/admin`）の管理者デモから「新規生徒を登録」モーダルを開き、SVG 6件すべての `aria-hidden="true"`、氏名・住所・電話番号の `autoComplete` 属性、および6入力項目すべての `disabled:opacity-50` を確認しました。
* **84項目目（AddTicketModal アイコン非読み上げ・送信ロック・残数プレビュー連携検証［公開デモ］）**：公開検証サイトの管理者デモから「チケット購入・追加」モーダルを開き、SVG 3件すべての `aria-hidden="true"`、4入力項目の `disabled:opacity-50`、および `#ticket-count` の `aria-describedby="ticket-balance-preview"` と `role="status"` プレビュー表示を確認しました。
* **85項目目（LoginScreen デモ案内ランドマーク＆誤入口・再試行フォーカス/処理中属性検証［公開デモ＋オフライン契約試験］）**：公開検証サイトの `#/parent` および `#/admin` で体験用セクションの `aria-labelledby="demo-entry-heading"`・見出し/補足 `id`・体験ボタンの `aria-describedby="demo-entry-note"` を確認し、あわせてオフライン契約試験（`test_google_auth_retry_ui.cjs`・`test_portal_mismatch_ui.cjs` および `offline-login-eightyfive.json`）にて誤入口誘導リンクの `focus-visible:ring-2` と「ログインの準備を再試行」の `aria-busy={false}` を確認しました。

---

### 【公開環境・確認範囲】
* **検証サイト**: https://eigo-taxi-test.web.app/
* **反映版 (`sourceDigest`)**: `548950eec1b6f91e5ec5653c54933662dc160c782f40eb1a2475b687a1dae4e5`（ビルド時刻: `2026-11-21T22:53:00.959Z`）
* **配信照合**: [public-2026-11-21T22-54-59-445Z.json](../acceptance/deployment-verification/public-2026-11-21T22-54-59-445Z.json)（全7ファイル SHA-256 一致）
* **公開UI証跡**: [public-ui-eightyfive.json](../../outputs/daily-20261122/public-ui-eightyfive.json)
* **オフラインLoginScreen契約証跡**: [offline-login-eightyfive.json](../../outputs/daily-20261122/offline-login-eightyfive.json)
* **顧客確認・本番状況**: 小林様の顧客確認6手順（`CUST-01`〜`CUST-06`）は 0/6件（未実施）、顧客用の検証データはそのまま維持しており、**本番運用は開始していません**。
