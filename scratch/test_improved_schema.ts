import fs from 'node:fs';
import Papa from 'papaparse';
import { inspectDatasetSchema } from './src/utils/schemaDetector.ts';
import { inferColumnMapping, buildDatasetFromUpload } from './src/utils/dataImporter.ts';

const csvContent = fs.readFileSync('C:\\Users\\sable\\Downloads\\Sales_MIS_Validation_6000_Transactions.csv', 'utf8');
const parsed = Papa.parse(csvContent, { header: true, dynamicTyping: false, skipEmptyLines: true });
console.log('Parsed rows:', parsed.data.length);

// Test improved schema detection logic
function improvedInspectSchema(headers: string[], rows: any[]) {
  const schema = inspectDatasetSchema(headers, rows);
  
  // Prefer Net Sales over Gross Sales for primary metric if present
  const netCol = headers.find(h => /^(net_?sales|net_?revenue|net_?amount)(_?(inr|usd|eur|gbp))?$/i.test(h.trim()));
  if (netCol) {
    schema.primaryMetric = netCol;
    schema.primaryMetricLabel = netCol;
  }

  // Ensure secondaryMetric is NOT a percentage or rate
  const profitCol = headers.find(h => /^(gross_?profit|profit_?amount|net_?profit|profit)(_?(inr|usd|eur|gbp))?$/i.test(h.trim()));
  const costCol = headers.find(h => /^(total_?cost|cogs|cost_?basis|cost)(_?(inr|usd|eur|gbp))?$/i.test(h.trim()));
  if (profitCol) {
    schema.secondaryMetric = profitCol;
    schema.secondaryMetricLabel = profitCol;
  } else if (costCol) {
    schema.secondaryMetric = costCol;
    schema.secondaryMetricLabel = costCol;
  }

  // Ensure channelColumn prefers true sales channel over city
  const channelCol = headers.find(h => /^(sales_?channel|distribution_?channel|channel)$/i.test(h.trim()));
  if (channelCol) {
    schema.channelColumn = channelCol;
    schema.channelColumnLabel = channelCol;
  }

  // Ensure entityColumn prefers customer ID / name over segment
  const custIdCol = headers.find(h => /^(customer_?id|client_?id|account_?id)$/i.test(h.trim()));
  if (custIdCol) {
    schema.entityColumn = custIdCol;
  }

  return schema;
}

const schema = improvedInspectSchema(parsed.meta.fields, parsed.data);
console.log('Improved Schema:', {
  primaryMetric: schema.primaryMetric,
  secondaryMetric: schema.secondaryMetric,
  volumeMetric: schema.volumeMetric,
  primaryCategory: schema.primaryCategory,
  secondaryCategory: schema.secondaryCategory,
  channelColumn: schema.channelColumn,
  entityColumn: schema.entityColumn,
});

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
console.log('Mapping:', {
  primaryMetricCol: mapping.primaryMetricCol,
  secondaryMetricCol: mapping.secondaryMetricCol,
  revenueCol: mapping.revenueCol,
  profitCol: mapping.profitCol,
  channelCol: mapping.channelCol,
});
