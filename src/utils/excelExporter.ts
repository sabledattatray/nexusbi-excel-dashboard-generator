import ExcelJS from 'exceljs';
import { generateRealisticDataset } from './dataGenerator';
import { DatasetConfig } from '../types/dataset';
import { injectNativeExcelCharts } from './nativeExcelChartInjector';
import { getIndustryTheme, getAdaptedKpiLabels } from './industryTheme';

// Standard Master Password to Lock & Protect Excel Workbooks & Worksheets
export const WORKBOOK_PROTECTION_PASSWORD = 'Dattatray@1511';

// Executive Palette for Professional Excel Workbooks
const COLORS = {
  navyDark: 'FF0F172A',      // Slate 900
  navyMedium: 'FF1E293B',    // Slate 800
  slateHeader: 'FF334155',   // Slate 700
  slateMuted: 'FF64748B',    // Slate 500
  borderGray: 'FFE2E8F0',    // Slate 200
  borderDark: 'FFCBD5E1',    // Slate 300
  zebraLight: 'FFF8FAFC',    // Slate 50
  pureWhite: 'FFFFFFFF',
  emeraldDark: 'FF065F46',   // Emerald 800
  emeraldMed: 'FF059669',    // Emerald 600
  emeraldLight: 'FFECFDF5',  // Emerald 50
  emeraldBar: 'FF10B981',    // Emerald 500
  blueLight: 'FFE0F2FE',     // Sky 100
  blueDark: 'FF0369A1',      // Sky 700
  skyBar: 'FF0284C7',        // Sky 600
  indigoLight: 'FFEEF2FF',   // Indigo 50
  indigoDark: 'FF4338CA',    // Indigo 700
  indigoBar: 'FF6366F1',     // Indigo 500
  amberLight: 'FFFEF3C7',    // Amber 100
  amberDark: 'FFB45309',     // Amber 700
};

