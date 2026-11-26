import {
  App,
  applyDocumentTheme,
  applyHostStyleVariables,
  type McpUiHostContext,
} from '@modelcontextprotocol/ext-apps';
import type { DashboardSnapshot, RideReservation, Student } from '../src/types.js';

type TabKey = 'today' | 'all' | 'students' | 'book';

interface AppState {
  snapshot: DashboardSnapshot | null;
  activeTab: TabKey;
  busy: boolean;
  statusMessage: string | null;
  errorMessage: string | null;
  receivedInitialResult: boolean;
}

const state: AppState = {
  snapshot: null,
  activeTab: 'today',
  busy: false,
  statusMessage: null,
  errorMessage: null,
  receivedInitialResult: false,
};

const app = new App({ name: 'Eigo Taxi Link', version: '1.0.0' }, {});

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function applyHostContext(ctx: McpUiHostContext | undefined): void {
  if (!ctx) return;
  if (ctx.theme) applyDocumentTheme(ctx.theme);
  if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
}

function rideTypeLabel(rideType: RideReservation['rideType']): string {
  if (rideType === 'pickup') return 'お迎え (1回)';
  if (rideType === 'dropoff') return '送り (1回)';
  return '往復 (2回)';
}

function rideStatusBadge(status: RideReservation['status']): HTMLElement {
  if (status === 'completed') return el('span', 'badge badge-ok', '完了');
  if (status === 'cancelled') return el('span', 'badge badge-danger', '取消');
  return el('span', 'badge badge-info', '予定');
}

function ticketBadge(balance: number): HTMLElement {
  if (balance === 0) return el('span', 'badge badge-danger', '残 0 回');
  if (balance === 1) return el('span', 'badge badge-warn', '残少 1 回');
  return el('span', 'badge badge-ok', `残 ${balance} 回`);
}

function extractErrorText(result: { isError?: boolean; content?: Array<{ type: string; text?: string }> }): string {
  const txt = result.content?.find((c) => c.type === 'text')?.text;
  return txt || '操作に失敗しました。';
}

async function runTool(name: string, args: Record<string, unknown>, successNote?: string): Promise<void> {
  if (state.busy) return;
  state.busy = true;
  state.errorMessage = null;
  render();
  try {
    const res = await app.callServerTool({ name, arguments: args });
    if (res.isError) {
      state.errorMessage = extractErrorText(res as { isError?: boolean; content?: Array<{ type: string; text?: string }> });
      return;
    }
    const structured = res.structuredContent as { snapshot?: DashboardSnapshot } | undefined;
    if (structured?.snapshot) {
      state.snapshot = structured.snapshot;
    } else {
      const refreshed = await app.callServerTool({
        name: 'open_dashboard',
        arguments: { tab: state.activeTab },
      });
      if (refreshed.isError) {
        state.errorMessage = extractErrorText(
          refreshed as { isError?: boolean; content?: Array<{ type: string; text?: string }> },
        );
        return;
      }
      const refData = refreshed.structuredContent as { snapshot?: DashboardSnapshot } | undefined;
      if (refData?.snapshot) state.snapshot = refData.snapshot;
    }
    if (successNote) {
      state.statusMessage = successNote;
    } else {
      const txt = (res.content as Array<{ type: string; text?: string }> | undefined)?.find((c) => c.type === 'text')?.text;
      if (txt) state.statusMessage = txt.split('\n')[0];
    }
  } catch (error) {
    state.errorMessage = error instanceof Error ? error.message : String(error);
  } finally {
    state.busy = false;
    render();
  }
}

async function shareContextToConversation(): Promise<void> {
  if (!state.snapshot) return;
  const s = state.snapshot;
  const lines = [
    `[Eigo Taxi Link ${s.today}] モード=${s.status.mode}, ロール=${s.status.role}`,
    `生徒=${s.summary.totalStudents}名 (残少=${s.summary.lowTicketStudents}名), 本日予定=${s.summary.todayScheduledCount}/${s.summary.todayRidesTotal}件`,
    ...s.todayRides.map(
      (r) => `- ${r.rideTime} ${r.studentName || r.studentId} (${rideTypeLabel(r.rideType)}) [${r.status}]`,
    ),
  ];
  try {
    await app.updateModelContext({
      content: [{ type: 'text', text: lines.join('\n') }],
    });
    state.statusMessage = '現在の送迎・残数サマリーを会話のコンテキストに添付しました。';
  } catch (error) {
    state.errorMessage = error instanceof Error ? error.message : 'コンテキスト添付に失敗しました。';
  }
  render();
}

