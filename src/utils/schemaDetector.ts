import {
  ColumnDataType,
  ColumnProfile,
  DatasetSchemaProfile,
  IndustryType,
} from '../types/dataset';
import { parseUniversalDate, isHelpdeskDomain, detectHelpdeskColumns } from './helpdeskMetrics';

// Keyword dictionary for each of the 12 industries
const INDUSTRY_KEYWORDS: Record<IndustryType, { headers: string[]; values: string[] }> = {
  healthcare_pharma: {
    headers: [
      'patient', 'diagnosis', 'doctor', 'physician', 'hospital', 'clinic', 'ehr', 'dosage',
      'treatment', 'medication', 'prescription', 'admission', 'discharge', 'bed', 'icu',
      'surgery', 'therapy', 'clinical', 'triage', 'bmi', 'vitals', 'medical', 'pharma',
      'drug', 'disease', 'condition', 'encounter', 'stay', 'lengthofstay', 'los', 'nurse'
    ],
    values: [
      'cardiology', 'oncology', 'pediatrics', 'neurology', 'orthopedic', 'radiology',
      'inpatient', 'outpatient', 'emergency', 'mg', 'mcg', 'icu', 'icu', 'acute', 'chronic',
      'recovered', 'stable', 'admitted', 'discharged', 'surgery', 'infusion', 'biopsy'
    ],
  },
  finance_wealth: {
    headers: [
      'account', 'balance', 'loan', 'interest', 'credit', 'debit', 'deposit', 'withdrawal',
      'investment', 'portfolio', 'asset', 'equity', 'dividend', 'ticker', 'aum', 'nav',
      'apr', 'collateral', 'riskscore', 'default', 'maturity', 'capital', 'fund', 'tranche',
      'tenor', 'yield', 'borrower', 'lender', 'mortgage', 'principal'
    ],
    values: [
      'checking', 'savings', 'equity', 'fixed income', 'mutual fund', 'etf', 'hedge fund',
      'prime', 'subprime', 'treasury', 'bond', 'secured', 'unsecured', 'performing',
      'delinquent', 'approved', 'underwritten', 'liquid', 'crypto'
    ],
  },
  ecommerce_retail: {
    headers: [
      'product', 'sku', 'order', 'cart', 'gmv', 'customer', 'item', 'checkout', 'return',
      'shipping', 'freight', 'store', 'inventory', 'discount', 'coupon', 'promo', 'brand',
      'apparel', 'merchandise', 'barcode', 'upc', 'pos', 'delivery', 'fulfillment'
    ],
    values: [
      'electronics', 'clothing', 'footwear', 'apparel', 'home & living', 'accessories',
      'shipped', 'delivered', 'returned', 'refunded', 'express', 'standard', 'free shipping',
      'prime', 'in stock', 'backorder'
    ],
  },
  enterprise_tech: {
    headers: [
      'arr', 'mrr', 'subscription', 'tier', 'plan', 'license', 'seat', 'churn', 'cloud',
      'api', 'server', 'cluster', 'tenant', 'saas', 'dau', 'mau', 'bandwidth', 'storage',
      'infra', 'endpoint', 'deployment', 'feature', 'ticket', 'latency', 'uptime'
    ],
    values: [
      'enterprise', 'pro', 'starter', 'free tier', 'kubernetes', 'aws', 'gcp', 'azure',
      'active', 'canceled', 'trial', 'monthly', 'annual', 'api key', 'microservices'
    ],
  },
  industrial_manufacturing: {
    headers: [
      'factory', 'plant', 'warehouse', 'shipment', 'pallet', 'supplier', 'vendor', 'batch',
      'yield', 'scrap', 'defect', 'tolerance', 'assembly', 'machine', 'spindle', 'oee',
      'leadtime', 'carrier', 'rawmaterial', 'lot', 'partnumber', 'downtime', 'maintenance'
    ],
    values: [
      'assembly line', 'machining', 'stamping', 'welding', 'injection molding', 'passed',
      'rejected', 'reworked', 'supplier', 'tier 1', 'tier 2', 'iso 9001', 'cnc', 'tooling'
    ],
  },
  real_estate: {
    headers: [
      'property', 'tenant', 'lease', 'rent', 'sqft', 'squarefeet', 'squarefoot', 'occupancy',
      'caprate', 'appraisal', 'valuation', 'mortgage', 'landlord', 'unit', 'building',
      'listing', 'zoning', 'parcel', 'bedroom', 'bathroom', 'amenities', 'propertymanager'
    ],
    values: [
      'commercial', 'residential', 'industrial', 'multi-family', 'single family', 'retail space',
      'office', 'warehouse', 'leased', 'vacant', 'under contract', 'sold', 'penthouse', 'suite'
    ],
  },
  human_resources: {
    headers: [
      'employee', 'headcount', 'salary', 'compensation', 'bonus', 'tenure', 'department',
      'hire', 'hiredate', 'turnover', 'attrition', 'rating', 'review', 'position', 'jobtitle',
      'payroll', 'hr', 'benefits', 'overtime', 'manager', 'leave', 'fte', 'contractor'
    ],
    values: [
      'engineering', 'marketing', 'human resources', 'finance', 'operations', 'legal',
      'full-time', 'part-time', 'contractor', 'active', 'terminated', 'resigned', 'onboarding',
      'exceeds expectations', 'meets expectations', 'needs improvement'
    ],
  },
  hospitality_travel: {
    headers: [
      'hotel', 'guest', 'booking', 'room', 'reservation', 'checkin', 'checkout', 'revpar',
      'adr', 'flight', 'passenger', 'airline', 'meal', 'cover', 'table', 'dining', 'resort',
      'stays', 'nights', 'destination', 'itinerary', 'seatclass'
    ],
    values: [
      'deluxe', 'suite', 'standard room', 'ocean view', 'first class', 'business class',
      'economy', 'buffet', 'a la carte', 'confirmed', 'checked-in', 'checked-out', 'canceled'
    ],
  },
  energy_utilities: {
    headers: [
      'energy', 'kwh', 'mwh', 'power', 'grid', 'utility', 'turbine', 'solar', 'wind', 'gas',
      'oil', 'carbon', 'emission', 'megawatt', 'consumption', 'meter', 'fuel', 'voltage',
      'substation', 'pipeline', 'efficiency', 'co2'
    ],
    values: [
      'renewable', 'fossil', 'photovoltaic', 'hydroelectric', 'nuclear', 'natural gas',
      'peak hour', 'off-peak', 'grid active', 'tripped', 'megawatts', 'kwh'
    ],
  },
  education_academic: {
    headers: [
      'student', 'course', 'class', 'grade', 'gpa', 'tuition', 'faculty', 'professor',
      'semester', 'enrollment', 'exam', 'degree', 'alumni', 'campus', 'scholar', 'major',
      'credits', 'attendance', 'assignment', 'syllabus'
    ],
    values: [
      'undergraduate', 'graduate', 'freshman', 'sophomore', 'junior', 'senior', 'fall semester',
      'spring semester', 'passed', 'failed', 'enrolled', 'graduated', 'computer science',
      'business administration', 'biology'
    ],
  },
  marketing_media: {
    headers: [
      'campaign', 'impression', 'impressions', 'click', 'clicks', 'ctr', 'cpc', 'cpa', 'roas',
      'spend', 'adspend', 'conversion', 'conversions', 'ad', 'creative', 'audience', 'reach',
      'traffic', 'leads', 'keyword', 'platform', 'attribution'
    ],
    values: [
      'facebook ads', 'google search', 'tiktok', 'linkedin', 'display banner', 'retargeting',
      'prospecting', 'video view', 'lead gen', 'cpm', 'conversion rate', 'active campaign'
    ],
  },
  general_business: {
    headers: ['amount', 'total', 'quantity', 'category', 'status', 'date', 'name', 'code'],
    values: ['active', 'completed', 'pending', 'cancelled'],
  },
  logistics_supply_chain: {
    headers: ['shipment', 'freight', 'carrier', 'consignment', 'tonmile', 'haulage', 'warehouse', 'transit', 'logistics', 'delivery', 'cargo', 'otif', 'intermodal', 'fleet', 'truckload'],
    values: ['air freight', 'ocean cargo', 'full truckload', 'intermodal rail', 'express courier', 'in transit', 'delivered', 'dock', 'manifest'],
  },
  automotive_ev: {
    headers: ['vin', 'powertrain', 'battery', 'charging', 'ev', 'vehicle', 'automotive', 'chassis', 'kwh', 'gigafactory', 'mileage', 'warranty', 'telematics', 'assembly'],
    values: ['bev', 'phev', 'electric vehicle', 'dual motor', 'long range', 'fast charging', 'supercharger', 'chassis', 'powertrain'],
  },
  pharmaceutical_biotech: {
    headers: ['assay', 'compound', 'molecule', 'biotech', 'target', 'screening', 'affinity', 'pharma', 'discovery', 'candidate', 'invitro', 'invivo', 'efficacy', 'pipeline', 'biopharma'],
    values: ['oncology', 'immunology', 'neurology', 'nanomolar', 'hit', 'lead', 'preclinical', 'recombinant', 'ind filing'],
  },
  construction_engineering: {
    headers: ['jobsite', 'subcontractor', 'epc', 'discipline', 'concrete', 'steel', 'equipment', 'backlog', 'contract', 'infrastructure', 'civil', 'safety', 'workpackage'],
    values: ['civil earthworks', 'structural steel', 'mep', 'jobsite', 'subcontractor', 'scaffolding', 'excavator', 'turnkey'],
  },
  telecom_networks: {
    headers: ['subscriber', 'arpu', 'tower', '5g', 'cell', 'broadband', 'bandwidth', 'latency', 'gigabit', 'telco', 'sim', 'roaming', 'uptime', 'telecom'],
    values: ['5g unlimited', 'gigabit fiber', 'iot', 'cell tower', 'packet', 'lte', 'spectrum', 'broadband'],
  },
  legal_compliance: {
    headers: ['litigation', 'counsel', 'attorney', 'matter', 'court', 'jurisdiction', 'billable', 'retainer', 'compliance', 'gdpr', 'sox', 'arbitration', 'paralegal', 'statute'],
    values: ['m&a', 'intellectual property', 'antitrust', 'defense counsel', 'retained', 'delaware chancery', 'chambers', 'brief'],
  },
  insurance_underwriting: {
    headers: ['policy', 'premium', 'underwriting', 'actuarial', 'claim', 'lossratio', 'deductible', 'reinsurance', 'coverage', 'gwp', 'catastrophe', 'indemnity', 'insured'],
    values: ['commercial property', 'general liability', 'd&o', 'cyber risk', 'casualty', 'underwritten', 'settled', 'surplus lines'],
  },
  agriculture_agritech: {
    headers: ['crop', 'harvest', 'hectare', 'acreage', 'bushel', 'agritech', 'soil', 'irrigation', 'yield', 'farm', 'grain', 'moisture', 'fertilizer', 'cultivated'],
    values: ['wheat', 'soybeans', 'corn', 'barley', 'orchard', 'farm cooperative', 'irrigation', 'bushels per acre', 'organic'],
  },
  food_beverage: {
    headers: ['menu', 'restaurant', 'dining', 'table', 'cogs', 'kitchen', 'food', 'beverage', 'ticket', 'covers', 'chef', 'franchise', 'bar', 'entree', 'waste'],
    values: ['entrees', 'appetizers', 'cocktails', 'desserts', 'catering', 'dine-in', 'takeout', 'table turns', 'fast casual'],
  },
  aerospace_defense: {
    headers: ['avionics', 'airframe', 'defense', 'procurement', 'flight', 'flighttest', 'subsystem', 'aerospace', 'payload', 'missile', 'radar', 'turbine', 'backlog'],
    values: ['radar', 'avionics', 'propulsion', 'satellite', 'airframe', 'military', 'flight hours', 'pentagon', 'contractor'],
  },
  cybersecurity_secops: {
    headers: ['incident', 'threat', 'vulnerability', 'mttr', 'cve', 'malware', 'ransomware', 'firewall', 'soc', 'siem', 'secops', 'endpoint', 'phishing', 'breach'],
    values: ['ransomware', 'ddos', 'zero-day', 'credential stuffing', 'soc analyst', 'quarantine', 'mitigated', 'pcap'],
  },
  media_entertainment: {
    headers: ['stream', 'viewer', 'streaming', 'ott', 'watchtime', 'content', 'license', 'cpm', 'subscriber', 'genre', 'boxoffice', 'adspend', 'episode', 'series'],
    values: ['sci-fi', 'docuseries', 'sports live', 'anime', 'comedy', 'hd stream', 'viewers', 'video-on-demand', 'svod'],
  },
  nonprofit_charity: {
    headers: ['donation', 'donor', 'charity', 'ngo', 'grant', 'philanthropy', 'fundraising', 'beneficiary', 'humanitarian', 'outreach', 'pledge', 'cause', 'endowment'],
    values: ['clean water', 'disaster relief', 'endowment', 'donor', 'philanthropic', 'outreach', 'lives saved', 'volunteer'],
  },
  fitness_wellness: {
    headers: ['gym', 'fitness', 'workout', 'wellness', 'trainer', 'studio', 'attendance', 'membership', 'hiit', 'pilates', 'yoga', 'spin', 'coaching', 'retention'],
    values: ['hiit', 'yoga', 'crossfit', 'pilates', 'cycling', 'personal trainer', 'gym pass', 'studio session', 'reps'],
  },
  professional_services: {
    headers: ['consulting', 'advisory', 'engagement', 'billable', 'utilization', 'realization', 'partner', 'practice', 'retainer', 'deliverable', 'scoping', 'proposal'],
    values: ['strategy', 'digital transformation', 'advisory', 'management consulting', 'billable hours', 'm&a advisory'],
  },
  oil_gas_mining: {
    headers: ['barrel', 'boe', 'upstream', 'drilling', 'rig', 'crude', 'gas', 'mining', 'ore', 'well', 'refinery', 'hydrocarbon', 'lifting', 'flaring', 'concession'],
    values: ['light sweet crude', 'lng', 'natural gas', 'shale', 'offshore rig', 'bbl', 'mcf', 'open pit'],
  },
  fashion_luxury: {
    headers: ['luxury', 'boutique', 'couture', 'atelier', 'designer', 'apparel', 'runway', 'garment', 'sellthrough', 'collection', 'handcrafted', 'leather', 'vic'],
    values: ['haute couture', 'leather goods', 'fine jewelry', 'ready-to-wear', 'flagship boutique', 'vic client', 'artisan'],
  },
  biomedical_genomics: {
    headers: ['genome', 'sequencing', 'ngs', 'flowcell', 'reads', 'gigabases', 'depth', 'q30', 'dna', 'rna', 'variant', 'assay', 'bioinformatics', 'sample'],
    values: ['whole genome', 'rna-seq', 'flowcell', 'gigabases', 'q30', 'coverage depth', 'fastq', 'bio-library'],
  },
  saas_product_ops: {
    headers: ['mrr', 'arr', 'nrr', 'churn', 'seat', 'tenant', 'saas', 'cloud', 'devops', 'compute', 'cluster', 'api', 'invocation', 'provisioning', 'dau'],
    values: ['enterprise dedicated', 'net retention', 'cloud compute', 'aws', 'gcp', 'azure', 'recurring revenue', 'tenant'],
  },
  customer_support_ops: {
    headers: [
      'ticket', 'support', 'csat', 'fcr', 'helpdesk', 'agent', 'handletime', 'escalation',
      'backlog', 'queue', 'call', 'inquiry', 'resolution', 'omnichannel', 'case', 'caseref',
      'loggedon', 'finishedat', 'currentstate', 'urgency', 'urgencyband', 'resolver',
      'resolvergroup', 'issuefamily', 'intakemethod', 'servicesite', 'slalimit', 'reopenedflag',
      'reopened', 'customerrating', 'incident', 'sla'
    ],
    values: [
      'live chat', 'helpdesk', 'voice call', 'first contact resolution', 'customer support',
      'csat', 'escalated', 'tier 1', 'tier 2', 'closed', 'resolved', 'in progress',
      'waiting on customer', 'critical', 'p1 critical', 'p2 high', 'p3 medium', 'p4 low',
      'portal', 'applications', 'infrastructure', 'network', 'end user support'
    ],
  },
};

