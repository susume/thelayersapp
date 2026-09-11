@echo off
setlocal EnableExtensions DisableDelayedExpansion
title Layers Guard - Windows Secure Mode Setup

set "EXTENSION_ID=alielgklefmocpmnmfahepacngmeomof"
set "SOURCE_BASE=https://raw.githubusercontent.com/susume/thelayersapp/542a72628a0b9cf018b35395d46db8c5c4955e39/windows-hardening"
set "BACKUP_DIR=%ProgramData%\Layers Guard"
set "BACKUP_PATH=%BACKUP_DIR%\layers-guard-policy-backup.json"
set "WORKDIR=%TEMP%\LayersGuardSetup-%RANDOM%-%RANDOM%"
set "LG_SETUP_FILE=%~f0"

rem Relaunch this installer with Administrator rights when necessary.
powershell.exe -NoProfile -Command "$p=New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent()); if($p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)){exit 0}else{exit 1}" >nul 2>&1
if errorlevel 1 (
    echo Layers Guard needs Windows administrator permission.
    echo A Windows permission prompt will appear now.
    powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$q='""'+$env:LG_SETUP_FILE+'""'; Start-Process -FilePath $env:ComSpec -ArgumentList '/d','/c',$q -Verb RunAs"
    exit /b
)

cls
echo ============================================================
echo   Layers Guard - Windows Secure Mode
echo ============================================================
echo.
echo Setting up protection. You do not need to type anything.
echo.

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%" >nul 2>&1
if not exist "%WORKDIR%" mkdir "%WORKDIR%" >nul 2>&1
if not exist "%BACKUP_DIR%" goto :fail
if not exist "%WORKDIR%" goto :fail

call :download "layers-guard-common.ps1" "57058d820475e90cd425a1e7fa266d757d29ef83"
if errorlevel 1 goto :fail
call :download "layers-guard-check.ps1" "5b34fb3aefb193b504a103d8042ad96e4d416585"
if errorlevel 1 goto :fail
call :download "layers-guard-harden.ps1" "ee52cdb2957243f7af663da7c625678784be15b5"
if errorlevel 1 goto :fail
call :download "layers-guard-restore.ps1" "928231151347b62a88d3bfc39ff66cf77be2668f"
if errorlevel 1 goto :fail

echo.
echo Applying Windows Secure Mode...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%WORKDIR%\layers-guard-harden.ps1" -ExtensionId "%EXTENSION_ID%" -BackupPath "%BACKUP_PATH%"
if errorlevel 1 goto :fail

rem Keep a verified local copy with the policy backup for simple future rollback.
copy /Y "%WORKDIR%\layers-guard-common.ps1" "%BACKUP_DIR%\layers-guard-common.ps1" >nul
if errorlevel 1 goto :fail
copy /Y "%WORKDIR%\layers-guard-check.ps1" "%BACKUP_DIR%\layers-guard-check.ps1" >nul
if errorlevel 1 goto :fail
copy /Y "%WORKDIR%\layers-guard-harden.ps1" "%BACKUP_DIR%\layers-guard-harden.ps1" >nul
if errorlevel 1 goto :fail
copy /Y "%WORKDIR%\layers-guard-restore.ps1" "%BACKUP_DIR%\layers-guard-restore.ps1" >nul
if errorlevel 1 goto :fail

echo.
echo Verifying protection...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%WORKDIR%\layers-guard-check.ps1" -ExtensionId "%EXTENSION_ID%"
if errorlevel 1 goto :fail

rd /S /Q "%WORKDIR%" >nul 2>&1

echo.
echo ============================================================
echo   DONE - WINDOWS SECURE MODE IS INSTALLED
echo ============================================================
echo.
echo Layers Guard is now protected by Windows Chrome policies.
echo If Chrome is already open, close and reopen it once.
echo.
echo Your rollback backup is stored safely in:
echo %BACKUP_DIR%
echo.
echo You can close this window.
echo.
pause
exit /b 0

:download
set "FILE_NAME=%~1"
set "EXPECTED_BLOB=%~2"
echo Downloading %FILE_NAME%...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; $ProgressPreference='SilentlyContinue'; Invoke-WebRequest -UseBasicParsing -Uri '%SOURCE_BASE%/%FILE_NAME%' -OutFile '%WORKDIR%\%FILE_NAME%'" >nul 2>&1
if errorlevel 1 (
    echo ERROR: Could not securely download %FILE_NAME%.
    exit /b 1
)

rem Verify the exact Git blob SHA before any downloaded script is executed.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$p='%WORKDIR%\%FILE_NAME%'; $b=[IO.File]::ReadAllBytes($p); $h=[Text.Encoding]::ASCII.GetBytes(('blob '+$b.Length+[char]0)); $all=New-Object byte[] ($h.Length+$b.Length); [Array]::Copy($h,0,$all,0,$h.Length); [Array]::Copy($b,0,$all,$h.Length,$b.Length); $s=[Security.Cryptography.SHA1]::Create(); try{$actual=([BitConverter]::ToString($s.ComputeHash($all))).Replace('-','').ToLowerInvariant()}finally{$s.Dispose()}; if($actual -ne '%EXPECTED_BLOB%'){Write-Error 'Downloaded file failed integrity verification.'; exit 1}" >nul 2>&1
if errorlevel 1 (
    echo ERROR: Security verification failed for %FILE_NAME%.
    exit /b 1
)
exit /b 0

:fail
echo.
echo ============================================================
echo   SETUP DID NOT COMPLETE
echo ============================================================
echo.
echo No unverified script was allowed to run.
echo If protection was partly applied, running this installer again is safe.
echo For help, visit:
echo https://thelayersapp.com/guard-windows.html
echo.
rd /S /Q "%WORKDIR%" >nul 2>&1
pause
exit /b 1
