import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),base=path.resolve('outputs/customer-prep-ppt-20261107-v32/finalized');
const runtime='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1104-2876-0_26.1104.2876.0_x64__3k8sg7r9htsxt/dependencies',skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.22356/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),assert=(x,m)=>{if(!x)throw Error(m);};
const regBytes=await fs.readFile('docs/traceability/registry.json'),reg=JSON.parse(regBytes),regSha=sha(regBytes);
assert(process.argv[2]===regSha&&regSha==='f2d307b7a61cfcbf13cc48221cd58ca73c910b499b30a1ed46f7e163773e36fd'&&reg.version==='2026-11-07-r16','Root r16 LOCK mismatch');
const proofDir='outputs/customer-ready-20261107';
const read=async name=>JSON.parse(await fs.readFile(`${proofDir}/${name}.json`,'utf8'));
const cal=await read('calendar-read-result'),dep=await read('gas-deployment-v5'),smoke=await read('booking-smoke-result'),account=await read('account-registration'),shared=await read('calendar-sharing');
assert(cal.status==='PASS'&&cal.expectedCalendarMatched&&cal.timeZoneMatched&&cal.ownedByDeployer&&cal.notPrimaryCalendar&&cal.eventsCreated===0,'Calendar proof mismatch');
assert(dep.status==='DEPLOYED'&&dep.version===5&&dep.temporaryReadProbeRemovedBeforeDeployment&&dep.deploymentIdUnchanged&&dep.executeAsUnchanged&&dep.accessSettingUnchanged,'GAS deployment proof mismatch');
assert(account.active&&account.role==='parent'&&account.studentIds.length===1&&account.studentIds[0]==='STU-CUST-20261107'&&account.originalAdminsRetained===2&&account.status==='REGISTERED_WAITING_FIRST_GOOGLE_LOGIN','Account proof mismatch');
assert(shared.status==='SHARED_READER_PERSISTED'&&shared.reloadedPermissionVerified&&shared.canEdit===false&&shared.recipientReceivedOrOpenedNotYetConfirmed,'Sharing proof mismatch');
assert(smoke.status==='PARTIAL_RESPONSE_FAILURE'&&smoke.createSubmissionCount===1&&smoke.observations.siteDisplayedGenericCommunicationError&&smoke.observations.newLedgerRowCount===1&&smoke.observations.calendarDescriptionReservationIdMatches&&smoke.observations.calendarDateTimeLocationMatchesLedger&&smoke.observations.siteReloadStudentBalance===5&&smoke.cancellation.calendarRemoved&&smoke.cancellation.siteReloadCancelled&&smoke.cancellation.balanceAfterReload===5&&smoke.acceptancePassed===false,'Booking/cancellation scope mismatch');
assert(reg.facts.customerAcceptancePassed===0&&reg.facts.customerAcceptanceTotal===6&&reg.facts.release==='HOLD','Acceptance boundary mismatch');
const manifestBytes=await fs.readFile('docs/traceability/presentations.json'),entries=JSON.parse(manifestBytes);
const docs={'PKG-01':'01_BUSINESS_FLOWS','PKG-02':'03_REQUIREMENTS','PKG-03':'04_FUNCTIONAL_SPEC','PKG-04':'17_TEST_SPEC','PKG-05':'05_TASKS','PKG-06':'18_IMPLEMENTATION_INDEX','PKG-07':'19_TEST_CODE_INDEX','PKG-08':'06_ACCEPTANCE_TEST_SPEC','PKG-09':'20_OPERATIONS','PKG-10':'21_USER_MANUAL','PKG-11':'07_TRACEABILITY_MATRIX','PKG-12':'08_ACCEPTANCE_RESULTS'};
const customerPath='docs/acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md',customerDoc=await fs.readFile(customerPath,'utf8');
const current='【2026-11-07 r16 現行状態】Calendar読取を17:11:51に実実行し、会社所有・期待ID・非primary・Asia/Tokyoを確認。予定作成0/台帳更新0の読取確認。17:15に既存の会社検証WebアプリをGAS v4→v5へ配備。URL/実行者/アクセス設定は維持、一時probeを除去したレビュー済みコード。架空生徒1名・開始5枚を準備し、既存3名は再読込後も変更なし。小林さんの1つのGoogle本人を有効な保護者として架空生徒1名だけに事前登録し、元の管理者2名を保持。本人初回ログインは未確認。専用Calendarの予定詳細を閲覧する共有を、ユーザーの通知送信許可を受け送信し再読込で権限保持を確認。受領者の受信/表示確認は未了。私的メール・Calendar ID・家庭個別URLは本資料へ収録しない。';
const dev='【開発側の予約・取消の部分確認】架空予約を1回送信すると画面に汎用通信エラー。再送せず、台帳にscheduled1行、専用Calendarの予約ID/日時/場所の一致、サイト再読込表示・残5枚を確認。ユーザーが取消確認ダイアログをOK後、同一台帳cancelled・同一専用予定の消失・サイト再読込取消表示・残5枚を照合。登録の通常成功表示は未確認、最初のブラウザー応答は未捕捉、通信エラー根因は未確定。顧客開始前の課題であり、AT-24/25や顧客確認の全体PASSにはしない。';
const policy='【顧客確認の計画】CUST-01〜06は全件未実施0/6、全体HOLD・本番未開始。単一Google本人を、開発側が保護者→管理者→保護者→管理者→保護者（P→A→P→A→P）と段階的に切替え、各回ログアウト・再ログイン。CUST01〜03は残5、CUST04は5→4→2、CUST05は残2の連絡案内と10枚追加で12枚、CUST06は両役のログアウト後非表示を予定。顧客実施日は未定。当日完了用の片道/往復2予約と模擬実績表は日程確定後に準備する。旧第三者30件は廃止した運用条件で、原AT-01〜30は開発側の技術検証として維持。';
const evidence='根拠: docs/progress/2026-11-07-customer-readiness.md; outputs/customer-ready-20261107/calendar-read-result.json; gas-deployment-v5.json; booking-smoke-result.json; account-registration.json; calendar-sharing.json; students-before.tsv; students-after.tsv。前回11/7の公開フロント4件PASSは公開デモ経路として履歴保存し、この実Googleの部分確認とは別に扱う。';
const replaceA=[
 ['検証サイトへ反映し、小画面の登録を確認','検証連携を照合。登録の成功表示に課題'],
 ['11月7日：反映後の公開デモで、同じ4条件を再確認','Calendar読取・GAS v5配備・開発側の予約取消を部分確認'],
 ['修正を反映','専用Calendar'],['検証サイトのみ','読取 PASS・Tokyo'],['公開デモで操作','検証GAS v5'],['管理者・保護者 × 2画面','同じURLで配備'],['結果を確認','予約→取消を照合'],['4件 FAIL → 4件 PASS','台帳・予定・再読込を確認'],
 ['公開6ファイル＋ルートURLの7応答が一致','予約・取消後も残数5枚。二重送信はしていません。'],
 ['縦にスクロールして登録。再読込・ログアウトも確認。','登録時は画面に通信エラー。\n保存先の照合後に取消を確認。'],
 ['公開フロントエンドのデモ経路です。実Google・実機・顧客確認の合格とは別です。','通常の登録成功表示とエラー原因は未確認。顧客開始前の課題として残しています。'],
 ['GASは編集headへ保存済み・Webアプリ未配備。GoogleのCalendar同意は未了。本番未開始。','開発側の架空データによる部分確認です。顧客確認 0 / 6・全体HOLD・本番未開始。'],
];
const replaceB=[
 ['小林さんには日常操作6件をご確認いただきます','今回の顧客確認は1アカウントで進めます（予定）'],['技術試験30件は開発側で継続','事前登録・閲覧共有まで実施'],
 ['CUST-01　本人ログイン','① 保護者で確認'],['自分の家庭だけ／残数5枚','CUST-01〜03／残数5枚'],['CUST-02　1回分を予約','② 管理者に切替'],['カレンダーと一致／残数5枚','CUST-04／5→4→2枚'],['CUST-03　予約を取消','③ 保護者で残少確認'],['両画面から消える／残数5枚','CUST-05前半／残り2枚'],['CUST-04　完了を登録','④ 管理者で10枚追加'],['片道 5→4／往復 4→2','CUST-05後半・CUST-06'],['CUST-05　残少・追加','⑤ 保護者で最終確認'],['連絡案内を確認／10枚追加で12枚','残数12枚・CUST-06'],['CUST-06　ログアウト','開発側が役割を切替'],['保護者・管理者とも台帳が非表示','毎回ログアウト・再ログイン'],
 ['架空データを開発側が準備。実際の送迎・支払いは発生しません。','本人ログイン・カレンダー閲覧は未確認。実施日は未定、顧客確認は未開始です。'],
 ['旧「第三者30件」は現在の完了条件から外しました。過去の実績は履歴として保持します。','登録時の通信エラー原因を調査中。日程確定後に完了用2予約・模擬実績表を用意。'],
];
await fs.mkdir(base,{recursive:false});await fs.writeFile(path.join(base,'registry-snapshot.json'),regBytes);await fs.writeFile(path.join(base,'source-manifest.json'),manifestBytes);
const records=[];
for(const entry of entries){
 const source=await fs.readFile(entry.path);assert(sha(source)===entry.sha256&&entry.path.endsWith('-v31.pptx'),'Source v31 changed');
 const name=path.basename(entry.path).split('-2026-')[0],run=path.join(base,name);await fs.mkdir(run);const p=await PresentationFile.importPptx(await FileBlob.load(entry.path));assert(p.slides.items.length===entry.slides,'Count mismatch');
 const last=p.slides.items.length-2,inspect=await p.inspect({kind:'textbox',maxChars:1000000});
 for(const [index,pairs] of [[last,replaceA],[last+1,replaceB]])for(const [oldText,newText] of pairs){const h=inspect.records.find(x=>x.slideIndex===index&&x.text===oldText);assert(h,`Missing source text ${name}/${index}: ${oldText}`);p.resolve(h.id).text.replace(oldText,newText);}
 for(const h of inspect.records.filter(x=>x.slideIndex>=last&&x.text?.includes('| 2026-11-07追補')))p.resolve(h.id).text.replace('2026-11-07追補','2026-11-07 r16追補');
 const docPath=`docs/acceptance/${docs[entry.id]}.md`,md=await fs.readFile(docPath,'utf8');
 for(let i=0;i<p.slides.items.length;i++){
  const s=p.slides.items[i],old=s.speakerNotes.text||'',full=i===0?`\n【本冊の現行生成正本全文】${docPath}\n${md}\n【顧客確認の現行正本全文】${customerPath}\n${customerDoc}\n`:'';
  s.speakerNotes.text=current+'\n'+dev+'\n'+policy+'\n'+evidence+'\n'+full+'\n【以下はv31時点の旧ノート。当時の状態として保全】\n'+old;
 }
 const candidate=path.join(run,'candidate.pptx');await(await PresentationFile.exportPptx(p)).save(candidate);await fs.mkdir(path.join(run,'final'));
 const final=path.join(run,'final',`${name}-2026-11-07-v32.pptx`);
 const validation=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],fontPolicy:{basis:'reference',families:['Yu Gothic'],referencePath:path.resolve(entry.path),referenceSha256:entry.sha256},verifyArtifactToolImport:true,receiptPath:path.join(run,'validation.json'),explicitTotalSlideCount:entry.slides});
 const q=await PresentationFile.importPptx(await FileBlob.load(final));await fs.mkdir(path.join(run,'roundtrip'));
 for(let i=0;i<q.slides.items.length;i++)await fs.writeFile(path.join(run,'roundtrip',`${i+1}.png`),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));
 records.push({id:entry.id,name,source:entry.path,sourceSha256:entry.sha256,sourceSlides:entry.slides,preservedBodySlides:entry.slides-2,sourceMdPath:docPath,sourceMdSha256:sha(Buffer.from(md)),final,sha256:validation.finalSha256,slides:entry.slides,validation:validation.presentationLayout});
 console.log(JSON.stringify({name,slides:entry.slides,findings:validation.presentationLayout.finding_count,warnings:validation.presentationLayout.warning_count}));
}
assert(sha(await fs.readFile('docs/traceability/registry.json'))===regSha,'Registry changed during generation');
await fs.writeFile(path.join(base,'authoring-results.json'),JSON.stringify({date:'2026-11-07',registryVersion:reg.version,registrySha256:regSha,customerPolicySha256:sha(Buffer.from(customerDoc)),records,manifestUpdated:false},null,2));
console.log('COMPLETE12/160');
