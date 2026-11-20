"""One-time migration into the current, versioned trace registry. No network."""
import csv, json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
D=ROOT/'docs/traceability';D.mkdir(exist_ok=True)
legacy=json.loads((D/'legacy-catalog.json').read_text('utf-8'))
checklist=list(csv.DictReader((ROOT/'docs/acceptance/third-party-acceptance-checklist.csv').open(encoding='utf-8-sig')))
ui=json.loads((ROOT/'docs/acceptance/flow-interface-2026-10-23/registry.json').read_text('utf-8'))
flows=[{'id':'BF-'+n,'title':title,'actor':actor,'steps':steps,'expected':expected} for n,title,actor,steps,expected in legacy['flows']]
flows += [dict(id='BF-09',title='利用者登録・停止・退会',actor='管理者・本人',steps='本人情報受領→利用登録→初回紐付け→変更・停止・退会',expected='管理者が日常運用し家庭範囲を維持'),dict(id='BF-10',title='台帳の保守修正',actor='管理者・保守',steps='対象確認→保全・操作停止→修正→関連照合→画面再取得',expected='検証と元台帳を混同せず関連値を維持'),dict(id='BF-11',title='文書・実装・検証の変更管理',actor='開発・レビュー担当',steps='ID登録→変更→自動生成→機械検査→差分レビュー',expected='工程間の参照と欠落を検知し受入と区別')]
code={1:[('src/services/google-auth.ts','signInGoogle'),('src/components/LoginScreen.tsx','LoginScreen')],2:[('gas/Code.gs','createStudent_')],3:[('src/components/ParentPortal.tsx','ParentPortal')],4:[('src/components/ParentPortal.tsx','ParentPortal')],5:[('gas/Code.gs','addTickets_')],6:[('gas/Code.gs','createReservation_')],7:[('gas/Code.gs','createReservation_')],8:[('gas/Code.gs','createReservation_')],9:[('src/components/AddRideModal.tsx','AddRideModal')],10:[('gas/Code.gs','cancelReservation_')],11:[('gas/Code.gs','cancelReservation_')],12:[('src/components/TeacherDashboard.tsx','TeacherDashboard')],13:[('gas/Code.gs','completeRide_')],14:[('gas/Code.gs','completeRide_')],15:[('gas/Code.gs','completeRide_')],16:[('gas/Code.gs','completeRide_')],17:[('gas/Code.gs','addTickets_')],18:[('gas/Code.gs','mutate_'),('src/services/api.ts','request')],19:[('gas/Code.gs','authenticateGoogle_')],20:[('gas/Code.gs','requireAccess_'),('src/portal.ts','assertPortal')],21:[('src/components/ParentPortal.tsx','ParentPortal')],22:[('src/App.tsx','App')],23:[('gas/Code.gs','initSpreadsheet')],24:[('gas/Code.gs','createReservation_')],25:[('gas/Code.gs','cancelReservation_')],26:[('gas/Code.gs','withLock_')],27:[('gas/Code.gs','withLock_')],29:[('src/App.tsx','App')],30:[('scripts/prepare_test_release.cjs','sourceDigest')],31:[('gas/Code.gs','saveManagedUser_'),('gas/Code.gs','deleteManagedUser_')],32:[('gas/Code.gs','authenticateGoogle_')],33:[('src/components/PortalInvitations.tsx','PortalInvitations'),('gas/Code.gs','getPortalInvitations_')],34:[('src/services/google-auth.ts','signOutGoogle'),('src/services/api.ts','endSession')],37:[('gas/Code.gs','cancelReservation_'),('gas/Code.gs','createReservation_')],38:[('scripts/traceability.py','validate') ]}
screens={1:['A01','E01','E04'],2:['A04','D03'],3:['P02'],4:['P02'],5:['D02'],6:['D01','P02'],7:['D01'],8:['D01'],9:['A02','D01'],10:['P02','D05'],11:['A03','D05'],12:['A02','E02'],13:['A02','A03'],14:['A02','A03'],15:['A02','A03'],16:['A03'],17:['D02'],18:['D01'],19:['A01','P01'],20:['P02'],21:['A02','P02','D01'],22:['A02','P02'],23:['E04'],24:['D01','E02','E03'],25:['D05','E02','E03'],26:['A02','P02'],27:['A02','A03'],28:['E03','E04'],29:['P02','D01'],30:['A01','P01'],31:['A06','D04'],32:['A01','P01','E01'],33:['A05','A06'],34:['A01','P01','A02','P02'],35:['E03','P02'],36:['E02','A02','P02'],37:['A03','D05','D01']}
ifmap={1:['IF-01','IF-15'],2:['IF-04','IF-11'],3:['IF-03'],4:['IF-03'],5:['IF-10','IF-11'],6:['IF-02','IF-13'],7:['IF-02','IF-13'],8:['IF-02','IF-13'],9:['IF-02'],10:['IF-05','IF-13'],11:['IF-05','IF-13'],12:['IF-03','IF-16'],13:['IF-06','IF-11'],14:['IF-06','IF-11'],15:['IF-06'],16:['IF-06'],17:['IF-10'],18:['IF-02','IF-09'],19:['IF-01'],20:['IF-01','IF-03'],21:['IF-03'],22:['IF-03'],23:['IF-15','IF-11'],24:['IF-02','IF-13'],25:['IF-05','IF-13'],26:['IF-03','IF-06'],27:['IF-06'],28:['IF-14','IF-15'],29:['IF-02','IF-05'],30:['IF-15'],31:['IF-08','IF-09'],32:['IF-01','IF-09'],33:['IF-07','IF-08'],34:['IF-01','IF-12'],35:['IF-14','IF-03'],36:['IF-16','IF-06'],37:['IF-05','IF-02']}
extras=[
 ('31','09','管理者による利用登録・停止・削除','管理者が本人メール・役割・対象生徒を登録し、変更・停止・削除する。','A06で登録・停止・再有効化・削除を行い次の通信の権限を確認。','許可リストだけを変更。業務履歴・Google本人は削除せず、自分の停止削除・最後の管理者喪失を拒否。'),
 ('32','09','初回Google本人紐付け','本人確認済みGoogleメールだけを事前登録と紐付ける。','事前登録した本人で初回ログイン。未確認メール・停止済み・他人で試す。','正しい本人だけ一度UIDへ移行し、役割を自己選択できない。'),
 ('33','09','家庭URL・QRの配布と再発行','個別URLとQRは管理者が本人へ配布し紛失時再発行する。','A05で表示・コピー。A06で再発行後、新旧URLで本人ログイン。','URLにキー・メールを含めず、旧URLは次の通信から拒否。'),
 ('34','07','Google認証・再読込・ログアウト','本人Googleでログインし毎通信で権限を確認。ログアウトで業務表示を消す。','管理者2名・家庭2つを別セッションでログイン・再取得・終了。','本人の役割と家庭を維持し、無効化・入口不一致・ログアウト後の業務アクセスを拒否。'),
 ('35','10','台帳直接編集と反映','保守担当が対象を保全し接続先台帳を修正、再読込と関連値を照合する。','同時操作停止・バックアップ後、検証台帳の対象値を修正しサイト再取得。','検証コピーと元台帳は非同期。直接修正で予定同期・消費計算・関連履歴更新を自動実行しない。'),
 ('36','06','カレンダー確認・実送迎・実績確認','先生が当日の予定と変更取消を照合し送迎を行い実績を確認する。','時刻・生徒・場所を確認し、お迎え／送り／往復を実施した記録を確認後に完了登録。','実移動やカレンダー閲覧だけで自動消費しない。未実施・取消を完了にしない。'),
 ('37','05','日時・場所変更と直前連絡','変更は教室へ連絡し、直接変更APIがないため取消後に新規予約する。','旧予約取消の成功を照合して新しい内容を登録し二重予約がないか確認。','取消と新規は別処理。片方だけ成功した場合は結果照合し盲目的に再送しない。'),
 ('38','11','工程横断のID・整合検査・共通デザイン','全工程のID・参照・定義値・対応漏れと成果物改変を機械検査する。','正本変更→生成→検査。重複ID・欠落・参照切れ・仕様値相違の異常系も確認。','異常時に非ゼロ終了。履歴と現行・自動試験と実受入を分離し、現行PPTは共通テーマ。')]
