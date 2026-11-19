> 2026-10-22 アカウント運用変更：初期接続・初期管理者は開発担当、日常のGoogleアカウント登録・停止・削除・生徒紐付け・家庭URL再発行は管理者画面で行う。[現行仕様](../ACCOUNT_MANAGEMENT.md)を優先。Calendar未追加・本番未開始。

# 公開状態・貼り付け作業記録の検証（DOC-DEPLOY-VERIFY-001）

> 2026-10-21 設定進捗：FirebaseのWebアプリ登録・Google認証有効化・検証ドメイン保存と、検証GASの対象台帳操作・外部通信の承認を確認しました。本人UID登録と実Googleログイン、新GASのデプロイ・新サイトへの切替は未完了です。Calendarは未追加。本番運用は開始していません。[Step 08](../progress/2026-10-21-step-08.md)を参照。


> 2026-10-21仕様追補（未公開）: [開発者セットアップ・Google本人確認](../DEVELOPER_SETUP_OVERVIEW.md)を追加します。旧キー方式の結果は過去版の記録です。新方式のローカル試験と実Google・公開確認を分け、AT-24〜30の7件は未合格を維持します。

> 現行仕様（2026-10-20追加）: [管理者・家庭別ポータル／個別URL・QR](../PORTAL_SEPARATION.md)と[Step 06](../progress/2026-10-20-step-06.md)を優先してください。以下の旧実行結果は当時の版の記録です。現在はAT-23 PASS、AT-24〜30の7件未合格。新仕様の補足試験はGAS42件・フロント契約9件・実API読み取り11件を別集計し、元の30受入項目へ加算しません。

確認日: 2026-10-20 01:29 JST。対象: 提供されたFirebase公開・Issue完了・キャッシュ原因の説明。外部への操作は公開URLのHTTP GETとGitHub/GCPの読み取りだけ。デプロイ、API有効化、Hostingサイト作成、コミット、push、Issue更新は行っていない。

結論: **現在の公開状態は、記録の「公開完了」「正常稼働」「Issue #1〜#4がすべてCLOSED」と一致しない。最終テスト環境として案内できる状態は確認できていない。** 過去の一時的な公開の有無までは断定しない。

## 実測と記録の照合

