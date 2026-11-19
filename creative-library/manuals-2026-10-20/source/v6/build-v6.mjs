import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {FileBlob,Presentation,PresentationFile} from '@oai/artifact-tool';
const root='C:/Users/kanta/GitHub/eigo-taxi-management';
const build=root+'/.manual-build-20261020/v6';
const out=root+'/docs/deliverables/2026-10-20-manuals';
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1017.31632/skills/presentations';
const py='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const refs='docs/acceptance/at23-2026-10-20/step03/cell-preservation.json; docs/acceptance/at23-2026-10-20/HANDOFF.md; docs/acceptance/at23-2026-10-20/saved-source-verification.json; docs/progress/2026-10-20-step-03.md';
await fs.mkdir(build,{recursive:true});
const task=await PresentationFile.importPptx(await FileBlob.load(out+'/remaining-tasks-2026-10-20-v5.pptx'));
const replacements=[["未完了：AT-23〜30の8件。検証コピーとGAS保存を完了し、実受入は承認待ち。", "未合格：AT-23〜30の8件。初期化2回と既存値保持を確認。Web保存は未実施。"], ["状態：BLOCKED。接続復旧・検証コピー作成済み。初期化はOAuth承認待ち。", "状態：BLOCKED。初期化2回は完了。個別認証の入力とWeb登録確認が残る。"], ["準備完了：元台帳と旧GASを保全。検証GASの現行ソース全文一致を確認。", "実測：3シートの全74入力済みセルを保持。欠落シート生成は未実測。"], ["残作業・進捗報告はv5。運用・ユーザーはv4を継続。受入後に版を確定。", "残作業・進捗報告はv6。運用・ユーザーはv4を継続。受入後に版を確定。"], ["現在の承認待ちと次の1件", "個別認証の入力待ちと次の1件"], ["AT-23：接続復旧。非公開の検証コピーへ現行GASを保存し、全文一致を確認。", "AT-23：Sheetsのみ許可。14:47に初期化を2回実行し、既存値保持を確認。"], ["Google権限は未付与。全Sheets操作の部分承認を確認中。Calendarは許可しない。", "AUTH_USERS_JSONの値入力はユーザーへ引継ぎ。Calendar権限は未付与。"], ["承認後に初期化2回と既存値保持を検証。個別キー・Web配備・1行保存は後続。", "入力後にWeb配備と生徒1行保存を検証。欠落3シート生成も追加で確認。"], ["初期化の完了・Web保存は未確認。実Google8件は未合格。元資源は変更なし。", "全8件は未合格。元台帳は保全。新規キーをチャットや証跡に記載しない。"]];
const changed=[1,3,10,12];
for(const i of changed){const png=await task.export({slide:task.slides.items[i],format:'png',scale:1});await fs.writeFile(build+`/before-${i+1}.png`,new Uint8Array(await png.arrayBuffer()));}
for(const slide of task.slides.items){
 for(const shape of slide.shapes.items) if(shape.text) for(const [a,b] of replacements) shape.text.replace(a,b);
 slide.speakerNotes.text=`最新根拠: ${refs}\n2026-10-20 JST。検証コピー作成と現行GAS保存を実施。Sheetsのみ付与、初期化2回と74セル保持を確認。個別認証とWeb保存は未完了。実Google受入8件未合格。旧版の状態説明はStep 01の履歴。`;
}
const progress=Presentation.create({slideSize:{width:1280,height:720}});
const slides=[["AT-23 初期化の実測結果", ["Mauro & Brenda Taxi Link", "小林さん向け　2026年10月20日　Step 03", "判定：一部確認済み。個別認証・Web保存は未完了"]], ["Sheetsだけで初期化を2回完了", ["ユーザー承認後、Sheetsだけの権限を付与。Calendar権限は未付与。", "検証コピーで初期化を2回実行。画面の実行ログはいずれも完了。", "実行前後の3台帳を照合し、全74入力済みセルの値・式が完全一致。", "元台帳には操作せず、各回の実行ログ・画像・台帳を保存。"]], ["AT-23全体は引き続き未合格", ["既存3シートで試したため、欠落シートの新規生成はまだ未実測。", "個別認証とWeb配備が未完了。Web生徒登録1行保存は未実施。", "AUTH_USERS_JSONのプロパティ名だけ入力。値は空で未保存。", "新規の認証情報はユーザーが入力・保存する。実キーは記録に載せない。"]], ["次の操作と報告資料", ["用意したローカル補助スクリプトで検証用の4利用者を準備する。", "ユーザーがハッシュJSONを設定し、Web配備・保存確認へ進む。", "進捗報告と残作業一覧はv6。運用・ユーザーマニュアルはv4を継続。", "全8件は未合格。受入は会社アカウント、本番アカウントは教室が準備。"]]];
function text(s,t,x,y,w,h,size,color,bold=false){const q=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});q.text=t;q.text.style={typeface:'Yu Gothic',fontSize:size,color,bold};}
for(const [i,[title,lines]] of slides.entries()){const s=progress.slides.add();s.background.fill=i===0?'#123D35':'#F9FAF6';if(i===0){text(s,title,76,172,1128,105,58,'#FFFFFF',true);text(s,lines.join('\n'),80,340,1100,225,28,'#DCECE2');}else{text(s,title,64,54,1152,80,42,'#123D35',true);lines.forEach((t,k)=>text(s,t,72,166+k*112,1136,100,29,'#183431'));}text(s,`${i+1} / 4`,1120,675,110,30,17,i===0?'#DCECE2':'#677A71');s.speakerNotes.text='根拠: '+refs+'\n未送信。元台帳や認証情報を外部資料へ添付しない。';}
const result=[];
for(const [name,p,count] of [['remaining-tasks',task,13],['progress-report-step-03',progress,4]]){
 const dir=build+'/'+name;await fs.mkdir(dir,{recursive:true});
 const candidate=dir+'/candidate.pptx';await(await PresentationFile.exportPptx(p)).save(candidate);
 const final=out+'/'+name+'-2026-10-20-v6.pptx';
 await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:py,integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Yu Gothic']},verifyArtifactToolImport:true,receiptPath:dir+'/validation.json',explicitTotalSlideCount:count,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[]});
 for(const [i,s] of p.slides.items.entries()){const png=await p.export({slide:s,format:'png',scale:1});await fs.writeFile(dir+'/'+String(i+1).padStart(2,'0')+'.png',new Uint8Array(await png.arrayBuffer()));}
 result.push({name,path:final,slides:count});console.log(JSON.stringify(result.at(-1)));
}
await fs.writeFile(build+'/result.json',JSON.stringify(result,null,2));
