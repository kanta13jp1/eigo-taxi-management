const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { JSDOM } = require(require('node:path').join(require('node:os').tmpdir(),'at02-react-dom-test/node_modules/jsdom'));
const before = process.argv.includes('--before');
const source = before ? '../../docs/acceptance/deployment/releases/f645f61220bdc2bb/source' : './stage';
const dom = new JSDOM('<div id="app"></div>', {url:'https://example.test'});
Object.assign(global, {window:dom.window,document:dom.window.document,localStorage:dom.window.localStorage,sessionStorage:dom.window.sessionStorage,IS_REACT_ACT_ENVIRONMENT:true});
const React = require('react');
const {createRoot} = require('react-dom/client');
for (const ext of ['.ts','.tsx']) require.extensions[ext] = (module,file) => module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {AddStudentModal} = require(source+'/src/components/AddStudentModal.tsx');
const {ApiService} = require(source+'/src/services/api.ts');
async function setInput(input, value) {
  await React.act(() => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(input,value);
    input.dispatchEvent(new window.Event('input',{bubbles:true}));
  });
}
(async () => {
  ApiService.enterDemo('admin');
  const initial = await ApiService.getStudents();
  const root = createRoot(document.querySelector('#app'));
  const records = [];
  await React.act(() => root.render(React.createElement(AddStudentModal, {isOpen:true,onClose:()=>{},onSubmit:async data=>records.push(await ApiService.createStudent(data))})));
  const inputs = Array.from(document.querySelectorAll('input'));
  const [name,parent,phone,balance,address,note] = inputs;
  assert.equal(balance.value,'10');
  const data={name:'AT02 Demo',parentName:'Demo Parent',phone:'000-0000-0000',address:'AT02 Demo Address',pickupNote:'AT02 Demo Note'};
  for (const [input,value] of [[name,data.name],[parent,data.parentName],[phone,data.phone],[address,data.address],[note,data.pickupNote]]) await setInput(input,value);
  await setInput(balance,'1.5');
  const displayed=balance.value;
  assert.equal(displayed,before?'1':'1.5');
  assert.equal(balance.validity.stepMismatch,!before);
  const submit=()=>React.act(()=>document.querySelector('form').requestSubmit());
  await submit();
  assert.equal(records.length,before?1:0);
  if(before) assert.equal(records[0].ticketBalance,1);
  else {
    for(const invalid of ['','-1']) {await setInput(balance,invalid);await submit();assert.equal(records.length,0);}
    await setInput(balance,'10');await submit();
    assert.equal(records.length,1);
    const saved=(await ApiService.getStudents()).find(s=>s.id===records[0].id);
    for(const [key,value] of Object.entries({...data,ticketBalance:10})) assert.equal(saved[key],value);
  }
  assert.equal((await ApiService.getStudents()).length,initial.length+1);
  const result={checkedAt:new Date().toISOString(),case:'AT-02',scope:'actual React form and demo API with synthetic storage',before,input:'1.5',displayed,fractionalSubmits:before?1:0,blankAndNegativeRejected:!before,initialCount:initial.length,finalCount:initial.length+1,saved:records[0]};
  console.log(JSON.stringify(result,null,2));
  fs.writeFileSync(path.join(__dirname,before?'before.json':'at02.json'),JSON.stringify(result,null,2));
})().catch(err=>{console.error(err);process.exitCode=1;});