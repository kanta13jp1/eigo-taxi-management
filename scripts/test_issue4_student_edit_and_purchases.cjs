/* Offline behavioral & render contracts for Issue #4 (student profile edit & ticket purchase history). */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const vm = require('node:vm');
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
const { ParentPortal } = require('../src/components/ParentPortal.tsx');
const { EditStudentModal } = require('../src/components/EditStudentModal.tsx');

function loadApiService() {
  const localData = new Map();
  const sessionData = new Map();
  const makeStorage = (store) => ({
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: (k) => { store.delete(k); },
  });
  const win = {
    location: { hash: '#/admin', origin: 'https://eigo-taxi-test.web.app' },
    dispatchEvent() {},
    addEventListener() {},
  };
  const ctx = vm.createContext({
    console,
    structuredClone,
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000099' },
    localStorage: makeStorage(localData),
    sessionStorage: makeStorage(sessionData),
    window: win,
    CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    exports: {},
    module: { exports: {} },
    require(name) {
      if (name === '../portal') {
        return {
          DEMO_ENTRY_ID: '00000000-0000-4000-8000-000000000001',
          ENTRY_ID: /^[0-9a-f-]{36}$/i,
          assertPortal() {},
        };
      }
      if (name === '../deployment-config') {
        return {
          getDeploymentConfig: () => ({ gasApiUrl: 'https://script.google.com/macros/s/test/exec' }),
          requireGoogleConfig: () => ({ projectId: 'eigo-taxi-app', apiKey: 'synthetic-key' }),
        };
      }
      if (name === './google-auth') {
        return {
          getGoogleIdToken: async () => 'synthetic-token',
          signInGoogle: async () => ({ idToken: 'synthetic-token', uid: 'uid-1' }),
          signOutGoogle: async () => {},
        };
      }
      return require(name);
    },
  });
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/services/api.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInContext(code, ctx);
  return { api: ctx.exports.ApiService, sessionStorage: makeStorage(sessionData), sessionMap: sessionData, localMap: localData };
}

function renderDashboard({ tab, students, purchases, purchasesError = '', reviewOnly = false, withEdit = true }) {
  const realUseState = React.useState;
  React.useState = (initial) => {
    if (typeof initial === 'function' && ['today', 'allRides'].includes(initial())) {
      return realUseState(tab);
    }
    return realUseState(initial);
  };
  try {
    return renderToStaticMarkup(
      React.createElement(TeacherDashboard, {
        isDemo: true,
        students,
        rides: [],
        purchases,
        purchasesError,
        reviewOnly,
        onCompleteRide: async () => {},
        onCancelRide: async () => {},
        onOpenAddRide: () => {},
        onOpenAddTicket: () => {},
        onOpenAddStudent: () => {},
        onOpenEditStudent: withEdit ? () => {} : undefined,
      }),
    );
  } finally {
    React.useState = realUseState;
  }
}

const sampleStudents = [
  {
    id: 'STU-001',
    name: '架空 陽菜',
    parentName: '架空 美咲',
    phone: '090-1111-2222',
    address: '東京都世田谷区桜新町1-10-5 パークサイド201',
    pickupNote: 'エントランス前',
    ticketBalance: 7,
    createdAt: '2026-09-01',
  },
  {
    id: 'STU-002',
    name: '架空 颯太',
    parentName: '架空 健一',
    phone: '080-3333-4444',
    address: '東京都世田谷区用賀2-5-12',
    pickupNote: '正面道路沿い',
    ticketBalance: 1,
    createdAt: '2026-09-10',
  },
];

const samplePurchases = [
  {
    id: 'PUR-001',
    studentId: 'STU-001',
    studentName: '架空 陽菜',
    purchaseDate: '2026-09-01',
    ticketCount: 10,
    amount: 10000,
    note: '初回購入 (10回券)',
  },
  {
    id: 'PUR-002',
    studentId: 'STU-002',
    studentName: '架空 颯太',
    purchaseDate: '2026-09-10',
    ticketCount: 5,
    amount: 5000,
    note: '5回券購入',
  },
];

