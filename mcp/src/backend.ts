import { DEFAULT_GAS_API_URL, LiveGasClient } from './gas-client.js';
import { DemoFileStore, getJstDateString, resolveDefaultStateFile } from './store.js';
import type {
  AddTicketsInput,
  AddTicketsResult,
  CancelReservationResult,
  CompleteRideResult,
  CreateReservationInput,
  CreateStudentInput,
  DashboardSnapshot,
  ManagedUsers,
  McpMode,
  PortalInvitation,
  PortalRole,
  RideReservation,
  ServiceStatus,
  Student,
} from './types.js';

export const DEFAULT_PORTAL_BASE_URL = 'https://eigo-taxi-test.web.app/';

export function validatePortalBaseUrl(rawUrl: string): string {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('EIGO_TAXI_PORTAL_BASE_URL の URL 形式が不正です');
  }
  const isLocalHttp =
    parsed.protocol === 'http:' &&
    (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost');
  if (parsed.protocol !== 'https:' && !isLocalHttp) {
    throw new Error('EIGO_TAXI_PORTAL_BASE_URL は https:// (またはローカル http://127.0.0.1 / localhost) のみ許可されています');
  }
  if (parsed.username || parsed.password) {
    throw new Error('EIGO_TAXI_PORTAL_BASE_URL に認証情報を含めることはできません');
  }
  return parsed.href;
}

export interface EigoTaxiBackend {
  readonly mode: McpMode;
  getStatus(options?: { checkGasHealth?: boolean }): Promise<ServiceStatus>;
  getDashboardSnapshot(options?: {
    date?: string;
    studentId?: string;
    tab?: 'today' | 'all' | 'students' | 'book';
  }): Promise<DashboardSnapshot>;
  listStudents(options?: { query?: string; lowTicketOnly?: boolean }): Promise<Student[]>;
  getStudent(studentId: string): Promise<Student>;
  createStudent(input: CreateStudentInput): Promise<{ student: Student; replayed: boolean }>;
  listRides(options?: {
    date?: string;
    todayOnly?: boolean;
    studentId?: string;
    status?: RideReservation['status'];
  }): Promise<RideReservation[]>;
  createReservation(input: CreateReservationInput): Promise<{ ride: RideReservation; replayed: boolean }>;
  cancelReservation(rideId: string): Promise<CancelReservationResult>;
  completeRide(rideId: string, consumeTickets?: number): Promise<CompleteRideResult>;
  addTickets(input: AddTicketsInput): Promise<AddTicketsResult>;
  listPortalInvitations(): Promise<PortalInvitation[]>;
  listManagedUsers(): Promise<ManagedUsers>;
  switchDemoRole(role: PortalRole): Promise<PortalRole>;
  resetDemoData(): Promise<DashboardSnapshot>;
}

function buildReleasePolicy(): ServiceStatus['releasePolicy'] {
  return {
    release: 'HOLD',
    customerAcceptance: 'NOT_RUN (0/6)',
    thirdPartyPassed: 0,
  };
}

function summarize(students: Student[], rides: RideReservation[], today: string) {
  const todayRides = rides.filter((r) => r.rideDate === today);
  return {
    todayRides,
    summary: {
      totalStudents: students.length,
      lowTicketStudents: students.filter((s) => s.ticketBalance <= 1).length,
      zeroTicketStudents: students.filter((s) => s.ticketBalance === 0).length,
      todayRidesTotal: todayRides.length,
      todayScheduledCount: todayRides.filter((r) => r.status === 'scheduled').length,
      allScheduledCount: rides.filter((r) => r.status === 'scheduled').length,
    },
  };
}

export class DemoBackend implements EigoTaxiBackend {
  readonly mode: McpMode = 'demo';
  private readonly store: DemoFileStore;
  private readonly gasApiUrl: string;
  private readonly portalBaseUrl: string;
  private readonly healthProbe: LiveGasClient;

