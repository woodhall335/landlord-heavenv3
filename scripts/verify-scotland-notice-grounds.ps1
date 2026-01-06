Param()

$ErrorActionPreference = 'Stop'

$groundConfigPath = "config/jurisdictions/uk/scotland/eviction_grounds.json"
$templatePaths = @(
  "config/jurisdictions/uk/scotland/templates/eviction/notice_to_leave.hbs",
  "config/jurisdictions/uk/scotland/templates/eviction/notice_to_leave_official.hbs"
)
$detailsTemplatePath = "config/jurisdictions/uk/scotland/templates/eviction/notice_to_leave.hbs"

function Write-StatusTable {
  param(
    [string]$Header,
    [System.Collections.Generic.List[object]]$Rows
  )

  Write-Host "`n$Header" -ForegroundColor Cyan
  $Rows | ForEach-Object {
    $symbol = if ($_.Present) { "✅" } else { "❌" }
    Write-Host ("Ground {0}: {1}" -f $_.Ground, $symbol + " " + $_.Message)
  }
}

$expectedGrounds = 1..18
$hasErrors = $false

# Check config grounds
try {
  $config = Get-Content -Path $groundConfigPath -Raw | ConvertFrom-Json
} catch {
  Write-Host "❌ Could not parse $groundConfigPath: $_" -ForegroundColor Red
  exit 1
}

$configStatuses = New-Object 'System.Collections.Generic.List[object]'
$requiredKeys = @("number", "title", "description", "legal_reference", "notice_period_days")
foreach ($i in $expectedGrounds) {
  $key = "ground_$i"
  $ground = $config.grounds.$key
  $exists = $null -ne $ground
  $missingKeys = @()
  if ($exists) {
    foreach ($req in $requiredKeys) {
      if ($null -eq $ground.$req -or $ground.$req -eq "") {
        $missingKeys += $req
      }
    }
  }
  $present = $exists -and $missingKeys.Count -eq 0
  $message = if (-not $exists) {
    "missing in eviction_grounds.json"
  } elseif ($missingKeys.Count -gt 0) {
    "missing keys: " + ($missingKeys -join ',')
  } else {
    "all required keys present"
  }
  if (-not $present) { $hasErrors = $true }
  $configStatuses.Add([pscustomobject]@{ Ground = $i; Present = $present; Message = $message })
}

Write-StatusTable -Header "Config coverage (required keys)" -Rows $configStatuses

# Check template coverage
foreach ($templatePath in $templatePaths) {
  $templateStatuses = New-Object 'System.Collections.Generic.List[object]'
  foreach ($i in $expectedGrounds) {
    $pattern = "ground_${i}"
    $match = Select-String -Path $templatePath -Pattern $pattern -SimpleMatch -Quiet
    $message = if ($match) { "present in $templatePath" } else { "missing in $templatePath" }
    if (-not $match) { $hasErrors = $true }
    $templateStatuses.Add([pscustomobject]@{ Ground = $i; Present = $match; Message = $message })
  }

  Write-StatusTable -Header "Template coverage: $templatePath" -Rows $templateStatuses
}

# Check detail placeholders in main notice template
$detailStatuses = New-Object 'System.Collections.Generic.List[object]'
foreach ($i in $expectedGrounds) {
  $pattern = "ground_${i}_details"
  $match = Select-String -Path $detailsTemplatePath -Pattern $pattern -SimpleMatch -Quiet
  $message = if ($match) { "details placeholder present in $detailsTemplatePath" } else { "details placeholder missing" }
  if (-not $match) { $hasErrors = $true }
  $detailStatuses.Add([pscustomobject]@{ Ground = $i; Present = $match; Message = $message })
}

Write-StatusTable -Header "Details placeholders: $detailsTemplatePath" -Rows $detailStatuses

if ($hasErrors) {
  Write-Host "`n❌ One or more grounds are missing." -ForegroundColor Red
  exit 1
}

Write-Host "`n✅ All grounds 1..18 are present in config and templates." -ForegroundColor Green
