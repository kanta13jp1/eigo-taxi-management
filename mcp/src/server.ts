import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from '@modelcontextprotocol/ext-apps/server';
import { z } from 'zod';
import type { EigoTaxiBackend } from './backend.js';
import { getJstDateString } from './store.js';

export const DASHBOARD_URI = 'ui://eigo-taxi/dashboard.html';
const APP_AND_MODEL = ['model', 'app'] as const;

function errorResult(error: unknown): CallToolResult {
  const message = error instanceof Error ? error.message : String(error);
  return {
    isError: true,
    content: [{ type: 'text', text: `エラー: ${message}` }],
  };
}

function okResult(text: string, structuredContent: Record<string, unknown>): CallToolResult {
  return {
    content: [{ type: 'text', text }],
    structuredContent,
  };
}

function rideTypeLabel(rideType: string): string {
  if (rideType === 'pickup') return 'お迎え';
  if (rideType === 'dropoff') return '送り';
  if (rideType === 'roundtrip') return '往復';
  return rideType;
}

function statusLabel(status: string): string {
  if (status === 'scheduled') return '予定';
  if (status === 'completed') return '完了';
  if (status === 'cancelled') return '取消';
  return status;
}

export interface CreateServerOptions {
  backend: EigoTaxiBackend;
  getDashboardHtml: () => string;
}

