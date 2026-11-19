# 復元の限定検証と認証再試行の準備

REPORT-RESTORE-AUTH-01：新規の架空Googleスプレッドシートと別のバックアップで、値・数式・数値表示形式の復元と再計算を確認した。既存バックアップは接続先から403で読めず、今回使用した接続アカウントと架空シートの共有範囲は未確認。実台帳全体・Calendar整合・AT-28全体・第三者受入の合格ではない。[詳細](../acceptance/backup-restore-2026-10-23/synthetic-formula-format-2026-10-30.md)。

REPORT-RESTORE-AUTH-02：実Firebase SDKを使うローカル専用の人工的なログアウト失敗・再試行テストを準備した。型検査、外部通信を遮断した初期画面、架空ユーザーでのSDKフック動作は確認済み。本人による実Googleアカウント操作の結果は待ち。公開サイトUI、実際のGoogle障害、以前のiPhoneエラーの再現や第三者受入の合格ではない。[手順](../../tests/manual-auth-signout/README.md)。

REPORT-RESTORE-AUTH-03：Calendar権限追加、本番運用開始、既存の実台帳・既存バックアップの変更は行っていない。第三者受入0/30、本番HOLDを維持する。
