> 2026-10-22 アカウント運用変更：初期接続・初期管理者は開発担当、日常のGoogleアカウント登録・停止・削除・生徒紐付け・家庭URL再発行は管理者画面で行う。[現行仕様](../ACCOUNT_MANAGEMENT.md)を優先。Calendar未追加・本番未開始。

# タスクリスト・リリース対応（DOC-TASK-001）

> 2026-10-21 設定進捗：FirebaseのWebアプリ登録・Google認証有効化・検証ドメイン保存と、検証GASの対象台帳操作・外部通信の承認を確認しました。本人UID登録と実Googleログイン、新GASのデプロイ・新サイトへの切替は未完了です。Calendarは未追加。本番運用は開始していません。[Step 08](../progress/2026-10-21-step-08.md)を参照。


> 2026-10-21仕様追補（未公開）: [開発者セットアップ・Google本人確認](../DEVELOPER_SETUP_OVERVIEW.md)を追加します。旧キー方式の結果は過去版の記録です。新方式のローカル試験と実Google・公開確認を分け、AT-24〜30の7件は未合格を維持します。

> 現行仕様（2026-10-20追加）: [管理者・家庭別ポータル／個別URL・QR](../PORTAL_SEPARATION.md)と[Step 06](../progress/2026-10-20-step-06.md)を優先してください。以下の旧実行結果は当時の版の記録です。現在はAT-23 PASS、AT-24〜30の7件未合格。新仕様の補足試験はGAS42件・フロント契約9件・実API読み取り11件を別集計し、元の30受入項目へ加算しません。

> 2026-10-20 Step 05 最新補遺: **AT-23 PASS**。Web登録1行・再読込・不足3シート生成・既存82セル保全を実測。残るAT-24〜30は7件未合格。次はAT-24の検証先と権限確認。過去runの判定とJSONは変更していない。[実測と証跡](../progress/2026-10-20-step-05.md)。

文書版: 2026-10-20 / 不合格6件修正・再試験版。実環境の受入済み・リリース済みを意味しない。

各タスクは要件の実装・検証・再試験までを完了条件とする。PASSはローカル自動確認済みであり、運用受入完了ではない。FAIL/NOT RUN/BLOCKEDは未完了。

<a id="TASK-01"></a>
## TASK-01 Google連携先の設定保存

