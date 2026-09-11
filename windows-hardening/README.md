# Layers Guard Windows hardening toolkit

This toolkit applies conservative, machine-level Google Chrome policies for a parent who administers a Windows PC. It is deliberately separate from the Chrome extension: a browser extension cannot execute an Administrator PowerShell script or enforce Windows policy on its own.

## Recommended parent setup: one click

For normal parent use, do **not** ask parents to work in PowerShell manually.

1. Open `https://thelayersapp.com/guard-windows.html`.
2. Download `Layers-Guard-Windows-Setup.bat`.
3. Double-click it and approve the Windows Administrator prompt.
4. Done. If Chrome is already open, close and reopen it once.

The BAT installer:

- requests Administrator permission automatically;
- downloads the exact reviewed PowerShell scripts from a version-pinned public commit;
- verifies each downloaded file against its expected Git blob hash before execution;
- runs `layers-guard-harden.ps1` with the published Layers Guard Chrome Web Store ID;
- runs the read-only checker automatically;
- stores the rollback backup and verified restore files under `%ProgramData%\Layers Guard`;
- deletes its temporary working files after setup.

A matching `Layers-Guard-Windows-Remove.bat` provides a one-click conservative rollback using the saved backup.

## What it configures

`layers-guard-harden.ps1` writes these values under `HKLM\SOFTWARE\Policies\Google\Chrome`:

| Policy | Value | Purpose |
| --- | ---: | --- |
| `BrowserGuestModeEnabled` | `0` | Disable Chrome Guest Mode |
| `IncognitoModeAvailability` | `1` | Disable Incognito Mode intentionally |
| `BrowserAddPersonEnabled` | `0` | Prevent creating new Chrome profiles |
| `ExtensionDeveloperModeSettings` | `1` | Prevent Developer Mode on `chrome://extensions` |

When a real, stable Chrome Web Store extension ID is supplied, the script also merges a `force_installed` entry into `ExtensionSettings` and writes the extension-managed marker under Chrome's `3rdparty\extensions` policy path.

The version 2 marker is written only after the hardener runs `layers-guard-check.ps1 -PoliciesOnly` successfully. This read-only mode checks the actual browser and force-install policies without requiring the marker that is about to be written. Older markers require rerunning the hardener.

The marker records that verification; it does not continuously inspect policy changes or prove Chrome has accepted them. Restart Chrome, review `chrome://policy`, and rerun the checker after policy changes.

The PowerShell hardener itself never hardcodes an extension ID. If `-ExtensionId` is omitted, the four browser policies are still applied, but force-install is skipped and the command exits with code `2` to indicate incomplete setup. The parent BAT supplies the published Layers Guard ID automatically.

## Advanced manual setup

Technical users can still run the toolkit manually from a trusted local copy. Open an elevated PowerShell window and run:

```powershell
Set-Location 'C:\path\to\windows-hardening'
.\layers-guard-harden.ps1 -ExtensionId 'alielgklefmocpmnmfahepacngmeomof'
.\layers-guard-check.ps1 -ExtensionId 'alielgklefmocpmnmfahepacngmeomof'
```

The harden script requires Administrator privileges. By default it creates `layers-guard-policy-backup.json` beside the scripts before changing any targeted value. Running it again is idempotent and preserves unrelated `ExtensionSettings` entries and wildcard defaults.

To roll back the values owned by this toolkit manually:

```powershell
.\layers-guard-restore.ps1
```

Restore is conservative. If an administrator changed a targeted value after setup, the script warns and leaves that current value untouched. It restores only the original values captured in the backup and only removes a Layers Guard force-install/attestation entry when that entry still matches the expected value. It never deletes the Chrome policy tree or Chrome profiles.

## Existing profiles and Windows accounts

`BrowserAddPersonEnabled=0` does not remove profiles that already exist. The checker reports multiple profiles when Chrome's local profile metadata is available. Review the Chrome profile picker and remove or secure unused profiles manually; the toolkit does not guess which profile belongs to a child and never deletes user data.

The child's Windows account should be a Standard User. The scripts list local Administrators where practical, but they never demote or remove accounts. The parent should retain the Administrator password.

## Beyond Chrome

Layers Guard protects one Chrome profile. It does not control Microsoft Edge, Firefox, Brave, Opera, portable browsers, embedded browsers, games, native applications, other devices, or a user who has Windows Administrator access.

The strongest household setup combines:

1. Layers Guard for the child's Chrome profile.
2. These Chrome machine policies.
3. A Standard Windows account for the child.
4. Vendor-neutral OS parental controls and/or router or DNS filtering for coverage beyond Chrome.

This toolkit does not change DNS, router settings, firewall rules, browser processes, scheduled tasks, services, or browsing-history collection.

## Safety notes

- The core PowerShell scripts do not download or execute additional remote code.
- The optional one-click BAT bootstrap downloads only the version-pinned public toolkit files and verifies their expected Git blob hashes before running them.
- No telemetry or background service is installed.
- The checker is read-only.
- A policy backup is created before targeted values are changed.
- The extension cannot guarantee that every browser or device is protected.
- Force-installing an unpacked development extension is not guaranteed on a normal unmanaged home PC; use a published Web Store ID or an appropriate managed deployment environment.