  constructor(options: {
    store?: DemoFileStore;
    gasApiUrl?: string;
    portalBaseUrl?: string;
    healthProbe?: LiveGasClient;
  } = {}) {
    this.store = options.store ?? new DemoFileStore();
    this.gasApiUrl = options.gasApiUrl ?? DEFAULT_GAS_API_URL;
    this.portalBaseUrl = options.portalBaseUrl ?? DEFAULT_PORTAL_BASE_URL;
    this.healthProbe = options.healthProbe ?? new LiveGasClient({ gasApiUrl: this.gasApiUrl, readonly: true });
  }

  async getStatus(options: { checkGasHealth?: boolean } = {}): Promise<ServiceStatus> {
    const role = this.store.getRole();
    const gasHealth = options.checkGasHealth ? await this.healthProbe.healthCheck() : undefined;
    return {
      mode: 'demo',
      role,
      reviewOnly: false,
      readonly: this.store.readonly,
      gasApiUrl: this.gasApiUrl,
      portalBaseUrl: this.portalBaseUrl,
      authConfigured: true,
      entryIdConfigured: role === 'parent',
      stateFile: this.store.stateFilePath,
      ...(gasHealth ? { gasHealth } : {}),
      releasePolicy: buildReleasePolicy(),
    };
  }

  async getDashboardSnapshot(
    options: { date?: string; studentId?: string; tab?: 'today' | 'all' | 'students' | 'book' } = {},
  ): Promise<DashboardSnapshot> {
    const status = await this.getStatus();
    const today = getJstDateString();
    const students = this.store.getStudents();
    const rides = this.store.getRides();
    const purchases = this.store.getPurchases();
    const { todayRides, summary } = summarize(students, rides, today);
    const invitations = status.role === 'admin' ? this.store.getPortalInvitations(this.portalBaseUrl) : undefined;
    return {
      status,
      today,
      summary,
      students,
      todayRides,
      rides,
      purchases,
      ...(invitations ? { invitations } : {}),
      ...(options.date ? { selectedDate: options.date } : {}),
      ...(options.studentId ? { selectedStudentId: options.studentId } : {}),
      ...(options.tab ? { activeTab: options.tab } : {}),
    };
  }

  async listStudents(options: { query?: string; lowTicketOnly?: boolean } = {}): Promise<Student[]> {
    let students = this.store.getStudents();
    if (options.lowTicketOnly) {
      students = students.filter((s) => s.ticketBalance <= 1);
    }
    const q = options.query?.trim().toLowerCase();
    if (q) {
      students = students.filter((s) =>
        [s.id, s.name, s.parentName, s.address].some((field) => field.toLowerCase().includes(q)),
      );
    }
    return students;
  }

  async getStudent(studentId: string): Promise<Student> {
    return this.store.getStudentById(studentId);
  }

  async createStudent(input: CreateStudentInput) {
    return this.store.createStudent(input);
  }

  async listRides(
    options: { date?: string; todayOnly?: boolean; studentId?: string; status?: RideReservation['status'] } = {},
  ): Promise<RideReservation[]> {
    let rides = this.store.getRides();
    const targetDate = options.todayOnly ? getJstDateString() : options.date;
    if (targetDate) {
      rides = rides.filter((r) => r.rideDate === targetDate);
    }
    if (options.studentId) {
      rides = rides.filter((r) => r.studentId === options.studentId);
    }
    if (options.status) {
      rides = rides.filter((r) => r.status === options.status);
    }
    return rides;
  }

  async createReservation(input: CreateReservationInput) {
    return this.store.createReservation(input);
  }

  async cancelReservation(rideId: string) {
    return this.store.cancelReservation(rideId);
  }

  async completeRide(rideId: string, consumeTickets?: number) {
    return this.store.completeRide(rideId, consumeTickets);
  }

  async addTickets(input: AddTicketsInput) {
    return this.store.addTickets(input);
  }

  async listPortalInvitations() {
    return this.store.getPortalInvitations(this.portalBaseUrl);
  }

