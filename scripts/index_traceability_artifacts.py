from pathlib import Path
import json,hashlib,zipfile,xml.etree.ElementTree as E
root=Path('.');base=root/'docs/traceability';folder=root/'docs/deliverables/2026-10-23-traceability'
rows=[];index=['# 現行配布用PowerPoint（共通デザイン）','','版：2026-10-24-r13。12点・126スライド。MightyLINK HP参照のロゴ・空写真・水色／オレンジ枠・Yu Gothicで統一。編集可能な図形・表を使用。','','本文全文の正本は [文書管理の入口](../../traceability/README.md)。スライドは要約、全文と工程参照をノートに収録。旧版PowerPointは履歴として保持し、現行配布対象ではありません。','','|資料ID|資料|スライド数|検証|','|---|---|---:|---|']
names=['business','requirements','design','test-spec','tasks','implementation','test-code','acceptance','operations','user','matrix','progress']
for n,name in enumerate(names,1):
 stage=base/'reports/ppt-r13'/name;m=json.loads((stage/'meta.json').read_text('utf-8-sig'));p=folder/(name+'-2026-10-24-v13.pptx');h=hashlib.sha256(p.read_bytes()).hexdigest();receipt=stage/'validation.json'
 assert json.loads(receipt.read_text('utf-8-sig'))['finalSha256']==h
 rows.append(dict(id=f'PKG-{n:02}',path=p.as_posix(),themeId='mighty-hp-v1',registryVersion='2026-10-24-r13',registrySha256=hashlib.sha256((base/'registry.json').read_bytes()).hexdigest(),sha256=h,receipt=receipt.as_posix(),slides=m['count']))
 index.append(f'|PKG-{n:02}|[{m["title"]}]({p.name})|{m["count"]}|構造・描画確認済み|')
index+=['','業務合格は別判定です。テスト対応の不足0項目。ローカル検査と実受入は分離し、実Google受入AT-24〜30、第三者受入0/30を未完として保持。Calendar権限未追加・本番未開始。']
(folder/'README.md').write_text('\n'.join(index)+'\n','utf-8');(base/'presentations.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n','utf-8')
# Binary evidence remains unchanged, with sidecar IDs for each text paragraph in PPTX.
entries=[]
for p in sorted((root/'docs').rglob('*')):
 if p.suffix.lower() not in ('.pptx','.pdf','.xlsx','.csv') or any(x in p.parts for x in ('node_modules','presentation-build','reports','history')):continue
 state='current' if p.as_posix() in {x['path'] for x in rows} or p.as_posix()=='docs/traceability/matrix.csv' else 'historical'
 d=dict(id=f'BIN-{len(entries)+1:04}',path=p.as_posix(),state=state,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),items=[])
 if p.suffix=='.pptx':
  with zipfile.ZipFile(p)as z:
   slides=sorted([x for x in z.namelist() if __import__('re').match(r'ppt/slides/slide\d+.xml$',x)],key=lambda x:int(__import__('re').search(r'slide(\d+)',x)[1]))
   for sn,x in enumerate(slides,1):
    for j,a in enumerate(E.fromstring(z.read(x)).findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}p'),1):
     t=''.join(a.itertext())
     if t.strip():d['items'].append(dict(id=f'{d["id"]}-SL-{sn:03}-ITEM-{j:04}',slide=sn,contentSha256=hashlib.sha256(t.encode()).hexdigest()))
 entries.append(d)
(base/'binary-documents.json').write_text(json.dumps(dict(documents=entries),ensure_ascii=False,indent=2)+'\n','utf-8')
print('Current decks',len(rows),'binary inventory',len(entries))
