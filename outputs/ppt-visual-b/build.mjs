import fs from 'node:fs/promises';
import path from 'node:path';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const root='C:/Users/kanta/GitHub/eigo-taxi-management';
const work=path.join(root,'outputs/ppt-visual-b');
const assets=path.join(root,'outputs/visual-deck-work');
const specs=JSON.parse(await fs.readFile(path.join(work,'contents.json'),'utf8'));
const C={navy:'#102D52',blue:'#00A6DF',orange:'#F78C1E',pale:'#EAF7FB',gray:'#3E5366',white:'#FFFFFF',dark:'#172637',line:'#D6E8EE',warn:'#FFF7EA'};
const photo=await fs.readFile(path.join(assets,'image.jpeg')),logo=await fs.readFile(path.join(assets,'image2.jpeg'));
const pics={people:await fs.readFile(path.join(assets,'illustrations/people.png')),mobile:await fs.readFile(path.join(assets,'illustrations/mobile.png')),backup:await fs.readFile(path.join(assets,'illustrations/backup.png')),login:await fs.readFile(path.join(assets,'illustrations/login.png')),check:await fs.readFile(path.join(assets,'illustrations/checklist.png'))};
const labels={tasks:['確認する項目','検証の進め方'],implementation:['対象の機能','対応するコード'], 'test-code':['対象の機能','自動テスト・確認方法'],acceptance:['受入の確認項目','期待する結果']};
const topics=['ログイン・生徒と残数','予約とチケット追加','代理予約・取消と当日の確認','送迎完了と重複防止','入力間違いとアクセス制限','端末・データ保存と連携','連携・同時操作と復元','実機・利用者アカウント','家庭への案内と台帳管理','予定変更と資料の整合'];
const images={1:'login',2:'people',4:'mobile',6:'check',7:'backup'};
const blurbs={tasks:'担当者が検証する項目と手順を示します',implementation:'それぞれの機能と、実装を確認する場所を示します','test-code':'テスト番号と確認方法を示します。模擬試験と実受入は別です',acceptance:'検証担当者が結果を確認するための基準です。実際の合否とは別です'};
function box(s,x,y,w,h,fill='none',border='none',g='rect',sw=0){return s.shapes.add({geometry:g,position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:border,width:sw}})}
function text(s,t,x,y,w,h,size=21,color=C.dark,bold=false,align='left'){const a=box(s,x,y,w,h);a.text=t;a.text.style={typeface:'Yu Gothic',fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',insets:0};return a}
function img(s,b,x,y,w,h,alt,mime='image/png',fit='contain'){s.images.add({blob:b,contentType:mime,alt,fit,position:{left:x,top:y,width:w,height:h}})}
const ids=process.argv.slice(2);for(const kind of ids){
 const spec=specs[kind];const deck=Presentation.create({slideSize:{width:1280,height:720}});await fs.mkdir(path.join(work,kind,'renders'),{recursive:true});
 for(const entry of spec.slides){const i=entry.number;const s=deck.slides.add();s.background.fill=C.white;
  img(s,logo,50,13,174,55,'MightyLINK ロゴ','image/jpeg');text(s,`送迎管理システム　${spec.title}（図解補足版）`,265,25,800,26,18,C.gray);
  img(s,photo,0,80,1280,135,'空の写真','image/jpeg','cover');box(s,44,115,1192,80,C.white,C.blue,'rect',3);box(s,46,115,1188,4,C.orange);text(s,topics[i-1],70,127,1120,53,32,C.navy,true);
  box(s,0,701,1280,19,C.navy);text(s,`${i} / 10　　仕様・状態は原本時点`,980,672,260,20,14,C.gray,false,'right');text(s,blurbs[kind],70,222,1130,38,20,C.navy,true);
  const useImage=images[i] && Math.max(...entry.rows.map(x=>x[1].length))<90;const w=useImage?885:1140;
  box(s,70,272,w,40,C.blue);text(s,labels[kind][0],82,276,270,30,18,C.white,true);text(s,labels[kind][1],388,276,w-330,30,18,C.white,true);
  const rowH=entry.rows.length===2?110:77;
  for(const [j,row] of entry.rows.entries()){
   const y=318+j*rowH;box(s,70,y,w,rowH-4,j%2?'#F8FAFB':'#EDF7FA',C.line,'rect',1);
   let [id,label]=row[0].split(/\s+/,2);const rest=row[0].slice(id.length).trim();
   text(s,id,82,y+6,95,25,15,C.gray,true);text(s,rest,175,y+5,205,rowH-12,rest.length>15?16:18,C.navy,true);
   const fsiz=row[1].length>85?14:row[1].length>55?16:18;
   text(s,row[1],388,y+5,w-335,rowH-12,fsiz,C.dark);
  }
  if(useImage){img(s,pics[images[i]],975,314,220,230,'内容に関連する説明用イラスト');text(s,'イメージ',1092,548,100,20,13,C.gray,false,'right');}
  const foot=kind==='acceptance'?'実Google受入 AT-24〜30 は未完了・第三者の受入は 0 / 30 件':kind==='test-code'?'自動テスト・模擬試験の結果は実環境の受入結果を示しません':kind==='tasks'?'一部は検証用の操作例です。実施状況と対象環境を確認します':'コードの対応を示す資料です。配備状況・実受入は別途確認します';
  box(s,70,636,1140,29,C.warn,C.orange,'rect',1);text(s,foot,80,639,1115,22,15,C.gray);
  const orig=entry.original_text.join('\n');s.speakerNotes.text=`【図解補足版】元資料: docs/deliverables/2026-10-23-traceability/${spec.source} ${i}/10。元資料の本文・ノートを以下に保持。イラストは説明用。Calendar権限未追加、実Google連携は未受入、本番未開始。最新の進捗と正式な判定は正本を参照。\n\n【元の本文】\n${orig}\n\n【元のノート】\n${entry.notes}`;
 }
 for(let i=0;i<deck.slides.items.length;i++){let b=await deck.export({slide:deck.slides.items[i],format:'png',scale:1});await fs.writeFile(path.join(work,kind,'renders',`slide-${i+1}.png`),new Uint8Array(await b.arrayBuffer()));}
 await (await PresentationFile.exportPptx(deck)).save(path.join(work,kind,'candidate.pptx'));console.log('BUILT',kind,deck.slides.items.length);
}

