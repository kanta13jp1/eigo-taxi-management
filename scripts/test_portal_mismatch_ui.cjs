// Component contract test: wrong-entrance guidance on the login screen.
// Synthetic React hooks and stubbed services. No Google authentication, network or real browser.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const ts = require('typescript');
const compile = path => ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const portal = {};
vm.runInNewContext(compile('src/portal.ts'), { exports: portal, URL });
const jsx = (type, props) => ({ type, props: props || {} });
function mount(route, loginError) {
  let states = [], cursor = 0, effect;
  const react = {
    useState(initial) { const i = cursor++; if (!(i in states)) states[i] = initial; return [states[i], value => { states[i] = value; }]; },
    useEffect(fn) { effect ||= fn; },
  };
  const exportsObject = {};
  vm.runInNewContext(compile('src/components/LoginScreen.tsx'), {
    exports: exportsObject, Error, // Share Error so the component's instanceof check sees the stubbed failure.
    require: name => name === 'react' ? react : name === 'react/jsx-runtime' ? { jsx, jsxs: jsx, Fragment: 'fragment' } :
      name === '../services/api' ? { ApiService: { loginWithGoogle: async () => { throw new Error(loginError); }, enterDemo: () => ({}) } } :
      name === '../portal' ? portal :
      name === '../deployment-config' ? { getDeploymentConfig: () => ({ firebase: {} }) } :
      name === '../services/google-auth' ? { prepareGoogleSignIn: async () => {} } : require(name),
  });
  const render = () => { cursor = 0; return exportsObject.LoginScreen({ route, onLogin: () => {} }); };
  return { render, start: async () => { render(); effect(); await new Promise(resolve => setImmediate(resolve)); } };
}
function walk(node, visit) {
  if (Array.isArray(node)) return node.forEach(child => walk(child, visit));
  if (!node || typeof node !== 'object') return;
  visit(node); walk(node.props?.children, visit);
}
function text(node) {
  if (Array.isArray(node)) return node.map(text).join('');
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (!node || typeof node !== 'object') return '';
  return text(node.props?.children);
}
function find(tree, type, label) { let found; walk(tree, node => { if (!found && node.type === type && text(node) === label) found = node; }); return found; }
async function loginAndRender(route, loginError) {
  const screen = mount(route, loginError);
  await screen.start();
  await find(screen.render(), 'button', 'Googleでログイン').props.onClick();
  return screen.render();
}
const serverRefusal = 'この入口ではログインできません';
const clientRefusal = 'この入口ではログインできません。ご本人に案内された入口を開いてください。';
const results = [];
(async () => {
  assert.equal(portal.isPortalMismatch(serverRefusal), true);
  assert.equal(portal.isPortalMismatch(clientRefusal), true);
  assert.equal(portal.isPortalMismatch('このGoogleアカウントは利用登録されていません'), false);
  results.push('PM-01 Server and client wrong-entrance refusals are recognised; other refusals are not');

  for (const route of [{ kind: 'parent' }, { kind: 'parent', entryId: '2b6bd545-a93e-4f8c-9981-025f0b2128e1' }]) {
    const tree = await loginAndRender(route, serverRefusal), all = text(tree);
    assert.ok(all.includes(serverRefusal), 'original refusal stays visible');
    assert.ok(all.includes('教室から届いたご家庭専用のURLまたはQRコード'), 'family URL guidance is shown');
    const link = find(tree, 'a', '管理者専用の入口を開く');
    assert.ok(link, 'parent entrance offers the admin entrance'); assert.equal(link.props.href, '#/admin');
    assert.ok(find(tree, 'button', 'ログインの準備を再試行'), 'retry preparation stays available');
  }
  results.push('PM-02 Parent entrance shows family-URL guidance and a link to the admin entrance after a wrong-entrance refusal');

  const adminTree = await loginAndRender({ kind: 'admin' }, clientRefusal), adminText = text(adminTree);
  assert.ok(adminText.includes('管理者用の入口には登録されていません'));
  assert.equal(find(adminTree, 'a', '管理者専用の入口を開く'), undefined);
  let parentLinks = 0; walk(adminTree, node => { if (node.type === 'a' && String(node.props.href || '').startsWith('#/parent')) parentLinks++; });
  assert.equal(parentLinks, 0, 'admin entrance never links to a family URL');
  results.push('PM-03 Admin entrance shows guidance without any link to a parent or family URL');

  for (const message of ['このGoogleアカウントは利用登録されていません。教室の担当者にお問い合わせください', 'この個別URLは利用できません。教室に最新URLを確認してください', '認証中断']) {
    const tree = await loginAndRender({ kind: 'parent' }, message), all = text(tree);
    assert.ok(all.includes(message));
    assert.equal(all.includes('登録されていません。保護者の方は'), false, 'no entrance guidance for other failures');
    assert.equal(find(tree, 'a', '管理者専用の入口を開く'), undefined);
  }
  results.push('PM-04 Unregistered account, revoked URL and interrupted login show no entrance guidance or admin link');

  const idle = mount({ kind: 'parent' }, serverRefusal); await idle.start();
  assert.equal(find(idle.render(), 'a', '管理者専用の入口を開く'), undefined);
  results.push('PM-05 No guidance before a login attempt');

  if (process.env.EIGO_TEST_OUTPUT_DIR) {
    const dir = process.env.EIGO_TEST_OUTPUT_DIR;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dir + '/portal-mismatch-ui.json', JSON.stringify({
      executedAt: new Date().toISOString(), mode: 'Node VM; synthetic React hooks and stubbed services; no browser, network or real Google login',
      sourceHashes: Object.fromEntries(['src/components/LoginScreen.tsx', 'src/portal.ts', 'scripts/test_portal_mismatch_ui.cjs'].map(path => [path, crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')])),
      results: results.map(name => ({ name, status: 'PASS' })),
    }, null, 2));
  }
  results.forEach(name => console.log('PASS ' + name));
})().catch(error => { console.error(error); process.exitCode = 1; });