caps=[]
for c,row in zip(legacy['cases'],checklist):
 n=int(c['id'][3:]); title=row['確認内容'];pre=row['前提'];steps=row['操作手順'];expected=row['期待結果']
 if n==30:steps+=' AT-30は本番後確認で本番前全30件条件と時点が異なる。リハーサル採用の可否を責任者と確定する。'
 caps.append(dict(number=n,title=title,bf=c['bf'],requirement=expected,precondition=pre,steps=steps,expected=expected,origin=c['origin']))
for n,bf,title,req,steps,expected in extras:caps.append(dict(number=int(n),title=title,bf='BF-'+bf,requirement=req,precondition='架空データと許可された検証環境。必要な本人と担当者を準備。',steps=steps,expected=expected,origin='ユーザーの追加要望・実装確認'))
gas=(ROOT/'scripts/test_gas.cjs').read_text('utf-8')
groups={'schema':[23,2], 'authentication':[1,19,20,34], 'parent-authorization':[6,10,20], 'completion':[13,14,15,16,36], 'concurrency':[26,27], 'validation':[2,17,18], 'failures':[18,28], 'portal':[20,33], 'google-auth':[1,19,20,32,34], 'account-management':[31,32,33]}
tests=[]
for m in re.finditer(r"check\('(GAS-\d+)',\s*'([^']+)'",gas):
 tests.append(dict(id=m[1],path='scripts/test_gas.cjs',locator="check('"+m[1]+"'",requirements=['REQ-'+str(x).zfill(2) for x in groups.get(m[2],[18])],mode='offline-stub',category=m[2]))
