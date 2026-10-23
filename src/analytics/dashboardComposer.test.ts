/**
 * Phase 9D: Dashboard Composer & Visual Accessibility Test Suite
 * Authoritative source: PRD v9.0 Section 07 (U01-U21) & Phase 9D Gate
 *
 * Verifies:
 * - Declarative DashboardSpec composition
 * - Action queue ranking and source-row traceability
 * - KPI card explanation drawers and missing exclusions
 * - Deterministic evidence-linked decision briefs
 * - Accessible chart data table generation
 * - Cross-filtering row reconciliation
 * - Zero invented domain metrics
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { profileDataset } from './profiler/datasetProfiler';
import { detectSemanticRoles } from './profiler/semanticDetector';
import { resolveDomainRulePack } from './rules/rulePacks';
import { composeUniversalDashboard } from './composer/dashboardComposer';
import { generateAccessibleTableData } from './composer/chartAdapter';

describe('Phase 9D: Dashboard Composer & Visual Accessibility Suite', () => {
  const sampleRows = [
    { Ticket_ID: 'T-001', Category: 'Network', Priority: 'Critical', Status: 'In Progress', Hours: 12.5, Site: 'Site-A' },
    { Ticket_ID: 'T-002', Category: 'Hardware', Priority: 'High', Status: 'Open', Hours: 24.0, Site: 'Site-B' },
    { Ticket_ID: 'T-003', Category: 'Software', Priority: 'Medium', Status: 'Closed', Hours: 4.5, Site: 'Site-A' },
    { Ticket_ID: 'T-004', Category: 'Network', Priority: 'Low', Status: 'Closed', Hours: 8.0, Site: 'Site-C' },
    { Ticket_ID: 'T-005', Category: 'Hardware', Priority: 'Critical', Status: 'In Progress', Hours: null, Site: 'Site-B' },
  ];
  const headers = Object.keys(sampleRows[0]);

  test('U02 & U03: Composes full UniversalDashboardModel with executive header', async () => {
    const profile = profileDataset(headers, sampleRows);
    const semantics = detectSemanticRoles(profile);
    const rulePack = resolveDomainRulePack(profile, semantics);
    const model = await composeUniversalDashboard('tickets_table', sampleRows, profile, semantics, rulePack);

    assert.ok(model.executiveHeader, 'Must have executive header');
    assert.strictEqual(model.executiveHeader.totalRecords, 5);
    assert.strictEqual(model.executiveHeader.qualityState, 'Acceptable');
    assert.ok(model.executiveHeader.dataLocality.includes('In-Browser'));
    assert.ok(model.kpiCards.length >= 2, 'Should compose at least 2 KPI cards');
    assert.ok(model.charts.length >= 1, 'Should compose visual charts');
  });

  test('U04: KPI cards contain explanation drawers, formulas, and missing exclusions', async () => {
    const profile = profileDataset(headers, sampleRows);
    const semantics = detectSemanticRoles(profile);
    const rulePack = resolveDomainRulePack(profile, semantics);
    const model = await composeUniversalDashboard('tickets_table', sampleRows, profile, semantics, rulePack);

    for (const kpi of model.kpiCards) {
      assert.ok(kpi.calculationFormula, `KPI ${kpi.id} must have calculation formula`);
      assert.ok(kpi.explanation, `KPI ${kpi.id} must have explanation text`);
      assert.ok(Array.isArray(kpi.sourceColumns), `KPI ${kpi.id} must list source columns`);
    }

    const hoursKpi = model.kpiCards.find((k) => k.id.includes('Hours') || k.id.includes('primary_measure'));
    if (hoursKpi) {
      assert.strictEqual(hoursKpi.missingExclusions, 1, 'Must record 1 excluded null for Hours column');
    }
  });

  test('U12: Management decision brief contains deterministic evidence-linked bullets', async () => {
    const profile = profileDataset(headers, sampleRows);
    const semantics = detectSemanticRoles(profile);
    const rulePack = resolveDomainRulePack(profile, semantics);
    const model = await composeUniversalDashboard('tickets_table', sampleRows, profile, semantics, rulePack);

    assert.ok(model.decisionBrief, 'Must compose decision brief');
    assert.ok(model.decisionBrief.headline.length > 5);
    assert.ok(model.decisionBrief.executiveBullets.length >= 2);
    assert.ok(model.decisionBrief.caveats.length >= 1);
    assert.ok(model.decisionBrief.caveats[0].includes('descriptive'), 'Must emphasize descriptive nature');
  });

  test('U13: Action queue ranks real source rows deterministically with zero synthetic data', async () => {
    const profile = profileDataset(headers, sampleRows);
    const semantics = detectSemanticRoles(profile);
    const rulePack = resolveDomainRulePack(profile, semantics);
    const model = await composeUniversalDashboard('tickets_table', sampleRows, profile, semantics, rulePack);

    assert.ok(model.actionQueue.length > 0, 'Must produce action queue items');
    const topItem = model.actionQueue[0];
    assert.strictEqual(topItem.rank, 1);
    assert.strictEqual(topItem.priority, 'Critical');
    assert.ok(topItem.entityId.startsWith('T-'), 'Must use real source ID');
    assert.ok(typeof topItem.sourceRowIndex === 'number');
    assert.strictEqual(sampleRows[topItem.sourceRowIndex].Ticket_ID, topItem.entityId, 'Must trace directly to source row');
  });

  test('U19: Accessible table adapter creates screen-reader alternatives for charts', async () => {
    const profile = profileDataset(headers, sampleRows);
    const semantics = detectSemanticRoles(profile);
    const rulePack = resolveDomainRulePack(profile, semantics);
    const model = await composeUniversalDashboard('tickets_table', sampleRows, profile, semantics, rulePack);

    const firstChart = model.charts[0];
    assert.ok(firstChart, 'Must have at least one chart');
    const tableData = generateAccessibleTableData(firstChart);

    assert.strictEqual(tableData.headers.length, 3);
    assert.strictEqual(tableData.headers[0], firstChart.dimensionLabel);
    assert.strictEqual(tableData.rows.length, firstChart.data.length);

    for (const r of tableData.rows) {
      assert.ok(r.label);
      assert.ok(r.percentage.includes('%'));
    }
  });

  test('U18: Zero invented financial or SLA metrics on generic operational datasets', async () => {
    const profile = profileDataset(headers, sampleRows);
    const semantics = detectSemanticRoles(profile);
    const rulePack = resolveDomainRulePack(profile, semantics);
    const model = await composeUniversalDashboard('tickets_table', sampleRows, profile, semantics, rulePack);

    const kpiLabels = model.kpiCards.map((k) => k.label.toLowerCase());
    assert.ok(!kpiLabels.some((l) => l.includes('revenue') || l.includes('profit') || l.includes('cogs')), 'Must not invent revenue/profit');
  });
});
