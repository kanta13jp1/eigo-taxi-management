import fs from 'node:fs/promises';
import path from 'node:path';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const root='C:/Users/kanta/GitHub/eigo-taxi-management';
const work=path.join(root,'outputs/manual-visual-work');
const assets=path.join(root,'outputs/visual-deck-work');
const src='docs/USER_GUIDE.md';
const guide=await fs.readFile(path.join(root,src),'utf8');
const deck=Presentation.create({slideSize:{width:1280,height:720}});
const C={navy:'#102D52',blue:'#00A6DF',orange:'#F78C1E',pale:'#EAF7FB',gray:'#3E5366',white:'#FFFFFF',dark:'#172637',line:'#D6E8EE',warn:'#FFF7EA'};
const photo=await fs.readFile(path.join(assets,'image.jpeg'));
const logo=await fs.readFile(path.join(assets,'image2.jpeg'));
const pics={people:await fs.readFile(path.join(assets,'illustrations/people.png')),mobile:await fs.readFile(path.join(assets,'illustrations/mobile.png')),backup:await fs.readFile(path.join(assets,'illustrations/backup.png')),login:await fs.readFile(path.join(assets,'illustrations/login.png')),check:await fs.readFile(path.join(assets,'illustrations/checklist.png'))};
function box(s,x,y,w,h,fill='none',border='none',g='rect',sw=0){return s.shapes.add({geometry:g,position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:border,width:sw}})}
function text(s,t,x,y,w,h,size=21,color=C.dark,bold=false,align='left'){let a=box(s,x,y,w,h);a.text=t;a.text.style={typeface:'Yu Gothic',fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',insets:0};return a}
function img(s,b,x,y,w,h,alt,mime='image/png',fit='contain'){s.images.add({blob:b,contentType:mime,alt,fit,position:{left:x,top:y,width:w,height:h}})}
const data=[
 {title:'ログインと生徒・残数の確認',subtitle:'管理者とご家庭は、それぞれの専用ページを利用します',image:'login',rows:[
 ['USR-01','ログイン','登録された本人のGoogleアカウントを選びます。初期設定は開発担当が行います。'],
 ['USR-02','生徒の登録','管理者が生徒・保護者・連絡先・送迎先などを登録します。'],
 ['USR-03','残数を見る','家庭専用ページでお子さまの名前・残数を確認します。'],
 ['USR-04','残数が少ないとき','画面の案内を確認し、Mauro・Brendaにご連絡ください。']]},
 {title:'予約とチケット追加',subtitle:'保護者が都度予約し、管理者がチケットを追加します',image:'people',rows:[
 ['USR-05','チケット追加','管理者が追加し、残数と購入履歴を確認します。'],
 ['USR-06','お迎えを予約','保護者ページの「送迎の予約を申し込む」から日時・場所を指定します。'],
 ['USR-07','送りを予約','予約画面で「帰り（送り）」を選び、日時・場所を確認します。'],
 ['USR-08','往復を予約','予約画面で「往復」を選び、行きと帰りの内容を確認します。']]},
 {title:'代理予約・取消と当日の確認',subtitle:'予定が変わったら、対象の予約を確認して操作します',rows:[
 ['USR-09','管理者の代理予約','管理者が生徒・日時・場所を指定して登録します。'],
 ['USR-10','保護者の取消','家庭ページで対象の予約を選び、キャンセルします。'],
 ['USR-11','管理者の取消','管理者が対象の予約を取り消し、結果を確認します。'],
 ['USR-12','当日の予定を見る','管理者ページで当日の送迎一覧や場所を確認します。']]},
 {title:'送迎が終わったら',subtitle:'実際の送迎を確認してから、管理者が完了登録します',image:'mobile',rows:[
 ['USR-13','片道の完了','送迎後に「完了」を押すと、チケットを1枚消費します。'],
 ['USR-14','往復の完了','往復の送迎完了を登録すると、チケットを2枚消費します。'],
 ['USR-15','二重処理の防止','完了の二重処理で重複消費しないかは検証項目です。'],
 ['USR-16','取消済みの予約','取消済み予約を完了できないことは検証項目です。']]},
 {title:'入力間違いや通信エラー',subtitle:'エラー時は処理結果を確認し、必要に応じて担当者へ連絡します',rows:[
 ['USR-17','入力内容の確認','チケット枚数・金額が不正な場合の拒否は検証項目です。'],
 ['USR-18','通信エラー','結果が分からないときは、一覧や台帳で登録結果を確認します。'],
 ['USR-19','ログイン前の制限','未ログインで管理操作を利用できないことは検証項目です。'],
 ['USR-20','家庭ごとの制限','他の家庭の情報を利用できないことは検証項目です。']]},
 {title:'端末・画面の確認',subtitle:'端末の動作とデータ保存は、それぞれ範囲を決めて確認します',image:'check',rows:[
 ['USR-21','スマートフォン','画面表示と操作性を確認します。機種ごとの受入は未完了です。'],
 ['USR-22','再読込','登録内容が表示されるか確認します。結果不明時は担当者に確認します。'],
 ['USR-23','Google初期設定','開発・運用担当による検証項目です。'],
 ['USR-24','カレンダーへの予約','実カレンダー連携は受入未完了です。検証は担当者が行います。']]},
 {title:'連携・復元の確認',subtitle:'実際の連携と復元は、検証環境で担当者が確認します',image:'backup',rows:[
 ['USR-25','カレンダーの取消','実カレンダーとの取消連携は受入未完了です。'],
 ['USR-26','複数の利用者','管理者2名と家庭ごとの情報表示を確認します。'],
 ['USR-27','同時操作','同時処理の安全性は開発・受入担当の検証項目です。'],
 ['USR-28','バックアップ・復元','一部を照合済み。数式や設定を含む全体復元は未確認です。']]},
 {title:'実機・アカウントの管理',subtitle:'アカウントの登録・停止は管理者が行います',rows:[
 ['USR-29','スマートフォン実機','予約・取消など残る実機受入は未完了です。'],
 ['USR-30','公開後の確認','公開後に担当者が確認する項目です。本番運用は未開始です。'],
 ['USR-31','利用者の管理','管理者画面で利用者の登録・停止・再有効化・削除を行います。'],
 ['USR-32','初回ログイン','事前登録された本人がGoogleアカウントを選びます。']]},
 {title:'家庭への案内と台帳管理',subtitle:'個別URLは対象のご家庭へ案内します',rows:[
 ['USR-33','個別URL・QR','管理者が家庭に対応するURLまたはQRを配布します。'],
 ['USR-34','ログアウト','共用端末では、利用後にログアウトします。'],
 ['USR-35','台帳を直接編集','同時操作を止めバックアップを取り、編集後はサイトで再取得します。'],
 ['USR-36','予定を確認し送迎','日時・生徒・場所を確認して送迎し、管理者が完了を登録します。']]},
 {title:'予定変更と問い合わせ',subtitle:'当日急な変更は先生へ直接ご連絡ください',rows:[
 ['USR-37','日時・場所を変更','旧予約の取消結果を確認してから、新しい内容で予約します。'],
 ['USR-38','資料間の整合確認','開発・運用担当が各資料のIDと整合を確認します。']]}
];
function base(title,index,notes){
 const s=deck.slides.add();s.background.fill=C.white;
 img(s,logo,50,13,174,55,'MightyLINK ロゴ','image/jpeg');
 text(s,'送迎管理システム　ユーザーマニュアル（図解補足版）',265,25,800,26,18,C.gray);
 img(s,photo,0,80,1280,135,'空の写真','image/jpeg','cover');
 box(s,44,115,1192,80,C.white,C.blue,'rect',3);box(s,46,115,1188,4,C.orange);
 text(s,title,70,127,1120,53,32,C.navy,true);box(s,0,701,1280,19,C.navy);
 text(s,`${index} / 10　　2026年11月5日時点`,980,672,260,20,14,C.gray,false,'right');
 s.speakerNotes.text=notes;return s;
}
for(let i=0;i<data.length;i++){
 const item=data[i], ids=item.rows.map(x=>x[0]);
 const source=ids.map(id=>{let re=new RegExp('## '+id+'参照：([\\s\\S]*?)(?=\\n## USR-|$)');let m=guide.match(re);return '## '+id+' '+(m?m[1].trim():'参照なし')}).join('\n\n');
 const note='ユーザーマニュアル図解補足。対象ID '+ids.join(', ')+'。実運用と検証専用の項目を区別した要約。資料の正本: '+src+'、docs/acceptance/21_USER_MANUAL.md。Calendar権限未追加、実Google連携受入未完了、本番未開始。イラストは説明用の架空画像。\n\n'+source;
 const s=base(item.title,i+1,note);text(s,item.subtitle,70,227,1120,45,23,C.navy,true);
 const x=70, y0=i===3?345:290, width=item.image?875:1140, rowH=i===3?62:77;
 item.rows.forEach((r,j)=>{let y=y0+j*rowH;box(s,x,y,width,rowH-5,j%2?'#F8FAFB':'#EDF7FA',C.line,'rect',1);text(s,r[0],x+14,y+7,85,23,15,C.gray,true);text(s,r[1],x+105,y+5,205,rowH-12,20,C.navy,true);text(s,r[2],x+320,y+5,width-340,rowH-12,18,C.dark);});
 if(item.image){img(s,pics[item.image],970,290,225,235,'説明用イラスト');text(s,'イメージ',1090,528,100,20,13,C.gray,false,'right');}
 if(i===3){
  ['実際に送迎','管理者が完了を押す','チケットを消費'].forEach((step,j)=>{const x=70+j*292;box(s,x,280,250,52,C.pale,C.blue,'roundRect',1);text(s,step,x+8,286,234,40,18,C.navy,true,'center');if(j<2)text(s,'›',x+254,286,30,40,31,C.orange,true,'center')});
  box(s,70,615,1140,38,C.warn,C.orange,'rect',1);text(s,'予約・取消の時点では消費しません。',85,620,1100,28,18,C.dark);
 }
 if(i===8){text(s,'直接編集では関連するカレンダー等の処理は自動実行されません。元台帳と検証台帳は自動同期しません。',70,617,1130,30,17,C.gray);}
 if(i===9){
  text(s,'予定を変更する流れ',70,465,420,32,21,C.navy,true);
  const steps=['旧予約を確認','旧予約を取消','取消結果を確認','新しい予約を登録'];
  steps.forEach((step,j)=>{const x=70+j*288;box(s,x,505,245,56,C.pale,C.blue,'roundRect',1);text(s,step,x+10,512,225,42,18,C.navy,true,'center');if(j<3)text(s,'›',x+250,510,30,40,31,C.orange,true,'center')});
  box(s,70,594,1140,55,C.warn,C.orange,'rect',1);text(s,'不明な点や急な変更は Mauro・Brenda にご相談ください。',90,600,1100,42,19,C.dark);
 }
}
await fs.mkdir(path.join(work,'renders'),{recursive:true});
for(let i=0;i<deck.slides.items.length;i++){const blob=await deck.export({slide:deck.slides.items[i],format:'png',scale:1});await fs.writeFile(path.join(work,'renders',`slide-${i+1}.png`),new Uint8Array(await blob.arrayBuffer()));}
await (await PresentationFile.exportPptx(deck)).save(path.join(work,'candidate.pptx'));
console.log('DONE',deck.slides.items.length);
