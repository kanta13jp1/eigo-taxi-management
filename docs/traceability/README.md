# 文書管理・機械検査の入口

現行正本は [registry.json](registry.json)。全工程の本文と対応表を同じ登録情報から生成します。

- [工程別トレーサビリティーマトリックス](../acceptance/07_TRACEABILITY_MATRIX.md)
- [CSV対応表](matrix.csv)
- [共通デザインPowerPoint一覧](../deliverables/2026-10-23-traceability/README.md)
- [ID管理方針](ID_POLICY.md)
- [文書・項目ID台帳](documents.json)
- [機械検査結果](reports/latest.json)
- [Gmail以外のメールを使ったGoogleログイン：運用補足](../acceptance/GOOGLE_ACCOUNT_EXISTING_EMAIL_20261030.md)
- [小林さん用の顧客確認6件・記入欄](../acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md)
- [11月7日の顧客確認方針](../progress/2026-11-07-customer-acceptance-policy.md)
- [11月7日の利用登録・実Calendar・予約取消の準備記録](../progress/2026-11-07-customer-readiness.md)
- [小林さんへの随時実施の操作依頼文](../progress/2026-11-07-kobayashi-customer-request.md)
- [固定2URL・固定2予約と中断再開の設計](../acceptance/SELF_PACED_CUSTOMER_REVIEW_20261107.md)
- [旧第三者受入の事前準備（11月3日時点）](../acceptance/THIRD_PARTY_EXECUTION_PREP_20261103.md)
- [旧第三者向け30件手順案（11月3日時点）](../acceptance/THIRD_PARTY_STEPS_DRAFT_20261103.md)
- [旧第三者向け隔離GAS模擬試験案（11月3日時点）](../acceptance/THIRD_PARTY_OFFLINE_REHEARSAL_20261103.md)
- [2026-11-03 検証・準備の記録](../progress/2026-11-03-acceptance-preparation.md)
- [2026-11-05 台帳・バックアップの限定照合](../progress/2026-11-05-at28-comparison.md)
- [現行画面のローカル模擬リハーサル](../acceptance/LOCAL_UI_REHEARSAL_20261106.md)
- [予約画面の縦スクロール修正と回帰試験](../progress/2026-11-06-booking-modal-scroll.md)
- [架空シートでの設定復元：範囲貼付とシート複写の違い](../progress/2026-11-06-at28-native-settings.md)
- [2026-11-06 開発加速の実施結果](../progress/2026-11-06-development-acceleration.md)
- [検証サイト反映・検証を終えてから日次報告する条件](../acceptance/DAILY_TEST_SITE_DELIVERY_POLICY_20261106.md)
- [11月7日の公開反映・検証GAS編集HEADの保存状態](../progress/2026-11-07-test-site-delivery.md)

## 11月7日の現行判定

現行正本は `2026-11-07-r17`。要件39件、登録テスト203件（GAS85・フロント契約31・実AppローカルUI8・随時実施設計20・検査器34・既存再利用25）。日次の公開反映・確認、ソースレビュー、開発側の原AT-01〜30、顧客CUST-01〜06、本番開始を個別に判定する。自動試験・開発担当の実操作を、小林さん本人の実Google確認の合格へ転記しない。顧客確認は全件未実施・0/6、第三者による原30件全実施の条件は廃止済みで、旧0/30は履歴である。

