import fs from 'fs';
import Papa from 'papaparse';
import { profileDataset } from '../src/analytics/profiler/datasetProfiler';
import { detectSemanticRoles } from '../src/analytics/profiler/semanticDetector';
import { resolveDomainRulePack } from '../src/analytics/rules/rulePacks';

const filePath = 'D:/Datasets/hospital_billing_data_5000.csv';
const text = fs.readFileSync(filePath, 'utf-8');
const parsed = Papa.parse<Record<string, any>>(text, {
  header: true,
  dynamicTyping: false,
  skipEmptyLines: 'greedy',
});

console.log('Total rows:', parsed.data.length);
console.log('Total columns:', parsed.meta.fields?.length);

const headers = (parsed.meta.fields || []).map((h) => h.replace(/^\ufeff/, '').trim());
const profile = profileDataset(headers, parsed.data);
const semantics = detectSemanticRoles(profile);
const rulePack = resolveDomainRulePack(profile, semantics);

console.log('\n--- DETECTED SEMANTIC MODEL ---');
console.log('Primary Identifier:', semantics.primaryIdentifier);
console.log('Primary Date:', semantics.primaryDate);
console.log('Secondary Date:', semantics.secondaryDate);
console.log('Primary Metric:', semantics.primaryMetric);
console.log('Secondary Metric:', semantics.secondaryMetric);
console.log('Volume Metric:', semantics.volumeMetric);
console.log('Rate Metric:', semantics.rateMetric);
console.log('Primary Dimension:', semantics.primaryDimension);
console.log('Status Column:', semantics.statusColumn);
console.log('Location Column:', semantics.locationColumn);
console.log('Domain Rule Pack:', rulePack.name);

console.log('\n--- COLUMN PROFILES (FIRST 25) ---');
for (let i = 0; i < Math.min(profile.columns.length, 25); i++) {
  const c = profile.columns[i];
  console.log(`${c.name.padEnd(25)} dataType=${c.dataType.padEnd(12)} unique=${c.isUnique} cardRatio=${c.cardinalityRatio.toFixed(3)} sample=[${c.sampleValues.slice(0, 2).join(', ')}]`);
}

console.log('\n--- COLUMN PROFILES (REMAINING NUMERICS) ---');
for (let i = 25; i < profile.columns.length; i++) {
  const c = profile.columns[i];
  if (['integer', 'float', 'currency', 'percentage'].includes(c.dataType)) {
    console.log(`${c.name.padEnd(30)} dataType=${c.dataType.padEnd(12)} sum=${c.stats?.sum} mean=${c.stats?.mean?.toFixed(1)} sample=[${c.sampleValues.slice(0, 2).join(', ')}]`);
  }
}
