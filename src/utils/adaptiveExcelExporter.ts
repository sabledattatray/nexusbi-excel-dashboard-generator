import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { AppDataset, DatasetConfig } from '../types/dataset';
import { AnalysisChart, AnalysisSelection, analyzeDataset } from './adaptiveAnalysis';
import { DOMAIN_SPECS, groupRows, metricValue, Row } from './domainDatasets';
import { getIndustryTheme } from './industryTheme';
import { WORKBOOK_PROTECTION_PASSWORD } from './excelExporter';
const xml = (value: unknown) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]!));
export async function exportAdaptiveExcel(
  data: AppDataset,
  config: DatasetConfig,
  selection?: AnalysisSelection,
  industryOverview = false,
  options?: { unprotected?: boolean }
): Promise<{ blob: Blob; filename: string }> {
  const analysis = analyzeDataset(data, selection);
  const theme = getIndustryTheme(data.schemaProfile?.detectedIndustry || config.industry);
  const spec = industryOverview ? DOMAIN_SPECS[config.industry] : undefined;
  if (spec) {
    analysis.metricLabel = spec.metrics[0].label;
    analysis.total = metricValue(data.rawRows as Row[], spec.metrics[0]);
    analysis.charts = spec.charts.map(chart => ({ title: chart.title, kind: chart.dimension === spec.date ? 'line' : chart.kind === 'donut' ? 'composition' : 'bar', points: groupRows(data.rawRows as Row[], chart.dimension, chart.metric, chart.dimension === spec.date), note: `${chart.metric.label}: ${chart.metric.operation === 'ratio' ? `SUM(${chart.metric.field}) / SUM(${chart.metric.denominator})` : `${chart.metric.operation}(${chart.metric.field || 'records'})`}. Excel chart shows the grouped summary by ${chart.dimension}. ${spec.grain}. Illustrative sample data.` } as AnalysisChart));
  }
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Excel to Dashboards by Datta Sable (excel.dattasable.com)';
  const dashboard = workbook.addWorksheet('Dashboard', {
    views: [{ showGridLines: false }],
    properties: { tabColor: { argb: theme.colors.excel.tabColor } },
  });
  dashboard.columns = Array.from({ length: 16 }, () => ({ width: 13 }));
  dashboard.mergeCells('B2:O3'); dashboard.getCell('B2').value = config.reportTitle;
  dashboard.getCell('B2').font = { size: 20, bold: true, color: { argb: theme.colors.excel.headerText || 'FFFFFFFF' } };
  dashboard.getCell('B2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: theme.colors.excel.headerFill } };
  dashboard.mergeCells('B5:O5'); dashboard.getCell('B5').value = `${analysis.metricLabel} • ${analysis.rows.length} original records • Source units preserved`;
  dashboard.mergeCells('B7:G7'); dashboard.getCell('B7').value = analysis.metricLabel;
  dashboard.mergeCells('B8:G9'); dashboard.getCell('B8').value = analysis.total;
  dashboard.getCell('B8').font = { size: 28, bold: true, color: { argb: theme.colors.excel.border || theme.colors.excel.tabColor } };
  dashboard.getCell('B8').numFmt = analysis.metric?.dataType === 'percentage' && analysis.aggregation !== 'count' ? '0.00%' : '#,##0.00';
  dashboard.mergeCells('I7:O7'); dashboard.getCell('I7').value = 'Missing / invalid measure values';
  dashboard.mergeCells('I8:O9'); dashboard.getCell('I8').value = analysis.missingMetric;
  dashboard.mergeCells('B11:O11'); dashboard.getCell('B11').value = 'No synthetic targets, forecasts, sales channels, or margins. Summary values are a snapshot of the source at export.';
  if (spec) {
    dashboard.getCell('B11').value = 'Illustrative industry sample. KPIs and chart summaries are calculated from Source Data. Export includes every record; dashboard filters are screen only.';
    dashboard.getCell('B8').numFmt = spec.metrics[0].format === 'percent' ? '0.0%' : '#,##0.00';
    const metrics = workbook.addWorksheet('Business Metrics');
    metrics.columns = [{width:34},{width:22},{width:65}];
    metrics.addRow(['Business KPI','Value','Calculation / record grain']);
    spec.metrics.forEach(metric => metrics.addRow([metric.label, metricValue(data.rawRows as Row[], metric), metric.operation === 'ratio' ? `SUM(${metric.field}) / SUM(${metric.denominator})` : `${metric.operation}(${metric.field || 'records'})`]));
    dashboard.getCell('I7').value = spec.metrics[1].label;
    dashboard.getCell('I8').value = metricValue(data.rawRows as Row[], spec.metrics[1]);
    dashboard.getCell('I8').numFmt = spec.metrics[1].format === 'percent' ? '0.0%' : '#,##0.00';
  }
  const source = workbook.addWorksheet('Source Data', { views: [{ state: 'frozen', ySplit: 1 }] });
  const headers = data.originalHeaders || [];
  source.addRow(headers);
  for (const row of data.rawRows || []) source.addRow(headers.map(h => {
    const value = row[h];
    // Strings stay strings, including values beginning with =, +, - or @.
    return value instanceof Date ? value : value == null ? null : typeof value === 'number' || typeof value === 'boolean' ? value : String(value);
  }));
  if (spec && config.useLiveExcelFormulas) {
    const range = (field: string) => { const column = source.getColumn(headers.indexOf(field)+1).letter; return `'Source Data'!${column}2:${column}${source.rowCount}`; };
    const metrics = workbook.getWorksheet('Business Metrics')!;
    spec.metrics.forEach((metric, i) => {
      const formula = metric.operation === 'count' ? `COUNTA(${range('Record ID')})` : metric.operation === 'ratio' ? `IFERROR(SUM(${range(metric.field!)})/SUM(${range(metric.denominator!)}),0)` : `${metric.operation === 'average' ? 'AVERAGE' : 'SUM'}(${range(metric.field!)})`;
      metrics.getCell(i+2,2).value = {formula,result:metricValue(data.rawRows as Row[],metric)};
      metrics.getCell(i+2,2).numFmt = metric.format === 'percent' ? '0.0%' : '#,##0.00';
      if (i < 2) dashboard.getCell(i === 0 ? 'B8' : 'I8').value = {formula:`'Business Metrics'!B${i+2}`,result:metricValue(data.rawRows as Row[],metric)};
    });
  }
  source.columns.forEach(c => c.width = 23);
  if (headers.length) source.autoFilter = { from: { row: 1, column: 1 }, to: { row: source.rowCount, column: headers.length } };
  const summary = workbook.addWorksheet('Analysis');
  summary.columns = [{ width: 42 }, { width: 24 }, { width: 20 }];
  const ranges: { start: number; end: number }[] = [];
  for (const chart of analysis.charts) {
    summary.addRow([chart.title]);
    summary.addRow(['Source group', spec ? spec.charts[analysis.charts.indexOf(chart)].metric.label : chart.kind === 'distribution' ? 'Record count' : analysis.metricLabel, 'Records']);
    const start = summary.rowCount + 1;
    chart.points.forEach(point => summary.addRow([point.label, point.value, point.count]));
    const end = summary.rowCount;
    if (start <= end) ranges.push({ start, end }); else ranges.push({ start: 0, end: 0 });
    summary.addRow([chart.note]); summary.addRow([]);
  }
  const quality = workbook.addWorksheet('Field Verification');
  quality.addRow(['Source field', 'Detected type', 'Distinct', 'Missing', 'Invalid']);
  analysis.quality.forEach(c => quality.addRow([c.name, c.dataType, c.distinctCount, c.missing, c.invalid]));
  quality.addRow([]); quality.addRow(['Exact duplicate rows (retained)', analysis.duplicateRows]);
  quality.addRow(['Invalid/missing dates excluded from trend', analysis.invalidDates]);
  quality.addRow(['Calculation', analysis.aggregation]); quality.addRow(['Measure', analysis.metric?.name || 'Record count']);
  quality.addRow(['Grouping field', selection?.dimension || data.schemaProfile?.primaryCategory || 'None']);
  quality.columns.forEach(c => c.width = 28);
  for (const sheet of workbook.worksheets) {
    if (sheet === dashboard) continue;
    sheet.getRow(1).font = { bold: true, color: { argb: theme.colors.excel.headerText || 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: theme.colors.excel.headerFill } };
    sheet.eachRow((row, n) => { if (n > 1 && n % 2 === 0) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }; });
  }
  if (!options?.unprotected) {
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
  } else {
    for (const sheet of workbook.worksheets) {
      sheet.views = sheet.views.length
        ? sheet.views.map(view => ({ ...view, showGridLines: false }))
        : [{ showGridLines: false }];
    }
  }

  const zip = await JSZip.loadAsync(await workbook.xlsx.writeBuffer());

  if (!options?.unprotected) {
    for (let sIdx = 1; sIdx <= 10; sIdx++) {
      const sPath = `xl/worksheets/sheet${sIdx}.xml`;
      let sContent = await zip.file(sPath)?.async('string');
      if (sContent && sContent.includes('<sheetProtection')) {
        sContent = sContent.replace(/<sheetProtection\b([^>]*)\/>/, (_match, attrs) => {
          const algo = attrs.match(/algorithmName="([^"]+)"/)?.[1] || 'SHA-512';
          const hash = attrs.match(/hashValue="([^"]+)"/)?.[1] || '';
          const salt = attrs.match(/saltValue="([^"]+)"/)?.[1] || '';
          const spin = attrs.match(/spinCount="([^"]+)"/)?.[1] || '100000';
          return `<sheetProtection sheet="1" objects="1" scenarios="1" formatCells="1" formatColumns="1" formatRows="1" insertColumns="1" insertRows="1" insertHyperlinks="1" deleteColumns="1" deleteRows="1" selectLockedCells="1" selectUnlockedCells="0" sort="0" autoFilter="0" pivotTables="0" algorithmName="${algo}" hashValue="${hash}" saltValue="${salt}" spinCount="${spin}"/>`;
        });
        zip.file(sPath, sContent);
      }
    }
    let wbXml = await zip.file('xl/workbook.xml')?.async('string');
    const sheet1ForProt = await zip.file('xl/worksheets/sheet1.xml')?.async('string');
    if (wbXml && sheet1ForProt && !wbXml.includes('<workbookProtection')) {
      const algo = sheet1ForProt.match(/algorithmName="([^"]+)"/)?.[1] || 'SHA-512';
      const hash = sheet1ForProt.match(/hashValue="([^"]+)"/)?.[1] || '';
      const salt = sheet1ForProt.match(/saltValue="([^"]+)"/)?.[1] || '';
      const spin = sheet1ForProt.match(/spinCount="([^"]+)"/)?.[1] || '100000';
      if (hash && salt) {
        const wbProt = `<workbookProtection lockStructure="1" lockWindows="0" algorithmName="${algo}" hashValue="${hash}" saltValue="${salt}" spinCount="${spin}"/>`;
        wbXml = wbXml.replace('<sheets>', `${wbProt}<sheets>`);
        zip.file('xl/workbook.xml', wbXml);
      }
    }
  } else {
    for (let sIdx = 1; sIdx <= 10; sIdx++) {
      const sPath = `xl/worksheets/sheet${sIdx}.xml`;
      let sContent = await zip.file(sPath)?.async('string');
      if (sContent && sContent.includes('<sheetProtection')) {
        sContent = sContent.replace(/<sheetProtection\b[^>]*\/>/g, '');
        zip.file(sPath, sContent);
      }
    }
    let wbXml = await zip.file('xl/workbook.xml')?.async('string');
    if (wbXml && wbXml.includes('<workbookProtection')) {
      wbXml = wbXml.replace(/<workbookProtection\b[^>]*\/>/g, '');
      zip.file('xl/workbook.xml', wbXml);
    }
  }
  // ExcelJS emits font children in property-map order. Put them in the order
  // accepted by SpreadsheetML/Excel before packaging the added chart parts.
  const fontOrder = ['b', 'i', 'strike', 'condense', 'extend', 'outline', 'shadow', 'u', 'vertAlign', 'sz', 'color', 'name', 'family', 'charset', 'scheme'];
  const stylesXML = await zip.file('xl/styles.xml')!.async('string');
  zip.file('xl/styles.xml', stylesXML.replace(/<font>([\s\S]*?)<\/font>/g, (_font, content: string) => {
    const elements = content.match(/<[A-Za-z]+\b[^>]*?\/>/g) || [];
    const rank = (element: string) => { const index = fontOrder.indexOf(element.match(/^<([A-Za-z]+)/)![1]); return index < 0 ? fontOrder.length : index; };
    return `<font>${elements.sort((a, b) => rank(a) - rank(b)).join('')}</font>`;
  }));
  if (config.includeChartsInExcel && analysis.charts.length) {
    const relNS = 'http://schemas.openxmlformats.org/package/2006/relationships';
    const drawingNS = 'http://schemas.openxmlformats.org/drawingml/2006/main';
    let drawing = `<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="${drawingNS}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">`;
    let relationships = `<Relationships xmlns="${relNS}">`;
    let types = await zip.file('[Content_Types].xml')!.async('string');
    analysis.charts.forEach((chart, i) => {
      if (!ranges[i]?.start) return;
      const id = i + 1, { start, end } = ranges[i];
      const categories = `<c:cat><c:strRef><c:f>'Analysis'!$A$${start}:$A$${end}</c:f><c:strCache><c:ptCount val="${chart.points.length}"/>${chart.points.map((p, j) => `<c:pt idx="${j}"><c:v>${xml(p.label)}</c:v></c:pt>`).join('')}</c:strCache></c:strRef></c:cat>`;
      const values = `<c:val><c:numRef><c:f>'Analysis'!$B$${start}:$B$${end}</c:f><c:numCache><c:formatCode>General</c:formatCode><c:ptCount val="${chart.points.length}"/>${chart.points.map((p, j) => `<c:pt idx="${j}"><c:v>${p.value}</c:v></c:pt>`).join('')}</c:numCache></c:numRef></c:val>`;
      const pie = chart.kind === 'composition';
      const colorHex = theme.colors.excel.chartThemeHex[i % theme.colors.excel.chartThemeHex.length];
      const dPtElements = pie ? chart.points.map((_, pIdx) => {
        const sliceHex = theme.colors.excel.chartThemeHex[pIdx % theme.colors.excel.chartThemeHex.length];
        return `<c:dPt><c:idx val="${pIdx}"/><c:spPr><a:solidFill><a:srgbClr val="${sliceHex}"/></a:solidFill></c:spPr></c:dPt>`;
      }).join('') : '';
      const series = `<c:ser><c:idx val="0"/><c:order val="0"/><c:tx><c:v>${xml(chart.title)}</c:v></c:tx>${categories}${values}${pie ? dPtElements : `<c:spPr><a:solidFill><a:srgbClr val="${colorHex}"/></a:solidFill></c:spPr>`}</c:ser>`;
      const body = pie ? `<c:doughnutChart><c:varyColors val="1"/>${series}<c:holeSize val="65"/></c:doughnutChart>` : chart.kind === 'line' ? `<c:lineChart><c:grouping val="standard"/>${series}<c:axId val="100"/><c:axId val="200"/></c:lineChart>` : `<c:barChart><c:barDir val="${chart.kind === 'bar' ? 'bar' : 'col'}"/><c:grouping val="clustered"/>${series}<c:axId val="100"/><c:axId val="200"/></c:barChart>`;
      const axes = pie ? '' : `<c:catAx><c:axId val="100"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:axPos val="b"/><c:crossAx val="200"/><c:crosses val="autoZero"/></c:catAx><c:valAx><c:axId val="200"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:axPos val="l"/><c:numFmt formatCode="#,##0.##" sourceLinked="0"/><c:crossAx val="100"/><c:crosses val="autoZero"/></c:valAx>`;
      zip.file(`xl/charts/chart${id}.xml`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="${drawingNS}"><c:chart><c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:r><a:t>${xml(chart.title)}</a:t></a:r></a:p></c:rich></c:tx></c:title><c:plotArea><c:layout/>${body}${axes}</c:plotArea>${pie ? '<c:legend><c:legendPos val="r"/></c:legend>' : ''}<c:plotVisOnly val="1"/></c:chart></c:chartSpace>`);
      const row = 13 + Math.floor(i / 2) * 19, col = i % 2 * 8;
      drawing += `<xdr:twoCellAnchor><xdr:from><xdr:col>${col}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${row}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>${col + 8}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${row + 18}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to><xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="${id}" name="Source chart ${id}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" r:id="rId${id}"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor>`;
      relationships += `<Relationship Id="rId${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart${id}.xml"/>`;
      types = types.replace('</Types>', `<Override PartName="/xl/charts/chart${id}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/></Types>`);
    });
    zip.file('xl/drawings/drawing1.xml', drawing + '</xdr:wsDr>');
    zip.file('xl/drawings/_rels/drawing1.xml.rels', relationships + '</Relationships>');
    zip.file('xl/worksheets/_rels/sheet1.xml.rels', `<Relationships xmlns="${relNS}"><Relationship Id="rIdSourceDrawing" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>`);
    const sheetXML = await zip.file('xl/worksheets/sheet1.xml')!.async('string');
    zip.file('xl/worksheets/sheet1.xml', sheetXML.replace('</worksheet>', '<drawing r:id="rIdSourceDrawing"/></worksheet>'));
    zip.file('[Content_Types].xml', types.replace('</Types>', '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>'));
  }
  const proSuffix = options?.unprotected ? '_UNLOCKED' : '';
  return { blob: new Blob([await zip.generateAsync({ type: 'arraybuffer' })], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename: `${config.companyName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Analytics${proSuffix}.xlsx` };
}

