import fs from 'node:fs/promises';
import path from 'node:path';

export function assertRuntime(version = process.versions.node) {
  const [major, minor] = version.split('.').map(Number);
  if (major < 24 || (major === 24 && minor < 12)) throw new Error('Node.js 24.12以上が必要です。');
}

export function parseArgs(args) {
  if (args.length !== 2 || args[0] !== '--out' || !args[1]) throw new Error('使い方: node scripts/run_local_acceptance.mjs --out <新規出力ディレクトリー>');
  return { out: path.resolve(args[1]) };
}

// mkdir without recursive is atomic: even an empty existing directory is refused.
export async function reserveOutput(out) {
  const parent = path.dirname(out);
  const stat = await fs.stat(parent);
  if (!stat.isDirectory()) throw new Error('出力先の親ディレクトリーが必要です');
  await fs.mkdir(out);
}

export function localRequestAllowed(url, origin) {
  try { const parsed = new URL(url); return parsed.origin === origin && parsed.hostname === '127.0.0.1'; }
  catch { return false; }
}

export function tokyoDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const value = type => parts.find(p => p.type === type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}
