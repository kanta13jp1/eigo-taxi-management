import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),dir=path.resolve('outputs/daily-nineteen-20261112/ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1111.10934/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const base=path.resolve('docs/deliverables/2026-11-10-premeeting');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(base,'progress-2026-11-12-cumulative-eighteen.pptx'))),s=p.slides.items[0],t=p.slides.items[1];
function label(slide,text,x,y,w,h,sz,bold=false){const sh=slide.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=text;sh.text.style={typeface:'Yu Gothic',fontSize:sz,bold,color:'#102D52',verticalAlignment:'middle',insets:0};return sh;}
for(const sh of s.shapes.items){const text=sh.text.toString();
 if(text.includes('実装修正18件'))sh.text='11月10～12日の実装修正19件';
 if(text.startsWith('修正 10'))sh.text='修正 10～19';
 if(text.includes('追加16件'))sh.text.replace('追加16件','追加17件');
 if(text.startsWith('全18件の日別内訳'))sh.text='全19件の日別内訳：11月10日4件、11日8件、12日7件';
 const m=text.match(/^(1[0-8])\./);if(m)sh.position={left:675,top:210+36*(Number(m[1])-10),width:550,height:36};
}
label(s,'19. 保護者の予約一覧を送迎日時順に表示。',675,534,550,36,21);
for(const sh of t.shapes.items){const text=sh.text.toString();if(text.includes('受入試験18項目'))sh.text='開発側で実施した受入試験19項目';const m=text.match(/^(1[0-8])\./);if(m)sh.position={left:675,top:165+40*(Number(m[1])-10),width:550,height:40};}
label(t,'19. AT-06 お迎え予約・日時順・残数不変',675,525,550,40,21);
s.speakerNotes.text='修正19件。先行2件ユーザー申告のClaude Code Fable 5.2、追加17件Codex。日別4/8/7。顧客0/6、本番保留。';
t.speakerNotes.text='開発側試験19項目。AT-28/AT-03部分確認、AT-10保護者側の公開取消確定は未確認。AT-06は模擬・公開匿名デモでの予約・日時順・残数不変。実Googleカレンダー連携や顧客確認を代替しない。';
const d=JSON.parse(await fs.readFile(path.join(dir,'slide-copy.json'),'utf8'));
const e=p.slides.add();
label(e,'直近の送迎予約から順に表示',55,18,1190,55,34,true);
label(e,d.summary,55,82,1180,38,24);
label(e,d.result,55,125,1190,38,22);
e.images.add({blob:await fs.readFile(path.resolve(d.image)),contentType:'image/png',fit:'contain',alt:'公開保護者デモの予約一覧。送迎日時の早い順で表示。',position:{left:90,top:170,width:1100,height:500}});
label(e,'匿名デモの架空データで確認。顧客用データは維持。本番運用は開始していません。',65,675,1150,30,19);
e.speakerNotes.text=d.notes;
const candidate=path.join(dir,'candidate.pptx'),final=path.join(base,'progress-2026-11-12-cumulative-nineteen.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:12,receiptPath:path.join(dir,'validation.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));
for(let i=0;i<q.slides.items.length;i++)await fs.writeFile(path.join(dir,'final-'+(i+1)+'.png'),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));
