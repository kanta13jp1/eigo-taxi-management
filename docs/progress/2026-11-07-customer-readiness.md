# 11月7日　小林さんの送迎確認に向けた準備状況

現行はr17の随時実施方式。検証GAS v6、新しい検証Hosting、指定した架空生徒だけを扱う利用登録、固定2予約と開始残数5枚の準備を完了した。日程調整や実施中の役割切替は不要。確認依頼は2026-11-07にユーザーがGoogle Chatで送付済み。小林さん本人の初回Googleログインと顧客6件は未実施・0/6、本番開始はHOLD。[現行の準備結果](#CUSTREADY-CURRENT)・[送付用の確認依頼](2026-11-07-kobayashi-customer-request.md)。

## 検証環境と登録（v5時点の履歴）

PROGRESS-20261107-CUSTREADY-01　17:11:51 JST、会社の検証GASから、配備担当が所有する非公開の検証専用サブカレンダーを読み取った。設定先の一致、非プライマリ、タイムゾーン `Asia/Tokyo`、Calendar権限が利用可能であることを確認した。読取確認で作成した予定と更新した台帳はともに0件。[読取結果](../../outputs/customer-ready-20261107/calendar-read-result.json)・[実行ログ](../../outputs/customer-ready-20261107/calendar-read-pass.png)

PROGRESS-20261107-CUSTREADY-02　17:15 JST、既存の検証Webアプリをv4からv5へ更新した。URL、実行者、アクセス設定を維持し、一時的な読取確認用関数を取り除いた状態でレビュー済みのコードとマニフェストを照合した。[検証版の配備記録](../../outputs/customer-ready-20261107/gas-deployment-v5.json)

PROGRESS-20261107-CUSTREADY-03　検証台帳に顧客確認用の架空生徒1名を用意し、開始残数5枚を読み戻した。既存の生徒3行は準備前後で一致した。小林さんの会社Googleアカウントを有効な保護者として登録し、対象をこの架空生徒1名に限定して家庭用の個別URLを発行した。初回の本人ログインは待機中。既存の管理者2名は登録を維持した。[準備前の台帳](../../outputs/customer-ready-20261107/students-before.tsv)・[準備後の台帳](../../outputs/customer-ready-20261107/students-after.tsv)・[利用登録の記録](../../outputs/customer-ready-20261107/account-registration.json)

## 開発担当が検証版v5で行った予約・取消

PROGRESS-20261107-CUSTREADY-04　開発担当が11月7日16:00の架空の予約を1回送信すると、画面に通信エラーが表示された。再送せず確認したところ、送迎台帳には `scheduled` の新規行が1件あり、イベントIDも保存されていた。検証カレンダーの予定説明にある予約IDが台帳の予約IDと一致し、日時と乗車場所も一致した。検証サイトを再読込すると予約が表示され、残数は5枚。登録時のブラウザー応答を取得できておらず、画面に通信エラーが出た原因は未確定。[送信後の台帳](../../outputs/customer-ready-20261107/rides-after-first-attempt.tsv)・[カレンダーの予定](../../outputs/customer-ready-20261107/calendar-smoke-created.png)・[開発担当の検証結果](../../outputs/customer-ready-20261107/booking-smoke-result.json)

PROGRESS-20261107-CUSTREADY-05　同じ予約の取消では、確認ダイアログの「OK」を待っている間、台帳は `scheduled` のままだった。利用者が「OK」で確定した後、開発担当が同一予約IDの台帳行を読み戻し、`cancelled` を確認した。専用カレンダーを表示した状態で11月7日の該当予定が消え、検証サイトを再読込すると同じ予約が「キャンセル」、架空生徒の残数が5枚と表示された。取消は再送していない。[確定前の台帳](../../outputs/customer-ready-20261107/rides-after-cancel-attempt.tsv)・[確定後の台帳](../../outputs/customer-ready-20261107/rides-cancelled-final.tsv)・[取消後のカレンダー](../../outputs/customer-ready-20261107/calendar-after-cancel.png)・[再読込後の画面](../../outputs/customer-ready-20261107/site-cancelled-balance5.png)

## 当初の準備方式と確認記録

PROGRESS-20261107-CUSTREADY-06　当初は実施日が未定で完了用2予約を作成せず、日程を相談し、別の管理者が同じ登録を保護者→管理者→保護者→管理者→保護者へ切り替える案だった。この案は後述の随時実施方式へ変更した。小林さんへの検証専用カレンダーの閲覧共有は、ユーザーから「共有して通知を送る」との回答を受け、予定の詳細を閲覧できる権限で共有通知を送信した。小林さん側でカレンダーを開けることは初回確認待ち。[共有後の閲覧権限](../../outputs/customer-ready-20261107/calendar-shared-reader.png)

PROGRESS-20261107-CUSTREADY-07　権限の実読取を記録する検査器と上記の役割別手順は、独立レビューと自動検査32/32件を通過した。`TRACE-32` を登録し、対象の検査器・テストの2ファイルだけをレビュー済み基準へ採用した。小林さん本人による顧客6件は全件未実施で0/6件、原AT-01〜30の技術確認は開発担当が引き続き扱う。旧第三者0/30件は履歴で、リリース条件は11月7日付の顧客確認方針に従う。本番開始はHOLD。[独立レビュー](../traceability/reports/customer-ready-20261107/independent-review.json)・[32件の検査結果](../traceability/reports/customer-ready-20261107/independent/checker-tests.json)・[顧客確認方針](2026-11-07-customer-acceptance-policy.md)

## 随時実施への変更

PROGRESS-20261107-CUSTREADY-08　ユーザーから、小林さんの予定に合わせた作業がこちらに発生しない手順を求められた。REQ-39として、指定検証台帳でのみ有効な検証担当reviewer、固定2URL、固定日の2予約をA03「送迎スケジュール一覧」で扱う手順と、状態を照合して未実施だけ再開する方式を追加した。通常の管理者・保護者の権限分離を維持する。日程相談・実施中の役割切替・当日用の予約作成は準備完了後の手順から除外する。[設計と中断再開表](../acceptance/SELF_PACED_CUSTOMER_REVIEW_20261107.md)

<a id="CUSTREADY-CURRENT"></a>
## 随時実施版の準備完了（r17）

PROGRESS-20261107-CUSTREADY-09　18:06 JST、同じ検証Webアプリの配備をv6へ更新した。レビュー済みGASのSHA-256は `3a2bce6188a99daf331cad60a01759d6414c99f07e9d8f47a43ad28102ec336c`。既存URL、実行者、公開対象を維持し、今回の更新でGoogle権限は追加していない。検証Hostingは `43d4ac9b2a065441` へ更新し、公開7応答が期待ハッシュと一致した。配備対象と証跡は同じ版のアーカイブへ保存した。[GAS v6](../../outputs/async-review-20261107/live/gas-deployment-v6.json)・[公開反映の結果](../../outputs/async-review-20261107/live/hosted-delivery.json)・[配備版のマニフェスト](../acceptance/deployment/releases/43d4ac9b2a065441/build-manifest.json)。

PROGRESS-20261107-CUSTREADY-10　`ACCEPTANCE_REVIEW_SPREADSHEET_ID` が結合先の検証台帳IDと完全一致することを保存後に読み戻した。既存5プロパティの値は保持した。小林さんの登録を有効なreviewerへ変更し、対象は「顧客確認_架空生徒」1名だけ。元の管理者2名と家庭用の個別URLは維持している。同じ会社Googleアカウントで固定の家庭用・管理者用URLを使う方式で、通常の実施中に開発担当が役割を切り替える操作は不要。本人の初回Googleログインは未確認。[検証台帳設定](../../outputs/async-review-20261107/live/review-gate.json)・[利用登録の読戻し](../../outputs/async-review-20261107/live/reviewer-registration.json)。

PROGRESS-20261107-CUSTREADY-11　開始残数5枚の同じ架空生徒に、次の完了確認用2予約を作成した。両方とも未完了の `scheduled`、完了日時は空欄で、準備中にチケットは消費していない。台帳のイベントIDと、専用Calendarの予定説明にある予約ID・日時・場所を個別に照合した。サイトを明示的に再読込し、残数5枚と2件の予定、A03「送迎スケジュール一覧」の各「完了」ボタンを確認した。[固定2予約の実測](../../outputs/async-review-20261107/live/fixed-fixtures.json)・[台帳](../../outputs/async-review-20261107/live/fixed-fixtures-ledger.tsv)・[A03の表示](../../outputs/async-review-20261107/live/admin-fixed-schedule.png)。

| 順番 | 固定日時（JST） | 区分 | 乗車場所の表示 | 完了後の期待残数 |
| --- | --- | --- | --- | --- |
| A | 2026-11-07 16:00 | お迎え・片道 | CUST-04 完了用A・片道／実在しない場所 | 5→4枚 |
| B | 2026-11-07 16:00 | 往復 | CUST-04 完了用B・往復／実在しない場所 | 4→2枚 |

PROGRESS-20261107-CUSTREADY-12　A・Bはそれぞれ1回の登録操作で通常の応答を確認し、この2操作で観測したブラウザーconsoleのerror・warningは0件だった。これは後続の2登録で得た観測であり、v5の最初の登録時に汎用通信エラーが出た原因を特定・修正した証拠ではない。旧記録04〜05を保持し、AT-24・25全体や顧客確認の合格へ読み替えない。固定日を過ぎた予約の操作はローカルの実App合成試験で確認した。今回の実環境表示確認は固定日当日のため、翌日以降の実環境操作は未実測。[今回の実測範囲](../../outputs/async-review-20261107/live/fixed-fixtures.json)・[ローカルUI独立レビュー](../traceability/reports/async-review-20261107/frontend-review.json)。

PROGRESS-20261107-CUSTREADY-13　準備結果を固定URLで随時実施する[6件の依頼文](2026-11-07-kobayashi-customer-request.md)へ反映した。中断後は台帳と共有表を照合し、5→4→2→12枚の未実施の続きだけを進める。小林さん本人の初回ログイン、Calendar共有通知の受領・閲覧、CUST-01〜06は未確認・0/6のまま。依頼文は送付用として用意した段階で、直接送信していない。本番開始はHOLD。実装レビューと本人確認を区別し、異常時は再送せず照合する。

PROGRESS-20261107-CUSTREADY-14　共有表の概要・残タスク・顧客確認6件も随時実施方式へ同期した。「顧客確認6件」下部に固定2URL、検証Calendar、11月7日16:00のA・B、画面切替、中断再開、異常時と結果記入のガイドを追記し、17ブロックの全値を読み戻して一致を確認した。F6:H11の6件は「未実施」と日時・実測値の空欄、判定ドロップダウン、合格数を数えるCOUNTIF式と0/6を保持した。本人への作業依頼を直接送信した記録ではない。[共有表の読戻し](../../outputs/async-review-20261107/live/shared-sheet-readback.json)・[随時実施ガイドの表示](../../outputs/async-review-20261107/live/shared-self-paced-guide.png)。

PROGRESS-20261107-CUSTREADY-15　ユーザーが提示したGoogle Chatの送信済み本文・画像で、小林さんへの随時実施依頼が送付済みとなった。準備段階13〜14の「直接送信していない」は当時の記録として保持し、Codexによる送信ではなくユーザー自身による送付と区別する。受信者の既読や6件の実施結果を示す回答は未提示。共有表の6件も全件「未実施」で日時・実測値は空欄だった。依頼送付だけでは合格にせず0/6、本番HOLDを維持する。日程回答や実施中の役割切替は求めず、本人の都合のよい時の実施結果を待つ。教師のGoogleアカウント利用はチャット上の報告であり、教師本人の実ログインや教室運用用アカウントの準備完了とは扱わない。[送信確認記録](../../outputs/async-review-20261107/request-sent-receipt.json)。

PROGRESS-20261107-CUSTREADY-16　後続の明示依頼により、先生用の独立した検証専用登録と架空生徒1名を追加した。小林さんの利用登録・個別URL・対象生徒・残数5枚・予定中の固定2予約は変更前後の公開管理画面で維持を確認した。先生用は開始5枚・予約0件で別の家庭用URLを発行し、同じ本人Googleメールで両入口を使う設定を保存・再取得・再読込した。先生の初回ログインと本人操作は未実施で、先生の試用を小林さんのCUST-01〜06の結果へ加算しない。顧客0/6・本番HOLD、コード・GAS・Hostingの変更なし。[先生用の登録と維持確認](2026-11-07-teacher-reviewer-registration.md)・[先生への案内文](2026-11-07-brenda-invitation.md)・[図入り補足ガイド](../deliverables/2026-11-07-teacher-review/README.md)。
