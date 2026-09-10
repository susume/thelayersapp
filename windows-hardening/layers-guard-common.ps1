# Shared, auditable helpers for the Layers Guard Windows hardening toolkit.
# This file performs no work when dot-sourced; the three entry-point scripts
# decide whether a read or a machine-level write is appropriate.

$script:LayersGuardToolkitVersion = '1.0'
$script:LayersGuardForceInstallUpdateUrl = 'https://clients2.google.com/service/update2/crx'

function Test-LayersGuardAdministrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-LayersGuardExtensionId {
    param([AllowNull()][string]$ExtensionId)
    if ([string]::IsNullOrWhiteSpace($ExtensionId)) { return $false }
    return $ExtensionId -cmatch '^[a-p]{32}$'
}

function Get-LayersGuardPolicyPath {
    param([string]$PolicyRoot = 'HKLM:\SOFTWARE\Policies\Google\Chrome')
    return $PolicyRoot
}

function Get-LayersGuardManagedPolicyPath {
    param(
        [Parameter(Mandatory = $true)][string]$ExtensionId,
        [string]$PolicyRoot = 'HKLM:\SOFTWARE\Policies\Google\Chrome'
    )
    return (Join-Path (Join-Path (Join-Path $PolicyRoot '3rdparty') 'extensions') (Join-Path $ExtensionId 'policy'))
}

function ConvertTo-LayersGuardJsonValue {
    param($Value, [string]$Type)
    if ($null -eq $Value) { return $null }
    if ($Type -eq 'Binary') { return [Convert]::ToBase64String([byte[]]$Value) }
    if ($Type -eq 'MultiString') { return ,@($Value) }
    return $Value
}

function ConvertFrom-LayersGuardJsonValue {
    param($Value, [string]$Type)
    if ($Type -eq 'Binary') { return ,([Convert]::FromBase64String([string]$Value)) }
    if ($Type -eq 'MultiString') { return ,([string[]]@($Value)) }
    return $Value
}

function Get-LayersGuardRegistrySnapshot {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Name
    )
    $snapshot = [ordered]@{
        exists = $false
        type = $null
        value = $null
    }
    if (-not (Test-Path -LiteralPath $Path)) {
        return [pscustomobject]$snapshot
    }
    try {
        $key = Get-Item -LiteralPath $Path -ErrorAction Stop
        if ($key.GetValueNames() -notcontains $Name) {
            return [pscustomobject]$snapshot
        }
        $kind = $key.GetValueKind($Name).ToString()
        $raw = $key.GetValue($Name, $null, [Microsoft.Win32.RegistryValueOptions]::DoNotExpandEnvironmentNames)
        $snapshot.exists = $true
        $snapshot.type = $kind
        $snapshot.value = ConvertTo-LayersGuardJsonValue -Value $raw -Type $kind
        return [pscustomobject]$snapshot
    } catch {
        throw "Could not read registry value '$Name' at '$Path': $($_.Exception.Message)"
    }
}

function Test-LayersGuardSnapshotEqual {
    param($Left, $Right)
    $leftExists = [bool]($Left -and $Left.exists)
    $rightExists = [bool]($Right -and $Right.exists)
    if ($leftExists -ne $rightExists) { return $false }
    if (-not $leftExists) { return $true }
    if ([string]$Left.type -ne [string]$Right.type) { return $false }
    $leftJson = ConvertTo-Json -InputObject $Left.value -Depth 20 -Compress
    $rightJson = ConvertTo-Json -InputObject $Right.value -Depth 20 -Compress
    return $leftJson -ceq $rightJson
}

function Set-LayersGuardRegistrySnapshot {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)]$Snapshot
    )
    if (-not $Snapshot.exists) {
        if (Test-Path -LiteralPath $Path) {
            Remove-ItemProperty -LiteralPath $Path -Name $Name -ErrorAction SilentlyContinue
        }
        return
    }
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -Path $Path -Force -ErrorAction Stop | Out-Null
    }
    $value = ConvertFrom-LayersGuardJsonValue -Value $Snapshot.value -Type $Snapshot.type
    New-ItemProperty -LiteralPath $Path -Name $Name -Value $value -PropertyType $Snapshot.type -Force -ErrorAction Stop | Out-Null
}

function Set-LayersGuardDword {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][int]$Value
    )
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -Path $Path -Force -ErrorAction Stop | Out-Null
    }
    New-ItemProperty -LiteralPath $Path -Name $Name -Value $Value -PropertyType DWord -Force -ErrorAction Stop | Out-Null
}

function Set-LayersGuardString {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Value
    )
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -Path $Path -Force -ErrorAction Stop | Out-Null
    }
    New-ItemProperty -LiteralPath $Path -Name $Name -Value $Value -PropertyType String -Force -ErrorAction Stop | Out-Null
}

