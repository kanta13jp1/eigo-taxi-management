# 11月10日からの継続累計　実装修正7件・開発側受入試験7項目を実施

11月10日に各4件、11月11日に各3件を実施した。先行2修正はClaude Code Fable 5.2の対応分（依頼者申告）、追加5修正はCodexの対応分。第7件まで検証サイトへ公開した。顧客本人による確認は0/6件。

| 実装修正 | 担当 |
|---|---|
| 予約時・完了時のチケット消費案内 | Claude Code Fable 5.2 |
| ログイン入口を間違えた場合の案内 | Claude Code Fable 5.2 |
| 匿名デモの保存先を明示 | Codex |
| 残少警告を2枚以下に統一 | Codex |
| 日付変更・タブ復帰時の当日一覧更新 | Codex |
| チケット追加金額を1円単位で入力可能に修正 | Codex |
| 生徒登録時、初期チケット枚数の小数を切り捨てて登録する不具合を修正 | Codex |

[先行6項目の記録](2026-11-11-cumulative-six.md)。AT-24・25は実Google管理者による同一予約1件の登録・取消、AT-28はバックアップからの復旧を部分確認、AT-04・12・05は模擬環境と公開匿名デモで確認した。

## AT-02 生徒登録

11月11日15:26 JST、実Reactフォームと匿名デモAPIを架空のブラウザー保存領域で実行した。旧版では1.5枚入力後、表示・保存値が1枚となり、生徒が1人増加。修正版では1.5の表示を保持し、1.5・空欄・負数の送信は0件。10枚を指定した登録で3人から4人に増え、氏名・保護者名・電話・住所・メモ・初期残数が保存値と一致した。[旧版の再現](../../outputs/student-balance-20261111/before.json)・[修正版](../../outputs/student-balance-20261111/at02.json)。

直前の検証サイト版を複製し、変更したソースはAddStudentModal.tsxの1ファイル。SHA-256は `8617f0e64563a23b5965eaa78d1f8fafe2be766cd4408ab3e148d897b4c0ac90`。独立ソースレビュー、TypeScript型検査、Firebase向けビルド、対象ファイルのoxlintを通過した。候補Digestは `1b37c0114f89e9ae7521a531e405ac8d72db657fc7ed36ebe7834b71a84a5c2f`。

## 再認証と検証サイトへの反映

初回の配備は検証用アカウントの再認証が必要となり失敗した。15:27 JSTの公開版は第6件版 `f645f61220bdc2bb` だった。[初回の失敗記録](../../outputs/student-balance-20261111/firebase-deploy-before-reauth.json)・[当時の公開版](../../outputs/student-balance-20261111/public-release-readback.json)。

会社アカウントの再認証後、凍結済みのソースと配布物38ファイルを再照合した。検証専用のHostingターゲット `mighty-test`（プロジェクト `eigo-taxi-app`、サイト `eigo-taxi-test`）に配備し、15:45 JSTに公開7応答すべてのHTTP 200とSHA-256一致を確認した。検証版は `5b8000b179c3f5f1`。[配備記録](../acceptance/deployment/releases/5b8000b179c3f5f1/firebase-deploy.json)・[公開7応答の照合](../acceptance/deployment/releases/5b8000b179c3f5f1/public-verification.json)。

公開サイトの管理者デモで、架空生徒の氏名・保護者・送迎先を入力した。初期枚数の欄は10枚。1.5枚に変更して送信すると、ブラウザーが近い有効値は1と2であると表示し、登録画面が残った。10枚に直して登録すると、生徒数が3名から4名に増え、新しい生徒に保護者・送迎先・残り10回が表示された。この操作の保存先は匿名デモ用のブラウザー内である。[小数拒否の画面](../../outputs/student-balance-20261111/public-fractional.png)・[登録結果の画面](../../outputs/student-balance-20261111/public-registered.png)・[公開画面の記録](../../outputs/student-balance-20261111/public-ui.json)。

第7件で顧客用のGoogle台帳・Calendar・GASを変更する操作は行っていない。小林さん本人の確認6件とAT-28の設定復旧は引き続き未完了。本番運用は保留している。

11月11日15:48 JST、管理者が検証サイトの利用登録一覧を再取得した。管理者2件と検証専用3件の計5件が有効だった。小林さん用とBrenda先生用の2件の表示は「初回ログイン待ち」。登録情報を編集・保存する操作は行っていない。[検証環境の利用登録一覧](2026-11-11-test-account-list.md)。

[小林さん向けの報告文（未送信）](../../outputs/student-balance-20261111/小林さんへの報告.txt)・[累計7件の打ち合わせ用追補](../deliverables/2026-11-10-premeeting/progress-2026-11-11-cumulative-seven.pptx)。追補の図は先行の当日一覧試験の公開画面。PowerPointファイルは再取込・構造検査・描画・独立の内容および画像レビューを実施した。PowerPointアプリ上の表示は未確認。

工程全体の直近の採用記録は11月11日朝の正本r19、配布資料v36（12冊・214頁）。当時の工程横断検査はPASS・本番運用保留。第7件についての新たな工程横断検査と正本採用は、この配備の確認範囲に含めていない。[r19採用記録](2026-11-11-r19-adoption.md)。

共有表の検証結果履歴73行に第7件の公開確認、74行に登録5件の再確認を記録した。全18セルの一致、顧客6件の判定・実施欄と合格集計式の保持をAPIで読戻した。[読戻し](../../outputs/student-balance-20261111/shared-after-reauth.json)。
