from pathlib import Path
import re

base=Path('outputs/async-customer-ppt-20261107-v33')
previous=Path('outputs/customer-prep-ppt-20261107-v32')
script=(previous/'build.mjs').read_text(encoding='utf8')
script=script.replace('outputs/customer-prep-ppt-20261107-v32/finalized','outputs/async-customer-ppt-20261107-v33/finalized')
start=script.index("assert(process.argv[2]===regSha")
end=script.index("const manifestBytes=",start)
script=script[:start]+'''const freeze=JSON.parse(await fs.readFile('outputs/async-customer-ppt-20261107-v33/freeze.json','utf8'));
assert(freeze.status==='ROOT_LOCK'&&process.argv[2]===regSha&&freeze.registrySha256===regSha&&freeze.registryVersion===reg.version&&reg.version==='2026-11-07-r17','Root r17 LOCK is required; preparation must not export');
assert(reg.facts.customerAcceptancePassed===0&&reg.facts.customerAcceptanceTotal===6&&reg.facts.release==='HOLD','Acceptance boundary mismatch');
assert(Array.isArray(freeze.evidenceFiles)&&freeze.evidenceFiles.length>0,'Evidence files must be frozen');
for(const item of freeze.evidenceFiles)assert(sha(await fs.readFile(item.path))===item.sha256,'Frozen evidence changed: '+item.path);
for(const text of [freeze.observationSummary,freeze.frontendStatus,freeze.customerStatus,freeze.contentReview])assert(typeof text==='string'&&text.length>0&&!/[\\w.+-]+@[\\w.-]+\\.[A-Za-z]{2,}|https:\\/\\/(?:docs|script|calendar)\\.google\\.com|#\\/parent\\/[0-9a-f-]{30,}/.test(text),'Unsafe or empty frozen summary');
'''+script[end:]
start=script.index("const current=")
end=script.index("await fs.mkdir(base",start)
script=script[:start]+'''const current='【2026-11-07 r17 現行状態】'+freeze.observationSummary;
const dev='【検証範囲】同一のGoogle本人を検証専用reviewerとして登録し、家庭用と管理者用の固定2URLを使う。管理者用も指定した架空生徒1名だけを扱い、通常の管理者・保護者の権限を維持する。検証用管理者ではアカウント管理・Google連携設定・個別URL一覧・新規生徒登録を利用できない。サーバー側の検証台帳ゲートと生徒の権限制御を必須とし、画面側もallowlistで制限する。ローカル合成認証/GAS応答での31契約試験・8UI試験は実Googleログインや顧客確認の合格ではない。';
const policy='【顧客確認の現行手順】CUST-01〜06は未実施0/6、全体HOLD・本番未開始。準備完了の案内後は本人が都合のよい時に同じGoogleアカウントと2つの固定URLで進め、実施中に開発者が役割を変える作業は発生しない。通常のログアウト・ログインで画面を移る。完了用の片道・往復2予約は固定日付で用意し、日付が過ぎてもA03の全送迎スケジュール一覧で完了する。初期5枚、片道後4枚、往復後2枚、10枚追加後12枚を再取得して照合し、共有表に実施済みの手順と残数を記録して途中再開する。完了済みの予約や追加済み10枚は繰り返さない。値が異なる場合は再送せず通常の問い合わせとして要確認で止める。旧案の開発者による役割切替と実施日確定後の当日準備は不採用。旧本文・旧ノートは当時の履歴で、現行の手順はこの注記、末尾2図および現行正本を参照する。原AT-01〜30は開発側の技術検証として維持する。';
const evidence='根拠: '+freeze.evidenceFiles.map(x=>x.path).join('; ')+'。私的メール・Calendar ID・家庭個別URLは本資料へ収録しない。公開フロントのデモ検査、実Googleの開発側検査、顧客確認を区別し、証跡のない項目を合格にしない。';
const replaceA=[
 ['検証サイトへ反映し、小画面の登録を確認','同じGoogleで2つの検証画面を使えます'],
 ['11月7日：反映後の公開デモで、同じ4条件を再確認','検証専用アカウントで、指定した架空生徒1名だけを操作'],
 ['修正を反映','同じGoogle'],['検証サイトのみ','本人がログイン'],['公開デモで操作','2つの固定URL'],['管理者・保護者 × 2画面','家庭用・管理者用'],['結果を確認','架空生徒1名だけ'],['4件 FAIL → 4件 PASS','通常の生徒には触れません'],
 ['公開6ファイル＋ルートURLの7応答が一致','開始前の準備後は、開発者の役割切替は不要'],
 ['縦にスクロールして登録。再読込・ログアウトも確認。','通常の管理者・保護者の権限を維持。\\n検証専用の登録で分けます。'],
 ['公開フロントエンドのデモ経路です。実Google・実機・顧客確認の合格とは別です。','検証用管理者は、アカウント管理・教室設定・新規生徒登録を使えません。'],
 ['GASは編集headへ保存済み・Webアプリ未配備。GoogleのCalendar同意は未了。本番未開始。',freeze.frontendStatus],
];
const replaceB=[
 ['小林さんには日常操作6件をご確認いただきます','日付に依存せず、途中から再開できます'],['技術試験30件は開発側で継続','同じ生徒・予約・残数を再取得して照合'],
 ['CUST-01　本人ログイン','開始時は残数5枚'],['自分の家庭だけ／残数5枚','家庭用で予約・取消を確認'],['CUST-02　1回分を予約','片道を1件完了'],['カレンダーと一致／残数5枚','全スケジュールで 5→4枚'],['CUST-03　予約を取消','往復を1件完了'],['両画面から消える／残数5枚','同じ一覧から 4→2枚'],['CUST-04　完了を登録','残り2枚の案内'],['片道 5→4／往復 4→2','家庭用で連絡案内を確認'],['CUST-05　残少・追加','10枚を1回だけ追加'],['連絡案内を確認／10枚追加で12枚','管理者用で 2→12枚'],['CUST-06　ログアウト','両画面でログアウト'],['保護者・管理者とも台帳が非表示','再読込後に台帳が非表示'],
 ['架空データを開発側が準備。実際の送迎・支払いは発生しません。','記録した残数 5・4・2・12 を照合し、未実施の操作だけを進めます。'],
 ['旧「第三者30件」は現在の完了条件から外しました。過去の実績は履歴として保持します。',freeze.customerStatus],
];
'''+script[end:]
script=script.replace("'2026-11-07 r16追補'","'2026-11-07 r17追補'")
script=script.replace('-2026-11-07-v32.pptx','-2026-11-07-v33.pptx')
script=script.replace("customerPolicySha256:sha(Buffer.from(customerDoc)),records","customerPolicySha256:sha(Buffer.from(customerDoc)),freezeSha256:sha(await fs.readFile('outputs/async-customer-ppt-20261107-v33/freeze.json')),records")
(base/'build.mjs').write_text(script,encoding='utf8')

