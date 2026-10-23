import sys, os, csv, openpyxl, zipfile, json
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

csv_path = r'C:\Users\sable\Downloads\Sales_MIS_Validation_6000_Transactions.csv'
xlsx_path = r'C:\Users\sable\Downloads\Sales_MIS_Validation_6000_Transactions_Executive_Sales_Dashboard_2026 (1).xlsx'

print('========================================================================')
print('PHASE 0 AUDIT: SALES MIS WORKBOOK & GENERATOR RE-VALIDATION')
print('========================================================================')

# 1. Inspect CSV
with open(csv_path, mode='r', encoding='utf-8') as f:
    csv_rows = list(csv.DictReader(f))

row_count = len(csv_rows)
id_col = '\ufeffTransaction_ID' if '\ufeffTransaction_ID' in csv_rows[0] else 'Transaction_ID'
distinct_ids = len(set(r[id_col] for r in csv_rows))
qty = sum(float(r['Quantity']) for r in csv_rows)
gross = sum(float(r['Gross_Sales_INR']) for r in csv_rows)
disc = sum(float(r['Discount_Amount_INR']) for r in csv_rows)
net = sum(float(r['Net_Sales_INR']) for r in csv_rows)
cost = sum(float(r['Total_Cost_INR']) for r in csv_rows)
profit = sum(float(r['Gross_Profit_INR']) for r in csv_rows)
margin_pct = profit / net if net else 0
avg_gross = gross / row_count if row_count else 0

print(f'\n--- FIXTURE BASELINE FACTS (from CSV: {csv_path}) ---')
print(f'Rows: {row_count} (Expected: 6,000)')
print(f'Distinct Transaction IDs: {distinct_ids} (Expected: 6,000)')
print(f'Total Quantity: {qty:,.0f} (Expected: 17,966)')
print(f'Gross Sales: ₹{gross:,.2f} (Expected: ₹360,254,632.50)')
print(f'Discount Amount: ₹{disc:,.2f} (Expected: ₹20,424,045.95)')
print(f'Net Sales: ₹{net:,.2f} (Expected: ₹339,830,586.55)')
print(f'Total Cost: ₹{cost:,.2f} (Expected: ₹267,920,146.50)')
print(f'Gross Profit: ₹{profit:,.2f} (Expected: ₹71,910,440.05)')
print(f'Margin: {margin_pct*100:.2f}% (Expected: ~21.16%)')
print(f'Avg Gross Sales / Tx: ₹{avg_gross:,.2f} (Expected: ₹60,042.44)')

# Regional baseline
reg_map = {}
for r in csv_rows:
    reg_map[r['Region']] = reg_map.get(r['Region'], 0) + float(r['Net_Sales_INR'])
print(f'Regions Net Sales: {reg_map}')

# Category baseline
cat_map = {}
for r in csv_rows:
    cat_map[r['Product_Category']] = cat_map.get(r['Product_Category'], 0) + float(r['Net_Sales_INR'])
print(f'Category Net Sales: {cat_map}')

# Payment status baseline
pmt_map = {}
for r in csv_rows:
    pmt_map[r['Payment_Status']] = pmt_map.get(r['Payment_Status'], 0) + 1
print(f'Payment Statuses: {pmt_map}')

# Dates baseline
dates = sorted(set(r['Order_Date'] for r in csv_rows))
print(f'Date range: {dates[0]} to {dates[-1]} (Unique dates: {len(dates)})')

# Customer baseline
cust_ids = set(r['Customer_ID'] for r in csv_rows)
print(f'Distinct Customer IDs: {len(cust_ids)}')

# Channel baseline
chan_map = {}
for r in csv_rows:
    chan_map[r['Sales_Channel']] = chan_map.get(r['Sales_Channel'], 0) + float(r['Net_Sales_INR'])
print(f'Sales Channels: {chan_map}')

# 2. Inspect Workbook
wb = openpyxl.load_workbook(xlsx_path, data_only=False)
wb_data = openpyxl.load_workbook(xlsx_path, data_only=True)

print(f'\n--- WORKBOOK STRUCTURE ({xlsx_path}) ---')
print(f'Worksheet Names: {wb.sheetnames}')

dash = wb['Executive Dashboard']
dash_data = wb_data['Executive Dashboard']

print('\nExecutive Dashboard KPI Cards (Row 6 - 8):')
for col in ['B', 'D', 'F', 'H', 'J', 'L', 'N']:
    val = dash[f'{col}7'].value
    cached = dash_data[f'{col}7'].value
    fmt = dash[f'{col}7'].number_format
    c6_val = dash[f'{col}6'].value
    c8_val = dash[f'{col}8'].value
    print(f'  {c6_val} ({col}7): formula={val} -> cached={cached} [fmt={fmt}] | subtitle={c8_val}')

# Inspect Zip for Charts
with zipfile.ZipFile(xlsx_path, 'r') as z:
    file_list = z.namelist()
    chart_files = [f for f in file_list if f.startswith('xl/charts/') and f.endswith('.xml')]
    print(f'\nChart XML Files ({len(chart_files)} charts found):')
    for cf in chart_files:
        xml_content = z.read(cf).decode('utf-8')
        root = ET.fromstring(xml_content)
        title = ''
        for t in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/chart}tx'):
            title = ''.join(t.itertext()).strip()
            break
        series_f = [f.text for f in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/chart}f')]
        print(f'  {cf}: Title="{title}" | Series Formulas: {series_f[:4]}')

print('\n========================================================================')
print('AUDIT COMPLETE')
print('========================================================================')