function renderRideCard(ride: RideReservation, isAdmin: boolean, readonly: boolean): HTMLElement {
  const card = el('div', 'item-card');
  const main = el('div', 'item-main');

  const title = el('div', 'item-title');
  title.appendChild(rideStatusBadge(ride.status));
  title.appendChild(el('span', undefined, `${ride.rideDate} ${ride.rideTime}`));
  title.appendChild(el('span', undefined, ride.studentName || ride.studentId));
  title.appendChild(el('span', 'badge', rideTypeLabel(ride.rideType)));
  main.appendChild(title);

  main.appendChild(el('div', 'item-meta', `場所: ${ride.pickupLocation}`));
  if (ride.note) {
    main.appendChild(el('div', 'item-meta', `メモ: ${ride.note}`));
  }
  if (ride.completedAt) {
    main.appendChild(el('div', 'item-meta', `完了日時: ${ride.completedAt}`));
  }
  card.appendChild(main);

  if (ride.status === 'scheduled') {
    const actions = el('div', 'action-row');
    if (isAdmin) {
      const completeBtn = el(
        'button',
        'btn-primary',
        ride.rideType === 'roundtrip' ? '送迎完了 (2回消費)' : '送迎完了 (1回消費)',
      );
      completeBtn.type = 'button';
      completeBtn.disabled = state.busy || readonly;
      completeBtn.addEventListener('click', () => {
        void runTool('complete_ride', { rideId: ride.id }, `送迎 ${ride.id} を完了しました`);
      });
      actions.appendChild(completeBtn);
    }
    const cancelBtn = el('button', 'btn-danger', 'キャンセル');
    cancelBtn.type = 'button';
    cancelBtn.disabled = state.busy || readonly;
    cancelBtn.addEventListener('click', () => {
      void runTool('cancel_reservation', { rideId: ride.id }, `予約 ${ride.id} をキャンセルしました`);
    });
    actions.appendChild(cancelBtn);
    card.appendChild(actions);
  }
  return card;
}

