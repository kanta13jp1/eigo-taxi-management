"""Deterministic document generation, trace graph checks and document-item inventory.
No network, Google writes, deployment, or acceptance execution.
"""
from pathlib import Path
from datetime import datetime
import argparse, csv, hashlib, json, re, sys
ROOT=Path(__file__).resolve().parents[1]
BASE=Path('docs/traceability')
REG=BASE/'registry.json'
STAGES=[('business','ビジネスフロー図','01_BUSINESS_FLOWS.md','bf'),('requirements','要件定義','03_REQUIREMENTS.md','req'),('design','設計','04_FUNCTIONAL_SPEC.md','design'),('test-spec','テスト仕様書','17_TEST_SPEC.md','testSpec'),('tasks','タスクリスト','05_TASKS.md','task'),('implementation','実装コード対応','18_IMPLEMENTATION_INDEX.md','code'),('test-code','テストコード対応','19_TEST_CODE_INDEX.md','testCode'),('acceptance','受入テスト仕様書','06_ACCEPTANCE_TEST_SPEC.md','acceptance'),('operations','運用手順書','20_OPERATIONS.md','operation'),('user','ユーザーマニュアル','21_USER_MANUAL.md','user')]
FIXED=dict(authentication='google',setupOwner='developer',dailyAccountOwner='admin',consumeAt='completion',oneWay=1,roundTrip=2,calendarPermissionAdded=True,productionStarted=False,originalLedgerAutoSync=False,thirdPartyPassed=0,thirdPartyTotal=30,release='HOLD')
def read(p):return (ROOT/p).read_text('utf-8-sig')
def js(p):return json.loads(read(p))
def dump(v):return json.dumps(v,ensure_ascii=False,indent=2)+'\n'
def sha(b):return hashlib.sha256(b).hexdigest()
def load():return js(REG)
def rel_link(src,target,anchor=''):
 import os
 return os.path.relpath(target,Path(src).parent).replace('\\','/')+('#'+anchor if anchor else '')
def item_id(c,stage):return c[stage]
def source_links(c):return ' / '.join(f"`{x['path']}` の `{x['locator']}`" for x in c['implementation']) or 'N/A：'+c['manualReason']
def tests_text(c):return ', '.join(c['tests']) or 'GAP：'+c['testGap']
def fact_block(r):
 return '\n'.join(f'<!-- fact:{k}={json.dumps(v,ensure_ascii=False,separators=(",",":"))} -->' for k,v in r['facts'].items())+'\n'
CUSTOMER_GUIDE='docs/acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md'
def acceptance_summary(r):
 facts=r['facts']
 consent='実同意済み' if facts['calendarPermissionAdded'] else '実同意は未確認'
 return f"小林さんの顧客確認は{facts['customerAcceptancePassed']}/{facts['customerAcceptanceTotal']}件合格。原AT-01〜30は開発担当が技術検証する。旧第三者受入{facts['thirdPartyPassed']}/{facts['thirdPartyTotal']}件は履歴。検証専用Calendarの権限追加は許可済み、Googleの{consent}。本番開始は保留中。"
def header(title,r):return f'# {title}\n\n現行正本版：{r["version"]}。生成元 [registry.json](../traceability/registry.json)。過去の合格記録とは別。\n\n'+fact_block(r)+'\n初期設定は開発担当、日常の利用登録は管理者が行う。片道1枚・往復2枚を完了時に消費する。'+acceptance_summary(r)+' [顧客確認の6手順](CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md)\n\n'

