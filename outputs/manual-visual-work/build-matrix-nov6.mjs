import fs from 'node:fs/promises';
import path from 'node:path';
import { Presentation, PresentationFile } from '@oai/artifact-tool';
const root='C:/Users/kanta/GitHub/eigo-taxi-management';
const work=path.join(root,'outputs/ops-matrix-visual-work/matrix');
const asset=path.join(root,'outputs/visual-deck-work');
const source=JSON.parse(await fs.readFile(path.join(root,'outputs/manual-visual-work/ops-matrix-source.json'),'utf8')).matrix;
const deck=Presentation.create({slideSize:{width:1280,height:720}});
const C={navy:'#102D52',blue:'#00A6DF',orange:'#F78C1E',pale:'#EAF7FB',gray:'#3E5366',white:'#FFFFFF',dark:'#172637',line:'#D6E8EE'};
const photo=await fs.readFile(path.join(asset,'image.jpeg'));
const logo=await fs.readFile(path.join(asset,'image2.jpeg'));
const illus=await fs.readFile(path.join(asset,'illustrations/backup.png'));
function box(s,x,y,w,h,fill='none',border='none',g='rect',sw=0){return s.shapes.add({geometry:g,position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:border,width:sw}})}
function text(s,t,x,y,w,h,size=20,color=C.dark,bold=false,align='left'){let a=box(s,x,y,w,h);a.text=t;a.text.style={typeface:'Yu Gothic',fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',insets:0};return a}
function img(s,b,x,y,w,h,alt,mime='image/png',fit='contain'){s.images.add({blob:b,contentType:mime,alt,fit,position:{left:x,top:y,width:w,height:h}})}
for(let i=0;i<source.length;i++){
 const src=source[i],body=src.body,cols=body.slice(2,7),items=body.slice(7,-1),count=items.length/5;
 if(!Number.isInteger(count))throw Error('Unexpected source matrix '+i);
 const s=deck.slides.add();s.background.fill=C.white;
 img(s,logo,50,13,174,55,'MightyLINK ロゴ','image/jpeg');
 text(s,'送迎管理システム　資料間の対応（図解補足版）',265,25,800,26,18,C.gray);
 img(s,photo,0,80,1280,135,'空の写真','image/jpeg','cover');
 box(s,44,115,1192,80,C.white,C.blue,'rect',3);box(s,46,115,1188,4,C.orange);
 text(s,body[1],70,127,1120,53,31,C.navy,true);box(s,0,701,1280,19,C.navy);
 text(s,`${i+1} / 8　　2026年11月6日時点`,980,672,260,20,14,C.gray,false,'right');
 text(s,i<4?'業務 → 要件 → 設計 → テスト仕様 → タスク':'実装 → テストコード → 受入 → 運用 → 利用者',70,220,1100,35,22,C.navy,true);
 const hasImage=(i===0||i===4), x=70,y=270,w=hasImage?930:1135, cw=w/5, rh=32;
 box(s,x,y,w,35,C.blue);
 cols.forEach((col,k)=>text(s,col,x+k*cw+6,y+3,cw-12,28,18,C.white,true,'center'));
 for(let row=0;row<count;row++){
  const ry=y+36+row*rh;
  box(s,x,ry,w,rh-1,row%2?'#F8FAFB':'#EDF7FA',C.line,'rect',.4);
  for(let col=0;col<5;col++)text(s,items[row*5+col],x+col*cw+3,ry+1,cw-6,rh-3,17,C.navy,col===0,'center');
 }
 if(hasImage){img(s,illus,1020,345,190,175,'資料の対応を確認するイメージ');text(s,'イメージ',1100,526,105,20,13,C.gray,false,'right');}
 text(s,'同じ行のIDをたどると、工程間の対応を確認できます。',70,645,1100,24,16,C.gray);
 s.speakerNotes.text='図解補足版。表のIDと順序は元資料から抽出し保持。参照: docs/acceptance/07_TRACEABILITY_MATRIX.md、docs/traceability/registry.json。数値や表記の対応と実際の受入合否は別です。実Google連携 AT-24〜30 は全体未完、第三者受入0/30。AT-30は公開後確認。\n2026-11-05追補: 主要3シートの一部189セルについて値・型・対象書式に差なし。数式0件、Google固有設定・全体復元・Calendar整合は未確認。\n\n元資料のスライドノート（履歴を含む）:\n'+src.notes.join('\n');
}
await fs.mkdir(path.join(work,'renders'),{recursive:true});
for(let i=0;i<deck.slides.items.length;i++){const b=await deck.export({slide:deck.slides.items[i],format:'png',scale:1});await fs.writeFile(path.join(work,'renders',`slide-${i+1}.png`),new Uint8Array(await b.arrayBuffer()));}
await (await PresentationFile.exportPptx(deck)).save(path.join(work,'candidate.pptx'));
console.log('DONE',deck.slides.items.length);
