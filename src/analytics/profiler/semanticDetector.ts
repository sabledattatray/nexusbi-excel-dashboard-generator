/**
 * Deterministic Semantic Role Detector
 * Authoritative source: PRD v9.0 Phase 9C/9F Universal Semantic Intelligence
 *
 * Implements strict analytical semantic role classification BEFORE metric generation:
 * 1. Explicitly distinguishes physical storage type from analytical semantic type.
 * 2. Recognizes numeric-looking identifiers (phone numbers, postal codes, account IDs, SSNs, etc.).
 * 3. Enforces rule: Identifiers, dates, geographies and unknown numbers CAN NEVER be additive measures.
 * 4. Categorizes every column into explicit analytical roles:
 *    - identifier
 *    - datetime_dimension
 *    - categorical_dimension
 *    - geographic_dimension
 *    - status_dimension
 *    - additive_measure
 *    - non_additive_measure
 *    - semi_additive_measure
 *    - rate_percentage
 *    - unknown
 * 5. Generates count-based metrics when no valid quantitative measure exists.
 */

import { ColumnProfile, DatasetProfile } from './datasetProfiler';

export type AnalyticalSemanticRole =
  | 'identifier'
  | 'datetime_dimension'
  | 'categorical_dimension'
  | 'geographic_dimension'
  | 'status_dimension'
  | 'additive_measure'
  | 'non_additive_measure'
  | 'semi_additive_measure'
  | 'rate_percentage'
  | 'unknown';

export type SemanticRole =
  | 'identifier'
  | 'primary_date'
  | 'secondary_date'
  | 'primary_metric'
  | 'secondary_metric'
  | 'volume_count'
  | 'rate_percentage'
  | 'primary_category'
  | 'secondary_category'
  | 'status_state'
  | 'location_site'
  | 'entity_owner';

export type SemanticAdditivity = 'additive' | 'non_additive' | 'semi_additive';

export interface SemanticRoleAssignment {
  columnName: string;
  role: SemanticRole;
  confidence: number; // 0.0 to 1.0
  rationale: string;
}

export interface DetectedSemanticModel {
  assignments: SemanticRoleAssignment[];
  columnRoles: Record<string, AnalyticalSemanticRole>;
  primaryIdentifier?: string;
  primaryDate?: string;
  secondaryDate?: string;
  primaryMetric?: string;
  secondaryMetric?: string;
  volumeMetric?: string;
  rateMetric?: string;
  primaryDimension?: string;
  secondaryDimension?: string;
  statusColumn?: string;
  locationColumn?: string;
  measureAdditivity: Record<string, SemanticAdditivity>;
  profilingConfidence: number;
  overallConfidence: number;
}

export function isIdentifierColumn(c: ColumnProfile): boolean {
  if (c.dataType === 'identifier') return true;

  const name = c.name.toLowerCase();

  // 1. Explicit identifier patterns (always identifiers regardless of other substrings)
  const isExplicitId = /(^|_)(phone|telephone|mobile|cell|fax|postal|postcode|zip|zipcode|pincode|pin|ssn|ein|tax_id|pan|aadhaar|mrn|national_id|account_no|account_num|account_number|acc_no|invoice_no|invoice_id|invoice_number|bill_no|bill_id|bill_number|claim_no|claim_id|policy_no|policy_id|tracking|tracking_no|tracking_number|serial|serial_no|serial_number|sku|barcode|upc|ean|imei|imsi|iccid|msisdn|sim|cell_id|tower_id|iban|swift|bic|routing_no|sort_code|card_no|card_number|passport|license|dl_no|voter_id|waybill|consignment|container_no|vin|plate_no|rfid|room_no|room_number|bed_no|bed_number|flight_no|flight_number|employee_code|emp_code|customer_code|cust_code|badge_no|badge_number|staff_id|payroll_id|npi|rx_no|rx_number|emp_id|cust_id|patient_id|member_id|doctor_id|user_id|subscriber_id|ip|ip_address|mac|mac_address)($|_)/i.test(name);
  if (isExplicitId) return true;

  // 2. Financial measure check (e.g. gross_bill, net_bill, amount, balance, fee)
  const hasFinancialName = /(price|cost|revenue|sales|salary|fee|amount|balance|cogs|profit|charge|charges|bill|billed|budget|spend|paid|payout|margin|tariff)/i.test(name);
  if (hasFinancialName) {
    // If it ends with explicit ID suffix like _id or _no, it is an identifier, not a financial measure
    if (/(^|_)(id|no|num|number|code|ref)($|_)/i.test(name)) {
      return true;
    }
    return false;
  }

  // 3. Generic identifier header suffix/prefix
  const isGenericIdHeader = /(^|_)(id|code|ref|reference|key|no|num|number)($|_)/i.test(name);
  if (isGenericIdHeader) return true;

  // 4. Numeric phone pattern (10-12 digits in phone range)
  if (c.stats && c.stats.min >= 1e9 && c.stats.max < 1e11) {
    return true;
  }

  // 5. Postal code pattern (5 or 6 digits with postal name hint)
  if (/postal|zip|pin/i.test(name) && c.stats && c.stats.min >= 10000 && c.stats.max <= 999999) {
    return true;
  }

  // 6. Monotonic sequential row index: 1, 2, 3...
  if (c.isUnique && c.cardinalityRatio > 0.98 && /id|record|row|seq|item/i.test(name)) {
    return true;
  }

  return false;
}

