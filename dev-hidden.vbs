' Hidden launcher for the Taro H5 dev server (no console window)
Option Explicit

Dim sh, fso, scriptDir, taroJs, logPath, cmd, http, i, ready

Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = scriptDir

taroJs = "node_modules\@tarojs\cli\bin\taro"
logPath = scriptDir & "\dev-server.log"

' Start the webpack dev server completely hidden; output goes to a log file
cmd = "cmd /c node " & taroJs & " build --type h5 --watch > """ & logPath & """ 2>&1"
sh.Run cmd, 0, False

' Poll the local server until webpack finishes compiling (max ~120s)
Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
ready = False
For i = 1 To 120
  WScript.Sleep 1000
  On Error Resume Next
  http.Open "GET", "http://localhost:10086/", False
  http.Send
  If Err.Number = 0 Then
    If http.Status = 200 Then
      ready = True
      Exit For
    End If
  End If
  Err.Clear
  On Error GoTo 0
Next

' Open the game in the default browser once ready
If ready Then
  sh.Run "cmd /c start """" ""http://localhost:10086/""", 0, False
End If
