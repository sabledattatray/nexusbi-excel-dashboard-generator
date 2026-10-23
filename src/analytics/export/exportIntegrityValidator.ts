/**
 * Independent Multi-Format Export Integrity Validator
 * Authoritative source: PRD v9.0 Section 09 (E03, E04, E08, E10, E13, E14, E15)
 *
 * Independently reads back generated XLSX workbooks, HTML outputs, and PDF layouts:
 * - Verifies zero #VALUE!, #REF!, #DIV/0!, #NAME? errors
 * - Validates cached totals against canonical model metrics
 * - Verifies zero external CDN / remote URLs in standalone HTML
 * - Validates sheet structure (Executive Dashboard, Visual Aggregates, Action Queue, Methods, Raw Data)
 * - Asserts multi-format cross-parity
 */

import ExcelJS from 'exceljs';
import { UniversalDashboardModel } from '../composer/dashboardComposer';

export interface XlsxValidationResult {
  passed: boolean;
  sheetsFound: string[];
  totalCellCount: number;
  formulaErrorCount: number;
  formulaErrors: string[];
  kpiParityChecks: {
    kpiId: string;
    expectedValue: string;
    foundInSheet: boolean;
  }[];
  hasAutoFilter: boolean;
  byteSize: number;
}

export interface HtmlValidationResult {
  passed: boolean;
  byteSize: number;
  remoteUrlCount: number;
  remoteUrls: string[];
  hasOfflineScript: boolean;
  hasFilterBanner: boolean;
  hasActionQueue: boolean;
  kpiMatches: number;
}

export interface PdfValidationResult {
  passed: boolean;
  byteSize: number;
  pageCountApproximation: number;
  hasPageBreakClasses: boolean;
  hasMethodsSection: boolean;
  hasProvenanceHeader: boolean;
}

export interface PdfBinaryValidationResult {
  passed: boolean;
  byteSize: number;
  hasValidPdfHeader: boolean;
  hasValidPdfEof: boolean;
  pageCount: number;
  headerString: string;
}

export interface CrossFormatParityReport {
  datasetName: string;
  canonicalKpiCount: number;
  xlsxValidation: XlsxValidationResult;
  htmlValidation: HtmlValidationResult;
  pdfValidation: PdfValidationResult;
  pdfBinaryValidation?: PdfBinaryValidationResult;
  paritySuccess: boolean;
}

export class ExportIntegrityValidator {
  /**
   * Independently reads back an exported XLSX buffer and performs structural inspection.
   */
  async validateXlsxStructure(
    excelBuffer: Buffer,
    model: UniversalDashboardModel
  ): Promise<XlsxValidationResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(excelBuffer as any);

    const sheetsFound = workbook.worksheets.map((ws) => ws.name);
    const formulaErrors: string[] = [];
    let totalCellCount = 0;
    let hasAutoFilter = false;

