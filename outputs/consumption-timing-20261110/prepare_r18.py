from pathlib import Path
import copy, hashlib, json, subprocess
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'outputs/consumption-timing-20261110/adoption'
OUT.mkdir(parents=True, exist_ok=True)
NODE = 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1104-2876-0_26.1104.2876.0_x64__3k8sg7r9htsxt/dependencies/node/bin/node.exe'
sha = lambda b: hashlib.sha256(b).hexdigest()
def read(p): return json.loads((ROOT/p).read_text(encoding='utf-8-sig'))
def write(p, obj):
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
def immutable(p, b):
    if p.exists(): assert p.read_bytes()==b, str(p)+' already differs'
    else: p.write_bytes(b)
def verify_hashes(report):
    assert isinstance(report['sourceHashes'], dict)
    for p,h in report['sourceHashes'].items():
        assert sha((ROOT/p).read_bytes())==h, ('stale', p)
    assert report['results'] and all(x['status']=='PASS' for x in report['results'])
    return len(report['results'])

regpath = ROOT/'docs/traceability/registry.json'
oldbytes = regpath.read_bytes(); reg = json.loads(oldbytes)
assert reg['version']=='2026-11-07-r17'
assert reg['facts']['customerAcceptancePassed']==0 and reg['facts']['customerAcceptanceTotal']==6
assert reg['facts']['release']=='HOLD' and reg['facts']['productionStarted'] is False
for source, target in [('docs/traceability/registry.json','registry-r17.json'),('docs/traceability/source-baseline.json','source-baseline-r17.json'),('docs/traceability/presentations.json','presentations-v33.json'),('docs/traceability/binary-documents.json','binary-documents-before.json')]:
    immutable(OUT/target,(ROOT/source).read_bytes())

# Normalize path spelling only; every stored hash is checked against the real frozen file.
front = read('outputs/reservation-retry-20261109/frontend-contract.json')
front['sourceHashes'] = {('scripts/test_portals.cjs' if Path(k).name=='test_portals.cjs' else k.replace('\\','/')):v for k,v in front['sourceHashes'].items()}
assert verify_hashes(front)==33
front['normalization']={'performedAt':datetime.now(timezone.utc).isoformat(),'sourceReport':'outputs/reservation-retry-20261109/frontend-contract.json','change':'Absolute script key converted to repository-relative path; result values and executedAt retained'}
frontpath='outputs/consumption-timing-20261110/adoption/frontend-contract-normalized.json'
write(ROOT/frontpath,front)

paths={
 'outputs/async-review-20261107/regression/trace-ui-2/results.json':'outputs/consumption-timing-20261110/regression/trace-ui-serial/results.json',
 'outputs/async-review-20261107/regression/local-ui-2/results.json':'outputs/consumption-timing-20261110/regression/local/results.json',
 'docs/traceability/reports/async-review-20261107/frontend-contract-normalized.json':frontpath,
 'outputs/async-review-20261107/independent-frontend/ui/results.json':'outputs/consumption-timing-20261110/regression/reviewer/results.json',
}
counts={p:verify_hashes(read(p)) for p in paths.values()}
assert sorted(counts.values())==[6,8,14,33]
changed=[]
for t in reg['tests']:
    ev=t.get('evidence',{})
    if ev.get('path') in paths:
        changed.append({'id':t['id'],'before':ev['path'],'after':paths[ev['path']]})
        ev['path']=paths[ev['path']]
assert len(changed)==39, len(changed)

ui = subprocess.run([NODE,'scripts/test_reservation_retry_ui.cjs'],cwd=ROOT,capture_output=True,text=True,encoding='utf-8')
assert ui.returncode==0 and 'PASS Reservation replay updates one dashboard row' in ui.stdout,(ui.stdout,ui.stderr)
uipath='outputs/consumption-timing-20261110/adoption/reservation-retry-ui.json'
write(ROOT/uipath,{'executedAt':datetime.now(timezone.utc).isoformat(),'mode':'Offline Node VM; actual App handlers with synthetic React hooks and API responses; no browser or real Google operation', 'command':[NODE,'scripts/test_reservation_retry_ui.cjs'],'stdout':ui.stdout,'stderr':ui.stderr,'sourceHashes':{p:sha((ROOT/p).read_bytes()) for p in ['src/App.tsx','scripts/test_reservation_retry_ui.cjs']},'results':[{'id':'RETRY-UI-01','name':'Reservation replay merges one row, preserves terminal state, inserts a new ID','status':'PASS'}]})
ptnames=['Unconfirmed reservation responses keep the same ID through reload and a verified replay','Late success from a shared ID cannot remove a newer pending reservation ID']
for num,name in zip([32,33],ptnames):
    assert any(x['name']==name for x in front['results'])
    reg['tests'].append({'id':f'PT-{num}','path':'scripts/test_portals.cjs','locator':name,'requirements':['REQ-18'],'mode':'offline-stub','category':'reservation-retry-contract','scope':'Node VMの架空認証・応答による同一タブ再送の検査。実Google受入・顧客確認ではない。','evidence':{'path':frontpath,'key':name,'requiredSources':list(front['sourceHashes'])}})
