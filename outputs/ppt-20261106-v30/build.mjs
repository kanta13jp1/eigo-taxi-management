import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';

const root=process.cwd(), base=path.join(root,'outputs/ppt-20261106-v30-final2');
const dest=path.join(root,'docs/deliverables/2026-10-23-traceability');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.11149/skills/presentations';
const deps='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1104-709-0_26.1104.709.0_x64__3k8sg7r9htsxt/dependencies';
process.env.RUNTIME_NODE_MODULES=deps+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const photo=await fs.readFile(path.join(root,'outputs/visual-deck-work/image.jpeg'));
const logo=await fs.readFile(path.join(root,'outputs/visual-deck-work/image2.jpeg'));
const icon=await fs.readFile(path.join(root,'creative-library/progress-illustrations-2026-11-05/calendar-checklist-flat.png'));
const C={navy:'#102D52',blue:'#00A6DF',orange:'#F78C1E',pale:'#EAF7FB',gray:'#3E5366',white:'#FFFFFF',dark:'#172637',line:'#D6E8EE',warn:'#FFF7EA'};
function box(s,x,y,w,h,fill='none',border='none',sw=0){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:border,width:sw}});}
function text(s,t,x,y,w,h,size=21,color=C.dark,bold=false,align='left'){const a=box(s,x,y,w,h);a.text=t;a.text.style={typeface:'Yu Gothic',fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',insets:0};return a;}
function img(s,b,x,y,w,h,alt,mime='image/png',fit='contain'){s.images.add({blob:b,contentType:mime,alt,fit,position:{left:x,top:y,width:w,height:h}});}
function frame(p,title,heading,page,total){const s=p.slides.add();s.background.fill=C.white;img(s,logo,50,13,174,55,'MightyLINK ロゴ','image/jpeg');text(s,title,265,25,770,26,18,C.gray);img(s,photo,0,80,1280,135,'空の写真','image/jpeg','cover');box(s,44,115,1192,80,C.white,C.blue,3);box(s,46,115,1188,4,C.orange);text(s,heading,70,127,1120,53,32,C.navy,true);box(s,0,701,1280,19,C.navy);text(s,`${page} / ${total}　　2026年11月6日時点`,980,672,260,20,14,C.gray,false,'right');return s;}
const boundary='追加の20件はローカル模擬の確認です。実Google・実機・第三者受入とは別です。';
const updateNotes='【2026-11-06 追加自動テスト】予約フォームの小画面スクロールを修正前2FAIL・修正後2PASSで確認。修正は未配備。新ランナーの現行画面LOCAL-UI-01〜14は独立実行14/14PASS、RUN-SAFE-01〜04は4/4PASS。HMRを含まないローカル試験ビルド、HTTP/WebSocket遮断の自己試験、既存出力先拒否を確認。一部の完了/拒否はApiService直接呼出。実Google・実Calendar・実機・第三者受入の合格を意味しない。AT-24〜30全体未完、第三者0/30、Calendar権限未追加、本番未開始。根拠: docs/progress/2026-11-06-booking-modal-scroll.md; docs/progress/2026-11-06-local-ui-runner.md; docs/acceptance/LOCAL_UI_REHEARSAL_20261106.md。画像は説明用の架空イラスト。';
const configs=[
 {name:'design',src:'design-2026-11-03-v27.pptx',count:10,title:'設計',doc:'docs/acceptance/04_FUNCTIONAL_SPEC.md',prefix:'FS'},
 {name:'implementation',src:'implementation-2026-11-03-v27.pptx',count:10,title:'実装コード対応',doc:'docs/acceptance/18_IMPLEMENTATION_INDEX.md',prefix:'CODE'},
 {name:'test-spec',src:'test-spec-2026-11-03-v27.pptx',count:10,title:'テスト仕様書',doc:'docs/acceptance/17_TEST_SPEC.md',prefix:'TS'},
 {name:'test-code',src:'test-code-2026-11-03-v27.pptx',count:10,title:'テストコード対応',doc:'docs/acceptance/19_TEST_CODE_INDEX.md',prefix:'TEST'},
 {name:'tasks',src:'tasks-2026-11-06-v29.pptx',count:11,title:'タスクリスト'},
 {name:'progress',src:'progress-2026-11-06-v29.pptx',count:8,title:'進捗・残課題'},
];
const selected=process.argv[2];
for(const cfg of configs.filter(c=>!selected||c.name===selected)){
 const run=path.join(base,cfg.name);await fs.mkdir(path.join(run,'final'),{recursive:true});
 const p=await PresentationFile.importPptx(await FileBlob.load(path.join(dest,cfg.src)));
 if(p.slides.items.length!==cfg.count)throw Error('unexpected source slide count '+cfg.name);
 const inspected=await p.inspect({kind:'textbox',maxChars:900000});
 const records=inspected.records;
 if(cfg.name==='implementation'){
  const hit=records.find(r=>r.slideIndex===5&&r.text==='src/components/ParentPortal.tsx :: ParentPortal');
  if(!hit)throw Error('CODE-21 visible row not found');
  p.resolve(hit.id).text.replace(hit.text,'ParentPortal.tsx :: ParentPortal\nAddRideModal.tsx :: 高さ制限・縦スクロール（11/6、未配備）');
 }
 if(cfg.name==='design'){
  const hit=records.find(r=>r.slideIndex===5&&r.text?.startsWith('画面 A02, P02, D01。I/F IF-03。'));
  if(!hit)throw Error('FS-21 visible row not found');
  p.resolve(hit.id).text.replace(hit.text,'A02・P02・D01／IF-03。幅375pxで画面内に収める。\n予約フォームは高さを制限し縦スクロール（ローカル修正・未配備）。');
 }
 let sections=[];
 if(cfg.doc){const md=await fs.readFile(path.join(root,cfg.doc),'utf8');sections=md.split(new RegExp(`(?=<a id="${cfg.prefix}-\\d+"></a>)`)).slice(1);if(sections.length!==38)throw Error('source sections mismatch '+cfg.name);}
 for(let i=0;i<p.slides.items.length;i++){
  const s=p.slides.items[i],old=s.speakerNotes.text||'';
  const oldHeader=records.find(r=>r.slideIndex===i&&r.text==='2026/11/6の現況は最終ページを参照');
  if(oldHeader)p.resolve(oldHeader.id).text.replace(oldHeader.text,'本日の更新は最終2頁・ノート参照');
  else text(s,'2026/11/6の追補は末尾・ノート参照',785,18,445,30,15,C.gray,false,'right');
  const current=cfg.doc?`【2026-11-06 現行正本】${cfg.doc}\n${sections.slice(i*4,i*4+4).join('\n')}`:'';
  s.speakerNotes.text=[updateNotes,current,'【旧ノートを保持。過去の状況は各記録日で判断】',old].filter(Boolean).join('\n');
 }
 const extraAt28=['tasks','progress'].includes(cfg.name),total=cfg.count+(extraAt28?2:1);
 const s=frame(p,`送迎管理システム　${cfg.title}`,'受入準備の実装と自動確認',cfg.count+1,total);
 text(s,'予約画面を直し、繰り返し確認できる試験を追加',70,225,1110,40,24,C.navy,true);
 const rows=[['小さい画面の予約フォーム','修正前 2件 FAIL / 修正後 2件 PASS','縦にスクロールして登録できることを確認'],['現行画面の模擬リハーサル','14件 PASS','予約・取消・残数・ログアウト等を自動確認'],['試験記録を守る自己テスト','4件 PASS','既存出力拒否・JST日付・通信許可範囲を確認']];
 for(let i=0;i<rows.length;i++){const y=284+i*94;box(s,70,y,875,82,i%2? '#F5F9FB':C.pale,C.line,1);text(s,rows[i][0],90,y+8,430,28,22,C.navy,true);text(s,rows[i][1],530,y+8,395,28,21,C.blue,true,'right');text(s,rows[i][2],90,y+43,830,29,19,C.dark);}
 img(s,icon,978,325,220,175,'試験準備の説明用イラスト');text(s,'イメージ',1095,502,100,20,13,C.gray,false,'right');
 text(s,boundary,70,577,1130,28,19,C.gray);
 box(s,70,617,1140,39,C.warn,C.orange,1);text(s,'修正は未配備。実環境受入は未完了、第三者受入は 0 / 30 件です。',88,620,1100,32,19,C.dark,true);
 s.speakerNotes.text=updateNotes+'\n試験ID: UI-SCROLL-01, UI-SCROLL-02, LOCAL-UI-01〜14, RUN-SAFE-01〜04。正確な識別子と対応はregistry.jsonを参照。';
 if(extraAt28){
  const a=frame(p,`送迎管理システム　${cfg.title}`,'バックアップは設定も一緒に戻す',cfg.count+2,total);
  text(a,'架空の1シートで、Googleスプレッドシート上の違いを確認',70,226,1130,40,23,C.navy,true);
  const cols=[{x:70,title:'セル範囲を貼り戻す',fill:C.warn,note:'条件付き書式のルールが戻らず\n列幅も変わったまま',accent:C.orange},{x:665,title:'シートタブをコピーする',fill:C.pale,note:'ルール・入力規則・幅・高さを確認\n数式・通貨・日付の表示も確認',accent:C.blue}];
  for(const c of cols){box(a,c.x,295,545,208,c.fill,c.accent,2);text(a,c.title,c.x+25,311,490,40,26,C.navy,true);text(a,c.note,c.x+25,371,490,87,22,C.dark);}
  text(a,'復元する方法によって、戻る内容が違います。',70,528,1140,38,24,C.navy,true);
  box(a,70,592,1140,61,C.warn,C.orange,1);text(a,'確認したのは架空の単一シートです。実台帳全体・Calendar整合・共有権限は未確認。',88,600,1100,43,20,C.dark);
  a.speakerNotes.text='【2026-11-06 AT-28実Googleの限定確認】新しい架空コピーのみを使用。通常範囲貼付では条件付き書式の色のみ残ってルールなし、列幅は160→100のまま。補正としてバックアップのシートタブを隔離先へ複写。条件付き書式D2>10、入力規則の選択肢「準備」「完了」、列幅160px、行高42px、数式・通貨・日付表示を読み取り確認。元検証台帳・既存バックアップ・Calendar・共有設定は変更なし。単一架空シートの範囲に限る部分確認。実台帳全体の復元、運用方針の合意、Calendar整合、第三者受入は未確認。根拠: docs/progress/2026-11-06-at28-native-settings.md、outputs/at28-native-settings-20261106/（PNG7枚）。Calendar権限未追加、本番未開始。';
 }
 const pkg={design:'PKG-03',implementation:'PKG-06','test-spec':'PKG-04','test-code':'PKG-07',tasks:'PKG-05',progress:'PKG-12'}[cfg.name];
 for(let i=cfg.count;i<p.slides.items.length;i++){
  const slideId=`${pkg}-SL-${String(i+1).padStart(2,'0')}`;
  text(p.slides.items[i],`${slideId} | 2026-11-06追補 | 限定検証`,70,672,850,20,12,C.gray);
  p.slides.items[i].speakerNotes.text=slideId+'\n'+p.slides.items[i].speakerNotes.text;
 }
 for(let i=0;i<p.slides.items.length;i++)await fs.writeFile(path.join(run,`${i+1}.png`),new Uint8Array(await (await p.export({slide:p.slides.items[i],format:'png',scale:1})).arrayBuffer()));
 const candidate=path.join(run,'candidate.pptx');await (await PresentationFile.exportPptx(p)).save(candidate);
 const final=path.join(run,'final',`${cfg.name}-2026-11-06-v30.pptx`);
 const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:deps+'/python/python.exe',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],verifyArtifactToolImport:true,receiptPath:path.join(run,'validation.json'),explicitTotalSlideCount:total});
 console.log(JSON.stringify({name:cfg.name,result}));
}
