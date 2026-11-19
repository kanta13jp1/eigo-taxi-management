# 設計

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

<a id="FS-01"></a>
## FS-01 開発者設定とGoogleログイン

参照：BF-01 / REQ-01 / FS-01 / TS-01 / TASK-01 / CODE-01 / TEST-01 / AT-01 / OPS-01 / USR-01

画面 A01, E01, E04。I/F IF-01, IF-15。許可された管理者だけが管理画面・検証台帳へ接続。再読込で本人を再確認し、ログアウト後は台帳を表示しない。 検証専用の同一アカウント両画面確認はREQ-39に従い、通常の管理者・保護者の役割分離を変更しない。

実装：`src/services/google-auth.ts` の `signInGoogle` / `src/components/LoginScreen.tsx` の `LoginScreen`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

今回の実環境観測：RA-01/02：復元後の管理者2名それぞれの新規Googleログイン、本人名義・生徒3名・送迎履歴3件、再読込保持、ログアウト後の再読込で台帳非表示を確認。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="FS-02"></a>
## FS-02 生徒登録

参照：BF-02 / REQ-02 / FS-02 / TS-02 / TASK-02 / CODE-02 / TEST-02 / AT-02 / OPS-02 / USR-02

画面 A04, D03。I/F IF-04, IF-11。生徒が1件増え全入力値と初期残高10が保存される。

実装：`gas/Code.gs` の `createStudent_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-03"></a>
## FS-03 保護者の残数確認

参照：BF-03 / REQ-03 / FS-03 / TS-03 / TASK-03 / CODE-03 / TEST-03 / AT-03 / OPS-03 / USR-03

画面 P02。I/F IF-03。氏名と7回分・片道1枚の説明が表示される。 予約しただけでは残数は減らない。先生・管理者が完了にすると片道1回分・往復2回分が減る。残り2枚以下でも、この説明とMauro・Brendaへの連絡案内を表示する。

実装：`src/components/ParentPortal.tsx` の `ParentPortal`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-04"></a>
## FS-04 残少・ゼロ案内

参照：BF-03 / REQ-04 / FS-04 / TS-04 / TASK-04 / CODE-04 / TEST-04 / AT-04 / OPS-04 / USR-04

画面 P02。I/F IF-03。各値でMauro・Brendaへの連絡案内が表示される。

実装：`src/components/ParentPortal.tsx` の `ParentPortal`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-05"></a>
## FS-05 チケット追加

参照：BF-03 / REQ-05 / FS-05 / TS-05 / TASK-05 / CODE-05 / TEST-05 / AT-05 / OPS-05 / USR-05

画面 D02。I/F IF-10, IF-11。残高17、履歴1件増、枚数10・金額・備考一致。

実装：`gas/Code.gs` の `addTickets_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-06"></a>
## FS-06 保護者のお迎え予約

参照：BF-04 / REQ-06 / FS-06 / TS-06 / TASK-06 / CODE-06 / TEST-06 / AT-06 / OPS-06 / USR-06

画面 D01, P02。I/F IF-02, IF-13。新規予約1件、scheduled、parent、残高7のまま。

実装：`gas/Code.gs` の `createReservation_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-07"></a>
## FS-07 送り予約

参照：BF-04 / REQ-07 / FS-07 / TS-07 / TASK-07 / CODE-07 / TEST-07 / AT-07 / OPS-07 / USR-07

画面 D01。I/F IF-02, IF-13。dropoffの予約が1件増え、残高7のまま。

実装：`gas/Code.gs` の `createReservation_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-08"></a>
## FS-08 往復予約

参照：BF-04 / REQ-08 / FS-08 / TS-08 / TASK-08 / CODE-08 / TEST-08 / AT-08 / OPS-08 / USR-08

画面 D01。I/F IF-02, IF-13。roundtripの予約が1件増え、予約時残高7のまま。

