"""Build the r19 registry candidate. Does not modify canonical files.

Inputs: fresh regression reports under this folder, canonical r18 registry.
Outputs: frozen r18 copies, normalized frontend report, registry/source-baseline candidates,
a change proposal and a dry-run validation of the candidate against the working tree.
"""
from pathlib import Path
import hashlib, json, sys
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'outputs/portal-mismatch-20261110/adoption'
REL = 'outputs/portal-mismatch-20261110/adoption'
sys.path.insert(0, str(ROOT / 'scripts'))
import traceability

sha = lambda b: hashlib.sha256(b).hexdigest()
def read(p): return json.loads((ROOT / p).read_text(encoding='utf-8-sig'))
def write(p, obj): p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
def immutable(p, b):
    if p.exists(): assert p.read_bytes() == b, str(p) + ' already differs'
    else: p.write_bytes(b)
def verify_hashes(report):
    assert isinstance(report['sourceHashes'], dict)
    for p, h in report['sourceHashes'].items():
        assert sha((ROOT / p).read_bytes()) == h, ('stale', p)
    assert report['results'] and all(x['status'] == 'PASS' for x in report['results'])
    return len(report['results'])

regpath = ROOT / 'docs/traceability/registry.json'
reg = json.loads(regpath.read_bytes())
assert reg['version'] == '2026-11-10-r18'
facts_before = json.dumps(reg['facts'], ensure_ascii=False, sort_keys=True)
assert reg['facts']['customerAcceptancePassed'] == 0 and reg['facts']['release'] == 'HOLD' and reg['facts']['productionStarted'] is False
for source, target in [('docs/traceability/registry.json', 'registry-r18.json'), ('docs/traceability/source-baseline.json', 'source-baseline-r18.json'),
                       ('docs/traceability/presentations.json', 'presentations-before.json'), ('docs/traceability/binary-documents.json', 'binary-documents-before.json')]:
    immutable(OUT / target, (ROOT / source).read_bytes())

# Path spelling only: the runner records its own absolute script path as a key.
front = read(REL + '/regression/frontend/frontend-contract.json')
front['sourceHashes'] = {('scripts/test_portals.cjs' if Path(k).name == 'test_portals.cjs' else k.replace('\\', '/')): v for k, v in front['sourceHashes'].items()}
assert verify_hashes(front) == 33
front['normalization'] = {'performedAt': datetime.now(timezone.utc).isoformat(), 'sourceReport': REL + '/regression/frontend/frontend-contract.json',
                          'change': 'Absolute script key converted to repository-relative path; result values and executedAt retained'}
frontpath = REL + '/frontend-contract-normalized.json'
write(ROOT / frontpath, front)

paths = {
    'outputs/consumption-timing-20261110/regression/trace-ui-serial/results.json': REL + '/regression/trace-ui/results.json',
    'outputs/consumption-timing-20261110/regression/local/results.json': REL + '/regression/local/results.json',
    'outputs/consumption-timing-20261110/adoption/frontend-contract-normalized.json': frontpath,
    'docs/traceability/reports/signout-retry-20261030-local/google-auth-retry-ui.json': 'outputs/portal-mismatch-20261110/google-auth-retry-ui.json',
}
counts = {p: verify_hashes(read(p)) for p in paths.values()}
assert sorted(counts.values()) == [2, 6, 14, 33], counts
changed = []
for t in reg['tests']:
    ev = t.get('evidence', {})
    if ev.get('path') in paths:
        new = read(paths[ev['path']])
        matched = [x for x in new['results'] if x.get('id') == ev['key'] or x.get('name') == ev['key']]
        assert len(matched) == 1 and matched[0]['status'] == 'PASS', (t['id'], ev['key'])
        assert all(p in new['sourceHashes'] for p in ev['requiredSources']), (t['id'], ev['requiredSources'])
        changed.append({'id': t['id'], 'before': ev['path'], 'after': paths[ev['path']]})
        ev['path'] = paths[ev['path']]
