const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('../../.manual-build-20261020/node_modules/playwright');
const out = __dirname;
const mode = process.argv[2];
assert.ok(['before', 'after', 'public'].includes(mode));
const report = {mode, at:new Date().toISOString(), cases:[], writesSent:0};
let server, browser;
async function main() {
  let base = 'https://eigo-taxi-test.web.app';
  if (mode !== 'public') {
    const dir = mode === 'before' ? path.resolve(out,'../../docs/acceptance/deployment/releases/a97d95510290c92b/payload/dist') : path.join(out,'stage/dist');
    server = http.createServer((req,res)=>{
      const file = path.resolve(dir,'.'+(req.url==='/'?'/index.html':new URL(req.url,'http://localhost').pathname));
      if (!file.startsWith(dir+path.sep)||!fs.existsSync(file)) return res.writeHead(404).end();
      res.setHeader('Content-Type', {'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'}[path.extname(file)]||'application/octet-stream');
      fs.createReadStream(file).pipe(res);
    });
    await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
    base = 'http://127.0.0.1:'+server.address().port;
  }
  browser = await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  for(const [width,height] of [[390,360],[375,600],[844,390]]) {
    const ctx = await browser.newContext({viewport:{width,height},locale:'ja-JP',serviceWorkers:'block'});
    try {
      await ctx.route('**/*', route => new URL(route.request().url()).origin===base && route.request().method()==='GET' ? route.continue() : route.abort());
      const page = await ctx.newPage();
      await page.goto(base+'/#/admin');
      await page.getByRole('button',{name:'管理者デモを開く'}).click();
      const open = page.getByRole('button',{name:'チケット追加',exact:true}).first();
      await open.click();
      const title = page.getByRole('heading',{name:'チケット購入・追加'});
      const panel = title.locator('xpath=../../../..');
      const submit = page.getByRole('button',{name:'チケットを追加する',exact:true});
      const numbers = panel.getByRole('spinbutton');
      const snapshot = () => page.evaluate(()=>{
        const users = JSON.parse(localStorage.getItem('eigo_taxi_students'));
        const purchases = (JSON.parse(localStorage.getItem('eigo_taxi_purchases')) || []).filter(p=>p.studentId==='STU-001' && p.ticketCount===10 && p.amount===0);
        return {balance:users.find(s=>s.id==='STU-001').ticketBalance, purchases:purchases.length, last:purchases[0]};
      });
      const prior = await snapshot();
      assert.equal(prior.balance,7);
      const bounds = await panel.boundingBox();
      const rec={width,height,bounds};
      report.cases.push(rec);
      const position = await panel.evaluate(el=>({scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,overflow:getComputedStyle(el).overflowY}));
      Object.assign(rec,position);
      if(mode==='before'){
        if(height < 400){
          assert.ok(bounds.y<0 && bounds.y+bounds.height>height);
          await page.mouse.move(width/2,height/2); await page.mouse.wheel(0,950); await page.waitForTimeout(250); const buttonBounds=await submit.boundingBox(); assert.ok(buttonBounds.y >= height || buttonBounds.y+buttonBounds.height > height); rec.footerAfterWheel=buttonBounds;
          rec.blocked=true;
        }
        await page.screenshot({path:path.join(out,mode+'-'+width+'x'+height+'.png')});
        continue;
      }
      assert.ok(bounds.y>=0 && bounds.y+bounds.height<=height);
      const preset=panel.getByRole('button',{name:/10回券/});
      await preset.click();
      await numbers.nth(1).fill('');
      await submit.click();
      assert.equal(await numbers.nth(1).evaluate(el=>el.validity.valueMissing),true);
      assert.deepEqual(await snapshot(),prior);
      await numbers.nth(1).fill('0');
      await page.mouse.move(width/2,height/2); await page.mouse.wheel(0,950); await page.waitForTimeout(250); const footer=await submit.boundingBox(); assert.ok(footer.y>=0 && footer.y+footer.height<=height); rec.footerAfterWheel=footer;
      await submit.click({trial:true});
      await page.screenshot({path:path.join(out,mode+'-'+width+'x'+height+'.png')});
      await submit.click();
      await title.waitFor({state:'detached'});
      const result = await snapshot();
      assert.equal(result.balance,17); assert.equal(result.purchases,prior.purchases+1);
      assert.equal(result.last.ticketCount,10); assert.equal(result.last.amount,0);
      assert.equal(result.last.studentId,'STU-001');
      await open.click(); await panel.getByRole('button',{name:'閉じる',exact:true}).click();
      assert.deepEqual(await snapshot(),result);
      await page.getByRole('button',{name:'ログアウト'}).click();
      await page.goto(base+'/#/parent');
      await page.getByRole('button',{name:'保護者デモを開く'}).click();
      await page.getByText('17',{exact:true}).first().waitFor();
      Object.assign(rec,{initial:7,result:17,amount:0,purchasesAdded:1,requiredValidation:true,reopenClosedWithoutMutation:true,parentVerified:true});
    } finally {await ctx.close();}
  }
  fs.writeFileSync(path.join(out,mode+'-ui.json'),JSON.stringify(report,null,2));
}
main().catch(err=>{console.error(err);process.exitCode=1;}).finally(async()=>{await browser?.close();server?.close();});

