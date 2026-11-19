from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2]
out=Path(__file__).resolve().parent
d=json.loads((out/'delivery-data.json').read_text(encoding='utf-8'))
prior=(root/'outputs/daily-twenty-20261112/小林さんへの報告.txt').read_text(encoding='utf-8-sig')
items=re.findall(r'^\d+\. .+$',prior,re.M)
assert len(items)==40
fixes=items[:20]+['21. '+d['fix']]
tests=items[20:]+['21. AT-22 再読込後の永続化：'+d['test']]
assert len(set(re.findall(r'AT-\d+','\n'.join(tests))))==21
report='小林さん、お疲れ様です。\n\n11月13日は実装修正1件・開発側受入試験1項目を追加しました。11月10～12日の各4件・8件・8件と合わせ、累計21件の修正・21項目の試験実施です。先行2件はClaude Code Fable 5.2、追加19件はCodexの対応です。\n\n'+d['publicSummary']+'\n\n【実装修正21件】\n'+'\n'.join(fixes)+'\n\n【実施した受入試験21項目と範囲】\n'+'\n'.join(tests)+'\n\n検証サイト：https://eigo-taxi-test.web.app/\n反映版：'+d['release']+'\n公開ファイル7件の内容一致と、反映後の公開画面での動作を確認しました。文書・共有表・図入りPowerPointへ反映しています。\n\n21項目は開発側の実施数です。AT-28の復旧、AT-03の表示、AT-10の公開取消確定など、部分確認・未確認の範囲を残しています。実Google連携の全範囲・スマートフォン実機・顧客本人の確認は別に管理しています。顧客確認は共有表で0/6件です。\n\n今回も隔離した匿名デモの架空データだけを使い、顧客用の検証台帳・カレンダーは維持しました。本番運用は開始していません。\n\n次はバックアップの保護設定・参照式の復旧手順と、保護者側の公開画面での取消確定を確認します。小林さんの6手順確認後、先生との合同テストを行い、教室側Google環境の準備と移行を判断する方針です。\nよろしくお願いいたします。\n'
(out/'小林さんへの報告.txt').write_text(report,encoding='utf-8')
links='''

## 第21件の確認範囲・証跡

前版c9cd711d551ccc77を基準に、匿名デモのブラウザー保存データの読取処理を変更。キー未作成の初回利用と、保存済みで読めない内容とを区別する。読めない内容を初期サンプルとして扱わず、エラーで登録を止める。実Google API・GAS・認証や消費計算の変更はない。

[修正差分](../../outputs/daily-twentyone-20261113/implementation.patch)・[独立コードレビュー](../../outputs/daily-twentyone-20261113/independent-code-review.json)・[ローカル検証](../../outputs/daily-twentyone-20261113/at22.json)・[公開画面記録](../../outputs/daily-twentyone-20261113/public-ui.json)。異常データの注入・復元は検証用の隔離ブラウザー内だけで行い、顧客用台帳や普段のデモ保存内容を変更していない。Google側のバックアップ復旧を代替しない。

検証Hosting eigo-taxi-testだけへ配備。反映版 RELEASE、sourceDigest DIGEST。[配備記録](../acceptance/deployment/releases/RELEASE/firebase-deploy.json)・[公開7応答の照合](../acceptance/deployment/releases/RELEASE/public-verification.json)。

共有表の検証結果履歴89行と進捗概要A3・B13を更新。顧客確認欄・集計式の保持と記入内容を読み戻し確認。最新履歴行を折り返し表示し、概要A3は空のB3との結合で文字切れを解消。[共有表照合](../../outputs/daily-twentyone-20261113/shared-readback.json)。

[図入り追補PowerPoint（14ページ）](../deliverables/2026-11-10-premeeting/progress-2026-11-13-cumulative-twentyone.pptx)・[ファイル・配置・再取込検査](../../outputs/daily-twentyone-20261113/ppt/validation.json)・[独立目視レビュー](../../outputs/daily-twentyone-20261113/ppt/independent-review.json)。PowerPointアプリでの表示は未確認。工程正本r19・配布資料v36（12冊214頁）は維持し、第7～21件後の全工程横断検査は未実施。今回の追補は正本12冊の一括改版ではない。

[先行20件の詳細](2026-11-12-cumulative-twenty.md)・[会議方針](2026-11-11-meeting-decisions.md)・[報告文（未送信）](../../outputs/daily-twentyone-20261113/小林さんへの報告.txt)。
'''.replace('RELEASE',d['release']).replace('DIGEST',d['sourceDigest'])
(root/'docs/progress/2026-11-13-cumulative-twentyone.md').write_text('# 11月10～13日 累計21件の修正と開発側受入試験21項目\n\n'+report+links,encoding='utf-8')
p=root/'docs/remaining-work-tracker.md';t=p.read_text(encoding='utf-8-sig');t,n=re.subn(r'^11月12日の検証サイトは版.*$', '11月13日の検証サイトは版'+d['release']+'。本日1修正・開発側1項目、全体累計21修正・21項目実施。第21件は読取不能なデモ保存データを初期サンプルで上書きしないよう保護。'+d['publicSummary']+' [累計結果と残件](progress/2026-11-13-cumulative-twentyone.md)。',t,flags=re.M);assert n==1;p.write_text(t,encoding='utf-8')
p=root/'docs/deliverables/2026-11-10-premeeting/README.md';t=p.read_text(encoding='utf-8-sig');t,n=re.subn(r'^\[11月10～12日の最新進捗追補.*$', '[11月10～13日の最新進捗追補（14ページ）](progress-2026-11-13-cumulative-twentyone.pptx)に、累計21修正・開発側21項目と公開デモ画面を掲載。先行2件Claude Code Fable 5.2、追加19件Codex。日別は10日4件・11日8件・12日8件・13日1件。[先行20件版](progress-2026-11-12-cumulative-twenty.pptx)を保持。正本r19・配布資料v36の12冊とは別の追補です。',t,flags=re.M);assert n==1
t=t.replace('[最新20項目の検証記録]','[20項目時点の検証記録]')
t+='\n[最新21項目の検証記録](../../progress/2026-11-13-cumulative-twentyone.md)・[追補のファイル検査](../../../outputs/daily-twentyone-20261113/ppt/validation.json)・[独立目視レビュー](../../../outputs/daily-twentyone-20261113/ppt/independent-review.json)。\n';p.write_text(t,encoding='utf-8')
print('Saved 21 fixes, 21 distinct AT items; report/progress/tracker/README updated.')
