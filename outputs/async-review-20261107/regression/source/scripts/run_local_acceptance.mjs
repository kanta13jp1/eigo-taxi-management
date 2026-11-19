// Local mock rehearsal only. Does not write acceptance/latest-run.json or external services.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createServer as createHttpServer } from 'node:http';
import { assertRuntime, parseArgs, reserveOutput, localRequestAllowed, tokyoDate } from './local_acceptance_safety.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixture = path.join(root, 'scripts/fixtures/local-acceptance');
const require = createRequire(import.meta.url);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const results = [], externalRequests = [], pageErrors = [];
const blockedSockets = [], guardSelfTest = { http: [], sockets: [], status: 'NOT_RUN' };
let out, server, browser, context, page, origin, browserVersion;
let fatalError = null;
const runStartedAt = new Date().toISOString(), date = tokyoDate();
const sourceHashes = {}, buildHashes = {};

async function sourceFiles(dir = 'src') {
  const entries = await fs.readdir(path.join(root, dir), { withFileTypes: true });
  const nested = await Promise.all(entries.map(async e => e.isDirectory() ? sourceFiles(`${dir}/${e.name}`) : [`${dir}/${e.name}`]));
  return nested.flat();
}
async function api(method, ...args) {
  return page.evaluate(async ({ method, args }) => window.__localRehearsalApi[method](...args), { method, args });
}
async function state() { return page.evaluate(() => Object.fromEntries(['students', 'rides', 'purchases'].map(key => [key, JSON.parse(localStorage.getItem('eigo_taxi_' + key) || '[]')]))); }
async function waitState(fn, arg) { await page.waitForFunction(fn, arg); }
async function guardNetwork(c, httpLog = externalRequests, socketLog = blockedSockets) {
  await c.route('**/*', route => {
    const url = route.request().url();
    if (localRequestAllowed(url, origin)) return route.continue();
    httpLog.push({ url: new URL(url).origin, resourceType: route.request().resourceType() });
    return route.abort('blockedbyclient');
  });
  await c.routeWebSocket('**/*', socket => {
    socketLog.push({ origin: new URL(socket.url()).origin });
    socket.close({ code: 1000, reason: 'Local mock rehearsal blocks all WebSockets' });
  });
}
async function boot(role = 'admin', options = {}) {
  await context?.close();
  context = await browser.newContext({ viewport: options.mobile ? { width: 375, height: 667 } : { width: 1280, height: 900 }, timezoneId: 'Asia/Tokyo', isMobile: !!options.mobile, hasTouch: !!options.mobile, serviceWorkers: 'block' });
  await guardNetwork(context);
  page = await context.newPage(); page.setDefaultTimeout(10000);
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  await page.goto(`${origin}/#/${role}`, { waitUntil: 'networkidle' });
  if (options.unauthenticated) return;
  await page.getByRole('button', { name: role === 'admin' ? '管理者デモを開く' : '保護者デモを開く', exact: true }).click();
  await page.getByRole('button', { name: 'ログアウト', exact: true }).waitFor();
  if (role === 'admin') await page.getByRole('button', { name: /送迎スケジュール一覧/ }).waitFor();
  else await page.getByRole('button', { name: /送迎の予約を申し込む/ }).waitFor();
}
async function book(role = 'parent', type = 'pickup', expectFailure = false) {
  await page.getByRole('button', { name: role === 'admin' ? '送迎予定を追加' : /送迎の予約を申し込む/ }).click();
  const form = page.locator('form');
  await form.locator('input[type=date]').fill(date);
  await form.locator('input[type=time]').fill('16:30');
  await form.locator(`label:has(input[name=rideType][value=${type}])`).click();
  await form.locator('input[type=text]').fill('架空のローカル試験場所');
  await form.locator('textarea').fill('LOCAL-ONLY');
  await form.getByRole('button', { name: '送迎予定を登録する', exact: true }).click();
  if (!expectFailure) await form.waitFor({ state: 'detached' });
}
async function check(id, relatedCases, name, fn) {
  const startedAt = new Date().toISOString();
  let row;
  try { await fn(); row = { id, relatedCases, name, status: 'PASS' }; }
  catch (error) { row = { id, relatedCases, name, status: 'FAIL', error: error.message }; }
  if (page && !page.isClosed()) {
    const file = `${id}.png`; await page.screenshot({ path: path.join(out, file), fullPage: true });
    row.screenshot = { file, sha256: hash(await fs.readFile(path.join(out, file))) };
  }
  results.push({ ...row, startedAt, finishedAt: new Date().toISOString() });
  console.log(`${id} ${row.status} ${name}${row.error ? ': ' + row.error : ''}`);
}

