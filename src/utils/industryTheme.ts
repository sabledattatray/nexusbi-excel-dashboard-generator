import { IndustryType, DatasetSchemaProfile } from '../types/dataset';

export interface IndustryTheme {
  id: IndustryType;
  name: string;
  badge: string;
  description: string;
  icon: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    dark: string;
    light: string;
    cardGlow: string;
    borderColor: string;
    textColor: string;
    badgeBg: string;
    chartPalette: string[];
    excel: {
      tabColor: string;     // ARGB hex
      headerFill: string;   // ARGB hex
      headerText: string;   // ARGB hex
      accentFill: string;   // ARGB hex
      accentText: string;   // ARGB hex
      border: string;       // ARGB hex
      chartThemeHex: string[]; // 6 hex codes without #
    };
  };
  kpiLabels: {
    metric1: string;
    metric2: string;
    metric3: string;
    metric4: string;
    metric5: string;
    metric6: string;
    categoryLabel: string;
    dimensionLabel: string;
    entityLabel: string;
  };
}

export const INDUSTRY_THEMES: Record<IndustryType, IndustryTheme> = {
  // 1. Healthcare, Pharma & Life Sciences
  healthcare_pharma: {
    id: 'healthcare_pharma',
    name: 'Healthcare & Clinical Analytics',
    badge: 'Clinical & Life Sciences',
    description: 'Patient care volumes, treatment costs, clinical department outcomes, and surgical diagnostics.',
    icon: 'Activity',
    colors: {
      primary: '#0D9488', // Teal 600
      secondary: '#059669', // Emerald 600
      accent: '#0891B2', // Cyan 600
      dark: '#042F2E', // Teal 950
      light: '#CCFBF1', // Teal 100
      cardGlow: 'from-teal-500/15 via-emerald-500/5 to-transparent',
      borderColor: 'border-teal-500/30',
      textColor: 'text-teal-400',
      badgeBg: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
      chartPalette: ['#0D9488', '#059669', '#0891B2', '#14B8A6', '#10B981', '#06B6D4'],
      excel: {
        tabColor: 'FF0D9488',
        headerFill: 'FF0F3835',
        headerText: 'FFFFFFFF',
        accentFill: 'FFE6FFFA',
        accentText: 'FF0D9488',
        border: 'FF0D9488',
        chartThemeHex: ['0D9488', '059669', '0891B2', '14B8A6', '10B981', '06B6D4'],
      },
    },
    kpiLabels: {
      metric1: 'Total Treatment Spend / Value',
      metric2: 'Net Clinical Margin / Recovery',
      metric3: 'Clinical Efficiency Rate',
      metric4: 'Patient Encounters / Admissions',
      metric5: 'Total Clinical Procedures',
      metric6: 'Average Cost per Patient',
      categoryLabel: 'Clinical Specialty / Department',
      dimensionLabel: 'Hospital Network / Ward',
      entityLabel: 'Patient / Provider',
    },
  },

  // 2. Finance, Banking & Wealth Management
  finance_wealth: {
    id: 'finance_wealth',
    name: 'Finance, Banking & Wealth Portfolio',
    badge: 'Banking & Capital Markets',
    description: 'Portfolio balance, asset under management (AUM), credit yields, and financial risk models.',
    icon: 'Landmark',
    colors: {
      primary: '#1E3A8A', // Blue 900
      secondary: '#D97706', // Amber 600
      accent: '#047857', // Emerald 700
      dark: '#0B1329', // Deep navy
      light: '#FEF3C7', // Amber 100
      cardGlow: 'from-blue-600/15 via-amber-500/10 to-transparent',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      chartPalette: ['#1E3A8A', '#D97706', '#059669', '#2563EB', '#F59E0B', '#10B981'],
      excel: {
        tabColor: 'FFD97706',
        headerFill: 'FF0F172A',
        headerText: 'FFFFFFFF',
        accentFill: 'FFFEF3C7',
        accentText: 'FF92400E',
        border: 'FFD97706',
        chartThemeHex: ['1E3A8A', 'D97706', '059669', '2563EB', 'F59E0B', '10B981'],
      },
    },
    kpiLabels: {
      metric1: 'Total Portfolio Assets / Balance',
      metric2: 'Net Interest Income / Return',
      metric3: 'Risk-Adjusted Return / Yield',
      metric4: 'Active Contracts / Accounts',
      metric5: 'Total Cleared Transactions',
      metric6: 'Average Position Size',
      categoryLabel: 'Asset Class / Financial Product',
      dimensionLabel: 'Capital Market / Custody Region',
      entityLabel: 'Client Portfolio / Account',
    },
  },

  // 3. Retail & Omnichannel E-Commerce
  ecommerce_retail: {
    id: 'ecommerce_retail',
    name: 'Global Retail & Omnichannel E-Commerce',
    badge: 'Retail & Consumer Goods',
    description: 'Gross merchandise value (GMV), customer checkout volume, returns, and inventory fulfillment.',
    icon: 'ShoppingBag',
    colors: {
      primary: '#4F46E5', // Indigo 600
      secondary: '#E11D48', // Rose 600
      accent: '#7C3AED', // Violet 600
      dark: '#1E1B4B', // Indigo 950
      light: '#FFE4E6', // Rose 100
      cardGlow: 'from-indigo-500/15 via-rose-500/10 to-transparent',
      borderColor: 'border-indigo-500/30',
      textColor: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      chartPalette: ['#4F46E5', '#E11D48', '#7C3AED', '#F43F5E', '#8B5CF6', '#F59E0B'],
      excel: {
        tabColor: 'FF4F46E5',
        headerFill: 'FF1E1B4B',
        headerText: 'FFFFFFFF',
        accentFill: 'FFEEF2FF',
        accentText: 'FF4338CA',
        border: 'FF4F46E5',
        chartThemeHex: ['4F46E5', 'E11D48', '7C3AED', 'F43F5E', '8B5CF6', 'F59E0B'],
      },
    },
    kpiLabels: {
      metric1: 'Gross Merchandise Value (GMV)',
      metric2: 'Net Realized Profit',
      metric3: 'Gross Profit Margin %',
      metric4: 'Units Sold & Shipped',
      metric5: 'Total Orders Placed',
      metric6: 'Average Order Value (AOV)',
      categoryLabel: 'Merchandise Category',
      dimensionLabel: 'Fulfillment Region / Store',
      entityLabel: 'Customer / Buyer',
    },
  },

  // 4. Enterprise Tech & Cloud SaaS
  enterprise_tech: {
    id: 'enterprise_tech',
    name: 'Enterprise Tech & Cloud SaaS',
    badge: 'Cloud & B2B Software',
    description: 'Annual recurring revenue (ARR), subscription tiers, cloud compute consumption, and renewals.',
    icon: 'Cpu',
    colors: {
      primary: '#2563EB', // Blue 600
      secondary: '#6366F1', // Indigo 500
      accent: '#8B5CF6', // Purple 500
      dark: '#0F172A', // Slate 900
      light: '#DBEAFE', // Blue 100
      cardGlow: 'from-blue-500/15 via-indigo-500/10 to-transparent',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      chartPalette: ['#2563EB', '#6366F1', '#8B5CF6', '#3B82F6', '#A855F7', '#0EA5E9'],
      excel: {
        tabColor: 'FF2563EB',
        headerFill: 'FF0F172A',
        headerText: 'FFFFFFFF',
        accentFill: 'FFE0E7FF',
        accentText: 'FF1E40AF',
        border: 'FF2563EB',
        chartThemeHex: ['2563EB', '6366F1', '8B5CF6', '3B82F6', 'A855F7', '0EA5E9'],
      },
    },
    kpiLabels: {
      metric1: 'Annual Recurring Revenue (ARR)',
      metric2: 'Net Expansion Gross Profit',
      metric3: 'Blended Software Margin %',
      metric4: 'Active Licenses / Seats',
      metric5: 'Enterprise Contracts Executed',
      metric6: 'Average Contract Value (ACV)',
      categoryLabel: 'Solution Module / Cloud Suite',
      dimensionLabel: 'Global Sales Theater',
      entityLabel: 'Enterprise Account',
    },
  },

  // 5. Industrial & Advanced Manufacturing
  industrial_manufacturing: {
    id: 'industrial_manufacturing',
    name: 'Industrial & Advanced Manufacturing',
    badge: 'Industrial & Supply Chain',
    description: 'Plant production batches, machine yield, scrap rates, equipment lifecycle, and supply chain.',
    icon: 'Cog',
    colors: {
      primary: '#0284C7', // Sky 600
      secondary: '#D97706', // Amber 600
      accent: '#475569', // Slate 600
      dark: '#0F172A', // Slate 900
      light: '#E2E8F0', // Slate 200
      cardGlow: 'from-sky-500/15 via-amber-500/10 to-transparent',
      borderColor: 'border-sky-500/30',
      textColor: 'text-sky-400',
      badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
      chartPalette: ['#0284C7', '#D97706', '#64748B', '#0EA5E9', '#F59E0B', '#334155'],
      excel: {
        tabColor: 'FF0284C7',
        headerFill: 'FF1E293B',
        headerText: 'FFFFFFFF',
        accentFill: 'FFE0F2FE',
        accentText: 'FF0369A1',
        border: 'FF0284C7',
        chartThemeHex: ['0284C7', 'D97706', '64748B', '0EA5E9', 'F59E0B', '334155'],
      },
    },
    kpiLabels: {
      metric1: 'Total Production Value / Output',
      metric2: 'Net Value-Add / Gross Margin',
      metric3: 'Overall Plant Yield (OEE %)',
      metric4: 'Manufactured Units / Lots',
      metric5: 'Completed Production Runs',
      metric6: 'Average Run Output Value',
      categoryLabel: 'Production Machinery / Line',
      dimensionLabel: 'Manufacturing Plant / Hub',
      entityLabel: 'Industrial Supplier / Vendor',
    },
  },

  // 6. Real Estate & Property Management
  real_estate: {
    id: 'real_estate',
    name: 'Real Estate & Property Portfolio',
    badge: 'Property & Real Estate',
    description: 'Asset valuations, rental cashflow, occupancy rates, square footage yields, and lease management.',
    icon: 'Building2',
    colors: {
      primary: '#B45309', // Amber 700 / Bronze
      secondary: '#15803D', // Green 700
      accent: '#C2410C', // Orange 700
      dark: '#1C1917', // Stone 900
      light: '#FEF3C7', // Amber 100
      cardGlow: 'from-amber-600/15 via-emerald-600/10 to-transparent',
      borderColor: 'border-amber-600/30',
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-600/10 text-amber-300 border-amber-600/30',
      chartPalette: ['#B45309', '#15803D', '#C2410C', '#D97706', '#16A34A', '#EA580C'],
      excel: {
        tabColor: 'FFB45309',
        headerFill: 'FF292524',
        headerText: 'FFFFFFFF',
        accentFill: 'FFFEF3C7',
        accentText: 'FF78350F',
        border: 'FFB45309',
        chartThemeHex: ['B45309', '15803D', 'C2410C', 'D97706', '16A34A', 'EA580C'],
      },
    },
    kpiLabels: {
      metric1: 'Portfolio Gross Valuation',
      metric2: 'Net Operating Income (NOI)',
      metric3: 'Capitalization Rate (Cap %)',
      metric4: 'Total Leased Units / Sq Ft',
      metric5: 'Active Properties & Leases',
      metric6: 'Average Valuation per Asset',
      categoryLabel: 'Property Type / Asset Class',
      dimensionLabel: 'Metropolitan Market / City',
      entityLabel: 'Tenant / Property Account',
    },
  },

  // 7. Human Resources & People Operations
  human_resources: {
    id: 'human_resources',
    name: 'People Operations & Workforce Capital',
    badge: 'HR & People Analytics',
    description: 'Headcount distribution, payroll investment, performance ratings, retention, and departmental spend.',
    icon: 'Users',
    colors: {
      primary: '#BE185D', // Pink 700 / Rose
      secondary: '#701A75', // Fuchsia 900
      accent: '#0F766E', // Teal 700
      dark: '#2A082D', // Deep Plum
      light: '#FCE7F3', // Pink 100
      cardGlow: 'from-pink-600/15 via-purple-600/10 to-transparent',
      borderColor: 'border-pink-500/30',
      textColor: 'text-pink-400',
      badgeBg: 'bg-pink-500/10 text-pink-300 border-pink-500/30',
      chartPalette: ['#BE185D', '#701A75', '#0F766E', '#DB2777', '#9333EA', '#14B8A6'],
      excel: {
        tabColor: 'FFBE185D',
        headerFill: 'FF4A044E',
        headerText: 'FFFFFFFF',
        accentFill: 'FFFDF2F8',
        accentText: 'FF9D174D',
        border: 'FFBE185D',
        chartThemeHex: ['BE185D', '701A75', '0F766E', 'DB2777', '9333EA', '14B8A6'],
      },
    },
    kpiLabels: {
      metric1: 'Total Annual Payroll / Investment',
      metric2: 'Performance & Incentive Pool',
      metric3: 'Workforce Retention / Score %',
      metric4: 'Total Active Headcount',
      metric5: 'Active Employee Positions',
      metric6: 'Average Annual Compensation',
      categoryLabel: 'Department / Functional Role',
      dimensionLabel: 'Office Location / Region',
      entityLabel: 'Employee / Team Member',
    },
  },

  // 8. Hospitality, Travel & Dining
  hospitality_travel: {
    id: 'hospitality_travel',
    name: 'Hospitality, Travel & Dining Operations',
    badge: 'Hospitality & Leisure',
    description: 'Guest bookings, average daily rate (ADR), RevPAR, occupancy ratios, and food/beverage covers.',
    icon: 'Utensils',
    colors: {
      primary: '#EA580C', // Orange 600
      secondary: '#0284C7', // Sky 600
      accent: '#E11D48', // Rose 600
      dark: '#1C1917', // Warm Stone
      light: '#FFEDD5', // Orange 100
      cardGlow: 'from-orange-500/15 via-sky-500/10 to-transparent',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      badgeBg: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
      chartPalette: ['#EA580C', '#0284C7', '#E11D48', '#F97316', '#38BDF8', '#FB7185'],
      excel: {
        tabColor: 'FFEA580C',
        headerFill: 'FF431407',
        headerText: 'FFFFFFFF',
        accentFill: 'FFFFEDD5',
        accentText: 'FF9A3412',
        border: 'FFEA580C',
        chartThemeHex: ['EA580C', '0284C7', 'E11D48', 'F97316', '38BDF8', 'FB7185'],
      },
    },
    kpiLabels: {
      metric1: 'Gross Booking Revenue',
      metric2: 'Net Room & Dining Margin',
      metric3: 'Occupancy / Utilization %',
      metric4: 'Total Nights / Covers Served',
      metric5: 'Guest Reservations Logged',
      metric6: 'Average Daily Rate (ADR)',
      categoryLabel: 'Service / Accommodation Type',
      dimensionLabel: 'Property Location / Resort',
      entityLabel: 'Guest / Booking Party',
    },
  },

  // 9. Energy, Utilities & CleanTech
  energy_utilities: {
    id: 'energy_utilities',
    name: 'Energy, Utilities & CleanTech',
    badge: 'Energy & Sustainability',
    description: 'Grid capacity, kWh generation, turbine output, peak load balancing, and emission reductions.',
    icon: 'Zap',
    colors: {
      primary: '#15803D', // Green 700
      secondary: '#0891B2', // Cyan 600
      accent: '#D97706', // Amber 600
      dark: '#052E16', // Green 950
      light: '#DCFCE7', // Green 100
      cardGlow: 'from-green-500/15 via-cyan-500/10 to-transparent',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
      badgeBg: 'bg-green-500/10 text-green-300 border-green-500/30',
      chartPalette: ['#15803D', '#0891B2', '#D97706', '#22C55E', '#06B6D4', '#F59E0B'],
      excel: {
        tabColor: 'FF15803D',
        headerFill: 'FF052E16',
        headerText: 'FFFFFFFF',
        accentFill: 'FFDCFCE7',
        accentText: 'FF166534',
        border: 'FF15803D',
        chartThemeHex: ['15803D', '0891B2', 'D97706', '22C55E', '06B6D4', 'F59E0B'],
      },
    },
    kpiLabels: {
      metric1: 'Total Generated Energy Value',
      metric2: 'Net Operational Margin',
      metric3: 'Grid Efficiency / Uptime %',
      metric4: 'Total Output Volume (MWh)',
      metric5: 'Active Generation Cycles',
      metric6: 'Average Cost per MWh',
      categoryLabel: 'Fuel / Clean Energy Source',
      dimensionLabel: 'Grid Sector / Station',
      entityLabel: 'Utility Subscriber / Grid Node',
    },
  },

  // 10. Education, Research & Academics
  education_academic: {
    id: 'education_academic',
    name: 'Higher Education & Academic Performance',
    badge: 'Education & Research',
    description: 'Student enrollments, tuition revenue, department budgets, GPA outcomes, and course completions.',
    icon: 'GraduationCap',
    colors: {
      primary: '#9F1239', // Rose 800 / Burgundy
      secondary: '#1E3A8A', // Blue 900
      accent: '#D97706', // Amber 600
      dark: '#1E1B4B', // Slate Navy
      light: '#FFE4E6', // Rose 100
      cardGlow: 'from-rose-700/15 via-blue-700/10 to-transparent',
      borderColor: 'border-rose-500/30',
      textColor: 'text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      chartPalette: ['#9F1239', '#1E3A8A', '#D97706', '#BE123C', '#2563EB', '#F59E0B'],
      excel: {
        tabColor: 'FF9F1239',
        headerFill: 'FF4C0519',
        headerText: 'FFFFFFFF',
        accentFill: 'FFFFF1F2',
        accentText: 'FF9F1239',
        border: 'FF9F1239',
        chartThemeHex: ['9F1239', '1E3A8A', 'D97706', 'BE123C', '2563EB', 'F59E0B'],
      },
    },
    kpiLabels: {
      metric1: 'Total Academic Budget / Tuition',
      metric2: 'Net Research & Grants Allocation',
      metric3: 'Course Completion / Pass Rate',
      metric4: 'Total Enrolled Students',
      metric5: 'Courses & Programs Offered',
      metric6: 'Average Credit / Tuition Fee',
      categoryLabel: 'Academic Department / Major',
      dimensionLabel: 'Campus / College Division',
      entityLabel: 'Student / Scholar',
    },
  },

  // 11. Marketing, Advertising & Media
  marketing_media: {
    id: 'marketing_media',
    name: 'Performance Marketing & Media ROI',
    badge: 'Marketing & Digital Media',
    description: 'Campaign impressions, click-through rates (CTR), conversion ROAS, CPA, and multi-channel attribution.',
    icon: 'Target',
    colors: {
      primary: '#C026D3', // Fuchsia 600
      secondary: '#7C3AED', // Violet 600
      accent: '#EA580C', // Orange 600
      dark: '#1E1B4B', // Violet 950
      light: '#FAE8FF', // Fuchsia 100
      cardGlow: 'from-fuchsia-500/15 via-violet-500/10 to-transparent',
      borderColor: 'border-fuchsia-500/30',
      textColor: 'text-fuchsia-400',
      badgeBg: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30',
      chartPalette: ['#C026D3', '#7C3AED', '#EA580C', '#D946EF', '#8B5CF6', '#F97316'],
      excel: {
        tabColor: 'FFC026D3',
        headerFill: 'FF4A044E',
        headerText: 'FFFFFFFF',
        accentFill: 'FFFAE8FF',
        accentText: 'FF86198F',
        border: 'FFC026D3',
        chartThemeHex: ['C026D3', '7C3AED', 'EA580C', 'D946EF', '8B5CF6', 'F97316'],
      },
    },
    kpiLabels: {
      metric1: 'Attributed Campaign Revenue',
      metric2: 'Net Return on Ad Spend (ROAS)',
      metric3: 'Click-Through / Conversion %',
      metric4: 'Conversions / Acquired Leads',
      metric5: 'Total Ad Impressions Tracked',
      metric6: 'Cost per Acquisition (CPA)',
      categoryLabel: 'Marketing Channel / Media',
      dimensionLabel: 'Audience Segment / Geo',
      entityLabel: 'Campaign / Creative',
    },
  },

  // 12. General Commercial & Operations
  general_business: {
    id: 'general_business',
    name: 'Executive Business Intelligence Model',
    badge: 'Enterprise Analytics',
    description: 'Universal cross-industry executive dashboard with automated schema inspection and dynamic metric calculation.',
    icon: 'BarChart3',
    colors: {
      primary: '#0284C7', // Sky 600
      secondary: '#059669', // Emerald 600
      accent: '#6366F1', // Indigo 500
      dark: '#0F172A', // Slate 900
      light: '#E0F2FE', // Sky 100
      cardGlow: 'from-sky-500/15 via-emerald-500/10 to-transparent',
      borderColor: 'border-sky-500/30',
      textColor: 'text-sky-400',
      badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
      chartPalette: ['#0284C7', '#059669', '#6366F1', '#0EA5E9', '#10B981', '#8B5CF6'],
      excel: {
        tabColor: 'FF0284C7',
        headerFill: 'FF0F172A',
        headerText: 'FFFFFFFF',
        accentFill: 'FFE0F2FE',
        accentText: 'FF0369A1',
        border: 'FF0284C7',
        chartThemeHex: ['0284C7', '059669', '6366F1', '0EA5E9', '10B981', '8B5CF6'],
      },
    },
    kpiLabels: {
      metric1: 'Total Primary Metric Volume',
      metric2: 'Net Variance / Profit Balance',
      metric3: 'Target Performance Rate %',
      metric4: 'Total Units / Records Count',
      metric5: 'Total Processed Operations',
      metric6: 'Average Unit Value',
      categoryLabel: 'Primary Operational Category',
      dimensionLabel: 'Operational Division / Segment',
      entityLabel: 'Account / Subject',
    },
  },
};

