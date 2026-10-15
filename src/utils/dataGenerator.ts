import {
  Transaction,
  ProductCatalogItem,
  RegionalPerformance,
  CustomerAccount,
  MonthlyTrend,
  CategorySummary,
  IndustryType,
  DatasetConfig,
} from '../types/dataset';

// Preset industry definitions
export const INDUSTRY_PRESETS: Record<
  IndustryType,
  {
    name: string;
    description: string;
    companyDefault: string;
    products: { sku: string; name: string; category: string; cost: number; price: number }[];
    customers: { name: string; industry: string; tier: 'Enterprise Strategic' | 'Mid-Market' | 'Corporate' | 'SMB' }[];
  }
> = {
  enterprise_tech: {
    name: 'Enterprise Tech & Cloud SaaS',
    description: 'High-growth B2B enterprise software, cloud infrastructure, AI models, and cybersecurity solutions.',
    companyDefault: 'Nexus Cloud Technologies Inc.',
    products: [
      { sku: 'NX-CLD-900', name: 'Cloud Enterprise Kubernetes Engine', category: 'Cloud Infrastructure', cost: 1450, price: 4200 },
      { sku: 'NX-SEC-450', name: 'Zero-Trust Identity & Gateway Shield', category: 'Cybersecurity', cost: 680, price: 2150 },
      { sku: 'NX-AI-820', name: 'Predictive LLM Vector Cluster', category: 'AI & Data Intelligence', cost: 2100, price: 5900 },
      { sku: 'NX-DAT-310', name: 'Lakehouse Realtime Analytics Engine', category: 'Data Platform', cost: 920, price: 2850 },
      { sku: 'NX-DEV-150', name: 'Continuous DevSecOps Pipeline Suite', category: 'Developer Tools', cost: 340, price: 1100 },
      { sku: 'NX-API-200', name: 'Microservices Mesh Orchestrator', category: 'Cloud Infrastructure', cost: 510, price: 1650 },
      { sku: 'NX-AUD-500', name: 'Compliance & Governance Radar', category: 'Cybersecurity', cost: 740, price: 2400 },
      { sku: 'NX-BI-400', name: 'Executive BI Automated Reporting Node', category: 'Data Platform', cost: 480, price: 1550 },
    ],
    customers: [
      { name: 'Apex Global Financial Corp', industry: 'Banking & Fintech', tier: 'Enterprise Strategic' },
      { name: 'Vanguard Biopharma Ltd', industry: 'Life Sciences', tier: 'Enterprise Strategic' },
      { name: 'OmniStream Media Networks', industry: 'Telecommunications', tier: 'Mid-Market' },
      { name: 'Stratosphere Aerospace', industry: 'Defense & Aviation', tier: 'Enterprise Strategic' },
      { name: 'Beacon Health Systems', industry: 'Healthcare', tier: 'Corporate' },
      { name: 'Horizon Renewable Energy', industry: 'Clean Energy & Utilities', tier: 'Corporate' },
      { name: 'Pinnacle Logistics International', industry: 'Supply Chain', tier: 'Mid-Market' },
      { name: 'Quantum Leap Interactive', industry: 'Gaming & Metaverse', tier: 'SMB' },
      { name: 'Terraform AgroTech', industry: 'Agriculture Tech', tier: 'Mid-Market' },
      { name: 'Aegis Cyber Defense Group', industry: 'Information Security', tier: 'Enterprise Strategic' },
      { name: 'Solis Automotive Group', industry: 'Automotive & EV', tier: 'Enterprise Strategic' },
      { name: 'Crestview Retail Omnichannel', industry: 'Retail & E-commerce', tier: 'Corporate' },
    ],
  },
  ecommerce_retail: {
    name: 'Global Omnichannel Retail',
    description: 'Multi-brand consumer retail, smart electronics, lifestyle apparel, and fulfillment logistics.',
    companyDefault: 'Meridian Global Retailers Inc.',
    products: [
      { sku: 'RET-AUD-101', name: 'AcousticPro ANC Wireless Headphones', category: 'Consumer Electronics', cost: 65, price: 199 },
      { sku: 'RET-WCH-202', name: 'Apex Chrono Smart Fitness Watch', category: 'Wearables & Health', cost: 85, price: 249 },
      { sku: 'RET-HOM-303', name: 'PureAir HEPA Smart Air Purifier', category: 'Home & Living', cost: 110, price: 320 },
      { sku: 'RET-LUG-404', name: 'AeroCarbon 28" Expandable Luggage', category: 'Travel & Gear', cost: 75, price: 235 },
      { sku: 'RET-APP-505', name: 'Merino Wool Thermal Performance Parka', category: 'Apparel & Outerwear', cost: 55, price: 185 },
      { sku: 'RET-CAM-606', name: '4K Ultra Stabilized Action Cam', category: 'Consumer Electronics', cost: 130, price: 380 },
      { sku: 'RET-KIT-707', name: 'Precision Espresso Induction Station', category: 'Home & Living', cost: 190, price: 540 },
    ],
    customers: [
      { name: 'Nordic Department Stores', industry: 'Luxury Retail', tier: 'Enterprise Strategic' },
      { name: 'Pacific Coast Distributors', industry: 'Wholesale & Distribution', tier: 'Enterprise Strategic' },
      { name: 'Urban Outfitters Collective', industry: 'Fashion Retail', tier: 'Corporate' },
      { name: 'Metro Express Hypermarkets', industry: 'Mass Merchant', tier: 'Enterprise Strategic' },
      { name: 'Cascade Outdoor Outlets', industry: 'Sporting Goods', tier: 'Mid-Market' },
      { name: 'Summit Lifestyle Boutiques', industry: 'Specialty Retail', tier: 'SMB' },
    ],
  },
  healthcare_pharma: {
    name: 'Healthcare & Medical Devices',
    description: 'Diagnostic equipment, clinical lab analyzers, patient monitoring nodes, and surgical robotics.',
    companyDefault: 'BioSynex Healthcare Technologies',
    products: [
      { sku: 'MED-DIA-01', name: 'Rapid Molecular PCR Diagnostic Suite', category: 'In-Vitro Diagnostics', cost: 3800, price: 11200 },
      { sku: 'MED-MON-02', name: 'ICU Continuous Hemodynamic Monitor', category: 'Patient Monitoring', cost: 2400, price: 7300 },
      { sku: 'MED-ULT-03', name: 'Portable Color Doppler Ultrasound Cart', category: 'Medical Imaging', cost: 6200, price: 18500 },
      { sku: 'MED-SUR-04', name: 'Minimally Invasive Endoscopic Trocar Kit', category: 'Surgical Instruments', cost: 420, price: 1350 },
      { sku: 'MED-INF-05', name: 'Precision Programmable Infusion Pump', category: 'Drug Delivery', cost: 790, price: 2450 },
    ],
    customers: [
      { name: 'Mayo Allied Hospital Network', industry: 'Academic Medical Center', tier: 'Enterprise Strategic' },
      { name: 'St. Jude Regional Healthcare', industry: 'Integrated Health System', tier: 'Enterprise Strategic' },
      { name: 'Genesis Clinical Laboratories', industry: 'Diagnostic Testing', tier: 'Corporate' },
      { name: 'Bavaria Cantonal Health Union', industry: 'Public Health Authority', tier: 'Enterprise Strategic' },
      { name: 'SingHealth Multi-Specialty Clinic', industry: 'Outpatient Care', tier: 'Mid-Market' },
    ],
  },
  industrial_manufacturing: {
    name: 'Industrial & Advanced Manufacturing',
    description: 'Heavy robotics, precision automation, smart sensors, and industrial CNC controllers.',
    companyDefault: 'Titan Industrial Systems AG',
    products: [
      { sku: 'IND-ROB-80', name: '6-Axis Articulated Assembly Robot', category: 'Industrial Robotics', cost: 9800, price: 27500 },
      { sku: 'IND-SEN-40', name: 'Vibration & Thermal IoT Telemetry Pod', category: 'Smart Sensors', cost: 320, price: 1100 },
      { sku: 'IND-CNC-10', name: '5-Axis Precision Milling CNC Station', category: 'Precision Machinery', cost: 18500, price: 49000 },
      { sku: 'IND-HYD-25', name: 'High-Pressure Hydraulic Servo Actuator', category: 'Hydraulics & Power', cost: 1400, price: 4100 },
      { sku: 'IND-SAF-15', name: 'Optoelectronic Laser Safety Scanner', category: 'Safety Systems', cost: 650, price: 2050 },
    ],
    customers: [
      { name: 'Krupp Heavy Engineering', industry: 'Heavy Equipment', tier: 'Enterprise Strategic' },
      { name: 'Daewoo Precision Motors', industry: 'Automotive Powertrain', tier: 'Enterprise Strategic' },
      { name: 'Atlas Aerospace Composites', industry: 'Aviation Structures', tier: 'Enterprise Strategic' },
      { name: 'Nordic Renewable Turbines', industry: 'Wind Energy', tier: 'Corporate' },
      { name: 'Brampton Metalworks Ltd', industry: 'Fabrication', tier: 'Mid-Market' },
    ],
  },
  finance_wealth: {
    name: 'Financial Solutions & Wealth FinTech',
    description: 'Algorithmic trading engines, private banking terminals, regulatory auditing suites, and wealth portals.',
    companyDefault: 'Aura Capital & FinTech Group',
    products: [
      { sku: 'FIN-TRD-01', name: 'Ultra-Low Latency Execution Terminal', category: 'Trading Systems', cost: 2200, price: 6800 },
      { sku: 'FIN-AML-02', name: 'Automated Anti-Money Laundering Engine', category: 'Risk & Compliance', cost: 1400, price: 4500 },
      { sku: 'FIN-WLTH-03', name: 'Private Client Wealth Portfolio Suite', category: 'Wealth Management', cost: 1100, price: 3400 },
      { sku: 'FIN-CRED-04', name: 'Machine Learning Credit Risk Evaluator', category: 'Risk & Compliance', cost: 1600, price: 5100 },
      { sku: 'FIN-API-05', name: 'Open Banking PSD2 Integration Hub', category: 'FinTech Infrastructure', cost: 750, price: 2350 },
    ],
    customers: [
      { name: 'Zurich Private Wealth Bank', industry: 'Private Banking', tier: 'Enterprise Strategic' },
      { name: 'London Capital Partners', industry: 'Hedge Fund & Equity', tier: 'Enterprise Strategic' },
      { name: 'SingaTrade Digital Securities', industry: 'Brokerage & Exchange', tier: 'Corporate' },
      { name: 'Manhattan Credit Union', industry: 'Retail Banking', tier: 'Mid-Market' },
      { name: 'Tokyo Sovereign Asset Management', industry: 'Sovereign Wealth', tier: 'Enterprise Strategic' },
    ],
  },
};

