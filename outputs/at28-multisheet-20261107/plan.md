# AT28-MULTI-20261107: 3シートのブック単位バックアップ・復旧計画

状態: **PLANNED / 全項目 NOT_RUN**。計画作成時点ではGoogleファイル作成・コピー・スクリプト実行をしていない。

## 対象と合格の境界

会社Googleアカウントで新しく作る、架空データだけの非公開Googleスプレッドシート3ファイルを対象にする。実台帳、既存テスト台帳、小林さんの受入記録、`STU-CUST-20261107`、その送迎2件・残数5、既存のバックアップを開いて編集しない。アプリの接続先、GASの本体、registry、Calendar、公開設定、共有相手を変更しない。

これは**バックアップから新しいブックへ復旧し、復旧ブックを直接読み書きして使えることを確認する開発者の限定試験**。元のURLへのインプレース復元や、実アプリの接続先切替は含まない。ブックIDが変わるため、本番の復旧には別途、設定参照・GAS・共有権限・Web再取得の検証が必要。

AT-28の要求は「生徒・予約・購入履歴・カレンダーの整合を回復」であり、この架空ブック単独の成功でAT-28全体をPASSにしない。既存の[11/6記録](../../docs/progress/2026-11-06-at28-native-settings.md)では範囲貼り付けに条件付き書式ルールと列幅が戻らず、シート単位コピーではそれらを確認できた。今回は他シート参照・名前付き範囲・保護・ブック設定を含む**ファイル全体のコピー**を1方式だけ試す。

## 1回の実行手順

1. 新しい空白ブックを `AT28-MULTI-20261107-SOURCE` として作る。共有は制限付き、同じユーザーと共有は選ばない。アカウントが会社用であることを画面で確認する。以下の3シートだけを作る。
2. 合成データと全設定を用意し、保存完了を待つ。数式バー、ルール一覧、保護パネル、名前付き範囲、寸法・固定行、ファイル設定を記録する。任意で `capture-only.gs` を**この新しいブックに新規作成した専用bound Apps Script**に貼り、読取記録を採る。既存GASには貼らない。
3. SOURCEの「ファイル → コピーを作成」で `AT28-MULTI-20261107-BACKUP` を作る。3シートすべてがあることと保存完了を確認し、BACKUPの基準値・設定をSOURCEと照合する。BACKUPは以後読み取り専用の証跡として保持する。
4. **SOURCEだけ**で下表の破損操作を行い、破損した設定を記録する。既存ファイルやBACKUPを対象にしない。保護を解除する操作もSOURCEの合成範囲だけ。
5. BACKUPを開き「ファイル → コピーを作成」で `AT28-MULTI-20261107-RESTORED` を新しく作る。SOURCEからコピーしない。コピー元→復旧先のタイトル・URLと操作を記録する。
6. RESTOREDで下表をすべて読み取り照合する。表示だけでなく**数式文字列・ルール本体・設定値**を確認する。gid/名前付き範囲ID/保護IDはそれぞれ記録し、ブック間での同値を事前に仮定しない。
7. RESTOREDの `Inputs!B2` を `20` に変え、計算完了を待って下の期待値を確認する。次に `2` に変え、再計算と条件付き書式の非該当を確認する。最後に `10` に戻し、再読込後も元の計算結果と設定があることを確認する。各変更後に値・数式バーまたは任意のcaptureを記録する。
8. SOURCEが破損状態、BACKUPが基準状態のまま残ることを照合する。RESTOREDの入力変更がBACKUPへ逆流しないことを確認する。3ファイルは削除せず証跡として保持する。

認証が必要になった場合、任意のhelperで想定するのは**このブックだけのスプレッドシート権限**。Drive/Gmail/Calendar/外部サービス/全スプレッドシートへの追加権限を求められた場合、そのhelperの実行は中止してUIの読み取り証跡へ切り替える。コードはDriveサービス・URL取得・別ブック参照・トリガー・書き込みを含まない。ファイルのコピーはUIで行う。

## 合成データ（各シートA1へタブ区切りで貼付）

`Inputs`:

```tsv
ID	Quantity	UnitPrice	Status	Date
SYN-MULTI-20261107	10	1.25	Ready	=DATE(2026,11,7)
```

`Calc`:

