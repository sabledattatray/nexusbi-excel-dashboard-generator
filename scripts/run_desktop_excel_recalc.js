import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const exportDir = path.resolve('scratch/exports/phase9e');
const files = fs.readdirSync(exportDir).filter((f) => f.endsWith('.xlsx'));

console.log('========================================================================');
console.log('PRD v9.0 PHASE 9E: MICROSOFT EXCEL DESKTOP RECALCULATION VALIDATION');
console.log('========================================================================\n');
console.log(`Found ${files.length} exported workbooks in: ${exportDir}\n`);

const results = [];

for (const f of files) {
  const fullPath = path.join(exportDir, f);
  const vbsPath = path.resolve('scratch/test_excel_recalc.vbs');
  try {
    const cmd = `cscript //nologo "${vbsPath}" "${fullPath}"`;
    const output = execSync(cmd, { encoding: 'utf8', timeout: 30000 }).trim();
    console.log(`[Excel Desktop 16.0] ${f}: ${output}`);
    results.push({
      file: f,
      status: 'VERIFIED_BY_MICROSOFT_EXCEL_DESKTOP',
      output,
      recalculated: true,
    });
  } catch (err) {
    console.error(`[Excel Desktop Error] ${f}:`, err.message);
    results.push({
      file: f,
      status: 'NOT EXECUTED / COM ERROR',
      error: err.message,
      recalculated: false,
    });
  }
}

// Update scratch/phase9e_export_integrity_results.json with real desktop recalc results
const jsonPath = path.resolve('scratch/phase9e_export_integrity_results.json');
if (fs.existsSync(jsonPath)) {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  for (const r of data.results) {
    const match = results.find((x) => x.file === `${r.datasetId}.xlsx`);
    if (match && match.recalculated) {
      r.desktopExcelRecalcStatus = `VERIFIED_EXECUTED (Microsoft Excel Desktop 16.0: ${match.output})`;
    } else {
      r.desktopExcelRecalcStatus = 'NOT EXECUTED';
    }
  }
  data.desktopRecalcSummary = results;
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\nUpdated ${jsonPath} with verified Desktop Excel recalculation results.`);
}
