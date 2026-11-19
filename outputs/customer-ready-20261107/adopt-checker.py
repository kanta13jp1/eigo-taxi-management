"""Apply the reviewed r16 checker registration after the operator invokes this file."""
import hashlib
import json
import os
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TRACE = ROOT / 'docs/traceability'
REGISTRY = TRACE / 'registry.json'
BASELINE = TRACE / 'source-baseline.json'
REPORT = 'docs/traceability/reports/customer-ready-20261107/independent/checker-tests.json'
OLD_REPORT = 'docs/traceability/reports/customer-acceptance-20261107/independent/checker-tests.json'
REVIEW = TRACE / 'reports/customer-ready-20261107/independent-review.json'
PREVIOUS = {
    'scripts/traceability.py': 'a086073a11009c6062755fafcb57f158e7d237de7cc89104769076b22dbeae8b',
    'scripts/test_traceability.py': '1bf80878ed7bf012289ce8aa40c7974d3f177e6903f746afa6a12c772e41988a',
}
REVIEWED = {
    'scripts/traceability.py': 'afb3801da75b019e50eff6958ee89b6f020f4f9fdb02b6234fe47f69c7e81eea',
    'scripts/test_traceability.py': 'fd00aa7c107b3e697f62748328dfb942dd8797921c05d57fccb36ab1186924a4',
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def verify_review():
    for name, digest in REVIEWED.items():
        require(hashlib.sha256((ROOT / name).read_bytes()).hexdigest() == digest, f'Reviewed source changed: {name}')
    review = json.loads(REVIEW.read_bytes())
    require(review['sourceReviewPass'] is True and review['blockingCodeFindings'] == [], 'Independent review is not clear')
    require(review['sourceHashes'] == REVIEWED, 'Independent review covers different sources')
    independent = (ROOT / REPORT).read_bytes()
    require(hashlib.sha256(independent).hexdigest() == '6f3801c15f0c97e7b7bd97af2a5757ce226f728b5e7172e9f636c3ed498e8847', 'Changed independent results')
    report = json.loads(independent)
    expected = [{'id': f'TRACE-{n:02}', 'status': 'PASS'} for n in range(1, 33)]
    require(report['sourceHashes'] == REVIEWED and report['results'] == expected, 'Unexpected test results or hashes')
    require(report['suite'] == 'traceability-negative-tests' and report['total'] == report['passed'] == 32, 'Expected 32 passes')


def evidence(ident, path):
    return {'path': path, 'key': ident, 'requiredSources': list(REVIEWED)}


def register_tests(registry):
    require(registry['version'] == '2026-11-07-r16', 'Wrong registry revision')
    facts = registry['facts']
    require(facts['calendarPermissionAdded'] is True and facts['productionStarted'] is False and facts['release'] == 'HOLD', 'Unexpected environment')
    require(facts['customerAcceptancePassed'] == 0 and facts['customerAcceptanceTotal'] == 6, 'Unexpected customer acceptance state')
    cases = registry['customerAcceptance']['cases']
    require([(c['id'], c['status']) for c in cases] == [(f'CUST-{n:02}', 'NOT_RUN') for n in range(1, 7)], 'Unexpected customer case records')
    tests = registry['tests']
    by_id = {test['id']: test for test in tests}
    require(len(by_id) == len(tests), 'Duplicate test ID in registry')
    capabilities = [c for c in registry['capabilities'] if c['req'] == 'REQ-38']
    require(len(capabilities) == 1 and capabilities[0]['testCode'] == 'TEST-38', 'Expected REQ-38 / TEST-38')
    links = capabilities[0]['tests']
    for n in range(15, 32):
        ident = f'TRACE-{n:02}'
        test = by_id[ident]
        require(test['requirements'] == ['REQ-38'] and links.count(ident) == 1, f'Changed REQ-38 mapping: {ident}')
        require(test['evidence'] in (evidence(ident, OLD_REPORT), evidence(ident, REPORT)), f'Changed evidence contract: {ident}')
        test['evidence']['path'] = REPORT
    ident = 'TRACE-32'
    new_test = {
        'id': ident, 'path': 'scripts/test_traceability.py', 'locator': "case('TRACE-32'",
        'requirements': ['REQ-38'], 'mode': 'offline-mutation', 'category': 'trace-checker',
        'scope': '検証用Calendarの実権限を未確認へ戻した正本コピーを拒否する。',
        'evidence': evidence(ident, REPORT),
    }
    require(all(ident not in c['tests'] for c in registry['capabilities'] if c['req'] != 'REQ-38'), 'Unexpected TRACE-32 link')
    if ident in by_id:
        require(by_id[ident] == new_test and links.count(ident) == 1, 'Existing TRACE-32 registration differs')
    else:
        require(ident not in links, 'Unexpected orphan TRACE-32 link')
        tests.append(new_test)
        links.append(ident)


def encoded(data, original):
    text = json.dumps(data, ensure_ascii=False, indent=2) + '\n'
    return text.replace('\n', '\r\n' if b'\r\n' in original else '\n').encode('utf-8')


def replace_current(path, original, updated):
    require(path.read_bytes() == original, f'Concurrent change; reread before retry: {path.name}')
    if updated == original:
        return
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.checker-', delete=False) as handle:
        temp = Path(handle.name)
    try:
        temp.write_bytes(updated)
        require(path.read_bytes() == original, f'Concurrent change; reread before retry: {path.name}')
        os.replace(temp, path)
    finally:
        temp.unlink(missing_ok=True)


def main():
    verify_review()
    original_registry, original_baseline = REGISTRY.read_bytes(), BASELINE.read_bytes()
    registry, baseline = json.loads(original_registry), json.loads(original_baseline)
    require(encoded(registry, original_registry) == original_registry, 'Registry format changed; preserve original formatting')
    require(encoded(baseline, original_baseline) == original_baseline, 'Baseline format changed; preserve original formatting')
    for name, digest in REVIEWED.items():
        require(baseline[name] in (PREVIOUS[name], digest), f'Unexpected prior baseline: {name}')
        baseline[name] = digest
    register_tests(registry)
    # Each file update is atomic. A rerun can finish after an interruption between the two updates.
    replace_current(REGISTRY, original_registry, encoded(registry, original_registry))
    replace_current(BASELINE, original_baseline, encoded(baseline, original_baseline))
    print('Registered TRACE-32 and TRACE-15..31 evidence; adopted the two reviewed checker hashes.')


if __name__ == '__main__':
    main()
