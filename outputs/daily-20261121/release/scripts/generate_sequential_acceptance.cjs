// LEGACY_TRACEABILITY_GUARD: historical generator superseded by registry.
throw new Error('Use npm run docs:generate. This legacy generator would overwrite current traceability documents.');
const fs=require('node:fs'),path=require('node:path');
const {cases}=require('./acceptance-catalog.cjs');
const dir=path.resolve(__dirname,'../docs/acceptance');
const read=f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
const localId=read('latest-run.json').runId,local=read(`runs/${localId}/results.json`);
const pubId=read('hosted-latest.json').runId,pub=read(`hosted-runs/${pubId}/results.json`);
for(let i=1;i<local.results.length;i++)if(local.results[i].startedAt<local.results[i-1].finishedAt)throw Error('Cases overlapped');
const blockers={
 'AT-23':'専用Googleスプレッドシート・GASの配備と認証設定が未完了。',
 'AT-24':'専用カレンダー・GASの接続とAT-23の合格が必要。',
 'AT-25':'AT-24で実際に生成した予約・カレンダー予定が必要。',
 'AT-26':'実GAS接続、管理者2名・保護者の個別キー、独立3セッションが必要。',
 'AT-27':'実GAS接続、同一予約にアクセスする独立管理者2セッションが必要。',
 'AT-28':'実データ保存先、バックアップ先、復旧担当・手順を確定する必要がある。',
 'AT-29':'実iPhone Safari・Android Chrome、および受入担当者の確認が必要。',
 'AT-30':'全必須項目の合格、担当者の受入確認、本番公開の実施が必要。今回のテスト公開だけでは未充足。'
};
const records=cases.map(c=>({...c,...local.results.find(r=>r.id===c.id),blockingReason:blockers[c.id]||null,localRunId:localId,hostedRunId:pubId,hostedTests:pub.results.filter(r=>r.acceptanceIds.includes(c.id)).map(r=>({id:r.id,status:r.status}))}));
fs.writeFileSync(path.join(dir,'sequential-results.json'),JSON.stringify({generatedAt:new Date().toISOString(),releaseDecision:'HOLD',localRunId:localId,hostedRunId:pubId,records},null,2));
const rows=records.map(r=>`| ${r.id} | ${r.title} | ${r.status} | ${r.startedAt} | ${r.finishedAt} | ${r.blockingReason||'期待値をassertで確認。合成データ・ローカルサービス試験。'} |`).join('\n');
fs.writeFileSync(path.join(dir,'16_SEQUENTIAL_ACCEPTANCE.md'),`# 項目別の受入実施記録\n\n実施日: 2026-10-20 JST。時刻欄はUTC（JSTは+9時間）。AT-01〜30を仕様順に1件ずつ処理し、実行可能22件を再試験した。未実施8件は前提条件を確認してBLOCKEDを記録し、実操作はしていない。\n\n| ID | 項目 | 結果 | 開始UTC | 終了UTC | 範囲・未実施理由 |\n| --- | --- | --- | --- | --- | --- |\n${rows}\n\n[個別の手順・期待結果](06_ACCEPTANCE_TEST_SPEC.md) / [ローカル画面証跡](08_ACCEPTANCE_RESULTS.md) / [今回の公開画面証跡](15_HOSTED_TEST_RESULTS.md) / [機械可読の項目別記録](sequential-results.json)。\n\n公開追加試験: ${pub.summary.pass}/${pub.summary.total}合格。公開試験も独立ケースで順次実施した。実Google資源への更新は未実施。全項目の完了条件は満たしておらず、リリース通知の判断は保留。\n`);
console.log(`Sequential record: ${localId} / hosted ${pubId}`);
const index=path.join(dir,'README.md');
fs.appendFileSync(path.join(dir,'16_SEQUENTIAL_ACCEPTANCE.md'),'\n\n入力差異 DVT-01（AT-07）: 元の手順例は17:30、今回の自動実行は16:30。送り種別・予約件数・残高のassertは合格したが、17:30を入力した実行証跡は含まない。PowerPointにも実際の16:30入力を記載し、元の入力時刻どおりの実施とは区別する。\n');
if(!fs.readFileSync(index,'utf8').includes('16_SEQUENTIAL_ACCEPTANCE.md'))fs.appendFileSync(index,'\n\n[項目別の順次実施記録](16_SEQUENTIAL_ACCEPTANCE.md)。\n');
const pptName=fs.existsSync(path.resolve(dir,'../../deliverables/eigo-taxi-acceptance-2026-10-20-v2.pptx'))?'eigo-taxi-acceptance-2026-10-20-v2.pptx':'eigo-taxi-acceptance-2026-10-20.pptx';
const ppt=path.resolve(dir,'../../deliverables',pptName);
if(fs.existsSync(ppt)){
 const link=`[手順・画面付きPowerPoint（143ページ）](../../deliverables/${pptName})`;
 fs.appendFileSync(path.join(dir,'16_SEQUENTIAL_ACCEPTANCE.md'),`\n\n${link}。69枚の元証跡と設定画面の拡大表示を収録。AT索引・公開試験索引・追跡ID・実測JSONはスライド本文およびノートで参照できる。\n`);
 let indexText=fs.readFileSync(index,'utf8').replace(/eigo-taxi-acceptance-2026-10-20(?:-v2)?\.pptx/g,pptName);
 if(!indexText.includes(pptName))indexText+=`\n\n${link}。\n`;
 fs.writeFileSync(index,indexText);
}
