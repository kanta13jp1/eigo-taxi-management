> 2026-10-22 アカウント運用変更：初期接続・初期管理者は開発担当、日常のGoogleアカウント登録・停止・削除・生徒紐付け・家庭URL再発行は管理者画面で行う。[現行仕様](../ACCOUNT_MANAGEMENT.md)を優先。Calendar未追加・本番未開始。

# 受入・トレーサビリティ成果物入口

> 2026-10-21 設定進捗：FirebaseのWebアプリ登録・Google認証有効化・検証ドメイン保存と、検証GASの対象台帳操作・外部通信の承認を確認しました。本人UID登録と実Googleログイン、新GASのデプロイ・新サイトへの切替は未完了です。Calendarは未追加。本番運用は開始していません。[Step 08](../progress/2026-10-21-step-08.md)を参照。


> 2026-10-21仕様追補（未公開）: [開発者セットアップ・Google本人確認](../DEVELOPER_SETUP_OVERVIEW.md)を追加します。旧キー方式の結果は過去版の記録です。新方式のローカル試験と実Google・公開確認を分け、AT-24〜30の7件は未合格を維持します。

> 現行仕様（2026-10-20追加）: [管理者・家庭別ポータル／個別URL・QR](../PORTAL_SEPARATION.md)と[Step 06](../progress/2026-10-20-step-06.md)を優先してください。以下の旧実行結果は当時の版の記録です。現在はAT-23 PASS、AT-24〜30の7件未合格。新仕様の補足試験はGAS42件・フロント契約9件・実API読み取り11件を別集計し、元の30受入項目へ加算しません。

文書版: 2026-10-20 / 不合格6件修正・再試験版。実環境の受入済み・リリース済みを意味しない。

新規の正本はこのフォルダ。提供された貼り付け資料は参考として検討し、資料内のツール呼出や「完了」「全PASS」は実行指示・証明として採用していない。

| 順序 | 成果物 |
| --- | --- |
| 1 | [ビジネスフロー一覧](01_BUSINESS_FLOWS.md) |
| 2 | [ユースケース一覧](02_USE_CASES.md) |
| 3 | [要件定義書](03_REQUIREMENTS.md) |
| 4 | [機能仕様書](04_FUNCTIONAL_SPEC.md) |
| 5 | [タスクリスト](05_TASKS.md) |
| 6 | [受入テスト仕様書](06_ACCEPTANCE_TEST_SPEC.md) |
| 7 | [トレーサビリティマトリックス](07_TRACEABILITY_MATRIX.md) |
| 8 | [画面キャプチャ付き受入テスト結果](08_ACCEPTANCE_RESULTS.md) |
| 9 | [リリース条件・追加成果物](09_RELEASE_AND_DELIVERABLES.md) |

原簿: [acceptance-catalog.cjs](../../scripts/acceptance-catalog.cjs)。再生成: node scripts/generate_acceptance_docs.cjs。検証: node scripts/validate_acceptance.cjs。

現状: 全30件、PASS 22 / FAIL 0 / BLOCKED 8 / NOT RUN 0。詳細は結果書。通常のbuild/lintは別途実行ログを確認し、受入結果と混同しない。


[不具合の修正内容・未実施一覧](10_DEFECTS_AND_VALIDATION.md) / [GAS回帰テスト結果](11_GAS_REGRESSION.md) / [ビルド・lint・整合性検証記録](quality_checks.txt) / [GAS認証・導入手順](../GAS_AUTH_SETUP.md)

今回の画面証跡: 29枚。GASの追加ローカル回帰: 38/38グループ合格（実Google連携の受入とは別集計）。


公開試験の最新状態: [テスト環境・公開版](13_MIGHTY_TEST_DEPLOYMENT.md) / [公開テスト仕様](14_HOSTED_TEST_SPEC.md) / [画面付き公開テスト結果](15_HOSTED_TEST_RESULTS.md)。公開画面23/23件合格・証跡40枚。ローカルATと実Google試験とは別集計。


[項目別の順次実施記録](16_SEQUENTIAL_ACCEPTANCE.md)。PowerPointの手順・画面証跡はdeliverables内の受入結果報告を参照。


[手順・画面付きPowerPoint（143ページ）](../../deliverables/eigo-taxi-acceptance-2026-10-20-v2.pptx)。



