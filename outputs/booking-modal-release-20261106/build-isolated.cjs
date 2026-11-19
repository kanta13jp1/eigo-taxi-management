const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');
const output = path.resolve(__dirname);
const archive = path.join(root, 'docs/acceptance/deployment/releases/d4261c506bb71586');
const archivedSource = path.join(archive, 'source');
const expectedModalHash = 'b4a3001504d344c099c89064681ec80c21a0f5d8a69520e3a73954e094ab563f';
const expectedCandidateDigest = 'b7e510688a6e81268331db6d7d88db8875bf5ce443dbc90f52b4f647f39d1979';
const modal = 'src/components/AddRideModal.tsx';
const configs = ['tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 'postcss.config.js', 'tailwind.config.js'];
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const hashFile = file => sha(fs.readFileSync(file));
const assert = (value, message) => { if (!value) throw new Error(message); };
const walk = directory => !fs.existsSync(directory) ? [] : fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const file = path.join(directory, entry.name);
  assert(!entry.isSymbolicLink(), 'Unexpected symlink in protected/archived files: ' + file);
  return entry.isDirectory() ? walk(file) : [file];
});
const record = (name, value) => fs.writeFileSync(path.join(output, name), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
const manifest = JSON.parse(fs.readFileSync(path.join(archive, 'build-manifest.json'), 'utf8'));
const commands = [];
const protectedPaths = ['dist', 'docs/acceptance/deployment', 'src', 'public', 'gas/Code.gs', 'package.json', 'package-lock.json', 'vite.config.ts', 'index.html', 'firebase.json', '.firebaserc', 'scripts/prepare_test_release.cjs', ...configs];
const protectedSnapshot = () => Object.fromEntries(protectedPaths.flatMap(relative => {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) return [[relative, null]];
  const files = fs.statSync(absolute).isDirectory() ? walk(absolute) : [absolute];
  return files.map(file => [path.relative(root, file).replaceAll('\\', '/'), hashFile(file)]);
}).sort(([a], [b]) => a.localeCompare(b)));
const before = protectedSnapshot();
record('protected-before.json', before);
assert(root === 'C:\\Users\\kanta\\GitHub\\eigo-taxi-management', 'Unexpected repository root');
assert(output === path.join(root, 'outputs/booking-modal-release-20261106'), 'Unexpected output root');
assert(Number(process.versions.node.split('.')[0]) >= 24, 'Node.js 24+ required');
assert(hashFile(path.join(root, modal)) === expectedModalHash, 'Reviewed modal changed');
for (const [file, expected] of Object.entries(manifest.sourceHashes)) {
  assert(hashFile(path.join(archivedSource, file)) === expected, 'Archived source mismatch: ' + file);
}
for (const [file, expected] of Object.entries(manifest.distHashes)) {
  assert(hashFile(path.join(archive, 'payload', file)) === expected, 'Archived payload mismatch: ' + file);
}
record('provenance.json', {
  createdAt: new Date().toISOString(), node: { executable: process.execPath, version: process.version },
  repositoryRoot: root, archive, archiveRelease: manifest.release,
  expectedModalHash, expectedCandidateDigest,
  configSupplements: Object.fromEntries(configs.map(file => [file, hashFile(path.join(root, file))])),
  releasePreparer: { path: 'scripts/prepare_test_release.cjs', sha256: hashFile(path.join(root, 'scripts/prepare_test_release.cjs')) },
  dependencyMode: 'Read existing repository node_modules via ancestor module resolution; no install or junction',
  writeBoundary: output,
});

function run(label, cwd, script, args) {
  assert(cwd.startsWith(output + path.sep), 'Command cwd outside output');
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd, encoding: 'utf8', windowsHide: true,
    env: { ...process.env, PATH: path.dirname(process.execPath) + path.delimiter + process.env.PATH },
    maxBuffer: 8 * 1024 * 1024,
  });
  const command = { label, cwd, executable: process.execPath, arguments: [script, ...args], exitCode: result.status,
    error: result.error?.message, stdout: result.stdout || '', stderr: result.stderr || '' };
  commands.push(command);
  record(label + '.json', command);
  assert(result.status === 0 && !result.error, label + ' failed; see isolated command log');
}

function makeWorkspace(name) {
  const cwd = path.join(output, name);
  fs.mkdirSync(cwd, { recursive: false });
  for (const file of walk(archivedSource)) {
    const target = path.join(cwd, path.relative(archivedSource, file));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(file, target, fs.constants.COPYFILE_EXCL);
  }
  for (const file of configs) fs.copyFileSync(path.join(root, file), path.join(cwd, file), fs.constants.COPYFILE_EXCL);
  fs.mkdirSync(path.join(cwd, 'scripts'), { recursive: false });
  fs.copyFileSync(path.join(root, 'scripts/prepare_test_release.cjs'), path.join(cwd, 'scripts/prepare_test_release.cjs'), fs.constants.COPYFILE_EXCL);
  fs.mkdirSync(path.join(cwd, 'typecheck'), { recursive: false });
  return cwd;
}

