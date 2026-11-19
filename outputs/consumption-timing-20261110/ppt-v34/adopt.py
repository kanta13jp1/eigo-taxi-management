from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as E
import hashlib,json,re
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[3];REPORT=ROOT/'docs/traceability/reports/ppt-consumption-20261110';OUT=ROOT/'outputs/consumption-timing-20261110/ppt-v34'
sha=lambda b:hashlib.sha256(b).hexdigest()
def load(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(p,o):p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
review=load(REPORT/'independent-ppt-review.json');proposal=load(REPORT/'proposed-presentations.json');auth=load(REPORT/'authoring-results.json')
assert review.get('status',review.get('result'))=='PASS'
assert sha((REPORT/'proposed-presentations.json').read_bytes())=='f009659912859bc4f1db4e4f204e878eee6dfec31722aa79cd2f7d0e10027ada'
lock='0f6b53a352a8549cc4a66a34af7932c8e692f4dbe0280f0b13920a4eede35719'
assert sha((ROOT/'docs/traceability/registry.json').read_bytes())==lock
assert len(proposal)==12 and sum(p['slides']for p in proposal)==184
manifest=ROOT/'docs/traceability/presentations.json';binarypath=ROOT/'docs/traceability/binary-documents.json';readme=ROOT/'docs/deliverables/2026-10-23-traceability/README.md'
assert manifest.read_bytes()==(OUT/'finalized/source-manifest.json').read_bytes()
for p in [manifest,binarypath,readme]:
    target=OUT/('before-adoption-'+p.name)
    if not target.exists():target.write_bytes(p.read_bytes())
for p in proposal:
    a=next(x for x in auth['records']if x['id']==p['id']);source=Path(a['final']);target=ROOT/p['path']
    assert sha(source.read_bytes())==p['sha256']==a['sha256']
    assert load(ROOT/p['receipt'])['finalSha256']==p['sha256']
    assert p['registryVersion']=='2026-11-10-r18' and p['registrySha256']==lock
    if target.exists():assert sha(target.read_bytes())==p['sha256']
    else:target.write_bytes(source.read_bytes())
binary=load(binarypath);entries=binary['documents'];oldids={d['path']:d['id']for d in entries};by={d['path']:d for d in entries}
current={p['path']for p in proposal}|{'docs/traceability/matrix.csv','docs/acceptance/third-party-acceptance-checklist.csv'}
for d in entries:d['state']='current' if d['path']in current else 'historical'
for p in ['docs/traceability/matrix.csv','docs/acceptance/third-party-acceptance-checklist.csv']:
    if p in by:by[p]['sha256']=sha((ROOT/p).read_bytes())
nextid=max(int(d['id'].split('-')[1])for d in entries)+1
for p in proposal:
    assert p['path']not in by
    d={'id':f'BIN-{nextid:04}','path':p['path'],'state':'current','sha256':p['sha256'],'items':[]};nextid+=1
    with ZipFile(ROOT/p['path'])as z:
        slides=sorted([n for n in z.namelist()if re.fullmatch(r'ppt/slides/slide\d+\.xml',n)],key=lambda n:int(re.search(r'slide(\d+)',n)[1]))
        for sn,name in enumerate(slides,1):
            for j,paragraph in enumerate(E.fromstring(z.read(name)).findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}p'),1):
                text=''.join(paragraph.itertext())
                if text.strip():d['items'].append({'id':f'{d["id"]}-SL-{sn:03}-ITEM-{j:04}','slide':sn,'contentSha256':sha(text.encode())})
    entries.append(d)
assert all(next(d['id']for d in entries if d['path']==p)==v for p,v in oldids.items())
write(manifest,proposal);write(binarypath,binary)
old=readme.read_text(encoding='utf-8-sig');titles=['業務フロー','要件定義','設計','テスト仕様書','タスクリスト','実装コード対応','テストコード対応','受入テスト仕様書','運用手順書','ユーザーマニュアル','トレーサビリティ','進捗・残課題']
lines=['# 現行配布用PowerPoint（共通デザイン）','',
'**2026-11-10 現在：予約時と完了時の残数の違いを、保護者画面と予約フォームで説明する改善を反映しました。** 検証Hosting `0b830b69152e45a3` の公開7応答がビルドと一致し、375×812の公開匿名デモで7件を確認しました。予約時は7回のまま、片道完了で6回、往復の完了で4回・2回となり、残り2回でも説明とMauro・Brendaへの連絡案内を表示しました。','',
'仕様基準は **2026-11-10-r18**。12冊・184頁をv34に統一しました。**現在の変更と確認結果は、各冊末尾の2頁を先にご覧ください。** 旧160頁の画面・文章・ノート・画像は当時の履歴として保全し、現在の仕様はr18の注記と正本を参照します。184頁を描画・再取込し、旧160頁の全画素一致、旧ノート・画像の保持、24頁の現行図表を独立AIが確認しました。従来の業務フローの配置警告21件を維持し、新規警告は0件です。PowerPointアプリ上の表示は未確認です。','',
'同じタブで不完全な応答の後に再送する場合の予約ID保持と、一覧を同じIDの1行へ集約する修正も含みます。この分岐は模擬応答で検査し、実Googleで障害を起こした確認とは区別します。11月7日のv5汎用通信エラーとの因果関係は未確定です。','',
'公開デモはブラウザー内の架空データだけです。実Google連携・実機・顧客確認の新しい合格へは数えません。小林さんの顧客確認は **0/6件**。同じGoogleと固定2URLで未実施だけを再開する手順を維持します。顧客用の生徒・残数・固定予約への書込は行っていません。本番開始はHOLDです。','',
'[当日の反映と画面確認](../../progress/2026-11-10-consumption-timing.md)・[11月11日16時の事前打ち合わせメモ](../../progress/2026-11-10-premeeting-brief.md)・[顧客向け6手順](../../acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md)・[資料保全検査](../../traceability/reports/ppt-consumption-20261110/review.json)・[独立レビュー](../../traceability/reports/ppt-consumption-20261110/independent-ppt-review.json)','',
'|資料ID|資料|スライド数|検証|','|---|---|---:|---|']
for p,title in zip(proposal,titles):lines.append(f'|{p["id"]}|[{title}]({Path(p["path"]).name})|{p["slides"]}|描画・再取込・保全照合・独立レビュー済み|')
lines+=['','## 過去の配布一覧と検証履歴','','以下は更新前の状態です。現在の配布対象は上のr18・v34を参照してください。','',old]
readme.write_text('\n'.join(lines)+'\n',encoding='utf-8')
write(REPORT/'adoption.json',{'status':'ADOPTED','adoptedAt':datetime.now(timezone.utc).isoformat(),'rootApproval':'ADOPT12v34 reviewedmanifestproposal SHA f0096599...','registryVersion':'2026-11-10-r18','registrySha256':lock,'decks':12,'slides':184,'oldBinaryIdsPreserved':True,'customerPassed':0,'productionStarted':False})
print(json.dumps({'adoptedDecks':12,'slides':184,'binaryDocuments':len(entries),'registrySha256':lock}))
