# テストコード対応

現行正本版：2026-11-11-r19。生成元 [registry.json](../traceability/registry.json)。過去の合格記録とは別。

<!-- fact:authentication="google" -->
<!-- fact:setupOwner="developer" -->
<!-- fact:dailyAccountOwner="admin" -->
<!-- fact:consumeAt="completion" -->
<!-- fact:oneWay=1 -->
<!-- fact:roundTrip=2 -->
<!-- fact:calendarPermissionAdded=true -->
<!-- fact:productionStarted=false -->
<!-- fact:originalLedgerAutoSync=false -->
<!-- fact:thirdPartyPassed=0 -->
<!-- fact:thirdPartyTotal=30 -->
<!-- fact:thirdPartyRequiredForRelease=false -->
<!-- fact:customerAcceptancePassed=0 -->
<!-- fact:customerAcceptanceTotal=6 -->
<!-- fact:calendarPermissionApprovedForTest=true -->
<!-- fact:remainingRealAcceptance=["AT-24","AT-25","AT-26","AT-27","AT-28","AT-29","AT-30"] -->
<!-- fact:release="HOLD" -->
<!-- fact:restoredAdminRelogin="BOTH_ADMINS_CONFIRMED" -->
<!-- fact:publicFrontendFilesMatched=7 -->
<!-- fact:restoredActiveAdmins=2 -->
<!-- fact:verificationGasVersion=6 -->
<!-- fact:verificationCalendarReadConfirmed=true -->
<!-- fact:customerPreparationStatus="SELF_PACED_PREPARED_CUSTOMER_FIRST_LOGIN_PENDING" -->
<!-- fact:customerExecutionMode="self-paced-test-reviewer" -->

初期設定は開発担当、日常の利用登録は管理者が行う。片道1枚・往復2枚を完了時に消費する。小林さんの顧客確認は0/6件合格。原AT-01〜30は開発担当が技術検証する。旧第三者受入0/30件は履歴。検証専用Calendarの権限追加は許可済み、Googleの実同意済み。本番開始は保留中。 [顧客確認の6手順](CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md)

<a id="TEST-01"></a>
## TEST-01 開発者設定とGoogleログイン

参照：BF-01 / REQ-01 / FS-01 / TS-01 / TASK-01 / CODE-01 / TEST-01 / AT-01 / OPS-01 / USR-01

既存の関連テスト：GAS-02, GAS-03, GAS-04, GAS-05, GAS-12, GAS-43, GAS-44, GAS-45, GAS-46, GAS-47, GAS-48, GAS-49, GAS-50, GAS-51, GAS-52, GAS-53, GAS-54, PT-01, PT-02, PT-03, PT-04, PT-05, PT-06, PT-07, PT-08, PT-09, PT-10, PT-11, PT-12, PT-13, PT-14, PT-15, PT-16, PT-17, PT-18, PT-19, PT-20, SDK-01, SDK-02, SDK-03, SDK-04, SDK-05, SDK-06, SDK-07, UI-07, SDK-08, SDK-09, SDK-10, SDK-11, SDK-12, SDK-13, SDK-14, SDK-15, SDK-16, UI-08, LOCAL-UI-01, LOCAL-UI-13

検証範囲：既存の関連テスト群に加え、未配備の認証準備再試行をFirebase SDKスタブおよび疑似Reactフックで限定確認。実ブラウザー・実Googleログイン・iPhone認証エラーの再現や解消は未検証。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

今回の実環境観測：RA-01/02：復元後の管理者2名それぞれの新規Googleログイン、本人名義・生徒3名・送迎履歴3件、再読込保持、ログアウト後の再読込で台帳非表示を確認。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="TEST-02"></a>
## TEST-02 生徒登録

参照：BF-02 / REQ-02 / FS-02 / TS-02 / TASK-02 / CODE-02 / TEST-02 / AT-02 / OPS-02 / USR-02

既存の関連テスト：GAS-01, GAS-18, GAS-19, GAS-20, GAS-21, GAS-36, GAS-37, GAS-38

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-03"></a>
## TEST-03 保護者の残数確認

参照：BF-03 / REQ-03 / FS-03 / TS-03 / TASK-03 / CODE-03 / TEST-03 / AT-03 / OPS-03 / USR-03

既存の関連テスト：UI-01, GAS-06, LOCAL-UI-02

