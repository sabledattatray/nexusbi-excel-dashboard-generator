/**
 * Comprehensive Benchmark: DuckDB-Wasm vs Validated v8 JavaScript Engine
 * Authoritative source: PRD v9.0 Phase 9B Mandatory Condition 5
 */

import fs from 'node:fs';
import Papa from 'papaparse';
import { V8JavaScriptEngine } from '../src/analytics/v8Engine';
import { DuckDBEngine } from '../src/analytics/duckdb/duckdbEngine';
import { QueryPlan } from '../src/analytics/types';

interface BenchmarkMetrics {
  coldInitMs: number;
  ingestionMs: number;
  coldQueryMs: number;
  warmQueryMeanMs: number;
  warmQueryMinMs: number;
  warmQueryMaxMs: number;
  heapUsedMb: number;
}

function getHeapUsageMb(): number {
  if (global.gc) {
    global.gc();
  }
  const mem = process.memoryUsage();
  return Math.round((mem.heapUsed / (1024 * 1024)) * 100) / 100;
}

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

async function runHelpdeskBenchmark() {
  const csvPath = 'C:\\Users\\sable\\Downloads\\Excel Tests\\Helpdesk_Operations_8000_Tickets_Universal_Dashboard_Test_Upload.csv';
  const raw = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse(raw, { header: true, dynamicTyping: true, skipEmptyLines: true });

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
    planId: 'helpdesk-bench',
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

  // --- V8 Benchmark ---
  const v8HeapStart = getHeapUsageMb();
  const t0_v8_init = performance.now();
  const v8 = new V8JavaScriptEngine();
  const v8InitMs = performance.now() - t0_v8_init;

  const t0_v8_ingest = performance.now();
  await v8.registerDataset('helpdesk_tickets', rows);
  const v8IngestMs = performance.now() - t0_v8_ingest;

  const t0_v8_cold = performance.now();
  const v8ColdRes = await v8.execute(plan);
  const v8ColdMs = performance.now() - t0_v8_cold;

  const v8WarmTimes: number[] = [];
  for (let i = 0; i < 10; i++) {
    const t0 = performance.now();
    await v8.execute(plan);
    v8WarmTimes.push(performance.now() - t0);
  }
  const v8HeapPeak = getHeapUsageMb();
  await v8.dispose();

  // --- DuckDB Benchmark ---
  const duckHeapStart = getHeapUsageMb();
  const t0_duck_init = performance.now();
  const duckdb = new DuckDBEngine();
  await duckdb.isAvailable();
  const duckInitMs = performance.now() - t0_duck_init;

  const t0_duck_ingest = performance.now();
  await duckdb.registerDataset('helpdesk_tickets', rows);
  const duckIngestMs = performance.now() - t0_duck_ingest;

  const t0_duck_cold = performance.now();
  const duckColdRes = await duckdb.execute(plan);
  const duckColdMs = performance.now() - t0_duck_cold;

  const duckWarmTimes: number[] = [];
  for (let i = 0; i < 10; i++) {
    const t0 = performance.now();
    await duckdb.execute(plan);
    duckWarmTimes.push(performance.now() - t0);
  }
  const duckHeapPeak = getHeapUsageMb();
  await duckdb.dispose();

  return {
    dataset: 'Helpdesk (8,000 Tickets)',
    rows: 8000,
    metricsCount: plan.metrics.length,
    v8: {
      coldInitMs: v8InitMs,
      ingestionMs: v8IngestMs,
      coldQueryMs: v8ColdMs,
      warmQueryMeanMs: v8WarmTimes.reduce((a, b) => a + b, 0) / v8WarmTimes.length,
      warmQueryMinMs: Math.min(...v8WarmTimes),
      warmQueryMaxMs: Math.max(...v8WarmTimes),
      heapUsedMb: v8HeapPeak,
    },
    duckdb: {
      coldInitMs: duckInitMs,
      ingestionMs: duckIngestMs,
      coldQueryMs: duckColdMs,
      warmQueryMeanMs: duckWarmTimes.reduce((a, b) => a + b, 0) / duckWarmTimes.length,
      warmQueryMinMs: Math.min(...duckWarmTimes),
      warmQueryMaxMs: Math.max(...duckWarmTimes),
      heapUsedMb: duckHeapPeak,
    },
    parity: plan.metrics.map((m) => ({
      metric: m.id,
      v8: v8ColdRes.metrics[m.id],
      duckdb: duckColdRes.metrics[m.id],
      delta: Math.abs(v8ColdRes.metrics[m.id] - duckColdRes.metrics[m.id]),
    })),
  };
}