| 確認ID | 作業記録の主張 | 今回の実測・判定 | 根拠 |
| --- | --- | --- | --- |
| DV-01 | eigo-taxi-app.web.app は200 OKで稼働 | HTTP 404 / Site Not Found | [HTTP結果](deployment-verification/20261020-012945/http-results.json)・[応答HTML 1](deployment-verification/20261020-012945/http-1.html) |
| DV-02 | 新しい eigo-taxi-test.web.app は確実に表示される | HTTP 404 / Site Not Found。保護者用クエリ付きでも同じ | [HTTP結果](deployment-verification/20261020-012945/http-results.json)・[応答HTML 2](deployment-verification/20261020-012945/http-2.html)・[応答HTML 4](deployment-verification/20261020-012945/http-4.html) |
| DV-03 | 別ドメインまたはindex.htmlなら表示される | eigo-taxi-app.firebaseapp.com と eigo-taxi-app.web.app/index.html も404 | [応答HTML 3](deployment-verification/20261020-012945/http-3.html)・[応答HTML 5](deployment-verification/20261020-012945/http-5.html) |
| DV-04 | 原因はブラウザの1時間キャッシュ／CDNネガティブキャッシュと判明 | 根拠不足。ユーザーのブラウザを使わないHTTPクライアントで再取得し、要求Cache-Control:no-cacheでも5件すべて404。今回の応答Cache-Controlはmax-age=0。「ブラウザのキャッシュだけ」と説明できず、配備先・公開版・権限等の確認が先。過去のヘッダーやCDN内部状態は不明 | [HTTP結果](deployment-verification/20261020-012945/http-results.json) |
| DV-05 | Firebase設定と機能をコミット・mainへpushした | 現在のリモートmainは2fa6127715017d52ae0c9bd80be39c4db90a47c3（2026-10-18の修正）。記録にあるFirebase追加コミットはmainの先頭にない。現在の作業フォルダにfirebase.json/.firebaserc/Firebase用npmスクリプトもない。別ブランチ・別フォルダ・別配備の有無は未確認 | [mainの実測](deployment-verification/20261020-012945/github-main.json)・[ローカル設定](deployment-verification/20261020-012945/local-config.json) |
| DV-06 | GitHub Issue #1〜#4はすべてCLOSED | #1〜#3はCLOSED、#4はOPEN。取得した#4イベントにはラベル追加2件だけがあり、closed/reopenedイベントはない | [Issue一覧](deployment-verification/20261020-012945/github-issues.json)・[Issue #4イベント](deployment-verification/20261020-012945/issue-4-events.json) |
| DV-07 | 会社組織のeigo-taxi-appプロジェクトに配備済み | gcloud projects describe eigo-taxi-app は現在の会社アカウントでアクセス拒否。「権限なし、または存在しない」という応答であり、所有組織・Hostingサイト・リリース履歴は未確認。プロジェクト不存在とは断定できない | 同日のgcloud読み取り実行結果。認証は通ったが対象へのアクセスが拒否された |
| DV-08 | ?student=STU-001 で安全な家庭別アクセス、Google連携も検証済み | 公開アプリが404のため実動作は検証不可。生徒IDのURL指定だけを本人認証とは認定しない。現在のローカル修正版は個別キーをGASで照合し、role/studentIdsをサーバーで制限する方式。Google実連携・家庭分離の実環境受入は未実施 | [修正後の受入結果](08_ACCEPTANCE_RESULTS.md)・[GAS認証手順](../GAS_AUTH_SETUP.md) |

HTTP結果には取得時刻、保存HTML名、保存HTMLのSHA-256を記録した。静的ページの到達確認と、GAS・シート・カレンダーの業務連携成功は区別する。記録内でも「GASをこれから接続」と説明する一方で「リアルタイム連動を検証済み」としており、後者を裏付ける実接続の証跡は提示されていない。

## 次に必要な対応

1. **DV-07 → AT-23〜27:** 正しいプロジェクトID、所有組織、会社アカウントの権限を確認する。現在は以前の再認証エラーから状況が変わり、対象プロジェクトへのアクセス拒否となっている。必要な権限があるアカウントで確認する。
2. **DV-01〜05 → AT-30:** Firebase Hostingの実サイトID・公開リリース・配備バージョンを読み取り確認し、対象ソースを特定する。必要なら修正版に対応する設定をレビュー可能な形で用意して、テスト先を限定して配備する。今回の検証だけでは配備していない。
3. **DV-08 → AT-23〜27:** 専用シート・カレンダーへ修正版GASを配備し、管理者2名・各家庭の個別キーとstudentIdsを設定する。未認証の旧GAS公開URLを残さない。
4. **AT-23〜29:** 実Google連携、別家庭・別端末、同時完了、復旧、実機の受入を実施する。ローカル22件とGAS VM38グループの合格は保持するが、この実環境確認の代替にしない。
5. **DV-06 / AT-30:** Issue #4は実際の対応範囲と残件を確認してから更新する。受入確認後の公開・公開後スモーク結果を残してリリース完了とする。

現段階では、小林様へ「最終テスト環境は正常公開済み」「実Google連動もすべて検証済み」と案内する根拠はない。案内するなら「専用環境の公開状態と権限を再確認中。確認できたURLとテスト手順を改めて共有する」とする。


後続検証: この文書は当時の未公開状態の記録。会社アカウントのFirebase認証で権限を確認し、テストサイトへ公開済み。[最新の環境・デプロイ記録](13_MIGHTY_TEST_DEPLOYMENT.md)を参照。



