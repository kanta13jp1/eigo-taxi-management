import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { assertRuntime, parseArgs, reserveOutput, localRequestAllowed, tokyoDate } from '../scripts/local_acceptance_safety.mjs';

test('runtime and arguments reject an old runtime, missing output and supplied URLs', () => {
  assert.throws(() => assertRuntime('22.18.0')); assert.throws(() => assertRuntime('24.11.0'));
  assertRuntime('24.12.0'); assertRuntime('25.0.0');
  for (const args of [[], ['--out'], ['--url', 'https://example.com'], ['--out', 'x', '--url', 'https://example.com']]) assert.throws(() => parseArgs(args));
});
test('an existing evidence directory and sentinel are never overwritten', async () => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'eigo-runner-safety-'));
  try {
    const out = path.join(base, 'run'); await reserveOutput(out);
    await fs.writeFile(path.join(out, 'sentinel.txt'), 'keep');
    await assert.rejects(reserveOutput(out), { code: 'EEXIST' });
    assert.equal(await fs.readFile(path.join(out, 'sentinel.txt'), 'utf8'), 'keep');
    await assert.rejects(reserveOutput(path.join(base, 'missing', 'run')), { code: 'ENOENT' });
  } finally {
    assert.ok(path.resolve(base).startsWith(path.resolve(os.tmpdir()) + path.sep + 'eigo-runner-safety-'));
    await fs.rm(base, { recursive: true, force: true });
  }
});
test('only the selected localhost origin is allowed', () => {
  const origin = 'http://127.0.0.1:4190';
  assert.equal(localRequestAllowed(origin + '/src/App.tsx', origin), true);
  for (const url of ['https://script.google.com/exec', 'https://accounts.google.com', 'http://127.0.0.1:4191/', 'http://127.0.0.1.evil.test:4190/', 'data:text/html,x', 'invalid']) assert.equal(localRequestAllowed(url, origin), false);
});
test('test date follows JST rather than a fixed past date or host timezone', () => {
  assert.equal(tokyoDate(new Date('2026-11-05T15:00:00Z')), '2026-11-06');
  assert.equal(tokyoDate(new Date('2026-11-05T14:59:59Z')), '2026-11-05');
});
