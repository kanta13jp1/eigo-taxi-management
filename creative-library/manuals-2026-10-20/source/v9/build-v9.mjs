import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const root='C:/Users/kanta/GitHub/eigo-taxi-management';
const build=root+'/.manual-build-20261020';
const out=root+'/docs/deliverables/2026-10-20-manuals';
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1017.31632/skills/presentations';
const py='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const shots='docs/acceptance/runs/2026-10-19T16-59-40-731Z/';
const S=(title,lines,refs,shot)=>({title,lines,refs,shot});
const auth='docs/GAS_AUTH_SETUP.md; gas/Code.gs';
const status='docs/acceptance/16_SEQUENTIAL_ACCEPTANCE.md';
const ui='src/App.tsx; src/components/TeacherDashboard.tsx; src/components/ParentPortal.tsx';



const {ops,user}=JSON.parse(await fs.readFile(build+'/content-v8.json','utf8'));
const ref='docs/TEST_ENVIRONMENT_ACCESS.md; src/App.tsx; gas/Code.gs';
ops.splice(11,0,S('検証用台帳と元の台帳',[
'接続先：Mighty AT-23 検証専用 2026-10-20。Webの読み書き先。',
'元の台帳：Mauro & Brenda 送迎チケット管理台帳。検証Webには未接続。',
'両台帳は自動同期しない。元台帳を本番とは扱わず、教室の本番環境は別途準備。',
'入力先は通常の3タブ。AT23生成証跡のタブはアプリへの入力先ではない。'],ref));
ops.splice(12,0,S('台帳を直接編集した後の確認',[
'検証台帳・通常タブ・IDを確認。バックアップし、同時操作を止めて修正。',
'保存完了後にWebをF5／再読み込み。同じID・日時の行を確認。自動更新はない。',
'予約行の生徒名だけを変えても、生徒台帳・他の予約の氏名は変わらない。',
'直接編集でカレンダーやチケットは連動しない。日常操作はWeb画面で行う。'],ref+'; docs/OPERATION_RUNBOOK.md'));
user.push(S('教室で修正した内容を表示するには',[
'修正の連絡を受けたらブラウザーを再読み込み（PCはF5）。自動更新はない。',
'同じお子様・予約日時を確認。変わらない場合は教室へ連絡する。',
'検証担当者：Webの接続先は「Mighty AT-23 検証専用 2026-10-20」。',
'コピー元の台帳とは自動同期しない。実保護者は教室が案内する本番環境を使う。'],ref+'; docs/USER_GUIDE.md'));
function text(slide,value,x,y,w,h,size=28,color='#183431',bold=false){const s=slide.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});s.text=value;s.text.style={typeface:'Yu Gothic',fontSize:size,color,bold};return s;}
const result=[];
for(const [name,data] of [['operation-manual',ops],['user-manual',user]]){
 const p=Presentation.create({slideSize:{width:1280,height:720}});
 for(const [i,d] of data.entries()){
  const s=p.slides.add();s.background.fill=i===0?'#123D35':'#F9FAF6';
  if(i===0){text(s,d.title,76,172,1128,105,58,'#FFFFFF',true);text(s,d.lines.join('\n'),80,340,1100,225,28,'#DCECE2');}
  else {text(s,d.title,64,54,1152,80,42,'#123D35',true);
   if(d.shot){let bytes=await fs.readFile(d.shot.endsWith('AT-21-form.png')?build+'/form-detail.png':root+'/'+d.shot);s.images.add({blob:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),contentType:'image/png',alt:d.title+'（合成データのローカル試験画面）',fit:'contain',position:{left:630,top:150,width:585,height:470}});d.lines.forEach((t,k)=>text(s,t,64,166+k*135,530,124,27));text(s,'画面例：合成データによるローカル試験',630,626,585,36,18,'#677A71');}
   else d.lines.forEach((t,k)=>text(s,t,72,166+k*112,1136,100,(t.startsWith('https://script.')||t.startsWith('.\\scripts')||t.startsWith('保存先：'))?24:29));
  }
  text(s,`${String(i+1).padStart(2,'0')} / ${data.length}`,1120,675,110,30,17,i===0?'#DCECE2':'#677A71');
  s.speakerNotes.text=`根拠（リポジトリ相対パス）: ${d.refs}\n基準日: 2026-10-20 JST。実装確認と既存試験記録に基づく。AT-23 PASS、AT-24〜30は未合格。${d.shot?'\n画面出典: '+d.shot+'。合成データ、ローカル試験の画面例。':''}`;
 }
 await fs.mkdir(build+'/v9-final/'+name,{recursive:true});
 const candidate=build+'/v9-final/'+name+'/candidate.pptx';
 await (await PresentationFile.exportPptx(p)).save(candidate);
 const final=out+'/'+name+'-2026-10-20-v9-final.pptx';
 await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:py,integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Yu Gothic']},verifyArtifactToolImport:true,receiptPath:build+'/v9-final/'+name+'/validation.json',explicitTotalSlideCount:data.length,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[]});
 for(const [i,s] of p.slides.items.entries()){const png=await p.export({slide:s,format:'png',scale:1});await fs.writeFile(build+'/v9-final/'+name+'/'+String(i+1).padStart(2,'0')+'.png',new Uint8Array(await png.arrayBuffer()));}
 result.push({name,path:final,slides:data.length});console.log(JSON.stringify(result.at(-1)));
}
await fs.writeFile(build+'/result-v9.json',JSON.stringify(result,null,2));
await fs.writeFile(build+'/content-v9.json',JSON.stringify({ops,user},null,2));





