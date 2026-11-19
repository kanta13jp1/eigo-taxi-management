> 2026-10-22 アカウント運用変更：初期接続・初期管理者は開発担当、日常のGoogleアカウント登録・停止・削除・生徒紐付け・家庭URL再発行は管理者画面で行う。[現行仕様](ACCOUNT_MANAGEMENT.md)を優先。Calendar未追加・本番未開始。

# 開発者側の初期設定とGoogle認証

> 2026-10-22 最新：管理者2名のGoogleログイン・台帳表示・再読込・ログアウト確認済み。管理者によるアカウント管理を検証サイトへ反映し、架空登録の作成・停止・有効化・URL再発行・削除を実測。旧キー認証は停止。[Step13](progress/2026-10-22-step-13.md)を優先。家庭別・第三者30件・AT24〜30は未合格。Calendar未追加・本番未開始。

> 2026-10-22 追記：認証方式は顧客確認待ち。第三者が全30件を実施し全件合格することを本番前条件に追加（第三者0/30）。公開先読込障害の追跡・異常応答ガード配信・PPT v15確認は[Step10](progress/2026-10-22-step-10.md)を参照。Calendar未追加・本番未開始。

> 2026-10-22 現在：会社管理者1名の実Googleログイン・台帳取得・再読込をローカルから実GASで確認。検証API v3と新サイト配信済み、公開識別子一致。公開先の実ログイン確認・旧認証無効化は未完了。Calendar未追加・本番未開始。[Step 09](progress/2026-10-22-step-09.md)を優先。


> 2026-10-21 設定進捗：FirebaseのWebアプリ登録・Google認証有効化・検証ドメイン保存と、検証GASの対象台帳操作・外部通信の承認を確認しました。本人UID登録と実Googleログイン、新GASのデプロイ・新サイトへの切替は未完了です。Calendarは未追加。本番運用は開始していません。[Step 08](progress/2026-10-21-step-08.md)を参照。


更新日: 2026-10-21 JST。実装・設定担当者向けの技術正本。

現時点ではローカル実装と模擬試験まで完了。FirebaseのWebアプリ登録、Googleプロバイダー有効化、GAS権限付与、利用者登録、公開環境への新方式の反映は未実施。`src/deployment-config.ts` の `firebase: null` は意図した未設定状態で、Googleログインは無効になる。公開中の旧版の状態とは区別する。

利用者向けの操作は[変更概要](DEVELOPER_SETUP_OVERVIEW.md)を参照。利用者がGAS URL、APIキー、長いアクセスキーを入力する手順は設けない。

## 1. 設定の配置

| 場所 | 内容 | 公開の扱い |
| --- | --- | --- |
| `src/deployment-config.ts` | 環境区分、GAS `/exec` URL、Firebase Web設定 | Web配布に含まれる公開値。個人キー・利用者一覧・秘密鍵は禁止 |
| GAS `AUTH_GOOGLE_JSON` | 検証先Firebase projectIdとIdentity Toolkit API用apiKey | サーバー設定。要求本文の値で上書きしない |
| GAS `AUTH_GOOGLE_USERS_JSON` | Firebase UIDをキーにした利用者・役割・生徒ID・家庭入口ID | サーバー専用。Web配布・資料・QRへ含めない |
| GAS `AUTH_USERS_JSON` | 旧方式のキーのSHA-256と利用者情報 | 移行用の既存設定。変更・破棄しない |
| GAS `AUTH_LEGACY_KEYS_ENABLED` | 文字列 `true` の場合だけ旧キー認証を許可 | 新方式は未設定/falseが既定。通常UIには旧キーログインを置かない |

ブラウザーの旧 `eigo_taxi_gas_api_url` 設定は参照しない。保存済みセッションの接続先やFirebase projectIdが配布設定と異なれば使用しない。接続先にはHTTPSの `script.google.com/macros/s/.../exec` のみを認め、クエリ、フラグメント、認証情報、`/dev` を拒否する。

Firebase Web設定の書式（実在する登録済みWebアプリから取得した公開値を使う）:

```ts
firebase: {
  apiKey: '登録済みWebアプリの公開APIキー',
  authDomain: 'eigo-taxi-app.firebaseapp.com',
  projectId: 'eigo-taxi-app',
  appId: '登録済みWebアプリのappId'
}
```

