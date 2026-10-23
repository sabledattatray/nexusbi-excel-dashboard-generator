import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { inspectDatasetSchema } from '../src/utils/schemaDetector';
import { buildDatasetFromUpload } from '../src/utils/dataImporter';
import { exportToProfessionalExcel } from '../src/utils/excelExporter';

async function run() {
  const csvPath = 'C:\\Users\\sable\\Downloads\\Sales_MIS_Validation_6000_Transactions.csv';
  const outXlsxPath = 'C:\\Users\\sable\\Downloads\\Sales_MIS_Validation_6000_Transactions_Executive_Sales_Dashboard_2026.xlsx';

  console.log('1. Reading CSV:', csvPath);
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const rows = parsed.data as Record<string, any>[];
  console.log(`Loaded ${rows.length} rows.`);

  console.log('2. Detecting schema...');
  const headers = parsed.meta.fields || Object.keys(rows[0] || {});
  const schema = inspectDatasetSchema(headers, rows);
  console.log('Detected schema:', {
    primaryMetric: schema.primaryMetric,
    secondaryMetric: schema.secondaryMetric,
    volumeMetric: schema.volumeMetric,
    primaryCategory: schema.primaryCategory,
    secondaryCategory: schema.secondaryCategory,
    channelColumn: schema.channelColumn,
    entityColumn: schema.entityColumn,
    currencyCode: schema.currencyCode,
  });

  console.log('3. Building dataset from upload...');
  const importResult = buildDatasetFromUpload(
    {
      rows,
      fileName: 'Sales_MIS_Validation_6000_Transactions.csv',
      headers,
      schema,
      totalRows: rows.length,
      fileSize: csvText.length,
      fileType: 'csv',
    },
    {
      primaryMetricCol: schema.primaryMetric,
      secondaryMetricCol: schema.secondaryMetric,
      volumeMetricCol: schema.volumeMetric,
      primaryCategoryCol: schema.primaryCategory,
      secondaryCategoryCol: schema.secondaryCategory,
    },
    {
      industry: schema.detectedIndustry,
      companyName: 'NexusBI Analytics',
    }
  );
  const dataset = importResult.dataset;

  console.log('Dataset KPIs:');
  console.log('  Total Revenue (Net):', dataset.kpi.totalRevenue);
  console.log('  Total Gross Profit:', dataset.kpi.totalGrossProfit);
  console.log('  Total COGS:', dataset.kpi.totalCogs);
  console.log('  Overall Margin %:', (dataset.kpi.overallMarginPct * 100).toFixed(2) + '%');
  console.log('  Total Units (Qty):', dataset.kpi.totalUnits);
  console.log('  Transactions Count:', dataset.kpi.orderCount);
  console.log('  Average Ticket:', dataset.kpi.averageDealSize);
  console.log('  Active Accounts:', dataset.kpi.activeCustomers);

  console.log('\nRegional Net Sales:');
  for (const reg of dataset.regionalPerformance) {
    console.log(`  ${reg.region}: ${reg.actualRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Profit: ${reg.actualProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })})`);
  }

  console.log('\nCategory Net Sales:');
  for (const cat of dataset.categorySummaries) {
    console.log(`  ${cat.category}: ${cat.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Margin: ${(cat.marginPct * 100).toFixed(2)}%)`);
  }

  console.log('\n4. Exporting workbook...');
  const res = await exportToProfessionalExcel(
    dataset,
    {
      ...dataset.config,
      companyName: 'Sales_MIS_Validation_6000_Transactions',
      useLiveExcelFormulas: true,
    },
    { unprotected: false }
  );

  let buffer: Buffer;
  if (Buffer.isBuffer(res.blob)) {
    buffer = res.blob;
  } else if ((res.blob as any).arrayBuffer) {
    const ab = await (res.blob as any).arrayBuffer();
    buffer = Buffer.from(ab);
  } else {
    buffer = Buffer.from(res.blob as any);
  }
  const candidates = [
    'C:\\Users\\sable\\Downloads\\Sales_MIS_Validation_6000_Transactions_Executive_Sales_Dashboard_2026 (1).xlsx',
    'C:\\Users\\sable\\Downloads\\Sales_MIS_Validation_6000_Transactions_Executive_Sales_Dashboard_2026(1).xlsx',
    'C:\\Users\\sable\\Downloads\\Sales_MIS_Validation_6000_Transactions_Executive_Sales_Dashboard_2026_CORRECTED.xlsx',
    'C:\\Users\\sable\\Downloads\\Sales_MIS_Validation_6000_Transactions_Executive_Sales_Dashboard_2026.xlsx',
  ];

  for (const targetPath of candidates) {
    try {
      fs.writeFileSync(targetPath, buffer);
      console.log(`\nSuccessfully written ${buffer.length} bytes to: ${targetPath}`);
    } catch (err: any) {
      console.log(`Could not write to ${targetPath}: ${err.message}`);
    }
  }
}

run().catch(console.error);
