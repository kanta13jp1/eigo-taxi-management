// Render and behavioral contract for Round 16:
// 1) Admin "本日の送迎" renders a direct cancel button for scheduled rides only.
// 2) Admin "生徒・チケット管理" exposes "全員" / "残り2枚以下のみ" filters, filters correctly when set to 'low', and renders empty-state recovery when 0 low-ticket students exist.
// 3) Both TeacherDashboard and ParentPortal unify cancel dialogs on useModalDialog, await onCancelRide before closing, catch errors into role="alert", guard concurrent completion/cancellation, and clear stale cancelRideId.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

for (const ext of ['.ts', '.tsx']) {
  require.extensions[ext] = (m, file) =>
    m._compile(
      ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.ReactJSX,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText,
      file,
    );
}

const { TeacherDashboard } = require('../src/components/TeacherDashboard.tsx');
const { getLocalDateString } = require('../src/services/api.ts');

const realUseState = React.useState;
function renderDashboard({ tab, studentFilter = 'all', students, rides }) {
  let stringStateCount = 0;
  React.useState = (initial) => {
    if (typeof initial === 'function' && ['today', 'allRides'].includes(initial())) {
      return realUseState(tab);
    }
    if (initial === 'all') {
      stringStateCount += 1;
      // 1st 'all' state is filterStatus, 2nd 'all' state is studentFilter
      if (stringStateCount === 2) {
        return realUseState(studentFilter);
      }
    }
    return realUseState(initial);
  };
  try {
    return renderToStaticMarkup(
      React.createElement(TeacherDashboard, {
        isDemo: true,
        students,
        rides,
        onCompleteRide: async () => {},
        onCancelRide: async () => {},
        onOpenAddRide: () => {},
        onOpenAddTicket: () => {},
        onOpenAddStudent: () => {},
      }),
    );
  } finally {
    React.useState = realUseState;
  }
}

const today = getLocalDateString();
const students = [
  { id: 'FIX-1', name: '架空 太郎', parentName: '保護者A', ticketBalance: 5, address: '東京都世田谷区1-1', phone: '090-0000-0001' },
  { id: 'FIX-2', name: '架空 花子', parentName: '保護者B', ticketBalance: 2, address: '東京都世田谷区2-2', phone: '090-0000-0002' },
  { id: 'FIX-3', name: '架空 次郎', parentName: '保護者C', ticketBalance: 0, address: '東京都世田谷区3-3', phone: '090-0000-0003' },
];
const healthyStudents = [
  { id: 'FIX-9', name: '架空 健太', parentName: '保護者D', ticketBalance: 6, address: '東京都世田谷区4-4', phone: '090-0000-0004' },
];
const rides = [
  { id: 'R-SCHED', studentId: 'FIX-1', studentName: '架空 太郎', rideDate: today, rideTime: '15:30', rideType: 'pickup', pickupLocation: '自宅A', note: '雨天メモ', status: 'scheduled', reservedBy: 'parent', createdAt: today },
  { id: 'R-DONE', studentId: 'FIX-2', studentName: '架空 花子', rideDate: today, rideTime: '16:30', rideType: 'dropoff', pickupLocation: '自宅B', status: 'completed', reservedBy: 'teacher', createdAt: today },
];

const results = [];
function check(id, name, fn) {
  fn();
  results.push({ id, name, status: 'PASS' });
  console.log(`PASS ${id} ${name}`);
}

check('R16-01', 'Today tab renders direct cancel button for scheduled rides only', () => {
  const html = renderDashboard({ tab: 'today', students, rides });
  assert.match(html, /aria-label="架空 太郎 [^"]+ 15:30 お迎え の予約を取消"/);
  assert.doesNotMatch(html, /aria-label="架空 花子 [^"]+ 16:30 送り の予約を取消"/);
});

