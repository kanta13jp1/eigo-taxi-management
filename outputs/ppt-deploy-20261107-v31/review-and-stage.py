from pathlib import Path
import json,hashlib,re,shutil
from zipfile import ZipFile
from xml.etree import ElementTree as E
from PIL import Image,ImageChops,ImageDraw

root=Path('.');base=root/'outputs/ppt-deploy-20261107-v31/finalized';data=json.loads((base/'authoring-results.json').read_text(encoding='utf8'))
sha=lambda b:hashlib.sha256(b).hexdigest()
assert sha((root/'docs/traceability/registry.json').read_bytes())==data['registrySha256']
assert sha((root/'docs/acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md').read_bytes())==data['customerPolicySha256']
ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
reports=root/'docs/traceability/reports/ppt-delivery-20261107';reports.mkdir(parents=True,exist_ok=True)
rows=[]
for row in data['records']:
    name=row['name'];folder=base/name;p=Path(row['final']);assert sha(p.read_bytes())==row['sha256']
    source=root/row['source'];assert sha(source.read_bytes())==row['sourceSha256']
    doc=root/row['sourceMdPath'];assert sha(doc.read_bytes())==row['sourceMdSha256']
    receipt=json.loads((folder/'validation.json').read_text(encoding='utf8'));assert receipt['finalSha256']==row['sha256']
    assert receipt['packageIntegrity']['finding_count']==receipt['presentationLayout']['finding_count']==0
    assert receipt['firstPartyImport']['passed']
    inherited=21 if name=='business' else 0
    assert receipt['presentationLayout']['warning_count']==inherited
    oldRenders=root/'outputs/ppt-20261106-v30-final2'/name/'roundtrip' if '-v30.pptx' in row['source'] else root/'outputs/ppt-r14-v27'/name
    bodyChanges=[]
    for i in range(1,row['sourceSlides']+1):
        a=Image.open(oldRenders/f'{i}.png').convert('RGB').crop((0,66,1280,720))
        b=Image.open(folder/'roundtrip'/f'{i}.png').convert('RGB').crop((0,66,1280,720))
        if ImageChops.difference(a,b).getbbox():bodyChanges.append(i)
    assert not bodyChanges,(name,bodyChanges)
    with ZipFile(source) as old,ZipFile(p) as new:
        norm=lambda t:re.sub(r'\s+','',t)
        notes=[]
        for i in range(1,row['slides']+1):
            tree=E.fromstring(new.read(f'ppt/notesSlides/notesSlide{i}.xml'));text='\n'.join(x.text for x in tree.findall('.//a:t',ns) if x.text);notes.append(text)
            assert '0/6' in text and '廃止した運用条件' in text and 'Google実同意' in text
            if i<=row['sourceSlides']:
                tree=E.fromstring(old.read(f'ppt/notesSlides/notesSlide{i}.xml'))
                assert all(norm(t.text) in norm(text) for t in tree.findall('.//a:t',ns) if t.text),(name,i,'lost notes')
        assert norm(doc.read_text(encoding='utf8')) in norm('\n'.join(notes)),(name,'current source missing')
        oldMedia={sha(old.read(f)) for f in old.namelist() if f.startswith('ppt/media/')}
        newMedia={sha(new.read(f)) for f in new.namelist() if f.startswith('ppt/media/')}
        assert oldMedia.issubset(newMedia),(name,'lost media')
        assert sum(bool(re.fullmatch(r'ppt/slides/slide\d+\.xml',n)) for n in new.namelist())==row['slides']
    pages=sorted((folder/'roundtrip').glob('*.png'),key=lambda p:int(p.stem));assert len(pages)==row['slides']
    sheet=Image.new('RGB',(960,((len(pages)+2)//3)*205),'#ddd');draw=ImageDraw.Draw(sheet)
    for i,page in enumerate(pages):
        im=Image.open(page);im.thumbnail((310,175));x=i%3*320;y=i//3*205;sheet.paste(im,(x,y));draw.text((x+8,y+178),name+' '+page.stem,fill='black')
    sheet.save(folder/'contact.png')
    rows.append({k:row[k] for k in ['id','name','source','sourceSha256','sourceSlides','sourceMdPath','sourceMdSha256','sha256','slides']})
    rows[-1].update(oldBodyPagesPixelIdentical=row['sourceSlides'],oldNotesAndImagesPreserved=True,currentGeneratedSourceInNotes=True,renderedFinalPages=len(pages),packageFindings=0,layoutFindings=0,layoutWarnings=inherited,newWarnings=0,reimportPassed=True)
review={'status':'PASS','date':'2026-11-07','reviewer':'AI author /root/modern_runner_1106','registrySha256':data['registrySha256'],'registryVersion':data['registryVersion'],'decks':len(rows),'slides':sum(r['slides'] for r in rows),'sourceHistoricalPagesPreserved':sum(r['sourceSlides'] for r in rows),'newDiagramPages':24,'rows':rows,'nativePowerPointVerified':False,'limits':['Old dated policy/undeployed status remains historical; current notes and final two pages supersede it','Hosting frontend anonymous demo validation only; no new real Google/device/customer acceptance pass','Customer confirmation remains 0/6; original technical AT-01..30 stays with development','Calendar testing is authorized, but Google consent/GAS web app deployment is still pending in this front-end delivery record','Existing business layout warnings21 preserved; no new warning']}
(reports/'review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
proposal=json.loads((root/'outputs/ppt-deploy-20261107-v31/verified/source-manifest.json').read_text(encoding='utf8'))
dest=root/'docs/deliverables/2026-10-23-traceability'
for row in data['records']:
    src=Path(row['final']);target=dest/src.name;assert not target.exists();target.write_bytes(src.read_bytes());assert sha(target.read_bytes())==row['sha256']
    report=reports/row['name'];report.mkdir(exist_ok=False);shutil.copyfile(base/row['name']/'validation.json',report/'validation.json');shutil.copyfile(base/row['name']/'contact.png',report/'contact.png')
    item=next(i for i in proposal if i['id']==row['id']);item.update(path=target.as_posix(),sha256=row['sha256'],receipt=(report/'validation.json').as_posix(),slides=row['slides'],registrySha256=data['registrySha256'],registryVersion=data['registryVersion'],progressSupplementDate='2026-11-07',contentReview='11/7：Hosting検証サイトへ予約フォームの縦スクロール修正を配備。公開7応答hash一致・同一runner4FAIL→4PASSを図解。公開匿名デモと実Google/実機/顧客確認を区別。顧客確認0/6へ切替え、旧第三者30件条件と未配備記載は履歴化。各現行生成正本を先頭ノートへ反映。Calendar検証は許可済みだがGAS編集head保存済み・Google実同意/Webアプリ配備未了、本番未開始。旧本文136頁・旧ノート/画像を保全、160頁描画、構造・配置・再import確認（business旧警告21のみ）。')
(reports/'proposed-presentations.json').write_text(json.dumps(proposal,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(reports/'authoring-results.json').write_bytes((base/'authoring-results.json').read_bytes())
print(json.dumps({'status':'PASS','decks':len(rows),'slides':review['slides'],'oldBodyPages':review['sourceHistoricalPagesPreserved'],'proposedManifest':str(reports/'proposed-presentations.json'),'currentManifestChanged':False}))
