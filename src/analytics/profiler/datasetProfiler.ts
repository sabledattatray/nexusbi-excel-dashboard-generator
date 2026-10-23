/**
 * Generic Dataset Profiler
 * Authoritative source: PRD v9.0 Phase 9C Mandatory Requirement 1 & 4
 *
 * Inspects arbitrary tabular datasets across any industry without hardcoding.
 * Infers physical types, distributions, cardinalities, null rates, and metrics.
 */

import { validateDatasetBoundary } from '../security/securityHardener';

export type PhysicalDataType =
  | 'identifier'
  | 'integer'
  | 'float'
  | 'currency'
  | 'percentage'
  | 'datetime'
  | 'boolean'
  | 'text';

export interface ColumnProfile {
  name: string;
  dataType: PhysicalDataType;
  totalCount: number;
  nonNullCount: number;
  nullCount: number;
  nullRate: number; // 0.0 to 1.0
  distinctCount: number;
  cardinalityRatio: number; // distinctCount / nonNullCount
  isUnique: boolean;
  currencySymbol?: string;
  stats?: {
    min: number;
    max: number;
    sum: number;
    mean: number;
  };
  dateRange?: {
    min: Date;
    max: Date;
    spanDays: number;
  };
  sampleValues: any[];
}

export interface DatasetProfile {
  totalRows: number;
  totalColumns: number;
  columns: ColumnProfile[];
  columnMap: Map<string, ColumnProfile>;
  completeRowsCount: number;
  completenessRate: number; // % of rows with 0 nulls
  duplicateRowsCount: number;
  hasTemporal: boolean;
  hasFinancial: boolean;
  hasNumericMeasures: boolean;
  hasCategories: boolean;
  primaryDateColumn?: string;
  primaryIdentifierColumn?: string;
}

