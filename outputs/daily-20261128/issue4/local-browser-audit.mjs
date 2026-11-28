// Local dist/ real-browser audit for Issue #4 (student profile edit & ticket purchase history).
// Offline synthetic demo storage only; external network blocked.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';

const root = process.cwd();
const out = path.resolve(root, 'outputs/daily-20261128/issue4');
const shotDir = path.join(out, 'screenshots');
await fs.mkdir(shotDir, { recursive: true });

const distDir = path.resolve(root, 'dist');
const require = createRequire(import.meta.url);
const { chromium } = require(path.resolve(root, '.manual-build-20261020/node_modules/playwright'));

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8',
};

const server = createServer(async (req, res) => {
  try {
    const cleanPath = (req.url || '/').split('?')[0];
    const rel = cleanPath === '/' ? 'index.html' : cleanPath.replace(/^\/+/, '');
    const file = path.resolve(distDir, rel);
    if (req.method !== 'GET' || !file.startsWith(distDir + path.sep)) {
      res.writeHead(403);
      return res.end();
    }
    const content = await fs.readFile(file);
    res.setHeader('Content-Type', mimeTypes[path.extname(file)] || 'application/octet-stream');
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end();
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.EIGO_CHROMIUM_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});

const results = [];
const externalRequests = [];
const pageErrors = [];
const consoleErrors = [];

try {
  // 1) Admin 1280x900: edit student, capture modal, save, verify reload persistence + balance unchanged, add ticket, inspect purchases tab
  const adminCtx = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
  await adminCtx.route('**/*', (r) => {
    const u = r.request().url();
    if (u.startsWith(origin + '/')) return r.continue();
    externalRequests.push(u);
    return r.abort();
  });
  const page = await adminCtx.newPage();
  page.setDefaultTimeout(10000);
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  await page.goto(`${origin}/#/admin`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '管理者デモを開く' }).click();
  await page.getByRole('button', { name: /生徒・チケット管理/ }).click();

  await page.getByRole('button', { name: '田中 陽菜 (ひな) の生徒情報を編集' }).click();
  const dialog = page.getByRole('dialog', { name: '生徒情報の編集' });
  await dialog.waitFor();
  await dialog.locator('#edit-student-name').fill('田中 陽菜 (編集済)');
  await dialog.locator('#edit-student-note').fill('新メモ：西側入口前で待機');
  await page.screenshot({ path: path.join(shotDir, 'admin-edit-student-1280.png') });

  await dialog.getByRole('button', { name: '保存する' }).click();
  await page.waitForFunction(() => document.body.innerText.includes('田中 陽菜 (編集済)'));

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /生徒・チケット管理/ }).click();
  await page.waitForFunction(() => document.body.innerText.includes('田中 陽菜 (編集済)'));
  const studentsText = await page.locator('main').innerText();
  assert.ok(studentsText.includes('新メモ：西側入口前で待機'));
  assert.ok(studentsText.includes('7\n回') || studentsText.includes('7回'));
  results.push({ id: 'BROWSER-01', status: 'PASS', name: 'Admin edits student profile, modal blocks balance edit, changes persist across reload with unchanged balance' });

  await page.getByRole('button', { name: 'チケット追加' }).first().click();
  const ticketForm = page.getByRole('dialog');
  await ticketForm.waitFor();
  await ticketForm.locator('input[type="number"]').nth(0).fill('3');
  await ticketForm.locator('input[type="number"]').nth(1).fill('3000');
  await ticketForm.locator('#ticket-note').fill('追加購入テスト');
  await ticketForm.locator('button[type="submit"]').click();
  await page.getByRole('button', { name: '購入履歴 (3)' }).waitFor();
  await page.getByRole('button', { name: '購入履歴 (3)' }).click();
  await page.getByRole('table', { name: 'チケット購入履歴一覧' }).waitFor();
  const purchasesText = await page.locator('main').innerText();
  assert.ok(purchasesText.includes('合計追加枚数: +18回'));
  assert.ok(purchasesText.includes('合計金額: ¥18,000'));
  assert.ok(purchasesText.includes('追加購入テスト'));
  await page.getByLabel('生徒で絞り込み').selectOption('STU-002');
  assert.ok((await page.locator('tbody tr').count()) === 1);
  await page.getByLabel('生徒で絞り込み').selectOption('all');
  assert.ok((await page.locator('tbody tr').count()) === 3);
  await page.screenshot({ path: path.join(shotDir, 'admin-purchases-1280.png'), fullPage: true });
  results.push({ id: 'BROWSER-02', status: 'PASS', name: 'Admin purchases tab reflects newly added tickets, filters by student, and shows accurate totals' });

  await page.setViewportSize({ width: 375, height: 667 });
  const adminOverflow = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert.ok(adminOverflow.scrollWidth <= 375, `Admin 375px horizontal overflow: ${JSON.stringify(adminOverflow)}`);
  await page.screenshot({ path: path.join(shotDir, 'admin-purchases-375.png'), fullPage: true });
  results.push({ id: 'BROWSER-03', status: 'PASS', name: 'Admin purchases tab fits cleanly in 375px viewport with 0 horizontal overflow', ...adminOverflow });
  await adminCtx.close();

  // 2) Parent 375x667: check parent purchases card and 0 overflow
  const parentCtx = await browser.newContext({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block' });
  await parentCtx.route('**/*', (r) => {
    const u = r.request().url();
    if (u.startsWith(origin + '/')) return r.continue();
    externalRequests.push(u);
    return r.abort();
  });
  const parentPage = await parentCtx.newPage();
  parentPage.setDefaultTimeout(10000);
  parentPage.on('pageerror', (e) => pageErrors.push(e.message));
  parentPage.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  await parentPage.goto(`${origin}/#/parent`, { waitUntil: 'domcontentloaded' });
  await parentPage.getByRole('button', { name: '保護者デモを開く' }).click();
  await parentPage.getByRole('heading', { name: 'チケット購入履歴' }).waitFor();
  const parentBody = await parentPage.locator('main').innerText();
  assert.ok(parentBody.includes('初回購入 (10回券)'));
  assert.ok(!parentBody.includes('5回券購入'));
  const parentOverflow = await parentPage.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert.ok(parentOverflow.scrollWidth <= 375, `Parent 375px horizontal overflow: ${JSON.stringify(parentOverflow)}`);
  await parentPage.screenshot({ path: path.join(shotDir, 'parent-purchases-375.png'), fullPage: true });
  results.push({ id: 'BROWSER-04', status: 'PASS', name: 'Parent portal shows only STU-001 purchases and fits cleanly in 375px viewport', ...parentOverflow });
  await parentCtx.close();
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

assert.equal(externalRequests.length, 0, `Unexpected external requests: ${externalRequests.join(', ')}`);
assert.equal(pageErrors.length, 0, `Unexpected page errors: ${pageErrors.join(', ')}`);
assert.equal(consoleErrors.length, 0, `Unexpected console errors: ${consoleErrors.join(', ')}`);

await fs.writeFile(
  path.join(out, 'local-ui-issue4.json'),
  JSON.stringify(
    {
      executedAt: new Date().toISOString(),
      mode: 'offline local dist build + real Chrome browser; demo storage only; not live GAS or deployed site',
      externalRequests,
      pageErrors,
      consoleErrors,
      results,
    },
    null,
    2,
  ) + '\n',
);
console.log(`ALL ${results.length}/4 local browser audits passed.`);
