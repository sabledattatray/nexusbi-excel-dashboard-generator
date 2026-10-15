import assert from 'node:assert/strict';
import { test } from 'node:test';
import JSZip from 'jszip';
import ExcelJS from 'exceljs';
import { buildDatasetFromUpload, inferColumnMapping, parseUploadedFile, RawParsedTable } from './dataImporter';
import { inspectDatasetSchema, profileColumn } from './schemaDetector';
import { analyzeDataset, initialSelection, dateValue } from './adaptiveAnalysis';
import { exportAdaptiveExcel } from './adaptiveExcelExporter';
import { DatasetConfig } from '../types/dataset';
const config: DatasetConfig = { companyName: 'Test', reportTitle: 'Test', industry: 'general_business', recordCount: 0, currency: 'USD', currencySymbol: '$', includeChartsInExcel: true, useLiveExcelFormulas: true };
function dataset(rows: Record<string, any>[]) {
  const headers = Object.keys(rows[0]);
  const table: RawParsedTable = { headers, rows, totalRows: rows.length, fileName: 'test.csv', fileSize: 100, fileType: 'csv', schema: inspectDatasetSchema(headers, rows) };
  return buildDatasetFromUpload(table, inferColumnMapping(table), config).dataset;
}
test('numeric IDs and salary values are not mistaken for dates', () => {
  assert.equal(profileColumn('Employee ID', [42001, 42002, 42003]).dataType, 'identifier');
  assert.equal(profileColumn('Salary', [45000, 46000, 47000]).dataType, 'currency');
});
test('HR dashboard uses average salary and contains no invented trends or sales metrics', () => {
  const data = dataset([{ Department: 'Engineering', Salary: 45000 }, { Department: 'Engineering', Salary: 55000 }, { Department: 'HR', Salary: 60000 }]);
  const analysis = analyzeDataset(data);
  assert.equal(analysis.aggregation, 'average'); assert.equal(analysis.total, 160000 / 3);
  assert.equal(analysis.charts.some(c => c.kind === 'line' || c.kind === 'composition'), false);
  assert.equal(analysis.charts[0].points.find(p => p.label === 'Engineering')?.value, 50000);
  assert.equal(data.transactions.length, 3);
});
test('sales totals, signed values, invalid rows, dates and filters are exact', () => {
  const data = dataset([{ Date: '2025-01-01', Category: 'A', Revenue: 100 }, { Date: '2025-02-01', Category: 'B', Revenue: 200 }, { Date: '2025-02-02', Category: 'A', Revenue: -20 }, { Date: 'bad', Category: 'A', Revenue: null }]);
  const analysis = analyzeDataset(data);
  assert.equal(analysis.total, 280); assert.equal(analysis.missingMetric, 1); assert.equal(analysis.invalidDates, 1);
  assert.deepEqual(analysis.charts.find(c => c.kind === 'line')?.points.map(p => p.value), [100, 180]);
  assert.equal(analyzeDataset(data, initialSelection(data), { field: 'Category', value: 'A' }).total, 80);
  assert.equal(dateValue('2025-02-30'), null);
});
test('percentage rates use averages and consistent units', () => {
  const data = dataset([{ Campaign: 'A', 'Conversion Rate': '10%' }, { Campaign: 'B', 'Conversion Rate': '20%' }]);
  assert.equal(data.schemaProfile?.columns[1].dataType, 'percentage');
  assert.ok(Math.abs(analyzeDataset(data).total! - 0.15) < 0.000001);
});
test('categorical-only data creates record counts, not artificial money', () => {
  const analysis = analyzeDataset(dataset([{ Status: 'Open' }, { Status: 'Closed' }, { Status: 'Open' }]));
  assert.equal(analysis.metricLabel, 'Record count'); assert.equal(analysis.total, 3);
  assert.equal(analysis.charts[0].points.find(p => p.label === 'Open')?.value, 2);
});
test('CSV headers are trimmed without losing source values or leading-zero IDs', async () => {
  const table = await parseUploadedFile(new File(['Employee ID, Department , Salary\n001,Engineering,45000\n002,HR,55000'], 'hr.csv'));
  assert.equal(table.rows[0].Department, 'Engineering'); assert.equal(table.rows[0]['Employee ID'], '001');
});
test('workbook preserves raw rows and embeds charts with correct source ranges and cached totals', async () => {
  const data = dataset([{ Date: '2025-01-01', Category: 'A&B', Revenue: 100 }, { Date: '2025-02-01', Category: 'B', Revenue: 200 }]);
  const { blob } = await exportAdaptiveExcel(data, config);
  const buffer = await blob.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const chart = await zip.file('xl/charts/chart1.xml')!.async('string');
  assert.match(chart, /lineChart/); assert.match(chart, /'Analysis'!\$B\$3:\$B\$4/); assert.match(chart, /<c:v>200<\/c:v>/);
  const workbook = new ExcelJS.Workbook(); await workbook.xlsx.load(buffer);
  assert.equal(workbook.getWorksheet('Source Data')!.getCell('B2').value, 'A&B');
  assert.equal(workbook.getWorksheet('Dashboard')!.getCell('B8').value, 300);
  assert.equal(workbook.worksheets.length, 4);
});
