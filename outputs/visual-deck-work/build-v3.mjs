import fs from 'node:fs/promises';
import path from 'node:path';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const out='C:/Users/kanta/GitHub/eigo-taxi-management/outputs/visual-deck-work';
const src='C:/Users/kanta/GitHub/eigo-taxi-management/docs/deliverables/2026-10-23-traceability/progress-2026-11-05-v28.pptx';
const deck=Presentation.create({slideSize:{width:1280,height:720}});
const C={navy:'#102D52', blue:'#00A6DF', orange:'#F78C1E', pale:'#EFF8FB', gray:'#3E5366', light:'#D9E8ED', white:'#FFFFFF', dark:'#172637'};
const photo=await fs.readFile(path.join(out,'image.jpeg'));
const logo=await fs.readFile(path.join(out,'image2.jpeg'));
const people=await fs.readFile(path.join(out,'illustrations','people.png'));
const mobile=await fs.readFile(path.join(out,'illustrations','mobile.png'));
const backup=await fs.readFile(path.join(out,'illustrations','backup.png'));
const login=await fs.readFile(path.join(out,'illustrations','login.png'));
const checklist=await fs.readFile(path.join(out,'illustrations','checklist.png'));
function shp(s,x,y,w,h,fill='none',stroke='none',geom='rect',sw=0){return s.shapes.add({geometry:geom,position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:stroke,width:sw}})}
function txt(s,t,x,y,w,h,size=24,color=C.dark,bold=false,align='left') {let a=shp(s,x,y,w,h);a.text=t;a.text.style={typeface:'Yu Gothic',fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',insets:0};return a}
function line(s,x,y,w,h,col=C.blue,style='solid',arrow=false){return s.shapes.add({geometry:'connector',kind:'straight',position:{left:x,top:y,width:w,height:h},line:{style,fill:col,width:3},...(arrow?{tail:{type:'triangle',width:'med',length:'med'}}:{})})}
function img(s,bytes,x,y,w,h,alt,fit='cover'){s.images.add({blob:bytes,contentType:'image/jpeg',alt,fit,position:{left:x,top:y,width:w,height:h}})}
function ill(s,bytes,x,y,w,h,alt){s.images.add({blob:bytes,contentType:'image/png',alt,fit:'contain',position:{left:x,top:y,width:w,height:h}});if(x===1008)txt(s,'イメージ',1180,301,65,16,12,C.gray,false,'right');else txt(s,'イメージ',x+w-84,y+h-16,84,16,12,C.gray,false,'right')}
function base(title,page,notes){let s=deck.slides.add();s.background.fill=C.white;img(s,logo,50,13,174,55,'MightyLINK ロゴ','contain');txt(s,'送迎管理システム　進捗・残課題',265,25,730,26,18,C.gray);img(s,photo,0,80,1280,135,'空の写真');shp(s,44,115,1192,80,C.white,C.blue,'rect',3);shp(s,46,115,1188,4,C.orange);txt(s,title,70,127,1120,53,33,C.navy,true);shp(s,0,701,1280,19,C.navy);txt(s,`${page} / 6　　2026年11月5日時点`,1020,672,220,20,14,C.gray,false,'right');s.speakerNotes.text=notes;return s}
function node(s,t,x,y,w,h,sub,accent=C.blue){let a=shp(s,x,y,w,h,C.white,accent,'roundRect',2);txt(s,t,x+12,y+12,w-24,44,28,C.navy,true,'center');if(sub)txt(s,sub,x+10,y+60,w-20,h-69,18,C.gray,false,'center');return a}

// 1. Current position and remaining gates.
{
const s=base('現在の進み具合',1,`資料の時点は2026-11-05。開発側で部分確認を進めている。開発者以外による30件の受入は0/30。公開後確認AT-30は本番前の判定と時点が異なり、扱いを相談する。本番運用は未開始。Calendar権限追加は行わない指示。参照: docs/remaining-work-tracker.md, docs/progress/2026-11-05-at28-comparison.md, ${src}`);
txt(s,'検証を進めています',78,229,750,60,42,C.navy,true);ill(s,login,1008,217,175,113,'ログインの説明用イメージ');
const labels=[['検証','現在ここ','台帳やログインを確認中'],['第三者の事前確認','未実施','開発者以外が確認'],['運用開始の判断','これから','必要な確認後に相談']];
labels.forEach((a,i)=>{let x=70+i*400;let active=i===0;shp(s,x,335,340,172,active?'#E8F8FE':'#F8FAFB',active?C.blue:C.light,'rect',2);txt(s,a[0],x+15,350,310,36,25,C.navy,true,'center');txt(s,a[1],x+15,393,310,43,31,active?C.blue:C.gray,true,'center');txt(s,a[2],x+15,450,310,35,18,C.gray,false,'center');if(i<2)line(s,x+346,419,45,0,C.orange,'solid',true)});
txt(s,'第三者受入は 0 / 30 件。うち1件は公開後の確認で、判定時点は調整中です。\nカレンダーの実連携は未確認です。',78,538,1100,78,21,C.dark);
}

// 2. What connects: solid scope and open calendar path.
{
const s=base('どのように使うシステムか',2,`管理者は管理画面、生徒・保護者は家庭別画面でGoogleログイン。教室側の管理台帳へ接続する。図は役割と連携先の概念図で通信経路・データ形式そのものを表すものではない。カレンダー連携の予約・取消は実Google受入未完了。参照: docs/acceptance/04_FUNCTIONAL_SPEC.md, docs/remaining-work-tracker.md, docs/progress/2026-11-03-acceptance-preparation.md`);
ill(s,people,55,285,150,240,'先生とご家庭のイメージ');const a=node(s,'先生・管理者',215,260,210,120,'管理者ページ');const b=node(s,'生徒・保護者',215,445,210,120,'家庭専用ページ');const c=node(s,'送迎管理サイト',505,350,300,125,'ログインして操作');const d=node(s,'台帳',969,250,245,120,'生徒・予約・残数');const e=node(s,'カレンダー',969,445,245,120,'予約・取消を連携');
s.shapes.connect(a,c,{kind:'elbow',fromSide:'right',toSide:'left',line:{style:'solid',fill:C.blue,width:3},tail:{type:'triangle'}});s.shapes.connect(b,c,{kind:'elbow',fromSide:'right',toSide:'left',line:{style:'solid',fill:C.blue,width:3},tail:{type:'triangle'}});s.shapes.connect(c,d,{kind:'elbow',fromSide:'right',toSide:'left',line:{style:'solid',fill:C.blue,width:3},tail:{type:'triangle'}});s.shapes.connect(c,e,{kind:'elbow',fromSide:'right',toSide:'left',line:{style:'dashed',fill:C.orange,width:3},tail:{type:'triangle'}});
txt(s,'実連携は未確認',814,521,150,27,16,C.orange,true,'center');txt(s,'自分の家庭に必要な情報を表示',215,590,510,31,20,C.gray);
}

// 3. Validated slices.
{
const s=base('これまでに確認できたこと',3,`管理者2名の復元後Googleログイン・再読込・ログアウト後の非表示を確認。家庭A/Bごとの表示と相互拒否、iPhoneは部分確認。公開7ファイルの照合はフロントエンドに限る。現在の30件の独立受入結果を意味しない。詳細: docs/acceptance/restored-admins-2026-10-23/README.md; docs/acceptance/device-readonly-2026-10-24/README.md; docs/progress/2026-11-03-acceptance-preparation.md`);
const x=[95,470,845], top=270;
[['2人','管理者','それぞれのログインを確認'],['2家庭','保護者','他の家庭のURLは拒否'],['iPhone','画面表示','一部の操作を確認']].forEach((v,i)=>{shp(s,x[i],top,340,215,'#F3F9FB',C.light,'rect',1);const tw=i===2?190:340;txt(s,v[0],x[i],top+20,tw,68,i===2?33:44,C.blue,true,'center');txt(s,v[1],x[i],top+97,tw,38,25,C.navy,true,'center');txt(s,v[2],x[i]+12,top+154,316,35,18,C.gray,false,'center')});ill(s,mobile,1050,277,125,134,'スマートフォンの利用イメージ');
txt(s,'※ 検証用アカウントによる一部の確認です。第三者による受入とは別です。',78,552,1120,48,20,C.gray);
}

// 4. Actual backup evidence, no implied formula restoration.
{
const s=base('台帳とバックアップの照合',4,`2026-11-05に会社Googleアカウントで2026-10-23のバックアップと検証台帳を開き、それぞれXLSX形式に書き出し。主要3シート先頭8行で試験用3行をID確認して除外、現行側の行が空と確認したうえで189セルの値・型・対象書式を比較、差分0。比較範囲の数式セルは0。Excel変換に伴うGoogle固有の設定、条件付き書式、入力規則、行列寸法、全ブック、実際の数式復元とCalendarは未検証。独立再照合済。参照: docs/progress/2026-11-05-at28-comparison.md; docs/acceptance/backup-restore-2026-10-23/comparison-2026-11-05.json`);
txt(s,'3つのシートの一部を比較',72,229,800,45,29,C.navy,true);
const names=['生徒台帳','送迎予定履歴','チケット購入履歴'];names.forEach((t,i)=>{let x=70+i*220;shp(s,x,305,190,110,'#F4FAFC',C.blue,'rect',2);txt(s,t,x+8,325,174,60,19,C.navy,true,'center')});
line(s,715,360,50,0,C.orange,'solid',true);txt(s,'189 セル',765,283,210,65,39,C.blue,true,'center');txt(s,'値・型・対象書式\n差は見つかりませんでした',750,355,240,67,18,C.dark,false,'center');ill(s,backup,1000,255,200,185,'台帳とバックアップの照合イメージ');
txt(s,'各シートの先頭8行から、試験用の行を除外\nExcel形式で比較。対象に数式はありませんでした。',72,448,1020,64,20,C.gray);
shp(s,70,525,1140,94,'#FFF8EC',C.orange,'rect',2);txt(s,'未確認',92,543,115,35,21,C.orange,true);txt(s,'数式を含む復元、Google固有の設定、全体の復元',210,537,970,58,21,C.dark);
}

// 5. Separate engineering verification and independent acceptance.
{
const s=base('運用開始までに残る確認',5,`詳細ID: AT-24は予約とCalendar連動、AT-25は取消とCalendar連動、AT-26は管理者2名・家庭別の操作、AT-27は同時操作と再試行、AT-28はバックアップ・復元、AT-29はスマートフォン実機、AT-30は公開後の確認。これら実環境受入は各項目全体として未完。AT-27の開発側同時処理は部分確認済み。第三者30件は別の受入軸で0/30件であり7件と足し合わせない。30件のうちAT-30は公開後の確認で、事前判定方法は未決定。予約IDを新規Calendar予定説明に表示する変更はローカル実装・模擬試験70/70と独立AIレビュー済、検証GAS未反映。Calendar権限追加は禁止中。参照: docs/remaining-work-tracker.md; docs/progress/2026-11-03-acceptance-preparation.md; docs/progress/2026-11-05-at28-comparison.md`);
txt(s,'実際の連携・端末の確認',70,225,760,44,29,C.navy,true);
[['予約・取消とカレンダー','実際の連携は未確認'],['台帳の復元とスマートフォン','確認できた範囲を広げる'],['管理者・家庭別の操作','残る操作と条件を確認']].forEach((a,i)=>{let y=290+i*95;shp(s,72,y,18,18,i===0?C.orange:C.blue);txt(s,a[0],108,y-6,500,37,22,C.dark,true);txt(s,a[1],620,y-6,335,37,19,C.gray)});ill(s,checklist,988,292,205,238,'残作業リストの説明用イメージ');
shp(s,70,586,1135,66,'#EAF7FC',C.blue,'rect',2);txt(s,'開発者以外の受入',90,598,390,40,23,C.navy,true);txt(s,'公開後の確認1件を含む',485,601,340,35,18,C.gray);txt(s,'0 / 30 件',850,592,300,48,30,C.blue,true,'right');
}

// 6. Practical conditions and next action.
{
const s=base('次に確認すること',6,`次の作業: AT-28の残り（数式を含む復元、Google固有設定と運用方針）、Calendar権限追加が不要な準備。検証環境はマイティ会社Googleアカウント。本番運用には英語教室側の運用用Googleアカウントが必要。独立第三者の実施者と時期、Android端末、AT-30判定時点を確認する。Calendar権限追加と本番開始は行っていない。共有表: https://docs.google.com/spreadsheets/d/1PqUq7BoBBVlPolivap0eg1UPik47vNNWphyBd0DNwvU/edit; source docs/acceptance/THIRD_PARTY_EXECUTION_PREP_20261103.md`);
txt(s,'残る照合と受入の準備を進めます',70,229,1100,50,31,C.navy,true);
const items=[['1','バックアップ','数式や設定を含む復元の確認'],['2','受入テスト','開発者以外の実施者・時期を調整'],['3','教室の準備','運用用Googleアカウントを用意']];
items.forEach((v,i)=>{let y=300+i*91;shp(s,72,y,54,54,C.blue,C.blue,'ellipse',1);txt(s,v[0],72,y+1,54,50,25,C.white,true,'center');txt(s,v[1],150,y-3,300,52,25,C.navy,true);txt(s,v[2],450,y-3,555,52,20,C.gray)});ill(s,people,1020,300,175,230,'関係者の準備イメージ');
shp(s,70,594,1136,57,'#FFF8EC',C.orange,'rect',2);txt(s,'本番運用は未開始。確認を終えたうえで開始を判断します。',90,602,1090,38,20,C.dark);
}

await fs.mkdir(path.join(out,'renders-v3'),{recursive:true});
for(let i=0;i<deck.slides.items.length;i++){let blob=await deck.export({slide:deck.slides.items[i],format:'png',scale:1});await fs.writeFile(path.join(out,'renders-v3',`slide-${i+1}.png`),new Uint8Array(await blob.arrayBuffer()))}
await (await PresentationFile.exportPptx(deck)).save(path.join(out,'candidate-v3.pptx'));
console.log('DONE',deck.slides.items.length);
