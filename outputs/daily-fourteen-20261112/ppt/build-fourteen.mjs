import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),dir=path.resolve('outputs/daily-fourteen-20261112/ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1110.11258/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const base=path.resolve('docs/deliverables/2026-11-10-premeeting');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(base,'progress-2026-11-12-cumulative-thirteen-v3.pptx'))),s=p.slides.items[0];
function label(slide,t,x,y,w,h,sz,bold=false){const sh=slide.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=t;sh.text.style={typeface:'Yu Gothic',fontSize:sz,bold,color:'#102D52',verticalAlignment:'middle',insets:0};return sh;}
for(const sh of s.shapes.items){
 for(const [a,b] of [['累計13件','累計14件'],['累計13項目','累計14項目'],['追加11件','追加12件']])if(sh.text.toString().includes(a))sh.text.replace(a,b);
 if(sh.text.toString().startsWith('全13件の日別内訳'))sh.text='全14件の日別内訳：11月10日4件、11日8件、12日2件';
}
for(const [idx,x] of [65,675].entries()){
 const rows=s.shapes.items.filter(sh=>Math.abs(sh.position.left-x)<1 && sh.position.top>=210 && sh.position.top<=580 && sh.text.toString()).sort((a,b)=>a.position.top-b.position.top);
 if(rows.length!==13)throw Error('Expected thirteen rows; found '+rows.length);
 rows.push(label(s,idx?'片道完了：対象1件の完了と残数1減を確認。':'完了操作の読み上げ名に生徒・日時・消費数。',x,570,idx?550:605,24,19));
 rows.forEach((sh,i)=>{sh.position={...sh.position,top:218+i*24,height:24};sh.text.style={typeface:'Yu Gothic',fontSize:19,color:'#102D52',verticalAlignment:'middle',insets:0};});
}
s.speakerNotes.text='11月10日4件、11日8件、12日2件。累計14修正・開発側14項目実施。先行2修正Claude Code Fable 5.2はユーザー申告、追加12件Codex。AT-28部分確認、AT-10公開取消確定は未確認、AT-03は残数表示の部分確認。顧客0/6、本番保留。';
const data=JSON.parse(await fs.readFile(path.join(dir,'slide-copy.json'),'utf8'));
const e=p.slides.add();
label(e,'片道完了でチケットを1枚消費',55,18,1190,55,34,true);
label(e,data.summary,55,82,1180,38,24);
label(e,data.result,55,125,1190,38,22);
e.images.add({blob:await fs.readFile(path.resolve(data.image)),contentType:'image/png',fit:'contain',alt:'公開管理者デモの片道完了結果。',position:{left:90,top:170,width:1100,height:500}});
label(e,'今回作成した架空予約だけで確認。顧客用データは維持し、本番運用は開始していません。',65,675,1150,30,19);
e.speakerNotes.text='AT-13。公開匿名デモのアクセシビリティ情報と完了操作を確認。実Google受入・顧客本人確認の合格を代替しない。実際の音声読み上げの実機試験は未実施。';
const candidate=path.join(dir,'candidate.pptx'),final=path.join(base,'progress-2026-11-12-cumulative-fourteen.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:6,receiptPath:path.join(dir,'validation.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));
for(let i=0;i<q.slides.items.length;i++)await fs.writeFile(path.join(dir,'final-'+(i+1)+'.png'),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));
