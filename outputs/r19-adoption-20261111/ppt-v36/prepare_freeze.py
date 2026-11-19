"""Freeze the facts and evidence the r19 presentation pages are allowed to state."""
from pathlib import Path
import hashlib, json, sys

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'outputs/r19-adoption-20261111/ppt-v36'
sha = lambda b: hashlib.sha256(b).hexdigest()
def load(p): return json.loads((ROOT / p).read_text(encoding='utf-8-sig'))

reg = ROOT / 'docs/traceability/registry.json'; r = json.loads(reg.read_text(encoding='utf-8'))
assert r['version'] == '2026-11-11-r19'
assert r['facts']['customerAcceptancePassed'] == 0 and r['facts']['release'] == 'HOLD' and r['facts']['productionStarted'] is False
strict = load('outputs/r19-adoption-20261111/strict-before-ppt.json')
assert {e['code'] for e in strict['errors']} <= {'PRESENTATION_STALE', 'PRESENTATION_CONTENT_REVIEW'}
review_name = sys.argv[1] if len(sys.argv) > 1 else 'independent-review.json'
assert load('outputs/r19-adoption-20261111/' + review_name)['result'] == 'PASS'

reports = {'outputs/r19-adoption-20261111/regression/trace-ui/results.json': 6, 'outputs/r19-adoption-20261111/regression/local/results.json': 14,
           'outputs/r19-adoption-20261111/frontend-contract-normalized.json': 33, 'outputs/r19-adoption-20261111/regression/login/google-auth-retry-ui.json': 2,
           'outputs/r19-adoption-20261111/regression/login/portal-mismatch-ui.json': 5, 'outputs/r19-adoption-20261111/regression/modal-scroll/results.json': 2,
           'outputs/r19-adoption-20261111/regression/reviewer/results.json': 8, 'outputs/r19-adoption-20261111/reservation-retry-ui.json': 1}
total = 0
for p, n in reports.items():
    d = load(p); assert len(d['results']) == n and all(x['status'] == 'PASS' for x in d['results']), p
    for s, h in d['sourceHashes'].items(): assert sha((ROOT / s).read_bytes()) == h, ('stale', p, s)
    total += n
assert total == 71
rb = load('outputs/at24-at25-20261110/readback.json')
assert rb['AT-24']['ledgerRow']['rideId'] in ' '.join(rb['AT-24']['calendarEvent']['description'])
assert rb['AT-25']['ledgerRow']['status'] == 'cancelled' and rb['AT-25']['ticketsAfter'] == rb['student']['ticketsBefore'] == 8
pub = load('docs/acceptance/deployment/releases/d360644531543a4e/public-verification.json'); assert pub['pass'] and len(pub['results']) == 7
files = list(reports) + ['outputs/r19-adoption-20261111/' + review_name, 'outputs/r19-adoption-20261111/registry-change-proposal.json', 'outputs/r19-adoption-20261111/strict-before-ppt.json',
                         'outputs/at24-at25-20261110/readback.json', 'outputs/portal-mismatch-20261110/public-parent-entrance-guidance.jpg',
                         'docs/acceptance/deployment/releases/d360644531543a4e/public-verification.json', 'docs/progress/2026-11-10-evening-fix-and-acceptance.md']
facts = {'status': 'ROOT_LOCK', 'date': '2026-11-11', 'registryVersion': r['version'], 'registrySha256': sha(reg.read_bytes()), 'customerPassed': 0, 'customerTotal': 6, 'productionStarted': False,
         'regressionSummary': '71件成功',
         'observationSummary': 'ログインの入口が合わないときの案内を検証Hostingへ反映し、公開中の保護者用入口で表示とリンクの移動を確認した。実カレンダー連動のAT-24・AT-25を、開発担当が検証環境の架空生徒で1回ずつ実施し、完了条件に合う結果を得た。顧客用の生徒・残数・固定予約への書込なし。',
         'contentReview': '入口の案内は表示の追加で、サーバーの判定・権限は変更していない。公開画面で確認したのは保護者用入口だけで、管理者用入口とスマートフォン幅は模擬試験のみ。AT-24・25は管理者による1回の実施で、保護者からの予約・取消、実機、確認ダイアログの文言、顧客確認は含まない。回帰試験71件は現在のソースを模擬環境で再実施した件数。11月10〜11日に別途反映された他の修正のうち、デモ表示・残少警告の統一・日付切替はソース基準のレビュー対象に含むが、本追補の説明・登録試験には含めていない。チケット追加の金額入力の変更はソース基準の対象外のファイルで、今回の独立レビューの範囲にも含まれていない。AT-24〜30は引き続き残る実受入として扱う。顧客0/6、本番HOLD。',
         'evidenceFiles': [{'path': p, 'sha256': sha((ROOT / p).read_bytes())} for p in files]}
(OUT / 'freeze.json').write_text(json.dumps(facts, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'registrySha256': facts['registrySha256'], 'evidenceFiles': len(files), 'regression': total}))
