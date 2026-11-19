import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(), base=path.join(root,'outputs/ppt-20261106-v29');
const dest=path.join(root,'docs/deliverables/2026-10-23-traceability');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.11149/skills/presentations';
const python='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1104-709-0_26.1104.709.0_x64__3k8sg7r9htsxt/dependencies/python/python.exe';
process.env.RUNTIME_NODE_MODULES='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1104-709-0_26.1104.709.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const photo=await fs.readFile(path.join(root,'outputs/visual-deck-work/image.jpeg'));
const logo=await fs.readFile(path.join(root,'outputs/visual-deck-work/image2.jpeg'));
const icon=await fs.readFile(path.join(root,'creative-library/progress-illustrations-2026-11-05/flat-ledger-comparison.png'));
const C={navy:'#102D52',blue:'#00A6DF',orange:'#F78C1E',pale:'#EAF7FB',gray:'#3E5366',white:'#FFFFFF',dark:'#172637',line:'#D6E8EE',warn:'#FFF7EA'};
function box(s,x,y,w,h,fill='none',border='none',sw=0){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:border,width:sw}})}
function text(s,t,x,y,w,h,size=21,color=C.dark,bold=false,align='left'){let a=box(s,x,y,w,h);a.text=t;a.text.style={typeface:'Yu Gothic',fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',insets:0};return a}
function img(s,b,x,y,w,h,alt,mime='image/png',fit='contain'){s.images.add({blob:b,contentType:mime,alt,fit,position:{left:x,top:y,width:w,height:h}})}
const notes='2026-11-06 限定確認の追補。架空のGoogleスプレッドシート1シート・1数式セルについて、数式と太字の貼り戻し、再計算を確認。通貨表示は存在を確認したが、書式を解除していないため復元の証明ではない。実台帳・全ブック・Google固有設定・Calendar整合・サイト再取得・第三者受入は未確認。独立したローカル契約確認は21+7+1=29件成功、FirebaseとGASを模擬し、実Google・実機・第三者受入を示さない。第三者0/30、AT-24〜30全体は未完。Calendar権限追加・本番運用開始なし。参照: docs/progress/2026-11-06-at28-synthetic-formula.md; docs/progress/2026-11-06-offline-contract-rehearsal.md。';
for(const cfg of [{name:'tasks',old:10},{name:'progress',old:7}]){
 const run=path.join(base,cfg.name);await fs.mkdir(run,{recursive:true});
 const src=path.join(dest,`${cfg.name}-2026-11-05-v28.pptx`);
 const p=await PresentationFile.importPptx(await FileBlob.load(src));
 if(p.slides.items.length!==cfg.old)throw Error('unexpected source slide count');
 for(const prior of p.slides.items){
  text(prior,'2026/11/6の現況は最終ページを参照',850,18,380,30,15,C.gray,false,'right');
  prior.speakerNotes.text='【2026-11-06 追補あり】既存本文・従来の記述は当時の状況です。最新の限定確認は最終ページを参照。\n'+(prior.speakerNotes.text||'');
 }
 const s=p.slides.add();s.background.fill=C.white;
 img(s,logo,50,13,174,55,'MightyLINK ロゴ','image/jpeg');
 text(s,'送迎管理システム　進捗・残課題',265,25,800,26,18,C.gray);
 img(s,photo,0,80,1280,135,'空の写真','image/jpeg','cover');
 box(s,44,115,1192,80,C.white,C.blue,3);box(s,46,115,1188,4,C.orange);
 text(s,'台帳の復元とローカル確認',70,127,1120,53,32,C.navy,true);
 text(s,'架空シートで確かめたこと',70,225,1000,40,24,C.navy,true);
 box(s,70,280,850,165,C.pale,C.line,1);
 text(s,'数式・太字の貼り戻しと再計算',90,292,810,40,24,C.navy,true);
 text(s,'Googleスプレッドシートの架空1シート・1セルで確認。\n通貨表示は確認しましたが、通貨書式の復元は未検証です。',90,342,810,84,21,C.dark);
 img(s,icon,970,276,215,180,'台帳比較の説明用イラスト');text(s,'イメージ',1095,460,100,20,13,C.gray,false,'right');
 box(s,70,480,1140,77,'#F5F9FB',C.line,1);
 text(s,'認証・画面などのローカル模擬確認：29件成功',90,490,1100,27,22,C.navy,true);
 text(s,'実Google接続・実機・第三者による受入とは別です。',90,521,1100,25,19,C.dark);
 box(s,70,581,1140,63,C.warn,C.orange,1);
 text(s,'未完了：AT-28全体・実連携・実機受入。第三者受入 0 / 30 件',90,589,1100,27,20,C.dark,true);
 text(s,'Calendar権限は未追加。本番運用は未開始です。',90,617,1100,21,17,C.dark);
 box(s,0,701,1280,19,C.navy);text(s,`${cfg.old+1} / ${cfg.old+1}　　2026年11月6日時点`,980,672,260,20,14,C.gray,false,'right');
 s.speakerNotes.text=notes;
 for(let i=0;i<p.slides.items.length;i++)await fs.writeFile(path.join(run,`${i+1}.png`),new Uint8Array(await (await p.export({slide:p.slides.items[i],format:'png',scale:1})).arrayBuffer()));
 const candidate=path.join(run,'candidate.pptx');await (await PresentationFile.exportPptx(p)).save(candidate);
 await fs.mkdir(path.join(run,'final'),{recursive:true});
 const final=path.join(run,'final',`${cfg.name}-2026-11-06-v29.pptx`);
 const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:python,integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],verifyArtifactToolImport:true,receiptPath:path.join(run,'validation.json'),explicitTotalSlideCount:cfg.old+1});
 console.log(JSON.stringify({name:cfg.name,result}));
}
