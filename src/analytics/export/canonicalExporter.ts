/**
 * Canonical Multi-Format Analytics Exporter
 * Authoritative source: PRD v9.0 Section 09 (E01 - E18)
 *
 * Generates professional, multi-tab Excel workbooks (.xlsx) with:
 * - Sheet 1: Executive Dashboard (KPIs, decision brief, data quality)
 * - Sheet 2: Visual Aggregates (chart data series with headers)
 * - Sheet 3: Operational Action Queue (source row traceability)
 * - Sheet 4: Methods & Assumptions (printable audit trail)
 * - Sheet 5: Canonical Raw Data (cleanly formatted, typed records)
 *
 * Implements full cell formatting, formula caches, and zero-AI deterministic parity.
 */

import ExcelJS from 'exceljs';
import { UniversalDashboardModel } from '../composer/dashboardComposer';
import { buildExportRenderModel, ExportRenderModel } from './exportModelAdapter';
import { escapeHtml, sanitizeSpreadsheetCell } from '../security/securityHardener';
import { HtmlDashboardExporter } from './htmlDashboardExporter';

export class CanonicalExporter {
  /**
   * Generates a multi-tab executive Excel workbook matching the canonical analytical model.
   */
  async exportToExcel(
    model: UniversalDashboardModel,
    rawRows: Record<string, any>[],
    options?: { activeFilter?: { field: string; value: string }; datasetName?: string }
  ): Promise<Buffer> {
    const exportModel: ExportRenderModel = buildExportRenderModel(model, rawRows, options);
    const { provenance, methodsAndAssumptions } = exportModel;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'NexusBI Canonical Analytics Engine';
    workbook.lastModifiedBy = 'NexusBI v9.0 Export Pipeline';
    workbook.created = new Date(provenance.generatedAt);
    workbook.modified = new Date();

    // ==================================================================
    // SHEET 1: Executive Dashboard
    // ==================================================================
    const dashSheet = workbook.addWorksheet('Executive Dashboard', {
      views: [{ showGridLines: true }],
    });

    dashSheet.columns = [
      { width: 4 },  // A (margin)
      { width: 30 }, // B
      { width: 22 }, // C
      { width: 22 }, // D
      { width: 30 }, // E
      { width: 26 }, // F
    ];

    // Top Header Banner
    dashSheet.mergeCells('B2:F2');
    const titleCell = dashSheet.getCell('B2');
    titleCell.value = model.dashboardTitle.toUpperCase();
    titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    dashSheet.getRow(2).height = 36;

    // Sub-banner with Provenance & Fingerprint
    dashSheet.mergeCells('B3:F3');
    const subCell = dashSheet.getCell('B3');
    subCell.value = `Domain: ${model.domainClassification} (${(model.domainConfidence * 100).toFixed(1)}%)  |  Profiling Conf: ${(model.profilingConfidence * 100).toFixed(1)}%  |  Records: ${rawRows.length.toLocaleString()}  |  Engine: ${provenance.activeEngine}  |  Source Hash: ${provenance.sourceDataHash}`;
    subCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF64748B' } };
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    subCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    dashSheet.getRow(3).height = 20;

    // Filter status row if filtered
    dashSheet.mergeCells('B4:F4');
    const filterCell = dashSheet.getCell('B4');
    filterCell.value = `Filter Fingerprint: ${provenance.filterFingerprint}  |  Generated At: ${provenance.generatedAt}  |  Audit Status: ${provenance.auditStatus}`;
    filterCell.font = { name: 'Calibri', size: 8.5, color: { argb: 'FF475569' } };
    filterCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    filterCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    dashSheet.getRow(4).height = 18;

    // Blank row
    dashSheet.getRow(5).height = 10;

    // KPI Section Header
    dashSheet.mergeCells('B6:F6');
    const kpiHead = dashSheet.getCell('B6');
    kpiHead.value = 'KEY PERFORMANCE INDICATORS (DETERMINISTIC & ZERO-AI AUDITED)';
    kpiHead.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1E293B' } };
    dashSheet.getRow(6).height = 22;

    // Lay out KPI Cards
    let kpiRow = 7;
    for (let i = 0; i < model.kpiCards.length; i += 3) {
      const chunk = model.kpiCards.slice(i, i + 3);
      for (let j = 0; j < chunk.length; j++) {
        const kpi = chunk[j];
        const cellPos = j === 0 ? 'B' : j === 1 ? 'D' : 'F';
        const cardCell = dashSheet.getCell(`${cellPos}${kpiRow}`);
        cardCell.value = `${kpi.label}\n${kpi.formattedValue}\n${kpi.calculationFormula}`;
        cardCell.font = { name: 'Calibri', size: 10, bold: false };
        cardCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cardCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        cardCell.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        };
      }
      dashSheet.getRow(kpiRow).height = 54;
      kpiRow += 2;
    }

