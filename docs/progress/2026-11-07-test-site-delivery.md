# 検証サイト反映と公開画面検証（2026-11-07）

PROGRESS-20261107-DELIVERY-01：小さい画面で予約ボタンへ進めない修正（ACCEL-C01、REQ-21、A04/P02）を検証サイトへ反映した。Firebase再認証完了後のCLIは終了コード0・success。反映先は `eigo-taxi-app / eigo-taxi-test`、Hosting versionは `679ec43146aecd55`、公開sourceDigestは `b7e510688a6e81268331db6d7d88db8875bf5ce443dbc90f52b4f647f39d1979`。ビルドは11/6、配備と公開側検証は11/7であり、11/6の完了実績へ遡及しない。

PROGRESS-20261107-DELIVERY-02：変更は予約フォームの最大高さと縦スクロールの1箇所。前回配備からGAS等の未配備差分を混ぜないよう、照合済みの独立候補を配備した。前回のアーカイブは保持した。公開6ファイルとルートURLの7応答を再取得し、すべてHTTP 200・期待SHA-256と一致した。

PROGRESS-20261107-DELIVERY-03：実際の公開デモで管理者・保護者それぞれの予約フォームを操作した。修正前と同じ試験スクリプトで、4件とも失敗から成功へ変わった。

| 試験ID | 役割 | 画面寸法 | 修正前 | 反映後 | ボタン下端／画面高 |
|---|---|---|---|---|---|
| HOSTED-SCROLL-admin-375x500 | 管理者 | 375×500 | FAIL | PASS | 459／500px |
| HOSTED-SCROLL-admin-812x375 | 管理者 | 812×375 | FAIL | PASS | 334／375px |
| HOSTED-SCROLL-parent-375x500 | 保護者 | 375×500 | FAIL | PASS | 459／500px |
| HOSTED-SCROLL-parent-812x375 | 保護者 | 812×375 | FAIL | PASS | 334／375px |

PROGRESS-20261107-DELIVERY-04：ボタンへスクロールして登録するとフォームが閉じ、ブラウザー内に予約が1件だけ追加され、日付・役割が指定どおりで残数が変わらないことを確認。再読込後の保存記録も照合し、ログアウト後の再読込ではログイン画面となった。外部更新・WebSocket・ページエラーはいずれも0件。画像はボタン到達時とログアウト後を別々に保管している。保存記録の照合は予約一覧の描画を検証したという意味ではない。

PROGRESS-20261107-DELIVERY-05：確認範囲はMicrosoft Edgeの小画面・タッチ模擬による公開フロントエンドのブラウザー内デモ。実Google本人認証、実台帳・Calendar連携、iPhone実機、小林さんによる顧客確認とは別である。現行の顧客確認は[CUST-01〜06の6件](../acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md)で、全件未実施・合格0/6。第三者による原30件全件の実施をリリース条件から外し、旧第三者0/30は履歴として保持する。原受入AT-01〜30は開発側の技術仕様として残し、AT-24〜30を全体合格に変更しない。本番は未開始。[11月7日の顧客確認方針](2026-11-07-customer-acceptance-policy.md)を参照。

PROGRESS-20261107-DELIVERY-06：ユーザー指示によりCalendar権限追加の保留を解除し、日次処理ID18と[日次完了条件](../acceptance/DAILY_TEST_SITE_DELIVERY_POLICY_20261106.md)を更新した。検証用の専用サブカレンダーに限定して、必要な認可・設定・レビュー済みGAS更新を進める。今回のHosting配備はGAS更新を含まない。その後のGAS編集HEADへの保存状態は下記09〜10に記録する。許可を受けたことと、実際のGoogle同意・Webアプリ配備・受入合格は別々に記録する。

## 証跡

PROGRESS-20261107-DELIVERY-07：検証時刻は16:01 JST。次の結果を再照合できる。

- [配備CLI結果](../../outputs/booking-modal-release-20261106/firebase-deploy-20261107.json)
- [候補の差分・ハッシュ確認](../../outputs/booking-modal-release-20261107-readiness.json)
- [公開7応答のハッシュ照合](../acceptance/deployment-verification/public-2026-11-07T07-01-18-387Z.json)
- [反映後4件の機械結果](../../outputs/booking-modal-hosted-after-20261107/results.json)
- [修正前4件の再現](../../outputs/booking-modal-hosted-before-final-20261106/results.json)
- [独立した反映後レビュー](../../outputs/booking-modal-release-20261107-after-review.json)
- [検証GAS編集HEAD・Script Propertiesの保存と再読込照合](../../outputs/calendar-readiness-20261107/live-preparation.json)
- [再読込後のGAS編集HEADマニフェスト画像](../../outputs/calendar-readiness-20261107/live-head-manifest.png)

