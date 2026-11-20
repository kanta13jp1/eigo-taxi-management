// Run App's modal and dashboard callbacks in memory, with stubbed React hooks and API.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const existing = { id: 'read-back', studentId: 'fixture', studentName: 'Synthetic rider', status: 'scheduled' };
const other = { ...existing, id: 'other' };
const session = { mode: 'live', user: { role: 'admin', name: 'Fixture admin', studentIds: [] } };
let response;
const api = {
  getSession: () => session, verifySession: async () => session,
  getStudents: async () => [], getRides: async () => [other, existing],
  createReservation: async () => response,
};
const hooks = [], pendingEffects = [];
let cursor = 0;
const react = {
  useState(initial) {
    const i = cursor++;
    if (!(i in hooks)) hooks[i] = typeof initial === 'function' ? initial() : initial;
    return [hooks[i], value => { hooks[i] = typeof value === 'function' ? value(hooks[i]) : value; }];
  },
  useEffect(effect, deps) {
    const i = cursor++;
    if (!hooks[i] || deps.some((v, j) => v !== hooks[i][j])) pendingEffects.push(effect);
    hooks[i] = deps;
  },
  useCallback(fn) { return fn; },
};
const jsx = (type, props) => ({ type, props });
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/App.tsx', 'utf8'), { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
} }).outputText, {
  exports: exportsObject, window: { location: { hash: '#/admin' }, addEventListener() {} }, setTimeout() {},
  require(name) {
    if (name === 'react') return react;
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' };
    if (name === './services/api') return { ApiService: api };
    if (name === './portal') return { parsePortal: () => ({ kind: 'admin' }) };
    if (name.startsWith('./components/')) {
      const component = name.split('/').pop();
      return { [component]: component };
    }
    throw new Error('Unexpected App dependency ' + name);
  },
});
function render() { cursor = 0; return exportsObject.App(); }
function find(tree, type) {
  if (!tree || typeof tree !== 'object') return;
  if (tree.type === type) return tree.props;
  for (const child of [tree.props?.children].flat(Infinity)) {
    const found = find(child, type);
    if (found) return found;
  }
}
async function main() {
  let tree = render();
  while (pendingEffects.length) {
    pendingEffects.splice(0).forEach(effect => effect());
    await new Promise(resolve => setImmediate(resolve));
    tree = render();
  }
  const rows = () => Array.from(find(tree, 'TeacherDashboard').rides, r => [r.id, r.status]);
  const submit = async ride => { response = ride; await find(tree, 'AddRideModal').onSubmit({}); tree = render(); };
  assert.deepEqual(rows(), [['other', 'scheduled'], ['read-back', 'scheduled']]);
  await submit({ ...existing, status: 'cancelled' });
  assert.deepEqual(rows().sort(), [['other', 'scheduled'], ['read-back', 'cancelled']]);
  await submit(existing); // Late initial creation response after the terminal state was read back.
  assert.deepEqual(rows().sort(), [['other', 'scheduled'], ['read-back', 'cancelled']]);
  await submit({ ...existing, id: 'new' });
  assert.deepEqual(rows()[0], ['new', 'scheduled']);
  assert.equal(rows().length, 3);
  console.log('PASS Reservation replay updates one dashboard row, preserves terminal state and inserts new IDs');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
