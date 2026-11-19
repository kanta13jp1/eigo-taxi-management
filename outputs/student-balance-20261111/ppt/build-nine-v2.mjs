import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),tmp=path.resolve('outputs/daily-nine-20261111/ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1110.11258/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
await fs.mkdir(tmp,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(path.resolve('docs/deliverables/2026-11-10-premeeting/progress-2026-11-11-cumulative-eight-v2.pptx'))),s=p.slides.items[0];
function find(t){const sh=s.shapes.items.find(x=>x.text.toString()===t);if(!sh)throw Error('Missing text '+t);return sh;}
find('画面の修正　累計8件').text.replace('累計8件','累計9件');
find('開発側の受入試験　累計8項目').text.replace('累計8項目','累計9項目');
for(const [text,x,w]of [['送り予約に合う時刻の見出しへ修正。',65,600],['送り予約：17:30・区分・残数不変を確認。',675,550]]){const sh=s.shapes.add({geometry:'rect',position:{left:x,top:466,width:w,height:30},fill:'none',line:{fill:'none',width:0}});sh.text=text;sh.text.style={typeface:'Yu Gothic',fontSize:22,color:'#102D52',verticalAlignment:'middle',wrap:'none',insets:0};}
find('検証サイトの当日一覧（先行試験の画面）').position={left:65,top:510,width:1150,height:32};
s.images.items[0].position={left:65,top:548,width:1150,height:50};
const footer=s.shapes.items.find(x=>x.text.toString().startsWith('先行2件：Claude Code Fable 5.2'));
footer.text='先行2件：Claude Code Fable 5.2 ／ 追加7件：Codex';
const day=s.shapes.add({geometry:'rect',position:{left:65,top:634,width:1150,height:26},fill:'none',line:{fill:'none',width:0}}); day.text='全9件の日別内訳：11月10日4件、11月11日5件'; day.text.style={typeface:'Yu Gothic',fontSize:21,color:'#102D52',verticalAlignment:'middle',wrap:'none',insets:0};
find('小林さんによる確認は 0/6 件。本番運用は開始していません。').position={left:65,top:668,width:1150,height:32};
s.speakerNotes.text='11月10〜11日の継続累計9修正・開発側9項目実施。先行2件Claude Code Fable5.2、追加7件Codex。図は先行AT12の公開画面で9件目の証跡ではない。AT28部分確認、顧客0/6、本番HOLD。AT07の送り予約の時刻欄が旧版でお迎え時間と表示された。9件目の再現・修正・公開確認はdocs/progress/2026-11-11-cumulative-nine.md参照。会議で共有した段階的小林6件→先生合同テスト→教室Google環境で移行判断の方針は会議記録を参照し、自動本番移行はしない。';
const candidate=path.join(tmp,'candidate.pptx'),final=path.resolve('docs/deliverables/2026-11-10-premeeting/progress-2026-11-11-cumulative-nine-v2.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:1,receiptPath:path.join(tmp,'validation-v2.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));await fs.writeFile(path.join(tmp,'final-v2.png'),new Uint8Array(await(await q.export({slide:q.slides.items[0],format:'png',scale:1})).arrayBuffer()));

