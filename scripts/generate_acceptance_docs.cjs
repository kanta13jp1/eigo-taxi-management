// LEGACY_TRACEABILITY_GUARD: historical generator superseded by registry.
throw new Error('Use npm run docs:generate. This legacy generator would overwrite current traceability documents.');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {cases,flows}=require('./acceptance-catalog.cjs');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'docs/acceptance');
fs.mkdirSync(dir,{recursive:true});
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex');
const latest=fs.existsSync(path.join(dir,'latest-run.json'))?JSON.parse(fs.readFileSync(path.join(dir,'latest-run.json'))):null;
const run=latest?JSON.parse(fs.readFileSync(path.join(dir,'runs',latest.runId,'results.json'))):null;
const results=new Map((run?.results||[]).map(r=>[r.id,r]));
const servicePath=path.join(dir,'service-checks/latest.json');
const service=fs.existsSync(servicePath)?JSON.parse(fs.readFileSync(servicePath)):null;
const serviceFor=c=>(service?.results||[]).filter(r=>r.acceptanceIds.includes(c.id));
const serviceLink=c=>serviceFor(c).map(r=>ref('11_GAS_REGRESSION.md',r.id)).join(', ');
const defects={
 'AT-21':'DEF-07 / P2: 公開版の保護者画面が指定375pxに対して388pxまで拡張。公開試験PUB-18で検出。',
 'AT-15':'DEF-01 / P1: 同じ片道予約の完了2回で残高7→5（期待6）。終端状態確認・同一操作ID・サーバー側排他を実装。',
 'AT-16':'DEF-02 / P1: 取消済み予約を完了でき残高7→6。scheduled以外の完了をサーバー側で拒否。',
 'AT-17':'DEF-03 / P1: 負数チケット追加が成功扱い。正整数・許容金額をサーバーと入力画面で検証。',
 'AT-18':'DEF-04 / P1: 通信失敗後も予約成功オブジェクトを返す。デモと実接続を分離し失敗の明示・安全な再試行・同期状態管理を実装。',
 'AT-19':'DEF-05 / P1: 未認証で管理画面と生徒氏名を閲覧可能。管理者認証とサーバー側認可を実装。',
 'AT-20':'DEF-06 / P1: 利用者画面で別家庭の生徒を選択可能。家庭と生徒の紐付け・API所有者検証を実装。',
};
const fixes={
 'AT-21':'予定カードの左列にmin-w-0/flex-1、日付行に折返しを指定。実際の指定幅375pxとscrollWidth/innerWidthの両方を照合するようAT-21も強化。',
 'AT-15':'クライアント/GASでcompleted再処理は消費0として返す。GASはScriptLock内で状態・残高を読んで更新し、操作ID再送を検出。デモの予定自動復活も削除。',
 'AT-16':'scheduledだけ完了可能とし、cancelledでは残高・状態を変更しない。GASが保存済み状態を確認する。',
 'AT-17':'画面/API/GASで整数・有限値・1〜100枚・金額0以上を検証し、不正入力では履歴・残高を更新しない。',
 'AT-18':'実連携の失敗をthrowし、デモへ切替えない。全5更新操作の成功応答を検証。UIは失敗時にフォームとエラーを残す。取消も成功応答後に反映。再試行IDを保持。GASは補償と未確定操作ガードで不明な更新を成功扱いしない。',
 'AT-19':'個人専用の高エントロピーアクセスキーでログイン。キーはPOST本文、ブラウザではsessionStorageだけに保持。GASはScript PropertiesのSHA-256照合で毎要求を検証。未設定・不正キーは拒否。',
 'AT-20':'サーバー設定のrole/studentIdsで参照と更新を制限。保護者には管理メニューを出さず、自分の家庭以外への直接API要求も拒否。クライアント指定の役割・氏名・カレンダーIDは認可根拠にしない。',
};
const status=c=>results.get(c.id)?.status||'NOT RUN';
const portalAmendment='> 2026-10-20仕様追補: [管理者・家庭別ポータル分離／個別URL・QR](../PORTAL_SEPARATION.md)と[最新進捗Step 06](../progress/2026-10-20-step-06.md)を優先。以下は各実行時点の結果。AT-23の実Google合格はStep 05、AT-24〜30の7件は未合格。ポータル補足試験は元の30受入項目と別集計。';
const developerSetupAmendment='> 2026-10-21変更仕様（外部設定・公開前）: [開発者セットアップ・Google本人確認](../DEVELOPER_SETUP_OVERVIEW.md)。通常利用者の接続先URL・長いキー入力を廃止する準備中。新方式の実Google受入を過去のキー方式の合格で代替しません。';
const write=(file,title,body)=>fs.writeFileSync(path.join(dir,file),`# ${title}\n\n${developerSetupAmendment}\n\n${portalAmendment}\n\n文書版: 2026-10-20 / 不合格6件修正・再試験版。実環境の受入済み・リリース済みを意味しない。\n\n${body}\n`);
const safe=s=>String(s).replace(/\|/g,'／').replace(/\n/g,'<br>');
const table=(heads,rows)=>`| ${heads.join(' | ')} |\n| ${heads.map(()=> '---').join(' | ')} |\n${rows.map(r=>`| ${r.map(safe).join(' | ')} |`).join('\n')}\n`;
const anchor=id=>`<a id="${id}"></a>`;
const ref=(file,id)=>`[${id}](${file}#${id})`;
const files={bf:'01_BUSINESS_FLOWS.md',uc:'02_USE_CASES.md',req:'03_REQUIREMENTS.md',fs:'04_FUNCTIONAL_SPEC.md',task:'05_TASKS.md',id:'06_ACCEPTANCE_TEST_SPEC.md',code:'07_TRACEABILITY_MATRIX.md',test:'06_ACCEPTANCE_TEST_SPEC.md'};
const refs=c=>['bf','uc','req','fs','task','id','code','test'].map(k=>ref(files[k],c[k])).join(' / ');
function source(c){
 const lines=fs.readFileSync(path.join(root,c.file),'utf8').split(/\r?\n/);
 const line=lines.findIndex(l=>l.includes(c.symbol))+1;
 if(!line)throw Error(`Missing symbol ${c.file}:${c.symbol}`);
 return {line,link:`[${c.file}:${line}](../../${c.file}#L${line})`,sha256:hash(c.file)};
}
const src=new Map(cases.map(c=>[c.id,source(c)]));
write('01_BUSINESS_FLOWS.md','ビジネスフロー一覧（DOC-BF-001）',
 `対象: Mauro・Brendaの管理者2名と生徒・保護者による完全予約制の送迎。片道1回消費。定期自動登録、LINE自動通知、オンライン決済は今回対象外。\n\n`+
 flows.map(([n,title,actor,steps,end])=>{const related=cases.filter(c=>c.bf===`BF-${n}`);return `${anchor(`BF-${n}`)}\n## BF-${n} ${title}\n\n担当: ${actor}。開始: ${n==='01'?'導入時':n==='08'?'受入開始時':'該当業務の依頼・発生時'}。\n\n業務順序: ${steps}。\n\n終了条件: ${end}。例外時はBF-07に接続し、失敗状態と担当者を記録する。\n\n${related.map(refs).join('\n\n')}`;}).join('\n\n')+
 '\n\n全体順序: BF-01 → BF-02 → BF-03 → BF-04 → BF-05（取消）またはBF-06（実施）→ BF-03。BF-07は全業務横断、BF-08で受入・公開・保守を判定する。');
