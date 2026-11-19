> 2026-10-22 アカウント運用変更：初期接続・初期管理者は開発担当、日常のGoogleアカウント登録・停止・削除・生徒紐付け・家庭URL再発行は管理者画面で行う。[現行仕様](../ACCOUNT_MANAGEMENT.md)を優先。Calendar未追加・本番未開始。

# 要件定義書（DOC-REQ-001）

> 2026-10-22 最新：管理者2名のGoogleログイン・台帳表示・再読込・ログアウト確認済み。管理者によるアカウント管理を検証サイトへ反映し、架空登録の作成・停止・有効化・URL再発行・削除を実測。旧キー認証は停止。[Step11](../progress/2026-10-22-step-11.md)を優先。家庭別・第三者30件・AT24〜30は未合格。Calendar未追加・本番未開始。

> 2026-10-22 追記：認証方式は顧客確認待ち。第三者が全30件を実施し全件合格することを本番前条件に追加（第三者0/30）。公開先読込障害の追跡・異常応答ガード配信・PPT v15確認は[Step10](../progress/2026-10-22-step-10.md)を参照。Calendar未追加・本番未開始。

> 2026-10-21 設定進捗：FirebaseのWebアプリ登録・Google認証有効化・検証ドメイン保存と、検証GASの対象台帳操作・外部通信の承認を確認しました。本人UID登録と実Googleログイン、新GASのデプロイ・新サイトへの切替は未完了です。Calendarは未追加。本番運用は開始していません。[Step 08](../progress/2026-10-21-step-08.md)を参照。


> 2026-10-21仕様追補（未公開）: [開発者セットアップ・Google本人確認](../DEVELOPER_SETUP_OVERVIEW.md)を追加します。旧キー方式の結果は過去版の記録です。新方式のローカル試験と実Google・公開確認を分け、AT-24〜30の7件は未合格を維持します。

> 現行仕様（2026-10-20追加）: [管理者・家庭別ポータル／個別URL・QR](../PORTAL_SEPARATION.md)と[Step 06](../progress/2026-10-20-step-06.md)を優先してください。以下の旧実行結果は当時の版の記録です。現在はAT-23 PASS、AT-24〜30の7件未合格。新仕様の補足試験はGAS42件・フロント契約9件・実API読み取り11件を別集計し、元の30受入項目へ加算しません。

文書版: 2026-10-20 / 不合格6件修正・再試験版。実環境の受入済み・リリース済みを意味しない。

目的: スマホ予約・取消・当日運行・チケット管理を管理者2名と保護者間で整合させる。Googleシートを台帳、カレンダーを運行予定とする。

要求の根拠は提供された10月7〜8日のチャット。既存コードや旧資料の記載だけでは業務合意・本番稼働を認定しない。運用ルールは受入基準案を含む。REQ-15〜20の不合格修正は今回のユーザー依頼で実装対象として確定。業務上の受入承認は未確認。

<a id="REQ-01"></a>
## REQ-01 Google連携先の設定保存

