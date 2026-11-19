> 2026-10-22 アカウント運用変更：初期接続・初期管理者は開発担当、日常のGoogleアカウント登録・停止・削除・生徒紐付け・家庭URL再発行は管理者画面で行う。[現行仕様](../ACCOUNT_MANAGEMENT.md)を優先。Calendar未追加・本番未開始。

# GASローカル回帰テスト結果（DOC-GAS-TEST-001）

> 2026-10-21 設定進捗：FirebaseのWebアプリ登録・Google認証有効化・検証ドメイン保存と、検証GASの対象台帳操作・外部通信の承認を確認しました。本人UID登録と実Googleログイン、新GASのデプロイ・新サイトへの切替は未完了です。Calendarは未追加。本番運用は開始していません。[Step 08](../progress/2026-10-21-step-08.md)を参照。


> 2026-10-21仕様追補（未公開）: [開発者セットアップ・Google本人確認](../DEVELOPER_SETUP_OVERVIEW.md)を追加します。旧キー方式の結果は過去版の記録です。新方式のローカル試験と実Google・公開確認を分け、AT-24〜30の7件は未合格を維持します。

> 現行仕様（2026-10-20追加）: [管理者・家庭別ポータル／個別URL・QR](../PORTAL_SEPARATION.md)と[Step 06](../progress/2026-10-20-step-06.md)を優先してください。以下の旧実行結果は当時の版の記録です。現在はAT-23 PASS、AT-24〜30の7件未合格。新仕様の補足試験はGAS42件・フロント契約9件・実API読み取り11件を別集計し、元の30受入項目へ加算しません。

文書版: 2026-10-20 / 不合格6件修正・再試験版。実環境の受入済み・リリース済みを意味しない。

実行: 2026-10-19T17:00:22.283Z。方式: GAS VM stubs, no real Google。

合格38 / 不合格0 / 全38グループ。[不変の実行結果JSON](../../docs/acceptance/service-checks/2026-10-19T17-00-22-283Z/gas-results.json)。

これはGoogleサービスをスタブ化したNode VM試験。認証・家庭別認可・状態遷移・入力検証・再送・失敗注入・補償・ガードを確認する。ScriptLockの競合も模擬であり、実GAS同時実行や実カレンダー・実シート・異端末の検証ではない。AT-23〜30はこの試験に合格しても未実施のまま。

<a id="GAS-01"></a>
## GAS-01 Initialization keeps 8/12/7 columns, preserves data, adds no sample students: PASS

分類: schema。不具合: —。

