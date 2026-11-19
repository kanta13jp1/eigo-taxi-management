import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),out=path.resolve('outputs/consumption-timing-20261110/ppt-v34/meeting'),dest=path.resolve('docs/deliverables/2026-11-10-premeeting');
const runtime='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1104-2876-0_26.1104.2876.0_x64__3k8sg7r9htsxt/dependencies',skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.22356/skills/presentations';process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),assert=(x,m)=>{if(!x)throw Error(m)};
const sourcePath='outputs/consumption-timing-20261110/ppt-v34/finalized/progress/final/progress-2026-11-10-v34.pptx',sourceSha=sha(await fs.readFile(sourcePath));
const regPath='docs/traceability/registry.json',regBytes=await fs.readFile(regPath),reg=JSON.parse(regBytes);
assert(reg.version==='2026-11-10-r18'&&reg.facts.customerAcceptancePassed===0&&reg.facts.productionStarted===false,'Scope changed');
const briefPath='docs/progress/2026-11-10-premeeting-brief.md',brief=await fs.readFile(briefPath,'utf8');
assert(brief.includes('2026年11月11日（水）16:00')&&brief.includes('20〜30分の提案'),'Meeting facts mismatch');
const p=await PresentationFile.importPptx(await FileBlob.load(sourcePath));assert(p.slides.items.length===14,'Progress reference count');p.slides.keep([12,13]);p.slides.items[0].duplicate().moveTo(0);p.slides.items[1].duplicate().moveTo(1);assert(p.slides.items.length===4,'Four pages required');
const C={navy:'#102D52',blue:'#00A6DF',orange:'#F78C1E',pale:'#EAF7FB',gray:'#3E5366',white:'#FFFFFF',line:'#D6E8EE',warn:'#FFF7EA'};
function box(s,x,y,w,h,fill='none',stroke='none',width=0){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:stroke,width}})}
function text(s,t,x,y,w,h,size=21,color=C.navy,bold=false,align='left'){const a=box(s,x,y,w,h);a.text=t;a.text.style={typeface:'Yu Gothic',fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',insets:0};return a}
const all=await p.inspect({kind:'textbox,shape,image',maxChars:1000000});
for(let i=0;i<4;i++){
 const rows=all.records.filter(r=>r.slideIndex===i);
 for(const h of rows.filter(r=>r.position?.top<80&&r.text?.includes('送迎管理システム')))p.resolve(h.id).text.replace(h.text,'送迎管理システム　事前打ち合わせ');
 if(i<2){
  p.delete(rows.filter(r=>r.position?.top>=216&&r.position.top<670).map(r=>r.id));
  const title=rows.find(r=>r.text==='予約後の残数を、画面で説明します');assert(title,'Reference title missing');p.resolve(title.id).text.replace(title.text,i===0?'11月11日（水）16時の事前打ち合わせ':'先生のデモと、小林さんの確認');
 }
 for(const f of rows.filter(r=>r.position?.top>=670&&typeof r.text==='string')){
  if(f.text.includes('r18追補'))p.resolve(f.id).text.replace(f.text,'事前打合せ　2026-11-11 16:00　r18の確認用');
  else if(/\d+ \/ \d+/.test(f.text))p.resolve(f.id).text.replace(f.text,`${i+1} / 4　2026年11月10日作成`);
 }
 const old=p.slides.items[i].speakerNotes.text||'';
 p.slides.items[i].speakerNotes.text='【打ち合わせ】2026年11月11日（水）16:00 JST、11月9日のGoogle Chatで合意。先生への案内前に小林さんと確認する。所要20〜30分は進行案で、終了時刻の合意ではない。新しい会議の予約・招待・送信は行わない。\n根拠: '+briefPath+'。\n'+(i===0?'【事前打ち合わせメモ全文】\n'+brief+'\n':'')+'【r18の現行確認状態】顧客確認0/6、本番HOLD。デモはブラウザー内の架空データのみ。実Google・実機・顧客確認を区別する。\n'+old;
}
{
 const s=p.slides.items[0];text(s,'先生へ案内する前に、試し方と運用の決めごとをそろえます',70,228,1140,44,24,C.navy,true);
 const rows=[['1　デモで操作を確認','予約だけでは残数が変わらず、先生の「完了」で減る動きを確認します。'],['2　先生へ案内する内容','管理者デモ・保護者デモの入口と、先生に試してほしい操作をそろえます。'],['3　本番前に決めること','取消・精算、完了入力の担当、バックアップ、教室のGoogleアカウントを相談します。']];
 rows.forEach((r,i)=>{const y=296+i*100;text(s,r[0],70,y,1140,34,24,C.navy,true);text(s,r[1],105,y+40,1105,48,21,C.gray)});
 box(s,70,623,1140,38,C.warn,C.orange,1);text(s,'20〜30分は進行案です。終了時刻は未確定です。',84,626,1112,31,20,C.gray);
}
{
 const s=p.slides.items[1];text(s,'デモの使い勝手と、実際の連携の確認を分けて進めます',70,228,1140,44,24,C.navy,true);
 const cols=[{x:70,w:540,title:'先生のデモ試用',lines:['Googleログインは不要','管理者・保護者の画面を体験','予約・取消・完了・残数を確認','架空データだけを使用','Google台帳・カレンダーへ書込なし']},{x:650,w:560,title:'小林さんの顧客確認6件',lines:['登録した会社Googleでログイン','同じ本人が2つの固定URLを使う','用意済みの架空生徒・予約で確認','日時・実測値・結果を共有表へ記入','現在は0/6件。途中から再開できます']}];
 cols.forEach(c=>{box(s,c.x,294,c.w,301,C.pale,C.blue,1.5);text(s,c.title,c.x+20,310,c.w-40,40,25,C.navy,true,'center');c.lines.forEach((t,i)=>text(s,t,c.x+22,369+i*40,c.w-44,34,21,C.gray));});
 box(s,70,623,1140,38,C.warn,C.orange,1);text(s,'デモの感想と受入の合格は別に記録します。本番開始は別途判断します。',84,626,1112,31,19,C.gray);
}
await fs.mkdir(out,{recursive:false});const candidate=path.join(out,'candidate.pptx');await(await PresentationFile.exportPptx(p)).save(candidate);await fs.mkdir(path.join(out,'final'));
const final=path.join(out,'final','premeeting-2026-11-11-v1.pptx');
const v=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide','4'],requiredNativeTableOwnerSlides:[4],fontPolicy:{basis:'reference',families:['Yu Gothic'],referencePath:path.resolve(sourcePath),referenceSha256:sourceSha},verifyArtifactToolImport:true,receiptPath:path.join(out,'validation.json'),explicitTotalSlideCount:4});
const q=await PresentationFile.importPptx(await FileBlob.load(final));await fs.mkdir(path.join(out,'roundtrip'));
for(let i=0;i<4;i++)await fs.writeFile(path.join(out,'roundtrip',`${i+1}.png`),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));
assert(sha(await fs.readFile(regPath))===sha(regBytes),'Registry changed');await fs.mkdir(dest,{recursive:true});const delivered=path.join(dest,path.basename(final));await fs.copyFile(final,delivered);
await fs.writeFile(path.join(out,'authoring-result.json'),JSON.stringify({date:'2026-11-10',meetingDateJst:'2026-11-11T16:00:00+09:00',duration:'20–30 minutes is a proposal, not agreed end time',sourcePath,sourceSha256:sourceSha,briefPath,briefSha256:sha(Buffer.from(brief)),registryVersion:reg.version,registrySha256:sha(regBytes),final:delivered,sha256:v.finalSha256,slides:4,validation:path.join(out,'validation.json'),nativePowerPointVerified:false,customerPassed:0,productionStarted:false,canonicalTwelveManifestModified:false},null,2));
console.log(JSON.stringify({delivered,sha256:v.finalSha256,layout:v.presentationLayout},null,2));
