import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob, PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(), build=path.join(root,'outputs/ppt-20261103-v26');
const dest=path.join(root,'docs/deliverables/2026-10-23-traceability');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1026.10807/skills/presentations';
const python='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
process.env.RUNTIME_NODE_MODULES='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const replacements={
 progress:[
  ['専用生徒・送迎・購入3行を復元し、除去後に対象範囲を照合。', '対象3行の値復元・除去後、実行前の限定範囲と一致。\nバックアップの主要3タブは提供画像で確認。\n別の接続は正しいIDでも403。数式・書式の照合は未実施。\n会社アカウントで両シートをEdgeで開く操作を依頼中。\n実台帳全体・Calendar整合は未確認。AT-28全体は未合格。\n第三者受入0/30、本番HOLD。'],
  ['11/3：公開7ファイルの既配備版との一致を再確認。', 'AT-24：台帳上のイベントIDで予約と予定を紐付け。\n予定本文への予約ID表示の要否は確認待ち。\nGoogleを模擬したGAS試験は70/70合格。\n第三者向け隔離試験手順を準備、旧ランナーは使用保留。\n実Google受入AT-24〜30未完、第三者受入0/30。\nCalendar権限未追加・本番未開始。リリース判定：HOLD。']
 ],
 tasks:[
  ['架空1行3セルの値・数式・数値形式の復元と再計算は限定PASS。', '架空1行3セルの値・数式・数値形式の復元は限定PASS。\n既存バックアップは3タブ確認。別接続は403で比較未実施。'],
  ['Calendar', null]
 ]
};
// Only the unique exact backup block is changed in the task deck; progress provides detail.
replacements.tasks.pop();
for(const name of ['tasks','progress']){
 const source=path.join(dest,`${name}-2026-11-03-v25.pptx`), final=path.join(dest,`${name}-2026-11-03-v26.pptx`), run=path.join(build,name);
 await fs.mkdir(run,{recursive:true});
 const p=await PresentationFile.importPptx(await FileBlob.load(source));
 const records=(await p.inspect({kind:'slide,textbox,shape',maxChars:400000})).ndjson.split('\n').filter(Boolean).map(JSON.parse);
 for(const [needle,replacement] of replacements[name]){
  const matches=records.filter(x=>x.text?.includes(needle));
  if(matches.length!==1) throw Error(`${name}: found ${matches.length} matches for ${needle}`);
  p.resolve(matches[0].id).text.replace(matches[0].text,replacement);
  console.log(JSON.stringify({name,id:matches[0].id,slideIndex:matches[0].slideIndex}));
 }
 for(let i=0;i<p.slides.items.length;i++) await fs.writeFile(path.join(run,`${i+1}.png`),new Uint8Array(await (await p.export({slide:p.slides.items[i],format:'png',scale:1})).arrayBuffer()));
 const inspection=await p.inspect({kind:'slide,textbox,shape',maxChars:400000});
 await fs.writeFile(path.join(run,'inspect.ndjson'),inspection.ndjson);
 const candidate=path.join(run,'candidate.pptx');await (await PresentationFile.exportPptx(p)).save(candidate);
 const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:python,integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],verifyArtifactToolImport:true,receiptPath:path.join(run,'validation.json'),explicitTotalSlideCount:name==='tasks'?10:7});
 console.log(JSON.stringify({name,result}));
}
