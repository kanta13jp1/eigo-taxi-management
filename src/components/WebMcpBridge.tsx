import { useEffect, useRef } from 'react';
import type { AppSession } from '../services/api';
import type { PortalRoute } from '../portal';
import type { RideReservation, RideType, Student } from '../types';

export interface WebMcpTextContent {
  type: 'text';
  text: string;
}

export interface WebMcpToolResult {
  content: WebMcpTextContent[];
  isError?: boolean;
}

export interface WebMcpToolDefinition {
  name: string;
  title?: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
  execute: (args: Record<string, unknown>, options?: { signal?: AbortSignal }) => Promise<WebMcpToolResult> | WebMcpToolResult;
}

export interface WebMcpModelContext {
  registerTool: (
    tool: WebMcpToolDefinition,
    options?: { signal?: AbortSignal },
  ) => void | Promise<void>;
  unregisterTool?: (name: string) => void | Promise<void>;
}

function getModelContext(): WebMcpModelContext | undefined {
  if (typeof document !== 'undefined') {
    const docCtx = (document as unknown as { modelContext?: WebMcpModelContext }).modelContext;
    if (docCtx && typeof docCtx.registerTool === 'function') return docCtx;
  }
  if (typeof navigator !== 'undefined') {
    const navCtx = (navigator as unknown as { modelContext?: WebMcpModelContext }).modelContext;
    if (navCtx && typeof navCtx.registerTool === 'function') return navCtx;
  }
  return undefined;
}

function jsonResult(data: unknown, isError = false): WebMcpToolResult {
  return {
    ...(isError ? { isError: true } : {}),
    content: [{ type: 'text', text: JSON.stringify(data) }],
  };
}

export interface WebMcpBridgeProps {
  session: AppSession | null;
  route: PortalRoute;
  students: Student[];
  rides: RideReservation[];
  currentTab: 'teacher' | 'invitations' | 'accounts' | 'settings';
  isAdmin: boolean;
  reviewOnly: boolean;
  isFullAdmin: boolean;
  onEnterDemo: (role: 'admin' | 'parent') => void;
  onCreateRide: (data: {
    studentId: string;
    rideDate: string;
    rideTime: string;
    rideType: RideType;
    pickupLocation: string;
    note?: string;
    reservedBy: 'parent' | 'teacher';
  }) => Promise<void>;
  onCancelRide: (rideId: string) => Promise<void>;
  onCompleteRide: (rideId: string) => Promise<void>;
  onAddTickets: (params: {
    studentId: string;
    ticketCount: number;
    amount: number;
    note?: string;
  }) => Promise<void>;
  onAddStudent: (studentData: Omit<Student, 'id' | 'createdAt'>) => Promise<void>;
  onSwitchTab: (tab: 'teacher' | 'invitations' | 'accounts' | 'settings') => void;
  onRefreshData: () => Promise<unknown>;
}

/**
 * Non-visual W3C WebMCP (`document.modelContext ?? navigator.modelContext`) bridge.
 * Registers only tools permitted by the active portal session and cleans up on change.
 */
