"""Adopt the reviewed v36 packages: copy finals, update the manifest, binary index and README."""
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as E
import hashlib, json, re
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[3]; REPORT = ROOT / 'docs/traceability/reports/ppt-r19-20261111'; OUT = ROOT / 'outputs/r19-adoption-20261111/ppt-v36'
sha = lambda b: hashlib.sha256(b).hexdigest()
def load(p): return json.loads(Path(p).read_text(encoding='utf-8-sig'))
def write(p, o): Path(p).write_text(json.dumps(o, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
review = load(REPORT / 'review.json'); proposal = load(REPORT / 'proposed-presentations.json'); auth = load(REPORT / 'authoring-results.json')
independent = load(REPORT / 'independent-ppt-review.json'); visual = load(REPORT / 'root-visual-review.json')
proposal_sha = sha((REPORT / 'proposed-presentations.json').read_bytes())
assert review['status'].startswith('PASS') and independent.get('result') == 'PASS' and visual.get('result') == 'PASS'
assert independent['proposalSha256'] == proposal_sha == visual['proposalSha256'], 'reviews do not cover this proposal'
lock = sha((ROOT / 'docs/traceability/registry.json').read_bytes())
assert lock == review['registrySha256'] and len(proposal) == 12
manifest = ROOT / 'docs/traceability/presentations.json'; binarypath = ROOT / 'docs/traceability/binary-documents.json'; readme = ROOT / 'docs/deliverables/2026-10-23-traceability/README.md'
assert manifest.read_bytes() == (OUT / 'finalized/source-manifest.json').read_bytes(), 'manifest changed since authoring'
for p in [manifest, binarypath, readme]:
    target = OUT / ('before-adoption-' + p.name)
    if not target.exists(): target.write_bytes(p.read_bytes())
for p in proposal:
    a = next(x for x in auth['records'] if x['id'] == p['id']); source = ROOT / a['final']; target = ROOT / p['path']
    assert sha(source.read_bytes()) == p['sha256'] == a['sha256']
    assert load(ROOT / p['receipt'])['finalSha256'] == p['sha256']
    assert p['registryVersion'] == '2026-11-11-r19' and p['registrySha256'] == lock
    if target.exists(): assert sha(target.read_bytes()) == p['sha256']
    else: target.write_bytes(source.read_bytes())
binary = load(binarypath); entries = binary['documents']; oldids = {d['path']: d['id'] for d in entries}; by = {d['path']: d for d in entries}
# Only the 12 superseded packages change state; every other entry keeps the state it has.
superseded = {m['path'] for m in load(OUT / 'finalized/source-manifest.json')}
assert len(superseded) == 12 and all(by[p]['state'] == 'current' for p in superseded)
states_before = {d['path']: d['state'] for d in entries}
for d in entries:
    if d['path'] in superseded: d['state'] = 'historical'
assert {p for p, s in states_before.items() if by[p]['state'] != s} == superseded
for p in ['docs/traceability/matrix.csv', 'docs/acceptance/third-party-acceptance-checklist.csv']:
    if p in by: by[p]['sha256'] = sha((ROOT / p).read_bytes())
nextid = max(int(d['id'].split('-')[1]) for d in entries) + 1
for p in proposal:
    assert p['path'] not in by
    d = {'id': f'BIN-{nextid:04}', 'path': p['path'], 'state': 'current', 'sha256': p['sha256'], 'items': []}; nextid += 1
    with ZipFile(ROOT / p['path']) as z:
        slides = sorted([n for n in z.namelist() if re.fullmatch(r'ppt/slides/slide\d+\.xml', n)], key=lambda n: int(re.search(r'slide(\d+)', n)[1]))
        for sn, name in enumerate(slides, 1):
            for j, paragraph in enumerate(E.fromstring(z.read(name)).findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}p'), 1):
                text = ''.join(paragraph.itertext())
                if text.strip(): d['items'].append({'id': f'{d["id"]}-SL-{sn:03}-ITEM-{j:04}', 'slide': sn, 'contentSha256': sha(text.encode())})
    entries.append(d)
assert all(next(d['id'] for d in entries if d['path'] == p) == v for p, v in oldids.items())
write(manifest, proposal); write(binarypath, binary)
old = readme.read_text(encoding='utf-8-sig'); titles = ['業務フロー', '要件定義', '設計', 'テスト仕様書', 'タスクリスト', '実装コード対応', 'テストコード対応', '受入テスト仕様書', '運用手順書', 'ユーザーマニュアル', 'トレーサビリティ', '進捗・残課題']
total = sum(p['slides'] for p in proposal)
lines = ['# 現行配布用PowerPoint（共通デザイン）', '',
         f'**2026-11-11：仕様基準を 2026-11-11-r19 へ改版しました。** 12冊をv36にそろえ、各冊の末尾に2頁を追加しました。現行は12冊・{total}頁です。**今回の変更と確認結果は、各冊末尾の2頁を先にご覧ください。**', '',
         '追加した内容は2つです。ログインの入口が合わないときに、保護者用の入口にはご家庭専用URL・QRの案内と管理者専用の入口へのリンクを、管理者用の入口にはご家庭専用URL・QRの案内だけを表示します。サーバーの判定と権限は変えていません。また、実カレンダー連動のAT-24（予約）・AT-25（取消）を、開発担当が検証環境の架空生徒で1回ずつ実施し、完了条件に合う結果を得ました。', '',
         'AT-24・25は管理者による1回の実施で、受入の合格ではありません。保護者からの予約・取消、実機、顧客確認は含みません。既存の頁・ノート・画像は当時の履歴として保持しています。追加の24頁を描画・再取込しました。既存頁は、改版前の資料を同じ描画ツールで同時に描画した結果と全画素一致し、本文・ノートの文字列も一致しました。配置検査の警告件数は改版前と同数です。PowerPointアプリ上の表示は未確認です。顧客確認は **0/6件**、本番開始は保留です。', '',
         '11月10〜11日に別途反映された修正のうち、デモの保存範囲の表示、残少警告の統一、日付の切替は、今回のソース基準のレビュー対象に含みますが、この追補の説明には含めていません。チケット追加の金額入力の変更は、ソース基準の対象外で、今回の独立レビューにも含まれていません。AT-24〜30は引き続き残る実受入です。[継続作業の記録](../../progress/2026-11-11-cumulative-five.md)を参照してください。', '',
         '[修正と受入試験の記録](../../progress/2026-11-10-evening-fix-and-acceptance.md)・[資料保全の検査](../../traceability/reports/ppt-r19-20261111/review.json)・[資料の独立レビュー](../../traceability/reports/ppt-r19-20261111/independent-ppt-review.json)・[描画の目視確認](../../traceability/reports/ppt-r19-20261111/root-visual-review.json)', '',
         '|資料ID|資料|版|頁数|', '|---|---|---:|---:|']
for p, title in zip(proposal, titles): lines.append(f'|{p["id"]}|[{title}]({Path(p["path"]).name})|v36|{p["slides"]}|')
lines += ['', '## 直前の配布一覧（以下は履歴）', '', old]
readme.write_text('\n'.join(lines) + '\n', encoding='utf-8')
write(REPORT / 'adoption.json', {'status': 'ADOPTED', 'adoptedAt': datetime.now(timezone.utc).isoformat(), 'proposalSha256': proposal_sha, 'registryVersion': '2026-11-11-r19', 'registrySha256': lock,
                                 'decks': 12, 'slides': total, 'oldBinaryIdsPreserved': True, 'customerPassed': 0, 'productionStarted': False})
print(json.dumps({'adoptedDecks': 12, 'slides': total, 'binaryDocuments': len(entries), 'registrySha256': lock}))
