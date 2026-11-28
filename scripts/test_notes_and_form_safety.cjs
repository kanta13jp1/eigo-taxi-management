// Render and behavioral contract for Round 17:
// 1) TeacherDashboard Today cards render both student.pickupNote (permanent note) and ride.note (ride note).
// 2) TeacherDashboard AllRides table renders wrapped pickupLocation ([overflow-wrap:anywhere], no truncate) and ride.note.
// 3) TeacherDashboard Students cards render wrapped address (no truncate) and student.pickupNote.
// 4) ParentPortal registered info section renders student.pickupNote (or 未登録 fallback).
// 5) AddRideModal adjusts ticket warning by rideType (pickup/dropoff=1, roundtrip=2) and uses responsive date/time grid (grid-cols-1 sm:grid-cols-2).
// 6) AddRideModal, AddStudentModal, AddTicketModal implement synchronous submittingRef & mountedRef guards, and cancel cleanup effects include cancelPending.
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
const { ParentPortal } = require('../src/components/ParentPortal.tsx');
const { AddRideModal } = require('../src/components/AddRideModal.tsx');
const { getLocalDateString } = require('../src/services/api.ts');

const realUseState = React.useState;
function renderDashboard({ tab, students, rides }) {
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

function renderAddRide({ students, initialStudentId, rideType }) {
  let rideTypeReplaced = false;
  React.useState = (initial) => {
    if (!rideTypeReplaced && initial === 'pickup') {
      rideTypeReplaced = true;
      return realUseState(rideType);
    }
    return realUseState(initial);
  };
  try {
    return renderToStaticMarkup(
      React.createElement(AddRideModal, {
        isOpen: true,
        onClose: () => {},
        students,
        initialStudentId,
        isTeacher: true,
        onSubmit: async () => {},
      }),
    );
  } finally {
    React.useState = realUseState;
  }
}

const today = getLocalDateString();
const students = [
  {
    id: 'FIX-1',
    name: '架空 太郎',
    parentName: '保護者A',
    phone: '090-0000-0001',
    address: '東京都世田谷区テスト1-2-3 ロングマンション名1001号室',
    pickupNote: '常時メモA: 裏口前に停車',
    ticketBalance: 3,
    createdAt: today,
  },
  {
    id: 'FIX-2',
    name: '架空 花子',
    parentName: '保護者B',
    phone: '090-0000-0002',
    address: '東京都世田谷区テスト4-5-6',
    pickupNote: '常時メモB: インターホン鳴らす',
    ticketBalance: 1,
    createdAt: today,
  },
  {
    id: 'FIX-3',
    name: '架空 次郎',
    parentName: '保護者C',
    phone: '090-0000-0003',
    address: '東京都世田谷区テスト7-8-9',
    pickupNote: '',
    ticketBalance: 0,
    createdAt: today,
  },
];

const rides = [
  {
    id: 'R-1',
    studentId: 'FIX-1',
    studentName: '架空 太郎',
    rideDate: today,
    rideTime: '16:00',
    rideType: 'pickup',
    pickupLocation: '東京都世田谷区テスト1-2-3 ロングマンション名1001号室',
    note: '当日メモA: 傘持参',
    status: 'scheduled',
    reservedBy: 'parent',
  },
  {
    id: 'R-2',
    studentId: 'FIX-2',
    studentName: '架空 花子',
    rideDate: '2026-10-10',
    rideTime: '17:00',
    rideType: 'roundtrip',
    pickupLocation: '東京都世田谷区テスト4-5-6 ロングルート',
    note: '履歴連絡メモB',
    status: 'completed',
    reservedBy: 'teacher',
  },
];

const results = [];
function check(id, name, fn) {
  fn();
  results.push({ id, name, status: 'PASS' });
  console.log(`PASS ${id} ${name}`);
}

check('R17-01', 'TeacherDashboard Today card shows both student.pickupNote and ride.note', () => {
  const html = renderDashboard({ tab: 'today', students, rides });
  assert.ok(html.includes('📌 送迎メモ: 常時メモA: 裏口前に停車'));
  assert.ok(html.includes('💬 メモ: 当日メモA: 傘持参'));
});

check('R17-02', 'TeacherDashboard AllRides table wraps pickupLocation without truncate and renders ride.note', () => {
  const html = renderDashboard({ tab: 'allRides', students, rides });
  assert.ok(html.includes('💬 当日メモA: 傘持参'));
  assert.ok(html.includes('💬 履歴連絡メモB'));
  assert.ok(!html.includes('max-w-xs truncate'));
  assert.ok(html.includes('[overflow-wrap:anywhere]'));
});

check('R17-03', 'TeacherDashboard Students card wraps address without truncate and shows student.pickupNote', () => {
  const html = renderDashboard({ tab: 'students', students, rides });
  assert.ok(html.includes('📌 送迎メモ: 常時メモA: 裏口前に停車'));
  assert.ok(html.includes('📌 送迎メモ: 常時メモB: インターホン鳴らす'));
  assert.ok(!html.includes('class="truncate" title='));
});

check('R17-04', 'ParentPortal registered info shows student.pickupNote and 未登録 fallback', () => {
  const htmlWithNote = renderToStaticMarkup(
    React.createElement(ParentPortal, {
      isDemo: true,
      students: [students[0]],
      rides: [],
      onOpenAddRide: () => {},
      onCancelRide: async () => {},
    }),
  );
  assert.ok(htmlWithNote.includes('送迎メモ: 常時メモA: 裏口前に停車'));

  const htmlEmptyNote = renderToStaticMarkup(
    React.createElement(ParentPortal, {
      isDemo: true,
      students: [students[2]],
      rides: [],
      onOpenAddRide: () => {},
      onCancelRide: async () => {},
    }),
  );
  assert.ok(htmlEmptyNote.includes('送迎メモ: 未登録'));
});

check('R17-05', 'AddRideModal switches ticket shortage warning by rideType and uses responsive date/time grid', () => {
  const bal1Pickup = renderAddRide({ students, initialStudentId: 'FIX-2', rideType: 'pickup' });
  assert.ok(bal1Pickup.includes('現在のチケット残数が残り 1 枚です。'));
  assert.ok(!bal1Pickup.includes('チケットが不足します'));
  assert.ok(bal1Pickup.includes('grid-cols-1 sm:grid-cols-2'));

  const bal1Roundtrip = renderAddRide({ students, initialStudentId: 'FIX-2', rideType: 'roundtrip' });
  assert.ok(bal1Roundtrip.includes('現在のチケット残数が残り 1 枚のため、この予約（2枚消費）の完了時にはチケットが不足します'));

  const bal0Pickup = renderAddRide({ students, initialStudentId: 'FIX-3', rideType: 'pickup' });
  assert.ok(bal0Pickup.includes('現在のチケット残数が残り 0 枚のため、この予約（1枚消費）の完了時にはチケットが不足します'));

  const bal3Roundtrip = renderAddRide({ students, initialStudentId: 'FIX-1', rideType: 'roundtrip' });
  assert.ok(!bal3Roundtrip.includes('id="ride-student-low-ticket"'));
});

check('R17-06', 'Modal forms use synchronous submittingRef + mountedRef guards and cancel cleanup includes cancelPending', () => {
  for (const rel of [
    'src/components/AddRideModal.tsx',
    'src/components/AddStudentModal.tsx',
    'src/components/AddTicketModal.tsx',
  ]) {
    const src = fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');
    assert.match(src, /const submittingRef = useRef\(false\);/);
    assert.match(src, /const mountedRef = useRef\(true\);/);
    assert.match(src, /if \(submittingRef\.current\) return;/);
    assert.match(src, /submittingRef\.current = true;/);
    assert.match(src, /submittingRef\.current = false;/);
    assert.match(src, /if \(mountedRef\.current\)/);
  }
  for (const rel of [
    'src/components/TeacherDashboard.tsx',
    'src/components/ParentPortal.tsx',
  ]) {
    const src = fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');
    assert.match(src, /\[cancelRideId, cancelTarget, cancelPending\]/);
  }
});

const out = process.env.EIGO_TEST_OUTPUT_DIR;
if (out) {
  fs.mkdirSync(out, { recursive: true });
  const files = [
    'src/components/TeacherDashboard.tsx',
    'src/components/ParentPortal.tsx',
    'src/components/AddRideModal.tsx',
    'src/components/AddStudentModal.tsx',
    'src/components/AddTicketModal.tsx',
    'scripts/test_notes_and_form_safety.cjs',
  ];
  fs.writeFileSync(
    path.join(out, 'r17-notes-and-form-safety.json'),
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

console.log(`ALL ${results.length}/6 R17 contract checks passed.`);
