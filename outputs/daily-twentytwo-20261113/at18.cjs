const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict'), http=require('node:http');
const {chromium}=require('../../.manual-build-20261020/node_modules/playwright');
const mode=process.argv[2], old=mode==='before', publicSite=mode==='public';
assert.ok(['before','after','public'].includes(mode));
const dir=path.resolve(__dirname,old?'../../docs/acceptance/deployment/releases/5b9271233ac9309f/payload/dist':'stage/dist');
const site='https://eigo-taxi-test.web.app', name='架空生徒 AT18', address='架空の送迎場所 AT18', key='eigo_taxi_rides';
(async()=>{let server,browser;try{
let base=site;if(!publicSite){server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost').pathname;const file=path.join(dir,u==='/'?'index.html':u);if(!file.startsWith(dir)||!fs.existsSync(file)){res.writeHead(404).end();return;}res.setHeader('content-type',({'.js':'application/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;}
browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const ctx=await browser.newContext({serviceWorkers:'block',locale:'ja-JP',timezoneId:'Asia/Tokyo',viewport:{width:1230,height:980}});const blocked=[];
await ctx.route('**/*',r=>{if(!['GET','HEAD'].includes(r.request().method()) || new URL(r.request().url()).origin!==new URL(base).origin){blocked.push(r.request().method());return r.abort();} return r.continue();});
const p=await ctx.newPage(), button=(name)=>p.getByRole('button',{name,exact:typeof name==='string'}), shot=(f)=>p.screenshot({path:path.join(__dirname,mode+'-'+f+'.png')});
const records=()=>p.evaluate(()=>({students:JSON.parse(localStorage.getItem('eigo_taxi_students')),rides:JSON.parse(localStorage.getItem('eigo_taxi_rides'))}));
await p.goto(base+'/#/admin');await button('管理者デモを開く').click();await button(/生徒・チケット管理/).click();await button('新規生徒を登録').click();
await p.getByPlaceholder('例: 佐藤 陽菜 (ひな)').fill(name);await p.getByPlaceholder(/東京都世田谷区桜新町/).fill(address);await p.getByRole('spinbutton').fill('7');await button('登録を完了する').click();await p.locator('form').waitFor({state:'detached'});
const student=(await records()).students.find(s=>s.name===name);assert.ok(student.id.startsWith('STU-'));assert.equal(student.ticketBalance,7);assert.equal(student.address,address);
async function fillRide(note){await button('送迎予定を追加').click();await p.locator('#ride-student').selectOption(student.id);await p.locator('#ride-date').fill('2026-11-23');await p.locator('#ride-time').fill('15:22');await p.locator('#ride-location').fill(address);await p.locator('#ride-note').fill(note);}
await fillRide('AT18永続化');await button('送迎予定を登録する').click();await p.locator('form').waitFor({state:'detached'});
const data=await records(),ride=data.rides.find(r=>r.note==='AT18永続化');assert.ok(ride.id.startsWith('RIDE-'));assert.equal(ride.studentId,student.id);assert.equal(ride.rideDate,'2026-11-23');assert.equal(ride.rideTime,'15:22');assert.equal(ride.pickupLocation,address);
await p.reload();await button(/送迎スケジュール一覧/).click();await p.getByText(name,{exact:true}).first().waitFor();assert.deepEqual(await records(),data);if(!process.argv[3]||process.argv[3]==='read-error')await shot('reloaded');
const successText='送迎予約のキャンセルが完了しました', unknown='予約の取消結果を確認できませんでした。台帳を再取得して、対象の予約の状態を確認してください。';
const scenario=process.argv[3]||'read-error';const readKey='eigo_taxi_rides';const snapshot=()=>p.evaluate(k=>localStorage.getItem(k),readKey);

await button(new RegExp(name+'.*の予約を取消')).click();await p.getByRole('dialog').waitFor();
await p.evaluate(([scenario,id,key])=>{
  const get=Storage.prototype.getItem,set=Storage.prototype.setItem;
  window.qaWrites=0;let armed=false;
  Storage.prototype.setItem=function(k,v){if(scenario==='write-error' && this===localStorage && k===key)throw new Error('検証用：取消を保存できませんでした');set.call(this,k,v);if(this===localStorage && k===key){window.qaWrites++;armed=true;}};
  Storage.prototype.getItem=function(k){const v=get.call(this,k);if(!armed || this!==localStorage || k!==key)return v;armed=false;
    if(scenario==='session-ended'){sessionStorage.removeItem('eigo_taxi_session');window.dispatchEvent(new Event('eigo-taxi-session-ended'));return v;}
    if(scenario==='read-error')throw new Error('検証用：予約一覧の再取得に失敗しました');
    const list=JSON.parse(v);const unrelated={...list.find(r=>r.id===id),id:'RIDE-AT18-CONTROL',status:'cancelled'};
    if(scenario==='stale-target')return JSON.stringify([...list.map(r=>r.id===id?{...r,status:'scheduled'}:r),unrelated]);
    if(scenario==='missing-target')return JSON.stringify([...list.filter(r=>r.id!==id),unrelated]);
    return v;};
},[scenario,ride.id,readKey]);
await button('取消を確定').click();
if(scenario==='session-ended'){await button('管理者デモを開く').waitFor();assert.equal(await p.getByText(successText,{exact:true}).count(),0);assert.equal(await p.getByText(unknown,{exact:true}).count(),0);assert.equal(await p.evaluate(()=>window.qaWrites),1);assert.equal((await records()).rides.find(r=>r.id===ride.id).status,'cancelled');assert.deepEqual(blocked,[]);await shot(scenario);fs.writeFileSync(path.join(__dirname,mode+'-'+scenario+'.json'),JSON.stringify({mode,scenario,base,successVisible:false,staleErrorVisible:false,loginVisible:true,writeCount:1,blockedRequests:blocked},null,2));return;}
const normal=scenario==='normal';const rejected=scenario==='write-error';if(rejected)await p.getByText('検証用：取消を保存できませんでした',{exact:true}).waitFor();else if(old||normal)await p.getByText(successText,{exact:true}).waitFor();else await p.getByText(unknown,{exact:true}).waitFor();
const successVisible=await p.getByText(successText,{exact:true}).isVisible(), alert=await p.getByRole('alert').allTextContents();
assert.equal(successVisible,old||normal);if(old && scenario==='read-error')assert.equal(alert.length,1);if(!old&&!normal&&!rejected)assert.deepEqual(alert,[unknown]);
await shot(scenario);const afterWrite=JSON.parse(await snapshot());assert.deepEqual(afterWrite,rejected?data.rides:data.rides.map(r=>r.id===ride.id?{...r,status:'cancelled'}:r));assert.deepEqual((await records()).students,data.students);
if(!old&&!normal){await button('台帳を再取得する').click();await button(/送迎スケジュール一覧/).click();if(rejected)await button(new RegExp(name+'.*の予約を取消')).waitFor();else await p.getByRole('row').filter({hasText:name}).getByText('取消',{exact:true}).waitFor();}
if(scenario==='read-error'&&!old)await shot('recovered');assert.equal(await p.evaluate(()=>window.qaWrites),rejected?0:1);assert.deepEqual(blocked,[]);
const report={mode,scenario,checkedAt:new Date().toISOString(),test:'AT-18',base,freshAnonymousAdminDemo:true,studentId:student.id,rideId:ride.id,successVisible,alert,reloadOnlyRecovery:!normal&&!old,cancelledInLedger:!rejected,onlyChangedTargetStatus:!rejected,studentBalancesUnchanged:true,writeCount:rejected?0:1,blockedRequests:blocked,scope:'Isolated synthetic browser demo; simulated read response, no Google or customer records.'};
fs.writeFileSync(path.join(__dirname,mode+'-'+scenario+'.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1});