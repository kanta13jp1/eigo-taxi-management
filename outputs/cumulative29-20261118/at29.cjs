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

    const runs=[];
    for(const [width,height] of [[390,844],[412,915]]){
      const c=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,timezoneId:'Asia/Tokyo',serviceWorkers:'block'});
      await c.route('**/*',r=>new URL(r.request().url()).origin===site && r.request().method()==='GET'?r.continue():r.abort());
      const p=await c.newPage();
      await p.goto(site+'/#/parent');
      const btn=name=>p.getByRole('button',{name,exact:typeof name==='string'});
      await btn('保護者デモを開く').tap();
      const state=()=>p.evaluate(()=>({b:JSON.parse(localStorage.getItem('eigo_taxi_students')).find(s=>s.id==='STU-001').ticketBalance, test:JSON.parse(localStorage.getItem('eigo_taxi_rides')).filter(r=>r.note==='AT29 synthetic')}));
      assert.deepEqual(await state(),{b:7,test:[]});
      await btn(/送迎の予約を申し込む/).tap();
      await p.locator('#ride-date').fill('2026-11-25');
      await p.locator('#ride-time').fill('15:10');
      await p.locator('#ride-location').fill('AT29 架空の乗車場所');
      await p.locator('#ride-note').fill('AT29 synthetic');
      await btn('送迎予定を登録する').tap();
      const location=p.getByText('AT29 架空の乗車場所',{exact:true});
      await location.waitFor();
      const reserved=await state();assert.equal(reserved.b,7);assert.equal(reserved.test.length,1);assert.equal(reserved.test[0].status,'scheduled');
      await location.locator('../../..').getByRole('button',{name:/キャンセル/}).tap();
      const dialog=p.getByRole('dialog',{name:'予約取消の確認'});
      await dialog.getByRole('button',{name:'取消を確定',exact:true}).tap();
      await dialog.waitFor({state:'detached'});await p.reload();
      const final=await state();
      assert.equal(final.b,7);assert.equal(final.test.length,1);assert.equal(final.test[0].status,'cancelled');assert.equal(final.test[0].id,reserved.test[0].id);
      runs.push({width,height,reservation:'scheduled',afterReload:'cancelled',balance:[7,7,7]});await c.close();
    }
    fs.writeFileSync(path.join(__dirname,'at29-rehearsal.json'),JSON.stringify({id:'AT-29',scope:'Chromium touch emulation on public anonymous demo; no actual iPhone or Android device',runs,externalWrites:0},null,2));
  }finally{await browser?.close();server?.close();}
}
main().catch(err=>{console.error(err);process.exitCode=1;});
