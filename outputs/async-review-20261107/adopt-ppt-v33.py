"""Promote only the frozen r17 v33 candidate after author and independent review."""
from pathlib import Path
import hashlib, json, re, zipfile
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[2]
base = root / 'docs/traceability'
report = base / 'reports/ppt-async-customer-20261107'
load = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
def write(p, data):
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

review = load(report / 'independent-review.json')
proposed = load(report / 'proposed-presentations.json')
authoring = load(report / 'authoring-results.json')
assert review['status'] == 'PASS' and not review['findings']
lock = 'd6aa48ce6e5bd18c89db3cde4c465f44b3dd088d52c0e5208cebaaf49d2d1adf'
assert digest(base / 'registry.json') == review['registrySha256'] == lock
assert len(proposed) == 12 and sum(p['slides'] for p in proposed) == 160
assert [p['id'] for p in proposed] == [f'PKG-{n:02}' for n in range(1, 13)]
for p in proposed:
    source = next(item for item in authoring['records'] if item['id'] == p['id'])
    source_path = Path(source['final']).resolve()
    assert source_path.is_relative_to((root / 'outputs/async-customer-ppt-20261107-v33').resolve())
    assert digest(source_path) == p['sha256'] == source['sha256']
    target_path = root / p['path']
    assert target_path.resolve().is_relative_to((root / 'docs/deliverables/2026-10-23-traceability').resolve())
    assert p['path'].endswith('-2026-11-07-v33.pptx')
    assert p['registryVersion'] == '2026-11-07-r17' and p['registrySha256'] == lock
    assert load(root / p['receipt'])['finalSha256'] == p['sha256']
    assert digest(root / source['sourceMdPath']) == source['sourceMdSha256']
    if target_path.exists():
        assert digest(target_path) == p['sha256'], 'Do not overwrite a different adopted candidate.'
    else:
        target_path.write_bytes(source_path.read_bytes())

archive = root / 'outputs/async-review-20261107/ppt-adoption'
archive.mkdir(exist_ok=True)
readme = root / 'docs/deliverables/2026-10-23-traceability/README.md'
for p in [base / 'presentations.json', base / 'binary-documents.json', readme]:
    target = archive / ('before-' + p.name)
    if not target.exists():
        target.write_bytes(p.read_bytes())
old = readme.read_text(encoding='utf-8-sig')
assert '仕様基準は **2026-11-07-r15**' in old
titles = ['業務フロー', '要件定義', '設計', 'テスト仕様書', 'タスクリスト', '実装コード対応', 'テストコード対応', '受入テスト仕様書', '運用手順書', 'ユーザーマニュアル', 'トレーサビリティ', '進捗・残課題']
lines = [
    '# 現行配布用PowerPoint（共通デザイン）', '',
    '**2026-11-07 現在：小林さんが随時実施できる準備が完了しました。** 同じ会社Googleアカウントで固定の家庭用・管理者用URLへ入り、開発担当の立会い・実施中の役割変更・日程調整なしで6件を進められます。対象は架空生徒1名だけで、通常の管理者・保護者の権限分離を維持します。', '',
    '検証GAS v6・検証Hostingへ反映し、公開7応答がビルドと一致しました。指定検証台帳に限定する設定と検証担当登録を保存・再取得し、2026-11-07 16:00の片道・往復2予約を台帳と実Calendarの予約ID・日時・場所で照合しました。サイト再読込で2件の予定中と開始残数5枚も確認しました。本人の初回Googleログイン・Calendar閲覧・顧客確認は **0/6件、全件未実施** です。', '',
    '仕様基準は **2026-11-07-r17**。12冊・160頁をv33に統一しました。各冊末尾2頁は、同じGoogleと2つの固定URL、片道・往復・追加後の5→4→2→12、中断後に未実施だけ再開する手順を図解しています。完了用予約は「本日の送迎」ではなくA03「送迎スケジュール一覧」を使い、固定日を過ぎても日付変更を依頼する必要はありません。旧136頁の本文・ノート・画像と当時の条件・結果は履歴として保存し、現在の条件は現行ノートと正本に記載しています。', '',
    'v5で最初の予約登録後に出た通信エラーの原因は未確定です。今回の固定2予約はそれぞれ1回の登録で正常応答しましたが、原因解消や原AT-24〜30全体の合格を意味しません。顧客6件、元の技術受入、公開フロントの確認を区別します。旧第三者30件の全実施条件は撤回済み。本番開始はHOLDです。', '',
    'MightyLINKのロゴ・空写真・水色／オレンジ・Yu Gothicの共通デザインを使用。全160頁を描画・再取込し、旧136頁の本文・旧ノート160頁・画像の保全と独立AIレビューを確認して採用しました。従来の業務フローの配置警告21件を保持し、新規警告はありません。PowerPointアプリ上の表示は未確認です。', '',
    '[顧客向け6手順](../../acceptance/CUSTOMER_ACCEPTANCE_MINIMUM_20261107.md)・[送付用依頼文](../../progress/2026-11-07-kobayashi-customer-request.md)・[準備結果](../../progress/2026-11-07-customer-readiness.md)・[中断再開の設計](../../acceptance/SELF_PACED_CUSTOMER_REVIEW_20261107.md)・[共有表](https://docs.google.com/spreadsheets/d/1PqUq7BoBBVlPolivap0eg1UPik47vNNWphyBd0DNwvU/edit#gid=110706)・[資料検査](../../traceability/reports/ppt-async-customer-20261107/review.json)・[独立レビュー](../../traceability/reports/ppt-async-customer-20261107/independent-review.json)', '',
    '|資料ID|資料|スライド数|検証|', '|---|---|---:|---|'
]
for p, title in zip(proposed, titles):
    lines.append(f"|{p['id']}|[{title}]({Path(p['path']).name})|{p['slides']}|描画・再取込・保全照合・独立レビュー済み|")
