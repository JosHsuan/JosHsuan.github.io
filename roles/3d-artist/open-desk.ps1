param([switch]$NoBrowser)
$ErrorActionPreference='Stop'
$roleRoot=$PSScriptRoot
if ((& node --version) -ne 'v24.19.0') { throw 'Node 24.19.0 is required.' }
$listener=Get-NetTCPConnection -State Listen -LocalPort 4180 -ErrorAction SilentlyContinue
if($listener){
  $page=Invoke-WebRequest -Uri 'http://127.0.0.1:4180/' -UseBasicParsing
  if($page.Content -notmatch '3D / Interaction') {throw 'Port 4180 belongs to another service; it was not stopped.'}
}else{
  if(-not(Test-Path -LiteralPath (Join-Path $roleRoot 'dist/index.html'))){& node (Join-Path $roleRoot 'scripts/build-interactions.mjs');if($LASTEXITCODE -ne 0){throw 'Build failed'}}
  New-Item -ItemType Directory -Force -Path (Join-Path $roleRoot '.runtime') | Out-Null
  $preview=Start-Process -FilePath (Get-Command node).Source -ArgumentList @('scripts/serve.mjs') -WorkingDirectory $roleRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $roleRoot '.runtime/preview.log') -RedirectStandardError (Join-Path $roleRoot '.runtime/preview-error.log') -PassThru
  [IO.File]::WriteAllText((Join-Path $roleRoot '.runtime/preview.pid'),[string]$preview.Id)
  $ok=$false
  for($attempt=0;$attempt -lt 30;$attempt++){try{$page=Invoke-WebRequest -Uri 'http://127.0.0.1:4180/' -UseBasicParsing;$ok=$page.Content -match '3D / Interaction';if($ok){break}}catch{Start-Sleep -Milliseconds 200}}
  if(-not $ok){throw 'Preview did not become ready; see .runtime/preview-error.log'}
}
if(-not $NoBrowser){Start-Process 'http://127.0.0.1:4180/'}
Write-Output '3D / Interaction desk: http://127.0.0.1:4180/'
