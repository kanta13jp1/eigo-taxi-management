import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),base=path.resolve('outputs/consumption-timing-20261110/ppt-v34/finalized');
const runtime='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1104-2876-0_26.1104.2876.0_x64__3k8sg7r9htsxt/dependencies';
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.22356/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),assert=(x,m)=>{if(!x)throw Error(m)};
const regPath='docs/traceability/registry.json',manifestPath='docs/traceability/presentations.json';
const regBytes=await fs.readFile(regPath),reg=JSON.parse(regBytes),regSha=sha(regBytes);
const freezePath='outputs/consumption-timing-20261110/ppt-v34/freeze.json';
const freezeBytes=await fs.readFile(freezePath),freeze=JSON.parse(freezeBytes);
assert(freeze.status==='ROOT_LOCK'&&reg.version==='2026-11-10-r18'&&freeze.registrySha256===regSha&&process.argv[2]===regSha,'Frozen root-reviewed r18 required');
assert(reg.facts.customerAcceptancePassed===0&&reg.facts.customerAcceptanceTotal===6&&reg.facts.release==='HOLD'&&reg.facts.productionStarted===false,'Acceptance boundary changed');
assert(freeze.publicStatus==='PASS'&&freeze.customerPassed===0&&freeze.productionStarted===false,'Root public facts pending');
for(const e of freeze.evidenceFiles)assert(sha(await fs.readFile(e.path))===e.sha256,'Frozen evidence changed: '+e.path);
const manifestBytes=await fs.readFile(manifestPath),entries=JSON.parse(manifestBytes);
assert(entries.length===12&&entries.every(e=>e.path.endsWith('-v33.pptx')),'Expected intact v33 source package');
const docs={'PKG-01':'01_BUSINESS_FLOWS','PKG-02':'03_REQUIREMENTS','PKG-03':'04_FUNCTIONAL_SPEC','PKG-04':'17_TEST_SPEC','PKG-05':'05_TASKS','PKG-06':'18_IMPLEMENTATION_INDEX','PKG-07':'19_TEST_CODE_INDEX','PKG-08':'06_ACCEPTANCE_TEST_SPEC','PKG-09':'20_OPERATIONS','PKG-10':'21_USER_MANUAL','PKG-11':'07_TRACEABILITY_MATRIX','PKG-12':'08_ACCEPTANCE_RESULTS'};
const C={navy:'#102D52',blue:'#00A6DF',orange:'#F78C1E',pale:'#EAF7FB',gray:'#3E5366',white:'#FFFFFF',line:'#D6E8EE',warn:'#FFF7EA'};
function box(s,x,y,w,h,fill='none',stroke='none',width=0){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:stroke,width}})}
function text(s,t,x,y,w,h,size=21,color=C.navy,bold=false,align='left'){const a=box(s,x,y,w,h);a.text=t;a.text.style={typeface:'Yu Gothic',fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',insets:0};return a}
const notesCurrent='【2026-11-10 r18 現行状態】'+freeze.observationSummary+'\n【確認範囲】'+freeze.contentReview+'\n【現在の利用者向け説明】予約時点では残数を減らさず、先生・管理者が完了すると片道1枚・往復2枚減らす。日時の経過だけでは減らさない。残り2枚以下でも減算時点の説明とMauro・Brendaの連絡案内を表示する。匿名デモはブラウザー内の架空データだけで、Google台帳・Calendarへ書き込まない。\n【随時実施】顧客6件は本人の操作・対象版・日時・実測値がそろうまで未実施。0/6・本番HOLD。固定2URL、固定日のA片道・B往復、5→4→2→12を照合して未実施だけ再開する。旧第三者30件の必須条件は撤回済み、原AT01〜30は開発側の技術検証。\n【過去の状態】既存のページと旧ノートは当時の履歴として保全する。現在の状態は本注記・末尾2頁・r18正本を参照。\n【表示検査】全頁ローカル描画・再取込・配置検査を行う。native PowerPointアプリの表示は未確認。\n根拠: '+freeze.evidenceFiles.map(e=>e.path).join('; ')+'\n';
assert(!/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|https:\/\/(?:docs|script|calendar)\.google\.com|#\/parent\/[0-9a-f-]{30,}/.test(notesCurrent),'Private fact in notes');
await fs.mkdir(base,{recursive:false});
await fs.writeFile(path.join(base,'registry-snapshot.json'),regBytes);await fs.writeFile(path.join(base,'source-manifest.json'),manifestBytes);
const records=[];
for(const entry of entries){
 const source=await fs.readFile(entry.path);assert(sha(source)===entry.sha256,'Source v33 changed');
 const name=path.basename(entry.path).split('-2026-')[0],run=path.join(base,name);await fs.mkdir(run);
 const p=await PresentationFile.importPptx(await FileBlob.load(entry.path));assert(p.slides.items.length===entry.slides,'Source count mismatch');
 const n=entry.slides;
 p.slides.items[n-2].duplicate().moveTo(n);
 p.slides.items[n-1].duplicate().moveTo(n+1);
 assert(p.slides.items.length===n+2,'Append failed');
 const inspect=await p.inspect({kind:'textbox,shape,image',maxChars:1000000});
 for(const i of [n,n+1]){
  const rows=inspect.records.filter(r=>r.slideIndex===i);
  // Keep the imported master/header/sky/title frame; clear only the previous body.
  p.delete(rows.filter(r=>r.position?.top>=216&&r.position.top<670).map(r=>r.id));
  const title=rows.find(r=>r.text=== (i===n?'同じGoogleで2つの検証画面を使えます':'日付に依存せず、途中から再開できます'));
  assert(title,'Missing reference title '+name+' '+i);
  p.resolve(title.id).text.replace(title.text,i===n?'予約後の残数を、画面で説明します':'反映後の確認と残る作業');
  for(const f of rows.filter(r=>r.position?.top>=670&&typeof r.text==='string')){
   if(f.text.includes('2026-11-07 r17追補'))p.resolve(f.id).text.replace(f.text,`${entry.id}　2026-11-10 r18追補`);
   else if(/\d+ \/ \d+/.test(f.text))p.resolve(f.id).text.replace(f.text,`${i+1} / ${n+2}　2026年11月10日`);
  }
 }
 {
  const s=p.slides.items[n];
  text(s,'予約した時点では減らず、先生の「完了」で減ります',70,228,1140,40,25,C.navy,true);
  text(s,'例：残り5回から、片道・往復を順に完了した場合',70,275,1140,30,20,C.gray);
  const blocks=[['予約したとき','5回のまま','予約だけでは消費しません'],['片道を完了','4回へ','先生・管理者が1回分を消費'],['続けて往復を完了','2回へ','先生・管理者が2回分を消費']];
  blocks.forEach((b,i)=>{const x=70+i*390;box(s,x,326,360,210,C.pale,C.blue,1.5);text(s,b[0],x+16,343,328,34,23,C.navy,true,'center');text(s,b[1],x+16,394,328,58,37,C.blue,true,'center');text(s,b[2],x+15,474,330,44,19,C.gray,false,'center');if(i<2)text(s,'→',x+363,400,26,45,27,C.orange,true,'center')});
  text(s,'残り2回以下でも、同じ説明とMauro・Brendaへの連絡案内を表示します。',70,565,1140,44,22,C.navy);
  box(s,70,623,1140,38,C.warn,C.orange,1);text(s,'送迎日時を過ぎただけでは、自動で残数は減りません。',84,626,1112,31,20,C.gray);
 }
 {
  const s=p.slides.items[n+1];
  text(s,'11月10日：修正を検証サイトへ反映し、公開デモで確認',70,228,1140,40,24,C.navy,true);
  const rows=[['確認したこと','結果','範囲'],['残数の説明と予約フォーム','公開画面で確認',freeze.publicUiSummary],['予約・完了後の残数','公開デモで確認',freeze.balanceSummary],['不完全な応答後の再送','模擬試験で確認','同じIDを保持。一覧を1行に集約'],['顧客確認6件・実Google受入','引き続き確認','顧客0/6。技術試験の残りは継続']];
  const table=s.tables.add({rows:rows.length,columns:3,left:70,top:280,width:1140,height:296,columnWidths:[360,260,520],values:rows});
  table.cells.block({row:0,column:0,rowCount:rows.length,columnCount:3}).assign({fill:C.white,textStyle:{typeface:'Yu Gothic',fontSize:19,color:C.navy},margins:{left:14,right:10,top:5,bottom:5},anchor:'center'});table.borders.assign({style:'solid',fill:C.line,width:1});
  for(let c=0;c<3;c++){table.getCell(0,c).fill=C.pale;table.getCell(0,c).text.style={typeface:'Yu Gothic',fontSize:21,color:C.navy,bold:true};}
  text(s,`公開ファイル7応答一致　検証Hosting ${freeze.hostingVersion}`,70,583,1140,31,20,C.gray);
  box(s,70,623,1140,38,C.warn,C.orange,1);text(s,'実Google・実機・顧客確認を区別します。本番運用は開始していません。',84,626,1112,31,19,C.gray);
 }
 const docPath=`docs/acceptance/${docs[entry.id]}.md`,md=await fs.readFile(docPath,'utf8');
 for(let i=0;i<p.slides.items.length;i++){
  const s=p.slides.items[i],old=s.speakerNotes.text||'';
  s.speakerNotes.text=notesCurrent+(i===0?`\n【本冊のr18生成正本全文】${docPath}\n${md}\n`:'')+(i<n?'\n【以下はv33時点の旧ノート。当時の履歴として保全】\n'+old:'\n【本頁はr18の現行追補】\n説明例は実測値と区別する。上の5→4→2は計算例であり、公開デモの実測値は確認記録を参照する。');
 }
 const candidate=path.join(run,'candidate.pptx');await(await PresentationFile.exportPptx(p)).save(candidate);await fs.mkdir(path.join(run,'final'));
 const final=path.join(run,'final',`${name}-2026-11-10-v34.pptx`);
 const v=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide',String(n+2)],requiredNativeTableOwnerSlides:[n+2],fontPolicy:{basis:'reference',families:['Yu Gothic'],referencePath:path.resolve(entry.path),referenceSha256:entry.sha256},verifyArtifactToolImport:true,receiptPath:path.join(run,'validation.json'),explicitTotalSlideCount:n+2});
 const q=await PresentationFile.importPptx(await FileBlob.load(final));await fs.mkdir(path.join(run,'roundtrip'));
 for(let i=0;i<q.slides.items.length;i++)await fs.writeFile(path.join(run,'roundtrip',`${i+1}.png`),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));
 records.push({id:entry.id,name,source:entry.path,sourceSha256:entry.sha256,sourceSlides:n,preservedBodySlides:n,sourceMdPath:docPath,sourceMdSha256:sha(Buffer.from(md)),final,sha256:v.finalSha256,slides:n+2,validation:v.presentationLayout});
 console.log(JSON.stringify({name,slides:n+2,findings:v.presentationLayout.finding_count,warnings:v.presentationLayout.warning_count}));
}
assert(sha(await fs.readFile(regPath))===regSha,'Registry changed during authoring');
assert(sha(await fs.readFile(manifestPath))===sha(manifestBytes),'Manifest changed during authoring');
await fs.writeFile(path.join(base,'authoring-results.json'),JSON.stringify({date:'2026-11-10',registryVersion:reg.version,registrySha256:regSha,freezeSha256:sha(freezeBytes),records,manifestUpdated:false},null,2));
console.log('COMPLETE12/184');
