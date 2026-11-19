from pathlib import Path
import json
root=Path(__file__).resolve().parents[2]
p=root/'docs/traceability/registry.json'
r=json.loads(p.read_text(encoding='utf-8'))
assert r['version'] in ('2026-11-07-r15','2026-11-07-r16')
e=json.loads((root/'outputs/customer-ready-20261107/calendar-read-result.json').read_text(encoding='utf-8'))
d=json.loads((root/'outputs/customer-ready-20261107/gas-deployment-v5.json').read_text(encoding='utf-8'))
assert e['status']=='PASS' and e['calendarScopeAuthorizationStatus']=='NOT_REQUIRED'
assert e['ownedByDeployer'] and e['notPrimaryCalendar'] and e['expectedCalendarMatched'] and e['timeZoneMatched']
assert d['status']=='DEPLOYED' and d['version']==5 and d['deploymentIdUnchanged']
r['version']='2026-11-07-r16'
r['facts'].update(calendarPermissionAdded=True,verificationGasVersion=5,verificationCalendarReadConfirmed=True,customerPreparationStatus='CALENDAR_READY_ACCOUNT_WAIT')
r['customerAcceptance']['preparation']={
 'mode':'single-account-phased',
 'phaseRoles':['parent','admin','parent','admin','parent'],
 'roleChangesBy':'separate linked developer administrator',
 'initialRole':'parent',
 'accountRegistrationStatus':'WAITING_OPERATOR_LOGIN',
 'fixture':{'studentId':'STU-CUST-20261107','name':'顧客確認_架空生徒','initialBalance':5,'persistedReadbackConfirmed':True,'existingThreeStudentsUnchanged':True},
 'calendarReadEvidence':'outputs/customer-ready-20261107/calendar-read-result.json',
 'gasDeploymentEvidence':'outputs/customer-ready-20261107/gas-deployment-v5.json',
 'bookingCancellationReadiness':'NOT_RUN',
 'completionFixturesReadiness':'NOT_CREATED',
 'productionStarted':False
}
p.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Registry r16 preparation: actual calendar read/consent and test deployment recorded; customer remains 0/6.')
