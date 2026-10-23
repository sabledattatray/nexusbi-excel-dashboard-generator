import fs from 'node:fs';
import Papa from 'papaparse';
import { inspectDatasetSchema } from './src/utils/schemaDetector.ts';
import { inferColumnMapping, buildDatasetFromUpload } from './src/utils/dataImporter.ts';
import { exportToProfessionalExcel } from './src/utils/excelExporter.ts';
import ExcelJS from 'exceljs';

async function run() {
  const csvContent = fs.readFileSync('C:\\Users\\sable\\Downloads\\Sales_MIS_Validation_6000_Transactions.csv', 'utf8');
  const parsed = Papa.parse(csvContent, { header: true, dynamicTyping: false, skipEmptyLines: true });
  console.log('Parsed rows:', parsed.data.length);
  
  const schema = inspectDatasetSchema(parsed.meta.fields, parsed.data);
  console.log('Schema:', {
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
  console.log('\n--- KPI RESULTS ---');
  console.log('Total Revenue:', ds.kpi.totalRevenue);
  console.log('Total Gross Profit:', ds.kpi.totalGrossProfit);
  console.log('Total COGS:', ds.kpi.totalCogs);
  console.log('Total Units:', ds.kpi.totalUnits);
  console.log('Margin Pct:', (ds.kpi.overallMarginPct * 100).toFixed(2) + '%');

  console.log('\n--- SAMPLE TRANSACTION ---');
  console.log(ds.transactions[0]);
}

run().catch(console.error);
