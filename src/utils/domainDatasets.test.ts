import assert from 'node:assert/strict';
import { test } from 'node:test';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { IndustryType, DatasetConfig } from '../types/dataset';
import { DOMAIN_SPECS, generateDomainDataset, groupRows, metricValue, Row } from './domainDatasets';
import { analyzeDataset, numericValue } from './adaptiveAnalysis';
import { exportAdaptiveExcel } from './adaptiveExcelExporter';
const config:DatasetConfig={companyName:'Test company',reportTitle:'Test',industry:'enterprise_tech',recordCount:250,currency:'USD',currencySymbol:'$',includeChartsInExcel:true,useLiveExcelFormulas:true};
for(const industry of Object.keys(DOMAIN_SPECS) as IndustryType[]) {
 test(`${industry}: fields, KPIs, charts and source records agree`,()=>{
  const spec=DOMAIN_SPECS[industry],data=generateDomainDataset({...config,industry}),rows=data.rawRows as Row[];
  assert.equal(rows.length,250);assert.equal(new Set(rows.map(r=>r['Record ID'])).size,250);
  assert.ok(data.originalHeaders?.includes(spec.date));
  for(const metric of [...spec.metrics,...spec.charts.map(c=>c.metric)]){
   if(metric.field) assert.ok(rows.every(r=>typeof r[metric.field!]==='number'),metric.field);
   if(metric.denominator) assert.ok(rows.every(r=>Number(r[metric.denominator!])>=0));
   assert.ok(Number.isFinite(metricValue(rows,metric)));
  }
  for(const chart of spec.charts){
   assert.ok(data.originalHeaders?.includes(chart.dimension));
   if(chart.x)assert.ok(data.originalHeaders?.includes(chart.x));
   if(chart.secondary)assert.ok(data.originalHeaders?.includes(chart.secondary));
   assert.equal(groupRows(rows,chart.dimension,chart.metric,chart.dimension===spec.date).reduce((s,p)=>s+p.count,0),250);
  }
  const analysis=analyzeDataset(data);assert.equal(analysis.rows.length,250);assert.equal(analysis.invalidDates,0);
  for(const column of data.schemaProfile!.columns) if(column.dataType==='percentage') assert.equal(numericValue(rows[0][column.name],column),rows[0][column.name]);
 });
}
test('every preset has a distinct schema and visual composition',()=>{
 const schemas=new Set(),visuals=new Set();
 for(const industry of Object.keys(DOMAIN_SPECS) as IndustryType[]){schemas.add(generateDomainDataset({...config,industry}).originalHeaders!.join('|'));visuals.add(DOMAIN_SPECS[industry].charts.map(c=>c.kind).join('|'));}
 assert.equal(schemas.size,12);assert.equal(visuals.size,12);
});
test('ratios use weighted source totals, not a mean of row ratios',()=>{
 const rows=[{occupied:1,available:2},{occupied:9,available:10}];
 assert.equal(metricValue(rows,{label:'Occupancy',field:'occupied',denominator:'available',operation:'ratio'}),10/12);
 const data=generateDomainDataset({...config,industry:'industrial_manufacturing'});
 for(const r of data.rawRows!)assert.equal(r['Good Units']+r['Defect Units'],r['Units Produced']);
});
test('generation is deterministic; refreshing preserves volume and changes values',()=>{
 assert.deepEqual(generateDomainDataset(config).rawRows,generateDomainDataset(config).rawRows);
 const refreshed=generateDomainDataset(config,1);assert.equal(refreshed.rawRows!.length,250);assert.notDeepEqual(refreshed.rawRows,generateDomainDataset(config).rawRows);
});
test('industry workbook contains matching source fields, business KPIs, formulas and charts',async()=>{
 for(const industry of Object.keys(DOMAIN_SPECS) as IndustryType[]){
  const data=generateDomainDataset({...config,industry});
  const result=await exportAdaptiveExcel(data,data.config,undefined,true);const buffer=Buffer.from(await result.blob.arrayBuffer());
  const book=new ExcelJS.Workbook();await book.xlsx.load(buffer as any);
  const source=book.getWorksheet('Source Data')!;assert.equal(source.rowCount,251);assert.deepEqual((source.getRow(1).values as ExcelJS.CellValue[]).slice(1),data.originalHeaders);
  const metrics=book.getWorksheet('Business Metrics')!;assert.equal(metrics.rowCount,5);
  DOMAIN_SPECS[industry].metrics.forEach((m,i)=>{assert.equal(metrics.getCell(i+2,1).value,m.label);assert.equal((metrics.getCell(i+2,2).value as any).result,metricValue(data.rawRows as Row[],m));assert.ok((metrics.getCell(i+2,2).value as any).formula.includes('Source Data'));});
  const zip=await JSZip.loadAsync(buffer);
  const drawing = await zip.file('xl/drawings/drawing1.xml')!.async('string');
  assert.ok(drawing.includes('xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"'), 'DrawingML graphics and transforms must use the main namespace');
  assert.equal((drawing.match(/<xdr:graphicFrame /g) || []).length,4);
  for(let chart=1;chart<=4;chart++) {
    const chartXml=await zip.file(`xl/charts/chart${chart}.xml`)!.async('string');
    assert.ok(chartXml.includes('xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"'));
    assert.ok(drawing.includes(`r:id="rId${chart}"`));
  }
  const styles=await zip.file('xl/styles.xml')!.async('string');
  for(const font of styles.match(/<font>[\s\S]*?<\/font>/g)||[]) if(font.includes('<sz')&&font.includes('<color')) assert.ok(font.indexOf('<sz')<font.indexOf('<color'), 'Font size must precede font color');
  if(process.env.NEXUSBI_VALIDATION_OUTPUT_DIR) {
    const {writeFile}=await import('node:fs/promises');
    const {join}=await import('node:path');
    await writeFile(join(process.env.NEXUSBI_VALIDATION_OUTPUT_DIR,`${industry}.xlsx`),buffer);
  }
  assert.equal(Object.keys(zip.files).filter(p=>/^xl\/charts\/chart\d+.xml$/.test(p)).length,4);
  assert.ok(book.getWorksheet('Analysis')!.getRow(1).getCell(1).text.includes(DOMAIN_SPECS[industry].charts[0].title));
 }
});


test('chart-free exports omit drawing relationships and keep source data',async()=>{
 const data=generateDomainDataset({...config,includeChartsInExcel:false});
 const result=await exportAdaptiveExcel(data,data.config,undefined,true);
 const zip=await JSZip.loadAsync(await result.blob.arrayBuffer());
 assert.equal(zip.file('xl/drawings/drawing1.xml'),null);
 assert.equal(zip.file('xl/worksheets/_rels/sheet1.xml.rels'),null);
 assert.ok(!(await zip.file('xl/worksheets/sheet1.xml')!.async('string')).includes('<drawing'));
});
