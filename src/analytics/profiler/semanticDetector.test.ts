/**
 * Universal Semantic Intelligence Regression Test Suite
 * Authoritative source: PRD v9.0 Phase 9C/9F P0 Semantic Intelligence Verification
 *
 * Verifies:
 * 1. Strict semantic role classification BEFORE metric generation.
 * 2. Absolute prohibition: PHONE, POSTAL_CODE, and numeric IDs can NEVER be additive measures.
 * 3. Exact 5,000-row, 71-column hospital dataset semantic role resolution.
 * 4. Temporal trends and category distributions never use identifier sums.
 * 5. Action queue generated only for genuine exception conditions; omitted otherwise.
 * 6. Adversarial datasets with IMEI, SIM, Postal Codes, Tracking IDs, and zero-measure tables.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import Papa from 'papaparse';
import { profileDataset } from './datasetProfiler';
import { detectSemanticRoles } from './semanticDetector';
import { resolveDomainRulePack } from '../rules/rulePacks';
import { composeUniversalDashboard } from '../composer/dashboardComposer';

describe('Universal Semantic Intelligence Regression Suite (P0 Defect Guard)', () => {
  const hospitalFilePath = 'D:/Datasets/hospital_billing_data_5000.csv';
  const hasHospitalDataset = fs.existsSync(hospitalFilePath);

  test('Mandatory Fix 1-6: Exact 5,000-Row Hospital Dataset Role Classification Audit', { skip: !hasHospitalDataset }, async () => {
    const text = fs.readFileSync(hospitalFilePath, 'utf-8');
    const parsed = Papa.parse<Record<string, any>>(text, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
    });

    const headers = (parsed.meta.fields || []).map((h) => h.replace(/^\ufeff/, '').trim());
    const profile = profileDataset(headers, parsed.data);
    const semantics = detectSemanticRoles(profile);

    // 1. Assert PHONE is strictly classified as identifier
    assert.strictEqual(semantics.columnRoles['PHONE'], 'identifier', 'PHONE must have semantic role identifier');
    assert.strictEqual(semantics.measureAdditivity['PHONE'], 'non_additive', 'PHONE must be non_additive');

    // 2. Assert POSTAL_CODE is strictly classified as identifier
    assert.strictEqual(semantics.columnRoles['POSTAL_CODE'], 'identifier', 'POSTAL_CODE must have semantic role identifier');
    assert.strictEqual(semantics.measureAdditivity['POSTAL_CODE'], 'non_additive', 'POSTAL_CODE must be non_additive');

    // 3. Assert all discrete entity keys are identifiers
    const expectedIds = ['RECORD_ID', 'INVOICE_ID', 'PATIENT_ID', 'HOSPITAL_ID', 'DOCTOR_ID', 'VISIT_ID', 'PHONE', 'EMAIL', 'POSTAL_CODE'];
    for (const idCol of expectedIds) {
      assert.strictEqual(semantics.columnRoles[idCol], 'identifier', `${idCol} must be classified as identifier`);
    }

    // 4. Assert Primary & Secondary Metrics are genuine financial measures (NOT PHONE or POSTAL_CODE)
    assert.notStrictEqual(semantics.primaryMetric, 'PHONE', 'Primary metric CANNOT be PHONE');
    assert.notStrictEqual(semantics.primaryMetric, 'POSTAL_CODE', 'Primary metric CANNOT be POSTAL_CODE');
    assert.notStrictEqual(semantics.secondaryMetric, 'PHONE', 'Secondary metric CANNOT be PHONE');
    assert.notStrictEqual(semantics.secondaryMetric, 'POSTAL_CODE', 'Secondary metric CANNOT be POSTAL_CODE');

    assert.strictEqual(semantics.primaryMetric, 'GROSS_BILL', 'Primary metric must be GROSS_BILL');
    assert.strictEqual(semantics.secondaryMetric, 'NET_BILL', 'Secondary metric must be NET_BILL');

    // 5. Assert Date resolution prioritizes operational event date over demographic date
    assert.strictEqual(semantics.primaryDate, 'ADMISSION_DATE', 'Primary date must be operational ADMISSION_DATE, not DATE_OF_BIRTH');
    assert.notStrictEqual(semantics.primaryDate, 'DATE_OF_BIRTH', 'Demographic date of birth must not be primary date');

    // 6. Assert Dimension resolution
    assert.strictEqual(semantics.primaryDimension, 'DEPARTMENT', 'Primary dimension must be DEPARTMENT');
    assert.strictEqual(semantics.statusColumn, 'PAYMENT_STATUS', 'Status dimension must be PAYMENT_STATUS');
    assert.strictEqual(semantics.locationColumn, 'CITY', 'Location dimension must be CITY');

    // 7. Compose Dashboard and audit KPIs and Charts
    const rulePack = resolveDomainRulePack(profile, semantics);
    const model = await composeUniversalDashboard('hospital_billing', parsed.data, profile, semantics, rulePack);

    // Audit KPI Cards: zero phone or postal code aggregations
    for (const kpi of model.kpiCards) {
      assert.doesNotMatch(kpi.id, /phone/i, `KPI card ${kpi.id} must not aggregate PHONE`);
      assert.doesNotMatch(kpi.label, /phone/i, `KPI card label ${kpi.label} must not reference PHONE`);
      assert.doesNotMatch(kpi.id, /postal/i, `KPI card ${kpi.id} must not aggregate POSTAL_CODE`);
      assert.doesNotMatch(kpi.label, /postal/i, `KPI card label ${kpi.label} must not reference POSTAL_CODE`);
    }

    // Audit Charts: no chart can use phone or postal code as a metric
    for (const chart of model.charts) {
      assert.doesNotMatch(chart.metricLabel, /phone/i, `Chart metric "${chart.metricLabel}" must not reference PHONE`);
      assert.doesNotMatch(chart.metricLabel, /postal/i, `Chart metric "${chart.metricLabel}" must not reference POSTAL_CODE`);
    }

    // Assert Temporal Trend uses ADMISSION_DATE and GROSS_BILL
    const trendChart = model.charts.find((c) => c.id === 'chart_temporal_trend');
    assert.ok(trendChart, 'Must produce temporal trend chart');
    assert.strictEqual(trendChart.dimensionLabel, 'Month');
    assert.ok(trendChart.metricLabel.includes('GROSS_BILL'), 'Temporal trend must track GROSS_BILL');

    // Assert Category breakdown uses DEPARTMENT and GROSS_BILL
    const deptChart = model.charts.find((c) => c.id === 'chart_primary_category_breakdown');
    assert.ok(deptChart, 'Must produce category breakdown chart');
    assert.strictEqual(deptChart.dimensionLabel, 'DEPARTMENT');
    assert.ok(deptChart.metricLabel.includes('GROSS_BILL'), 'Category breakdown must track GROSS_BILL');

    // Assert Action Queue contains genuine overdue/unpaid accounts
    assert.ok(model.actionQueue.length > 0, 'Must produce action queue for accounts with overdue aging');
    for (const item of model.actionQueue) {
      assert.ok(item.urgencyScore > 0, 'Every action item must have positive urgency score');
      assert.match(item.reason, /(overdue|unpaid|state)/i, 'Reason must state genuine operational condition');
    }
  });

  test('Mandatory Fix 2 & 3: Adversarial Dataset with Telecom IMEI, SIM, Phone, Tower IDs', () => {
    const telecomRows = [
      { phone_number: 9876543210, imei: '864201041234567', sim_iccid: '8991101200003214567', cell_id: 10452, data_mb: 450.5, call_cost: 12.50 },
      { phone_number: 9876543211, imei: '864201041234568', sim_iccid: '8991101200003214568', cell_id: 10453, data_mb: 120.0, call_cost: 4.00 },
      { phone_number: 9876543212, imei: '864201041234569', sim_iccid: '8991101200003214569', cell_id: 10452, data_mb: 890.2, call_cost: 35.00 },
    ];
    const headers = Object.keys(telecomRows[0]);
    const profile = profileDataset(headers, telecomRows);
    const semantics = detectSemanticRoles(profile);

    assert.strictEqual(semantics.columnRoles['phone_number'], 'identifier');
    assert.strictEqual(semantics.columnRoles['imei'], 'identifier');
    assert.strictEqual(semantics.columnRoles['sim_iccid'], 'identifier');
    assert.strictEqual(semantics.columnRoles['cell_id'], 'identifier');

    assert.strictEqual(semantics.measureAdditivity['phone_number'], 'non_additive');
    assert.strictEqual(semantics.measureAdditivity['imei'], 'non_additive');
    assert.strictEqual(semantics.measureAdditivity['cell_id'], 'non_additive');

    // Measures must be data_mb or call_cost
    assert.ok(['call_cost', 'data_mb'].includes(semantics.primaryMetric || ''));
  });

  test('Mandatory Fix 7, 8, 9 & 11: Pure Identifier Table (Zero Quantitative Measures)', async () => {
    const staffRows = [
      { employee_code: 1001, badge_no: 501, employee_name: 'Alice', status: 'Active', hire_date: '2023-01-15' },
      { employee_code: 1002, badge_no: 502, employee_name: 'Bob', status: 'Active', hire_date: '2023-02-20' },
      { employee_code: 1003, badge_no: 503, employee_name: 'Charlie', status: 'Active', hire_date: '2023-03-10' },
      { employee_code: 1004, badge_no: 504, employee_name: 'Diana', status: 'Active', hire_date: '2023-04-05' },
    ];
    const headers = Object.keys(staffRows[0]);
    const profile = profileDataset(headers, staffRows);
    const semantics = detectSemanticRoles(profile);

    assert.strictEqual(semantics.columnRoles['employee_code'], 'identifier');
    assert.strictEqual(semantics.columnRoles['badge_no'], 'identifier');
    assert.strictEqual(semantics.primaryMetric, undefined, 'Must not invent a primary measure for numeric codes');

    const rulePack = resolveDomainRulePack(profile, semantics);
    const model = await composeUniversalDashboard('staff_roster', staffRows, profile, semantics, rulePack);

    // Assert fallback to record count for charts
    for (const c of model.charts) {
      assert.ok(
        c.metricLabel === 'Record Count' || c.metricLabel === 'Volume',
        `Chart "${c.title}" must use Record Count/Volume when no measure exists, got: ${c.metricLabel}`
      );
    }

    // All rows are Active with no overdue or priority -> Action queue must be strictly empty
    assert.strictEqual(model.actionQueue.length, 0, 'Action queue must be omitted when zero exceptions exist');
  });

  test('Mandatory Fix 10: Decision brief does not perform arithmetic on identifiers', async () => {
    const rawRows = [
      { customer_account_no: 4001928374, zip_code: 94103, category: 'Retail', transaction_date: '2024-05-01' },
      { customer_account_no: 4001928375, zip_code: 94104, category: 'Retail', transaction_date: '2024-05-02' },
      { customer_account_no: 4001928376, zip_code: 94105, category: 'Wholesale', transaction_date: '2024-05-03' },
    ];
    const headers = Object.keys(rawRows[0]);
    const profile = profileDataset(headers, rawRows);
    const semantics = detectSemanticRoles(profile);
    const rulePack = resolveDomainRulePack(profile, semantics);
    const model = await composeUniversalDashboard('accounts_table', rawRows, profile, semantics, rulePack);

    for (const b of model.decisionBrief.executiveBullets) {
      assert.doesNotMatch(b.text, /sum\(customer_account_no\)/i);
      assert.doesNotMatch(b.text, /sum\(zip_code\)/i);
      assert.doesNotMatch(b.text, /400192837/); // Should not sum account numbers
    }
  });
});
