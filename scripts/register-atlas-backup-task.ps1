$ErrorActionPreference = 'Stop'

$backupScript = Join-Path $PSScriptRoot 'backup-atlas-m0.ps1'
$envFile = Join-Path (Split-Path $PSScriptRoot -Parent) 'backend\.env'

if (-not (Test-Path -LiteralPath $envFile -PathType Leaf)) {
    throw 'backend/.env is absent; configure MONGO_URI before scheduling backups.'
}
$bundledMongoTools = Join-Path $env:LOCALAPPDATA 'MongoDBDatabaseTools\100.19.0'
$mongodump = Get-Command mongodump -ErrorAction SilentlyContinue
if (-not $mongodump) {
    $mongodump = Get-ChildItem -LiteralPath $bundledMongoTools -Filter mongodump.exe -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
}
if (-not $mongodump) {
    throw 'MongoDB Database Tools (mongodump) must be installed in PATH or under %LOCALAPPDATA%\MongoDBDatabaseTools\100.19.0 before scheduling backups.'
}

& $backupScript -PlanOnly

$taskName = 'CarLogProAtlasBackup'
$taskDescription = 'Daily MongoDB Atlas M0 dump to the OneDrive-synced project backup folder; keep 7 daily and 4 Sunday archives.'
$powerShellExe = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$arguments = '-NoProfile -ExecutionPolicy Bypass -File "{0}"' -f $backupScript
$action = New-ScheduledTaskAction -Execute $powerShellExe -Argument $arguments
$trigger = New-ScheduledTaskTrigger -Daily -At '20:00'
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 2) -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $taskName -Description $taskDescription -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
Write-Output "Scheduled task '$taskName' registered to run daily at 20:00 while this Windows account is signed in."
