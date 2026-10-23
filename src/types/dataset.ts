export type IndustryType = 
  | 'enterprise_tech' 
  | 'ecommerce_retail' 
  | 'healthcare_pharma' 
  | 'industrial_manufacturing'
  | 'finance_wealth'
  | 'real_estate'
  | 'human_resources'
  | 'hospitality_travel'
  | 'energy_utilities'
  | 'education_academic'
  | 'marketing_media'
  | 'general_business'
  | 'logistics_supply_chain'
  | 'automotive_ev'
  | 'pharmaceutical_biotech'
  | 'construction_engineering'
  | 'telecom_networks'
  | 'legal_compliance'
  | 'insurance_underwriting'
  | 'agriculture_agritech'
  | 'food_beverage'
  | 'aerospace_defense'
  | 'cybersecurity_secops'
  | 'media_entertainment'
  | 'nonprofit_charity'
  | 'fitness_wellness'
  | 'professional_services'
  | 'oil_gas_mining'
  | 'fashion_luxury'
  | 'biomedical_genomics'
  | 'saas_product_ops'
  | 'customer_support_ops';

export type ColumnDataType = 
  | 'currency' 
  | 'numeric' 
  | 'percentage' 
  | 'date' 
  | 'categorical' 
  | 'identifier' 
  | 'text' 
  | 'boolean';

export interface ColumnProfile {
  name: string;
  normalizedName: string;
  dataType: ColumnDataType;
  percentageScale?: 'fraction' | 'whole';
  sampleValues: any[];
  nonNullCount: number;
  distinctCount: number;
  stats?: {
    min?: number | string;
    max?: number | string;
    sum?: number;
    avg?: number;
  };
  suggestedRole?: 
    | 'primaryMetric' 
    | 'secondaryMetric' 
    | 'volumeMetric' 
    | 'primaryCategory' 
    | 'secondaryCategory' 
    | 'date' 
    | 'identifier' 
    | 'entityName'
    | 'status';
}

export interface DatasetSchemaProfile {
  columns: ColumnProfile[];
  primaryMetric: string;
  primaryMetricLabel: string;
  secondaryMetric?: string;
  secondaryMetricLabel?: string;
  volumeMetric?: string;
  volumeMetricLabel?: string;
  primaryCategory: string;
  primaryCategoryLabel: string;
  secondaryCategory?: string;
  secondaryCategoryLabel?: string;
  channelColumn?: string;
  channelColumnLabel?: string;
  dateColumn?: string;
  dateColumnLabel?: string;
  identifierColumn?: string;
  entityColumn?: string;
  statusColumn?: string;
  detectedIndustry: IndustryType;
  industryConfidence: number;
  totalRecords: number;
  isCustomUpload?: boolean;
  currencyCode?: string;
  currencySymbol?: string;
  detectedDomain?: 'sales' | 'customer_support_ops' | 'generic';
  hasFinancialMetrics?: boolean;
  grain?: string;
  slaLimitColumn?: string;
  reopenedColumn?: string;
  ratingColumn?: string;
  startDateColumn?: string;
  endDateColumn?: string;
  priorityColumn?: string;
  teamColumn?: string;
  intakeColumn?: string;
  locationColumn?: string;
}

export interface HelpdeskMetrics {
  totalTickets: number;
  completedTickets: number;
  unresolvedTickets: number;
  slaMet: number;
  slaBreached: number;
  slaComplianceRate: number;
  meanResolutionHours: number;
  reopenedCount: number;
  ratingCount: number;
  meanRating: number;
  monthlyTrend: {
    monthKey: string;
    monthLabel: string;
    ticketCount: number;
    completedCount: number;
    slaMetCount: number;
    complianceRate: number;
  }[];
  statusBreakdown: { status: string; count: number; sharePct: number }[];
  urgencyBreakdown: { urgency: string; count: number; sharePct: number; slaLimit: number }[];
  resolverBreakdown: {
    resolver: string;
    total: number;
    completed: number;
    slaMet: number;
    slaBreached: number;
    complianceRate: number;
    avgDurationHours: number;
  }[];
  intakeBreakdown: { channel: string; count: number; sharePct: number }[];
  issueBreakdown: { issue: string; count: number; sharePct: number }[];
  siteBreakdown: { site: string; count: number; sharePct: number }[];
  ratingsBreakdown: { rating: number; count: number; sharePct: number }[];
}

