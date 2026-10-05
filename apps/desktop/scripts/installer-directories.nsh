!include "LogicLib.nsh"

Var khFinalDirectory
Var khNewDirectory
Var khOldDirectory
Var khOldMoved
Var khNewMoved

!macro khExtractPayload FILE
  !ifmacrodef customInstallerExtract
    !insertmacro customInstallerExtract "${FILE}"
  !else
    nsExec::ExecToStack '"$PLUGINSDIR\kh-7za.exe" x -y -bd -bb0 "-o$INSTDIR" "${FILE}"'
    Pop $R0
    Pop $R1
  !endif
  ${If} $R0 != 0
    DetailPrint $R1
    Call khRollbackDirectories
    !ifmacrodef customInstallerExtractFailed
      !insertmacro customInstallerExtractFailed "${FILE}"
    !else
      MessageBox MB_OK|MB_ICONEXCLAMATION "$(decompressionFailed)" /SD IDOK
    !endif
    SetErrorLevel 2
    Quit
  ${EndIf}
!macroend

!macro khStageApplication
  StrCpy $khFinalDirectory $INSTDIR
  System::Call 'ole32::CoCreateGuid(g .r0) i .r1'
  ${If} $1 != 0
    SetErrorLevel 2
    Quit
  ${EndIf}
  StrCpy $khNewDirectory "$INSTDIR.new-$0"
  StrCpy $khOldDirectory "$INSTDIR.old-$0"
  StrCpy $khOldMoved ""
  StrCpy $khNewMoved ""
  ClearErrors
  CreateDirectory $khNewDirectory
  ${If} ${Errors}
    SetErrorLevel 2
    Quit
  ${EndIf}
  File /oname=$PLUGINSDIR\kh-7za.exe "${KH_SEVENZIP_PATH}"
  StrCpy $INSTDIR $khNewDirectory
  SetOutPath $INSTDIR
  !insertmacro installApplicationFiles
  !ifdef KH_SEVENZIP_LICENSE_DIR
    File /oname=7zip-installer-LICENSE.txt "${KH_SEVENZIP_LICENSE_DIR}\LICENSE.txt"
    File /oname=7zip-installer-COPYING.txt "${KH_SEVENZIP_LICENSE_DIR}\COPYING"
  !endif
  !ifdef UNINSTALLER_ICON
    File /oname=uninstallerIcon.ico "${UNINSTALLER_ICON}"
  !endif
  StrCpy $INSTDIR $khFinalDirectory
  SetOutPath $PLUGINSDIR
!macroend

Function .onGUIEnd
  Call khCleanupDirectories
FunctionEnd

Function khCleanupDirectories
  ${If} $khFinalDirectory != ""
    Call khRollbackDirectories
  ${EndIf}
FunctionEnd

; Only directories created or renamed by this installer are removed during rollback.
Function khRollbackDirectories
  SetOutPath $PLUGINSDIR
  ${If} $khNewMoved == "1"
    RMDir /r "\\?\$khFinalDirectory"
    StrCpy $khNewMoved ""
  ${EndIf}
  ${If} $khOldMoved == "1"
    ClearErrors
    Rename $khOldDirectory $khFinalDirectory
    ${If} ${Errors}
      ; Leave the complete backup in place if another process prevents restoration.
      DetailPrint $khOldDirectory
      Return
    ${EndIf}
    StrCpy $khOldMoved ""
  ${EndIf}
  ${If} $khNewDirectory != ""
    RMDir /r "\\?\$khNewDirectory"
  ${EndIf}
  StrCpy $INSTDIR $khFinalDirectory
FunctionEnd

Function khPromoteDirectories
  !ifmacrodef InstallerPublishStage
    !insertmacro InstallerPublishStage 2
  !endif
  ; SetOutPath opens a directory handle; release it before either rename.
  SetOutPath $PLUGINSDIR
  ClearErrors
  ${If} ${FileExists} "$khFinalDirectory\*.*"
    Rename $khFinalDirectory $khOldDirectory
    ${If} ${Errors}
      Call khRollbackDirectories
      SetErrors
      Return
    ${EndIf}
    StrCpy $khOldMoved "1"
  ${Else}
    ; NSIS can create the destination before the install section starts.
    RMDir $khFinalDirectory
  ${EndIf}
  ClearErrors
  Rename $khNewDirectory $khFinalDirectory
  ${If} ${Errors}
    Call khRollbackDirectories
    SetErrors
    Return
  ${EndIf}
  StrCpy $khNewMoved "1"
  SetOutPath $khFinalDirectory
  !ifmacrodef InstallerPublishStage
    !insertmacro InstallerPublishStage 3
  !endif
  ClearErrors
FunctionEnd

!macro khFinishDirectories
  StrCpy $khNewMoved ""
  ${If} $khOldMoved == "1"
    RMDir /r "\\?\$khOldDirectory"
    StrCpy $khOldMoved ""
  ${EndIf}
!macroend
