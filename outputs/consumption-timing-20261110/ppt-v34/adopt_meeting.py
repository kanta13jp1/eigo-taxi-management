from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as E
import json,hashlib,re
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[3];OUT=ROOT/'outputs/consumption-timing-20261110/ppt-v34/meeting'
load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
sha=lambda b:hashlib.sha256(b).hexdigest()
def write(p,o):p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
a=load(OUT/'authoring-result.json');v=load(OUT/'validation.json');review=load(OUT/'independent-review.json')
assert review.get('status',review.get('result'))=='PASS'
assert sha(Path(a['final']).read_bytes())==a['sha256']==v['finalSha256']=='590cf407be6f7428b0eb89a7dfaf3dbb6869d6dca54d1a3c8209ed3c16bfd2d3'
assert v['packageIntegrity']['finding_count']==v['presentationLayout']['finding_count']==v['presentationLayout']['warning_count']==0
assert sha((ROOT/a['briefPath']).read_bytes())==a['briefSha256']
target=Path(a['final']);rel=target.relative_to(ROOT).as_posix()
binarypath=ROOT/'docs/traceability/binary-documents.json';binary=load(binarypath);entries=binary['documents'];assert rel not in {x['path']for x in entries}
nextid=max(int(x['id'].split('-')[1])for x in entries)+1
d={'id':f'BIN-{nextid:04}','path':rel,'state':'current','purpose':'supplemental-premeeting-not-in-canonical-twelve','sha256':a['sha256'],'items':[]}
with ZipFile(target)as z:
    slides=sorted([n for n in z.namelist()if re.fullmatch(r'ppt/slides/slide\d+\.xml',n)],key=lambda n:int(re.search(r'slide(\d+)',n)[1]))
    assert len(slides)==4
    for sn,name in enumerate(slides,1):
        for j,paragraph in enumerate(E.fromstring(z.read(name)).findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}p'),1):
            t=''.join(paragraph.itertext())
            if t.strip():d['items'].append({'id':f'{d["id"]}-SL-{sn:03}-ITEM-{j:04}','slide':sn,'contentSha256':sha(t.encode())})
entries.append(d);write(binarypath,binary)
readme=target.parent/'README.md'
readme.write_text('''# 11月11日16時の事前打ち合わせ資料

小林さんと梅澤さんの事前打ち合わせは **2026年11月11日（水）16:00（日本時間）** 開始で合意されています。先生への案内前に、デモの試し方と運用上の確認事項をそろえるための4ページです。20〜30分は進行案で、終了時刻は未確定です。

[打ち合わせ用PowerPoint（4ページ）](premeeting-2026-11-11-v1.pptx)

1. 打ち合わせでそろえること
2. 先生のデモ試用と、小林さんの顧客確認6件の違い
3. 予約時と完了時のチケット残数の図解
4. 検証サイトへの反映結果と残る確認

MightyLINKのロゴ・空写真・水色／オレンジ・Yu Gothicの共通デザインを使い、図形と表を編集できます。全4ページを描画・再取込・構造検査・実視確認し、独立レビューを確認しました。配置・フォント・構造の指摘と新規警告は0件です。PowerPointアプリ上の表示は未確認です。

この資料はr18の正本12冊とは別冊です。Googleログイン不要のデモと、本人が会社Googleを使う6件の確認を分けています。デモの試用や質問を、顧客確認の合格として数えません。顧客確認0/6、本番HOLD。会議の新規予約・招待送信・本番開始は行っていません。

SHA-256：`590cf407be6f7428b0eb89a7dfaf3dbb6869d6dca54d1a3c8209ed3c16bfd2d3`。

[詳しい進行メモ](../../progress/2026-11-10-premeeting-brief.md)・[当日の反映と画面確認](../../progress/2026-11-10-consumption-timing.md)・[正本12冊の現行一覧](../2026-10-23-traceability/README.md)・[構造・配置検査](../../../outputs/consumption-timing-20261110/ppt-v34/meeting/validation.json)・[独立レビュー](../../../outputs/consumption-timing-20261110/ppt-v34/meeting/independent-review.json)。
''',encoding='utf-8')
main=ROOT/'docs/deliverables/2026-10-23-traceability/README.md';text=main.read_text(encoding='utf-8')
needle='[当日の反映と画面確認](../../progress/2026-11-10-consumption-timing.md)'
assert text.count(needle)==1
text=text.replace(needle,'[打ち合わせ用の図入り4ページ](../2026-11-10-premeeting/README.md)・'+needle,1);main.write_text(text,encoding='utf-8')
write(OUT/'adoption.json',{'status':'ADOPTED_SUPPLEMENT_ONLY','adoptedAt':datetime.now(timezone.utc).isoformat(),'file':rel,'sha256':a['sha256'],'slides':4,'binaryId':d['id'],'canonicalTwelveManifestModified':False,'customerPassed':0,'productionStarted':False})
print(json.dumps({'adoptedSupplement':rel,'sha256':a['sha256'],'binaryId':d['id'],'canonicalTwelveManifestModified':False}))
