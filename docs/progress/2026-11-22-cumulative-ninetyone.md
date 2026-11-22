# 11月22日 累計91件の実装修正・受入試験91項目（App ランドマーク/トースト読み上げ制御 / TermsModal WCAG フォーカス管理・スクロール抑止 / AddStudentModal WCAG フォーカス管理・復帰）

小林さん、お疲れ様です。

11月22日の追加対応により、実装修正は**累計91件**、実施した異なる受入試験は**累計91項目**となりました（先行2件は Claude Code Fable 5.2 の対応分、追加89件が後続の対応分です）。今回は Round 9 として Agent Swarms（`/swarm`、`workspace: "share"` による3ファイル並列実装＋独立 `verifier-9` 監査）を活用して実装・統合しました。

### 【今回の追加修正内容（89〜91件目）】
* **89件目（`App.tsx`）**：ログイン状態バーを `<section aria-label="ログイン状態">`、フッター法務リンク群を `<nav aria-label="規約・法務リンク">` へ変更し、装飾区切り文字 `|` 2件に `aria-hidden="true"` を適用しました。また、エラー時の「台帳を再取得する」ボタンへ `disabled={isLoading}`・`aria-busy={isLoading}`・`disabled:opacity-50` を追加し、完了トースト（`role="status"`）へ `aria-atomic="true"` を設定しました。
* **90件目（`TermsModal.tsx`）**：規約モーダル開閉時の WCAG フォーカス管理と背面スクロール抑止（`document.body.style.overflow = 'hidden'`）を実装しました。開いた直後に選択タブ（`terms-tab-${initialTab}`）へフォーカスを移し、閉じた際に背面スクロール状態と元ボタンへのフォーカスを `isConnected` 確認の上で安全に復帰させます。
* **91件目（`AddStudentModal.tsx`）**：新規生徒登録モーダルに `useRef`（`nameInputRef`）を用いた初期フォーカス（`#student-name`）と背面スクロール抑止を実装しました。`Escape` や閉じる操作によるアンマウント時に `document.body.style.overflow` と呼び出し元ボタンへのフォーカスを自動復帰させます。

### 【今回実施した受入試験（89〜91項目目）】
* **89項目目（App ランドマーク・法務区切り非読み上げ・トースト `aria-atomic` 検証［公開デモ］）**：公開検証サイト（`https://eigo-taxi-test.web.app/#/admin`）の管理者デモで、`<section aria-label="ログイン状態">`（内部にログアウトボタン）、`<nav aria-label="規約・法務リンク">`（ボタン3件・`aria-hidden="true"` 区切り2件）、およびデモチケット追加後のトースト（`aria-atomic="true"`）を確認しました（あわせてオフライン契約試験 `test_reservation_retry_ui.cjs` も合格）。
* **90項目目（TermsModal 初期タブフォーカス・矢印移動・背面スクロール抑止・`Escape` フォーカス復帰検証［公開デモ］）**：公開検証サイトでフッター「利用規約」からモーダルを開き、`document.activeElement.id === 'terms-tab-terms'`・`body.style.overflow === 'hidden'`、`ArrowRight` での `'terms-tab-privacy'` 移動、および `Escape` 閉鎖後の `overflow === ''`・元ボタンへのフォーカス復帰を確認しました。
* **91項目目（AddStudentModal 初期入力フォーカス・背面スクロール抑止・`Escape` フォーカス復帰検証［公開デモ］）**：公開検証サイトで「新規生徒を登録」からモーダルを開き、`document.activeElement.id === 'student-name'`・`body.style.overflow === 'hidden'`、および `Escape` 閉鎖後の `overflow === ''`・「新規生徒を登録」ボタンへのフォーカス復帰を確認しました。

---

### 【公開環境・確認範囲】
* **検証サイト**: https://eigo-taxi-test.web.app/
* **反映版 (`sourceDigest`)**: `f37ca513757415ec6c7c9a70af5233af619fa26651b4d661ed3402a720c4e985`（ビルド時刻: `2026-11-21T23:33:04.035Z`）
* **配信照合**: [public-2026-11-21T23-34-36-525Z.json](../acceptance/deployment-verification/public-2026-11-21T23-34-36-525Z.json)（全7ファイル SHA-256 一致）
* **公開UI証跡**: [public-ui-ninetyone.json](../../outputs/daily-20261122/public-ui-ninetyone.json)
* **顧客確認・本番状況**: 小林様の顧客確認6手順（`CUST-01`〜`CUST-06`）は 0/6件（未実施）、顧客用の検証データはそのまま維持しており、**本番運用は開始していません**。