/**
 * Clean and normalize a string header for comparison
 */
function clean(str: string): string {
  return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Checks if a sample value is a parseable date.
 */
function isDateValue(val: any): boolean {
  if (val === null || val === undefined || val === '') return false;
  return parseUniversalDate(val) !== null;
}

/**
 * Parse a value to number if possible
 */
export function parseCleanNumber(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return Number.isFinite(val) ? val : null;
  if (typeof val === 'string') {
    const s = val.trim();
    // Check if it's mostly a number with currency / commas / percentage
    const cleaned = s.replace(/[$€£¥₹,%\s]/g, '').replace(/^\((.*)\)$/, '-$1');
    if (cleaned === '' || isNaN(Number(cleaned))) return null;
    return Number.isFinite(Number(cleaned)) ? Number(cleaned) : null;
  }
  return null;
}

/**
 * Inspect individual column data type and characteristics
 */
export function profileColumn(
  header: string,
  values: any[]
): ColumnProfile {
  const cHeader = clean(header);
  const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== '');
  const totalCount = nonNullValues.length;

  if (totalCount === 0) {
    return {
      name: header,
      normalizedName: cHeader,
      dataType: 'text',
      sampleValues: [],
      nonNullCount: 0,
      distinctCount: 0,
      suggestedRole: 'text' as any,
    };
  }

  const sampleValues = nonNullValues.slice(0, 10);
  const distinctValues = new Set(nonNullValues.map((v) => String(v).trim()));
  const distinctCount = distinctValues.size;
  const distinctRatio = distinctCount / totalCount;

  // IDs are dimensions, even when their values happen to be numeric or date serials.
  if (/^(id|sku|uuid|code)$|(?:id|code|number)$/.test(cHeader)) {
    return { name: header, normalizedName: cHeader, dataType: 'identifier', sampleValues, nonNullCount: totalCount, distinctCount, suggestedRole: 'identifier' };
  }
  // 1. Date Detection
  const dateMatches = nonNullValues.filter((v) => isDateValue(v)).length;
  const dateHeader = /date|timestamp|period|checkin|checkout/.test(cHeader);
  const isDate = dateMatches / totalCount > 0.6 && (dateHeader || nonNullValues.some(v => v instanceof Date || (typeof v === 'string' && /[-/]|[a-z]{3}/i.test(v))));
  if (isDate) {
    return {
      name: header,
      normalizedName: cHeader,
      dataType: 'date',
      sampleValues,
      nonNullCount: totalCount,
      distinctCount,
      suggestedRole: 'date',
    };
  }

  // 2. Numeric / Currency / Percentage Detection
  const numericValues = nonNullValues
    .map((v) => parseCleanNumber(v))
    .filter((n): n is number => n !== null);

  const isNumeric = numericValues.length / totalCount > 0.65;

  if (isNumeric) {
    const min = numericValues.reduce((a, b) => Math.min(a, b), Infinity);
    const max = numericValues.reduce((a, b) => Math.max(a, b), -Infinity);
    const sum = numericValues.reduce((a, b) => a + b, 0);
    const avg = sum / numericValues.length;

    // Check for Currency indicators in header or formatting
    const currencyKeywords = [
      'revenue', 'sales', 'cost', 'cogs', 'price', 'profit', 'spend', 'amount',
      'salary', 'wage', 'payroll', 'budget', 'balance', 'rent', 'valuation',
      'loan', 'total', 'subtotal', 'fee', 'charge', 'rate', 'gmv', 'arr', 'mrr',
      'bill', 'paid', 'payout', 'income', 'commission', 'bonus'
    ];
    const hasCurrencySymbol = nonNullValues.some((v) => typeof v === 'string' && /[$€£¥₹]/.test(v));
    const hasCurrencyKeyword = currencyKeywords.some((kw) => cHeader.includes(kw));

    if ((hasCurrencySymbol || hasCurrencyKeyword) && !nonNullValues.some(v => typeof v === 'string' && v.includes('%')) && !/margin|pct|percent|ratio|conversionrate|clickthroughrate|ctr|churn|occupancy|yield|interestrate/.test(cHeader)) {
      return {
        name: header,
        normalizedName: cHeader,
        dataType: 'currency',
        sampleValues,
        nonNullCount: totalCount,
        distinctCount,
        stats: { min, max, sum, avg },
        suggestedRole: cHeader.includes('cost') || cHeader.includes('cogs') ? 'secondaryMetric' : 'primaryMetric',
      };
    }

    // Check for Percentage indicators
    const percentKeywords = ['margin', 'pct', 'percent', 'percentage', 'ratio', 'yield', 'rate', 'discount', 'attainment', 'churn'];
    const hasPercentSymbol = nonNullValues.some((v) => typeof v === 'string' && v.includes('%'));
    const isSmallDecimal = min >= 0 && max <= 1.05 && avg < 0.9;
    const hasPercentKeyword = percentKeywords.some((kw) => cHeader.includes(kw));

    if (hasPercentSymbol || hasPercentKeyword && (isSmallDecimal || /pct|percent|margin|ratio|ctr|churn|occupancy|yield|conversionrate|interestrate/.test(cHeader))) {
      return {
        name: header,
        normalizedName: cHeader,
        dataType: 'percentage',
        sampleValues,
        nonNullCount: totalCount,
        distinctCount,
        stats: { min, max, sum, avg },
        suggestedRole: 'secondaryMetric',
      };
    }

    // General Numeric (Quantity, Count, Units, Hours, Age, Score, etc.)
    const isVolume = ['qty', 'quantity', 'units', 'volume', 'count', 'pieces', 'headcount', 'hours', 'stays', 'encounters', 'visits'].some((kw) => cHeader.includes(kw));

    return {
      name: header,
      normalizedName: cHeader,
      dataType: 'numeric',
      sampleValues,
      nonNullCount: totalCount,
      distinctCount,
      stats: { min, max, sum, avg },
      suggestedRole: isVolume ? 'volumeMetric' : 'primaryMetric',
    };
  }

  // 3. Identifier Detection (ID, Code, SKU, UUID, Key, Number)
  const idKeywords = ['id', 'sku', 'code', 'key', 'uuid', 'ssn', 'hash', 'number', 'no', 'ref'];
  const hasIdKeyword = idKeywords.some((kw) => cHeader === kw || cHeader.endsWith(kw) || cHeader.startsWith(kw));
  if (hasIdKeyword && !/name|customer|patient|employee|student|vendor|supplier|tenant/.test(cHeader) && distinctCount > 5) {
    return {
      name: header,
      normalizedName: cHeader,
      dataType: 'identifier',
      sampleValues,
      nonNullCount: totalCount,
      distinctCount,
      suggestedRole: 'identifier',
    };
  }

  // 4. Categorical vs Entity vs Text
  const isStatus = ['status', 'condition', 'stage', 'flag', 'phase'].some((kw) => cHeader.includes(kw));
  if (isStatus) {
    return {
      name: header,
      normalizedName: cHeader,
      dataType: 'categorical',
      sampleValues,
      nonNullCount: totalCount,
      distinctCount,
      suggestedRole: 'status',
    };
  }

  const isEntity = ['name', 'customer', 'client', 'patient', 'employee', 'doctor', 'physician', 'student', 'user', 'vendor', 'supplier', 'tenant'].some((kw) => cHeader.includes(kw));
  if (isEntity) {
    return {
      name: header,
      normalizedName: cHeader,
      dataType: 'text',
      sampleValues,
      nonNullCount: totalCount,
      distinctCount,
      suggestedRole: 'entityName',
    };
  }

  // Categorical if discrete number of unique values
  if (distinctCount <= 50 || distinctRatio < 0.4) {
    return {
      name: header,
      normalizedName: cHeader,
      dataType: 'categorical',
      sampleValues,
      nonNullCount: totalCount,
      distinctCount,
      suggestedRole: 'primaryCategory',
    };
  }

  return {
    name: header,
    normalizedName: cHeader,
    dataType: 'text',
    sampleValues,
    nonNullCount: totalCount,
    distinctCount,
    suggestedRole: 'text' as any,
  };
}

