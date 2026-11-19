import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),dir=path.resolve('outputs/daily-sixteen-20261112/ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1111.10934/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const base=path.resolve('docs/deliverables/2026-11-10-premeeting');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(base,'progress-2026-11-12-cumulative-fifteen.pptx'))),s=p.slides.items[0],t=p.slides.items[1];
function label(slide,text,x,y,w,h,sz,bold=false){const sh=slide.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=text;sh.text.style={typeface:'Yu Gothic',fontSize:sz,bold,color:'#102D52',verticalAlignment:'middle',insets:0};return sh;}
for(const sh of s.shapes.items){
 const text=sh.text.toString();
 if(text.includes('実装修正15件'))sh.text='11月10～12日の実装修正16件';
 if(text.startsWith('修正 9'))sh.text='修正 9～16';
 if(text.includes('追加13件'))sh.text.replace('追加13件','追加14件');
 if(text.startsWith('全15件の日別内訳'))sh.text='全16件の日別内訳：11月10日4件、11日8件、12日4件';
}
label(s,'16. 処理中の同じ予約は完了の連打を防止。',675,535,550,44,21);
for(const sh of t.shapes.items){if(sh.text.toString().includes('受入試験15項目'))sh.text='開発側で実施した受入試験16項目';}
label(t,'16. AT-15 同じIDの再完了で追加消費なし',675,518,550,47,21);
s.speakerNotes.text='修正16件。先行2件ユーザー申告のClaude Code Fable 5.2、追加14件Codex。日別4/8/4。顧客0/6、本番保留。';
t.speakerNotes.text='開発側試験16項目。AT-28/AT-03部分確認、AT-10公開取消確定未確認。AT-15の処理中連打防止は遅延模擬試験。実Google・顧客合格を代替しない。';
const data=JSON.parse(await fs.readFile(path.join(dir,'slide-copy.json'),'utf8'));
const e=p.slides.add();
label(e,'完了処理中の同じ予約の連打を防止',55,18,1190,55,34,true);
label(e,data.summary,55,82,1180,38,24);
label(e,data.result,55,125,1190,38,22);
e.images.add({blob:await fs.readFile(path.resolve(data.image)),contentType:'image/png',fit:'contain',alt:'公開管理者デモの対象予約の完了結果。',position:{left:90,top:170,width:1100,height:500}});
label(e,'今回作成した架空生徒・予約だけで確認。顧客用データは維持。本番運用は未開始。',65,675,1150,30,19);
e.speakerNotes.text=data.notes;
const candidate=path.join(dir,'candidate.pptx'),final=path.join(base,'progress-2026-11-12-cumulative-sixteen.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:9,receiptPath:path.join(dir,'validation.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));
for(let i=0;i<q.slides.items.length;i++)await fs.writeFile(path.join(dir,'final-'+(i+1)+'.png'),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));
