/* Offline contract/fault-injection tests. No Google/network calls or deployment. */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const gasPath = path.join(root, 'gas/Code.gs');
const source = fs.readFileSync(gasPath, 'utf8');
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const S = '生徒台帳', R = '送迎予定履歴', P = 'チケット購入履歴';
const pending = 'PENDING_MUTATION_JSON';
const calendarScope = 'https://www.googleapis.com/auth/calendar';
const testCalendarId = 'taxi-verification@group.calendar.google.com';
const reviewSheetId = 'synthetic-acceptance-spreadsheet';
const reviewSheetProp = 'ACCEPTANCE_REVIEW_SPREADSHEET_ID';
const primaryCalendarId = 'synthetic-owner@example.invalid';
const adminKey = 'test-only-admin-key-00000000000000000001';
const parentKey = 'test-only-parent-key-0000000000000000001';
const otherKey = 'test-only-other-key-00000000000000000001';
const emptyKey = 'test-only-no-student-key-000000000000001';
const results = [];

function fixture({ empty = false } = {}) {
  const state = { locked: false, acquisitions: 0, releases: 0, calls: [], rules: [], hooks: {}, sequence: 10, events: {}, sheets: {}, props: {} };
  state.props.TEST_CALENDAR_ID = testCalendarId;
  state.calendarAuthorized = true;
  state.calendars = new Map([
    [testCalendarId, { id: testCalendarId, primary: false, owned: true, events: state.events }],
    [primaryCalendarId, { id: primaryCalendarId, primary: true, owned: true, events: {} }],
  ]);
  state.props.AUTH_LEGACY_KEYS_ENABLED = 'true'; // Explicit migration fixture; production default is disabled.
  state.props.AUTH_USERS_JSON = JSON.stringify({
    [hash(adminKey)]: { id: 'admin-1', name: 'Test Admin', role: 'admin', studentIds: [] },
    [hash(parentKey)]: { id: 'parent-1', name: 'Test Parent One', role: 'parent', studentIds: ['STU-1'] },
    [hash(otherKey)]: { id: 'parent-2', name: 'Test Parent Two', role: 'parent', studentIds: ['STU-2'] },
    [hash(emptyKey)]: { id: 'parent-empty', name: 'Test Parent Empty', role: 'parent', studentIds: [] },
  });
  const copy = value => structuredClone(value);
  function op(label, effect, write = false) {
    state.calls.push(label);
    if (write) assert.equal(state.locked, true, `write without script lock: ${label}`);
    if (state.hooks[label]) { const fn = state.hooks[label]; delete state.hooks[label]; fn(); }
    const rule = state.rules.find(r => r.label === label && r.remaining > 0);
    if (rule && !rule.after) { rule.remaining--; throw new Error(`injected before ${label}: private-service-detail`); }
    const result = effect();
    if (rule && rule.after) { rule.remaining--; throw new Error(`injected after ${label}: private-service-detail`); }
    return result;
  }
  const normalize = v => typeof v === 'string' && v.startsWith("'=") ? v.slice(1) : v;
  function sheet(name) {
    return {
      getDataRange: () => ({ getValues: () => op(`${name}.read`, () => copy(state.sheets[name])) }),
      getLastRow: () => state.sheets[name].length,
      getRange: (row, column, height = 1, width = 1) => ({
        getValues: () => op(`${name}.rangeRead`, () => Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => copy(state.sheets[name][row - 1 + y]?.[column - 1 + x] ?? '')))),
        setValue: value => op(`${name}.set:${row}:${column}`, () => {
          state.sheets[name][row - 1][column - 1] = normalize(value);
        }, true),
      }),
      appendRow: values => op(`${name}.append`, () => state.sheets[name].push(Array.from(values, normalize)), true),
      deleteRow: row => op(`${name}.delete:${row}`, () => state.sheets[name].splice(row - 1, 1), true),
    };
  }
  const spreadsheet = {
    getId: () => op('spreadsheet.id', () => reviewSheetId),
    getSheetByName: name => op(`sheet:${name}`, () => state.sheets[name] ? sheet(name) : null),
    insertSheet: name => op(`insert:${name}`, () => { state.sheets[name] = []; return sheet(name); }, true),
  };
  function event(events, id) {
    return {
      getId: () => op(`calendar.id:${id}`, () => id),
      deleteEvent: () => op(`calendar.delete:${id}`, () => { delete events[id]; }, true),
    };
  }
  const context = vm.createContext({
    Date, console,
    SpreadsheetApp: { getActiveSpreadsheet: () => spreadsheet, flush: () => op('flush', () => undefined, true) },
    ScriptApp: {
      AuthMode: { FULL: 'FULL' }, AuthorizationStatus: { REQUIRED: 'REQUIRED', NOT_REQUIRED: 'NOT_REQUIRED' },
      getAuthorizationInfo: (mode, scopes) => {
        assert.equal(mode, 'FULL'); assert.deepEqual(Array.from(scopes), [calendarScope]);
        state.calls.push('scope.calendar');
        return { getAuthorizationStatus: () => state.calendarAuthorized ? 'NOT_REQUIRED' : 'REQUIRED' };
      },
    },
    CalendarApp: { getCalendarById: calendarId => op(`calendar.lookup:${calendarId}`, () => {
      const calendar = state.calendars.get(calendarId);
      if (!calendar) return null;
      return {
        getId: () => calendar.id,
        isMyPrimaryCalendar: () => calendar.primary,
        isOwnedByMe: () => calendar.owned,
        createEvent: (title, start, end, options) => op('calendar.create', () => {
          const id = `CAL-${++state.sequence}`;
          calendar.events[id] = { title, start: start.toISOString(), end: end.toISOString(), options: copy(options) };
          return event(calendar.events, id);
        }, true),
        getEventById: id => op(`calendar.get:${id}`, () => calendar.events[id] ? event(calendar.events, id) : null),
      };
    }) },
    LockService: { getScriptLock: () => {
      let acquired = false;
      return {
        tryLock: () => { state.calls.push('lock.try'); if (state.locked) return false; acquired = true; state.locked = true; state.acquisitions++; return true; },
        releaseLock: () => { assert.ok(acquired); state.calls.push('lock.release'); acquired = false; state.locked = false; state.releases++; },
      };
    } },
    PropertiesService: { getScriptProperties: () => ({
      getProperty: key => op(`property.get:${key}`, () => state.props[key] ?? null),
      setProperty: (key, value) => op(`property.set:${key}`, () => { state.props[key] = value; }, true),
      deleteProperty: key => op(`property.delete:${key}`, () => { delete state.props[key]; }, true),
    }) },
    Utilities: {
      base64DecodeWebSafe: value => Buffer.from(value, 'base64url'),
      newBlob: bytes => ({ getDataAsString: () => Buffer.from(bytes).toString('utf8') }),
      DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' },
      computeDigest: (algorithm, value) => Array.from(crypto.createHash(algorithm).update(value, 'utf8').digest(), byte => byte > 127 ? byte - 256 : byte),
      getUuid: () => `12345678-1234-4123-8123-${String(++state.sequence).padStart(12,'0')}`,
      formatDate: (date, zone, pattern) => {
        assert.equal(zone, 'Asia/Tokyo');
        const iso = new Date(date.getTime() + 9 * 3600000).toISOString();
        if (pattern === 'yyyy-MM-dd') return iso.slice(0, 10);
        if (pattern === 'HH:mm') return iso.slice(11, 16);
        if (pattern === 'yyyy/MM/dd HH:mm:ss') return iso.slice(0, 10).replaceAll('-', '/') + ' ' + iso.slice(11, 19);
        throw new Error(`Unsupported date format ${pattern}`);
      },
    },
    UrlFetchApp: { fetch: (url, options) => {
      state.calls.push('identity.lookup');
      state.identityRequest = { url, options };
      if (state.identityThrows) throw new Error('private identity service error');
      return { getResponseCode: () => state.identityResponse?.status ?? 400, getContentText: () => state.identityResponse?.raw ?? JSON.stringify(state.identityResponse?.body ?? {}) };
    } },
    ContentService: { MimeType: { JSON: 'application/json' }, createTextOutput: text => ({ text, setMimeType() { return this; } }) },
  });
  vm.runInContext(source, context, { filename: gasPath });
  context.initSpreadsheet();
  if (!empty) {
    state.sheets[S].push(['STU-1', 'Synthetic Student One', 'Parent One', '000-1', 'Test Address One', '', 7, '2026-10-01']);
    state.sheets[S].push(['STU-2', 'Synthetic Student Two', 'Parent Two', '000-2', 'Test Address Two', '', 4, '2026-10-02']);
    state.sheets[R].push(['RIDE-1', 'STU-1', 'Synthetic Student One', '2026-10-20', '15:00', 'pickup', 'Test Point', 'scheduled', 'CAL-1', 'parent', '', '']);
    state.sheets[R].push(['RIDE-2', 'STU-2', 'Synthetic Student Two', '2026-10-20', '15:00', 'roundtrip', 'Other Point', 'scheduled', 'CAL-2', 'parent', '', '']);
    state.sheets[R].push(['RIDE-3', 'STU-1', 'Synthetic Student One', '2026-10-21', '15:00', 'dropoff', 'Test Point', 'cancelled', '', 'parent', '', '']);
    state.events['CAL-1'] = { title: 'Synthetic One' };
    state.events['CAL-2'] = { title: 'Synthetic Two' };
  }
  state.calls = [];
  function raw(body) { return JSON.parse(context.doPost({ postData: { contents: typeof body === 'string' ? body : JSON.stringify(body) } }).text); }
  function post(action, params = {}, token = adminKey) { return raw({ action, token, ...params }); }
  return {
    state, context, post, raw,
    snapshot: () => JSON.stringify({ sheets: state.sheets, events: state.events }),
    fail: (label, after = false, remaining = 1) => state.rules.push({ label, after, remaining }),
    balance: (index = 1) => state.sheets[S][index][6],
    ride: (index = 1) => state.sheets[R][index],
  };
}
function check(id, category, defects, name, work) {
  const begin = performance.now();
  const defectCases = { 'DEF-01': 'AT-15', 'DEF-02': 'AT-16', 'DEF-03': 'AT-17', 'DEF-04': 'AT-18', 'DEF-05': 'AT-19', 'DEF-06': 'AT-20' };
  const acceptanceIds = [...new Set(defects.map(defect => defectCases[defect]))];
  if (category === 'schema') acceptanceIds.push('AT-23');
  if (category === 'concurrency') acceptanceIds.push('AT-27');
  const detail = `Offline GAS VM assertion: ${name}. Google service interactions are stubs; related real integration acceptance remains pending.`;
  try {
    work();
    results.push({ id, category, defects, acceptanceIds, name, detail, status: 'PASS', durationMs: Math.round(performance.now() - begin) });
    console.log(`PASS ${id} ${name}`);
  } catch (error) {
    results.push({ id, category, defects, acceptanceIds, name, detail, status: 'FAIL', error: error.stack, durationMs: Math.round(performance.now() - begin) });
    console.error(`FAIL ${id} ${name}\n${error.stack}`);
  }
}
function rejected(result, code) { assert.equal(result.success, false); if (code) assert.equal(result.code, code); assert.ok(result.error); }
function unchanged(f, work, code) { const before = f.snapshot(); rejected(work(), code); assert.equal(f.snapshot(), before); assert.equal(f.state.locked, false); }
function released(f) { assert.equal(f.state.locked, false); assert.equal(f.state.acquisitions, f.state.releases); }
const reservation = { rideId: 'RIDE-NEW', studentId: 'STU-1', studentName: 'FORGED NAME', rideDate: '2026-10-23', rideTime: '16:30', rideType: 'pickup', pickupLocation: 'Synthetic School', reservedBy: 'teacher', note: 'Test note' };
const purchase = { purchaseId: 'PUR-NEW', studentId: 'STU-1', studentName: 'FORGED NAME', ticketCount: 3, amount: 3000, note: 'Test purchase' };
const newStudent = { id: 'STU-NEW', name: 'Synthetic New Student', parentName: 'Synthetic Parent', address: 'Synthetic Address', ticketBalance: 0 };