function ConvertTo-LayersGuardHashtable {
    param($InputObject)
    if ($null -eq $InputObject) { return $null }
    if ($InputObject -is [System.Collections.IDictionary]) {
        $result = [ordered]@{}
        foreach ($key in $InputObject.Keys) { $result[[string]$key] = ConvertTo-LayersGuardHashtable $InputObject[$key] }
        return $result
    }
    if (($InputObject -is [System.Collections.IEnumerable]) -and ($InputObject -isnot [string])) {
        $result = @()
        foreach ($item in $InputObject) { $result += ,(ConvertTo-LayersGuardHashtable $item) }
        return ,$result
    }
    if ($InputObject -is [pscustomobject]) {
        $result = [ordered]@{}
        foreach ($property in $InputObject.PSObject.Properties) {
            $result[$property.Name] = ConvertTo-LayersGuardHashtable $property.Value
        }
        return $result
    }
    return $InputObject
}

function Test-LayersGuardObjectEqual {
    param($Left, $Right)
    $leftMap = $Left -is [System.Collections.IDictionary]
    $rightMap = $Right -is [System.Collections.IDictionary]
    if ($leftMap -or $rightMap) {
        if (-not ($leftMap -and $rightMap)) { return $false }
        $leftKeys = @($Left.Keys | ForEach-Object { [string]$_ } | Sort-Object)
        $rightKeys = @($Right.Keys | ForEach-Object { [string]$_ } | Sort-Object)
        if (($leftKeys -join "`n") -cne ($rightKeys -join "`n")) { return $false }
        foreach ($key in $leftKeys) { if (-not (Test-LayersGuardObjectEqual $Left[$key] $Right[$key])) { return $false } }
        return $true
    }
    if (($Left -is [System.Collections.IEnumerable]) -and ($Left -isnot [string]) -and ($Right -is [System.Collections.IEnumerable]) -and ($Right -isnot [string])) {
        $leftItems = @($Left)
        $rightItems = @($Right)
        if ($leftItems.Count -ne $rightItems.Count) { return $false }
        for ($index = 0; $index -lt $leftItems.Count; $index++) { if (-not (Test-LayersGuardObjectEqual $leftItems[$index] $rightItems[$index])) { return $false } }
        return $true
    }
    return ((ConvertTo-Json -InputObject $Left -Compress -Depth 100) -ceq (ConvertTo-Json -InputObject $Right -Compress -Depth 100))
}

function ConvertFrom-LayersGuardExtensionSettings {
    param([AllowNull()][string]$Json)
    if ([string]::IsNullOrWhiteSpace($Json)) { return [ordered]@{} }
    try {
        if (-not $Json.TrimStart().StartsWith('{')) { throw 'ExtensionSettings root must be an object.' }
        $parsed = ConvertFrom-Json -InputObject $Json -ErrorAction Stop
        $map = ConvertTo-LayersGuardHashtable $parsed
        if (-not ($map -is [System.Collections.IDictionary])) { throw 'ExtensionSettings root must be an object.' }
        return $map
    } catch {
        throw "Chrome ExtensionSettings is not valid JSON: $($_.Exception.Message)"
    }
}

function ConvertTo-LayersGuardExtensionSettingsJson {
    param([Parameter(Mandatory = $true)]$Map)
    return (ConvertTo-Json -InputObject $Map -Depth 100 -Compress -WarningAction Stop)
}

function New-LayersGuardForceInstallEntry {
    return [ordered]@{
        installation_mode = 'force_installed'
        update_url = $script:LayersGuardForceInstallUpdateUrl
    }
}

function Merge-LayersGuardExtensionSettings {
    param(
        [AllowNull()][string]$CurrentJson,
        [Parameter(Mandatory = $true)][string]$ExtensionId
    )
    if (-not (Test-LayersGuardExtensionId $ExtensionId)) { throw 'ExtensionId must be a valid 32-character Chrome Web Store ID.' }
    $map = ConvertFrom-LayersGuardExtensionSettings $CurrentJson
    $entry = [ordered]@{}
    if ($map.Contains($ExtensionId)) {
        if (-not ($map[$ExtensionId] -is [System.Collections.IDictionary])) { throw "ExtensionSettings entry $ExtensionId must be an object; refusing to overwrite it." }
        foreach ($key in $map[$ExtensionId].Keys) { $entry[$key] = $map[$ExtensionId][$key] }
    }
    $entry.installation_mode = 'force_installed'
    $entry.update_url = $script:LayersGuardForceInstallUpdateUrl
    $map[$ExtensionId] = $entry
    return ConvertTo-LayersGuardExtensionSettingsJson $map
}

