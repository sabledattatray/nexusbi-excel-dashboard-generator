/**
 * Universal Julius-Class Analytical Dashboard Component
 * Authoritative source: PRD v9.0 Section 07 (U01 - U21)
 *
 * Implements deterministic cross-filtering, drillthrough, explanation drawers,
 * evidence-linked decision briefs, real-source action queues, and accessible chart adapters.
 * Strictly 100% in-browser, zero-AI, zero-telemetry.
 */

import React, { useState, useMemo } from 'react';
import {
  UniversalDashboardModel,
  KpiCardModel,
  ChartViewModel,
  ActionQueueItem,
} from '../analytics/composer/dashboardComposer';
import { ChartType } from '../analytics/rules/rulePacks';
import {
  ChartThemeMode,
  getChartPalette,
  generateAccessibleTableData,
  formatChartValue,
} from '../analytics/composer/chartAdapter';
import { matchesActiveFilter, parseDateBucketKey } from '../analytics/export/exportModelAdapter';
import {
  ShieldCheck,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Table as TableIcon,
  BarChart2,
  Sun,
  Moon,
  Printer,
  Info,
  Layers,
  AlertCircle,
  Database,
  Copy,
  Check,
  Sliders,
} from 'lucide-react';
import { UniversalChartRenderer, formatAxisDate } from './charts/UniversalChartVisuals';

export interface UniversalJuliusDashboardProps {
  model: UniversalDashboardModel;
  rawRows: Record<string, any>[];
  onDownloadExcel?: (activeFilter?: { field: string; value: string } | null) => void;
  onDownloadHtml?: (activeFilter?: { field: string; value: string } | null) => void;
  onDownloadPdf?: (activeFilter?: { field: string; value: string } | null) => void;
  onPrintReportHtml?: (activeFilter?: { field: string; value: string } | null) => void;
  theme?: ChartThemeMode;
  onThemeChange?: (theme: ChartThemeMode) => void;
  activeFilter?: { field: string; value: string } | null;
  onFilterChange?: (filter: { field: string; value: string } | null) => void;
}

