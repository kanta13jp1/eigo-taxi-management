const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const {cases,flows}=require('./acceptance-catalog.cjs');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'docs/acceptance');
const seen=new Set();
for(const c of cases){
 for(const k of ['uc','req','fs','task','id','code','test']){assert.ok(!seen.has(c[k]),`duplicate ${c[k]}`);seen.add(c[k]);}
 assert.ok(flows.some(f=>`BF-${f[0]}`===c.bf),`unknown ${c.bf}`);
 assert.ok(fs.existsSync(path.join(root,c.file)),`missing code ${c.file}`);
 if(c.kind==='auto')assert.ok(fs.readFileSync(path.join(root,'scripts/run_acceptance.cjs'),'utf8').includes(`'${c.id}':`),`missing handler ${c.id}`);
}
const matrix=fs.readFileSync(path.join(dir,'07_TRACEABILITY_MATRIX.md'),'utf8');
for(const id of seen)assert.ok(matrix.includes(id),`unmapped ${id}`);
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.md'))){
 const text=fs.readFileSync(path.join(dir,f),'utf8');
 for(const match of text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)){
   const [target,anchor]=match[1].split('#');if(/^https?:/.test(target))continue;
   const resolved=path.resolve(dir,decodeURIComponent(target));assert.ok(fs.existsSync(resolved),`broken link ${f}: ${target}`);
   if(anchor&&!/^L\d+$/.test(anchor))assert.ok(fs.readFileSync(resolved,'utf8').includes(`id="${anchor}"`),`broken anchor ${f}: ${anchor}`);
 }
}
const latest=JSON.parse(fs.readFileSync(path.join(dir,'latest-run.json')));
const runDir=path.join(dir,'runs',latest.runId);
const run=JSON.parse(fs.readFileSync(path.join(runDir,'results.json')));
assert.equal(run.results.length,cases.length,'incomplete run');
assert.equal(new Set(run.results.map(r=>r.id)).size,cases.length,'duplicate results');
for(const c of cases){const r=run.results.find(r=>r.id===c.id);assert.ok(r,`missing result ${c.id}`);assert.ok(['PASS','FAIL','BLOCKED','NOT RUN'].includes(r.status));if(['PASS','FAIL'].includes(r.status))assert.ok(r.screenshots.length>0,`no screen ${r.id}`);for(const s of r.screenshots){const file=path.join(runDir,s.file);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),s.sha256,`screen changed ${s.file}`);}}
for(const [f,sha]of Object.entries(run.sourceHashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex'),sha,`source changed since run: ${f}`);
const service=JSON.parse(fs.readFileSync(path.join(dir,'service-checks/latest.json')));
assert.equal(new Set(service.results.map(r=>r.id)).size,service.results.length,'duplicate GAS test IDs');
assert.equal(service.results.length,service.counts.total,'incorrect GAS total');
assert.equal(service.results.filter(r=>r.status==='PASS').length,service.counts.passed,'incorrect GAS passed count');
assert.ok(fs.existsSync(path.join(root,service.reportFile)),'missing immutable GAS report');
for(const [f,sha]of Object.entries(service.sourceHashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex'),sha,`GAS source changed: ${f}`);
for(const r of service.results){assert.ok(r.acceptanceIds.length>0,`orphan GAS test ${r.id}`);for(const id of r.acceptanceIds){assert.ok(cases.some(c=>c.id===id),`unknown GAS trace ${id}`);assert.ok(matrix.includes(r.id),`GAS test missing in matrix ${r.id}`);}}
console.log(`PASS: ${flows.length} flows, ${cases.length} complete trace rows/results, ${service.results.length} GAS test groups; document links/anchors, code references, handlers, source/evidence hashes verified. Release acceptance is a separate decision.`);
const hostedPointer=JSON.parse(fs.readFileSync(path.join(dir,'hosted-latest.json')));
const hostedDir=path.join(dir,'hosted-runs',hostedPointer.runId);
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
assert.equal(sha(path.join(hostedDir,'results.json')),hostedPointer.resultsSha256);
const hosted=JSON.parse(fs.readFileSync(path.join(hostedDir,'results.json')));
assert.equal(hosted.results.length,23);assert.equal(new Set(hosted.results.map(r=>r.id)).size,23);
assert.equal(hosted.scriptSha256,sha(path.join(hostedDir,'runner.cjs')));
assert.equal(hosted.scriptSha256,sha(path.join(root,'scripts/run_hosted_acceptance.cjs')));
assert.equal(hosted.summary.pass,hosted.results.filter(r=>r.status==='PASS').length);
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'deployment/build-manifest.json')));
const publicResult=JSON.parse(fs.readFileSync(path.join(dir,'deployment/public-verification.json')));
assert.equal(publicResult.pass,true);assert.equal(publicResult.release.sourceDigest,manifest.release.sourceDigest);
for(const [f,digest]of Object.entries(manifest.sourceHashes))assert.equal(sha(path.join(root,f)),digest,`deployed source changed ${f}`);
for(const a of hosted.servedAssets){assert.equal(a.status,200);const p=new URL(a.url).pathname;const key='dist/'+(p==='/'?'index.html':p.slice(1));assert.equal(a.sha256,manifest.distHashes[key],`hosted asset mismatch ${p}`);}
for(const r of hosted.results){assert.ok(r.screenshots.length);for(const id of r.acceptanceIds)assert.ok(cases.some(c=>c.id===id));for(const s of r.screenshots)assert.equal(sha(path.join(hostedDir,s.file)),s.sha256);assert.ok(fs.readFileSync(path.join(dir,'07_TRACEABILITY_MATRIX.md'),'utf8').includes(r.id));}
console.log(`PASS: hosted ${hosted.summary.pass}/${hosted.results.length}, screenshots and deployed source/asset hashes verified.`);