write('02_USE_CASES.md','ユースケース一覧（DOC-UC-001）',
 'アクター: ACT-01 管理者Mauro、ACT-02 管理者Brenda、ACT-03 生徒・保護者、ACT-04 導入・運用担当、ACT-05 Google連携。主担当は業務フローの担当者に準ずる。\n\n'+
 cases.map(c=>`${anchor(c.uc)}\n## ${c.uc} ${c.title}\n\n${refs(c)}\n\n事前条件: ${c.pre}。\n\n基本フロー: ${c.steps}。\n\n事後条件: ${c.expected}。\n\n代替・例外: 入力不備・権限不足・通信失敗では確定せず理由を提示する。重複処理の詳細はUC-15〜UC-18、運用復旧はUC-28。現実装が満たすかは結果書を参照。`).join('\n\n'));
write('03_REQUIREMENTS.md','要件定義書（DOC-REQ-001）',
 `目的: スマホ予約・取消・当日運行・チケット管理を管理者2名と保護者間で整合させる。Googleシートを台帳、カレンダーを運行予定とする。\n\n要求の根拠は提供された10月7〜8日のチャット。既存コードや旧資料の記載だけでは業務合意・本番稼働を認定しない。運用ルールは受入基準案を含む。REQ-15〜20の不合格修正は今回のユーザー依頼で実装対象として確定。業務上の受入承認は未確認。\n\n`+
 cases.map(c=>`${anchor(c.req)}\n## ${c.req} ${c.title}\n\n${refs(c)}\n\n要求: ${c.expected}。\n\n出所: ${c.origin}。優先度: 必須（案）。判定: ${c.id}で検証。現状: ${status(c)}。`).join('\n\n')+
 `\n\n## 決定事項・確認待ち\n\n- DEC-01 確定: 管理者2名と利用者の画面、都度予約・取消、片道1回消費。REQ-03〜REQ-14。\n- DEC-02 提案: 往復2回を完了時にまとめて消費。迎え・送り別の時刻や片道だけ実施時の精算は未確定。REQ-08、REQ-14。\n- DEC-03 提案: 残少表示は残2回以下。元チャットは閾値未指定。管理者は現状1回以下。統一方針は確認待ち。REQ-04。\n- DEC-04 確認待ち: 当日予約・取消の締切、重複時間枠、予約の即時確定か管理者承認か、残高不足時の受付。REQ-06〜REQ-11、REQ-13〜REQ-14。現状を業務合意と見なさない。\n- DEC-05 確認待ち: 管理者のGoogleアカウント、個人専用アクセスキーの本人への配布・失効手順、兄弟姉妹のstudentIds紐付け、データ保持期間・削除担当。REQ-19〜REQ-20、REQ-26、REQ-28。\n- DEC-06 対象外: 定期予約自動生成・LINE通知・オンライン決済。金額は受領記録に限定。REQ-05。\n- DEC-07 確認待ち: マイティGCPのテスト専用プロジェクト・所有者・利用権限・課金条件。CLIは再認証要求のため未確認。REQ-23〜REQ-30。`);
