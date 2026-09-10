[CmdletBinding()]
param(
    [string]$BackupPath = (Join-Path $PSScriptRoot 'layers-guard-policy-backup.json'),
    [string]$PolicyRoot = 'HKLM:\SOFTWARE\Policies\Google\Chrome'
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'layers-guard-common.ps1')

function Restore-LayersGuardOwnedValue {
    param(
        [Parameter(Mandatory = $true)][string]$PolicyPath,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)]$Expected,
        [Parameter(Mandatory = $true)]$Original,
        [AllowNull()]$AlternateExpected
    )
    $current = Get-LayersGuardRegistrySnapshot -Path $PolicyPath -Name $Name
    $ownedCurrent = Test-LayersGuardSnapshotEqual $current $Expected
    if (-not $ownedCurrent -and $AlternateExpected) {
        # The hardener intentionally writes this temporary invalidated state
        # before a retry. It is still toolkit-owned and safe to roll back.
        $ownedCurrent = Test-LayersGuardSnapshotEqual $current $AlternateExpected
    }
    if ($ownedCurrent) {
        Set-LayersGuardRegistrySnapshot -Path $PolicyPath -Name $Name -Snapshot $Original
        Write-Host "[PASS] Restored $Name"
        return $true
    }
    if (Test-LayersGuardSnapshotEqual $current $Original) {
        Write-Host "[PASS] $Name was already restored"
        return $true
    }
    Write-Warning "[WARN] $Name was changed after Layers Guard setup; leaving the current value untouched."
    return $false
}

