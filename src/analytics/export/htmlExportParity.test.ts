/**
 * PRD v10.2 Non-Negotiable HTML Export Parity & Cross-Filtering Test Suite
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import Papa from 'papaparse';
import { profileDataset } from '../profiler/datasetProfiler';
import { detectSemanticRoles } from '../profiler/semanticDetector';
import { resolveDomainRulePack } from '../rules/rulePacks';
import { composeUniversalDashboard } from '../composer/dashboardComposer';
import { HtmlDashboardExporter } from './htmlDashboardExporter';

describe('PRD v10.2: HTML Export Parity & Cross-Filtering Remediation', async () => {
  // Load canonical 5,000-row CSV
  const csvPath = path.resolve(process.cwd(), 'public/datasets/ecommerce_sales_5k.csv');
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: 'greedy' });
  const rawHeaders = (parsed.meta.fields || []).map((h) => h.replace(/^\ufeff/, '').trim()).filter(Boolean);
  const allRows = (parsed.data as Record<string, any>[]).filter((r) =>
    Object.values(r).some((v) => v !== null && v !== undefined && v !== '')
  );

  const profile = profileDataset(rawHeaders, allRows);
  const semantics = detectSemanticRoles(profile);
  const rulePack = resolveDomainRulePack(profile, semantics);
  const model = await composeUniversalDashboard('sales_5k', allRows, profile, semantics, rulePack);

  const exporter = new HtmlDashboardExporter();
  const html = exporter.exportToHtml(model, allRows, { datasetName: 'sales_5k' });

  it('Requirement 8: Exported HTML is 100% self-contained with 0 external CDN links', () => {
    assert.strictEqual(typeof html, 'string');
    assert.ok(html.length > 50000, 'HTML document should contain full dataset and model');
    
    // Check for unauthorized remote URLs
    const remoteMatches = html.match(/https?:\/\/(?!localhost)[^\s"'>]+/gi) || [];
    const unauthorized = remoteMatches.filter(
      (url) => !url.includes('nexusbi') && !url.includes('w3.org') && !url.includes('example.com')
    );
    assert.strictEqual(unauthorized.length, 0, `Export contains unauthorized remote CDN URLs: ${unauthorized.join(', ')}`);
  });

  it('Requirement 1: HTML includes visualization-specific SVG renderers for treemap, combo, stacked_column, scatter, heatmap', () => {
    assert.ok(html.includes('renderWaterfallSvg'), 'Must contain dedicated renderWaterfallSvg');
    assert.ok(html.includes('renderTreemapSvg'), 'Must contain dedicated renderTreemapSvg (proportional rectangular tiles, not horizontal bars)');
    assert.ok(html.includes('renderComboSvg'), 'Must contain dedicated renderComboSvg (dual-axis columns and line)');
    assert.ok(html.includes('renderStackedColumnSvg'), 'Must contain dedicated renderStackedColumnSvg (stacked fulfillment status per channel)');
    assert.ok(html.includes('renderScatterSvg'), 'Must contain dedicated renderScatterSvg (quantitative coordinates)');
    assert.ok(html.includes('renderHeatmapSvg'), 'Must contain dedicated renderHeatmapSvg (2D month x region matrix)');
    assert.ok(html.includes('renderDonutSvg'), 'Must contain dedicated renderDonutSvg');
  });

  it('Requirement 2: Financial waterfall implements floating bars and cumulative connector levels', () => {
    assert.ok(html.includes('stroke-dasharray="2 2"'), 'Waterfall must have dashed connector lines between cumulative steps');
    assert.ok(html.includes('Gross Sales'), 'Waterfall must include Gross Sales step');
    assert.ok(html.includes('Discounts'), 'Waterfall must include Discounts step');
    assert.ok(html.includes('Net Sales'), 'Waterfall must include Net Sales step');
    assert.ok(html.includes('Cost of Goods (COGS)'), 'Waterfall must include Cost of Goods step');
    assert.ok(html.includes('Gross Profit'), 'Waterfall must include Gross Profit step');
  });

  it('Requirement 3: Donut center label shows formatted metric total rather than category count', () => {
    assert.ok(html.includes('centerTotalText'), 'Donut center must compute centerTotalText metric total');
    assert.ok(!html.includes('>3</text>'), 'Donut center must not display raw segment count');
  });

  it('Requirement 4 & 5: Client-side engine recomputes KPIs and charts on filter and restores on reset', () => {
    // Extract script tag content
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
    assert.ok(scriptMatch, 'HTML must contain script block');
    const scriptCode = scriptMatch[1];

    // Create simulated DOM environment in VM
    const mockElements: Record<string, { innerText?: string; innerHTML?: string; style: Record<string, string> }> = {};
    const getMock = (id: string) => {
      if (!mockElements[id]) mockElements[id] = { innerText: '', innerHTML: '', style: {} };
      return mockElements[id];
    };

    const sandbox = {
      window: {
        onload: null as any,
      },
      document: {
        getElementById: (id: string) => getMock(id),
        querySelectorAll: () => [],
        body: {
          classList: {
            toggle: () => {},
          },
        },
      },
      navigator: {
        clipboard: {
          writeText: async () => {},
        },
      },
      setTimeout: (fn: Function) => fn(),
      console: { log: () => {}, error: () => {} },
    };

    vm.createContext(sandbox);
    vm.runInContext(scriptCode, sandbox);

    // Initial render
    (sandbox as any).renderAll(allRows);

    // Verify initial KPI numbers
    assert.strictEqual(getMock('kpi-val-total_transactions').innerText, '5,000');
    assert.strictEqual(getMock('kpi-val-total_net_sales').innerText, '$34.36M');
    assert.strictEqual(getMock('kpi-val-total_gross_sales').innerText, '$36.92M');
    assert.strictEqual(getMock('kpi-val-total_gross_profit').innerText, '$11.19M');
    assert.strictEqual(getMock('kpi-val-gross_profit_margin').innerText, '32.56%');
    assert.strictEqual(getMock('kpi-val-avg_order_value').innerText, '$6,872.95');
    assert.strictEqual(getMock('kpi-val-total_cost').innerText, '$23.18M');
    assert.strictEqual(getMock('kpi-val-total_units_sold').innerText, '22,660');

    // Test cross-filtering by Region = South
    (sandbox as any).applyFilter('Region', 'South');

    // Verify South-filtered KPIs (1,248 matching records)
    assert.strictEqual(getMock('kpi-val-total_transactions').innerText, '1,248');
    assert.strictEqual(getMock('kpi-val-total_net_sales').innerText, '$9.41M');
    assert.strictEqual(getMock('kpi-val-total_gross_sales').innerText, '$10.09M');
    assert.strictEqual(getMock('kpi-val-total_gross_profit').innerText, '$2.97M');
    assert.strictEqual(getMock('kpi-val-total_cost').innerText, '$6.44M');
    assert.strictEqual(getMock('kpi-val-gross_profit_margin').innerText, '31.56%');
    assert.strictEqual(getMock('kpi-val-avg_order_value').innerText, '$7,538.69');

    // Verify filter banner updated
    const bannerText = getMock('filterText').innerText;
    assert.ok(bannerText?.includes('1,248 of 5,000 matching records • 25.0%'), 'Filter banner must display exact record count and percentage');

    // Test resetFilter()
    (sandbox as any).resetFilter();

    // Verify restored original KPIs
    assert.strictEqual(getMock('kpi-val-total_transactions').innerText, '5,000');
    assert.strictEqual(getMock('kpi-val-total_net_sales').innerText, '$34.36M');
    assert.strictEqual(getMock('kpi-val-total_gross_sales').innerText, '$36.92M');
    assert.strictEqual(getMock('kpi-val-total_gross_profit').innerText, '$11.19M');
    assert.strictEqual(getMock('kpi-val-gross_profit_margin').innerText, '32.56%');
    assert.strictEqual(getMock('kpi-val-avg_order_value').innerText, '$6,872.95');
  });

  it('Requirement 7: Monetary values, percentages and counts follow consistent formatting', () => {
    // Assert currency prefix $ and format
    assert.ok(html.includes('$34.36M'), 'Contains $34.36M Net Sales');
    assert.ok(html.includes('32.56%'), 'Contains 32.56% Margin');
    assert.ok(html.includes('22,660'), 'Contains 22,660 Units');
    assert.ok(html.includes('$6,872.95'), 'Contains $6,872.95 AOV');
  });

  it('Requirement 10: Validates 5k dataset against expected target values down to the cent', () => {
    const totalNetSales = allRows.reduce((sum, r) => sum + Number(r.Net_Sales || 0), 0);
    const totalGrossSales = allRows.reduce((sum, r) => sum + Number(r.Gross_Sales || 0), 0);
    const totalProfit = allRows.reduce((sum, r) => sum + Number(r.Profit || 0), 0);
    const totalCogs = allRows.reduce((sum, r) => sum + Number(r.Total_Cost || 0), 0);
    const totalUnits = allRows.reduce((sum, r) => sum + Number(r.Quantity || 0), 0);

    assert.strictEqual(allRows.length, 5000, 'Exact 5,000 rows');
    assert.strictEqual(totalNetSales.toFixed(2), '34364744.05', 'Exact $34,364,744.05 Net Sales');
    assert.strictEqual(totalGrossSales.toFixed(2), '36915840.00', 'Exact $36,915,840.00 Gross Sales');
    assert.strictEqual(totalProfit.toFixed(2), '11188809.05', 'Exact $11,188,809.05 Gross Profit');
    assert.strictEqual(totalCogs.toFixed(2), '23175935.00', 'Exact $23,175,935.00 Total Cost');
    assert.strictEqual(totalUnits, 22660, 'Exact 22,660 Units');
  });
});
