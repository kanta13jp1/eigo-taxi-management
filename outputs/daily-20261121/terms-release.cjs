const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('../../.manual-build-20261020/node_modules/playwright');
const mode = process.argv[2];
assert.ok(['before','after','public'].includes(mode));
const released = mode === 'public';
const dir = path.join(__dirname,mode === 'before' ? '../../docs/acceptance/deployment/releases/603f482f7709d354/payload/dist' : 'release/dist');
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

    await page.goto(base+'/#/admin');
    await page.getByRole('button',{name:'管理者デモを開く'}).click();
    const footer=page.locator('footer');
    const opener=name=>footer.getByRole('button',{name,exact:true});
    const heading=page.getByRole('heading',{name:'規約・プライバシー保護・免責事項'});
    const panel=heading.locator('../../..');
    const cases=[['個人情報の取扱い',/プライバシーポリシー/],['免責事項',/^免責事項$/],['利用規約',/送迎サービス利用規約/]];
    if(mode==='before'){
      await opener(cases[0][0]).click();await heading.waitFor();
      assert.equal(await panel.getByRole('heading',{name:cases[0][1]}).count(),0);
      await page.keyboard.press('Escape');assert.equal(await heading.count(),1);
      report.before={wrongInitialTab:true,escapeDidNotClose:true};
    }else{
      for(const [label,expected] of cases){
        await opener(label).focus();await opener(label).press('Enter');
        await panel.getByRole('heading',{name:expected}).waitFor();
        const close=panel.getByRole('button',{name:'閉じる',exact:true}).first();
        await page.waitForFunction(()=>document.activeElement.getAttribute('aria-label')==='閉じる');
        if(label===cases[0][0])await page.screenshot({path:path.join(__dirname,mode+'-terms.png')});
        await close.press('Escape');await heading.waitFor({state:'detached'});
        assert.equal(await opener(label).evaluate(el=>document.activeElement===el),true);
      }
      report.verified=cases.map(c=>c[0]);
    }
    fs.writeFileSync(path.join(__dirname,mode+'-terms.json'),JSON.stringify(report,null,2));
  }finally{await browser?.close();server?.close();}
}
main().catch(err=>{console.error(err);process.exitCode=1;});

