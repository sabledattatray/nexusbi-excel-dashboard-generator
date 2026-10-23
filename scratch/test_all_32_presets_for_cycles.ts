import fs from 'fs';
import path from 'path';
import { generateRealisticDataset, INDUSTRY_PRESETS } from '../src/utils/dataGenerator';
import { exportToProfessionalExcel } from '../src/utils/excelExporter';
import { IndustryType } from '../src/types/dataset';
import { execSync } from 'child_process';

async function main() {
  const industries = Object.keys(INDUSTRY_PRESETS) as IndustryType[];
  console.log(`Testing all ${industries.length} built-in templates for circular references...`);
  const outDir = path.resolve('scratch', 'presets_test');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const failedPresets: string[] = [];

  for (const industry of industries) {
    const dataset = generateRealisticDataset({
      companyName: `${industry.toUpperCase()} Inc`,
      reportTitle: `${industry} Executive Report`,
      industry,
      includeChartsInExcel: true,
      useLiveExcelFormulas: true,
      recordCount: 80,
      currency: 'USD',
      currencySymbol: '$',
    });

    const { blob, filename } = await exportToProfessionalExcel(dataset, dataset.config);
    const buffer = Buffer.from(await blob.arrayBuffer());
    const filePath = path.join(outDir, `${industry}.xlsx`);
    fs.writeFileSync(filePath, buffer);

    // Run python circular checker
    try {
      const output = execSync(`python scratch/check_circular.py "${filePath}"`, { encoding: 'utf-8' });
      if (output.includes('CYCLE DETECTED') || !output.includes('Total cycles detected: 0')) {
        console.error(`[FAIL] ${industry}: Cycle detected!`);
        console.error(output);
        failedPresets.push(industry);
      } else {
        console.log(`[PASS] ${industry}: 0 cycles`);
      }
    } catch (e: any) {
      console.error(`[ERR] ${industry}: ${e.message}`);
      failedPresets.push(industry);
    }
  }

  console.log('\n' + '='.repeat(60));
  if (failedPresets.length === 0) {
    console.log(`SUCCESS: ALL ${industries.length} INBUILT PRESETS HAVE 0 CIRCULAR REFERENCES!`);
  } else {
    console.error(`FAILED: ${failedPresets.length} presets had cycles:`, failedPresets);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
