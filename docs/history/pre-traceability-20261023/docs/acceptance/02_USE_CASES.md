> 2026-10-22 アカウント運用変更：初期接続・初期管理者は開発担当、日常のGoogleアカウント登録・停止・削除・生徒紐付け・家庭URL再発行は管理者画面で行う。[現行仕様](../ACCOUNT_MANAGEMENT.md)を優先。Calendar未追加・本番未開始。

# ユースケース一覧（DOC-UC-001）

> 2026-10-21 設定進捗：FirebaseのWebアプリ登録・Google認証有効化・検証ドメイン保存と、検証GASの対象台帳操作・外部通信の承認を確認しました。本人UID登録と実Googleログイン、新GASのデプロイ・新サイトへの切替は未完了です。Calendarは未追加。本番運用は開始していません。[Step 08](../progress/2026-10-21-step-08.md)を参照。


> 2026-10-21仕様追補（未公開）: [開発者セットアップ・Google本人確認](../DEVELOPER_SETUP_OVERVIEW.md)を追加します。旧キー方式の結果は過去版の記録です。新方式のローカル試験と実Google・公開確認を分け、AT-24〜30の7件は未合格を維持します。

> 現行仕様（2026-10-20追加）: [管理者・家庭別ポータル／個別URL・QR](../PORTAL_SEPARATION.md)と[Step 06](../progress/2026-10-20-step-06.md)を優先してください。以下の旧実行結果は当時の版の記録です。現在はAT-23 PASS、AT-24〜30の7件未合格。新仕様の補足試験はGAS42件・フロント契約9件・実API読み取り11件を別集計し、元の30受入項目へ加算しません。

文書版: 2026-10-20 / 不合格6件修正・再試験版。実環境の受入済み・リリース済みを意味しない。

アクター: ACT-01 管理者Mauro、ACT-02 管理者Brenda、ACT-03 生徒・保護者、ACT-04 導入・運用担当、ACT-05 Google連携。主担当は業務フローの担当者に準ずる。

<a id="UC-01"></a>
## UC-01 Google連携先の設定保存

