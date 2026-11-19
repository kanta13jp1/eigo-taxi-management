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
    const dir = mode === 'before' ? path.resolve(out,'../../docs/acceptance/deployment/releases/603f482f7709d354/payload/dist') : path.join(out,'stage/dist');
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

  for(const [width,height] of [[390,360],[844,390],[1200,900]]) {
    const c=await browser.newContext({viewport:{width,height},serviceWorkers:'block'});
    await c.route('**/*',r=>new URL(r.request().url()).origin===base&&r.request().method()==='GET'?r.continue():r.abort());
    const p=await c.newPage();p.setDefaultTimeout(6000);
    await p.goto(base+'/#/admin');
    await p.getByRole('button',{name:'管理者デモを開く'}).click();
    const tab=p.getByRole('button',{name:/生徒・チケット管理/});
    await tab.click();
    await p.getByRole('button',{name:'新規生徒を登録',exact:true}).click();
    const submit=p.getByRole('button',{name:'登録を完了する',exact:true});
    const form=submit.locator('xpath=ancestor::form');
    const panel=form.locator('..');
    const outer=await panel.boundingBox(), button=await submit.boundingBox();
    if(mode==='before' && height<400){
      assert.ok(button.y+button.height>height);
      assert.ok(outer.y<0);
      report.cases.push({width,height,outer,button,clipped:true});
    }else if(mode!=='before'){
      assert.ok(outer.y>=0&&outer.y+outer.height<=height);
      await form.getByPlaceholder(/佐藤 陽菜/).fill('架空 生徒画面検証');
      await form.getByPlaceholder(/東京都世田谷区/).fill('架空の送迎場所');
      await panel.hover({position:{x:Math.floor(outer.width/2),y:Math.floor(outer.height/2)}});
      await p.mouse.wheel(0,1200);
      await p.waitForFunction(()=>{const el=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='登録を完了する');const r=el?.getBoundingClientRect();return r&&r.top>=0&&r.bottom<=innerHeight;});
      if(width===844)await p.screenshot({path:path.join(out,mode+'-student.png')});
      await submit.click();
      const entry=p.getByRole('heading',{name:'架空 生徒画面検証',exact:true});
      await entry.waitFor();
      await p.reload();await tab.click();await entry.waitFor();
      const records=await p.evaluate(()=>JSON.parse(localStorage.getItem('eigo_taxi_students')).filter(x=>x.name==='架空 生徒画面検証').map(({ticketBalance})=>ticketBalance));
      assert.deepEqual(records,[10]);
      report.cases.push({width,height,outer,registered:1,balance:10,reloadRetained:true});
    }
    await c.close();
  }
  fs.writeFileSync(path.join(out,mode+'-ui.json'),JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server?.close();});
