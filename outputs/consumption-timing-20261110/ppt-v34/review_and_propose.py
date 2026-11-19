from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as E
from PIL import Image,ImageChops,ImageDraw
import json,re,hashlib,shutil

ROOT=Path(__file__).resolve().parents[3];BASE=ROOT/'outputs/consumption-timing-20261110/ppt-v34/finalized'
OUT=ROOT/'docs/traceability/reports/ppt-consumption-20261110';OUT.mkdir(parents=True,exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
def load(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(p,o):p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
data=load(BASE/'authoring-results.json');freeze=load(BASE.parent/'freeze.json')
assert data['registrySha256']==freeze['registrySha256']==sha((ROOT/'docs/traceability/registry.json').read_bytes())
assert data['registryVersion']=='2026-11-10-r18' and data['freezeSha256']==sha((BASE.parent/'freeze.json').read_bytes())
for x in freeze['evidenceFiles']:assert sha((ROOT/x['path']).read_bytes())==x['sha256'],x['path']
manifest=load(BASE/'source-manifest.json');assert manifest==load(ROOT/'docs/traceability/presentations.json')
ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main'};rows=[];common=[]
def norm(t):return re.sub(r'\s+','',t)
ref=data['records'][0]
for row in data['records']:
    name=row['name'];folder=BASE/name;final=Path(row['final']);original=ROOT/row['source'];md=ROOT/row['sourceMdPath']
    assert sha(final.read_bytes())==row['sha256'] and sha(original.read_bytes())==row['sourceSha256']
    assert sha(md.read_bytes())==row['sourceMdSha256']
    receipt=load(folder/'validation.json');assert receipt['finalSha256']==row['sha256'] and receipt['firstPartyImport']['passed']
    assert receipt['packageIntegrity']['finding_count']==receipt['presentationLayout']['finding_count']==0
    expectedWarnings=21 if name=='business' else 0
    assert receipt['presentationLayout']['warning_count']==expectedWarnings,(name,receipt['presentationLayout']['warning_count'])
    oldRender=ROOT/'outputs/async-customer-ppt-20261107-v33/finalized'/name/'roundtrip'
    for i in range(1,row['sourceSlides']+1):
        a=Image.open(oldRender/f'{i}.png').convert('RGB');b=Image.open(folder/'roundtrip'/f'{i}.png').convert('RGB')
        assert a.size==b.size and ImageChops.difference(a,b).getbbox() is None,(name,i,'old full page differs')
    for offset in [0,1]:
        a=Image.open(BASE/ref['name']/'roundtrip'/f"{ref['sourceSlides']+offset+1}.png").convert('RGB').crop((0,80,1280,665))
        b=Image.open(folder/'roundtrip'/f"{row['sourceSlides']+offset+1}.png").convert('RGB').crop((0,80,1280,665))
        assert ImageChops.difference(a,b).getbbox() is None,(name,offset,'common current diagram differs')
        common.append({'name':name,'diagram':offset+1,'pixelEquivalentToReference':True})
    with ZipFile(original) as old,ZipFile(final) as new:
        notes=[];allText=[]
        for i in range(1,row['slides']+1):
            txt='\n'.join(t.text for t in E.fromstring(new.read(f'ppt/notesSlides/notesSlide{i}.xml')).findall('.//a:t',ns) if t.text);notes.append(txt)
            assert all(v in txt for v in ['2026-11-10 r18','0/6','本番HOLD','再送ID保持','片道1枚・往復2枚'])
            if i<=row['sourceSlides']:
                oldText=E.fromstring(old.read(f'ppt/notesSlides/notesSlide{i}.xml'))
                assert all(norm(t.text) in norm(txt)for t in oldText.findall('.//a:t',ns)if t.text),(name,i,'old notes lost')
        assert norm(md.read_text(encoding='utf-8'))in norm('\n'.join(notes))
        oldMedia={sha(old.read(f))for f in old.namelist()if f.startswith('ppt/media/')};newMedia={sha(new.read(f))for f in new.namelist()if f.startswith('ppt/media/')}
        assert oldMedia.issubset(newMedia),(name,'old images lost')
        for f in new.namelist():
            if re.fullmatch(r'ppt/(slides/slide|notesSlides/notesSlide)\d+\.xml',f):allText.extend(t.text for t in E.fromstring(new.read(f)).findall('.//a:t',ns)if t.text)
        allText='\n'.join(allText)
        assert not re.search(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|https://(?:docs|script|calendar)\.google\.com/|#\/parent\/[0-9a-f-]{30,}',allText),(name,'private information')
    pages=sorted((folder/'roundtrip').glob('*.png'),key=lambda p:int(p.stem));assert len(pages)==row['slides']
    sheet=Image.new('RGB',(960,((len(pages)+2)//3)*205),'#ddd');draw=ImageDraw.Draw(sheet)
    for i,page in enumerate(pages):
        im=Image.open(page);im.thumbnail((310,175));x=i%3*320;y=i//3*205;sheet.paste(im,(x,y));draw.text((x+8,y+178),name+' '+page.stem,fill='black')
    sheet.save(folder/'contact.png')
    reportDir=OUT/name;reportDir.mkdir(exist_ok=False);shutil.copyfile(folder/'validation.json',reportDir/'validation.json');shutil.copyfile(folder/'contact.png',reportDir/'contact.png')
    for num in [row['sourceSlides']+1,row['sourceSlides']+2]:shutil.copyfile(folder/'roundtrip'/f'{num}.png',reportDir/f'current-{num}.png')
    rows.append({**row,'oldFullPagesPixelIdentical':row['sourceSlides'],'oldNotesPreserved':row['sourceSlides'],'oldImagesPreserved':True,'currentGeneratedSourceInNotes':True,'renderedFinalPages':len(pages),'packageFindings':0,'layoutFindings':0,'layoutWarnings':expectedWarnings,'newWarnings':0,'reimportPassed':True,'privateEmailsOrGoogleLinks':0})
assert len(rows)==12 and sum(r['slides']for r in rows)==184 and sum(r['sourceSlides']for r in rows)==160
proposal=load(BASE/'source-manifest.json')
for row in rows:
    item=next(p for p in proposal if p['id']==row['id']);item.update(path=f"docs/deliverables/2026-10-23-traceability/{row['name']}-2026-11-10-v34.pptx",sha256=row['sha256'],receipt=(OUT/row['name']/'validation.json').relative_to(ROOT).as_posix(),slides=row['slides'],registrySha256=data['registrySha256'],registryVersion=data['registryVersion'],progressSupplementDate='2026-11-10',contentReview=freeze['contentReview'])
review={'status':'PASS_MACHINE_PRESERVATION_PENDING_VISUAL_REVIEW','date':'2026-11-10','registryVersion':data['registryVersion'],'registrySha256':data['registrySha256'],'decks':12,'slides':184,'oldFullPagesPixelIdentical':160,'oldNotesPreserved':160,'oldImagesPreserved':True,'newCurrentPages':24,'newCurrentBodiesPixelEquivalent':common,'nativePowerPointVerified':False,'limits':['Preserved 160 old pages are historical; current status is in r18 notes and 24 appended pages','Public anonymous frontend demo pass is separate from real Google, physical devices and customer acceptance','Customer0/6, productionHOLD; no customer fixture writes','Business prior21 layout warnings retained; no new warnings'],'rows':rows}
write(OUT/'review.json',review);write(OUT/'proposed-presentations.json',proposal);write(OUT/'authoring-results.json',data)
print(json.dumps({k:review[k]for k in ['status','decks','slides','oldFullPagesPixelIdentical','oldNotesPreserved','newCurrentPages']},ensure_ascii=False))
