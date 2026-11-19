// Published test frontend, fresh anonymous profile, browser-local demo only.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(path.resolve('.manual-build-20261020/node_modules/playwright'));
const out=path.resolve(process.argv[2]||'');
assert.ok(process.argv[2] && out.startsWith(path.resolve('outputs')+path.sep));
await fs.mkdir(out,{recursive:false});
const base='https://eigo-taxi-test.web.app';
const startedAt=new Date().toISOString();
const date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const releaseResponse=await fetch(base+'/release.json',{headers:{'Cache-Control':'no-cache'}});
assert.equal(releaseResponse.status,200);
const releaseBytes=Buffer.from(await releaseResponse.arrayBuffer());
const release=JSON.parse(releaseBytes.toString());
assert.equal(release.environment,'mighty-test');assert.equal(release.siteId,'eigo-taxi-test');
const results=[],blockedMutations=[],blockedSockets=[],pageErrors=[];
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try {
  for(const role of ['admin','parent']) for(const viewport of [{width:375,height:500},{width:812,height:375}]) {
    const id=`HOSTED-SCROLL-${role}-${viewport.width}x${viewport.height}`;
    const context=await browser.newContext({viewport,isMobile:true,hasTouch:true,timezoneId:'Asia/Tokyo',serviceWorkers:'block'});
    await context.route('**/*',route=>{
      const req=route.request();
      if(!['GET','HEAD'].includes(req.method())) {blockedMutations.push({method:req.method(),origin:new URL(req.url()).origin});return route.abort('blockedbyclient');}
      return route.continue();
    });
    await context.routeWebSocket('**/*',socket=>{blockedSockets.push(new URL(socket.url()).origin);socket.close();});
    const page=await context.newPage();page.setDefaultTimeout(12000);
    page.on('pageerror',e=>pageErrors.push({id,error:e.message}));
    let row={id,role,viewport,status:'FAIL'};
    try {
      await page.goto(`${base}/#/${role}`,{waitUntil:'networkidle'});
      await page.getByRole('button',{name:role==='admin'?'管理者デモを開く':'保護者デモを開く',exact:true}).click();
      await page.getByRole('button',{name:'ログアウト',exact:true}).waitFor();
      assert.ok((await page.locator('body').innerText()).includes('デモ環境・架空データ（Google連携なし）'));
      const initial=await page.evaluate(()=>({rides:JSON.parse(localStorage.getItem('eigo_taxi_rides')||'[]'),students:JSON.parse(localStorage.getItem('eigo_taxi_students')||'[]')}));
      await page.getByRole('button',{name:role==='admin'?'送迎予定を追加':/送迎の予約を申し込む/,exact:role==='admin'}).click();
      const form=page.locator('form');
      await form.locator('input[type=date]').fill(date);
      await form.locator('input[type=time]').fill('16:35');
      await form.locator('input[type=text]').fill('公開画面の架空デモ試験場所');
      await form.locator('textarea').fill(id);
      const submit=form.getByRole('button',{name:'送迎予定を登録する',exact:true});
      await submit.scrollIntoViewIfNeeded({timeout:2500});
      const box=await submit.boundingBox();
      row.submitBox=box;
      row.panel=await page.getByRole('heading',{name:'送迎予定の登録',exact:true}).locator('xpath=../../..').evaluate(e=>({maxHeight:getComputedStyle(e).maxHeight,overflowY:getComputedStyle(e).overflowY,clientHeight:e.clientHeight,scrollHeight:e.scrollHeight,scrollTop:e.scrollTop}));
      await page.screenshot({path:path.join(out,id+'-button.png'),fullPage:true});
      assert.ok(box&&box.y>=0&&box.y+box.height<=viewport.height,'Registration button must be within viewport after scrolling');
      assert.equal(row.panel.overflowY,'auto');
      await submit.tap({timeout:2500});
      await form.waitFor({state:'detached'});
      const after=await page.evaluate(()=>({rides:JSON.parse(localStorage.getItem('eigo_taxi_rides')||'[]'),students:JSON.parse(localStorage.getItem('eigo_taxi_students')||'[]')}));
      const added=after.rides.find(r=>r.note===id);
      assert.equal(after.rides.length,initial.rides.length+1);
      assert.ok(added);assert.equal(added.rideDate,date);assert.equal(added.rideTime,'16:35');
      assert.equal(added.reservedBy,role==='admin'?'teacher':'parent');
      assert.deepEqual(after.students.map(s=>s.ticketBalance),initial.students.map(s=>s.ticketBalance));
      await page.reload({waitUntil:'networkidle'});
      await page.getByRole('button',{name:'ログアウト',exact:true}).waitFor();
      assert.ok(await page.evaluate(note=>JSON.parse(localStorage.getItem('eigo_taxi_rides')||'[]').some(r=>r.note===note),id));
      await page.getByRole('button',{name:'ログアウト',exact:true}).click();
      await page.reload({waitUntil:'networkidle'});
      await page.getByRole('heading',{name:role==='admin'?'管理者専用ログイン':'生徒・保護者専用ログイン',exact:true}).waitFor();
      assert.equal(await page.getByRole('button',{name:'ログアウト',exact:true}).count(),0);
      row.status='PASS';row.assertions=['published demo mode','button reachable','submission closes form','one local reservation added','JST date and role match','balance unchanged','reload preserves reservation','logout and reload hide ledger'];
    } catch(e) {row.error=e.message;}
    const file=id+'.png';await page.screenshot({path:path.join(out,file),fullPage:true});
    row.screenshot={file,sha256:sha(await fs.readFile(path.join(out,file)))};
    results.push(row);console.log(id+' '+row.status+(row.error?' '+row.error:''));
    await context.close();
  }
} finally {
  await browser.close();
  const finalRelease=Buffer.from(await (await fetch(base+'/release.json',{headers:{'Cache-Control':'no-cache'}})).arrayBuffer());
  const report={startedAt,finishedAt:new Date().toISOString(),date,base,scope:'Published frontend using anonymous browser-local demo only; no Google identity, live spreadsheet, Calendar, physical device or third-party acceptance',browser:'Microsoft Edge headless mobile/touch emulation',testScriptSha256:sha(await fs.readFile(new URL(import.meta.url))),release,releaseSha256:sha(releaseBytes),releaseUnchangedDuringRun:sha(releaseBytes)===sha(finalRelease),results,blockedMutations,blockedSockets,pageErrors};
  report.pass=results.length===4&&results.every(r=>r.status==='PASS')&&!blockedMutations.length&&!blockedSockets.length&&!pageErrors.length&&report.releaseUnchangedDuringRun;
  await fs.writeFile(path.join(out,'results.json'),JSON.stringify(report,null,2),{flag:'wx'});
  if(!report.pass)process.exitCode=1;
}
