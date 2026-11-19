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


const {ops,user}=JSON.parse(await fs.readFile(build+'/content-v4.json','utf8'));
const ref='docs/TEST_ENVIRONMENT_ACCESS.md; scripts/prepare_at23_access.ps1; docs/progress/2026-10-20-step-05.md';
ops[1].lines[1]='AT-23はPASS。AT-24〜30の7件は未合格で、本番リリースは保留。';
ops[7].lines[2]='検証GAS v1配備・Web生徒保存を確認。Calendar権限は未付与。';
ops[1].refs=ref;ops[7].refs=ref;
ops.splice(8,0,S('検証環境のログインURL',[
'検証担当者専用。画面を開くURL： https://eigo-taxi-test.web.app/',
'「教室の接続先URL」へ入力するGAS URL：',
'https://script.google.com/macros/s/AKfycbznxkg_f_7ddHdopFZfN0OlFDsxoFoi67OslKNQ93ipkWZLq-tj1jAsxz_uxNo2jBtwFg/exec',
'教室の本番用URL・本人専用キーは別途準備。検証設定を本番へ流用しない。'],ref));
ops.splice(9,0,S('検証用管理者キーのコピー',[
'既存キーを保存したWindows端末・ユーザーで、リポジトリを開いて実行：',
'.\\scripts\\prepare_at23_access.ps1 -Action CopyKey -UserId admin-01',
'実行後は表示文をコピーせず、「アクセスキー」欄でそのままCtrl+Vしログイン。',
'CopyKeyはログインキー、Prepareはサーバー設定JSON。貼り付ける場所が違う。'],ref));
ops.splice(10,0,S('検証キーの保管と別端末での利用',[
'保存先：%USERPROFILE%\\.codex\\private\\eigo-taxi-at23-access.json.dpapi',
'Windows CurrentUser DPAPIで保護。同じ端末・同じWindowsユーザーで使う。',
'別端末や保存ファイルなしの場合は担当者へ確認。Prepareで勝手に作り直さない。',
'admin-01/02は管理者、parent-01/02は家庭検証用。実保護者には配布しない。'],ref));
user.push(S('検証担当者向けのログイン案内',[
'検証用の画面URL： https://eigo-taxi-test.web.app/',
'接続先GAS URLと既存キー取得：docs/TEST_ENVIRONMENT_ACCESS.md を参照。',
'家庭の検証はCopyKeyのUserIdをparent-01またはparent-02へ変更する。',
'実保護者は教室から届く正式URL・本人専用キーを使用。検証キーは共有しない。'],ref));
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
 await fs.mkdir(build+'/v8/'+name,{recursive:true});
 const candidate=build+'/v8/'+name+'/candidate.pptx';
 await (await PresentationFile.exportPptx(p)).save(candidate);
 const final=out+'/'+name+'-2026-10-20-v8.pptx';
 await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:py,integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Yu Gothic']},verifyArtifactToolImport:true,receiptPath:build+'/v8/'+name+'/validation.json',explicitTotalSlideCount:data.length,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[]});
 for(const [i,s] of p.slides.items.entries()){const png=await p.export({slide:s,format:'png',scale:1});await fs.writeFile(build+'/v8/'+name+'/'+String(i+1).padStart(2,'0')+'.png',new Uint8Array(await png.arrayBuffer()));}
 result.push({name,path:final,slides:data.length});console.log(JSON.stringify(result.at(-1)));
}
await fs.writeFile(build+'/result-v8.json',JSON.stringify(result,null,2));
await fs.writeFile(build+'/content-v8.json',JSON.stringify({ops,user},null,2));