const REGIONAL_GEOGRAPHY: Record<
  'North America' | 'EMEA' | 'APAC' | 'LATAM',
  { countries: { name: string; cities: string[] }[]; director: string }
> = {
  'North America': {
    director: 'Victoria Sterling',
    countries: [
      { name: 'United States', cities: ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Chicago, IL', 'Boston, MA'] },
      { name: 'Canada', cities: ['Toronto, ON', 'Vancouver, BC', 'Montreal, QC', 'Calgary, AB'] },
    ],
  },
  'EMEA': {
    director: 'Alexander Von Berg',
    countries: [
      { name: 'United Kingdom', cities: ['London', 'Manchester', 'Edinburgh'] },
      { name: 'Germany', cities: ['Frankfurt', 'Munich', 'Berlin', 'Stuttgart'] },
      { name: 'France', cities: ['Paris', 'Lyon', 'Toulouse'] },
      { name: 'Netherlands', cities: ['Amsterdam', 'Rotterdam'] },
      { name: 'United Arab Emirates', cities: ['Dubai', 'Abu Dhabi'] },
      { name: 'Switzerland', cities: ['Zurich', 'Geneva'] },
    ],
  },
  'APAC': {
    director: 'Kenji Takahashi',
    countries: [
      { name: 'Japan', cities: ['Tokyo', 'Osaka', 'Nagoya'] },
      { name: 'Singapore', cities: ['Singapore CBD', 'Jurong East'] },
      { name: 'Australia', cities: ['Sydney, NSW', 'Melbourne, VIC', 'Brisbane, QLD'] },
      { name: 'India', cities: ['Bengaluru', 'Mumbai', 'Hyderabad'] },
      { name: 'South Korea', cities: ['Seoul', 'Incheon'] },
    ],
  },
  'LATAM': {
    director: 'Mariana Silva Cortez',
    countries: [
      { name: 'Brazil', cities: ['São Paulo', 'Rio de Janeiro', 'Curitiba'] },
      { name: 'Mexico', cities: ['Mexico City', 'Monterrey', 'Guadalajara'] },
      { name: 'Chile', cities: ['Santiago', 'Valparaíso'] },
      { name: 'Colombia', cities: ['Bogotá', 'Medellín'] },
    ],
  },
};

const SALES_REPS = [
  'Marcus Vance',
  'Elena Rostova',
  'David K. Chen',
  'Sarah Jenkins',
  'Liam O\'Connor',
  'Priya Sharma',
  'Mateo Alvarez',
  'Chloe Dubois',
];

const SALES_CHANNELS: Transaction['salesChannel'][] = [
  'Direct Enterprise',
  'Partner Ecosystem',
  'Inside Sales',
  'Online Enterprise',
];

const PAYMENT_TERMS: Transaction['paymentTerms'][] = [
  'Net 30',
  'Net 60',
  'Annual Prepaid',
  'Credit Card / ACH',
];

// Seeded pseudorandom generator for repeatable realistic datasets
function createRng(seed = 123456789) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function generateRealisticDataset(config: DatasetConfig) {
  const rng = createRng(42 + config.recordCount);
  const preset = INDUSTRY_PRESETS[config.industry] || INDUSTRY_PRESETS.enterprise_tech;

  const transactions: Transaction[] = [];
  const regions: ('North America' | 'EMEA' | 'APAC' | 'LATAM')[] = [
    'North America',
    'North America', // weighted towards NA & EMEA
    'EMEA',
    'EMEA',
    'APAC',
    'LATAM',
  ];

  // Generate date ranges over past 18 months (e.g., 2024-01-01 to 2025-06-30)
  const startDate = new Date(2024, 0, 15).getTime();
  const endDate = new Date(2025, 5, 28).getTime();
  const timeSpan = endDate - startDate;

  for (let i = 1; i <= config.recordCount; i++) {
    // ID
    const txId = `TX-${2024 + Math.floor(rng() * 2)}-${String(10000 + i).slice(1)}`;
    
    // Pick customer
    const cust = preset.customers[Math.floor(rng() * preset.customers.length)];
    const custId = `CUST-${String(100 + (Math.abs(hashString(cust.name)) % 900))}`;

    // Pick region & country & city
    const regionName = regions[Math.floor(rng() * regions.length)];
    const geo = REGIONAL_GEOGRAPHY[regionName];
    const countryObj = geo.countries[Math.floor(rng() * geo.countries.length)];
    const city = countryObj.cities[Math.floor(rng() * countryObj.cities.length)];

    // Pick product
    const product = preset.products[Math.floor(rng() * preset.products.length)];
    
    // Quantity: 1 to 15 (skewed towards 1-4 with occasional enterprise bulk 8-15)
    let quantity = 1;
    const qRoll = rng();
    if (qRoll > 0.88) quantity = Math.floor(rng() * 8) + 8;
    else if (qRoll > 0.60) quantity = Math.floor(rng() * 4) + 3;
    else quantity = Math.floor(rng() * 2) + 1;

    // Discount rate (e.g. 0%, 5%, 10%, 15%, 20%)
    let discountPct = 0;
    const dRoll = rng();
    if (dRoll > 0.85) discountPct = 0.20;
    else if (dRoll > 0.65) discountPct = 0.15;
    else if (dRoll > 0.45) discountPct = 0.10;
    else if (dRoll > 0.25) discountPct = 0.05;
    else discountPct = 0;

    // Financial calculations
    const listPrice = product.price;
    const unitCost = product.cost;
    const grossRev = quantity * listPrice * (1 - discountPct);
    const cogs = quantity * unitCost;
    const grossProfit = grossRev - cogs;
    const marginPct = grossRev > 0 ? grossProfit / grossRev : 0;

    // Date
    const txTimestamp = new Date(startDate + rng() * timeSpan);
    const dateStr = txTimestamp.toISOString().split('T')[0];
    const quarter = `Q${Math.floor(txTimestamp.getMonth() / 3) + 1}-${txTimestamp.getFullYear()}`;

    // Sales channel & Rep
    const rep = SALES_REPS[Math.floor(rng() * SALES_REPS.length)];
    const channel = SALES_CHANNELS[Math.floor(rng() * SALES_CHANNELS.length)];
    const payment = PAYMENT_TERMS[Math.floor(rng() * PAYMENT_TERMS.length)];

    transactions.push({
      id: txId,
      orderDate: dateStr,
      quarter,
      customerId: custId,
      customerName: cust.name,
      customerTier: cust.tier,
      industry: cust.industry,
      region: regionName,
      country: countryObj.name,
      city,
      salesRep: rep,
      salesChannel: channel,
      sku: product.sku,
      productName: product.name,
      productCategory: product.category,
      unitCost: round2(unitCost),
      unitPrice: round2(listPrice),
      quantity,
      discountPct: round2(discountPct),
      revenue: round2(grossRev),
      cogs: round2(cogs),
      grossProfit: round2(grossProfit),
      marginPct: round4(marginPct),
      paymentTerms: payment,
      status: rng() > 0.08 ? 'Completed' : 'Invoiced',
    });
  }

  // Sort by date ascending
  transactions.sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());

  // Aggregate Product Catalog items
  const productCatalog: ProductCatalogItem[] = preset.products.map((p, idx) => {
    const txs = transactions.filter((t) => t.sku === p.sku);
    const totalUnits = txs.reduce((sum, t) => sum + t.quantity, 0);
    return {
      sku: p.sku,
      productName: p.name,
      category: p.category,
      unitCost: p.cost,
      listPrice: p.price,
      standardMarginPct: round4((p.price - p.cost) / p.price),
      leadTimeDays: [7, 14, 21, 30][idx % 4],
      stockLevel: Math.floor(150 + totalUnits * 0.4 + rng() * 100),
      status: totalUnits > 200 ? 'High Demand' : 'Active',
    };
  });

  // Aggregate Regional Performance
  const regionalPerformance: RegionalPerformance[] = (['North America', 'EMEA', 'APAC', 'LATAM'] as const).map((reg) => {
    const txs = transactions.filter((t) => t.region === reg);
    const actualRev = round2(txs.reduce((sum, t) => sum + t.revenue, 0));
    const actualProfit = round2(txs.reduce((sum, t) => sum + t.grossProfit, 0));
    const targetMultiplier = reg === 'North America' ? 0.94 : reg === 'EMEA' ? 0.98 : reg === 'APAC' ? 1.05 : 0.91;
    const targetRevenue = round2(actualRev * targetMultiplier);
    const targetProfit = round2(actualProfit * targetMultiplier);
    const quotaPct = targetRevenue > 0 ? actualRev / targetRevenue : 1;
    const geo = REGIONAL_GEOGRAPHY[reg];

    return {
      region: reg,
      countries: geo.countries.map((c) => c.name).slice(0, 3).join(', ') + (geo.countries.length > 3 ? '...' : ''),
      targetRevenue,
      actualRevenue: actualRev,
      targetProfit,
      actualProfit,
      quotaAttainmentPct: round4(quotaPct),
      orderCount: txs.length,
      averageDealSize: txs.length > 0 ? round2(actualRev / txs.length) : 0,
      growthRateYoY: round4(0.12 + (rng() * 0.14 - 0.04)),
      regionalDirector: geo.director,
    };
  });

  // Aggregate Customer Accounts
  const customerMap = new Map<string, CustomerAccount>();
  for (const t of transactions) {
    if (!customerMap.has(t.customerId)) {
      customerMap.set(t.customerId, {
        customerId: t.customerId,
        customerName: t.customerName,
        tier: t.customerTier,
        industry: t.industry,
        country: t.country,
        totalOrders: 0,
        lifetimeRevenue: 0,
        lifetimeProfit: 0,
        contractRenewal: '2026-Q1',
        accountHealth: 'Optimal',
        accountExecutive: t.salesRep,
      });
    }
    const acc = customerMap.get(t.customerId)!;
    acc.totalOrders += 1;
    acc.lifetimeRevenue = round2(acc.lifetimeRevenue + t.revenue);
    acc.lifetimeProfit = round2(acc.lifetimeProfit + t.grossProfit);
  }

  const customerAccounts = Array.from(customerMap.values()).map((acc, i) => {
    const healthRoll = (i * 17) % 10;
    acc.accountHealth = healthRoll < 7 ? 'Optimal' : healthRoll < 9 ? 'Stable' : 'At Risk';
    acc.contractRenewal = `2026-Q${(i % 4) + 1}`;
    return acc;
  });
  customerAccounts.sort((a, b) => b.lifetimeRevenue - a.lifetimeRevenue);

  // Aggregate Monthly Trends
  const monthMap = new Map<string, { revenue: number; grossProfit: number; orders: number }>();
  for (const t of transactions) {
    const mKey = t.orderDate.slice(0, 7); // "YYYY-MM"
    if (!monthMap.has(mKey)) {
      monthMap.set(mKey, { revenue: 0, grossProfit: 0, orders: 0 });
    }
    const cur = monthMap.get(mKey)!;
    cur.revenue += t.revenue;
    cur.grossProfit += t.grossProfit;
    cur.orders += 1;
  }

  const monthlyTrends: MonthlyTrend[] = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => {
      const [year, month] = key.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const label = `${monthNames[parseInt(month, 10) - 1]} '${year.slice(2)}`;
      const rev = round2(val.revenue);
      const prof = round2(val.grossProfit);
      return {
        monthKey: key,
        monthLabel: label,
        revenue: rev,
        grossProfit: prof,
        orderCount: val.orders,
        marginPct: rev > 0 ? round4(prof / rev) : 0,
      };
    });

  // Category Summaries
  const catMap = new Map<string, { units: number; revenue: number; profit: number }>();
  let totalRevAll = 0;
  for (const t of transactions) {
    if (!catMap.has(t.productCategory)) {
      catMap.set(t.productCategory, { units: 0, revenue: 0, profit: 0 });
    }
    const c = catMap.get(t.productCategory)!;
    c.units += t.quantity;
    c.revenue += t.revenue;
    c.profit += t.grossProfit;
    totalRevAll += t.revenue;
  }

  const categorySummaries: CategorySummary[] = Array.from(catMap.entries())
    .map(([cat, val]) => {
      const rev = round2(val.revenue);
      const prof = round2(val.profit);
      return {
        category: cat,
        units: val.units,
        revenue: rev,
        grossProfit: prof,
        marginPct: rev > 0 ? round4(prof / rev) : 0,
        sharePct: totalRevAll > 0 ? round4(rev / totalRevAll) : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  // Overall KPIs
  const totalRevenue = round2(transactions.reduce((s, t) => s + t.revenue, 0));
  const totalGrossProfit = round2(transactions.reduce((s, t) => s + t.grossProfit, 0));
  const totalCogs = round2(transactions.reduce((s, t) => s + t.cogs, 0));
  const totalUnits = transactions.reduce((s, t) => s + t.quantity, 0);
  const averageDealSize = transactions.length > 0 ? round2(totalRevenue / transactions.length) : 0;
  const overallMarginPct = totalRevenue > 0 ? round4(totalGrossProfit / totalRevenue) : 0;

  return {
    config,
    transactions,
    productCatalog,
    regionalPerformance,
    customerAccounts,
    monthlyTrends,
    categorySummaries,
    kpi: {
      totalRevenue,
      totalGrossProfit,
      totalCogs,
      totalUnits,
      orderCount: transactions.length,
      averageDealSize,
      overallMarginPct,
      topRegion: regionalPerformance[0]?.region || 'North America',
      topCategory: categorySummaries[0]?.category || 'Core Enterprise',
      activeCustomers: customerAccounts.length,
    },
  };
}

function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function round4(num: number): number {
  return Math.round((num + Number.EPSILON) * 10000) / 10000;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
