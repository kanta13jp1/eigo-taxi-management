# 検証環境・接続台帳・画面反映

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

## OPS-18参照：通信障害時に成功扱いしない

[OPS-18 正本](acceptance/20_OPERATIONS.md#OPS-18)

担当者が前提を確認し、全5更新POSTを通信失敗させる。業務エラー/HTTP503/不正JSONも拒否確認。同一予約を再試行しUIでも予約する。 結果不明時は同一対象と履歴を照合してから判断する。 結果不明時は同じタブを残し、予約一覧と残数を読み直す。必要な再送も同じ入力で照合し、別タブ・入力変更・タブを閉じた後には同じIDを保証しない。

## OPS-19参照：未認証の管理操作を拒否

[OPS-19 正本](acceptance/20_OPERATIONS.md#OPS-19)

担当者が前提を確認し、未認証の画面とAPI拒否を確認。その後ローカル模擬APIでログインし、キー失効応答を注入する。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-20参照：保護者の家庭別アクセス制限

[OPS-20 正本](acceptance/20_OPERATIONS.md#OPS-20)

担当者が前提を確認し、生徒一覧・予約一覧・STU-002への参照/予約/取消・管理者操作の直接呼出を確認。 結果不明時は同一対象と履歴を照合してから判断する。 「この入口ではログインできません」と表示された利用者には、保護者はご家庭専用URL・QR、先生・管理者は管理者専用入口を案内する。

## OPS-23参照：Google初期化・永続化

[OPS-23 正本](acceptance/20_OPERATIONS.md#OPS-23)

担当者が前提を確認し、initSpreadsheetを2回実行し生徒をWeb登録、シートを開く。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-26参照：管理者2名・保護者の端末共有

[OPS-26 正本](acceptance/20_OPERATIONS.md#OPS-26)

担当者が前提を確認し、保護者予約 → 管理者A確認・完了 → 管理者Bと保護者が再取得。 結果不明時は同一対象と履歴を照合してから判断する。

## OPS-28参照：バックアップから復旧

[OPS-28 正本](acceptance/20_OPERATIONS.md#OPS-28)

担当者が前提を確認し、バックアップ → テスト行変更 → 復元 → Web再取得。 結果不明時は同一対象と履歴を照合してから判断する。

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

## 検証用台帳と元の台帳

現在の検証サイトは検証コピーへ接続。元の台帳との自動同期なし。本番接続先ではない。管理者はA01、家庭はP01にGoogleでログイン。

## 台帳を直接編集した後の反映

対象IDを保全・照合してE03で修正後、Webを再読込。直接編集ではカレンダー更新・チケット計算・関連履歴更新を自動実行しない。