実装：`gas/Code.gs` の `createReservation_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-09"></a>
## FS-09 管理者の代理予約

参照：BF-04 / REQ-09 / FS-09 / TS-09 / TASK-09 / CODE-09 / TEST-09 / AT-09 / OPS-09 / USR-09

画面 A02, D01。I/F IF-02。新規予約1件、reservedBy=teacher。

実装：`src/components/AddRideModal.tsx` の `AddRideModal`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-10"></a>
## FS-10 保護者の予約取消

参照：BF-05 / REQ-10 / FS-10 / TS-10 / TASK-10 / CODE-10 / TEST-10 / AT-10 / OPS-10 / USR-10

画面 P02, D05。I/F IF-05, IF-13。対象IDがcancelled、残高7のまま。

実装：`gas/Code.gs` の `cancelReservation_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-11"></a>
## FS-11 管理者の予約取消

参照：BF-05 / REQ-11 / FS-11 / TS-11 / TASK-11 / CODE-11 / TEST-11 / AT-11 / OPS-11 / USR-11

画面 A03, D05。I/F IF-05, IF-13。対象IDがcancelled、残数不変。

実装：`gas/Code.gs` の `cancelReservation_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-12"></a>
## FS-12 当日一覧・地図リンク

参照：BF-06 / REQ-12 / FS-12 / TS-12 / TASK-12 / CODE-12 / TEST-12 / AT-12 / OPS-12 / USR-12

画面 A02, E02。I/F IF-03, IF-16。当日予約とGoogle Maps検索URLが表示される（地図先の動作は対象外）。

実装：`src/components/TeacherDashboard.tsx` の `TeacherDashboard`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-13"></a>
## FS-13 片道完了

参照：BF-06 / REQ-13 / FS-13 / TS-13 / TASK-13 / CODE-13 / TEST-13 / AT-13 / OPS-13 / USR-13

画面 A02, A03。I/F IF-06, IF-11。completed・完了日時あり・残高6。

実装：`gas/Code.gs` の `completeRide_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-14"></a>
## FS-14 往復完了

参照：BF-06 / REQ-14 / FS-14 / TS-14 / TASK-14 / CODE-14 / TEST-14 / AT-14 / OPS-14 / USR-14

画面 A02, A03。I/F IF-06, IF-11。completed・残高5・消費2。

実装：`gas/Code.gs` の `completeRide_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-15"></a>
## FS-15 完了の二重処理防止

参照：BF-06 / REQ-15 / FS-15 / TS-15 / TASK-15 / CODE-15 / TEST-15 / AT-15 / OPS-15 / USR-15

画面 A02, A03。I/F IF-06。最終残高6、completedを保持、再処理の消費枚数0。

実装：`gas/Code.gs` の `completeRide_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-16"></a>
## FS-16 取消済みの完了拒否

参照：BF-06 / REQ-16 / FS-16 / TS-16 / TASK-16 / CODE-16 / TEST-16 / AT-16 / OPS-16 / USR-16

画面 A03。I/F IF-06。cancelledを保持し残高7のまま。

実装：`gas/Code.gs` の `completeRide_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-17"></a>
## FS-17 不正なチケット追加拒否

参照：BF-03 / REQ-17 / FS-17 / TS-17 / TASK-17 / CODE-17 / TEST-17 / AT-17 / OPS-17 / USR-17

画面 D02。I/F IF-10。全要求が拒否され残高7・購入履歴が不変。

実装：`gas/Code.gs` の `addTickets_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-18"></a>
## FS-18 通信障害時に成功扱いしない

参照：BF-07 / REQ-18 / FS-18 / TS-18 / TASK-18 / CODE-18 / TEST-18 / AT-18 / OPS-18 / USR-18

画面 D01。I/F IF-02, IF-09。すべて拒否、ローカル台帳不変、同一内容再試行の予約ID不変、UIにエラー表示してフォーム維持。 予約の応答内容を確認できない場合は未確認として表示し、同じタブ・同じ入力の再送では同じ予約IDを保持する。一覧は同じIDを1行として更新し、遅い予定中の応答で完了・取消を戻さない。

