# 11月10～11日　累計8件の実装修正と開発側の受入試験8項目

11月10日と11日に各4件を修正し、各日4項目の開発側受入試験を実施した。先行2修正の担当は依頼者申告による。

| 件 | 実装修正 | 担当 |
|---|---|---|
| 1 | 予約時・完了時のチケット消費案内 | Claude Code Fable 5.2 |
| 2 | ログイン入口を間違えた際の案内 | Claude Code Fable 5.2 |
| 3 | 匿名デモの保存先を明示 | Codex |
| 4 | 残少警告を2枚以下に統一 | Codex |
| 5 | 日付変更・タブ復帰時の当日一覧更新 | Codex |
| 6 | チケット追加金額を1円単位で入力可能に修正 | Codex |
| 7 | 生徒登録時に初期枚数の小数を切り捨てて保存する不具合を修正 | Codex |
| 8 | チケット追加時に入力途中の金額が0円として保存される不具合を修正 | Codex |

AT-24・25は実Google管理者のテスト予約1件で登録・取消を確認した。AT-28はバックアップ復旧の部分確認で、保護設定の復旧が残る。AT-04・12・05・02は模擬環境と公開匿名デモで確認した。[先行7項目の試験記録](2026-11-11-cumulative-seven.md)。

## AT-17 不正なチケット追加拒否

旧公開版の匿名デモで受取金額に1を入力し末尾にeを押すと、金額が0に書き換わり、送信で架空生徒の残数が12回から22回に増えた。旧版のReactフォーム・デモAPIでも、数値入力欄から空文字を受け取った後に0円の購入履歴が追加された。[旧版のローカル試験](../../outputs/ticket-amount-20261111/before.json)。

修正版では金額を文字列のまま保持し、送信時に空欄・非整数・負数を検査する。実フォームとデモAPIによるローカル試験では、枚数の負数・0・小数・NaN・Infinity・101、および金額の負数・小数・NaN・Infinityをすべて拒否し、各回で残高7回・購入履歴が不変だった。フォームの空欄送信も拒否された。明示した0円と4,980円は、それぞれ10回分の購入として指定額で保存された。[実行記録](../../outputs/ticket-amount-20261111/at17.json)・[試験コード](../../outputs/ticket-amount-20261111/at17.cjs)。

## 検証サイトへの反映と公開画面

前回配信版から変更したソースは AddTicketModal.tsx の1ファイル。独立レビュー・型検査・Firebase向けビルド・対象ファイルのlintを通過。ソースDigestは `8de07666ce42e0d1f628ff688dadc49b2aae82913765c7f67449367c46cc0098`。Firebaseプロジェクト eigo-taxi-app の検証専用サイト eigo-taxi-test に、ターゲット mighty-test として配備した。Hosting版は `aeb3c6dc735ff84d`。切替直後に旧応答があり、16:04 JSTの再照合で公開7応答すべてがHTTP 200、SHA-256一致だった。[配備記録](../acceptance/deployment/releases/aeb3c6dc735ff84d/firebase-deploy.json)・[切替直後の記録](../../outputs/ticket-amount-20261111/public-propagation-first.json)・[公開7応答の照合](../acceptance/deployment/releases/aeb3c6dc735ff84d/public-verification.json)。

公開管理者デモの金額欄に1eを入力して送信すると、「数字を入力してください。」と表示され、入力画面に残り、残数は22回だった。0に直して10回分を送信したときにだけ新残高32回が表示された。[不正入力を拒否した画面](../../outputs/ticket-amount-20261111/public-invalid.png)・[0円を明示した結果](../../outputs/ticket-amount-20261111/public-zero.png)・[公開操作記録](../../outputs/ticket-amount-20261111/public-ui.json)。

今回の確認は匿名デモのブラウザー内で実施し、顧客用Google台帳・Calendar・GASは更新していない。小林さん本人による顧客確認6件は0/6件で、本番運用は保留。直近の工程全体の採用記録は11月11日朝の正本r19・配布資料v36（12冊・214頁）。第7・8件配信後の工程横断検査は今回の実施範囲外。[r19採用記録](2026-11-11-r19-adoption.md)・[利用登録の直近確認](2026-11-11-test-account-list.md)・[小林さんへの報告文（未送信）](../../outputs/ticket-amount-20261111/小林さんへの報告.txt)。

[打ち合わせ用の累計8件追補（PowerPoint）](../deliverables/2026-11-10-premeeting/progress-2026-11-11-cumulative-eight-v2.pptx)。初稿で不足していた担当表示を補い、修正版の構造検査・描画・独立目視レビューを実施した。PowerPointアプリでの表示は未確認。[レビュー記録](../../outputs/daily-eight-20261111/ppt/independent-review.json)。

共有表の検証結果履歴75行（VR20261111-06）へ公開確認を記録した。追加した9セルの一致と、顧客6件の判定・実施欄および集計式の保持を読戻し確認した。[共有表の読戻し](../../outputs/daily-eight-20261111/shared-readback.json)。
