# 画面ID・I/F一覧と画面遷移

2026-10-23。既存実装を文書化した管理ID。画面上へのID表示、URL・アプリ・外部設定の変更は行っていない。

## 処理の区分

- 手動：実送迎、対面・電話等の連絡、判断・承認、証跡記録。
- 画面：人が入力・クリック・閲覧する。操作後の認証・保存・計算は自動処理。
- 自動：GASによる権限判定、台帳・設定更新、完了時の消費計算。
- 画面＋手動／判断：画面取得後の本人配布や照合・復旧など人の判断を含む。自動実行機能と解釈しない。

業務図では画面ノードとシステム向け矢印の起点付近に画面ID／I/F-IDを併記。人同士の矢印はAPI通信ではない。

## 画面一覧

| ID | 画面 | 利用者 | 実装・入口 | 操作 |
|---|---|---|---|---|
| C01 | 入口案内 | 未ログイン | #/ ／ 不正URL | 管理者・保護者入口へ |
| C02 | 利用規約・個人情報・免責 | 共通 | TermsModal内タブ | 元画面へ閉じる |
| A01 | 管理者ログイン | 管理者 | #/admin | Google認証後A02 |
| A02 | 本日の送迎 | 管理者 | TeacherDashboard today | 完了・予約・購入 |
| A03 | 送迎予定・履歴一覧 | 管理者 | 同allRidesタブ | 一覧・完了・取消 |
| A04 | 生徒・チケット管理 | 管理者 | 同studentsタブ | 生徒登録・追加購入 |
| A05 | 個別URL・QR | 管理者 | PortalInvitations | コピー・QR表示 |
| A06 | アカウント一覧・編集 | 管理者 | AccountManagement | 追加・停止・削除・再発行 |
| A07 | Google連携情報 | 管理者 | GoogleSettings | 接続情報表示／デモ初期化 |
| P01 | 保護者ログイン | 保護者 | #/parent[/個別ID] | Google認証後P02 |
| P02 | 家庭専用ページ | 保護者 | ParentPortal | 兄弟選択・予約・残数・取消 |
| D01 | 送迎予約入力 | 両者 | AddRideModal | 送信後、呼出元へ |
| D02 | チケット追加入力 | 管理者 | AddTicketModal | 送信後、呼出元へ |
| D03 | 生徒新規入力 | 管理者 | AddStudentModal | 送信後、呼出元へ |
| D04 | アカウント変更確認 | 管理者 | A06内の確認dialog | 保存／削除→A06 |
| D05 | 取消確認 | 両者 | window.confirm | OK→取消、戻る→元画面 |
| E01 | Googleアカウント選択 | 外部 | Firebase Auth popup | 認証成功／中止を返す |
| E02 | Googleカレンダー | 外部 | Google Calendar | 当日の予定を人が確認 |
| E03 | Googleスプレッドシート | 外部 | Google Sheets | 保守修正・保全・照合 |
| E04 | 導入・保守設定 | 外部 | Firebase Console／GAS | 初期設定・緊急復旧 |

A02〜A07は同じ管理者URL内の状態で、独立ページURLではない。A02〜04はTeacherDashboard内タブ。P02の兄弟選択や履歴も同一画面。D01〜03はモーダル。D04はA06内の確認dialog、D05はwindow.confirm。完了ボタンに専用確認ダイアログはない。エラーは元画面の状態で独立画面IDを増やさない。

## I/F一覧

| ID | 起点・終点 | 手段・action | 内容 |
|---|---|---|---|
| IF-01 | A01/P01→E01→GAS | Firebase認証＋login | Google本人確認、役割・家庭・有効状態照合 |
| IF-02 | D01→GAS | createReservation | 生徒・日時・区分・場所・メモ→予定／結果 |
| IF-03 | A02〜04/P02→GAS | getStudents / getRides | 権限に応じた生徒・送迎一覧を取得 |
| IF-04 | D03→GAS | createStudent | 生徒情報・初期残数→生徒台帳 |
| IF-05 | D05→GAS | cancelReservation | 送迎ID→取消状態・予定削除 |
| IF-06 | A02/A03→GAS | completeRide | 送迎ID→片道1／往復2消費・完了履歴 |
| IF-07 | A05→GAS／端末内 | getPortalInvitations | 専用URL取得。QRは端末内生成・コピー |
| IF-08 | A06/D04→GAS | getManagedUsers / saveManagedUser / deleteManagedUser | 一覧取得・保存・削除・再発行（管理者限定） |
| IF-09 | GAS→Script Properties | PropertiesService | Google許可設定・更新ガードを保存 |
| IF-10 | D02→GAS | addTickets | 生徒・枚数・金額→残数・購入履歴更新 |
| IF-11 | GAS→台帳 | SpreadsheetApp | 生徒・送迎・購入の各シートを読書き |
| IF-12 | ログアウト操作→SDK | session消去＋signOut | アプリ状態消去・Firebaseログアウト |
| IF-13 | GAS⇄Google Calendar | CalendarApp | 予定説明欄へ予約IDを記載して作成、イベントIDを台帳に保持しID指定削除。実受入未完了 |
| IF-14 | 人→E03→サイト再読込 | 外部画面で直接編集 | 保守修正。自動計算・予定同期は実行しない |
| IF-15 | 人→E04 | 導入担当の外部画面操作 | 初期Google接続・認証・初期管理者設定 |
| IF-16 | 送迎担当→E02 | Google Calendarの画面 | 予定を人が閲覧。当アプリのAPI呼出しなし |

