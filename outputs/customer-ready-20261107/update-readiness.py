import json
from pathlib import Path

path = Path('docs/traceability/registry.json')
raw = path.read_bytes()
data = json.loads(raw)
assert data['version'] == '2026-11-07-r16'
assert data['facts']['customerAcceptancePassed'] == 0
assert all(c['status'] == 'NOT_RUN' for c in data['customerAcceptance']['cases'])
assert data['facts']['productionStarted'] is False
data['facts']['customerPreparationStatus'] = 'ACCOUNT_REGISTERED_BOOKING_RESPONSE_REVIEW'
prep = data['customerAcceptance']['preparation']
prep['accountRegistrationStatus'] = 'PARENT_ACTIVE_WAITING_FIRST_GOOGLE_LOGIN'
prep['accountRegistrationEvidence'] = 'outputs/customer-ready-20261107/account-registration.json'
prep['bookingCancellationReadiness'] = 'CANCELLED_LEDGER_CALENDAR_SITE_BALANCE_CONFIRMED_CREATE_RESPONSE_REVIEW'
prep['bookingCancellationEvidence'] = 'outputs/customer-ready-20261107/booking-smoke-result.json'
prep['calendarCustomerReadAccess'] = 'SHARED_READER_PERSISTED_RECIPIENT_OPEN_PENDING'
prep['calendarCustomerShareEvidence'] = 'outputs/customer-ready-20261107/calendar-sharing.json'
prep['completionFixturesReadiness'] = 'NOT_CREATED_PENDING_CONFIRMED_CUSTOMER_DATE'
prep['customerDateStatus'] = 'NOT_SCHEDULED'
prep['originalTwoAdministratorsRetained'] = True
text = json.dumps(data, ensure_ascii=False, indent=2) + '\n'
path.write_bytes(text.replace('\n', '\r\n' if b'\r\n' in raw else '\n').encode('utf-8'))
print('Updated actual preparation facts; customer tests remain 0/6 and production HOLD.')
