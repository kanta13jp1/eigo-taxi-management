const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=process.cwd(),candidate=path.resolve('outputs/booking-modal-release-20261106/candidate');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const deployPath='outputs/booking-modal-release-20261106/firebase-deploy-20261107.json',deploy=read(deployPath);
const manifest=read(path.join(candidate,'docs/acceptance/deployment/build-manifest.json'));
const publicPath='docs/acceptance/deployment-verification/public-2026-11-07T07-01-18-387Z.json',pub=read(publicPath);
const resultPath='outputs/booking-modal-hosted-after-20261107/results.json',ui=read(resultPath);
const review=read('outputs/booking-modal-release-20261107-after-review.json');
if(deploy.status!=='success'||!deploy.result.hosting.endsWith('/sites/eigo-taxi-test/versions/679ec43146aecd55')||!pub.pass||!ui.pass||ui.results.length!==4||ui.results.some(x=>x.status!=='PASS')||!ui.releaseUnchangedDuringRun||ui.blockedMutations.length||ui.blockedSockets.length||ui.pageErrors.length)throw Error('Evidence gate failed');
if(ui.release.sourceDigest!==manifest.release.sourceDigest||hash(fs.readFileSync(path.join(candidate,'dist/release.json')))!==ui.releaseSha256)throw Error('Release mismatch');
const out=path.resolve('docs/acceptance/deployment/releases/679ec43146aecd55');
function writeOnce(p,b){fs.mkdirSync(path.dirname(p),{recursive:true});if(fs.existsSync(p)){if(!fs.readFileSync(p).equals(Buffer.from(b)))throw Error('Archive exists with different bytes '+p);}else fs.writeFileSync(p,b,{flag:'wx'});}
for(const [section,files]of [['source',manifest.sourceHashes],['payload',manifest.distHashes]])for(const [file,expected]of Object.entries(files)){
 const source=path.resolve(candidate,file),target=path.resolve(out,section,file);
 if(!source.startsWith(candidate+path.sep)||!target.startsWith(out+path.sep))throw Error('Invalid path');
 const bytes=fs.readFileSync(source);if(hash(bytes)!==expected)throw Error('Candidate hash mismatch '+file);writeOnce(target,bytes);
}
const publicSummary={...pub,release:manifest.release};
for(const [file,bytes]of [['firebase-deploy.json',fs.readFileSync(deployPath)],['build-manifest.json',fs.readFileSync(path.join(candidate,'docs/acceptance/deployment/build-manifest.json'))],['public-verification.json',JSON.stringify(publicSummary,null,2)+'\n'],['published-ui.json',fs.readFileSync(resultPath)]])writeOnce(path.join(out,file),bytes);
// Promote only evidence pointers. Root GAS and other pending source are not archived as deployed.
for(const file of ['firebase-deploy.json','build-manifest.json','public-verification.json'])fs.copyFileSync(path.join(out,file),path.resolve('docs/acceptance/deployment',file));
const observed=fs.statSync(deployPath).mtime.toISOString();
const evidence={kind:'public-frontend-demo',siteId:'eigo-taxi-test',deploymentStatus:'SUCCESS',releaseId:'679ec43146aecd55',deployedAt:observed,deploymentTimeBasis:'UTC modification time of CLI success result; server release time not separately queried',verifiedAt:ui.finishedAt,sourceDigest:manifest.release.sourceDigest,exitCode:0,status:'PASS',publicFiles:pub.results.map(x=>({path:x.path,status:x.status,buildSha256:x.expectedSha256,publicSha256:x.sha256})),tests:ui.results.map(x=>({id:x.id,viewport:x.viewport,status:x.status,mode:'demo',screenshot:path.posix.join('outputs/booking-modal-hosted-after-20261107',x.id+'-button.png')})),gasDeployed:false,calendarPermissionAuthorized:true,calendarPermissionAdded:false,productionStarted:false,realAcceptanceNewPasses:0,recordPath:'docs/progress/2026-11-07-test-site-delivery.md',resultPath,outputDirectory:'outputs/ppt-deploy-20261107-v31/verified'};
writeOnce(path.resolve('outputs/booking-modal-release-20261107-evidence.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({archived:out,sourceFiles:Object.keys(manifest.sourceHashes).length,payloadFiles:Object.keys(manifest.distHashes).length,pointersPromoted:true,evidence:'outputs/booking-modal-release-20261107-evidence.json'}));
