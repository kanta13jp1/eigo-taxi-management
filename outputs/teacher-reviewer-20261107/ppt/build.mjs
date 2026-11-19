import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd();
const out=path.resolve('outputs/teacher-reviewer-20261107/ppt');
const dest=path.resolve('docs/deliverables/2026-11-07-teacher-review');
const runtime='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1104-2876-0_26.1104.2876.0_x64__3k8sg7r9htsxt/dependencies';
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.22356/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const assert=(x,m)=>{if(!x)throw Error(m)};
const regPath='docs/traceability/registry.json',manifestPath='docs/traceability/presentations.json';
const regBytes=await fs.readFile(regPath),manifestBytes=await fs.readFile(manifestPath),reg=JSON.parse(regBytes);
assert(reg.version==='2026-11-07-r17','Authoritative r17 changed; teacher supplement must stay separate');
const factPath='outputs/teacher-reviewer-20261107/registration-result.json';
const factBytes=await fs.readFile(factPath),facts=JSON.parse(factBytes);
// The root agent verifies the final facts object before invoking this builder.
assert(process.argv.includes('--facts-reviewed'),'Root-reviewed registration evidence required');
assert(facts.status==='PREPARED_FIRST_LOGIN_PENDING' && facts.teacher.role==='reviewer' && facts.teacher.active && facts.teacher.studentName==='先生確認用・架空生徒' && facts.teacher.initialBalance===5 && facts.teacher.initialRides===0 && facts.teacher.actualBothPortalLogin==='NOT_RUN' && facts.teacher.googleIdentityVerified===false,'Registration facts mismatch');
assert(Object.values(facts.checks).every(Boolean) && facts.customerAcceptancePassed===0 && facts.customerAcceptanceTotal===6 && facts.productionStarted===false,'Preservation or release boundary mismatch');
assert(facts.changes.createdRides===0 && facts.changes.completedRides===0 && facts.changes.ticketPurchases===0 && facts.changes.messagesSent===0 && facts.changes.calendarSharingChanges===0,'Trial actions or notifications already performed');
const sourcePath='docs/deliverables/2026-10-23-traceability/user-2026-11-07-v33.pptx';
const sourceBytes=await fs.readFile(sourcePath),sourceSha=sha(sourceBytes);
const entry=JSON.parse(manifestBytes).find(x=>x.id==='PKG-10');
assert(entry.path===sourcePath&&entry.sha256===sourceSha&&entry.registryVersion===reg.version,'Reference manifest mismatch');
const p=await PresentationFile.importPptx(await FileBlob.load(sourcePath));
assert(p.slides.items.length===12,'Reference count mismatch');
p.slides.keep([10]);
for(let i=0;i<3;i++)p.slides.items[0].duplicate().moveTo(i+1);
assert(p.slides.items.length===4,'Supplement must have four slides');
const C={navy:'#102D52',blue:'#00A6DF',orange:'#F78C1E',pale:'#EAF7FB',gray:'#3E5366',white:'#FFFFFF',line:'#D6E8EE',warn:'#FFF7EA'};
function box(s,x,y,w,h,fill='none',stroke='none',width=0){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:stroke,width}})}
function text(s,t,x,y,w,h,size=21,color=C.navy,bold=false,align='left'){const a=box(s,x,y,w,h);a.text=t;a.text.style={typeface:'Yu Gothic',fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',insets:0};return a}
async function ill(s,name,x,y,w,h,alt){const b=await fs.readFile('creative-library/progress-illustrations-2026-11-05/'+name);s.images.add({blob:b,contentType:'image/png',alt,fit:'contain',position:{left:x,top:y,width:w,height:h}});text(s,'説明用イメージ',x,y+h+3,w,20,12,C.gray,false,'right')}
async function records(n){return (await p.inspect({kind:'textbox,shape,image',maxChars:1000000})).records.filter(r=>r.slideIndex===n)}
async function replace(n,oldText,newText){const a=(await records(n)).find(r=>r.text===oldText);assert(a,'Missing anchor '+oldText);p.resolve(a.id).text.replace(oldText,newText)}
async function clearBody(n){const all=await records(n);p.delete(all.filter(r=>r.position?.top>=216&&r.position.top<670).map(r=>r.id))}
const titles=['先生のテスト用アカウント','ログインと画面の切り替え','予約と取消の操作例（任意）','完了とチケット追加の操作例（任意）'];
const notesBase='先生向けの任意の使い勝手確認用ガイド。小林さんの顧客確認とは別の補足資料で、顧客確認0/6と本番HOLDは変更しない。先生のGoogle本人ログインと本人操作はNOT_RUN。検証専用の保存role reviewerにより、固定した家庭用と管理者用の画面で、先生専用の架空生徒1名だけを扱う。Google認証は本人が行う。通知・案内送信・Calendar共有・本番操作は行っていない。個人メール、家庭の個別URL、Calendar ID、認証情報を本資料には収録しない。実際の送迎・支払い・請求は発生しない。\n';
for(let i=0;i<4;i++){
 await replace(i,'送迎管理システム　ユーザーマニュアル','送迎管理システム　先生向けテストガイド');
 await replace(i,'同じGoogleで2つの検証画面を使えます',titles[i]);
 await replace(i,'PKG-10-SL-11 | 2026-11-07 r17追補','TEACHER-REVIEW　2026-11-07補足　正本r17とは別冊');
 await replace(i,'11 / 12　2026年11月7日',`${i+1} / 4　2026年11月7日`);
 p.slides.items[i].speakerNotes.text=notesBase+'根拠: '+factPath+'（登録保存・再取得の実記録）; docs/traceability/registry.json（2026-11-07-r17、変更なし）; docs/traceability/presentation-theme.json（mighty-hp-v1）; '+sourcePath+'（共通デザインと既存構造）。\n';
 if(i>0)await clearBody(i);
}
// Reuse the actual source overview diagram and illustration in place.
await replace(0,'検証専用アカウントで、指定した架空生徒1名だけを操作','同じGoogleで、保護者用と先生用の両画面を確認できます');
await replace(0,'本人がログイン','案内文のアカウント');
await replace(0,'2つの固定URL','2つのURL');
await replace(0,'家庭用・管理者用','保護者用・先生用');
await replace(0,'架空生徒1名だけ','専用の架空生徒');
await replace(0,'通常の生徒には触れません','先生確認用・架空生徒');
await replace(0,'開始前の準備後は、開発者の役割切替は不要','実際の送迎・請求は発生しません');
await replace(0,'通常の管理者・保護者の権限を維持。\n検証専用の登録で分けます。','対象は「先生確認用・架空生徒」1名です。\n別の生徒が見えたら、操作を止めてご連絡ください。');
await replace(0,'検証用管理者は、アカウント管理・教室設定・新規生徒登録を使えません。','この検証用登録では、アカウント管理・教室設定・新規生徒登録は利用できません。');
await replace(0,'検証サイトへ反映・公開7応答一致。固定2予約・開始5枚を実サイトで確認。本人の初回ログイン待ち。','検証用登録の保存・再取得を確認。先生のGoogleログインは未実施（NOT_RUN）。');
p.slides.items[0].speakerNotes.text+='登録時の専用生徒は残数5枚、初期予約0件。先生本人のGoogleログインを確認したという意味ではない。表示名 Brenda先生（検証用）、有効なreviewer、割当は先生確認用・架空生徒1名。';
// Three core steps plus the end-of-session check.
{
const s=p.slides.items[1];
text(s,'基本は「ログイン・生徒確認・画面切り替え」の3つです',70,226,1140,40,24,C.navy,true);
const rows=[['1　保護者用リンク','案内文の個別URLを開き、「Googleでログイン」を選びます。'],['2　生徒と残数の確認','案内文と同じGoogleを選びます。\n「先生確認用・架空生徒」と残数を確認します。'],['3　先生用へ切り替え','いったんログアウトし、先生用URLを開きます。\n同じGoogleで入り、同じ架空生徒1名を確認します。']];
rows.forEach((r,i)=>{const y=285+i*96;text(s,r[0],70,y,800,31,23,C.navy,true);text(s,r[1],105,y+36,795,53,21,C.gray)});
await ill(s,'login-lock-flat.png',925,310,280,198,'先生本人によるGoogleログインの説明用イラスト');
text(s,'終了・中断するとき',70,585,280,31,23,C.blue,true);
text(s,'両画面でログアウトし、再読込後に台帳が非表示になることを確認します。',70,621,1140,35,21,C.navy);
s.speakerNotes.text+='初回ログインは本人が実施する。各画面の固定URLは別途の案内文を使う。開発者による操作中のrole切替は不要。基本3手順だけでもよく、次の任意操作を強制しない。説明用イラスト: creative-library/progress-illustrations-2026-11-05/login-lock-flat.png。生成された架空画像。';
}
// Optional examples are deliberately separate from the core login/switch trial.
{
const s=p.slides.items[2];
text(s,'試す場合だけ、先生専用の架空生徒と架空の乗車場所を使います',70,226,1140,40,24,C.navy,true);
const rows=[['1　取消用を1件予約','繰返しなしの1回分を登録します。\n日時・場所を確認し、残数が変わらないか見ます。'],['2　その予約を取消','同じ日時の予約を取り消します。\n一覧から消え、残数が変わらないか確認します。'],['3　完了を試す場合','新しく片道1件と往復1件を予約し、日時をメモします。\n次のページで、この2件だけを完了します。']];
rows.forEach((r,i)=>{const y=285+i*98;text(s,r[0],70,y,825,31,23,C.navy,true);text(s,r[1],105,y+36,795,56,21,C.gray)});
await ill(s,'calendar-checklist-flat.png',950,307,255,210,'予約とチェックリストの説明用イラスト');
text(s,'先生用データの開始時は5枚・予約0件です。小林さん用の生徒・予約は操作しません。',70,610,1140,48,21,C.navy);
s.speakerNotes.text+='任意の操作例。先生の初期予約0件から、自分で新規作成した予約だけを使う。既存の小林さんのCUST完了用予約や共有記録は再利用しない。予約・取消時点ではチケットを消費せず、完了時に片道1枚・往復2枚を消費する仕様。説明用イラスト: creative-library/progress-illustrations-2026-11-05/calendar-checklist-flat.png。生成された架空画像。';
}
{
const s=p.slides.items[3];
text(s,'最初の5枚から下の順で試した場合の目安です。好きな操作だけでも構いません',70,224,1140,55,23,C.navy,true);
const t=s.tables.add({rows:5,columns:3,left:70,top:292,width:1140,height:294,columnWidths:[650,180,310],values:[['先生用画面での操作','変化','残数の目安'],['開始時','なし','5枚'],['片道1件を「完了」','1枚消費','4枚'],['往復1件を「完了」','2枚消費','2枚'],['10枚追加（受取金額0円）','10枚追加','12枚']]});
t.cells.block({row:0,column:0,rowCount:5,columnCount:3}).assign({fill:C.white,textStyle:{typeface:'Yu Gothic',fontSize:23,color:C.navy},margins:{left:16,right:12,top:6,bottom:6},anchor:'center'});
t.borders.assign({style:'solid',fill:C.line,width:1});
for(let j=0;j<3;j++){t.getCell(0,j).fill=C.pale;t.getCell(0,j).text.style={typeface:'Yu Gothic',fontSize:23,color:C.navy,bold:true};}
for(let r=1;r<5;r++)t.getCell(r,2).text.style={typeface:'Yu Gothic',fontSize:25,color:C.blue,bold:true};
text(s,'完了・追加は1回ずつ。操作後の実際の残数と予約日時をメモします。',70,603,1140,31,21,C.navy);
text(s,'中断後は未実施の操作だけ再開します。値が違うときは、再送せずご連絡ください。',70,638,1140,29,20,C.gray);
s.speakerNotes.text+='これは本人がこの順番を選んだ場合だけの任意例で、実測結果・強制手順・顧客確認の合格条件ではない。完成用の予約は本人が自分の専用生徒で新規作成する。送迎スケジュール一覧で日時と生徒を特定し、片道・往復それぞれ未完了の予約1件だけを完了する。最初5枚、片道1枚消費後4枚、往復2枚消費後2枚、10枚追加後12枚という計算。予約・取消は消費0枚。追加は受取金額0円とし、実支払いは行わない。終了時は両画面でログアウト後の非表示を確認する。既に完了または追加した操作を繰り返さない。';
}
// Validate the visible and notes text before producing a candidate.
const inspect=await p.inspect({kind:'textbox,table,notes',maxChars:1000000});
const textDump=JSON.stringify(inspect);
assert(!/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|#\/parent\/[0-9a-f-]{30,}|STU-CUST-|CUST-04 完了用/.test(textDump),'Private or customer fixture data leaked');
await fs.writeFile(path.join(out,'final-inspect.json'),JSON.stringify(inspect,null,2));
await fs.mkdir(path.join(out,'render-draft'),{recursive:true});
for(let i=0;i<4;i++)await fs.writeFile(path.join(out,'render-draft',`${i+1}.png`),new Uint8Array(await(await p.export({slide:p.slides.items[i],format:'png',scale:1})).arrayBuffer()));
const candidate=path.join(out,'candidate.pptx');await(await PresentationFile.exportPptx(p)).save(candidate);
await fs.mkdir(path.join(out,'final'),{recursive:true});
const final=path.join(out,'final','teacher-review-guide-2026-11-07-v1.pptx');
const v=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide','4'],requiredNativeTableOwnerSlides:[4],fontPolicy:{basis:'reference',families:['Yu Gothic'],referencePath:path.resolve(sourcePath),referenceSha256:sourceSha},verifyArtifactToolImport:true,receiptPath:path.join(out,'validation.json'),explicitTotalSlideCount:4});
const roundtrip=await PresentationFile.importPptx(await FileBlob.load(final));
await fs.mkdir(path.join(out,'roundtrip'),{recursive:true});
for(let i=0;i<4;i++)await fs.writeFile(path.join(out,'roundtrip',`${i+1}.png`),new Uint8Array(await(await roundtrip.export({slide:roundtrip.slides.items[i],format:'png',scale:1})).arrayBuffer()));
assert(sha(await fs.readFile(regPath))===sha(regBytes),'Registry changed during authoring');
assert(sha(await fs.readFile(manifestPath))===sha(manifestBytes),'Main presentation manifest changed during authoring');
assert(sha(await fs.readFile(sourcePath))===sourceSha,'Source deck changed during authoring');
await fs.mkdir(dest,{recursive:true});const delivered=path.join(dest,path.basename(final));await fs.copyFile(final,delivered);
await fs.writeFile(path.join(out,'authoring-result.json'),JSON.stringify({supplement:'teacher-usability-trial',date:'2026-11-07',slides:4,themeId:'mighty-hp-v1',authoritativeRegistry:'2026-11-07-r17',registrySha256:sha(regBytes),manifestSha256:sha(manifestBytes),sourcePath,sourceSha256:sourceSha,registrationEvidence:factPath,registrationEvidenceSha256:sha(factBytes),factsReviewed:true,teacherGoogleLogin:'NOT_RUN',customerAcceptance:'UNCHANGED_0_OF_6',productionStarted:false,existingTwelvePptModified:false,mainManifestModified:false,final:delivered,sha256:sha(await fs.readFile(delivered)),validationReceipt:path.join(out,'validation.json'),visualReview:'PENDING',nativePowerPointReview:'NOT_RUN'},null,2));
console.log(JSON.stringify({delivered,slides:4,layout:v.presentationLayout},null,2));

