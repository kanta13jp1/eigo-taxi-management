import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root='C:/Users/kanta/GitHub/eigo-taxi-management';
const work=path.join(root,'outputs/tech-visual-20261106');
const source=path.join(root,'docs/deliverables/2026-10-23-traceability');
const asset=path.join(root,'outputs/visual-deck-work');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.11149/skills/presentations';
const python='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
process.env.RUNTIME_NODE_MODULES='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const id=process.argv[2];
const specs={
 business:{title:'送迎業務の全体像',subtitle:'人が行うこととシステムが行うこと',image:'people',ref:'docs/acceptance/01_BUSINESS_FLOWS.md',steps:[['保護者','都度、送迎を予約'],['教室の管理者','予定を確認し、送迎を実施'],['管理者とシステム','完了後、残数を更新']],notice:'片道1枚・往復2枚。予約・取消の時点では消費しません。'},
 requirements:{title:'求められることの全体像',subtitle:'教室と家庭で使うための主な要件',image:'login',ref:'docs/acceptance/03_REQUIREMENTS.md',steps:[['教室','利用者・予定を管理'],['各家庭','家庭の情報だけを確認'],['チケット','完了登録で残数を更新']],notice:'カレンダーとの実際の連携は受入未完了です。'},
 design:{title:'システムの仕組み',subtitle:'画面から記録・連携先へつながる流れ',image:'backup',ref:'docs/acceptance/04_FUNCTIONAL_SPEC.md',steps:[['画面','管理者・家庭が操作'],['認証と処理','本人と権限を確認'],['台帳・連携','台帳へ記録し連携']],notice:'カレンダーの実連携は未検証。予定の予約ID追記はローカル変更です。'},
 'test-spec':{title:'確認の進め方',subtitle:'模擬環境と実際の環境を分けて確認します',image:'checklist',ref:'docs/acceptance/17_TEST_SPEC.md',steps:[['自動テスト','プログラムの動作を確認'],['実環境の確認','Google連携・端末を確認'],['第三者による受入','開発者以外が操作して確認']],notice:'実Google受入未完了。第三者0／30件、うち1件は公開後確認です。'}
};
const spec=specs[id];if(!spec)throw Error('unknown deck');
const original=path.join(source,`${id}-2026-11-03-v27.pptx`);
const dest=path.join(source,`${id}-visual-2026-11-06-${id==='business'?'v2':'v2'}.pptx`);
const dir=path.join(work,id);await fs.mkdir(dir,{recursive:true});
const presentation=await PresentationFile.importPptx(await FileBlob.load(original));
const n=presentation.slides.items.length;
const colors={navy:'#102D52',blue:'#00A6DF',orange:'#F78C1E',white:'#FFFFFF',pale:'#EAF7FB',gray:'#3E5366',warning:'#FFF7EA'};
const slide=presentation.slides.add();slide.background.fill=colors.white;
function box(x,y,w,h,fill='none',border='none',g='rect',sw=0){return slide.shapes.add({geometry:g,position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:border,width:sw}})}
function txt(t,x,y,w,h,size=22,color=colors.navy,bold=false,align='left'){let o=box(x,y,w,h);o.text=t;o.text.style={typeface:'Yu Gothic',fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',insets:0};return o}
function img(b,x,y,w,h,alt,mime='image/png',fit='contain'){slide.images.add({blob:b,contentType:mime,alt,fit,position:{left:x,top:y,width:w,height:h}})}
const sky=await fs.readFile(path.join(asset,'image.jpeg'));const logo=await fs.readFile(path.join(asset,'image2.jpeg'));const icon=await fs.readFile(path.join(asset,`illustrations/${spec.image}.png`));
img(logo,50,13,174,55,'MightyLINK ロゴ','image/jpeg');txt('送迎管理システム　資料の読み方',265,25,700,25,18,colors.gray);
img(sky,0,80,1280,135,'空の写真','image/jpeg','cover');box(44,115,1192,80,colors.white,colors.blue,'rect',3);box(46,115,1188,4,colors.orange);txt(spec.title,70,127,1120,53,32,colors.navy,true);
txt(spec.subtitle,70,235,1080,38,23,colors.navy,true);
img(icon,60,315,265,215,'説明用イラスト');txt('イメージ',195,535,120,20,14,colors.gray,false,'right');
for(let j=0;j<3;j++){let x=360+j*285;box(x,320,250,130,colors.pale,colors.blue,'rect',1);txt(spec.steps[j][0],x+12,333,226,38,23,colors.navy,true,'center');txt(spec.steps[j][1],x+12,377,226,59,18,colors.gray,false,'center');if(j<2)txt('→',x+250,355,35,44,27,colors.orange,true,'center')}
box(70,610,1140,55,colors.warning,colors.orange,'rect',1);txt(spec.notice,85,616,1110,42,19,colors.navy);
box(0,701,1280,19,colors.navy);txt('一般向けの概要｜詳しくは元の各ページをご覧ください',70,670,780,20,14,colors.gray);txt(`${n+1} / ${n+1}`,1100,670,120,20,14,colors.gray,false,'right');
slide.speakerNotes.text=`一般向けの概要を補足。${spec.ref}、既存資料 ${path.basename(original)}。説明用イラストは架空。実Google受入 AT-24〜30 と第三者受入は未完了。Calendar権限は追加せず、本番運用未開始。`;
for(let i=0;i<presentation.slides.items.length;i++){await fs.writeFile(path.join(dir,`${i+1}.png`),new Uint8Array(await (await presentation.export({slide:presentation.slides.items[i],format:'png',scale:1})).arrayBuffer()));}
const candidate=path.join(dir,'candidate.pptx');await (await PresentationFile.exportPptx(presentation)).save(candidate);
const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:dest,pythonExecutable:python,integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],verifyArtifactToolImport:true,receiptPath:path.join(dir,'validation-v2.json'),explicitTotalSlideCount:n+1});
console.log(JSON.stringify({id,n,output:dest,result}));
