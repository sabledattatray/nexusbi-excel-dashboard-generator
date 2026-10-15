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
} from '../types/dataset';
import { inspectDatasetSchema, parseCleanNumber } from './schemaDetector';
import { getIndustryTheme } from './industryTheme';
import { dateValue, numericValue, isMeasure } from './adaptiveAnalysis';

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

/**
 * Parses an uploaded File (CSV, TSV, XLSX, XLS) into a normalized RawParsedTable
 * and runs initial schema inspection.
 */
export async function parseUploadedFile(file: File): Promise<RawParsedTable> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  let table: RawParsedTable;
  if (extension === 'xlsx' || extension === 'xls') {
    table = await parseExcelFile(file);
  } else {
    table = await parseCsvFile(file);
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
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        const rawHeaders = (results.meta.fields || []).map((h) => h.trim()).filter(Boolean);
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
    customerCol: schema.entityColumn,
    salesRepCol: schema.secondaryCategory,
  };

  return mapping;
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
  const selected = (key: keyof ColumnMapping, fallback?: string) => Object.prototype.hasOwnProperty.call(mapping, key) ? mapping[key] || undefined : fallback;
  const schema: DatasetSchemaProfile = {
    ...detected,
    detectedIndustry: baseConfig.industry,
    primaryMetric: selected('primaryMetricCol', detected.primaryMetric) || '',
    secondaryMetric: selected('secondaryMetricCol', detected.secondaryMetric),
    volumeMetric: selected('volumeMetricCol', detected.volumeMetric),
    primaryCategory: selected('primaryCategoryCol', detected.primaryCategory) || '',
    secondaryCategory: selected('secondaryCategoryCol', detected.secondaryCategory),
    dateColumn: selected('dateCol', detected.dateColumn),
    entityColumn: selected('entityCol', detected.entityColumn),
    statusColumn: selected('statusCol', detected.statusColumn),
    identifierColumn: selected('idCol', detected.identifierColumn),
  };
  for (const [role, field] of Object.entries({ primaryMetric: schema.primaryMetric, secondaryMetric: schema.secondaryMetric, volumeMetric: schema.volumeMetric, primaryCategory: schema.primaryCategory, secondaryCategory: schema.secondaryCategory, dateColumn: schema.dateColumn })) {
    if (!field) continue;
    const column = schema.columns.find(c => c.name === field);
    if (!column) throw new Error(`The mapped field "${field}" does not exist.`);
    if (/Metric/.test(role) && !isMeasure(column)) throw new Error(`"${field}" must contain numeric values to be used as a measure.`);
    if (/Category/.test(role) && !['categorical', 'text', 'boolean'].includes(column.dataType)) throw new Error(`"${field}" is not a categorical field.`);
    if (role === 'dateColumn' && column.dataType !== 'date') throw new Error(`"${field}" is not a verified date field.`);
  }
  const mappedMeasures = [schema.primaryMetric, schema.secondaryMetric, schema.volumeMetric].filter(Boolean);
  if (new Set(mappedMeasures).size !== mappedMeasures.length) throw new Error('Use different source fields for each measure role.');
  schema.primaryMetricLabel = schema.primaryMetric || 'Record count';
  schema.secondaryMetricLabel = schema.secondaryMetric;
  schema.volumeMetricLabel = schema.volumeMetric;
  schema.primaryCategoryLabel = schema.primaryCategory || 'No category';
  schema.secondaryCategoryLabel = schema.secondaryCategory;
  schema.dateColumnLabel = schema.dateColumn;
  const industryDef = getIndustryTheme(schema.detectedIndustry);
  const companyName = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Imported dataset';
  const config = { ...baseConfig, companyName, reportTitle: `${companyName} — ${industryDef.name} Analytics`, recordCount: rows.length };
  const metricColumn = schema.columns.find(c => c.name === schema.primaryMetric);
  const sum = (field?: string) => field ? rows.reduce((total, row) => total + (numericValue(row[field], schema.columns.find(c => c.name === field)) ?? 0), 0) : 0;
  const unique = (field?: string) => field ? new Set(rows.map(r => r[field]).filter(v => v !== null && v !== undefined && String(v).trim() !== '')).size : 0;
  const validDates = schema.dateColumn ? rows.map(r => dateValue(r[schema.dateColumn!])).filter((d): d is string => d !== null).sort() : [];
  const dataset: AppDataset = {
    config, rawRows: rows, originalHeaders: headers, schemaProfile: schema,
    // Imported analytics uses original rows directly; never synthesize sales records.
    transactions: [], productCatalog: [], regionalPerformance: [], customerAccounts: [], monthlyTrends: [], categorySummaries: [],
    kpi: { totalRevenue: sum(schema.primaryMetric), totalGrossProfit: sum(schema.secondaryMetric), totalCogs: 0, totalUnits: sum(schema.volumeMetric), orderCount: rows.length, averageDealSize: 0, overallMarginPct: 0, topRegion: '', topCategory: '', activeCustomers: unique(schema.entityColumn) },
  };
  return { dataset, config, mapping, schema, summary: {
    fileName, rowCount: rows.length, detectedIndustry: schema.detectedIndustry, industryName: industryDef.name,
    totalPrimaryMetric: metricColumn ? sum(schema.primaryMetric) : rows.length, totalSecondaryMetric: sum(schema.secondaryMetric),
    uniqueCategories: unique(schema.primaryCategory), uniqueDimensions: unique(schema.secondaryCategory), uniqueEntities: unique(schema.entityColumn),
    dateSpan: validDates.length ? `${validDates[0]} to ${validDates[validDates.length - 1]}` : 'No verified date field',
  } };
}
