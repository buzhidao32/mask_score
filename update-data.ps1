param(
  [string]$MaskUpgrade,
  [string]$Tujian,
  [string]$InputDir
)

$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$defaultInputDir = Join-Path $projectRoot 'update-data'

if (-not $InputDir) {
  $InputDir = $defaultInputDir
}

if (-not $MaskUpgrade) {
  $MaskUpgrade = Join-Path $InputDir 'maskUpgrade.lua'
}

if (-not $Tujian) {
  $Tujian = Join-Path $InputDir 'tujian.lua'
}

if (-not (Test-Path $MaskUpgrade)) {
  throw "maskUpgrade.lua was not found. Put it in: $InputDir"
}

if (-not (Test-Path $Tujian)) {
  throw "tujian.lua was not found. Put it in: $InputDir"
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

Write-Host "Using dropped files:" -ForegroundColor Cyan
Write-Host "  maskUpgrade: $MaskUpgrade"
Write-Host "  tujian     : $Tujian"
Write-Host ""

$pythonCommand = Get-PythonCommand
if ($pythonCommand -eq 'python') {
  & python $generatorPath `
    --mask-upgrade $MaskUpgrade `
    --tujian $Tujian `
    --out $outputPath
} else {
  & py -3 $generatorPath `
    --mask-upgrade $MaskUpgrade `
    --tujian $Tujian `
    --out $outputPath
}

Write-Host ""
Write-Host "Updated output:" -ForegroundColor Green
Write-Host "  $outputPath"
