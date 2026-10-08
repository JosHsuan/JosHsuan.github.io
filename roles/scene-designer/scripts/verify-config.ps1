$ErrorActionPreference='Stop'
$roleRoot=Split-Path -Parent $PSScriptRoot
$globalConfig=Join-Path $env:USERPROFILE '.codex/config.toml'
$hashBefore=(Get-FileHash -LiteralPath $globalConfig -Algorithm SHA256).Hash
& (Join-Path $roleRoot 'codex-role.ps1') -PrepareOnly
if($LASTEXITCODE -ne 0){throw 'Role preparation failed'}
$priorRoleHome=$env:CODEX_HOME
try{
 $env:CODEX_HOME=Join-Path $roleRoot '.runtime/codex-home'
 $loaded=& codex mcp list --json
 if($LASTEXITCODE -ne 0){throw 'Installed CLI did not load the role configuration'}
 $servers=$loaded|ConvertFrom-Json
 $expected=@('scene_browser','scene_catalog')
 if($servers.Count -ne 2 -or @($servers|Where-Object {$_.name -notin $expected -or -not $_.enabled}).Count){throw 'Unexpected role MCP registration'}
 $skills=@(Get-ChildItem -LiteralPath (Join-Path $env:CODEX_HOME 'skills') -Directory)
 if($skills.Count -ne 1 -or $skills[0].Name -ne 'scene-direction'){throw 'Unexpected isolated skill'}
 $skillSource=Join-Path $roleRoot 'skills/scene-direction/SKILL.md'
 $skillLoaded=Join-Path $env:CODEX_HOME 'skills/scene-direction/SKILL.md'
 if((Get-FileHash -LiteralPath $skillSource).Hash -ne (Get-FileHash -LiteralPath $skillLoaded).Hash){throw 'Role skill copy mismatch'}
 if(Test-Path -LiteralPath (Join-Path $env:CODEX_HOME 'auth.json')){throw 'Authentication must not be copied'}
 New-Item -ItemType Directory -Force -Path (Join-Path $roleRoot 'verification')|Out-Null
 [IO.File]::WriteAllText((Join-Path $roleRoot 'verification/config-loader.json'),($servers|ConvertTo-Json -Depth 12),[Text.UTF8Encoding]::new($false))
}finally{if($null -eq $priorRoleHome){Remove-Item Env:CODEX_HOME -ErrorAction SilentlyContinue}else{$env:CODEX_HOME=$priorRoleHome}}
$hashAfter=(Get-FileHash -LiteralPath $globalConfig -Algorithm SHA256).Hash
if($hashBefore -ne $hashAfter){throw 'Global config changed during verification'}
Write-Output "PASS: Scene Designer, 2 isolated MCP registrations, 1 original role skill, no copied authentication. Global config SHA256: $hashAfter"
