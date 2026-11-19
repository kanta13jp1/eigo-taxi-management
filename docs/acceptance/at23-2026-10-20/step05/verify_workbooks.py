import json, zipfile, xml.etree.ElementTree as E, hashlib
from pathlib import Path
p=Path(__file__).parent
n={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
def read(name):
    with zipfile.ZipFile(p/name) as z:
        shared=[]
        if 'xl/sharedStrings.xml' in z.namelist():
            shared=[''.join(x.itertext()) for x in E.fromstring(z.read('xl/sharedStrings.xml'))]
        rel={x.attrib['Id']:x.attrib['Target'].lstrip('/') for x in E.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
        out={}
        for s in E.fromstring(z.read('xl/workbook.xml')).find('s:sheets',n):
            target=rel[s.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']]
            if not target.startswith('xl/'): target='xl/'+target
            cells={}
            for c in E.fromstring(z.read(target)).findall('.//s:c',n):
                v=c.find('s:v',n); f=c.find('s:f',n)
                value=v.text if v is not None else ''
                if c.attrib.get('t')=='s': value=shared[int(value)]
                if c.attrib.get('t')=='inlineStr': value=''.join(c.find('s:is',n).itertext())
                if value or f is not None: cells[c.attrib['r']]={'value':value,'formula':f.text if f is not None else None}
            out[s.attrib['name']]=cells
        return out
before=read('before-schema-test.xlsx'); generated=read('generated-schemas.xlsx'); restored=read('restored-workbook.xlsx')
expected={
 '生徒台帳':['生徒ID','生徒氏名','保護者名','緊急連絡先','送迎場所住所','送迎時メモ','残チケット数','登録日'],
 '送迎予定履歴':['送迎ID','生徒ID','生徒名','送迎日','送迎時間','区分','送迎場所','ステータス','カレンダーイベントID','予約者','備考','完了日時'],
 'チケット購入履歴':['購入ID','生徒ID','生徒名','購入日','追加枚数','金額','備考']}
checks={}
for name,headers in expected.items():
    expectedcells={chr(65+i)+'1':{'value':v,'formula':None} for i,v in enumerate(headers)}
    checks[name]={'generatedExactHeaderOnly':generated[name]==expectedcells,'preservedDuringRename':generated['AT23保全_'+name]==before[name],'restoredUnchanged':restored[name]==before[name],'evidenceTabPreserved':restored['AT23生成証跡_'+name]==expectedcells}
studentrows=[ref for ref,c in restored['生徒台帳'].items() if c['value']=='AT23検証_20261020_1514']
result={'checks':checks,'allPass':all(all(c.values()) for c in checks.values()),'finalSheetCount':len(restored),'webStudentNameCells':studentrows,'webStudentSingleRow':len(studentrows)==1,'preservedPopulatedCells':sum(map(len,before.values())),'sha256':{f:hashlib.sha256((p/f).read_bytes()).hexdigest() for f in ['before-schema-test.xlsx','generated-schemas.xlsx','restored-workbook.xlsx']}}
(p/'workbook-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False))
