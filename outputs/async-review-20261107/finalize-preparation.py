import json
import hashlib
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]
LIVE = ROOT / 'outputs/async-review-20261107/live'
def read(path):
    return json.loads((ROOT / path).read_text(encoding='utf-8'))
def save(path, data):
    (ROOT / path).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
def sha(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()
now = datetime.now(timezone.utc).isoformat()
rows = (LIVE / 'fixed-fixtures-ledger.tsv').read_text(encoding='utf-8').splitlines()
definitions = [
    ('A', 'RIDE-1724e731-bce7-4f5c-9808-b6e38f2b5d8b', 't56p0i5uihfvuaj0gu519588d8@google.com', 'pickup', 'CUST-04 完了用A・片道／実在しない場所', 1, 'calendar-a-ax.txt'),
    ('B', 'RIDE-f2cb5950-c09b-43a8-aa5b-3d78eaf49218', '801th14i03t01r7bv66h9lgdt4@google.com', 'roundtrip', 'CUST-04 完了用B・往復／実在しない場所', 2, 'calendar-b-ax.txt')
]
fixtures = []
for label, ride_id, event_id, kind, location, cost, calendar_file in definitions:
    matched = [line.split('\t') for line in rows if line.startswith(ride_id + '\t')]
    assert len(matched) == 1, (label, matched)
    row = matched[0]
    assert row[1] == 'STU-CUST-20261107' and row[3] == '2026-11-07' and row[4] == '16:00'
    assert row[5] == kind and row[6] == location and row[7] == 'scheduled' and row[8] == event_id
    assert len(row) < 12 or not row[11].strip()
    popup = (LIVE / calendar_file).read_text(encoding='utf-8')
    assert ride_id in popup and location in popup and '午後4:00～4:30' in popup
    fixtures.append({'label': label, 'rideId': ride_id, 'eventId': event_id, 'studentId': row[1], 'date': row[3], 'time': row[4], 'type': kind, 'pickupLocation': location, 'status': row[7], 'completionAt': None, 'expectedTicketCost': cost, 'calendarDescriptionIdMatched': True, 'calendarDateTimeLocationMatched': True, 'ledgerEvidence': 'outputs/async-review-20261107/live/fixed-fixtures-ledger.tsv', 'calendarEvidence': 'outputs/async-review-20261107/live/' + calendar_file})
admin_reload = (LIVE / 'admin-reload-ax.txt').read_text(encoding='utf-8')
schedule = (LIVE / 'admin-fixed-schedule-ax.txt').read_text(encoding='utf-8')
assert '残チケット: 5 枚' in admin_reload
assert all(f['pickupLocation'] in schedule for f in fixtures)
save('outputs/async-review-20261107/live/fixed-fixtures.json', {
    'checkedAt': now, 'mode': 'developer-real-test-preparation', 'testOnly': True,
    'fixtures': fixtures, 'initialBalance': 5, 'siteExplicitReload': True,
    'scheduledFixtureCount': 2, 'siteA03CompletionButtonsVisible': True,
    'creationRequestsPerFixture': 1, 'bothCreationResponsesNormal': True,
    'consoleErrorsOrWarningsObserved': 0, 'completedDuringPreparation': 0,
    'customerPassed': 0, 'customerTotal': 6, 'productionStarted': False,
    'limitations': ['Customer first Google login and both reviewer portals have not been observed live.', 'Fixed-date operation beyond the date is covered locally; live observation was on the fixed date.', 'Earlier v5 generic registration error cause remains unidentified; these are two subsequent normal responses, not evidence of a root-cause fix.']
})
public = read('docs/acceptance/deployment/public-verification.json')
assert public['pass'] and len(public['results']) == 7 and all(x['match'] for x in public['results'])
registration = read('outputs/async-review-20261107/live/reviewer-registration.json')
gate = read('outputs/async-review-20261107/live/review-gate.json')
assert registration['role'] == 'reviewer' and registration['active'] and registration['firstLoginPending']
assert gate['persistedExact'] and gate['existingPropertiesUnchanged']
save('outputs/async-review-20261107/live/hosted-delivery.json', {
    'checkedAt': now, 'environment': 'mighty-test', 'site': 'eigo-taxi-test',
    'hostingVersion': '43d4ac9b2a065441', 'gasVersion': 6,
    'publicFilesMatched': 7, 'publicVerification': 'docs/acceptance/deployment/public-verification.json',
    'sourceDigest': public['release']['sourceDigest'], 'reviewerRegisteredAndReadBack': True,
    'testLedgerGateExactAndPersisted': True, 'originalTwoAdministratorsRetained': True,
    'normalAdminExplicitReload': True, 'fixedTwoScheduledAndBalanceFiveReadBack': True,
    'fixedTwoCalendarDescriptionIdsDateTimePlacesMatched': True,
    'liveReviewerFirstGoogleLogin': 'PENDING_CUSTOMER', 'customerPassed': 0,
    'customerTotal': 6, 'productionStarted': False,
    'scope': 'Developer deployment and fixture preparation; not customer acceptance.'
})
r = read('docs/traceability/registry.json')
r['facts']['customerPreparationStatus'] = 'SELF_PACED_PREPARED_CUSTOMER_FIRST_LOGIN_PENDING'
p = r['customerAcceptance']['preparation']
p.update({
    'accountRegistrationStatus': 'REVIEWER_ACTIVE_WAITING_FIRST_GOOGLE_LOGIN',
    'accountRegistrationEvidence': 'outputs/async-review-20261107/live/reviewer-registration.json',
    'reviewerConfigurationStatus': 'GATE_AND_REVIEWER_PERSISTED_READBACK_CONFIRMED',
    'completionFixturesReadiness': 'FIXED_TWO_SCHEDULED_LEDGER_CALENDAR_SITE_BALANCE_CONFIRMED',
    'completionFixturesEvidence': 'outputs/async-review-20261107/live/fixed-fixtures.json',
    'hostingDeploymentEvidence': 'outputs/async-review-20261107/live/hosted-delivery.json',
    'bookingResponseRetest': 'TWO_SUBSEQUENT_CREATIONS_NORMAL_EARLIER_CAUSE_UNRESOLVED',
    'fixedCompletionDate': '2026-11-07', 'fixedCompletionTime': '16:00',
    'customerFirstLoginStatus': 'NOT_RUN', 'customerExecutionWindow': 'ANY_TIME_AFTER_PREPARATION',
    'requiresDeveloperDuringExecution': False
})
for t in r['tests']:
    if t['id'] in [f'UI-{i:02d}' for i in range(1, 7)]:
        t['evidence']['path'] = 'outputs/async-review-20261107/regression/trace-ui-2/results.json'
    elif t['id'].startswith('LOCAL-UI-'):
        t['evidence']['path'] = 'outputs/async-review-20261107/regression/local-ui-2/results.json'
assert all(c['status'] == 'NOT_RUN' for c in r['customerAcceptance']['cases'])
assert len(r['tests']) == 203 and len(r['capabilities']) == 39
save('docs/traceability/registry.json', r)
evidence = [
    'outputs/async-review-20261107/live/gas-deployment-v6.json',
    'outputs/async-review-20261107/live/review-gate.json',
    'outputs/async-review-20261107/live/reviewer-registration.json',
    'outputs/async-review-20261107/live/fixed-fixtures.json',
    'outputs/async-review-20261107/live/hosted-delivery.json',
    'docs/acceptance/deployment/public-verification.json',
    'docs/traceability/reports/async-review-20261107/backend-review.json',
    'docs/traceability/reports/async-review-20261107/frontend-review.json',
    'docs/traceability/reports/async-review-20261107/checker-review.json',
    'outputs/async-review-20261107/independent-docs/checker-tests.json',
    'outputs/async-review-20261107/regression/regression-evidence-map.json'
]
save('outputs/async-customer-ppt-20261107-v33/freeze.json', {
    'status': 'ROOT_LOCK', 'registryVersion': r['version'], 'registrySha256': sha('docs/traceability/registry.json'),
    'observationSummary': '11/7：検証GAS v6と検証サイトへ配備、公開7応答が一致。指定検証台帳の限定設定と検証担当登録を保存・読戻し。固定日の片道・往復2予約は台帳と実Calendarの予約ID・日時・場所が一致し、サイト再読込で予定中2件・開始5枚を確認。初回本人ログインと顧客6件は未実施。既存管理者2名を維持。本番未開始。',
    'frontendStatus': '検証サイトへ反映・公開7応答一致。固定2予約・開始5枚を実サイトで確認。本人の初回ログイン待ち。',
    'customerStatus': '準備完了。日程調整・開発側の役割切替は不要。本人の確認0 / 6件・本番未開始。',
    'contentReview': 'r17。本人が固定2URLを切替、A03で11/7 16:00のA片道・B往復を完了。途中再開は未実施だけ、5→4→2→12を照合。限定reviewerは検証台帳のみ、通常役割分離を維持。顧客0/6・実受入AT-24〜30全体は未合格。v5の登録応答エラーは原因未確定、今回2件の正常応答と区別。',
    'evidenceFiles': [{'path': x, 'sha256': sha(x)} for x in evidence]
})
print(json.dumps({'registryVersion': r['version'], 'registrySha256': sha('docs/traceability/registry.json'), 'tests': len(r['tests']), 'fixtures': len(fixtures), 'freeze': 'ROOT_LOCK'}, ensure_ascii=True))
