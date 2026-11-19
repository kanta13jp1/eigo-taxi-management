// Offline smoke: local Vite, empty browser profile and fake Firebase project.
// No user login, Google credentials, GAS request or calendar call is made.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';

const reservation = createServer();
await new Promise((ok, fail) => reservation.once('error', fail).listen(0, '127.0.0.1', ok));
const port = reservation.address().port;
await new Promise((ok, fail) => reservation.close(error => error ? fail(error) : ok()));
const vite = spawn(process.execPath, [resolve('node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: 'ignore', windowsHide: true });
let browser;
try {
  const url = `http://localhost:${port}/tests/manual-auth-signout/`;
  let started = false;
  for (let i = 0; i < 80; i++) {
    if (vite.exitCode !== null) throw new Error('Local Vite server did not start');
    try { const r = await fetch(url); if (r.ok && (await r.text()).includes('認証終了・再試行の限定検証')) { started = true; break; } } catch { /* starting */ }
    await new Promise(ok => setTimeout(ok, 250));
  }
  assert.equal(started, true, 'Local harness must start');
  const chrome = process.env.EIGO_CHROME_EXECUTABLE || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--disable-gpu', '--no-sandbox'] });
  const page = await browser.newPage();
  let blockedNonlocal = 0, errors = 0;
  await page.setRequestInterception(true);
  page.on('request', request => {
    const host = new URL(request.url()).hostname;
    if (['localhost', '127.0.0.1', '[::1]'].includes(host)) void request.continue();
    else { blockedNonlocal++; void request.abort(); }
  });
  page.on('pageerror', () => { errors++; });
  const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
  assert.equal(response.status(), 200);
  await page.waitForFunction(() => document.querySelector('#state')?.textContent?.includes('準備ができました'), { timeout: 20000 });
  const initial = await page.evaluate(() => ({
    enabled: [...document.querySelectorAll('button')].filter(x => !x.disabled).map(x => x.id),
    warning: document.body.innerText.includes('人工的'),
  }));
  assert.deepEqual(initial.enabled, ['login']);
  assert.equal(initial.warning, true);
  assert.equal(errors, 0);

  // A disposable, fake project and synthetic in-memory user verify the SDK
  // middleware contract itself. This is not Google authentication.
  const fixture = await page.evaluate(async () => {
    const apps = await import('/node_modules/.vite/deps/firebase_app.js');
    const sdk = await import('/node_modules/.vite/deps/firebase_auth.js');
    const app = apps.initializeApp({ apiKey: 'fixture-api-key', authDomain: 'localhost', projectId: 'fixture-test' }, 'fixture-hook');
    const auth = sdk.getAuth(app);
    await auth.authStateReady();
    auth.currentUser = { uid: 'synthetic-only', _stopProactiveRefresh() {} };
    let calls = 0, injected = 0;
    const unsubscribe = auth.beforeAuthStateChanged(user => {
      calls++;
      if (user === null && injected === 0) { injected++; throw new Error('synthetic'); }
    });
    let rejected = false;
    try { await sdk.signOut(auth); } catch { rejected = true; }
    const retained = auth.currentUser !== null;
    await sdk.signOut(auth);
    const cleared = auth.currentUser === null;
    unsubscribe();
    await apps.deleteApp(app);
    return { rejected, retained, cleared, calls, injected };
  });
  assert.deepEqual(fixture, { rejected: true, retained: true, cleared: true, calls: 2, injected: 1 });
  assert.equal(blockedNonlocal, 0, 'No network requests outside localhost');
  console.log('PASS local harness ready; one-shot Firebase SDK hook rejects then allows sign-out with a synthetic user; external requests: 0');
} finally {
  if (browser) await browser.close();
  vite.kill();
}
