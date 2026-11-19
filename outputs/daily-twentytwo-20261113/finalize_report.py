from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2]
out=Path(__file__).resolve().parent
d=json.loads((out/'delivery-data.json').read_text(encoding='utf-8'))
prior=(root/'outputs/daily-twentyone-20261113/小林さんへの報告.txt').read_text(encoding='utf-8-sig')
items=re.findall(r'^\d+\. .+$',prior,re.M)
assert len(items)==42
fixes=items[:21]+['22. '+d['fix']]
tests=items[21:]+['22. '+d['atTitle']+'：'+d['test']]
assert len(set(re.findall(r'AT-\d+','\n'.join(tests))))==22
report='小林さん、お疲れ様です。\n\n11月13日はここまで実装修正2件・開発側受入試験2項目を追加しました。11月10～12日の各4件・8件・8件と合わせ、累計22件の修正・22項目の試験実施です。先行2件はClaude Code Fable 5.2、追加20件はCodexの対応です。\n\n'+d['publicSummary']+'\n\n【実装修正22件】\n'+'\n'.join(fixes)+'\n\n【実施した受入試験22項目と範囲】\n'+'\n'.join(tests)+'\n\n検証サイト：https://eigo-taxi-test.web.app/\n反映版：'+d['release']+'\n公開ファイル7件の内容一致と、反映後の公開画面での動作を確認しました。文書・共有表・図入りPowerPointへ反映しています。\n\n22項目は開発側の実施数です。部分確認・未確認の範囲を各項目に記録しています。実Google連携の全範囲・スマートフォン実機・顧客本人の確認は別に管理しています。顧客確認は共有表で0/6件です。\n\n今回も隔離した匿名デモの架空データだけを使い、顧客用の検証台帳・カレンダーは維持しました。本番運用は開始していません。\n\n次はバックアップの保護設定・参照式の復旧手順と、保護者側の公開画面での取消確定を確認します。小林さんの6手順確認後、先生との合同テストを行い、教室側Google環境の準備と移行を判断する方針です。\nよろしくお願いいたします。\n'
(out/'小林さんへの報告.txt').write_text(report,encoding='utf-8')
links='''

## 第22件の確認範囲・証跡

IMPLEMENTATION

[修正差分](../../outputs/daily-twentytwo-20261113/implementation.patch)・[独立コードレビュー](../../outputs/daily-twentytwo-20261113/independent-code-review.json)・[ローカル検証](../../outputs/daily-twentytwo-20261113/TESTFILE)・[公開画面記録](../../outputs/daily-twentytwo-20261113/public-ui.json)。異常の再現には隔離したブラウザーと架空データを使用し、顧客用台帳・普段のデモ保存内容を変更していない。実Google連携の合格を追加していない。

検証Hosting eigo-taxi-testだけへ配備。反映版 RELEASE、sourceDigest DIGEST。[配備記録](../acceptance/deployment/releases/RELEASE/firebase-deploy.json)・[公開7応答の照合](../acceptance/deployment/releases/RELEASE/public-verification.json)。

共有表の検証結果履歴90行と進捗概要A3・B13を更新。顧客確認欄・集計式の保持と記入内容を読み戻し確認。[共有表照合](../../outputs/daily-twentytwo-20261113/shared-readback.json)。

[図入り追補PowerPoint（15ページ）](../deliverables/2026-11-10-premeeting/progress-2026-11-13-cumulative-twentytwo.pptx)・[ファイル・配置・再取込検査](../../outputs/daily-twentytwo-20261113/ppt/validation.json)・[独立目視レビュー](../../outputs/daily-twentytwo-20261113/ppt/independent-review.json)。PowerPointアプリでの表示は未確認。工程正本r19・配布資料v36（12冊214頁）は維持し、第7～22件後の全工程横断検査は未実施。今回の追補は正本12冊の一括改版ではない。

[先行21件の詳細](2026-11-13-cumulative-twentyone.md)・[会議方針](2026-11-11-meeting-decisions.md)・[報告文（未送信）](../../outputs/daily-twentytwo-20261113/小林さんへの報告.txt)。
'''.replace('RELEASE',d['release']).replace('DIGEST',d['sourceDigest']).replace('IMPLEMENTATION',d['implementationDetails']).replace('TESTFILE',d['testFile'])
(root/'docs/progress/2026-11-13-cumulative-twentytwo.md').write_text('# 11月10～13日 累計22件の修正と開発側受入試験22項目\n\n'+report+links,encoding='utf-8')
p=root/'docs/remaining-work-tracker.md';t=p.read_text(encoding='utf-8-sig');t,n=re.subn(r'^11月13日の検証サイトは版.*$', '11月13日の検証サイトは版'+d['release']+'。本日2修正・開発側2項目、全体累計22修正・22項目実施。'+d['publicSummary']+' [累計結果と残件](progress/2026-11-13-cumulative-twentytwo.md)。',t,flags=re.M);assert n==1;p.write_text(t,encoding='utf-8')
p=root/'docs/deliverables/2026-11-10-premeeting/README.md';t=p.read_text(encoding='utf-8-sig');t,n=re.subn(r'^\[11月10～13日の最新進捗追補.*$', '[11月10～13日の最新進捗追補（15ページ）](progress-2026-11-13-cumulative-twentytwo.pptx)に、累計22修正・開発側22項目と公開デモ画面を掲載。先行2件Claude Code Fable 5.2、追加20件Codex。日別は10日4件・11日8件・12日8件・13日2件。[先行21件版](progress-2026-11-13-cumulative-twentyone.pptx)を保持。正本r19・配布資料v36の12冊とは別の追補です。',t,flags=re.M);assert n==1
t=t.replace('[最新21項目の検証記録]','[21項目時点の検証記録]')
t+='\n[最新22項目の検証記録](../../progress/2026-11-13-cumulative-twentytwo.md)・[追補のファイル検査](../../../outputs/daily-twentytwo-20261113/ppt/validation.json)・[独立目視レビュー](../../../outputs/daily-twentytwo-20261113/ppt/independent-review.json)。\n';p.write_text(t,encoding='utf-8')
print('Saved 22 fixes, 22 distinct AT items; report/progress/tracker/README updated.')
