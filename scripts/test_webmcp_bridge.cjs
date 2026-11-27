// Offline contract test for src/components/WebMcpBridge.tsx:
// verifies document.modelContext / navigator.modelContext fallback, unauthenticated PII protection,
// role-scoped tool registration (admin, parent, reviewer), AbortSignal cleanup, and handler execution.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function createHarness(target = 'document') {
  const registry = new Map();
  const modelContext = {
    registerTool(tool, options) {
      registry.set(tool.name, tool);
      options?.signal?.addEventListener('abort', () => {
        registry.delete(tool.name);
      });
    },
    unregisterTool(name) {
      registry.delete(name);
    },
  };

  const cleanups = [];
  const prevDeps = [];
  let cursor = 0;
  let refObj = null;

  const react = {
    useRef(initial) {
      if (!refObj) refObj = { current: initial };
      return refObj;
    },
    useEffect(effect, deps) {
      const idx = cursor++;
      const last = prevDeps[idx];
      const changed = !deps || !last || deps.some((d, i) => d !== last[i]);
      if (changed) {
        if (typeof cleanups[idx] === 'function') {
          cleanups[idx]();
          cleanups[idx] = null;
        }
        prevDeps[idx] = deps ? deps.slice() : null;
        cleanups[idx] = effect() || null;
      }
    },
  };

  const exportsObject = {};
  const source = fs.readFileSync('src/components/WebMcpBridge.tsx', 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;

  const sandbox = {
    exports: exportsObject,
    AbortController,
    document: target === 'document' ? { modelContext } : {},
    navigator: target === 'navigator' ? { modelContext } : {},
    require(name) {
      if (name === 'react') return react;
      throw new Error('Unexpected dependency in WebMcpBridge: ' + name);
    },
  };
  vm.runInNewContext(transpiled, sandbox);

  return {
    registry,
    render(props) {
      cursor = 0;
      return exportsObject.WebMcpBridge(props);
    },
    unmount() {
      for (let i = 0; i < cleanups.length; i++) {
        if (typeof cleanups[i] === 'function') {
          cleanups[i]();
          cleanups[i] = null;
        }
      }
    },
  };
}

function parseResult(result) {
  assert.ok(Array.isArray(result.content) && result.content[0]?.type === 'text');
  return JSON.parse(result.content[0].text);
}

