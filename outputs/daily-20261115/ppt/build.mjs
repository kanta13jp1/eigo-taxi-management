import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),dir=path.resolve('outputs/daily-20261115/ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1112.11011/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const base=path.resolve('docs/deliverables/2026-11-10-premeeting');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(base,'progress-2026-11-14-cumulative-twentyfour.pptx'))),s=p.slides.items[0],t=p.slides.items[1];
function label(slide,text,x,y,w,h,sz,bold=false){const sh=slide.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=text;sh.text.style={typeface:'Yu Gothic',fontSize:sz,bold,color:'#102D52',verticalAlignment:'middle',insets:0};return sh;}
const d=JSON.parse(await fs.readFile(path.join(dir,'slide-copy.json'),'utf8'));
for(const sh of s.shapes.items){const text=sh.text.toString();
 if(text.includes('11月14日 進捗資料'))sh.text=text.replace('11月14日','11月15日');
 if(text.includes('実装修正24件'))sh.text='11月10～15日の実装修正25件';
 if(text.startsWith('修正 1～12'))sh.text='修正 1～13';
 if(text.startsWith('修正 13～24'))sh.text='修正 14～25';
 if(text.includes('追加22件'))sh.text=text.replace('追加22件','追加23件');
 if(text.startsWith('全24件の日別内訳')){sh.text='全25件の日別内訳：10日4件、11日8件、12日8件、13日2件、14日2件、15日1件';sh.text.style.fontSize=20;}
 const m=text.match(/^(\d+)\. /);if(m){const i=Number(m[1]);sh.position={...sh.position,left:i<=13?65:675,top:210+(i<=13?i-1:i-14)*27,height:27};}
}
label(s,'25. 小さな画面でもチケット追加を操作可能に。',675,507,550,27,21);
s.speakerNotes.text='累計25修正。先行2件ユーザー申告のClaude Code Fable 5.2、追加23件Codex。11/15は1修正。AT-21とAT-05の再検証を新規IDとして重複計上せず異なる技術試験IDは24。顧客0/6、本番保留。';
t.speakerNotes.text+='\n11月15日はAT-21・AT-05の既存項目を追加再検証。チケット追加フォームの小画面操作と保存結果を匿名デモで確認。異なる技術試験ID数は24のまま。';
const e=p.slides.add();
label(e,'小さな画面でもチケットを追加できます',55,18,1190,55,34,true);
label(e,'入力欄と登録ボタンを、フォーム内でスクロールして操作',55,82,1180,45,26);
e.images.add({blob:await fs.readFile(path.resolve(d.image)),contentType:'image/png',fit:'contain',alt:'公開匿名デモのチケット追加フォームを小さな画面幅・高さで操作した画面。実機検証ではない。',position:{left:65,top:150,width:700,height:460}});
label(e,'1  入力欄を順に確認',800,180,410,55,28,true);
label(e,'2  下へスクロールして登録',800,285,425,90,28,true);
label(e,d.result,800,430,420,150,24);
label(e,'匿名デモ・画面サイズを変えた技術確認。実Google・実機・顧客確認は別管理。顧客データ維持・本番未開始。',55,675,1180,30,18);
e.speakerNotes.text=d.notes;
const candidate=path.join(dir,'candidate.pptx'),final=path.join(base,'progress-2026-11-15-daily.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:18,receiptPath:path.join(dir,'validation.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));
for(const i of [0,1,17])await fs.writeFile(path.join(dir,'final-'+(i+1)+'.png'),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));