def customer_guide(r):
 cases=r['customerAcceptance']['cases']
 text=(
  '# 小林さん用　送迎の確認手順\n\n'
  '検証サイトで、保護者の予約から先生のチケット管理までを6件ご確認ください。対象は開発担当がご用意する架空の家庭です。実際の送迎や支払いは発生しません。\n\n'
  '## 開始前に開発担当がそろえるもの\n\n'
  '- 開発担当が小林さんの会社Googleアカウントを検証担当として事前登録します。ご本人は同じアカウントで、固定の家庭用URLと管理者用URLを使い分けます。操作中に開発担当が役割を変える必要はありません。通常の管理者・保護者とは別の検証用登録で、指定した検証生徒だけを扱います。\n'
  '- 指定の架空生徒1名、開始残数5枚、固定した日付の「CUST-04 完了確認用・片道」「CUST-04 完了確認用・往復」の予約各1件と模擬実績表。日付が過ぎても「送迎スケジュール一覧」から同じ予約を開きます。\n'
  '- 検証用の公開版番号、検証専用カレンダーの閲覧方法。開発担当がカレンダーの権限・接続先・予約と取消の動作を事前確認してからご案内します。実在の家庭や会社の業務予定には触れません。\n\n'
  '## 操作と記録\n\n'
  '開始の準備完了案内を受けたら、ご都合のよい時に次の順で進めてください。画面を変えるときは、いまの画面からログアウトし、もう一方の固定URLを開いて同じGoogleアカウントでログインします。日程連絡や開発担当への切替依頼は不要です。\n\n'
  '| 使う画面 | 小林さんが確認すること |\n'
  '| --- | --- |\n'
  '| 保護者（1回目） | CUST-01～03。架空生徒と残数5枚を確認し、予約1件を登録してカレンダーと照合した後、その予約を取り消します。 |\n'
  '| 管理者（1回目） | CUST-04。準備済みの片道・往復を順に完了し、残数が5→4→2枚となることを確認します。 |\n'
  '| 保護者（2回目） | CUST-05の前半。残り2枚でMauro・Brendaへの連絡案内を読みます。 |\n'
  '| 管理者（2回目） | CUST-05で10枚・検証用0円を登録して12枚を確認。続けてCUST-06の管理者分としてログアウトし、再読込して台帳が見えないことを記録します。 |\n'
  '| 保護者（3回目） | CUST-05の家庭側で12枚と案内の消失を確認。CUST-06の家庭分としてログアウトし、再読込して台帳が見えないことを記録します。 |\n\n'
  '## 途中で中断・再開する場合\n\n'
  '共有表に実施済みの項目・最後の残数・対象予約の日時を記録し、ログアウトしてください。再開時は、最後に記録した画面のURLから入り直し、同じ生徒・予約・残数を確認して未実施の手順だけを進めます。最初から予約やチケット追加を繰り返さないでください。完了済みの予約は再度完了にしません。開始時5枚→片道後4枚→往復後2枚→10枚追加後12枚が目印です。記録と現在の値が異なる場合は「要確認」で止め、通常の問い合わせとしてお知らせください。異常時の調査まで不要になる仕組みではありません。\n\n'
  '各項目で見えた結果と時刻を末尾の記録欄に記入してください。該当する役割や画面を用意できない場合は「未実施」、期待と異なる場合は「要確認」として、その時点の画面を開発担当に伝えてください。繰り返し送信せず、その結果に依存する手順は待ってください。画像の代わりに画面名と前後の値を記したメモでも確認できます。\n\n'
 )
 for c in cases:
  text+=f'<a id="{c["id"]}"></a>\n### {c["id"]}　{c["title"]}\n\n'
  text+=f'**小林さんの操作（{c["role"]}）**　{c["steps"]}\n\n**画面で確かめる結果**　{c["expected"]}\n\n**記録すること**　{c["evidenceToRecord"]}\n\n'
  text+='対応する開発側の確認項目　'+'、'.join(f'[{ref}](06_ACCEPTANCE_TEST_SPEC.md#{ref})' for ref in c['technicalRefs'])+'。\n\n'
 text+='## ご記入欄\n\n実施日・端末／ブラウザー　＿＿＿＿　　検証版（開発担当記入）　＿＿＿＿\n\n'
 text+='実際に確認できた項目にチェックし、判定と実測値をご記入ください。初期状態は全6件未実施です。\n\n'
 for c in cases:
  text+=f'- [ ] {c["id"]}　{c["title"]}　判定＿＿＿＿　時刻＿＿＿＿　実測値・画像番号またはメモ＿＿＿＿\n'
 text+='\n開発担当は検証データの準備・片付け、台帳のID照合、同時操作、二重送信、権限拒否、バックアップ復旧、Androidを含む実機検証を引き受けます。顧客確認の結果と開発側の技術試験はそれぞれに記録します。本番の開始は別途判断します。\n'
 return text
def section(c,stage,r):
 ident=c[stage];s=f'<a id="{ident}"></a>\n## {ident} {c["title"]}\n\n'
 ids=[c[k] for k in ['bf','req','design','testSpec','task','code','testCode','acceptance','operation','user']]
 s+='参照：'+' / '.join(ids)+'\n\n'
 if stage=='req':s+=f'要求：{c["requirement"]}\n\n根拠：{c["origin"]}。適合期待：{c["expected"]}\n'
 elif stage=='design':s+=c['designText']+'\n\n実装：'+source_links(c)+'\n\n自動処理と画面：手動の実送迎・連絡・承認は自動化しない。\n'
 elif stage=='testSpec':s+=f'前提：{c["precondition"]}\n\n手順：{c["steps"]}\n\n期待：{c["expected"]}\n\n自動ケース：{tests_text(c)}。検証範囲：{c.get('testScope','既存の関連テスト群。完全適合の証明ではない。')}\n'
 elif stage=='task':s+=f'受入確認タスク：{c["steps"]}\n\n完了条件：{c["expected"]}\n\n状態：{c["status"]}。実装参照が存在することと受入合格は別。{c["testGap"]}\n'
 elif stage=='code':s+='実装項目：'+source_links(c)+'\n\n'+(c['manualReason'] or 'コード参照は存在検査する。公開環境で同じ版が動作した証明ではない。')+'\n'
 elif stage=='testCode':s+='既存の関連テスト：'+tests_text(c)+'\n\n検証範囲：'+c.get('testScope','関連群の対応は全期待値の証明ではない。')+'\n\n実行形式：Node VMスタブ／ローカル検査。Google実連携・実移動・実機試験の代替にしない。\n'
 elif stage=='acceptance':
  label='旧第三者実施欄' if c['acceptance'].startswith('AT-') else '補足試験の状態'
  s+=f'前提：{c["precondition"]}\n\n操作：{c["steps"]}\n\n期待：{c["expected"]}\n\n{label}：{c["acceptanceStatus"]}。開発担当が技術検証の対象版・実測値・証跡を記録する。\n'
 elif stage=='operation':s+=c['operationText']+'\n\n保全・照合後に再開する。検証専用Calendarの権限追加は許可済み。本番開始は別途判断する。\n'
 elif stage=='user':s+=c['userText']+'\n\n期待する表示・結果：'+c['expected']+'\n\n自家庭だけを確認。エラー時は結果を照合し教室へ連絡し、共有端末ではログアウトする。\n'
 if c.get('latestObservation'):s+='\n今回の実環境観測：'+c['latestObservation']+' [確認記録]('+c.get('observationRecord','restored-admins-2026-10-23/README.md')+')\n'
 return s+'\n'
