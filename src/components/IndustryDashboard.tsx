import React, { useMemo, useState, useEffect } from 'react';

import { ArrowUpRight, Filter, Database, Info } from 'lucide-react';

import { AppDataset } from '../types/dataset';

import { getProfessionalSpec } from '../utils/professionalPresentation';
import { DomainChart, DomainSpec, Row, groupRows, metricValue, formatMetric } from '../utils/domainDatasets';
import { getDimensionAllLabel } from '../utils/industryTheme';

export function IndustryDashboard({data,onRecords}:{data:AppDataset;onRecords:()=>void}) {

 const spec=getProfessionalSpec(data);

 const filter1Label = data.schemaProfile?.secondaryCategoryLabel || spec.filter || 'Global Region';
 const filter1All = getDimensionAllLabel(filter1Label);
 const filter2Label = data.schemaProfile?.channelColumnLabel || 'Sales Channel';
 const filter2All = getDimensionAllLabel(filter2Label);

 const [filter1, setFilter1] = useState('');
 const [filter2, setFilter2] = useState('');

 useEffect(() => {
  setFilter1('');
  setFilter2('');
 }, [data]);

 const getCleanChoices = (primaryKey: string, fallbackKey?: string) => {
  const set = new Set<string>();
  for (const r of data.rawRows || []) {
   const val = r[primaryKey] ?? (fallbackKey ? r[fallbackKey] : undefined);
   if (val !== null && val !== undefined) {
    const str = String(val).trim();
    if (str && str !== 'undefined' && str !== 'null') {
     set.add(str);
    }
   }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
 };

 const choices1 = useMemo(() => getCleanChoices(filter1Label, 'Global Region'), [data, filter1Label]);
 const choices2 = useMemo(() => getCleanChoices(filter2Label, 'Sales Channel'), [data, filter2Label]);

 const rows = useMemo(() => {
  return (data.rawRows as Row[] || []).filter((r) => {
   if (filter1) {
    const v1 = String(r[filter1Label] ?? r['Global Region'] ?? r[spec.filter] ?? '').trim();
    if (v1 !== filter1) return false;
   }
   if (filter2) {
    const v2 = String(r[filter2Label] ?? r['Sales Channel'] ?? '').trim();
    if (v2 !== filter2) return false;
   }
   return true;
  });
 }, [data, filter1, filter2, filter1Label, filter2Label, spec.filter]);

 const fmt=(value:number,metric=spec.metrics[0],compact=false)=>formatMetric(value,metric,data.config.currency,compact);

 return <section className={`industry-dashboard domain-${spec.layout}`} style={{'--domain-color':spec.color,'--domain-tint':spec.tint} as React.CSSProperties} aria-label={`${spec.title} dashboard`}>

  <header className="domain-header">
   <div>
    <div className="domain-eyebrow">{data.config.industry.replaceAll('_',' ')} / {data.schemaProfile?.isCustomUpload ? 'VERIFIED DATASET' : 'SAMPLE REPORT'}</div>
    <h2>{spec.title}</h2>
    <p>{spec.subtitle}</p>
   </div>
   <div className="domain-filter-group" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
    <label className="domain-filter">
     <span><Filter size={13}/> {filter1Label}</span>
     <select aria-label={`Filter ${filter1Label}`} value={filter1} onChange={e => setFilter1(e.target.value)}>
      <option value="">{filter1All}</option>
      {choices1.map(c => <option key={c} value={c}>{c}</option>)}
     </select>
    </label>
    {choices2.length >= 2 && (
     <label className="domain-filter">
      <span><Filter size={13}/> {filter2Label}</span>
      <select aria-label={`Filter ${filter2Label}`} value={filter2} onChange={e => setFilter2(e.target.value)}>
       <option value="">{filter2All}</option>
       {choices2.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
     </label>
    )}
   </div>
  </header>

  <div className="domain-meta"><span><Database size={13}/>{rows.length.toLocaleString()} of {data.rawRows?.length.toLocaleString()} records</span><span>{spec.grain}</span><span>{data.schemaProfile?.isCustomUpload ? 'Verified source data · all figures calculated from records' : 'Illustrative data · all figures calculated from records'}</span></div>

  <div className="domain-kpis">{spec.metrics.map((m,i)=><article className="domain-kpi" key={m.label}><span className="domain-kpi-index">0{i+1}</span><p>{m.label}</p><strong title={fmt(metricValue(rows,m),m)}>{fmt(metricValue(rows,m),m,true)}</strong><small>{m.operation==='ratio'?`${m.field} ÷ ${m.denominator}`:m.operation==='count'?'Count of records':`${m.operation==='average'?'Average':'Sum'} of ${m.field}`}</small></article>)}</div>

  <div className="domain-chart-grid">{spec.charts.map((chart,i)=><article className={`domain-chart chart-${chart.kind} ${chart.wide?'domain-wide':''}`} key={chart.title}><header><div><span className="domain-chart-number">{String(i+1).padStart(2,'0')} / {chart.kind==='rank'?'RANKING':chart.kind.toUpperCase()}</span><h3>{chart.title}</h3><p>{chart.question}</p></div><span className="domain-chart-icon"><ArrowUpRight size={17}/></span></header><DomainVisual chart={chart} rows={rows} spec={spec} format={v=>fmt(v,chart.metric,true)}/><div className="domain-chart-source">{chart.kind==='scatter'?`${chart.x} × ${chart.secondary}`:chart.metric.operation==='ratio'?`Σ ${chart.metric.field} / Σ ${chart.metric.denominator}`:chart.metric.operation==='count'?'Record count':`${chart.metric.operation}(${chart.metric.field})`} · {chart.dimension===spec.date?'Calendar month':chart.dimension}{chart.kind==='scatter'?' · Up to 160 records shown':''}</div></article>)}</div>

  <div className="domain-bottom"><div><Info size={18}/><div><strong>Every visual has a source.</strong><p>Open field verification to inspect detected types, or review the records behind this report. Filters affect this dashboard; Excel exports all records.</p></div></div><button onClick={onRecords}>Explore source records <ArrowUpRight size={15}/></button></div>

 </section>;

}

function DomainVisual({chart,rows,spec,format}:{chart:DomainChart;rows:Row[];spec:DomainSpec;format:(v:number)=>string}) {

 const points=groupRows(rows,chart.dimension,chart.metric,chart.dimension===spec.date);

 const palette=[spec.color,'#86aaa7','#b9c8a0','#d4ad80','#a5a4bd','#8bb9cc'];

 if(!rows.length) return <p className="domain-empty">No records match this filter.</p>;

 if(chart.kind==='heatmap') {

  const xs=[...new Set(rows.map(r=>String(r[chart.secondary!])))].sort(),ys=[...new Set(rows.map(r=>String(r[chart.dimension])))].sort();

  const cells=ys.flatMap(y=>xs.map(x=>{const group=rows.filter(r=>r[chart.dimension]===y&&r[chart.secondary!]===x);return {x,y,value:metricValue(group,chart.metric),count:group.length};}));

  const min=Math.min(...cells.filter(c=>c.count).map(c=>c.value)),max=Math.max(...cells.map(c=>c.value));

  return <div className="domain-matrix-wrap"><div className="domain-matrix" style={{gridTemplateColumns:`minmax(110px,1.2fr) repeat(${xs.length},minmax(75px,1fr))`}}><div/>{xs.map(x=><span className="matrix-heading" key={x}>{x}</span>)}{ys.map(y=><React.Fragment key={y}><span className="matrix-row">{y}</span>{xs.map(x=>{const c=cells.find(c=>c.x===x&&c.y===y)!;return <div key={x} className="matrix-cell" style={{background:c.count?`color-mix(in srgb, ${spec.color} ${20+60*(c.value-min)/(max-min||1)}%, white)`:'#f4f5f4',color:c.count&&((c.value-min)/(max-min||1))>.55?'white':'#263d39'}} title={`${y} / ${x}: ${format(c.value)} · ${c.count} records`}>{c.count?format(c.value):'—'}</div>})}</React.Fragment>)}</div><div className="matrix-legend"><span>Lower value</span><i style={{background:`linear-gradient(90deg,${spec.tint},${spec.color})`}}/><span>Higher value</span></div></div>;

 }

 if(chart.kind==='donut') {

  const total=points.reduce((s,p)=>s+p.value,0);let offset=0;

  return <div className="domain-donut"><svg viewBox="0 0 190 190" role="img" aria-label={chart.title}><circle cx="95" cy="95" r="68" stroke="#edf0ed" strokeWidth="23" fill="none"/>{points.map((p,i)=>{const part=total?p.value/total:0,start=offset;offset+=part;return <circle key={p.label} cx="95" cy="95" r="68" fill="none" stroke={palette[i%palette.length]} strokeWidth="23" pathLength="100" strokeDasharray={`${part*100} ${100-part*100}`} strokeDashoffset={-start*100} transform="rotate(-90 95 95)"><title>{p.label}: {format(p.value)}</title></circle>})}<text x="95" y="92" textAnchor="middle" fontSize="24" fontWeight="600" fill="#273b35">{points.length}</text><text x="95" y="113" textAnchor="middle" fontSize="11" fill="#708078">groups</text></svg><div>{points.map((p,i)=><div className="domain-legend-row" key={p.label}><i style={{background:palette[i%palette.length]}}/><span>{p.label}</span><strong>{total?(p.value/total*100).toFixed(1):0}%</strong><small>{format(p.value)}</small></div>)}</div></div>;

 }

 if(chart.kind==='treemap') {

  const total=points.reduce((s,p)=>s+p.value,0);

  const tiles:{label:string;value:number;x:number;y:number;w:number;h:number}[]=[];

  const place=(items:typeof points,x:number,y:number,w:number,h:number)=>{

   if(!items.length)return;

   if(items.length===1){tiles.push({...items[0],x,y,w,h});return;}

   const sum=items.reduce((s,p)=>s+p.value,0);let subtotal=0,index=0;

   while(index<items.length-1 && subtotal<sum/2){subtotal+=items[index].value;index++;}

   const fraction=sum?subtotal/sum:index/items.length;

   if(w>h){place(items.slice(0,index),x,y,w*fraction,h);place(items.slice(index),x+w*fraction,y,w*(1-fraction),h);}

   else {place(items.slice(0,index),x,y,w,h*fraction);place(items.slice(index),x,y+h*fraction,w,h*(1-fraction));}

  };

  place(points,0,0,600,270);

  return <svg viewBox="0 0 600 270" className="domain-treemap" role="img" aria-label={chart.title}>{tiles.map((p,i)=><g key={p.label}><rect x={p.x+2} y={p.y+2} width={Math.max(0,p.w-4)} height={Math.max(0,p.h-4)} rx="6" fill={palette[i%palette.length]}><title>{p.label}: {format(p.value)} · {total?(p.value/total*100).toFixed(1):0}%</title></rect>{p.w>80&&p.h>55&&<><text x={p.x+13} y={p.y+25} fill="white" fontSize="11" style={{textShadow:'0 1px 3px #0006'}}>{p.label.length>p.w/7?p.label.slice(0,Math.floor(p.w/7)-2)+'…':p.label}</text><text x={p.x+13} y={p.y+49} fill="white" fontSize="18" fontWeight="600" style={{textShadow:'0 1px 3px #0006'}}>{format(p.value)}</text></>}</g>)}</svg>;

 }

 if(chart.kind==='scatter') {

  const sample=rows.slice(0,160),xmax=Math.max(...sample.map(r=>Number(r[chart.x!])))*1.1||1, yvalues=sample.map(r=>Number(r[chart.secondary!])),ymin=Math.min(0,...yvalues),ymax=Math.max(0,...yvalues)*1.1||1;

  const axisFormat=(v:number,field:string)=>new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1,...(['Seat Utilization','Attendance Rate','Volatility','Return'].includes(field)?{style:'percent' as const}:{})}).format(v);

  return <div className="domain-plot"><svg viewBox="0 0 650 290" role="img" aria-label={chart.title}>{[0,.5,1].map(t=><g key={t}><line x1="64" x2="620" y1={225-t*190} y2={225-t*190} stroke="#e7ece8"/><text x="56" y={229-t*190} textAnchor="end" fontSize="10" fill="#718078">{axisFormat(ymin+t*(ymax-ymin),chart.secondary!)}</text><text x={64+t*556} y="244" textAnchor="middle" fontSize="10" fill="#718078">{axisFormat(t*xmax,chart.x!)}</text></g>)}{sample.map((r,i)=><circle key={i} cx={64+Number(r[chart.x!])/xmax*556} cy={225-(Number(r[chart.secondary!])-ymin)/(ymax-ymin||1)*190} r="4.5" fill={palette[[...new Set(rows.map(r=>r[chart.dimension]))].indexOf(r[chart.dimension])%palette.length]} opacity=".68"><title>{r['Record ID']} · {r[chart.dimension]} · {chart.x}: {r[chart.x!]} · {chart.secondary}: {r[chart.secondary!]}</title></circle>)}<text x="340" y="280" textAnchor="middle" fill="#65776d" fontSize="11">{chart.x}</text><text x="65" y="17" fill="#65776d" fontSize="11">{chart.secondary}</text></svg><div className="scatter-legend">{[...new Set(rows.map(r=>String(r[chart.dimension])))].map((v,i)=><span key={v}><i style={{background:palette[i%palette.length]}}/>{v}</span>)}</div></div>;

 }

 if(['bars','rank','lollipop'].includes(chart.kind)) {

  const min=Math.min(0,...points.map(p=>p.value)),max=Math.max(0,...points.map(p=>p.value)),range=max-min||1,zero=-min/range*100;

  return <div className={`domain-bars domain-bars-${chart.kind}`}>{points.map((p,i)=>{const end=(p.value-min)/range*100;return <div className="domain-bar-row" key={p.label}><div className="domain-bar-label">{chart.kind==='rank'&&<em>{String(i+1).padStart(2,'0')}</em>}<span>{p.label}</span><strong>{format(p.value)}</strong></div><div className="domain-bar-track"><i style={{left:`${Math.min(zero,end)}%`,width:`${Math.abs(end-zero)}%`,background:p.value<0?'#bd665a':spec.color}}/>{chart.kind==='lollipop'&&<b style={{left:`calc(${end}% - 5px)`,background:spec.color}}/>}</div></div>})}</div>;

 }

 const min=Math.min(0,...points.map(p=>p.value)),max=Math.max(0,...points.map(p=>p.value)),range=max-min||1;

 const x=(i:number)=>70+i*540/Math.max(1,points.length-1),y=(v:number)=>220-(v-min)/range*175;

 const line=points.map((p,i)=>`${x(i)},${y(p.value)}`).join(' ');

 return <svg className="domain-trend" viewBox="0 0 660 280" role="img" aria-label={chart.title}>{[0,.5,1].map(t=><g key={t}><line x1="70" x2="620" y1={45+t*175} y2={45+t*175} stroke="#e6ece7" strokeDasharray="3 4"/><text x="60" y={49+t*175} textAnchor="end" fontSize="10" fill="#75837b">{format(max-t*range)}</text></g>)}{chart.kind==='area'&&<polygon points={`70,${y(0)} ${line} ${x(points.length-1)},${y(0)}`} fill={spec.color} opacity=".12"/>}{chart.kind!=='columns'&&<polyline points={line} fill="none" stroke={spec.color} strokeWidth="3" strokeLinejoin="round"/>}{points.map((p,i)=><g key={p.label}>{chart.kind==='columns'?<rect x={65+i*550/points.length} width={Math.max(8,550/points.length-14)} y={Math.min(y(p.value),y(0))} height={Math.abs(y(0)-y(p.value))} rx="4" fill={i===points.length-1?spec.color:palette[1]}><title>{p.label}: {format(p.value)}</title></rect>:<circle cx={x(i)} cy={y(p.value)} r="4" fill="white" stroke={spec.color} strokeWidth="2"><title>{p.label}: {format(p.value)}</title></circle>}<text x={chart.kind==='columns'?65+i*550/points.length+(550/points.length-14)/2:x(i)} y="247" textAnchor="middle" fontSize="9" fill="#6f7e75">{chart.dimension===spec.date?new Date(`${p.label}-15T12:00:00Z`).toLocaleDateString('en-US',{month:'short',year:'2-digit',timeZone:'UTC'}):p.label.length>13?p.label.slice(0,12)+'…':p.label}</text></g>)}</svg>;

}

