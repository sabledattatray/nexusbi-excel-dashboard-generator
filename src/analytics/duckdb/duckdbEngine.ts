/**
 * DuckDB-Wasm Analytics Engine Implementation
 * Authoritative source: PRD v9.0 Section 03, 04, 06
 *
 * Implements local-in-browser analytical execution with safe SQL compilation,
 * zero external CDN dependencies, strict memory safeguards, and dual-mode
 * initialization (browser AsyncDuckDB and Node synchronous blocking bindings).
 */

import { AnalyticsEngine, QueryPlan, ExecutionResult } from '../types';
import { compileQueryPlanToSql } from '../compiler/astToSql';
import { getFeatureFlags } from '../featureFlags';

export class DuckDBEngine implements AnalyticsEngine {
  readonly id = 'duckdb-wasm';
  readonly version = '1.33.1-dev57.0';

  private dbInstance: any = null;
  private connection: any = null;
  private isInitialized = false;
  private registeredTables: Set<string> = new Set();
  private totalRegisteredBytes = 0;

  private isNodeEnvironment(): boolean {
    return (
      typeof process !== 'undefined' &&
      process.versions != null &&
      process.versions.node != null &&
      typeof window === 'undefined'
    );
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      return this.connection !== null;
    } catch {
      return false;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized && this.connection) {
      return;
    }

