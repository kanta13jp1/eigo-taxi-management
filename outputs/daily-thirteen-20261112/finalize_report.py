from pathlib import Path
import re
root=Path(__file__).resolve().parents[2]
prior=(root/'outputs/roundtrip-20261111/小林さんへの報告.txt').read_text(encoding='utf-8-sig')
rows=re.findall(r'^\d+\. .+$',prior,re.M)
assert len(rows)==24, len(rows)
fixes=rows[:12]+['13. 保護者画面で生徒一覧が読み込まれたり更新されたりした後も、生徒選択欄・残数カード・予約一覧が同じ有効な生徒を表示するよう修正しました。生徒選択欄にも項目名を関連付けました。']
tests=rows[12:]+['13. AT-03 保護者の残数表示［部分確認］：模擬試験で読み込み後の表示、きょうだい切替（7回・4回）、選択生徒の除外後の切替、全件なしを確認しました。公開匿名デモで選択欄と残数カードの氏名一致、残数7回・予約1件・消費枚数の説明を確認しました。Google本人ログインと家庭別のアクセス制限は今回の対象外です。']
intro='''小林さん、お疲れ様です。

11月12日は、保護者画面の生徒選択と残数表示の修正を検証サイトへ反映し、公開画面を確認しました。本日追加は修正1件・開発側受入試験1項目です。11月10日の各4件、11日の各8件と合わせ、累計13件の修正・13項目の試験実施となりました。先行2件はClaude Code Fable 5.2、追加11件はCodexの対応です。

【実装修正13件】
'''
tail='''

検証サイト：https://eigo-taxi-test.web.app/
反映版：b88aec3501218a21
公開ファイル7件がビルド内容と一致しました。結果は文書・共有表・図入りPowerPointへ反映しています。

今回の確認は匿名デモで行い、顧客用の検証台帳・カレンダーに書き込みをしていません。顧客用データは維持し、本番運用は開始していません。

開発側はバックアップの保護設定・参照式を復旧する手順と、公開画面での取消確定の再確認を進めます。小林さん本人の確認は記録上0/6件です。6手順の確認後に先生との合同テストを行い、その結果をもとに教室側Google環境の準備と移行を判断します。
'''
report=intro+'\n'.join(fixes)+'\n\n【実施した受入試験13項目と範囲】\n'+'\n'.join(tests)+tail
(root/'outputs/daily-thirteen-20261112/小林さんへの報告.txt').write_text(report,encoding='utf-8')
detail='''

## 第13件の証跡と配信

前版47d533a917506138を基準にParentPortal.tsxだけを変更。初回マウント時の生徒IDを固定する実装から、有効な選択IDまたは現在の一覧先頭を表示対象とする実装へ修正した。選択欄、残数カード、予約フィルターで同じ生徒を使用する。認証やAPI、消費計算には変更を加えていない。

[差分](../../outputs/daily-thirteen-20261112/selection.patch)・[独立コードレビュー](../../outputs/daily-thirteen-20261112/independent-code-review.json)・[旧版試験](../../outputs/daily-thirteen-20261112/before.json)・[修正後試験](../../outputs/daily-thirteen-20261112/at03.json)・[試験コード](../../outputs/daily-thirteen-20261112/at03.cjs)。型検査・対象lint・ビルドを実施した。

検証サイトeigo-taxi-testだけに配備。版b88aec3501218a21、ソースDigest 008cb953655434c360dcc1353e2f2a1340e51fffa6552d02c7d5491f841e6686。11月12日05:43 JSTの公開7応答がHTTP 200かつSHA-256一致。[配備記録](../acceptance/deployment/releases/b88aec3501218a21/firebase-deploy.json)・[公開照合](../acceptance/deployment/releases/b88aec3501218a21/public-verification.json)。

[公開画面](../../outputs/daily-thirteen-20261112/parent-view.png)・[公開操作記録](../../outputs/daily-thirteen-20261112/public-ui.json)。公開匿名デモは氏名・残数・予約の表示確認。Google本人ログイン・家庭別認可の受入を代替しない。

共有表の検証結果履歴81行と進捗概要A3/B11を更新。記入内容の一致、顧客確認6件の記録と集計式の保持を読み戻し確認した。[共有表照合](../../outputs/daily-thirteen-20261112/shared-readback.json)。

[進捗追補PowerPoint（5ページ・採用版v3）](../deliverables/2026-11-10-premeeting/progress-2026-11-12-cumulative-thirteen-v3.pptx)・[ファイル・配置・再取込検査](../../outputs/daily-thirteen-20261112/ppt/validation-v3.json)・[独立目視レビュー](../../outputs/daily-thirteen-20261112/ppt/independent-review.json)・[報告文（未送信）](../../outputs/daily-thirteen-20261112/小林さんへの報告.txt)。v1/v2は途中候補として保持し、最新版として案内しない。PowerPointアプリでの表示確認は未実施。

工程正本はr19・配布資料v36（12冊・214頁）。第7～13件配信後の全工程横断検査は未実施。今回の進捗追補は正本12冊の一括改版ではない。[先行12件](2026-11-11-cumulative-twelve.md)・[会議方針](2026-11-11-meeting-decisions.md)。
'''
(root/'docs/progress/2026-11-12-cumulative-thirteen.md').write_text('# 11月10～12日 累計13件の実装修正と開発側受入試験13項目\n\n'+report+detail,encoding='utf-8')
p=root/'docs/remaining-work-tracker.md'
t=p.read_text(encoding='utf-8-sig')
t=re.sub(r'^11月11日19:13確認の検証サイト.*$', '11月12日05:43確認の検証サイトは版b88aec3501218a21。本日1修正・開発側1項目の追加で累計13件修正・13項目実施。公開保護者デモで名前のある生徒選択欄、氏名と残数7回・予約1件を確認した。AT-03の表示部分の検証であり、Google本人ログイン・家庭別認可は今回対象外。[累計の結果と残件](progress/2026-11-12-cumulative-thirteen.md)。',t,flags=re.M)
p.write_text(t,encoding='utf-8')
p=root/'docs/deliverables/2026-11-10-premeeting/README.md'
t=p.read_text(encoding='utf-8-sig')
t=re.sub(r'^\[11月10～11日の最新進捗追補.*$', '[11月10～12日の最新進捗追補（5ページ・採用版v3）](progress-2026-11-12-cumulative-thirteen-v3.pptx)に、累計13修正・開発側13項目と公開デモ画面を掲載。先行2件Claude Code Fable 5.2、追加11件Codex。日別は10日4件・11日8件・12日1件です。[先行12件版](progress-2026-11-11-cumulative-twelve.pptx)も保持。この追補は正本r19・配布資料v36の12冊とは別の資料です。',t,flags=re.M)
t+='\n[最新13項目の検証記録](../../progress/2026-11-12-cumulative-thirteen.md)・[追補v3のファイル検査](../../../outputs/daily-thirteen-20261112/ppt/validation-v3.json)・[独立目視レビュー](../../../outputs/daily-thirteen-20261112/ppt/independent-review.json)。\n'
p.write_text(t,encoding='utf-8')
assert len(fixes)==13 and len(tests)==13
assert len(set(re.findall(r'AT-\d+', '\n'.join(tests))))==13
print('Saved 13 fixes, 13 unique AT items, report, progress, tracker, README.')