reg['tests'].append({'id':'RETRY-UI-01','path':'scripts/test_reservation_retry_ui.cjs','locator':'PASS Reservation replay updates one dashboard row','requirements':['REQ-18'],'mode':'offline-stub','category':'reservation-retry-ui-handler','scope':'実Appハンドラを合成Reactフックで実行。同一IDを1行へ集約し、取消状態を保持し、新IDを追加する3群を検査。ブラウザー・Google実連携ではない。','evidence':{'path':uipath,'key':'RETRY-UI-01','requiredSources':['src/App.tsx','scripts/test_reservation_retry_ui.cjs']}})
c=next(c for c in reg['capabilities'] if c['req']=='REQ-18')
c['tests']+=['PT-32','PT-33','RETRY-UI-01']
detail=' 予約の応答内容を確認できない場合は未確認として表示し、同じタブ・同じ入力の再送では同じ予約IDを保持する。一覧は同じIDを1行として更新し、遅い予定中の応答で完了・取消を戻さない。'
for key in ['requirement','expected','designText']: c[key]+=detail
c['operationText']+=' 結果不明時は同じタブを残し、予約一覧と残数を読み直す。必要な再送も同じ入力で照合し、別タブ・入力変更・タブを閉じた後には同じIDを保証しない。'
c['userText']='エラー後は同じタブを残し、予約一覧と残数を確認してください。同じタブで同じ内容を再送する場合は同じ予約IDで照合します。入力変更や別のタブでは新しい操作になるため、結果が分からないときは教室へ連絡してください。'
assert not any(x['path']=='src/App.tsx' and x['locator']=='handleCreateRide' for x in c['implementation'])
c['implementation'].append({'path':'src/App.tsx','locator':'handleCreateRide'})
c3=next(c for c in reg['capabilities'] if c['req']=='REQ-03')
timing=' 予約しただけでは残数は減らない。先生・管理者が完了にすると片道1回分・往復2回分が減る。残り2枚以下でも、この説明とMauro・Brendaへの連絡案内を表示する。'
for key in ['designText','operationText','userText']: c3[key]+=timing
reg['version']='2026-11-10-r18'
assert len(reg['capabilities'])==39 and len(reg['tests'])==206 and len(reg['flows'])==11 and len(reg['screens'])==20 and len(reg['interfaces'])==16
candidate=OUT/'registry-r18-candidate.json';write(candidate,reg)

reviews=[read('outputs/reservation-retry-20261109/independent-review.json'),read('outputs/consumption-timing-20261110/independent-review.json')]
approved={}
for review in reviews:
    assert review.get('result',review.get('status'))=='PASS',review.keys()
    approved.update(review.get('reviewedHashes',review.get('sourceHashes',{})))
baseline=read('docs/traceability/source-baseline.json')
declared={x['path'] for c in reg['capabilities'] for x in c['implementation']}|{t['path'] for t in reg['tests']}
updates=[]
for p in sorted(declared):
    actual=sha((ROOT/p).read_bytes())
    if baseline.get(p)!=actual:
        assert approved.get(p)==actual,('not independently reviewed',p,approved.keys())
        updates.append({'path':p,'before':baseline.get(p),'after':actual});baseline[p]=actual
assert set(baseline)==declared
write(OUT/'source-baseline-r18-candidate.json',baseline)
summary={'status':'CANDIDATE_READY_FOR_INDEPENDENT_REVIEW','createdAt':datetime.now(timezone.utc).isoformat(),'registryVersion':reg['version'],'registrySha256':sha(candidate.read_bytes()),'candidate':candidate.relative_to(ROOT).as_posix(),'canonicalRegistryChanged':False,'counts':{'requirements':39,'flows':11,'testCases':206,'screens':20,'interfaces':16},'repointedEvidence':changed,'newTests':['PT-32','PT-33','RETRY-UI-01'],'freshReportCounts':counts,'sourceBaselineUpdates':updates,'sourceBaselineCandidate':'outputs/consumption-timing-20261110/adoption/source-baseline-r18-candidate.json','customerPassed':0,'customerTotal':6,'productionStarted':False,'limits':['First trace UI attempt screenshot timed out; failed attempt retained, successful serial rerun adopted','Frontend contract was executed November9 and remains source-matched; not reported as new November10 execution','Actual Google and customer checks are separate']}
write(OUT/'registry-change-proposal.json',summary)
print(json.dumps(summary,ensure_ascii=False,indent=2))
