// Offline SDK boundary tests. Firebase functions are stubbed; no Google login occurs.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const ts = require('typescript'), crypto = require('node:crypto');
const source = fs.readFileSync('src/services/google-auth.ts', 'utf8');
let popupCalls = 0, signOutCalls = 0, persistence, providerParameters, popupError;
const auth = { currentUser: { uid: 'synthetic-uid', getIdToken: async () => 'synthetic-current-token' }, authStateReady: async () => {} };
const firebase = {
  browserSessionPersistence: { type: 'SESSION' },
  getAuth: () => auth,
  GoogleAuthProvider: class { setCustomParameters(value) { providerParameters = value; } },
  setPersistence: async (_auth, value) => { assert.equal(_auth, auth); persistence = value; },
  signInWithPopup: (_auth) => { assert.equal(_auth, auth); popupCalls++; return popupError ? Promise.reject(popupError) : Promise.resolve({ user: auth.currentUser }); },
  signOut: async (_auth) => { assert.equal(_auth, auth); signOutCalls++; auth.currentUser = null; },
};
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
  exports: exportsObject,
  require: name => name === 'firebase/app' ? { initializeApp: () => ({}) } : name === 'firebase/auth' ? firebase :
    name === '../deployment-config' ? { requireGoogleConfig: () => ({ projectId: 'synthetic' }) } : require(name),
});
const rows = [];
async function test(name, run) { await run(); rows.push({ name, status: 'PASS' }); console.log('PASS ' + name); }
(async () => {
  await test('Popup cannot start before SDK setup completes', async () => {
    await assert.rejects(() => exportsObject.signInGoogle()); assert.equal(popupCalls, 0);
  });
  await test('Preparation configures tab/session persistence and Japanese UI', async () => {
    await exportsObject.prepareGoogleSignIn(); assert.equal(persistence.type, 'SESSION'); assert.equal(auth.languageCode, 'ja');
  });
  await test('Preparation can recover from a transient persistence failure without reloading', async () => {
    let calls = 0;
    const freshAuth = { currentUser: null, authStateReady: async () => {} };
    const freshExports = {};
    const transientFirebase = {
      ...firebase, getAuth: () => freshAuth,
      setPersistence: async () => { if (++calls === 1) throw new Error('transient storage failure'); },
    };
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
      exports: freshExports,
      require: name => name === 'firebase/app' ? { initializeApp: () => ({}) } : name === 'firebase/auth' ? transientFirebase :
        name === '../deployment-config' ? { requireGoogleConfig: () => ({ projectId: 'synthetic' }) } : require(name),
    });
    await assert.rejects(() => freshExports.prepareGoogleSignIn());
    await freshExports.prepareGoogleSignIn();
    assert.equal(calls, 2);
  });
  await test('Prepared sign-in opens popup before yielding the click and selects the user account', async () => {
    const pending = exportsObject.signInGoogle();
    assert.equal(popupCalls, 1); // Synchronous call: no await between click and popup.
    const identity = await pending; assert.equal(identity.uid, 'synthetic-uid');
    assert.equal(identity.idToken, 'synthetic-current-token'); assert.equal(providerParameters.prompt, 'select_account');
  });
  await test('Data request obtains the current SDK token and refuses a different user', async () => {
    assert.equal(await exportsObject.getGoogleIdToken('synthetic-uid'), 'synthetic-current-token');
    await assert.rejects(() => exportsObject.getGoogleIdToken('other-uid'));
  });
  await test('Provider errors are translated without exposing raw credential details', async () => {
    popupError = { code: 'auth/popup-blocked', message: 'private-token-not-for-output' };
    await assert.rejects(() => exportsObject.signInGoogle(), /ポップアップ/);
    popupError = { code: 'auth/internal-error', message: 'private-token-not-for-output' };
    await assert.rejects(() => exportsObject.signInGoogle(), error => !error.message.includes('private-token'));
    popupError = undefined;
  });
  await test('Logout clears the Firebase SDK user and later data calls cannot use it', async () => {
    await exportsObject.signOutGoogle(); assert.equal(signOutCalls, 1); assert.equal(auth.currentUser, null);
    await assert.rejects(() => exportsObject.getGoogleIdToken('synthetic-uid'));
  });
  const dir = process.env.EIGO_TEST_OUTPUT_DIR || 'docs/acceptance/developer-setup-2026-10-21';
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + '/google-sdk-contract.json', JSON.stringify({
    executedAt: new Date().toISOString(), mode: 'Offline Node VM; Firebase SDK stubbed; popup timing contract only',
    passed: rows.length, total: rows.length, sourceSha256: crypto.createHash('sha256').update(source).digest('hex'),
    sourceHashes: Object.fromEntries(['src/services/google-auth.ts', 'scripts/test_google_auth.cjs'].map(path => [path, crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')])), results: rows,
  }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