assert len(changed) == 35, len(changed)

# New offline UI contract for the wrong-entrance guidance.
pm = read('outputs/portal-mismatch-20261110/portal-mismatch-ui.json')
assert verify_hashes(pm) == 5
script = (ROOT / 'scripts/test_portal_mismatch_ui.cjs').read_text(encoding='utf-8')
c20 = next(c for c in reg['capabilities'] if c['req'] == 'REQ-20')
for row in pm['results']:
    ident = row['name'].split(' ', 1)[0]
    assert ident.startswith('PM-') and row['name'] in script
    reg['tests'].append({'id': ident, 'path': 'scripts/test_portal_mismatch_ui.cjs', 'locator': row['name'], 'requirements': ['REQ-20'], 'mode': 'offline-stub',
                         'category': 'portal-mismatch-guidance-ui',
                         'scope': 'Node VMの合成Reactフックと模擬サービスによるログイン画面の表示検査。実Googleログイン・ブラウザー・顧客確認ではない。',
                         'evidence': {'path': 'outputs/portal-mismatch-20261110/portal-mismatch-ui.json', 'key': row['name'],
                                      'requiredSources': ['src/components/LoginScreen.tsx', 'src/portal.ts', 'scripts/test_portal_mismatch_ui.cjs']}})
    c20['tests'].append(ident)
guide = ' 入口が合わないアカウントでログインした場合、保護者用入口にはご家庭専用URL・QRの案内と管理者専用入口へのリンクを、管理者用入口にはご家庭専用URL・QRの案内だけを表示する。未登録・無効な個別URL・中断ではこの案内を出さない。サーバーの拒否判定と権限は変えない。'
c20['designText'] += guide
c20['operationText'] += ' 「この入口ではログインできません」と表示された利用者には、保護者はご家庭専用URL・QR、先生・管理者は管理者専用入口を案内する。'
c20['userText'] += ' 「この入口ではログインできません」と表示されたら、教室から届いたご家庭専用のURLまたはQRコードを開き直してください。'
assert not any(x['locator'] == 'isPortalMismatch' for x in c20['implementation'])
c20['implementation'] += [{'path': 'src/portal.ts', 'locator': 'isPortalMismatch'}, {'path': 'src/components/LoginScreen.tsx', 'locator': 'isPortalMismatch(error)'}]

# Development-side live observations. Status values and facts stay as they are:
# these are single developer runs, not an acceptance pass.
record = '../progress/2026-11-10-evening-fix-and-acceptance.md'
assert (ROOT / 'docs/acceptance' / record).resolve().is_file()
c24 = next(c for c in reg['capabilities'] if c['req'] == 'REQ-24'); c25 = next(c for c in reg['capabilities'] if c['req'] == 'REQ-25')
assert (c24['status'], c24['acceptanceStatus'], c25['status'], c25['acceptanceStatus']) == ('HOLD', 'BLOCKED', 'HOLD', 'BLOCKED')
c24['latestObservation'] = 'AT24-LIVE-20261110：開発担当が検証環境の管理者画面から架空生徒へ2026-11-12 15:30のお迎えを1件登録。検証台帳の予約IDと、台帳のイベントIDで特定した検証専用カレンダーの予定の説明欄の予約ID・日時・場所が一致。管理者による1回の実施で、保護者からの予約・実機・顧客確認は未確認。状態欄は変更していない。'
c24['observationRecord'] = record
c25['latestObservation'] = 'AT25-LIVE-20261110：同じ予約を管理者画面から取消。検証台帳はcancelled、台帳のイベントIDを持つ予定はカレンダーに0件、残数は8のまま。確認ダイアログは自動承諾に置き換えて実行し文言は未確認。管理者による1回の実施で、保護者からの取消・実機・顧客確認は未確認。状態欄は変更していない。'
c25['observationRecord'] = record

