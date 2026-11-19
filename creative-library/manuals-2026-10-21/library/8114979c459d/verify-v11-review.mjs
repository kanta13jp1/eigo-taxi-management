import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {PresentationFile,FileBlob} from '@oai/artifact-tool';
const root='C:/Users/kanta/GitHub/eigo-taxi-management';
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1017.22135/skills/presentations';
process.env.RUNTIME_NODE_MODULES='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const names=['operation-manual','user-manual','remaining-tasks','progress-report-role-portals','portal-spec-supplement'];
const dir=root+'/docs/deliverables/2026-10-21-manuals';
const evidence=root+'/docs/acceptance/developer-setup-2026-10-21/presentations';
await fs.mkdir(evidence,{recursive:true});const result=[];
for(const name of names){
 if(process.argv[2] && name!==process.argv[2])continue;
 const source=dir+'/'+name+'-2026-10-21-v11-draft.pptx';
 const p=await PresentationFile.importPptx(await FileBlob.load(source));
 const stage=evidence+'/'+name;await fs.mkdir(stage,{recursive:true});
 if(name==='progress-report-role-portals'){
  const slide=p.slides.items[5];
  for(const shape of slide.shapes.items){
   const text=String(shape.text);
   if(text.includes('v10に更新'))shape.text.replace(text,text.replace('v10に更新','v11準備版に更新'));
   if(text.startsWith('次はCalendar権限'))shape.text.replace(text,'次はGoogle認証の外部設定と実ログイン確認。Calendar受入は別途。');
  }
 }
 const candidate=stage+'/candidate.pptx';await(await PresentationFile.exportPptx(p)).save(candidate);
 const final=dir+'/'+name+'-2026-10-21-v11-review.pptx';
 await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:'C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Yu Gothic']},verifyArtifactToolImport:true,receiptPath:stage+'/validation.json',explicitTotalSlideCount:p.slides.items.length,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[]});
 for(const [i,slide]of p.slides.items.entries()){const b=await p.export({slide,format:'png',scale:1});await fs.writeFile(stage+'/'+String(i+1).padStart(2,'0')+'.png',new Uint8Array(await b.arrayBuffer()));}
 await fs.writeFile(stage+'/content.json',JSON.stringify(p.slides.items.map((s,i)=>({slide:i+1,text:s.shapes.items.map(x=>String(x.text))})),null,2));
 result.push({name,path:final,source,slides:p.slides.items.length,sha256:crypto.createHash('sha256').update(await fs.readFile(final)).digest('hex')});console.log(name+' verified');
}
await fs.writeFile(evidence+'/'+(process.argv[2]||'index')+'.json',JSON.stringify(result,null,2));
