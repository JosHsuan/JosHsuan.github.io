$ErrorActionPreference='Stop'
if ((& node --version) -ne 'v24.19.0') { throw 'Use the project Node 24.19.0 runtime.' }
if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'out/index.html'))) { throw 'Build the local case first; see README.md.' }
$url='http://127.0.0.1:4184/'
try { $response=Invoke-WebRequest -Uri $url -TimeoutSec 2; if ($response.Content -match 'Bending-Active') { Write-Output $url; exit 0 }; throw 'Port 4184 is occupied by a different service.' }
catch { if ($_.Exception.Message -eq 'Port 4184 is occupied by a different service.') { throw } }
$runtime=Join-Path $PSScriptRoot '.runtime'
New-Item -ItemType Directory -Force -Path $runtime | Out-Null
$script=Join-Path $PSScriptRoot 'scripts/serve.mjs'
Start-Process -FilePath (Get-Command node).Source -ArgumentList @(('"'+$script+'"')) -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtime 'preview.log') -RedirectStandardError (Join-Path $runtime 'preview-error.log')
Write-Output $url