async function runSalesBenchmark() {
  const csvPath = 'C:\\Users\\sable\\Downloads\\Sales_MIS_Validation_6000_Transactions.csv';
  const raw = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse(raw, { header: true, dynamicTyping: true, skipEmptyLines: true });

  const rows = parsed.data.map((r: any) => ({
    transaction_id: String(r.Transaction_ID),
    gross_sales: Number(r.Gross_Sales_INR) || 0,
    net_sales: Number(r.Net_Sales_INR) || 0,
    total_cost: Number(r.Total_Cost_INR) || 0,
    gross_profit: Number(r.Gross_Profit_INR) || 0,
    payment_status: String(r.Payment_Status || ''),
  }));

  const plan: QueryPlan = {
    planId: 'sales-bench',
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

  // V8
  const t0_v8_init = performance.now();
  const v8 = new V8JavaScriptEngine();
  const v8InitMs = performance.now() - t0_v8_init;

  const t0_v8_ingest = performance.now();
  await v8.registerDataset('sales_transactions', rows);
  const v8IngestMs = performance.now() - t0_v8_ingest;

  const t0_v8_cold = performance.now();
  const v8ColdRes = await v8.execute(plan);
  const v8ColdMs = performance.now() - t0_v8_cold;

  const v8WarmTimes: number[] = [];
  for (let i = 0; i < 10; i++) {
    const t0 = performance.now();
    await v8.execute(plan);
    v8WarmTimes.push(performance.now() - t0);
  }
  const v8HeapPeak = getHeapUsageMb();
  await v8.dispose();

  // DuckDB
  const t0_duck_init = performance.now();
  const duckdb = new DuckDBEngine();
  await duckdb.isAvailable();
  const duckInitMs = performance.now() - t0_duck_init;

  const t0_duck_ingest = performance.now();
  await duckdb.registerDataset('sales_transactions', rows);
  const duckIngestMs = performance.now() - t0_duck_ingest;

  const t0_duck_cold = performance.now();
  const duckColdRes = await duckdb.execute(plan);
  const duckColdMs = performance.now() - t0_duck_cold;

  const duckWarmTimes: number[] = [];
  for (let i = 0; i < 10; i++) {
    const t0 = performance.now();
    await duckdb.execute(plan);
    duckWarmTimes.push(performance.now() - t0);
  }
  const duckHeapPeak = getHeapUsageMb();
  await duckdb.dispose();

  return {
    dataset: 'Sales MIS Validation (6,000 Transactions)',
    rows: 6000,
    metricsCount: plan.metrics.length,
    v8: {
      coldInitMs: v8InitMs,
      ingestionMs: v8IngestMs,
      coldQueryMs: v8ColdMs,
      warmQueryMeanMs: v8WarmTimes.reduce((a, b) => a + b, 0) / v8WarmTimes.length,
      warmQueryMinMs: Math.min(...v8WarmTimes),
      warmQueryMaxMs: Math.max(...v8WarmTimes),
      heapUsedMb: v8HeapPeak,
    },
    duckdb: {
      coldInitMs: duckInitMs,
      ingestionMs: duckIngestMs,
      coldQueryMs: duckColdMs,
      warmQueryMeanMs: duckWarmTimes.reduce((a, b) => a + b, 0) / duckWarmTimes.length,
      warmQueryMinMs: Math.min(...duckWarmTimes),
      warmQueryMaxMs: Math.max(...duckWarmTimes),
      heapUsedMb: duckHeapPeak,
    },
    parity: plan.metrics.map((m) => ({
      metric: m.id,
      v8: v8ColdRes.metrics[m.id],
      duckdb: duckColdRes.metrics[m.id],
      delta: Math.abs(v8ColdRes.metrics[m.id] - duckColdRes.metrics[m.id]),
    })),
  };
}

async function main() {
  console.log('================================================================');
  console.log('   PRD v9.0 Phase 9B Architecture Benchmark: DuckDB vs V8 JS    ');
  console.log('================================================================\n');

  console.log('Executing Helpdesk (8,000 tickets) benchmark...');
  const helpdeskBench = await runHelpdeskBenchmark();

  console.log('Executing Sales (6,000 transactions) benchmark...');
  const salesBench = await runSalesBenchmark();

  const report = {
    timestamp: new Date().toISOString(),
    benchmarks: [helpdeskBench, salesBench],
  };

  console.log('\n--- HELPDESK BENCHMARK RESULTS ---');
  console.table({
    'Metric / Step': [
      'Initialization (Cold)',
      'Dataset Ingestion',
      'Cold Query Execution',
      'Warm Query (Mean of 10 runs)',
      'Warm Query (Min)',
      'Warm Query (Max)',
      'Heap Memory Used',
    ],
    'v8 JavaScript Engine': [
      `${helpdeskBench.v8.coldInitMs.toFixed(2)} ms`,
      `${helpdeskBench.v8.ingestionMs.toFixed(2)} ms`,
      `${helpdeskBench.v8.coldQueryMs.toFixed(2)} ms`,
      `${helpdeskBench.v8.warmQueryMeanMs.toFixed(2)} ms`,
      `${helpdeskBench.v8.warmQueryMinMs.toFixed(2)} ms`,
      `${helpdeskBench.v8.warmQueryMaxMs.toFixed(2)} ms`,
      `${helpdeskBench.v8.heapUsedMb.toFixed(2)} MB`,
    ],
    'DuckDB-Wasm Engine': [
      `${helpdeskBench.duckdb.coldInitMs.toFixed(2)} ms`,
      `${helpdeskBench.duckdb.ingestionMs.toFixed(2)} ms`,
      `${helpdeskBench.duckdb.coldQueryMs.toFixed(2)} ms`,
      `${helpdeskBench.duckdb.warmQueryMeanMs.toFixed(2)} ms`,
      `${helpdeskBench.duckdb.warmQueryMinMs.toFixed(2)} ms`,
      `${helpdeskBench.duckdb.warmQueryMaxMs.toFixed(2)} ms`,
      `${helpdeskBench.duckdb.heapUsedMb.toFixed(2)} MB`,
    ],
  });

  console.log('\n--- SALES BENCHMARK RESULTS ---');
  console.table({
    'Metric / Step': [
      'Initialization (Cold)',
      'Dataset Ingestion',
      'Cold Query Execution',
      'Warm Query (Mean of 10 runs)',
      'Warm Query (Min)',
      'Warm Query (Max)',
      'Heap Memory Used',
    ],
    'v8 JavaScript Engine': [
      `${salesBench.v8.coldInitMs.toFixed(2)} ms`,
      `${salesBench.v8.ingestionMs.toFixed(2)} ms`,
      `${salesBench.v8.coldQueryMs.toFixed(2)} ms`,
      `${salesBench.v8.warmQueryMeanMs.toFixed(2)} ms`,
      `${salesBench.v8.warmQueryMinMs.toFixed(2)} ms`,
      `${salesBench.v8.warmQueryMaxMs.toFixed(2)} ms`,
      `${salesBench.v8.heapUsedMb.toFixed(2)} MB`,
    ],
    'DuckDB-Wasm Engine': [
      `${salesBench.duckdb.coldInitMs.toFixed(2)} ms`,
      `${salesBench.duckdb.ingestionMs.toFixed(2)} ms`,
      `${salesBench.duckdb.coldQueryMs.toFixed(2)} ms`,
      `${salesBench.duckdb.warmQueryMeanMs.toFixed(2)} ms`,
      `${salesBench.duckdb.warmQueryMinMs.toFixed(2)} ms`,
      `${salesBench.duckdb.warmQueryMaxMs.toFixed(2)} ms`,
      `${salesBench.duckdb.heapUsedMb.toFixed(2)} MB`,
    ],
  });

  console.log('\n--- HELPDESK PARITY EVIDENCE ---');
  console.table(helpdeskBench.parity);

  console.log('\n--- SALES PARITY EVIDENCE ---');
  console.table(salesBench.parity);

  // Write results to JSON artifact
  fs.writeFileSync('scratch/benchmark_results_phase9b.json', JSON.stringify(report, null, 2));
  console.log('\nSaved benchmark report to scratch/benchmark_results_phase9b.json');
}

main().catch(console.error);
