/**
 * Validated v8 JavaScript Analytics Engine
 * Serves as the primary default engine and authoritative baseline.
 * Authoritative source: PRD v8.0 & PRD v9.0 Section 02, 03, 06
 */

import { AnalyticsEngine, QueryPlan, ExecutionResult, FilterClause, MetricQuery, GroupBySpec } from './types';

function parseDateVal(val: any): Date | null {
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (!val) return null;
  const s = String(val).trim();
  
  // DD-MM-YYYY HH:mm or DD/MM/YYYY HH:mm
  const dmyMatch = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (dmyMatch) {
    const [, dy, mo, yr, hr, mn, sc] = dmyMatch;
    const d = new Date(Date.UTC(+yr, +mo - 1, +dy, hr ? +hr : 0, mn ? +mn : 0, sc ? +sc : 0));
    return isNaN(d.getTime()) ? null : d;
  }

  // YYYY-MM-DD
  const ymdMatch = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (ymdMatch) {
    const [, yr, mo, dy, hr, mn, sc] = ymdMatch;
    const d = new Date(Date.UTC(+yr, +mo - 1, +dy, hr ? +hr : 0, mn ? +mn : 0, sc ? +sc : 0));
    return isNaN(d.getTime()) ? null : d;
  }

  const parsed = new Date(s);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function computeQuantile(vals: number[], q: number): number {
  if (vals.length === 0) return 0;
  if (vals.length === 1) return vals[0];
  const sorted = [...vals].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * Math.max(0, Math.min(1, q));
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

export class V8JavaScriptEngine implements AnalyticsEngine {
  readonly id = 'v8-javascript';
  readonly version = '8.0.0-canonical';
  private tables: Map<string, Record<string, any>[]> = new Map();

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async registerDataset(tableName: string, data: Record<string, any>[] | string | Uint8Array): Promise<void> {
    if (Array.isArray(data)) {
      this.tables.set(tableName, data);
    } else {
      throw new Error('V8JavaScriptEngine expects in-memory row records');
    }
  }

  private matchFilter(row: Record<string, any>, filter: FilterClause): boolean {
    const val = row[filter.field];
    switch (filter.operator) {
      case 'eq':
        return String(val) === String(filter.value);
      case 'neq':
        return String(val) !== String(filter.value);
      case 'gt':
        return Number(val) > Number(filter.value);
      case 'gte':
        return Number(val) >= Number(filter.value);
      case 'lt':
        return Number(val) < Number(filter.value);
      case 'lte':
        return Number(val) <= Number(filter.value);
      case 'in':
        return Array.isArray(filter.value) && filter.value.some((v) => String(v) === String(val));
      case 'between':
        return (
          Array.isArray(filter.value) &&
          filter.value.length === 2 &&
          Number(val) >= Number(filter.value[0]) &&
          Number(val) <= Number(filter.value[1])
        );
      case 'is_null':
        return val === null || val === undefined || val === '';
      case 'is_not_null':
        return val !== null && val !== undefined && val !== '';
      default:
        return true;
    }
  }

  private computeMetricValue(metric: MetricQuery, rows: Record<string, any>[]): number {
    let metricRows = rows;
    if (metric.filters && metric.filters.length > 0) {
      metricRows = rows.filter((r) => metric.filters!.every((f) => this.matchFilter(r, f)));
    }

    switch (metric.operation) {
      case 'count':
      case 'countRows':
        return metricRows.length;

      case 'countDistinct': {
        const unique = new Set(
          metricRows
            .map((r) => r[metric.field!])
            .filter((v) => v !== null && v !== undefined && v !== '')
        );
        return unique.size;
      }

      case 'sum': {
        const vals = metricRows
          .map((r) => r[metric.field!])
          .filter((v) => v !== null && v !== undefined && v !== '')
          .map(Number)
          .filter(Number.isFinite);
        return vals.reduce((a, b) => a + b, 0);
      }

      case 'average': {
        const vals = metricRows
          .map((r) => r[metric.field!])
          .filter((v) => v !== null && v !== undefined && v !== '')
          .map(Number)
          .filter(Number.isFinite);
        return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      }

      case 'weightedAvg': {
        let weightedSum = 0;
        let totalWeight = 0;
        for (const r of metricRows) {
          const v = r[metric.field!];
          const w = r[metric.weightField!];
          if (v !== null && v !== undefined && w !== null && w !== undefined) {
            const numV = Number(v);
            const numW = Number(w);
            if (Number.isFinite(numV) && Number.isFinite(numW) && numW > 0) {
              weightedSum += numV * numW;
              totalWeight += numW;
            }
          }
        }
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
      }

      case 'min': {
        const vals = metricRows
          .map((r) => r[metric.field!])
          .filter((v) => v !== null && v !== undefined && v !== '')
          .map(Number)
          .filter(Number.isFinite);
        return vals.length > 0 ? Math.min(...vals) : 0;
      }

      case 'max': {
        const vals = metricRows
          .map((r) => r[metric.field!])
          .filter((v) => v !== null && v !== undefined && v !== '')
          .map(Number)
          .filter(Number.isFinite);
        return vals.length > 0 ? Math.max(...vals) : 0;
      }

      case 'median': {
        const vals = metricRows
          .map((r) => r[metric.field!])
          .filter((v) => v !== null && v !== undefined && v !== '')
          .map(Number)
          .filter(Number.isFinite)
          .sort((a, b) => a - b);
        if (vals.length === 0) return 0;
        const mid = Math.floor(vals.length / 2);
        return vals.length % 2 !== 0 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2;
      }

      case 'percentile': {
        const vals = metricRows
          .map((r) => r[metric.field!])
          .filter((v) => v !== null && v !== undefined && v !== '')
          .map(Number)
          .filter(Number.isFinite);
        return computeQuantile(vals, metric.percentile ?? 0.5);
      }

      case 'durationBetween': {
        let divisor = 3600.0;
        if (metric.durationUnit === 'days') divisor = 86400.0;
        else if (metric.durationUnit === 'minutes') divisor = 60.0;
        else if (metric.durationUnit === 'seconds') divisor = 1.0;

        const durations: number[] = [];
        for (const r of metricRows) {
          const t1 = parseDateVal(r[metric.startField!]);
          const t2 = parseDateVal(r[metric.endField!]);
          if (t1 && t2) {
            const diffSec = (t2.getTime() - t1.getTime()) / 1000.0;
            if (diffSec >= 0) {
              durations.push(diffSec / divisor);
            }
          }
        }
        return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
      }

      case 'ratio': {
        const numVals = metricRows
          .map((r) => r[metric.field!])
          .filter((v) => v !== null && v !== undefined && v !== '')
          .map(Number)
          .filter(Number.isFinite);
        const denVals = metricRows
          .map((r) => r[metric.denominatorField!])
          .filter((v) => v !== null && v !== undefined && v !== '')
          .map(Number)
          .filter(Number.isFinite);
        const numSum = numVals.reduce((a, b) => a + b, 0);
        const denSum = denVals.reduce((a, b) => a + b, 0);
        return denSum > 0 ? numSum / denSum : 0;
      }

      default:
        return 0;
    }
  }

  private getTimeBucketKey(date: Date, grain: string): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    switch (grain) {
      case 'year':
        return `${y}-01-01`;
      case 'quarter': {
        const qMonth = String(Math.floor(date.getUTCMonth() / 3) * 3 + 1).padStart(2, '0');
        return `${y}-${qMonth}-01`;
      }
      case 'month':
        return `${y}-${m}-01`;
      case 'week': {
        const dayOfWeek = date.getUTCDay();
        const diff = date.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const mon = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), diff));
        return `${mon.getUTCFullYear()}-${String(mon.getUTCMonth() + 1).padStart(2, '0')}-${String(mon.getUTCDate()).padStart(2, '0')}`;
      }
      case 'day':
      default:
        return `${y}-${m}-${d}`;
    }
  }

  async execute(plan: QueryPlan): Promise<ExecutionResult> {
    const t0 = performance.now();
    const sourceRows = this.tables.get(plan.tableName) || [];
    const scanned = sourceRows.length;

    // Apply global filters
    let eligible = sourceRows;
    if (plan.filters && plan.filters.length > 0) {
      eligible = sourceRows.filter((r) => plan.filters!.every((f) => this.matchFilter(r, f)));
    }

    // 1. Grouped Execution
    if (plan.groupBy && plan.groupBy.length > 0) {
      const groups = new Map<string, { keyObj: Record<string, any>; rows: Record<string, any>[] }>();

      for (const r of eligible) {
        const keyParts: string[] = [];
        const keyObj: Record<string, any> = {};

        const groupByList: (string | GroupBySpec)[] = plan.groupBy;
        for (const g of groupByList) {
          if (typeof g === 'string') {
            const val = r[g];
            keyParts.push(String(val ?? ''));
            keyObj[g] = val;
          } else if (g && typeof g === 'object') {
            const rawVal = r[g.field];
            const alias = g.alias || g.field;
            if (g.timeBucket) {
              const dt = parseDateVal(rawVal);
              const bucketStr = dt ? this.getTimeBucketKey(dt, g.timeBucket) : 'Unknown';
              keyParts.push(bucketStr);
              keyObj[alias] = bucketStr;
            } else {
              keyParts.push(String(rawVal ?? ''));
              keyObj[alias] = rawVal;
            }
          }
        }

        const compositeKey = keyParts.join(':::');
        let entry = groups.get(compositeKey);
        if (!entry) {
          entry = { keyObj, rows: [] };
          groups.set(compositeKey, entry);
        }
        entry.rows.push(r);
      }

      let groupedRows: Record<string, any>[] = [];
      for (const entry of groups.values()) {
        const rowResult: Record<string, any> = { ...entry.keyObj };
        for (const m of plan.metrics) {
          rowResult[m.id] = this.computeMetricValue(m, entry.rows);
        }
        groupedRows.push(rowResult);
      }

      // Sort
      if (plan.sort && plan.sort.length > 0) {
        groupedRows.sort((a, b) => {
          for (const s of plan.sort!) {
            const va = a[s.field];
            const vb = b[s.field];
            if (va < vb) return s.direction === 'asc' ? -1 : 1;
            if (va > vb) return s.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }

      // Top N handling
      if (plan.topN) {
        const { field, metricId, limit, direction = 'desc', includeOther = true, otherLabel = 'Other' } = plan.topN;
        groupedRows.sort((a, b) => {
          const va = Number(a[metricId] || 0);
          const vb = Number(b[metricId] || 0);
          return direction === 'desc' ? vb - va : va - vb;
        });

        if (groupedRows.length > limit) {
          const topRows = groupedRows.slice(0, limit);
          if (includeOther) {
            const otherRows = groupedRows.slice(limit);
            const otherObj: Record<string, any> = { [field]: otherLabel };
            for (const m of plan.metrics) {
              const vals = otherRows.map((r) => Number(r[m.id] || 0)).filter(Number.isFinite);
              otherObj[m.id] = vals.reduce((sum, v) => sum + v, 0);
            }
            topRows.push(otherObj);
          }
          groupedRows = topRows;
        }
      } else if (typeof plan.limit === 'number' && plan.limit > 0) {
        groupedRows = groupedRows.slice(0, Math.floor(plan.limit));
      }

      // Compute total aggregate metrics over whole eligible set
      const totalMetrics: Record<string, number> = {};
      for (const m of plan.metrics) {
        totalMetrics[m.id] = this.computeMetricValue(m, eligible);
      }

      const executionMs = performance.now() - t0;
      return {
        planId: plan.planId,
        engineId: this.id,
        engineVersion: this.version,
        metrics: totalMetrics,
        groupedRows,
        executionMs,
        rowCounts: {
          scanned,
          eligible: eligible.length,
          returned: groupedRows.length,
        },
      };
    }

    // 2. Global Aggregations (Single-Row Metrics)
    const metricsResult: Record<string, number> = {};
    for (const m of plan.metrics) {
      metricsResult[m.id] = this.computeMetricValue(m, eligible);
    }

    const executionMs = performance.now() - t0;
    return {
      planId: plan.planId,
      engineId: this.id,
      engineVersion: this.version,
      metrics: metricsResult,
      executionMs,
      rowCounts: {
        scanned,
        eligible: eligible.length,
        returned: 1,
      },
    };
  }

  async dispose(): Promise<void> {
    this.tables.clear();
  }
}
