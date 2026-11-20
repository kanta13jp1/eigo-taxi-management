$ErrorActionPreference='Stop'
$o=$PSScriptRoot
$node='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-1425-0_26.1117.1425.0_x64__3k8sg7r9htsxt/dependencies/node/bin'
$env:PATH=$node+';'+$env:PATH
$s="$o/release"
$d='docs/acceptance/deployment'
$prior=Get-Content "$o/prior-manifest.json" -Raw | ConvertFrom-Json -AsHashtable
$m=Get-Content "$s/$d/build-manifest.json" -Raw | ConvertFrom-Json -AsHashtable
$delta=@($m.sourceHashes.Keys | Where-Object {$m.sourceHashes[$_] -ne $prior.sourceHashes[$_]})
if($delta.Count -ne 1 -or $delta[0] -ne 'src/components/TermsModal.tsx' -or $m.sourceHashes.Count -ne $prior.sourceHashes.Count){throw "Unexpected changes: $delta"}
if(!(Test-Path "$o/after-terms.json")){throw 'Local browser acceptance evidence is missing'}
foreach($group in @($m.sourceHashes,$m.distHashes)){foreach($f in $group.Keys){if((Get-FileHash -LiteralPath "$s/$f").Hash -ne $group[$f]){throw "Hash mismatch: $f"}}}
Push-Location $s
try {
  node -e 'const f=require("fs"),c=require("crypto"),p=JSON.parse(f.readFileSync("../prior-manifest.json","utf8").replace(/^\uFEFF/,"")); Promise.all(Object.entries(p.distHashes).map(async ([k,h])=>{const r=await fetch("https://eigo-taxi-test.web.app"+k.slice(4),{headers:{"Cache-Control":"no-cache"},signal:AbortSignal.timeout(15000)});if(!r.ok||c.createHash("sha256").update(Buffer.from(await r.arrayBuffer())).digest("hex")!==h)throw new Error(k)})).catch(e=>{console.error(e.message);process.exitCode=1})'
  if($LASTEXITCODE){throw 'Public baseline hashes changed'}
  & "$env:LOCALAPPDATA/pnpm/firebase.cmd" deploy --project eigo-taxi-app --only hosting:mighty-test --account k-umezawa@ml-mightylink.com --non-interactive --json > "$d/firebase-deploy.json"
  $r=Get-Content "$d/firebase-deploy.json" -Raw | ConvertFrom-Json
  if($r.status -ne 'success'){throw $r.error}
  if($r.result.hosting -notmatch '^projects/753038429305/sites/eigo-taxi-test/versions/([a-z0-9]+)$'){throw 'Unexpected Hosting site'}
  $version=$Matches[1]
  node scripts/verify_mighty_release.cjs > "$o/public-hash-log.txt"
  if($LASTEXITCODE){throw 'Public hashes did not match'}
  node "$o/terms-release.cjs" public
  if($LASTEXITCODE){throw 'Public browser acceptance failed'}
  node scripts/archive_test_deployment.cjs
  if($LASTEXITCODE){throw 'Release archival failed'}
  $archive="$o/../../$d/releases/$version"
  if(!(Test-Path $archive)){Copy-Item -LiteralPath "$d/releases/$version" -Destination $archive -Recurse}
  [ordered]@{version=$version;release=$m.release;publicHashesMatched=(Get-Content "$d/public-verification.json" -Raw | ConvertFrom-Json).results.Count;ui='PASS'} | ConvertTo-Json -Depth 5 | Set-Content "$o/verified-release.json" -Encoding utf8
} finally {Pop-Location}
