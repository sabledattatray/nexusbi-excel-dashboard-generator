import { AppDataset, DatasetConfig, IndustryType } from '../types/dataset';
import { generateRealisticDataset, INDUSTRY_PRESETS } from './dataGenerator';
import { DOMAIN_SPECS, DomainSpec, Metric, Row } from './domainDatasets';
import { inspectDatasetSchema } from './schemaDetector';
const sales = (label='Sales value'):Metric=>({label,field:'Gross Revenue',operation:'sum',format:'currency'});
const profit:Metric={label:'Gross profit',field:'Gross Profit',operation:'sum',format:'currency'};
const margin:Metric={label:'Gross margin',field:'Gross Profit',denominator:'Gross Revenue',operation:'ratio',format:'percent'};
const units:Metric={label:'Units sold',field:'Qty',operation:'sum'};
const orders:Metric={label:'Sales orders',operation:'count'};
const deal:Metric={label:'Average order value',field:'Gross Revenue',operation:'average',format:'currency'};
const subjects:Record<IndustryType,[string,string,string]>={
 enterprise_tech:['Cloud & software sales','Subscription and platform sales by product, account and channel.','Software portfolio'],
 ecommerce_retail:['Retail trading performance','Merchandise revenue, basket economics and channel contribution.','Merchandise category'],
 healthcare_pharma:['Medical device sales performance','Equipment sales, device-family contribution and commercial margins.','Device family'],
 industrial_manufacturing:['Industrial equipment performance','Machinery orders, unit demand and product profitability.','Equipment family'],
 finance_wealth:['Financial solutions performance','FinTech platform sales, contract value and client-segment economics.','Solution family'],
 real_estate:['Property solutions performance','Property-service sales, client value and market contribution.','Property solution'],
 human_resources:['People solutions performance','HR service and platform orders, contract value and account mix.','People solution'],
 hospitality_travel:['Hospitality solutions performance','Travel and hospitality product sales, channel mix and order value.','Hospitality product'],
 energy_utilities:['Energy solutions performance','Energy-equipment orders, portfolio mix and market economics.','Energy technology'],
 education_academic:['Education solutions performance','Learning-product sales, contract value and institutional accounts.','Education solution'],
 marketing_media:['Marketing services performance','Campaign-service sales, delivery margins and commercial channels.','Media service'],
 general_business:['Commercial performance review','Revenue, gross profit and order mix from the sales ledger.','Product category']
};
export function getProfessionalSpec(data:AppDataset):DomainSpec {
 const original=DOMAIN_SPECS[data.config.industry];
 if(!data.transactions.length)return original;
 const [title,subtitle,category]=subjects[data.config.industry];
 const metrics=[sales(),profit,margin,units];
 const index=Object.keys(DOMAIN_SPECS).indexOf(data.config.industry);
 if(index%3===1)metrics.splice(0,4,sales(),orders,deal,margin);
 if(index%3===2)metrics.splice(0,4,sales(),units,profit,deal);
 const fieldSets=[['Order Date','Product Category','Qty','Sales Channel'],['Order Date','Product Category','Global Region','Sales Channel'],['Product Category','Order Date','Product Category','Sales Channel'],['Order Date','Product Category','Global Region','Qty'],['Product Category','Qty','Global Region','Sales Channel'],['Global Region','Order Date','Product Category','Sales Channel'],['Product Category','Sales Channel','Global Region','Product Category'],['Order Date','Global Region','Sales Channel','Product Category'],['Order Date','Product Category','Global Region','Qty'],['Product Category','Qty','Global Region','Sales Channel'],['Sales Channel','Product Category','Order Date','Qty'],['Order Date','Global Region','Sales Channel','Qty']][index];
 const chosenMetrics=[sales(),index%2?profit:sales(),index%3===0?margin:units,index%2?deal:sales()];
 const charts=original.charts.map((c,i)=>{
  const dimension=fieldSets[i],metric=c.kind==='donut'||c.kind==='treemap'?sales():chosenMetrics[i];
  const kind=c.kind;
  const title=kind==='scatter'?'Order quantity vs. sales value':dimension==='Order Date'?`${metric.label} by month`:dimension==='Product Category'?`${metric.label} by ${category.toLowerCase()}`:`${metric.label} by ${dimension.toLowerCase()}`;
  return {...c,title,question:kind==='scatter'?'Compare order size and value from the transaction ledger.':`${metric.label} calculated from actual ${dimension==='Order Date'?'order dates':dimension.toLowerCase()} fields.`,dimension:kind==='scatter'?'Product Category':dimension,metric,x:kind==='scatter'?'Qty':undefined,secondary:kind==='scatter'?'Gross Revenue':kind==='heatmap'?(dimension==='Global Region'?'Product Category':'Global Region'):undefined};
 });
 return {...original,title,subtitle,grain:'One sales transaction (original commercial sample)',filter:'Global Region',date:'Order Date',primary:'Gross Revenue',category:'Product Category',metrics,charts};
}
export function generateProfessionalDataset(config:DatasetConfig,seedOffset=0):AppDataset {
 return attachCommercialSource(generateRealisticDataset(config,seedOffset));
}
export function attachCommercialSource(data:AppDataset):AppDataset {
 const config=data.config;
 // Keep the original transaction, catalog, regional and customer models intact.
 // The named source view only exposes the same fields for the web dashboard.
 const rows:Row[]=data.transactions.map(t=>({'Record ID':t.id,'Transaction ID':t.id,'Order Date':t.orderDate,'Quarter':t.quarter,'Client Organization':t.customerName,'Segment Tier':t.customerTier,'Global Region':t.region,'Country':t.country,'Sales Channel':t.salesChannel,'Product SKU':t.sku,'Product Name':t.productName,'Product Category':t.productCategory,'Unit Cost':t.unitCost,'List Price':t.unitPrice,'Qty':t.quantity,'Discount %':t.discountPct,'Gross Revenue':t.revenue,'Total COGS':t.cogs,'Gross Profit':t.grossProfit,'Margin %':t.marginPct,'Fulfillment':t.status}));
 data.rawRows=rows;data.originalHeaders=Object.keys(rows[0]||{});data.schemaProfile=inspectDatasetSchema(data.originalHeaders,rows);
 data.schemaProfile.detectedIndustry=config.industry;data.schemaProfile.primaryMetric='Gross Revenue';data.schemaProfile.primaryMetricLabel='Gross Revenue';data.schemaProfile.primaryCategory='Product Category';data.schemaProfile.primaryCategoryLabel='Product Category';data.schemaProfile.dateColumn='Order Date';data.schemaProfile.secondaryMetric='Gross Profit';data.schemaProfile.secondaryMetricLabel='Gross Profit';data.schemaProfile.volumeMetric='Qty';data.schemaProfile.volumeMetricLabel='Qty';data.schemaProfile.secondaryCategory='Global Region';data.schemaProfile.secondaryCategoryLabel='Global Region';data.schemaProfile.entityColumn='Client Organization';
 for(const c of data.schemaProfile.columns)if(['Discount %','Margin %'].includes(c.name)){c.dataType='percentage';c.percentageScale='fraction';}
 return data;
}
