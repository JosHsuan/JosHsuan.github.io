param([switch]$PrepareOnly,[Parameter(ValueFromRemainingArguments=$true)][string[]]$CodexArgs)
$ErrorActionPreference='Stop'
$roleRoot=$PSScriptRoot
$runtimeHome=Join-Path $roleRoot '.runtime/codex-home'
if ((& node --version) -ne 'v24.19.0') { throw 'Node 24.19.0 is required.' }
$nodePath=(Get-Command node).Source.Replace('\','/')
$chromiumPath=(& node (Join-Path $roleRoot 'scripts/browser-path.mjs')).Trim().Replace('\','/')
if ($LASTEXITCODE -ne 0) { throw 'Install the root pinned Playwright Chromium headless shell.' }
New-Item -ItemType Directory -Force -Path $runtimeHome,(Join-Path $runtimeHome 'skills'),(Join-Path $roleRoot '.runtime/browser-output') | Out-Null
$template=[IO.File]::ReadAllText((Join-Path $roleRoot 'config.template.toml'))
$rendered=$template.Replace('__ROLE_ROOT__',$roleRoot.Replace('\','/')).Replace('__NODE__',$nodePath).Replace('__CHROMIUM__',$chromiumPath)
[IO.File]::WriteAllText((Join-Path $runtimeHome 'config.toml'),$rendered,[Text.UTF8Encoding]::new($false))
$skillPaths=@(Get-ChildItem -LiteralPath (Join-Path $roleRoot 'skills') -Directory | Where-Object {$_.Name -ne 'vendor'})+@(Get-ChildItem -LiteralPath (Join-Path $roleRoot 'skills/vendor') -Directory)
foreach($skillPath in $skillPaths){$destination=Join-Path (Join-Path $runtimeHome 'skills') $skillPath.Name;New-Item -ItemType Directory -Force -Path $destination | Out-Null;Get-ChildItem -LiteralPath $skillPath.FullName -Force | ForEach-Object {Copy-Item -LiteralPath $_.FullName -Destination $destination -Recurse -Force}}
if($PrepareOnly){Write-Output "Prepared 3D Artist runtime: $runtimeHome";exit 0}
$priorRoleHome=$env:CODEX_HOME
try{$env:CODEX_HOME=$runtimeHome;& codex --cd $roleRoot @CodexArgs;exit $LASTEXITCODE}
finally{if($null -eq $priorRoleHome){Remove-Item Env:CODEX_HOME -ErrorAction SilentlyContinue}else{$env:CODEX_HOME=$priorRoleHome}}