[BF-01](01_BUSINESS_FLOWS.md#BF-01) / [UC-01](02_USE_CASES.md#UC-01) / [REQ-01](03_REQUIREMENTS.md#REQ-01) / [FS-01](04_FUNCTIONAL_SPEC.md#FS-01) / [TASK-01](05_TASKS.md#TASK-01) / [AT-01](06_ACCEPTANCE_TEST_SPEC.md#AT-01) / [CODE-01](07_TRACEABILITY_MATRIX.md#CODE-01) / [TEST-01](06_ACCEPTANCE_TEST_SPEC.md#TEST-01)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: 保存したURLが再読込後も一致。証跡: AT-01の合格結果と画面キャプチャ。

<a id="TASK-02"></a>
## TASK-02 生徒登録

[BF-02](01_BUSINESS_FLOWS.md#BF-02) / [UC-02](02_USE_CASES.md#UC-02) / [REQ-02](03_REQUIREMENTS.md#REQ-02) / [FS-02](04_FUNCTIONAL_SPEC.md#FS-02) / [TASK-02](05_TASKS.md#TASK-02) / [AT-02](06_ACCEPTANCE_TEST_SPEC.md#AT-02) / [CODE-02](07_TRACEABILITY_MATRIX.md#CODE-02) / [TEST-02](06_ACCEPTANCE_TEST_SPEC.md#TEST-02)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: 生徒が1件増え全入力値と初期残高10が保存される。証跡: AT-02の合格結果と画面キャプチャ。

<a id="TASK-03"></a>
## TASK-03 保護者の残数確認

[BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-03](02_USE_CASES.md#UC-03) / [REQ-03](03_REQUIREMENTS.md#REQ-03) / [FS-03](04_FUNCTIONAL_SPEC.md#FS-03) / [TASK-03](05_TASKS.md#TASK-03) / [AT-03](06_ACCEPTANCE_TEST_SPEC.md#AT-03) / [CODE-03](07_TRACEABILITY_MATRIX.md#CODE-03) / [TEST-03](06_ACCEPTANCE_TEST_SPEC.md#TEST-03)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: 氏名と7回分・片道1枚の説明が表示される。証跡: AT-03の合格結果と画面キャプチャ。

<a id="TASK-04"></a>
## TASK-04 残少・ゼロ案内

[BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-04](02_USE_CASES.md#UC-04) / [REQ-04](03_REQUIREMENTS.md#REQ-04) / [FS-04](04_FUNCTIONAL_SPEC.md#FS-04) / [TASK-04](05_TASKS.md#TASK-04) / [AT-04](06_ACCEPTANCE_TEST_SPEC.md#AT-04) / [CODE-04](07_TRACEABILITY_MATRIX.md#CODE-04) / [TEST-04](06_ACCEPTANCE_TEST_SPEC.md#TEST-04)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: 各値でMauro・Brendaへの連絡案内が表示される。証跡: AT-04の合格結果と画面キャプチャ。

<a id="TASK-05"></a>
## TASK-05 チケット追加

[BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-05](02_USE_CASES.md#UC-05) / [REQ-05](03_REQUIREMENTS.md#REQ-05) / [FS-05](04_FUNCTIONAL_SPEC.md#FS-05) / [TASK-05](05_TASKS.md#TASK-05) / [AT-05](06_ACCEPTANCE_TEST_SPEC.md#AT-05) / [CODE-05](07_TRACEABILITY_MATRIX.md#CODE-05) / [TEST-05](06_ACCEPTANCE_TEST_SPEC.md#TEST-05)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: 残高17、履歴1件増、枚数10・金額・備考一致。証跡: AT-05の合格結果と画面キャプチャ。

<a id="TASK-06"></a>
## TASK-06 保護者のお迎え予約

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-06](02_USE_CASES.md#UC-06) / [REQ-06](03_REQUIREMENTS.md#REQ-06) / [FS-06](04_FUNCTIONAL_SPEC.md#FS-06) / [TASK-06](05_TASKS.md#TASK-06) / [AT-06](06_ACCEPTANCE_TEST_SPEC.md#AT-06) / [CODE-06](07_TRACEABILITY_MATRIX.md#CODE-06) / [TEST-06](06_ACCEPTANCE_TEST_SPEC.md#TEST-06)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: 新規予約1件、scheduled、parent、残高7のまま。証跡: AT-06の合格結果と画面キャプチャ。

<a id="TASK-07"></a>
## TASK-07 送り予約

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-07](02_USE_CASES.md#UC-07) / [REQ-07](03_REQUIREMENTS.md#REQ-07) / [FS-07](04_FUNCTIONAL_SPEC.md#FS-07) / [TASK-07](05_TASKS.md#TASK-07) / [AT-07](06_ACCEPTANCE_TEST_SPEC.md#AT-07) / [CODE-07](07_TRACEABILITY_MATRIX.md#CODE-07) / [TEST-07](06_ACCEPTANCE_TEST_SPEC.md#TEST-07)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: dropoffの予約が1件増え、残高7のまま。証跡: AT-07の合格結果と画面キャプチャ。

<a id="TASK-08"></a>
## TASK-08 往復予約

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-08](02_USE_CASES.md#UC-08) / [REQ-08](03_REQUIREMENTS.md#REQ-08) / [FS-08](04_FUNCTIONAL_SPEC.md#FS-08) / [TASK-08](05_TASKS.md#TASK-08) / [AT-08](06_ACCEPTANCE_TEST_SPEC.md#AT-08) / [CODE-08](07_TRACEABILITY_MATRIX.md#CODE-08) / [TEST-08](06_ACCEPTANCE_TEST_SPEC.md#TEST-08)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: roundtripの予約が1件増え、予約時残高7のまま。証跡: AT-08の合格結果と画面キャプチャ。

<a id="TASK-09"></a>
## TASK-09 管理者の代理予約

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-09](02_USE_CASES.md#UC-09) / [REQ-09](03_REQUIREMENTS.md#REQ-09) / [FS-09](04_FUNCTIONAL_SPEC.md#FS-09) / [TASK-09](05_TASKS.md#TASK-09) / [AT-09](06_ACCEPTANCE_TEST_SPEC.md#AT-09) / [CODE-09](07_TRACEABILITY_MATRIX.md#CODE-09) / [TEST-09](06_ACCEPTANCE_TEST_SPEC.md#TEST-09)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: 新規予約1件、reservedBy=teacher。証跡: AT-09の合格結果と画面キャプチャ。

<a id="TASK-10"></a>
## TASK-10 保護者の予約取消

[BF-05](01_BUSINESS_FLOWS.md#BF-05) / [UC-10](02_USE_CASES.md#UC-10) / [REQ-10](03_REQUIREMENTS.md#REQ-10) / [FS-10](04_FUNCTIONAL_SPEC.md#FS-10) / [TASK-10](05_TASKS.md#TASK-10) / [AT-10](06_ACCEPTANCE_TEST_SPEC.md#AT-10) / [CODE-10](07_TRACEABILITY_MATRIX.md#CODE-10) / [TEST-10](06_ACCEPTANCE_TEST_SPEC.md#TEST-10)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: 対象IDがcancelled、残高7のまま。証跡: AT-10の合格結果と画面キャプチャ。

<a id="TASK-11"></a>
## TASK-11 管理者の予約取消

[BF-05](01_BUSINESS_FLOWS.md#BF-05) / [UC-11](02_USE_CASES.md#UC-11) / [REQ-11](03_REQUIREMENTS.md#REQ-11) / [FS-11](04_FUNCTIONAL_SPEC.md#FS-11) / [TASK-11](05_TASKS.md#TASK-11) / [AT-11](06_ACCEPTANCE_TEST_SPEC.md#AT-11) / [CODE-11](07_TRACEABILITY_MATRIX.md#CODE-11) / [TEST-11](06_ACCEPTANCE_TEST_SPEC.md#TEST-11)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: 対象IDがcancelled、残数不変。証跡: AT-11の合格結果と画面キャプチャ。

<a id="TASK-12"></a>
## TASK-12 当日一覧・地図リンク

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-12](02_USE_CASES.md#UC-12) / [REQ-12](03_REQUIREMENTS.md#REQ-12) / [FS-12](04_FUNCTIONAL_SPEC.md#FS-12) / [TASK-12](05_TASKS.md#TASK-12) / [AT-12](06_ACCEPTANCE_TEST_SPEC.md#AT-12) / [CODE-12](07_TRACEABILITY_MATRIX.md#CODE-12) / [TEST-12](06_ACCEPTANCE_TEST_SPEC.md#TEST-12)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: 当日予約とGoogle Maps検索URLが表示される（地図先の動作は対象外）。証跡: AT-12の合格結果と画面キャプチャ。

<a id="TASK-13"></a>
## TASK-13 片道完了

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-13](02_USE_CASES.md#UC-13) / [REQ-13](03_REQUIREMENTS.md#REQ-13) / [FS-13](04_FUNCTIONAL_SPEC.md#FS-13) / [TASK-13](05_TASKS.md#TASK-13) / [AT-13](06_ACCEPTANCE_TEST_SPEC.md#AT-13) / [CODE-13](07_TRACEABILITY_MATRIX.md#CODE-13) / [TEST-13](06_ACCEPTANCE_TEST_SPEC.md#TEST-13)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: completed・完了日時あり・残高6。証跡: AT-13の合格結果と画面キャプチャ。

<a id="TASK-14"></a>
## TASK-14 往復完了

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-14](02_USE_CASES.md#UC-14) / [REQ-14](03_REQUIREMENTS.md#REQ-14) / [FS-14](04_FUNCTIONAL_SPEC.md#FS-14) / [TASK-14](05_TASKS.md#TASK-14) / [AT-14](06_ACCEPTANCE_TEST_SPEC.md#AT-14) / [CODE-14](07_TRACEABILITY_MATRIX.md#CODE-14) / [TEST-14](06_ACCEPTANCE_TEST_SPEC.md#TEST-14)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: completed・残高5・消費2。証跡: AT-14の合格結果と画面キャプチャ。

<a id="TASK-15"></a>
## TASK-15 完了の二重処理防止

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-15](02_USE_CASES.md#UC-15) / [REQ-15](03_REQUIREMENTS.md#REQ-15) / [FS-15](04_FUNCTIONAL_SPEC.md#FS-15) / [TASK-15](05_TASKS.md#TASK-15) / [AT-15](06_ACCEPTANCE_TEST_SPEC.md#AT-15) / [CODE-15](07_TRACEABILITY_MATRIX.md#CODE-15) / [TEST-15](06_ACCEPTANCE_TEST_SPEC.md#TEST-15)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: 最終残高6、completedを保持、再処理の消費枚数0。証跡: AT-15の合格結果と画面キャプチャ。

<a id="TASK-16"></a>
## TASK-16 取消済みの完了拒否

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-16](02_USE_CASES.md#UC-16) / [REQ-16](03_REQUIREMENTS.md#REQ-16) / [FS-16](04_FUNCTIONAL_SPEC.md#FS-16) / [TASK-16](05_TASKS.md#TASK-16) / [AT-16](06_ACCEPTANCE_TEST_SPEC.md#AT-16) / [CODE-16](07_TRACEABILITY_MATRIX.md#CODE-16) / [TEST-16](06_ACCEPTANCE_TEST_SPEC.md#TEST-16)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: cancelledを保持し残高7のまま。証跡: AT-16の合格結果と画面キャプチャ。

<a id="TASK-17"></a>
## TASK-17 不正なチケット追加拒否

[BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-17](02_USE_CASES.md#UC-17) / [REQ-17](03_REQUIREMENTS.md#REQ-17) / [FS-17](04_FUNCTIONAL_SPEC.md#FS-17) / [TASK-17](05_TASKS.md#TASK-17) / [AT-17](06_ACCEPTANCE_TEST_SPEC.md#AT-17) / [CODE-17](07_TRACEABILITY_MATRIX.md#CODE-17) / [TEST-17](06_ACCEPTANCE_TEST_SPEC.md#TEST-17)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: 全要求が拒否され残高7・購入履歴が不変。証跡: AT-17の合格結果と画面キャプチャ。

<a id="TASK-18"></a>
## TASK-18 通信障害時に成功扱いしない

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: すべて拒否、ローカル台帳不変、同一内容再試行の予約ID不変、UIにエラー表示してフォーム維持。証跡: AT-18の合格結果と画面キャプチャ。

<a id="TASK-19"></a>
## TASK-19 未認証の管理操作を拒否

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-19](02_USE_CASES.md#UC-19) / [REQ-19](03_REQUIREMENTS.md#REQ-19) / [FS-19](04_FUNCTIONAL_SPEC.md#FS-19) / [TASK-19](05_TASKS.md#TASK-19) / [AT-19](06_ACCEPTANCE_TEST_SPEC.md#AT-19) / [CODE-19](07_TRACEABILITY_MATRIX.md#CODE-19) / [TEST-19](06_ACCEPTANCE_TEST_SPEC.md#TEST-19)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: 認証前はログイン画面のみ・台帳未生成。キー失効応答後はセッションと画面の個人情報を消しログイン画面に戻る。証跡: AT-19の合格結果と画面キャプチャ。

<a id="TASK-20"></a>
## TASK-20 保護者の家庭別アクセス制限

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-20](02_USE_CASES.md#UC-20) / [REQ-20](03_REQUIREMENTS.md#REQ-20) / [FS-20](04_FUNCTIONAL_SPEC.md#FS-20) / [TASK-20](05_TASKS.md#TASK-20) / [AT-20](06_ACCEPTANCE_TEST_SPEC.md#AT-20) / [CODE-20](07_TRACEABILITY_MATRIX.md#CODE-20) / [TEST-20](06_ACCEPTANCE_TEST_SPEC.md#TEST-20)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: STU-001だけを表示。別家庭の参照/予約/取消と完了/チケット追加を拒否。証跡: AT-20の合格結果と画面キャプチャ。

<a id="TASK-21"></a>
## TASK-21 モバイル表示

[BF-08](01_BUSINESS_FLOWS.md#BF-08) / [UC-21](02_USE_CASES.md#UC-21) / [REQ-21](03_REQUIREMENTS.md#REQ-21) / [FS-21](04_FUNCTIONAL_SPEC.md#FS-21) / [TASK-21](05_TASKS.md#TASK-21) / [AT-21](06_ACCEPTANCE_TEST_SPEC.md#AT-21) / [CODE-21](07_TRACEABILITY_MATRIX.md#CODE-21) / [TEST-21](06_ACCEPTANCE_TEST_SPEC.md#TEST-21)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: 各画面でscrollWidthとinnerWidthが375px以下。保護者の予約・取消行も画面内に収まる。証跡: AT-21の合格結果と画面キャプチャ。

<a id="TASK-22"></a>
## TASK-22 再読込後の永続化

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-22](02_USE_CASES.md#UC-22) / [REQ-22](03_REQUIREMENTS.md#REQ-22) / [FS-22](04_FUNCTIONAL_SPEC.md#FS-22) / [TASK-22](05_TASKS.md#TASK-22) / [AT-22](06_ACCEPTANCE_TEST_SPEC.md#AT-22) / [CODE-22](07_TRACEABILITY_MATRIX.md#CODE-22) / [TEST-22](06_ACCEPTANCE_TEST_SPEC.md#TEST-22)

担当（案）: 開発担当。状態: PASS。

次の対応: ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。

完了条件: 追加した生徒・予約のIDと値が維持される。証跡: AT-22の合格結果と画面キャプチャ。

<a id="TASK-23"></a>
## TASK-23 Google初期化・永続化

[BF-01](01_BUSINESS_FLOWS.md#BF-01) / [UC-23](02_USE_CASES.md#UC-23) / [REQ-23](03_REQUIREMENTS.md#REQ-23) / [FS-23](04_FUNCTIONAL_SPEC.md#FS-23) / [TASK-23](05_TASKS.md#TASK-23) / [AT-23](06_ACCEPTANCE_TEST_SPEC.md#AT-23) / [CODE-23](07_TRACEABILITY_MATRIX.md#CODE-23) / [TEST-23](06_ACCEPTANCE_TEST_SPEC.md#TEST-23)

担当（案）: 導入担当・管理者・受入担当。状態: BLOCKED。

次の対応: 専用Google環境・権限・担当者・前段条件を準備し、仕様の手順で実施する。

完了条件: 3シート生成・再実行で既存値不変・新規生徒1行。証跡: AT-23の合格結果と画面キャプチャ。

<a id="TASK-24"></a>
## TASK-24 実カレンダー予約同期

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-24](02_USE_CASES.md#UC-24) / [REQ-24](03_REQUIREMENTS.md#REQ-24) / [FS-24](04_FUNCTIONAL_SPEC.md#FS-24) / [TASK-24](05_TASKS.md#TASK-24) / [AT-24](06_ACCEPTANCE_TEST_SPEC.md#AT-24) / [CODE-24](07_TRACEABILITY_MATRIX.md#CODE-24) / [TEST-24](06_ACCEPTANCE_TEST_SPEC.md#TEST-24)

担当（案）: 導入担当・管理者・受入担当。状態: BLOCKED。

次の対応: 専用Google環境・権限・担当者・前段条件を準備し、仕様の手順で実施する。

完了条件: 同一予約ID・日時・場所・イベントIDが一致。証跡: AT-24の合格結果と画面キャプチャ。

<a id="TASK-25"></a>
## TASK-25 実カレンダー取消同期

[BF-05](01_BUSINESS_FLOWS.md#BF-05) / [UC-25](02_USE_CASES.md#UC-25) / [REQ-25](03_REQUIREMENTS.md#REQ-25) / [FS-25](04_FUNCTIONAL_SPEC.md#FS-25) / [TASK-25](05_TASKS.md#TASK-25) / [AT-25](06_ACCEPTANCE_TEST_SPEC.md#AT-25) / [CODE-25](07_TRACEABILITY_MATRIX.md#CODE-25) / [TEST-25](06_ACCEPTANCE_TEST_SPEC.md#TEST-25)

担当（案）: 導入担当・管理者・受入担当。状態: BLOCKED。

次の対応: 専用Google環境・権限・担当者・前段条件を準備し、仕様の手順で実施する。

完了条件: cancelled・対象イベント削除・残高不変。証跡: AT-25の合格結果と画面キャプチャ。

<a id="TASK-26"></a>
## TASK-26 管理者2名・保護者の端末共有

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-26](02_USE_CASES.md#UC-26) / [REQ-26](03_REQUIREMENTS.md#REQ-26) / [FS-26](04_FUNCTIONAL_SPEC.md#FS-26) / [TASK-26](05_TASKS.md#TASK-26) / [AT-26](06_ACCEPTANCE_TEST_SPEC.md#AT-26) / [CODE-26](07_TRACEABILITY_MATRIX.md#CODE-26) / [TEST-26](06_ACCEPTANCE_TEST_SPEC.md#TEST-26)

担当（案）: 導入担当・管理者・受入担当。状態: BLOCKED。

次の対応: 専用Google環境・権限・担当者・前段条件を準備し、仕様の手順で実施する。

完了条件: 同一予約・残高を確認し家庭の範囲を維持。証跡: AT-26の合格結果と画面キャプチャ。

<a id="TASK-27"></a>
## TASK-27 同時完了の排他制御

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-27](02_USE_CASES.md#UC-27) / [REQ-27](03_REQUIREMENTS.md#REQ-27) / [FS-27](04_FUNCTIONAL_SPEC.md#FS-27) / [TASK-27](05_TASKS.md#TASK-27) / [AT-27](06_ACCEPTANCE_TEST_SPEC.md#AT-27) / [CODE-27](07_TRACEABILITY_MATRIX.md#CODE-27) / [TEST-27](06_ACCEPTANCE_TEST_SPEC.md#TEST-27)

担当（案）: 導入担当・管理者・受入担当。状態: BLOCKED。

次の対応: 専用Google環境・権限・担当者・前段条件を準備し、仕様の手順で実施する。

完了条件: 完了1件・片道1枚だけ消費、再試行でも不変。証跡: AT-27の合格結果と画面キャプチャ。

<a id="TASK-28"></a>
## TASK-28 バックアップから復旧

[BF-08](01_BUSINESS_FLOWS.md#BF-08) / [UC-28](02_USE_CASES.md#UC-28) / [REQ-28](03_REQUIREMENTS.md#REQ-28) / [FS-28](04_FUNCTIONAL_SPEC.md#FS-28) / [TASK-28](05_TASKS.md#TASK-28) / [AT-28](06_ACCEPTANCE_TEST_SPEC.md#AT-28) / [CODE-28](07_TRACEABILITY_MATRIX.md#CODE-28) / [TEST-28](06_ACCEPTANCE_TEST_SPEC.md#TEST-28)

担当（案）: 導入担当・管理者・受入担当。状態: BLOCKED。

次の対応: 専用Google環境・権限・担当者・前段条件を準備し、仕様の手順で実施する。

完了条件: 生徒・予約・購入履歴・カレンダーの整合を回復。証跡: AT-28の合格結果と画面キャプチャ。

<a id="TASK-29"></a>
## TASK-29 実機受入

[BF-08](01_BUSINESS_FLOWS.md#BF-08) / [UC-29](02_USE_CASES.md#UC-29) / [REQ-29](03_REQUIREMENTS.md#REQ-29) / [FS-29](04_FUNCTIONAL_SPEC.md#FS-29) / [TASK-29](05_TASKS.md#TASK-29) / [AT-29](06_ACCEPTANCE_TEST_SPEC.md#AT-29) / [CODE-29](07_TRACEABILITY_MATRIX.md#CODE-29) / [TEST-29](06_ACCEPTANCE_TEST_SPEC.md#TEST-29)

担当（案）: 導入担当・管理者・受入担当。状態: BLOCKED。

次の対応: 専用Google環境・権限・担当者・前段条件を準備し、仕様の手順で実施する。

完了条件: 入力・確認・操作が可能、受入担当の確認記録あり。証跡: AT-29の合格結果と画面キャプチャ。

<a id="TASK-30"></a>
## TASK-30 リリース後スモークテスト

[BF-08](01_BUSINESS_FLOWS.md#BF-08) / [UC-30](02_USE_CASES.md#UC-30) / [REQ-30](03_REQUIREMENTS.md#REQ-30) / [FS-30](04_FUNCTIONAL_SPEC.md#FS-30) / [TASK-30](05_TASKS.md#TASK-30) / [AT-30](06_ACCEPTANCE_TEST_SPEC.md#AT-30) / [CODE-30](07_TRACEABILITY_MATRIX.md#CODE-30) / [TEST-30](06_ACCEPTANCE_TEST_SPEC.md#TEST-30)

担当（案）: 導入担当・管理者・受入担当。状態: BLOCKED。

次の対応: 専用Google環境・権限・担当者・前段条件を準備し、仕様の手順で実施する。

完了条件: 対象コミットと公開版一致、重大不具合なし、戻し手順あり。証跡: AT-30の合格結果と画面キャプチャ。


具体的な不具合・重大度・修正方針・再試験の対応は[不具合台帳](10_DEFECTS_AND_VALIDATION.md)を参照。