  async listManagedUsers(): Promise<ManagedUsers> {
    throw new Error('アカウント管理 (list_managed_users) は live-gas モードのフル管理者のみ利用できます');
  }

  async switchDemoRole(role: PortalRole): Promise<PortalRole> {
    return this.store.switchRole(role);
  }

  async resetDemoData(): Promise<DashboardSnapshot> {
    this.store.reset();
    return this.getDashboardSnapshot();
  }
}

export class LiveGasBackend implements EigoTaxiBackend {
  readonly mode: McpMode = 'live-gas';
  private readonly client: LiveGasClient;
  private readonly portalBaseUrl: string;

  constructor(options: { client: LiveGasClient; portalBaseUrl?: string }) {
    this.client = options.client;
    this.portalBaseUrl = options.portalBaseUrl ?? DEFAULT_PORTAL_BASE_URL;
  }

  async getStatus(options: { checkGasHealth?: boolean } = {}): Promise<ServiceStatus> {
    let role: PortalRole = this.client.portalRole;
    let reviewOnly = false;
    let authVerified = false;
    let authError: string | undefined;
    if (this.client.hasAuth()) {
      try {
        const user = await this.client.login();
        role = user.role;
        reviewOnly = user.reviewOnly === true;
        authVerified = true;
      } catch (error) {
        authVerified = false;
        authError = error instanceof Error ? error.message : String(error);
      }
    }
    const gasHealth = options.checkGasHealth ? await this.client.healthCheck() : undefined;
    return {
      mode: 'live-gas',
      role,
      reviewOnly,
      readonly: this.client.readonly,
      gasApiUrl: this.client.gasApiUrl,
      portalBaseUrl: this.portalBaseUrl,
      authConfigured: this.client.hasAuth(),
      authVerified,
      ...(authError ? { authError } : {}),
      entryIdConfigured: Boolean(this.client.entryId),
      ...(gasHealth ? { gasHealth } : {}),
      releasePolicy: buildReleasePolicy(),
    };
  }

  async getDashboardSnapshot(
    options: { date?: string; studentId?: string; tab?: 'today' | 'all' | 'students' | 'book' } = {},
  ): Promise<DashboardSnapshot> {
    const user = await this.client.login();
    const [students, rides] = await Promise.all([this.client.getStudents(), this.client.getRides()]);
    const today = getJstDateString();
    const { todayRides, summary } = summarize(students, rides, today);
    let invitations: PortalInvitation[] | undefined;
    if (user.role === 'admin' && !user.reviewOnly) {
      invitations = await this.client.getPortalInvitations(this.portalBaseUrl);
    }
    return {
      status: {
        mode: 'live-gas',
        role: user.role,
        reviewOnly: user.reviewOnly === true,
        readonly: this.client.readonly,
        gasApiUrl: this.client.gasApiUrl,
        portalBaseUrl: this.portalBaseUrl,
        authConfigured: this.client.hasAuth(),
        entryIdConfigured: Boolean(this.client.entryId),
        releasePolicy: buildReleasePolicy(),
      },
      today,
      summary,
      students,
      todayRides,
      rides,
      purchases: [],
      ...(invitations ? { invitations } : {}),
      ...(options.date ? { selectedDate: options.date } : {}),
      ...(options.studentId ? { selectedStudentId: options.studentId } : {}),
      ...(options.tab ? { activeTab: options.tab } : {}),
    };
  }

  async listStudents(options: { query?: string; lowTicketOnly?: boolean } = {}): Promise<Student[]> {
    let students = await this.client.getStudents();
    if (options.lowTicketOnly) {
      students = students.filter((s) => s.ticketBalance <= 1);
    }
    const q = options.query?.trim().toLowerCase();
    if (q) {
      students = students.filter((s) =>
        [s.id, s.name, s.parentName, s.address].some((field) => field.toLowerCase().includes(q)),
      );
    }
    return students;
  }

