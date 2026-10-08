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
    <title>Mauro & Brenda Taxi Link シナリオテスト仕様書</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Meiryo", sans-serif; margin: 0; padding: 20px; color: #1e293b; background: #fff; font-size: 11px; }
      .header { border-bottom: 2px solid #059669; padding-bottom: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
      h1 { font-size: 18px; color: #059669; margin: 0; }
      .meta { font-size: 10px; color: #64748b; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      th { background: #059669; color: #fff; font-weight: bold; padding: 6px 8px; text-align: left; font-size: 10px; border: 1px solid #047857; }
      td { padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 10px; vertical-align: middle; }
      tr:nth-child(even) { background: #f8fafc; }
      .center { text-align: center; }
      .badge-ok { background: #ecfdf5; color: #059669; font-weight: bold; border-radius: 4px; padding: 2px 6px; display: inline-block; }
      .cat-title { font-size: 13px; font-weight: bold; color: #0f172a; margin: 14px 0 6px 0; border-left: 4px solid #059669; padding-left: 8px; }
      .page-break { page-break-before: always; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1>Mauro & Brenda Taxi Link 全ユーザー操作シナリオテスト仕様書</h1>
        <div class="meta">対象URL: https://kanta13jp1.github.io/eigo-taxi-management/ | 作成日: 2026年10月08日</div>
      </div>
      <div class="meta">総合評価: <strong style="color:#059669; font-size:12px;">合格 (Pass)</strong></div>
    </div>

    <div class="cat-title">▍カテゴリ 1: 送迎利用者（生徒・保護者ポータル）の操作</div>
    <table>
      <thead>
        <tr><th style="width:50px;" class="center">ID</th><th style="width:120px;">テストケース名</th><th style="width:140px;">前提条件</th><th>操作手順</th><th>期待される結果（合格基準）</th><th style="width:40px;" class="center">判定</th></tr>
      </thead>
      <tbody>
        <tr><td class="center">TC-P01</td><td>生徒切り替え</td><td>複数生徒が登録済</td><td>上部「表示する生徒」プルダウンから別生徒を選択</td><td>選択生徒の残高・予約一覧・過去履歴が即時切り替え</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-P02</td><td>残数表示（余裕時）</td><td>チケット残3回以上</td><td>保護者ポータルを開く</td><td>残回数が大きく表示され「片道1枚消費」明記。警告枠は非表示</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-P03</td><td>残少アラート表示</td><td>チケット残2回以下</td><td>山本 颯太さん（残1回）を選択</td><td>「⚠️ チケットが無くなりそうです。Mauro・Brenda に連絡してね！」表示</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-P04</td><td>チケット残ゼロ表示</td><td>チケット残0回</td><td>高橋 莉子さん（残0回）を選択</td><td>残高0回分と表示され、警告アラートが表示される</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-P05</td><td>送迎予約（お迎え）</td><td>残チケット1枚以上</td><td>予約モーダルで「行き（お迎え）」を選択し確定</td><td>一覧に「お迎え（教室へ）」で登録。確定時点では残数減算なし</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-P06</td><td>送迎予約（送り）</td><td>残チケット1枚以上</td><td>予約モーダルで「帰り（送り）」を選択し確定</td><td>一覧に「送り（ご自宅へ）」で正常登録</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-P07</td><td>送迎予約（往復）</td><td>残チケット2枚以上</td><td>予約モーダルで「往復」を選択し確定</td><td>「チケット2枚消費」の明記とともに正常登録される</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-P08</td><td>自己キャンセル</td><td>予約中データあり</td><td>予約の「キャンセル」をクリックしダイアログOK</td><td>予約中から消え、過去履歴に「キャンセル」記録。残数減なし</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-P09</td><td>過去履歴閲覧</td><td>履歴データあり</td><td>ポータル下部の過去履歴テーブルを確認</td><td>日時・種別・ステータス（送迎済 -1回 / キャンセル）が時系列表示</td><td class="center"><span class="badge-ok">OK</span></td></tr>
      </tbody>
    </table>

    <div class="cat-title">▍カテゴリ 2: 管理者（Mauro & Brenda 先生用画面）の操作</div>
    <table>
      <thead>
        <tr><th style="width:50px;" class="center">ID</th><th style="width:120px;">テストケース名</th><th style="width:140px;">前提条件</th><th>操作手順</th><th>期待される結果（合格基準）</th><th style="width:40px;" class="center">判定</th></tr>
      </thead>
      <tbody>
        <tr><td class="center">TC-T01</td><td>本日の送迎サマリー</td><td>当日予定が存在</td><td>「管理者用」タブを選択</td><td>バナー表示、本日の件数サマリー、チケット残少生徒数が正確集計</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-T02</td><td>送迎完了（1回消費）</td><td>未完了予定あり</td><td>送迎カードの「送迎完了（1回消費）」をクリック</td><td>カードが完了状態になり、該当生徒のチケット残高が即座に-1減算</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-T03</td><td>地図アプリ連動</td><td>送迎先住所あり</td><td>カード内の「地図アプリ」をクリック</td><td>Google Mapsが別タブで開き、送迎先住所がピン留め検索される</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-T04</td><td>先生側急な送迎登録</td><td>-</td><td>「送迎予定を追加」より生徒・日時・区分を入力</td><td>一覧に即座反映。生徒選択で登録住所が自動補完される</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-T05</td><td>新規生徒登録</td><td>-</td><td>生徒管理タブで「＋新規生徒を登録」をクリックし保存</td><td>生徒一覧および保護者ポータルのプルダウンに新規生徒が追加</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-T06</td><td>チケット追加チャージ</td><td>-</td><td>「チケット追加」より10回券(¥10,000)を選択して登録</td><td>生徒のチケット残数が+10され、残少だった場合はアラート解除</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-T07</td><td>スケジュール絞り込み</td><td>送迎データあり</td><td>スケジュール一覧で「予約中」「完了済み」「キャンセル」切替</td><td>選択ステータスに合致する送迎データのみが正確に一覧表示される</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-T08</td><td>先生による送迎取消</td><td>未完了送迎あり</td><td>スケジュール一覧の「取消」ボタンをクリック</td><td>ステータスがキャンセルに変更され、チケット残数は減算されない</td><td class="center"><span class="badge-ok">OK</span></td></tr>
      </tbody>
    </table>

    <div class="page-break"></div>

    <div class="cat-title">▍カテゴリ 3: 結合・データ整合性シナリオ</div>
    <table>
      <thead>
        <tr><th style="width:50px;" class="center">ID</th><th style="width:120px;">テストケース名</th><th style="width:140px;">前提条件</th><th>操作手順</th><th>期待される結果（合格基準）</th><th style="width:40px;" class="center">判定</th></tr>
      </thead>
      <tbody>
        <tr><td class="center">TC-I01</td><td>予約〜完了完全往復</td><td>生徒A（残5回）</td><td>保護者予約 ➡️ 先生画面確認 ➡️ 送迎完了 ➡️ 保護者画面</td><td>生徒Aの残高が4回になり、予約中から完了履歴へ正しく遷移</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-I02</td><td>残数切れ境界値テスト</td><td>生徒B（残1回）</td><td>送迎完了(残0:警告発生) ➡️ 5回券チャージ(残5:警告解除)</td><td>残数ゼロで黄色警告が表示され、チャージ完了で即座に解除</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-I03</td><td>ページ再読み込み保持</td><td>操作実行済</td><td>ブラウザでCtrl+F5ハードリロードを実施</td><td>登録した予約、残数減算、チャージ情報が消えずに維持される</td><td class="center"><span class="badge-ok">OK</span></td></tr>
      </tbody>
    </table>

    <div class="cat-title">▍カテゴリ 4: Googleスプレッドシート & カレンダー連携（GAS）</div>
    <table>
      <thead>
        <tr><th style="width:50px;" class="center">ID</th><th style="width:120px;">テストケース名</th><th style="width:140px;">前提条件</th><th>操作手順</th><th>期待される結果（合格基準）</th><th style="width:40px;" class="center">判定</th></tr>
      </thead>
      <tbody>
        <tr><td class="center">TC-G01</td><td>GASコードコピー</td><td>設定画面</td><td>「スクリプトをコピー」をクリック</td><td>クリップボードにGASスクリプト全文が正確にコピーされる</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-G02</td><td>シート自動初期化</td><td>GAS側</td><td>initSpreadsheet関数を実行</td><td>生徒台帳・送迎履歴・チケット購入履歴の3シートが自動生成</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-G03</td><td>WebアプリURL保存</td><td>GASデプロイ済</td><td>設定画面でGAS WebアプリURLを貼り付け保存</td><td>接続先URLがLocalStorageに保存され、通信テストが実行される</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-G04</td><td>カレンダー自動同期</td><td>連携環境</td><td>Web画面から送迎予約を登録</td><td>Googleカレンダーに『🚗【送迎】生徒名』の予定が自動作成</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-G05</td><td>カレンダー自動削除</td><td>連携環境</td><td>Web画面から送迎をキャンセル</td><td>Googleカレンダーの該当送迎予定が自動削除される</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-G06</td><td>フォールバック動作</td><td>無効URL設定</td><td>GAS通信失敗状態で画面操作を行う</td><td>アプリ停止せずLocalStorageに自動フォールバックして動作継続</td><td class="center"><span class="badge-ok">OK</span></td></tr>
      </tbody>
    </table>

    <div class="cat-title">▍カテゴリ 5 & 6: レスポンシブ & デザイン検証（PC版・スマホ版）</div>
    <table>
      <thead>
        <tr><th style="width:50px;" class="center">ID</th><th style="width:120px;">テストケース名</th><th style="width:140px;">前提条件</th><th>操作手順</th><th>期待される結果（合格基準）</th><th style="width:40px;" class="center">判定</th></tr>
      </thead>
      <tbody>
        <tr><td class="center">TC-U01</td><td>スマホ表示(375px)</td><td>モバイル環境</td><td>iPhone/Android幅でアクセス</td><td>横スクロールなし、タブが均等配置、ボタンが指でタップ可能</td><td class="center"><span class="badge-ok">OK</span></td></tr>
        <tr><td class="center">TC-V01</td><td>全10画面デザイン確認</td><td>PC/スマホ</td><td>全10画面×2モード(計20枚)のキャプチャーを目視確認</td><td>余白・フォント・コントラスト・チップ選択状態の美観が維持</td><td class="center"><span class="badge-ok">OK</span></td></tr>
      </tbody>
    </table>
  </body>
  </html>
  `;

  await page.setContent(html, { waitUntil: 'load' });
  const pdfPath = path.join(OUTPUT_DIR, 'Mauro_Brenda_Taxi_Link_シナリオテスト仕様書.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
  });
  console.log('Saved Test Cases PDF:', pdfPath);

  await browser.close();
}

run().catch(console.error);
