<#
.SYNOPSIS
    Run an ExtendScript file inside Adobe InDesign via Windows COM.

.DESCRIPTION
    Launcher used by scriptExecutor.js to invoke DoScript without the winax
    native addon (which would require Visual Studio C++ build tools). Reads
    a .jsx file, tries multiple InDesign ProgIDs to attach or launch via COM
    Running Object Table (ROT), calls DoScript with ScriptLanguage.JAVASCRIPT
    (enum value 1246973031), and writes the return value to stdout as UTF-8.

.PARAMETER ScriptPath
    Absolute path to the .jsx file to execute.

.OUTPUTS
    stdout: Whatever ExtendScript returned (last expression value).
    stderr: Diagnostic on failure.

.EXITCODES
    0  success
    1  could not create InDesign COM object (not installed / not registered)
    2  DoScript threw an error inside InDesign
    3  script file not found
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$ScriptPath
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

if (-not (Test-Path -LiteralPath $ScriptPath -PathType Leaf)) {
    [Console]::Error.WriteLine("Script file not found: $ScriptPath")
    exit 3
}

$jsx = Get-Content -LiteralPath $ScriptPath -Raw -Encoding UTF8

# Prefer newer/future versions first, then generic, then older, then Server.
# Matches upstream scriptExecutor.js ProgID priority.
$progIds = @(
    'InDesign.Application.2026',
    'InDesign.Application.CC.2026',
    'InDesign.Application.2025',
    'InDesign.Application.CC.2025',
    'InDesign.Application',
    'InDesign.Application.2024',
    'InDesign.Application.CC.2024',
    'InDesign.Application.2023',
    'InDesign.Application.CC.2023',
    'InDesign.Application.2022',
    'InDesign.Application.CC.2022',
    'InDesignServer.Application.2025',
    'InDesignServer.Application.2024',
    'InDesignServer.Application'
)

$app = $null
$lastError = $null
foreach ($id in $progIds) {
    try {
        $app = New-Object -ComObject $id -ErrorAction Stop
        break
    } catch {
        $lastError = $_.Exception.Message
    }
}

if (-not $app) {
    $msg = "Could not create InDesign COM object. Tried: $($progIds -join ', '). " +
           "Last error: $lastError. " +
           "Tips: Ensure Adobe InDesign desktop is installed and has been launched " +
           "at least once so COM is registered."
    [Console]::Error.WriteLine($msg)
    exit 1
}

try {
    # 1246973031 = ScriptLanguage.JAVASCRIPT enum value (ExtendScript).
    $result = $app.DoScript($jsx, 1246973031)
    if ($null -ne $result) {
        [Console]::Out.Write([string]$result)
    }
    exit 0
} catch {
    [Console]::Error.WriteLine("DoScript failed: $($_.Exception.Message)")
    exit 2
}
