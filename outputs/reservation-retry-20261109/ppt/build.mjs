import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';

const root=process.cwd();
const out=path.resolve('outputs/reservation-retry-20261109/ppt');
const dest=path.resolve('docs/deliverables/2026-11-09-reservation-retry');
const runtime='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1104-2876-0_26.1104.2876.0_x64__3k8sg7r9htsxt/dependencies';
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.22356/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const assert=(x,m)=>{if(!x)throw Error(m)};
const adopted=process.argv.includes('--adopt');
const regPath='docs/traceability/registry.json',manifestPath='docs/traceability/presentations.json';
const regBytes=await fs.readFile(regPath),manifestBytes=await fs.readFile(manifestPath),reg=JSON.parse(regBytes);
assert(reg.version==='2026-11-07-r17','Registry changed; this supplement must be reviewed against the new basis');
const factPath='outputs/reservation-retry-20261109/ppt/facts.json';
const factBytes=await fs.readFile(factPath),facts=JSON.parse(factBytes);
assert(facts.productionStarted===false&&facts.customerFixtureMutations===0,'Release or preservation boundary mismatch');
assert(facts.causalityOfNovember7Incident==='UNKNOWN','November 7 incident has no confirmed causal link');
assert(facts.customer.total===6,'Customer acceptance total mismatch');
const blocked=facts.stage==='LOCAL_REVIEWED_DEPLOY_BLOCKED';
if(adopted){
 assert(facts.independentReview==='PASS'&&facts.customer.readbackAt,'Independent review and current customer readback required');
 assert(blocked ? facts.deployment.status==='BLOCKED_REAUTH'&&facts.publicUi.status==='NOT_RUN' : facts.deployment.status==='VERIFIED'&&facts.publicUi.status==='PASS','Final status must distinguish blocked work from a verified release');
}
const sourcePath='docs/deliverables/2026-10-23-traceability/user-2026-11-07-v33.pptx';
const sourceBytes=await fs.readFile(sourcePath),sourceSha=sha(sourceBytes);
const sourceEntry=JSON.parse(manifestBytes).find(x=>x.id==='PKG-10');
assert(sourceEntry.path===sourcePath&&sourceEntry.sha256===sourceSha,'Reference manifest mismatch');
const p=await PresentationFile.importPptx(await FileBlob.load(sourcePath));
p.slides.keep([10]);
for(let i=0;i<3;i++)p.slides.items[0].duplicate().moveTo(i+1);
const C={navy:'#102D52',blue:'#00A6DF',orange:'#F78C1E',pale:'#EAF7FB',gray:'#3E5366',white:'#FFFFFF',line:'#D6E8EE',warn:'#FFF7EA'};
function box(s,x,y,w,h,fill='none',stroke='none',width=0){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:stroke,width}})}
function text(s,t,x,y,w,h,size=21,color=C.navy,bold=false,align='left'){const a=box(s,x,y,w,h);a.text=t;a.text.style={typeface:'Yu Gothic',fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',insets:0};return a}
function arrow(s,x,y,w=50){text(s,'→',x,y,w,40,31,C.orange,true,'center')}
async function records(n){return(await p.inspect({kind:'textbox,shape,image,table',maxChars:1000000})).records.filter(r=>r.slideIndex===n)}
async function replace(n,oldText,newText){const a=(await records(n)).find(r=>r.text===oldText);assert(a,'Missing template anchor '+oldText);p.resolve(a.id).text.replace(oldText,newText)}
async function clearBody(n){p.delete((await records(n)).filter(r=>r.position?.top>=216&&r.position.top<670).map(r=>r.id))}
async function ill(s,name,x,y,w,h,alt){const b=await fs.readFile('creative-library/progress-illustrations-2026-11-05/'+name);s.images.add({blob:b,contentType:'image/png',alt,fit:'contain',position:{left:x,top:y,width:w,height:h}});text(s,'説明用イメージ',x,y+h+4,w,20,12,C.gray,false,'right')}
function card(s,title,detail,x,y,w,h){box(s,x,y,w,h,C.pale,C.blue,1.2);text(s,title,x+16,y+12,w-32,40,26,C.navy,true,'center');text(s,detail,x+20,y+64,w-40,h-76,22,C.gray,false,'center')}
function warning(s,t){box(s,70,623,1140,36,C.warn,C.orange,1);text(s,t,86,626,1108,29,18,C.navy)}
function table(s,values,x,y,w,h,widths){const t=s.tables.add({rows:values.length,columns:values[0].length,left:x,top:y,width:w,height:h,columnWidths:widths,values});t.cells.block({row:0,column:0,rowCount:values.length,columnCount:values[0].length}).assign({fill:C.white,textStyle:{typeface:'Yu Gothic',fontSize:21,color:C.navy},margins:{left:15,right:12,top:6,bottom:6},anchor:'center'});t.borders.assign({style:'solid',fill:C.line,width:1});for(let j=0;j<values[0].length;j++){t.getCell(0,j).fill=C.pale;t.getCell(0,j).text.style={typeface:'Yu Gothic',fontSize:22,color:C.navy,bold:true}}return t}
const titles=['応答が不完全でも、予約を重ねない','結果が分からないときの確認手順','試験と公開画面の結果を分けて確認','お客様の確認用データを保ちながら進めます'];
const noteBase='2026年11月9日の予約再送修正の補足資料。既存12冊の仕様正本r17・v33を置き換えず、当日の修正と検証結果を説明する別冊。今回の開発試験では小林さん用・先生用の固定データを操作しない。本番運用を開始しない。通信が不完全な場合の再送制御は模擬試験で確認し、公開画面での通常操作の確認と区別する。2026-11-07のGAS v5で起きた事象との因果関係は未確定。\n';
for(let i=0;i<4;i++){
 await replace(i,'送迎管理システム　ユーザーマニュアル','送迎管理システム　開発進捗の補足');
 await replace(i,'同じGoogleで2つの検証画面を使えます',titles[i]);
 await replace(i,'PKG-10-SL-11 | 2026-11-07 r17追補','予約再送の修正　2026-11-09補足　正本r17とは別冊');
 await replace(i,'11 / 12　2026年11月7日',`${i+1} / 4　2026年11月9日`);
 await clearBody(i);
 p.slides.items[i].speakerNotes.text=noteBase+'根拠: '+factPath+'; outputs/reservation-retry-20261109/api-before-duplicate.log; ui-before.log; frontend-contract.json; ui-after.log; gas-after.log; src/services/api.ts; src/App.tsx。共通デザイン: '+sourcePath+'、docs/traceability/presentation-theme.json。\n';
}
{
const s=p.slides.items[0];
text(s,'登録結果が返らない場合の、同じ内容の再操作を改善しました',70,231,1140,45,25,C.navy,true);
text(s,'修正前',70,298,180,35,25,C.orange,true);
card(s,'予約を送信','予約そのものは\n登録済み',235,292,275,145);arrow(s,521,343);
card(s,'結果が不完全','もう一度送ると\n別の予約になることがある',580,292,630,145);
text(s,'修正後',70,475,180,35,25,C.blue,true);
card(s,'同じ受付番号','同じタブ・同じ内容の\n再操作に使う',235,469,275,140);arrow(s,521,516);
card(s,'同じ予約1件に集約','結果を照合してから確定\n一覧も予約番号ごとに更新',580,469,630,140);
warning(s,'再現と修正の検証は架空応答を使った模擬試験です。実Google連携の全受入とは別に管理します。');
s.speakerNotes.text+='修正前の試験では不完全な成功応答後の同一内容2回送信に対し異なる予約IDを2件生成した。修正後は予約ID・生徒・日付・時刻・区分・予約者・場所・備考・状態を照合するまで同じタブの再送用IDを保持する。同じ予約IDは一覧上1件に集約し、既に完了・取消で読み戻した状態を遅延した予約中応答で上書きしない。新規IDの正常な予約を妨げない。';
}
{
const s=p.slides.items[1];
text(s,'エラーの後は、まず登録済みの予約と残数を確認します',70,231,1140,45,25,C.navy,true);
await ill(s,'calendar-checklist-flat.png',80,310,270,230,'予定と確認表を表す説明用の架空イラスト');
const rows=[['1　同じタブを開いたまま','画面の案内を読み、結果が分からない操作を控えます。'],['2　一覧を読み直す','同じ日時・場所の予約があるか確認します。'],['3　同じ内容を再操作する場合','同じタブなら、システムが同じ受付番号を使います。']];
rows.forEach((r,i)=>{const y=298+i*96;text(s,r[0],405,y,790,36,25,C.navy,true);text(s,r[1],438,y+40,755,47,21,C.gray)});
warning(s,'別のタブや別の内容への変更は、同じ再送用IDの対象になりません。迷うときは表示と時刻を記録します。');
s.speakerNotes.text+='利用者向けの説明。sessionStorageは同じタブ内に限定され、タブを閉じた後や別タブの重複防止を保証しない。先に画面・一覧を確認する。完了やチケット追加を繰り返す案内ではなく、新規予約の不完全な応答に対する同一内容の再送を扱う。イラスト: creative-library/progress-illustrations-2026-11-05/calendar-checklist-flat.png、生成された説明用架空画像。';
}
{
const s=p.slides.items[2];
text(s,blocked?'試験とレビューは完了。修正版は検証サイトへ未反映です':adopted?'検証サイトへ反映し、公開画面を確認しました':'ローカル試験は完了。公開画面の確認はこれからです',70,231,1140,45,25,C.navy,true);
const f=facts.localTests;
table(s,[['確認範囲','結果','確認したこと'],['画面側の模擬試験',`${f.frontendPassed} / ${f.frontendTotal} 件`, '不完全な応答・再送・権限の制限'],['一覧更新などの確認','3項目成功','同じ予約は1行、完了・取消の状態を保持'],['サーバーの模擬試験',`${f.gasPassed} / ${f.gasTotal} 件`,'既存のサーバー処理の回帰確認'],['反映後の公開画面',facts.publicUi.status==='PASS'?'確認済み':'未実施',facts.publicUi.summary]],70,294,1140,285,[305,270,565]);
const d=facts.deployment;
text(s,d.hostingVersion?`検証版 ${d.hostingVersion}　公開照合 ${d.matchedResponses} / ${d.expectedResponses} 応答一致`:blocked?'Firebaseの再認証待ち。公開中の旧版は変更していません。':'検証版：未配備　公開ファイルの照合：未実施',70,591,1140,29,19,C.gray);
warning(s,'公開デモの操作確認、実Google連携、実機、顧客6件は区別します。今回だけで受入全体を合格にしません。');
s.speakerNotes.text+='対象版と公開証跡: '+JSON.stringify(facts.deployment)+'\n公開画面: '+JSON.stringify(facts.publicUi)+'\nローカル試験: '+JSON.stringify(facts.localTests)+'\n独立レビュー: '+facts.independentReview+'。公開画面で意図的な通信不良を再現したと記載しない。修正前後の不完全応答分岐はNode模擬試験の記録を根拠とする。';
}
{
const s=p.slides.items[3];
text(s,'開発側の改善と、お客様ご本人の確認を並行して進めます',70,231,1140,45,25,C.navy,true);
const y=305,w=340,h=190;
card(s,'顧客確認6件',`${facts.customer.passed} / ${facts.customer.total} 件合格\nご本人の実操作を待つ`,70,y,w,h);
card(s,'実Google連携','予約・取消・残数など\n残る受入範囲を確認',470,y,w,h);
card(s,'バックアップ','複数シートの数式参照や\n保護設定を含めて確認',870,y,w,h);
text(s,'次の開発作業',70,530,280,35,25,C.blue,true);
text(s,facts.nextTask,360,525,850,58,24,C.navy,true);
text(s,'小林さん用・先生用の生徒、残数、固定予約を開発試験には使いません。',70,585,1140,32,21,C.gray);
warning(s,'本番運用は未開始です。本人操作・対象版・日時・実測値がそろうまで顧客確認を合格にしません。');
s.speakerNotes.text+='顧客確認の読戻し日時: '+facts.customer.readbackAt+'。この資料では顧客のメール・個別URL・学生ID・Calendar ID・アクセス情報を記載しない。小林さんと先生の実操作結果を開発模擬試験やAIレビューで代替しない。旧第三者30件は履歴、原AT-01〜30は開発側の技術検証として継続。本番の開始判断と教室所有の運用用Googleアカウントなど残る条件は継続管理する。';
}
const inspected=await p.inspect({kind:'textbox,table,notes',maxChars:1000000});
assert(!/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|#\/parent\/[0-9a-f-]{30,}|STU-CUST-|CUST-04 完了用/.test(JSON.stringify(inspected)),'Private or customer fixture data leaked');
const version=process.env.PPT_REVISION||'v1';
const runName=(adopted?'final-candidate':'draft')+'-'+version;
const run=path.join(out,runName);await fs.mkdir(run,{recursive:true});
await fs.writeFile(path.join(run,'inspect.json'),JSON.stringify(inspected,null,2));
for(let i=0;i<4;i++)await fs.writeFile(path.join(run,`${i+1}.png`),new Uint8Array(await(await p.export({slide:p.slides.items[i],format:'png',scale:1})).arrayBuffer()));
const candidate=path.join(run,'candidate.pptx');await(await PresentationFile.exportPptx(p)).save(candidate);
const filename=`progress-retry-2026-11-09-${version}${blocked?'-blocked':''}${adopted?'':'-draft'}.pptx`;
const final=path.join(run,'final',filename);await fs.mkdir(path.dirname(final),{recursive:true});
const validation=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide','3'],requiredNativeTableOwnerSlides:[3],fontPolicy:{basis:'reference',families:['Yu Gothic'],referencePath:path.resolve(sourcePath),referenceSha256:sourceSha},verifyArtifactToolImport:true,receiptPath:path.join(run,'validation.json'),explicitTotalSlideCount:4});
const roundtrip=await PresentationFile.importPptx(await FileBlob.load(final));
for(let i=0;i<4;i++)await fs.writeFile(path.join(run,`roundtrip-${i+1}.png`),new Uint8Array(await(await roundtrip.export({slide:roundtrip.slides.items[i],format:'png',scale:1})).arrayBuffer()));
assert(sha(await fs.readFile(regPath))===sha(regBytes),'Registry changed during authoring');
assert(sha(await fs.readFile(manifestPath))===sha(manifestBytes),'Main presentation manifest changed during authoring');
assert(sha(await fs.readFile(sourcePath))===sourceSha,'Reference deck changed during authoring');
let delivered=null;
if(adopted){await fs.mkdir(dest,{recursive:true});delivered=path.join(dest,filename);await fs.copyFile(final,delivered)}
await fs.writeFile(path.join(run,'authoring-result.json'),JSON.stringify({stage:adopted?(blocked?'BLOCKER_NOTICE_PENDING_VISUAL_REVIEW':'FINAL_PENDING_VISUAL_REVIEW'):'DRAFT_NOT_FOR_DISTRIBUTION',slides:4,themeId:'mighty-hp-v1',sourcePath,sourceSha256:sourceSha,registryVersion:reg.version,registrySha256:sha(regBytes),mainManifestSha256:sha(manifestBytes),mainManifestModified:false,existingTwelvePptModified:false,factPath,factsSha256:sha(factBytes),final,delivered,sha256:sha(await fs.readFile(final)),layoutValidation:validation.presentationLayout,visualReview:'PENDING',nativePowerPointReview:'NOT_RUN'},null,2));
console.log(JSON.stringify({stage:adopted?'FINAL_PENDING_VISUAL_REVIEW':'DRAFT_NOT_FOR_DISTRIBUTION',final,delivered,slides:4},null,2));
