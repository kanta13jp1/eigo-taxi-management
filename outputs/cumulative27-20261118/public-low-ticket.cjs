const a=require('node:assert/strict'),f=require('node:fs'),{chromium}=require('../../.manual-build-20261020/node_modules/playwright');
const base='https://eigo-taxi-test.web.app';
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try {
  const c=await b.newContext({viewport:{width:1160,height:740},serviceWorkers:'block'});
  await c.route('**/*',r=>new URL(r.request().url()).origin===base&&r.request().method()==='GET'?r.continue():r.abort());
  const p=await c.newPage();p.setDefaultTimeout(7500);
  await p.goto(base+'/#/admin');await p.getByRole('button',{name:'管理者デモを開く'}).click();
  const summary=p.getByText('チケット残り2枚以下',{exact:true}).locator('..');
  const read=async()=>(await summary.innerText()).replace(/\s/g,'');
  const before=await read();a.match(before,/2名/);
  const tab=p.getByRole('button',{name:/生徒・チケット管理/});
  await tab.click();
  const card=id=>p.getByText(id,{exact:true}).locator('../../../..');
  await card('STU-002').getByText('残り1回',{exact:true}).waitFor();
  await card('STU-002').getByRole('button',{name:/チケット追加/}).click();
  await p.getByRole('button',{name:/1回分/}).click();
  await p.getByRole('button',{name:'チケットを追加する',exact:true}).click();
  const low=card('STU-002').getByText('残り2回',{exact:true});await low.waitFor();
  a.equal(await card('STU-002').locator('span.bg-amber-100').count(),1);
  a.equal(await card('STU-003').locator('span.bg-rose-100').count(),1);
  a.equal(await card('STU-001').locator('span.bg-emerald-100').count(),1);
  await p.screenshot({path:__dirname+'/public-low-ticket.png'});
  await p.getByRole('button',{name:/本日の送迎/}).click();a.equal(await read(),before);
  await p.reload();await tab.click();await low.waitFor();
  f.writeFileSync(__dirname+'/public-low-ticket.json',JSON.stringify({at:new Date().toISOString(),hosting:'603f482f7709d354',pass:true,fictionalBalance:[1,2],warning:'残り2回',amber:true,zeroRed:true,sevenGreen:true,summary:[2,2],reloadRetained:true,externalWrites:0},null,2));
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
