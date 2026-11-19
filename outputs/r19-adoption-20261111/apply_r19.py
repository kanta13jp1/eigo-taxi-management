"""Apply the independently reviewed r19 candidate to the canonical registry and source baseline.

Refuses to run unless the independent review passed and reviewed exactly the bytes now on disk.
After this, presentation packages are expected to be stale until reissued.
"""
from pathlib import Path
import hashlib, json, subprocess, sys

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'outputs/r19-adoption-20261111'
sys.path.insert(0, str(ROOT / 'scripts'))
import traceability

sha = lambda b: hashlib.sha256(b).hexdigest()
def load(p): return json.loads(Path(p).read_text(encoding='utf-8-sig'))

review_path = OUT / (sys.argv[1] if len(sys.argv) > 1 else 'independent-review.json')
review = load(review_path)
assert review['result'] == 'PASS', 'independent review did not pass'
assert not [f for f in review.get('findings', []) if f.get('severity') in ('blocking', 'major')], 'unresolved blocking/major findings'
candidate = OUT / 'registry-r19-candidate.json'
assert review['registryCandidateSha256'] == sha(candidate.read_bytes()), 'registry candidate changed after review'
proposal = load(OUT / 'registry-change-proposal.json')
assert proposal['registrySha256'] == sha(candidate.read_bytes())
for u in proposal['sourceBaselineUpdates']:
    actual = sha((ROOT / u['path']).read_bytes())
    assert actual == u['after'], ('source changed after candidate', u['path'])
    assert review['reviewedHashes'].get(u['path']) == actual, ('not independently reviewed at this hash', u['path'])

regpath = ROOT / 'docs/traceability/registry.json'; basepath = ROOT / 'docs/traceability/source-baseline.json'
assert regpath.read_bytes() == (OUT / 'registry-r18.json').read_bytes(), 'canonical registry is no longer the frozen r18'
assert basepath.read_bytes() == (OUT / 'source-baseline-r18.json').read_bytes(), 'canonical baseline is no longer the frozen r18'
regpath.write_bytes(candidate.read_bytes())
basepath.write_bytes((OUT / 'source-baseline-r19-candidate.json').read_bytes())

reg = traceability.load()
traceability.write_generated(reg)
docs = traceability.index_documents()
result = traceability.validate(reg)
(OUT / 'strict-before-ppt.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
codes = {}
for e in result['errors']: codes[e['code']] = codes.get(e['code'], 0) + 1
print(json.dumps({'version': reg['version'], 'registrySha256': sha(regpath.read_bytes()), 'documents': len(docs), 'errorCounts': codes, 'coverageGaps': len(result['coverageGaps']), 'review': review_path.name}, ensure_ascii=False))
assert set(codes) <= {'PRESENTATION_STALE', 'PRESENTATION_CONTENT_REVIEW'}, codes
