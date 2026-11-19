> 2026-10-22 アカウント運用変更：初期接続・初期管理者は開発担当、日常のGoogleアカウント登録・停止・削除・生徒紐付け・家庭URL再発行は管理者画面で行う。[現行仕様](../ACCOUNT_MANAGEMENT.md)を優先。Calendar未追加・本番未開始。

# 第三者による全30項目の受入テスト

ユーザー（開発担当者）以外の方が全30項目を実施し、証跡付きで全件合格することをリリース条件とする。過去の自動試験や開発者の合格を転記しない。現在0/30件実施。

実施者：未定／受入責任者：未定／実施日：未定／対象リリース識別子：実施前に記入

管理者入口：https://eigo-taxi-test.web.app/#/admin
保護者一般入口：https://eigo-taxi-test.web.app/#/parent
家庭別の実データ確認は事前登録された本人と専用URLを使用。URL・QRへアクセスキーを含めない。

## 実施方法

1. 各項目の正本仕様に従い、ダミーの検証台帳・対象版・初期値を記録する。
2. 期待結果と実測値を比較し、操作前後の画面・台帳・対象IDを記録する。
3. PASS / FAIL / BLOCKED / 未実施を記入する。未実施やBLOCKEDは合格に含めない。
4. 不合格は原因と修正を記録し、同じ版で必要範囲を再試験する。
5. 全30件の合格と受入責任者の確認後、別途リリース判断を行う。

新Google方式で変更されたAT-01などは旧手順（URL入力）をそのまま実行せず、新方式の適合手順を確定してから開始する。管理者2名・家庭A/B・失効の確認を省略しない。

**現時点ではCalendar権限追加と本番運用開始は禁止。AT-24/25等のCalendar試験とAT-30本番後確認は前提未成立としてBLOCKED。権限を追加して埋め合わせない。**

| 項目 | 確認対象 | 正本手順 | 結果 | 実施者・日付・対象版 | 実測・証跡・不具合 |
|---|---|---|---|---|---|
| AT-01 | Google連携先の設定保存 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-01) | 未実施 | — | — |
| AT-02 | 生徒登録 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-02) | 未実施 | — | — |
| AT-03 | 保護者の残数確認 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-03) | 未実施 | — | — |
| AT-04 | 残少・ゼロ案内 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-04) | 未実施 | — | — |
| AT-05 | チケット追加 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-05) | 未実施 | — | — |
| AT-06 | 保護者のお迎え予約 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-06) | 未実施 | — | — |
| AT-07 | 送り予約 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-07) | 未実施 | — | — |
| AT-08 | 往復予約 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-08) | 未実施 | — | — |
| AT-09 | 管理者の代理予約 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-09) | 未実施 | — | — |
| AT-10 | 保護者の予約取消 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-10) | 未実施 | — | — |
| AT-11 | 管理者の予約取消 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-11) | 未実施 | — | — |
| AT-12 | 当日一覧・地図リンク | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-12) | 未実施 | — | — |
| AT-13 | 片道完了 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-13) | 未実施 | — | — |
| AT-14 | 往復完了 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-14) | 未実施 | — | — |
| AT-15 | 完了の二重処理防止 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-15) | 未実施 | — | — |
| AT-16 | 取消済みの完了拒否 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-16) | 未実施 | — | — |
| AT-17 | 不正なチケット追加拒否 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-17) | 未実施 | — | — |
| AT-18 | 通信障害時に成功扱いしない | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-18) | 未実施 | — | — |
| AT-19 | 未認証の管理操作を拒否 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-19) | 未実施 | — | — |
| AT-20 | 保護者の家庭別アクセス制限 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-20) | 未実施 | — | — |
| AT-21 | モバイル表示 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-21) | 未実施 | — | — |
| AT-22 | 再読込後の永続化 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-22) | 未実施 | — | — |
| AT-23 | Google初期化・永続化 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-23) | 未実施 | — | — |
| AT-24 | 実カレンダー予約同期 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-24) | 未実施 | — | — |
| AT-25 | 実カレンダー取消同期 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-25) | 未実施 | — | — |
| AT-26 | 管理者2名・保護者の端末共有 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-26) | 未実施 | — | — |
| AT-27 | 同時完了の排他制御 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-27) | 未実施 | — | — |
| AT-28 | バックアップから復旧 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-28) | 未実施 | — | — |
| AT-29 | 実機受入 | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-29) | 未実施 | — | — |
| AT-30 | リリース後スモークテスト | [手順](06_ACCEPTANCE_TEST_SPEC.md#AT-30) | 未実施 | — | — |

## リリース判断の前提

- 顧客がログイン方式を了承し、対象版の手順を確定。
- 公開先読込エラーを解消。管理者・家庭別・失効・旧認証停止を確認。
- 第三者30/30件合格。過去23件の記録とは別集計。
- 教室側の運用Googleアカウント、責任者、復旧・配布手順を準備。
- Calendar権限追加・本番開始は将来の明示的な判断が必要。この文書は許可ではない。

## 実施用の記入表

[全30件の操作手順・期待結果・結果欄（CSV）](third-party-acceptance-checklist.csv)を用意。Google方式のAT-01、家庭内表示のAT-03、本人無効化のAT-19を現行仕様に合わせました。第三者試験は実施していません。

AT-30は本番後のスモークテストのため、「本番前に全30件合格」と時点が異なります。検証環境でのリハーサルを事前の受入とするか、受入責任者と確定する必要があります。本番開始を先行したり、未実施を合格に変更したりしません。



