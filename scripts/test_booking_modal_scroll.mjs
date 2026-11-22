// @trace REQ-21 REQ-29 UI-MODAL-SCROLL-01
// Local fixture only: no Firebase/GAS requests and no physical-device claim.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.EIGO_PLAYWRIGHT_MODULE || path.resolve('.manual-build-20261020/node_modules/playwright'));
const { createServer } = await import(pathToFileURL(path.resolve('node_modules/vite/dist/node/index.js')).href);
const output = process.env.EIGO_MODAL_SCROLL_OUTPUT_DIR;
if (!output) throw new Error('Set EIGO_MODAL_SCROLL_OUTPUT_DIR to a new evidence directory.');
const out = path.resolve(output);
await fs.mkdir(out, { recursive: false });
const root = process.cwd();
const server = await createServer({ root: path.join(root, 'scripts/fixtures/trace-ui'), configFile: false,
  server: { host: '127.0.0.1', port: 0, fs: { allow: [root] } }, css: { postcss: root } });
let browser;
const results = [], externalRequests = [];
try {
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch({ headless: true, executablePath: process.env.EIGO_CHROMIUM_EXECUTABLE });
  const context = await browser.newContext({ isMobile: true, hasTouch: true });
  await context.route('**/*', route => {
    if (new URL(route.request().url()).origin === origin) return route.continue();
    externalRequests.push(route.request().url());
    return route.abort();
  });
  const page = await context.newPage();
  for (const viewport of [{ width: 375, height: 500 }, { width: 812, height: 375 }]) {
    const name = `${viewport.width}x${viewport.height}`;
    try {
      await page.setViewportSize(viewport);
      await page.goto(`${origin}/?view=form`, { waitUntil: 'networkidle' });
      const submit = page.locator('button[type=submit]');
      await submit.waitFor();
      await submit.scrollIntoViewIfNeeded({ timeout: 2000 });
      const box = await submit.boundingBox();
      assert.ok(box && box.y >= 0 && box.y + box.height <= viewport.height,
        `Submit must be reachable inside the viewport after scrolling: ${JSON.stringify({ box, viewport })}`);
      await submit.tap({ timeout: 2000 });
      await page.waitForFunction(() => Boolean(document.body.dataset.submitted));
      assert.equal(JSON.parse(await page.locator('body').getAttribute('data-submitted')).studentId, 'A');
      // Scrolling back to the heading must also make closing reachable.
      const close = page.getByRole('heading', { name: '送迎予定の登録' }).locator('../..').locator('button');
      await close.scrollIntoViewIfNeeded({ timeout: 2000 });
      const closeBox = await close.boundingBox();
      assert.ok(closeBox && closeBox.y >= 0 && closeBox.y + closeBox.height <= viewport.height);
      results.push({ name, status: 'PASS', submitBox: box, closeBox });
    } catch (error) {
      results.push({ name, status: 'FAIL', error: String(error) });
    }
    await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
  }
  assert.equal(externalRequests.length, 0);
} finally {
  await fs.writeFile(path.join(out, 'results.json'), JSON.stringify({
    executedAt: new Date().toISOString(), mode: 'Local Chromium mobile/touch emulation; fixture only; not real Google or physical device acceptance',
    sourceHashes: Object.fromEntries(await Promise.all(['src/components/AddRideModal.tsx', 'scripts/fixtures/trace-ui/harness.tsx', 'scripts/test_booking_modal_scroll.mjs'].map(async file =>
      [file, crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex')]))), externalRequests, results,
  }, null, 2));
  await browser?.close();
  await server.close();
}
console.log(results.map(item => `${item.name}: ${item.status}`).join('\n'));
if (results.some(item => item.status !== 'PASS')) process.exitCode = 1;
