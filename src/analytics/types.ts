/**
 * Analytics Engine Abstraction & Data Contracts
 * Authoritative source: PRD v9.0 Section 03 & 04
 */

export type OperationType =
  | 'count'
  | 'countRows'
  | 'countDistinct'
  | 'sum'
  | 'average'
  | 'weightedAvg'
  | 'ratio'
  | 'median'
  | 'percentile'
  | 'min'
  | 'max'
  | 'durationBetween';

export type TimeGrain = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface FilterClause {
  field: string;
  operator: 'eq' | 'neq' | 'in' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'is_null' | 'is_not_null';
  value?: any;
}

export interface MetricQuery {
  id: string;
  label: string;
  operation: OperationType;
  field?: string;
  denominatorField?: string;
  weightField?: string;
  startField?: string;
  endField?: string;
  percentile?: number; // 0.0 to 1.0 (e.g. 0.95 for p95)
  durationUnit?: 'hours' | 'days' | 'minutes' | 'seconds';
  denominatorRule?: string;
  filters?: FilterClause[];
}

export interface GroupBySpec {
  field: string;
  timeBucket?: TimeGrain;
  alias?: string;
}

export interface TopNSpec {
  field: string;
  metricId: string;
  limit: number;
  direction?: 'asc' | 'desc';
  includeOther?: boolean;
  otherLabel?: string;
}

export interface QueryPlan {
  planId: string;
  tableName: string;
  metrics: MetricQuery[];
  groupBy?: (string | GroupBySpec)[];
  filters?: FilterClause[];
  sort?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
  topN?: TopNSpec;
}

export interface ExecutionResult {
  planId: string;
  engineId: string;
  engineVersion: string;
  metrics: Record<string, number>;
  groupedRows?: Record<string, any>[];
  executionMs: number;
  rowCounts: {
    scanned: number;
    eligible: number;
    returned: number;
  };
  diagnostics?: {
    sql?: string;
    usedFallback?: boolean;
    fallbackReason?: string;
    semanticRoleValidation?: Record<string, boolean>;
    rejectedProposals?: string[];
  };
}

export interface ParityEvidence {
  metricId: string;
  v8BaselineValue: number;
  duckdbValue: number;
  delta: number;
  tolerance: number;
  status: 'PASS' | 'FAIL';
  discrepancyNote?: string;
}

export interface AnalyticsEngine {
  readonly id: string;
  readonly version: string;
  isAvailable(): Promise<boolean>;
  registerDataset(tableName: string, data: Record<string, any>[] | string | Uint8Array): Promise<void>;
  execute(plan: QueryPlan): Promise<ExecutionResult>;
  dispose(): Promise<void>;
}