check('R16-02', 'Students tab filters to <=2 tickets when low filter active and shows empty-state recovery when none match', () => {
  const allHtml = renderDashboard({ tab: 'students', studentFilter: 'all', students, rides });
  assert.match(allHtml, /role="group"[^>]*aria-label="チケット残数で絞り込み"/);
  assert.match(allHtml, /全員 \(3\)/);
  assert.match(allHtml, /残り2枚以下のみ \(2\)/);
  assert.ok(allHtml.includes('FIX-1') && allHtml.includes('FIX-2') && allHtml.includes('FIX-3'));

  const lowHtml = renderDashboard({ tab: 'students', studentFilter: 'low', students, rides });
  assert.ok(!lowHtml.includes('FIX-1'), 'balance 5 excluded in low filter');
  assert.ok(lowHtml.includes('FIX-2') && lowHtml.includes('FIX-3'), 'balances 2 and 0 retained in low filter');

  const emptyLowHtml = renderDashboard({ tab: 'students', studentFilter: 'low', students: healthyStudents, rides: [] });
  assert.ok(emptyLowHtml.includes('チケット残り2枚以下の生徒はいません。'));
  assert.ok(emptyLowHtml.includes('全員を表示'));
});

check('R16-03', 'TeacherDashboard unifies cancel dialog on useModalDialog with error catch, race guard, and note display', () => {
  const src = fs.readFileSync(path.join(__dirname, '../src/components/TeacherDashboard.tsx'), 'utf8');
  assert.match(src, /useModalDialog\(\{[\s\S]*?isDismissDisabled:\s*cancelPending/);
  assert.match(src, /await onCancelRide\(targetId\);[\s\S]*?setCancelRideId\(null\);[\s\S]*?catch \(error\)/);
  assert.match(src, /inFlight\.has\(ride\.id\) \|\| cancellationInFlight\.current/);
  assert.match(src, /cancelTarget\.note && <p>備考: \{cancelTarget\.note\}<\/p>/);
  assert.match(src, /role="alert"[^>]*>\{cancelError\}/);
});

check('R16-04', 'ParentPortal unifies cancel dialog on useModalDialog with error catch and stale-id cleanup', () => {
  const src = fs.readFileSync(path.join(__dirname, '../src/components/ParentPortal.tsx'), 'utf8');
  assert.match(src, /useModalDialog\(\{[\s\S]*?isDismissDisabled:\s*cancelPending/);
  assert.match(src, /await onCancelRide\(targetId\);[\s\S]*?setCancelRideId\(null\);[\s\S]*?catch \(error\)/);
  assert.match(src, /role="alert"[^>]*>\{cancelError\}/);
  assert.match(src, /setPreferredStudentId\(e\.target\.value\);[\s\S]*?setCancelRideId\(null\)/);
});

check('R16-05', 'useModalDialog falls back to #main-content when previous trigger is disconnected', () => {
  const src = fs.readFileSync(path.join(__dirname, '../src/hooks/useModalDialog.ts'), 'utf8');
  assert.match(src, /document\.getElementById\('main-content'\)/);
});

const out = process.env.EIGO_TEST_OUTPUT_DIR;
if (out) {
  fs.mkdirSync(out, { recursive: true });
  const files = [
    'src/hooks/useModalDialog.ts',
    'src/components/TeacherDashboard.tsx',
    'src/components/ParentPortal.tsx',
    'scripts/test_dashboard_cancel_and_filter.cjs',
  ];
  fs.writeFileSync(
    path.join(out, 'r16-cancel-and-filter-contract.json'),
    JSON.stringify(
      {
        executedAt: new Date().toISOString(),
        mode: 'offline React server rendering + source contract verification',
        sourceHashes: Object.fromEntries(
          files.map((p) => [p, crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '..', p))).digest('hex')]),
        ),
        results,
      },
      null,
      2,
    ),
  );
}

console.log(`ALL ${results.length}/5 R16 contract checks passed.`);
