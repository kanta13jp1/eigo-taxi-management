const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const http = require('node:http');
const puppeteer = require('puppeteer-core');
const os = require('node:os');
const shellRoot=path.join(os.homedir(),'.cache/puppeteer/chrome-headless-shell');
const shellVersion=fs.readdirSync(shellRoot).filter(f=>f.startsWith('win64-')).sort().at(-1);
const executablePath=path.join(shellRoot,shellVersion,'chrome-headless-shell-win64/chrome-headless-shell.exe');
const { cases } = require('./acceptance-catalog.cjs');
const root = path.resolve(__dirname, '..');
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const out = path.join(root, 'docs/acceptance/runs', runId);
fs.mkdirSync(out, { recursive: true });
const url = 'http://127.0.0.1:4179';
const pause = ms => new Promise(r => setTimeout(r, ms));
const hash = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
let page, browser, server;
let serverOutput = '';
const results = [];
let liveFixture = null;
let liveMutationsFail = false;
let liveFailureMode = 'abort';
let liveAuthRevoked = false;
const mutationAudit = [];
async function api(method, ...args) {
  return page.evaluate(async (method, args) => {
    const { ApiService } = await import('/src/services/api.ts');
    return ApiService[method](...args);
  }, method, args);
}
async function stored(key) { return page.evaluate(k => JSON.parse(localStorage.getItem(k)), key); }
async function click(text) {
  await page.waitForFunction(text => [...document.querySelectorAll('button')].some(b => b.textContent.includes(text)), {}, text);
  const btn = await page.evaluateHandle(text => [...document.querySelectorAll('button')].find(b => b.textContent.includes(text)), text);
  await btn.asElement().click();
  await btn.dispose();
  await pause(100);
}
async function parent() { await click('送迎利用者'); }
async function render() { await page.reload({ waitUntil:'networkidle0' }); }
async function ride(type='pickup', by='parent') {
  return api('createReservation', { studentId:'STU-001', rideDate:'2026-10-20',rideTime:'16:30',rideType:type,pickupLocation:'受入テスト専用住所',note:'acceptance',reservedBy:by });
}
async function uiRide(by='parent', expectFailure=false) {
  if (by==='parent') { await parent(); await click('送迎の予約を申し込む'); }
  else await click('送迎予定を追加');
  await page.waitForSelector('input[type="date"]');
  await page.evaluate(() => {
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
    for(const [sel,value] of [['input[type="date"]','2026-10-20'],['input[type="time"]','16:30']]) {
      const el=document.querySelector(sel); set.call(el,value); el.dispatchEvent(new Event('input',{bubbles:true}));
    }
  });
  await click('送迎予定を登録する');
  if(expectFailure){
    await page.waitForSelector('form [role="alert"]');
    assert.ok((await page.$eval('form [role="alert"]',el=>el.textContent)).includes('通信または連携処理に失敗しました'),'通信失敗の案内が不足');
    assert.ok(await page.$('input[type="date"]'),'失敗時にフォームが閉じた');
    assert.ok(!(await page.evaluate(()=>document.body.innerText)).includes('を登録しました'),'失敗時に成功通知を表示');
  }else await page.waitForFunction(() => !document.querySelector('input[type="date"]'));
}
const handlers = {
 'AT-01':async()=>{ await click('Google連携'); await page.type('input[type="url"]','https://test.invalid/exec'); await click('設定を保存'); assert.equal(await api('getGasApiUrl'),'https://test.invalid/exec'); await render(); assert.equal(await api('getGasApiUrl'),'https://test.invalid/exec'); await click('Google連携'); },
 'AT-02':async()=>{
   await click('生徒・チケット管理'); await click('新規生徒を登録');
   for(const [sel,value] of [['input[placeholder*="佐藤 陽菜"]','受入テスト生徒'],['input[placeholder*="佐藤 美咲"]','受入テスト保護者'],['input[placeholder*="090-1234"]','000-0000-0000'],['input[placeholder*="桜新町"]','受入テスト専用住所']]) await page.type(sel,value);
   await click('登録を完了する');
   await page.waitForFunction(()=>JSON.parse(localStorage.getItem('eigo_taxi_students')).length===4);
   const s=(await stored('eigo_taxi_students')).find(s=>s.name==='受入テスト生徒');
   assert.deepEqual([s.parentName,s.phone,s.address,s.ticketBalance],['受入テスト保護者','000-0000-0000','受入テスト専用住所',10]);
 },
 'AT-03':async()=>{ await parent(); const text=await page.evaluate(()=>document.body.innerText); assert.ok(text.includes('7回分')); assert.ok(text.includes('片道1回につきチケット1枚消費')); assert.ok(text.includes('田中')); },
 'AT-04':async()=>{for(const balance of [2,1,0]) {
   await page.evaluate(b=>{const s=JSON.parse(localStorage.getItem('eigo_taxi_students'));s[0].ticketBalance=b;localStorage.setItem('eigo_taxi_students',JSON.stringify(s));},balance);
   await render(); await parent(); assert.ok((await page.evaluate(()=>document.body.innerText)).includes('Mauro・Brenda に連絡してね！'));
   await page.screenshot({path:path.join(out,`AT-04-balance-${balance}.png`),fullPage:true});
 }},
 'AT-05':async()=>{const count=(await stored('eigo_taxi_purchases')).length; await api('addTickets',{studentId:'STU-001',ticketCount:10,amount:10000,note:'受入追加'}); assert.equal((await api('getStudentById','STU-001')).ticketBalance,17); const p=await stored('eigo_taxi_purchases');assert.equal(p.length,count+1);assert.deepEqual([p[0].ticketCount,p[0].amount,p[0].note],[10,10000,'受入追加']);await render();await parent();},
 'AT-06':async()=>{const before=(await api('getRides')).length;await uiRide();const r=(await api('getRides')).filter(r=>r.id.startsWith('RIDE-')&&!['RIDE-101','RIDE-102','RIDE-103'].includes(r.id));assert.equal((await api('getRides')).length,before+1);assert.deepEqual([r[0].rideType,r[0].status,r[0].reservedBy,r[0].rideDate,r[0].rideTime],['pickup','scheduled','parent','2026-10-20','16:30']);assert.equal((await api('getStudentById','STU-001')).ticketBalance,7);},
 'AT-07':async()=>{const n=(await api('getRides')).length;const r=await ride('dropoff');assert.equal((await api('getRides')).length,n+1);assert.equal(r.rideType,'dropoff');assert.equal((await api('getStudentById','STU-001')).ticketBalance,7);await render();await parent();},
 'AT-08':async()=>{const n=(await api('getRides')).length;const r=await ride('roundtrip');assert.equal((await api('getRides')).length,n+1);assert.equal(r.rideType,'roundtrip');assert.equal((await api('getStudentById','STU-001')).ticketBalance,7);await render();await parent();},
 'AT-09':async()=>{const n=(await api('getRides')).length;await uiRide('teacher');const r=(await api('getRides')).find(r=>!['RIDE-101','RIDE-102','RIDE-103'].includes(r.id));assert.equal((await api('getRides')).length,n+1);assert.equal(r.reservedBy,'teacher');},
 'AT-10':async()=>{await parent(); await click('キャンセル'); await page.waitForFunction(()=>JSON.parse(localStorage.getItem('eigo_taxi_rides')).some(r=>r.status==='cancelled'));assert.equal((await api('getRides')).find(r=>r.id==='RIDE-101').status,'cancelled');assert.equal((await api('getStudentById','STU-001')).ticketBalance,7);},
 'AT-11':async()=>{const r=await ride('pickup','teacher');assert.equal(await api('cancelReservation',r.id),true);assert.equal((await api('getRides')).find(x=>x.id===r.id).status,'cancelled');assert.equal((await api('getStudentById','STU-001')).ticketBalance,7);await render();await click('送迎スケジュール一覧');},
 'AT-12':async()=>{const links=await page.$$eval('a',as=>as.map(a=>a.href));assert.ok(links.some(l=>l.includes('google.com/maps/search/')));assert.ok((await page.evaluate(()=>document.body.innerText)).includes('本日の送迎'));},
 'AT-13':async()=>{const r=await ride();await api('completeRide',r.id);const x=(await api('getRides')).find(x=>x.id===r.id);assert.equal(x.status,'completed');assert.ok(x.completedAt);assert.equal((await api('getStudentById','STU-001')).ticketBalance,6);await render();await parent();},
 'AT-14':async()=>{const r=await ride('roundtrip');const result=await api('completeRide',r.id);assert.equal(result.consumedTickets,2);assert.equal((await api('getStudentById','STU-001')).ticketBalance,5);assert.equal((await api('getRides')).find(x=>x.id===r.id).status,'completed');await render();await parent();},
 'AT-15':async()=>{const r=await ride();await api('completeRide',r.id);const replay=await api('completeRide',r.id);assert.equal(replay.consumedTickets,0);await render();await parent();assert.equal((await api('getStudentById','STU-001')).ticketBalance,6);assert.equal((await api('getRides')).find(x=>x.id===r.id).status,'completed');},
 'AT-16':async()=>{const r=await ride();await api('cancelReservation',r.id);const result=await api('completeRide',r.id);assert.equal(result.success,false);await render();await parent();assert.equal((await api('getStudentById','STU-001')).ticketBalance,7);assert.equal((await api('getRides')).find(x=>x.id===r.id).status,'cancelled');},
 'AT-17':async()=>{const count=(await stored('eigo_taxi_purchases')).length;for(const ticketCount of [-1,0,1.5,NaN,Infinity,101])await assert.rejects(()=>api('addTickets',{studentId:'STU-001',ticketCount,amount:0}));for(const amount of [-1,1.5,NaN,Infinity])await assert.rejects(()=>api('addTickets',{studentId:'STU-001',ticketCount:1,amount}));await render();await parent();assert.equal((await api('getStudentById','STU-001')).ticketBalance,7);assert.equal((await stored('eigo_taxi_purchases')).length,count);},
 'AT-18':async()=>{
   liveFixture={students:await api('getStudents'),rides:await api('getRides')};liveMutationsFail=true;
   const before=await page.evaluate(()=>JSON.stringify(localStorage));
   await click('ログアウト');
   await page.type('#login-endpoint',url+'/test-gas');await page.type('#login-key','acceptance-only-fake-key');await click('ログイン');
   await page.waitForFunction(()=>document.body.innerText.includes('先生用管理ダッシュボード'));
   const params={studentId:'STU-001',ticketCount:10,amount:10000};
   for(const [method,args]of [['createReservation',[{studentId:'STU-001',rideDate:'2026-10-20',rideTime:'16:30',rideType:'pickup',pickupLocation:'テスト',reservedBy:'teacher'}]],['cancelReservation',['RIDE-101']],['completeRide',['RIDE-101']],['addTickets',[params]],['createStudent',[{name:'失敗対象',address:'テスト',parentName:'',phone:'',pickupNote:'',ticketBalance:1}]]])await assert.rejects(()=>api(method,...args));
   await assert.rejects(()=>api('createReservation',{studentId:'STU-001',rideDate:'2026-10-20',rideTime:'16:30',rideType:'pickup',pickupLocation:'テスト',reservedBy:'teacher'}));
   const attempts=mutationAudit.filter(x=>x.action==='createReservation');assert.equal(attempts.length,2);assert.equal(attempts[0].id,attempts[1].id,'再試行で予約IDが変わった');
   for(const mode of ['response','http','json']){liveFailureMode=mode;await assert.rejects(()=>api('addTickets',params));}liveFailureMode='abort';
   const after=await page.evaluate(()=>({students:localStorage.getItem('eigo_taxi_students'),rides:localStorage.getItem('eigo_taxi_rides'),purchases:localStorage.getItem('eigo_taxi_purchases')}));
   const original=JSON.parse(before);assert.equal(after.students,original.eigo_taxi_students);assert.equal(after.rides,original.eigo_taxi_rides);assert.equal(after.purchases,original.eigo_taxi_purchases);
   await uiRide('teacher',true);
 },
 'AT-19':async()=>{
   const text=await page.evaluate(()=>document.body.innerText);assert.ok(!text.includes('田中')&&!text.includes('生徒・チケット管理'),'未認証で管理画面・生徒氏名が表示された');for(const method of ['getStudents','getRides'])await assert.rejects(()=>api(method));await assert.rejects(()=>api('addTickets',{studentId:'STU-001',ticketCount:10,amount:10000}));assert.equal(await stored('eigo_taxi_students'),null);assert.equal(await stored('eigo_taxi_rides'),null);
   await page.screenshot({path:path.join(out,'AT-19-unauthenticated.png'),fullPage:true});
   await api('enterDemo','admin');liveFixture={students:await api('getStudents'),rides:await api('getRides')};await api('logout');
   await page.type('#login-endpoint',url+'/test-gas');await page.type('#login-key','acceptance-only-fake-key');await click('ログイン');await page.waitForFunction(()=>document.body.innerText.includes('先生用管理ダッシュボード'));
   liveAuthRevoked=true;await assert.rejects(()=>api('getStudents'));await page.waitForSelector('#login-key');assert.equal(await api('getSession'),null);assert.ok(!(await page.evaluate(()=>document.body.innerText)).includes('田中'));liveAuthRevoked=false;
 },
 'AT-20':async()=>{await click('ログアウト');await click('保護者デモを開く');await page.waitForSelector('select');const options=await page.$$eval('select option',os=>os.map(o=>o.value));assert.deepEqual(options,['STU-001']);assert.deepEqual((await api('getStudents')).map(s=>s.id),['STU-001']);assert.ok((await api('getRides')).every(r=>r.studentId==='STU-001'));await assert.rejects(()=>api('getStudentById','STU-002'));await assert.rejects(()=>api('cancelReservation','RIDE-102'));await assert.rejects(()=>api('createReservation',{studentId:'STU-002',rideDate:'2026-10-20',rideTime:'16:30',rideType:'pickup',pickupLocation:'他家庭',reservedBy:'parent'}));await assert.rejects(()=>api('completeRide','RIDE-101'));await assert.rejects(()=>api('addTickets',{studentId:'STU-001',ticketCount:1,amount:0}));assert.ok(!(await page.evaluate(()=>document.body.innerText)).includes('生徒・チケット管理'));},
 'AT-21':async()=>{await page.setViewport({width:375,height:812,isMobile:true,hasTouch:true});for(const view of ['teacher','parent','form']){if(view==='parent')await parent();if(view==='form')await click('送迎の予約を申し込む');const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));assert.ok(dimensions.scroll<=375&&dimensions.viewport<=375,`横はみ出し: ${view} ${JSON.stringify(dimensions)}`);await page.screenshot({path:path.join(out,`AT-21-${view}.png`),fullPage:true});}},
 'AT-22':async()=>{const s=await api('createStudent',{name:'永続化テスト',parentName:'保護者',phone:'',address:'テスト住所',pickupNote:'',ticketBalance:10});const r=await ride();await render();assert.equal((await api('getStudentById',s.id)).name,'永続化テスト');assert.equal((await api('getRides')).find(x=>x.id===r.id).pickupLocation,'受入テスト専用住所');await click('生徒・チケット管理');},
};
async function main(){
 const apiFile=path.join(out,'api.mjs');
 execFileSync(process.execPath,['-e',`const ts=require('typescript'),fs=require('fs');fs.writeFileSync(process.argv[1],ts.transpileModule(fs.readFileSync('src/services/api.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText)`,apiFile],{cwd:root,windowsHide:true});
 const apiJs=fs.readFileSync(apiFile);
 const dist=path.join(root,'dist');
 server=http.createServer((req,res)=>{
   const pathname=new URL(req.url,url).pathname;
   if(pathname==='/src/services/api.ts'){res.setHeader('Content-Type','text/javascript');res.end(apiJs);return;}
   const target=path.resolve(dist,'.'+(pathname==='/'?'/index.html':decodeURIComponent(pathname)));
   if(!target.startsWith(dist+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);res.end();return;}
   res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'})[path.extname(target)]||'application/octet-stream');res.end(fs.readFileSync(target));
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(4179,'127.0.0.1',resolve);});
 serverOutput='Static dist server; source API transpiled with TypeScript for service assertions. External requests blocked.\n';
 browser=await puppeteer.launch({executablePath,headless:'shell',args:['--disable-gpu','--renderer-process-limit=1','--disable-extensions']});
 page=await browser.newPage();
 await page.emulateTimezone('Asia/Tokyo');
 page.on('dialog',d=>d.accept());
 await page.setRequestInterception(true);
 page.on('request',r=>{
   if(r.url()===url+'/test-gas'){
     const body=JSON.parse(r.postData()||'{}');
     if(body.action==='login')return r.respond({status:200,contentType:'application/json',body:JSON.stringify(body.token==='acceptance-only-fake-key'?{success:true,data:{id:'test-admin',name:'通信障害テスト管理者',role:'admin',studentIds:[]}}:{success:false,error:'認証できません'})});
     if(liveAuthRevoked)return r.respond({status:200,contentType:'application/json',body:JSON.stringify({success:false,code:'UNAUTHORIZED',error:'アクセスキーを確認してください'})});
     if(body.action==='getStudents'||body.action==='getRides')return r.respond({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:body.action==='getStudents'?liveFixture.students:liveFixture.rides})});
     if(liveMutationsFail){
       mutationAudit.push({action:body.action,id:body.rideId||body.purchaseId||body.id});
       if(liveFailureMode==='response')return r.respond({status:200,contentType:'application/json',body:JSON.stringify({success:false,code:'SERVICE_ERROR',error:'テスト用の更新失敗'})});
       if(liveFailureMode==='http')return r.respond({status:503,contentType:'application/json',body:'{}'});
       if(liveFailureMode==='json')return r.respond({status:200,contentType:'application/json',body:'not-json'});
       return r.abort('failed');
     }
   }
   return r.url().startsWith(url)||r.url().startsWith('data:')?r.continue():r.abort();
 });
 for(const c of cases){
   const result={id:c.id,status:'BLOCKED',startedAt:new Date().toISOString(),detail:'専用Google環境・権限・受入担当または前段合格が未準備。実サービス操作は未実施。',screenshots:[]};
   if(c.kind==='auto'){
     try{
       await page.setViewport({width:1280,height:900});
       await page.goto(url,{waitUntil:'networkidle0'});
       await page.evaluate(()=>{localStorage.clear();sessionStorage.clear();});
       await render();
       if(c.id!=='AT-19'){
         const parentCase=['AT-03','AT-04','AT-06','AT-07','AT-08','AT-10'].includes(c.id);
         await click(parentCase?'保護者デモを開く':'管理者デモを開く');
         if(parentCase)await page.waitForSelector('select');
         else await page.waitForFunction(()=>document.body.innerText.includes('先生用管理ダッシュボード'));
         await api('getStudents');await api('getRides');await api('getStudentById','STU-001');
       }
       // Seed purchase history before count assertions.
       if(c.id!=='AT-19')await page.evaluate(()=>{if(!localStorage.getItem('eigo_taxi_purchases'))localStorage.setItem('eigo_taxi_purchases','[]');});
       await handlers[c.id]();result.status='PASS';result.detail='仕様の期待結果を自動assertで確認。デモとローカル模擬API（AT-18/19）のみ。実Google連携は未実施。';
     }catch(e){result.status='FAIL';result.detail=e.message;}
     const screen=`${c.id}.png`;await page.screenshot({path:path.join(out,screen),fullPage:true});
     result.screenshots=fs.readdirSync(out).filter(f=>f.startsWith(c.id)&&f.endsWith('.png')).map(f=>({file:f,sha256:hash(path.join(out,f))}));
     result.observed=await page.evaluate(()=>({students:JSON.parse(localStorage.getItem('eigo_taxi_students')),rides:JSON.parse(localStorage.getItem('eigo_taxi_rides')),purchases:JSON.parse(localStorage.getItem('eigo_taxi_purchases'))}));
   }
   result.finishedAt=new Date().toISOString();results.push(result);console.log(`${c.id} ${result.status} ${result.status==='FAIL'?result.detail:''}`);
 }
}
main().catch(e=>{console.error(e);serverOutput+=e.stack+'\n';process.exitCode=1;}).finally(async()=>{
 if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));
 for(const c of cases.filter(c=>!results.some(r=>r.id===c.id)))results.push({id:c.id,status:c.kind==='external'?'BLOCKED':'NOT RUN',startedAt:null,finishedAt:null,detail:c.kind==='external'?'専用Google環境・権限・受入担当または前段合格が未準備。':'実行基盤の異常終了で未完了。server.log参照。',screenshots:[]});
 fs.writeFileSync(path.join(out,'server.log'),serverOutput);
 const collect=d=>fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(e=>e.isDirectory()?collect(d+'/'+e.name):[d+'/'+e.name]);
 const files=[...new Set([...cases.map(c=>c.file).filter(f=>!f.endsWith('.md')),...collect('src').filter(f=>/\.(ts|tsx|css)$/.test(f))]),'scripts/run_acceptance.cjs','scripts/acceptance-catalog.cjs'];
 const builtFiles=fs.readdirSync(path.join(root,'dist/assets')).filter(f=>/\.(js|css)$/.test(f)).map(f=>'dist/assets/'+f);
 const report={runId,url,mode:'Built dist UI + TypeScript-transpiled source API assertions / fresh headless shell profile / demo LocalStorage; external requests blocked',timezone:'Asia/Tokyo',commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),sourceHashes:Object.fromEntries([...files,...builtFiles,'dist/index.html'].map(f=>[f,hash(path.join(root,f))])),browser:executablePath,results};
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));
 fs.writeFileSync(path.join(root,'docs/acceptance/latest-run.json'),JSON.stringify({runId},null,2));
 if(results.some(r=>r.status!=='PASS')||results.length!==cases.length)process.exitCode=1;
});
