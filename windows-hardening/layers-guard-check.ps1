[CmdletBinding()]
param(
    [AllowNull()][string]$ExtensionId,
    [switch]$PoliciesOnly,
    [string]$PolicyRoot = 'HKLM:\SOFTWARE\Policies\Google\Chrome'
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'layers-guard-common.ps1')

function Test-LayersGuardDwordPolicy {
    param(
        [Parameter(Mandatory = $true)][string]$PolicyPath,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][int]$Expected,
        [Parameter(Mandatory = $true)][string]$Label
    )
    $actual = Get-LayersGuardRegistrySnapshot -Path $PolicyPath -Name $Name
    $wanted = [pscustomobject]@{ exists = $true; type = 'DWord'; value = $Expected }
    if (Test-LayersGuardSnapshotEqual $actual $wanted) {
        Write-Host "[PASS] $Label"
        return $true
    }
    Write-Warning "[WARN] $Label is not configured (expected $Expected)."
    return $false
}

try {
    Write-Host 'Layers Guard Windows Hardening Check'
    Write-Host ''
    $policyPath = Get-LayersGuardPolicyPath $PolicyRoot
    $complete = $true
    if (-not (Test-LayersGuardDwordPolicy -PolicyPath $policyPath -Name 'BrowserGuestModeEnabled' -Expected 0 -Label 'Guest Mode disabled')) { $complete = $false }
    if (-not (Test-LayersGuardDwordPolicy -PolicyPath $policyPath -Name 'IncognitoModeAvailability' -Expected 1 -Label 'Incognito disabled')) { $complete = $false }
    if (-not (Test-LayersGuardDwordPolicy -PolicyPath $policyPath -Name 'BrowserAddPersonEnabled' -Expected 0 -Label 'New Chrome profiles disabled')) { $complete = $false }
    if (-not (Test-LayersGuardDwordPolicy -PolicyPath $policyPath -Name 'ExtensionDeveloperModeSettings' -Expected 1 -Label 'Extension Developer Mode disabled')) { $complete = $false }

    if ($ExtensionId -and -not (Test-LayersGuardExtensionId $ExtensionId)) {
        throw 'The supplied -ExtensionId is not a valid 32-character Chrome Web Store extension ID.'
    }
    if ($ExtensionId) {
        $extensionSnapshot = Get-LayersGuardRegistrySnapshot -Path $policyPath -Name 'ExtensionSettings'
        $forceInstalled = $false
        if ($extensionSnapshot.exists -and [string]$extensionSnapshot.type -in @('String', 'ExpandString')) {
            try {
                $settings = ConvertFrom-LayersGuardExtensionSettings ([string]$extensionSnapshot.value)
                if ($settings.Contains($ExtensionId)) {
                    $entry = $settings[$ExtensionId]
                    if ($entry -is [System.Collections.IDictionary] -and [string]$entry['installation_mode'] -eq 'force_installed' -and [string]$entry['update_url'] -eq $script:LayersGuardForceInstallUpdateUrl) { $forceInstalled = $true }
                }
            } catch { }
        }
        if ($forceInstalled) { Write-Host '[PASS] Layers Guard force-install policy present' } else { Write-Warning '[WARN] Layers Guard force-install policy is not configured.'; $complete = $false }

        if (-not $PoliciesOnly) {
        $managedPath = Get-LayersGuardManagedPolicyPath -ExtensionId $ExtensionId -PolicyRoot $PolicyRoot
        $marker = Get-LayersGuardRegistrySnapshot -Path $managedPath -Name 'windowsHardeningApplied'
        $version = Get-LayersGuardRegistrySnapshot -Path $managedPath -Name 'windowsHardeningVersion'
        $markerWanted = [pscustomobject]@{ exists = $true; type = 'DWord'; value = 1 }
        $versionWanted = [pscustomobject]@{ exists = $true; type = 'DWord'; value = 2 }
        if ((Test-LayersGuardSnapshotEqual $marker $markerWanted) -and (Test-LayersGuardSnapshotEqual $version $versionWanted)) {
            Write-Host '[PASS] Windows Secure Mode attestation marker present'
        } else {
            Write-Warning '[WARN] Windows Secure Mode attestation marker or version is not present.'
            $complete = $false
        }
        }
    } else {
        Write-Warning 'Layers Guard force-install not configured because no stable Web Store extension ID was supplied.'
        $complete = $false
    }

    $profiles = @(Get-LayersGuardChromeProfiles)
    if ($profiles.Count -gt 1) {
        Write-Warning "Chrome profiles detected: $($profiles.Count). Layers Guard cannot safely delete existing profiles; inspect Chrome's profile picker."
    } else {
        Write-Host "[PASS] Chrome profile review found $($profiles.Count) profile(s)"
    }

    Write-Host ''
    Write-Host 'Administrators on this PC:'
    foreach ($administrator in @(Get-LayersGuardAdministrators)) { Write-Host "- $administrator" }
    Write-Host "Confirm that the child's account is NOT listed above."
    Write-Host 'The child Windows account should be a Standard User. No accounts were changed.'
    if (-not (Test-LayersGuardAdministrator)) { Write-Host '[INFO] Check ran without elevation; it is read-only.' }

    if ($complete) { exit 0 }
    exit 2
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
