from pathlib import Path
import hashlib, json, re, zipfile
import xml.etree.ElementTree as ET

root=Path(__file__).resolve().parents[1]
base=root/'docs/traceability'
report=base/'reports/ppt-delivery-20261107'
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
write=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
proposed=load(report/'proposed-presentations.json')
review=load(report/'independent-review.json')
assert review['status']=='PASS' and not review['findings']
assert digest(base/'registry.json')==review['registrySha256']
assert len(proposed)==12 and sum(p['slides'] for p in proposed)==160
for p in proposed:
    assert digest(root/p['path'])==p['sha256']
    assert load(root/p['receipt'])['finalSha256']==p['sha256']
    assert p['registrySha256']==review['registrySha256']
archive=root/'outputs/ppt-customer-adoption-20261107'
archive.mkdir(exist_ok=True)
for name in ['presentations.json','binary-documents.json']:
    dest=archive/('before-'+name)
    if not dest.exists(): dest.write_bytes((base/name).read_bytes())
readme=root/'docs/deliverables/2026-10-23-traceability/README.md'
old=readme.read_text(encoding='utf-8-sig')
oldcopy=archive/'before-deliverables-README.md'
if not oldcopy.exists():oldcopy.write_text(old,encoding='utf-8')
titles=['業務フロー','要件定義','設計','テスト仕様書','タスクリスト','実装コード対応','テストコード対応','受入テスト仕様書','運用手順書','ユーザーマニュアル','トレーサビリティ','進捗・残課題']
lines=['# 現行配布用PowerPoint（共通デザイン）','','**2026-11-07 現在：** 予約フォームの小画面スクロール修正を検証サイトへ反映しました。同じ公開画面検証4条件が修正前4件FAILから修正後4件PASSとなり、公開6ファイルとルートURLの計7応答を照合しました。公開フロントエンドの匿名デモの検証で、実Google・実機・顧客確認の新しい合格ではありません。','','顧客への依頼は、小林さん本人が日常操作を確認する **CUST-01〜06（0/6、未実施）** に変更しました。旧「第三者30件」の完了条件は撤回し、元のAT-01〜30は開発側の技術検証として継続します。[小林さん向けの6手順](../../acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md)・[共有表の顧客確認6件](https://docs.google.com/spreadsheets/d/1PqUq7BoBBVlPolivap0eg1UPik47vNNWphyBd0DNwvU/edit#gid=110706)をご覧ください。','','仕様基準は **2026-11-07-r15**。12冊・160頁をv31に統一しました。各冊末尾の2頁に本日の反映結果と顧客確認6件を図解しています。旧136頁の本文・ノート・画像を保存し、日付のある過去の条件と結果は履歴として区別しました。正本全文と最新条件はノートに収録しています。','','Calendar検証の保留は解除済みです。検証専用カレンダーを作成し、レビュー済みコード・権限定義・接続先はGASの編集HEADへ保存して再読込照合しました。Google実同意とWebアプリ新配備は未了です。実Google受入AT-24〜30は項目全体として未完、本番運用は未開始です。','','MightyLINKのロゴ・空写真・水色／オレンジ・Yu Gothicの共通デザインを使用。全160頁を再描画・再取り込みし、構造と新規配置の指摘0、独立AIレビューPASSを確認しました。業務フローに以前からある配置警告21件は保存しており、新規警告はありません。PowerPointアプリ上の表示は未確認です。','','本文全文の正本は [文書管理の入口](../../traceability/README.md)。[当日の反映記録](../../progress/2026-11-07-test-site-delivery.md)・[資料検査](../../traceability/reports/ppt-delivery-20261107/review.json)・[独立レビュー](../../traceability/reports/ppt-delivery-20261107/independent-review.json)を参照してください。','','|資料ID|資料|スライド数|検証|','|---|---|---:|---|']
for p,title in zip(proposed,titles): lines.append(f"|{p['id']}|[{title}]({Path(p['path']).name})|{p['slides']}|構造・描画・再取込・独立レビュー済み|")
lines+=['','## 過去の配布一覧と検証履歴','','以下は更新前の一覧を含む履歴です。現在の配布資料・判定は上記のv31とr15を参照してください。','',old]
readme.write_text('\n'.join(lines)+'\n',encoding='utf-8')
write(base/'presentations.json',proposed)
binary=load(base/'binary-documents.json')
entries=binary['documents']; bypath={d['path']:d for d in entries}
current={p['path'] for p in proposed}|{'docs/traceability/matrix.csv','docs/acceptance/third-party-acceptance-checklist.csv'}
changes=[]
for d in entries:
    state='current' if d['path'] in current else 'historical'
    if d['state']!=state:changes.append({'path':d['path'],'stateBefore':d['state'],'stateAfter':state});d['state']=state
for path in ['docs/traceability/matrix.csv','docs/acceptance/third-party-acceptance-checklist.csv']:
    d=bypath[path]; newhash=digest(root/path)
    changes.append({'path':path,'before':d['sha256'],'after':newhash});d['sha256']=newhash
nextid=max(int(d['id'].split('-')[1]) for d in entries)+1
for p in proposed:
    if p['path'] in bypath:continue
    d=dict(id=f'BIN-{nextid:04}',path=p['path'],state='current',sha256=p['sha256'],items=[]);nextid+=1
    with zipfile.ZipFile(root/p['path']) as z:
        slides=sorted([n for n in z.namelist() if re.fullmatch(r'ppt/slides/slide\d+\.xml',n)],key=lambda n:int(re.search(r'slide(\d+)',n)[1]))
        for sn,name in enumerate(slides,1):
            for j,a in enumerate(ET.fromstring(z.read(name)).findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}p'),1):
                t=''.join(a.itertext())
                if t.strip():d['items'].append(dict(id=f'{d["id"]}-SL-{sn:03}-ITEM-{j:04}',slide=sn,contentSha256=hashlib.sha256(t.encode()).hexdigest()))
    entries.append(d)
write(base/'binary-documents.json',binary)
write(report/'root-adoption.json',{'date':'2026-11-07','status':'ADOPTED','review':str((report/'independent-review.json').relative_to(root)).replace('\\','/'),'registrySha256':review['registrySha256'],'decks':12,'slides':160,'binaryUpdates':changes,'oldItemsPreserved':True,'newBinaryItems':sum(len(d['items']) for d in entries if d['path'] in {p['path'] for p in proposed})})
print(json.dumps({'adoptedDecks':12,'slides':160,'binaryDocuments':len(entries),'newParagraphIds':sum(len(d['items']) for d in entries if d['path'] in {p['path'] for p in proposed})}))