検証範囲：ローカルのコンポーネントまたはGAS処理契約の自動検査。本人操作の実受入合格は別。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-04"></a>
## TEST-04 残少・ゼロ案内

参照：BF-03 / REQ-04 / FS-04 / TS-04 / TASK-04 / CODE-04 / TEST-04 / AT-04 / OPS-04 / USR-04

既存の関連テスト：UI-02, LOCAL-UI-14

検証範囲：ローカルのコンポーネントまたはGAS処理契約の自動検査。本人操作の実受入合格は別。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-05"></a>
## TEST-05 チケット追加

参照：BF-03 / REQ-05 / FS-05 / TS-05 / TASK-05 / CODE-05 / TEST-05 / AT-05 / OPS-05 / USR-05

既存の関連テスト：GAS-63

検証範囲：ローカルのコンポーネントまたはGAS処理契約の自動検査。本人操作の実受入合格は別。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-06"></a>
## TEST-06 保護者のお迎え予約

参照：BF-04 / REQ-06 / FS-06 / TS-06 / TASK-06 / CODE-06 / TEST-06 / AT-06 / OPS-06 / USR-06

既存の関連テスト：GAS-06, GAS-07, GAS-08, GAS-09, GAS-10, GAS-11, LOCAL-UI-03, GAS-71, GAS-72, GAS-74

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-07"></a>
## TEST-07 送り予約

参照：BF-04 / REQ-07 / FS-07 / TS-07 / TASK-07 / CODE-07 / TEST-07 / AT-07 / OPS-07 / USR-07

既存の関連テスト：GAS-64, LOCAL-UI-04

検証範囲：ローカルのコンポーネントまたはGAS処理契約の自動検査。本人操作の実受入合格は別。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-08"></a>
## TEST-08 往復予約

参照：BF-04 / REQ-08 / FS-08 / TS-08 / TASK-08 / CODE-08 / TEST-08 / AT-08 / OPS-08 / USR-08

既存の関連テスト：GAS-65, LOCAL-UI-05

検証範囲：ローカルのコンポーネントまたはGAS処理契約の自動検査。本人操作の実受入合格は別。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-09"></a>
## TEST-09 管理者の代理予約

参照：BF-04 / REQ-09 / FS-09 / TS-09 / TASK-09 / CODE-09 / TEST-09 / AT-09 / OPS-09 / USR-09

既存の関連テスト：UI-03, LOCAL-UI-06

検証範囲：ローカルのコンポーネントまたはGAS処理契約の自動検査。本人操作の実受入合格は別。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-10"></a>
## TEST-10 保護者の予約取消

参照：BF-05 / REQ-10 / FS-10 / TS-10 / TASK-10 / CODE-10 / TEST-10 / AT-10 / OPS-10 / USR-10

既存の関連テスト：GAS-06, GAS-07, GAS-08, GAS-09, GAS-10, GAS-11, LOCAL-UI-07, GAS-71, GAS-72, GAS-73, GAS-74

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-11"></a>
## TEST-11 管理者の予約取消

参照：BF-05 / REQ-11 / FS-11 / TS-11 / TASK-11 / CODE-11 / TEST-11 / AT-11 / OPS-11 / USR-11

既存の関連テスト：GAS-66, GAS-73

検証範囲：ローカルのコンポーネントまたはGAS処理契約の自動検査。本人操作の実受入合格は別。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-12"></a>
## TEST-12 当日一覧・地図リンク

参照：BF-06 / REQ-12 / FS-12 / TS-12 / TASK-12 / CODE-12 / TEST-12 / AT-12 / OPS-12 / USR-12

既存の関連テスト：UI-04

検証範囲：ローカルのコンポーネントまたはGAS処理契約の自動検査。本人操作の実受入合格は別。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-13"></a>
## TEST-13 片道完了

参照：BF-06 / REQ-13 / FS-13 / TS-13 / TASK-13 / CODE-13 / TEST-13 / AT-13 / OPS-13 / USR-13

既存の関連テスト：GAS-13, GAS-14, GAS-15, GAS-16, LOCAL-UI-08

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-14"></a>
## TEST-14 往復完了

参照：BF-06 / REQ-14 / FS-14 / TS-14 / TASK-14 / CODE-14 / TEST-14 / AT-14 / OPS-14 / USR-14

既存の関連テスト：GAS-13, GAS-14, GAS-15, GAS-16, LOCAL-UI-09

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-15"></a>
## TEST-15 完了の二重処理防止

