const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'docs/acceptance');
const read=f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const pointer=read('hosted-latest.json'),rel=`hosted-runs/${pointer.runId}`,run=read(`${rel}/results.json`);
assert.equal(hash(path.join(dir,rel,'results.json')),pointer.resultsSha256);
assert.equal(run.results.length,23,'Final report requires all23 cases');
const env=read('deployment/firebase-environment.json'),build=read('deployment/build-manifest.json'),pub=read('deployment/public-verification.json'),deploy=read('deployment/firebase-deploy.json');
const version=deploy.result.hosting.split('/').at(-1),release=build.release;
const table=(h,rs)=>`| ${h.join(' | ')} |\n| ${h.map(()=> '---').join(' | ')} |\n${rs.map(r=>`| ${r.map(v=>String(v).replace(/\|/g,'／').replace(/\n/g,'<br>')).join(' | ')} |`).join('\n')}\n`;
const write=(f,t,b)=>fs.writeFileSync(path.join(dir,f),`# ${t}\n\n文書版: 2026-10-20 / マイティのテスト公開版。\n\n${b}\n`);
const atlinks=ids=>ids.map(id=>`[${id}](06_ACCEPTANCE_TEST_SPEC.md#${id})`).join(', ');
const shots=run.results.reduce((n,r)=>n+r.screenshots.length,0);
write('13_MIGHTY_TEST_DEPLOYMENT.md','テスト環境・権限・デプロイ記録（DEP-01）',
 `公開URL: [マイティ送迎テスト環境](${run.url})。公開版ID: **${version}**。\n\n`+
 table(['確認ID','項目','実測'],[
 ['ENV-01','組織','ml-mightylink.com / organizations/943535207512'],['ENV-02','プロジェクト','eigo-taxi-app / 753038429305 / ACTIVE'],['ENV-03','操作アカウント',env.account],['ENV-04','アクセス権限',env.required.join(', ')],['DEP-01','公開先','Firebase Hosting target mighty-test → eigo-taxi-test'],['DEP-02','版・構成','サイト限定デプロイ。default site eigo-taxi-appは公開履歴なし。'],['DEP-03','配信照合',`${pub.results.length} URLのHTTP200・SHA-256一致`],['DEP-04','修正ソース識別',release.sourceDigest],['DEP-05','ビルド時刻UTC',release.builtAt],['DEP-06','基点コミット',`${release.baseCommit}。修正は作業ツリーにあり、このコミットだけでは配信版を再現できない。保存済みソースを使う。`],
 ])+
 '\nCloud Resource ManagerとFirebase APIの会社アカウント認証で組織・プロジェクト・必要権限を照合し、同アカウントで実際の公開にも成功した。先行調査のgcloud認証ではアクセス拒否だったが、Firebase CLIの認証で確認できた。gcloudの設定変更は行っていない。\n\n'+
 `[権限・公開履歴の検証JSON](deployment/firebase-environment.json) / [作成前の記録](deployment/firebase-environment-before.json) / [デプロイ応答](deployment/firebase-deploy.json) / [配信照合](deployment/public-verification.json) / [ビルド・ソース一覧](deployment/build-manifest.json)。\n\n`+
 `版ごとのソース・配信ファイル・検証結果は[今回の保存版](deployment/releases/${version}/build-manifest.json)と前版54b056d14d7a5630に保存。切戻し対象は同じテストサイトの前版。Firebase Hostingのリリース履歴から前版へ戻し、配信ハッシュと画面を再確認する。実際の切戻し操作は未実施。\n\n`+
 'この公開はフロントエンドのテスト環境。GAS・専用シート・専用カレンダー・個人キーの実接続設定は未完了。実データでの運用開始条件は満たしていない。新規VMや本番サイトは作成していない。');
write('14_HOSTED_TEST_SPEC.md','公開環境の追加受入テスト仕様（DOC-PUB-SPEC-001）',
 `対象: ${run.url}。隔離Chromium ${run.browser}。実際に配信されたJS/CSSと画面のフォーム・ボタンを使用する。合成データのデモ操作とブラウザ内模擬APIを区別する。Google実資源・実顧客データは使わない。各ケースは新規ブラウザコンテキストで実施。\n\n[実行コード](../../scripts/run_hosted_acceptance.cjs)。再実施: node scripts/run_hosted_acceptance.cjs --url ${run.url}\n\n`+
 table(['公開テストID','対象操作・確認','関連受入ID','方式・合格基準'],run.results.map(r=>[r.id,r.title,atlinks(r.acceptanceIds),`${r.mode} / ${r.scope}`]))+
 '\n既存ATの全要件をこの画面試験だけで合格へ変更しない。直接API、実GAS排他、Google連携、実端末はそれぞれ専用試験が必要。');