```tsv
Metric	Amount
Direct	=Inputs!B2*Inputs!C2
Named	=BaseQty*Inputs!C2
Total	=SUM(B2:B3)
```

`Summary`:

```tsv
Metric	Amount
Total	=Calc!B4
Chain	=Calc!B2+Inputs!B2
Date	=Inputs!E2
```

先に `BaseQty` を `Inputs!B2` の名前付き範囲として作る。名前を作るまでは `Calc!B3` が名前エラーになるため、**全設定後**の計算結果を基準とする。

## 試験表

| ID | 項目・基準 | SOURCEでの破損 | RESTOREDで確認する期待 | 状態 |
|---|---|---|---|---|
| M01 | シート名・順序 Inputs / Calc / Summary、3シート | SummaryをSummaryDamagedへ改名 | 元の3名・順序、内部参照も元の式 | NOT_RUN |
| M02 | 直接参照 `Calc!B2 =Inputs!B2*Inputs!C2`、12.5 | B2を99に上書き、Inputs B2=999 | 元の式、Inputs B2=10、12.5 | NOT_RUN |
| M03 | 名前付き範囲 BaseQty→Inputs!B2、Calc B3=12.5 | BaseQtyを削除 | 名前・参照範囲・式・12.5が一致 | NOT_RUN |
| M04 | 連鎖参照 Calc B4=25、Summary B2=25、B3=22.5 | 破損後の値・エラーを記録 | 式は内部参照のまま、25/22.5 | NOT_RUN |
| M05 | Inputs D2: Ready/Done、無効入力拒否の入力規則 | 入力規則を削除、値Broken | 規則の範囲・項目・拒否設定、値Ready | NOT_RUN |
| M06 | Calc B2: 数値>10、背景#b7e1cdの条件付き書式 | ルールを削除 | ルール一覧に範囲B2・条件・閾値・色 | NOT_RUN |
| M07 | Calc B2:B4: ¥0.00、太字。Inputs E2/ Summary B4: yyyy/mm/dd | 対象を数値0.00、太字解除 | 書式・数式と日付2026/11/07が一致 | NOT_RUN |
| M08 | 全3シートの先頭1行を固定 | 固定解除 | 各シート先頭1行固定 | NOT_RUN |
| M09 | Calc列B=160px、行2=42px | B=100px、行2=21px | サイズダイアログで160/42を読み取消 | NOT_RUN |
| M10 | Calc B2:B4の範囲保護、説明AT28-SYNTHETIC、警告だけでなく編集制限「自分のみ」 | その保護を削除 | 範囲・説明・編集制限の種類・許可者をUI確認 | NOT_RUN |
| M11 | ファイル設定: locale日本、timezone東京/GMT+09、再計算「変更時」 | locale米国・timezone UTCに変更 | 日本/東京/変更時へ戻る | NOT_RUN |
| M12 | 復旧後の依存セル変更→再計算 | RESTOREDでのみB2=20→2→10 | 下表の全期待値・数式を維持 | NOT_RUN |
| M13 | 独立性・復旧元の由来 | SOURCEを破損状態で保持 | RESTOREDの更新中もBACKUP B2=10、SOURCE B2=999 | NOT_RUN |

M10は保護設定の保存・復旧の観測であり、共有していない第三者からの書込拒否テストではない。権限の継承や他ユーザーのアクセス可否は別途未検証。M11の変更後、日付の表示はlocaleの影響を受け得るため数式 `=DATE(2026,11,7)` と独自表示形式の双方を照合する。

| RESTORED Inputs B2 | Calc B2 | Calc B3 | Calc B4 | Summary B2 | Summary B3 | Calc B2の条件 |
|---:|---:|---:|---:|---:|---:|---|
| 10（基準） | 12.5 | 12.5 | 25 | 25 | 22.5 | >10、緑 |
| 20 | 25 | 25 | 50 | 50 | 45 | >10、緑 |
| 2 | 2.5 | 2.5 | 5 | 5 | 4.5 | 非該当 |
| 10（戻す） | 12.5 | 12.5 | 25 | 25 | 22.5 | >10、緑 |

## 記録・API captureのスキーマ

実測が得られた時だけ、各項目のactual、observedAt、operator、evidence（URL+gid+セル/設定パネル、画像パスまたはJSON）を追加する。API/Apps Scriptのログは合成範囲に限定し、メールアドレス・共有者名は保存しない。UIの保護許可者も公開資料では伏せる。

