/**
 * Phase 9F Performance, Memory Pressure & Cross-Tier Benchmark
 * Authoritative source: PRD v9.0 Phase 9F Mandatory Requirement 3, 4, 8
 */

import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import Papa from 'papaparse';
import { profileDataset } from '../src/analytics/profiler/datasetProfiler';
import { detectSemanticRoles } from '../src/analytics/profiler/semanticDetector';
import { resolveDomainRulePack } from '../src/analytics/rules/rulePacks';
import { composeUniversalDashboard } from '../src/analytics/composer/dashboardComposer';
import { CanonicalExporter } from '../src/analytics/export/canonicalExporter';
import { TruePdfExporter } from '../src/analytics/export/truePdfExporter';
import { PdfReportExporter } from '../src/analytics/export/pdfReportExporter';

interface TierBenchmarkResult {
  tier: 'Small' | 'Medium-Sales' | 'Medium-Helpdesk' | 'Large-Stress';
  datasetName: string;
  rowCount: number;
  colCount: number;
  csvParseTimeMs: number;
  profilingTimeMs: number;
  semanticTimeMs: number;
  composerTimeMs: number;
  crossFilterTimeMs: number;
  xlsxExportTimeMs: number;
  xlsxSizeBytes: number;
  htmlExportTimeMs: number;
  htmlSizeBytes: number;
  pdfBinaryTimeMs: number;
  pdfSizeBytes: number;
  totalWorkflowMs: number;
  throughputRowsSec: number;
  heapUsedMbDelta: number;
}

function generateSyntheticLargeDataset(count: number): Record<string, any>[] {
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const categories = ['Hardware', 'Software', 'Cloud Services', 'Professional Services', 'Maintenance'];
  const segments = ['Enterprise', 'Mid-Market', 'SMB', 'Government'];
  const channels = ['Direct', 'Partner', 'Online', 'Distributor'];
  const rows: Record<string, any>[] = [];

  const startEpoch = new Date('2025-01-01').getTime();
  const dayMs = 24 * 3600 * 1000;

  for (let i = 1; i <= count; i++) {
    const qty = ((i * 7) % 25) + 1;
    const unitPrice = 100 + ((i * 13) % 2500);
    const gross = qty * unitPrice;
    const discount = Math.round(gross * (i % 5 === 0 ? 0.1 : 0.05));
    const net = gross - discount;
    const unitCost = Math.round(unitPrice * 0.65);
    const totalCost = unitCost * qty;
    const profit = net - totalCost;
    const orderDate = new Date(startEpoch + (i % 500) * dayMs).toISOString().split('T')[0];

    rows.push({
      Transaction_ID: `TXN-${String(i).padStart(6, '0')}`,
      Order_Date: orderDate,
      Customer_Segment: segments[i % segments.length],
      Region: regions[i % regions.length],
      Category: categories[i % categories.length],
      Sales_Channel: channels[i % channels.length],
      Quantity: qty,
      Unit_Price: unitPrice,
      Gross_Sales: gross,
      Discount_Amount: discount,
      Net_Sales: net,
      Total_Cost: totalCost,
      Gross_Profit: profit,
    });
  }

  return rows;
}

