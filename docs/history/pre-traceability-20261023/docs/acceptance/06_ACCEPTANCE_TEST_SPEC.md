> 2026-10-22 アカウント運用変更：初期接続・初期管理者は開発担当、日常のGoogleアカウント登録・停止・削除・生徒紐付け・家庭URL再発行は管理者画面で行う。[現行仕様](../ACCOUNT_MANAGEMENT.md)を優先。Calendar未追加・本番未開始。

# 受入テスト仕様書（DOC-AT-001）

> 2026-10-22 追加条件：Googleログインは顧客意向確認待ち。本番リリース前に開発担当者以外が全30項目を実施し全件合格すること。[第三者受入](THIRD_PARTY_ACCEPTANCE.md)は0/30件。公開先の台帳読込障害は未解決。Calendar未追加・本番未開始。

> 2026-10-21 設定進捗：FirebaseのWebアプリ登録・Google認証有効化・検証ドメイン保存と、検証GASの対象台帳操作・外部通信の承認を確認しました。本人UID登録と実Googleログイン、新GASのデプロイ・新サイトへの切替は未完了です。Calendarは未追加。本番運用は開始していません。[Step 08](../progress/2026-10-21-step-08.md)を参照。


> 2026-10-21仕様追補（未公開）: [開発者セットアップ・Google本人確認](../DEVELOPER_SETUP_OVERVIEW.md)を追加します。旧キー方式の結果は過去版の記録です。新方式のローカル試験と実Google・公開確認を分け、AT-24〜30の7件は未合格を維持します。

> 現行仕様（2026-10-20追加）: [管理者・家庭別ポータル／個別URL・QR](../PORTAL_SEPARATION.md)と[Step 06](../progress/2026-10-20-step-06.md)を優先してください。以下の旧実行結果は当時の版の記録です。現在はAT-23 PASS、AT-24〜30の7件未合格。新仕様の補足試験はGAS42件・フロント契約9件・実API読み取り11件を別集計し、元の30受入項目へ加算しません。

文書版: 2026-10-20 / 不合格6件修正・再試験版。実環境の受入済み・リリース済みを意味しない。

対象版: results.jsonのcommitとsourceHashesで識別。時刻: Asia/Tokyo、実測のタイムスタンプはUTCを併記。

再実行: リポジトリで npm ci → npm run build → npm run lint -- --threads=1 → node scripts/test_gas.cjs → node scripts/run_acceptance.cjs → node scripts/generate_acceptance_docs.cjs → node scripts/validate_acceptance.cjs。PCメモリ不足時はRAYON_NUM_THREADS=1、UV_THREADPOOL_SIZE=2を設定。実行はローカル4179番を使用、既存同ポートは停止せず起動失敗扱い。テスト専用の新規headless-shellブラウザと同プロセス内HTTPサーバーを終了する。インストール済みWindows chrome-headless-shellを使用する。ビルド後に製品ソースを変更せず、distとソースのハッシュを保存する。

自動22件はビルド済みdist画面とTypeScriptで変換した現ソースAPIを読み込み、API・LocalStorageの値をassertし画面を採取。画面操作を行う項目とサービス呼出を行う項目を以下に明記。実Google APIへの外部通信は禁止しているため外部8件の代替証明にはならない。各自動ケースは保存データ・セッションを初期化。未認証確認AT-19以外は明示的に管理者/保護者デモを開く。STU-001残7・STU-002残1・STU-003残0、初期予約3件（保護者には自家庭分のみ）・購入履歴空。AT-18はローカル模擬APIログイン後の通信失敗とUIエラーを検証する。実GAS接続ではない。ダミー情報のみ。

合格: 全期待値assert成功。失敗: 差異または実行例外。BLOCKED: 実環境・前提不足。画面だけで内部データ・同期・排他を合格としない。自動の画面証跡は観測データJSONと組み合わせる。実機・見た目の最終承認はAT-29で別途実施。未実施ケースに画像を捏造しない。

<a id="AT-01"></a>
<a id="TEST-01"></a>
## AT-01 Google連携先の設定保存

