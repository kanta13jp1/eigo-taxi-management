from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[2]
out=root/'outputs/daily-seventeen-20261112'
data=json.loads((out/'delivery-data.json').read_text(encoding='utf-8'))
prior=(root/'outputs/daily-sixteen-20261112/小林さんへの報告.txt').read_text(encoding='utf-8-sig')
rows=re.findall(r'^\d+\. .+$',prior,re.M)
assert len(rows)==32,len(rows)
fixes=rows[:16]+['17. 管理者の予約取消を画面内の確認ダイアログに変更し、生徒・日時・送迎区分と影響を表示してから確定するよう修正しました。「戻る」やEscapeでは取り消しません。同じ予約を完了処理中は取消操作も無効にします。']
tests=rows[16:]+['17. AT-11 管理者の予約取消：実Appと模擬サービスで、対象を示す確認、戻る・Escapeで予約と残数を維持、確定したIDだけを取消、別予約と残数7回を維持することを確認しました。'+data['testPublic']]
intro='小林さん、お疲れ様です。\n\n11月12日はここまで修正5件・開発側受入試験5項目を実施しました。11月10日の各4件、11日の各8件と合わせ、累計17件の修正・17項目の試験実施となりました。先行2件はClaude Code Fable 5.2、追加15件はCodexの対応です。\n\n今回は、管理者が予約を取り消す際に、対象の生徒・日時・送迎区分を画面内で確認してから確定できるよう修正しました。'+data['publicSummary']+'\n\n【実装修正17件】\n'
tail='\n\n検証サイト：https://eigo-taxi-test.web.app/\n反映版：'+data['release']+'\n公開ファイル7件の内容一致を確認し、文書・共有表・図入りPowerPointへ反映しました。\n\n今回の確認には匿名デモで新規に作成した架空生徒・予約だけを使いました。顧客用の検証台帳・カレンダーは維持し、本番運用は開始していません。\n\n開発側はバックアップの保護設定・参照式を復旧する手順と、保護者側の公開画面での取消確定の再確認を進めます。今回の管理者側の確認を、保護者側AT-10の未確認分の合格には数えていません。小林さん本人の確認は記録上0/6件です。6手順の確認後に先生との合同テストを行い、その結果をもとに教室側Google環境の準備と移行を判断します。\n'
report=intro+'\n'.join(fixes)+'\n\n【実施した受入試験17項目と範囲】\n'+'\n'.join(tests)+tail
(out/'小林さんへの報告.txt').write_text(report,encoding='utf-8')
details='''

## 第17件の証跡と配信

前版b10cd21819d6c229のアーカイブを基準にTeacherDashboard.tsxだけを変更。管理者一覧のwindow.confirmをnative HTML dialogのshowModalへ変更し、現在もscheduledの対象IDだけを選び、対象情報とデモ/Google連携の影響を表示して明示確定する。戻る・Escapeで状態を解除し、対象が一覧から外れた場合や画面を離れた場合は閉じる。対象予約が完了処理中の取消ボタンは無効にする。API・認証・取消処理・残数計算と、保護者側の取消確認は変更していない。

[差分](../../outputs/daily-seventeen-20261112/admin-cancel.patch)・[独立コードレビュー](../../outputs/daily-seventeen-20261112/independent-code-review.json)・[旧版試験](../../outputs/daily-seventeen-20261112/before.json)・[修正後試験](../../outputs/daily-seventeen-20261112/at11.json)・[試験コード](../../outputs/daily-seventeen-20261112/at11.cjs)。模擬試験ではjsdomのnative dialog機能を代替している。型検査・対象lint・ビルドを実施した。

検証Hosting eigo-taxi-testだけへ配備。版RELEASE、ソースDigest DIGEST。公開7応答がHTTP 200かつSHA-256一致。[配備記録](../acceptance/deployment/releases/RELEASE/firebase-deploy.json)・[公開照合](../acceptance/deployment/releases/RELEASE/public-verification.json)。

[公開確認画面](../../outputs/daily-seventeen-20261112/IMAGE)・[公開操作記録](../../outputs/daily-seventeen-20261112/public-ui.json)。新規の匿名デモ用架空生徒・予約のみ操作。管理者側AT-11の確認を、保護者側AT-10、実Googleカレンダーの削除、顧客本人確認へ代替加算していない。

共有表の検証結果履歴85行と進捗概要A3を更新。記入内容、顧客確認欄と集計式の保持を読み戻し確認した。[共有表照合](../../outputs/daily-seventeen-20261112/shared-readback.json)。

[進捗追補PowerPoint（10ページ）](../deliverables/2026-11-10-premeeting/progress-2026-11-12-cumulative-seventeen.pptx)・[ファイル・配置・再取込検査](../../outputs/daily-seventeen-20261112/ppt/validation.json)・[独立目視レビュー](../../outputs/daily-seventeen-20261112/ppt/independent-review.json)・[報告文（未送信）](../../outputs/daily-seventeen-20261112/小林さんへの報告.txt)。PowerPointアプリでの表示は未確認。

工程正本r19・配布資料v36（12冊・214頁）は変更していない。第7～17件配信後の全工程横断検査は未実施。今回の追補は正本12冊の一括改版ではない。[先行16件](2026-11-12-cumulative-sixteen.md)・[会議方針](2026-11-11-meeting-decisions.md)。
'''.replace('RELEASE',data['release']).replace('DIGEST',data['sourceDigest']).replace('IMAGE',data['image'])
(root/'docs/progress/2026-11-12-cumulative-seventeen.md').write_text('# 11月10～12日 累計17件の実装修正と開発側受入試験17項目\n\n'+report+details,encoding='utf-8')
p=root/'docs/remaining-work-tracker.md';t=p.read_text(encoding='utf-8-sig')
t=re.sub(r'^11月12日の検証サイトは版.*$', '11月12日の検証サイトは版'+data['release']+'。本日累計5修正・開発側5項目、全体累計17修正・17項目実施。第17件は管理者の取消確認を画面内へ変更。公開匿名デモで戻る時の不変・対象だけ取消・再表示・残数7を確認。[累計の結果と残件](progress/2026-11-12-cumulative-seventeen.md)。',t,flags=re.M);p.write_text(t,encoding='utf-8')
p=root/'docs/deliverables/2026-11-10-premeeting/README.md';t=p.read_text(encoding='utf-8-sig')
t=re.sub(r'^\[11月10～12日の最新進捗追補.*$', '[11月10～12日の最新進捗追補（10ページ）](progress-2026-11-12-cumulative-seventeen.pptx)に、累計17修正・開発側17項目と公開デモ画面を掲載。先行2件Claude Code Fable 5.2、追加15件Codex。日別は10日4件・11日8件・12日5件です。[先行16件版](progress-2026-11-12-cumulative-sixteen.pptx)を保持。この追補は正本r19・配布資料v36の12冊とは別の資料です。',t,flags=re.M)
t+='\n[最新17項目の検証記録](../../progress/2026-11-12-cumulative-seventeen.md)・[追補のファイル検査](../../../outputs/daily-seventeen-20261112/ppt/validation.json)・[独立目視レビュー](../../../outputs/daily-seventeen-20261112/ppt/independent-review.json)。\n';p.write_text(t,encoding='utf-8')
assert len(fixes)==17 and len(tests)==17
assert len(set(re.findall(r'AT-\d+', '\n'.join(tests))))==17
print('Saved 17 fixes, 17 unique AT items, report, progress, tracker, README.')