const results = [];
async function check(id, name, fn) {
  await fn();
  results.push({ id, name, status: 'PASS' });
  console.log(`PASS ${id} ${name}`);
}

(async () => {
  await check('ISS4-01', 'ApiService.updateStudent updates profile fields only, persists in demo storage, and blocks parent/reviewer/invalid input', async () => {
    const { api, sessionMap } = loadApiService();
    api.enterDemo('parent');
    await assert.rejects(
      () => api.updateStudent({ id: 'STU-001', name: 'Blocked', parentName: '', phone: '', address: 'Addr', pickupNote: '' }),
      /管理者権限が必要です/,
    );
    sessionMap.set('eigo_taxi_session', JSON.stringify({
      mode: 'demo',
      user: { id: 'rev-1', name: 'Reviewer', role: 'admin', studentIds: ['STU-001'], reviewOnly: true },
    }));
    await assert.rejects(
      () => api.updateStudent({ id: 'STU-001', name: 'Blocked', parentName: '', phone: '', address: 'Addr', pickupNote: '' }),
      /検証専用アカウント/,
    );
    api.enterDemo('admin');
    await assert.rejects(
      () => api.updateStudent({ id: 'STU-001', name: '   ', parentName: '', phone: '', address: 'Addr', pickupNote: '' }),
      /生徒ID・氏名・住所/,
    );
    await assert.rejects(
      () => api.updateStudent({ id: 'STU-MISSING', name: 'Name', parentName: '', phone: '', address: 'Addr', pickupNote: '' }),
      /生徒が見つかりません/,
    );
    const updated = await api.updateStudent({
      id: 'STU-001',
      name: '更新後 陽菜',
      parentName: '更新後 美咲',
      phone: '090-9999-8888',
      address: '東京都世田谷区弦巻9-9-9',
      pickupNote: '新メモ：裏口側',
    });
    assert.equal(updated.ticketBalance, 7);
    assert.equal(updated.createdAt, '2026-09-01');
    const fetched = await api.getStudentById('STU-001');
    assert.equal(fetched.name, '更新後 陽菜');
    assert.equal(fetched.pickupNote, '新メモ：裏口側');
    assert.equal(fetched.ticketBalance, 7);
  });

  await check('ISS4-02', 'ApiService.getPurchases enforces student scope, descending order, and includes newly added purchases', async () => {
    const { api } = loadApiService();
    api.enterDemo('parent');
    const parentPurchases = await api.getPurchases();
    assert.deepEqual(parentPurchases.map((p) => p.id), ['PUR-001']);

    api.enterDemo('admin');
    await api.addTickets({ studentId: 'STU-001', ticketCount: 3, amount: 3000, note: '追加テスト' });
    const adminPurchases = await api.getPurchases();
    assert.equal(adminPurchases.length, 3);
    assert.equal(adminPurchases[0].note, '追加テスト');
    assert.equal(adminPurchases[0].ticketCount, 3);

    api.enterDemo('parent');
    const updatedParentPurchases = await api.getPurchases();
    assert.equal(updatedParentPurchases.length, 2);
    assert.ok(updatedParentPurchases.every((p) => p.studentId === 'STU-001'));
  });

  await check('ISS4-03', 'EditStudentModal shows readonly ID/balance, pre-fills editable fields, and uses submittingRef/mountedRef/useModalDialog', () => {
    const html = renderToStaticMarkup(
      React.createElement(EditStudentModal, {
        isOpen: true,
        student: sampleStudents[0],
        onClose: () => {},
        onSubmit: async () => {},
      }),
    );
    assert.ok(html.includes('生徒情報の編集'));
    assert.ok(html.includes('STU-001'));
    assert.ok(html.includes('7回'));
    assert.ok(html.includes('架空 陽菜'));
    assert.ok(html.includes('エントランス前'));
    assert.ok(!html.includes('type="number"'));
    const closed = renderToStaticMarkup(
      React.createElement(EditStudentModal, {
        isOpen: false,
        student: sampleStudents[0],
        onClose: () => {},
        onSubmit: async () => {},
      }),
    );
    assert.equal(closed, '');
    const src = fs.readFileSync(path.join(__dirname, '../src/components/EditStudentModal.tsx'), 'utf8');
    assert.match(src, /const submittingRef = useRef\(false\);/);
    assert.match(src, /const mountedRef = useRef\(true\);/);
    assert.match(src, /isDismissDisabled: isSubmitting/);
  });

  await check('ISS4-04', 'TeacherDashboard renders 購入履歴 tab with totals/error state and hides 編集 button for reviewOnly', () => {
    const purchasesHtml = renderDashboard({ tab: 'purchases', students: sampleStudents, purchases: samplePurchases });
    assert.ok(purchasesHtml.includes('購入履歴 (2)'));
    assert.ok(purchasesHtml.includes('合計追加枚数'));
    assert.ok(purchasesHtml.includes('+15回'));
    assert.ok(purchasesHtml.includes('¥15,000'));
    assert.ok(purchasesHtml.includes('初回購入 (10回券)'));

    const errHtml = renderDashboard({ tab: 'purchases', students: sampleStudents, purchases: [], purchasesError: '購入履歴を読み込めません' });
    assert.ok(errHtml.includes('role="alert"'));
    assert.ok(errHtml.includes('購入履歴を読み込めません'));
    assert.ok(!errHtml.includes('合計追加枚数'));

    const studentsFullAdmin = renderDashboard({ tab: 'students', students: sampleStudents, purchases: samplePurchases, reviewOnly: false });
    assert.ok(studentsFullAdmin.includes('架空 陽菜 の生徒情報を編集'));

    const studentsReviewOnly = renderDashboard({ tab: 'students', students: sampleStudents, purchases: samplePurchases, reviewOnly: true });
    assert.ok(!studentsReviewOnly.includes('の生徒情報を編集'));
  });

  await check('ISS4-05', 'ParentPortal renders チケット購入履歴 for selected student only and shows purchasesError cleanly', () => {
    const html = renderToStaticMarkup(
      React.createElement(ParentPortal, {
        isDemo: true,
        students: sampleStudents,
        rides: [],
        purchases: samplePurchases,
        onOpenAddRide: () => {},
        onCancelRide: async () => {},
      }),
    );
    assert.ok(html.includes('チケット購入履歴'));
    assert.ok(html.includes('初回購入 (10回券)'));
    assert.ok(html.includes('¥10,000'));
    assert.ok(!html.includes('5回券購入'));

    const errHtml = renderToStaticMarkup(
      React.createElement(ParentPortal, {
        isDemo: true,
        students: [sampleStudents[0]],
        rides: [],
        purchases: [],
        purchasesError: '購入履歴の取得に失敗しました',
        onOpenAddRide: () => {},
        onCancelRide: async () => {},
      }),
    );
    assert.ok(errHtml.includes('role="status"'));
    assert.ok(errHtml.includes('購入履歴の取得に失敗しました'));
    const purchaseSection = errHtml.split('チケット購入履歴')[1].split('role="status"')[0];
    assert.ok(!purchaseSection.includes('0 件'));
  });

  const out = process.env.EIGO_TEST_OUTPUT_DIR;
  if (out) {
    fs.mkdirSync(out, { recursive: true });
    const files = [
      'src/services/api.ts',
      'src/App.tsx',
      'src/components/EditStudentModal.tsx',
      'src/components/TeacherDashboard.tsx',
      'src/components/ParentPortal.tsx',
      'scripts/test_issue4_student_edit_and_purchases.cjs',
    ];
    fs.writeFileSync(
      path.join(out, 'issue4-student-edit-and-purchases.json'),
      JSON.stringify(
        {
          executedAt: new Date().toISOString(),
          mode: 'offline Node VM + React server rendering; no real Google/GAS deployment',
          sourceHashes: Object.fromEntries(
            files.map((p) => [p, crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '..', p))).digest('hex')]),
          ),
          results,
        },
        null,
        2,
      ) + '\n',
    );
  }
  console.log(`ALL ${results.length}/5 Issue #4 contract checks passed.`);
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