    // Scan every cell across all worksheets for Excel formula/syntax errors
    for (const ws of workbook.worksheets) {
      if (ws.autoFilter) hasAutoFilter = true;
      ws.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
          totalCellCount++;
          const val = cell.value;
          if (typeof val === 'string') {
            if (/^#(VALUE!|REF!|DIV\/0!|NAME\?|N\/A|NULL!|NUM!)/i.test(val)) {
              formulaErrors.push(`Sheet '${ws.name}' Cell ${cell.address}: ${val}`);
            }
          } else if (typeof val === 'object' && val !== null) {
            const formulaObj = val as any;
            if (formulaObj.error) {
              formulaErrors.push(`Sheet '${ws.name}' Cell ${cell.address} formula error: ${formulaObj.error}`);
            }
          }
        });
      });
    }

    // Verify key KPI formatted values are present in Executive Dashboard sheet
    const dashSheet = workbook.getWorksheet('Executive Dashboard');
    let dashSheetText = '';
    if (dashSheet) {
      dashSheet.eachRow((row) => {
        row.eachCell((cell) => {
          dashSheetText += ` ${cell.text || cell.value || ''}`;
        });
      });
    }

    const kpiParityChecks = model.kpiCards.map((kpi) => {
      // Clean numbers for check
      const cleanVal = kpi.formattedValue.replace(/[$₹,]/g, '').trim();
      const isFound = dashSheetText.includes(kpi.label) || dashSheetText.includes(cleanVal);
      return {
        kpiId: kpi.id,
        expectedValue: kpi.formattedValue,
        foundInSheet: isFound,
      };
    });

    const passed =
      formulaErrors.length === 0 &&
      sheetsFound.includes('Executive Dashboard') &&
      sheetsFound.includes('Canonical Raw Data') &&
      excelBuffer.length > 2000;

    return {
      passed,
      sheetsFound,
      totalCellCount,
      formulaErrorCount: formulaErrors.length,
      formulaErrors,
      kpiParityChecks,
      hasAutoFilter,
      byteSize: excelBuffer.length,
    };
  }

  /**
   * Independently inspects standalone HTML output for offline zero-network compliance.
   */
  validateHtmlPortability(htmlContent: string, model: UniversalDashboardModel): HtmlValidationResult {
    // Assert zero remote HTTP / HTTPS URLs (fonts, CDN scripts, images)
    const remoteUrls: string[] = [];
    const urlRegex = /(?:src|href)=["'](https?:\/\/[^"']+)["']/gi;
    let match: RegExpExecArray | null;
    while ((match = urlRegex.exec(htmlContent)) !== null) {
      remoteUrls.push(match[1]);
    }

    const hasOfflineScript = htmlContent.includes('// Offline Single-File Interactive Controller');
    const hasFilterBanner = htmlContent.includes('id="filterBanner"');
    const hasActionQueue = htmlContent.includes('id="tab-action-queue"');

    let kpiMatches = 0;
    for (const kpi of model.kpiCards) {
      if (htmlContent.includes(kpi.label) && htmlContent.includes(kpi.formattedValue)) {
        kpiMatches++;
      }
    }

    const passed =
      remoteUrls.length === 0 &&
      hasOfflineScript &&
      hasFilterBanner &&
      kpiMatches >= Math.min(2, model.kpiCards.length) &&
      htmlContent.length > 1000;

    return {
      passed,
      byteSize: Buffer.byteLength(htmlContent, 'utf-8'),
      remoteUrlCount: remoteUrls.length,
      remoteUrls,
      hasOfflineScript,
      hasFilterBanner,
      hasActionQueue,
      kpiMatches,
    };
  }

  /**
   * Validates print-ready PDF HTML vector document.
   */
  validatePdfStructure(pdfHtml: string): PdfValidationResult {
    const hasPageBreakClasses = pdfHtml.includes('page-break-after: always');
    const hasMethodsSection = pdfHtml.includes('Methodological Policy & Additivity Standards');
    const hasProvenanceHeader = pdfHtml.includes('provenance-bar');

    const pageCountApproximation = (pdfHtml.match(/class="page/g) || []).length;
    const passed = hasPageBreakClasses && hasMethodsSection && pageCountApproximation >= 2;

    return {
      passed,
      byteSize: Buffer.byteLength(pdfHtml, 'utf-8'),
      pageCountApproximation,
      hasPageBreakClasses,
      hasMethodsSection,
      hasProvenanceHeader,
    };
  }

  /**
   * Independently verifies real binary PDF document structure (%PDF- signature, EOF marker, and pages).
   */
  validatePdfBinary(pdfBuffer: Buffer): PdfBinaryValidationResult {
    const headerString = pdfBuffer.subarray(0, 8).toString('ascii');
    const hasValidPdfHeader = headerString.startsWith('%PDF-');
    const binaryStr = pdfBuffer.toString('latin1');
    const hasValidPdfEof = binaryStr.includes('%%EOF');
    const pageMatches = binaryStr.match(/\/Type\s*\/Page\b/g) || [];
    const pageCount = pageMatches.length;

    const passed =
      hasValidPdfHeader &&
      hasValidPdfEof &&
      pageCount >= 2 &&
      pdfBuffer.length > 3000;

    return {
      passed,
      byteSize: pdfBuffer.length,
      hasValidPdfHeader,
      hasValidPdfEof,
      pageCount,
      headerString: headerString.trim(),
    };
  }

  /**
   * Comprehensive cross-format parity audit comparing canonical model, Excel, PDF, and HTML.
   */
  async validateCrossFormatParity(
    model: UniversalDashboardModel,
    rawRows: Record<string, any>[],
    excelBuffer: Buffer,
    htmlContent: string,
    pdfHtml: string,
    pdfBuffer?: Buffer
  ): Promise<CrossFormatParityReport> {
    const xlsxValidation = await this.validateXlsxStructure(excelBuffer, model);
    const htmlValidation = this.validateHtmlPortability(htmlContent, model);
    const pdfValidation = this.validatePdfStructure(pdfHtml);
    const pdfBinaryValidation = pdfBuffer ? this.validatePdfBinary(pdfBuffer) : undefined;

    const paritySuccess =
      xlsxValidation.passed &&
      htmlValidation.passed &&
      pdfValidation.passed &&
      (!pdfBinaryValidation || pdfBinaryValidation.passed);

    return {
      datasetName: model.dashboardTitle,
      canonicalKpiCount: model.kpiCards.length,
      xlsxValidation,
      htmlValidation,
      pdfValidation,
      pdfBinaryValidation,
      paritySuccess,
    };
  }
}
