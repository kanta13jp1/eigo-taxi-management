"""Machine preservation checks for the v36 packages and a proposed manifest. Does not adopt."""
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as E
from PIL import Image, ImageChops, ImageDraw
import json, re, hashlib, shutil

ROOT = Path(__file__).resolve().parents[3]; BASE = ROOT / 'outputs/r19-adoption-20261111/ppt-v36/finalized'
OUT = ROOT / 'docs/traceability/reports/ppt-r19-20261111'; OUT.mkdir(parents=True, exist_ok=True)
sha = lambda b: hashlib.sha256(b).hexdigest()
def load(p): return json.loads(Path(p).read_text(encoding='utf-8-sig'))
def write(p, o): Path(p).write_text(json.dumps(o, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
data = load(BASE / 'authoring-results.json'); freeze = load(BASE.parent / 'freeze.json')
assert data['registrySha256'] == freeze['registrySha256'] == sha((ROOT / 'docs/traceability/registry.json').read_bytes())
assert data['registryVersion'] == '2026-11-11-r19' and data['freezeSha256'] == sha((BASE.parent / 'freeze.json').read_bytes())
for x in freeze['evidenceFiles']: assert sha((ROOT / x['path']).read_bytes()) == x['sha256'], x['path']
manifest = load(BASE / 'source-manifest.json'); assert manifest == load(ROOT / 'docs/traceability/presentations.json')
ns = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}; rows = []; common = []
def norm(t): return re.sub(r'\s+', '', t)
def notes_text(z, i): return '\n'.join(t.text for t in E.fromstring(z.read(f'ppt/notesSlides/notesSlide{i}.xml')).findall('.//a:t', ns) if t.text)
def slide_text(z, i): return '\n'.join(t.text for t in E.fromstring(z.read(f'ppt/slides/slide{i}.xml')).findall('.//a:t', ns) if t.text)
ref = data['records'][0]
for row in data['records']:
    name = row['name']; folder = BASE / name; final = ROOT / row['final']; original = ROOT / row['source']; md = ROOT / row['sourceMdPath']
    entry = next(m for m in manifest if m['id'] == row['id'])
    assert sha(final.read_bytes()) == row['sha256'] and sha(original.read_bytes()) == row['sourceSha256'] == entry['sha256']
    assert sha(md.read_bytes()) == row['sourceMdSha256']
    receipt = load(folder / 'validation.json'); assert receipt['finalSha256'] == row['sha256'] and receipt['firstPartyImport']['passed']
    assert receipt['packageIntegrity']['finding_count'] == receipt['presentationLayout']['finding_count'] == 0
    prior = load(ROOT / entry['receipt'])['presentationLayout']['warning_count']; now = receipt['presentationLayout']['warning_count']
    assert now == prior, (name, 'layout warnings changed', prior, now)
    n = row['sourceSlides']
    for i in range(1, n + 1):
        a = Image.open(folder / 'source-render' / f'{i}.png').convert('RGB'); b = Image.open(folder / 'roundtrip' / f'{i}.png').convert('RGB')
        assert a.size == b.size and ImageChops.difference(a, b).getbbox() is None, (name, i, 'preserved page differs')
    for offset in [1, 2]:
        a = Image.open(BASE / ref['name'] / 'roundtrip' / f"{ref['sourceSlides'] + offset}.png").convert('RGB').crop((0, 80, 1280, 665))
        b = Image.open(folder / 'roundtrip' / f'{n + offset}.png').convert('RGB').crop((0, 80, 1280, 665))
        assert ImageChops.difference(a, b).getbbox() is None, (name, offset, 'common current page differs')
        common.append({'name': name, 'page': offset, 'pixelEquivalentToReference': True})
    with ZipFile(original) as old, ZipFile(final) as new:
        for i in range(1, n + 1):
            assert notes_text(old, i) == notes_text(new, i), (name, i, 'old notes changed')
            assert slide_text(old, i) == slide_text(new, i), (name, i, 'old slide text changed')
        for i in (n + 1, n + 2):
            txt = notes_text(new, i)
            assert all(v in txt for v in ['2026-11-11 r19', '0/6', '本番HOLD', '受入の合格ではない', 'サーバーの拒否判定と権限は変えていない']), (name, i)
        assert norm(md.read_text(encoding='utf-8')) in norm(notes_text(new, n + 1)), (name, 'generated r19 source missing from notes')
        page1 = slide_text(new, n + 1); page2 = slide_text(new, n + 2)
        assert '2026-11-11 r19追補' in page1 and '2026-11-11 r19追補' in page2 and f'{n + 1} / {n + 2}' in page1 and f'{n + 2} / {n + 2}' in page2
        assert '受入の合格ではありません' in page2 and '0/6' in page2 and freeze['regressionSummary'] in page2
        oldMedia = {sha(old.read(f)) for f in old.namelist() if f.startswith('ppt/media/')}; newMedia = {sha(new.read(f)) for f in new.namelist() if f.startswith('ppt/media/')}
        assert oldMedia.issubset(newMedia), (name, 'old images lost')
        allText = '\n'.join(t.text for f in new.namelist() if re.fullmatch(r'ppt/(slides/slide|notesSlides/notesSlide)\d+\.xml', f) for t in E.fromstring(new.read(f)).findall('.//a:t', ns) if t.text)
        oldText = '\n'.join(t.text for f in old.namelist() if re.fullmatch(r'ppt/(slides/slide|notesSlides/notesSlide)\d+\.xml', f) for t in E.fromstring(old.read(f)).findall('.//a:t', ns) if t.text)
        private = r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|https://(?:docs|script|calendar)\.google\.com/|#\/parent\/[0-9a-f-]{30,}|RIDE-[0-9a-f]{8}|STU-[0-9a-f]{8}'
        assert len(re.findall(private, allText)) == len(re.findall(private, oldText)), (name, 'new private information')
    pages = sorted((folder / 'roundtrip').glob('*.png'), key=lambda p: int(p.stem)); assert len(pages) == row['slides'] == n + 2
    sheet = Image.new('RGB', (960, ((len(pages) + 2) // 3) * 205), '#ddd'); draw = ImageDraw.Draw(sheet)
    for i, page in enumerate(pages):
        im = Image.open(page); im.thumbnail((310, 175)); x = i % 3 * 320; y = i // 3 * 205; sheet.paste(im, (x, y)); draw.text((x + 8, y + 178), name + ' ' + page.stem, fill='black')
    sheet.save(folder / 'contact.png')
    reportDir = OUT / name; reportDir.mkdir(exist_ok=False); shutil.copyfile(folder / 'validation.json', reportDir / 'validation.json'); shutil.copyfile(folder / 'contact.png', reportDir / 'contact.png')
    for num in [n + 1, n + 2]: shutil.copyfile(folder / 'roundtrip' / f'{num}.png', reportDir / f'current-{num}.png')
    rows.append({**row, 'preservedPagesPixelIdentical': n, 'preservedNotesIdentical': n, 'preservedSlideTextIdentical': n, 'oldImagesPreserved': True, 'currentGeneratedSourceInNotes': True,
                 'renderedFinalPages': len(pages), 'packageFindings': 0, 'layoutFindings': 0, 'layoutWarnings': now, 'newWarnings': 0, 'reimportPassed': True, 'newPrivateStrings': 0})
total = sum(r['slides'] for r in rows); kept = sum(r['sourceSlides'] for r in rows)
assert len(rows) == 12 and total == kept + 24
proposal = load(BASE / 'source-manifest.json')
for row in rows:
    item = next(p for p in proposal if p['id'] == row['id'])
    item.update(path=f"docs/deliverables/2026-10-23-traceability/{row['name']}-2026-11-11-v36.pptx", sha256=row['sha256'], receipt=(OUT / row['name'] / 'validation.json').relative_to(ROOT).as_posix(),
                slides=row['slides'], registrySha256=data['registrySha256'], registryVersion=data['registryVersion'], progressSupplementDate='2026-11-11', contentReview=freeze['contentReview'])
review = {'status': 'PASS_MACHINE_PRESERVATION_PENDING_VISUAL_REVIEW', 'date': '2026-11-11', 'registryVersion': data['registryVersion'], 'registrySha256': data['registrySha256'], 'decks': 12, 'slides': total,
          'preservedPagesPixelIdentical': kept, 'preservedNotesIdentical': kept, 'oldImagesPreserved': True, 'newCurrentPages': 24, 'newCurrentBodiesPixelEquivalent': common, 'nativePowerPointVerified': False,
          'comparisonMethod': 'Preserved pages are compared against a render of the untouched source deck made in the same run with the same renderer; notes and slide text are compared as extracted text.',
          'limits': ['Preserved pages are historical; current status is in the r19 notes and the 24 appended pages', 'AT-24/25 are single developer runs, not acceptance passes',
                     'Customer 0/6, production HOLD; no customer fixture writes', 'Existing layout warnings are unchanged; no new warnings', 'Display in the PowerPoint application is not verified'], 'rows': rows}
write(OUT / 'review.json', review); write(OUT / 'proposed-presentations.json', proposal); write(OUT / 'authoring-results.json', data)
print(json.dumps({k: review[k] for k in ['status', 'decks', 'slides', 'preservedPagesPixelIdentical', 'preservedNotesIdentical', 'newCurrentPages']}, ensure_ascii=False))