async function main() {
  const calls = [];
  const sampleStudents = [
    {
      id: 'STU-001',
      name: '田中 陽菜',
      parentName: '田中 美咲',
      phone: '090-1111-2222',
      address: '世田谷区1-1',
      pickupNote: '',
      ticketBalance: 7,
      createdAt: '2026-09-01',
    },
    {
      id: 'STU-002',
      name: '山本 颯太',
      parentName: '山本 健一',
      phone: '080-3333-4444',
      address: '世田谷区2-2',
      pickupNote: '',
      ticketBalance: 1,
      createdAt: '2026-09-10',
    },
  ];
  const sampleRides = [
    {
      id: 'RIDE-101',
      studentId: 'STU-001',
      studentName: '田中 陽菜',
      rideDate: '2026-11-23',
      rideTime: '16:00',
      rideType: 'pickup',
      pickupLocation: '世田谷区1-1',
      status: 'scheduled',
      reservedBy: 'parent',
    },
  ];

  const baseHandlers = {
    onEnterDemo: (role) => calls.push(['enterDemo', role]),
    onCreateRide: async (data) => calls.push(['createRide', data]),
    onCancelRide: async (id) => calls.push(['cancelRide', id]),
    onCompleteRide: async (id) => calls.push(['completeRide', id]),
    onAddTickets: async (params) => calls.push(['addTickets', params]),
    onAddStudent: async (stu) => calls.push(['addStudent', stu]),
    onSwitchTab: (tab) => calls.push(['switchTab', tab]),
    onRefreshData: async () => calls.push(['refreshData']),
  };

  // 1. Unauthenticated document.modelContext exposes only status (no PII) & enter_demo
  const docHarness = createHarness('document');
  const rendered = docHarness.render({
    session: null,
    route: { kind: 'home' },
    students: sampleStudents,
    rides: sampleRides,
    currentTab: 'teacher',
    isAdmin: false,
    reviewOnly: false,
    isFullAdmin: false,
    ...baseHandlers,
  });
  assert.equal(rendered, null);
  assert.deepEqual(Array.from(docHarness.registry.keys()).sort(), [
    'eigo_taxi_enter_demo',
    'eigo_taxi_get_status',
  ]);
  const unauthStatus = parseResult(await docHarness.registry.get('eigo_taxi_get_status').execute({}));
  assert.deepEqual(unauthStatus, { loggedIn: false, portalRoute: 'home', releasePolicy: 'HOLD' });
  await docHarness.registry.get('eigo_taxi_enter_demo').execute({ role: 'admin' });
  assert.deepEqual(calls.at(-1), ['enterDemo', 'admin']);

  // 2. Full admin session exposes all 10 logged-in tools
  docHarness.render({
    session: { mode: 'demo', user: { id: 'demo-admin', name: '管理者デモ', role: 'admin', studentIds: [] } },
    route: { kind: 'admin' },
    students: sampleStudents,
    rides: sampleRides,
    currentTab: 'teacher',
    isAdmin: true,
    reviewOnly: false,
    isFullAdmin: true,
    ...baseHandlers,
  });
  assert.deepEqual(Array.from(docHarness.registry.keys()).sort(), [
    'eigo_taxi_add_tickets',
    'eigo_taxi_cancel_reservation',
    'eigo_taxi_complete_ride',
    'eigo_taxi_create_reservation',
    'eigo_taxi_create_student',
    'eigo_taxi_get_status',
    'eigo_taxi_list_rides',
    'eigo_taxi_list_students',
    'eigo_taxi_refresh_data',
    'eigo_taxi_switch_tab',
  ]);

  const lowStu = parseResult(
    await docHarness.registry.get('eigo_taxi_list_students').execute({ lowTicketOnly: true }),
  );
  assert.equal(lowStu.count, 1);
  assert.equal(lowStu.students[0].id, 'STU-002');

  await docHarness.registry.get('eigo_taxi_create_reservation').execute({
    studentId: 'STU-001',
    rideDate: '2026-11-24',
    rideTime: '17:00',
    rideType: 'roundtrip',
    pickupLocation: '桜新町',
  });
  assert.equal(calls.at(-1)[0], 'createRide');
  assert.equal(calls.at(-1)[1].reservedBy, 'teacher');

  await docHarness.registry.get('eigo_taxi_complete_ride').execute({ rideId: 'RIDE-101' });
  assert.deepEqual(calls.at(-1), ['completeRide', 'RIDE-101']);

  await docHarness.registry.get('eigo_taxi_switch_tab').execute({ tab: 'accounts' });
  assert.deepEqual(calls.at(-1), ['switchTab', 'accounts']);

  // Failing cancel/refresh handlers must return isError: true rather than silent success
  docHarness.render({
    session: { mode: 'demo', user: { id: 'demo-admin', name: '管理者デモ', role: 'admin', studentIds: [] } },
    route: { kind: 'admin' },
    students: sampleStudents,
    rides: sampleRides,
    currentTab: 'teacher',
    isAdmin: true,
    reviewOnly: false,
    isFullAdmin: true,
    ...baseHandlers,
    onCancelRide: async () => { throw new Error('完了済みの予約はキャンセルできません'); },
    onRefreshData: async () => { throw new Error('通信に失敗しました'); },
  });
  const failedCancel = await docHarness.registry.get('eigo_taxi_cancel_reservation').execute({ rideId: 'RIDE-101' });
  assert.equal(failedCancel.isError, true);
  assert.match(parseResult(failedCancel).error, /キャンセルできません/);
  const failedRefresh = await docHarness.registry.get('eigo_taxi_refresh_data').execute({});
  assert.equal(failedRefresh.isError, true);
  assert.match(parseResult(failedRefresh).error, /通信に失敗しました/);

  // 3. Review-only admin hides create_student and switch_tab
  docHarness.render({
    session: {
      mode: 'live',
      user: { id: 'rev-1', name: '検証担当', role: 'admin', studentIds: ['STU-001'], reviewOnly: true },
    },
    route: { kind: 'admin' },
    students: [sampleStudents[0]],
    rides: sampleRides,
    currentTab: 'teacher',
    isAdmin: true,
    reviewOnly: true,
    isFullAdmin: false,
    ...baseHandlers,
  });
  assert.equal(docHarness.registry.has('eigo_taxi_create_student'), false);
  assert.equal(docHarness.registry.has('eigo_taxi_switch_tab'), false);
  assert.equal(docHarness.registry.has('eigo_taxi_complete_ride'), true);

  // 4. Parent session hides admin tools and navigator.modelContext fallback works
  const navHarness = createHarness('navigator');
  navHarness.render({
    session: { mode: 'demo', user: { id: 'demo-parent', name: '保護者デモ', role: 'parent', studentIds: ['STU-001'] } },
    route: { kind: 'parent' },
    students: [sampleStudents[0]],
    rides: sampleRides,
    currentTab: 'teacher',
    isAdmin: false,
    reviewOnly: false,
    isFullAdmin: false,
    ...baseHandlers,
  });
  assert.deepEqual(Array.from(navHarness.registry.keys()).sort(), [
    'eigo_taxi_cancel_reservation',
    'eigo_taxi_create_reservation',
    'eigo_taxi_get_status',
    'eigo_taxi_list_rides',
    'eigo_taxi_list_students',
    'eigo_taxi_refresh_data',
  ]);

  // 5. Logout & unmount abort clears tools
  navHarness.unmount();
  assert.equal(navHarness.registry.size, 0);
  docHarness.unmount();
  assert.equal(docHarness.registry.size, 0);

  console.log('PASS WebMcpBridge isolates roles, hides unauth PII, falls back to navigator.modelContext, and cleans up via AbortSignal');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
