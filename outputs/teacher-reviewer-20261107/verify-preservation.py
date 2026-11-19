import json, re, hashlib
from pathlib import Path
from datetime import datetime, timezone

p = Path(__file__).parent
read = lambda name: (p / name).read_text(encoding='utf-8-sig')
js = lambda name: json.loads(read(name))
def cards(name):
    result = {}
    key, block = None, []
    for line in read(name).splitlines():
        text = re.sub(r'^\s*\d+\s+', '', line)
        if text.startswith('text STU-'):
            key, block = text.removeprefix('text '), []
        if key:
            block.append(text)
            if text == 'button 予約登録':
                result[key] = '\n'.join(block)
                key, block = None, []
    return result
before = cards('before-students.txt')
after = cards('after-reload-students.txt')
old_accounts = js('before-account-list.json')
new_accounts = js('after-reload-account-list.json')
old_rows = js('before-schedule-rows.json')
new_rows = js('after-schedule-rows.json')
teacher_id = 'STU-d7c0ac11-49f0-408d-970c-978ef2c8325e'
teacher_url = 'https://eigo-taxi-test.web.app/#/parent/b9d0a50e-0623-4ac8-9bf3-2bdfe1f56040'
kob_url = 'https://eigo-taxi-test.web.app/#/parent/24db89d1-e687-4535-900a-559e6ebca0b7'
assignment = read('teacher-assignment-after-reload.txt')
checked = re.findall(r'Description: (.*?), Value: 1', assignment)
checks = {
    'existing_four_visible_student_cards_unchanged': len(before)==4 and all(after.get(k)==v for k,v in before.items()),
    'one_separate_teacher_student_added': set(after)-set(before)=={teacher_id},
    'teacher_initial_balance_five': '5 回' in after.get(teacher_id,''),
    'all_six_existing_visible_schedule_rows_unchanged': len(old_rows)==7 and old_rows==new_rows,
    'two_existing_admins_and_kobayashi_directory_unchanged': len(old_accounts)==3 and new_accounts[:3]==old_accounts and len(new_accounts)==4,
    'teacher_registered_active_reviewer_first_login_pending': 'Brenda先生（検証用）brendahitchens@excolovitajp.com検証専用（指定した架空生徒のみ） / 有効 / 初回ログイン待ち' in new_accounts[-1],
    'teacher_assignment_only_own_student': checked==['先生確認用・架空生徒','利用を有効にする'],
    'kobayashi_url_unchanged': kob_url in read('before-kobayashi-url.txt') and kob_url in read('after-kobayashi-url.txt'),
    'teacher_url_distinct_and_observed': teacher_url in read('teacher-url-readback.txt') and teacher_url != kob_url,
    'kobayashi_assignment_preserved': 'Description: 顧客確認_架空生徒, Value: 1' in read('after-kobayashi-assignment.txt') and 'Description: 先生確認用・架空生徒, Value: 0' in read('after-kobayashi-assignment.txt'),
}
result = {
    'mode':'real-test-site-configuration-readback',
    'recordedAt':datetime.now(timezone.utc).isoformat(),
    'clientDate':'2026-11-07','clientTimezone':'Asia/Tokyo',
    'status':'PREPARED_FIRST_LOGIN_PENDING',
    'site':'https://eigo-taxi-test.web.app',
    'frontendRelease':'43d4ac9b2a065441','gasVersion':6,'specVersion':'2026-11-07-r17',
    'teacher': {'email':'brendahitchens@excolovitajp.com','displayName':'Brenda先生（検証用）','role':'reviewer','active':True,'studentId':teacher_id,'studentName':'先生確認用・架空生徒','initialBalance':5,'initialRides':0,'parentUrl':teacher_url,'adminUrl':'https://eigo-taxi-test.web.app/#/admin','googleIdentityVerified':False,'actualBothPortalLogin':'NOT_RUN'},
    'changes':{'createdStudents':1,'createdReviewerRegistrations':1,'createdRides':0,'completedRides':0,'ticketPurchases':0,'sourceChanges':0,'gasDeployments':0,'hostingDeployments':0,'calendarSharingChanges':0,'messagesSent':0},
    'checks':checks,
    'preservationScope':'Existing visible directory, assignment checkboxes, four student cards, six schedule rows and individual URL compared. No raw Spreadsheet or authentication-property full comparison claimed.',
    'customerAcceptancePassed':0,'customerAcceptanceTotal':6,'productionStarted':False,
    'evidence': {f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in p.iterdir() if f.is_file() and f.suffix in ('.txt','.json','.png') and f.name not in ('registration-result.json','preservation-check.json')},
}
(p/'registration-result.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(p/'preservation-check.json').write_text(json.dumps({'status':'PASS' if all(checks.values()) else 'FAIL','checks':checks},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':'PASS' if all(checks.values()) else 'FAIL','checks':checks},ensure_ascii=False))
raise SystemExit(0 if all(checks.values()) else 1)
