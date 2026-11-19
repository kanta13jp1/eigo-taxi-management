import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),dir=path.resolve('outputs/daily-twentyone-20261113/ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1112.11011/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const base=path.resolve('docs/deliverables/2026-11-10-premeeting');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(base,'progress-2026-11-12-cumulative-twenty.pptx'))),s=p.slides.items[0],t=p.slides.items[1];
function label(slide,text,x,y,w,h,sz,bold=false){const sh=slide.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=text;sh.text.style={typeface:'Yu Gothic',fontSize:sz,bold,color:'#102D52',verticalAlignment:'middle',insets:0};return sh;}
for(const sh of s.shapes.items){const text=sh.text.toString();
 if(text.includes('送迎管理システム　11月12日'))sh.text='送迎管理システム　11月13日 進捗資料';
 if(text.includes('実装修正20件'))sh.text='11月10～13日の実装修正21件';
 if(text.startsWith('修正 1～'))sh.text='修正 1～11';
 if(text.startsWith('修正 11'))sh.text='修正 12～21';
 if(text.includes('追加18件'))sh.text.replace('追加18件','追加19件');
 if(text.startsWith('全20件の日別内訳'))sh.text='全21件の日別内訳：10日4件、11日8件、12日8件、13日1件';
 const m=text.match(/^(\d+)\./);if(m){const n=Number(m[1]);sh.position={left:n<=11?65:675,top:210+32*(n<=11?n-1:n-12),width:n<=11?565:550,height:32};}
}
label(s,'21. 読めないデモ保存内容の上書きを防止。',675,498,550,32,21);
for(const sh of t.shapes.items){const text=sh.text.toString();if(text.includes('受入試験20項目'))sh.text='開発側で実施した受入試験21項目';const m=text.match(/^(\d+)\./);if(m){const n=Number(m[1]);sh.position={left:n<=11?65:675,top:165+36*(n<=11?n-1:n-12),width:n<=11?565:550,height:36};}}
label(t,'21. AT-22 再読込保持・読取不能時の保護',675,489,550,36,21);
s.speakerNotes.text='修正21件。先行2件ユーザー申告のClaude Code Fable 5.2、追加19件Codex。日別11/10=4、11/11=8、11/12=8、11/13=1。過去の20件を本日の実績へ数えない。顧客0/6、本番保留。';
t.speakerNotes.text='開発側試験21項目。AT-28/AT-03部分確認、AT-10保護者側の公開取消確定は未確認。AT-21は画面幅による試験。AT-22は隔離匿名ブラウザーでの正常登録・再読込・異常JSON注入・元内容保護。実Googleの復旧、スマートフォン実機、顧客確認を代替しない。';
const d=JSON.parse(await fs.readFile(path.join(dir,'slide-copy.json'),'utf8'));
const e=p.slides.add();
label(e,'読めない保存データを上書きせず保護',55,18,1190,55,34,true);
label(e,d.summary,55,82,1180,38,24);
label(e,d.result,55,125,1190,38,22);
e.images.add({blob:await fs.readFile(path.resolve(d.image)),contentType:'image/png',fit:'contain',alt:'公開匿名デモの隔離検証で保存データを読み取れない場合に登録を中止し、入力フォームと値を維持。',position:{left:90,top:170,width:1100,height:500}});
label(e,'隔離した匿名デモで異常を再現。顧客用データ維持。本番運用は開始していません。',65,675,1150,30,19);
e.speakerNotes.text=d.notes;
const candidate=path.join(dir,'candidate.pptx'),final=path.join(base,'progress-2026-11-13-cumulative-twentyone.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:14,receiptPath:path.join(dir,'validation.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));
for(let i=0;i<q.slides.items.length;i++)await fs.writeFile(path.join(dir,'final-'+(i+1)+'.png'),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));
