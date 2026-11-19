import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';

const root=process.cwd(),base=path.resolve('outputs/ppt-deploy-20261107-v31/verified');
const runtime='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1104-2876-0_26.1104.2876.0_x64__3k8sg7r9htsxt/dependencies';
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.22356/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const check=(b,m)=>{if(!b)throw Error(m);};
const evidencePath='outputs/booking-modal-release-20261107-evidence.json',eBytes=await fs.readFile(evidencePath),e=JSON.parse(eBytes);
const independent=JSON.parse(await fs.readFile('outputs/booking-modal-release-20261107-after-review.json','utf8'));
check(e.siteId==='eigo-taxi-test'&&e.deploymentStatus==='SUCCESS'&&e.status==='PASS'&&e.exitCode===0,'Release evidence not passing');
check(e.releaseId==='679ec43146aecd55'&&independent.pass&&independent.hostingVersion===e.releaseId,'Independent release review mismatch');
check(e.tests.length===4&&e.tests.every(t=>t.status==='PASS'&&t.mode==='demo'),'Public four-case evidence mismatch');
check(e.publicFiles.length===7&&e.publicFiles.every(f=>f.status===200&&f.buildSha256===f.publicSha256),'Public responses not matched');
check(e.gasDeployed===false&&e.calendarPermissionAdded===false&&e.calendarPermissionAuthorized===true&&e.productionStarted===false,'Deployment boundary changed');
const regBytes=await fs.readFile('docs/traceability/registry.json'),reg=JSON.parse(regBytes),regSha=sha(regBytes);
check(reg.facts.customerAcceptancePassed===0&&reg.facts.customerAcceptanceTotal===6&&reg.facts.thirdPartyRequiredForRelease===false,'New customer policy unavailable');
const customerPath='docs/acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md',customerDoc=await fs.readFile(customerPath,'utf8');
const manifestBytes=await fs.readFile('docs/traceability/presentations.json'),entries=JSON.parse(manifestBytes);
const cfg={
 'PKG-01':['業務フロー','01_BUSINESS_FLOWS'], 'PKG-02':['要件定義','03_REQUIREMENTS'],
 'PKG-03':['設計','04_FUNCTIONAL_SPEC'], 'PKG-04':['テスト仕様書','17_TEST_SPEC'],
 'PKG-05':['タスクリスト','05_TASKS'], 'PKG-06':['実装コード対応','18_IMPLEMENTATION_INDEX'],
 'PKG-07':['テストコード対応','19_TEST_CODE_INDEX'], 'PKG-08':['受入テスト仕様書','06_ACCEPTANCE_TEST_SPEC'],
 'PKG-09':['運用手順書','20_OPERATIONS'], 'PKG-10':['ユーザーマニュアル','21_USER_MANUAL'],
 'PKG-11':['トレーサビリティ','07_TRACEABILITY_MATRIX'], 'PKG-12':['進捗・残課題','08_ACCEPTANCE_RESULTS'],
};
await fs.mkdir(base,{recursive:false});
await fs.writeFile(path.join(base,'source-manifest.json'),manifestBytes);
await fs.writeFile(path.join(base,'registry-snapshot.json'),regBytes);
const logo=await fs.readFile('outputs/visual-deck-work/image2.jpeg'),sky=await fs.readFile('outputs/visual-deck-work/image.jpeg');
const phone=await fs.readFile('creative-library/progress-illustrations-2026-11-05/flat-phone-check.png');
const C={navy:'#102D52',blue:'#00A6DF',orange:'#F78C1E',pale:'#EAF7FB',gray:'#3E5366',white:'#FFFFFF',warn:'#FFF7EA'};
function box(s,x,y,w,h,fill='none',stroke='none',width=0){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:stroke,width}});}
function text(s,t,x,y,w,h,size=21,color=C.navy,bold=false,align='left'){const v=box(s,x,y,w,h);v.text=t;v.text.style={typeface:'Yu Gothic',fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',insets:0};return v;}
function img(s,b,x,y,w,h,alt,type='image/png',fit='contain'){s.images.add({blob:b,contentType:type,alt,fit,position:{left:x,top:y,width:w,height:h}});}
function frame(p,title,heading,id,page,total){const s=p.slides.add();s.background.fill=C.white;img(s,logo,50,13,174,55,'MightyLINK ロゴ','image/jpeg');text(s,title,265,25,820,26,18,C.gray);img(s,sky,0,80,1280,135,'空の写真','image/jpeg','cover');box(s,44,115,1192,80,C.white,C.blue,3);box(s,46,115,1188,4,C.orange);text(s,heading,70,127,1120,53,32,C.navy,true);box(s,0,701,1280,19,C.navy);text(s,`${id}-SL-${String(page).padStart(2,'0')} | 2026-11-07追補`,70,672,820,20,12,C.gray);text(s,`${page} / ${total}　2026年11月7日`,960,672,280,20,14,C.gray,false,'right');return s;}
const policy='【2026-11-07の現行方針】顧客確認は小林さん用CUST-01〜06の0/6件（全件未実施）。原AT-01〜30は開発側の技術検証として維持。旧「第三者による原30件」は廃止した運用条件であり、過去の0/30記録は履歴として保持する。Calendar権限追加は11/7にユーザーが検証用へ許可。専用検証カレンダーは作成済みだが、Google実同意・GAS更新・実Google連携受入は未了。本番未開始。';
const delivery=`【2026-11-07の公開フロント配備記録】Hosting release ${e.releaseId}。配備時刻 ${e.deployedAt}（CLI成功結果ファイルのUTC更新時刻に基づき、サーバーrelease時刻は別照会なし）、公開検証完了 ${e.verifiedAt}。公開6ファイルとルートURLの7応答がHTTP200・ビルドSHA256と一致。同じ試験スクリプトで配備前4FAIL→反映後4PASS。管理者/保護者それぞれ375×500と812×375。ボタン到達、フォーム終了、ブラウザー内予約1件・日付役割・残数不変、再読込保持、ログアウト後台帳非表示を確認。予約一覧の描画を検証したという意味ではない。Edgeの小画面/タッチ模擬による公開匿名デモ経路で、実Google認証・実台帳・Calendar・iPhone実機・顧客確認の新合格ではない。今回のフロント配備ではGAS未更新。根拠: ${e.recordPath}; ${e.resultPath}; outputs/booking-modal-release-20261107-after-review.json。配備前の当時状態を遡及変更しない。`;
const records=[];
for(const entry of entries){
 const [label,doc]=cfg[entry.id],sourceMdPath=`docs/acceptance/${doc}.md`,sourceMd=await fs.readFile(sourceMdPath,'utf8');
 const source=await fs.readFile(entry.path);check(sha(source)===entry.sha256,'Source deck changed: '+entry.id);
 const name=path.basename(entry.path).split('-2026-')[0],run=path.join(base,name);await fs.mkdir(run);
 const p=await PresentationFile.importPptx(await FileBlob.load(entry.path));check(p.slides.items.length===entry.slides,'Source slide count mismatch');
 const beforeInspect=await p.inspect({kind:'slide,textbox,shape',maxChars:1000000});await fs.writeFile(path.join(run,'before-inspect.json'),JSON.stringify(beforeInspect));
 const headers=['2026/11/6の追補は末尾・ノート参照','本日の更新は最終2頁・ノート参照','2026/11/6の現況は最終ページを参照'];
 for(let i=0;i<p.slides.items.length;i++){
  const s=p.slides.items[i],h=beforeInspect.records.find(r=>r.slideIndex===i&&headers.includes(r.text));
  if(h)p.resolve(h.id).text.replace(h.text,'旧記録／最新方針は末尾2頁');
  else text(s,'旧記録／最新方針は末尾2頁',850,18,380,30,14,C.gray,false,'right');
  const full=i===0?`\n【本冊の現行生成正本全文】${sourceMdPath}\n${sourceMd}\n【顧客確認の現行正本全文】${customerPath}\n${customerDoc}\n`:'';
  s.speakerNotes.text=policy+'\n'+delivery+'\n'+full+'\n【以下は旧ノート。当時の状態として保持】\n'+(s.speakerNotes.text||'');
 }
 const total=entry.slides+2;
 const a=frame(p,`送迎管理システム　${label}`,'検証サイトへ反映し、小画面の登録を確認',entry.id,entry.slides+1,total);
 text(a,'11月7日：反映後の公開デモで、同じ4条件を再確認',70,226,1140,40,24,C.navy,true);
 const flow=[['修正を反映','検証サイトのみ'],['公開デモで操作','管理者・保護者 × 2画面'],['結果を確認','4件 FAIL → 4件 PASS']];
 for(let i=0;i<flow.length;i++){const x=70+i*400;box(a,x,285,335,116,C.pale,C.blue,2);text(a,flow[i][0],x+15,299,305,35,26,C.navy,true,'center');text(a,flow[i][1],x+15,353,305,30,21,C.gray,false,'center');if(i<2)text(a,'→',x+347,320,47,40,32,C.orange,true,'center');}
 img(a,phone,77,432,175,135,'小画面確認の説明用イラスト');
 text(a,'公開6ファイル＋ルートURLの7応答が一致',280,433,920,38,25,C.blue,true);
 text(a,'縦にスクロールして登録。再読込・ログアウトも確認。',280,489,920,65,23,C.navy);
 text(a,'公開フロントエンドのデモ経路です。実Google・実機・顧客確認の合格とは別です。',70,579,1140,40,21,C.gray);
 box(a,70,629,1140,29,C.warn,C.orange,1);text(a,'この配備でGASは未更新。GoogleのCalendar同意は未了。本番未開始。',88,628,1100,31,18,C.navy);
 a.speakerNotes.text=`${entry.id}-SL-${String(entry.slides+1).padStart(2,'0')}\n${policy}\n${delivery}\n${JSON.stringify(e.publicFiles)}\n${JSON.stringify(e.tests)}`;
 const b=frame(p,`送迎管理システム　${label}`,'小林さんには日常操作6件をご確認いただきます',entry.id,entry.slides+2,total);
 text(b,'技術試験30件は開発側で継続',70,224,760,40,25,C.navy,true);text(b,'顧客確認 0 / 6　未実施',840,224,370,40,24,C.blue,true,'right');
 const cards=[['CUST-01　本人ログイン','自分の家庭だけ／残数5枚'],['CUST-02　1回分を予約','カレンダーと一致／残数5枚'],['CUST-03　予約を取消','両画面から消える／残数5枚'],['CUST-04　完了を登録','片道 5→4／往復 4→2'],['CUST-05　残少・追加','連絡案内を確認／10枚追加で12枚'],['CUST-06　ログアウト','保護者・管理者とも台帳が非表示']];
 for(let i=0;i<cards.length;i++){const x=70+(i%3)*385,y=283+Math.floor(i/3)*132;box(b,x,y,350,113,C.pale,C.blue,1.5);text(b,cards[i][0],x+15,y+10,320,31,22,C.navy,true);text(b,cards[i][1],x+15,y+51,320,49,20,C.gray);}
 text(b,'架空データを開発側が準備。実際の送迎・支払いは発生しません。',70,565,1140,36,22,C.navy);
 box(b,70,622,1140,36,C.warn,C.orange,1);text(b,'旧「第三者30件」は現在の完了条件から外しました。過去の実績は履歴として保持します。',88,621,1100,38,19,C.navy);
 b.speakerNotes.text=`${entry.id}-SL-${String(entry.slides+2).padStart(2,'0')}\n${policy}\n${customerPath}\n${customerDoc}\n${delivery}`;
 const candidate=path.join(run,'candidate.pptx');await (await PresentationFile.exportPptx(p)).save(candidate);await fs.mkdir(path.join(run,'final'));
 const final=path.join(run,'final',`${name}-2026-11-07-v31.pptx`);
 const validation=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],fontPolicy:{basis:'reference',families:['Yu Gothic'],referencePath:path.resolve(entry.path),referenceSha256:entry.sha256},verifyArtifactToolImport:true,receiptPath:path.join(run,'validation.json'),explicitTotalSlideCount:total});
 const roundtrip=await PresentationFile.importPptx(await FileBlob.load(final));const renders=path.join(run,'roundtrip');await fs.mkdir(renders);
 for(let i=0;i<roundtrip.slides.items.length;i++)await fs.writeFile(path.join(renders,`${i+1}.png`),new Uint8Array(await(await roundtrip.export({slide:roundtrip.slides.items[i],format:'png',scale:1})).arrayBuffer()));
 await fs.writeFile(path.join(run,'after-inspect.json'),JSON.stringify(await roundtrip.inspect({kind:'slide,textbox,shape',maxChars:1000000})));
 records.push({id:entry.id,name,label,source:entry.path,sourceSha256:entry.sha256,sourceSlides:entry.slides,sourceMdPath,sourceMdSha256:sha(Buffer.from(sourceMd)),final,sha256:validation.finalSha256,slides:total,validation:validation.presentationLayout});
 console.log(JSON.stringify({name,slides:total,findings:validation.presentationLayout.finding_count,warnings:validation.presentationLayout.warning_count}));
}
await fs.writeFile(path.join(base,'authoring-results.json'),JSON.stringify({date:'2026-11-07',registrySha256:regSha,registryVersion:reg.version,evidencePath,evidenceSha256:sha(eBytes),records,manifestUpdated:false},null,2));
console.log('COMPLETE '+records.length+' decks / '+records.reduce((n,r)=>n+r.slides,0)+' slides');
