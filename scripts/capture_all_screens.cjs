const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.resolve('C:/Users/kanta/.gemini/antigravity/brain/f13af8ae-0c47-431f-a942-5a5423722165/screenshots');
const APP_URL = 'https://kanta13jp1.github.io/eigo-taxi-management/';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800, isMobile: false, hasTouch: false },
  { name: 'mobile', width: 375, height: 812, isMobile: true, hasTouch: true },
];

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const vp of VIEWPORTS) {
    console.log(`\n=== Capturing for ${vp.name.toUpperCase()} (${vp.width}x${vp.height}) ===`);
    const page = await browser.newPage();
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 2,
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
    });

    // ページロード
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));

    // 1. 先生用ダッシュボード: 本日の送迎
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${vp.name}_01_teacher_today.png`) });
    console.log(`Saved: ${vp.name}_01_teacher_today.png`);

    // 2. 先生用ダッシュボード: 送迎スケジュール一覧
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('送迎スケジュール一覧'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${vp.name}_02_teacher_all_rides.png`) });
    console.log(`Saved: ${vp.name}_02_teacher_all_rides.png`);

    // 3. 先生用ダッシュボード: 生徒・チケット管理
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('生徒・チケット管理'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${vp.name}_03_teacher_students.png`) });
    console.log(`Saved: ${vp.name}_03_teacher_students.png`);

    // 4. モーダル: 新規生徒登録
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('新規生徒を登録'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${vp.name}_04_modal_add_student.png`) });
    console.log(`Saved: ${vp.name}_04_modal_add_student.png`);

    // モーダルを閉じる
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button svg.lucide-x')?.closest('button');
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // 5. モーダル: チケット追加
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('チケット追加'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${vp.name}_05_modal_add_ticket.png`) });
    console.log(`Saved: ${vp.name}_05_modal_add_ticket.png`);

    // モーダルを閉じる
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button svg.lucide-x')?.closest('button');
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // 6. モーダル: 送迎予定を追加（先生視点）
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('送迎予定を追加'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${vp.name}_06_modal_add_ride.png`) });
    console.log(`Saved: ${vp.name}_06_modal_add_ride.png`);

    // モーダルを閉じる
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button svg.lucide-x')?.closest('button');
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // 7. 保護者ポータル: 田中 陽菜さん（通常・残数7回）
    await page.evaluate(() => {
      const tabBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('送迎利用者用'));
      if (tabBtn) tabBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));
    await page.evaluate(() => {
      const select = document.querySelector('select');
      if (select) {
        select.value = 'STU-001';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${vp.name}_07_parent_normal.png`) });
    console.log(`Saved: ${vp.name}_07_parent_normal.png`);

    // 8. 保護者ポータル: 山本 颯太さん（残1回、アラート表示）
    await page.evaluate(() => {
      const select = document.querySelector('select');
      if (select) {
        select.value = 'STU-002';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${vp.name}_08_parent_alert.png`) });
    console.log(`Saved: ${vp.name}_08_parent_alert.png`);

    // 9. 保護者ポータル: 送迎予約申込モーダル（保護者視点）
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('送迎の予約を申し込む'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${vp.name}_09_parent_modal_ride.png`) });
    console.log(`Saved: ${vp.name}_09_parent_modal_ride.png`);

    // モーダルを閉じる
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button svg.lucide-x')?.closest('button');
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // 10. Google連携設定画面
    await page.evaluate(() => {
      const tabBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Google連携'));
      if (tabBtn) tabBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${vp.name}_10_settings_google.png`) });
    console.log(`Saved: ${vp.name}_10_settings_google.png`);

    await page.close();
  }

  await browser.close();
  console.log('\nAll screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
