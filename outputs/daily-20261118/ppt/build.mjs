import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),dir=path.resolve('outputs/daily-20261118/ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1116.12010/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const base=path.resolve('docs/deliverables/2026-11-10-premeeting');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(base,'progress-2026-11-18-cumulative26.pptx'))),s=p.slides.items[0],t=p.slides.items[1];
function label(slide,text,x,y,w,h,sz,bold=false){const sh=slide.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=text;sh.text.style={typeface:'Yu Gothic',fontSize:sz,bold,color:'#102D52',verticalAlignment:'middle',insets:0};return sh;}
for(const sh of s.shapes.items){
 const tx=sh.text.toString();
 if(tx.includes('実装修正26件'))sh.text='11月10～18日の実装修正27件';
 if(tx.startsWith('修正 14～26'))sh.text='修正 14～27';
 if(tx.includes('追加24件'))sh.text=tx.replace('追加24件','追加25件');
 if(tx.startsWith('全26件の日別内訳'))sh.text='全27件の日別内訳：10日4件、11日8件、12日8件、13日2件、14日2件、17日2件、18日1件';
}
label(s,'27. 小画面でも生徒登録を最後まで操作。',675,561,550,27,21);
s.speakerNotes.text='累計27修正。先行2件Claude Code Fable 5.2、追加25件Codex。開発側の異なる試験項目は26。';
t.speakerNotes.text+='\n生徒登録のAT-02・21は再検証。異なる技術試験IDは26のまま。';
const e=p.slides.add();
label(e,'小さな画面でも生徒登録を最後まで操作',55,22,1190,55,34,true);
e.images.add({blob:await fs.readFile(path.resolve('outputs/daily-20261118/public-student.png')),contentType:'image/png',fit:'contain',alt:'公開デモの生徒登録フォームで登録ボタンまでスクロールした画面',position:{left:55,top:115,width:750,height:440}});
label(e,'入力後、フォーム内を下へ',825,165,390,70,24,true);
label(e,'「登録を完了する」を押す',825,267,390,70,24,true);
label(e,'再読込後も生徒1件と\n初期チケット10枚を表示。',825,395,390,105,23);
label(e,'公開匿名デモの3画面サイズで確認。実機・実Google連携は別途。顧客確認0/6件。',55,662,1180,40,19);
e.speakerNotes.text='AT-02・AT-21の再確認。既存26試験項目に重複計上しない。3画面サイズで架空生徒1件をブラウザ内だけに登録。';
const candidate=path.join(dir,'candidate.pptx'),final=path.join(base,'progress-2026-11-18-daily.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:20,receiptPath:path.join(dir,'validation.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));
for(const i of [0,1,19])await fs.writeFile(path.join(dir,'final-'+(i+1)+'.png'),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));


