import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),dir=path.resolve('outputs/cumulative27-20261118/ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1116.12010/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const base=path.resolve('docs/deliverables/2026-11-10-premeeting');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(base,'progress-2026-11-18-daily.pptx'))),s=p.slides.items[0],t=p.slides.items[1];
function label(slide,text,x,y,w,h,sz,bold=false){const sh=slide.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=text;sh.text.style={typeface:'Yu Gothic',fontSize:sz,bold,color:'#102D52',verticalAlignment:'middle',insets:0};return sh;}
for(const sh of t.shapes.items){
 const tx=sh.text.toString();
 if(tx.includes('受入試験26項目'))sh.text='開発側で実施した受入試験27項目';
 if(tx.startsWith('AT-24・25は実Google'))sh.text='27. AT-23 台帳の初期化・再実行・生徒の保存（模擬）';
}
t.speakerNotes.text+='\nAT-24・25は実Googleの限定確認。AT-19・20・23は架空データ・模擬環境。';
const e=p.slides.add();
label(e,'台帳を再初期化しても登録内容を保持',55,22,1190,66,36,true);
label(e,'AT-23  台帳の初期化と生徒情報の保存（模擬）',55,105,1170,55,27);
label(e,'1  台帳を作成\n生徒・送迎・購入履歴の3シート',65,220,1100,90,25,true);
label(e,'2  初期化を再実行\nすでに登録した生徒とチケット5枚を保持',65,351,1100,90,25,true);
label(e,'3  新しい生徒を登録して取得\n台帳に1行追加。初期チケット10枚を確認',65,482,1100,90,25,true);
label(e,'実Google台帳でのAT-23は別途。顧客確認0/6件。本番運用は保留。',55,661,1170,35,20);
e.speakerNotes.text='現行版603f482f7709d354の保全GASソースを使用。初期化2回、新規1行、外部書込み0。公開画面の残少表示と生徒登録も再確認。';
const candidate=path.join(dir,'candidate.pptx'),final=path.join(base,'progress-2026-11-18-cumulative27.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:21,receiptPath:path.join(dir,'validation.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));
for(const i of [1,20])await fs.writeFile(path.join(dir,'final-'+(i+1)+'.png'),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));