export function isYearColumn(c: ColumnProfile): boolean {
  const name = c.name.toLowerCase();
  if (/^(billing_|calendar_|fiscal_|order_|birth_)?(year|yr)$/i.test(name)) return true;
  if (c.stats && c.stats.min >= 1900 && c.stats.max <= 2100 && (c.stats.max - c.stats.min) < 150) {
    if (/year|yr|born|founded/i.test(name) || c.dataType === 'integer') {
      return /year|yr|born|founded/i.test(name);
    }
  }
  return false;
}

export function classifyColumnAnalyticalRole(
  c: ColumnProfile,
  allColumns: ColumnProfile[]
): { role: AnalyticalSemanticRole; confidence: number; rationale: string } {
  const name = c.name.toLowerCase();

  // 1. Identifiers (Strict check before any measure evaluation)
  if (isIdentifierColumn(c)) {
    return {
      role: 'identifier',
      confidence: 0.98,
      rationale: 'Identifier attribute: discrete entity reference, code, or phone/postal number',
    };
  }

  // 2. Year / Datetime Dimensions
  if (c.dataType === 'datetime' || isYearColumn(c)) {
    return {
      role: 'datetime_dimension',
      confidence: 0.95,
      rationale: isYearColumn(c) ? 'Calendar year temporal dimension' : 'Timestamp/date temporal dimension',
    };
  }

  // 3. Percentages & Rates
  if (c.dataType === 'percentage' || /(pct|percent|ratio|rate|margin)\b/i.test(name)) {
    return {
      role: 'rate_percentage',
      confidence: 0.92,
      rationale: 'Percentage/ratio metric',
    };
  }

  // 4. Geographic Dimensions
  const hasOtherGeo = allColumns.some(
    (col) => col.name !== c.name && /(city|country|zip|postal|address|latitude|longitude)/i.test(col.name)
  );
  const isGeoHeader = /(city|country|region|province|county|zip|postal|zone|site|branch|location|address)\b/i.test(name) ||
    (/^state$/i.test(name) && hasOtherGeo);

  if (isGeoHeader) {
    return {
      role: 'geographic_dimension',
      confidence: 0.9,
      rationale: 'Geographic or facility location attribute',
    };
  }

  // 5. Workflow Status / Lifecycle State
  if (
    /(^|_)(status|stage|disposition|phase|outcome|condition)($|_)/i.test(name) &&
    c.distinctCount >= 2 &&
    c.distinctCount <= 15
  ) {
    return {
      role: 'status_dimension',
      confidence: 0.95,
      rationale: `Workflow/lifecycle state column with ${c.distinctCount} distinct stages`,
    };
  }

  // 6. Non-Additive Measures (Ages, Ratings, Scores, Durations)
  const isNonAdditiveName = /(age|gpa|score|grade|rating|csat|nps|rank|index|multiplier|temperature|temp|days_overdue|duration_days|lead_time_days|wait_time|length_of_stay|stay_days)\b/i.test(name);
  if (isNonAdditiveName && ['integer', 'float', 'currency'].includes(c.dataType)) {
    return {
      role: 'non_additive_measure',
      confidence: 0.9,
      rationale: 'Non-additive quantitative metric (average/median only; summation prohibited)',
    };
  }

  // 7. Semi-Additive Measures (Balances, Headcount, Inventory Levels)
  const isSemiAdditiveName = /(principal_balance|balance|outstanding_balance|account_balance|stock_on_hand|inventory_level|headcount|head_count|capacity|occupancy)\b/i.test(name);
  if (isSemiAdditiveName && ['integer', 'float', 'currency'].includes(c.dataType)) {
    return {
      role: 'semi_additive_measure',
      confidence: 0.9,
      rationale: 'Semi-additive balance snapshot',
    };
  }

  // 8. Additive Measures (Financial & Volumetric)
  const isFinancial = c.dataType === 'currency' || /(sales|revenue|cost|expense|profit|amount|bonus|salary|spend|paid|payment|payout|bill|billed|billing|charge|charges|fee|tariff|budget|gross|net|responsibility)\b/i.test(name);
  const isVolumetric = /(quantity|qty|units|volume|hours|produced|impressions|clicks|tickets)\b/i.test(name);

  if ((isFinancial || isVolumetric) && ['currency', 'float', 'integer'].includes(c.dataType)) {
    return {
      role: 'additive_measure',
      confidence: isFinancial ? 0.96 : 0.88,
      rationale: isFinancial ? 'Continuous additive financial measure' : 'Discrete additive volumetric measure',
    };
  }

  // 9. Categorical Dimension
  if ((c.dataType === 'text' || c.dataType === 'boolean') && c.distinctCount >= 2) {
    return {
      role: 'categorical_dimension',
      confidence: 0.85,
      rationale: `Categorical dimension with ${c.distinctCount} distinct values`,
    };
  }

  // 10. Unknown
  return {
    role: 'unknown',
    confidence: 0.5,
    rationale: 'Unclassified column without explicit measure or dimension keywords',
  };
}

