"""Adopt only final, independently reviewed v32 files; preserve every old binary ID."""
from pathlib import Path
import hashlib, json, re, zipfile
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[2]
base = root / 'docs/traceability'
report = base / 'reports/ppt-customer-readiness-20261107'
load = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
def write(p, data):
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

review = load(report / 'independent-review.json')
proposed = load(report / 'proposed-presentations.json')
assert review['status'] == 'PASS' and not review['findings']
assert digest(base / 'registry.json') == review['registrySha256'] == 'f2d307b7a61cfcbf13cc48221cd58ca73c910b499b30a1ed46f7e163773e36fd'
assert len(proposed) == 12 and sum(p['slides'] for p in proposed) == 160
assert [p['id'] for p in proposed] == [f'PKG-{n:02}' for n in range(1, 13)]
for p in proposed:
    if not (root / p['path']).exists():
        authoring = load(report / 'authoring-results.json')
        source = next(item for item in authoring['records'] if item['id'] == p['id'])
        source_path = Path(source['final']).resolve()
        assert source_path.is_relative_to((root / 'outputs/customer-prep-ppt-20261107-v32').resolve())
        assert digest(source_path) == p['sha256'] == source['sha256']
        target_path = root / p['path']
        assert target_path.resolve().is_relative_to((root / 'docs/deliverables/2026-10-23-traceability').resolve())
        target_path.write_bytes(source_path.read_bytes())
    assert p['path'].endswith('-2026-11-07-v32.pptx')
    assert p['registryVersion'] == '2026-11-07-r16'
    assert p['registrySha256'] == review['registrySha256']
    assert digest(root / p['path']) == p['sha256']
    assert load(root / p['receipt'])['finalSha256'] == p['sha256']

archive = root / 'outputs/customer-ready-20261107/ppt-adoption'
archive.mkdir(exist_ok=True)
readme = root / 'docs/deliverables/2026-10-23-traceability/README.md'
for p in [base/'presentations.json', base/'binary-documents.json', readme]:
    target = archive / ('before-' + p.name)
    if not target.exists():
        target.write_bytes(p.read_bytes())
old = readme.read_text(encoding='utf-8-sig')
assert '仕様基準は **2026-11-07-r15**' in old, 'Review current README before repeated adoption.'

titles = ['業務フロー','要件定義','設計','テスト仕様書','タスクリスト','実装コード対応','テストコード対応','受入テスト仕様書','運用手順書','ユーザーマニュアル','トレーサビリティ','進捗・残課題']
lines = [
    '# 現行配布用PowerPoint（共通デザイン）', '',
    '**2026-11-07 現在：** 検証専用カレンダーの実読取を確認し、検証GASをv5へ更新しました。架空予約1件について台帳とカレンダーの予約ID・日時・場所を照合し、取消後は台帳の取消・予定の消失・再読込後の残数5枚を確認しました。登録直後の通信エラーは原因を確認中です。', '',
    '小林さんは架空生徒1名の保護者として事前登録済み、初回本人Googleログイン待ちです。専用Calendarは予定詳細の閲覧だけを共有し、本人側で開けるかは確認待ちです。顧客確認は **CUST-01〜06の0/6件、全件未実施**。同じアカウントを保護者→管理者→保護者→管理者→保護者へ、別の管理者が区切りで切り替えます。実施日と当日完了用の片道・往復予約2件は未確定です。', '',
    '仕様基準は **2026-11-07-r16**。12冊・160頁をv32に統一しました。各冊末尾2頁を今回の準備状況と1アカウントでの6件の確認手順へ差し替えました。旧136頁の本文・ノート・画像と、日付のある旧条件・旧結果は履歴として保存しています。現在の条件と正本全文は最新のノートを参照してください。', '',
    '同日の小画面予約フォーム修正は検証Hostingへ反映済みで、公開匿名デモ4条件と7応答の照合を確認しました。実Googleの今回の部分確認、顧客6件、元AT-01〜30の技術受入とは区別します。旧第三者30件は履歴で、全30件を第三者が実施する条件は撤回済みです。実Google受入AT-24〜30は項目全体として未合格。本番開始はHOLDです。', '',
    'MightyLINKのロゴ・空写真・水色／オレンジ・Yu Gothicの共通デザインを使用。全頁描画・再取込・保全照合・独立AIレビューを確認して採用しました。従来からの業務フローの配置警告は履歴として保持し、新規の指摘は検査記録を参照してください。PowerPointアプリ上の表示は未確認です。', '',
    '[顧客向け6手順](../../acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md)・[送付用依頼文](../../progress/2026-11-07-kobayashi-customer-request.md)・[今回の準備記録](../../progress/2026-11-07-customer-readiness.md)・[共有表](https://docs.google.com/spreadsheets/d/1PqUq7BoBBVlPolivap0eg1UPik47vNNWphyBd0DNwvU/edit#gid=110706)・[資料検査](../../traceability/reports/ppt-customer-readiness-20261107/review.json)・[独立レビュー](../../traceability/reports/ppt-customer-readiness-20261107/independent-review.json)', '',
    '|資料ID|資料|スライド数|検証|', '|---|---|---:|---|'
]
for p, title in zip(proposed, titles):
    lines.append(f"|{p['id']}|[{title}]({Path(p['path']).name})|{p['slides']}|描画・再取込・保全照合・独立レビュー済み|")