function renderStudentsPanel(
  students: Student[],
  canAddTickets: boolean,
  canCreateStudent: boolean,
  readonly: boolean,
): HTMLElement {
  const panel = el('section', 'panel');
  panel.appendChild(el('h2', 'panel-heading', `生徒台帳・チケット残数 (${students.length}名)`));

  if (students.length === 0) {
    panel.appendChild(el('p', 'empty-note', '参照可能な生徒データがありません。'));
  } else {
    const list = el('div', 'list');
    for (const student of students) {
      const card = el('div', 'item-card');
      const main = el('div', 'item-main');
      const title = el('div', 'item-title');
      title.appendChild(el('span', undefined, `${student.name} (${student.id})`));
      title.appendChild(ticketBadge(student.ticketBalance));
      main.appendChild(title);
      main.appendChild(el('div', 'item-meta', `保護者: ${student.parentName || '-'} / 電話: ${student.phone || '-'}`));
      main.appendChild(el('div', 'item-meta', `住所: ${student.address}`));
      if (student.pickupNote) {
        main.appendChild(el('div', 'item-meta', `送迎メモ: ${student.pickupNote}`));
      }
      card.appendChild(main);

      if (canAddTickets) {
        const actions = el('div', 'action-row');
        const add5 = el('button', undefined, '+5回 (¥5,000)');
        add5.type = 'button';
        add5.disabled = state.busy || readonly;
        add5.addEventListener('click', () => {
          void runTool(
            'add_tickets',
            { studentId: student.id, ticketCount: 5, amount: 5000, note: '5回券追加' },
            `${student.name} に +5回券を追加しました`,
          );
        });
        const add10 = el('button', 'btn-primary', '+10回 (¥10,000)');
        add10.type = 'button';
        add10.disabled = state.busy || readonly;
        add10.addEventListener('click', () => {
          void runTool(
            'add_tickets',
            { studentId: student.id, ticketCount: 10, amount: 10000, note: '10回券追加' },
            `${student.name} に +10回券を追加しました`,
          );
        });
        actions.append(add5, add10);
        card.appendChild(actions);
      }
      list.appendChild(card);
    }
    panel.appendChild(list);
  }

  if (canCreateStudent && !readonly) {
    panel.appendChild(el('hr', 'divider'));
    panel.appendChild(el('h3', 'panel-heading', '新規生徒登録'));
    const form = el('form', 'form-grid');

    const nameField = el('div', 'field');
    const nameLabel = el('label', undefined, '生徒氏名 *');
    nameLabel.htmlFor = 'new-student-name';
    const nameInput = el('input');
    nameInput.id = 'new-student-name';
    nameInput.required = true;
    nameInput.placeholder = '例: 佐藤 健太';
    nameField.append(nameLabel, nameInput);

    const parentField = el('div', 'field');
    const parentLabel = el('label', undefined, '保護者名');
    parentLabel.htmlFor = 'new-student-parent';
    const parentInput = el('input');
    parentInput.id = 'new-student-parent';
    parentInput.placeholder = '例: 佐藤 真理';
    parentField.append(parentLabel, parentInput);

    const phoneField = el('div', 'field');
    const phoneLabel = el('label', undefined, '緊急連絡先');
    phoneLabel.htmlFor = 'new-student-phone';
    const phoneInput = el('input');
    phoneInput.id = 'new-student-phone';
    phoneInput.placeholder = '090-0000-0000';
    phoneField.append(phoneLabel, phoneInput);

    const balField = el('div', 'field');
    const balLabel = el('label', undefined, '初期残チケット数');
    balLabel.htmlFor = 'new-student-balance';
    const balInput = el('input');
    balInput.id = 'new-student-balance';
    balInput.type = 'number';
    balInput.min = '0';
    balInput.value = '0';
    balField.append(balLabel, balInput);

    const addrField = el('div', 'field full');
    const addrLabel = el('label', undefined, '送迎場所住所 *');
    addrLabel.htmlFor = 'new-student-address';
    const addrInput = el('input');
    addrInput.id = 'new-student-address';
    addrInput.required = true;
    addrInput.placeholder = '東京都世田谷区...';
    addrField.append(addrLabel, addrInput);

    const noteField = el('div', 'field full');
    const noteLabel = el('label', undefined, '送迎時メモ');
    noteLabel.htmlFor = 'new-student-note';
    const noteInput = el('input');
    noteInput.id = 'new-student-note';
    noteInput.placeholder = 'インターホン案内など';
    noteField.append(noteLabel, noteInput);

    const submitWrap = el('div', 'field full');
    const submitBtn = el('button', 'btn-primary', '生徒を登録');
    submitBtn.type = 'submit';
    submitBtn.disabled = state.busy;
    submitWrap.appendChild(submitBtn);

    form.append(nameField, parentField, phoneField, balField, addrField, noteField, submitWrap);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!nameInput.value.trim() || !addrInput.value.trim()) {
        state.errorMessage = '生徒氏名と送迎場所住所は必須です。';
        render();
        return;
      }
      void runTool(
        'create_student',
        {
          name: nameInput.value.trim(),
          parentName: parentInput.value.trim(),
          phone: phoneInput.value.trim(),
          address: addrInput.value.trim(),
          pickupNote: noteInput.value.trim(),
          ticketBalance: Math.max(0, Number.parseInt(balInput.value || '0', 10) || 0),
        },
        `新規生徒「${nameInput.value.trim()}」を登録しました`,
      );
    });
    panel.appendChild(form);
  }

  return panel;
}

