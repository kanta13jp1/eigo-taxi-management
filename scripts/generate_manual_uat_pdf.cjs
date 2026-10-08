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
    <title>Google連携 手動受入検証 完全手順書</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Meiryo", sans-serif; margin: 0; padding: 24px; color: #1e293b; background: #fff; font-size: 10.5px; line-height: 1.5; }
      .header { border-bottom: 2px solid #059669; padding-bottom: 8px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-end; }
      h1 { font-size: 16px; color: #059669; margin: 0 0 4px 0; }
      .sub { font-size: 10px; color: #64748b; margin: 0; }
      .meta { font-size: 9px; color: #475569; text-align: right; }
      
      .alert-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 8px 12px; margin-bottom: 14px; font-size: 10px; color: #92400e; }
      .step-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; margin-bottom: 12px; }
      .step-title { font-size: 12px; font-weight: bold; color: #0f172a; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
      .step-badge { background: #059669; color: #fff; font-size: 9.5px; font-weight: bold; padding: 2px 6px; border-radius: 4px; }
      
      ol, ul { margin: 0 0 6px 0; padding-left: 20px; }
      li { margin-bottom: 4px; }
      strong { color: #0f172a; }
      
      .photo-point { background: #ecfdf5; border: 1px solid #10b981; border-radius: 4px; padding: 6px 10px; margin-top: 6px; font-size: 9.5px; color: #065f46; }
      .warning-point { background: #fee2e2; border: 1px solid #ef4444; border-radius: 4px; padding: 6px 10px; margin-top: 6px; font-size: 9.5px; color: #991b1b; }

      table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 14px; }
      th { background: #059669; color: #fff; font-weight: bold; padding: 6px 8px; text-align: left; font-size: 10px; border: 1px solid #047857; }
      td { padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 9.5px; vertical-align: middle; }
      tr:nth-child(even) { background: #f8fafc; }
      .center { text-align: center; }

      .sign-box { border: 1px solid #94a3b8; border-radius: 6px; padding: 10px; margin-top: 14px; font-size: 10px; background: #fafafa; }
      .page-break { page-break-before: always; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1>Mauro & Brenda Taxi Link 送迎チケット管理</h1>
        <p class="sub">Google連携（スプレッドシート＆カレンダー）手動受入検証手順書【非技術者向け】</p>
      </div>
      <div class="meta">
        作成日: 2026年10月08日<br>
        対象機能: TC-G01 〜 TC-G06
      </div>
    </div>

    <div class="alert-box">
      <strong>【受入手順書の重要ルール】</strong><br>
      本システムにおけるGoogleスプレッドシートおよびGoogleカレンダー連携機能は、教室または先生の実際のGoogleアカウントにて本手順を実施し、<strong>指定の画面キャプチャー（証跡1〜4）を取得・確認した時点で正式合格（Pass）</strong>となります。
    </div>

    <div class="step-card">
      <div class="step-title"><span class="step-badge">Step 1</span> Googleスプレッドシートの新規作成とスクリプトの貼り付け</div>
      <ol>
        <li>パソコンでGoogle Chromeを開き、連携したいGoogleアカウントにログインします。</li>
        <li><strong>Google ドライブ</strong> または <strong>スプレッドシート（sheets.new）</strong> を開き、「＋ 空白のスプレッドシート」をクリックします。</li>
        <li>画面左上のシート名を「<code>英語教室_送迎チケット管理データベース</code>」などに変更します。</li>
        <li>メニューの <strong>「拡張機能」 ➜ 「Apps Script」</strong> をクリックします（新しいタブでエディタが開きます）。</li>
        <li>Webアプリ（<code>https://kanta13jp1.github.io/eigo-taxi-management/</code>）の「Google連携」タブを開き、右上の <strong>「📋 スクリプトをコピー」</strong> ボタンをクリックします。</li>
        <li>Apps Script画面に戻り、エディタ内の元からある文字を全消去して、コピーしたコードを貼り付け（Ctrl+V）、上部の <strong>フロッピー保存アイコン</strong> を押します。</li>
      </ol>
    </div>

    <div class="step-card">
      <div class="step-title"><span class="step-badge">Step 2</span> 3シートの自動生成とGoogleアクセス承認（約2分）</div>
      <ol>
        <li>Apps Script上部の関数プルダウンから <strong><code>initSpreadsheet</code></strong> を選択し、<strong>「▷ 実行」</strong> をクリックします。</li>
        <li>「承認が必要です」と出たら、<strong>「権限を確認」</strong> をクリックし、ご自身のアカウントを選択します。</li>
      </ol>
      <div class="warning-point">
        <strong>⚠️ 警告画面が出た時の操作（Google初回自作スクリプトの標準確認です）:</strong><br>
        「Google で確認されていないアプリ」と出たら、左下の <strong>「詳細」</strong> をクリック ➜ <strong>「無題のプロジェクト（安全ではないページ）に移動」</strong> をクリック ➜ <strong>「許可」</strong> をクリックします。
      </div>
      <ol start="3" style="margin-top:6px;">
        <li>スプレッドシートのタブに戻ると、画面下に <strong>「生徒台帳（緑）」「送迎予定履歴（青）」「チケット購入履歴（紫）」</strong> の3枚のシートが自動作成されていることを確認します。</li>
      </ol>
      <div class="photo-point">
        📸 <strong>【証跡 1 の撮影】</strong> スプレッドシート下部に3つのシートが自動生成された画面のスクリーンショットを保存します。
      </div>
    </div>

    <div class="page-break"></div>

    <div class="step-card">
      <div class="step-title"><span class="step-badge">Step 3</span> Webアプリとしての公開（デプロイ）とURL登録</div>
      <ol>
        <li>Apps Script画面の右上にある青い <strong>「デプロイ」 ➜ 「新しいデプロイ」</strong> をクリックします。</li>
        <li>歯車アイコンをクリックして <strong>「ウェブアプリ」</strong> を選択します。</li>
        <li>「アクセスできるユーザー」を <strong>「全員 (Anyone)」</strong> に設定して「デプロイ」をクリックします。</li>
        <li>画面に表示された <strong>「ウェブアプリのURL」</strong> の「コピー」をクリックします。</li>
        <li>Webアプリの「Google連携」タブに戻り、「2. GAS WebアプリURLの入力」枠に貼り付けて <strong>「💾 接続設定を保存」</strong> をクリックします。</li>
      </ol>
    </div>

    <div class="step-card">
      <div class="step-title"><span class="step-badge">Step 4</span> Webアプリからテスト予約登録 ＆ カレンダー・シート確認</div>
      <ol>
        <li>Webアプリの「送迎利用者用（保護者）」を開き、生徒「山本 颯太」くんを選択します。</li>
        <li><strong>「＋ 送迎の予約を申し込む」</strong> を押し、送迎日・16:30・行き・メモ「Google連携テスト」で登録します。</li>
        <li><strong>スプレッドシートの確認:</strong> 「送迎予定履歴」シートに、いま登録した山本颯太くんの行が追加されたことを確認します。</li>
        <li><strong>Googleカレンダーの確認:</strong> 指定した日時の枠に <strong>『🚗【送迎】山本 颯太 (そうた) (pickup)』</strong> の予定が自動登録されたことを確認します。</li>
      </ol>
      <div class="photo-point">
        📸 <strong>【証跡 2 の撮影】</strong> スプレッドシート「送迎予定履歴」に追加された行のスクリーンショット<br>
        📸 <strong>【証跡 3 の撮影】</strong> Googleカレンダーに『🚗【送迎】山本 颯太』の予定が表示された画面のスクリーンショット
      </div>
    </div>

    <div class="step-card">
      <div class="step-title"><span class="step-badge">Step 5</span> 予約キャンセルとカレンダー予定自動削除の確認</div>
      <ol>
        <li>Webアプリでいま登録した予約カードの <strong>「キャンセル」</strong> をクリックし、確認ダイアログで「OK」を押します。</li>
        <li>Googleカレンダーを開いて更新（F5）し、<strong>『🚗【送迎】山本 颯太』の予定が綺麗に自動削除されたこと</strong> を確認します。</li>
        <li>スプレッドシートのステータス列が <code>scheduled</code> から <strong><code>cancelled</code></strong> に自動変更されたことを確認します。</li>
      </ol>
      <div class="photo-point">
        📸 <strong>【証跡 4 の撮影】</strong> カレンダーから予定が自動消去され、シートがcancelledになった画面のスクリーンショット
      </div>
    </div>

    <div class="step-title" style="margin-top:16px;">▍手動受入検証 結果チェックシート</div>
    <table>
      <thead>
        <tr>
          <th style="width:110px;">検証項目</th>
          <th>確認内容</th>
          <th style="width:180px;">取得した証跡キャプチャー</th>
          <th style="width:50px;" class="center">判定</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>① シート自動生成</td>
          <td>3シート（生徒台帳・送迎予定履歴・購入履歴）が自動作成された</td>
          <td>スプレッドシート初期化全景キャプチャー</td>
          <td class="center">合格 [ ]</td>
        </tr>
        <tr>
          <td>② 予約連動（シート）</td>
          <td>Webアプリ予約登録後、送迎予定履歴シートにデータが自動追加された</td>
          <td>「送迎予定履歴」行追加キャプチャー</td>
          <td class="center">合格 [ ]</td>
        </tr>
        <tr>
          <td>③ 予約連動（カレンダー）</td>
          <td>Googleカレンダーに『🚗【送迎】生徒名』の予定が自動登録された</td>
          <td>Googleカレンダー予定枠キャプチャー</td>
          <td class="center">合格 [ ]</td>
        </tr>
        <tr>
          <td>④ キャンセル連動</td>
          <td>キャンセル時にカレンダー予定が自動削除され、シートがcancelledになった</td>
          <td>カレンダー削除後＆シートcancelledキャプチャー</td>
          <td class="center">合格 [ ]</td>
        </tr>
      </tbody>
    </table>

    <div class="sign-box">
      <strong>【手動受入検証 完了サイン】</strong><br><br>
      ・検証実施日: 2026年 _____月 _____日<br>
      ・検証実施者（ご署名）: __________________________________________________<br>
      ・検証に使用したGoogleアカウント: __________________________________________________<br>
      ・総合判定: [ &nbsp; ] 合格（本番リリース承認） &nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp; ] 不合格・再調整要
    </div>

  </body>
  </html>
  `;

  await page.setContent(html, { waitUntil: 'load' });

  const pdfPath = path.join(OUTPUT_DIR, 'Mauro_Brenda_Taxi_Link_Google連携手動受入検証手順書.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: false,
    printBackground: true,
    margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' }
  });

  await browser.close();
  console.log(`[SUCCESS] Manual UAT PDF saved: ${pdfPath}`);
}

run().catch(console.error);
