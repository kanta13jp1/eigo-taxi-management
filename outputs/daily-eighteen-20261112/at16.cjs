const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { JSDOM } = require(path.join(require('node:os').tmpdir(), 'at02-react-dom-test/node_modules/jsdom'));
const before = process.argv.includes('--before');
const base = before ? '../../docs/acceptance/deployment/releases/254b10bb3bf3744a/source' : './stage';
const dom = new JSDOM('<div id="app"></div>', { url: 'https://example.test/#/admin' });
Object.assign(global, { window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage, IS_REACT_ACT_ENVIRONMENT: true });
const React = require('react');
const { createRoot } = require('react-dom/client');
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText, file);
const { App } = require(base + '/src/App.tsx');
const { ApiService, getLocalDateString } = require(base + '/src/services/api.ts');
(async () => {
  ApiService.enterDemo('admin');
  const students = await ApiService.getStudents();
  const targetStudent = students[0];
  const target = await ApiService.createReservation({ studentId: targetStudent.id, rideDate: getLocalDateString(), rideTime: '15:42', pickupLocation: 'AT-16 架空の停留所', rideType: 'pickup', reservedBy: 'teacher' });
  const root = createRoot(document.querySelector('#app'));
  await React.act(async () => root.render(React.createElement(App)));
  const button = () => [...document.querySelectorAll('button')].find(b => b.getAttribute('aria-label')?.includes(target.studentName + ' ' + target.rideDate + ' ' + target.rideTime));
  assert.ok(button());
  // Operator B cancels in the same browser store while operator A still sees the scheduled snapshot.
  await ApiService.cancelReservation(target.id);
  const cancelled = await ApiService.getRides();
  assert.ok(button());
  let reads = 0;
  const getRides = ApiService.getRides.bind(ApiService);
  ApiService.getRides = async () => { reads++; return getRides(); };
  await React.act(async () => button().click());
  assert.match(document.querySelector('[role=alert]').textContent, /完了処理できません/);
  assert.equal(!!button(), before);
  assert.equal(reads, before ? 0 : 1);
  assert.deepEqual(await ApiService.getStudents(), students);
  assert.deepEqual(await getRides(), cancelled);
  assert.equal(cancelled.find(r => r.id === target.id).status, 'cancelled');
  const result = { case: 'AT-16', checkedAt: new Date().toISOString(), scope: 'React App + synthetic demo service and mocked live API responses; no Google calls', automaticRereads: reads, staleCompletionButtonRemains: !!button(), status: 'cancelled', balanceBefore: targetStudent.ticketBalance, balanceAfter: (await ApiService.getStudentById(targetStudent.id)).ticketBalance, otherRidesAndBalancesPreserved: true };
  assert.equal(result.balanceAfter, 7);
  if (!before) {
    const otherButton = [...document.querySelectorAll('button')].find(b => b.getAttribute('aria-label')?.startsWith('送迎完了'));
    const originalComplete = ApiService.completeRide;
    for (const failure of ['チケット不足', '模擬通信失敗']) {
      ApiService.completeRide = async () => { throw new Error(failure); };
      await React.act(async () => otherButton.click());
      assert.ok(document.querySelector('[role=alert]').textContent.includes(failure));
      assert.equal(reads, 1);
    }
    ApiService.completeRide = originalComplete;
    result.unrelatedFailuresDoNotRefresh = true;
  }
  await React.act(async () => root.unmount());
  if (!before) {
    const config = require(base + '/src/deployment-config.ts');
    config.getDeploymentConfig = () => ({ gasApiUrl: 'https://example.invalid/test' });
    config.requireGoogleConfig = () => ({ projectId: 'mock' });
    require(base + '/src/services/google-auth.ts').getGoogleIdToken = async () => 'mock';
    sessionStorage.setItem('eigo_taxi_session', JSON.stringify({ mode:'live', user:{id:'local-fixture',name:'Test',role:'admin',studentIds:[]}, firebaseUid:'fixture',firebaseProjectId:'mock',endpoint:'https://example.invalid/test' }));
    const { InactiveReservationError } = require(base + '/src/services/api.ts');
    for (const code of ['INVALID_STATE','INSUFFICIENT_TICKETS']) {
      global.fetch = async () => ({ok:true,json:async () => ({success:false,code,error:'mock rejection'})});
      await assert.rejects(ApiService.completeRide(target.id), error => (error instanceof InactiveReservationError) === (code === 'INVALID_STATE') && error.message === 'mock rejection');
    }
    global.fetch = async () => ({ok:true,json:async () => ({success:false,code:'INVALID_STATE',error:'mock cancellation rejection'})});
    await assert.rejects(ApiService.cancelReservation(target.id), error => !(error instanceof InactiveReservationError) && error.message === 'mock cancellation rejection');
    result.sameCodeOtherActionNotClassified = true;
    result.mockedLiveInvalidStateDiscriminated = true;
  }
  fs.writeFileSync(path.join(__dirname, before ? 'before.json' : 'at16.json'), JSON.stringify(result, null, 2));
  console.log(result);
})().catch(e => { console.error(e); process.exit(1); });
