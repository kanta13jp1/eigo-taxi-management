const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const {JSDOM}=require(path.join(require('node:os').tmpdir(),'at02-react-dom-test/node_modules/jsdom'));
const before=process.argv.includes('--before'), base=before?'../../docs/acceptance/deployment/releases/4296a542a2ae8491/source':'./stage';
const dom=new JSDOM('<div id="app"></div>',{url:'https://example.test/#/parent'});
Object.assign(global,{window:dom.window,document:dom.window.document,localStorage:dom.window.localStorage,sessionStorage:dom.window.sessionStorage,IS_REACT_ACT_ENVIRONMENT:true});
const React=require('react'),{createRoot}=require('react-dom/client');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(mod,f)=>mod._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {App}=require(base+'/src/App.tsx'),{ParentPortal}=require(base+'/src/components/ParentPortal.tsx'),{ApiService}=require(base+'/src/services/api.ts');
const $=s=>document.querySelector(s),buttons=()=>[...document.querySelectorAll('button')], rows=()=>buttons().map(b=>b.getAttribute('aria-label')).filter(Boolean).filter(s=>s.endsWith('の予約をキャンセル'));
const act=React.act;
async function input(sel,value) {const el=$(sel);await act(async()=>{Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value').set.call(el,value);el.dispatchEvent(new window.Event('input',{bubbles:true}));el.dispatchEvent(new window.Event('change',{bubbles:true}));});}
(async()=>{
ApiService.enterDemo('parent'); const [student]=await ApiService.getStudents();assert.equal(student.ticketBalance,7);
const initialRides=await ApiService.getRides();let root=createRoot($('#app'));const render=()=>act(async()=>root.render(React.createElement(App)));await render();
const booked=[];
for(const [date,time] of [['2026-10-20','16:30'],['2026-10-21','18:00'],['2026-10-21','15:30']]){
  const note='AT06 '+date+' '+time;
  await act(async()=>buttons().find(b=>b.textContent.includes('送迎の予約を申し込む')).click()); assert.equal($('#ride-student').value,student.id);assert.equal($('#ride-location').value,student.address);
  await input('#ride-date',date);await input('#ride-time',time);await input('#ride-note',note);
  await act(async()=>$('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true})));
  const rides=await ApiService.getRides();const exact=rides.filter(r=>r.note===note);assert.equal(exact.length,1);const r=exact[0];assert.deepEqual([r.studentId,r.rideDate,r.rideTime,r.pickupLocation,r.rideType,r.reservedBy,r.status],[student.id,date,time,student.address,'pickup','parent','scheduled']); booked.push(date+' '+time);assert.equal(rides.length,initialRides.length+booked.length);assert.equal((await ApiService.getStudents())[0].ticketBalance,7);
}
const getOrder=()=>rows().map(s=>booked.find(d=>s.includes(d))).filter(Boolean);
const immediate=getOrder(); await act(async()=>root.unmount());root=createRoot($('#app'));await render();const reloaded=getOrder();const expected=[...booked].sort();
if(before){assert.notDeepEqual(immediate,expected);assert.notDeepEqual(reloaded,expected);}else{assert.deepEqual(immediate,expected);assert.deepEqual(reloaded,expected);}
const baseRide=(await ApiService.getRides())[0], make=(id,studentId,status)=>Object.freeze({...baseRide,id,studentId,status,note:id});
const fixtures=Object.freeze([make('z-tie',student.id,'scheduled'),make('b-other','sibling','scheduled'),make('c-complete',student.id,'completed'),make('d-cancel',student.id,'cancelled'),make('a-tie',student.id,'scheduled')]);
async function control(set){await act(async()=>root.render(React.createElement(ParentPortal,{students:[student],isDemo:true,rides:set,onCancelRide:async()=>{},onOpenAddRide:()=>{}})));const list=$('h4').parentElement.parentElement;assert.equal(rows().length,2);assert.doesNotMatch(list.textContent,/other|complete|cancel/);return [...list.querySelectorAll('p')].map(e=>e.textContent);}
const ties=await control(fixtures), reverse=await control(Object.freeze([...fixtures].reverse()));if(!before){assert.deepEqual(ties,['a-tie','z-tie']);assert.deepEqual(reverse,ties);}
const report={baseline:before,normalFlow:{date:booked[0],count:3,balanceBefore:7,balanceAfter:7,status:'scheduled',reservedBy:'parent',rideType:'pickup',registeredAddressMatched:true},immediate,reloaded,expected,ties,reverse,siblingAndTerminalExcluded:true};
fs.writeFileSync(path.join(__dirname,before?'before.json':'at06.json'),JSON.stringify(report,null,2));console.log(report);await act(async()=>root.unmount());
})().catch(e=>{console.error(e);process.exitCode=1});
