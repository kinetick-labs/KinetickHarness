@echo off
setlocal DisableDelayedExpansion
set "ELECTRON_RUN_AS_NODE=1"
"%~dp0..\..\..\..\KinetickHarness.exe" --expose-internals "%~dp0..\..\..\app.asar\kh\node_modules\@deepseek-ai\kh-desktop-host\lib\cli.js" %*
exit /b %errorlevel%
