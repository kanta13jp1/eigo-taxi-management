import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,Presentation,PresentationFile} from '@oai/artifact-tool';
const root='C:/Users/kanta/GitHub/eigo-taxi-management',base=path.join(root,'docs/deliverables/2026-10-23-traceability'),assets=path.join(root,'outputs/visual-deck-work');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.11149/skills/presentations';
const python='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
process.env.RUNTIME_NODE_MODULES='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const id=process.argv[2], specs={requirements:['要件定義','REQ','期待すること','docs/acceptance/03_REQUIREMENTS.md'],design:['設計','FS','仕様・関連画面','docs/acceptance/04_FUNCTIONAL_SPEC.md'],'test-spec':['テスト仕様','TS','確認する操作','docs/acceptance/17_TEST_SPEC.md']};
if(!specs[id])throw Error('unknown deck');const [label,prefix,descLabel,ref]=specs[id];
const original=path.join(base,`${id}-2026-11-03-v27.pptx`),dest=path.join(base,`${id}-visual-2026-11-06-v4.pptx`),dir=path.join(root,'outputs/tech-redesign-v4-20261106',id);await fs.mkdir(dir,{recursive:true});
const imported=await PresentationFile.importPptx(await FileBlob.load(original));const originalN=imported.slides.items.length;if(originalN!==10)throw Error('unexpected slide count');
const inspect=(await imported.inspect({kind:'textbox',maxChars:900000})).ndjson.split('\n').filter(Boolean).map(JSON.parse);
const deck=Presentation.create({slideSize:{width:1280,height:720}});const C={navy:'#102D52',blue:'#00A6DF',orange:'#F78C1E',pale:'#EAF7FB',white:'#FFFFFF',dark:'#172637',gray:'#3E5366',line:'#D6E8EE'};
const sky=await fs.readFile(path.join(assets,'image.jpeg')),logo=await fs.readFile(path.join(assets,'image2.jpeg'));
const pictures={login:await fs.readFile(path.join(assets,'illustrations/login.png')),people:await fs.readFile(path.join(assets,'illustrations/people.png')),mobile:await fs.readFile(path.join(assets,'illustrations/mobile.png')),backup:await fs.readFile(path.join(assets,'illustrations/backup.png')),check:await fs.readFile(path.join(assets,'illustrations/checklist.png'))};
const illus={0:'login',1:'people',5:'mobile',6:'backup',7:'check'};const expected=[];
function rect(s,x,y,w,h,fill='none',stroke='none',width=0){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:stroke,width}})}
function text(s,v,x,y,w,h,size=20,color=C.dark,bold=false){let o=rect(s,x,y,w,h);o.text=v;o.text.style={typeface:'Yu Gothic',fontSize:size,color,bold,verticalAlignment:'middle',alignment:'left',wrap:'square',insets:0};return o}
function img(s,b,x,y,w,h,alt,mime='image/png',fit='contain'){s.images.add({blob:b,contentType:mime,alt,fit,position:{left:x,top:y,width:w,height:h}})}
for(let i=0;i<10;i++){
 const group=inspect.filter(r=>r.kind==='textbox'&&r.slideIndex===i&&r.position?.left===85).sort((a,b)=>a.position.top-b.position.top);const rows=[];
 for(let j=0;j<group.length;j+=2){let heading=group[j]?.text||'',description=group[j+1]?.text||'',m=heading.match(new RegExp(`^(${prefix}-\\d{2})\\s*(.*)$`));if(!m||!description)throw Error(`unmatched source ${id} slide ${i+1} ${heading}`);rows.push([m[1],m[2],description]);expected.push(m[1]);}
 if(rows.length!==(i===9?2:4))throw Error(`unexpected rows ${id} ${i+1}: ${rows.length}`);
 const s=deck.slides.add();s.background.fill=C.white;img(s,logo,50,13,174,55,'MightyLINK ロゴ','image/jpeg');text(s,`送迎管理システム　${label}（図解補足版）`,265,25,800,26,18,C.gray);
 img(s,sky,0,80,1280,135,'空の写真','image/jpeg','cover');rect(s,44,115,1192,80,C.white,C.blue,3);rect(s,46,115,1188,4,C.orange);
 text(s,`${label}：${rows[0][1]} ほか`,70,127,1120,53,29,C.navy,true);
 text(s,id==='test-spec'?'以下は検証担当者向けの確認手順です':'項目ごとに、内容と関連する確認を整理しています',70,220,1120,34,20,C.navy,true);
 const picture=illus[i];const contentWidth=picture?875:1140;const x=70,y=270,rowHeight=82,headHeight=36;
 rect(s,x,y,contentWidth,headHeight,C.blue);text(s,'項目',x+15,y+3,310,30,18,C.white,true);text(s,descLabel,x+330,y+3,contentWidth-350,30,18,C.white,true);
 rows.forEach((r,j)=>{let yy=y+headHeight+j*rowHeight;rect(s,x,yy,contentWidth,rowHeight-3,j%2?'#F8FAFB':'#EDF7FA',C.line,1);text(s,r[0],x+12,yy+6,90,24,15,C.gray,true);text(s,r[1],x+105,yy+5,210,rowHeight-14,18,C.navy,true);text(s,r[2],x+330,yy+4,contentWidth-345,rowHeight-11,17,C.dark);});
 if(picture){img(s,pictures[picture],970,315,225,205,'説明用イラスト');text(s,'イメージ',1100,525,100,20,13,C.gray);}
 if(i===9){rect(s,70,500,contentWidth,65,'#FFF7EA',C.orange,1);text(s,'詳しい条件や関連資料は、各項目の正本と元資料を確認してください。',85,508,contentWidth-30,50,17,C.gray);}
 if(id!=='test-spec'&&i<=3)text(s,'数値・件数は検証用の例です（初期残高などの前提によります）。',70,645,1140,25,16,C.gray);
 if(i>=5&&i<=7)text(s,'実Google連携・実機・第三者による受入は項目全体として未完了です。',70,645,1140,25,16,C.gray);
 if(id==='test-spec'&&i===1)text(s,'※ 日時・残数は検証用の例です。',70,645,1140,25,16,C.gray);
 rect(s,0,701,1280,19,C.navy);text(s,`${i+1} / 10　　2026年11月6日時点`,980,674,260,20,14,C.gray);
 const originalTexts=group.map(x=>x.text).join('\n');const originalNotes=imported.slides.items[i].speakerNotes.text||'';
 s.speakerNotes.text=`【元スライド本文】\n${originalTexts}\n\n【元スライドノート】\n${originalNotes}\n\n【図解版】\n参照元: ${ref} と ${path.basename(original)}。説明イラストは架空。実Google受入 AT-24〜30 は未完了。第三者0/30件。Calendar権限追加せず、本番未開始。`;
}
if(new Set(expected).size!==38)throw Error('38 unique source IDs required');
for(let i=0;i<10;i++)await fs.writeFile(path.join(dir,`${i+1}.png`),new Uint8Array(await (await deck.export({slide:deck.slides.items[i],format:'png',scale:1})).arrayBuffer()));
await fs.writeFile(path.join(dir,'inspect.ndjson'),(await deck.inspect({kind:'slide,textbox,shape',maxChars:900000})).ndjson);
const candidate=path.join(dir,'candidate.pptx');await (await PresentationFile.exportPptx(deck)).save(candidate);
const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:dest,pythonExecutable:python,integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],verifyArtifactToolImport:true,receiptPath:path.join(dir,'validation.json'),explicitTotalSlideCount:10});
console.log(JSON.stringify({id,output:dest,ids:expected.length,result}));