[BF-01](01_BUSINESS_FLOWS.md#BF-01) / [UC-01](02_USE_CASES.md#UC-01) / [REQ-01](03_REQUIREMENTS.md#REQ-01) / [FS-01](04_FUNCTIONAL_SPEC.md#FS-01) / [TASK-01](05_TASKS.md#TASK-01) / [AT-01](06_ACCEPTANCE_TEST_SPEC.md#AT-01) / [CODE-01](07_TRACEABILITY_MATRIX.md#CODE-01) / [TEST-01](06_ACCEPTANCE_TEST_SPEC.md#TEST-01)

要求: 保存したURLが再読込後も一致。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-01で検証。現状: PASS。

<a id="REQ-02"></a>
## REQ-02 生徒登録

[BF-02](01_BUSINESS_FLOWS.md#BF-02) / [UC-02](02_USE_CASES.md#UC-02) / [REQ-02](03_REQUIREMENTS.md#REQ-02) / [FS-02](04_FUNCTIONAL_SPEC.md#FS-02) / [TASK-02](05_TASKS.md#TASK-02) / [AT-02](06_ACCEPTANCE_TEST_SPEC.md#AT-02) / [CODE-02](07_TRACEABILITY_MATRIX.md#CODE-02) / [TEST-02](06_ACCEPTANCE_TEST_SPEC.md#TEST-02)

要求: 生徒が1件増え全入力値と初期残高10が保存される。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-02で検証。現状: PASS。

<a id="REQ-03"></a>
## REQ-03 保護者の残数確認

[BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-03](02_USE_CASES.md#UC-03) / [REQ-03](03_REQUIREMENTS.md#REQ-03) / [FS-03](04_FUNCTIONAL_SPEC.md#FS-03) / [TASK-03](05_TASKS.md#TASK-03) / [AT-03](06_ACCEPTANCE_TEST_SPEC.md#AT-03) / [CODE-03](07_TRACEABILITY_MATRIX.md#CODE-03) / [TEST-03](06_ACCEPTANCE_TEST_SPEC.md#TEST-03)

要求: 氏名と7回分・片道1枚の説明が表示される。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-03で検証。現状: PASS。

<a id="REQ-04"></a>
## REQ-04 残少・ゼロ案内

[BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-04](02_USE_CASES.md#UC-04) / [REQ-04](03_REQUIREMENTS.md#REQ-04) / [FS-04](04_FUNCTIONAL_SPEC.md#FS-04) / [TASK-04](05_TASKS.md#TASK-04) / [AT-04](06_ACCEPTANCE_TEST_SPEC.md#AT-04) / [CODE-04](07_TRACEABILITY_MATRIX.md#CODE-04) / [TEST-04](06_ACCEPTANCE_TEST_SPEC.md#TEST-04)

要求: 各値でMauro・Brendaへの連絡案内が表示される。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-04で検証。現状: PASS。

<a id="REQ-05"></a>
## REQ-05 チケット追加

[BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-05](02_USE_CASES.md#UC-05) / [REQ-05](03_REQUIREMENTS.md#REQ-05) / [FS-05](04_FUNCTIONAL_SPEC.md#FS-05) / [TASK-05](05_TASKS.md#TASK-05) / [AT-05](06_ACCEPTANCE_TEST_SPEC.md#AT-05) / [CODE-05](07_TRACEABILITY_MATRIX.md#CODE-05) / [TEST-05](06_ACCEPTANCE_TEST_SPEC.md#TEST-05)

要求: 残高17、履歴1件増、枚数10・金額・備考一致。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-05で検証。現状: PASS。

<a id="REQ-06"></a>
## REQ-06 保護者のお迎え予約

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-06](02_USE_CASES.md#UC-06) / [REQ-06](03_REQUIREMENTS.md#REQ-06) / [FS-06](04_FUNCTIONAL_SPEC.md#FS-06) / [TASK-06](05_TASKS.md#TASK-06) / [AT-06](06_ACCEPTANCE_TEST_SPEC.md#AT-06) / [CODE-06](07_TRACEABILITY_MATRIX.md#CODE-06) / [TEST-06](06_ACCEPTANCE_TEST_SPEC.md#TEST-06)

要求: 新規予約1件、scheduled、parent、残高7のまま。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-06で検証。現状: PASS。

<a id="REQ-07"></a>
## REQ-07 送り予約

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-07](02_USE_CASES.md#UC-07) / [REQ-07](03_REQUIREMENTS.md#REQ-07) / [FS-07](04_FUNCTIONAL_SPEC.md#FS-07) / [TASK-07](05_TASKS.md#TASK-07) / [AT-07](06_ACCEPTANCE_TEST_SPEC.md#AT-07) / [CODE-07](07_TRACEABILITY_MATRIX.md#CODE-07) / [TEST-07](06_ACCEPTANCE_TEST_SPEC.md#TEST-07)

要求: dropoffの予約が1件増え、残高7のまま。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-07で検証。現状: PASS。

<a id="REQ-08"></a>
## REQ-08 往復予約

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-08](02_USE_CASES.md#UC-08) / [REQ-08](03_REQUIREMENTS.md#REQ-08) / [FS-08](04_FUNCTIONAL_SPEC.md#FS-08) / [TASK-08](05_TASKS.md#TASK-08) / [AT-08](06_ACCEPTANCE_TEST_SPEC.md#AT-08) / [CODE-08](07_TRACEABILITY_MATRIX.md#CODE-08) / [TEST-08](06_ACCEPTANCE_TEST_SPEC.md#TEST-08)

要求: roundtripの予約が1件増え、予約時残高7のまま。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-08で検証。現状: PASS。

<a id="REQ-09"></a>
## REQ-09 管理者の代理予約

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-09](02_USE_CASES.md#UC-09) / [REQ-09](03_REQUIREMENTS.md#REQ-09) / [FS-09](04_FUNCTIONAL_SPEC.md#FS-09) / [TASK-09](05_TASKS.md#TASK-09) / [AT-09](06_ACCEPTANCE_TEST_SPEC.md#AT-09) / [CODE-09](07_TRACEABILITY_MATRIX.md#CODE-09) / [TEST-09](06_ACCEPTANCE_TEST_SPEC.md#TEST-09)

要求: 新規予約1件、reservedBy=teacher。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-09で検証。現状: PASS。

<a id="REQ-10"></a>
## REQ-10 保護者の予約取消

[BF-05](01_BUSINESS_FLOWS.md#BF-05) / [UC-10](02_USE_CASES.md#UC-10) / [REQ-10](03_REQUIREMENTS.md#REQ-10) / [FS-10](04_FUNCTIONAL_SPEC.md#FS-10) / [TASK-10](05_TASKS.md#TASK-10) / [AT-10](06_ACCEPTANCE_TEST_SPEC.md#AT-10) / [CODE-10](07_TRACEABILITY_MATRIX.md#CODE-10) / [TEST-10](06_ACCEPTANCE_TEST_SPEC.md#TEST-10)

要求: 対象IDがcancelled、残高7のまま。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-10で検証。現状: PASS。

<a id="REQ-11"></a>
## REQ-11 管理者の予約取消

[BF-05](01_BUSINESS_FLOWS.md#BF-05) / [UC-11](02_USE_CASES.md#UC-11) / [REQ-11](03_REQUIREMENTS.md#REQ-11) / [FS-11](04_FUNCTIONAL_SPEC.md#FS-11) / [TASK-11](05_TASKS.md#TASK-11) / [AT-11](06_ACCEPTANCE_TEST_SPEC.md#AT-11) / [CODE-11](07_TRACEABILITY_MATRIX.md#CODE-11) / [TEST-11](06_ACCEPTANCE_TEST_SPEC.md#TEST-11)

要求: 対象IDがcancelled、残数不変。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-11で検証。現状: PASS。

<a id="REQ-12"></a>
## REQ-12 当日一覧・地図リンク

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-12](02_USE_CASES.md#UC-12) / [REQ-12](03_REQUIREMENTS.md#REQ-12) / [FS-12](04_FUNCTIONAL_SPEC.md#FS-12) / [TASK-12](05_TASKS.md#TASK-12) / [AT-12](06_ACCEPTANCE_TEST_SPEC.md#AT-12) / [CODE-12](07_TRACEABILITY_MATRIX.md#CODE-12) / [TEST-12](06_ACCEPTANCE_TEST_SPEC.md#TEST-12)

要求: 当日予約とGoogle Maps検索URLが表示される（地図先の動作は対象外）。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-12で検証。現状: PASS。

<a id="REQ-13"></a>
## REQ-13 片道完了

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-13](02_USE_CASES.md#UC-13) / [REQ-13](03_REQUIREMENTS.md#REQ-13) / [FS-13](04_FUNCTIONAL_SPEC.md#FS-13) / [TASK-13](05_TASKS.md#TASK-13) / [AT-13](06_ACCEPTANCE_TEST_SPEC.md#AT-13) / [CODE-13](07_TRACEABILITY_MATRIX.md#CODE-13) / [TEST-13](06_ACCEPTANCE_TEST_SPEC.md#TEST-13)

要求: completed・完了日時あり・残高6。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-13で検証。現状: PASS。

<a id="REQ-14"></a>
## REQ-14 往復完了

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-14](02_USE_CASES.md#UC-14) / [REQ-14](03_REQUIREMENTS.md#REQ-14) / [FS-14](04_FUNCTIONAL_SPEC.md#FS-14) / [TASK-14](05_TASKS.md#TASK-14) / [AT-14](06_ACCEPTANCE_TEST_SPEC.md#AT-14) / [CODE-14](07_TRACEABILITY_MATRIX.md#CODE-14) / [TEST-14](06_ACCEPTANCE_TEST_SPEC.md#TEST-14)

要求: completed・残高5・消費2。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-14で検証。現状: PASS。

<a id="REQ-15"></a>
## REQ-15 完了の二重処理防止

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-15](02_USE_CASES.md#UC-15) / [REQ-15](03_REQUIREMENTS.md#REQ-15) / [FS-15](04_FUNCTIONAL_SPEC.md#FS-15) / [TASK-15](05_TASKS.md#TASK-15) / [AT-15](06_ACCEPTANCE_TEST_SPEC.md#AT-15) / [CODE-15](07_TRACEABILITY_MATRIX.md#CODE-15) / [TEST-15](06_ACCEPTANCE_TEST_SPEC.md#TEST-15)

要求: 最終残高6、completedを保持、再処理の消費枚数0。

出所: ユーザーによる不合格6件の修正依頼（実装対象確定）。優先度: 必須（案）。判定: AT-15で検証。現状: PASS。

<a id="REQ-16"></a>
## REQ-16 取消済みの完了拒否

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-16](02_USE_CASES.md#UC-16) / [REQ-16](03_REQUIREMENTS.md#REQ-16) / [FS-16](04_FUNCTIONAL_SPEC.md#FS-16) / [TASK-16](05_TASKS.md#TASK-16) / [AT-16](06_ACCEPTANCE_TEST_SPEC.md#AT-16) / [CODE-16](07_TRACEABILITY_MATRIX.md#CODE-16) / [TEST-16](06_ACCEPTANCE_TEST_SPEC.md#TEST-16)

要求: cancelledを保持し残高7のまま。

出所: ユーザーによる不合格6件の修正依頼（実装対象確定）。優先度: 必須（案）。判定: AT-16で検証。現状: PASS。

<a id="REQ-17"></a>
## REQ-17 不正なチケット追加拒否

[BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-17](02_USE_CASES.md#UC-17) / [REQ-17](03_REQUIREMENTS.md#REQ-17) / [FS-17](04_FUNCTIONAL_SPEC.md#FS-17) / [TASK-17](05_TASKS.md#TASK-17) / [AT-17](06_ACCEPTANCE_TEST_SPEC.md#AT-17) / [CODE-17](07_TRACEABILITY_MATRIX.md#CODE-17) / [TEST-17](06_ACCEPTANCE_TEST_SPEC.md#TEST-17)

要求: 全要求が拒否され残高7・購入履歴が不変。

出所: ユーザーによる不合格6件の修正依頼（実装対象確定）。優先度: 必須（案）。判定: AT-17で検証。現状: PASS。

<a id="REQ-18"></a>
## REQ-18 通信障害時に成功扱いしない

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

要求: すべて拒否、ローカル台帳不変、同一内容再試行の予約ID不変、UIにエラー表示してフォーム維持。

出所: ユーザーによる不合格6件の修正依頼（実装対象確定）。優先度: 必須（案）。判定: AT-18で検証。現状: PASS。

<a id="REQ-19"></a>
## REQ-19 未認証の管理操作を拒否

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-19](02_USE_CASES.md#UC-19) / [REQ-19](03_REQUIREMENTS.md#REQ-19) / [FS-19](04_FUNCTIONAL_SPEC.md#FS-19) / [TASK-19](05_TASKS.md#TASK-19) / [AT-19](06_ACCEPTANCE_TEST_SPEC.md#AT-19) / [CODE-19](07_TRACEABILITY_MATRIX.md#CODE-19) / [TEST-19](06_ACCEPTANCE_TEST_SPEC.md#TEST-19)

要求: 認証前はログイン画面のみ・台帳未生成。キー失効応答後はセッションと画面の個人情報を消しログイン画面に戻る。

出所: ユーザーによる不合格6件の修正依頼（実装対象確定）。優先度: 必須（案）。判定: AT-19で検証。現状: PASS。

<a id="REQ-20"></a>
## REQ-20 保護者の家庭別アクセス制限

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-20](02_USE_CASES.md#UC-20) / [REQ-20](03_REQUIREMENTS.md#REQ-20) / [FS-20](04_FUNCTIONAL_SPEC.md#FS-20) / [TASK-20](05_TASKS.md#TASK-20) / [AT-20](06_ACCEPTANCE_TEST_SPEC.md#AT-20) / [CODE-20](07_TRACEABILITY_MATRIX.md#CODE-20) / [TEST-20](06_ACCEPTANCE_TEST_SPEC.md#TEST-20)

要求: STU-001だけを表示。別家庭の参照/予約/取消と完了/チケット追加を拒否。

出所: ユーザーによる不合格6件の修正依頼（実装対象確定）。優先度: 必須（案）。判定: AT-20で検証。現状: PASS。

<a id="REQ-21"></a>
## REQ-21 モバイル表示

[BF-08](01_BUSINESS_FLOWS.md#BF-08) / [UC-21](02_USE_CASES.md#UC-21) / [REQ-21](03_REQUIREMENTS.md#REQ-21) / [FS-21](04_FUNCTIONAL_SPEC.md#FS-21) / [TASK-21](05_TASKS.md#TASK-21) / [AT-21](06_ACCEPTANCE_TEST_SPEC.md#AT-21) / [CODE-21](07_TRACEABILITY_MATRIX.md#CODE-21) / [TEST-21](06_ACCEPTANCE_TEST_SPEC.md#TEST-21)

要求: 各画面でscrollWidthとinnerWidthが375px以下。保護者の予約・取消行も画面内に収まる。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-21で検証。現状: PASS。

<a id="REQ-22"></a>
## REQ-22 再読込後の永続化

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-22](02_USE_CASES.md#UC-22) / [REQ-22](03_REQUIREMENTS.md#REQ-22) / [FS-22](04_FUNCTIONAL_SPEC.md#FS-22) / [TASK-22](05_TASKS.md#TASK-22) / [AT-22](06_ACCEPTANCE_TEST_SPEC.md#AT-22) / [CODE-22](07_TRACEABILITY_MATRIX.md#CODE-22) / [TEST-22](06_ACCEPTANCE_TEST_SPEC.md#TEST-22)

要求: 追加した生徒・予約のIDと値が維持される。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-22で検証。現状: PASS。

<a id="REQ-23"></a>
## REQ-23 Google初期化・永続化

[BF-01](01_BUSINESS_FLOWS.md#BF-01) / [UC-23](02_USE_CASES.md#UC-23) / [REQ-23](03_REQUIREMENTS.md#REQ-23) / [FS-23](04_FUNCTIONAL_SPEC.md#FS-23) / [TASK-23](05_TASKS.md#TASK-23) / [AT-23](06_ACCEPTANCE_TEST_SPEC.md#AT-23) / [CODE-23](07_TRACEABILITY_MATRIX.md#CODE-23) / [TEST-23](06_ACCEPTANCE_TEST_SPEC.md#TEST-23)

要求: 3シート生成・再実行で既存値不変・新規生徒1行。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-23で検証。現状: BLOCKED。

<a id="REQ-24"></a>
## REQ-24 実カレンダー予約同期

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-24](02_USE_CASES.md#UC-24) / [REQ-24](03_REQUIREMENTS.md#REQ-24) / [FS-24](04_FUNCTIONAL_SPEC.md#FS-24) / [TASK-24](05_TASKS.md#TASK-24) / [AT-24](06_ACCEPTANCE_TEST_SPEC.md#AT-24) / [CODE-24](07_TRACEABILITY_MATRIX.md#CODE-24) / [TEST-24](06_ACCEPTANCE_TEST_SPEC.md#TEST-24)

要求: 同一予約ID・日時・場所・イベントIDが一致。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-24で検証。現状: BLOCKED。

<a id="REQ-25"></a>
## REQ-25 実カレンダー取消同期

[BF-05](01_BUSINESS_FLOWS.md#BF-05) / [UC-25](02_USE_CASES.md#UC-25) / [REQ-25](03_REQUIREMENTS.md#REQ-25) / [FS-25](04_FUNCTIONAL_SPEC.md#FS-25) / [TASK-25](05_TASKS.md#TASK-25) / [AT-25](06_ACCEPTANCE_TEST_SPEC.md#AT-25) / [CODE-25](07_TRACEABILITY_MATRIX.md#CODE-25) / [TEST-25](06_ACCEPTANCE_TEST_SPEC.md#TEST-25)

要求: cancelled・対象イベント削除・残高不変。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-25で検証。現状: BLOCKED。

<a id="REQ-26"></a>
## REQ-26 管理者2名・保護者の端末共有

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-26](02_USE_CASES.md#UC-26) / [REQ-26](03_REQUIREMENTS.md#REQ-26) / [FS-26](04_FUNCTIONAL_SPEC.md#FS-26) / [TASK-26](05_TASKS.md#TASK-26) / [AT-26](06_ACCEPTANCE_TEST_SPEC.md#AT-26) / [CODE-26](07_TRACEABILITY_MATRIX.md#CODE-26) / [TEST-26](06_ACCEPTANCE_TEST_SPEC.md#TEST-26)

要求: 同一予約・残高を確認し家庭の範囲を維持。

出所: チャット要望から具体化。優先度: 必須（案）。判定: AT-26で検証。現状: BLOCKED。

<a id="REQ-27"></a>
## REQ-27 同時完了の排他制御

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-27](02_USE_CASES.md#UC-27) / [REQ-27](03_REQUIREMENTS.md#REQ-27) / [FS-27](04_FUNCTIONAL_SPEC.md#FS-27) / [TASK-27](05_TASKS.md#TASK-27) / [AT-27](06_ACCEPTANCE_TEST_SPEC.md#AT-27) / [CODE-27](07_TRACEABILITY_MATRIX.md#CODE-27) / [TEST-27](06_ACCEPTANCE_TEST_SPEC.md#TEST-27)

要求: 完了1件・片道1枚だけ消費、再試行でも不変。

出所: 運用開始に向けた追加提案（受入基準案）。優先度: 必須（案）。判定: AT-27で検証。現状: BLOCKED。

<a id="REQ-28"></a>
## REQ-28 バックアップから復旧

[BF-08](01_BUSINESS_FLOWS.md#BF-08) / [UC-28](02_USE_CASES.md#UC-28) / [REQ-28](03_REQUIREMENTS.md#REQ-28) / [FS-28](04_FUNCTIONAL_SPEC.md#FS-28) / [TASK-28](05_TASKS.md#TASK-28) / [AT-28](06_ACCEPTANCE_TEST_SPEC.md#AT-28) / [CODE-28](07_TRACEABILITY_MATRIX.md#CODE-28) / [TEST-28](06_ACCEPTANCE_TEST_SPEC.md#TEST-28)

要求: 生徒・予約・購入履歴・カレンダーの整合を回復。

出所: 運用開始に向けた追加提案（受入基準案）。優先度: 必須（案）。判定: AT-28で検証。現状: BLOCKED。

<a id="REQ-29"></a>
## REQ-29 実機受入

[BF-08](01_BUSINESS_FLOWS.md#BF-08) / [UC-29](02_USE_CASES.md#UC-29) / [REQ-29](03_REQUIREMENTS.md#REQ-29) / [FS-29](04_FUNCTIONAL_SPEC.md#FS-29) / [TASK-29](05_TASKS.md#TASK-29) / [AT-29](06_ACCEPTANCE_TEST_SPEC.md#AT-29) / [CODE-29](07_TRACEABILITY_MATRIX.md#CODE-29) / [TEST-29](06_ACCEPTANCE_TEST_SPEC.md#TEST-29)

要求: 入力・確認・操作が可能、受入担当の確認記録あり。

出所: 運用開始に向けた追加提案（受入基準案）。優先度: 必須（案）。判定: AT-29で検証。現状: BLOCKED。

<a id="REQ-30"></a>
## REQ-30 リリース後スモークテスト

[BF-08](01_BUSINESS_FLOWS.md#BF-08) / [UC-30](02_USE_CASES.md#UC-30) / [REQ-30](03_REQUIREMENTS.md#REQ-30) / [FS-30](04_FUNCTIONAL_SPEC.md#FS-30) / [TASK-30](05_TASKS.md#TASK-30) / [AT-30](06_ACCEPTANCE_TEST_SPEC.md#AT-30) / [CODE-30](07_TRACEABILITY_MATRIX.md#CODE-30) / [TEST-30](06_ACCEPTANCE_TEST_SPEC.md#TEST-30)

要求: 対象コミットと公開版一致、重大不具合なし、戻し手順あり。

出所: 運用開始に向けた追加提案（受入基準案）。優先度: 必須（案）。判定: AT-30で検証。現状: BLOCKED。

## 決定事項・確認待ち

- DEC-01 確定: 管理者2名と利用者の画面、都度予約・取消、片道1回消費。REQ-03〜REQ-14。
- DEC-02 提案: 往復2回を完了時にまとめて消費。迎え・送り別の時刻や片道だけ実施時の精算は未確定。REQ-08、REQ-14。
- DEC-03 提案: 残少表示は残2回以下。元チャットは閾値未指定。管理者は現状1回以下。統一方針は確認待ち。REQ-04。
- DEC-04 確認待ち: 当日予約・取消の締切、重複時間枠、予約の即時確定か管理者承認か、残高不足時の受付。REQ-06〜REQ-11、REQ-13〜REQ-14。現状を業務合意と見なさない。
- DEC-05 確認待ち: 管理者のGoogleアカウント、個人専用アクセスキーの本人への配布・失効手順、兄弟姉妹のstudentIds紐付け、データ保持期間・削除担当。REQ-19〜REQ-20、REQ-26、REQ-28。
- DEC-06 対象外: 定期予約自動生成・LINE通知・オンライン決済。金額は受領記録に限定。REQ-05。
- DEC-07 確認済み: 組織ml-mightylink.com / GCP eigo-taxi-app / 会社アカウントのHosting権限を確認しテストサイト公開済み。課金管理・実Google接続資源・運用担当の確認は残る。詳細: [環境台帳](13_MIGHTY_TEST_DEPLOYMENT.md)。REQ-23〜REQ-30。



