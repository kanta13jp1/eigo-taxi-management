import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const root='C:/Users/kanta/GitHub/eigo-taxi-management';
const build=root+'/.manual-build-20261020';
const out=root+'/docs/deliverables/2026-10-20-manuals';
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1017.11052/skills/presentations';
const py='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const shots='docs/acceptance/runs/2026-10-19T16-59-40-731Z/';
const S=(title,lines,refs,shot)=>({title,lines,refs,shot});
const auth='docs/GAS_AUTH_SETUP.md; gas/Code.gs';
const status='docs/acceptance/16_SEQUENTIAL_ACCEPTANCE.md';
const ui='src/App.tsx; src/components/TeacherDashboard.tsx; src/components/ParentPortal.tsx';

const {ops,user,task}=JSON.parse(await fs.readFile(build+'/content.json','utf8'));
const progressRef='docs/progress/2026-10-20-step-01.md; docs/remaining-work-tracker.md';
ops[1].lines[3]='検証は会社アカウントで実施。本番は教室側の運用用Googleアカウントを準備する。';
ops[1].refs+='; '+progressRef;
ops[3].lines[3]='本番Google環境は教室側で用意。運用責任者・受入担当・連絡先は確定前。';
ops[3].refs+='; '+progressRef;
ops[4].lines[0]='1　受入検証は k-umezawa@ml-mightylink.com を使い、対象台帳と権限を確認。';
ops[4].refs+='; '+progressRef;
ops.splice(7,0,S('検証環境と本番環境の分離',[
'受入検証：k-umezawa@ml-mightylink.com。Googleアカウント表示を確認済み。',
'本番運用：教室側で運用用Googleアカウントを用意。共有方法と管理者を決める。',
'既存Sheetは発見済み。内容・紐付けGAS・操作権限の確認は接続障害で未完了。',
'検証用キーやテストデータを本番へ流用せず、本番設定と受入結果を記録する。'],progressRef));
ops.push(S('残作業ごとの報告と資料更新',[
'AT-23から1件ずつ進め、結果と根拠を確かめてから次の項目へ進む。',
'各項目で結果・証跡・変更PowerPoint・次作業・依頼事項を1つの報告にまとめる。',
'小林さん向け文面と添付資料を保存。未完了の項目や障害の状況も報告する。',
'毎日18時の下書きも継続。外部へ直接送信せず、送信記録は実際の送信後に残す。'],progressRef));
user[1].lines[2]='実Google連携は受入前です。教室から利用開始の案内を受けてから使います。';
user[1].refs+='; '+progressRef;
user[10].lines[3]='正式な接続先、連絡先、利用ルールは教室の利用開始案内で確認してください。';
user[10].refs+='; '+progressRef;
task[2].lines[0]='確定：受入は会社アカウント。本番は教室側で運用用Googleアカウントを準備。';
task[2].refs+='; '+progressRef;
task[3].lines[0]='状態：BLOCKED。会社アカウントのログイン確認済み。AT-23の実操作は未実施。';
task[3].lines[1]='前提確認中：既存Sheetを発見。接続エラーで台帳の内容は未確認。';
task[3].refs+='; '+progressRef;
task[10].lines[3]='3資料をv4へ改版。受入後に実URL、担当、連絡先、開始日を追記して版を確定。';
task[11].lines[3]='各項目で結果・証跡・変更PowerPoint・次作業・依頼事項の送信用一式を保存。';
task[11].refs+='; '+progressRef;
task.push(S('現在の障害と次の1件',[
'AT-23：Google再ログインは完了。Apps ScriptとDriveで会社アカウントを確認済み。',
'既存Sheetを開く際のブラウザー接続がタイムアウト。別タブでも改善せず調査中。',
'次作業：接続を復旧し、台帳の内容・紐付けGAS・権限・既定カレンダーを確認。',
'Googleへの書込、GAS配備、初期化は未実施。AT-23合格や運用開始とは扱わない。'],progressRef));
const progress=[
S('進捗報告　初期状況', ['Mauro & Brenda Taxi Link','小林さん向け　2026年10月20日','AT-23の前提確認中。受入完了の報告ではありません。'],progressRef),
S('現在までの成果',[
'運用・ユーザー・残作業の3資料をv4へ更新。今回の進捗報告を添付する。',
'テスト公開版は当日の7 URL照合でHTTP200・保存ファイルとの一致を確認。',
'過去実績はローカル22件・公開追加23件合格。実Google受入の残り8件は未完了。',
'会社アカウントの再ログイン完了。Apps ScriptとDriveのアカウント表示を確認。'],progressRef+'; docs/progress/2026-10-20.md'),
S('AT-23の前提確認と接続障害',[
'受入用：k-umezawa@ml-mightylink.com。Driveで既存の送迎関連Sheetを発見。',
'台帳を操作する接続にエラーが発生。別タブでも解消せず、内容は未確認。',
'Googleへの書込・GAS配備・初期化は行っていない。AT-23はBLOCKEDのまま。',
'次は接続を復旧し、台帳と紐付けGAS、権限、配備先を確認してからAT-23へ進む。'],progressRef),
S('残り8件の実施順と報告',[
'1〜3：AT-23 台帳への保存、AT-24 実カレンダーへの予約、AT-25 取消同期。',
'4〜6：AT-26 端末と家庭の権限、AT-27 同時完了、AT-28 バックアップ復旧。',
'7〜8：AT-29 実機受入、本番公開の条件を満たした後にAT-30 スモーク確認。',
'1件ごとに結果・証跡・更新資料・次作業・依頼事項を報告。18時も下書きを作る。'],progressRef),
S('教室への準備依頼',[
'正式リリース用に、教室側で運用用Googleアカウントをご用意ください。',
'台帳・GAS・既定カレンダーの所有者と、管理する方・共有方法をご確認ください。',
'利用開始日、受入担当、問い合わせ先は結果と準備状況を踏まえて決定します。',
'現時点では運用開始前です。会社での受入と教室の本番準備を分けて進めます。'],progressRef)
];
function text(slide,value,x,y,w,h,size=28,color='#183431',bold=false){const s=slide.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});s.text=value;s.text.style={typeface:'Yu Gothic',fontSize:size,color,bold};return s;}
const result=[];
for(const [name,data] of [['operation-manual',ops],['user-manual',user],['remaining-tasks',task],['progress-report-step-01',progress]]){
 const p=Presentation.create({slideSize:{width:1280,height:720}});
 for(const [i,d] of data.entries()){
  const s=p.slides.add();s.background.fill=i===0?'#123D35':'#F9FAF6';
  if(i===0){text(s,d.title,76,172,1128,105,58,'#FFFFFF',true);text(s,d.lines.join('\n'),80,340,1100,225,28,'#DCECE2');}
  else {text(s,d.title,64,54,1152,80,42,'#123D35',true);
   if(d.shot){let bytes=await fs.readFile(d.shot.endsWith('AT-21-form.png')?build+'/form-detail.png':root+'/'+d.shot);s.images.add({blob:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),contentType:'image/png',alt:d.title+'（合成データのローカル試験画面）',fit:'contain',position:{left:630,top:150,width:585,height:470}});d.lines.forEach((t,k)=>text(s,t,64,166+k*135,530,124,27));text(s,'画面例：合成データによるローカル試験',630,626,585,36,18,'#677A71');}
   else d.lines.forEach((t,k)=>text(s,t,72,166+k*112,1136,100,29));
  }
  text(s,`${String(i+1).padStart(2,'0')} / ${data.length}`,1120,675,110,30,17,i===0?'#DCECE2':'#677A71');
  s.speakerNotes.text=`根拠（リポジトリ相対パス）: ${d.refs}\n基準日: 2026-10-20 JST。実装確認と既存試験記録に基づく。実Google受入は未実施。${d.shot?'\n画面出典: '+d.shot+'。合成データ、ローカル試験の画面例。':''}`;
 }
 await fs.mkdir(build+'/v4/'+name,{recursive:true});
 const candidate=build+'/v4/'+name+'/candidate.pptx';
 await (await PresentationFile.exportPptx(p)).save(candidate);
 const final=out+'/'+name+'-2026-10-20-v4r.pptx';
 await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:py,integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Yu Gothic']},verifyArtifactToolImport:true,receiptPath:build+'/v4/'+name+'/validation-v4r.json',explicitTotalSlideCount:data.length,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[]});
 for(const [i,s] of p.slides.items.entries()){const png=await p.export({slide:s,format:'png',scale:1});await fs.writeFile(build+'/v4/'+name+'/'+String(i+1).padStart(2,'0')+'.png',new Uint8Array(await png.arrayBuffer()));}
 result.push({name,path:final,slides:data.length});console.log(JSON.stringify(result.at(-1)));
}
await fs.writeFile(build+'/result-v4.json',JSON.stringify(result,null,2));
await fs.writeFile(build+'/content-v4.json',JSON.stringify({ops,user,task,progress},null,2));