lines += ['', '## 過去の配布一覧と検証履歴', '', '以下は更新前の配布一覧です。現在の条件と配布対象は上記のr16・v32を参照してください。', '', old]
readme.write_text('\n'.join(lines) + '\n', encoding='utf-8')
write(base/'presentations.json', proposed)

binary = load(base/'binary-documents.json')
entries = binary['documents']
old_ids = {d['path']: d['id'] for d in entries}
by_path = {d['path']: d for d in entries}
current_paths = {p['path'] for p in proposed} | {'docs/traceability/matrix.csv','docs/acceptance/third-party-acceptance-checklist.csv'}
for d in entries:
    d['state'] = 'current' if d['path'] in current_paths else 'historical'
for name in ['docs/traceability/matrix.csv','docs/acceptance/third-party-acceptance-checklist.csv']:
    by_path[name]['sha256'] = digest(root/name)
next_id = max(int(d['id'].split('-')[1]) for d in entries) + 1
for p in proposed:
    assert p['path'] not in by_path, 'Already indexed; avoid duplicate binary records.'
    d = dict(id=f'BIN-{next_id:04}', path=p['path'], state='current', sha256=p['sha256'], items=[])
    next_id += 1
    with zipfile.ZipFile(root/p['path']) as z:
        slides = sorted([n for n in z.namelist() if re.fullmatch(r'ppt/slides/slide\d+\.xml',n)], key=lambda n:int(re.search(r'slide(\d+)',n)[1]))
        for sn, name in enumerate(slides, 1):
            for j, paragraph in enumerate(ET.fromstring(z.read(name)).findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}p'), 1):
                text = ''.join(paragraph.itertext())
                if text.strip():
                    d['items'].append(dict(id=f'{d["id"]}-SL-{sn:03}-ITEM-{j:04}', slide=sn, contentSha256=hashlib.sha256(text.encode()).hexdigest()))
    entries.append(d)
assert all(next(d['id'] for d in entries if d['path']==p)==v for p,v in old_ids.items())
write(base/'binary-documents.json', binary)
write(report/'root-adoption.json',dict(status='ADOPTED', date='2026-11-07', registrySha256=review['registrySha256'], decks=12, slides=160, oldBinaryIdsPreserved=True, customerPassed=0, productionStarted=False))
print(json.dumps(dict(adoptedDecks=12, slides=160, binaryDocuments=len(entries))))
