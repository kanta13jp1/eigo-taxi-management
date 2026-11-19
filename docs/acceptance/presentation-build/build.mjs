import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { Presentation, PresentationFile } from '@oai/artifact-tool';
const require=createRequire(import.meta.url);
const ROOT='C:/Users/kanta/GitHub/eigo-taxi-management';
const BUILD=path.join(ROOT,'docs/acceptance/presentation-build');
const SKILL='C:/Users/kanta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1017.11052/skills/presentations';
process.env.RUNTIME_NODE_MODULES='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const PY='C:/Users/kanta/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const read=async f=>JSON.parse(await fs.readFile(f,'utf8'));
const localId=process.env.LOCAL_RUN||(await read(path.join(ROOT,'docs/acceptance/latest-run.json'))).runId;
const hostedId=process.env.HOSTED_RUN||(await read(path.join(ROOT,'docs/acceptance/hosted-latest.json'))).runId;
const localDir=path.join(ROOT,'docs/acceptance/runs',localId), hostedDir=path.join(ROOT,'docs/acceptance/hosted-runs',hostedId);
const local=await read(path.join(localDir,'results.json')), hosted=await read(path.join(hostedDir,'results.json')), gas=await read(path.join(ROOT,'docs/acceptance/service-checks/latest.json'));
const {cases}=require(path.join(ROOT,'scripts/acceptance-catalog.cjs'));
const steps=await read(path.join(BUILD,'case-steps.json'));
const localSource=await fs.readFile(path.join(ROOT,'scripts/run_acceptance.cjs'),'utf8');
const hostedSource=await fs.readFile(path.join(hostedDir,'runner.cjs'),'utf8');
const p=Presentation.create({slideSize:{width:1600,height:900}});
const font='Yu Gothic'; const index=[]; const slideMap=[];
function txt(s,text,x,y,w,h,size=30,color='#172B4D',bold=false){let a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=text;a.text.style={typeface:font,fontSize:size,color,bold};return a;}
function slide(title,notes='',label='受入テスト記録'){let s=p.slides.add();s.background.fill='#FFFFFF';txt(s,title,65,48,1470,100,44,'#12334C',true);txt(s,`${label}　　${p.slides.items.length}`,65,845,1470,34,20,'#526477');s.speakerNotes.text=notes;slideMap.push({slideNo:p.slides.items.length,title,type:label});return s;}
function lines(s,arr,y=170,size=30){let top=y;for(let a of arr){const count=Math.max(1,Math.ceil(a.length/(size===30?45:58)));let h=Math.max(60,count*(size+12));txt(s,a,70,top,1450,h,size);top+=h+17;}return top;}
function trace(c){return [c.bf,c.uc,c.req,c.fs,c.task,c.code,c.test,c.id].join(' / ');}
function actual(r){if(r.status!=='PASS')return '未実施。実サービスの操作結果・画面証跡なし。';if(r.id==='AT-01')return '自動assertで保存直後と再読込後のURL=https://test.invalid/execを確認。';return '自動assert確認: '+cases.find(c=>c.id===r.id).expected+'。詳細な保存状態JSONはノートに収録。';}
const overview=slide('英語教室送迎管理　受入テスト結果',`Sources: ${localDir}/results.json\n${hostedDir}/results.json\n${gas.reportFile}`);
lines(overview,['2026年10月20日　マイティ テスト公開版','受入30件: 自動assert合格22 / FAIL 0 / BLOCKED 8','公開UI追加試験23件: PASS 23 / GAS模擬試験38件: PASS 38','実Google連携・実機・本番受入は未完了。リリース通知は保留。'],210,36);
let s=slide('対象環境と結果の読み方');lines(s,['公開URL: https://eigo-taxi-test.web.app/','公開版: deed2fc3d9a96297。テスト用フロントエンド。','ローカル: 配信ビルド画面 + ソースAPIの直接assert。デモ台帳・模擬API。','公開UI: 配信済み画面のフォームとボタンを操作。デモと模擬HTTPS。','GAS: Node VMでGoogleサービスをスタブ化。実Googleの証明には使わない。','画面にある氏名・住所・電話は合成データ。実顧客データは使用していない。'],160,28);
s=slide('実行識別子と再実施条件');lines(s,[`ローカル run: ${localId}`,`公開UI run: ${hostedId}`,`GAS実行UTC: ${gas.executedAt}`,'全ケースはID順に実行。各ATの日時はUTC表記。日本時間はUTC+9時間。','ローカル再実施: node scripts/run_acceptance.cjs','公開再実施: node scripts/run_hosted_acceptance.cjs --url https://eigo-taxi-test.web.app/','ソースdigest: 14159ecc8b8a28e5618b802cad65d64778c63c22ab2b8db5417475e926081c35'],160,26);
s=slide('ローカル試験の共通準備と証跡');lines(s,['1. テストごとにLocalStorageとSessionStorageを消去し、再読込。','2. 指定の管理者デモ／保護者デモを明示して開く（AT-19は未認証）。','3. 初期デモ: STU-001残高7。RIDE-101等の架空予約。購入履歴を準備。','4. 共通API予約: STU-001、2026-10-20 16:30、場所=受入テスト専用住所。','5. 「API」はブラウザ内でApiServiceを直接呼ぶ操作。「UI」は画面操作。','6. 期待値は自動assertで照合。スクリーンショットだけでAPI内部状態を証明しない。'],160,28);
const indexSlides=[];for(let i=0;i<3;i++)indexSlides.push(slide(`受入ケース索引 ${i+1}/3`));
async function screenshotSlide(title,file,meta,notes,caption){const q=slide(title,notes,'合成データの実キャプチャ');const bytes=await fs.readFile(file);q.images.add({blob:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),contentType:'image/png',alt:title,fit:'contain',position:{left:70,top:150,width:1460,height:600}});txt(q,caption,70,755,1460,60,22);txt(q,meta,70,815,1460,25,16,'#526477');slideMap.at(-1).sourceScreenshot=file;slideMap.at(-1).sha256=notes.match(/Screenshot SHA256: (\w+)/)?.[1];return q;}
for(let i=0;i<cases.length;i++){
 const c=cases[i], r=local.results.find(x=>x.id===c.id), related=hosted.results.filter(x=>x.acceptanceIds.includes(c.id));
 const first=p.slides.items.length+1;
 const notes=`${trace(c)}\n実装: ${c.file} ${c.symbol}\n前提: ${c.pre}\nカタログ操作: ${c.steps}\n詳細手順:\n${steps[i].map((x,j)=>(j+1)+'. '+x).join('\n')}\n期待: ${c.expected}\n状態: ${r.status}\n実測JSON:\n${JSON.stringify(r,null,2)}\n公開UI関連: ${related.map(x=>x.id).join(',')}\nソース: ${localDir}/results.json\n実行器: scripts/run_acceptance.cjs\n${localSource.substring(localSource.indexOf(` '${c.id}':`),localSource.indexOf(` '${cases[i+1]?.id}':`)>=0?localSource.indexOf(` '${cases[i+1]?.id}':`):undefined)}`;
 s=slide(`${c.id}　${c.title}`,notes);lines(s,[`判定: ${r.status}　${c.kind==='external'?'実サービス未実施':'ローカルの自動assert'}`,`前提: ${c.pre}`,`期待: ${c.expected}`,`実測: ${actual(r)}`,`日時UTC: ${r.startedAt||'なし'} ～ ${r.finishedAt||'なし'}`,`関連公開UI: ${related.length?related.map(x=>x.id).join(', '):'なし'}。画面試験の範囲を超えて合格扱いしない。`],155,27);
 s=slide(`${c.id}　${c.kind==='external'?'準備待ちの実施手順':'再現手順と入力値'}`,notes);lines(s,steps[i].map((x,j)=>`${j+1}. ${x}`),155,28);
 if(c.id==='AT-07'){txt(s,'入力差異: 仕様17:30に対し実行16:30。種別・件数・残高assertはPASS。17:30は未確認。',70,760,1450,64,24,'#9A4D00');}
 if(c.kind==='external'){txt(s,`不足条件: ${c.pre}。実行結果・スクリーンショットは未取得。`,70,735,1450,85,27,'#9A4D00');}
 for(const shot of r.screenshots){await screenshotSlide(`${c.id}　${shot.file}`,path.join(localDir,shot.file),`UTC ${r.startedAt}　${shot.file}`,notes+`\nScreenshot SHA256: ${shot.sha256}`,`判定 ${r.status}。${c.id === 'AT-01' ? actual(r) : c.expected}`);}
 if(c.id==='AT-01'){const z=slide('AT-01　保存したURLの拡大',notes,'原本キャプチャの部分拡大');const b=await fs.readFile(path.join(localDir,'AT-01.png'));z.images.add({blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:'image/png',alt:'Google設定のURL入力と保存ボタン',fit:'contain',crop:{left:.2,right:.2,top:.10,bottom:.66},position:{left:100,top:170,width:1400,height:500}});txt(z,'保存値 https://test.invalid/exec。再読込後の同値はAPI assertで照合。',80,735,1440,65,28);}
 index.push({id:c.id,title:c.title,status:r.status,first,last:p.slides.items.length,trace:trace(c),related:related.map(x=>x.id)});
}
for(let j=0;j<3;j++){index.slice(j*10,j*10+10).forEach((x,k)=>txt(indexSlides[j],`${x.id}　${x.title}　${x.status}　p.${x.first}–${x.last}`,70,155+k*65,1450,57,25));}
s=slide('公開画面からの追加確認');lines(s,['続くPUB-01〜23は、公開URLで実際に配信した画面を操作した証跡。','保存状態は読み取りで照合。外部のGoogle資源へ更新は送っていない。','PUB-22/23はブラウザで模擬したHTTPS応答。実サーバ障害ではない。','対応AT、時刻、方式、観測JSON、画面SHA-256を各スライドのノートに記録。','AT-23〜30のBLOCKEDは、公開画面のPASSでも解除されない。'],160,30);
const pubIndexSlides=[slide('公開UI証跡の索引 1/2'),slide('公開UI証跡の索引 2/2')];const pubIndex=[];
for(const r of hosted.results){
 const first=p.slides.items.length+1;
 const notes=`Source: ${hostedDir}/results.json\nRelated AT: ${r.acceptanceIds.join(', ')}\n${JSON.stringify(r,null,2)}\nExact runner: ${hostedDir}/runner.cjs\n${hostedSource}`;
 for(const shot of r.screenshots){await screenshotSlide(`${r.id}　${r.title}`,path.join(hostedDir,shot.file),`UTC ${shot.capturedAt}　${shot.file}`,notes+`\nScreenshot SHA256: ${shot.sha256}`,`PASS　関連 ${r.acceptanceIds.join(', ')}。${r.mode==='hosted-ui-with-mocked-https'?'模擬HTTPS応答を使う公開UI試験。':'合成データによる公開UI試験。'} ${r.title}`);}
 pubIndex.push({id:r.id,acceptanceIds:r.acceptanceIds,first,last:p.slides.items.length});
}
pubIndex.forEach((x,i)=>txt(pubIndexSlides[Math.floor(i/12)],`${x.id}　関連 ${x.acceptanceIds.join(', ')}　p.${x.first}–${x.last}`,70,145+(i%12)*54,1450,48,25));
s=slide('GASの補助回帰試験');lines(s,[`結果: ${gas.counts.passed}/${gas.counts.total} PASS。実行UTC ${gas.executedAt}`,'Node VMでSpreadsheet・Calendar・Lockをスタブ化。ネットワーク呼出なし。','認証、家庭別権限、完了処理、入力値、再試行、障害補償を確認。','ロック競合は模擬。実GASの同時実行、権限、端末間同期は未検証。','全38件の結果・対応AT・所要時間はこのスライドのノートに収録。'],160,30);s.speakerNotes.text=JSON.stringify(gas,null,2);
s=slide('残り8件とリリース判断');lines(s,['AT-23〜25: 専用Googleシート・GAS・カレンダーと実権限の準備。','AT-26〜27: 管理者2名・保護者の独立端末と実GASで共有・同時完了確認。','AT-28: 保存先と復旧担当者を決め、バックアップ復元を実施。','AT-29: iPhone Safari / Android Chromeで担当者が受入確認。','AT-30: 全必須合格と承認後に本番スモークを実施。','現在は全件完了ではないため通知保留。条件を満たした後、利用者自身が通知。'],160,28);
s=slide('残作業の担当案と実施順');lines(s,['導入担当: 専用GAS・シート・カレンダー・個人キーを準備しAT-23〜25。','管理者A/Bと保護者: AT-26の端末共有、AT-27の同時完了を実施。','運用担当: 専用テスト資源だけを対象にAT-28のバックアップ・復旧。','受入責任者: 実機と担当者を揃えAT-29を記録し、残課題と承認を確認。','リリース担当: 前提合格後に本番版・切戻し先を確定しAT-30を実施。','通知者: 利用者本人。全完了の記録を確認してからリリース通知。'],160,28);
await fs.writeFile(path.join(BUILD,'slide-index.json'),JSON.stringify({localId,hostedId,slides:p.slides.items.length,index,pubIndex,slideMap},null,2));
await fs.writeFile(path.join(BUILD,'evidence-manifest.json'),JSON.stringify({localId,hostedId,gasRun:gas.executedAt,localScreens:local.results.flatMap(r=>r.screenshots).length,hostedScreens:hosted.results.flatMap(r=>r.screenshots).length},null,2));
const candidate=path.join(BUILD,'candidate.pptx');await (await PresentationFile.exportPptx(p)).save(candidate);console.log(`EXPORTED ${p.slides.items.length} slides`);
if(process.env.RENDER!=='0'){await fs.mkdir(path.join(BUILD,'rendered'),{recursive:true});for(let i=0;i<p.slides.items.length;i++){const b=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(path.join(BUILD,'rendered',`slide-${String(i+1).padStart(3,'0')}.png`),new Uint8Array(await b.arrayBuffer()));console.log(`RENDER ${i+1}`);}}
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')));
const final=path.join(ROOT,'deliverables','eigo-taxi-acceptance-2026-10-20-v2.pptx');
await finalizePresentation({workspaceDir:ROOT,candidatePath:candidate,finalPath:final,pythonExecutable:PY,integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','15240000,8572500','--validate-bullet-geometry','--validate-heading-fit'],fontPolicy:{basis:'design',families:[font]},verifyArtifactToolImport:true,receiptPath:path.join(BUILD,'validation-v2.json')});
console.log(`FINAL ${final}`);


