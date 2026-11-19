const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { JSDOM } = require(process.env.AT05_JSDOM);
const before = process.argv.includes('--before');
const source = before ? '../../docs/acceptance/deployment/releases/6d90f151c5483c87/source' : './stage';
const dom = new JSDOM('<div id="app"></div>', {url:'https://example.test'});
Object.assign(global, {window:dom.window,document:dom.window.document,localStorage:dom.window.localStorage,sessionStorage:dom.window.sessionStorage,IS_REACT_ACT_ENVIRONMENT:true});
const React = require('react');
const {createRoot} = require('react-dom/client');
for (const ext of ['.ts','.tsx']) require.extensions[ext] = (module,file) => module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {AddTicketModal} = require(source+'/src/components/AddTicketModal.tsx');
const {ApiService} = require(source+'/src/services/api.ts');
async function setInput(input, value) {
  await React.act(() => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(input,value);
    input.dispatchEvent(new window.Event('input',{bubbles:true}));
  });
}
(async () => {
  ApiService.enterDemo('admin');
  const students = await ApiService.getStudents();
  const student = students[0];
  assert.equal(student.ticketBalance,7);
  const root = createRoot(document.querySelector('#app'));
  const historyKey = 'eigo_taxi_purchases';
  // A known persisted purchase list makes the exact history increment observable.
  const previous = [{id:'AT05-sentinel',note:'prior purchase'}];
  localStorage.setItem(historyKey,JSON.stringify(previous));
  let submits=0;
  await React.act(() => root.render(React.createElement(AddTicketModal,{isOpen:true,students,onClose:()=>{},onSubmit:async (params)=>{submits++;await ApiService.addTickets(params)}})));
  const amount = document.querySelectorAll('input[type=number]')[1];
  const note = document.querySelector('input[type=text]');
  await setInput(amount,'4980'); await setInput(note,'AT-05 架空の入金');
  const valid = amount.checkValidity(), stepMismatch = amount.validity.stepMismatch;
  assert.equal(valid,!before);assert.equal(stepMismatch,before);
  await React.act(() => document.querySelector('form').requestSubmit());
  const balance = (await ApiService.getStudents())[0].ticketBalance;
  const purchases = JSON.parse(localStorage.getItem(historyKey));
  assert.equal(submits,before?0:1);assert.equal(balance,before?7:17);assert.equal(purchases.length-previous.length,before?0:1);
  assert.deepEqual(purchases.at(-1),previous[0]);
  if(!before){assert.equal(purchases[0].amount,4980);assert.equal(purchases[0].ticketCount,10);assert.equal(purchases[0].studentId,student.id);assert.equal(purchases[0].note,'AT-05 架空の入金');}
  const result = {checkedAt:new Date().toISOString(),case:'AT-05',scope:'real React form and demo API in JSDOM, synthetic browser storage',before,step:amount.step,valid,stepMismatch,submits,balanceBefore:7,balanceAfter:balance,historyDelta:purchases.length-previous.length,record:before?null:purchases[0]};
  await React.act(()=>root.unmount());
  fs.writeFileSync(path.join(__dirname,before?'before.json':'at05.json'),JSON.stringify(result,null,2));console.log(result);
})().catch(e=>{console.error(e);process.exitCode=1});