function New-LayersGuardPolicyBackup {
    param(
        [Parameter(Mandatory = $true)]$PolicyValues,
        [Parameter(Mandatory = $true)]$ExtensionSettings,
        [AllowNull()]$ManagedValues,
        [AllowNull()][string]$ExtensionId
    )
    $owned = @()
    if ($ExtensionId) { $owned = @($ExtensionId) }
    return [ordered]@{
        formatVersion = 1
        toolkitVersion = $script:LayersGuardToolkitVersion
        createdAt = (Get-Date).ToUniversalTime().ToString('o')
        extensionId = $ExtensionId
        ownedExtensionIds = $owned
        policyValues = $PolicyValues
        extensionSettings = $ExtensionSettings
        managedValues = $ManagedValues
    }
}

function Read-LayersGuardPolicyBackup {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { throw "Policy backup not found: $Path" }
    try {
        $backup = ConvertFrom-Json -InputObject (Get-Content -LiteralPath $Path -Raw -ErrorAction Stop) -ErrorAction Stop
        if ($backup.formatVersion -ne 1 -or $null -eq $backup.policyValues -or $null -eq $backup.extensionSettings) { throw 'Backup format is incomplete.' }
        $snapshots = @($backup.extensionSettings)
        foreach ($name in @('BrowserGuestModeEnabled', 'IncognitoModeAvailability', 'BrowserAddPersonEnabled', 'ExtensionDeveloperModeSettings')) {
            $snapshots += $backup.policyValues.$name
        }
        if ($backup.managedValues) {
            $snapshots += $backup.managedValues.windowsHardeningApplied
            $snapshots += $backup.managedValues.windowsHardeningVersion
        }
        foreach ($snapshot in $snapshots) {
            if ($null -eq $snapshot -or $snapshot.exists -isnot [bool]) { throw 'Backup contains an invalid registry snapshot.' }
            if ($snapshot.exists) {
                if ($snapshot.type -notin @('String', 'ExpandString', 'DWord', 'QWord', 'MultiString', 'Binary', 'None') -or $null -eq $snapshot.value) {
                    throw 'Backup contains an invalid registry type or value.'
                }
                [void](ConvertFrom-LayersGuardJsonValue -Value $snapshot.value -Type $snapshot.type)
            }
        }
        if ($backup.extensionSettings.exists) {
            [void](ConvertFrom-LayersGuardExtensionSettings ([string]$backup.extensionSettings.value))
        }
        return $backup
    } catch {
        throw "Could not read Layers Guard policy backup: $($_.Exception.Message)"
    }
}

function Write-LayersGuardPolicyBackup {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)]$Backup
    )
    $directory = Split-Path -Parent $Path
    if ($directory -and -not (Test-Path -LiteralPath $directory)) { New-Item -ItemType Directory -Path $directory -Force | Out-Null }
    $json = ConvertTo-Json -InputObject $Backup -Depth 30
    Set-Content -LiteralPath $Path -Value $json -Encoding UTF8 -ErrorAction Stop
}

function Get-LayersGuardChromeProfiles {
    $profiles = @()
    if ([string]::IsNullOrWhiteSpace($env:LOCALAPPDATA)) { return $profiles }
    $userData = Join-Path $env:LOCALAPPDATA 'Google\Chrome\User Data'
    $localState = Join-Path $userData 'Local State'
    if (Test-Path -LiteralPath $localState) {
        try {
            $state = ConvertFrom-Json -InputObject (Get-Content -LiteralPath $localState -Raw -ErrorAction Stop) -ErrorAction Stop
            if ($state.profile -and $state.profile.info_cache) {
                foreach ($property in $state.profile.info_cache.PSObject.Properties) {
                    $profiles += [pscustomobject]@{ directory = $property.Name; name = [string]$property.Value.name }
                }
            }
        } catch { }
    }
    if (-not $profiles.Count -and (Test-Path -LiteralPath $userData)) {
        Get-ChildItem -LiteralPath $userData -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq 'Default' -or $_.Name -like 'Profile *' } | ForEach-Object {
            $profiles += [pscustomobject]@{ directory = $_.Name; name = $_.Name }
        }
    }
    return @($profiles | Sort-Object directory -Unique)
}

function Get-LayersGuardAdministrators {
    try {
        if (Get-Command Get-LocalGroupMember -ErrorAction SilentlyContinue) {
            return @(Get-LocalGroupMember -SID 'S-1-5-32-544' -ErrorAction Stop | ForEach-Object { [string]$_.Name })
        }
    } catch { }
    try {
        $group = [ADSI]'WinNT://./Administrators,group'
        return @($group.psbase.Invoke('Members') | ForEach-Object { $_.GetType().InvokeMember('Name', 'GetProperty', $null, $_, $null) })
    } catch {
        return @('Unable to enumerate the local Administrators group')
    }
}
