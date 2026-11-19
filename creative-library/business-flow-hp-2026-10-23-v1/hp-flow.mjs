import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const root='C:/Users/kanta/GitHub/eigo-taxi-management',stage=root+'/docs/acceptance/business-flow-hp-2026-10-23';
await fs.mkdir(stage,{recursive:true});
const p=Presentation.create({slideSize:{width:1280,height:720}});
const cyan='#00A5E3',navy='#333333',orange='#EF7E00';
function shape(s,t,x,y,w,h,g='roundRect',fill='#FFFFFF',stroke=navy,size=18){const q=s.shapes.add({geometry:g,position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:1.4}});if(t){q.text=t;q.text.insets=5;q.text.style={typeface:'Yu Gothic',fontSize:size,color:navy,alignment:'center',verticalAlignment:'middle'};}return q;}
function txt(s,t,x,y,w,h,size=20,color=navy){const q=shape(s,t,x,y,w,h,'textbox','none','none',size);q.text.style={typeface:'Yu Gothic',fontSize:size,color};return q;}
function link(s,a,b,from='right',to='left',color=navy){
const A=a.position,B=b.position;const pt=(P,side)=>side==='left'?[P.left,P.top+P.height/2]:side==='right'?[P.left+P.width,P.top+P.height/2]:side==='top'?[P.left+P.width/2,P.top]:[P.left+P.width/2,P.top+P.height];
const start=pt(A,from),end=pt(B,to);let pts=[start];
if((from==='bottom'||from==='top')&&(to==='left'||to==='right')){pts.push([start[0],end[1]]);}
else if((from==='left'||from==='right')&&(to==='top'||to==='bottom')){pts.push([end[0],start[1]]);}
else if(from==='bottom'||from==='top'){const yy=(start[1]+end[1])/2;pts.push([start[0],yy],[end[0],yy]);}
else{const xx=(start[0]+end[0])/2;pts.push([xx,start[1]],[xx,end[1]]);}pts.push(end);
for(let i=0;i<pts.length-1;i++){const[x,y]=pts[i],[u,v]=pts[i+1];if(Math.abs(u-x)+Math.abs(v-y)<1)continue;shape(s,'',Math.min(x,u)-1,Math.min(y,v)-1,Math.max(2,Math.abs(u-x)),Math.max(2,Math.abs(v-y)),'rect',color,'none');}
const dir=to==='left'?'rightArrow':to==='right'?'leftArrow':to==='top'?'downArrow':'upArrow';shape(s,'',end[0]-(to==='left'?15:to==='right'?0:7),end[1]-(to==='top'?15:to==='bottom'?0:7),to==='left'||to==='right'?15:14,to==='top'||to==='bottom'?15:14,dir,color,'none');
}
const sky=new Uint8Array(await fs.readFile(stage+'/assets/clouds.jpeg'));
const logo=new Uint8Array(await fs.readFile(stage+'/assets/logo.jpg'));
function base(title,phases,roles,foot){
 const s=p.slides.add();s.background.fill='#FCF9F4';
 s.images.add({blob:sky,contentType:'image/jpeg',alt:'MightyLINK公式サイトで使用される青空写真',fit:'cover',position:{left:0,top:66,width:1280,height:654}});
 shape(s,'',0,0,1280,66,'rect','#FFFFFF','none');
 s.images.add({blob:logo,contentType:'image/jpeg',alt:'MightyLINK公式ロゴ',fit:'contain',position:{left:48,top:0,width:190,height:66}});
 txt(s,'BUSINESS FLOW',310,19,220,30,17);txt(s,'ACCOUNT',640,19,150,30,16);txt(s,'BOOKING',815,19,150,30,16);txt(s,'TICKETS',990,19,150,30,16);
 shape(s,'',245,79,790,72,'rect','#FFFFFF/92','none');
 shape(s,'',245,79,790,3,'rect',orange,'none');shape(s,'',1032,79,3,72,'rect',orange,'none');
 shape(s,'',245,148,790,3,'rect',cyan,'none');shape(s,'',245,79,3,72,'rect',cyan,'none');
 txt(s,title,260,87,760,42,30);txt(s,'BUSINESS PROCESS',480,125,320,22,14,orange);
 for(let i=0;i<4;i++){const q=shape(s,phases[i],208+i*255,163,242,34,'chevron','#FFFFFF/96',cyan,18);q.text.style={typeface:'Yu Gothic',fontSize:18,color:navy,alignment:'center'};}
 roles.forEach((r,i)=>{const y=208+i*103;shape(s,'',38,y,1188,103,'rect','#FFFFFF/93','#E0E0E0');
 const q=shape(s,r,38,y,148,103,'rect','#FCF9F4','#E0E0E0',19);q.text.style={typeface:'Yu Gothic',fontSize:19,color:navy,alignment:'center',verticalAlignment:'middle'};
 shape(s,'',38,y,4,103,'rect',cyan,'none');});
 shape(s,'',38,638,1188,68,'rect','#FFFFFF/94','none');txt(s,foot,52,648,1158,48,17);
 s.speakerNotes.text='MightyLINK HPの公式ロゴ・背景写真を指定サイトから取得し、白いヘッダー、中央見出し、オレンジ上右辺と水色下左辺の枠、透ける白い本文を参考に制作。画像出典 https://mighty-link.com/wp/wp-content/themes/mightylinkhp/image/common/Logo2.jpg および image/common/footer.jpeg。会社説明用資料の参照として使用、再販権を主張しない。業務内容と担当者別構成は前版を維持。参照 docs/ACCOUNT_MANAGEMENT.md、gas/Code.gs。実受入全件合格を示さない。Calendar権限追加・本番開始なし。';return s;}
