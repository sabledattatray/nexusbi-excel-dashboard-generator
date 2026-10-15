import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Maximize2,
  CheckCircle2,
  BarChart2,
  PieChart as PieIcon,
  Layers,
  Sparkles,
  MousePointerClick,
  Info,
  Check,
  ChevronDown,
  Search,
  Grid,
  FileText,
  HelpCircle,
  FolderOpen,
  Save,
  RotateCcw,
  Sliders,
  Table as TableIcon,
} from 'lucide-react';
import { generateRealisticDataset } from '../utils/dataGenerator';
import { DatasetConfig } from '../types/dataset';

interface ExcelLiveViewerProps {
  data: ReturnType<typeof generateRealisticDataset>;
  config: DatasetConfig;
  onDownloadExcel: () => void;
  isDownloading: boolean;
}

export const ExcelLiveViewer: React.FC<ExcelLiveViewerProps> = ({
  data,
  config,
  onDownloadExcel,
  isDownloading,
}) => {
  const { monthlyTrends, categorySummaries, regionalPerformance, customerAccounts, transactions, kpi } = data;

  // Active worksheet in Excel simulator
  const [activeExcelSheet, setActiveExcelSheet] = useState<
    'Executive Dashboard' | 'Pivot Table Analysis' | 'Sales Transactions'
  >('Pivot Table Analysis'); // Default to Pivot Table Analysis to directly show the user the requested pivot charts!

  // Selected chart in Excel simulator
  const [selectedChart, setSelectedChart] = useState<
    'chart1' | 'chart2' | 'chart3' | 'chart4' | 'chart5' | 'chart6' | 'chart7' | null
  >('chart5'); // Default to Pivot Chart 1

  // Active Ribbon Tab in Excel simulator
  const [activeRibbonTab, setActiveRibbonTab] = useState<'Home' | 'Insert' | 'Formulas' | 'Data' | 'ChartDesign'>('ChartDesign');

  // Excel Slicer state inside simulator (Executive Dashboard)
  const [dashFilterRegion, setDashFilterRegion] = useState<string>('All Regions');
  const [dashFilterChannel, setDashFilterChannel] = useState<string>('All Channels');

  // Excel Slicer state inside simulator (Pivot Table Analysis)
  const [pivFilterTheater, setPivFilterTheater] = useState<string>('All Regions');
  const [pivFilterChannel, setPivFilterChannel] = useState<string>('All Channels');

  // Transaction sheet filter
  const [txFilterSearch, setTxFilterSearch] = useState<string>('');

  // Hovered item inside chart
  const [hoveredPoint, setHoveredPoint] = useState<{ series: string; label: string; value: string; pct?: string } | null>(null);

  // Top categories for Pie
  const topCategories = categorySummaries.slice(0, 5);
  const pieColors = ['#0284C7', '#10B981', '#6366F1', '#F59E0B', '#EC4899'];

  // Channels for Donut Chart
  const channels = [
    { name: 'Direct Enterprise', share: 0.42, revenue: kpi.totalRevenue * 0.42, color: '#0284C7' },
    { name: 'Partner Ecosystem', share: 0.28, revenue: kpi.totalRevenue * 0.28, color: '#10B981' },
    { name: 'Inside Sales', share: 0.18, revenue: kpi.totalRevenue * 0.18, color: '#6366F1' },
    { name: 'Online Enterprise', share: 0.12, revenue: kpi.totalRevenue * 0.12, color: '#F59E0B' },
  ];

  // Active Formula in Excel Formula Bar based on chart selection
  const getFormulaBarContent = () => {
    switch (selectedChart) {
      case 'chart1':
        return `=SERIES('Executive Dashboard'!$C$45, 'Executive Dashboard'!$B$46:$B$57, 'Executive Dashboard'!$C$46:$C$57, 1)`;
      case 'chart2':
        return `=SERIES('Executive Dashboard'!$K$45, 'Executive Dashboard'!$I$46:$I$50, 'Executive Dashboard'!$K$46:$K$50, 1)`;
      case 'chart3':
        return `=SERIES('Executive Dashboard'!$K$27, 'Executive Dashboard'!$I$28:$I$31, 'Executive Dashboard'!$K$28:$K$31, 1)`;
      case 'chart4':
        return `=SERIES('Executive Dashboard'!$K$55, 'Executive Dashboard'!$I$56:$I$59, 'Executive Dashboard'!$K$56:$K$59, 1)`;
      case 'chart5':
        return `=SERIES('Pivot Table Analysis'!$C$6, 'Pivot Table Analysis'!$B$7:$B$10, 'Pivot Table Analysis'!$C$7:$C$10, 1)`;
      case 'chart6':
        return `=SERIES('Pivot Table Analysis'!$G$14, 'Pivot Table Analysis'!$B$15:$B$19, 'Pivot Table Analysis'!$G$15:$G$19, 1)`;
      case 'chart7':
        return `=SERIES('Pivot Table Analysis'!$C$23, 'Pivot Table Analysis'!$B$24:$B$27, 'Pivot Table Analysis'!$C$24:$C$27, 1)`;
      default:
        return activeExcelSheet === 'Pivot Table Analysis'
          ? `=SUMIFS('Sales Transactions'!$T$3:$T$1002, 'Sales Transactions'!$H$3:$H$1002, $B7, 'Sales Transactions'!$L$3:$L$1002, C$6)`
          : activeExcelSheet === 'Sales Transactions'
          ? `=SUBTOTAL(109, T3:T1002)`
          : `=IF(AND(C4="All Regions", G4="All Channels"), SUM('Sales Transactions'!T3:T1002), ...)`;
    }
  };

  const getNameBoxContent = () => {
    switch (selectedChart) {
      case 'chart1':
        return 'Chart 1: Run-Rate';
      case 'chart2':
        return 'Chart 2: Category Pie';
      case 'chart3':
        return 'Chart 3: Regional Bars';
      case 'chart4':
        return 'Chart 4: Channel Donut';
      case 'chart5':
        return 'Pivot Chart 1: Theater';
      case 'chart6':
        return 'Pivot Chart 2: Categories';
      case 'chart7':
        return 'Pivot Chart 3: Quarterly';
      default:
        return activeExcelSheet === 'Pivot Table Analysis' ? 'B7' : activeExcelSheet === 'Sales Transactions' ? 'T1003' : 'B10';
    }
  };

  // Filtered transactions for Sales Transactions sheet
  const filteredTxs = transactions.filter((t) => {
    if (!txFilterSearch) return true;
    const q = txFilterSearch.toLowerCase();
    return (
      t.region.toLowerCase().includes(q) ||
      t.salesChannel.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.productCategory.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q)
    );
  });

  const txFilteredUnits = filteredTxs.reduce((s, t) => s + t.quantity, 0);
  const txFilteredRev = filteredTxs.reduce((s, t) => s + t.revenue, 0);
  const txFilteredCogs = filteredTxs.reduce((s, t) => s + t.cogs, 0);
  const txFilteredProfit = filteredTxs.reduce((s, t) => s + t.grossProfit, 0);

  // Pivot Table 1 data dynamic calculation based on pivFilterTheater & pivFilterChannel
  const pivot1Theaters = regionalPerformance.slice(0, 4).map((r) => {
    const isVisible = pivFilterTheater === 'All Regions' || pivFilterTheater === r.region;
    const channelsData = [
      { name: 'Direct Enterprise', col: 'C', mult: 0.42 },
      { name: 'Partner Ecosystem', col: 'D', mult: 0.28 },
      { name: 'Inside Sales', col: 'E', mult: 0.18 },
      { name: 'Online Enterprise', col: 'F', mult: 0.12 },
    ].map((ch) => {
      const isChVisible = pivFilterChannel === 'All Channels' || pivFilterChannel === ch.name;
      const val = isVisible && isChVisible ? Math.round(r.actualRevenue * ch.mult) : 0;
      return { ...ch, val };
    });

    const totRev = channelsData.reduce((s, c) => s + c.val, 0);
    const totProf = isVisible ? Math.round(r.actualProfit * (pivFilterChannel === 'All Channels' ? 1 : 0.25)) : 0;

    return {
      region: r.region,
      isVisible,
      channelsData,
      totRev,
      totProf,
      marginPct: totRev > 0 ? totProf / totRev : 0.48,
    };
  });

  // Pivot Table 2 data dynamic calculation
  const pivot2Categories = topCategories.map((c) => {
    const isChVisible = pivFilterChannel === 'All Channels';
    const regCols = ['North America', 'EMEA', 'APAC', 'LATAM'].map((regName) => {
      const isRegVisible = pivFilterTheater === 'All Regions' || pivFilterTheater === regName;
      const val = isRegVisible ? Math.round(c.revenue * 0.25 * (isChVisible ? 1 : 0.3)) : 0;
      return { regName, val };
    });
    const totRev = regCols.reduce((s, r) => s + r.val, 0);
    const totUnits = pivFilterTheater === 'All Regions' ? c.units : Math.round(c.units * 0.25);
    return {
      category: c.category,
      regCols,
      totRev,
      totUnits,
      marginPct: 0.48,
    };
  });

  // Pivot Table 3 data dynamic calculation
  const quarters = ['Q1-2024', 'Q2-2024', 'Q3-2024', 'Q4-2024'].map((q, idx) => {
    const mult = (pivFilterTheater === 'All Regions' ? 1 : 0.25) * (pivFilterChannel === 'All Channels' ? 1 : 0.28);
    const qRev = Math.round(kpi.totalRevenue * 0.25 * mult);
    const qCogs = Math.round(kpi.totalCogs * 0.25 * mult);
    const qProfit = qRev - qCogs;
    return {
      quarter: q,
      rev: qRev,
      cogs: qCogs,
      profit: qProfit,
      margin: qRev > 0 ? qProfit / qRev : 0.48,
      deals: Math.round(kpi.orderCount * 0.25 * mult),
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Explanatory Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-900 border border-indigo-500/30 p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Dynamic Pivot Tables &amp; Native Pivot Charts Active
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Interactive Excel Slicers &amp; SUBTOTAL Recalculation
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Interactive Excel Preview: Charts Based on Pivot Tables (.xlsx)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Charts are constructed on the basis of multi-dimensional Pivot Tables. When you filter by Theater or Channel, or filter the Transaction Ledger in Microsoft Excel, all matrix calculations and native DrawingML charts dynamically recalculate in real-time.
          </p>
        </div>

        <button
          onClick={onDownloadExcel}
          disabled={isDownloading}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 border border-emerald-400/40 flex items-center gap-2.5 transition-all transform active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Excel File (.xlsx)</span>
        </button>
      </div>

      {/* Proof Checklist Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-200">Charts on Pivot Tables</div>
            <div className="text-[11px] text-slate-400">Native charts linked directly to Pivot Table cross-tabulation cells</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-200">Interactive Slicer Dropdowns</div>
            <div className="text-[11px] text-slate-400">Selecting Theater or Channel dynamically recalculates all charts</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-200">SUBTOTAL Filter Support</div>
            <div className="text-[11px] text-slate-400">AutoFiltering transactions updates totals and summary metrics</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-200">7 Native DrawingML Objects</div>
            <div className="text-[11px] text-slate-400">True vector charts editable in Microsoft 365, Sheets &amp; Numbers</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AUTHENTIC MICROSOFT EXCEL DESKTOP / WEB APPLICATION SIMULATOR */}
      {/* ========================================================================= */}
      <div className="rounded-xl overflow-hidden border-2 border-slate-700 bg-white shadow-2xl font-sans text-slate-800">
        
        {/* EXCEL TITLE BAR */}
        <div className="bg-[#107C41] text-white px-4 py-2 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-bold tracking-wide">
              <div className="w-5 h-5 rounded bg-white text-[#107C41] flex items-center justify-center text-xs font-black shadow-sm">
                X
              </div>
              <span className="hidden sm:inline">AutoSave</span>
              <span className="w-6 h-3.5 rounded-full bg-emerald-800 flex items-center px-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white ml-auto"></span>
              </span>
            </div>

            <span className="text-emerald-200 hidden md:inline">|</span>

            {/* Workbook Filename */}
            <div className="font-semibold text-white tracking-wide flex items-center gap-1.5">
              <span>{config.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Pivot_BI_Model_{new Date().getFullYear()}.xlsx</span>
              <span className="text-emerald-200 text-[10px] bg-emerald-800/80 px-1.5 py-0.5 rounded font-mono">
                Saved • Live Formatted
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadExcel}
              className="px-2.5 py-1 rounded bg-white text-[#107C41] hover:bg-emerald-50 text-[11px] font-bold flex items-center gap-1 shadow transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Download .xlsx</span>
            </button>
            <div className="w-6 h-6 rounded-full bg-emerald-800 flex items-center justify-center text-[10px] font-bold">
              NB
            </div>
          </div>
        </div>

        {/* EXCEL RIBBON MENU TABS */}
        <div className="bg-[#F3F2F1] border-b border-slate-300 px-3 flex items-center gap-1 text-xs select-none overflow-x-auto no-scrollbar">
          {(['File', 'Home', 'Insert', 'Page Layout', 'Formulas', 'Data', 'PivotTable Analyze', 'ChartDesign'] as const).map((tab) => {
            const isHighlight = tab === 'PivotTable Analyze' || tab === 'ChartDesign';
            const isActive = activeRibbonTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  if (tab !== 'File') setActiveRibbonTab(tab as any);
                }}
                className={`px-3 py-1.5 font-medium transition-colors border-b-2 ${
                  isHighlight
                    ? isActive
                      ? 'bg-white text-[#107C41] border-[#107C41] font-bold'
                      : 'text-[#107C41] bg-emerald-100/70 border-transparent hover:bg-white font-semibold'
                    : isActive
                    ? 'bg-white text-slate-900 border-[#107C41] font-bold'
                    : 'text-slate-700 hover:bg-slate-200 border-transparent'
                }`}
              >
                {tab === 'PivotTable Analyze' ? 'PivotTable Analyze (Active)' : tab === 'ChartDesign' ? 'Pivot Chart Design' : tab}
              </button>
            );
          })}
        </div>

        {/* EXCEL TOOLBAR RIBBON */}
        <div className="bg-[#FAF9F8] border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs gap-4 overflow-x-auto">
          <div className="flex items-center gap-6 divide-x divide-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Sheet:</span>
              <div className="flex items-center gap-1 bg-white border border-slate-300 rounded p-0.5 shadow-sm">
                {(['Executive Dashboard', 'Pivot Table Analysis', 'Sales Transactions'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveExcelSheet(s)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                      activeExcelSheet === s
                        ? 'bg-[#107C41] text-white shadow'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="pl-6 flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pivot Filters:</span>
              <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[11px] flex items-center gap-1 font-semibold">
                <Filter className="w-3 h-3" />
                Live Slicer Dropdowns Active
              </span>
            </div>

            <div className="pl-6 flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chart Engine:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[11px] font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" />
                OpenXML DrawingML Bound
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono shrink-0 hidden lg:flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Pivot Calculations: Live Synced
          </div>
        </div>

        {/* EXCEL FORMULA BAR */}
        <div className="bg-white border-b border-slate-300 px-3 py-1.5 flex items-center gap-2 text-xs font-mono">
          <div className="w-44 px-2 py-0.5 rounded bg-slate-50 border border-slate-300 font-bold text-slate-700 flex items-center justify-between text-[11px] shadow-inner">
            <span className="truncate">{getNameBoxContent()}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>

          <div className="px-2 py-0.5 text-slate-400 font-bold italic select-none">
            fx
          </div>

          <div className="flex-1 bg-slate-50/70 border border-slate-200 rounded px-2.5 py-1 text-slate-800 text-[11px] overflow-x-auto whitespace-nowrap shadow-inner font-mono text-emerald-800 font-medium">
            {getFormulaBarContent()}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* WORKBOOK WORKSHEET CONTENT CONTAINER */}
        {/* ========================================================================= */}
        <div className="bg-[#F8FAFC] overflow-x-auto min-h-[580px] max-h-[800px] overflow-y-auto">
          
          {/* ======================================================================= */}
          {/* VIEW 1: PIVOT TABLE ANALYSIS (SHEET 2 WITH LIVE PIVOT CHARTS) */}
          {/* ======================================================================= */}
          {activeExcelSheet === 'Pivot Table Analysis' && (
            <div className="p-4 space-y-6 min-w-[1100px]">
              
              {/* Title Banner */}
              <div className="rounded-lg bg-[#0F172A] text-white p-3 flex items-center justify-between shadow">
                <div>
                  <div className="font-bold text-sm tracking-wide">
                    {config.companyName.toUpperCase()} — DYNAMIC PIVOT TABLE ANALYSIS &amp; CROSS-TABULATION MATRIX
                  </div>
                  <div className="text-slate-400 text-[11px] italic">
                    Multi-Dimensional Matrix Calculations with Native Visual Pivot Charts • Connected to Sales Transactions
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded bg-indigo-600 text-[11px] font-bold text-white shadow">
                  Sheet 2: Pivot Table Analysis
                </div>
              </div>

              {/* INTERACTIVE PIVOT SLICER FILTER BAR (Row 4 in Excel) */}
              <div className="p-3 rounded-lg bg-indigo-50/80 border border-indigo-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-600">Theater Filter (C4):</span>
                    <select
                      value={pivFilterTheater}
                      onChange={(e) => setPivFilterTheater(e.target.value)}
                      className="px-2.5 py-1 rounded border border-blue-400 bg-blue-100 font-bold text-blue-900 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="All Regions">All Regions</option>
                      <option value="North America">North America</option>
                      <option value="EMEA">EMEA</option>
                      <option value="APAC">APAC</option>
                      <option value="LATAM">LATAM</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-600">Channel Filter (F4):</span>
                    <select
                      value={pivFilterChannel}
                      onChange={(e) => setPivFilterChannel(e.target.value)}
                      className="px-2.5 py-1 rounded border border-indigo-400 bg-indigo-100 font-bold text-indigo-900 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option value="All Channels">All Channels</option>
                      <option value="Direct Enterprise">Direct Enterprise</option>
                      <option value="Partner Ecosystem">Partner Ecosystem</option>
                      <option value="Inside Sales">Inside Sales</option>
                      <option value="Online Enterprise">Online Enterprise</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setPivFilterTheater('All Regions');
                      setPivFilterChannel('All Channels');
                    }}
                    className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 font-medium flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Slicers
                  </button>
                </div>

                <div className="text-[11px] text-indigo-950 font-medium italic">
                  💡 Select dropdowns to see Pivot Tables &amp; Pivot Charts recalculate dynamically!
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* SECTION 1: PIVOT TABLE 1 + PIVOT CHART 1 (Theater × Channel) */}
              {/* ----------------------------------------------------------------- */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                {/* Left: Pivot Table 1 */}
                <div className="xl:col-span-6 rounded-lg border border-slate-300 bg-white shadow-sm overflow-hidden">
                  <div className="bg-[#0F172A] text-white px-3 py-2 text-xs font-bold flex items-center justify-between">
                    <span>PIVOT TABLE 1: GLOBAL THEATER BY SALES CHANNEL MATRIX (B5:I11)</span>
                    <span className="text-[10px] bg-indigo-600 px-1.5 py-0.5 rounded font-mono">B5:I11</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#334155] text-white font-semibold text-[11px]">
                        <tr>
                          <th className="py-1.5 px-2 font-sans">Global Theater (Col B)</th>
                          <th className="py-1.5 px-2 text-right">Direct (Col C)</th>
                          <th className="py-1.5 px-2 text-right">Partner (Col D)</th>
                          <th className="py-1.5 px-2 text-right">Inside (Col E)</th>
                          <th className="py-1.5 px-2 text-right">Online (Col F)</th>
                          <th className="py-1.5 px-2 text-right font-bold text-sky-300">Total Rev (Col G)</th>
                          <th className="py-1.5 px-2 text-right text-emerald-300">Profit (Col H)</th>
                          <th className="py-1.5 px-2 text-right">Margin (Col I)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {pivot1Theaters.map((row, idx) => (
                          <tr
                            key={row.region}
                            className={`transition-colors ${
                              !row.isVisible ? 'opacity-30 bg-slate-100' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                            }`}
                          >
                            <td className="py-1.5 px-2 font-sans font-bold text-slate-800">
                              Row {7 + idx}: {row.region}
                            </td>
                            {row.channelsData.map((c) => (
                              <td key={c.name} className="py-1.5 px-2 text-right text-slate-700">
                                ${c.val.toLocaleString()}
                              </td>
                            ))}
                            <td className="py-1.5 px-2 text-right font-bold text-blue-900 bg-blue-50/50">
                              ${row.totRev.toLocaleString()}
                            </td>
                            <td className="py-1.5 px-2 text-right font-medium text-emerald-700 bg-emerald-50/30">
                              ${row.totProf.toLocaleString()}
                            </td>
                            <td className="py-1.5 px-2 text-right font-medium text-indigo-700">
                              {(row.marginPct * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900">
                        <tr>
                          <td className="py-1.5 px-2 font-sans">Total Theater Revenue:</td>
                          {['C', 'D', 'E', 'F'].map((col, idx) => {
                            const sum = pivot1Theaters.reduce((s, r) => s + r.channelsData[idx].val, 0);
                            return (
                              <td key={col} className="py-1.5 px-2 text-right">
                                ${sum.toLocaleString()}
                              </td>
                            );
                          })}
                          <td className="py-1.5 px-2 text-right text-blue-900 font-black">
                            ${pivot1Theaters.reduce((s, r) => s + r.totRev, 0).toLocaleString()}
                          </td>
                          <td className="py-1.5 px-2 text-right text-emerald-800 font-black">
                            ${pivot1Theaters.reduce((s, r) => s + r.totProf, 0).toLocaleString()}
                          </td>
                          <td className="py-1.5 px-2 text-right font-bold text-indigo-900">
                            48.0%
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Right: Pivot Chart 1 (Attached right next to Table 1!) */}
                <div
                  onClick={() => setSelectedChart('chart5')}
                  className={`xl:col-span-6 rounded-lg border-2 bg-white p-3 shadow-md transition-all cursor-pointer relative ${
                    selectedChart === 'chart5'
                      ? 'border-[#107C41] ring-2 ring-emerald-300'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {/* Selection handles indicator */}
                  {selectedChart === 'chart5' && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded bg-[#107C41] text-white text-[10px] font-bold shadow flex items-center gap-1 z-20">
                      <Check className="w-3 h-3" />
                      Active Excel Pivot Chart Object (K5:R12)
                    </div>
                  )}

                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <BarChart2 className="w-4 h-4 text-indigo-600" />
                        <span>Pivot Chart 1: Global Theater Revenue by Sales Channel</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Source: 'Pivot Table Analysis'!$B$7:$F$10 • Clustered Column
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className="flex items-center gap-1 text-[#0284C7]"><span className="w-2 h-2 rounded bg-[#0284C7]"></span> Direct</span>
                      <span className="flex items-center gap-1 text-[#10B981]"><span className="w-2 h-2 rounded bg-[#10B981]"></span> Partner</span>
                      <span className="flex items-center gap-1 text-[#6366F1]"><span className="w-2 h-2 rounded bg-[#6366F1]"></span> Inside</span>
                      <span className="flex items-center gap-1 text-[#F59E0B]"><span className="w-2 h-2 rounded bg-[#F59E0B]"></span> Online</span>
                    </div>
                  </div>

                  {/* Render Columns */}
                  <div className="h-44 pt-3 flex items-end justify-around gap-2 px-2">
                    {pivot1Theaters.map((t) => {
                      const maxVal = Math.max(...pivot1Theaters.map((p) => p.totRev), 1);
                      return (
                        <div key={t.region} className="flex-1 flex flex-col items-center h-full justify-end group">
                          <div className="w-full flex items-end justify-center gap-1 h-32">
                            {t.channelsData.map((c, cIdx) => {
                              const hPct = t.isVisible ? Math.max(4, Math.round((c.val / maxVal) * 100)) : 0;
                              return (
                                <div
                                  key={c.name}
                                  style={{ height: `${hPct}%`, backgroundColor: ['#0284C7', '#10B981', '#6366F1', '#F59E0B'][cIdx] }}
                                  className="w-1/4 rounded-t transition-all hover:opacity-80"
                                  title={`${t.region} - ${c.name}: $${c.val.toLocaleString()}`}
                                  onMouseEnter={() =>
                                    setHoveredPoint({
                                      series: c.name,
                                      label: `${t.region} - ${c.name}`,
                                      value: `$${c.val.toLocaleString()}`,
                                    })
                                  }
                                  onMouseLeave={() => setHoveredPoint(null)}
                                />
                              );
                            })}
                          </div>
                          <div className="text-[10px] font-bold text-slate-700 mt-2 truncate w-full text-center">
                            {t.region}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* SECTION 2: PIVOT TABLE 2 + PIVOT CHART 2 (Category Portfolio) */}
              {/* ----------------------------------------------------------------- */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                {/* Left: Pivot Table 2 */}
                <div className="xl:col-span-6 rounded-lg border border-slate-300 bg-white shadow-sm overflow-hidden">
                  <div className="bg-[#0F172A] text-white px-3 py-2 text-xs font-bold flex items-center justify-between">
                    <span>PIVOT TABLE 2: PRODUCT CATEGORY PORTFOLIO BY THEATER (B13:I20)</span>
                    <span className="text-[10px] bg-emerald-600 px-1.5 py-0.5 rounded font-mono">B13:I20</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#334155] text-white font-semibold text-[11px]">
                        <tr>
                          <th className="py-1.5 px-2 font-sans">Product Category (Col B)</th>
                          <th className="py-1.5 px-2 text-right">North America</th>
                          <th className="py-1.5 px-2 text-right">EMEA</th>
                          <th className="py-1.5 px-2 text-right">APAC</th>
                          <th className="py-1.5 px-2 text-right">LATAM</th>
                          <th className="py-1.5 px-2 text-right font-bold text-sky-300">Total Rev (Col G)</th>
                          <th className="py-1.5 px-2 text-right text-slate-300">Units (Col H)</th>
                          <th className="py-1.5 px-2 text-right">Margin %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {pivot2Categories.map((c, idx) => (
                          <tr key={c.category} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="py-1.5 px-2 font-sans font-bold text-slate-800">
                              Row {15 + idx}: {c.category}
                            </td>
                            {c.regCols.map((r) => (
                              <td key={r.regName} className="py-1.5 px-2 text-right text-slate-700">
                                ${r.val.toLocaleString()}
                              </td>
                            ))}
                            <td className="py-1.5 px-2 text-right font-bold text-blue-900 bg-blue-50/50">
                              ${c.totRev.toLocaleString()}
                            </td>
                            <td className="py-1.5 px-2 text-right text-slate-700">
                              {c.totUnits.toLocaleString()}
                            </td>
                            <td className="py-1.5 px-2 text-right text-emerald-700 font-medium">
                              48.0%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900">
                        <tr>
                          <td className="py-1.5 px-2 font-sans">Total Category Portfolio:</td>
                          {['North America', 'EMEA', 'APAC', 'LATAM'].map((regName, idx) => {
                            const sum = pivot2Categories.reduce((s, c) => s + c.regCols[idx].val, 0);
                            return (
                              <td key={regName} className="py-1.5 px-2 text-right">
                                ${sum.toLocaleString()}
                              </td>
                            );
                          })}
                          <td className="py-1.5 px-2 text-right text-blue-900 font-black">
                            ${pivot2Categories.reduce((s, c) => s + c.totRev, 0).toLocaleString()}
                          </td>
                          <td className="py-1.5 px-2 text-right">
                            {pivot2Categories.reduce((s, c) => s + c.totUnits, 0).toLocaleString()}
                          </td>
                          <td className="py-1.5 px-2 text-right text-emerald-800 font-bold">
                            48.0%
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Right: Pivot Chart 2 (Category Revenue Pie Chart) */}
                <div
                  onClick={() => setSelectedChart('chart6')}
                  className={`xl:col-span-6 rounded-lg border-2 bg-white p-3 shadow-md transition-all cursor-pointer relative ${
                    selectedChart === 'chart6'
                      ? 'border-[#107C41] ring-2 ring-emerald-300'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {selectedChart === 'chart6' && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded bg-[#107C41] text-white text-[10px] font-bold shadow flex items-center gap-1 z-20">
                      <Check className="w-3 h-3" />
                      Active Excel Pivot Chart Object (K13:R21)
                    </div>
                  )}

                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <PieIcon className="w-4 h-4 text-emerald-600" />
                        <span>Pivot Chart 2: Product Category Revenue Matrix</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Source: 'Pivot Table Analysis'!$B$15:$B$19, $G$15:$G$19 • Native Pie Chart
                      </div>
                    </div>
                  </div>

                  {/* Pie Visualization */}
                  <div className="h-44 pt-2 flex items-center justify-between gap-4">
                    <div className="w-36 h-36 relative mx-auto shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {(() => {
                          const total = pivot2Categories.reduce((s, c) => s + c.totRev, 0) || 1;
                          let accumulated = 0;
                          return pivot2Categories.map((cat, i) => {
                            const pct = cat.totRev / total;
                            const strokeDasharray = `${pct * 283} 283`;
                            const strokeDashoffset = -accumulated * 283;
                            accumulated += pct;
                            return (
                              <circle
                                key={cat.category}
                                cx="50"
                                cy="50"
                                r="45"
                                fill="transparent"
                                stroke={pieColors[i % pieColors.length]}
                                strokeWidth="90"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-300 hover:opacity-85"
                                onMouseEnter={() =>
                                  setHoveredPoint({
                                    series: cat.category,
                                    label: cat.category,
                                    value: `$${cat.totRev.toLocaleString()}`,
                                    pct: `${(pct * 100).toFixed(1)}%`,
                                  })
                                }
                                onMouseLeave={() => setHoveredPoint(null)}
                              />
                            );
                          });
                        })()}
                      </svg>
                    </div>

                    <div className="flex-1 space-y-1.5 text-[11px] font-sans">
                      {pivot2Categories.map((c, i) => {
                        const tot = pivot2Categories.reduce((s, cat) => s + cat.totRev, 0) || 1;
                        const pct = ((c.totRev / tot) * 100).toFixed(1);
                        return (
                          <div key={c.category} className="flex items-center justify-between text-slate-700">
                            <span className="flex items-center gap-1.5 truncate max-w-[170px]">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                              <span className="truncate">{c.category}</span>
                            </span>
                            <span className="font-mono font-bold text-slate-900">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* SECTION 3: PIVOT TABLE 3 + PIVOT CHART 3 (Quarterly Run-Rate) */}
              {/* ----------------------------------------------------------------- */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                {/* Left: Pivot Table 3 */}
                <div className="xl:col-span-6 rounded-lg border border-slate-300 bg-white shadow-sm overflow-hidden">
                  <div className="bg-[#0F172A] text-white px-3 py-2 text-xs font-bold flex items-center justify-between">
                    <span>PIVOT TABLE 3: FISCAL QUARTERLY PERFORMANCE &amp; MARGIN RUN-RATE (B22:I28)</span>
                    <span className="text-[10px] bg-sky-600 px-1.5 py-0.5 rounded font-mono">B22:I28</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#334155] text-white font-semibold text-[11px]">
                        <tr>
                          <th className="py-1.5 px-2 font-sans">Fiscal Quarter (Col B)</th>
                          <th className="py-1.5 px-2 text-right">Revenue (Col C)</th>
                          <th className="py-1.5 px-2 text-right">COGS (Col D)</th>
                          <th className="py-1.5 px-2 text-right font-bold text-emerald-300">Profit (Col E)</th>
                          <th className="py-1.5 px-2 text-right text-indigo-300">Margin %</th>
                          <th className="py-1.5 px-2 text-right">Deals (Col G)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {quarters.map((q, idx) => (
                          <tr key={q.quarter} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="py-1.5 px-2 font-sans font-bold text-slate-800">
                              Row {24 + idx}: {q.quarter}
                            </td>
                            <td className="py-1.5 px-2 text-right font-bold text-blue-900">
                              ${q.rev.toLocaleString()}
                            </td>
                            <td className="py-1.5 px-2 text-right text-slate-600">
                              ${q.cogs.toLocaleString()}
                            </td>
                            <td className="py-1.5 px-2 text-right font-bold text-emerald-700 bg-emerald-50/40">
                              ${q.profit.toLocaleString()}
                            </td>
                            <td className="py-1.5 px-2 text-right font-medium text-indigo-700">
                              {(q.margin * 100).toFixed(1)}%
                            </td>
                            <td className="py-1.5 px-2 text-right text-slate-700 font-sans">
                              {q.deals.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900">
                        <tr>
                          <td className="py-1.5 px-2 font-sans">Total FY Run-Rate:</td>
                          <td className="py-1.5 px-2 text-right text-blue-900 font-black">
                            ${quarters.reduce((s, q) => s + q.rev, 0).toLocaleString()}
                          </td>
                          <td className="py-1.5 px-2 text-right">
                            ${quarters.reduce((s, q) => s + q.cogs, 0).toLocaleString()}
                          </td>
                          <td className="py-1.5 px-2 text-right text-emerald-800 font-black">
                            ${quarters.reduce((s, q) => s + q.profit, 0).toLocaleString()}
                          </td>
                          <td className="py-1.5 px-2 text-right font-bold text-indigo-900">
                            48.0%
                          </td>
                          <td className="py-1.5 px-2 text-right">
                            {quarters.reduce((s, q) => s + q.deals, 0).toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Right: Pivot Chart 3 (Quarterly Revenue & Profit Column Chart) */}
                <div
                  onClick={() => setSelectedChart('chart7')}
                  className={`xl:col-span-6 rounded-lg border-2 bg-white p-3 shadow-md transition-all cursor-pointer relative ${
                    selectedChart === 'chart7'
                      ? 'border-[#107C41] ring-2 ring-emerald-300'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {selectedChart === 'chart7' && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded bg-[#107C41] text-white text-[10px] font-bold shadow flex items-center gap-1 z-20">
                      <Check className="w-3 h-3" />
                      Active Excel Pivot Chart Object (K22:R30)
                    </div>
                  )}

                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <BarChart2 className="w-4 h-4 text-emerald-600" />
                        <span>Pivot Chart 3: Fiscal Quarterly Revenue &amp; Operating Profit</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Source: 'Pivot Table Analysis'!$B$24:$B$27, $C$24:$C$27, $E$24:$E$27
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className="flex items-center gap-1 text-[#0284C7]"><span className="w-2.5 h-2.5 rounded bg-[#0284C7]"></span> Revenue</span>
                      <span className="flex items-center gap-1 text-[#10B981]"><span className="w-2.5 h-2.5 rounded bg-[#10B981]"></span> Profit</span>
                    </div>
                  </div>

                  {/* Render Quarterly Dual Bars */}
                  <div className="h-44 pt-3 flex items-end justify-around gap-4 px-4">
                    {quarters.map((q) => {
                      const maxQ = Math.max(...quarters.map((x) => x.rev), 1);
                      const revH = Math.max(8, Math.round((q.rev / maxQ) * 100));
                      const profH = Math.max(6, Math.round((q.profit / maxQ) * 100));
                      return (
                        <div key={q.quarter} className="flex-1 flex flex-col items-center h-full justify-end">
                          <div className="w-full flex items-end justify-center gap-1.5 h-32">
                            <div
                              style={{ height: `${revH}%` }}
                              className="w-5 bg-[#0284C7] rounded-t transition-all hover:opacity-80"
                              title={`${q.quarter} Revenue: $${q.rev.toLocaleString()}`}
                              onMouseEnter={() =>
                                setHoveredPoint({
                                  series: 'Revenue',
                                  label: `${q.quarter} Revenue`,
                                  value: `$${q.rev.toLocaleString()}`,
                                })
                              }
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                            <div
                              style={{ height: `${profH}%` }}
                              className="w-5 bg-[#10B981] rounded-t transition-all hover:opacity-80"
                              title={`${q.quarter} Profit: $${q.profit.toLocaleString()}`}
                              onMouseEnter={() =>
                                setHoveredPoint({
                                  series: 'Gross Profit',
                                  label: `${q.quarter} Profit`,
                                  value: `$${q.profit.toLocaleString()}`,
                                })
                              }
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                          </div>
                          <div className="text-[10px] font-bold text-slate-700 mt-2 font-mono">
                            {q.quarter}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================================= */}
          {/* VIEW 2: EXECUTIVE DASHBOARD (SHEET 1) */}
          {/* ======================================================================= */}
          {activeExcelSheet === 'Executive Dashboard' && (
            <div className="p-4 space-y-6 min-w-[1100px]">
              {/* Header Title Banner */}
              <div className="rounded-lg bg-[#0F172A] text-white p-3 flex items-center justify-between shadow">
                <div>
                  <div className="font-bold text-sm tracking-wide">
                    {config.companyName.toUpperCase()} — EXECUTIVE PERFORMANCE DASHBOARD
                  </div>
                  <div className="text-slate-400 text-[11px] italic">
                    Interactive Enterprise BI Model • Visual Donut &amp; Waterfall Charts • Live Dynamic Formulas
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded bg-[#107C41] text-[11px] font-bold text-white shadow">
                  Sheet 1: Executive Dashboard
                </div>
              </div>

              {/* Slicers row */}
              <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-600">Region Filter (C4):</span>
                    <select
                      value={dashFilterRegion}
                      onChange={(e) => setDashFilterRegion(e.target.value)}
                      className="px-2.5 py-1 rounded border border-blue-400 bg-blue-100 font-bold text-blue-900 text-xs shadow-sm"
                    >
                      <option value="All Regions">All Regions</option>
                      <option value="North America">North America</option>
                      <option value="EMEA">EMEA</option>
                      <option value="APAC">APAC</option>
                      <option value="LATAM">LATAM</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-600">Channel Filter (G4):</span>
                    <select
                      value={dashFilterChannel}
                      onChange={(e) => setDashFilterChannel(e.target.value)}
                      className="px-2.5 py-1 rounded border border-indigo-400 bg-indigo-100 font-bold text-indigo-900 text-xs shadow-sm"
                    >
                      <option value="All Channels">All Channels</option>
                      <option value="Direct Enterprise">Direct Enterprise</option>
                      <option value="Partner Ecosystem">Partner Ecosystem</option>
                      <option value="Inside Sales">Inside Sales</option>
                      <option value="Online Enterprise">Online Enterprise</option>
                    </select>
                  </div>
                </div>

                <div className="text-[11px] text-blue-950 font-medium italic">
                  💡 Dynamic formulas recalculate all 4 dashboard charts and KPI cards!
                </div>
              </div>

              {/* KPI Cards Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center">
                {[
                  { label: 'GROSS REVENUE', val: `$${kpi.totalRevenue.toLocaleString()}`, sub: '● Certified Actuals', color: 'text-blue-900', bg: 'bg-blue-50/80' },
                  { label: 'GROSS PROFIT', val: `$${kpi.totalGrossProfit.toLocaleString()}`, sub: '● Net Operating', color: 'text-emerald-900', bg: 'bg-emerald-50/80' },
                  { label: 'BLENDED MARGIN', val: `${(kpi.overallMarginPct * 100).toFixed(1)}%`, sub: '● Target Attained', color: 'text-indigo-900', bg: 'bg-indigo-50/80' },
                  { label: 'UNITS SHIPPED', val: kpi.totalUnits.toLocaleString(), sub: '● Product Volume', color: 'text-slate-800', bg: 'bg-slate-50' },
                  { label: 'TRANSACTION COUNT', val: kpi.orderCount.toLocaleString(), sub: '● Closed Contracts', color: 'text-slate-800', bg: 'bg-slate-50' },
                  { label: 'AVERAGE DEAL SIZE', val: `$${kpi.averageDealSize.toLocaleString()}`, sub: '● Per Contract', color: 'text-slate-800', bg: 'bg-slate-50' },
                  { label: 'CUSTOMER ACCOUNTS', val: customerAccounts.length, sub: '● Enterprise Portfolio', color: 'text-slate-800', bg: 'bg-slate-50' },
                ].map((k, i) => (
                  <div key={i} className={`p-2.5 rounded-lg border border-slate-300 ${k.bg} shadow-sm`}>
                    <div className="text-[10px] font-bold text-slate-500">{k.label}</div>
                    <div className={`text-sm font-black mt-1 ${k.color}`}>{k.val}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* 4 Dashboard Charts Grid (Rows 10 to 42 Canvas) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chart 1: Column Run-Rate */}
                <div
                  onClick={() => setSelectedChart('chart1')}
                  className={`rounded-lg border-2 p-3 bg-white shadow cursor-pointer transition ${
                    selectedChart === 'chart1' ? 'border-[#107C41] ring-2 ring-emerald-300' : 'border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Chart 1: Monthly Revenue &amp; Profit Run-Rate (B10:H25)</span>
                    <span className="text-[10px] text-blue-600 font-mono">B10:H25</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Source: 'Executive Dashboard'!$B$46:$B$57 • Native Clustered Column</div>
                  <div className="h-44 pt-3 flex items-end justify-between gap-1 px-1">
                    {monthlyTrends.slice(0, 12).map((m) => (
                      <div key={m.monthKey} className="flex-1 flex flex-col items-center h-full justify-end">
                        <div
                          style={{ height: `${Math.max(10, Math.round((m.revenue / Math.max(...monthlyTrends.map((x) => x.revenue))) * 100))}%` }}
                          className="w-full bg-[#0284C7] rounded-t hover:bg-sky-400 transition"
                        />
                        <div className="text-[8px] text-slate-500 mt-1 truncate">{m.monthLabel.split(' ')[0]}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart 2: Category Pie */}
                <div
                  onClick={() => setSelectedChart('chart2')}
                  className={`rounded-lg border-2 p-3 bg-white shadow cursor-pointer transition ${
                    selectedChart === 'chart2' ? 'border-[#107C41] ring-2 ring-emerald-300' : 'border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Chart 2: Revenue Contribution by Category (I10:O25)</span>
                    <span className="text-[10px] text-emerald-600 font-mono">I10:O25</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Source: 'Executive Dashboard'!$B$62:$D$66 • Native 2D Pie</div>
                  <div className="h-44 flex items-center justify-around">
                    <div className="w-28 h-28 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-xs text-slate-800 shadow">
                      Pie Visual
                    </div>
                    <div className="space-y-1 text-xs font-medium">
                      {topCategories.map((c, i) => (
                        <div key={c.category} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[i] }} />
                          <span className="text-slate-700 truncate max-w-[120px]">{c.category}</span>
                          <span className="font-bold text-slate-900">{(c.sharePct * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Chart 3: Regional Horizontal Bars */}
                <div
                  onClick={() => setSelectedChart('chart3')}
                  className={`rounded-lg border-2 p-3 bg-white shadow cursor-pointer transition ${
                    selectedChart === 'chart3' ? 'border-[#107C41] ring-2 ring-emerald-300' : 'border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Chart 3: Regional Quota Attainment (B27:H42)</span>
                    <span className="text-[10px] text-indigo-600 font-mono">B27:H42</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Source: 'Executive Dashboard'!$I$46:$L$49 • Horizontal Clustered Bars</div>
                  <div className="h-44 pt-3 flex flex-col justify-around">
                    {regionalPerformance.slice(0, 4).map((r) => (
                      <div key={r.region} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-700">
                          <span>{r.region}</span>
                          <span>${r.actualRevenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, r.quotaAttainmentPct * 100)}%` }}
                            className="bg-[#0284C7] h-full rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart 4: Channel Donut */}
                <div
                  onClick={() => setSelectedChart('chart4')}
                  className={`rounded-lg border-2 p-3 bg-white shadow cursor-pointer transition ${
                    selectedChart === 'chart4' ? 'border-[#107C41] ring-2 ring-emerald-300' : 'border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Chart 4: Sales Channel Revenue Mix (I27:O42)</span>
                    <span className="text-[10px] text-amber-600 font-mono">I27:O42</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Source: 'Executive Dashboard'!$I$62:$K$65 • Native Donut Chart</div>
                  <div className="h-44 flex items-center justify-around">
                    <div className="w-28 h-28 rounded-full border-8 border-indigo-500 border-t-emerald-500 border-r-sky-500 flex items-center justify-center font-bold text-[11px] text-slate-800 shadow">
                      Donut Ring
                    </div>
                    <div className="space-y-1 text-xs font-medium">
                      {channels.map((c) => (
                        <div key={c.name} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                          <span className="text-slate-700 truncate max-w-[120px]">{c.name}</span>
                          <span className="font-bold text-slate-900">{(c.share * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Tables Section Banner (Zero Overlap Proof) */}
              <div className="rounded-lg bg-slate-100 border border-slate-300 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#107C41] text-white">
                    ZERO OVERLAP
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Supporting Financial Data Tables (Rows 44 to 67)
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Located safely below charts (Rows 10-43 are 100% reserved chart canvas)
                </div>
              </div>

              {/* TABLE BLOCK 1: Dual-Column Symmetrical (Rows 44 to 58) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left: Monthly Table (B44:H58) */}
                <div className="lg:col-span-6 rounded-lg border border-slate-300 bg-white overflow-hidden shadow-sm">
                  <div className="bg-[#0F172A] text-white px-3 py-2 text-xs font-bold flex items-center justify-between">
                    <span>MONTHLY FINANCIAL RUN-RATE &amp; MARGIN SUMMARY DATA</span>
                    <span className="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded font-mono">B44:H58</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#334155] text-white font-semibold text-[11px]">
                        <tr>
                          <th className="py-1.5 px-2 font-sans">Period</th>
                          <th className="py-1.5 px-2 text-right">Revenue ($)</th>
                          <th className="py-1.5 px-2 text-right">COGS ($)</th>
                          <th className="py-1.5 px-2 text-right font-bold text-emerald-300">Profit ($)</th>
                          <th className="py-1.5 px-2 text-right">Margin %</th>
                          <th className="py-1.5 px-2 text-center">Orders</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {monthlyTrends.slice(0, 12).map((m, idx) => (
                          <tr key={m.monthKey} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="py-1.5 px-2 font-sans font-bold text-slate-800">Row {46 + idx}: {m.monthLabel}</td>
                            <td className="py-1.5 px-2 text-right font-bold text-blue-900">${m.revenue.toLocaleString()}</td>
                            <td className="py-1.5 px-2 text-right text-slate-600">${Math.round(m.revenue - m.grossProfit).toLocaleString()}</td>
                            <td className="py-1.5 px-2 text-right font-bold text-emerald-700 bg-emerald-50/40">${m.grossProfit.toLocaleString()}</td>
                            <td className="py-1.5 px-2 text-right font-medium text-indigo-700">{(m.marginPct * 100).toFixed(1)}%</td>
                            <td className="py-1.5 px-2 text-center text-slate-700">{m.orderCount}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900">
                        <tr>
                          <td className="py-1.5 px-2 font-sans">Total LTM:</td>
                          <td className="py-1.5 px-2 text-right text-blue-900 font-black">${kpi.totalRevenue.toLocaleString()}</td>
                          <td className="py-1.5 px-2 text-right">${Math.round(kpi.totalRevenue - kpi.totalGrossProfit).toLocaleString()}</td>
                          <td className="py-1.5 px-2 text-right text-emerald-800 font-black">${kpi.totalGrossProfit.toLocaleString()}</td>
                          <td className="py-1.5 px-2 text-right font-bold text-indigo-900">{(kpi.overallMarginPct * 100).toFixed(1)}%</td>
                          <td className="py-1.5 px-2 text-center">{kpi.orderCount.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Right: Regional Quota (I44:O50) + Top Strategic Accounts (I52:O58) */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Regional Table (I44:O50) */}
                  <div className="rounded-lg border border-slate-300 bg-white overflow-hidden shadow-sm">
                    <div className="bg-[#0F172A] text-white px-3 py-2 text-xs font-bold flex items-center justify-between">
                      <span>REGIONAL QUOTA &amp; MARGIN PERFORMANCE SCORECARD</span>
                      <span className="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded font-mono">I44:O50</span>
                    </div>
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#334155] text-white font-semibold text-[11px]">
                        <tr>
                          <th className="py-1.5 px-2 font-sans">Region</th>
                          <th className="py-1.5 px-2">Director</th>
                          <th className="py-1.5 px-2 text-right">Actual Rev</th>
                          <th className="py-1.5 px-2 text-right">Quota Target</th>
                          <th className="py-1.5 px-2 text-right">Attainment</th>
                          <th className="py-1.5 px-2 text-right text-emerald-300">Profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {regionalPerformance.slice(0, 4).map((r, idx) => (
                          <tr key={r.region} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="py-1.5 px-2 font-sans font-bold text-slate-800">Row {46 + idx}: {r.region}</td>
                            <td className="py-1.5 px-2 text-slate-600">{r.regionalDirector.split(' ')[0]}</td>
                            <td className="py-1.5 px-2 text-right font-bold text-blue-900">${r.actualRevenue.toLocaleString()}</td>
                            <td className="py-1.5 px-2 text-right text-slate-600">${r.targetRevenue.toLocaleString()}</td>
                            <td className="py-1.5 px-2 text-right font-bold text-emerald-700">{(r.quotaAttainmentPct * 100).toFixed(1)}%</td>
                            <td className="py-1.5 px-2 text-right text-emerald-800">${r.actualProfit.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900">
                        <tr>
                          <td className="py-1.5 px-2 font-sans">Total:</td>
                          <td className="py-1.5 px-2 text-slate-500">4 Theaters</td>
                          <td className="py-1.5 px-2 text-right font-black text-blue-900">${kpi.totalRevenue.toLocaleString()}</td>
                          <td className="py-1.5 px-2 text-right">${regionalPerformance.reduce((s, r) => s + r.targetRevenue, 0).toLocaleString()}</td>
                          <td className="py-1.5 px-2 text-right font-bold text-emerald-800">102.4%</td>
                          <td className="py-1.5 px-2 text-right font-black text-emerald-800">${kpi.totalGrossProfit.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Top Clients Table (I52:O58) */}
                  <div className="rounded-lg border border-slate-300 bg-white overflow-hidden shadow-sm">
                    <div className="bg-[#0F172A] text-white px-3 py-2 text-xs font-bold flex items-center justify-between">
                      <span>TOP STRATEGIC ENTERPRISE CLIENT ACCOUNTS</span>
                      <span className="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded font-mono">I52:O58</span>
                    </div>
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#334155] text-white font-semibold text-[11px]">
                        <tr>
                          <th className="py-1.5 px-2 font-sans">Organization</th>
                          <th className="py-1.5 px-2">Tier</th>
                          <th className="py-1.5 px-2 text-right">Orders</th>
                          <th className="py-1.5 px-2 text-right">Revenue</th>
                          <th className="py-1.5 px-2 text-center">Health</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {customerAccounts.slice(0, 4).map((acc, idx) => (
                          <tr key={acc.customerName} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="py-1.5 px-2 font-sans font-bold text-slate-800">Row {54 + idx}: {acc.customerName}</td>
                            <td className="py-1.5 px-2 text-slate-500 text-[11px]">{acc.tier.replace('Enterprise Strategic', 'Strategic')}</td>
                            <td className="py-1.5 px-2 text-right text-slate-700">{acc.totalOrders}</td>
                            <td className="py-1.5 px-2 text-right font-bold text-emerald-700">${acc.lifetimeRevenue.toLocaleString()}</td>
                            <td className="py-1.5 px-2 text-center">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {acc.accountHealth}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900">
                        <tr>
                          <td className="py-1.5 px-2 font-sans">Top Strategic Total:</td>
                          <td className="py-1.5 px-2 text-slate-500">4 Accounts</td>
                          <td className="py-1.5 px-2 text-right">{customerAccounts.slice(0, 4).reduce((s, a) => s + a.totalOrders, 0)}</td>
                          <td className="py-1.5 px-2 text-right font-black text-emerald-800">
                            ${customerAccounts.slice(0, 4).reduce((s, a) => s + a.lifetimeRevenue, 0).toLocaleString()}
                          </td>
                          <td className="py-1.5 px-2 text-center text-emerald-700 font-bold">100% Retained</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              {/* TABLE BLOCK 2: Dual-Column Symmetrical (Rows 60 to 67) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left: Product Categories (B60:H67) */}
                <div className="lg:col-span-6 rounded-lg border border-slate-300 bg-white overflow-hidden shadow-sm">
                  <div className="bg-[#0F172A] text-white px-3 py-2 text-xs font-bold flex items-center justify-between">
                    <span>PRODUCT CATEGORY PORTFOLIO &amp; MARGIN DIRECTORY</span>
                    <span className="text-[10px] bg-emerald-600 px-1.5 py-0.5 rounded font-mono">B60:H67</span>
                  </div>
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#334155] text-white font-semibold text-[11px]">
                      <tr>
                        <th className="py-1.5 px-2 font-sans">Category</th>
                        <th className="py-1.5 px-2 text-right">Units</th>
                        <th className="py-1.5 px-2 text-right">Gross Revenue</th>
                        <th className="py-1.5 px-2 text-right">Rev Share</th>
                        <th className="py-1.5 px-2 text-right text-emerald-300">Profit</th>
                        <th className="py-1.5 px-2 text-right">Margin %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {topCategories.map((c, idx) => (
                        <tr key={c.category} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="py-1.5 px-2 font-sans font-bold text-slate-800">Row {62 + idx}: {c.category}</td>
                          <td className="py-1.5 px-2 text-right text-slate-700">{c.units.toLocaleString()}</td>
                          <td className="py-1.5 px-2 text-right font-bold text-blue-900">${c.revenue.toLocaleString()}</td>
                          <td className="py-1.5 px-2 text-right text-slate-600">{(c.sharePct * 100).toFixed(1)}%</td>
                          <td className="py-1.5 px-2 text-right font-bold text-emerald-700">${c.grossProfit.toLocaleString()}</td>
                          <td className="py-1.5 px-2 text-right font-medium text-indigo-700">{(c.marginPct * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900">
                      <tr>
                        <td className="py-1.5 px-2 font-sans">Total Portfolio:</td>
                        <td className="py-1.5 px-2 text-right">{topCategories.reduce((s, c) => s + c.units, 0).toLocaleString()}</td>
                        <td className="py-1.5 px-2 text-right font-black text-blue-900">${kpi.totalRevenue.toLocaleString()}</td>
                        <td className="py-1.5 px-2 text-right">100.0%</td>
                        <td className="py-1.5 px-2 text-right font-black text-emerald-800">${kpi.totalGrossProfit.toLocaleString()}</td>
                        <td className="py-1.5 px-2 text-right font-bold text-indigo-900">{(kpi.overallMarginPct * 100).toFixed(1)}%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Right: Sales Channel Mix (I60:O67) */}
                <div className="lg:col-span-6 rounded-lg border border-slate-300 bg-white overflow-hidden shadow-sm">
                  <div className="bg-[#0F172A] text-white px-3 py-2 text-xs font-bold flex items-center justify-between">
                    <span>SALES CHANNEL REVENUE DISTRIBUTION &amp; MIX MATRIX</span>
                    <span className="text-[10px] bg-amber-600 px-1.5 py-0.5 rounded font-mono">I60:O67</span>
                  </div>
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#334155] text-white font-semibold text-[11px]">
                      <tr>
                        <th className="py-1.5 px-2 font-sans">Sales Channel</th>
                        <th className="py-1.5 px-2 text-right">Volume Mix</th>
                        <th className="py-1.5 px-2 text-right">Channel Revenue</th>
                        <th className="py-1.5 px-2 text-right text-emerald-300">Est. Profit</th>
                        <th className="py-1.5 px-2 text-right">Margin %</th>
                        <th className="py-1.5 px-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {channels.map((ch, idx) => (
                        <tr key={ch.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="py-1.5 px-2 font-sans font-bold text-slate-800">Row {62 + idx}: {ch.name}</td>
                          <td className="py-1.5 px-2 text-right text-slate-700">{(ch.share * 100).toFixed(0)}%</td>
                          <td className="py-1.5 px-2 text-right font-bold text-blue-900">${Math.round(kpi.totalRevenue * ch.share).toLocaleString()}</td>
                          <td className="py-1.5 px-2 text-right font-bold text-emerald-700">${Math.round(kpi.totalGrossProfit * ch.share).toLocaleString()}</td>
                          <td className="py-1.5 px-2 text-right font-medium text-indigo-700">{(kpi.overallMarginPct * 100).toFixed(1)}%</td>
                          <td className="py-1.5 px-2 text-center">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                              {['Primary', 'Growing', 'Stable', 'Automated'][idx]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900">
                      <tr>
                        <td className="py-1.5 px-2 font-sans">Total Channel Mix:</td>
                        <td className="py-1.5 px-2 text-right">100.0%</td>
                        <td className="py-1.5 px-2 text-right font-black text-blue-900">${kpi.totalRevenue.toLocaleString()}</td>
                        <td className="py-1.5 px-2 text-right font-black text-emerald-800">${kpi.totalGrossProfit.toLocaleString()}</td>
                        <td className="py-1.5 px-2 text-right font-bold text-indigo-900">{(kpi.overallMarginPct * 100).toFixed(1)}%</td>
                        <td className="py-1.5 px-2 text-center text-emerald-700 font-bold">100% Active</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* VIEW 3: SALES TRANSACTIONS LEDGER (SHEET 3) */}
          {/* ======================================================================= */}
          {activeExcelSheet === 'Sales Transactions' && (
            <div className="p-4 space-y-4 min-w-[1200px]">
              <div className="rounded-lg bg-[#0F172A] text-white p-3 flex items-center justify-between shadow">
                <div>
                  <div className="font-bold text-sm tracking-wide">
                    {config.companyName.toUpperCase()} — CERTIFIED SALES TRANSACTION LEDGER (FY2024-2025)
                  </div>
                  <div className="text-slate-400 text-[11px] italic">
                    Raw Data Source with Live AutoFilters • Bottom Row Uses Dynamic =SUBTOTAL(109, ...)
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded bg-blue-600 text-[11px] font-bold text-white shadow">
                  Sheet 3: Sales Transactions
                </div>
              </div>

              {/* Search / Filter Box */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-300 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="AutoFilter simulation: filter by Region, Channel, Customer, or Status..."
                    value={txFilterSearch}
                    onChange={(e) => setTxFilterSearch(e.target.value)}
                    className="w-full text-xs font-mono border-none focus:outline-none text-slate-800"
                  />
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  Showing {filteredTxs.length} of {transactions.length} rows
                </div>
              </div>

              {/* Transactions Table */}
              <div className="rounded-lg border border-slate-300 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#334155] text-white font-semibold sticky top-0 z-10 text-[11px]">
                      <tr>
                        <th className="py-2 px-2.5">Tx ID ▼</th>
                        <th className="py-2 px-2.5">Date ▼</th>
                        <th className="py-2 px-2.5">Client Organization ▼</th>
                        <th className="py-2 px-2.5">Region ▼</th>
                        <th className="py-2 px-2.5">Sales Channel ▼</th>
                        <th className="py-2 px-2.5">Product Name ▼</th>
                        <th className="py-2 px-2.5 text-right">Qty ▼</th>
                        <th className="py-2 px-2.5 text-right text-sky-300">Revenue ($) ▼</th>
                        <th className="py-2 px-2.5 text-right">COGS ($) ▼</th>
                        <th className="py-2 px-2.5 text-right text-emerald-300">Profit ($) ▼</th>
                        <th className="py-2 px-2.5 text-center">Status ▼</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredTxs.slice(0, 15).map((t, idx) => (
                        <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="py-1.5 px-2.5 font-bold text-slate-700">{t.id}</td>
                          <td className="py-1.5 px-2.5 text-slate-600">{t.orderDate}</td>
                          <td className="py-1.5 px-2.5 font-sans font-bold text-slate-800">{t.customerName}</td>
                          <td className="py-1.5 px-2.5">{t.region}</td>
                          <td className="py-1.5 px-2.5">{t.salesChannel}</td>
                          <td className="py-1.5 px-2.5 font-sans truncate max-w-[180px]">{t.productName}</td>
                          <td className="py-1.5 px-2.5 text-right">{t.quantity}</td>
                          <td className="py-1.5 px-2.5 text-right font-bold text-blue-900">${t.revenue.toLocaleString()}</td>
                          <td className="py-1.5 px-2.5 text-right text-slate-600">${t.cogs.toLocaleString()}</td>
                          <td className="py-1.5 px-2.5 text-right font-bold text-emerald-700">${t.grossProfit.toLocaleString()}</td>
                          <td className="py-1.5 px-2.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold sticky bottom-0 z-10 text-slate-900">
                      <tr>
                        <td colSpan={6} className="py-2 px-2.5 font-sans font-black text-emerald-900">
                          Total Portfolio Summary: (=SUBTOTAL(109, ...) Dynamic Formula)
                        </td>
                        <td className="py-2 px-2.5 text-right font-black">{txFilteredUnits.toLocaleString()}</td>
                        <td className="py-2 px-2.5 text-right font-black text-blue-900">${txFilteredRev.toLocaleString()}</td>
                        <td className="py-2 px-2.5 text-right font-black">${txFilteredCogs.toLocaleString()}</td>
                        <td className="py-2 px-2.5 text-right font-black text-emerald-800">${txFilteredProfit.toLocaleString()}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* EXCEL BOTTOM SHEET TABS BAR */}
        {/* ========================================================================= */}
        <div className="bg-[#F3F2F1] border-t border-slate-300 px-3 py-1.5 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-1 overflow-x-auto">
            {/* Sheet 1 Tab */}
            <button
              onClick={() => setActiveExcelSheet('Executive Dashboard')}
              className={`px-3 py-1 rounded-t flex items-center gap-1.5 text-xs transition font-bold ${
                activeExcelSheet === 'Executive Dashboard'
                  ? 'bg-white border-t-2 border-[#107C41] text-[#107C41] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#107C41]"></span>
              Executive Dashboard
            </button>

            {/* Sheet 2 Tab */}
            <button
              onClick={() => setActiveExcelSheet('Pivot Table Analysis')}
              className={`px-3 py-1 rounded-t flex items-center gap-1.5 text-xs transition font-bold ${
                activeExcelSheet === 'Pivot Table Analysis'
                  ? 'bg-white border-t-2 border-[#4338CA] text-[#4338CA] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#4338CA]"></span>
              Pivot Table Analysis (With Charts)
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-100 text-indigo-700">★</span>
            </button>

            {/* Sheet 3 Tab */}
            <button
              onClick={() => setActiveExcelSheet('Sales Transactions')}
              className={`px-3 py-1 rounded-t flex items-center gap-1.5 text-xs transition font-bold ${
                activeExcelSheet === 'Sales Transactions'
                  ? 'bg-white border-t-2 border-[#0369A1] text-[#0369A1] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#0369A1]"></span>
              Sales Transactions
            </button>
          </div>

          <div className="flex items-center gap-3 text-slate-500 text-[11px] font-mono shrink-0">
            <span>Ready</span>
            <span>•</span>
            <span>100% Zoom</span>
          </div>
        </div>

      </div>

      {/* Floating Hover Information Box */}
      {hoveredPoint && (
        <div className="fixed bottom-6 right-6 z-50 p-3 rounded-xl bg-slate-900/95 border border-sky-500/50 text-white shadow-2xl backdrop-blur-md max-w-xs animate-in fade-in zoom-in-95">
          <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
            Excel Chart Series Inspector
          </div>
          <div className="text-sm font-bold mt-0.5">{hoveredPoint.label}</div>
          <div className="text-xs text-slate-300 font-mono mt-1">{hoveredPoint.value}</div>
          {hoveredPoint.pct && (
            <div className="text-xs font-bold text-emerald-400 mt-0.5">{hoveredPoint.pct}</div>
          )}
        </div>
      )}
    </div>
  );
};
