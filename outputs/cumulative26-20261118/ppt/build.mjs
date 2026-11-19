import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),dir=path.resolve('outputs/cumulative26-20261118/ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1116.12010/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const base=path.resolve('docs/deliverables/2026-11-10-premeeting');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(base,'progress-2026-11-18-cumulative25.pptx'))),s=p.slides.items[0],t=p.slides.items[1];
function label(slide,text,x,y,w,h,sz,bold=false){const sh=slide.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=text;sh.text.style={typeface:'Yu Gothic',fontSize:sz,bold,color:'#102D52',verticalAlignment:'middle',insets:0};return sh;}
for(const sh of s.shapes.items){
 const tx=sh.text.toString();
 if(tx.includes('実装修正25件')) sh.text=tx.replace('25件','26件');
 if(tx.startsWith('修正 14～25')) sh.text='修正 14～26';
 if(tx.includes('追加23件')) sh.text=tx.replace('追加23件','追加24件');
 if(tx.startsWith('全25件の日別内訳')) sh.text=tx.replace('全25件','全26件').replace('17日1件','17日2件');
}
label(s,'26. 生徒カードで残り2枚も黄色で案内。',675,534,550,27,21);
s.speakerNotes.text='累計26修正。先行2件Claude Code Fable 5.2、追加24件Codex。25・26件目は11月17日に検証サイトへ反映。';
for(const sh of t.shapes.items) if(sh.text.toString().includes('受入試験25項目')) sh.text='開発側で実施した受入試験26項目';
label(t,'26. AT-27 完了処理の競合（模擬）',675,600,545,37,21);
t.speakerNotes.text+='\nAT-27はローカルGASの模擬ロック競合。実GASの2管理者セッションによる同時試験は別途。';
const e=p.slides.add();
label(e,'残り2枚の表示と、完了処理が重なった場合の確認',55,22,1190,55,34,true);
e.images.add({blob:await fs.readFile(path.resolve('outputs/cumulative26-20261118/public-low-ticket.png')),contentType:'image/png',fit:'contain',alt:'公開匿名デモの生徒カード。残り2回を黄色で表示。',position:{left:55,top:115,width:720,height:465}});
label(e,'26件目  残少表示を統一',795,157,440,54,28,true);
label(e,'残り2枚・1枚は黄色。\n0枚は赤の「チケット切れ」。',795,213,430,100,24);
label(e,'AT-27  完了処理の競合',795,345,440,55,28,true);
label(e,'競合と再試行を模擬。\n片道1枚だけ消費（7枚から6枚）。',795,405,440,107,23);
label(e,'検証版 e260bd4c435ced70。公開デモ・模擬試験。顧客確認0/6件。本番運用は保留。',55,662,1180,40,19);
e.speakerNotes.text='公開7応答は配備記録と一致。公開匿名管理者デモで架空生徒1→2枚、黄色の残り2回、集計2名、再読込後維持を確認。GAS-17で処理中の別要求をBUSYとして拒否し、再試行で追加消費0を確認。実GASの並行実行は未実施。';
const candidate=path.join(dir,'candidate.pptx'),final=path.join(base,'progress-2026-11-18-cumulative26.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:19,receiptPath:path.join(dir,'validation.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));
for(const i of [0,1,18])await fs.writeFile(path.join(dir,'final-'+(i+1)+'.png'),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));


