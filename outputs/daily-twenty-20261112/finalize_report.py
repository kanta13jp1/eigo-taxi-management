from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2]
out=Path(__file__).resolve().parent
d=json.loads((out/'delivery-data.json').read_text(encoding='utf-8'))
prior=(root/'outputs/daily-nineteen-20261112/小林さんへの報告.txt').read_text(encoding='utf-8-sig')
items=re.findall(r'^\d+\. .+$',prior,re.M)
assert len(items)==38
fixes=items[:19]+['20. '+d['fix']]
tests=items[19:]+['20. AT-21 モバイル表示：'+d['test']]
assert len(set(re.findall(r'AT-\d+','\n'.join(tests))))==20
report='小林さん、お疲れ様です。\n\n11月12日はここまで実装修正8件・開発側受入試験8項目を実施しました。11月10日の各4件、11日の各8件と合わせ、累計20件の修正・20項目の試験実施です。先行2件はClaude Code Fable 5.2、追加18件はCodexの対応です。\n\n'+d['publicSummary']+'\n\n【実装修正20件】\n'+'\n'.join(fixes)+'\n\n【実施した受入試験20項目と範囲】\n'+'\n'.join(tests)+'\n\n検証サイト：https://eigo-taxi-test.web.app/\n反映版：'+d['release']+'\n公開ファイル7件の内容一致と、反映後の公開画面での動作を確認しました。文書・共有表・図入りPowerPointへ反映しています。\n\n20項目は開発側の実施数です。AT-28の復旧、AT-03の表示、AT-10の公開取消確定など、部分確認・未確認の範囲を残しています。実Google連携の全範囲・スマートフォン実機・顧客本人の確認は別に管理しています。顧客確認は共有表で0/6件です。\n\n今回も匿名デモの架空データだけを使い、顧客用の検証台帳・カレンダーは維持しました。本番運用は開始していません。\n\n次はバックアップの保護設定・参照式の復旧手順と、保護者側の公開画面での取消確定を確認します。小林さんの6手順確認後、先生との合同テストを行い、教室側Google環境の準備と移行を判断する方針です。\nよろしくお願いいたします。\n'
(out/'小林さんへの報告.txt').write_text(report,encoding='utf-8')
links='''

## 第20件の確認範囲・証跡

前版5424438ebd36deb1を基準に、保護者の予約中一覧にある送迎場所の表示だけを変更。長い住所を省略せず折り返す。登録データ、取消、消費処理、GAS、認証は変更しない。

[修正差分](../../outputs/daily-twenty-20261112/implementation.patch)・[独立コードレビュー](../../outputs/daily-twenty-20261112/independent-code-review.json)・[ローカル検証](../../outputs/daily-twenty-20261112/at21.json)・[公開画面記録](../../outputs/daily-twenty-20261112/public-ui.json)。匿名デモの架空予約を使用。ブラウザーの画面幅を375pxとして表示を検証し、スマートフォン実機の合格として扱わない。実Google認証・家庭別認可・カレンダー連携の受入は追加していない。

検証Hosting eigo-taxi-testだけへ配備。反映版 RELEASE、sourceDigest DIGEST。[配備記録](../acceptance/deployment/releases/RELEASE/firebase-deploy.json)・[公開7応答の照合](../acceptance/deployment/releases/RELEASE/public-verification.json)。

共有表の検証結果履歴88行と進捗概要A3を更新。顧客確認欄・集計式の保持と記入内容を読み戻し確認。[共有表照合](../../outputs/daily-twenty-20261112/shared-readback.json)。

[図入り追補PowerPoint（13ページ）](../deliverables/2026-11-10-premeeting/progress-2026-11-12-cumulative-twenty.pptx)・[ファイル・配置・再取込検査](../../outputs/daily-twenty-20261112/ppt/validation.json)・[独立目視レビュー](../../outputs/daily-twenty-20261112/ppt/independent-review.json)。PowerPointアプリでの表示は未確認。工程正本r19・配布資料v36（12冊214頁）は維持し、第7～20件後の全工程横断検査は未実施。今回の追補は正本12冊の一括改版ではない。

[先行19件の詳細](2026-11-12-cumulative-nineteen.md)・[会議方針](2026-11-11-meeting-decisions.md)・[報告文（未送信）](../../outputs/daily-twenty-20261112/小林さんへの報告.txt)。
'''.replace('RELEASE',d['release']).replace('DIGEST',d['sourceDigest'])
(root/'docs/progress/2026-11-12-cumulative-twenty.md').write_text('# 11月10～12日 累計20件の修正と開発側受入試験20項目\n\n'+report+links,encoding='utf-8')
p=root/'docs/remaining-work-tracker.md';t=p.read_text(encoding='utf-8-sig');t,n=re.subn(r'^11月12日の検証サイトは版.*$', '11月12日の検証サイトは版'+d['release']+'。本日累計8修正・開発側8項目、全体累計20修正・20項目実施。第20件は保護者の送迎場所を省略せず折り返して表示。'+d['publicSummary']+' [累計結果と残件](progress/2026-11-12-cumulative-twenty.md)。',t,flags=re.M);assert n==1;p.write_text(t,encoding='utf-8')
p=root/'docs/deliverables/2026-11-10-premeeting/README.md';t=p.read_text(encoding='utf-8-sig');t,n=re.subn(r'^\[11月10～12日の最新進捗追補.*$', '[11月10～12日の最新進捗追補（13ページ）](progress-2026-11-12-cumulative-twenty.pptx)に、累計20修正・開発側20項目と公開デモ画面を掲載。先行2件Claude Code Fable 5.2、追加18件Codex。日別は10日4件・11日8件・12日8件。[先行19件版](progress-2026-11-12-cumulative-nineteen.pptx)を保持。正本r19・配布資料v36の12冊とは別の追補です。',t,flags=re.M);assert n==1
t=t.replace('[最新19項目の検証記録]','[19項目時点の検証記録]')
t+='\n[最新20項目の検証記録](../../progress/2026-11-12-cumulative-twenty.md)・[追補のファイル検査](../../../outputs/daily-twenty-20261112/ppt/validation.json)・[独立目視レビュー](../../../outputs/daily-twenty-20261112/ppt/independent-review.json)。\n';p.write_text(t,encoding='utf-8')
print('Saved 20 fixes, 20 distinct AT items; report/progress/tracker/README updated.')
