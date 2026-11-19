# ビジネスフロー図

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

<a id="BF-01"></a>
## BF-01 導入・接続設定

担当：導入担当。流れ：検証用Google資源を準備 → 接続 → 端末間確認。期待：接続・所有者・権限が確認できる

対応要件：REQ-01, REQ-23

<a id="BF-02"></a>
## BF-02 生徒利用開始

担当：管理者。流れ：生徒情報を受領 → 台帳登録 → 利用者に案内。期待：予約対象として選択できる

対応要件：REQ-02

<a id="BF-03"></a>
## BF-03 残数確認・チケット購入

担当：保護者・管理者。流れ：残数確認 → 残少案内 → 代金受領確認 → 回数追加。期待：残高と購入履歴が整合する

対応要件：REQ-03, REQ-04, REQ-05, REQ-17

<a id="BF-04"></a>
## BF-04 都度送迎予約

担当：保護者・管理者。流れ：生徒・日時・区分・場所を指定 → 登録 → 予定確認。期待：残数を減らさず予約・カレンダーに記録し、予定説明欄に予約IDを表示

対応要件：REQ-06, REQ-07, REQ-08, REQ-09, REQ-24

<a id="BF-05"></a>
## BF-05 送迎取消

担当：保護者・管理者。流れ：対象予約を確認 → 取消確認 → 履歴確認。期待：予定取消・カレンダー削除・残高維持

対応要件：REQ-10, REQ-11, REQ-25, REQ-37

<a id="BF-06"></a>
## BF-06 当日運行・実績処理

担当：管理者。流れ：当日予定確認 → 地図確認 → 送迎実施 → 完了登録。期待：片道1回・往復2回を一度だけ消費

対応要件：REQ-12, REQ-13, REQ-14, REQ-15, REQ-16, REQ-27, REQ-36

<a id="BF-07"></a>
## BF-07 アクセス管理・障害対応

担当：運用担当。流れ：本人確認 → 権限判定 → 操作 → 障害検知・復旧。期待：他家庭の情報を保護し記録を失わない

対応要件：REQ-18, REQ-19, REQ-20, REQ-22, REQ-26, REQ-34

<a id="BF-08"></a>
## BF-08 受入・リリース・保守

担当：導入担当・受入担当。流れ：仕様確認 → テスト → 不具合修正 → 再試験 → 受入 → リリース。期待：合格証跡・復旧手順・担当者を残す

対応要件：REQ-21, REQ-28, REQ-29, REQ-30, REQ-39

<a id="BF-09"></a>
## BF-09 利用者登録・停止・退会

担当：管理者・本人。流れ：本人情報受領→利用登録→初回紐付け→変更・停止・退会。期待：管理者が日常運用し家庭範囲を維持

対応要件：REQ-31, REQ-32, REQ-33

<a id="BF-10"></a>
## BF-10 台帳の保守修正

担当：管理者・保守。流れ：対象確認→保全・操作停止→修正→関連照合→画面再取得。期待：検証と元台帳を混同せず関連値を維持

対応要件：REQ-35

<a id="BF-11"></a>
## BF-11 文書・実装・検証の変更管理

担当：開発・レビュー担当。流れ：ID登録→変更→自動生成→機械検査→差分レビュー。期待：工程間の参照と欠落を検知し受入と区別

対応要件：REQ-38

[担当者別フロー・画面/I/F入りPowerPoint](../deliverables/2026-10-23-traceability/README.md)
