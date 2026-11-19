import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {FileBlob,Presentation,PresentationFile} from '@oai/artifact-tool';
const root='C:/Users/kanta/GitHub/eigo-taxi-management';
const build=root+'/.manual-build-20261020/v5';
const out=root+'/docs/deliverables/2026-10-20-manuals';
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1017.31632/skills/presentations';
const py='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const refs='docs/acceptance/at23-2026-10-20/HANDOFF.md; docs/acceptance/at23-2026-10-20/saved-source-verification.json; docs/progress/2026-10-20-step-02.md';
await fs.mkdir(build,{recursive:true});
const task=await PresentationFile.importPptx(await FileBlob.load(out+'/remaining-tasks-2026-10-20-v4.pptx'));
const replacements=[
['未完了範囲：AT-23〜30の実環境受入8件。実Google資源への更新は未実施。','未完了：AT-23〜30の8件。検証コピーとGAS保存を完了し、実受入は承認待ち。'],
['状態：BLOCKED。会社アカウントのログイン確認済み。AT-23の実操作は未実施。','状態：BLOCKED。接続復旧・検証コピー作成済み。初期化はOAuth承認待ち。'],
['前提確認中：既存Sheetを発見。接続エラーで台帳の内容は未確認。','準備完了：元台帳と旧GASを保全。検証GASの現行ソース全文一致を確認。'],
['3資料をv4へ改版。受入後に実URL、担当、連絡先、開始日を追記して版を確定。','残作業・進捗報告はv5。運用・ユーザーはv4を継続。受入後に版を確定。'],
['現在の障害と次の1件','現在の承認待ちと次の1件'],
['AT-23：Google再ログインは完了。Apps ScriptとDriveで会社アカウントを確認済み。','AT-23：接続復旧。非公開の検証コピーへ現行GASを保存し、全文一致を確認。'],
['既存Sheetを開く際のブラウザー接続がタイムアウト。別タブでも改善せず調査中。','Google権限は未付与。全Sheets操作の部分承認を確認中。Calendarは許可しない。'],
['次作業：接続を復旧し、台帳の内容・紐付けGAS・権限・既定カレンダーを確認。','承認後に初期化2回と既存値保持を検証。個別キー・Web配備・1行保存は後続。'],
['Googleへの書込、GAS配備、初期化は未実施。AT-23合格や運用開始とは扱わない。','初期化の完了・Web保存は未確認。実Google8件は未合格。元資源は変更なし。']
];
const changed=[1,3,10,12];
for(const i of changed){const png=await task.export({slide:task.slides.items[i],format:'png',scale:1});await fs.writeFile(build+`/before-${i+1}.png`,new Uint8Array(await png.arrayBuffer()));}
for(const slide of task.slides.items){
 for(const shape of slide.shapes.items) if(shape.text) for(const [a,b] of replacements) shape.text.replace(a,b);
 slide.speakerNotes.text=`最新根拠: ${refs}\n2026-10-20 JST。検証コピー作成と現行GAS保存を実施。OAuth未付与、初期化未完了、実Google受入8件未合格。旧版の状態説明はStep 01の履歴。`;
}
const progress=Presentation.create({slideSize:{width:1280,height:720}});
const slides=[
['AT-23 準備進捗',['Mauro & Brenda Taxi Link','小林さん向け　2026年10月20日　Step 02','判定：BLOCKED。Google権限の承認待ち']],
['接続復旧と検証環境の準備',[
'会社アカウントで台帳・GASへの接続が復旧。元データと旧コードを保全。',
'元の資源を変更せず、非公開の検証コピーと紐付けGASを用意。',
'検証GASへ現行ソースを保存。再読込後に全文の一致を確認。',
'初期化は承認画面で停止。Webからの生徒登録・保存試験は未実施。']],
['Google権限の承認待ち',[
'要求は全Sheetsの参照・編集・作成・削除と、全Calendarの操作。',
'どちらも未付与。AT-23はSheetsだけの部分承認を確認中。',
'承認後に初期化2回と既存値保持を確認。Calendarへの操作は後続。',
'権限画面の画像保存はタイムアウト。要求内容は画面の文字情報で確認。']],
['次の確認と添付資料',[
'個別キー・Web配備を準備し、生徒の新規登録が1行保存されることを確認。',
'AT-23〜30の8件は未合格。1件ごとに結果・証跡・資料を報告する。',
'残作業一覧と本報告はv5。運用・ユーザーマニュアルはv4を継続。',
'受入は会社アカウント。本番用Googleアカウントは教室側で準備する。']]
];
function text(s,t,x,y,w,h,size,color,bold=false){const q=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});q.text=t;q.text.style={typeface:'Yu Gothic',fontSize:size,color,bold};}
for(const [i,[title,lines]] of slides.entries()){const s=progress.slides.add();s.background.fill=i===0?'#123D35':'#F9FAF6';if(i===0){text(s,title,76,172,1128,105,58,'#FFFFFF',true);text(s,lines.join('\n'),80,340,1100,225,28,'#DCECE2');}else{text(s,title,64,54,1152,80,42,'#123D35',true);lines.forEach((t,k)=>text(s,t,72,166+k*112,1136,100,29,'#183431'));}text(s,`${i+1} / 4`,1120,675,110,30,17,i===0?'#DCECE2':'#677A71');s.speakerNotes.text='根拠: '+refs+'\n未送信。元台帳や認証情報を外部資料へ添付しない。';}
const result=[];
for(const [name,p,count] of [['remaining-tasks',task,13],['progress-report-step-02',progress,4]]){
 const dir=build+'/'+name;await fs.mkdir(dir,{recursive:true});
 const candidate=dir+'/candidate.pptx';await(await PresentationFile.exportPptx(p)).save(candidate);
 const final=out+'/'+name+'-2026-10-20-v5.pptx';
 await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:py,integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Yu Gothic']},verifyArtifactToolImport:true,receiptPath:dir+'/validation.json',explicitTotalSlideCount:count,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[]});
 for(const [i,s] of p.slides.items.entries()){const png=await p.export({slide:s,format:'png',scale:1});await fs.writeFile(dir+'/'+String(i+1).padStart(2,'0')+'.png',new Uint8Array(await png.arrayBuffer()));}
 result.push({name,path:final,slides:count});console.log(JSON.stringify(result.at(-1)));
}
await fs.writeFile(build+'/result.json',JSON.stringify(result,null,2));
