# 検証用Calendar権限の確認結果を正本へ反映する最小変更案

2026-11-07 17:11:51 JST、会社の検証GASで `verifyAcceptanceCalendarReadOnly` の実行が成功した。保存した実行画像で検証プロジェクト名、関数、JST時刻、対象ID・タイムゾーン一致のログを確認した。実行した共通関数は `Calendar` スコープの `NOT_REQUIRED`、ID一致、実行者による所有、非プライマリの検査がすべて成功した場合にのみ復帰する。17:15 JSTに開発担当が検証Webアプリの既存配備をv4からv5に更新し、既存URL・実行者・アクセス設定を維持したことを確認した。公開版v5に一時ラッパーは含まれていない。

## 採用の根拠

| 証跡 | 値 |
| --- | --- |
| `outputs/customer-ready-20261107/calendar-read-result.json` | SHA-256 `84e69f48bab9c43fa0399abc93a60e9e2f60f72e6dc882e4864dcf3e8860d20c` |
| `outputs/customer-ready-20261107/calendar-read-pass.png` | SHA-256 `f230eafc3cb0a117f32f0a429ea22d445d49e7f5ae79b25ab89741f379b11d8c` |
| 実行時の `gas/Code.gs` | SHA-256 `e39555d3540a22e1db6b20bf7885d6ee95a4e0ae11eace6e3fb29bccd3f6fef6` |
| 実行時の一時ラッパー | SHA-256 `0fd947590b561f36b93ad1b61d950b1ce685d1d1a8a1d1792e4a1ff5b901e1f9` |

根拠となるJSONで `status=PASS`、`scriptProject=company-owned verification project`、`calendarScopeAuthorizationStatus=NOT_REQUIRED`、`expectedCalendarMatched`・`timeZoneMatched`・`ownedByDeployer`・`notPrimaryCalendar` がすべて `true`。`eventsCreated`、`sheetsModifiedByProbe` は両方とも0。開発担当が実行画像とハッシュを照合して、この観測を現行基準へ採用できる。公開Webアプリの予約・取消の成否にはその操作の証跡が必要で、同意ダイアログの操作時刻はこの記録の対象外。

## コード差分

1. `scripts/traceability.py:11` の `FIXED` 内で **`calendarPermissionAdded=False` だけを `calendarPermissionAdded=True` に変更**する。他のFIXED項目と顧客PASSの証跡検査は維持する。既存 `acceptance_summary` はtrue値を表示できる。`scripts/bootstrap_traceability.py:51` は2026-10-23-r1用の一度限りの移行コードで、変更や再実行は不要。
2. `scripts/test_traceability.py` に下記1件を追加する。FALSEへの誤った巻き戻しを検出し、既存の `TRACE-01` で現行のTRUE正本が受理される。関数はテスト用のregistryコピーしか変更しない。

```python
 case('TRACE-32',lambda:reject(lambda x:x['facts'].update(calendarPermissionAdded=False),'FACT_CONFLICT'))
```

3. `docs/traceability/registry.json` で事実を `calendarPermissionAdded: true` にし、`TRACE-32` をREQ-38・TEST-38に既存形式で双方向に登録する。本番 `productionStarted=false`、`release=HOLD`、すべての顧客項目 `NOT_RUN` と0/6は維持する。権限・配備・実予約や取消の結果はそれぞれの証跡にひも付ける。この変更は過去のJSONを実行都度検査する新機能を追加しない。

## 再検証範囲

- 既存の `validate(..., check_files=False)` を使ったメモリ内試行で、変更前の検査器がtrueを拒否すること、該当FIXED値変更後はtrueでエラー0件、falseで `FACT_CONFLICT: calendarPermissionAdded` 1件となることを確認した。ディスク上のソース・正本は変更していない。
- 既存 `TRACE-01`〜`TRACE-31` の期待結果は変わらない。新しい仕組みや証跡ファイル読み取りがないため、顧客テストの一時rootのfixtureも変更不要。予定件数は32件。
- `TRACE-15`〜`TRACE-31` の17件が既存独立レポートで検査器・テスト両方のSHAを要求する。レビュー時に32件すべてを新しい出力フォルダーで実行し、既存17件と新規1件を新しい独立レポートへ登録する。`TRACE-01`〜`TRACE-14` は既存正本に個別の証跡参照がない。過去の独立レポートは保存する。
- 現行のAIソースレビュー方針に従って変更した検査器・テストを独立レビューし、実行時のソースSHAを確かめてから該当2ファイルの基準を更新する。正本から文書と索引を再生成し、PPT・受領記録・登録ハッシュを対応させた後に `npm run docs:check:strict` で照合する。

## 同一アカウントの顧客向け手順

本人が指定の会社Googleアカウントを使い、開発者が別の確認済み管理者で4回切り替える。保護者① CUST-01〜03 → 管理者① CUST-04 → 保護者② CUST-05の残少案内 → 管理者② CUST-05の追加とCUST-06管理者側 → 保護者③ 12枚・案内消失とCUST-06家庭側。保護者へ戻すごとに新しい個別URLを案内する。顧客ガイドを更新する際は生成元 `scripts/traceability.py` の `customer_guide` にある「2役の利用準備は未確定」「2つのブラウザープロフィール」もこの決定に合わせ、実際の準備状況と担当者・実施日の案内を反映する。

この段階で作成した変更案は本メモだけで、検査器やテスト、正本、基準の更新は実施していない。
