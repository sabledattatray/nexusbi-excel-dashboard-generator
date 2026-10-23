import fs from 'fs';
import Papa from 'papaparse';
import { profileDataset } from '../src/analytics/profiler/datasetProfiler';
import { detectSemanticRoles } from '../src/analytics/profiler/semanticDetector';
import { resolveDomainRulePack } from '../src/analytics/rules/rulePacks';
import { composeUniversalDashboard } from '../src/analytics/composer/dashboardComposer';

async function main() {
  const filePath = 'D:/Datasets/hospital_billing_data_5000.csv';
  const text = fs.readFileSync(filePath, 'utf-8');
  const parsed = Papa.parse<Record<string, any>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
  });

  const headers = (parsed.meta.fields || []).map((h) => h.replace(/^\ufeff/, '').trim());
  const profile = profileDataset(headers, parsed.data);
  const semantics = detectSemanticRoles(profile);
  const rulePack = resolveDomainRulePack(profile, semantics);
  const model = await composeUniversalDashboard('hospital_billing_data', parsed.data, profile, semantics, rulePack);

  console.log('======================================================');
  console.log('DASHBOARD TITLE:', model.dashboardTitle);
  console.log('DOMAIN:', model.domainClassification);
  console.log('======================================================');

  console.log('\n--- KPI CARDS ---');
  for (const k of model.kpiCards) {
    console.log(`  * ${k.label.padEnd(30)} = ${k.formattedValue.padStart(15)}  [${k.calculationFormula}]`);
  }

  console.log('\n--- CHARTS ---');
  for (const c of model.charts) {
    console.log(`  * Chart: "${c.title}" (${c.chartType}) -> Metric: ${c.metricLabel}`);
    console.log(`    Points (top 3):`, c.data.slice(0, 3));
  }

  console.log('\n--- MANAGEMENT DECISION BRIEF ---');
  console.log('Headline:', model.decisionBrief.headline);
  for (const b of model.decisionBrief.executiveBullets) {
    console.log(`  • ${b.title}: ${b.text}`);
  }

  console.log('\n--- ACTION QUEUE ---');
  console.log('Total Action Items:', model.actionQueue.length);
  for (const a of model.actionQueue.slice(0, 5)) {
    console.log(`  #${a.rank} [${a.priority}] ${a.entityId} (Status: ${a.status}, Score: ${a.urgencyScore}) -> ${a.reason}`);
  }
}

main().catch(console.error);
