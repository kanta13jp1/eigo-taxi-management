import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),dir=path.resolve('outputs/cumulative25-20261118/ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1116.12010/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const base=path.resolve('docs/deliverables/2026-11-10-premeeting');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(base,'progress-2026-11-14-cumulative-twentyfour.pptx'))),s=p.slides.items[0],t=p.slides.items[1];
function label(slide,text,x,y,w,h,sz,bold=false){const sh=slide.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=text;sh.text.style={typeface:'Yu Gothic',fontSize:sz,bold,color:'#102D52',verticalAlignment:'middle',insets:0};return sh;}
const d=JSON.parse(await fs.readFile(path.join(dir,'slide-copy.json'),'utf8'));
for(const sh of s.shapes.items){const text=sh.text.toString();
 if(text.includes('11月14日 進捗資料'))sh.text=text.replace('11月14日','11月18日');
 if(text.includes('実装修正24件'))sh.text='11月10～17日の実装修正25件';
 if(text.startsWith('修正 1～12'))sh.text='修正 1～13';
 if(text.startsWith('修正 13～24'))sh.text='修正 14～25';
 if(text.includes('追加22件'))sh.text=text.replace('追加22件','追加23件');
 if(text.startsWith('全24件の日別内訳')){sh.text='全25件の日別内訳：10日4件、11日8件、12日8件、13日2件、14日2件、17日1件';}
 const m=text.match(/^(\d+)\. /);if(m){const i=Number(m[1]);sh.position={...sh.position,left:i<=13?65:675,top:210+(i<=13?i-1:i-14)*27,height:27};}
}
label(s,'25. 小さな画面でもチケット追加を操作可能に。',675,507,550,27,21);
s.speakerNotes.text='累計25修正。先行2件ユーザー申告のClaude Code Fable 5.2、追加23件Codex。25件目は11月17日に配備。別途、残少表示の修正も同日に確認済み（通算26件）。顧客0/6、本番保留。';
for(const sh of t.shapes.items){
 const text=sh.text.toString();
 if(text.includes('受入試験24項目'))sh.text='開発側で実施した受入試験25項目';
 if(text.startsWith('AT-28・AT-03'))sh.text='25. AT-01 管理者入口・模擬ログイン・再読込・ログアウト';
}
t.speakerNotes.text+='\n11月18日にAT-01を模擬Google認証・架空台帳と公開デモで確認。実Google本人確認は未実施。AT-05・21の再検証を重複計上しない。';
const e=p.slides.add();
label(e,'小画面のチケット追加と管理者ログインの確認',55,18,1190,55,34,true);
e.images.add({blob:await fs.readFile(path.resolve(d.image)),contentType:'image/png',fit:'contain',alt:'公開匿名デモのチケット追加フォーム',position:{left:65,top:125,width:680,height:370}});
e.images.add({blob:await fs.readFile(path.resolve('outputs/cumulative25-20261118/public-entry.png')),contentType:'image/png',fit:'contain',alt:'公開の管理者ログイン入口',position:{left:765,top:120,width:430,height:375}});
label(e,'AT-05・21   スクロールで登録まで操作',65,515,690,48,24,true);
label(e,'10枚・0円を登録。残数7枚から17枚へ。',65,565,690,44,21);
label(e,'AT-01   管理者の入口とログアウト',765,515,480,48,24,true);
label(e,'認証・台帳取得・再読込は模擬で確認。',765,565,470,44,21);
label(e,'公開検証版 e260bd4c435ced70。顧客確認0/6件。本番運用は保留。',65,669,1160,36,19);
e.speakerNotes.text=d.notes;
const candidate=path.join(dir,'candidate.pptx'),final=path.join(base,'progress-2026-11-18-cumulative25.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:18,receiptPath:path.join(dir,'validation.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));
for(const i of [0,1,17])await fs.writeFile(path.join(dir,'final-'+(i+1)+'.png'),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));