export function WebMcpBridge(props: WebMcpBridgeProps) {
  const latestRef = useRef(props);

  useEffect(() => {
    latestRef.current = props;
  });

  const sessionMode = props.session?.mode ?? null;
  const sessionUserId = props.session?.user.id ?? null;
  const sessionRole = props.session?.user.role ?? null;
  const sessionReviewOnly = props.session?.user.reviewOnly === true;
  const routeKind = props.route.kind;

  useEffect(() => {
    const modelContext = getModelContext();
    if (!modelContext) return;

    const controller = new AbortController();
    const registeredNames: string[] = [];

    const register = (tool: WebMcpToolDefinition) => {
      registeredNames.push(tool.name);
      try {
        const res = modelContext.registerTool(tool, { signal: controller.signal });
        if (res && typeof (res as Promise<void>).catch === 'function') {
          void (res as Promise<void>).catch(() => {});
        }
      } catch {
        // Ignore host registration errors so regular web UX is never disrupted.
      }
    };

    // Status tool is always registered; unauthenticated state never exposes student/ride PII.
    register({
      name: 'eigo_taxi_get_status',
      title: 'Eigo Taxi Link 状態確認',
      description: '現在のログイン状態・ポータル種別・権限範囲（未ログイン時は個人情報を含まない公開状態のみ）を返します。',
      inputSchema: { type: 'object', properties: {} },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      execute: () => {
        const cur = latestRef.current;
        if (!cur.session) {
          return jsonResult({
            loggedIn: false,
            portalRoute: cur.route.kind,
            releasePolicy: 'HOLD',
          });
        }
        return jsonResult({
          loggedIn: true,
          mode: cur.session.mode,
          role: cur.session.user.role,
          reviewOnly: cur.reviewOnly,
          isFullAdmin: cur.isFullAdmin,
          currentTab: cur.isAdmin ? cur.currentTab : 'parent',
          studentCount: cur.students.length,
          rideCount: cur.rides.length,
          releasePolicy: 'HOLD',
        });
      },
    });

    if (!sessionMode || !sessionUserId || !sessionRole) {
      register({
        name: 'eigo_taxi_enter_demo',
        title: 'デモモード開始',
        description: 'ローカルデモ環境（架空データ、Google送信なし）で管理者または保護者画面を開きます。',
        inputSchema: {
          type: 'object',
          properties: {
            role: { type: 'string', enum: ['admin', 'parent'], description: '開始するデモロール' },
          },
          required: ['role'],
        },
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
        execute: (args) => {
          const role = args.role;
          if (role !== 'admin' && role !== 'parent') {
            return jsonResult({ error: 'role は admin または parent を指定してください' }, true);
          }
          latestRef.current.onEnterDemo(role);
          return jsonResult({ started: true, mode: 'demo', role });
        },
      });
    } else {
      register({
        name: 'eigo_taxi_list_students',
        title: '表示中生徒一覧',
        description: '現在のログイン権限で表示可能な生徒一覧と残チケット数を取得します。',
        inputSchema: {
          type: 'object',
          properties: {
            lowTicketOnly: { type: 'boolean', description: 'true の場合、残チケット1回以下の生徒のみ抽出' },
          },
        },
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
        execute: (args) => {
          const lowOnly = args.lowTicketOnly === true;
          const items = lowOnly
            ? latestRef.current.students.filter((s) => s.ticketBalance <= 1)
            : latestRef.current.students;
          return jsonResult({ count: items.length, students: items });
        },
      });

      register({
        name: 'eigo_taxi_list_rides',
        title: '表示中送迎予定一覧',
        description: '現在のログイン権限で表示可能な送迎予約一覧を取得します。',
        inputSchema: {
          type: 'object',
          properties: {
            date: { type: 'string', description: 'YYYY-MM-DD 形式で日付絞り込み' },
            studentId: { type: 'string', description: '生徒IDで絞り込み' },
            status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled'] },
          },
        },
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
        execute: (args) => {
          let items = latestRef.current.rides;
          if (typeof args.date === 'string' && args.date) {
            items = items.filter((r) => r.rideDate === args.date);
          }
          if (typeof args.studentId === 'string' && args.studentId) {
            items = items.filter((r) => r.studentId === args.studentId);
          }
          if (args.status === 'scheduled' || args.status === 'completed' || args.status === 'cancelled') {
            items = items.filter((r) => r.status === args.status);
          }
          return jsonResult({ count: items.length, rides: items });
        },
      });

      register({
        name: 'eigo_taxi_create_reservation',
        title: '送迎予約登録',
        description: '表示中の画面状態を通じて新しい送迎予約を登録します。',
        inputSchema: {
          type: 'object',
          properties: {
            studentId: { type: 'string' },
            rideDate: { type: 'string', description: 'YYYY-MM-DD' },
            rideTime: { type: 'string', description: 'HH:mm' },
            rideType: { type: 'string', enum: ['pickup', 'dropoff', 'roundtrip'] },
            pickupLocation: { type: 'string' },
            note: { type: 'string' },
          },
          required: ['studentId', 'rideDate', 'rideTime', 'rideType', 'pickupLocation'],
        },
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
        execute: async (args) => {
          const cur = latestRef.current;
          const rideType = args.rideType;
          if (
            typeof args.studentId !== 'string' ||
            typeof args.rideDate !== 'string' ||
            typeof args.rideTime !== 'string' ||
            (rideType !== 'pickup' && rideType !== 'dropoff' && rideType !== 'roundtrip') ||
            typeof args.pickupLocation !== 'string'
          ) {
            return jsonResult({ error: '予約の必須パラメータが不足または不正です' }, true);
          }
          try {
            await cur.onCreateRide({
              studentId: args.studentId,
              rideDate: args.rideDate,
              rideTime: args.rideTime,
              rideType,
              pickupLocation: args.pickupLocation,
              note: typeof args.note === 'string' ? args.note : undefined,
              reservedBy: cur.isAdmin ? 'teacher' : 'parent',
            });
            return jsonResult({ created: true, studentId: args.studentId, rideDate: args.rideDate, rideTime: args.rideTime });
          } catch (error) {
            return jsonResult({ error: error instanceof Error ? error.message : String(error) }, true);
          }
        },
      });

      register({
        name: 'eigo_taxi_cancel_reservation',
        title: '送迎予約キャンセル',
        description: '指定した予約IDの送迎予定をキャンセルします。',
        inputSchema: {
          type: 'object',
          properties: { rideId: { type: 'string' } },
          required: ['rideId'],
        },
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
        execute: async (args) => {
          if (typeof args.rideId !== 'string' || !args.rideId) {
            return jsonResult({ error: 'rideId を指定してください' }, true);
          }
          try {
            await latestRef.current.onCancelRide(args.rideId);
            return jsonResult({ cancelled: true, rideId: args.rideId });
          } catch (error) {
            return jsonResult({ error: error instanceof Error ? error.message : String(error) }, true);
          }
        },
      });

      register({
        name: 'eigo_taxi_refresh_data',
        title: '台帳再取得',
        description: '生徒・送迎予約一覧を最新データで再読み込みします。',
        inputSchema: { type: 'object', properties: {} },
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
        execute: async () => {
          try {
            await latestRef.current.onRefreshData();
            return jsonResult({ refreshed: true });
          } catch (error) {
            return jsonResult({ error: error instanceof Error ? error.message : String(error) }, true);
          }
        },
      });

      if (sessionRole === 'admin') {
        register({
          name: 'eigo_taxi_complete_ride',
          title: '送迎完了・チケット消化',
          description: '管理者権限で送迎を完了し、片道1回または往復2回のチケットを消化します。',
          inputSchema: {
            type: 'object',
            properties: { rideId: { type: 'string' } },
            required: ['rideId'],
          },
          annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
          execute: async (args) => {
            if (typeof args.rideId !== 'string' || !args.rideId) {
              return jsonResult({ error: 'rideId を指定してください' }, true);
            }
            try {
              await latestRef.current.onCompleteRide(args.rideId);
              return jsonResult({ completed: true, rideId: args.rideId });
            } catch (error) {
              return jsonResult({ error: error instanceof Error ? error.message : String(error) }, true);
            }
          },
        });

        register({
          name: 'eigo_taxi_add_tickets',
          title: 'チケット追加',
          description: '管理者権限で生徒へチケット枚数を追加します。',
          inputSchema: {
            type: 'object',
            properties: {
              studentId: { type: 'string' },
              ticketCount: { type: 'number', minimum: 1, maximum: 100 },
              amount: { type: 'number', minimum: 0 },
              note: { type: 'string' },
            },
            required: ['studentId', 'ticketCount', 'amount'],
          },
          annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
          execute: async (args) => {
            if (
              typeof args.studentId !== 'string' ||
              typeof args.ticketCount !== 'number' ||
              typeof args.amount !== 'number'
            ) {
              return jsonResult({ error: 'studentId, ticketCount, amount を正しく指定してください' }, true);
            }
            try {
              await latestRef.current.onAddTickets({
                studentId: args.studentId,
                ticketCount: args.ticketCount,
                amount: args.amount,
                note: typeof args.note === 'string' ? args.note : undefined,
              });
              return jsonResult({ added: true, studentId: args.studentId, ticketCount: args.ticketCount });
            } catch (error) {
              return jsonResult({ error: error instanceof Error ? error.message : String(error) }, true);
            }
          },
        });
      }

      if (sessionRole === 'admin' && !sessionReviewOnly) {
        register({
          name: 'eigo_taxi_create_student',
          title: '新規生徒登録',
          description: '通常の管理者権限で新規生徒を登録します。',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              parentName: { type: 'string' },
              phone: { type: 'string' },
              address: { type: 'string' },
              pickupNote: { type: 'string' },
              ticketBalance: { type: 'number', minimum: 0 },
            },
            required: ['name', 'address'],
          },
          annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
          execute: async (args) => {
            if (typeof args.name !== 'string' || typeof args.address !== 'string') {
              return jsonResult({ error: 'name と address を指定してください' }, true);
            }
            try {
              await latestRef.current.onAddStudent({
                name: args.name,
                parentName: typeof args.parentName === 'string' ? args.parentName : '',
                phone: typeof args.phone === 'string' ? args.phone : '',
                address: args.address,
                pickupNote: typeof args.pickupNote === 'string' ? args.pickupNote : '',
                ticketBalance: typeof args.ticketBalance === 'number' ? args.ticketBalance : 0,
              });
              return jsonResult({ created: true, name: args.name });
            } catch (error) {
              return jsonResult({ error: error instanceof Error ? error.message : String(error) }, true);
            }
          },
        });

        register({
          name: 'eigo_taxi_switch_tab',
          title: '管理タブ切替',
          description: '管理者画面の表示タブを切り替えます。',
          inputSchema: {
            type: 'object',
            properties: {
              tab: { type: 'string', enum: ['teacher', 'invitations', 'accounts', 'settings'] },
            },
            required: ['tab'],
          },
          annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
          execute: (args) => {
            const tab = args.tab;
            if (tab !== 'teacher' && tab !== 'invitations' && tab !== 'accounts' && tab !== 'settings') {
              return jsonResult({ error: '無効なタブ名です' }, true);
            }
            latestRef.current.onSwitchTab(tab);
            return jsonResult({ tab });
          },
        });
      }
    }

    return () => {
      controller.abort();
      if (typeof modelContext.unregisterTool === 'function') {
        for (const name of registeredNames) {
          try {
            const res = modelContext.unregisterTool(name);
            if (res && typeof (res as Promise<void>).catch === 'function') {
              void (res as Promise<void>).catch(() => {});
            }
          } catch {
            // Ignore cleanup errors on unmount.
          }
        }
      }
    };
  }, [sessionMode, sessionUserId, sessionRole, sessionReviewOnly, routeKind]);

  return null;
}
