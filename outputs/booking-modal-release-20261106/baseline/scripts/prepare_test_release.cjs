const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const collect=d=>fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(e=>e.isDirectory()?collect(d+'/'+e.name):[d+'/'+e.name]);
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex');
const sources=[...collect('src'),...collect('public'),'gas/Code.gs','package.json','package-lock.json','vite.config.ts','index.html','firebase.json','.firebaserc'];
const sourceHashes=Object.fromEntries(sources.sort().map(f=>[f,hash(f)]));
// @trace CODE-30 REQ-30
const sourceDigest=crypto.createHash('sha256').update(JSON.stringify(sourceHashes)).digest('hex');
const release={environment:'mighty-test',projectId:'eigo-taxi-app',siteId:'eigo-taxi-test',builtAt:new Date().toISOString(),baseCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),sourceDigest};
fs.writeFileSync(path.join(root,'dist/release.json'),JSON.stringify(release,null,2));
const directory=path.join(root,'docs/acceptance/deployment');fs.mkdirSync(directory,{recursive:true});
const distHashes=Object.fromEntries(collect('dist').sort().map(f=>[f,hash(f)]));
fs.writeFileSync(path.join(directory,'build-manifest.json'),JSON.stringify({release,sourceHashes,distHashes},null,2));
console.log(JSON.stringify(release,null,2));