async function run() {
  assertRuntime(); ({ out } = parseArgs(process.argv.slice(2))); await reserveOutput(out);
  const files = [...await sourceFiles(), 'package.json', 'package-lock.json', 'scripts/run_local_acceptance.mjs', 'scripts/local_acceptance_safety.mjs', 'scripts/fixtures/local-acceptance/harness.tsx', 'scripts/fixtures/local-acceptance/google-auth.ts', 'scripts/fixtures/local-acceptance/index.html'];
  for (const file of files) sourceHashes[file] = hash(await fs.readFile(path.join(root, file)));
  const { chromium } = require(process.env.EIGO_PLAYWRIGHT_MODULE || path.join(root, '.manual-build-20261020/node_modules/playwright'));
  const { build } = await import(pathToFileURL(path.join(root, 'node_modules/vite/dist/node/index.js')).href);
  const site = path.join(out, 'site');
  // A built fixture has no dev-server HMR client or WebSocket connection.
  await build({ root: fixture, configFile: false, base: '/', resolve: { alias: [{ find: /^\.\/google-auth$/, replacement: path.join(fixture, 'google-auth.ts') }, { find: /^\.\.\/services\/google-auth$/, replacement: path.join(fixture, 'google-auth.ts') }] },
    build: { outDir: site, emptyOutDir: false }, css: { postcss: root } });
  for (const file of await sourceFiles(path.relative(root, site).replaceAll('\\', '/'))) buildHashes[path.relative(site, path.join(root, file)).replaceAll('\\', '/')] = hash(await fs.readFile(path.join(root, file)));
  server = createHttpServer(async (req, res) => {
    try {
      if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }
      const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
      const file = path.resolve(site, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(site + path.sep)) { res.writeHead(403); res.end(); return; }
      const bytes = await fs.readFile(file);
      res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' })[path.extname(file)] || 'application/octet-stream');
      res.end(bytes);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true, ...(process.env.EIGO_CHROMIUM_EXECUTABLE ? { executablePath: process.env.EIGO_CHROMIUM_EXECUTABLE } : {}) });
  browserVersion = browser.version();

  // Intentional invalid-domain probes are intercepted before any server connection.
  // Use a separate context/log so they cannot mask unexpected requests in UI cases.
  const probe = await browser.newContext({ serviceWorkers: 'block' });
  try {
    await guardNetwork(probe, guardSelfTest.http, guardSelfTest.sockets);
    const p = await probe.newPage(); await p.goto(origin, { waitUntil: 'networkidle' });
    const blocked = await p.evaluate(async () => {
      let fetchFailed = false;
      try { await fetch('https://eigo-local-probe.invalid/blocked'); } catch { fetchFailed = true; }
      const socketEnded = await new Promise(resolve => {
        const socket = new WebSocket('wss://eigo-local-probe.invalid/blocked');
        socket.onclose = () => resolve(true); socket.onerror = () => resolve(true);
        setTimeout(() => { socket.close(); resolve(false); }, 2000);
      });
      return { fetchFailed, socketEnded };
    });
    assert.equal(blocked.fetchFailed, true); assert.equal(blocked.socketEnded, true);
    assert.equal(guardSelfTest.http.length, 1); assert.equal(guardSelfTest.sockets.length, 1);
    guardSelfTest.status = 'PASS';
  } finally { await probe.close(); }

  await check('LOCAL-UI-01', ['AT-01', 'AT-19'], 'Current admin login has no endpoint/key fields and no ledger before demo login', async () => {
    await boot('admin', { unauthenticated: true });
    assert.equal(await page.locator('input').count(), 0);
    await assert.rejects(() => api('getStudents'));
    assert.ok(!(await page.locator('main').innerText()).includes('田中'));
  });
  await check('LOCAL-UI-02', ['AT-03', 'AT-20'], 'Parent demo displays only its assigned student and the one-way rule', async () => {
    await boot('parent'); assert.equal(await page.locator('select option').count(), 1);
    assert.ok((await page.locator('main').innerText()).includes('片道1回につきチケット1枚'));
    assert.deepEqual((await api('getStudents')).map(s => s.id), ['STU-001']);
    await assert.rejects(() => api('getStudentById', 'STU-002'));
  });
  for (const [type, related] of [['pickup', 'AT-06'], ['dropoff', 'AT-07'], ['roundtrip', 'AT-08']]) {
    await check(`LOCAL-UI-${{ pickup: '03', dropoff: '04', roundtrip: '05' }[type]}`, [related], `${type} booking uses current form, JST run date, and preserves balance`, async () => {
      await boot('parent'); const before = await state(); await book('parent', type); const after = await state();
      const ride = after.rides.find(r => !before.rides.some(old => old.id === r.id));
      assert.equal(after.rides.length, before.rides.length + 1);
      assert.deepEqual([ride.rideType, ride.rideDate, ride.rideTime, ride.reservedBy, ride.status], [type, date, '16:30', 'parent', 'scheduled']);
      assert.equal(after.students[0].ticketBalance, before.students[0].ticketBalance);
      await page.reload({ waitUntil: 'networkidle' }); assert.ok((await api('getRides')).some(r => r.id === ride.id));
    });
  }
  await check('LOCAL-UI-06', ['AT-09'], 'Admin booking uses admin entry and records teacher origin', async () => {
    await boot(); const before = await state(); await book('admin');
    const ride = (await state()).rides.find(r => !before.rides.some(old => old.id === r.id)); assert.equal(ride.reservedBy, 'teacher');
  });
  await check('LOCAL-UI-07', ['AT-10', 'AT-22'], 'Parent cancels a newly booked reservation through its current UI; balance unchanged after reload', async () => {
    await boot('parent'); const before = await state(); await book();
    const ride = (await state()).rides.find(r => !before.rides.some(old => old.id === r.id));
    // Unique memo is part of the visible booking card; choose the smallest card with its cancel button.
    await page.getByText('LOCAL-ONLY', { exact: true }).locator('../..').getByRole('button', { name: /キャンセル/ }).click();
    await waitState(id => JSON.parse(localStorage.getItem('eigo_taxi_rides')).find(r => r.id === id)?.status === 'cancelled', ride.id);
    assert.equal((await state()).students[0].ticketBalance, before.students[0].ticketBalance);
    await page.reload({ waitUntil: 'networkidle' }); assert.equal((await api('getRides')).find(r => r.id === ride.id).status, 'cancelled');
  });
  for (const [type, consume, id] of [['pickup', 1, '08'], ['roundtrip', 2, '09']]) {
    await check(`LOCAL-UI-${id}`, [consume === 1 ? 'AT-13' : 'AT-14', 'AT-15'], `${type} completion consumes ${consume} and replay consumes zero`, async () => {
      await boot(); const before = await state(); await book('admin', type);
      const ride = (await state()).rides.find(r => !before.rides.some(old => old.id === r.id));
      const result = await api('completeRide', ride.id); assert.equal(result.consumedTickets, consume);
      assert.equal((await api('getStudentById', ride.studentId)).ticketBalance, before.students[0].ticketBalance - consume);
      const replay = await api('completeRide', ride.id); assert.equal(replay.consumedTickets, 0);
      await page.reload({ waitUntil: 'networkidle' }); assert.equal((await api('getRides')).find(r => r.id === ride.id).status, 'completed');
    });
  }
  await check('LOCAL-UI-10', ['AT-16'], 'Cancelled reservation cannot complete or consume tickets', async () => {
    await boot(); const before = await state(); const r = await api('createReservation', { studentId: 'STU-001', rideDate: date, rideTime: '16:30', rideType: 'pickup', pickupLocation: '架空', reservedBy: 'teacher' });
    await api('cancelReservation', r.id); assert.equal((await api('completeRide', r.id)).success, false);
    assert.equal((await api('getStudentById', 'STU-001')).ticketBalance, before.students[0].ticketBalance);
  });
  await check('LOCAL-UI-11', ['AT-17', 'AT-20'], 'Invalid ticket input and parent administration are rejected', async () => {
    await boot(); for (const ticketCount of [-1, 0, 1.5, 101]) await assert.rejects(() => api('addTickets', { studentId: 'STU-001', ticketCount, amount: 0 }));
    await boot('parent'); await assert.rejects(() => api('completeRide', 'RIDE-101')); await assert.rejects(() => api('addTickets', { studentId: 'STU-001', ticketCount: 1, amount: 0 }));
  });
  await check('LOCAL-UI-12', ['AT-21', 'AT-29'], '375px touch-emulated parent form can submit; document stays inside viewport', async () => {
    await boot('parent', { mobile: true }); await book();
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, width: document.documentElement.scrollWidth }));
    assert.equal(dimensions.viewport, 375); assert.ok(dimensions.width <= dimensions.viewport, JSON.stringify(dimensions));
  });
  await check('LOCAL-UI-13', ['AT-01', 'SAT-34'], 'Logout and reload hide ledger and require new login', async () => {
    await boot(); await page.getByRole('button', { name: 'ログアウト', exact: true }).click();
    await page.getByRole('heading', { name: '管理者専用ログイン', exact: true }).waitFor();
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: '管理者専用ログイン', exact: true }).waitFor();
    assert.equal(await api('getSession'), null); assert.ok(!(await page.locator('main').innerText()).includes('田中'));
  });
  await check('LOCAL-UI-14', ['AT-04'], 'Low ticket warning is present only at balances 2, 1, 0', async () => {
    await boot('parent');
    for (const balance of [7, 3, 2, 1, 0]) {
      await page.evaluate(balance => { const rows = JSON.parse(localStorage.getItem('eigo_taxi_students')); rows[0].ticketBalance = balance; localStorage.setItem('eigo_taxi_students', JSON.stringify(rows)); }, balance);
      await page.reload({ waitUntil: 'networkidle' }); await page.getByRole('button', { name: /送迎の予約を申し込む/ }).waitFor();
      assert.equal((await page.locator('main').innerText()).includes('Mauro・Brenda に連絡'), balance <= 2);
    }
  });
}

