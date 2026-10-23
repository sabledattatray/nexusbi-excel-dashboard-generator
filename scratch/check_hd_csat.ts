import fs from 'node:fs';
import Papa from 'papaparse';
import { profileDataset } from '../src/analytics/profiler/datasetProfiler';
import { detectSemanticRoles } from '../src/analytics/profiler/semanticDetector';
import { resolveDomainRulePack } from '../src/analytics/rules/rulePacks';
import { V8JavaScriptEngine } from '../src/analytics/v8Engine';
import { DuckDBEngine } from '../src/analytics/duckdb/duckdbEngine';

const csvPath = 'C:/Users/sable/Downloads/Excel Tests/Helpdesk_Operations_8000_Tickets_Universal_Dashboard_Test_Upload.csv';
const raw = fs.readFileSync(csvPath, 'utf-8');
const p = Papa.parse(raw, { header: true, dynamicTyping: true, skipEmptyLines: true });
const rows = p.data as Record<string, any>[];
const headers = Object.keys(rows[0]);

const profile = profileDataset(headers, rows);
const semantics = detectSemanticRoles(profile);
const rulePack = resolveDomainRulePack(profile, semantics);
const metrics = rulePack.buildMetrics(profile, semantics);

console.log('Detected domain:', rulePack.name);
console.log('Metrics configured:');
for (const m of metrics) {
  console.log(` - ${m.id} (${m.label}): field=${m.field}, op=${m.operation}`);
}

async function run() {
  const v8 = new V8JavaScriptEngine();
  const duck = new DuckDBEngine();

  await v8.registerDataset('hd', rows);
  await duck.registerDataset('hd', rows);

  const plan = { planId: 'hd_plan', tableName: 'hd', metrics };
  const v8Res = await v8.execute(plan);
  const duckRes = await duck.execute(plan);

  console.log('\nV8 Execution Results:');
  for (const [k, v] of Object.entries(v8Res.metrics)) {
    console.log(`  ${k}: ${v}`);
  }

  console.log('\nDuckDB Execution Results:');
  for (const [k, v] of Object.entries(duckRes.metrics)) {
    console.log(`  ${k}: ${v}`);
  }

  await v8.dispose();
  await duck.dispose();
}

run().catch(console.error);
