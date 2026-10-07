param([switch]$PrepareOnly,[Parameter(ValueFromRemainingArguments=$true)][string[]]$CodexArgs)
$ErrorActionPreference='Stop'
$roleRoot=$PSScriptRoot
$projectRoot=(Resolve-Path -LiteralPath (Join-Path $roleRoot '../..')).Path
$runtimeHome=Join-Path $roleRoot '.runtime/codex-home'
$nodePath=(Get-Command node).Source.Replace('\','/')
$chromiumPath=(& node (Join-Path $roleRoot 'scripts/browser-path.mjs')).Trim().Replace('\','/')
if ($LASTEXITCODE -ne 0) { throw 'The existing Playwright runtime is unavailable.' }
New-Item -ItemType Directory -Path $runtimeHome,(Join-Path $runtimeHome 'skills'),(Join-Path $roleRoot '.runtime/browser-output') -Force | Out-Null
$template=[IO.File]::ReadAllText((Join-Path $roleRoot 'config.template.toml'))
$rendered=$template.Replace('__ROLE_ROOT__',$roleRoot.Replace('\','/')).Replace('__NODE__',$nodePath).Replace('__CHROMIUM__',$chromiumPath)
[IO.File]::WriteAllText((Join-Path $runtimeHome 'config.toml'),$rendered,[Text.UTF8Encoding]::new($false))
foreach($skillPath in @((Join-Path $roleRoot 'skills/uiux-material-curation')) + @(Get-ChildItem -LiteralPath (Join-Path $roleRoot 'skills/vendor') -Directory | ForEach-Object { $_.FullName })) {
  $destination=Join-Path (Join-Path $runtimeHome 'skills') (Split-Path -Leaf $skillPath)
  New-Item -ItemType Directory -Path $destination -Force | Out-Null
  Get-ChildItem -LiteralPath $skillPath -Force | ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $destination -Recurse -Force }
}
if($PrepareOnly){ Write-Output "Prepared UIUX-only runtime: $runtimeHome"; exit 0 }
# CODEX_HOME is deliberately set only within this launcher and restored afterwards.
$previousCodexHome=$env:CODEX_HOME
try { $env:CODEX_HOME=$runtimeHome; & codex --cd $roleRoot @CodexArgs; exit $LASTEXITCODE }
finally { if($null -eq $previousCodexHome){ Remove-Item Env:CODEX_HOME -ErrorAction SilentlyContinue }else{ $env:CODEX_HOME=$previousCodexHome } }
