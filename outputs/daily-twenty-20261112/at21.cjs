const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('../../.manual-build-20261020/node_modules/playwright');
const mode = process.argv[2];
assert.ok(['before','after','public'].includes(mode));
const released = mode === 'public';
const dir = path.join(__dirname,mode === 'before' ? '../../docs/acceptance/deployment/releases/5424438ebd36deb1/payload/dist' : 'stage/dist');
const site = 'https://eigo-taxi-test.web.app';
const address = '架空の送迎先・テスト学習センター別館・西口ロータリーを通過して第二集合場所へ・目印AT21ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789・緑の門前';
const note = 'AT21モバイル送迎先表示確認';
async function main() {
  let server;
  let browser;
  const report = {mode,checkedAt:new Date().toISOString(),address,width:375,height:812,engine:'Chromium (Edge) mobile emulation',profiles:'fresh anonymous browser-local demo',geometry:{}};
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
      if (!['GET','HEAD'].includes(route.request().method())) {attempts.push(route.request().method());return route.abort();}
      return route.continue();
    });
    const page = await context.newPage();
    await page.goto(base+'/#/parent');
    await page.getByRole('button',{name:'保護者デモを開く',exact:true}).click();
    const checkWidth=async()=>page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));
    report.geometry.parent=await checkWidth();
    const balances=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('eigo_taxi_students')).map(s=>[s.id,s.ticketBalance]));
    const rides=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('eigo_taxi_rides')));
    const initialBalances=await balances(), initialRides=await rides();
    await page.getByRole('button',{name:/送迎の予約を申し込む/}).click();
    report.geometry.form=await checkWidth();
    await page.locator('#ride-date').fill('2026-11-19');
    await page.locator('#ride-time').fill('15:21');
    await page.locator('#ride-location').fill(address);
    await page.locator('#ride-note').fill(note);
    await page.getByRole('button',{name:'送迎予定を登録する',exact:true}).click();
    await page.locator('form').waitFor({state:'detached'});
    const addressLocator=page.getByText(address,{exact:true});
    async function measure() {
      await addressLocator.scrollIntoViewIfNeeded();
      return addressLocator.evaluate(el=>{
        const box=el.getBoundingClientRect();
        const range=document.createRange();range.selectNodeContents(el);
        const rects=Array.from(range.getClientRects());
        const button=el.closest('.flex.items-start.justify-between').querySelector('button');
        const b=button.getBoundingClientRect();
        return {clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,lines:new Set(rects.map(r=>r.top)).size,
          allTextInside:rects.every(r=>r.left>=box.left-1 && r.right<=box.right+1 && r.bottom<=box.bottom+1),
          cancelVisible:b.left>=0 && b.right<=innerWidth && b.top>=0 && b.bottom<=innerHeight,
          cancelEnabled:!button.disabled,cancelHitTarget:button.contains(document.elementFromPoint(b.left+b.width/2,b.top+b.height/2)),viewport:innerWidth,document:document.documentElement.scrollWidth};
      });
    }
    for(const phase of ['immediate','reloaded']){
      if(phase==='reloaded')await page.reload();
      const g=await measure();
      report.geometry[phase]=g;
      if(mode==='before'){assert.equal(g.allTextInside,false);assert.ok(g.scrollWidth>g.clientWidth);assert.equal(g.lines,1);}
      else {assert.ok(g.allTextInside && g.lines>1);assert.equal(g.scrollWidth,g.clientWidth);}
      assert.ok(g.cancelVisible && g.cancelEnabled && g.cancelHitTarget);
      if(phase==='reloaded')await addressLocator.locator('xpath=../../../../..').screenshot({path:path.join(__dirname,mode+'-card.png')});
      await page.screenshot({path:path.join(__dirname,mode+'-'+phase+'.png')});
    }
    await page.setViewportSize({width:1280,height:900});
    const desktop=await measure();
    assert.equal(desktop.viewport,1280);assert.equal(desktop.document,1280);
    assert.ok(desktop.cancelHitTarget && desktop.cancelVisible && desktop.cancelEnabled);
    if(mode!=='before')assert.ok(desktop.allTextInside && desktop.scrollWidth===desktop.clientWidth);
    report.desktop=desktop;
    await page.setViewportSize({width:375,height:812});
    const final=await rides(), added=final.filter(r=>r.note===note);
    assert.equal(added.length,1);assert.equal(final.length,initialRides.length+1);
    assert.equal(added[0].pickupLocation,address);
    assert.deepEqual(final.filter(r=>r.id!==added[0].id),initialRides);
    assert.deepEqual(await balances(),initialBalances);
    report.fixture={newId:added[0].id,initialCount:initialRides.length,finalCount:final.length,initialBalances,unchangedPriorRows:true};
    const adminPage=await context.newPage();
    await adminPage.goto(base+'/#/admin');
    await adminPage.getByRole('button',{name:'管理者デモを開く',exact:true}).click();
    await adminPage.getByRole('button',{name:'送迎予定を追加',exact:true}).waitFor();
    report.geometry.admin=await adminPage.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));
    for(const g of Object.values(report.geometry)){assert.equal(g.viewport,375);assert.equal(g.document,375);}
    assert.deepEqual(attempts,[]);report.mutationRequests=attempts;
    report.site=base;report.pass=true;
    fs.writeFileSync(path.join(__dirname,mode+'.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report.geometry));
  }finally{if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
