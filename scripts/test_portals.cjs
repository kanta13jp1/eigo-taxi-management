const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript'),crypto=require('node:crypto');
const QRCode=require('qrcode');
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}};
const localStorage=storage(),sessionStorage=storage();let responder,requests=[],requestUrls=[],idToken='synthetic-id-token',googleUnavailable=false,signOutCalls=0;
const env={console,URL,Date,structuredClone,crypto:crypto.webcrypto,localStorage,sessionStorage,Event,CustomEvent,DOMException,AbortSignal,window:{dispatchEvent:()=>{}},fetch:async(url,opts)=>{const body=JSON.parse(opts.body);requests.push(body);requestUrls.push(url);return {ok:true,json:async()=>responder(body)}}};
function load(file,requireFn=require){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{...env,exports,require:requireFn});return exports;}
const config=load('src/deployment-config.ts');
const configured={...config.deploymentConfig,firebase:{apiKey:'synthetic-public-api-key-000000000000',authDomain:'eigo-taxi-app.firebaseapp.com',projectId:'eigo-taxi-app',appId:'1:123456789:web:abcdef'}};
let activeConfig=structuredClone(configured);
const configApi={getDeploymentConfig:()=>config.validateDeploymentConfig(activeConfig),requireGoogleConfig:()=>{const c=config.validateDeploymentConfig(activeConfig);if(!c.firebase)throw new Error(config.SETUP_REQUIRED_MESSAGE);return c.firebase;}};
const google={signInGoogle:async()=>({uid:'synthetic-google-uid',idToken}),getGoogleIdToken:async uid=>{assert.equal(uid,'synthetic-google-uid');if(googleUnavailable)throw new Error('expired');return idToken;},signOutGoogle:async()=>{signOutCalls++;}};
const portal=load('src/portal.ts');const {ApiService:api}=load('src/services/api.ts',p=>p==='../portal'?portal:p==='../deployment-config'?configApi:p==='./google-auth'?google:require(p));
const id='12345678-1234-4123-8123-123456789abc',id2='12345678-1234-4123-8123-123456789abd';
const admin={id:'admin',name:'Synthetic Admin',role:'admin',studentIds:[]};const parent={id:'p1',name:'Synthetic Parent',role:'parent',studentIds:['STU-001'],publicEntryId:id};
let passed=0;const rows=[];
async function test(name,fn){await fn();passed++;rows.push({name,status:'PASS'});console.log('PASS '+name)}
(async()=>{
await test('Strict hash routes, including unknown and malformed entry IDs',()=>{assert.equal(portal.parsePortal('#/admin').kind,'admin');assert.equal(portal.parsePortal('#/parent/'+id).entryId,id);for(const h of ['#/admin/parent','#/parent/STU-001','#/parent/'+id+'?token=x','#/parent/'+id+'/extra'])assert.equal(portal.parsePortal(h).kind,'invalid')});
await test('Roles and personal-link identity mismatch fail closed',()=>{assert.throws(()=>portal.assertPortal({kind:'parent'},admin));assert.throws(()=>portal.assertPortal({kind:'admin'},parent));assert.throws(()=>portal.assertPortal({kind:'parent',entryId:id2},parent));portal.assertPortal({kind:'parent',entryId:id},parent)});
await test('QR payload has only canonical app URL and opaque ID, preserving GitHub base',()=>{const url=portal.invitationUrl('https://example.test/eigo-taxi-management/?token=secret#/admin',id);assert.equal(url,'https://example.test/eigo-taxi-management/#/parent/'+id);assert.equal(QRCode.create(url).segments.map(s=>typeof s.data==='string'?s.data:Buffer.from(s.data).toString()).join(''),url)});
await test('Admin response refused at parent entry with no saved session',async()=>{responder=()=>({success:true,data:admin});await assert.rejects(()=>api.loginWithGoogle({kind:'parent'}));assert.equal(api.getSession(),null)});
await test('Individual ID mismatch refused even against old server without binding',async()=>{responder=()=>({success:true,data:{...parent,publicEntryId:undefined}});await assert.rejects(()=>api.loginWithGoogle({kind:'parent',entryId:id}));assert.equal(api.getSession(),null)});
await test('Parent request carries ID and role, directory and admin writes are rejected locally',async()=>{responder=()=>({success:true,data:parent});await api.loginWithGoogle({kind:'parent',entryId:id});responder=()=>({success:true,data:[]});await api.getStudents();assert.equal(requests.at(-1).entryId,id);assert.equal(requests.at(-1).portalRole,'parent');await assert.rejects(()=>api.getPortalInvitations());await assert.rejects(()=>api.addTickets({studentId:'STU-001',ticketCount:1,amount:0}))});
await test('Stored role tampering cannot pass server identity validation',async()=>{const stored=api.getSession();stored.user={...parent,role:'admin'};sessionStorage.setItem('eigo_taxi_session',JSON.stringify(stored));responder=()=>({success:true,data:parent});await assert.rejects(()=>api.verifySession({kind:'admin'}));api.logout()});
await test('Rotated individual ID response clears live session',async()=>{responder=()=>({success:true,data:parent});await api.loginWithGoogle({kind:'parent',entryId:id});responder=()=>({success:false,code:'ENTRY_REVOKED',error:'Entry revoked'});await assert.rejects(()=>api.getStudents());assert.equal(api.getSession(),null)});
await test('Demo parent data limited to assigned family and demo role entry mismatch refused',async()=>{api.enterDemo('parent');assert.deepEqual(Array.from(await api.getStudents(),x=>x.id),['STU-001']);await assert.rejects(()=>api.verifySession({kind:'admin'}));api.logout()});
await test('Only a valid developer GAS exec endpoint is accepted',()=>{
  for(const gasApiUrl of ['', 'http://script.google.com/macros/s/test/exec','https://attacker.invalid/exec','https://script.google.com/macros/s/test/dev',configured.gasApiUrl+'?token=secret',configured.gasApiUrl+'#secret','https://user:password@script.google.com/macros/s/test/exec']){
    assert.throws(()=>config.validateDeploymentConfig({...configured,gasApiUrl}));
  }
  assert.throws(()=>config.validateDeploymentConfig({...configured,firebase:{...configured.firebase,authDomain:'attacker.invalid'}}));
});
await test('Missing Google setup prevents any sign-in request',async()=>{
  const before=requests.length;activeConfig={...configured,firebase:null};
  await assert.rejects(()=>api.loginWithGoogle({kind:'admin'}));
  assert.equal(requests.length,before);assert.equal(api.getSession(),null);activeConfig=structuredClone(configured);
});
await test('Saved endpoint overrides are ignored and tokens travel only in a POST body',async()=>{
  localStorage.setItem('eigo_taxi_gas_api_url','https://attacker.invalid/steal');
  responder=()=>({success:true,data:admin});await api.loginWithGoogle({kind:'admin'});
  assert.equal(requestUrls.at(-1),configured.gasApiUrl);assert.equal(requests.at(-1).idToken,idToken);
  assert.equal(requests.at(-1).token,undefined);assert.ok(!requestUrls.at(-1).includes(idToken));assert.equal(api.getGasApiUrl(),configured.gasApiUrl);
  assert.ok(!sessionStorage.getItem('eigo_taxi_session').includes(idToken));api.logout();
});
await test('Tampered saved endpoint or project cannot send a Google token',async()=>{
  responder=()=>({success:true,data:admin});await api.loginWithGoogle({kind:'admin'});
  const saved=api.getSession(),before=requests.length;
  for(const change of [{endpoint:'https://attacker.invalid/steal'},{firebaseProjectId:'other-project'}]){
    sessionStorage.setItem('eigo_taxi_session',JSON.stringify({...saved,...change}));assert.equal(api.getSession(),null);await assert.rejects(()=>api.getStudents());
  }
  assert.equal(requests.length,before);api.logout();
});
await test('Each data call obtains a current Google token without persisting it in app session',async()=>{
  responder=()=>({success:true,data:admin});await api.loginWithGoogle({kind:'admin'});
  idToken='synthetic-refreshed-token';responder=()=>({success:true,data:[]});await api.getStudents();
  assert.equal(requests.at(-1).idToken,idToken);assert.ok(!sessionStorage.getItem('eigo_taxi_session').includes(idToken));api.logout();
});
await test('Missing Google user clears the application session before sending data requests',async()=>{
  responder=()=>({success:true,data:admin});await api.loginWithGoogle({kind:'admin'});const before=requests.length;
  googleUnavailable=true;await assert.rejects(()=>api.getStudents());googleUnavailable=false;
  assert.equal(api.getSession(),null);assert.equal(requests.length,before);
});
await test('Demo-only entry can never start a real Google login',async()=>{
  const before=requests.length;await assert.rejects(()=>api.loginWithGoogle({kind:'parent',entryId:portal.DEMO_ENTRY_ID}));assert.equal(requests.length,before);
});
await test('Logout invalidates an outstanding login response and signs out Firebase',async()=>{
  let resolveResponse;responder=()=>new Promise(resolve=>{resolveResponse=resolve;});
  const pending=api.loginWithGoogle({kind:'admin'});await new Promise(resolve=>setImmediate(resolve));
  const before=signOutCalls;api.logout();resolveResponse({success:true,data:admin});await assert.rejects(()=>pending);
  assert.equal(api.getSession(),null);assert.ok(signOutCalls>before);
});
await test('Account management refuses parent and demo admin without sending requests',async()=>{
 responder=()=>({success:true,data:parent});await api.loginWithGoogle({kind:'parent',entryId:id});const before=requests.length;
 await assert.rejects(()=>api.getManagedUsers());await assert.rejects(()=>api.saveManagedUser({name:'X',email:'x@example.com',role:'admin',active:true,studentIds:[]},'r'));await assert.rejects(()=>api.deleteManagedUser('x','r'));assert.equal(requests.length,before);
 api.enterDemo('admin');await assert.rejects(()=>api.getManagedUsers(),/Google/);api.logout();
});
await test('Account management sends revision with each write and rejects malformed directory',async()=>{
 responder=()=>({success:true,data:admin});await api.loginWithGoogle({kind:'admin'});
 responder=()=>({success:true,data:{users:[],revision:'version-1'}});assert.equal((await api.getManagedUsers()).revision,'version-1');
 await api.saveManagedUser({name:'P',email:'p@example.com',role:'parent',active:true,studentIds:['STU-1']},'version-1');assert.equal(requests.at(-1).expectedRevision,'version-1');assert.equal(requests.at(-1).action,'saveManagedUser');
 await api.deleteManagedUser('user-x','version-2');assert.equal(requests.at(-1).userId,'user-x');assert.equal(requests.at(-1).expectedRevision,'version-2');
 responder=()=>({success:true,data:null});await assert.rejects(()=>api.getManagedUsers());api.logout();
});
await test('Malformed successful list responses are rejected, including health-only payloads',async()=>{
 responder=()=>({success:true,data:admin});await api.loginWithGoogle({kind:'admin'});
 for(const payload of [{success:true,message:'API Ready'},{success:true,data:null},{success:true,data:{}}]){
  responder=()=>payload;
  await assert.rejects(()=>api.getStudents(),/表示件数は未確認/);
  await assert.rejects(()=>api.getRides(),/表示件数は未確認/);
 }
 responder=()=>({success:true,data:[]});assert.equal((await api.getStudents()).length,0);assert.equal((await api.getRides()).length,0);api.logout();
});

const reviewAdmin={id:'reviewer',name:'Synthetic Reviewer',role:'admin',studentIds:['FIXTURE-1'],reviewOnly:true};
const reviewParent={...reviewAdmin,role:'parent',publicEntryId:id};
await test('Reviewer logs in at either separate portal with its current public role and verifies on reload',async()=>{
 for(const [route,user] of [[{kind:'admin'},reviewAdmin],[{kind:'parent',entryId:id},reviewParent]]){
  responder=()=>({success:true,data:user});const logged=await api.loginWithGoogle(route);
  assert.equal(logged.user.role,route.kind);assert.equal(logged.user.reviewOnly,true);
  assert.equal(requests.at(-1).portalRole,route.kind);assert.equal(requests.at(-1).entryId,route.entryId);
  const verified=await api.verifySession(route);assert.equal(verified.user.reviewOnly,true);assert.equal(verified.user.role,route.kind);api.logout();
 }
});
await test('Reviewer rejects wrong portal, wrong personal link and missing allowlist',async()=>{
 responder=()=>({success:true,data:reviewParent});await assert.rejects(()=>api.loginWithGoogle({kind:'admin'}));
 await assert.rejects(()=>api.loginWithGoogle({kind:'parent',entryId:id2}));
 for(const user of [{...reviewAdmin,studentIds:[]},{...reviewAdmin,reviewOnly:'true'}]){
  responder=()=>({success:true,data:user});await assert.rejects(()=>api.loginWithGoogle({kind:'admin'}),/不正/);assert.equal(api.getSession(),null);
 }
});
await test('Reviewer admin filters overbroad student and ride responses by explicit fixture allowlist',async()=>{
 responder=()=>({success:true,data:reviewAdmin});await api.loginWithGoogle({kind:'admin'});
 responder=b=>({success:true,data:b.action==='getStudents'?[{id:'FIXTURE-1'},{id:'REAL-2'}]:[{id:'R-allowed',studentId:'FIXTURE-1',rideDate:'2026-01-01',rideTime:'10:00'},{id:'R-other',studentId:'REAL-2',rideDate:'2026-01-01',rideTime:'10:00'}]});
 assert.deepEqual(Array.from(await api.getStudents(),x=>x.id),['FIXTURE-1']);assert.deepEqual(Array.from(await api.getRides(),x=>x.id),['R-allowed']);
 const before=requests.length;await assert.rejects(()=>api.getStudentById('REAL-2'),/アクセス/);assert.equal(requests.length,before);api.logout();
});
await test('Reviewer cannot call account management, invitation directory or create a student',async()=>{
 responder=()=>({success:true,data:reviewAdmin});await api.loginWithGoogle({kind:'admin'});const before=requests.length;
 await assert.rejects(()=>api.getManagedUsers(),/検証専用/);await assert.rejects(()=>api.getPortalInvitations(),/検証専用/);
 await assert.rejects(()=>api.saveManagedUser({name:'X',email:'x@example.com',role:'admin',active:true,studentIds:[]},'r'),/検証専用/);
 await assert.rejects(()=>api.deleteManagedUser('x','r'),/検証専用/);await assert.rejects(()=>api.createStudent({name:'X',address:'X',ticketBalance:5}),/検証専用/);
 assert.equal(requests.length,before);api.logout();
});
await test('Reviewer admin rejects bookings and ticket writes for other students before a request',async()=>{
 responder=()=>({success:true,data:reviewAdmin});await api.loginWithGoogle({kind:'admin'});const before=requests.length;
 await assert.rejects(()=>api.createReservation({studentId:'REAL-2',rideDate:'2026-01-01',rideTime:'10:00',rideType:'pickup',pickupLocation:'Fixture',reservedBy:'teacher'}),/アクセス/);
 await assert.rejects(()=>api.addTickets({studentId:'REAL-2',ticketCount:10,amount:0}),/アクセス/);assert.equal(requests.length,before);api.logout();
});
await test('Reviewer rejects other ride cancellation and completion even if an overbroad response leaks it',async()=>{
 responder=()=>({success:true,data:reviewAdmin});await api.loginWithGoogle({kind:'admin'});
 responder=()=>({success:true,data:[{id:'R-other',studentId:'REAL-2'}]});const before=requests.length;
 await assert.rejects(()=>api.cancelReservation('R-other'),/アクセス/);await assert.rejects(()=>api.completeRide('R-other'),/アクセス/);
 assert.deepEqual(requests.slice(before).map(x=>x.action),['getRides','getRides']);api.logout();
});
await test('Reviewer fixture mutations keep portal role, operation ID retry and fixed old-date completion',async()=>{
 responder=()=>({success:true,data:reviewAdmin});await api.loginWithGoogle({kind:'admin'});
 const booking={studentId:'FIXTURE-1',rideDate:'2026-01-01',rideTime:'10:00',rideType:'pickup',pickupLocation:'Fixture',reservedBy:'parent'};
 responder=()=>{throw new TypeError('synthetic connection loss');};await assert.rejects(()=>api.createReservation(booking));const first=requests.at(-1);
 responder=b=>({success:true,data:b.action==='getRides'?[{id:'R-fixture',studentId:'FIXTURE-1'}]:reservationRow(b),consumedTickets:1});
 await api.createReservation(booking);assert.equal(requests.at(-1).rideId,first.rideId);assert.equal(requests.at(-1).reservedBy,'teacher');
 await api.completeRide('R-fixture');assert.equal(requests.at(-1).action,'completeRide');assert.equal(requests.at(-1).portalRole,'admin');
 await api.addTickets({studentId:'FIXTURE-1',ticketCount:10,amount:0});assert.equal(requests.at(-1).studentId,'FIXTURE-1');api.logout();
});
function reservationRow(body) {
 return {id:body.rideId,studentId:body.studentId,studentName:'Synthetic rider',rideDate:body.rideDate,
  rideTime:body.rideTime,rideType:body.rideType,pickupLocation:body.pickupLocation?.trim(),
  note:(body.note||'').trim(),reservedBy:body.reservedBy,status:'scheduled',calendarEventId:'synthetic-event'};
}
const retryBooking={studentId:'STU-001',rideDate:'2026-11-09',rideTime:'17:30',rideType:'dropoff',pickupLocation:' Gate ',note:' Test ',reservedBy:'teacher'};
await test('Unconfirmed reservation responses keep the same ID through reload and a verified replay',async()=>{
 responder=()=>({success:true,data:parent});await api.loginWithGoogle({kind:'parent',entryId:id});
 const ledger=new Map(),ids=[];
 let reply=()=>({success:true,message:'API Ready'});
 responder=body=>{
  ids.push(body.rideId);
  if(!ledger.has(body.rideId))ledger.set(body.rideId,reservationRow(body));
  return reply(ledger.get(body.rideId));
 };
 const fresh=load('src/services/api.ts',p=>p==='../portal'?portal:p==='../deployment-config'?configApi:p==='./google-auth'?google:require(p)).ApiService;
 const pending=()=>Object.values(JSON.parse(sessionStorage.getItem('eigo_taxi_pending_mutations')));
 const outcomes=[];
 for(const service of [api,fresh]){
  outcomes.push(await service.createReservation(retryBooking).then(()=> 'accepted',error=>error.message));
 }
 assert.equal(ledger.size,1,'Two attempts after an unconfirmed response must write only one synthetic ride');
 for(const outcome of outcomes)assert.match(outcome,/登録結果/);
 assert.deepEqual(pending(),[ids[0]]);
 for(const data of [null,[],{},'invalid']){
  reply=()=>({success:true,data});
  await assert.rejects(()=>fresh.createReservation(retryBooking),/登録結果/);
 }
 for(const invalid of [{id:'wrong'}, {studentId:'OTHER'}, {rideType:'roundtrip'},
  {rideDate:'2026-11-10'}, {rideTime:'18:00'}, {pickupLocation:'Other'}, {note:'Other'},
  {reservedBy:'teacher'}, {studentName:{}}, {status:'cancelled'}, {status:'unknown'},
  {calendarEventId:{}}, {completedAt:42}]){
  reply=row=>({success:true,data:{...row,...invalid}});
  await assert.rejects(()=>fresh.createReservation(retryBooking),/登録結果/);
  assert.deepEqual(pending(),[ids[0]]);
 }
 reply=row=>({success:true,replayed:true,data:{...row,status:'completed',completedAt:'2026/11/09 18:01:00'}});
 const recovered=await fresh.createReservation(retryBooking);
 assert.equal(recovered.id,ids[0]);assert.equal(recovered.status,'completed');assert.equal(recovered.reservedBy,'parent');
 assert.equal(ledger.size,1);assert.deepEqual([...new Set(ids)],[ids[0]]);assert.deepEqual(pending(),[]);
 reply=row=>({success:true,data:row});
 const next=await fresh.createReservation(retryBooking);assert.notEqual(next.id,recovered.id);assert.equal(ledger.size,2);
 fresh.logout();
});
await test('Late success from a shared ID cannot remove a newer pending reservation ID',async()=>{
 responder=()=>({success:true,data:admin});await api.loginWithGoogle({kind:'admin'});
 let finishFirst;
 responder=b=>new Promise(resolve=>{finishFirst=()=>resolve({success:true,data:reservationRow(b)});});
 const late=api.createReservation(retryBooking);await new Promise(resolve=>setImmediate(resolve));
 responder=b=>({success:true,replayed:true,data:{...reservationRow(b),status:'cancelled'}});
 const replay=await api.createReservation(retryBooking);assert.equal(replay.status,'cancelled');
 responder=()=>{throw new TypeError('connection lost');};
 await assert.rejects(()=>api.createReservation(retryBooking));const newerId=requests.at(-1).rideId;
 assert.notEqual(newerId,replay.id);finishFirst();await late;
 responder=b=>({success:true,replayed:true,data:reservationRow(b)});
 assert.equal((await api.createReservation(retryBooking)).id,newerId);api.logout();
});
await test('Reviewer parent cannot use admin mutations and cancellation still carries its personal entry',async()=>{
 responder=()=>({success:true,data:reviewParent});await api.loginWithGoogle({kind:'parent',entryId:id});const before=requests.length;
 await assert.rejects(()=>api.completeRide('R-fixture'));await assert.rejects(()=>api.addTickets({studentId:'FIXTURE-1',ticketCount:10,amount:0}));assert.equal(requests.length,before);
 responder=b=>({success:true,data:b.action==='getRides'?[{id:'R-fixture',studentId:'FIXTURE-1'}]:true});await api.cancelReservation('R-fixture');assert.equal(requests.at(-1).entryId,id);assert.equal(requests.at(-1).portalRole,'parent');api.logout();
});
await test('Review unavailable response ends the restricted session and prevents subsequent requests',async()=>{
 responder=()=>({success:true,data:reviewAdmin});await api.loginWithGoogle({kind:'admin'});responder=()=>({success:false,code:'REVIEW_UNAVAILABLE',error:'検証を停止しています'});
 await assert.rejects(()=>api.getStudents(),/検証を停止/);assert.equal(api.getSession(),null);const before=requests.length;await assert.rejects(()=>api.getRides());assert.equal(requests.length,before);
});
await test('Full admin directory preserves stored reviewer role and exact server capability',async()=>{
 responder=()=>({success:true,data:admin});await api.loginWithGoogle({kind:'admin'});
 responder=()=>({success:true,data:{users:[{...reviewParent,role:'reviewer',email:'review@example.test',active:true,linked:true}],revision:'r-review',reviewModeAvailable:true}});
 const directory=await api.getManagedUsers();assert.equal(directory.reviewModeAvailable,true);assert.equal(directory.users[0].role,'reviewer');
 await api.saveManagedUser({name:'Review',email:'review@example.test',role:'reviewer',active:true,studentIds:['FIXTURE-1'],rotateEntry:true},directory.revision);
 assert.equal(requests.at(-1).role,'reviewer');assert.equal(requests.at(-1).rotateEntry,true);api.logout();
});

// @trace REQ-22 PT-21
await test('Fresh service instance reload retains created student and reservation IDs and values in demo storage',async()=>{
 api.enterDemo('admin');const student=await api.createStudent({name:'Reload fixture',parentName:'Fixture parent',phone:'000',address:'Fixture address',ticketBalance:7});
 const ride=await api.createReservation({studentId:student.id,rideDate:'2026-10-25',rideTime:'17:30',rideType:'dropoff',pickupLocation:'Reload point',reservedBy:'teacher'});
 const fresh=load('src/services/api.ts',p=>p==='../portal'?portal:p==='../deployment-config'?configApi:p==='./google-auth'?google:require(p)).ApiService;
 assert.ok((await fresh.verifySession({kind:'admin'})).user.role==='admin');assert.equal((await fresh.getStudents()).find(x=>x.id===student.id).name,'Reload fixture');const found=(await fresh.getRides()).find(x=>x.id===ride.id);assert.equal(found.rideTime,'17:30');assert.equal(found.pickupLocation,'Reload point');fresh.logout();
});

const dir=process.env.EIGO_TEST_OUTPUT_DIR||'docs/acceptance/developer-setup-2026-10-21';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/frontend-contract.json',JSON.stringify({executedAt:new Date().toISOString(),mode:'Node VM; Firebase SDK and GAS responses stubbed; no real Google sign-in claim',passed,total:rows.length,sourceHashes:Object.fromEntries(['src/deployment-config.ts','src/services/api.ts','src/services/google-auth.ts','src/portal.ts',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),results:rows},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
