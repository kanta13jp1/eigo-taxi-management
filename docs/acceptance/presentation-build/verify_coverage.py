import zipfile, json, pathlib, re, hashlib
from xml.etree import ElementTree as E
root=pathlib.Path(r'C:/Users/kanta/GitHub/eigo-taxi-management')
f=root/'deliverables/eigo-taxi-acceptance-2026-10-20-v2.pptx'
with zipfile.ZipFile(f) as z:
 slides=[n for n in z.namelist() if re.fullmatch(r'ppt/slides/slide\d+\.xml',n)]
 notes=[n for n in z.namelist() if re.fullmatch(r'ppt/notesSlides/notesSlide\d+\.xml',n)]
 text='\n'.join(' '.join(E.fromstring(z.read(n)).itertext()) for n in slides+notes)
 assert len(slides)==143
 assert len(notes)==143
 for i in range(1,31):
  for prefix in ['AT','UC','REQ','FS','TASK','CODE','TEST']:
   assert f'{prefix}-{i:02}' in text,(prefix,i)
 for i in range(1,24):assert f'PUB-{i:02}' in text
 assert '2026-10-19T16-59-40-731Z' in text
 assert '2026-10-19T17-00-52-047Z-264bbd' in text
 assert 'BLOCKED' in text
 media=[n for n in z.namelist() if n.startswith('ppt/media/') and n.endswith('.png')]
 print(json.dumps({'slides':len(slides),'notes':len(notes),'embeddedPNG':len(media),'all30TraceIDs':True,'all23PublicIDs':True,'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size},indent=2))

