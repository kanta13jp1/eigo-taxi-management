import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),dir=path.resolve('outputs/daily-twenty-20261112/ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1111.10934/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const base=path.resolve('docs/deliverables/2026-11-10-premeeting');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(base,'progress-2026-11-12-cumulative-nineteen.pptx'))),s=p.slides.items[0],t=p.slides.items[1];
function label(slide,text,x,y,w,h,sz,bold=false){const sh=slide.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=text;sh.text.style={typeface:'Yu Gothic',fontSize:sz,bold,color:'#102D52',verticalAlignment:'middle',insets:0};return sh;}
for(const sh of s.shapes.items){const text=sh.text.toString();
 if(text.includes('実装修正19件'))sh.text='11月10～12日の実装修正20件';
 if(text.startsWith('修正 1～'))sh.text='修正 1～10';
 if(text.startsWith('修正 10'))sh.text='修正 11～20';
 if(text.includes('追加17件'))sh.text.replace('追加17件','追加18件');
 if(text.startsWith('全19件の日別内訳'))sh.text='全20件の日別内訳：11月10日4件、11日8件、12日8件';
 const m=text.match(/^(\d+)\./);if(m){const n=Number(m[1]);sh.position={left:n<=10?65:675,top:210+36*((n-1)%10),width:n<=10?565:550,height:36};}
}
label(s,'20. スマホ幅でも送迎場所の全文を表示。',675,534,550,36,21);
for(const sh of t.shapes.items){const text=sh.text.toString();if(text.includes('受入試験19項目'))sh.text='開発側で実施した受入試験20項目';const m=text.match(/^(\d+)\./);if(m){const n=Number(m[1]);sh.position={left:n<=10?65:675,top:165+40*((n-1)%10),width:n<=10?565:550,height:40};}}
label(t,'20. AT-21 375px幅で住所全文・取消操作',675,525,550,40,21);
s.speakerNotes.text='修正20件。先行2件ユーザー申告のClaude Code Fable 5.2、追加18件Codex。日別4/8/8。顧客0/6、本番保留。';
t.speakerNotes.text='開発側試験20項目。AT-28/AT-03部分確認、AT-10保護者側の公開取消確定は未確認。AT-21はブラウザー375px幅で表示確認。スマートフォン実機・実Google・顧客確認を代替しない。';
const d=JSON.parse(await fs.readFile(path.join(dir,'slide-copy.json'),'utf8'));
const e=p.slides.add();
label(e,'小さい画面でも送迎場所を全文表示',55,18,1190,55,34,true);
label(e,d.summary,55,82,1180,38,24);
label(e,d.result,55,125,1190,38,22);
label(e,'修正前（ローカル375px幅）',90,175,520,35,24,true);
label(e,'反映後（公開375px幅）',700,175,520,35,24,true);
e.images.add({blob:await fs.readFile(path.resolve(d.beforeImage)),contentType:'image/png',fit:'contain',alt:'修正前のローカル保護者デモ。長い送迎場所を省略。',position:{left:90,top:215,width:490,height:440}});
e.images.add({blob:await fs.readFile(path.resolve(d.image)),contentType:'image/png',fit:'contain',alt:'375px幅の公開保護者デモで長い送迎場所を折り返して表示。',position:{left:700,top:215,width:490,height:440}});
label(e,'ブラウザーの画面幅で確認。スマートフォン実機は別確認。顧客用データ維持・本番未開始。',65,675,1150,30,19);
e.speakerNotes.text=d.notes;
const candidate=path.join(dir,'candidate.pptx'),final=path.join(base,'progress-2026-11-12-cumulative-twenty.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:13,receiptPath:path.join(dir,'validation.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));
for(let i=0;i<q.slides.items.length;i++)await fs.writeFile(path.join(dir,'final-'+(i+1)+'.png'),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));