reg['version'] = '2026-11-11-r19'
assert json.dumps(reg['facts'], ensure_ascii=False, sort_keys=True) == facts_before
assert len(reg['capabilities']) == 39 and len(reg['tests']) == 211 and len(reg['flows']) == 11 and len(reg['screens']) == 20 and len(reg['interfaces']) == 16
candidate = OUT / 'registry-r19-candidate.json'; write(candidate, reg)

baseline = read('docs/traceability/source-baseline.json')
declared = {x['path'] for c in reg['capabilities'] for x in c['implementation']} | {t['path'] for t in reg['tests']}
updates = []
for p in sorted(declared):
    actual = sha((ROOT / p).read_bytes())
    if baseline.get(p) != actual:
        updates.append({'path': p, 'before': baseline.get(p), 'after': actual}); baseline[p] = actual
assert set(baseline) == declared
assert sorted(u['path'] for u in updates) == ['scripts/test_google_auth_retry_ui.cjs', 'scripts/test_portal_mismatch_ui.cjs', 'src/components/LoginScreen.tsx', 'src/portal.ts'], updates
write(OUT / 'source-baseline-r19-candidate.json', baseline)

# Dry run: validate the candidate against the working tree without writing canonical files.
result = traceability.validate(reg, ROOT, True)
by_code = {}
for e in result['errors']: by_code.setdefault(e['code'], []).append(e['message'])
expected_codes = {'GENERATED_DRIFT', 'SOURCE_REVIEW_REQUIRED', 'PRESENTATION_CONTENT_REVIEW', 'PRESENTATION_STALE'}
unexpected = {k: v for k, v in by_code.items() if k not in expected_codes}
write(OUT / 'candidate-dry-run.json', {'errorCounts': {k: len(v) for k, v in by_code.items()}, 'unexpected': unexpected, 'counts': result['counts'], 'coverageGaps': result['coverageGaps']})

summary = {'status': 'CANDIDATE_NOT_ADOPTED', 'createdAt': datetime.now(timezone.utc).isoformat(), 'registryVersion': reg['version'], 'registrySha256': sha(candidate.read_bytes()),
           'candidate': REL + '/registry-r19-candidate.json', 'canonicalRegistryChanged': False,
           'counts': {'requirements': 39, 'flows': 11, 'testCases': 211, 'screens': 20, 'interfaces': 16},
           'repointedEvidence': changed, 'newTests': [f'PM-0{n}' for n in range(1, 6)], 'freshReportCounts': counts,
           'capabilityTextChanged': ['REQ-20 designText/operationText/userText/implementation/tests'],
           'observationsAdded': ['REQ-24 latestObservation', 'REQ-25 latestObservation'], 'statusesChanged': [], 'factsChanged': False,
           'sourceBaselineUpdates': updates, 'sourceBaselineCandidate': REL + '/source-baseline-r19-candidate.json',
           'dryRun': {'errorCounts': {k: len(v) for k, v in by_code.items()}, 'unexpectedCodes': sorted(unexpected)},
           'customerPassed': 0, 'customerTotal': 6, 'productionStarted': False,
           'pendingBeforeAdoption': ['Independent AI review of the four changed/new source files (REVIEW-POL-02); the implementer has not self-approved',
                                     'Independent review of this registry candidate', 'Twelve presentation packages must be reviewed and reissued against r19'],
           'limits': ['First trace UI attempt failed to launch a browser (no bundled Chromium); retained as trace-ui-attempt1-no-browser.log; rerun with installed Chrome adopted',
                      'Frontend contract report key normalized from an absolute path', 'Actual Google and customer checks are separate']}
write(OUT / 'registry-change-proposal.json', summary)
print(json.dumps({k: summary[k] for k in ['status', 'registryVersion', 'registrySha256', 'counts', 'freshReportCounts', 'dryRun']}, ensure_ascii=False, indent=2))
print('repointed', len(changed), 'baseline updates', [u['path'] for u in updates])
