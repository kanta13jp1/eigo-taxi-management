const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('../../.manual-build-20261020/node_modules/playwright');
const mode = process.argv[2];
assert.ok(['before','after','public'].includes(mode));
const released = mode === 'public';
const dir = path.join(__dirname,mode === 'before' ? '../../docs/acceptance/deployment/releases/54178ee8e9d61c91/payload/dist' : 'stage/dist');
const site = 'https://eigo-taxi-test.web.app';
async function main() {
  let server;
  let browser;
  const report = {mode,checkedAt:new Date().toISOString(),base:site,width:375,height:812,engine:'Chromium (Edge) mobile emulation',profiles:'fresh anonymous browser-local demo',geometry:{}};
  try {
    let base = site;
    if (!released) {
      server = http.createServer((req,res)=>{
        const pathname = new URL(req.url,'http://test').pathname;
        const file = path.join(dir,pathname === '/' ? 'index.html' : pathname);
        if (!file.startsWith(dir) || !fs.existsSync(file)) {res.writeHead(404).end(); return;}
        const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'};
        res.setHeader('content-type',types[path.extname(file)] || 'application/octet-stream');
        fs.createReadStream(file).pipe(res);
      });
      await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
      base = 'http://127.0.0.1:'+server.address().port;
    }
    browser = await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
    const context = await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true,timezoneId:'Asia/Tokyo',locale:'ja-JP',serviceWorkers:'block'});
    const attempts=[];
    await context.route('**/*',route=>{
      if (!['GET','HEAD'].includes(route.request().method()) || new URL(route.request().url()).origin !== new URL(base).origin) {attempts.push(route.request().method());return route.abort();}
      return route.continue();
    });
    const page = await context.newPage();
    await page.goto(base+'/#/parent');
    await page.getByRole('button',{name:'保護者デモを開く',exact:true}).click();
    report.base=base;
    const button=(name)=>page.getByRole('button',{name,exact:typeof name==='string'});
    const data=()=>page.evaluate(()=>({students:JSON.parse(localStorage.getItem('eigo_taxi_students')),rides:JSON.parse(localStorage.getItem('eigo_taxi_rides'))}));
    const fixtures=[{location:'AT10 架空の東口',note:'東口の記念碑前'},{location:'AT10 架空の西口',note:'西口の時計前'}];
    for(const fixture of fixtures){
      await button(/送迎の予約を申し込む/).click();
      await page.locator('#ride-date').fill('2026-11-25');
      await page.locator('#ride-time').fill('15:10');
      await page.locator('#ride-location').fill(fixture.location);
      await page.locator('#ride-note').fill(fixture.note);
      await button('送迎予定を登録する').click();
      await page.locator('form').waitFor({state:'detached'});
    }
    const before=await data(), pair=fixtures.map(f=>before.rides.find(r=>r.note===f.note));
    assert.ok(pair.every(r=>r && r.status==='scheduled'));
    for(const field of ['studentId','rideDate','rideTime','rideType'])assert.equal(pair[0][field],pair[1][field]);
    assert.notEqual(pair[0].id,pair[1].id);
    const trigger=i=>page.getByText(fixtures[i].location,{exact:true}).locator('xpath=../../..').getByRole('button');
    await page.evaluate(()=>{
      const set=Storage.prototype.setItem;window.qaWrites=0;
      Storage.prototype.setItem=function(k,v){set.call(this,k,v);if(this===localStorage && k==='eigo_taxi_rides')window.qaWrites++;};
    });
    const writes=()=>page.evaluate(()=>window.qaWrites);
    const shot=name=>page.screenshot({path:path.join(__dirname,mode+'-'+name+'.png')});
    if(mode==='before'){
      const messages=[];
      page.on('dialog',async dialog=>{messages.push(dialog.message());await dialog.dismiss();});
      await trigger(0).click();await trigger(1).click();
      assert.equal(messages.length,2);assert.equal(messages[0],messages[1]);
      assert.ok(fixtures.every(f=>!messages[0].includes(f.location)&&!messages[0].includes(f.note)));
      assert.deepEqual(await data(),before);report.indistinguishableMessages=messages;await shot('reservations');
    }else{
      const dialog=page.getByRole('dialog',{name:'予約取消の確認'});
      for(const [i,exit] of [[0,'Escape'],[1,'Enter'],[0,'戻る'],[1,'confirm']]){
        await trigger(i).click();await dialog.waitFor();
        const body=await dialog.innerText(), target=pair[i];
        for(const s of [target.studentName,target.rideDate,target.rideTime,fixtures[i].location,fixtures[i].note,'教室の予定は変わりません'])assert.ok(body.includes(s));
        assert.ok(!body.includes(fixtures[1-i].location));
        assert.equal(await page.evaluate(()=>document.activeElement.textContent),'戻る');
        if(exit==='confirm'){
          await shot('confirmation');
          const confirm=dialog.getByRole('button',{name:'取消を確定'});
          // Replay a second activation in the same event turn as the actual pointer click.
          await confirm.evaluate(el=>el.addEventListener('click',()=>el.click(),{once:true}));
          await confirm.click();
        }else{
          if(exit==='戻る')await button(exit).click();else await page.keyboard.press(exit);
          await dialog.waitFor({state:'detached'});
          assert.equal(await trigger(i).evaluate(el=>document.activeElement===el),true);
          assert.equal(await writes(),0);assert.deepEqual(await data(),before);
        }
      }
      await page.getByText('送迎予約のキャンセルが完了しました',{exact:true}).waitFor();
      assert.equal(await writes(),1);report.cancelWrites=1;
      const expected={students:before.students,rides:before.rides.map(r=>r.id===pair[1].id?{...r,status:'cancelled'}:r)};
      assert.deepEqual(await data(),expected);await page.reload();
      await trigger(0).waitFor();await page.getByText('キャンセル済',{exact:true}).first().waitFor();
      assert.deepEqual(await data(),expected);assert.equal(await trigger(1).count(),0);await shot('reloaded');
      report.safeDismissals=['Escape','initial Enter','戻る'];report.initialFocus='戻る';report.focusRestored=true;
      report.targetOnlyCancelled=true;report.doubleConfirmSingleWrite=true;report.persistedAfterReload=true;report.studentBalancesUnchanged=true;
    }
    assert.deepEqual(attempts,[]);report.blockedRequests=attempts;report.fixtureIds=pair.map(r=>r.id);report.scope='Isolated anonymous parent demo, mobile Edge emulation. No live Google/calendar or customer data.';
    fs.writeFileSync(path.join(__dirname,mode==='public'?'public-ui.json':mode+'-ui.json'),JSON.stringify(report,null,2));
    console.log(mode+' AT-10 passed');
  }finally{if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