  async getStudent(studentId: string): Promise<Student> {
    const students = await this.client.getStudents();
    const found = students.find((s) => s.id === studentId);
    if (!found) {
      throw new Error(`生徒が見つかりません: ${studentId}`);
    }
    return found;
  }

  async createStudent(input: CreateStudentInput) {
    return this.client.createStudent(input);
  }

  async listRides(
    options: { date?: string; todayOnly?: boolean; studentId?: string; status?: RideReservation['status'] } = {},
  ): Promise<RideReservation[]> {
    let rides = await this.client.getRides();
    const targetDate = options.todayOnly ? getJstDateString() : options.date;
    if (targetDate) {
      rides = rides.filter((r) => r.rideDate === targetDate);
    }
    if (options.studentId) {
      rides = rides.filter((r) => r.studentId === options.studentId);
    }
    if (options.status) {
      rides = rides.filter((r) => r.status === options.status);
    }
    return rides;
  }

  async createReservation(input: CreateReservationInput) {
    return this.client.createReservation(input);
  }

  async cancelReservation(rideId: string) {
    return this.client.cancelReservation(rideId);
  }

  async completeRide(rideId: string, consumeTickets?: number) {
    return this.client.completeRide(rideId, consumeTickets);
  }

  async addTickets(input: AddTicketsInput) {
    return this.client.addTickets(input);
  }

  async listPortalInvitations() {
    return this.client.getPortalInvitations(this.portalBaseUrl);
  }

  async listManagedUsers() {
    return this.client.getManagedUsers();
  }

  async switchDemoRole(): Promise<PortalRole> {
    throw new Error('switch_demo_role は demo モード専用です。live-gas モードでは EIGO_TAXI_PORTAL_ROLE を使用してください');
  }

  async resetDemoData(): Promise<DashboardSnapshot> {
    throw new Error('reset_demo_data は demo モード専用です。live-gas の実台帳は MCP から一括リセットできません');
  }
}

export function createBackendFromEnv(
  env: NodeJS.ProcessEnv = process.env,
  overrides: { mode?: McpMode; dataDir?: string } = {},
): EigoTaxiBackend {
  const modeRaw = (overrides.mode ?? env.EIGO_TAXI_MCP_MODE ?? 'demo').trim();
  if (modeRaw !== 'demo' && modeRaw !== 'live-gas') {
    throw new Error(`未対応のモードです: ${modeRaw}（demo または live-gas を指定してください）`);
  }
  const readonly = env.EIGO_TAXI_MCP_READONLY === 'true';
  const explicitRoleRaw = env.EIGO_TAXI_PORTAL_ROLE?.trim();
  const roleRaw = explicitRoleRaw || 'admin';
  if (roleRaw !== 'admin' && roleRaw !== 'parent') {
    throw new Error(`未対応のロールです: ${roleRaw}（admin または parent を指定してください）`);
  }
  const gasApiUrl = env.EIGO_TAXI_GAS_URL?.trim() || DEFAULT_GAS_API_URL;
  const portalBaseUrl = validatePortalBaseUrl(env.EIGO_TAXI_PORTAL_BASE_URL?.trim() || DEFAULT_PORTAL_BASE_URL);

  if (modeRaw === 'live-gas') {
    const client = new LiveGasClient({
      gasApiUrl,
      idToken: env.EIGO_TAXI_GAS_ID_TOKEN,
      portalRole: roleRaw,
      entryId: env.EIGO_TAXI_ENTRY_ID?.trim() || undefined,
      readonly,
    });
    return new LiveGasBackend({ client, portalBaseUrl });
  }

  const effectiveEnv = overrides.dataDir ? { ...env, EIGO_TAXI_MCP_DATA_DIR: overrides.dataDir } : env;
  const store = new DemoFileStore({
    stateFilePath: resolveDefaultStateFile(effectiveEnv),
    readonly,
    defaultRole: roleRaw,
    forcedRole: explicitRoleRaw ? roleRaw : undefined,
  });
  return new DemoBackend({ store, gasApiUrl, portalBaseUrl });
}
