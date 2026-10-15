import { AppDataset, ColumnProfile } from '../types/dataset';
import { parseCleanNumber } from './schemaDetector';

export type Aggregation = 'sum' | 'average' | 'count';
export interface AnalysisSelection { metric: string; dimension: string; aggregation: Aggregation }
export interface AnalysisPoint { label: string; value: number; count: number }
export interface AnalysisChart { title: string; kind: 'bar' | 'line' | 'distribution' | 'composition'; points: AnalysisPoint[]; note: string }
export const isMeasure = (c: ColumnProfile) => ['currency', 'numeric', 'percentage'].includes(c.dataType);
export const defaultAggregation = (column?: ColumnProfile): Aggregation => column && (column.dataType === 'percentage' || /score|rating|age|tenure|temperature|balance|price|rate|gpa|salary|wage|latency|duration|yield|occupancy/i.test(column.name)) ? 'average' : 'sum';
export function numericValue(value: unknown, column?: ColumnProfile): number | null {
  const number = parseCleanNumber(value);
  if (number === null || !Number.isFinite(number)) return null;
  // Percentage strings use whole percent units; Excel stores percentages as fractions.
  return column?.dataType === 'percentage' && (typeof value === 'string' && value.includes('%') || column.percentageScale !== 'fraction' && Number(column.stats?.max ?? 0) > 1) ? number / 100 : number;
}
export function dateValue(value: unknown): string | null {
  let date: Date;
  if (value instanceof Date) date = value;
  else if (typeof value === 'number' && value > 0 && value < 100000) date = new Date(Date.UTC(1899, 11, 30) + value * 86400000);
  else if (typeof value === 'string' && /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(value.trim())) {
    const parts = value.trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)!;
    date = new Date(Date.UTC(+parts[1], +parts[2] - 1, +parts[3]));
    if (date.getUTCMonth() !== +parts[2] - 1 || date.getUTCDate() !== +parts[3]) return null;
  } else if (typeof value === 'string' && /[/-]|[a-z]{3}/i.test(value)) date = new Date(value);
  else return null;
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}
export function availableFields(data: AppDataset) {
  const columns = data.schemaProfile?.columns || [];
  return { columns, measures: columns.filter(isMeasure), dimensions: columns.filter(c => ['categorical', 'boolean'].includes(c.dataType) || c.suggestedRole === 'entityName'), dates: columns.filter(c => c.dataType === 'date') };
}
export function initialSelection(data: AppDataset): AnalysisSelection {
  const { measures, dimensions } = availableFields(data);
  const primary = measures.find(c => c.name === data.schemaProfile?.primaryMetric) || measures[0];
  return { metric: primary?.name || '', dimension: dimensions.find(c => c.name === data.schemaProfile?.primaryCategory)?.name || dimensions[0]?.name || '', aggregation: primary ? defaultAggregation(primary) : 'count' };
}
export function analyzeDataset(data: AppDataset, selection = initialSelection(data), filter?: { field: string; value: string }) {
  const { columns, measures, dimensions, dates } = availableFields(data);
  const allRows = data.rawRows || [];
  const rows = filter?.field && filter.value ? allRows.filter(r => String(r[filter.field] ?? '(Missing)') === filter.value) : allRows;
  const metric = measures.find(c => c.name === selection.metric);
  const aggregation = metric && selection.aggregation !== 'count' ? selection.aggregation : 'count';
  const metricLabel = aggregation === 'count' ? 'Record count' : `${aggregation === 'average' ? 'Average' : 'Total'} ${metric!.name}`;
  const values = metric ? rows.map(r => numericValue(r[metric.name], metric)).filter((n): n is number => n !== null) : [];
  const aggregate = (items: Record<string, any>[]) => {
    if (aggregation === 'count') return items.length;
    const nums = items.map(r => numericValue(r[metric!.name], metric)).filter((n): n is number => n !== null);
    return nums.length ? nums.reduce((s, n) => s + n, 0) / (aggregation === 'average' ? nums.length : 1) : null;
  };
  const group = (field: string, date = false): AnalysisPoint[] => {
    const groups = new Map<string, Record<string, any>[]>();
    for (const row of rows) {
      const key = date ? dateValue(row[field])?.slice(0, 7) : String(row[field] ?? '').trim() || '(Missing)';
      if (!key) continue;
      const items = groups.get(key);
      if (items) items.push(row); else groups.set(key, [row]);
    }
    return Array.from(groups, ([label, items]) => ({ label, value: aggregate(items), count: items.length }))
      .filter((p): p is AnalysisPoint => p.value !== null)
      .sort((a, b) => date ? a.label.localeCompare(b.label) : b.value - a.value);
  };
  const charts: AnalysisChart[] = [];
  const dimension = dimensions.find(c => c.name === selection.dimension);
  if (dates[0]) {
    const points = group(dates[0].name, true);
    if (points.length) charts.push({ title: `${metricLabel} over time`, kind: 'line', points, note: `Monthly aggregation of ${dates[0].name}. Invalid or missing dates excluded; no projected periods.` });
  }
  if (dimension) {
    const points = group(dimension.name);
    charts.push({ title: `${metricLabel} by ${dimension.name}`, kind: 'bar', points: points.slice(0, 12), note: `${points.length > 12 ? 'Top 12 of ' + points.length + ' groups. ' : ''}Grouped by source field ${dimension.name}.` });
    const other = dimensions.find(c => c.name !== dimension.name && c.name === data.schemaProfile?.statusColumn) || dimensions.find(c => c.name !== dimension.name);
    if (other) {
      const points = group(other.name);
      charts.push({ title: `${metricLabel} by ${other.name}`, kind: points.length <= 6 && points.every(p => p.value >= 0) && aggregation !== 'average' ? 'composition' : 'bar', points: points.slice(0, 12), note: `Actual ${other.name} groups${points.length > 12 ? '; top 12 shown' : ''}. ${aggregation === 'average' ? 'Averages are not shares of a total.' : ''}` });
    }
  }
  if (metric && values.length) {
    const min = values.reduce((a, b) => Math.min(a, b), Infinity), max = values.reduce((a, b) => Math.max(a, b), -Infinity);
    const bins = Math.min(8, Math.max(1, Math.ceil(Math.sqrt(values.length))));
    const width = max === min ? 1 : (max - min) / bins;
    const points = Array.from({ length: max === min ? 1 : bins }, (_, i) => ({ label: `${(min + width * i).toLocaleString(undefined, { maximumFractionDigits: 2 })}–${(max === min ? max : min + width * (i + 1)).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, value: 0, count: 0 }));
    values.forEach(v => { const point = points[Math.min(points.length - 1, Math.floor((v - min) / width))]; point.value++; point.count++; });
    charts.push({ title: `${metric.name} distribution`, kind: 'distribution', points, note: `${values.length} valid numeric observations; bar height is record count. Source units on the range labels.` });
  }
  const quality = columns.map(column => {
    let missing = 0, invalid = 0;
    for (const row of allRows) {
      const value = row[column.name];
      if (value === null || value === undefined || String(value).trim() === '') missing++;
      else if (isMeasure(column) ? numericValue(value, column) === null : column.dataType === 'date' && !dateValue(value)) invalid++;
    }
    return { ...column, missing, invalid };
  });
  return { rows, columns, measures, dimensions, dates, metric, aggregation, metricLabel, total: aggregate(rows), validCount: values.length, charts, quality,
    missingMetric: metric ? rows.length - values.length : 0,
    invalidDates: dates[0] ? rows.filter(r => !dateValue(r[dates[0].name])).length : 0,
    duplicateRows: allRows.length - new Set(allRows.map(row => JSON.stringify(columns.map(c => row[c.name] ?? null)))).size,
  };
}

