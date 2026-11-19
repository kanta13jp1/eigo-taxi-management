const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const directory=path.join(root,'docs/acceptance/deployment');
const crypto=require('node:crypto');
const deployment=JSON.parse(fs.readFileSync(path.join(directory,'firebase-deploy.json'),'utf8').replace(/^\uFEFF/,''));
const version=deployment.result?.hosting;
const id=version?.match(/^projects\/753038429305\/sites\/eigo-taxi-test\/versions\/([a-zA-Z0-9]+)$/)?.[1];
if(deployment.status!=='success'||!id)throw Error('Unexpected deployment target or failed deployment');
const out=path.join(directory,'releases',id);fs.mkdirSync(out,{recursive:true});
for(const file of ['firebase-deploy.json','build-manifest.json','public-verification.json']){
  const target=path.join(out,file);
  if(fs.existsSync(target)){
    if(!fs.readFileSync(target).equals(fs.readFileSync(path.join(directory,file))))throw Error('Refusing to overwrite archived release '+id);
  }else fs.copyFileSync(path.join(directory,file),target,fs.constants.COPYFILE_EXCL);
}
const manifest=JSON.parse(fs.readFileSync(path.join(directory,'build-manifest.json')));
for(const [section,files]of [['source',manifest.sourceHashes],['payload',manifest.distHashes]]){
  for(const [file,expected]of Object.entries(files)){
    const source=path.resolve(root,file);
    const target=path.resolve(out,section,file);
    if(!source.startsWith(root+path.sep)||!target.startsWith(path.resolve(out,section)+path.sep))throw Error('Invalid archive path');
    const bytes=fs.readFileSync(source);
    if(crypto.createHash('sha256').update(bytes).digest('hex')!==expected)throw Error('Build input/payload changed before archival: '+file);
    fs.mkdirSync(path.dirname(target),{recursive:true});
    if(fs.existsSync(target)){
      if(!fs.readFileSync(target).equals(bytes))throw Error('Archived bytes changed: '+file);
    }else fs.writeFileSync(target,bytes,{flag:'wx'});
  }
}
console.log('Archived verified test release '+id);
