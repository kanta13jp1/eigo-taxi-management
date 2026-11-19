const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const { chromium }=require('../../.manual-build-20261020/node_modules/playwright');
const out=__dirname,stage=path.join(out,'stage'), mode=process.argv[2], pub=mode==='public';
assert.ok(['before','after','public'].includes(mode));
const note='ログイン状態を確認できませんでした。教室に登録したGoogleアカウントでもう一度ログインしてください。';
const mockUser={id:'qa-user',role:'admin',name:'架空の管理者 AT01',studentIds:[]};
const fixture={id:'fixture19',name:'架空の生徒 AT01',parentName:'架空の保護者 AT01',phone:'000-0000-0000',address:'架空の教室 AT01',pickupNote:'',ticketBalance:3,createdAt:'2026-11-01'};
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

  const {pg,ctx}=await boot('admin');
  const heading=pg.getByRole('heading',{name:'管理者専用ログイン',exact:true});
  const g=pg.getByRole('button',{name:'Googleでログイン',exact:true});
  await heading.waitFor(); await g.waitFor();
  assert.equal(await pg.locator('input,textarea').count(),0);
  const adminTab=pg.getByRole('button',{name:/生徒・チケット管理/});
  assert.equal(await adminTab.count(),0);
  check('管理者入口にGoogleログインがあり、接続先・キー入力欄と台帳がない');
  if(pub) await pg.screenshot({path:path.join(out,'public-entry.png')});
  await pg.getByRole('button',{name:pub?'管理者デモを開く':'Googleでログイン',exact:true}).click();
  const confirmLedger=async()=>{await adminTab.click();if(!pub)await pg.getByText(fixture.name,{exact:true}).first().waitFor();};
  await confirmLedger();
  const loginCount=()=>report.mockActions.filter(x=>x.action==='login').length;
  if(!pub) assert.equal(loginCount(),1);
  await pg.reload();
  await confirmLedger();
  if(!pub){assert.equal(loginCount(),2);assert.ok(report.mockActions.filter(x=>x.action==='getStudents').length>=2);}
  check(pub?'匿名デモの管理画面が再読込後も表示される':'模擬Google認証後に架空台帳取得、再読込で本人再確認と再取得');
  await pg.getByRole('button',{name:'ログアウト',exact:true}).click();
  await heading.waitFor(); await pg.reload(); await heading.waitFor();
  assert.equal(await adminTab.count(),0);
  assert.equal(await pg.evaluate(()=>sessionStorage.getItem('eigo_taxi_session')),null);
  assert.equal(await pg.getByText(fixture.name,{exact:true}).count(),0);
  check('ログアウト後の再読込でログイン画面のみ。セッションと台帳は非表示');
  await ctx.close(); report.pass=true;
  fs.writeFileSync(path.join(out,mode+'-at01.json'),JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server?.close()});
