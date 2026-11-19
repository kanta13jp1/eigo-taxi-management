# 現行画面を使うローカル模擬ランナー（2026-11-06）

PROGRESS-20261106-RUNNER-01：旧 `scripts/run_acceptance.cjs` は固定過去日、現行にない接続先URL／キー入力欄・切替タブ、既存のlatest-run更新を含むため保留のまま保全した。別ファイル `scripts/run_local_acceptance.mjs` と専用fixture、安全ヘルパーを作成した。実App・ApiServiceのデモ経路をビルドし、Google認証は代替実装へ置換する。既存のアプリ実装・台帳・公開サイトはこの作業では変更しない。

PROGRESS-20261106-RUNNER-02：実行開始日の日本時間を予約日に使用し、専用ブラウザーで現在の画面からお迎え・送り・往復予約、管理者代理予約、保護者取消、再読込、残数表示、ログアウト後非表示を確認する。完了・不正入力の一部はApiServiceを直接呼ぶ。実機、実Google、Calendar、複数管理者の同時完了や第三者受入とは別の事前確認である。[手順と各試験の範囲](../acceptance/LOCAL_UI_REHEARSAL_20261106.md)を参照。

PROGRESS-20261106-RUNNER-03：独立した担当による最終実行はNode.js 24.22.1、14／14件PASS・終了コード0。HTTP／WebSocket遮断の意図的プローブもPASS。想定外通信、ブラウザー例外、実行中のソース変更はいずれも0だった。実行後の全sourceHashesも現行ソースと一致した。結果は [`results.json`](../../outputs/local-acceptance-independent-final-20261106/results.json)、独立レビューは [`review.json`](../../outputs/local-acceptance-runner-review-20261106.json)。スクリーンショットとビルドのハッシュは結果に記録した。

PROGRESS-20261106-RUNNER-04：新規出力先必須、既存出力の拒否、Node版・引数の拒否、JST日付、外部HTTP許可範囲を安全ヘルパーの4試験で確認（4／4PASS・終了0）。[TAPログ](../../outputs/local-ui-safety-20261106-final/node-test.tap)と[構造化結果](../../outputs/local-ui-safety-20261106-final/results.json)を保存。独立確認でも既存出力を指定するとEEXIST・終了1となり、過去のresults.jsonハッシュは変わらなかった。

PROGRESS-20261106-RUNNER-05：開発途中の失敗記録は別ディレクトリーで保持。初回は標準Chromiumが未導入、次はランナーのラベル選択・待機引数の不具合があったため修正した。dev6ではスクリーンショットのタイムアウトで途中終了したため、合格の証拠に使用しない。最終証跡は上記の独立実行のみを参照する。

PROGRESS-20261106-RUNNER-06：第三者受入は0／30件のまま。Calendar権限追加、Firebase／GASの配備、本番運用開始は行っていない。
