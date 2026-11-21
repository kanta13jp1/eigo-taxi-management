# 11月21日 累計67件の実装修正・受入試験67項目（TermsModal WAI-ARIA/キーボード対応・PortalInvitations 再取得/生成状態・LoginScreen 準備状態/フォーカス改善）

小林さん、お疲れ様です。

11月21日の追加対応により、実装修正は**累計67件**、実施した異なる受入試験は**累計67項目**となりました（先行2件は Claude Code Fable 5.2 の対応分、追加65件が後続の対応分です）。今回は Agent Swarms（`/swarm`、`workspace: "share"` による3ファイル並列実装＋独立 `verifier` 監査）を活用して実装・統合しました。

### 【今回の追加修正内容（65〜67件目）】
* **65件目（`TermsModal.tsx`）**：規約モーダルのタブ領域（`role="tablist"`）へモバイル横スクロール対応（`overflow-x-auto`）および `ArrowRight` / `ArrowLeft` / `Home` / `End` キーボードナビゲーションを追加しました。さらに各タブボタンへ `id` / `aria-controls` / roving `tabIndex` / `focus-visible` リングを、本文領域へ `role="tabpanel"` / `id` / `aria-labelledby` / `tabIndex={0}` を実装しました。
* **66件目（`PortalInvitations.tsx`）**：ご家庭の個別URL・QR画面へアンマウント安全ガード付き（`useCallback` + `useRef`）の「一覧を再取得」ボタンを追加し、読み込み表示とQR生成中表示へ `role="status"` を付与、`URLをコピー` ボタンへ `disabled={!url}` と `disabled:opacity-50` を適用しました。
* **67件目（`LoginScreen.tsx`）**：「Googleでログイン」ボタンへ `aria-busy={busy}` と準備中ステータス表示（`Googleログインを準備しています…`）、デモ体験ボタンへ `disabled:opacity-50`、入口リンク・操作ボタン群へ `focus-visible:ring-2` を追加しました（Node VM 契約テスト互換の `useState` / `useEffect` 制約を維持）。

### 【今回実施した受入試験（65〜67項目目）】
* **65項目目（TermsModal WAI-ARIA `tabpanel`・矢印キー遷移・Escape閉鎖検証［公開デモ］）**：公開検証サイト（`https://eigo-taxi-test.web.app/#/admin`）の管理者デモで「利用規約」モーダルを開き、`overflow-x-auto`、`id`・`aria-controls`・`aria-labelledby`・roving `tabIndex` の設定、`ArrowRight` キーで「個人情報の取扱い」タブ・`terms-panel-privacy` へ切り替わること、および `Escape` キーで閉じることを確認しました。
* **66項目目（PortalInvitations 一覧再取得・QR維持・コピー制御スタイル検証［公開デモ］）**：公開検証サイトの「個別URL・QR」タブで「一覧を再取得」ボタン押下後も招待URL（`data-testid="invitation-url"`）とQR画像がエラーなく維持され、「URLをコピー」ボタンに `disabled:opacity-50` が適用されていることを確認しました。
* **67項目目（LoginScreen `aria-busy`・フォーカス／無効化スタイル・契約テスト検証［公開デモ＋オフライン契約］）**：公開検証サイトの入口（`#/admin`）で「Googleでログイン」の `aria-busy="false"`・フォーカスリング、および「管理者デモを開く」の `disabled:opacity-50`・フォーカスリングを確認し、あわせてオフライン契約テスト（`test_google_auth_retry_ui.cjs`、`test_portal_mismatch_ui.cjs`）の全項目合格を確認しました。

---

### 【公開環境・確認範囲】
* **検証サイト**: https://eigo-taxi-test.web.app/
* **反映版 (`sourceDigest`)**: `2a460013d0f44e6b0b8b0295874a6207e6591ee1889628ccf926cf65e493a3da`（ビルド時刻: `2026-11-21T11:39:29.136Z`）
* **配信照合**: [public-2026-11-21T11-40-36-149Z.json](../acceptance/deployment-verification/public-2026-11-21T11-40-36-149Z.json)（全7ファイル SHA-256 一致）
* **公開UI証跡**: [public-ui-sixtyseven.json](../../outputs/daily-20261121/public-ui-sixtyseven.json)
* **顧客確認・本番状況**: 小林様の顧客確認6手順（`CUST-01`〜`CUST-06`）は 0/6件（未実施）、顧客用の検証データはそのまま維持しており、**本番運用は開始していません**。