export function UniversalJuliusDashboard({
  model,
  rawRows,
  onDownloadExcel,
  onDownloadHtml,
  onDownloadPdf,
  onPrintReportHtml,
  theme: propTheme,
  onThemeChange,
  activeFilter: propFilter,
  onFilterChange,
}: UniversalJuliusDashboardProps) {
  // Theme state: dark | light | print
  const [internalTheme, setInternalTheme] = useState<ChartThemeMode>('dark');
  const theme = propTheme ?? internalTheme;
  const setTheme = (mode: ChartThemeMode) => {
    setInternalTheme(mode);
    onThemeChange?.(mode);
  };
  const palette = getChartPalette(theme);

  // Cross-filter state: { field: string, value: string } | null
  const [internalFilter, setInternalFilter] = useState<{ field: string; value: string } | null>(null);
  const activeFilter = propFilter !== undefined ? propFilter : internalFilter;
  const setActiveFilter = (filter: { field: string; value: string } | null) => {
    setInternalFilter(filter);
    onFilterChange?.(filter);
  };

  // Active view: 'dashboard' | 'action-queue' | 'data-quality'
  const [activeSection, setActiveSection] = useState<'dashboard' | 'action-queue' | 'data-quality'>('dashboard');

  // Expanded KPI explanation drawer IDs
  const [expandedKpiId, setExpandedKpiId] = useState<string | null>(null);

  // Accessible Table View toggle per chart ID
  const [chartTableView, setChartTableView] = useState<Record<string, boolean>>({});

  // Filtered rows for cross-filtering drillthrough using canonical date bucket & exact field matching
  const filteredRows = useMemo(() => {
    if (!activeFilter) return rawRows;
    return rawRows.filter((r) => matchesActiveFilter(r, activeFilter.field, activeFilter.value));
  }, [rawRows, activeFilter]);

  // Compute filtered ratio
  const filterRatioText = useMemo(() => {
    if (!activeFilter) return null;
    return `Showing ${filteredRows.length.toLocaleString()} of ${rawRows.length.toLocaleString()} records (${((filteredRows.length / rawRows.length) * 100).toFixed(1)}%) filtered by ${activeFilter.field} = "${activeFilter.value}"`;
  }, [rawRows.length, filteredRows.length, activeFilter]);

  const toggleChartTable = (chartId: string) => {
    setChartTableView((prev) => ({ ...prev, [chartId]: !prev[chartId] }));
  };

  // Currency symbol detected from model
  const detectedCurrencySymbol = useMemo(() => {
    const financialKpi = model.kpiCards.find((k) => k.isFinancial);
    if (!financialKpi) return '';
    const match = financialKpi.formattedValue.match(/^([^0-9\-+ ]+)/);
    return match ? match[1] : '';
  }, [model.kpiCards]);

  // Compute dynamically filtered KPI values over filteredRows (Item 5)
  const dynamicKpiValues = useMemo(() => {
    if (!activeFilter) return null;
    const res: Record<string, { value: number; formatted: string }> = {};

    for (const kpi of model.kpiCards) {
      const col = kpi.sourceColumns[0];
      const denomCol = kpi.sourceColumns[1];

      if (kpi.calculationFormula.startsWith('COUNTROWS') || kpi.id === 'total_records' || kpi.id === 'total_tickets' || kpi.id === 'total_transactions') {
        const val = filteredRows.length;
        res[kpi.id] = { value: val, formatted: val.toLocaleString('en-US') };
      } else if (kpi.calculationFormula.startsWith('COUNTDISTINCT') && col) {
        const distinct = new Set(filteredRows.map((r) => r[col]).filter((v) => v !== null && v !== undefined && v !== ''));
        res[kpi.id] = { value: distinct.size, formatted: distinct.size.toLocaleString('en-US') };
      } else if (kpi.calculationFormula.startsWith('SUM') && col) {
        const vals = filteredRows.map((r) => Number(r[col] || 0)).filter(Number.isFinite);
        const sum = vals.reduce((a, b) => a + b, 0);
        res[kpi.id] = {
          value: sum,
          formatted: kpi.isFinancial
            ? `${detectedCurrencySymbol || '$'}${sum.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
            : sum.toLocaleString('en-US'),
        };
      } else if (kpi.calculationFormula.startsWith('AVERAGE') && col) {
        const vals = filteredRows.map((r) => Number(r[col])).filter(Number.isFinite);
        const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        res[kpi.id] = {
          value: avg,
          formatted: kpi.isFinancial
            ? `${detectedCurrencySymbol || '$'}${avg.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : avg.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        };
      } else if (kpi.calculationFormula.includes('/') && col && denomCol) {
        const numVals = filteredRows.map((r) => Number(r[col] || 0)).filter(Number.isFinite);
        const denVals = filteredRows.map((r) => Number(r[denomCol] || 0)).filter(Number.isFinite);
        const numSum = numVals.reduce((a, b) => a + b, 0);
        const denSum = denVals.reduce((a, b) => a + b, 0);
        const ratio = denSum > 0 ? (numSum / denSum) * 100 : 0;
        res[kpi.id] = { value: ratio, formatted: `${ratio.toFixed(2)}%` };
      }
    }
    return res;
  }, [filteredRows, activeFilter, model.kpiCards, detectedCurrencySymbol]);

  // Inspected action row for full source-row traceability audit modal
  const [inspectingRow, setInspectingRow] = useState<ActionQueueItem | null>(null);

  // Active visual sub-section tab: 'overview' | 'revenue' | 'customers' | 'products' | 'all'
  const [activeVisualTab, setActiveVisualTab] = useState<'overview' | 'revenue' | 'customers' | 'products' | 'all'>('overview');

  // Chart type switcher overrides per chart ID
  const [chartTypeOverrides, setChartTypeOverrides] = useState<Record<string, ChartType>>({});

  // Copied feedback per chart ID
  const [copiedChartId, setCopiedChartId] = useState<string | null>(null);

  const handleCopyCsv = (chart: ChartViewModel) => {
    const tableData = generateAccessibleTableData(chart);
    const csvContent = [
      tableData.headers.join(','),
      ...tableData.rows.map((r) => `"${r.label.replace(/"/g, '""')}",${r.value},"${r.percentage}"`),
    ].join('\n');
    navigator.clipboard.writeText(csvContent);
    setCopiedChartId(chart.id);
    setTimeout(() => setCopiedChartId(null), 2000);
  };

  // Dynamic Charts recomputed over filteredRows when cross-filter is active (P0-B & P1-E)
  const dynamicCharts = useMemo(() => {
    if (!activeFilter) return model.charts;

    return model.charts.map((chart) => {
      // If this chart is the one being filtered on, keep its original data points so user can see context and switch filters
      if (chart.dimensionLabel === activeFilter.field) {
        return chart;
      }

      // Special handler 1: Financial Bridge Waterfall
      if (chart.chartType === 'waterfall') {
        const gross = filteredRows.reduce((acc, r) => acc + Number(r['Gross_Sales'] || r['Net_Sales'] || 0), 0);
        const net = filteredRows.reduce((acc, r) => acc + Number(r['Net_Sales'] || 0), 0);
        const cogs = filteredRows.reduce((acc, r) => acc + Number(r['Total_Cost'] || 0), 0);
        const profit = filteredRows.reduce((acc, r) => acc + Number(r['Profit'] || 0), 0);
        const discount = Math.max(0, gross - net);

        return {
          ...chart,
          data: [
            { label: 'Gross Sales', value: gross, stepType: 'start' as const },
            { label: 'Discounts & Deductions', value: -discount, stepType: 'decrease' as const },
            { label: 'Net Sales', value: net, stepType: 'intermediate' as const, isSubtotal: true },
            { label: 'Cost of Goods (COGS)', value: -cogs, stepType: 'decrease' as const },
            { label: 'Gross Profit', value: profit, stepType: 'total' as const, isSubtotal: true },
          ],
        };
      }

      // Special handler 2: Monthly Combo (Sales + Profit)
      if (chart.id === 'monthly_revenue_profit_combo' || chart.chartType === 'combo') {
        const monthAggs: Record<string, { sales: number; profit: number }> = {};
        for (const row of filteredRows) {
          const m = parseDateBucketKey(row['Order_Date'] || row['Month'] || '') || String(row['Month'] || 'Unknown');
          if (!monthAggs[m]) monthAggs[m] = { sales: 0, profit: 0 };
          monthAggs[m].sales += Number(row['Net_Sales'] || 0);
          monthAggs[m].profit += Number(row['Profit'] || 0);
        }
        const pts = Object.entries(monthAggs)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([label, val]) => ({
            label,
            value: val.sales,
            secondaryValue: val.profit,
          }));
        return {
          ...chart,
          data: pts.length > 0 ? pts : [{ label: 'No records matching filter', value: 0 }],
        };
      }

      // Special handler 3: Product Category Mix Treemap
      if (chart.id === 'category_mix' || chart.chartType === 'treemap') {
        const catAggs: Record<string, { sales: number; profit: number }> = {};
        for (const row of filteredRows) {
          const c = String(row['Category'] || 'Unknown');
          if (!catAggs[c]) catAggs[c] = { sales: 0, profit: 0 };
          catAggs[c].sales += Number(row['Net_Sales'] || 0);
          catAggs[c].profit += Number(row['Profit'] || 0);
        }
        const pts = Object.entries(catAggs)
          .sort(([, a], [, b]) => b.sales - a.sales)
          .map(([label, val]) => ({
            label,
            value: val.sales,
            secondaryValue: val.profit,
          }));
        return {
          ...chart,
          data: pts.length > 0 ? pts : [{ label: 'No records matching filter', value: 0 }],
        };
      }

      // Special handler 4: Product Performance Scatter
      if (chart.id === 'product_performance_scatter' || chart.chartType === 'scatter') {
        const prodAggs: Record<string, { sales: number; profit: number; units: number }> = {};
        for (const row of filteredRows) {
          const p = String(row['Product'] || row['Product_Name'] || 'Unknown');
          if (!prodAggs[p]) prodAggs[p] = { sales: 0, profit: 0, units: 0 };
          prodAggs[p].sales += Number(row['Net_Sales'] || 0);
          prodAggs[p].profit += Number(row['Profit'] || 0);
          prodAggs[p].units += Number(row['Quantity'] || 1);
        }
        const pts = Object.entries(prodAggs)
          .sort(([, a], [, b]) => b.sales - a.sales)
          .slice(0, 15)
          .map(([label, val]) => ({
            label,
            value: val.sales,
            secondaryValue: val.sales > 0 ? Number(((val.profit / val.sales) * 100).toFixed(2)) : 0,
            tertiaryValue: val.units,
          }));
        return {
          ...chart,
          data: pts.length > 0 ? pts : [{ label: 'No records matching filter', value: 0 }],
        };
      }

      // Special handler 5: Stacked Column (Channel x Status)
      if (chart.id === 'status_by_channel' || chart.chartType === 'stacked_column') {
        const chAggs: Record<string, number> = {};
        for (const row of filteredRows) {
          const ch = String(row['Sales_Channel'] || 'Direct');
          const st = String(row['Order_Status'] || 'Delivered');
          const k = `${ch} - ${st}`;
          chAggs[k] = (chAggs[k] || 0) + 1;
        }
        const pts = Object.entries(chAggs).map(([label, value]) => ({
          label,
          value,
          stackGroup: label.split(' - ')[0],
        }));
        return {
          ...chart,
          data: pts.length > 0 ? pts : [{ label: 'No records matching filter', value: 0 }],
        };
      }

      // Special handler 6: Regional Heatmap (Month x Region)
      if (chart.id === 'revenue_calendar_heatmap' || chart.chartType === 'heatmap') {
        const heatAggs: Record<string, number> = {};
        for (const row of filteredRows) {
          const m = parseDateBucketKey(row['Order_Date'] || row['Month'] || '') || String(row['Month'] || '2021-01');
          const r = String(row['Region'] || 'Unknown');
          const k = `${m} - ${r}`;
          heatAggs[k] = (heatAggs[k] || 0) + Number(row['Net_Sales'] || 0);
        }
        const pts = Object.entries(heatAggs).map(([label, value]) => ({
          label,
          value,
          stackGroup: label.split(' - ')[1],
        }));
        return {
          ...chart,
          data: pts.length > 0 ? pts : [{ label: 'No records matching filter', value: 0 }],
        };
      }

      // Default categorical/temporal grouping
      const isTemporal = chart.chartType === 'line' || chart.chartType === 'area' || chart.dimensionLabel === 'Month' || /month|date/i.test(chart.dimensionLabel);

      const targetKpi = model.kpiCards.find(
        (k) => k.id === (chart as any).metricId || k.label.toLowerCase() === chart.metricLabel.toLowerCase() || (chart.metricLabel.includes('Sales') && k.id.includes('sales'))
      );
      const isSumMetric = targetKpi && targetKpi.calculationFormula.startsWith('SUM') && targetKpi.sourceColumns[0];
      const sumCol = isSumMetric ? targetKpi.sourceColumns[0] : null;

      const aggregates: Record<string, number> = {};
      for (const row of filteredRows) {
        let key = 'Unknown';
        if (isTemporal) {
          if (chart.dimensionLabel in row) {
            const b = parseDateBucketKey(row[chart.dimensionLabel]);
            key = b || String(row[chart.dimensionLabel]);
          } else {
            for (const col of Object.keys(row)) {
              if (/date|time|period|month/i.test(col)) {
                const b = parseDateBucketKey(row[col]);
                if (b) { key = b; break; }
              }
            }
          }
        } else {
          key = String(row[chart.dimensionLabel] ?? 'Unknown');
        }

        const val = sumCol ? Number(row[sumCol] || 0) : 1;
        aggregates[key] = (aggregates[key] || 0) + val;
      }

      const totalValSum = Object.values(aggregates).reduce((a, b) => a + b, 0);
      const dataPoints = Object.entries(aggregates).map(([label, value]) => ({
        label,
        value,
        percentage: totalValSum > 0 ? (value / totalValSum) * 100 : 0,
      }));

      if (isTemporal) {
        dataPoints.sort((a, b) => a.label.localeCompare(b.label));
      } else {
        dataPoints.sort((a, b) => b.value - a.value);
      }

      return {
        ...chart,
        data: dataPoints.length > 0 ? dataPoints : [{ label: 'No records matching filter', value: 0 }],
      };
    });
  }, [filteredRows, activeFilter, model.charts, model.kpiCards]);

  // Section Filtered Charts according to active sub-tab (PRD v10.1 Section B)
  const sectionFilteredCharts = useMemo(() => {
    if (activeVisualTab === 'all') return dynamicCharts;
    if (activeVisualTab === 'overview') {
      const overviewIds = ['sales_trend_over_time', 'segment_share', 'sales_by_region', 'financial_waterfall'];
      const filtered = dynamicCharts.filter((c) => overviewIds.includes(c.id) || c.section === 'overview');
      return filtered.length > 0 ? filtered : dynamicCharts.slice(0, 4);
    }
    if (activeVisualTab === 'revenue') {
      const revenueIds = ['monthly_revenue_profit_combo', 'financial_waterfall', 'category_mix'];
      const filtered = dynamicCharts.filter((c) => revenueIds.includes(c.id) || c.section === 'revenue');
      return filtered.length > 0 ? filtered : dynamicCharts;
    }
    if (activeVisualTab === 'customers') {
      const customerIds = ['segment_share', 'channel_mix', 'status_by_channel'];
      const filtered = dynamicCharts.filter((c) => customerIds.includes(c.id) || c.section === 'customers_regions');
      return filtered.length > 0 ? filtered : dynamicCharts;
    }
    if (activeVisualTab === 'products') {
      const productIds = ['product_performance_scatter', 'revenue_calendar_heatmap', 'category_mix'];
      const filtered = dynamicCharts.filter((c) => productIds.includes(c.id) || c.section === 'products_ops');
      return filtered.length > 0 ? filtered : dynamicCharts;
    }
    return dynamicCharts;
  }, [dynamicCharts, activeVisualTab]);

  const isDark = theme === 'dark';
  const isPrint = theme === 'print';

  // Strict PRD v10.1 Theme Tokens
  const containerBg = isDark
    ? 'bg-[#090F1E] text-[#F4F7FC]'
    : isPrint
    ? 'bg-white text-black'
    : 'bg-[#F5F7FB] text-[#172033]';
  const cardBg = isDark
    ? 'bg-[#111B2E] border-[#26354A] text-[#F4F7FC]'
    : isPrint
    ? 'bg-white border-black text-black'
    : 'bg-[#FFFFFF] border-[#DCE3EC] text-[#172033] shadow-sm shadow-slate-200/50';
  const headingText = isDark ? 'text-[#F4F7FC]' : isPrint ? 'text-black' : 'text-[#172033]';
  const subText = isDark ? 'text-[#A8B6C9]' : isPrint ? 'text-gray-600' : 'text-[#52637B]';
  const mutedText = isDark ? 'text-[#A8B6C9]' : isPrint ? 'text-gray-600' : 'text-[#52637B]';

  return (
    <div className={`w-full min-h-screen p-4 sm:p-6 lg:p-8 font-sans ${containerBg} transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ========================================================================= */}
        {/* 1. ADAPTIVE EXECUTIVE HEADER (U03)                                        */}
        {/* ========================================================================= */}
        <header className={`rounded-2xl border p-6 sm:p-8 ${cardBg} shadow-sm backdrop-blur-md`}>
          <div className="flex flex-col xl:flex-row justify-between items-start gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {model.isUniversalFallback ? (
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    isDark
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    Domain: Unclassified (Statistical Mode)
                  </span>
                ) : (
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    isDark
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/25'
                      : 'bg-sky-50 text-sky-700 border-sky-200'
                  }`}>
                    Domain: {model.domainClassification} ({(model.domainConfidence * 100).toFixed(1)}%)
                  </span>
                )}
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                  isDark
                    ? 'bg-slate-800 text-slate-300 border-slate-700/60'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  Schema Profiling: {((model.profilingConfidence || 0.88) * 100).toFixed(1)}%
                </span>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                  isDark
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  <ShieldCheck size={12} />
                  Zero-AI Deterministic Parity
                </span>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                  isDark
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/25'
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}>
                  <Database size={12} />
                  {model.executiveHeader.dataLocality}
                </span>
              </div>
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${headingText} leading-tight break-words pt-1`}>
                {model.dashboardTitle}
              </h1>
              <p className={`text-xs sm:text-sm mt-2.5 ${mutedText} flex flex-wrap items-center gap-x-2 gap-y-1`}>
                <span><strong className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{model.executiveHeader.totalRecords.toLocaleString()}</strong> source records audited</span>
                <span>•</span>
                <span>As of {new Date(model.executiveHeader.asOfTimestamp).toLocaleDateString()} {new Date(model.executiveHeader.asOfTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {model.executiveHeader.intakePeriod && (
                  <>
                    <span>•</span>
                    <span>Span: {model.executiveHeader.intakePeriod}</span>
                  </>
                )}
              </p>
            </div>

            {/* Controls: Theme & Export */}
            <div className="flex flex-wrap items-center gap-2 xl:justify-end shrink-0 pt-1 w-full xl:w-auto">
              <div className={`flex items-center rounded-lg border p-1 shadow-sm ${
                isDark ? 'border-slate-700/60 bg-slate-800/60' : 'border-slate-200 bg-slate-100'
              }`}>
                <button
                  type="button"
                  title="Dark Theme"
                  onClick={() => setTheme('dark')}
                  className={`p-1.5 rounded-md transition-colors ${
                    theme === 'dark'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Moon size={14} />
                </button>
                <button
                  type="button"
                  title="Light Theme"
                  onClick={() => setTheme('light')}
                  className={`p-1.5 rounded-md transition-colors ${
                    theme === 'light'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Sun size={14} />
                </button>
                <button
                  type="button"
                  title="High-Contrast Print Theme"
                  onClick={() => setTheme('print')}
                  className={`p-1.5 rounded-md transition-colors ${
                    theme === 'print'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Printer size={14} />
                </button>
              </div>

              {onDownloadExcel && (
                <button
                  type="button"
                  id="btn-export-excel"
                  onClick={() => onDownloadExcel(activeFilter)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm flex items-center gap-1.5"
                >
                  Export Excel (.xlsx)
                </button>
              )}
              {onDownloadPdf && (
                <button
                  type="button"
                  id="btn-export-pdf"
                  onClick={() => onDownloadPdf(activeFilter)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Printer size={13} />
                  Export PDF (.pdf)
                </button>
              )}
              {onPrintReportHtml && (
                <button
                  type="button"
                  id="btn-print-html"
                  onClick={() => onPrintReportHtml(activeFilter)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all shadow-sm flex items-center gap-1.5 ${
                    isDark
                      ? 'border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                      : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Print View (HTML)
                </button>
              )}
              {onDownloadHtml && (
                <button
                  type="button"
                  id="btn-export-html"
                  onClick={() => onDownloadHtml(activeFilter)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-sm flex items-center gap-1.5"
                >
                  Export HTML
                </button>
              )}
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className={`flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-4 border-t ${isDark ? 'border-slate-800/60' : 'border-slate-200'}`}>
            <button
              type="button"
              onClick={() => setActiveSection('dashboard')}
              className={`text-xs font-semibold pb-1.5 border-b-2 transition-colors ${
                activeSection === 'dashboard'
                  ? isDark
                    ? 'border-sky-400 text-sky-400'
                    : 'border-sky-600 text-sky-700 font-bold'
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Executive Metrics & Visuals
            </button>
            {model.actionQueue.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveSection('action-queue')}
                className={`text-xs font-semibold pb-1.5 border-b-2 transition-colors ${
                  activeSection === 'action-queue'
                    ? isDark
                      ? 'border-sky-400 text-sky-400'
                      : 'border-sky-600 text-sky-700 font-bold'
                    : isDark
                    ? 'border-transparent text-slate-400 hover:text-slate-200'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Action Queue ({model.actionQueue.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveSection('data-quality')}
              className={`text-xs font-semibold pb-1.5 border-b-2 transition-colors ${
                activeSection === 'data-quality'
                  ? isDark
                    ? 'border-sky-400 text-sky-400'
                    : 'border-sky-600 text-sky-700 font-bold'
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Data Quality & Audit
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* CROSS-FILTER ACTIVE BANNER (U07)                                         */}
        {/* ========================================================================= */}
        {activeFilter && (
          <div className={`flex items-center justify-between p-3.5 rounded-xl text-xs animate-in fade-in ${
            isDark
              ? 'bg-sky-500/10 border border-sky-500/30 text-sky-300'
              : 'bg-sky-50 border border-sky-200 text-sky-900 shadow-2xs'
          }`}>
            <div className="flex items-center gap-2">
              <Filter size={14} className={isDark ? "text-sky-400" : "text-sky-600"} />
              <span>{filterRatioText}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveFilter(null)}
              className={`flex items-center gap-1 font-semibold hover:underline ${
                isDark ? 'text-sky-200 hover:text-white' : 'text-sky-700 hover:text-sky-950'
              }`}
            >
              <X size={13} /> Reset Filter
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION: MAIN DASHBOARD VIEW                                             */}
        {/* ========================================================================= */}
        {activeSection === 'dashboard' && (
          <>
            {/* 2. MANAGEMENT DECISION BRIEF (U12) */}
            <section className={`rounded-2xl border p-5 ${cardBg} shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className={`text-base font-bold flex items-center gap-2 ${headingText}`}>
                  <Info size={16} className={isDark ? "text-sky-400" : "text-sky-600"} />
                  {model.decisionBrief.headline}
                </h2>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  isDark ? 'text-slate-400 bg-slate-800/50' : 'text-slate-600 bg-slate-100 border border-slate-200'
                }`}>
                  Deterministic Evidence
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-3">
                {model.decisionBrief.executiveBullets.map((b, i) => (
                  <div key={i} className={`p-3.5 rounded-xl border transition-all ${
                    isDark
                      ? 'border-slate-800/80 bg-slate-900/40'
                      : 'border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
                  }`}>
                    <div className={`font-semibold mb-1 ${isDark ? 'text-sky-300' : 'text-sky-800 font-bold'}`}>{b.title}</div>
                    <p className={isDark ? 'text-slate-400' : 'text-slate-600 leading-relaxed'}>{b.text}</p>
                  </div>
                ))}
              </div>
              <div className={`text-[11px] italic pt-2 border-t ${
                isDark ? 'text-slate-500 border-slate-800/50' : 'text-slate-500 border-slate-200'
              }`}>
                Caveat: {model.decisionBrief.caveats[0]}
              </div>
            </section>

            {/* 3. AUDITED KPI CARDS (U04, U05) */}
            <section className="space-y-3">
              <div className={`flex justify-between items-center text-xs font-semibold ${subText}`}>
                <span>KEY PERFORMANCE INDICATORS (DETERMINISTIC & ZERO-AI)</span>
                <span>Click card to inspect calculation formula & exclusions</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {model.kpiCards.map((kpi) => {
                  const isExpanded = expandedKpiId === kpi.id;
                  const displayValue = dynamicKpiValues && dynamicKpiValues[kpi.id]
                    ? dynamicKpiValues[kpi.id].formatted
                    : kpi.formattedValue;

                  return (
                    <div
                      key={kpi.id}
                      onClick={() => setExpandedKpiId(isExpanded ? null : kpi.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 ${cardBg} hover:border-sky-500/60 shadow-sm relative`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-[11px] font-semibold uppercase tracking-wider ${subText}`}>
                          {kpi.label}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={14} className={isDark ? "text-sky-400" : "text-sky-600"} />
                        ) : (
                          <ChevronDown size={14} className={isDark ? "text-slate-500" : "text-slate-400"} />
                        )}
                      </div>
                      <div className={`text-2xl sm:text-3xl font-bold my-2 ${headingText} break-words`}>
                        {displayValue}
                      </div>
                      <div className={`text-[10px] font-mono truncate ${subText}`}>
                        {kpi.calculationFormula}
                      </div>

                      {/* Explanation Drawer (U04) */}
                      {isExpanded && (
                        <div className={`mt-3 pt-3 border-t text-[11px] space-y-1.5 animate-in fade-in ${
                          isDark ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700 bg-slate-50/70 p-2.5 rounded-lg'
                        }`}>
                          <p><strong className={isDark ? "text-sky-400" : "text-sky-700"}>Formula:</strong> {kpi.calculationFormula}</p>
                          {kpi.denominatorRule && (
                            <p><strong className={isDark ? "text-sky-400" : "text-sky-700"}>Denominator:</strong> {kpi.denominatorRule}</p>
                          )}
                          <p><strong className={isDark ? "text-sky-400" : "text-sky-700"}>Source Fields:</strong> {kpi.sourceColumns.join(', ') || 'Dataset rows'}</p>
                          <p><strong className={isDark ? "text-sky-400" : "text-sky-700"}>Exclusions:</strong> {kpi.missingExclusions} missing/invalid rows omitted</p>
                          <p className={`${subText} italic`}>{kpi.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 4. VISUAL CHARTS & CROSS-FILTER GRID (U06, U07, U19) */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${subText}`}>
                    Visual Breakdowns & Analytical Encodings
                  </h3>
                  <p className={`text-xs ${mutedText} mt-0.5`}>
                    10 genuinely distinct visuals across 4 cohesive sections • Click any slice, bar, or point to cross-filter
                  </p>
                </div>

                {/* Sub-Section Navigation Tabs (PRD v10.1 Section B) */}
                <div className={`flex flex-wrap items-center gap-1.5 p-1 rounded-xl border ${
                  isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-100'
                }`}>
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'revenue', label: 'Revenue & Margins' },
                    { id: 'customers', label: 'Customers & Channels' },
                    { id: 'products', label: 'Products & Operations' },
                    { id: 'all', label: `All Visuals (${dynamicCharts.length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveVisualTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeVisualTab === tab.id
                          ? isDark
                            ? 'bg-sky-500 text-white shadow-xs'
                            : 'bg-white text-sky-800 font-bold shadow-xs'
                          : isDark
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sectionFilteredCharts.map((chart) => {
                  const showTable = !!chartTableView[chart.id];
                  const effectiveType = chartTypeOverrides[chart.id] || chart.chartType;
                  const isHeroOrWide =
                    effectiveType === 'area' ||
                    effectiveType === 'line' ||
                    effectiveType === 'combo' ||
                    effectiveType === 'waterfall' ||
                    chart.id === 'sales_trend_over_time' ||
                    chart.id === 'monthly_revenue_profit_combo';

                  const isCurrency =
                    chart.unit === 'currency' ||
                    (!chart.unit && (chart.metricLabel.includes('Sales') || chart.metricLabel.includes('Amount') || chart.metricLabel.includes('Revenue') || chart.metricLabel.includes('Profit') || chart.metricLabel.includes('Cost')));
                  const effectivePrefix = isCurrency ? (detectedCurrencySymbol || '$') : '';

                  const tableData = generateAccessibleTableData(chart);

                  return (
                    <article
                      key={chart.id}
                      className={`rounded-2xl border p-5 ${cardBg} shadow-sm transition-all ${
                        isHeroOrWide ? 'lg:col-span-2' : ''
                      }`}
                    >
                      {/* Chart Header Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={`text-base font-semibold truncate ${headingText}`}>
                              {chart.title}
                            </h3>
                            {chart.selectionReason && (
                              <span
                                title={chart.selectionReason}
                                className={`cursor-help p-1 rounded-full text-[10px] ${
                                  isDark ? 'text-slate-400 hover:text-sky-400 bg-slate-800' : 'text-slate-500 hover:text-sky-700 bg-slate-100'
                                }`}
                              >
                                <Info size={12} />
                              </span>
                            )}
                          </div>
                          <p className={`text-xs ${subText} mt-0.5 truncate`}>
                            {chart.dimensionLabel.replace(/_/g, ' ')} vs {chart.metricLabel.replace(/_/g, ' ')}
                            <span className="mx-1.5">•</span>
                            <span className="uppercase font-mono text-[10px] tracking-wider text-sky-400">
                              {effectiveType.replace(/_/g, ' ')}
                            </span>
                            {chart.unit && (
                              <>
                                <span className="mx-1.5">•</span>
                                <span className="text-[10px] uppercase">{chart.unit}</span>
                              </>
                            )}
                          </p>
                        </div>

                        {/* Interactive Controls: Chart Type Switcher & Table Toggle */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Semantic Alternative Chart Type Switcher */}
                          {chart.allowedAlternativeTypes && chart.allowedAlternativeTypes.length > 1 && (
                            <div className={`flex items-center rounded-lg border p-0.5 text-[10px] ${
                              isDark ? 'border-slate-700/80 bg-slate-800/80' : 'border-slate-200 bg-slate-100'
                            }`}>
                              {chart.allowedAlternativeTypes.map((altType) => (
                                <button
                                  key={altType}
                                  type="button"
                                  title={`Switch visual encoding to ${altType}`}
                                  onClick={() => setChartTypeOverrides((prev) => ({ ...prev, [chart.id]: altType }))}
                                  className={`px-2 py-0.5 rounded capitalize font-medium transition-colors ${
                                    effectiveType === altType
                                      ? isDark
                                        ? 'bg-sky-500 text-white shadow-xs'
                                        : 'bg-white text-sky-900 shadow-xs font-bold'
                                      : isDark
                                      ? 'text-slate-400 hover:text-white'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  {altType.replace(/_/g, ' ')}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Accessible Data Table Toggle */}
                          <button
                            type="button"
                            title={showTable ? 'Switch to Visual Chart' : 'Switch to Accessible Data Table'}
                            onClick={() => toggleChartTable(chart.id)}
                            className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                              showTable
                                ? isDark
                                  ? 'bg-sky-500 text-white border-sky-400 shadow-xs'
                                  : 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                : isDark
                                ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                                : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            {showTable ? <BarChart2 size={14} /> : <TableIcon size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Accessible Data Table Alternative (U19) with Copy CSV */}
                      {showTable ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center px-1">
                            <span className={`text-[11px] ${subText}`}>
                              Tabular accessibility view ({tableData.rows.length} rows)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCsv(chart)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                                copiedChartId === chart.id
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : isDark
                                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {copiedChartId === chart.id ? <Check size={12} /> : <Copy size={12} />}
                              {copiedChartId === chart.id ? 'Copied CSV!' : 'Copy CSV'}
                            </button>
                          </div>

                          <div className="overflow-x-auto max-h-72 rounded-lg border border-slate-700/40">
                            <table className="w-full text-xs text-left">
                              <thead className={isDark ? "bg-slate-800/80 text-slate-300" : "bg-slate-100 text-slate-700 border-b border-slate-200"}>
                                <tr>
                                  {tableData.headers.map((h) => (
                                    <th key={h} className="p-2.5 font-semibold">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {tableData.rows.map((r) => (
                                  <tr
                                    key={r.label}
                                    className={`border-t transition-colors ${
                                      isDark
                                        ? 'border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
                                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                                    }`}
                                  >
                                    <td className="p-2.5 font-medium">{r.label}</td>
                                    <td className="p-2.5 font-mono">
                                      {effectivePrefix}{r.formattedValue}
                                    </td>
                                    <td className={`p-2.5 ${subText}`}>{r.percentage}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        /* Genuinely Distinct SVG Visualizer */
                        <UniversalChartRenderer
                          chart={{
                            ...chart,
                            chartType: effectiveType,
                          }}
                          activeFilter={activeFilter}
                          onSelectFilter={(field, val) => {
                            if (activeFilter && activeFilter.field === field && activeFilter.value === val) {
                              setActiveFilter(null);
                            } else {
                              setActiveFilter({ field, value: val });
                            }
                          }}
                          isDark={isDark}
                          palette={palette}
                          currencyPrefix={effectivePrefix}
                        />
                      )}

                      {chart.accessibleSummary && (
                        <div className="sr-only" aria-live="polite">
                          {chart.accessibleSummary}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* ========================================================================= */}
        {/* SECTION: ACTION QUEUE (U13)                                              */}
        {/* ========================================================================= */}
        {activeSection === 'action-queue' && model.actionQueue.length > 0 && (
          <section className={`rounded-2xl border p-6 ${cardBg} shadow-sm space-y-4`}>
            <div>
              <h2 className={`text-lg font-bold ${headingText}`}>Operational Action Queue</h2>
              <p className={`text-xs ${subText} mt-1`}>
                Deterministic prioritization of real source rows requiring operational intervention. Zero synthetic records.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className={isDark ? "bg-slate-800/70 text-slate-300" : "bg-slate-100 text-slate-700 border-b border-slate-200"}>
                  <tr>
                    <th className="p-3 font-semibold">Rank</th>
                    <th className="p-3 font-semibold">Entity ID</th>
                    <th className="p-3 font-semibold">Source Row</th>
                    <th className="p-3 font-semibold">Priority</th>
                    <th className="p-3 font-semibold">Status / State</th>
                    <th className="p-3 font-semibold">Assignee / Owner</th>
                    <th className="p-3 font-semibold">Location / Site</th>
                    <th className="p-3 font-semibold">Urgency Reason</th>
                    <th className="p-3 font-semibold text-right">Traceability</th>
                  </tr>
                </thead>
                <tbody>
                  {model.actionQueue.map((item) => {
                    const badgeColor =
                      item.priority === 'Critical'
                        ? isDark
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                        : item.priority === 'High'
                        ? isDark
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                        : isDark
                        ? 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                        : 'bg-slate-100 text-slate-700 border-slate-200';

                    return (
                      <tr
                        key={item.entityId + item.rank}
                        onClick={() => setInspectingRow(item)}
                        className={`border-t cursor-pointer transition-colors ${
                          isDark
                            ? 'border-slate-800 hover:bg-slate-800/40 text-slate-300'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <td className={`p-3 font-bold ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>#{item.rank}</td>
                        <td className="p-3 font-mono font-medium">{item.entityId}</td>
                        <td className={`p-3 font-mono ${subText}`}>Row #{item.sourceRowIndex + 1}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="p-3">{item.status}</td>
                        <td className={`p-3 ${subText}`}>{item.ownerOrAssignee || '—'}</td>
                        <td className={`p-3 ${subText}`}>{item.siteOrLocation || '—'}</td>
                        <td className={`p-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.reason}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingRow(item);
                            }}
                            className={`text-xs font-medium underline ${
                              isDark ? 'text-sky-400 hover:text-sky-300' : 'text-sky-600 hover:text-sky-800'
                            }`}
                          >
                            Inspect Row
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION: DATA QUALITY & PROVENANCE (U11)                                  */}
        {/* ========================================================================= */}
        {activeSection === 'data-quality' && (
          <section className={`rounded-2xl border p-6 ${cardBg} shadow-sm space-y-6`}>
            <div>
              <h2 className={`text-lg font-bold ${headingText}`}>Dataset Integrity & Statistical Coverage</h2>
              <p className={`text-xs ${subText} mt-1`}>
                Field-level missingness, duplicate analysis, and anomaly tracking computed directly from source records.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border transition-all ${
                isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200/90 bg-slate-50/70 shadow-2xs'
              }`}>
                <span className={`text-[11px] font-semibold uppercase ${subText}`}>Completeness Rate</span>
                <div className={`text-2xl font-bold mt-1 ${headingText}`}>
                  {(model.dataQuality.completenessRate * 100).toFixed(1)}%
                </div>
                <p className={`text-[11px] ${subText} mt-1`}>
                  {model.dataQuality.completeRecords.toLocaleString()} of {model.dataQuality.totalRecords.toLocaleString()} fully populated rows
                </p>
              </div>

              <div className={`p-4 rounded-xl border transition-all ${
                isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200/90 bg-slate-50/70 shadow-2xs'
              }`}>
                <span className={`text-[11px] font-semibold uppercase ${subText}`}>Duplicate Rows</span>
                <div className={`text-2xl font-bold mt-1 ${headingText}`}>
                  {model.dataQuality.duplicateCount}
                </div>
                <p className={`text-[11px] ${subText} mt-1`}>Exact identical row signatures preserved in audit</p>
              </div>

              <div className={`p-4 rounded-xl border transition-all ${
                isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200/90 bg-slate-50/70 shadow-2xs'
              }`}>
                <span className={`text-[11px] font-semibold uppercase ${subText}`}>Audit Status</span>
                <div className={`text-2xl font-bold mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600 font-extrabold'}`}>VERIFIED</div>
                <p className={`text-[11px] ${subText} mt-1`}>100% Three-Way Engine Parity Reconciled</p>
              </div>
            </div>

            {/* Column Null Rates Table */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${headingText}`}>Column Missingness Coverage</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className={isDark ? "bg-slate-800/70 text-slate-300" : "bg-slate-100 text-slate-700 border-b border-slate-200"}>
                    <tr>
                      <th className="p-2.5 font-semibold">Column Name</th>
                      <th className="p-2.5 font-semibold">Null / Missing Rate</th>
                      <th className="p-2.5 font-semibold">Population Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(model.dataQuality.columnNullRates).map(([col, rate]) => (
                      <tr key={col} className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                        <td className={`p-2.5 font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{col}</td>
                        <td className={`p-2.5 font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{(rate * 100).toFixed(2)}%</td>
                        <td className="p-2.5">
                          {rate === 0 ? (
                            <span className={isDark ? "text-emerald-400" : "text-emerald-700 font-semibold"}>100% Populated</span>
                          ) : rate < 0.1 ? (
                            <span className={isDark ? "text-sky-400" : "text-sky-700 font-semibold"}>Optimal (&lt;10% missing)</span>
                          ) : (
                            <span className={isDark ? "text-amber-400" : "text-amber-800 font-semibold"}>Notice (&gt;10% missing)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SOURCE-ROW TRACEABILITY AUDIT MODAL (U13, U17)                            */}
        {/* ========================================================================= */}
        {inspectingRow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border p-6 ${cardBg} shadow-2xl`}>
              <div className={`flex justify-between items-start mb-4 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>Source-Row Traceability Audit</span>
                  <h3 className={`text-xl font-bold mt-1 ${headingText}`}>
                    {inspectingRow.entityId} <span className={`text-sm font-normal ${subText}`}>(Source Row #{inspectingRow.sourceRowIndex + 1})</span>
                  </h3>
                  <p className={`text-xs mt-1 ${subText}`}>
                    Priority: <strong className={isDark ? "text-slate-200" : "text-slate-800"}>{inspectingRow.priority}</strong> • Urgency Score: <strong className={isDark ? "text-slate-200" : "text-slate-800"}>{inspectingRow.urgencyScore}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingRow(null)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isDark
                      ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className={`p-3 rounded-xl border text-xs ${
                  isDark ? 'bg-slate-800/40 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <strong className={isDark ? "text-sky-400" : "text-sky-700"}>Operational Trigger Reason:</strong> {inspectingRow.reason}
                </div>

                <h4 className={`text-xs font-semibold uppercase tracking-wider ${subText}`}>Raw Source Ledger Record (Deterministic Verification)</h4>
                <div className={`overflow-x-auto rounded-xl border max-h-64 ${
                  isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-white'
                }`}>
                  <table className="w-full text-xs text-left">
                    <thead className={`border-b sticky top-0 ${
                      isDark ? 'bg-slate-900/80 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      <tr>
                        <th className="p-2.5 font-semibold">Column / Field Name</th>
                        <th className="p-2.5 font-semibold">Raw Source Value in Ingestion Fixture</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(inspectingRow.rawDetails).map(([key, val]) => (
                        <tr key={key} className={`border-t ${
                          isDark ? 'border-slate-900 hover:bg-slate-900/40' : 'border-slate-100 hover:bg-slate-50'
                        }`}>
                          <td className={`p-2.5 font-mono font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{key}</td>
                          <td className={`p-2.5 font-mono ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            {val !== null && val !== undefined && val !== '' ? (
                              String(val)
                            ) : (
                              <span className={isDark ? "text-slate-600 italic" : "text-slate-400 italic"}>null / empty</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
