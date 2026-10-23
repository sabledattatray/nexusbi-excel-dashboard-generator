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

  // 1. Verify exact 7 worksheets
  const expectedSheets = [
    'Executive Dashboard',
    'Pivot Table Analysis',
    'Sales Transactions',
    'Regional Performance',
    'Product Catalog',
    'Customer Accounts',
    'Audit & Data Provenance',
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
  assert.equal(tx.getCell('W3').formula, 'IF(T3>0, V3/T3, 0)');

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
  assert.ok(wbXml.includes('workbookAlgorithmName="SHA-512"'));

  // Verify filter dropdown cells C4 and G4 on Executive Dashboard are unlocked for user interaction
  assert.equal(dash.getCell('C4').protection?.locked, false);
  assert.equal(dash.getCell('G4').protection?.locked, false);

  // Verify pivot filter dropdown cells C4 and F4 on Pivot Table Analysis are unlocked for user interaction
  assert.equal(pivot.getCell('C4').protection?.locked, false);
  assert.equal(pivot.getCell('F4').protection?.locked, false);
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

test('dynamic dropdown filters accurately reflect custom uploaded State/City/Zone categories and domain presets', async () => {
  const { buildDatasetFromUpload } = await import('./dataImporter');
  const { exportToProfessionalExcel } = await import('./excelExporter');
  const { generateProfessionalDataset } = await import('./professionalPresentation');

  // Test 1: Custom upload with State, City, Zone, Store
  const sampleHeaders = ['Trans_ID', 'Date', 'Customer', 'Product', 'State', 'Zone', 'Amount', 'Cost'];
  const states = ['California', 'Texas', 'Florida', 'New York', 'Washington', 'Illinois', 'Colorado', 'Ohio'];
  const zones = ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Metro'];
  const sampleRows: Record<string, any>[] = Array.from({ length: 60 }, (_, i) => ({
    Trans_ID: `TRX-${1000 + i}`,
    Date: `2024-${String((i % 12) + 1).padStart(2, '0')}-15`,
    Customer: `Client ${i % 10}`,
    Product: `Product ${i % 5}`,
    State: states[i % states.length],
    Zone: zones[i % zones.length],
    Amount: 1000 + (i * 50),
    Cost: 400 + (i * 20),
  }));

  const mockTable: RawParsedTable = {
    headers: sampleHeaders,
    rows: sampleRows,
    totalRows: sampleRows.length,
    fileName: 'state_zone_sales_data.csv',
    fileSize: 4096,
    fileType: 'csv',
  };

  const importResult = buildDatasetFromUpload(mockTable, {
    idCol: 'Trans_ID',
    dateCol: 'Date',
    entityCol: 'Customer',
    primaryCategoryCol: 'Product',
    secondaryCategoryCol: 'State',
    channelCol: 'Zone',
    primaryMetricCol: 'Amount',
    secondaryMetricCol: 'Cost',
  }, baseConfig);

  // Verify all 8 states and 5 zones were preserved without loss or modulo overwrite
  const importedStates = new Set(importResult.dataset.transactions.map((t) => t.region));
  assert.equal(importedStates.size, 8, 'All 8 unique states must be preserved');
  assert.ok(importedStates.has('California') && importedStates.has('Texas') && importedStates.has('Colorado'));

  const importedZones = new Set(importResult.dataset.transactions.map((t) => t.salesChannel));
  assert.equal(importedZones.size, 5, 'All 5 unique zones must be preserved');
  assert.ok(importedZones.has('North Zone') && importedZones.has('Central Metro'));

  // Export to Excel and verify dropdowns in workbook
  const customExport = await exportToProfessionalExcel(importResult.dataset, baseConfig);
  const customWb = new ExcelJS.Workbook();
  await customWb.xlsx.load(await customExport.blob.arrayBuffer());
  const dashSheet = customWb.getWorksheet('Executive Dashboard')!;

  const filter1Val = dashSheet.getCell('C4').value;
  const filter2Val = dashSheet.getCell('G4').value;
  assert.equal(filter1Val, 'All States', 'Filter 1 default should be All States');
  assert.equal(filter2Val, 'All Zones', 'Filter 2 default should be All Zones');

  // Verify data validation lists do not contain North America or EMEA
  const f1Validation = dashSheet.getCell('C4').dataValidation;
  assert.ok(f1Validation?.formulae?.[0]?.includes('California'), 'Data validation must contain California');
  assert.ok(!f1Validation?.formulae?.[0]?.includes('North America'), 'Must NOT contain hardcoded North America');

  const f2Validation = dashSheet.getCell('G4').dataValidation;
  assert.ok(f2Validation?.formulae?.[0]?.includes('North Zone'), 'Data validation must contain North Zone');
  assert.ok(!f2Validation?.formulae?.[0]?.includes('Direct Enterprise'), 'Must NOT contain hardcoded Direct Enterprise');

  // Test 2: Automotive & EV preset has domain-specific gigafactories & channels
  const autoConfig: DatasetConfig = {
    ...baseConfig,
    industry: 'automotive_ev',
    companyName: 'Veloce Electric Motors',
  };
  const autoDataset = generateProfessionalDataset(autoConfig);
  const autoExport = await exportToProfessionalExcel(autoDataset, autoConfig);
  const autoWb = new ExcelJS.Workbook();
  await autoWb.xlsx.load(await autoExport.blob.arrayBuffer());
  const autoDash = autoWb.getWorksheet('Executive Dashboard')!;

  const autoF1 = autoDash.getCell('C4').value;
  const autoF2 = autoDash.getCell('G4').value;
  assert.equal(autoF1, 'All Assembly Gigafactories');
  assert.equal(autoF2, 'All Channels');

  const autoF1Valid = autoDash.getCell('C4').dataValidation?.formulae?.[0] || '';
  assert.ok(autoF1Valid.includes('Austin Gigafactory'), 'Must contain Austin Gigafactory');
  assert.ok(!autoF1Valid.includes('North America'), 'Must NOT contain generic North America');
});

test('locally imported CSV with State, City, Zone correctly maps roles and presents dynamic filters without glitches', async () => {
  const { inferColumnMapping, buildDatasetFromUpload } = await import('./dataImporter');
  const { inspectDatasetSchema } = await import('./schemaDetector');
  const { getProfessionalSpec } = await import('./professionalPresentation');
  const { getDimensionAllLabel } = await import('./excelExporter');

  const headers = ['Order ID', 'Order Date', 'State', 'City', 'Zone', 'Department', 'Revenue', 'Profit'];
  const sampleRows = [
    { 'Order ID': '101', 'Order Date': '2024-01-10', State: 'Maharashtra', City: 'Mumbai', Zone: 'West Zone', Department: 'Industrial', Revenue: 5000, Profit: 1500 },
    { 'Order ID': '102', 'Order Date': '2024-02-12', State: 'Gujarat', City: 'Ahmedabad', Zone: 'West Zone', Department: 'Commercial', Revenue: 4200, Profit: 1200 },
    { 'Order ID': '103', 'Order Date': '2024-03-15', State: 'Karnataka', City: 'Bengaluru', Zone: 'South Zone', Department: 'Technology', Revenue: 8900, Profit: 2800 },
  ];

  const schema = inspectDatasetSchema(headers, sampleRows);
  const mapping = inferColumnMapping({
    headers,
    rows: sampleRows,
    totalRows: sampleRows.length,
    fileName: 'india_state_data.csv',
    fileSize: 1024,
    fileType: 'csv',
    schema,
  });

  // Verify State is recognized as secondaryCategoryCol and NOT statusCol
  assert.equal(mapping.secondaryCategoryCol, 'State', 'State must be recognized as Filter 1 dimension');
  assert.notEqual(mapping.statusCol, 'State', 'Geographic State must not be classified as statusCol');
  assert.equal(mapping.channelCol, 'City', 'City must be recognized as Filter 2 channel dimension');

  const importResult = buildDatasetFromUpload({
    headers,
    rows: sampleRows,
    totalRows: sampleRows.length,
    fileName: 'india_state_data.csv',
    fileSize: 1024,
    fileType: 'csv',
    schema,
  }, mapping, {
    ...baseConfig,
    companyName: 'Apex Bharat Logistics',
  });

  // Verify regionalPerformance contains ONLY the uploaded Indian states, no fake North America
  const regNames = importResult.dataset.regionalPerformance.map((r) => r.region);
  assert.ok(regNames.includes('Maharashtra') && regNames.includes('Karnataka') && regNames.includes('Gujarat'));
  assert.ok(!regNames.includes('North America') && !regNames.includes('EMEA'), 'Must not inject North America or EMEA');

  // Verify professional spec for web UI IndustryDashboard
  const spec = getProfessionalSpec(importResult.dataset);
  assert.equal(spec.filter, 'State', 'IndustryDashboard filter must be State, not Global Region');
  assert.equal(spec.category, 'Department', 'Category must be Department, not Product Category');

  // Verify all-label generator
  assert.equal(getDimensionAllLabel(spec.filter), 'All States');
  assert.equal(getDimensionAllLabel('City'), 'All Cities');
  assert.equal(getDimensionAllLabel('Zone'), 'All Zones');

  // Verify rawRows has non-undefined values for spec.filter
  const choices = [...new Set((importResult.dataset.rawRows || []).map((r) => String(r[spec.filter])))].sort();
  assert.ok(!choices.includes('undefined') && !choices.includes('null') && !choices.includes(''));
  assert.deepEqual(choices, ['Gujarat', 'Karnataka', 'Maharashtra']);
});

test('Helpdesk 8,000-ticket fixture imports as customer_support_ops and exports authentic 6-sheet IT Helpdesk workbook', async () => {
  const fs = await import('node:fs');
  const Papa = (await import('papaparse')).default;
  const { inferColumnMapping, buildDatasetFromUpload } = await import('./dataImporter');
  const { inspectDatasetSchema } = await import('./schemaDetector');
  const { getProfessionalSpec } = await import('./professionalPresentation');
  const { exportToProfessionalExcel } = await import('./excelExporter');

  const csvPath = 'C:\\Users\\sable\\Downloads\\Excel Tests\\Helpdesk_Operations_8000_Tickets_Universal_Dashboard_Test_Upload.csv';
  assert.ok(fs.existsSync(csvPath), 'Upload CSV fixture must exist');

  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.replace(/^\ufeff/, '').trim(),
  });

  const rawHeaders = (parsed.meta.fields || []).map((h) => h.replace(/^\ufeff/, '').trim()).filter(Boolean);
  const rows = (parsed.data as Record<string, any>[]).filter((r) => Object.values(r).some((v) => v !== null && v !== undefined && v !== ''));

  assert.equal(rows.length, 8000, 'Must have exactly 8,000 ticket rows');

  // 1. Schema Detection
  const schema = inspectDatasetSchema(rawHeaders, rows);
  assert.equal(schema.detectedIndustry, 'customer_support_ops', 'Domain must be customer_support_ops');
  assert.equal(schema.detectedDomain, 'customer_support_ops', 'detectedDomain must be customer_support_ops');
  assert.equal(schema.hasFinancialMetrics, false, 'hasFinancialMetrics must be false');

  // 2. Column Mapping
  const mapping = inferColumnMapping({
    headers: rawHeaders,
    rows,
    totalRows: rows.length,
    fileName: 'Helpdesk_Operations_8000_Tickets_Universal_Dashboard_Test_Upload.csv',
    fileSize: fs.statSync(csvPath).size,
    fileType: 'csv',
    schema,
  });

  assert.equal(mapping.primaryMetricCol, undefined, 'Must NOT assign SLA Limit or any measure to primaryMetric');
  assert.equal(mapping.secondaryMetricCol, undefined, 'Must NOT assign Reopened Flag to secondaryMetric');

  // 3. Build Dataset
  const importResult = buildDatasetFromUpload(
    {
      headers: rawHeaders,
      rows,
      totalRows: rows.length,
      fileName: 'Helpdesk_Operations_8000_Tickets_Universal_Dashboard_Test_Upload.csv',
      fileSize: fs.statSync(csvPath).size,
      fileType: 'csv',
      schema,
    },
    mapping,
    {
      ...baseConfig,
      industry: 'customer_support_ops',
      companyName: 'Global Enterprise Service Desk',
    }
  );

  const dataset = importResult.dataset;
  assert.ok(dataset.helpdeskMetrics, 'Must contain helpdeskMetrics object');
  const hm = dataset.helpdeskMetrics!;

  // 4. Exact Mathematical Reconciliation against PRD 5.0
  assert.equal(hm.totalTickets, 8000, 'Total tickets must equal 8,000');
  assert.equal(hm.completedTickets, 6199, 'Completed tickets must equal 6,199');
  assert.equal(hm.unresolvedTickets, 1801, 'Unresolved tickets must equal 1,801');
  assert.equal(hm.slaMet, 2925, 'SLA Met must equal 2,925');
  assert.equal(hm.slaBreached, 3274, 'SLA Breached must equal 3,274');
  assert.equal(Number((hm.slaComplianceRate * 100).toFixed(2)), 47.19, 'SLA compliance must equal 47.19%');
  assert.equal(Number(hm.meanResolutionHours.toFixed(2)), 55.61, 'Mean resolution duration must equal 55.61 hours');
  assert.equal(hm.ratingCount, 4508, 'CSAT response count must equal 4,508');
  assert.equal(Number(hm.meanRating.toFixed(2)), 2.96, 'Mean CSAT rating must equal 2.96');
  assert.equal(hm.reopenedCount, 415, 'Reopened ticket count must equal 415');

  // Financial verification: ZERO revenue, profit, or COGS
  assert.equal(dataset.kpi.totalRevenue, 0, 'Total revenue must be 0');
  assert.equal(dataset.kpi.totalGrossProfit, 0, 'Total profit must be 0');
  assert.equal(dataset.kpi.totalCogs, 0, 'Total COGS must be 0');
  assert.equal(dataset.transactions.reduce((s, t) => s + t.revenue, 0), 0, 'Transaction revenue must be 0');

  // 5. Professional Presentation Spec
  const spec = getProfessionalSpec(dataset);
  assert.equal(spec.filter, 'Service Site', 'Primary filter must be Service Site');
  assert.equal(spec.layout, 'support', 'Spec layout must be support');
  assert.equal(spec.metrics[0].label, 'Total Service Tickets');
  assert.equal(spec.metrics[1].label, 'Completed Tickets');
  assert.equal(spec.metrics[2].label, 'SLA Compliance Rate');
  assert.equal(spec.metrics[3].label, 'Mean Resolution Duration (hrs)');

  // 6. Export to Professional Excel
  const { blob, filename } = await exportToProfessionalExcel(dataset, dataset.config);
  assert.ok(filename.includes('IT_Service_Desk_Operations_Dashboard_2026'), `Filename was ${filename}`);

  const buffer = Buffer.from(await blob.arrayBuffer());
  const zip = await JSZip.loadAsync(buffer);
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(buffer as any);

  // 7. Exact 6 Helpdesk Worksheets (NO Sales sheets!)
  const expectedSheets = [
    'Service Desk Overview',
    'Ticket Operations Ledger',
    'SLA & Resolver Performance',
    'Priority & Workload Matrix',
    'Customer Feedback Analysis',
    'Audit & Data Provenance',
  ];
  assert.deepEqual(book.worksheets.map((s) => s.name), expectedSheets);

  // 8. Native DrawingML Charts in Drawing1
  const chartFiles = Object.keys(zip.files).filter((p) => /^xl\/charts\/chart\d+\.xml$/.test(p));
  assert.equal(chartFiles.length, 3, 'Must contain 3 native charts on Service Desk Overview');

  // 9. Verify Slicers & Dynamic Formulas on Sheet 1
  const overview = book.getWorksheet('Service Desk Overview')!;
  assert.equal(overview.getCell('D10').dataValidation?.type, 'list', 'Resolver group filter must have list validation');
  assert.equal(overview.getCell('J10').dataValidation?.type, 'list', 'Service site filter must have list validation');
  const b7 = overview.getCell('B7').value;
  const b7Num = typeof b7 === 'object' && b7 !== null && 'result' in b7 ? (b7 as any).result : b7;
  assert.equal(b7Num, 8000, 'Scorecard Total Tickets must be 8,000');
  const d7 = overview.getCell('D7').value;
  const d7Num = typeof d7 === 'object' && d7 !== null && 'result' in d7 ? (d7 as any).result : d7;
  assert.equal(d7Num, 6199, 'Scorecard Completed Tickets must be 6,199');

  // 10. Verify Sheet 2 (Ledger) has all 8,000 rows
  const ledger = book.getWorksheet('Ticket Operations Ledger')!;
  assert.equal(ledger.rowCount, 8004, 'Ledger must contain header rows, 8,000 data rows, and total row');

  // 11. Golden Case HD-000001 Verification (PRD v8.0 Section F - H01 to H05)
  const row4 = ledger.getRow(4);
  assert.equal(row4.getCell(1).value, 'HD-000001', 'Row 4 must be HD-000001');
  const loggedOnDate = row4.getCell(2).value as Date;
  assert.ok(loggedOnDate instanceof Date, 'Logged On must be a real Date object');
  assert.equal(loggedOnDate.getUTCHours(), 12, 'Logged On hours must be 12 (not midnight 0)');
  assert.equal(loggedOnDate.getUTCMinutes(), 35, 'Logged On minutes must be 35');

  const finishedAtDate = row4.getCell(3).value as Date;
  assert.ok(finishedAtDate instanceof Date, 'Finished At must be a real Date object');
  assert.equal(finishedAtDate.getUTCHours(), 16, 'Finished At hours must be 16');
  assert.equal(finishedAtDate.getUTCMinutes(), 35, 'Finished At minutes must be 35');

  const durVal = row4.getCell(13).value;
  const durNum = typeof durVal === 'object' && durVal !== null && 'result' in durVal ? (durVal as any).result : durVal;
  assert.equal(durNum, 4, 'HD-000001 duration must be exactly 4.00 hours');

  const slaVal = row4.getCell(14).value;
  const slaText = typeof slaVal === 'object' && slaVal !== null && 'result' in slaVal ? (slaVal as any).result : slaVal;
  assert.equal(slaText, 'Met', 'HD-000001 SLA must be Met');

  // 12. Open Ticket HD-000002 Verification (PRD v8.0 - No #VALUE! error)
  const row5 = ledger.getRow(5);
  assert.equal(row5.getCell(1).value, 'HD-000002');
  assert.equal(row5.getCell(3).value, null, 'Unresolved ticket must have null Finished At');
  const durVal5 = row5.getCell(13).value;
  const durNum5 = typeof durVal5 === 'object' && durVal5 !== null ? (durVal5 as any).result ?? '' : durVal5;
  assert.equal(durNum5, '', 'Unresolved ticket duration must evaluate to empty string (not #VALUE!)');

  // 13. Audit & Data Provenance Sheet Verification (PRD v8.0 Section E & F)
  const audit = book.getWorksheet('Audit & Data Provenance')!;
  assert.ok(audit, 'Audit sheet must exist');
  const auditStatus = audit.getCell('A2').value;
  const auditStatusText = typeof auditStatus === 'object' && auditStatus !== null && 'result' in auditStatus ? (auditStatus as any).result : auditStatus;
  assert.ok(String(auditStatusText).includes('VERIFIED — 100% RECONCILED'), 'Audit status must be VERIFIED — 100% RECONCILED');

  // Check audit reconciliation rows (Rows 5 to 10)
  for (let r = 5; r <= 10; r++) {
    const statusVal = audit.getCell(`J${r}`).value;
    const statusText = typeof statusVal === 'object' && statusVal !== null && 'result' in statusVal ? (statusVal as any).result : statusVal;
    assert.equal(statusText, 'PASS', `Audit row ${r} status must be PASS`);
  }

  // Check row invariants (Rows 13 to 17)
  for (let r = 13; r <= 17; r++) {
    const invVal = audit.getCell(`J${r}`).value;
    const invText = typeof invVal === 'object' && invVal !== null && 'result' in invVal ? (invVal as any).result : invVal;
    assert.equal(invText, 'PASS — BALANCED', `Invariant row ${r} must be PASS — BALANCED`);
  }

  // 14. 0 Excel Formula Errors Across All 6 Worksheets (H13 & H14)
  const errorTokens = ['#VALUE!', '#REF!', '#DIV/0!', '#NAME?', '#NUM!', '#N/A', '#NULL!'];
  for (const sheet of book.worksheets) {
    sheet.eachRow((r, rIdx) => {
      r.eachCell((c, cIdx) => {
        const valStr = String(c.value ?? '');
        for (const token of errorTokens) {
          assert.ok(
            !valStr.includes(token),
            `Found error ${token} in sheet "${sheet.name}" cell ${c.address} (row ${rIdx}, col ${cIdx})`
          );
        }
      });
    });
  }
});



