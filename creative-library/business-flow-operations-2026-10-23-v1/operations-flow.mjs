import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const root='C:/Users/kanta/GitHub/eigo-taxi-management',stage=root+'/docs/acceptance/business-flow-operations-2026-10-23';
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
function base(title,phases,roles,foot){
 const s=p.slides.add();s.background.fill='#FCF9F4';
 s.images.add({blob:sky,contentType:'image/jpeg',alt:'MightyLINK公式サイトで使用される青空写真',fit:'cover',position:{left:0,top:66,width:1280,height:654}});
 shape(s,'',0,0,1280,66,'rect','#FFFFFF','none');
 s.images.add({blob:logo,contentType:'image/jpeg',alt:'MightyLINK公式ロゴ',fit:'contain',position:{left:48,top:0,width:190,height:66}});
 txt(s,'BUSINESS FLOW',310,19,220,30,17);txt(s,'Mauro & Brenda Taxi Link',720,19,460,30,17);
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
txt(s,'成功',946,377,65,25,16);txt(s,'拒否',846,315,65,25,16,orange);let q=node(s,'失敗時は教室へ連絡\n別アカウントを確認',2,0);link(s,p.slides.items.at(-1).shapes.items.find(x=>String(x.text)==='一致なら専用画面\n不一致なら利用拒否'),q,'top','bottom');
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
await(await PresentationFile.exportPptx(p)).save(stage+'/candidate.pptx');
for(const[i,s]of p.slides.items.entries()){const b=await p.export({slide:s,format:'png',scale:1});await fs.writeFile(stage+'/'+(i+1)+'.png',new Uint8Array(await b.arrayBuffer()));}









