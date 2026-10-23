import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Papa from 'papaparse';
import { getFeatureFlags, setFeatureFlag } from './featureFlags';
import { quoteIdent, formatLiteral } from './compiler/sqlSanitizer';
import { compileQueryPlanToSql } from './compiler/astToSql';
import { V8JavaScriptEngine } from './v8Engine';
import { DuckDBEngine } from './duckdb/duckdbEngine';
import { executeAnalytics } from './engineManager';
import { QueryPlan } from './types';

describe('Phase 9B: DuckDB-Wasm & Engine Abstraction Test Suite', () => {
  it('Condition 2: DuckDB feature flag is strictly disabled by default', () => {
    const flags = getFeatureFlags();
    assert.equal(flags.duckdbEngineEnabled, false, 'duckdbEngineEnabled must be false by default');
    assert.equal(flags.dualEngineParityValidation, true, 'dualEngineParityValidation should be true');
    assert.equal(flags.maxMemoryCeilingBytes, 250 * 1024 * 1024, 'Memory ceiling must be 250MB');
  });

  it('Condition 7: SQL Sanitizer & Compiler prevents SQL injection', () => {
    // Identifier sanitization
    const normalCol = quoteIdent('Total Sales');
    assert.equal(normalCol, '"Total Sales"');

    const maliciousCol = quoteIdent('col"; DROP TABLE users; --');
    assert.equal(maliciousCol, '"col""; DROP TABLE users; --"');

    // Literal sanitization
    const numLit = formatLiteral(42.5);
    assert.equal(numLit, '42.5');

    const strLit = formatLiteral("O'Connor");
    assert.equal(strLit, "'O''Connor'");

    const maliciousLit = formatLiteral("admin' OR '1'='1");
    assert.equal(maliciousLit, "'admin'' OR ''1''=''1'");

    // Safe Plan Compilation
    const plan: QueryPlan = {
      planId: 'test-safe-plan',
      tableName: 'orders',
      metrics: [
        { id: 'total_orders', label: 'Total', operation: 'count' },
        { id: 'sum_sales', label: 'Sum', operation: 'sum', field: 'Amount' },
      ],
      filters: [
        { field: 'Status', operator: 'eq', value: "Paid' OR 1=1--" },
      ],
    };

    const sql = compileQueryPlanToSql(plan);
    assert.ok(sql.includes('"orders"'));
    // The single quote must be doubled to '' so it remains safely inside the string literal
    assert.ok(sql.includes('\'Paid\'\' OR 1=1--\''));
    // Ensure raw unescaped injection is not present
    assert.ok(!sql.includes("'Paid' OR 1=1"));
  });

  it('Condition 8A: Helpdesk 8,000-ticket fixture parity validation', async () => {
    const helpdeskPath = 'C:\\Users\\sable\\Downloads\\Excel Tests\\Helpdesk_Operations_8000_Tickets_Universal_Dashboard_Test_Upload.csv';
    if (!fs.existsSync(helpdeskPath)) {
      console.warn('Helpdesk CSV fixture not found, skipping fixture test');
      return;
    }

    const raw = fs.readFileSync(helpdeskPath, 'utf8');
    const parsed = Papa.parse(raw, { header: true, dynamicTyping: true, skipEmptyLines: true });
    assert.equal(parsed.data.length, 8000, 'Must load exactly 8,000 tickets');

    function parseDate(dStr: any) {
      if (!dStr) return null;
      const parts = String(dStr).split(/[\s/:-]+/);
      if (parts.length >= 5) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        const hr = parseInt(parts[3], 10);
        const min = parseInt(parts[4], 10);
        return new Date(y, m, d, hr, min);
      }
      return null;
    }

    const rows = parsed.data.map((r: any, idx: number) => {
      const state = String(r['Current State'] || 'Closed').trim();
      const slaLimit = parseFloat(String(r['SLA Limit (hrs)'] || '48')) || 48;
      const tStart = parseDate(r['Logged On']);
      const tEnd = parseDate(r['Finished At']);
      let durationRaw: number | null = null;
      let durationLedger: number | null = null;
      let slaStatus = 'In Progress';
      if (tStart && tEnd && /^(closed|resolved)$/i.test(state)) {
        durationRaw = (tEnd.getTime() - tStart.getTime()) / (3600 * 1000);
        durationLedger = Math.round(durationRaw * 100) / 100;
        slaStatus = durationLedger <= slaLimit ? 'Met' : 'Breached';
      }

      return {
        case_ref: String(r['Case Ref'] || `HD-${String(idx + 1).padStart(6, '0')}`),
        current_state: state,
        duration_raw: durationRaw,
        duration_ledger: durationLedger,
        sla_status: slaStatus,
        is_sla_met: slaStatus === 'Met' ? 1 : 0,
        is_sla_eligible: (slaStatus === 'Met' || slaStatus === 'Breached') ? 1 : 0,
        reopened_flag: parseInt(String(r['Reopened Flag'] || '0'), 10) || 0,
      };
    });

    const plan: QueryPlan = {
      planId: 'helpdesk-parity-plan',
      tableName: 'helpdesk_tickets',
      metrics: [
        { id: 'total_tickets', label: 'Total Tickets', operation: 'count' },
        { id: 'completed_tickets', label: 'Completed Tickets', operation: 'count', filters: [{ field: 'current_state', operator: 'in', value: ['Closed', 'Resolved'] }] },
        { id: 'in_progress_tickets', label: 'In Progress Tickets', operation: 'count', filters: [{ field: 'current_state', operator: 'eq', value: 'In Progress' }] },
        { id: 'waiting_on_customer_tickets', label: 'Waiting on Customer Tickets', operation: 'count', filters: [{ field: 'current_state', operator: 'eq', value: 'Waiting on Customer' }] },
        { id: 'total_unresolved_backlog', label: 'Total Unresolved Backlog', operation: 'count', filters: [{ field: 'current_state', operator: 'in', value: ['In Progress', 'Waiting on Customer'] }] },
        { id: 'sla_met_count', label: 'SLA Met Count', operation: 'count', filters: [{ field: 'sla_status', operator: 'eq', value: 'Met' }] },
        { id: 'sla_breached_count', label: 'SLA Breached Count', operation: 'count', filters: [{ field: 'sla_status', operator: 'eq', value: 'Breached' }] },
        { id: 'sla_compliance_rate', label: 'SLA Compliance Rate', operation: 'ratio', field: 'is_sla_met', denominatorField: 'is_sla_eligible' },
        { id: 'avg_resolution_hours_raw', label: 'Avg Resolution Hours (Raw Continuous)', operation: 'average', field: 'duration_raw' },
        { id: 'avg_resolution_hours_ledger', label: 'Avg Resolution Hours (Ledger 2-DP Rounded)', operation: 'average', field: 'duration_ledger' },
        { id: 'reopened_count', label: 'Reopened Count', operation: 'sum', field: 'reopened_flag' },
      ],
    };

    // Run V8 Baseline
    const v8 = new V8JavaScriptEngine();
    await v8.registerDataset('helpdesk_tickets', rows);
    const v8Res = await v8.execute(plan);

    // Run DuckDB
    const duckdb = new DuckDBEngine();
    await duckdb.registerDataset('helpdesk_tickets', rows);
    const duckRes = await duckdb.execute(plan);

    // Load independent source calculation
    const indep = JSON.parse(fs.readFileSync('scratch/independent_source_metrics.json', 'utf8')).helpdesk;

    // Assert exact reconciliation against independent Python source calculation
    assert.equal(v8Res.metrics.total_tickets, indep.total_tickets);
    assert.equal(v8Res.metrics.completed_tickets, indep.completed_tickets);
    assert.equal(v8Res.metrics.in_progress_tickets, indep.in_progress_tickets);
    assert.equal(v8Res.metrics.waiting_on_customer_tickets, indep.waiting_on_customer_tickets);
    assert.equal(v8Res.metrics.total_unresolved_backlog, indep.total_unresolved_backlog);
    assert.equal(v8Res.metrics.sla_met_count, indep.sla_met_count);
    assert.equal(v8Res.metrics.sla_breached_count, indep.sla_breached_count);
    assert.equal(v8Res.metrics.reopened_count, indep.reopened_count);

    // Verify raw continuous mean (55.6082 hrs) vs ledger 2-dp mean (55.6089 hrs)
    assert.ok(Math.abs(v8Res.metrics.avg_resolution_hours_raw - 55.608195) < 0.0001);
    assert.ok(Math.abs(v8Res.metrics.avg_resolution_hours_ledger - 55.608885) < 0.0001);

    // Both round to 55.61 hrs display
    assert.equal(Number(v8Res.metrics.avg_resolution_hours_raw.toFixed(2)), 55.61);
    assert.equal(Number(v8Res.metrics.avg_resolution_hours_ledger.toFixed(2)), 55.61);

    // Three-Way Parity Comparison: V8 vs DuckDB vs Independent Source
    for (const m of plan.metrics) {
      const v8Val = v8Res.metrics[m.id];
      const duckVal = duckRes.metrics[m.id];
      const indepVal = indep[m.id];
      assert.ok(Math.abs(v8Val - duckVal) < 0.0001, `V8 vs DuckDB discrepancy on ${m.id}`);
      if (indepVal !== undefined) {
        assert.ok(Math.abs(duckVal - indepVal) < 0.0001, `DuckDB vs Independent discrepancy on ${m.id}`);
      }
    }

    await v8.dispose();
    await duckdb.dispose();
  });

  it('Condition 8B: Sales 6,000-row fixture regression validation', async () => {
    const salesPath = 'C:\\Users\\sable\\Downloads\\Sales_MIS_Validation_6000_Transactions.csv';
    if (!fs.existsSync(salesPath)) {
      console.warn('Sales CSV fixture not found, skipping fixture test');
      return;
    }

    const raw = fs.readFileSync(salesPath, 'utf8');
    const parsed = Papa.parse(raw, { header: true, dynamicTyping: true, skipEmptyLines: true });
    assert.equal(parsed.data.length, 6000, 'Must load exactly 6,000 transactions');

    const rows = parsed.data.map((r: any) => ({
      transaction_id: String(r.Transaction_ID),
      gross_sales: Number(r.Gross_Sales_INR) || 0,
      net_sales: Number(r.Net_Sales_INR) || 0,
      total_cost: Number(r.Total_Cost_INR) || 0,
      gross_profit: Number(r.Gross_Profit_INR) || 0,
      payment_status: String(r.Payment_Status || ''),
    }));

    const plan: QueryPlan = {
      planId: 'sales-parity-plan',
      tableName: 'sales_transactions',
      metrics: [
        { id: 'total_transactions', label: 'Total Transactions', operation: 'count' },
        { id: 'total_net_sales', label: 'Total Net Sales', operation: 'sum', field: 'net_sales' },
        { id: 'total_gross_profit', label: 'Total Gross Profit', operation: 'sum', field: 'gross_profit' },
        { id: 'total_cost', label: 'Total Cost', operation: 'sum', field: 'total_cost' },
        { id: 'overall_profit_margin', label: 'Profit Margin', operation: 'ratio', field: 'gross_profit', denominatorField: 'net_sales' },
        { id: 'paid_transactions', label: 'Paid Count', operation: 'count', filters: [{ field: 'payment_status', operator: 'eq', value: 'Paid' }] },
      ],
    };

    // Run V8 Baseline
    const v8 = new V8JavaScriptEngine();
    await v8.registerDataset('sales_transactions', rows);
    const v8Res = await v8.execute(plan);

    // Run DuckDB
    const duckdb = new DuckDBEngine();
    await duckdb.registerDataset('sales_transactions', rows);
    const duckRes = await duckdb.execute(plan);

    // Load independent source calculation
    const indep = JSON.parse(fs.readFileSync('scratch/independent_source_metrics.json', 'utf8')).sales;

    assert.equal(v8Res.metrics.total_transactions, indep.total_transactions);
    assert.ok(Math.abs(v8Res.metrics.total_net_sales - indep.total_net_sales) < 0.01);
    assert.ok(Math.abs(v8Res.metrics.total_gross_profit - indep.total_gross_profit) < 0.01);
    assert.ok(Math.abs(v8Res.metrics.total_cost - indep.total_cost) < 0.01);
    assert.ok(Math.abs(v8Res.metrics.overall_profit_margin - indep.overall_profit_margin) < 0.0001);
    assert.equal(v8Res.metrics.paid_transactions, indep.paid_transactions);

    for (const m of plan.metrics) {
      const v8Val = v8Res.metrics[m.id];
      const duckVal = duckRes.metrics[m.id];
      assert.ok(Math.abs(v8Val - duckVal) < 0.001, `Sales parity failure on ${m.id}: v8=${v8Val}, duck=${duckVal}`);
    }

    await v8.dispose();
    await duckdb.dispose();
  });

  it('Condition 3: Automatic fallback when DuckDB encounters error', async () => {
    setFeatureFlag('duckdbEngineEnabled', true);

    const data = [
      { id: 1, amount: 100 },
      { id: 2, amount: 200 },
    ];

    // Create a plan with a nonexistent column that triggers a DuckDB Binder Error
    const brokenPlan: QueryPlan = {
      planId: 'broken-plan',
      tableName: 'fallback_test_table',
      metrics: [{ id: 'sum_invalid', label: 'Sum Invalid', operation: 'sum', field: 'nonexistent_col_abc123' }],
    };

    const response = await executeAnalytics(brokenPlan, data);
    assert.ok(response.result, 'Response result must exist');
    assert.equal(response.result.diagnostics?.usedFallback, true, 'Must flag usedFallback=true');
    assert.ok(response.result.diagnostics?.fallbackReason, 'Must provide fallback reason');

    // Reset feature flag to default
    setFeatureFlag('duckdbEngineEnabled', false);
  });
});