/**
 * Intelligent industry classification by evaluating dataset headers and sample rows.
 */
export function detectIndustry(
  headers: string[],
  rows: Record<string, any>[]
): { industry: IndustryType; confidence: number; matches: Record<string, number> } {
  const scores = (Object.keys(INDUSTRY_KEYWORDS) as IndustryType[]).reduce((acc, ind) => {
    acc[ind] = 0;
    return acc;
  }, {} as Record<IndustryType, number>);

  const cleanHeaders = headers.map(clean);
  const sampleRows = rows.slice(0, 50);

  // Score headers (Weight = 3)
  for (const [ind, def] of Object.entries(INDUSTRY_KEYWORDS) as [IndustryType, { headers: string[]; values: string[] }][]) {
    for (const kw of def.headers) {
      for (const h of cleanHeaders) {
        if (h === kw) {
          scores[ind] += 4;
        } else if (h.includes(kw) && kw.length >= 3) {
          scores[ind] += 2.5;
        }
      }
    }
  }

  // Score row values (Weight = 1)
  for (const row of sampleRows) {
    for (const val of Object.values(row)) {
      if (!val) continue;
      const valStr = String(val).toLowerCase().trim();
      for (const [ind, def] of Object.entries(INDUSTRY_KEYWORDS) as [IndustryType, { headers: string[]; values: string[] }][]) {
        for (const kw of def.values) {
          if (valStr.includes(kw)) {
            scores[ind] += 1;
          }
        }
      }
    }
  }

  // Find top score
  let bestIndustry: IndustryType = 'general_business';
  let maxScore = 0;

  for (const [ind, score] of Object.entries(scores) as [IndustryType, number][]) {
    if (ind === 'general_business') continue;
    if (score > maxScore) {
      maxScore = score;
      bestIndustry = ind;
    }
  }

  // Calculate confidence %
  const confidence = maxScore >= 6 ? Math.min(99, Math.round(50 + maxScore * 4)) : 40;

  if (maxScore < 4) {
    bestIndustry = 'general_business';
  }

  return {
    industry: bestIndustry,
    confidence,
    matches: scores,
  };
}

