import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { profileDataset } from '../src/analytics/profiler/datasetProfiler';
import { detectSemanticRoles } from '../src/analytics/profiler/semanticDetector';
import { resolveDomainRulePack } from '../src/analytics/rules/rulePacks';
import { composeUniversalDashboard } from '../src/analytics/composer/dashboardComposer';
import { CanonicalExporter } from '../src/analytics/export/canonicalExporter';
import { PdfReportExporter } from '../src/analytics/export/pdfReportExporter';
import { TruePdfExporter } from '../src/analytics/export/truePdfExporter';
import { ExportIntegrityValidator } from '../src/analytics/export/exportIntegrityValidator';

async function exportHospitalBilling() {
  const filePath = 'D:/Datasets/hospital_billing_data_5000.csv';
  const text = fs.readFileSync(filePath, 'utf-8');
  const parsed = Papa.parse<Record<string, any>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
  });

  const headers = (parsed.meta.fields || []).map((h) => h.replace(/^\ufeff/, '').trim());
  const profile = profileDataset(headers, parsed.data);
  const semantics = detectSemanticRoles(profile);
  const rulePack = resolveDomainRulePack(profile, semantics);
  const model = await composeUniversalDashboard('hospital_billing_5000', parsed.data, profile, semantics, rulePack);

  const outDir = path.resolve('scratch/deliverables/hospital_billing');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const canonicalExporter = new CanonicalExporter();
  const pdfExporter = new PdfReportExporter();
  const truePdfExporter = new TruePdfExporter();
  const validator = new ExportIntegrityValidator();

  console.log('Generating hospital billing exports...');

  // 1. Excel XLSX
  const excelBuffer = await canonicalExporter.exportToExcel(model, parsed.data, {
    datasetName: 'Hospital Billing & Healthcare Encounters (5,000 Records)',
  });
  const xlsxPath = path.join(outDir, 'hospital_billing_5000_executive.xlsx');
  fs.writeFileSync(xlsxPath, excelBuffer);
  console.log(`  ✓ Excel: ${xlsxPath} (${(excelBuffer.length / 1024).toFixed(1)} KB)`);

  // 2. Standalone HTML
  const htmlContent = canonicalExporter.exportToHtml(model, parsed.data, {
    datasetName: 'Hospital Billing & Healthcare Encounters (5,000 Records)',
  });
  const htmlPath = path.join(outDir, 'hospital_billing_5000_report.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log(`  ✓ HTML:  ${htmlPath} (${(Buffer.byteLength(htmlContent) / 1024).toFixed(1)} KB)`);

  // 3. Binary PDF
  const pdfBuffer = truePdfExporter.exportToPdf(model, parsed.data, {
    datasetName: 'Hospital Billing & Healthcare Encounters (5,000 Records)',
  });
  const pdfPath = path.join(outDir, 'hospital_billing_5000_executive.pdf');
  fs.writeFileSync(pdfPath, pdfBuffer);
  console.log(`  ✓ PDF:   ${pdfPath} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);

  // 4. Print-Ready HTML Fallback
  const printHtml = pdfExporter.generatePrintReadyPdfHtml(model, parsed.data, {
    datasetName: 'Hospital Billing & Healthcare Encounters (5,000 Records)',
  });
  const printHtmlPath = path.join(outDir, 'hospital_billing_5000_print.html');
  fs.writeFileSync(printHtmlPath, printHtml, 'utf-8');
  console.log(`  ✓ Print: ${printHtmlPath}`);

  // 5. Parity & Structure Validation
  const parity = await validator.validateCrossFormatParity(
    model,
    parsed.data,
    excelBuffer,
    htmlContent,
    printHtml,
    pdfBuffer
  );

  console.log('\nParity Validation Result:', parity.paritySuccess ? 'PASS (100% Consistent)' : 'FAIL');
  console.log('XLSX Sheets Found:', parity.xlsxValidation.sheetsFound);
  console.log('XLSX Formula Errors:', parity.xlsxValidation.formulaErrorCount);
  console.log('HTML CDN URLs:', parity.htmlValidation.remoteUrlCount);
  console.log('PDF Header:', parity.pdfBinaryValidation?.headerString);
  console.log('PDF Pages:', parity.pdfBinaryValidation?.pageCount);
}

exportHospitalBilling().catch(console.error);