check('GAS-01', 'schema', [], 'Initialization keeps 8/12/7 columns, preserves data, adds no sample students', () => {
  const f = fixture({ empty: true });
  assert.deepEqual([S, R, P].map(name => [f.state.sheets[name].length, f.state.sheets[name][0].length]), [[1, 8], [1, 12], [1, 7]]);
  const g = fixture(); const before = g.snapshot(); g.context.initSpreadsheet(); assert.equal(g.snapshot(), before); released(g);
});
check('GAS-02', 'authentication', ['DEF-05'], 'GET cannot expose students/rides or invoke mutations', () => {
  const f = fixture(); const before = f.snapshot();
  for (const action of ['getStudents', 'getRides', 'createStudent', 'completeRide']) {
    const result = JSON.parse(f.context.doGet({ parameter: { action, token: adminKey } }).text);
    assert.equal(result.data, undefined); assert.equal(result.message, 'Eigo Taxi Link API Ready');
  }
  assert.equal(f.state.calls.length, 0); assert.equal(f.snapshot(), before);
});
check('GAS-03', 'authentication', ['DEF-05'], 'Every POST action rejects missing/invalid keys before accessing data', () => {
  const f = fixture(); const before = f.snapshot();
  for (const action of ['login', 'getStudents', 'getRides', 'createStudent', 'createReservation', 'cancelReservation', 'completeRide', 'addTickets']) {
    for (const token of [undefined, '', 'admin123', 'invalid-long-key-0000000000000000000000']) {
      rejected(f.raw({ action, token, role: 'admin', studentIds: ['STU-1', 'STU-2'] }), 'UNAUTHORIZED');
    }
  }
  assert.equal(f.snapshot(), before); assert.ok(!f.state.calls.some(call => call.startsWith('sheet:')));
});
check('GAS-04', 'authentication', ['DEF-05'], 'Missing/malformed/empty authentication configuration fails closed', () => {
  const f = fixture();
  for (const config of [undefined, '{', '{}', '[]', 'null']) {
    f.state.props.AUTH_USERS_JSON = config;
    unchanged(f, () => f.post('getStudents'), 'AUTH_NOT_CONFIGURED');
  }
  for (const user of [{ id: 'x', name: 'x', role: 'owner', studentIds: [] }, { id: 'x', name: 'x', role: 'admin' }, { id: 'x', name: 'x', role: 'parent', studentIds: [null] }]) {
    f.state.props.AUTH_USERS_JSON = JSON.stringify({ [hash(adminKey)]: user });
    rejected(f.post('login'), 'AUTH_NOT_CONFIGURED');
  }
});
check('GAS-05', 'authentication', ['DEF-05', 'DEF-06'], 'Login returns server principal and ignores client-supplied role/scopes', () => {
  const f = fixture();
  assert.deepEqual(f.post('login').data, { id: 'admin-1', name: 'Test Admin', role: 'admin', studentIds: [] });
  const parent = f.post('login', { role: 'admin', studentIds: ['STU-2'] }, parentKey);
  assert.deepEqual(parent.data, { id: 'parent-1', name: 'Test Parent One', role: 'parent', studentIds: ['STU-1'] });
  assert.ok(!JSON.stringify(parent).includes(parentKey));
});
check('GAS-06', 'parent-authorization', ['DEF-06'], 'Parent reads expose only mapped students and rides despite forged filters', () => {
  const f = fixture();
  assert.deepEqual(f.post('getStudents', { studentId: 'STU-2', role: 'admin' }, parentKey).data.map(x => x.id), ['STU-1']);
  assert.deepEqual(f.post('getRides', { studentIds: ['STU-2'] }, parentKey).data.map(x => x.id), ['RIDE-1', 'RIDE-3']);
  assert.deepEqual(f.post('getStudents', {}, otherKey).data.map(x => x.id), ['STU-2']);
  assert.deepEqual(f.post('getRides', {}, otherKey).data.map(x => x.id), ['RIDE-2']);
  assert.equal(f.post('getStudents').data.length, 2); assert.equal(f.post('getRides').data.length, 3);
  released(f);
});
check('GAS-07', 'parent-authorization', ['DEF-06'], 'A parent with no assignments receives no student or ride data', () => {
  const f = fixture(); assert.deepEqual(f.post('getStudents', {}, emptyKey).data, []); assert.deepEqual(f.post('getRides', {}, emptyKey).data, []);
  unchanged(f, () => f.post('createReservation', reservation, emptyKey), 'FORBIDDEN');
});
check('GAS-08', 'parent-authorization', ['DEF-05', 'DEF-06'], 'Parent cannot register students, add tickets or complete rides', () => {
  const f = fixture();
  for (const [action, params] of [['createStudent', newStudent], ['addTickets', purchase], ['completeRide', { rideId: 'RIDE-1' }]]) {
    unchanged(f, () => f.post(action, { ...params, role: 'admin', isAdmin: true }, parentKey), 'FORBIDDEN');
  }
  assert.ok(!f.state.calls.includes('calendar.create')); released(f);
});
check('GAS-09', 'parent-authorization', ['DEF-06'], 'Cross-family booking/cancellation uses authoritative student mapping', () => {
  const f = fixture();
  unchanged(f, () => f.post('createReservation', { ...reservation, studentId: 'STU-2' }, parentKey), 'FORBIDDEN');
  unchanged(f, () => f.post('cancelReservation', { rideId: 'RIDE-2', studentId: 'STU-1', calendarEventId: 'CAL-1' }, parentKey), 'FORBIDDEN');
  unchanged(f, () => f.post('cancelReservation', { rideId: 'RIDE-1', studentId: 'STU-2' }, otherKey), 'FORBIDDEN');
  assert.ok(!f.state.calls.some(call => call.startsWith('calendar.')));
});
check('GAS-10', 'parent-authorization', ['DEF-06'], 'Parent booking derives stored name/role and ignores supplied event ID', () => {
  const f = fixture(); const result = f.post('createReservation', { ...reservation, calendarEventId: 'CAL-2' }, parentKey);
  assert.equal(result.success, true); assert.equal(result.data.studentName, 'Synthetic Student One'); assert.equal(result.data.reservedBy, 'parent');
  assert.equal(result.data.calendarEventId, 'CAL-11'); assert.equal(f.state.events['CAL-11'].start, '2026-10-23T07:30:00.000Z');
  assert.ok(f.state.events['CAL-11'].title.includes('Synthetic Student One')); assert.ok(f.state.events['CAL-2']); released(f);
});
check('GAS-11', 'parent-authorization', ['DEF-06'], 'Cancellation affects only stored event ID and is idempotent', () => {
  const f = fixture(); assert.equal(f.post('cancelReservation', { rideId: 'RIDE-1', calendarEventId: 'CAL-2', studentId: 'STU-2' }, parentKey).success, true);
  assert.equal(f.ride()[7], 'cancelled'); assert.equal(f.state.events['CAL-1'], undefined); assert.ok(f.state.events['CAL-2']); assert.equal(f.balance(), 7);
  const before = f.snapshot(); assert.equal(f.post('cancelReservation', { rideId: 'RIDE-1' }, parentKey).replayed, true); assert.equal(f.snapshot(), before); released(f);
});
check('GAS-12', 'authentication', ['DEF-05', 'DEF-06'], 'Revocation and remapping take effect on the next request', () => {
  const f = fixture(); const users = JSON.parse(f.state.props.AUTH_USERS_JSON);
  users[hash(parentKey)].studentIds = ['STU-2']; f.state.props.AUTH_USERS_JSON = JSON.stringify(users);
  assert.deepEqual(f.post('getStudents', {}, parentKey).data.map(x => x.id), ['STU-2']);
  delete users[hash(parentKey)]; f.state.props.AUTH_USERS_JSON = JSON.stringify(users);
  unchanged(f, () => f.post('getStudents', {}, parentKey), 'UNAUTHORIZED');
});
check('GAS-13', 'completion', ['DEF-01'], 'Duplicate completion consumes only once, including after other purchases', () => {
  const f = fixture(); assert.deepEqual(f.post('completeRide', { rideId: 'RIDE-1' }), { success: true, remainingBalance: 6, consumedTickets: 1 });
  const before = f.snapshot(); assert.deepEqual(f.post('completeRide', { rideId: 'RIDE-1' }), { success: true, replayed: true, remainingBalance: 6, consumedTickets: 0 }); assert.equal(f.snapshot(), before);
  f.post('addTickets', purchase); assert.equal(f.post('completeRide', { rideId: 'RIDE-1' }).remainingBalance, 9); assert.equal(f.balance(), 9); released(f);
});
check('GAS-14', 'completion', ['DEF-01', 'DEF-03'], 'Roundtrip consumption is derived from stored type and tampering rejected', () => {
  const f = fixture();
  for (const count of [-1, 0, 1, 1.5, 3, '2', null, Infinity, NaN]) unchanged(f, () => f.post('completeRide', { rideId: 'RIDE-2', consumeTickets: count, rideType: 'pickup' }), 'INVALID_INPUT');
  assert.deepEqual(f.post('completeRide', { rideId: 'RIDE-2', consumeTickets: 2, studentId: 'STU-1', rideType: 'pickup' }), { success: true, remainingBalance: 2, consumedTickets: 2 });
  assert.equal(f.balance(), 7); assert.equal(f.balance(2), 2);
});
check('GAS-15', 'completion', ['DEF-02'], 'Cancelled completion and completed cancellation have no side effects', () => {
  const f = fixture(); unchanged(f, () => f.post('completeRide', { rideId: 'RIDE-3' }), 'INVALID_STATE');
  f.post('completeRide', { rideId: 'RIDE-1' }); unchanged(f, () => f.post('cancelReservation', { rideId: 'RIDE-1' }), 'INVALID_STATE'); released(f);
});
check('GAS-16', 'completion', ['DEF-01', 'DEF-03'], 'Insufficient/corrupt balances and missing targets never complete a ride', () => {
  const f = fixture(); f.state.sheets[S][1][6] = 0;
  unchanged(f, () => f.post('completeRide', { rideId: 'RIDE-1' }), 'INSUFFICIENT_TICKETS');
  f.state.sheets[S][1][6] = -1; unchanged(f, () => f.post('completeRide', { rideId: 'RIDE-1' }), 'INVALID_INPUT');
  f.state.sheets[S].splice(1, 1); unchanged(f, () => f.post('completeRide', { rideId: 'RIDE-1' }), 'NOT_FOUND');
  unchanged(f, () => f.post('completeRide', { rideId: 'RIDE-UNKNOWN' }), 'NOT_FOUND');
});
check('GAS-17', 'concurrency', ['DEF-01'], 'Contending completion cannot enter locked mutation, retry becomes replay', () => {
  const f = fixture(); let contending;
  f.state.hooks[`${S}.set:2:7`] = () => { contending = f.post('completeRide', { rideId: 'RIDE-1' }); };
  assert.equal(f.post('completeRide', { rideId: 'RIDE-1' }).success, true); rejected(contending, 'BUSY');
  assert.equal(f.post('completeRide', { rideId: 'RIDE-1' }).consumedTickets, 0); assert.equal(f.balance(), 6); released(f);
});
check('GAS-18', 'validation', ['DEF-03'], 'Negative/fraction/nonfinite/nonnumeric ticket quantities rejected before writes', () => {
  const f = fixture();
  for (const value of [-1, -0.5, 0, 1.5, 101, Infinity, NaN, null, '2', '', true, Number.MAX_SAFE_INTEGER + 1]) {
    unchanged(f, () => f.post('addTickets', { ...purchase, ticketCount: value }), 'INVALID_INPUT');
  }
  assert.ok(!f.state.calls.some(call => call.startsWith('property.set:'))); released(f);
});
check('GAS-19', 'validation', ['DEF-03'], 'Invalid amounts and initial balances rejected, zero amount allowed', () => {
  const f = fixture();
  for (const value of [-1, 0.1, Infinity, NaN, null, '0', Number.MAX_SAFE_INTEGER + 1]) {
    unchanged(f, () => f.post('addTickets', { ...purchase, amount: value }), 'INVALID_INPUT');
    unchanged(f, () => f.post('createStudent', { ...newStudent, ticketBalance: value }), 'INVALID_INPUT');
  }
  assert.equal(f.post('addTickets', { ...purchase, amount: 0 }).success, true); assert.equal(f.balance(), 10);
});
check('GAS-20', 'validation', ['DEF-03'], 'Safe-integer overflow, missing students and unknown IDs cause no writes', () => {
  const f = fixture(); f.state.sheets[S][1][6] = Number.MAX_SAFE_INTEGER;
  unchanged(f, () => f.post('addTickets', purchase), 'INVALID_INPUT');
  unchanged(f, () => f.post('addTickets', { ...purchase, studentId: 'STU-UNKNOWN' }), 'NOT_FOUND');
  unchanged(f, () => f.post('cancelReservation', { rideId: 'RIDE-UNKNOWN', rideDate: '2026-10-20', rideTime: '15:00' }), 'NOT_FOUND');
  unchanged(f, () => f.post('cancelReservation', { rideDate: '2026-10-20', rideTime: '15:00' }), 'INVALID_INPUT');
});
check('GAS-21', 'validation', ['DEF-03', 'DEF-04'], 'Invalid reservation date/time/type and empty fields precede calendar work', () => {
  const f = fixture();
  for (const patch of [{ rideDate: '2026-02-30' }, { rideDate: '2026-13-01' }, { rideTime: '24:00' }, { rideTime: '15:60' }, { rideType: 'other' }, { pickupLocation: '' }, { rideId: '' }, { studentId: 'STU-UNKNOWN' }]) {
    unchanged(f, () => f.post('createReservation', { ...reservation, ...patch }));
  }
  assert.ok(!f.state.calls.some(call => call.startsWith('calendar.')));
});
check('GAS-22', 'idempotency', ['DEF-01', 'DEF-04'], 'Reservation retry creates one event/row and rejects changed-payload collision', () => {
  const f = fixture(); const first = f.post('createReservation', reservation); assert.equal(first.success, true);
  const before = f.snapshot(); const replay = f.post('createReservation', reservation); assert.equal(replay.replayed, true); assert.deepEqual(replay.data, first.data); assert.equal(f.snapshot(), before);
  unchanged(f, () => f.post('createReservation', { ...reservation, rideTime: '17:00' }), 'ID_CONFLICT');
  assert.equal(f.state.calls.filter(x => x === 'calendar.create').length, 1); released(f);
});
check('GAS-23', 'idempotency', ['DEF-01', 'DEF-03'], 'Purchase retry credits once and collision never overwrites a previous purchase', () => {
  const f = fixture(); assert.deepEqual(f.post('addTickets', purchase), { success: true, newBalance: 10 });
  assert.equal(f.state.sheets[P][1][2], 'Synthetic Student One');
  const before = f.snapshot(); assert.equal(f.post('addTickets', purchase).replayed, true); assert.equal(f.snapshot(), before);
  for (const patch of [{ studentId: 'STU-2' }, { ticketCount: 4 }, { amount: 0 }, { note: 'other' }]) unchanged(f, () => f.post('addTickets', { ...purchase, ...patch }), 'ID_CONFLICT');
});
check('GAS-24', 'idempotency', ['DEF-04'], 'Student registration has stable-ID replay and rejects conflicting IDs', () => {
  const f = fixture(); const result = f.post('createStudent', newStudent); assert.equal(result.success, true); assert.equal(result.data.id, 'STU-NEW');
  const before = f.snapshot(); assert.equal(f.post('createStudent', newStudent).replayed, true); assert.equal(f.snapshot(), before);
  unchanged(f, () => f.post('createStudent', { ...newStudent, name: 'Different' }), 'ID_CONFLICT');
  assert.equal(f.state.sheets[S][3].length, 8);
});
check('GAS-25', 'failures', ['DEF-04'], 'Calendar creation exception is never success and retains an uncertainty guard', () => {
  for (const after of [false, true]) {
    const f = fixture(); f.fail('calendar.create', after); const response = f.post('createReservation', reservation);
    rejected(response, 'RECONCILIATION_REQUIRED'); assert.equal(f.state.sheets[R].length, 4); assert.ok(f.state.props[pending]);
    assert.ok(!JSON.stringify(response).includes('private-service-detail'));
    const calls = f.state.calls.length; rejected(f.post('createReservation', reservation), 'RECONCILIATION_REQUIRED');
    assert.ok(!f.state.calls.slice(calls).includes('calendar.create')); released(f);
  }
});
check('GAS-26', 'failures', ['DEF-04'], 'Reservation append failure before/after write removes event/row and allows retry', () => {
  for (const after of [false, true]) {
    const f = fixture(); f.fail(`${R}.append`, after); unchanged(f, () => f.post('createReservation', reservation), 'OPERATION_FAILED');
    assert.equal(f.state.props[pending], undefined); assert.equal(f.post('createReservation', reservation).success, true); assert.equal(f.state.sheets[R].length, 5); released(f);
  }
});
check('GAS-27', 'failures', ['DEF-01', 'DEF-04'], 'Completion rollback restores balance/status/timestamp for every failed write', () => {
  for (const label of [`${S}.set:2:7`, `${R}.set:2:8`, `${R}.set:2:12`, 'flush']) {
    for (const after of [false, true]) {
      const f = fixture(); f.fail(label, after); unchanged(f, () => f.post('completeRide', { rideId: 'RIDE-1' }), 'OPERATION_FAILED');
      assert.equal(f.state.props[pending], undefined); assert.equal(f.post('completeRide', { rideId: 'RIDE-1' }).remainingBalance, 6); released(f);
    }
  }
});
check('GAS-28', 'failures', ['DEF-03', 'DEF-04'], 'Purchase failures compensate both history and balance, retries credit once', () => {
  for (const label of [`${P}.append`, `${S}.set:2:7`]) for (const after of [false, true]) {
    const f = fixture(); f.fail(label, after); unchanged(f, () => f.post('addTickets', purchase), 'OPERATION_FAILED');
    assert.equal(f.post('addTickets', purchase).newBalance, 10); assert.equal(f.state.sheets[P].length, 2); released(f);
  }
});
check('GAS-29', 'failures', ['DEF-04'], 'Student create append failure compensates, no fabricated success row', () => {
  for (const after of [false, true]) {
    const f = fixture(); f.fail(`${S}.append`, after); unchanged(f, () => f.post('createStudent', newStudent), 'OPERATION_FAILED');
    assert.equal(f.post('createStudent', newStudent).success, true); assert.equal(f.state.sheets[S].length, 4); released(f);
  }
});
check('GAS-30', 'failures', ['DEF-04'], 'Calendar deletion failure never claims cancellation, blocks unsafe replay', () => {
  for (const after of [false, true]) {
    const f = fixture(); f.fail('calendar.delete:CAL-1', after);
    rejected(f.post('cancelReservation', { rideId: 'RIDE-1' }, parentKey), 'RECONCILIATION_REQUIRED');
    assert.equal(f.ride()[7], 'scheduled'); assert.equal(f.balance(), 7); assert.ok(f.state.props[pending]);
    rejected(f.post('cancelReservation', { rideId: 'RIDE-1' }, parentKey), 'RECONCILIATION_REQUIRED'); released(f);
  }
});
check('GAS-31', 'failures', ['DEF-04'], 'Cancellation sheet failure does not delete the calendar event', () => {
  for (const after of [false, true]) {
    const f = fixture(); f.fail(`${R}.set:2:8`, after); unchanged(f, () => f.post('cancelReservation', { rideId: 'RIDE-1' }), 'OPERATION_FAILED');
    assert.ok(!f.state.calls.includes('calendar.delete:CAL-1')); released(f);
  }
});
check('GAS-32', 'failures', ['DEF-04'], 'Read/calendar-lookup/missing-sheet errors propagate without data or mutation', () => {
  const f = fixture(); f.fail('calendar.get:CAL-1'); unchanged(f, () => f.post('cancelReservation', { rideId: 'RIDE-1' }), 'SERVICE_ERROR');
  f.fail(`${S}.read`); rejected(f.post('getStudents'), 'SERVICE_ERROR');
  delete f.state.sheets[R]; rejected(f.post('getRides'), 'NOT_INITIALIZED'); released(f);
});
check('GAS-33', 'failures', ['DEF-01', 'DEF-04'], 'Failed compensation keeps durable guard; login works but data/mutations block', () => {
  const f = fixture(); f.fail(`${R}.set:2:8`, false, 2);
  rejected(f.post('completeRide', { rideId: 'RIDE-1' }), 'RECONCILIATION_REQUIRED');
  assert.ok(f.state.props[pending]); assert.equal(f.balance(), 7);
  const before = f.snapshot(); for (const action of ['getStudents', 'getRides', 'addTickets', 'completeRide']) rejected(f.post(action, purchase), 'RECONCILIATION_REQUIRED');
  assert.equal(f.snapshot(), before); assert.equal(f.post('login').success, true); released(f);
});
check('GAS-34', 'failures', ['DEF-04'], 'Guard write failure prevents writes; failed guard deletion compensates safely', () => {
  const f = fixture(); f.fail(`property.set:${pending}`); unchanged(f, () => f.post('addTickets', purchase), 'SERVICE_ERROR');
  for (const after of [false, true]) {
    const g = fixture(); g.fail(`property.delete:${pending}`, after); unchanged(g, () => g.post('addTickets', purchase), 'OPERATION_FAILED');
    assert.equal(g.post('addTickets', purchase).newBalance, 10); released(g);
  }
});
check('GAS-35', 'failures', ['DEF-04'], 'After irreversible calendar deletion, guard-delete failure restores guard even if applied', () => {
  const f = fixture(); f.fail(`property.delete:${pending}`, true);
  rejected(f.post('cancelReservation', { rideId: 'RIDE-1' }), 'RECONCILIATION_REQUIRED'); assert.ok(f.state.props[pending]);
  assert.equal(f.state.events['CAL-1'], undefined); rejected(f.post('completeRide', { rideId: 'RIDE-1' }), 'RECONCILIATION_REQUIRED'); released(f);
});
check('GAS-36', 'validation', ['DEF-05'], 'Malformed JSON, unknown/prototype actions and remote init are rejected', () => {
  const f = fixture(); const before = f.snapshot();
  for (const raw of ['{', 'null', '[]', '12']) rejected(f.raw(raw), 'INVALID_REQUEST');
  for (const action of ['initSpreadsheet', 'constructor', '__proto__', 'unknown']) rejected(f.post(action), 'UNKNOWN_ACTION');
  assert.equal(f.snapshot(), before); released(f);
});
check('GAS-37', 'validation', ['DEF-04'], 'Duplicate authoritative IDs fail closed instead of updating an arbitrary row', () => {
  const f = fixture(); f.state.sheets[R].push([...f.ride()]); unchanged(f, () => f.post('completeRide', { rideId: 'RIDE-1' }), 'DATA_CONFLICT');
});
check('GAS-38', 'validation', ['DEF-04'], 'User text is stored as literal text and date cells normalize to JST', () => {
  const f = fixture(); assert.equal(f.post('createStudent', { ...newStudent, name: '=1+1' }).success, true);
  assert.equal(f.state.sheets[S][3][1], '=1+1');
  f.state.sheets[R][1][3] = new Date('2026-10-19T15:00:00Z'); f.state.sheets[R][1][4] = new Date('1899-12-30T06:00:00Z');
  const ride = f.post('getRides').data[0]; assert.equal(ride.rideDate, '2026-10-20'); assert.equal(ride.rideTime, '15:00');
});