review=(previous/'review-and-propose.py').read_text(encoding='utf8')
review=review.replace('outputs/customer-prep-ppt-20261107-v32/finalized','outputs/async-customer-ppt-20261107-v33/finalized')
review=review.replace("lock='f2d307b7a61cfcbf13cc48221cd58ca73c910b499b30a1ed46f7e163773e36fd'","freeze=json.loads((root/'outputs/async-customer-ppt-20261107-v33/freeze.json').read_text(encoding='utf8'));assert freeze['status']=='ROOT_LOCK';lock=freeze['registrySha256'];assert data['freezeSha256']==sha((root/'outputs/async-customer-ppt-20261107-v33/freeze.json').read_bytes())")
review=review.replace("'2026-11-07-r16'","'2026-11-07-r17'")
review=review.replace('ppt-customer-readiness-20261107','ppt-async-customer-20261107')
review=review.replace("['0/6','GAS v4→v5','通信エラー','本人初回ログインは未確認','P→A→P→A→P']","['0/6','検証専用reviewer','2つの固定URL','5枚、片道後4枚、往復後2枚','実施中に開発者が役割を変える作業は発生しない']")
start=review.index("'limits':[")
end=review.index("]}",start)+2
review=review[:start]+"'limits':['The diagrams describe a single restricted reviewer identity using two fixed URLs; no developer role switching during the customer steps.','Frozen observation status: '+freeze['observationSummary'],'Customer CUST01-06 remain 0/6 and all release HOLD; developer local tests do not imply live Google or customer acceptance.','Old v31 body and notes are historical; v32 was not adopted.','Existing business warning21 preserved, no new layout warning; native PowerPoint not verified; current manifest/README/binaries not modified']}"+review[end:]
review=review.replace('-2026-11-07-v32.pptx','-2026-11-07-v33.pptx')
review=re.sub(r"contentReview='r16：[^']*'","contentReview=freeze['contentReview']",review)
(base/'review-and-propose.py').write_text(review,encoding='utf8')
print('Prepared build and review scripts only. No PPT exported; ROOT LOCK remains required.')
