@echo off
setlocal
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0update-data.ps1"
if errorlevel 1 (
  echo.
  echo 更新失败
) else (
  echo.
  echo 更新完成
)
pause
