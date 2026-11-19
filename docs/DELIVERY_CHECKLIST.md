# 配布・リリース確認

正本版：2026-11-11-r19。旧本文は docs/history/pre-traceability-20261023 に保存。

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

小林さんの顧客確認は0/6件合格。原AT-01〜30は開発担当が技術検証する。旧第三者受入0/30件は履歴。検証専用Calendarの権限追加は許可済み、Googleの実同意済み。本番開始は保留中。 [顧客確認の6手順](acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md)

毎日、改善を1件以上検証サイトへ反映し、公開画面で期待する動作を確認する。日次の配備・確認、顧客6件、技術受入の結果を個別に記録する。

- [CUST-01　本人のGoogleログインと家庭の残数](acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md#CUST-01)　NOT_RUN
- [CUST-02　1回分の予約と検証カレンダーの照合](acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md#CUST-02)　NOT_RUN
- [CUST-03　予約を取り消して残数を確認](acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md#CUST-03)　NOT_RUN
- [CUST-04　送迎完了で片道1枚・往復2枚を消費](acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md#CUST-04)　NOT_RUN
- [CUST-05　残少のお知らせとチケット追加](acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md#CUST-05)　NOT_RUN
- [CUST-06　ログアウト後に台帳が見えないことを確認](acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md#CUST-06)　NOT_RUN

## TASK-01参照：開発者設定とGoogleログイン

[TASK-01 正本](acceptance/05_TASKS.md#TASK-01)

管理者URLを開く。接続先URL・キー入力欄がないことを確認しGoogleで本人を選択。台帳取得後に再読込し、ログアウトする。

## TASK-18参照：通信障害時に成功扱いしない

[TASK-18 正本](acceptance/05_TASKS.md#TASK-18)

全5更新POSTを通信失敗させる。業務エラー/HTTP503/不正JSONも拒否確認。同一予約を再試行しUIでも予約する。

## TASK-19参照：未認証の管理操作を拒否

[TASK-19 正本](acceptance/05_TASKS.md#TASK-19)

未認証の画面とAPI拒否を確認。その後ローカル模擬APIでログインし、キー失効応答を注入する。

## TASK-20参照：保護者の家庭別アクセス制限

[TASK-20 正本](acceptance/05_TASKS.md#TASK-20)

生徒一覧・予約一覧・STU-002への参照/予約/取消・管理者操作の直接呼出を確認。

## TASK-23参照：Google初期化・永続化

[TASK-23 正本](acceptance/05_TASKS.md#TASK-23)

initSpreadsheetを2回実行し生徒をWeb登録、シートを開く。

## TASK-26参照：管理者2名・保護者の端末共有

[TASK-26 正本](acceptance/05_TASKS.md#TASK-26)

保護者予約 → 管理者A確認・完了 → 管理者Bと保護者が再取得。

## TASK-28参照：バックアップから復旧

[TASK-28 正本](acceptance/05_TASKS.md#TASK-28)

バックアップ → テスト行変更 → 復元 → Web再取得。

## TASK-30参照：リリース後スモークテスト

[TASK-30 正本](acceptance/05_TASKS.md#TASK-30)

将来本番開始が承認され、配備された後に、開発担当が本番URLで権限・予約・取消・連携・版を確認する。現在は本番開始を保留中。

## TASK-31参照：管理者による利用登録・停止・削除

[TASK-31 正本](acceptance/05_TASKS.md#TASK-31)

A06で登録・停止・再有効化・削除を行い次の通信の権限を確認。

## TASK-32参照：初回Google本人紐付け

[TASK-32 正本](acceptance/05_TASKS.md#TASK-32)

事前登録した本人で初回ログイン。未確認メール・停止済み・他人で試す。

## TASK-33参照：家庭URL・QRの配布と再発行

[TASK-33 正本](acceptance/05_TASKS.md#TASK-33)

A05で表示・コピー。A06で再発行後、新旧URLで本人ログイン。

## TASK-34参照：Google認証・再読込・ログアウト

[TASK-34 正本](acceptance/05_TASKS.md#TASK-34)

管理者2名・家庭2つを別セッションでログイン・再取得・終了。

## TASK-35参照：台帳直接編集と反映

[TASK-35 正本](acceptance/05_TASKS.md#TASK-35)

同時操作停止・バックアップ後、検証台帳の対象値を修正しサイト再取得。

## TASK-36参照：カレンダー確認・実送迎・実績確認

[TASK-36 正本](acceptance/05_TASKS.md#TASK-36)

時刻・生徒・場所を確認し、お迎え／送り／往復を実施した記録を確認後に完了登録。

## TASK-37参照：日時・場所変更と直前連絡

[TASK-37 正本](acceptance/05_TASKS.md#TASK-37)

旧予約取消の成功を照合して新しい内容を登録し二重予約がないか確認。

## TASK-38参照：工程横断のID・整合検査・共通デザイン

[TASK-38 正本](acceptance/05_TASKS.md#TASK-38)

正本変更→生成→検査。重複ID・欠落・参照切れ・仕様値相違の異常系も確認。

## TASK-39参照：随時実施できる顧客確認と検証専用の両画面アクセス

[TASK-39 正本](acceptance/05_TASKS.md#TASK-39)

家庭用固定URLでCUST-01〜03→ログアウト→管理者用固定URLのA03でCUST-04→家庭用URLで残少案内→管理者用URLで10枚0円を追加→家庭用URLで12枚を確認。両画面でログアウト後非表示を確認。中断時は共有表に記録し未実施だけ再開。

