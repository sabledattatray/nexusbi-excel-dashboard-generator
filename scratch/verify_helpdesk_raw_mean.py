import csv
from datetime import datetime

with open('public/datasets/customer_support_tickets_8k.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    durations_raw = []
    durations_ledger_2dp = []
    completed_count = 0
    sla_met = 0
    sla_breached = 0
    ratings = []
    unresolved_count = 0
    waiting_on_customer = 0
    in_progress = 0

    for r in reader:
        state = r['Current State'].strip()
        is_completed = state.lower() in ('closed', 'resolved')
        if iscompleted := is_completed:
            completed_count += 1
            t_log = datetime.strptime(r['Logged On'].strip(), '%d-%m-%Y %H:%M')
            t_fin = datetime.strptime(r['Finished At'].strip(), '%d-%m-%Y %H:%M')
            diff_hours = (t_fin - t_log).total_seconds() / 3600.0
            durations_raw.append(diff_hours)
            durations_ledger_2dp.append(round(diff_hours, 2))
            
            sla_limit = float(r['SLA Limit (hrs)']) if r['SLA Limit (hrs)'] else 48.0
            if diff_hours <= sla_limit:
                sla_met += 1
            else:
                sla_breached += 1
        else:
            unresolved_count += 1
            if state.lower() == 'waiting on customer':
                waiting_on_customer += 1
            elif state.lower() == 'in progress':
                in_progress += 1

        rating_str = r['Customer Rating (1-5)'].strip()
        if rating_str:
            ratings.append(float(rating_str))

raw_mean = sum(durations_raw) / len(durations_raw)
ledger_mean = sum(durations_ledger_2dp) / len(durations_ledger_2dp)
csat_mean = sum(ratings) / len(ratings)

print(f"Total Rows: {completed_count + unresolved_count}")
print(f"Completed: {completed_count}")
print(f"Unresolved: {unresolved_count} (In Progress: {in_progress}, Waiting: {waiting_on_customer})")
print(f"SLA Met: {sla_met}, Breached: {sla_breached}, Compliance: {sla_met / (sla_met + sla_breached):.6f}")
print(f"Raw Durations Mean: {raw_mean:.10f}")
print(f"Ledger 2-DP Durations Mean: {ledger_mean:.10f}")
print(f"CSAT: Count={len(ratings)}, Sum={sum(ratings)}, Mean={csat_mean:.6f}")