def generated(r):
 out={}; base=Path('docs/acceptance')
 for key,title,file,field in STAGES:
  text=header(title,r)
  if field=='bf':
   for f in r['flows']:text+=f'<a id="{f["id"]}"></a>\n## {f["id"]} {f["title"]}\n\n担当：{f["actor"]}。流れ：{f["steps"]}。期待：{f["expected"]}\n\n対応要件：'+', '.join(c['req'] for c in r['capabilities'] if c['bf']==f['id'])+'\n\n'
   text+='[担当者別フロー・画面/I/F入りPowerPoint](../deliverables/2026-10-23-traceability/README.md)\n'
  else:
   for c in r['capabilities']:text+=section(c,field,r)
  out[str(base/file)]=text
 text=header('ユースケース一覧',r)
 for c in r['capabilities']:text+=f'<a id="UC-{c["number"]:02}"></a>\n## UC-{c["number"]:02} {c["title"]}\n\n{c["precondition"]}\n\n{c["steps"]}\n\n期待：{c["expected"]}。対応：{c["req"]}\n\n'
 out[str(base/'02_USE_CASES.md')]=text
 # Matrix is generated, never hand-maintained with a separate set of facts.
 cols=['業務フロー','要件','設計','試験仕様','タスク','実装項目','テストコード','受入仕様','運用','利用者手順','自動テスト対応漏れ','旧第三者実施欄／補足試験状態']
 rows=[]
 for c in r['capabilities']:rows.append([c[k] for k in ['bf','req','design','testSpec','task','code','testCode','acceptance','operation','user']]+[c['testGap'] or '関連テストあり（適合範囲は要レビュー）',c['acceptanceStatus']])
 import io
 buf=io.StringIO(newline='');w=csv.writer(buf);w.writerow(cols);w.writerows(rows)
 out['docs/traceability/matrix.csv']='\ufeff'+buf.getvalue()
 text=header('トレーサビリティーマトリックス',r)+'ユーザー指定の10工程を左から右に対応。N/A・未実装・テスト不足は隠さない。\n\n| '+' | '.join(cols)+' |\n|'+'---|'*len(cols)+'\n'
 for row in rows:text+='| '+' | '.join(row)+' |\n'
 text+='\n## 対応漏れ・未確定・解消記録\n\n'
 for c in r['capabilities']:
  if c['testGap']:text+=f'- {c["req"]} / {c["testCode"]}：{c["testGap"]}\n'
 for x in r['exceptions']:text+=f'- {x["id"]}：{x["title"]}（{x["status"]}）\n'
 out[str(base/'07_TRACEABILITY_MATRIX.md')]=text
 # Preserve the registered 30-case acceptance ledger; supplemental cases never inflate it.
 fields=['ID','確認内容','前提','操作手順','期待結果','結果','実施者','実施日時・対象版','実測結果','証跡・不具合番号','注意']
 b=io.StringIO(newline='');w=csv.writer(b);w.writerow(fields)
 for c in r['capabilities'][:30]:w.writerow([c['acceptance'],c['title'],c['precondition'],c['steps'],c['expected'],'BLOCKED' if c['acceptanceStatus']=='BLOCKED' else '未実施','','','','','過去PASSを転記しない。Google方式で実施。'+('Calendar追加・本番開始は未許可。' if c['status']=='HOLD' else '')])
 out['docs/acceptance/third-party-acceptance-checklist.csv']='\ufeff'+b.getvalue()
 text=header('旧第三者受入30件の記録',r)+'2026-11-07に、第三者が原30件すべてを行うリリース条件を廃止した。以下は廃止時点の実施欄と当時の条件。AT-01〜30の操作・期待値は開発側の技術仕様として保持し、SAT-31〜39は補足試験として扱う。AT-30は将来の本番配備後に開発担当が確認する。\n\n[当時の30件の実施欄](third-party-acceptance-checklist.csv) / [開発側の技術受入仕様](06_ACCEPTANCE_TEST_SPEC.md)\n\n'
 for c in r['capabilities'][:30]:text+=f'- {c["acceptance"]}：{c["acceptanceStatus"]} / {c["req"]}\n'
 out['docs/acceptance/THIRD_PARTY_ACCEPTANCE.md']=text
 out[CUSTOMER_GUIDE]=customer_guide(r)
 out['docs/traceability/state.json']=dump({'version':r['version'],'facts':r['facts'],'thirdParty':{c['acceptance']:c['acceptanceStatus'] for c in r['capabilities'][:30]},'customerAcceptance':{c['id']:c['status'] for c in r['customerAcceptance']['cases']},'supplemental':{c['acceptance']:c['acceptanceStatus'] for c in r['capabilities'][30:]}})
 # Current user-facing manuals replace conflicting legacy instructions with the same source.
 aliases={'docs/ADMIN_MANUAL.md':('管理者マニュアル','operation'), 'docs/OPERATION_RUNBOOK.md':('運用手順書','operation'),'docs/USER_GUIDE.md':('ユーザーマニュアル','user'),'docs/remaining-work-tracker.md':('残作業一覧','task'),'docs/ACCOUNT_MANAGEMENT.md':('Googleアカウント管理','design'),'docs/PORTAL_SEPARATION.md':('管理者・家庭別画面分離','design'),'docs/DEVELOPER_SETUP_AUTH.md':('開発担当者による初期認証設定','design'),'docs/DEVELOPER_SETUP_OVERVIEW.md':('初期設定と本人Googleログイン','design'),'docs/GAS_AUTH_SETUP.md':('GAS認証設定・旧方式の位置付け','design'),'docs/TEST_ENVIRONMENT_ACCESS.md':('検証環境・接続台帳・画面反映','operation'),'docs/DELIVERY_CHECKLIST.md':('配布・リリース確認','task')}
 for path,(title,field) in aliases.items():
  subset= r['capabilities'] if 'MANUAL' in path or 'GUIDE' in path or 'RUNBOOK' in path or 'tracker' in path else [c for c in r['capabilities'] if c['number'] in [1,18,19,20,23,26,28,30,31,32,33,34,35,36,37,38,39]]
  # Aliases reference the one authoritative item ID rather than redeclaring it.
  t=f'# {title}\n\n正本版：{r["version"]}。旧本文は docs/history/pre-traceability-20261023 に保存。\n\n'+fact_block(r)+'\n'
  t+=acceptance_summary(r)+f' [顧客確認の6手順]({rel_link(path,CUSTOMER_GUIDE)})\n\n'
  if path in ('docs/remaining-work-tracker.md','docs/DELIVERY_CHECKLIST.md'):
   t+='毎日、改善を1件以上検証サイトへ反映し、公開画面で期待する動作を確認する。日次の配備・確認、顧客6件、技術受入の結果を個別に記録する。\n\n'
   for case in r['customerAcceptance']['cases']:
    t+=f'- [{case["id"]}　{case["title"]}]({rel_link(path,CUSTOMER_GUIDE,case["id"])})　{case["status"]}\n'
   t+='\n'
  for c in subset:
   target='docs/acceptance/'+next(x[2] for x in STAGES if x[3]==field)
   t+=f'## {c[field]}参照：{c["title"]}\n\n[{c[field]} 正本]({rel_link(path,target,c[field])})\n\n'+(c['operationText'] if field=='operation' else c['userText'] if field=='user' else c['steps'] if field=='task' else c['designText'])+'\n\n'
  if path.endswith('TEST_ENVIRONMENT_ACCESS.md'):
   t+='## 検証用台帳と元の台帳\n\n現在の検証サイトは検証コピーへ接続。元の台帳との自動同期なし。本番接続先ではない。管理者はA01、家庭はP01にGoogleでログイン。\n\n## 台帳を直接編集した後の反映\n\n対象IDを保全・照合してE03で修正後、Webを再読込。直接編集ではカレンダー更新・チケット計算・関連履歴更新を自動実行しない。\n'
  out[path]=t
 for path in sorted(ROOT.glob('docs/GoogleDrive_Upload/**/*.md')):
  rel=path.relative_to(ROOT).as_posix();field='acceptance' if 'Google連携' in path.name else 'testSpec' if 'シナリオ' in path.name else 'design' if '画面' in path.name else 'task'
  target='docs/acceptance/'+next(x[2] for x in STAGES if x[3]==field)
  out[rel]=f'# {path.stem}\n\n現行正本：[{field}]({rel_link(rel,target)})。旧PDF/XLSXと画面は履歴として扱う。\n\n'+fact_block(r)+'\n'+''.join(f'- [{c[field]} {c["title"]}]({rel_link(rel,target,c[field])})\n' for c in r['capabilities'])
 out['docs/acceptance/README.md']=header('現行仕様・工程横断成果物',r)+'\n'.join(f'- [{title}]({file})' for _,title,file,_ in STAGES)+'\n\n[機械検査・ID管理](../traceability/README.md) / [マトリックス](07_TRACEABILITY_MATRIX.md)\n\n旧結果08〜16・runs・progressは観測時点の履歴。旧PASSを現行受入にしない。\n'
 return out
