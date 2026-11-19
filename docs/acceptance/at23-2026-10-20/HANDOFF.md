# AT-23 実Google準備・承認待ち

2026-10-20 JST。判定: **BLOCKED / OAuth承認待ち**。AT-23合格ではない。

## 実施済み

- Edgeの会社アカウント `k-umezawa@ml-mightylink.com` で元Sheetと紐付けGASを読み取った。
- 元Sheet: `1M5MQYwyxw8FeJNXRPYLrhrakke16TV-b7vcvSkMMrKE`。3シートの行数は見出し込み3 / 4 / 1。空台帳ではない。
- 元GAS: `1_wbO-fOk4as_UafjM2S9dA6HklDh0yfIYcynJ9q3ENVSyYiT7troiViU`。UI全選択・コピーで取得した旧コードはAUTH_USERS_JSONを含まない旧版。
- 元のコードを `original-bound-Code.gs`、元台帳を `original-workbook.xlsx` に保存。元資源は変更していない。バックアップは元データを含むため外部報告の添付には使わない。
- 元Sheetの「コピーを作成」で非公開の検証コピー「Mighty AT-23 検証専用 2026-10-20」を作成。「同じユーザーと共有する」は未チェック。UIでコピーの非公開表示を確認。保存先変更画面は表示されず、元と同じプロジェクトフォルダー内に作成した。
- 検証Sheet: https://docs.google.com/spreadsheets/d/1hNjywlyQfTvqcgSys8iH7JH5Ru0dYLM9fA7-mGOOSO4/edit
- 検証bound GAS: https://script.google.com/u/2/home/projects/1AnWQ_1itiEgyEYpmfTFM7HkgmTXu5RsW4H-ahnf3N-TplINguEgCaTrh/edit
- 検証GASだけにローカル正本 `gas/Code.gs` を保存し、再読込後に全コードをコピーして改行正規化後の完全一致を確認。`saved-source-verification.json` に記録。
- `initSpreadsheet` を実行し、Googleの「承認が必要です」→「権限を確認」でOAuth選択画面まで進めた。権限は一切選択・付与していない。初期化は未完了。

## 現在表示されている承認

対象アカウント: `k-umezawa@ml-mightylink.com`。アプリ名は「無題のプロジェクト」（検証コピー側）。

1. Google スプレッドシートのすべてのスプレッドシートの参照、編集、作成、削除。
2. Google カレンダーを使用してアクセスできるすべてのカレンダーの表示、編集、共有、完全な削除。

双方未チェック。「次へ」未クリック。AT-23の初期化だけにはカレンダー権限は不要なので、主担当はSheetsのみの部分承認を提案する。ただしSheets権限も全スプレッドシートに及ぶため、ブラウザー操作ポリシーの「セキュリティ上重要なアクセスを新規付与」に従い操作直前のユーザー確認が必要。承認後の初期化成功は実測で確認する。

## 未実施

初期化2回と既存値保持、欠落3シート作成の実測、AUTH_USERS_JSON/個別キー設定、Webアプリ配備、Web生徒登録1行の保存。新規アクセスキーのブラウザー入力はユーザーへの引継ぎが必要。実カレンダーへの操作はしていない。

## ブラウザー引継ぎ・証跡

- 検証Sheet tab `1750956561`、検証GAS tab `1750956564`、OAuth tab `1750956567` をmarkHandoff済み。
- 旧資源確認用に追加したtab `1750956555` / `1750956558` は読取りのみ。主担当の既存tab `1750956552` / `1750956549` は操作していない。
- `test-copy-created.png`: 非公開検証コピーの作成後画面。元からコピーした行が映るため、外部向けには必要に応じて適切な範囲を選ぶ。
- OAuthの`screenshot`と`getScreenshot`は各1回、CDP Page.captureScreenshotの5秒タイムアウト。承認画面画像は未保存。承認内容はAXで確認した。画像保存失敗を権限付与成功と扱わない。
- OAuth URLのクエリは一時認証情報を含みうるため、記録や外部報告には転載しない。

次は主担当による具体的権限の確認依頼。承認されるまでは選択・送信しない。AT-24以降へ進めない。
