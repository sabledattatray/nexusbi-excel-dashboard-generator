import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
await build({ entryPoints: ['tests/readiness.test.ts'], outfile: '.prerender/readiness.test.mjs', bundle: true, platform: 'node', packages: 'external', format: 'esm' });
const result = spawnSync(process.execPath, ['--test', '.prerender/readiness.test.mjs'], { stdio: 'inherit' });
process.exitCode = result.status ?? 1;
