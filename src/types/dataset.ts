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
  | 'general_business';

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
  dateColumn?: string;
  dateColumnLabel?: string;
  identifierColumn?: string;
  entityColumn?: string;
  statusColumn?: string;
  detectedIndustry: IndustryType;
  industryConfidence: number;
  totalRecords: number;
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
  };
  schemaProfile?: DatasetSchemaProfile;
  rawRows?: Record<string, any>[];
  originalHeaders?: string[];
}

