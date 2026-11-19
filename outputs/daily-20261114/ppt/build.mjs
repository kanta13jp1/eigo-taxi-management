import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),dir=path.resolve('outputs/daily-20261114/ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1112.11011/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const base=path.resolve('docs/deliverables/2026-11-10-premeeting');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(base,'progress-2026-11-13-cumulative-twentytwo.pptx'))),s=p.slides.items[0],t=p.slides.items[1];
function label(slide,text,x,y,w,h,sz,bold=false){const sh=slide.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=text;sh.text.style={typeface:'Yu Gothic',fontSize:sz,bold,color:'#102D52',verticalAlignment:'middle',insets:0};return sh;}
for(const sh of s.shapes.items){const text=sh.text.toString();
 if(text.includes('11月13日'))sh.text=text.replace('11月13日','11月14日');
 if(text.includes('実装修正22件'))sh.text='11月10～14日の実装修正23件';
 if(text.startsWith('修正 1～11'))sh.text='修正 1～12';
 if(text.startsWith('修正 12～22'))sh.text='修正 13～23';
 if(text.includes('追加20件'))sh.text=text.replace('追加20件','追加21件');
 if(text.startsWith('全22件の日別内訳'))sh.text='全23件の日別内訳：10日4件、11日8件、12日8件、13日2件、14日1件';
 const m=text.match(/^(\d+)\. /);if(m){const i=Number(m[1]);sh.position={...sh.position,left:i<=12?65:675,top:210+((i-1)%12)*29,height:29};}
}
label(s,'23. 保護者の取消確認に送迎先・備考を表示。',675,500,550,29,21);
for(const sh of t.shapes.items){const text=sh.text.toString();
 if(text.includes('開発側で実施した受入試験22項目'))sh.text='開発側の受入試験22項目と追加確認';
 if(text.startsWith('11. AT-10'))sh.text='11. AT-10 保護者取消・公開追加確認';
 if(text.startsWith('AT-28・AT-03は部分確認'))sh.text='AT-28・AT-03は部分確認。AT-10は公開匿名デモで取消確定を追加確認。';
}
s.speakerNotes.text='修正23件。先行2件ユーザー申告のClaude Code Fable 5.2、追加21件Codex。日別11/10=4、11/11=8、11/12=8、11/13=2、11/14=1。顧客0/6、本番保留。';
t.speakerNotes.text='異なる開発側試験IDは22項目。11月14日は既存AT-10を再検証し、23項目目として重複計上しない。公開匿名デモで保護者取消の確定・対象外不変・残数不変・再読込保持を確認。実Google、実機、顧客本人確認は別管理。AT-28/AT-03は部分確認、AT-18は取消と再取得経路の部分確認。';
p.slides.items[3].speakerNotes.text+='\n2026-11-14追記：AT-10の公開匿名デモの取消確定は16ページで追加確認。本ページは以前の確認範囲を保持。';
const e=p.slides.add();
label(e,'送迎先・備考を確認して取り消す',55,18,1190,55,34,true);
label(e,'同じ日時の予約でも、取り消す対象を見分けられます',55,80,1190,42,25);
e.images.add({blob:await fs.readFile(path.resolve('outputs/daily-20261114/public-confirmation.png')),contentType:'image/png',fit:'contain',alt:'保護者の取消確認画面。生徒、日時、送迎先、備考と戻る・取消を確定ボタン。隔離した架空データ。',position:{left:65,top:140,width:470,height:500}});
label(e,'1  対象の「キャンセル」を押す',590,160,620,55,29,true);
label(e,'2  生徒・日時・送迎先・備考を照合',590,250,620,65,29,true);
label(e,'3  「取消を確定」を1回押す',590,350,620,60,29,true);
label(e,'「戻る」・Escでは取り消しません。\n取消でチケットは減りません。',590,455,610,95,25);
label(e,'公開匿名デモで確認。実Google連携・実機・顧客確認は別管理。顧客用データ維持・本番未開始。',55,675,1180,30,19);
e.speakerNotes.text='11月14日 AT-10再検証。旧版は日時・生徒・区分が同じ2予約で確認文が同一。修正後は送迎先と備考を表示。初期フォーカス戻る、Escape・最初のEnter・戻るでは書込なしと元ボタンへフォーカス復帰。明示確定の連続操作は1回書込、対象だけ取消、残数不変、再読込後も維持。匿名モバイル画面幅での技術検証であり実機・実Google・顧客合格を代替しない。';
const candidate=path.join(dir,'candidate.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:path.join(dir,'delivery/public-review.pptx'),pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:16,receiptPath:path.join(dir,'validation.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(path.join(dir,'delivery/public-review.pptx')));
for(const i of [0,1,15])await fs.writeFile(path.join(dir,'final-'+(i+1)+'.png'),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));