実装：`gas/Code.gs` の `mutate_` / `src/services/api.ts` の `request` / `src/App.tsx` の `handleCreateRide`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-19"></a>
## FS-19 未認証の管理操作を拒否

参照：BF-07 / REQ-19 / FS-19 / TS-19 / TASK-19 / CODE-19 / TEST-19 / AT-19 / OPS-19 / USR-19

画面 A01, P01。I/F IF-01。認証前はログイン画面のみ・台帳未生成。キー失効応答後はセッションと画面の個人情報を消しログイン画面に戻る。 検証専用の同一アカウント両画面確認はREQ-39に従い、通常の管理者・保護者の役割分離を変更しない。

実装：`gas/Code.gs` の `authenticateGoogle_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

今回の実環境観測：RA-03：公開管理者入口で未認証時に台帳非表示を確認。未認証API拒否を含むAT-19全体の再合格ではない。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="FS-20"></a>
## FS-20 保護者の家庭別アクセス制限

参照：BF-07 / REQ-20 / FS-20 / TS-20 / TASK-20 / CODE-20 / TEST-20 / AT-20 / OPS-20 / USR-20

画面 P02。I/F IF-01, IF-03。STU-001だけを表示。別家庭の参照/予約/取消と完了/チケット追加を拒否。 検証専用の同一アカウント両画面確認はREQ-39に従い、通常の管理者・保護者の役割分離を変更しない。 入口が合わないアカウントでログインした場合、保護者用入口にはご家庭専用URL・QRの案内と管理者専用入口へのリンクを、管理者用入口にはご家庭専用URL・QRの案内だけを表示する。未登録・無効な個別URL・中断ではこの案内を出さない。サーバーの拒否判定と権限は変えない。

実装：`gas/Code.gs` の `requireAccess_` / `src/portal.ts` の `assertPortal` / `src/portal.ts` の `isPortalMismatch` / `src/components/LoginScreen.tsx` の `isPortalMismatch(error)`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-21"></a>
## FS-21 モバイル表示

参照：BF-08 / REQ-21 / FS-21 / TS-21 / TASK-21 / CODE-21 / TEST-21 / AT-21 / OPS-21 / USR-21

画面 A02, P02, D01。I/F IF-03。各画面でscrollWidthとinnerWidthが375px以下。保護者の予約・取消行も画面内に収まる。

実装：`src/components/ParentPortal.tsx` の `ParentPortal` / `src/components/AddRideModal.tsx` の `max-h-[calc(100dvh-2rem)] overflow-y-auto`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-22"></a>
## FS-22 再読込後の永続化

参照：BF-07 / REQ-22 / FS-22 / TS-22 / TASK-22 / CODE-22 / TEST-22 / AT-22 / OPS-22 / USR-22

画面 A02, P02。I/F IF-03。追加した生徒・予約のIDと値が維持される。

実装：`src/App.tsx` の `App`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-23"></a>
## FS-23 Google初期化・永続化

参照：BF-01 / REQ-23 / FS-23 / TS-23 / TASK-23 / CODE-23 / TEST-23 / AT-23 / OPS-23 / USR-23

画面 E04。I/F IF-15, IF-11。3シート生成・再実行で既存値不変・新規生徒1行。

実装：`gas/Code.gs` の `initSpreadsheet`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-24"></a>
## FS-24 実カレンダー予約同期

参照：BF-04 / REQ-24 / FS-24 / TS-24 / TASK-24 / CODE-24 / TEST-24 / AT-24 / OPS-24 / USR-24

画面 D01, E02, E03。I/F IF-02, IF-13。作成予定の説明欄に予約IDを記載し、台帳のイベントIDで予定を特定する。 検証先はScript PropertiesのTEST_CALENDAR_IDで固定し、未設定・認可不足・primary・非所有・ID不一致は書込み前に拒否する。取消予定が指定先で特定できない場合も台帳を変更しない。

実装：`gas/Code.gs` の `createReservation_` / `gas/Code.gs` の `verificationCalendar_` / `gas/appsscript.json` の `https://www.googleapis.com/auth/calendar`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

