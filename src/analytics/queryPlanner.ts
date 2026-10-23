/**
 * Semantic Query Planner & Validator
 * Authoritative source: PRD v9.0 Section 06 (Q01-Q18)
 *
 * Translates confirmed domain specs, semantic roles, and filter intents into
 * safe, validated QueryPlans with explain diagnostics and rejection policies.
 */

import { QueryPlan, MetricQuery, FilterClause, GroupBySpec, TopNSpec } from './types';
import { isAllowedOperator, quoteIdent } from './compiler/sqlSanitizer';

export interface SemanticValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  remediationHints?: string[];
  plan?: QueryPlan;
  explainSummary?: string;
}

export interface ColumnSchemaMeta {
  name: string;
  dataType: 'numeric' | 'currency' | 'percentage' | 'integer' | 'datetime' | 'text' | 'boolean';
  semanticRole?: string;
  hasNulls?: boolean;
}

export class SemanticQueryPlanner {
  /**
   * Validates and constructs an executable QueryPlan
   */
  static planQuery(
    tableName: string,
    metrics: MetricQuery[],
    options: {
      groupBy?: (string | GroupBySpec)[];
      filters?: FilterClause[];
      sort?: { field: string; direction: 'asc' | 'desc' }[];
      limit?: number;
      topN?: TopNSpec;
      schema?: Record<string, ColumnSchemaMeta>;
    } = {}
  ): SemanticValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const remediationHints: string[] = [];

    // 1. Table name validation
    if (!tableName || tableName.trim() === '') {
      errors.push('Query plan requires a non-empty table name');
    }

    // 2. Metrics validation
    if (!metrics || metrics.length === 0) {
      errors.push('Query plan requires at least one metric query');
    }

    const validatedMetrics: MetricQuery[] = [];
    const metricIds = new Set<string>();

    for (const m of metrics) {
      if (!m.id || m.id.trim() === '') {
        errors.push(`Metric missing valid id: ${JSON.stringify(m)}`);
        continue;
      }
      if (metricIds.has(m.id)) {
        errors.push(`Duplicate metric id detected: ${m.id}`);
        continue;
      }
      metricIds.add(m.id);

      // Operation-specific requirements check
      switch (m.operation) {
        case 'count':
        case 'countRows':
          validatedMetrics.push(m);
          break;

        case 'countDistinct':
        case 'sum':
        case 'average':
        case 'min':
        case 'max':
        case 'median':
        case 'percentile':
          if (!m.field) {
            errors.push(`Metric "${m.id}" with operation "${m.operation}" requires a target field`);
            remediationHints.push(`Assign a column to "field" property for metric ${m.id}`);
          } else if (options.schema && options.schema[m.field]) {
            const colType = options.schema[m.field].dataType;
            if (colType === 'text' && (m.operation === 'sum' || m.operation === 'average' || m.operation === 'median')) {
              errors.push(`Metric "${m.id}" operation "${m.operation}" cannot run on text column "${m.field}"`);
              remediationHints.push(`Select a numeric or currency column instead of text column "${m.field}"`);
            }
          }
          validatedMetrics.push(m);
          break;

        case 'weightedAvg':
          if (!m.field || !m.weightField) {
            errors.push(`Weighted average metric "${m.id}" requires both "field" and "weightField"`);
            remediationHints.push(`Provide weightField for metric ${m.id}`);
          }
          validatedMetrics.push(m);
          break;

        case 'durationBetween':
          if (!m.startField || !m.endField) {
            errors.push(`Duration metric "${m.id}" requires both "startField" and "endField"`);
            remediationHints.push(`Assign start and end timestamp columns to metric ${m.id}`);
          }
          validatedMetrics.push(m);
          break;

        case 'ratio':
          if (!m.field || !m.denominatorField) {
            errors.push(`Ratio metric "${m.id}" requires both "field" and "denominatorField"`);
            remediationHints.push(`Provide denominatorField for ratio calculation in ${m.id}`);
          }
          validatedMetrics.push(m);
          break;

        default:
          errors.push(`Unsupported metric operation "${(m as any).operation}" on metric "${m.id}"`);
      }
    }

    // 3. Filter operators validation
    if (options.filters) {
      for (const f of options.filters) {
        if (!isAllowedOperator(f.operator)) {
          errors.push(`Disallowed filter operator "${f.operator}" on field "${f.field}"`);
        }
      }
    }

    if (errors.length > 0) {
      return {
        valid: false,
        errors,
        warnings,
        remediationHints,
      };
    }

    const plan: QueryPlan = {
      planId: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tableName,
      metrics: validatedMetrics,
      groupBy: options.groupBy,
      filters: options.filters,
      sort: options.sort,
      limit: options.limit,
      topN: options.topN,
    };

    const explainSummary = `Plan [${plan.planId}] on [${tableName}]: ${validatedMetrics.length} metrics, ${
      options.groupBy ? options.groupBy.length : 0
    } group dimensions, ${options.filters ? options.filters.length : 0} filters.`;

    return {
      valid: true,
      errors: [],
      warnings,
      remediationHints,
      plan,
      explainSummary,
    };
  }
}