check('GAS-39', 'portal', ['DEF-05','DEF-06'], 'Role-specific entries reject opposite roles and personal URL is bound to authenticated user', () => {
  const f=fixture();const users=JSON.parse(f.state.props.AUTH_USERS_JSON);
  const id='12345678-1234-4123-8123-123456789abc';users[hash(parentKey)].publicEntryId=id;f.state.props.AUTH_USERS_JSON=JSON.stringify(users);
  rejected(f.post('login',{portalRole:'parent'},adminKey),'PORTAL_MISMATCH');
  rejected(f.post('getStudents',{portalRole:'admin'},parentKey),'PORTAL_MISMATCH');
  assert.equal(f.post('login',{portalRole:'parent',entryId:id},parentKey).data.publicEntryId,id);
  rejected(f.post('login',{portalRole:'parent',entryId:id},otherKey),'ENTRY_REVOKED');
  rejected(f.post('login',{entryId:'bad'},parentKey),'ENTRY_REVOKED');
  rejected(f.post('login',{entryId:id},adminKey),'ENTRY_REVOKED');
});
check('GAS-40', 'portal', ['DEF-06'], 'Admin invitation directory exposes public metadata only and refuses parents', () => {
  const f=fixture();const users=JSON.parse(f.state.props.AUTH_USERS_JSON);
  users[hash(parentKey)].publicEntryId='12345678-1234-4123-8123-123456789abc';f.state.props.AUTH_USERS_JSON=JSON.stringify(users);
  const data=f.post('getPortalInvitations').data;
  assert.equal(data.length,1);assert.deepEqual(Object.keys(data[0]).sort(),['name','publicEntryId','userId']);
  assert.equal(JSON.stringify(data).includes(hash(parentKey)),false);
  rejected(f.post('getPortalInvitations',{},parentKey),'FORBIDDEN');
});
check('GAS-41', 'portal', ['DEF-06'], 'Rotated entry and disabled account are refused on the next request', () => {
  const f=fixture();const users=JSON.parse(f.state.props.AUTH_USERS_JSON);
  const old='12345678-1234-4123-8123-123456789abc';const fresh='12345678-1234-4123-8123-123456789abd';
  users[hash(parentKey)].publicEntryId=old;f.state.props.AUTH_USERS_JSON=JSON.stringify(users);
  assert.equal(f.post('getStudents',{entryId:old},parentKey).success,true);
  users[hash(parentKey)].publicEntryId=fresh;f.state.props.AUTH_USERS_JSON=JSON.stringify(users);
  rejected(f.post('getStudents',{entryId:old},parentKey),'ENTRY_REVOKED');
  assert.equal(f.post('getStudents',{entryId:fresh},parentKey).success,true);
  users[hash(parentKey)].active=false;f.state.props.AUTH_USERS_JSON=JSON.stringify(users);
  rejected(f.post('login',{entryId:fresh},parentKey),'UNAUTHORIZED');
  assert.equal(f.post('getPortalInvitations').data.length,0);
});
check('GAS-42', 'portal', ['DEF-06'], 'Duplicate or malformed configured public IDs fail closed', () => {
  const f=fixture();const users=JSON.parse(f.state.props.AUTH_USERS_JSON);
  users[hash(parentKey)].publicEntryId=users[hash(otherKey)].publicEntryId='12345678-1234-4123-8123-123456789abc';
  f.state.props.AUTH_USERS_JSON=JSON.stringify(users);
  rejected(f.post('login',{},parentKey),'AUTH_NOT_CONFIGURED');rejected(f.post('getPortalInvitations'),'AUTH_NOT_CONFIGURED');
  users[hash(parentKey)].publicEntryId='STU-1';f.state.props.AUTH_USERS_JSON=JSON.stringify(users);
  rejected(f.post('login',{},parentKey),'AUTH_NOT_CONFIGURED');
});