検証GAS v6とHosting `43d4ac9b2a065441` を配備し、公開7応答を照合した。検証台帳の完全一致設定と小林さんのreviewer登録を読戻し確認し、対象は架空生徒1名だけ、元の管理者2名と家庭URLは維持した。同じGoogleアカウントで固定2URLを使い、実施中の開発担当による役割変更・日程調整は不要。2026-11-07 16:00のA片道・B往復を未完了で準備し、台帳・専用Calendar・再読込後の2予定と残数5枚、A03の完了ボタンを確認した。この2登録は各1回で通常応答を得たが、以前のv5の汎用通信エラーの原因解明・修正完了やAT-24全体合格を意味しない。本人の初回Googleログイン・Calendar閲覧と顧客6件は未実施、本番開始はHOLD。[準備の現状と証跡](../progress/2026-11-07-customer-readiness.md#CUSTREADY-CURRENT)を参照。

ソースの対象ハッシュと合格範囲は[backend独立レビュー](reports/async-review-20261107/backend-review.json)・[frontend独立レビュー](reports/async-review-20261107/frontend-review.json)・[検査器レビュー](reports/async-review-20261107/checker-review.json)に記録した。登録テスト件数は当日の実Google操作件数ではない。ローカル合成経路、過去の再利用証跡、実際の開発担当による準備、顧客本人の結果を区別する。

### r16時点の記録（履歴）

当時の正本は `2026-11-07-r16`。検証GAS v5の架空予約1件について、台帳・専用Calendar・予約ID・日時・場所を照合し、取消後の台帳取消・予定消失・サイト残数5枚を確認した。登録直後の汎用通信エラーは原因確認中、利用登録は保護者、初回本人ログイン・実施日・当日完了用予約2件の準備が待機中だった。その後、上記r17の随時実施方式と準備結果へ更新した。元の観測は[進捗記録のv5履歴](../progress/2026-11-07-customer-readiness.md)へ保持する。

## 更新手順

1. 要望の根拠を確認し、registry.jsonの対応項目と期待結果・状態を更新する。
2. `npm run docs:generate` で工程文書と対応表を再生成する。
3. コード・テストを更新し、実装担当とは独立したAIが対象差分をレビューする。レビュー結果、未解決の指摘、対象ソースのハッシュ、関連する自動テストの結果と範囲を記録する。対象範囲の未解決の合格阻害指摘がなく、必要な自動テストが合格し、レビュー・テストの対象ハッシュが現在のソースに一致してから `python scripts/traceability.py baseline` で記録する。ハッシュ更新後も対象と検査結果を照合する。検査を通すためだけの基準更新は禁止。詳細は[AIソースレビュー方針](AI_SOURCE_REVIEW_POLICY.md)を参照。
4. `npm run test:traceability`、`npm run docs:index`、`npm run docs:check` を実行する。
5. `npm run docs:check:strict` は未対応テストがある間は失敗する。r2では不足0項目。追加16テストのPASS証跡・参照元ハッシュも照合する。
6. PowerPointを再生成・描画・最終検査してから presentations.json の配布対象を更新する。Markdownのみ更新した状態では古いPowerPointを最新版扱いしない。

PRでは `.github/workflows/document-integrity.yml` が検査します。CI実行成功と本番受入合格は別です。

## 検査の限界と現在の状態

存在しない参照、ID重複、工程未対応、本文生成差分、参照コード変更、未根拠の合格、固定した合意値との矛盾を検出します。ソースのレビューにはユーザー指定により独立AIレビューと自動テストを採用します。業務上の使い勝手は小林さんの顧客確認6件で記録します。現時点は未実施0/6です。原AT-01〜30の技術検証は開発担当が引き受け、過去の開発結果・未確認範囲と当時の第三者0/30の記録を保持します。検証専用Calendarの権限追加は許可済みで、実際のGoogle同意・同期結果は別途記録します。本番開始は引き続き保留中です。

顧客PASSには、実在するJSON証跡の `mode: real-customer-check`、一意のCUST-ID、本人・対象版・タイムゾーン付き実施日時・実測値の一致、実Google本人確認済みの明示が必要。欠落・不一致・demo/offline証跡を拒否する。[現行検査器34件の結果](../../outputs/async-review-20261107/independent-docs/checker-tests.json)・[現行レビュー](reports/async-review-20261107/checker-review.json)を参照。過去の[32件の結果](reports/customer-ready-20261107/independent/checker-tests.json)・[証跡検査の補強レビュー](reports/customer-ready-20261107/independent-review.json)は履歴として保持する。この機械検査は記録の整合を検査するもので、実施内容そのものの真実性は人による実測記録・意味のレビューで確認する。

2026-10-30にユーザーがソースレビューの完了条件としてAIレビューと自動テストを採用しました。その後、対象8ファイルを独立AIがレビューし、自動テストとハッシュを照合して基準を更新、当時のstrict検査は合格しました。第三者による原30件の全実施を求めた当時の方針は、11月7日に顧客確認6件へ改定しました。[AIレビュー記録](reports/signout-retry-20261030-local/ai-source-review-20261030.json)・[認証調査記録](../acceptance/device-readonly-2026-10-24/AUTH_INITIAL_STATE_INVESTIGATION_20261028.md)

履歴資料は証跡として保持し、現行の仕様判断に使用しません。現在配布するPowerPointは上記一覧の12点です。旧版は共通デザイン適用対象の現行版から除外しています。

## r2の再検証

以下のr2〜r13は各版当時の観測記録である。節内の「最新」や第三者受入・Calendarの記述を、上記11月7日の現行条件へ読み替えない。

[セルフレビューと実行結果](SELF_REVIEW_R2.md) を参照。GAS70、フロント契約21、SDK6、ブラウザ6、配布契約1、機械検査器14を実行。ブラウザテストは `node scripts/test_trace_ui.mjs`（Playwrightを `EIGO_PLAYWRIGHT_MODULE`、必要なら既存Chromium実行ファイルを `EIGO_CHROMIUM_EXECUTABLE` で指定）。外部へのリクエストを遮断し、ローカルViteと架空データだけで実施する。GAS・フロント・SDK・配布契約は各 scripts/test_*.cjs を使用し、証跡出力先は EIGO_TEST_OUTPUT_DIR で指定。

## 最新の公開サイト確認（r3）

[復元後の再ログイン・権限不要の受入確認](../acceptance/restored-admins-2026-10-23/README.md)。公開7ファイル一致と未認証入口の部分確認を実施。r3時点では管理者1の手動Google選択待ち、管理者2は未実施。現在は下記r4を参照。台帳・権限への書込なし、Calendar権限未追加、本番未開始。実受入の合格数は変更しない。

## 復元後の管理者再確認（r4）

管理者1の新規ログイン・表示・再読込・ログアウト後の再読込を確認。管理一覧も有効な管理者2名、一時家庭なし。管理者2人目の本人選択待ち。詳細は [最新確認記録](../acceptance/restored-admins-2026-10-23/README.md)。AT-26全体の合格ではなく認証の部分確認。

## 復元後の管理者2名確認完了（r5）

両管理者それぞれの本人ログイン・表示・明示的再読込・ログアウト後の再読込を実確認。両管理画面から有効な本人確認済み管理者2名、一時家庭なしを照合。OPEN-04は解消。過去r3/r4の待ち記録と区別する。[最新結果](../acceptance/restored-admins-2026-10-23/README.md)。実受入AT-24〜30の全体合格には変更なし。

[r5セルフレビュー](SELF_REVIEW_R5.md) は当時の観測を保持する履歴。

## 同時完了の実Google部分確認（r6）

2管理者から同じ片道送迎の完了クリックを同時発行し、3枚→2枚、両画面の再読込保持、ID照合した試験行の除去と主要3シートの実行前範囲一致を確認。明示的な後続再試行は未実施で、AT-27全体は未合格。[確認記録](../acceptance/concurrent-completion-plan-2026-10-23/README.md) ／ [最新セルフレビュー](SELF_REVIEW_R6.md)。PowerPoint12点は同じデザインのr6（124スライド）。

## 後続再試行の確認（r7・最新）

AT27-LIVE-02で完了確定後の明示再試行も追加0枚・残数2枚・完了日時不変。AT-27の開発側期待動作を確認済みとし、第三者受入0/30とは区別する。上記r6の未実施記述は当時の履歴。[最新セルフレビュー](SELF_REVIEW_R7.md) ／ [結果記録](../acceptance/concurrent-completion-plan-2026-10-23/README.md)。

## 台帳バックアップ・復元の部分確認（r8・最新）

専用生徒・送迎・購入の3行をコピーへ保存し、試験値変更後にコピーから復元して値一致を確認。Web再取得は本人選択待ち、試験行は復元値で残置。Calendar整合とAT-28全体は未合格。[確認記録](../acceptance/backup-restore-2026-10-23/README.md) ／ [最新セルフレビュー](SELF_REVIEW_R8.md)。

## 台帳部分の復元・後片付け完了（r9・最新）

会社Googleログイン後の再取得で復元生徒残数3枚・送迎16:30を確認。購入3枚は台帳で照合。専用3行をIDガードで除去し、主要3シートの先頭8行が実行前SHA-256と一致。サイトも生徒3名・履歴3件へ復帰。r8の待ち・残置は解消済みの履歴。[確認記録](../acceptance/backup-restore-2026-10-23/README.md) ／ [最新セルフレビュー](SELF_REVIEW_R9.md)。Calendar整合・全体合格・第三者受入は未確認。

## iPhone画像による部分確認（r10・最新）

2026-10-24、利用者提示の実機画像5点で管理者2の画面、生徒3名・履歴3件・残数7と1・最後のログイン画面を確認。OS版・ブラウザー名・ログアウト後再読込・右端列到達は未確認。Android・保護者本人・予約取消も未実施。[確認記録](../acceptance/device-readonly-2026-10-24/README.md) ／ [最新セルフレビュー](SELF_REVIEW_R10.md)。AT-29全体と第三者受入は未合格。

## iPhone端末情報の確認（r11・最新）

Safari使用とログアウト後状態を本人回答で確認。端末情報画像はiPhone 16 Pro Max・iOS26.6.2。再読込後の非表示・一覧右端列到達は引き続き未確認。[最新記録](../acceptance/device-readonly-2026-10-24/README.md) ／ [セルフレビュー](SELF_REVIEW_R11.md)。r10のOS・ブラウザー未回答は当時の履歴。

## 一覧右端の実機表示（r12・最新）

追加画像で横スクロール右端の予約者・状態・操作列を確認。実行は未実施。ログアウト後再読込の非表示は明示結果待ち。[確認記録](../acceptance/device-readonly-2026-10-24/README.md) ／ [最新セルフレビュー](SELF_REVIEW_R12.md)。過去の右端未確認は解消し、AT-29全体は未合格を保持。

## iPhone管理者読取確認完了（r13・最新）

ユーザーがログアウト後再読込でもログイン画面のみ・台帳非表示と明示回答。今回依頼したiPhone Safariの管理者読取範囲を確認済み。Android・保護者本人・予約取消を含むAT-29全体は未合格。[結果記録](../acceptance/device-readonly-2026-10-24/README.md) ／ [セルフレビュー](SELF_REVIEW_R13.md)。r12までの回答待ちは解消済みの履歴。
