# 11月21日 累計79件の実装修正・受入試験79項目（TeacherDashboard 地図/表/操作A11y / TermsModal フォーカス・アイコン非読み上げ化 / PortalInvitations 制御保護）

小林さん、お疲れ様です。

11月21日の追加対応により、実装修正は**累計79件**、実施した異なる受入試験は**累計79項目**となりました（先行2件は Claude Code Fable 5.2 の対応分、追加77件が後続の対応分です）。今回は Round 5 として Agent Swarms（`/swarm`、`workspace: "share"` による3ファイル並列実装＋独立 `verifier-5` 監査）を活用して実装・統合しました。

### 【今回の追加修正内容（77〜79件目）】
* **77件目（`TeacherDashboard.tsx`）**：本日画面の「地図アプリ」リンクへ `rel="noopener noreferrer"`・生徒名付き `aria-label`・`focus-visible:ring-2` を追加し、「送迎完了」ボタンへ `aria-busy={pendingRideIds.has(ride.id)}`・`disabled:opacity-50`・`focus-visible:ring-2` を適用しました。また、全送迎一覧テーブルへ `aria-label="全送迎スケジュール一覧"` と全7列見出しへの `scope="col"`、絞り込みセレクトおよび「チケット追加」「予約登録」「送迎予定を登録する」各操作ボタンへの `focus-visible:ring-2` を追加しました。
* **78件目（`TermsModal.tsx`）**：規約モーダル上部の閉じるボタン（`aria-label="閉じる"`）、スクロール可能な本文パネル（`role="tabpanel"`）、フッター「閉じる」ボタンへ `focus-visible:ring-2 focus-visible:ring-indigo-500` を統一し、モーダル内の装飾 Lucide アイコン5件すべてへ `aria-hidden="true"` を適用しました。
* **79件目（`PortalInvitations.tsx`）**：ご家庭の個別URL・QR画面で、配布先セレクト（`#invitation-family`）に再取得中の無効化（`disabled={loading}`・`disabled:opacity-50`）と `focus-visible:ring-2` を、「URLをコピー」ボタンに `disabled={loading || !url}` を、「一覧を再取得」「QR画像を保存」に `focus-visible:ring-2` を設定し、招待URL表示領域（`data-testid="invitation-url"`）へ `select-all` クラスを追加しました。

### 【今回実施した受入試験（77〜79項目目）】
* **77項目目（TeacherDashboard 地図リンク・テーブルヘッダー・操作フォーカス/処理中状態検証［公開デモ］）**：公開検証サイト（`https://eigo-taxi-test.web.app/#/admin`）の管理者デモで、一覧表 `aria-label`・7列 `scope="col"`・絞り込みフォーカスリング、生徒カード「チケット追加」「予約登録」のフォーカスリング、本日画面「地図アプリ」2件の `noopener noreferrer` / `aria-label` および「送迎完了」2件の `aria-busy="false"` / `disabled:opacity-50` / フォーカスリングを確認しました（`test_student_low_ticket_ui.cjs` の `LOWUI-01`〜`05` も合格）。
* **78項目目（TermsModal 閉じる/tabpanel フォーカス・装飾SVG非読み上げ検証［公開デモ］）**：公開検証サイトの「利用規約」モーダルを開き、閉じる2ボタンと `role="tabpanel"` の `focus-visible:ring-2`、およびダイアログ内 SVG 5件すべての `aria-hidden="true"` を確認しました。
* **79項目目（PortalInvitations 操作フォーカス・無効化・URL全選択クラス検証［公開デモ］）**：公開検証サイトの「個別URL・QR」タブで、`#invitation-family`・「一覧を再取得」・「URLをコピー」・「QR画像を保存」の `focus-visible:ring-2` / `disabled:opacity-50` および招待URL欄の `select-all` クラスを確認しました。

---

### 【公開環境・確認範囲】
* **検証サイト**: https://eigo-taxi-test.web.app/
* **反映版 (`sourceDigest`)**: `c8f324f349a5f035c7c7519258160335505388c71de9781505bc3fe7219a9f22`（ビルド時刻: `2026-11-21T13:51:21.219Z`）
* **配信照合**: [public-2026-11-21T13-53-05-102Z.json](../acceptance/deployment-verification/public-2026-11-21T13-53-05-102Z.json)（全7ファイル SHA-256 一致）
* **公開UI証跡**: [public-ui-seventynine.json](../../outputs/daily-20261121/public-ui-seventynine.json)
* **顧客確認・本番状況**: 小林様の顧客確認6手順（`CUST-01`〜`CUST-06`）は 0/6件（未実施）、顧客用の検証データはそのまま維持しており、**本番運用は開始していません**。
