# 予約画面の縦スクロール修正（2026-11-06）

PROGRESS-20261106-MODAL-01：ローカルChromiumのタッチ・モバイル模擬で予約画面を375×500および812×375で表示すると、登録ボタンが画面下端を超え、スクロールによる表示もできないことを再現した。375×500のボタン下端は532、812×375のボタン下端は452.5だった。

PROGRESS-20261106-MODAL-02：`src/components/AddRideModal.tsx`の内側パネルに、動的な画面高から余白を除いた最大高と縦スクロールを設定した。処理・データ入力・APIは変更していない。新しい回帰テスト[`scripts/test_booking_modal_scroll.mjs`](../../scripts/test_booking_modal_scroll.mjs)は、2画面で登録ボタンを表示・タップし、閉じるボタンまで戻れることを確認する。外部通信は遮断し、出力先は未作成ディレクトリーを必須として過去の記録を保護する。

PROGRESS-20261106-MODAL-03：同一テストは修正前2件FAIL、修正後2件PASS。証跡は[`修正前`](../../outputs/booking-modal-scroll-20261106-red/results.json)と[`修正後`](../../outputs/booking-modal-scroll-20261106-green/results.json)。対象ソースとテストのハッシュおよび画面画像を各フォルダーに保存した。既存のローカルUI回帰UI-01〜06も6件PASS、TypeScript検査とViteビルドが成功した。既存回帰の結果は[`UI結果`](../../outputs/booking-modal-existing-ui-20261106/results.json)。ビルド出力は`outputs/booking-modal-build-20261106/`。

PROGRESS-20261106-MODAL-04：ローカルのブラウザー模擬であり、iPhone Safari/Chromeの実機や実Google受入、AT-29全体の合格ではない。閉じるボタンは表示範囲へ戻せることの確認で、閉じるイベント自体は元のfixtureが何もしないため確認対象に含めない。変更は未配備。Calendar権限追加・Google設定変更・本番運用開始は行っていない。実装担当とは独立したAIによる[ソースレビュー](../traceability/reports/acceleration-20261106/modal-ai-review.json)で、今回の変更がCSSの1箇所に限定されること、対象ハッシュと回帰結果の一致を確認した。修正後の実機確認は別途必要。[検証コマンドの終了コードと対象ハッシュ](../../outputs/booking-modal-scroll-20261106-validation.json)も保存した。
