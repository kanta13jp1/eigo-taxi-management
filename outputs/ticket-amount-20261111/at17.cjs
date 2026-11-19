const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { JSDOM } = require(path.join(require('node:os').tmpdir(),'at02-react-dom-test/node_modules/jsdom'));
const before = process.argv.includes('--before');
const source = before ? '../../docs/acceptance/deployment/releases/5b8000b179c3f5f1/source' : './stage';
const dom = new JSDOM('<div id="app"></div>',{url:'https://example.test'});
Object.assign(global,{window:dom.window,document:dom.window.document,localStorage:dom.window.localStorage,sessionStorage:dom.window.sessionStorage,IS_REACT_ACT_ENVIRONMENT:true});
const React = require('react');
const {createRoot} = require('react-dom/client');
for (const ext of ['.ts','.tsx']) require.extensions[ext] = (module,file) => module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {AddTicketModal} = require(source+'/src/components/AddTicketModal.tsx');
const {ApiService} = require(source+'/src/services/api.ts');
async function inputValue(input,value) {
  await React.act(()=>{
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(input,value);
    input.dispatchEvent(new window.Event('input',{bubbles:true}));
  });
}
(async()=>{
  ApiService.enterDemo('admin');
  const students=await ApiService.getStudents(), student=students[0];
  assert.equal(student.ticketBalance,7);
  const key='eigo_taxi_purchases', baseline=[{id:'prior'}];
  localStorage.setItem(key,JSON.stringify(baseline));
  const invalid=[];
  for (const [field,values] of [['ticketCount',[-1,0,1.5,NaN,Infinity,101]],['amount',[-1,1.5,NaN,Infinity]]]) {
    for(const value of values) {
      await assert.rejects(ApiService.addTickets({studentId:student.id,ticketCount:10,amount:10000,[field]:value}));
      assert.equal((await ApiService.getStudents())[0].ticketBalance,7);
      assert.deepEqual(JSON.parse(localStorage.getItem(key)),baseline);
      invalid.push({field,value:String(value),balance:7,historyUnchanged:true});
    }
  }
  const root=createRoot(document.querySelector('#app'));
  const calls=[];
  await React.act(()=>root.render(React.createElement(AddTicketModal,{isOpen:true,students,onClose:()=>{},onSubmit:async params=>{calls.push(params.amount);await ApiService.addTickets(params)}})));
  const amount=document.querySelectorAll('input[type=number]')[1], form=document.querySelector('form');
  await inputValue(amount,'1');
  await inputValue(amount,'');
  const displayed=amount.value;
  await React.act(()=>form.requestSubmit());
  const afterInvalid=(await ApiService.getStudents())[0].ticketBalance;
  assert.equal(afterInvalid,before?17:7);
  assert.equal(displayed,before?'0':'');
  assert.equal(calls.length,before?1:0);
  const historyAfterInvalid=JSON.parse(localStorage.getItem(key));
  assert.equal(historyAfterInvalid.length,before?2:1);
  if(before) assert.equal(historyAfterInvalid[0].amount,0);
  if(!before) {
    await React.act(()=>form.dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true})));
    assert.equal(calls.length,0);
    await inputValue(amount,'0');
    await React.act(()=>form.requestSubmit());
    assert.deepEqual(calls,[0]);assert.equal((await ApiService.getStudents())[0].ticketBalance,17);
    const record=JSON.parse(localStorage.getItem(key))[0];
    assert.equal(record.amount,0);assert.equal(record.ticketCount,10);
    await inputValue(amount,'4980');
    await React.act(()=>form.requestSubmit());
    assert.deepEqual(calls,[0,4980]);assert.equal((await ApiService.getStudents())[0].ticketBalance,27);
    assert.equal(JSON.parse(localStorage.getItem(key))[0].amount,4980);
  }
  const result={checkedAt:new Date().toISOString(),before,case:'AT-17',scope:'React + actual demo API in JSDOM with synthetic storage',invalid,displayed,afterInvalid,historyAfterInvalid,calls};
  fs.writeFileSync(path.join(__dirname,before?'before.json':'at17.json'),JSON.stringify(result,null,2));
  await React.act(()=>root.unmount());
  console.log('PASS',before?'old behavior reproduced':'invalid cases and explicit zero');
})().catch(e=>{console.error(e);process.exitCode=1});

