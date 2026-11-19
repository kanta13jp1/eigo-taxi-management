# Googleアカウント管理

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

## FS-01参照：開発者設定とGoogleログイン

[FS-01 正本](acceptance/04_FUNCTIONAL_SPEC.md#FS-01)

画面 A01, E01, E04。I/F IF-01, IF-15。許可された管理者だけが管理画面・検証台帳へ接続。再読込で本人を再確認し、ログアウト後は台帳を表示しない。 検証専用の同一アカウント両画面確認はREQ-39に従い、通常の管理者・保護者の役割分離を変更しない。

## FS-18参照：通信障害時に成功扱いしない

[FS-18 正本](acceptance/04_FUNCTIONAL_SPEC.md#FS-18)

画面 D01。I/F IF-02, IF-09。すべて拒否、ローカル台帳不変、同一内容再試行の予約ID不変、UIにエラー表示してフォーム維持。 予約の応答内容を確認できない場合は未確認として表示し、同じタブ・同じ入力の再送では同じ予約IDを保持する。一覧は同じIDを1行として更新し、遅い予定中の応答で完了・取消を戻さない。

## FS-19参照：未認証の管理操作を拒否

[FS-19 正本](acceptance/04_FUNCTIONAL_SPEC.md#FS-19)

画面 A01, P01。I/F IF-01。認証前はログイン画面のみ・台帳未生成。キー失効応答後はセッションと画面の個人情報を消しログイン画面に戻る。 検証専用の同一アカウント両画面確認はREQ-39に従い、通常の管理者・保護者の役割分離を変更しない。

## FS-20参照：保護者の家庭別アクセス制限

[FS-20 正本](acceptance/04_FUNCTIONAL_SPEC.md#FS-20)

画面 P02。I/F IF-01, IF-03。STU-001だけを表示。別家庭の参照/予約/取消と完了/チケット追加を拒否。 検証専用の同一アカウント両画面確認はREQ-39に従い、通常の管理者・保護者の役割分離を変更しない。 入口が合わないアカウントでログインした場合、保護者用入口にはご家庭専用URL・QRの案内と管理者専用入口へのリンクを、管理者用入口にはご家庭専用URL・QRの案内だけを表示する。未登録・無効な個別URL・中断ではこの案内を出さない。サーバーの拒否判定と権限は変えない。

## FS-23参照：Google初期化・永続化

[FS-23 正本](acceptance/04_FUNCTIONAL_SPEC.md#FS-23)

画面 E04。I/F IF-15, IF-11。3シート生成・再実行で既存値不変・新規生徒1行。

## FS-26参照：管理者2名・保護者の端末共有

[FS-26 正本](acceptance/04_FUNCTIONAL_SPEC.md#FS-26)

画面 A02, P02。I/F IF-03, IF-06。同一予約・残高を確認し家庭の範囲を維持。 検証専用の同一アカウント両画面確認はREQ-39に従い、通常の管理者・保護者の役割分離を変更しない。

## FS-28参照：バックアップから復旧

[FS-28 正本](acceptance/04_FUNCTIONAL_SPEC.md#FS-28)

画面 E03, E04。I/F IF-14, IF-15。生徒・予約・購入履歴・カレンダーの整合を回復。

## FS-30参照：リリース後スモークテスト

[FS-30 正本](acceptance/04_FUNCTIONAL_SPEC.md#FS-30)

画面 A01, P01。I/F IF-15。対象コミットと公開版一致、重大不具合なし、戻し手順あり。

## FS-31参照：管理者による利用登録・停止・削除

[FS-31 正本](acceptance/04_FUNCTIONAL_SPEC.md#FS-31)

画面 A06, D04。I/F IF-08, IF-09。管理者が本人メール・役割・対象生徒を登録し、変更・停止・削除する。 検証専用の同一アカウント両画面確認はREQ-39に従い、通常の管理者・保護者の役割分離を変更しない。

## FS-32参照：初回Google本人紐付け

[FS-32 正本](acceptance/04_FUNCTIONAL_SPEC.md#FS-32)

画面 A01, P01, E01。I/F IF-01, IF-09。本人確認済みGoogleメールだけを事前登録と紐付ける。

## FS-33参照：家庭URL・QRの配布と再発行

[FS-33 正本](acceptance/04_FUNCTIONAL_SPEC.md#FS-33)

画面 A05, A06。I/F IF-07, IF-08。個別URLとQRは管理者が本人へ配布し紛失時再発行する。 検証専用の同一アカウント両画面確認はREQ-39に従い、通常の管理者・保護者の役割分離を変更しない。

## FS-34参照：Google認証・再読込・ログアウト

[FS-34 正本](acceptance/04_FUNCTIONAL_SPEC.md#FS-34)

画面 A01, P01, A02, P02。I/F IF-01, IF-12。本人Googleでログインし毎通信で権限を確認。ログアウトで業務表示を消す。 検証専用の同一アカウント両画面確認はREQ-39に従い、通常の管理者・保護者の役割分離を変更しない。

## FS-35参照：台帳直接編集と反映

[FS-35 正本](acceptance/04_FUNCTIONAL_SPEC.md#FS-35)

画面 E03, P02。I/F IF-14, IF-03。保守担当が対象を保全し接続先台帳を修正、再読込と関連値を照合する。

## FS-36参照：カレンダー確認・実送迎・実績確認

[FS-36 正本](acceptance/04_FUNCTIONAL_SPEC.md#FS-36)

画面 E02, A02, P02。I/F IF-16, IF-06。先生が当日の予定と変更取消を照合し送迎を行い実績を確認する。

## FS-37参照：日時・場所変更と直前連絡

[FS-37 正本](acceptance/04_FUNCTIONAL_SPEC.md#FS-37)

画面 A03, D05, D01。I/F IF-05, IF-02。変更は教室へ連絡し、直接変更APIがないため取消後に新規予約する。

## FS-38参照：工程横断のID・整合検査・共通デザイン

[FS-38 正本](acceptance/04_FUNCTIONAL_SPEC.md#FS-38)

画面 画面なし・文書検査。I/F ローカル検査。全工程のID・参照・定義値・対応漏れと成果物改変を機械検査する。

## FS-39参照：随時実施できる顧客確認と検証専用の両画面アクセス

[FS-39 正本](acceptance/04_FUNCTIONAL_SPEC.md#FS-39)

検証専用の保存role reviewerを、Google本人確認と指定検証台帳IDの一致で有効にする。A01/P01のportalRoleに応じて公開roleをadmin/parentへ決定しreviewOnlyを付す。割当生徒の予約・取消・完了・追加だけを許可し、生徒新規・アカウント管理・招待一覧は拒否。利用停止と検証設定不一致は次の通信・更新ロック内で拒否。通常の管理者・保護者は従来どおり片方の画面だけ。