参照：BF-06 / REQ-15 / FS-15 / TS-15 / TASK-15 / CODE-15 / TEST-15 / AT-15 / OPS-15 / USR-15

既存の関連テスト：GAS-13, GAS-14, GAS-15, GAS-16, LOCAL-UI-08, LOCAL-UI-09

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-16"></a>
## TEST-16 取消済みの完了拒否

参照：BF-06 / REQ-16 / FS-16 / TS-16 / TASK-16 / CODE-16 / TEST-16 / AT-16 / OPS-16 / USR-16

既存の関連テスト：GAS-13, GAS-14, GAS-15, GAS-16, LOCAL-UI-10

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-17"></a>
## TEST-17 不正なチケット追加拒否

参照：BF-03 / REQ-17 / FS-17 / TS-17 / TASK-17 / CODE-17 / TEST-17 / AT-17 / OPS-17 / USR-17

既存の関連テスト：GAS-18, GAS-19, GAS-20, GAS-21, GAS-36, GAS-37, GAS-38, LOCAL-UI-11

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-18"></a>
## TEST-18 通信障害時に成功扱いしない

参照：BF-07 / REQ-18 / FS-18 / TS-18 / TASK-18 / CODE-18 / TEST-18 / AT-18 / OPS-18 / USR-18

既存の関連テスト：GAS-18, GAS-19, GAS-20, GAS-21, GAS-22, GAS-23, GAS-24, GAS-25, GAS-26, GAS-27, GAS-28, GAS-29, GAS-30, GAS-31, GAS-32, GAS-33, GAS-34, GAS-35, GAS-36, GAS-37, GAS-38, PT-32, PT-33, RETRY-UI-01

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-19"></a>
## TEST-19 未認証の管理操作を拒否

参照：BF-07 / REQ-19 / FS-19 / TS-19 / TASK-19 / CODE-19 / TEST-19 / AT-19 / OPS-19 / USR-19

既存の関連テスト：GAS-02, GAS-03, GAS-04, GAS-05, GAS-12, GAS-43, GAS-44, GAS-45, GAS-46, GAS-47, GAS-48, GAS-49, GAS-50, GAS-51, GAS-52, GAS-53, GAS-54, PT-01, PT-02, PT-03, PT-04, PT-05, PT-06, PT-07, PT-08, PT-09, PT-10, PT-11, PT-12, PT-13, PT-14, PT-15, PT-16, PT-17, PT-18, PT-19, PT-20, LOCAL-UI-01, GAS-72

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

今回の実環境観測：RA-03：公開管理者入口で未認証時に台帳非表示を確認。未認証API拒否を含むAT-19全体の再合格ではない。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="TEST-20"></a>
## TEST-20 保護者の家庭別アクセス制限

参照：BF-07 / REQ-20 / FS-20 / TS-20 / TASK-20 / CODE-20 / TEST-20 / AT-20 / OPS-20 / USR-20

既存の関連テスト：GAS-02, GAS-03, GAS-04, GAS-05, GAS-06, GAS-07, GAS-08, GAS-09, GAS-10, GAS-11, GAS-12, GAS-39, GAS-40, GAS-41, GAS-42, GAS-43, GAS-44, GAS-45, GAS-46, GAS-47, GAS-48, GAS-49, GAS-50, GAS-51, GAS-52, GAS-53, GAS-54, PT-01, PT-02, PT-03, PT-04, PT-05, PT-06, PT-07, PT-08, PT-09, PT-10, PT-11, PT-12, PT-13, PT-14, PT-15, PT-16, PT-17, PT-18, PT-19, PT-20, LOCAL-UI-02, LOCAL-UI-11, PM-01, PM-02, PM-03, PM-04, PM-05

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-21"></a>
## TEST-21 モバイル表示

参照：BF-08 / REQ-21 / FS-21 / TS-21 / TASK-21 / CODE-21 / TEST-21 / AT-21 / OPS-21 / USR-21

既存の関連テスト：UI-05, UI-SCROLL-01, UI-SCROLL-02, LOCAL-UI-12

検証範囲：375pxのローカルChromium実測。スマートフォン実機では未確認。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-22"></a>
## TEST-22 再読込後の永続化

参照：BF-07 / REQ-22 / FS-22 / TS-22 / TASK-22 / CODE-22 / TEST-22 / AT-22 / OPS-22 / USR-22

既存の関連テスト：PT-21, LOCAL-UI-07

