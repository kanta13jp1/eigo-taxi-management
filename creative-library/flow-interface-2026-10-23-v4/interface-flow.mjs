import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const root='C:/Users/kanta/GitHub/eigo-taxi-management',stage=root+'/docs/acceptance/flow-interface-2026-10-23';
await fs.mkdir(stage,{recursive:true});
const p=Presentation.create({slideSize:{width:1280,height:720}});
const cyan='#00A5E3',navy='#333333',orange='#EF7E00';
function shape(s,t,x,y,w,h,g='roundRect',fill='#FFFFFF',stroke=navy,size=17){const q=s.shapes.add({geometry:g,position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:1.4}});if(t){q.text=t;q.text.insets=2;q.text.style={typeface:'Yu Gothic',fontSize:size,color:navy,alignment:'center',verticalAlignment:'middle'};}return q;}
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
const sky=new Uint8Array(await fs.readFile(root+'/docs/acceptance/business-flow-hp-2026-10-23/assets/clouds.jpeg'));
const logo=new Uint8Array(await fs.readFile(root+'/docs/acceptance/business-flow-hp-2026-10-23/assets/logo.jpg'));
let laneRoles=[]; const meta=new Map(); function base(title,phases,roles,foot){laneRoles=roles;
 const s=p.slides.add();s.background.fill='#FCF9F4';
 s.images.add({blob:sky,contentType:'image/jpeg',alt:'MightyLINK公式サイトで使用される青空写真',fit:'cover',position:{left:0,top:66,width:1280,height:654}});
 shape(s,'',0,0,1280,66,'rect','#FFFFFF','none');
 s.images.add({blob:logo,contentType:'image/jpeg',alt:'MightyLINK公式ロゴ',fit:'contain',position:{left:48,top:0,width:190,height:66}});
 txt(s,'BUSINESS FLOW',310,19,220,30,17);txt(s,'手動：人の作業　画面：人が操作　自動：システム',585,19,650,30,15);
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
function node(s,t,c,r,g='roundRect',w=194){
 let kind='手動',screen='',api='';
 const role=laneRoles[r]||'';
 if(/システム|処理|制御|認証|台帳|設定|記録/.test(role)&&!/保守|開発/.test(role)){kind='自動';}
 if(/予定に合わせて訪問|乗車・到着|実際の送迎結果|購入を相談|購入相談|入金確認|教室へ連絡|教室へ購入|障害|保全版|必要な場合のみ復旧|受入30件/.test(t))kind='手動';
 if(g==='can'){kind='自動';api=/設定/.test(t)?'IF-09':'IF-11';}
 if(/Googleログイン|登録Googleを選択|登録済みGoogle/.test(t)){kind='画面';screen='A01/P01';api='IF-01';}
 else if(/完了を登録|完了登録|完了を再実行/.test(t)){kind='画面';screen='A02/A03';api='IF-06';}
 else if(/生徒の新規登録/.test(t)){kind='画面';screen='D03';api='IF-04';}
 else if(/Googleメール登録|対象生徒を紐付け|利用登録停止|役割・生徒範囲/.test(t)){kind='画面';screen='A06/D04';api='IF-08';}
 else if(/専用URL・QR配布/.test(t)){kind='画面＋手動';screen='A05';api='IF-07';t='URL・QRを表示後\n手動で本人へ配布';}
 else if(/カレンダーで当日の/.test(t)){kind='画面';screen='E02';api='IF-16';}
 else if(/自家庭の残数|最新の残数|利用履歴を確認|専用ページを利用|自家庭の生徒/.test(t)){kind='画面';screen='P02';api='IF-03';}
 else if(/選び予約/.test(t)){kind='画面';screen='D01';api='IF-02';}
 else if(/必要時に予約を取消/.test(t)){kind='画面';screen='D05';api='IF-05';}
 else if(/枚数・|金額を追加登録/.test(t)){kind='画面';screen='D02';api='IF-10';}
 else if(/接続先台帳だけ修正/.test(t)){kind='画面';screen='E03';api='IF-14';}
 else if(/再読込|表示一致を確認/.test(t)){kind='画面';screen='A02/P02';api='IF-03';}
 else if(/ログアウト/.test(t)){kind='画面';screen='A02/P02';api='IF-12';}
 if(/初期管理者設定/.test(t)){kind='画面';screen='E04';api='IF-15';}
  if(/取消履歴を保存/.test(t)){kind='自動';screen='';api='IF-11';}
 if(/旧予定を取消/.test(t)){kind='自動';api='IF-13';}
 if(/台帳・カレンダーへ/.test(t)){kind='自動';api='IF-11,13';}
 if(/旧予約の取消を確認|本人・予約・残数確認/.test(t)){kind='画面＋判断';screen='A03/D05';api='IF-03,05';}
 if(/新予約の日時|台帳・予定・残数確認/.test(t)){kind='画面';screen='A03';api='IF-03';}
 if(/保存後サイト再読込/.test(t)){kind='画面＋判断';screen='E03/A02';api='IF-14,03';}
 if(/教室環境・設定を整備/.test(t)){kind='画面';screen='E04';api='IF-15';}
  if(/必要な場合のみ復旧/.test(t)){kind='画面＋判断';screen='E03/E04';api='IF-14,15';}
 if(/証跡・不具合・再試験/.test(t)){kind='手動';screen='';api='';}
 const title=(g==='diamond'?t:'['+kind+'] '+t);
 const q=shape(s,title,230+c*255,229+r*103,w,62,g,kind==='自動'?'#E8F6FC':kind==='手動'?'#FFF5E8':'#FFFFFF',kind==='自動'?cyan:navy,15);
 meta.set(q,{kind,screen,api,t});
 if(screen||api){txt(s,[screen,api].filter(Boolean).join(' / '),230+c*255,292+r*103,w,17,12,cyan);}
 return q;
}
let s=base('01 利用開始・アカウント登録',['初期設定','利用者登録','本人確認','利用開始'],['開発担当者','教室管理者','生徒・保護者','システム／\n台帳'],'専用URL・QRだけでは利用できません。登録したGoogle本人と権限を照合します。登録・停止・削除は管理者が担当します。');
let a=node(s,'Google接続・\n初期管理者設定',0,0),b=node(s,'Googleメール登録\n役割・生徒を指定',1,1),c=node(s,'専用URL・QR配布',2,1),d=node(s,'Googleログイン',2,2),e=node(s,'本人・家庭を照合',2,3),f=node(s,'専用ページを利用',3,2);
link(s,a,b,'bottom','left');link(s,b,c);link(s,c,d,'bottom','top');link(s,d,e,'bottom','top');link(s,e,f,'right','bottom');txt(s,'管理者：管理専用\n保護者：自家庭のみ',975,590,240,32,14);
s=base('02 予約・取消・送迎完了',['都度予約','予定保存','取消／送迎実施','結果・残数更新'],['生徒・保護者','教室管理者','処理・判定','スプレッド\nシート'],'予約時は未消費。取消でも消費しません。完了時に片道1枚・往復2枚を消費。Calendar連携の受入確認は別途残っています。');
a=node(s,'生徒・日時・区分\nを選び予約',0,0);b=node(s,'権限・入力を確認',1,2);c=node(s,'送迎予定を保存',1,3,'can');d=node(s,'必要時に予約を取消\n管理者も代理取消可',2,0);e=node(s,'当日運行は11を参照\n実施後に完了登録',2,1);f=node(s,'残数は\n足りる？',2,2,'diamond');let g=node(s,'完了履歴・残数更新',3,3,'can'),h=node(s,'取消履歴を保存\nチケット未消費',3,0);
link(s,a,b,'bottom','left');link(s,b,c,'bottom','top');link(s,c,e,'right','left');link(s,c,d);link(s,d,h);link(s,e,f,'bottom','top');link(s,f,g,'bottom','left');txt(s,'はい',857,506,65,25,17);let j=node(s,'不足時は追加後\n完了を再実行',3,2);link(s,f,j);link(s,j,e,'top','right',orange);txt(s,'いいえ',928,438,70,25,17,orange);txt(s,'予約中は取消可能',684,300,210,24,16);
s=base('03 チケット購入・追加・残数確認',['残数確認','教室へ相談','購入確認・追加','残数反映'],['生徒・保護者','教室管理者','処理・判定','スプレッド\nシート'],'支払いは教室の運用で対応します。オンライン決済・LINE通知・定期予約の自動生成は対象外です。');
a=node(s,'自家庭の残数確認\n残少時は案内表示',0,0);b=node(s,'Mauro・Brendaへ\n購入相談',1,0);c=node(s,'購入内容・入金確認',1,1);d=node(s,'対象生徒・枚数・\n金額を追加登録',2,1);e=node(s,'購入履歴保存\n残数へ加算',2,3,'can');f=node(s,'最新の残数を表示',3,0);link(s,a,b);link(s,b,c,'bottom','top');link(s,c,d);link(s,d,e,'bottom','top');link(s,e,f,'right','bottom');txt(s,'送迎完了時は別フローで消費\n片道1枚・往復2枚',230,441,435,65,19);

function chain(s,items){const nodes=items.map(([t,c,r,g])=>node(s,t,c,r,g||'roundRect'));for(let i=0;i<nodes.length-1;i++){const A=nodes[i].position,B=nodes[i+1].position;link(s,nodes[i],nodes[i+1],A.left===B.left?'bottom':'right',A.left===B.left?'top':'left');}return nodes;}
s=base('04 生徒情報の登録・訂正',['情報の申出','登録・確認','本人と紐付け','表示確認'],['生徒・保護者','教室管理者','システム処理','台帳・設定'],'既存生徒の編集・削除APIはありません。住所・連絡先などの訂正は管理者へ連絡し、必要に応じ08の保守修正を行います。');
chain(s,[['氏名・連絡先・住所\nを教室へ連絡',0,0],['生徒の新規登録\n内容・初期残数確認',1,1],['生徒台帳に保存',1,3,'can'],['家庭の利用登録へ\n対象生徒を紐付け',2,1],['自家庭の生徒を確認\n兄弟は選択して利用',3,0]]);
txt(s,'住所・氏名を直しても、既存予約の保存済み情報は自動で書き換わりません。',215,420,260,90,16);
s=base('05 利用者変更・停止・退会',['変更受付','予約・権限確認','停止・変更・削除','本人へ案内'],['生徒・保護者','教室管理者','アクセス制御','許可設定・履歴'],'削除するのはシステムの利用登録だけ。Googleアカウント・生徒台帳・履歴は残ります。停止は次の通信から反映します。');
chain(s,[['退会・メール変更\nURL紛失を連絡',0,0],['本人・予約・残数確認\n必要な予約を取消',1,1],['利用登録停止・削除\n役割・生徒範囲変更',2,1],['許可設定を保存',2,3,'can'],['変更結果を本人へ案内\n停止時は利用不可',3,0]]);
txt(s,'メール変更は旧登録停止後に新規登録。\nURL再発行後は新しいURL・QRを配布。\n予約は別途確認し、有効管理者を1名以上残します。',215,424,460,85,16);
s=base('06 ログイン失敗・終了・権限確認',['Googleログイン','本人・権限確認','エラー時の対応','利用終了'],['利用者','教室管理者','認証・制御','許可設定'], '他家庭・管理者の情報は返しません。URL／キー入力方式は旧方式で、通常利用はGoogleログインです。');
chain(s,[['登録Googleを選択\n専用入口でログイン',0,0],['登録・有効状態・\n家庭URLを照合',1,2],['一致なら専用画面\n不一致なら利用拒否',2,2],['利用後にログアウト\n共有端末は必ず実施',3,0]]);
txt(s,'成功',946,377,65,25,16);txt(s,'拒否',846,315,65,25,16,orange);let q=node(s,'失敗時は教室へ連絡\n別アカウントを確認',2,0);link(s,p.slides.items.at(-1).shapes.items.find(x=>String(x.text).includes('一致なら専用画面\n不一致なら利用拒否')),q,'top','bottom');
txt(s,'教室はメール・停止状態・家庭紐付けを確認。全管理者がログイン不能の緊急復旧は開発・導入担当へ。',230,548,950,54,17);
s=base('07 予約変更・Googleカレンダー連携',['変更相談・登録','取消処理','新規予約','結果を照合'],['生徒・保護者','教室管理者','連携処理','台帳・\nカレンダー'],'連携は実装済みですがCalendar権限未追加・実Google受入未完了です。本資料で設定追加・連携操作は行いません。');
chain(s,[['日時・場所の変更\n直前は教室へ連絡',0,0],['旧予約の取消を確認\n新しい内容を確認',1,1],['旧予定を取消\n新予定を作成',2,2],['台帳・カレンダーへ\n取消／新規を反映',2,3,'can'],['新予約の日時・場所\n二重登録の有無確認',3,1]]);
txt(s,'直接変更APIはなく、取消後に再予約。\n取消と再予約は別々の処理です。\n片方だけ成功した場合は09で照合します。',215,424,460,85,16);
s=base('08 台帳の直接修正と画面反映',['修正の申出','対象と保全を確認','管理者が修正','再読込・照合'],['生徒・保護者','教室管理者','保守担当者','接続先の台帳'],'直接修正ではカレンダー連携・チケット自動計算・関連履歴更新は動きません。日常の登録・取消・完了はWeb画面を使います。');
chain(s,[['住所・表示内容の\n誤りを教室へ連絡',0,0],['対象ID・関連行確認\n同時操作停止・保全',1,1],['接続先台帳だけ修正\nID・見出し・型を維持',2,2],['関連残数・履歴を照合\n保存後サイト再読込',2,3,'can'],['対象生徒・予約の\n表示一致を確認',3,0]]);
txt(s,'検証用台帳とコピー元の台帳は別物で、自動同期しません。証跡用タブを編集先にしません。',215,423,460,80,17);
s=base('09 通信障害・結果不明・復旧',['障害の連絡','再送前に照合','必要な復旧','確認後に再開'],['利用者','教室管理者','開発・保守担当','記録・バックアップ'],'結果不明時の連打・再登録を避けます。復旧の実Google受入は未完了。払い戻し・残数訂正の自動機能はありません。');
chain(s,[['エラー・対象操作連絡\n成功扱いにせず停止',0,0],['台帳・予定・残数確認\n更新済みかを照合',1,1],['不整合・更新停止時は\nログと設定を調査',2,2],['必要な場合のみ復旧\n関連データを再照合',2,3,'can'],['本人表示・権限を確認\n再開を案内',3,1]]);
txt(s,'確実に戻せる変更は巻き戻し。\n結果不明時は更新を止め、台帳・予定を照合。\nバックアップ担当・頻度は教室と確定します。',215,424,460,85,16);
s=base('10 受入検証・リリース・引継ぎ',['教室側の準備','受入検証','合否と承認','運用引継ぎ'],['教室・責任者','第三者検証者','開発・導入担当','記録・環境'], 'この図は今後の判定手順です。本番開始は実施しません。Calendar追加も別途の明示的な承認が必要です。');
chain(s,[['運用Googleを準備\n認証方式とルール確認',0,0],['教室環境・設定を整備\n試験手順を準備',1,2],['梅澤以外の検証者が\n受入30件を実施',2,1],['証跡・不具合・再試験\n結果を保存',2,3,'can'],['全件合格と責任者承認\n運用開始は別途判断',3,0]]);
txt(s,'現在：AT24〜30未合格、第三者0/30。\n復元後の管理者再ログインも未確認。\n取消期限・返金・残数訂正などは教室と確定。',215,526,460,91,16);

s=base('11 当日の予定確認・実送迎・チケット消費',['当日の予定確認','実際の送迎','実績確認・完了登録','チケット消費・確認'],['先生・送迎担当','生徒・保護者','教室管理者','システム・台帳'],'カレンダーを見るだけでは完了・消費になりません。実送迎後の完了登録が必要です。Calendarの権限追加・実運用は今回行いません。');
chain(s,[['カレンダーで当日の\n時刻・生徒・場所確認',0,0],['予定に合わせて訪問\nお迎え・送りを実施',1,0],['乗車・到着を確認\n往復は両行程を実施',1,1],['実際の送迎結果確認\n未実施・取消と区別',2,0],['実施した予約に\n完了を登録',2,2],['片道1枚・往復2枚\n残数・完了履歴更新',2,3,'can'],['自家庭の残数と\n利用履歴を確認',3,1]]);
txt(s,'出発前：Web予約一覧と変更・取消を照合。\n急な変更・遅延は教室と本人が連絡。\n未実施・取消は完了にせず、消費しません。',215,424,460,85,16);
s.speakerNotes.text+=' ユーザー指摘を反映：現場のカレンダー確認、実際の送迎、実績確認、完了登録、チケット消費を分離して表現。往復全行程実施の確認を完了前に置く。片道のみ実施・無断欠席・返金等の取扱いは教室と確定が必要で、自動精算機能を追加したものではない。カレンダー連携の実Google受入は未完了。';


function docslide(title,foot){const z=p.slides.add();z.background.fill='#FCF9F4';z.images.add({blob:sky,contentType:'image/jpeg',alt:'MightyLINK背景',fit:'cover',position:{left:0,top:65,width:1280,height:655}});shape(z,'',0,0,1280,65,'rect','#FFFFFF','none');z.images.add({blob:logo,contentType:'image/jpeg',alt:'MightyLINKロゴ',fit:'contain',position:{left:48,top:0,width:190,height:65}});shape(z,'',50,80,1180,70,'rect','#FFFFFF/95','none');shape(z,'',50,80,1180,3,'rect',orange,'none');shape(z,'',50,147,1180,3,'rect',cyan,'none');txt(z,title,65,94,1150,43,30);shape(z,'',40,168,1200,455,'rect','#FFFFFF/97','none');shape(z,'',40,640,1200,66,'rect','#FFFFFF/95','none');txt(z,foot,55,649,1170,48,16);z.speakerNotes.text='画面・I/F IDはこの資料で採番した設計管理IDで、URLやソース定数を変更したものではない。src/App.tsx、portal.ts、components、services/api.ts、services/google-auth.ts、gas/Code.gsと照合。画面内タブ・モーダル・外部画面を区別。Calendar権限追加・本番開始なし。';return z;}
function tableSlide(title,headers,rows,widths,foot){const z=docslide(title,foot);const tb=z.tables.add({rows:rows.length+1,columns:headers.length,left:57,top:182,width:1166,height:423,columnWidths:widths,values:[headers,...rows]});for(let r=0;r<=rows.length;r++)for(let c=0;c<headers.length;c++){const cell=tb.getCell(r,c);cell.fill=r===0?'#00A5E3':r%2?'#FFFFFF':'#F5F8FA';cell.text.style={typeface:'Yu Gothic',fontSize:16,color:r===0?'#FFFFFF':'#333333',bold:r===0};}return z;}
let z=docslide('12 手動・画面・自動と矢印の読み方','画面IDは次頁、I/F仕様は16〜17頁。画面ノード下のIDは当該画面のI/F。人同士の矢印は連絡・実作業で、API通信ではありません。');
shape(z,'[手動] 実送迎・対面確認・電話連絡',90,215,1100,65,'roundRect','#FFF5E8',navy,25);
shape(z,'[画面] 人が入力・確認・ボタン操作',90,307,1100,65,'roundRect','#FFFFFF',navy,25);
shape(z,'[自動] 認証判定・台帳更新・チケット計算',90,399,1100,65,'roundRect','#E8F6FC',cyan,25);
txt(z,'システム向け矢印の起点「D01 / IF-02」は、予約画面を介したAPI送信。\n画面を介さない処理はIF-09（設定保存）・IF-11（台帳）などのサーバーI/Fで表現。\n手動連絡はシステム通信なし。外部画面E02・E03の操作は人が実施します。',90,496,1100,105,22);
const screens=[
['C01','入口案内','未ログイン','#/ ／ 不正URL','管理者・保護者入口へ'],
['C02','利用規約・個人情報・免責','共通','TermsModal内タブ','元画面へ閉じる'],
['A01','管理者ログイン','管理者','#/admin','Google認証後A02'],
['A02','本日の送迎','管理者','TeacherDashboard today','完了・予約・購入'],
['A03','送迎予定・履歴一覧','管理者','同allRidesタブ','一覧・完了・取消'],
['A04','生徒・チケット管理','管理者','同studentsタブ','生徒登録・追加購入'],
['A05','個別URL・QR','管理者','PortalInvitations','コピー・QR表示'],
['A06','アカウント一覧・編集','管理者','AccountManagement','追加・停止・削除・再発行'],
['A07','Google連携情報','管理者','GoogleSettings','接続情報表示／デモ初期化'],
['P01','保護者ログイン','保護者','#/parent[/個別ID]','Google認証後P02'],
['P02','家庭専用ページ','保護者','ParentPortal','兄弟選択・予約・残数・取消'],
['D01','送迎予約入力','両者','AddRideModal','送信後、呼出元へ'],
['D02','チケット追加入力','管理者','AddTicketModal','送信後、呼出元へ'],
['D03','生徒新規入力','管理者','AddStudentModal','送信後、呼出元へ'],
['D04','アカウント変更確認','管理者','A06内の確認dialog','保存／削除→A06'],
['D05','取消確認','両者','window.confirm','OK→取消、戻る→元画面'],
['E01','Googleアカウント選択','外部','Firebase Auth popup','認証成功／中止を返す'],
['E02','Googleカレンダー','外部','Google Calendar','当日の予定を人が確認'],
['E03','Googleスプレッドシート','外部','Google Sheets','保守修正・保全・照合'],
['E04','導入・保守設定','外部','Firebase Console／GAS','初期設定・緊急復旧']];
tableSlide('13 画面一覧・ID（1/3）',['ID','画面名','利用者','実装・入口','主な操作'],screens.slice(0,7),[70,275,100,335,386],'A02〜A07は同じ管理者URL内のタブ・画面状態。別URLへの遷移ではありません。');
tableSlide('14 画面一覧・ID（2/3）',['ID','画面名','利用者','実装・入口','主な操作'],screens.slice(7,14),[70,275,100,335,386],'D01〜D03はモーダルです。成功で閉じ、失敗時は入力を保持してエラーを表示します。');
tableSlide('15 画面一覧・ID（3/3）',['ID','画面名','利用者','実装・入口','主な操作'],screens.slice(14),[70,275,100,335,386],'D04は同一画面内の確認欄。D05はブラウザー標準確認。完了登録には専用の確認ダイアログはありません。');
const ifs=[
['IF-01','A01/P01→E01→GAS','Firebase認証＋login','Google本人確認、役割・家庭・有効状態照合'],
['IF-02','D01→GAS','createReservation','生徒・日時・区分・場所・メモ→予定／結果'],
['IF-03','A02〜04/P02→GAS','getStudents / getRides','権限に応じた生徒・送迎一覧を取得'],
['IF-04','D03→GAS','createStudent','生徒情報・初期残数→生徒台帳'],
['IF-05','D05→GAS','cancelReservation','送迎ID→取消状態・予定削除'],
['IF-06','A02/A03→GAS','completeRide','送迎ID→片道1／往復2消費・完了履歴'],
['IF-07','A05→GAS／端末内','getPortalInvitations','専用URL取得。QRは端末内生成・コピー'],
['IF-08','A06/D04→GAS','getManagedUsers / saveManagedUser / deleteManagedUser','一覧取得・保存・削除・再発行（管理者限定）'],
['IF-09','GAS→Script Properties','PropertiesService','Google許可設定・更新ガードを保存'],
['IF-10','D02→GAS','addTickets','生徒・枚数・金額→残数・購入履歴更新'],
['IF-11','GAS→台帳','SpreadsheetApp','生徒・送迎・購入の各シートを読書き'],
['IF-12','ログアウト操作→SDK','session消去＋signOut','アプリ状態消去・Firebaseログアウト'],
['IF-13','GAS⇄Google Calendar','CalendarApp','予定作成・ID指定削除。実受入未完了'],
['IF-14','人→E03→サイト再読込','外部画面で直接編集','保守修正。自動計算・予定同期は実行しない'],
['IF-15','人→E04','導入担当の外部画面操作','初期Google接続・認証・初期管理者設定'],
['IF-16','送迎担当→E02','Google Calendarの画面','予定を人が閲覧。当アプリのAPI呼出しなし']];
tableSlide('16 I/F一覧（1/2）',['ID','起点・終点','通信／action','入出力・処理'],ifs.slice(0,8),[82,260,330,494],'GAS向けIF-01〜08/10はHTTPS POST。Content-Typeはtext/plain;charset=utf-8、本文はJSON。応答もJSONです。');
tableSlide('17 I/F一覧（2/2）',['ID','起点・終点','通信／action','入出力・処理'],ifs.slice(8),[82,260,330,494],'APIはidToken・portalRole・必要なentryIdを送信し毎回権限確認。キー・トークン実値は資料に含めません。');
function backline(z,a,b,y){const A=a.position,B=b.position;const x=A.left+A.width/2,u=B.left+B.width/2,ab=A.top+A.height,bb=B.top+B.height;shape(z,'',x,ab,2,y-ab,'rect',orange,'none');shape(z,'',Math.min(x,u),y,Math.abs(x-u),2,'rect',orange,'none');shape(z,'',u,bb,2,y-bb,'rect',orange,'none');shape(z,'',u-6,bb,14,14,'upArrow',orange,'none');}
function navbox(z,t,x,y,w=235){return shape(z,t,x,y,w,62,'roundRect','#FFFFFF',cyan,18);}
z=docslide('18 画面遷移図：管理者の業務画面','黒線は起動、オレンジ線は成功・閉じるで呼出元へ戻る。A02/A03/A04は相互切替できる同一画面内タブ。認証失敗はA01にエラー表示。');
let n1=navbox(z,'A01 管理者ログイン',80,195),n2=navbox(z,'E01 Google認証',390,195),n3=navbox(z,'A02 本日の送迎',700,195),n4=navbox(z,'A03 予定・履歴',700,315),n5=navbox(z,'A04 生徒・チケット',700,435);link(z,n1,n2);link(z,n2,n3);link(z,n3,n4,'bottom','top');link(z,n4,n5,'bottom','top');
let n6=navbox(z,'D01 送迎予約',1000,195,210),n7=navbox(z,'D02 チケット追加',1000,315,210),n8=navbox(z,'D03 生徒新規',1000,435,210);link(z,n3,n6);link(z,n4,n7);link(z,n5,n8);backline(z,n6,n3,280);backline(z,n7,n4,400);backline(z,n8,n5,518);txt(z,'D01：A02〜04から起動。D02：A02〜04から起動。D03：A04から起動。\n登録成功・閉じるで呼出元へ戻る。失敗時はモーダル内エラー。\nA02/A03の完了はIF-06を直接実行。取消はA03/P02からD05を経てIF-05。',80,525,1100,80,20);
z=docslide('19 画面遷移図：家庭専用ページ','管理者ページと相互切替するメニューはありません。停止・別家庭URL・役割不一致はログイン画面で拒否します。');
n1=navbox(z,'C01 入口案内',80,190);n2=navbox(z,'P01 保護者ログイン',390,190);n3=navbox(z,'E01 Google認証',700,190);n4=navbox(z,'P02 家庭専用ページ',700,335);link(z,n1,n2);link(z,n2,n3);link(z,n3,n4,'bottom','top');n5=navbox(z,'D01 送迎予約',1000,335,210);n6=navbox(z,'D05 取消確認',390,335);link(z,n4,n5);link(z,n4,n6,'left','right');backline(z,n5,n4,425);backline(z,n6,n4,445);txt(z,'成功・閉じるはP02へ戻る。取消OK後は一覧を再取得。\nP02内で兄弟選択・残数・予約・利用履歴を表示。別の画面URLではありません。\nログアウト後はP01へ。C02（規約等）はフッターから開き、閉じると元画面へ。\n保護者の共通入口と家庭別QR入口は同じP01で、家庭URLの照合条件だけが異なります。',80,470,1100,130,21);
z=docslide('20 画面遷移図：管理機能・共通状態','A06の入力欄は一覧と同じ画面内。A05からE03/E04へ自動遷移しません。デモは架空データだけでGoogle連携なし。');
n1=navbox(z,'A02〜07 管理メニュー',80,190);n2=navbox(z,'A05 URL・QR',390,190);n3=navbox(z,'A06 アカウント管理',390,310);n4=navbox(z,'A07 Google連携情報',390,430);link(z,n1,n2);link(z,n1,n3);link(z,n1,n4);n5=navbox(z,'D04 変更確認',750,310);link(z,n3,n5);backline(z,n5,n3,393);txt(z,'保存／削除成功はA06へ。失敗時は一覧を再取得。\nA05：コピー・QR表示は画面内操作。配布は人が行う。\nA07：本番のURL・キー入力画面ではなく接続情報表示。\n共通：C02はフッターから開く。読込失敗は元画面のエラー状態で再取得。\n再読込・入口URL変更はセッションを再検証。ログアウトは各ログイン入口へ。',720,415,485,185,17);
await fs.writeFile(stage+'/registry.json',JSON.stringify({screens:screens.map(r=>({id:r[0],name:r[1],role:r[2],implementation:r[3],operation:r[4]})),interfaces:ifs.map(r=>({id:r[0],endpoints:r[1],action:r[2],description:r[3]}))},null,2));

await(await PresentationFile.exportPptx(p)).save(stage+'/candidate.pptx');
for(const[i,s]of p.slides.items.entries()){const b=await p.export({slide:s,format:'png',scale:1});await fs.writeFile(stage+'/'+(i+1)+'.png',new Uint8Array(await b.arrayBuffer()));}















