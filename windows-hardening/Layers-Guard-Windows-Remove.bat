@echo off
setlocal EnableExtensions DisableDelayedExpansion
title Layers Guard - Remove Windows Secure Mode

set "BACKUP_DIR=%ProgramData%\Layers Guard"
set "BACKUP_PATH=%BACKUP_DIR%\layers-guard-policy-backup.json"
set "RESTORE_SCRIPT=%BACKUP_DIR%\layers-guard-restore.ps1"
set "COMMON_SCRIPT=%BACKUP_DIR%\layers-guard-common.ps1"
set "LG_REMOVE_FILE=%~f0"

rem Relaunch with Administrator rights when necessary.
powershell.exe -NoProfile -Command "$p=New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent()); if($p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)){exit 0}else{exit 1}" >nul 2>&1
if errorlevel 1 (
    echo Layers Guard needs Windows administrator permission.
    echo A Windows permission prompt will appear now.
    powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$q='""'+$env:LG_REMOVE_FILE+'""'; Start-Process -FilePath $env:ComSpec -ArgumentList '/d','/c',$q -Verb RunAs"
    exit /b
)

cls
echo ============================================================
echo   Layers Guard - Remove Windows Secure Mode
echo ============================================================
echo.

if not exist "%BACKUP_PATH%" (
    echo No Layers Guard Windows Secure Mode backup was found.
    echo Nothing was changed.
    echo.
    pause
    exit /b 1
)
if not exist "%COMMON_SCRIPT%" goto :missing
if not exist "%RESTORE_SCRIPT%" goto :missing

echo Restoring the Windows Chrome policies that existed before setup...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%RESTORE_SCRIPT%" -BackupPath "%BACKUP_PATH%"
set "RESTORE_EXIT=%ERRORLEVEL%"

if "%RESTORE_EXIT%"=="0" (
    echo.
    echo ============================================================
    echo   DONE - WINDOWS SECURE MODE WAS REMOVED
    echo ============================================================
    echo.
    echo The previous Chrome policy values were restored.
    echo If Chrome is already open, close and reopen it once.
    echo.
    pause
    exit /b 0
)

echo.
echo The restore completed with a warning or conflict.
echo Layers Guard deliberately did not overwrite settings that another
echo administrator changed after Windows Secure Mode was installed.
echo Please visit https://thelayersapp.com/guard-windows.html for help.
echo.
pause
exit /b %RESTORE_EXIT%

:missing
echo The rollback backup exists, but a required verified restore file is missing.
echo Nothing was changed.
echo Please visit https://thelayersapp.com/guard-windows.html for help.
echo.
pause
exit /b 1
