// Preserve this reviewed role-portal test release without overwriting historic release evidence.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function main(){
 const dir=path.join(root,'docs/acceptance/role-portals-2026-10-20');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/acceptance/deployment/build-manifest.json')));
 const verified=JSON.parse(fs.readFileSync(path.join(dir,'frontend-deployment.json')));
 if(manifest.release.sourceDigest!==verified.release.sourceDigest)throw Error('Manifest does not match verified release');
 const out=path.join(dir,'release-'+manifest.release.sourceDigest.slice(0,16));fs.mkdirSync(out,{recursive:true});
 function save(rel,bytes){const dest=path.resolve(out,rel);if(!dest.startsWith(out+path.sep))throw Error('Archive bounds');fs.mkdirSync(path.dirname(dest),{recursive:true});if(fs.existsSync(dest)){if(!fs.readFileSync(dest).equals(bytes))throw Error('Immutable archive differs: '+rel);}else fs.writeFileSync(dest,bytes,{flag:'wx'});}
 save('build-manifest.json',Buffer.from(JSON.stringify(manifest,null,2)));save('frontend-deployment.json',fs.readFileSync(path.join(dir,'frontend-deployment.json')));
 for(const[section,files]of[['source',manifest.sourceHashes],['payload',manifest.distHashes]])for(const[file,expected]of Object.entries(files)){const source=path.resolve(root,file);if(!source.startsWith(root+path.sep))throw Error('Source bounds');const bytes=fs.readFileSync(source);if(sha(bytes)!==expected)throw Error('Changed since build: '+file);save(section+'/'+file,bytes);}
 const results=[];for(const[file,expected]of Object.entries(manifest.distHashes)){const url='https://eigo-taxi-test.web.app/'+file.slice(5);const res=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(20000)});const bytes=Buffer.from(await res.arrayBuffer());results.push({path:file,status:res.status,expectedSha256:expected,sha256:sha(bytes),match:res.ok&&sha(bytes)===expected});}
 const report={verifiedAt:new Date().toISOString(),sourceDigest:manifest.release.sourceDigest,scope:'existing Firebase mighty-test public bytes; immutable local source and payload snapshot',results,passed:results.every(x=>x.match)};
 save('public-verification.json',Buffer.from(JSON.stringify(report,null,2)));if(!report.passed)throw Error('Public mismatch');
 fs.writeFileSync(path.join(dir,'release-archive.json'),JSON.stringify({sourceDigest:manifest.release.sourceDigest,path:path.relative(root,out).replaceAll('\\','/'),files:Object.keys(manifest.sourceHashes).length,payloadFiles:Object.keys(manifest.distHashes).length,publicVerification:true,hostingVersionId:null,note:'Firebase CLI deploy succeeded; no machine-readable hosting version ID captured. Identifier is sourceDigest, not hosting version ID.'},null,2));
 console.log(JSON.stringify({path:out,verified:results.length,passed:report.passed}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
