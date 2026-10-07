param([switch]$Rebuild)
$ErrorActionPreference='Stop'
$roleRoot=$PSScriptRoot
$nodePath=(Get-Command node).Source
if ((& $nodePath --version).Trim() -ne 'v24.19.0') { throw 'Use the project-pinned Node 24.19.0.' }
$url='http://127.0.0.1:4175/'
$existing=$null
try { $existing=Invoke-RestMethod -Uri ($url+'health.json') -TimeoutSec 2 } catch { }
if ($existing -and $existing.role -ne 'uiux-designer') { throw 'Port 4175 is occupied by another service.' }
if ($Rebuild -or -not (Test-Path -LiteralPath (Join-Path $roleRoot 'dist/index.html'))) {
  & $nodePath (Join-Path $roleRoot 'scripts/build.mjs')
  if ($LASTEXITCODE -ne 0) { throw 'UIUX gallery build failed.' }
}
if (-not $existing) {
  New-Item -ItemType Directory -Path (Join-Path $roleRoot '.runtime') -Force | Out-Null
  $serverScript=Join-Path $roleRoot 'scripts/serve.mjs'
  $serverProcess=Start-Process -FilePath $nodePath -ArgumentList @('"'+$serverScript+'"') -WorkingDirectory $roleRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $roleRoot '.runtime/gallery.log') -RedirectStandardError (Join-Path $roleRoot '.runtime/gallery-error.log')
  [IO.File]::WriteAllText((Join-Path $roleRoot '.runtime/gallery.pid'),[string]$serverProcess.Id)
  $ready=$false
  foreach($attempt in 1..30) { try { $health=Invoke-RestMethod -Uri ($url+'health.json') -TimeoutSec 1; if($health.role -eq 'uiux-designer'){ $ready=$true; break } }catch{}; Start-Sleep -Milliseconds 100 }
  if(-not $ready){ throw 'The gallery did not start; inspect .runtime/gallery-error.log.' }
}
Start-Process $url
Write-Output "UIUX material studies: $url"
