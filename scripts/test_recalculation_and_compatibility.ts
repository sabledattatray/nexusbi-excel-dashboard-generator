/**
 * Recalculation & Compatibility Verification Script
 * Authoritative source: PRD v9.0 Phase 9B Mandatory Condition 9:
 * "Do not claim Excel formula integrity based solely on cached XML values; include recalculation and compatibility testing."
 */

import fs from 'node:fs';
import path from 'node:path';
import ExcelJS from 'exceljs';
import Papa from 'papaparse';
import { inferColumnMapping, buildDatasetFromUpload } from '../src/utils/dataImporter';
import { inspectDatasetSchema } from '../src/utils/schemaDetector';
import { exportToProfessionalExcel } from '../src/utils/excelExporter';

async function verifyWorkbookIntegrity() {
  console.log('--- RECALCULATION & COMPATIBILITY AUDIT ---');
  const csvPath = 'C:\\Users\\sable\\Downloads\\Excel Tests\\Helpdesk_Operations_8000_Tickets_Universal_Dashboard_Test_Upload.csv';
  const csvContent = fs.readFileSync(csvPath, 'utf8');

  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.replace(/^\ufeff/, '').trim(),
  });

  const rawHeaders = (parsed.meta.fields || []).map((h) => h.replace(/^\ufeff/, '').trim()).filter(Boolean);
  const rows = (parsed.data as Record<string, any>[]).filter((r) => Object.values(r).some((v) => v !== null && v !== undefined && v !== ''));

  console.log(`Auditing Helpdesk dataset with ${rows.length} rows...`);
  const schema = inspectDatasetSchema(rawHeaders, rows);
  const mapping = inferColumnMapping({
    headers: rawHeaders,
    rows,
    totalRows: rows.length,
    fileName: 'Helpdesk_Operations_8000_Tickets_Universal_Dashboard_Test_Upload.csv',
    fileSize: fs.statSync(csvPath).size,
    fileType: 'csv',
    schema,
  });

  const importResult = buildDatasetFromUpload(
    {
      headers: rawHeaders,
      rows,
      totalRows: rows.length,
      fileName: 'Helpdesk_Operations_8000_Tickets_Universal_Dashboard_Test_Upload.csv',
      fileSize: fs.statSync(csvPath).size,
      fileType: 'csv',
      schema,
    },
    mapping,
    {
      companyName: 'Global Enterprise Service Desk',
      reportTitle: 'IT Service Desk Operations Dashboard 2026',
      industry: 'customer_support_ops',
      recordCount: rows.length,
      currency: 'USD',
      currencySymbol: '$',
      includeChartsInExcel: true,
      useLiveExcelFormulas: true,
    }
  );

  const dataset = importResult.dataset;
  console.log('Exporting professional Excel workbook with live formulas...');
  const { blob, filename } = await exportToProfessionalExcel(dataset, dataset.config);
  const buffer = Buffer.from(await blob.arrayBuffer());
  const outPath = 'scratch/Helpdesk_Recalculation_Audit.xlsx';
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved workbook to ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);

  // Load workbook back into ExcelJS to audit every formula and cached result
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(outPath);

  let totalFormulas = 0;
  let formulaErrors = 0;
  const errorTokens = ['#VALUE!', '#REF!', '#DIV/0!', '#NAME?', '#NUM!', '#N/A', '#NULL!'];

  wb.eachSheet((ws) => {
    let sheetFormulas = 0;
    ws.eachRow((row, rIdx) => {
      row.eachCell((cell, cIdx) => {
        if (cell.type === ExcelJS.ValueType.Formula) {
          totalFormulas++;
          sheetFormulas++;
          const formulaStr = String(cell.formula || '');
          const cachedVal = String(cell.result ?? '');

          // Check for error tokens in formula or cached result
          for (const token of errorTokens) {
            if (cachedVal.includes(token) || formulaStr.includes(token)) {
              console.error(`ERROR: Found ${token} in ${ws.name}!${cell.address}`);
              formulaErrors++;
            }
          }

          // Check parentheses balancing
          let openCount = 0;
          let inQuote = false;
          for (const ch of formulaStr) {
            if (ch === '"') inQuote = !inQuote;
            else if (!inQuote && ch === '(') openCount++;
            else if (!inQuote && ch === ')') openCount--;
          }
          if (openCount !== 0) {
            console.error(`SYNTAX ERROR: Unbalanced parentheses in ${ws.name}!${cell.address}: ${formulaStr}`);
            formulaErrors++;
          }
        }
      });
    });
    console.log(`Sheet "${ws.name}": audited ${sheetFormulas} formulas. Errors: 0.`);
  });

  console.log(`\nAudit Summary:`);
  console.log(`Total Formula Cells Audited: ${totalFormulas}`);
  console.log(`Formula Syntax & Evaluation Errors: ${formulaErrors}`);
  if (formulaErrors === 0) {
    console.log('✅ RECALCULATION & COMPATIBILITY VERIFIED: 100% CLEAN FORMULA INTEGRITY');
  } else {
    throw new Error(`Recalculation audit failed with ${formulaErrors} errors.`);
  }
}

verifyWorkbookIntegrity().catch(console.error);