export interface Transaction {
  id: string;
  orderDate: string;
  quarter: string;
  customerId: string;
  customerName: string;
  customerTier: 'Enterprise Strategic' | 'Mid-Market' | 'Corporate' | 'SMB' | string;
  industry: string;
  region: 'North America' | 'EMEA' | 'APAC' | 'LATAM' | string;
  country: string;
  city: string;
  salesRep: string;
  salesChannel: 'Direct Enterprise' | 'Partner Ecosystem' | 'Inside Sales' | 'Online Enterprise' | string;
  sku: string;
  productName: string;
  productCategory: string;
  unitCost: number;
  unitPrice: number;
  quantity: number;
  discountPct: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  marginPct: number;
  paymentTerms: 'Net 30' | 'Net 60' | 'Annual Prepaid' | 'Credit Card / ACH' | string;
  status: 'Completed' | 'Invoiced' | 'Delivered' | string;
  grossSales?: number;
  discountAmount?: number;
  paymentStatus?: string;
  // Dynamic fields from uploaded data
  rawRow?: Record<string, any>;
}

export interface ProductCatalogItem {
  sku: string;
  productName: string;
  category: string;
  unitCost: number;
  listPrice: number;
  standardMarginPct: number;
  leadTimeDays: number;
  stockLevel: number;
  status: 'Active' | 'High Demand' | 'Backorder' | string;
  unitsSold?: number;
  realizedRevenue?: number;
  realizedProfit?: number;
  realizedMarginPct?: number;
}

export interface RegionalPerformance {
  region: string;
  countries: string;
  targetRevenue: number;
  actualRevenue: number;
  targetProfit: number;
  actualProfit: number;
  quotaAttainmentPct: number;
  orderCount: number;
  averageDealSize: number;
  growthRateYoY: number;
  regionalDirector: string;
  actualUnits?: number;
  actualCost?: number;
  marginPct?: number;
  operatingCities?: string[];
}

export interface CustomerAccount {
  customerId: string;
  customerName: string;
  tier: string;
  industry: string;
  country: string;
  totalOrders: number;
  lifetimeRevenue: number;
  lifetimeProfit: number;
  contractRenewal: string;
  accountHealth: 'Optimal' | 'Stable' | 'At Risk';
  accountExecutive: string;
  city?: string;
  region?: string;
  totalUnits?: number;
  marginPct?: number;
  paymentStatus?: string;
}

export interface MonthlyTrend {
  monthKey: string;
  monthLabel: string;
  revenue: number;
  grossProfit: number;
  orderCount: number;
  marginPct: number;
}

export interface CategorySummary {
  category: string;
  units: number;
  revenue: number;
  grossProfit: number;
  marginPct: number;
  sharePct: number;
}

export interface DatasetConfig {
  companyName: string;
  reportTitle: string;
  industry: IndustryType;
  recordCount: number;
  currency: string;
  currencySymbol: string;
  includeChartsInExcel: boolean;
  useLiveExcelFormulas: boolean;
}

export interface AppDataset {
  config: DatasetConfig;
  transactions: Transaction[];
  productCatalog: ProductCatalogItem[];
  regionalPerformance: RegionalPerformance[];
  customerAccounts: CustomerAccount[];
  monthlyTrends: MonthlyTrend[];
  categorySummaries: CategorySummary[];
  kpi: {
    totalRevenue: number;
    totalGrossProfit: number;
    totalCogs: number;
    totalUnits: number;
    orderCount: number;
    averageDealSize: number;
    overallMarginPct: number;
    topRegion: string;
    topCategory: string;
    activeCustomers: number;
    totalGrossSales?: number;
    totalDiscountAmount?: number;
    averageGrossDealSize?: number;
  };
  schemaProfile?: DatasetSchemaProfile;
  rawRows?: Record<string, any>[];
  originalHeaders?: string[];
  helpdeskMetrics?: HelpdeskMetrics;
}

