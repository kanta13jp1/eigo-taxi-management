import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {
  AddTicketsInput,
  AddTicketsResult,
  CancelReservationResult,
  CompleteRideResult,
  CreateReservationInput,
  CreateStudentInput,
  PortalInvitation,
  PortalRole,
  RideReservation,
  RideType,
  Student,
  TicketPurchase,
} from './types.js';

export const DEMO_ENTRY_ID = '00000000-0000-4000-8000-000000000001';
const DEMO_PARENT_STUDENT_IDS = ['STU-001'];
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface DemoState {
  version: 1;
  role: PortalRole;
  students: Student[];
  rides: RideReservation[];
  purchases: TicketPurchase[];
}

export function getJstDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getJstTimestampString(date: Date = new Date()): string {
  return date.toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function resolveDefaultStateFile(env: NodeJS.ProcessEnv = process.env): string {
  if (env.EIGO_TAXI_MCP_STATE_FILE?.trim()) {
    return path.resolve(env.EIGO_TAXI_MCP_STATE_FILE.trim());
  }
  if (env.EIGO_TAXI_MCP_DATA_DIR?.trim()) {
    return path.join(path.resolve(env.EIGO_TAXI_MCP_DATA_DIR.trim()), 'demo-state.json');
  }
  return path.join(os.tmpdir(), 'eigo-taxi-mcp', 'demo-state.json');
}

export function buildInitialDemoState(role: PortalRole = 'admin'): DemoState {
  const today = getJstDateString();
  return {
    version: 1,
    role,
    students: [
      {
        id: 'STU-001',
        name: '田中 陽菜 (ひな)',
        parentName: '田中 美咲',
        phone: '090-1111-2222',
        address: '東京都世田谷区桜新町1-10-5 パークサイド201',
        pickupNote: 'エントランス前。到着時インターホンかLINE',
        ticketBalance: 7,
        createdAt: '2026-09-01',
      },
      {
        id: 'STU-002',
        name: '山本 颯太 (そうた)',
        parentName: '山本 健一',
        phone: '080-3333-4444',
        address: '東京都世田谷区用賀2-5-12',
        pickupNote: '正面道路沿いで待機しています',
        ticketBalance: 1,
        createdAt: '2026-09-10',
      },
      {
        id: 'STU-003',
        name: '高橋 莉子 (りこ)',
        parentName: '高橋 智子',
        phone: '090-5555-6666',
        address: '東京都世田谷区弦巻3-8-1',
        pickupNote: '自宅玄関先までお越しください',
        ticketBalance: 0,
        createdAt: '2026-09-15',
      },
    ],
    rides: [
      {
        id: 'RIDE-101',
        studentId: 'STU-001',
        studentName: '田中 陽菜 (ひな)',
        rideDate: today,
        rideTime: '16:00',
        rideType: 'pickup',
        pickupLocation: '東京都世田谷区桜新町1-10-5 パークサイド201',
        status: 'scheduled',
        calendarEventId: 'mock-cal-101',
        note: 'レッスン前のお迎え',
        reservedBy: 'parent',
      },
      {
        id: 'RIDE-102',
        studentId: 'STU-002',
        studentName: '山本 颯太 (そうた)',
        rideDate: today,
        rideTime: '17:30',
        rideType: 'dropoff',
        pickupLocation: '英語教室 → 東京都世田谷区用賀2-5-12',
        status: 'scheduled',
        calendarEventId: 'mock-cal-102',
        note: 'レッスン後のご自宅送り',
        reservedBy: 'teacher',
      },
      {
        id: 'RIDE-103',
        studentId: 'STU-001',
        studentName: '田中 陽菜 (ひな)',
        rideDate: '2026-10-06',
        rideTime: '16:00',
        rideType: 'roundtrip',
        pickupLocation: '東京都世田谷区桜新町1-10-5 パークサイド201',
        status: 'completed',
        completedAt: '2026-10-06 17:45',
        note: '送迎完了済み',
        reservedBy: 'parent',
      },
    ],
    purchases: [
      {
        id: 'PUR-001',
        studentId: 'STU-001',
        studentName: '田中 陽菜 (ひな)',
        purchaseDate: '2026-09-01',
        ticketCount: 10,
        amount: 10000,
        note: '初回購入 (10回券)',
      },
      {
        id: 'PUR-002',
        studentId: 'STU-002',
        studentName: '山本 颯太 (そうた)',
        purchaseDate: '2026-09-10',
        ticketCount: 5,
        amount: 5000,
        note: '5回券購入',
      },
    ],
  };
}

function validateId(value: string, label: string): string {
  if (typeof value !== 'string' || !ID_PATTERN.test(value)) {
    throw new Error(`${label}の形式が不正です`);
  }
  return value;
}

function validateText(value: string | undefined, label: string, required = false): string {
  if (value === undefined && !required) return '';
  if (typeof value !== 'string' || value.length > 2000 || (required && !value.trim())) {
    throw new Error(`${label}を確認してください`);
  }
  return value.trim();
}

function validateRideDateTime(rideDate: string, rideTime: string): void {
  if (!DATE_PATTERN.test(rideDate) || !TIME_PATTERN.test(rideTime)) {
    throw new Error('送迎日 (YYYY-MM-DD) と送迎時間 (HH:mm) を確認してください');
  }
  const parsed = new Date(`${rideDate}T${rideTime}:00+09:00`);
  if (!Number.isFinite(parsed.getTime()) || getJstDateString(parsed) !== rideDate) {
    throw new Error('存在しない送迎日です');
  }
}

function validateRideType(value: string): RideType {
  if (value !== 'pickup' && value !== 'dropoff' && value !== 'roundtrip') {
    throw new Error('送迎区分は pickup / dropoff / roundtrip のいずれかを指定してください');
  }
  return value;
}

export class DemoFileStore {
  readonly stateFilePath: string;
  readonly readonly: boolean;
  private readonly defaultRole: PortalRole;
  private readonly forcedRole?: PortalRole;

  constructor(
    options: { stateFilePath?: string; readonly?: boolean; defaultRole?: PortalRole; forcedRole?: PortalRole } = {},
  ) {
    this.stateFilePath = options.stateFilePath ?? resolveDefaultStateFile();
    this.readonly = options.readonly ?? false;
    this.defaultRole = options.forcedRole ?? options.defaultRole ?? 'admin';
    this.forcedRole = options.forcedRole;
  }

  private assertWritable(): void {
    if (this.readonly) {
      throw new Error('読み取り専用モード (EIGO_TAXI_MCP_READONLY=true) のため変更操作は拒否されました');
    }
  }

  private loadState(): DemoState {
    if (!fs.existsSync(this.stateFilePath)) {
      const initial = buildInitialDemoState(this.defaultRole);
      if (!this.readonly) {
        this.saveState(initial);
      }
      return initial;
    }
    const raw = fs.readFileSync(this.stateFilePath, 'utf8');
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`デモ保存ファイル (${this.stateFilePath}) の JSON を読み取れません。破損データの上書きを防止するため処理を中止しました。`);
    }
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray((parsed as DemoState).students) ||
      !Array.isArray((parsed as DemoState).rides) ||
      !Array.isArray((parsed as DemoState).purchases) ||
      ((parsed as DemoState).role !== 'admin' && (parsed as DemoState).role !== 'parent')
    ) {
      throw new Error(`デモ保存ファイル (${this.stateFilePath}) の構造が不正です。上書きを防止するため処理を中止しました。`);
    }
    const state = parsed as DemoState;
    if (this.forcedRole) {
      state.role = this.forcedRole;
    }
    return state;
  }

  private saveState(state: DemoState): void {
    const dir = path.dirname(this.stateFilePath);
    fs.mkdirSync(dir, { recursive: true });
    const tmpPath = path.join(dir, `${path.basename(this.stateFilePath)}.${process.pid}.${crypto.randomUUID()}.tmp`);
    fs.writeFileSync(tmpPath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
    fs.renameSync(tmpPath, this.stateFilePath);
  }

  private mayAccessStudent(role: PortalRole, studentId: string): boolean {
    return role === 'admin' || DEMO_PARENT_STUDENT_IDS.includes(studentId);
  }

  private assertStudentAccess(role: PortalRole, studentId: string): void {
    if (!this.mayAccessStudent(role, studentId)) {
      throw new Error('この生徒にはアクセスできません');
    }
  }

  private assertAdmin(role: PortalRole): void {
    if (role !== 'admin') {
      throw new Error('管理者権限が必要です');
    }
  }

  getRole(): PortalRole {
    return this.loadState().role;
  }

  switchRole(role: PortalRole): PortalRole {
    this.assertWritable();
    const state = this.loadState();
    state.role = role;
    this.saveState(state);
    return role;
  }

  reset(): DemoState {
    this.assertWritable();
    const fresh = buildInitialDemoState(this.defaultRole);
    this.saveState(fresh);
    return fresh;
  }

  getStudents(): Student[] {
    const state = this.loadState();
    return state.students.filter((s) => this.mayAccessStudent(state.role, s.id));
  }

  getStudentById(studentId: string): Student {
    const state = this.loadState();
    this.assertStudentAccess(state.role, studentId);
    const found = state.students.find((s) => s.id === studentId);
    if (!found) {
      throw new Error(`生徒が見つかりません: ${studentId}`);
    }
    return found;
  }

  getRides(): RideReservation[] {
    const state = this.loadState();
    return state.rides
      .filter((r) => this.mayAccessStudent(state.role, r.studentId))
      .sort((a, b) => `${b.rideDate} ${b.rideTime}`.localeCompare(`${a.rideDate} ${a.rideTime}`));
  }

  getPurchases(): TicketPurchase[] {
    const state = this.loadState();
    return state.purchases.filter((p) => this.mayAccessStudent(state.role, p.studentId));
  }

  createStudent(input: CreateStudentInput): { student: Student; replayed: boolean } {
    this.assertWritable();
    const state = this.loadState();
    this.assertAdmin(state.role);

    const name = validateText(input.name, '生徒氏名', true);
    const address = validateText(input.address, '送迎場所住所', true);
    const parentName = validateText(input.parentName, '保護者名', false);
    const phone = validateText(input.phone, '緊急連絡先', false);
    const pickupNote = validateText(input.pickupNote, '送迎時メモ', false);
    const ticketBalance = input.ticketBalance ?? 0;
    if (!Number.isSafeInteger(ticketBalance) || ticketBalance < 0) {
      throw new Error('初期残チケット数は0以上の整数で指定してください');
    }

    const id = input.id !== undefined ? validateId(input.id, '生徒ID') : `STU-${crypto.randomUUID()}`;
    const existing = state.students.find((s) => s.id === id);
    if (existing) {
      if (
        existing.name !== name ||
        existing.parentName !== parentName ||
        existing.phone !== phone ||
        existing.address !== address ||
        existing.pickupNote !== pickupNote ||
        existing.ticketBalance !== ticketBalance
      ) {
        throw new Error('ID_CONFLICT: 同じ生徒IDで異なる内容が既に登録されています');
      }
      return { student: existing, replayed: true };
    }

    const created: Student = {
      id,
      name,
      parentName,
      phone,
      address,
      pickupNote,
      ticketBalance,
      createdAt: getJstDateString(),
    };
    state.students.push(created);
    this.saveState(state);
    return { student: created, replayed: false };
  }

  createReservation(input: CreateReservationInput): { ride: RideReservation; replayed: boolean } {
    this.assertWritable();
    const state = this.loadState();
    const studentId = validateId(input.studentId, '生徒ID');
    this.assertStudentAccess(state.role, studentId);

    const student = state.students.find((s) => s.id === studentId);
    if (!student) {
      throw new Error('生徒が見つかりません');
    }

    const rideType = validateRideType(input.rideType);
    validateRideDateTime(input.rideDate, input.rideTime);
    const pickupLocation = validateText(input.pickupLocation, '送迎場所', true);
    const note = validateText(input.note, '備考', false);
    const reservedBy = state.role === 'admin' ? 'teacher' : 'parent';
    const rideId = input.rideId !== undefined ? validateId(input.rideId, '送迎ID') : `RIDE-${crypto.randomUUID()}`;

    const existing = state.rides.find((r) => r.id === rideId);
    if (existing) {
      this.assertStudentAccess(state.role, existing.studentId);
      if (
        existing.studentId !== studentId ||
        existing.rideDate !== input.rideDate ||
        existing.rideTime !== input.rideTime ||
        existing.rideType !== rideType ||
        existing.pickupLocation !== pickupLocation ||
        (existing.note ?? '') !== note ||
        existing.reservedBy !== reservedBy
      ) {
        throw new Error('ID_CONFLICT: 同じ送迎IDで異なる内容の予約が既に登録されています');
      }
      return { ride: existing, replayed: true };
    }

    const created: RideReservation = {
      id: rideId,
      studentId,
      studentName: student.name,
      rideDate: input.rideDate,
      rideTime: input.rideTime,
      rideType,
      pickupLocation,
      status: 'scheduled',
      calendarEventId: `mock-cal-${rideId}`,
      note,
      reservedBy,
    };
    state.rides.unshift(created);
    this.saveState(state);
    return { ride: created, replayed: false };
  }

  cancelReservation(rideIdInput: string): CancelReservationResult {
    this.assertWritable();
    const state = this.loadState();
    const rideId = validateId(rideIdInput, '送迎ID');
    const ride = state.rides.find((r) => r.id === rideId);
    if (!ride) {
      throw new Error('送迎が見つかりません');
    }
    this.assertStudentAccess(state.role, ride.studentId);
    if (ride.status === 'cancelled') {
      return { cancelled: true, replayed: true };
    }
    if (ride.status !== 'scheduled') {
      throw new Error('完了済みの予約はキャンセルできません');
    }
    ride.status = 'cancelled';
    this.saveState(state);
    return { cancelled: true, replayed: false };
  }

  completeRide(rideIdInput: string, consumeTickets?: number): CompleteRideResult {
    this.assertWritable();
    const state = this.loadState();
    this.assertAdmin(state.role);
    const rideId = validateId(rideIdInput, '送迎ID');
    const ride = state.rides.find((r) => r.id === rideId);
    if (!ride) {
      throw new Error('送迎が見つかりません');
    }
    const student = state.students.find((s) => s.id === ride.studentId);
    if (!student) {
      throw new Error('生徒が見つかりません');
    }
    if (ride.status === 'completed') {
      return {
        success: true,
        replayed: true,
        remainingBalance: student.ticketBalance,
        consumedTickets: 0,
      };
    }
    if (ride.status !== 'scheduled') {
      throw new Error('キャンセル済みの予約は完了処理できません');
    }
    const consume = ride.rideType === 'roundtrip' ? 2 : 1;
    if (consumeTickets !== undefined) {
      if (!Number.isSafeInteger(consumeTickets) || consumeTickets !== consume) {
        throw new Error('消費枚数が送迎区分と一致しません');
      }
    }
    if (student.ticketBalance < consume) {
      throw new Error('チケット残数が不足しています。追加後に完了処理してください');
    }
    student.ticketBalance -= consume;
    ride.status = 'completed';
    ride.completedAt = getJstTimestampString();
    this.saveState(state);
    return {
      success: true,
      replayed: false,
      remainingBalance: student.ticketBalance,
      consumedTickets: consume,
    };
  }

  addTickets(input: AddTicketsInput): AddTicketsResult {
    this.assertWritable();
    const state = this.loadState();
    this.assertAdmin(state.role);
    const studentId = validateId(input.studentId, '生徒ID');
    if (!Number.isSafeInteger(input.ticketCount) || input.ticketCount < 1 || input.ticketCount > 100) {
      throw new Error('枚数は1〜100の整数で指定してください');
    }
    if (!Number.isSafeInteger(input.amount) || input.amount < 0) {
      throw new Error('金額は0以上の整数で指定してください');
    }
    const note = validateText(input.note, '備考', false);
    const student = state.students.find((s) => s.id === studentId);
    if (!student) {
      throw new Error('生徒が見つかりません');
    }
    const purchaseId =
      input.purchaseId !== undefined ? validateId(input.purchaseId, '購入ID') : `PUR-${crypto.randomUUID()}`;
    const existing = state.purchases.find((p) => p.id === purchaseId);
    if (existing) {
      if (
        existing.studentId !== studentId ||
        existing.ticketCount !== input.ticketCount ||
        existing.amount !== input.amount ||
        (existing.note ?? '') !== note
      ) {
        throw new Error('ID_CONFLICT: 同じ購入IDで異なる購入が既に登録されています');
      }
      return { success: true, replayed: true, newBalance: student.ticketBalance };
    }
    if (!Number.isSafeInteger(student.ticketBalance + input.ticketCount)) {
      throw new Error('残高が上限を超えます');
    }
    student.ticketBalance += input.ticketCount;
    state.purchases.unshift({
      id: purchaseId,
      studentId,
      studentName: student.name,
      purchaseDate: getJstDateString(),
      ticketCount: input.ticketCount,
      amount: input.amount,
      note,
    });
    this.saveState(state);
    return { success: true, replayed: false, newBalance: student.ticketBalance };
  }

  getPortalInvitations(portalBaseUrl: string): PortalInvitation[] {
    const state = this.loadState();
    this.assertAdmin(state.role);
    const base = new URL(portalBaseUrl);
    base.search = '';
    base.hash = `/parent/${DEMO_ENTRY_ID}`;
    return [
      {
        userId: 'demo-parent',
        name: '保護者デモ（架空の家庭）',
        publicEntryId: DEMO_ENTRY_ID,
        portalUrl: base.href,
      },
    ];
  }
}
