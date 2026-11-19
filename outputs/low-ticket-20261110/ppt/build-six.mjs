import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Presentation, PresentationFile, FileBlob} from '@oai/artifact-tool';
const root=process.cwd(), tmp=path.resolve('outputs/daily-six-20261111/ppt'), final=path.resolve('docs/deliverables/2026-11-10-premeeting/progress-2026-11-11-cumulative-six.pptx');
const runtime=path.resolve(path.dirname(process.execPath),'../..'), skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.22356/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const p=Presentation.create({slideSize:{width:1280,height:720}}),s=p.slides.add();
s.background.fill='#FFFFFF';
function t(value,x,y,w,h,size,bold=false,color='#102D52'){const a=s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=value;a.text.style={typeface:'Yu Gothic',fontSize:size,color,bold,verticalAlignment:'middle',wrap:'none',insets:0};}
t('送迎管理システム　進捗資料・夜間追補',65,26,1150,33,21,true,'#047E79');
t('11月10〜11日の修正と受入試験',64,78,1150,64,47,true);
t('画面の修正　累計6件',65,173,525,40,29,true);
t('予約時は残数が減らないことを明記。',65,218,556,38,24);
t('入口を間違えたときの案内を追加。',65,254,556,38,24);
t('デモの予定はブラウザ内だけに保存と表示。',65,290,577,38,24);
t('開発側の受入試験　累計6項目',675,173,540,40,29,true);
t('予約：台帳の予定とカレンダーが一致。',675,218,555,38,24);
t('取消：予定が消え、残り8回に変化なし。',675,254,575,38,24);
t('復旧：一部の式は戻り、保護設定は戻らず。',675,290,576,38,24);
t('残り2枚から管理者にも警告。',65,326,560,38,24);
t('残り3・2・1・0枚で警告の境界を確認。',675,326,570,38,24);
t('日付変更後に当日一覧を更新。',65,362,560,34,23);
t('当日一覧：日付更新と地図リンク。',675,362,570,34,23);
t('チケット金額を1円単位で入力可能に。',65,398,580,34,23);
t('チケット：入力金額と追加記録を確認。',675,398,570,34,23);
t('公開画面の確認',65,459,900,32,22,true,'#047E79');
s.images.add({blob:new Uint8Array(await fs.readFile(path.join(tmp,'public-at12.png'))),contentType:'image/png',alt:'11月11日の当日一覧。匿名デモの公開画面を中央でトリミング',fit:'cover',position:{left:65,top:501,width:1150,height:82}});
t('11月10日4件、11日2件を実装。日付境界の模擬試験と公開画面確認を分離。',65,604,1160,34,23);
t('小林さんによる確認は 0/6 件。本番運用は開始していません。',65,652,1160,35,24,true);
s.speakerNotes.text='11/10〜11/11継続累計6。11/11単日の6件ではない。先行2修正はClaude Code Fable5.2、追加4修正はCodex。AT-24/25は管理者として実Google台帳と検証カレンダーを照合。AT-28は複数シートの部分確認。デモ表示3点は顧客・実Google試験に加算しない。証跡: docs/progress/2026-11-11-cumulative-six.md。公開版・実測値は累計6件の記録を参照。AT12日付境界は模擬時計、公開デモは当日1件と地図URLを確認。正本r18および現行12冊とは別の追補。';
const c=path.join(tmp,'candidate.pptx');await(await PresentationFile.exportPptx(p)).save(c);
await finalizePresentation({workspaceDir:root,candidatePath:c,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:1,receiptPath:path.join(tmp,'validation.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));await fs.writeFile(path.join(tmp,'final.png'),new Uint8Array(await(await q.export({slide:q.slides.items[0],format:'png',scale:1})).arrayBuffer()));