def write_generated(r):
 previous=js(BASE/'generated.json') if (ROOT/BASE/'generated.json').exists() else {}
 expected=generated(r)
 for path,text in expected.items():
  p=ROOT/path
  if p.exists() and path not in previous:
   old=ROOT/'docs/history/pre-traceability-20261023'/path
   old.parent.mkdir(parents=True,exist_ok=True)
   if not old.exists():old.write_bytes(p.read_bytes())
  p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text,'utf-8',newline='')
 (ROOT/BASE/'generated.json').write_text(dump({p:sha(t.encode('utf-8')) for p,t in expected.items()}),'utf-8')
def blocks(path):
 """IDs for every meaningful markdown block: heading, paragraph, list item, table row, fenced block."""
 lines=read(path).splitlines();out=[];buf=[];start=1;fenced=False
 def flush():
  nonlocal buf
  if buf and any(x.strip() for x in buf):out.append({'line':start,'text':'\n'.join(buf).strip()})
  buf=[]
 for i,line in enumerate(lines,1):
  if line.lstrip().startswith('```'):
   if not fenced:flush();start=i;buf=[line];fenced=True
   else:buf.append(line);flush();fenced=False
  elif fenced:buf.append(line)
  elif not line.strip():flush()
  elif re.match(r'^(#{1,6}\s|\s*[-*+]\s|\s*\d+[.)]\s|\|)',line):flush();start=i;buf=[line];flush()
  else:
   if not buf:start=i
   buf.append(line)
 flush();return out
