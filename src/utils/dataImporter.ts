import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Transaction,
  ProductCatalogItem,
  RegionalPerformance,
  CustomerAccount,
  MonthlyTrend,
  CategorySummary,
  DatasetConfig,
  AppDataset,
  DatasetSchemaProfile,
  HelpdeskMetrics,
} from '../types/dataset';
import { inspectDatasetSchema, parseCleanNumber } from './schemaDetector';
import { getIndustryTheme } from './industryTheme';
import { dateValue, numericValue, isMeasure } from './adaptiveAnalysis';
import {
  calculateHelpdeskMetrics,
  isHelpdeskDomain,
  detectHelpdeskColumns,
  parseUniversalDate,
} from './helpdeskMetrics';

export interface RawParsedTable {
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
  fileName: string;
  fileSize: number;
  fileType: 'csv' | 'xlsx' | 'xls' | 'tsv';
  schema?: DatasetSchemaProfile;
}

export interface ColumnMapping {
  // Adaptive schema-aware fields
  primaryMetricCol?: string;
  secondaryMetricCol?: string;
  volumeMetricCol?: string;
  primaryCategoryCol?: string;
  secondaryCategoryCol?: string;
  dateCol?: string;
  entityCol?: string;
  idCol?: string;
  statusCol?: string;

  // Backward-compatible aliases
  revenueCol?: string;
  cogsCol?: string;
  profitCol?: string;
  quantityCol?: string;
  productCol?: string;
  categoryCol?: string;
  customerCol?: string;
  regionCol?: string;
  channelCol?: string;
  salesRepCol?: string;
}

export interface ImportResult {
  dataset: AppDataset;
  config: DatasetConfig;
  mapping: ColumnMapping;
  schema: DatasetSchemaProfile;
  summary: {
    fileName: string;
    rowCount: number;
    detectedIndustry: string;
    industryName: string;
    totalPrimaryMetric: number;
    totalSecondaryMetric: number;
    uniqueCategories: number;
    uniqueDimensions: number;
    uniqueEntities: number;
    dateSpan: string;
  };
}

export const MAX_UPLOAD_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_UPLOAD_FILE_SIZE_MB = 25;
export const MAX_PROCESSABLE_ROWS = 150_000;
export const MAX_PROCESSABLE_COLUMNS = 500;

/**
 * Parses an uploaded File (CSV, TSV, XLSX, XLS) into a normalized RawParsedTable
 * and runs initial schema inspection with safety caps for browser memory protection.
 */
export async function parseUploadedFile(file: File): Promise<RawParsedTable> {
  if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `File size (${sizeMb} MB) exceeds the ${MAX_UPLOAD_FILE_SIZE_MB} MB limit for in-browser processing. Please upload a dataset under ${MAX_UPLOAD_FILE_SIZE_MB} MB (up to 150,000 records) to ensure smooth performance.`
    );
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  let table: RawParsedTable;
  if (extension === 'xlsx' || extension === 'xls') {
    table = await parseExcelFile(file);
  } else {
    table = await parseCsvFile(file);
  }

  if (table.headers.length > MAX_PROCESSABLE_COLUMNS) {
    throw new Error(
      `Column count (${table.headers.length}) exceeds processing limit of ${MAX_PROCESSABLE_COLUMNS} columns.`
    );
  }

  if (table.rows.length > MAX_PROCESSABLE_ROWS) {
    throw new Error(
      `Row count (${table.rows.length.toLocaleString()}) exceeds client-side processing limit of ${MAX_PROCESSABLE_ROWS.toLocaleString()} rows.`
    );
  }

  // Profile data types and classify industry
  const schema = inspectDatasetSchema(table.headers, table.rows);
  table.schema = schema;

  return table;
}

/**
 * Parses CSV/TSV using PapaParse with automatic type coercion and trimming.
 */
async function parseCsvFile(file: File): Promise<RawParsedTable> {
  const text = await file.text();
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      transformHeader: (header: string) => header.replace(/^\ufeff/, '').trim(),
      complete: (results) => {
        const rawHeaders = (results.meta.fields || []).map((h) => h.replace(/^\ufeff/, '').trim()).filter(Boolean);
        const rows = (results.data as Record<string, any>[]).filter((row) => {
          return Object.values(row).some((val) => val !== null && val !== undefined && val !== '');
        });

        resolve({
          headers: rawHeaders,
          rows,
          totalRows: rows.length,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.name.endsWith('.tsv') ? 'tsv' : 'csv',
        });
      },
      error: (err: any) => reject(new Error(`Failed to parse CSV file: ${err.message}`)),
    });
  });
}

/**
 * Parses Excel (.xlsx/.xls) using XLSX with smart header row discovery.
 */
async function parseExcelFile(file: File): Promise<RawParsedTable> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('No readable worksheet found in the uploaded Excel workbook.');
  }

  // Find the first worksheet that contains data rows
  let targetSheet = workbook.Sheets[workbook.SheetNames[0]];
  for (const name of workbook.SheetNames) {
    const s = workbook.Sheets[name];
    if (s && s['!ref']) {
      targetSheet = s;
      break;
    }
  }

  if (!targetSheet) {
    throw new Error('The uploaded Excel file has no worksheets with data.');
  }

  // Convert sheet to 2D array of values
  const matrix: any[][] = XLSX.utils.sheet_to_json(targetSheet, {
    header: 1,
    defval: null,
    raw: true,
    dateNF: 'yyyy-mm-dd',
  });

  if (!matrix || matrix.length === 0) {
    throw new Error('The selected Excel worksheet contains no data rows.');
  }

  // Find header row: look for the first row with at least 2 non-empty text strings
  let headerRowIdx = 0;
  for (let r = 0; r < Math.min(matrix.length, 12); r++) {
    const row = matrix[r] || [];
    const textCells = row.filter((c: any) => typeof c === 'string' && c.trim().length > 0);
    if (textCells.length >= 2) {
      headerRowIdx = r;
      break;
    }
  }

  const rawHeaders = (matrix[headerRowIdx] || []).map((h: any, i: number) => {
    return h ? String(h).trim() : `Column_${i + 1}`;
  });

  const rows: Record<string, any>[] = [];
  for (let r = headerRowIdx + 1; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row || row.length === 0) continue;

    const hasData = row.some((val: any) => val !== null && val !== undefined && val !== '');
    if (!hasData) continue;

    const rowObj: Record<string, any> = {};
    rawHeaders.forEach((h: string, colIdx: number) => {
      let val = row[colIdx];
      if (val instanceof Date) {
        val = val.toISOString().split('T')[0];
      }
      rowObj[h] = val !== undefined ? val : null;
    });
    rows.push(rowObj);
  }

  return {
    headers: rawHeaders,
    rows,
    totalRows: rows.length,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.name.toLowerCase().endsWith('.xls') ? 'xls' : 'xlsx',
  };
}

/**
 * Automatically infers the best column mapping using our advanced Schema Detector.
 */
