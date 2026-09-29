[CmdletBinding()]
param(
    [switch]$PlanOnly
)

$ErrorActionPreference = 'Stop'

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$backendDirectory = Join-Path $projectRoot 'backend'
$envFile = Join-Path $backendDirectory '.env'
$backupDirectory = Join-Path $projectRoot 'backups\atlas-m0'
$dailyRetention = 7
$weeklyRetention = 4
$bundledMongoTools = Join-Path $env:LOCALAPPDATA 'MongoDBDatabaseTools\100.19.0'

if ($PlanOnly) {
    Write-Output "Plan uniquement : sauvegarde quotidienne vers '$backupDirectory'; rétention $dailyRetention quotidiennes + $weeklyRetention hebdomadaires."
    return
}

if (-not (Test-Path -LiteralPath $envFile -PathType Leaf)) {
    throw "backend/.env est absent ; aucune sauvegarde n'a été créée."
}

$mongodump = Get-Command mongodump -ErrorAction SilentlyContinue
$mongodumpPath = if ($mongodump) { $mongodump.Source } else { $null }
if (-not $mongodumpPath) {
    $mongodumpPath = Get-ChildItem -LiteralPath $bundledMongoTools -Filter mongodump.exe -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
}
if (-not $mongodumpPath) {
    throw 'MongoDB Database Tools (mongodump) est requis : installez-le dans PATH ou sous %LOCALAPPDATA%\MongoDBDatabaseTools\100.19.0.'
}

New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null

$oldLocation = Get-Location
$oldEnvPath = $env:CARLOG_BACKUP_ENV_PATH
$mongoUri = $null
$configFile = Join-Path ([System.IO.Path]::GetTempPath()) ("carlog-mongodump-{0}.yml" -f [guid]::NewGuid())
$partialArchive = Join-Path $backupDirectory (".carlog-atlas-{0}.partial" -f [guid]::NewGuid())
$completedArchive = Join-Path $backupDirectory ("carlog-atlas-m0-{0}.archive.gz" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))

try {
    # Load MONGO_URI without displaying it or placing it on mongodump's command line.
    $env:CARLOG_BACKUP_ENV_PATH = $envFile
    Set-Location -LiteralPath $backendDirectory
    $dotenvScript = 'const dotenv=require("dotenv"); const loaded=dotenv.config({path:process.env.CARLOG_BACKUP_ENV_PATH,override:true,quiet:true}); if(loaded.error || !process.env.MONGO_URI) process.exit(2); process.stdout.write(process.env.MONGO_URI);'
    $mongoUri = (& node -e $dotenvScript)
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($mongoUri)) {
        throw 'MONGO_URI could not be loaded from backend/.env; no backup was created.'
    }

    # mongodump supports a config file for sensitive URIs. Restrict this temporary file to the current Windows user.
    $yamlUri = ConvertTo-Json -InputObject $mongoUri -Compress
    [System.IO.File]::WriteAllText($configFile, "uri: $yamlUri`n", [System.Text.UTF8Encoding]::new($false))
    $currentUserSid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User
    $configAcl = Get-Acl -LiteralPath $configFile
    $configAcl.SetAccessRuleProtection($true, $false)
    $configAcl.AddAccessRule([System.Security.AccessControl.FileSystemAccessRule]::new($currentUserSid, 'FullControl', 'Allow'))
    Set-Acl -LiteralPath $configFile -AclObject $configAcl

    & $mongodumpPath --config $configFile "--archive=$partialArchive" --gzip --quiet *> $null
    $dumpExitCode = $LASTEXITCODE
    if ($dumpExitCode -ne 0) {
        throw "mongodump failed (exit code $dumpExitCode); diagnostic output was suppressed to protect connection details."
    }
    if (-not (Test-Path -LiteralPath $partialArchive -PathType Leaf) -or (Get-Item -LiteralPath $partialArchive).Length -eq 0) {
        throw 'mongodump did not produce a non-empty archive.'
    }

    Move-Item -LiteralPath $partialArchive -Destination $completedArchive

    $archives = @(Get-ChildItem -LiteralPath $backupDirectory -Filter 'carlog-atlas-m0-*.archive.gz' -File | Sort-Object LastWriteTimeUtc -Descending)
    $keep = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    foreach ($archive in ($archives | Select-Object -First $dailyRetention)) {
        [void]$keep.Add($archive.FullName)
    }
    $sundays = @($archives | Where-Object { $_.LastWriteTime.DayOfWeek -eq [System.DayOfWeek]::Sunday } | Select-Object -First $weeklyRetention)
    foreach ($archive in $sundays) {
        [void]$keep.Add($archive.FullName)
    }
    foreach ($archive in $archives) {
        if (-not $keep.Contains($archive.FullName)) {
            Remove-Item -LiteralPath $archive.FullName -Force
        }
    }

    Write-Output "Sauvegarde créée : $([System.IO.Path]::GetFileName($completedArchive)); rétention appliquée."
}
finally {
    Set-Location -LiteralPath $oldLocation
    $env:CARLOG_BACKUP_ENV_PATH = $oldEnvPath
    $mongoUri = $null
    if (Test-Path -LiteralPath $configFile) { Remove-Item -LiteralPath $configFile -Force }
    if (Test-Path -LiteralPath $partialArchive) { Remove-Item -LiteralPath $partialArchive -Force }
}
