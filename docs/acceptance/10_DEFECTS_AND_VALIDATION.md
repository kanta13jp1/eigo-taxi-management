> 2026-10-22 アカウント運用変更：初期接続・初期管理者は開発担当、日常のGoogleアカウント登録・停止・削除・生徒紐付け・家庭URL再発行は管理者画面で行う。[現行仕様](../ACCOUNT_MANAGEMENT.md)を優先。Calendar未追加・本番未開始。

# 不合格・未実施・検証記録（DOC-DEF-001）

> 2026-10-21 設定進捗：FirebaseのWebアプリ登録・Google認証有効化・検証ドメイン保存と、検証GASの対象台帳操作・外部通信の承認を確認しました。本人UID登録と実Googleログイン、新GASのデプロイ・新サイトへの切替は未完了です。Calendarは未追加。本番運用は開始していません。[Step 08](../progress/2026-10-21-step-08.md)を参照。


> 2026-10-21仕様追補（未公開）: [開発者セットアップ・Google本人確認](../DEVELOPER_SETUP_OVERVIEW.md)を追加します。旧キー方式の結果は過去版の記録です。新方式のローカル試験と実Google・公開確認を分け、AT-24〜30の7件は未合格を維持します。

> 現行仕様（2026-10-20追加）: [管理者・家庭別ポータル／個別URL・QR](../PORTAL_SEPARATION.md)と[Step 06](../progress/2026-10-20-step-06.md)を優先してください。以下の旧実行結果は当時の版の記録です。現在はAT-23 PASS、AT-24〜30の7件未合格。新仕様の補足試験はGAS42件・フロント契約9件・実API読み取り11件を別集計し、元の30受入項目へ加算しません。

文書版: 2026-10-20 / 不合格6件修正・再試験版。実環境の受入済み・リリース済みを意味しない。

重大度P1は運用開始前に解消する分類。初回2026-10-19の不合格6件を今回修正。担当: クライアント/画面はリード、GASとVM回帰は専任ワーカー。修正版は最新results.jsonのソースハッシュと作業ツリーで識別。フロントエンドはテスト環境へ公開済み。GASデプロイと実接続受入は未実施。

