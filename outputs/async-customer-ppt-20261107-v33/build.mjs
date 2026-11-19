import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),base=path.resolve('outputs/async-customer-ppt-20261107-v33/finalized');
const runtime='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1104-2876-0_26.1104.2876.0_x64__3k8sg7r9htsxt/dependencies',skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.22356/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),assert=(x,m)=>{if(!x)throw Error(m);};
const regBytes=await fs.readFile('docs/traceability/registry.json'),reg=JSON.parse(regBytes),regSha=sha(regBytes);
const freeze=JSON.parse(await fs.readFile('outputs/async-customer-ppt-20261107-v33/freeze.json','utf8'));
assert(freeze.status==='ROOT_LOCK'&&process.argv[2]===regSha&&freeze.registrySha256===regSha&&freeze.registryVersion===reg.version&&reg.version==='2026-11-07-r17','Root r17 LOCK is required; preparation must not export');
assert(reg.facts.customerAcceptancePassed===0&&reg.facts.customerAcceptanceTotal===6&&reg.facts.release==='HOLD','Acceptance boundary mismatch');
assert(Array.isArray(freeze.evidenceFiles)&&freeze.evidenceFiles.length>0,'Evidence files must be frozen');
for(const item of freeze.evidenceFiles)assert(sha(await fs.readFile(item.path))===item.sha256,'Frozen evidence changed: '+item.path);
for(const text of [freeze.observationSummary,freeze.frontendStatus,freeze.customerStatus,freeze.contentReview])assert(typeof text==='string'&&text.length>0&&!/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|https:\/\/(?:docs|script|calendar)\.google\.com|#\/parent\/[0-9a-f-]{30,}/.test(text),'Unsafe or empty frozen summary');
const manifestBytes=await fs.readFile('docs/traceability/presentations.json'),entries=JSON.parse(manifestBytes);
const docs={'PKG-01':'01_BUSINESS_FLOWS','PKG-02':'03_REQUIREMENTS','PKG-03':'04_FUNCTIONAL_SPEC','PKG-04':'17_TEST_SPEC','PKG-05':'05_TASKS','PKG-06':'18_IMPLEMENTATION_INDEX','PKG-07':'19_TEST_CODE_INDEX','PKG-08':'06_ACCEPTANCE_TEST_SPEC','PKG-09':'20_OPERATIONS','PKG-10':'21_USER_MANUAL','PKG-11':'07_TRACEABILITY_MATRIX','PKG-12':'08_ACCEPTANCE_RESULTS'};
const customerPath='docs/acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md',customerDoc=await fs.readFile(customerPath,'utf8');
const current='【2026-11-07 r17 現行状態】'+freeze.observationSummary+'\n【現行の範囲と過去の未解明事項】'+freeze.contentReview+'\n【描画の確認範囲】全頁をローカルで描画・再importして検査する。人間によるnative PowerPointの実表示は未確認。';
const dev='【検証範囲】同一のGoogle本人を検証専用reviewerとして登録し、家庭用と管理者用の固定2URLを使う。管理者用も指定した架空生徒1名だけを扱い、通常の管理者・保護者の権限を維持する。検証用管理者ではアカウント管理・Google連携設定・個別URL一覧・新規生徒登録を利用できない。サーバー側の検証台帳ゲートと生徒の権限制御を必須とし、画面側もallowlistで制限する。ローカル合成認証/GAS応答での31契約試験・8UI試験は実Googleログインや顧客確認の合格ではない。';
const policy='【顧客確認の現行手順】CUST-01〜06は未実施0/6、全体HOLD・本番未開始。準備完了の案内後は本人が都合のよい時に同じGoogleアカウントと2つの固定URLで進め、実施中に開発者が役割を変える作業は発生しない。通常のログアウト・ログインで画面を移る。完了用の片道・往復2予約は固定日付で用意し、日付が過ぎてもA03の全送迎スケジュール一覧で完了する。初期5枚、片道後4枚、往復後2枚、10枚追加後12枚を再取得して照合し、共有表に実施済みの手順と残数を記録して途中再開する。完了済みの予約や追加済み10枚は繰り返さない。値が異なる場合は再送せず通常の問い合わせとして要確認で止める。旧案の開発者による役割切替と実施日確定後の当日準備は不採用。旧本文・旧ノートは当時の履歴で、現行の手順はこの注記、末尾2図および現行正本を参照する。原AT-01〜30は開発側の技術検証として維持する。';
const evidence='根拠: '+freeze.evidenceFiles.map(x=>x.path).join('; ')+'。私的メール・Calendar ID・家庭個別URLは本資料へ収録しない。公開フロントのデモ検査、実Googleの開発側検査、顧客確認を区別し、証跡のない項目を合格にしない。';
const replaceA=[
 ['検証サイトへ反映し、小画面の登録を確認','同じGoogleで2つの検証画面を使えます'],
 ['11月7日：反映後の公開デモで、同じ4条件を再確認','検証専用アカウントで、指定した架空生徒1名だけを操作'],
 ['修正を反映','同じGoogle'],['検証サイトのみ','本人がログイン'],['公開デモで操作','2つの固定URL'],['管理者・保護者 × 2画面','家庭用・管理者用'],['結果を確認','架空生徒1名だけ'],['4件 FAIL → 4件 PASS','通常の生徒には触れません'],
 ['公開6ファイル＋ルートURLの7応答が一致','開始前の準備後は、開発者の役割切替は不要'],
 ['縦にスクロールして登録。再読込・ログアウトも確認。','通常の管理者・保護者の権限を維持。\n検証専用の登録で分けます。'],
 ['公開フロントエンドのデモ経路です。実Google・実機・顧客確認の合格とは別です。','検証用管理者は、アカウント管理・教室設定・新規生徒登録を使えません。'],
 ['GASは編集headへ保存済み・Webアプリ未配備。GoogleのCalendar同意は未了。本番未開始。',freeze.frontendStatus],
];
const replaceB=[
 ['小林さんには日常操作6件をご確認いただきます','日付に依存せず、途中から再開できます'],['技術試験30件は開発側で継続','同じ生徒・予約・残数を再取得して照合'],
 ['CUST-01　本人ログイン','開始時は残数5枚'],['自分の家庭だけ／残数5枚','家庭用で予約・取消を確認'],['CUST-02　1回分を予約','片道を1件完了'],['カレンダーと一致／残数5枚','全スケジュールで 5→4枚'],['CUST-03　予約を取消','往復を1件完了'],['両画面から消える／残数5枚','同じ一覧から 4→2枚'],['CUST-04　完了を登録','残り2枚の案内'],['片道 5→4／往復 4→2','家庭用で連絡案内を確認'],['CUST-05　残少・追加','10枚を1回だけ追加'],['連絡案内を確認／10枚追加で12枚','管理者用で 2→12枚'],['CUST-06　ログアウト','両画面でログアウト'],['保護者・管理者とも台帳が非表示','再読込後に台帳が非表示'],
 ['架空データを開発側が準備。実際の送迎・支払いは発生しません。','記録した残数 5・4・2・12 を照合し、未実施の操作だけを進めます。'],
 ['旧「第三者30件」は現在の完了条件から外しました。過去の実績は履歴として保持します。',freeze.customerStatus],
];
await fs.mkdir(base,{recursive:false});await fs.writeFile(path.join(base,'registry-snapshot.json'),regBytes);await fs.writeFile(path.join(base,'source-manifest.json'),manifestBytes);
const records=[];
for(const entry of entries){
 const source=await fs.readFile(entry.path);assert(sha(source)===entry.sha256&&entry.path.endsWith('-v31.pptx'),'Source v31 changed');
 const name=path.basename(entry.path).split('-2026-')[0],run=path.join(base,name);await fs.mkdir(run);const p=await PresentationFile.importPptx(await FileBlob.load(entry.path));assert(p.slides.items.length===entry.slides,'Count mismatch');
 const last=p.slides.items.length-2,inspect=await p.inspect({kind:'textbox',maxChars:1000000});
 for(const [index,pairs] of [[last,replaceA],[last+1,replaceB]])for(const [oldText,newText] of pairs){const h=inspect.records.find(x=>x.slideIndex===index&&x.text===oldText);assert(h,`Missing source text ${name}/${index}: ${oldText}`);p.resolve(h.id).text.replace(oldText,newText);}
 for(const h of inspect.records.filter(x=>x.slideIndex>=last&&x.text?.includes('| 2026-11-07追補')))p.resolve(h.id).text.replace('2026-11-07追補','2026-11-07 r17追補');
 const docPath=`docs/acceptance/${docs[entry.id]}.md`,md=await fs.readFile(docPath,'utf8');
 for(let i=0;i<p.slides.items.length;i++){
  const s=p.slides.items[i],old=s.speakerNotes.text||'',full=i===0?`\n【本冊の現行生成正本全文】${docPath}\n${md}\n【顧客確認の現行正本全文】${customerPath}\n${customerDoc}\n`:'';
  s.speakerNotes.text=current+'\n'+dev+'\n'+policy+'\n'+evidence+'\n'+full+'\n【以下はv31時点の旧ノート。当時の状態として保全】\n'+old;
 }
 const candidate=path.join(run,'candidate.pptx');await(await PresentationFile.exportPptx(p)).save(candidate);await fs.mkdir(path.join(run,'final'));
 const final=path.join(run,'final',`${name}-2026-11-07-v33.pptx`);
 const validation=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],fontPolicy:{basis:'reference',families:['Yu Gothic'],referencePath:path.resolve(entry.path),referenceSha256:entry.sha256},verifyArtifactToolImport:true,receiptPath:path.join(run,'validation.json'),explicitTotalSlideCount:entry.slides});
 const q=await PresentationFile.importPptx(await FileBlob.load(final));await fs.mkdir(path.join(run,'roundtrip'));
 for(let i=0;i<q.slides.items.length;i++)await fs.writeFile(path.join(run,'roundtrip',`${i+1}.png`),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));
 records.push({id:entry.id,name,source:entry.path,sourceSha256:entry.sha256,sourceSlides:entry.slides,preservedBodySlides:entry.slides-2,sourceMdPath:docPath,sourceMdSha256:sha(Buffer.from(md)),final,sha256:validation.finalSha256,slides:entry.slides,validation:validation.presentationLayout});
 console.log(JSON.stringify({name,slides:entry.slides,findings:validation.presentationLayout.finding_count,warnings:validation.presentationLayout.warning_count}));
}
assert(sha(await fs.readFile('docs/traceability/registry.json'))===regSha,'Registry changed during generation');
await fs.writeFile(path.join(base,'authoring-results.json'),JSON.stringify({date:'2026-11-07',registryVersion:reg.version,registrySha256:regSha,customerPolicySha256:sha(Buffer.from(customerDoc)),freezeSha256:sha(await fs.readFile('outputs/async-customer-ppt-20261107-v33/freeze.json')),records,manifestUpdated:false},null,2));
console.log('COMPLETE12/160');
