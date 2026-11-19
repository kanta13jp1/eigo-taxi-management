from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2];out=Path(__file__).resolve().parent
d=json.loads((out/'delivery-data.json').read_text(encoding='utf-8'))
report='小林さん、お疲れ様です。\n\n11月14日の進捗をご報告します。\n\n本日は、保護者が予約を取り消す際の確認画面を改善し、検証サイトへの反映と公開画面での確認を完了しました。\n\n【修正内容】\n'+d['fix']+'\n\n【実施した試験：AT-10 保護者の予約取消】\n'+d['test']+'\n\n検証サイト：https://eigo-taxi-test.web.app/\n反映版：'+d['release']+'\n公開ファイル7件の内容一致と、反映後の画面を確認しました。文書・共有表・図入りPowerPointも更新しています。\n\n本日は1修正とAT-10の再検証です。実装修正の累計は23件（先行2件Claude Code Fable 5.2、追加21件Codex）、実施した技術試験IDは22項目のままです。同じAT-10を新しい試験項目として重複計上していません。\n\n今回の結果は匿名デモの公開画面による確認です。実Googleカレンダーの削除・家庭別アクセス制限・実機・顧客本人の確認の合格を追加するものではありません。顧客確認は共有表で0/6件です。顧客用の検証データは維持し、本番運用は開始していません。\n\n次は、バックアップの保護設定・参照式を含む復旧手順の確認を進めます。小林さんの6手順確認後、先生との合同テストへ進む方針を継続しています。\nよろしくお願いいたします。\n'
(out/'小林さんへの報告.txt').write_text(report,encoding='utf-8')
detail='''

## 証跡・対象版と確認範囲

IMPLEMENTATION

[修正差分](../../outputs/daily-20261114/implementation.patch)・[独立コードレビュー](../../outputs/daily-20261114/independent-code-review.json)・[ローカル検証](../../outputs/daily-20261114/TESTFILE)・[公開画面検証](../../outputs/daily-20261114/public-ui.json)。

前版54178ee8e9d61c91を基準に、検証Hosting eigo-taxi-testだけへ配備。反映版 RELEASE、sourceDigest DIGEST。[配備記録](../acceptance/deployment/releases/RELEASE/firebase-deploy.json)・[公開7応答の照合](../acceptance/deployment/releases/RELEASE/public-verification.json)。

共有表は検証結果履歴91行、進捗概要A3・B11・B13、顧客確認6件の操作手順D8だけを更新。判定・実施日・実測値は変更しない。[共有表照合](../../outputs/daily-20261114/shared-readback.json)。[顧客確認の手順](../acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md#CUST-03)に新しい画面の操作名を反映。

[図入り進捗・操作追補PowerPoint（16ページ）](../deliverables/2026-11-10-premeeting/progress-2026-11-14-daily.pptx)・[構造・配置・再取込検査](../../outputs/daily-20261114/ppt/validation.json)・[独立目視レビュー](../../outputs/daily-20261114/ppt/independent-review.json)。保護者取消の操作補足は16ページ。既存頁の過去の確認結果を残し、2ページのAT-10の現状と16ページで今回の追加確認を区別する。PowerPointアプリ上の表示は未確認。

工程正本r19・配布資料v36（12冊214頁）は維持。第7～23件後の全工程横断検査は未実施。この追補は正本12冊の一括改版ではない。実装修正23件に対して異なる技術試験IDは22項目であり、AT-10の再検証を23項目目として計上しない。[先行22修正と22項目の記録](2026-11-13-cumulative-twentytwo.md)。
'''.replace('RELEASE',d['release']).replace('DIGEST',d['sourceDigest']).replace('IMPLEMENTATION',d['implementationDetails']).replace('TESTFILE',d['testFile'])
(root/'docs/progress/2026-11-14-daily.md').write_text('# 11月14日 保護者の取消確認とAT-10の公開再検証\n\n'+report+detail,encoding='utf-8')
p=root/'docs/remaining-work-tracker.md';t=p.read_text(encoding='utf-8-sig');t,n=re.subn(r'^11月13日の検証サイトは版.*$', '11月14日の検証サイトは版'+d['release']+'。本日1修正・AT-10再検証。実装修正累計23件、異なる技術試験IDは22項目。'+d['publicSummary']+' [当日の記録と残件](progress/2026-11-14-daily.md)。',t,flags=re.M);assert n==1;p.write_text(t,encoding='utf-8')
p=root/'docs/deliverables/2026-11-10-premeeting/README.md';t=p.read_text(encoding='utf-8-sig');t,n=re.subn(r'^\[11月10～13日の最新進捗追補.*$', '[11月10～14日の最新進捗・操作追補（16ページ）](progress-2026-11-14-daily.pptx)に、累計23修正・22技術試験IDとAT-10の追加公開確認を掲載。先行2件Claude Code Fable 5.2、追加21件Codex。日別修正数は10日4件・11日8件・12日8件・13日2件・14日1件。[先行22件版](progress-2026-11-13-cumulative-twentytwo.pptx)を保持。保護者取消の操作補足は16ページ。正本r19・配布v36の12冊とは別の追補です。',t,flags=re.M);assert n==1
t=t.replace('[最新22項目の検証記録]','[22項目時点の検証記録]');t+='\n[11月14日の記録](../../progress/2026-11-14-daily.md)・[追補の検査](../../../outputs/daily-20261114/ppt/validation.json)・[独立目視レビュー](../../../outputs/daily-20261114/ppt/independent-review.json)。\n';p.write_text(t,encoding='utf-8')
p=root/'docs/acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md';t=p.read_text(encoding='utf-8-sig');old='CUST-02で自分が作成した取消確認用の予約だけを選び、「キャンセル」を押して確認する。家庭画面と検証カレンダーを再読込する。事前準備したCUST-04の2件は取り消さない。';assert old in t;t=t.replace(old,d['customerProcedure']);p.write_text(t,encoding='utf-8')
p=root/'docs/deliverables/2026-10-23-traceability/README.md';t=p.read_text(encoding='utf-8-sig');s='\n[11月14日 保護者取消の操作追補（16ページ目）](../2026-11-10-premeeting/progress-2026-11-14-daily.pptx)：運用手順書・ユーザーマニュアルの操作補足。新しい確認画面とAT-10の公開匿名デモ結果を掲載し、顧客確認・実Google連携と区別します。正本12冊の一括改版ではありません。\n';t=t.split('\n',1)[0]+'\n'+s+t.split('\n',1)[1];p.write_text(t,encoding='utf-8')
print('Saved daily report, progress/tracker, delivery indexes and customer procedure. No duplicate AT count.')
