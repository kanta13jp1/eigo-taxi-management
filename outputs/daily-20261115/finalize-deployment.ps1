$ErrorActionPreference='Stop'
$out=$PSScriptRoot
$stage=Join-Path $out 'stage'
$repo=(Resolve-Path "$out/../..").Path
$node='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1112-611-0_26.1112.611.0_x64__3k8sg7r9htsxt/dependencies/node/bin/node.exe'
$env:PATH=(Split-Path $node)+';'+$env:PATH
$manifest=Get-Content "$stage/docs/acceptance/deployment/build-manifest.json" -Raw | ConvertFrom-Json -AsHashtable
if($manifest.release.sourceDigest -ne '5f652531b5aea67c7295084e025563b4c32010cd3d4e5791abd0f8b06f65672f'){throw 'Reviewed digest mismatch'}
$inputs=$manifest.sourceHashes
$payloads=$manifest.distHashes
if($inputs.Count -ne 32 -or $payloads.Count -ne 6){throw 'Unexpected stage'}
foreach($group in @($inputs,$payloads)){foreach($f in $group.Keys){if((Get-FileHash -LiteralPath "$stage/$f").Hash -ne $group[$f]){throw "Stage mismatch $f"}}}
$before=Get-Content "$repo/docs/acceptance/deployment/releases/a97d95510290c92b/build-manifest.json" -Raw | ConvertFrom-Json -AsHashtable
foreach($f in $inputs.Keys){if($f -ne 'src/components/AddTicketModal.tsx' -and $inputs[$f] -ne $before.sourceHashes[$f]){throw "Unexpected input $f"}}
if($inputs['src/components/AddTicketModal.tsx'] -ne '23374856AC5CE0B39E5AC1827F5A5F71B1F59F2397756A3F421B919513D184B3' -or $inputs['src/components/AddTicketModal.tsx'] -ne (Get-FileHash "$repo/src/components/AddTicketModal.tsx").Hash){throw 'Source changed'}
Set-Location -LiteralPath $stage
$dir='docs/acceptance/deployment'
$receipt=Get-Content "$dir/firebase-deploy.json" -Raw | ConvertFrom-Json
if($receipt.status -ne 'success'){
  if((Get-Content "$out/auth-status.txt" -Raw) -notmatch 'authenticated company account'){throw 'Awaiting company Google login'}
  & "$env:LOCALAPPDATA/pnpm/firebase.cmd" deploy --project eigo-taxi-app --only hosting:mighty-test --account k-umezawa@ml-mightylink.com --non-interactive --json > "$dir/firebase-deploy.json"
  if($LASTEXITCODE){throw 'Firebase deployment failed'}
  $receipt=Get-Content "$dir/firebase-deploy.json" -Raw | ConvertFrom-Json
}
if($receipt.result.hosting -notmatch '^projects/753038429305/sites/eigo-taxi-test/versions/([a-z0-9]+)$'){throw 'Unexpected site'}
$release=$Matches[1]
& $node scripts/verify_mighty_release.cjs > "$out/public-hash-log.txt"
if($LASTEXITCODE){throw 'Public hashes failed'}
& $node "$out/ticket-layout.cjs" public
if($LASTEXITCODE){throw 'Public UI failed'}
& $node scripts/archive_test_deployment.cjs
if($LASTEXITCODE){throw 'Archive failed'}
$target="$repo/$dir/releases/$release"
if(!(Test-Path $target)){Copy-Item -LiteralPath "$dir/releases/$release" -Destination $target -Recurse}
foreach($f in $inputs.Keys){if((Get-FileHash "$target/source/$f").Hash -ne $inputs[$f]){throw 'Archive source mismatch'}}
foreach($f in $payloads.Keys){if((Get-FileHash "$target/payload/$f").Hash -ne $payloads[$f]){throw 'Archive payload mismatch'}}
foreach($name in 'firebase-deploy.json','build-manifest.json','public-verification.json'){Copy-Item "$dir/$name" "$repo/$dir/$name";if((Get-FileHash "$target/$name").Hash -ne (Get-FileHash "$dir/$name").Hash){throw 'Archive receipt mismatch'}}
@{release=$release;baseline='a97d95510290c92b';sourceDigest=$manifest.release.sourceDigest;inputs=32;payloads=6;diff=@('src/components/AddTicketModal.tsx');publicHashMatches=7;publicUI='public-ui.json';publicWideScreenshot='public-844x390.png';physicalDevice=$false;liveGoogleAcceptance=$false;customerPassed=0;customerTotal=6;build='tsc -b and vite build passed';lint='oxlint exit 0';archive="$dir/releases/$release"}|ConvertTo-Json|Set-Content "$out/release-validation.json"
@{status='verified';release=$release;sourceDigest=$manifest.release.sourceDigest;fix='小さな画面や横向きでもチケット追加フォームをスクロールし、登録ボタンまで操作できるようにしました。';tests='AT-05・AT-21再検証。390×360、375×600、844×390の各画面で空の受取金額は保存できず、0円の10回券を1回追加すると7回から17回になり、閉じて開き直した後と保護者デモでも17回でした。';scope='Edgeの3種類のビューポートで、公開検証サイトのブラウザ内架空デモを操作しました。実端末・ソフトキーボード、顧客本人のGoogleログイン、実台帳・実Calendarの動作は未検証です。顧客確認は0/6。';implementationDetails='チケット追加パネルの高さを表示領域の高さから上下余白を除いた範囲に制限し、内容をパネル内で縦スクロールできるようにしました。';newIds='なし（AT-05・AT-21再検証）';testFile='after-ui.json';publicSummary='公開検証版の3画面サイズすべてで0円・10回券を1回登録し、管理者・保護者の架空残数17回を確認しました。公開7応答のハッシュも一致しました。';screenshot='public-844x390.png'}|ConvertTo-Json|Set-Content "$out/delivery-data.json"
