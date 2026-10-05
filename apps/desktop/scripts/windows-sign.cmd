@echo off
setlocal DisableDelayedExpansion
set "signTool=%KH_DESKTOP_WINDOWS_SIGNTOOL%"
set "certificateFile=%KH_DESKTOP_WINDOWS_CER_FILE%"
set "tokenPin=%KH_DESKTOP_WINDOWS_TOKEN_PIN%"
set "keyContainer=%KH_DESKTOP_WINDOWS_KEY_CONTAINER%"
set "targetFile=%KH_DESKTOP_WINDOWS_SIGN_TARGET%"
set "appendSignature="
if "%KH_DESKTOP_WINDOWS_SIGN_APPEND%"=="1" set "appendSignature=/as"
set "KH_DESKTOP_WINDOWS_SIGNTOOL="
set "KH_DESKTOP_WINDOWS_CER_FILE="
set "KH_DESKTOP_WINDOWS_TOKEN_PIN="
set "KH_DESKTOP_WINDOWS_KEY_CONTAINER="
set "KH_DESKTOP_WINDOWS_SIGN_TARGET="
set "KH_DESKTOP_WINDOWS_SIGN_APPEND="
set "signTool=" & set "certificateFile=" & set "tokenPin=" & set "keyContainer=" & set "targetFile=" & set "appendSignature=" & "%signTool%" sign /v /fd sha256 /f "%certificateFile%" /kc "[{{%tokenPin%}}]=%keyContainer%" /csp "eToken Base Cryptographic Provider" %appendSignature% "%targetFile%"
exit /b %errorlevel%
