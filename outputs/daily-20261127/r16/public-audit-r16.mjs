import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../../..');
const { chromium } = require(path.join(root, '.manual-build-20261020/node_modules/playwright'));

const BASE_URL = 'https://eigo-taxi-test.web.app';
const OUT_DIR = path.join(root, 'outputs/daily-20261127/r16');
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

    await record('LIVE-R16-01', 'Live release.json matches deployed sourceDigest', async () => {
      const res = await page.request.get(`${BASE_URL}/release.json`);
      assert.equal(res.status(), 200);
      const liveRel = await res.json();
      assert.equal(liveRel.sourceDigest, expectedDigest);
      return liveRel;
    });

    await page.goto(`${BASE_URL}/#/admin`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: '管理者デモを開く' }).click();
    await page.getByRole('heading', { name: /本日（.*）の送迎予定/ }).waitFor();

    const todayShot = path.join(SHOT_DIR, 'admin-today-1280.png');
    await page.screenshot({ path: todayShot, fullPage: true });
    report.screenshots.push('outputs/daily-20261127/r16/screenshots/admin-today-1280.png');

    await record('LIVE-R16-02', 'Admin Today tab shows direct cancel button and passes DOM standards at 1280x900', async () => {
      const std = await auditDomStandards(page);
      assert.equal(std.deadMatches.length, 0, 'no dead Tailwind v4 classes');
      assert.equal(std.headingSkips.length, 0, 'no heading skips');
      assert.ok(std.overflowX <= 0, `overflowX=${std.overflowX}`);
      const cancelBtns = page.locator('button[aria-label$="の予約を取消"]');
      const count = await cancelBtns.count();
      assert.ok(count >= 1, 'at least one direct cancel button in Today tab');
      return { directCancelButtons: count, ...std };
    });

    await record('LIVE-R16-03', 'Admin cancel modal uses useModalDialog (overflow lock, Tab trap, Escape restore, confirm -> #main-content fallback)', async () => {
      const firstCancelBtn = page.locator('button[aria-label$="の予約を取消"]').first();
      const triggerLabel = await firstCancelBtn.getAttribute('aria-label');
      await firstCancelBtn.click();

      const dialog = page.getByRole('dialog', { name: '予約取消の確認' });
      await dialog.waitFor();
      assert.equal(await dialog.getAttribute('aria-modal'), 'true');
      const overflowLocked = await page.evaluate(() => document.body.style.overflow);
      assert.equal(overflowLocked, 'hidden', 'body scroll locked');
      const initialFocusText = await page.evaluate(() => document.activeElement?.textContent?.trim());
      assert.equal(initialFocusText, '戻る', 'initial focus lands on safe 戻る button');

      const dialogShot = path.join(SHOT_DIR, 'admin-cancel-dialog-1280.png');
      await page.screenshot({ path: dialogShot });
      report.screenshots.push('outputs/daily-20261127/r16/screenshots/admin-cancel-dialog-1280.png');

      // Tab / Shift+Tab focus trap inside dialog
      await page.keyboard.press('Tab');
      const afterTab1 = await page.evaluate(() => ({
        inDialog: Boolean(document.activeElement?.closest('[role="dialog"]')),
        text: document.activeElement?.textContent?.trim(),
      }));
      assert.equal(afterTab1.inDialog, true);
      assert.equal(afterTab1.text, '取消を確定');
      await page.keyboard.press('Tab');
      const afterTab2 = await page.evaluate(() => ({
        inDialog: Boolean(document.activeElement?.closest('[role="dialog"]')),
        text: document.activeElement?.textContent?.trim(),
      }));
      assert.equal(afterTab2.inDialog, true);
      assert.equal(afterTab2.text, '戻る');
      await page.keyboard.press('Shift+Tab');
      const afterShiftTab = await page.evaluate(() => ({
        inDialog: Boolean(document.activeElement?.closest('[role="dialog"]')),
        text: document.activeElement?.textContent?.trim(),
      }));
      assert.equal(afterShiftTab.inDialog, true);
      assert.equal(afterShiftTab.text, '取消を確定');

      // Escape dismiss restores body overflow & trigger focus; ride remains scheduled
      await page.keyboard.press('Escape');
      assert.equal(await dialog.count(), 0, 'dialog closed on Escape');
      assert.equal(await page.evaluate(() => document.body.style.overflow), '', 'overflow restored');
      const focusedAfterEsc = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
      assert.equal(focusedAfterEsc, triggerLabel, 'focus restored to trigger button');

      // Re-open and confirm cancellation -> dialog closes, ride cancelled, focus falls back to #main-content
      await firstCancelBtn.click();
      await dialog.waitFor();
      await dialog.getByRole('button', { name: '取消を確定', exact: true }).click();
      await dialog.waitFor({ state: 'detached' });
      assert.equal(await page.evaluate(() => document.body.style.overflow), '', 'overflow restored after confirm');
      const fallbackFocusId = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
      assert.equal(fallbackFocusId, 'main-content', 'focus falls back to #main-content when trigger unmounts');

      return { triggerLabel, initialFocusText, afterTab1, afterTab2, afterShiftTab, focusedAfterEsc, fallbackFocusId };
    });

    await record('LIVE-R16-04', 'Low-ticket KPI card opens Students tab pre-filtered to <=2 tickets and toggles back cleanly', async () => {
      await page.getByRole('button', { name: /チケット残り2枚以下/ }).click();
      await page.getByRole('heading', { name: '生徒台帳・チケット残数状況' }).waitFor();

      const lowBtn = page.getByRole('button', { name: /残り2枚以下のみ/ });
      const allBtn = page.getByRole('button', { name: /全員 \(/ });
      assert.equal(await lowBtn.getAttribute('aria-pressed'), 'true');
      assert.equal(await allBtn.getAttribute('aria-pressed'), 'false');

      const lowBalances = await page.evaluate(() =>
        Array.from(document.querySelectorAll('span.text-xl.font-black')).map((el) => parseInt(el.textContent || '', 10)),
      );
      assert.ok(lowBalances.length >= 1, 'at least one low-ticket student in demo');
      assert.ok(lowBalances.every((b) => b <= 2), `all displayed balances <= 2: ${lowBalances}`);

      const lowShot = path.join(SHOT_DIR, 'admin-students-low-filter-1280.png');
      await page.screenshot({ path: lowShot, fullPage: true });
      report.screenshots.push('outputs/daily-20261127/r16/screenshots/admin-students-low-filter-1280.png');

      await allBtn.click();
      assert.equal(await allBtn.getAttribute('aria-pressed'), 'true');
      const allBalances = await page.evaluate(() =>
        Array.from(document.querySelectorAll('span.text-xl.font-black')).map((el) => parseInt(el.textContent || '', 10)),
      );
      assert.ok(allBalances.length > lowBalances.length, 'all students count exceeds low-ticket count');
      assert.ok(allBalances.some((b) => b > 2), 'students with >2 tickets visible again');

      const std = await auditDomStandards(page);
      assert.equal(std.deadMatches.length, 0);
      assert.equal(std.headingSkips.length, 0);
      assert.ok(std.overflowX <= 0);
      return { lowBalances, allBalances, ...std };
    });

    await ctxDesktop.close();

    // 2. Mobile 375x667 Admin Today & Parent Cancel Dialog
    const ctxMobile = await browser.newContext({ viewport: { width: 375, height: 667 } });
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
    await mPage.getByRole('heading', { name: /本日（.*）の送迎予定/ }).waitFor();

    await record('LIVE-R16-05', 'Mobile 375px Admin Today tab wraps direct cancel + complete buttons with 0 horizontal overflow', async () => {
      const std = await auditDomStandards(mPage);
      assert.equal(std.deadMatches.length, 0);
      assert.equal(std.headingSkips.length, 0);
      assert.ok(std.overflowX <= 0, `mobile admin overflowX=${std.overflowX}`);
      const mAdminShot = path.join(SHOT_DIR, 'admin-today-375.png');
      await mPage.screenshot({ path: mAdminShot, fullPage: true });
      report.screenshots.push('outputs/daily-20261127/r16/screenshots/admin-today-375.png');
      return std;
    });

    // Switch to Parent Demo at 375x667
    await mPage.getByRole('button', { name: 'ログアウト' }).click();
    await mPage.goto(`${BASE_URL}/#/parent`, { waitUntil: 'networkidle' });
    await mPage.getByRole('button', { name: '保護者デモを開く' }).click();
    await mPage.getByRole('heading', { name: /現在予約中の送迎/ }).waitFor();

    await record('LIVE-R16-06', 'Mobile 375px Parent cancel dialog locks scroll, traps focus, restores on Escape, and confirms cleanly', async () => {
      const cancelBtn = mPage.getByRole('button', { name: /の予約をキャンセル/ }).first();
      const triggerLabel = await cancelBtn.getAttribute('aria-label');
      await cancelBtn.click();

      const dialog = mPage.getByRole('dialog', { name: '予約取消の確認' });
      await dialog.waitFor();
      assert.equal(await dialog.getAttribute('aria-modal'), 'true');
      assert.equal(await mPage.evaluate(() => document.body.style.overflow), 'hidden');
      assert.equal(await mPage.evaluate(() => document.activeElement?.textContent?.trim()), '戻る');

      const mParentShot = path.join(SHOT_DIR, 'parent-cancel-dialog-375.png');
      await mPage.screenshot({ path: mParentShot });
      report.screenshots.push('outputs/daily-20261127/r16/screenshots/parent-cancel-dialog-375.png');

      await mPage.keyboard.press('Tab');
      assert.equal(await mPage.evaluate(() => document.activeElement?.textContent?.trim()), '取消を確定');
      await mPage.keyboard.press('Escape');
      assert.equal(await dialog.count(), 0);
      assert.equal(await mPage.evaluate(() => document.body.style.overflow), '');
      assert.equal(await mPage.evaluate(() => document.activeElement?.getAttribute('aria-label')), triggerLabel);

      await cancelBtn.click();
      await dialog.waitFor();
      await dialog.getByRole('button', { name: '取消を確定', exact: true }).click();
      await dialog.waitFor({ state: 'detached' });
      assert.equal(await mPage.evaluate(() => document.body.style.overflow), '');
      const fallbackFocusId = await mPage.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
      assert.equal(fallbackFocusId, 'main-content');

      const std = await auditDomStandards(mPage);
      assert.equal(std.deadMatches.length, 0);
      assert.equal(std.headingSkips.length, 0);
      assert.ok(std.overflowX <= 0, `mobile parent overflowX=${std.overflowX}`);
      return { triggerLabel, fallbackFocusId, ...std };
    });

    await ctxMobile.close();

    assert.equal(report.pageErrors.length, 0, `pageErrors: ${report.pageErrors}`);
    assert.equal(report.consoleErrors.length, 0, `consoleErrors: ${report.consoleErrors}`);
    report.pass = true;
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(OUT_DIR, 'public-ui-r16.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  }

  console.log(`ALL ${report.checks.length}/6 LIVE PUBLIC AUDIT CHECKS PASSED`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
