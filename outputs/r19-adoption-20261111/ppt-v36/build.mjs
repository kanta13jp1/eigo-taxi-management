// Reissue the 12 presentation packages against registry r19.
// Appends two current pages to each deck; existing pages and their notes are left as history.
// Usage: node build.mjs <registry sha256>   (run from the repository root, after r19 is applied and documents are generated)
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),base=path.resolve('outputs/r19-adoption-20261111/ppt-v36/finalized');
const runtime=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies').replace(/\\/g,'/');
const skill=path.join(os.homedir(),'.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.22356/skills/presentations').replace(/\\/g,'/');
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),assert=(x,m)=>{if(!x)throw Error(m)};
const regPath='docs/traceability/registry.json',manifestPath='docs/traceability/presentations.json',freezePath='outputs/r19-adoption-20261111/ppt-v36/freeze.json';
const regBytes=await fs.readFile(regPath),reg=JSON.parse(regBytes),regSha=sha(regBytes);
const freezeBytes=await fs.readFile(freezePath),freeze=JSON.parse(freezeBytes);
assert(reg.version==='2026-11-11-r19'&&freeze.registrySha256===regSha&&process.argv[2]===regSha,'Frozen r19 registry required');
assert(reg.facts.customerAcceptancePassed===0&&reg.facts.customerAcceptanceTotal===6&&reg.facts.release==='HOLD'&&reg.facts.productionStarted===false,'Acceptance boundary changed');
async function lock(){for(const e of freeze.evidenceFiles)assert(sha(await fs.readFile(e.path))===e.sha256,'Frozen evidence changed: '+e.path)}
await lock();
const manifestBytes=await fs.readFile(manifestPath),entries=JSON.parse(manifestBytes);
assert(entries.length===12&&entries.every(e=>e.registryVersion==='2026-11-10-r18'),'Expected the intact r18 package set');
const docs={'PKG-01':'01_BUSINESS_FLOWS','PKG-02':'03_REQUIREMENTS','PKG-03':'04_FUNCTIONAL_SPEC','PKG-04':'17_TEST_SPEC','PKG-05':'05_TASKS','PKG-06':'18_IMPLEMENTATION_INDEX','PKG-07':'19_TEST_CODE_INDEX','PKG-08':'06_ACCEPTANCE_TEST_SPEC','PKG-09':'20_OPERATIONS','PKG-10':'21_USER_MANUAL','PKG-11':'07_TRACEABILITY_MATRIX','PKG-12':'08_ACCEPTANCE_RESULTS'};
const C={navy:'#102D52',blue:'#00A6DF',orange:'#F78C1E',pale:'#EAF7FB',gray:'#3E5366',white:'#FFFFFF',line:'#D6E8EE',warn:'#FFF7EA'};
function box(s,x,y,w,h,fill='none',stroke='none',width=0){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:stroke,width}})}
function text(s,t,x,y,w,h,size=21,color=C.navy,bold=false,align='left'){const a=box(s,x,y,w,h);a.text=t;a.text.style={typeface:'Yu Gothic',fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',insets:0};return a}
const notesCurrent='【2026-11-11 r19 現行状態】'+freeze.observationSummary+'\n【確認範囲】'+freeze.contentReview+'\n【入口の案内】入口が合わないアカウントでログインした場合、保護者用の入口にはご家庭専用URL・QRの案内と管理者専用の入口へのリンクを、管理者用の入口にはご家庭専用URL・QRの案内だけを表示する。未登録のアカウント、無効な個別URL、ログインの中断ではこの案内を出さない。サーバーの拒否判定と権限は変えていない。\n【実カレンダー連動】AT-24・AT-25は開発担当が検証環境の管理者画面から架空生徒で1回ずつ実施した結果で、受入の合格ではない。保護者からの予約・取消、実機、顧客確認は未確認。状態欄は変更していない。\n【顧客確認】顧客6件は本人の操作・対象版・日時・実測値がそろうまで未実施。0/6・本番HOLD。\n【過去の状態】既存のページとノートは当時の履歴として保全する。現在の状態は本注記・末尾2頁・r19正本を参照。\n【表示検査】全頁ローカル描画・再取込・配置検査を行う。native PowerPointアプリの表示は未確認。\n根拠: '+freeze.evidenceFiles.map(e=>e.path).join('; ')+'\n';
assert(!/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|https:\/\/(?:docs|script|calendar)\.google\.com|#\/parent\/[0-9a-f-]{30,}/.test(notesCurrent),'Private fact in notes');
await fs.mkdir(base,{recursive:false});
await fs.writeFile(path.join(base,'registry-snapshot.json'),regBytes);await fs.writeFile(path.join(base,'source-manifest.json'),manifestBytes);
const referenceTitle='予約後の残数を、画面で説明します';
const records=[];
for(const entry of entries){
 const source=await fs.readFile(entry.path);assert(sha(source)===entry.sha256,'Source deck changed: '+entry.path);
 const name=path.basename(entry.path).split('-2026-')[0],run=path.join(base,name);await fs.mkdir(run);
 const p=await PresentationFile.importPptx(await FileBlob.load(entry.path));assert(p.slides.items.length===entry.slides,'Source count mismatch');
 const n=entry.slides;
 const before=await p.inspect({kind:'textbox,shape,image',maxChars:1000000});
 const refs=before.records.filter(r=>r.text===referenceTitle);assert(refs.length===1,'Reference page not unique in '+name);
 const ref=refs[0].slideIndex;
 p.slides.items[ref].duplicate().moveTo(n);
 p.slides.items[ref].duplicate().moveTo(n+1);
 assert(p.slides.items.length===n+2,'Append failed');
 const inspect=await p.inspect({kind:'textbox,shape,image',maxChars:1000000});
 for(const i of [n,n+1]){
  const rows=inspect.records.filter(r=>r.slideIndex===i);
  // Keep the imported master/header/sky/title frame; clear only the copied body.
  p.delete(rows.filter(r=>r.position?.top>=216&&r.position.top<670).map(r=>r.id));
  const title=rows.find(r=>r.text===referenceTitle);assert(title,'Missing reference title '+name+' '+i);
  p.resolve(title.id).text.replace(title.text,i===n?'入口を間違えたときに、行き先を案内します':'反映した修正と、開発側の受入試験');
  let footers=0;
  for(const f of rows.filter(r=>r.position?.top>=670&&typeof r.text==='string')){
   if(f.text.includes('r18追補')){p.resolve(f.id).text.replace(f.text,`${entry.id}　2026-11-11 r19追補`);footers++}
   else if(/\d+ \/ \d+/.test(f.text)){p.resolve(f.id).text.replace(f.text,`${i+1} / ${n+2}　2026年11月11日`);footers++}
  }
  assert(footers===2,'Footer fields not found '+name+' '+i);
 }
 {
  const s=p.slides.items[n];
  text(s,'「この入口ではログインできません」の下に、次の案内を表示します',70,228,1140,40,24,C.navy,true);
  text(s,'ログインした入口と、登録されている役割が合わなかった場合',70,275,1140,30,20,C.gray);
  const blocks=[['保護者用の入口','ご家庭専用URL・QRの案内','管理者専用の入口へのリンクも表示'],['管理者用の入口','ご家庭専用URL・QRの案内','家庭別URLへのリンクは出さない'],['未登録・無効なURL・中断','案内は出さない','それぞれのエラー表示だけを出す']];
  blocks.forEach((b,i)=>{const x=70+i*390;box(s,x,326,360,210,C.pale,C.blue,1.5);text(s,b[0],x+16,343,328,34,22,C.navy,true,'center');text(s,b[1],x+16,394,328,58,24,i===2?C.orange:C.blue,true,'center');text(s,b[2],x+15,470,330,50,18,C.gray,false,'center')});
  text(s,'公開中の検証サイトで、保護者用の入口の表示とリンクの移動を確認しました。',70,565,1140,44,21,C.navy);
  box(s,70,623,1140,38,C.warn,C.orange,1);text(s,'サーバーの拒否判定と権限は変えていません。表示の追加だけです。',84,626,1112,31,20,C.gray);
 }
 {
  const s=p.slides.items[n+1];
  text(s,'11月10日：検証サイトへの反映と、検証環境での1回の実施結果',70,228,1140,40,24,C.navy,true);
  const rows=[['確認したこと','結果','範囲'],['入口違いの案内','公開画面で確認','保護者用の入口で表示とリンクを確認'],['AT-24 予約とカレンダー','条件に一致','予約ID・日時・場所が台帳と一致'],['AT-25 取消とカレンダー','条件に一致','台帳は取消、予定は削除、残数は不変'],['画面・契約の回帰試験',freeze.regressionSummary,'現在のソースで再実施（模擬環境）'],['顧客確認6件・残る実受入','引き続き確認','顧客0/6。AT-24〜30は継続']];
  const table=s.tables.add({rows:rows.length,columns:3,left:70,top:278,width:1140,height:300,columnWidths:[340,240,560],values:rows});
  table.cells.block({row:0,column:0,rowCount:rows.length,columnCount:3}).assign({fill:C.white,textStyle:{typeface:'Yu Gothic',fontSize:19,color:C.navy},margins:{left:14,right:10,top:4,bottom:4},anchor:'center'});table.borders.assign({style:'solid',fill:C.line,width:1});
  for(let c=0;c<3;c++){table.getCell(0,c).fill=C.pale;table.getCell(0,c).text.style={typeface:'Yu Gothic',fontSize:20,color:C.navy,bold:true};}
  text(s,'AT-24・25は開発担当が管理者画面から架空生徒で実施。保護者の操作・実機は未確認です。',70,583,1140,31,19,C.gray);
  box(s,70,623,1140,38,C.warn,C.orange,1);text(s,'受入の合格ではありません。顧客確認は0/6件、本番運用は開始していません。',84,626,1112,31,19,C.gray);
 }
 const docPath=`docs/acceptance/${docs[entry.id]}.md`,md=await fs.readFile(docPath,'utf8');
 p.slides.items[n].speakerNotes.text=notesCurrent+`\n【本冊のr19生成正本全文】${docPath}\n${md}\n`;
 p.slides.items[n+1].speakerNotes.text=notesCurrent+'\n【本頁はr19の現行追補】表の「条件に一致」は開発担当による1回の実施結果で、受入の合格を意味しない。回帰試験の件数は模擬環境での再実施件数である。';
 const candidate=path.join(run,'candidate.pptx');await(await PresentationFile.exportPptx(p)).save(candidate);await fs.mkdir(path.join(run,'final'));
 const final=path.join(run,'final',`${name}-2026-11-11-v36.pptx`);
 const v=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide',String(n+2)],requiredNativeTableOwnerSlides:[n+2],fontPolicy:{basis:'reference',families:['Yu Gothic'],referencePath:path.resolve(entry.path),referenceSha256:entry.sha256},verifyArtifactToolImport:true,receiptPath:path.join(run,'validation.json'),explicitTotalSlideCount:n+2});
 const q=await PresentationFile.importPptx(await FileBlob.load(final));await fs.mkdir(path.join(run,'roundtrip'));
 for(let i=0;i<q.slides.items.length;i++)await fs.writeFile(path.join(run,'roundtrip',`${i+1}.png`),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));
 // Render the untouched source too, with the same renderer, for a like-for-like comparison of the preserved pages.
 const o=await PresentationFile.importPptx(await FileBlob.load(entry.path));await fs.mkdir(path.join(run,'source-render'));
 for(let i=0;i<o.slides.items.length;i++)await fs.writeFile(path.join(run,'source-render',`${i+1}.png`),new Uint8Array(await(await o.export({slide:o.slides.items[i],format:'png',scale:1})).arrayBuffer()));
 records.push({id:entry.id,name,source:entry.path,sourceSha256:entry.sha256,sourceSlides:n,referenceSlide:ref+1,sourceMdPath:docPath,sourceMdSha256:sha(Buffer.from(md)),final:path.relative(root,final).replace(/\\/g,'/'),sha256:v.finalSha256,slides:n+2,validation:v.presentationLayout});
 console.log(JSON.stringify({name,slides:n+2,findings:v.presentationLayout.finding_count,warnings:v.presentationLayout.warning_count}));
}
assert(sha(await fs.readFile(regPath))===regSha,'Registry changed during authoring');
assert(sha(await fs.readFile(manifestPath))===sha(manifestBytes),'Manifest changed during authoring');
await lock();
await fs.writeFile(path.join(base,'authoring-results.json'),JSON.stringify({date:'2026-11-11',registryVersion:reg.version,registrySha256:regSha,freezeSha256:sha(freezeBytes),records,manifestUpdated:false},null,2));
console.log('COMPLETE'+records.length+'/'+records.reduce((a,r)=>a+r.slides,0));