    // Management Decision Brief Section
    dashSheet.mergeCells(`B${kpiRow}:F${kpiRow}`);
    const briefHead = dashSheet.getCell(`B${kpiRow}`);
    briefHead.value = 'EXECUTIVE MANAGEMENT DECISION BRIEF';
    briefHead.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1E293B' } };
    dashSheet.getRow(kpiRow).height = 22;
    kpiRow += 1;

    for (const bullet of model.decisionBrief.executiveBullets) {
      dashSheet.mergeCells(`B${kpiRow}:F${kpiRow}`);
      const bCell = dashSheet.getCell(`B${kpiRow}`);
      bCell.value = `• ${bullet.title}: ${bullet.text}`;
      bCell.font = { name: 'Calibri', size: 9.5, color: { argb: 'FF334155' } };
      bCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      dashSheet.getRow(kpiRow).height = 28;
      kpiRow += 1;
    }

    // Data Quality Section
    kpiRow += 1;
    dashSheet.mergeCells(`B${kpiRow}:F${kpiRow}`);
    const dqHead = dashSheet.getCell(`B${kpiRow}`);
    dqHead.value = 'DATASET INTEGRITY & STATISTICAL COVERAGE';
    dqHead.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1E293B' } };
    dashSheet.getRow(kpiRow).height = 22;

    kpiRow += 1;
    dashSheet.mergeCells(`B${kpiRow}:F${kpiRow}`);
    const dqText = dashSheet.getCell(`B${kpiRow}`);
    dqText.value = `Total Records: ${model.dataQuality.totalRecords.toLocaleString()}  |  Fully Populated Rows: ${model.dataQuality.completeRecords.toLocaleString()} (${(model.dataQuality.completenessRate * 100).toFixed(1)}%)  |  Duplicates: ${model.dataQuality.duplicateCount}  |  Missingness Exclusions Audited`;
    dqText.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF065F46' } };
    dqText.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
    dqText.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    dashSheet.getRow(kpiRow).height = 24;

    // ==================================================================
    // SHEET 2: Visual Aggregates (Chart Data Series)
    // ==================================================================
    const visualSheet = workbook.addWorksheet('Visual Aggregates');
    visualSheet.columns = [
      { width: 4 },
      { width: 34 },
      { width: 22 },
      { width: 16 },
      { width: 6 },
      { width: 34 },
      { width: 22 },
      { width: 16 },
    ];

