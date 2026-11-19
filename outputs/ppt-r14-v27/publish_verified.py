import hashlib,json,re,shutil,zipfile
from pathlib import Path
root=Path.cwd(); build=root/'outputs/ppt-r14-v27'; target=root/'docs/deliverables/2026-10-23-traceability'; manifest=root/'docs/traceability/presentations.json'; report=root/'docs/traceability/reports/ppt-r14-v27'; readme=target/'README.md'
reg=root/'docs/traceability/registry.json'; reg_hash=hashlib.sha256(reg.read_bytes()).hexdigest(); assert reg_hash=='44821fe0eff7f265b466d8443005415d102307ba6822ddef85d5ea4be8f7b5f4'
rows=json.loads(manifest.read_text(encoding='utf8')); comparison=json.loads((build/'pixel-comparison.json').read_text(encoding='utf8')); assert (comparison['total'],comparison['changed'],comparison['unchanged'])==(126,14,112) and not comparison['unexpected'] and not comparison['missingExpectedChanges']
verified=[]
for row in rows:
 name=Path(row['path']).name.split('-2026-')[0]; out=target/(name+'-2026-11-03-v27.pptx'); receipt=build/name/'validation.json'; assert out.is_file() and receipt.is_file()
 sha=hashlib.sha256(out.read_bytes()).hexdigest(); validation=json.loads(receipt.read_text(encoding='utf8')); assert validation['finalSha256']==sha and validation['packageIntegrity']['status']=='pass' and validation['presentationLayout']['finding_count']==0 and validation['firstPartyImport']['passed'] and validation['firstPartyImport']['slideCount']==row['slides']
 with zipfile.ZipFile(out) as z:
  notes=[n for n in z.namelist() if re.fullmatch(r'ppt/notesSlides/notesSlide\d+\.xml',n)]; assert len(notes)==row['slides']
  for note in notes:
   content=z.read(note).decode('utf8'); assert '2026-11-03 r14 最新仕様' in content and 'GAS未配備' in content and '既存予定は遡及変更しない' in content
 verified.append((row,name,out,receipt,sha))
assert len(verified)==12 and sum(row['slides'] for row,_,_,_,_ in verified)==126
report.mkdir(exist_ok=False,parents=True)
shutil.copy2(build/'pixel-comparison.json',report/'pixel-comparison.json')
for row,name,out,receipt,sha in verified:
 d=report/name; d.mkdir(); shutil.copy2(receipt,d/'validation.json')
 row.update(path=out.relative_to(root).as_posix(),registryVersion='2026-11-03-r14',registrySha256=reg_hash,sha256=sha,receipt=(d/'validation.json').relative_to(root).as_posix(),progressSupplementDate='2026-11-03',contentReview='新規予定の説明欄に予約ID表示をr14へ反映。ローカル実装・模擬試験と実Google未検証・GAS未配備を区別。既存予定は遡及なし、第三者0/30・本番HOLD。')
text=readme.read_text(encoding='utf8')
text=re.sub(r'^\*\*2026-11-03 現在：\*\*.*$', '**2026-11-03 現在：** AT-24は新規カレンダー予定の説明欄に予約IDを表示し、台帳の予約IDと照合する仕様へ決定。ローカル変更と模擬試験70/70・独立AIレビューを確認。GASは未配備、実Google連携は未検証で既存予定への遡及変更なし。AT-28は本人が2シートを表示したが、ブラウザー初期化タイムアウトで数式・書式は未比較。AT-24〜30未完、第三者受入0/30、Calendar権限未追加・本番未開始。',text,count=1,flags=re.M)
text=re.sub(r'^仕様基準：.*$', '仕様基準：2026-11-03-r14。現行の12点・126スライドはすべてv27。MightyLINK HP参照のロゴ・空写真・水色／オレンジ枠・Yu Gothicで統一。編集可能な図形・表を使用。',text,count=1,flags=re.M)
for row,name,out,receipt,sha in verified:
 text=re.sub(r'\('+re.escape(name)+r'-2026-[^)]*?\.pptx\)', '('+out.name+')',text,count=1)
text+='\n2026-11-03 r14 追補（v27、12冊）：新規予定説明欄の予約IDと台帳との照合を反映。GAS変更はローカルのみで未配備・実Google未検証、既存予定への遡及なし。126頁を描画し、変更14頁を実寸目視、残112頁は旧版と画像一致。全12冊の構造・配置・再import検査は合格。PowerPointアプリでの実行確認は未実施。検査控え：`docs/traceability/reports/ppt-r14-v27/`。\n'
manifest.write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf8');readme.write_text(text,encoding='utf8');print(json.dumps({'decks':len(rows),'slides':126,'registrySha256':reg_hash,'changed':14,'unchanged':112,'receipts':report.as_posix()},ensure_ascii=False))
