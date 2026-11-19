from pathlib import Path
import json,re,hashlib
root=Path(__file__).resolve().parents[2];out=Path(__file__).resolve().parent
d=json.loads((out/'delivery-data.json').read_text(encoding='utf-8'))
assert d['status']=='verified'
report=f'''小林さん、お疲れ様です。

11月14日の追加進捗をご報告します。

実装修正は累計24件、今回の集計で実施した異なる技術試験は24項目になりました。先行2修正はClaude Code Fable 5.2、追加22修正はCodexの対応分です。本日は合計2修正と、AT-10の再検証・新規2項目の確認を行いました。

【今回の修正内容】
{d['fix']}

【今回実施した受入試験】
{d['tests']}

検証サイト：https://eigo-taxi-test.web.app/
反映版：{d['release']}
独立コードレビュー、必要な自動テスト、公開7応答の内容照合、反映後の公開画面での確認を完了しました。文書・共有表・図入りPowerPointも更新しています。

24項目は技術試験を実施した項目数で、実Google連携を含む24項目の全範囲が合格した意味ではありません。{d['scope']}
顧客本人の6手順確認は共有表で0/6件です。顧客用の検証データは維持し、本番運用は開始していません。

次は、バックアップの保護設定・参照式を含む復旧手順の確認を進めます。小林さんの6手順確認後、先生との合同テストへ進む方針を継続しています。確認結果と教室側の運用用Googleアカウントの準備状況をご共有いただけますと助かります。
よろしくお願いいたします。
'''
(out/'小林さんへの報告.txt').write_text(report,encoding='utf-8')
e=f'''

## 対象版・証跡と集計範囲

前版9028a05806171c13を基準にレビューした差分だけを検証Hosting eigo-taxi-testへ配備。対象版{d['release']}、sourceDigest {d['sourceDigest']}。

[修正差分](../../outputs/daily-twentyfour-20261114/implementation.patch)・[独立レビュー](../../outputs/daily-twentyfour-20261114/independent-code-review.json)・[ローカル試験](../../outputs/daily-twentyfour-20261114/{d['testFile']})・[公開画面試験](../../outputs/daily-twentyfour-20261114/public-ui.json)・[配備記録](../acceptance/deployment/releases/{d['release']}/firebase-deploy.json)・[公開応答照合](../acceptance/deployment/releases/{d['release']}/public-verification.json)。

{d['implementationDetails']}

累計24実装修正、異なる技術試験IDは24項目。既存22項目に{d['newIds']}の2項目を追加。AT-10の11月14日再検証は重複計上しない。[同日先行のAT-10再検証](2026-11-14-daily.md)・[先行22項目](2026-11-13-cumulative-twentytwo.md)。先行2修正はユーザー申告のClaude Code Fable 5.2、追加22修正はCodex。11/10=4、11/11=8、11/12=8、11/13=2、11/14=2修正。

共有表の履歴92・93行、進捗概要A3・B11・B13を更新し、顧客確認の手順・判定・実施日・実測値は変更しない。[共有表照合](../../outputs/daily-twentyfour-20261114/shared-readback.json)。

[進捗・操作追補PowerPoint（17ページ）](../deliverables/2026-11-10-premeeting/progress-2026-11-14-cumulative-twentyfour.pptx)・[構造・配置・再取込検査](../../outputs/daily-twentyfour-20261114/ppt/validation.json)・[独立目視レビュー](../../outputs/daily-twentyfour-20261114/ppt/independent-review.json)。正本r19・配布v36（12冊214ページ）は維持。第7～24件後の全工程横断検査は未実施で、追補は正本12冊の一括改版ではない。PowerPointアプリ上の表示は未確認。
'''
(root/'docs/progress/2026-11-14-cumulative-twentyfour.md').write_text('# 11月14日 累計24修正・24技術試験項目\n\n'+report+e,encoding='utf-8')
p=root/'docs/remaining-work-tracker.md';t=p.read_text(encoding='utf-8-sig');t,n=re.subn(r'^11月14日の検証サイトは版.*$',f"11月14日の検証サイトは版{d['release']}。本日計2修正、AT-10再検証と{d['newIds']}。累計24修正・異なる技術試験ID24項目。{d['publicSummary']} [当日の追加記録と残件](progress/2026-11-14-cumulative-twentyfour.md)。",t,flags=re.M);assert n==1;p.write_text(t,encoding='utf-8')
p=root/'docs/deliverables/2026-11-10-premeeting/README.md';t=p.read_text(encoding='utf-8-sig');t,n=re.subn(r'^\[11月10～14日の最新進捗.*$', '[11月10～14日の最新進捗・操作追補（17ページ）](progress-2026-11-14-cumulative-twentyfour.pptx)に累計24修正・24技術試験IDを掲載。先行2修正Claude Code Fable 5.2、追加22修正Codex。日別修正数は10日4件・11日8件・12日8件・13日2件・14日2件。[同日先行23修正版](progress-2026-11-14-daily.pptx)を保持。正本r19・配布v36の12冊とは別の追補です。',t,flags=re.M);assert n==1;t+='\n[24項目時点の検証記録](../../progress/2026-11-14-cumulative-twentyfour.md)・[追補の検査](../../../outputs/daily-twentyfour-20261114/ppt/validation.json)・[独立目視レビュー](../../../outputs/daily-twentyfour-20261114/ppt/independent-review.json)。\n';p.write_text(t,encoding='utf-8')
p=root/'docs/deliverables/2026-10-23-traceability/README.md';t=p.read_text(encoding='utf-8-sig');first,rest=t.split('\n',1);t=first+'\n\n[11月14日 累計24修正・24技術試験の最新追補（17ページ）](../2026-11-10-premeeting/progress-2026-11-14-cumulative-twentyfour.pptx)：運用手順書・ユーザーマニュアルの補足。認証失効時の再ログイン案内とAT-19・20の模擬検証範囲は17ページ。正本12冊の一括改版ではありません。\n'+rest;p.write_text(t,encoding='utf-8')
print('Saved report, progress, tracker and presentation indexes. Customer records unchanged.')

