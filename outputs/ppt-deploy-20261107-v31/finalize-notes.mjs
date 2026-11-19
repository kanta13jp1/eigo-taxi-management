// Run only after root confirms the final registry/generated documents are ready.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),base=path.resolve('outputs/ppt-deploy-20261107-v31'),source=JSON.parse(await fs.readFile(path.join(base,'verified/authoring-results.json'),'utf8'));
const regBytes=await fs.readFile('docs/traceability/registry.json'),reg=JSON.parse(regBytes),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
if(process.argv[2]!==sha(regBytes))throw Error('Explicit final registry hash confirmation required');
const runtime='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1104-2876-0_26.1104.2876.0_x64__3k8sg7r9htsxt/dependencies',skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.22356/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const dest=path.join(base,'finalized');await fs.mkdir(dest,{recursive:false});await fs.writeFile(path.join(dest,'registry-snapshot.json'),regBytes);
const policy='【2026-11-07 現行方針】顧客確認は小林さん用CUST-01〜06の0/6件（全件未実施）。原AT-01〜30は開発側の技術検証として維持。旧「第三者による原30件」は廃止した運用条件であり、過去の0/30記録は履歴として保持。Calendar権限追加は11/7にユーザーが検証用へ許可。専用検証カレンダーは作成済みだが、GASコードは検証プロジェクトの編集headへ保存済みだが、Google実同意・Webアプリ配備・実Google連携受入は未了。本番未開始。';
const delivery='【2026-11-07 公開フロント配備】Hosting version=679ec43146aecd55、公開build-manifest releaseId=b7e510688a6e8126、sourceDigest=b7e510688a6e81268331db6d7d88db8875bf5ce443dbc90f52b4f647f39d1979。ビルドは11/6、反映と公開検証は11/7（16:01 JST完了）。公開6ファイル＋ルートURLの7応答がHTTP200・ビルドSHA256と一致。同じrunnerで管理者/保護者×375×500/812×375の4FAIL→4PASS。ボタン到達、フォーム終了、ブラウザー内の予約1件・日付役割・残数不変、再読込保持、ログアウト後台帳非表示を確認。予約一覧の描画を検証したという意味ではない。Edgeの小画面タッチ模擬の公開匿名デモ経路であり、実Google・実台帳・Calendar・iPhone実機・顧客確認の合格ではない。フロント配備とは別にGAS編集headへ保存済みだが、Webアプリは未配備。配備時刻はCLI成功結果のUTC更新時刻に基づき、サーバーrelease時刻の別照会はなし。根拠: docs/progress/2026-11-07-test-site-delivery.md; outputs/booking-modal-release-20261107-evidence.json; outputs/booking-modal-release-20261107-after-review.json。';
const customerPath='docs/acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md',customerDoc=await fs.readFile(customerPath,'utf8');
const marker='【以下は旧ノート。当時の状態として保持】\n',records=[];
for(const row of source.records){
 const run=path.join(dest,row.name);await fs.mkdir(run);const p=await PresentationFile.importPptx(await FileBlob.load(row.final));
 const currentMd=await fs.readFile(row.sourceMdPath,'utf8');
 for(let i=0;i<row.sourceSlides;i++){
  const s=p.slides.items[i],old=s.speakerNotes.text||'',at=old.indexOf(marker);if(at<0)throw Error('Historical notes boundary missing');
  const full=i===0?`\n【本冊の現行生成正本全文】${row.sourceMdPath}\n${currentMd}\n【顧客確認の現行正本全文】${customerPath}\n${customerDoc}\n`:'';
  s.speakerNotes.text=policy+'\n'+delivery+'\n'+full+'\n'+marker+old.slice(at+marker.length);
 }
 p.slides.items[row.sourceSlides].speakerNotes.text=`${row.id}-SL-${String(row.sourceSlides+1).padStart(2,'0')}\n${policy}\n${delivery}`;
 p.slides.items[row.sourceSlides+1].speakerNotes.text=`${row.id}-SL-${String(row.sourceSlides+2).padStart(2,'0')}\n${policy}\n${customerPath}\n${customerDoc}\n${delivery}`;
 if(row.name==='business'){
  const inspect=await p.inspect({kind:'textbox',maxChars:1000000});
  for(const h of inspect.records.filter(x=>x.slideIndex<row.sourceSlides&&x.text==='旧記録／最新方針は末尾2頁')){
   const shape=p.resolve(h.id);shape.position={left:650,top:48,width:580,height:18};shape.text.style={typeface:'Yu Gothic',fontSize:12,color:'#3E5366',alignment:'right',verticalAlignment:'middle',insets:0};
  }
 }
 const publicInspect=await p.inspect({kind:'textbox',maxChars:1000000});
 const scopeNote=publicInspect.records.find(x=>x.slideIndex===row.sourceSlides&&x.text==='この配備でGASは未更新。GoogleのCalendar同意は未了。本番未開始。');
 if(!scopeNote)throw Error('Public scope note not found');
 p.resolve(scopeNote.id).text.replace(scopeNote.text,'GASは編集headへ保存済み・Webアプリ未配備。GoogleのCalendar同意は未了。本番未開始。');
 const candidate=path.join(run,'candidate.pptx');await(await PresentationFile.exportPptx(p)).save(candidate);await fs.mkdir(path.join(run,'final'));
 const final=path.join(run,'final',`${row.name}-2026-11-07-v31.pptx`);
 const validation=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],fontPolicy:{basis:'reference',families:['Yu Gothic'],referencePath:path.resolve(row.source),referenceSha256:row.sourceSha256},verifyArtifactToolImport:true,receiptPath:path.join(run,'validation.json'),explicitTotalSlideCount:row.slides});
 const q=await PresentationFile.importPptx(await FileBlob.load(final));await fs.mkdir(path.join(run,'roundtrip'));
 for(let i=0;i<q.slides.items.length;i++)await fs.writeFile(path.join(run,'roundtrip',`${i+1}.png`),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));
 records.push({...row,final,sha256:validation.finalSha256,sourceMdSha256:sha(Buffer.from(currentMd)),validation:validation.presentationLayout});
 console.log(JSON.stringify({name:row.name,slides:row.slides,findings:validation.presentationLayout.finding_count,warnings:validation.presentationLayout.warning_count}));
}
if(sha(await fs.readFile('docs/traceability/registry.json'))!==sha(regBytes))throw Error('Registry changed during finalization');
await fs.writeFile(path.join(dest,'authoring-results.json'),JSON.stringify({...source,registrySha256:sha(regBytes),registryVersion:reg.version,records,customerPolicySha256:sha(Buffer.from(customerDoc)),manifestUpdated:false},null,2));
console.log('FINALIZED '+records.length+' / '+records.reduce((n,r)=>n+r.slides,0));
