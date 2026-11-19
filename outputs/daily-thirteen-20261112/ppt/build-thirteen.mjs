import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),dir=path.resolve('outputs/daily-thirteen-20261112/ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1110.11258/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const base=path.resolve('docs/deliverables/2026-11-10-premeeting');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(base,'progress-2026-11-11-cumulative-twelve.pptx'))),s=p.slides.items[0];
function label(slide,t,x,y,w,h,sz,bold=false){const sh=slide.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=t;sh.text.style={typeface:'Yu Gothic',fontSize:sz,bold,color:'#102D52',verticalAlignment:'middle',insets:0};return sh;}
for(const sh of s.shapes.items){
 if(sh.position.top<150 && sh.text.toString().includes('修正') && sh.text.toString().includes('受入試験'))sh.text='11月10～12日の修正と受入試験';
 for(const [a,b] of [['11月11日 打ち合わせ資料','11月12日 進捗資料'],['11月10～11日','11月10～12日'],['累計12件','累計13件'],['累計12項目','累計13項目'],['追加10件','追加11件']])if(sh.text.toString().includes(a))sh.text.replace(a,b);
 if(sh.text.toString().startsWith('全12件の日別内訳'))sh.text='全13件の日別内訳：11月10日4件、11日8件、12日1件';
}
const newTexts=['保護者の生徒選択と残数・予約の表示を一致。','保護者残数：読み込み・生徒切替・空一覧を確認。'];
for(const [idx,x] of [65,675].entries()){
 const rows=s.shapes.items.filter(sh=>Math.abs(sh.position.left-x)<1 && sh.position.top>=210 && sh.position.top<=580 && sh.text.toString()).sort((a,b)=>a.position.top-b.position.top);
 if(rows.length!==12)throw Error('Expected twelve summary rows; found '+rows.length);
 rows.push(label(s,newTexts[idx],x,570,idx?550:605,28,20));
 rows.forEach((sh,i)=>{sh.position={...sh.position,top:218+i*26,height:28};sh.text.style={typeface:'Yu Gothic',fontSize:20,color:'#102D52',verticalAlignment:'middle',insets:0};});
}
s.speakerNotes.text='11月10日4件、11日8件、12日1件の累計13修正・開発側試験13項目。先行2修正はユーザー申告によるClaude Code Fable 5.2、追加11件Codex。AT-28は範囲貼付による保護設定復旧が未達、AT-10公開取消確定は未確認。顧客0/6、本番保留。';
const data=JSON.parse(await fs.readFile(path.join(dir,'slide-copy.json'),'utf8'));
const e=p.slides.add();
label(e,'選んだ生徒の残数と予約を表示',55,18,1190,55,34,true);
label(e,data.summary,55,82,1180,38,24);
label(e,data.result,55,125,1190,38,22);
e.images.add({blob:await fs.readFile(path.resolve(data.image)),contentType:'image/png',fit:'contain',alt:'公開保護者デモの生徒選択と残数カード。',position:{left:90,top:170,width:1100,height:500}});
label(e,'匿名デモで確認。顧客用の検証台帳・カレンダーは維持。本番運用は開始していません。',65,675,1150,30,19);
e.speakerNotes.text='AT-03の開発側検証。生徒一覧の遅延読み込みや更新を模擬試験し、公開匿名デモの選択と残数・予約を確認。家庭別のサーバー認可の合格を意味しない。';
const candidate=path.join(dir,'candidate-v3.pptx'),final=path.join(base,'progress-2026-11-12-cumulative-thirteen-v3.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:5,receiptPath:path.join(dir,'validation-v3.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));
for(let i=0;i<q.slides.items.length;i++)await fs.writeFile(path.join(dir,'final-'+(i+1)+'.png'),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));
