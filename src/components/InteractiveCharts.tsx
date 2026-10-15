import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Globe2,
  PieChart,
  Users,
  ChevronRight,
  Info,
  Layers,
  Filter,
  BarChart3,
  Calendar,
  Sparkles,
  Zap,
  Activity,
  Calculator,
  ArrowUpRight,
} from 'lucide-react';
import { AppDataset } from '../types/dataset';
import { getIndustryTheme, getAdaptedKpiLabels } from '../utils/industryTheme';

interface InteractiveChartsProps {
  data: AppDataset;
  selectedRegion: string;
  setSelectedRegion: (r: string) => void;
  selectedQuarter: string;
  setSelectedQuarter: (q: string) => void;
  selectedChannel: string;
  setSelectedChannel: (c: string) => void;
}

export const InteractiveCharts: React.FC<InteractiveChartsProps> = ({
  data,
  selectedRegion,
  setSelectedRegion,
  selectedQuarter,
  setSelectedQuarter,
  selectedChannel,
  setSelectedChannel,
}) => {
  const { monthlyTrends, regionalPerformance, categorySummaries, customerAccounts, transactions, config, schemaProfile } = data;
  const theme = getIndustryTheme(config.industry);
  const labels = getAdaptedKpiLabels(config.industry, schemaProfile);

  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [chartViewMode, setChartViewMode] = useState<'standard' | 'movingAverage' | 'inCellFormula'>('standard');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('ALL');

  // Filtered transactions based on active slicers
  const filteredTxs = useMemo(() => {
    return transactions.filter((t) => {
      const matchReg = selectedRegion === 'ALL' || t.region === selectedRegion;
      const matchQtr = selectedQuarter === 'ALL' || t.quarter === selectedQuarter;
      const matchCh = selectedChannel === 'ALL' || t.salesChannel === selectedChannel;
      return matchReg && matchQtr && matchCh;
    });
  }, [transactions, selectedRegion, selectedQuarter, selectedChannel]);

  // Derived metrics for filtered slice
  const filteredRev = filteredTxs.reduce((s, t) => s + t.revenue, 0);
  const filteredProfit = filteredTxs.reduce((s, t) => s + t.grossProfit, 0);
  const filteredMargin = filteredRev > 0 ? (filteredProfit / filteredRev) * 100 : 0;

  // Monthly trends scaling
  const maxMonthlyRev = Math.max(...monthlyTrends.map((m) => m.revenue), 1000);

  // Moving Average 3-Month calculation
  const monthlyWithMA = useMemo(() => {
    return monthlyTrends.map((m, idx, arr) => {
      const slice = arr.slice(Math.max(0, idx - 2), idx + 1);
      const avg = slice.reduce((s, x) => s + x.revenue, 0) / slice.length;
      return {
        ...m,
        movingAvg: avg,
      };
    });
  }, [monthlyTrends]);

  // Pareto Cumulative Analysis (80/20 Customer Concentration)
  const paretoData = useMemo(() => {
    const sorted = [...customerAccounts].sort((a, b) => b.lifetimeRevenue - a.lifetimeRevenue);
    const total = sorted.reduce((s, a) => s + a.lifetimeRevenue, 0);
    let cum = 0;
    return sorted.slice(0, 8).map((acc, idx) => {
      cum += acc.lifetimeRevenue;
      const cumPct = total > 0 ? (cum / total) * 100 : 0;
      return {
        ...acc,
        sharePct: total > 0 ? (acc.lifetimeRevenue / total) * 100 : 0,
        cumPct,
      };
    });
  }, [customerAccounts]);

  // Channel breakdown
  const channelStats = useMemo(() => {
    const map = new Map<string, { revenue: number; profit: number; count: number }>();
    filteredTxs.forEach((t) => {
      if (!map.has(t.salesChannel)) {
        map.set(t.salesChannel, { revenue: 0, profit: 0, count: 0 });
      }
      const c = map.get(t.salesChannel)!;
      c.revenue += t.revenue;
      c.profit += t.grossProfit;
      c.count += 1;
    });
    const totalR = filteredRev || 1;
    return Array.from(map.entries()).map(([name, stat]) => ({
      name,
      revenue: stat.revenue,
      profit: stat.profit,
      count: stat.count,
      share: (stat.revenue / totalR) * 100,
      margin: stat.revenue > 0 ? (stat.profit / stat.revenue) * 100 : 0,
    }));
  }, [filteredTxs, filteredRev]);

  // Sales rep leaderboard
  const repStats = useMemo(() => {
    const map = new Map<string, { revenue: number; profit: number; count: number }>();
    filteredTxs.forEach((t) => {
      if (!map.has(t.salesRep)) {
        map.set(t.salesRep, { revenue: 0, profit: 0, count: 0 });
      }
      const r = map.get(t.salesRep)!;
      r.revenue += t.revenue;
      r.profit += t.grossProfit;
      r.count += 1;
    });
    return Array.from(map.entries())
      .map(([name, stat]) => ({ name, ...stat }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredTxs]);

  // Quarters list
  const availableQuarters = Array.from(new Set(transactions.map((t) => t.quarter))).filter(Boolean).sort();
  const availableRegions = Array.from(new Set(transactions.map((t) => t.region))).filter(Boolean).sort();
  const availableChannels = Array.from(new Set(transactions.map((t) => t.salesChannel))).filter(Boolean).sort();

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* INTERACTIVE GLOBAL SLICER & DRILL-DOWN CONTROL BAR        */}
      {/* ========================================================= */}
      <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">Interactive Slicer Panel</h4>
            <p className="text-[11px] text-slate-500">Select dimensions to recalculate dashboard analytics dynamically</p>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Dimension / Region Slicer */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
            <Globe2 className="w-3.5 h-3.5 text-sky-700" />
            <span className="text-slate-500 text-[11px]">{labels.dimensionLabel}:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="ALL">All {labels.dimensionLabel}s</option>
              {availableRegions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Quarter Slicer */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-indigo-700" />
            <span className="text-slate-500 text-[11px]">Period:</span>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Periods</option>
              {availableQuarters.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>

          {/* Channel Slicer */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
            <Layers className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-slate-500 text-[11px]">Channel:</span>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="ALL">All Channels</option>
              {availableChannels.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {(selectedRegion !== 'ALL' || selectedQuarter !== 'ALL' || selectedChannel !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedRegion('ALL');
                setSelectedQuarter('ALL');
                setSelectedChannel('ALL');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Sliced Dynamic Status Pill */}
      {(selectedRegion !== 'ALL' || selectedQuarter !== 'ALL' || selectedChannel !== 'ALL') && (
        <div className="p-3 rounded-xl bg-sky-50 border border-sky-500/30 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-700 animate-pulse" />
            <span>
              Active Filtered Subset: <strong>{filteredTxs.length.toLocaleString()}</strong> orders • Revenue:{' '}
              <strong className="text-slate-900">${filteredRev.toLocaleString()}</strong> • Gross Profit:{' '}
              <strong className="text-emerald-700">${filteredProfit.toLocaleString()}</strong> • Margin:{' '}
              <strong className="text-indigo-700">{filteredMargin.toFixed(1)}%</strong>
            </span>
          </div>
          <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
            Filtered Dynamic Slicer Active
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* ROW 1: MONTHLY TRAJECTORY & REGIONAL BULLET QUOTA CHART   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual 1: Monthly Run-Rate Trajectory */}
        <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-700" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Monthly {labels.metric1} &amp; {labels.metric2} Trajectory
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Interactive dual-series with volume indicators and run-rate overlay
              </p>
            </div>

            {/* View Mode Toggle: Standard vs Moving Average vs In-Cell Formula */}
            <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setChartViewMode('standard')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  chartViewMode === 'standard'
                    ? 'bg-sky-500/20 text-sky-800 font-bold border border-sky-500/30'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setChartViewMode('movingAverage')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  chartViewMode === 'movingAverage'
                    ? 'bg-emerald-500/20 text-emerald-800 font-bold border border-emerald-500/30'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                3-Mo Moving Avg
              </button>
              <button
                onClick={() => setChartViewMode('inCellFormula')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                  chartViewMode === 'inCellFormula'
                    ? 'bg-indigo-500/20 text-indigo-800 font-bold border border-indigo-500/30'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="View how Excel calculates in-cell visual bars using =REPT()"
              >
                <Calculator className="w-3 h-3" />
                <span>Excel =REPT() View</span>
              </button>
            </div>
          </div>

          {/* If In-Cell Formula mode is selected, show authentic Excel formula visual grid */}
          {chartViewMode === 'inCellFormula' ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 pb-2 border-b border-slate-200">
                <span>Month Period</span>
                <span>Revenue ($)</span>
                <span>Formula: `=REPT("█", ROUND(Rev/Max*20,0))`</span>
                <span>Margin %</span>
              </div>
              {monthlyTrends.slice(0, 10).map((m, idx) => {
                const barLength = Math.max(1, Math.round((m.revenue / maxMonthlyRev) * 18));
                return (
                  <div key={idx} className="flex items-center justify-between py-1 text-slate-600 hover:bg-white px-2 rounded">
                    <span className="w-20 font-bold text-slate-900">{m.monthLabel}</span>
                    <span className="w-24 text-sky-700">${(m.revenue / 1000).toFixed(1)}k</span>
                    <span className="flex-1 text-sky-700 font-bold tracking-tight">
                      {'█'.repeat(barLength)}
                    </span>
                    <span className="w-16 text-right text-emerald-700">{(m.marginPct * 100).toFixed(1)}%</span>
                  </div>
                );
              })}
              <div className="pt-2 text-[10px] text-slate-500 font-sans italic">
                This exact formula `=REPT("█", ...)` is embedded in Sheet 1 of the downloaded Excel workbook to create responsive native in-cell visual charts!
              </div>
            </div>
          ) : (
            /* Interactive Graphical Chart Canvas */
            <div className="relative pt-6 pb-2">
              {/* Tooltip */}
              {hoveredMonth !== null && monthlyWithMA[hoveredMonth] && (
                <div className="absolute top-0 right-4 bg-slate-100/95 border border-slate-200 rounded-lg p-2.5 text-xs shadow-lg z-20 pointer-events-none flex items-center gap-4 animate-in fade-in">
                  <div>
                    <span className="text-slate-900 font-bold">{monthlyWithMA[hoveredMonth].monthLabel}:</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Revenue: </span>
                    <span className="text-slate-900 font-bold font-mono">
                      ${(monthlyWithMA[hoveredMonth].revenue / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Profit: </span>
                    <span className="text-emerald-700 font-bold font-mono">
                      ${(monthlyWithMA[hoveredMonth].grossProfit / 1000).toFixed(1)}k
                    </span>
                  </div>
                  {chartViewMode === 'movingAverage' && (
                    <div>
                      <span className="text-slate-500">3-Mo Avg: </span>
                      <span className="text-indigo-700 font-bold font-mono">
                        ${(monthlyWithMA[hoveredMonth].movingAvg / 1000).toFixed(1)}k
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500">Margin: </span>
                    <span className="text-indigo-800 font-bold font-mono">
                      {(monthlyWithMA[hoveredMonth].marginPct * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Bars and Markers */}
              <div className="h-64 flex items-end gap-1.5 sm:gap-3 px-2 border-b border-slate-200 relative">
                {/* Horizontal reference guidelines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-b border-dashed border-slate-400 w-full" />
                  <div className="border-b border-dashed border-slate-400 w-full" />
                  <div className="border-b border-dashed border-slate-400 w-full" />
                  <div className="border-b border-slate-600 w-full" />
                </div>

                {monthlyWithMA.map((t, idx) => {
                  const revHeight = Math.max(6, (t.revenue / maxMonthlyRev) * 100);
                  const profHeight = Math.max(4, (t.grossProfit / maxMonthlyRev) * 100);
                  const maHeight = Math.max(4, (t.movingAvg / maxMonthlyRev) * 100);
                  const isHovered = hoveredMonth === idx;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                      onMouseEnter={() => setHoveredMonth(idx)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      {/* Profit Dot Marker */}
                      <div
                        className="absolute z-10 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 group-hover:scale-150 transition-transform shadow-md"
                        style={{ bottom: `${profHeight}%` }}
                        title={`Profit: $${(t.grossProfit / 1000).toFixed(1)}k`}
                      />

                      {/* Moving Average Line Marker if active */}
                      {chartViewMode === 'movingAverage' && (
                        <div
                          className="absolute z-10 w-3 h-1 rounded-full bg-amber-400 shadow-sm"
                          style={{ bottom: `${maHeight}%` }}
                          title={`3-Mo Avg: $${(t.movingAvg / 1000).toFixed(1)}k`}
                        />
                      )}

                      {/* Revenue Bar with Industry Color Grading */}
                      <div
                        className="w-full rounded-t-sm transition-all duration-200"
                        style={{
                          height: `${revHeight}%`,
                          backgroundColor: isHovered ? theme.colors.accent : theme.colors.primary,
                          boxShadow: isHovered ? `0 4px 14px ${theme.colors.cardGlow}` : undefined,
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-axis Month Labels */}
              <div className="flex items-center justify-between px-2 pt-2 text-[10px] sm:text-xs text-slate-500 font-mono">
                {monthlyWithMA.map((t, idx) => (
                  <div key={idx} className="flex-1 text-center truncate">
                    {t.monthLabel}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Legend */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-sky-500"></span>
                <span className="text-slate-600">Gross Revenue Bar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-slate-600">Gross Profit Marker</span>
              </div>
              {chartViewMode === 'movingAverage' && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded bg-amber-400"></span>
                  <span className="text-amber-800">3-Month Moving Average</span>
                </div>
              )}
            </div>
            <span className="text-slate-500 text-[11px] hidden sm:inline">100% Native Excel Compatible</span>
          </div>
        </div>

        {/* Visual 2: Regional Bullet & Variance Chart */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {labels.dimensionLabel} Attainment &amp; Variance
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-800/40 px-2 py-0.5 rounded">
                Scorecard
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Actual booked {labels.metric1.toLowerCase()} compared against benchmark targets
            </p>

            <div className="space-y-3.5">
              {regionalPerformance.map((r, i) => {
                const attainmentPct = Math.round(r.quotaAttainmentPct * 100);
                const isOver = attainmentPct >= 100;
                const variance = r.actualRevenue - r.targetRevenue;
                const isSelected = selectedRegion === r.region;

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedRegion(selectedRegion === r.region ? 'ALL' : r.region)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500/80'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div>
                        <span className="font-bold text-slate-900">{r.region}</span>
                        <span className="text-slate-500 ml-1.5 text-[11px]">({r.regionalDirector})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          ${(r.actualRevenue / 1000).toFixed(0)}k
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isOver
                              ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                          }`}
                        >
                          {attainmentPct}%
                        </span>
                      </div>
                    </div>

                    {/* Progress track */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, attainmentPct)}%`,
                          backgroundColor: isOver ? '#10B981' : theme.colors.primary,
                        }}
                      />
                    </div>

                    {/* Variance info */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-mono">
                      <span>Target: ${(r.targetRevenue / 1000).toFixed(0)}k</span>
                      <span className={variance >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {variance >= 0 ? `+${(variance / 1000).toFixed(0)}k` : `${(variance / 1000).toFixed(0)}k`} Var
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Click any territory to filter</span>
            <span className="text-emerald-700 font-mono font-bold">4 Theaters</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ROW 2: CATEGORY MATRIX & CUSTOMER CONCENTRATION (PARETO)  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual 3: Product Category Margin & Revenue Matrix */}
        <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-700" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Product Category Margin & Volume Dispersion Matrix
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of unit volume, gross revenue share, and product line margins
              </p>
            </div>
            <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-800/40 px-2 py-0.5 rounded">
              Dispersion
            </span>
          </div>

          <div className="space-y-3">
            {categorySummaries.map((cat, i) => {
              const maxCatRev = categorySummaries[0]?.revenue || 1;
              const widthPct = (cat.revenue / maxCatRev) * 100;

              return (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-200 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      <span className="font-bold text-slate-900">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-slate-500 text-[11px]">{cat.units.toLocaleString()} units</span>
                      <span className="text-slate-900 font-bold">${(cat.revenue / 1000).toFixed(1)}k</span>
                      <span className="text-slate-500 text-[11px]">({(cat.sharePct * 100).toFixed(1)}% Share)</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-800 border border-indigo-500/30 font-bold">
                        {(cat.marginPct * 100).toFixed(1)}% Mgn
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual 4: Customer Pareto Concentration (80/20 Curve) */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-700" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Customer Pareto Concentration (80/20)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-pink-700 bg-pink-50 border border-pink-800/40 px-2 py-0.5 rounded">
                Pareto
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Cumulative revenue share generated by top enterprise accounts
            </p>

            <div className="space-y-2.5">
              {paretoData.slice(0, 5).map((acc, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-900 truncate max-w-[170px]" title={acc.customerName}>
                      {i + 1}. {acc.customerName}
                    </span>
                    <span className="font-mono text-emerald-700 font-bold">
                      ${(acc.lifetimeRevenue / 1000).toFixed(0)}k
                    </span>
                  </div>

                  {/* Cumulative share bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, acc.cumPct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                    <span>{acc.tier.replace('Enterprise Strategic', 'Strategic')}</span>
                    <span>Cum: {acc.cumPct.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500">
            <span>Top 5 accounts represent </span>
            <strong className="text-slate-900">
              {paretoData[4]?.cumPct ? `${paretoData[4].cumPct.toFixed(1)}%` : '68%'}
            </strong>
            <span> of total revenue</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ROW 3: CHANNELS & SALES REP PERFORMANCE LEADERBOARD      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Channels Mix */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-700" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Sales Channel Mix & Margin Efficiency</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {channelStats.map((ch, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900">{ch.name}</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                    ${(ch.revenue / 1000).toFixed(0)}k
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">{ch.share.toFixed(1)}% Share</span>
                  <span className="text-emerald-700 font-bold">{ch.margin.toFixed(1)}% Mgn</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Rep Leaderboard */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Sales Executive Quota Leaderboard</h3>
          </div>

          <div className="space-y-2">
            {repStats.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-600">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">{r.name}</span>
                    <span className="text-slate-500 text-[11px] ml-2 font-mono">({r.count} contracts)</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-slate-900 font-bold">${(r.revenue / 1000).toFixed(0)}k</div>
                  <div className="text-emerald-700 text-[10px]">
                    Margin: {r.revenue > 0 ? ((r.profit / r.revenue) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
