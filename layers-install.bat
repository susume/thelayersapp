@echo off
echo Installing Layers Chrome extension policy...

reg add "HKLM\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist" ^
  /v 1 ^
  /t REG_SZ ^
  /d "iclfdiolilnmjeimkdoeloeiioaongnh;https://clients2.google.com/service/update2/crx" ^
  /f

if %errorlevel% == 0 (
  echo.
  echo SUCCESS: Layers extension will install automatically next time Chrome is opened.
) else (
  echo.
  echo ERROR: Registry write failed. Make sure you ran this as Administrator.
)

echo.
pause