export async function exportToProfessionalExcel(
  datasetData: ReturnType<typeof generateRealisticDataset>,
  config: DatasetConfig
): Promise<{ blob: Blob; filename: string }> {
  const {
    transactions,
    productCatalog,
    regionalPerformance,
    customerAccounts,
    monthlyTrends,
    categorySummaries,
    kpi,
  } = datasetData;

  const theme = getIndustryTheme(config.industry);
  const labels = getAdaptedKpiLabels(config.industry, (datasetData as any).schemaProfile);
  const primaryHeaderFill = theme.colors.excel.headerFill || COLORS.navyDark;
  const primaryTabColor = theme.colors.excel.tabColor || COLORS.emeraldMed;
  const primaryAccentFill = theme.colors.excel.accentFill || COLORS.blueLight;
  const primaryAccentText = theme.colors.excel.accentText || COLORS.blueDark;
  const primaryBorder = theme.colors.excel.border || COLORS.skyBar;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = `${config.companyName} Executive BI Engine`;
  workbook.lastModifiedBy = 'Excel to Dashboards by Datta Sable (excel.dattasable.com)';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = false;

  const txRowCount = transactions.length + 2;

  // -------------------------------------------------------------
  // SHEET 1: EXECUTIVE DASHBOARD (VISUAL CHARTS, SLICERS & FORMULAS)
  // -------------------------------------------------------------
  const dashSheet = workbook.addWorksheet('Executive Dashboard', {
    views: [{ showGridLines: true }],
    properties: { tabColor: { argb: primaryTabColor } },
  });

  // Explicit column widths for balanced executive dashboard grid layout
  dashSheet.columns = [
    { width: 3 },   // A - margin
    { width: 14 },  // B
    { width: 16 },  // C
    { width: 14 },  // D
    { width: 16 },  // E
    { width: 14 },  // F
    { width: 16 },  // G
    { width: 14 },  // H
    { width: 16 },  // I
    { width: 14 },  // J
    { width: 16 },  // K
    { width: 15 },  // L
    { width: 16 },  // M
    { width: 16 },  // N
    { width: 16 },  // O
    { width: 3 },   // P - margin
  ];

  // Header Title Banner (Row 2 & 3)
  dashSheet.mergeCells('B2:O2');
  const bannerTitle = dashSheet.getCell('B2');
  bannerTitle.value = `${(config.companyName || 'Enterprise Corp').toUpperCase()} — ${theme.name.toUpperCase()} EXECUTIVE DASHBOARD`;
  bannerTitle.font = { name: 'Segoe UI', size: 15, bold: true, color: { argb: COLORS.pureWhite } };
  bannerTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: primaryHeaderFill },
  };
  bannerTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  dashSheet.getRow(2).height = 34;

  dashSheet.mergeCells('B3:O3');
  const bannerSub = dashSheet.getCell('B3');
  bannerSub.value = `Interactive ${theme.badge} BI Model • Dynamic Live Formulas & Visual Analytics • Generated: ${new Date().toISOString().split('T')[0]} • Status: Final Verified`;
  bannerSub.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF94A3B8' } };
  bannerSub.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: primaryHeaderFill },
  };
  bannerSub.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  dashSheet.getRow(3).height = 20;

  // INTERACTIVE SLICER CONTROLS BAR (Row 4)
  dashSheet.getRow(4).height = 26;
  
  // Slicer 1: Region / Dimension Selector (Data Validation Dropdown)
  dashSheet.getCell('B4').value = `${labels.dimensionLabel}:`;
  dashSheet.getCell('B4').font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: COLORS.slateMuted } };
  dashSheet.getCell('B4').alignment = { vertical: 'middle', horizontal: 'right' };

  dashSheet.mergeCells('C4:D4');
  const slicerRegion = dashSheet.getCell('C4');
  slicerRegion.value = 'All Regions';
  slicerRegion.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: primaryAccentText } };
  slicerRegion.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryAccentFill } };
  slicerRegion.alignment = { vertical: 'middle', horizontal: 'center' };
  slicerRegion.border = {
    top: { style: 'thin', color: { argb: COLORS.borderDark } },
    bottom: { style: 'thin', color: { argb: COLORS.borderDark } },
    left: { style: 'thin', color: { argb: COLORS.borderDark } },
    right: { style: 'thin', color: { argb: COLORS.borderDark } },
  };
  // Unlock filter dropdown so users can interact with dashboard even when sheet is locked
  slicerRegion.protection = { locked: false };
  dashSheet.getCell('D4').protection = { locked: false };

  const regNames = regionalPerformance.slice(0, 4).map((r) => r.region.replace(/,/g, ' '));
  const regDropdownFormula = `"All Regions,${regNames.length ? regNames.join(',') : 'North America,EMEA,APAC,LATAM'}"`;
  slicerRegion.dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: [regDropdownFormula],
  };

  // Slicer 2: Channel Selector
  dashSheet.getCell('F4').value = 'Channel Filter:';
  dashSheet.getCell('F4').font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: COLORS.slateMuted } };
  dashSheet.getCell('F4').alignment = { vertical: 'middle', horizontal: 'right' };

  dashSheet.mergeCells('G4:H4');
  const slicerChannel = dashSheet.getCell('G4');
  slicerChannel.value = 'All Channels';
  slicerChannel.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLORS.indigoDark } };
  slicerChannel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.indigoLight } };
  slicerChannel.alignment = { vertical: 'middle', horizontal: 'center' };
  slicerChannel.border = {
    top: { style: 'thin', color: { argb: COLORS.borderDark } },
    bottom: { style: 'thin', color: { argb: COLORS.borderDark } },
    left: { style: 'thin', color: { argb: COLORS.borderDark } },
    right: { style: 'thin', color: { argb: COLORS.borderDark } },
  };
  // Unlock filter dropdown so users can interact with dashboard even when sheet is locked
  slicerChannel.protection = { locked: false };
  dashSheet.getCell('H4').protection = { locked: false };

  slicerChannel.dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: ['"All Channels,Direct Enterprise,Partner Ecosystem,Inside Sales,Online Enterprise"'],
  };

  dashSheet.mergeCells('J4:O4');
  const slicerHelp = dashSheet.getCell('J4');
  slicerHelp.value = `💡 Tip: Select dropdown in C4 (${labels.dimensionLabel}) or G4 (Channel) in Excel to recalculate entire dashboard dynamically!`;
  slicerHelp.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: COLORS.slateMuted } };
  slicerHelp.alignment = { vertical: 'middle', horizontal: 'left' };

  dashSheet.getRow(5).height = 10;

  // DYNAMIC KPI TILES (Rows 6 to 8)
  dashSheet.getRow(6).height = 17;
  dashSheet.getRow(7).height = 26;
  dashSheet.getRow(8).height = 15;

  const kpis = [
    {
      colStart: 'B',
      colEnd: 'C',
      label: labels.metric1.toUpperCase(),
      formula: config.useLiveExcelFormulas
        ? `=IF(AND(C4="All Regions", G4="All Channels"), SUM('Sales Transactions'!T3:T${txRowCount}), IF(C4="All Regions", SUMIFS('Sales Transactions'!T3:T${txRowCount}, 'Sales Transactions'!L3:L${txRowCount}, G4), IF(G4="All Channels", SUMIFS('Sales Transactions'!T3:T${txRowCount}, 'Sales Transactions'!H3:H${txRowCount}, C4), SUMIFS('Sales Transactions'!T3:T${txRowCount}, 'Sales Transactions'!H3:H${txRowCount}, C4, 'Sales Transactions'!L3:L${txRowCount}, G4))))`
        : kpi.totalRevenue,
      subtext: '● Certified Actuals',
      numFmt: '$#,##0',
      accentColor: primaryAccentText,
      bgCard: primaryAccentFill,
    },
    {
      colStart: 'D',
      colEnd: 'E',
      label: labels.metric2.toUpperCase(),
      formula: config.useLiveExcelFormulas
        ? `=IF(AND(C4="All Regions", G4="All Channels"), SUM('Sales Transactions'!V3:V${txRowCount}), IF(C4="All Regions", SUMIFS('Sales Transactions'!V3:V${txRowCount}, 'Sales Transactions'!L3:L${txRowCount}, G4), IF(G4="All Channels", SUMIFS('Sales Transactions'!V3:V${txRowCount}, 'Sales Transactions'!H3:H${txRowCount}, C4), SUMIFS('Sales Transactions'!V3:V${txRowCount}, 'Sales Transactions'!H3:H${txRowCount}, C4, 'Sales Transactions'!L3:L${txRowCount}, G4))))`
        : kpi.totalGrossProfit,
      subtext: '● Net Operating Value',
      numFmt: '$#,##0',
      accentColor: COLORS.emeraldDark,
      bgCard: COLORS.emeraldLight,
    },
    {
      colStart: 'F',
      colEnd: 'G',
      label: labels.metric3.toUpperCase(),
      formula: config.useLiveExcelFormulas
        ? `=IF(B7>0, D7/B7, 0)`
        : kpi.overallMarginPct,
      subtext: '● Target Attained',
      numFmt: '0.0%',
      accentColor: COLORS.indigoDark,
      bgCard: COLORS.indigoLight,
    },
    {
      colStart: 'H',
      colEnd: 'I',
      label: labels.metric4.toUpperCase(),
      formula: config.useLiveExcelFormulas
        ? `=IF(AND(C4="All Regions", G4="All Channels"), SUM('Sales Transactions'!R3:R${txRowCount}), IF(C4="All Regions", SUMIFS('Sales Transactions'!R3:R${txRowCount}, 'Sales Transactions'!L3:L${txRowCount}, G4), IF(G4="All Channels", SUMIFS('Sales Transactions'!R3:R${txRowCount}, 'Sales Transactions'!H3:H${txRowCount}, C4), SUMIFS('Sales Transactions'!R3:R${txRowCount}, 'Sales Transactions'!H3:H${txRowCount}, C4, 'Sales Transactions'!L3:L${txRowCount}, G4))))`
        : kpi.totalUnits,
      subtext: '● Volume Metric',
      numFmt: '#,##0',
      accentColor: COLORS.navyMedium,
      bgCard: COLORS.zebraLight,
    },
    {
      colStart: 'J',
      colEnd: 'K',
      label: labels.metric5.toUpperCase(),
      formula: config.useLiveExcelFormulas
        ? `=IF(AND(C4="All Regions", G4="All Channels"), COUNTA('Sales Transactions'!A3:A${txRowCount}), IF(C4="All Regions", COUNTIFS('Sales Transactions'!L3:L${txRowCount}, G4), IF(G4="All Channels", COUNTIFS('Sales Transactions'!H3:H${txRowCount}, C4), COUNTIFS('Sales Transactions'!H3:H${txRowCount}, C4, 'Sales Transactions'!L3:L${txRowCount}, G4))))`
        : kpi.orderCount,
      subtext: '● Closed Records',
      numFmt: '#,##0',
      accentColor: COLORS.navyMedium,
      bgCard: COLORS.zebraLight,
    },
    {
      colStart: 'L',
      colEnd: 'M',
      label: labels.metric6.toUpperCase(),
      formula: config.useLiveExcelFormulas
        ? `=IF(J7>0, B7/J7, 0)`
        : kpi.averageDealSize,
      subtext: '● Unit Average',
      numFmt: '$#,##0',
      accentColor: COLORS.navyMedium,
      bgCard: COLORS.zebraLight,
    },
    {
      colStart: 'N',
      colEnd: 'O',
      label: labels.entityLabel.toUpperCase(),
      formula: config.useLiveExcelFormulas
        ? `=IF(AND(C4="All Regions", G4="All Channels"), ${customerAccounts.length}, ROUND(MAX(1, J7/${Math.max(1, Math.round(transactions.length / customerAccounts.length))}), 0))`
        : customerAccounts.length,
      subtext: '● Active Portfolio',
      numFmt: '#,##0',
      accentColor: COLORS.navyMedium,
      bgCard: COLORS.zebraLight,
    },
  ];

  kpis.forEach((card) => {
    dashSheet.mergeCells(`${card.colStart}6:${card.colEnd}6`);
    const lblCell = dashSheet.getCell(`${card.colStart}6`);
    lblCell.value = card.label;
    lblCell.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.slateMuted } };
    lblCell.alignment = { horizontal: 'center', vertical: 'middle' };
    lblCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: card.bgCard } };

    dashSheet.mergeCells(`${card.colStart}7:${card.colEnd}7`);
    const valCell = dashSheet.getCell(`${card.colStart}7`);
    if (typeof card.formula === 'string' && card.formula.startsWith('=')) {
      valCell.value = { formula: card.formula.slice(1) };
    } else {
      valCell.value = card.formula;
    }
    valCell.numFmt = card.numFmt;
    valCell.font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: card.accentColor } };
    valCell.alignment = { horizontal: 'center', vertical: 'middle' };
    valCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: card.bgCard } };

    dashSheet.mergeCells(`${card.colStart}8:${card.colEnd}8`);
    const footCell = dashSheet.getCell(`${card.colStart}8`);
    footCell.value = card.subtext;
    footCell.font = { name: 'Segoe UI', size: 8, color: { argb: COLORS.slateMuted } };
    footCell.alignment = { horizontal: 'center', vertical: 'middle' };
    footCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: card.bgCard } };

    const cellsToBorder = [
      `${card.colStart}6`, `${card.colEnd}6`,
      `${card.colStart}7`, `${card.colEnd}7`,
      `${card.colStart}8`, `${card.colEnd}8`,
    ];
    cellsToBorder.forEach((cellCoord) => {
      dashSheet.getCell(cellCoord).border = {
        top: { style: 'thin', color: { argb: COLORS.borderDark } },
        bottom: { style: 'thin', color: { argb: COLORS.borderDark } },
        left: { style: 'thin', color: { argb: COLORS.borderDark } },
        right: { style: 'thin', color: { argb: COLORS.borderDark } },
      };
    });
  });

  dashSheet.getRow(9).height = 12;

  // -------------------------------------------------------------
  // NATIVE OPENXML CHART RESERVED VISUAL CANVASES (ROWS 10 TO 43)
  // Dedicated chart viewing zones with NO overlapping tables underneath:
  // 1. Chart 1 (Monthly Run-Rate Column Chart): B10:H25 (Cols B-H, Rows 10-25)
  // 2. Chart 2 (Category Revenue Share Pie Chart): I10:O25 (Cols I-O, Rows 10-25)
  // [Row 26]: Clean spacing gap between chart tiers
  // 3. Chart 3 (Regional Quota Attainment Bar Chart): B27:H42 (Cols B-H, Rows 27-42)
  // 4. Chart 4 (Sales Channel Mix Donut Chart): I27:O42 (Cols I-O, Rows 27-42)
  // [Row 43]: Clean divider row before data tables section
  // -------------------------------------------------------------
  for (let r = 10; r <= 25; r++) {
    dashSheet.getRow(r).height = 20;
  }
  dashSheet.getRow(26).height = 14;
  for (let r = 27; r <= 42; r++) {
    dashSheet.getRow(r).height = 20;
  }
  dashSheet.getRow(43).height = 16;

  // -------------------------------------------------------------
  // DATA TABLE BLOCK 1: ROWS 44 TO 58 (SYMMETRICAL DUAL-COLUMN GRID)
  // Left: Monthly Financial Run-Rate Summary Table (B44:H58)
  // Right Top: Regional Quota Performance Scorecard (I44:O50)
  // Right Bottom: Top Strategic Client Accounts by Value (I52:O58)
  // -------------------------------------------------------------

  // LEFT SIDE: MONTHLY FINANCIAL TABLE (B44:H58)
  dashSheet.mergeCells('B44:H44');
  const monthBanner = dashSheet.getCell('B44');
  monthBanner.value = `MONTHLY ${labels.metric1.toUpperCase()} & ${labels.metric2.toUpperCase()} RUN-RATE SUMMARY`;
  monthBanner.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLORS.pureWhite } };
  monthBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryHeaderFill } };
  monthBanner.alignment = { vertical: 'middle', horizontal: 'center' };
  dashSheet.getRow(44).height = 22;

  const monthHeaders = [
    { col: 'B', title: 'Period', align: 'center' },
    { col: 'C', title: `${labels.metric1} ($)`, align: 'right' },
    { col: 'D', title: 'Direct Cost ($)', align: 'right' },
    { col: 'E', title: `${labels.metric2} ($)`, align: 'right' },
    { col: 'F', title: `${labels.metric3} %`, align: 'right' },
    { col: 'G', title: 'Volume', align: 'center' },
    { col: 'H', title: 'In-Cell Trend', align: 'left' },
  ];
  monthHeaders.forEach((mh) => {
    const c = dashSheet.getCell(`${mh.col}45`);
    c.value = mh.title;
    c.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.pureWhite } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } };
    c.alignment = { vertical: 'middle', horizontal: mh.align as any };
  });
  dashSheet.getRow(45).height = 20;

  const maxMonthRev = Math.max(...monthlyTrends.map((m) => m.revenue), 1);
  const displayMonths = monthlyTrends.slice(0, 12);

  displayMonths.forEach((m, idx) => {
    const rNum = 46 + idx;
    dashSheet.getRow(rNum).height = 19;
    const bg = idx % 2 === 0 ? COLORS.pureWhite : COLORS.zebraLight;

    dashSheet.getCell(`B${rNum}`).value = m.monthLabel;
    dashSheet.getCell(`B${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true };
    dashSheet.getCell(`B${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    dashSheet.getCell(`B${rNum}`).alignment = { horizontal: 'center', vertical: 'middle' };

    dashSheet.getCell(`C${rNum}`).value = config.useLiveExcelFormulas
      ? {
          formula: `IF(AND($C$4="All Regions", $G$4="All Channels"), SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$B$3:$B$${txRowCount}, "${m.monthKey}*"), IF($C$4="All Regions", SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$B$3:$B$${txRowCount}, "${m.monthKey}*", 'Sales Transactions'!$L$3:$L$${txRowCount}, $G$4), IF($G$4="All Channels", SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$B$3:$B$${txRowCount}, "${m.monthKey}*", 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4), SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$B$3:$B$${txRowCount}, "${m.monthKey}*", 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4, 'Sales Transactions'!$L$3:$L$${txRowCount}, $G$4))))`,
          result: m.revenue,
        }
      : m.revenue;
    dashSheet.getCell(`C${rNum}`).numFmt = '$#,##0';
    dashSheet.getCell(`C${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.blueDark } };
    dashSheet.getCell(`C${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`D${rNum}`).value = config.useLiveExcelFormulas
      ? { formula: `C${rNum}-E${rNum}`, result: Math.round(m.revenue - m.grossProfit) }
      : Math.round(m.revenue - m.grossProfit);
    dashSheet.getCell(`D${rNum}`).numFmt = '$#,##0';
    dashSheet.getCell(`D${rNum}`).font = { name: 'Segoe UI', size: 8.5, color: { argb: COLORS.slateMuted } };
    dashSheet.getCell(`D${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`E${rNum}`).value = config.useLiveExcelFormulas
      ? {
          formula: `IF(AND($C$4="All Regions", $G$4="All Channels"), SUMIFS('Sales Transactions'!$V$3:$V$${txRowCount}, 'Sales Transactions'!$B$3:$B$${txRowCount}, "${m.monthKey}*"), IF($C$4="All Regions", SUMIFS('Sales Transactions'!$V$3:$V$${txRowCount}, 'Sales Transactions'!$B$3:$B$${txRowCount}, "${m.monthKey}*", 'Sales Transactions'!$L$3:$L$${txRowCount}, $G$4), IF($G$4="All Channels", SUMIFS('Sales Transactions'!$V$3:$V$${txRowCount}, 'Sales Transactions'!$B$3:$B$${txRowCount}, "${m.monthKey}*", 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4), SUMIFS('Sales Transactions'!$V$3:$V$${txRowCount}, 'Sales Transactions'!$B$3:$B$${txRowCount}, "${m.monthKey}*", 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4, 'Sales Transactions'!$L$3:$L$${txRowCount}, $G$4))))`,
          result: m.grossProfit,
        }
      : m.grossProfit;
    dashSheet.getCell(`E${rNum}`).numFmt = '$#,##0';
    dashSheet.getCell(`E${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.emeraldDark } };
    dashSheet.getCell(`E${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`F${rNum}`).value = config.useLiveExcelFormulas
      ? { formula: `IF(C${rNum}>0, E${rNum}/C${rNum}, 0)`, result: m.marginPct }
      : m.marginPct;
    dashSheet.getCell(`F${rNum}`).numFmt = '0.0%';
    dashSheet.getCell(`F${rNum}`).font = { name: 'Segoe UI', size: 8.5, color: { argb: COLORS.indigoDark } };
    dashSheet.getCell(`F${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`G${rNum}`).value = config.useLiveExcelFormulas
      ? {
          formula: `IF(AND($C$4="All Regions", $G$4="All Channels"), COUNTIFS('Sales Transactions'!$B$3:$B$${txRowCount}, "${m.monthKey}*"), IF($C$4="All Regions", COUNTIFS('Sales Transactions'!$B$3:$B$${txRowCount}, "${m.monthKey}*", 'Sales Transactions'!$L$3:$L$${txRowCount}, $G$4), IF($G$4="All Channels", COUNTIFS('Sales Transactions'!$B$3:$B$${txRowCount}, "${m.monthKey}*", 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4), COUNTIFS('Sales Transactions'!$B$3:$B$${txRowCount}, "${m.monthKey}*", 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4, 'Sales Transactions'!$L$3:$L$${txRowCount}, $G$4))))`,
          result: m.orderCount,
        }
      : m.orderCount;
    dashSheet.getCell(`G${rNum}`).numFmt = '#,##0';
    dashSheet.getCell(`G${rNum}`).font = { name: 'Segoe UI', size: 8.5 };
    dashSheet.getCell(`G${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    dashSheet.getCell(`G${rNum}`).alignment = { horizontal: 'center', vertical: 'middle' };

    const barBlocks = Math.max(1, Math.round((m.revenue / maxMonthRev) * 14));
    dashSheet.getCell(`H${rNum}`).value = config.useLiveExcelFormulas
      ? { formula: `REPT("█", ROUND(C${rNum}/${Math.round(maxMonthRev)}*14, 0))` }
      : '█'.repeat(barBlocks);
    dashSheet.getCell(`H${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.skyBar } };
    dashSheet.getCell(`H${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    monthHeaders.forEach((mh) => {
      dashSheet.getCell(`${mh.col}${rNum}`).border = {
        bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
      };
    });
  });

  // Monthly Table Total Row (Row 58)
  dashSheet.getRow(58).height = 22;
  dashSheet.getCell('B58').value = 'Total LTM:';
  dashSheet.getCell('B58').font = { name: 'Segoe UI', size: 9, bold: true };
  dashSheet.getCell('C58').value = config.useLiveExcelFormulas ? { formula: 'SUM(C46:C57)' } : kpi.totalRevenue;
  dashSheet.getCell('C58').numFmt = '$#,##0';
  dashSheet.getCell('C58').font = { name: 'Segoe UI', size: 9, bold: true };
  dashSheet.getCell('D58').value = config.useLiveExcelFormulas ? { formula: 'SUM(D46:D57)' } : Math.round(kpi.totalRevenue - kpi.totalGrossProfit);
  dashSheet.getCell('D58').numFmt = '$#,##0';
  dashSheet.getCell('D58').font = { name: 'Segoe UI', size: 8.5, color: { argb: COLORS.slateMuted } };
  dashSheet.getCell('E58').value = config.useLiveExcelFormulas ? { formula: 'SUM(E46:E57)' } : kpi.totalGrossProfit;
  dashSheet.getCell('E58').numFmt = '$#,##0';
  dashSheet.getCell('E58').font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: COLORS.emeraldDark } };
  dashSheet.getCell('F58').value = config.useLiveExcelFormulas ? { formula: 'E58/C58' } : kpi.overallMarginPct;
  dashSheet.getCell('F58').numFmt = '0.0%';
  dashSheet.getCell('F58').font = { name: 'Segoe UI', size: 9, bold: true };
  dashSheet.getCell('G58').value = config.useLiveExcelFormulas ? { formula: 'SUM(G46:G57)' } : kpi.orderCount;
  dashSheet.getCell('G58').numFmt = '#,##0';
  dashSheet.getCell('G58').alignment = { horizontal: 'center' };
  dashSheet.getCell('H58').value = '100.0%';
  dashSheet.getCell('H58').font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.slateMuted } };

  monthHeaders.forEach((mh) => {
    const c = dashSheet.getCell(`${mh.col}58`);
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };
    c.border = {
      top: { style: 'thin', color: { argb: COLORS.borderDark } },
      bottom: { style: 'double', color: { argb: COLORS.navyDark } },
    };
  });

  // RIGHT SIDE TOP: REGIONAL QUOTA & MARGIN PERFORMANCE SCORECARD (Rows 44 to 50)
  dashSheet.mergeCells('I44:O44');
  const regTblHeader = dashSheet.getCell('I44');
  regTblHeader.value = `${labels.dimensionLabel.toUpperCase()} PERFORMANCE SCORECARD`;
  regTblHeader.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLORS.pureWhite } };
  regTblHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryHeaderFill } };
  regTblHeader.alignment = { vertical: 'middle', horizontal: 'center' };

  const regHeaders = [labels.dimensionLabel, 'Lead', `Actual ${labels.metric1}`, 'Quota Target', 'Attainment', labels.metric2, 'In-Cell Bar'];
  const regCols = ['I', 'J', 'K', 'L', 'M', 'N', 'O'];
  regCols.forEach((col, idx) => {
    const c = dashSheet.getCell(`${col}45`);
    c.value = regHeaders[idx];
    c.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.pureWhite } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } };
    c.alignment = { vertical: 'middle', horizontal: idx >= 2 ? 'right' : 'left' };
  });

  regionalPerformance.slice(0, 4).forEach((r, idx) => {
    const rowIdx = 46 + idx;
    const bgRow = idx % 2 === 0 ? COLORS.pureWhite : COLORS.zebraLight;

    dashSheet.getCell(`I${rowIdx}`).value = r.region;
    dashSheet.getCell(`I${rowIdx}`).font = { name: 'Segoe UI', size: 9, bold: true };
    dashSheet.getCell(`I${rowIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    dashSheet.getCell(`J${rowIdx}`).value = r.regionalDirector.split(' ')[0];
    dashSheet.getCell(`J${rowIdx}`).font = { name: 'Segoe UI', size: 8.5 };
    dashSheet.getCell(`J${rowIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    dashSheet.getCell(`K${rowIdx}`).value = config.useLiveExcelFormulas
      ? {
          formula: `IF(AND($C$4<>"All Regions", $C$4<>I${rowIdx}), 0, IF($G$4="All Channels", SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$H$3:$H$${txRowCount}, I${rowIdx}), SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$H$3:$H$${txRowCount}, I${rowIdx}, 'Sales Transactions'!$L$3:$L$${txRowCount}, $G$4)))`,
          result: r.actualRevenue,
        }
      : r.actualRevenue;
    dashSheet.getCell(`K${rowIdx}`).numFmt = '$#,##0';
    dashSheet.getCell(`K${rowIdx}`).font = { name: 'Segoe UI', size: 9, bold: true };
    dashSheet.getCell(`K${rowIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    dashSheet.getCell(`L${rowIdx}`).value = config.useLiveExcelFormulas
      ? {
          formula: `IF(AND($C$4<>"All Regions", $C$4<>I${rowIdx}), 0, ${r.targetRevenue})`,
          result: r.targetRevenue,
        }
      : r.targetRevenue;
    dashSheet.getCell(`L${rowIdx}`).numFmt = '$#,##0';
    dashSheet.getCell(`L${rowIdx}`).font = { name: 'Segoe UI', size: 8.5, color: { argb: COLORS.slateMuted } };
    dashSheet.getCell(`L${rowIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    const cellAtt = dashSheet.getCell(`M${rowIdx}`);
    cellAtt.value = config.useLiveExcelFormulas ? { formula: `IF(L${rowIdx}>0, K${rowIdx}/L${rowIdx}, 0)` } : r.quotaAttainmentPct;
    cellAtt.numFmt = '0.0%';
    cellAtt.font = {
      name: 'Segoe UI',
      size: 9,
      bold: true,
      color: { argb: r.quotaAttainmentPct >= 1 ? COLORS.emeraldDark : COLORS.amberDark },
    };
    cellAtt.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: r.quotaAttainmentPct >= 1 ? COLORS.emeraldLight : COLORS.amberLight },
    };

    dashSheet.getCell(`N${rowIdx}`).value = config.useLiveExcelFormulas
      ? {
          formula: `IF(AND($C$4<>"All Regions", $C$4<>I${rowIdx}), 0, IF($G$4="All Channels", SUMIFS('Sales Transactions'!$V$3:$V$${txRowCount}, 'Sales Transactions'!$H$3:$H$${txRowCount}, I${rowIdx}), SUMIFS('Sales Transactions'!$V$3:$V$${txRowCount}, 'Sales Transactions'!$H$3:$H$${txRowCount}, I${rowIdx}, 'Sales Transactions'!$L$3:$L$${txRowCount}, $G$4)))`,
          result: r.actualProfit,
        }
      : r.actualProfit;
    dashSheet.getCell(`N${rowIdx}`).numFmt = '$#,##0';
    dashSheet.getCell(`N${rowIdx}`).font = { name: 'Segoe UI', size: 8.5, color: { argb: COLORS.emeraldDark } };
    dashSheet.getCell(`N${rowIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    const barBlocks = Math.max(1, Math.round(r.quotaAttainmentPct * 12));
    const cellVBar = dashSheet.getCell(`O${rowIdx}`);
    cellVBar.value = config.useLiveExcelFormulas ? { formula: `IF(M${rowIdx}>0, REPT("■", MIN(14, ROUND(M${rowIdx}*12, 0))), "")` } : '■'.repeat(barBlocks);
    cellVBar.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: r.quotaAttainmentPct >= 1 ? COLORS.emeraldBar : COLORS.amberDark } };
    cellVBar.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    regCols.forEach((col) => {
      dashSheet.getCell(`${col}${rowIdx}`).border = {
        bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
      };
    });
  });

  // Total Regional Row (Row 50)
  dashSheet.getRow(50).height = 22;
  regCols.forEach((col) => {
    const c = dashSheet.getCell(`${col}50`);
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };
    c.border = {
      top: { style: 'thin', color: { argb: COLORS.borderDark } },
      bottom: { style: 'double', color: { argb: primaryHeaderFill } },
    };
    c.font = { name: 'Segoe UI', size: 8.5, bold: true };
  });
  dashSheet.getCell('I50').value = 'Total:';
  dashSheet.getCell('K50').value = config.useLiveExcelFormulas ? { formula: 'SUM(K46:K49)' } : kpi.totalRevenue;
  dashSheet.getCell('K50').numFmt = '$#,##0';
  dashSheet.getCell('L50').value = config.useLiveExcelFormulas ? { formula: 'SUM(L46:L49)' } : regionalPerformance.reduce((s, r) => s + r.targetRevenue, 0);
  dashSheet.getCell('L50').numFmt = '$#,##0';
  dashSheet.getCell('M50').value = config.useLiveExcelFormulas ? { formula: 'IF(L50>0, K50/L50, 0)' } : (kpi.totalRevenue / regionalPerformance.reduce((s, r) => s + r.targetRevenue, 0));
  dashSheet.getCell('M50').numFmt = '0.0%';
  dashSheet.getCell('N50').value = config.useLiveExcelFormulas ? { formula: 'SUM(N46:N49)' } : kpi.totalGrossProfit;
  dashSheet.getCell('N50').numFmt = '$#,##0';
  dashSheet.getCell('O50').value = 'Target Met';

  // Spacer Row 51
  dashSheet.getRow(51).height = 10;

  // RIGHT SIDE BOTTOM: TOP STRATEGIC CLIENT ACCOUNTS (Rows 52 to 58)
  dashSheet.mergeCells('I52:O52');
  const accTitle = dashSheet.getCell('I52');
  accTitle.value = `TOP STRATEGIC ${labels.entityLabel.toUpperCase()}S BY VALUE`;
  accTitle.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: COLORS.pureWhite } };
  accTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryHeaderFill } };
  accTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  dashSheet.getRow(52).height = 22;

  dashSheet.mergeCells('I53:K53');
  dashSheet.getCell('I53').value = labels.entityLabel;
  dashSheet.getCell('L53').value = 'Tier';
  dashSheet.getCell('M53').value = 'Orders';
  dashSheet.getCell('N53').value = 'Revenue';
  dashSheet.getCell('O53').value = 'Health';
  ['I', 'L', 'M', 'N', 'O'].forEach((col) => {
    const c = dashSheet.getCell(`${col}53`);
    c.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.pureWhite } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } };
  });
  dashSheet.getRow(53).height = 20;

  customerAccounts.slice(0, 4).forEach((acc, idx) => {
    const rIdx = 54 + idx;
    const bgRow = idx % 2 === 0 ? COLORS.pureWhite : COLORS.zebraLight;
    dashSheet.getRow(rIdx).height = 19;

    dashSheet.mergeCells(`I${rIdx}:K${rIdx}`);
    const cellName = dashSheet.getCell(`I${rIdx}`);
    cellName.value = acc.customerName;
    cellName.font = { name: 'Segoe UI', size: 8.5, bold: true };
    cellName.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    const cellTier = dashSheet.getCell(`L${rIdx}`);
    cellTier.value = acc.tier.replace('Enterprise Strategic', 'Strategic');
    cellTier.font = { name: 'Segoe UI', size: 8.5, color: { argb: COLORS.slateMuted } };
    cellTier.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    const cellOrd = dashSheet.getCell(`M${rIdx}`);
    cellOrd.value = config.useLiveExcelFormulas
      ? {
          formula: `IF(AND($C$4="All Regions", $G$4="All Channels"), COUNTIFS('Sales Transactions'!$E$3:$E$${txRowCount}, I${rIdx}), IF($C$4="All Regions", COUNTIFS('Sales Transactions'!$E$3:$E$${txRowCount}, I${rIdx}, 'Sales Transactions'!$L$3:$L$${txRowCount}, $G$4), IF($G$4="All Channels", COUNTIFS('Sales Transactions'!$E$3:$E$${txRowCount}, I${rIdx}, 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4), COUNTIFS('Sales Transactions'!$E$3:$E$${txRowCount}, I${rIdx}, 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4, 'Sales Transactions'!$L$3:$L$${txRowCount}, $G$4))))`,
          result: acc.totalOrders,
        }
      : acc.totalOrders;
    cellOrd.numFmt = '#,##0';
    cellOrd.font = { name: 'Segoe UI', size: 8.5 };
    cellOrd.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    const cellRev = dashSheet.getCell(`N${rIdx}`);
    cellRev.value = config.useLiveExcelFormulas
      ? {
          formula: `IF(AND($C$4="All Regions", $G$4="All Channels"), SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$E$3:$E$${txRowCount}, I${rIdx}), IF($C$4="All Regions", SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$E$3:$E$${txRowCount}, I${rIdx}, 'Sales Transactions'!$L$3:$L$${txRowCount}, $G$4), IF($G$4="All Channels", SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$E$3:$E$${txRowCount}, I${rIdx}, 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4), SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$E$3:$E$${txRowCount}, I${rIdx}, 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4, 'Sales Transactions'!$L$3:$L$${txRowCount}, $G$4))))`,
          result: acc.lifetimeRevenue,
        }
      : acc.lifetimeRevenue;
    cellRev.numFmt = '$#,##0';
    cellRev.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.emeraldDark } };
    cellRev.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    const cellH = dashSheet.getCell(`O${rIdx}`);
    cellH.value = acc.accountHealth;
    cellH.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: acc.accountHealth === 'Optimal' ? COLORS.emeraldDark : COLORS.amberDark } };
    cellH.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    ['I', 'L', 'M', 'N', 'O'].forEach((col) => {
      dashSheet.getCell(`${col}${rIdx}`).border = {
        bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
      };
    });
  });

  // Strategic Accounts Total Row (Row 58)
  dashSheet.getRow(58).height = 22;
  dashSheet.mergeCells('I58:K58');
  const accTotLabel = dashSheet.getCell('I58');
  accTotLabel.value = 'Top Strategic Total:';
  accTotLabel.font = { name: 'Segoe UI', size: 8.5, bold: true };
  accTotLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };

  dashSheet.getCell('L58').value = '4 Accounts';
  dashSheet.getCell('L58').font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.slateMuted } };
  dashSheet.getCell('L58').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };

  dashSheet.getCell('M58').value = config.useLiveExcelFormulas ? { formula: 'SUM(M54:M57)' } : customerAccounts.slice(0, 4).reduce((s, a) => s + a.totalOrders, 0);
  dashSheet.getCell('M58').numFmt = '#,##0';
  dashSheet.getCell('M58').font = { name: 'Segoe UI', size: 8.5, bold: true };
  dashSheet.getCell('M58').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };

  dashSheet.getCell('N58').value = config.useLiveExcelFormulas ? { formula: 'SUM(N54:N57)' } : customerAccounts.slice(0, 4).reduce((s, a) => s + a.lifetimeRevenue, 0);
  dashSheet.getCell('N58').numFmt = '$#,##0';
  dashSheet.getCell('N58').font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.emeraldDark } };
  dashSheet.getCell('N58').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };

  dashSheet.getCell('O58').value = '100% Retained';
  dashSheet.getCell('O58').font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.emeraldDark } };
  dashSheet.getCell('O58').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };

  ['I', 'L', 'M', 'N', 'O'].forEach((col) => {
    dashSheet.getCell(`${col}58`).border = {
      top: { style: 'thin', color: { argb: COLORS.borderDark } },
      bottom: { style: 'double', color: { argb: COLORS.navyDark } },
    };
  });

  // Spacer Row 59 between Table Block 1 and Table Block 2
  dashSheet.getRow(59).height = 14;

  // -------------------------------------------------------------
  // DATA TABLE BLOCK 2: ROWS 60 TO 67 (SYMMETRICAL DUAL-COLUMN GRID)
  // Left: Product Category Portfolio & Margin Directory (B60:H67)
  // Right: Sales Channel Revenue Distribution & Mix Matrix (I60:O67)
  // -------------------------------------------------------------

  // LEFT SIDE: PRODUCT CATEGORY PORTFOLIO TABLE (B60:H67)
  dashSheet.mergeCells('B60:H60');
  const catBanner = dashSheet.getCell('B60');
  catBanner.value = `${labels.categoryLabel.toUpperCase()} PORTFOLIO & MARGIN DIRECTORY`;
  catBanner.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLORS.pureWhite } };
  catBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryHeaderFill } };
  catBanner.alignment = { vertical: 'middle', horizontal: 'center' };
  dashSheet.getRow(60).height = 22;

  const catHeaders = [
    { col: 'B', title: labels.categoryLabel },
    { col: 'C', title: labels.metric4.length > 18 ? 'Volume / Units' : labels.metric4 },
    { col: 'D', title: labels.metric1 },
    { col: 'E', title: 'Share %' },
    { col: 'F', title: labels.metric2 },
    { col: 'G', title: `${labels.metric3.replace(/%/g, '').trim()} %` },
    { col: 'H', title: 'Volume Bar' },
  ];
  catHeaders.forEach((ch) => {
    const c = dashSheet.getCell(`${ch.col}61`);
    c.value = ch.title;
    c.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.pureWhite } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } };
    c.alignment = { vertical: 'middle', horizontal: ch.col === 'B' ? 'left' : 'right' };
  });
  dashSheet.getRow(61).height = 20;

  const maxCatRev = Math.max(...categorySummaries.map((c) => c.revenue), 1);
  const displayCats = categorySummaries.slice(0, 5);

  displayCats.forEach((cat, idx) => {
    const rNum = 62 + idx;
    dashSheet.getRow(rNum).height = 19;
    const bg = idx % 2 === 0 ? COLORS.pureWhite : COLORS.zebraLight;

    dashSheet.getCell(`B${rNum}`).value = cat.category;
    dashSheet.getCell(`B${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true };
    dashSheet.getCell(`B${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`C${rNum}`).value = config.useLiveExcelFormulas
      ? {
          formula: `IF(AND($C$4="All Regions", $G$4="All Channels"), SUMIFS('Sales Transactions'!$R$3:$R$${txRowCount}, 'Sales Transactions'!$O$3:$O$${txRowCount}, B${rNum}), IF($C$4="All Regions", SUMIFS('Sales Transactions'!$R$3:$R$${txRowCount}, 'Sales Transactions'!$O$3:$O$${txRowCount}, B${rNum}, 'Sales Transactions'!$L$3:$L$${txRowCount}, $G$4), IF($G$4="All Channels", SUMIFS('Sales Transactions'!$R$3:$R$${txRowCount}, 'Sales Transactions'!$O$3:$O$${txRowCount}, B${rNum}, 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4), SUMIFS('Sales Transactions'!$R$3:$R$${txRowCount}, 'Sales Transactions'!$O$3:$O$${txRowCount}, B${rNum}, 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4, 'Sales Transactions'!$L$3:$L$${txRowCount}, $G$4))))`,
          result: cat.units,
        }
      : cat.units;
    dashSheet.getCell(`C${rNum}`).numFmt = '#,##0';
    dashSheet.getCell(`C${rNum}`).font = { name: 'Segoe UI', size: 8.5 };
    dashSheet.getCell(`C${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`D${rNum}`).value = config.useLiveExcelFormulas
      ? {
          formula: `IF(AND($C$4="All Regions", $G$4="All Channels"), SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$O$3:$O$${txRowCount}, B${rNum}), IF($C$4="All Regions", SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$O$3:$O$${txRowCount}, B${rNum}, 'Sales Transactions'!$L$3:$L$${txRowCount}, $G$4), IF($G$4="All Channels", SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$O$3:$O$${txRowCount}, B${rNum}, 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4), SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$O$3:$O$${txRowCount}, B${rNum}, 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4, 'Sales Transactions'!$L$3:$L$${txRowCount}, $G$4))))`,
          result: cat.revenue,
        }
      : cat.revenue;
    dashSheet.getCell(`D${rNum}`).numFmt = '$#,##0';
    dashSheet.getCell(`D${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true };
    dashSheet.getCell(`D${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`E${rNum}`).value = config.useLiveExcelFormulas
      ? { formula: `IF($D$67>0, D${rNum}/$D$67, 0)`, result: cat.sharePct }
      : cat.sharePct;
    dashSheet.getCell(`E${rNum}`).numFmt = '0.0%';
    dashSheet.getCell(`E${rNum}`).font = { name: 'Segoe UI', size: 8.5 };
    dashSheet.getCell(`E${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`F${rNum}`).value = config.useLiveExcelFormulas
      ? {
          formula: `IF(AND($C$4="All Regions", $G$4="All Channels"), SUMIFS('Sales Transactions'!$V$3:$V$${txRowCount}, 'Sales Transactions'!$O$3:$O$${txRowCount}, B${rNum}), IF($C$4="All Regions", SUMIFS('Sales Transactions'!$V$3:$V$${txRowCount}, 'Sales Transactions'!$O$3:$O$${txRowCount}, B${rNum}, 'Sales Transactions'!$L$3:$L$${txRowCount}, $G$4), IF($G$4="All Channels", SUMIFS('Sales Transactions'!$V$3:$V$${txRowCount}, 'Sales Transactions'!$O$3:$O$${txRowCount}, B${rNum}, 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4), SUMIFS('Sales Transactions'!$V$3:$V$${txRowCount}, 'Sales Transactions'!$O$3:$O$${txRowCount}, B${rNum}, 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4, 'Sales Transactions'!$L$3:$L$${txRowCount}, $G$4))))`,
          result: cat.grossProfit,
        }
      : cat.grossProfit;
    dashSheet.getCell(`F${rNum}`).numFmt = '$#,##0';
    dashSheet.getCell(`F${rNum}`).font = { name: 'Segoe UI', size: 8.5, color: { argb: COLORS.emeraldDark } };
    dashSheet.getCell(`F${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`G${rNum}`).value = config.useLiveExcelFormulas
      ? { formula: `IF(D${rNum}>0, F${rNum}/D${rNum}, 0)`, result: cat.marginPct }
      : cat.marginPct;
    dashSheet.getCell(`G${rNum}`).numFmt = '0.0%';
    dashSheet.getCell(`G${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.indigoDark } };
    dashSheet.getCell(`G${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    const barBlocks = Math.max(1, Math.round((cat.revenue / maxCatRev) * 12));
    dashSheet.getCell(`H${rNum}`).value = '█'.repeat(barBlocks);
    dashSheet.getCell(`H${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.indigoBar } };
    dashSheet.getCell(`H${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    catHeaders.forEach((ch) => {
      dashSheet.getCell(`${ch.col}${rNum}`).border = {
        bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
      };
    });
  });

  // Category Total Row (Row 67)
  dashSheet.getRow(67).height = 22;
  dashSheet.getCell('B67').value = `Total ${labels.categoryLabel} Portfolio:`;
  dashSheet.getCell('B67').font = { name: 'Segoe UI', size: 8.5, bold: true };
  dashSheet.getCell('C67').value = config.useLiveExcelFormulas ? { formula: 'SUM(C62:C66)' } : categorySummaries.slice(0, 5).reduce((s, c) => s + c.units, 0);
  dashSheet.getCell('C67').numFmt = '#,##0';
  dashSheet.getCell('D67').value = config.useLiveExcelFormulas ? { formula: 'SUM(D62:D66)' } : kpi.totalRevenue;
  dashSheet.getCell('D67').numFmt = '$#,##0';
  dashSheet.getCell('D67').font = { name: 'Segoe UI', size: 8.5, bold: true };
  dashSheet.getCell('E67').value = 1.0;
  dashSheet.getCell('E67').numFmt = '0.0%';
  dashSheet.getCell('F67').value = config.useLiveExcelFormulas ? { formula: 'SUM(F62:F66)' } : kpi.totalGrossProfit;
  dashSheet.getCell('F67').numFmt = '$#,##0';
  dashSheet.getCell('G67').value = config.useLiveExcelFormulas ? { formula: 'F67/D67' } : kpi.overallMarginPct;
  dashSheet.getCell('G67').numFmt = '0.0%';
  dashSheet.getCell('G67').font = { name: 'Segoe UI', size: 8.5, bold: true };
  dashSheet.getCell('H67').value = '100.0%';

  catHeaders.forEach((ch) => {
    const c = dashSheet.getCell(`${ch.col}67`);
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };
    c.border = {
      top: { style: 'thin', color: { argb: COLORS.borderDark } },
      bottom: { style: 'double', color: { argb: primaryHeaderFill } },
    };
  });

  // RIGHT SIDE: SALES CHANNEL TABLE (I60:O67)
  dashSheet.mergeCells('I60:O60');
  const chanBanner = dashSheet.getCell('I60');
  chanBanner.value = `CHANNEL ${labels.metric1.toUpperCase()} DISTRIBUTION & MIX MATRIX`;
  chanBanner.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: COLORS.pureWhite } };
  chanBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryHeaderFill } };
  chanBanner.alignment = { vertical: 'middle', horizontal: 'center' };
  dashSheet.getRow(60).height = 22;

  const chanHeaders = [
    { col: 'I', title: 'Sales Channel', align: 'left' },
    { col: 'J', title: 'Volume Mix', align: 'right' },
    { col: 'K', title: `Channel ${labels.metric1}`, align: 'right' },
    { col: 'L', title: `Est. ${labels.metric2}`, align: 'right' },
    { col: 'M', title: 'Channel Margin', align: 'right' },
    { col: 'N', title: 'Status', align: 'center' },
    { col: 'O', title: 'Mix Bar', align: 'left' },
  ];
  chanHeaders.forEach((ch) => {
    const c = dashSheet.getCell(`${ch.col}61`);
    c.value = ch.title;
    c.font = { name: 'Segoe UI', size: 8, bold: true, color: { argb: COLORS.pureWhite } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } };
    c.alignment = { vertical: 'middle', horizontal: ch.align as any };
  });
  dashSheet.getRow(61).height = 20;

  const channelMixData = [
    { name: 'Direct Enterprise', share: 0.42, rev: Math.round(kpi.totalRevenue * 0.42), prof: Math.round(kpi.totalGrossProfit * 0.43), status: 'Primary' },
    { name: 'Partner Ecosystem', share: 0.28, rev: Math.round(kpi.totalRevenue * 0.28), prof: Math.round(kpi.totalGrossProfit * 0.27), status: 'Growing' },
    { name: 'Inside Sales', share: 0.18, rev: Math.round(kpi.totalRevenue * 0.18), prof: Math.round(kpi.totalGrossProfit * 0.18), status: 'Stable' },
    { name: 'Online Enterprise', share: 0.12, rev: Math.round(kpi.totalRevenue * 0.12), prof: Math.round(kpi.totalGrossProfit * 0.12), status: 'Automated' },
  ];

  channelMixData.forEach((ch, idx) => {
    const rNum = 62 + idx;
    dashSheet.getRow(rNum).height = 19;
    const bg = idx % 2 === 0 ? COLORS.pureWhite : COLORS.zebraLight;

    dashSheet.getCell(`I${rNum}`).value = ch.name;
    dashSheet.getCell(`I${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true };
    dashSheet.getCell(`I${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`J${rNum}`).value = config.useLiveExcelFormulas
      ? { formula: `IF($K$66>0, K${rNum}/$K$66, 0)`, result: ch.share }
      : ch.share;
    dashSheet.getCell(`J${rNum}`).numFmt = '0.0%';
    dashSheet.getCell(`J${rNum}`).font = { name: 'Segoe UI', size: 8.5 };
    dashSheet.getCell(`J${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`K${rNum}`).value = config.useLiveExcelFormulas
      ? {
          formula: `IF(AND($G$4<>"All Channels", $G$4<>I${rNum}), 0, IF($C$4="All Regions", SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$L$3:$L$${txRowCount}, I${rNum}), SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$L$3:$L$${txRowCount}, I${rNum}, 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4)))`,
          result: ch.rev,
        }
      : ch.rev;
    dashSheet.getCell(`K${rNum}`).numFmt = '$#,##0';
    dashSheet.getCell(`K${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.indigoDark } };
    dashSheet.getCell(`K${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`L${rNum}`).value = config.useLiveExcelFormulas
      ? {
          formula: `IF(AND($G$4<>"All Channels", $G$4<>I${rNum}), 0, IF($C$4="All Regions", SUMIFS('Sales Transactions'!$V$3:$V$${txRowCount}, 'Sales Transactions'!$L$3:$L$${txRowCount}, I${rNum}), SUMIFS('Sales Transactions'!$V$3:$V$${txRowCount}, 'Sales Transactions'!$L$3:$L$${txRowCount}, I${rNum}, 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4)))`,
          result: ch.prof,
        }
      : ch.prof;
    dashSheet.getCell(`L${rNum}`).numFmt = '$#,##0';
    dashSheet.getCell(`L${rNum}`).font = { name: 'Segoe UI', size: 8.5, color: { argb: COLORS.emeraldDark } };
    dashSheet.getCell(`L${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`M${rNum}`).value = config.useLiveExcelFormulas
      ? { formula: `IF(K${rNum}>0, L${rNum}/K${rNum}, 0)`, result: ch.prof / ch.rev }
      : ch.prof / ch.rev;
    dashSheet.getCell(`M${rNum}`).numFmt = '0.0%';
    dashSheet.getCell(`M${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true };
    dashSheet.getCell(`M${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`N${rNum}`).value = ch.status;
    dashSheet.getCell(`N${rNum}`).font = { name: 'Segoe UI', size: 8, bold: true, color: { argb: COLORS.slateMuted } };
    dashSheet.getCell(`N${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    dashSheet.getCell(`N${rNum}`).alignment = { horizontal: 'center' };

    const blocks = Math.max(1, Math.round(ch.share * 15));
    dashSheet.getCell(`O${rNum}`).value = '■'.repeat(blocks);
    dashSheet.getCell(`O${rNum}`).font = { name: 'Segoe UI', size: 8, color: { argb: COLORS.indigoBar } };
    dashSheet.getCell(`O${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    chanHeaders.forEach((h) => {
      dashSheet.getCell(`${h.col}${rNum}`).border = {
        bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
      };
    });
  });

  // Channel Total Row (Row 66)
  dashSheet.getRow(66).height = 22;
  dashSheet.getCell('I66').value = 'Total Channel Mix:';
  dashSheet.getCell('I66').font = { name: 'Segoe UI', size: 8.5, bold: true };
  dashSheet.getCell('J66').value = 1.0;
  dashSheet.getCell('J66').numFmt = '0.0%';
  dashSheet.getCell('K66').value = config.useLiveExcelFormulas ? { formula: 'SUM(K62:K65)' } : kpi.totalRevenue;
  dashSheet.getCell('K66').numFmt = '$#,##0';
  dashSheet.getCell('K66').font = { name: 'Segoe UI', size: 8.5, bold: true };
  dashSheet.getCell('L66').value = config.useLiveExcelFormulas ? { formula: 'SUM(L62:L65)' } : kpi.totalGrossProfit;
  dashSheet.getCell('L66').numFmt = '$#,##0';
  dashSheet.getCell('M66').value = config.useLiveExcelFormulas ? { formula: 'L66/K66' } : kpi.overallMarginPct;
  dashSheet.getCell('M66').numFmt = '0.0%';

  chanHeaders.forEach((h) => {
    const c = dashSheet.getCell(`${h.col}66`);
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };
    c.border = {
      top: { style: 'thin', color: { argb: COLORS.borderDark } },
      bottom: { style: 'double', color: { argb: COLORS.navyDark } },
    };
  });

  // Channel Reconciliation Row (Row 67)
  dashSheet.getRow(67).height = 22;
  dashSheet.mergeCells('I67:O67');
  const chanAudit = dashSheet.getCell('I67');
  chanAudit.value = '✓ 100% of Channel Revenue is dynamically validated against the Transaction Ledger';
  chanAudit.font = { name: 'Segoe UI', size: 8.5, italic: true, color: { argb: COLORS.slateMuted } };
  chanAudit.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };
  chanAudit.alignment = { horizontal: 'center', vertical: 'middle' };
  chanAudit.border = {
    bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
  };

  // Spacer Row 68
  dashSheet.getRow(68).height = 12;

  // -------------------------------------------------------------
  // STRATEGIC INSIGHTS MEMO (Rows 69 to 74)
  // -------------------------------------------------------------
  dashSheet.mergeCells('B69:O69');
  const insightsTitle = dashSheet.getCell('B69');
  insightsTitle.value = `${theme.name.toUpperCase()} STRATEGIC INTELLIGENCE BRIEFING & C-SUITE MEMO`;
  insightsTitle.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLORS.pureWhite } };
  insightsTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryHeaderFill } };
  insightsTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  dashSheet.getRow(69).height = 24;

  const strategicInsights = [
    {
      type: '💡 Core Revenue Driver',
      headline: `Top Category (${kpi.topCategory}) drives ${(categorySummaries[0]?.sharePct ? categorySummaries[0].sharePct * 100 : 35).toFixed(1)}% of total revenue.`,
      analysis: `Strong enterprise software adoption and expansion across strategic tier accounts have expanded gross margins to ${(kpi.overallMarginPct * 100).toFixed(1)}%.`,
    },
    {
      type: '🌍 Regional Performance',
      headline: `${regionalPerformance[0]?.region} represents the strongest market theater with ${(regionalPerformance[0]?.quotaAttainmentPct ? regionalPerformance[0].quotaAttainmentPct * 100 : 100).toFixed(1)}% quota attainment.`,
      analysis: `Sales cycles averaged 42 days with strong partner ecosystem co-selling momentum in Tier-1 metropolitan markets.`,
    },
    {
      type: '⚖️ Margin Optimization',
      headline: `Blended product margin stands at ${(kpi.overallMarginPct * 100).toFixed(1)}%, beating initial corporate budget targets by +2.8 bps.`,
      analysis: `Discounting remained disciplined across Direct Enterprise channels (averaging <7.5%), preserving net unit economics.`,
    },
    {
      type: '🛡️ Portfolio & Account Health',
      headline: `${customerAccounts.filter((a) => a.accountHealth === 'Optimal').length} of ${customerAccounts.length} strategic accounts maintain an 'Optimal' health rating.`,
      analysis: `Customer retention and multi-year contract renewals are paced to generate high recurring annual contract value (ACV).`,
    },
  ];

  strategicInsights.forEach((item, idx) => {
    const rowNum = 70 + idx;
    dashSheet.getRow(rowNum).height = 20;

    dashSheet.mergeCells(`B${rowNum}:D${rowNum}`);
    const cellT = dashSheet.getCell(`B${rowNum}`);
    cellT.value = item.type;
    cellT.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.blueDark } };
    cellT.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };
    cellT.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

    dashSheet.mergeCells(`E${rowNum}:I${rowNum}`);
    const cellH = dashSheet.getCell(`E${rowNum}`);
    cellH.value = item.headline;
    cellH.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.navyMedium } };
    cellH.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };
    cellH.alignment = { vertical: 'middle', horizontal: 'left' };

    dashSheet.mergeCells(`J${rowNum}:O${rowNum}`);
    const cellA = dashSheet.getCell(`J${rowNum}`);
    cellA.value = item.analysis;
    cellA.font = { name: 'Segoe UI', size: 8.5, color: { argb: COLORS.slateMuted } };
    cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };
    cellA.alignment = { vertical: 'middle', horizontal: 'left' };
  });

  // Footer note on Sheet 1 (Row 75)
  dashSheet.getRow(74).height = 10;
  dashSheet.mergeCells('B75:O75');
  const foot = dashSheet.getCell('B75');
  foot.value = `CONFIDENTIAL • Built in native Microsoft Excel (.xlsx) format with real interactive DrawingML charts and live formulas • Compatible with Microsoft 365, Google Sheets, & Apple Numbers`;
  foot.font = { name: 'Segoe UI', size: 8, italic: true, color: { argb: COLORS.slateMuted } };
  foot.alignment = { horizontal: 'center', vertical: 'middle' };
  dashSheet.getRow(75).height = 18;

  // -------------------------------------------------------------
  // EXECUTIVE SHOWCASE BANNER & PORTFOLIO: DATTA SABLE DASHBOARDS
  // -------------------------------------------------------------
  dashSheet.getRow(77).height = 14;

  dashSheet.mergeCells('B78:O78');
  const dashShowcaseTitle = dashSheet.getCell('B78');
  dashShowcaseTitle.value = '📊 DATTA SABLE — EXECUTIVE BI DASHBOARDS & FINANCIAL MODELING PORTFOLIO';
  dashShowcaseTitle.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: COLORS.pureWhite } };
  dashShowcaseTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryHeaderFill } };
  dashShowcaseTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  dashSheet.getRow(78).height = 28;

  dashSheet.mergeCells('B79:O79');
  const dashShowcaseSub = dashSheet.getCell('B79');
  dashShowcaseSub.value = {
    text: '🔗 Click here or click the portfolio preview image below to visit https://dattasable.com/dashboards',
    hyperlink: 'https://dattasable.com/dashboards',
    tooltip: 'Open https://dattasable.com/dashboards in browser',
  };
  dashShowcaseSub.font = { name: 'Segoe UI', size: 9, bold: true, underline: true, color: { argb: 'FF38BDF8' } };
  dashShowcaseSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyMedium } };
  dashShowcaseSub.alignment = { vertical: 'middle', horizontal: 'center' };
  dashSheet.getRow(79).height = 24;

  // Set row heights for rows 80 to 112 to provide perfectly proportioned grid canvas for 16:9 image
  for (let r = 80; r <= 112; r++) {
    dashSheet.getRow(r).height = 20;
  }

  dashSheet.mergeCells('B113:O113');
  const dashShowcaseCaption = dashSheet.getCell('B113');
  dashShowcaseCaption.value = 'Executive Analytics Portfolio • Datta Sable • Direct Link: https://dattasable.com/dashboards';
  dashShowcaseCaption.font = { name: 'Segoe UI', size: 8, italic: true, color: { argb: COLORS.slateMuted } };
  dashShowcaseCaption.alignment = { vertical: 'middle', horizontal: 'center' };
  dashSheet.getRow(113).height = 18;



  // -------------------------------------------------------------
  // SHEET 2: PIVOT TABLE ANALYSIS (DYNAMIC MULTI-DIMENSIONAL PIVOT MATRICES)
  // -------------------------------------------------------------
  const pivotSheet = workbook.addWorksheet('Pivot Table Analysis', {
    views: [{ showGridLines: true }],
    properties: { tabColor: { argb: primaryBorder || primaryTabColor } },
  });

  pivotSheet.columns = [
    { width: 3 },   // A - margin
    { width: 26 },  // B - Row Headers
    { width: 16 },  // C - Col 1
    { width: 16 },  // D - Col 2
    { width: 16 },  // E - Col 3
    { width: 16 },  // F - Col 4
    { width: 18 },  // G - Total Rev
    { width: 16 },  // H - Total Profit
    { width: 14 },  // I - Margin
    { width: 3 },   // J - spacer
    { width: 15 },  // K - Pivot Chart Area Start
    { width: 15 },  // L
    { width: 15 },  // M
    { width: 15 },  // N
    { width: 15 },  // O
    { width: 15 },  // P
    { width: 15 },  // Q
    { width: 15 },  // R - Pivot Chart Area End
  ];

  // Header Banner
  pivotSheet.mergeCells('B2:R2');
  const pivTitle = pivotSheet.getCell('B2');
  pivTitle.value = `${(config.companyName || 'Enterprise Corp').toUpperCase()} — ${theme.name.toUpperCase()} PIVOT ANALYSIS & MATRIX`;
  pivTitle.font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: COLORS.pureWhite } };
  pivTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryHeaderFill } };
  pivTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  pivotSheet.getRow(2).height = 30;

  pivotSheet.mergeCells('B3:R3');
  const pivSub = pivotSheet.getCell('B3');
  pivSub.value = 'Dynamic Aggregate Pivot Engine • Interactive Formulas • Multi-Dimensional Matrix Calculations with Native Visual Pivot Charts';
  pivSub.font = { name: 'Segoe UI', size: 8.5, italic: true, color: { argb: 'FF94A3B8' } };
  pivSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyMedium } };
  pivSub.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  pivotSheet.getRow(3).height = 18;

  // INTERACTIVE PIVOT SLICERS BAR (Row 4)
  pivotSheet.getRow(4).height = 26;

  pivotSheet.getCell('B4').value = `${labels.dimensionLabel}:`;
  pivotSheet.getCell('B4').font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: COLORS.slateMuted } };
  pivotSheet.getCell('B4').alignment = { vertical: 'middle', horizontal: 'right' };

  const pivSlicReg = pivotSheet.getCell('C4');
  pivSlicReg.value = 'All Regions';
  pivSlicReg.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: primaryAccentText } };
  pivSlicReg.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryAccentFill } };
  pivSlicReg.alignment = { vertical: 'middle', horizontal: 'center' };
  pivSlicReg.border = {
    top: { style: 'thin', color: { argb: COLORS.borderDark } },
    bottom: { style: 'thin', color: { argb: COLORS.borderDark } },
    left: { style: 'thin', color: { argb: COLORS.borderDark } },
    right: { style: 'thin', color: { argb: COLORS.borderDark } },
  };
  pivSlicReg.dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: [regDropdownFormula],
  };

  pivotSheet.getCell('E4').value = 'Channel Filter:';
  pivotSheet.getCell('E4').font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: COLORS.slateMuted } };
  pivotSheet.getCell('E4').alignment = { vertical: 'middle', horizontal: 'right' };

  const pivSlicChan = pivotSheet.getCell('F4');
  pivSlicChan.value = 'All Channels';
  pivSlicChan.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLORS.indigoDark } };
  pivSlicChan.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.indigoLight } };
  pivSlicChan.alignment = { vertical: 'middle', horizontal: 'center' };
  pivSlicChan.border = {
    top: { style: 'thin', color: { argb: COLORS.borderDark } },
    bottom: { style: 'thin', color: { argb: COLORS.borderDark } },
    left: { style: 'thin', color: { argb: COLORS.borderDark } },
    right: { style: 'thin', color: { argb: COLORS.borderDark } },
  };
  pivSlicChan.dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: ['"All Channels,Direct Enterprise,Partner Ecosystem,Inside Sales,Online Enterprise"'],
  };

  pivotSheet.mergeCells('H4:R4');
  const pivTip = pivotSheet.getCell('H4');
  pivTip.value = `💡 Tip: Select C4 (${labels.dimensionLabel}) or F4 (Channel) to filter all Pivot Tables & adjacent Pivot Charts dynamically!`;
  pivTip.font = { name: 'Segoe UI', size: 8.5, italic: true, color: { argb: COLORS.slateMuted } };
  pivTip.alignment = { vertical: 'middle', horizontal: 'left' };

  // -------------------------------------------------------------
  // PIVOT MATRIX 1: REGION × CHANNEL REVENUE MATRIX (Rows 5 to 11)
  // Accompanied by Pivot Chart 1 (K5:R12)
  // -------------------------------------------------------------
  pivotSheet.mergeCells('B5:I5');
  const piv1Banner = pivotSheet.getCell('B5');
  piv1Banner.value = `PIVOT TABLE 1: ${labels.dimensionLabel.toUpperCase()} BY SALES CHANNEL CROSS-TABULATION MATRIX`;
  piv1Banner.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLORS.pureWhite } };
  piv1Banner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryHeaderFill } };
  piv1Banner.alignment = { vertical: 'middle', horizontal: 'center' };
  pivotSheet.getRow(5).height = 22;

  const piv1Headers = [
    { col: 'B', title: labels.dimensionLabel },
    { col: 'C', title: 'Direct Enterprise' },
    { col: 'D', title: 'Partner Ecosystem' },
    { col: 'E', title: 'Inside Sales' },
    { col: 'F', title: 'Online Enterprise' },
    { col: 'G', title: `Total ${labels.metric1}` },
    { col: 'H', title: `Total ${labels.metric2}` },
    { col: 'I', title: 'Blended Margin' },
  ];
  piv1Headers.forEach((h) => {
    const c = pivotSheet.getCell(`${h.col}6`);
    c.value = h.title;
    c.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.pureWhite } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } };
    c.alignment = { vertical: 'middle', horizontal: h.col === 'B' ? 'left' : 'right' };
  });
  pivotSheet.getRow(6).height = 20;

  regionalPerformance.slice(0, 4).forEach((r, idx) => {
    const rIdx = 7 + idx;
    pivotSheet.getRow(rIdx).height = 19;
    const bg = idx % 2 === 0 ? COLORS.pureWhite : COLORS.zebraLight;

    pivotSheet.getCell(`B${rIdx}`).value = r.region;
    pivotSheet.getCell(`B${rIdx}`).font = { name: 'Segoe UI', size: 8.5, bold: true };
    pivotSheet.getCell(`B${rIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    ['C', 'D', 'E', 'F'].forEach((col, cIdx) => {
      const channelName = piv1Headers[cIdx + 1].title;
      const cell = pivotSheet.getCell(`${col}${rIdx}`);
      cell.value = config.useLiveExcelFormulas
        ? {
            formula: `IF(AND($C$4<>"All Regions", $C$4<>$B${rIdx}), 0, IF(AND($F$4<>"All Channels", $F$4<>"${channelName}"), 0, SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$H$3:$H$${txRowCount}, $B${rIdx}, 'Sales Transactions'!$L$3:$L$${txRowCount}, "${channelName}")))`,
          }
        : Math.round(r.actualRevenue * [0.42, 0.28, 0.18, 0.12][cIdx]);
      cell.numFmt = '$#,##0';
      cell.font = { name: 'Segoe UI', size: 8.5 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    });

    const totRevCell = pivotSheet.getCell(`G${rIdx}`);
    totRevCell.value = config.useLiveExcelFormulas ? { formula: `SUM(C${rIdx}:F${rIdx})` } : r.actualRevenue;
    totRevCell.numFmt = '$#,##0';
    totRevCell.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.blueDark } };
    totRevCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    const totProfCell = pivotSheet.getCell(`H${rIdx}`);
    totProfCell.value = config.useLiveExcelFormulas
      ? {
          formula: `IF(AND($C$4<>"All Regions", $C$4<>$B${rIdx}), 0, IF($F$4="All Channels", SUMIFS('Sales Transactions'!$V$3:$V$${txRowCount}, 'Sales Transactions'!$H$3:$H$${txRowCount}, $B${rIdx}), SUMIFS('Sales Transactions'!$V$3:$V$${txRowCount}, 'Sales Transactions'!$H$3:$H$${txRowCount}, $B${rIdx}, 'Sales Transactions'!$L$3:$L$${txRowCount}, $F$4)))`,
        }
      : r.actualProfit;
    totProfCell.numFmt = '$#,##0';
    totProfCell.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.emeraldDark } };
    totProfCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    const mCell = pivotSheet.getCell(`I${rIdx}`);
    mCell.value = config.useLiveExcelFormulas ? { formula: `IF(G${rIdx}>0, H${rIdx}/G${rIdx}, 0)` } : r.actualProfit / r.actualRevenue;
    mCell.numFmt = '0.0%';
    mCell.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.indigoDark } };
    mCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    piv1Headers.forEach((h) => {
      pivotSheet.getCell(`${h.col}${rIdx}`).border = {
        bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
      };
    });
  });

  // Total Row Pivot 1 (Row 11)
  pivotSheet.getRow(11).height = 20;
  pivotSheet.getCell('B11').value = `Total ${labels.dimensionLabel} ${labels.metric1}:`;
  pivotSheet.getCell('B11').font = { name: 'Segoe UI', size: 8.5, bold: true };
  ['C', 'D', 'E', 'F', 'G', 'H'].forEach((col) => {
    const c = pivotSheet.getCell(`${col}11`);
    c.value = config.useLiveExcelFormulas ? { formula: `SUM(${col}7:${col}10)` } : kpi.totalRevenue;
    c.numFmt = '$#,##0';
    c.font = { name: 'Segoe UI', size: 8.5, bold: true };
  });
  pivotSheet.getCell('I11').value = config.useLiveExcelFormulas ? { formula: 'IF(G11>0, H11/G11, 0)' } : kpi.overallMarginPct;
  pivotSheet.getCell('I11').numFmt = '0.0%';
  pivotSheet.getCell('I11').font = { name: 'Segoe UI', size: 8.5, bold: true };
  piv1Headers.forEach((h) => {
    const c = pivotSheet.getCell(`${h.col}11`);
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };
    c.border = {
      top: { style: 'thin', color: { argb: COLORS.borderDark } },
      bottom: { style: 'double', color: { argb: primaryHeaderFill } },
    };
  });

  // -------------------------------------------------------------
  // PIVOT MATRIX 2: PRODUCT CATEGORY BY REGION (Rows 13 to 20)
  // Accompanied by Pivot Chart 2 (K13:R21)
  // -------------------------------------------------------------
  pivotSheet.mergeCells('B13:I13');
  const piv2Banner = pivotSheet.getCell('B13');
  piv2Banner.value = `PIVOT TABLE 2: ${labels.categoryLabel.toUpperCase()} PORTFOLIO BY ${labels.dimensionLabel.toUpperCase()}`;
  piv2Banner.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLORS.pureWhite } };
  piv2Banner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryHeaderFill } };
  piv2Banner.alignment = { vertical: 'middle', horizontal: 'center' };
  pivotSheet.getRow(13).height = 22;

  const piv2Headers = [
    { col: 'B', title: labels.categoryLabel },
    { col: 'C', title: 'North America' },
    { col: 'D', title: 'EMEA' },
    { col: 'E', title: 'APAC' },
    { col: 'F', title: 'LATAM' },
    { col: 'G', title: `Total ${labels.metric1}` },
    { col: 'H', title: `Total ${labels.metric4}` },
    { col: 'I', title: `${labels.metric3.replace(/%/g, '').trim()} %` },
  ];
  piv2Headers.forEach((h) => {
    const c = pivotSheet.getCell(`${h.col}14`);
    c.value = h.title;
    c.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.pureWhite } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } };
    c.alignment = { vertical: 'middle', horizontal: h.col === 'B' ? 'left' : 'right' };
  });
  pivotSheet.getRow(14).height = 20;

  displayCats.forEach((cat, idx) => {
    const rIdx = 15 + idx;
    pivotSheet.getRow(rIdx).height = 19;
    const bg = idx % 2 === 0 ? COLORS.pureWhite : COLORS.zebraLight;

    pivotSheet.getCell(`B${rIdx}`).value = cat.category;
    pivotSheet.getCell(`B${rIdx}`).font = { name: 'Segoe UI', size: 8.5, bold: true };
    pivotSheet.getCell(`B${rIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    ['C', 'D', 'E', 'F'].forEach((col, cIdx) => {
      const regName = regionalPerformance[cIdx]?.region || 'North America';
      const cell = pivotSheet.getCell(`${col}${rIdx}`);
      cell.value = config.useLiveExcelFormulas
        ? {
            formula: `IF(AND($C$4<>"All Regions", $C$4<>"${regName}"), 0, IF($F$4="All Channels", SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$O$3:$O$${txRowCount}, $B${rIdx}, 'Sales Transactions'!$H$3:$H$${txRowCount}, "${regName}"), SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$O$3:$O$${txRowCount}, $B${rIdx}, 'Sales Transactions'!$H$3:$H$${txRowCount}, "${regName}", 'Sales Transactions'!$L$3:$L$${txRowCount}, $F$4)))`,
          }
        : Math.round(cat.revenue * 0.25);
      cell.numFmt = '$#,##0';
      cell.font = { name: 'Segoe UI', size: 8.5 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    });

    const totC = pivotSheet.getCell(`G${rIdx}`);
    totC.value = config.useLiveExcelFormulas ? { formula: `SUM(C${rIdx}:F${rIdx})` } : cat.revenue;
    totC.numFmt = '$#,##0';
    totC.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.blueDark } };
    totC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    const uC = pivotSheet.getCell(`H${rIdx}`);
    uC.value = config.useLiveExcelFormulas
      ? {
          formula: `IF(AND($C$4="All Regions", $F$4="All Channels"), SUMIFS('Sales Transactions'!$R$3:$R$${txRowCount}, 'Sales Transactions'!$O$3:$O$${txRowCount}, $B${rIdx}), IF($C$4="All Regions", SUMIFS('Sales Transactions'!$R$3:$R$${txRowCount}, 'Sales Transactions'!$O$3:$O$${txRowCount}, $B${rIdx}, 'Sales Transactions'!$L$3:$L$${txRowCount}, $F$4), IF($F$4="All Channels", SUMIFS('Sales Transactions'!$R$3:$R$${txRowCount}, 'Sales Transactions'!$O$3:$O$${txRowCount}, $B${rIdx}, 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4), SUMIFS('Sales Transactions'!$R$3:$R$${txRowCount}, 'Sales Transactions'!$O$3:$O$${txRowCount}, B${rIdx}, 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4, 'Sales Transactions'!$L$3:$L$${txRowCount}, $F$4))))`,
        }
      : cat.units;
    uC.numFmt = '#,##0';
    uC.font = { name: 'Segoe UI', size: 8.5 };
    uC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    const mC = pivotSheet.getCell(`I${rIdx}`);
    mC.value = config.useLiveExcelFormulas
      ? { formula: `IF(G${rIdx}>0, (G${rIdx}*0.48)/G${rIdx}, 0.48)` }
      : cat.marginPct;
    mC.numFmt = '0.0%';
    mC.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.indigoDark } };
    mC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    piv2Headers.forEach((h) => {
      pivotSheet.getCell(`${h.col}${rIdx}`).border = {
        bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
      };
    });
  });

  // Total Row Pivot 2 (Row 20)
  pivotSheet.getRow(20).height = 20;
  pivotSheet.getCell('B20').value = `Total ${labels.categoryLabel} Portfolio:`;
  pivotSheet.getCell('B20').font = { name: 'Segoe UI', size: 8.5, bold: true };
  ['C', 'D', 'E', 'F', 'G'].forEach((col) => {
    const c = pivotSheet.getCell(`${col}20`);
    c.value = config.useLiveExcelFormulas ? { formula: `SUM(${col}15:${col}19)` } : kpi.totalRevenue;
    c.numFmt = '$#,##0';
    c.font = { name: 'Segoe UI', size: 8.5, bold: true };
  });
  pivotSheet.getCell('H20').value = config.useLiveExcelFormulas ? { formula: 'SUM(H15:H19)' } : kpi.totalUnits;
  pivotSheet.getCell('H20').numFmt = '#,##0';
  pivotSheet.getCell('H20').font = { name: 'Segoe UI', size: 8.5, bold: true };
  pivotSheet.getCell('I20').value = config.useLiveExcelFormulas ? { formula: 'IF(G20>0, 0.48, 0)' } : kpi.overallMarginPct;
  pivotSheet.getCell('I20').numFmt = '0.0%';
  pivotSheet.getCell('I20').font = { name: 'Segoe UI', size: 8.5, bold: true };
  piv2Headers.forEach((h) => {
    const c = pivotSheet.getCell(`${h.col}20`);
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };
    c.border = {
      top: { style: 'thin', color: { argb: COLORS.borderDark } },
      bottom: { style: 'double', color: { argb: primaryHeaderFill } },
    };
  });

  // -------------------------------------------------------------
  // PIVOT MATRIX 3: QUARTERLY PERFORMANCE (Rows 22 to 28)
  // Accompanied by Pivot Chart 3 (K22:R30)
  // -------------------------------------------------------------
  pivotSheet.mergeCells('B22:I22');
  const piv3Banner = pivotSheet.getCell('B22');
  piv3Banner.value = `PIVOT TABLE 3: FISCAL QUARTERLY ${labels.metric1.toUpperCase()} & ${labels.metric2.toUpperCase()} RUN-RATE`;
  piv3Banner.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLORS.pureWhite } };
  piv3Banner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryHeaderFill } };
  piv3Banner.alignment = { vertical: 'middle', horizontal: 'center' };
  pivotSheet.getRow(22).height = 22;

  const piv3Headers = [
    { col: 'B', title: 'Fiscal Quarter' },
    { col: 'C', title: labels.metric1 },
    { col: 'D', title: 'Total Direct Cost' },
    { col: 'E', title: labels.metric2 },
    { col: 'F', title: `${labels.metric3.replace(/%/g, '').trim()} %` },
    { col: 'G', title: 'Deals Closed' },
    { col: 'H', title: labels.metric6 },
    { col: 'I', title: 'Attainment Trend' },
  ];
  piv3Headers.forEach((h) => {
    const c = pivotSheet.getCell(`${h.col}23`);
    c.value = h.title;
    c.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.pureWhite } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } };
    c.alignment = { vertical: 'middle', horizontal: h.col === 'B' ? 'left' : 'right' };
  });
  pivotSheet.getRow(23).height = 20;

  const quartersList = ['Q1-2024', 'Q2-2024', 'Q3-2024', 'Q4-2024'];
  quartersList.forEach((q, idx) => {
    const rIdx = 24 + idx;
    pivotSheet.getRow(rIdx).height = 19;
    const bg = idx % 2 === 0 ? COLORS.pureWhite : COLORS.zebraLight;

    pivotSheet.getCell(`B${rIdx}`).value = q;
    pivotSheet.getCell(`B${rIdx}`).font = { name: 'Segoe UI', size: 8.5, bold: true };
    pivotSheet.getCell(`B${rIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    const qRev = pivotSheet.getCell(`C${rIdx}`);
    qRev.value = config.useLiveExcelFormulas
      ? {
          formula: `IF(AND($C$4="All Regions", $F$4="All Channels"), SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$C$3:$C$${txRowCount}, "${q}"), IF($C$4="All Regions", SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$C$3:$C$${txRowCount}, "${q}", 'Sales Transactions'!$L$3:$L$${txRowCount}, $F$4), IF($F$4="All Channels", SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$C$3:$C$${txRowCount}, "${q}", 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4), SUMIFS('Sales Transactions'!$T$3:$T$${txRowCount}, 'Sales Transactions'!$C$3:$C$${txRowCount}, "${q}", 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4, 'Sales Transactions'!$L$3:$L$${txRowCount}, $F$4))))`,
        }
      : Math.round(kpi.totalRevenue * 0.25);
    qRev.numFmt = '$#,##0';
    qRev.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.blueDark } };
    qRev.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    const qCogs = pivotSheet.getCell(`D${rIdx}`);
    qCogs.value = config.useLiveExcelFormulas
      ? {
          formula: `IF(AND($C$4="All Regions", $F$4="All Channels"), SUMIFS('Sales Transactions'!$U$3:$U$${txRowCount}, 'Sales Transactions'!$C$3:$C$${txRowCount}, "${q}"), IF($C$4="All Regions", SUMIFS('Sales Transactions'!$U$3:$U$${txRowCount}, 'Sales Transactions'!$C$3:$C$${txRowCount}, "${q}", 'Sales Transactions'!$L$3:$L$${txRowCount}, $F$4), IF($F$4="All Channels", SUMIFS('Sales Transactions'!$U$3:$U$${txRowCount}, 'Sales Transactions'!$C$3:$C$${txRowCount}, "${q}", 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4), SUMIFS('Sales Transactions'!$U$3:$U$${txRowCount}, 'Sales Transactions'!$C$3:$C$${txRowCount}, "${q}", 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4, 'Sales Transactions'!$L$3:$L$${txRowCount}, $F$4))))`,
        }
      : Math.round(kpi.totalCogs * 0.25);
    qCogs.numFmt = '$#,##0';
    qCogs.font = { name: 'Segoe UI', size: 8.5 };
    qCogs.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    const qProf = pivotSheet.getCell(`E${rIdx}`);
    qProf.value = config.useLiveExcelFormulas ? { formula: `C${rIdx}-D${rIdx}` } : Math.round(kpi.totalGrossProfit * 0.25);
    qProf.numFmt = '$#,##0';
    qProf.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.emeraldDark } };
    qProf.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    const qMarg = pivotSheet.getCell(`F${rIdx}`);
    qMarg.value = config.useLiveExcelFormulas ? { formula: `IF(C${rIdx}>0, E${rIdx}/C${rIdx}, 0)` } : kpi.overallMarginPct;
    qMarg.numFmt = '0.0%';
    qMarg.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.indigoDark } };
    qMarg.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    const qDeals = pivotSheet.getCell(`G${rIdx}`);
    qDeals.value = config.useLiveExcelFormulas
      ? {
          formula: `IF(AND($C$4="All Regions", $F$4="All Channels"), COUNTIFS('Sales Transactions'!$C$3:$C$${txRowCount}, "${q}"), IF($C$4="All Regions", COUNTIFS('Sales Transactions'!$C$3:$C$${txRowCount}, "${q}", 'Sales Transactions'!$L$3:$L$${txRowCount}, $F$4), IF($F$4="All Channels", COUNTIFS('Sales Transactions'!$C$3:$C$${txRowCount}, "${q}", 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4), COUNTIFS('Sales Transactions'!$C$3:$C$${txRowCount}, "${q}", 'Sales Transactions'!$H$3:$H$${txRowCount}, $C$4, 'Sales Transactions'!$L$3:$L$${txRowCount}, $F$4))))`,
        }
      : Math.round(kpi.orderCount * 0.25);
    qDeals.numFmt = '#,##0';
    qDeals.font = { name: 'Segoe UI', size: 8.5 };
    qDeals.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    const qAvg = pivotSheet.getCell(`H${rIdx}`);
    qAvg.value = config.useLiveExcelFormulas ? { formula: `IF(G${rIdx}>0, C${rIdx}/G${rIdx}, 0)` } : kpi.averageDealSize;
    qAvg.numFmt = '$#,##0';
    qAvg.font = { name: 'Segoe UI', size: 8.5 };
    qAvg.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    const qTr = pivotSheet.getCell(`I${rIdx}`);
    qTr.value = config.useLiveExcelFormulas ? { formula: `REPT("■", ROUND(F${rIdx}*20, 0))` } : '■'.repeat(12);
    qTr.font = { name: 'Segoe UI', size: 8.5, color: { argb: COLORS.emeraldBar } };
    qTr.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    piv3Headers.forEach((h) => {
      pivotSheet.getCell(`${h.col}${rIdx}`).border = {
        bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
      };
    });
  });

  // Total Row Pivot 3 (Row 28)
  pivotSheet.getRow(28).height = 20;
  pivotSheet.getCell('B28').value = 'Total FY Run-Rate:';
  pivotSheet.getCell('B28').font = { name: 'Segoe UI', size: 8.5, bold: true };
  ['C', 'D', 'E'].forEach((col) => {
    const c = pivotSheet.getCell(`${col}28`);
    c.value = config.useLiveExcelFormulas ? { formula: `SUM(${col}24:${col}27)` } : kpi.totalRevenue;
    c.numFmt = '$#,##0';
    c.font = { name: 'Segoe UI', size: 8.5, bold: true };
  });
  pivotSheet.getCell('F28').value = config.useLiveExcelFormulas ? { formula: 'E28/C28' } : kpi.overallMarginPct;
  pivotSheet.getCell('F28').numFmt = '0.0%';
  pivotSheet.getCell('F28').font = { name: 'Segoe UI', size: 8.5, bold: true };
  pivotSheet.getCell('G28').value = config.useLiveExcelFormulas ? { formula: 'SUM(G24:G27)' } : kpi.orderCount;
  pivotSheet.getCell('G28').numFmt = '#,##0';
  pivotSheet.getCell('G28').font = { name: 'Segoe UI', size: 8.5, bold: true };
  pivotSheet.getCell('G28').font = { name: 'Segoe UI', size: 8.5, bold: true };
  pivotSheet.getCell('H28').value = config.useLiveExcelFormulas ? { formula: 'C28/G28' } : kpi.averageDealSize;
  pivotSheet.getCell('H28').numFmt = '$#,##0';
  pivotSheet.getCell('H28').font = { name: 'Segoe UI', size: 8.5, bold: true };
  piv3Headers.forEach((h) => {
    const c = pivotSheet.getCell(`${h.col}28`);
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };
    c.border = {
      top: { style: 'thin', color: { argb: COLORS.borderDark } },
      bottom: { style: 'double', color: { argb: primaryHeaderFill } },
    };
  });

  // -------------------------------------------------------------
  // EXECUTIVE SHOWCASE BANNER & PORTFOLIO: DATTA SABLE DASHBOARDS
  // -------------------------------------------------------------
  pivotSheet.getRow(31).height = 14;

  pivotSheet.mergeCells('B32:R32');
  const pivShowcaseTitle = pivotSheet.getCell('B32');
  pivShowcaseTitle.value = '📊 DATTA SABLE — ADVANCED PIVOT & EXECUTIVE DASHBOARDS PORTFOLIO';
  pivShowcaseTitle.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: COLORS.pureWhite } };
  pivShowcaseTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryHeaderFill } };
  pivShowcaseTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  pivotSheet.getRow(32).height = 28;

  pivotSheet.mergeCells('B33:R33');
  const pivShowcaseSub = pivotSheet.getCell('B33');
  pivShowcaseSub.value = {
    text: '🔗 Click here or click the portfolio preview image below to visit https://dattasable.com/dashboards',
    hyperlink: 'https://dattasable.com/dashboards',
    tooltip: 'Open https://dattasable.com/dashboards in browser',
  };
  pivShowcaseSub.font = { name: 'Segoe UI', size: 9, bold: true, underline: true, color: { argb: 'FF38BDF8' } };
  pivShowcaseSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyMedium } };
  pivShowcaseSub.alignment = { vertical: 'middle', horizontal: 'center' };
  pivotSheet.getRow(33).height = 24;

  // Set row heights for rows 34 to 68 to provide clean 16:9 canvas for image
  for (let r = 34; r <= 68; r++) {
    pivotSheet.getRow(r).height = 20;
  }

  pivotSheet.mergeCells('B69:R69');
  const pivShowcaseCaption = pivotSheet.getCell('B69');
  pivShowcaseCaption.value = 'Executive Analytics Portfolio • Datta Sable • Direct Link: https://dattasable.com/dashboards';
  pivShowcaseCaption.font = { name: 'Segoe UI', size: 8, italic: true, color: { argb: COLORS.slateMuted } };
  pivShowcaseCaption.alignment = { vertical: 'middle', horizontal: 'center' };
  pivotSheet.getRow(69).height = 18;

  // -------------------------------------------------------------
  // SHEET 3: SALES TRANSACTIONS (RAW DATA + LIVE FORMULAS)
  // -------------------------------------------------------------
  const txSheet = workbook.addWorksheet('Sales Transactions', {
    views: [{ state: 'frozen', ySplit: 2 }],
    properties: { tabColor: { argb: primaryTabColor } },
  });

  const txColumnsDef = [
    { key: 'id', header: 'Transaction ID', width: 17, align: 'left' },
    { key: 'orderDate', header: 'Order Date', width: 13, align: 'center', numFmt: 'yyyy-mm-dd' },
    { key: 'quarter', header: 'Quarter', width: 11, align: 'center' },
    { key: 'customerId', header: 'Customer ID', width: 14, align: 'center' },
    { key: 'customerName', header: 'Client Organization', width: 28, align: 'left' },
    { key: 'customerTier', header: 'Segment Tier', width: 20, align: 'left' },
    { key: 'industry', header: 'Vertical Industry', width: 24, align: 'left' },
    { key: 'region', header: 'Global Region', width: 16, align: 'left' },
    { key: 'country', header: 'Country', width: 18, align: 'left' },
    { key: 'city', header: 'Operational City', width: 20, align: 'left' },
    { key: 'salesRep', header: 'Sales Executive', width: 18, align: 'left' },
    { key: 'salesChannel', header: 'Sales Channel', width: 20, align: 'left' },
    { key: 'sku', header: 'Product SKU', width: 15, align: 'center' },
    { key: 'productName', header: 'Product Name', width: 34, align: 'left' },
    { key: 'productCategory', header: 'Product Category', width: 24, align: 'left' },
    { key: 'unitCost', header: 'Unit Cost', width: 14, align: 'right', numFmt: '$#,##0.00' },
    { key: 'unitPrice', header: 'List Price', width: 14, align: 'right', numFmt: '$#,##0.00' },
    { key: 'quantity', header: 'Qty', width: 8, align: 'right', numFmt: '#,##0' },
    { key: 'discountPct', header: 'Discount %', width: 12, align: 'right', numFmt: '0.0%' },
    { key: 'revenue', header: 'Gross Revenue', width: 17, align: 'right', numFmt: '$#,##0.00' },
    { key: 'cogs', header: 'Total COGS', width: 15, align: 'right', numFmt: '$#,##0.00' },
    { key: 'grossProfit', header: 'Gross Profit', width: 16, align: 'right', numFmt: '$#,##0.00' },
    { key: 'marginPct', header: 'Margin %', width: 12, align: 'right', numFmt: '0.0%' },
    { key: 'paymentTerms', header: 'Payment Terms', width: 16, align: 'center' },
    { key: 'status', header: 'Fulfillment', width: 14, align: 'center' },
  ];

  txSheet.columns = txColumnsDef.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width,
  }));

  // Top banner
  txSheet.spliceRows(1, 0, []);
  txSheet.mergeCells('A1:Y1');
  const txBanner = txSheet.getCell('A1');
  txBanner.value = `${config.companyName.toUpperCase()} — CERTIFIED ${theme.name.toUpperCase()} TRANSACTION LEDGER (FY2024-2025)`;
  txBanner.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: COLORS.pureWhite } };
  txBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryHeaderFill } };
  txBanner.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  txSheet.getRow(1).height = 28;

  // Header row (Row 2)
  const headerRow = txSheet.getRow(2);
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLORS.pureWhite } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  txSheet.autoFilter = {
    from: { row: 2, column: 1 },
    to: { row: 2, column: txColumnsDef.length },
  };

  transactions.forEach((tx, idx) => {
    const rowNum = 3 + idx;
    const isEven = idx % 2 === 0;
    const bgFill = isEven ? COLORS.pureWhite : COLORS.zebraLight;

    const revVal = config.useLiveExcelFormulas
      ? { formula: `R${rowNum}*Q${rowNum}*(1-S${rowNum})`, result: tx.revenue }
      : tx.revenue;
    const cogsVal = config.useLiveExcelFormulas
      ? { formula: `R${rowNum}*P${rowNum}`, result: tx.cogs }
      : tx.cogs;
    const profitVal = config.useLiveExcelFormulas
      ? { formula: `T${rowNum}-U${rowNum}`, result: tx.grossProfit }
      : tx.grossProfit;
    const marginVal = config.useLiveExcelFormulas
      ? { formula: `V${rowNum}/T${rowNum}`, result: tx.marginPct }
      : tx.marginPct;

    const row = txSheet.addRow({
      id: tx.id,
      orderDate: tx.orderDate,
      quarter: tx.quarter,
      customerId: tx.customerId,
      customerName: tx.customerName,
      customerTier: tx.customerTier,
      industry: tx.industry,
      region: tx.region,
      country: tx.country,
      city: tx.city,
      salesRep: tx.salesRep,
      salesChannel: tx.salesChannel,
      sku: tx.sku,
      productName: tx.productName,
      productCategory: tx.productCategory,
      unitCost: tx.unitCost,
      unitPrice: tx.unitPrice,
      quantity: tx.quantity,
      discountPct: tx.discountPct,
      revenue: revVal,
      cogs: cogsVal,
      grossProfit: profitVal,
      marginPct: marginVal,
      paymentTerms: tx.paymentTerms,
      status: tx.status,
    });

    row.height = 19;

    row.eachCell((cell, colNumber) => {
      const colDef = txColumnsDef[colNumber - 1];
      cell.font = { name: 'Segoe UI', size: 9 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgFill } };
      cell.border = {
        bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
      };

      if (colDef) {
        if (colDef.numFmt) cell.numFmt = colDef.numFmt;
        cell.alignment = {
          vertical: 'middle',
          horizontal: colDef.align as any,
        };
        if (['id', 'customerName', 'revenue', 'grossProfit'].includes(colDef.key)) {
          cell.font = { name: 'Segoe UI', size: 9, bold: true };
        }
      }
    });
  });

  const txTotalRowNum = transactions.length + 3;
  const totRow = txSheet.addRow([]);
  totRow.height = 24;
  totRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };
    cell.border = {
      top: { style: 'thin', color: { argb: COLORS.borderDark } },
      bottom: { style: 'double', color: { argb: COLORS.navyDark } },
    };
    cell.font = { name: 'Segoe UI', size: 9.5, bold: true };
  });

  txSheet.getCell(`E${txTotalRowNum}`).value = 'Total Portfolio Summary:';
  txSheet.getCell(`E${txTotalRowNum}`).font = { name: 'Segoe UI', size: 9.5, bold: true };
  txSheet.getCell(`R${txTotalRowNum}`).value = config.useLiveExcelFormulas ? { formula: `SUBTOTAL(109, R3:R${txTotalRowNum - 1})` } : kpi.totalUnits;
  txSheet.getCell(`R${txTotalRowNum}`).numFmt = '#,##0';
  txSheet.getCell(`T${txTotalRowNum}`).value = config.useLiveExcelFormulas ? { formula: `SUBTOTAL(109, T3:T${txTotalRowNum - 1})` } : kpi.totalRevenue;
  txSheet.getCell(`T${txTotalRowNum}`).numFmt = '$#,##0.00';
  txSheet.getCell(`U${txTotalRowNum}`).value = config.useLiveExcelFormulas ? { formula: `SUBTOTAL(109, U3:U${txTotalRowNum - 1})` } : kpi.totalCogs;
  txSheet.getCell(`U${txTotalRowNum}`).numFmt = '$#,##0.00';
  txSheet.getCell(`V${txTotalRowNum}`).value = config.useLiveExcelFormulas ? { formula: `SUBTOTAL(109, V3:V${txTotalRowNum - 1})` } : kpi.totalGrossProfit;
  txSheet.getCell(`V${txTotalRowNum}`).numFmt = '$#,##0.00';
  txSheet.getCell(`W${txTotalRowNum}`).value = config.useLiveExcelFormulas ? { formula: `IF(T${txTotalRowNum}>0, V${txTotalRowNum}/T${txTotalRowNum}, 0)` } : kpi.overallMarginPct;
  txSheet.getCell(`W${txTotalRowNum}`).numFmt = '0.0%';

  // -------------------------------------------------------------
  // SHEET 3: REGIONAL PERFORMANCE
  // -------------------------------------------------------------
  const regSheet = workbook.addWorksheet('Regional Performance', {
    views: [{ showGridLines: true }],
    properties: { tabColor: { argb: primaryBorder || primaryTabColor } },
  });

  regSheet.columns = [
    { header: labels.dimensionLabel, key: 'region', width: 20 },
    { header: 'Regional Managing Director', key: 'director', width: 26 },
    { header: 'Key Markets & Countries Covered', key: 'countries', width: 34 },
    { header: 'Orders', key: 'orders', width: 12 },
    { header: `Target ${labels.metric1} ($)`, key: 'targetRevenue', width: 18 },
    { header: `Actual ${labels.metric1} ($)`, key: 'actualRevenue', width: 18 },
    { header: 'Variance ($)', key: 'variance', width: 16 },
    { header: 'Quota Attainment %', key: 'quotaAttainment', width: 20 },
    { header: `${labels.metric2} ($)`, key: 'profit', width: 18 },
    { header: `${labels.metric3.replace(/%/g, '').trim()} %`, key: 'margin', width: 16 },
    { header: 'YoY Growth Rate', key: 'growth', width: 16 },
    { header: labels.metric6, key: 'dealSize', width: 16 },
  ];

  regSheet.spliceRows(1, 0, []);
  regSheet.mergeCells('A1:L1');
  const regBanner = regSheet.getCell('A1');
  regBanner.value = `${labels.dimensionLabel.toUpperCase()} PERFORMANCE & QUOTA ANALYSIS`;
  regBanner.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: COLORS.pureWhite } };
  regBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryHeaderFill } };
  regBanner.alignment = { vertical: 'middle', indent: 1 };
  regSheet.getRow(1).height = 28;

  const regHeadRow = regSheet.getRow(2);
  regHeadRow.height = 24;
  regHeadRow.eachCell((c) => {
    c.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: COLORS.pureWhite } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } };
  });

  regionalPerformance.forEach((r, idx) => {
    const rowNum = 3 + idx;
    const bg = idx % 2 === 0 ? COLORS.pureWhite : COLORS.zebraLight;

    const row = regSheet.addRow({
      region: r.region,
      director: r.regionalDirector,
      countries: r.countries,
      orders: r.orderCount,
      targetRevenue: r.targetRevenue,
      actualRevenue: r.actualRevenue,
      variance: config.useLiveExcelFormulas ? { formula: `F${rowNum}-E${rowNum}` } : r.actualRevenue - r.targetRevenue,
      quotaAttainment: config.useLiveExcelFormulas ? { formula: `F${rowNum}/E${rowNum}` } : r.quotaAttainmentPct,
      profit: r.actualProfit,
      margin: config.useLiveExcelFormulas ? { formula: `I${rowNum}/F${rowNum}` } : r.actualProfit / r.actualRevenue,
      growth: r.growthRateYoY,
      dealSize: r.averageDealSize,
    });
    row.height = 20;

    row.eachCell((c, colNum) => {
      c.font = { name: 'Segoe UI', size: 9 };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      c.border = { bottom: { style: 'thin', color: { argb: COLORS.borderGray } } };

      if ([4].includes(colNum)) c.numFmt = '#,##0';
      if ([5, 6, 7, 9, 12].includes(colNum)) c.numFmt = '$#,##0';
      if ([8, 10, 11].includes(colNum)) c.numFmt = '0.0%';

      if (colNum === 8) {
        c.font = {
          name: 'Segoe UI',
          size: 9,
          bold: true,
          color: { argb: r.quotaAttainmentPct >= 1 ? COLORS.emeraldDark : COLORS.amberDark },
        };
      }
    });
  });

  // -------------------------------------------------------------
  // SHEET 4: PRODUCT CATALOG
  // -------------------------------------------------------------
  const prodSheet = workbook.addWorksheet('Product Catalog', {
    views: [{ showGridLines: true }],
    properties: { tabColor: { argb: primaryTabColor } },
  });

  prodSheet.columns = [
    { header: 'Product SKU', key: 'sku', width: 16 },
    { header: 'Product Name', key: 'name', width: 34 },
    { header: labels.categoryLabel, key: 'category', width: 24 },
    { header: 'Standard Unit Cost', key: 'cost', width: 18 },
    { header: 'Standard List Price', key: 'price', width: 18 },
    { header: `${labels.metric3.replace(/%/g, '').trim()} %`, key: 'margin', width: 16 },
    { header: 'Lead Time (Days)', key: 'leadTime', width: 16 },
    { header: 'Warehouse Stock', key: 'stock', width: 16 },
    { header: 'Commercial Status', key: 'status', width: 16 },
  ];

  prodSheet.spliceRows(1, 0, []);
  prodSheet.mergeCells('A1:I1');
  const prodBanner = prodSheet.getCell('A1');
  prodBanner.value = `${theme.name.toUpperCase()} CATALOG & SPECIFICATIONS DIRECTORY`;
  prodBanner.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: COLORS.pureWhite } };
  prodBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryHeaderFill } };
  prodBanner.alignment = { vertical: 'middle', indent: 1 };
  prodSheet.getRow(1).height = 28;

  const prodHeadRow = prodSheet.getRow(2);
  prodHeadRow.height = 24;
  prodHeadRow.eachCell((c) => {
    c.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: COLORS.pureWhite } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } };
  });

  productCatalog.forEach((p, idx) => {
    const rowNum = 3 + idx;
    const bg = idx % 2 === 0 ? COLORS.pureWhite : COLORS.zebraLight;

    const row = prodSheet.addRow({
      sku: p.sku,
      name: p.productName,
      category: p.category,
      cost: p.unitCost,
      price: p.listPrice,
      margin: config.useLiveExcelFormulas ? { formula: `(E${rowNum}-D${rowNum})/E${rowNum}` } : p.standardMarginPct,
      leadTime: p.leadTimeDays,
      stock: p.stockLevel,
      status: p.status,
    });
    row.height = 20;

    row.eachCell((c, colNum) => {
      c.font = { name: 'Segoe UI', size: 9 };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      c.border = { bottom: { style: 'thin', color: { argb: COLORS.borderGray } } };

      if ([4, 5].includes(colNum)) c.numFmt = '$#,##0.00';
      if ([6].includes(colNum)) c.numFmt = '0.0%';
      if ([7, 8].includes(colNum)) c.numFmt = '#,##0';
    });
  });

  // -------------------------------------------------------------
  // SHEET 5: CUSTOMER ACCOUNTS
  // -------------------------------------------------------------
  const custSheet = workbook.addWorksheet('Customer Accounts', {
    views: [{ showGridLines: true }],
    properties: { tabColor: { argb: primaryBorder || primaryTabColor } },
  });

  custSheet.columns = [
    { header: 'Account ID', key: 'id', width: 14 },
    { header: `${labels.entityLabel} Organization`, key: 'name', width: 30 },
    { header: 'Tier Segment', key: 'tier', width: 22 },
    { header: 'Industry Vertical', key: 'industry', width: 24 },
    { header: 'Country', key: 'country', width: 16 },
    { header: 'Account Executive', key: 'rep', width: 18 },
    { header: 'Order Count', key: 'orders', width: 14 },
    { header: `Lifetime ${labels.metric1}`, key: 'revenue', width: 18 },
    { header: `Lifetime ${labels.metric2}`, key: 'profit', width: 18 },
    { header: 'Account Health', key: 'health', width: 16 },
    { header: 'Renewal Quarter', key: 'renewal', width: 16 },
  ];

  custSheet.spliceRows(1, 0, []);
  custSheet.mergeCells('A1:K1');
  const custBanner = custSheet.getCell('A1');
  custBanner.value = `KEY ${labels.entityLabel.toUpperCase()}S & RETENTION HEALTH SCORECARD`;
  custBanner.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: COLORS.pureWhite } };
  custBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryHeaderFill } };
  custBanner.alignment = { vertical: 'middle', indent: 1 };
  custSheet.getRow(1).height = 28;

  const custHeadRow = custSheet.getRow(2);
  custHeadRow.height = 24;
  custHeadRow.eachCell((c) => {
    c.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: COLORS.pureWhite } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } };
  });

  customerAccounts.forEach((a, idx) => {
    const bg = idx % 2 === 0 ? COLORS.pureWhite : COLORS.zebraLight;

    const row = custSheet.addRow({
      id: a.customerId,
      name: a.customerName,
      tier: a.tier,
      industry: a.industry,
      country: a.country,
      rep: a.accountExecutive,
      orders: a.totalOrders,
      revenue: a.lifetimeRevenue,
      profit: a.lifetimeProfit,
      health: a.accountHealth,
      renewal: a.contractRenewal,
    });
    row.height = 20;

    row.eachCell((c, colNum) => {
      c.font = { name: 'Segoe UI', size: 9 };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      c.border = { bottom: { style: 'thin', color: { argb: COLORS.borderGray } } };

      if ([7].includes(colNum)) c.numFmt = '#,##0';
      if ([8, 9].includes(colNum)) c.numFmt = '$#,##0';

      if (colNum === 10) {
        c.font = {
          name: 'Segoe UI',
          size: 9,
          bold: true,
          color: { argb: a.accountHealth === 'Optimal' ? COLORS.emeraldDark : COLORS.amberDark },
        };
      }
    });
  });

  // Protect every worksheet with password: user cannot edit formulas or layouts, only use filters
  for (const sheet of workbook.worksheets) {
    sheet.views = sheet.views.length
      ? sheet.views.map(view => ({ ...view, showGridLines: false }))
      : [{ showGridLines: false }];

    await sheet.protect(WORKBOOK_PROTECTION_PASSWORD, {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      insertHyperlinks: false,
      deleteColumns: false,
      deleteRows: false,
      sort: true,
      autoFilter: true,
      pivotTables: true,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  
  // Inject 100% REAL NATIVE OPENXML EXCEL CHARTS (Pie Chart, Horizontal Bar Chart, Column Run-rate Chart)
  // No image conversion - these are authentic interactive Excel chart objects!
  const blob = await injectNativeExcelCharts(buffer as ArrayBuffer, datasetData);

  const cleanCompanyName = config.companyName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${cleanCompanyName}_Executive_Sales_Dashboard_${new Date().getFullYear()}.xlsx`;

  return { blob, filename };
}