// Google verification uses synthetic JWTs plus a stubbed Google response.
// This proves request/authorization contracts, not real signatures or provider setup.
function googleFixture() {
  const f = fixture();
  delete f.state.props.AUTH_LEGACY_KEYS_ENABLED;
  const now = Math.floor(Date.now() / 1000);
  f.claims = { aud: 'eigo-taxi-app', iss: 'https://securetoken.google.com/eigo-taxi-app', sub: 'google-parent-uid',
    exp: now + 3600, iat: now - 10, auth_time: now - 100, email_verified: true, firebase: { sign_in_provider: 'google.com' } };
  f.users = {
    'google-parent-uid': { id: 'parent-1', name: 'Test Parent One', role: 'parent', studentIds: ['STU-1'], publicEntryId: '12345678-1234-4123-8123-123456789abc' },
    'google-admin-uid': { id: 'admin-1', name: 'Test Admin', role: 'admin', studentIds: [] },
  };
  f.state.props.AUTH_GOOGLE_JSON = JSON.stringify({ projectId: 'eigo-taxi-app', apiKey: 'synthetic-public-api-key-000000000000' });
  f.saveUsers = () => { f.state.props.AUTH_GOOGLE_USERS_JSON = JSON.stringify(f.users); };
  f.saveUsers();
  f.account = { localId: f.claims.sub, emailVerified: true, validSince: String(now - 200), providerUserInfo: [{ providerId: 'google.com' }] };
  f.state.identityResponse = { status: 200, body: { users: [f.account] } };
  f.token = (claims = f.claims, header = { alg: 'RS256', kid: 'synthetic-test-key' }) =>
    [header, claims].map(x => Buffer.from(JSON.stringify(x)).toString('base64url')).join('.') + '.synthetic_signature';
  f.googlePost = (action = 'login', params = {}) => f.raw({ action, idToken: f.token(), ...params });
  f.admin = () => { f.claims.sub = 'google-admin-uid'; f.account.localId = f.claims.sub; };
  return f;
}
check('GAS-43', 'google-auth', [], 'Legacy keys disabled by default; mixed Google/key credentials never downgrade', () => {
  const f = googleFixture(); rejected(f.post('login'), 'UNAUTHORIZED');
  f.state.props.AUTH_LEGACY_KEYS_ENABLED = 'true';
  rejected(f.googlePost('login', { token: adminKey }), 'UNAUTHORIZED');
  assert.equal(f.post('login').success, true);
});
check('GAS-44', 'google-auth', [], 'Google token verified by fixed configured project endpoint before allowlist role is returned', () => {
  const f = googleFixture(), r = f.googlePost();
  assert.equal(r.success, true); assert.deepEqual(r.data, f.users['google-parent-uid']);
  assert.equal(f.state.identityRequest.url, 'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=synthetic-public-api-key-000000000000');
  assert.deepEqual(JSON.parse(f.state.identityRequest.options.payload), { idToken: f.token() });
  assert.equal(f.state.identityRequest.options.followRedirects, false);
  assert.equal(f.state.acquisitions, f.state.releases);
});
check('GAS-45', 'google-auth', [], 'A decoded-looking token still needs Google verification; invalid signature response is refused', () => {
  const f = googleFixture(); f.state.identityResponse.status = 400;
  rejected(f.googlePost(), 'UNAUTHORIZED');
  assert.ok(f.state.calls.includes('identity.lookup'));
  assert.ok(!f.state.calls.some(x => x.startsWith('sheet:')));
});
check('GAS-46', 'google-auth', [], 'Wrong project/issuer, expired/future tokens and wrong provider fail closed before lookup', () => {
  const invalid = [{ aud: 'other-project' }, { iss: 'https://securetoken.google.com/other-project' }, { exp: 0 },
    { iat: Math.floor(Date.now() / 1000) + 100 }, { auth_time: Math.floor(Date.now() / 1000) + 100 },
    { sub: '' }, { email_verified: false }, { firebase: { sign_in_provider: 'password' } },
    { firebase: { sign_in_provider: 'google.com', tenant: 'unexpected' } }];
  for (const change of invalid) {
    const f = googleFixture(); rejected(f.googlePost('login', { idToken: f.token({ ...f.claims, ...change }) }), 'UNAUTHORIZED');
    assert.ok(!f.state.calls.includes('identity.lookup'));
  }
  const f = googleFixture(); rejected(f.googlePost('login', { idToken: f.token(f.claims, { alg: 'none', kid: 'x' }) }), 'UNAUTHORIZED');
});
check('GAS-47', 'google-auth', [], 'Lookup must resolve one enabled matching UID with verified Google identity', () => {
  for (const change of [{ localId: 'different-uid' }, { disabled: true }, { emailVerified: false },
    { providerUserInfo: [{ providerId: 'password' }] }, { tenantId: 'unexpected' }, { validSince: 'bad' }]) {
    const f = googleFixture(); Object.assign(f.account, change); rejected(f.googlePost(), 'UNAUTHORIZED');
  }
  for (const users of [[], [null], [{}, {}]]) {
    const f = googleFixture(); f.state.identityResponse.body.users = users; rejected(f.googlePost(), 'UNAUTHORIZED');
  }
});
check('GAS-48', 'google-auth', [], 'Revocation rejects tokens and refreshed tokens from an older login session', () => {
  const f = googleFixture(); f.account.validSince = String(f.claims.iat + 1); rejected(f.googlePost(), 'UNAUTHORIZED');
  f.account.validSince = String(f.claims.auth_time + 1); rejected(f.googlePost(), 'UNAUTHORIZED');
});
check('GAS-49', 'google-auth', [], 'Unregistered/disabled UID cannot access; malformed allowlist does not grant permissions', () => {
  const f = googleFixture(); delete f.users['google-parent-uid']; f.saveUsers(); rejected(f.googlePost(), 'ACCOUNT_NOT_REGISTERED');
  f.users['google-parent-uid'] = { active: false }; f.saveUsers(); rejected(f.googlePost(), 'ACCOUNT_NOT_REGISTERED');
  f.users['google-parent-uid'] = null; f.saveUsers(); rejected(f.googlePost(), 'AUTH_NOT_CONFIGURED');
});
check('GAS-50', 'google-auth', [], 'Parent identity remains restricted to its assigned records; admin API and mismatched entry refused', () => {
  const f = googleFixture(), entry = f.users['google-parent-uid'].publicEntryId;
  const result = f.googlePost('getStudents', { portalRole: 'parent', entryId: entry });
  assert.equal(result.success, true); assert.deepEqual(result.data.map(x => x.id), ['STU-1']);
  rejected(f.googlePost('login', { portalRole: 'admin' }), 'PORTAL_MISMATCH');
  rejected(f.googlePost('login', { entryId: '12345678-1234-4123-8123-123456789abd' }), 'ENTRY_REVOKED');
  rejected(f.googlePost('getPortalInvitations'), 'FORBIDDEN');
  rejected(f.googlePost('addTickets', { studentId: 'STU-1', ticketCount: 1, amount: 0 }), 'FORBIDDEN');
});
check('GAS-51', 'google-auth', [], 'Every API call rereads server allowlist; submitted roles/projects/keys cannot override it', () => {
  const f = googleFixture();
  assert.equal(f.googlePost('login', { role: 'admin', projectId: 'attacker', apiKey: 'attacker' }).data.role, 'parent');
  f.users['google-parent-uid'].active = false; f.saveUsers();
  rejected(f.googlePost('getStudents'), 'ACCOUNT_NOT_REGISTERED');
  assert.equal(f.state.calls.filter(x => x === 'identity.lookup').length, 2);
});
check('GAS-52', 'google-auth', [], 'Google admin invitation directory exposes only public user metadata', () => {
  const f = googleFixture(); f.admin();
  const r = f.googlePost('getPortalInvitations', { portalRole: 'admin' });
  assert.equal(r.success, true); assert.deepEqual(r.data, [{ userId: 'parent-1', name: 'Test Parent One', publicEntryId: f.users['google-parent-uid'].publicEntryId }]);
  assert.ok(!JSON.stringify(r).includes('google-parent-uid'));
});
check('GAS-53', 'google-auth', [], 'Lookup outage/HTTP failure/bad JSON returns failure without reading application data', () => {
  for (const variant of ['throw', '503', 'json']) {
    const f = googleFixture();
    if (variant === 'throw') f.state.identityThrows = true;
    if (variant === '503') f.state.identityResponse.status = 503;
    if (variant === 'json') f.state.identityResponse.raw = 'not-json';
    rejected(f.googlePost('getStudents'), 'AUTH_SERVICE_UNAVAILABLE');
    assert.ok(!f.state.calls.some(x => x.startsWith('sheet:')));
  }
});
check('GAS-54', 'google-auth', [], 'Missing server setup fails closed and demo-only URL cannot be registered for real access', () => {
  const f = googleFixture(), config = f.state.props.AUTH_GOOGLE_JSON;
  delete f.state.props.AUTH_GOOGLE_JSON; rejected(f.googlePost(), 'AUTH_NOT_CONFIGURED');
  f.state.props.AUTH_GOOGLE_JSON = config;
  f.users['google-parent-uid'].publicEntryId = '00000000-0000-4000-8000-000000000001'; f.saveUsers();
  rejected(f.googlePost(), 'AUTH_NOT_CONFIGURED');
});

