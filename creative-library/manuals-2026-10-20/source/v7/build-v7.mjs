import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {FileBlob,Presentation,PresentationFile} from '@oai/artifact-tool';
const root='C:/Users/kanta/GitHub/eigo-taxi-management';
const build=root+'/.manual-build-20261020/v7';
const out=root+'/docs/deliverables/2026-10-20-manuals';
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1017.31632/skills/presentations';
const py='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const refs='docs/progress/2026-10-20-step-05.md; docs/acceptance/at23-2026-10-20/step05/workbook-verification.json; docs/acceptance/at23-2026-10-20/step05/student-persistence.json';
await fs.mkdir(build,{recursive:true});
const task=await PresentationFile.importPptx(await FileBlob.load(out+'/remaining-tasks-2026-10-20-v6.pptx'));
const replacements=[["2026年10月20日版　実環境受入8件が未完了", "2026年10月20日版　AT-23合格・残る受入7件"], ["未合格：AT-23〜30の8件。初期化2回と既存値保持を確認。Web保存は未実施。", "AT-23合格。初期化・欠落3シート生成・Web保存を実測。残る未合格は7件。"], ["状態：BLOCKED。初期化2回は完了。個別認証の入力とWeb登録確認が残る。", "状態：PASS。検証GAS v1を配備。Webで生徒1行保存と再取得を確認。"], ["実測：3シートの全74入力済みセルを保持。欠落シート生成は未実測。", "実測：欠落3シートの8・12・7列を正確生成。既存82セルを保全・復元。"], ["実施：initSpreadsheet再実行、既存行保持、生徒登録と再取得を確認。", "実施：初期化再実行、既存値保持、Web登録1行とGoogle台帳B4を照合。"], ["完了条件：実台帳に1行保存し、再読込後も保持。設定版・画面・行の証跡を保存。", "証跡：Step 05。元3タブ名へ復元し、生成証跡3タブを残して計6タブ。"], ["残作業・進捗報告はv6。運用・ユーザーはv4を継続。受入後に版を確定。", "残作業・進捗報告はv7。運用・ユーザーはv4を継続。受入後に版を確定。"], ["準備事項を決定後、AT-23を実施。続いてAT-24、AT-25を実施。", "AT-23は合格。カレンダー検証先を分離後、AT-24、AT-25を実施。"], ["個別認証の入力待ちと次の1件", "AT-23合格と次の1件"], ["AT-23：Sheetsのみ許可。14:47に初期化を2回実行し、既存値保持を確認。", "AT-23：Web生徒保存・再読込・欠落3シート生成・既存値保持を実測。"], ["AUTH_USERS_JSONの値入力はユーザーへ引継ぎ。Calendar権限は未付与。", "個別認証と検証Web配備を完了。Calendar権限は未付与。"], ["入力後にWeb配備と生徒1行保存を検証。欠落3シート生成も追加で確認。", "次はAT-24。会社の既定カレンダーへ書く前に検証先の分離を決める。"], ["全8件は未合格。元台帳は保全。新規キーをチャットや証跡に記載しない。", "残る未合格はAT-24〜30の7件。本番運用開始の判断は受入後。"]];
const changed=[0,1,3,10,11,12];
for(const i of changed){const png=await task.export({slide:task.slides.items[i],format:'png',scale:1});await fs.writeFile(build+`/before-${i+1}.png`,new Uint8Array(await png.arrayBuffer()));}
for(const slide of task.slides.items){
 for(const shape of slide.shapes.items) if(shape.text) for(const [a,b] of replacements) shape.text.replace(a,b);
 slide.speakerNotes.text=`最新根拠: ${refs}\nAT-23 PASS。検証用Web配備v1、1行保存・再読込、欠落3シート生成、全82セル保全を実測。残るAT-24〜30未合格。`;
}
const progress=Presentation.create({slideSize:{width:1280,height:720}});
const slides=[["AT-23 Google保存を確認", ["Mauro & Brenda Taxi Link", "小林さん向け　2026年10月20日　Step 05", "判定：AT-23合格。残る実環境受入は7件"]], ["Webから1名登録し再読込で保持", ["検証GASを会社アカウントで配備。バージョン1、15:14。", "不正キーは拒否。管理者の個別キーでWebログインを確認。", "架空生徒を1回登録。台帳は2名から3名へ増加、初期10枚。", "同じIDをWeb再読込・API再取得・Google台帳B4で照合。"]], ["不足3シート生成と既存値保全", ["既存3シートを保全名へ一時変更。初期化で不足分を生成。", "生徒8列・送迎12列・購入7列の見出しだけが正確に作成された。", "登録後の全82入力済みセルを保持し、元の3シート名へ復元。", "生成した3シートを証跡名で保持。計6タブ、削除・Calendar操作なし。"]], ["次はAT-24 カレンダー予約同期", ["AT-23は合格。AT-24〜30の7件は未合格で、本番開始は未判定。", "会社の既定カレンダーへ書く前に、検証先の分離方法を決める。", "Calendar権限は未付与。本番アカウントは教室側で準備する。", "進捗・残作業はv7。運用・ユーザーマニュアルはv4を継続。"]]];
function text(s,t,x,y,w,h,size,color,bold=false){const q=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});q.text=t;q.text.style={typeface:'Yu Gothic',fontSize:size,color,bold};}
for(const [i,[title,lines]] of slides.entries()){const s=progress.slides.add();s.background.fill=i===0?'#123D35':'#F9FAF6';if(i===0){text(s,title,76,172,1128,105,58,'#FFFFFF',true);text(s,lines.join('\n'),80,340,1100,225,28,'#DCECE2');}else{text(s,title,64,54,1152,80,42,'#123D35',true);lines.forEach((t,k)=>text(s,t,72,166+k*112,1136,100,29,'#183431'));}text(s,`${i+1} / 4`,1120,675,110,30,17,i===0?'#DCECE2':'#677A71');s.speakerNotes.text='根拠: '+refs+'\n未送信。元台帳や認証情報を外部資料へ添付しない。';}
const result=[];
for(const [name,p,count] of [['remaining-tasks',task,13],['progress-report-step-05',progress,4]]){
 const dir=build+'/'+name;await fs.mkdir(dir,{recursive:true});
 const candidate=dir+'/candidate.pptx';await(await PresentationFile.exportPptx(p)).save(candidate);
 const final=out+'/'+name+'-2026-10-20-v7.pptx';
 await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:py,integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Yu Gothic']},verifyArtifactToolImport:true,receiptPath:dir+'/validation.json',explicitTotalSlideCount:count,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[]});
 for(const [i,s] of p.slides.items.entries()){const png=await p.export({slide:s,format:'png',scale:1});await fs.writeFile(dir+'/'+String(i+1).padStart(2,'0')+'.png',new Uint8Array(await png.arrayBuffer()));}
 result.push({name,path:final,slides:count});console.log(JSON.stringify(result.at(-1)));
}
await fs.writeFile(build+'/result.json',JSON.stringify(result,null,2));