今回の実環境観測：AT24-LIVE-20261110：開発担当が検証環境の管理者画面から架空生徒へ2026-11-12 15:30のお迎えを1件登録。検証台帳の予約IDと、台帳のイベントIDで特定した検証専用カレンダーの予定の説明欄の予約ID・日時・場所が一致。管理者による1回の実施で、保護者からの予約・実機・顧客確認は未確認。状態欄は変更していない。 [確認記録](../progress/2026-11-10-evening-fix-and-acceptance.md)

<a id="FS-25"></a>
## FS-25 実カレンダー取消同期

参照：BF-05 / REQ-25 / FS-25 / TS-25 / TASK-25 / CODE-25 / TEST-25 / AT-25 / OPS-25 / USR-25

画面 D05, E02, E03。I/F IF-05, IF-13。cancelled・対象イベント削除・残高不変。 検証先はScript PropertiesのTEST_CALENDAR_IDで固定し、未設定・認可不足・primary・非所有・ID不一致は書込み前に拒否する。取消予定が指定先で特定できない場合も台帳を変更しない。

実装：`gas/Code.gs` の `cancelReservation_` / `gas/Code.gs` の `verificationCalendar_` / `gas/appsscript.json` の `https://www.googleapis.com/auth/calendar`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

今回の実環境観測：AT25-LIVE-20261110：同じ予約を管理者画面から取消。検証台帳はcancelled、台帳のイベントIDを持つ予定はカレンダーに0件、残数は8のまま。確認ダイアログは自動承諾に置き換えて実行し文言は未確認。管理者による1回の実施で、保護者からの取消・実機・顧客確認は未確認。状態欄は変更していない。 [確認記録](../progress/2026-11-10-evening-fix-and-acceptance.md)

<a id="FS-26"></a>
## FS-26 管理者2名・保護者の端末共有

参照：BF-07 / REQ-26 / FS-26 / TS-26 / TASK-26 / CODE-26 / TEST-26 / AT-26 / OPS-26 / USR-26

画面 A02, P02。I/F IF-03, IF-06。同一予約・残高を確認し家庭の範囲を維持。 検証専用の同一アカウント両画面確認はREQ-39に従い、通常の管理者・保護者の役割分離を変更しない。

実装：`gas/Code.gs` の `withLock_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

今回の実環境観測：RA-01/02/07/08：復元後の管理者2名の本人ログイン・再読込・ログアウトを確認。両管理者から有効・本人確認済み2名と一時家庭なしを読取り照合。予約・完了・他端末の更新共有を含むAT-26全体は未完。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="FS-27"></a>
## FS-27 同時完了の排他制御

参照：BF-06 / REQ-27 / FS-27 / TS-27 / TASK-27 / CODE-27 / TEST-27 / AT-27 / OPS-27 / USR-27

画面 A02, A03。I/F IF-06。完了1件・片道1枚だけ消費、再試行でも不変。

実装：`gas/Code.gs` の `withLock_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

今回の実環境観測：AT27-LIVE-01/02：2管理者の同時完了で3枚→2枚。別の専用送迎を管理者1で完了確定後、完了前の管理者2画面から明示再試行して追加0枚・残数2枚・送迎行と完了日時不変を確認。試験行除去後に主要3シートの実行前範囲一致。開発側の期待値確認は完了、独立した第三者受入は未実施。 [確認記録](concurrent-completion-plan-2026-10-23/README.md)

<a id="FS-28"></a>
## FS-28 バックアップから復旧

参照：BF-08 / REQ-28 / FS-28 / TS-28 / TASK-28 / CODE-28 / TEST-28 / AT-28 / OPS-28 / USR-28

画面 E03, E04。I/F IF-14, IF-15。生徒・予約・購入履歴・カレンダーの整合を回復。

実装：N/A：バックアップ復元は担当者が外部画面で行う。自動復元APIはない。

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