/**
 * Full schema inspection pipeline for any uploaded dataset.
 */
export function inspectDatasetSchema(
  headers: string[],
  rows: Record<string, any>[]
): DatasetSchemaProfile {
  // 1. Profile all columns
  const columns: ColumnProfile[] = headers.map((h) => {
    const colValues = rows.map((r) => r[h]);
    return profileColumn(h, colValues);
  });

  // 2. Check for Helpdesk / Service Desk domain
  const helpdeskDomain = isHelpdeskDomain(headers, rows);
  const helpdeskCols = helpdeskDomain ? detectHelpdeskColumns(headers) : {};

  // 3. Detect Industry
  const detected = detectIndustry(headers, rows);
  const industry: IndustryType = helpdeskDomain ? 'customer_support_ops' : detected.industry;
  const confidence = helpdeskDomain ? 99 : detected.confidence;

  const hasFinancialMetrics = !helpdeskDomain && columns.some((c) => {
    if (c.dataType === 'currency') return true;
    const n = c.normalizedName;
    return /^(sales|revenue|cost|cogs|price|profit|margin|spend|budget|balance|salary|fee|valuation|grossprofit|netsales|netrevenue)$/.test(n);
  });

  if (helpdeskDomain) {
    const totalRecords = rows.length;
    return {
      columns,
      primaryMetric: '',
      primaryMetricLabel: 'Total Tickets',
      secondaryMetric: undefined,
      secondaryMetricLabel: undefined,
      volumeMetric: undefined,
      volumeMetricLabel: undefined,
      primaryCategory: helpdeskCols.resolverCol || 'Resolver Group',
      primaryCategoryLabel: helpdeskCols.resolverCol || 'Resolver Group',
      secondaryCategory: helpdeskCols.siteCol || 'Service Site',
      secondaryCategoryLabel: helpdeskCols.siteCol || 'Service Site',
      channelColumn: helpdeskCols.intakeCol || 'Intake Method',
      channelColumnLabel: helpdeskCols.intakeCol || 'Intake Method',
      dateColumn: helpdeskCols.startCol || 'Logged On',
      dateColumnLabel: helpdeskCols.startCol || 'Logged On',
      identifierColumn: helpdeskCols.idCol || 'Case Ref',
      entityColumn: helpdeskCols.resolverCol || 'Resolver Group',
      statusColumn: helpdeskCols.statusCol || 'Current State',
      detectedIndustry: 'customer_support_ops',
      industryConfidence: 99,
      totalRecords,
      currencyCode: 'USD',
      currencySymbol: '$',
      detectedDomain: 'customer_support_ops',
      hasFinancialMetrics: false,
      grain: 'One support ticket / incident record',
      slaLimitColumn: helpdeskCols.slaLimitCol,
      reopenedColumn: helpdeskCols.reopenedCol,
      ratingColumn: helpdeskCols.ratingCol,
      startDateColumn: helpdeskCols.startCol,
      endDateColumn: helpdeskCols.endCol,
      priorityColumn: helpdeskCols.urgencyCol,
      teamColumn: helpdeskCols.resolverCol,
      intakeColumn: helpdeskCols.intakeCol,
      locationColumn: helpdeskCols.siteCol,
    };
  }

  // 4. Resolve Primary Metric
  // Prefer Currency > Numeric with high sum > largest range
  const currencyCols = columns.filter((c) => c.dataType === 'currency' && c.stats);
  const numericCols = columns.filter((c) => ['numeric', 'currency', 'percentage'].includes(c.dataType) && c.stats);

  // Prefer Net Sales if present, else Gross Sales / Revenue / Salary / Valuation
  let primaryMetricCol = currencyCols.find((c) => {
    const n = c.normalizedName;
    return n.includes('netsales') || n.includes('netrevenue') || n.includes('netamount');
  });

  if (!primaryMetricCol) {
    primaryMetricCol = currencyCols.find((c) => {
      const n = c.normalizedName;
      return n.includes('revenue') || n.includes('total') || n.includes('sales') || n.includes('amount') || n.includes('cost') || n.includes('balance') || n.includes('valuation') || n.includes('salary');
    });
  }

  if (!primaryMetricCol && currencyCols.length > 0) {
    primaryMetricCol = currencyCols[0];
  }

  if (!primaryMetricCol && numericCols.length > 0 && hasFinancialMetrics) {
    primaryMetricCol = numericCols.reduce((prev, curr) => ((curr.stats?.sum || 0) > (prev.stats?.sum || 0) ? curr : prev), numericCols[0]);
  }

  // 5. Resolve Secondary Metric (Profit, Cost, COGS)
  const nonPctNumericCols = columns.filter((c) => {
    if (c.name === primaryMetricCol?.name) return false;
    if (c.dataType === 'percentage') return false;
    if (!c.stats) return false;
    const n = c.normalizedName;
    if (/pct|percent|percentage|rate|margin|ratio/.test(n)) return false;
    return ['numeric', 'currency'].includes(c.dataType);
  });

  let secondaryMetricCol = nonPctNumericCols.find((c) => {
    const n = c.normalizedName;
    return n.includes('profit') || n.includes('grossprofit') || n.includes('netprofit');
  });

  if (!secondaryMetricCol) {
    secondaryMetricCol = nonPctNumericCols.find((c) => {
      const n = c.normalizedName;
      return n.includes('cost') || n.includes('cogs') || n.includes('totalcost');
    });
  }

  if (!secondaryMetricCol) {
    secondaryMetricCol = nonPctNumericCols.find((c) => {
      const n = c.normalizedName;
      return n.includes('gross') || n.includes('discount') || n.includes('bonus') || n.includes('tax');
    });
  }

  if (!secondaryMetricCol && nonPctNumericCols.length > 0 && hasFinancialMetrics) {
    secondaryMetricCol = nonPctNumericCols[0];
  }

  // 6. Resolve Volume Metric (Quantity, Units, Count, Headcount)
  const volumeMetricCol = numericCols.find((c) => {
    if (c.name === primaryMetricCol?.name || c.name === secondaryMetricCol?.name) return false;
    const n = c.normalizedName;
    return n.includes('qty') || n.includes('quantity') || n.includes('units') || n.includes('volume') || n.includes('count') || n.includes('headcount');
  });

  // 7. Resolve Primary Category (categorical with 2-50 distinct values)
  const categoricalCols = columns.filter((c) => c.dataType === 'categorical' && c.distinctCount >= 2);
  let primaryCategoryCol = categoricalCols.find((c) => {
    const n = c.normalizedName;
    return n.includes('category') || n.includes('department') || n.includes('specialty') || n.includes('type') || n.includes('product') || n.includes('segment') || n.includes('class');
  });

  if (!primaryCategoryCol && categoricalCols.length > 0) {
    primaryCategoryCol = categoricalCols[0];
  }

  // 8. Resolve Secondary Category / Filter 1 Dimension (State, Region, Zone, Facility, Location, Hub, Branch)
  const secondaryCategoryCol = categoricalCols.find((c) => {
    if (c.name === primaryCategoryCol?.name) return false;
    const n = c.normalizedName;
    return (
      n.includes('state') ||
      n.includes('region') ||
      n.includes('zone') ||
      n.includes('territory') ||
      n.includes('location') ||
      n.includes('branch') ||
      n.includes('facility') ||
      n.includes('division') ||
      n.includes('hub') ||
      n.includes('site') ||
      n.includes('plant') ||
      n.includes('country') ||
      n.includes('market') ||
      n.includes('ward') ||
      n.includes('city')
    );
  }) || categoricalCols.find((c) => c.name !== primaryCategoryCol?.name);

  // 9. Resolve Channel / Filter 2 Dimension (Channel, City, Zone, Store, Tier, Department, Segment, Mode)
  let channelCol = categoricalCols.find((c) => {
    if (c.name === primaryCategoryCol?.name || c.name === secondaryCategoryCol?.name) return false;
    const n = c.normalizedName;
    return n.includes('channel') || n.includes('saleschannel') || n.includes('distribution');
  });

  if (!channelCol) {
    channelCol = categoricalCols.find((c) => {
      if (c.name === primaryCategoryCol?.name || c.name === secondaryCategoryCol?.name) return false;
      const n = c.normalizedName;
      return (
        n.includes('store') ||
        n.includes('tier') ||
        n.includes('segment') ||
        n.includes('department') ||
        n.includes('mode') ||
        n.includes('route') ||
        n.includes('source')
      );
    });
  }

  if (!channelCol) {
    channelCol = categoricalCols.find((c) => {
      if (c.name === primaryCategoryCol?.name || c.name === secondaryCategoryCol?.name) return false;
      const n = c.normalizedName;
      return (
        n.includes('city') ||
        n.includes('zone') ||
        n.includes('location') ||
        n.includes('branch') ||
        n.includes('status') ||
        n.includes('group') ||
        n.includes('type')
      );
    });
  }

  if (!channelCol) {
    channelCol = categoricalCols.find((c) => c.name !== primaryCategoryCol?.name && c.name !== secondaryCategoryCol?.name);
  }

  // 10. Resolve Date Column
  const dateCol = columns.find((c) => c.dataType === 'date');

  // 11. Resolve Identifier & Entity Column
  const idCol = columns.find((c) => c.dataType === 'identifier');
  const entityCol = 
    columns.find((c) => c.suggestedRole === 'entityName' && !/segment|tier|class|status/i.test(c.normalizedName)) ||
    columns.find((c) => /customer_?id|client_?id|account_?id/i.test(c.normalizedName)) ||
    columns.find((c) => c.suggestedRole === 'entityName') ||
    columns.find((c) => c.dataType === 'text' && c.distinctCount > 5 && !/segment|tier|class|status/i.test(c.normalizedName)) ||
    columns.find((c) => c.dataType === 'categorical' && c.distinctCount > 5 && !/segment|tier|class|status/i.test(c.normalizedName)) ||
    columns.find((c) => c.dataType === 'categorical' && c.distinctCount >= 2);
  const statusCol = columns.find((c) => c.suggestedRole === 'status');

  // 12. Detect Currency
  let detectedCurrencyCode = 'USD';
  let detectedCurrencySymbol = '$';
  const allHeadersStr = headers.join(' ').toLowerCase();
  const sampleStringVals = rows.slice(0, 50).flatMap((r) => Object.values(r)).filter((v) => typeof v === 'string').join(' ');

  if (/(?:^|[_(\s])inr(?:$|[_)\s])|₹/.test(allHeadersStr) || sampleStringVals.includes('₹')) {
    detectedCurrencyCode = 'INR';
    detectedCurrencySymbol = '₹';
  } else if (/(?:^|[_(\s])eur(?:$|[_)\s])|€/.test(allHeadersStr) || sampleStringVals.includes('€')) {
    detectedCurrencyCode = 'EUR';
    detectedCurrencySymbol = '€';
  } else if (/(?:^|[_(\s])gbp(?:$|[_)\s])|£/.test(allHeadersStr) || sampleStringVals.includes('£')) {
    detectedCurrencyCode = 'GBP';
    detectedCurrencySymbol = '£';
  } else if (/(?:^|[_(\s])jpy(?:$|[_)\s])|¥/.test(allHeadersStr) || sampleStringVals.includes('¥')) {
    detectedCurrencyCode = 'JPY';
    detectedCurrencySymbol = '¥';
  } else if (/(?:^|[_(\s])cad(?:$|[_)\s])/.test(allHeadersStr)) {
    detectedCurrencyCode = 'CAD';
    detectedCurrencySymbol = 'CA$';
  } else if (/(?:^|[_(\s])aud(?:$|[_)\s])/.test(allHeadersStr)) {
    detectedCurrencyCode = 'AUD';
    detectedCurrencySymbol = 'A$';
  }

  return {
    columns,
    primaryMetric: primaryMetricCol ? primaryMetricCol.name : '',
    primaryMetricLabel: primaryMetricCol ? primaryMetricCol.name : 'Record count',
    secondaryMetric: secondaryMetricCol?.name,
    secondaryMetricLabel: secondaryMetricCol?.name,
    volumeMetric: volumeMetricCol?.name,
    volumeMetricLabel: volumeMetricCol?.name,
    primaryCategory: primaryCategoryCol ? primaryCategoryCol.name : '',
    primaryCategoryLabel: primaryCategoryCol ? primaryCategoryCol.name : 'No category',
    secondaryCategory: secondaryCategoryCol?.name,
    secondaryCategoryLabel: secondaryCategoryCol?.name,
    channelColumn: channelCol?.name,
    channelColumnLabel: channelCol?.name,
    dateColumn: dateCol?.name,
    dateColumnLabel: dateCol?.name,
    identifierColumn: idCol?.name,
    entityColumn: entityCol?.name,
    statusColumn: statusCol?.name,
    detectedIndustry: industry,
    industryConfidence: confidence,
    totalRecords: rows.length,
    currencyCode: detectedCurrencyCode,
    currencySymbol: detectedCurrencySymbol,
    detectedDomain: hasFinancialMetrics ? 'sales' : 'generic',
    hasFinancialMetrics,
    grain: hasFinancialMetrics ? 'One commercial transaction order' : 'One tabular source record',
  };
}
