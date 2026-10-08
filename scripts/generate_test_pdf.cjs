const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve('c:/Users/kanta/GitHub/eigo-taxi-management/docs/GoogleDrive_Upload');

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Mauro & Brenda Taxi Link 受入シナリオテスト仕様書 ＆ 客観的証跡報告書</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Meiryo", sans-serif; margin: 0; padding: 20px; color: #1e293b; background: #fff; font-size: 10px; line-height: 1.4; }
      .header { border-bottom: 2px solid #059669; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end; }
      h1 { font-size: 16px; color: #059669; margin: 0; }
      .meta { font-size: 9px; color: #64748b; }
      .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-bottom: 14px; font-size: 9.5px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
      th { background: #059669; color: #fff; font-weight: bold; padding: 5px 6px; text-align: left; font-size: 9px; border: 1px solid #047857; }
      td { padding: 5px 6px; border: 1px solid #cbd5e1; font-size: 9px; vertical-align: middle; }
      tr:nth-child(even) { background: #f8fafc; }
      .center { text-align: center; }
      .badge-ok { background: #ecfdf5; color: #059669; font-weight: bold; border-radius: 4px; padding: 2px 5px; display: inline-block; font-size: 9px; }
      .badge-pending { background: #fef3c7; color: #d97706; font-weight: bold; border-radius: 4px; padding: 2px 5px; display: inline-block; font-size: 8.5px; }
      .badge-file { font-family: Consolas, monospace; background: #e0f2fe; color: #0369a1; padding: 2px 4px; border-radius: 3px; font-size: 8.5px; font-weight: bold; }
      .cat-title { font-size: 11px; font-weight: bold; color: #0f172a; margin: 12px 0 6px 0; border-left: 3px solid #059669; padding-left: 6px; }
      .page-break { page-break-before: always; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1>Mauro & Brenda Taxi Link 受入テスト仕様書 ＆ 手動受入検証管理表</h1>
        <div class="meta">対象URL: https://kanta13jp1.github.io/eigo-taxi-management/ | 実施日: 2026年10月08日 | 検証方式: Web自動E2E 22件 ＋ Google実機手動受入 6件</div>
      </div>
      <div class="meta">総合評価: <strong style="color:#059669; font-size:11px;">Web機能 22件合格</strong> / <strong style="color:#d97706; font-size:11px;">Google連携 6件手動受入検証中</strong></div>
    </div>

    <div class="summary-box">
      <strong>【受入検証および証跡サマリー】</strong><br>
      ・<strong>Web基本機能（22項目）</strong>: 本番環境に対しPuppeteerによるブラウザ自動E2Eテストを実行し、全22件の画面キャプチャー（docs/evidence/）および詳細ログを取得して100%合格を確認済。<br>
      ・<strong>Google実機連携（6項目）</strong>: 実在するGoogleアカウント（カレンダー・スプレッドシート）への反映確認は、同梱の『Google連携手動受入検証手順書』に基づき利用者が手動実施し、その画面証跡（4画面）の取得・確認をもって最終合格（Pass）となります。
    </div>

    <div class="cat-title">▍カテゴリ 1: 送迎利用者（生徒・保護者ポータル）の操作（9件 PASS）</div>
    <table>
      <thead>
        <tr><th style="width:45px;" class="center">ID</th><th style="width:90px;">テストケース名</th><th style="width:110px;">操作手順</th><th>期待される結果（合格基準）</th><th style="width:30px;" class="center">判定</th><th style="width:140px;">客観的証跡画像</th><th>E2E実行ログ詳細</th></tr>
      </thead>
      <tbody>
        <tr><td class="center">TC-P01</td><td>生徒切り替え</td><td>生徒プルダウンから別生徒を選択</td><td>残高・予約・履歴が即時連動切替</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-P01_student_switch.png</span></td><td>山本 颯太さんへ切替、残1回表示同期確認</td></tr>
        <tr><td class="center">TC-P02</td><td>残数表示（余裕時）</td><td>保護者ポータルを開く</td><td>残回数大きく表示、片道1枚明記</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-P02_residual_normal.png</span></td><td>田中 陽菜さん 残7回分表示確認</td></tr>
        <tr><td class="center">TC-P03</td><td>残少アラート表示</td><td>山本 颯太さん（残1回）選択</td><td>「⚠️ チケットが無くなりそうです」警告表示</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-P03_residual_alert.png</span></td><td>指定警告文言の完全一致レンダリング確認</td></tr>
        <tr><td class="center">TC-P04</td><td>チケット残ゼロ表示</td><td>高橋 莉子さん（残0回）選択</td><td>残高0回分および赤色警告枠表示</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-P04_residual_zero.png</span></td><td>残高0回分表示および警告枠確認</td></tr>
        <tr><td class="center">TC-P05</td><td>送迎予約（お迎え）</td><td>「お迎え」を選択し確定</td><td>予約一覧に「お迎え（教室へ）」登録</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-P05_reservation_pickup.png</span></td><td>「お迎え（教室へ）」送迎予約の新規登録・一覧反映確認</td></tr>
        <tr><td class="center">TC-P06</td><td>送迎予約（送り）</td><td>「送り」を選択し確定</td><td>予約一覧に「送り（ご自宅へ）」登録</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-P06_reservation_dropoff.png</span></td><td>「送り（ご自宅へ）」送迎予約の新規登録・一覧反映確認</td></tr>
        <tr><td class="center">TC-P07</td><td>送迎予約（往復）</td><td>「往復」を選択し確定</td><td>「往復（チケット2枚消費）」で登録</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-P07_reservation_roundtrip.png</span></td><td>「往復」送迎予約（チケット2枚消費）の登録成功確認</td></tr>
        <tr><td class="center">TC-P08</td><td>自己キャンセル</td><td>「キャンセル」クリックしOK</td><td>過去履歴に「キャンセル」移動、残減なし</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-P08_reservation_cancel.png</span></td><td>confirmダイアログ承諾および過去履歴移動確認</td></tr>
        <tr><td class="center">TC-P09</td><td>過去履歴閲覧</td><td>過去履歴テーブルを確認</td><td>日時・種別・ステータス時系列表示</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-P09_history_table.png</span></td><td>過去送迎実績・ステータス表示の正確性を確認</td></tr>
      </tbody>
    </table>

    <div class="cat-title">▍カテゴリ 2: 管理者（Mauro・Brenda先生用ダッシュボード）の操作（8件 PASS）</div>
    <table>
      <thead>
        <tr><th style="width:45px;" class="center">ID</th><th style="width:90px;">テストケース名</th><th style="width:110px;">操作手順</th><th>期待される結果（合格基準）</th><th style="width:30px;" class="center">判定</th><th style="width:140px;">客観的証跡画像</th><th>E2E実行ログ詳細</th></tr>
      </thead>
      <tbody>
        <tr><td class="center">TC-T01</td><td>ダッシュボードサマリー</td><td>「管理者用」タブ選択</td><td>バナー表示・本日件数・残少生徒数集計</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-T01_teacher_summary.png</span></td><td>バナーおよび3カードサマリー表示確認</td></tr>
        <tr><td class="center">TC-T02</td><td>送迎完了とチケット減算</td><td>「送迎完了（1回消費）」クリック</td><td>カード完了状態、チケット残数が-1減算</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-T02_ride_completed.png</span></td><td>完了処理実行および自動-1減算を確認</td></tr>
        <tr><td class="center">TC-T03</td><td>地図アプリ連動</td><td>カード内「地図アプリ」クリック</td><td>Google Mapsが住所ピン留めで開く</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-T03_map_link.png</span></td><td>Google Maps連携リンクの正常性を確認</td></tr>
        <tr><td class="center">TC-T04</td><td>先生側の予定追加</td><td>「送迎予定を追加」より登録</td><td>一覧および全スケジュールに即座反映</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-T04_teacher_add_ride.png</span></td><td>先生用画面からの送迎追加および反映確認</td></tr>
        <tr><td class="center">TC-T05</td><td>新規生徒登録</td><td>「＋新規生徒を登録」クリック保存</td><td>台帳および保護者プルダウンに即時追加</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-T05_add_student.png</span></td><td>生徒「鈴木 陸斗」登録・台帳追加を確認</td></tr>
        <tr><td class="center">TC-T06</td><td>チケット追加チャージ</td><td>10回券(¥10,000)を選択し登録</td><td>チケット残数が+10、アラート解除</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-T06_add_ticket.png</span></td><td>10回券チャージ成功および残数加算を確認</td></tr>
        <tr><td class="center">TC-T07</td><td>スケジュール絞り込み</td><td>「完了済み」等のフィルター選択</td><td>合致する送迎データのみが絞り込み表示</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-T07_schedule_filter.png</span></td><td>完了済みフィルターによる正確な絞り込み確認</td></tr>
        <tr><td class="center">TC-T08</td><td>先生による送迎取消</td><td>スケジュール「取消」クリック</td><td>ステータスがキャンセルに変更、残減なし</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-T08_teacher_cancel.png</span></td><td>先生画面における送迎取消・ステータス管理確認</td></tr>
      </tbody>
    </table>

    <div class="page-break"></div>

    <div class="cat-title">▍カテゴリ 3: データ整合性・境界値（3件 PASS）</div>
    <table>
      <thead>
        <tr><th style="width:45px;" class="center">ID</th><th style="width:90px;">テストケース名</th><th style="width:110px;">操作手順</th><th>期待される結果（合格基準）</th><th style="width:30px;" class="center">判定</th><th style="width:140px;">客観的証跡画像</th><th>E2E実行ログ詳細</th></tr>
      </thead>
      <tbody>
        <tr><td class="center">TC-I01</td><td>完全往復結合テスト</td><td>保護者予約➡️先生完了➡️履歴確認</td><td>残高が正確に減算され完了履歴へ遷移</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-I01_e2e_integration.png</span></td><td>双方向データ連動および整合性を確認</td></tr>
        <tr><td class="center">TC-I02</td><td>残数境界値テスト</td><td>完了(残0:警告)➡️チャージ(残5:解除)</td><td>残数ゼロで警告表示、チャージで即解除</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-I02_boundary_alert_clear.png</span></td><td>残1回警告およびチケット追加の動的更新確認</td></tr>
        <tr><td class="center">TC-I03</td><td>リロード永続化テスト</td><td>ブラウザ再読み込みを実行</td><td>登録予約・残高減算・生徒情報が消えない</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-I03_reload_persistence.png</span></td><td>リロード後もLocalStorage保持を確認</td></tr>
      </tbody>
    </table>

    <div class="cat-title">▍カテゴリ 4: Google連携（スプレッドシート・カレンダー）（6件 手動受入検証中）</div>
    <table>
      <thead>
        <tr><th style="width:45px;" class="center">ID</th><th style="width:90px;">テストケース名</th><th style="width:110px;">操作手順</th><th>期待される結果（合格基準）</th><th style="width:65px;" class="center">判定</th><th style="width:120px;">合格に必要な証跡</th><th>E2E実行ログ / 受入確認詳細</th></tr>
      </thead>
      <tbody>
        <tr><td class="center">TC-G01</td><td>GASコード表示コピー</td><td>「スクリプトをコピー」クリック</td><td>クリップボードにGASスクリプト全文コピー</td><td class="center"><span class="badge-pending">手動確認中</span></td><td>TC-G01_gas_code_view.png</td><td>Web画面コピー機能は自動確認済。Apps Script貼付を手動確認</td></tr>
        <tr><td class="center">TC-G02</td><td>シート自動初期化</td><td>initSpreadsheet定義を手動実行</td><td>生徒台帳・送迎予定履歴・購入履歴の3シート作成</td><td class="center"><span class="badge-pending">手動確認中</span></td><td>【証跡1】3シート全景</td><td>手順書Step 2に基づき実施。3シート生成画面のキャプチャーでOK</td></tr>
        <tr><td class="center">TC-G03</td><td>GAS URL設定・保存</td><td>GAS WebアプリURLを保存</td><td>LocalStorage保存および成功メッセージ</td><td class="center"><span class="badge-pending">手動確認中</span></td><td>TC-G03_gas_url_saved.png</td><td>Web画面URL保存は自動確認済。発行実URLの接続テストを手動確認</td></tr>
        <tr><td class="center">TC-G04</td><td>カレンダー予定登録</td><td>Webアプリからテスト予約登録</td><td>『🚗【送迎】生徒名』の予定作成＆行追加</td><td class="center"><span class="badge-pending">手動確認中</span></td><td>【証跡2&3】行追加＆カレンダー</td><td>手順書Step 4に基づき実施。カレンダー＆シート行追加キャプチャーでOK</td></tr>
        <tr><td class="center">TC-G05</td><td>カレンダー予定削除</td><td>Webアプリからテスト予約キャンセル</td><td>カレンダー予定自動削除＆cancelled更新</td><td class="center"><span class="badge-pending">手動確認中</span></td><td>【証跡4】予定消去＆更新</td><td>手順書Step 5に基づき実施。予定削除後の画面キャプチャーでOK</td></tr>
        <tr><td class="center">TC-G06</td><td>自動フォールバック</td><td>GAS未接続で画面操作</td><td>アプリ停止せずLocalStorageで継続稼働</td><td class="center"><span class="badge-ok">OK</span></td><td>TC-G06_fallback_handling.png</td><td>自動E2E検証完了。Fail-Openにより画面停止しないことを実証済</td></tr>
      </tbody>
    </table>

    <div class="cat-title">▍カテゴリ 5: レスポンシブ ＆ ビジュアル品質（2件 PASS）</div>
    <table>
      <thead>
        <tr><th style="width:45px;" class="center">ID</th><th style="width:90px;">テストケース名</th><th style="width:110px;">操作手順</th><th>期待される結果（合格基準）</th><th style="width:30px;" class="center">判定</th><th style="width:140px;">客観的証跡画像</th><th>E2E実行ログ詳細</th></tr>
      </thead>
      <tbody>
        <tr><td class="center">TC-U01</td><td>スマホ(375px)適合</td><td>375×812 viewportで検証</td><td>横スクロールなし、タップ領域44px以上</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-U01_mobile_responsive.png</span></td><td>iPhoneサイズでのレスポンシブ適合を確認</td></tr>
        <tr><td class="center">TC-V01</td><td>全画面ビジュアル品質</td><td>全10画面×PC/スマホ検証</td><td>余白・配色・フォントの視認性良好</td><td class="center"><span class="badge-ok">OK</span></td><td><span class="badge-file">TC-V01_visual_quality.png</span></td><td>デスクトップ＆モバイル全画面品質適合を確認</td></tr>
      </tbody>
    </table>

  </body>
  </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfPath = path.join(OUTPUT_DIR, 'Mauro_Brenda_Taxi_Link_シナリオテスト仕様書.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
  });

  await browser.close();
  console.log(`[SUCCESS] PDF saved: ${pdfPath}`);
}

run().catch(console.error);
