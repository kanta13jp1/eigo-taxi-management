/*
 * Hosted UI acceptance, deliberately independent of run_acceptance.cjs.
 * Usage: node scripts/run_hosted_acceptance.cjs --url https://APP.web.app/
 * Only the operator-approved HTTPS URL is visited. All mutations are through
 * the unmodified hosted UI, in a fresh profile. Storage is inspected, never
 * seeded. Real external services and same-origin mutation requests are blocked.
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const puppeteer = require('puppeteer-core');
const { cases: acceptanceCases } = require('./acceptance-catalog.cjs');

const args = process.argv.slice(2);
if (![2,4].includes(args.length) || args[0] !== '--url' || (args.length===4&&(args[2]!=='--case'||!/^PUB-\d{2}$/.test(args[3])))) throw new Error('Usage: node scripts/run_hosted_acceptance.cjs --url https://APP.web.app/ [--case PUB-18]');
const selectedId=args.length===4?args[3]:null;
const target = new URL(args[1]);
if (target.protocol !== 'https:' || target.username || target.password || target.search || target.hash || target.port || !/\.(web\.app|firebaseapp\.com)$/.test(target.hostname)) {
  throw new Error('An explicitly approved Firebase Hosting HTTPS URL without credentials, query, fragment or port is required.');
}
const root = path.resolve(__dirname, '..');
const runId = new Date().toISOString().replace(/[:.]/g, '-') + '-' + crypto.randomBytes(3).toString('hex');
const out = path.join(root, 'docs/acceptance/hosted-runs', runId);
fs.mkdirSync(out, { recursive: true });
fs.copyFileSync(__filename, path.join(out, 'runner.cjs'), fs.constants.COPYFILE_EXCL);
const startedAt = new Date().toISOString();
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const hashFile = file => sha(fs.readFileSync(file));
const mockEndpoint = 'https://acceptance.invalid/exec';
const keys = { students: 'eigo_taxi_students', rides: 'eigo_taxi_rides', purchases: 'eigo_taxi_purchases' };
const results = [], assetMap = new Map(), assetJobs = [], networkAudit = [], runtimeErrors = [];
let browser, context, page, current, mock, profile, browserVersion, fatalError;
let dialogAction = 'dismiss';

async function text() { return page.evaluate(() => document.body.innerText); }
async function storage() {
  return page.evaluate(keys => Object.fromEntries(Object.entries(keys).map(([name, key]) => [name, JSON.parse(localStorage.getItem(key) || 'null')])), keys);
}
async function session() { return page.evaluate(() => JSON.parse(sessionStorage.getItem('eigo_taxi_session') || 'null')); }
async function waitText(value) { await page.waitForFunction(v => document.body.innerText.includes(v), {}, value); }
async function click(value, { exact = false, selector = 'button' } = {}) {
  await page.waitForFunction((v, exact, selector) => [...document.querySelectorAll(selector)].some(b => !b.disabled && (exact ? b.textContent.trim() === v : b.textContent.includes(v))), {}, value, exact, selector);
  const handle = await page.evaluateHandle((v, exact, selector) => [...document.querySelectorAll(selector)].find(b => !b.disabled && (exact ? b.textContent.trim() === v : b.textContent.includes(v))), value, exact, selector);
  try { await handle.asElement().click(); } finally { await handle.dispose(); }
}
async function fill(selector, value) {
  await page.waitForSelector(selector);
  if (await page.$eval(selector, input => input.type === 'number')) {
    // Controlled number inputs normalize intermediate '-' / '1.' keystrokes.
    // Deliver the complete UI value and real input/change events for boundary tests.
    await page.$eval(selector, (input, value) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, String(value));
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
    assert.equal(await page.$eval(selector, input => input.value), String(value));
    return;
  }
  await page.focus(selector);
  await page.keyboard.down('Control'); await page.keyboard.press('A'); await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  if (String(value)) await page.type(selector, String(value));
}
async function dateAndTime(date, time) {
  // Native date/time input values are set as UI input events; no app methods,
  // module imports, globals, localStorage writes or bundle changes are used.
  await page.evaluate((date, time) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    for (const [selector, value] of [['input[type=date]', date], ['input[type=time]', time]]) {
      const input = document.querySelector(selector); setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, date, time);
}
async function today() {
  return page.evaluate(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; });
}
async function enter(role) {
  await click(role === 'admin' ? '管理者デモを開く' : '保護者デモを開く');
  await waitText(role === 'admin' ? '先生用管理ダッシュボード' : '送迎チケット残高');
  const s = await session(); assert.equal(s.mode, 'demo'); assert.equal(s.user.role, role);
}
async function logout() { await click('ログアウト', { exact: true }); await page.waitForSelector('#login-key'); assert.equal(await session(), null); }
async function reload() { await page.reload({ waitUntil: 'networkidle0' }); }
async function shot(label) {
  const file = `${current.id}${label ? '-' + label : ''}.png`;
  await page.screenshot({ path: path.join(out, file), fullPage: true });
  current.screenshots.push({ file, sha256: hashFile(path.join(out, file)), capturedAt: new Date().toISOString() });
}
async function rowText(marker) { return page.$eval('tbody', (body, marker) => [...body.querySelectorAll('tr')].find(r => r.textContent.includes(marker))?.textContent || '', marker); }
async function rowButton(marker, action) {
  await page.waitForFunction((marker, action) => [...document.querySelectorAll('tbody tr')].some(r => r.textContent.includes(marker) && [...r.querySelectorAll('button')].some(b => b.textContent.trim() === action)), {}, marker, action);
  const handle = await page.evaluateHandle((marker, action) => [...document.querySelectorAll('tbody tr')].find(r => r.textContent.includes(marker)) && [...[...document.querySelectorAll('tbody tr')].find(r => r.textContent.includes(marker)).querySelectorAll('button')].find(b => b.textContent.trim() === action), marker, action);
  try { await handle.asElement().click(); } finally { await handle.dispose(); }
}
async function parentCancel(marker) {
  const handle = await page.evaluateHandle(marker => [...document.querySelectorAll('button')].filter(b => b.textContent.trim() === 'キャンセル').find(b => {
    let p = b.parentElement;
    for (let i = 0; p && i < 3; i++, p = p.parentElement) if (p.textContent.includes(marker)) return true;
    return false;
  }), marker);
  try { assert.ok(handle.asElement(), 'Target reservation cancel button missing'); await handle.asElement().click(); } finally { await handle.dispose(); }
}
async function book(type = 'pickup', view = 'parent', marker = `${current.id}-架空送迎場所`, submit = true) {
  await click(view === 'parent' ? '送迎の予約を申し込む' : '送迎予定を追加');
  await page.waitForSelector('input[type=date]');
  const rideDate = await today();
  await dateAndTime(rideDate, '16:30');
  const radio = await page.evaluateHandle(type => document.querySelector(`input[name=rideType][value=${type}]`).parentElement, type);
  try { await radio.asElement().click(); } finally { await radio.dispose(); }
  await fill('input[placeholder*="東京都世田谷区..."]', marker);
  await fill('form textarea', `${current.id} synthetic UI acceptance`);
  if (!submit) return { marker, rideDate };
  await click('送迎予定を登録する', { exact: true });
  await page.waitForFunction(() => !document.querySelector('input[type=date]'));
  const data = await storage();
  const ride = data.rides.find(r => r.pickupLocation === marker);
  assert.ok(ride, 'UI reservation missing from synthetic storage');
  assert.deepEqual([ride.rideType, ride.status, ride.rideDate, ride.rideTime], [type, 'scheduled', rideDate, '16:30']);
  return ride;
}
async function addStudent(submit = true) {
  await click('生徒・チケット管理'); await click('新規生徒を登録');
  for (const [selector, value] of [
    ['input[placeholder*="佐藤 陽菜"]', `${current.id} 架空生徒`],
    ['input[placeholder*="佐藤 美咲"]', '受入専用架空保護者'],
    ['input[placeholder*="090-1234"]', '000-0000-0000'],
    ['input[placeholder*="桜新町"]', `${current.id} 架空住所`],
    ['input[placeholder*="マンション正面"]', '受入専用メモ'],
  ]) await fill(selector, value);
  if (!submit) return;
  await click('登録を完了する');
  await page.waitForFunction(() => !document.querySelector('input[placeholder*="佐藤 陽菜"]'));
  const s = (await storage()).students.find(s => s.name === `${current.id} 架空生徒`);
  assert.ok(s); assert.deepEqual([s.parentName, s.phone, s.address, s.pickupNote, s.ticketBalance], ['受入専用架空保護者', '000-0000-0000', `${current.id} 架空住所`, '受入専用メモ', 10]);
  await waitText(s.name); return s;
}
async function assertNoAdminOrOtherFamily() {
  const visible = await text();
  for (const forbidden of ['生徒・チケット管理', '先生用管理ダッシュボード', '山本', '高橋']) assert.ok(!visible.includes(forbidden), `Forbidden parent UI content: ${forbidden}`);
  assert.equal(await page.$$eval('button', buttons => buttons.filter(b => b.textContent.trim() === 'Google連携' || b.textContent.includes('管理者用')).length), 0, 'Admin/settings controls must be absent from the parent UI');
  assert.deepEqual(await page.$$eval('select option', options => options.map(o => o.value)), ['STU-001']);
}
async function mockLogin() {
  await enter('admin'); const initial = await storage(); await logout();
  mock = { students: initial.students, rides: initial.rides, failure: 'abort', revoked: false, audit: [] };
  await fill('#login-endpoint', mockEndpoint); await fill('#login-key', 'synthetic-acceptance-key-only');
  await click('ログイン', { exact: true }); await waitText('先生用管理ダッシュボード');
  assert.equal((await session()).endpoint, mockEndpoint); return initial;
}
async function assertFormFailure() {
  await page.waitForFunction(() => document.querySelector('form [role=alert]') && !document.querySelector('form button[type=submit]')?.disabled);
  assert.ok((await page.$eval('form [role=alert]', e => e.textContent)).includes('通信または連携処理に失敗しました'));
  assert.ok(await page.$('form')); assert.ok(!(await text()).includes('を登録しました'));
}

const cases = [
  { id:'PUB-01', acceptanceIds:['AT-19','AT-30'], title:'未認証の公開ページ', scope:'UI visibility only; no direct service authorization assertion', run:async()=>{
    await page.waitForSelector('#login-key'); const visible = await text();
    for (const name of ['田中','山本','高橋','生徒・チケット管理']) assert.ok(!visible.includes(name));
    assert.equal(await session(),null); assert.deepEqual(await storage(),{students:null,rides:null,purchases:null});
  }},
  { id:'PUB-02', acceptanceIds:['AT-19','AT-20'], title:'studentクエリでは認証を迂回しない', scope:'Query URL and parent UI only', run:async()=>{
    const query = new URL(target); query.searchParams.set('student','STU-002'); await page.goto(query.href,{waitUntil:'networkidle0'});
    await page.waitForSelector('#login-key'); assert.equal(await session(),null); assert.equal((await storage()).students,null);
    await shot('unauthenticated-query'); await enter('parent'); await assertNoAdminOrOtherFamily();
  }},
  { id:'PUB-03', acceptanceIds:['AT-03','AT-20'], title:'明示した保護者デモの家庭・残高表示', scope:'Synthetic STU-001 UI; live family authorization remains external', run:async()=>{
    await enter('parent'); await assertNoAdminOrOtherFamily(); const visible = await text();
    assert.ok(/7\s*回分/.test(visible)); assert.ok(visible.includes('田中')); assert.ok(visible.includes('片道1回につきチケット1枚消費'));
  }},
  { id:'PUB-04', acceptanceIds:['AT-19','AT-20'], title:'ログアウトと管理者・保護者の切替', scope:'Fresh demo sessions, UI visibility and session state', run:async()=>{
    await enter('admin'); await logout(); assert.ok(!(await text()).includes('田中')); await shot('logged-out');
    await enter('parent'); await assertNoAdminOrOtherFamily(); await logout(); await enter('admin');
  }},
  { id:'PUB-05', acceptanceIds:['AT-02'], title:'画面から架空生徒を登録', scope:'Demo UI and saved synthetic data', run:async()=>{
    await enter('admin'); const before=(await storage()).students.length; await addStudent(); assert.equal((await storage()).students.length,before+1);
  }},
  { id:'PUB-06', acceptanceIds:['AT-05'], title:'画面から10回券を追加', scope:'Demo UI, balance and persisted purchase fields', run:async()=>{
    await enter('admin'); await click('チケット追加',{exact:true}); await click('10回券 (¥10,000)',{exact:true});
    await fill('input[placeholder*="現金受領"]','受入専用10回券'); await click('チケットを追加する');
    await page.waitForFunction(()=>!document.querySelector('form'));
    const saved=await storage(); assert.equal(saved.students.find(s=>s.id==='STU-001').ticketBalance,17);
    assert.equal(saved.purchases.length,3); assert.deepEqual([saved.purchases[0].studentId,saved.purchases[0].ticketCount,saved.purchases[0].amount,saved.purchases[0].note],['STU-001',10,10000,'受入専用10回券']);
    await click('送迎利用者'); await waitText('送迎チケット残高'); assert.ok(/17\s*回分/.test(await text()));
  }},
  ...[['pickup','AT-06','お迎え'],['dropoff','AT-07','送り'],['roundtrip','AT-08','往復']].map(([type,at,label],i)=>({id:`PUB-${String(7+i).padStart(2,'0')}`,acceptanceIds:[at],title:`保護者が画面から${label}予約`,scope:'Real form submit, demo storage and visible reservation; no external calendar',run:async()=>{
    await enter('parent'); const before=(await storage()).rides.length; const ride=await book(type);
    assert.equal((await storage()).rides.length,before+1); assert.equal(ride.reservedBy,'parent'); assert.equal(ride.studentId,'STU-001');
    assert.equal((await storage()).students.find(s=>s.id==='STU-001').ticketBalance,7); await waitText(ride.pickupLocation);
  }})),
  { id:'PUB-10', acceptanceIds:['AT-09'], title:'管理者予約者属性をセッションから決定', scope:'Admin form and admin visiting parent tab both persist reservedBy=teacher', run:async()=>{
    await enter('admin'); const first=await book('pickup','teacher',`${current.id}-teacher`); assert.equal(first.reservedBy,'teacher');
    await click('送迎利用者'); await waitText('送迎チケット残高'); const second=await book('dropoff','parent',`${current.id}-admin-parent-view`); assert.equal(second.reservedBy,'teacher');
  }},
  { id:'PUB-11', acceptanceIds:['AT-10','AT-16'], title:'保護者の取消確認・取消後表示', scope:'Confirmation dismiss/accept and canceled UI; not direct-call rejection proof', run:async()=>{
    await enter('parent'); const ride=await book(); dialogAction='dismiss'; await parentCancel(ride.pickupLocation);
    assert.equal((await storage()).rides.find(r=>r.id===ride.id).status,'scheduled');
    dialogAction='accept'; await parentCancel(ride.pickupLocation); await waitText('キャンセル済');
    assert.equal((await storage()).rides.find(r=>r.id===ride.id).status,'cancelled'); assert.equal((await storage()).students[0].ticketBalance,7);
    assert.equal(current.dialogs.filter(d=>d.type==='confirm').length,2); assert.deepEqual(current.dialogs.map(d=>d.action),['dismiss','accept']);
  }},
  { id:'PUB-12', acceptanceIds:['AT-11','AT-16'], title:'管理者取消と取消後の操作非表示', scope:'UI cancel and no completion/cancel buttons on canceled row; not server rejection proof', run:async()=>{
    await enter('admin'); const ride=await book('pickup','teacher'); await click('送迎スケジュール一覧'); dialogAction='accept'; await rowButton(ride.pickupLocation,'取消');
    await page.waitForFunction(id=>JSON.parse(localStorage.getItem('eigo_taxi_rides')).find(r=>r.id===id).status==='cancelled',{},ride.id);
    assert.equal((await storage()).students[0].ticketBalance,7); assert.ok((await rowText(ride.pickupLocation)).includes('取消'));
    assert.equal(await page.$eval('tbody',(body,m)=>[...body.querySelectorAll('tr')].find(r=>r.textContent.includes(m)).querySelectorAll('button').length,ride.pickupLocation),0);
  }},
  { id:'PUB-13', acceptanceIds:['AT-12'], title:'当日の一覧とGoogle地図リンク', scope:'URL construction only; Maps destination is not opened', run:async()=>{
    await enter('admin'); assert.ok((await text()).includes('本日の送迎'));
    const links=await page.$$eval('a',as=>as.map(a=>a.href).filter(h=>h.startsWith('https://www.google.com/maps/search/'))); assert.ok(links.length>=2);
    for(const link of links){const u=new URL(link);assert.equal(u.searchParams.get('api'),'1');assert.ok(u.searchParams.get('query'));}
  }},
  ...[['pickup','AT-13',1],['roundtrip','AT-14',2]].map(([type,at,cost],i)=>({id:`PUB-${14+i}`,acceptanceIds:[at,'AT-15'],title:`管理者が${type==='pickup'?'片道':'往復'}を完了`,scope:'UI completed state, ticket consumption and hidden repeat button; not direct replay/server lock proof',run:async()=>{
    await enter('parent'); const ride=await book(type); await logout(); await enter('admin'); await click('送迎スケジュール一覧'); await rowButton(ride.pickupLocation,'完了');
    await page.waitForFunction(id=>JSON.parse(localStorage.getItem('eigo_taxi_rides')).find(r=>r.id===id).status==='completed',{},ride.id);
    const data=await storage(); assert.ok(data.rides.find(r=>r.id===ride.id).completedAt); assert.equal(data.students[0].ticketBalance,7-cost);
    assert.ok((await rowText(ride.pickupLocation)).includes(`完了済 (-${cost}回)`));
    assert.equal(await page.$eval('tbody',(body,m)=>[...body.querySelectorAll('tr')].find(r=>r.textContent.includes(m)).querySelectorAll('button').length,ride.pickupLocation),0);
    await reload(); assert.equal((await storage()).students[0].ticketBalance,7-cost); await click('送迎スケジュール一覧');
  }})),
  { id:'PUB-16', acceptanceIds:['AT-02','AT-06'], title:'必須項目の空欄を送信しない', scope:'Native form validation for student name and pickup location', run:async()=>{
    await enter('admin'); const before=await storage(); await click('生徒・チケット管理'); await click('新規生徒を登録'); await click('登録を完了する');
    assert.equal(await page.$eval('form',f=>f.checkValidity()),false); assert.deepEqual(await storage(),before); await shot('student-required'); await click('閉じる',{exact:true});
    await book('pickup','teacher',`${current.id}-invalid`,false); await fill('input[placeholder*="東京都世田谷区..."]',''); await click('送迎予定を登録する',{exact:true});
    assert.equal(await page.$eval('form',f=>f.checkValidity()),false); assert.deepEqual(await storage(),before);
  }},
  { id:'PUB-17', acceptanceIds:['AT-17'], title:'画面で不正なチケット枚数・金額を拒否', scope:'UI-representable invalid numbers only; NaN/Infinity/direct service calls are not covered', run:async()=>{
    await enter('admin'); const before=await storage(); await click('チケット追加',{exact:true});
    for(const invalid of ['-1','0','1.5','101']){await fill('form input[type=number][min="1"]',invalid);await click('チケットを追加する');assert.equal(await page.$eval('form',f=>f.checkValidity()),false);assert.deepEqual(await storage(),before);}
    await fill('form input[type=number][min="1"]','10');
    for(const invalid of ['-1','1.5']){await fill('form input[type=number][min="0"]',invalid);await click('チケットを追加する');assert.equal(await page.$eval('form',f=>f.checkValidity()),false);assert.deepEqual(await storage(),before);}
  }},
  { id:'PUB-18', acceptanceIds:['AT-21'], title:'375pxで管理・保護者・予約フォームを表示', scope:'Headless Chromium emulation; not iPhone Safari or Android device acceptance', run:async()=>{
    await page.setViewport({width:375,height:812,isMobile:true,hasTouch:true}); await enter('admin');
    const overflow=[];
    for(const view of ['teacher','parent','booking']){
      if(view==='parent'){await logout();await enter('parent');}
      if(view==='booking')await book('roundtrip','parent',`${current.id}-mobile`,false);
      const dimensions=await page.evaluate(()=>({viewport:375,width:innerWidth,client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,
        overflowingElements:[...document.body.querySelectorAll('*')].map(e=>({e,r:e.getBoundingClientRect()})).filter(({r})=>r.left<-.5||r.right>375.5).slice(0,20).map(({e,r})=>({tag:e.tagName,className:typeof e.className==='string'?e.className:'',text:e.textContent.slice(0,100),left:r.left,right:r.right,width:r.width}))}));
      current.observations[view]=dimensions; await shot(view);
      if(dimensions.scroll>375||dimensions.width>375)overflow.push(`${view}: innerWidth=${dimensions.width}, scrollWidth=${dimensions.scroll}, clientWidth=${dimensions.client}`);
    }
    assert.equal(overflow.length,0,overflow.join('; '));
  }},
  { id:'PUB-19', acceptanceIds:['AT-22'], title:'生徒・予約の再読込後の永続化', scope:'Same isolated browser demo storage only, not cross-device/Google persistence', run:async()=>{
    await enter('admin'); const student=await addStudent(); const ride=await book('pickup','teacher'); const before=await storage(); await reload(); await waitText('先生用管理ダッシュボード');
    assert.deepEqual(await storage(),before); await click('生徒・チケット管理'); await waitText(student.name); await shot('student'); await click('送迎スケジュール一覧'); await waitText(ride.pickupLocation);
  }},
  { id:'PUB-20', acceptanceIds:['AT-01'], title:'設定保存でデモから実接続へ自動切替しない', scope:'Synthetic endpoint saved without contact; explicit login still required', run:async()=>{
    await enter('admin'); const before=await storage(); await click('Google連携'); await fill('#gas-url',mockEndpoint); await click('設定を保存'); await waitText('ログアウト後にアクセスキーでログイン');
    assert.equal((await session()).mode,'demo'); assert.equal(await page.evaluate(()=>localStorage.getItem('eigo_taxi_gas_api_url')),mockEndpoint); await reload(); await click('Google連携');
    assert.equal(await page.$eval('#gas-url',e=>e.value),mockEndpoint); assert.equal((await session()).mode,'demo'); assert.deepEqual(await storage(),before);
    assert.equal(networkAudit.filter(n=>n.caseId===current.id&&n.url===mockEndpoint).length,0);
  }},
  { id:'PUB-21', acceptanceIds:['AT-04'], title:'実際のデモ完了操作で残高2・1・0の案内', scope:'Synthetic UI operations create each balance; no storage seeding', run:async()=>{
    await enter('admin');
    for(let balance=6;balance>=0;balance--){
      const ride=await book('pickup','teacher',`${current.id}-balance-${balance}`); await click('送迎スケジュール一覧'); await rowButton(ride.pickupLocation,'完了');
      await page.waitForFunction(b=>JSON.parse(localStorage.getItem('eigo_taxi_students'))[0].ticketBalance===b,{},balance);
      if(balance<=2){await click('送迎利用者');await waitText('送迎チケット残高');assert.ok((await text()).includes(`残り${balance}回`));assert.ok((await text()).includes('Mauro・Brenda に連絡してね！'));await shot(`balance-${balance}`);await click('管理者用');}
    }
  }},
  { id:'PUB-22', acceptanceIds:['AT-18'], title:'模擬HTTPS障害で各更新を成功扱いしない', mode:'hosted-ui-with-mocked-https', scope:'UI-only mock at acceptance.invalid; no real GAS/Google requests; all five mutation types and retry ID', run:async()=>{
    const before=await mockLogin();
    await book('pickup','teacher',`${current.id}-failed`,false); await click('送迎予定を登録する',{exact:true});await assertFormFailure();await shot('reservation-failure');
    await click('送迎予定を登録する',{exact:true});await assertFormFailure();
    const attempts=mock.audit.filter(a=>a.action==='createReservation');assert.equal(attempts.length,2);assert.ok(attempts[0].rideId);assert.equal(attempts[0].rideId,attempts[1].rideId);
    await click('キャンセル',{exact:true});
    await click('チケット追加',{exact:true});
    for(const failure of ['abort','http','json','response']){mock.failure=failure;await click('チケットを追加する');await assertFormFailure();await shot(`tickets-${failure}`);}
    await click('閉じる',{exact:true});mock.failure='abort';await addStudent(false);await click('登録を完了する');await assertFormFailure();await shot('student-failure');await click('閉じる',{exact:true});
    await click('送迎スケジュール一覧');await rowButton(mock.rides.find(r=>r.id==='RIDE-101').pickupLocation,'完了');
    await waitText('通信または連携処理に失敗しました');await shot('complete-failure');dialogAction='accept';
    await rowButton(mock.rides.find(r=>r.id==='RIDE-102').pickupLocation,'取消');await waitText('通信または連携処理に失敗しました');
    await page.waitForFunction(()=>!document.querySelector('form'));assert.deepEqual(await storage(),before);
    assert.deepEqual([...new Set(mock.audit.map(a=>a.action))].sort(),['addTickets','cancelReservation','completeRide','createReservation','createStudent'].sort());current.observations.mockRequests=mock.audit;
    assert.ok(!(await text()).includes('送迎予約のキャンセルが完了しました'));assert.ok(!(await text()).includes('送迎が完了しました'));
  }},
  { id:'PUB-23', acceptanceIds:['AT-19'], title:'模擬認証失効応答でログイン画面へ戻る', mode:'hosted-ui-with-mocked-https', scope:'Mock UNAUTHORIZED response through genuine UI; real identity provider remains untested', run:async()=>{
    await mockLogin();mock.revoked=true;await click('送迎スケジュール一覧');await rowButton(mock.rides.find(r=>r.id==='RIDE-102').pickupLocation,'完了');await page.waitForSelector('#login-key');
    assert.equal(await session(),null);for(const forbidden of ['田中','山本','生徒・チケット管理'])assert.ok(!(await text()).includes(forbidden));
    current.observations.mockRequests=mock.audit;
  }},
];
const selectedCases=selectedId?cases.filter(c=>c.id===selectedId):cases;
assert.ok(selectedCases.length,'Unknown --case selection');

function recordResponse(response) {
  const request=response.request(), resourceType=request.resourceType();
  if(!['document','script','stylesheet'].includes(resourceType)||new URL(response.url()).origin!==target.origin)return;
  const caseId=current?.id;
  assetJobs.push((async()=>{
    try{
      const buffer=await response.buffer();const digest=sha(buffer);const key=response.url()+'|'+digest;
      if(!assetMap.has(key))assetMap.set(key,{url:response.url(),resourceType,status:response.status(),contentType:response.headers()['content-type']||'',bytes:buffer.length,sha256:digest,observedIn:[]});
      const item=assetMap.get(key);if(!item.observedIn.includes(caseId))item.observedIn.push(caseId);
    }catch(error){runtimeErrors.push({caseId,type:'asset-hash',url:response.url(),message:error.message});}
  })());
}
async function intercept(request) {
  const u=new URL(request.url());
  if(request.url()===mockEndpoint){
    networkAudit.push({caseId:current.id,url:request.url(),method:request.method(),handling:mock?'mocked-in-browser':'blocked'});
    if(!mock)return request.abort('blockedbyclient');
    const body=JSON.parse(request.postData()||'{}');
    const headers={'access-control-allow-origin':target.origin,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'content-type'};
    const respond=body=>request.respond({status:200,headers,contentType:'application/json',body:JSON.stringify(body)});
    if(request.method()==='OPTIONS')return request.respond({status:204,headers});
    if(body.action==='login')return respond({success:true,data:{id:'synthetic-admin',name:'通信障害テスト専用管理者',role:'admin',studentIds:[]}});
    if(['getStudents','getRides'].includes(body.action))return respond({success:true,data:body.action==='getStudents'?mock.students:mock.rides});
    mock.audit.push({action:body.action,rideId:body.rideId||null,purchaseId:body.purchaseId||null,id:body.id||null,failure:mock.revoked?'UNAUTHORIZED':mock.failure});
    if(mock.revoked)return respond({success:false,code:'UNAUTHORIZED',error:'テスト用の認証失効'});
    if(mock.failure==='http')return request.respond({status:503,headers,contentType:'application/json',body:'{}'});
    if(mock.failure==='json')return request.respond({status:200,headers,contentType:'application/json',body:'not-json'});
    if(mock.failure==='response')return respond({success:false,code:'SERVICE_ERROR',error:'通信または連携処理に失敗しました。模擬障害です。'});
    return request.abort('failed');
  }
  if(u.origin===target.origin&&['GET','HEAD'].includes(request.method()))return request.continue();
  if(['data:','blob:'].includes(u.protocol))return request.continue();
  networkAudit.push({caseId:current?.id,url:request.url(),method:request.method(),handling:'blocked'});return request.abort('blockedbyclient');
}
async function main() {
  const shellRoot=path.join(os.homedir(),'.cache/puppeteer/chrome-headless-shell');
  const version=fs.readdirSync(shellRoot).filter(f=>f.startsWith('win64-')).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).at(-1);
  const executablePath=path.join(shellRoot,version,'chrome-headless-shell-win64/chrome-headless-shell.exe');assert.ok(fs.existsSync(executablePath));
  profile=fs.mkdtempSync(path.join(os.tmpdir(),'eigo-hosted-acceptance-'));
  browser=await puppeteer.launch({executablePath,userDataDir:profile,headless:'shell',args:['--disable-gpu','--disable-extensions','--renderer-process-limit=1']});browserVersion=await browser.version();
  for(const c of selectedCases){
    current={id:c.id,acceptanceIds:c.acceptanceIds,title:c.title,mode:c.mode||'hosted-ui-synthetic-demo',scope:c.scope,status:'NOT RUN',startedAt:new Date().toISOString(),screenshots:[],dialogs:[],observations:{}};mock=null;dialogAction='dismiss';
    try{
      context=await browser.createBrowserContext();page=await context.newPage();page.setDefaultTimeout(8000);page.setDefaultNavigationTimeout(25000);
      await page.setViewport({width:1280,height:900});await page.emulateTimezone('Asia/Tokyo');await page.setCacheEnabled(false);
      page.on('dialog',async d=>{current.dialogs.push({type:d.type(),message:d.message(),action:dialogAction});await d[dialogAction]();});
      page.on('pageerror',error=>runtimeErrors.push({caseId:current.id,type:'pageerror',message:error.message}));
      page.on('response',recordResponse);await page.setRequestInterception(true);page.on('request',r=>intercept(r).catch(e=>runtimeErrors.push({caseId:current.id,type:'interception',message:e.message})));
      const response=await page.goto(target.href,{waitUntil:'networkidle0'});assert.equal(response.status(),200);assert.equal(new URL(page.url()).origin,target.origin,'Unexpected cross-origin redirect');
      await c.run();current.status='PASS';current.detail='Assertions passed through the deployed UI within the explicitly described scope.';
    }catch(error){current.status='FAIL';current.detail=error.message;current.errorStack=error.stack;}
    finally{
      if(page&&!page.isClosed()){
        try{await shot('result');current.observations.savedSyntheticData=await storage();}catch(error){current.status='FAIL';current.screenshotError=error.message;}
      }
      await Promise.allSettled(assetJobs);if(context)await context.close();context=null;page=null;
      current.finishedAt=new Date().toISOString();results.push(current);console.log(`${current.id} ${current.status}${current.status==='FAIL'?' '+current.detail:''}`);
    }
  }
}
main().catch(error=>{fatalError=error.stack;process.exitCode=1;}).finally(async()=>{
  try{if(browser)await browser.close();}catch(error){runtimeErrors.push({type:'browser-close',message:error.message});}
  await Promise.allSettled(assetJobs);
  for(const c of selectedCases.filter(c=>!results.some(r=>r.id===c.id)))results.push({id:c.id,acceptanceIds:c.acceptanceIds,title:c.title,status:'NOT RUN',detail:'Execution infrastructure stopped before this case.',screenshots:[]});
  const servedAssets=[...assetMap.values()];
  const residuals=[
    {acceptanceIds:['AT-15','AT-16','AT-17','AT-19','AT-20'],reason:'Hosted UI observations do not replace direct service authorization, duplicate-request/idempotency and malformed-value regression tests.'},
    {acceptanceIds:['AT-18'],reason:'Faults are intercepted at acceptance.invalid in this browser. No real GAS outage, concurrent request or external service was exercised.'},
    {acceptanceIds:['AT-23','AT-24','AT-25','AT-26','AT-27','AT-28'],reason:'Requires explicitly isolated Google Sheets/GAS/Calendar resources, configured credentials, multi-session or backup execution; not attempted by this hosted UI suite.'},
    {acceptanceIds:['AT-29'],reason:'Requires physical iPhone Safari / Android Chrome and human acceptance; Chromium mobile emulation is partial evidence only.'},
    {acceptanceIds:['AT-30'],reason:'This is test-hosting UI smoke and served-asset evidence, not full production release acceptance; external integration and release prerequisites remain independent.'},
  ];
  const coverage=acceptanceCases.map(c=>({id:c.id,title:c.title,publicCases:results.filter(r=>r.acceptanceIds.includes(c.id)).map(r=>({id:r.id,status:r.status})),note:residuals.filter(r=>r.acceptanceIds.includes(c.id)).map(r=>r.reason).join(' ')}));
  let commit;try{commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',windowsHide:true}).trim();}catch{commit='unavailable';}
  const report={schemaVersion:1,runId,url:target.href,selectedCaseIds:selectedCases.map(c=>c.id),catalogCaseCount:cases.length,startedAt,finishedAt:new Date().toISOString(),timezone:'Asia/Tokyo',mode:'Unmodified HTTPS-hosted assets; UI forms/buttons; isolated fresh browser contexts; demo storage read-only inspection; optional intercepted synthetic HTTPS failures',browser:browserVersion||null,commit,scriptSha256:hashFile(path.join(out,'runner.cjs')),safety:{externalNetwork:'blocked except mocked acceptance.invalid; same-origin GET/HEAD only',realCredentialsUsed:false,realCustomerDataUsed:false,profileIsolated:true,storageSeeded:false,sourceApiImported:false,deployedBundleModified:false},servedAssets,networkAudit,runtimeErrors,fatalError:fatalError||null,summary:{pass:results.filter(r=>r.status==='PASS').length,fail:results.filter(r=>r.status==='FAIL').length,notRun:results.filter(r=>r.status==='NOT RUN').length,total:selectedCases.length},results,coverage,residuals};
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2),{flag:'wx'});
  fs.writeFileSync(path.join(root,'docs/acceptance/hosted-latest.json'),JSON.stringify({runId,url:target.href,resultsSha256:hashFile(path.join(out,'results.json'))},null,2));
  if(profile){const safeRoot=path.resolve(os.tmpdir())+path.sep;const resolved=path.resolve(profile);if(resolved.startsWith(safeRoot)&&path.basename(resolved).startsWith('eigo-hosted-acceptance-'))try{fs.rmSync(resolved,{recursive:true,force:true});}catch{ /* Browser is closed; abandoned synthetic-only profile is harmless. */ }}
  console.log(`Hosted report: ${path.join(out,'results.json')}`);
  if(fatalError||results.some(r=>r.status!=='PASS')||!servedAssets.some(a=>a.resourceType==='script'&&a.status===200)||runtimeErrors.some(e=>e.type==='pageerror'))process.exitCode=1;
});