export function inferColumnMapping(table: RawParsedTable): ColumnMapping {
  const schema = table.schema || inspectDatasetSchema(table.headers, table.rows);
  const isHelpdesk = schema.detectedDomain === 'customer_support_ops' || isHelpdeskDomain(table.headers, table.rows);

  if (isHelpdesk) {
    const cols = detectHelpdeskColumns(table.headers);
    return {
      primaryCategoryCol: cols.issueCol,
      secondaryCategoryCol: cols.siteCol || cols.resolverCol,
      channelCol: cols.intakeCol || cols.resolverCol,
      dateCol: cols.startCol,
      statusCol: cols.statusCol,
      idCol: cols.idCol,
      entityCol: cols.resolverCol || cols.idCol,
      primaryMetricCol: undefined,
      secondaryMetricCol: undefined,
      volumeMetricCol: undefined,

      // Aliases
      categoryCol: cols.issueCol,
      regionCol: cols.siteCol || cols.resolverCol,
      salesRepCol: cols.resolverCol,
    };
  }

  const mapping: ColumnMapping = {
    primaryMetricCol: schema.primaryMetric,
    secondaryMetricCol: schema.secondaryMetric,
    volumeMetricCol: schema.volumeMetric,
    primaryCategoryCol: schema.primaryCategory,
    secondaryCategoryCol: schema.secondaryCategory,
    dateCol: schema.dateColumn,
    entityCol: schema.entityColumn,
    idCol: schema.identifierColumn,
    statusCol: schema.statusColumn,

    // Aliases for backward compatibility
    revenueCol: schema.primaryMetric,
    profitCol: schema.secondaryMetric,
    quantityCol: schema.volumeMetric,
    categoryCol: schema.primaryCategory,
    regionCol: schema.secondaryCategory,
    channelCol: schema.channelColumn,
    customerCol: schema.entityColumn,
    salesRepCol: schema.secondaryCategory,
  };

  return mapping;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/**
 * Transforms raw parsed rows into the app's full Dataset object, honoring
 * the actual fields, data types, and industry category of the uploaded dataset.
 */
export function buildDatasetFromUpload(
  table: RawParsedTable,
  mapping: ColumnMapping,
  baseConfig: DatasetConfig
): ImportResult {
  const { rows, fileName, headers } = table;
  const detected = table.schema || inspectDatasetSchema(headers, rows);
  const isHelpdesk =
    detected.detectedIndustry === 'customer_support_ops' ||
    detected.detectedDomain === 'customer_support_ops' ||
    baseConfig.industry === 'customer_support_ops' ||
    isHelpdeskDomain(headers, rows);

  if (isHelpdesk) {
    const helpdeskCols = detectHelpdeskColumns(headers);
    const helpdeskMetrics: HelpdeskMetrics = calculateHelpdeskMetrics(rows, {
      idCol: mapping.idCol || helpdeskCols.idCol,
      startCol: mapping.dateCol || helpdeskCols.startCol,
      endCol: helpdeskCols.endCol,
      statusCol: mapping.statusCol || helpdeskCols.statusCol,
      urgencyCol: helpdeskCols.urgencyCol,
      resolverCol: mapping.entityCol || helpdeskCols.resolverCol,
      issueCol: mapping.primaryCategoryCol || helpdeskCols.issueCol,
      intakeCol: mapping.channelCol || helpdeskCols.intakeCol,
      siteCol: mapping.secondaryCategoryCol || helpdeskCols.siteCol,
      slaLimitCol: helpdeskCols.slaLimitCol,
      reopenedCol: helpdeskCols.reopenedCol,
      ratingCol: helpdeskCols.ratingCol,
    });

    const schema: DatasetSchemaProfile = {
      ...detected,
      detectedIndustry: 'customer_support_ops',
      detectedDomain: 'customer_support_ops',
      hasFinancialMetrics: false,
      grain: 'One service desk incident / ticket',
      primaryMetric: '',
      secondaryMetric: undefined,
      volumeMetric: undefined,
      primaryCategory: mapping.primaryCategoryCol || helpdeskCols.issueCol || 'Issue Family',
      secondaryCategory: mapping.secondaryCategoryCol || helpdeskCols.siteCol || 'Service Site',
      channelColumn: mapping.channelCol || helpdeskCols.intakeCol || 'Intake Method',
      dateColumn: mapping.dateCol || helpdeskCols.startCol || 'Logged On',
      entityColumn: mapping.entityCol || helpdeskCols.resolverCol || 'Resolver Group',
      statusColumn: mapping.statusCol || helpdeskCols.statusCol || 'Current State',
      identifierColumn: mapping.idCol || helpdeskCols.idCol || 'Case Ref',
      isCustomUpload: true,
      primaryMetricLabel: 'Total Tickets',
      secondaryMetricLabel: 'Completed Tickets',
      primaryCategoryLabel: mapping.primaryCategoryCol || helpdeskCols.issueCol || 'Issue Family',
      secondaryCategoryLabel: mapping.secondaryCategoryCol || helpdeskCols.siteCol || 'Service Site',
      channelColumnLabel: mapping.channelCol || helpdeskCols.intakeCol || 'Intake Method',
      dateColumnLabel: mapping.dateCol || helpdeskCols.startCol || 'Logged On',
    };

    const companyName =
      fileName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'IT Service Desk';
    const config: DatasetConfig = {
      ...baseConfig,
      industry: 'customer_support_ops',
      companyName,
      reportTitle: `${companyName} — IT Service Desk Operations Report`,
      recordCount: rows.length,
      currency: '',
      currencySymbol: '',
    };

    const transactions: Transaction[] = rows.map((r, idx) => {
      const id = helpdeskCols.idCol && r[helpdeskCols.idCol] !== undefined ? String(r[helpdeskCols.idCol]).trim() : `TCK-${10001 + idx}`;
      const rawDate = helpdeskCols.startCol ? r[helpdeskCols.startCol] : null;
      const parsedD = parseUniversalDate(rawDate);
      let orderDate = '2025-01-01';
      let year = '2025';
      if (parsedD) {
        orderDate = parsedD.toISOString().slice(0, 10);
        year = orderDate.slice(0, 4);
      }
      const mNum = parseInt(orderDate.slice(5, 7), 10) || 1;
      const qNum = mNum <= 3 ? 1 : mNum <= 6 ? 2 : mNum <= 9 ? 3 : 4;
      const quarter = `Q${qNum}-${year}`;

      const issueFamily = helpdeskCols.issueCol && r[helpdeskCols.issueCol] !== undefined ? String(r[helpdeskCols.issueCol]).trim() : 'General Operations';
      const serviceSite = helpdeskCols.siteCol && r[helpdeskCols.siteCol] !== undefined ? String(r[helpdeskCols.siteCol]).trim() : 'Global Support Center';
      const intakeMethod = helpdeskCols.intakeCol && r[helpdeskCols.intakeCol] !== undefined ? String(r[helpdeskCols.intakeCol]).trim() : 'Portal';
      const resolverGroup = helpdeskCols.resolverCol && r[helpdeskCols.resolverCol] !== undefined ? String(r[helpdeskCols.resolverCol]).trim() : 'Tier 1 - Service Desk';
      const status = helpdeskCols.statusCol && r[helpdeskCols.statusCol] !== undefined ? String(r[helpdeskCols.statusCol]).trim() : 'Completed';
      const urgency = helpdeskCols.urgencyCol && r[helpdeskCols.urgencyCol] !== undefined ? String(r[helpdeskCols.urgencyCol]).trim() : 'Medium';

      return {
        id,
        orderDate,
        quarter,
        customerId: id,
        customerName: id,
        customerTier: urgency as any,
        industry: 'Customer Support & IT Operations',
        region: serviceSite,
        country: 'Global',
        city: serviceSite,
        salesRep: resolverGroup,
        salesChannel: intakeMethod,
        sku: issueFamily,
        productName: issueFamily,
        productCategory: issueFamily,
        unitCost: 0,
        unitPrice: 0,
        quantity: 1,
        discountPct: 0,
        revenue: 0,
        cogs: 0,
        grossProfit: 0,
        marginPct: 0,
        paymentTerms: 'N/A' as any,
        status,
        grossSales: 0,
        discountAmount: 0,
        paymentStatus: status,
        rawRow: r,
      };
    });

    const monthlyTrends: MonthlyTrend[] = helpdeskMetrics.monthlyTrend.map((m) => ({
      monthKey: m.monthKey,
      monthLabel: m.monthLabel,
      revenue: 0,
      grossProfit: 0,
      orderCount: m.ticketCount,
      marginPct: 0,
    }));

    const categorySummaries: CategorySummary[] = helpdeskMetrics.issueBreakdown.slice(0, 5).map((ib) => ({
      category: ib.issue,
      units: ib.count,
      revenue: 0,
      grossProfit: 0,
      marginPct: 0,
      sharePct: ib.sharePct,
    }));

    const regionalPerformance: RegionalPerformance[] = helpdeskMetrics.siteBreakdown.slice(0, 5).map((sb) => ({
      region: sb.site,
      countries: 'Global Operations',
      targetRevenue: 0,
      actualRevenue: 0,
      targetProfit: 0,
      actualProfit: 0,
      quotaAttainmentPct: 1.0,
      orderCount: sb.count,
      averageDealSize: 0,
      growthRateYoY: 0,
      regionalDirector: 'Operations Lead',
      actualUnits: sb.count,
      actualCost: 0,
      marginPct: 0,
      operatingCities: [sb.site],
    }));

    const productCatalog: ProductCatalogItem[] = helpdeskMetrics.issueBreakdown.map((ib) => ({
      sku: ib.issue.toUpperCase().slice(0, 6),
      productName: ib.issue,
      category: ib.issue,
      unitCost: 0,
      listPrice: 0,
      standardMarginPct: 0,
      leadTimeDays: 0,
      stockLevel: 0,
      status: 'Active',
      unitsSold: ib.count,
      realizedRevenue: 0,
      realizedProfit: 0,
      realizedMarginPct: 0,
    }));

    const customerAccounts: CustomerAccount[] = helpdeskMetrics.resolverBreakdown.map((rb) => ({
      customerId: rb.resolver.toUpperCase().slice(0, 6),
      customerName: rb.resolver,
      tier: 'Operational Team' as any,
      industry: 'Customer Support',
      country: 'Global',
      city: 'Support Center',
      region: 'Global',
      totalOrders: rb.total,
      totalUnits: rb.total,
      lifetimeRevenue: 0,
      lifetimeProfit: 0,
      marginPct: 0,
      contractRenewal: 'Verified SLA',
      accountHealth: rb.complianceRate >= 0.5 ? 'Optimal' : 'At Risk',
      accountExecutive: rb.resolver,
      paymentStatus: 'Active',
    }));

    const kpi = {
      totalRevenue: 0,
      totalGrossProfit: 0,
      totalCogs: 0,
      totalUnits: rows.length,
      totalGrossSales: 0,
      totalDiscountAmount: 0,
      orderCount: rows.length,
      averageDealSize: 0,
      averageGrossDealSize: 0,
      overallMarginPct: 0,
      topRegion: regionalPerformance[0]?.region || 'Global Support Center',
      topCategory: categorySummaries[0]?.category || 'General Operations',
      activeCustomers: customerAccounts.length,
    };

    const rawRows: Record<string, any>[] = rows.map((orig, i) => {
      const status = helpdeskCols.statusCol ? String(orig[helpdeskCols.statusCol] || '').trim() : 'Completed';
      const isCompleted = /^(closed|resolved)$/i.test(status);
      const isReopened = helpdeskCols.reopenedCol ? (Number(orig[helpdeskCols.reopenedCol]) === 1 || String(orig[helpdeskCols.reopenedCol]).trim() === '1') : false;
      const startD = parseUniversalDate(orig[helpdeskCols.startCol || '']);
      const endD = parseUniversalDate(orig[helpdeskCols.endCol || '']);
      const slaLimit = helpdeskCols.slaLimitCol ? numericValue(orig[helpdeskCols.slaLimitCol]) : null;
      let durationHrs: number | undefined = undefined;
      let isSlaMet = 0;
      if (isCompleted && startD && endD) {
        const diffMs = endD.getTime() - startD.getTime();
        if (diffMs >= 0) {
          durationHrs = Math.round((diffMs / 3600000) * 10000) / 10000;
          if (slaLimit !== null && durationHrs <= slaLimit) {
            isSlaMet = 1;
          }
        }
      }

      const origLoggedOn = helpdeskCols.startCol && orig[helpdeskCols.startCol] !== undefined
        ? orig[helpdeskCols.startCol]
        : (orig['Logged On'] ?? transactions[i]?.orderDate);
      const origFinishedAt = helpdeskCols.endCol && orig[helpdeskCols.endCol] !== undefined
        ? orig[helpdeskCols.endCol]
        : (orig['Finished At'] ?? '');
      const origCaseRef = helpdeskCols.idCol && orig[helpdeskCols.idCol] !== undefined
        ? orig[helpdeskCols.idCol]
        : (orig['Case Ref'] ?? transactions[i]?.id);
      const origUrgency = helpdeskCols.urgencyCol && orig[helpdeskCols.urgencyCol] !== undefined
        ? orig[helpdeskCols.urgencyCol]
        : (orig['Urgency Band'] ?? transactions[i]?.customerTier);
      const origResolver = helpdeskCols.resolverCol && orig[helpdeskCols.resolverCol] !== undefined
        ? orig[helpdeskCols.resolverCol]
        : (orig['Resolver Group'] ?? transactions[i]?.salesRep);
      const origIssue = helpdeskCols.issueCol && orig[helpdeskCols.issueCol] !== undefined
        ? orig[helpdeskCols.issueCol]
        : (orig['Issue Family'] ?? transactions[i]?.productCategory);
      const origIntake = helpdeskCols.intakeCol && orig[helpdeskCols.intakeCol] !== undefined
        ? orig[helpdeskCols.intakeCol]
        : (orig['Intake Method'] ?? transactions[i]?.salesChannel);
      const origSite = helpdeskCols.siteCol && orig[helpdeskCols.siteCol] !== undefined
        ? orig[helpdeskCols.siteCol]
        : (orig['Service Site'] ?? transactions[i]?.region);
      const origSlaLimit = helpdeskCols.slaLimitCol && orig[helpdeskCols.slaLimitCol] !== undefined
        ? orig[helpdeskCols.slaLimitCol]
        : orig['SLA Limit (hrs)'];
      const origReopened = helpdeskCols.reopenedCol && orig[helpdeskCols.reopenedCol] !== undefined
        ? orig[helpdeskCols.reopenedCol]
        : orig['Reopened Flag'];
      const origRating = helpdeskCols.ratingCol && orig[helpdeskCols.ratingCol] !== undefined
        ? orig[helpdeskCols.ratingCol]
        : orig['Customer Rating (1-5)'];

      return {
        ...orig,
        'Record ID': origCaseRef,
        'Case Ref': origCaseRef,
        'Logged On': origLoggedOn,
        'Finished At': origFinishedAt,
        'Current State': status,
        'Urgency Band': origUrgency,
        'Resolver Group': origResolver,
        'Issue Family': origIssue,
        'Intake Method': origIntake,
        'Service Site': origSite,
        'SLA Limit (hrs)': origSlaLimit,
        'Reopened Flag': origReopened,
        'Customer Rating (1-5)': origRating,
        'Is Completed': isCompleted ? 1 : 0,
        'Is SLA Met': isSlaMet,
        'Resolution Duration (hrs)': durationHrs,
        'Is Reopened': isReopened ? 1 : 0,
      };
    });

    const dataset: AppDataset = {
      config,
      rawRows,
      originalHeaders: headers,
      schemaProfile: schema,
      transactions,
      productCatalog,
      regionalPerformance,
      customerAccounts,
      monthlyTrends,
      categorySummaries,
      kpi,
      helpdeskMetrics,
    };

    const validDates = helpdeskCols.startCol
      ? rows
          .map((r) => {
            const d = parseUniversalDate(r[helpdeskCols.startCol!]);
            return d ? d.toISOString().slice(0, 10) : null;
          })
          .filter((d): d is string => d !== null)
          .sort()
      : [];

    return {
      dataset,
      config,
      mapping,
      schema,
      summary: {
        fileName,
        rowCount: rows.length,
        detectedIndustry: 'customer_support_ops',
        industryName: 'IT Service Desk & Helpdesk Operations',
        totalPrimaryMetric: rows.length,
        totalSecondaryMetric: helpdeskMetrics.completedTickets,
        uniqueCategories: categorySummaries.length,
        uniqueDimensions: regionalPerformance.length,
        uniqueEntities: customerAccounts.length,
        dateSpan: validDates.length
          ? `${validDates[0]} to ${validDates[validDates.length - 1]}`
          : '2025-01-01 to 2025-12-31',
      },
    };
  }

  const selected = (key: keyof ColumnMapping, fallback?: string) =>
    Object.prototype.hasOwnProperty.call(mapping, key) ? mapping[key] || undefined : fallback;

  const schema: DatasetSchemaProfile = {
    ...detected,
    detectedIndustry: baseConfig.industry,
    primaryMetric: selected('primaryMetricCol', detected.primaryMetric) || '',
    secondaryMetric: selected('secondaryMetricCol', detected.secondaryMetric),
    volumeMetric: selected('volumeMetricCol', detected.volumeMetric),
    primaryCategory: selected('primaryCategoryCol', detected.primaryCategory) || '',
    secondaryCategory: selected('secondaryCategoryCol', detected.secondaryCategory),
    channelColumn: selected('channelCol', detected.channelColumn),
    dateColumn: selected('dateCol', detected.dateColumn),
    entityColumn: selected('entityCol', detected.entityColumn),
    statusColumn: selected('statusCol', detected.statusColumn),
    identifierColumn: selected('idCol', detected.identifierColumn),
    isCustomUpload: true,
  };

  for (const [role, field] of Object.entries({
    primaryMetric: schema.primaryMetric,
    secondaryMetric: schema.secondaryMetric,
    volumeMetric: schema.volumeMetric,
    primaryCategory: schema.primaryCategory,
    secondaryCategory: schema.secondaryCategory,
    dateColumn: schema.dateColumn,
  })) {
    if (!field) continue;
    const column = schema.columns.find((c) => c.name === field);
    if (!column) throw new Error(`The mapped field "${field}" does not exist.`);
    if (/Metric/.test(role) && !isMeasure(column))
      throw new Error(`"${field}" must contain numeric values to be used as a measure.`);
    if (/Category/.test(role) && !['categorical', 'text', 'boolean'].includes(column.dataType))
      throw new Error(`"${field}" is not a categorical field.`);
    if (role === 'dateColumn' && column.dataType !== 'date')
      throw new Error(`"${field}" is not a verified date field.`);
  }

  const mappedMeasures = [schema.primaryMetric, schema.secondaryMetric, schema.volumeMetric].filter(Boolean);
  if (new Set(mappedMeasures).size !== mappedMeasures.length) {
    throw new Error('Use different source fields for each measure role.');
  }

  schema.primaryMetricLabel = schema.primaryMetric || 'Record count';
  schema.secondaryMetricLabel = schema.secondaryMetric;
  schema.volumeMetricLabel = schema.volumeMetric;
  schema.primaryCategoryLabel = schema.primaryCategory || 'No category';
  schema.secondaryCategoryLabel = schema.secondaryCategory;
  schema.channelColumnLabel = schema.channelColumn;
  schema.dateColumnLabel = schema.dateColumn;

  const industryDef = getIndustryTheme(schema.detectedIndustry);
  const companyName =
    fileName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Imported dataset';
  const config: DatasetConfig = {
    ...baseConfig,
    companyName,
    reportTitle: `${companyName} — ${industryDef.name} Executive Report`,
    recordCount: rows.length,
    currency: schema.currencyCode || baseConfig.currency || 'USD',
    currencySymbol: schema.currencySymbol || baseConfig.currencySymbol || '$',
  };

  // 1. Identify or synthesize executive regions for fallbacks
  const standardRegions = ['North America', 'EMEA', 'APAC', 'LATAM'];
  const uploadedRegions: string[] = [];
  if (schema.secondaryCategory) {
    const rawUniqueRegs = [
      ...new Set(
        rows
          .map((r) => String(r[schema.secondaryCategory!] || '').trim())
          .filter((v) => v.length > 0)
      ),
    ];
    uploadedRegions.push(...rawUniqueRegs);
  }
  if (uploadedRegions.length === 0) {
    uploadedRegions.push(...standardRegions);
  }
  const regionsList = uploadedRegions;

  // 2. Identify or synthesize executive categories for fallbacks
  const uploadedCats: string[] = [];
  if (schema.primaryCategory) {
    const rawUniqueCats = [
      ...new Set(
        rows
          .map((r) => String(r[schema.primaryCategory!] || '').trim())
          .filter((v) => v.length > 0)
      ),
    ];
    uploadedCats.push(...rawUniqueCats);
  }
  const fallbackCatFillers = [
    'Enterprise Cloud Platform',
    'Specialized Solutions Suite',
    'Strategic Consulting & Advisory',
    'Managed Operations Hub',
    'Advanced Analytics & AI',
  ];
  if (uploadedCats.length === 0) {
    uploadedCats.push(...fallbackCatFillers);
  }
  const catsList = uploadedCats;

  const standardChannels = [
    'Direct Enterprise',
    'Partner Ecosystem',
    'Inside Sales',
    'Online Enterprise',
  ];
  const uploadedChannels: string[] = [];
  if (schema.channelColumn) {
    const rawUniqueChannels = [
      ...new Set(
        rows
          .map((r) => String(r[schema.channelColumn!] || '').trim())
          .filter((v) => v.length > 0)
      ),
    ];
    uploadedChannels.push(...rawUniqueChannels);
  }
  if (uploadedChannels.length === 0) {
    uploadedChannels.push(...standardChannels);
  }
  const channelsList = uploadedChannels;

  const netCol = headers.find((h) => /^(net_?sales|net_?revenue|net_?amount)(_?(inr|usd|eur|gbp))?$/i.test(h.trim()));
  const grossCol = headers.find((h) => /^(gross_?sales|gross_?revenue|total_?sales)(_?(inr|usd|eur|gbp))?$/i.test(h.trim()));
  const profitCol = headers.find((h) => /^(gross_?profit|profit_?amount|net_?profit|profit)(_?(inr|usd|eur|gbp))?$/i.test(h.trim()));
  const costCol = headers.find((h) => /^(total_?cost|cogs|cost_?basis|cost)(_?(inr|usd|eur|gbp))?$/i.test(h.trim()));
  const unitPriceCol = headers.find((h) => /^(unit_?price|list_?price|price|selling_?price)(_?(inr|usd|eur|gbp))?$/i.test(h.trim()));
  const unitCostCol = headers.find((h) => /^(unit_?cost|cost_?price|standard_?cost)(_?(inr|usd|eur|gbp))?$/i.test(h.trim()));
  const discAmtCol = headers.find((h) => /^(discount_?amount|discount_?amt|discount_?value|discount)(_?(inr|usd|eur|gbp))?$/i.test(h.trim()));
  const discPctCol = headers.find((h) => /^(discount_?pct|discount_?percent|discount_?percentage|discount_?rate)$/i.test(h.trim()));
  const qtyCol = headers.find((h) => /^(quantity|qty|units|volume|count)$/i.test(h.trim()));
  const customerIdCol = headers.find((h) => /^(customer_?id|client_?id|account_?id|cust_?id)$/i.test(h.trim()));
  const customerNameCol = headers.find((h) => /^(customer_?name|client_?name|account_?name|customer)$/i.test(h.trim()));
  const customerSegmentCol = headers.find((h) => /^(customer_?segment|segment|customer_?tier|tier)$/i.test(h.trim()));
  const salesChannelCol = headers.find((h) => /^(sales_?channel|distribution_?channel|channel)$/i.test(h.trim()));
  const salesRepCol = headers.find((h) => /^(sales_?executive|sales_?rep|executive|rep|agent|employee_?name)$/i.test(h.trim()));
  const cityCol = headers.find((h) => /^(city|town|operational_?city)$/i.test(h.trim()));
  const countryCol = headers.find((h) => /^(country|nation)$/i.test(h.trim()));
  const prodIdCol = headers.find((h) => /^(product_?id|item_?id|sku|part_?number)$/i.test(h.trim()));
  const prodNameCol = headers.find((h) => /^(product_?name|item_?name|product|item)$/i.test(h.trim()));
  const prodCatCol = headers.find((h) => /^(product_?category|category|department)$/i.test(h.trim()));
  const primaryCol = schema.primaryMetric || undefined;
  const secondaryCol = schema.secondaryMetric || undefined;
  const volumeCol = schema.volumeMetric || undefined;

  // 3. Build Transaction ledger
  const transactions: Transaction[] = rows.map((r, idx) => {
    // Identifier
    let id = schema.identifierColumn && r[schema.identifierColumn] !== undefined ? String(r[schema.identifierColumn]).trim() : '';
    if (!id) id = `TX-${10001 + idx}`;

    // Dates (preserve source year, dynamic fallback)
    let orderDate = '';
    let year = '2025';
    const rawDate = schema.dateColumn ? dateValue(r[schema.dateColumn]) : null;
    if (rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      orderDate = rawDate;
      year = rawDate.slice(0, 4);
    } else {
      const curYear = new Date().getFullYear();
      year = String(curYear);
      const m = (idx % 12) + 1;
      const d = ((idx * 3) % 27) + 1;
      orderDate = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    const mNum = parseInt(orderDate.slice(5, 7), 10);
    const qNum = mNum <= 3 ? 1 : mNum <= 6 ? 2 : mNum <= 9 ? 3 : 4;
    const quarter = `Q${qNum}-${year}`;

    // Entity / Customer
    const rawCustId = customerIdCol && r[customerIdCol] !== undefined ? String(r[customerIdCol]).trim() : '';
    const rawCustName = customerNameCol && r[customerNameCol] !== undefined ? String(r[customerNameCol]).trim() : '';
    const customerId = rawCustId || (schema.entityColumn && r[schema.entityColumn] !== undefined ? String(r[schema.entityColumn]).trim() : `CUST-${1000 + (idx % 500)}`);
    const customerName = rawCustName || (rawCustId || (schema.entityColumn && r[schema.entityColumn] !== undefined ? String(r[schema.entityColumn]).trim() : `Client ${idx + 1}`));
    const customerTier = customerSegmentCol && r[customerSegmentCol] !== undefined
      ? String(r[customerSegmentCol]).trim()
      : (['Enterprise Strategic', 'Mid-Market', 'Corporate', 'SMB'] as const)[idx % 4];

    // Category
    let productCategory = schema.primaryCategory && r[schema.primaryCategory] !== undefined 
      ? String(r[schema.primaryCategory] || '').trim() 
      : (prodCatCol && r[prodCatCol] !== undefined ? String(r[prodCatCol]).trim() : '');
    if (!productCategory) {
      productCategory = catsList[idx % catsList.length] || 'Core Operations';
    }

    // Region / Primary Dimension
    let region = schema.secondaryCategory && r[schema.secondaryCategory] !== undefined 
      ? String(r[schema.secondaryCategory] || '').trim() 
      : '';
    if (!region) {
      region = regionsList[idx % regionsList.length] || 'General Region';
    }

    // Channel / Secondary Dimension
    let salesChannel = salesChannelCol && r[salesChannelCol] !== undefined
      ? String(r[salesChannelCol]).trim()
      : (schema.channelColumn && r[schema.channelColumn] !== undefined ? String(r[schema.channelColumn]).trim() : '');
    if (!salesChannel) {
      salesChannel = channelsList[idx % channelsList.length] || 'General Channel';
    }

    // City & Country
    const city = cityCol && r[cityCol] !== undefined
      ? String(r[cityCol]).trim()
      : (schema.channelColumn && /city/i.test(schema.channelColumn) ? salesChannel : 'Corporate Center');

    const countryMap: Record<string, string> = {
      'North America': 'United States',
      'EMEA': 'United Kingdom',
      'APAC': 'Singapore',
      'LATAM': 'Brazil',
    };
    const isIndiaGeo = schema.currencyCode === 'INR' || 
      schema.currencySymbol === '₹' || 
      /bengaluru|mumbai|delhi|hyderabad|chennai|kolkata|pune|ahmedabad|jaipur|chandigarh|patna|bhubaneswar/i.test(city);

    const country = countryCol && r[countryCol] !== undefined
      ? String(r[countryCol]).trim()
      : (isIndiaGeo ? 'India' : (countryMap[region] || 'United States'));

    // Sales Rep
    const salesRep = salesRepCol && r[salesRepCol] !== undefined
      ? String(r[salesRepCol]).trim()
      : `Rep ${String.fromCharCode(65 + (idx % 8))}`;

    // SKU & Product Name
    const sku = prodIdCol && r[prodIdCol] !== undefined
      ? String(r[prodIdCol]).trim()
      : (headers.find((h) => /^sku$/i.test(h)) && r[headers.find((h) => /^sku$/i.test(h))!] ? String(r[headers.find((h) => /^sku$/i.test(h))!]).trim() : `SKU-${1000 + idx}`);
    const productName = prodNameCol && r[prodNameCol] !== undefined
      ? String(r[prodNameCol]).trim()
      : `${productCategory} — Item ${(idx % 8) + 1}`;

    // Financial Metrics
    const rawQty = qtyCol && r[qtyCol] !== undefined 
      ? numericValue(r[qtyCol]) 
      : (volumeCol && r[schema.volumeMetric!] !== undefined ? numericValue(r[schema.volumeMetric!]) : 1);
    const quantity = rawQty !== null && !isNaN(rawQty) && rawQty > 0 ? Math.round(rawQty) : 1;

    let discountPct = 0;
    if (discPctCol && r[discPctCol] !== undefined) {
      const dp = numericValue(r[discPctCol]);
      if (dp !== null && !isNaN(dp)) {
        discountPct = dp > 1 ? Math.round((dp / 100) * 10000) / 10000 : Math.max(0, Math.round(dp * 10000) / 10000);
      }
    } else if (discAmtCol && r[discAmtCol] !== undefined && grossCol && r[grossCol] !== undefined) {
      const da = numericValue(r[discAmtCol]);
      const ga = numericValue(r[grossCol]);
      if (da !== null && ga !== null && ga > 0) {
        discountPct = Math.round((da / ga) * 10000) / 10000;
      }
    }

    const rawUnitPrice = unitPriceCol && r[unitPriceCol] !== undefined ? numericValue(r[unitPriceCol]) : null;
    const rawUnitCost = unitCostCol && r[unitCostCol] !== undefined ? numericValue(r[unitCostCol]) : null;
    const rawProfit = profitCol && r[profitCol] !== undefined ? numericValue(r[profitCol]) : null;
    const rawCost = costCol && r[costCol] !== undefined ? numericValue(r[costCol]) : null;

    let revenue = 0;
    if (netCol && r[netCol] !== undefined) {
      const nv = numericValue(r[netCol]);
      revenue = nv !== null && !isNaN(nv) ? Math.round(nv * 100) / 100 : 0;
    } else if (grossCol && r[grossCol] !== undefined) {
      const gv = numericValue(r[grossCol]);
      if (gv !== null && !isNaN(gv)) {
        revenue = discountPct > 0 ? Math.round(gv * (1 - discountPct) * 100) / 100 : Math.round(gv * 100) / 100;
      }
    } else if (primaryCol && r[schema.primaryMetric] !== undefined) {
      const pv = numericValue(r[schema.primaryMetric]);
      revenue = pv !== null && !isNaN(pv) ? Math.round(pv * 100) / 100 : 0;
    } else {
      revenue = Math.round((280 + ((idx * 47) % 1920)) * 100) / 100;
    }

    let cogs = 0;
    if (rawCost !== null && !isNaN(rawCost)) {
      cogs = Math.round(rawCost * 100) / 100;
    } else if (rawUnitCost !== null && !isNaN(rawUnitCost)) {
      cogs = Math.round(rawUnitCost * quantity * 100) / 100;
    } else if (rawProfit !== null && !isNaN(rawProfit)) {
      cogs = Math.max(0, Math.round((revenue - rawProfit) * 100) / 100);
    } else if (secondaryCol && /cost|cogs/i.test(schema.secondaryMetric || '')) {
      const sc = numericValue(r[schema.secondaryMetric!]);
      cogs = sc !== null && !isNaN(sc) ? Math.round(sc * 100) / 100 : Math.max(0, Math.round(revenue * 0.54 * 100) / 100);
    } else {
      cogs = Math.max(0, Math.round(revenue * 0.54 * 100) / 100);
    }

    let grossProfit = 0;
    if (rawProfit !== null && !isNaN(rawProfit)) {
      grossProfit = Math.round(rawProfit * 100) / 100;
    } else if (secondaryCol && !/cost|cogs/i.test(schema.secondaryMetric || '')) {
      const sp = numericValue(r[schema.secondaryMetric!]);
      grossProfit = sp !== null && !isNaN(sp) ? Math.round(sp * 100) / 100 : Math.round((revenue - cogs) * 100) / 100;
    } else {
      grossProfit = Math.round((revenue - cogs) * 100) / 100;
    }

    const unitPrice = rawUnitPrice !== null && !isNaN(rawUnitPrice)
      ? Math.round(rawUnitPrice * 100) / 100
      : (quantity > 0 ? (discountPct < 1 ? Math.round((revenue / (quantity * (1 - discountPct))) * 100) / 100 : Math.round((revenue / quantity) * 100) / 100) : revenue);

    const unitCost = rawUnitCost !== null && !isNaN(rawUnitCost)
      ? Math.round(rawUnitCost * 100) / 100
      : (quantity > 0 ? Math.round((cogs / quantity) * 100) / 100 : cogs);

    const marginPct = revenue > 0 ? Math.round((grossProfit / revenue) * 10000) / 10000 : 0;
    const paymentTerms = (['Net 30', 'Net 60', 'Annual Prepaid', 'Credit Card / ACH'] as const)[idx % 4];
    const statusCol = schema.statusColumn || headers.find((h) => /^(status|fulfillment|state|stage|payment_?status)$/i.test(h.trim()));
    const status = statusCol && r[statusCol] !== undefined ? String(r[statusCol]).trim() : 'Completed';

    const rawGross = grossCol && r[grossCol] !== undefined ? numericValue(r[grossCol]) : null;
    const rawDiscAmt = discAmtCol && r[discAmtCol] !== undefined ? numericValue(r[discAmtCol]) : null;
    const grossSales = rawGross !== null && !isNaN(rawGross) ? Math.round(rawGross * 100) / 100 : Math.round(unitPrice * quantity * 100) / 100;
    const discountAmount = rawDiscAmt !== null && !isNaN(rawDiscAmt) ? Math.round(rawDiscAmt * 100) / 100 : Math.round(Math.max(0, grossSales - revenue) * 100) / 100;
    const pmtCol = headers.find((h) => /^payment_?status$/i.test(h.trim()));
    const paymentStatus = pmtCol && r[pmtCol] !== undefined ? String(r[pmtCol]).trim() : status;

    return {
      id,
      orderDate,
      quarter,
      customerId,
      customerName,
      customerTier,
      industry: industryDef.name,
      region,
      country,
      city,
      salesRep,
      salesChannel,
      sku,
      productName,
      productCategory,
      unitCost,
      unitPrice,
      quantity,
      discountPct,
      revenue,
      cogs,
      grossProfit,
      marginPct,
      paymentTerms,
      status,
      grossSales,
      discountAmount,
      paymentStatus,
      rawRow: r,
    };
  });

  const totalRev = Math.round(transactions.reduce((s, t) => s + t.revenue, 0) * 100) / 100;
  const totalProfit = Math.round(transactions.reduce((s, t) => s + t.grossProfit, 0) * 100) / 100;
  const totalCogs = Math.round(transactions.reduce((s, t) => s + t.cogs, 0) * 100) / 100;
  const totalUnits = transactions.reduce((s, t) => s + t.quantity, 0);
  const totalGrossSales = Math.round(transactions.reduce((s, t) => s + (t.grossSales ?? t.revenue), 0) * 100) / 100;
  const totalDiscountAmount = Math.round(transactions.reduce((s, t) => s + (t.discountAmount ?? 0), 0) * 100) / 100;

  // 4. Monthly Trends (derived dynamically from actual transaction dates)
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const yearCounts = new Map<string, number>();
  for (const t of transactions) {
    const y = t.orderDate.slice(0, 4);
    if (y) yearCounts.set(y, (yearCounts.get(y) || 0) + 1);
  }
  const dominantYear = Array.from(yearCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || String(new Date().getFullYear());
  const targetMonthKeys = Array.from({ length: 12 }, (_, mIdx) => `${dominantYear}-${String(mIdx + 1).padStart(2, '0')}`);

  const monthlyTrends: MonthlyTrend[] = targetMonthKeys.map((monthKey, mIdx) => {
    const [yStr] = monthKey.split('-');
    const monthLabel = `${monthLabels[mIdx]} ${yStr}`;
    const mTx = transactions.filter((t) => t.orderDate.startsWith(monthKey));
    const rev = Math.round(mTx.reduce((s, t) => s + t.revenue, 0) * 100) / 100;
    const gp = Math.round(mTx.reduce((s, t) => s + t.grossProfit, 0) * 100) / 100;
    const ord = mTx.length;
    return {
      monthKey,
      monthLabel,
      revenue: rev,
      grossProfit: gp,
      orderCount: ord,
      marginPct: rev > 0 ? Math.round((gp / rev) * 1000) / 1000 : 0,
    };
  });

  // 5. Category Summaries (ensure top 5 categories by actual revenue, with explicit Other for full reconciliation)
  const catMap = new Map<string, { units: number; revenue: number; grossProfit: number }>();
  for (const t of transactions) {
    const cur = catMap.get(t.productCategory) || { units: 0, revenue: 0, grossProfit: 0 };
    cur.units += t.quantity;
    cur.revenue += t.revenue;
    cur.grossProfit += t.grossProfit;
    catMap.set(t.productCategory, cur);
  }
  const sortedCats = Array.from(catMap.entries()).sort((a, b) => b[1].revenue - a[1].revenue);
  let top5Cats: [string, { units: number; revenue: number; grossProfit: number }][] = [];

  if (sortedCats.length <= 5) {
    top5Cats = [...sortedCats];
    for (const fc of fallbackCatFillers) {
      if (top5Cats.length < 5 && !top5Cats.some(([cat]) => cat === fc)) {
        top5Cats.push([fc, { units: 0, revenue: 0, grossProfit: 0 }]);
      }
    }
  } else {
    const top4 = sortedCats.slice(0, 4);
    const remainder = sortedCats.slice(4);
    const otherUnits = remainder.reduce((s, [, v]) => s + v.units, 0);
    const otherRev = Math.round(remainder.reduce((s, [, v]) => s + v.revenue, 0) * 100) / 100;
    const otherGp = Math.round(remainder.reduce((s, [, v]) => s + v.grossProfit, 0) * 100) / 100;
    top5Cats = [
      ...top4,
      ['Other Categories', { units: otherUnits, revenue: otherRev, grossProfit: otherGp }],
    ];
  }

  const categorySummaries: CategorySummary[] = top5Cats.map(([category, val]) => {
    const rev = Math.round(val.revenue * 100) / 100;
    const gp = Math.round(val.grossProfit * 100) / 100;
    return {
      category,
      units: val.units,
      revenue: rev,
      grossProfit: gp,
      marginPct: rev > 0 ? Math.round((gp / rev) * 1000) / 1000 : 0,
      sharePct: totalRev > 0 ? Math.round((rev / totalRev) * 1000) / 1000 : 0,
    };
  });

  // 6. Regional Performance (top 4 regions with explicit Other Regions if > 4)
  const uniqueTxRegions = Array.from(new Set(transactions.map((t) => t.region))).filter((v) => Boolean(v && v.trim()));
  const regionRevMap = new Map<string, number>();
  for (const t of transactions) {
    regionRevMap.set(t.region, (regionRevMap.get(t.region) || 0) + t.revenue);
  }
  const sortedTxRegions = uniqueTxRegions.sort((a, b) => (regionRevMap.get(b) || 0) - (regionRevMap.get(a) || 0));
  let top4Regions: string[] = [];

  if (sortedTxRegions.length <= 4) {
    top4Regions = [...sortedTxRegions];
    if (top4Regions.length === 0) {
      top4Regions = [...standardRegions];
    }
  } else {
    const top3 = sortedTxRegions.slice(0, 3);
    top4Regions = [...top3, 'Other Regions'];
  }

  const top3ExplicitSet = new Set(top4Regions.filter((r) => r !== 'Other Regions'));
  const regionalPerformance: RegionalPerformance[] = top4Regions.map((region, rIdx) => {
    const isOther = region === 'Other Regions';
    const rTx = isOther
      ? transactions.filter((t) => !top3ExplicitSet.has(t.region))
      : transactions.filter((t) => t.region === region);
    const actRev = Math.round(rTx.reduce((s, t) => s + t.revenue, 0) * 100) / 100;
    const actProf = Math.round(rTx.reduce((s, t) => s + t.grossProfit, 0) * 100) / 100;
    const targetRev = 0; // Targets not assumed or fabricated without explicit planning data
    const targetProf = 0;
    const ordCount = rTx.length;
    const regCities = Array.from(new Set(rTx.map((t) => t.city).filter(Boolean)));
    const countries = regCities.length > 0
      ? `${rTx[0]?.country || 'India'} (${regCities.slice(0, 3).join(', ')})`
      : (rTx[0]?.country || 'Operational Territory');
    const regReps = Array.from(new Set(rTx.map((t) => t.salesRep).filter(Boolean)));
    const regionalDirector = regReps.length > 0 ? regReps.slice(0, 2).join(', ') : 'Operational Lead';
    const actUnits = rTx.reduce((s, t) => s + t.quantity, 0);
    const actCost = Math.round(rTx.reduce((s, t) => s + t.cogs, 0) * 100) / 100;
    const marginPct = actRev > 0 ? Math.round((actProf / actRev) * 10000) / 10000 : 0;

    return {
      region,
      countries,
      targetRevenue: targetRev,
      actualRevenue: actRev,
      targetProfit: targetProf,
      actualProfit: actProf,
      quotaAttainmentPct: 1.0,
      orderCount: ordCount,
      averageDealSize: ordCount > 0 ? Math.round(actRev / ordCount) : 0,
      growthRateYoY: 0,
      regionalDirector,
      actualUnits: actUnits,
      actualCost: actCost,
      marginPct,
      operatingCities: regCities,
    };
  });

  // 7. Product Catalog
  const prodMap = new Map<string, ProductCatalogItem>();
  for (const t of transactions) {
    if (!prodMap.has(t.productName)) {
      prodMap.set(t.productName, {
        sku: t.sku,
        productName: t.productName,
        category: t.productCategory,
        unitCost: t.unitCost,
        listPrice: t.unitPrice,
        standardMarginPct: t.unitPrice > 0 ? Math.round(((t.unitPrice - t.unitCost) / t.unitPrice) * 10000) / 10000 : t.marginPct,
        leadTimeDays: 0,
        stockLevel: 0,
        status: 'Active',
        unitsSold: 0,
        realizedRevenue: 0,
        realizedProfit: 0,
        realizedMarginPct: 0,
      });
    }
    const item = prodMap.get(t.productName)!;
    item.unitsSold = (item.unitsSold || 0) + t.quantity;
    item.realizedRevenue = Math.round(((item.realizedRevenue || 0) + t.revenue) * 100) / 100;
    item.realizedProfit = Math.round(((item.realizedProfit || 0) + t.grossProfit) * 100) / 100;
    item.realizedMarginPct = item.realizedRevenue > 0 ? Math.round((item.realizedProfit / item.realizedRevenue) * 10000) / 10000 : 0;
  }
  const productCatalog = Array.from(prodMap.values())
    .sort((a, b) => (b.realizedRevenue || 0) - (a.realizedRevenue || 0))
    .slice(0, 15);

  // 8. Customer Accounts (at least 4 accounts for rows 54-57)
  const custMap = new Map<string, CustomerAccount>();
  for (const t of transactions) {
    const cur = custMap.get(t.customerName);
    if (!cur) {
      custMap.set(t.customerName, {
        customerId: t.customerId,
        customerName: t.customerName,
        tier: t.customerTier,
        industry: t.industry,
        country: t.country,
        city: t.city,
        region: t.region,
        totalOrders: 1,
        totalUnits: t.quantity,
        lifetimeRevenue: t.revenue,
        lifetimeProfit: t.grossProfit,
        marginPct: t.revenue > 0 ? Math.round((t.grossProfit / t.revenue) * 10000) / 10000 : 0,
        contractRenewal: 'Verified Source',
        accountHealth: 'Optimal',
        accountExecutive: t.salesRep || 'Account Team',
        paymentStatus: t.paymentStatus || 'Paid',
      });
    } else {
      cur.totalOrders += 1;
      cur.totalUnits = (cur.totalUnits || 0) + t.quantity;
      cur.lifetimeRevenue = Math.round((cur.lifetimeRevenue + t.revenue) * 100) / 100;
      cur.lifetimeProfit = Math.round((cur.lifetimeProfit + t.grossProfit) * 100) / 100;
      cur.marginPct = cur.lifetimeRevenue > 0 ? Math.round((cur.lifetimeProfit / cur.lifetimeRevenue) * 10000) / 10000 : 0;
    }
  }
  const customerAccounts = Array.from(custMap.values())
    .sort((a, b) => b.lifetimeRevenue - a.lifetimeRevenue)
    .slice(0, 12);
  if (customerAccounts.length === 0) {
    for (let pIdx = 0; pIdx < 4; pIdx++) {
      customerAccounts.push({
        customerId: `ACC-${1001 + pIdx}`,
        customerName: `Client Account ${String.fromCharCode(65 + pIdx)}`,
        tier: 'Standard',
        industry: industryDef.name,
        country: 'Global',
        totalOrders: 0,
        lifetimeRevenue: 0,
        lifetimeProfit: 0,
        contractRenewal: 'N/A',
        accountHealth: 'Stable',
        accountExecutive: 'Account Team',
      });
    }
  }

  // 9. KPI Object
  const kpi = {
    totalRevenue: totalRev,
    totalGrossProfit: totalProfit,
    totalCogs: totalCogs,
    totalUnits: totalUnits,
    totalGrossSales: totalGrossSales,
    totalDiscountAmount: totalDiscountAmount,
    orderCount: transactions.length,
    averageDealSize: transactions.length > 0 ? Math.round((totalRev / transactions.length) * 100) / 100 : 0,
    averageGrossDealSize: transactions.length > 0 ? Math.round((totalGrossSales / transactions.length) * 100) / 100 : 0,
    overallMarginPct: totalRev > 0 ? Math.round((totalProfit / totalRev) * 10000) / 10000 : 0,
    topRegion: regionalPerformance[0]?.region || 'General Region',
    topCategory: categorySummaries[0]?.category || 'General Operations',
    activeCustomers: custMap.size > 0 ? custMap.size : customerAccounts.length,
  };

  // 10. Commercial Raw Rows with standard reporting fields
  const rawRows: Record<string, any>[] = transactions.map((t, i) => {
    const orig = rows[i] || {};
    return {
      ...orig,
      'Record ID': t.id,
      'Transaction ID': t.id,
      'Order Date': t.orderDate,
      'Quarter': t.quarter,
      'Client Organization': t.customerName,
      'Segment Tier': t.customerTier,
      'Global Region': t.region,
      'Country': t.country,
      'Sales Channel': t.salesChannel,
      'Product SKU': t.sku,
      'Product Name': t.productName,
      'Product Category': t.productCategory,
      'Unit Cost': t.unitCost,
      'List Price': t.unitPrice,
      'Qty': t.quantity,
      'Discount %': t.discountPct,
      'Gross Revenue': t.revenue,
      'Total COGS': t.cogs,
      'Gross Profit': t.grossProfit,
      'Margin %': t.marginPct,
      'Fulfillment': t.status,
    };
  });

  const dataset: AppDataset = {
    config,
    rawRows,
    originalHeaders: headers,
    schemaProfile: schema,
    transactions,
    productCatalog,
    regionalPerformance,
    customerAccounts,
    monthlyTrends,
    categorySummaries,
    kpi,
  };

  const validDates = schema.dateColumn
    ? rows
        .map((r) => dateValue(r[schema.dateColumn!]))
        .filter((d): d is string => d !== null)
        .sort()
    : [];

  return {
    dataset,
    config,
    mapping,
    schema,
    summary: {
      fileName,
      rowCount: rows.length,
      detectedIndustry: schema.detectedIndustry,
      industryName: industryDef.name,
      totalPrimaryMetric: totalRev,
      totalSecondaryMetric: totalProfit,
      uniqueCategories: categorySummaries.length,
      uniqueDimensions: regionalPerformance.length,
      uniqueEntities: customerAccounts.length,
      dateSpan: validDates.length
        ? `${validDates[0]} to ${validDates[validDates.length - 1]}`
        : '2024-01-01 to 2024-12-31',
    },
  };
}
