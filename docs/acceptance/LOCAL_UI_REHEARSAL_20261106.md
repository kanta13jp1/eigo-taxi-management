# 現行画面のローカル模擬リハーサル

LOCAL-RUN-01：`scripts/run_local_acceptance.mjs` は、現在のApp・予約画面・ApiServiceのデモ経路をビルドして、新しいブラウザープロファイルで確かめる開発側の事前確認です。Google認証の関数は試験用の代替実装に置換します。実際のGoogleアカウント、GAS、スプレッドシート、Calendar、公開サイトへの受入テストではありません。開発者以外による30件の受入件数へ加算しません。

## 実施準備

LOCAL-RUN-02：Node.js 24.12以上、依存パッケージ、Playwrightと対応Chromiumが必要です。Nodeの版は `node --version` で確認します。リポジトリーのルートで実行し、出力先の親ディレクトリーを先に用意します。`--out` は未作成の子ディレクトリーを指定します。既存ディレクトリーは空でも拒否します。

LOCAL-RUN-03：標準のPlaywrightモジュールは `.manual-build-20261020/node_modules/playwright` を使用します。別のインストール済みPlaywrightを使う場合は `EIGO_PLAYWRIGHT_MODULE`、Chromiumの実行ファイルを指定する場合は `EIGO_CHROMIUM_EXECUTABLE` に絶対パスを設定します。これらはローカル実行ファイルの場所です。URL、アクセスキー、本人メール、パスワードは指定しません。

```powershell
node --test tests/local_acceptance_safety.test.mjs
node scripts/run_local_acceptance.mjs --out outputs/local-ui-run-YYYYMMDD-01
```

LOCAL-RUN-04：予約日は実行開始時点の日本時間の日付を使い、結果の `testDate` に記録します。日時固定の旧ランナーを置換実行したり、受入仕様の期待結果を自動改変したりするものではありません。`scripts/run_acceptance.cjs` と既存の `latest-run.json` は変更しません。旧ランナーは現行画面と不整合があるため、本手順から呼び出しません。

## 確認する内容

| ローカルID | 関連する受入観点 | 確認方法 |
|---|---|---|
| LOCAL-UI-01 | ログイン・未認証非表示 | 現在の管理者ログイン画面を表示し、台帳がないこととAPI拒否を確認 |
| LOCAL-UI-02 | 残数・家庭範囲 | 保護者デモで家庭に割当てられた生徒だけ表示・参照できることを確認 |
| LOCAL-UI-03〜05 | お迎え・送り・往復予約 | 現在の予約フォームを実際に入力・送信し、再読込後の保存と残数不変を確認 |
| LOCAL-UI-06 | 管理者代理予約 | 管理者デモのフォームから登録し、予約者がteacherになることを確認 |
| LOCAL-UI-07 | 保護者取消 | 新規予約を画面から取消し、再読込後の状態と残数不変を確認 |
| LOCAL-UI-08〜09 | 完了消費・再送 | 予約登録後にApiServiceを直接呼び、片道1枚／往復2枚と再完了時の追加消費0を確認 |
| LOCAL-UI-10 | 取消済み完了拒否 | ApiServiceを直接呼び、取消済み予約の完了拒否と残数不変を確認 |
| LOCAL-UI-11 | 不正枚数・権限 | 不正枚数の追加と保護者の管理操作をApiServiceで拒否確認 |
| LOCAL-UI-12 | モバイル幅 | 375pxのタッチエミュレーションでフォームを送信し横幅を確認 |
| LOCAL-UI-13 | ログアウト・再読込 | 画面のログアウト後、再読込しても台帳が表示されないことを確認 |
| LOCAL-UI-14 | 残少案内 | 架空残数7・3・2・1・0で、2以下のみMauro・Brendaへの連絡案内があることを確認 |

LOCAL-RUN-05：LOCAL-UI-08〜11のApiService呼出は、管理者の完了ボタンそのもののクリック試験やサーバー側排他制御を確認するものではありません。LOCAL-UI-12は実機試験ではありません。Google本人認証、実カレンダー予定、複数管理者の同時更新、実台帳のバックアップ復元は別途確認が必要です。

## 安全境界と結果の確認

LOCAL-RUN-06：ランナーは指定した新規ディレクトリーにのみ試験ビルド、スクリーンショット、`results.json` を作成します。HTTPサーバーは127.0.0.1の空きポートに限定し、そのorigin以外のブラウザーHTTPリクエストを遮断します。WebSocketは全件遮断し、Service Workerを許可しません。ビルド済みの試験ページを使うため開発サーバーのHMRはありません。実行前の意図的な無効ドメインのHTTP/WSプローブで、両者が遮断されることを確認します。プローブ以外の通信試行は別ログに残し、結果をFAILにします。

LOCAL-RUN-07：終了コード0だけでなく、`results.json` の `status` がPASS、全14結果がPASS、`changedSources`・`externalRequests`・`blockedSockets`・`pageErrors` が空、`guardSelfTest.status` がPASSであることを確認します。途中の例外・失敗・ソース変更は合格にしません。実行中に他担当がソースを編集した場合は、安定したソースで新しい出力先へ再実行します。`sourceHashes` と `buildHashes`、スクリーンショットのSHA-256で対象版と記録を照合します。

LOCAL-RUN-08：ブラウザーとHTTPサーバーは終了時に閉じます。失敗した実行の出力も上書き・削除せず、次の実行では新しい出力先を使います。既存の第三者実施表、共有表の合格件数、公開サイト・Firebase・GAS設定はこのランナーから更新しません。