export function detectColumnAdditivity(c: ColumnProfile): SemanticAdditivity {
  const name = c.name.toLowerCase();

  // 1. Non-additive:
  // - Identifiers, phone numbers, postal codes, years
  if (isIdentifierColumn(c) || isYearColumn(c)) return 'non_additive';
  if (c.dataType === 'percentage') return 'non_additive';
  if (/(gpa|score|grade|rating|csat|nps|rank|index|ratio|rate|pct|percent|attendance)/i.test(name)) return 'non_additive';
  if (/(age|temp|temperature|multiplier|unit_cost|unit_price|item_cost|price_per|fx_rate|interest)/i.test(name)) return 'non_additive';
  if (/(days_overdue|duration_days|lead_time_days|wait_time|length_of_stay|stay_days)/i.test(name)) return 'non_additive';

  // 2. Semi-additive:
  // - State snapshots & balances at a point in time
  if (/(principal_balance|balance|outstanding_balance|account_balance|stock_on_hand|inventory_level|headcount|head_count|capacity|occupancy)/i.test(name)) {
    return 'semi_additive';
  }

  // 3. Additive:
  // - Cumulative transactions, flow quantities, expenses, revenue, sales, hours, batch totals
  if (/(sales|revenue|cost|expense|profit|amount|bonus|salary|spend|paid|payment|payout|bill|billed|billing|charge|charges|fee|tariff|budget|units|qty|quantity|count|impressions|clicks|produced|tickets|hours)/i.test(name)) {
    return 'additive';
  }

  // Pure floats with low variance or fractional values under 10.0 (like GPA, small ratings) are non-additive
  if (c.dataType === 'float' && c.stats && c.stats.max <= 10.0 && c.stats.min >= 0) {
    return 'non_additive';
  }

  return 'additive';
}