try {
    Write-Host 'Layers Guard Windows Hardening Restore'
    Write-Host ''
    if (-not (Test-LayersGuardAdministrator)) {
        Write-Error 'Administrator privileges are required. No machine policy was changed.'
        exit 1
    }
    $backup = Read-LayersGuardPolicyBackup $BackupPath
    $policyPath = Get-LayersGuardPolicyPath $PolicyRoot
    $complete = $true
    $expected = @{
        BrowserGuestModeEnabled = [pscustomobject]@{ exists = $true; type = 'DWord'; value = 0 }
        IncognitoModeAvailability = [pscustomobject]@{ exists = $true; type = 'DWord'; value = 1 }
        BrowserAddPersonEnabled = [pscustomobject]@{ exists = $true; type = 'DWord'; value = 0 }
        ExtensionDeveloperModeSettings = [pscustomobject]@{ exists = $true; type = 'DWord'; value = 1 }
    }
    foreach ($name in $expected.Keys) {
        $original = $backup.policyValues.PSObject.Properties[$name].Value
        if (-not (Restore-LayersGuardOwnedValue -PolicyPath $policyPath -Name $name -Expected $expected[$name] -Original $original)) { $complete = $false }
    }

    $ownedIds = @()
    if ($backup.ownedExtensionIds) { $ownedIds = @($backup.ownedExtensionIds | ForEach-Object { [string]$_ } | Where-Object { Test-LayersGuardExtensionId $_ }) }
    if (-not $ownedIds.Count -and $backup.extensionId -and (Test-LayersGuardExtensionId ([string]$backup.extensionId))) { $ownedIds = @([string]$backup.extensionId) }
    $extensionSnapshot = Get-LayersGuardRegistrySnapshot -Path $policyPath -Name 'ExtensionSettings'
    if ($ownedIds.Count -and $extensionSnapshot.exists) {
        if ([string]$extensionSnapshot.type -notin @('String', 'ExpandString')) {
            Write-Warning '[WARN] ExtensionSettings is not a string; leaving it untouched.'
            $complete = $false
        } else {
            try {
                $currentMap = ConvertFrom-LayersGuardExtensionSettings ([string]$extensionSnapshot.value)
                $originalMap = [ordered]@{}
                if ($backup.extensionSettings.exists) { $originalMap = ConvertFrom-LayersGuardExtensionSettings ([string]$backup.extensionSettings.value) }
                $changed = $false
                foreach ($id in $ownedIds) {
                    if (-not $currentMap.Contains($id)) { continue }
                    $entry = $currentMap[$id]
                    $hasExpectedSettings = $entry -is [System.Collections.IDictionary] -and
                        [string]$entry['installation_mode'] -eq 'force_installed' -and
                        [string]$entry['update_url'] -eq $script:LayersGuardForceInstallUpdateUrl
                    if (-not $hasExpectedSettings) {
                        Write-Warning "[WARN] ExtensionSettings entry $id was changed after Layers Guard setup; leaving that entry untouched."
                        $complete = $false
                        continue
                    }

                    if ($originalMap.Contains($id)) {
                        $originalEntry = $originalMap[$id]
                        $safe = $originalEntry -is [System.Collections.IDictionary]
                        if ($safe) {
                            # Hardening owns only these two fields. If another
                            # administrator changed a preserved field after
                            # setup, do not overwrite that newer value.
                            foreach ($key in $originalEntry.Keys) {
                                if ($key -in @('installation_mode', 'update_url')) { continue }
                                if (-not $entry.Contains($key) -or -not (Test-LayersGuardObjectEqual $entry[$key] $originalEntry[$key])) {
                                    $safe = $false
                                    break
                                }
                            }
                        }
                        if ($safe) {
                            $restoredEntry = [ordered]@{}
                            foreach ($key in $originalEntry.Keys) { $restoredEntry[$key] = $originalEntry[$key] }
                            foreach ($key in $entry.Keys) {
                                if (-not $restoredEntry.Contains($key) -and $key -notin @('installation_mode', 'update_url')) { $restoredEntry[$key] = $entry[$key] }
                            }
                            $currentMap[$id] = $restoredEntry
                            $changed = $true
                        } else {
                            Write-Warning "[WARN] ExtensionSettings entry $id has a newer preserved field; leaving that entry untouched."
                            $complete = $false
                        }
                    } else {
                        # This entry was created by the toolkit. Remove only
                        # the fields we added, retaining any later fields.
                        $remainingEntry = [ordered]@{}
                        foreach ($key in $entry.Keys) {
                            if ($key -notin @('installation_mode', 'update_url')) { $remainingEntry[$key] = $entry[$key] }
                        }
                        if ($remainingEntry.Keys.Count -eq 0) { $currentMap.Remove($id) } else { $currentMap[$id] = $remainingEntry }
                        $changed = $true
                    }
                }
                if ($changed) {
                    if ($currentMap.Keys.Count -eq 0 -and -not $backup.extensionSettings.exists) {
                        Remove-ItemProperty -LiteralPath $policyPath -Name 'ExtensionSettings' -ErrorAction SilentlyContinue
                    } else {
                        $restoredSnapshot = [pscustomobject]@{ exists = $true; type = [string]$extensionSnapshot.type; value = ConvertTo-LayersGuardExtensionSettingsJson $currentMap }
                        Set-LayersGuardRegistrySnapshot -Path $policyPath -Name 'ExtensionSettings' -Snapshot $restoredSnapshot
                    }
                    Write-Host '[PASS] Restored Layers Guard ExtensionSettings entry'
                }
            } catch {
                Write-Warning "[WARN] Could not safely restore ExtensionSettings: $($_.Exception.Message)"
                $complete = $false
            }
        }
    }

    if ($ownedIds.Count -and $backup.managedValues) {
        foreach ($id in $ownedIds) {
            $managedPath = Get-LayersGuardManagedPolicyPath -ExtensionId $id -PolicyRoot $PolicyRoot
            $markerExpected = [pscustomobject]@{ exists = $true; type = 'DWord'; value = 1 }
            $versionExpected = [pscustomobject]@{ exists = $true; type = 'DWord'; value = 2 }
            $legacyVersion = [pscustomobject]@{ exists = $true; type = 'DWord'; value = 1 }
            $markerOriginal = $backup.managedValues.PSObject.Properties['windowsHardeningApplied'].Value
            $versionOriginal = $backup.managedValues.PSObject.Properties['windowsHardeningVersion'].Value
            $markerInvalidated = [pscustomobject]@{ exists = $true; type = 'DWord'; value = 0 }
            if (-not (Restore-LayersGuardOwnedValue -PolicyPath $managedPath -Name 'windowsHardeningApplied' -Expected $markerExpected -Original $markerOriginal -AlternateExpected $markerInvalidated)) { $complete = $false }
            if (-not (Restore-LayersGuardOwnedValue -PolicyPath $managedPath -Name 'windowsHardeningVersion' -Expected $versionExpected -Original $versionOriginal -AlternateExpected $legacyVersion)) { $complete = $false }
        }
    }

    Write-Host ''
    if ($complete) {
        Write-Host 'Layers Guard hardening values were restored conservatively.'
        exit 0
    }
    Write-Warning 'Restore completed with conflicts. Review the warnings; unrelated administrator changes were preserved.'
    exit 2
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
