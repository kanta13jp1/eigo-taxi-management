const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const {JSDOM} = require(path.join(require('node:os').tmpdir(),'at02-react-dom-test/node_modules/jsdom'));
const before = process.argv.includes('--before');
const base = before ? '../../docs/acceptance/deployment/releases/5204dfe9fc36b599/source' : './stage';
const dom = new JSDOM('<div id="app"></div>',{url:'https://example.test'});
Object.assign(global,{window:dom.window,document:dom.window.document,localStorage:dom.window.localStorage,sessionStorage:dom.window.sessionStorage,IS_REACT_ACT_ENVIRONMENT:true});
const React = require('react');
const {createRoot} = require('react-dom/client');
for (const ext of ['.ts','.tsx']) require.extensions[ext] = (module,file) => module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {ParentPortal} = require(base+'/src/components/ParentPortal.tsx');
const {ApiService} = require(base+'/src/services/api.ts');
(async()=>{
 ApiService.enterDemo('parent');
 const students=await ApiService.getStudents(), student=students[0];
 for(const [rideDate,rideTime,rideType] of [['2026-11-12','15:00','pickup'],['2026-11-13','17:00','roundtrip']])
  await ApiService.createReservation({studentId:student.id,rideDate,rideTime,rideType,pickupLocation:'AT10'});
 const rides=await ApiService.getRides(), target=rides.find(r=>r.rideTime==='17:00' && r.pickupLocation==='AT10');
 const root=createRoot(document.querySelector('#app')); let agreed=false,called=[],prompts=[];
 window.confirm=m=>{prompts.push(m);return agreed};
 await React.act(()=>root.render(React.createElement(ParentPortal,{isDemo:true,students,rides,onOpenAddRide(){},onCancelRide:async id=>{called.push(id);await ApiService.cancelReservation(id)}})));
 const buttons=[...document.querySelectorAll('button')].filter(b=>b.textContent.includes('キャンセル'));
 const targetButton=buttons.find(b=>b.parentElement.textContent.includes('2026-11-13 17:00'));
 assert.ok(targetButton); assert.ok(buttons.length>=2);
 const names=buttons.map(b=>b.getAttribute('aria-label')||b.textContent.trim());
 targetButton.click(); assert.deepEqual(called,[]); assert.deepEqual(await ApiService.getRides(),rides);
 if(before){assert.equal(new Set(names).size,1);assert.ok(!prompts[0].includes(target.rideDate))}
 else{
  assert.equal(names.length,new Set(names).size);
  for(const value of [student.name,target.rideDate,target.rideTime,'往復送迎']){assert.ok(targetButton.getAttribute('aria-label').includes(value));assert.ok(prompts[0].includes(value))}
  assert.ok(prompts[0].includes('教室の予定は変わりません'));agreed=true;targetButton.click();
  assert.deepEqual(called,[target.id]);assert.deepEqual(await ApiService.getRides(),rides.map(r=>r.id===target.id?{...r,status:'cancelled'}:r));assert.deepEqual(await ApiService.getStudents(),students);
 }
 const result={case:'AT-10',at:new Date().toISOString(),scope:'React parent portal, synthetic demo service',names,prompts,declinePreservedAll:true,...(before?{}:{onlyTargetCancelled:true,balancesUnchanged:true})};
 fs.writeFileSync(path.join(__dirname,before?'before.json':'at10.json'),JSON.stringify(result,null,2)); console.log(result);
 await React.act(()=>root.unmount());
})().catch(e=>{console.error(e);process.exitCode=1});