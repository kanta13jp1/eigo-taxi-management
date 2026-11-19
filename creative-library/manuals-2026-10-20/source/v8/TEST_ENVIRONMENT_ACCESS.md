# 検証環境のログイン手順

更新日: 2026-10-20（JST）。MightyLINKの検証担当者向けです。教室の本番環境・本番保護者への配布手順とは別です。

## 2種類のURL

| 用途 | URL・入力先 |
| --- | --- |
| ブラウザーで開く画面 | https://eigo-taxi-test.web.app/ |
| ログイン画面の「教室の接続先URL」へ貼るGAS URL | https://script.google.com/macros/s/AKfycbznxkg_f_7ddHdopFZfN0OlFDsxoFoi67OslKNQ93ipkWZLq-tj1jAsxz_uxNo2jBtwFg/exec |

画面URLを「教室の接続先URL」に入れないでください。GAS URLを直接開いてもログイン画面にはなりません。

## 管理者としてログイン

1. 上記の画面URLを開き、「教室の接続先URL」へ上記GAS URLを貼ります。
2. 既存キーを作成したWindows端末・同じWindowsユーザーで、リポジトリのフォルダーから次を実行します。

```powershell
Set-Location 'C:\Users\kanta\GitHub\eigo-taxi-management'
.\scripts\prepare_at23_access.ps1 -Action CopyKey -UserId admin-01
```

3. 実行すると既存の検証用キーがクリップボードに入ります。**PowerShellの表示文やコマンドをコピーせず**、画面の「アクセスキー」欄を選び、そのまま **Ctrl+V** で貼り付けます。
4. ログインを押し、管理者画面であることを確認します。利用後はログアウトします。
5. 貼付後、クリップボードを消す場合は次を実行します。

```powershell
.\scripts\prepare_at23_access.ps1 -Action ClearClipboard
```

キーそのものをチャット、共有資料、スクリーンショットへ記録しません。

## 検証用の利用者と操作の違い

| UserId | 用途 |
| --- | --- |
| `admin-01` / `admin-02` | 独立した管理者の検証 |
| `parent-01` / `parent-02` | 家庭A / 家庭Bの分離検証 |

別の検証利用者が必要な場合は、上記コマンドの `-UserId` だけを対象IDへ変更します。実保護者へこの管理者キーや検証キーを共有しません。

- `-Action CopyKey`: 指定利用者の既存の**生のログインキー**をクリップボードにコピーします。
- `-Action Prepare`: GASのScript Propertiesへ登録する **AUTH_USERS_JSON設定**をコピーします。ログイン欄へ貼る値ではありません。通常のログインのために再実行する必要はありません。
- `admin-01` などのID自体や、SHA-256ハッシュもログインキーではありません。

## 保存場所と別端末の場合

既存キーは `%USERPROFILE%\.codex\private\eigo-taxi-at23-access.json.dpapi` にWindows CurrentUser DPAPIで暗号化保存されています。リポジトリには保存しません。同じ端末・同じWindowsユーザーで利用してください。別端末・別Windowsユーザーへ暗号化ファイルをコピーしても、そのまま復号できません。

保存ファイルがない、復号できない、またはログインできない場合は検証設定の管理者へ確認します。`Prepare` で新しいキーを作っても配備済みGASの認証設定とは自動同期されないため、自己判断で作り直さないでください。本番は教室側のGoogle環境、正式な接続先URL、利用者ごとの専用キーを別途準備します。

## 確認済みの範囲

AT-23はPASS、AT-24〜30の7件は未合格です。Calendar権限は未付与です。このログイン案内の更新は追加受入の合格や本番利用開始を意味しません。予約・取消の実カレンダー検証は別の受入手順で進めます。

関連: [認証設定](GAS_AUTH_SETUP.md) / [管理者マニュアル](ADMIN_MANUAL.md) / [最新進捗 Step 05](progress/2026-10-20-step-05.md) / [PowerPoint資料](deliverables/2026-10-20-manuals/README.md)