OAuth client secret、サービスアカウント秘密鍵、ユーザーのGoogleパスワードは不要。ブラウザー用APIキーにHTTP referrer制限がある場合、GASのサーバー照会にそのまま使えるとは限らない。既存制限を無断で緩めず、Identity Toolkit APIへの用途を限定したサーバー照会用の設定を用意して確認する。

## 2. サーバーの許可リスト

`AUTH_GOOGLE_JSON` の書式:

```json
{
  "projectId": "eigo-taxi-app",
  "apiKey": "Identity-Toolkit-API用の設定値"
}
```

`AUTH_GOOGLE_USERS_JSON` の構造例。以下のUID、名前、IDは説明用であり、そのまま登録しない。

```json
{
  "firebase-admin-uid": {
    "id": "admin-01",
    "name": "管理者A",
    "role": "admin",
    "studentIds": [],
    "active": true
  },
  "firebase-parent-uid": {
    "id": "parent-01",
    "name": "家庭A",
    "role": "parent",
    "studentIds": ["STU-001"],
    "publicEntryId": "acae06a7-bd96-4d85-8703-c42d9b3d3794",
    "active": true
  }
}
```

照合の正本は変更されないFirebase UID。メールアドレスや表示名だけの一致で権限を付与するフォールバックは実装しない。Google本人確認とFirebaseユーザーの検証済みメールを確認しても、UID未登録ならアプリのデータは返さない。Googleサインインの初回にFirebase側で認証ユーザーが作成されることと、アプリの利用許可は別である。

設定担当者が本人・Googleアカウント・Firebase UIDの対応を確認して事前登録する。本人UIDをまだ取得できない場合は開発者管理下でGoogle本人確認を行い、Firebase管理画面で対応を確認してから登録・再ログインする。教室利用者へキーを発行して回避しない。

既存の家庭A/B入口IDを移行先でも維持できる。現在のテスト家庭Bは `304adbf6-5096-450a-8bf7-2d9d175914c2`。体験用ID `00000000-0000-4000-8000-000000000001` は実利用者へ登録不可。家庭IDの重複・不正なUUIDも拒否する。管理者2名・家庭別保護者の本人アカウント/UIDは未確定で、現在の `admin-01` 等の表示IDをGoogle UIDとは扱わない。

## 3. 認証の処理

1. ログイン画面がFirebase初期化とセッション単位の永続化を準備する。準備後にボタンを有効化し、クリックの同期処理でGoogleポップアップを開始する。追加のGoogle業務権限は要求しない。
2. Googleで選択した本人のFirebase ID tokenを、設定済みGASへPOST本文の `idToken` として送る。URL・QRには含めない。
3. GASはJWTの形式、RS256、kid、設定プロジェクトのaud/iss、sub、有効期限、発行時刻、認証時刻、検証済みメール、Googleによるサインインを確認する。デコードだけでは本人確認済みとしない。
4. GASは固定URL `https://identitytoolkit.googleapis.com/v1/accounts:lookup` に同じID tokenを送り、Google側での検証成功を必須にする。呼び先の変更・リダイレクトは認めない。
5. 成功応答はユーザー1件、UID=sub、未無効化、検証済みメール、Google provider、非tenantであることを確認する。`validSince` より古い `iat` または `auth_time` を拒否し、失効前のログインから更新されたトークンも通さない。
6. サーバー許可リストから役割、生徒ID、家庭IDを取得し、入口と照合する。利用者が送ったrole/studentIds/projectId/apiKeyは権限判定に使わない。
7. 各データAPIでもGoogle検証と許可リスト照合を実施する。許可・認証結果をキャッシュしない。

ブラウザーはリクエストごとにFirebase SDKから現在のID tokenを取得し、SDKが期限切れ前後の更新を担当する。独自アプリセッションにID tokenや旧アクセスキーは保存しない。Firebase SDKの認証状態は当該ブラウザーセッション内に保存される。再読込時にもサーバーで権限を照合する。ログアウトはアプリ状態とFirebaseの双方を終了し、ログアウト後に届いた古いログイン応答は破棄する。

