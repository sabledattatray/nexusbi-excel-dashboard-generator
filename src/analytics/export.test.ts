import { test, describe } from 'node:test';
import assert from 'node:assert';
import { CanonicalExporter } from './export/canonicalExporter';
import { PdfReportExporter } from './export/pdfReportExporter';
import { TruePdfExporter } from './export/truePdfExporter';
import { ExportIntegrityValidator } from './export/exportIntegrityValidator';
import { buildExportRenderModel } from './export/exportModelAdapter';
import { composeUniversalDashboard } from './composer/dashboardComposer';
import { profileDataset } from './profiler/datasetProfiler';
import { detectSemanticRoles } from './profiler/semanticDetector';
import { resolveDomainRulePack } from './rules/rulePacks';

describe('Phase 9E: Export Integrity & Cross-Format Parity Suite', () => {
  const exporter = new CanonicalExporter();
  const pdfExporter = new PdfReportExporter();
  const truePdfExporter = new TruePdfExporter();
  const validator = new ExportIntegrityValidator();

  // Synthetic fixture for fast, deterministic unit testing
  const sampleHeaders = ['Order_ID', 'Region', 'Product_Category', 'Unit_Price', 'Quantity', 'Revenue', 'Order_Date'];
  const sampleRows: Record<string, any>[] = [];
  for (let i = 1; i <= 200; i++) {
    sampleRows.push({
      Order_ID: `ORD-${1000 + i}`,
      Region: i % 2 === 0 ? 'North' : 'South',
      Product_Category: i % 3 === 0 ? 'Enterprise Cloud' : 'Hardware Services',
      Unit_Price: 150 + (i % 50),
      Quantity: (i % 10) + 1,
      Revenue: (150 + (i % 50)) * ((i % 10) + 1),
      Order_Date: `2024-0${(i % 9) + 1}-15`,
    });
  }

  async function getModel() {
    const profile = profileDataset(sampleHeaders, sampleRows);
    const semantics = detectSemanticRoles(profile);
    const rulePack = resolveDomainRulePack(profile, semantics);
    return composeUniversalDashboard('test_sample', sampleRows, profile, semantics, rulePack);
  }

  test('E01 & E02: buildExportRenderModel creates frozen model with deterministic hashes', async () => {
    const model = await getModel();
    const exportModel1 = buildExportRenderModel(model, sampleRows);
    const exportModel2 = buildExportRenderModel(model, sampleRows);

    assert.strictEqual(exportModel1.provenance.sourceDataHash, exportModel2.provenance.sourceDataHash);
    assert.strictEqual(exportModel1.provenance.reportHash, exportModel2.provenance.reportHash);
    assert.strictEqual(exportModel1.provenance.filterFingerprint, 'ALL_RECORDS(UNFILTERED)');
    assert.strictEqual(exportModel1.provenance.auditStatus, 'VERIFIED_DETERMINISTIC_PARITY');
    assert.strictEqual(exportModel1.provenance.recordCount, 200);
    assert(exportModel1.provenance.metricDictionary.length > 0);
  });

  test('E03 & E04: exportToExcel creates 5-sheet workbook with zero formula errors', async () => {
    const model = await getModel();
    const excelBuffer = await exporter.exportToExcel(model, sampleRows);

    assert(excelBuffer instanceof Buffer);
    assert(excelBuffer.length > 2000, 'Excel buffer size must be realistic');

    const validation = await validator.validateXlsxStructure(excelBuffer, model);
    assert.strictEqual(validation.passed, true, `XLSX validation failed: ${validation.formulaErrors.join(', ')}`);
    assert.strictEqual(validation.formulaErrorCount, 0);
    assert.deepStrictEqual(validation.sheetsFound, [
      'Executive Dashboard',
      'Visual Aggregates',
      'Operational Action Queue',
      'Methods & Assumptions',
      'Canonical Raw Data',
    ]);
    assert.strictEqual(validation.hasAutoFilter, true, 'Sheet 5 must have autoFilter enabled');
  });

  test('E07 & E08: exportToHtml produces standalone offline HTML with 0 external CDN links', async () => {
    const model = await getModel();
    const html = exporter.exportToHtml(model, sampleRows);

    assert(typeof html === 'string');
    assert(html.length > 1000);

    const validation = validator.validateHtmlPortability(html, model);
    assert.strictEqual(validation.passed, true);
    assert.strictEqual(validation.remoteUrlCount, 0, `Found remote URLs: ${validation.remoteUrls.join(', ')}`);
    assert.strictEqual(validation.hasOfflineScript, true);
    assert.strictEqual(validation.hasFilterBanner, true);
    assert.strictEqual(validation.hasActionQueue, true);
  });

  test('E06 & E14: generatePrintReadyPdfHtml produces vector print layout with page break budgeting', async () => {
    const model = await getModel();
    const pdfHtml = pdfExporter.generatePrintReadyPdfHtml(model, sampleRows);

    assert(typeof pdfHtml === 'string');
    assert(pdfHtml.includes('@page {'));
    assert(pdfHtml.includes('size: A4 portrait;'));

    const validation = validator.validatePdfStructure(pdfHtml);
    assert.strictEqual(validation.passed, true);
    assert.strictEqual(validation.hasPageBreakClasses, true);
    assert.strictEqual(validation.hasMethodsSection, true);
    assert.strictEqual(validation.hasProvenanceHeader, true);
    assert(validation.pageCountApproximation >= 2);
  });

  test('E19: TruePdfExporter generates genuine binary PDF (%PDF-) with vector graphics', async () => {
    const model = await getModel();
    const pdfBuffer = truePdfExporter.exportToPdf(model, sampleRows);

    assert(pdfBuffer instanceof Buffer);
    assert(pdfBuffer.length > 3000, 'PDF buffer must have realistic size');

    const validation = validator.validatePdfBinary(pdfBuffer);
    assert.strictEqual(validation.passed, true);
    assert.strictEqual(validation.hasValidPdfHeader, true, 'Must start with %PDF-');
    assert.strictEqual(validation.hasValidPdfEof, true, 'Must terminate with %%EOF');
    assert(validation.pageCount >= 2, `Expected at least 2 pages, found ${validation.pageCount}`);
  });

  test('E10 & E13: Cross-format parity verification passes across XLSX, HTML, and binary PDF', async () => {
    const model = await getModel();
    const excelBuffer = await exporter.exportToExcel(model, sampleRows);
    const html = exporter.exportToHtml(model, sampleRows);
    const pdfHtml = pdfExporter.generatePrintReadyPdfHtml(model, sampleRows);
    const pdfBuffer = truePdfExporter.exportToPdf(model, sampleRows);

    const report = await validator.validateCrossFormatParity(model, sampleRows, excelBuffer, html, pdfHtml, pdfBuffer);
    assert.strictEqual(report.paritySuccess, true);
    assert.strictEqual(report.xlsxValidation.passed, true);
    assert.strictEqual(report.htmlValidation.passed, true);
    assert.strictEqual(report.pdfValidation.passed, true);
    assert(report.pdfBinaryValidation !== undefined && report.pdfBinaryValidation.passed);
  });

  test('E09: Non-additive metrics enforce non-summation tier in export dictionary', async () => {
    const model = await getModel();
    const exportModel = buildExportRenderModel(model, sampleRows);

    for (const entry of exportModel.provenance.metricDictionary) {
      if (entry.formula.startsWith('AVERAGE') || /rate|pct|ratio|unit_price/i.test(entry.label)) {
        assert.strictEqual(entry.additivity, 'non_additive');
      }
    }
  });

  test('E15: Filtered export updates filter fingerprint and row count', async () => {
    const model = await getModel();
    const exportModel = buildExportRenderModel(model, sampleRows, {
      activeFilter: { field: 'Region', value: 'North' },
    });

    assert(exportModel.provenance.filterFingerprint.includes('Region=North'));
    assert.strictEqual(exportModel.filteredRows.length, 100);
  });
});
