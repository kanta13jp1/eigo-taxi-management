// Canonical source for DOC-BF/UC/REQ/FS/TASK/AT/TM. IDs must remain stable.
// 2026-10-20 portal separation amendment: docs/PORTAL_SEPARATION.md is
// authoritative for role-specific routes, family entry IDs and local QR sharing.
// Supplementary tests (test_portals.cjs, test_gas.cjs, verify_role_portals_live.ps1)
// do not add to the 30 acceptance cases or replace AT-24..30.
const flows = [
  ['01','導入・接続設定','導入担当','検証用Google資源を準備 → 接続 → 端末間確認','接続・所有者・権限が確認できる'],
  ['02','生徒利用開始','管理者','生徒情報を受領 → 台帳登録 → 利用者に案内','予約対象として選択できる'],
  ['03','残数確認・チケット購入','保護者・管理者','残数確認 → 残少案内 → 代金受領確認 → 回数追加','残高と購入履歴が整合する'],
  ['04','都度送迎予約','保護者・管理者','生徒・日時・区分・場所を指定 → 登録 → 予定確認','残数を減らさず予約・カレンダーに記録'],
  ['05','送迎取消','保護者・管理者','対象予約を確認 → 取消確認 → 履歴確認','予定取消・カレンダー削除・残高維持'],
  ['06','当日運行・実績処理','管理者','当日予定確認 → 地図確認 → 送迎実施 → 完了登録','片道1回・往復2回を一度だけ消費'],
  ['07','アクセス管理・障害対応','運用担当','本人確認 → 権限判定 → 操作 → 障害検知・復旧','他家庭の情報を保護し記録を失わない'],
  ['08','受入・リリース・保守','導入担当・受入担当','仕様確認 → テスト → 不具合修正 → 再試験 → 受入 → リリース','合格証跡・復旧手順・担当者を残す'],
];
// number, BF, title, precondition, steps, observable expected result, implementation file, symbol, kind
const rows = [
 ['01','01','Google連携先の設定保存','テスト用URLのみ使用','Google連携画面でURLを入力し保存・再読込','保存したURLが再読込後も一致','src/services/api.ts','setGasApiUrl','auto'],
 ['02','02','生徒登録','ダミー台帳','生徒登録画面で氏名・保護者・住所・連絡先・初期10回を登録','生徒が1件増え全入力値と初期残高10が保存される','src/components/AddStudentModal.tsx','handleSubmit','auto'],
 ['03','03','保護者の残数確認','初期生徒STU-001が7回','利用者画面で生徒を選択','氏名と7回分・片道1枚の説明が表示される','src/components/ParentPortal.tsx','ParentPortal','auto'],
 ['04','03','残少・ゼロ案内','残高2・1・0の各生徒','各残高で利用者画面を開く','各値でMauro・Brendaへの連絡案内が表示される','src/components/ParentPortal.tsx','ParentPortal','auto'],
 ['05','03','チケット追加','初期残高7','10回を追加し台帳・購入履歴を確認','残高17、履歴1件増、枚数10・金額・備考一致','src/services/api.ts','addTickets','auto'],
 ['06','04','保護者のお迎え予約','残高7・明示選択したデモ','利用者画面から2026-10-20 16:30・お迎え・登録済み住所を使って予約','新規予約1件、scheduled、parent、残高7のまま','src/components/AddRideModal.tsx','handleSubmit','auto'],
 ['07','04','送り予約','残高7・未接続デモ','サービス経由で送り17:30を登録し画面を再表示','dropoffの予約が1件増え、残高7のまま','src/services/api.ts','createReservation','auto'],
 ['08','04','往復予約','残高7・未接続デモ','サービス経由で往復を登録し画面を再表示','roundtripの予約が1件増え、予約時残高7のまま','src/services/api.ts','createReservation','auto'],
 ['09','04','管理者の代理予約','初期台帳','管理者画面から日時・生徒・場所を指定して予約','新規予約1件、reservedBy=teacher','src/components/AddRideModal.tsx','handleSubmit','auto'],
 ['10','05','保護者の予約取消','保護者予約1件・残高7','利用者画面で対象予約をキャンセルし確認を承諾','対象IDがcancelled、残高7のまま','src/services/api.ts','cancelReservation','auto'],
 ['11','05','管理者の予約取消','予約1件','サービス経由で取消後に管理画面を再表示','対象IDがcancelled、残数不変','src/services/api.ts','cancelReservation','auto'],
 ['12','06','当日一覧・地図リンク','初期当日予約','管理者画面を開き地図リンクを調べる','当日予約とGoogle Maps検索URLが表示される（地図先の動作は対象外）','src/components/TeacherDashboard.tsx','TeacherDashboard','auto'],
 ['13','06','片道完了','残高7・お迎え予約','サービス経由で完了後に画面を再表示','completed・完了日時あり・残高6','src/services/api.ts','completeRide','auto'],
 ['14','06','往復完了','残高7・往復予約','サービス経由で往復完了後に画面を再表示','completed・残高5・消費2','src/services/api.ts','completeRide','auto'],
 ['15','06','完了の二重処理防止','管理者デモ・残高7・片道予約','同じ予約IDに完了を2回要求','最終残高6、completedを保持、再処理の消費枚数0','src/services/api.ts','completeRide','auto'],
 ['16','06','取消済みの完了拒否','残高7・取消済み予約','取消済みIDを完了要求','cancelledを保持し残高7のまま','src/services/api.ts','completeRide','auto'],
 ['17','03','不正なチケット追加拒否','管理者デモ・残高7','枚数に-1/0/小数/NaN/Infinity/101、金額に負数/小数/NaN/Infinityを渡す','全要求が拒否され残高7・購入履歴が不変','src/services/api.ts','addTickets','auto'],
 ['18','07','通信障害時に成功扱いしない','ローカル模擬APIへのログイン・通信障害注入','全5更新POSTを通信失敗させる。業務エラー/HTTP503/不正JSONも拒否確認。同一予約を再試行しUIでも予約する','すべて拒否、ローカル台帳不変、同一内容再試行の予約ID不変、UIにエラー表示してフォーム維持','src/services/api.ts','createReservation','auto'],
 ['19','07','未認証の管理操作を拒否','セッション・保存データなしの新規画面','未認証の画面とAPI拒否を確認。その後ローカル模擬APIでログインし、キー失効応答を注入する','認証前はログイン画面のみ・台帳未生成。キー失効応答後はセッションと画面の個人情報を消しログイン画面に戻る','src/App.tsx','App','auto'],
 ['20','07','保護者の家庭別アクセス制限','STU-001だけに紐付いた保護者デモ','生徒一覧・予約一覧・STU-002への参照/予約/取消・管理者操作の直接呼出を確認','STU-001だけを表示。別家庭の参照/予約/取消と完了/チケット追加を拒否','src/components/ParentPortal.tsx','ParentPortal','auto'],
 ['21','08','モバイル表示','375×812のエミュレーション','管理・利用者・予約フォームを順に表示し、指定幅375pxと実際の描画幅を照合','各画面でscrollWidthとinnerWidthが375px以下。保護者の予約・取消行も画面内に収まる','src/components/ParentPortal.tsx','ParentPortal','auto'],
 ['22','07','再読込後の永続化','ダミー台帳','生徒追加と予約登録後に再読込','追加した生徒・予約のIDと値が維持される','src/services/api.ts','getRides','auto'],
 ['23','01','Google初期化・永続化','専用シート・GAS配備・権限が必要','initSpreadsheetを2回実行し生徒をWeb登録、シートを開く','3シート生成・再実行で既存値不変・新規生徒1行','gas/Code.gs','initSpreadsheet','external'],
 ['24','04','実カレンダー予約同期','専用GAS・カレンダーが必要','Webから予約しシート行と実カレンダー予定を開く','同一予約ID・日時・場所・イベントIDが一致','gas/Code.gs','doPost','external'],
 ['25','05','実カレンダー取消同期','AT-24の予約','予約取消後にシートとカレンダーを開く','cancelled・対象イベント削除・残高不変','gas/Code.gs','doPost','external'],
 ['26','07','管理者2名・保護者の端末共有','別セッション3台・権限分離・専用GAS','保護者予約 → 管理者A確認・完了 → 管理者Bと保護者が再取得','同一予約・残高を確認し家庭の範囲を維持','src/services/api.ts','getStudents','external'],
 ['27','06','同時完了の排他制御','独立管理者2セッション・専用GAS','同じ予約を両管理者から同時に完了','完了1件・片道1枚だけ消費、再試行でも不変','gas/Code.gs','doPost','external'],
 ['28','08','バックアップから復旧','専用テスト資源・保存先・担当者','バックアップ → テスト行変更 → 復元 → Web再取得','生徒・予約・購入履歴・カレンダーの整合を回復','docs/OPERATION_RUNBOOK.md','バックアップ','external'],
 ['29','08','実機受入','iPhone Safari・Android Chromeと受入担当者','予約・取消・残高確認を各実機で実施','入力・確認・操作が可能、受入担当の確認記録あり','src/App.tsx','App','external'],
 ['30','08','リリース後スモークテスト','全必須合格・受入確認・対象環境確定','リリース後URLで権限・予約・取消・連携・版を確認','対象コミットと公開版一致、重大不具合なし、戻し手順あり','.github/workflows/deploy.yml','build-and-deploy','external'],
];
module.exports = { flows, cases: rows.map(([n,bf,title,pre,steps,expected,file,symbol,kind]) => ({
 id:`AT-${n}`, bf:`BF-${bf}`, uc:`UC-${n}`, req:`REQ-${n}`, fs:`FS-${n}`, task:`TASK-${n}`, code:`CODE-${n}`, test:`TEST-${n}`, title,pre,steps,expected,file,symbol,kind,
 origin: ['15','16','17','18','19','20'].includes(n) ? 'ユーザーによる不合格6件の修正依頼（実装対象確定）' : Number(n)<=14 || ['21','22','23','24','25','26'].includes(n) ? 'チャット要望から具体化' : '運用開始に向けた追加提案（受入基準案）',
 relatedCode: ['15','16','17','18','19','20'].includes(n) ? [
   'src/services/api.ts', 'gas/Code.gs',
   ...(['18','19','20'].includes(n)?['src/App.tsx','src/components/LoginScreen.tsx','src/components/Navbar.tsx']:[]),
 ] : [],
})) };