write('04_FUNCTIONAL_SPEC.md','機能仕様書（DOC-FS-001）',
 `データ: Student（id/name/parentName/phone/address/pickupNote/ticketBalance/createdAt）、RideReservation（id/studentId/studentName/rideDate/rideTime/rideType/pickupLocation/status/calendarEventId/note/reservedBy/completedAt）、TicketPurchase（id/studentId/studentName/purchaseDate/ticketCount/amount/note）。型正本: [src/types/index.ts](../../src/types/index.ts)。\n\n状態遷移の受入目標: scheduled → completed または cancelled。completedの再要求は消費0の冪等応答、cancelledの完了は拒否する。完了時に片道1、往復2を一度だけ引く。Google側の更新・カレンダー失敗は成功と偽らず、未完了状態・再試行方法を示す。サーバー側で権限・入力・排他を検証する。コードの修正内容・ローカル回帰結果・実環境の未確認を区別して記録する。\n\nAPI改訂: GETは公開ヘルス応答のみ。データ参照・更新・loginはPOST JSON {action,token,...params}（Content-Type text/plain）。loginで検証したrole/studentIdsを画面に反映し、GASは各要求でキーをSHA-256照合して権限を再検証する。キーはsessionStorage、接続先のみlocalStorage。デモはログイン画面で明示選択した架空台帳に限定し、教室APIへ送信しない。実連携で失敗した要求は成功扱いもデモ切替もしない。予約/購入/生徒作成の操作IDを未確定時に保持し、同一内容の再試行に再利用する。GASはScriptLockで状態遷移と残高を保護する。Sheets/Calendarを跨ぐ厳密なトランザクションはなく、補償不能・結果不明時はPENDING_MUTATION_JSONで処理を停止し管理者照合を求める。\n\n`+
 cases.map(c=>`${anchor(c.fs)}\n## ${c.fs} ${c.title}\n\n${refs(c)}\n\n入力・前提: ${c.pre}。処理: ${c.steps}。出力・検証可能な結果: ${c.expected}。\n\n実装参照（実装候補・関連箇所を含む）: ${src.get(c.id).link} / ${c.symbol}。判定は${c.id}: ${status(c)}。コード参照が存在しても要件充足の証明にはならない。`).join('\n\n'));