async function runBenchmarkTier(
  tier: 'Small' | 'Medium-Sales' | 'Medium-Helpdesk' | 'Large-Stress',
  name: string,
  rows: Record<string, any>[]
): Promise<TierBenchmarkResult> {
  const initialMem = process.memoryUsage().heapUsed;
  const startTotal = performance.now();

  const headers = Object.keys(rows[0]);
  const rowCount = rows.length;
  const colCount = headers.length;

  // 1. CSV Simulation (Parse)
  const csvText = Papa.unparse(rows);
  const t0 = performance.now();
  const parsed = Papa.parse<Record<string, any>>(csvText, { header: true, dynamicTyping: true });
  const csvParseTimeMs = Number((performance.now() - t0).toFixed(2));
  const cleanRows = parsed.data;

  // 2. Profiling
  const t1 = performance.now();
  const profile = profileDataset(headers, cleanRows);
  const profilingTimeMs = Number((performance.now() - t1).toFixed(2));

  // 3. Semantic Role Detection
  const t2 = performance.now();
  const semantics = detectSemanticRoles(profile);
  const semanticTimeMs = Number((performance.now() - t2).toFixed(2));

  // 4. Rule Pack Resolution & Universal Dashboard Composition
  const t3 = performance.now();
  const rulePack = resolveDomainRulePack(profile, semantics);
  const tableName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const model = await composeUniversalDashboard(tableName, cleanRows, profile, semantics, rulePack);
  const composerTimeMs = Number((performance.now() - t3).toFixed(2));

  // 5. Cross-Filter Re-aggregation Test (Filter by first category)
  const filterCol = model.charts[0]?.dimensionLabel || headers[2];
  const filterVal = model.charts[0]?.data[0]?.label || 'SMB';
  const t4 = performance.now();
  const filtered = cleanRows.filter((r) => String(r[filterCol]) === filterVal);
  // Re-aggregate a sum over filtered
  const sumCol = model.kpiCards.find((k) => k.isFinancial)?.sourceColumns[0] || headers[headers.length - 1];
  filtered.reduce((acc, r) => acc + (Number(r[sumCol]) || 0), 0);
  const crossFilterTimeMs = Number((performance.now() - t4).toFixed(2));

  // 6. Canonical XLSX Export
  const canonicalExporter = new CanonicalExporter();
  const t5 = performance.now();
  const xlsxBuf = await canonicalExporter.exportToExcel(model, cleanRows, { datasetName: name });
  const xlsxExportTimeMs = Number((performance.now() - t5).toFixed(2));

  // 7. Standalone HTML Export
  const t6 = performance.now();
  const htmlStr = canonicalExporter.exportToHtml(model, cleanRows, { datasetName: name });
  const htmlExportTimeMs = Number((performance.now() - t6).toFixed(2));

  // 8. Genuine Binary PDF Export
  const truePdfExporter = new TruePdfExporter();
  const t7 = performance.now();
  const pdfBytes = truePdfExporter.exportToPdf(model, cleanRows, { datasetName: name });
  const pdfBinaryTimeMs = Number((performance.now() - t7).toFixed(2));

  const totalWorkflowMs = Number((performance.now() - startTotal).toFixed(2));
  const throughputRowsSec = Math.round((rowCount / (totalWorkflowMs / 1000)));
  const finalMem = process.memoryUsage().heapUsed;
  const heapUsedMbDelta = Number(((finalMem - initialMem) / (1024 * 1024)).toFixed(2));

  return {
    tier,
    datasetName: name,
    rowCount,
    colCount,
    csvParseTimeMs,
    profilingTimeMs,
    semanticTimeMs,
    composerTimeMs,
    crossFilterTimeMs,
    xlsxExportTimeMs,
    xlsxSizeBytes: xlsxBuf.length,
    htmlExportTimeMs,
    htmlSizeBytes: Buffer.byteLength(htmlStr, 'utf8'),
    pdfBinaryTimeMs,
    pdfSizeBytes: pdfBytes.length,
    totalWorkflowMs,
    throughputRowsSec,
    heapUsedMbDelta,
  };
}

