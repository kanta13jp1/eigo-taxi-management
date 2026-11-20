$ErrorActionPreference = 'Stop'
$endpoint = 'https://script.google.com/macros/s/AKfycbznxkg_f_7ddHdopFZfN0OlFDsxoFoi67OslKNQ93ipkWZLq-tj1jAsxz_uxNo2jBtwFg/exec'
$storePath = Join-Path $env:USERPROFILE '.codex\private\eigo-taxi-at23-access.json.dpapi'
$secure = ConvertTo-SecureString (Get-Content -LiteralPath $storePath -Raw)
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try { $accounts = ([Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) | ConvertFrom-Json).accounts }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
$entryA = 'acae06a7-bd96-4d85-8703-c42d9b3d3794'
$entryB = '304adbf6-5096-450a-8bf7-2d9d175914c2'
$results = [Collections.Generic.List[object]]::new()
function Request-Test($userId, $action, $role, $entryId) {
  $account = @($accounts | Where-Object id -eq $userId)[0]
  $body = @{ action=$action; token=$account.accessKey; portalRole=$role }
  if ($entryId) { $body.entryId=$entryId }
  try { return Invoke-RestMethod -Uri $endpoint -Method Post -ContentType 'text/plain;charset=utf-8' -Body ($body | ConvertTo-Json -Compress) -TimeoutSec 45 }
  catch { throw 'Live API request failed. No request or response data recorded.' }
}
function Record($id, $pass) { $results.Add([pscustomobject]@{id=$id;passed=[bool]$pass}) }
$r = Request-Test 'admin-01' 'login' 'admin' $null
Record 'admin-login' ($r.success -and $r.data.role -eq 'admin')
$r = Request-Test 'admin-02' 'login' 'admin' $null
Record 'second-admin-login' ($r.success -and $r.data.role -eq 'admin')
$r = Request-Test 'admin-01' 'login' 'parent' $null
Record 'admin-refused-parent-entry' (!$r.success -and $r.code -eq 'PORTAL_MISMATCH')
$r = Request-Test 'admin-01' 'getPortalInvitations' 'admin' $null
$fieldsSafe = @($r.data | ForEach-Object { $_.PSObject.Properties.Name } | Where-Object { $_ -notin @('userId','name','publicEntryId') }).Count -eq 0
Record 'admin-invitation-directory-safe' ($r.success -and @($r.data).Count -eq 2 -and $fieldsSafe)
$r = Request-Test 'parent-01' 'login' 'parent' $entryA
Record 'parent-a-personal-entry-login' ($r.success -and $r.data.role -eq 'parent' -and $r.data.publicEntryId -eq $entryA)
$r = Request-Test 'parent-02' 'login' 'parent' $entryB
Record 'parent-b-personal-entry-login' ($r.success -and $r.data.role -eq 'parent' -and $r.data.publicEntryId -eq $entryB)
$r = Request-Test 'parent-01' 'getStudents' 'parent' $entryA
Record 'parent-a-students-isolated' ($r.success -and @($r.data).Count -eq 1 -and $r.data[0].id -eq 'STU-001')
$r = Request-Test 'parent-02' 'getStudents' 'parent' $entryB
Record 'parent-b-students-isolated' ($r.success -and @($r.data).Count -eq 1 -and $r.data[0].id -eq 'STU-002')
$r = Request-Test 'parent-02' 'login' 'parent' $entryA
Record 'wrong-family-key-refused' (!$r.success -and $r.code -eq 'ENTRY_REVOKED')
$r = Request-Test 'parent-01' 'getPortalInvitations' 'parent' $entryA
Record 'parent-directory-refused' (!$r.success -and $r.code -eq 'FORBIDDEN')
$r = Request-Test 'parent-01' 'login' 'admin' $null
Record 'parent-refused-admin-entry' (!$r.success -and $r.code -eq 'PORTAL_MISMATCH')
$out = [ordered]@{verifiedAt=[DateTime]::UtcNow.ToString('o');environment='Mighty verification GAS v2';readOnly=$true;passed=@($results | Where-Object passed).Count;total=$results.Count;checks=$results.ToArray()}
$out | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $PSScriptRoot '..\docs\acceptance\role-portals-2026-10-20\live-api-results.json')
Write-Output ('Live read-only portal API: {0}/{1} PASS' -f $out.passed,$out.total)
if ($out.passed -ne $out.total) { exit 1 }
