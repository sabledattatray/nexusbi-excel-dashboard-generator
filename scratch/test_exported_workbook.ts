import fs from 'node:fs';
import Papa from 'papaparse';
import { inspectDatasetSchema } from './src/utils/schemaDetector.ts';
import { inferColumnMapping, buildDatasetFromUpload } from './src/utils/dataImporter.ts';
import { exportToProfessionalExcel } from './src/utils/excelExporter.ts';
import ExcelJS from 'exceljs';

async function run() {
  const csvContent = fs.readFileSync('C:\\Users\\sable\\Downloads\\Sales_MIS_Validation_6000_Transactions.csv', 'utf8');
  const parsed = Papa.parse(csvContent, { header: true, dynamicTyping: false, skipEmptyLines: true });
  const schema = inspectDatasetSchema(parsed.meta.fields, parsed.data);
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

  const { blob, filename } = await exportToProfessionalExcel(datasetResult.dataset, datasetResult.dataset.config);
  const buf = Buffer.from(await blob.arrayBuffer());
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf as any);

  const dash = wb.getWorksheet('Executive Dashboard')!;
  console.log('\n--- Executive Dashboard Cells ---');
  console.log('B6 (Label):', dash.getCell('B6').value, 'B7 (Val):', dash.getCell('B7').value);
  console.log('D6 (Label):', dash.getCell('D6').value, 'D7 (Val):', dash.getCell('D7').value);
  console.log('F6 (Label):', dash.getCell('F6').value, 'F7 (Val):', dash.getCell('F7').value);
  console.log('H6 (Label):', dash.getCell('H6').value, 'H7 (Val):', dash.getCell('H7').value);
  console.log('J6 (Label):', dash.getCell('J6').value, 'J7 (Val):', dash.getCell('J7').value);
  console.log('L6 (Label):', dash.getCell('L6').value, 'L7 (Val):', dash.getCell('L7').value);
  console.log('N6 (Label):', dash.getCell('N6').value, 'N7 (Val):', dash.getCell('N7').value);

  const tx = wb.getWorksheet('Sales Transactions')!;
  console.log('\n--- Sales Transactions Row 3 ---');
  console.log('P3 (Unit Cost):', tx.getCell('P3').value);
  console.log('Q3 (List Price):', tx.getCell('Q3').value);
  console.log('R3 (Qty):', tx.getCell('R3').value);
  console.log('S3 (Discount %):', tx.getCell('S3').value);
  console.log('T3 (Net Revenue):', tx.getCell('T3').value);
  console.log('U3 (Total COGS):', tx.getCell('U3').value);
  console.log('V3 (Gross Profit):', tx.getCell('V3').value);
  console.log('W3 (Margin %):', tx.getCell('W3').value);

  const pvt = wb.getWorksheet('Pivot Table Analysis')!;
  console.log('\n--- Pivot Table Analysis ---');
  console.log('H6:', pvt.getCell('H6').value, 'H7:', pvt.getCell('H7').value);
  console.log('I6:', pvt.getCell('I6').value, 'I7:', pvt.getCell('I7').value);
}

run().catch(console.error);
