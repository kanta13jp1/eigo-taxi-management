import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const root='C:/Users/kanta/GitHub/eigo-taxi-management';
const build=root+'/.manual-build-20261020',out=root+'/docs/deliverables/2026-10-20-manuals';
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1017.22135/skills/presentations';
const py='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const {ops,user,tasks,progress,spec}=JSON.parse(await fs.readFile(build+'/content-v10.json','utf8'));
// Current browser evidence uses synthetic local data. Deployment status stays explicit.
tasks[1].lines[1]='GAS v2とテストWebを配備。公開版のソース一致を確認。';
progress[2].lines[3]='テストWebの配備と配信ファイル一致を確認。画面証跡は別紙に保存。';
spec[5].lines[1]='ローカル画面とQR読取を検証。テストWebの配信ファイル一致を確認。';
ops[22].lines[1]='2　型検査・lint・build、GAS回帰とポータル回帰を実行する。';
ops[23].lines[1]='公開版はfrontend-deployment.jsonで照合。再現には保存ソースも必要。';
ops[24].lines[0]='次はAT-24から1件ずつ進め、結果と根拠を確かめてから次の項目へ進む。';
const shotRoot='docs/acceptance/role-portals-2026-10-20/';
ops[3].shot=shotRoot+'admin-local.png';ops[3].lines=ops[3].lines.slice(0,3);
ops[26].shot=shotRoot+'qr-local.png';ops[26].lines=['管理者の「個別URL・QR」で配布先のご家庭を選択。','URLをコピー、またはQR画像を保存して本人に配布。','キーと接続先は別に案内。ご家庭名を確認して渡す。'];
user[3].shot=shotRoot+'parent-local.png';user[3].lines=['ご自身のお子様だけを表示します。','残チケット数、予約中の送迎、過去の利用履歴を確認できます。','ほかの家庭や管理者の画面に切り替えるボタンはありません。'];
function text(slide,value,x,y,w,h,size=28,color='#183431',bold=false){const s=slide.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});s.text=value;s.text.style={typeface:'Yu Gothic',fontSize:size,color,bold};return s;}
const result=[];
for(const [name,data] of [['operation-manual',ops],['user-manual',user],['remaining-tasks',tasks],['progress-report-role-portals',progress],['portal-spec-supplement',spec]]){
 const p=Presentation.create({slideSize:{width:1280,height:720}});
 for(const [i,d] of data.entries()){
  const s=p.slides.add();s.background.fill=i===0?'#123D35':'#F9FAF6';
  if(i===0){text(s,d.title,76,172,1128,110,54,'#FFFFFF',true);text(s,d.lines.join('\n'),80,340,1100,225,28,'#DCECE2');}
  else{ text(s,d.title,64,54,1152,85,40,'#123D35',true);
   if(d.shot){const b=await fs.readFile(root+'/'+d.shot);s.images.add({blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:'image/png',alt:d.title+'（ローカルの架空データ）',fit:'contain',position:{left:620,top:152,width:600,height:460}});d.lines.forEach((t,k)=>text(s,t,64,170+k*135,520,125,26));text(s,'画面例：ローカル・架空データ',620,627,600,32,18,'#677A71');}
   else d.lines.forEach((t,k)=>text(s,t,72,166+k*112,1136,102,(t.startsWith('https://script.')||t.startsWith('.\\scripts')||t.startsWith('保存先：'))?24:28));
  }
  text(s,`${String(i+1).padStart(2,'0')} / ${data.length}`,1120,675,110,30,17,i===0?'#DCECE2':'#677A71');
  s.speakerNotes.text=`根拠（リポジトリ相対パス）: ${d.refs}\n基準日2026-10-20。GAS v2は同じexecへ配備済。Calendar未付与。AT-23の既存PASSを保持し、AT-24〜30は未合格。フロント公開状況はdocs/acceptance/role-portals-2026-10-20を参照。${d.shot?'\n画面出典: '+d.shot+'。ローカル・架空データの確認画面。':''}`;
 }
 const staging=build+'/v10-release/'+name;await fs.mkdir(staging,{recursive:true});
 const candidate=staging+'/candidate.pptx';await (await PresentationFile.exportPptx(p)).save(candidate);
 const final=out+'/'+name+'-2026-10-20-v10.pptx';
 await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:py,integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Yu Gothic']},verifyArtifactToolImport:true,receiptPath:staging+'/validation.json',explicitTotalSlideCount:data.length,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[]});
 for(const [i,s] of p.slides.items.entries()){const png=await p.export({slide:s,format:'png',scale:1});await fs.writeFile(staging+'/'+String(i+1).padStart(2,'0')+'.png',new Uint8Array(await png.arrayBuffer()));}
 result.push({name,path:final,slides:data.length});console.log(JSON.stringify(result.at(-1)));
}
await fs.writeFile(build+'/result-v10.json',JSON.stringify(result,null,2));
await fs.writeFile(build+'/content-v10-final.json',JSON.stringify({ops,user,tasks,progress,spec},null,2));