PROGRESS-20261107-DELIVERY-08：当日反映・公開検証完了は1改善。公開URLは[管理者](https://eigo-taxi-test.web.app/#/admin)・[保護者](https://eigo-taxi-test.web.app/#/parent)。共有表の結果履歴と顧客確認6件を読み戻し、文書・12冊v31のPowerPointへ同じ条件を反映した。日次条件DAILY-C06の資料・共有表の整合確認を完了した。

## 検証GASの編集HEAD保存と未完了の作業

PROGRESS-20261107-DELIVERY-09：16:53 JST、会社の検証用プロジェクト「Mighty 送迎管理API｜受入検証用」の編集HEADに、レビュー済み `Code.gs` と `appsscript.json` を保存した。再読込後のエディターから取得した内容をLFに正規化してローカルのレビュー対象と照合し、コードSHA-256 `e39555d3540a22e1db6b20bf7885d6ee95a4e0ae11eace6e3fb29bccd3f6fef6`、マニフェストSHA-256 `86919604f8083bcfad5433147d46a41dba5653f190b29f6b560255628e2b9006` が一致した。Script Propertiesの `TEST_CALENDAR_ID` も会社所有の検証専用サブカレンダーと再読込照合し、既存4プロパティは保持した。[保存・照合記録](../../outputs/calendar-readiness-20261107/live-preparation.json)・[編集HEADのマニフェスト](../../outputs/calendar-readiness-20261107/live-head-manifest.png)。

PROGRESS-20261107-DELIVERY-10：この時点ではCalendarのOAuth実同意は未完了、新しいWebアプリ版は未配備、検証用カレンダーへの試験イベント作成は0件。編集HEADの保存で公開APIの配備版が更新されたとは扱わない。今後は配備者本人のGoogle同意、対象の検証Webアプリへの配備と版照合、合成データによるAT-24の実予約・AT-25の実取消を順に確認する。小林さんの顧客確認は0/6のまま、本番開始は保留する。

PROGRESS-20261107-DELIVERY-11：小林さん向け[共有表の顧客確認6件](https://docs.google.com/spreadsheets/d/1PqUq7BoBBVlPolivap0eg1UPik47vNNWphyBd0DNwvU/edit#gid=110706)を作成し、CUST-01〜06の操作・期待・判定・結果記入欄、概要の合格数0/6、旧第三者30件の履歴表示を確認した。[読み戻し記録](../../outputs/customer-confirmation-shared-readback-20261107.json)・[保存後の表示](../../outputs/customer-confirmation-sheet-20261107-final.png)。日次処理18も、新しい顧客6件と開発側の技術30件を区別するよう更新した。

PROGRESS-20261107-DELIVERY-12：図・画像入りの共通デザイン12冊v31・計160頁を再描画／再取込し、独立AIレビュー後に現行配布版へ採用した。旧136頁の本文・ノート・画像を保持し、旧条件は履歴とした。新規構造・配置指摘0、既存の業務フロー配置警告21件は未修正。PowerPointアプリ上の表示は未確認。[配布一覧](../deliverables/2026-10-23-traceability/README.md)・[独立レビュー](../traceability/reports/ppt-delivery-20261107/independent-review.json)・[採用記録](../traceability/reports/ppt-delivery-20261107/root-adoption.json)。文書の厳密機械検査はエラー0・対応不足0、自動検査31/31成功。これらの検査で実業務や顧客確認を合格に変更しない。

PROGRESS-20261107-DELIVERY-13：編集HEADで台帳を変更しない `doGet` を選んで実行し、16:59:41 JSTの実行開始・完了を確認した。[実行ログ画像](../../outputs/calendar-readiness-20261107/live-head-health.png)。この処理はCalendarを読み書きしないため、Calendarの実認可完了はこの結果から判定しない。上記12の資料検査と本項の準備結果を共有表の履歴VR-20261107-04〜05へ追記し、独立した読み戻しで一致を確認した。[共有表の読み戻し](../../outputs/customer-final-history-readback-20261107.json)。
