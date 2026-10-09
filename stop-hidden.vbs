' Stop the Taro H5 dev server by killing whichever process owns port 10086
Option Explicit

Dim sh, psCmd
Set sh = CreateObject("WScript.Shell")

psCmd = "powershell -NoProfile -WindowStyle Hidden -Command ""Get-NetTCPConnection -LocalPort 10086 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"""
sh.Run psCmd, 0, True
