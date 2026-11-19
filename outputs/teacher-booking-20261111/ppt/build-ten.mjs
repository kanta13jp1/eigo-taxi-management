import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),tmp=path.resolve('outputs/teacher-booking-20261111/ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1110.11258/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
await fs.mkdir(tmp,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(path.resolve('docs/deliverables/2026-11-10-premeeting/progress-2026-11-11-cumulative-nine-v2.pptx'))),s=p.slides.items[0];
function find(t){const sh=s.shapes.items.find(x=>x.text.toString()===t);if(!sh)throw Error('Missing text '+t);return sh;}
find('画面の修正　累計9件').text.replace('累計9件','累計10件');
find('開発側の受入試験　累計9項目').text.replace('累計9項目','累計10項目');
for(const [t,x,w] of [['代理予約の5つの入力欄と項目名を対応付け。',65,600],['代理予約：先生登録の1件を再読込で確認。',675,550]]){
 const line=s.shapes.add({geometry:'rect',position:{left:x,top:494,width:w,height:30},fill:'none',line:{fill:'none',width:0}});
 line.text=t;line.text.style={typeface:'Yu Gothic',fontSize:22,color:'#102D52',verticalAlignment:'middle',wrap:'none',insets:0};
}
s.images.items[0].delete();
find('検証サイトの当日一覧（先行試験の画面）').delete();
s.shapes.add({geometry:'rect',position:{left:65,top:550,width:1150,height:2},fill:'#D1E2EF',line:{fill:'none',width:0}});
const evidence=p.slides.add();
function caption(text,x,y,w,h,size,bold=false){
 const sh=evidence.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 sh.text=text; sh.text.style={typeface:'Yu Gothic',fontSize:size,bold,color:'#102D52',verticalAlignment:'middle',insets:0};
}
caption('先生の代理予約を公開デモで確認',50,18,1180,56,34,true);
caption('5項目を名前で選択。住所の項目名を押すと、住所欄に移動。',50,82,1180,38,24);
caption('山本さんの予約を1件登録し、画面を開き直して「先生登録」を確認。',50,122,1180,38,24);
evidence.images.add({blob:await fs.readFile(path.join(tmp,'../public-result.png')),contentType:'image/png',alt:'公開管理者デモの一覧。AT09 西門の行に先生登録と表示。',fit:'contain',position:{left:160,top:172,width:960,height:540}});
evidence.speakerNotes.text='公開管理者デモ。11月11日16:00、架空生徒の山本さん、送迎場所はAT09 西門。7件から8件に増え、再読込後に先生登録を確認。';
find('先行2件：Claude Code Fable 5.2 ／ 追加7件：Codex').text.replace('追加7件','追加8件');
find('全9件の日別内訳：11月10日4件、11月11日5件').text='全10件の日別内訳：11月10日4件、11月11日6件';
s.speakerNotes.text='11月10〜11日累計10修正・開発側試験10項目。先行2件の担当は依頼者申告。AT-09は管理者代理予約の模擬試験と公開匿名デモ。公開では5項目の入力名を確認し、一覧7件から8件へ、再読込後に先生登録1件を表示。AT-28はバックアップの一部確認で保護設定の復旧は未確認。2枚目はAT-09の公開管理者デモ。小林さんの確認後に先生方と合同テスト、教室のGoogle環境の準備と移行判断へ進む。';
const candidate=path.join(tmp,'candidate.pptx'),final=path.resolve('docs/deliverables/2026-11-10-premeeting/progress-2026-11-11-cumulative-ten.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:2,receiptPath:path.join(tmp,'validation-v2.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));await fs.writeFile(path.join(tmp,'final-v2.png'),new Uint8Array(await(await q.export({slide:q.slides.items[0],format:'png',scale:1})).arrayBuffer()));


await fs.writeFile(path.join(tmp,'final-2.png'),new Uint8Array(await(await q.export({slide:q.slides.items[1],format:'png',scale:1})).arrayBuffer()));
