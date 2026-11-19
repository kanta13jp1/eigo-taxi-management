from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2];out=Path(__file__).resolve().parent
d=json.loads((out/'delivery-data.json').read_text(encoding='utf-8'));assert d['status']=='verified'
report=f'''小林さん、お疲れ様です。
11月15日の進捗をご報告します。

本日は、チケット追加フォームを小さな画面でも操作できるように修正し、検証サイトへの反映と公開画面での確認を完了しました。

【修正内容】
{d['fix']}

【実施した試験：AT-21・AT-05の再検証】
{d['tests']}

検証サイト：https://eigo-taxi-test.web.app/
反映版：{d['release']}
必要な自動テスト・独立コードレビュー・公開7応答の内容照合・公開画面検証を確認し、文書・共有表・図入りPowerPointも更新しました。

本日は1修正です。累計25修正（先行2件Claude Code Fable 5.2、追加23件Codex）、異なる技術試験IDは24項目のままで、既存項目の再検証を重複計上していません。
{d['scope']}
顧客本人の確認は共有表で0/6件です。顧客用データを維持し、本番運用は開始していません。

次はバックアップの保護設定・参照式を含む復旧手順を確認します。小林さんの6手順確認後に先生との合同テストへ進む方針を継続しています。確認結果と、教室側の運用用Googleアカウントの準備状況をご共有いただけますと助かります。
よろしくお願いいたします。
'''
(out/'小林さんへの報告.txt').write_text(report,encoding='utf-8')
e=f'''

## 証跡・対象版と確認範囲

{d['implementationDetails']}

前版a97d95510290c92bを基準とし、レビューした差分だけを検証Hosting eigo-taxi-testへ配備。対象版{d['release']}、sourceDigest {d['sourceDigest']}。

[修正差分](../../outputs/daily-20261115/implementation.patch)・[独立コードレビュー](../../outputs/daily-20261115/independent-code-review.json)・[ローカル検証](../../outputs/daily-20261115/{d['testFile']})・[公開画面検証](../../outputs/daily-20261115/public-ui.json)・[配備記録](../acceptance/deployment/releases/{d['release']}/firebase-deploy.json)・[公開応答照合](../acceptance/deployment/releases/{d['release']}/public-verification.json)。

共有表の検証結果履歴94行、進捗概要A3・B11・B13を更新。顧客確認の手順・判定・実施日・実測値と以前の履歴は変更しない。[共有表照合](../../outputs/daily-20261115/shared-readback.json)。

[図入り進捗・操作追補PowerPoint（18ページ）](../deliverables/2026-11-10-premeeting/progress-2026-11-15-daily.pptx)・[構造・配置・再取込検査](../../outputs/daily-20261115/ppt/validation.json)・[独立目視レビュー](../../outputs/daily-20261115/ppt/independent-review.json)。操作補足は18ページ。工程正本r19・配布v36（12冊214ページ）は維持。第7～25件後の全工程横断検査は未実施で、この追補は正本12冊の一括改版ではない。PowerPointアプリ上の表示は未確認。

AT-23は過去版のGoogle初期化・永続化記録を保持し、当日の実施として数えない。AT-24・25は11月11日の管理者による限定実連携確認を保持するが、保護者・実機を含む全範囲は未合格。AT-26・27・28・29・30の全範囲合格は追加しない。AT-30は将来の本番承認・配備後の項目。今回の公開匿名デモ・画面サイズによる検証で、実Google、実機、顧客確認の合格を代替しない。[先行24修正・24試験項目](2026-11-14-cumulative-twentyfour.md)。
'''
(root/'docs/progress/2026-11-15-daily.md').write_text('# 11月15日 チケット追加フォームの小画面操作\n\n'+report+e,encoding='utf-8')
p=root/'docs/remaining-work-tracker.md';t=p.read_text(encoding='utf-8-sig');t,n=re.subn(r'^11月14日の検証サイトは版.*$',f"11月15日の検証サイトは版{d['release']}。本日1修正、AT-21・AT-05の再検証。累計25修正・異なる技術試験ID24項目。{d['publicSummary']} [当日の記録と残件](progress/2026-11-15-daily.md)。",t,flags=re.M);assert n==1;p.write_text(t,encoding='utf-8')
p=root/'docs/deliverables/2026-11-10-premeeting/README.md';t=p.read_text(encoding='utf-8-sig');t,n=re.subn(r'^\[11月10～14日の最新進捗.*$', '[11月10～15日の最新進捗・操作追補（18ページ）](progress-2026-11-15-daily.pptx)に累計25修正・24技術試験IDを掲載。先行2修正Claude Code Fable 5.2、追加23修正Codex。11月15日はチケット追加フォームの小画面操作を修正し、既存AT-21・05を再検証しました。[前日24修正版](progress-2026-11-14-cumulative-twentyfour.pptx)を保持。正本r19・配布v36の12冊とは別の追補です。',t,flags=re.M);assert n==1;t+='\n[11月15日の記録](../../progress/2026-11-15-daily.md)・[追補の検査](../../../outputs/daily-20261115/ppt/validation.json)・[独立目視レビュー](../../../outputs/daily-20261115/ppt/independent-review.json)。\n';p.write_text(t,encoding='utf-8')
p=root/'docs/deliverables/2026-10-23-traceability/README.md';t=p.read_text(encoding='utf-8-sig');first,rest=t.split('\n',1);t=first+'\n\n[11月15日 最新進捗・チケット追加の操作追補（18ページ）](../2026-11-10-premeeting/progress-2026-11-15-daily.pptx)：運用手順書・ユーザーマニュアルの補足。小さな画面で入力・登録ボタンまでスクロールする操作と匿名デモの確認結果を掲載。正本12冊の一括改版ではありません。\n'+rest;p.write_text(t,encoding='utf-8')
print('Updated daily report, tracker and presentation indexes; customer cells unchanged.')
