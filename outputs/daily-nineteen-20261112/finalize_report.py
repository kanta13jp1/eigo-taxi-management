from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2]
out=Path(__file__).resolve().parent
d=json.loads((out/'delivery-data.json').read_text(encoding='utf-8'))
prior=(root/'outputs/daily-eighteen-20261112/小林さんへの報告.txt').read_text(encoding='utf-8-sig')
items=re.findall(r'^\d+\. .+$',prior,re.M)
assert len(items)==36
fixes=items[:18]+['19. '+d['fix']]
tests=items[18:]+['19. AT-06 保護者のお迎え予約：'+d['test']]
assert len(set(re.findall(r'AT-\d+','\n'.join(tests))))==19
report='小林さん、お疲れ様です。\n\n11月12日はここまで実装修正7件・開発側受入試験7項目を実施しました。11月10日の各4件、11日の各8件と合わせ、累計19件の修正・19項目の試験実施です。先行2件はClaude Code Fable 5.2、追加17件はCodexの対応です。\n\n'+d['publicSummary']+'\n\n【実装修正19件】\n'+'\n'.join(fixes)+'\n\n【実施した受入試験19項目と範囲】\n'+'\n'.join(tests)+'\n\n検証サイト：https://eigo-taxi-test.web.app/\n反映版：'+d['release']+'\n公開ファイル7件の版・内容一致と、反映後の公開画面での動作を確認しました。文書・共有表・図入りPowerPointへ反映しています。\n\n19項目は開発側の実施数です。AT-28の復旧、AT-03の表示、AT-10の公開取消確定など、部分確認・未確認の範囲を残しています。実Google連携の全範囲と顧客本人の確認は別に管理しています。顧客確認は共有表で0/6件です。\n\n今回も匿名デモの架空データだけを使い、顧客用の検証台帳・カレンダーは維持しました。本番運用は開始していません。\n\n次はバックアップの保護設定・参照式の復旧手順と、保護者側の公開画面での取消確定を確認します。小林さんの6手順確認後、先生との合同テストを行い、教室側Google環境の準備と移行を判断する方針です。\nよろしくお願いいたします。\n'
(out/'小林さんへの報告.txt').write_text(report,encoding='utf-8')
links='''

## 第19件の確認範囲・証跡

前版4296a542a2ae8491を基準に、保護者画面の予約一覧だけを変更。元の配列を変えず、選択した生徒の予定中予約を送迎日・時刻の早い順で表示する。取消・完了済みの履歴順、予約登録API、消費処理、GAS、認証は変更しない。

[修正差分](../../outputs/daily-nineteen-20261112/implementation.patch)・[独立コードレビュー](../../outputs/daily-nineteen-20261112/independent-code-review.json)・[ローカル検証](../../outputs/daily-nineteen-20261112/at06.json)・[公開画面記録](../../outputs/daily-nineteen-20261112/public-ui.json)。匿名デモの新規架空fixtureによる確認であり、Google本人認証・家庭別認可・カレンダー連携の合格を追加していない。

検証Hosting eigo-taxi-testだけへ配備。反映版 RELEASE、sourceDigest DIGEST。[配備記録](../acceptance/deployment/releases/RELEASE/firebase-deploy.json)・[公開7応答の照合](../acceptance/deployment/releases/RELEASE/public-verification.json)。

共有表の検証結果履歴87行と進捗概要A3を更新。顧客確認欄・集計式の保持と記入内容を読み戻し確認。[共有表照合](../../outputs/daily-nineteen-20261112/shared-readback.json)。

[図入り追補PowerPoint（12ページ）](../deliverables/2026-11-10-premeeting/progress-2026-11-12-cumulative-nineteen.pptx)・[ファイル・配置・再取込検査](../../outputs/daily-nineteen-20261112/ppt/validation.json)・[独立目視レビュー](../../outputs/daily-nineteen-20261112/ppt/independent-review.json)。PowerPointアプリでの表示は未確認。工程正本r19・配布資料v36（12冊214頁）は維持し、第7～19件後の全工程横断検査は未実施。今回の追補は正本12冊の一括改版ではない。

[先行18件の詳細](2026-11-12-cumulative-eighteen.md)・[会議方針](2026-11-11-meeting-decisions.md)・[報告文（未送信）](../../outputs/daily-nineteen-20261112/小林さんへの報告.txt)。
'''.replace('RELEASE',d['release']).replace('DIGEST',d['sourceDigest'])
(root/'docs/progress/2026-11-12-cumulative-nineteen.md').write_text('# 11月10～12日 累計19件の修正と開発側受入試験19項目\n\n'+report+links,encoding='utf-8')
p=root/'docs/remaining-work-tracker.md';t=p.read_text(encoding='utf-8-sig');t,n=re.subn(r'^11月12日の検証サイトは版.*$', '11月12日の検証サイトは版'+d['release']+'。本日累計7修正・開発側7項目、全体累計19修正・19項目実施。第19件は保護者の予約中一覧を送迎日時の早い順で表示。'+d['publicSummary']+' [累計結果と残件](progress/2026-11-12-cumulative-nineteen.md)。',t,flags=re.M);assert n==1;p.write_text(t,encoding='utf-8')
p=root/'docs/deliverables/2026-11-10-premeeting/README.md';t=p.read_text(encoding='utf-8-sig');t,n=re.subn(r'^\[11月10～12日の最新進捗追補.*$', '[11月10～12日の最新進捗追補（12ページ）](progress-2026-11-12-cumulative-nineteen.pptx)に、累計19修正・開発側19項目と公開デモ画面を掲載。先行2件Claude Code Fable 5.2、追加17件Codex。日別は10日4件・11日8件・12日7件。[先行18件版](progress-2026-11-12-cumulative-eighteen.pptx)を保持。正本r19・配布資料v36の12冊とは別の追補です。',t,flags=re.M);assert n==1
t=re.sub(r'\[最新(1[3-8])項目の検証記録\]',r'[\1項目時点の検証記録]',t)
t=t.replace('[最新追補の項目別結果と証跡]','[12項目時点の結果と証跡]')
t+='\n[最新19項目の検証記録](../../progress/2026-11-12-cumulative-nineteen.md)・[追補のファイル検査](../../../outputs/daily-nineteen-20261112/ppt/validation.json)・[独立目視レビュー](../../../outputs/daily-nineteen-20261112/ppt/independent-review.json)。\n';p.write_text(t,encoding='utf-8')
print('Saved 19 fixes, 19 distinct AT items; report/progress/tracker/README updated.')
