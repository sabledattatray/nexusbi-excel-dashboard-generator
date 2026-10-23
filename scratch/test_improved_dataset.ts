import fs from 'node:fs';
import Papa from 'papaparse';
import { inspectDatasetSchema } from './src/utils/schemaDetector.ts';
import { inferColumnMapping, buildDatasetFromUpload } from './src/utils/dataImporter.ts';

const csvContent = fs.readFileSync('C:\\Users\\sable\\Downloads\\Sales_MIS_Validation_6000_Transactions.csv', 'utf8');
const parsed = Papa.parse(csvContent, { header: true, dynamicTyping: false, skipEmptyLines: true });

function improvedInspectSchema(headers: string[], rows: any[]) {
  const schema = inspectDatasetSchema(headers, rows);
  
  const netCol = headers.find(h => /^(net_?sales|net_?revenue|net_?amount)(_?(inr|usd|eur|gbp))?$/i.test(h.trim()));
  if (netCol) {
    schema.primaryMetric = netCol;
    schema.primaryMetricLabel = 'Net Sales';
  }

  const profitCol = headers.find(h => /^(gross_?profit|profit_?amount|net_?profit|profit)(_?(inr|usd|eur|gbp))?$/i.test(h.trim()));
  const costCol = headers.find(h => /^(total_?cost|cogs|cost_?basis|cost)(_?(inr|usd|eur|gbp))?$/i.test(h.trim()));
  if (profitCol) {
    schema.secondaryMetric = profitCol;
    schema.secondaryMetricLabel = 'Gross Profit';
  } else if (costCol) {
    schema.secondaryMetric = costCol;
    schema.secondaryMetricLabel = 'Total Cost';
  }

  const channelCol = headers.find(h => /^(sales_?channel|distribution_?channel|channel)$/i.test(h.trim()));
  if (channelCol) {
    schema.channelColumn = channelCol;
    schema.channelColumnLabel = 'Sales Channel';
  }

  const custIdCol = headers.find(h => /^(customer_?id|client_?id|account_?id)$/i.test(h.trim()));
  if (custIdCol) {
    schema.entityColumn = custIdCol;
  }

  return schema;
}

const schema = improvedInspectSchema(parsed.meta.fields, parsed.data);
const upload = {
  headers: parsed.meta.fields,
  rows: parsed.data,
  totalRows: parsed.data.length,
  fileName: 'Sales_MIS_Validation_6000_Transactions.csv',
  fileSize: csvContent.length,
  fileType: 'csv' as const,
  schema,
};

const mapping = inferColumnMapping(upload);
const datasetResult = buildDatasetFromUpload(upload, mapping, {
  companyName: 'Apex Sales Intelligence',
  industryPreset: 'ecommerce_retail',
  currencySymbol: '₹',
  theme: 'slate_minimal',
  targetQuarter: 'Q4-2025',
  fiscalYear: 2025,
  useLiveExcelFormulas: true,
  enableSheetProtection: false,
  executiveSponsor: 'Audit Exec',
  kpiTargetMultiplier: 1.05,
  auditWatermark: 'CONFIDENTIAL',
  department: 'Sales',
  accentColor: '#0284c7',
  reportTitle: 'Executive Sales Dashboard',
  proUnprotectedExport: true,
  stripDrawingsForCleanImport: false,
});

const ds = datasetResult.dataset;
console.log('KPI Results:');
console.log('Total Revenue (Net Sales):', ds.kpi.totalRevenue);
console.log('Total Gross Profit:', ds.kpi.totalGrossProfit);
console.log('Total COGS:', ds.kpi.totalCogs);
console.log('Total Units:', ds.kpi.totalUnits);
console.log('Overall Margin Pct:', (ds.kpi.overallMarginPct * 100).toFixed(2) + '%');
console.log('Order Count:', ds.kpi.orderCount);
console.log('Average Deal Size:', ds.kpi.averageDealSize);
console.log('Active Customers:', ds.kpi.activeCustomers);

console.log('\nRegional Performance:');
for (const r of ds.regionalPerformance) {
  console.log(`  ${r.region}: Net Sales=${r.actualRevenue}, Profit=${r.actualProfit}, Attainment=${r.quotaAttainmentPct}`);
}

console.log('\nCategory Summaries:');
for (const c of ds.categorySummaries) {
  console.log(`  ${c.category}: Net Sales=${c.revenue}, Profit=${c.grossProfit}, Margin=${(c.marginPct * 100).toFixed(2)}%`);
}

console.log('\nFirst 2 Transactions:');
console.log(ds.transactions.slice(0, 2));