検証範囲：実ApiServiceのデモ保存と新インスタンス再取得を検証。実Google台帳の永続化受入は別。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-23"></a>
## TEST-23 Google初期化・永続化

参照：BF-01 / REQ-23 / FS-23 / TS-23 / TASK-23 / CODE-23 / TEST-23 / AT-23 / OPS-23 / USR-23

既存の関連テスト：GAS-01

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-24"></a>
## TEST-24 実カレンダー予約同期

参照：BF-04 / REQ-24 / FS-24 / TS-24 / TASK-24 / CODE-24 / TEST-24 / AT-24 / OPS-24 / USR-24

既存の関連テスト：GAS-67, GAS-71, GAS-72, GAS-74

検証範囲：GASのCalendarアダプタ契約と予定説明欄への予約ID記載をスタブで検証。実Calendar同期の受入AT-24は未完。 GAS-71〜74は接続先・認可・所有権・取消イベントの制限をオフライン確認。Googleでの同意と検証GAS反映は未了。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

今回の実環境観測：AT24-LIVE-20261110：開発担当が検証環境の管理者画面から架空生徒へ2026-11-12 15:30のお迎えを1件登録。検証台帳の予約IDと、台帳のイベントIDで特定した検証専用カレンダーの予定の説明欄の予約ID・日時・場所が一致。管理者による1回の実施で、保護者からの予約・実機・顧客確認は未確認。状態欄は変更していない。 [確認記録](../progress/2026-11-10-evening-fix-and-acceptance.md)

<a id="TEST-25"></a>
## TEST-25 実カレンダー取消同期

参照：BF-05 / REQ-25 / FS-25 / TS-25 / TASK-25 / CODE-25 / TEST-25 / AT-25 / OPS-25 / USR-25

既存の関連テスト：GAS-68, GAS-71, GAS-72, GAS-73, GAS-74

検証範囲：GASの取消アダプタ契約をスタブで検証。実Calendar削除の受入AT-25は未完。 GAS-71〜74は接続先・認可・所有権・取消イベントの制限をオフライン確認。Googleでの同意と検証GAS反映は未了。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

今回の実環境観測：AT25-LIVE-20261110：同じ予約を管理者画面から取消。検証台帳はcancelled、台帳のイベントIDを持つ予定はカレンダーに0件、残数は8のまま。確認ダイアログは自動承諾に置き換えて実行し文言は未確認。管理者による1回の実施で、保護者からの取消・実機・顧客確認は未確認。状態欄は変更していない。 [確認記録](../progress/2026-11-10-evening-fix-and-acceptance.md)

<a id="TEST-26"></a>
## TEST-26 管理者2名・保護者の端末共有

参照：BF-07 / REQ-26 / FS-26 / TS-26 / TASK-26 / CODE-26 / TEST-26 / AT-26 / OPS-26 / USR-26

既存の関連テスト：GAS-17

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

今回の実環境観測：RA-01/02/07/08：復元後の管理者2名の本人ログイン・再読込・ログアウトを確認。両管理者から有効・本人確認済み2名と一時家庭なしを読取り照合。予約・完了・他端末の更新共有を含むAT-26全体は未完。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="TEST-27"></a>
## TEST-27 同時完了の排他制御

参照：BF-06 / REQ-27 / FS-27 / TS-27 / TASK-27 / CODE-27 / TEST-27 / AT-27 / OPS-27 / USR-27

既存の関連テスト：GAS-17

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

今回の実環境観測：AT27-LIVE-01/02：2管理者の同時完了で3枚→2枚。別の専用送迎を管理者1で完了確定後、完了前の管理者2画面から明示再試行して追加0枚・残数2枚・送迎行と完了日時不変を確認。試験行除去後に主要3シートの実行前範囲一致。開発側の期待値確認は完了、独立した第三者受入は未実施。 [確認記録](concurrent-completion-plan-2026-10-23/README.md)

<a id="TEST-28"></a>
## TEST-28 バックアップから復旧

参照：BF-08 / REQ-28 / FS-28 / TS-28 / TASK-28 / CODE-28 / TEST-28 / AT-28 / OPS-28 / USR-28

既存の関連テスト：GAS-25, GAS-26, GAS-27, GAS-28, GAS-29, GAS-30, GAS-31, GAS-32, GAS-33, GAS-34, GAS-35

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

