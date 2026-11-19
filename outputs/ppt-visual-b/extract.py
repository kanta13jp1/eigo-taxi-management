import zipfile,xml.etree.ElementTree as E,json,re
from pathlib import Path
base=Path('docs/deliverables/2026-10-23-traceability')
conf=[('tasks','tasks-2026-11-05-v28.pptx','タスクリスト'),('implementation','implementation-2026-11-03-v27.pptx','実装コード対応'),('test-code','test-code-2026-11-03-v27.pptx','テストコード対応'),('acceptance','acceptance-2026-11-03-v27.pptx','受入テスト仕様書')]
ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
all={}
for kind,fn,title in conf:
 with zipfile.ZipFile(base/fn) as z:
  pages=[]
  for i in range(1,11):
   root=E.fromstring(z.read(f'ppt/slides/slide{i}.xml'))
   txt=[x.text or '' for x in root.findall('.//a:t',ns)]
   entries=[]
   for pos,t in enumerate(txt):
    if re.match(r'^(TASK|CODE|TEST|AT|SAT)-\d{2}\s',t):
     entries.append([t,txt[pos+1] if pos+1<len(txt) else ''])
   if len(entries) not in (2,4):raise ValueError((kind,i,entries))
   # Preserve all source speaker note text for later interpretation and references.
   n=E.fromstring(z.read(f'ppt/notesSlides/notesSlide{i}.xml'))
   notes='\n'.join(x.text or '' for x in n.findall('.//a:t',ns))
   pages.append({'number':i,'rows':entries,'notes':notes,'original_text':txt})
  all[kind]={'title':title,'source':fn,'slides':pages}
Path('outputs/ppt-visual-b/contents.json').write_text(json.dumps(all,ensure_ascii=False,indent=2),encoding='utf-8')
for k,v in all.items():
 print(k,len(v['slides']),sum(len(s['rows']) for s in v['slides']),max(len(row[1]) for s in v['slides'] for row in s['rows']))
