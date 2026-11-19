import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),tmp=path.resolve('outputs/daily-eight-20261111/ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1110.11258/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
await fs.mkdir(tmp,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(path.resolve('docs/deliverables/2026-11-10-premeeting/progress-2026-11-11-cumulative-seven.pptx'))),s=p.slides.items[0];
function find(t){const sh=s.shapes.items.find(x=>x.text.toString()===t);if(!sh)throw Error('Missing text '+t);return sh;}
find('画面の修正　累計7件').text.replace('累計7件','累計8件');
find('開発側の受入試験　累計7項目').text.replace('累計7項目','累計8項目');
const left=['予約時は残数が減らないことを明記。','入口を間違えたときの案内を追加。','デモの予定はブラウザ内だけに保存と表示。','残り2枚から管理者にも警告。','日付変更後に当日一覧を更新。','チケット金額を1円単位で入力可能に。','生徒登録で初期枚数の小数切り捨てを修正。'];
const right=['予約：台帳の予定とカレンダーが一致。','取消：予定が消え、残り8回に変化なし。','復旧：一部の式は戻り、保護設定は戻らず。','残り3・2・1・0枚で警告の境界を確認。','当日一覧：日付更新と地図リンク。','チケット：入力金額と追加記録を確認。','生徒登録：1.5枚を拒否し、10枚で保存。'];
for(const [items,x,w] of [[left,65,600],[right,675,550]])items.forEach((t,i)=>{const sh=find(t);sh.position={left:x,top:218+31*i,width:w,height:30};sh.text.style={typeface:'Yu Gothic',fontSize:22,color:'#102D52',verticalAlignment:'middle',wrap:'none',insets:0};});
for(const [text,x,w]of [['チケット金額の不正入力を0円に変換しない。',65,600],['不正追加：不正な金額を拒否、0円は許可。',675,550]]){const sh=s.shapes.add({geometry:'rect',position:{left:x,top:435,width:w,height:30},fill:'none',line:{fill:'none',width:0}});sh.text=text;sh.text.style={typeface:'Yu Gothic',fontSize:22,color:'#102D52',verticalAlignment:'middle',wrap:'none',insets:0};}
const footer=s.shapes.items.find(x=>x.text.toString().startsWith('11月10日に4件、11日に3件を修正。'));
footer.text='11月10日に4件、11日に4件を修正。模擬試験・公開デモ・実Googleを区別。';
s.speakerNotes.text='11月10〜11日の継続累計8修正・開発側8項目実施。先行2件Claude Code Fable5.2、追加6件Codex。図は先行AT12の画面で8件目の証跡ではない。AT28部分確認、顧客0/6、本番HOLD。8件目の旧版では金額1eが0へ変換される。AT17と公開匿名デモの実測はdocs/progress/2026-11-11-cumulative-eight.md参照。明示0円は有効。';
const candidate=path.join(tmp,'candidate.pptx'),final=path.resolve('docs/deliverables/2026-11-10-premeeting/progress-2026-11-11-cumulative-eight.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:1,receiptPath:path.join(tmp,'validation.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));await fs.writeFile(path.join(tmp,'final.png'),new Uint8Array(await(await q.export({slide:q.slides.items[0],format:'png',scale:1})).arrayBuffer()));