今回の実環境観測：AT28-LIVE-01〜08：専用生徒・送迎・購入の3行をコピーから値復元して一致。会社Googleログイン後にWeb再取得で残数3・時刻16:30を確認。購入3枚は台帳で照合。IDガードした3行を除去し主要3シート先頭8行のSHA-256が実行前と一致、Webも元の生徒3名・履歴3件。台帳部分確認完了、Calendar整合・全体合格は未確認。 [確認記録](backup-restore-2026-10-23/README.md)

<a id="FS-29"></a>
## FS-29 実機受入

参照：BF-08 / REQ-29 / FS-29 / TS-29 / TASK-29 / CODE-29 / TEST-29 / AT-29 / OPS-29 / USR-29

画面 P02, D01。I/F IF-02, IF-05。入力・確認・操作が可能、受入担当の確認記録あり。

実装：`src/App.tsx` の `App`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

今回の実環境観測：DEV29-IOS-OBS-01〜04：iPhone 16 Pro Max・iOS26.6.2・Safariで管理者2、生徒3名・履歴3件・残数7/1/10・一覧右端列を画像確認。ログアウト後再読込でもログイン画面のみ・台帳非表示と本人が明示回答。iPhone管理者読取範囲は確認済み。Android・保護者本人・予約取消は未実施、AT-29全体未合格。 [確認記録](device-readonly-2026-10-24/README.md)

<a id="FS-30"></a>
## FS-30 リリース後スモークテスト

参照：BF-08 / REQ-30 / FS-30 / TS-30 / TASK-30 / CODE-30 / TEST-30 / AT-30 / OPS-30 / USR-30

画面 A01, P01。I/F IF-15。対象コミットと公開版一致、重大不具合なし、戻し手順あり。

実装：`scripts/prepare_test_release.cjs` の `sourceDigest`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

今回の実環境観測：RA-06：現行配布記録の公開7ファイルとSHA-256一致。古い固定版との比較失敗は棄却記録として保持。本番AT-30・実Google受入の合格ではない。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="FS-31"></a>
## FS-31 管理者による利用登録・停止・削除

参照：BF-09 / REQ-31 / FS-31 / TS-31 / TASK-31 / CODE-31 / TEST-31 / SAT-31 / OPS-31 / USR-31

画面 A06, D04。I/F IF-08, IF-09。管理者が本人メール・役割・対象生徒を登録し、変更・停止・削除する。 検証専用の同一アカウント両画面確認はREQ-39に従い、通常の管理者・保護者の役割分離を変更しない。

実装：`gas/Code.gs` の `saveManagedUser_` / `gas/Code.gs` の `deleteManagedUser_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

今回の実環境観測：RA-07/08：両管理者の公開管理画面で、有効・本人確認済みの管理者2名、一時検証家庭なしを確認。許可設定の書込は実施していない。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="FS-32"></a>
## FS-32 初回Google本人紐付け

参照：BF-09 / REQ-32 / FS-32 / TS-32 / TASK-32 / CODE-32 / TEST-32 / SAT-32 / OPS-32 / USR-32

画面 A01, P01, E01。I/F IF-01, IF-09。本人確認済みGoogleメールだけを事前登録と紐付ける。

実装：`gas/Code.gs` の `authenticateGoogle_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

今回の実環境観測：RA-04：公開保護者入口の入力欄0・管理者メニューなし・台帳なしを確認。家庭本人での実ログインは今回未実施。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="FS-33"></a>
## FS-33 家庭URL・QRの配布と再発行

参照：BF-09 / REQ-33 / FS-33 / TS-33 / TASK-33 / CODE-33 / TEST-33 / SAT-33 / OPS-33 / USR-33

画面 A05, A06。I/F IF-07, IF-08。個別URLとQRは管理者が本人へ配布し紛失時再発行する。 検証専用の同一アカウント両画面確認はREQ-39に従い、通常の管理者・保護者の役割分離を変更しない。

