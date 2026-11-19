# 管理者マニュアル

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

## OPS-01参照：開発者設定とGoogleログイン

[OPS-01 正本](acceptance/20_OPERATIONS.md#OPS-01)

担当者が前提を確認し、管理者URLを開く。接続先URL・キー入力欄がないことを確認しGoogleで本人を選択。台帳取得後に再読込し、ログアウトする。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-02参照：生徒登録

[OPS-02 正本](acceptance/20_OPERATIONS.md#OPS-02)

担当者が前提を確認し、生徒登録画面で氏名・保護者・住所・連絡先・初期10回を登録。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-03参照：保護者の残数確認

[OPS-03 正本](acceptance/20_OPERATIONS.md#OPS-03)

担当者が前提を確認し、登録済み保護者が家庭専用URLからGoogleで入り、自家庭のお子様の氏名・残高・説明を確認。他家庭が選べないことを確認。 結果不明時は同一対象と履歴を照合してから判断する。 予約しただけでは残数は減らない。先生・管理者が完了にすると片道1回分・往復2回分が減る。残り2枚以下でも、この説明とMauro・Brendaへの連絡案内を表示する。

## OPS-04参照：残少・ゼロ案内

[OPS-04 正本](acceptance/20_OPERATIONS.md#OPS-04)

担当者が前提を確認し、各残高で利用者画面を開く。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-05参照：チケット追加

[OPS-05 正本](acceptance/20_OPERATIONS.md#OPS-05)

担当者が前提を確認し、10回を追加し台帳・購入履歴を確認。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-06参照：保護者のお迎え予約

[OPS-06 正本](acceptance/20_OPERATIONS.md#OPS-06)

担当者が前提を確認し、利用者画面から2026-10-20 16:30・お迎え・登録済み住所を使って予約。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-07参照：送り予約

[OPS-07 正本](acceptance/20_OPERATIONS.md#OPS-07)

担当者が前提を確認し、サービス経由で送り17:30を登録し画面を再表示。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-08参照：往復予約

[OPS-08 正本](acceptance/20_OPERATIONS.md#OPS-08)

担当者が前提を確認し、サービス経由で往復を登録し画面を再表示。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-09参照：管理者の代理予約

[OPS-09 正本](acceptance/20_OPERATIONS.md#OPS-09)

担当者が前提を確認し、管理者画面から日時・生徒・場所を指定して予約。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-10参照：保護者の予約取消

[OPS-10 正本](acceptance/20_OPERATIONS.md#OPS-10)

担当者が前提を確認し、利用者画面で対象予約をキャンセルし確認を承諾。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-11参照：管理者の予約取消

[OPS-11 正本](acceptance/20_OPERATIONS.md#OPS-11)

担当者が前提を確認し、サービス経由で取消後に管理画面を再表示。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-12参照：当日一覧・地図リンク

[OPS-12 正本](acceptance/20_OPERATIONS.md#OPS-12)

担当者が前提を確認し、管理者画面を開き地図リンクを調べる。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-13参照：片道完了

[OPS-13 正本](acceptance/20_OPERATIONS.md#OPS-13)

担当者が前提を確認し、サービス経由で完了後に画面を再表示。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-14参照：往復完了

[OPS-14 正本](acceptance/20_OPERATIONS.md#OPS-14)

担当者が前提を確認し、サービス経由で往復完了後に画面を再表示。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-15参照：完了の二重処理防止

[OPS-15 正本](acceptance/20_OPERATIONS.md#OPS-15)

担当者が前提を確認し、同じ予約IDに完了を2回要求。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-16参照：取消済みの完了拒否

[OPS-16 正本](acceptance/20_OPERATIONS.md#OPS-16)

担当者が前提を確認し、取消済みIDを完了要求。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-17参照：不正なチケット追加拒否

[OPS-17 正本](acceptance/20_OPERATIONS.md#OPS-17)

担当者が前提を確認し、枚数に-1/0/小数/NaN/Infinity/101、金額に負数/小数/NaN/Infinityを渡す。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-18参照：通信障害時に成功扱いしない

[OPS-18 正本](acceptance/20_OPERATIONS.md#OPS-18)

担当者が前提を確認し、全5更新POSTを通信失敗させる。業務エラー/HTTP503/不正JSONも拒否確認。同一予約を再試行しUIでも予約する。 結果不明時は同一対象と履歴を照合してから判断する。 結果不明時は同じタブを残し、予約一覧と残数を読み直す。必要な再送も同じ入力で照合し、別タブ・入力変更・タブを閉じた後には同じIDを保証しない。

## OPS-19参照：未認証の管理操作を拒否

[OPS-19 正本](acceptance/20_OPERATIONS.md#OPS-19)

担当者が前提を確認し、未認証の画面とAPI拒否を確認。その後ローカル模擬APIでログインし、キー失効応答を注入する。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-20参照：保護者の家庭別アクセス制限

[OPS-20 正本](acceptance/20_OPERATIONS.md#OPS-20)

担当者が前提を確認し、生徒一覧・予約一覧・STU-002への参照/予約/取消・管理者操作の直接呼出を確認。 結果不明時は同一対象と履歴を照合してから判断する。 「この入口ではログインできません」と表示された利用者には、保護者はご家庭専用URL・QR、先生・管理者は管理者専用入口を案内する。

## OPS-21参照：モバイル表示

[OPS-21 正本](acceptance/20_OPERATIONS.md#OPS-21)

担当者が前提を確認し、管理・利用者・予約フォームを順に表示し、指定幅375pxと実際の描画幅を照合。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-22参照：再読込後の永続化

[OPS-22 正本](acceptance/20_OPERATIONS.md#OPS-22)

担当者が前提を確認し、生徒追加と予約登録後に再読込。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-23参照：Google初期化・永続化

[OPS-23 正本](acceptance/20_OPERATIONS.md#OPS-23)

担当者が前提を確認し、initSpreadsheetを2回実行し生徒をWeb登録、シートを開く。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-24参照：実カレンダー予約同期

[OPS-24 正本](acceptance/20_OPERATIONS.md#OPS-24)

担当者が前提を確認し、Webから予約して台帳のイベントIDでカレンダー予定を特定し、予定説明欄の予約IDと台帳の予約ID、日時・場所を照合する。結果不明時は同一対象と履歴を照合してから判断する。

## OPS-25参照：実カレンダー取消同期

[OPS-25 正本](acceptance/20_OPERATIONS.md#OPS-25)

担当者が前提を確認し、予約取消後にシートとカレンダーを開く。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-26参照：管理者2名・保護者の端末共有

[OPS-26 正本](acceptance/20_OPERATIONS.md#OPS-26)

担当者が前提を確認し、保護者予約 → 管理者A確認・完了 → 管理者Bと保護者が再取得。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-27参照：同時完了の排他制御

[OPS-27 正本](acceptance/20_OPERATIONS.md#OPS-27)

担当者が前提を確認し、同じ予約を両管理者から同時に完了。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-28参照：バックアップから復旧

[OPS-28 正本](acceptance/20_OPERATIONS.md#OPS-28)

担当者が前提を確認し、バックアップ → テスト行変更 → 復元 → Web再取得。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-29参照：実機受入

[OPS-29 正本](acceptance/20_OPERATIONS.md#OPS-29)

担当者が前提を確認し、予約・取消・残高確認を各実機で実施。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-30参照：リリース後スモークテスト

[OPS-30 正本](acceptance/20_OPERATIONS.md#OPS-30)

本番開始の承認・配備後に開発担当が本番URLで権限・予約・取消・連携・版を検証する。対象と履歴を照合して結果を記録する。

## OPS-31参照：管理者による利用登録・停止・削除

[OPS-31 正本](acceptance/20_OPERATIONS.md#OPS-31)

担当者が前提を確認し、A06で登録・停止・再有効化・削除を行い次の通信の権限を確認。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-32参照：初回Google本人紐付け

[OPS-32 正本](acceptance/20_OPERATIONS.md#OPS-32)

担当者が前提を確認し、事前登録した本人で初回ログイン。未確認メール・停止済み・他人で試す。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-33参照：家庭URL・QRの配布と再発行

[OPS-33 正本](acceptance/20_OPERATIONS.md#OPS-33)

担当者が前提を確認し、A05で表示・コピー。A06で再発行後、新旧URLで本人ログイン。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-34参照：Google認証・再読込・ログアウト

[OPS-34 正本](acceptance/20_OPERATIONS.md#OPS-34)

担当者が前提を確認し、管理者2名・家庭2つを別セッションでログイン・再取得・終了。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-35参照：台帳直接編集と反映

[OPS-35 正本](acceptance/20_OPERATIONS.md#OPS-35)

担当者が前提を確認し、同時操作停止・バックアップ後、検証台帳の対象値を修正しサイト再取得。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-36参照：カレンダー確認・実送迎・実績確認

[OPS-36 正本](acceptance/20_OPERATIONS.md#OPS-36)

担当者が前提を確認し、時刻・生徒・場所を確認し、お迎え／送り／往復を実施した記録を確認後に完了登録。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-37参照：日時・場所変更と直前連絡

[OPS-37 正本](acceptance/20_OPERATIONS.md#OPS-37)

担当者が前提を確認し、旧予約取消の成功を照合して新しい内容を登録し二重予約がないか確認。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-38参照：工程横断のID・整合検査・共通デザイン

[OPS-38 正本](acceptance/20_OPERATIONS.md#OPS-38)

担当者が前提を確認し、正本変更→生成→検査。重複ID・欠落・参照切れ・仕様値相違の異常系も確認。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-39参照：随時実施できる顧客確認と検証専用の両画面アクセス

[OPS-39 正本](acceptance/20_OPERATIONS.md#OPS-39)

開発担当は一度だけ検証台帳・固定日2予約・検証専用Calendarを準備し、管理者はA06でreviewer登録と割当生徒を確認する。本人へ2つの固定URLと実績表を案内する。実施中の役割切替や当日用データ作成は不要。中断後は共有表の最後の残数と予約状態を照合し未実施のみ再開。完了済みの予約・チケット追加を繰り返さず、実施しない場合も本番開始の判断をしない。

