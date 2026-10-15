import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { AppDataset, DatasetConfig } from '../types/dataset';
import { getProfessionalSpec } from './professionalPresentation';
import { DomainChart, Metric, Row, groupRows, metricValue } from './domainDatasets';
import { getIndustryTheme } from './industryTheme';
const xml=(v:unknown)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
const sourceColumns:Record<string,string>={'Record ID':'A','Order Date':'B','Quarter':'C','Client Organization':'E','Segment Tier':'F','Global Region':'H','Country':'I','Sales Channel':'L','Product Name':'N','Product Category':'O','Unit Cost':'P','List Price':'Q','Qty':'R','Discount %':'S','Gross Revenue':'T','Total COGS':'U','Gross Profit':'V','Margin %':'W','Fulfillment':'Y'};
export function applyProfessionalStyle(workbook:ExcelJS.Workbook,data:AppDataset,config:DatasetConfig) {
 const spec=getProfessionalSpec(data),theme=getIndustryTheme(config.industry).colors.excel;
 const accent='FF'+spec.color.slice(1).toUpperCase(),tint='FF'+spec.tint.slice(1).toUpperCase();
 const replacements:Record<string,string>={'FF0F172A':theme.headerFill,'FF1E293B':theme.headerFill,'FF334155':theme.headerFill,'FF065F46':accent,'FF059669':accent,'FF10B981':accent,'FF0369A1':accent,'FF0284C7':accent,'FF4338CA':accent,'FF6366F1':accent,'FFECFDF5':tint,'FFE0F2FE':tint,'FFEEF2FF':tint,'FFFEF3C7':tint};
 for(const sheet of workbook.worksheets.slice(0,2)) {
  sheet.properties.tabColor={argb:accent};
  sheet.views=sheet.views.map(v=>({...v,showGridLines:false,zoomScale:85}));
  sheet.eachRow(row=>row.eachCell(cell=>{
   const fill=cell.fill;if(fill?.type==='pattern'&&fill.fgColor?.argb&&replacements[fill.fgColor.argb])cell.fill={...fill,fgColor:{argb:replacements[fill.fgColor.argb]}};
   const font=cell.font;if(font)cell.font={...font,name:'Aptos',...(font.color?.argb&&replacements[font.color.argb]?{color:{argb:replacements[font.color.argb]}}:{})};
  }));
 }
 const dash=workbook.getWorksheet('Executive Dashboard')!;
 dash.getCell('B2').value=`${config.companyName.toUpperCase()} — ${spec.title.toUpperCase()}`;
 dash.getCell('B3').value=`${spec.subtitle}  |  ${data.transactions.length.toLocaleString()} source orders  |  Sample commercial data`;
 dash.getCell('B3').font={name:'Aptos',size:9,color:{argb:'FFFFFFFF'}};
 dash.getRow(2).height=38;dash.getRow(3).height=28;
 dash.getCell('B3').alignment={vertical:'middle',wrapText:true,indent:1};
 dash.getCell('B69').value='COMMERCIAL PERFORMANCE NOTES';
 const notes=[['Portfolio contribution',`${data.kpi.topCategory} is the leading product category.`,`${data.categorySummaries.length} product categories in this sample.`],['Market contribution',`${data.kpi.topRegion} is the leading region by sales value.`,`${data.regionalPerformance.length} regions represented in the sales ledger.`],['Gross margin',`Gross profit / revenue: ${(data.kpi.overallMarginPct*100).toFixed(1)}%.`,`Revenue and costs are calculated from order quantities and prices.`],['Customer portfolio',`${data.customerAccounts.length} customer accounts in the sample.`,`Customer account detail is preserved on the Customer Accounts worksheet.`]];
 notes.forEach((note,i)=>{['B','E','J'].forEach((col,j)=>{dash.getCell(`${col}${70+i}`).value=note[j];dash.getCell(`${col}${70+i}`).alignment={wrapText:true,vertical:'middle'};});dash.getRow(70+i).height=32;});
 dash.pageSetup={...dash.pageSetup,printArea:'B2:O112',fitToPage:true,fitToWidth:1,fitToHeight:0,orientation:'landscape'};
 // Keep all six original worksheets and their formulas. Hidden, filter-aware
 // chart source pairs supplement the original dashboard's analytical tables.
 const count=data.transactions.length,last=count+2;
 const range=(field:string)=>`'Sales Transactions'!$${sourceColumns[field]}$3:$${sourceColumns[field]}$${last}`;
 spec.charts.forEach((chart,i)=>{
  const labelCol=dash.getColumn(18+i*2),valueCol=dash.getColumn(19+i*2);labelCol.hidden=true;valueCol.hidden=true;
  labelCol.width=20;valueCol.width=20;
  if(chart.kind==='scatter') {
   dash.getCell(1,labelCol.number).value=chart.x!;dash.getCell(1,valueCol.number).value=chart.secondary!;
   data.transactions.forEach((tx,j)=>{
    const row=j+3,condition=`AND(OR($C$4="All Regions",'Sales Transactions'!H${row}=$C$4),OR($G$4="All Channels",'Sales Transactions'!L${row}=$G$4))`;
    const values=[Number(data.rawRows![j][chart.x!]),Number(data.rawRows![j][chart.secondary!])];
    [labelCol,valueCol].forEach((col,k)=>{dash.getCell(j+2,col.number).value=config.useLiveExcelFormulas?{formula:`IF(${condition},'Sales Transactions'!${sourceColumns[k===0?chart.x!:chart.secondary!]}${row},NA())`,result:values[k]}:values[k];});
   });return;
  }
  dash.getCell(1,labelCol.number).value=chart.title;dash.getCell(1,valueCol.number).value=chart.metric.label;
  const groups=groupRows(data.rawRows as Row[],chart.dimension,chart.metric,chart.dimension===spec.date);
  groups.forEach((point,j)=>{
   const row=j+2,labelAddress=`$${labelCol.letter}$${row}`;dash.getCell(row,labelCol.number).value=point.label;
   const base=chart.dimension===spec.date?`${range('Order Date')},${labelAddress}&"*"`:`${range(chart.dimension)},${labelAddress}`;
   const criteria=`${base},${range('Global Region')},IF($C$4="All Regions","*",$C$4),${range('Sales Channel')},IF($G$4="All Channels","*",$G$4)`;
   const sum=(field:string)=>`SUMIFS(${range(field)},${criteria})`,matches=`COUNTIFS(${criteria})`;
   const m=chart.metric;
   const formula=m.operation==='count'?matches:m.operation==='ratio'?`IF(${sum(m.denominator!)}=0,0,${sum(m.field!)}/${sum(m.denominator!)})`:m.operation==='average'?`IF(${matches}=0,0,${sum(m.field!)}/${matches})`:sum(m.field!);
   dash.getCell(row,valueCol.number).value=config.useLiveExcelFormulas?{formula,result:point.value}:point.value;
   dash.getCell(row,valueCol.number).numFmt=m.format==='percent'?'0.0%':m.format==='currency'?'$#,##0.00':'#,##0.00';
  });
 });
}
function makeChart(data:AppDataset,chart:DomainChart,index:number) {
 const spec=getProfessionalSpec(data),accent=spec.color.slice(1).toUpperCase(),palette=[accent,'719C9B','9BAF8A','BD9673','9987B4','779AB9'];
 const points=groupRows(data.rawRows as Row[],chart.dimension,chart.metric,chart.dimension===spec.date);
 const col=(n:number)=>{let s='';while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26);}return s;};
 const catCol=col(18+index*2),valCol=col(19+index*2),end=points.length+1;
 const numFmt=chart.kind==='scatter'?'$#,##0':chart.metric.format==='percent'?'0.0%':chart.metric.format==='currency'?'$#,##0':'#,##0.##';
 const numeric=(tag:string,field:string,values:number[],last:number)=>`<c:${tag}><c:numRef><c:f>'Executive Dashboard'!$${field}$2:$${field}$${last}</c:f><c:numCache><c:formatCode>${xml(tag==='xVal'?'#,##0':numFmt)}</c:formatCode><c:ptCount val="${values.length}"/>${values.map((v,i)=>`<c:pt idx="${i}"><c:v>${v}</c:v></c:pt>`).join('')}</c:numCache></c:numRef></c:${tag}>`;
 const categories=`<c:cat><c:strRef><c:f>'Executive Dashboard'!$${catCol}$2:$${catCol}$${end}</c:f><c:strCache><c:ptCount val="${points.length}"/>${points.map((p,i)=>`<c:pt idx="${i}"><c:v>${xml(p.label)}</c:v></c:pt>`).join('')}</c:strCache></c:strRef></c:cat>`;
 const fill=`<c:spPr><a:solidFill><a:srgbClr val="${accent}"/></a:solidFill><a:ln w="28575"><a:solidFill><a:srgbClr val="${accent}"/></a:solidFill></a:ln></c:spPr>`;
 const colored=points.map((_,i)=>`<c:dPt><c:idx val="${i}"/><c:spPr><a:solidFill><a:srgbClr val="${palette[i%palette.length]}"/></a:solidFill></c:spPr></c:dPt>`).join('');
 const pie=['donut'].includes(chart.kind),scatter=chart.kind==='scatter',kind=chart.kind;
 const series=`<c:ser><c:idx val="0"/><c:order val="0"/><c:tx><c:v>${xml(chart.metric.label)}</c:v></c:tx>${fill}${pie?colored:''}${scatter?`<c:marker><c:symbol val="circle"/><c:size val="5"/></c:marker>${numeric('xVal',catCol,data.rawRows!.map(r=>Number(r[chart.x!])),data.transactions.length+1)}${numeric('yVal',valCol,data.rawRows!.map(r=>Number(r[chart.secondary!])),data.transactions.length+1)}`:`${categories}${numeric('val',valCol,points.map(p=>p.value),end)}`}</c:ser>`;
 let body:string;
 if(pie)body=`<c:doughnutChart><c:varyColors val="1"/>${series}<c:holeSize val="65"/></c:doughnutChart>`;
 else if(scatter)body=`<c:scatterChart><c:scatterStyle val="marker"/>${series}<c:axId val="101"/><c:axId val="102"/></c:scatterChart>`;
 else if(kind==='area'||kind==='line')body=`<c:${kind}Chart><c:grouping val="standard"/>${series}<c:axId val="101"/><c:axId val="102"/></c:${kind}Chart>`;
 else body=`<c:barChart><c:barDir val="${['bars','rank','lollipop','heatmap'].includes(kind)?'bar':'col'}"/><c:grouping val="clustered"/>${series}<c:gapWidth val="65"/><c:axId val="101"/><c:axId val="102"/></c:barChart>`;
 const axes=pie?'':scatter?`<c:valAx><c:axId val="101"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:axPos val="b"/><c:numFmt formatCode="#,##0" sourceLinked="0"/><c:crossAx val="102"/><c:crosses val="autoZero"/></c:valAx><c:valAx><c:axId val="102"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:axPos val="l"/><c:numFmt formatCode="${xml(numFmt)}" sourceLinked="0"/><c:crossAx val="101"/><c:crosses val="autoZero"/></c:valAx>`:`<c:catAx><c:axId val="101"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:axPos val="${['bars','rank','lollipop','heatmap'].includes(kind)?'l':'b'}"/><c:crossAx val="102"/><c:crosses val="autoZero"/></c:catAx><c:valAx><c:axId val="102"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:axPos val="${['bars','rank','lollipop','heatmap'].includes(kind)?'b':'l'}"/><c:numFmt formatCode="${xml(numFmt)}" sourceLinked="0"/><c:crossAx val="101"/><c:crosses val="autoZero"/></c:valAx>`;
 const title=scatter?'Order quantity vs. sales value':chart.title;
 return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><c:chart><c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="1200" b="1"/></a:pPr><a:r><a:t>${xml(title)}</a:t></a:r></a:p></c:rich></c:tx></c:title><c:plotArea><c:layout/>${body}${axes}</c:plotArea>${pie?'<c:legend><c:legendPos val="r"/></c:legend>':''}<c:plotVisOnly val="0"/><c:dispBlanksAs val="gap"/></c:chart><c:spPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:ln><a:solidFill><a:srgbClr val="E3E8E2"/></a:solidFill></a:ln></c:spPr></c:chartSpace>`;
}
export async function styleProfessionalCharts(blob:Blob,data:AppDataset):Promise<Blob> {
 const zip=await JSZip.loadAsync(await blob.arrayBuffer()),spec=getProfessionalSpec(data);
 spec.charts.forEach((chart,i)=>zip.file(`xl/charts/chart${i+1}.xml`,makeChart(data,chart,i)));
 let drawing=await zip.file('xl/drawings/drawing1.xml')!.async('string');
 const layout=DOMAIN_LAYOUTS[data.config.industry];
 let position=0;
 drawing=drawing.replace(/<xdr:twoCellAnchor\b[^>]*>[\s\S]*?<\/xdr:twoCellAnchor>/g,anchor=>{
  if(!anchor.includes('<xdr:graphicFrame'))return anchor;
  const bounds=layout[position++];if(!bounds)return anchor;
  const marker=(tag:string,c:number,r:number)=>`<xdr:${tag}><xdr:col>${c}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${r}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:${tag}>`;
  return anchor.replace(/<xdr:from>[\s\S]*?<\/xdr:from>/,marker('from',bounds[0],bounds[1])).replace(/<xdr:to>[\s\S]*?<\/xdr:to>/,marker('to',bounds[2],bounds[3]));
 });
 zip.file('xl/drawings/drawing1.xml',drawing);
 // Native SpreadsheetML font order: retain every font property while correcting
 // ExcelJS's serializer order for strict Open XML compatibility.
 const styles=await zip.file('xl/styles.xml')!.async('string'),order=['b','i','strike','condense','extend','outline','shadow','u','vertAlign','sz','color','name','family','charset','scheme'];
 zip.file('xl/styles.xml',styles.replace(/<font>([\s\S]*?)<\/font>/g,(_,content:string)=>`<font>${(content.match(/<[A-Za-z]+\b[^>]*?\/>/g)||[]).sort((a,b)=>order.indexOf(a.match(/^<([A-Za-z]+)/)![1])-order.indexOf(b.match(/^<([A-Za-z]+)/)![1])).join('')}</font>`));
 return new Blob([await zip.generateAsync({type:'arraybuffer',compression:'DEFLATE'})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
// Original chart canvas is rows 10–42. Four non-overlapping compositions leave
// the original analytical tables, slicers, KPIs and portfolio image in place.
const DOMAIN_LAYOUTS:Record<string,number[][]>={
 enterprise_tech:[[1,9,10,26],[10,9,15,26],[1,26,8,42],[8,26,15,42]],
 ecommerce_retail:[[1,9,15,23],[1,23,6,42],[6,23,10,42],[10,23,15,42]],
 healthcare_pharma:[[1,9,8,25],[8,9,15,25],[1,25,10,42],[10,25,15,42]],
 industrial_manufacturing:[[1,9,11,27],[11,9,15,27],[1,27,7,42],[7,27,15,42]],
 finance_wealth:[[1,9,6,25],[6,9,15,25],[1,25,10,42],[10,25,15,42]],
 real_estate:[[1,9,9,24],[9,9,15,24],[1,24,7,42],[7,24,15,42]],
 human_resources:[[1,9,9,26],[9,9,15,26],[1,26,9,42],[9,26,15,42]],
 hospitality_travel:[[1,9,15,24],[1,24,7,42],[7,24,11,42],[11,24,15,42]],
 energy_utilities:[[1,9,10,25],[10,9,15,25],[1,25,6,42],[6,25,15,42]],
 education_academic:[[1,9,8,24],[8,9,15,24],[1,24,6,42],[6,24,15,42]],
 marketing_media:[[1,9,9,23],[9,9,15,23],[1,23,10,42],[10,23,15,42]],
 general_business:[[1,9,15,25],[1,25,6,42],[6,25,10,42],[10,25,15,42]]
};