const timestamp = new Date().toISOString();
check('GAS-55','account-management',[], 'Parents and legacy admins cannot manage Google accounts',()=>{
  const f=googleFixture();rejected(f.googlePost('getManagedUsers'),'FORBIDDEN');
  f.state.props.AUTH_LEGACY_KEYS_ENABLED='true';rejected(f.post('getManagedUsers'),'FORBIDDEN');
});
function manager() { const f=googleFixture();f.admin();f.revision=()=>f.googlePost('getManagedUsers').data.revision;return f; }
check('GAS-56','account-management',[], 'Admin pre-registers a parent email, generates opaque URL, returns no UID',()=>{
  const f=manager();const r=f.googlePost('saveManagedUser',{expectedRevision:f.revision(),name:'Family B',email:' Family.B@example.com ',role:'parent',active:true,studentIds:['STU-2']});
  assert.equal(r.success,true);const u=r.data.users.find(u=>u.email==='family.b@example.com');assert.equal(u.linked,false);assert.match(u.publicEntryId,/^[0-9a-f-]{36}$/);assert.ok(!JSON.stringify(r).includes('google-admin-uid'));
  assert.ok(!f.state.calls.some(call => call.startsWith('calendar.')));
});
check('GAS-57','account-management',[], 'First verified Google sign-in binds pending email to UID once; role cannot be self-selected',()=>{
  const f=manager();assert.equal(f.googlePost('saveManagedUser',{expectedRevision:f.revision(),name:'New Family',email:'new@example.com',role:'parent',active:true,studentIds:['STU-2']}).success,true);
  f.claims.sub=f.account.localId='new-uid';f.claims.email=f.account.email='new@example.com';
  const r=f.googlePost('login',{portalRole:'parent'});assert.equal(r.success,true);assert.deepEqual(r.data.studentIds,['STU-2']);
  const users=JSON.parse(f.state.props.AUTH_GOOGLE_USERS_JSON);assert.ok(users['new-uid']);assert.equal(users['email:new@example.com'],undefined);
  rejected(f.googlePost('getManagedUsers'),'FORBIDDEN');
});
check('GAS-58','account-management',[], 'Unverified/mismatched email or disabled pending account cannot claim registration',()=>{
  for(const mode of ['mismatch','disabled','unverified']){
    const f=manager();f.googlePost('saveManagedUser',{expectedRevision:f.revision(),name:'New',email:'new@example.com',role:'parent',active:mode!=='disabled',studentIds:['STU-1']});
    f.claims.sub=f.account.localId='new-uid';f.account.email='new@example.com';f.claims.email=mode==='mismatch'?'other@example.com':'new@example.com';if(mode==='unverified')f.account.emailVerified=false;
    assert.equal(f.googlePost().success,false);assert.equal(JSON.parse(f.state.props.AUTH_GOOGLE_USERS_JSON)['new-uid'],undefined);
  }
});
check('GAS-59','account-management',[], 'Self deletion/demotion/disable refused and stale revision cannot overwrite changes',()=>{
  const f=manager(),rev=f.revision();rejected(f.googlePost('deleteManagedUser',{userId:'admin-1',expectedRevision:rev}),'SELF_PROTECTION');
  rejected(f.googlePost('saveManagedUser',{userId:'admin-1',expectedRevision:rev,email:'admin@example.com',name:'Admin',role:'admin',active:false,studentIds:[]}),'SELF_PROTECTION');
  rejected(f.googlePost('saveManagedUser',{expectedRevision:'stale',email:'new@example.com',name:'New',role:'admin',active:true,studentIds:[]}),'CONFIG_CONFLICT');
});
check('GAS-60','account-management',[], 'Unknown students, duplicate emails and invalid input refused without config writes',()=>{
  const f=manager();const base={expectedRevision:f.revision(),email:'new@example.com',name:'New',role:'parent',active:true,studentIds:['missing']};rejected(f.googlePost('saveManagedUser',base),'INVALID_REQUEST');
  rejected(f.googlePost('saveManagedUser',{...base,email:'bad',studentIds:['STU-1']}),'INVALID_REQUEST');
  assert.equal(f.googlePost('saveManagedUser',{...base,studentIds:['STU-1']}).success,true);
  rejected(f.googlePost('saveManagedUser',{...base,expectedRevision:f.revision(),studentIds:['STU-1']}),'EMAIL_EXISTS');
});
check('GAS-61','account-management',[], 'Disable/delete applies to next request; URL rotation rejects old URL and keeps assigned family',()=>{
  const f=manager();const old=f.users['google-parent-uid'].publicEntryId;
  let r=f.googlePost('saveManagedUser',{userId:'parent-1',expectedRevision:f.revision(),email:'parent@example.com',name:'P',role:'parent',active:true,studentIds:['STU-1'],rotateEntry:true});assert.equal(r.success,true);
  f.claims.sub=f.account.localId='google-parent-uid';rejected(f.googlePost('getStudents',{entryId:old}),'ENTRY_REVOKED');
  f.admin();r=f.googlePost('saveManagedUser',{userId:'parent-1',expectedRevision:f.revision(),email:'parent@example.com',name:'P',role:'parent',active:false,studentIds:['STU-1']});assert.equal(r.success,true);
  f.claims.sub=f.account.localId='google-parent-uid';rejected(f.googlePost(),'ACCOUNT_NOT_REGISTERED');
  f.admin();assert.equal(f.googlePost('deleteManagedUser',{userId:'parent-1',expectedRevision:f.revision()}).success,true);
  f.claims.sub=f.account.localId='google-parent-uid';rejected(f.googlePost(),'ACCOUNT_NOT_REGISTERED');
});
check('GAS-62','account-management',[], 'Revoked admin while waiting for lock cannot mutate account permissions',()=>{
  const f=manager(),revision=f.revision(); f.state.hooks['property.get:PENDING_MUTATION_JSON']=()=>{const users=JSON.parse(f.state.props.AUTH_GOOGLE_USERS_JSON);users['google-admin-uid'].active=false;f.state.props.AUTH_GOOGLE_USERS_JSON=JSON.stringify(users);};
  rejected(f.googlePost('deleteManagedUser',{userId:'parent-1',expectedRevision:revision}),'ACCOUNT_NOT_REGISTERED');
});