function build(name, cwd) {
  const tsc = path.join(root, 'node_modules/typescript/bin/tsc');
  for (const project of ['app', 'node']) {
    run(name + '-typecheck-' + project, cwd, tsc, ['--project', 'tsconfig.' + project + '.json', '--incremental', '--tsBuildInfoFile', path.join(cwd, 'typecheck', project + '.tsbuildinfo')]);
  }
  run(name + '-vite-build', cwd, path.join(root, 'node_modules/vite/bin/vite.js'), ['build', '--base=/', '--configLoader', 'native']);
  run(name + '-prepare-release', cwd, path.join(cwd, 'scripts/prepare_test_release.cjs'), []);
  return JSON.parse(fs.readFileSync(path.join(cwd, 'docs/acceptance/deployment/build-manifest.json'), 'utf8'));
}

try {
  const baselineCwd = makeWorkspace('baseline');
  const baseline = build('baseline', baselineCwd);
  const baselinePayload = Object.entries(manifest.distHashes).filter(([file]) => file !== 'dist/release.json').map(([file, expected]) => ({
    file, expected, actual: baseline.distHashes[file] || null, match: baseline.distHashes[file] === expected,
  }));
  const extraBaselinePayload = Object.keys(baseline.distHashes).filter(file => !manifest.distHashes[file]);
  const baselineSourceMatch = JSON.stringify(baseline.sourceHashes) === JSON.stringify(manifest.sourceHashes);
  record('baseline-comparison.json', { sourceMatch: baselineSourceMatch,
    sourceDigestMatch: baseline.release.sourceDigest === manifest.release.sourceDigest,
    payload: baselinePayload, extraPayload: extraBaselinePayload,
    releaseJsonExcludedReason: 'builtAt is generated afresh; sourceDigest and other release target fields are checked separately' });
  assert(baselineSourceMatch && baseline.release.sourceDigest === manifest.release.sourceDigest, 'Baseline source identity mismatch');
  assert(!extraBaselinePayload.length && baselinePayload.every(item => item.match), 'Baseline rebuilt payload differs from deployed archive');

  const candidateCwd = makeWorkspace('candidate');
  fs.copyFileSync(path.join(root, modal), path.join(candidateCwd, modal));
  assert(hashFile(path.join(candidateCwd, modal)) === expectedModalHash, 'Candidate reviewed modal mismatch');
  const candidate = build('candidate', candidateCwd);
  const sourceDelta = Object.keys({ ...manifest.sourceHashes, ...candidate.sourceHashes }).filter(file => manifest.sourceHashes[file] !== candidate.sourceHashes[file]).map(file => ({
    file, before: manifest.sourceHashes[file] || null, after: candidate.sourceHashes[file] || null,
  }));
  assert(sourceDelta.length === 1 && sourceDelta[0].file === modal, 'Candidate changes source outside the reviewed modal');
  assert(candidate.release.sourceDigest === expectedCandidateDigest, 'Candidate source digest mismatch');
  assert(candidate.sourceHashes['gas/Code.gs'] === manifest.sourceHashes['gas/Code.gs'], 'Candidate GAS source changed');
  const protectedAfter = protectedSnapshot();
  record('protected-after.json', protectedAfter);
  assert(JSON.stringify(before) === JSON.stringify(protectedAfter), 'Protected repository/archive files changed');
  const payloadFiles = walk(path.join(candidateCwd, 'dist')).map(file => path.relative(candidateCwd, file).replaceAll('\\', '/')).sort();
  assert(JSON.stringify(payloadFiles) === JSON.stringify(Object.keys(candidate.distHashes).sort()), 'Candidate payload file list mismatch');
  const candidatePayload = Object.entries(candidate.distHashes).map(([file, expected]) => ({ file, sha256: hashFile(path.join(candidateCwd, file)), match: hashFile(path.join(candidateCwd, file)) === expected }));
  assert(candidatePayload.every(item => item.match), 'Candidate payload hash mismatch');
  const validation = {
    completedAt: new Date().toISOString(), pass: true, node: { executable: process.execPath, version: process.version },
    archiveVersion: 'd4261c506bb71586', baseline: { cwd: baselineCwd, sourceMatch: baselineSourceMatch, sourceDigest: baseline.release.sourceDigest, payloadMatchesArchive: true },
    candidate: { cwd: candidateCwd, firebaseConfig: path.join(candidateCwd, 'firebase.json'), firebaseRc: path.join(candidateCwd, '.firebaserc'), payloadPath: path.join(candidateCwd, 'dist'),
      manifestPath: path.join(candidateCwd, 'docs/acceptance/deployment/build-manifest.json'), release: candidate.release, sourceDelta,
      sourceHashes: candidate.sourceHashes, distHashes: candidate.distHashes, payloadVerified: candidatePayload,
      gasRetainedFromArchive: true, supplements: Object.fromEntries(configs.map(file => [file, hashFile(path.join(candidateCwd, file))])) },
    protectedFilesUnchanged: true, commands: commands.map(({ label, cwd, exitCode }) => ({ label, cwd, exitCode })),
    deploymentPerformed: false,
  };
  record('validation.json', validation);
  console.log(JSON.stringify({ pass: true, validationPath: path.join(output, 'validation.json'), candidateCwd, sourceDigest: candidate.release.sourceDigest }));
} catch (error) {
  record('failure.json', { failedAt: new Date().toISOString(), error: error.message, commands: commands.map(({ label, cwd, exitCode }) => ({ label, cwd, exitCode })) });
  console.error(error.message);
  process.exitCode = 1;
}
