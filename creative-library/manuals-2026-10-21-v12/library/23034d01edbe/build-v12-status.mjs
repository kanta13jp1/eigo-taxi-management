import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {PresentationFile,FileBlob} from '@oai/artifact-tool';
const root='C:/Users/kanta/GitHub/eigo-taxi-management';
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1017.22135/skills/presentations';
process.env.RUNTIME_NODE_MODULES='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const name=process.argv[2];
if(!['operation-manual','user-manual','remaining-tasks','progress-report-role-portals','portal-spec-supplement'].includes(name))throw Error('Explicit deck required');
const dir=root+'/docs/deliverables/2026-10-21-manuals';
const stage=root+'/docs/acceptance/developer-setup-2026-10-21/presentations-v12/'+name;
const p=await PresentationFile.importPptx(await FileBlob.load(dir+'/'+name+'-2026-10-21-v11-review.pptx'));
const replacements=new Map([
 ['新Google方式は外部設定前。公開中のv10は旧キー方式。','Google認証・GAS権限は設定済み。本人登録・実ログインは未完了。'],
 ['新方式：ローカル準備版。実サービス設定と公開は未完了。','新方式：外部認証設定を開始。実ログイン確認後に公開。'],
 ['Firebase・GASの実設定、Google実ログインは確認前。','Firebase認証とGAS権限を確認。本人UID登録・実ログインは未完了。'],
 ['Google認証の外部設定と実ログイン確認は未完了。','Google認証・GAS権限を設定。本人登録と実ログインは未完了。'],
 ['Firebase認証設定とGASの外部本人確認の許可を確認。','Firebase認証を有効化。GASは対象台帳と外部通信だけを承認済み。'],
 ['Google認証はローカル準備中。外部設定・実Google確認は未完了。','Google認証・GAS権限は設定済み。本人登録・実Google確認は未完了。'],
 ['Firebase Webアプリ登録、Google認証とドメインを設定。','本人UIDを登録し、ログイン・家庭分離・失効を実接続で確認。'],
 ['GASのGoogle本人確認APIへの通信権限と利用者の許可設定。','GASの本人確認先設定を確認し、利用者の許可設定・デプロイを完了。'],
 ['次はGoogle認証の外部設定と実ログイン確認。Calendar受入は別途。','次は本人UID登録と実ログイン。ブラウザー接続の復旧が必要。'],
]);
for(const s of p.slides.items){
 for(const shape of s.shapes.items){let old=String(shape.text),next=old.replaceAll('v11 準備版（新方式は未公開）','v12 設定中（新方式は未公開）').replaceAll('v11準備版に更新','v12設定中版に更新');next=replacements.get(next)||next;if(next!==old)shape.text.replace(old,next);}
 s.speakerNotes.text='2026-10-21 v12設定中版。Firebase Web登録/Google有効化/検証ドメイン保存、GAS対象台帳+external_request承認/初期化実行を確認。本人UID未登録、Google実ログイン未完了、新GASデプロイ・新サイト公開は未実施。Calendar未追加。Step08参照。旧版の合格を新方式の実受入にしない。';
}
await fs.mkdir(stage,{recursive:true});const candidate=stage+'/candidate.pptx';await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:dir+'/'+name+'-2026-10-21-v12-setup.pptx',pythonExecutable:'C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Yu Gothic']},verifyArtifactToolImport:true,receiptPath:stage+'/validation.json',explicitTotalSlideCount:p.slides.items.length,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[]});
for(const[i,s]of p.slides.items.entries()){const image=await p.export({slide:s,format:'png',scale:1});await fs.writeFile(stage+'/'+String(i+1).padStart(2,'0')+'.png',new Uint8Array(await image.arrayBuffer()));}
await fs.writeFile(stage+'/content.json',JSON.stringify(p.slides.items.map((s,i)=>({slide:i+1,text:s.shapes.items.map(x=>String(x.text))})),null,2));console.log(name+' v12 verified');
