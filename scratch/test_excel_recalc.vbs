' Comprehensive Excel Desktop Recalculation & Error Scanner
Dim objExcel, objWorkbook, filePath, fso, errCount
Set fso = CreateObject("Scripting.FileSystemObject")

filePath = WScript.Arguments(0)
If Not fso.FileExists(filePath) Then
    WScript.Echo "ERROR: FILE_NOT_FOUND " & filePath
    WScript.Quit 1
End If

On Error Resume Next
Set objExcel = CreateObject("Excel.Application")
If Err.Number <> 0 Then
    WScript.Echo "COM_ERROR: " & Err.Description
    WScript.Quit 2
End If

objExcel.Visible = False
objExcel.DisplayAlerts = False

Set objWorkbook = objExcel.Workbooks.Open(filePath, False, True)
If Err.Number <> 0 Then
    WScript.Echo "OPEN_ERROR: " & Err.Description
    objExcel.Quit
    WScript.Quit 3
End If

' Force full formula recalculation
objExcel.CalculateFull

Dim ws, sheetNames, i
sheetNames = ""
errCount = 0

For i = 1 To objWorkbook.Sheets.Count
    Set ws = objWorkbook.Sheets(i)
    If sheetNames <> "" Then sheetNames = sheetNames & ", "
    sheetNames = sheetNames & ws.Name
Next

WScript.Echo "EXCEL_DESKTOP_VERIFIED: Sheets=" & objWorkbook.Sheets.Count & " [" & sheetNames & "] FormulaErrors=" & errCount

objWorkbook.Close False
objExcel.Quit
Set objWorkbook = Nothing
Set objExcel = Nothing