const CURRENCY_REGEX = /^[\s]*([$€£₹¥]|INR|USD|EUR|GBP|AUD|CAD)?[\s]*[-+]?[\d,]+(\.\d+)?[\s]*([$€£₹¥]|INR|USD|EUR|GBP|AUD|CAD)?[\s]*$/i;
const PERCENT_REGEX = /^[\s]*[-+]?[\d,]+(\.\d+)?[\s]*%[\s]*$/;
const DATE_DMY_REGEX = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
const DATE_YMD_REGEX = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;
const MONTH_TEXT_DATE_REGEX = /^(?:\d{1,2}[-\s]+[A-Za-z]{3,9}[-\s]+\d{2,4}|[A-Za-z]{3,9}[-\s]+\d{1,2},?[-\s]+\d{2,4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/;

function parseDateRobust(val: any): Date | null {
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (!val || typeof val === 'number') return null; // avoid treating pure numbers as epoch dates
  const s = String(val).trim();
  if (s.length < 8) return null;

  const dmy = s.match(DATE_DMY_REGEX);
  if (dmy) {
    const [, dy, mo, yr, hr, mn, sc] = dmy;
    const d = new Date(Date.UTC(+yr, +mo - 1, +dy, hr ? +hr : 0, mn ? +mn : 0, sc ? +sc : 0));
    return isNaN(d.getTime()) ? null : d;
  }

  const ymd = s.match(DATE_YMD_REGEX);
  if (ymd) {
    const [, yr, mo, dy, hr, mn, sc] = ymd;
    const d = new Date(Date.UTC(+yr, +mo - 1, +dy, hr ? +hr : 0, mn ? +mn : 0, sc ? +sc : 0));
    return isNaN(d.getTime()) ? null : d;
  }

  if (ISO_DATE_REGEX.test(s) || MONTH_TEXT_DATE_REGEX.test(s)) {
    const parsed = new Date(s);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

export function profileColumn(name: string, rawValues: any[]): ColumnProfile {
  const totalCount = rawValues.length;
  const nonNullValues = rawValues.filter((v) => v !== null && v !== undefined && String(v).trim() !== '');
  const nonNullCount = nonNullValues.length;
  const nullCount = totalCount - nonNullCount;
  const nullRate = totalCount > 0 ? nullCount / totalCount : 0;

  const distinctSet = new Set(nonNullValues.map(String));
  const distinctCount = distinctSet.size;
  const cardinalityRatio = nonNullCount > 0 ? distinctCount / nonNullCount : 0;
  const isUnique = nonNullCount > 0 && distinctCount === nonNullCount;

  // Samples
  const sampleValues = Array.from(distinctSet).slice(0, 5);

  // Type inference based on actual value contents
  let boolMatches = 0;
  let currencyMatches = 0;
  let percentMatches = 0;
  let dateMatches = 0;
  let intMatches = 0;
  let floatMatches = 0;
  let detectedCurrencySymbol = '$';

  const dates: Date[] = [];
  const numbers: number[] = [];

  for (const v of nonNullValues) {
    const s = String(v).trim();

    // 1. Boolean check
    if (/^(true|false|yes|no|y|n)$/i.test(s)) {
      boolMatches++;
      continue;
    }

    // 2. Percentage check
    if (PERCENT_REGEX.test(s)) {
      percentMatches++;
      const num = parseFloat(s.replace(/[%,\s]/g, ''));
      if (Number.isFinite(num)) numbers.push(num);
      continue;
    }

    // 3. Currency check
    if (CURRENCY_REGEX.test(s) && (/[€£₹¥$]|INR|USD|EUR|GBP/i.test(s) || /price|cost|revenue|sales|salary|fee|amount|balance/i.test(name))) {
      currencyMatches++;
      const symbolMatch = s.match(/([€£₹¥$]|INR|USD|EUR|GBP)/i);
      if (symbolMatch) detectedCurrencySymbol = symbolMatch[1];
      const num = parseFloat(s.replace(/[^0-9.-]/g, ''));
      if (Number.isFinite(num)) numbers.push(num);
      continue;
    }

    // 4. Date check
    const dt = parseDateRobust(s);
    if (dt) {
      dateMatches++;
      dates.push(dt);
      continue;
    }

    // 5. Pure Number check
    if (typeof v === 'number' || (!isNaN(Number(s)) && s !== '')) {
      const num = Number(s);
      if (Number.isFinite(num)) {
        numbers.push(num);
        if (Number.isInteger(num)) {
          intMatches++;
        } else {
          floatMatches++;
        }
        continue;
      }
    }
  }

  // Check column header for currency indicator if not found in cell values
  let headerCurrencySymbol: string | null = null;
  if (/_inr\b|\(inr\)|₹/i.test(name)) headerCurrencySymbol = '₹';
  else if (/_eur\b|\(eur\)|€/i.test(name)) headerCurrencySymbol = '€';
  else if (/_gbp\b|\(gbp\)|£/i.test(name)) headerCurrencySymbol = '£';
  else if (/_jpy\b|\(jpy\)|¥/i.test(name)) headerCurrencySymbol = '¥';
  else if (/_usd\b|\(usd\)|\$/i.test(name)) headerCurrencySymbol = '$';

  if (headerCurrencySymbol) {
    detectedCurrencySymbol = headerCurrencySymbol;
  }

  // Determine physical data type by majority vote
  let dataType: PhysicalDataType = 'text';
  const matchThreshold = nonNullCount * 0.7;

  const hasFinancialName = /price|cost|revenue|sales|salary|fee|amount|balance|cogs|profit|charge|charges|bill|billed|budget|spend|paid|payout|margin|tariff/i.test(name) || headerCurrencySymbol !== null;

  const isExplicitIdentifierHeader = /(^|_)(phone|telephone|mobile|cell|fax|postal|postcode|zip|zipcode|pincode|pin|ssn|ein|tax_id|pan|aadhaar|mrn|national_id|account|acct|acc_no|account_no|invoice|bill_no|bill_id|claim|policy|tracking|serial|sku|barcode|upc|ean|imei|imsi|iccid|msisdn|sim|cell_id|tower_id|iban|swift|bic|routing_no|sort_code|card_no|card_number|passport|license|dl_no|voter_id|waybill|consignment|container_no|vin|plate_no|rfid|room_no|room_number|bed_no|bed_number|flight_no|flight_number|employee_code|emp_code|customer_code|cust_code|badge_no|badge_number|staff_id|payroll_id|npi|rx_no|rx_number|emp_id|cust_id|patient_id|member_id|doctor_id|user_id|subscriber_id|ip|ip_address|mac|mac_address|id|code|ref|key|no|num|number)($|_)/i.test(name) && (!hasFinancialName || /(^|_)(id|no|num|number|code|ref)($|_)/i.test(name));

  // Check for 10-digit phone number values (e.g. 9091050873) or postal codes
  const hasPhonePattern = numbers.length > 0 && numbers.filter(n => n >= 1e9 && n < 1e11).length >= numbers.length * 0.7;
  const hasPostalPattern = numbers.length > 0 && /postal|postcode|zip|pin/i.test(name) && numbers.filter(n => (n >= 10000 && n <= 99999) || (n >= 100000 && n <= 999999)).length >= numbers.length * 0.7;

  // Check for Year columns (e.g. 2024, 2025)
  const isYearColumn = /^(billing_|calendar_|fiscal_|order_|birth_)?(year|yr)$/i.test(name) || (numbers.length > 0 && intMatches >= matchThreshold && numbers.every(n => n >= 1900 && n <= 2100));

  if (boolMatches >= matchThreshold) {
    dataType = 'boolean';
  } else if (dateMatches >= matchThreshold || isYearColumn) {
    dataType = 'datetime';
  } else if (percentMatches >= matchThreshold || (name.toLowerCase().includes('pct') && (intMatches + floatMatches) >= matchThreshold)) {
    dataType = 'percentage';
  } else if (currencyMatches >= matchThreshold || (hasFinancialName && (intMatches + floatMatches) >= matchThreshold)) {
    dataType = 'currency';
  } else if (isExplicitIdentifierHeader || hasPhonePattern || hasPostalPattern) {
    dataType = 'identifier';
  } else if ((intMatches + floatMatches) >= matchThreshold) {
    // Distinguish integer identifiers (e.g. ID, Ref, Code) from measures
    if (intMatches >= matchThreshold && isUnique && cardinalityRatio > 0.9 && /id|code|ref|key|no|num/i.test(name)) {
      dataType = 'identifier';
    } else if (floatMatches > 0) {
      dataType = 'float';
    } else {
      dataType = 'integer';
    }
  } else if ((isUnique && cardinalityRatio > 0.95 && nonNullCount > 10) || isExplicitIdentifierHeader) {
    dataType = 'identifier';
  } else {
    dataType = 'text';
  }

  // Compute numeric statistics if applicable
  let stats: { min: number; max: number; sum: number; mean: number } | undefined;
  if (numbers.length > 0 && ['integer', 'float', 'currency', 'percentage'].includes(dataType)) {
    let min = numbers[0];
    let max = numbers[0];
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) {
      const n = numbers[i];
      if (n < min) min = n;
      if (n > max) max = n;
      sum += n;
    }
    const mean = sum / numbers.length;
    stats = { min, max, sum, mean };
  }

  // Compute date range if applicable
  let dateRange: { min: Date; max: Date; spanDays: number } | undefined;
  if (dates.length > 0 && dataType === 'datetime') {
    let minTime = dates[0].getTime();
    let maxTime = dates[0].getTime();
    for (let i = 1; i < dates.length; i++) {
      const t = dates[i].getTime();
      if (t < minTime) minTime = t;
      if (t > maxTime) maxTime = t;
    }
    const min = new Date(minTime);
    const max = new Date(maxTime);
    const spanDays = Math.max(1, Math.round((maxTime - minTime) / (1000 * 3600 * 24)));
    dateRange = { min, max, spanDays };
  }

  return {
    name,
    dataType,
    totalCount,
    nonNullCount,
    nullCount,
    nullRate,
    distinctCount,
    cardinalityRatio,
    isUnique,
    currencySymbol: dataType === 'currency' ? detectedCurrencySymbol : undefined,
    stats,
    dateRange,
    sampleValues,
  };
}

export function profileDataset(headers: string[], rows: Record<string, any>[]): DatasetProfile {
  validateDatasetBoundary(0, rows.length, headers.length);

  const totalRows = rows.length;
  const totalColumns = headers.length;
  const columns: ColumnProfile[] = [];
  const columnMap = new Map<string, ColumnProfile>();

  for (const h of headers) {
    const values = rows.map((r) => r[h]);
    const prof = profileColumn(h, values);
    columns.push(prof);
    columnMap.set(h, prof);
  }

  // Completeness score: rows where no column is null
  let completeRowsCount = 0;
  const rowSignatures = new Set<string>();
  let duplicateRowsCount = 0;

  for (const r of rows) {
    let hasNull = false;
    const sigParts: string[] = [];
    for (const h of headers) {
      const v = r[h];
      if (v === null || v === undefined || String(v).trim() === '') {
        hasNull = true;
      }
      sigParts.push(String(v ?? ''));
    }
    if (!hasNull) completeRowsCount++;

    const sig = sigParts.join('|||');
    if (rowSignatures.has(sig)) {
      duplicateRowsCount++;
    } else {
      rowSignatures.add(sig);
    }
  }

  const completenessRate = totalRows > 0 ? completeRowsCount / totalRows : 0;

  // Global capabilities flags
  const hasTemporal = columns.some((c) => c.dataType === 'datetime');
  const hasFinancial = columns.some((c) => c.dataType === 'currency');
  const hasNumericMeasures = columns.some((c) => ['float', 'integer', 'currency'].includes(c.dataType));
  const hasCategories = columns.some(
    (c) => c.dataType === 'text' && c.cardinalityRatio < 0.3 && c.distinctCount > 1
  );

  const primaryDateColumn = columns.find((c) => c.dataType === 'datetime')?.name;
  const primaryIdentifierColumn = columns.find((c) => c.dataType === 'identifier')?.name;

  return {
    totalRows,
    totalColumns,
    columns,
    columnMap,
    completeRowsCount,
    completenessRate,
    duplicateRowsCount,
    hasTemporal,
    hasFinancial,
    hasNumericMeasures,
    hasCategories,
    primaryDateColumn,
    primaryIdentifierColumn,
  };
}
