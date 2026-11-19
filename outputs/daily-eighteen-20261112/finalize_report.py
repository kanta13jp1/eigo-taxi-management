from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[2]
out=root/'outputs/daily-eighteen-20261112'
data=json.loads((out/'delivery-data.json').read_text(encoding='utf-8'))
prior=(root/'outputs/daily-seventeen-20261112/小林さんへの報告.txt').read_text(encoding='utf-8-sig')
rows=re.findall(r'^\d+\. .+$',prior,re.M)
assert len(rows)==34,len(rows)
fixes=rows[:17]+['18. 別の画面で取り消された予約に、古い予定表示のまま完了を要求して拒否された場合、台帳を自動再取得して取消状態を表示するよう修正しました。残数不足・通信障害・認証エラーの扱いは維持しています。']
tests=rows[17:]+['18. AT-16 取消済みの完了拒否：実Appと模擬サービスで、取消済み予約の完了を拒否し、1回再取得して古い完了ボタンを除去、残数7枚・他データ不変を確認しました。Google形式のINVALID_STATE応答分類は模擬通信で確認し、別操作の同コードや残数不足・通信障害ではこの再取得を行わないことも確認しました。'+data['testPublic']]
intro='小林さん、お疲れ様です。\n\n11月12日はここまで修正6件・開発側受入試験6項目を実施しました。11月10日の各4件、11日の各8件と合わせ、累計18件の修正・18項目の試験実施となりました。先行2件はClaude Code Fable 5.2、追加16件はCodexの対応です。\n\n今回は、別の画面で取り消された予約が古い画面に予定中として残り、完了を拒否された後も手動再取得が必要になる点を修正しました。'+data['publicSummary']+'\n\n【実装修正18件】\n'
tail='\n\n検証サイト：https://eigo-taxi-test.web.app/\n反映版：'+data['release']+'\n公開ファイル7件の内容一致を確認し、文書・共有表・図入りPowerPointへ反映しました。\n\n今回の確認には匿名デモで新規に作成した架空生徒・予約だけを使いました。顧客用の検証台帳・カレンダーは維持し、本番運用は開始していません。\n\n次に進める開発側の作業は、バックアップの保護設定・参照式の復旧手順と、保護者側の公開画面での取消確定の再確認です。実Google連携の全範囲と顧客本人確認は別管理を継続しています。小林さん本人の確認は記録上0/6件です。6手順の確認後に先生との合同テストを行い、その結果をもとに教室側Google環境の準備と移行を判断します。\n'
report=intro+'\n'.join(fixes)+'\n\n【実施した受入試験18項目と範囲】\n'+'\n'.join(tests)+tail
(out/'小林さんへの報告.txt').write_text(report,encoding='utf-8')
details='''

## 第18件の証跡と配信

前版254b10bb3bf3744aのアーカイブを基準にApp.tsxとservices/api.tsの2ファイルだけを変更。completeRideのINVALID_STATE失敗応答をInactiveReservationErrorとして保持し、Appでこの種類だけ台帳再取得後に既存の画面内エラーへ伝える。匿名デモのsuccess:falseも同じ種類へ変換する。GAS・認証・取消処理・消費計算は変更していない。

[差分](../../outputs/daily-eighteen-20261112/stale-completion.patch)・[独立コードレビュー](../../outputs/daily-eighteen-20261112/independent-code-review.json)・[旧版試験](../../outputs/daily-eighteen-20261112/before.json)・[修正後試験](../../outputs/daily-eighteen-20261112/at16.json)・[試験コード](../../outputs/daily-eighteen-20261112/at16.cjs)。実Appと模擬データ、Google形式のstub応答で対象・非対象の分類を検証し、型検査・対象lint・ビルドを実施した。Google連携への新規の実操作はない。

検証Hosting eigo-taxi-testだけへ配備。版RELEASE、ソースDigest DIGEST。公開7応答がHTTP 200かつSHA-256一致。[配備記録](../acceptance/deployment/releases/RELEASE/firebase-deploy.json)・[公開照合](../acceptance/deployment/releases/RELEASE/public-verification.json)。

[古い予定表示](../../outputs/daily-eighteen-20261112/public-stale.png)・[拒否後の最新表示](../../outputs/daily-eighteen-20261112/public-reconciled.png)・[公開操作記録](../../outputs/daily-eighteen-20261112/public-ui.json)。同じブラウザーの匿名管理者デモ2タブで、新規の架空生徒・予約のみ確認した。独立したGoogle管理者2名の実同時操作や顧客本人確認を代替しない。

共有表の検証結果履歴86行と進捗概要A3を更新。記入内容、顧客確認欄と集計式の保持を読み戻し確認した。[共有表照合](../../outputs/daily-eighteen-20261112/shared-readback.json)。

[進捗追補PowerPoint（11ページ）](../deliverables/2026-11-10-premeeting/progress-2026-11-12-cumulative-eighteen.pptx)・[ファイル・配置・再取込検査](../../outputs/daily-eighteen-20261112/ppt/validation.json)・[独立目視レビュー](../../outputs/daily-eighteen-20261112/ppt/independent-review.json)・[報告文（未送信）](../../outputs/daily-eighteen-20261112/小林さんへの報告.txt)。PowerPointアプリでの表示は未確認。

工程正本r19・配布資料v36（12冊・214頁）は変更していない。第7～18件配信後の全工程横断検査は未実施。今回の追補は正本12冊の一括改版ではない。[先行17件](2026-11-12-cumulative-seventeen.md)・[会議方針](2026-11-11-meeting-decisions.md)。
'''.replace('RELEASE',data['release']).replace('DIGEST',data['sourceDigest'])
(root/'docs/progress/2026-11-12-cumulative-eighteen.md').write_text('# 11月10～12日 累計18件の実装修正と開発側受入試験18項目\n\n'+report+details,encoding='utf-8')
p=root/'docs/remaining-work-tracker.md';t=p.read_text(encoding='utf-8-sig')
t=re.sub(r'^11月12日の検証サイトは版.*$', '11月12日の検証サイトは版'+data['release']+'。本日累計6修正・開発側6項目、全体累計18修正・18項目実施。第18件は取消済みへの完了拒否後に台帳を自動再取得。公開匿名デモ2タブで取消の最新表示・完了ボタン除去・残数7不変を確認。[累計の結果と残件](progress/2026-11-12-cumulative-eighteen.md)。',t,flags=re.M);p.write_text(t,encoding='utf-8')
p=root/'docs/deliverables/2026-11-10-premeeting/README.md';t=p.read_text(encoding='utf-8-sig')
t=re.sub(r'^\[11月10～12日の最新進捗追補.*$', '[11月10～12日の最新進捗追補（11ページ）](progress-2026-11-12-cumulative-eighteen.pptx)に、累計18修正・開発側18項目と公開デモ画面を掲載。先行2件Claude Code Fable 5.2、追加16件Codex。日別は10日4件・11日8件・12日6件です。[先行17件版](progress-2026-11-12-cumulative-seventeen.pptx)を保持。この追補は正本r19・配布資料v36の12冊とは別の資料です。',t,flags=re.M)
t+='\n[最新18項目の検証記録](../../progress/2026-11-12-cumulative-eighteen.md)・[追補のファイル検査](../../../outputs/daily-eighteen-20261112/ppt/validation.json)・[独立目視レビュー](../../../outputs/daily-eighteen-20261112/ppt/independent-review.json)。\n';p.write_text(t,encoding='utf-8')
assert len(fixes)==18 and len(tests)==18
assert len(set(re.findall(r'AT-\d+', '\n'.join(tests))))==18
print('Saved 18 fixes, 18 unique AT items, report, progress, tracker, README.')