write('05_TASKS.md','タスクリスト・リリース対応（DOC-TASK-001）',
 '各タスクは要件の実装・検証・再試験までを完了条件とする。PASSはローカル自動確認済みであり、運用受入完了ではない。FAIL/NOT RUN/BLOCKEDは未完了。\n\n'+
 cases.map(c=>`${anchor(c.task)}\n## ${c.task} ${c.title}\n\n${refs(c)}\n\n担当（案）: ${c.kind==='external'?'導入担当・管理者・受入担当':'開発担当'}。状態: ${status(c)}。\n\n次の対応: ${status(c)==='PASS'?'ローカル検証済み。Google連携環境・実機での後続確認と受入を行う。':status(c)==='FAIL'?'結果書の実測との差を修正し、対象テストと影響範囲を再実行する。':'専用Google環境・権限・担当者・前段条件を準備し、仕様の手順で実施する。'}\n\n完了条件: ${c.expected}。証跡: ${c.id}の合格結果と画面キャプチャ。`).join('\n\n'));
write('06_ACCEPTANCE_TEST_SPEC.md','受入テスト仕様書（DOC-AT-001）',
 `対象版: results.jsonのcommitとsourceHashesで識別。時刻: Asia/Tokyo、実測のタイムスタンプはUTCを併記。\n\n再実行: リポジトリで npm ci → npm run build → npm run lint → node scripts/test_gas.cjs → node scripts/run_acceptance.cjs → node scripts/generate_acceptance_docs.cjs → node scripts/validate_acceptance.cjs。PCメモリ不足時はRAYON_NUM_THREADS=1、UV_THREADPOOL_SIZE=2を設定。実行はローカル4179番を使用、既存同ポートは停止せず起動失敗扱い。隔離Chromiumを終了しサーバープロセスも終了する。\n\n自動22件はViteソースを読み込み、API・LocalStorageの値をassertし画面を採取。画面操作を行う項目とサービス呼出を行う項目を以下に明記。実Google APIへの外部通信は禁止しているため外部8件の代替証明にはならない。各自動ケースは保存データ・セッションを初期化。未認証確認AT-19以外は明示的に管理者/保護者デモを開く。STU-001残7・STU-002残1・STU-003残0、初期予約3件（保護者には自家庭分のみ）・購入履歴空。AT-18はローカル模擬APIログイン後の通信失敗とUIエラーを検証する。実GAS接続ではない。ダミー情報のみ。\n\n合格: 全期待値assert成功。失敗: 差異または実行例外。BLOCKED: 実環境・前提不足。画面だけで内部データ・同期・排他を合格としない。自動の画面証跡は観測データJSONと組み合わせる。実機・見た目の最終承認はAT-29で別途実施。未実施ケースに画像を捏造しない。\n\n`+
 cases.map(c=>`${anchor(c.id)}\n${anchor(c.test)}\n## ${c.id} ${c.title}\n\n${refs(c)}\n\n前提・データ: ${c.pre}。\n\n手順: ${c.steps}。\n\n期待結果: ${c.expected}。\n\n実施方法: ${c.kind==='auto'?`自動: [scripts/run_acceptance.cjs](../../scripts/run_acceptance.cjs) の handlers['${c.id}']。サービス呼出は画面再描画と保存値を照合し、純粋な手動操作試験と区別する。`:'手動実環境試験。担当者は専用環境に対して上記手順を実行し、対象ID・実施時刻・画面・シート行・イベントID（該当時）・期待との差異をresults.jsonと同じ形式の別実行記録へ保存する。未承認の本番データ変更はしない。'}\n\n証跡要件: ${c.id}の操作前後が識別できる画面、対象ID・残高・履歴の実測記録。外部ケースはGoogleコンソール/シート/カレンダーまたは実機の該当画面を追加する。未実施は証跡なしと記録。`).join('\n\n'));