function renderBookingPanel(snapshot: DashboardSnapshot, readonly: boolean): HTMLElement {
  const panel = el('section', 'panel');
  panel.appendChild(el('h2', 'panel-heading', '新規送迎予約の登録'));

  if (snapshot.students.length === 0) {
    panel.appendChild(el('p', 'empty-note', '予約可能な生徒がいません。'));
    return panel;
  }

  const form = el('form', 'form-grid');

  const stuField = el('div', 'field');
  const stuLabel = el('label', undefined, '生徒 *');
  stuLabel.htmlFor = 'book-student';
  const stuSelect = el('select');
  stuSelect.id = 'book-student';
  for (const s of snapshot.students) {
    const opt = el('option');
    opt.value = s.id;
    opt.textContent = `${s.name} (残 ${s.ticketBalance}回)`;
    if (snapshot.selectedStudentId === s.id) opt.selected = true;
    stuSelect.appendChild(opt);
  }
  stuField.append(stuLabel, stuSelect);

  const typeField = el('div', 'field');
  const typeLabel = el('label', undefined, '送迎区分 *');
  typeLabel.htmlFor = 'book-type';
  const typeSelect = el('select');
  typeSelect.id = 'book-type';
  for (const [val, label] of [
    ['pickup', 'お迎え (完了時 1回消費)'],
    ['dropoff', '送り (完了時 1回消費)'],
    ['roundtrip', '往復 (完了時 2回消費)'],
  ] as const) {
    const opt = el('option');
    opt.value = val;
    opt.textContent = label;
    typeSelect.appendChild(opt);
  }
  typeField.append(typeLabel, typeSelect);

  const dateField = el('div', 'field');
  const dateLabel = el('label', undefined, '送迎日 *');
  dateLabel.htmlFor = 'book-date';
  const dateInput = el('input');
  dateInput.id = 'book-date';
  dateInput.type = 'date';
  dateInput.required = true;
  dateInput.value = snapshot.selectedDate || snapshot.today;
  dateField.append(dateLabel, dateInput);

  const timeField = el('div', 'field');
  const timeLabel = el('label', undefined, '送迎時間 *');
  timeLabel.htmlFor = 'book-time';
  const timeInput = el('input');
  timeInput.id = 'book-time';
  timeInput.type = 'time';
  timeInput.required = true;
  timeInput.value = '16:00';
  timeField.append(timeLabel, timeInput);

  const locField = el('div', 'field full');
  const locLabel = el('label', undefined, '送迎場所・住所 *');
  locLabel.htmlFor = 'book-location';
  const locInput = el('input');
  locInput.id = 'book-location';
  locInput.required = true;
  const initialStudent = snapshot.students.find((s) => s.id === stuSelect.value) ?? snapshot.students[0];
  locInput.value = initialStudent?.address || '';
  stuSelect.addEventListener('change', () => {
    const found = snapshot.students.find((s) => s.id === stuSelect.value);
    if (found) locInput.value = found.address;
  });
  locField.append(locLabel, locInput);

  const noteField = el('div', 'field full');
  const noteLabel = el('label', undefined, '備考・連絡事項');
  noteLabel.htmlFor = 'book-note';
  const noteInput = el('input');
  noteInput.id = 'book-note';
  noteInput.placeholder = '例: レッスン前のお迎え';
  noteField.append(noteLabel, noteInput);

  const submitWrap = el('div', 'field full');
  const submitBtn = el('button', 'btn-primary', 'この内容で送迎予約を登録');
  submitBtn.type = 'submit';
  submitBtn.disabled = state.busy || readonly;
  submitWrap.appendChild(submitBtn);

  form.append(stuField, typeField, dateField, timeField, locField, noteField, submitWrap);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!stuSelect.value || !dateInput.value || !timeInput.value || !locInput.value.trim()) {
      state.errorMessage = '送迎予約の必須項目を入力してください。';
      render();
      return;
    }
    void runTool(
      'create_reservation',
      {
        studentId: stuSelect.value,
        rideDate: dateInput.value,
        rideTime: timeInput.value,
        rideType: typeSelect.value,
        pickupLocation: locInput.value.trim(),
        note: noteInput.value.trim(),
      },
      '送迎予約を登録しました（本日の送迎 / 全予約タブで確認できます）',
    );
  });
  panel.appendChild(form);
  return panel;
}

