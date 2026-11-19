import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),dir=path.resolve('outputs/roundtrip-20261111/ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1110.11258/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const base=path.resolve('docs/deliverables/2026-11-10-premeeting');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(base,'progress-2026-11-11-cumulative-eleven.pptx'))),s=p.slides.items[0];
for(const sh of s.shapes.items){
 for(const [a,b] of [['累計11件','累計12件'],['累計11項目','累計12項目'],['追加9件','追加10件'],['全11件','全12件'],['11月11日7件','11月11日8件']])if(sh.text.toString().includes(a))sh.text.replace(a,b);
 if(sh.text.toString()==='復旧：一部の式は戻り、保護設定は戻らず。')sh.text='復旧：値と一部の式を復元。保護設定は未確認。';
 if(!sh.text.toString() && sh.position.top>=548 && sh.position.top<602)sh.position={...sh.position,top:590};
}
function label(slide,t,x,y,w,h,sz,bold=false){const sh=slide.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=t;sh.text.style={typeface:'Yu Gothic',fontSize:sz,bold,color:'#102D52',verticalAlignment:'middle',insets:0};}
label(s,'送迎区分の名前とキーボードの選択位置を表示。',65,550,605,28,21);
label(s,'往復予約：区分・再表示・残数不変を確認。',675,550,550,28,21);
s.speakerNotes.text='累計12修正・開発側試験12項目。先行2修正は依頼者申告によるClaude Code Fable 5.2、追加10修正はCodex。11月10日4件、11日8件。AT-28部分確認、AT-10公開取消確定未確認、顧客本人0/6、本番保留。';
const e=p.slides.add();
label(e,'往復予約をキーボードでも選びやすく',55,18,1190,55,34,true);
const evidence=JSON.parse(await fs.readFile(path.join(dir,'slide-copy.json'),'utf8'));
label(e,evidence.slideSummary||'送迎区分のまとまりと、キーボードで選択中の位置を表示。',55,82,1180,38,24);
label(e,evidence.slideResult||'公開デモで往復を予約し、再読込後の予約と残数を確認。',55,125,1190,38,22);
e.images.add({blob:await fs.readFile(path.resolve('outputs/roundtrip-20261111/public-form.png')),contentType:'image/png',fit:'contain',alt:'公開デモの往復予約フォーム。送迎区分グループと選択肢の表示。',position:{left:90,top:170,width:1100,height:500}});
label(e,'匿名デモの架空データで確認。顧客用Google台帳・Calendarには書き込んでいません。',65,675,1150,30,19);
e.speakerNotes.text='AT-08。模擬試験と公開匿名デモを区別。実Google受入・顧客確認の合格には加算しない。';
const candidate=path.join(dir,'candidate-v2.pptx'),final=path.join(base,'progress-2026-11-11-cumulative-twelve-v2.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:4,receiptPath:path.join(dir,'validation-v2.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));
for(let i=0;i<q.slides.items.length;i++)await fs.writeFile(path.join(dir,'final-'+(i+1)+'.png'),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));