async function main() {
  console.log('========================================================================');
  console.log('PRD v9.0 PHASE 9F: PERFORMANCE, MEMORY & SCALABILITY BENCHMARK');
  console.log('========================================================================\n');

  // Load Fixtures
  const salesCsvPath = path.resolve(process.cwd(), 'public/datasets/sales_6k.csv');
  const salesRaw = fs.readFileSync(salesCsvPath, 'utf8');
  const salesRows = Papa.parse<Record<string, any>>(salesRaw, { header: true, dynamicTyping: true }).data.filter(
    (r) => r && Object.keys(r).length > 2
  );

  const helpdeskCsvPath = path.resolve(process.cwd(), 'scratch/helpdesk_test_fixture.csv');
  let helpdeskRows: Record<string, any>[] = [];
  if (fs.existsSync(helpdeskCsvPath)) {
    const hdRaw = fs.readFileSync(helpdeskCsvPath, 'utf8');
    helpdeskRows = Papa.parse<Record<string, any>>(hdRaw, { header: true, dynamicTyping: true }).data.filter(
      (r) => r && Object.keys(r).length > 2
    );
  } else {
    // Generate 8,000 helpdesk rows
    for (let i = 1; i <= 8000; i++) {
      helpdeskRows.push({
        Case_ID: `HD-${String(i).padStart(6, '0')}`,
        Created_Date: '2025-06-15',
        State: i % 4 === 0 ? 'Closed' : 'In Progress',
        Priority: i % 5 === 0 ? 'Critical' : 'High',
        Resolution_Hours: (i * 1.3) % 48,
        Resolver_Team: ['Tier 1', 'Tier 2', 'DevOps', 'Security'][i % 4],
      });
    }
  }

  const smallRows = salesRows.slice(0, 500);
  const largeRows = generateSyntheticLargeDataset(25000);

  console.log('Executing Tier 1: Small Dataset (500 rows)...');
  const r1 = await runBenchmarkTier('Small', 'Executive Sales Sample', smallRows);
  console.log(`  ✓ Total Workflow: ${r1.totalWorkflowMs}ms | Throughput: ${r1.throughputRowsSec.toLocaleString()} rows/s | Heap Delta: ${r1.heapUsedMbDelta} MB`);

  console.log('Executing Tier 2A: Medium Dataset - Sales Ledger (6,000 rows, 22 cols)...');
  const r2a = await runBenchmarkTier('Medium-Sales', 'Sales & Revenue Operations', salesRows);
  console.log(`  ✓ Total Workflow: ${r2a.totalWorkflowMs}ms | Throughput: ${r2a.throughputRowsSec.toLocaleString()} rows/s | Heap Delta: ${r2a.heapUsedMbDelta} MB`);

  console.log(`Executing Tier 2B: Medium Dataset - Helpdesk Operations (${helpdeskRows.length.toLocaleString()} rows)...`);
  const r2b = await runBenchmarkTier('Medium-Helpdesk', 'IT Helpdesk Operations', helpdeskRows);
  console.log(`  ✓ Total Workflow: ${r2b.totalWorkflowMs}ms | Throughput: ${r2b.throughputRowsSec.toLocaleString()} rows/s | Heap Delta: ${r2b.heapUsedMbDelta} MB`);

  console.log('Executing Tier 3: Large Dataset - Stress Scale (25,000 rows, 13 cols)...');
  const r3 = await runBenchmarkTier('Large-Stress', 'Enterprise Commerce Scale Stress', largeRows);
  console.log(`  ✓ Total Workflow: ${r3.totalWorkflowMs}ms | Throughput: ${r3.throughputRowsSec.toLocaleString()} rows/s | Heap Delta: ${r3.heapUsedMbDelta} MB`);

  const results = [r1, r2a, r2b, r3];

  console.log('\n========================================================================');
  console.log('PHASE 9F MULTI-TIER PERFORMANCE SUMMARY');
  console.log('========================================================================');
  console.table(
    results.map((r) => ({
      Tier: r.tier,
      Rows: r.rowCount.toLocaleString(),
      Cols: r.colCount,
      'Parse (ms)': r.csvParseTimeMs,
      'Profile (ms)': r.profilingTimeMs,
      'Compose (ms)': r.composerTimeMs,
      'Filter (ms)': r.crossFilterTimeMs,
      'XLSX (ms)': r.xlsxExportTimeMs,
      'HTML (ms)': r.htmlExportTimeMs,
      'PDF (ms)': r.pdfBinaryTimeMs,
      'Total (ms)': r.totalWorkflowMs,
      'Rows/sec': r.throughputRowsSec.toLocaleString(),
    }))
  );

  const outPath = path.resolve(process.cwd(), 'scratch/phase9f_performance_benchmark_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nDetailed benchmark metrics written to: ${outPath}`);
}

main().catch((err) => {
  console.error('Benchmark execution error:', err);
  process.exit(1);
});