## 共通通信仕様

GAS向けの通信はHTTPS POST、Content-Type: text/plain;charset=utf-8。本文はJSONでaction・idToken・portalRole・必要時entryIdと業務パラメータを送り、JSONでsuccess・dataまたはerror/code等を受け取る。認証とデータAPIのGET呼出しではない。毎リクエストで役割・有効状態・生徒範囲を照合。20秒のクライアントタイムアウト。結果不明時は一覧照合後に判断する。秘密値を資料へ記録しない。

IF-01にはFirebase SDKのGoogle OAuth popupとGAS loginの二段階がある。IF-07はAPI取得後のURL作成・QR生成を端末内で行う。IF-12はアプリsession消去とFirebase signOutでGoogleアカウント自体の削除ではない。IF-13はサーバーのCalendarApp、IF-16は人の外部カレンダー閲覧で別経路。2026-11-03のユーザー回答によりIF-13の予定説明欄へ予約IDを表示する仕様を明確化した。検証環境への反映と実Calendarでの受入確認は未完。

## 画面遷移のルール

- C01→A01またはP01。家庭別URL／QRはP01へ直接入る。
- A01/P01→E01。認証成功とGAS照合後、初期表示はA02/P02。中止・拒否はログイン画面内エラー。管理者の同じアプリタブでは以前の選択タブが残る場合がある。
- 管理者はA02〜A07をメニューで相互表示。A02/A03/A04は業務タブであり順番に踏む必要はない。
- A02〜04→D01/D02、A04→D03。成功・閉じるは呼出元へ。保存失敗はモーダル内にエラー。
- A02/A03の完了は直接IF-06。取消はA03/P02→D05でOK後IF-05→一覧再取得。A02に取消ボタンはない。
- A06の一覧・入力→D04。保存／削除成功はA06、競合・失敗はエラーと一覧再取得。URL再発行もsaveManagedUserの操作。
- A05は同じ画面でURLコピーとQR表示。本人への配布は手動。A07に通常利用者向けの接続URL／キー入力はない。
- A02〜A07/P02→C02、閉じるで呼出元。ログアウトはセッションと業務データ表示を消し、同じ役割のログインへ。
- 再読込・hash変更はセッションと入口の再検証。保護者に管理者画面への切替メニューはない。
- デモはログイン入口から別のmodeで入る架空データ。実GAS連携への自動切替はない。

## 参照元と検証境界

src/App.tsx、portal.ts、components/{LoginScreen,TeacherDashboard,ParentPortal,AccountManagement,PortalInvitations,GoogleSettings,AddRideModal,AddTicketModal,AddStudentModal,TermsModal}.tsx、services/api.ts、services/google-auth.ts、gas/Code.gsを照合。図・画面一覧・I/F一覧はネイティブ編集可能。PPTの構造・配置・フォント・表・再取込検証と全スライド描画を確認。これは実ブラウザーの追加受入試験ではない。Calendar権限追加・本番開始なし。未合格受入や復元後管理者再ログインの状態は変更しない。

## 2026-11-07追加：随時実施する検証担当

REQ-39の検証担当だけ、同じ本人GoogleアカウントがA01とP01の固定入口を選べる。通常の管理者・保護者の分離ルールは維持する。検証担当の管理者入口はA03を初期表示し、A04/D01/D02と割当生徒の取消・完了を利用できる。A05/A06/A07/D03/D04には入れない。画面の非表示に加え、GASが各I/Fで検証台帳IDと割当生徒・現在の有効状態を再判定する。家庭入口では完了・チケット追加も拒否する。画面ID・I/F-IDの追加はせず、対応はFS-39へ記録する。

人の操作は「いまの画面でログアウト→もう一方の固定URL→同じGoogleでログイン」。実施中の管理者による役割変更は不要。固定日の模擬実績2件はA03で特定し、日付を過ぎても確認する。中断後は共有表と再取得した予約状態・残数を人が照合し、未実施の続きだけ進める。Calendar閲覧は専用Calendarの共有権限で、アプリの生徒範囲制限とは独立する。

[設計と状態別の再開手順](acceptance/SELF_PACED_CUSTOMER_REVIEW_20261107.md)
