param([switch]$PrepareOnly,[Parameter(ValueFromRemainingArguments=$true)][string[]]$CodexArgs)
$ErrorActionPreference='Stop'
$roleRoot=$PSScriptRoot
$runtimeHome=Join-Path $roleRoot '.runtime/codex-home'
if ((& node --version) -ne 'v24.19.0') { throw 'Node 24.19.0 is required.' }
$nodePath=(Get-Command node).Source.Replace('\','/')
New-Item -ItemType Directory -Force -Path $runtimeHome,(Join-Path $runtimeHome 'skills/motion-response') | Out-Null
$template=[IO.File]::ReadAllText((Join-Path $roleRoot 'config.template.toml'))
$rendered=$template.Replace('__ROLE_ROOT__',$roleRoot.Replace('\','/')).Replace('__NODE__',$nodePath)
$browserOutput='D:/JosHsuan_Website/_work/bending-active-thesis/round-02/motion-browser'
$chromiumPath=(& node (Join-Path $roleRoot 'scripts/browser-path.mjs')).Trim().Replace('\','/')
if ($LASTEXITCODE -ne 0) { throw 'Install the root pinned Playwright Chromium headless shell.' }
New-Item -ItemType Directory -Force -Path $browserOutput | Out-Null
$rendered=$rendered.Replace('__CHROMIUM__',$chromiumPath).Replace('__BROWSER_OUTPUT__',$browserOutput)
[IO.File]::WriteAllText((Join-Path $runtimeHome 'config.toml'),$rendered,[Text.UTF8Encoding]::new($false))
Get-ChildItem -LiteralPath (Join-Path $roleRoot 'skills/motion-response') -Force | ForEach-Object {Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $runtimeHome 'skills/motion-response') -Recurse -Force}
if($PrepareOnly){Write-Output 'Prepared Motion Designer role home';exit 0}
$priorRoleHome=$env:CODEX_HOME
try{$env:CODEX_HOME=$runtimeHome;& codex --cd $roleRoot @CodexArgs;exit $LASTEXITCODE}
finally{if($null -eq $priorRoleHome){Remove-Item Env:CODEX_HOME -ErrorAction SilentlyContinue}else{$env:CODEX_HOME=$priorRoleHome}}
