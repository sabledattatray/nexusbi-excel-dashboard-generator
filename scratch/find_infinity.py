import zipfile
import re

wb_path = r'C:\Users\sable\Downloads\Sales_MIS_Validation_6000_Transactions_Executive_Sales_Dashboard_2026 (1).xlsx'
with zipfile.ZipFile(wb_path, 'r') as z:
    content = z.read('xl/worksheets/sheet1.xml').decode('utf-8', errors='ignore')
    matches = re.findall(r'<c r="([A-Z0-9]+)"[^>]*>.*?Infinity.*?</c>', content)
    print("Cells with Infinity in sheet1.xml:", matches)
    for m in re.finditer(r'<c r="([A-Z0-9]+)"[^>]*>.*?</c>', content):
        if 'Infinity' in m.group(0):
            print("Full cell XML:", m.group(0))
