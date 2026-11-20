param(
  [ValidateSet('Prepare', 'CopyKey', 'ClearClipboard')]
  [string]$Action = 'Prepare',
  [ValidateSet('admin-01', 'admin-02', 'parent-01', 'parent-02')]
  [string]$UserId = 'admin-01'
)
$ErrorActionPreference = 'Stop'
$privateDir = Join-Path $env:USERPROFILE '.codex\private'
$storePath = Join-Path $privateDir 'eigo-taxi-at23-access.json.dpapi'
if ($Action -eq 'ClearClipboard') {
  Set-Clipboard -Value ''
  Write-Host 'Clipboard cleared.'
  exit
}
if (Test-Path -LiteralPath $storePath) {
  if ($Action -eq 'Prepare') {
    throw 'Existing test credentials found. Prepare is initial-setup only: overwriting AUTH_USERS_JSON could erase publicEntryId, active and family mappings. Use -Action CopyKey for login. Preserve the current GAS settings when changing configuration.'
  }
  $encrypted = Get-Content -LiteralPath $storePath -Raw
  $secure = ConvertTo-SecureString $encrypted
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { $stored = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) | ConvertFrom-Json }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
} else {
  if ($Action -eq 'CopyKey') { throw 'Run Prepare first.' }
  $people = @(
    @{id='admin-01'; name='AT23 Admin 1'; role='admin'; studentIds=@()},
    @{id='admin-02'; name='AT23 Admin 2'; role='admin'; studentIds=@()},
    @{id='parent-01'; name='AT23 Family A'; role='parent'; studentIds=@('STU-001')},
    @{id='parent-02'; name='AT23 Family B'; role='parent'; studentIds=@('STU-002')}
  )
  $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
  $sha = [Security.Cryptography.SHA256]::Create()
  try {
    $accounts = @($people | ForEach-Object {
      $bytes = New-Object byte[] 32
      $rng.GetBytes($bytes)
      $token = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+','-').Replace('/','_')
      $hash = ([BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($token)))).Replace('-','').ToLowerInvariant()
      [pscustomobject]@{id=$_.id; name=$_.name; role=$_.role; studentIds=@($_.studentIds); accessKey=$token; sha256=$hash}
    })
    $stored = [pscustomobject]@{purpose='AT23 non-production only'; createdAt=[DateTime]::UtcNow.ToString('o'); accounts=$accounts}
    $payload = $stored | ConvertTo-Json -Depth 8 -Compress
    $encrypted = ConvertFrom-SecureString (ConvertTo-SecureString $payload -AsPlainText -Force)
    New-Item -ItemType Directory -Path $privateDir -Force | Out-Null
    # A new file is created only once. Existing credentials are reused, never rotated here.
    $stream = [IO.File]::Open($storePath, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write)
    try {
      $encoded = [Text.Encoding]::UTF8.GetBytes($encrypted)
      $stream.Write($encoded, 0, $encoded.Length)
    } finally { $stream.Dispose() }
  } finally { $rng.Dispose(); $sha.Dispose() }
}
if ($Action -eq 'CopyKey') {
  $selected = @($stored.accounts | Where-Object { $_.id -eq $UserId })
  if ($selected.Count -ne 1) { throw 'Requested test user was not found.' }
  Set-Clipboard -Value $selected[0].accessKey
  Write-Host "Test access key copied for $UserId. Paste only into the test login. Do not share or record it."
} else {
  $auth = [ordered]@{}
  foreach ($account in $stored.accounts) {
    $auth[$account.sha256] = [ordered]@{id=$account.id; name=$account.name; role=$account.role; studentIds=@($account.studentIds)}
  }
  Set-Clipboard -Value ($auth | ConvertTo-Json -Depth 8 -Compress)
  Write-Host 'AUTH_USERS_JSON value copied. Paste it into the TEST Apps Script property value and save yourself.'
  Write-Host 'Raw test keys are encrypted with Windows CurrentUser DPAPI outside the repository.'
  Write-Host "Encrypted store: $storePath"
}
