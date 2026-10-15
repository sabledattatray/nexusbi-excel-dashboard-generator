import React, {useEffect,useMemo,useState} from 'react';
import JSZip from 'jszip';
import ExcelJS from 'exceljs';
import {Download,FileSpreadsheet,LayoutGrid,Loader2,RefreshCw,ChevronLeft,ChevronRight,ChartNoAxesCombined} from 'lucide-react';
import {AppDataset,DatasetConfig} from '../types/dataset';
import {exportToProfessionalExcel} from '../utils/excelExporter';
import {getProfessionalSpec} from '../utils/professionalPresentation';
interface Props {data:AppDataset;config:DatasetConfig;onDownloadExcel:()=>void;isDownloading:boolean}
const cNS='http://schemas.openxmlformats.org/drawingml/2006/chart',aNS='http://schemas.openxmlformats.org/drawingml/2006/main',xNS='http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing';
type Series={name:string;labels:string[];values:number[];xs:number[];color:string;colors:string[];formula:string;format:string};
type Chart={id:number;title:string;kind:string;sheet:number;series:Series[];bounds:number[]};
type Preview={charts:Chart[];workbook:ExcelJS.Workbook;filename:string};
const tags=(node:Document|Element,ns:string,name:string)=>Array.from(node.getElementsByTagNameNS(ns,name));
const first=(node:Document|Element,ns:string,name:string)=>tags(node,ns,name)[0];
const text=(node:Document|Element|undefined,ns:string,name:string)=>node?first(node,ns,name)?.textContent||'':'';
const palette=['#268575','#6498a6','#a6b78e','#c5a17d','#9486b1','#739ac0'];
const readXML=(s:string)=>{const doc=new DOMParser().parseFromString(s,'application/xml');if(doc.getElementsByTagName('parsererror').length)throw new Error('The workbook chart could not be read.');return doc;};
async function readPreview(blob:Blob,filename:string):Promise<Preview>{
 const bytes=await blob.arrayBuffer(),zip=await JSZip.loadAsync(bytes),workbook=new ExcelJS.Workbook();await workbook.xlsx.load(bytes);
 const charts:Chart[]=[];
 for(let sheet=1;sheet<=2;sheet++) {
  const drawing=zip.file(`xl/drawings/drawing${sheet}.xml`),relations=zip.file(`xl/drawings/_rels/drawing${sheet}.xml.rels`);if(!drawing||!relations)continue;
  const doc=readXML(await drawing.async('string')),rels=readXML(await relations.async('string'));
  for(const anchor of tags(doc,xNS,'twoCellAnchor')) {
   const chartLink=first(anchor,cNS,'chart');if(!chartLink)continue;
   const relId=chartLink.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id');
   const rel=Array.from(rels.getElementsByTagName('Relationship')).find(r=>r.getAttribute('Id')===relId),target=rel?.getAttribute('Target')||'';
   const path=target.startsWith('/')?target.slice(1):`xl/${target.replace(/^\.\.\//,'')}`,part=zip.file(path);if(!part)continue;
   const chart=readXML(await part.async('string')),titleNode=first(chart,cNS,'title');
   const title=titleNode?tags(titleNode,aNS,'t').map(t=>t.textContent).join(''):'Workbook chart';
   const kinds=['barChart','lineChart','areaChart','pieChart','doughnutChart','scatterChart'],kind=kinds.find(k=>first(chart,cNS,k))||'barChart';
   const direction=text(chart,cNS,'barDir')||first(chart,cNS,'barDir')?.getAttribute('val');
   const series=tags(chart,cNS,'ser').map((ser,i)=>{
    const valueNode=first(ser,cNS,'val')||first(ser,cNS,'yVal'),cat=first(ser,cNS,'cat'),xval=first(ser,cNS,'xVal');
    const values=valueNode?tags(valueNode,cNS,'pt').map(pt=>Number(text(pt,cNS,'v'))):[];
    const labels=cat?tags(cat,cNS,'pt').map(pt=>text(pt,cNS,'v')):values.map((_,i)=>String(i+1));
    const xs=xval?tags(xval,cNS,'pt').map(pt=>Number(text(pt,cNS,'v'))):[];
    const color=first(ser,cNS,'spPr')?first(first(ser,cNS,'spPr'),aNS,'srgbClr')?.getAttribute('val'):undefined;
    const colors=tags(ser,cNS,'dPt').map(pt=>'#'+(first(pt,aNS,'srgbClr')?.getAttribute('val')||'268575'));
    return {name:text(first(ser,cNS,'tx'),cNS,'v')||`Series ${i+1}`,values,labels,xs,color:color?'#'+color:palette[i%palette.length],colors,formula:valueNode?text(valueNode,cNS,'f'):'',format:valueNode?text(valueNode,cNS,'formatCode'):''};
   });
   const from=first(anchor,xNS,'from'),to=first(anchor,xNS,'to');
   charts.push({id:Number(path.match(/chart(\d+)/)?.[1]||charts.length+1),title,kind:kind==='barChart'?(direction==='bar'?'bar':'column'):kind.replace('Chart',''),sheet,series,bounds:[Number(text(from,xNS,'col')),Number(text(from,xNS,'row')),Number(text(to,xNS,'col')),Number(text(to,xNS,'row'))]});
  }
 }
 return {charts,workbook,filename};
}
function fmt(value:number,format='',compact=false){return new Intl.NumberFormat('en-US',{maximumFractionDigits:format.includes('%')?1:compact?1:2,...(compact?{notation:'compact' as const}:{}),...(format.includes('%')?{style:'percent' as const}:format.includes('$')?{style:'currency' as const,currency:'USD'}:{})}).format(value);}
export const ExcelLiveViewer:React.FC<Props>=({data,config,onDownloadExcel,isDownloading})=>{
 const [preview,setPreview]=useState<Preview|null>(null),[error,setError]=useState(''),[sheet,setSheet]=useState('Executive Dashboard'),[selected,setSelected]=useState<number|null>(null),[page,setPage]=useState(0),[retry,setRetry]=useState(0);
 useEffect(()=>{let current=true;setPreview(null);setError('');setPage(0);setSelected(null);
  exportToProfessionalExcel(data,config).then(result=>readPreview(result.blob,result.filename)).then(result=>{if(current)setPreview(result);}).catch(err=>{if(current)setError(err instanceof Error?err.message:'The preview could not be generated.');});
  return ()=>{current=false;};
 },[data,config,retry]);
 const spec=getProfessionalSpec(data),all=sheet==='All visuals',active=preview?.workbook.getWorksheet(sheet),charts=preview?.charts.filter(c=>all||c.sheet===(sheet==='Executive Dashboard'?1:sheet==='Pivot Table Analysis'?2:0))||[];
 const firstChartRow=charts.length?Math.min(...charts.map(c=>c.bounds[1])):0;
 const selectedChart=preview?.charts.find(c=>c.id===selected),tabs=['Executive Dashboard','Pivot Table Analysis','Sales Transactions','Regional Performance','Product Catalog','Customer Accounts'];
 const totalPreviewRows=active?.rowCount||0;
 const kpis=[['Sales value',data.kpi.totalRevenue,'$'],['Gross profit',data.kpi.totalGrossProfit,'$'],['Gross margin',data.kpi.overallMarginPct,'%'],['Units sold',data.kpi.totalUnits,''],['Orders',data.kpi.orderCount,''],['Average order',data.kpi.averageDealSize,'$'],['Customers',data.kpi.activeCustomers,'']] as const;
 return <section className="excel-preview" aria-label="Excel workbook preview" style={{'--excel-accent':spec.color} as React.CSSProperties}>
  <div className="excel-preview-heading"><div><span className="eyebrow">WORKBOOK PREVIEW</span><h2>See your report in Excel</h2><p>Charts below read the generated workbook’s data, colors and chart definitions.</p></div></div>
  {error?<div className="excel-preview-message" role="alert"><p>{error}</p><button onClick={()=>setRetry(r=>r+1)}><RefreshCw size={14}/>Try again</button></div>:!preview?<div className="excel-preview-message" role="status"><Loader2 className="animate-spin"/><p>Preparing the workbook and its seven chart previews…</p></div>:<div className="excel-window">
   <div className="excel-titlebar"><span className="excel-app-icon">X</span><strong title={preview.filename}>{preview.filename}</strong><span className="excel-title-status">.xlsx preview</span></div>
   <div className="excel-ribbon"><span>File</span><span>Home</span><span>Insert</span><span>Page Layout</span><span>Formulas</span><span>Data</span><span className="excel-ribbon-active">Chart Design</span><span className="excel-ribbon-note">{preview.workbook.worksheets.length} worksheets · {preview.charts.length} native charts</span></div>
   <nav className="excel-sheet-tabs" aria-label="Workbook worksheets">{tabs.map(name=><button role="tab" aria-selected={sheet===name} key={name} onClick={()=>{setSheet(name);setPage(0);setSelected(null);}}><FileSpreadsheet size={12}/>{name}</button>)}<button role="tab" aria-selected={all} onClick={()=>{setSheet('All visuals');setSelected(null);}}><LayoutGrid size={13}/>All visuals ({preview.charts.length})</button></nav>
   <div className="excel-formula-bar"><span className="excel-name-box">{selectedChart?`Chart ${selectedChart.id}`:'A1'}</span><em>fx</em><code>{selectedChart?selectedChart.series[0]?.formula||'Native chart object':'Select a chart to inspect its workbook source range'}</code><span className="excel-fit">Fit to width</span></div>
   <div className="excel-sheet-canvas">
    {(sheet==='Executive Dashboard'||sheet==='Pivot Table Analysis'||all)&&<>
     <div className="excel-report-banner"><small>{config.companyName}</small><h3>{all?'All workbook visuals':sheet==='Executive Dashboard'?spec.title:'Pivot table analysis'}</h3><p>{all?'Every native chart in the downloaded workbook, with its cached values and source range.':sheet==='Executive Dashboard'?spec.subtitle:'Regional, category and quarterly views from the exported Pivot Table Analysis worksheet.'}</p></div>
     {sheet==='Executive Dashboard'&&<div className="excel-report-kpis">{kpis.map(([label,value,format])=><div key={label}><span>{label}</span><strong title={fmt(value,format)}>{fmt(value,format,true)}</strong></div>)}</div>}
     <div className={`excel-native-grid ${all?'excel-all-charts':sheet==='Pivot Table Analysis'?'excel-pivot-charts':''}`} style={!all&&sheet==='Executive Dashboard'?{gridTemplateColumns:`repeat(${sheet==='Executive Dashboard'?14:17},minmax(0,1fr))`}:undefined}>
      {charts.map(chart=><article key={chart.id} className={`excel-chart-object ${selected===chart.id?'selected':''}`} style={!all&&sheet==='Executive Dashboard'?{gridColumn:`${chart.bounds[0]} / ${chart.bounds[2]}`,gridRow:`${chart.bounds[1]-firstChartRow+1} / ${chart.bounds[3]-firstChartRow+1}`}:undefined}>
       <button className="excel-chart-heading" onClick={()=>setSelected(chart.id)} aria-label={`Inspect ${chart.title}`}><span><ChartNoAxesCombined size={14}/><strong>{chart.title}</strong></span><small>{chart.kind}</small></button>
       <WorkbookChart chart={chart}/><div className="excel-chart-source" title={chart.series[0]?.formula}>{sheet==='Pivot Table Analysis'||all?(chart.sheet===1?'Executive Dashboard':'Pivot Table Analysis'):'Source'} · {chart.series[0]?.formula}</div>
      </article>)}
     </div>
     {!all&&<details className="excel-source-details"><summary>Worksheet data and calculation cells</summary><WorkbookTable sheet={active!} page={page} setPage={setPage} data={data}/></details>}
     {!all&&<details className="excel-portfolio"><summary>Portfolio image included in the workbook</summary><a href="https://dattasable.com/dashboards" target="_blank" rel="noreferrer"><img src="/dattasable.com.png" alt="Datta Sable business intelligence and analytics portfolio"/></a></details>}
    </>}
    {!['Executive Dashboard','Pivot Table Analysis','All visuals'].includes(sheet)&&<><div className="excel-table-heading"><h3>{sheet}</h3><span>{sheet==='Sales Transactions'?data.transactions.length.toLocaleString()+' source records':totalPreviewRows+' worksheet rows'}</span></div><WorkbookTable sheet={active!} page={page} setPage={setPage} data={data}/></>}
   </div>
   <div className="excel-statusbar"><span><i/>Ready · {all?`${charts.length} charts`:sheet}</span><span>Workbook values · Fit to width</span></div>
  </div>}
 </section>;
};
function WorkbookChart({chart}:{chart:Chart}) {
 const series=chart.series,points=series[0]?.values||[],labels=series[0]?.labels||[],format=series[0]?.format||'',margin={left:76,right:18,top:18,bottom:42},w=640,h=300,pw=w-margin.left-margin.right,ph=h-margin.top-margin.bottom;
 const min=Math.min(0,...series.flatMap(s=>s.values)),max=Math.max(0,...series.flatMap(s=>s.values)),span=max-min||1;
 const y=(v:number)=>margin.top+ph-(v-min)/span*ph;
 if(!points.length)return <div className="excel-no-chart">No chart values are cached in this workbook.</div>;
 const ticks=[0,.25,.5,.75,1];
 if(chart.kind==='doughnut'||chart.kind==='pie'){
  const total=points.reduce((s,v)=>s+v,0);let offset=0;
  return <div className="excel-donut-layout"><svg viewBox="0 0 200 200" role="img" aria-label={chart.title}><circle cx="100" cy="100" r="68" fill="none" stroke="#edf0ed" strokeWidth="28"/>{points.map((v,i)=>{const share=total?v/total:0,start=offset;offset+=share;return <circle key={i} cx="100" cy="100" r={chart.kind==='pie'?50:68} fill="none" stroke={series[0].colors[i]||palette[i%palette.length]} strokeWidth={chart.kind==='pie'?100:28} pathLength="100" strokeDasharray={`${share*100} ${100-share*100}`} strokeDashoffset={-start*100} transform="rotate(-90 100 100)"><title>{labels[i]}: {fmt(v,format)} ({(share*100).toFixed(1)}%)</title></circle>})}{chart.kind!=='pie'&&<><text x="100" y="99" textAnchor="middle" fontSize="23" fill="#263f35" fontWeight="600">{fmt(total,format,true)}</text><text x="100" y="119" textAnchor="middle" fontSize="10" fill="#7c8b81">TOTAL</text></>}</svg><div className="excel-chart-legend">{points.map((v,i)=><div key={i}><i style={{background:series[0].colors[i]||palette[i%palette.length]}}/><span>{labels[i]}</span><strong>{total?(v/total*100).toFixed(1):0}%</strong><small>{fmt(v,format,true)}</small></div>)}</div></div>;
 }
 if(chart.kind==='bar'){
  const chartH=Math.max(230,labels.length*43+35),height=chartH-45,step=height/Math.max(1,labels.length),left=145,width=465;
  const x=(v:number)=>left+(v-min)/span*width;
  return <div className="excel-chart-plot"><svg viewBox={`0 0 640 ${chartH}`} role="img" aria-label={chart.title}>{ticks.map(t=><g key={t}><line x1={left+t*width} x2={left+t*width} y1="5" y2={height} stroke="#e7ece7"/><text x={left+t*width} y={height+22} textAnchor="middle" fontSize="10" fill="#718277">{fmt(min+t*span,format,true)}</text></g>)}{labels.map((label,i)=><g key={i}><text x={left-10} y={i*step+step/2+4} textAnchor="end" fontSize="10" fill="#52685a">{label.length>21?label.slice(0,20)+'…':label}</text>{series.map((s,j)=><rect key={j} x={Math.min(x(0),x(s.values[i]||0))} y={i*step+step*.14+j*step*.7/series.length} width={Math.abs(x(s.values[i]||0)-x(0))} height={Math.max(3,step*.7/series.length-3)} rx="3" fill={s.color}><title>{label} · {s.name}: {fmt(s.values[i]||0,s.format)}</title></rect>)}</g>)}</svg><SeriesLegend series={series}/></div>;
 }
 if(chart.kind==='scatter'){
  const xs=series[0].xs,xmin=Math.min(0,...xs),xmax=Math.max(0,...xs),xspan=xmax-xmin||1;
  return <div className="excel-chart-plot"><svg viewBox="0 0 640 300" role="img" aria-label={chart.title}>{ticks.map(t=><g key={t}><line x1={margin.left} x2={w-margin.right} y1={margin.top+t*ph} y2={margin.top+t*ph} stroke="#e6ece6"/><text x="67" y={margin.top+t*ph+4} textAnchor="end" fill="#718277" fontSize="10">{fmt(max-t*span,format,true)}</text><text x={margin.left+t*pw} y={h-17} textAnchor="middle" fill="#718277" fontSize="10">{fmt(xmin+t*xspan,'',true)}</text></g>)}{points.map((v,i)=><circle key={i} cx={margin.left+(xs[i]-xmin)/xspan*pw} cy={y(v)} r="3.5" fill={series[0].color} opacity=".45"><title>Quantity {xs[i]} · Sales value {fmt(v,format)}</title></circle>)}</svg></div>;
 }
 const x=(i:number)=>margin.left+(i+.5)*pw/Math.max(1,labels.length),lineX=(i:number)=>labels.length===1?margin.left+pw/2:margin.left+i*pw/(labels.length-1);
 return <div className="excel-chart-plot"><svg viewBox="0 0 640 300" role="img" aria-label={chart.title}>{ticks.map(t=><g key={t}><line x1={margin.left} x2={w-margin.right} y1={margin.top+t*ph} y2={margin.top+t*ph} stroke="#e5ebe5" strokeDasharray="3 4"/><text x="67" y={margin.top+t*ph+4} textAnchor="end" fill="#718277" fontSize="10">{fmt(max-t*span,format,true)}</text></g>)}{series.map((s,j)=>{
  const line=s.values.map((v,i)=>`${lineX(i)},${y(v)}`).join(' ');
  return <g key={j}>{chart.kind==='line'||chart.kind==='area'?<>{chart.kind==='area'&&<polygon points={`${lineX(0)},${y(0)} ${line} ${lineX(points.length-1)},${y(0)}`} fill={s.color} opacity=".15"/>}<polyline points={line} fill="none" stroke={s.color} strokeWidth="3"/>{s.values.map((v,i)=><circle key={i} cx={lineX(i)} cy={y(v)} r="3" fill="white" stroke={s.color} strokeWidth="2"><title>{labels[i]} · {s.name}: {fmt(v,s.format)}</title></circle>)}</>:s.values.map((v,i)=>{const group=pw/Math.max(1,labels.length),bar=Math.min(42,group*.76/series.length);return <rect key={i} x={x(i)-series.length*bar/2+j*bar} y={Math.min(y(0),y(v))} width={Math.max(2,bar-3)} height={Math.abs(y(0)-y(v))} rx="3" fill={s.color}><title>{labels[i]} · {s.name}: {fmt(v,s.format)}</title></rect>})}</g>;
 })}{labels.map((label,i)=>(labels.length<=12||i%Math.ceil(labels.length/10)===0)&&<text key={i} x={chart.kind==='line'||chart.kind==='area'?lineX(i):x(i)} y={h-17} textAnchor="middle" fontSize="9" fill="#64786a">{label.length>14?label.slice(0,13)+'…':label}</text>)}</svg><SeriesLegend series={series}/></div>;
}
function SeriesLegend({series}:{series:Series[]}){return series.length>1?<div className="excel-series-legend">{series.map((s,i)=><span key={i}><i style={{background:s.color}}/>{s.name}</span>)}</div>:null;}
function WorkbookTable({sheet,page,setPage,data}:{sheet:ExcelJS.Worksheet;page:number;setPage:(p:number)=>void;data:AppDataset}){
 const pageSize=25,total=sheet.rowCount,lastColumn=sheet.name==='Executive Dashboard'?15:sheet.name==='Pivot Table Analysis'?18:sheet.columnCount;
 const letters=(n:number)=>sheet.getColumn(n).letter;
 const known:Record<string,number>=sheet.name==='Executive Dashboard'?{B7:data.kpi.totalRevenue,D7:data.kpi.totalGrossProfit,F7:data.kpi.overallMarginPct,H7:data.kpi.totalUnits,J7:data.kpi.orderCount,L7:data.kpi.averageDealSize,N7:data.kpi.activeCustomers}:{};
 function display(cell:ExcelJS.Cell){const val=cell.value;if(val===null)return '';if(typeof val==='object'&&'formula' in val){const result=val.result??known[cell.address];return typeof result==='number'?fmt(result,cell.numFmt):result==null?'Recalculates in Excel':String(result);}if(typeof val==='object'&&'sharedFormula' in val)return val.result==null?'Recalculates in Excel':String(val.result);if(typeof val==='number')return fmt(val,cell.numFmt);if(val instanceof Date)return val.toISOString().slice(0,10);if(typeof val==='object'&&'richText' in val)return val.richText.map(v=>v.text).join('');if(typeof val==='object'&&'text' in val)return String(val.text);return String(val);}
 return <div className="excel-data-table"><div className="excel-table-scroll"><table><thead><tr><th aria-label="Row number"/>{Array.from({length:lastColumn},(_,i)=><th key={i}>{letters(i+1)}</th>)}</tr></thead><tbody>{Array.from({length:Math.min(pageSize,total-page*pageSize)},(_,i)=>{const rowNumber=page*pageSize+i+1;return <tr key={rowNumber}><th>{rowNumber}</th>{Array.from({length:lastColumn},(_,j)=>{const cell=sheet.getCell(rowNumber,j+1),fill=cell.fill,background=fill?.type==='pattern'&&fill.fgColor?.argb?'#'+fill.fgColor.argb.slice(-6):undefined,color=cell.font?.color?.argb?'#'+cell.font.color.argb.slice(-6):undefined;return <td key={j} title={cell.formula?`=${cell.formula}`:undefined} style={{background,color,fontWeight:cell.font?.bold?600:undefined,textAlign:typeof cell.value==='number'||cell.formula?'right':'left'}}>{cell.isMerged&&cell.master.address!==cell.address?'':display(cell)}</td>})}</tr>})}</tbody></table></div><div className="excel-pagination"><span>Rows {page*pageSize+1}–{Math.min(total,(page+1)*pageSize)} of {total.toLocaleString()}</span><div><button aria-label="Previous worksheet rows" disabled={page===0} onClick={()=>setPage(page-1)}><ChevronLeft size={15}/></button><button aria-label="Next worksheet rows" disabled={(page+1)*pageSize>=total} onClick={()=>setPage(page+1)}><ChevronRight size={15}/></button></div></div></div>;
}