export function createEigoTaxiMcpServer(options: CreateServerOptions): McpServer {
  const { backend, getDashboardHtml } = options;

  const server = new McpServer({
    name: 'eigo-taxi-mcp',
    version: '1.0.0',
  });

  // 1. UI Resource (MCP Apps)
  registerAppResource(
    server,
    'Eigo Taxi Dashboard',
    DASHBOARD_URI,
    {
      title: 'Eigo Taxi Link ダッシュボード',
      description: 'Antigravity 内で生徒・送迎予定・チケット残数を直接操作するインタラクティブ UI',
      _meta: {
        ui: {
          prefersBorder: false,
        },
      },
    },
    async () => {
      const html = getDashboardHtml();
      return {
        contents: [
          {
            uri: DASHBOARD_URI,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
            _meta: {
              ui: {
                prefersBorder: false,
              },
            },
          },
        ],
      };
    },
  );

  // 2. Plain JSON Resources
  server.registerResource(
    'overview',
    'eigo-taxi://overview',
    {
      title: 'Eigo Taxi Link サマリー',
      description: '現在の動作モード、利用権限、本日予定・残少チケット等の概要 JSON',
      mimeType: 'application/json',
    },
    async () => {
      const snapshot = await backend.getDashboardSnapshot();
      return {
        contents: [
          {
            uri: 'eigo-taxi://overview',
            mimeType: 'application/json',
            text: JSON.stringify(snapshot, null, 2),
          },
        ],
      };
    },
  );

  server.registerResource(
    'students',
    'eigo-taxi://students',
    {
      title: '生徒台帳一覧',
      description: '現在のロールで参照可能な生徒一覧 JSON',
      mimeType: 'application/json',
    },
    async () => {
      const students = await backend.listStudents();
      return {
        contents: [
          {
            uri: 'eigo-taxi://students',
            mimeType: 'application/json',
            text: JSON.stringify(students, null, 2),
          },
        ],
      };
    },
  );

  server.registerResource(
    'rides-today',
    'eigo-taxi://rides/today',
    {
      title: '本日の送迎予定',
      description: '本日 (JST) の送迎予定一覧 JSON',
      mimeType: 'application/json',
    },
    async () => {
      const rides = await backend.listRides({ todayOnly: true });
      return {
        contents: [
          {
            uri: 'eigo-taxi://rides/today',
            mimeType: 'application/json',
            text: JSON.stringify(rides, null, 2),
          },
        ],
      };
    },
  );

  // 3. Tools (14 tools)
  registerAppTool(
    server,
    'get_service_status',
    {
      title: 'サービス状態確認',
      description:
        'MCP サーバーの動作モード (demo / live-gas)、現在のロール、読み取り専用設定、リリース保留方針、および任意の GAS ヘルスチェック結果を返します。',
      inputSchema: {
        checkGasHealth: z
          .boolean()
          .optional()
          .describe('true を指定すると検証 GAS エンドポイントへ非破壊の GET ヘルスチェックを実行します。'),
      },
      annotations: {
        title: 'サービス状態確認',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        ui: {
          visibility: [...APP_AND_MODEL],
        },
      },
    },
    async (args) => {
      try {
        const status = await backend.getStatus({ checkGasHealth: args.checkGasHealth });
        const lines = [
          `モード: ${status.mode} / ロール: ${status.role}${status.reviewOnly ? ' (検証専用)' : ''} / 読取専用: ${status.readonly}`,
          `認証設定: ${status.authConfigured ? '設定済み' : '未設定'} / テストサイト: ${status.portalBaseUrl}`,
          `リリース方針: ${status.releasePolicy.release} / 顧客確認: ${status.releasePolicy.customerAcceptance}`,
        ];
        if (status.gasHealth) {
          lines.push(`GAS疎通: ${status.gasHealth.reachable ? 'OK' : 'NG'} (${status.gasHealth.message})`);
        }
        return okResult(lines.join('\n'), { status });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  registerAppTool(
    server,
    'open_dashboard',
    {
      title: 'Eigo Taxi Link ダッシュボード',
      description:
        'Eigo Taxi Link のインタラクティブ MCP App ダッシュボードを開き、本日の送迎・全予約・生徒台帳・残チケット状況・新規予約フォームを表示します。',
      inputSchema: {
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('初期表示する日付 (YYYY-MM-DD)'),
        studentId: z.string().optional().describe('初期選択する生徒ID'),
        tab: z.enum(['today', 'all', 'students', 'book']).optional().describe('初期表示タブ'),
      },
      annotations: {
        title: 'Eigo Taxi Link ダッシュボード',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        ui: {
          resourceUri: DASHBOARD_URI,
          visibility: [...APP_AND_MODEL],
        },
        'com.google.antigravity/ui': {
          entrypoints: [
            { type: 'aux_pane', title: 'Eigo Taxi Link' },
            { type: 'global', title: 'Eigo Taxi Link' },
          ],
        },
      },
    },
    async (args) => {
      try {
        const snapshot = await backend.getDashboardSnapshot({
          date: args.date,
          studentId: args.studentId,
          tab: args.tab,
        });
        const text = [
          `Eigo Taxi Link (${snapshot.status.mode} / ${snapshot.status.role}) — 本日 ${snapshot.today}`,
          `生徒: ${snapshot.summary.totalStudents}名 (残少<=1: ${snapshot.summary.lowTicketStudents}名, 残0: ${snapshot.summary.zeroTicketStudents}名)`,
          `本日の送迎: ${snapshot.summary.todayRidesTotal}件 (うち予定: ${snapshot.summary.todayScheduledCount}件) / 全予定: ${snapshot.summary.allScheduledCount}件`,
        ].join('\n');
        return okResult(text, { snapshot });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  registerAppTool(
    server,
    'list_students',
    {
      title: '生徒一覧取得',
      description: '参照権限内の生徒一覧（残チケット数、住所、送迎メモ含む）を取得します。',
      inputSchema: {
        query: z.string().optional().describe('氏名・保護者名・住所・IDの部分一致フィルタ'),
        lowTicketOnly: z.boolean().optional().describe('true で残チケット1枚以下の生徒のみ抽出'),
      },
      annotations: {
        title: '生徒一覧取得',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        ui: { visibility: [...APP_AND_MODEL] },
      },
    },
    async (args) => {
      try {
        const students = await backend.listStudents({
          query: args.query,
          lowTicketOnly: args.lowTicketOnly,
        });
        const summary =
          students.length === 0
            ? '該当する生徒はいません。'
            : students
                .map((s) => `- ${s.id}: ${s.name} (残チケット: ${s.ticketBalance}回 / 住所: ${s.address})`)
                .join('\n');
        return okResult(`生徒一覧 (${students.length}名):\n${summary}`, {
          count: students.length,
          students,
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  registerAppTool(
    server,
    'get_student',
    {
      title: '生徒詳細取得',
      description: '指定した生徒IDの詳細情報と関連する予約履歴を取得します。',
      inputSchema: {
        studentId: z.string().min(1).describe('生徒ID (例: STU-001)'),
      },
      annotations: {
        title: '生徒詳細取得',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        ui: { visibility: [...APP_AND_MODEL] },
      },
    },
    async (args) => {
      try {
        const [student, rides] = await Promise.all([
          backend.getStudent(args.studentId),
          backend.listRides({ studentId: args.studentId }),
        ]);
        const text = `${student.name} (${student.id})\n残チケット: ${student.ticketBalance}回\n保護者: ${student.parentName || '-'} / 電話: ${student.phone || '-'}\n住所: ${student.address}\n送迎メモ: ${student.pickupNote || '-'}\n関連予約: ${rides.length}件`;
        return okResult(text, { student, rides });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  registerAppTool(
    server,
    'create_student',
    {
      title: '新規生徒登録',
      description: '新しい生徒を台帳に登録します（管理者権限が必要、読み取り専用モード時は拒否）。',
      inputSchema: {
        id: z.string().optional().describe('任意の冪等生徒ID (未指定時は STU-<UUID> 自動採番)'),
        name: z.string().min(1).describe('生徒氏名 (例: 佐藤 健太)'),
        parentName: z.string().optional().describe('保護者名'),
        phone: z.string().optional().describe('緊急連絡先電話番号'),
        address: z.string().min(1).describe('送迎場所住所'),
        pickupNote: z.string().optional().describe('送迎時の連絡メモ'),
        ticketBalance: z.number().int().min(0).optional().describe('初期残チケット数 (既定: 0)'),
      },
      annotations: {
        title: '新規生徒登録',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: { visibility: [...APP_AND_MODEL] },
      },
    },
    async (args) => {
      try {
        const result = await backend.createStudent(args);
        const text = `${result.replayed ? '既存登録を照合しました' : '新規生徒を登録しました'}: ${result.student.name} (${result.student.id}, 初期残数: ${result.student.ticketBalance}回)`;
        return okResult(text, { student: result.student, replayed: result.replayed });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  registerAppTool(
    server,
    'list_rides',
    {
      title: '送迎予約一覧取得',
      description: '送迎予約・履歴一覧を日付・本日限定・生徒ID・ステータスで絞り込んで取得します。',
      inputSchema: {
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('対象日 (YYYY-MM-DD)'),
        todayOnly: z.boolean().optional().describe('true で本日 (JST) の送迎のみ取得'),
        studentId: z.string().optional().describe('生徒IDフィルタ'),
        status: z.enum(['scheduled', 'completed', 'cancelled']).optional().describe('ステータスフィルタ'),
      },
      annotations: {
        title: '送迎予約一覧取得',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        ui: { visibility: [...APP_AND_MODEL] },
      },
    },
    async (args) => {
      try {
        const rides = await backend.listRides(args);
        const lines =
          rides.length === 0
            ? '条件に一致する送迎予約はありません。'
            : rides
                .map(
                  (r) =>
                    `- ${r.id} [${statusLabel(r.status)}] ${r.rideDate} ${r.rideTime} ${r.studentName || r.studentId} (${rideTypeLabel(r.rideType)}) @ ${r.pickupLocation}`,
                )
                .join('\n');
        return okResult(`送迎一覧 (${rides.length}件):\n${lines}`, {
          count: rides.length,
          rides,
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  registerAppTool(
    server,
    'create_reservation',
    {
      title: '送迎予約登録',
      description:
        '送迎予約を登録します。予約時点ではチケットは消費されず、完了処理時に片道1枚・往復2枚を消費します。',
      inputSchema: {
        rideId: z.string().optional().describe('任意の冪等予約ID (未指定時は RIDE-<UUID> 自動採番)'),
        studentId: z.string().min(1).describe('生徒ID (例: STU-001)'),
        rideDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('送迎日 (YYYY-MM-DD)'),
        rideTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).describe('送迎時間 (HH:mm)'),
        rideType: z.enum(['pickup', 'dropoff', 'roundtrip']).describe('送迎区分 (pickup=お迎え, dropoff=送り, roundtrip=往復)'),
        pickupLocation: z.string().min(1).describe('送迎場所・住所'),
        note: z.string().optional().describe('連絡事項・備考'),
      },
      annotations: {
        title: '送迎予約登録',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: { visibility: [...APP_AND_MODEL] },
      },
    },
    async (args) => {
      try {
        const result = await backend.createReservation(args);
        const r = result.ride;
        const text = `${result.replayed ? '既存予約を照合しました' : '送迎予約を登録しました'}: ${r.id} / ${r.studentName || r.studentId} (${r.rideDate} ${r.rideTime} ${rideTypeLabel(r.rideType)})`;
        return okResult(text, { ride: r, replayed: result.replayed });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  registerAppTool(
    server,
    'cancel_reservation',
    {
      title: '送迎予約キャンセル',
      description: '予約中 (scheduled) の送迎予約をキャンセルします（完了済みはキャンセル不可）。',
      inputSchema: {
        rideId: z.string().min(1).describe('キャンセル対象の予約ID (例: RIDE-101)'),
      },
      annotations: {
        title: '送迎予約キャンセル',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        ui: { visibility: [...APP_AND_MODEL] },
      },
    },
    async (args) => {
      try {
        const res = await backend.cancelReservation(args.rideId);
        const text = res.replayed
          ? `予約 ${args.rideId} は既にキャンセル済みです。`
          : `予約 ${args.rideId} をキャンセルしました。`;
        return okResult(text, { rideId: args.rideId, ...res });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  registerAppTool(
    server,
    'complete_ride',
    {
      title: '送迎完了・チケット消化',
      description:
        '送迎を完了状態にし、送迎区分に応じてチケットを消化します（片道=1枚, 往復=2枚。残高不足時は失敗）。管理者権限が必要です。',
      inputSchema: {
        rideId: z.string().min(1).describe('完了対象の予約ID (例: RIDE-101)'),
        consumeTickets: z
          .number()
          .int()
          .min(1)
          .max(2)
          .optional()
          .describe('確認用の消費枚数（省略可。指定時は片道1・往復2と一致必須）'),
      },
      annotations: {
        title: '送迎完了・チケット消化',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        ui: { visibility: [...APP_AND_MODEL] },
      },
    },
    async (args) => {
      try {
        const res = await backend.completeRide(args.rideId, args.consumeTickets);
        const text = res.replayed
          ? `予約 ${args.rideId} は既に完了済みです（残チケット: ${res.remainingBalance ?? '不明'}回）。`
          : `送迎 ${args.rideId} を完了しました（消費: ${res.consumedTickets ?? 1}回 / 残チケット: ${res.remainingBalance ?? '不明'}回）。`;
        return okResult(text, { rideId: args.rideId, ...res });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  registerAppTool(
    server,
    'add_tickets',
    {
      title: 'チケット追加（購入登録）',
      description: '生徒のチケット残高を追加（1〜100枚）し、購入履歴を記録します。管理者権限が必要です。',
      inputSchema: {
        purchaseId: z.string().optional().describe('任意の冪等購入ID (未指定時は PUR-<UUID> 自動採番)'),
        studentId: z.string().min(1).describe('対象生徒ID (例: STU-002)'),
        ticketCount: z.number().int().min(1).max(100).describe('追加枚数 (1〜100)'),
        amount: z.number().int().min(0).describe('受取金額（円、0以上の整数）'),
        note: z.string().optional().describe('備考（例: 5回券追加）'),
      },
      annotations: {
        title: 'チケット追加',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: { visibility: [...APP_AND_MODEL] },
      },
    },
    async (args) => {
      try {
        const res = await backend.addTickets(args);
        const text = `${res.replayed ? '既存購入を照合しました' : 'チケットを追加しました'}: ${args.studentId} (+${args.ticketCount}回 / 新残高: ${res.newBalance}回)`;
        return okResult(text, { studentId: args.studentId, ticketCount: args.ticketCount, ...res });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  registerAppTool(
    server,
    'list_portal_invitations',
    {
      title: '保護者専用ポータル招待URL一覧',
      description: '保護者向けの個別エントリURL (#/parent/<publicEntryId>) 一覧を取得します。管理者権限が必要です。',
      inputSchema: {},
      annotations: {
        title: '招待URL一覧取得',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        ui: { visibility: [...APP_AND_MODEL] },
      },
    },
    async () => {
      try {
        const invitations = await backend.listPortalInvitations();
        const text =
          invitations.length === 0
            ? '配布可能な個別招待URLはありません。'
            : invitations
                .map((i) => `- ${i.name} (${i.userId}): ${i.portalUrl || i.publicEntryId}`)
                .join('\n');
        return okResult(`保護者招待URL (${invitations.length}件):\n${text}`, {
          count: invitations.length,
          invitations,
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    'list_managed_users',
    {
      title: '登録Googleアカウント一覧取得',
      description: 'live-gas モードのフル管理者権限で、登録済み Google アカウントと割り当て生徒一覧を取得します。',
      inputSchema: {},
      annotations: {
        title: '登録アカウント一覧取得',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      try {
        const managed = await backend.listManagedUsers();
        const text = `登録アカウント (${managed.users.length}名 / revision: ${managed.revision}):\n${managed.users
          .map((u) => `- ${u.name} [${u.role}] ${u.active ? '有効' : '停止'} (${u.email || '未設定'})`)
          .join('\n')}`;
        return okResult(text, { managed });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  registerAppTool(
    server,
    'switch_demo_role',
    {
      title: 'デモロール切替',
      description: 'demo モード時の操作ロールを管理者 (admin) と保護者 (parent) の間で切り替えます。',
      inputSchema: {
        role: z.enum(['admin', 'parent']).describe('切替先ロール (admin または parent)'),
      },
      annotations: {
        title: 'デモロール切替',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        ui: { visibility: [...APP_AND_MODEL] },
      },
    },
    async (args) => {
      try {
        const role = await backend.switchDemoRole(args.role);
        return okResult(`デモモードのロールを "${role}" に切り替えました。`, { role });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  registerAppTool(
    server,
    'reset_demo_data',
    {
      title: 'デモデータ初期化',
      description: 'demo モードのローカル保存データを初期モックデータへ戻します（live-gas では使用不可）。',
      inputSchema: {
        confirm: z.literal(true).describe('初期化を実行するには true を指定してください。'),
      },
      annotations: {
        title: 'デモデータ初期化',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        ui: { visibility: [...APP_AND_MODEL] },
      },
    },
    async () => {
      try {
        const snapshot = await backend.resetDemoData();
        return okResult(
          `デモデータを初期状態にリセットしました（生徒 ${snapshot.summary.totalStudents}名 / 本日送迎 ${snapshot.summary.todayRidesTotal}件）。`,
          { snapshot },
        );
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // 4. Prompts (2 prompts)
  server.registerPrompt(
    'daily_dispatch_briefing',
    {
      title: '本日の送迎ブリーフィング作成',
      description: '指定日（既定: 本日）の送迎スケジュールと残チケット警告を集計してブリーフィングを作成します。',
      argsSchema: {
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('対象日 (YYYY-MM-DD)'),
      },
    },
    async (args) => {
      const targetDate = args.date ?? getJstDateString();
      return {
        description: `${targetDate} の送迎ブリーフィング指示`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Eigo Taxi Link MCP の get_service_status, list_rides (date="${targetDate}"), list_students を呼び出し、以下を日本語で簡潔にまとめてください:\n1. 現在のモードと権限（demo か live-gas かを必ず明記）\n2. ${targetDate} の時刻順送迎スケジュール（生徒名・区分・場所・連絡メモ・予定/完了ステータス）\n3. 残チケット不足（1回以下、または本日の予約消化に対して不足）の注意生徒一覧`,
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    'low_ticket_followup',
    {
      title: 'チケット残少生徒フォローアップ案内',
      description: 'チケット残数が指定枚数以下の生徒を抽出し、保護者向けの案内文案を作成します。',
      argsSchema: {
        threshold: z.string().optional().describe('抽出する残数上限（既定: 1）'),
      },
    },
    async (args) => {
      const threshold = Number(args.threshold ?? '1') || 1;
      return {
        description: `残チケット ${threshold} 枚以下の生徒フォローアップ`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `list_students を呼び出して残チケット数が ${threshold} 回以下の生徒を確認し、生徒ごとの残数と状況、および保護者向けの丁寧な更新案内メッセージ案（自動送信はせず下書き提案のみ）を作成してください。`,
            },
          },
        ],
      };
    },
  );

  return server;
}
