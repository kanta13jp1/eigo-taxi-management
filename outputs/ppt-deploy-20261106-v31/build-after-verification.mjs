// Authoring preparation only. No deck or manifest is written without completed public evidence.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';

const root=process.cwd();
const evidencePath=process.argv[2];
if(!evidencePath)throw Error('WAITING_FOR_RELEASE_AND_PUBLIC_VERIFICATION_EVIDENCE');
const e=JSON.parse(await fs.readFile(evidencePath,'utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const must=(ok,why)=>{if(!ok)throw Error(why);};
must(e.kind==='public-frontend-demo','Evidence must explicitly describe public frontend demo checks');
must(e.siteId==='eigo-taxi-test'&&e.deploymentStatus==='SUCCESS','Successful test-site deployment required');
must(typeof e.releaseId==='string'&&e.releaseId.trim().length>0,'Real release ID required');
must(!Number.isNaN(Date.parse(e.deployedAt))&&!Number.isNaN(Date.parse(e.verifiedAt)),'Deployment and verification timestamps required');
must(Date.parse(e.verifiedAt)>=Date.parse(e.deployedAt),'Verification must follow deployment');
must(e.exitCode===0&&e.status==='PASS','Completed passing public verification required');
must(Array.isArray(e.publicFiles)&&e.publicFiles.length>0,'Public/build file comparison required');
must(e.publicFiles.every(x=>x.status===200&&/^[a-f0-9]{64}$/i.test(x.buildSha256)&&x.buildSha256===x.publicSha256),'Every public file must match build hash');
must(Array.isArray(e.tests)&&e.tests.length>0&&e.tests.every(x=>x.status==='PASS'&&x.mode==='demo'&&x.id&&x.viewport),'Passing public demo tests required');
must(e.gasDeployed===false&&e.calendarPermissionAdded===false&&e.productionStarted===false&&e.realAcceptanceNewPasses===0,'Scope boundary must be explicit');
must(typeof e.recordPath==='string'&&typeof e.resultPath==='string','Source evidence paths required');
await fs.access(path.resolve(root,e.recordPath));await fs.access(path.resolve(root,e.resultPath));
for(const t of e.tests)if(t.screenshot)await fs.access(path.resolve(root,t.screenshot));

const runtime='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1104-709-0_26.1104.709.0_x64__3k8sg7r9htsxt/dependencies';
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.11149/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const out=path.resolve(root,e.outputDirectory||'outputs/ppt-deploy-20261106-v31/verified');
await fs.mkdir(out,{recursive:false}); // An existing directory is rejected, preserving previous evidence.
const entries=JSON.parse(await fs.readFile('docs/traceability/presentations.json','utf8'));
const ids=['PKG-03','PKG-04','PKG-05','PKG-06','PKG-07','PKG-12'];
const logo=await fs.readFile('outputs/visual-deck-work/image2.jpeg');
const sky=await fs.readFile('outputs/visual-deck-work/image.jpeg');
const icon=await fs.readFile('creative-library/progress-illustrations-2026-11-05/calendar-checklist-flat.png');
const colors={navy:'#102D52',blue:'#00A6DF',orange:'#F78C1E',pale:'#EAF7FB',gray:'#3E5366',white:'#FFFFFF',warn:'#FFF7EA'};
function box(s,x,y,w,h,fill='none',stroke='none',width=0){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:stroke,width}});}
function text(s,t,x,y,w,h,size=21,color=colors.navy,bold=false,align='left'){const sh=box(s,x,y,w,h);sh.text=t;sh.text.style={typeface:'Yu Gothic',fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',insets:0};return sh;}
function image(s,b,x,y,w,h,alt,type='image/png',fit='contain'){s.images.add({blob:b,contentType:type,alt,fit,position:{left:x,top:y,width:w,height:h}});}
const publicSummary=`公開ファイル ${e.publicFiles.length}点がビルドと一致。公開デモ ${e.tests.length}件 PASS。`;
const currentNotes=`【検証サイト配備後の最新記録】配備 ${e.deployedAt}、検証完了 ${e.verifiedAt}。site=${e.siteId}、release=${e.releaseId}。${publicSummary}\n対象: 予約フォームの小画面縦スクロール。公開フロントエンドのデモ経路に限る。GAS未配備・Calendar権限未追加・本番未開始。実Google/実機/原受入30件/第三者の新合格には加算しない。\n根拠: ${e.recordPath} / ${e.resultPath}\n公開照合: ${JSON.stringify(e.publicFiles)}\n公開デモ: ${JSON.stringify(e.tests)}\n【以下は配備前の履歴。各記録日の状況として保持】\n`;
const results=[];
for(const entry of entries.filter(x=>ids.includes(x.id))){
 const source=await fs.readFile(entry.path);must(hash(source)===entry.sha256,'Source deck hash mismatch '+entry.id);
 const name=path.basename(entry.path).split('-2026-')[0],run=path.join(out,name);await fs.mkdir(run);
 const p=await PresentationFile.importPptx(await FileBlob.load(entry.path));
 must(p.slides.items.length===entry.slides,'Source slide count mismatch');
 const inspected=await p.inspect({kind:'textbox',maxChars:900000});
 const oldHeaders=['2026/11/6の追補は末尾・ノート参照','本日の更新は最終2頁・ノート参照'];
 for(let i=0;i<p.slides.items.length;i++){
  const s=p.slides.items[i],header=inspected.records.find(r=>r.slideIndex===i&&oldHeaders.includes(r.text));
  if(header)p.resolve(header.id).text.replace(header.text,'配備前の記録／最新は最終ページ');
  else text(s,'配備前の記録／最新は最終ページ',850,18,380,30,14,colors.gray,false,'right');
  s.speakerNotes.text=currentNotes+(s.speakerNotes.text||'');
 }
 const s=p.slides.add(),page=p.slides.items.length;
 s.background.fill=colors.white;image(s,logo,50,13,174,55,'MightyLINK ロゴ','image/jpeg');
 text(s,'送迎管理システム　検証サイトの更新',265,25,820,26,18,colors.gray);
 image(s,sky,0,80,1280,135,'空の写真','image/jpeg','cover');
 box(s,44,115,1192,80,colors.white,colors.blue,3);box(s,46,115,1188,4,colors.orange);
 text(s,'検証サイトへ反映し、小画面の登録を確認',70,127,1120,53,32,colors.navy,true);
 text(s,'公開された画面で確認してから、結果を記録',70,227,1120,40,24,colors.navy,true);
 const cards=[['修正を反映','検証サイトのみ'],['公開デモで操作','小さい画面から登録'],['結果を確認',`${e.tests.length}件 PASS`]];
 for(let i=0;i<cards.length;i++){
  const x=70+i*400;box(s,x,292,335,125,colors.pale,colors.blue,2);
  text(s,cards[i][0],x+20,308,295,35,26,colors.navy,true,'center');
  text(s,cards[i][1],x+20,361,295,34,21,colors.gray,false,'center');
  if(i<2)text(s,'→',x+347,329,47,40,32,colors.orange,true,'center');
 }
 image(s,icon,70,452,180,125,'検証手順の説明用イラスト');
 text(s,publicSummary,280,453,920,42,24,colors.blue,true);
 text(s,'対象は予約フォームの縦スクロールです。',280,507,920,32,22,colors.navy);
 text(s,'実Google・Calendar・原受入30件の新合格とは別です。',70,581,1140,35,22,colors.gray);
 box(s,70,627,1140,32,colors.warn,colors.orange,1);text(s,'GAS未配備／Calendar権限未追加／本番未開始／第三者受入 0 / 30',88,628,1100,29,18,colors.navy);
 box(s,0,701,1280,19,colors.navy);
 const slideId=`${entry.id}-SL-${String(page).padStart(2,'0')}`;
 text(s,slideId+' | 公開フロントエンド・デモ経路の確認',70,672,850,20,12,colors.gray);
 text(s,`${page} / ${page}`,1110,672,130,20,14,colors.gray,false,'right');
 s.speakerNotes.text=slideId+'\n'+currentNotes;
 const fileName=`${name}-2026-11-06-v31.pptx`,candidate=path.join(run,'candidate.pptx');await (await PresentationFile.exportPptx(p)).save(candidate);
 await fs.mkdir(path.join(run,'final'));
 const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:path.join(run,'final',fileName),pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],verifyArtifactToolImport:true,receiptPath:path.join(run,'validation.json'),explicitTotalSlideCount:page});
 results.push({id:entry.id,name,slides:page,sourcePath:entry.path,sourceSha256:entry.sha256,result});
}
await fs.writeFile(path.join(out,'authoring-results.json'),JSON.stringify({evidencePath,evidenceSha256:hash(await fs.readFile(evidencePath)),results},null,2));
// Promotion to deliverables/manifest deliberately remains a separate, post-render-and-review operation.
console.log(JSON.stringify({prepared:true,decks:results.length,outputDirectory:out,manifestUpdated:false}));
