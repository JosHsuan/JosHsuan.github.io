param([switch]$PrepareOnly,[Parameter(ValueFromRemainingArguments=$true)][string[]]$CodexArgs)
$ErrorActionPreference='Stop'
$roleRoot=$PSScriptRoot
$runtimeHome=Join-Path $roleRoot '.runtime/codex-home'
$browserOutput='D:/JosHsuan_Website/_work/bending-active-thesis/round-02/lighting-designer/browser'
if ((& node --version) -ne 'v24.19.0') { throw 'Node 24.19.0 is required.' }
$nodePath=(Get-Command node).Source.Replace('\','/')
$chromiumPath=(& node (Join-Path $roleRoot 'scripts/browser-path.mjs')).Trim().Replace('\','/')
if ($LASTEXITCODE -ne 0) { throw 'Install the root pinned Playwright Chromium headless shell.' }
New-Item -ItemType Directory -Force -Path $runtimeHome,(Join-Path $runtimeHome 'skills'),$browserOutput | Out-Null
$template=[IO.File]::ReadAllText((Join-Path $roleRoot 'config.template.toml'))
$rendered=$template.Replace('__ROLE_ROOT__',$roleRoot.Replace('\','/')).Replace('__NODE__',$nodePath).Replace('__CHROMIUM__',$chromiumPath).Replace('__BROWSER_OUTPUT__',$browserOutput)
[IO.File]::WriteAllText((Join-Path $runtimeHome 'config.toml'),$rendered,[Text.UTF8Encoding]::new($false))
Get-ChildItem -LiteralPath (Join-Path $roleRoot 'skills') -Directory | ForEach-Object { $destination=Join-Path (Join-Path $runtimeHome 'skills') $_.Name; New-Item -ItemType Directory -Force -Path $destination | Out-Null; Get-ChildItem -LiteralPath $_.FullName -Force | ForEach-Object {Copy-Item -LiteralPath $_.FullName -Destination $destination -Recurse -Force} }
if($PrepareOnly){Write-Output "Prepared Lighting Designer runtime: $runtimeHome";exit 0}
$priorRoleHome=$env:CODEX_HOME
try{$env:CODEX_HOME=$runtimeHome;& codex --cd $roleRoot @CodexArgs;exit $LASTEXITCODE}
finally{if($null -eq $priorRoleHome){Remove-Item Env:CODEX_HOME -ErrorAction SilentlyContinue}else{$env:CODEX_HOME=$priorRoleHome}}