ポップアップ拒否、キャンセル、通信失敗、認証サービス障害は失敗として表示する。データのデモへの自動切替はない。Safari/Chrome、スマートフォン、第三者Cookie制限、再読込、複数端末の実機試験は外部設定後に行う。

## 4. 外部設定前の確認事項

予定対象は検証プロジェクト `eigo-taxi-app`、Hostingサイト `eigo-taxi-test`。現時点の読み取りでは登録Webアプリ0件で、Auth設定は未実施。

必要な外部変更:

1. 対象プロジェクトへのWebアプリ登録。Googleをサインインプロバイダーとして有効化し、必要なOAuth同意画面の表示と連絡先を確認する。
2. 利用するHostingドメインをFirebase Authenticationの許可ドメインへ登録する。検証は `eigo-taxi-test.web.app` が対象で、未使用ドメインを追加しない。
3. 既存の検証GASとそのスクリプトプロパティを保全して、本人確認API用の設定・UID許可リストを設定する。
4. GASに `https://www.googleapis.com/auth/script.external_request` を追加し、Identity ToolkitへPOSTできるようスクリプト所有者が承認する。
5. テスト環境へ新GASとWeb版を対応する組で反映し、実Google本人確認と家庭分離を受け入れる。

`gas/appsscript.json` は検証段階の最小スコープとして `spreadsheets.currentonly` と `script.external_request` を記載する。Calendarは含めていない。既存GASの保存済みマニフェストと差分を確認してから反映し、他のプロジェクトや本番へコピーしない。このマニフェストでは実カレンダーの予約・取消は完了しない。

Calendarの権限付与と実受入は別の未完了作業。旧AT-23のPASS、AT-24〜30の7件未合格は変更しない。新しい認証試験のPASSを実Google連携や業務受入のPASSへ読み替えない。

## 5. 検証・移行

ローカル実行にはFirebase 13の要件を満たすNode 24.12以上を使用する。今回の確認は同梱Node 24.19.0。CIもNode 24へ合わせる。

```powershell
# テスト証跡を旧版の保存先へ上書きしない
$env:EIGO_TEST_OUTPUT_DIR = 'docs/acceptance/developer-setup-2026-10-21/gas'
node scripts/test_gas.cjs
node scripts/test_portals.cjs
node scripts/test_google_auth.cjs
```

GASの54件は旧業務・権限・障害注入42件とGoogle認証契約12件。フロント契約17件は役割・家庭入口・設定欠落・保存先改変・トークン更新・失効・ログアウト競合を含む。SDK境界6件は準備・同期popup呼出・権限追加なしのprovider設定・トークン取得・エラー・ログアウトを確認する。いずれも模擬応答によるローカル試験であり、Googleの実署名検証やポップアップ実機動作の証拠ではない。

旧版からの切替前に、旧キー資料/暗号化保存と現在のGAS設定を保持する。必要な限定移行試験だけ `AUTH_LEGACY_KEYS_ENABLED=true` を設定し、Google版の受入後は削除またはfalseにする。通常利用者へキーの配布や貼付を依頼しない。新旧の入口ID、生徒紐付け、無効化情報を照合し、設定全体の再作成で既存値を消さない。

## 6. 公式資料

- [Firebase: GoogleによるWeb認証](https://firebase.google.com/docs/auth/web/google-signin) — プロバイダー有効化、Web SDK、popup/redirectの仕様。
- [Firebase: ID tokenの検証](https://firebase.google.com/docs/auth/admin/verify-id-tokens) — issuer/audience/expiry等の検証条件。
- [Firebase: REST認証API](https://firebase.google.com/docs/reference/rest/auth) — ID tokenを使ったアカウント情報取得。
- [Identity Platform: accounts.lookup](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v1/accounts/lookup) — Googleによるトークン検証を伴うアカウント照会。
- [Identity Platform: UserInfo](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v1/UserInfo) — localId、disabled、emailVerified、validSinceの意味。
- [Firebase: ユーザーセッション管理](https://firebase.google.com/docs/auth/admin/manage-sessions) — セッション失効とauth_timeを含む確認。
- [Apps Script: UrlFetchApp](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app) — 外部通信スコープ。




