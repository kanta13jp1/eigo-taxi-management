const fs=require('node:fs'),crypto=require('node:crypto');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const review=read('outputs/calendar-readiness-20261107/independent-review.json');if(!review.pass)throw Error('Independent review required');
for(const [p,h]of Object.entries(review.sourceHashes))if(hash(p)!==h)throw Error('Reviewed source changed '+p);
const r=read('docs/traceability/registry.json');r.version='2026-11-07-r15';r.evidenceRevision='2026-11-07-published-ui-customer-six';
const gasEvidence=review.evidence.independentReport;
for(const t of r.tests){if(t.evidence?.path==='docs/traceability/reports/at24-calendar-id-20261103/gas-results.json')t.evidence.path=gasEvidence;}
const defs=[
 ['GAS-71',['REQ-06','REQ-10','REQ-24','REQ-25'],'接続先未設定なら予約・取消を書込み前に拒否'],
 ['GAS-72',['REQ-06','REQ-10','REQ-19','REQ-24','REQ-25'],'認可不足・取得失敗・既定・非所有・ID不一致の対象を拒否'],
 ['GAS-73',['REQ-10','REQ-11','REQ-25'],'取消イベントIDが指定した検証カレンダー内に存在することを要求'],
 ['GAS-74',['REQ-06','REQ-10','REQ-24','REQ-25'],'指定先だけで作成・取消・再送しリクエストから上書きさせない']
];
for(const [id,requirements,scope]of defs){if(r.tests.some(t=>t.id===id))throw Error('Already registered '+id);r.tests.push({id,path:'scripts/test_gas.cjs',locator:`check('${id}'`,requirements,mode:'offline-stub',category:'calendar-target',scope:scope+'。Node VMの模擬確認であり実Google同意・配備・受入は別。',evidence:{path:gasEvidence,key:id,requiredSources:['gas/Code.gs','gas/appsscript.json','scripts/test_gas.cjs']}});for(const c of r.capabilities)if(requirements.includes(c.req)&&!c.tests.includes(id))c.tests.push(id);}
for(const n of [24,25]){const c=r.capabilities.find(c=>c.number===n);c.precondition='会社アカウントの検証GASと、配備者所有の非公開サブカレンダーをTEST_CALENDAR_IDに設定し、Calendarの実同意が必要。';c.designText+=' 検証先はScript PropertiesのTEST_CALENDAR_IDで固定し、未設定・認可不足・primary・非所有・ID不一致は書込み前に拒否する。取消予定が指定先で特定できない場合も台帳を変更しない。';c.implementation.push({path:'gas/Code.gs',locator:'verificationCalendar_'},{path:'gas/appsscript.json',locator:'https://www.googleapis.com/auth/calendar'});c.testScope+=' GAS-71〜74は接続先・認可・所有権・取消イベントの制限をオフライン確認。Googleでの同意と検証GAS反映は未了。';}
fs.writeFileSync('docs/traceability/registry.json',JSON.stringify(r,null,2)+'\n');
const baseline=read('docs/traceability/source-baseline.json');for(const [p,h]of Object.entries(review.sourceHashes))baseline[p]=h;fs.writeFileSync('docs/traceability/source-baseline.json',JSON.stringify(baseline,null,2)+'\n');
fs.writeFileSync('outputs/calendar-readiness-20261107/baseline-adoption.json',JSON.stringify({registeredChanges:review.sourceHashes,reviewPath:'outputs/calendar-readiness-20261107/independent-review.json',newTestIds:defs.map(x=>x[0]),scope:'Local reviewed implementation and offline evidence; no GAS deployment or real Calendar acceptance'},null,2)+'\n');
console.log(JSON.stringify({version:r.version,tests:r.tests.length,newTests:defs.map(x=>x[0]),sourceBaselineUpdated:Object.keys(review.sourceHashes)}));
