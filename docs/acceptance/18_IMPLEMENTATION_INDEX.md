# 実装コード対応

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

<a id="CODE-01"></a>
## CODE-01 開発者設定とGoogleログイン

参照：BF-01 / REQ-01 / FS-01 / TS-01 / TASK-01 / CODE-01 / TEST-01 / AT-01 / OPS-01 / USR-01

実装項目：`src/services/google-auth.ts` の `signInGoogle` / `src/components/LoginScreen.tsx` の `LoginScreen`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

今回の実環境観測：RA-01/02：復元後の管理者2名それぞれの新規Googleログイン、本人名義・生徒3名・送迎履歴3件、再読込保持、ログアウト後の再読込で台帳非表示を確認。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="CODE-02"></a>
## CODE-02 生徒登録

参照：BF-02 / REQ-02 / FS-02 / TS-02 / TASK-02 / CODE-02 / TEST-02 / AT-02 / OPS-02 / USR-02

実装項目：`gas/Code.gs` の `createStudent_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-03"></a>
## CODE-03 保護者の残数確認

参照：BF-03 / REQ-03 / FS-03 / TS-03 / TASK-03 / CODE-03 / TEST-03 / AT-03 / OPS-03 / USR-03

実装項目：`src/components/ParentPortal.tsx` の `ParentPortal`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-04"></a>
## CODE-04 残少・ゼロ案内

参照：BF-03 / REQ-04 / FS-04 / TS-04 / TASK-04 / CODE-04 / TEST-04 / AT-04 / OPS-04 / USR-04

実装項目：`src/components/ParentPortal.tsx` の `ParentPortal`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-05"></a>
## CODE-05 チケット追加

参照：BF-03 / REQ-05 / FS-05 / TS-05 / TASK-05 / CODE-05 / TEST-05 / AT-05 / OPS-05 / USR-05

実装項目：`gas/Code.gs` の `addTickets_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-06"></a>
## CODE-06 保護者のお迎え予約

参照：BF-04 / REQ-06 / FS-06 / TS-06 / TASK-06 / CODE-06 / TEST-06 / AT-06 / OPS-06 / USR-06

実装項目：`gas/Code.gs` の `createReservation_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-07"></a>
## CODE-07 送り予約

参照：BF-04 / REQ-07 / FS-07 / TS-07 / TASK-07 / CODE-07 / TEST-07 / AT-07 / OPS-07 / USR-07

実装項目：`gas/Code.gs` の `createReservation_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-08"></a>
## CODE-08 往復予約

参照：BF-04 / REQ-08 / FS-08 / TS-08 / TASK-08 / CODE-08 / TEST-08 / AT-08 / OPS-08 / USR-08

実装項目：`gas/Code.gs` の `createReservation_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-09"></a>
## CODE-09 管理者の代理予約

参照：BF-04 / REQ-09 / FS-09 / TS-09 / TASK-09 / CODE-09 / TEST-09 / AT-09 / OPS-09 / USR-09

実装項目：`src/components/AddRideModal.tsx` の `AddRideModal`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-10"></a>
## CODE-10 保護者の予約取消

参照：BF-05 / REQ-10 / FS-10 / TS-10 / TASK-10 / CODE-10 / TEST-10 / AT-10 / OPS-10 / USR-10

実装項目：`gas/Code.gs` の `cancelReservation_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-11"></a>
## CODE-11 管理者の予約取消

参照：BF-05 / REQ-11 / FS-11 / TS-11 / TASK-11 / CODE-11 / TEST-11 / AT-11 / OPS-11 / USR-11

実装項目：`gas/Code.gs` の `cancelReservation_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-12"></a>
## CODE-12 当日一覧・地図リンク

参照：BF-06 / REQ-12 / FS-12 / TS-12 / TASK-12 / CODE-12 / TEST-12 / AT-12 / OPS-12 / USR-12

実装項目：`src/components/TeacherDashboard.tsx` の `TeacherDashboard`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-13"></a>
## CODE-13 片道完了

参照：BF-06 / REQ-13 / FS-13 / TS-13 / TASK-13 / CODE-13 / TEST-13 / AT-13 / OPS-13 / USR-13

実装項目：`gas/Code.gs` の `completeRide_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-14"></a>
## CODE-14 往復完了

参照：BF-06 / REQ-14 / FS-14 / TS-14 / TASK-14 / CODE-14 / TEST-14 / AT-14 / OPS-14 / USR-14

