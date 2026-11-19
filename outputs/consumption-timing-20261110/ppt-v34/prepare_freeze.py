from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'outputs/consumption-timing-20261110/ppt-v34'
sha=lambda b:hashlib.sha256(b).hexdigest()
reg=ROOT/'docs/traceability/registry.json';r=json.loads(reg.read_text(encoding='utf-8'))
assert r['version']=='2026-11-10-r18'
assert sha(reg.read_bytes())=='0f6b53a352a8549cc4a66a34af7932c8e692f4dbe0280f0b13920a4eede35719'
pub=ROOT/'outputs/consumption-timing-20261110/public-ui/results.json';p=json.loads(pub.read_text(encoding='utf-8'))
assert p['pass'] and len(p['checks'])==7 and all(x['pass'] for x in p['checks'])
assert p['customerFixtureWrites']==0 and p['productionStarted'] is False
assert p['hostingVersion']=='0b830b69152e45a3'
files=['outputs/consumption-timing-20261110/public-ui/results.json','docs/acceptance/deployment/releases/0b830b69152e45a3/public-verification.json','docs/acceptance/deployment/releases/0b830b69152e45a3/build-manifest.json','outputs/consumption-timing-20261110/independent-review.json','outputs/reservation-retry-20261109/independent-review.json','outputs/consumption-timing-20261110/regression/trace-ui-serial/results.json','outputs/consumption-timing-20261110/regression/local/results.json','outputs/consumption-timing-20261110/regression/reviewer/results.json','outputs/consumption-timing-20261110/regression/modal-scroll/results.json','outputs/consumption-timing-20261110/adoption/frontend-contract-normalized.json','outputs/consumption-timing-20261110/adoption/reservation-retry-ui.json']
facts={'status':'ROOT_LOCK','date':'2026-11-10','registryVersion':r['version'],'registrySha256':sha(reg.read_bytes()),'publicStatus':'PASS','hostingVersion':p['hostingVersion'],'sourceDigest':p['sourceDigest'],'customerPassed':0,'customerTotal':6,'productionStarted':False,'customerFixtureWrites':0,'publicUiSummary':'375px幅で通常時・残り2回・予約フォームを確認','balanceSummary':'予約7→7、完了で7→6→4→2、再読込後も2','observationSummary':'残数の減る時点を保護者画面と予約フォームに常時表示する改善を検証Hostingへ反映。公開7応答が一致し、375×812の公開匿名デモで7件の確認が成功した。顧客・Google台帳への書込なし。','contentReview':'公開フロント匿名デモ、実Google受入、実機、顧客確認を分離。予約の再送ID保持・一覧1行への集約はNode模擬試験で確認し、実Googleでの障害応答注入は未実施。Nov9実施のフロント契約33件は現行ソースと一致して保持。Nov10は新しい画面・小画面の回帰30件を実施し、失敗した初回スクリーンショット試行は履歴に残した。顧客0/6、本番HOLD。11月7日のv5汎用エラーとの因果関係は未確定。','evidenceFiles':[{'path':f,'sha256':sha((ROOT/f).read_bytes())}for f in files]}
(OUT/'freeze.json').write_text(json.dumps(facts,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({'registrySha256':facts['registrySha256'],'hostingVersion':facts['hostingVersion'],'evidenceFiles':len(files)}))
