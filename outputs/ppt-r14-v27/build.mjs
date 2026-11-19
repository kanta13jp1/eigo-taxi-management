import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(), build=path.join(root,'outputs/ppt-r14-v27');
const dest=path.join(root,'docs/deliverables/2026-10-23-traceability');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1026.10807/skills/presentations';
const python='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
process.env.RUNTIME_NODE_MODULES='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const rows=JSON.parse(await fs.readFile(path.join(root,'docs/traceability/presentations.json'),'utf8'));
const id=process.argv[2];const row=rows.find(x=>x.id===id);if(!row)throw Error('Unknown deck '+id);
const name=path.basename(row.path).split('-2026-')[0],run=path.join(build,name);await fs.mkdir(run,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(root,row.path)));
const edits={
 'PKG-01':[['sh/p0zmlk7u','新規予定の説明欄に予約IDを表示する変更はローカルのみ。実Google受入・配備は未完了。'],['sh/0zu9ora5','[手動] 判定条件と責任者承認\n運用開始は別途判断'],['sh/2hkfu9w3','現在：AT24〜30未合格、第三者0/30。\n管理者2名の再ログインは確認済み。\nAT-30の本番後判定と公開前条件は調整待ち。']],
 'PKG-02':[['sh/bq547yhw','予定説明の予約IDと台帳が一致。日時・場所とイベントIDを照合。']],
 'PKG-03':[['sh/bq547yhw','画面 D01, E02, E03。IF-02, IF-13。予定説明の予約IDを台帳と照合。']],
 'PKG-04':[['sh/bq547yhw','台帳イベントIDで予定を特定し、説明欄の予約ID・日時・場所を照合。']],
 'PKG-05':[['sh/bq547yhw','台帳イベントIDで予定を特定し、説明欄の予約ID・日時・場所を照合。'],['sh/50v2pgna','架空1行3セルの復元は限定PASS。\n両シートは本人が表示。操作接続タイムアウトで書式等は未比較。']],
 'PKG-06':[['sh/bq547yhw','gas/Code.gs :: createReservation_（予定説明に予約ID）']],
 'PKG-07':[['sh/bq547yhw','GAS-67（予約ID・重複防止を模擬確認）']],
 'PKG-08':[['sh/bq547yhw','予定説明の予約IDと台帳が一致。日時・場所とイベントIDを照合。']],
 'PKG-09':[['sh/bq547yhw','台帳のイベントIDで予定を特定。説明欄の予約ID・日時・場所を照合。']],
 'PKG-10':[['sh/bq547yhw','予定説明欄の予約IDと台帳を照合。変更は検証環境への反映待ち。']],
 'PKG-12':[['sh/ahkvi1cb','対象3行の値復元・除去後、限定範囲が実行前と一致。\n本人がバックアップ・検証台帳の2シートを表示。\nこちらのブラウザー初期化タイムアウトで数式・書式は未比較。\n実台帳全体・Calendar整合は未確認。AT-28全体は未合格。\n第三者受入0/30、本番HOLD。'],['sh/xcz2l03q','AT-24：新規予定の説明欄に予約IDを表示する仕様へ決定。\nローカル実装・独立AIレビュー・GAS模擬70/70合格。\nGAS未配備、実Google連携は未確認。既存予定への遡及なし。\n第三者向け隔離試験を準備、旧ランナーは使用保留。\n実Google受入AT-24〜30未完、第三者受入0/30。\nCalendar権限未追加・本番未開始。リリース判定：HOLD。']]
};
const rec=(await p.inspect({kind:'slide,textbox,shape',maxChars:900000})).ndjson.split('\n').filter(Boolean).map(JSON.parse);
for(const [sid,newText] of edits[id]||[]){const old=rec.find(x=>x.id===sid);if(!old?.text)throw Error(id+' missing '+sid);p.resolve(sid).text.replace(old.text,newText);console.log(JSON.stringify({deck:id,slideIndex:old.slideIndex,id:sid}));}
for(const slide of p.slides.items){const old=slide.speakerNotes.text||'';slide.speakerNotes.text=['【2026-11-03 r14 最新仕様】新規カレンダー予定の説明欄に予約IDを表示し、台帳の予約IDと一致させる。台帳のイベントIDから予定を特定し、日時・場所も照合する。変更はローカルのみ・GAS未配備、実Google未検証。既存予定は遡及変更しない。GAS模擬70/70・独立AIレビューは実受入ではない。AT-24〜30未完、第三者0/30、Calendar権限未追加・本番HOLD。AT-28は本人が2シートを表示したが、ブラウザー初期化タイムアウトにより数式・書式比較未実施。以下は当時点の履歴を含み、現在の状態は本追補と正本文書を優先。',old].filter(Boolean).join('\n');}
for(let i=0;i<p.slides.items.length;i++)await fs.writeFile(path.join(run,`${i+1}.png`),new Uint8Array(await (await p.export({slide:p.slides.items[i],format:'png',scale:1})).arrayBuffer()));
await fs.writeFile(path.join(run,'inspect.ndjson'),(await p.inspect({kind:'slide,textbox,shape',maxChars:900000})).ndjson);
const candidate=path.join(run,'candidate.pptx');await (await PresentationFile.exportPptx(p)).save(candidate);
const final=path.join(dest,`${name}-2026-11-03-v27.pptx`);
const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:python,integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],verifyArtifactToolImport:true,receiptPath:path.join(run,'validation.json'),explicitTotalSlideCount:row.slides});
console.log(JSON.stringify({deck:id,result}));
