"""
Three-Way Independent Parity Audit:
1. Independent Source Python Math (direct from CSV)
2. Validated v8 JavaScript Engine
3. DuckDB-Wasm Engine

Authoritative source: PRD v9.0 Phase 9B Verification Task 4
"""

import csv
import json
import subprocess
import sys
from datetime import datetime

csv_helpdesk = r'C:\Users\sable\Downloads\Excel Tests\Helpdesk_Operations_8000_Tickets_Universal_Dashboard_Test_Upload.csv'
csv_sales = r'C:\Users\sable\Downloads\Sales_MIS_Validation_6000_Transactions.csv'

def run_helpdesk_independent():
    with open(csv_helpdesk, encoding='utf-8') as f:
        rows = list(csv.DictReader(f))

    fmt = '%d-%m-%Y %H:%M'
    total = len(rows)
    completed = 0
    in_prog = 0
    waiting = 0
    sla_met = 0
    sla_breached = 0
    raw_durations = []
    rounded_durations = []
    reopened = 0

    for r in rows:
        state = r['Current State'].strip()
        if state == 'In Progress':
            in_prog += 1
        elif state == 'Waiting on Customer':
            waiting += 1
        elif state in ('Closed', 'Resolved'):
            completed += 1
            t1_str = r['Logged On'].strip()
            t2_str = r['Finished At'].strip()
            sla_limit = float(r['SLA Limit (hrs)'].strip() or '48')
            if t1_str and t2_str:
                t1 = datetime.strptime(t1_str, fmt)
                t2 = datetime.strptime(t2_str, fmt)
                hrs = (t2 - t1).total_seconds() / 3600.0
                raw_durations.append(hrs)
                rounded_durations.append(round(hrs, 2))
                if round(hrs, 2) <= sla_limit:
                    sla_met += 1
                else:
                    sla_breached += 1

        reopened += int(r.get('Reopened Flag', '0') or 0)

    unresolved = in_prog + waiting
    sla_rate = sla_met / (sla_met + sla_breached) if (sla_met + sla_breached) > 0 else 0
    mean_raw = sum(raw_durations) / len(raw_durations) if raw_durations else 0
    mean_rounded = sum(rounded_durations) / len(rounded_durations) if rounded_durations else 0

    return {
        'total_tickets': total,
        'completed_tickets': completed,
        'in_progress_tickets': in_prog,
        'waiting_on_customer_tickets': waiting,
        'total_unresolved_backlog': unresolved,
        'sla_met_count': sla_met,
        'sla_breached_count': sla_breached,
        'sla_compliance_rate': sla_rate,
        'mean_resolution_hours_raw': mean_raw,
        'mean_resolution_hours_ledger': mean_rounded,
        'reopened_count': reopened,
    }

def run_sales_independent():
    with open(csv_sales, encoding='utf-8') as f:
        rows = list(csv.DictReader(f))

    total = len(rows)
    net_sales = sum(float(r['Net_Sales_INR']) for r in rows)
    gross_profit = sum(float(r['Gross_Profit_INR']) for r in rows)
    total_cost = sum(float(r['Total_Cost_INR']) for r in rows)
    margin = gross_profit / net_sales if net_sales > 0 else 0
    paid = sum(1 for r in rows if r['Payment_Status'].strip() == 'Paid')
    pending = total - paid

    return {
        'total_transactions': total,
        'total_net_sales': net_sales,
        'total_gross_profit': gross_profit,
        'total_cost': total_cost,
        'overall_profit_margin': margin,
        'paid_transactions': paid,
        'pending_transactions': pending,
    }

print('Calculating Independent Source Python Math...')
hd_py = run_helpdesk_independent()
sales_py = run_sales_independent()

print('\n=== INDEPENDENT HELPDESK METRICS (Direct from Raw CSV) ===')
for k, v in hd_py.items():
    print(f'  {k}: {v}')

print('\n=== INDEPENDENT SALES METRICS (Direct from Raw CSV) ===')
for k, v in sales_py.items():
    print(f'  {k}: {v}')

# Save independent metrics to JSON
with open('scratch/independent_source_metrics.json', 'w', encoding='utf-8') as f:
    json.dump({'helpdesk': hd_py, 'sales': sales_py}, f, indent=2)

print('\nSuccessfully computed and saved scratch/independent_source_metrics.json')