function getMeasurePriorityScore(c: ColumnProfile, role: AnalyticalSemanticRole): number {
  const name = c.name.toLowerCase();

  // Primary business measures: Net bill, Gross bill, Total Sales, Revenue, Total Paid
  if (/(^|_)(net_bill|gross_bill|sales|revenue|total_paid|net_sales|gross_sales)($|_)/i.test(name)) {
    return 120;
  }
  // Secondary financial measures: Balance, Cost, Charges, Amount, Spend, Fee
  if (/(^|_)(outstanding_balance|balance|cost|profit|charges?|fees?|amount|spend|paid)($|_)/i.test(name)) {
    return 90;
  }
  // Generic currency
  if (c.dataType === 'currency') {
    return 80;
  }
  // Volumetric: Quantity, Units, Hours, Volume
  if (/(^|_)(quantity|qty|units|volume|hours|headcount)($|_)/i.test(name)) {
    return 60;
  }
  // Continuous float
  if (c.dataType === 'float' && role === 'additive_measure') {
    return 40;
  }
  // Non-additive rating / score
  if (role === 'non_additive_measure' && /(score|rating|csat|gpa)/i.test(name)) {
    return 20;
  }
  return 0;
}

export function detectSemanticRoles(profile: DatasetProfile): DetectedSemanticModel {
  const assignments: SemanticRoleAssignment[] = [];
  const assignedCols = new Set<string>();
  const columnRoles: Record<string, AnalyticalSemanticRole> = {};

  // Step 1: Strict Analytical Role Classification for EVERY column
  for (const c of profile.columns) {
    const classification = classifyColumnAnalyticalRole(c, profile.columns);
    columnRoles[c.name] = classification.role;
  }

  // 1. Detect Primary Identifier
  const idCandidates = profile.columns
    .filter((c) => columnRoles[c.name] === 'identifier')
    .sort((a, b) => {
      const aIsIdName = /(^|_)(id|key|code|ref|number)($|_)/i.test(a.name) ? 2 : 0;
      const bIsIdName = /(^|_)(id|key|code|ref|number)($|_)/i.test(b.name) ? 2 : 0;
      const aScore = (a.isUnique ? 1 : 0) + a.cardinalityRatio + aIsIdName;
      const bScore = (b.isUnique ? 1 : 0) + b.cardinalityRatio + bIsIdName;
      return bScore - aScore;
    });

  let primaryIdentifier: string | undefined;
  if (idCandidates.length > 0) {
    primaryIdentifier = idCandidates[0].name;
    assignedCols.add(primaryIdentifier);
    assignments.push({
      columnName: primaryIdentifier,
      role: 'identifier',
      confidence: Math.min(0.99, idCandidates[0].cardinalityRatio * 0.8 + 0.19),
      rationale: `Unique values with cardinality ratio ${idCandidates[0].cardinalityRatio.toFixed(3)}`,
    });
  }

  // 2. Detect Dates (Primary & Secondary)
  // Operational event dates strictly prioritized over demographic dates
  const dateCandidates = profile.columns
    .filter((c) => columnRoles[c.name] === 'datetime_dimension')
    .sort((a, b) => {
      const aIsDemographic = /birth|dob|born/i.test(a.name) ? -100 : 0;
      const bIsDemographic = /birth|dob|born/i.test(b.name) ? -100 : 0;
      const aIsOperational = /created|logged|opened|start|order|admission|invoice|billing|transaction|event|reg/i.test(a.name) ? 50 : 0;
      const bIsOperational = /created|logged|opened|start|order|admission|invoice|billing|transaction|event|reg/i.test(b.name) ? 50 : 0;
      const aCoverage = 1 - a.nullRate;
      const bCoverage = 1 - b.nullRate;
      return (bIsOperational + bIsDemographic + bCoverage) - (aIsOperational + aIsDemographic + aCoverage);
    });

  let primaryDate: string | undefined;
  let secondaryDate: string | undefined;

  if (dateCandidates.length > 0) {
    primaryDate = dateCandidates[0].name;
    assignedCols.add(primaryDate);
    assignments.push({
      columnName: primaryDate,
      role: 'primary_date',
      confidence: Math.min(0.99, (1 - dateCandidates[0].nullRate) * 0.8 + 0.19),
      rationale: `Primary operational event date with ${(100 * (1 - dateCandidates[0].nullRate)).toFixed(1)}% coverage`,
    });

    const secondaryCandidates = dateCandidates.filter(c => c.name !== primaryDate && !/birth|dob|born/i.test(c.name));
    if (secondaryCandidates.length > 0) {
      secondaryDate = secondaryCandidates[0].name;
      assignedCols.add(secondaryDate);
      assignments.push({
        columnName: secondaryDate,
        role: 'secondary_date',
        confidence: 0.85,
        rationale: 'Secondary operational event or lifecycle boundary date',
      });
    }
  }

  // 3. Detect Status / State
  const statusCandidates = profile.columns
    .filter((c) => columnRoles[c.name] === 'status_dimension')
    .sort((a, b) => {
      const aScore = /payment_status|claim_status|status/i.test(a.name) ? 10 : 0;
      const bScore = /payment_status|claim_status|status/i.test(b.name) ? 10 : 0;
      return bScore - aScore;
    });

  let statusColumn: string | undefined;
  if (statusCandidates.length > 0) {
    statusColumn = statusCandidates[0].name;
    assignedCols.add(statusColumn);
    assignments.push({
      columnName: statusColumn,
      role: 'status_state',
      confidence: 0.95,
      rationale: `Discrete lifecycle state column with ${statusCandidates[0].distinctCount} distinct values`,
    });
  }

  // 4. Detect Location / Geographic Dimension
  const locationCandidates = profile.columns
    .filter((c) => columnRoles[c.name] === 'geographic_dimension')
    .sort((a, b) => {
      const aScore = /city|state|region|branch|site/i.test(a.name) ? 10 : 0;
      const bScore = /city|state|region|branch|site/i.test(b.name) ? 10 : 0;
      return bScore - aScore;
    });

  let locationColumn: string | undefined;
  if (locationCandidates.length > 0) {
    locationColumn = locationCandidates[0].name;
    assignedCols.add(locationColumn);
    assignments.push({
      columnName: locationColumn,
      role: 'location_site',
      confidence: 0.9,
      rationale: 'Geographic facility or location dimension',
    });
  }

  // 5. Detect Numeric Measures (Strictly from verified additive/semi-additive measures)
  // MANDATORY REQUIREMENT: Identifiers, Years, Postal Codes, Phone numbers, and Unknown numbers CAN NEVER BE MEASURES!
  const validMeasureCandidates = profile.columns.filter((c) => {
    const role = columnRoles[c.name];
    if (role === 'identifier' || role === 'datetime_dimension' || role === 'geographic_dimension' || role === 'unknown') {
      return false;
    }
    return role === 'additive_measure' || role === 'semi_additive_measure' || role === 'non_additive_measure';
  });

  validMeasureCandidates.sort((a, b) => {
    return getMeasurePriorityScore(b, columnRoles[b.name]) - getMeasurePriorityScore(a, columnRoles[a.name]);
  });

  let primaryMetric: string | undefined;
  let secondaryMetric: string | undefined;

  if (validMeasureCandidates.length > 0 && getMeasurePriorityScore(validMeasureCandidates[0], columnRoles[validMeasureCandidates[0].name]) > 0) {
    primaryMetric = validMeasureCandidates[0].name;
    assignedCols.add(primaryMetric);
    assignments.push({
      columnName: primaryMetric,
      role: 'primary_metric',
      confidence: 0.95,
      rationale: `Primary continuous quantitative measure (${columnRoles[primaryMetric]})`,
    });

    if (validMeasureCandidates.length > 1 && getMeasurePriorityScore(validMeasureCandidates[1], columnRoles[validMeasureCandidates[1].name]) > 0) {
      secondaryMetric = validMeasureCandidates[1].name;
      assignedCols.add(secondaryMetric);
      assignments.push({
        columnName: secondaryMetric,
        role: 'secondary_metric',
        confidence: 0.88,
        rationale: `Secondary quantitative measure (${columnRoles[secondaryMetric]})`,
      });
    }
  }

  // 6. Detect Volume and Rate Metrics
  const volumeCandidate = profile.columns.find((c) => {
    const role = columnRoles[c.name];
    const isVolumetric = /(quantity|qty|units|volume|hours|tickets|records|headcount)/i.test(c.name) ||
      (/(^|_)count($|_)/i.test(c.name) && !/discount/i.test(c.name));
    return !assignedCols.has(c.name) && role === 'additive_measure' && isVolumetric;
  });
  let volumeMetric: string | undefined;
  if (volumeCandidate) {
    volumeMetric = volumeCandidate.name;
    assignedCols.add(volumeMetric);
    assignments.push({
      columnName: volumeMetric,
      role: 'volume_count',
      confidence: 0.8,
      rationale: 'Discrete volumetric quantity count',
    });
  }

  const rateCandidate = profile.columns.find((c) => !assignedCols.has(c.name) && columnRoles[c.name] === 'rate_percentage');
  let rateMetric: string | undefined;
  if (rateCandidate) {
    rateMetric = rateCandidate.name;
    assignedCols.add(rateMetric);
    assignments.push({
      columnName: rateMetric,
      role: 'rate_percentage',
      confidence: 0.9,
      rationale: 'Percentage/Ratio numeric measure',
    });
  }

  // 7. Detect Categorical Dimensions (Primary & Secondary)
  const categoryCandidates = profile.columns
    .filter((c) => {
      const role = columnRoles[c.name];
      return (
        !assignedCols.has(c.name) &&
        (role === 'categorical_dimension' || (c.dataType === 'text' && role !== 'identifier' && role !== 'geographic_dimension')) &&
        c.distinctCount >= 2 &&
        c.distinctCount <= Math.max(50, profile.totalRows * 0.3)
      );
    })
    .sort((a, b) => {
      const aBusiness = /dept|department|category|type|segment|channel|diagnosis|procedure|specialty/i.test(a.name) ? 20 : 0;
      const bBusiness = /dept|department|category|type|segment|channel|diagnosis|procedure|specialty/i.test(b.name) ? 20 : 0;
      const aIdeal = a.distinctCount >= 3 && a.distinctCount <= 20 ? 10 : 0;
      const bIdeal = b.distinctCount >= 3 && b.distinctCount <= 20 ? 10 : 0;
      return (bBusiness + bIdeal) - (aBusiness + aIdeal);
    });

  let primaryDimension: string | undefined;
  let secondaryDimension: string | undefined;

  if (categoryCandidates.length > 0) {
    primaryDimension = categoryCandidates[0].name;
    assignedCols.add(primaryDimension);
    assignments.push({
      columnName: primaryDimension,
      role: 'primary_category',
      confidence: 0.88,
      rationale: `Categorical dimension with ${categoryCandidates[0].distinctCount} balanced groups`,
    });

    if (categoryCandidates.length > 1) {
      secondaryDimension = categoryCandidates[1].name;
      assignedCols.add(secondaryDimension);
      assignments.push({
        columnName: secondaryDimension,
        role: 'secondary_category',
        confidence: 0.78,
        rationale: `Secondary categorical grouping with ${categoryCandidates[1].distinctCount} groups`,
      });
    }
  }

  const confidenceSum = assignments.reduce((acc, a) => acc + a.confidence, 0);
  const overallConfidence = assignments.length > 0 ? confidenceSum / assignments.length : 0.5;

  const measureAdditivity: Record<string, SemanticAdditivity> = {};
  for (const c of profile.columns) {
    measureAdditivity[c.name] = detectColumnAdditivity(c);
  }

  return {
    assignments,
    columnRoles,
    primaryIdentifier,
    primaryDate,
    secondaryDate,
    primaryMetric,
    secondaryMetric,
    volumeMetric,
    rateMetric,
    primaryDimension,
    secondaryDimension,
    statusColumn,
    locationColumn,
    measureAdditivity,
    profilingConfidence: overallConfidence,
    overallConfidence,
  };
}
