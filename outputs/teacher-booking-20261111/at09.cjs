const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const {JSDOM} = require(path.join(require('node:os').tmpdir(),'at02-react-dom-test/node_modules/jsdom'));
const before = process.argv.includes('--before');
const base = before ? '../../docs/acceptance/deployment/releases/0024a904b2943843/source' : './stage';
const dom = new JSDOM('<div id="app"></div>',{url:'https://example.test'});
Object.assign(global,{window:dom.window,document:dom.window.document,localStorage:dom.window.localStorage,sessionStorage:dom.window.sessionStorage,IS_REACT_ACT_ENVIRONMENT:true});
const React = require('react');
const {createRoot} = require('react-dom/client');
for (const ext of ['.ts','.tsx']) require.extensions[ext] = (module,file) => module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {AddRideModal} = require(base+'/src/components/AddRideModal.tsx');
const {ApiService} = require(base+'/src/services/api.ts');
(async () => {
  ApiService.enterDemo('admin');
  const students = await ApiService.getStudents();
  const prior = await ApiService.getRides();
  const root = createRoot(document.querySelector('#app'));
  let saved;
  await React.act(()=>root.render(React.createElement(AddRideModal,{students,isOpen:true,isTeacher:true,onClose:()=>{},onSubmit:async data=>{saved=await ApiService.createReservation(data)}})));
  const controls = [...document.querySelectorAll('select,input:not([type=radio]),textarea')];
  const names = controls.map(c=>[...c.labels].map(l=>l.textContent.trim()).join(' '));
  assert.deepEqual(names,before ? Array(5).fill('') : ['生徒','送迎日','お迎え時間','送迎場所・住所','連絡事項・メモ（任意）']);
  const result = {checkedAt:new Date().toISOString(),case:'AT-09',scope:'JSDOM / anonymous teacher demo',names};
  if (!before) {
    const [student,date,time,location,note] = controls;
    const target = students[1];
    await React.act(()=>{student.value=target.id;student.dispatchEvent(new window.Event('change',{bubbles:true}));});
    assert.equal(location.value,target.address);
    for (const [ctrl,value] of [[date,'2026-11-12'],[time,'16:45'],[location,'AT09 西門'],[note,'代理予約の検証']]) {
      await React.act(()=>{Object.getOwnPropertyDescriptor(Object.getPrototypeOf(ctrl),'value').set.call(ctrl,value);ctrl.dispatchEvent(new window.Event('input',{bubbles:true}));});
    }
    await React.act(()=>document.querySelector('form').requestSubmit());
    const rides=await ApiService.getRides();
    const stored=rides.find(r=>r.id===saved.id);
    assert.equal(rides.length,prior.length+1);
    assert.equal(stored.studentId,target.id);
    assert.equal(stored.rideDate,'2026-11-12');
    assert.equal(stored.rideTime,'16:45');
    assert.equal(stored.pickupLocation,'AT09 西門');
    assert.equal(stored.reservedBy,'teacher');
    assert.deepEqual(await ApiService.getStudents(),students);
    Object.assign(result,{studentId:stored.studentId,rideDate:stored.rideDate,rideTime:stored.rideTime,location:stored.pickupLocation,reservedBy:stored.reservedBy,prior:prior.length,after:rides.length,balancesUnchanged:true});
  }
  fs.writeFileSync(path.join(__dirname,before?'before.json':'at09.json'),JSON.stringify(result,null,2));
  await React.act(()=>root.unmount());
  console.log(result);
})().catch(error=>{console.error(error);process.exitCode=1});
