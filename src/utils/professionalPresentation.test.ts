import assert from 'node:assert/strict';
import {test} from 'node:test';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import JSZip from 'jszip';
import ExcelJS from 'exceljs';
import {generateProfessionalDataset,getProfessionalSpec} from './professionalPresentation';
import {generateRealisticDataset,INDUSTRY_PRESETS} from './dataGenerator';
import {exportToProfessionalExcel} from './excelExporter';
import {DatasetConfig,IndustryType} from '../types/dataset';
import {metricValue,Row} from './domainDatasets';
const config:DatasetConfig={companyName:'Test',reportTitle:'Executive report',industry:'healthcare_pharma',recordCount:250,currency:'USD',currencySymbol:'$',includeChartsInExcel:true,useLiveExcelFormulas:true};
const sheetNames=['Executive Dashboard','Pivot Table Analysis','Sales Transactions','Regional Performance','Product Catalog','Customer Accounts'];
test('industry presentation preserves original records, catalog, regions, accounts and KPIs',()=>{
 for(const industry of Object.keys(INDUSTRY_PRESETS) as IndustryType[]){
  const cfg={...config,industry},original=generateRealisticDataset(cfg),styled=generateProfessionalDataset(cfg);
  for(const field of ['transactions','productCatalog','regionalPerformance','customerAccounts','monthlyTrends','categorySummaries','kpi'] as const)assert.deepEqual(styled[field],original[field]);
  const spec=getProfessionalSpec(styled);
  assert.ok(!/patient|engagement|employee headcount|occupancy|generation.*mwh/i.test(spec.metrics.map(m=>m.label).join(' ')));
  for(const m of [...spec.metrics,...spec.charts.map(c=>c.metric)]){if(m.field)assert.ok(styled.originalHeaders!.includes(m.field));assert.ok(Number.isFinite(metricValue(styled.rawRows as Row[],m)));}
 }
});
test('original six-sheet workbook, seven charts, formulas, dropdowns, image and links survive every presentation',async()=>{
 const layouts=new Set<string>(),chartPlans=new Set<string>();
 for(const industry of Object.keys(INDUSTRY_PRESETS) as IndustryType[]){
  const data=generateProfessionalDataset({...config,industry,companyName:INDUSTRY_PRESETS[industry].companyDefault});
  const {blob,filename}=await exportToProfessionalExcel(data,data.config),buffer=Buffer.from(await blob.arrayBuffer()),zip=await JSZip.loadAsync(buffer);
  const book=new ExcelJS.Workbook();await book.xlsx.load(buffer as any);
  assert.deepEqual(book.worksheets.map(s=>s.name),sheetNames);
  assert.ok(filename.includes('_Executive_Sales_Dashboard_'));
  const tx=book.getWorksheet('Sales Transactions')!;
  assert.equal(tx.getCell('A3').text,data.transactions[0].id);assert.equal(tx.getCell('A252').text,data.transactions[249].id);
  assert.equal(tx.rowCount,253);assert.ok(tx.autoFilter);assert.equal(tx.views[0].state,'frozen');
  assert.equal(tx.getCell('T3').formula,'R3*Q3*(1-S3)');assert.equal((tx.getCell('T3').value as ExcelJS.CellFormulaValue).result,data.transactions[0].revenue);
  const dash=book.getWorksheet('Executive Dashboard')!,pivot=book.getWorksheet('Pivot Table Analysis')!;
  assert.equal(dash.getCell('C4').dataValidation.type,'list');assert.equal(dash.getCell('G4').dataValidation.type,'list');
  assert.equal(pivot.getCell('C4').dataValidation.type,'list');assert.equal(pivot.getCell('F4').dataValidation.type,'list');
  assert.ok(dash.getCell('B7').formula?.includes('Sales Transactions'));
  const chartFiles=Object.keys(zip.files).filter(p=>/^xl\/charts\/chart\d+\.xml$/.test(p));assert.equal(chartFiles.length,7);
  assert.equal(Object.keys(zip.files).filter(p=>/^xl\/media\/[^/]+$/.test(p)).length,1);
  assert.ok((await zip.file('xl/drawings/_rels/drawing1.xml.rels')!.async('string')).includes('https://dattasable.com/dashboards'));
  const drawing=await zip.file('xl/drawings/drawing1.xml')!.async('string');layouts.add(drawing.match(/<xdr:twoCellAnchor[\s\S]*?<\/xdr:twoCellAnchor>/g)!.slice(0,4).map(a=>a.match(/<xdr:from>[\s\S]*?<\/xdr:to>/)?.[0]).join('|'));
  const charts=await Promise.all([1,2,3,4].map(i=>zip.file(`xl/charts/chart${i}.xml`)!.async('string')));chartPlans.add(charts.join('|'));
  for(const chart of charts){assert.ok(chart.includes('drawingml/2006/main'));assert.ok(chart.includes('<c:chart>'));}
  if(process.env.NEXUSBI_VALIDATION_OUTPUT_DIR){await mkdir(process.env.NEXUSBI_VALIDATION_OUTPUT_DIR,{recursive:true});await writeFile(join(process.env.NEXUSBI_VALIDATION_OUTPUT_DIR,`professional-${industry}.xlsx`),buffer);}
 }
 assert.equal(layouts.size,1);
});
test('static exports retain the same original sheets and source values',async()=>{
 const data=generateProfessionalDataset({...config,useLiveExcelFormulas:false});const result=await exportToProfessionalExcel(data,data.config);const book=new ExcelJS.Workbook();await book.xlsx.load(Buffer.from(await result.blob.arrayBuffer()) as any);
 assert.deepEqual(book.worksheets.map(s=>s.name),sheetNames);assert.equal(book.getWorksheet('Sales Transactions')!.getCell('T3').value,data.transactions[0].revenue);
});
test('reference healthcare workbook retains its original source fields and customer accounts',{skip:!process.env.NEXUSBI_REFERENCE_WORKBOOK},async()=>{
 if(!process.env.NEXUSBI_REFERENCE_WORKBOOK)return;
 const old=new ExcelJS.Workbook();await old.xlsx.load(await readFile(process.env.NEXUSBI_REFERENCE_WORKBOOK) as any);
 const data=generateProfessionalDataset({...config,companyName:'BioSynex Healthcare Technologies',recordCount:1000});
 const result=await exportToProfessionalExcel(data,data.config),book=new ExcelJS.Workbook();await book.xlsx.load(Buffer.from(await result.blob.arrayBuffer()) as any);
 assert.deepEqual(book.worksheets.map(s=>s.name),old.worksheets.map(s=>s.name));
 const original=old.getWorksheet('Sales Transactions')!,current=book.getWorksheet('Sales Transactions')!;
 assert.deepEqual(original.getRow(2).values,current.getRow(2).values);
 for(let row=3;row<=1002;row++)for(const col of ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','X','Y'])assert.deepEqual(current.getCell(`${col}${row}`).value,original.getCell(`${col}${row}`).value,`${col}${row}`);
 assert.deepEqual(book.getWorksheet('Customer Accounts')!.getSheetValues(),old.getWorksheet('Customer Accounts')!.getSheetValues());
 if(process.env.NEXUSBI_REVIEW_WORKBOOK)await writeFile(process.env.NEXUSBI_REVIEW_WORKBOOK,Buffer.from(await result.blob.arrayBuffer()));
});

