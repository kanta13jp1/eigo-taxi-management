import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const root='C:/Users/kanta/GitHub/eigo-taxi-management',stage=root+'/docs/acceptance/business-flow-swimlane-2026-10-22';
await fs.mkdir(stage,{recursive:true});
const p=Presentation.create({slideSize:{width:1280,height:720}});
const cyan='#00A9D7',navy='#173D62',orange='#ED942E';
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
function base(title,phases,roles,foot){const s=p.slides.add();s.background.fill='#FCFAF6';txt(s,'MightyLINK',38,15,200,35,24,cyan);txt(s,title,38,58,1205,55,34);txt(s,'業務の進行',1050,119,180,25,16,orange);s.shapes.add({geometry:'rightArrow',position:{left:208,top:136,width:1020,height:10},fill:orange,line:{fill:'none',width:0}});
for(let i=0;i<4;i++){const q=shape(s,phases[i],208+i*255,158,242,37,'chevron',cyan,cyan,20);q.text.style={typeface:'Yu Gothic',fontSize:20,color:'#FFFFFF',alignment:'center',bold:true};}
roles.forEach((r,i)=>{const y=208+i*103;shape(s,'',38,y,1188,103,'rect',i%2?'#F0F7FA':'#FFFFFF','#D6E1E8');const q=shape(s,r,38,y,148,103,'rect',navy,navy,21);q.text.style={typeface:'Yu Gothic',fontSize:19,color:'#FFFFFF',alignment:'center',verticalAlignment:'middle'};});
txt(s,foot,38,643,1190,62,17);s.speakerNotes.text='仕様説明用の業務フロー。サンプルの横軸＝業務工程、縦軸＝関係者、判断ひし形、台帳円筒を参考に、編集可能なPowerPoint図形で制作。デザイン参考 https://mighty-link.com/ 。参照 docs/ACCOUNT_MANAGEMENT.md、gas/Code.gs、docs/progress/2026-10-22-step-13.md。実受入全件合格を示さない。Calendar権限追加・本番開始なし。';return s;}
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



