// Offline regression tests: Firebase SDK is stubbed; no Google login occurs.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const ts = require('typescript');
const source = fs.readFileSync('src/services/google-auth.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const defer = () => { let resolve, reject; const promise = new Promise((a,b) => { resolve=a; reject=b; }); return { promise, resolve, reject }; };
function create(options = {}) {
  const auth = { currentUser: { uid: 'old-user', getIdToken: async () => 'old-token' }, authStateReady: async () => {} };
  let signouts = 0, popups = 0, setups = 0;
  const firebase = {
    browserSessionPersistence: {}, getAuth: () => auth,
    GoogleAuthProvider: class { setCustomParameters() {} },
    setPersistence: async () => { setups++; if (options.setup) await options.setup(setups); },
    signOut: async () => { signouts++; if (options.signout) await options.signout(signouts); auth.currentUser = null; },
    signInWithPopup: () => {
      popups++;
      return Promise.resolve(options.popup ? options.popup() : { user: { uid: 'new-user', getIdToken: async () => 'new-token' } })
        .then(result => { auth.currentUser = result.user; return result; });
    },
  };
  const exports = {};
  vm.runInNewContext(compiled, { exports, require: name => name === 'firebase/app' ? { initializeApp: () => ({}) } : name === 'firebase/auth' ? firebase : name === '../deployment-config' ? { requireGoogleConfig: () => ({}) } : require(name) });
  return { api: exports, auth, counts: () => ({ signouts, popups, setups }) };
}
const results = [];
async function run(name, fn) { await fn(); results.push({ name, status: 'PASS' }); console.log('PASS ' + name); }
(async () => {
  await run('Failure keeps previous user blocked until a real sign-out retry succeeds', async () => {
    const x = create({ signout: async n => { if (n <= 2) throw Error('transient'); } });
    await x.api.prepareGoogleSignIn();
    await assert.rejects(x.api.signOutGoogle());
    await assert.rejects(x.api.signInGoogle()); await assert.rejects(x.api.getGoogleIdToken('old-user'));
    assert.equal(x.auth.currentUser.uid, 'old-user'); assert.equal(x.counts().popups, 0);
    await assert.rejects(x.api.prepareGoogleSignIn());
    await assert.rejects(x.api.signInGoogle()); await assert.rejects(x.api.getGoogleIdToken('old-user'));
    await x.api.prepareGoogleSignIn(); assert.equal(x.counts().signouts, 3); assert.equal(x.auth.currentUser, null);
    const identity = x.api.signInGoogle(); assert.equal(x.counts().popups, 1); assert.equal((await identity).uid, 'new-user');
  });
  await run('A pending logout blocks popup and token and concurrent preparation shares it', async () => {
    const gate = defer(), x = create({ signout: () => gate.promise });
    await x.api.prepareGoogleSignIn(); const logout = x.api.signOutGoogle();
    const a = x.api.prepareGoogleSignIn(), b = x.api.prepareGoogleSignIn();
    await assert.rejects(x.api.signInGoogle()); await assert.rejects(x.api.getGoogleIdToken('old-user'));
    gate.resolve(); await Promise.all([logout,a,b]); assert.equal(x.counts().signouts, 1); assert.equal(x.counts().popups, 0);
    const identity = x.api.signInGoogle(); assert.equal(x.counts().popups, 1); await identity;
  });
  await run('Concurrent preparations after a failed logout share one real retry', async () => {
    const gate = defer(), x = create({ signout: n => n === 1 ? Promise.reject(Error('transient')) : gate.promise });
    await x.api.prepareGoogleSignIn(); await assert.rejects(x.api.signOutGoogle());
    const a=x.api.prepareGoogleSignIn(), b=x.api.prepareGoogleSignIn();
    await assert.rejects(x.api.signInGoogle()); gate.resolve(); await Promise.all([a,b]);
    assert.equal(x.counts().signouts,2); assert.equal(x.auth.currentUser,null);
  });
  await run('Logout during initialization does not reopen the popup before logout finishes', async () => {
    const setup=defer(), logoutGate=defer(), x=create({ setup: () => setup.promise, signout: () => logoutGate.promise });
    const preparing=x.api.prepareGoogleSignIn(); await Promise.resolve();
    const logout=x.api.signOutGoogle(); setup.resolve(); await new Promise(resolve=>setImmediate(resolve));
    await assert.rejects(x.api.signInGoogle()); assert.equal(x.counts().popups,0);
    logoutGate.resolve(); await Promise.all([preparing,logout]); assert.equal(x.auth.currentUser,null);
    await x.api.signInGoogle(); assert.equal(x.counts().popups,1);
  });
  await run('A failed initialization does not discard the SDK instance needed for logout', async () => {
    const x=create({setup: n => n === 1 ? Promise.reject(Error('storage')) : Promise.resolve()});
    await assert.rejects(x.api.prepareGoogleSignIn()); await x.api.signOutGoogle();
    assert.equal(x.counts().signouts,1); assert.equal(x.auth.currentUser,null);
    await x.api.prepareGoogleSignIn(); await x.api.signInGoogle(); assert.equal(x.counts().popups,1);
  });
  await run('A popup completing after logout is cleared before login can resume', async () => {
    const popup=defer(), x=create({popup: () => popup.promise});
    await x.api.prepareGoogleSignIn();
    const pendingLogin=x.api.signInGoogle(); const rejectedLogin=assert.rejects(pendingLogin);
    assert.equal(x.counts().popups,1); const logout=x.api.signOutGoogle();
    const prepare=x.api.prepareGoogleSignIn();
    await assert.rejects(x.api.signInGoogle()); await assert.rejects(x.api.getGoogleIdToken('old-user'));
    assert.equal(x.counts().signouts,0);
    popup.resolve({user:{uid:'late-user',getIdToken:async()=> 'late-token'}});
    await Promise.all([logout, prepare, rejectedLogin]);
    assert.equal(x.counts().signouts,1); assert.equal(x.auth.currentUser,null); assert.equal(x.counts().popups,1);
  });
  await run('A later queued logout keeps the gate closed even if an earlier logout fails', async () => {
    const first=defer(), second=defer();
    const x=create({signout: n => n === 1 ? first.promise : second.promise});
    await x.api.prepareGoogleSignIn();
    const a=x.api.signOutGoogle(), failed=assert.rejects(a), b=x.api.signOutGoogle();
    const prepare=x.api.prepareGoogleSignIn();
    first.reject(Error('transient')); await failed; await new Promise(resolve=>setImmediate(resolve));
    await assert.rejects(x.api.signInGoogle()); await assert.rejects(x.api.getGoogleIdToken('old-user'));
    assert.equal(x.counts().signouts,2); assert.equal(x.counts().popups,0);
    second.resolve(); await Promise.all([b,prepare]); assert.equal(x.auth.currentUser,null);
    await x.api.signInGoogle(); assert.equal(x.counts().popups,1);
  });
  await run('A late login token is rejected even after logout has completed', async () => {
    const token=defer();
    const x=create({popup: () => ({user:{uid:'late-user',getIdToken:() => token.promise}})});
    await x.api.prepareGoogleSignIn();
    const login=x.api.signInGoogle(), rejectedLogin=assert.rejects(login);
    await new Promise(resolve=>setImmediate(resolve));
    await x.api.signOutGoogle(); assert.equal(x.auth.currentUser,null);
    token.resolve('late-token'); await rejectedLogin;
  });
  await run('An in-flight data token is rejected if logout completes first', async () => {
    const token=defer(), x=create();
    x.auth.currentUser.getIdToken=() => token.promise;
    await x.api.prepareGoogleSignIn();
    const dataToken=x.api.getGoogleIdToken('old-user'), rejectedToken=assert.rejects(dataToken);
    await new Promise(resolve=>setImmediate(resolve));
    await x.api.signOutGoogle(); assert.equal(x.auth.currentUser,null);
    token.resolve('old-token'); await rejectedToken;
  });
  if (process.env.EIGO_TEST_OUTPUT_DIR) {
    const dir=process.env.EIGO_TEST_OUTPUT_DIR;
    fs.mkdirSync(dir,{recursive:true});
    const paths=['src/services/google-auth.ts','scripts/test_google_signout_retry.cjs'];
    fs.writeFileSync(dir + '/google-signout-retry.json', JSON.stringify({
      executedAt:new Date().toISOString(), mode:'Offline Node VM; Firebase SDK stubbed; no browser or Google authentication',
      sourceHashes:Object.fromEntries(paths.map(path=>[path,crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')])),
      passed:results.length,total:results.length,results,
    }, null, 2));
  }
})().catch(error => { console.error(error); process.exitCode=1; });
