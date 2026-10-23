import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import * as duckdb from '@duckdb/duckdb-wasm/dist/duckdb-node-blocking.cjs';
import { V8JavaScriptEngine } from '../src/analytics/v8Engine.ts';
import { compileQueryPlanToSql } from '../src/analytics/compiler/astToSql.ts';

async function testParity() {
  const csvPath = 'C:\\Users\\sable\\Downloads\\Excel Tests\\Helpdesk_Operations_8000_Tickets_Universal_Dashboard_Test_Upload.csv';
  console.log('Reading CSV from:', csvPath);
  const rawCsv = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse(rawCsv, { header: true, dynamicTyping: true, skipEmptyLines: true });
  console.log(`Parsed ${parsed.data.length} rows.`);

  // Parse dates helper
  function parseDate(dStr) {
    if (!dStr) return null;
    const parts = dStr.split(/[\s/:-]+/);
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

  // Pre-normalize row objects with canonical computed attributes
  const normalizedRows = parsed.data.map((r, idx) => {
    const state = String(r['Current State'] || 'Closed').trim();
    const slaLimit = parseFloat(String(r['SLA Limit (hrs)'] || '48')) || 48;
    const tStart = parseDate(r['Logged On']);
    const tEnd = parseDate(r['Finished At']);
    let duration = null;
    let slaStatus = 'In Progress';
    if (tStart && tEnd && /^(closed|resolved)$/i.test(state)) {
      duration = Math.round(((tEnd.getTime() - tStart.getTime()) / (3600 * 1000)) * 100) / 100;
      slaStatus = duration <= slaLimit ? 'Met' : 'Breached';
    }

    return {
      case_ref: String(r['Case Ref'] || `HD-${String(idx + 1).padStart(6, '0')}`),
      current_state: state,
      urgency_band: String(r['Urgency Band'] || ''),
      resolver_group: String(r['Resolver Group'] || ''),
      issue_family: String(r['Issue Family'] || ''),
      intake_method: String(r['Intake Method'] || ''),
      service_site: String(r['Service Site'] || ''),
      sla_limit_hrs: slaLimit,
      reopened_flag: parseInt(String(r['Reopened Flag'] || '0'), 10) || 0,
      customer_rating: r['Customer Rating (1-5)'] ? parseInt(String(r['Customer Rating (1-5)']), 10) : null,
      resolution_time_hours: duration,
      sla_status: slaStatus,
      is_completed: /^(closed|resolved)$/i.test(state) ? 1 : 0,
      is_sla_met: slaStatus === 'Met' ? 1 : 0,
      is_sla_eligible: (slaStatus === 'Met' || slaStatus === 'Breached') ? 1 : 0,
    };
  });

  // Define Helpdesk Metric Plan
  const plan = {
    planId: 'helpdesk-core-kpis',
    tableName: 'helpdesk_tickets',
    metrics: [
      { id: 'total_tickets', label: 'Total Tickets', operation: 'count' },
      { id: 'completed_tickets', label: 'Completed Tickets', operation: 'count', filters: [{ field: 'current_state', operator: 'in', value: ['Closed', 'Resolved'] }] },
      { id: 'pending_tickets', label: 'Pending Tickets', operation: 'count', filters: [{ field: 'current_state', operator: 'in', value: ['Open', 'In Progress', 'Assigned', 'Pending Customer'] }] },
      { id: 'sla_met_count', label: 'SLA Met Count', operation: 'count', filters: [{ field: 'sla_status', operator: 'eq', value: 'Met' }] },
      { id: 'sla_breached_count', label: 'SLA Breached Count', operation: 'count', filters: [{ field: 'sla_status', operator: 'eq', value: 'Breached' }] },
      { id: 'sla_compliance_rate', label: 'SLA Compliance Rate', operation: 'ratio', field: 'is_sla_met', denominatorField: 'is_sla_eligible' },
      { id: 'avg_resolution_hours', label: 'Avg Resolution Hours', operation: 'average', field: 'resolution_time_hours' },
      { id: 'min_resolution_hours', label: 'Min Resolution Hours', operation: 'min', field: 'resolution_time_hours' },
      { id: 'max_resolution_hours', label: 'Max Resolution Hours', operation: 'max', field: 'resolution_time_hours' },
      { id: 'median_resolution_hours', label: 'Median Resolution Hours', operation: 'median', field: 'resolution_time_hours' },
      { id: 'reopened_count', label: 'Reopened Count', operation: 'sum', field: 'reopened_flag' },
    ],
  };

  // 1. Run V8 Baseline
  const v8 = new V8JavaScriptEngine();
  await v8.registerDataset('helpdesk_tickets', normalizedRows);
  const v8Result = await v8.execute(plan);
  console.log('\n--- V8 BASELINE METRICS ---');
  console.log(`Execution Time: ${v8Result.executionMs.toFixed(2)}ms`);
  console.log(v8Result.metrics);

  // 2. Run DuckDB
  const dist = path.resolve('node_modules/@duckdb/duckdb-wasm/dist');
  const DUCKDB_BUNDLES = {
    mvp: {
      mainModule: path.resolve(dist, 'duckdb-mvp.wasm'),
      mainWorker: path.resolve(dist, 'duckdb-node-mvp.worker.cjs'),
    },
    eh: {
      mainModule: path.resolve(dist, 'duckdb-eh.wasm'),
      mainWorker: path.resolve(dist, 'duckdb-node-eh.worker.cjs'),
    },
  };
  const logger = new duckdb.VoidLogger();
  const db = await duckdb.createDuckDB(DUCKDB_BUNDLES, logger, duckdb.NODE_RUNTIME);
  await db.instantiate();
  const conn = db.connect();

  // Load dataset into DuckDB via JSON file text
  const t0_load = performance.now();
  await db.registerFileText('tickets.json', JSON.stringify(normalizedRows));
  conn.query("CREATE TABLE helpdesk_tickets AS SELECT * FROM read_json_auto('tickets.json')");
  const loadMs = performance.now() - t0_load;
  console.log(`\nDuckDB Ingestion Time: ${loadMs.toFixed(2)}ms`);

  const compiledSql = compileQueryPlanToSql(plan);
  console.log('\nCompiled SQL:');
  console.log(compiledSql);

  const t0_exec = performance.now();
  const queryResult = conn.query(compiledSql);
  const duckMs = performance.now() - t0_exec;
  console.log(`\nDuckDB Query Time: ${duckMs.toFixed(2)}ms`);

  const firstRow = queryResult.toArray()[0].toJSON();
  console.log('\n--- DUCKDB METRICS (RAW) ---');
  console.log(firstRow);

  // Normalize DuckDB outputs (convert BigInt, DecimalBigNum to float)
  const duckMetrics = {};
  for (const [k, v] of Object.entries(firstRow)) {
    if (typeof v === 'bigint') {
      duckMetrics[k] = Number(v);
    } else if (v && typeof v === 'object' && 'values' in v) {
      duckMetrics[k] = Number(v);
    } else if (typeof v === 'number') {
      duckMetrics[k] = v;
    } else {
      duckMetrics[k] = parseFloat(v) || 0;
    }
  }

  console.log('\n--- PARITY VALIDATION ---');
  let allMatch = true;
  for (const m of plan.metrics) {
    const v8Val = v8Result.metrics[m.id];
    const duckVal = duckMetrics[m.id];
    const delta = Math.abs(v8Val - duckVal);
    const pass = delta < 0.01;
    if (!pass) allMatch = false;
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${m.id}: v8=${v8Val}, duckdb=${duckVal}, delta=${delta.toFixed(6)}`);
  }

  console.log(`\nFinal Parity Status: ${allMatch ? 'ALL METRICS MATCH PERFECTLY (100% PARITY)' : 'MISMATCH DETECTED'}`);

  conn.close();
}

testParity().catch(console.error);