// @trace REQ-05 GAS-63
check('GAS-63','trace-gap',[], 'Ten tickets credit 7 to 17 with exactly one matching purchase record',()=>{
 const f=fixture();assert.equal(f.post('addTickets',{...purchase,ticketCount:10,amount:10000}).success,true);
 assert.equal(f.balance(),17);assert.equal(f.state.sheets[P].length,2);
 const row=f.state.sheets[P][1];assert.equal(row[0],purchase.purchaseId);assert.equal(row[1],'STU-1');assert.equal(row[2],'Synthetic Student One');assert.equal(row[4],10);assert.equal(row[5],10000);
});
// @trace REQ-07 GAS-64
check('GAS-64','trace-gap',[], 'Dropoff persists time and type without consuming a ticket',()=>{
 const f=fixture();const r=f.post('createReservation',{...reservation,rideType:'dropoff',rideTime:'17:30'});assert.equal(r.success,true);assert.equal(r.data.rideType,'dropoff');assert.equal(r.data.rideTime,'17:30');assert.equal(f.balance(),7);assert.equal(f.state.sheets[R].filter(x=>x[0]===reservation.rideId).length,1);
});
// @trace REQ-08 GAS-65
check('GAS-65','trace-gap',[], 'Roundtrip is one scheduled record with balance 7 until completion then 5',()=>{
 const f=fixture();assert.equal(f.post('createReservation',{...reservation,rideType:'roundtrip'}).success,true);assert.equal(f.balance(),7);assert.equal(f.state.sheets[R].filter(x=>x[0]===reservation.rideId).length,1);assert.equal(f.post('completeRide',{rideId:reservation.rideId}).success,true);assert.equal(f.balance(),5);
});
// @trace REQ-11 GAS-66
check('GAS-66','trace-gap',[], 'Admin cancellation updates only target status and preserves both balances',()=>{
 const f=fixture();const other=JSON.stringify(f.ride(2));assert.equal(f.post('cancelReservation',{rideId:'RIDE-1'}).success,true);assert.equal(f.ride()[7],'cancelled');assert.equal(f.balance(),7);assert.equal(f.balance(2),4);assert.equal(JSON.stringify(f.ride(2)),other);
});
// @trace REQ-24 GAS-67
check('GAS-67','trace-gap',[], 'Calendar event shows reservation ID and binds event ID, name, JST time and location to sheet row without replay duplicates',()=>{
 const f=fixture();const r=f.post('createReservation',reservation);assert.equal(r.success,true);const row=f.state.sheets[R].find(x=>x[0]===reservation.rideId);const ev=f.state.events[row[8]];
 assert.ok(ev.title.includes('Synthetic Student One'));assert.equal(ev.start,'2026-10-23T07:30:00.000Z');assert.equal(ev.options.location,reservation.pickupLocation);assert.equal(row[0],r.data.id);assert.equal(row[8],r.data.calendarEventId);assert.equal(row[3],reservation.rideDate);assert.equal(row[4],reservation.rideTime);assert.equal(row[6],ev.options.location);
 assert.ok(ev.options.description.split('\n').includes('予約ID: '+row[0]));
 const before=f.snapshot();const replay=f.post('createReservation',reservation);assert.equal(replay.success,true);assert.equal(replay.replayed,true);assert.equal(replay.data.id,row[0]);assert.equal(replay.data.calendarEventId,row[8]);assert.equal(f.snapshot(),before);assert.equal(f.state.calls.filter(x=>x==='calendar.create').length,1);
});
// @trace REQ-25 GAS-68
check('GAS-68','trace-gap',[], 'Calendar cancellation adapter removes target event once preserving other event and balance',()=>{
 const f=fixture();assert.equal(f.post('cancelReservation',{rideId:'RIDE-1'}).success,true);assert.equal(f.state.events['CAL-1'],undefined);assert.ok(f.state.events['CAL-2']);assert.equal(f.ride()[7],'cancelled');assert.equal(f.balance(),7);f.post('cancelReservation',{rideId:'RIDE-1'});assert.equal(f.state.calls.filter(x=>x==='calendar.delete:CAL-1').length,1);
});
// @trace REQ-35 GAS-69
check('GAS-69','trace-gap',[], 'Direct sheet edit is read on next request without calculating balances or touching original copy and calendar',()=>{
 const f=fixture(),original=structuredClone(f.state.sheets);const calendar=JSON.stringify(f.state.events);f.state.sheets[R][1][2]='Manual correction';f.state.sheets[R][1][7]='completed';const start=f.state.calls.length;const data=f.post('getRides').data;assert.equal(data.find(x=>x.id==='RIDE-1').studentName,'Manual correction');assert.equal(f.balance(),7);assert.equal(JSON.stringify(f.state.events),calendar);assert.equal(original[R][1][7],'scheduled');assert.ok(!f.state.calls.slice(start).some(x=>x.startsWith('calendar.')||x.includes('.set:')));
});
// @trace REQ-37 GAS-70
check('GAS-70','trace-gap',[], 'Rescheduling is cancellation then separate creation with failure reconciliation and idempotent retry',()=>{
 const f=fixture();assert.equal(f.post('cancelReservation',{rideId:'RIDE-1'}).success,true);f.fail('calendar.create');const changed={...reservation,rideDate:'2026-10-24',pickupLocation:'Corrected location'};rejected(f.post('createReservation',changed),'RECONCILIATION_REQUIRED');assert.equal(f.ride()[7],'cancelled');assert.ok(!f.state.sheets[R].some(x=>x[0]===changed.rideId));const calls=f.state.calls.length;rejected(f.post('createReservation',changed),'RECONCILIATION_REQUIRED');assert.ok(!f.state.calls.slice(calls).includes('calendar.create'));assert.equal(f.balance(),7);const g=fixture();assert.equal(g.post('cancelReservation',{rideId:'RIDE-1'}).success,true);assert.equal(g.post('createReservation',changed).success,true);const snap=g.snapshot();assert.equal(g.post('createReservation',changed).replayed,true);assert.equal(g.snapshot(),snap);assert.equal(g.state.sheets[R].filter(x=>x[0]===changed.rideId).length,1);
});

function rejectedBeforeCalendarWrite(f, action, params, code) {
  const callStart = f.state.calls.length;
  unchanged(f, () => f.post(action, params), code);
  const calls = f.state.calls.slice(callStart);
  assert.ok(!calls.includes(`property.set:${pending}`));
  assert.ok(!calls.some(call => call === 'calendar.create' || call.startsWith('calendar.delete:')));
  released(f);
}

