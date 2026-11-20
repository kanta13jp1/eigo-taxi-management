// Read-only public verification; each run preserves a new report, never old evidence.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const manifestPath = process.argv[2] || 'docs/acceptance/deployment/build-manifest.json';
const manifestAbsolute=path.resolve(root,manifestPath);
if(!manifestAbsolute.startsWith(root+path.sep))throw new Error('Manifest must be inside repository');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
async function main() {
  const checkedAt = new Date().toISOString();
  const manifestBytes = fs.readFileSync(path.join(root, manifestPath));
  const build = JSON.parse(manifestBytes);
  const releaseId=build.release.sourceDigest.slice(0,16);
  const base = 'https://eigo-taxi-test.web.app';
  const results = [];
  const entries = Object.entries(build.distHashes).map(([file, sha]) => [file.slice(4), sha]);
  entries.push(['/', build.distHashes['dist/index.html']]);
  for (const [urlPath, expectedSha256] of entries) {
    try {
      const response = await fetch(base + urlPath, { headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(20000) });
      const sha256 = digest(Buffer.from(await response.arrayBuffer()));
      results.push({ path: urlPath, status: response.status, sha256, expectedSha256, match: response.status === 200 && sha256 === expectedSha256 });
    } catch {
      results.push({ path: urlPath, expectedSha256, match: false, error: 'HTTP verification failed' });
    }
  }
  const report = { checkedAt, completedAt: new Date().toISOString(), url: base, releaseId, manifestPath, manifestSha256: digest(manifestBytes), scope: 'Public frontend bytes only; no Google service acceptance or deployment', results, pass: results.every(r => r.match) };
  const folder = path.join(root, 'docs/acceptance/deployment-verification');
  fs.mkdirSync(folder, { recursive: true });
  const output = path.join(folder, `public-${checkedAt.replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ output, pass: report.pass, urls: results.length }));
  if (!report.pass) process.exitCode = 1;
}
main().catch(() => { console.error('Snapshot verification failed'); process.exitCode = 1; });
