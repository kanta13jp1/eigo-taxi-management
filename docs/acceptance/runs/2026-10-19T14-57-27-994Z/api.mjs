const STORAGE_KEYS = {
    STUDENTS: 'eigo_taxi_students',
    RIDES: 'eigo_taxi_rides',
    PURCHASES: 'eigo_taxi_purchases',
    GAS_API_URL: 'eigo_taxi_gas_api_url',
};
// ローカルタイム（JST）基準で YYYY-MM-DD を取得するヘルパー
export function getLocalDateString(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
// 初期モックデータ
const INITIAL_STUDENTS = [
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
        ticketBalance: 1, // 残少
        createdAt: '2026-09-10',
    },
    {
        id: 'STU-003',
        name: '高橋 莉子 (りこ)',
        parentName: '高橋 智子',
        phone: '090-5555-6666',
        address: '東京都世田谷区弦巻3-8-1',
        pickupNote: '自宅玄関先までお越しください',
        ticketBalance: 0, // 残りなし
        createdAt: '2026-09-15',
    },
];
const INITIAL_RIDES = [
    {
        id: 'RIDE-101',
        studentId: 'STU-001',
        studentName: '田中 陽菜 (ひな)',
        rideDate: getLocalDateString(), // 今日
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
        rideDate: getLocalDateString(), // 今日
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
];
const INITIAL_PURCHASES = [
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
];
// LocalStorageヘルパー
function getStored(key, defaultVal) {
    const item = localStorage.getItem(key);
    if (!item) {
        localStorage.setItem(key, JSON.stringify(defaultVal));
        return JSON.parse(JSON.stringify(defaultVal));
    }
    try {
        return JSON.parse(item);
    }
    catch {
        return JSON.parse(JSON.stringify(defaultVal));
    }
}
function setStored(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
}
const SESSION_KEY = 'eigo_taxi_session';
const failureMessage = '通信または連携処理に失敗しました。登録結果を確認してから再操作してください。';
function getSession() {
    try {
        const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
        if (!session || !['demo', 'live'].includes(session.mode) || !session.user || !['admin', 'parent'].includes(session.user.role) || !Array.isArray(session.user.studentIds))
            return null;
        if (session.mode === 'live' && (!session.token || !session.endpoint))
            return null;
        return session;
    }
    catch {
        return null;
    }
}
function requireSession(admin = false) {
    const session = getSession();
    if (!session)
        throw new Error('ログインしてください');
    if (admin && session.user.role !== 'admin')
        throw new Error('管理者権限が必要です');
    return session;
}
function assertStudent(session, id) {
    if (session.user.role !== 'admin' && !session.user.studentIds.includes(id))
        throw new Error('この生徒にはアクセスできません');
}
function isDemo(session) { return session.mode === 'demo'; }
function validateEndpoint(value) {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)))
        throw new Error('HTTPSの接続先を指定してください');
    if (url.username || url.password || url.search || url.hash)
        throw new Error('認証情報やクエリを含まない接続先を指定してください');
    return url.href.replace(/\/$/, '');
}
async function request(endpoint, token, action, params = {}) {
    try {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ ...params, action, token }), signal: AbortSignal.timeout(20000), credentials: 'omit', referrerPolicy: 'no-referrer' });
        if (!res.ok)
            throw new Error(failureMessage);
        const json = await res.json();
        if (json?.success !== true)
            throw new Error(json?.error || failureMessage);
        return json;
    }
    catch (error) {
        throw new Error(error instanceof Error ? error.message : failureMessage);
    }
}
async function live(session, action, params = {}) {
    if (session.mode !== 'live' || !session.endpoint || !session.token)
        throw new Error('接続済みの認証が必要です');
    return request(session.endpoint, session.token, action, params);
}
async function mutation(session, action, params, idField, prefix) {
    const storageKey = 'eigo_taxi_pending_mutations';
    const key = JSON.stringify([session.endpoint, session.user.id, action, Object.fromEntries(Object.entries(params).sort(([a], [b]) => a.localeCompare(b)))]);
    const pending = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
    const operationId = pending[key] || prefix + crypto.randomUUID();
    pending[key] = operationId;
    sessionStorage.setItem(storageKey, JSON.stringify(pending));
    const result = await live(session, action, { ...params, [idField]: operationId });
    const remaining = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
    delete remaining[key];
    sessionStorage.setItem(storageKey, JSON.stringify(remaining));
    return result;
}
function positiveCount(value) {
    if (!Number.isSafeInteger(value) || value < 1 || value > 100)
        throw new Error('枚数は1〜100の整数で指定してください');
}
function validAmount(value) {
    if (!Number.isSafeInteger(value) || value < 0)
        throw new Error('金額は0以上の整数で指定してください');
}
function allStudents() { return getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS); }
function allRides() { return getStored(STORAGE_KEYS.RIDES, INITIAL_RIDES); }
function getRide(session, id) {
    const ride = allRides().find(r => r.id === id);
    if (!ride)
        throw new Error('送迎が見つかりません');
    assertStudent(session, ride.studentId);
    return ride;
}
export const ApiService = {
    getSession,
    logout() { sessionStorage.removeItem(SESSION_KEY); },
    enterDemo(role) {
        // Explicit sandbox: synthetic local data only. This session is never sent to GAS.
        const session = { mode: 'demo', user: { id: 'demo-' + role, name: role === 'admin' ? '管理者デモ' : '保護者デモ', role, studentIds: role === 'parent' ? ['STU-001'] : [] } };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
    },
    async login(endpoint, token) {
        this.logout();
        const target = validateEndpoint(endpoint);
        const response = await request(target, token, 'login');
        const user = response.data;
        if (!user || !['admin', 'parent'].includes(user.role) || !Array.isArray(user.studentIds))
            throw new Error('認証応答が不正です');
        const session = { mode: 'live', user, endpoint: target, token };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(STORAGE_KEYS.GAS_API_URL, target);
        return session;
    },
    getGasApiUrl() { return localStorage.getItem(STORAGE_KEYS.GAS_API_URL) || ''; },
    setGasApiUrl(url) {
        requireSession(true);
        const target = url.trim() ? validateEndpoint(url) : '';
        const session = getSession();
        if (session?.mode === 'live' && target !== session.endpoint)
            throw new Error('接続先の変更はログアウト後に行ってください');
        localStorage.setItem(STORAGE_KEYS.GAS_API_URL, target);
    },
    async getStudents() {
        const session = requireSession();
        if (!isDemo(session))
            return (await live(session, 'getStudents')).data;
        return allStudents().filter(s => session.user.role === 'admin' || session.user.studentIds.includes(s.id));
    },
    async getStudentById(id) {
        assertStudent(requireSession(), id);
        return (await this.getStudents()).find(s => s.id === id);
    },
    async createStudent(student) {
        const session = requireSession(true);
        if (!student.name.trim() || !student.address.trim() || !Number.isSafeInteger(student.ticketBalance) || student.ticketBalance < 0)
            throw new Error('氏名・住所・正しい初期残高を指定してください');
        if (!isDemo(session))
            return (await mutation(session, 'createStudent', student, 'id', 'STU-')).data;
        const students = allStudents();
        const created = { ...student, id: 'STU-' + crypto.randomUUID(), createdAt: getLocalDateString() };
        students.push(created);
        setStored(STORAGE_KEYS.STUDENTS, students);
        return created;
    },
    async getRides() {
        const session = requireSession();
        const rides = isDemo(session) ? allRides() : (await live(session, 'getRides')).data;
        return rides.filter(r => session.user.role === 'admin' || session.user.studentIds.includes(r.studentId))
            .sort((a, b) => (b.rideDate + ' ' + b.rideTime).localeCompare(a.rideDate + ' ' + a.rideTime));
    },
    async createReservation(params) {
        const session = requireSession();
        assertStudent(session, params.studentId);
        if (!['pickup', 'dropoff', 'roundtrip'].includes(params.rideType) || !/^\d{4}-\d{2}-\d{2}$/.test(params.rideDate) || !/^\d{2}:\d{2}$/.test(params.rideTime) || !params.pickupLocation.trim())
            throw new Error('予約の必須項目を確認してください');
        const reservedBy = session.user.role === 'admin' ? 'teacher' : 'parent';
        if (!isDemo(session))
            return (await mutation(session, 'createReservation', { ...params, reservedBy }, 'rideId', 'RIDE-')).data;
        const rideId = 'RIDE-' + crypto.randomUUID();
        const student = allStudents().find(s => s.id === params.studentId);
        if (!student)
            throw new Error('生徒が見つかりません');
        const ride = { ...params, reservedBy, id: rideId, studentName: student.name, status: 'scheduled', calendarEventId: '', note: params.note || '' };
        const rides = allRides();
        rides.unshift(ride);
        setStored(STORAGE_KEYS.RIDES, rides);
        return ride;
    },
    async cancelReservation(rideId) {
        const session = requireSession();
        if (!isDemo(session)) {
            await live(session, 'cancelReservation', { rideId });
            return true;
        }
        const ride = getRide(session, rideId);
        if (ride.status === 'cancelled')
            return true;
        if (ride.status !== 'scheduled')
            throw new Error('完了済みの予約はキャンセルできません');
        setStored(STORAGE_KEYS.RIDES, allRides().map(r => r.id === rideId ? { ...r, status: 'cancelled' } : r));
        return true;
    },
    async completeRide(rideId, consumeTickets) {
        const session = requireSession(true);
        if (!isDemo(session))
            return await live(session, 'completeRide', { rideId, ...(consumeTickets === undefined ? {} : { consumeTickets }) });
        const ride = getRide(session, rideId);
        const students = allStudents();
        const student = students.find(s => s.id === ride.studentId);
        if (!student)
            throw new Error('生徒が見つかりません');
        if (ride.status === 'completed')
            return { success: true, remainingBalance: student.ticketBalance, consumedTickets: 0 };
        if (ride.status !== 'scheduled')
            return { success: false };
        const consume = ride.rideType === 'roundtrip' ? 2 : 1;
        if (consumeTickets !== undefined && consumeTickets !== consume)
            throw new Error('消費枚数が送迎区分と一致しません');
        if (student.ticketBalance < consume)
            throw new Error('チケット残数が不足しています。追加後に完了処理してください');
        student.ticketBalance -= consume;
        const completedAt = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
        setStored(STORAGE_KEYS.STUDENTS, students);
        setStored(STORAGE_KEYS.RIDES, allRides().map(r => r.id === rideId ? { ...r, status: 'completed', completedAt } : r));
        return { success: true, remainingBalance: student.ticketBalance, consumedTickets: consume };
    },
    async addTickets(params) {
        const session = requireSession(true);
        positiveCount(params.ticketCount);
        validAmount(params.amount);
        const purchaseId = 'PUR-' + crypto.randomUUID();
        if (!isDemo(session))
            return await mutation(session, 'addTickets', params, 'purchaseId', 'PUR-');
        const students = allStudents();
        const student = students.find(s => s.id === params.studentId);
        if (!student)
            throw new Error('生徒が見つかりません');
        if (!Number.isSafeInteger(student.ticketBalance + params.ticketCount))
            throw new Error('残高が上限を超えます');
        student.ticketBalance += params.ticketCount;
        const purchases = getStored(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
        purchases.unshift({ ...params, id: purchaseId, studentName: student.name, purchaseDate: getLocalDateString(), note: params.note || '' });
        setStored(STORAGE_KEYS.STUDENTS, students);
        setStored(STORAGE_KEYS.PURCHASES, purchases);
        return { success: true, newBalance: student.ticketBalance };
    },
    resetToMock() {
        const session = requireSession(true);
        if (!isDemo(session))
            throw new Error('デモ専用操作です');
        [STORAGE_KEYS.STUDENTS, STORAGE_KEYS.RIDES, STORAGE_KEYS.PURCHASES].forEach(k => localStorage.removeItem(k));
    },
    purgeAllData() {
        const session = requireSession(true);
        if (!isDemo(session))
            throw new Error('デモ専用操作です');
        setStored(STORAGE_KEYS.STUDENTS, []);
        setStored(STORAGE_KEYS.RIDES, []);
        setStored(STORAGE_KEYS.PURCHASES, []);
    },
};