[BF-01](01_BUSINESS_FLOWS.md#BF-01) / [UC-01](02_USE_CASES.md#UC-01) / [REQ-01](03_REQUIREMENTS.md#REQ-01) / [FS-01](04_FUNCTIONAL_SPEC.md#FS-01) / [TASK-01](05_TASKS.md#TASK-01) / [AT-01](06_ACCEPTANCE_TEST_SPEC.md#AT-01) / [CODE-01](07_TRACEABILITY_MATRIX.md#CODE-01) / [TEST-01](06_ACCEPTANCE_TEST_SPEC.md#TEST-01)

前提・データ: テスト用URLのみ使用。

手順: Google連携画面でURLを入力し保存・再読込。

期待結果: 保存したURLが再読込後も一致。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-01']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-01の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-02"></a>
<a id="TEST-02"></a>
## AT-02 生徒登録

[BF-02](01_BUSINESS_FLOWS.md#BF-02) / [UC-02](02_USE_CASES.md#UC-02) / [REQ-02](03_REQUIREMENTS.md#REQ-02) / [FS-02](04_FUNCTIONAL_SPEC.md#FS-02) / [TASK-02](05_TASKS.md#TASK-02) / [AT-02](06_ACCEPTANCE_TEST_SPEC.md#AT-02) / [CODE-02](07_TRACEABILITY_MATRIX.md#CODE-02) / [TEST-02](06_ACCEPTANCE_TEST_SPEC.md#TEST-02)

前提・データ: ダミー台帳。

手順: 生徒登録画面で氏名・保護者・住所・連絡先・初期10回を登録。

期待結果: 生徒が1件増え全入力値と初期残高10が保存される。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-02']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-02の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-03"></a>
<a id="TEST-03"></a>
## AT-03 保護者の残数確認

[BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-03](02_USE_CASES.md#UC-03) / [REQ-03](03_REQUIREMENTS.md#REQ-03) / [FS-03](04_FUNCTIONAL_SPEC.md#FS-03) / [TASK-03](05_TASKS.md#TASK-03) / [AT-03](06_ACCEPTANCE_TEST_SPEC.md#AT-03) / [CODE-03](07_TRACEABILITY_MATRIX.md#CODE-03) / [TEST-03](06_ACCEPTANCE_TEST_SPEC.md#TEST-03)

前提・データ: 初期生徒STU-001が7回。

手順: 利用者画面で生徒を選択。

期待結果: 氏名と7回分・片道1枚の説明が表示される。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-03']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-03の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-04"></a>
<a id="TEST-04"></a>
## AT-04 残少・ゼロ案内

[BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-04](02_USE_CASES.md#UC-04) / [REQ-04](03_REQUIREMENTS.md#REQ-04) / [FS-04](04_FUNCTIONAL_SPEC.md#FS-04) / [TASK-04](05_TASKS.md#TASK-04) / [AT-04](06_ACCEPTANCE_TEST_SPEC.md#AT-04) / [CODE-04](07_TRACEABILITY_MATRIX.md#CODE-04) / [TEST-04](06_ACCEPTANCE_TEST_SPEC.md#TEST-04)

前提・データ: 残高2・1・0の各生徒。

手順: 各残高で利用者画面を開く。

期待結果: 各値でMauro・Brendaへの連絡案内が表示される。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-04']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-04の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-05"></a>
<a id="TEST-05"></a>
## AT-05 チケット追加

[BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-05](02_USE_CASES.md#UC-05) / [REQ-05](03_REQUIREMENTS.md#REQ-05) / [FS-05](04_FUNCTIONAL_SPEC.md#FS-05) / [TASK-05](05_TASKS.md#TASK-05) / [AT-05](06_ACCEPTANCE_TEST_SPEC.md#AT-05) / [CODE-05](07_TRACEABILITY_MATRIX.md#CODE-05) / [TEST-05](06_ACCEPTANCE_TEST_SPEC.md#TEST-05)

前提・データ: 初期残高7。

手順: 10回を追加し台帳・購入履歴を確認。

期待結果: 残高17、履歴1件増、枚数10・金額・備考一致。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-05']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-05の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-06"></a>
<a id="TEST-06"></a>
## AT-06 保護者のお迎え予約

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-06](02_USE_CASES.md#UC-06) / [REQ-06](03_REQUIREMENTS.md#REQ-06) / [FS-06](04_FUNCTIONAL_SPEC.md#FS-06) / [TASK-06](05_TASKS.md#TASK-06) / [AT-06](06_ACCEPTANCE_TEST_SPEC.md#AT-06) / [CODE-06](07_TRACEABILITY_MATRIX.md#CODE-06) / [TEST-06](06_ACCEPTANCE_TEST_SPEC.md#TEST-06)

前提・データ: 残高7・明示選択したデモ。

手順: 利用者画面から2026-10-20 16:30・お迎え・登録済み住所を使って予約。

期待結果: 新規予約1件、scheduled、parent、残高7のまま。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-06']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-06の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-07"></a>
<a id="TEST-07"></a>
## AT-07 送り予約

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-07](02_USE_CASES.md#UC-07) / [REQ-07](03_REQUIREMENTS.md#REQ-07) / [FS-07](04_FUNCTIONAL_SPEC.md#FS-07) / [TASK-07](05_TASKS.md#TASK-07) / [AT-07](06_ACCEPTANCE_TEST_SPEC.md#AT-07) / [CODE-07](07_TRACEABILITY_MATRIX.md#CODE-07) / [TEST-07](06_ACCEPTANCE_TEST_SPEC.md#TEST-07)

前提・データ: 残高7・未接続デモ。

手順: サービス経由で送り17:30を登録し画面を再表示。

期待結果: dropoffの予約が1件増え、残高7のまま。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-07']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-07の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-08"></a>
<a id="TEST-08"></a>
## AT-08 往復予約

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-08](02_USE_CASES.md#UC-08) / [REQ-08](03_REQUIREMENTS.md#REQ-08) / [FS-08](04_FUNCTIONAL_SPEC.md#FS-08) / [TASK-08](05_TASKS.md#TASK-08) / [AT-08](06_ACCEPTANCE_TEST_SPEC.md#AT-08) / [CODE-08](07_TRACEABILITY_MATRIX.md#CODE-08) / [TEST-08](06_ACCEPTANCE_TEST_SPEC.md#TEST-08)

前提・データ: 残高7・未接続デモ。

手順: サービス経由で往復を登録し画面を再表示。

期待結果: roundtripの予約が1件増え、予約時残高7のまま。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-08']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-08の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-09"></a>
<a id="TEST-09"></a>
## AT-09 管理者の代理予約

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-09](02_USE_CASES.md#UC-09) / [REQ-09](03_REQUIREMENTS.md#REQ-09) / [FS-09](04_FUNCTIONAL_SPEC.md#FS-09) / [TASK-09](05_TASKS.md#TASK-09) / [AT-09](06_ACCEPTANCE_TEST_SPEC.md#AT-09) / [CODE-09](07_TRACEABILITY_MATRIX.md#CODE-09) / [TEST-09](06_ACCEPTANCE_TEST_SPEC.md#TEST-09)

前提・データ: 初期台帳。

手順: 管理者画面から日時・生徒・場所を指定して予約。

期待結果: 新規予約1件、reservedBy=teacher。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-09']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-09の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-10"></a>
<a id="TEST-10"></a>
## AT-10 保護者の予約取消

[BF-05](01_BUSINESS_FLOWS.md#BF-05) / [UC-10](02_USE_CASES.md#UC-10) / [REQ-10](03_REQUIREMENTS.md#REQ-10) / [FS-10](04_FUNCTIONAL_SPEC.md#FS-10) / [TASK-10](05_TASKS.md#TASK-10) / [AT-10](06_ACCEPTANCE_TEST_SPEC.md#AT-10) / [CODE-10](07_TRACEABILITY_MATRIX.md#CODE-10) / [TEST-10](06_ACCEPTANCE_TEST_SPEC.md#TEST-10)

前提・データ: 保護者予約1件・残高7。

手順: 利用者画面で対象予約をキャンセルし確認を承諾。

期待結果: 対象IDがcancelled、残高7のまま。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-10']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-10の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-11"></a>
<a id="TEST-11"></a>
## AT-11 管理者の予約取消

[BF-05](01_BUSINESS_FLOWS.md#BF-05) / [UC-11](02_USE_CASES.md#UC-11) / [REQ-11](03_REQUIREMENTS.md#REQ-11) / [FS-11](04_FUNCTIONAL_SPEC.md#FS-11) / [TASK-11](05_TASKS.md#TASK-11) / [AT-11](06_ACCEPTANCE_TEST_SPEC.md#AT-11) / [CODE-11](07_TRACEABILITY_MATRIX.md#CODE-11) / [TEST-11](06_ACCEPTANCE_TEST_SPEC.md#TEST-11)

前提・データ: 予約1件。

手順: サービス経由で取消後に管理画面を再表示。

期待結果: 対象IDがcancelled、残数不変。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-11']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-11の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-12"></a>
<a id="TEST-12"></a>
## AT-12 当日一覧・地図リンク

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-12](02_USE_CASES.md#UC-12) / [REQ-12](03_REQUIREMENTS.md#REQ-12) / [FS-12](04_FUNCTIONAL_SPEC.md#FS-12) / [TASK-12](05_TASKS.md#TASK-12) / [AT-12](06_ACCEPTANCE_TEST_SPEC.md#AT-12) / [CODE-12](07_TRACEABILITY_MATRIX.md#CODE-12) / [TEST-12](06_ACCEPTANCE_TEST_SPEC.md#TEST-12)

前提・データ: 初期当日予約。

手順: 管理者画面を開き地図リンクを調べる。

期待結果: 当日予約とGoogle Maps検索URLが表示される（地図先の動作は対象外）。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-12']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-12の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-13"></a>
<a id="TEST-13"></a>
## AT-13 片道完了

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-13](02_USE_CASES.md#UC-13) / [REQ-13](03_REQUIREMENTS.md#REQ-13) / [FS-13](04_FUNCTIONAL_SPEC.md#FS-13) / [TASK-13](05_TASKS.md#TASK-13) / [AT-13](06_ACCEPTANCE_TEST_SPEC.md#AT-13) / [CODE-13](07_TRACEABILITY_MATRIX.md#CODE-13) / [TEST-13](06_ACCEPTANCE_TEST_SPEC.md#TEST-13)

前提・データ: 残高7・お迎え予約。

手順: サービス経由で完了後に画面を再表示。

期待結果: completed・完了日時あり・残高6。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-13']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-13の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-14"></a>
<a id="TEST-14"></a>
## AT-14 往復完了

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-14](02_USE_CASES.md#UC-14) / [REQ-14](03_REQUIREMENTS.md#REQ-14) / [FS-14](04_FUNCTIONAL_SPEC.md#FS-14) / [TASK-14](05_TASKS.md#TASK-14) / [AT-14](06_ACCEPTANCE_TEST_SPEC.md#AT-14) / [CODE-14](07_TRACEABILITY_MATRIX.md#CODE-14) / [TEST-14](06_ACCEPTANCE_TEST_SPEC.md#TEST-14)

前提・データ: 残高7・往復予約。

手順: サービス経由で往復完了後に画面を再表示。

期待結果: completed・残高5・消費2。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-14']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-14の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-15"></a>
<a id="TEST-15"></a>
## AT-15 完了の二重処理防止

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-15](02_USE_CASES.md#UC-15) / [REQ-15](03_REQUIREMENTS.md#REQ-15) / [FS-15](04_FUNCTIONAL_SPEC.md#FS-15) / [TASK-15](05_TASKS.md#TASK-15) / [AT-15](06_ACCEPTANCE_TEST_SPEC.md#AT-15) / [CODE-15](07_TRACEABILITY_MATRIX.md#CODE-15) / [TEST-15](06_ACCEPTANCE_TEST_SPEC.md#TEST-15)

前提・データ: 管理者デモ・残高7・片道予約。

手順: 同じ予約IDに完了を2回要求。

期待結果: 最終残高6、completedを保持、再処理の消費枚数0。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-15']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-15の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-16"></a>
<a id="TEST-16"></a>
## AT-16 取消済みの完了拒否

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-16](02_USE_CASES.md#UC-16) / [REQ-16](03_REQUIREMENTS.md#REQ-16) / [FS-16](04_FUNCTIONAL_SPEC.md#FS-16) / [TASK-16](05_TASKS.md#TASK-16) / [AT-16](06_ACCEPTANCE_TEST_SPEC.md#AT-16) / [CODE-16](07_TRACEABILITY_MATRIX.md#CODE-16) / [TEST-16](06_ACCEPTANCE_TEST_SPEC.md#TEST-16)

前提・データ: 残高7・取消済み予約。

手順: 取消済みIDを完了要求。

期待結果: cancelledを保持し残高7のまま。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-16']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-16の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-17"></a>
<a id="TEST-17"></a>
## AT-17 不正なチケット追加拒否

[BF-03](01_BUSINESS_FLOWS.md#BF-03) / [UC-17](02_USE_CASES.md#UC-17) / [REQ-17](03_REQUIREMENTS.md#REQ-17) / [FS-17](04_FUNCTIONAL_SPEC.md#FS-17) / [TASK-17](05_TASKS.md#TASK-17) / [AT-17](06_ACCEPTANCE_TEST_SPEC.md#AT-17) / [CODE-17](07_TRACEABILITY_MATRIX.md#CODE-17) / [TEST-17](06_ACCEPTANCE_TEST_SPEC.md#TEST-17)

前提・データ: 管理者デモ・残高7。

手順: 枚数に-1/0/小数/NaN/Infinity/101、金額に負数/小数/NaN/Infinityを渡す。

期待結果: 全要求が拒否され残高7・購入履歴が不変。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-17']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-17の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-18"></a>
<a id="TEST-18"></a>
## AT-18 通信障害時に成功扱いしない

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-18](02_USE_CASES.md#UC-18) / [REQ-18](03_REQUIREMENTS.md#REQ-18) / [FS-18](04_FUNCTIONAL_SPEC.md#FS-18) / [TASK-18](05_TASKS.md#TASK-18) / [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [CODE-18](07_TRACEABILITY_MATRIX.md#CODE-18) / [TEST-18](06_ACCEPTANCE_TEST_SPEC.md#TEST-18)

前提・データ: ローカル模擬APIへのログイン・通信障害注入。

手順: 全5更新POSTを通信失敗させる。業務エラー/HTTP503/不正JSONも拒否確認。同一予約を再試行しUIでも予約する。

期待結果: すべて拒否、ローカル台帳不変、同一内容再試行の予約ID不変、UIにエラー表示してフォーム維持。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-18']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-18の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-19"></a>
<a id="TEST-19"></a>
## AT-19 未認証の管理操作を拒否

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-19](02_USE_CASES.md#UC-19) / [REQ-19](03_REQUIREMENTS.md#REQ-19) / [FS-19](04_FUNCTIONAL_SPEC.md#FS-19) / [TASK-19](05_TASKS.md#TASK-19) / [AT-19](06_ACCEPTANCE_TEST_SPEC.md#AT-19) / [CODE-19](07_TRACEABILITY_MATRIX.md#CODE-19) / [TEST-19](06_ACCEPTANCE_TEST_SPEC.md#TEST-19)

前提・データ: セッション・保存データなしの新規画面。

手順: 未認証の画面とAPI拒否を確認。その後ローカル模擬APIでログインし、キー失効応答を注入する。

期待結果: 認証前はログイン画面のみ・台帳未生成。キー失効応答後はセッションと画面の個人情報を消しログイン画面に戻る。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-19']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-19の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-20"></a>
<a id="TEST-20"></a>
## AT-20 保護者の家庭別アクセス制限

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-20](02_USE_CASES.md#UC-20) / [REQ-20](03_REQUIREMENTS.md#REQ-20) / [FS-20](04_FUNCTIONAL_SPEC.md#FS-20) / [TASK-20](05_TASKS.md#TASK-20) / [AT-20](06_ACCEPTANCE_TEST_SPEC.md#AT-20) / [CODE-20](07_TRACEABILITY_MATRIX.md#CODE-20) / [TEST-20](06_ACCEPTANCE_TEST_SPEC.md#TEST-20)

前提・データ: STU-001だけに紐付いた保護者デモ。

手順: 生徒一覧・予約一覧・STU-002への参照/予約/取消・管理者操作の直接呼出を確認。

期待結果: STU-001だけを表示。別家庭の参照/予約/取消と完了/チケット追加を拒否。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-20']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-20の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-21"></a>
<a id="TEST-21"></a>
## AT-21 モバイル表示

[BF-08](01_BUSINESS_FLOWS.md#BF-08) / [UC-21](02_USE_CASES.md#UC-21) / [REQ-21](03_REQUIREMENTS.md#REQ-21) / [FS-21](04_FUNCTIONAL_SPEC.md#FS-21) / [TASK-21](05_TASKS.md#TASK-21) / [AT-21](06_ACCEPTANCE_TEST_SPEC.md#AT-21) / [CODE-21](07_TRACEABILITY_MATRIX.md#CODE-21) / [TEST-21](06_ACCEPTANCE_TEST_SPEC.md#TEST-21)

前提・データ: 375×812のエミュレーション。

手順: 管理・利用者・予約フォームを順に表示し、指定幅375pxと実際の描画幅を照合。

期待結果: 各画面でscrollWidthとinnerWidthが375px以下。保護者の予約・取消行も画面内に収まる。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-21']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-21の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-22"></a>
<a id="TEST-22"></a>
## AT-22 再読込後の永続化

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-22](02_USE_CASES.md#UC-22) / [REQ-22](03_REQUIREMENTS.md#REQ-22) / [FS-22](04_FUNCTIONAL_SPEC.md#FS-22) / [TASK-22](05_TASKS.md#TASK-22) / [AT-22](06_ACCEPTANCE_TEST_SPEC.md#AT-22) / [CODE-22](07_TRACEABILITY_MATRIX.md#CODE-22) / [TEST-22](06_ACCEPTANCE_TEST_SPEC.md#TEST-22)

前提・データ: ダミー台帳。

手順: 生徒追加と予約登録後に再読込。

期待結果: 追加した生徒・予約のIDと値が維持される。

実施方法: 自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['AT-22']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。

証跡要件: AT-22の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-23"></a>
<a id="TEST-23"></a>
## AT-23 Google初期化・永続化

[BF-01](01_BUSINESS_FLOWS.md#BF-01) / [UC-23](02_USE_CASES.md#UC-23) / [REQ-23](03_REQUIREMENTS.md#REQ-23) / [FS-23](04_FUNCTIONAL_SPEC.md#FS-23) / [TASK-23](05_TASKS.md#TASK-23) / [AT-23](06_ACCEPTANCE_TEST_SPEC.md#AT-23) / [CODE-23](07_TRACEABILITY_MATRIX.md#CODE-23) / [TEST-23](06_ACCEPTANCE_TEST_SPEC.md#TEST-23)

前提・データ: 専用シート・GAS配備・権限が必要。

手順: initSpreadsheetを2回実行し生徒をWeb登録、シートを開く。

期待結果: 3シート生成・再実行で既存値不変・新規生徒1行。

実施方法: 手動実環境試験。担当者は専用環境に対して上記手順を実行し、対象ID・実施時刻・画面・シート行・イベントID（該当時）・期待との差異をresults.jsonと同じ形式の別実行記録へ保存する。未承認の本番データ変更はしない。

証跡要件: AT-23の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-24"></a>
<a id="TEST-24"></a>
## AT-24 実カレンダー予約同期

[BF-04](01_BUSINESS_FLOWS.md#BF-04) / [UC-24](02_USE_CASES.md#UC-24) / [REQ-24](03_REQUIREMENTS.md#REQ-24) / [FS-24](04_FUNCTIONAL_SPEC.md#FS-24) / [TASK-24](05_TASKS.md#TASK-24) / [AT-24](06_ACCEPTANCE_TEST_SPEC.md#AT-24) / [CODE-24](07_TRACEABILITY_MATRIX.md#CODE-24) / [TEST-24](06_ACCEPTANCE_TEST_SPEC.md#TEST-24)

前提・データ: 専用GAS・カレンダーが必要。

手順: Webから予約しシート行と実カレンダー予定を開く。

期待結果: 同一予約ID・日時・場所・イベントIDが一致。

実施方法: 手動実環境試験。担当者は専用環境に対して上記手順を実行し、対象ID・実施時刻・画面・シート行・イベントID（該当時）・期待との差異をresults.jsonと同じ形式の別実行記録へ保存する。未承認の本番データ変更はしない。

証跡要件: AT-24の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-25"></a>
<a id="TEST-25"></a>
## AT-25 実カレンダー取消同期

[BF-05](01_BUSINESS_FLOWS.md#BF-05) / [UC-25](02_USE_CASES.md#UC-25) / [REQ-25](03_REQUIREMENTS.md#REQ-25) / [FS-25](04_FUNCTIONAL_SPEC.md#FS-25) / [TASK-25](05_TASKS.md#TASK-25) / [AT-25](06_ACCEPTANCE_TEST_SPEC.md#AT-25) / [CODE-25](07_TRACEABILITY_MATRIX.md#CODE-25) / [TEST-25](06_ACCEPTANCE_TEST_SPEC.md#TEST-25)

前提・データ: AT-24の予約。

手順: 予約取消後にシートとカレンダーを開く。

期待結果: cancelled・対象イベント削除・残高不変。

実施方法: 手動実環境試験。担当者は専用環境に対して上記手順を実行し、対象ID・実施時刻・画面・シート行・イベントID（該当時）・期待との差異をresults.jsonと同じ形式の別実行記録へ保存する。未承認の本番データ変更はしない。

証跡要件: AT-25の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-26"></a>
<a id="TEST-26"></a>
## AT-26 管理者2名・保護者の端末共有

[BF-07](01_BUSINESS_FLOWS.md#BF-07) / [UC-26](02_USE_CASES.md#UC-26) / [REQ-26](03_REQUIREMENTS.md#REQ-26) / [FS-26](04_FUNCTIONAL_SPEC.md#FS-26) / [TASK-26](05_TASKS.md#TASK-26) / [AT-26](06_ACCEPTANCE_TEST_SPEC.md#AT-26) / [CODE-26](07_TRACEABILITY_MATRIX.md#CODE-26) / [TEST-26](06_ACCEPTANCE_TEST_SPEC.md#TEST-26)

前提・データ: 別セッション3台・権限分離・専用GAS。

手順: 保護者予約 → 管理者A確認・完了 → 管理者Bと保護者が再取得。

期待結果: 同一予約・残高を確認し家庭の範囲を維持。

実施方法: 手動実環境試験。担当者は専用環境に対して上記手順を実行し、対象ID・実施時刻・画面・シート行・イベントID（該当時）・期待との差異をresults.jsonと同じ形式の別実行記録へ保存する。未承認の本番データ変更はしない。

証跡要件: AT-26の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-27"></a>
<a id="TEST-27"></a>
## AT-27 同時完了の排他制御

[BF-06](01_BUSINESS_FLOWS.md#BF-06) / [UC-27](02_USE_CASES.md#UC-27) / [REQ-27](03_REQUIREMENTS.md#REQ-27) / [FS-27](04_FUNCTIONAL_SPEC.md#FS-27) / [TASK-27](05_TASKS.md#TASK-27) / [AT-27](06_ACCEPTANCE_TEST_SPEC.md#AT-27) / [CODE-27](07_TRACEABILITY_MATRIX.md#CODE-27) / [TEST-27](06_ACCEPTANCE_TEST_SPEC.md#TEST-27)

前提・データ: 独立管理者2セッション・専用GAS。

手順: 同じ予約を両管理者から同時に完了。

期待結果: 完了1件・片道1枚だけ消費、再試行でも不変。

実施方法: 手動実環境試験。担当者は専用環境に対して上記手順を実行し、対象ID・実施時刻・画面・シート行・イベントID（該当時）・期待との差異をresults.jsonと同じ形式の別実行記録へ保存する。未承認の本番データ変更はしない。

証跡要件: AT-27の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-28"></a>
<a id="TEST-28"></a>
## AT-28 バックアップから復旧

[BF-08](01_BUSINESS_FLOWS.md#BF-08) / [UC-28](02_USE_CASES.md#UC-28) / [REQ-28](03_REQUIREMENTS.md#REQ-28) / [FS-28](04_FUNCTIONAL_SPEC.md#FS-28) / [TASK-28](05_TASKS.md#TASK-28) / [AT-28](06_ACCEPTANCE_TEST_SPEC.md#AT-28) / [CODE-28](07_TRACEABILITY_MATRIX.md#CODE-28) / [TEST-28](06_ACCEPTANCE_TEST_SPEC.md#TEST-28)

前提・データ: 専用テスト資源・保存先・担当者。

手順: バックアップ → テスト行変更 → 復元 → Web再取得。

期待結果: 生徒・予約・購入履歴・カレンダーの整合を回復。

実施方法: 手動実環境試験。担当者は専用環境に対して上記手順を実行し、対象ID・実施時刻・画面・シート行・イベントID（該当時）・期待との差異をresults.jsonと同じ形式の別実行記録へ保存する。未承認の本番データ変更はしない。

証跡要件: AT-28の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-29"></a>
<a id="TEST-29"></a>
## AT-29 実機受入

[BF-08](01_BUSINESS_FLOWS.md#BF-08) / [UC-29](02_USE_CASES.md#UC-29) / [REQ-29](03_REQUIREMENTS.md#REQ-29) / [FS-29](04_FUNCTIONAL_SPEC.md#FS-29) / [TASK-29](05_TASKS.md#TASK-29) / [AT-29](06_ACCEPTANCE_TEST_SPEC.md#AT-29) / [CODE-29](07_TRACEABILITY_MATRIX.md#CODE-29) / [TEST-29](06_ACCEPTANCE_TEST_SPEC.md#TEST-29)

前提・データ: iPhone Safari・Android Chromeと受入担当者。

手順: 予約・取消・残高確認を各実機で実施。

期待結果: 入力・確認・操作が可能、受入担当の確認記録あり。

実施方法: 手動実環境試験。担当者は専用環境に対して上記手順を実行し、対象ID・実施時刻・画面・シート行・イベントID（該当時）・期待との差異をresults.jsonと同じ形式の別実行記録へ保存する。未承認の本番データ変更はしない。

証跡要件: AT-29の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。

<a id="AT-30"></a>
<a id="TEST-30"></a>
## AT-30 リリース後スモークテスト

[BF-08](01_BUSINESS_FLOWS.md#BF-08) / [UC-30](02_USE_CASES.md#UC-30) / [REQ-30](03_REQUIREMENTS.md#REQ-30) / [FS-30](04_FUNCTIONAL_SPEC.md#FS-30) / [TASK-30](05_TASKS.md#TASK-30) / [AT-30](06_ACCEPTANCE_TEST_SPEC.md#AT-30) / [CODE-30](07_TRACEABILITY_MATRIX.md#CODE-30) / [TEST-30](06_ACCEPTANCE_TEST_SPEC.md#TEST-30)

前提・データ: 全必須合格・受入確認・対象環境確定。

手順: リリース後URLで権限・予約・取消・連携・版を確認。

期待結果: 対象コミットと公開版一致、重大不具合なし、戻し手順あり。

実施方法: 手動実環境試験。担当者は専用環境に対して上記手順を実行し、対象ID・実施時刻・画面・シート行・イベントID（該当時）・期待との差異をresults.jsonと同じ形式の別実行記録へ保存する。未承認の本番データ変更はしない。

証跡要件: AT-30の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。