実装項目：`gas/Code.gs` の `completeRide_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-15"></a>
## CODE-15 完了の二重処理防止

参照：BF-06 / REQ-15 / FS-15 / TS-15 / TASK-15 / CODE-15 / TEST-15 / AT-15 / OPS-15 / USR-15

実装項目：`gas/Code.gs` の `completeRide_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-16"></a>
## CODE-16 取消済みの完了拒否

参照：BF-06 / REQ-16 / FS-16 / TS-16 / TASK-16 / CODE-16 / TEST-16 / AT-16 / OPS-16 / USR-16

実装項目：`gas/Code.gs` の `completeRide_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-17"></a>
## CODE-17 不正なチケット追加拒否

参照：BF-03 / REQ-17 / FS-17 / TS-17 / TASK-17 / CODE-17 / TEST-17 / AT-17 / OPS-17 / USR-17

実装項目：`gas/Code.gs` の `addTickets_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-18"></a>
## CODE-18 通信障害時に成功扱いしない

参照：BF-07 / REQ-18 / FS-18 / TS-18 / TASK-18 / CODE-18 / TEST-18 / AT-18 / OPS-18 / USR-18

実装項目：`gas/Code.gs` の `mutate_` / `src/services/api.ts` の `request` / `src/App.tsx` の `handleCreateRide`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-19"></a>
## CODE-19 未認証の管理操作を拒否

参照：BF-07 / REQ-19 / FS-19 / TS-19 / TASK-19 / CODE-19 / TEST-19 / AT-19 / OPS-19 / USR-19

実装項目：`gas/Code.gs` の `authenticateGoogle_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

今回の実環境観測：RA-03：公開管理者入口で未認証時に台帳非表示を確認。未認証API拒否を含むAT-19全体の再合格ではない。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="CODE-20"></a>
## CODE-20 保護者の家庭別アクセス制限

参照：BF-07 / REQ-20 / FS-20 / TS-20 / TASK-20 / CODE-20 / TEST-20 / AT-20 / OPS-20 / USR-20

実装項目：`gas/Code.gs` の `requireAccess_` / `src/portal.ts` の `assertPortal` / `src/portal.ts` の `isPortalMismatch` / `src/components/LoginScreen.tsx` の `isPortalMismatch(error)`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-21"></a>
## CODE-21 モバイル表示

参照：BF-08 / REQ-21 / FS-21 / TS-21 / TASK-21 / CODE-21 / TEST-21 / AT-21 / OPS-21 / USR-21

実装項目：`src/components/ParentPortal.tsx` の `ParentPortal` / `src/components/AddRideModal.tsx` の `max-h-[calc(100dvh-2rem)] overflow-y-auto`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-22"></a>
## CODE-22 再読込後の永続化

参照：BF-07 / REQ-22 / FS-22 / TS-22 / TASK-22 / CODE-22 / TEST-22 / AT-22 / OPS-22 / USR-22

実装項目：`src/App.tsx` の `App`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-23"></a>
## CODE-23 Google初期化・永続化

参照：BF-01 / REQ-23 / FS-23 / TS-23 / TASK-23 / CODE-23 / TEST-23 / AT-23 / OPS-23 / USR-23

実装項目：`gas/Code.gs` の `initSpreadsheet`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-24"></a>
## CODE-24 実カレンダー予約同期

参照：BF-04 / REQ-24 / FS-24 / TS-24 / TASK-24 / CODE-24 / TEST-24 / AT-24 / OPS-24 / USR-24

実装項目：`gas/Code.gs` の `createReservation_` / `gas/Code.gs` の `verificationCalendar_` / `gas/appsscript.json` の `https://www.googleapis.com/auth/calendar`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

今回の実環境観測：AT24-LIVE-20261110：開発担当が検証環境の管理者画面から架空生徒へ2026-11-12 15:30のお迎えを1件登録。検証台帳の予約IDと、台帳のイベントIDで特定した検証専用カレンダーの予定の説明欄の予約ID・日時・場所が一致。管理者による1回の実施で、保護者からの予約・実機・顧客確認は未確認。状態欄は変更していない。 [確認記録](../progress/2026-11-10-evening-fix-and-acceptance.md)

<a id="CODE-25"></a>
## CODE-25 実カレンダー取消同期

