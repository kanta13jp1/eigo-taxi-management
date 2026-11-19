# 2026-11-06 認証・画面境界のローカル事前確認

PREP-20261106-01：開発側で受入準備として、Node.js 24.22.1と新規の隔離出力先を用い、役割別画面と家庭別入口等のフロント契約21件、Firebase SDK代替実装を使った認証契約7件、公開マニフェストの模擬契約1件を実行し、計29件のアサーションが成功、3コマンドとも終了コード0だった。外部FirebaseやGASの応答は代替実装である。

PREP-20261106-02：結果は [`frontend-contract.json`](../../outputs/noncalendar-contracts-20261106/frontend-contract.json)、[`google-sdk-contract.json`](../../outputs/noncalendar-contracts-20261106/google-sdk-contract.json)、[`release-contract.json`](../../outputs/noncalendar-contracts-20261106/release-contract.json)。各JSONの全結果がPASSで、記録されたソースハッシュが実行後のファイルと一致することを確認した。結果ファイルSHA-256は順に `401f1e9f5594b592122703574579260c2321778108ff2d7351f0c433e6c6c2da`、`5c7c92c2b0c9d6e6ff570b8212c3255f7bfea8f6160c7dd12dea0903cce1bb74`、`cf3b9ce2ad6092a91ca6c205e5cdbd334a1fbe1b9e6a1b72a2bd067e74683cf5`。

PREP-20261106-03：これは開発側のローカル契約確認であり、実Googleログイン・実スプレッドシート・Calendar・スマートフォン・公開サイトの確認でも、開発者以外による30件の受入でもない。第三者受入は0／30のまま。Calendar権限追加、配備、台帳変更および本番開始は行っていない。

## 再現に必要な準備

PREP-20261106-04：開発者以外の実施者が同じローカル確認を再現する場合、対象版・作業ツリー・Node.jsのバージョンを先に記録する。Node.js 24.12以上を用い、既存結果を上書きしない新規の出力先を `EIGO_TEST_OUTPUT_DIR` に指定してから、リポジトリのルートで `node scripts/test_portals.cjs`、`node scripts/test_google_auth.cjs`、`node scripts/test_release_contract.cjs` を順に実行する。各終了コードと生成JSONの各結果・`sourceHashes` を照合する。既存の `scripts/run_acceptance.cjs` は過去の画面・固定日時・既存記録上書きの問題があるため使わない。[受入準備メモ](../acceptance/THIRD_PARTY_EXECUTION_PREP_20261103.md)の実施者・環境・証跡の条件も満たす必要がある。

PREP-20261106-05：この再現手順は事前確認の候補で、受入仕様や実施の承認を変更しない。実機・実データ・実Calendarの受入条件、AT-06の過去日時、AT-30の公開後判定、第三者実施者・端末等の未確定事項は引き続き別途解決する。
