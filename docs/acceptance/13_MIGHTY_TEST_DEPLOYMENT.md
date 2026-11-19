> 2026-10-22 アカウント運用変更：初期接続・初期管理者は開発担当、日常のGoogleアカウント登録・停止・削除・生徒紐付け・家庭URL再発行は管理者画面で行う。[現行仕様](../ACCOUNT_MANAGEMENT.md)を優先。Calendar未追加・本番未開始。

# テスト環境・権限・デプロイ記録（DEP-01）

> 2026-10-21 設定進捗：FirebaseのWebアプリ登録・Google認証有効化・検証ドメイン保存と、検証GASの対象台帳操作・外部通信の承認を確認しました。本人UID登録と実Googleログイン、新GASのデプロイ・新サイトへの切替は未完了です。Calendarは未追加。本番運用は開始していません。[Step 08](../progress/2026-10-21-step-08.md)を参照。


> 2026-10-21仕様追補（未公開）: [開発者セットアップ・Google本人確認](../DEVELOPER_SETUP_OVERVIEW.md)を追加します。旧キー方式の結果は過去版の記録です。新方式のローカル試験と実Google・公開確認を分け、AT-24〜30の7件は未合格を維持します。

> 現行仕様（2026-10-20追加）: [管理者・家庭別ポータル／個別URL・QR](../PORTAL_SEPARATION.md)と[Step 06](../progress/2026-10-20-step-06.md)を優先してください。以下の旧実行結果は当時の版の記録です。現在はAT-23 PASS、AT-24〜30の7件未合格。新仕様の補足試験はGAS42件・フロント契約9件・実API読み取り11件を別集計し、元の30受入項目へ加算しません。

文書版: 2026-10-20 / マイティのテスト公開版。

公開URL: [マイティ送迎テスト環境](https://eigo-taxi-test.web.app/)。公開版ID: **deed2fc3d9a96297**。

| 確認ID | 項目 | 実測 |
| --- | --- | --- |
| ENV-01 | 組織 | ml-mightylink.com / organizations/943535207512 |
| ENV-02 | プロジェクト | eigo-taxi-app / 753038429305 / ACTIVE |
| ENV-03 | 操作アカウント | k-umezawa@ml-mightylink.com |
| ENV-04 | アクセス権限 | resourcemanager.projects.get, firebase.projects.get, firebasehosting.sites.get, firebasehosting.sites.list, firebasehosting.sites.create, firebasehosting.sites.update |
| DEP-01 | 公開先 | Firebase Hosting target mighty-test → eigo-taxi-test |
| DEP-02 | 版・構成 | サイト限定デプロイ。default site eigo-taxi-appは公開履歴なし。 |
| DEP-03 | 配信照合 | 7 URLのHTTP200・SHA-256一致 |
| DEP-04 | 修正ソース識別 | 14159ecc8b8a28e5618b802cad65d64778c63c22ab2b8db5417475e926081c35 |
| DEP-05 | ビルド時刻UTC | 2026-10-19T16:47:01.304Z |
| DEP-06 | 基点コミット | 2fa6127715017d52ae0c9bd80be39c4db90a47c3。修正は作業ツリーにあり、このコミットだけでは配信版を再現できない。保存済みソースを使う。 |

Cloud Resource ManagerとFirebase APIの会社アカウント認証で組織・プロジェクト・必要権限を照合し、同アカウントで実際の公開にも成功した。先行調査のgcloud認証ではアクセス拒否だったが、Firebase CLIの認証で確認できた。gcloudの設定変更は行っていない。

[権限・公開履歴の検証JSON](deployment/firebase-environment.json) / [作成前の記録](deployment/firebase-environment-before.json) / [デプロイ応答](deployment/firebase-deploy.json) / [配信照合](deployment/public-verification.json) / [ビルド・ソース一覧](deployment/build-manifest.json)。

版ごとのソース・配信ファイル・検証結果は[今回の保存版](deployment/releases/deed2fc3d9a96297/build-manifest.json)と前版54b056d14d7a5630に保存。切戻し対象は同じテストサイトの前版。Firebase Hostingのリリース履歴から前版へ戻し、配信ハッシュと画面を再確認する。実際の切戻し操作は未実施。

この公開はフロントエンドのテスト環境。GAS・専用シート・専用カレンダー・個人キーの実接続設定は未完了。実データでの運用開始条件は満たしていない。新規VMや本番サイトは作成していない。



