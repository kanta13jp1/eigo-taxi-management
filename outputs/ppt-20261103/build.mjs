import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob, PresentationFile} from '@oai/artifact-tool';

const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1026.10807/skills/presentations';
const root=process.cwd(), build=path.join(root,'outputs/ppt-20261103'), dest=path.join(root,'docs/deliverables/2026-10-23-traceability');
const python='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
process.env.RUNTIME_NODE_MODULES='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const edits={
 progress:[
  ['sh/ul4vaxgb', '11/3：検証サイトの公開7ファイルを再取得し、\n既配備版のハッシュとの一致を確認（公開物のみ）。\n会社管理者・iPhone管理者2の表示等は本人報告で確認済み。\n自然障害時の認証再試行と過去のiPhoneエラー原因は未確認。\nCalendar権限未追加・本番未開始。'],
  ['sh/ahkvi1cb', '専用生徒・送迎・購入3行を復元し、除去後に対象範囲を照合。\n架空シート1行3セルの値・数式・数値形式は限定復元済み。\n既存バックアップを会社アカウントで閲覧、主要3タブを画像確認。\n別のDrive接続は404。原因と数式・書式・復元先照合は未確認。\n実台帳全体・Calendar整合は未確認。AT-28全体は未合格。\n第三者受入0/30、本番HOLD。'],
  ['sh/xcz2l03q', '11/3：公開7ファイルの既配備版との一致を再確認。\n既存バックアップの閲覧と主要3タブを提供画像で確認。\n第三者受入準備：AT-06は過去日、AT-19/24等の手順は未確定。\nAT-30は本番後の確認：本番前30件との判定方法は未決。\n実Google受入AT-24〜30未合格、第三者受入0/30。\nCalendar権限未追加・本番未開始。リリース判定：HOLD。']
 ],
 tasks:[
  ['sh/50v2pgna', '架空1行3セルの値・数式・数値形式の復元と再計算は限定PASS。\n既存バックアップの閲覧・主要3タブを画像確認。全体復元は未完。']
 ]
};
for(const name of ['tasks','progress']){
 const source=path.join(dest,`${name}-2026-10-30-v24.pptx`);
 const final=path.join(dest,`${name}-2026-11-03-v25.pptx`);
 const run=path.join(build,name);await fs.mkdir(run,{recursive:true});
 const p=await PresentationFile.importPptx(await FileBlob.load(source));
 const info=(await p.inspect({kind:'slide,textbox,shape',maxChars:300000})).ndjson.split('\n').filter(Boolean).map(JSON.parse);
 for(const [id,replacement] of edits[name]){
   const obj=info.find(x=>x.id===id); if(!obj?.text) throw new Error('Missing target '+id);
   p.resolve(id).text.replace(obj.text,replacement);
 }
 for(let i=0;i<p.slides.items.length;i++){
   const blob=await p.export({slide:p.slides.items[i],format:'png',scale:1});
   await fs.writeFile(path.join(run,`${i+1}.png`),new Uint8Array(await blob.arrayBuffer()));
 }
 const inspect=await p.inspect({kind:'slide,textbox,shape',maxChars:300000});
 await fs.writeFile(path.join(run,'inspect.ndjson'),inspect.ndjson);
 const candidate=path.join(run,'candidate.pptx');await (await PresentationFile.exportPptx(p)).save(candidate);
 const result=await finalizePresentation({
   workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:python,
   integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
   layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
   layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],
   verifyArtifactToolImport:true,receiptPath:path.join(run,'validation.json'),
   explicitTotalSlideCount:name==='tasks'?10:7
 });
 console.log(name,JSON.stringify(result));
}