write('15_HOSTED_TEST_RESULTS.md','公開環境・画面キャプチャ付き受入結果（DOC-PUB-RESULT-001）',
 `公開版 **${version}**、実行UTC ${run.startedAt}〜${run.finishedAt}（日本時間は+9時間）。**PASS ${run.summary.pass} / FAIL ${run.summary.fail} / 未実施 ${run.summary.notRun}、全${run.summary.total}件、画面${shots}枚**。\n\n`+
 `[不変の結果JSON](${rel}/results.json) / [実行時テストコード](${rel}/runner.cjs) / [配信版・権限](13_MIGHTY_TEST_DEPLOYMENT.md)。\n\n`+
 'デモデータでの公開画面操作、およびブラウザ内に限定した通信障害の模擬試験。実Google連携の成功を意味しない。\n\n'+
 table(['配信資産','HTTP','SHA-256'],run.servedAssets.map(a=>[a.url,a.status,a.sha256]))+'\n'+
 run.results.map(r=>`<a id="${r.id}"></a>\n## ${r.id}: ${r.title} — ${r.status}\n\n関連: ${atlinks(r.acceptanceIds)} / [仕様](14_HOSTED_TEST_SPEC.md)。\n\n範囲: ${r.scope}。方式: ${r.mode}。\n\n実測: ${r.detail}\n\n${r.screenshots.map(s=>`![${r.id} ${s.file}](${rel}/${s.file})\n\nSHA-256: ${s.sha256}`).join('\n\n')}`).join('\n\n')+
 '\n\n## 残課題・リリース条件\n\n'+
 table(['関連受入','未確認範囲'],run.residuals.map(r=>[atlinks(r.acceptanceIds),r.reason]))+
 '\n必要な対応: 専用Google Sheets/CalendarとGASを用意し認証・家庭別割当を設定 → 実接続と複数セッション・バックアップ復元のAT-23〜28 → 実iPhone/Androidと担当者受入AT-29 → 業務基準・運用窓口を合意 → 本番公開後AT-30。テストサイト公開済み、業務運用のリリース判定は保留。');
const links='[テスト環境・公開版](13_MIGHTY_TEST_DEPLOYMENT.md) / [公開テスト仕様](14_HOSTED_TEST_SPEC.md) / [画面付き公開テスト結果](15_HOSTED_TEST_RESULTS.md)';
for(const f of ['README.md','08_ACCEPTANCE_RESULTS.md','09_RELEASE_AND_DELIVERABLES.md','10_DEFECTS_AND_VALIDATION.md']){
 const file=path.join(dir,f);let text=fs.readFileSync(file,'utf8');
 text=text.replace('現時点ではマイティ環境・本番・Google資源は変更していない。','マイティのフロントエンドテストサイトへ公開済み。Google実資源と本番は未変更。');
 text=text.replace('外部公開・GASデプロイは未実施。','フロントエンドはテスト環境へ公開済み。GASデプロイと実接続受入は未実施。');
 fs.writeFileSync(file,text+`\n\n公開試験の最新状態: ${links}。公開画面${run.summary.pass}/${run.summary.total}件合格・証跡${shots}枚。ローカルATと実Google試験とは別集計。\n`);
}
const matrixFile=path.join(dir,'07_TRACEABILITY_MATRIX.md');
fs.appendFileSync(matrixFile,'\n\n## 公開試験との相互参照\n\n'+table(['受入ID（上表のBF/UC/REQ/FS/TASK/CODE/TESTへ接続）','公開テスト・結果'],run.coverage.map(c=>[atlinks([c.id]),c.publicCases.map(p=>`[${p.id}](15_HOSTED_TEST_RESULTS.md#${p.id}): ${p.status}`).join(', ')||'公開画面試験の対象外。既存ATの結果・未実施理由を参照。'])));
const traceFile=path.join(dir,'traceability.json');const trace=JSON.parse(fs.readFileSync(traceFile));
for(const row of trace)row.hostedTests=run.results.filter(r=>r.acceptanceIds.includes(row.id)).map(r=>({id:r.id,status:r.status,runId:run.runId}));
fs.writeFileSync(traceFile,JSON.stringify(trace,null,2));
const rootReadme=path.join(root,'README.md');let rt=fs.readFileSync(rootReadme,'utf8');
if(!rt.includes('<!-- mighty-test -->'))rt+=`\n\n<!-- mighty-test -->\nマイティの[テスト環境](${run.url})を公開済み。実Google連携は未設定。[公開試験と残課題](docs/acceptance/15_HOSTED_TEST_RESULTS.md)。\n`;
fs.writeFileSync(rootReadme,rt);
const reqFile=path.join(dir,'03_REQUIREMENTS.md');
fs.writeFileSync(reqFile,fs.readFileSync(reqFile,'utf8').replace(/- DEC-07[^\n]*/, '- DEC-07 確認済み: 組織ml-mightylink.com / GCP eigo-taxi-app / 会社アカウントのHosting権限を確認しテストサイト公開済み。課金管理・実Google接続資源・運用担当の確認は残る。詳細: [環境台帳](13_MIGHTY_TEST_DEPLOYMENT.md)。REQ-23〜REQ-30。'));
const releaseFile=path.join(dir,'09_RELEASE_AND_DELIVERABLES.md');
fs.writeFileSync(releaseFile,fs.readFileSync(releaseFile,'utf8').replace('再認証と環境準備待ち','プロジェクト・組織・Hosting権限・テスト公開は確認済み。専用GAS/Sheets/Calendar接続は準備待ち'));
const historical=path.join(dir,'12_DEPLOYMENT_VERIFICATION.md');
let old=fs.readFileSync(historical,'utf8');if(!old.includes('後続検証'))fs.appendFileSync(historical,'\n\n後続検証: この文書は当時の未公開状態の記録。会社アカウントのFirebase認証で権限を確認し、テストサイトへ公開済み。[最新の環境・デプロイ記録](13_MIGHTY_TEST_DEPLOYMENT.md)を参照。\n');
console.log(`Hosted report generated: ${run.summary.pass}/${run.summary.total}, screenshots=${shots}, version=${version}`);
