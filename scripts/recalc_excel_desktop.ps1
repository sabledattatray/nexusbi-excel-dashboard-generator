$ErrorActionPreference = 'Stop'
$excel = $null
$wb = $null

try {
    $filePath = [System.IO.Path]::GetFullPath("scratch\Helpdesk_Recalculation_Audit.xlsx")
    Write-Host "Opening workbook in Microsoft Excel Desktop: $filePath"
    
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    
    Write-Host "Microsoft Excel Desktop Version: $($excel.Version)"
    
    $wb = $excel.Workbooks.Open($filePath)
    Write-Host "Workbook opened successfully."
    
    # Trigger full calculation
    Write-Host "Forcing full application calculation (Excel.CalculateFull)..."
    $excel.CalculateFull()
    
    # Check values on Service Desk Overview sheet
    $wsOverview = $wb.Sheets.Item("Service Desk Overview")
    $d7 = $wsOverview.Range("D7").Text
    $g7 = $wsOverview.Range("G7").Text
    $j7 = $wsOverview.Range("J7").Text
    $m7 = $wsOverview.Range("M7").Text
    
    Write-Host "Desktop Recalculated Values on Overview Row 7:"
    Write-Host "  D7 (Completed Tickets): $d7"
    Write-Host "  G7 (SLA Compliance Rate): $g7"
    Write-Host "  J7 (Mean Resolution Duration): $j7"
    Write-Host "  M7 (Reopened Incidents): $m7"
    
    # Audit for errors in Ticket Operations Ledger
    $wsLedger = $wb.Sheets.Item("Ticket Operations Ledger")
    $m4 = $wsLedger.Range("M4").Value2
    $n4 = $wsLedger.Range("N4").Value2
    $m5 = $wsLedger.Range("M5").Value2
    $n5 = $wsLedger.Range("N5").Value2
    
    Write-Host "Row 4 (HD-000001): Duration=$m4, SLA Status=$n4"
    Write-Host "Row 5 (HD-000002): Duration='$m5', SLA Status=$n5"
    
    # Check Audit sheet status
    $wsAudit = $wb.Sheets.Item("Audit & Data Provenance")
    $auditStatus = $wsAudit.Range("A2").Text
    Write-Host "Audit Sheet Status: $auditStatus"
    
    $wb.Close($false)
    $excel.Quit()
    
    Write-Host "SUCCESS: Microsoft Excel Desktop Full Recalculation Completed without errors."
}
catch {
    Write-Error "Excel Desktop recalculation failed: $_"
}
finally {
    if ($wb) { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($wb) | Out-Null }
    if ($excel) { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null }
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
