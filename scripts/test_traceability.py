"""Negative tests for the trace checker. No application/Google mutation."""
import copy,json,os,tempfile
from pathlib import Path
import traceability as t
def run():
 r=t.load();rows=[]
 def case(ident,fn):fn();rows.append({'id':ident,'status':'PASS'})
 def reject(mutator,code):
  x=copy.deepcopy(r);mutator(x);found=t.validate(x,check_files=False)['errors'];assert any(e['code']==code for e in found),(code,found)
 case('TRACE-01',lambda: (lambda v: (_ for _ in ()).throw(AssertionError(v)) if v['errors'] else None)(t.validate(r,check_files=False)))
 case('TRACE-02',lambda:reject(lambda x:x['capabilities'][1].update(req=x['capabilities'][0]['req']),'DUPLICATE_ID'))
 case('TRACE-03',lambda:reject(lambda x:x['capabilities'][0].update(design=''),'MISSING_STAGE'))
 case('TRACE-04',lambda:reject(lambda x:x['capabilities'][0].update(bf='BF-999'),'BROKEN_REF'))
 case('TRACE-05',lambda:reject(lambda x:x['facts'].update(roundTrip=1),'FACT_CONFLICT'))
 case('TRACE-06',lambda:reject(lambda x:x['capabilities'][0].update(acceptanceStatus='PASS'),'UNSUPPORTED_ACCEPTANCE_PASS'))
 case('TRACE-07',lambda:reject(lambda x:x['tests'][0].update(requirements=['REQ-999']),'ORPHAN_TEST'))
 case('TRACE-08',lambda:reject(lambda x:x['screens'].append(copy.deepcopy(x['screens'][0])),'DUPLICATE_ID'))
 case('TRACE-09',lambda:reject(lambda x:x['capabilities'][0].update(acceptance='SAT-01'),'ACCEPTANCE_COUNT'))
 case('TRACE-10',lambda:reject(lambda x:x['capabilities'][0].update(tests=[],testGap=''),'UNDECLARED_TEST_GAP'))
 with tempfile.TemporaryDirectory(prefix='trace-test-') as tmp:
  root=Path(tmp);(root/'gas').mkdir();(root/'src/services').mkdir(parents=True)
  (root/'gas/Code.gs').write_text('roundtrip" ? 2 : 1','utf-8');(root/'src/services/api.ts').write_text("signInGoogle 'Content-Type':'text/plain;charset=utf-8'",'utf-8')
  def missing():
   result=t.validate(r,root=root);codes={e['code'] for e in result['errors']};assert {'CODE_LOCATOR_MISSING','TEST_LOCATOR_MISSING','GENERATED_DRIFT','DOCUMENT_INDEX_MISSING'}<=codes
  case('TRACE-11',missing)
  # Also prove active local document references fail closed.
  (root/'docs/traceability').mkdir(parents=True,exist_ok=True)
  (root/'active.md').write_text('[bad](missing.md#REQ-999)','utf-8')
  (root/'docs/traceability/documents.json').write_text(json.dumps({'documents':[{'path':'active.md','state':'current','sha256':t.sha((root/'active.md').read_bytes()),'items':[]}]}),'utf-8')
  assert any(e['code']=='LOCAL_LINK_MISSING' for e in t.validate(r,root=root)['errors'])
  def source_fact():
   (root/'gas/Code.gs').write_text('roundtrip" ? 1 : 1','utf-8');assert any(e['code']=='SOURCE_FACT_CONFLICT' for e in t.validate(r,root=root)['errors'])
  case('TRACE-12',source_fact)
 def evidence_missing():
  y=copy.deepcopy(r);y['tests'][0]['requirements']=[]
  assert any(e['code']=='ASYMMETRIC_TEST_REF' for e in t.validate(y,check_files=False)['errors'])
  x=copy.deepcopy(r);x['tests'][0]['evidence']={'path':'docs/traceability/reports/does-not-exist.json','key':'GAS-01'}
  assert any(e['code']=='TEST_EVIDENCE_MISSING' for e in t.validate(x)['errors'])
 case('TRACE-13',evidence_missing)
 def evidence_stale():
  with tempfile.TemporaryDirectory(prefix='trace-evidence-') as tmp:
   p=Path(tmp)/'report.json';p.write_text(json.dumps({'results':[{'id':'GAS-01','status':'PASS'}],'sourceHashes':{'gas/Code.gs':'0'*64}}),'utf-8')
   x=copy.deepcopy(r);x['tests'][0]['evidence']={'path':str(p),'key':'GAS-01'}
   assert any(e['code']=='TEST_EVIDENCE_STALE' for e in t.validate(x)['errors'])
 case('TRACE-14',evidence_stale)
 with tempfile.TemporaryDirectory(prefix='trace-source-review-') as tmp:
  root=Path(tmp);(root/'tracked.js').write_text('old','utf-8')
  fixture={'capabilities':[{'implementation':[{'path':'tracked.js'}]}], 'tests':[]}
  reviewed={'tracked.js':t.sha((root/'tracked.js').read_bytes())}
  assert not t.source_review_errors(fixture,reviewed,root)
  def unregistered():
   x=copy.deepcopy(fixture);x['tests'].append({'path':'new-test.js'})
   assert any(e['message']=='unregistered: new-test.js' for e in t.source_review_errors(x,reviewed,root))
  case('TRACE-15',unregistered)
  def retired():
   old={**reviewed,'retired.js':'unused'}
   assert any(e['message']=='retired: retired.js' for e in t.source_review_errors(fixture,old,root))
  case('TRACE-16',retired)
  def changed_or_deleted():
   (root/'tracked.js').write_text('changed','utf-8')
   assert any(e['message']=='tracked.js' for e in t.source_review_errors(fixture,reviewed,root))
   (root/'tracked.js').unlink()
   assert any(e['message']=='tracked.js' for e in t.source_review_errors(fixture,reviewed,root))
  case('TRACE-17',changed_or_deleted)
 with tempfile.TemporaryDirectory(prefix='trace-baseline-file-') as tmp:
  root=Path(tmp);(root/'gas').mkdir();(root/'src/services').mkdir(parents=True);(root/'docs/traceability').mkdir(parents=True)
  (root/'gas/Code.gs').write_text('roundtrip" ? 2 : 1','utf-8')
  (root/'src/services/api.ts').write_text("signInGoogle 'Content-Type':'text/plain;charset=utf-8'",'utf-8')
  def missing_baseline():
   assert any(e['code']=='SOURCE_REVIEW_REQUIRED' and e['message']=='source baseline missing' for e in t.validate(r,root=root)['errors'])
  case('TRACE-18',missing_baseline)
  def invalid_baseline():
   baseline=root/'docs/traceability/source-baseline.json'
   for data in ['{','[]','{"bad":"not-a-sha256"}']:
    baseline.write_text(data,'utf-8')
    assert any(e['code']=='SOURCE_REVIEW_REQUIRED' and e['message']=='source baseline invalid' for e in t.validate(r,root=root)['errors'])
  case('TRACE-19',invalid_baseline)
 with tempfile.TemporaryDirectory(prefix='trace-evidence-hashes-') as tmp:
  p=Path(tmp)/'report.json';key='GAS-01';test_path='scripts/test_gas.cjs';impl_path='gas/Code.gs'
  hashes={s:t.sha((t.ROOT/s).read_bytes()) for s in (test_path,impl_path)}
  def reject_evidence(data,required,expected):
   p.write_text(json.dumps(data),'utf-8');x=copy.deepcopy(r)
   x['tests'][0]['evidence']={'path':str(p),'key':key,'requiredSources':required}
   errors=t.validate(x)['errors']
   assert any(e['code']==expected and e['message'].startswith(x['tests'][0]['id']) for e in errors),(expected,errors)
  def missing_map():
   reject_evidence({'results':[{'id':key,'status':'PASS'}]},[test_path,impl_path],'TEST_EVIDENCE_HASH_REQUIRED')
  case('TRACE-20',missing_map)
  def missing_implementation():
   reject_evidence({'results':[{'id':key,'status':'PASS'}],'sourceHashes':{test_path:hashes[test_path]}},[test_path,impl_path],'TEST_EVIDENCE_HASH_REQUIRED')
  case('TRACE-21',missing_implementation)
  def invalid_hash_or_contract():
   for invalid in ['bad',None,3]:
    reject_evidence({'results':[{'id':key,'status':'PASS'}],'sourceHashes':{test_path:hashes[test_path],impl_path:invalid}},[test_path,impl_path],'TEST_EVIDENCE_HASH_REQUIRED')
   reject_evidence({'results':[{'id':key,'status':'PASS'}],'sourceHashes':hashes},[impl_path],'TEST_EVIDENCE_HASH_REQUIRED')
   p.write_text('{','utf-8');x=copy.deepcopy(r)
   x['tests'][0]['evidence']={'path':str(p),'key':key,'requiredSources':[test_path,impl_path]}
   assert any(e['code']=='TEST_EVIDENCE_INVALID' and e['message']==x['tests'][0]['id'] for e in t.validate(x)['errors'])
  case('TRACE-22',invalid_hash_or_contract)
 with tempfile.TemporaryDirectory(prefix='trace-customer-evidence-') as tmp:
  root=Path(tmp);record_path=root/'customer-result.json'
  def customer_fixture():
   x=copy.deepcopy(r);c=x['customerAcceptance']['cases'][0]
   c.update(status='PASS',reviewer=x['customerAcceptance']['reviewer'],testedAt='2026-11-07T17:00:00+09:00',
    release='verification-release-123',observed='本人Googleログイン後、指定家庭の架空生徒1名・残数5枚。他家庭の選択肢なし。',resultRecord='customer-result.json')
   x['facts']['customerAcceptancePassed']=1
   actual={k:c[k] for k in ('id','status','reviewer','testedAt','release','observed')}
   actual['googleIdentityVerified']=True
   return x,{'mode':'real-customer-check','results':[actual]}
  def customer_errors(x,record):
   record_path.write_text(json.dumps(record,ensure_ascii=False),'utf-8')
   return t.validate(x,root=root,check_files=False)['errors']
  def customer_counts():
   for mutate in (lambda x:x['facts'].update(customerAcceptancePassed=2),
    lambda x:x['facts'].update(customerAcceptanceTotal=7),
    lambda x:x['customerAcceptance']['cases'].pop()):
    x,record=customer_fixture();mutate(x)
    assert any(e['code']=='CUSTOMER_ACCEPTANCE_COUNT' for e in customer_errors(x,record))
  case('TRACE-23',customer_counts)
  def customer_missing_metadata():
   for key in ('reviewer','testedAt','release','observed','resultRecord'):
    for value in ('', '  ', None):
     x,record=customer_fixture();x['customerAcceptance']['cases'][0][key]=value
     assert any(e['code']=='UNSUPPORTED_ACCEPTANCE_PASS' for e in customer_errors(x,record))
  case('TRACE-24',customer_missing_metadata)
  def customer_missing_record():
   x,record=customer_fixture();x['customerAcceptance']['cases'][0]['resultRecord']='missing.json'
   assert any(e['code']=='CUSTOMER_EVIDENCE_MISSING' for e in customer_errors(x,record))
  case('TRACE-25',customer_missing_record)
  def customer_invalid_record():
   for record in ([],{}, {'mode':'real-customer-check','results':None}):
    x,_=customer_fixture();assert any(e['code']=='CUSTOMER_EVIDENCE_INVALID' for e in customer_errors(x,record))
   x,_=customer_fixture();record_path.write_text('{','utf-8')
   assert any(e['code']=='CUSTOMER_EVIDENCE_INVALID' for e in t.validate(x,root=root,check_files=False)['errors'])
  case('TRACE-26',customer_invalid_record)
  def customer_nonlive_mode():
   for mode in (None,'demo','offline','GAS VM stubs, no real Google'):
    x,record=customer_fixture();record['mode']=mode
    assert any(e['code']=='CUSTOMER_EVIDENCE_MODE' for e in customer_errors(x,record))
  case('TRACE-27',customer_nonlive_mode)
  def customer_record_mismatch():
   for key in ('id','status','reviewer','testedAt','release','observed'):
    x,record=customer_fixture();record['results'][0][key]='different'
    assert any(e['code']=='CUSTOMER_EVIDENCE_MISMATCH' for e in customer_errors(x,record))
   x,record=customer_fixture();record['results'].append(copy.deepcopy(record['results'][0]))
   assert any(e['code']=='CUSTOMER_EVIDENCE_MISMATCH' for e in customer_errors(x,record))
  case('TRACE-28',customer_record_mismatch)
  def customer_reviewer_and_time():
   x,record=customer_fixture();x['customerAcceptance']['cases'][0]['reviewer']='開発側AI'
   record['results'][0]['reviewer']='開発側AI'
   assert any(e['code']=='CUSTOMER_EVIDENCE_MISMATCH' for e in customer_errors(x,record))
   for stamp in ('not-a-date','2026-11-07','2026-11-07T17:00:00'):
    x,record=customer_fixture();x['customerAcceptance']['cases'][0]['testedAt']=stamp;record['results'][0]['testedAt']=stamp
    assert any(e['code']=='CUSTOMER_EVIDENCE_INVALID' for e in customer_errors(x,record))
  case('TRACE-29',customer_reviewer_and_time)
  def customer_google_unverified():
   for value in (None,False,'true',1):
    x,record=customer_fixture();record['results'][0]['googleIdentityVerified']=value
    assert any(e['code']=='CUSTOMER_EVIDENCE_MODE' for e in customer_errors(x,record))
  case('TRACE-30',customer_google_unverified)
  def customer_record_positive():
   x,record=customer_fixture();assert not customer_errors(x,record)
   assert all(c['acceptanceStatus']!='PASS' for c in x['capabilities'][:30])
   assert all(c['status']=='NOT_RUN' for c in r['customerAcceptance']['cases'])
  case('TRACE-31',customer_record_positive)
 case('TRACE-32',lambda:reject(lambda x:x['facts'].update(calendarPermissionAdded=False),'FACT_CONFLICT'))
 def self_paced_dependency():
  for changes in ({'mode':'single-account-phased'},{'requiresDeveloperDuringExecution':True},
                  {'storedRole':'admin'},{'portalRoles':['admin']},
                  {'completionView':'A02'},{'completionDatePolicy':'customer-execution-day'},
                  {'pauseResume':'restart-all-steps'}):
   reject(lambda x: x['customerAcceptance']['preparation'].update(changes),'CUSTOMER_EXECUTION_CONFLICT')
 case('TRACE-33',self_paced_dependency)
 def self_paced_gate():
  for invalid in (None,[], 'invalid', 1):
   reject(lambda x:x['customerAcceptance'].update(preparation=invalid),'CUSTOMER_EXECUTION_CONFLICT')
  for changes in ({'reviewEnvironmentGate':''},{'reviewEnvironmentGatePolicy':'all-workbooks'}):
   reject(lambda x: x['customerAcceptance']['preparation'].update(changes),'CUSTOMER_EXECUTION_CONFLICT')
  reject(lambda x:x['facts'].update(customerExecutionMode='production-dual-role'),'CUSTOMER_EXECUTION_CONFLICT')
 case('TRACE-34',self_paced_gate)
 report={'suite':'traceability-negative-tests','total':len(rows),'passed':len(rows),'results':rows,'mode':'offline local; deliberate registry/source defects in copies',
  'sourceHashes':{p:t.sha((t.ROOT/p).read_bytes()) for p in ['scripts/traceability.py','scripts/test_traceability.py']}}
 p=Path(os.environ.get('EIGO_TEST_OUTPUT_DIR',t.ROOT/'docs/traceability/reports'))/'checker-tests.json';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(t.dump(report),'utf-8');print(json.dumps(report));return report
if __name__=='__main__':run()
