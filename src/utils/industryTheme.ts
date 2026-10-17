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
    channelLabel?: string;
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

  // 13. Logistics, Supply Chain & Freight
  logistics_supply_chain: {
    id: 'logistics_supply_chain',
    name: 'Logistics, Freight & Supply Chain Network',
    badge: 'Freight & Supply Chain',
    description: 'Freight haulage volumes, carrier on-time delivery rates, warehouse utilization, and fleet routing costs.',
    icon: 'Truck',
    colors: {
      primary: '#0284C7',
      secondary: '#F59E0B',
      accent: '#0D9488',
      dark: '#0C4A6E',
      light: '#E0F2FE',
      cardGlow: 'from-sky-500/15 via-amber-500/10 to-transparent',
      borderColor: 'border-sky-500/30',
      textColor: 'text-sky-400',
      badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
      chartPalette: ['#0284C7', '#F59E0B', '#0D9488', '#38BDF8', '#FBBF24', '#14B8A6'],
      excel: {
        tabColor: 'FF0284C7',
        headerFill: 'FF075985',
        headerText: 'FFFFFFFF',
        accentFill: 'FFE0F2FE',
        accentText: 'FF0369A1',
        border: 'FF0284C7',
        chartThemeHex: ['0284C7', 'F59E0B', '0D9488', '38BDF8', 'FBBF24', '14B8A6'],
      },
    },
    kpiLabels: {
      metric1: 'Total Freight Value / Turnover',
      metric2: 'Net Operating Fleet Margin',
      metric3: 'On-Time In-Full (OTIF) Rate %',
      metric4: 'Active Freight Shipments',
      metric5: 'Total Ton-Miles Handled',
      metric6: 'Avg Freight Cost / Consignment',
      categoryLabel: 'Freight Mode / Service Tier',
      dimensionLabel: 'Origin Hub / Distribution Center',
      entityLabel: 'Logistics Carrier / Vehicle',
    },
  },

  // 14. Automotive, EV & Fleet Mobility
  automotive_ev: {
    id: 'automotive_ev',
    name: 'Automotive, EV Fleet & Mobility',
    badge: 'Automotive & Clean Mobility',
    description: 'EV production output, battery pack yield, charging network uptime, and dealership warranty costs.',
    icon: 'Zap',
    colors: {
      primary: '#06B6D4',
      secondary: '#10B981',
      accent: '#3B82F6',
      dark: '#164E63',
      light: '#CFFAFE',
      cardGlow: 'from-cyan-500/15 via-emerald-500/10 to-transparent',
      borderColor: 'border-cyan-500/30',
      textColor: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      chartPalette: ['#06B6D4', '#10B981', '#3B82F6', '#22D3EE', '#34D399', '#60A5FA'],
      excel: {
        tabColor: 'FF06B6D4',
        headerFill: 'FF155E75',
        headerText: 'FFFFFFFF',
        accentFill: 'FFCFFAFE',
        accentText: 'FF0E7490',
        border: 'FF06B6D4',
        chartThemeHex: ['06B6D4', '10B981', '3B82F6', '22D3EE', '34D399', '60A5FA'],
      },
    },
    kpiLabels: {
      metric1: 'Total EV Fleet / Sales Value',
      metric2: 'Net Battery & Powertrain Margin',
      metric3: 'Fleet Uptime / Delivery Rate %',
      metric4: 'Vehicles Built / Units In Field',
      metric5: 'Total Fast-Charging Kilowatt Hours',
      metric6: 'Avg Vehicle Unit Value',
      categoryLabel: 'Powertrain & Platform Class',
      dimensionLabel: 'Assembly Gigafactory / Territory',
      entityLabel: 'Chassis VIN / Fleet Asset',
    },
  },

  // 15. Biotech & Clinical Pharmacology
  pharmaceutical_biotech: {
    id: 'pharmaceutical_biotech',
    name: 'Biotech Discovery & Clinical Trials',
    badge: 'Biopharma R&D',
    description: 'Drug pipeline candidate progress, assay yields, target binding affinity, and IND regulatory filings.',
    icon: 'FlaskConical',
    colors: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      accent: '#06B6D4',
      dark: '#4C1D95',
      light: '#EDE9FE',
      cardGlow: 'from-purple-500/15 via-pink-500/10 to-transparent',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      chartPalette: ['#8B5CF6', '#EC4899', '#06B6D4', '#A78BFA', '#F472B6', '#22D3EE'],
      excel: {
        tabColor: 'FF8B5CF6',
        headerFill: 'FF581C87',
        headerText: 'FFFFFFFF',
        accentFill: 'FFEDE9FE',
        accentText: 'FF6D28D9',
        border: 'FF8B5CF6',
        chartThemeHex: ['8B5CF6', 'EC4899', '06B6D4', 'A78BFA', 'F472B6', '22D3EE'],
      },
    },
    kpiLabels: {
      metric1: 'Total R&D Trial Expenditure',
      metric2: 'Net Compound Valuation / Royalty',
      metric3: 'Assay Milestone Success Rate %',
      metric4: 'Active Clinical Trial Cohorts',
      metric5: 'Total Bio-Assay Screenings Run',
      metric6: 'Avg Cost Per Compound Screen',
      categoryLabel: 'Therapeutic Drug Class',
      dimensionLabel: 'Clinical Research Site / Lab',
      entityLabel: 'Lead Candidate Molecule ID',
    },
  },

  // 16. Civil Engineering, Infrastructure & EPC
  construction_engineering: {
    id: 'construction_engineering',
    name: 'Civil Engineering, Infrastructure & EPC',
    badge: 'Civil Infrastructure & EPC',
    description: 'Capital project budget burn, milestone completion, equipment utilization, and subcontractor safety hours.',
    icon: 'HardHat',
    colors: {
      primary: '#EA580C',
      secondary: '#CA8A04',
      accent: '#475569',
      dark: '#7C2D12',
      light: '#FFEDD5',
      cardGlow: 'from-orange-500/15 via-amber-500/10 to-transparent',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      badgeBg: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
      chartPalette: ['#EA580C', '#CA8A04', '#475569', '#F97316', '#EAB308', '#64748B'],
      excel: {
        tabColor: 'FFEA580C',
        headerFill: 'FF7C2D12',
        headerText: 'FFFFFFFF',
        accentFill: 'FFFFEDD5',
        accentText: 'FFC2410C',
        border: 'FFEA580C',
        chartThemeHex: ['EA580C', 'CA8A04', '475569', 'F97316', 'EAB308', '64748B'],
      },
    },
    kpiLabels: {
      metric1: 'Total Project Contract Valuation',
      metric2: 'Net EPC Project Profit Margin',
      metric3: 'Milestone Schedule Completion %',
      metric4: 'Active Construction Sites',
      metric5: 'Total Heavy Equipment Hours',
      metric6: 'Avg Cost per Project Work-Package',
      categoryLabel: 'Construction Package / Discipline',
      dimensionLabel: 'Regional Jobsite / Sector',
      entityLabel: 'Subcontractor / Project Lead',
    },
  },

  // 17. Telecommunications, 5G & Broadband
  telecom_networks: {
    id: 'telecom_networks',
    name: 'Telecommunications, 5G & Broadband',
    badge: '5G Infrastructure & Telco',
    description: 'Network bandwidth throughput, cell tower uptime, fiber latency, and subscriber ARPU metrics.',
    icon: 'Radio',
    colors: {
      primary: '#0284C7',
      secondary: '#7C3AED',
      accent: '#0D9488',
      dark: '#082F49',
      light: '#E0F2FE',
      cardGlow: 'from-sky-500/15 via-purple-500/10 to-transparent',
      borderColor: 'border-sky-500/30',
      textColor: 'text-sky-400',
      badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
      chartPalette: ['#0284C7', '#7C3AED', '#0D9488', '#38BDF8', '#A78BFA', '#14B8A6'],
      excel: {
        tabColor: 'FF0284C7',
        headerFill: 'FF0369A1',
        headerText: 'FFFFFFFF',
        accentFill: 'FFE0F2FE',
        accentText: 'FF0284C7',
        border: 'FF0284C7',
        chartThemeHex: ['0284C7', '7C3AED', '0D9488', '38BDF8', 'A78BFA', '14B8A6'],
      },
    },
    kpiLabels: {
      metric1: 'Total Network Billing Revenue',
      metric2: 'Net Telco ARPU Operating Margin',
      metric3: 'Network SLA Availability %',
      metric4: 'Active Subscriber Line Connections',
      metric5: 'Total Terabytes Transferred',
      metric6: 'Avg Monthly Revenue Per User',
      categoryLabel: 'Subscription Tier / Plan',
      dimensionLabel: 'Cell Tower Cluster / Grid',
      entityLabel: 'Subscriber Device Node',
    },
  },

  // 18. Corporate Legal, Risk & Compliance
  legal_compliance: {
    id: 'legal_compliance',
    name: 'Corporate Legal, Risk & Compliance',
    badge: 'Legal Counsel & Risk',
    description: 'Litigation exposure, billable partner hours, GDPR/SOX compliance audits, and contract turnaround.',
    icon: 'Scale',
    colors: {
      primary: '#475569',
      secondary: '#B45309',
      accent: '#1E293B',
      dark: '#0F172A',
      light: '#F1F5F9',
      cardGlow: 'from-slate-500/15 via-amber-600/10 to-transparent',
      borderColor: 'border-slate-500/30',
      textColor: 'text-slate-300',
      badgeBg: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
      chartPalette: ['#475569', '#B45309', '#1E293B', '#64748B', '#D97706', '#334155'],
      excel: {
        tabColor: 'FF475569',
        headerFill: 'FF1E293B',
        headerText: 'FFFFFFFF',
        accentFill: 'FFF1F5F9',
        accentText: 'FF334155',
        border: 'FF475569',
        chartThemeHex: ['475569', 'B45309', '1E293B', '64748B', 'D97706', '334155'],
      },
    },
    kpiLabels: {
      metric1: 'Total Retainer & Legal Fees',
      metric2: 'Net Realized Matter Profit',
      metric3: 'Compliance Audit Adherence %',
      metric4: 'Active Litigation / Client Matters',
      metric5: 'Total Billable Counsel Hours',
      metric6: 'Avg Fee per Legal Matter',
      categoryLabel: 'Legal Practice Area',
      dimensionLabel: 'Regulatory Jurisdiction / Court',
      entityLabel: 'Partner / Retained Counsel',
    },
  },

  // 19. Insurance Underwriting & Actuarial
  insurance_underwriting: {
    id: 'insurance_underwriting',
    name: 'Insurance Underwriting & Actuarial',
    badge: 'Underwriting & Actuarial',
    description: 'Written premiums, loss ratios, catastrophe reserves, claims processing velocity, and risk scoring.',
    icon: 'ShieldCheck',
    colors: {
      primary: '#0369A1',
      secondary: '#DC2626',
      accent: '#059669',
      dark: '#0C4A6E',
      light: '#E0F2FE',
      cardGlow: 'from-sky-600/15 via-emerald-500/10 to-transparent',
      borderColor: 'border-sky-500/30',
      textColor: 'text-sky-400',
      badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
      chartPalette: ['#0369A1', '#DC2626', '#059669', '#0284C7', '#EF4444', '#10B981'],
      excel: {
        tabColor: 'FF0369A1',
        headerFill: 'FF0F172A',
        headerText: 'FFFFFFFF',
        accentFill: 'FFE0F2FE',
        accentText: 'FF0369A1',
        border: 'FF0369A1',
        chartThemeHex: ['0369A1', 'DC2626', '059669', '0284C7', 'EF4444', '10B981'],
      },
    },
    kpiLabels: {
      metric1: 'Gross Written Premium (GWP)',
      metric2: 'Net Underwriting Profit',
      metric3: 'Combined Loss Ratio %',
      metric4: 'Total Bound Policies Underwritten',
      metric5: 'Total Claim Settlements Paid',
      metric6: 'Avg Premium per Insured Risk',
      categoryLabel: 'Insurance Policy Line',
      dimensionLabel: 'Underwriting Territory / Zone',
      entityLabel: 'Policyholder / Broker',
    },
  },

  // 20. Smart Agriculture & Food Supply
  agriculture_agritech: {
    id: 'agriculture_agritech',
    name: 'Smart Agriculture & Food Supply',
    badge: 'Agritech & Crop Sciences',
    description: 'Crop yields per hectare, soil moisture metrics, irrigation efficiency, commodity pricing, and harvest tons.',
    icon: 'Sprout',
    colors: {
      primary: '#65A30D',
      secondary: '#CA8A04',
      accent: '#15803D',
      dark: '#1A2E05',
      light: '#ECFCCB',
      cardGlow: 'from-lime-500/15 via-emerald-600/10 to-transparent',
      borderColor: 'border-lime-500/30',
      textColor: 'text-lime-400',
      badgeBg: 'bg-lime-500/10 text-lime-300 border-lime-500/30',
      chartPalette: ['#65A30D', '#CA8A04', '#15803D', '#84CC16', '#EAB308', '#22C55E'],
      excel: {
        tabColor: 'FF65A30D',
        headerFill: 'FF365314',
        headerText: 'FFFFFFFF',
        accentFill: 'FFECFCCB',
        accentText: 'FF4D7C0F',
        border: 'FF65A30D',
        chartThemeHex: ['65A30D', 'CA8A04', '15803D', '84CC16', 'EAB308', '22C55E'],
      },
    },
    kpiLabels: {
      metric1: 'Total Agricultural Revenue',
      metric2: 'Net Farm Gate Gross Margin',
      metric3: 'Target Crop Yield Efficiency %',
      metric4: 'Acreage Planted / Farm Plots',
      metric5: 'Total Metric Tons Harvested',
      metric6: 'Avg Yield per Cultivated Hectare',
      categoryLabel: 'Crop / Commodity Type',
      dimensionLabel: 'Agricultural Basin / Sector',
      entityLabel: 'Farm Cooperative / Plot',
    },
  },

  // 21. Food, Beverage & Restaurant Chain
  food_beverage: {
    id: 'food_beverage',
    name: 'Food, Beverage & Restaurant Chain',
    badge: 'F&B & Hospitality Chains',
    description: 'Table turnover rates, food cost percentage (CoGS), franchise royalties, waste reduction, and ticket size.',
    icon: 'Utensils',
    colors: {
      primary: '#D97706',
      secondary: '#DC2626',
      accent: '#16A34A',
      dark: '#451A03',
      light: '#FEF3C7',
      cardGlow: 'from-amber-500/15 via-rose-500/10 to-transparent',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      chartPalette: ['#D97706', '#DC2626', '#16A34A', '#F59E0B', '#EF4444', '#22C55E'],
      excel: {
        tabColor: 'FFD97706',
        headerFill: 'FF78350F',
        headerText: 'FFFFFFFF',
        accentFill: 'FFFEF3C7',
        accentText: 'FF92400E',
        border: 'FFD97706',
        chartThemeHex: ['D97706', 'DC2626', '16A34A', 'F59E0B', 'EF4444', '22C55E'],
      },
    },
    kpiLabels: {
      metric1: 'Total Dining & Retail Revenue',
      metric2: 'Net Store Contribution Margin',
      metric3: 'Food Cost Efficiency Rate %',
      metric4: 'Guest Covers / Ticket Orders',
      metric5: 'Total Menu Portions Served',
      metric6: 'Avg Dining Check Size',
      categoryLabel: 'Menu Category / Department',
      dimensionLabel: 'Franchise Location / District',
      entityLabel: 'Store Manager / Kitchen Unit',
    },
  },

  // 22. Aerospace, Avionics & Defense Systems
  aerospace_defense: {
    id: 'aerospace_defense',
    name: 'Aerospace, Avionics & Defense Systems',
    badge: 'Aerospace & Mission Systems',
    description: 'Contract order backlogs, avionics test yields, defense procurement milestones, and flight test hours.',
    icon: 'Plane',
    colors: {
      primary: '#1E40AF',
      secondary: '#475569',
      accent: '#0284C7',
      dark: '#0F172A',
      light: '#DBEAFE',
      cardGlow: 'from-blue-700/15 via-slate-600/10 to-transparent',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      chartPalette: ['#1E40AF', '#475569', '#0284C7', '#3B82F6', '#64748B', '#38BDF8'],
      excel: {
        tabColor: 'FF1E40AF',
        headerFill: 'FF1E3A8A',
        headerText: 'FFFFFFFF',
        accentFill: 'FFDBEAFE',
        accentText: 'FF1E40AF',
        border: 'FF1E40AF',
        chartThemeHex: ['1E40AF', '475569', '0284C7', '3B82F6', '64748B', '38BDF8'],
      },
    },
    kpiLabels: {
      metric1: 'Total Defense Contract Value',
      metric2: 'Net Avionics Operating Margin',
      metric3: 'Milestone Mission Readiness %',
      metric4: 'Active Program Orders / Airframes',
      metric5: 'Total Flight Test / Sim Hours',
      metric6: 'Avg Cost per Mission System',
      categoryLabel: 'Avionics Subsystem / Payload',
      dimensionLabel: 'Defense Facility / Proving Range',
      entityLabel: 'Lead Program Manager / Tail #',
    },
  },

  // 23. Cybersecurity, SecOps & Threat Intel
  cybersecurity_secops: {
    id: 'cybersecurity_secops',
    name: 'Cybersecurity, SecOps & Threat Intel',
    badge: 'Cybersecurity & SecOps',
    description: 'Security incidents detected, mean-time-to-remediate (MTTR), vulnerability severity, and SOC ticket volume.',
    icon: 'ShieldAlert',
    colors: {
      primary: '#EF4444',
      secondary: '#8B5CF6',
      accent: '#06B6D4',
      dark: '#450A0A',
      light: '#FEE2E2',
      cardGlow: 'from-red-600/15 via-purple-600/10 to-transparent',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      badgeBg: 'bg-red-500/10 text-red-300 border-red-500/30',
      chartPalette: ['#EF4444', '#8B5CF6', '#06B6D4', '#F87171', '#A78BFA', '#22D3EE'],
      excel: {
        tabColor: 'FFEF4444',
        headerFill: 'FF7F1D1D',
        headerText: 'FFFFFFFF',
        accentFill: 'FFFEE2E2',
        accentText: 'FFB91C1C',
        border: 'FFEF4444',
        chartThemeHex: ['EF4444', '8B5CF6', '06B6D4', 'F87171', 'A78BFA', '22D3EE'],
      },
    },
    kpiLabels: {
      metric1: 'SecOps Budget & Defense Value',
      metric2: 'Net Threat Mitigated Exposure',
      metric3: 'SLA Containment Rate %',
      metric4: 'Identified Threat Vectors',
      metric5: 'Total Automated Block Actions',
      metric6: 'Avg MTTR Hours per Alert',
      categoryLabel: 'Threat Vector / MITRE Category',
      dimensionLabel: 'Cloud Network / Enclave',
      entityLabel: 'SOC Analyst / Sentinel Host',
    },
  },

  // 24. Streaming Media & Digital Entertainment
  media_entertainment: {
    id: 'media_entertainment',
    name: 'Streaming Media & Digital Entertainment',
    badge: 'Media, OTT & Streaming',
    description: 'Viewer streaming hours, content licensing costs, churn rate, subscriber growth, and advertising CPMs.',
    icon: 'Film',
    colors: {
      primary: '#E11D48',
      secondary: '#7C3AED',
      accent: '#F59E0B',
      dark: '#4C0519',
      light: '#FFE4E6',
      cardGlow: 'from-rose-600/15 via-purple-600/10 to-transparent',
      borderColor: 'border-rose-500/30',
      textColor: 'text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      chartPalette: ['#E11D48', '#7C3AED', '#F59E0B', '#FB7185', '#A78BFA', '#FBBF24'],
      excel: {
        tabColor: 'FFE11D48',
        headerFill: 'FF881337',
        headerText: 'FFFFFFFF',
        accentFill: 'FFFFE4E6',
        accentText: 'FFBE123C',
        border: 'FFE11D48',
        chartThemeHex: ['E11D48', '7C3AED', 'F59E0B', 'FB7185', 'A78BFA', 'FBBF24'],
      },
    },
    kpiLabels: {
      metric1: 'Total Streaming & Ad Revenue',
      metric2: 'Net Content License Royalty Margin',
      metric3: 'Viewer Retention / Completion %',
      metric4: 'Active Subscriber Viewers',
      metric5: 'Total Hours Streamed (Millions)',
      metric6: 'Avg Revenue per Streaming Hour',
      categoryLabel: 'Content Genre / Release Tier',
      dimensionLabel: 'Streaming Market / Region',
      entityLabel: 'Title / Creator Franchise',
    },
  },

  // 25. Nonprofit, NGO & Philanthropic Impact
  nonprofit_charity: {
    id: 'nonprofit_charity',
    name: 'Nonprofit, NGO & Philanthropic Impact',
    badge: 'Philanthropy & NGO',
    description: 'Grant allocations, donor contributions, fund program efficiency ratios, and humanitarian reach.',
    icon: 'HeartHandshake',
    colors: {
      primary: '#10B981',
      secondary: '#F59E0B',
      accent: '#0284C7',
      dark: '#064E3B',
      light: '#D1FAE5',
      cardGlow: 'from-emerald-500/15 via-amber-500/10 to-transparent',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      chartPalette: ['#10B981', '#F59E0B', '#0284C7', '#34D399', '#FBBF24', '#38BDF8'],
      excel: {
        tabColor: 'FF10B981',
        headerFill: 'FF065F46',
        headerText: 'FFFFFFFF',
        accentFill: 'FFD1FAE5',
        accentText: 'FF047857',
        border: 'FF10B981',
        chartThemeHex: ['10B981', 'F59E0B', '0284C7', '34D399', 'FBBF24', '38BDF8'],
      },
    },
    kpiLabels: {
      metric1: 'Total Donor Funds Raised',
      metric2: 'Net Field Program Direct Impact',
      metric3: 'Program Spend Efficiency %',
      metric4: 'Active Community Outreach Grants',
      metric5: 'Total Lives Directly Impacted',
      metric6: 'Avg Donation Contribution Size',
      categoryLabel: 'Philanthropic Cause / Pillar',
      dimensionLabel: 'Field Operations / Mission Zone',
      entityLabel: 'Donor Sponsor / Field Partner',
    },
  },

  // 26. Fitness, Health Clubs & Wellness Centers
  fitness_wellness: {
    id: 'fitness_wellness',
    name: 'Fitness, Health Clubs & Wellness Centers',
    badge: 'Fitness & Wellness Clubs',
    description: 'Membership retention, class attendance rates, personal training revenue, and facility utilization.',
    icon: 'Dumbbell',
    colors: {
      primary: '#F97316',
      secondary: '#06B6D4',
      accent: '#84CC16',
      dark: '#431407',
      light: '#FFEDD5',
      cardGlow: 'from-orange-500/15 via-cyan-500/10 to-transparent',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      badgeBg: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
      chartPalette: ['#F97316', '#06B6D4', '#84CC16', '#FB923C', '#22D3EE', '#A3E635'],
      excel: {
        tabColor: 'FFF97316',
        headerFill: 'FF9A3412',
        headerText: 'FFFFFFFF',
        accentFill: 'FFFFEDD5',
        accentText: 'FFC2410C',
        border: 'FFF97316',
        chartThemeHex: ['F97316', '06B6D4', '84CC16', 'FB923C', '22D3EE', 'A3E635'],
      },
    },
    kpiLabels: {
      metric1: 'Total Gym & Wellness Revenue',
      metric2: 'Net Ancillary Service Margin',
      metric3: 'Member Retention Rate %',
      metric4: 'Active Gym Memberships',
      metric5: 'Total Group Fitness Sessions',
      metric6: 'Avg Spend per Club Member',
      categoryLabel: 'Workout Class / Service Program',
      dimensionLabel: 'Health Club Location / Facility',
      entityLabel: 'Personal Trainer / Member',
    },
  },

  // 27. Management Consulting & Advisory
  professional_services: {
    id: 'professional_services',
    name: 'Management Consulting & Advisory',
    badge: 'Strategy & Management Consulting',
    description: 'Client billing utilization, realization rates, engagement profitability, and proposal win velocity.',
    icon: 'Briefcase',
    colors: {
      primary: '#3B82F6',
      secondary: '#6366F1',
      accent: '#0D9488',
      dark: '#1E293B',
      light: '#DBEAFE',
      cardGlow: 'from-blue-600/15 via-indigo-600/10 to-transparent',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      chartPalette: ['#3B82F6', '#6366F1', '#0D9488', '#60A5FA', '#818CF8', '#14B8A6'],
      excel: {
        tabColor: 'FF3B82F6',
        headerFill: 'FF1E3A8A',
        headerText: 'FFFFFFFF',
        accentFill: 'FFDBEAFE',
        accentText: 'FF1D4ED8',
        border: 'FF3B82F6',
        chartThemeHex: ['3B82F6', '6366F1', '0D9488', '60A5FA', '818CF8', '14B8A6'],
      },
    },
    kpiLabels: {
      metric1: 'Total Advisory Retainer Revenue',
      metric2: 'Net Practice Profit Margin',
      metric3: 'Consultant Billable Utilization %',
      metric4: 'Active Client Engagements',
      metric5: 'Total Professional Billable Hours',
      metric6: 'Avg Engagement Fee Realization',
      categoryLabel: 'Consulting Practice Area',
      dimensionLabel: 'Corporate Office / Market Hub',
      entityLabel: 'Lead Partner / Engagement Director',
    },
  },

  // 28. Natural Resources, Oil, Gas & Mining
  oil_gas_mining: {
    id: 'oil_gas_mining',
    name: 'Natural Resources, Oil, Gas & Mining',
    badge: 'Energy & Heavy Extraction',
    description: 'Barrel of oil equivalent (BOE), refining margins, extraction costs per ton, and rig safety compliance.',
    icon: 'Pickaxe',
    colors: {
      primary: '#B45309',
      secondary: '#475569',
      accent: '#D97706',
      dark: '#291804',
      light: '#FEF3C7',
      cardGlow: 'from-amber-600/15 via-slate-600/10 to-transparent',
      borderColor: 'border-amber-600/30',
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-600/10 text-amber-300 border-amber-600/30',
      chartPalette: ['#B45309', '#475569', '#D97706', '#D97706', '#64748B', '#F59E0B'],
      excel: {
        tabColor: 'FFB45309',
        headerFill: 'FF451A03',
        headerText: 'FFFFFFFF',
        accentFill: 'FFFEF3C7',
        accentText: 'FF92400E',
        border: 'FFB45309',
        chartThemeHex: ['B45309', '475569', 'D97706', 'F59E0B', '64748B', 'FBBF24'],
      },
    },
    kpiLabels: {
      metric1: 'Total Upstream Production Revenue',
      metric2: 'Net Crack Spread & Refining Margin',
      metric3: 'Extraction Safety Adherence %',
      metric4: 'Active Rig Fields / Mineral Leases',
      metric5: 'Total Barrels / Tons Produced',
      metric6: 'Avg Production Cost per Barrel',
      categoryLabel: 'Commodity Resource Type',
      dimensionLabel: 'Basin / Concession Area',
      entityLabel: 'Rig Asset / Extraction Well',
    },
  },

  // 29. Luxury Goods & Haute Couture
  fashion_luxury: {
    id: 'fashion_luxury',
    name: 'Luxury Goods & Haute Couture',
    badge: 'Luxury & Haute Couture',
    description: 'Full-price sell-through rate, atelier production batches, seasonal inventory aging, and boutique sales.',
    icon: 'Sparkles',
    colors: {
      primary: '#BE185D',
      secondary: '#B45309',
      accent: '#701A75',
      dark: '#500724',
      light: '#FCE7F3',
      cardGlow: 'from-pink-600/15 via-amber-500/10 to-transparent',
      borderColor: 'border-pink-500/30',
      textColor: 'text-pink-400',
      badgeBg: 'bg-pink-500/10 text-pink-300 border-pink-500/30',
      chartPalette: ['#BE185D', '#B45309', '#701A75', '#EC4899', '#D97706', '#A21CAF'],
      excel: {
        tabColor: 'FFBE185D',
        headerFill: 'FF831843',
        headerText: 'FFFFFFFF',
        accentFill: 'FFFCE7F3',
        accentText: 'FF9D174D',
        border: 'FFBE185D',
        chartThemeHex: ['BE185D', 'B45309', '701A75', 'EC4899', 'D97706', 'A21CAF'],
      },
    },
    kpiLabels: {
      metric1: 'Total Luxury Boutique Sales',
      metric2: 'Net High-Fashion Gross Margin',
      metric3: 'Full-Price Sell-Through Rate %',
      metric4: 'Boutique Collection Items Sold',
      metric5: 'Total Atelier Units Handcrafted',
      metric6: 'Avg Transaction Basket Value',
      categoryLabel: 'Haute Couture Product Line',
      dimensionLabel: 'Flagship Store / Metropolitan Market',
      entityLabel: 'VIP Client / Atelier Tailor',
    },
  },

  // 30. Genomics, Sequencing & Bio-Informatics
  biomedical_genomics: {
    id: 'biomedical_genomics',
    name: 'Genomics, Sequencing & Bio-Informatics',
    badge: 'Genomics & Molecular Bio',
    description: 'Next-gen sequencing (NGS) throughput, read depth, variant call accuracy, and bio-sample turnaround time.',
    icon: 'Dna',
    colors: {
      primary: '#0284C7',
      secondary: '#10B981',
      accent: '#8B5CF6',
      dark: '#0C4A6E',
      light: '#E0F2FE',
      cardGlow: 'from-sky-500/15 via-emerald-500/10 to-transparent',
      borderColor: 'border-sky-500/30',
      textColor: 'text-sky-400',
      badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
      chartPalette: ['#0284C7', '#10B981', '#8B5CF6', '#38BDF8', '#34D399', '#A78BFA'],
      excel: {
        tabColor: 'FF0284C7',
        headerFill: 'FF075985',
        headerText: 'FFFFFFFF',
        accentFill: 'FFE0F2FE',
        accentText: 'FF0369A1',
        border: 'FF0284C7',
        chartThemeHex: ['0284C7', '10B981', '8B5CF6', '38BDF8', '34D399', 'A78BFA'],
      },
    },
    kpiLabels: {
      metric1: 'Total Genomic Sequencing Value',
      metric2: 'Net Bioinformatics Flow Margin',
      metric3: 'Target Coverage Depth Rate %',
      metric4: 'Sequenced Patient DNA Libraries',
      metric5: 'Total Gigabases (Gb) Processed',
      metric6: 'Avg Sequencing Cost per Genome',
      categoryLabel: 'Assay Protocol / Panel',
      dimensionLabel: 'Sequencing Facility / Core Lab',
      entityLabel: 'Flowcell Run / Sample Library',
    },
  },

  // 31. Cloud SaaS, DevOps & Product Analytics
  saas_product_ops: {
    id: 'saas_product_ops',
    name: 'Cloud SaaS, DevOps & Product Analytics',
    badge: 'Cloud SaaS & Product Ops',
    description: 'Annual recurring revenue (ARR), net retention rate (NRR), cloud compute consumption, and release velocity.',
    icon: 'Cloud',
    colors: {
      primary: '#6366F1',
      secondary: '#06B6D4',
      accent: '#10B981',
      dark: '#1E1B4B',
      light: '#EEF2FF',
      cardGlow: 'from-indigo-600/15 via-cyan-500/10 to-transparent',
      borderColor: 'border-indigo-500/30',
      textColor: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      chartPalette: ['#6366F1', '#06B6D4', '#10B981', '#818CF8', '#22D3EE', '#34D399'],
      excel: {
        tabColor: 'FF6366F1',
        headerFill: 'FF312E81',
        headerText: 'FFFFFFFF',
        accentFill: 'FFEEF2FF',
        accentText: 'FF4338CA',
        border: 'FF6366F1',
        chartThemeHex: ['6366F1', '06B6D4', '10B981', '818CF8', '22D3EE', '34D399'],
      },
    },
    kpiLabels: {
      metric1: 'Total Annual Recurring Revenue (ARR)',
      metric2: 'Net Subscription Renewal Margin',
      metric3: 'Net Revenue Retention (NRR) %',
      metric4: 'Active Tenant Organizations',
      metric5: 'Total Cloud API Invocations (M)',
      metric6: 'Avg ARR per Enterprise Tenant',
      categoryLabel: 'Subscription Tier / Plan',
      dimensionLabel: 'Cloud Deployment Region',
      entityLabel: 'Enterprise Account / Workspace',
    },
  },

  // 32. Omnichannel Customer Support & Helpdesk
  customer_support_ops: {
    id: 'customer_support_ops',
    name: 'Omnichannel Customer Support & Helpdesk',
    badge: 'Customer Success & Support',
    description: 'First contact resolution (FCR), customer satisfaction (CSAT), ticket backlog, and agent handle times.',
    icon: 'Headphones',
    colors: {
      primary: '#0D9488',
      secondary: '#F59E0B',
      accent: '#6366F1',
      dark: '#042F2E',
      light: '#CCFBF1',
      cardGlow: 'from-teal-600/15 via-amber-500/10 to-transparent',
      borderColor: 'border-teal-500/30',
      textColor: 'text-teal-400',
      badgeBg: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
      chartPalette: ['#0D9488', '#F59E0B', '#6366F1', '#14B8A6', '#FBBF24', '#818CF8'],
      excel: {
        tabColor: 'FF0D9488',
        headerFill: 'FF115E59',
        headerText: 'FFFFFFFF',
        accentFill: 'FFCCFBF1',
        accentText: 'FF0F766E',
        border: 'FF0D9488',
        chartThemeHex: ['0D9488', 'F59E0B', '6366F1', '14B8A6', 'FBBF24', '818CF8'],
      },
    },
    kpiLabels: {
      metric1: 'Total Support Operational Budget',
      metric2: 'Net SLA Penalty Savings Value',
      metric3: 'CSAT Customer Satisfaction %',
      metric4: 'Resolved Support Tickets',
      metric5: 'Total Escalation Interactions',
      metric6: 'Avg Handle Time (Minutes)',
      categoryLabel: 'Support Channel / Issue Tier',
      dimensionLabel: 'Contact Center / Support Hub',
      entityLabel: 'Support Specialist / Queue',
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
    Boolean(schema.isCustomUpload) ||
    (Boolean(schema.primaryMetricLabel) && 
      (schema.primaryMetricLabel !== 'Gross Revenue' || 
       schema.primaryCategoryLabel !== 'Product Category' || 
       (schema.secondaryCategoryLabel && schema.secondaryCategoryLabel !== 'Global Region')));

  if (!isCustomUserUpload) {
    return base;
  }

  const cleanLabel = (prefix: string, name?: string) => {
    if (!name) return '';
    const trimmed = name.trim();
    if (trimmed.toLowerCase().startsWith(prefix.toLowerCase())) return trimmed;
    return `${prefix} ${trimmed}`;
  };

  return {
    metric1: schema.primaryMetricLabel ? cleanLabel('Total', schema.primaryMetricLabel) : base.metric1,
    metric2: schema.secondaryMetricLabel ? cleanLabel('Total', schema.secondaryMetricLabel) : base.metric2,
    metric3: base.metric3,
    metric4: schema.volumeMetricLabel ? cleanLabel('Total', schema.volumeMetricLabel) : base.metric4,
    metric5: schema.totalRecords ? `Total ${schema.totalRecords.toLocaleString()} Records` : base.metric5,
    metric6: schema.primaryMetricLabel ? cleanLabel('Avg', schema.primaryMetricLabel) : base.metric6,
    categoryLabel: schema.primaryCategoryLabel || base.categoryLabel,
    dimensionLabel: schema.secondaryCategoryLabel || base.dimensionLabel,
    channelLabel: schema.channelColumnLabel || base.channelLabel || 'Channel',
    entityLabel: schema.entityColumn || base.entityLabel,
  };
}

export function getDimensionAllLabel(label: string): string {
  if (!label) return 'All Records';
  const clean = label.split(/[/—]/)[0].trim();
  const lower = clean.toLowerCase();
  if (lower.startsWith('all ')) return clean;
  if (lower.endsWith('s')) return `All ${clean}`;
  if (lower.endsWith('y') && !lower.endsWith('ey')) return `All ${clean.slice(0, -1)}ies`;
  return `All ${clean}s`;
}

