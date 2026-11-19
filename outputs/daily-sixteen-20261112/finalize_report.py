from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[2]
out=root/'outputs/daily-sixteen-20261112'
data=json.loads((out/'delivery-data.json').read_text(encoding='utf-8'))
prior=(root/'outputs/daily-fifteen-20261112/小林さんへの報告.txt').read_text(encoding='utf-8-sig')
rows=re.findall(r'^\d+\. .+$',prior,re.M)
assert len(rows)==30,len(rows)
fixes=rows[:15]+['16. 完了処理中の同じ予約を連打できないよう、即時に操作をロックし、当日一覧・全予約一覧の両方に「完了処理中」と無効状態を表示するよう修正しました。失敗後は再試行でき、別の予約は操作できます。']
tests=rows[15:]+['16. AT-15 完了の二重処理防止：処理を遅延させた実Appの模擬試験で、同じ予約を連打しても要求は1回、両一覧で無効化、失敗後に解除・再試行、別予約は操作可能と確認しました。既存の匿名デモサービスに同じIDで2回完了を要求すると、初回1枚・再実行0枚の消費で残数6回、完了日時も不変でした。'+data['testPublic']]
intro='小林さん、お疲れ様です。\n\n11月12日はここまで修正4件・開発側受入試験4項目を実施しました。11月10日の各4件、11日の各8件と合わせ、累計16件の修正・16項目の試験実施となりました。先行2件はClaude Code Fable 5.2、追加14件はCodexの対応です。\n\n今回は、送迎完了処理の応答を待つ間に同じ予約の完了要求を繰り返せる点を修正しました。'+data['publicSummary']+'\n\n【実装修正16件】\n'
tail='\n\n検証サイト：https://eigo-taxi-test.web.app/\n反映版：'+data['release']+'\n公開ファイル7件の内容一致を確認し、文書・共有表・図入りPowerPointへ反映しました。\n\n今回の確認には匿名デモで新規に作成した架空生徒・予約だけを使いました。顧客用の検証台帳・カレンダーは維持し、本番運用は開始していません。\n\n開発側はバックアップの保護設定・参照式を復旧する手順と、公開画面での取消確定の再確認を進めます。小林さん本人の確認は記録上0/6件です。6手順の確認後に先生との合同テストを行い、その結果をもとに教室側Google環境の準備と移行を判断します。\n'
report=intro+'\n'.join(fixes)+'\n\n【実施した受入試験16項目と範囲】\n'+'\n'.join(tests)+tail
(out/'小林さんへの報告.txt').write_text(report,encoding='utf-8')
details='''

## 第16件の証跡と配信

前版6755531e1441c5d6のアーカイブを基準にTeacherDashboard.tsxだけを変更。予約IDごとの即時ロックをrefで保持し、描画用Setで両一覧の無効状態・処理中表示を共有する。finallyで対象IDだけ解除し、失敗時の既存の画面内エラーと再試行を維持する。API・認証・消費計算・サーバー再処理防止コードは変更していない。コンポーネント内の操作抑止であり、別ブラウザーや他端末間の排他制御を新たに実装したものではない。

[差分](../../outputs/daily-sixteen-20261112/pending-completion.patch)・[独立コードレビュー](../../outputs/daily-sixteen-20261112/independent-code-review.json)・[旧版試験](../../outputs/daily-sixteen-20261112/before.json)・[修正後試験](../../outputs/daily-sixteen-20261112/at15.json)・[試験コード](../../outputs/daily-sixteen-20261112/at15.cjs)。型検査・対象lint・ビルドを実施した。

初回配備はFirebase認証期限切れで失敗した。ユーザーによる会社アカウントの再認証後、凍結したレビュー済みstageで検証Hosting eigo-taxi-testだけへ再配備。版RELEASE、ソースDigest DIGEST。公開7応答がHTTP 200かつSHA-256一致。[配備記録](../acceptance/deployment/releases/RELEASE/firebase-deploy.json)・[公開照合](../acceptance/deployment/releases/RELEASE/public-verification.json)。認証失敗を配備成功に数えていない。

[公開画面](../../outputs/daily-sixteen-20261112/IMAGE)・[公開操作記録](../../outputs/daily-sixteen-20261112/public-ui.json)。新規の匿名デモ専用架空生徒・予約だけを操作。公開で観測できた範囲を報告文に記載した。実Google・他端末間の同時実行受入や顧客本人確認を代替しない。

共有表の検証結果履歴84行と進捗概要A3を更新。記入内容、顧客確認欄と集計式の保持を読み戻し確認した。[共有表照合](../../outputs/daily-sixteen-20261112/shared-readback.json)。

[進捗追補PowerPoint（9ページ）](../deliverables/2026-11-10-premeeting/progress-2026-11-12-cumulative-sixteen.pptx)・[ファイル・配置・再取込検査](../../outputs/daily-sixteen-20261112/ppt/validation.json)・[独立目視レビュー](../../outputs/daily-sixteen-20261112/ppt/independent-review.json)・[報告文（未送信）](../../outputs/daily-sixteen-20261112/小林さんへの報告.txt)。PowerPointアプリでの表示は未確認。

工程正本r19・配布資料v36（12冊・214頁）は変更していない。第7～16件配信後の全工程横断検査は未実施。今回の追補は正本12冊の一括改版ではない。[先行15件](2026-11-12-cumulative-fifteen.md)・[会議方針](2026-11-11-meeting-decisions.md)。
'''.replace('RELEASE',data['release']).replace('DIGEST',data['sourceDigest']).replace('IMAGE',data['image'])
(root/'docs/progress/2026-11-12-cumulative-sixteen.md').write_text('# 11月10～12日 累計16件の実装修正と開発側受入試験16項目\n\n'+report+details,encoding='utf-8')
p=root/'docs/remaining-work-tracker.md';t=p.read_text(encoding='utf-8-sig')
t=re.sub(r'^11月12日の検証サイトは版.*$', '11月12日の検証サイトは版'+data['release']+'。本日累計4修正・開発側4項目、全体累計16修正・16項目実施。第16件は同じ予約の処理中連打を抑止。模擬試験で即時ロックと失敗後再試行、公開匿名デモで対象片道の完了・再表示・残数7→6を確認。[累計の結果と残件](progress/2026-11-12-cumulative-sixteen.md)。',t,flags=re.M);p.write_text(t,encoding='utf-8')
p=root/'docs/deliverables/2026-11-10-premeeting/README.md';t=p.read_text(encoding='utf-8-sig')
t=re.sub(r'^\[11月10～12日の最新進捗追補.*$', '[11月10～12日の最新進捗追補（9ページ）](progress-2026-11-12-cumulative-sixteen.pptx)に、累計16修正・開発側16項目と公開デモ画面を掲載。先行2件Claude Code Fable 5.2、追加14件Codex。日別は10日4件・11日8件・12日4件です。[先行15件版](progress-2026-11-12-cumulative-fifteen.pptx)を保持。この追補は正本r19・配布資料v36の12冊とは別の資料です。',t,flags=re.M)
t+='\n[最新16項目の検証記録](../../progress/2026-11-12-cumulative-sixteen.md)・[追補のファイル検査](../../../outputs/daily-sixteen-20261112/ppt/validation.json)・[独立目視レビュー](../../../outputs/daily-sixteen-20261112/ppt/independent-review.json)。\n';p.write_text(t,encoding='utf-8')
assert len(fixes)==16 and len(tests)==16
assert len(set(re.findall(r'AT-\d+', '\n'.join(tests))))==16
print('Saved 16 fixes, 16 unique AT items, report, progress, tracker, README.')
