from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[2]
out=root/'outputs/daily-fourteen-20261112'
data=json.loads((out/'delivery-data.json').read_text(encoding='utf-8'))
prior=(root/'outputs/daily-thirteen-20261112/小林さんへの報告.txt').read_text(encoding='utf-8-sig')
rows=re.findall(r'^\d+\. .+$',prior,re.M)
assert len(rows)==26,len(rows)
fixes=rows[:13]+['14. 管理者の当日一覧・全予約一覧にある完了ボタンの読み上げ名へ、生徒・日付・時刻・送迎区分・消費枚数を追加しました。対象を判別して操作できるようにする修正です。']
tests=rows[13:]+['14. AT-13 片道完了：模擬試験で対象予約だけが完了になり、完了日時が記録され、残数7回→6回となること、他の予約・残数が変わらないことを確認しました。'+data['testPublic']]
intro='小林さん、お疲れ様です。\n\n11月12日はここまで修正2件・開発側受入試験2項目を実施しました。11月10日の各4件、11日の各8件と合わせ、累計14件の修正・14項目の試験実施となりました。先行2件はClaude Code Fable 5.2、追加12件はCodexの対応です。\n\n今回は、管理者の完了ボタンで対象の生徒・日時・消費枚数を判別できるようにし、検証サイトへ反映しました。'+data['publicSummary']+'\n\n【実装修正14件】\n'
tail='\n\n検証サイト：https://eigo-taxi-test.web.app/\n反映版：'+data['release']+'\n公開ファイル7件の内容一致を確認し、文書・共有表・図入りPowerPointへ反映しました。\n\n今回の確認には匿名デモの専用架空予約だけを使いました。顧客用の検証台帳・カレンダーは維持し、本番運用は開始していません。\n\n開発側はバックアップの保護設定・参照式を復旧する手順と、公開画面での取消確定の再確認を進めます。小林さん本人の確認は記録上0/6件です。6手順の確認後に先生との合同テストを行い、その結果をもとに教室側Google環境の準備と移行を判断します。\n'
report=intro+'\n'.join(fixes)+'\n\n【実施した受入試験14項目と範囲】\n'+'\n'.join(tests)+tail
(out/'小林さんへの報告.txt').write_text(report,encoding='utf-8')
details='''

## 第14件の証跡と配信

前版b88aec3501218a21のアーカイブを基準にTeacherDashboard.tsxだけを変更。完了操作の対象・消費数を含むアクセシブル名を当日一覧・全予約一覧に設定した。可視ボタンの文言、予約IDでの呼び出し、消費計算、API、認証の挙動は変更していない。音声読み上げの実機試験は未実施。

[差分](../../outputs/daily-fourteen-20261112/completion.patch)・[独立コードレビュー](../../outputs/daily-fourteen-20261112/independent-code-review.json)・[旧版試験](../../outputs/daily-fourteen-20261112/before.json)・[修正後試験](../../outputs/daily-fourteen-20261112/at13.json)・[試験コード](../../outputs/daily-fourteen-20261112/at13.cjs)。型検査・対象lint・ビルドを実施した。

検証専用Hosting eigo-taxi-testだけへ配備した。版RELEASE、ソースDigest DIGEST。公開7応答はHTTP 200かつSHA-256一致。[配備記録](../acceptance/deployment/releases/RELEASE/firebase-deploy.json)・[公開照合](../acceptance/deployment/releases/RELEASE/public-verification.json)。

[公開画面](../../outputs/daily-fourteen-20261112/IMAGE)・[公開操作記録](../../outputs/daily-fourteen-20261112/public-ui.json)。公開匿名デモで今回作成した架空予約だけを操作。実Google受入・顧客本人による確認を代替しない。

共有表の検証結果履歴82行と進捗概要A3を更新。書込内容、顧客確認欄と集計式の保持を読み戻した。[共有表照合](../../outputs/daily-fourteen-20261112/shared-readback.json)。

[進捗追補PowerPoint（6ページ）](../deliverables/2026-11-10-premeeting/progress-2026-11-12-cumulative-fourteen.pptx)・[ファイル・配置・再取込検査](../../outputs/daily-fourteen-20261112/ppt/validation.json)・[独立目視レビュー](../../outputs/daily-fourteen-20261112/ppt/independent-review.json)・[報告文（未送信）](../../outputs/daily-fourteen-20261112/小林さんへの報告.txt)。PowerPointアプリでの表示は未確認。

工程正本r19・配布資料v36（12冊・214頁）は変更していない。第7～14件配信後の全工程横断検査は未実施。今回の進捗追補は正本12冊の一括改版ではない。[先行13件](2026-11-12-cumulative-thirteen.md)・[会議方針](2026-11-11-meeting-decisions.md)。
'''.replace('RELEASE',data['release']).replace('DIGEST',data['sourceDigest']).replace('IMAGE',data['image'])
(root/'docs/progress/2026-11-12-cumulative-fourteen.md').write_text('# 11月10～12日 累計14件の実装修正と開発側受入試験14項目\n\n'+report+details,encoding='utf-8')
p=root/'docs/remaining-work-tracker.md';t=p.read_text(encoding='utf-8-sig')
t=re.sub(r'^11月12日05:43確認の検証サイト.*$', '11月12日の検証サイトは版'+data['release']+'。本日累計2修正・開発側2項目、全体累計14修正・14項目実施。第14件は完了ボタンの操作名を修正し、公開匿名デモで今回作成した片道予約1件の完了・残数1減・再表示を確認。[累計の結果と残件](progress/2026-11-12-cumulative-fourteen.md)。',t,flags=re.M);p.write_text(t,encoding='utf-8')
p=root/'docs/deliverables/2026-11-10-premeeting/README.md';t=p.read_text(encoding='utf-8-sig')
t=re.sub(r'^\[11月10～12日の最新進捗追補.*$', '[11月10～12日の最新進捗追補（6ページ）](progress-2026-11-12-cumulative-fourteen.pptx)に、累計14修正・開発側14項目と公開デモ画面を掲載。先行2件Claude Code Fable 5.2、追加12件Codex。日別は10日4件・11日8件・12日2件です。[先行13件版](progress-2026-11-12-cumulative-thirteen-v3.pptx)を保持。この追補は正本r19・配布資料v36の12冊とは別の資料です。',t,flags=re.M)
t+='\n[最新14項目の検証記録](../../progress/2026-11-12-cumulative-fourteen.md)・[追補のファイル検査](../../../outputs/daily-fourteen-20261112/ppt/validation.json)・[独立目視レビュー](../../../outputs/daily-fourteen-20261112/ppt/independent-review.json)。\n';p.write_text(t,encoding='utf-8')
assert len(fixes)==14 and len(tests)==14
assert len(set(re.findall(r'AT-\d+', '\n'.join(tests))))==14
print('Saved 14 fixes, 14 unique AT items, report, progress, tracker, README.')