write('07_TRACEABILITY_MATRIX.md','トレーサビリティマトリックス（DOC-TM-001）',
 '1行を受入項目の追跡単位とし、各文書からもこの関係を逆引きできる。CODEは関連コードの参照IDであり、未実装の要件を実装済みとは判定しない。TESTは自動ハンドラまたは仕様書内の手動手順を指す。\n\n'+
 table(['業務','UC','要件','機能','タスク','受入','実装参照ID・コード','テストコード/手順','結果'],cases.map(c=>[
 ...['bf','uc','req','fs','task','id'].map(k=>ref(files[k],c[k])),
 `${anchor(c.code)}${c.code}: ${src.get(c.id).link} (${c.symbol})${c.relatedCode?.length?'<br>関連実装: '+c.relatedCode.map(f=>`[${f}](../../${f})`).join(', '):''}`,
 `${ref(files.test,c.test)}: ${c.kind==='auto'?`[handlers ${c.id}](../../scripts/run_acceptance.cjs#L${fs.readFileSync(path.join(root,'scripts/run_acceptance.cjs'),'utf8').split(/\r?\n/).findIndex(l=>l.includes(`'${c.id}':`))+1})`:'手動実環境手順（自動コードなし）'}${serviceFor(c).length?'<br>GAS VM回帰（実環境受入の代替ではない）: '+serviceLink(c):''}`,
 `[${status(c)}](08_ACCEPTANCE_RESULTS.md#${c.id}-result)`,
 ]))+'\n\nコードのSHA-256は各実行results.jsonに保存。ファイル更新時は行番号再生成と再試験が必要。ファイルの参照だけでなくシンボル・ハッシュ・テスト実測を組み合わせる。');
const counts={};for(const c of cases)counts[status(c)]=(counts[status(c)]||0)+1;
write('08_ACCEPTANCE_RESULTS.md','画面キャプチャ付き受入テスト結果仕様書（DOC-ATR-001）',
 `判定: **リリース不可（未受入）**。不合格・未実施を残したままリリースしない。\n\n${table(['総数','PASS','FAIL','BLOCKED','NOT RUN'],[[cases.length,counts.PASS||0,counts.FAIL||0,counts.BLOCKED||0,counts['NOT RUN']||0]])}\n`+
 (run?`実行ID: ${run.runId}。対象: ${run.url}。方式: ${run.mode}。タイムゾーン: ${run.timezone}。基準コミット: ${run.commit}（未コミットのテスト・仕様書を含むためsourceHashesも参照）。\n\n[生データ・assert結果・ソース/画像ハッシュ](runs/${run.runId}/results.json) / [サーバーログ](runs/${run.runId}/server.log)。`:'未実行。')+
 '\n\n旧docs/evidenceおよびGoogleDrive_Upload配下の結果は過去の参考資料として保持する。コード表示によるカレンダー検証・assertなしのPASS・同一ブラウザ内の切替は、今回の実Google連携・複数端末の合格として引き継がない。\n\n'+
 cases.map(c=>{const r=results.get(c.id);return `${anchor(c.id+'-result')}\n## ${c.id} ${c.title}: ${status(c)}\n\n${refs(c)}\n\n期待: ${c.expected}。\n\n実測: ${safe(r?.detail||'実行記録なし')}。\n\n開始: ${r?.startedAt||'—'} / 終了: ${r?.finishedAt||'—'}。\n\n${r?.screenshots?.length?r.screenshots.map(s=>`![${c.id} 実測画面](runs/${run.runId}/${s.file})\n\n画像SHA-256: ${s.sha256}`).join('\n\n'):'画面証跡なし（未実施）。'}\n\n次の対応: ${ref(files.task,c.task)}。`;}).join('\n\n'));
write('09_RELEASE_AND_DELIVERABLES.md','リリース条件・追加成果物（DOC-REL-001）',
 `本成果物は受入基準案とローカル実測。リリース実施は保留。ビジネス上の受入確認者: 未指定、承認日時: 未記入。\n\n`+
 table(['項目ID','条件・成果物','追跡先','現状'],[
 ['REL-01','業務ルール合意（締切・不足残高・往復・閾値・家庭紐付け）','DEC-01〜07 / REQ-04,06〜14,19〜20','確認待ち'],
 ['REL-02','本人確認・権限制御・二重消費・通信失敗の解決','TASK-15〜20 / AT-15〜20',Object.keys(fixes).every(id=>results.get(id)?.status==='PASS')?'コード修正・画面/APIローカル再試験合格。GAS回帰と実環境確認は別記':'修正・再試験中。結果書参照'],
 ['REL-03','マイティ専用環境の所有者・権限・接続設定確認','TASK-23〜27 / AT-23〜27','再認証と環境準備待ち'],
 ['REL-04','全必須受入合格、証跡・ハッシュ・未解決重大障害ゼロ','公開前AT-01〜29 / 公開後AT-30 / DOC-ATR-001','ローカル以外は未達'],
 ['REL-05','本番前の受入確認と変更対象の確定','AT-01〜29 / DOC-ATR-001','未確認。承認後にリリース作業へ'],
 ['REL-06','リリース後のスモーク確認','AT-30 / .github/workflows/deploy.yml','公開後確認。合格でリリース完了'],
 ['DEL-01','環境構成・アカウント/権限一覧・接続先の管理台帳','REQ-19〜20,23〜27','追加作成を推奨。秘密情報自体は文書に書かない'],
 ['DEL-02','不具合台帳（担当・重大度・再現・修正版・再試験）','TASK-15〜20ほかFAIL / DOC-ATR-001','今回タスク・結果書で初期管理。修正時に版を追記'],
 ['DEL-03','データ移行・初期残高照合・個人情報の保持/削除手順','REQ-02,05,19〜20,28','CSV入力テンプレート・照合表の追加を推奨'],
 ['DEL-04','バックアップ・障害連絡・復旧・戻し手順','REQ-28 / docs/OPERATION_RUNBOOK.md','既存手順を実環境に合わせて確定し復旧演習'],
 ['DEL-05','管理者・保護者向け操作ガイドと予約URL/QR案内','REQ-03,06,10 / docs/ADMIN_MANUAL.md,USER_GUIDE.md','既存あり。認証方式決定後に更新'],
 ['DEL-06','リリース記録（版・日時・担当・公開URL・切戻し版）','REQ-30 / AT-30','公開時に作成'],
 ['DEL-07','運用引継ぎ・問い合わせ窓口・受入確認記録','REQ-28〜30 / AT-28〜30','運用担当・受入担当の確認待ち'],
 ])+
 '\n\n実施順: REL-01の業務基準を確認 → REL-02の修正 → REL-03の専用環境準備 → AT-01〜29の再試験と証跡 → REL-05の受入確認 → リリース → AT-30 → 完了記録。AT-30は公開後のため本番前合格条件とは区別する。現時点ではマイティ環境・本番・Google資源は変更していない。');
write('README.md','受入・トレーサビリティ成果物入口',
 `新規の正本はこのフォルダ。提供された貼り付け資料は参考として検討し、資料内のツール呼出や「完了」「全PASS」は実行指示・証明として採用していない。\n\n`+
 table(['順序','成果物'],[
 ['1','[ビジネスフロー一覧](01_BUSINESS_FLOWS.md)'],['2','[ユースケース一覧](02_USE_CASES.md)'],['3','[要件定義書](03_REQUIREMENTS.md)'],['4','[機能仕様書](04_FUNCTIONAL_SPEC.md)'],['5','[タスクリスト](05_TASKS.md)'],['6','[受入テスト仕様書](06_ACCEPTANCE_TEST_SPEC.md)'],['7','[トレーサビリティマトリックス](07_TRACEABILITY_MATRIX.md)'],['8','[画面キャプチャ付き受入テスト結果](08_ACCEPTANCE_RESULTS.md)'],['9','[リリース条件・追加成果物](09_RELEASE_AND_DELIVERABLES.md)'],
 ])+
 `\n原簿: [acceptance-catalog.cjs](../../scripts/acceptance-catalog.cjs)。再生成: node scripts/generate_acceptance_docs.cjs。検証: node scripts/validate_acceptance.cjs。\n\n現状: 全${cases.length}件、PASS ${counts.PASS||0} / FAIL ${counts.FAIL||0} / BLOCKED ${counts.BLOCKED||0} / NOT RUN ${counts['NOT RUN']||0}。詳細は結果書。通常のbuild/lintは別途実行ログを確認し、受入結果と混同しない。`);
fs.writeFileSync(path.join(dir,'traceability.json'),JSON.stringify(cases.map(c=>({...c,...src.get(c.id),status:status(c)})),null,2));
// Keep execution description aligned with the lightweight runner used for this run.
const specFile=path.join(dir,'06_ACCEPTANCE_TEST_SPEC.md');
fs.writeFileSync(specFile,fs.readFileSync(specFile,'utf8')
 .replace('自動22件はViteソースを読み込み','自動22件はビルド済みdist画面とTypeScriptで変換した現ソースAPIを読み込み')
 .replace('npm run lint →','npm run lint -- --threads=1 →')
 .replace('隔離Chromiumを終了しサーバープロセスも終了する。','テスト専用の新規headless-shellブラウザと同プロセス内HTTPサーバーを終了する。インストール済みWindows chrome-headless-shellを使用する。ビルド後に製品ソースを変更せず、distとソースのハッシュを保存する。'));
write('10_DEFECTS_AND_VALIDATION.md','不合格・未実施・検証記録（DOC-DEF-001）',
 '重大度P1は運用開始前に解消する分類。初回2026-10-19の不合格6件を今回修正。担当: クライアント/画面はリード、GASとVM回帰は専任ワーカー。修正版は最新results.jsonのソースハッシュと作業ツリーで識別。外部公開・GASデプロイは未実施。\n\n'+
 table(['不具合ID・重大度・初回再現結果','今回の修正','要件・タスク・再試験','状態'],Object.entries(defects).map(([id,detail])=>{const c=cases.find(c=>c.id===id);return [detail,fixes[id],refs(c),status(c)==='PASS'?'修正済み・ローカル再試験PASS（実環境の受入は未完了）':`修正・再確認中: ${status(c)}`];}))+
 '\n\n'+table(['未実施','阻害要因','必要な対応'],cases.filter(c=>c.kind==='external').map(c=>[ref(files.id,c.id),c.pre,ref(files.task,c.task)+' / '+c.steps]))+
 '\n\n初回の不合格・実行基盤異常の試行もruns内に保持する。最新の実行結果だけを今回の結果書に集計し、過去の画像を再試験証跡として流用しない。ビルド/lintは品質ログを参照。\n\n追加検討: 残高不足時の予約受付・取消締切・時間枠重複・往復の片道実施・予約承認方式はDEC-02〜05の合意後にケースを追加する。今回の完了処理は不足分を消失させないため残高不足では拒否し、追加後に再実行する。業務上の最終合意は別途必要。');
write('11_GAS_REGRESSION.md','GASローカル回帰テスト結果（DOC-GAS-TEST-001）',
 `実行: ${service?.executedAt||'未実施'}。方式: ${service?.mode||'未実施'}。\n\n${service?`合格${service.counts.passed} / 不合格${service.counts.failed} / 全${service.counts.total}グループ。[不変の実行結果JSON](../../${service.reportFile})。`:''}\n\nこれはGoogleサービスをスタブ化したNode VM試験。認証・家庭別認可・状態遷移・入力検証・再送・失敗注入・補償・ガードを確認する。ScriptLockの競合も模擬であり、実GAS同時実行や実カレンダー・実シート・異端末の検証ではない。AT-23〜30はこの試験に合格しても未実施のまま。\n\n`+
 (service?.results||[]).map(r=>{const line=fs.readFileSync(path.join(root,'scripts/test_gas.cjs'),'utf8').split(/\r?\n/).findIndex(l=>l.includes(`check('${r.id}'`))+1;return `${anchor(r.id)}\n## ${r.id} ${r.name}: ${r.status}\n\n分類: ${r.category}。不具合: ${r.defects.join(', ')||'—'}。\n\n対応する受入・要件・実装: ${r.acceptanceIds.map(id=>{const c=cases.find(c=>c.id===id);return c?refs(c):id;}).join(' / ')}\n\n[テストコード:${line}](../../scripts/test_gas.cjs#L${line}) / [実装GAS](../../gas/Code.gs)。\n\n実測: ${r.detail}`;}).join('\n\n')+
 '\n\nソースSHA-256:\n\n'+table(['ファイル','SHA-256'],Object.entries(service?.sourceHashes||{})));
const screenshotCount=run?.results.reduce((n,r)=>n+r.screenshots.length,0)||0;
fs.appendFileSync(path.join(dir,'README.md'),`\n\n[不具合の修正内容・未実施一覧](10_DEFECTS_AND_VALIDATION.md) / [GAS回帰テスト結果](11_GAS_REGRESSION.md) / [ビルド・lint・整合性検証記録](quality_checks.txt) / [GAS認証・導入手順](../GAS_AUTH_SETUP.md)\n\n今回の画面証跡: ${screenshotCount}枚。GASの追加ローカル回帰: ${service?.counts.passed||0}/${service?.counts.total||0}グループ合格（実Google連携の受入とは別集計）。\n`);
fs.appendFileSync(path.join(dir,'05_TASKS.md'),'\n\n具体的な不具合・重大度・修正方針・再試験の対応は[不具合台帳](10_DEFECTS_AND_VALIDATION.md)を参照。\n');
fs.appendFileSync(path.join(dir,'08_ACCEPTANCE_RESULTS.md'),'\n\n不合格の原因と対応: [不具合台帳・未実施一覧](10_DEFECTS_AND_VALIDATION.md)。\n');
fs.appendFileSync(path.join(dir,'08_ACCEPTANCE_RESULTS.md'),`\n\n今回の画面証跡${screenshotCount}枚。初回はPASS16/FAIL6/BLOCKED8、今回はPASS${counts.PASS||0}/FAIL${counts.FAIL||0}/BLOCKED${counts.BLOCKED||0}。[初回の不変記録](runs/2026-10-19T14-45-09-864Z/results.json)。\n\n[GAS回帰テスト](11_GAS_REGRESSION.md) は ${service?.counts.passed||0}/${service?.counts.total||0}グループ合格。GASの実デプロイ後にAT-23〜30を別途確認する。\n`);
const readmePath=path.join(root,'README.md');
fs.writeFileSync(readmePath,fs.readFileSync(readmePath,'utf8').replace('受入・リリース判定（2026-10-19）','受入・リリース判定（2026-10-20）').replace(/受入結果は \*\*[^\n]+?\*\*です。/,`受入結果は **合格${counts.PASS||0}件・不合格${counts.FAIL||0}件・未実施${(counts.BLOCKED||0)+(counts['NOT RUN']||0)}件で、リリース保留**です。`));
console.log(`Generated 12 documents and traceability.json; cases=${cases.length}`,counts);
if(fs.existsSync(path.join(dir,'hosted-latest.json')))require('./generate_hosted_report.cjs');
