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
  general_business:['Commercial performance review','Revenue, gross profit and order mix from the sales ledger.','Product category'],
  logistics_supply_chain:['Freight & logistics performance','Freight transport volume, on-time delivery rates and fleet costs.','Freight service'],
  automotive_ev:['EV fleet & automotive performance','Electric vehicle assembly, battery pack capacity and unit margins.','Vehicle model'],
  pharmaceutical_biotech:['Biopharma discovery performance','Drug discovery trials, screening hit rates and research investment.','Therapeutic area'],
  construction_engineering:['Civil EPC project performance','Infrastructure contract billing, equipment deployment and project progress.','Engineering trade'],
  telecom_networks:['Telecom & 5G network performance','Broadband subscriber revenue, network availability and bandwidth traffic.','Plan tier'],
  legal_compliance:['Corporate legal practice performance','Client matter billings, partner billable hours and regulatory filings.','Legal practice'],
  insurance_underwriting:['Insurance portfolio performance','Gross written premiums, loss ratios and claims settlements.','Coverage line'],
  agriculture_agritech:['Smart agritech crop performance','Crop harvest yields, farm gate revenues and acreage productivity.','Crop commodity'],
  food_beverage:['Food service & dining performance','Restaurant chain sales, dining covers and food preparation margins.','Menu department'],
  aerospace_defense:['Aerospace & defense performance','Defense program milestones, avionics testing and mission airframes.','Avionics subsystem'],
  cybersecurity_secops:['Cybersecurity operations performance','SecOps threat mitigation, MTTR containment and defense budgets.','Threat vector'],
  media_entertainment:['Digital media streaming performance','Audience watch time, licensing investments and digital ad revenues.','Media genre'],
  nonprofit_charity:['Philanthropic impact performance','Charitable donor contributions, humanitarian outreach and grant efficiency.','Mission pillar'],
  fitness_wellness:['Health & fitness club performance','Studio workout attendance, club membership dues and trainer capacity.','Workout program'],
  professional_services:['Management advisory performance','Advisory billing realization, project staffing and client retainers.','Practice capability'],
  oil_gas_mining:['Upstream energy & extraction performance','Hydrocarbon production volumes, lifting expenses and field operations.','Commodity resource'],
  fashion_luxury:['Haute couture & luxury performance','Atelier craftsmanship, boutique sales and full-price sell-through.','Collection line'],
  biomedical_genomics:['Genomics & sequencing performance','Next-gen sequencing throughput, coverage depth and library flowcells.','Assay protocol'],
  saas_product_ops:['Cloud SaaS & DevOps performance','Annual recurring revenue (ARR), NRR retention and cloud compute usage.','SaaS tier'],
  customer_support_ops:['Customer support operations performance','Helpdesk ticket resolution, contact handling duration and customer satisfaction.','Support channel']
};
export function getProfessionalSpec(data:AppDataset):DomainSpec {
 if (data.helpdeskMetrics || (data.schemaProfile?.detectedDomain === 'customer_support_ops' && data.schemaProfile?.hasFinancialMetrics === false)) {
  const orig = DOMAIN_SPECS.customer_support_ops;
  const filter1 = data.schemaProfile?.secondaryCategoryLabel || 'Resolver Group';
  const primaryCat = data.schemaProfile?.primaryCategoryLabel || 'Issue Family';
  const recCount = data.rawRows?.length ?? data.transactions?.length ?? 0;
  const title = data.config.reportTitle || 'IT Service Desk & Helpdesk Operations';
  const subtitle = `${recCount.toLocaleString()} verified service tickets · Multi-dimensional incident analytics`;

  const metrics: Metric[] = [
   { label: 'Total Service Tickets', operation: 'count' },
   { label: 'Completed Tickets', field: 'Is Completed', operation: 'sum' },
   { label: 'SLA Compliance Rate', field: 'Is SLA Met', denominator: 'Is Completed', operation: 'ratio', format: 'percent' },
   { label: 'Mean Resolution Duration (hrs)', field: 'Resolution Duration (hrs)', operation: 'average' },
  ];

  const charts = [
   {
    kind: 'line' as const,
    title: 'Ticket volume by month',
    dimension: 'Logged On',
    metric: { label: 'Tickets', operation: 'count' as const },
    question: 'How is incident volume trending across the operational calendar?',
    wide: true,
   },
   {
    kind: 'columns' as const,
    title: 'Tickets by resolver group',
    dimension: 'Resolver Group',
    metric: { label: 'Tickets', operation: 'count' as const },
    question: 'Which support tiers and resolver teams handle the largest incident workload?',
   },
   {
    kind: 'treemap' as const,
    title: 'Incident distribution by issue family',
    dimension: primaryCat,
    metric: { label: 'Tickets', operation: 'count' as const },
    question: 'Where are incident concentrations by technical domain?',
   },
   {
    kind: 'bars' as const,
    title: 'Tickets by urgency band',
    dimension: 'Urgency Band',
    metric: { label: 'Tickets', operation: 'count' as const },
    question: 'What is the volume distribution across severity priorities?',
   },
  ];

  return {
   ...orig,
   title,
   subtitle,
   grain: 'One service desk incident / ticket',
   color: '#0d9488',
   tint: '#ccfbf1',
   layout: 'support',
   filter: filter1,
   date: 'Logged On',
   primary: 'Total Tickets',
   category: primaryCat,
   metrics,
   charts,
  };
 }

 const original=DOMAIN_SPECS[data.config.industry];
 if(!data.transactions.length)return original;
 const [title,subtitle,category]=subjects[data.config.industry] || subjects.general_business;
 const metrics=[sales(),profit,margin,units];
 const index=Object.keys(DOMAIN_SPECS).indexOf(data.config.industry);
 if(index%3===1)metrics.splice(0,4,sales(),orders,deal,margin);
 if(index%3===2)metrics.splice(0,4,sales(),units,profit,deal);
 const fieldSetsPatterns=[['Order Date','Product Category','Qty','Sales Channel'],['Order Date','Product Category','Global Region','Sales Channel'],['Product Category','Order Date','Product Category','Sales Channel'],['Order Date','Product Category','Global Region','Qty'],['Product Category','Qty','Global Region','Sales Channel'],['Global Region','Order Date','Product Category','Sales Channel'],['Product Category','Sales Channel','Global Region','Product Category'],['Order Date','Global Region','Sales Channel','Product Category'],['Order Date','Product Category','Global Region','Qty'],['Product Category','Qty','Global Region','Sales Channel'],['Sales Channel','Product Category','Order Date','Qty'],['Order Date','Global Region','Sales Channel','Qty']];
 const fieldSets=fieldSetsPatterns[(index >= 0 ? index : 0) % fieldSetsPatterns.length];
 const chosenMetrics=[sales(),index%2?profit:sales(),index%3===0?margin:units,index%2?deal:sales()];
 const charts=original.charts.map((c,i)=>{
  const dimension=fieldSets[i],metric=c.kind==='donut'||c.kind==='treemap'?sales():chosenMetrics[i];
  const kind=c.kind;
  const title=kind==='scatter'?'Order quantity vs. sales value':dimension==='Order Date'?`${metric.label} by month`:dimension==='Product Category'?`${metric.label} by ${category.toLowerCase()}`:`${metric.label} by ${dimension.toLowerCase()}`;
  return {...c,title,question:kind==='scatter'?'Compare order size and value from the transaction ledger.':`${metric.label} calculated from actual ${dimension==='Order Date'?'order dates':dimension.toLowerCase()} fields.`,dimension:kind==='scatter'?'Product Category':dimension,metric,x:kind==='scatter'?'Qty':undefined,secondary:kind==='scatter'?'Gross Revenue':kind==='heatmap'?(dimension==='Global Region'?'Product Category':'Global Region'):undefined};
 });
 const resolvedFilter = data.schemaProfile?.secondaryCategoryLabel || (original ? original.filter : undefined) || 'Global Region';
 const resolvedCategory = data.schemaProfile?.primaryCategoryLabel || 'Product Category';
 const isCustom = Boolean(data.schemaProfile?.isCustomUpload);
 const displayTitle = isCustom && data.config.reportTitle ? data.config.reportTitle : title;
 const displaySubtitle = isCustom ? `${data.transactions.length.toLocaleString()} verified source records · Multi-dimensional analytics` : subtitle;
 const grain = isCustom ? 'One verified source transaction' : 'One sales transaction (original commercial sample)';
 return {...original,title:displayTitle,subtitle:displaySubtitle,grain,filter:resolvedFilter,date:'Order Date',primary:'Gross Revenue',category:resolvedCategory,metrics,charts};
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