今回の実環境観測：AT28-LIVE-01〜08：専用生徒・送迎・購入の3行をコピーから値復元して一致。会社Googleログイン後にWeb再取得で残数3・時刻16:30を確認。購入3枚は台帳で照合。IDガードした3行を除去し主要3シート先頭8行のSHA-256が実行前と一致、Webも元の生徒3名・履歴3件。台帳部分確認完了、Calendar整合・全体合格は未確認。 [確認記録](backup-restore-2026-10-23/README.md)

<a id="TEST-29"></a>
## TEST-29 実機受入

参照：BF-08 / REQ-29 / FS-29 / TS-29 / TASK-29 / CODE-29 / TEST-29 / AT-29 / OPS-29 / USR-29

既存の関連テスト：UI-06, UI-SCROLL-01, UI-SCROLL-02, LOCAL-UI-12

検証範囲：Chromiumタッチエミュレーション。物理端末と全操作の実機受入AT-29は未完。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

今回の実環境観測：DEV29-IOS-OBS-01〜04：iPhone 16 Pro Max・iOS26.6.2・Safariで管理者2、生徒3名・履歴3件・残数7/1/10・一覧右端列を画像確認。ログアウト後再読込でもログイン画面のみ・台帳非表示と本人が明示回答。iPhone管理者読取範囲は確認済み。Android・保護者本人・予約取消は未実施、AT-29全体未合格。 [確認記録](device-readonly-2026-10-24/README.md)

<a id="TEST-30"></a>
## TEST-30 リリース後スモークテスト

参照：BF-08 / REQ-30 / FS-30 / TS-30 / TASK-30 / CODE-30 / TEST-30 / AT-30 / OPS-30 / USR-30

既存の関連テスト：REL-01

検証範囲：配布マニフェスト作成を隔離VMで検証。本番公開後の疎通・復旧確認AT-30は未実施。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

今回の実環境観測：RA-06：現行配布記録の公開7ファイルとSHA-256一致。古い固定版との比較失敗は棄却記録として保持。本番AT-30・実Google受入の合格ではない。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="TEST-31"></a>
## TEST-31 管理者による利用登録・停止・削除

参照：BF-09 / REQ-31 / FS-31 / TS-31 / TASK-31 / CODE-31 / TEST-31 / SAT-31 / OPS-31 / USR-31

既存の関連テスト：GAS-55, GAS-56, GAS-57, GAS-58, GAS-59, GAS-60, GAS-61, GAS-62, PT-01, PT-02, PT-03, PT-04, PT-05, PT-06, PT-07, PT-08, PT-09, PT-10, PT-11, PT-12, PT-13, PT-14, PT-15, PT-16, PT-17, PT-18, PT-19, PT-20

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

今回の実環境観測：RA-07/08：両管理者の公開管理画面で、有効・本人確認済みの管理者2名、一時検証家庭なしを確認。許可設定の書込は実施していない。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="TEST-32"></a>
## TEST-32 初回Google本人紐付け

参照：BF-09 / REQ-32 / FS-32 / TS-32 / TASK-32 / CODE-32 / TEST-32 / SAT-32 / OPS-32 / USR-32

既存の関連テスト：GAS-43, GAS-44, GAS-45, GAS-46, GAS-47, GAS-48, GAS-49, GAS-50, GAS-51, GAS-52, GAS-53, GAS-54, GAS-55, GAS-56, GAS-57, GAS-58, GAS-59, GAS-60, GAS-61, GAS-62

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

今回の実環境観測：RA-04：公開保護者入口の入力欄0・管理者メニューなし・台帳なしを確認。家庭本人での実ログインは今回未実施。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="TEST-33"></a>
## TEST-33 家庭URL・QRの配布と再発行

参照：BF-09 / REQ-33 / FS-33 / TS-33 / TASK-33 / CODE-33 / TEST-33 / SAT-33 / OPS-33 / USR-33

既存の関連テスト：GAS-39, GAS-40, GAS-41, GAS-42, GAS-55, GAS-56, GAS-57, GAS-58, GAS-59, GAS-60, GAS-61, GAS-62, PT-01, PT-02, PT-03, PT-04, PT-05, PT-06, PT-07, PT-08, PT-09, PT-10, PT-11, PT-12, PT-13, PT-14, PT-15, PT-16, PT-17, PT-18, PT-19, PT-20

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

今回の実環境観測：RA-05：不正形式の家庭URLはURL確認画面、家庭データ非表示。発行・失効を含むSAT-33全体の合格ではない。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="TEST-34"></a>
## TEST-34 Google認証・再読込・ログアウト