    let vRow = 2;
    for (let cIdx = 0; cIdx < model.charts.length; cIdx += 2) {
      const c1 = model.charts[cIdx];
      const c2 = model.charts[cIdx + 1];

      // Chart 1 table
      visualSheet.mergeCells(`B${vRow}:D${vRow}`);
      const h1 = visualSheet.getCell(`B${vRow}`);
      h1.value = c1.title.toUpperCase();
      h1.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      h1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      visualSheet.getRow(vRow).height = 24;

      visualSheet.getCell(`B${vRow + 1}`).value = c1.dimensionLabel;
      visualSheet.getCell(`C${vRow + 1}`).value = c1.metricLabel;
      visualSheet.getCell(`D${vRow + 1}`).value = 'Share (%)';
      for (const col of ['B', 'C', 'D']) {
        const hdr = visualSheet.getCell(`${col}${vRow + 1}`);
        hdr.font = { bold: true, color: { argb: 'FF0F172A' } };
        hdr.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      }

      const totalVal1 = c1.data.reduce((a, b) => a + (Number.isFinite(b.value) ? b.value : 0), 0);
      let rOffset1 = 0;
      for (const pt of c1.data) {
        visualSheet.getCell(`B${vRow + 2 + rOffset1}`).value = pt.label;
        const valCell = visualSheet.getCell(`C${vRow + 2 + rOffset1}`);
        valCell.value = pt.value;
        valCell.numFmt = Number.isInteger(pt.value) ? '#,##0' : '#,##0.00';

        const shareCell = visualSheet.getCell(`D${vRow + 2 + rOffset1}`);
        shareCell.value = totalVal1 > 0 ? pt.value / totalVal1 : 0;
        shareCell.numFmt = '0.00%';
        rOffset1++;
      }

      // Chart 2 table if present
      let rOffset2 = 0;
      if (c2) {
        visualSheet.mergeCells(`F${vRow}:H${vRow}`);
        const h2 = visualSheet.getCell(`F${vRow}`);
        h2.value = c2.title.toUpperCase();
        h2.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        h2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };

        visualSheet.getCell(`F${vRow + 1}`).value = c2.dimensionLabel;
        visualSheet.getCell(`G${vRow + 1}`).value = c2.metricLabel;
        visualSheet.getCell(`H${vRow + 1}`).value = 'Share (%)';
        for (const col of ['F', 'G', 'H']) {
          const hdr = visualSheet.getCell(`${col}${vRow + 1}`);
          hdr.font = { bold: true, color: { argb: 'FF0F172A' } };
          hdr.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
        }

        const totalVal2 = c2.data.reduce((a, b) => a + (Number.isFinite(b.value) ? b.value : 0), 0);
        for (const pt of c2.data) {
          visualSheet.getCell(`F${vRow + 2 + rOffset2}`).value = pt.label;
          const valCell = visualSheet.getCell(`G${vRow + 2 + rOffset2}`);
          valCell.value = pt.value;
          valCell.numFmt = Number.isInteger(pt.value) ? '#,##0' : '#,##0.00';

          const shareCell = visualSheet.getCell(`H${vRow + 2 + rOffset2}`);
          shareCell.value = totalVal2 > 0 ? pt.value / totalVal2 : 0;
          shareCell.numFmt = '0.00%';
          rOffset2++;
        }
      }

