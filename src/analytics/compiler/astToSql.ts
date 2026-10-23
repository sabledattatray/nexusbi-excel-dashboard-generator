/**
 * Safe Typed AST to DuckDB SQL Compiler
 * Authoritative source: PRD v9.0 Section 06 (Q01-Q18)
 *
 * Implements allowlisted operations, parameterized values, strictly quoted
 * identifiers, time bucketing, weighted averages, and quantiles/medians.
 */

import { QueryPlan, MetricQuery, FilterClause, GroupBySpec } from '../types';
import { quoteIdent, formatLiteral, isAllowedOperator } from './sqlSanitizer';

export function compileFilterClause(clause: FilterClause): string {
  if (!isAllowedOperator(clause.operator)) {
    throw new Error(`Disallowed filter operator: ${clause.operator}`);
  }

  const col = quoteIdent(clause.field);

  switch (clause.operator) {
    case 'eq':
      return `${col} = ${formatLiteral(clause.value)}`;
    case 'neq':
      return `${col} != ${formatLiteral(clause.value)}`;
    case 'gt':
      return `${col} > ${formatLiteral(clause.value)}`;
    case 'gte':
      return `${col} >= ${formatLiteral(clause.value)}`;
    case 'lt':
      return `${col} < ${formatLiteral(clause.value)}`;
    case 'lte':
      return `${col} <= ${formatLiteral(clause.value)}`;
    case 'in': {
      if (!Array.isArray(clause.value) || clause.value.length === 0) {
        return '1=0';
      }
      const vals = clause.value.map(formatLiteral).join(', ');
      return `${col} IN (${vals})`;
    }
    case 'between': {
      if (!Array.isArray(clause.value) || clause.value.length !== 2) {
        throw new Error('BETWEEN operator requires 2 values');
      }
      return `${col} BETWEEN ${formatLiteral(clause.value[0])} AND ${formatLiteral(clause.value[1])}`;
    }
    case 'is_null':
      return `${col} IS NULL`;
    case 'is_not_null':
      return `${col} IS NOT NULL`;
    default:
      throw new Error(`Unhandled operator: ${clause.operator}`);
  }
}

