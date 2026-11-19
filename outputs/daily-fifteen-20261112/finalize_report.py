from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[2]
out=root/'outputs/daily-fifteen-20261112'
data=json.loads((out/'delivery-data.json').read_text(encoding='utf-8'))
prior=(root/'outputs/daily-fourteen-20261112/小林さんへの報告.txt').read_text(encoding='utf-8-sig')
rows=re.findall(r'^\d+\. .+$',prior,re.M)
assert len(rows)==28,len(rows)
fixes=rows[:14]+['15. 残数不足などで送迎完了に失敗した場合も、管理画面を隠さず操作内のエラーとして表示し、チケット追加後に再試行できるよう修正しました。台帳取得失敗時の再取得案内は維持しています。']
tests=rows[14:]+['15. AT-14 往復完了：実際のAppと模擬サービスで、残数1枚では予約・残数を変えず拒否し、管理画面とチケット追加を維持することを確認しました。6枚追加して7枚にした後、対象の往復だけが完了し、完了日時を記録、残数5枚となりました。他データは不変で、完了処理の通信失敗と台帳取得失敗の表示も確認しました。'+data['testPublic']]
intro='小林さん、お疲れ様です。\n\n11月12日はここまで修正3件・開発側受入試験3項目を実施しました。11月10日の各4件、11日の各8件と合わせ、累計15件の修正・15項目の試験実施となりました。先行2件はClaude Code Fable 5.2、追加13件はCodexの対応です。\n\n今回は、残数不足で往復の完了操作が拒否された際に管理画面全体が隠れる問題を修正しました。'+data['publicSummary']+'\n\n【実装修正15件】\n'
tail='\n\n検証サイト：https://eigo-taxi-test.web.app/\n反映版：'+data['release']+'\n公開ファイル7件の内容一致を確認し、文書・共有表・図入りPowerPointへ反映しました。\n\n今回の確認には匿名デモで新規に作成した架空生徒・予約だけを使いました。顧客用の検証台帳・カレンダーは維持し、本番運用は開始していません。\n\n開発側はバックアップの保護設定・参照式を復旧する手順と、公開画面での取消確定の再確認を進めます。小林さん本人の確認は記録上0/6件です。6手順の確認後に先生との合同テストを行い、その結果をもとに教室側Google環境の準備と移行を判断します。\n'
report=intro+'\n'.join(fixes)+'\n\n【実施した受入試験15項目と範囲】\n'+'\n'.join(tests)+tail
(out/'小林さんへの報告.txt').write_text(report,encoding='utf-8')
details='''

## 第15件の証跡と配信

前版383ff85ce1a54688のアーカイブを基準にApp.tsxとTeacherDashboard.tsxの2ファイルだけを変更。完了処理の拒否を呼出元の管理画面で捕捉し、対象予約を含むrole=alertとして表示する。台帳読み込み用の全体エラーへ流さず、追加・再試行を妨げない。再試行で操作エラーを消し、画面を離れれば局所状態は破棄される。API・認証・消費計算、台帳取得失敗の扱いは変更していない。

[差分](../../outputs/daily-fifteen-20261112/completion-error.patch)・[独立コードレビュー](../../outputs/daily-fifteen-20261112/independent-code-review.json)・[旧版試験](../../outputs/daily-fifteen-20261112/before.json)・[修正後試験](../../outputs/daily-fifteen-20261112/at14.json)・[試験コード](../../outputs/daily-fifteen-20261112/at14.cjs)。型検査・対象lint・ビルドを実施した。

検証専用Hosting eigo-taxi-testだけへ配備。版RELEASE、ソースDigest DIGEST。公開7応答がHTTP 200かつSHA-256一致。[配備記録](../acceptance/deployment/releases/RELEASE/firebase-deploy.json)・[公開照合](../acceptance/deployment/releases/RELEASE/public-verification.json)。

[残数不足時の公開画面](../../outputs/daily-fifteen-20261112/public-insufficient.png)・[完了後の公開画面](../../outputs/daily-fifteen-20261112/public-completed.png)・[公開操作記録](../../outputs/daily-fifteen-20261112/public-ui.json)。新規の匿名デモ専用架空生徒・予約で確認した。実Google受入・顧客本人確認の合格を代替しない。

共有表の検証結果履歴83行と進捗概要A3を更新。記入内容、顧客確認欄と集計式の保持を読み戻し確認した。[共有表照合](../../outputs/daily-fifteen-20261112/shared-readback.json)。

[進捗追補PowerPoint（8ページ）](../deliverables/2026-11-10-premeeting/progress-2026-11-12-cumulative-fifteen.pptx)では、読みやすさのため修正一覧と試験一覧を別ページに整理。[ファイル・配置・再取込検査](../../outputs/daily-fifteen-20261112/ppt/validation.json)・[独立目視レビュー](../../outputs/daily-fifteen-20261112/ppt/independent-review.json)・[報告文（未送信）](../../outputs/daily-fifteen-20261112/小林さんへの報告.txt)。PowerPointアプリでの表示は未確認。

工程正本r19・配布資料v36（12冊・214頁）は変更していない。第7～15件配信後の全工程横断検査は未実施。今回の追補は正本12冊の一括改版ではない。[先行14件](2026-11-12-cumulative-fourteen.md)・[会議方針](2026-11-11-meeting-decisions.md)。
'''.replace('RELEASE',data['release']).replace('DIGEST',data['sourceDigest'])
(root/'docs/progress/2026-11-12-cumulative-fifteen.md').write_text('# 11月10～12日 累計15件の実装修正と開発側受入試験15項目\n\n'+report+details,encoding='utf-8')
p=root/'docs/remaining-work-tracker.md';t=p.read_text(encoding='utf-8-sig')
t=re.sub(r'^11月12日の検証サイトは版.*$', '11月12日の検証サイトは版'+data['release']+'。本日累計3修正・開発側3項目、全体累計15修正・15項目実施。第15件は完了処理のエラーで管理画面を隠さないよう修正。公開匿名デモで往復の残数不足拒否→追加→完了後の残数7→5を確認。[累計の結果と残件](progress/2026-11-12-cumulative-fifteen.md)。',t,flags=re.M);p.write_text(t,encoding='utf-8')
p=root/'docs/deliverables/2026-11-10-premeeting/README.md';t=p.read_text(encoding='utf-8-sig')
t=re.sub(r'^\[11月10～12日の最新進捗追補.*$', '[11月10～12日の最新進捗追補（8ページ）](progress-2026-11-12-cumulative-fifteen.pptx)に、累計15修正・開発側15項目と公開デモ画面を掲載。先行2件Claude Code Fable 5.2、追加13件Codex。日別は10日4件・11日8件・12日3件です。[先行14件版](progress-2026-11-12-cumulative-fourteen.pptx)を保持。この追補は正本r19・配布資料v36の12冊とは別の資料です。',t,flags=re.M)
t+='\n[最新15項目の検証記録](../../progress/2026-11-12-cumulative-fifteen.md)・[追補のファイル検査](../../../outputs/daily-fifteen-20261112/ppt/validation.json)・[独立目視レビュー](../../../outputs/daily-fifteen-20261112/ppt/independent-review.json)。\n';p.write_text(t,encoding='utf-8')
assert len(fixes)==15 and len(tests)==15
assert len(set(re.findall(r'AT-\d+', '\n'.join(tests))))==15
print('Saved 15 fixes, 15 unique AT items, report, progress, tracker, README.')
