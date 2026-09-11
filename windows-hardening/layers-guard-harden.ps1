[CmdletBinding()]
param(
    [AllowNull()][string]$ExtensionId,
    [string]$BackupPath = (Join-Path $PSScriptRoot 'layers-guard-policy-backup.json'),
    [string]$PolicyRoot = 'HKLM:\SOFTWARE\Policies\Google\Chrome'
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'layers-guard-common.ps1')

function Invoke-LayersGuardHarden {
    param(
        [AllowNull()][string]$RequestedExtensionId,
        [Parameter(Mandatory = $true)][string]$RequestedBackupPath,
        [Parameter(Mandatory = $true)][string]$RequestedPolicyRoot
    )

    Write-Host 'Layers Guard Windows Hardening'
    Write-Host ''
    if (-not (Test-LayersGuardAdministrator)) {
        Write-Error 'Administrator privileges are required. No machine policy was changed.'
        return [pscustomobject]@{ Complete = $false; Changed = $false }
    }
    if ($RequestedExtensionId -and -not (Test-LayersGuardExtensionId $RequestedExtensionId)) {
        throw 'The supplied -ExtensionId is not a valid 32-character Chrome Web Store extension ID.'
    }

    $policyPath = Get-LayersGuardPolicyPath $RequestedPolicyRoot
    $extensionSnapshot = Get-LayersGuardRegistrySnapshot -Path $policyPath -Name 'ExtensionSettings'
    $preparedExtensionSettings = $null
    if ($RequestedExtensionId) {
        if ($extensionSnapshot.exists -and [string]$extensionSnapshot.type -notin @('String', 'ExpandString')) {
            throw 'ExtensionSettings exists but is not a string registry value; refusing to overwrite an administrator policy.'
        }
        # Validate and prepare the merge before changing any value. A malformed
        # policy or unsafe target entry must stop the operation without writes.
        $currentExtensionJson = if ($extensionSnapshot.exists) { [string]$extensionSnapshot.value } else { '' }
        $preparedExtensionSettings = Merge-LayersGuardExtensionSettings -CurrentJson $currentExtensionJson -ExtensionId $RequestedExtensionId
    }

    $policyValues = [ordered]@{}
    foreach ($name in @('BrowserGuestModeEnabled', 'IncognitoModeAvailability', 'BrowserAddPersonEnabled', 'ExtensionDeveloperModeSettings')) {
        $policyValues[$name] = Get-LayersGuardRegistrySnapshot -Path $policyPath -Name $name
    }

    $managedValues = $null
    $managedPath = $null
    if ($RequestedExtensionId) {
        $managedPath = Get-LayersGuardManagedPolicyPath -ExtensionId $RequestedExtensionId -PolicyRoot $RequestedPolicyRoot
        $managedValues = [ordered]@{
            windowsHardeningApplied = Get-LayersGuardRegistrySnapshot -Path $managedPath -Name 'windowsHardeningApplied'
            windowsHardeningVersion = Get-LayersGuardRegistrySnapshot -Path $managedPath -Name 'windowsHardeningVersion'
        }
    }

    $backup = $null
    if (Test-Path -LiteralPath $RequestedBackupPath) {
        $backup = Read-LayersGuardPolicyBackup $RequestedBackupPath
        if ($RequestedExtensionId -and $backup.extensionId -and (Test-LayersGuardExtensionId ([string]$backup.extensionId)) -and [string]$backup.extensionId -ne $RequestedExtensionId) {
            throw "The existing backup belongs to extension ID '$($backup.extensionId)'; refusing to combine it with '$RequestedExtensionId'. Use a separate -BackupPath for another extension."
        }
        if ($RequestedExtensionId) {
            $backupNeedsWrite = $false
            if ($null -eq $backup.managedValues) {
                # A first run may have intentionally skipped force-install
                # because no stable ID was known. Capture the marker's original
                # state before this later run adds it.
                $backup.managedValues = $managedValues
                $backupNeedsWrite = $true
            }
            $backupOwned = @()
            if ($backup.ownedExtensionIds) { $backupOwned = @($backup.ownedExtensionIds | ForEach-Object { [string]$_ } | Where-Object { Test-LayersGuardExtensionId $_ }) }
            if ($backupOwned -notcontains $RequestedExtensionId) {
                # ExtensionSettings was not touched by the earlier no-ID run.
                # Capture its state now, immediately before first taking ownership.
                $backup.extensionSettings = $extensionSnapshot
                $backup.ownedExtensionIds = @($backupOwned + $RequestedExtensionId)
                $backup.extensionId = $RequestedExtensionId
                $backupNeedsWrite = $true
            }
            # Record every field needed for restore before any registry write.
            if ($backupNeedsWrite) { Write-LayersGuardPolicyBackup -Path $RequestedBackupPath -Backup $backup }
        }
    } else {
        $backup = New-LayersGuardPolicyBackup -PolicyValues $policyValues -ExtensionSettings $extensionSnapshot -ManagedValues $managedValues -ExtensionId $RequestedExtensionId
        Write-LayersGuardPolicyBackup -Path $RequestedBackupPath -Backup $backup
        Write-Host "[PASS] Original policy values backed up to $RequestedBackupPath"
    }

    # A previous successful run may have left an attestation marker behind.
    # Invalidate it before touching the browser policies so a later failure
    # cannot leave the extension showing a stale green status.
    if ($RequestedExtensionId) {
        Set-LayersGuardDword -Path $managedPath -Name 'windowsHardeningApplied' -Value 0
    }

    foreach ($name in @('BrowserGuestModeEnabled', 'IncognitoModeAvailability', 'BrowserAddPersonEnabled', 'ExtensionDeveloperModeSettings')) {
        Set-LayersGuardDword -Path $policyPath -Name $name -Value (@{
            BrowserGuestModeEnabled = 0
            IncognitoModeAvailability = 1
            BrowserAddPersonEnabled = 0
            ExtensionDeveloperModeSettings = 1
        }[$name])
    }
    Write-Host '[PASS] Guest Mode disabled'
    Write-Host '[PASS] Incognito disabled'
    Write-Host '[PASS] New Chrome profiles disabled'
    Write-Host '[PASS] Extension Developer Mode disabled'

    $complete = $true
    if ($RequestedExtensionId) {
        $mergedSnapshot = [pscustomobject]@{ exists = $true; type = $(if ($extensionSnapshot.exists) { [string]$extensionSnapshot.type } else { 'String' }); value = $preparedExtensionSettings }
        Set-LayersGuardRegistrySnapshot -Path $policyPath -Name 'ExtensionSettings' -Snapshot $mergedSnapshot

        $expectedPolicies = @{
            BrowserGuestModeEnabled = 0
            IncognitoModeAvailability = 1
            BrowserAddPersonEnabled = 0
            ExtensionDeveloperModeSettings = 1
        }
        foreach ($name in $expectedPolicies.Keys) {
            $actual = Get-LayersGuardRegistrySnapshot -Path $policyPath -Name $name
            $expected = [pscustomobject]@{ exists = $true; type = 'DWord'; value = [int]$expectedPolicies[$name] }
            if (-not (Test-LayersGuardSnapshotEqual $actual $expected)) {
                throw "Could not verify Chrome policy '$name' after writing it."
            }
        }
        $actualExtension = Get-LayersGuardRegistrySnapshot -Path $policyPath -Name 'ExtensionSettings'
        if (-not (Test-LayersGuardSnapshotEqual $actualExtension $mergedSnapshot)) {
            throw 'Could not verify the merged ExtensionSettings policy after writing it.'
        }

        # The managed marker is written only after all targeted policy values
        # have been read back successfully. The separate check script remains
        # the authoritative independent registry check for the parent.
        & (Join-Path $PSScriptRoot 'layers-guard-check.ps1') -ExtensionId $RequestedExtensionId -PolicyRoot $RequestedPolicyRoot -PoliciesOnly
        if ($LASTEXITCODE -ne 0) { throw 'Windows hardening checker failed; attestation remains disabled.' }
        Set-LayersGuardDword -Path $managedPath -Name 'windowsHardeningVersion' -Value 2
        Set-LayersGuardDword -Path $managedPath -Name 'windowsHardeningApplied' -Value 1
        Write-Host '[PASS] Layers Guard force-install policy merged'
        Write-Host '[PASS] Windows Secure Mode attestation configured'
    } else {
        $complete = $false
        Write-Warning 'Layers Guard force-install not configured because no stable Web Store extension ID was supplied.'
    }

    $profiles = @(Get-LayersGuardChromeProfiles)
    if ($profiles.Count -gt 1) {
        Write-Warning "Chrome profiles detected: $($profiles.Count). Layers Guard cannot safely delete existing profiles; review and secure unused profiles."
    } else {
        Write-Host "[PASS] Chrome profile review found $($profiles.Count) profile(s)"
    }
    Write-Host ''
    Write-Host 'The child Windows account should be a Standard User. Accounts were not changed.'
    Write-Host 'Restart Chrome to complete protection.'
    return [pscustomobject]@{ Complete = $complete; Changed = $true }
}

try {
    $result = Invoke-LayersGuardHarden -RequestedExtensionId $ExtensionId -RequestedBackupPath $BackupPath -RequestedPolicyRoot $PolicyRoot
    if (-not $result.Complete) { exit 2 }
    exit 0
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