参照：BF-05 / REQ-25 / FS-25 / TS-25 / TASK-25 / CODE-25 / TEST-25 / AT-25 / OPS-25 / USR-25

実装項目：`gas/Code.gs` の `cancelReservation_` / `gas/Code.gs` の `verificationCalendar_` / `gas/appsscript.json` の `https://www.googleapis.com/auth/calendar`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

今回の実環境観測：AT25-LIVE-20261110：同じ予約を管理者画面から取消。検証台帳はcancelled、台帳のイベントIDを持つ予定はカレンダーに0件、残数は8のまま。確認ダイアログは自動承諾に置き換えて実行し文言は未確認。管理者による1回の実施で、保護者からの取消・実機・顧客確認は未確認。状態欄は変更していない。 [確認記録](../progress/2026-11-10-evening-fix-and-acceptance.md)

<a id="CODE-26"></a>
## CODE-26 管理者2名・保護者の端末共有

参照：BF-07 / REQ-26 / FS-26 / TS-26 / TASK-26 / CODE-26 / TEST-26 / AT-26 / OPS-26 / USR-26

実装項目：`gas/Code.gs` の `withLock_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

今回の実環境観測：RA-01/02/07/08：復元後の管理者2名の本人ログイン・再読込・ログアウトを確認。両管理者から有効・本人確認済み2名と一時家庭なしを読取り照合。予約・完了・他端末の更新共有を含むAT-26全体は未完。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="CODE-27"></a>
## CODE-27 同時完了の排他制御

参照：BF-06 / REQ-27 / FS-27 / TS-27 / TASK-27 / CODE-27 / TEST-27 / AT-27 / OPS-27 / USR-27

実装項目：`gas/Code.gs` の `withLock_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

今回の実環境観測：AT27-LIVE-01/02：2管理者の同時完了で3枚→2枚。別の専用送迎を管理者1で完了確定後、完了前の管理者2画面から明示再試行して追加0枚・残数2枚・送迎行と完了日時不変を確認。試験行除去後に主要3シートの実行前範囲一致。開発側の期待値確認は完了、独立した第三者受入は未実施。 [確認記録](concurrent-completion-plan-2026-10-23/README.md)

<a id="CODE-28"></a>
## CODE-28 バックアップから復旧

参照：BF-08 / REQ-28 / FS-28 / TS-28 / TASK-28 / CODE-28 / TEST-28 / AT-28 / OPS-28 / USR-28

実装項目：N/A：バックアップ復元は担当者が外部画面で行う。自動復元APIはない。

バックアップ復元は担当者が外部画面で行う。自動復元APIはない。

今回の実環境観測：AT28-LIVE-01〜08：専用生徒・送迎・購入の3行をコピーから値復元して一致。会社Googleログイン後にWeb再取得で残数3・時刻16:30を確認。購入3枚は台帳で照合。IDガードした3行を除去し主要3シート先頭8行のSHA-256が実行前と一致、Webも元の生徒3名・履歴3件。台帳部分確認完了、Calendar整合・全体合格は未確認。 [確認記録](backup-restore-2026-10-23/README.md)

<a id="CODE-29"></a>
## CODE-29 実機受入

参照：BF-08 / REQ-29 / FS-29 / TS-29 / TASK-29 / CODE-29 / TEST-29 / AT-29 / OPS-29 / USR-29

実装項目：`src/App.tsx` の `App`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

今回の実環境観測：DEV29-IOS-OBS-01〜04：iPhone 16 Pro Max・iOS26.6.2・Safariで管理者2、生徒3名・履歴3件・残数7/1/10・一覧右端列を画像確認。ログアウト後再読込でもログイン画面のみ・台帳非表示と本人が明示回答。iPhone管理者読取範囲は確認済み。Android・保護者本人・予約取消は未実施、AT-29全体未合格。 [確認記録](device-readonly-2026-10-24/README.md)

<a id="CODE-30"></a>
## CODE-30 リリース後スモークテスト

参照：BF-08 / REQ-30 / FS-30 / TS-30 / TASK-30 / CODE-30 / TEST-30 / AT-30 / OPS-30 / USR-30

実装項目：`scripts/prepare_test_release.cjs` の `sourceDigest`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

今回の実環境観測：RA-06：現行配布記録の公開7ファイルとSHA-256一致。古い固定版との比較失敗は棄却記録として保持。本番AT-30・実Google受入の合格ではない。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="CODE-31"></a>
## CODE-31 管理者による利用登録・停止・削除

