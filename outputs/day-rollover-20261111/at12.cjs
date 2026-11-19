const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript'),{JSDOM}=require(process.env.AT12_JSDOM || 'jsdom');
process.env.TZ='Asia/Tokyo';
const before=process.argv.includes('--before'), realDate=Date, at=new Date().toISOString();
const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test'});
global.window=dom.window;global.document=dom.window.document;global.IS_REACT_ACT_ENVIRONMENT=true;
const React=require('react'),{createRoot}=require('react-dom/client');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,file);
const source=before?'../../docs/acceptance/deployment/releases/11f9a7ff113c6756/source':'./stage';
const {TeacherDashboard}=require(source+'/src/components/TeacherDashboard.tsx');
let now=+new Date('2026-11-11T23:59:59+09:00'), sequence=0; const timers=new Map();
global.Date=class extends realDate {constructor(...args){super(...(args.length?args:[now]))}static now(){return now}};
window.setTimeout=(fn,ms)=>{const id=++sequence;timers.set(id,{fn,ms});return id};
window.clearTimeout=id=>timers.delete(id);
let listeners=new Set();
for(const [method,op] of [['addEventListener','add'],['removeEventListener','delete']]){
const native=document[method].bind(document);document[method]=(key,fn,...args)=>{if(key==='visibilitychange')listeners[op](fn);return native(key,fn,...args)};}
const rides=['11','12','13'].map(d=>({id:'test'+d,rideDate:'2026-11-'+d,rideTime:'13:00',studentId:'s',studentName:'架空生徒'+d,pickupLocation:'架空 停留所 '+d,rideType:'pickup',status:'scheduled'}));
const props={isDemo:true,students:[],rides};const root=createRoot(document.getElementById('app'));const draw=()=>React.act(()=>root.render(React.createElement(TeacherDashboard,props)));
const rows=[];function check(d,phase){const title=document.querySelector('h2').textContent;assert.ok(title.includes('2026-11-'+d),title);const names=[...document.querySelectorAll('h4')].map(e=>e.textContent);assert.deepEqual(names,['架空生徒'+d]);const links=[...document.querySelectorAll('a[href*="google.com/maps/search"]')].map(e=>e.href);assert.deepEqual(links,['https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('架空 停留所 '+d)]);rows.push({phase,title,names,links});}
(async()=>{await draw();check('11','initial');if(!before)assert.equal([...timers.values()][0].ms,1000);now+=1000;await React.act(()=>{for(const [id,t] of [...timers]){timers.delete(id);t.fn()}});if(before){await draw();check('11','stale after midnight and rerender');}else{check('12','after midnight');now+=36*60*60*1000;await React.act(()=>document.dispatchEvent(new window.Event('visibilitychange')));check('13','after suspended tab resumes');assert.equal(timers.size,1);assert.equal(listeners.size,1);}await React.act(()=>root.unmount());assert.equal(timers.size,0);assert.equal(listeners.size,0);const report={at,case:'AT-12',mode:'actual React DOM; simulated Asia/Tokyo clock, synthetic reservations, no external maps visit',before,rows,afterUnmount:{timers:timers.size,visibilityListeners:listeners.size}};fs.writeFileSync(path.join(__dirname,before?'before.json':'at12.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));})().catch(e=>{console.error(e);process.exitCode=1});
