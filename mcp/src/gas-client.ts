import crypto from 'node:crypto';
import type {
  AddTicketsInput,
  AddTicketsResult,
  AppUser,
  CancelReservationResult,
  CompleteRideResult,
  CreateReservationInput,
  CreateStudentInput,
  GasHealthResult,
  ManagedUsers,
  PortalInvitation,
  PortalRole,
  RideReservation,
  Student,
} from './types.js';

export const DEFAULT_GAS_API_URL =
  'https://script.google.com/macros/s/AKfycbznxkg_f_7ddHdopFZfN0OlFDsxoFoi67OslKNQ93ipkWZLq-tj1jAsxz_uxNo2jBtwFg/exec';

const ENTRY_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const DEMO_ENTRY_ID = '00000000-0000-4000-8000-000000000001';

export type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export function validateGasApiUrl(rawUrl: string, allowLocalTestUrl = false): string {
  let endpoint: URL;
  try {
    endpoint = new URL(rawUrl);
  } catch {
    throw new Error('GAS API URL の形式が不正です');
  }
  const isLocalTest =
    allowLocalTestUrl &&
    (endpoint.protocol === 'http:' || endpoint.protocol === 'https:') &&
    (endpoint.hostname === '127.0.0.1' || endpoint.hostname === 'localhost') &&
    !endpoint.username &&
    !endpoint.password &&
    !endpoint.search &&
    !endpoint.hash;
  if (isLocalTest) {
    return endpoint.href;
  }
  if (
    endpoint.protocol !== 'https:' ||
    endpoint.hostname !== 'script.google.com' ||
    endpoint.port ||
    endpoint.username ||
    endpoint.password ||
    endpoint.search ||
    endpoint.hash ||
    !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint.pathname)
  ) {
    throw new Error('GAS API URL は https://script.google.com/macros/s/.../exec 形式のみ許可されています');
  }
  return endpoint.href;
}

export interface LiveGasClientOptions {
  gasApiUrl?: string;
  idToken?: string;
  portalRole?: PortalRole;
  entryId?: string;
  readonly?: boolean;
  allowLocalTestUrl?: boolean;
  fetchFn?: FetchLike;
}

export class LiveGasClient {
  readonly gasApiUrl: string;
  readonly portalRole: PortalRole;
  readonly entryId?: string;
  readonly readonly: boolean;
  private readonly idToken?: string;
  private readonly fetchFn: FetchLike;

  constructor(options: LiveGasClientOptions = {}) {
    this.gasApiUrl = validateGasApiUrl(options.gasApiUrl ?? DEFAULT_GAS_API_URL, options.allowLocalTestUrl === true);
    this.portalRole = options.portalRole ?? 'admin';
    if (options.entryId !== undefined) {
      if (!ENTRY_ID_REGEX.test(options.entryId) || options.entryId === DEMO_ENTRY_ID) {
        throw new Error('EIGO_TAXI_ENTRY_ID の形式が不正です');
      }
      this.entryId = options.entryId;
    }
    this.readonly = options.readonly ?? false;
    this.idToken = options.idToken?.trim() || undefined;
    this.fetchFn = options.fetchFn ?? fetch;
  }

  hasAuth(): boolean {
    return Boolean(this.idToken);
  }