対応する受入・要件・実装: [BF-01](01_BUSINESS_FLOWS.md#BF-01) / [UC-23](02_USE_CASES.md#UC-23) / [REQ-23](03_REQUIREMENTS.md#REQ-23) / [FS-23](04_FUNCTIONAL_SPEC.md#FS-23) / [TASK-23](05_TASKS.md#TASK-23) / [AT-23](06_ACCEPTANCE_TEST_SPEC.md#AT-23) / [CODE-23](07_TRACEABILITY_MATRIX.md#CODE-23) / [TEST-23](06_ACCEPTANCE_TEST_SPEC.md#TEST-23)

[テストコード:146](../../scripts/test_gas.cjs#L146) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Initialization keeps 8/12/7 columns, preserves data, adds no sample students. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-02"></a>
## GAS-02 GET cannot expose students/rides or invoke mutations: PASS

分類: authentication。不具合: DEF-05。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-19](02_USE_CASES.md#UC-19) / [REQ-19](03_REQUIREMENTS.md#REQ-19) / [FS-19](04_FUNCTIONAL_SPEC.md#FS-19) / [TASK-19](05_TASKS.md#TASK-19) / [AT-19](06_ACCEPTANCE_TEST_SPEC.md#AT-19) / [CODE-19](07_TRACEABILITY_MATRIX.md#CODE-19) / [TEST-19](06_ACCEPTANCE_TEST_SPEC.md#TEST-19)

[テストコード:151](../../scripts/test_gas.cjs#L151) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: GET cannot expose students/rides or invoke mutations. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-03"></a>
## GAS-03 Every POST action rejects missing/invalid keys before accessing data: PASS

分類: authentication。不具合: DEF-05。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-19](02_USE_CASES.md#UC-19) / [REQ-19](03_REQUIREMENTS.md#REQ-19) / [FS-19](04_FUNCTIONAL_SPEC.md#FS-19) / [TASK-19](05_TASKS.md#TASK-19) / [AT-19](06_ACCEPTANCE_TEST_SPEC.md#AT-19) / [CODE-19](07_TRACEABILITY_MATRIX.md#CODE-19) / [TEST-19](06_ACCEPTANCE_TEST_SPEC.md#TEST-19)

[テストコード:159](../../scripts/test_gas.cjs#L159) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Every POST action rejects missing/invalid keys before accessing data. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-04"></a>
## GAS-04 Missing/malformed/empty authentication configuration fails closed: PASS

分類: authentication。不具合: DEF-05。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-19](02_USE_CASES.md#UC-19) / [REQ-19](03_REQUIREMENTS.md#REQ-19) / [FS-19](04_FUNCTIONAL_SPEC.md#FS-19) / [TASK-19](05_TASKS.md#TASK-19) / [AT-19](06_ACCEPTANCE_TEST_SPEC.md#AT-19) / [CODE-19](07_TRACEABILITY_MATRIX.md#CODE-19) / [TEST-19](06_ACCEPTANCE_TEST_SPEC.md#TEST-19)

[テストコード:168](../../scripts/test_gas.cjs#L168) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Missing/malformed/empty authentication configuration fails closed. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-05"></a>
## GAS-05 Login returns server principal and ignores client-supplied role/scopes: PASS

分類: authentication。不具合: DEF-05, DEF-06。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-19](02_USE_CASES.md#UC-19) / [REQ-19](03_REQUIREMENTS.md#REQ-19) / [FS-19](04_FUNCTIONAL_SPEC.md#FS-19) / [TASK-19](05_TASKS.md#TASK-19) / [AT-19](06_ACCEPTANCE_TEST_SPEC.md#AT-19) / [CODE-19](07_TRACEABILITY_MATRIX.md#CODE-19) / [TEST-19](06_ACCEPTANCE_TEST_SPEC.md#TEST-19) / [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-20](02_USE_CASES.md#UC-20) / [REQ-20](03_REQUIREMENTS.md#REQ-20) / [FS-20](04_FUNCTIONAL_SPEC.md#FS-20) / [TASK-20](05_TASKS.md#TASK-20) / [AT-20](06_ACCEPTANCE_TEST_SPEC.md#AT-20) / [CODE-20](07_TRACEABILITY_MATRIX.md#CODE-20) / [TEST-20](06_ACCEPTANCE_TEST_SPEC.md#TEST-20)

[テストコード:179](../../scripts/test_gas.cjs#L179) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Login returns server principal and ignores client-supplied role/scopes. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-06"></a>
## GAS-06 Parent reads expose only mapped students and rides despite forged filters: PASS

分類: parent-authorization。不具合: DEF-06。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-20](02_USE_CASES.md#UC-20) / [REQ-20](03_REQUIREMENTS.md#REQ-20) / [FS-20](04_FUNCTIONAL_SPEC.md#FS-20) / [TASK-20](05_TASKS.md#TASK-20) / [AT-20](06_ACCEPTANCE_TEST_SPEC.md#AT-20) / [CODE-20](07_TRACEABILITY_MATRIX.md#CODE-20) / [TEST-20](06_ACCEPTANCE_TEST_SPEC.md#TEST-20)

[テストコード:186](../../scripts/test_gas.cjs#L186) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Parent reads expose only mapped students and rides despite forged filters. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-07"></a>
## GAS-07 A parent with no assignments receives no student or ride data: PASS

分類: parent-authorization。不具合: DEF-06。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-20](02_USE_CASES.md#UC-20) / [REQ-20](03_REQUIREMENTS.md#REQ-20) / [FS-20](04_FUNCTIONAL_SPEC.md#FS-20) / [TASK-20](05_TASKS.md#TASK-20) / [AT-20](06_ACCEPTANCE_TEST_SPEC.md#AT-20) / [CODE-20](07_TRACEABILITY_MATRIX.md#CODE-20) / [TEST-20](06_ACCEPTANCE_TEST_SPEC.md#TEST-20)

[テストコード:195](../../scripts/test_gas.cjs#L195) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: A parent with no assignments receives no student or ride data. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-08"></a>
## GAS-08 Parent cannot register students, add tickets or complete rides: PASS

分類: parent-authorization。不具合: DEF-05, DEF-06。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-19](02_USE_CASES.md#UC-19) / [REQ-19](03_REQUIREMENTS.md#REQ-19) / [FS-19](04_FUNCTIONAL_SPEC.md#FS-19) / [TASK-19](05_TASKS.md#TASK-19) / [AT-19](06_ACCEPTANCE_TEST_SPEC.md#AT-19) / [CODE-19](07_TRACEABILITY_MATRIX.md#CODE-19) / [TEST-19](06_ACCEPTANCE_TEST_SPEC.md#TEST-19) / [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-20](02_USE_CASES.md#UC-20) / [REQ-20](03_REQUIREMENTS.md#REQ-20) / [FS-20](04_FUNCTIONAL_SPEC.md#FS-20) / [TASK-20](05_TASKS.md#TASK-20) / [AT-20](06_ACCEPTANCE_TEST_SPEC.md#AT-20) / [CODE-20](07_TRACEABILITY_MATRIX.md#CODE-20) / [TEST-20](06_ACCEPTANCE_TEST_SPEC.md#TEST-20)

[テストコード:199](../../scripts/test_gas.cjs#L199) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Parent cannot register students, add tickets or complete rides. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-09"></a>
## GAS-09 Cross-family booking/cancellation uses authoritative student mapping: PASS

分類: parent-authorization。不具合: DEF-06。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-20](02_USE_CASES.md#UC-20) / [REQ-20](03_REQUIREMENTS.md#REQ-20) / [FS-20](04_FUNCTIONAL_SPEC.md#FS-20) / [TASK-20](05_TASKS.md#TASK-20) / [AT-20](06_ACCEPTANCE_TEST_SPEC.md#AT-20) / [CODE-20](07_TRACEABILITY_MATRIX.md#CODE-20) / [TEST-20](06_ACCEPTANCE_TEST_SPEC.md#TEST-20)

[テストコード:206](../../scripts/test_gas.cjs#L206) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Cross-family booking/cancellation uses authoritative student mapping. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-10"></a>
## GAS-10 Parent booking derives stored name/role and ignores supplied event ID: PASS

分類: parent-authorization。不具合: DEF-06。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-20](02_USE_CASES.md#UC-20) / [REQ-20](03_REQUIREMENTS.md#REQ-20) / [FS-20](04_FUNCTIONAL_SPEC.md#FS-20) / [TASK-20](05_TASKS.md#TASK-20) / [AT-20](06_ACCEPTANCE_TEST_SPEC.md#AT-20) / [CODE-20](07_TRACEABILITY_MATRIX.md#CODE-20) / [TEST-20](06_ACCEPTANCE_TEST_SPEC.md#TEST-20)

[テストコード:213](../../scripts/test_gas.cjs#L213) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Parent booking derives stored name/role and ignores supplied event ID. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-11"></a>
## GAS-11 Cancellation affects only stored event ID and is idempotent: PASS

分類: parent-authorization。不具合: DEF-06。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-20](02_USE_CASES.md#UC-20) / [REQ-20](03_REQUIREMENTS.md#REQ-20) / [FS-20](04_FUNCTIONAL_SPEC.md#FS-20) / [TASK-20](05_TASKS.md#TASK-20) / [AT-20](06_ACCEPTANCE_TEST_SPEC.md#AT-20) / [CODE-20](07_TRACEABILITY_MATRIX.md#CODE-20) / [TEST-20](06_ACCEPTANCE_TEST_SPEC.md#TEST-20)

[テストコード:219](../../scripts/test_gas.cjs#L219) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Cancellation affects only stored event ID and is idempotent. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-12"></a>
## GAS-12 Revocation and remapping take effect on the next request: PASS

分類: authentication。不具合: DEF-05, DEF-06。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-19](02_USE_CASES.md#UC-19) / [REQ-19](03_REQUIREMENTS.md#REQ-19) / [FS-19](04_FUNCTIONAL_SPEC.md#FS-19) / [TASK-19](05_TASKS.md#TASK-19) / [AT-19](06_ACCEPTANCE_TEST_SPEC.md#AT-19) / [CODE-19](07_TRACEABILITY_MATRIX.md#CODE-19) / [TEST-19](06_ACCEPTANCE_TEST_SPEC.md#TEST-19) / [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-20](02_USE_CASES.md#UC-20) / [REQ-20](03_REQUIREMENTS.md#REQ-20) / [FS-20](04_FUNCTIONAL_SPEC.md#FS-20) / [TASK-20](05_TASKS.md#TASK-20) / [AT-20](06_ACCEPTANCE_TEST_SPEC.md#AT-20) / [CODE-20](07_TRACEABILITY_MATRIX.md#CODE-20) / [TEST-20](06_ACCEPTANCE_TEST_SPEC.md#TEST-20)

[テストコード:224](../../scripts/test_gas.cjs#L224) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Revocation and remapping take effect on the next request. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-13"></a>
## GAS-13 Duplicate completion consumes only once, including after other purchases: PASS

分類: completion。不具合: DEF-01。

対応する受入・要件・実装: [BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-15](02_USE_CASES.md#UC-15) / [REQ-15](03_REQUIREMENTS.md#REQ-15) / [FS-15](04_FUNCTIONAL_SPEC.md#FS-15) / [TASK-15](05_TASKS.md#TASK-15) / [AT-15](06_ACCEPTANCE_TEST_SPEC.md#AT-15) / [CODE-15](07_TRACEABILITY_MATRIX.md#CODE-15) / [TEST-15](06_ACCEPTANCE_TEST_SPEC.md#TEST-15)

[テストコード:231](../../scripts/test_gas.cjs#L231) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Duplicate completion consumes only once, including after other purchases. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-14"></a>
## GAS-14 Roundtrip consumption is derived from stored type and tampering rejected: PASS

分類: completion。不具合: DEF-01, DEF-03。

対応する受入・要件・実装: [BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-15](02_USE_CASES.md#UC-15) / [REQ-15](03_REQUIREMENTS.md#REQ-15) / [FS-15](04_FUNCTIONAL_SPEC.md#FS-15) / [TASK-15](05_TASKS.md#TASK-15) / [AT-15](06_ACCEPTANCE_TEST_SPEC.md#AT-15) / [CODE-15](07_TRACEABILITY_MATRIX.md#CODE-15) / [TEST-15](06_ACCEPTANCE_TEST_SPEC.md#TEST-15) / [BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-17](02_USE_CASES.md#UC-17) / [REQ-17](03_REQUIREMENTS.md#REQ-17) / [FS-17](04_FUNCTIONAL_SPEC.md#FS-17) / [TASK-17](05_TASKS.md#TASK-17) / [AT-17](06_ACCEPTANCE_TEST_SPEC.md#AT-17) / [CODE-17](07_TRACEABILITY_MATRIX.md#CODE-17) / [TEST-17](06_ACCEPTANCE_TEST_SPEC.md#TEST-17)

[テストコード:236](../../scripts/test_gas.cjs#L236) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Roundtrip consumption is derived from stored type and tampering rejected. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-15"></a>
## GAS-15 Cancelled completion and completed cancellation have no side effects: PASS

分類: completion。不具合: DEF-02。

対応する受入・要件・実装: [BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-16](02_USE_CASES.md#UC-16) / [REQ-16](03_REQUIREMENTS.md#REQ-16) / [FS-16](04_FUNCTIONAL_SPEC.md#FS-16) / [TASK-16](05_TASKS.md#TASK-16) / [AT-16](06_ACCEPTANCE_TEST_SPEC.md#AT-16) / [CODE-16](07_TRACEABILITY_MATRIX.md#CODE-16) / [TEST-16](06_ACCEPTANCE_TEST_SPEC.md#TEST-16)

[テストコード:242](../../scripts/test_gas.cjs#L242) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Cancelled completion and completed cancellation have no side effects. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-16"></a>
## GAS-16 Insufficient/corrupt balances and missing targets never complete a ride: PASS

分類: completion。不具合: DEF-01, DEF-03。

対応する受入・要件・実装: [BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-15](02_USE_CASES.md#UC-15) / [REQ-15](03_REQUIREMENTS.md#REQ-15) / [FS-15](04_FUNCTIONAL_SPEC.md#FS-15) / [TASK-15](05_TASKS.md#TASK-15) / [AT-15](06_ACCEPTANCE_TEST_SPEC.md#AT-15) / [CODE-15](07_TRACEABILITY_MATRIX.md#CODE-15) / [TEST-15](06_ACCEPTANCE_TEST_SPEC.md#TEST-15) / [BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-17](02_USE_CASES.md#UC-17) / [REQ-17](03_REQUIREMENTS.md#REQ-17) / [FS-17](04_FUNCTIONAL_SPEC.md#FS-17) / [TASK-17](05_TASKS.md#TASK-17) / [AT-17](06_ACCEPTANCE_TEST_SPEC.md#AT-17) / [CODE-17](07_TRACEABILITY_MATRIX.md#CODE-17) / [TEST-17](06_ACCEPTANCE_TEST_SPEC.md#TEST-17)

[テストコード:246](../../scripts/test_gas.cjs#L246) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Insufficient/corrupt balances and missing targets never complete a ride. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-17"></a>
## GAS-17 Contending completion cannot enter locked mutation, retry becomes replay: PASS

分類: concurrency。不具合: DEF-01。

対応する受入・要件・実装: [BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-15](02_USE_CASES.md#UC-15) / [REQ-15](03_REQUIREMENTS.md#REQ-15) / [FS-15](04_FUNCTIONAL_SPEC.md#FS-15) / [TASK-15](05_TASKS.md#TASK-15) / [AT-15](06_ACCEPTANCE_TEST_SPEC.md#AT-15) / [CODE-15](07_TRACEABILITY_MATRIX.md#CODE-15) / [TEST-15](06_ACCEPTANCE_TEST_SPEC.md#TEST-15) / [BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-27](02_USE_CASES.md#UC-27) / [REQ-27](03_REQUIREMENTS.md#REQ-27) / [FS-27](04_FUNCTIONAL_SPEC.md#FS-27) / [TASK-27](05_TASKS.md#TASK-27) / [AT-27](06_ACCEPTANCE_TEST_SPEC.md#AT-27) / [CODE-27](07_TRACEABILITY_MATRIX.md#CODE-27) / [TEST-27](06_ACCEPTANCE_TEST_SPEC.md#TEST-27)

[テストコード:253](../../scripts/test_gas.cjs#L253) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Contending completion cannot enter locked mutation, retry becomes replay. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-18"></a>
## GAS-18 Negative/fraction/nonfinite/nonnumeric ticket quantities rejected before writes: PASS

分類: validation。不具合: DEF-03。

対応する受入・要件・実装: [BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-17](02_USE_CASES.md#UC-17) / [REQ-17](03_REQUIREMENTS.md#REQ-17) / [FS-17](04_FUNCTIONAL_SPEC.md#FS-17) / [TASK-17](05_TASKS.md#TASK-17) / [AT-17](06_ACCEPTANCE_TEST_SPEC.md#AT-17) / [CODE-17](07_TRACEABILITY_MATRIX.md#CODE-17) / [TEST-17](06_ACCEPTANCE_TEST_SPEC.md#TEST-17)

[テストコード:259](../../scripts/test_gas.cjs#L259) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Negative/fraction/nonfinite/nonnumeric ticket quantities rejected before writes. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-19"></a>
## GAS-19 Invalid amounts and initial balances rejected, zero amount allowed: PASS

分類: validation。不具合: DEF-03。

対応する受入・要件・実装: [BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-17](02_USE_CASES.md#UC-17) / [REQ-17](03_REQUIREMENTS.md#REQ-17) / [FS-17](04_FUNCTIONAL_SPEC.md#FS-17) / [TASK-17](05_TASKS.md#TASK-17) / [AT-17](06_ACCEPTANCE_TEST_SPEC.md#AT-17) / [CODE-17](07_TRACEABILITY_MATRIX.md#CODE-17) / [TEST-17](06_ACCEPTANCE_TEST_SPEC.md#TEST-17)

[テストコード:266](../../scripts/test_gas.cjs#L266) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Invalid amounts and initial balances rejected, zero amount allowed. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-20"></a>
## GAS-20 Safe-integer overflow, missing students and unknown IDs cause no writes: PASS

分類: validation。不具合: DEF-03。

対応する受入・要件・実装: [BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-17](02_USE_CASES.md#UC-17) / [REQ-17](03_REQUIREMENTS.md#REQ-17) / [FS-17](04_FUNCTIONAL_SPEC.md#FS-17) / [TASK-17](05_TASKS.md#TASK-17) / [AT-17](06_ACCEPTANCE_TEST_SPEC.md#AT-17) / [CODE-17](07_TRACEABILITY_MATRIX.md#CODE-17) / [TEST-17](06_ACCEPTANCE_TEST_SPEC.md#TEST-17)

[テストコード:274](../../scripts/test_gas.cjs#L274) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Safe-integer overflow, missing students and unknown IDs cause no writes. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-21"></a>
## GAS-21 Invalid reservation date/time/type and empty fields precede calendar work: PASS

分類: validation。不具合: DEF-03, DEF-04。

対応する受入・要件・実装: [BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-17](02_USE_CASES.md#UC-17) / [REQ-17](03_REQUIREMENTS.md#REQ-17) / [FS-17](04_FUNCTIONAL_SPEC.md#FS-17) / [TASK-17](05_TASKS.md#TASK-17) / [AT-17](06_ACCEPTANCE_TEST_SPEC.md#AT-17) / [CODE-17](07_TRACEABILITY_MATRIX.md#CODE-17) / [TEST-17](06_ACCEPTANCE_TEST_SPEC.md#TEST-17) / [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

[テストコード:281](../../scripts/test_gas.cjs#L281) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Invalid reservation date/time/type and empty fields precede calendar work. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-22"></a>
## GAS-22 Reservation retry creates one event/row and rejects changed-payload collision: PASS

分類: idempotency。不具合: DEF-01, DEF-04。

対応する受入・要件・実装: [BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-15](02_USE_CASES.md#UC-15) / [REQ-15](03_REQUIREMENTS.md#REQ-15) / [FS-15](04_FUNCTIONAL_SPEC.md#FS-15) / [TASK-15](05_TASKS.md#TASK-15) / [AT-15](06_ACCEPTANCE_TEST_SPEC.md#AT-15) / [CODE-15](07_TRACEABILITY_MATRIX.md#CODE-15) / [TEST-15](06_ACCEPTANCE_TEST_SPEC.md#TEST-15) / [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

[テストコード:288](../../scripts/test_gas.cjs#L288) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Reservation retry creates one event/row and rejects changed-payload collision. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-23"></a>
## GAS-23 Purchase retry credits once and collision never overwrites a previous purchase: PASS

分類: idempotency。不具合: DEF-01, DEF-03。

対応する受入・要件・実装: [BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-15](02_USE_CASES.md#UC-15) / [REQ-15](03_REQUIREMENTS.md#REQ-15) / [FS-15](04_FUNCTIONAL_SPEC.md#FS-15) / [TASK-15](05_TASKS.md#TASK-15) / [AT-15](06_ACCEPTANCE_TEST_SPEC.md#AT-15) / [CODE-15](07_TRACEABILITY_MATRIX.md#CODE-15) / [TEST-15](06_ACCEPTANCE_TEST_SPEC.md#TEST-15) / [BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-17](02_USE_CASES.md#UC-17) / [REQ-17](03_REQUIREMENTS.md#REQ-17) / [FS-17](04_FUNCTIONAL_SPEC.md#FS-17) / [TASK-17](05_TASKS.md#TASK-17) / [AT-17](06_ACCEPTANCE_TEST_SPEC.md#AT-17) / [CODE-17](07_TRACEABILITY_MATRIX.md#CODE-17) / [TEST-17](06_ACCEPTANCE_TEST_SPEC.md#TEST-17)

[テストコード:294](../../scripts/test_gas.cjs#L294) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Purchase retry credits once and collision never overwrites a previous purchase. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-24"></a>
## GAS-24 Student registration has stable-ID replay and rejects conflicting IDs: PASS

分類: idempotency。不具合: DEF-04。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

[テストコード:300](../../scripts/test_gas.cjs#L300) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Student registration has stable-ID replay and rejects conflicting IDs. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-25"></a>
## GAS-25 Calendar creation exception is never success and retains an uncertainty guard: PASS

分類: failures。不具合: DEF-04。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

[テストコード:306](../../scripts/test_gas.cjs#L306) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Calendar creation exception is never success and retains an uncertainty guard. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-26"></a>
## GAS-26 Reservation append failure before/after write removes event/row and allows retry: PASS

分類: failures。不具合: DEF-04。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

[テストコード:315](../../scripts/test_gas.cjs#L315) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Reservation append failure before/after write removes event/row and allows retry. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-27"></a>
## GAS-27 Completion rollback restores balance/status/timestamp for every failed write: PASS

分類: failures。不具合: DEF-01, DEF-04。

対応する受入・要件・実装: [BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-15](02_USE_CASES.md#UC-15) / [REQ-15](03_REQUIREMENTS.md#REQ-15) / [FS-15](04_FUNCTIONAL_SPEC.md#FS-15) / [TASK-15](05_TASKS.md#TASK-15) / [AT-15](06_ACCEPTANCE_TEST_SPEC.md#AT-15) / [CODE-15](07_TRACEABILITY_MATRIX.md#CODE-15) / [TEST-15](06_ACCEPTANCE_TEST_SPEC.md#TEST-15) / [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

[テストコード:321](../../scripts/test_gas.cjs#L321) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Completion rollback restores balance/status/timestamp for every failed write. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-28"></a>
## GAS-28 Purchase failures compensate both history and balance, retries credit once: PASS

分類: failures。不具合: DEF-03, DEF-04。

対応する受入・要件・実装: [BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-17](02_USE_CASES.md#UC-17) / [REQ-17](03_REQUIREMENTS.md#REQ-17) / [FS-17](04_FUNCTIONAL_SPEC.md#FS-17) / [TASK-17](05_TASKS.md#TASK-17) / [AT-17](06_ACCEPTANCE_TEST_SPEC.md#AT-17) / [CODE-17](07_TRACEABILITY_MATRIX.md#CODE-17) / [TEST-17](06_ACCEPTANCE_TEST_SPEC.md#TEST-17) / [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

[テストコード:329](../../scripts/test_gas.cjs#L329) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Purchase failures compensate both history and balance, retries credit once. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-29"></a>
## GAS-29 Student create append failure compensates, no fabricated success row: PASS

分類: failures。不具合: DEF-04。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

[テストコード:335](../../scripts/test_gas.cjs#L335) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Student create append failure compensates, no fabricated success row. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-30"></a>
## GAS-30 Calendar deletion failure never claims cancellation, blocks unsafe replay: PASS

分類: failures。不具合: DEF-04。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

[テストコード:341](../../scripts/test_gas.cjs#L341) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Calendar deletion failure never claims cancellation, blocks unsafe replay. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-31"></a>
## GAS-31 Cancellation sheet failure does not delete the calendar event: PASS

分類: failures。不具合: DEF-04。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

[テストコード:349](../../scripts/test_gas.cjs#L349) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Cancellation sheet failure does not delete the calendar event. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-32"></a>
## GAS-32 Read/calendar-lookup/missing-sheet errors propagate without data or mutation: PASS

分類: failures。不具合: DEF-04。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

[テストコード:355](../../scripts/test_gas.cjs#L355) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Read/calendar-lookup/missing-sheet errors propagate without data or mutation. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-33"></a>
## GAS-33 Failed compensation keeps durable guard; login works but data/mutations block: PASS

分類: failures。不具合: DEF-01, DEF-04。

対応する受入・要件・実装: [BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-15](02_USE_CASES.md#UC-15) / [REQ-15](03_REQUIREMENTS.md#REQ-15) / [FS-15](04_FUNCTIONAL_SPEC.md#FS-15) / [TASK-15](05_TASKS.md#TASK-15) / [AT-15](06_ACCEPTANCE_TEST_SPEC.md#AT-15) / [CODE-15](07_TRACEABILITY_MATRIX.md#CODE-15) / [TEST-15](06_ACCEPTANCE_TEST_SPEC.md#TEST-15) / [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

[テストコード:360](../../scripts/test_gas.cjs#L360) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Failed compensation keeps durable guard; login works but data/mutations block. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-34"></a>
## GAS-34 Guard write failure prevents writes; failed guard deletion compensates safely: PASS

分類: failures。不具合: DEF-04。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

[テストコード:367](../../scripts/test_gas.cjs#L367) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Guard write failure prevents writes; failed guard deletion compensates safely. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-35"></a>
## GAS-35 After irreversible calendar deletion, guard-delete failure restores guard even if applied: PASS

分類: failures。不具合: DEF-04。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

[テストコード:374](../../scripts/test_gas.cjs#L374) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: After irreversible calendar deletion, guard-delete failure restores guard even if applied. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-36"></a>
## GAS-36 Malformed JSON, unknown/prototype actions and remote init are rejected: PASS

分類: validation。不具合: DEF-05。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-19](02_USE_CASES.md#UC-19) / [REQ-19](03_REQUIREMENTS.md#REQ-19) / [FS-19](04_FUNCTIONAL_SPEC.md#FS-19) / [TASK-19](05_TASKS.md#TASK-19) / [AT-19](06_ACCEPTANCE_TEST_SPEC.md#AT-19) / [CODE-19](07_TRACEABILITY_MATRIX.md#CODE-19) / [TEST-19](06_ACCEPTANCE_TEST_SPEC.md#TEST-19)

[テストコード:379](../../scripts/test_gas.cjs#L379) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Malformed JSON, unknown/prototype actions and remote init are rejected. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-37"></a>
## GAS-37 Duplicate authoritative IDs fail closed instead of updating an arbitrary row: PASS

分類: validation。不具合: DEF-04。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

[テストコード:385](../../scripts/test_gas.cjs#L385) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: Duplicate authoritative IDs fail closed instead of updating an arbitrary row. Google service interactions are stubs; related real integration acceptance remains pending.

<a id="GAS-38"></a>
## GAS-38 User text is stored as literal text and date cells normalize to JST: PASS

分類: validation。不具合: DEF-04。

対応する受入・要件・実装: [BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

[テストコード:388](../../scripts/test_gas.cjs#L388) / [実装GAS](../../gas/Code.gs)。

実測: Offline GAS VM assertion: User text is stored as literal text and date cells normalize to JST. Google service interactions are stubs; related real integration acceptance remains pending.

ソースSHA-256:

| ファイル | SHA-256 |
| --- | --- |
| gas/Code.gs | 4e1af3401186e0bab1e1afeb0345e0d0fe05c6d5cb50aeec01a1c069df4baf6c |
| scripts/test_gas.cjs | 15825c8cf88928d6e767aa3473c608fd6a012f5d43d41e242a960e9c4babc47e |