| 不具合ID・重大度・初回再現結果 | 今回の修正 | 要件・タスク・再試験 | 状態 |
| --- | --- | --- | --- |
| DEF-07 / P2: 公開版の保護者画面が指定375pxに対して388pxまで拡張。公開試験PUB-18で検出。 | 予定カードの左列にmin-w-0/flex-1、日付行に折返しを指定。実際の指定幅375pxとscrollWidth/innerWidthの両方を照合するようAT-21も強化。 | [BF-08](01_BUSINESS_FLOWS.md#BF-08) / [UC-21](02_USE_CASES.md#UC-21) / [REQ-21](03_REQUIREMENTS.md#REQ-21) / [FS-21](04_FUNCTIONAL_SPEC.md#FS-21) / [TASK-21](05_TASKS.md#TASK-21) / [AT-21](06_ACCEPTANCE_TEST_SPEC.md#AT-21) / [CODE-21](07_TRACEABILITY_MATRIX.md#CODE-21) / [TEST-21](06_ACCEPTANCE_TEST_SPEC.md#TEST-21) | 修正済み・ローカル再試験PASS（実環境の受入は未完了） |
| DEF-01 / P1: 同じ片道予約の完了2回で残高7→5（期待6）。終端状態確認・同一操作ID・サーバー側排他を実装。 | クライアント/GASでcompleted再処理は消費0として返す。GASはScriptLock内で状態・残高を読んで更新し、操作ID再送を検出。デモの予定自動復活も削除。 | [BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-15](02_USE_CASES.md#UC-15) / [REQ-15](03_REQUIREMENTS.md#REQ-15) / [FS-15](04_FUNCTIONAL_SPEC.md#FS-15) / [TASK-15](05_TASKS.md#TASK-15) / [AT-15](06_ACCEPTANCE_TEST_SPEC.md#AT-15) / [CODE-15](07_TRACEABILITY_MATRIX.md#CODE-15) / [TEST-15](06_ACCEPTANCE_TEST_SPEC.md#TEST-15) | 修正済み・ローカル再試験PASS（実環境の受入は未完了） |
| DEF-02 / P1: 取消済み予約を完了でき残高7→6。scheduled以外の完了をサーバー側で拒否。 | scheduledだけ完了可能とし、cancelledでは残高・状態を変更しない。GASが保存済み状態を確認する。 | [BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-16](02_USE_CASES.md#UC-16) / [REQ-16](03_REQUIREMENTS.md#REQ-16) / [FS-16](04_FUNCTIONAL_SPEC.md#FS-16) / [TASK-16](05_TASKS.md#TASK-16) / [AT-16](06_ACCEPTANCE_TEST_SPEC.md#AT-16) / [CODE-16](07_TRACEABILITY_MATRIX.md#CODE-16) / [TEST-16](06_ACCEPTANCE_TEST_SPEC.md#TEST-16) | 修正済み・ローカル再試験PASS（実環境の受入は未完了） |
| DEF-03 / P1: 負数チケット追加が成功扱い。正整数・許容金額をサーバーと入力画面で検証。 | 画面/API/GASで整数・有限値・1〜100枚・金額0以上を検証し、不正入力では履歴・残高を更新しない。 | [BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-17](02_USE_CASES.md#UC-17) / [REQ-17](03_REQUIREMENTS.md#REQ-17) / [FS-17](04_FUNCTIONAL_SPEC.md#FS-17) / [TASK-17](05_TASKS.md#TASK-17) / [AT-17](06_ACCEPTANCE_TEST_SPEC.md#AT-17) / [CODE-17](07_TRACEABILITY_MATRIX.md#CODE-17) / [TEST-17](06_ACCEPTANCE_TEST_SPEC.md#TEST-17) | 修正済み・ローカル再試験PASS（実環境の受入は未完了） |
| DEF-04 / P1: 通信失敗後も予約成功オブジェクトを返す。デモと実接続を分離し失敗の明示・安全な再試行・同期状態管理を実装。 | 実連携の失敗をthrowし、デモへ切替えない。全5更新操作の成功応答を検証。UIは失敗時にフォームとエラーを残す。取消も成功応答後に反映。再試行IDを保持。GASは補償と未確定操作ガードで不明な更新を成功扱いしない。 | [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18) | 修正済み・ローカル再試験PASS（実環境の受入は未完了） |
| DEF-05 / P1: 未認証で管理画面と生徒氏名を閲覧可能。管理者認証とサーバー側認可を実装。 | 個人専用の高エントロピーアクセスキーでログイン。キーはPOST本文、ブラウザではsessionStorageだけに保持。GASはScript PropertiesのSHA-256照合で毎要求を検証。未設定・不正キーは拒否。 | [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-19](02_USE_CASES.md#UC-19) / [REQ-19](03_REQUIREMENTS.md#REQ-19) / [FS-19](04_FUNCTIONAL_SPEC.md#FS-19) / [TASK-19](05_TASKS.md#TASK-19) / [AT-19](06_ACCEPTANCE_TEST_SPEC.md#AT-19) / [CODE-19](07_TRACEABILITY_MATRIX.md#CODE-19) / [TEST-19](06_ACCEPTANCE_TEST_SPEC.md#TEST-19) | 修正済み・ローカル再試験PASS（実環境の受入は未完了） |
| DEF-06 / P1: 利用者画面で別家庭の生徒を選択可能。家庭と生徒の紐付け・API所有者検証を実装。 | サーバー設定のrole/studentIdsで参照と更新を制限。保護者には管理メニューを出さず、自分の家庭以外への直接API要求も拒否。クライアント指定の役割・氏名・カレンダーIDは認可根拠にしない。 | [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-20](02_USE_CASES.md#UC-20) / [REQ-20](03_REQUIREMENTS.md#REQ-20) / [FS-20](04_FUNCTIONAL_SPEC.md#FS-20) / [TASK-20](05_TASKS.md#TASK-20) / [AT-20](06_ACCEPTANCE_TEST_SPEC.md#AT-20) / [CODE-20](07_TRACEABILITY_MATRIX.md#CODE-20) / [TEST-20](06_ACCEPTANCE_TEST_SPEC.md#TEST-20) | 修正済み・ローカル再試験PASS（実環境の受入は未完了） |


| 未実施 | 阻害要因 | 必要な対応 |
| --- | --- | --- |
| [AT-23](06_ACCEPTANCE_TEST_SPEC.md#AT-23) | 専用シート・GAS配備・権限が必要 | [TASK-23](05_TASKS.md#TASK-23) / initSpreadsheetを2回実行し生徒をWeb登録、シートを開く |
| [AT-24](06_ACCEPTANCE_TEST_SPEC.md#AT-24) | 専用GAS・カレンダーが必要 | [TASK-24](05_TASKS.md#TASK-24) / Webから予約しシート行と実カレンダー予定を開く |
| [AT-25](06_ACCEPTANCE_TEST_SPEC.md#AT-25) | AT-24の予約 | [TASK-25](05_TASKS.md#TASK-25) / 予約取消後にシートとカレンダーを開く |
| [AT-26](06_ACCEPTANCE_TEST_SPEC.md#AT-26) | 別セッション3台・権限分離・専用GAS | [TASK-26](05_TASKS.md#TASK-26) / 保護者予約 → 管理者A確認・完了 → 管理者Bと保護者が再取得 |
| [AT-27](06_ACCEPTANCE_TEST_SPEC.md#AT-27) | 独立管理者2セッション・専用GAS | [TASK-27](05_TASKS.md#TASK-27) / 同じ予約を両管理者から同時に完了 |
| [AT-28](06_ACCEPTANCE_TEST_SPEC.md#AT-28) | 専用テスト資源・保存先・担当者 | [TASK-28](05_TASKS.md#TASK-28) / バックアップ → テスト行変更 → 復元 → Web再取得 |
| [AT-29](06_ACCEPTANCE_TEST_SPEC.md#AT-29) | iPhone Safari・Android Chromeと受入担当者 | [TASK-29](05_TASKS.md#TASK-29) / 予約・取消・残高確認を各実機で実施 |
| [AT-30](06_ACCEPTANCE_TEST_SPEC.md#AT-30) | 全必須合格・受入確認・対象環境確定 | [TASK-30](05_TASKS.md#TASK-30) / リリース後URLで権限・予約・取消・連携・版を確認 |


初回の不合格・実行基盤異常の試行もruns内に保持する。最新の実行結果だけを今回の結果書に集計し、過去の画像を再試験証跡として流用しない。ビルド/lintは品質ログを参照。

追加検討: 残高不足時の予約受付・取消締切・時間枠重複・往復の片道実施・予約承認方式はDEC-02〜05の合意後にケースを追加する。今回の完了処理は不足分を消失させないため残高不足では拒否し、追加後に再実行する。業務上の最終合意は別途必要。


公開試験の最新状態: [テスト環境・公開版](13_MIGHTY_TEST_DEPLOYMENT.md) / [公開テスト仕様](14_HOSTED_TEST_SPEC.md) / [画面付き公開テスト結果](15_HOSTED_TEST_RESULTS.md)。公開画面23/23件合格・証跡40枚。ローカルATと実Google試験とは別集計。