参照：BF-07 / REQ-34 / FS-34 / TS-34 / TASK-34 / CODE-34 / TEST-34 / SAT-34 / OPS-34 / USR-34

既存の関連テスト：GAS-02, GAS-03, GAS-04, GAS-05, GAS-12, GAS-43, GAS-44, GAS-45, GAS-46, GAS-47, GAS-48, GAS-49, GAS-50, GAS-51, GAS-52, GAS-53, GAS-54, PT-01, PT-02, PT-03, PT-04, PT-05, PT-06, PT-07, PT-08, PT-09, PT-10, PT-11, PT-12, PT-13, PT-14, PT-15, PT-16, PT-17, PT-18, PT-19, PT-20, SDK-01, SDK-02, SDK-03, SDK-04, SDK-05, SDK-06, SDK-08, SDK-09, SDK-10, SDK-11, SDK-12, SDK-13, SDK-14, SDK-15, SDK-16, UI-08, LOCAL-UI-13

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

今回の実環境観測：RA-01/02-LOGOUT：復元後の両管理者についてログアウト直後・再読込後とも管理者ログイン画面だけとなり、台帳非表示を確認。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="TEST-35"></a>
## TEST-35 台帳直接編集と反映

参照：BF-10 / REQ-35 / FS-35 / TS-35 / TASK-35 / CODE-35 / TEST-35 / SAT-35 / OPS-35 / USR-35

既存の関連テスト：GAS-69

検証範囲：分離したメモリ台帳で次回取得・非連動を検証。実Google資源の手修正手順と保全は別。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-36"></a>
## TEST-36 カレンダー確認・実送迎・実績確認

参照：BF-06 / REQ-36 / FS-36 / TS-36 / TASK-36 / CODE-36 / TEST-36 / SAT-36 / OPS-36 / USR-36

既存の関連テスト：GAS-13, GAS-14, GAS-15, GAS-16

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-37"></a>
## TEST-37 日時・場所変更と直前連絡

参照：BF-05 / REQ-37 / FS-37 / TS-37 / TASK-37 / CODE-37 / TEST-37 / SAT-37 / OPS-37 / USR-37

既存の関連テスト：GAS-70

検証範囲：正常な取消→新規と、Calendar結果不明時の再送禁止・照合待ちを検証。日時・場所の原子的編集ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-38"></a>
## TEST-38 工程横断のID・整合検査・共通デザイン

参照：BF-11 / REQ-38 / FS-38 / TS-38 / TASK-38 / CODE-38 / TEST-38 / SAT-38 / OPS-38 / USR-38

既存の関連テスト：TRACE-01, TRACE-02, TRACE-03, TRACE-04, TRACE-05, TRACE-06, TRACE-07, TRACE-08, TRACE-09, TRACE-10, TRACE-11, TRACE-12, TRACE-13, TRACE-14, TRACE-15, TRACE-16, TRACE-17, TRACE-18, TRACE-19, TRACE-20, TRACE-21, TRACE-22, RUN-SAFE-01, RUN-SAFE-02, RUN-SAFE-03, RUN-SAFE-04, TRACE-23, TRACE-24, TRACE-25, TRACE-26, TRACE-27, TRACE-28, TRACE-29, TRACE-30, TRACE-31, TRACE-32, TRACE-33, TRACE-34

検証範囲：関連群の対応は全期待値の証明ではない。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

<a id="TEST-39"></a>
## TEST-39 随時実施できる顧客確認と検証専用の両画面アクセス

参照：BF-08 / REQ-39 / FS-39 / TS-39 / TASK-39 / CODE-39 / TEST-39 / SAT-39 / OPS-39 / USR-39

既存の関連テスト：GAS-75, GAS-76, GAS-77, GAS-78, GAS-79, GAS-80, GAS-81, GAS-82, GAS-83, GAS-84, GAS-85, PT-22, PT-23, PT-24, PT-25, PT-26, PT-27, PT-28, PT-29, PT-30, PT-31, REVIEW-UI-01, REVIEW-UI-02, REVIEW-UI-03, REVIEW-UI-04, REVIEW-UI-05, REVIEW-UI-06, REVIEW-UI-07, REVIEW-UI-08

検証範囲：ローカルの認証・生徒範囲・更新・管理権限拒否と通常役割の回帰を確認する。実Googleの本人ログイン・検証版・顧客6件は別途実測する。

実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。