export function getIndustryTheme(industry: IndustryType): IndustryTheme {
  return INDUSTRY_THEMES[industry] || INDUSTRY_THEMES.general_business;
}

/**
 * Returns dynamic KPI titles adapted to the detected industry and user-uploaded columns.
 */
export function getAdaptedKpiLabels(
  industry: IndustryType,
  schema?: DatasetSchemaProfile
): IndustryTheme['kpiLabels'] {
  const base = getIndustryTheme(industry).kpiLabels;

  if (!schema) return base;

  // Check if this schema is from a custom user upload with custom-named measures,
  // rather than the standard commercial generator schema.
  const isCustomUserUpload = 
    schema.primaryMetricLabel && 
    schema.primaryMetricLabel !== 'Gross Revenue' && 
    schema.primaryMetricLabel !== 'Revenue' &&
    schema.primaryCategoryLabel !== 'Product Category';

  if (!isCustomUserUpload) {
    return base;
  }

  return {
    metric1: schema.primaryMetricLabel ? `Total ${schema.primaryMetricLabel}` : base.metric1,
    metric2: schema.secondaryMetricLabel ? `Total ${schema.secondaryMetricLabel}` : base.metric2,
    metric3: base.metric3,
    metric4: schema.volumeMetricLabel ? `Total ${schema.volumeMetricLabel}` : base.metric4,
    metric5: `Total ${schema.totalRecords.toLocaleString()} Records`,
    metric6: schema.primaryMetricLabel ? `Avg ${schema.primaryMetricLabel}` : base.metric6,
    categoryLabel: schema.primaryCategoryLabel || base.categoryLabel,
    dimensionLabel: schema.secondaryCategoryLabel || base.dimensionLabel,
    entityLabel: schema.entityColumn || base.entityLabel,
  };
}
