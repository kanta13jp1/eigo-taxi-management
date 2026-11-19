from pathlib import Path
import hashlib,json,importlib.util
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'outputs/consumption-timing-20261110/adoption'
sha=lambda b:hashlib.sha256(b).hexdigest()
def write(p,o):p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
reg=json.loads((ROOT/'docs/traceability/registry.json').read_text(encoding='utf-8'))
assert sha((ROOT/'docs/traceability/registry.json').read_bytes())=='b29c2efe14ac2ecde7267afd77a50d3f8b131dcd7e2a8ccfb0778dcd88d77a3a'
evidence='outputs/consumption-timing-20261110/regression/modal-scroll/results.json'
report=json.loads((ROOT/evidence).read_text(encoding='utf-8'))
assert len(report['results'])==2 and all(x['status']=='PASS' for x in report['results']) and report['externalRequests']==[]
for p,h in report['sourceHashes'].items():assert sha((ROOT/p).read_bytes())==h,p
changes=[]
for t in reg['tests']:
    if t['id'] in ['UI-SCROLL-01','UI-SCROLL-02']:
        changes.append({'id':t['id'],'before':t['evidence']['path'],'after':evidence})
        t['evidence']['path']=evidence
assert len(changes)==2
candidate=OUT/'registry-r18-final-candidate.json';write(candidate,reg)
spec=importlib.util.spec_from_file_location('trace','scripts/traceability.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
old=json.loads((OUT/'registry-r17.json').read_text(encoding='utf-8'))
csvpath='docs/acceptance/third-party-acceptance-checklist.csv'
oldbytes=m.generated(old)[csvpath].encode('utf-8')
binary=json.loads((ROOT/'docs/traceability/binary-documents.json').read_text(encoding='utf-8'))
item=next(x for x in binary['documents'] if x['path']==csvpath)
assert sha(oldbytes)==item['sha256'],'Reconstructed historical CSV mismatch'
(OUT/'third-party-acceptance-checklist-r17.csv').write_bytes(oldbytes)
newbytes=m.generated(reg)[csvpath].encode('utf-8')
assert (ROOT/csvpath).read_bytes()==newbytes
before=item['sha256'];item['sha256']=sha(newbytes)
write(OUT/'binary-documents-csv-candidate.json',binary)
summary={'status':'SUPPLEMENT_READY_FOR_REVIEW','date':'2026-11-10','initialApprovedRegistrySha256':'b29c2efe14ac2ecde7267afd77a50d3f8b131dcd7e2a8ccfb0778dcd88d77a3a','registryVersion':reg['version'],'registrySha256':sha(candidate.read_bytes()),'candidate':candidate.relative_to(ROOT).as_posix(),'additionalEvidencePaths':changes,'evidenceValidation':{'modalScrollPassed':2,'externalRequests':0,'allSourceHashesMatched':True},'csv':{'path':csvpath,'oldPreserved':'outputs/consumption-timing-20261110/adoption/third-party-acceptance-checklist-r17.csv','before':before,'after':sha(newbytes),'reason':'Only AT-18 expected text changes. All 30 execution fields remain exactly equal to r17: 27 未実施 and 3 BLOCKED, no added execution or PASS.'},'binaryCandidate':'outputs/consumption-timing-20261110/adoption/binary-documents-csv-candidate.json','canonicalRegistryChangedByThisSupplement':False,'requirements':39,'flows':11,'tests':206,'screens':20,'interfaces':16,'customerPassed':0,'productionStarted':False}
write(OUT/'registry-supplement-proposal.json',summary);print(json.dumps(summary,ensure_ascii=False,indent=2))