function render(): void {
  const root = document.getElementById('app');
  if (!root) return;
  root.replaceChildren();

  const shell = el('div', 'app-shell');
  const snap = state.snapshot;
  const caps = app.getHostCapabilities();

  const header = el('header', 'header-bar');
  const titleGroup = el('div', 'title-group');
  const titleRow = el('div', 'title-row');
  titleRow.appendChild(el('h1', 'app-title', 'Eigo Taxi Link (MCP App)'));

  if (snap) {
    titleRow.appendChild(
      el(
        'span',
        snap.status.mode === 'demo' ? 'badge badge-info' : 'badge badge-ok',
        snap.status.mode === 'demo' ? 'デモモード (ローカル保存)' : 'GAS 連携モード',
      ),
    );
    titleRow.appendChild(
      el(
        'span',
        'badge',
        snap.status.role === 'admin' ? (snap.status.reviewOnly ? '管理者 (検証専用)' : '管理者') : '保護者',
      ),
    );
    if (snap.status.readonly) {
      titleRow.appendChild(el('span', 'badge badge-warn', '読取専用'));
    }
  }
  titleGroup.appendChild(titleRow);
  titleGroup.appendChild(
    el(
      'p',
      'subtitle',
      snap
        ? `基準日 (JST): ${snap.today} / 方針: release=${snap.status.releasePolicy.release}, 顧客確認=${snap.status.releasePolicy.customerAcceptance}`
        : 'MCP サーバーから送迎台帳を読み込んでいます…',
    ),
  );
  header.appendChild(titleGroup);

  const actions = el('div', 'action-row');
  if (snap?.status.mode === 'demo' && !snap.status.readonly) {
    const nextRole = snap.status.role === 'admin' ? 'parent' : 'admin';
    const roleBtn = el('button', undefined, nextRole === 'admin' ? '管理者表示へ切替' : '保護者表示へ切替');
    roleBtn.type = 'button';
    roleBtn.disabled = state.busy;
    roleBtn.addEventListener('click', () => {
      void runTool('switch_demo_role', { role: nextRole }, `ロールを ${nextRole} に切り替えました`);
    });
    actions.appendChild(roleBtn);
  }
  if (caps?.updateModelContext && snap) {
    const shareBtn = el('button', undefined, '会話へ状況を添付');
    shareBtn.type = 'button';
    shareBtn.disabled = state.busy;
    shareBtn.addEventListener('click', () => {
      void shareContextToConversation();
    });
    actions.appendChild(shareBtn);
  }
  const reloadBtn = el('button', undefined, state.busy ? '同期中…' : '最新に更新');
  reloadBtn.type = 'button';
  reloadBtn.disabled = state.busy;
  reloadBtn.addEventListener('click', () => {
    void runTool('open_dashboard', { tab: state.activeTab }, '台帳を再取得しました');
  });
  actions.appendChild(reloadBtn);
  header.appendChild(actions);
  shell.appendChild(header);

  if (state.errorMessage) {
    const err = el('div', 'banner banner-error', state.errorMessage);
    err.setAttribute('role', 'alert');
    shell.appendChild(err);
  }
  if (state.statusMessage) {
    const st = el('div', 'banner banner-status', state.statusMessage);
    st.setAttribute('role', 'status');
    shell.appendChild(st);
  }

  if (!snap) {
    const loading = el('div', 'panel');
    loading.appendChild(el('p', 'empty-note', 'データを読み込み中です…'));
    shell.appendChild(loading);
    root.appendChild(shell);
    return;
  }

  const kpis = el('section', 'kpi-grid');
  kpis.setAttribute('aria-label', '運用サマリー');
  const kpiItems: Array<[string, string]> = [
    ['本日の予定', `${snap.summary.todayScheduledCount} / ${snap.summary.todayRidesTotal} 件`],
    ['全予定件数', `${snap.summary.allScheduledCount} 件`],
    ['生徒数', `${snap.summary.totalStudents} 名`],
    ['残チケット注意 (<=1回)', `${snap.summary.lowTicketStudents} 名`],
  ];
  for (const [label, value] of kpiItems) {
    const card = el('div', 'kpi-card');
    card.appendChild(el('div', 'kpi-label', label));
    card.appendChild(el('div', 'kpi-value', value));
    kpis.appendChild(card);
  }
  shell.appendChild(kpis);

  const tabs = el('div', 'tabs');
  tabs.setAttribute('role', 'tablist');
  const tabDefs: Array<[TabKey, string]> = [
    ['today', `本日の送迎 (${snap.todayRides.length})`],
    ['all', `全予約・履歴 (${snap.rides.length})`],
    ['students', `生徒・チケット (${snap.students.length})`],
    ['book', '新規予約'],
  ];
  for (const [key, label] of tabDefs) {
    const btn = el('button', 'tab-btn', label);
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', state.activeTab === key ? 'true' : 'false');
    btn.addEventListener('click', () => {
      state.activeTab = key;
      render();
    });
    tabs.appendChild(btn);
  }
  shell.appendChild(tabs);

  const isAdmin = snap.status.role === 'admin';
  const readonly = snap.status.readonly;

  if (state.activeTab === 'today') {
    const panel = el('section', 'panel');
    panel.appendChild(el('h2', 'panel-heading', `本日 (${snap.today}) の送迎タイムライン`));
    if (snap.todayRides.length === 0) {
      panel.appendChild(el('p', 'empty-note', '本日の送迎予定はありません。'));
    } else {
      const list = el('div', 'list');
      for (const ride of snap.todayRides) {
        list.appendChild(renderRideCard(ride, isAdmin, readonly));
      }
      panel.appendChild(list);
    }
    shell.appendChild(panel);
  } else if (state.activeTab === 'all') {
    const panel = el('section', 'panel');
    panel.appendChild(el('h2', 'panel-heading', `全送迎スケジュール・履歴 (${snap.rides.length}件)`));
    if (snap.rides.length === 0) {
      panel.appendChild(el('p', 'empty-note', '予約データがありません。'));
    } else {
      const list = el('div', 'list');
      for (const ride of snap.rides) {
        list.appendChild(renderRideCard(ride, isAdmin, readonly));
      }
      panel.appendChild(list);
    }
    shell.appendChild(panel);
  } else if (state.activeTab === 'students') {
    shell.appendChild(renderStudentsPanel(snap.students, isAdmin, isAdmin && !snap.status.reviewOnly, readonly));
  } else {
    shell.appendChild(renderBookingPanel(snap, readonly));
  }

  root.appendChild(shell);
}

