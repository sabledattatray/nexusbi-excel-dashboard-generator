import assert from 'node:assert/strict';
import { test } from 'node:test';
import JSZip from 'jszip';
import ExcelJS from 'exceljs';
import { buildDatasetFromUpload, RawParsedTable } from './dataImporter';
import { exportToProfessionalExcel } from './excelExporter';
import { DatasetConfig } from '../types/dataset';
import { getIndustryTheme } from './industryTheme';

const baseConfig: DatasetConfig = {
  companyName: 'Acme Test Corp',
  reportTitle: 'Acme Test Analytics',
  industry: 'healthcare_pharma',
  recordCount: 50,
  currency: 'USD',
  currencySymbol: '$',
  includeChartsInExcel: true,
  useLiveExcelFormulas: true,
};

test('custom uploaded CSV produces exact 6-sheet professional workbook with 7 charts and formulas', async () => {
  const sampleHeaders = ['Invoice_No', 'Order_Date', 'Client_Hospital', 'Medical_Specialty', 'Facility_Region', 'Patient_Procedures', 'Procedure_Revenue', 'Cost_Basis'];
  const sampleRows: Record<string, any>[] = Array.from({ length: 45 }, (_, i) => ({
    Invoice_No: `INV-2024-${1000 + i}`,
    Order_Date: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}`,
    Client_Hospital: `Hospital System ${String.fromCharCode(65 + (i % 8))}`,
    Medical_Specialty: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics'][i % 5],
    Facility_Region: ['East Campus', 'West Campus', 'Central Hub', 'South Clinic'][i % 4],
    Patient_Procedures: 2 + (i % 6),
    Procedure_Revenue: 1200 + (i * 180),
    Cost_Basis: 500 + (i * 70),
  }));

  const mockTable: RawParsedTable = {
    headers: sampleHeaders,
    rows: sampleRows,
    totalRows: sampleRows.length,
    fileName: 'hospital_surgical_procedures_2024.csv',
    fileSize: 4096,
    fileType: 'csv',
  };

  const importResult = buildDatasetFromUpload(
    mockTable,
    {
      idCol: 'Invoice_No',
      dateCol: 'Order_Date',
      entityCol: 'Client_Hospital',
      primaryCategoryCol: 'Medical_Specialty',
      secondaryCategoryCol: 'Facility_Region',
      volumeMetricCol: 'Patient_Procedures',
      primaryMetricCol: 'Procedure_Revenue',
      secondaryMetricCol: 'Cost_Basis',
    },
    baseConfig
  );

  const dataset = importResult.dataset;

  // Verify dataset structural integrity
  assert.equal(dataset.transactions.length, 45);
  assert.equal(dataset.monthlyTrends.length, 12);
  assert.equal(dataset.categorySummaries.length, 5);
  assert.equal(dataset.regionalPerformance.length, 4);
  assert.ok(dataset.productCatalog.length >= 5);
  assert.ok(dataset.customerAccounts.length >= 4);
  assert.ok(dataset.kpi.totalRevenue > 0);
  assert.ok(dataset.kpi.totalGrossProfit > 0);

  // Generate Excel workbook
  const { blob, filename } = await exportToProfessionalExcel(dataset, dataset.config);
  assert.ok(filename.includes('Executive_Sales_Dashboard'));

  const buffer = Buffer.from(await blob.arrayBuffer());
  const zip = await JSZip.loadAsync(buffer);
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(buffer as any);

  // 1. Verify exact 6 worksheets
  const expectedSheets = [
    'Executive Dashboard',
    'Pivot Table Analysis',
    'Sales Transactions',
    'Regional Performance',
    'Product Catalog',
    'Customer Accounts',
  ];
  assert.deepEqual(book.worksheets.map((s) => s.name), expectedSheets);

  // 2. Verify DrawingML Charts (all 7 charts present)
  const chartFiles = Object.keys(zip.files).filter((p) => /^xl\/charts\/chart\d+\.xml$/.test(p));
  assert.equal(chartFiles.length, 7);

  // 3. Verify Sheet 1 Slicers & Formulas
  const dash = book.getWorksheet('Executive Dashboard')!;
  assert.equal(dash.getCell('C4').dataValidation.type, 'list');
  assert.equal(dash.getCell('G4').dataValidation.type, 'list');
  assert.ok(dash.getCell('B7').formula?.includes('Sales Transactions'));

  // 4. Verify Sheet 2 Pivot Slicers
  const pivot = book.getWorksheet('Pivot Table Analysis')!;
  assert.equal(pivot.getCell('C4').dataValidation.type, 'list');
  assert.equal(pivot.getCell('F4').dataValidation.type, 'list');

  // 5. Verify Sheet 3 Sales Transactions ledger
  const tx = book.getWorksheet('Sales Transactions')!;
  assert.equal(tx.getCell('A3').text, dataset.transactions[0].id);
  assert.equal(tx.getCell('A47').text, dataset.transactions[44].id);
  assert.equal(tx.rowCount, 48); // Header (1, 2) + 45 rows + 1 total row = 48
  assert.equal(tx.getCell('T3').formula, 'R3*Q3*(1-S3)');
  assert.equal(tx.getCell('U3').formula, 'R3*P3');
  assert.equal(tx.getCell('V3').formula, 'T3-U3');
  assert.equal(tx.getCell('W3').formula, 'V3/T3');

  // 6. Verify Chart XML palette contains healthcare theme colors and data labels for bars
  const theme = getIndustryTheme('healthcare_pharma');
  const chart1Xml = await zip.file('xl/charts/chart1.xml')!.async('string');
  assert.ok(chart1Xml.includes(theme.colors.excel.chartThemeHex[0]));
  assert.ok(chart1Xml.includes('<c:dLbls>'));
  assert.ok(chart1Xml.includes('<c:showVal val="1"/>'));
  assert.ok(chart1Xml.includes('<c:dLblPos val="outEnd"/>'));

  const chart3Xml = await zip.file('xl/charts/chart3.xml')!.async('string');
  assert.ok(chart3Xml.includes('<c:dLbls>'));
  assert.ok(chart3Xml.includes('<c:showVal val="1"/>'));
  assert.ok(chart3Xml.includes('<c:dLblPos val="outEnd"/>'));

  // 7. Verify worksheet and workbook protection with password
  const sheet1Xml = await zip.file('xl/worksheets/sheet1.xml')!.async('string');
  assert.ok(sheet1Xml.includes('<sheetProtection'));
  assert.ok(sheet1Xml.includes('algorithmName="SHA-512"'));
  assert.ok(sheet1Xml.includes('objects="1"'));
  assert.ok(sheet1Xml.includes('selectLockedCells="1"'));
  assert.ok(sheet1Xml.includes('deleteRows="1"'));
  assert.ok(sheet1Xml.includes('autoFilter="0"'));

  const wbXml = await zip.file('xl/workbook.xml')!.async('string');
  assert.ok(wbXml.includes('<workbookProtection'));
  assert.ok(wbXml.includes('lockStructure="1"'));
  assert.ok(wbXml.includes('algorithmName="SHA-512"'));

  // Verify filter dropdown cells C4 and G4 are unlocked for user interaction
  assert.equal(dash.getCell('C4').protection?.locked, false);
  assert.equal(dash.getCell('G4').protection?.locked, false);
});

test('file upload enforces 25 MB limit and protects in-browser memory', async () => {
  const { parseUploadedFile, MAX_UPLOAD_FILE_SIZE_BYTES } = await import('./dataImporter');

  // Create a mock File object exceeding 25 MB
  const oversizedFile = {
    name: 'giant_dataset_35mb.csv',
    size: MAX_UPLOAD_FILE_SIZE_BYTES + 1024,
    text: async () => 'Col1,Col2\n1,2',
  } as unknown as File;

  await assert.rejects(
    async () => {
      await parseUploadedFile(oversizedFile);
    },
    (err: any) => {
      assert.ok(err.message.includes('exceeds the 25 MB limit'));
      return true;
    }
  );
});

test('Pro unprotected export generates 100% unlocked workbook without sheet or workbook protection', async () => {
  const { exportToProfessionalExcel } = await import('./excelExporter');
  const { generateProfessionalDataset } = await import('./professionalPresentation');
  const { buildUpiPaymentUrl, unlockProLicense } = await import('./proLicenseManager');

  const config: DatasetConfig = {
    companyName: 'Nexdial.io Cloud Technologies Inc.',
    reportTitle: 'Executive Sales Dashboard',
    industry: 'enterprise_tech',
    recordCount: 100,
    currency: 'USD',
    currencySymbol: '$',
    includeChartsInExcel: true,
    useLiveExcelFormulas: true,
  };

  const dataset = generateProfessionalDataset(config);
  const result = await exportToProfessionalExcel(dataset, config, { unprotected: true });

  assert.ok(result.filename.includes('_UNLOCKED.xlsx'));

  const zip = await JSZip.loadAsync(Buffer.from(await result.blob.arrayBuffer()));
  const sheet1Xml = await zip.file('xl/worksheets/sheet1.xml')!.async('string');
  assert.ok(!sheet1Xml.includes('<sheetProtection'), 'Unprotected export must not contain sheetProtection');

  const wbXml = await zip.file('xl/workbook.xml')!.async('string');
  assert.ok(!wbXml.includes('<workbookProtection'), 'Unprotected export must not contain workbookProtection');

  // Verify UPI payment URL builder for both plans
  const singleUrl = buildUpiPaymentUrl('single');
  assert.ok(singleUrl.startsWith('upi://pay?'));
  assert.ok(singleUrl.includes('8010803756'));
  assert.ok(singleUrl.includes('am=9'));
  assert.ok(singleUrl.includes('cu=INR'));

  const lifetimeUrl = buildUpiPaymentUrl('lifetime');
  assert.ok(lifetimeUrl.startsWith('upi://pay?'));
  assert.ok(lifetimeUrl.includes('8010803756'));
  assert.ok(lifetimeUrl.includes('am=49'));
  assert.ok(lifetimeUrl.includes('cu=INR'));
});