export function compileMetricExpression(metric: MetricQuery): string {
  const alias = quoteIdent(metric.id);
  const col = metric.field ? quoteIdent(metric.field) : undefined;
  const denom = metric.denominatorField ? quoteIdent(metric.denominatorField) : undefined;
  const weight = metric.weightField ? quoteIdent(metric.weightField) : undefined;
  const startCol = metric.startField ? quoteIdent(metric.startField) : undefined;
  const endCol = metric.endField ? quoteIdent(metric.endField) : undefined;

  let filterCondition: string | null = null;
  if (metric.filters && metric.filters.length > 0) {
    filterCondition = metric.filters.map(compileFilterClause).join(' AND ');
  }

  switch (metric.operation) {
    case 'count':
    case 'countRows':
      if (filterCondition) {
        return `COUNT(CASE WHEN ${filterCondition} THEN 1 END) AS ${alias}`;
      }
      return `COUNT(*) AS ${alias}`;

    case 'countDistinct': {
      if (!col) throw new Error(`Metric ${metric.id} requires field for COUNT_DISTINCT`);
      if (filterCondition) {
        return `COUNT(DISTINCT CASE WHEN ${filterCondition} THEN ${col} END) AS ${alias}`;
      }
      return `COUNT(DISTINCT ${col}) AS ${alias}`;
    }

    case 'sum':
      if (!col) throw new Error(`Metric ${metric.id} requires field for SUM`);
      if (filterCondition) {
        return `COALESCE(SUM(CASE WHEN ${filterCondition} THEN TRY_CAST(${col} AS DOUBLE) ELSE 0.0 END), 0.0) AS ${alias}`;
      }
      return `COALESCE(SUM(TRY_CAST(${col} AS DOUBLE)), 0.0) AS ${alias}`;

    case 'average':
      if (!col) throw new Error(`Metric ${metric.id} requires field for AVERAGE`);
      if (filterCondition) {
        return `AVG(CASE WHEN ${filterCondition} THEN TRY_CAST(${col} AS DOUBLE) END) AS ${alias}`;
      }
      return `AVG(TRY_CAST(${col} AS DOUBLE)) AS ${alias}`;

    case 'weightedAvg': {
      if (!col || !weight) {
        throw new Error(`Metric ${metric.id} requires field and weightField for WEIGHTED_AVG`);
      }
      const numExpr = filterCondition
        ? `SUM(CASE WHEN ${filterCondition} THEN TRY_CAST(${col} AS DOUBLE) * TRY_CAST(${weight} AS DOUBLE) ELSE 0.0 END)`
        : `SUM(TRY_CAST(${col} AS DOUBLE) * TRY_CAST(${weight} AS DOUBLE))`;
      const denExpr = filterCondition
        ? `SUM(CASE WHEN ${filterCondition} THEN TRY_CAST(${weight} AS DOUBLE) ELSE 0.0 END)`
        : `SUM(TRY_CAST(${weight} AS DOUBLE))`;
      return `CASE WHEN COALESCE(${denExpr}, 0.0) > 0 THEN (${numExpr} * 1.0) / ${denExpr} ELSE 0.0 END AS ${alias}`;
    }

    case 'min':
      if (!col) throw new Error(`Metric ${metric.id} requires field for MIN`);
      if (filterCondition) {
        return `MIN(CASE WHEN ${filterCondition} THEN TRY_CAST(${col} AS DOUBLE) END) AS ${alias}`;
      }
      return `MIN(TRY_CAST(${col} AS DOUBLE)) AS ${alias}`;

    case 'max':
      if (!col) throw new Error(`Metric ${metric.id} requires field for MAX`);
      if (filterCondition) {
        return `MAX(CASE WHEN ${filterCondition} THEN TRY_CAST(${col} AS DOUBLE) END) AS ${alias}`;
      }
      return `MAX(TRY_CAST(${col} AS DOUBLE)) AS ${alias}`;

    case 'median':
      if (!col) throw new Error(`Metric ${metric.id} requires field for MEDIAN`);
      if (filterCondition) {
        return `MEDIAN(CASE WHEN ${filterCondition} THEN TRY_CAST(${col} AS DOUBLE) END) AS ${alias}`;
      }
      return `MEDIAN(TRY_CAST(${col} AS DOUBLE)) AS ${alias}`;

    case 'percentile': {
      if (!col) throw new Error(`Metric ${metric.id} requires field for PERCENTILE`);
      const p = typeof metric.percentile === 'number' ? Math.max(0, Math.min(1, metric.percentile)) : 0.5;
      if (filterCondition) {
        return `QUANTILE_CONT(CASE WHEN ${filterCondition} THEN TRY_CAST(${col} AS DOUBLE) END, ${p}) AS ${alias}`;
      }
      return `QUANTILE_CONT(TRY_CAST(${col} AS DOUBLE), ${p}) AS ${alias}`;
    }

    case 'durationBetween': {
      if (!startCol || !endCol) {
        throw new Error(`Metric ${metric.id} requires startField and endField for DURATION_BETWEEN`);
      }
      let divisor = 3600.0; // default hours
      if (metric.durationUnit === 'days') divisor = 86400.0;
      else if (metric.durationUnit === 'minutes') divisor = 60.0;
      else if (metric.durationUnit === 'seconds') divisor = 1.0;

      const baseCond = `${startCol} IS NOT NULL AND ${endCol} IS NOT NULL`;
      const fullCond = filterCondition ? `${filterCondition} AND ${baseCond}` : baseCond;
      const diffSec = `(EPOCH(TRY_CAST(${endCol} AS TIMESTAMP)) - EPOCH(TRY_CAST(${startCol} AS TIMESTAMP)))`;
      return `AVG(CASE WHEN ${fullCond} THEN (${diffSec} / ${divisor}) END) AS ${alias}`;
    }

    case 'ratio': {
      if (!col || !denom) {
        throw new Error(`Ratio metric ${metric.id} requires both field and denominatorField`);
      }
      const numExpr = filterCondition
        ? `COALESCE(SUM(CASE WHEN ${filterCondition} THEN TRY_CAST(${col} AS DOUBLE) ELSE 0.0 END), 0.0)`
        : `COALESCE(SUM(TRY_CAST(${col} AS DOUBLE)), 0.0)`;
      const denExpr = filterCondition
        ? `COALESCE(SUM(CASE WHEN ${filterCondition} THEN TRY_CAST(${denom} AS DOUBLE) ELSE 0.0 END), 0.0)`
        : `COALESCE(SUM(TRY_CAST(${denom} AS DOUBLE)), 0.0)`;
      return `CASE WHEN ${denExpr} > 0 THEN (${numExpr} * 1.0) / ${denExpr} ELSE 0.0 END AS ${alias}`;
    }

    default:
      throw new Error(`Unsupported metric operation: ${metric.operation}`);
  }
}

export function compileQueryPlanToSql(plan: QueryPlan): string {
  const table = quoteIdent(plan.tableName);
  const selectParts: string[] = [];
  const groupByCols: string[] = [];

  // Group By columns
  if (plan.groupBy && plan.groupBy.length > 0) {
    for (const g of plan.groupBy) {
      if (typeof g === 'string') {
        const quoted = quoteIdent(g);
        selectParts.push(quoted);
        groupByCols.push(quoted);
      } else if (g && typeof g === 'object') {
        const quotedField = quoteIdent(g.field);
        const alias = quoteIdent(g.alias || g.field);
        if (g.timeBucket) {
          const truncExpr = `DATE_TRUNC('${g.timeBucket}', CAST(${quotedField} AS TIMESTAMP))`;
          selectParts.push(`${truncExpr} AS ${alias}`);
          groupByCols.push(truncExpr);
        } else {
          selectParts.push(`${quotedField} AS ${alias}`);
          groupByCols.push(quotedField);
        }
      }
    }
  }

  // Metrics
  for (const m of plan.metrics) {
    selectParts.push(compileMetricExpression(m));
  }

  let sql = `SELECT ${selectParts.join(', ')} FROM ${table}`;

  // Global Plan Filters
  if (plan.filters && plan.filters.length > 0) {
    const whereClause = plan.filters.map(compileFilterClause).join(' AND ');
    sql += ` WHERE ${whereClause}`;
  }

  // Group By
  if (groupByCols.length > 0) {
    sql += ` GROUP BY ${groupByCols.join(', ')}`;
  }

  // Sort
  if (plan.sort && plan.sort.length > 0) {
    const sortClause = plan.sort.map((s) => `${quoteIdent(s.field)} ${s.direction.toUpperCase()}`).join(', ');
    sql += ` ORDER BY ${sortClause}`;
  }

  // Limit
  if (typeof plan.limit === 'number' && plan.limit > 0) {
    sql += ` LIMIT ${Math.floor(plan.limit)}`;
  }

  return sql;
}