// Register handlers BEFORE connect() so no notification is missed.
app.ontoolinput = ({ arguments: args }) => {
  const tab = args?.tab;
  if (tab === 'today' || tab === 'all' || tab === 'students' || tab === 'book') {
    state.activeTab = tab;
  }
  render();
};

app.ontoolresult = (result) => {
  state.receivedInitialResult = true;
  if (result.isError) {
    state.errorMessage = extractErrorText(result as { isError?: boolean; content?: Array<{ type: string; text?: string }> });
    render();
    return;
  }
  const structured = result.structuredContent as { snapshot?: DashboardSnapshot } | undefined;
  if (structured?.snapshot) {
    state.snapshot = structured.snapshot;
    if (structured.snapshot.activeTab) {
      state.activeTab = structured.snapshot.activeTab;
    }
    state.errorMessage = null;
  }
  render();
};

app.ontoolcancelled = (params) => {
  state.busy = false;
  state.statusMessage = params.reason ? `操作がキャンセルされました: ${params.reason}` : '操作がキャンセルされました';
  render();
};

app.onhostcontextchanged = (ctx) => {
  applyHostContext(ctx);
};

async function boot(): Promise<void> {
  render();
  await app.connect();
  applyHostContext(app.getHostContext());

  // Fallback for direct entrypoint launches if the host didn't push tool-result yet.
  setTimeout(() => {
    if (!state.receivedInitialResult && !state.snapshot && !state.busy) {
      void runTool('open_dashboard', {});
    }
  }, 150);
}

void boot().catch((error) => {
  state.errorMessage = error instanceof Error ? error.message : String(error);
  render();
});
