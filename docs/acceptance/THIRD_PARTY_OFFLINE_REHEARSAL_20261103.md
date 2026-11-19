# 第三者受入の技術的な事前確認：隔離されたGAS模擬試験

OFFLINE-3P-01：この文書は[第三者向け受入手順案](THIRD_PARTY_STEPS_DRAFT_20261103.md)の技術操作を準備するドラフトです。正本の期待条件を変更しません。以下は開発者以外の人が再現・結果を点検できる**ローカル事前確認**であり、正本の第三者受入30件そのものや実Google連携の合格ではありません。各ATの合否は[受入仕様](06_ACCEPTANCE_TEST_SPEC.md)と[第三者受入表](third-party-acceptance-checklist.csv)で別途判定します。

OFFLINE-3P-02：対象は `gas/Code.gs` をNode.js内のVMで読み込む `scripts/test_gas.cjs` です。シート・カレンダー・認証などのGoogleサービスは、全てプロセス内の架空の代替実装です。実際のGoogle API、台帳、アカウント、カレンダーには接続せず、個人情報や本人の認証情報を入力しません。端末内の作業ディレクトリには結果JSONが新規保存されます。実シートや実カレンダーの書込み結果、ブラウザー画面、ネットワーク障害、複数実機、実際のGoogle認証や権限、第三者全項目をこの試験だけで確認したことにはなりません。

## 担当者と準備

OFFLINE-3P-03：開発者以外の判定担当者が、実行者・判定者、日時、対象コミット、作業ツリーの変更状況、`gas/Code.gs` と `scripts/test_gas.cjs` のハッシュを記録します。技術担当が実行を補助した場合はその氏名・役割を判定担当と分けて記録します。この時、共有記録に実名や認証情報を載せず、組織内の決められた方法で役割を識別します。試験プログラムは架空情報のみを生成します。

OFFLINE-3P-04：Node.js 24.12以上と、対象のソース・テスト一式を準備します。リポジトリの場所を確認した上でPowerShellを開きます。結果の上書きを避けるため、既存の出力先を再利用しません。以下の`outputs`はローカル保存先です。Calendar権限の追加、デプロイ、実Googleへのログイン・アクセスは不要です。

```powershell
Set-Location 'C:\Users\kanta\GitHub\eigo-taxi-management'
node --version
git rev-parse HEAD
git status --short
Get-FileHash -Algorithm SHA256 gas/Code.gs, scripts/test_gas.cjs
$env:EIGO_TEST_OUTPUT_DIR = 'outputs/third-party-gas-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
if (Test-Path -LiteralPath $env:EIGO_TEST_OUTPUT_DIR) { throw '出力先が既にあります。別名を指定してください。' }
node scripts/test_gas.cjs
$LASTEXITCODE
```

OFFLINE-3P-05：実行環境がNode.js 24未満なら、24.12以上の実行ファイルを用意してから行います。`node`の代わりに確認済みのNode.js実行ファイルのフルパスを使っても構いません。作業ツリーに未確定変更があればハッシュと差分の確認なしにコミット番号だけで対象版と扱いません。正本・他人の編集をリセットしないでください。

## 実行後の読み取りと判定

OFFLINE-3P-06：コマンド終了コードが0で、末尾に `GAS: 70/70 passed` と表示されたことを確認します。結果JSONの `counts.total`・`counts.passed`・`counts.failed`、個々の`results`、`sourceHashes`、`limitations`と `executedAt` を読み、失敗がないことと記録したソースハッシュが一致することを独立判定者が確認します。70という件数はこの版のローカルケース数で、将来変更された場合は対象版と結果JSONで確認します。

```powershell
$result = Get-Content -Raw -Encoding UTF8 (Join-Path $env:EIGO_TEST_OUTPUT_DIR 'latest.json') | ConvertFrom-Json
$result | Select-Object suite, executedAt, mode, counts, sourceHashes, limitations | Format-List
$result.results | Where-Object { $_.status -ne 'PASS' } | Format-Table id, status, detail
```

OFFLINE-3P-07：記録に残すのは、対象版・ハッシュ、担当者の役割、実施日時、上記結果の要約と保存先、未確認範囲です。JSON内の架空キーは実際の認証情報ではありませんが、実ユーザーの認証情報は画面や証跡に追加しません。次の対応は「候補」であり、正本の各期待条件をすべて覆うことを意味しません。

| 正本の関連項目 | 模擬で確認できる一部 | 特に残る確認 |
| --- | --- | --- |
| AT-07 | GAS-64：送り種別・17:30・予約1行・残数不変 | 実画面・実シート・実Calendar・正本全条件 |
| AT-08 | GAS-65：往復予約1行・残数7、完了後5 | 実画面・実Google連携・正本全条件 |
| AT-11 | GAS-66：対象の取消・2人の残数不変・他行不変 | 管理画面の再表示・実Google連携 |
| AT-13・15 | GAS-13：片道の完了で残数7→6、同ID再要求で消費0 | 実画面と完了時刻・実データ排他・第三者判定 |
| AT-14 | GAS-14：別架空生徒の往復完了で2枚消費、GAS-65：7→5 | 画面・実台帳・実行セッションの独立確認 |
| AT-16 | GAS-15：取消済み予約の完了を拒否し状態不変 | 実権限・実台帳・画面での確認 |
| AT-17 | GAS-18・19：不正値を拒否し副作用なし | UI入力、値の通信・シリアライズと正本全条件 |
| AT-18 | GAS-25〜31：架空の失敗注入と補償・再試行の一部 | クライアント5更新のHTTP失敗・不正JSON・UI維持等 |
| AT-19 | GAS-02〜04：未認証の要求拒否の一部 | 実画面非表示・台帳未生成・ログアウト後の情報消去・実認証失効 |
| AT-20 | GAS-06〜09、50：架空の家庭別フィルタと直接操作の拒否 | デモUI、実Firebase本人認証・実家庭間分離 |
| AT-27 | GAS-17：疑似的なロック競合と再試行 | 実GASの並行実行・2管理者端末での観測 |

OFFLINE-3P-08：`scripts/run_acceptance.cjs` は旧画面のログイン欄セレクターを含み、現行画面との適合が未確認です。また実行時に既存の `docs/acceptance/latest-run.json` を更新します。現行の第三者向け手順としてそのまま実行せず、改修・安全性検証後に別途案内します。各ATの技術操作が未確定の箇所は上記の模擬確認で一部補助できますが、元の実施手順の保留を自動解除しません。

## 開発側による実行記録

OFFLINE-3P-09：2026-11-03、日本時間03:04頃、Node.js 24.22.1で隔離した別出力先に実行し、GAS-01〜70が70/70成功、終了コード0でした。[結果JSON](../../outputs/noncalendar-thirdparty-20261103/2026-11-02T18-04-29-713Z/gas-results.json)。これは開発側が本手順の実行可否を確かめた記録で、第三者本人による受入結果は0/30のままです。実Google・Calendar接続、実環境の変更、Calendar権限追加、本番開始は行っていません。
