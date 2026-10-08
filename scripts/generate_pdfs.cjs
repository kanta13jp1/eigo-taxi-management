const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve('c:/Users/kanta/GitHub/eigo-taxi-management/docs/GoogleDrive_Upload');
const SCREENSHOTS_DIR = path.resolve('C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots');

function getBase64Image(filename) {
  const filePath = path.join(SCREENSHOTS_DIR, filename);
  if (!fs.existsSync(filePath)) return '';
  const data = fs.readFileSync(filePath);
  return `data:image/png;base64,${data.toString('base64')}`;
}

async function generateDesignPdf(browser) {
  console.log('Generating Screen Design PDF...');
  const page = await browser.newPage();

  const screens = [
    { title: '画面 01: 管理者ダッシュボード（本日の送迎）', desc: '本日の送迎サマリー、地図アプリ直リンク、送迎完了（1回消費）ボタン', desktop: 'desktop_01_teacher_today.png', mobile: 'mobile_01_teacher_today.png' },
    { title: '画面 02: 管理者ダッシュボード（送迎スケジュール一覧）', desc: '過去・未来の全送迎一覧。ステータス絞り込み（予約中・完了・取消）', desktop: 'desktop_02_teacher_all_rides.png', mobile: 'mobile_02_teacher_all_rides.png' },
    { title: '画面 03: 管理者ダッシュボード（生徒台帳 & チケット管理）', desc: '生徒情報、住所、連絡先、残チケットバッジ（緑/黄/赤）、チャージ', desktop: 'desktop_03_teacher_students.png', mobile: 'mobile_03_teacher_students.png' },
    { title: '画面 04: 新規生徒登録モーダル', desc: '新入生徒・保護者の基本情報と初期購入チケットの一括登録', desktop: 'desktop_04_modal_add_student.png', mobile: 'mobile_04_modal_add_student.png' },
    { title: '画面 05: チケット購入・追加モーダル', desc: '5回券（¥5,000）/ 10回券（¥10,000）のワンタップ選択チャージ', desktop: 'desktop_05_modal_add_ticket.png', mobile: 'mobile_05_modal_add_ticket.png' },
    { title: '画面 06: 送迎予定の登録モーダル（先生側）', desc: '先生側からのスケジュール代理追加。行き1枚/帰り1枚/往復2枚チップ', desktop: 'desktop_06_modal_add_ride.png', mobile: 'mobile_06_modal_add_ride.png' },
    { title: '画面 07: 送迎利用者ポータル（通常表示：残7回）', desc: 'チケット残高カード（緑）と「片道1回につき1枚消費」の明記', desktop: 'desktop_07_parent_normal.png', mobile: 'mobile_07_parent_normal.png' },
    { title: '画面 08: 送迎利用者ポータル（チケット残少アラート）', desc: '残2回以下で「Mauro・Brenda に連絡してね！」アラートを表示', desktop: 'desktop_08_parent_alert.png', mobile: 'mobile_08_parent_alert.png' },
    { title: '画面 09: 送迎予約申込モーダル（保護者側）', desc: '保護者がフレックス予約。残少時の事前警告メッセージ', desktop: 'desktop_09_parent_modal_ride.png', mobile: 'mobile_09_parent_modal_ride.png' },
    { title: '画面 10: Google連携設定画面', desc: 'Googleスプレッドシート・カレンダー自動同期用のGASスクリプト設定', desktop: 'desktop_10_settings_google.png', mobile: 'mobile_10_settings_google.png' },
  ];

  let htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Mauro & Brenda Taxi Link 画面デザイン仕様書</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Meiryo", sans-serif; margin: 0; padding: 24px; color: #1e293b; background: #fff; }
      .header { border-bottom: 3px solid #059669; padding-bottom: 12px; margin-bottom: 24px; }
      .header h1 { font-size: 22px; color: #059669; margin: 0 0 6px 0; }
      .header p { font-size: 12px; color: #64748b; margin: 0; }
      .page-break { page-break-before: always; padding-top: 16px; }
      .screen-block { margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background: #f8fafc; }
      .screen-title { font-size: 15px; font-weight: bold; color: #0f172a; margin-bottom: 4px; }
      .screen-desc { font-size: 11px; color: #64748b; margin-bottom: 12px; }
      .grid { display: flex; gap: 16px; align-items: flex-start; }
      .desktop-col { flex: 7; }
      .mobile-col { flex: 3; }
      .img-wrapper { border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
      .img-wrapper img { width: 100%; display: block; height: auto; }
      .caption { font-size: 10px; font-weight: bold; color: #475569; margin-bottom: 4px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Mauro & Brenda Taxi Link 画面デザイン仕様書（UI/UX Design Specification）</h1>
      <p>英語教室 送迎チケット管理Webアプリケーション | 公開URL: https://kanta13jp1.github.io/eigo-taxi-management/ | 作成日: 2026年10月08日</p>
    </div>
  `;

  screens.forEach((s, idx) => {
    const desktopImg = getBase64Image(s.desktop);
    const mobileImg = getBase64Image(s.mobile);
    const isBreak = idx > 0 && idx % 2 === 0;

    htmlContent += `
      ${isBreak ? '<div class="page-break"></div>' : ''}
      <div class="screen-block">
        <div class="screen-title">${s.title}</div>
        <div class="screen-desc">${s.desc}</div>
        <div class="grid">
          <div class="desktop-col">
            <div class="caption">🖥️ ブラウザ版 (Desktop: 1280×800)</div>
            <div class="img-wrapper">
              <img src="${desktopImg}" />
            </div>
          </div>
          <div class="mobile-col">
            <div class="caption">📱 スマホ版 (Mobile: 375×812)</div>
            <div class="img-wrapper">
              <img src="${mobileImg}" />
            </div>
          </div>
        </div>
      </div>
    `;
  });

  htmlContent += `</body></html>`;

  await page.setContent(htmlContent, { waitUntil: 'load' });
  const pdfPath = path.join(OUTPUT_DIR, 'Mauro_Brenda_Taxi_Link_画面デザイン仕様書.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' }
  });
  console.log('Saved Design PDF:', pdfPath);
  await page.close();
}

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  await generateDesignPdf(browser);

  // Markdown ファイルも GoogleDrive_Upload にコピー
  const mdDesignSrc = path.resolve('C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screen_design_specification.md');
  const mdDesignDest = path.join(OUTPUT_DIR, 'Mauro_Brenda_Taxi_Link_画面デザイン仕様書.md');
  fs.copyFileSync(mdDesignSrc, mdDesignDest);

  const mdTestSrc = path.resolve('C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/scenario_test_cases.md');
  const mdTestDest = path.join(OUTPUT_DIR, 'Mauro_Brenda_Taxi_Link_シナリオテスト仕様書.md');
  fs.copyFileSync(mdTestSrc, mdTestDest);

  await browser.close();
  console.log('All export files generated successfully!');
}

run().catch(console.error);
