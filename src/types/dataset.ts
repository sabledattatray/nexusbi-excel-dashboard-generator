export type IndustryType = 
  | 'enterprise_tech' 
  | 'ecommerce_retail' 
  | 'healthcare_pharma' 
  | 'industrial_manufacturing'
  | 'finance_wealth';

export interface Transaction {
  id: string;
  orderDate: string;
  quarter: string;
  customerId: string;
  customerName: string;
  customerTier: 'Enterprise Strategic' | 'Mid-Market' | 'Corporate' | 'SMB';
  industry: string;
  region: 'North America' | 'EMEA' | 'APAC' | 'LATAM';
  country: string;
  city: string;
  salesRep: string;
  salesChannel: 'Direct Enterprise' | 'Partner Ecosystem' | 'Inside Sales' | 'Online Enterprise';
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
  paymentTerms: 'Net 30' | 'Net 60' | 'Annual Prepaid' | 'Credit Card / ACH';
  status: 'Completed' | 'Invoiced' | 'Delivered';
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
  status: 'Active' | 'High Demand' | 'Backorder';
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
