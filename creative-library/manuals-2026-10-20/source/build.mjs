import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const root='C:/Users/kanta/GitHub/eigo-taxi-management';
const build=root+'/.manual-build-20261020';
const out=root+'/docs/deliverables/2026-10-20-manuals';
const skill='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1017.11052/skills/presentations';
const py='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs').href);
const shots='docs/acceptance/runs/2026-10-19T16-59-40-731Z/';
const S=(title,lines,refs,shot)=>({title,lines,refs,shot});
const auth='docs/GAS_AUTH_SETUP.md; gas/Code.gs';
const status='docs/acceptance/16_SEQUENTIAL_ACCEPTANCE.md';
const ui='src/App.tsx; src/components/TeacherDashboard.tsx; src/components/ParentPortal.tsx';
const ops=[
S('運用マニュアル',['Mauro & Brenda Taxi Link','教室管理者・保守担当者向け','2026年10月20日版　実環境受入前'],status),
S('利用開始の前提',['現状：ローカル受入22件と公開追加試験23件は合格。','実Google連携を含むAT-23〜30の8件は未実施（BLOCKED）。','本資料は実装に沿う操作手順。運用開始は実環境受入と責任者の判断後。','Google所有者、担当者、連絡窓口、バックアップ先は開始前に確定する。'],status),
S('構成と保存先',['ブラウザー：予約、チケット残数、管理者の運行操作を表示。','GAS：個別キーの認証、権限判定、更新処理を実行。','スプレッドシート：生徒台帳8列／送迎予定履歴12列／購入履歴7列。','カレンダー：GAS実行アカウントの既定カレンダーを使用。'],auth),
S('権限と担当の分担',['管理者：全生徒の参照、登録、予約、取消、チケット追加、送迎完了。','保護者：紐付いた生徒の参照、予約、取消。別家庭のデータは対象外。','保守担当：GAS設定、配備、キー失効、障害照合と復旧を担当。','Google資源の所有者・運用責任者・受入担当の氏名と連絡先は未定。'],auth),
S('Google環境の初期準備',['1　検証用の台帳と、既定カレンダーを持つ実行アカウントを準備。','2　台帳に紐付くApps Scriptへ現行 gas/Code.gs を保存。','3　権限を承認し、エディターで initSpreadsheet を実行。','4　3シートと列を確認。再実行で既存行を保持することも受入で確認。'],auth),
S('個人専用キーと家庭の紐付け',['1　管理者・保護者ごとに長いランダムキーを発行し、SHA-256を作成。','2　AUTH_USERS_JSONへハッシュ、id、name、role、studentIdsを登録。','3　生徒台帳A列のIDを家庭のstudentIdsと一致させる。兄弟は複数ID。','4　生キーは本人へ安全な経路で渡す。共有資料、URL、ログへ記載しない。'],auth),
S('GASの配備と接続確認',['1　タイムゾーンをAsia/Tokyoに設定。実行アカウントの権限を確認。','2　組織方針に合うWebアプリ公開範囲を選び、個別キー認証を設定。','3　既存配備は新バージョンへ更新。ソース保存だけで完了としない。','4　/exec URLでログインし、実台帳への保存を確認。GET応答だけでは不十分。'],auth),
S('始業時と終業時の確認',['始業時：個人キーでログインし、当日予定、住所、連絡事項、残数を確認。','送迎前：地図・電話リンクと実際の集合場所を確認。','終業時：実施済み送迎の完了漏れ、取消、購入記録と残数を照合。','推奨：異常は日時・予約ID・画面メッセージを記録し、運用責任者へ連絡。'],ui),
S('生徒登録と保護者への紐付け',['1　管理者画面の生徒台帳で「新規生徒を登録」を開く。','2　氏名、保護者、電話、住所、初期チケット残数を確認して登録。','3　成功後に台帳の生徒IDを確認し、保護者のstudentIdsへ追加。','登録済み情報の編集画面は未実装。修正は保守担当へ依頼する。'],'src/components/AddStudentModal.tsx; src/components/TeacherDashboard.tsx; '+auth),
S('チケット購入の記録',['1　対象生徒の「チケット追加」を開き、氏名と現在残数を確認。','2　追加枚数は1〜100の整数。購入金額は0以上の整数で入力。','3　「チケットを追加する」を押し、成功後の残数と購入履歴を確認。','結果不明時は重ねて購入登録せず、保守担当と購入履歴を照合。'],'src/components/AddTicketModal.tsx; '+auth),
S('代理予約と取消',['「送迎予定を追加」または生徒の「予約登録」から入力。','生徒、送迎日、時間、区分、住所を確認して「送迎予定を登録する」。','取消は対象予約を選び確認ダイアログへ進む。成功後の一覧を確認。','予定変更用の編集画面はない。取消と再予約は重複の有無を確認して行う。'],'src/components/AddRideModal.tsx; '+ui),
S('送迎完了と消費枚数',['実際の送迎後、対象予約の「送迎完了」を押す。','片道は1枚、往復は2枚。予約時と取消時には消費しない。','完了済みの再実行は再消費しない。取消済み予約の完了は拒否する。','残高不足では完了を確定しない。追加後に再操作し、業務対応は責任者へ確認。'],ui+'; '+auth),
S('障害の一次切り分け',['画面が開かない：通信、URL、配信環境の状態を確認。','ログインできない：/exec URL、個別キー、AUTH_USERS_JSONを確認。','一覧や更新が失敗：画面メッセージとApps Script実行記録を照合。','カレンダーだけ不整合：実行アカウント、既定カレンダー、保存予定IDを確認。'],auth+'; docs/OPERATION_RUNBOOK.md'),
S('結果不明の操作と受付停止',['同じ内容の再送では操作IDを保つ。別IDでやり直す前に台帳を確認。','RECONCILIATION_REQUIREDは整合確認が必要な状態。受付の更新を停止。','PENDING_MUTATION_JSONのaction、key、startedAtと実行状況を確認。','マーカーだけを先に消さない。処理前バックアップと対象行・予定を確保する。'],auth),
S('更新途中の不整合の復旧',['完了：残高・送迎状態・完了日時を照合し、必要枚数の一度だけの消費へ統一。','購入：同じ購入IDの履歴1行と、残高への一度だけの加算を確認。','予約・取消：送迎IDと保存予定IDで台帳とカレンダーを一対一に整える。','確認後のみマーカーを削除。補正内容・担当・日時と再送確認を記録して再開。'],auth),
S('バックアップと復元の運用案',['更新前：台帳全シート、GASソース、配備版、設定、カレンダー対応を保存。','定期：台帳の書き出し頻度、保管先、保持期間、閲覧権限を責任者が決定。','復元：受付停止後に別の検証環境で復元し、残数・履歴・予定の整合を確認。','シートの履歴復元だけでカレンダーや設定は戻らない。AT-28は未実施。'],auth+'; '+status),
S('変更・配備・切戻しの手順',['1　変更前のソースと設定を保存し、対象版と影響範囲を記録。','2　npm run lint、npm run build、node scripts/test_gas.cjsを実行。','3　検証環境で受入後、許可された対象へ配備。GASも配備バージョンを確認。','4　障害時は承認済みの正常版へ切戻し。データは別途照合し、再確認する。'],'package.json; docs/acceptance/13_MIGHTY_TEST_DEPLOYMENT.md; '+auth),
S('現在の公開環境と引継ぎ事項',['Firebase Hostingのmighty-testはテスト公開。実データ運用の開始を示さない。','公開記録：版 deed2fc3d9a96297。基点コミットだけでは再現できず保存ソースが必要。','切戻し先の記録はあるが、実際の切戻し操作は未検証。','本番URL、保守窓口、対応時間、費用・保証条件は別途確定して引き継ぐ。'],'docs/acceptance/13_MIGHTY_TEST_DEPLOYMENT.md; '+status),
];
const user=[
S('ユーザーマニュアル',['Mauro & Brenda Taxi Link','生徒・保護者向け','2026年10月20日版　教室の利用開始案内後に使用'],status),
S('できることと利用前の準備',['お子様のチケット残数、予約、送迎履歴を確認できます。','教室から案内された画面URL、接続先URL、本人専用キーを用意します。','現在は実環境受入前です。教室から利用開始の案内を受けてから使います。','デモは架空データの体験用です。教室への予約にはなりません。'],'docs/USER_GUIDE.md; '+status),
S('ログイン',['1　教室から案内された画面URLをブラウザーで開きます。','2　接続先URLと本人専用アクセスキーを入力し、「ログイン」を押します。','3　本人の役割とお子様の一覧を確認します。','キーは他の家庭へ共有しないでください。使えない場合は教室へ連絡します。'],'src/components/LoginScreen.tsx; docs/USER_GUIDE.md'),
S('お子様とチケット残数の確認',['選択欄でお子様の名前を選びます。','残チケット数と予約を確認します。兄弟は生徒を切り替えます。','表示されないお子様は教室へ連絡してください。家庭への紐付けが必要です。'],'src/components/ParentPortal.tsx; '+auth,shots+'AT-03.png'),
S('送迎予約の入力',['1　お子様を選び、予約を申し込むボタンを押します。','2　送迎日と時間を入力し、行き・帰り・往復を選びます。','3　送迎場所・住所を確認し、必要なら連絡事項を入力します。','4　「送迎予定を登録する」を押し、成功後に予約一覧を確認します。'],'src/components/AddRideModal.tsx; src/components/ParentPortal.tsx'),
S('予約フォームの見方',['時間欄の表示名は「お迎え時間」です。帰りを選んだ場合も同じ欄を使います。','往復は時間入力が1つです。帰りの時刻は教室と確認してください。','住所の自動入力があっても、その日の乗降場所を確認します。'],'src/components/AddRideModal.tsx',shots+'AT-21-form.png'),
S('予約の確認とキャンセル',['1　予約一覧で日付・時間・区分・住所を確認します。','2　対象予約の「キャンセル」を押し、確認メッセージで確定します。','3　成功後に予約中の一覧から外れ、履歴が取消済みになることを確認します。','当日の急な取消・変更は教室へ直接連絡してください。'],'src/components/ParentPortal.tsx; src/components/TermsModal.tsx'),
S('チケットが減るタイミング',['予約を登録しただけではチケットは減りません。','先生が送迎完了を処理すると、片道は1枚、往復は2枚減ります。','残数が少なくなったら先生へ追加購入を相談してください。','画面でオンライン決済は行いません。先生の追加処理後に残数を確認します。'],'src/components/TeacherDashboard.tsx; src/components/AddTicketModal.tsx; '+auth),
S('エラーや結果不明のとき',['エラー表示が出たら、成功したと判断せず予約一覧を確認します。','同じ予約を何度も新しく登録しないでください。重複が疑われたら教室へ連絡。','実接続の失敗でデモへ自動的に切り替わることはありません。','連絡内容は、お子様、送迎日時、操作、エラー文です。キーは送らないでください。'],'docs/USER_GUIDE.md; src/App.tsx; src/services/api.ts'),
S('よくある困りごと',['お子様が出ない：教室に登録と家庭の紐付けを確認してもらいます。','残数が違う：最後の購入と送迎完了を先生と確認します。','予約を変更したい：編集機能はないため、教室へ相談して取消・再予約します。','キーを紛失した：教室に失効・再発行を依頼します。'],ui+'; '+auth),
S('利用後のログアウト',['共有端末では利用後に「ログアウト」を押します。','本人専用キーを共有メモや端末の写真へ残さないでください。','ログアウトで端末内のキーを消します。キーの失効は教室へ依頼してください。','教室の正式な連絡先とキャンセルルールは、利用開始時の案内を確認してください。'],'src/components/Navbar.tsx; src/services/api.ts; '+auth),
];
const task=[
S('タスクリスト（残作業一覧）',['Mauro & Brenda Taxi Link','導入・受入・保守担当者向け','2026年10月20日版　実環境受入8件が未完了'],status),
S('判定の基準と現在地',['最新の項目別記録を基準とし、過去のFAILやGA Readyの表記で判断しない。','完了範囲：AT-01〜22のローカル受入22件、公開追加試験23件。','未完了範囲：AT-23〜30の実環境受入8件。実Google資源への更新は未実施。','担当者・期限は未定。以下の担当役割は候補で、任命済みを意味しない。'],status+'; docs/acceptance/05_TASKS.md'),
S('着手前の決定事項',['判断待ち：Google環境の所有者、実行アカウント、共有権限、個人キーの配布者。','判断待ち：本番URL、運用責任者、受入担当、障害連絡先。','判断待ち：残高不足時、当日取消、誤登録訂正の業務ルール。','判断待ち：バックアップ先、頻度、保持期間、復旧担当と復旧目標。'],auth+'; docs/acceptance/03_REQUIREMENTS.md; '+status),
S('AT-23　Google初期化・永続化',['状態：BLOCKED。担当・期限：未定。担当候補：導入担当と管理者。','前提：専用シートとGAS、既定カレンダー、AUTH_USERS_JSONを準備。','実施：initSpreadsheet再実行、既存行保持、生徒登録と再取得を確認。','完了条件：実台帳に1行保存し、再読込後も保持。設定版・画面・行の証跡を保存。'],'docs/acceptance/06_ACCEPTANCE_TEST_SPEC.md; '+status),
S('AT-24／25　予約と取消の実同期',['状態：両方BLOCKED。担当・期限：未定。担当候補：導入担当と受入担当。','AT-24：AT-23合格後、予約1件を登録し、台帳と実予定の一対一対応を確認。','AT-25：AT-24の予約を取消し、台帳の取消状態と予定削除を確認。','完了条件：対象予約ID・予定ID、操作前後の証跡と実施結果を記録。'],auth+'; '+status),
S('AT-26　管理者2名・保護者の共有',['状態：BLOCKED。担当・期限：未定。担当候補：管理者と受入担当。','前提：実GASと個別キーを用意。管理者2名と保護者は別セッションで接続。','実施：端末間の反映、家庭A/Bの分離、権限変更や不正操作の拒否を確認。','完了条件：本人の範囲だけ操作でき、未認証・別家庭の取得や更新を拒否。'],auth+'; '+status),
S('AT-27　同時完了の排他制御',['状態：BLOCKED。担当・期限：未定。担当候補：導入担当と管理者。','前提：実GAS、同じ予約を開く独立した管理者2セッション。','実施：同時完了と同じ操作の再試行。送迎行、状態、残数を照合。','完了条件：完了1件で片道1枚だけ消費し、再試行で変わらない。'],auth+'; '+status),
S('AT-28　バックアップからの復旧',['状態：BLOCKED。担当・期限：未定。担当候補：保守担当と受入担当。','前提：保存先、バックアップ先、復旧担当、復旧手順を確定。','実施：検証用データを退避して復元し、台帳とカレンダーを照合。','完了条件：生徒、予約、購入履歴、残高、予定の整合を回復し、証跡を保存。'],auth+'; '+status),
S('AT-29　実機受入',['状態：BLOCKED。担当・期限：未定。担当候補：教室管理者と受入担当。','前提：実iPhoneのSafari、実AndroidのChrome、実連携のテスト利用者。','実施：入力、確認、予約、取消、管理者の完了処理を実機で確認。','完了条件：必要操作を実行でき、端末・ブラウザー・担当者の確認記録がある。'],status+'; docs/acceptance/06_ACCEPTANCE_TEST_SPEC.md'),
S('AT-30　リリース後のスモークテスト',['状態：BLOCKED。担当・期限：未定。担当候補：配備担当と受入責任者。','前提：全必須項目の合格、受入確認、本番公開の承認・実施。','実施：公開版と保存ソースの一致、ログイン、予約、取消、完了、権限を確認。','完了条件：重大不具合なし、正常版へ戻せる手順あり、受入責任者が結果を確認。'],status+'; docs/acceptance/13_MIGHTY_TEST_DEPLOYMENT.md'),
S('文書・業務上の追加確認',['文書整合：旧運用手順書のGA、構成、保証・費用の断定を現状へ更新する。','操作仕様：往復の帰り時刻、登録情報の訂正方法を教室と合意する。','DVT-01：AT-07の指定17:30に対し、既存実行は16:30。時刻どおりの証跡を補完。','本3資料は作成済み。受入後に実URL、担当、連絡先、開始日を追記して版を確定。'],'docs/OPERATION_RUNBOOK.md; src/components/AddRideModal.tsx; '+status),
S('実施順と完了記録',['準備事項を決定後、AT-23を実施。続いてAT-24、AT-25を実施。','接続と利用者の準備後、AT-26・27・28・29を確認し、残る不具合を再試験。','受入責任者の確認と公開実施後にAT-30を確認し、開始可否を判断。','各記録にID、実施日時、実施者、対象版、期待結果、実結果、証跡パスを残す。'],status+'; docs/acceptance/06_ACCEPTANCE_TEST_SPEC.md'),
];
function text(slide,value,x,y,w,h,size=28,color='#183431',bold=false){const s=slide.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});s.text=value;s.text.style={typeface:'Yu Gothic',fontSize:size,color,bold};return s;}
const result=[];
for(const [name,data] of [['operation-manual',ops],['user-manual',user],['remaining-tasks',task]]){
 const p=Presentation.create({slideSize:{width:1280,height:720}});
 for(const [i,d] of data.entries()){
  const s=p.slides.add();s.background.fill=i===0?'#123D35':'#F9FAF6';
  if(i===0){text(s,d.title,76,172,1128,105,58,'#FFFFFF',true);text(s,d.lines.join('\n'),80,340,1100,225,28,'#DCECE2');}
  else {text(s,d.title,64,54,1152,80,42,'#123D35',true);
   if(d.shot){let bytes=await fs.readFile(d.shot.endsWith('AT-21-form.png')?build+'/form-detail.png':root+'/'+d.shot);s.images.add({blob:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),contentType:'image/png',alt:d.title+'（合成データのローカル試験画面）',fit:'contain',position:{left:630,top:150,width:585,height:470}});d.lines.forEach((t,k)=>text(s,t,64,166+k*135,530,124,27));text(s,'画面例：合成データによるローカル試験',630,626,585,36,18,'#677A71');}
   else d.lines.forEach((t,k)=>text(s,t,72,166+k*112,1136,100,29));
  }
  text(s,`${String(i+1).padStart(2,'0')} / ${data.length}`,1120,675,110,30,17,i===0?'#DCECE2':'#677A71');
  s.speakerNotes.text=`根拠（リポジトリ相対パス）: ${d.refs}\n基準日: 2026-10-20 JST。実装確認と既存試験記録に基づく。実Google受入は未実施。${d.shot?'\n画面出典: '+d.shot+'。合成データ、ローカル試験の画面例。':''}`;
 }
 await fs.mkdir(build+'/'+name,{recursive:true});
 const candidate=build+'/'+name+'/candidate.pptx';
 await (await PresentationFile.exportPptx(p)).save(candidate);
 const final=out+'/'+name+'-2026-10-20-v3.pptx';
 await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:py,integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Yu Gothic']},verifyArtifactToolImport:true,receiptPath:build+'/'+name+'/validation-v3.json',explicitTotalSlideCount:data.length,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[]});
 for(const [i,s] of p.slides.items.entries()){const png=await p.export({slide:s,format:'png',scale:1});await fs.writeFile(build+'/'+name+'/'+String(i+1).padStart(2,'0')+'.png',new Uint8Array(await png.arrayBuffer()));}
 result.push({name,path:final,slides:data.length});console.log(JSON.stringify(result.at(-1)));
}
await fs.writeFile(build+'/result.json',JSON.stringify(result,null,2));
await fs.writeFile(build+'/content.json',JSON.stringify({ops,user,task},null,2));



