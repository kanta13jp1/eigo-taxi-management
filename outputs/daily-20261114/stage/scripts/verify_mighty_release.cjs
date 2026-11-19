const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const base='https://eigo-taxi-test.web.app';
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
async function main(){
  const build=JSON.parse(fs.readFileSync(path.join(root,'docs/acceptance/deployment/build-manifest.json')));
  const results=[];
  for(const [file,expectedSha256]of Object.entries(build.distHashes)){
    const pathname=file.slice('dist'.length);
    const response=await fetch(base+pathname,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(20000)});
    const body=Buffer.from(await response.arrayBuffer());
    results.push({path:pathname,status:response.status,sha256:digest(body),expectedSha256,match:response.status===200&&digest(body)===expectedSha256,cacheControl:response.headers.get('cache-control')});
  }
  const home=await fetch(base+'/',{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(20000)});
  const homeBytes=Buffer.from(await home.arrayBuffer());
  results.push({path:'/',status:home.status,sha256:digest(homeBytes),expectedSha256:build.distHashes['dist/index.html'],match:home.status===200&&digest(homeBytes)===build.distHashes['dist/index.html'],cacheControl:home.headers.get('cache-control')});
  const report={checkedAt:new Date().toISOString(),url:base,release:build.release,results,pass:results.every(r=>r.match)};
  const out=path.join(root,'docs/acceptance/deployment/public-verification.json');
  fs.writeFileSync(out,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
  if(!report.pass)process.exitCode=1;
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
