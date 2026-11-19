const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const { chromium }=require('../../.manual-build-20261020/node_modules/playwright');
const out=__dirname,stage=path.join(out,'stage'), mode=process.argv[2], pub=mode==='public';
assert.ok(['before','after','public'].includes(mode));
const note='ログイン状態を確認できませんでした。教室に登録したGoogleアカウントでもう一度ログインしてください。';
const mockUser={id:'qa-user',role:'admin',name:'架空の管理者 AT19',studentIds:[]};
const fixture={id:'fixture19',name:'架空の生徒 AT19',parentName:'架空の保護者 AT19',phone:'000-0000-0000',address:'架空の教室 AT19',pickupNote:'',ticketBalance:3,createdAt:'2026-11-01'};
const gas='https://script.google.com/macros/s/';
const report={mode,at:new Date().toISOString(),externalPostRequestsSent:0,checks:[],mockActions:[]};
const check=(label)=>{report.checks.push(label);};
let server,browser;
async function main(){
  let base='https://eigo-taxi-test.web.app';
  if(!pub){
    const {build}=await import(pathToFileURL(path.join(stage,'node_modules/vite/dist/node/index.js')).href);
    const dir=path.join(stage,'fixture-'+mode),dest=path.join(out,'fixture-site-'+mode);
    fs.mkdirSync(dir,{recursive:true});
    const source=mode==='before'?path.resolve(out,'../../docs/acceptance/deployment/releases/9028a05806171c13/source/src'):path.join(stage,'src');
    const spec=f=>JSON.stringify(path.join(source,f).replaceAll('\\','/'));
    fs.writeFileSync(path.join(dir,'index.html'),'<html><meta charset="utf-8"><div id="root"></div><script type="module" src="/harness.tsx"></script></html>');
    fs.writeFileSync(path.join(dir,'harness.tsx'),'import React from "react";import {createRoot} from "react-dom/client";import {App} from '+spec('App.tsx')+';import {ApiService} from '+spec('services/api.ts')+';import '+spec('index.css')+';window.api=ApiService;createRoot(document.querySelector("#root")).render(<App/>);');
    fs.writeFileSync(path.join(dir,'mock-google.ts'),'export async function prepareGoogleSignIn(){} export async function signInGoogle(){return {uid:"qa-uid",idToken:"synthetic-only"}} export async function getGoogleIdToken(){return "synthetic-only"} export async function signOutGoogle(){}');
    await build({root:dir,configFile:false,logLevel:'warn',resolve:{dedupe:['react','react-dom'],alias:[{find:/^(?:\.\/|\.\.\/services\/)google-auth$/,replacement:path.join(dir,'mock-google.ts').replaceAll('\\','/')}]},css:{postcss:stage},build:{outDir:dest,emptyOutDir:false}});
    server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost'),file=path.resolve(dest,'.'+(u.pathname==='/'?'/index.html':u.pathname));if(!file.startsWith(dest+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'application/javascript'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
    await new Promise(ok=>server.listen(0,'127.0.0.1',ok));base='http://127.0.0.1:'+server.address().port;
  }
  report.base=base;browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  async function boot(role){
    const ctx=await browser.newContext({locale:'ja-JP',viewport:{width:390,height:844},serviceWorkers:'block'});
    let revoked=false;
    await ctx.route('**/*',async route=>{const req=route.request();
      if(!pub && req.url().startsWith(gas) && req.method()==='POST'){
        const {action,idToken}=req.postDataJSON();assert.equal(idToken,'synthetic-only');
        report.mockActions.push({action,revoked});const data={login:mockUser,getStudents:[fixture],getRides:[]};
        assert.ok(Object.hasOwn(data,action));return route.fulfill({json:revoked?{success:false,code:'UNAUTHORIZED',error:'模擬失効'}:{success:true,data:data[action]}});
      }
      if(new URL(req.url()).origin===new URL(base).origin && ['GET','HEAD'].includes(req.method()))return route.continue();
      return route.abort();
    });
    const pg=await ctx.newPage();pg.setDefaultTimeout(9000);await pg.goto(base+'/#/'+role);return {pg,ctx,revoke:(value=true)=>revoked=value};
  }
  let {pg,ctx,revoke}=await boot('admin');
  const heading=()=>pg.getByRole('heading',{name:'管理者専用ログイン',exact:true});
  const state=()=>pg.evaluate(()=>({students:localStorage.getItem('eigo_taxi_students'),rides:localStorage.getItem('eigo_taxi_rides'),purchases:localStorage.getItem('eigo_taxi_purchases'),session:sessionStorage.getItem('eigo_taxi_session')}));
  const api=(method,...args)=>pg.evaluate(({method,args})=>window.api[method](...args),{method,args});
  const shot=s=>pg.screenshot({path:path.join(out,mode+'-'+s+'.png')});
  await heading().waitFor();assert.deepEqual(await state(),{students:null,rides:null,purchases:null,session:null});assert.equal(await pg.getByText(note,{exact:true}).count(),0);
  check('AT-19 fresh admin entry, no ledger/session or reauthentication notice');
  if(!pub){
    for(const [method,arg] of [['getStudents'],['getRides'],['addTickets',{studentId:'fixture19',ticketCount:1,amount:0}]])await assert.rejects(()=>api(method,...arg?[arg]:[]),/ログインしてください/);
    assert.deepEqual(await state(),{students:null,rides:null,purchases:null,session:null});assert.equal(report.mockActions.length,0);
    check('AT-19 unauthenticated local service rejects both reads and admin operation without seed or backend call');
    await pg.getByRole('button',{name:'Googleでログイン'}).click();await pg.getByRole('button',{name:/生徒・チケット管理/}).click();await pg.getByText(fixture.name,{exact:true}).first().waitFor();
    assert.ok((await state()).session);revoke();await assert.rejects(()=>api('getStudents'),/模擬失効/);
    await heading().waitFor();assert.equal((await state()).session,null);let body=await pg.locator('body').innerText();for(const v of [fixture.name,fixture.address,mockUser.name,'生徒・チケット管理'])assert.ok(!body.includes(v));
    assert.equal(await pg.getByText(note,{exact:true}).count(),mode==='before'?0:1);
    check('AT-19 mock UNAUTHORIZED cleared session and previously visible fixture; recovery notice '+(mode==='before'?'missing (baseline regression)':'visible'));
    await shot('expired');
    if(mode==='after'){
      revoke(false);await pg.getByRole('button',{name:'Googleでログイン'}).click();await pg.getByRole('button',{name:/生徒・チケット管理/}).click();await pg.getByText(fixture.name,{exact:true}).first().waitFor();
      assert.equal(await pg.getByText(note,{exact:true}).count(),0);check('AT-19 successful mock re-login clears notice');
      revoke();await pg.reload();await heading().waitFor();await pg.getByText(note,{exact:true}).waitFor();assert.equal((await state()).session,null);check('AT-19 startup with rejected saved mock session clears session and explains re-login');
      await pg.evaluate(()=>location.hash='#/parent');await pg.getByRole('heading',{name:'生徒・保護者専用ログイン'}).waitFor();assert.equal(await pg.getByText(note,{exact:true}).count(),0);
      await pg.evaluate(()=>location.hash='#/admin');await heading().waitFor();assert.equal(await pg.getByText(note,{exact:true}).count(),0);check('AT-19 route changes clear stale recovery notice');
    }
  }else{
    // Authenticate nobody: the released bundle rechecks a synthetic saved context; no Firebase user exists.
    const manifest=fs.readFileSync(path.join(stage,'src/deployment-config.ts'),'utf8');
    const endpoint=manifest.match(/gasApiUrl: '(https:[^']+)'/)[1];
    await pg.evaluate(({endpoint,mockUser})=>sessionStorage.setItem('eigo_taxi_session',JSON.stringify({mode:'live',user:mockUser,endpoint,firebaseUid:'qa-no-such-identity',firebaseProjectId:'eigo-taxi-app'})),{endpoint,mockUser});
    await pg.reload();await pg.getByText(note,{exact:true}).waitFor();await heading().waitFor();assert.equal((await state()).session,null);assert.ok(!(await pg.locator('body').innerText()).includes(mockUser.name));await shot('expired');
    await pg.setViewportSize({width:1000,height:700});await shot('expired-wide');await pg.setViewportSize({width:390,height:844});
    check('AT-19 public bundle rejected an unrestorable synthetic saved session; notice visible, session cleared; no real identity');
  }
  await pg.getByRole('button',{name:'管理者デモを開く'}).click();await pg.getByRole('button',{name:'ログアウト'}).click();await heading().waitFor();assert.equal(await pg.getByText(note,{exact:true}).count(),0);check('AT-19 voluntary demo logout does not show the recovery notice');
  await ctx.close();
  ({pg,ctx}=await boot('parent'));await pg.getByRole('button',{name:'保護者デモを開く'}).click();
  const sel=pg.locator('#parent-portal-student');await sel.waitFor();assert.deepEqual(await sel.locator('option').evaluateAll(opts=>opts.map(o=>o.value)),['STU-001']);
  const before=await state(),household2=JSON.parse(before.students).find(s=>s.id==='STU-002');assert.ok(household2);const otherRide=JSON.parse(before.rides).find(r=>r.studentId==='STU-002');assert.ok(otherRide);
  const b=await pg.locator('body').innerText();for(const other of [household2.name,'生徒・チケット管理',otherRide.pickupLocation])assert.ok(!b.includes(other),other);
  check('AT-20 parent demo has only STU-001, no other family name, ride location or admin controls');await shot('parent');
  if(!pub){
    assert.deepEqual((await api('getStudents')).map(s=>s.id),['STU-001']);const r=await api('getRides');assert.ok(r.length && r.every(x=>x.studentId==='STU-001'));
    for(const [method,args,error] of [['getStudentById',['STU-002'],/アクセスできません/],['createReservation',[{studentId:'STU-002',rideDate:'2026-11-26',rideTime:'16:00',rideType:'pickup',pickupLocation:'架空',reservedBy:'parent'}],/アクセスできません/],['cancelReservation',[otherRide.id],/アクセスできません/],['completeRide',[r[0].id],/管理者権限/],['addTickets',[{studentId:'STU-001',ticketCount:1,amount:0}],/管理者権限/]]){
      await assert.rejects(()=>api(method,...args),error);check('AT-20 local demo service denied '+method);
    }
    assert.deepEqual(await state(),before);check('AT-20 stored synthetic ledger and session unchanged');
  }
  await ctx.close();report.pass=true;fs.writeFileSync(path.join(out,mode+'-ui.json'),JSON.stringify(report,null,2));console.log(mode+': '+report.checks.length+' checks');
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server?.close()});
