// Component contract test with synthetic React hooks and a stubbed SDK setup.
// No Google authentication or real browser is used.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const ts = require('typescript');
const source = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');
let states = [], cursor = 0, effect, setupCalls = 0, loginCalls = 0;
const jsx = (type, props) => ({ type, props: props || {} });
const react = {
  useState(initial) { const i = cursor++; if (!(i in states)) states[i] = initial; return [states[i], value => { states[i] = value; }]; },
  useEffect(fn) { effect ||= fn; },
};
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
  exports: exportsObject,
  require: name => name === 'react' ? react : name === 'react/jsx-runtime' ? { jsx, jsxs: jsx, Fragment: 'fragment' } :
    name === '../services/api' ? { ApiService: { loginWithGoogle: async () => { if (++loginCalls === 1) throw new Error('認証中断'); return {}; }, enterDemo: () => ({}) } } :
    name === '../portal' ? { DEMO_ENTRY_ID: 'demo', isPortalMismatch: message => message.startsWith('この入口ではログインできません') } :
    name === '../deployment-config' ? { getDeploymentConfig: () => ({ firebase: {} }) } :
    name === '../services/google-auth' ? { prepareGoogleSignIn: async () => { if (++setupCalls === 1) throw new Error('一時的なエラー'); } } : require(name),
});
function render() { cursor = 0; return exportsObject.LoginScreen({ route: { kind: 'admin' }, onLogin: () => {} }); }
function find(node, type, label) {
  if (!node || typeof node !== 'object') return;
  if (node.type === type && node.props.children === label) return node;
  for (const child of [node.props?.children].flat(Infinity)) { const found = find(child, type, label); if (found) return found; }
}
(async () => {
  render(); effect(); await new Promise(resolve => setImmediate(resolve));
  let tree = render(), retry = find(tree, 'button', 'ログインの準備を再試行');
  assert.ok(retry, 'initialization failure offers a retry');
  assert.equal(find(tree, 'button', 'Googleでログイン').props.disabled, true);
  await retry.props.onClick(); tree = render();
  assert.equal(setupCalls, 2); assert.equal(loginCalls, 0);
  assert.equal(find(tree, 'button', 'Googleでログイン').props.disabled, false);
  assert.equal(find(tree, 'button', 'ログインの準備を再試行'), undefined);
  await find(tree, 'button', 'Googleでログイン').props.onClick(); tree = render();
  assert.equal(loginCalls, 1); assert.equal(find(tree, 'button', 'Googleでログイン').props.disabled, true);
  retry = find(tree, 'button', 'ログインの準備を再試行'); assert.ok(retry, 'failed login requires a new preparation');
  await retry.props.onClick(); tree = render(); assert.equal(setupCalls, 3); assert.equal(loginCalls, 1);
  await find(tree, 'button', 'Googleでログイン').props.onClick();
  assert.equal(loginCalls, 2);
  if (process.env.EIGO_TEST_OUTPUT_DIR) {
    const dir = process.env.EIGO_TEST_OUTPUT_DIR;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dir + '/google-auth-retry-ui.json', JSON.stringify({
      executedAt: new Date().toISOString(), mode: 'Node VM; synthetic React hooks and stubbed setup; no browser or real Google login',
      sourceHashes: Object.fromEntries(['src/components/LoginScreen.tsx', 'scripts/test_google_auth_retry_ui.cjs'].map(path => [path, crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')])),
      results: [
        { id: 'UI-07', name: 'Retry initialization after a transient setup failure', status: 'PASS' },
        { name: 'Prepare again after a failed login before the next popup click', status: 'PASS' },
      ],
    }, null, 2));
  }
  console.log('PASS Failed initialization can be retried; login requires a separate click');
  console.log('PASS Failed login requires new preparation before a separate login click');
})().catch(error => { console.error(error); process.exitCode = 1; });
