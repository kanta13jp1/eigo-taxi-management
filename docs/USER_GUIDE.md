# ユーザーマニュアル

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

## USR-01参照：開発者設定とGoogleログイン

[USR-01 正本](acceptance/21_USER_MANUAL.md#USR-01)

開発者設定とGoogleログイン：管理者URLを開く。接続先URL・キー入力欄がないことを確認しGoogleで本人を選択。台帳取得後に再読込し、ログアウトする。

## USR-02参照：生徒登録

[USR-02 正本](acceptance/21_USER_MANUAL.md#USR-02)

生徒登録：生徒登録画面で氏名・保護者・住所・連絡先・初期10回を登録。

## USR-03参照：保護者の残数確認

[USR-03 正本](acceptance/21_USER_MANUAL.md#USR-03)

保護者の残数確認：登録済み保護者が家庭専用URLからGoogleで入り、自家庭のお子様の氏名・残高・説明を確認。他家庭が選べないことを確認。 予約しただけでは残数は減らない。先生・管理者が完了にすると片道1回分・往復2回分が減る。残り2枚以下でも、この説明とMauro・Brendaへの連絡案内を表示する。

## USR-04参照：残少・ゼロ案内

[USR-04 正本](acceptance/21_USER_MANUAL.md#USR-04)

残少・ゼロ案内：各残高で利用者画面を開く。

## USR-05参照：チケット追加

[USR-05 正本](acceptance/21_USER_MANUAL.md#USR-05)

チケット追加：10回を追加し台帳・購入履歴を確認。

## USR-06参照：保護者のお迎え予約

[USR-06 正本](acceptance/21_USER_MANUAL.md#USR-06)

保護者のお迎え予約：利用者画面から2026-10-20 16:30・お迎え・登録済み住所を使って予約。

## USR-07参照：送り予約

[USR-07 正本](acceptance/21_USER_MANUAL.md#USR-07)

送り予約：サービス経由で送り17:30を登録し画面を再表示。

## USR-08参照：往復予約

[USR-08 正本](acceptance/21_USER_MANUAL.md#USR-08)

往復予約：サービス経由で往復を登録し画面を再表示。

## USR-09参照：管理者の代理予約

[USR-09 正本](acceptance/21_USER_MANUAL.md#USR-09)

管理者の代理予約：管理者画面から日時・生徒・場所を指定して予約。

## USR-10参照：保護者の予約取消

[USR-10 正本](acceptance/21_USER_MANUAL.md#USR-10)

保護者の予約取消：利用者画面で対象予約をキャンセルし確認を承諾。

## USR-11参照：管理者の予約取消

[USR-11 正本](acceptance/21_USER_MANUAL.md#USR-11)

管理者の予約取消：サービス経由で取消後に管理画面を再表示。

## USR-12参照：当日一覧・地図リンク

[USR-12 正本](acceptance/21_USER_MANUAL.md#USR-12)

当日一覧・地図リンク：管理者画面を開き地図リンクを調べる。

## USR-13参照：片道完了

[USR-13 正本](acceptance/21_USER_MANUAL.md#USR-13)

片道完了：サービス経由で完了後に画面を再表示。

## USR-14参照：往復完了

[USR-14 正本](acceptance/21_USER_MANUAL.md#USR-14)

往復完了：サービス経由で往復完了後に画面を再表示。

## USR-15参照：完了の二重処理防止

[USR-15 正本](acceptance/21_USER_MANUAL.md#USR-15)

完了の二重処理防止：同じ予約IDに完了を2回要求。

## USR-16参照：取消済みの完了拒否

[USR-16 正本](acceptance/21_USER_MANUAL.md#USR-16)

取消済みの完了拒否：取消済みIDを完了要求。

## USR-17参照：不正なチケット追加拒否

[USR-17 正本](acceptance/21_USER_MANUAL.md#USR-17)

不正なチケット追加拒否：枚数に-1/0/小数/NaN/Infinity/101、金額に負数/小数/NaN/Infinityを渡す。

## USR-18参照：通信障害時に成功扱いしない

[USR-18 正本](acceptance/21_USER_MANUAL.md#USR-18)

エラー後は同じタブを残し、予約一覧と残数を確認してください。同じタブで同じ内容を再送する場合は同じ予約IDで照合します。入力変更や別のタブでは新しい操作になるため、結果が分からないときは教室へ連絡してください。

## USR-19参照：未認証の管理操作を拒否

[USR-19 正本](acceptance/21_USER_MANUAL.md#USR-19)

未認証の管理操作を拒否：未認証の画面とAPI拒否を確認。その後ローカル模擬APIでログインし、キー失効応答を注入する。

## USR-20参照：保護者の家庭別アクセス制限

[USR-20 正本](acceptance/21_USER_MANUAL.md#USR-20)

保護者の家庭別アクセス制限：生徒一覧・予約一覧・STU-002への参照/予約/取消・管理者操作の直接呼出を確認。 「この入口ではログインできません」と表示されたら、教室から届いたご家庭専用のURLまたはQRコードを開き直してください。

## USR-21参照：モバイル表示

[USR-21 正本](acceptance/21_USER_MANUAL.md#USR-21)

モバイル表示：管理・利用者・予約フォームを順に表示し、指定幅375pxと実際の描画幅を照合。

## USR-22参照：再読込後の永続化

[USR-22 正本](acceptance/21_USER_MANUAL.md#USR-22)

再読込後の永続化：生徒追加と予約登録後に再読込。

## USR-23参照：Google初期化・永続化

[USR-23 正本](acceptance/21_USER_MANUAL.md#USR-23)

開発・運用担当向け。利用者の直接操作は対象外。

## USR-24参照：実カレンダー予約同期

[USR-24 正本](acceptance/21_USER_MANUAL.md#USR-24)

開発・運用担当向け。利用者の直接操作は対象外。

## USR-25参照：実カレンダー取消同期

[USR-25 正本](acceptance/21_USER_MANUAL.md#USR-25)

開発・運用担当向け。利用者の直接操作は対象外。

## USR-26参照：管理者2名・保護者の端末共有

[USR-26 正本](acceptance/21_USER_MANUAL.md#USR-26)

管理者2名・保護者の端末共有：保護者予約 → 管理者A確認・完了 → 管理者Bと保護者が再取得。

## USR-27参照：同時完了の排他制御

[USR-27 正本](acceptance/21_USER_MANUAL.md#USR-27)

開発・運用担当向け。利用者の直接操作は対象外。

## USR-28参照：バックアップから復旧

[USR-28 正本](acceptance/21_USER_MANUAL.md#USR-28)

開発・運用担当向け。利用者の直接操作は対象外。

## USR-29参照：実機受入

[USR-29 正本](acceptance/21_USER_MANUAL.md#USR-29)

実機受入：予約・取消・残高確認を各実機で実施。

## USR-30参照：リリース後スモークテスト

[USR-30 正本](acceptance/21_USER_MANUAL.md#USR-30)

開発・運用担当向け。利用者の直接操作は対象外。

## USR-31参照：管理者による利用登録・停止・削除

[USR-31 正本](acceptance/21_USER_MANUAL.md#USR-31)

管理者による利用登録・停止・削除：A06で登録・停止・再有効化・削除を行い次の通信の権限を確認。

## USR-32参照：初回Google本人紐付け

[USR-32 正本](acceptance/21_USER_MANUAL.md#USR-32)

初回Google本人紐付け：事前登録した本人で初回ログイン。未確認メール・停止済み・他人で試す。

## USR-33参照：家庭URL・QRの配布と再発行

[USR-33 正本](acceptance/21_USER_MANUAL.md#USR-33)

家庭URL・QRの配布と再発行：A05で表示・コピー。A06で再発行後、新旧URLで本人ログイン。

## USR-34参照：Google認証・再読込・ログアウト

[USR-34 正本](acceptance/21_USER_MANUAL.md#USR-34)

Google認証・再読込・ログアウト：管理者2名・家庭2つを別セッションでログイン・再取得・終了。

## USR-35参照：台帳直接編集と反映

[USR-35 正本](acceptance/21_USER_MANUAL.md#USR-35)

台帳直接編集と反映：同時操作停止・バックアップ後、検証台帳の対象値を修正しサイト再取得。

## USR-36参照：カレンダー確認・実送迎・実績確認

[USR-36 正本](acceptance/21_USER_MANUAL.md#USR-36)

カレンダー確認・実送迎・実績確認：時刻・生徒・場所を確認し、お迎え／送り／往復を実施した記録を確認後に完了登録。

## USR-37参照：日時・場所変更と直前連絡

[USR-37 正本](acceptance/21_USER_MANUAL.md#USR-37)

日時・場所変更と直前連絡：旧予約取消の成功を照合して新しい内容を登録し二重予約がないか確認。

## USR-38参照：工程横断のID・整合検査・共通デザイン

[USR-38 正本](acceptance/21_USER_MANUAL.md#USR-38)

開発・運用担当向け。利用者の直接操作は対象外。

## USR-39参照：随時実施できる顧客確認と検証専用の両画面アクセス

[USR-39 正本](acceptance/21_USER_MANUAL.md#USR-39)

都合のよい時に6件を順番に実施。画面を変える時はログアウトして固定URLへ入り直す。「本日の送迎」ではなく「送迎スケジュール一覧」で印付き2予約を操作する。途中の結果を共有表へ残し、再開時は未実施だけ進める。実際の送迎・支払いは行わない。