for filename,prefix,reqs in [('scripts/test_portals.cjs','PT',[1,19,20,31,33,34]),('scripts/test_google_auth.cjs','SDK',[1,34])]:
 text=(ROOT/filename).read_text('utf-8'); names=re.findall(r"(?:await )?test\('([^']+)'",text)
 for i,name in enumerate(names,1):tests.append(dict(id=f'{prefix}-{i:02}',path=filename,locator="test('"+name+"'",requirements=[f'REQ-{x:02}' for x in reqs],mode='offline-stub',category='frontend-contract'))
for c in caps:
 n=c['number'];s=f'{n:02}';c.update({k:f'{v}-{s}' for k,v in [('req','REQ'),('design','FS'),('testSpec','TS'),('task','TASK'),('code','CODE'),('testCode','TEST'),('operation','OPS'),('user','USR')]})
 c['acceptance']=f'AT-{s}' if n<=30 else f'SAT-{s}'
 c['screens']=screens.get(n,[]);c['interfaces']=ifmap.get(n,[])
 c['implementation']=[dict(path=a,locator=b) for a,b in code.get(n,[])]
 c['tests']=[t['id'] for t in tests if c['req'] in t['requirements']]
 # Existing helper source is not proof that an old browser handler still verifies the current UI.
 c['manualReason']='' if c['implementation'] else '手動の保全・外部台帳操作／実送迎。業務処理の自動コードはない。'
 c['testGap']='' if c['tests'] else '現行の自動テストとの直接対応が未整備。手順は定義済み、テストコード／実測証跡は未完了。'
 c['status']='HOLD' if n in [24,25,30] else 'PENDING_ACCEPTANCE'
 c['acceptanceStatus']='BLOCKED' if n in [24,25,30] else 'NOT_RUN'
 c['designText']=f"画面 {', '.join(c['screens']) or '画面なし・文書検査'}。I/F {', '.join(c['interfaces']) or 'ローカル検査'}。{c['requirement']}"
 c['operationText']=f"担当者が前提を確認し、{c['steps']} 結果不明時は同一対象と履歴を照合してから判断する。"
 c['userText']=('開発・運用担当向け。利用者の直接操作は対象外。' if n in [23,24,25,27,28,30,38] else f"{c['title']}：{c['steps']}")
facts=dict(authentication='google',setupOwner='developer',dailyAccountOwner='admin',consumeAt='completion',oneWay=1,roundTrip=2,calendarPermissionAdded=False,productionStarted=False,originalLedgerAutoSync=False,thirdPartyPassed=0,thirdPartyTotal=30,remainingRealAcceptance=['AT-'+str(i) for i in range(24,31)],release='HOLD')
reg=dict(schemaVersion=1,version='2026-10-23-r1',facts=facts,flows=flows,capabilities=caps,tests=tests,screens=ui['screens'],interfaces=ui['interfaces'],exceptions=[dict(id='OPEN-01',title='取消期限・当日変更・返金・片道だけ実施の精算',status='CUSTOMER_CONFIRMATION'),dict(id='OPEN-02',title='バックアップ担当・頻度・保管先',status='CUSTOMER_CONFIRMATION'),dict(id='OPEN-03',title='AT-30本番後確認と本番前全30件条件の時点差',status='CUSTOMER_CONFIRMATION'),dict(id='OPEN-04',title='復元後の管理者2名の再ログイン',status='BROWSER_RECOVERY_WAIT')])
(D/'registry.json').write_text(json.dumps(reg,ensure_ascii=False,indent=2)+'\n','utf-8')
print(f'Registry: {len(caps)} requirements, {len(tests)} existing test cases')
