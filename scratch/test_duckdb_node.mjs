import path from 'path';
import * as duckdb from '@duckdb/duckdb-wasm/dist/duckdb-node-blocking.cjs';

async function main() {
  const dist = path.resolve('node_modules/@duckdb/duckdb-wasm/dist');
  const DUCKDB_BUNDLES = {
    mvp: {
      mainModule: path.resolve(dist, 'duckdb-mvp.wasm'),
      mainWorker: path.resolve(dist, 'duckdb-node-mvp.worker.cjs'),
    },
    eh: {
      mainModule: path.resolve(dist, 'duckdb-eh.wasm'),
      mainWorker: path.resolve(dist, 'duckdb-node-eh.worker.cjs'),
    },
  };
  const logger = new duckdb.VoidLogger();
  const db = await duckdb.createDuckDB(DUCKDB_BUNDLES, logger, duckdb.NODE_RUNTIME);
  await db.instantiate();
  console.log('DB methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(db)));
  console.log('DB bindings methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(db.bindings || {})));
  
  const conn = db.connect();
  console.log('Conn methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(conn)));
  conn.close();
}

main().catch(console.error);
