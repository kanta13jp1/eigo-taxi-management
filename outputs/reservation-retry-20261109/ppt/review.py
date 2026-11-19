import json, hashlib, zipfile, re
from pathlib import Path
from xml.etree import ElementTree as ET

root=Path.cwd()
out=root/'outputs/reservation-retry-20261109/ppt'
run=out/'final-candidate-v2'
final=root/'docs/deliverables/2026-11-09-reservation-retry/progress-retry-2026-11-09-v2-blocked.pptx'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
facts=json.loads((out/'facts.json').read_text(encoding='utf-8-sig'))
manifest=json.loads((root/'docs/traceability/presentations.json').read_text(encoding='utf-8-sig'))
validation=json.loads((run/'validation.json').read_text(encoding='utf-8'))
checks={
 'twelve_reference_ppt_hashes_unchanged':len(manifest)==12 and all(sha(root/x['path'])==x['sha256'] for x in manifest),
 'delivered_equals_finalized_bytes':sha(final)==sha(run/'final'/final.name),
 'blocked_facts_explicit':facts['stage']=='LOCAL_REVIEWED_DEPLOY_BLOCKED' and facts['deployment']['status']=='BLOCKED_REAUTH' and facts['publicUi']['status']=='NOT_RUN',
 'production_not_started':facts['productionStarted'] is False,
 'customer_fixture_mutations_zero':facts['customerFixtureMutations']==0,
 'local_test_counts_match':facts['localTests']['frontendPassed']==33 and facts['localTests']['frontendTotal']==33 and facts['localTests']['gasPassed']==85 and facts['localTests']['gasTotal']==85,
 'package_and_layout_findings_zero':validation['packageIntegrity']['findingCount']==0 and validation['presentationLayout']['findingCount']==0,
 'layout_warnings_zero':validation['presentationLayout']['warning_count']==0,
 'first_party_reimport_pass':validation['firstPartyImport']['passed'] is True,
}
with zipfile.ZipFile(final) as z:
 names=z.namelist()
 slides=sorted(n for n in names if re.fullmatch(r'ppt/slides/slide\d+\.xml',n))
 notes=sorted(n for n in names if re.fullmatch(r'ppt/notesSlides/notesSlide\d+\.xml',n))
 text='\n'.join(''.join(ET.fromstring(z.read(n)).itertext()) for n in slides+notes)
 checks['four_slides_and_notes']=len(slides)==4 and len(notes)==4
 checks['private_identity_and_household_urls_absent']=not re.search(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|#/parent/[0-9a-f-]{30,}|STU-CUST-|CUST-04 完了用',text)
 checks['not_deployed_visible']='修正版は検証サイトへ未反映です' in text
 checks['google_real_customer_limits_visible']='実Google連携' in text and '顧客6件' in text
 checks['old_incident_cause_unknown']='因果関係は未確定' in text
 checks['native_table_on_slide_three']=ET.fromstring(z.read('ppt/slides/slide3.xml')).find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}tbl') is not None
 checks['at_least_one_illustration']=len([n for n in names if n.startswith('ppt/media/')])>=3
assert all(checks.values()),checks
receipt={'status':'PASS','reviewer':'/root/retry_docs_ppt','purpose':'Obstacle notice only; no updated public release adoption','final':str(final),'sha256':sha(final),'factsSha256':sha(out/'facts.json'),'checks':checks,'visualInspection':{'status':'PASS','method':'Viewed all four final Artifact Tool round-trip PNGs at 1280x720 and compared source template logo, sky frame, colors and Yu Gothic','slides':[{'slide':i,'clipping':False,'unintendedOverlap':False,'readable':True} for i in range(1,5)]},'limits':'Structural and local render QA only; native Microsoft PowerPoint was not executed. New public-site deployment and post-deploy public UI checks remain NOT_RUN.'}
(run/'render-review-receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding='utf-8')
a=json.loads((run/'authoring-result.json').read_text(encoding='utf-8'))
a['stage']='VERIFIED_BLOCKER_NOTICE_NO_RELEASE_ADOPTION'
a['visualReview']='PASS_ALL_FOUR_ROUNDTRIP_RENDERS'
a['renderReviewReceipt']=str(run/'render-review-receipt.json')
(run/'authoring-result.json').write_text(json.dumps(a,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'status':'PASS','checks':checks,'sha256':sha(final)},ensure_ascii=False,indent=2))