const node=(s,t,c,r,g='roundRect',w=194)=>shape(s,t,230+c*255,229+r*103,w,62,g,g==='can'?'#E7F6FC':'#FFFFFF');
let s=base('01 利用開始・アカウント登録',['初期設定','利用者登録','本人確認','利用開始'],['開発担当者','教室管理者','生徒・保護者','システム／\n台帳'],'専用URL・QRだけでは利用できません。登録したGoogle本人と権限を照合します。登録・停止・削除は管理者が担当します。');
let a=node(s,'Google接続・\n初期管理者設定',0,0),b=node(s,'Googleメール登録\n役割・生徒を指定',1,1),c=node(s,'専用URL・QR配布',2,1),d=node(s,'Googleログイン',2,2),e=node(s,'本人・家庭を照合',2,3),f=node(s,'専用ページを利用',3,2);
link(s,a,b,'bottom','left');link(s,b,c);link(s,c,d,'bottom','top');link(s,d,e,'bottom','top');link(s,e,f,'right','bottom');txt(s,'管理者：管理専用\n保護者：自家庭のみ',975,590,240,32,14);
s=base('02 予約・取消・送迎完了',['都度予約','予定保存','取消／送迎実施','結果・残数更新'],['生徒・保護者','教室管理者','処理・判定','スプレッド\nシート'],'予約時は未消費。取消でも消費しません。完了時に片道1枚・往復2枚を消費。Calendar連携の受入確認は別途残っています。');
a=node(s,'生徒・日時・区分\nを選び予約',0,0);b=node(s,'権限・入力を確認',1,2);c=node(s,'送迎予定を保存',1,3,'can');d=node(s,'必要時に予約を取消\n管理者も代理取消可',2,0);e=node(s,'送迎後に完了登録',2,1);f=node(s,'残数は\n足りる？',2,2,'diamond');let g=node(s,'完了履歴・残数更新',3,3,'can'),h=node(s,'取消履歴を保存\nチケット未消費',3,0);
link(s,a,b,'bottom','left');link(s,b,c,'bottom','top');link(s,c,e,'right','left');link(s,c,d);link(s,d,h);link(s,e,f,'bottom','top');link(s,f,g,'bottom','left');txt(s,'はい',857,506,65,25,17);let j=node(s,'不足時は追加後\n完了を再実行',3,2);link(s,f,j);link(s,j,e,'top','right',orange);txt(s,'いいえ',928,438,70,25,17,orange);txt(s,'予約中は取消可能',684,300,210,24,16);
s=base('03 チケット購入・追加・残数確認',['残数確認','教室へ相談','購入確認・追加','残数反映'],['生徒・保護者','教室管理者','処理・判定','スプレッド\nシート'],'支払いは教室の運用で対応します。オンライン決済・LINE通知・定期予約の自動生成は対象外です。');
a=node(s,'自家庭の残数確認\n残少時は案内表示',0,0);b=node(s,'Mauro・Brendaへ\n購入相談',1,0);c=node(s,'購入内容・入金確認',1,1);d=node(s,'対象生徒・枚数・\n金額を追加登録',2,1);e=node(s,'購入履歴保存\n残数へ加算',2,3,'can');f=node(s,'最新の残数を表示',3,0);link(s,a,b);link(s,b,c,'bottom','top');link(s,c,d);link(s,d,e,'bottom','top');link(s,e,f,'right','bottom');txt(s,'送迎完了時は別フローで消費\n片道1枚・往復2枚',230,441,435,65,19);
await(await PresentationFile.exportPptx(p)).save(stage+'/candidate.pptx');
for(const[i,s]of p.slides.items.entries()){const b=await p.export({slide:s,format:'png',scale:1});await fs.writeFile(stage+'/'+(i+1)+'.png',new Uint8Array(await b.arrayBuffer()));}




