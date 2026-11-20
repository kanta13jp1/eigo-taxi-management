// Render contract: the admin "生徒・チケット管理" tab marks 2, 1 and 0 remaining tickets,
// using the same threshold as the summary card. React server rendering with a synthetic
// fixture; no browser, network or Google.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const ts = require('typescript'), React = require('react'), { renderToStaticMarkup } = require('react-dom/server');
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (m, file) => m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText, file);
const { TeacherDashboard } = require('../src/components/TeacherDashboard.tsx');

// The tab is internal state with a lazy initial value; open the students tab for rendering.
const realUseState = React.useState;
function renderTab(tab, students) {
  React.useState = initial => typeof initial === 'function' && ['today', 'allRides'].includes(initial()) ? realUseState(tab) : realUseState(initial);
  try { return renderToStaticMarkup(React.createElement(TeacherDashboard, { isDemo: true, rides: [], students })); }
  finally { React.useState = realUseState; }
}
const text = html => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const student = balance => ({ id: 'FIXTURE-' + balance, name: '架空生徒' + balance, parentName: '架空保護者', ticketBalance: balance, address: 'テスト' });
const card = (html, balance) => {
  const start = html.indexOf('FIXTURE-' + balance); assert.ok(start >= 0, 'card for balance ' + balance);
  const next = html.indexOf('FIXTURE-', start + 1); return html.slice(start, next < 0 ? undefined : next);
};
const results = [];
// The balance badge is the only element with "text-xl font-black" in a card; read its own classes.
const badge = c => { const m = c.match(/class="(text-xl font-black[^"]*)"/); assert.ok(m, 'badge element'); return m[1]; };
function check(id, name, fn) { fn(); results.push({ id, name, status: 'PASS' }); console.log('PASS ' + id + ' ' + name); }

const balances = [5, 3, 2, 1, 0];
const html = renderTab('students', balances.map(student));
check('LOWUI-01', 'Students tab is the tab rendered', () => assert.ok(text(html).includes('生徒台帳・チケット残数状況')));
check('LOWUI-02', 'Balances 2 and 1 get the amber badge and a 残りN回 label', () => {
  for (const b of [2, 1]) { const c = card(html, b); assert.match(badge(c), /bg-amber-100/, 'amber ' + b); assert.ok(text(c).includes('残り' + b + '回'), 'label ' + b); }
});
check('LOWUI-03', 'Balance 0 keeps the red badge and チケット切れ, with no 残りN回 label', () => {
  const c = card(html, 0); assert.match(badge(c), /bg-rose-100/); assert.ok(text(c).includes('チケット切れ')); assert.ok(!/残り\d+回/.test(text(c)));
});
check('LOWUI-04', 'Balances 5 and 3 stay green with no warning label', () => {
  for (const b of [5, 3]) { const c = card(html, b); assert.match(badge(c), /bg-emerald-100/, 'green ' + b); assert.ok(!/残り\d+回|チケット切れ/.test(text(c)), 'no label ' + b); }
});
check('LOWUI-05', 'Each warned student in the list is counted by the summary card, and only those', () => {
  const warnedInList = balances.filter(b => { const k = badge(card(html, b)); return /bg-(amber|rose)-100/.test(k); }).length;
  const summary = text(renderTab('today', balances.map(student))).match(/チケット残り2枚以下\s*(\d+)\s*名/)?.[1];
  assert.equal(warnedInList, 3); assert.equal(summary, String(warnedInList));
});

const out = process.env.EIGO_TEST_OUTPUT_DIR;
if (out) {
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'student-low-ticket-ui.json'), JSON.stringify({
    executedAt: new Date().toISOString(), mode: 'React server rendering with a synthetic fixture and the internal tab state opened by the test; no browser, network or Google',
    sourceHashes: Object.fromEntries(['src/components/TeacherDashboard.tsx', 'scripts/test_student_low_ticket_ui.cjs'].map(p => [p, crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),
    results,
  }, null, 2));
}