lines += ['', '## 過去の配布一覧と検証履歴', '', '以下は更新前の配布一覧です。現在の条件と配布対象は上記のr17・v33を参照してください。v32は未採用の候補として保管しました。', '', old]
readme.write_text('\n'.join(lines) + '\n', encoding='utf-8')
write(base / 'presentations.json', proposed)
binary = load(base / 'binary-documents.json')
entries = binary['documents']
old_ids = {d['path']: d['id'] for d in entries}
by_path = {d['path']: d for d in entries}
current_paths = {p['path'] for p in proposed} | {'docs/traceability/matrix.csv', 'docs/acceptance/third-party-acceptance-checklist.csv'}
for d in entries:
    d['state'] = 'current' if d['path'] in current_paths else 'historical'
for name in ['docs/traceability/matrix.csv', 'docs/acceptance/third-party-acceptance-checklist.csv']:
    by_path[name]['sha256'] = digest(root / name)
next_id = max(int(d['id'].split('-')[1]) for d in entries) + 1
for p in proposed:
    assert p['path'] not in by_path
    d = dict(id=f'BIN-{next_id:04}', path=p['path'], state='current', sha256=p['sha256'], items=[])
    next_id += 1
    with zipfile.ZipFile(root / p['path']) as z:
        slides = sorted([n for n in z.namelist() if re.fullmatch(r'ppt/slides/slide\d+\.xml', n)], key=lambda n: int(re.search(r'slide(\d+)', n)[1]))
        for sn, name in enumerate(slides, 1):
            for j, paragraph in enumerate(ET.fromstring(z.read(name)).findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}p'), 1):
                text = ''.join(paragraph.itertext())
                if text.strip():
                    d['items'].append(dict(id=f'{d["id"]}-SL-{sn:03}-ITEM-{j:04}', slide=sn, contentSha256=hashlib.sha256(text.encode()).hexdigest()))
    entries.append(d)
assert all(next(d['id'] for d in entries if d['path'] == p) == v for p, v in old_ids.items())
write(base / 'binary-documents.json', binary)
write(report / 'root-adoption.json', dict(status='ADOPTED', date='2026-11-07', registrySha256=lock, decks=12, slides=160, oldBinaryIdsPreserved=True, customerPassed=0, productionStarted=False))
print(json.dumps(dict(adoptedDecks=12, slides=160, binaryDocuments=len(entries))))