  async healthCheck(): Promise<GasHealthResult> {
    const checkedAt = new Date().toISOString();
    try {
      const res = await this.fetchFn(this.gasApiUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(15000),
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      });
      if (!res.ok) {
        return {
          checkedAt,
          reachable: false,
          message: `HTTP ${res.status}`,
        };
      }
      const json = (await res.json()) as { success?: boolean; message?: string };
      return {
        checkedAt,
        reachable: json?.success === true,
        message: typeof json?.message === 'string' ? json.message : 'Unexpected GAS response',
      };
    } catch (error) {
      return {
        checkedAt,
        reachable: false,
        message: error instanceof Error ? error.message : 'GAS health check failed',
      };
    }
  }

  private async callAction(
    action: string,
    params: Record<string, unknown> = {},
    isMutation = false,
  ): Promise<Record<string, unknown>> {
    if (isMutation && this.readonly) {
      throw new Error('読み取り専用モード (EIGO_TAXI_MCP_READONLY=true) のため GAS への変更操作は拒否されました');
    }
    if (!this.idToken) {
      throw new Error(
        'live-gas モードでデータを取得・操作するには環境変数 EIGO_TAXI_GAS_ID_TOKEN（有効な Firebase Google ID トークン）が必要です',
      );
    }

    const payload = {
      ...params,
      action,
      idToken: this.idToken,
      portalRole: this.portalRole,
      ...(this.entryId ? { entryId: this.entryId } : {}),
    };

    const res = await this.fetchFn(this.gasApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    });
    if (!res.ok) {
      throw new Error(`GAS 通信エラー: HTTP ${res.status}`);
    }
    const json = (await res.json()) as Record<string, unknown>;
    if (json?.success !== true) {
      const code = typeof json?.code === 'string' ? json.code : 'GAS_ERROR';
      const msg = typeof json?.error === 'string' ? json.error : 'GAS 処理に失敗しました';
      throw new Error(`[${code}] ${msg}`);
    }
    return json;
  }

  async login(): Promise<AppUser> {
    const res = await this.callAction('login', {}, false);
    const user = res.data as Partial<AppUser> | null | undefined;
    if (
      !user ||
      typeof user.id !== 'string' ||
      typeof user.name !== 'string' ||
      (user.role !== 'admin' && user.role !== 'parent') ||
      !Array.isArray(user.studentIds)
    ) {
      throw new Error('GAS 認証応答の形式が不正です');
    }
    return user as AppUser;
  }

  async getStudents(): Promise<Student[]> {
    const res = await this.callAction('getStudents', {}, false);
    if (!Array.isArray(res.data)) {
      throw new Error('生徒台帳の応答形式を確認できませんでした');
    }
    return res.data as Student[];
  }

  async getRides(): Promise<RideReservation[]> {
    const res = await this.callAction('getRides', {}, false);
    if (!Array.isArray(res.data)) {
      throw new Error('送迎一覧の応答形式を確認できませんでした');
    }
    return (res.data as RideReservation[]).sort((a, b) =>
      `${b.rideDate} ${b.rideTime}`.localeCompare(`${a.rideDate} ${a.rideTime}`),
    );
  }

  async createStudent(input: CreateStudentInput): Promise<{ student: Student; replayed: boolean }> {
    const id = input.id ?? `STU-${crypto.randomUUID()}`;
    const res = await this.callAction(
      'createStudent',
      {
        id,
        name: input.name,
        parentName: input.parentName ?? '',
        phone: input.phone ?? '',
        address: input.address,
        pickupNote: input.pickupNote ?? '',
        ticketBalance: input.ticketBalance ?? 0,
      },
      true,
    );
    return {
      student: res.data as Student,
      replayed: res.replayed === true,
    };
  }

  async createReservation(input: CreateReservationInput): Promise<{ ride: RideReservation; replayed: boolean }> {
    const rideId = input.rideId ?? `RIDE-${crypto.randomUUID()}`;
    const res = await this.callAction(
      'createReservation',
      {
        rideId,
        studentId: input.studentId,
        rideDate: input.rideDate,
        rideTime: input.rideTime,
        rideType: input.rideType,
        pickupLocation: input.pickupLocation,
        note: input.note ?? '',
      },
      true,
    );
    return {
      ride: res.data as RideReservation,
      replayed: res.replayed === true,
    };
  }

  async cancelReservation(rideId: string): Promise<CancelReservationResult> {
    const res = await this.callAction('cancelReservation', { rideId }, true);
    return {
      cancelled: true,
      replayed: res.replayed === true,
    };
  }

  async completeRide(rideId: string, consumeTickets?: number): Promise<CompleteRideResult> {
    const res = await this.callAction(
      'completeRide',
      {
        rideId,
        ...(consumeTickets !== undefined ? { consumeTickets } : {}),
      },
      true,
    );
    return {
      success: true,
      replayed: res.replayed === true,
      remainingBalance: typeof res.remainingBalance === 'number' ? res.remainingBalance : undefined,
      consumedTickets: typeof res.consumedTickets === 'number' ? res.consumedTickets : undefined,
    };
  }

  async addTickets(input: AddTicketsInput): Promise<AddTicketsResult> {
    const purchaseId = input.purchaseId ?? `PUR-${crypto.randomUUID()}`;
    const res = await this.callAction(
      'addTickets',
      {
        purchaseId,
        studentId: input.studentId,
        ticketCount: input.ticketCount,
        amount: input.amount,
        note: input.note ?? '',
      },
      true,
    );
    return {
      success: true,
      replayed: res.replayed === true,
      newBalance: Number(res.newBalance ?? 0),
    };
  }

  async getPortalInvitations(portalBaseUrl: string): Promise<PortalInvitation[]> {
    const res = await this.callAction('getPortalInvitations', {}, false);
    const items = res.data as PortalInvitation[];
    if (
      !Array.isArray(items) ||
      items.some(
        (item) =>
          !item ||
          typeof item.userId !== 'string' ||
          typeof item.name !== 'string' ||
          typeof item.publicEntryId !== 'string' ||
          !ENTRY_ID_REGEX.test(item.publicEntryId),
      )
    ) {
      throw new Error('招待一覧の応答形式を確認できませんでした');
    }
    return items.map((item) => {
      const url = new URL(portalBaseUrl);
      url.search = '';
      url.hash = `/parent/${item.publicEntryId}`;
      return { ...item, portalUrl: url.href };
    });
  }

  async getManagedUsers(): Promise<ManagedUsers> {
    const res = await this.callAction('getManagedUsers', {}, false);
    const data = res.data as Partial<ManagedUsers> | null | undefined;
    if (!data || !Array.isArray(data.users) || typeof data.revision !== 'string') {
      throw new Error('アカウント一覧の応答形式を確認できませんでした');
    }
    return data as ManagedUsers;
  }
}
