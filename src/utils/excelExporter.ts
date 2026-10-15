import ExcelJS from 'exceljs';
import { generateRealisticDataset } from './dataGenerator';
import { DatasetConfig } from '../types/dataset';
import { injectNativeExcelCharts } from './nativeExcelChartInjector';

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

  const workbook = new ExcelJS.Workbook();
  workbook.creator = `${config.companyName} Executive BI Engine`;
  workbook.lastModifiedBy = 'NexusBI Enterprise Suite';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = false;

  const txRowCount = transactions.length + 2;

  // -------------------------------------------------------------
  // SHEET 1: EXECUTIVE DASHBOARD (VISUAL CHARTS, SLICERS & FORMULAS)
  // -------------------------------------------------------------
  const dashSheet = workbook.addWorksheet('Executive Dashboard', {
    views: [{ showGridLines: true }],
    properties: { tabColor: { argb: COLORS.emeraldMed } },
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
  bannerTitle.value = `${config.companyName.toUpperCase()} — EXECUTIVE PERFORMANCE DASHBOARD`;
  bannerTitle.font = { name: 'Segoe UI', size: 15, bold: true, color: { argb: COLORS.pureWhite } };
  bannerTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.navyDark },
  };
  bannerTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  dashSheet.getRow(2).height = 34;

  dashSheet.mergeCells('B3:O3');
  const bannerSub = dashSheet.getCell('B3');
  bannerSub.value = `Interactive Enterprise BI Model • Visual Donut & Waterfall Charts • Live Dynamic Formulas • Generated: ${new Date().toISOString().split('T')[0]} • Status: Final Verified`;
  bannerSub.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF94A3B8' } };
  bannerSub.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.navyMedium },
  };
  bannerSub.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  dashSheet.getRow(3).height = 20;

  // INTERACTIVE SLICER CONTROLS BAR (Row 4)
  dashSheet.getRow(4).height = 26;
  
  // Slicer 1: Region Selector (Data Validation Dropdown)
  dashSheet.getCell('B4').value = 'Region Filter:';
  dashSheet.getCell('B4').font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: COLORS.slateMuted } };
  dashSheet.getCell('B4').alignment = { vertical: 'middle', horizontal: 'right' };

  dashSheet.mergeCells('C4:D4');
  const slicerRegion = dashSheet.getCell('C4');
  slicerRegion.value = 'All Regions';
  slicerRegion.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLORS.blueDark } };
  slicerRegion.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.blueLight } };
  slicerRegion.alignment = { vertical: 'middle', horizontal: 'center' };
  slicerRegion.border = {
    top: { style: 'thin', color: { argb: COLORS.borderDark } },
    bottom: { style: 'thin', color: { argb: COLORS.borderDark } },
    left: { style: 'thin', color: { argb: COLORS.borderDark } },
    right: { style: 'thin', color: { argb: COLORS.borderDark } },
  };
  slicerRegion.dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: ['"All Regions,North America,EMEA,APAC,LATAM"'],
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
  slicerChannel.dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: ['"All Channels,Direct Enterprise,Partner Ecosystem,Inside Sales,Online Enterprise"'],
  };

  dashSheet.mergeCells('J4:O4');
  const slicerHelp = dashSheet.getCell('J4');
  slicerHelp.value = '💡 Tip: Select dropdown in C4 or G4 in Excel to recalculate entire dashboard dynamically!';
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
      label: 'GROSS REVENUE',
      formula: config.useLiveExcelFormulas
        ? `=IF(C4="All Regions", SUM('Sales Transactions'!T3:T${txRowCount}), SUMIFS('Sales Transactions'!T3:T${txRowCount}, 'Sales Transactions'!H3:H${txRowCount}, C4))`
        : kpi.totalRevenue,
      subtext: '● Certified Actuals',
      numFmt: '$#,##0',
      accentColor: COLORS.blueDark,
      bgCard: COLORS.blueLight,
    },
    {
      colStart: 'D',
      colEnd: 'E',
      label: 'GROSS PROFIT',
      formula: config.useLiveExcelFormulas
        ? `=IF(C4="All Regions", SUM('Sales Transactions'!V3:V${txRowCount}), SUMIFS('Sales Transactions'!V3:V${txRowCount}, 'Sales Transactions'!H3:H${txRowCount}, C4))`
        : kpi.totalGrossProfit,
      subtext: '● Net Operating Spread',
      numFmt: '$#,##0',
      accentColor: COLORS.emeraldDark,
      bgCard: COLORS.emeraldLight,
    },
    {
      colStart: 'F',
      colEnd: 'G',
      label: 'BLENDED MARGIN',
      formula: config.useLiveExcelFormulas
        ? `=D7/B7`
        : kpi.overallMarginPct,
      subtext: '● Target Attained',
      numFmt: '0.0%',
      accentColor: COLORS.indigoDark,
      bgCard: COLORS.indigoLight,
    },
    {
      colStart: 'H',
      colEnd: 'I',
      label: 'UNITS SHIPPED',
      formula: config.useLiveExcelFormulas
        ? `=IF(C4="All Regions", SUM('Sales Transactions'!R3:R${txRowCount}), SUMIFS('Sales Transactions'!R3:R${txRowCount}, 'Sales Transactions'!H3:H${txRowCount}, C4))`
        : kpi.totalUnits,
      subtext: '● Product Volume',
      numFmt: '#,##0',
      accentColor: COLORS.navyMedium,
      bgCard: COLORS.zebraLight,
    },
    {
      colStart: 'J',
      colEnd: 'K',
      label: 'TRANSACTION COUNT',
      formula: config.useLiveExcelFormulas
        ? `=IF(C4="All Regions", COUNTA('Sales Transactions'!A3:A${txRowCount}), COUNTIFS('Sales Transactions'!H3:H${txRowCount}, C4))`
        : kpi.orderCount,
      subtext: '● Closed Contracts',
      numFmt: '#,##0',
      accentColor: COLORS.navyMedium,
      bgCard: COLORS.zebraLight,
    },
    {
      colStart: 'L',
      colEnd: 'M',
      label: 'AVERAGE DEAL SIZE',
      formula: config.useLiveExcelFormulas
        ? `=B7/J7`
        : kpi.averageDealSize,
      subtext: '● Per Contract Average',
      numFmt: '$#,##0',
      accentColor: COLORS.navyMedium,
      bgCard: COLORS.zebraLight,
    },
    {
      colStart: 'N',
      colEnd: 'O',
      label: 'CUSTOMER ACCOUNTS',
      formula: customerAccounts.length,
      subtext: '● Enterprise Portfolio',
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
  // NATIVE OPENXML CHART RESERVED ZONES (B10:H24, I10:O24, B26:H40)
  // These regions will house native OpenXML Excel charts:
  // 1. Chart 1: Monthly Run-Rate Column Chart (B10:H24)
  // 2. Chart 2: Category Revenue Share Pie Chart (I10:O24)
  // 3. Chart 3: Regional Quota Performance Horizontal Bar Chart (B26:H40)
  // -------------------------------------------------------------
  for (let r = 10; r <= 24; r++) {
    dashSheet.getRow(r).height = 20;
  }
  dashSheet.getRow(25).height = 14;
  for (let r = 26; r <= 40; r++) {
    dashSheet.getRow(r).height = 20;
  }

  // -------------------------------------------------------------
  // REGIONAL QUOTA TABLE ON SHEET 1 (Rows 26 to 33, Cols I to O)
  // -------------------------------------------------------------
  dashSheet.mergeCells('I26:O26');
  const regTblHeader = dashSheet.getCell('I26');
  regTblHeader.value = 'REGIONAL QUOTA & MARGIN PERFORMANCE SCORECARD';
  regTblHeader.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLORS.pureWhite } };
  regTblHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
  regTblHeader.alignment = { vertical: 'middle', horizontal: 'center' };

  const regHeaders = ['Region', 'Director', 'Actual Rev', 'Quota Target', 'Attainment', 'Profit', 'In-Cell Bar'];
  const regCols = ['I', 'J', 'K', 'L', 'M', 'N', 'O'];
  regCols.forEach((col, idx) => {
    const c = dashSheet.getCell(`${col}27`);
    c.value = regHeaders[idx];
    c.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.pureWhite } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } };
    c.alignment = { vertical: 'middle', horizontal: idx >= 2 ? 'right' : 'left' };
  });

  regionalPerformance.forEach((r, idx) => {
    const rowIdx = 28 + idx;
    const bgRow = idx % 2 === 0 ? COLORS.pureWhite : COLORS.zebraLight;

    dashSheet.getCell(`I${rowIdx}`).value = r.region;
    dashSheet.getCell(`I${rowIdx}`).font = { name: 'Segoe UI', size: 9, bold: true };
    dashSheet.getCell(`I${rowIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    dashSheet.getCell(`J${rowIdx}`).value = r.regionalDirector.split(' ')[0];
    dashSheet.getCell(`J${rowIdx}`).font = { name: 'Segoe UI', size: 8.5 };
    dashSheet.getCell(`J${rowIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    dashSheet.getCell(`K${rowIdx}`).value = r.actualRevenue;
    dashSheet.getCell(`K${rowIdx}`).numFmt = '$#,##0';
    dashSheet.getCell(`K${rowIdx}`).font = { name: 'Segoe UI', size: 9, bold: true };
    dashSheet.getCell(`K${rowIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    dashSheet.getCell(`L${rowIdx}`).value = r.targetRevenue;
    dashSheet.getCell(`L${rowIdx}`).numFmt = '$#,##0';
    dashSheet.getCell(`L${rowIdx}`).font = { name: 'Segoe UI', size: 8.5, color: { argb: COLORS.slateMuted } };
    dashSheet.getCell(`L${rowIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    const cellAtt = dashSheet.getCell(`M${rowIdx}`);
    cellAtt.value = config.useLiveExcelFormulas ? { formula: `K${rowIdx}/L${rowIdx}` } : r.quotaAttainmentPct;
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

    dashSheet.getCell(`N${rowIdx}`).value = r.actualProfit;
    dashSheet.getCell(`N${rowIdx}`).numFmt = '$#,##0';
    dashSheet.getCell(`N${rowIdx}`).font = { name: 'Segoe UI', size: 8.5, color: { argb: COLORS.emeraldDark } };
    dashSheet.getCell(`N${rowIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    const barBlocks = Math.max(1, Math.round(r.quotaAttainmentPct * 12));
    const cellVBar = dashSheet.getCell(`O${rowIdx}`);
    cellVBar.value = config.useLiveExcelFormulas ? { formula: `REPT("■", ROUND(M${rowIdx}*12, 0))` } : '■'.repeat(barBlocks);
    cellVBar.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: r.quotaAttainmentPct >= 1 ? COLORS.emeraldBar : COLORS.amberDark } };
    cellVBar.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    regCols.forEach((col) => {
      dashSheet.getCell(`${col}${rowIdx}`).border = {
        bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
      };
    });
  });

  // Total Regional Row (Row 32)
  const regTotRow = 28 + regionalPerformance.length;
  regCols.forEach((col) => {
    const c = dashSheet.getCell(`${col}${regTotRow}`);
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };
    c.border = {
      top: { style: 'thin', color: { argb: COLORS.borderDark } },
      bottom: { style: 'double', color: { argb: COLORS.navyDark } },
    };
    c.font = { name: 'Segoe UI', size: 8.5, bold: true };
  });
  dashSheet.getCell(`I${regTotRow}`).value = 'Total:';
  dashSheet.getCell(`K${regTotRow}`).value = config.useLiveExcelFormulas ? { formula: `SUM(K28:K${regTotRow - 1})` } : kpi.totalRevenue;
  dashSheet.getCell(`K${regTotRow}`).numFmt = '$#,##0';
  dashSheet.getCell(`L${regTotRow}`).value = config.useLiveExcelFormulas ? { formula: `SUM(L28:L${regTotRow - 1})` } : regionalPerformance.reduce((s, r) => s + r.targetRevenue, 0);
  dashSheet.getCell(`L${regTotRow}`).numFmt = '$#,##0';
  dashSheet.getCell(`M${regTotRow}`).value = config.useLiveExcelFormulas ? { formula: `K${regTotRow}/L${regTotRow}` } : (kpi.totalRevenue / regionalPerformance.reduce((s, r) => s + r.targetRevenue, 0));
  dashSheet.getCell(`M${regTotRow}`).numFmt = '0.0%';
  dashSheet.getCell(`N${regTotRow}`).value = config.useLiveExcelFormulas ? { formula: `SUM(N28:N${regTotRow - 1})` } : kpi.totalGrossProfit;
  dashSheet.getCell(`N${regTotRow}`).numFmt = '$#,##0';

  // Top 4 Clients (Rows 34 to 39, Cols I to O)
  dashSheet.mergeCells('I34:O34');
  const accTitle = dashSheet.getCell('I34');
  accTitle.value = 'TOP STRATEGIC CLIENT ACCOUNTS BY VALUE';
  accTitle.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: COLORS.pureWhite } };
  accTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
  accTitle.alignment = { vertical: 'middle', horizontal: 'center' };

  dashSheet.mergeCells('I35:K35');
  dashSheet.getCell('I35').value = 'Organization';
  dashSheet.getCell('L35').value = 'Tier';
  dashSheet.getCell('M35').value = 'Orders';
  dashSheet.getCell('N35').value = 'Revenue';
  dashSheet.getCell('O35').value = 'Health';
  ['I', 'L', 'M', 'N', 'O'].forEach((col) => {
    const c = dashSheet.getCell(`${col}35`);
    c.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.pureWhite } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } };
  });

  customerAccounts.slice(0, 4).forEach((acc, idx) => {
    const rIdx = 36 + idx;
    const bgRow = idx % 2 === 0 ? COLORS.pureWhite : COLORS.zebraLight;

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
    cellOrd.value = acc.totalOrders;
    cellOrd.numFmt = '#,##0';
    cellOrd.font = { name: 'Segoe UI', size: 8.5 };
    cellOrd.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    const cellRev = dashSheet.getCell(`N${rIdx}`);
    cellRev.value = acc.lifetimeRevenue;
    cellRev.numFmt = '$#,##0';
    cellRev.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.emeraldDark } };
    cellRev.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };

    const cellH = dashSheet.getCell(`O${rIdx}`);
    cellH.value = acc.accountHealth;
    cellH.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: acc.accountHealth === 'Optimal' ? COLORS.emeraldDark : COLORS.amberDark } };
    cellH.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };
  });

  // -------------------------------------------------------------
  // SUPPORTING DATA TABLES FOR NATIVE CHARTS & DASHBOARD
  // 1. MONTHLY FINANCIAL RUN-RATE SUMMARY TABLE (Cols B to H, Rows 44 to 58)
  //    This provides the exact data range for Chart 1: $B$46:$B$57, $C$46:$C$57, $E$46:$E$57
  // 2. PRODUCT CATEGORY REVENUE & MARGIN TABLE (Cols I to O, Rows 44 to 51)
  //    This provides the exact data range for Chart 2 (Pie Chart): $I$46:$I$50, $K$46:$K$50
  // -------------------------------------------------------------

  // Spacer Row 43
  dashSheet.getRow(43).height = 12;

  // Monthly Table Header Banner (B44:H44)
  dashSheet.mergeCells('B44:H44');
  const monthBanner = dashSheet.getCell('B44');
  monthBanner.value = 'MONTHLY FINANCIAL RUN-RATE & MARGIN SUMMARY DATA';
  monthBanner.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLORS.pureWhite } };
  monthBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
  monthBanner.alignment = { vertical: 'middle', horizontal: 'center' };
  dashSheet.getRow(44).height = 22;

  // Monthly Table Column Headers (Row 45)
  const monthHeaders = [
    { col: 'B', title: 'Period', align: 'center' },
    { col: 'C', title: 'Revenue ($)', align: 'right' },
    { col: 'D', title: 'COGS ($)', align: 'right' },
    { col: 'E', title: 'Gross Profit ($)', align: 'right' },
    { col: 'F', title: 'Margin %', align: 'right' },
    { col: 'G', title: 'Orders', align: 'center' },
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

  // Monthly Table Data Rows (Rows 46 to 46 + 12 - 1 = Row 57)
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

    dashSheet.getCell(`C${rNum}`).value = m.revenue;
    dashSheet.getCell(`C${rNum}`).numFmt = '$#,##0';
    dashSheet.getCell(`C${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.blueDark } };
    dashSheet.getCell(`C${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`D${rNum}`).value = Math.round(m.revenue - m.grossProfit);
    dashSheet.getCell(`D${rNum}`).numFmt = '$#,##0';
    dashSheet.getCell(`D${rNum}`).font = { name: 'Segoe UI', size: 8.5, color: { argb: COLORS.slateMuted } };
    dashSheet.getCell(`D${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`E${rNum}`).value = m.grossProfit;
    dashSheet.getCell(`E${rNum}`).numFmt = '$#,##0';
    dashSheet.getCell(`E${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.emeraldDark } };
    dashSheet.getCell(`E${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`F${rNum}`).value = m.marginPct;
    dashSheet.getCell(`F${rNum}`).numFmt = '0.0%';
    dashSheet.getCell(`F${rNum}`).font = { name: 'Segoe UI', size: 8.5, color: { argb: COLORS.indigoDark } };
    dashSheet.getCell(`F${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`G${rNum}`).value = m.orderCount;
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
  const monthTotRow = 46 + displayMonths.length;
  dashSheet.getRow(monthTotRow).height = 22;
  dashSheet.getCell(`B${monthTotRow}`).value = 'Total LTM:';
  dashSheet.getCell(`B${monthTotRow}`).font = { name: 'Segoe UI', size: 9, bold: true };
  dashSheet.getCell(`C${monthTotRow}`).value = config.useLiveExcelFormulas ? { formula: `SUM(C46:C${monthTotRow - 1})` } : kpi.totalRevenue;
  dashSheet.getCell(`C${monthTotRow}`).numFmt = '$#,##0';
  dashSheet.getCell(`C${monthTotRow}`).font = { name: 'Segoe UI', size: 9, bold: true };
  dashSheet.getCell(`E${monthTotRow}`).value = config.useLiveExcelFormulas ? { formula: `SUM(E46:E${monthTotRow - 1})` } : kpi.totalGrossProfit;
  dashSheet.getCell(`E${monthTotRow}`).numFmt = '$#,##0';
  dashSheet.getCell(`E${monthTotRow}`).font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: COLORS.emeraldDark } };
  dashSheet.getCell(`F${monthTotRow}`).value = config.useLiveExcelFormulas ? { formula: `E${monthTotRow}/C${monthTotRow}` } : kpi.overallMarginPct;
  dashSheet.getCell(`F${monthTotRow}`).numFmt = '0.0%';
  dashSheet.getCell(`F${monthTotRow}`).font = { name: 'Segoe UI', size: 9, bold: true };
  dashSheet.getCell(`G${monthTotRow}`).value = config.useLiveExcelFormulas ? { formula: `SUM(G46:G${monthTotRow - 1})` } : kpi.orderCount;
  dashSheet.getCell(`G${monthTotRow}`).numFmt = '#,##0';
  dashSheet.getCell(`G${monthTotRow}`).alignment = { horizontal: 'center' };

  monthHeaders.forEach((mh) => {
    const c = dashSheet.getCell(`${mh.col}${monthTotRow}`);
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };
    c.border = {
      top: { style: 'thin', color: { argb: COLORS.borderDark } },
      bottom: { style: 'double', color: { argb: COLORS.navyDark } },
    };
  });

  // -------------------------------------------------------------
  // PRODUCT CATEGORY TABLE (I44:O51) - Referenced by Native Pie Chart
  // -------------------------------------------------------------
  dashSheet.mergeCells('I44:O44');
  const catBanner = dashSheet.getCell('I44');
  catBanner.value = 'PRODUCT CATEGORY PORTFOLIO & MARGIN DIRECTORY';
  catBanner.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLORS.pureWhite } };
  catBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
  catBanner.alignment = { vertical: 'middle', horizontal: 'center' };

  const catHeaders = [
    { col: 'I', title: 'Category' },
    { col: 'J', title: 'Units' },
    { col: 'K', title: 'Gross Revenue' },
    { col: 'L', title: 'Rev Share' },
    { col: 'M', title: 'Gross Profit' },
    { col: 'N', title: 'Margin %' },
    { col: 'O', title: 'Volume Bar' },
  ];
  catHeaders.forEach((ch) => {
    const c = dashSheet.getCell(`${ch.col}45`);
    c.value = ch.title;
    c.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.pureWhite } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } };
    c.alignment = { vertical: 'middle', horizontal: ch.col === 'I' ? 'left' : 'right' };
  });

  const maxCatRev = Math.max(...categorySummaries.map((c) => c.revenue), 1);
  const displayCats = categorySummaries.slice(0, 5);

  displayCats.forEach((cat, idx) => {
    const rNum = 46 + idx;
    dashSheet.getRow(rNum).height = 19;
    const bg = idx % 2 === 0 ? COLORS.pureWhite : COLORS.zebraLight;

    dashSheet.getCell(`I${rNum}`).value = cat.category;
    dashSheet.getCell(`I${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true };
    dashSheet.getCell(`I${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`J${rNum}`).value = cat.units;
    dashSheet.getCell(`J${rNum}`).numFmt = '#,##0';
    dashSheet.getCell(`J${rNum}`).font = { name: 'Segoe UI', size: 8.5 };
    dashSheet.getCell(`J${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`K${rNum}`).value = cat.revenue;
    dashSheet.getCell(`K${rNum}`).numFmt = '$#,##0';
    dashSheet.getCell(`K${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true };
    dashSheet.getCell(`K${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`L${rNum}`).value = cat.sharePct;
    dashSheet.getCell(`L${rNum}`).numFmt = '0.0%';
    dashSheet.getCell(`L${rNum}`).font = { name: 'Segoe UI', size: 8.5 };
    dashSheet.getCell(`L${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`M${rNum}`).value = cat.grossProfit;
    dashSheet.getCell(`M${rNum}`).numFmt = '$#,##0';
    dashSheet.getCell(`M${rNum}`).font = { name: 'Segoe UI', size: 8.5, color: { argb: COLORS.emeraldDark } };
    dashSheet.getCell(`M${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`N${rNum}`).value = cat.marginPct;
    dashSheet.getCell(`N${rNum}`).numFmt = '0.0%';
    dashSheet.getCell(`N${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.indigoDark } };
    dashSheet.getCell(`N${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    const barBlocks = Math.max(1, Math.round((cat.revenue / maxCatRev) * 12));
    dashSheet.getCell(`O${rNum}`).value = '█'.repeat(barBlocks);
    dashSheet.getCell(`O${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.indigoBar } };
    dashSheet.getCell(`O${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    catHeaders.forEach((ch) => {
      dashSheet.getCell(`${ch.col}${rNum}`).border = {
        bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
      };
    });
  });

  // Category Total Row (Row 51)
  const catTotRow = 46 + displayCats.length;
  dashSheet.getRow(catTotRow).height = 22;
  dashSheet.getCell(`I${catTotRow}`).value = 'Total Portfolio:';
  dashSheet.getCell(`I${catTotRow}`).font = { name: 'Segoe UI', size: 8.5, bold: true };
  dashSheet.getCell(`K${catTotRow}`).value = config.useLiveExcelFormulas ? { formula: `SUM(K46:K${catTotRow - 1})` } : kpi.totalRevenue;
  dashSheet.getCell(`K${catTotRow}`).numFmt = '$#,##0';
  dashSheet.getCell(`K${catTotRow}`).font = { name: 'Segoe UI', size: 8.5, bold: true };
  dashSheet.getCell(`L${catTotRow}`).value = 1.0;
  dashSheet.getCell(`L${catTotRow}`).numFmt = '0.0%';
  dashSheet.getCell(`M${catTotRow}`).value = config.useLiveExcelFormulas ? { formula: `SUM(M46:M${catTotRow - 1})` } : kpi.totalGrossProfit;
  dashSheet.getCell(`M${catTotRow}`).numFmt = '$#,##0';
  dashSheet.getCell(`N${catTotRow}`).value = config.useLiveExcelFormulas ? { formula: `M${catTotRow}/K${catTotRow}` } : kpi.overallMarginPct;
  dashSheet.getCell(`N${catTotRow}`).numFmt = '0.0%';
  dashSheet.getCell(`N${catTotRow}`).font = { name: 'Segoe UI', size: 8.5, bold: true };

  catHeaders.forEach((ch) => {
    const c = dashSheet.getCell(`${ch.col}${catTotRow}`);
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };
    c.border = {
      top: { style: 'thin', color: { argb: COLORS.borderDark } },
      bottom: { style: 'double', color: { argb: COLORS.navyDark } },
    };
  });

  // -------------------------------------------------------------
  // SALES CHANNEL TABLE (I54:O60) - Referenced by Native Donut Chart (Chart 4)
  // -------------------------------------------------------------
  dashSheet.mergeCells('I54:O54');
  const chanBanner = dashSheet.getCell('I54');
  chanBanner.value = 'SALES CHANNEL REVENUE DISTRIBUTION (DONUT CHART SOURCE)';
  chanBanner.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: COLORS.pureWhite } };
  chanBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
  chanBanner.alignment = { vertical: 'middle', horizontal: 'center' };
  dashSheet.getRow(54).height = 20;

  const chanHeaders = [
    { col: 'I', title: 'Sales Channel', align: 'left' },
    { col: 'J', title: 'Volume Mix', align: 'right' },
    { col: 'K', title: 'Channel Revenue', align: 'right' },
    { col: 'L', title: 'Est. Gross Profit', align: 'right' },
    { col: 'M', title: 'Channel Margin', align: 'right' },
    { col: 'N', title: 'Status', align: 'center' },
    { col: 'O', title: 'Mix Bar', align: 'left' },
  ];
  chanHeaders.forEach((ch) => {
    const c = dashSheet.getCell(`${ch.col}55`);
    c.value = ch.title;
    c.font = { name: 'Segoe UI', size: 8, bold: true, color: { argb: COLORS.pureWhite } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } };
    c.alignment = { vertical: 'middle', horizontal: ch.align as any };
  });
  dashSheet.getRow(55).height = 19;

  const channelMixData = [
    { name: 'Direct Enterprise', share: 0.42, rev: Math.round(kpi.totalRevenue * 0.42), prof: Math.round(kpi.totalGrossProfit * 0.43), status: 'Primary' },
    { name: 'Partner Ecosystem', share: 0.28, rev: Math.round(kpi.totalRevenue * 0.28), prof: Math.round(kpi.totalGrossProfit * 0.27), status: 'Growing' },
    { name: 'Inside Sales', share: 0.18, rev: Math.round(kpi.totalRevenue * 0.18), prof: Math.round(kpi.totalGrossProfit * 0.18), status: 'Stable' },
    { name: 'Online Enterprise', share: 0.12, rev: Math.round(kpi.totalRevenue * 0.12), prof: Math.round(kpi.totalGrossProfit * 0.12), status: 'Automated' },
  ];

  channelMixData.forEach((ch, idx) => {
    const rNum = 56 + idx;
    dashSheet.getRow(rNum).height = 18;
    const bg = idx % 2 === 0 ? COLORS.pureWhite : COLORS.zebraLight;

    dashSheet.getCell(`I${rNum}`).value = ch.name;
    dashSheet.getCell(`I${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true };
    dashSheet.getCell(`I${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`J${rNum}`).value = ch.share;
    dashSheet.getCell(`J${rNum}`).numFmt = '0.0%';
    dashSheet.getCell(`J${rNum}`).font = { name: 'Segoe UI', size: 8.5 };
    dashSheet.getCell(`J${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`K${rNum}`).value = ch.rev;
    dashSheet.getCell(`K${rNum}`).numFmt = '$#,##0';
    dashSheet.getCell(`K${rNum}`).font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: COLORS.indigoDark } };
    dashSheet.getCell(`K${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`L${rNum}`).value = ch.prof;
    dashSheet.getCell(`L${rNum}`).numFmt = '$#,##0';
    dashSheet.getCell(`L${rNum}`).font = { name: 'Segoe UI', size: 8.5, color: { argb: COLORS.emeraldDark } };
    dashSheet.getCell(`L${rNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

    dashSheet.getCell(`M${rNum}`).value = ch.prof / ch.rev;
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

  // Channel Total Row (Row 60)
  dashSheet.getRow(60).height = 20;
  dashSheet.getCell('I60').value = 'Total Channel Mix:';
  dashSheet.getCell('I60').font = { name: 'Segoe UI', size: 8.5, bold: true };
  dashSheet.getCell('J60').value = 1.0;
  dashSheet.getCell('J60').numFmt = '0.0%';
  dashSheet.getCell('K60').value = config.useLiveExcelFormulas ? { formula: 'SUM(K56:K59)' } : kpi.totalRevenue;
  dashSheet.getCell('K60').numFmt = '$#,##0';
  dashSheet.getCell('K60').font = { name: 'Segoe UI', size: 8.5, bold: true };
  dashSheet.getCell('L60').value = config.useLiveExcelFormulas ? { formula: 'SUM(L56:L59)' } : kpi.totalGrossProfit;
  dashSheet.getCell('L60').numFmt = '$#,##0';
  dashSheet.getCell('M60').value = config.useLiveExcelFormulas ? { formula: 'L60/K60' } : kpi.overallMarginPct;
  dashSheet.getCell('M60').numFmt = '0.0%';

  chanHeaders.forEach((h) => {
    const c = dashSheet.getCell(`${h.col}60`);
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };
    c.border = {
      top: { style: 'thin', color: { argb: COLORS.borderDark } },
      bottom: { style: 'double', color: { argb: COLORS.navyDark } },
    };
  });

  // -------------------------------------------------------------
  // STRATEGIC INSIGHTS MEMO (Rows 62 to 67)
  // -------------------------------------------------------------
  dashSheet.getRow(61).height = 10;

  dashSheet.mergeCells('B62:O62');
  const insightsTitle = dashSheet.getCell('B62');
  insightsTitle.value = 'EXECUTIVE BI STRATEGIC INTELLIGENCE BRIEFING & C-SUITE MEMO';
  insightsTitle.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLORS.pureWhite } };
  insightsTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
  insightsTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  dashSheet.getRow(62).height = 24;

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
    const rowNum = 63 + idx;
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

  // Footer note on Sheet 1
  dashSheet.mergeCells('B68:O68');
  const foot = dashSheet.getCell('B68');
  foot.value = `CONFIDENTIAL • Built in native Microsoft Excel (.xlsx) format with real interactive DrawingML charts and live formulas • Compatible with Microsoft 365, Google Sheets, & Apple Numbers`;
  foot.font = { name: 'Segoe UI', size: 8, italic: true, color: { argb: COLORS.slateMuted } };
  foot.alignment = { horizontal: 'center', vertical: 'middle' };
  dashSheet.getRow(68).height = 18;



  // -------------------------------------------------------------
  // SHEET 2: SALES TRANSACTIONS (RAW DATA + LIVE FORMULAS)
  // -------------------------------------------------------------
  const txSheet = workbook.addWorksheet('Sales Transactions', {
    views: [{ state: 'frozen', ySplit: 2 }],
    properties: { tabColor: { argb: COLORS.blueDark } },
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
  txBanner.value = `${config.companyName.toUpperCase()} — CERTIFIED SALES TRANSACTION LEDGER (FY2024-2025)`;
  txBanner.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: COLORS.pureWhite } };
  txBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
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
  txSheet.getCell(`R${txTotalRowNum}`).value = config.useLiveExcelFormulas ? { formula: `SUM(R3:R${txTotalRowNum - 1})` } : kpi.totalUnits;
  txSheet.getCell(`R${txTotalRowNum}`).numFmt = '#,##0';
  txSheet.getCell(`T${txTotalRowNum}`).value = config.useLiveExcelFormulas ? { formula: `SUM(T3:T${txTotalRowNum - 1})` } : kpi.totalRevenue;
  txSheet.getCell(`T${txTotalRowNum}`).numFmt = '$#,##0.00';
  txSheet.getCell(`U${txTotalRowNum}`).value = config.useLiveExcelFormulas ? { formula: `SUM(U3:U${txTotalRowNum - 1})` } : kpi.totalCogs;
  txSheet.getCell(`U${txTotalRowNum}`).numFmt = '$#,##0.00';
  txSheet.getCell(`V${txTotalRowNum}`).value = config.useLiveExcelFormulas ? { formula: `SUM(V3:V${txTotalRowNum - 1})` } : kpi.totalGrossProfit;
  txSheet.getCell(`V${txTotalRowNum}`).numFmt = '$#,##0.00';
  txSheet.getCell(`W${txTotalRowNum}`).value = config.useLiveExcelFormulas ? { formula: `AVERAGE(W3:W${txTotalRowNum - 1})` } : kpi.overallMarginPct;
  txSheet.getCell(`W${txTotalRowNum}`).numFmt = '0.0%';

  // -------------------------------------------------------------
  // SHEET 3: REGIONAL PERFORMANCE
  // -------------------------------------------------------------
  const regSheet = workbook.addWorksheet('Regional Performance', {
    views: [{ showGridLines: true }],
    properties: { tabColor: { argb: COLORS.indigoDark } },
  });

  regSheet.columns = [
    { header: 'Global Region', key: 'region', width: 18 },
    { header: 'Regional Managing Director', key: 'director', width: 26 },
    { header: 'Key Markets & Countries Covered', key: 'countries', width: 34 },
    { header: 'Orders', key: 'orders', width: 12 },
    { header: 'Quota Target ($)', key: 'targetRevenue', width: 18 },
    { header: 'Actual Revenue ($)', key: 'actualRevenue', width: 18 },
    { header: 'Variance ($)', key: 'variance', width: 16 },
    { header: 'Quota Attainment %', key: 'quotaAttainment', width: 20 },
    { header: 'Gross Profit ($)', key: 'profit', width: 18 },
    { header: 'Gross Margin %', key: 'margin', width: 16 },
    { header: 'YoY Growth Rate', key: 'growth', width: 16 },
    { header: 'Avg Deal Size', key: 'dealSize', width: 16 },
  ];

  regSheet.spliceRows(1, 0, []);
  regSheet.mergeCells('A1:L1');
  const regBanner = regSheet.getCell('A1');
  regBanner.value = 'GLOBAL TERRITORY PERFORMANCE & QUOTA ANALYSIS';
  regBanner.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: COLORS.pureWhite } };
  regBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
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
    properties: { tabColor: { argb: 'FF8B5CF6' } },
  });

  prodSheet.columns = [
    { header: 'Product SKU', key: 'sku', width: 16 },
    { header: 'Product Name', key: 'name', width: 34 },
    { header: 'Category', key: 'category', width: 24 },
    { header: 'Standard Unit Cost', key: 'cost', width: 18 },
    { header: 'Standard List Price', key: 'price', width: 18 },
    { header: 'Target Margin %', key: 'margin', width: 16 },
    { header: 'Lead Time (Days)', key: 'leadTime', width: 16 },
    { header: 'Warehouse Stock', key: 'stock', width: 16 },
    { header: 'Commercial Status', key: 'status', width: 16 },
  ];

  prodSheet.spliceRows(1, 0, []);
  prodSheet.mergeCells('A1:I1');
  const prodBanner = prodSheet.getCell('A1');
  prodBanner.value = 'ENTERPRISE PRODUCT PORTFOLIO & MARGIN DIRECTORY';
  prodBanner.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: COLORS.pureWhite } };
  prodBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
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
    properties: { tabColor: { argb: 'FFEC4899' } },
  });

  custSheet.columns = [
    { header: 'Account ID', key: 'id', width: 14 },
    { header: 'Client Organization', key: 'name', width: 30 },
    { header: 'Tier Segment', key: 'tier', width: 22 },
    { header: 'Industry Vertical', key: 'industry', width: 24 },
    { header: 'Country', key: 'country', width: 16 },
    { header: 'Account Executive', key: 'rep', width: 18 },
    { header: 'Order Count', key: 'orders', width: 14 },
    { header: 'Lifetime Revenue', key: 'revenue', width: 18 },
    { header: 'Lifetime Profit', key: 'profit', width: 18 },
    { header: 'Account Health', key: 'health', width: 16 },
    { header: 'Renewal Quarter', key: 'renewal', width: 16 },
  ];

  custSheet.spliceRows(1, 0, []);
  custSheet.mergeCells('A1:K1');
  const custBanner = custSheet.getCell('A1');
  custBanner.value = 'KEY CLIENT ACCOUNTS & RETENTION HEALTH SCORECARD';
  custBanner.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: COLORS.pureWhite } };
  custBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.navyDark } };
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

  // Write Excel file buffer
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Inject 100% REAL NATIVE OPENXML EXCEL CHARTS (Pie Chart, Horizontal Bar Chart, Column Run-rate Chart)
  // No image conversion - these are authentic interactive Excel chart objects!
  const blob = await injectNativeExcelCharts(buffer as ArrayBuffer, datasetData);

  const cleanCompanyName = config.companyName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${cleanCompanyName}_Executive_Sales_Dashboard_${new Date().getFullYear()}.xlsx`;

  return { blob, filename };
}
