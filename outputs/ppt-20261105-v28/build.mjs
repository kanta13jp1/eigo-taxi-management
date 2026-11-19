import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(), build=path.join(root,'outputs/ppt-20261105-v28');
const dest=path.join(root,'docs/deliverables/2026-10-23-traceability');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1103.10131/skills/presentations';
const python='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
process.env.RUNTIME_NODE_MODULES='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const configs=[
 {name:'tasks',count:10,needle:'架空1行3セルの復元は限定PASS。',newText:'主要3シート189セル：値とExcel形式の比較書式は一致。\n数式0件。全ブック・Google固有書式・Calendarは未確認。'},
 {name:'progress',count:7,needle:'対象3行の値復元・除去後、限定範囲が実行前と一致。',newText:'主要3シートの先頭8行をExcel形式で照合（試験3行を除外）。\n189セルの値・型・比較した書式に差なし。数式は0件。\n条件付き書式・入力規則・全ブック・Calendarは未確認。\n実台帳の数式復元は未検証。AT-28全体は部分確認。\n第三者受入0/30、本番HOLD。'}
];
const note='【2026-11-05 AT-28比較追補】会社アカウントで検証台帳と2026-10-23バックアップを開き、Excel形式に出力して主要3シートの各先頭8行を比較。バックアップ内の試験3行はID確認、現行台帳側の対応行は空であることを確認し除外。残り189セルは値・型、フォント・塗り・罫線・配置・保護・数値形式に差なし。範囲内の数式は両方0件で、実台帳の数式復元の証明にはならない。Excel変換を経ており、Google固有の条件付き書式・入力規則・寸法、全ブックおよびCalendar整合は未確認。AT-28は部分確認、第三者受入0/30、本番HOLD。詳細は docs/acceptance/backup-restore-2026-10-23/README.md。';
for(const cfg of configs){
 const run=path.join(build,cfg.name);await fs.mkdir(run,{recursive:true});
 const source=path.join(dest,`${cfg.name}-2026-11-03-v27.pptx`);
 const p=await PresentationFile.importPptx(await FileBlob.load(source));
 const before=(await p.inspect({kind:'slide,textbox,shape',maxChars:900000})).ndjson.split('\n').filter(Boolean).map(JSON.parse);
 const matches=before.filter(x=>x.text?.includes(cfg.needle));if(matches.length!==1)throw Error(`${cfg.name}: ${matches.length} matching shapes`);
 const hit=matches[0];p.resolve(hit.id).text.replace(hit.text,cfg.newText);
 const slide=p.slides.items[hit.slideIndex];
 if(!slide)throw Error('invalid slide index');
 slide.speakerNotes.text=[note,slide.speakerNotes.text||''].join('\n');
 for(let i=0;i<p.slides.items.length;i++)await fs.writeFile(path.join(run,`${i+1}.png`),new Uint8Array(await (await p.export({slide:p.slides.items[i],format:'png',scale:1})).arrayBuffer()));
 await fs.writeFile(path.join(run,'inspect.ndjson'),(await p.inspect({kind:'slide,textbox,shape',maxChars:900000})).ndjson);
 const candidate=path.join(run,'candidate.pptx');await (await PresentationFile.exportPptx(p)).save(candidate);
 await fs.mkdir(path.join(build,'final'),{recursive:true});
 const final=path.join(build,'final',`${cfg.name}-2026-11-05-v28.pptx`);
 const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:python,integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],verifyArtifactToolImport:true,receiptPath:path.join(run,'validation.json'),explicitTotalSlideCount:cfg.count});
 console.log(JSON.stringify({name:cfg.name,slideIndex:hit.slideIndex,result}));
}