try { await run(); }
catch (error) { fatalError = { message: error.message, stack: error.stack }; process.exitCode = 1; console.error(error.message); }
finally {
  await context?.close(); await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
  if (out && Object.keys(sourceHashes).length) {
    const changedSources = [];
    for (const [file, expected] of Object.entries(sourceHashes)) if (hash(await fs.readFile(path.join(root, file))) !== expected) changedSources.push(file);
    const report = { schemaVersion: 1, mode: 'LOCAL_MOCK_UI_REHEARSAL', runStartedAt, finishedAt: new Date().toISOString(), nodeVersion: process.versions.node, browserVersion, timezone: 'Asia/Tokyo', testDate: date, sourceHashes, buildHashes, changedSources,
      externalRequests, blockedSockets, guardSelfTest, pageErrors, fatalError, results, thirdPartyPassed: 0,
      limitations: ['Actual App and ApiService demo paths with Google auth disabled; no real Google, GAS, Sheets or Calendar calls.', 'Chromium touch emulation is not a physical iPhone or Android test.', 'Local rehearsal only; these results must not be counted as AT-01〜30 acceptance or independent third-party acceptance.'],
      status: fatalError || changedSources.length || externalRequests.length || blockedSockets.length || guardSelfTest.status !== 'PASS' || pageErrors.length || results.length !== 14 || results.some(r => r.status !== 'PASS') ? 'FAIL' : 'PASS' };
    await fs.writeFile(path.join(out, 'results.json'), JSON.stringify(report, null, 2), { flag: 'wx' });
    if (report.status !== 'PASS') process.exitCode = 1;
  }
}