[BF-01](01_BUSINESS_FLOWS.md#BF-01) / [UC-01](02_USE_CASES.md#UC-01) / [REQ-01](03_REQUIREMENTS.md#REQ-01) / [FS-01](04_FUNCTIONAL_SPEC.md#FS-01) / [TASK-01](05_TASKS.md#TASK-01) / [AT-01](06_ACCEPTANCE_TEST_SPEC.md#AT-01) / [CODE-01](07_TRACEABILITY_MATRIX.md#CODE-01) / [TEST-01](06_ACCEPTANCE_TEST_SPEC.md#TEST-01)

事前条件: テスト用URLのみ使用。

基本フロー: Google連携画面でURLを入力し保存・再読込。

事後条件: 保存したURLが再読込後も一致。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-02"></a>
## UC-02 生徒登録

[BF-02](01_BUSINESS_FLOWS.md#BF-02) / [UC-02](02_USE_CASES.md#UC-02) / [REQ-02](03_REQUIREMENTS.md#REQ-02) / [FS-02](04_FUNCTIONAL_SPEC.md#FS-02) / [TASK-02](05_TASKS.md#TASK-02) / [AT-02](06_ACCEPTANCE_TEST_SPEC.md#AT-02) / [CODE-02](07_TRACEABILITY_MATRIX.md#CODE-02) / [TEST-02](06_ACCEPTANCE_TEST_SPEC.md#TEST-02)

事前条件: ダミー台帳。

基本フロー: 生徒登録画面で氏名・保護者・住所・連絡先・初期10回を登録。

事後条件: 生徒が1件増え全入力値と初期残高10が保存される。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-03"></a>
## UC-03 保護者の残数確認

[BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-03](02_USE_CASES.md#UC-03) / [REQ-03](03_REQUIREMENTS.md#REQ-03) / [FS-03](04_FUNCTIONAL_SPEC.md#FS-03) / [TASK-03](05_TASKS.md#TASK-03) / [AT-03](06_ACCEPTANCE_TEST_SPEC.md#AT-03) / [CODE-03](07_TRACEABILITY_MATRIX.md#CODE-03) / [TEST-03](06_ACCEPTANCE_TEST_SPEC.md#TEST-03)

事前条件: 初期生徒STU-001が7回。

基本フロー: 利用者画面で生徒を選択。

事後条件: 氏名と7回分・片道1枚の説明が表示される。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-04"></a>
## UC-04 残少・ゼロ案内

[BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-04](02_USE_CASES.md#UC-04) / [REQ-04](03_REQUIREMENTS.md#REQ-04) / [FS-04](04_FUNCTIONAL_SPEC.md#FS-04) / [TASK-04](05_TASKS.md#TASK-04) / [AT-04](06_ACCEPTANCE_TEST_SPEC.md#AT-04) / [CODE-04](07_TRACEABILITY_MATRIX.md#CODE-04) / [TEST-04](06_ACCEPTANCE_TEST_SPEC.md#TEST-04)

事前条件: 残高2・1・0の各生徒。

基本フロー: 各残高で利用者画面を開く。

事後条件: 各値でMauro・Brendaへの連絡案内が表示される。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-05"></a>
## UC-05 チケット追加

[BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-05](02_USE_CASES.md#UC-05) / [REQ-05](03_REQUIREMENTS.md#REQ-05) / [FS-05](04_FUNCTIONAL_SPEC.md#FS-05) / [TASK-05](05_TASKS.md#TASK-05) / [AT-05](06_ACCEPTANCE_TEST_SPEC.md#AT-05) / [CODE-05](07_TRACEABILITY_MATRIX.md#CODE-05) / [TEST-05](06_ACCEPTANCE_TEST_SPEC.md#TEST-05)

事前条件: 初期残高7。

基本フロー: 10回を追加し台帳・購入履歴を確認。

事後条件: 残高17、履歴1件増、枚数10・金額・備考一致。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-06"></a>
## UC-06 保護者のお迎え予約

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-06](02_USE_CASES.md#UC-06) / [REQ-06](03_REQUIREMENTS.md#REQ-06) / [FS-06](04_FUNCTIONAL_SPEC.md#FS-06) / [TASK-06](05_TASKS.md#TASK-06) / [AT-06](06_ACCEPTANCE_TEST_SPEC.md#AT-06) / [CODE-06](07_TRACEABILITY_MATRIX.md#CODE-06) / [TEST-06](06_ACCEPTANCE_TEST_SPEC.md#TEST-06)

事前条件: 残高7・明示選択したデモ。

基本フロー: 利用者画面から2026-10-20 16:30・お迎え・登録済み住所を使って予約。

事後条件: 新規予約1件、scheduled、parent、残高7のまま。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-07"></a>
## UC-07 送り予約

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-07](02_USE_CASES.md#UC-07) / [REQ-07](03_REQUIREMENTS.md#REQ-07) / [FS-07](04_FUNCTIONAL_SPEC.md#FS-07) / [TASK-07](05_TASKS.md#TASK-07) / [AT-07](06_ACCEPTANCE_TEST_SPEC.md#AT-07) / [CODE-07](07_TRACEABILITY_MATRIX.md#CODE-07) / [TEST-07](06_ACCEPTANCE_TEST_SPEC.md#TEST-07)

事前条件: 残高7・未接続デモ。

基本フロー: サービス経由で送り17:30を登録し画面を再表示。

事後条件: dropoffの予約が1件増え、残高7のまま。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-08"></a>
## UC-08 往復予約

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-08](02_USE_CASES.md#UC-08) / [REQ-08](03_REQUIREMENTS.md#REQ-08) / [FS-08](04_FUNCTIONAL_SPEC.md#FS-08) / [TASK-08](05_TASKS.md#TASK-08) / [AT-08](06_ACCEPTANCE_TEST_SPEC.md#AT-08) / [CODE-08](07_TRACEABILITY_MATRIX.md#CODE-08) / [TEST-08](06_ACCEPTANCE_TEST_SPEC.md#TEST-08)

事前条件: 残高7・未接続デモ。

基本フロー: サービス経由で往復を登録し画面を再表示。

事後条件: roundtripの予約が1件増え、予約時残高7のまま。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-09"></a>
## UC-09 管理者の代理予約

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-09](02_USE_CASES.md#UC-09) / [REQ-09](03_REQUIREMENTS.md#REQ-09) / [FS-09](04_FUNCTIONAL_SPEC.md#FS-09) / [TASK-09](05_TASKS.md#TASK-09) / [AT-09](06_ACCEPTANCE_TEST_SPEC.md#AT-09) / [CODE-09](07_TRACEABILITY_MATRIX.md#CODE-09) / [TEST-09](06_ACCEPTANCE_TEST_SPEC.md#TEST-09)

事前条件: 初期台帳。

基本フロー: 管理者画面から日時・生徒・場所を指定して予約。

事後条件: 新規予約1件、reservedBy=teacher。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-10"></a>
## UC-10 保護者の予約取消

[BF-05](01_BUSINESS_FLOWS.md#BF-05) / [UC-10](02_USE_CASES.md#UC-10) / [REQ-10](03_REQUIREMENTS.md#REQ-10) / [FS-10](04_FUNCTIONAL_SPEC.md#FS-10) / [TASK-10](05_TASKS.md#TASK-10) / [AT-10](06_ACCEPTANCE_TEST_SPEC.md#AT-10) / [CODE-10](07_TRACEABILITY_MATRIX.md#CODE-10) / [TEST-10](06_ACCEPTANCE_TEST_SPEC.md#TEST-10)

事前条件: 保護者予約1件・残高7。

基本フロー: 利用者画面で対象予約をキャンセルし確認を承諾。

事後条件: 対象IDがcancelled、残高7のまま。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-11"></a>
## UC-11 管理者の予約取消

[BF-05](01_BUSINESS_FLOWS.md#BF-05) / [UC-11](02_USE_CASES.md#UC-11) / [REQ-11](03_REQUIREMENTS.md#REQ-11) / [FS-11](04_FUNCTIONAL_SPEC.md#FS-11) / [TASK-11](05_TASKS.md#TASK-11) / [AT-11](06_ACCEPTANCE_TEST_SPEC.md#AT-11) / [CODE-11](07_TRACEABILITY_MATRIX.md#CODE-11) / [TEST-11](06_ACCEPTANCE_TEST_SPEC.md#TEST-11)

事前条件: 予約1件。

基本フロー: サービス経由で取消後に管理画面を再表示。

事後条件: 対象IDがcancelled、残数不変。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-12"></a>
## UC-12 当日一覧・地図リンク

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-12](02_USE_CASES.md#UC-12) / [REQ-12](03_REQUIREMENTS.md#REQ-12) / [FS-12](04_FUNCTIONAL_SPEC.md#FS-12) / [TASK-12](05_TASKS.md#TASK-12) / [AT-12](06_ACCEPTANCE_TEST_SPEC.md#AT-12) / [CODE-12](07_TRACEABILITY_MATRIX.md#CODE-12) / [TEST-12](06_ACCEPTANCE_TEST_SPEC.md#TEST-12)

事前条件: 初期当日予約。

基本フロー: 管理者画面を開き地図リンクを調べる。

事後条件: 当日予約とGoogle Maps検索URLが表示される（地図先の動作は対象外）。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-13"></a>
## UC-13 片道完了

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-13](02_USE_CASES.md#UC-13) / [REQ-13](03_REQUIREMENTS.md#REQ-13) / [FS-13](04_FUNCTIONAL_SPEC.md#FS-13) / [TASK-13](05_TASKS.md#TASK-13) / [AT-13](06_ACCEPTANCE_TEST_SPEC.md#AT-13) / [CODE-13](07_TRACEABILITY_MATRIX.md#CODE-13) / [TEST-13](06_ACCEPTANCE_TEST_SPEC.md#TEST-13)

事前条件: 残高7・お迎え予約。

基本フロー: サービス経由で完了後に画面を再表示。

事後条件: completed・完了日時あり・残高6。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-14"></a>
## UC-14 往復完了

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-14](02_USE_CASES.md#UC-14) / [REQ-14](03_REQUIREMENTS.md#REQ-14) / [FS-14](04_FUNCTIONAL_SPEC.md#FS-14) / [TASK-14](05_TASKS.md#TASK-14) / [AT-14](06_ACCEPTANCE_TEST_SPEC.md#AT-14) / [CODE-14](07_TRACEABILITY_MATRIX.md#CODE-14) / [TEST-14](06_ACCEPTANCE_TEST_SPEC.md#TEST-14)

事前条件: 残高7・往復予約。

基本フロー: サービス経由で往復完了後に画面を再表示。

事後条件: completed・残高5・消費2。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-15"></a>
## UC-15 完了の二重処理防止

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-15](02_USE_CASES.md#UC-15) / [REQ-15](03_REQUIREMENTS.md#REQ-15) / [FS-15](04_FUNCTIONAL_SPEC.md#FS-15) / [TASK-15](05_TASKS.md#TASK-15) / [AT-15](06_ACCEPTANCE_TEST_SPEC.md#AT-15) / [CODE-15](07_TRACEABILITY_MATRIX.md#CODE-15) / [TEST-15](06_ACCEPTANCE_TEST_SPEC.md#TEST-15)

事前条件: 管理者デモ・残高7・片道予約。

基本フロー: 同じ予約IDに完了を2回要求。

事後条件: 最終残高6、completedを保持、再処理の消費枚数0。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-16"></a>
## UC-16 取消済みの完了拒否

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-16](02_USE_CASES.md#UC-16) / [REQ-16](03_REQUIREMENTS.md#REQ-16) / [FS-16](04_FUNCTIONAL_SPEC.md#FS-16) / [TASK-16](05_TASKS.md#TASK-16) / [AT-16](06_ACCEPTANCE_TEST_SPEC.md#AT-16) / [CODE-16](07_TRACEABILITY_MATRIX.md#CODE-16) / [TEST-16](06_ACCEPTANCE_TEST_SPEC.md#TEST-16)

事前条件: 残高7・取消済み予約。

基本フロー: 取消済みIDを完了要求。

事後条件: cancelledを保持し残高7のまま。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-17"></a>
## UC-17 不正なチケット追加拒否

[BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-17](02_USE_CASES.md#UC-17) / [REQ-17](03_REQUIREMENTS.md#REQ-17) / [FS-17](04_FUNCTIONAL_SPEC.md#FS-17) / [TASK-17](05_TASKS.md#TASK-17) / [AT-17](06_ACCEPTANCE_TEST_SPEC.md#AT-17) / [CODE-17](07_TRACEABILITY_MATRIX.md#CODE-17) / [TEST-17](06_ACCEPTANCE_TEST_SPEC.md#TEST-17)

事前条件: 管理者デモ・残高7。

基本フロー: 枚数に-1/0/小数/NaN/Infinity/101、金額に負数/小数/NaN/Infinityを渡す。

事後条件: 全要求が拒否され残高7・購入履歴が不変。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-18"></a>
## UC-18 通信障害時に成功扱いしない

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

事前条件: ローカル模擬APIへのログイン・通信障害注入。

基本フロー: 全5更新POSTを通信失敗させる。業務エラー/HTTP503/不正JSONも拒否確認。同一予約を再試行しUIでも予約する。

事後条件: すべて拒否、ローカル台帳不変、同一内容再試行の予約ID不変、UIにエラー表示してフォーム維持。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-19"></a>
## UC-19 未認証の管理操作を拒否

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-19](02_USE_CASES.md#UC-19) / [REQ-19](03_REQUIREMENTS.md#REQ-19) / [FS-19](04_FUNCTIONAL_SPEC.md#FS-19) / [TASK-19](05_TASKS.md#TASK-19) / [AT-19](06_ACCEPTANCE_TEST_SPEC.md#AT-19) / [CODE-19](07_TRACEABILITY_MATRIX.md#CODE-19) / [TEST-19](06_ACCEPTANCE_TEST_SPEC.md#TEST-19)

事前条件: セッション・保存データなしの新規画面。

基本フロー: 未認証の画面とAPI拒否を確認。その後ローカル模擬APIでログインし、キー失効応答を注入する。

事後条件: 認証前はログイン画面のみ・台帳未生成。キー失効応答後はセッションと画面の個人情報を消しログイン画面に戻る。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-20"></a>
## UC-20 保護者の家庭別アクセス制限

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-20](02_USE_CASES.md#UC-20) / [REQ-20](03_REQUIREMENTS.md#REQ-20) / [FS-20](04_FUNCTIONAL_SPEC.md#FS-20) / [TASK-20](05_TASKS.md#TASK-20) / [AT-20](06_ACCEPTANCE_TEST_SPEC.md#AT-20) / [CODE-20](07_TRACEABILITY_MATRIX.md#CODE-20) / [TEST-20](06_ACCEPTANCE_TEST_SPEC.md#TEST-20)

事前条件: STU-001だけに紐付いた保護者デモ。

基本フロー: 生徒一覧・予約一覧・STU-002への参照/予約/取消・管理者操作の直接呼出を確認。

事後条件: STU-001だけを表示。別家庭の参照/予約/取消と完了/チケット追加を拒否。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-21"></a>
## UC-21 モバイル表示

[BF-08](01_BUSINESS_FLOWS.md#BF-08) / [UC-21](02_USE_CASES.md#UC-21) / [REQ-21](03_REQUIREMENTS.md#REQ-21) / [FS-21](04_FUNCTIONAL_SPEC.md#FS-21) / [TASK-21](05_TASKS.md#TASK-21) / [AT-21](06_ACCEPTANCE_TEST_SPEC.md#AT-21) / [CODE-21](07_TRACEABILITY_MATRIX.md#CODE-21) / [TEST-21](06_ACCEPTANCE_TEST_SPEC.md#TEST-21)

事前条件: 375×812のエミュレーション。

基本フロー: 管理・利用者・予約フォームを順に表示し、指定幅375pxと実際の描画幅を照合。

事後条件: 各画面でscrollWidthとinnerWidthが375px以下。保護者の予約・取消行も画面内に収まる。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-22"></a>
## UC-22 再読込後の永続化

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-22](02_USE_CASES.md#UC-22) / [REQ-22](03_REQUIREMENTS.md#REQ-22) / [FS-22](04_FUNCTIONAL_SPEC.md#FS-22) / [TASK-22](05_TASKS.md#TASK-22) / [AT-22](06_ACCEPTANCE_TEST_SPEC.md#AT-22) / [CODE-22](07_TRACEABILITY_MATRIX.md#CODE-22) / [TEST-22](06_ACCEPTANCE_TEST_SPEC.md#TEST-22)

事前条件: ダミー台帳。

基本フロー: 生徒追加と予約登録後に再読込。

事後条件: 追加した生徒・予約のIDと値が維持される。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-23"></a>
## UC-23 Google初期化・永続化

[BF-01](01_BUSINESS_FLOWS.md#BF-01) / [UC-23](02_USE_CASES.md#UC-23) / [REQ-23](03_REQUIREMENTS.md#REQ-23) / [FS-23](04_FUNCTIONAL_SPEC.md#FS-23) / [TASK-23](05_TASKS.md#TASK-23) / [AT-23](06_ACCEPTANCE_TEST_SPEC.md#AT-23) / [CODE-23](07_TRACEABILITY_MATRIX.md#CODE-23) / [TEST-23](06_ACCEPTANCE_TEST_SPEC.md#TEST-23)

事前条件: 専用シート・GAS配備・権限が必要。

基本フロー: initSpreadsheetを2回実行し生徒をWeb登録、シートを開く。

事後条件: 3シート生成・再実行で既存値不変・新規生徒1行。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-24"></a>
## UC-24 実カレンダー予約同期

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-24](02_USE_CASES.md#UC-24) / [REQ-24](03_REQUIREMENTS.md#REQ-24) / [FS-24](04_FUNCTIONAL_SPEC.md#FS-24) / [TASK-24](05_TASKS.md#TASK-24) / [AT-24](06_ACCEPTANCE_TEST_SPEC.md#AT-24) / [CODE-24](07_TRACEABILITY_MATRIX.md#CODE-24) / [TEST-24](06_ACCEPTANCE_TEST_SPEC.md#TEST-24)

事前条件: 専用GAS・カレンダーが必要。

基本フロー: Webから予約しシート行と実カレンダー予定を開く。

事後条件: 同一予約ID・日時・場所・イベントIDが一致。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-25"></a>
## UC-25 実カレンダー取消同期

[BF-05](01_BUSINESS_FLOWS.md#BF-05) / [UC-25](02_USE_CASES.md#UC-25) / [REQ-25](03_REQUIREMENTS.md#REQ-25) / [FS-25](04_FUNCTIONAL_SPEC.md#FS-25) / [TASK-25](05_TASKS.md#TASK-25) / [AT-25](06_ACCEPTANCE_TEST_SPEC.md#AT-25) / [CODE-25](07_TRACEABILITY_MATRIX.md#CODE-25) / [TEST-25](06_ACCEPTANCE_TEST_SPEC.md#TEST-25)

事前条件: AT-24の予約。

基本フロー: 予約取消後にシートとカレンダーを開く。

事後条件: cancelled・対象イベント削除・残高不変。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-26"></a>
## UC-26 管理者2名・保護者の端末共有

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-26](02_USE_CASES.md#UC-26) / [REQ-26](03_REQUIREMENTS.md#REQ-26) / [FS-26](04_FUNCTIONAL_SPEC.md#FS-26) / [TASK-26](05_TASKS.md#TASK-26) / [AT-26](06_ACCEPTANCE_TEST_SPEC.md#AT-26) / [CODE-26](07_TRACEABILITY_MATRIX.md#CODE-26) / [TEST-26](06_ACCEPTANCE_TEST_SPEC.md#TEST-26)

事前条件: 別セッション3台・権限分離・専用GAS。

基本フロー: 保護者予約 → 管理者A確認・完了 → 管理者Bと保護者が再取得。

事後条件: 同一予約・残高を確認し家庭の範囲を維持。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-27"></a>
## UC-27 同時完了の排他制御

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-27](02_USE_CASES.md#UC-27) / [REQ-27](03_REQUIREMENTS.md#REQ-27) / [FS-27](04_FUNCTIONAL_SPEC.md#FS-27) / [TASK-27](05_TASKS.md#TASK-27) / [AT-27](06_ACCEPTANCE_TEST_SPEC.md#AT-27) / [CODE-27](07_TRACEABILITY_MATRIX.md#CODE-27) / [TEST-27](06_ACCEPTANCE_TEST_SPEC.md#TEST-27)

事前条件: 独立管理者2セッション・専用GAS。

基本フロー: 同じ予約を両管理者から同時に完了。

事後条件: 完了1件・片道1枚だけ消費、再試行でも不変。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-28"></a>
## UC-28 バックアップから復旧

[BF-08](01_BUSINESS_FLOWS.md#BF-08) / [UC-28](02_USE_CASES.md#UC-28) / [REQ-28](03_REQUIREMENTS.md#REQ-28) / [FS-28](04_FUNCTIONAL_SPEC.md#FS-28) / [TASK-28](05_TASKS.md#TASK-28) / [AT-28](06_ACCEPTANCE_TEST_SPEC.md#AT-28) / [CODE-28](07_TRACEABILITY_MATRIX.md#CODE-28) / [TEST-28](06_ACCEPTANCE_TEST_SPEC.md#TEST-28)

事前条件: 専用テスト資源・保存先・担当者。

基本フロー: バックアップ → テスト行変更 → 復元 → Web再取得。

事後条件: 生徒・予約・購入履歴・カレンダーの整合を回復。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-29"></a>
## UC-29 実機受入

[BF-08](01_BUSINESS_FLOWS.md#BF-08) / [UC-29](02_USE_CASES.md#UC-29) / [REQ-29](03_REQUIREMENTS.md#REQ-29) / [FS-29](04_FUNCTIONAL_SPEC.md#FS-29) / [TASK-29](05_TASKS.md#TASK-29) / [AT-29](06_ACCEPTANCE_TEST_SPEC.md#AT-29) / [CODE-29](07_TRACEABILITY_MATRIX.md#CODE-29) / [TEST-29](06_ACCEPTANCE_TEST_SPEC.md#TEST-29)

事前条件: iPhone Safari・Android Chromeと受入担当者。

基本フロー: 予約・取消・残高確認を各実機で実施。

事後条件: 入力・確認・操作が可能、受入担当の確認記録あり。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。

<a id="UC-30"></a>
## UC-30 リリース後スモークテスト

[BF-08](01_BUSINESS_FLOWS.md#BF-08) / [UC-30](02_USE_CASES.md#UC-30) / [REQ-30](03_REQUIREMENTS.md#REQ-30) / [FS-30](04_FUNCTIONAL_SPEC.md#FS-30) / [TASK-30](05_TASKS.md#TASK-30) / [AT-30](06_ACCEPTANCE_TEST_SPEC.md#AT-30) / [CODE-30](07_TRACEABILITY_MATRIX.md#CODE-30) / [TEST-30](06_ACCEPTANCE_TEST_SPEC.md#TEST-30)

事前条件: 全必須合格・受入確認・対象環境確定。

基本フロー: リリース後URLで権限・予約・取消・連携・版を確認。

事後条件: 対象コミットと公開版一致、重大不具合なし、戻し手順あり。

代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。



