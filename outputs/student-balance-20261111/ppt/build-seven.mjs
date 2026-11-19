import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';

const root = process.cwd();
const buildDir = path.dirname(fileURLToPath(import.meta.url));
const runtime = path.resolve(path.dirname(process.execPath), '../..');
process.env.RUNTIME_NODE_MODULES = path.join(runtime, 'node/node_modules');
const skillDir = 'C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1110.11258/skills/presentations';
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, 'container_tools/artifact_tool_utils.mjs')).href);
const deliverables = path.resolve('docs/deliverables/2026-11-10-premeeting');
const previous = path.join(deliverables, 'progress-2026-11-11-cumulative-six.pptx');
const publish = process.argv.includes('--final');
const check = publish ? JSON.parse(await fs.readFile(path.join(buildDir, '../public-ui.json'), 'utf8')) : {};
const release = publish ? JSON.parse(await fs.readFile(path.join(buildDir, '../stage/docs/acceptance/deployment/public-verification.json'), 'utf8')) : {};
if (publish && !release.pass) throw Error('Public release bytes unverified');
const status = publish ? (check.fractionalRejected && check.integerRegistered ? '公開デモでも1.5枚を拒否し、10枚で登録。' : '検証サイトに反映。公開画面での操作確認は保留。') : '検証サイトへの反映は再認証待ち。';
const p = await PresentationFile.importPptx(await FileBlob.load(previous));
const s = p.slides.items[0];
function replace(oldText, newText) {
  const a = s.shapes.items.find(shape => shape.text.toString() === oldText);
  if (!a) throw Error('Missing reference text: ' + oldText);
  a.text.replace(oldText, newText);
  return a;
}
function row(text, left, width) {
  const shape = s.shapes.add({geometry:'rect', position:{left, top:434, width, height:34}, fill:'none', line:{fill:'none',width:0}});
  shape.text = text;
  shape.text.style = {typeface:'Yu Gothic',fontSize:23,color:'#102D52',verticalAlignment:'middle',wrap:'none',insets:0};
}
replace('送迎管理システム　進捗資料・夜間追補','送迎管理システム　11月11日 打ち合わせ資料');
replace('画面の修正　累計6件','画面の修正　累計7件');
replace('開発側の受入試験　累計6項目','開発側の受入試験　累計7項目');
row('生徒登録で初期枚数の小数切り捨てを修正。',65,600);
row('生徒登録：1.5枚を拒否し、10枚で保存。',675,550);
const heading = replace('公開画面の確認','検証サイトの当日一覧（先行試験の画面）');
heading.position = {left:65,top:480,width:1150,height:32};
s.images.items[0].position = {left:65,top:518,width:1150,height:82};
replace('11月10日4件、11日2件を実装。日付境界の模擬試験と公開画面確認を分離。','11月10日に4件、11日に3件を修正。'+status);
s.speakerNotes.text = '11月10～11日の継続累計。先行2修正はClaude Code Fable 5.2（依頼者申告）、追加5修正はCodex。予約・取消は同じ1件を管理者の検証用Google台帳とカレンダーで確認。復旧は一部のみ。日付の境界は模擬時計、公開デモで一覧・地図リンクを確認。開発側ではAT-02の小数・空欄・負数拒否と10枚での登録を実フォームと架空保存領域で確認。'+status+' 図は先行AT-12の公開デモ。出典 docs/progress/2026-11-11-cumulative-seven.md。小林さんご本人による正式な確認は0/6件。';
const candidate = path.join(buildDir,publish?'candidate-final.pptx':'candidate-waiting.pptx');
await (await PresentationFile.exportPptx(p)).save(candidate);
const output = publish ? path.join(deliverables,'progress-2026-11-11-cumulative-seven.pptx') : path.join(buildDir,'preview/pending-review.pptx');
await fs.mkdir(path.dirname(output), {recursive:true});
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:output,pythonExecutable:path.join(runtime,'python/python.exe'),integrityValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:1,receiptPath:path.join(buildDir,publish?'validation.json':'pending-validation.json')});
const imported = await PresentationFile.importPptx(await FileBlob.load(output));
const png = await imported.export({slide:imported.slides.items[0],format:'png',scale:1});
await fs.writeFile(path.join(buildDir,publish?'final.png':'pending.png'),new Uint8Array(await png.arrayBuffer()));
