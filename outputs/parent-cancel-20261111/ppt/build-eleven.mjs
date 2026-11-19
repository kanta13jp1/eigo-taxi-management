import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),tmp=path.resolve('outputs/parent-cancel-20261111/ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1110.11258/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const base=path.resolve('docs/deliverables/2026-11-10-premeeting');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(base,'progress-2026-11-11-cumulative-ten.pptx'))),s=p.slides.items[0];
for(const sh of s.shapes.items){for(const [a,b] of [['累計10件','累計11件'],['累計10項目','累計11項目'],['追加8件','追加9件'],['全10件','全11件'],['11月11日6件','11月11日7件']])if(sh.text.toString().includes(a))sh.text.replace(a,b);}
function label(slide,t,x,y,w,h,sz,bold=false){const sh=slide.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=t;sh.text.style={typeface:'Yu Gothic',fontSize:sz,bold,color:'#102D52',verticalAlignment:'middle',insets:0};}
label(s,'取消確認に生徒・日時・送迎種別を表示。',65,522,605,27,21);
label(s,'保護者取消：対象1件だけ取消（模擬）。',675,522,550,27,21);
s.speakerNotes.text='11月10日に4件、11日に7件。開発側は累計11項目実施。AT-28は部分確認。先行2修正の担当は依頼者申告。';
const e=p.slides.add();
label(e,'保護者が取り消す予約を確認できるように',55,18,1190,55,34,true);
label(e,'公開デモ：田中さん・11月11日16:00・往復送迎を確認画面に表示。',55,82,1180,38,24);
label(e,'模擬試験：確定で対象1件のみ取消。他の予約・残高は不変。公開での取消確定は未確認。',55,125,1190,38,21);
e.images.add({blob:await fs.readFile(path.join(tmp,'../public-before.png')),contentType:'image/png',fit:'contain',alt:'公開デモ：確認前の予約3件。今回作成したAT10取消確認用の往復予約。',position:{left:90,top:172,width:1100,height:499}});
label(e,'確認前の公開画面。AT10の架空予約を追加し、予約中は2件から3件に。',80,672,1120,36,19);
e.speakerNotes.text='11件目・AT-10。実Googleへの書き込みなし。公開確認は取消対象の表示まで。顧客本人確認0/6、本番保留。';
const candidate=path.join(tmp,'candidate.pptx'),final=path.join(base,'progress-2026-11-11-cumulative-eleven.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:3,receiptPath:path.join(tmp,'validation.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));for(let i=0;i<3;i++)await fs.writeFile(path.join(tmp,'final-'+(i+1)+'.png'),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));