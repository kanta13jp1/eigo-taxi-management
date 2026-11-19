/* Offline contract/fault-injection tests. No Google/network calls or deployment. */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const gasPath = path.join(root, 'docs/acceptance/deployment/releases/603f482f7709d354/source/gas/Code.gs');
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

const f=googleFixture();
const parentUid=f.claims.sub;
f.users['google-admin-b-uid']={id:'admin-2',name:'Test Admin B',role:'admin',studentIds:[]};
f.saveUsers();
const as=(uid,role,action,params={})=>{f.claims.sub=uid;f.account.localId=uid;
 const r=f.googlePost(action,{portalRole:role,...(role==='parent'?{entryId:f.users[uid].publicEntryId}:{}),...params});assert.equal(r.success,true,JSON.stringify(r));return r;};
const book=as(parentUid,'parent','createReservation',reservation);
const adminA='google-admin-uid', adminB='google-admin-b-uid';
for(const [uid,role] of [[parentUid,'parent'],[adminA,'admin'],[adminB,'admin']])assert.equal(as(uid,role,'login').data.role,role);
const ride=(uid,role)=>as(uid,role,'getRides').data.find(r=>r.id===reservation.rideId);
const bal=(uid,role)=>as(uid,role,'getStudents').data.find(s=>s.id==='STU-1').ticketBalance;
assert.equal(ride(adminA,'admin').status,'scheduled');
assert.equal(bal(adminA,'admin'),7);
as(adminA,'admin','completeRide',{rideId:reservation.rideId});
for(const [uid,role] of [[adminB,'admin'],[parentUid,'parent']]){assert.equal(ride(uid,role).status,'completed');assert.equal(bal(uid,role),6);}
assert.deepEqual(as(parentUid,'parent','getStudents').data.map(s=>s.id),['STU-1']);
assert.ok(as(parentUid,'parent','getRides').data.every(r=>r.studentId==='STU-1'));
fs.writeFileSync(path.join(__dirname,'at26.json'),JSON.stringify({id:'AT-26',pass:true,scope:'Offline GAS simulated Google and shared ledger, three synthetic principals',scheduledSeenByAdminA:true,completedSeenByAdminBAndParent:true,ticketBalance:[7,6],parentIsolation:true,externalWrites:0},null,2));
