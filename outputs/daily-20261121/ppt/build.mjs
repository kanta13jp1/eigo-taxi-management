import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),daily=path.resolve('outputs/daily-20261121'),dir=path.join(daily,'ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1117.12345/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const receipt=JSON.parse((await fs.readFile(path.join(daily,'verified-release.json'),'utf8')).replace(/^\uFEFF/,''));
const base=path.resolve('docs/deliverables/2026-11-10-premeeting');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(base,'progress-2026-11-18-cumulative27.pptx')));
const slide=p.slides.add();
function box(text,left,top,width,height,fontSize,{bold=false,color='#102D52',fill='none',padding=0}={}){
 const item=slide.shapes.add({geometry:'rect',position:{left,top,width,height},fill,line:{fill:'none',width:0}});
 item.text=text;item.text.style={typeface:'Yu Gothic',fontSize,bold,color,verticalAlignment:'middle',insets:{left:padding,right:padding,top:0,bottom:0}};
}
box('進捗追補　2026年11月21日',55,28,1170,48,25,{bold:true,color:'#007DA6'});
box('選んだ規約を開き、キーボードで元の場所に戻れる',55,93,1180,58,34,{bold:true});
box('',55,159,1170,4,10,{fill:'#00A5D6'});
box('画面下部で項目を選ぶ',55,202,680,56,24,{bold:true,fill:'#E7F5FA',padding:18});
box('↓',72,267,48,32,24,{bold:true,color:'#0088B5'});
box('選んだ項目が開く',55,307,680,56,24,{bold:true,fill:'#E7F5FA',padding:18});
box('↓',72,372,48,32,24,{bold:true,color:'#0088B5'});
box('Escapeで閉じ、選んだボタンに戻る',55,412,680,56,24,{bold:true,fill:'#FFF1DC',padding:18});
box('公開デモで利用規約・個人情報の取扱い・免責事項を確認。',55,497,685,70,20);
box('累計39修正／公開・開発側の確認39項目',55,571,685,54,21,{bold:true});
box('顧客確認 0/6件　　本番運用は保留',55,653,680,34,20);
const shot=await fs.readFile(path.join(daily,'public-terms.png'));
slide.images.add({blob:shot,contentType:'image/png',alt:'幅375ピクセルの公開デモで個人情報の取扱いが開いた画面',position:{left:834,top:172,width:214,height:464}});
box('公開デモ・幅375px',822,645,250,36,18);
slide.speakerNotes.text='検証Hosting '+receipt.version+'。公開7応答のハッシュ一致。先行2修正はClaude Code Fable 5.2。今回の追加は公開デモの画面確認。Google連携や顧客確認には別途証跡が必要。前21ページは11月18日時点の記録。';
const candidate=path.join(dir,'candidate.pptx'),final=path.join(base,'progress-2026-11-21-cumulative39.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:22,receiptPath:path.join(dir,'validation.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));
await fs.writeFile(path.join(dir,'final-22.png'),new Uint8Array(await(await q.export({slide:q.slides.items[21],format:'png',scale:1})).arrayBuffer()));