def doc_paths():
 return sorted({Path('README.md'),*[p.relative_to(ROOT) for p in (ROOT/'docs').rglob('*.md') if 'traceability/reports' not in p.as_posix() and not any(x in p.parts for x in ('node_modules','presentation-build'))]},key=str)
def index_documents():
 old=js(BASE/'documents.json') if (ROOT/BASE/'documents.json').exists() else {'documents':[]}
 bypath={d['path']:d for d in old['documents']};docs=[];next_doc=max([int(d['id'][4:]) for d in old['documents']]+[0])+1
 current=set(generated(load()))|{'docs/SCREEN_INTERFACE_DESIGN.md','docs/traceability/README.md','docs/traceability/ID_POLICY.md','docs/traceability/TRACEABILITY_MATRIX.md','docs/traceability/SELF_REVIEW_R13.md'}
 for path in doc_paths():
  name=path.as_posix();prior=bypath.get(name);docid=prior['id'] if prior else f'DOC-{next_doc:04}';next_doc+=not bool(prior)
  olditems={(x['contentSha256'],x['occurrence']):x['id'] for x in (prior or {}).get('items',[])};seq=max([int(x['id'].rsplit('-',1)[1]) for x in (prior or {}).get('items',[])]+[0]);counts={};items=[]
  for b in blocks(path):
   h=sha(b['text'].encode());counts[h]=counts.get(h,0)+1;key=(h,counts[h]);ident=olditems.get(key)
   if not ident:seq+=1;ident=f'{docid}-ITEM-{seq:05}'
   items.append(dict(id=ident,line=b['line'],contentSha256=h,occurrence=counts[h],preview=b['text'][:140]))
  docs.append(dict(id=docid,path=name,state='current' if name in current else 'historical' if any(x in name for x in ['/history/','/progress/','/acceptance/','/deliverables/','/SELF_REVIEW_R']) else 'reference',sha256=sha((ROOT/path).read_bytes()),items=items))
 (ROOT/BASE/'documents.json').write_text(dump({'schemaVersion':1,'documents':docs}),'utf-8')
 return docs
def source_manifest(r):
 paths=sorted({x['path'] for c in r['capabilities'] for x in c['implementation']}|{t['path'] for t in r['tests']})
 return {p:sha((ROOT/p).read_bytes()) for p in paths if (ROOT/p).exists()}
def source_review_errors(r,reviewed,root):
 # Compare the declared set in both directions. A new file has no review just
 # because older baseline entries match; retired entries also require review.
 declared={x['path'] for c in r['capabilities'] for x in c['implementation']}|{t['path'] for t in r['tests']}
 recorded=set(reviewed);errors=[]
 for path in sorted(declared-recorded):errors.append({'code':'SOURCE_REVIEW_REQUIRED','message':'unregistered: '+path})
 for path in sorted(recorded-declared):errors.append({'code':'SOURCE_REVIEW_REQUIRED','message':'retired: '+path})
 for path in sorted(declared&recorded):
  f=root/path
  if not f.exists() or sha(f.read_bytes())!=reviewed[path]:errors.append({'code':'SOURCE_REVIEW_REQUIRED','message':path})
 return errors
