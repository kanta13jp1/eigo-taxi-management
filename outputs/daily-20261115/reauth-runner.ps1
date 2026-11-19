$acct='k-umezawa@ml-mightylink.com'
& "$env:LOCALAPPDATA/pnpm/firebase.cmd" login --reauth --account $acct 2>&1 | ForEach-Object {
  if([string]$_ -match 'Waiting for authentication'){[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'auth-status.txt'),'waiting')}
  if([string]$_ -match 'Success! Logged in as k-umezawa@ml-mightylink.com'){[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'auth-status.txt'),'authenticated company account')}
}
$code=$LASTEXITCODE
Add-Content (Join-Path $PSScriptRoot 'auth-status.txt') " exit=$code"
