import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=process.cwd(),dir=path.resolve('outputs/daily-twentyfour-20261114/ppt');
const runtime=path.resolve(path.dirname(process.execPath),'../..');
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1112.11011/skills/presentations';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const base=path.resolve('docs/deliverables/2026-11-10-premeeting');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(base,'progress-2026-11-14-daily.pptx'))),s=p.slides.items[0],t=p.slides.items[1];
function label(slide,text,x,y,w,h,sz,bold=false){const sh=slide.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});sh.text=text;sh.text.style={typeface:'Yu Gothic',fontSize:sz,bold,color:'#102D52',verticalAlignment:'middle',insets:0};return sh;}
const d=JSON.parse(await fs.readFile(path.join(dir,'slide-copy.json'),'utf8'));
for(const sh of s.shapes.items){const text=sh.text.toString();
 if(text.includes('実装修正23件'))sh.text='11月10～14日の実装修正24件';
 if(text.startsWith('修正 13～23'))sh.text='修正 13～24';
 if(text.includes('追加21件'))sh.text=text.replace('追加21件','追加22件');
 if(text.startsWith('全23件の日別内訳'))sh.text='全24件の日別内訳：10日4件、11日8件、12日8件、13日2件、14日2件';
}
label(s,'24. 認証が失効した際の再ログインを案内。',675,529,550,29,21);
for(const sh of t.shapes.items){const text=sh.text.toString();
 if(text.includes('開発側の受入試験22項目'))sh.text='開発側で実施した受入試験24項目';
 const m=text.match(/^(\d+)\. /);if(m){const i=Number(m[1]);sh.position={...sh.position,left:i<=12?65:675,top:165+((i-1)%12)*34,height:34};}
 if(text.startsWith('AT-24・25は実Google'))sh.text='AT-24・25は実Googleの限定確認。AT-19・20は架空データ・模擬応答で確認。';
}
label(t,'23. AT-19 未認証拒否・認証失効の案内',675,505,550,34,21);
label(t,'24. AT-20 家庭別表示・他家庭操作を拒否',675,539,550,34,21);
s.speakerNotes.text='累計24修正。先行2件ユーザー申告のClaude Code Fable 5.2、追加22件Codex。11/10=4、11/11=8、11/12=8、11/13=2、11/14=2。顧客確認0/6、本番保留。';
t.speakerNotes.text='異なる技術試験IDは24項目。既存22にAT-19/AT-20を追加し、同日のAT-10再検証は重複計上しない。AT-19/20は架空データと模擬API応答による範囲を記録し、実Google認証・家庭別アクセスの本番受入を代替しない。AT-28/AT-03/AT-18は引き続き部分確認。';
const e=p.slides.add();
label(e,'ログイン状態を確認できないときの案内',55,18,1190,55,34,true);
label(e,'個人情報を消し、再ログインを案内します',55,82,1180,45,27);
e.images.add({blob:await fs.readFile(path.resolve(d.image)),contentType:'image/png',fit:'contain',alt:'模擬的に認証失効を起こした公開検証画面。個人情報を消し再ログインの案内を表示。',position:{left:70,top:150,width:670,height:470}});
label(e,'AT-19  未認証・失効時',780,160,450,50,28,true);
label(e,d.at19,780,220,440,130,23);
label(e,'AT-20  家庭別の利用範囲',780,375,450,50,28,true);
label(e,d.at20,780,435,440,135,23);
label(e,'架空データ・模擬応答での技術確認。実Google・実機・顧客確認は別管理。顧客データ維持・本番未開始。',55,675,1180,30,18);
e.speakerNotes.text=d.notes;
const candidate=path.join(dir,'candidate.pptx'),final=path.join(dir,'delivery/v2.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],verifyArtifactToolImport:true,explicitTotalSlideCount:17,receiptPath:path.join(dir,'validation-v2.json')});
const q=await PresentationFile.importPptx(await FileBlob.load(final));
for(const i of [0,1,16])await fs.writeFile(path.join(dir,'final-'+(i+1)+'.png'),new Uint8Array(await(await q.export({slide:q.slides.items[i],format:'png',scale:1})).arrayBuffer()));

