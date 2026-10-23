/**
 * Analytics Engine Manager & Dispatcher
 * Authoritative source: PRD v9.0 Section 02, 03, 04
 *
 * Responsibilities:
 * 1. Resolves active engine based on feature flags (default: v8-javascript).
 * 2. Implements graceful fallback: any DuckDB error automatically falls back to v8.
 * 3. Supports dual-engine parity validation with configurable tolerance.
 * 4. Ensures 0 telemetry, 0 external CDN calls, 100% browser-local execution.
 */

import { AnalyticsEngine, QueryPlan, ExecutionResult, ParityEvidence } from './types';
import { getFeatureFlags } from './featureFlags';
import { V8JavaScriptEngine } from './v8Engine';
import { DuckDBEngine } from './duckdb/duckdbEngine';

let cachedV8Engine: V8JavaScriptEngine | null = null;
let cachedDuckDBEngine: DuckDBEngine | null = null;

export function getV8Engine(): V8JavaScriptEngine {
  if (!cachedV8Engine) {
    cachedV8Engine = new V8JavaScriptEngine();
  }
  return cachedV8Engine;
}

export function getDuckDBEngine(): DuckDBEngine {
  if (!cachedDuckDBEngine) {
    cachedDuckDBEngine = new DuckDBEngine();
  }
  return cachedDuckDBEngine;
}

export async function executeAnalytics(
  plan: QueryPlan,
  data: Record<string, any>[] | string | Uint8Array,
  options?: { signal?: AbortSignal; timeoutMs?: number }
): Promise<{
  result: ExecutionResult;
  parity?: ParityEvidence[];
}> {
  if (options?.signal?.aborted) {
    throw new Error('Analytics execution aborted by client cancellation token');
  }

  const flags = getFeatureFlags();
  const v8 = getV8Engine();

  // If DuckDB is NOT enabled, run purely on v8 (canonical default)
  if (!flags.duckdbEngineEnabled) {
    if (Array.isArray(data)) {
      await v8.registerDataset(plan.tableName, data);
    } else {
      throw new Error('V8 engine requires array of row objects');
    }
    if (options?.signal?.aborted) {
      throw new Error('Analytics execution aborted by client cancellation token');
    }
    const result = await v8.execute(plan);
    return { result };
  }

  // DuckDB is explicitly enabled via feature flag
  const duckdb = getDuckDBEngine();
  let duckdbResult: ExecutionResult | null = null;
  let duckdbError: any = null;

  try {
    if (options?.signal?.aborted) {
      throw new Error('Analytics execution aborted by client cancellation token');
    }
    await duckdb.registerDataset(plan.tableName, data);

    const timeoutMs = options?.timeoutMs || 30_000;
    const executePromise = duckdb.execute(plan);
    let timer: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`DuckDB worker execution exceeded ${timeoutMs}ms timeout guard`)), timeoutMs);
    });

    duckdbResult = await Promise.race([executePromise, timeoutPromise]);
    clearTimeout(timer);
  } catch (err: any) {
    duckdbError = err;
    console.warn(`[DuckDB Engine Warning] Execution failed, falling back to V8 baseline:`, err.message || err);
  }

  // If DuckDB failed, fallback to v8
  if (!duckdbResult || duckdbError) {
    if (Array.isArray(data)) {
      await v8.registerDataset(plan.tableName, data);
    }
    const fallbackResult = await v8.execute(plan);
    fallbackResult.diagnostics = {
      ...fallbackResult.diagnostics,
      usedFallback: true,
      fallbackReason: duckdbError?.message || 'DuckDB execution failure',
    };
    return { result: fallbackResult };
  }

  // If Dual-Engine Parity Validation is requested
  let parityEvidence: ParityEvidence[] | undefined;
  if (flags.dualEngineParityValidation && Array.isArray(data)) {
    await v8.registerDataset(plan.tableName, data);
    const v8Result = await v8.execute(plan);

    parityEvidence = [];
    let hasParityFailure = false;

    for (const metric of plan.metrics) {
      const v8Val = v8Result.metrics[metric.id] ?? 0;
      const duckVal = duckdbResult.metrics[metric.id] ?? 0;
      const delta = Math.abs(v8Val - duckVal);
      const tolerance = flags.parityToleranceRatio;
      const pass = delta <= tolerance || (v8Val !== 0 && delta / Math.abs(v8Val) <= tolerance);

      if (!pass) {
        hasParityFailure = true;
      }

      parityEvidence.push({
        metricId: metric.id,
        v8BaselineValue: v8Val,
        duckdbValue: duckVal,
        delta,
        tolerance,
        status: pass ? 'PASS' : 'FAIL',
        discrepancyNote: pass ? undefined : `Delta ${delta} exceeds tolerance ${tolerance}`,
      });
    }

    // If parity failed on any metric, fallback to v8 baseline for safety
    if (hasParityFailure) {
      console.warn('[EngineManager Parity Warning] Discrepancy detected between DuckDB and v8 baseline. Using v8 result.');
      v8Result.diagnostics = {
        ...v8Result.diagnostics,
        usedFallback: true,
        fallbackReason: 'Parity check failed against v8 baseline',
      };
      return { result: v8Result, parity: parityEvidence };
    }
  }

  return { result: duckdbResult, parity: parityEvidence };
}

export async function disposeEngines(): Promise<void> {
  if (cachedV8Engine) {
    await cachedV8Engine.dispose();
    cachedV8Engine = null;
  }
  if (cachedDuckDBEngine) {
    await cachedDuckDBEngine.dispose();
    cachedDuckDBEngine = null;
  }
}