      vRow += Math.max(rOffset1, rOffset2) + 4;
    }

    // ==================================================================
    // SHEET 3: Operational Action Queue (Source-Row Traceability)
    // ==================================================================
    const queueSheet = workbook.addWorksheet('Operational Action Queue', {
      views: [{ showGridLines: true, state: 'frozen', ySplit: 2 }],
    });

    queueSheet.columns = [
      { header: 'Rank', key: 'rank', width: 8 },
      { header: 'Entity ID', key: 'entityId', width: 18 },
      { header: 'Source Row Index', key: 'sourceRow', width: 18 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Status / State', key: 'status', width: 18 },
      { header: 'Assignee / Owner', key: 'owner', width: 22 },
      { header: 'Location / Site', key: 'site', width: 20 },
      { header: 'Urgency Score', key: 'score', width: 14 },
      { header: 'Trigger Reason', key: 'reason', width: 55 },
    ];

    const qHeader = queueSheet.getRow(1);
    qHeader.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    qHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    qHeader.height = 24;

    if (model.actionQueue.length > 0) {
      for (const item of model.actionQueue) {
        const row = queueSheet.addRow({
          rank: item.rank,
          entityId: item.entityId,
          sourceRow: item.sourceRowIndex + 1,
          priority: item.priority,
          status: item.status,
          owner: item.ownerOrAssignee || '—',
          site: item.siteOrLocation || '—',
          score: item.urgencyScore,
          reason: item.reason,
        });

        // Highlight Critical rows
        if (item.priority === 'Critical') {
          row.getCell('priority').font = { bold: true, color: { argb: 'FFBE123C' } };
        } else if (item.priority === 'High') {
          row.getCell('priority').font = { bold: true, color: { argb: 'FFB45309' } };
        }
      }
    } else {
      const emptyRow = queueSheet.addRow({
        rank: '—',
        entityId: '—',
        sourceRow: '—',
        priority: 'Normal',
        status: 'Compliant',
        owner: '—',
        site: '—',
        score: 0,
        reason: 'No operational exceptions detected — all audited source records conform to standard operating thresholds.',
      });
      emptyRow.font = { italic: true, color: { argb: 'FF64748B' } };
    }

    // ==================================================================
    // SHEET 4: Methods & Assumptions (Audit Trail)
    // ==================================================================
    const auditSheet = workbook.addWorksheet('Methods & Assumptions');
    auditSheet.columns = [
      { width: 4 },
      { width: 32 },
      { width: 65 },
    ];

    auditSheet.mergeCells('B2:C2');
    const aTitle = auditSheet.getCell('B2');
    aTitle.value = 'METHODOLOGY, DATA HANDLING & AGGREGATION AUDIT TRAIL';
    aTitle.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    aTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    auditSheet.getRow(2).height = 28;

    let aRow = 4;
    auditSheet.getCell(`B${aRow}`).value = 'Methodological Policy';
    auditSheet.getCell(`C${aRow}`).value = 'Implementation Rule & Verification Standard';
    auditSheet.getCell(`B${aRow}`).font = { bold: true };
    auditSheet.getCell(`C${aRow}`).font = { bold: true };
    auditSheet.getCell(`B${aRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    auditSheet.getCell(`C${aRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    aRow++;

    for (let i = 0; i < methodsAndAssumptions.length; i++) {
      auditSheet.getCell(`B${aRow}`).value = `Policy #${i + 1}`;
      auditSheet.getCell(`C${aRow}`).value = methodsAndAssumptions[i];
      auditSheet.getCell(`B${aRow}`).font = { bold: true, color: { argb: 'FF0284C7' } };
      auditSheet.getRow(aRow).height = 24;
      aRow++;
    }

    aRow += 2;
    auditSheet.mergeCells(`B${aRow}:C${aRow}`);
    const dictTitle = auditSheet.getCell(`B${aRow}`);
    dictTitle.value = 'METRIC DICTIONARY & ADDITIVITY ELIGIBILITY';
    dictTitle.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    dictTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
    auditSheet.getRow(aRow).height = 24;
    aRow++;

    auditSheet.getCell(`B${aRow}`).value = 'Metric Label';
    auditSheet.getCell(`C${aRow}`).value = 'Formula / Additivity / Missingness Exclusions';
    auditSheet.getCell(`B${aRow}`).font = { bold: true };
    auditSheet.getCell(`C${aRow}`).font = { bold: true };
    aRow++;

    for (const m of provenance.metricDictionary) {
      auditSheet.getCell(`B${aRow}`).value = m.label;
      auditSheet.getCell(`C${aRow}`).value = `${m.formula} | Tier: ${m.additivity.toUpperCase()} | Exclusions: ${m.missingExclusions} rows | Result: ${m.formattedValue}`;
      auditSheet.getRow(aRow).height = 20;
      aRow++;
    }

    // ==================================================================
    // SHEET 5: Canonical Raw Data
    // ==================================================================
    const dataSheet = workbook.addWorksheet('Canonical Raw Data', {
      views: [{ showGridLines: true, state: 'frozen', ySplit: 1 }],
    });

    if (rawRows.length > 0) {
      const headers = Object.keys(rawRows[0]);
      dataSheet.columns = headers.map((h) => ({
        header: h,
        key: h,
        width: Math.max(14, h.length + 4),
      }));

      // Header row styling
      const headerRow = dataSheet.getRow(1);
      headerRow.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
      headerRow.height = 24;

      // Add autoFilter range across headers
      dataSheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: rawRows.length + 1, column: headers.length },
      };

      // Add records with typed numeric and string parsing with Formula Injection protection
      for (const r of rawRows) {
        const sanitizedRow: Record<string, any> = {};
        for (const h of headers) {
          sanitizedRow[h] = sanitizeSpreadsheetCell(r[h]);
        }
        dataSheet.addRow(sanitizedRow);
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return (typeof Buffer !== 'undefined' ? Buffer.from(buffer) : new Uint8Array(buffer)) as unknown as Buffer;
  }

  /**
   * Generates a fully self-contained offline HTML dashboard report.
   * Authoritative source: PRD v9.0 Section 09 (E07, E08, E15)
   */
  exportToHtml(
    model: UniversalDashboardModel,
    rawRows: Record<string, any>[] = [],
    options?: { activeFilter?: { field: string; value: string }; datasetName?: string }
  ): string {
    return new HtmlDashboardExporter().exportToHtml(model, rawRows, options);
  }
}
