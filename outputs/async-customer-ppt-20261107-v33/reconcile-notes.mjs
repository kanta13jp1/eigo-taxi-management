// Preserve the initial candidates. Reconcile only current canonical-source notes
// after root's final generator finished with the same locked r17 registry.
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import {pathToFileURL} from 'node:url';import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),base=path.resolve('outputs/async-customer-ppt-20261107-v33/finalized'),reconciled=path.resolve('outputs/async-customer-ppt-20261107-v33/reconciled');
const runtime='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1104-2876-0_26.1104.2876.0_x64__3k8sg7r9htsxt/dependencies',skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.22356/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),assert=(b,m)=>{if(!b)throw Error(m);};
const resultPath=path.join(base,'authoring-results.json'),original=await fs.readFile(resultPath),data=JSON.parse(original);
assert(sha(await fs.readFile('docs/traceability/registry.json'))===data.registrySha256&&data.registrySha256==='d6aa48ce6e5bd18c89db3cde4c465f44b3dd088d52c0e5208cebaaf49d2d1adf','Registry LOCK changed');
await fs.mkdir(reconciled,{recursive:false});await fs.writeFile(path.join(reconciled,'initial-authoring-results.json'),original);
const changed=[];
for(const row of data.records){
 const md=await fs.readFile(row.sourceMdPath,'utf8'),mdSha=sha(Buffer.from(md));if(mdSha===row.sourceMdSha256)continue;
 assert(['PKG-01','PKG-02','PKG-03'].includes(row.id),'Unexpected canonical source change: '+row.id);
 assert(sha(await fs.readFile(row.final))===row.sha256,'Initial candidate changed');
 const p=await PresentationFile.importPptx(await FileBlob.load(row.final));const s=p.slides.items[0],old=s.speakerNotes.text;
 const startLabel=`【本冊の現行生成正本全文】${row.sourceMdPath}\n`,endLabel='【顧客確認の現行正本全文】';
 const a=old.indexOf(startLabel),b=old.indexOf(endLabel,a);assert(a>=0&&b>a,'Canonical note markers missing');
 s.speakerNotes.text=old.slice(0,a+startLabel.length)+md+'\n'+old.slice(b);
 const run=path.join(reconciled,row.name);await fs.mkdir(run);const candidate=path.join(run,'candidate.pptx');await(await PresentationFile.exportPptx(p)).save(candidate);await fs.mkdir(path.join(run,'final'));
 const final=path.join(run,'final',`${row.name}-2026-11-07-v33.pptx`);
 const validation=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],fontPolicy:{basis:'reference',families:['Yu Gothic'],referencePath:path.resolve(row.source),referenceSha256:row.sourceSha256},verifyArtifactToolImport:true,receiptPath:path.join(run,'validation.json'),explicitTotalSlideCount:row.slides});
 const q=await PresentationFile.importPptx(await FileBlob.load(final));await fs.mkdir(path.join(run,'roundtrip'));
 for(let i=0;i<q.slides.items.length;i++)await fs.writeFile(path.join(run,'roundtrip',`${i+1}.png`),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));
 changed.push({id:row.id,sourceMdPath:row.sourceMdPath,oldSourceMdSha256:row.sourceMdSha256,newSourceMdSha256:mdSha,initialFinal:row.final,initialSha256:row.sha256});
 row.final=final;row.sha256=validation.finalSha256;row.sourceMdSha256=mdSha;row.validation=validation.presentationLayout;row.validationDir=run;row.notesReconciledAfterFinalGenerate=true;
 console.log(JSON.stringify({id:row.id,notesReconciled:true,slides:row.slides}));
}
assert(changed.length===3,'Exactly three canonical notes were expected to need reconciliation');
for(const row of data.records)assert(sha(await fs.readFile(row.sourceMdPath))===row.sourceMdSha256,'Canonical changed again: '+row.id);
data.canonicalReconciliation={reason:'Root final r17 generation at 18:27:50 occurred during authoring; only canonical current notes were reconciled, body/old notes/media kept',changes:changed};
await fs.writeFile(resultPath,JSON.stringify(data,null,2));console.log('RECONCILED3/12');
