import fs from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';
import { profileDataset } from '../src/analytics/profiler/datasetProfiler';
import { detectSemanticRoles } from '../src/analytics/profiler/semanticDetector';
import { resolveDomainRulePack } from '../src/analytics/rules/rulePacks';
import { composeUniversalDashboard } from '../src/analytics/composer/dashboardComposer';
import { CanonicalExporter } from '../src/analytics/export/canonicalExporter';
import { TruePdfExporter } from '../src/analytics/export/truePdfExporter';
import { ExportIntegrityValidator } from '../src/analytics/export/exportIntegrityValidator';

async function main() {
  const outputDir = path.resolve(process.cwd(), 'public/Docs/deliverables');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Load canonical ecommerce_sales_5k CSV (PRD v10.1 Acceptance Test 1)
  const csvPath = path.resolve(process.cwd(), 'public/datasets/ecommerce_sales_5k.csv');
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: 'greedy' });
  const rawHeaders = (parsed.meta.fields || []).map((h) => h.replace(/^\ufeff/, '').trim()).filter(Boolean);
  
  // Exact 5,000 rows as requested in PRD v10.1
  const allRows = (parsed.data as Record<string, any>[]).filter((r) =>
    Object.values(r).some((v) => v !== null && v !== undefined && v !== '')
  );

  console.log(`Audited exactly ${allRows.length} rows across ${rawHeaders.length} fields.`);

  // Profile & Compose Model
  const profile = profileDataset(rawHeaders, allRows);
  const semantics = detectSemanticRoles(profile);
  const rulePack = resolveDomainRulePack(profile, semantics);
  const model = await composeUniversalDashboard('sales_5k', allRows, profile, semantics, rulePack);

  console.log(`Classification: ${model.domainClassification} (${(model.domainConfidence * 100).toFixed(1)}%)`);
  console.log(`KPIs count: ${model.kpiCards.length}`);
  model.kpiCards.forEach((k) => console.log(`  - ${k.label}: ${k.formattedValue} (${k.additivity || 'n/a'})`));

  const canonicalExporter = new CanonicalExporter();
  const pdfExporter = new TruePdfExporter();
  const validator = new ExportIntegrityValidator();

  // 1. UNFILTERED EXPORTS
  console.log('\n--- Generating Unfiltered Outputs ---');
  const unfilteredXlsxBuf = await canonicalExporter.exportToExcel(model, allRows, {
    datasetName: 'Sales_Performance_5k',
  });
  const unfilteredXlsxPath = path.join(outputDir, 'sales_5k_unfiltered.xlsx');
  fs.writeFileSync(unfilteredXlsxPath, Buffer.from(unfilteredXlsxBuf));
  console.log(`✓ Wrote ${unfilteredXlsxPath} (${fs.statSync(unfilteredXlsxPath).size} bytes)`);

  const unfilteredHtml = canonicalExporter.exportToHtml(model, allRows, {
    datasetName: 'Sales_Performance_5k',
  });
  const unfilteredHtmlPath = path.join(outputDir, 'sales_5k_unfiltered.html');
  fs.writeFileSync(unfilteredHtmlPath, unfilteredHtml, 'utf8');
  console.log(`✓ Wrote ${unfilteredHtmlPath} (${fs.statSync(unfilteredHtmlPath).size} bytes)`);

  const unfilteredPdfBuf = pdfExporter.exportToPdf(model, allRows, {
    datasetName: 'Sales_Performance_5k',
  });
  const unfilteredPdfPath = path.join(outputDir, 'sales_5k_unfiltered.pdf');
  fs.writeFileSync(unfilteredPdfPath, Buffer.from(unfilteredPdfBuf));
  console.log(`✓ Wrote ${unfilteredPdfPath} (${fs.statSync(unfilteredPdfPath).size} bytes)`);

  // Verify PDF header
  const pdfHead = Buffer.from(unfilteredPdfBuf).subarray(0, 8).toString('utf8');
  console.log(`  PDF Signature: ${pdfHead} (is %PDF: ${pdfHead.startsWith('%PDF')})`);

  // 2. SOUTH-FILTERED EXPORTS
  console.log('\n--- Generating South-Filtered Outputs ---');
  const southFilter = { field: 'Region', value: 'South' };
  const southRows = allRows.filter((r) => String(r['Region'] || '').trim().toLowerCase() === 'south');
  console.log(`South rows: ${southRows.length} of ${allRows.length}`);

  const southXlsxBuf = await canonicalExporter.exportToExcel(model, allRows, {
    datasetName: 'Sales_Performance_5k',
    activeFilter: southFilter,
  });
  const southXlsxPath = path.join(outputDir, 'sales_5k_south_filtered.xlsx');
  fs.writeFileSync(southXlsxPath, Buffer.from(southXlsxBuf));
  console.log(`✓ Wrote ${southXlsxPath} (${fs.statSync(southXlsxPath).size} bytes)`);

  const southHtml = canonicalExporter.exportToHtml(model, allRows, {
    datasetName: 'Sales_Performance_5k',
    activeFilter: southFilter,
  });
  const southHtmlPath = path.join(outputDir, 'sales_5k_south_filtered.html');
  fs.writeFileSync(southHtmlPath, southHtml, 'utf8');
  console.log(`✓ Wrote ${southHtmlPath} (${fs.statSync(southHtmlPath).size} bytes)`);

  const southPdfBuf = pdfExporter.exportToPdf(model, allRows, {
    datasetName: 'Sales_Performance_5k',
    activeFilter: southFilter,
  });
  const southPdfPath = path.join(outputDir, 'sales_5k_south_filtered.pdf');
  fs.writeFileSync(southPdfPath, Buffer.from(southPdfBuf));
  console.log(`✓ Wrote ${southPdfPath} (${fs.statSync(southPdfPath).size} bytes)`);

  // Validate Parity
  console.log('\n--- Validating Cross-Format Parity ---');
  const pdfReportExporter = new (await import('../src/analytics/export/pdfReportExporter')).PdfReportExporter();
  const pdfHtml = pdfReportExporter.generatePrintReadyPdfHtml(model, allRows, {
    datasetName: 'Sales_Performance_5k',
  });

  const parityReport = await validator.validateCrossFormatParity(
    model,
    allRows,
    Buffer.from(unfilteredXlsxBuf),
    unfilteredHtml,
    pdfHtml,
    Buffer.from(unfilteredPdfBuf)
  );
  console.log(`Unfiltered Parity: ${parityReport.paritySuccess ? 'PASS' : 'FAIL'}`);
  console.log(`  XLSX Validation Passed: ${parityReport.xlsxValidation.passed} (0 Formula Errors: ${parityReport.xlsxValidation.formulaErrorCount === 0})`);
  console.log(`  HTML Validation Passed: ${parityReport.htmlValidation.passed} (0 External URLs: ${parityReport.htmlValidation.remoteUrlCount === 0})`);
  console.log(`  PDF HTML Structure Passed: ${parityReport.pdfValidation.passed} (Has Page Breaks: ${parityReport.pdfValidation.hasPageBreakClasses})`);
  if (parityReport.pdfBinaryValidation) {
    console.log(`  PDF Binary Passed: ${parityReport.pdfBinaryValidation.passed} (${parityReport.pdfBinaryValidation.headerString}, ${parityReport.pdfBinaryValidation.pageCount} pages)`);
  }
  console.log(`  XLSX Sheets: ${parityReport.xlsxValidation.sheetsFound.join(', ')}`);
  console.log(`  XLSX Formula Errors: ${parityReport.xlsxValidation.formulaErrorCount}`);
  console.log(`  HTML Remote URLs: ${parityReport.htmlValidation.remoteUrlCount} (Offline safe: ${parityReport.htmlValidation.passed})`);
  if (parityReport.pdfBinaryValidation) {
    console.log(`  PDF Header: ${parityReport.pdfBinaryValidation.headerString} (Valid: ${parityReport.pdfBinaryValidation.hasValidPdfHeader})`);
    console.log(`  PDF Pages: ${parityReport.pdfBinaryValidation.pageCount}`);
  }

  console.log('\nDeliverables Generation Complete!');
}

main().catch((err) => {
  console.error('Failed to generate PRD deliverables:', err);
  process.exit(1);
});
