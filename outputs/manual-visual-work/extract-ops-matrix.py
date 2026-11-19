from zipfile import ZipFile
from pathlib import Path
import re, html, json
root=Path('docs/deliverables/2026-10-23-traceability')
allout={}
for key,name in [('ops','operations-2026-11-03-v27.pptx'),('matrix','matrix-2026-11-03-v27.pptx')]:
    with ZipFile(root/name) as z:
        slides=[]
        for i in range(1,11 if key=='ops' else 9):
            def texts(n):
                data=z.read(n).decode('utf-8')
                return [html.unescape(x) for x in re.findall(r'<a:t>(.*?)</a:t>',data,flags=re.S)]
            slides.append({'body':texts(f'ppt/slides/slide{i}.xml'),'notes':texts(f'ppt/notesSlides/notesSlide{i}.xml')})
        allout[key]=slides
Path('outputs/manual-visual-work/ops-matrix-source.json').write_text(json.dumps(allout,ensure_ascii=False),encoding='utf8')