最低6段階: `source-baseline`, `backup-baseline`, `source-damaged`, `restored-baseline`, `restored-qty20`, `restored-qty2`, `restored-final-qty10`。各記録は別ファイル名とし、後のsnapshotで上書きしない。

```json
{
  "schemaVersion": 1,
  "experiment": "AT28-MULTI-20261107",
  "status": "NOT_RUN",
  "stage": "restored-baseline",
  "observedAt": null,
  "file": {"id": null, "title": null, "url": null, "copiedFromId": null},
  "workbook": {"locale": null, "timeZone": null, "recalculationInterval": null},
  "namedRanges": [{"name": "BaseQty", "sheetName": "Inputs", "a1": "B2", "id": null}],
  "sheets": [{
    "name": null, "sheetId": null, "index1Based": null,
    "sampleRange": null, "formulas": [], "values": [], "displayValues": [],
    "numberFormats": [], "fontWeights": [],
    "frozenRows": null, "columnBWidthPx": null, "row2HeightPx": null,
    "dataValidation": [], "conditionalRules": [], "protections": []
  }],
  "evidence": [],
  "limitations": ["sharing authorization not tested", "application pointer not switched", "Calendar not tested"]
}
```

認可済みSheets APIをすでに使える場合だけ、`spreadsheets.get` の下記のfields相当を取得できる。今回このためにAdvanced Service、Cloud API、OAuth scopeを追加しない。`includeGridData`よりfields指定が優先されるため、値も欲しい場合はdata部分を省かない。

```text
GET https://sheets.googleapis.com/v4/spreadsheets/NEW_SYNTHETIC_FILE_ID
ranges=Inputs!A1:E4&ranges=Calc!A1:B4&ranges=Summary!A1:B4
fields=spreadsheetId,spreadsheetUrl,properties(title,locale,timeZone,autoRecalc),namedRanges,sheets(properties(sheetId,title,index,gridProperties),conditionalFormats,protectedRanges(protectedRangeId,range,namedRangeId,description,warningOnly,requestingUserCanEdit,unprotectedRanges,editors(domainUsersCanEdit)),data(startRow,startColumn,rowData(values(userEnteredValue,effectiveValue,formattedValue,userEnteredFormat,dataValidation)),rowMetadata(pixelSize),columnMetadata(pixelSize)))
```

APIのrangeは0始まり・end排他なのでA1表記へ正規化して照合する。sheetId・namedRangeId・protectedRangeIdの変更は記録し、**対象名・対象範囲・数式の意味・ルールが保たれること**を基準にする。OAuth tokenをURL・ログ・成果物へ残さない。

## API一次資料（2026-11-07参照、実行ではない）

- [Google Sheets spreadsheets.get](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/get): 限定range、fieldsとgrid data取得の仕様。
- [Spreadsheet resource](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets): ブック設定、名前付き範囲、シート・セル・保護・寸法の構造。
- [sheets.copyTo](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.sheets/copyTo): 1枚のシートを別ブックへコピーするAPI。全ブック復旧の代替と仮定しない。
- [Drive files.copy](https://developers.google.com/workspace/drive/api/reference/rest/v3/files/copy): ファイルのコピーAPI。今回のhelperは使用しない。各設定の維持は今回の実測で判定する。
- [Apps Script Spreadsheet](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet): 読み取り用のSpreadsheet/NamedRange取得。
- [Apps Script authorization](https://developers.google.com/apps-script/guides/services/authorization): `@OnlyCurrentDoc`で認可範囲を限定できる。コードの自動解析がscopeへ影響するため、不要サービスのコードを混ぜない。
- [Protection](https://developers.google.com/apps-script/reference/spreadsheet/protection), [DataValidation](https://developers.google.com/apps-script/reference/spreadsheet/data-validation), [ConditionalFormatRule](https://developers.google.com/apps-script/reference/spreadsheet/conditional-format-rule): helperの設定読取根拠。

## 未確認のまま残すこと

実台帳の全体復旧、同じブックIDへの復元、保護者/管理者の権限・再取得、GASの参照IDやトリガー、Calendar整合、フィルター・印刷・グラフ・外部データ・他ユーザー編集はこの1回の合格条件に含めず、未確認として明記する。
