const fs=require('node:fs'), {createHash}=require('node:crypto'), assert=require('node:assert/strict');
const archived=require('../../docs/acceptance/deployment/releases/e260bd4c435ced70/public-verification.json');
(async()=>{
 const results=await Promise.all(archived.results.map(async({path,expectedSha256})=>{
  const res=await fetch(archived.url+path,{cache:'no-store',redirect:'error'});
  const sha256=createHash('sha256').update(Buffer.from(await res.arrayBuffer())).digest('hex');
  assert.equal(res.status,200); assert.equal(sha256,expectedSha256); return {path,status:res.status,sha256};
 }));
 fs.writeFileSync(__dirname+'/public-hashes.json',JSON.stringify({at:new Date().toISOString(),release:'e260bd4c435ced70',results},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