check('GAS-71', 'calendar-target', [], 'Absent or blank target ID rejects reservation and cancellation before calendar lookup', () => {
  for (const id of [undefined, '  ']) {
    const f = fixture(); f.state.props.TEST_CALENDAR_ID = id;
    rejectedBeforeCalendarWrite(f, 'createReservation', reservation, 'CALENDAR_NOT_CONFIGURED');
    rejectedBeforeCalendarWrite(f, 'cancelReservation', { rideId: 'RIDE-1' }, 'CALENDAR_NOT_CONFIGURED');
    assert.ok(!f.state.calls.some(call => call.startsWith('calendar.')));
  }
});
check('GAS-72', 'calendar-target', [], 'Missing scope consent, inaccessible calendar, primary, foreign owner and ID mismatch stop writes', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'gas/appsscript.json'), 'utf8'));
  assert.ok(manifest.oauthScopes.includes(calendarScope));
  const cases = [
    { configure: f => { f.state.calendarAuthorized = false; }, code: 'CALENDAR_AUTH_REQUIRED' },
    { configure: f => { f.state.calendars.delete(testCalendarId); }, code: 'CALENDAR_UNAVAILABLE' },
    { configure: f => { f.state.props.TEST_CALENDAR_ID = primaryCalendarId; }, code: 'CALENDAR_UNAVAILABLE' },
    { configure: f => { f.state.calendars.get(testCalendarId).owned = false; }, code: 'CALENDAR_UNAVAILABLE' },
    { configure: f => { f.state.calendars.get(testCalendarId).id = 'different'; }, code: 'CALENDAR_UNAVAILABLE' },
    { configure: f => { f.fail(`calendar.lookup:${testCalendarId}`, false, 2); }, code: 'SERVICE_ERROR' },
  ];
  for (const { configure, code } of cases) {
    const f = fixture(); configure(f);
    rejectedBeforeCalendarWrite(f, 'createReservation', reservation, code);
    rejectedBeforeCalendarWrite(f, 'cancelReservation', { rideId: 'RIDE-1' }, code);
  }
});
check('GAS-73', 'calendar-target', [], 'Stored event ID is mandatory and must resolve within the configured calendar', () => {
  const f = fixture();
  f.state.calendars.get(primaryCalendarId).events['CAL-1'] = { title: 'Other calendar event' };
  delete f.state.events['CAL-1'];
  rejectedBeforeCalendarWrite(f, 'cancelReservation', { rideId: 'RIDE-1', calendarEventId: 'CAL-2' }, 'CALENDAR_EVENT_MISMATCH');
  f.ride()[8] = '';
  rejectedBeforeCalendarWrite(f, 'cancelReservation', { rideId: 'RIDE-1' }, 'CALENDAR_EVENT_MISMATCH');
  assert.equal(f.state.calendars.get(primaryCalendarId).events['CAL-1'].title, 'Other calendar event');
});
check('GAS-74', 'calendar-target', [], 'Normal create/replay/cancel/replay touches only the configured calendar despite request overrides', () => {
  const f = fixture();
  const userInput = { calendarId: primaryCalendarId, calendarEventId: 'CAL-2', TEST_CALENDAR_ID: primaryCalendarId };
  const reserved = f.post('createReservation', { ...reservation, ...userInput }, parentKey);
  assert.equal(reserved.success, true);
  const eventId = reserved.data.calendarEventId;
  assert.ok(f.state.events[eventId]); assert.deepEqual(f.state.calendars.get(primaryCalendarId).events, {});
  f.state.calendars.get(primaryCalendarId).events[eventId] = { title: 'Independent copy' };
  assert.equal(f.post('createReservation', reservation, parentKey).replayed, true);
  assert.equal(f.post('cancelReservation', { rideId: reservation.rideId, ...userInput }, parentKey).success, true);
  delete f.state.props.TEST_CALENDAR_ID;
  assert.equal(f.post('cancelReservation', { rideId: reservation.rideId }, parentKey).replayed, true);
  assert.equal(f.state.events[eventId], undefined); assert.ok(f.state.events['CAL-2']);
  assert.equal(f.state.calendars.get(primaryCalendarId).events[eventId].title, 'Independent copy');
  assert.deepEqual(f.state.calls.filter(call => call.startsWith('calendar.lookup:')), Array(2).fill(`calendar.lookup:${testCalendarId}`));
  assert.equal(f.state.calls.filter(call => call === 'calendar.create').length, 1);
  assert.equal(f.state.calls.filter(call => call === `calendar.delete:${eventId}`).length, 1);
  released(f);
});

// These scenarios exercise both portals with the same verified UID and registry,
// without an intervening change by an administrator. Only synthetic fixtures run.
const reviewerCategory = 'scoped-reviewer';
const reviewEntry = '12345678-1234-4123-8123-999999999999';
const reviewerRegistration = { id: 'qa-1', name: 'Test Reviewer', email: 'review@example.invalid', role: 'reviewer',
  active: true, studentIds: ['STU-1'], publicEntryId: reviewEntry };
