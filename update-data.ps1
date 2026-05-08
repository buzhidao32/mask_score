param(
  [string]$MaskUpgrade,
  [string]$Tujian,
  [string]$FamilySpecial,
  [Alias("SourceRoot")]
  [string]$LuaTablePath,
  [string]$InputDir
)

$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$defaultInputDir = Join-Path $projectRoot 'update-data'
$defaultSourcePath = Join-Path $projectRoot 'update-source.txt'

if (-not $LuaTablePath -and (Test-Path $defaultSourcePath)) {
  $configuredSource = Get-Content -LiteralPath $defaultSourcePath |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ -and -not $_.StartsWith('#') } |
    Select-Object -First 1

  if ($configuredSource) {
    $LuaTablePath = $configuredSource -replace '^[\s''"]+|[\s''"]+$', ''
  }
}

if ($LuaTablePath) {
  if (-not (Test-Path $LuaTablePath)) {
    throw "LuaTablePath was not found: $LuaTablePath"
  }

  $resolvedLuaTablePath = (Resolve-Path -LiteralPath $LuaTablePath).Path
  $luaTablePathChild = Join-Path $resolvedLuaTablePath 'luaTablePath'
  if ((Split-Path -Leaf $resolvedLuaTablePath) -ne 'luaTablePath' -and (Test-Path $luaTablePathChild)) {
    $resolvedLuaTablePath = (Resolve-Path -LiteralPath $luaTablePathChild).Path
  }

  $othersDir = Join-Path $resolvedLuaTablePath 'res\script\others'
  if (-not (Test-Path $othersDir)) {
    throw "res\script\others was not found under: $resolvedLuaTablePath"
  }

  if (-not $InputDir) {
    $InputDir = $othersDir
  }

  if (-not $MaskUpgrade) {
    $MaskUpgrade = Join-Path $othersDir 'maskUpgrade.lua'
  }

  if (-not $Tujian) {
    $Tujian = Join-Path $othersDir 'tujian.lua'
  }

  if (-not $FamilySpecial) {
    $FamilySpecial = Join-Path $othersDir 'familyspecial.lua'
  }
}

if (-not $InputDir) {
  $InputDir = $defaultInputDir
}

if (-not $MaskUpgrade) {
  $MaskUpgrade = Join-Path $InputDir 'maskUpgrade.lua'
}

if (-not $Tujian) {
  $Tujian = Join-Path $InputDir 'tujian.lua'
}

if (-not $FamilySpecial) {
  $familySpecialCandidate = Join-Path $InputDir 'familyspecial.lua'
  if (Test-Path $familySpecialCandidate) {
    $FamilySpecial = $familySpecialCandidate
  } else {
    $maskUpgradeDir = Split-Path -Parent $MaskUpgrade
    $familySpecialCandidate = Join-Path $maskUpgradeDir 'familyspecial.lua'
    if (Test-Path $familySpecialCandidate) {
      $FamilySpecial = $familySpecialCandidate
    }
  }
}

if (-not (Test-Path $MaskUpgrade)) {
  throw "maskUpgrade.lua was not found. Put it in: $InputDir"
}

if (-not (Test-Path $Tujian)) {
  throw "tujian.lua was not found. Put it in: $InputDir"
}

if ($FamilySpecial -and -not (Test-Path $FamilySpecial)) {
  throw "familyspecial.lua was not found: $FamilySpecial"
}

$outputPath = Join-Path $projectRoot 'data\mask_scores.json'
$generatorPath = Join-Path $projectRoot 'scripts\generate_data.py'

function Get-PythonCommand {
  if (Get-Command python -ErrorAction SilentlyContinue) {
    return 'python'
  }

  if (Get-Command py -ErrorAction SilentlyContinue) {
    return 'py'
  }

  throw "Python was not found. Install Python or the py launcher first."
}

Write-Host "Using source files:" -ForegroundColor Cyan
if ($LuaTablePath) {
  Write-Host "  luaTablePath: $resolvedLuaTablePath"
}
Write-Host "  maskUpgrade: $MaskUpgrade"
Write-Host "  tujian     : $Tujian"
if ($FamilySpecial) {
  Write-Host "  family    : $FamilySpecial"
}
Write-Host ""

$pythonCommand = Get-PythonCommand
$generatorArgs = @(
  $generatorPath,
  '--mask-upgrade', $MaskUpgrade,
  '--tujian', $Tujian,
  '--out', $outputPath
)

if ($FamilySpecial) {
  $generatorArgs += @('--family-special', $FamilySpecial)
}

if ($pythonCommand -eq 'python') {
  & python @generatorArgs
} else {
  & py -3 @generatorArgs
}

Write-Host ""
Write-Host "Updated output:" -ForegroundColor Green
Write-Host "  $outputPath"
