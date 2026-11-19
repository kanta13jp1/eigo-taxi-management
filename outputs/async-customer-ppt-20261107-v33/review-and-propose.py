from pathlib import Path
import json,re,hashlib,shutil
from zipfile import ZipFile
from xml.etree import ElementTree as E
from PIL import Image,ImageChops,ImageDraw

root=Path('.');base=root/'outputs/async-customer-ppt-20261107-v33/finalized';data=json.loads((base/'authoring-results.json').read_text(encoding='utf8'));sha=lambda b:hashlib.sha256(b).hexdigest()
freeze=json.loads((root/'outputs/async-customer-ppt-20261107-v33/freeze.json').read_text(encoding='utf8'));assert freeze['status']=='ROOT_LOCK';lock=freeze['registrySha256'];assert data['freezeSha256']==sha((root/'outputs/async-customer-ppt-20261107-v33/freeze.json').read_bytes())
assert data['registrySha256']==sha((root/'docs/traceability/registry.json').read_bytes())==lock
assert data['registryVersion']=='2026-11-07-r17'
for evidence in freeze['evidenceFiles']:assert sha((root/evidence['path']).read_bytes())==evidence['sha256'],('Frozen evidence changed',evidence['path'])
assert sha((root/'docs/acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md').read_bytes())==data['customerPolicySha256']
reports=root/'docs/traceability/reports/ppt-async-customer-20261107';reports.mkdir(parents=True,exist_ok=True)
ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main'};rows=[];common=[]
ref=data['records'][0]
for row in data['records']:
    name=row['name'];folder=Path(row.get('validationDir',base/name));final=Path(row['final']);assert sha(final.read_bytes())==row['sha256']
    original=root/row['source'];assert sha(original.read_bytes())==row['sourceSha256']
    md=root/row['sourceMdPath'];assert sha(md.read_bytes())==row['sourceMdSha256']
    receipt=json.loads((folder/'validation.json').read_text(encoding='utf8'));assert receipt['finalSha256']==row['sha256'];assert receipt['firstPartyImport']['passed']
    assert receipt['packageIntegrity']['finding_count']==receipt['presentationLayout']['finding_count']==0
    warnings=21 if name=='business' else 0;assert receipt['presentationLayout']['warning_count']==warnings
    for i in range(1,row['preservedBodySlides']+1):
        a=Image.open(root/'outputs/ppt-deploy-20261107-v31/finalized'/name/'roundtrip'/f'{i}.png').convert('RGB').crop((0,66,1280,720))
        b=Image.open(folder/'roundtrip'/f'{i}.png').convert('RGB').crop((0,66,1280,720))
        assert ImageChops.difference(a,b).getbbox() is None,(name,i,'old body differs')
    for offset in [0,1]:
        a=Image.open(Path(ref.get('validationDir',base/ref['name']))/'roundtrip'/f"{ref['preservedBodySlides']+offset+1}.png").convert('RGB').crop((0,80,1280,665))
        b=Image.open(folder/'roundtrip'/f"{row['preservedBodySlides']+offset+1}.png").convert('RGB').crop((0,80,1280,665))
        assert ImageChops.difference(a,b).getbbox() is None,(name,offset,'shared diagram differs');common.append({'name':name,'diagram':offset+1,'pixelEquivalentToReviewedTemplate':True})
    with ZipFile(original) as old,ZipFile(final) as new:
        norm=lambda t:re.sub(r'\s+','',t);notes=[];allText=[]
        for i in range(1,row['slides']+1):
            tree=E.fromstring(new.read(f'ppt/notesSlides/notesSlide{i}.xml'));txt='\n'.join(t.text for t in tree.findall('.//a:t',ns) if t.text);notes.append(txt)
            assert all(x in txt for x in ['0/6','検証専用reviewer','2つの固定URL','5枚、片道後4枚、往復後2枚','実施中に開発者が役割を変える作業は発生しない'])
            oldTree=E.fromstring(old.read(f'ppt/notesSlides/notesSlide{i}.xml'));assert all(norm(t.text) in norm(txt) for t in oldTree.findall('.//a:t',ns) if t.text),(name,i,'old notes lost')
        assert norm(md.read_text(encoding='utf8')) in norm('\n'.join(notes))
        oldMedia={sha(old.read(f)) for f in old.namelist() if f.startswith('ppt/media/')};newMedia={sha(new.read(f)) for f in new.namelist() if f.startswith('ppt/media/')};assert oldMedia.issubset(newMedia)
        for f in new.namelist():
            if re.fullmatch(r'ppt/(slides/slide|notesSlides/notesSlide)\d+\.xml',f):allText.extend(t.text for t in E.fromstring(new.read(f)).findall('.//a:t',ns) if t.text)
        text='\n'.join(allText);assert not re.findall(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}',text),(name,'private email')
        assert not re.findall(r'https://(?:docs|script|calendar)\.google\.com/[^\s)]+',text),(name,'private Google link')
        assert not re.search(r'https://eigo-taxi-test\.web\.app/#/parent/[0-9a-f-]{30,}',text),(name,'private household link')
    pages=sorted((folder/'roundtrip').glob('*.png'),key=lambda p:int(p.stem));assert len(pages)==row['slides']
    sheet=Image.new('RGB',(960,((len(pages)+2)//3)*205),'#ddd');draw=ImageDraw.Draw(sheet)
    for i,page in enumerate(pages):
        im=Image.open(page);im.thumbnail((310,175));x=i%3*320;y=i//3*205;sheet.paste(im,(x,y));draw.text((x+8,y+178),name+' '+page.stem,fill='black')
    sheet.save(folder/'contact.png')
    rows.append({k:row[k] for k in ['id','name','source','sourceSha256','sourceMdPath','sourceMdSha256','sha256','slides','preservedBodySlides']})
    rows[-1].update(oldBodyPagesPixelIdentical=row['preservedBodySlides'],oldNotesPreserved=row['sourceSlides'],oldImagesPreserved=True,currentGeneratedSourceInNotes=True,renderedFinalPages=len(pages),packageFindings=0,layoutFindings=0,layoutWarnings=warnings,newWarnings=0,reimportPassed=True,privateEmailsOrGoogleLinks=0)
assert sum(r['slides'] for r in rows)==160 and sum(r['preservedBodySlides'] for r in rows)==136
review={'status':'PASS','date':'2026-11-07','reviewer':'AI author /root/modern_runner_1106','registrySha256':lock,'registryVersion':data['registryVersion'],'decks':12,'slides':160,'historicalBodyPagesPreserved':136,'oldNotesPreserved':160,'replacedDiagramPages':24,'rows':rows,'sharedDiagramBodyPixelChecks':common,'nativePowerPointVerified':False,'limits':['The diagrams describe a single restricted reviewer identity using two fixed URLs; no developer role switching during the customer steps.','Frozen observation status: '+freeze['observationSummary'],'Customer CUST01-06 remain 0/6 and all release HOLD; developer local tests do not imply live Google or customer acceptance.','Old v31 body and notes are historical; v32 was not adopted.','Existing business warning21 preserved, no new layout warning; native PowerPoint not verified; current manifest/README/binaries not modified']}
(reports/'review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
proposal=json.loads((base/'source-manifest.json').read_text(encoding='utf8'))
for row in data['records']:
    folder=Path(row.get('validationDir',base/row['name']));report=reports/row['name'];report.mkdir(exist_ok=False);shutil.copyfile(folder/'validation.json',report/'validation.json');shutil.copyfile(folder/'contact.png',report/'contact.png')
    item=next(x for x in proposal if x['id']==row['id']);item.update(path=f"docs/deliverables/2026-10-23-traceability/{row['name']}-2026-11-07-v33.pptx",sha256=row['sha256'],receipt=(report/'validation.json').as_posix(),slides=row['slides'],registrySha256=lock,registryVersion=data['registryVersion'],progressSupplementDate='2026-11-07',contentReview=freeze['contentReview'])
(reports/'proposed-presentations.json').write_text(json.dumps(proposal,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(reports/'authoring-results.json').write_bytes((base/'authoring-results.json').read_bytes())
print(json.dumps({'status':'PASS','registrySha256':lock,'decks':12,'slides':160,'oldBodyPagesPreserved':136,'oldNotesPreserved':160,'binaryPromotionPerformed':False,'currentManifestChanged':False,'proposal':str(reports/'proposed-presentations.json')}))
