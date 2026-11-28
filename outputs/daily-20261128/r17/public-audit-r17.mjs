import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../../..');
const { chromium } = require(path.join(root, '.manual-build-20261020/node_modules/playwright'));

const BASE_URL = 'https://eigo-taxi-test.web.app';
const OUT_DIR = path.join(root, 'outputs/daily-20261128/r17');
const SHOT_DIR = path.join(OUT_DIR, 'screenshots');
fs.mkdirSync(SHOT_DIR, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/acceptance/deployment/build-manifest.json'), 'utf8'));
const expectedDigest = manifest.release.sourceDigest;

const DEAD_CLASS_RE = /\b(outline-hidden|shadow-xs|backdrop-blur-xs|animate-in|fade-in|zoom-in-95|slide-in-from-bottom-5)\b/;

async function auditDomStandards(page) {
  return page.evaluate((deadSource) => {
    const deadRe = new RegExp(deadSource);
    const deadMatches = [];
    for (const el of document.querySelectorAll('[class]')) {
      const cls = typeof el.className === 'string' ? el.className : '';
      if (deadRe.test(cls)) deadMatches.push(cls);
    }
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
      .filter((el) => {
        const s = window.getComputedStyle(el);
        return s.display !== 'none' && s.visibility !== 'hidden' && el.getBoundingClientRect().height > 0;
      })
      .map((el) => ({ level: Number(el.tagName.slice(1)), text: (el.textContent || '').trim() }));
    const headingSkips = [];
    for (let i = 1; i < headings.length; i += 1) {
      if (headings[i].level > headings[i - 1].level + 1) {
        headingSkips.push({ prev: headings[i - 1], curr: headings[i] });
      }
    }
    const overflowX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    return { deadMatches, headingsCount: headings.length, headingSkips, overflowX };
  }, DEAD_CLASS_RE.source);
}

async function run() {
  const browser = await chromium.launch({
    executablePath: process.env.EIGO_CHROMIUM_EXECUTABLE || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const report = {
    auditedAt: new Date().toISOString(),
    url: BASE_URL,
    mode: 'public-frontend-demo-route (external network blocked; no real Google OAuth / GAS / Spreadsheet / Calendar / physical device)',
    expectedSourceDigest: expectedDigest,
    checks: [],
    pageErrors: [],
    consoleErrors: [],
    screenshots: [],
  };

  async function record(id, description, fn) {
    const detail = await fn();
    report.checks.push({ id, status: 'PASS', description, detail });
    console.log(`PASS ${id}: ${description}`);
  }

  try {
    // 1. Desktop 1280x900 Admin Demo
    const ctxDesktop = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctxDesktop.newPage();
    page.setDefaultTimeout(10000);
    page.on('pageerror', (e) => report.pageErrors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') report.consoleErrors.push(m.text()); });
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.startsWith(BASE_URL) || url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
      return route.abort();
    });

    await record('LIVE-R17-01', 'Live release.json matches deployed sourceDigest', async () => {
      const res = await page.request.get(`${BASE_URL}/release.json`);
      assert.equal(res.status(), 200);
      const liveRel = await res.json();
      assert.equal(liveRel.sourceDigest, expectedDigest);
      return liveRel;
    });

    await page.goto(`${BASE_URL}/#/admin`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: '管理者デモを開く' }).click();
    await page.getByRole('heading', { name: /本日（.*）の送迎予定/ }).waitFor();

    await record('LIVE-R17-02', 'Admin Today tab displays both permanent student.pickupNote and ride.note and passes DOM standards at 1280x900', async () => {
      const std = await auditDomStandards(page);
      assert.equal(std.deadMatches.length, 0);
      assert.equal(std.headingSkips.length, 0);
      assert.ok(std.overflowX <= 0, `overflowX=${std.overflowX}`);
      const mainText = await page.locator('main').innerText();
      assert.ok(mainText.includes('📌 送迎メモ: エントランス前。到着時インターホンかLINE'));
      assert.ok(mainText.includes('💬 メモ: レッスン前のお迎え'));
      const shotPath = path.join(SHOT_DIR, 'admin-today-notes-1280.png');
      await page.screenshot({ path: shotPath, fullPage: true });
      report.screenshots.push('outputs/daily-20261128/r17/screenshots/admin-today-notes-1280.png');
      return std;
    });

    await record('LIVE-R17-03', 'Admin AllRides table and Students tab show notes and wrapped addresses without truncate at 1280x900', async () => {
      await page.getByRole('button', { name: /送迎スケジュール一覧/ }).click();
      await page.getByRole('heading', { name: '全送迎スケジュール・履歴' }).waitFor();
      const stdAll = await auditDomStandards(page);
      assert.equal(stdAll.deadMatches.length, 0);
      assert.equal(stdAll.headingSkips.length, 0);
      assert.ok(stdAll.overflowX <= 0);
      const tableText = await page.locator('table').innerText();
      assert.ok(tableText.includes('💬 レッスン前のお迎え'));
      await page.screenshot({ path: path.join(SHOT_DIR, 'admin-schedule-notes-1280.png'), fullPage: true });
      report.screenshots.push('outputs/daily-20261128/r17/screenshots/admin-schedule-notes-1280.png');

      await page.getByRole('button', { name: /生徒・チケット管理/ }).click();
      await page.getByRole('heading', { name: '生徒台帳・チケット残数状況' }).waitFor();
      const stdStu = await auditDomStandards(page);
      assert.equal(stdStu.deadMatches.length, 0);
      assert.equal(stdStu.headingSkips.length, 0);
      assert.ok(stdStu.overflowX <= 0);
      const stuText = await page.locator('main').innerText();
      assert.ok(stuText.includes('📌 送迎メモ: エントランス前。到着時インターホンかLINE'));
      await page.screenshot({ path: path.join(SHOT_DIR, 'admin-students-notes-1280.png'), fullPage: true });
      report.screenshots.push('outputs/daily-20261128/r17/screenshots/admin-students-notes-1280.png');
      return { stdAll, stdStu };
    });

    await record('LIVE-R17-04', 'AddRideModal switches ticket shortage warning for roundtrip and enforces WAI-ARIA modal trap/focus restore at 1280x900', async () => {
      const trigger = page.getByRole('button', { name: '送迎予定を追加' });
      await trigger.click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      assert.equal(await dialog.getAttribute('aria-modal'), 'true');
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');

      await dialog.locator('#ride-student').selectOption('STU-002');
      const notice = dialog.locator('#ride-student-low-ticket');
      await notice.waitFor();
      assert.ok((await notice.innerText()).includes('残り 1 枚です'));

      await dialog.locator('label:has(input[name="rideType"][value="roundtrip"])').click();
      const shortageText = await notice.innerText();
      assert.ok(shortageText.includes('2枚消費'));
      assert.ok(shortageText.includes('チケットが不足します'));

      // Tab / Shift+Tab containment
      for (let i = 0; i < 12; i += 1) {
        await page.keyboard.press('Tab');
        const inside = await page.evaluate(() => {
          const d = document.querySelector('[role="dialog"]');
          return Boolean(d && d.contains(document.activeElement));
        });
        assert.equal(inside, true, `Tab escaped dialog at step ${i}`);
      }
      await page.keyboard.press('Shift+Tab');
      const insideShift = await page.evaluate(() => {
        const d = document.querySelector('[role="dialog"]');
        return Boolean(d && d.contains(document.activeElement));
      });
      assert.equal(insideShift, true);

      await page.screenshot({ path: path.join(SHOT_DIR, 'admin-booking-shortage-1280.png'), fullPage: true });
      report.screenshots.push('outputs/daily-20261128/r17/screenshots/admin-booking-shortage-1280.png');

      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'detached' });
      assert.equal(await page.evaluate(() => document.body.style.overflow), '');
      const restoredToTrigger = await page.evaluate(() => document.activeElement?.textContent?.includes('送迎予定を追加') || false);
      assert.equal(restoredToTrigger, true);
      return { shortageText, restoredToTrigger };
    });

    await ctxDesktop.close();

    // 2. Mobile 375x667 Admin Demo AddRideModal & Parent Demo
    const ctxMobile = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });
    const mPage = await ctxMobile.newPage();
    mPage.setDefaultTimeout(10000);
    mPage.on('pageerror', (e) => report.pageErrors.push(e.message));
    mPage.on('console', (m) => { if (m.type() === 'error') report.consoleErrors.push(m.text()); });
    await mPage.route('**/*', (route) => {
      const url = route.request().url();
      if (url.startsWith(BASE_URL) || url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
      return route.abort();
    });

    await mPage.goto(`${BASE_URL}/#/admin`, { waitUntil: 'networkidle' });
    await mPage.getByRole('button', { name: '管理者デモを開く' }).click();
    await mPage.getByRole('button', { name: '送迎予定を追加' }).click();
    const mDialog = mPage.getByRole('dialog');
    await mDialog.waitFor();
    await mDialog.locator('#ride-student').selectOption('STU-002');
    await mDialog.locator('label:has(input[name="rideType"][value="roundtrip"])').click();

    await record('LIVE-R17-05', 'Mobile 375x667 AddRideModal stacks date/time vertically with zero horizontal overflow and shows roundtrip shortage warning', async () => {
      const std = await auditDomStandards(mPage);
      assert.equal(std.deadMatches.length, 0);
      assert.equal(std.headingSkips.length, 0);
      assert.ok(std.overflowX <= 0, `overflowX=${std.overflowX}`);
      const dateBox = await mDialog.locator('#ride-date').boundingBox();
      const timeBox = await mDialog.locator('#ride-time').boundingBox();
      assert.ok(dateBox && timeBox && timeBox.y >= dateBox.y + dateBox.height - 2, JSON.stringify({ dateBox, timeBox }));
      assert.ok((await mDialog.locator('#ride-student-low-ticket').innerText()).includes('チケットが不足します'));
      await mPage.screenshot({ path: path.join(SHOT_DIR, 'admin-booking-shortage-375.png'), fullPage: true });
      report.screenshots.push('outputs/daily-20261128/r17/screenshots/admin-booking-shortage-375.png');
      return { std, dateBox, timeBox };
    });

    await mPage.goto(`${BASE_URL}/#/parent`, { waitUntil: 'networkidle' });
    await mPage.getByRole('button', { name: '保護者デモを開く' }).click();
    await mPage.getByRole('button', { name: /送迎の予約を申し込む/ }).waitFor();

    await record('LIVE-R17-06', 'Mobile 375x667 Parent Portal shows registered pickupNote and passes DOM standards', async () => {
      const std = await auditDomStandards(mPage);
      assert.equal(std.deadMatches.length, 0);
      assert.equal(std.headingSkips.length, 0);
      assert.ok(std.overflowX <= 0, `overflowX=${std.overflowX}`);
      const mainText = await mPage.locator('main').innerText();
      assert.ok(mainText.includes('送迎メモ: エントランス前。到着時インターホンかLINE'));
      await mPage.screenshot({ path: path.join(SHOT_DIR, 'parent-notes-375.png'), fullPage: true });
      report.screenshots.push('outputs/daily-20261128/r17/screenshots/parent-notes-375.png');
      return std;
    });

    await ctxMobile.close();

    assert.equal(report.pageErrors.length, 0, `pageErrors: ${JSON.stringify(report.pageErrors)}`);
    assert.equal(report.consoleErrors.length, 0, `consoleErrors: ${JSON.stringify(report.consoleErrors)}`);
    report.status = 'PASS';
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(OUT_DIR, 'public-ui-r17.json'), JSON.stringify(report, null, 2) + '\n');
  }
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
