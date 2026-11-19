from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as E
from PIL import Image,ImageChops,ImageDraw
import json,hashlib,shutil,re,sys
B=Path(__file__).resolve().parent;R=B.parents[2];O=R/'docs/traceability/reports/ppt-at28-20261110';O.mkdir(exist_ok=True)
M=R/'docs/traceability/presentations.json';D=R/'docs/deliverables/2026-10-23-traceability';C=R/'docs/traceability/binary-documents.json'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(p,o):p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(b):return hashlib.sha256(b).hexdigest()
def h(p):return sha(p.read_bytes())
def cp(p,t):
    if t.exists():assert h(t)==h(p),(p,t)
    else:shutil.copyfile(p,t)
def ns(t):return '{http://schemas.openxmlformats.org/drawingml/2006/main}'+t
def texts(z,t):return [n.text for n in E.fromstring(z.read(t)).iter(ns('t')) if n.text]
def payload(x):return re.sub(r'\s+','',''.join(x))
A=read(B/'authoring-results.json');src=read(B/'source-manifest.json');assert h(M)==A['locked']['docs/traceability/presentations.json'];assert all(h(R/k)==v for k,v in A['locked'].items());prop=read(B/'source-manifest.json')
rows=[]
for a in A['records']:
    name=a['name'];r=B/name;n=a['sourceSlides'];final=Path(a['final']);s=R/a['source'];d=O/name;d.mkdir(exist_ok=True)
    assert h(s)==a['sourceSha256'] and h(final)==a['sha256']
    rep=read(r/'validation.json');assert rep['firstPartyImport']['passed'] and rep['packageIntegrity']['finding_count']==rep['presentationLayout']['finding_count']==rep['presentationLayout']['warning_count']==0
    assert rep['finalSha256']==h(final)
    orig=R/'outputs/consumption-timing-20261110/ppt-v34/finalized'/name/'roundtrip'
    with ZipFile(s)as z,ZipFile(final)as y:
        om={sha(z.read(k))for k in z.namelist()if k.startswith('ppt/media/')};nm={sha(y.read(k))for k in y.namelist()if k.startswith('ppt/media/')};assert om<=nm
        for i in range(1,n+1):
            img=Image.open(orig/f'{i}.png').convert('RGB');new=Image.open(r/'roundtrip'/f'{i}.png').convert('RGB');assert new.size==img.size and not ImageChops.difference(img,new).getbbox(),(name,i,'pixels')
            k=f'ppt/notesSlides/notesSlide{i}.xml';assert payload(texts(z,k))==payload(texts(y,k)),(name,i,'notes')
        for i in [n+1,n+2]:
            nt=''.join(texts(y,f'ppt/notesSlides/notesSlide{i}.xml'));assert all(v in nt for v in ['AT-28','C10','本番HOLD','0/6','GAS','実台帳','=#REF!*3'])
            assert not re.search(r'https?://|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}',nt)
        assert E.fromstring(y.read(f'ppt/slides/slide{n+1}.xml')).find('.//'+ns('tbl'))is not None
    pages=sorted((r/'roundtrip').glob('*.png'),key=lambda x:int(x.stem));assert len(pages)==n+2
    sheet=Image.new('RGB',(960,((len(pages)+2)//3)*204),'#ddd');draw=ImageDraw.Draw(sheet)
    for i,p in enumerate(pages):
        im=Image.open(p);im.thumbnail((310,175));x=i%3*320;y=i//3*204;sheet.paste(im,(x,y));draw.text((x+8,y+177),name+' '+p.stem,fill='black')
    sheet.save(d/'contact.png');cp(r/'validation.json',d/'validation.json')
    for i in [n+1,n+2]:cp(r/'roundtrip'/f'{i}.png',d/f'current-{i}.png')
    p=next(x for x in prop if x['id']==a['id']);p.update(path=(D/f'{name}-2026-11-10-v35.pptx').relative_to(R).as_posix(),sha256=a['sha256'],slides=a['slides'],receipt=(d/'validation.json').relative_to(R).as_posix());p['contentReview']+=' 架空Googleシート2件のAT-28部分確認。貼り付け・複写・改名・削除を比較。C10、GAS・実台帳・Calendar・サイト連携は未実施。'
    rows.append({**a,'oldPagesPixelIdentical':n,'oldNotesTextPreserved':n,'oldMediaHashesPreserved':len(om),'renderedPages':len(pages),'newWarnings':0,'reimportPassed':True})
assert len(rows)==3 and sum(r['sourceSlides']for r in rows)==45 and sum(r['slides']for r in rows)==51 and sum(p['slides']for p in prop)==190
assert sum(p==s for p,s in zip(prop,src))==9
write(O/'review.json',{'status':'MACHINE_CHECKS_PASSED','independentReview':'separate','nativePowerPointChecked':False,'renderedPages':51,'oldFullPagesPixelIdentical':45,'oldNotesPreserved':45,'newPages':6,'newWarnings':0,'rows':rows})
write(O/'proposed-presentations.json',prop);cp(B/'freeze.json',O/'freeze.json');cp(B/'authoring-results.json',O/'authoring-results.json')
if len(sys.argv)<2: print('Ready for independent review',h(O/'proposed-presentations.json'));sys.exit()
assert sys.argv[1]==h(O/'proposed-presentations.json') and (O/'independent-ppt-review.json').is_file()
rev=read(O/'independent-ppt-review.json');assert rev.get('status',rev.get('result'))=='PASS'
binary=read(C);before=binary['documents'];by={x['path']:x for x in before};nextid=max(int(x['id'].split('-')[1])for x in before)+1
for p in [M,C,D/'README.md']:cp(p,B/('before-adoption-'+p.name))
for a in rows:
    p=next(q for q in prop if q['id']==a['id']);cp(Path(a['final']),R/p['path']);by[a['source']]['state']='historical';assert p['path']not in by
    b={'id':f'BIN-{nextid:04}','path':p['path'],'state':'current','sha256':p['sha256'],'items':[]};nextid+=1
    with ZipFile(R/p['path'])as z:
        for i in range(1,p['slides']+1):
            for j,v in enumerate(E.fromstring(z.read(f'ppt/slides/slide{i}.xml')).iter(ns('p')),1):
                text=''.join(v.itertext())
                if text.strip():b['items'].append({'id':f'{b["id"]}-SL-{i:03}-ITEM-{j:04}','slide':i,'contentSha256':sha(text.encode())})
    before.append(b)
old=(D/'README.md').read_text(encoding='utf-8-sig')
lines=['# 現行配布用PowerPoint（共通デザイン）','','**2026-11-10：架空Googleシートの復元試験（AT-28）**。運用手順書・タスクリスト・進捗の末尾に、範囲貼り付けとシート複写の比較表、改名・削除で参照先が変わる図を追加しました。3冊はv35、他9冊はv34のままです。現行は12冊・190頁、仕様基準は2026-11-10-r18です。','','範囲貼り付けでB2＝10と集計A1＝20は戻りましたが、保護・名前付き範囲・フィルタ・先頭行の固定は戻りませんでした。複写後に改名しても集計式は旧シートを参照し、その削除で #REF! になりました。架空2ファイルでの部分確認です。ファイル設定（C10）、GAS、実台帳、Calendar、サイト連携は未実施。顧客確認は0/6件、本番開始は保留です。','','[試験結果](../../progress/2026-11-10-at28-multisheet-result.md) ・ [資料保全の検査](../../traceability/reports/ppt-at28-20261110/review.json) ・ [資料の独立レビュー](../../traceability/reports/ppt-at28-20261110/independent-ppt-review.json) ・ [打ち合わせ用資料](../2026-11-10-premeeting/README.md)','','|資料ID|資料|版|頁数|','|---|---|---:|---:|']
titles=['業務フロー','要件定義','設計','テスト仕様書','タスクリスト','実装コード対応','テストコード対応','受入テスト仕様書','運用手順書','ユーザーマニュアル','トレーサビリティ','進捗・残課題']
for p,t in zip(prop,titles):
    f=Path(p['path']).name;lines.append(f'|{p["id"]}|[{t}]({f})|{f.split("-")[-1][:-5]}|{p["slides"]}|')
lines+=['','## 直前の配布一覧（以下は履歴）','',old]
write(C,binary);write(M,prop);(D/'README.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
write(O/'adoption.json',{'status':'ADOPTED','deckCount':12,'slides':190,'updated':3,'unchanged':9,'proposalSha256':h(O/'proposed-presentations.json'),'manifestSha256':h(M),'registrySha256':A['locked']['docs/traceability/registry.json'],'customerPassed':0,'productionStarted':False})
print('ADOPTED',h(M))

