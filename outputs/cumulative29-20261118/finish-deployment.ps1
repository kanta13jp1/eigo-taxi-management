$ErrorActionPreference='Stop'
$o=$PSScriptRoot
$repo=(Resolve-Path "$o/../..").Path
$stage="$o/stage"
$base="$repo/docs/acceptance/deployment/releases/603f482f7709d354"
$nodePath='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1116-1210-0_26.1116.1210.0_x64__3k8sg7r9htsxt/dependencies/node/bin'
$env:PATH=$nodePath+';'+$env:PATH
$m=Get-Content "$stage/docs/acceptance/deployment/build-manifest.json" -Raw | ConvertFrom-Json -AsHashtable
$b=Get-Content "$base/build-manifest.json" -Raw | ConvertFrom-Json -AsHashtable
if($m.release.sourceDigest -ne '578ccca364f8b290e6ede4db994bac82a282689dfbfd93e7948e308f8e998f9f'){throw 'Reviewed candidate changed'}
$diff=@($m.sourceHashes.Keys | Where-Object {$m.sourceHashes[$_] -ne $b.sourceHashes[$_]})
if($diff.Count -ne 1 -or $diff[0] -ne 'src/components/TermsModal.tsx' -or $b.sourceHashes.Count -ne $m.sourceHashes.Count){throw 'Unexpected diff'}
foreach($group in @($m.sourceHashes,$m.distHashes)){foreach($f in $group.Keys){if((Get-FileHash -LiteralPath "$stage/$f").Hash -ne $group[$f]){throw "Hash mismatch: $f"}}}
$dir='docs/acceptance/deployment'
Push-Location $stage
try {
 $r=Get-Content "$dir/firebase-deploy.json" -Raw | ConvertFrom-Json
 if($r.status -ne 'success'){
  if(!(Test-Path "$o/auth-status.txt") -or (Get-Content "$o/auth-status.txt" -Raw) -notmatch 'authenticated company account'){throw 'Awaiting Firebase reauthentication'}
  & node "$repo/outputs/cumulative27-20261118/verify.cjs"
  if($LASTEXITCODE){throw 'Public baseline changed'}
  & "$env:LOCALAPPDATA/pnpm/firebase.cmd" deploy --project eigo-taxi-app --only hosting:mighty-test --account k-umezawa@ml-mightylink.com --non-interactive --json > "$dir/firebase-deploy.json"
  $r=Get-Content "$dir/firebase-deploy.json" -Raw | ConvertFrom-Json
  if($r.status -ne 'success'){throw $r.error}
 }
 if($r.result.hosting -notmatch '^projects/753038429305/sites/eigo-taxi-test/versions/([a-z0-9]+)$'){throw 'Unexpected site'}
 $version=$Matches[1]
 & node scripts/verify_mighty_release.cjs > "$o/public-hash-log.txt"
 if($LASTEXITCODE){throw 'Hashes failed'}
 & node "$o/terms.cjs" public
 if($LASTEXITCODE){throw 'Public terms test failed'}
 & node "$o/at29.cjs" public
 if($LASTEXITCODE){throw 'Public mobile rehearsal failed'}
 & node scripts/archive_test_deployment.cjs
 if($LASTEXITCODE){throw 'Archive failed'}
 $archive="$repo/$dir/releases/$version"
 if(!(Test-Path $archive)){Copy-Item -LiteralPath "$dir/releases/$version" -Destination $archive -Recurse}
 foreach($f in $m.sourceHashes.Keys){if((Get-FileHash "$archive/source/$f").Hash -ne $m.sourceHashes[$f]){throw "Archive mismatch: $f"}}
 foreach($f in $m.distHashes.Keys){if((Get-FileHash "$archive/payload/$f").Hash -ne $m.distHashes[$f]){throw "Archive mismatch: $f"}}
 foreach($f in 'firebase-deploy.json','build-manifest.json','public-verification.json'){Copy-Item -LiteralPath "$dir/$f" -Destination "$repo/$dir/$f"}
 $target="$repo/src/components/TermsModal.tsx"
 $working=[IO.File]::ReadAllText($target)
 $baseline=[IO.File]::ReadAllText("$base/source/src/components/TermsModal.tsx")
 $known=$baseline.Replace('flex flex-col max-h-[90vh]','flex flex-col max-h-[calc(100dvh-2rem)] overscroll-contain')
 $known=$known -replace '([\r\n]+)            onClick=\{onClose\}', '$1            type="button"$1            aria-label="閉じる"$1            onClick={onClose}'
 if($working -eq $baseline -or $working -eq $known){Copy-Item -LiteralPath "$stage/src/components/TermsModal.tsx" -Destination $target}
 else {Write-Warning 'Root source changed independently; preserved'}
 @{release=$version;sourceDigest=$m.release.sourceDigest;publicResponses=7;publicTermsPassed=$true;mobileRehearsalPassed=$true} | ConvertTo-Json | Set-Content "$o/release-validation.json" -Encoding utf8
} finally {Pop-Location}
