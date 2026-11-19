# 送迎検証GASのCalendar権限と接続先

2026-11-07 JST。対象は送迎の検証環境。利用者は検証用Calendar権限追加を解禁した。Googleの同意完了、検証先への配備、実予約・取消の合格はそれぞれ実測で判定する。

## 既存の保留理由

10月20日のAT-23は台帳の初期化と保存の試験で、Calendarを使用しなかった。当時のOAuth画面はアクセス可能な全カレンダーに及ぶ表示で、旧コードは会社の実行アカウントの既定カレンダーを直接使用していた。Step 05は次のAT-24の前に書込先を分離すると記録している。[当時のOAuth画面の記録](../../docs/acceptance/at23-2026-10-20/HANDOFF.md)・[AT-23完了時の記録](../../docs/progress/2026-10-20-step-05.md)。

## 対象の特定

| 項目 | 照合した値 |
| --- | --- |
| 検証台帳のSpreadsheet ID | `1hNjywlyQfTvqcgSys8iH7JH5Ru0dYLM9fA7-mGOOSO4` |
| 上の台帳に紐付くApps ScriptのScript ID | `1AnWQ_1itiEgyEYpmfTFM7HkgmTXu5RsW4H-ahnf3N-TplINguEgCaTrh` |
| 検証WebアプリのDeployment ID | `AKfycbznxkg_f_7ddHdopFZfN0OlFDsxoFoi67OslKNQ93ipkWZLq-tj1jAsxz_uxNo2jBtwFg` |
| 公開フロント | `eigo-taxi-test.web.app` |

Step 05に3つのIDが揃う。v2は同じエンドポイント、Googleログイン導入時のv3でも既存URLを維持した。Step 12はv4への更新を記録し、現行フロント設定にも同じDeployment IDがある。この照合はローカルの記録に基づく。新配備の際は管理画面またはApps Script APIで現在のバージョンと対象のDeployment IDを再照合する。[Step 05](../../docs/progress/2026-10-20-step-05.md)・[v2配備証拠](../../docs/acceptance/role-portals-2026-10-20/gas-deployment.json)・[v3](../../docs/progress/2026-10-22-step-09.md)・[v4](../../docs/progress/2026-10-22-step-12.md)・[フロント設定](../../src/deployment-config.ts)。

## 再現できた現象

変更前のGAS VMは70件すべて合格した。追加の合成データによる観測では、設定が空でも予約時に既定カレンダーを取得した。取消時は保存済みイベントIDが他カレンダーを指す等で指定先から予定を取得できない場合にも、台帳を取消済みにして成功を返す。ID空欄でも同じ挙動だった。過去の復旧試験ではイベントIDのない合成行も作っている。既存行について会社の通常予定を検索・削除する自動移行は行わず、該当行の担当者照合を案内する。[既存70件](baseline/latest.json)・[追加観測](baseline-probe.json)・[復旧試験の記録](../../docs/acceptance/backup-restore-2026-10-23/README.md)。

## ローカルで実装した変更

1. 送迎検証GASのScript Propertiesの `TEST_CALENDAR_ID` を読む。新たに作成するか特定した非公開の検証専用サブカレンダーのIDを設定し、リクエストやフロントの引数からは受け取らない。実装は配備者が所有する専用サブカレンダーを対象とする。書込権限を共有された非所有のカレンダーも拒否する。既存の認証設定・台帳のスキーマを保持する。
2. 作成・取消とも認証・入力・対象行・再試行判定の後、シート変更や書込ガード設定の前に同じ補助関数を呼ぶ。空の設定なら失敗を返す。指定IDを `CalendarApp.getCalendarById(id)` で取得し、null、ID不一致、`calendar.isMyPrimaryCalendar()` が真、または `calendar.isOwnedByMe()` が偽なら処理を停止する。例外時にも既定への切替はしない。専用カレンダーを選んだことは設定時にID・名称を照合する。primary判定だけでは別のサブカレンダーとの区別はつかない。[CalendarApp](https://developers.google.com/apps-script/reference/calendar/calendar-app#getCalendarById(String))・[Calendar](https://developers.google.com/apps-script/reference/calendar/calendar#isMyPrimaryCalendar())。
3. 取消は台帳に保存されたIDを使い、検証カレンダー内だけで予定を取得する。ID空・見つからない場合は書込み前に照合が必要な理由を返して対象行を保持する。すでに取消済みの同じ操作は従来通り成功する。既存のロック、失敗時の巻戻し、不確定な外部更新のガードを維持する。合成データで予約を作る前の既存行に一括変更をかけない。
4. 現行CalendarAppの作成・削除でGoogle公式が列挙する書込可能な `https://www.googleapis.com/auth/calendar` を既存の2スコープに追加する。これを記述するだけでは実行者の同意は完了しない。スコープの付与範囲とコードが選択するカレンダーの範囲は別々に確認する。Googleは適合するREST APIのスコープも認めているため、このスコープを唯一可能な実装とは扱わない。[予定作成](https://developers.google.com/apps-script/reference/calendar/calendar#createEvent(String,Date,Date,Object))・[予定削除](https://developers.google.com/apps-script/reference/calendar/calendar-event#deleteEvent())・[Authorization scopes](https://developers.google.com/apps-script/concepts/scopes)。

実装は `ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL, [calendarScope])` で配備者の同意状態を確認し、対象が確認できるまで書込ガードを設定しない。Google公式はこのオーバーロードで指定スコープの認可状態を取得できると定義している。[ScriptApp](https://developers.google.com/apps-script/reference/script/script-app#getAuthorizationInfo(AuthMode,String))。

## ローカル試験結果

旧実装は既存70件合格。受入先のモックと追加4件を先に適用した時点で56/74件合格。コード・マニフェストを修正して74/74件合格し、JavaScriptとマニフェストJSONも解析した。新しい4件は設定未登録・空白、スコープ不足、取得不可/例外、primary、所有者不一致、ID不一致、台帳イベントID空/他カレンダー、リクエストによる接続先上書き、再送を含む。対象行や予定を変更できない場合は書込ガードの設定前に拒否した。[変更前](baseline/latest.json)・[失敗の再現](red/latest.json)・[最終74件](green/latest.json)・[レビュー差分](calendar.patch)・[ソースSHA-256](source-sha256.json)。

## 配備・実環境検証


- 旧証跡生成器のTC-G04（`scripts/run_all_e2e_evidence.cjs` 545行付近）は既定カレンダー前提を持つ。この作業の変更対象から外れており、新しい接続先をチェックするように別途更新する。
- 実環境では実行アカウントが同意したこと、専用カレンダーID、検証台帳と配備バージョンを照合する。公開検証サイトの通常ログインから合成データで1件作成し、台帳イベントID・予定説明の予約ID・JST日時・場所を照合する（AT-24）。同じ画面で取消後、対象イベントだけが消え、台帳が取消済み、別予定とチケット残数が同じで、再読込しても状態を維持することを確認する（AT-25）。
- 結果の不明な外部更新では同じ予約を繰り返さず、対象予約・予定・既存ガードを照合する。検証用フロントの公開確認やローカルVMの合格だけでOAuth付与または実予約同期が完了したと判定しない。