実装：`src/components/PortalInvitations.tsx` の `PortalInvitations` / `gas/Code.gs` の `getPortalInvitations_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

今回の実環境観測：RA-05：不正形式の家庭URLはURL確認画面、家庭データ非表示。発行・失効を含むSAT-33全体の合格ではない。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="FS-34"></a>
## FS-34 Google認証・再読込・ログアウト

参照：BF-07 / REQ-34 / FS-34 / TS-34 / TASK-34 / CODE-34 / TEST-34 / SAT-34 / OPS-34 / USR-34

画面 A01, P01, A02, P02。I/F IF-01, IF-12。本人Googleでログインし毎通信で権限を確認。ログアウトで業務表示を消す。 検証専用の同一アカウント両画面確認はREQ-39に従い、通常の管理者・保護者の役割分離を変更しない。

実装：`src/services/google-auth.ts` の `signOutGoogle` / `src/services/api.ts` の `endSession`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

今回の実環境観測：RA-01/02-LOGOUT：復元後の両管理者についてログアウト直後・再読込後とも管理者ログイン画面だけとなり、台帳非表示を確認。 [確認記録](restored-admins-2026-10-23/README.md)

<a id="FS-35"></a>
## FS-35 台帳直接編集と反映

参照：BF-10 / REQ-35 / FS-35 / TS-35 / TASK-35 / CODE-35 / TEST-35 / SAT-35 / OPS-35 / USR-35

画面 E03, P02。I/F IF-14, IF-03。保守担当が対象を保全し接続先台帳を修正、再読込と関連値を照合する。

実装：N/A：手動の保全・外部台帳操作／実送迎。業務処理の自動コードはない。

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-36"></a>
## FS-36 カレンダー確認・実送迎・実績確認

参照：BF-06 / REQ-36 / FS-36 / TS-36 / TASK-36 / CODE-36 / TEST-36 / SAT-36 / OPS-36 / USR-36

画面 E02, A02, P02。I/F IF-16, IF-06。先生が当日の予定と変更取消を照合し送迎を行い実績を確認する。

実装：N/A：手動の保全・外部台帳操作／実送迎。業務処理の自動コードはない。

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-37"></a>
## FS-37 日時・場所変更と直前連絡

参照：BF-05 / REQ-37 / FS-37 / TS-37 / TASK-37 / CODE-37 / TEST-37 / SAT-37 / OPS-37 / USR-37

画面 A03, D05, D01。I/F IF-05, IF-02。変更は教室へ連絡し、直接変更APIがないため取消後に新規予約する。

実装：`gas/Code.gs` の `cancelReservation_` / `gas/Code.gs` の `createReservation_`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-38"></a>
## FS-38 工程横断のID・整合検査・共通デザイン

参照：BF-11 / REQ-38 / FS-38 / TS-38 / TASK-38 / CODE-38 / TEST-38 / SAT-38 / OPS-38 / USR-38

画面 画面なし・文書検査。I/F ローカル検査。全工程のID・参照・定義値・対応漏れと成果物改変を機械検査する。

実装：`scripts/traceability.py` の `validate`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

<a id="FS-39"></a>
## FS-39 随時実施できる顧客確認と検証専用の両画面アクセス

参照：BF-08 / REQ-39 / FS-39 / TS-39 / TASK-39 / CODE-39 / TEST-39 / SAT-39 / OPS-39 / USR-39

検証専用の保存role reviewerを、Google本人確認と指定検証台帳IDの一致で有効にする。A01/P01のportalRoleに応じて公開roleをadmin/parentへ決定しreviewOnlyを付す。割当生徒の予約・取消・完了・追加だけを許可し、生徒新規・アカウント管理・招待一覧は拒否。利用停止と検証設定不一致は次の通信・更新ロック内で拒否。通常の管理者・保護者は従来どおり片方の画面だけ。

実装：`gas/Code.gs` の `reviewModeAvailable_` / `src/services/api.ts` の `reviewOnly` / `src/components/AccountManagement.tsx` の `reviewModeAvailable` / `src/App.tsx` の `reviewOnly` / `src/components/Navbar.tsx` の `reviewOnly` / `src/components/TeacherDashboard.tsx` の `reviewOnly`

自動処理と画面：手動の実送迎・連絡・承認は自動化しない。