def validate(r=None,root=None,check_files=True):
 r=r or load();root=Path(root or ROOT);errors=[];gaps=[];ids=set()
 def err(code,msg):errors.append({'code':code,'message':msg})
 def declare(ident):
  if ident in ids:err('DUPLICATE_ID',ident)
  ids.add(ident)
 for collection in ['flows','tests','screens','interfaces','exceptions']:
  for x in r[collection]:declare(x['id'])
 flowids={x['id'] for x in r['flows']};testids={x['id'] for x in r['tests']};screenids={x['id'] for x in r['screens']};ifids={x['id'] for x in r['interfaces']}
 reqids={c['req'] for c in r['capabilities']}
 for k,v in FIXED.items():
  if r['facts'].get(k)!=v:err('FACT_CONFLICT',k)
 if len(r['capabilities'])!=39:err('INCOMPLETE_REQUIREMENTS','Expected controlled baseline of 39 requirements, including self-paced customer review; revise the schema and baseline explicitly for new scope.')
 acceptance=[]
 for c in r['capabilities']:
  for stage in ['req','design','testSpec','task','code','testCode','acceptance','operation','user']:
   if not c.get(stage):err('MISSING_STAGE',f'{c.get("req")} {stage}')
   else:declare(c[stage])
  if c.get('bf') not in flowids:err('BROKEN_REF',c.get('bf','missing flow'))
  for key,allowed in [('screens',screenids),('interfaces',ifids),('tests',testids)]:
   for ref in c.get(key,[]):
    if ref not in allowed:err('BROKEN_REF',ref)
  if not c['implementation'] and not c.get('manualReason'):err('MISSING_IMPLEMENTATION',c['req'])
  if not c['tests']:
   if not c.get('testGap'):err('UNDECLARED_TEST_GAP',c['req'])
   gaps.append({'id':c['req'],'kind':'TEST_CODE_GAP','reason':c.get('testGap')})
  if c['acceptanceStatus']=='PASS':err('UNSUPPORTED_ACCEPTANCE_PASS',c['acceptance'])
  if c['acceptance'].startswith('AT-'):acceptance.append(c['acceptance'])
  if check_files:
   for x in c['implementation']:
    f=root/x['path']
    if not f.exists() or x['locator'] not in f.read_text('utf-8-sig'):err('CODE_LOCATOR_MISSING',c['code']+' '+x['path']+' '+x['locator'])
 for t in r['tests']:
  for req in t['requirements']:
   if req not in reqids:err('ORPHAN_TEST',t['id']+' '+req)
   elif t['id'] not in next(c for c in r['capabilities'] if c['req']==req)['tests']:err('ASYMMETRIC_TEST_REF',t['id']+' '+req)
  for c in r['capabilities']:
   if t['id'] in c['tests'] and c['req'] not in t['requirements']:err('ASYMMETRIC_TEST_REF',t['id']+' '+c['req'])
  if check_files:
   f=root/t['path']
   if not f.exists() or t['locator'] not in f.read_text('utf-8-sig'):err('TEST_LOCATOR_MISSING',t['id'])
   if t.get('evidence'):
    ev=t['evidence'];ef=root/ev['path']
    if not ef.exists():err('TEST_EVIDENCE_MISSING',t['id'])
    else:
     try:
      report=json.loads(ef.read_text('utf-8-sig'))
      if not isinstance(report,dict) or not isinstance(report.get('results'),list):raise ValueError('invalid evidence')
     except (OSError,UnicodeError,ValueError):err('TEST_EVIDENCE_INVALID',t['id'])
     else:
      matched=[x for x in report['results'] if isinstance(x,dict) and (x.get('id')==ev['key'] or x.get('name')==ev['key'])]
      if len(matched)!=1 or matched[0].get('status')!='PASS':err('TEST_EVIDENCE_FAILED',t['id'])
      required=ev.get('requiredSources');hashes=report.get('sourceHashes')
      if not isinstance(required,list) or not required or not all(isinstance(p,str) and p for p in required) or t['path'] not in required:
       err('TEST_EVIDENCE_HASH_REQUIRED',t['id']+' source contract')
       required=[]
      if not isinstance(hashes,dict):err('TEST_EVIDENCE_HASH_REQUIRED',t['id']+' sourceHashes')
      else:
       for path in required:
        if path not in hashes:err('TEST_EVIDENCE_HASH_REQUIRED',t['id']+' '+path)
       for path,h in hashes.items():
        if not isinstance(path,str) or not isinstance(h,str) or not re.fullmatch(r'[0-9a-f]{64}',h):
         err('TEST_EVIDENCE_HASH_REQUIRED',t['id']+' invalid hash');continue
        sf=root/path
        if not sf.exists() or sha(sf.read_bytes())!=h:err('TEST_EVIDENCE_STALE',t['id']+' '+path)
 if set(acceptance)!={f'AT-{n:02}' for n in range(1,31)} or len(acceptance)!=30:err('ACCEPTANCE_COUNT','Original 30 IDs must not change or absorb supplemental tests.')
 cases=r.get('customerAcceptance',{}).get('cases',[])
 if [c.get('id') for c in cases]!=[f'CUST-{n:02}' for n in range(1,7)] or r['facts'].get('customerAcceptanceTotal')!=len(cases):
  err('CUSTOMER_ACCEPTANCE_COUNT','Expected CUST-01 through CUST-06')
 if r['facts'].get('thirdPartyRequiredForRelease') is not False or r['facts'].get('calendarPermissionApprovedForTest') is not True:
  err('FACT_CONFLICT','Customer acceptance or test-calendar policy')
 if r['facts'].get('customerAcceptancePassed')!=sum(c.get('status')=='PASS' for c in cases):
  err('CUSTOMER_ACCEPTANCE_COUNT','Customer pass count disagrees with case records')
 preparation=r.get('customerAcceptance',{}).get('preparation',{})
 if (not isinstance(preparation,dict) or r['facts'].get('customerExecutionMode')!='self-paced-test-reviewer' or
     preparation.get('mode')!='single-account-self-paced' or
     preparation.get('storedRole')!='reviewer' or
     preparation.get('portalRoles')!=['parent','admin'] or
     preparation.get('requiresDeveloperDuringExecution') is not False or
     preparation.get('completionView')!='A03' or
     preparation.get('completionDatePolicy')!='fixed-fixture-date' or
     preparation.get('pauseResume')!='resume-only-unfinished-steps' or
     preparation.get('reviewEnvironmentGate')!='ACCEPTANCE_REVIEW_SPREADSHEET_ID' or
     preparation.get('reviewEnvironmentGatePolicy')!='exact-bound-test-ledger-only'):
  err('CUSTOMER_EXECUTION_CONFLICT','Self-paced review needs fixed portals, test-ledger gate, fixed-date schedule view and state-based resume')
 for c in cases:
  if not c.get('technicalRefs') or set(c['technicalRefs'])-set(acceptance):err('BROKEN_REF',c['id'])
  if c.get('status') not in ('NOT_RUN','PASS','FAIL','BLOCKED'):err('CUSTOMER_ACCEPTANCE_STATUS',c['id'])
  if c.get('status')=='PASS':
   fields=('reviewer','testedAt','release','observed','resultRecord')
   if not all(isinstance(c.get(k),str) and c[k].strip() for k in fields):
    err('UNSUPPORTED_ACCEPTANCE_PASS',c['id']);continue
   if c['reviewer']!=r['customerAcceptance'].get('reviewer'):
    err('CUSTOMER_EVIDENCE_MISMATCH',c['id']+' reviewer')
   try:
    stamp=datetime.fromisoformat(c['testedAt'].replace('Z','+00:00'))
    if 'T' not in c['testedAt'] or stamp.tzinfo is None:raise ValueError('timezone required')
   except ValueError:err('CUSTOMER_EVIDENCE_INVALID',c['id']+' testedAt')
   # Customer PASS needs a real, explicitly typed manual-check record. A local
   # demo/offline test report cannot be promoted by filling registry metadata.
   evidence=root/c['resultRecord']
   if not evidence.is_file():
    err('CUSTOMER_EVIDENCE_MISSING',c['id']+' '+c['resultRecord']);continue
   try:
    record=json.loads(evidence.read_text('utf-8-sig'))
    if not isinstance(record,dict) or not isinstance(record.get('results'),list):raise ValueError('invalid record')
   except (OSError,UnicodeError,ValueError):
    err('CUSTOMER_EVIDENCE_INVALID',c['id']);continue
   if record.get('mode')!='real-customer-check':err('CUSTOMER_EVIDENCE_MODE',c['id'])
   matches=[x for x in record['results'] if isinstance(x,dict) and x.get('id')==c['id']]
   if len(matches)!=1:
    err('CUSTOMER_EVIDENCE_MISMATCH',c['id']+' result ID');continue
   actual=matches[0]
   if actual.get('status')!='PASS' or any(actual.get(k)!=c[k] for k in ('reviewer','testedAt','release','observed')):
    err('CUSTOMER_EVIDENCE_MISMATCH',c['id']+' result metadata')
   if actual.get('googleIdentityVerified') is not True:err('CUSTOMER_EVIDENCE_MODE',c['id']+' Google identity unverified')
 if check_files:
  for path,text in generated(r).items():
   f=root/path
   if not f.exists() or f.read_bytes()!=text.encode('utf-8'):err('GENERATED_DRIFT',path)
  index=root/BASE/'documents.json'
  if not index.exists():err('DOCUMENT_INDEX_MISSING','run index')
  else:
   docs=json.loads(index.read_text('utf-8'))['documents'];indexed={x['path'] for x in docs}
   for path in doc_paths():
    if path.as_posix() not in indexed:err('UNINDEXED_DOCUMENT',path.as_posix())
   for d in docs:
    f=root/d['path']
    if not f.exists() or sha(f.read_bytes())!=d['sha256']:err('DOCUMENT_DRIFT',d['path'])
    for x in d['items']:declare(x['id'])
    if d['state']=='current' and f.exists():
     for target in re.findall(r'(?<!!)\[[^\]]*\]\(([^)]+)\)',f.read_text('utf-8-sig')):
      target=target.strip('<>')
      if re.match(r'^[a-zA-Z]+:',target):continue
      dest,_,anchor=target.partition('#');resolved=f.parent/dest if dest else f
      if not resolved.exists():err('LOCAL_LINK_MISSING',d['path']+' -> '+target)
      elif anchor and resolved.suffix=='.md':
       body=resolved.read_text('utf-8-sig')
       slugs=[re.sub(r'[^\w\- ]','',v.strip().lower()).replace(' ','-') for v in re.findall(r'^#+ (.+)$',body,re.M)]
       if 'id="'+anchor+'"' not in body and anchor not in slugs:err('LOCAL_ANCHOR_MISSING',d['path']+' -> '+target)
  baseline=root/BASE/'source-baseline.json'
  if not baseline.exists():err('SOURCE_REVIEW_REQUIRED','source baseline missing')
  else:
   try:
    reviewed=json.loads(baseline.read_text('utf-8'))
    if not isinstance(reviewed,dict) or not all(isinstance(p,str) and isinstance(h,str) and re.fullmatch(r'[0-9a-f]{64}',h) for p,h in reviewed.items()):
     raise ValueError('invalid source baseline')
   except (OSError,UnicodeError,ValueError):err('SOURCE_REVIEW_REQUIRED','source baseline invalid')
   else:errors.extend(source_review_errors(r,reviewed,root))
  # Facts in product source are checked independently of generated text.
  gas=(root/'gas/Code.gs').read_text('utf-8');api=(root/'src/services/api.ts').read_text('utf-8')
  if not re.search(r'roundtrip"\s*\?\s*2\s*:\s*1',gas):err('SOURCE_FACT_CONFLICT','ticket consumption 2/1')
  if 'signInGoogle' not in api or "'Content-Type':'text/plain;charset=utf-8'" not in api:err('SOURCE_FACT_CONFLICT','Google authentication or POST protocol')
  # Current package/style manifest is verified only after render/finalization receipts exist.
  packet=root/BASE/'presentations.json'
  if packet.exists():
   style=js(BASE/'presentation-theme.json')
   for d in json.loads(packet.read_text('utf-8')):
    if d.get('registrySha256')!=sha((root/REG).read_bytes()):err('PRESENTATION_CONTENT_REVIEW',d['path'])
    if d.get('registryVersion')!=r['version']:err('PRESENTATION_STALE',d['path'])
    if d['themeId']!=style['id']:err('PRESENTATION_THEME',d['path'])
    f=root/d['path'];receipt=root/d['receipt']
    if not f.exists() or sha(f.read_bytes())!=d['sha256']:err('PRESENTATION_DRIFT',d['path'])
    if not receipt.exists() or json.loads(receipt.read_text('utf-8')).get('finalSha256')!=d['sha256']:err('PRESENTATION_UNVERIFIED',d['path'])
  binary=root/BASE/'binary-documents.json'
  if binary.exists():
   for b in json.loads(binary.read_text('utf-8'))['documents']:
    f=root/b['path']
    if not f.exists() or sha(f.read_bytes())!=b['sha256']:err('BINARY_DOCUMENT_DRIFT',b['path'])
 return {'structuralStatus':'PASS' if not errors else 'FAIL','errors':errors,'coverageGaps':gaps,'counts':{'requirements':len(r['capabilities']),'flows':len(r['flows']),'testCases':len(r['tests']),'screens':len(r['screens']),'interfaces':len(r['interfaces']),'coverageGaps':len(gaps)},'release':'HOLD','semanticReview':'REQUIRED','thirdPartyPassed':0}
def main():
 parser=argparse.ArgumentParser();parser.add_argument('command',choices=['generate','index','check','baseline']);parser.add_argument('--strict-coverage',action='store_true');parser.add_argument('--report',default='docs/traceability/reports/latest.json');args=parser.parse_args();r=load()
 if args.command=='generate':write_generated(r);print('Generated canonical documents and matrix. Run index then check.');return
 if args.command=='index':d=index_documents();print(f'Indexed {len(d)} documents / {sum(len(x["items"]) for x in d)} item IDs');return
 if args.command=='baseline':(ROOT/BASE/'source-baseline.json').write_text(dump(source_manifest(r)),'utf-8');print('Source review baseline recorded; use only after reviewing changes.');return
 result=validate(r);f=ROOT/args.report;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(dump(result),'utf-8');print(json.dumps(result,ensure_ascii=True)[:6000]);sys.exit(1 if result['errors'] or (args.strict_coverage and result['coverageGaps']) else 0)
if __name__=='__main__':main()
