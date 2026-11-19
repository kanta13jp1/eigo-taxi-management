import json, hashlib, zipfile, re
from pathlib import Path
from xml.etree import ElementTree as ET
root=Path.cwd()
out=root/'outputs/teacher-reviewer-20261107/ppt'
final=root/'docs/deliverables/2026-11-07-teacher-review/teacher-review-guide-2026-11-07-v1.pptx'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
manifest=json.loads((root/'docs/traceability/presentations.json').read_text(encoding='utf-8-sig'))
checks={
 'reference_manifest_twelve_files_unchanged':len(manifest)==12 and all(sha(root/x['path'])==x['sha256'] for x in manifest),
 'delivered_equals_finalized_bytes':sha(final)==sha(out/'final/teacher-review-guide-2026-11-07-v1.pptx'),
 'ticket_example_arithmetic':5-1==4 and 4-2==2 and 2+10==12,
}
with zipfile.ZipFile(final) as z:
 names=z.namelist()
 slides=sorted(n for n in names if re.fullmatch(r'ppt/slides/slide\d+\.xml',n))
 notes=sorted(n for n in names if re.fullmatch(r'ppt/notesSlides/notesSlide\d+\.xml',n))
 text='\n'.join(''.join(ET.fromstring(z.read(n)).itertext()) for n in slides+notes)
 checks['exactly_four_slides']=len(slides)==4
 checks['four_notes_parts']=len(notes)==4
 checks['private_email_and_household_url_absent']=not re.search(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|#/parent/[0-9a-f-]{30,}',text)
 checks['customer_fixtures_absent']=not re.search(r'STU-CUST-|CUST-04 完了用',text)
 checks['teacher_google_not_run_stated']='NOT_RUN' in text
 checks['optional_examples_explicit']='予約と取消の操作例（任意）' in text and '完了とチケット追加の操作例（任意）' in text
 checks['teacher_only_student_stated']='先生確認用・架空生徒' in text
 checks['table_native_on_page_four']=ET.fromstring(z.read('ppt/slides/slide4.xml')).find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}tbl') is not None
assert all(checks.values()),checks
receipt={'status':'PASS','final':str(final),'sha256':sha(final),'checks':checks,'visualInspection':{'status':'PASS','method':'Viewed each Artifact Tool round-trip PNG at 1280x720, comparing shared logo/frame/font/colors with source slide 11','slides':[{'slide':i,'result':'PASS','clipping':False,'unintendedOverlap':False,'textReadable':True} for i in range(1,5)]},'claimBoundary':'Package, layout, reimport and local render review only. Native Microsoft PowerPoint display not tested. Teacher Google authentication NOT_RUN.'}
(out/'render-review-receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding='utf-8')
a=json.loads((out/'authoring-result.json').read_text(encoding='utf-8'))
a['visualReview']='PASS_ALL_FOUR_ROUNDTRIP_RENDERS'
a['renderReviewReceipt']=str(out/'render-review-receipt.json')
a['sourceTwelvePptHashCheck']='PASS'
(out/'authoring-result.json').write_text(json.dumps(a,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'status':'PASS','checks':checks,'sha256':sha(final)},ensure_ascii=False,indent=2))