    if (this.isNodeEnvironment()) {
      // Node.js environment (for tests, benchmarks, and SSR)
      const pathModule = await import('path');
      const duckdbNode = await import('@duckdb/duckdb-wasm/dist/duckdb-node-blocking.cjs');
      const dist = pathModule.resolve('node_modules/@duckdb/duckdb-wasm/dist');

      const DUCKDB_BUNDLES = {
        mvp: {
          mainModule: pathModule.resolve(dist, 'duckdb-mvp.wasm'),
          mainWorker: pathModule.resolve(dist, 'duckdb-node-mvp.worker.cjs'),
        },
        eh: {
          mainModule: pathModule.resolve(dist, 'duckdb-eh.wasm'),
          mainWorker: pathModule.resolve(dist, 'duckdb-node-eh.worker.cjs'),
        },
      };

      const logger = new duckdbNode.VoidLogger();
      this.dbInstance = await duckdbNode.createDuckDB(DUCKDB_BUNDLES, logger, duckdbNode.NODE_RUNTIME);
      await this.dbInstance.instantiate();
      this.connection = this.dbInstance.connect();
      this.isInitialized = true;
    } else {
      // Browser environment: 100% local, zero CDN dependencies
      const duckdb = await import('@duckdb/duckdb-wasm');
      
      // Select local bundles served from app root / public assets
      const DUCKDB_BUNDLES: any = {
        mvp: {
          mainModule: '/duckdb/duckdb-mvp.wasm',
          mainWorker: '/duckdb/duckdb-browser-mvp.worker.js',
        },
        eh: {
          mainModule: '/duckdb/duckdb-eh.wasm',
          mainWorker: '/duckdb/duckdb-browser-eh.worker.js',
        },
      };

      const bundle = await duckdb.selectBundle(DUCKDB_BUNDLES);
      const worker = new Worker(bundle.mainWorker!);
      const logger = new duckdb.VoidLogger();
      const asyncDb = new duckdb.AsyncDuckDB(logger, worker);
      await asyncDb.instantiate(bundle.mainModule, bundle.pthreadWorker);
      this.dbInstance = asyncDb;
      this.connection = await asyncDb.connect();
      this.isInitialized = true;
    }
  }

  async registerDataset(tableName: string, data: Record<string, any>[] | string | Uint8Array): Promise<void> {
    await this.ensureInitialized();
    const flags = getFeatureFlags();

    // Memory safeguard check
    let estimatedBytes = 0;
    if (typeof data === 'string') {
      estimatedBytes = data.length * 2;
    } else if (data instanceof Uint8Array) {
      estimatedBytes = data.byteLength;
    } else if (Array.isArray(data)) {
      estimatedBytes = data.length * 500; // rough heuristic ~500 bytes per record
    }

    if (this.totalRegisteredBytes + estimatedBytes > flags.maxMemoryCeilingBytes) {
      throw new Error(
        `Memory ceiling exceeded: Attempting to register ${Math.round(
          estimatedBytes / (1024 * 1024)
        )}MB, current usage is ${Math.round(
          this.totalRegisteredBytes / (1024 * 1024)
        )}MB. Limit is ${Math.round(flags.maxMemoryCeilingBytes / (1024 * 1024))}MB.`
      );
    }

    const safeTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '_');
    const fileName = `${safeTableName}_data.json`;

    if (Array.isArray(data)) {
      const jsonText = JSON.stringify(data);
      if (this.dbInstance.registerFileText) {
        await this.dbInstance.registerFileText(fileName, jsonText);
      }
      
      const createTableSql = `CREATE OR REPLACE TABLE "${safeTableName}" AS SELECT * FROM read_json_auto('${fileName}')`;
      if (this.connection.query) {
        await this.connection.query(createTableSql);
      }
    } else if (typeof data === 'string') {
      const csvFileName = `${safeTableName}_data.csv`;
      if (this.dbInstance.registerFileText) {
        await this.dbInstance.registerFileText(csvFileName, data);
      }
      const createTableSql = `CREATE OR REPLACE TABLE "${safeTableName}" AS SELECT * FROM read_csv_auto('${csvFileName}')`;
      if (this.connection.query) {
        await this.connection.query(createTableSql);
      }
    }

    this.registeredTables.add(safeTableName);
    this.totalRegisteredBytes += estimatedBytes;
  }

  async execute(plan: QueryPlan): Promise<ExecutionResult> {
    await this.ensureInitialized();
    const t0 = performance.now();

    const sql = compileQueryPlanToSql(plan);
    const queryRes = await this.connection.query(sql);
    const rows = queryRes.toArray().map((r: any) => r.toJSON());
    const executionMs = performance.now() - t0;

    const processedRows = rows.map((r: any) => {
      const outRow: Record<string, any> = {};
      for (const [k, v] of Object.entries(r)) {
        if (typeof v === 'bigint') {
          outRow[k] = Number(v);
        } else if (typeof v === 'number') {
          outRow[k] = v;
        } else if (v === null || v === undefined) {
          outRow[k] = null;
        } else {
          const num = Number(v);
          outRow[k] = Number.isFinite(num) && typeof v !== 'string' ? num : String(v);
        }
      }
      return outRow;
    });

    let groupedRows = processedRows.length > 1 || (plan.groupBy && plan.groupBy.length > 0) ? processedRows : undefined;

    // Apply Top N + Other rollup if requested on grouped results
    if (groupedRows && plan.topN) {
      const { field, metricId, limit, direction = 'desc', includeOther = true, otherLabel = 'Other' } = plan.topN;
      groupedRows.sort((a: any, b: any) => {
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
            const vals = otherRows.map((r: any) => Number(r[m.id] || 0)).filter(Number.isFinite);
            otherObj[m.id] = vals.reduce((sum: number, v: number) => sum + v, 0);
          }
          topRows.push(otherObj);
        }
        groupedRows = topRows;
      }
    }

    const firstRow = processedRows.length > 0 ? processedRows[0] : {};
    const metrics: Record<string, number> = {};

    for (const [k, v] of Object.entries(firstRow)) {
      if (typeof v === 'number') {
        metrics[k] = v;
      } else if (typeof v === 'bigint') {
        metrics[k] = Number(v);
      } else if (v === null || v === undefined) {
        metrics[k] = 0;
      } else {
        metrics[k] = parseFloat(String(v)) || 0;
      }
    }

    return {
      planId: plan.planId,
      engineId: this.id,
      engineVersion: this.version,
      metrics,
      groupedRows,
      executionMs,
      rowCounts: {
        scanned: 0,
        eligible: 0,
        returned: processedRows.length,
      },
      diagnostics: {
        sql,
        usedFallback: false,
      },
    };
  }

  async dispose(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      if (this.dbInstance) {
        if (typeof this.dbInstance.terminate === 'function') {
          await this.dbInstance.terminate();
        } else if (typeof this.dbInstance.reset === 'function') {
          await this.dbInstance.reset();
        }
        this.dbInstance = null;
      }
    } finally {
      this.registeredTables.clear();
      this.totalRegisteredBytes = 0;
      this.isInitialized = false;
    }
  }
}
