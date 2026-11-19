import type { Student, RideReservation, TicketPurchase, RideType } from '../types';
import { assertPortal, DEMO_ENTRY_ID, ENTRY_ID } from '../portal';
import type { PortalRoute } from '../portal';
import { getDeploymentConfig, requireGoogleConfig } from '../deployment-config';
import { getGoogleIdToken, signInGoogle, signOutGoogle } from './google-auth';

const STORAGE_KEYS = {
  STUDENTS: 'eigo_taxi_students',
  RIDES: 'eigo_taxi_rides',
  PURCHASES: 'eigo_taxi_purchases',
};

// ローカルタイム（JST）基準で YYYY-MM-DD を取得するヘルパー
export function getLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 初期モックデータ
const INITIAL_STUDENTS: Student[] = [
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

const INITIAL_RIDES: RideReservation[] = [
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

const INITIAL_PURCHASES: TicketPurchase[] = [
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
function getStored<T>(key: string, defaultVal: T): T {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return JSON.parse(JSON.stringify(defaultVal));
  }
  try {
    return JSON.parse(item);
  } catch {
    return JSON.parse(JSON.stringify(defaultVal));
  }
}

function setStored<T>(key: string, val: T): void {
  localStorage.setItem(key, JSON.stringify(val));
}


export type AppUser = { id: string; name: string; role: 'admin' | 'parent'; studentIds: string[]; publicEntryId?: string; reviewOnly?: boolean };
export type AppSession = { mode: 'demo' | 'live'; user: AppUser; firebaseUid?: string; firebaseProjectId?: string; endpoint?: string; entryId?: string };
export type PortalInvitation = { userId: string; name: string; publicEntryId: string };
export type ManagedRole = 'admin' | 'parent' | 'reviewer';
export type ManagedUser = Omit<AppUser, 'role'> & { role: ManagedRole; email: string; active: boolean; linked: boolean };
export type ManagedUsers = { users: ManagedUser[]; revision: string; reviewModeAvailable?: boolean };
export type ManagedUserInput = { userId?: string; name: string; email: string; role: ManagedRole; active: boolean; studentIds: string[]; rotateEntry?: boolean };
const SESSION_KEY = 'eigo_taxi_session';
let sessionRevision = 0;
type ReservationInput = {studentId:string;rideDate:string;rideTime:string;rideType:RideType;pickupLocation:string;note?:string;reservedBy:'parent'|'teacher'};
const failureMessage = '通信または連携処理に失敗しました。登録結果を確認してから再操作してください。';
function validAppUser(user: AppUser): boolean {
  return !!user && ['admin','parent'].includes(user.role) && Array.isArray(user.studentIds) &&
    user.studentIds.every(id => typeof id === 'string') &&
    (user.reviewOnly === undefined || typeof user.reviewOnly === 'boolean') &&
    (!user.reviewOnly || user.studentIds.length > 0);
}
function getSession(): AppSession | null {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') as AppSession | null;
    if (!session || !['demo','live'].includes(session.mode) || !validAppUser(session.user)) return null;
    // Old browser endpoint preferences and legacy-key sessions are never used.
    if (session.mode === 'live' && (!session.firebaseUid || session.firebaseProjectId !== requireGoogleConfig().projectId ||
        session.endpoint !== getDeploymentConfig().gasApiUrl)) return null;
    return session;
  } catch { return null; }
}
function requireSession(admin = false): AppSession {
  const session = getSession();
  if (!session) throw new Error('ログインしてください');
  if (admin && session.user.role !== 'admin') throw new Error('管理者権限が必要です');
  return session;
}
function requireFullAdmin(): AppSession {
  const session = requireSession(true);
  if (session.user.reviewOnly) throw new Error('検証専用アカウントではこの管理操作はできません');
  return session;
}
function assertStudent(session: AppSession, id: string) {
  if ((session.user.role !== 'admin' || session.user.reviewOnly) && !session.user.studentIds.includes(id)) throw new Error('この生徒にはアクセスできません');
}
function mayAccessStudent(session: AppSession, id: string): boolean {
  return session.user.role === 'admin' && !session.user.reviewOnly || session.user.studentIds.includes(id);
}
async function assertReviewRide(session: AppSession, rideId: string): Promise<void> {
  if (!session.user.reviewOnly || isDemo(session)) return;
  const rides = (await live(session, 'getRides')).data as RideReservation[];
  const ride = rides.find(item => item.id === rideId);
  if (!ride) throw new Error('この送迎にはアクセスできません');
  assertStudent(session, ride.studentId);
}
function isDemo(session:AppSession): boolean { return session.mode === 'demo'; }
// @trace CODE-34 REQ-34
function endSession(): void {
  sessionRevision++;
  sessionStorage.removeItem(SESSION_KEY);
  void signOutGoogle().catch(() => {});
  window.dispatchEvent(new Event('eigo-taxi-session-ended'));
}
// @trace CODE-18 REQ-18
async function request(endpoint:string, idToken:string, action:string, params:object = {}, expectedSession?:AppSession): Promise<Record<string, unknown>> {
  try {
    const res = await fetch(endpoint, {method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...params,action,idToken}),signal:AbortSignal.timeout(20000),credentials:'omit',referrerPolicy:'no-referrer'});
    if (!res.ok) throw new Error(failureMessage);
    const json = await res.json();
    if (json?.success !== true) {
      const active=getSession();
      if (['UNAUTHORIZED','AUTH_NOT_CONFIGURED','ACCOUNT_NOT_REGISTERED','PORTAL_MISMATCH','ENTRY_REVOKED','REVIEW_UNAVAILABLE'].includes(json?.code) &&
          expectedSession && JSON.stringify(active) === JSON.stringify(expectedSession)) {
        endSession();
      }
      throw new Error(json?.error || failureMessage);
    }
    return json;
  } catch (error) {
    if (error instanceof TypeError || error instanceof SyntaxError || (error instanceof DOMException && error.name === 'TimeoutError')) throw new Error(failureMessage);
    throw new Error(error instanceof Error ? error.message : failureMessage);
  }
}
async function live(session:AppSession,action:string,params:object = {}) {
  if (session.mode !== 'live' || !session.endpoint || !session.firebaseUid) throw new Error('接続済みの認証が必要です');
  let idToken: string;
  try { idToken = await getGoogleIdToken(session.firebaseUid); }
  catch {
    if (JSON.stringify(getSession()) === JSON.stringify(session)) endSession();
    throw new Error('もう一度ログインしてください。');
  }
  if (JSON.stringify(getSession()) !== JSON.stringify(session)) throw new Error('ログイン状態が変わりました。');
  const result=await request(session.endpoint, idToken, action, {...params, portalRole:session.user.role, ...(session.entryId ? {entryId:session.entryId} : {})}, session);
  if (['getStudents','getRides','getPortalInvitations'].includes(action) && !Array.isArray(result.data)) {
    throw new Error('台帳の応答形式を確認できませんでした。表示件数は未確認です。再取得しても変わらない場合は担当者へ連絡してください。');
  }
  if (JSON.stringify(getSession())!==JSON.stringify(session)) throw new Error('ログイン状態が変わりました。処理結果を管理者に確認してください');
  return result;
}
async function mutation(session:AppSession,action:string,params:object,idField:string,prefix:string) {
  const storageKey='eigo_taxi_pending_mutations';
  const key=JSON.stringify([session.endpoint,session.user.id,action,Object.fromEntries(Object.entries(params).sort(([a],[b])=>a.localeCompare(b)))]);
  const pending:Record<string,string>=JSON.parse(sessionStorage.getItem(storageKey)||'{}');
  const operationId=pending[key]||prefix+crypto.randomUUID();
  pending[key]=operationId;sessionStorage.setItem(storageKey,JSON.stringify(pending));
  const result=await live(session,action,{...params,[idField]:operationId});
  const remaining:Record<string,string>=JSON.parse(sessionStorage.getItem(storageKey)||'{}');
  delete remaining[key];sessionStorage.setItem(storageKey,JSON.stringify(remaining));
  return result;
}
function positiveCount(value:number) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 100) throw new Error('枚数は1〜100の整数で指定してください');
}
function validAmount(value:number) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('金額は0以上の整数で指定してください');
}
function allStudents():Student[] { return getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS); }
function allRides():RideReservation[] { return getStored(STORAGE_KEYS.RIDES, INITIAL_RIDES); }
function getRide(session:AppSession,id:string):RideReservation {
  const ride = allRides().find(r=>r.id===id);
  if (!ride) throw new Error('送迎が見つかりません');
  assertStudent(session,ride.studentId);
  return ride;
}
export const ApiService = {
  getSession,
  async getManagedUsers():Promise<ManagedUsers> {
    const session=requireFullAdmin();
    if(isDemo(session)) throw new Error('アカウント管理はGoogleログインした管理者だけが利用できます。');
    const response=await live(session,'getManagedUsers');
    const data=response.data as ManagedUsers;
    if(!data||!Array.isArray(data.users)||typeof data.revision!=='string')throw new Error('アカウント一覧を確認できませんでした');
    return data;
  },
  async saveManagedUser(input:ManagedUserInput,expectedRevision:string):Promise<void> {
    const session=requireFullAdmin();
    if(isDemo(session))throw new Error('デモではアカウントを変更できません');
    await live(session,'saveManagedUser',{...input,expectedRevision});
  },
  async deleteManagedUser(userId:string,expectedRevision:string):Promise<void> {
    const session=requireFullAdmin();
    if(isDemo(session))throw new Error('デモではアカウントを変更できません');
    await live(session,'deleteManagedUser',{userId,expectedRevision});
  },
  logout():void { endSession(); },
  enterDemo(role:'admin'|'parent'):AppSession {
    // Explicit sandbox: synthetic local data only. This session is never sent to GAS.
    const session:AppSession={mode:'demo',user:{id:'demo-'+role,name:role==='admin'?'管理者デモ':'保護者デモ',role,studentIds:role==='parent'?['STU-001']:[],...(role==='parent'?{publicEntryId:DEMO_ENTRY_ID}:{})}};
    sessionStorage.setItem(SESSION_KEY,JSON.stringify(session));
    return session;
  },
  async loginWithGoogle(route:PortalRoute):Promise<AppSession> {
    if (route.kind !== 'admin' && route.kind !== 'parent') throw new Error('教室から案内された入口を開いてください。');
    if (route.kind === 'parent' && route.entryId === DEMO_ENTRY_ID) throw new Error('こちらは体験用の入口です。教室から届いたご家庭専用URLを開いてください。');
    const config = getDeploymentConfig();
    const firebase = requireGoogleConfig();
    sessionStorage.removeItem(SESSION_KEY);
    const attemptRevision = ++sessionRevision;
    try {
      const identity = await signInGoogle();
      const response=await request(config.gasApiUrl,identity.idToken,'login',{portalRole:route.kind,...(route.kind==='parent'&&route.entryId?{entryId:route.entryId}:{})});
      if (sessionRevision !== attemptRevision) throw new Error('ログイン操作が変わりました。もう一度お試しください。');
      const user=response.data as AppUser;
      if (!validAppUser(user)) throw new Error('認証応答が不正です');
      assertPortal(route,user);
      const session:AppSession={mode:'live',user,endpoint:config.gasApiUrl,firebaseUid:identity.uid,firebaseProjectId:firebase.projectId,...(route.kind==='parent'&&route.entryId?{entryId:route.entryId}:{})};
      sessionStorage.setItem(SESSION_KEY,JSON.stringify(session));
      return session;
    } catch (error) { if (sessionRevision === attemptRevision) this.logout(); throw error; }
  },
  async verifySession(route:PortalRoute):Promise<AppSession> {
    const previous=requireSession();
    if(previous.mode==='demo') { assertPortal(route,previous.user); return previous; }
    // Validate stored role and family assignment against the server before rendering.
    const identityToken = await getGoogleIdToken(previous.firebaseUid!);
    const response=await request(previous.endpoint!,identityToken,'login',{portalRole:route.kind,...(route.kind==='parent'&&route.entryId?{entryId:route.entryId}:{})},previous);
    if(JSON.stringify(getSession())!==JSON.stringify(previous))throw new Error('ログイン状態が変わりました');
    const user=response.data as AppUser;
    if(!validAppUser(user))throw new Error('認証応答が不正です');
    assertPortal(route,user);
    const session:AppSession={...previous,user,entryId:route.kind==='parent'?route.entryId:undefined};
    sessionStorage.setItem(SESSION_KEY,JSON.stringify(session));
    return session;
  },
  async getPortalInvitations():Promise<PortalInvitation[]> {
    const session=requireFullAdmin();
    if(isDemo(session))return [{userId:'demo-parent',name:'保護者デモ（架空の家庭）',publicEntryId:DEMO_ENTRY_ID}];
    const response=await live(session,'getPortalInvitations');
    const items=response.data as PortalInvitation[];
    if(!Array.isArray(items)||items.some(item=>!ENTRY_ID.test(item.publicEntryId)))throw new Error('個別URLの設定を管理担当者に確認してください');
    return items;
  },
  getGasApiUrl():string { return getDeploymentConfig().gasApiUrl; },
  async getStudents():Promise<Student[]> {
    const session=requireSession();
    const students=isDemo(session)?allStudents():(await live(session,'getStudents')).data as Student[];
    return students.filter(s=>mayAccessStudent(session,s.id));
  },
  async getStudentById(id:string):Promise<Student|undefined> {
    assertStudent(requireSession(),id);
    return (await this.getStudents()).find(s=>s.id===id);
  },
  async createStudent(student:Omit<Student,'id'|'createdAt'>):Promise<Student> {
    const session=requireFullAdmin();
    if(!student.name.trim()||!student.address.trim()||!Number.isSafeInteger(student.ticketBalance)||student.ticketBalance<0) throw new Error('氏名・住所・正しい初期残高を指定してください');
    if(!isDemo(session)) return (await mutation(session,'createStudent',student,'id','STU-')).data as Student;
    const students=allStudents();
    const created:Student={...student,id:'STU-'+crypto.randomUUID(),createdAt:getLocalDateString()};
    students.push(created);setStored(STORAGE_KEYS.STUDENTS,students);return created;
  },
  async getRides():Promise<RideReservation[]> {
    const session=requireSession();
    const rides=isDemo(session)?allRides():(await live(session,'getRides')).data as RideReservation[];
    return rides.filter(r=>mayAccessStudent(session,r.studentId))
      .sort((a,b)=>(b.rideDate+' '+b.rideTime).localeCompare(a.rideDate+' '+a.rideTime));
  },
  async createReservation(params:ReservationInput):Promise<RideReservation> {
    const session=requireSession();assertStudent(session,params.studentId);
    if (!['pickup','dropoff','roundtrip'].includes(params.rideType)||!/^\d{4}-\d{2}-\d{2}$/.test(params.rideDate)||!/^\d{2}:\d{2}$/.test(params.rideTime)||!params.pickupLocation.trim()) throw new Error('予約の必須項目を確認してください');
    const reservedBy=session.user.role==='admin'?'teacher':'parent';
    if(!isDemo(session)) return (await mutation(session,'createReservation',{...params,reservedBy},'rideId','RIDE-')).data as RideReservation;
    const rideId='RIDE-'+crypto.randomUUID();
    const student=allStudents().find(s=>s.id===params.studentId);
    if(!student) throw new Error('生徒が見つかりません');
    const ride:RideReservation={...params,reservedBy,id:rideId,studentName:student.name,status:'scheduled',calendarEventId:'',note:params.note||''};
    const rides=allRides();rides.unshift(ride);setStored(STORAGE_KEYS.RIDES,rides);return ride;
  },
  async cancelReservation(rideId:string):Promise<boolean> {
    const session=requireSession();
    if(!isDemo(session)){await assertReviewRide(session,rideId);await live(session,'cancelReservation',{rideId});return true;}
    const ride=getRide(session,rideId);
    if(ride.status==='cancelled')return true;
    if(ride.status!=='scheduled')throw new Error('完了済みの予約はキャンセルできません');
    setStored(STORAGE_KEYS.RIDES,allRides().map(r=>r.id===rideId?{...r,status:'cancelled'}:r));return true;
  },
  async completeRide(rideId:string,consumeTickets?:number):Promise<{success:boolean;remainingBalance?:number;consumedTickets?:number}> {
    const session=requireSession(true);
    if(!isDemo(session)) { await assertReviewRide(session,rideId); return await live(session,'completeRide',{rideId,...(consumeTickets===undefined?{}:{consumeTickets})}) as {success:boolean;remainingBalance?:number;consumedTickets?:number}; }
    const ride=getRide(session,rideId);
    const students=allStudents();const student=students.find(s=>s.id===ride.studentId);
    if(!student)throw new Error('生徒が見つかりません');
    if(ride.status==='completed')return {success:true,remainingBalance:student.ticketBalance,consumedTickets:0};
    if(ride.status!=='scheduled')return {success:false};
    const consume=ride.rideType==='roundtrip'?2:1;
    if(consumeTickets!==undefined&&consumeTickets!==consume)throw new Error('消費枚数が送迎区分と一致しません');
    if(student.ticketBalance<consume)throw new Error('チケット残数が不足しています。追加後に完了処理してください');
    student.ticketBalance-=consume;
    const completedAt=new Date().toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'});
    setStored(STORAGE_KEYS.STUDENTS,students);
    setStored(STORAGE_KEYS.RIDES,allRides().map(r=>r.id===rideId?{...r,status:'completed',completedAt}:r));
    return {success:true,remainingBalance:student.ticketBalance,consumedTickets:consume};
  },
  async addTickets(params:{studentId:string;ticketCount:number;amount:number;note?:string}):Promise<{success:boolean;newBalance:number}> {
    const session=requireSession(true);assertStudent(session,params.studentId);positiveCount(params.ticketCount);validAmount(params.amount);
    const purchaseId='PUR-'+crypto.randomUUID();
    if(!isDemo(session))return await mutation(session,'addTickets',params,'purchaseId','PUR-') as {success:boolean;newBalance:number};
    const students=allStudents();const student=students.find(s=>s.id===params.studentId);
    if(!student)throw new Error('生徒が見つかりません');
    if(!Number.isSafeInteger(student.ticketBalance+params.ticketCount))throw new Error('残高が上限を超えます');
    student.ticketBalance+=params.ticketCount;
    const purchases=getStored<TicketPurchase[]>(STORAGE_KEYS.PURCHASES,INITIAL_PURCHASES);
    purchases.unshift({...params,id:purchaseId,studentName:student.name,purchaseDate:getLocalDateString(),note:params.note||''});
    setStored(STORAGE_KEYS.STUDENTS,students);setStored(STORAGE_KEYS.PURCHASES,purchases);
    return {success:true,newBalance:student.ticketBalance};
  },
  resetToMock():void {
    const session=requireFullAdmin();if(!isDemo(session))throw new Error('デモ専用操作です');
    [STORAGE_KEYS.STUDENTS,STORAGE_KEYS.RIDES,STORAGE_KEYS.PURCHASES].forEach(k=>localStorage.removeItem(k));
  },
  purgeAllData():void {
    const session=requireFullAdmin();if(!isDemo(session))throw new Error('デモ専用操作です');
    setStored(STORAGE_KEYS.STUDENTS,[]);setStored(STORAGE_KEYS.RIDES,[]);setStored(STORAGE_KEYS.PURCHASES,[]);
  },
};
