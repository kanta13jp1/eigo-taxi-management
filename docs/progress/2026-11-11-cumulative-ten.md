# 11月10～11日　累計10件の実装修正と開発側受入試験10項目

11月10日に4件、11日に6件を修正し、開発側で各日4項目・6項目を実施した。先行2件の担当は依頼者申告による。

| 件 | 修正 | 担当 |
|---|---|---|
| 1 | 予約時・完了時のチケット消費案内 | Claude Code Fable 5.2 |
| 2 | ログイン入口を間違えた場合の案内 | Claude Code Fable 5.2 |
| 3 | 匿名デモの保存先を明示 | Codex |
| 4 | 残少警告を2枚以下に統一 | Codex |
| 5 | 日付変更・タブ復帰時の当日一覧更新 | Codex |
| 6 | チケット追加の金額を1円単位で指定可能に修正 | Codex |
| 7 | 初期枚数の小数を切り捨てて登録する不具合を修正 | Codex |
| 8 | 入力途中の金額を0円で保存する不具合を修正 | Codex |
| 9 | 帰りの送り予約で時刻欄が「お迎え時間」と表示される不具合を修正 | Codex |
| 10 | 先生の代理予約で5つの項目名を入力欄に関連付け | Codex |

開発側で実施した10項目はAT-24、25、28、04、12、05、02、17、07、09。AT-24・25ではGoogle管理者で検証用の予約を登録・取消した。AT-28はバックアップ復旧の部分確認で保護設定の復旧は残る。[前回までの項目別記録](2026-11-11-cumulative-nine.md)。

## AT-09　先生が生徒を選んで代理予約する

旧版のフォームでは生徒・送迎日・時刻・送迎場所・メモの5欄すべてが項目名に結び付いていなかった。5組のHTMLラベルと入力欄を関連付けた。修正後の実フォームを用いた模擬試験では、別の生徒STU-002を選び、11月12日16:45、場所「AT09 西門」を指定。デモサービスで予約3件から4件への増加、指定した日時・生徒・場所、予約者teacher、全生徒の残高不変を確認した。[旧版の結果](../../outputs/teacher-booking-20261111/before.json)・[修正後の結果](../../outputs/teacher-booking-20261111/at09.json)・[試験コード](../../outputs/teacher-booking-20261111/at09.cjs)。

前回配信版0024a904b2943843のアーカイブからビルドした。差分はAddRideModal.tsxの5組のみ。独立レビュー、型検査、対象lint、Firebase向けビルド後、検証Hosting eigo-taxi-test に配備した。版5204dfe9fc36b599、ソースDigest f424367214b4f26a17a5600deb25ef374f87f6ddeb58cb000e2e175d5e376b64。18:14 JSTの公開7応答がHTTP 200かつビルド時のSHA-256と一致。[独立レビュー](../../outputs/teacher-booking-20261111/independent-code-review.json)・[配備](../acceptance/deployment/releases/5204dfe9fc36b599/firebase-deploy.json)・[公開応答](../acceptance/deployment/releases/5204dfe9fc36b599/public-verification.json)。

公開管理者デモではアクセシビリティツリー上で5欄の名前を確認し、住所ラベルのクリックで住所欄へフォーカスが移った。架空生徒の山本さんを選んで1件登録し、再読込後に一覧7→8件、場所「AT09 西門」、予約者「先生登録」を確認した。公開ブラウザーでは日時の自動入力後も既定の11月11日16:00が表示され、その日時で保存された。11月12日16:45の指定保存はローカル試験の結果。[公開フォーム](../../outputs/teacher-booking-20261111/public-form.png)・[再読込後](../../outputs/teacher-booking-20261111/public-result.png)・[操作記録](../../outputs/teacher-booking-20261111/public-ui.json)。

顧客用Google台帳・Calendar・GASへの書き込みはない。共有表「検証結果履歴」78行の9セルを読み戻し、追加内容との一致、顧客確認6件の記録・集計式の不変を確認した。[共有表の照合](../../outputs/teacher-booking-20261111/shared-readback.json)。

小林さん本人の確認は0/6件。本番運用は保留。本人の確認後に先生方と合同テストを行い、その結果に基づいて教室側Google環境の準備と移行を判断する。工程全体の直近採用記録は正本r19・配布資料v36（12冊・214頁）。第7～10件配信後の全工程横断検査は未実施。[会議決定](2026-11-11-meeting-decisions.md)・[正本採用記録](2026-11-11-r19-adoption.md)。

[小林さんへの報告文（未送信）](../../outputs/teacher-booking-20261111/小林さんへの報告.txt)・[打ち合わせ用PowerPoint追補](../deliverables/2026-11-10-premeeting/progress-2026-11-11-cumulative-ten.pptx)。

[PowerPoint追補2ページの独立目視レビュー](../../outputs/teacher-booking-20261111/ppt/independent-review.json)。
