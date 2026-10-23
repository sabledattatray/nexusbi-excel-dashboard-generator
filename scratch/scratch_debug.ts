import fs from 'node:fs';
import Papa from 'papaparse';
import { inspectDatasetSchema } from './src/utils/schemaDetector.ts';
import { inferColumnMapping, buildDatasetFromUpload } from './src/utils/dataImporter.ts';

const csvContent = fs.readFileSync('C:\\Users\\sable\\Downloads\\Sales_MIS_Validation_6000_Transactions.csv', 'utf8');
const parsed = Papa.parse(csvContent, { header: true, dynamicTyping: false, skipEmptyLines: true });
console.log('Parsed rows:', parsed.data.length);
console.log('Headers:', parsed.meta.fields);
const schema = inspectDatasetSchema(parsed.meta.fields, parsed.data);
console.log('Detected schema:', JSON.stringify({
  domain: schema.domain,
  identifierColumn: schema.identifierColumn,
  dateColumn: schema.dateColumn,
  entityColumn: schema.entityColumn,
  primaryCategory: schema.primaryCategory,
  secondaryCategory: schema.secondaryCategory,
  channelColumn: schema.channelColumn,
  primaryMetric: schema.primaryMetric,
  secondaryMetric: schema.secondaryMetric,
  volumeMetric: schema.volumeMetric,
  rateMetric: schema.rateMetric,
  currencyCode: schema.currencyCode,
  currencySymbol: schema.currencySymbol,
}, null, 2));

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
console.log('Inferred mapping:', JSON.stringify(mapping, null, 2));

const dataset = buildDatasetFromUpload(upload, mapping, {
  companyName: 'Test Corp',
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

console.log('Dataset KPI:', JSON.stringify(dataset.dataset.kpi, null, 2));
console.log('Sample transaction:', JSON.stringify(dataset.dataset.transactions[0], null, 2));