function reviewFixture() {
  const f = googleFixture();
  f.state.props[reviewSheetProp] = reviewSheetId;
  f.users['google-review-uid'] = structuredClone(reviewerRegistration); f.saveUsers();
  f.claims.sub = f.account.localId = 'google-review-uid';
  f.as = (portalRole, action, params = {}) => f.googlePost(action, { ...params, portalRole });
  return f;
}
function noChange(f, work, code) {
  const props = JSON.stringify(f.state.props), start = f.state.calls.length;
  unchanged(f, work, code);
  assert.equal(JSON.stringify(f.state.props), props); released(f);
  assert.ok(!f.state.calls.slice(start).some(k => k.startsWith('calendar.') || k.startsWith('property.set:') || k === 'scope.calendar'));
}
check('GAS-75', reviewerCategory, [], 'Same verified UID enters both views with only public fields, without Calendar access or registry changes', () => {
  const f = reviewFixture(), registry = f.state.props.AUTH_GOOGLE_USERS_JSON;
  f.state.calendarAuthorized = false;
  const expected = {id: 'qa-1', name: 'Test Reviewer', studentIds: ['STU-1'], reviewOnly: true};
  for (const portalRole of ['parent','admin','parent']) {
    const params = portalRole === 'parent' ? {entryId: reviewEntry} : {};
    assert.deepEqual(f.as(portalRole,'login',params).data, {...expected, role: portalRole, ...(portalRole === 'parent' ? {publicEntryId:reviewEntry} : {})});
  }
  assert.equal(f.state.props.AUTH_GOOGLE_USERS_JSON, registry);
  assert.ok(!f.state.calls.some(k => k === 'scope.calendar' || k.startsWith('calendar.') || k.startsWith('property.set:')));
});
check('GAS-76', reviewerCategory, [], 'Unspecified, invented, object-valued and mismatched routes or invitation IDs fail closed', () => {
  const f = reviewFixture();
  for (const portalRole of [undefined, 'reviewer','teacher','ADMIN',null,1,{},['admin']]) {
    noChange(f, () => f.googlePost('getStudents', { portalRole, role:'admin', reviewOnly: false }), 'PORTAL_MISMATCH');
  }
  for (const [role,entryId] of [['admin',reviewEntry],['parent',f.users['google-parent-uid'].publicEntryId]]) {
    noChange(f, () => f.as(role,'login',{entryId}), 'ENTRY_REVOKED');
  }
});
check('GAS-77', reviewerCategory, [], 'Both views list only assigned students and their rides despite forged permissions; foreign writes and ID collisions are refused', () => {
  const f = reviewFixture(), spoof = { studentIds:['STU-1','STU-2'],reviewOnly:false,role:'admin', googleUid:'google-admin-uid' };
  f.state.sheets[P].push(['PUR-OTHER','STU-2','Synthetic Student Two','2026-10-20',3,3000,'Private note']);
  for (const role of ['admin','parent']) {
    assert.deepEqual(f.as(role,'getStudents',spoof).data.map(s=>s.id),['STU-1']);
    assert.deepEqual(f.as(role,'getRides',spoof).data.map(r=>r.id),['RIDE-1','RIDE-3']);
    for (const [action,params] of [
      ['createReservation',{...reservation,studentId:'STU-2'}], ['createReservation',{...reservation,rideId:'RIDE-2'}],
      ['cancelReservation',{rideId:'RIDE-2',studentId:'STU-1',calendarEventId:'CAL-1'}],
      ['completeRide',{rideId:'RIDE-2',studentId:'STU-1'}], ['addTickets',{...purchase,studentId:'STU-2'}],
      ['addTickets',{...purchase,purchaseId:'PUR-OTHER'}],
    ]) noChange(f,()=>f.as(role,action,{...spoof,...params}),'FORBIDDEN');
  }
});
check('GAS-78', reviewerCategory, [], 'Neither reviewer view can create students, see invitations, or read, change or delete user configuration', () => {
  const f = reviewFixture(), spoof = { role:'admin', reviewOnly:false, userId:'admin-1', expectedRevision:'forged' };
  for (const role of ['admin','parent']) {
    for (const action of ['createStudent','getPortalInvitations','getManagedUsers','saveManagedUser','deleteManagedUser']) {
      noChange(f,()=>f.as(role,action,spoof),'FORBIDDEN');
    }
  }
  for (const [action,params] of [['addTickets',purchase],['completeRide',{rideId:'RIDE-1'}]]) {
    noChange(f,()=>f.as('parent',action,{...spoof,...params}),'FORBIDDEN');
  }
});
check('GAS-79', reviewerCategory, [], 'One reviewer books, cancels, adds tickets and completes across both views with server-derived operator, consumption and idempotence', () => {
  const f = reviewFixture(), registry = f.state.props.AUTH_GOOGLE_USERS_JSON;
  assert.equal(f.as('parent','createReservation',reservation).data.reservedBy,'parent');
  assert.equal(f.as('admin','cancelReservation',{rideId:reservation.rideId}).success,true);
  assert.equal(f.as('parent','cancelReservation',{rideId:reservation.rideId}).replayed,true);
  assert.equal(f.as('admin','addTickets',purchase).newBalance,10);
  assert.equal(f.as('admin','addTickets',purchase).replayed,true);
  assert.equal(f.as('admin','completeRide',{rideId:'RIDE-1'}).consumedTickets,1);
  const round = {...reservation,rideId:'RIDE-ROUND',rideType:'roundtrip'};
  assert.equal(f.as('admin','createReservation',round).data.reservedBy,'teacher');
  assert.equal(f.as('parent','createReservation',round).replayed,true);
  assert.equal(f.as('admin','completeRide',{rideId:round.rideId}).consumedTickets,2);
  assert.equal(f.as('admin','completeRide',{rideId:round.rideId}).consumedTickets,0);
  assert.equal(f.as('parent','getStudents').data[0].ticketBalance,7);
  assert.equal(f.balance(2),4); assert.ok(f.state.events['CAL-2']); assert.equal(f.state.sheets[P].length,2);
  assert.equal(f.state.props.AUTH_GOOGLE_USERS_JSON,registry); released(f);
});
check('GAS-80', reviewerCategory, [], 'Unpinned, blank, differently pinned or padded spreadsheet IDs deny reviewer use and provisioning and hide review capability', () => {
  for (const pin of [undefined,'','   ','another-sheet',reviewSheetId+' ']) {
    const f = reviewFixture(); f.state.props[reviewSheetProp] = pin;
    const spoof = {[reviewSheetProp]:reviewSheetId,spreadsheetId:reviewSheetId,reviewModeAvailable:true};
    for (const role of ['parent','admin']) {
      noChange(f,()=>f.as(role,'login',spoof),'REVIEW_UNAVAILABLE');
      noChange(f,()=>f.as(role,'createReservation',{...reservation,...spoof}),'REVIEW_UNAVAILABLE');
    }
    f.admin(); const listing=f.googlePost('getManagedUsers').data;
    assert.equal(listing.reviewModeAvailable,false);
    noChange(f,()=>f.googlePost('saveManagedUser',{...reviewerRegistration,...spoof,email:'fresh@example.invalid',expectedRevision:listing.revision}),'REVIEW_UNAVAILABLE');
    assert.ok(!f.googlePost('getPortalInvitations').data.some(x=>x.userId==='qa-1'));
    assert.equal(f.googlePost('getStudents').data.length,2);
  }
});
check('GAS-81', reviewerCategory, [], 'Reviewer requires a nonempty bounded valid scope and a valid unique invitation in the server registry', () => {
  for (const change of [{studentIds:[]},{studentIds:[null]},{studentIds:[' ']},{studentIds:['STU-1','STU-1']},
    {studentIds:Array.from({length:101},(_,i)=>'S-'+i)},{publicEntryId:undefined},{publicEntryId:'invalid'},
    {publicEntryId:'12345678-1234-4123-8123-123456789abc'}]) {
    const f=reviewFixture(); Object.assign(f.users['google-review-uid'],change);f.saveUsers();
    noChange(f,()=>f.as('admin','getStudents'),'AUTH_NOT_CONFIGURED');
  }
});
check('GAS-82', reviewerCategory, [], 'Verified pending email binds once only after valid reviewer route, entry, scope and workbook pin; both views then work', () => {
  for (const error of ['pin','scope','route','entry','email',null]) {
    const f=reviewFixture(), uid=f.account.localId, reg=f.users[uid], key='email:'+reg.email;
    delete f.users[uid];f.users[key]=reg;
    if(error==='scope') reg.studentIds=[];
    f.saveUsers();
    if(error==='pin') delete f.state.props[reviewSheetProp];
    f.account.email=reg.email;f.claims.email=error==='email'?'other@example.invalid':reg.email;
    const role=error==='route'?'reviewer':'parent', entryId=error==='entry'?f.users['google-parent-uid'].publicEntryId:reviewEntry;
    if(error) {
      const code={pin:'REVIEW_UNAVAILABLE',scope:'AUTH_NOT_CONFIGURED',route:'PORTAL_MISMATCH',entry:'ENTRY_REVOKED',email:'UNAUTHORIZED'}[error];
      noChange(f,()=>f.as(role,'login',{entryId}),code);
      continue;
    }
    assert.equal(f.as('parent','login',{entryId}).data.reviewOnly,true);
    assert.deepEqual(JSON.parse(f.state.props.AUTH_GOOGLE_USERS_JSON)[uid],reg);
    assert.ok(!Object.hasOwn(JSON.parse(f.state.props.AUTH_GOOGLE_USERS_JSON),key));
    assert.deepEqual(f.as('admin','getStudents').data.map(x=>x.id),['STU-1']);
    assert.equal(f.state.calls.filter(x=>x==='property.set:AUTH_GOOGLE_USERS_JSON').length,1);
  }
  // The server reserves email: keys for pending accounts, even if an Identity
  // Platform UID from an otherwise verified lookup happens to match this string.
  const f=reviewFixture(), pendingKey='email:'+reviewerRegistration.email;
  f.users[pendingKey]=f.users[f.account.localId];delete f.users[f.account.localId];f.saveUsers();
  f.account.localId=f.claims.sub=pendingKey;f.account.email=f.claims.email='other@example.invalid';
  noChange(f,()=>f.as('admin','login'),'UNAUTHORIZED');
});
check('GAS-83', reviewerCategory, [], 'Full admin can provision, rotate and retain reviewer links on role conversion and cannot bypass revision, student, self and uniqueness checks', () => {
  const f=manager();f.state.props[reviewSheetProp]=reviewSheetId;
  const rev=f.revision(),create={...reviewerRegistration,expectedRevision:rev};
  for(const studentIds of [[],['unknown'],['STU-2','STU-2']]) noChange(f,()=>f.googlePost('saveManagedUser',{...create,studentIds}),'INVALID_REQUEST');
  noChange(f,()=>f.googlePost('saveManagedUser',{...create,userId:'admin-1'}),'SELF_PROTECTION');
  const created=f.googlePost('saveManagedUser',create).data;
  assert.equal(created.reviewModeAvailable,true);const row=created.users.find(x=>x.email===create.email);
  assert.equal(row.linked,false);assert.match(row.publicEntryId,/^[0-9a-f-]{36}$/);assert.notEqual(row.publicEntryId,reviewEntry);
  assert.ok(f.googlePost('getPortalInvitations').data.some(x=>x.publicEntryId===row.publicEntryId));
  noChange(f,()=>f.googlePost('saveManagedUser',create),'CONFIG_CONFLICT');
  noChange(f,()=>f.googlePost('saveManagedUser',{...create,expectedRevision:f.revision()}),'EMAIL_EXISTS');
  const update=(role,rotateEntry=false)=>f.googlePost('saveManagedUser',{...create,userId:row.id,role,expectedRevision:f.revision(),rotateEntry}).data.users.find(x=>x.id===row.id);
  assert.equal(update('parent').publicEntryId,row.publicEntryId);
  assert.equal(update('reviewer').publicEntryId,row.publicEntryId);
  assert.notEqual(update('reviewer',true).publicEntryId,row.publicEntryId);
  assert.ok(!f.googlePost('getPortalInvitations').data.some(x=>x.publicEntryId===row.publicEntryId));
  assert.equal(f.googlePost('deleteManagedUser',{userId:row.id,expectedRevision:f.revision()}).success,true);
  assert.throws(()=>f.context.assertActiveAdmin_({'linked-uid':reviewerRegistration,'email:pending@example.invalid':{role:'admin',active:true}}),e=>e.apiCode==='LAST_ADMIN');
});
check('GAS-84', reviewerCategory, [], 'Regular Google and legacy users cannot select reviewer permissions even with the workbook pin enabled', () => {
  const f=reviewFixture();f.state.props.AUTH_LEGACY_KEYS_ENABLED='true';const spoof={role:'reviewer', reviewOnly:true, studentIds:['STU-2']};
  f.claims.sub=f.account.localId='google-parent-uid';
  assert.equal(f.as('parent','login',spoof).data.reviewOnly,undefined);
  noChange(f,()=>f.as('admin','getStudents',spoof),'PORTAL_MISMATCH');
  noChange(f,()=>f.post('login',{...spoof,portalRole:'admin'},parentKey),'PORTAL_MISMATCH');
  f.admin(); noChange(f,()=>f.as('parent','getStudents',spoof),'PORTAL_MISMATCH');
  noChange(f,()=>f.post('login',{...spoof,portalRole:'parent'},adminKey),'PORTAL_MISMATCH');
  assert.equal(f.as('admin','getStudents',spoof).data.length,2);
  const legacy=JSON.parse(f.state.props.AUTH_USERS_JSON);legacy[hash(adminKey)]=reviewerRegistration;
  f.state.props.AUTH_USERS_JSON=JSON.stringify(legacy);
  noChange(f,()=>f.post('login',{portalRole:'admin'},adminKey),'UNAUTHORIZED');
});
check('GAS-85', reviewerCategory, [], 'Recheck under lock pins the verified UID, current scope, role and spreadsheet before writing', () => {
  for(const mode of ['uid moved','scope reassigned','review disabled','role demoted']) {
    const f=reviewFixture();f.state.hooks['property.get:'+pending]=()=>{
      const reg=f.users['google-review-uid'];
      if(mode==='uid moved'){delete f.users['google-review-uid'];f.users['replacement-uid']=reg;}
      if(mode==='scope reassigned') reg.studentIds=['STU-2'];
      if(mode==='review disabled') delete f.state.props[reviewSheetProp];
      if(mode==='role demoted') reg.role='parent';
      f.saveUsers();
    };
    const code={'uid moved':'ACCOUNT_NOT_REGISTERED','scope reassigned':'FORBIDDEN','review disabled':'REVIEW_UNAVAILABLE','role demoted':'PORTAL_MISMATCH'}[mode];
    unchanged(f,()=>f.as('admin','addTickets',purchase),code);
    assert.ok(!f.state.calls.includes('property.set:'+pending));released(f);
  }
});

const passed = results.filter(x => x.status === 'PASS').length;
const report = {
  suite: 'gas-vm-contract-and-fault-injection', generatedAt: timestamp, execution: 'offline Node VM; Google services stubbed; no network/deployment',
  executedAt: timestamp, mode: 'GAS VM stubs, no real Google',
  counts: { total: results.length, passed, failed: results.length - passed },
  categoryCounts: Object.fromEntries([...new Set(results.map(x => x.category))].map(category => [category, results.filter(x => x.category === category).length])),
  sourceHashes: { 'gas/Code.gs': hash(fs.readFileSync(gasPath)), 'gas/appsscript.json': hash(fs.readFileSync(path.join(root, 'gas/appsscript.json'))), 'scripts/test_gas.cjs': hash(fs.readFileSync(__filename)) },
  limitations: ['Script lock contention is simulated, not a live concurrent GAS execution.', 'Real deployment identity, permissions, Calendar/Sheets behavior, network timeouts and cross-device parent isolation remain unverified.'],
  results,
};
const evidenceRoot = process.env.EIGO_TEST_OUTPUT_DIR || 'docs/acceptance/service-checks';
const outputDir = path.join(root, evidenceRoot, timestamp.replaceAll(':', '-').replaceAll('.', '-'));
fs.mkdirSync(outputDir, { recursive: true });
const reportPath = path.join(outputDir, 'gas-results.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(path.join(root, evidenceRoot, 'latest.json'), JSON.stringify({ ...report, reportFile: path.relative(root, reportPath).replaceAll('\\', '/') }, null, 2) + '\n');
console.log(`GAS: ${passed}/${results.length} passed; evidence: ${path.relative(root, reportPath)}`);
process.exitCode = passed === results.length ? 0 : 1;