参照：BF-09 / REQ-31 / FS-31 / TS-31 / TASK-31 / CODE-31 / TEST-31 / SAT-31 / OPS-31 / USR-31

実装項目：`gas/Code.gs` の `saveManagedUser_` / `gas/Code.gs` の `deleteManagedUser_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

今回の実環境観測：RA-07/08：両管理者の公開管理画面で、有効・本人確認済みの管理者2名、一時検証家庭なしを確認。許可設定の書込は実施していない。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="CODE-32"></a>
## CODE-32 初回Google本人紐付け

参照：BF-09 / REQ-32 / FS-32 / TS-32 / TASK-32 / CODE-32 / TEST-32 / SAT-32 / OPS-32 / USR-32

実装項目：`gas/Code.gs` の `authenticateGoogle_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

今回の実環境観測：RA-04：公開保護者入口の入力欄0・管理者メニューなし・台帳なしを確認。家庭本人での実ログインは今回未実施。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="CODE-33"></a>
## CODE-33 家庭URL・QRの配布と再発行

参照：BF-09 / REQ-33 / FS-33 / TS-33 / TASK-33 / CODE-33 / TEST-33 / SAT-33 / OPS-33 / USR-33

実装項目：`src/components/PortalInvitations.tsx` の `PortalInvitations` / `gas/Code.gs` の `getPortalInvitations_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

今回の実環境観測：RA-05：不正形式の家庭URLはURL確認画面、家庭データ非表示。発行・失効を含むSAT-33全体の合格ではない。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="CODE-34"></a>
## CODE-34 Google認証・再読込・ログアウト

参照：BF-07 / REQ-34 / FS-34 / TS-34 / TASK-34 / CODE-34 / TEST-34 / SAT-34 / OPS-34 / USR-34

実装項目：`src/services/google-auth.ts` の `signOutGoogle` / `src/services/api.ts` の `endSession`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

今回の実環境観測：RA-01/02-LOGOUT：復元後の両管理者についてログアウト直後・再読込後とも管理者ログイン画面だけとなり、台帳非表示を確認。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="CODE-35"></a>
## CODE-35 台帳直接編集と反映

参照：BF-10 / REQ-35 / FS-35 / TS-35 / TASK-35 / CODE-35 / TEST-35 / SAT-35 / OPS-35 / USR-35

実装項目：N/A：手動の保全・外部台帳操作／実送迎。業務処理の自動コードはない。

手動の保全・外部台帳操作／実送迎。業務処理の自動コードはない。

<a id="CODE-36"></a>
## CODE-36 カレンダー確認・実送迎・実績確認

参照：BF-06 / REQ-36 / FS-36 / TS-36 / TASK-36 / CODE-36 / TEST-36 / SAT-36 / OPS-36 / USR-36

実装項目：N/A：手動の保全・外部台帳操作／実送迎。業務処理の自動コードはない。

手動の保全・外部台帳操作／実送迎。業務処理の自動コードはない。

<a id="CODE-37"></a>
## CODE-37 日時・場所変更と直前連絡

参照：BF-05 / REQ-37 / FS-37 / TS-37 / TASK-37 / CODE-37 / TEST-37 / SAT-37 / OPS-37 / USR-37

実装項目：`gas/Code.gs` の `cancelReservation_` / `gas/Code.gs` の `createReservation_`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-38"></a>
## CODE-38 工程横断のID・整合検査・共通デザイン

参照：BF-11 / REQ-38 / FS-38 / TS-38 / TASK-38 / CODE-38 / TEST-38 / SAT-38 / OPS-38 / USR-38

実装項目：`scripts/traceability.py` の `validate`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

<a id="CODE-39"></a>
## CODE-39 随時実施できる顧客確認と検証専用の両画面アクセス

参照：BF-08 / REQ-39 / FS-39 / TS-39 / TASK-39 / CODE-39 / TEST-39 / SAT-39 / OPS-39 / USR-39

実装項目：`gas/Code.gs` の `reviewModeAvailable_` / `src/services/api.ts` の `reviewOnly` / `src/components/AccountManagement.tsx` の `reviewModeAvailable` / `src/App.tsx` の `reviewOnly` / `src/components/Navbar.tsx` の `reviewOnly` / `src/components/TeacherDashboard.tsx` の `reviewOnly`

コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。

