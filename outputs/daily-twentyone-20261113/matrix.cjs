const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const moduleCache=new Map();
function load(file){if(moduleCache.has(file))return moduleCache.get(file);const mod={exports:{}};moduleCache.set(file,mod.exports);
const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
new Function('require','module','exports',code)(id=>id==='./google-auth'?{}:load(path.resolve(path.dirname(file),id+'.ts')),mod,mod.exports);return mod.exports;}
function storage(){const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),snapshot:()=>Array.from(data),clear:()=>data.clear()};}
global.localStorage=storage();global.sessionStorage=storage();const {ApiService:api}=load(path.resolve(__dirname,'stage/src/services/api.ts'));
const student={name:'架空',parentName:'',phone:'',address:'試験',pickupNote:'',ticketBalance:8},booking={studentId:'STU-001',rideDate:'2026-11-23',rideTime:'15:22',rideType:'pickup',pickupLocation:'仮',reservedBy:'teacher'},purchase={studentId:'STU-001',ticketCount:1,amount:100};
(async()=>{api.enterDemo('admin');const summary=[];const actions={students:()=>api.createStudent(student),rides:()=>api.createReservation(booking),purchases:()=>api.addTickets(purchase)};
for(const [table,mutate] of Object.entries(actions)){const key='eigo_taxi_'+table;
for(const invalid of ['', '[{"id":1}', 'null','{}','"text"','2','false']){
localStorage.clear();await api.getStudents();await api.getRides();localStorage.setItem(key,invalid);const before=localStorage.snapshot();
await assert.rejects(mutate,/上書きせず処理を中止/);assert.deepEqual(localStorage.snapshot(),before);summary.push({table,input:invalid,denied:true,allBytesPreserved:true});}
localStorage.clear();await mutate();assert.ok(JSON.parse(localStorage.getItem(key)).length>1);
localStorage.clear();localStorage.setItem(key,'[]');await mutate();assert.equal(JSON.parse(localStorage.getItem(key)).length,1);}
fs.writeFileSync(path.join(__dirname,'matrix.json'),JSON.stringify({refusals:summary,emptyArrayAllowsCreation:3,absentSeedsAndAllowsCreation:3},null,2));console.log(summary.length+' rejected writes, 6 positive controls');})().catch(e=>{console.error(e);process.exitCode=1});
