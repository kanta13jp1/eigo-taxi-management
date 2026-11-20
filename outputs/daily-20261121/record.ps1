$ErrorActionPreference='Stop'
$o='outputs/daily-20261121'
$r=Get-Content "$o/verified-release.json" -Raw | ConvertFrom-Json
$version=$r.version
$source=$r.release.sourceDigest
$hashes=$r.publicHashesMatched
$d='docs/acceptance/deployment'
$current="$d/releases/$version"
$check=Get-Content "$current/public-verification.json" -Raw | ConvertFrom-Json
if(!$check.pass -or $hashes -ne 7){throw 'Verification evidence incomplete'}
Copy-Item "$current/public-verification.json" 'docs/acceptance/deployment-verification/public-2026-11-21-terms.json'
$record=@"
# 11月21日　規約画面の修正と公開確認

【実装修正】「利用規約」「個人情報の取扱い」「免責事項」を開き直すたびに、選んだ項目が表示されるように修正。Escapeで閉じると、操作に使ったボタンへフォーカスが戻る。11月20日の公開確認済み38件に今回1件を追加して累計39修正。先行2修正はClaude Code Fable 5.2。

【公開画面試験】幅375×高さ812の管理者デモで、3項目それぞれの見出し、Escapeによる終了、元のボタンへの復帰を確認。修正前の公開画面では誤った項目が開き、Escapeでも閉じなかった。開発側の既報38項目に公開デモの補足試験1項目を追加。AT-01〜30の実Google連携の合格数には算入しない。

【配備】検証サイト https://eigo-taxi-test.web.app/ に反映。Hosting $version、ソースダイジェスト $source。公開 $hashes 応答のSHA-256一致。直前公開版との差分はTermsModal.tsxのみ。型検査、ビルド、独立AIレビュー、公開ブラウザー試験を実施。lintは既存の旧文書生成スクリプトに警告あり。

[公開ファイル照合](../acceptance/deployment-verification/public-2026-11-21-terms.json)・[修正前の公開試験](../../outputs/daily-20261121/before-terms.json)・[反映後の公開試験](../../outputs/daily-20261121/public-terms.json)・[公開画面](../../outputs/daily-20261121/public-terms.png)

【残作業と次の1件】AT-28は架空データのファイル単位復旧で範囲保護・シート保護、別シート参照20・名前付き範囲参照30を確認済み。次は独立した検証台帳で、復旧コピーへのGAS再接続に備えた基準値照合を行う。顧客確認は共有表の6項目すべて未実施。小林さんの個別確認、先生との合同テスト、教室側の運用用Google環境準備が残る。顧客用データと本番環境への書き込みは発生していない。

[前回38項目の公開結果](2026-11-20-cumulative-thirtyeight.md)・[AT-28の確認範囲](2026-11-18-cumulative29-pending.md)
"@
Set-Content 'docs/progress/2026-11-21-cumulative39.md' $record -Encoding utf8
$tracker='docs/remaining-work-tracker.md'
if(!(Select-String -Quiet -SimpleMatch '2026-11-21-cumulative39.md' $tracker)){
 Add-Content $tracker @('','- 2026-11-21 検証サイトの規約画面を修正し、公開デモで3項目の選択・終了・フォーカス復帰を確認。実Google連携と顧客確認の判定は別途。[配備と試験記録](progress/2026-11-21-cumulative39.md)') -Encoding utf8
}
Write-Output "$version $source $hashes"

