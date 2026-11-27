import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { DemoFileStore, getJstDateString } from '../dist/lib/store.js';

function createTempStore(options = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eigo-taxi-store-'));
  const stateFilePath = path.join(dir, 'state.json');
  const store = new DemoFileStore({ stateFilePath, ...options });
  return {
    dir,
    stateFilePath,
    store,
    cleanup() {
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}

test('DemoFileStore seeds initial students, rides, and purchases with JST today', () => {
  const ctx = createTempStore();
  try {
    const today = getJstDateString();
    const students = ctx.store.getStudents();
    assert.equal(students.length, 3);
    assert.deepEqual(
      students.map((s) => [s.id, s.ticketBalance]),
      [
        ['STU-001', 7],
        ['STU-002', 1],
        ['STU-003', 0],
      ],
    );

    const rides = ctx.store.getRides();
    assert.equal(rides.length, 3);
    assert.equal(rides.filter((r) => r.rideDate === today).length, 2);
    assert.equal(ctx.store.getPurchases().length, 2);
    assert.equal(fs.existsSync(ctx.stateFilePath), true);
  } finally {
    ctx.cleanup();
  }
});

test('DemoFileStore enforces ticket consumption (1 one-way / 2 roundtrip), insufficient balance, and idempotency', () => {
  const ctx = createTempStore();
  try {
    const today = getJstDateString();

    // Create roundtrip ride for STU-002 (balance=1) -> succeeds on creation (tickets consumed on completion)
    const createdRoundtrip = ctx.store.createReservation({
      rideId: 'RIDE-RT-TEST',
      studentId: 'STU-002',
      rideDate: today,
      rideTime: '18:00',
      rideType: 'roundtrip',
      pickupLocation: '用賀駅',
    });
    assert.equal(createdRoundtrip.replayed, false);
    assert.equal(createdRoundtrip.ride.status, 'scheduled');

    // Replay same reservation ID with identical payload succeeds
    const replayed = ctx.store.createReservation({
      rideId: 'RIDE-RT-TEST',
      studentId: 'STU-002',
      rideDate: today,
      rideTime: '18:00',
      rideType: 'roundtrip',
      pickupLocation: '用賀駅',
    });
    assert.equal(replayed.replayed, true);

    // Same ID with different payload fails with ID_CONFLICT
    assert.throws(
      () =>
        ctx.store.createReservation({
          rideId: 'RIDE-RT-TEST',
          studentId: 'STU-002',
          rideDate: today,
          rideTime: '19:00',
          rideType: 'roundtrip',
          pickupLocation: '用賀駅',
        }),
      /ID_CONFLICT/,
    );

    // Completing roundtrip when balance=1 fails (requires 2)
    assert.throws(() => ctx.store.completeRide('RIDE-RT-TEST'), /チケット残数が不足/);

    // Add 5 tickets -> balance becomes 6, then complete roundtrip -> consumes 2 -> balance 4
    const added = ctx.store.addTickets({
      purchaseId: 'PUR-TEST-5',
      studentId: 'STU-002',
      ticketCount: 5,
      amount: 5000,
      note: 'テスト追加',
    });
    assert.equal(added.newBalance, 6);

    const completed = ctx.store.completeRide('RIDE-RT-TEST');
    assert.equal(completed.success, true);
    assert.equal(completed.replayed, false);
    assert.equal(completed.consumedTickets, 2);
    assert.equal(completed.remainingBalance, 4);

    // Replaying completeRide is idempotent and consumes 0
    const completedAgain = ctx.store.completeRide('RIDE-RT-TEST');
    assert.equal(completedAgain.replayed, true);
    assert.equal(completedAgain.consumedTickets, 0);
    assert.equal(completedAgain.remainingBalance, 4);

    // Completed ride cannot be cancelled
    assert.throws(() => ctx.store.cancelReservation('RIDE-RT-TEST'), /完了済みの予約はキャンセルできません/);

    // Complete one-way ride RIDE-101 (STU-001 balance 7 -> 6)
    const oneWay = ctx.store.completeRide('RIDE-101');
    assert.equal(oneWay.consumedTickets, 1);
    assert.equal(oneWay.remainingBalance, 6);

    // Cancel RIDE-102 and replay cancel
    const cancelled1 = ctx.store.cancelReservation('RIDE-102');
    assert.deepEqual(cancelled1, { cancelled: true, replayed: false });
    const cancelled2 = ctx.store.cancelReservation('RIDE-102');
    assert.deepEqual(cancelled2, { cancelled: true, replayed: true });
    assert.throws(() => ctx.store.completeRide('RIDE-102'), /キャンセル済み/);
  } finally {
    ctx.cleanup();
  }
});

test('DemoFileStore enforces parent role isolation, readonly mode, and corruption protection', () => {
  const ctx = createTempStore();
  try {
    ctx.store.switchRole('parent');
    const parentStudents = ctx.store.getStudents();
    assert.deepEqual(
      parentStudents.map((s) => s.id),
      ['STU-001'],
    );
    assert.throws(() => ctx.store.getStudentById('STU-002'), /アクセスできません/);
    assert.throws(
      () => ctx.store.createStudent({ name: 'テスト', address: '東京' }),
      /管理者権限が必要/,
    );
    assert.throws(() => ctx.store.completeRide('RIDE-101'), /管理者権限が必要/);
    assert.throws(
      () => ctx.store.addTickets({ studentId: 'STU-001', ticketCount: 5, amount: 5000 }),
      /管理者権限が必要/,
    );
    assert.throws(() => ctx.store.getPortalInvitations('https://eigo-taxi-test.web.app/'), /管理者権限が必要/);

    // Parent can reserve and cancel for own student STU-001
    const res = ctx.store.createReservation({
      studentId: 'STU-001',
      rideDate: getJstDateString(),
      rideTime: '18:30',
      rideType: 'pickup',
      pickupLocation: '桜新町駅',
    });
    assert.equal(res.ride.reservedBy, 'parent');
    assert.equal(ctx.store.cancelReservation(res.ride.id).cancelled, true);

    // Reset restores admin role & initial data
    ctx.store.switchRole('admin');
    ctx.store.reset();
    assert.equal(ctx.store.getStudents().length, 3);
    assert.equal(ctx.store.getStudentById('STU-001').ticketBalance, 7);

    // Readonly store refuses mutations and does not write initial state when missing
    const missingReadonlyPath = path.join(ctx.dir, 'readonly-missing.json');
    const missingReadonlyStore = new DemoFileStore({ stateFilePath: missingReadonlyPath, readonly: true });
    assert.equal(missingReadonlyStore.getStudents().length, 3);
    assert.equal(fs.existsSync(missingReadonlyPath), false);

    const readonlyStore = new DemoFileStore({ stateFilePath: ctx.stateFilePath, readonly: true });
    assert.equal(readonlyStore.getStudents().length, 3);
    assert.throws(() => readonlyStore.switchRole('parent'), /読み取り専用モード/);
    assert.throws(() => readonlyStore.reset(), /読み取り専用モード/);
    assert.throws(() => readonlyStore.completeRide('RIDE-101'), /読み取り専用モード/);

    // Explicit forcedRole overrides persisted role in state file
    const forcedParentStore = new DemoFileStore({ stateFilePath: ctx.stateFilePath, forcedRole: 'parent', readonly: true });
    assert.equal(forcedParentStore.getRole(), 'parent');
    assert.deepEqual(forcedParentStore.getStudents().map((s) => s.id), ['STU-001']);

    // Corrupted JSON is never silently overwritten
    fs.writeFileSync(ctx.stateFilePath, '{not-valid-json', 'utf8');
    assert.throws(() => ctx.store.getStudents(), /破損データの上書きを防止/);
  } finally {
    ctx.cleanup();
  }
});
