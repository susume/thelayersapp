$ErrorActionPreference = 'Stop'
$toolkitRoot = Split-Path -Parent $PSScriptRoot
. (Join-Path $toolkitRoot 'layers-guard-common.ps1')

function Assert-LayersGuardTest {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw "FAIL: $Message" }
}

Assert-LayersGuardTest (Test-LayersGuardExtensionId 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa') 'valid extension IDs are accepted'
Assert-LayersGuardTest (-not (Test-LayersGuardExtensionId 'not-an-extension-id')) 'invalid extension IDs are rejected'
Assert-LayersGuardTest (-not (Test-LayersGuardExtensionId '')) 'missing extension IDs are rejected'

$originalJson = '{"*":{"installation_mode":"allowed"},"abcdefghijklmnopabcdefghijklmnop":{"installation_mode":"normal_installed","update_url":"https://example.test/update"}}'
$mergedJson = Merge-LayersGuardExtensionSettings -CurrentJson $originalJson -ExtensionId 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
$merged = ConvertFrom-LayersGuardExtensionSettings $mergedJson
Assert-LayersGuardTest $merged.Contains('*') 'ExtensionSettings wildcard is preserved'
Assert-LayersGuardTest $merged.Contains('abcdefghijklmnopabcdefghijklmnop') 'unrelated ExtensionSettings entries are preserved'
Assert-LayersGuardTest ([string]$merged['aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa']['installation_mode'] -eq 'force_installed') 'Layers Guard entry is force-installed'
Assert-LayersGuardTest ([string]$merged['aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa']['update_url'] -eq $script:LayersGuardForceInstallUpdateUrl) 'force-install update URL is stable'

$existingTargetJson = '{"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa":{"installation_mode":"allowed","update_url":"https://example.test/update","toolbar_pin":true},"*":{"installation_mode":"blocked"}}'
$mergedExistingTarget = ConvertFrom-LayersGuardExtensionSettings (Merge-LayersGuardExtensionSettings -CurrentJson $existingTargetJson -ExtensionId 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
Assert-LayersGuardTest ([bool]$mergedExistingTarget['aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa']['toolbar_pin']) 'existing Layers Guard entry fields are preserved'
Assert-LayersGuardTest ([string]$mergedExistingTarget['*']['installation_mode'] -eq 'blocked') 'existing wildcard remains unchanged'

$unsafeMergeRejected = $false
try { [void](Merge-LayersGuardExtensionSettings -CurrentJson '{"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa":true}' -ExtensionId 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa') } catch { $unsafeMergeRejected = $true }
Assert-LayersGuardTest $unsafeMergeRejected 'unsafe existing Layers Guard entries are rejected'

$policyValues = [ordered]@{
    BrowserGuestModeEnabled = [pscustomobject]@{ exists = $false; type = $null; value = $null }
    IncognitoModeAvailability = [pscustomobject]@{ exists = $true; type = 'DWord'; value = 0 }
}
$extensionSnapshot = [pscustomobject]@{ exists = $true; type = 'String'; value = $originalJson }
$backup = New-LayersGuardPolicyBackup -PolicyValues $policyValues -ExtensionSettings $extensionSnapshot -ManagedValues $null -ExtensionId $null
$roundTrip = ConvertFrom-Json (ConvertTo-Json $backup -Depth 20)
Assert-LayersGuardTest ($roundTrip.formatVersion -eq 1) 'backup format round-trips'
Assert-LayersGuardTest (-not $roundTrip.policyValues.BrowserGuestModeEnabled.exists) 'absent registry values remain absent in backups'
Assert-LayersGuardTest ([string]$roundTrip.extensionSettings.value -eq $originalJson) 'ExtensionSettings backup value round-trips'

$mergeText = Get-Content -LiteralPath (Join-Path $toolkitRoot 'layers-guard-common.ps1') -Raw
$checkText = Get-Content -LiteralPath (Join-Path $toolkitRoot 'layers-guard-check.ps1') -Raw
$hardenText = Get-Content -LiteralPath (Join-Path $toolkitRoot 'layers-guard-harden.ps1') -Raw
Assert-LayersGuardTest ($hardenText -match 'Test-LayersGuardAdministrator') 'hardening checks elevation'
Assert-LayersGuardTest ($checkText -notmatch 'Set-LayersGuard|Remove-ItemProperty|New-ItemProperty') 'check script has no registry write operations'
Assert-LayersGuardTest ($mergeText -match 'Merge-LayersGuardExtensionSettings') 'merge helper is present'
Assert-LayersGuardTest ($hardenText -match 'no stable Web Store extension ID was supplied') 'missing extension IDs are reported as incomplete'
Assert-LayersGuardTest ($hardenText -match "windowsHardeningApplied' -Value 0") 'hardening invalidates stale attestation before writes'
Assert-LayersGuardTest ($hardenText -match 'Could not verify Chrome policy') 'hardening reads back browser policies before attesting'
$restoreText = Get-Content -LiteralPath (Join-Path $toolkitRoot 'layers-guard-restore.ps1') -Raw
Assert-LayersGuardTest ($restoreText -match 'markerInvalidated') 'restore can roll back an interrupted attestation safely'


$complex = '{"*":{"blocked_permissions":[],"runtime_blocked_hosts":["https://example.test"],"PSCustom":{},"flag":false}}'
$complexMap = ConvertFrom-LayersGuardExtensionSettings (Merge-LayersGuardExtensionSettings -CurrentJson $complex -ExtensionId 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
Assert-LayersGuardTest ($complexMap['*']['blocked_permissions'] -is [array] -and $complexMap['*']['blocked_permissions'].Count -eq 0) 'empty arrays survive policy merge'
Assert-LayersGuardTest ($complexMap['*']['runtime_blocked_hosts'] -is [array] -and $complexMap['*']['runtime_blocked_hosts'].Count -eq 1) 'single-element arrays survive policy merge'
Assert-LayersGuardTest ($complexMap['*']['PSCustom'] -is [System.Collections.IDictionary]) 'empty objects and PS-prefixed keys survive policy merge'
Assert-LayersGuardTest (-not (Test-LayersGuardObjectEqual 'Allowed' 'allowed')) 'restore comparisons are case sensitive'
Assert-LayersGuardTest (-not (Test-LayersGuardObjectEqual $true 'True')) 'restore comparisons preserve scalar types'
Assert-LayersGuardTest (-not (Test-LayersGuardExtensionId 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')) 'uppercase IDs are rejected'

foreach ($strings in @(@(), @('one'), @('one', 'two'))) {
    $encoded = ConvertTo-LayersGuardJsonValue -Value $strings -Type MultiString
    $decoded = ConvertFrom-LayersGuardJsonValue -Value $encoded -Type MultiString
    Assert-LayersGuardTest ($decoded -is [string[]] -and $decoded.Count -eq $strings.Count) 'MultiString snapshots preserve array shape'
}
$bytes = ConvertFrom-LayersGuardJsonValue -Value '' -Type Binary
Assert-LayersGuardTest ($bytes -is [byte[]] -and $bytes.Length -eq 0) 'empty binary snapshots preserve type'
Write-Output 'Windows hardening helper checks passed'
