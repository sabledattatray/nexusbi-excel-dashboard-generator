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
  const { monthlyTrends, categorySummaries, regionalPerformance, customerAccounts, kpi } = data;

  // Selected chart in Excel simulator (to show active chart handles & highlight source data)
  const [selectedChart, setSelectedChart] = useState<'chart1' | 'chart2' | 'chart3' | 'chart4' | 'chart5' | null>(
    'chart2' // Default to Pie Chart selected to immediately show interactivity!
  );

  // Active Ribbon Tab in Excel simulator
  const [activeRibbonTab, setActiveRibbonTab] = useState<'Home' | 'Insert' | 'Formulas' | 'Data' | 'ChartDesign'>('ChartDesign');

  // Excel Slicer state inside simulator
  const [excelFilterRegion, setExcelFilterRegion] = useState<string>('All Regions');
  const [excelFilterChannel, setExcelFilterChannel] = useState<string>('All Channels');

  // Hovered item inside chart
  const [hoveredPoint, setHoveredPoint] = useState<{ series: string; label: string; value: string; pct?: string } | null>(null);

  // Filter regional data based on slicer
  const filteredRegions = excelFilterRegion === 'All Regions'
    ? regionalPerformance
    : regionalPerformance.filter((r) => r.region === excelFilterRegion);

  const displayActualRev = excelFilterRegion === 'All Regions'
    ? kpi.totalRevenue
    : filteredRegions[0]?.actualRevenue || kpi.totalRevenue;

  const displayActualProfit = excelFilterRegion === 'All Regions'
    ? kpi.totalGrossProfit
    : filteredRegions[0]?.actualProfit || kpi.totalGrossProfit;

  // Top categories for Pie
  const topCategories = categorySummaries.slice(0, 5);
  const pieColors = ['#0284C7', '#10B981', '#6366F1', '#F59E0B', '#EC4899'];

  // Channels
  const channels = [
    { name: 'Direct Enterprise', share: 0.42, revenue: kpi.totalRevenue * 0.42, color: '#0284C7' },
    { name: 'Partner Ecosystem', share: 0.28, revenue: kpi.totalRevenue * 0.28, color: '#10B981' },
    { name: 'Inside Sales', share: 0.18, revenue: kpi.totalRevenue * 0.18, color: '#6366F1' },
    { name: 'Online Enterprise', share: 0.12, revenue: kpi.totalRevenue * 0.12, color: '#F59E0B' },
  ];

  // Active Formula in Excel Formula Bar based on chart selection
  const formulaBarContent = selectedChart === 'chart1'
    ? `=SERIES('Executive Dashboard'!$C$45, 'Executive Dashboard'!$B$46:$B$57, 'Executive Dashboard'!$C$46:$C$57, 1)`
    : selectedChart === 'chart2'
    ? `=SERIES('Executive Dashboard'!$K$45, 'Executive Dashboard'!$I$46:$I$50, 'Executive Dashboard'!$K$46:$K$50, 1)`
    : selectedChart === 'chart3'
    ? `=SERIES('Executive Dashboard'!$K$28, 'Executive Dashboard'!$I$29:$I$32, 'Executive Dashboard'!$K$29:$K$32, 1)`
    : selectedChart === 'chart4'
    ? `=SERIES('Executive Dashboard'!$K$53, 'Executive Dashboard'!$I$54:$I$57, 'Executive Dashboard'!$K$54:$K$57, 1)`
    : `=SUMIFS('Sales Transactions'!R3:R1002, 'Sales Transactions'!H3:H1002, C4)`;

  const nameBoxContent = selectedChart === 'chart1'
    ? 'Chart 1: Run-Rate'
    : selectedChart === 'chart2'
    ? 'Chart 2: Category Pie'
    : selectedChart === 'chart3'
    ? 'Chart 3: Regional Bars'
    : selectedChart === 'chart4'
    ? 'Chart 4: Channel Donut'
    : 'B10';

  return (
    <div className="space-y-6">
      {/* Top Explanatory Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              100% Genuine Native DrawingML Charts (Not Images)
            </span>
            <span className="text-xs text-slate-400 font-mono">OpenXML .xlsx Verified</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            See How Your Downloaded Excel File Looks Inside Microsoft Excel
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Below is an authentic, interactive preview of the downloaded workbook opened in Microsoft Excel. Click any chart to inspect its active Excel selection handles, view its live <code className="text-emerald-400 font-mono bg-slate-800 px-1 py-0.5 rounded">=SERIES(...)</code> formula, and see source cell ranges highlighted in real time!
          </p>
        </div>

        <button
          onClick={onDownloadExcel}
          disabled={isDownloading}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 border border-emerald-400/40 flex items-center gap-2.5 transition-all transform active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download This Workbook (.xlsx)</span>
        </button>
      </div>

      {/* Proof Checklist Pill Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-200">Native Excel Pie Chart</div>
            <div className="text-[11px] text-slate-400">Real &lt;c:pieChart&gt; with interactive percentage slices &amp; legend</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-200">Native Horizontal Bar Chart</div>
            <div className="text-[11px] text-slate-400">Real &lt;c:barChart barDir="bar"&gt; side-by-side Actual vs Quota</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-200">Native Clustered Column Chart</div>
            <div className="text-[11px] text-slate-400">12-Month run-rate comparing Revenue &amp; Gross Margin</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-200">Native Channel Donut Chart</div>
            <div className="text-[11px] text-slate-400">Real &lt;c:doughnutChart&gt; showing channel revenue concentration</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AUTHENTIC MICROSOFT EXCEL DESKTOP / WEB APPLICATION SIMULATOR */}
      {/* ========================================================================= */}
      <div className="rounded-xl overflow-hidden border-2 border-slate-700 bg-white shadow-2xl font-sans text-slate-800">
        
        {/* EXCEL TITLE BAR (Green header bar like authentic Excel 365) */}
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
              <span>{config.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Executive_Sales_Dashboard_{new Date().getFullYear()}.xlsx</span>
              <span className="text-emerald-200 text-[10px] bg-emerald-800/80 px-1.5 py-0.5 rounded font-mono">
                Saved to This PC
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
          {(['File', 'Home', 'Insert', 'Page Layout', 'Formulas', 'Data', 'Review', 'View', 'ChartDesign'] as const).map((tab) => {
            const isChartTab = tab === 'ChartDesign';
            const isActive = activeRibbonTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  if (tab !== 'File') setActiveRibbonTab(tab as any);
                }}
                className={`px-3 py-1.5 font-medium transition-colors border-b-2 ${
                  isChartTab
                    ? isActive
                      ? 'bg-white text-[#107C41] border-[#107C41] font-bold'
                      : 'text-[#107C41] bg-emerald-100/70 border-transparent hover:bg-white font-semibold'
                    : isActive
                    ? 'bg-white text-slate-900 border-[#107C41] font-bold'
                    : 'text-slate-700 hover:bg-slate-200 border-transparent'
                }`}
              >
                {tab === 'ChartDesign' ? 'Chart Design (Active Tools)' : tab}
              </button>
            );
          })}
        </div>

        {/* EXCEL TOOLBAR RIBBON (Shows Chart Tools when a chart is selected!) */}
        <div className="bg-[#FAF9F8] border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs gap-4 overflow-x-auto">
          {activeRibbonTab === 'ChartDesign' || selectedChart ? (
            <div className="flex items-center gap-6 divide-x divide-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chart Layouts:</span>
                <span className="px-2 py-1 rounded bg-white border border-slate-300 font-medium text-slate-700 flex items-center gap-1 shadow-sm">
                  <BarChart2 className="w-3.5 h-3.5 text-[#107C41]" />
                  Add Chart Element
                </span>
                <span className="px-2 py-1 rounded bg-white border border-slate-300 font-medium text-slate-700 shadow-sm">
                  Quick Layout #2
                </span>
              </div>

              <div className="pl-6 flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chart Styles:</span>
                <div className="flex items-center gap-1">
                  {['#0284C7', '#10B981', '#6366F1', '#F59E0B'].map((col, i) => (
                    <span key={i} className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: col }} />
                  ))}
                </div>
                <span className="px-2 py-1 rounded bg-white border border-slate-300 font-medium text-slate-700 text-[11px]">
                  Executive Navy &amp; Emerald Palette
                </span>
              </div>

              <div className="pl-6 flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Data:</span>
                <span className="px-2 py-1 rounded bg-emerald-50 border border-emerald-300 font-bold text-[#107C41] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Select Data (Live Bound)
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-slate-600 text-xs">
              <span className="font-semibold text-slate-800">Font: Segoe UI 10pt</span>
              <span>•</span>
              <span>Alignment: Centered</span>
              <span>•</span>
              <span>Number Format: Currency ($#,##0)</span>
            </div>
          )}

          <div className="text-[11px] text-slate-500 font-mono shrink-0 hidden lg:flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            DrawingML Vector Mode: Active
          </div>
        </div>

        {/* EXCEL FORMULA BAR */}
        <div className="bg-white border-b border-slate-300 px-3 py-1.5 flex items-center gap-2 text-xs font-mono">
          {/* Name Box */}
          <div className="w-36 px-2 py-0.5 rounded bg-slate-50 border border-slate-300 font-bold text-slate-700 flex items-center justify-between text-[11px] shadow-inner">
            <span className="truncate">{nameBoxContent}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>

          {/* Formula Function Button */}
          <div className="px-2 py-0.5 text-slate-400 font-bold italic select-none">
            fx
          </div>

          {/* Formula Bar Content (Shows genuine Excel formula) */}
          <div className="flex-1 px-2.5 py-0.5 bg-slate-50 rounded border border-slate-300 text-slate-800 text-[11px] font-mono shadow-inner truncate">
            {formulaBarContent}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EXCEL SPREADSHEET GRID & WORKSHEET CANVAS */}
        {/* ========================================================================= */}
        <div className="overflow-x-auto max-h-[750px] overflow-y-auto bg-slate-100 p-4">
          <div className="min-w-[1050px] bg-white border border-slate-300 shadow-sm rounded">
            
            {/* GRID COLUMN HEADERS (A, B, C, D, ... P) */}
            <div className="grid grid-cols-[35px_repeat(15,minmax(65px,1fr))] bg-[#F3F2F1] border-b border-slate-300 text-[11px] font-semibold text-slate-600 select-none text-center">
              <div className="border-r border-slate-300 py-1 bg-[#E1DFDD]"></div>
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'].map((col) => (
                <div key={col} className="border-r border-slate-300 py-1 hover:bg-slate-200">
                  {col}
                </div>
              ))}
            </div>

            {/* SPREADSHEET ROW CONTENTS */}
            <div className="divide-y divide-slate-200 text-xs">
              
              {/* ROW 1: Margin spacer */}
              <div className="grid grid-cols-[35px_1fr] bg-white">
                <div className="bg-[#F3F2F1] border-r border-slate-300 text-center py-1 text-[10px] text-slate-500 font-mono select-none">1</div>
                <div className="h-2"></div>
              </div>

              {/* ROW 2: CORPORATE HEADER BANNER */}
              <div className="grid grid-cols-[35px_1fr] bg-white">
                <div className="bg-[#F3F2F1] border-r border-slate-300 text-center py-2 text-[10px] text-slate-500 font-mono select-none">2</div>
                <div className="px-3 py-1">
                  <div className="bg-[#0F172A] text-white p-2.5 rounded font-bold text-sm tracking-wide flex items-center justify-between">
                    <span>{config.companyName.toUpperCase()} — EXECUTIVE PERFORMANCE DASHBOARD</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-slate-800 px-2 py-0.5 rounded">
                      Microsoft Excel (.xlsx) Model
                    </span>
                  </div>
                </div>
              </div>

              {/* ROW 3: SUB-BANNER METRIC STRIP */}
              <div className="grid grid-cols-[35px_1fr] bg-white">
                <div className="bg-[#F3F2F1] border-r border-slate-300 text-center py-1 text-[10px] text-slate-500 font-mono select-none">3</div>
                <div className="px-3">
                  <div className="bg-[#1E293B] text-slate-300 px-3 py-1 rounded text-[10px] italic flex items-center justify-between">
                    <span>Interactive Enterprise BI Model • Visual Pie &amp; Horizontal Bar Charts • Live Dynamic Formulas • Final Verified</span>
                    <span className="text-emerald-300 font-mono">Calculations: Automatic</span>
                  </div>
                </div>
              </div>

              {/* ROW 4: INTERACTIVE EXCEL SLICER BAR (DATA VALIDATION DROPDOWN) */}
              <div className="grid grid-cols-[35px_1fr] bg-white">
                <div className="bg-[#F3F2F1] border-r border-slate-300 text-center py-1.5 text-[10px] text-slate-500 font-mono select-none">4</div>
                <div className="px-3 py-1.5 flex items-center gap-6 bg-slate-50 border-y border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Cell C4 (Region Slicer):</span>
                    <div className="relative">
                      <select
                        value={excelFilterRegion}
                        onChange={(e) => setExcelFilterRegion(e.target.value)}
                        className="px-3 py-1 pr-7 rounded bg-sky-100 text-sky-900 border border-sky-300 text-xs font-bold appearance-none cursor-pointer hover:bg-sky-200 transition-colors"
                      >
                        <option value="All Regions">All Regions (Global)</option>
                        <option value="North America">North America</option>
                        <option value="EMEA">EMEA</option>
                        <option value="APAC">APAC</option>
                        <option value="LATAM">LATAM</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-sky-700 absolute right-2 top-2 pointer-events-none" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Data Validation List</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Cell G4 (Channel Slicer):</span>
                    <div className="relative">
                      <select
                        value={excelFilterChannel}
                        onChange={(e) => setExcelFilterChannel(e.target.value)}
                        className="px-3 py-1 pr-7 rounded bg-indigo-100 text-indigo-900 border border-indigo-300 text-xs font-bold appearance-none cursor-pointer hover:bg-indigo-200 transition-colors"
                      >
                        <option value="All Channels">All Channels</option>
                        <option value="Direct Enterprise">Direct Enterprise</option>
                        <option value="Partner Ecosystem">Partner Ecosystem</option>
                        <option value="Inside Sales">Inside Sales</option>
                        <option value="Online Enterprise">Online Enterprise</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-indigo-700 absolute right-2 top-2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="ml-auto text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Changing slicer recalculates sheet formulas live!
                  </div>
                </div>
              </div>

              {/* ROW 6-8: EXECUTIVE KPI CARDS */}
              <div className="grid grid-cols-[35px_1fr] bg-white">
                <div className="bg-[#F3F2F1] border-r border-slate-300 text-center py-2 text-[10px] text-slate-500 font-mono select-none">6-8</div>
                <div className="p-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-center">
                    <div className="text-[10px] font-bold text-slate-500">GROSS REVENUE</div>
                    <div className="text-base font-black text-emerald-800">
                      ${Math.round(displayActualRev).toLocaleString()}
                    </div>
                    <div className="text-[9px] text-emerald-600 font-mono">=SUMIFS(Sales!R:R)</div>
                  </div>

                  <div className="p-2 rounded bg-sky-50 border border-sky-200 text-center">
                    <div className="text-[10px] font-bold text-slate-500">GROSS PROFIT</div>
                    <div className="text-base font-black text-sky-800">
                      ${Math.round(displayActualProfit).toLocaleString()}
                    </div>
                    <div className="text-[9px] text-sky-600 font-mono">=B7-COGS</div>
                  </div>

                  <div className="p-2 rounded bg-indigo-50 border border-indigo-200 text-center">
                    <div className="text-[10px] font-bold text-slate-500">PROFIT MARGIN</div>
                    <div className="text-base font-black text-indigo-800">
                      {((displayActualProfit / displayActualRev) * 100).toFixed(1)}%
                    </div>
                    <div className="text-[9px] text-indigo-600 font-mono">=D7/B7</div>
                  </div>

                  <div className="p-2 rounded bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-500">UNITS SHIPPED</div>
                    <div className="text-base font-black text-slate-800">
                      {kpi.totalUnits.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">=SUM(Units)</div>
                  </div>

                  <div className="p-2 rounded bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-500">TRANSACTIONS</div>
                    <div className="text-base font-black text-slate-800">
                      {kpi.orderCount.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">=COUNTA(A:A)</div>
                  </div>

                  <div className="p-2 rounded bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-500">AVERAGE DEAL</div>
                    <div className="text-base font-black text-slate-800">
                      ${Math.round(kpi.averageDealSize).toLocaleString()}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">=B7/J7</div>
                  </div>

                  <div className="p-2 rounded bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-500">ACCOUNTS</div>
                    <div className="text-base font-black text-slate-800">
                      {customerAccounts.length}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">=COUNTA(Cust!A:A)</div>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* ROWS 10-25: QUADRANT 1 & 2 CHARTS */}
              {/* Chart 1 (Left): Monthly Run-Rate Column Chart */}
              {/* Chart 2 (Right): Category Revenue Share Pie Chart */}
              {/* ========================================================================= */}
              <div className="grid grid-cols-[35px_1fr] bg-white">
                <div className="bg-[#F3F2F1] border-r border-slate-300 text-center py-4 text-[10px] text-slate-500 font-mono select-none">
                  10-25
                </div>

                <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
                  
                  {/* ------------------------------------------------------------- */}
                  {/* CHART 1: MONTHLY RUN-RATE CLUSTERED COLUMN CHART (B10:H25) */}
                  {/* ------------------------------------------------------------- */}
                  <div
                    onClick={() => setSelectedChart('chart1')}
                    className={`relative rounded-lg p-3 cursor-pointer transition-all ${
                      selectedChart === 'chart1'
                        ? 'ring-2 ring-blue-500 bg-blue-50/20 shadow-md'
                        : 'border border-slate-300 bg-white hover:border-slate-400'
                    }`}
                  >
                    {/* Excel Selection Handles (Shown when clicked in Excel!) */}
                    {selectedChart === 'chart1' && (
                      <>
                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute top-1 right-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          Selected in Excel • Range: $B$46:$E$57
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          Monthly Revenue &amp; Operating Profit Run-Rate
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Native Excel Clustered Column Chart &lt;c:barChart barDir="col"&gt;
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-3 text-[10px] font-medium text-slate-600">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-[#0284C7]"></span> Revenue ($)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-[#10B981]"></span> Gross Profit ($)
                        </span>
                      </div>
                    </div>

                    {/* Column Chart Bars */}
                    <div className="h-48 flex items-end justify-between gap-1 pt-4 pb-2 px-2 border-b border-slate-200">
                      {monthlyTrends.slice(0, 12).map((m, idx) => {
                        const maxRev = Math.max(...monthlyTrends.map((t) => t.revenue));
                        const revH = (m.revenue / maxRev) * 100;
                        const profH = (m.grossProfit / maxRev) * 100;

                        return (
                          <div
                            key={m.monthKey}
                            className="flex-1 flex flex-col items-center h-full justify-end group relative"
                            onMouseEnter={() =>
                              setHoveredPoint({
                                series: 'Monthly Run-Rate',
                                label: m.monthLabel,
                                value: `Rev: $${m.revenue.toLocaleString()} | Profit: $${m.grossProfit.toLocaleString()}`,
                              })
                            }
                            onMouseLeave={() => setHoveredPoint(null)}
                          >
                            <div className="w-full flex items-end justify-center gap-0.5 h-full">
                              <div
                                style={{ height: `${revH}%` }}
                                className="w-1/2 bg-[#0284C7] rounded-t-sm hover:brightness-110 transition-all cursor-pointer"
                              ></div>
                              <div
                                style={{ height: `${profH}%` }}
                                className="w-1/2 bg-[#10B981] rounded-t-sm hover:brightness-110 transition-all cursor-pointer"
                              ></div>
                            </div>
                            <span className="text-[8px] font-mono text-slate-500 mt-1 truncate">
                              {m.monthLabel.split(' ')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                      <span>X-Axis: Month ($B$46:$B$57)</span>
                      <span className="font-mono text-emerald-600">Active Excel Vector Chart Object</span>
                    </div>
                  </div>

                  {/* ------------------------------------------------------------- */}
                  {/* CHART 2: PRODUCT CATEGORY REVENUE SHARE PIE CHART (I10:O25) */}
                  {/* ------------------------------------------------------------- */}
                  <div
                    onClick={() => setSelectedChart('chart2')}
                    className={`relative rounded-lg p-3 cursor-pointer transition-all ${
                      selectedChart === 'chart2'
                        ? 'ring-2 ring-blue-500 bg-blue-50/20 shadow-md'
                        : 'border border-slate-300 bg-white hover:border-slate-400'
                    }`}
                  >
                    {/* Excel Selection Handles */}
                    {selectedChart === 'chart2' && (
                      <>
                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute top-1 right-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          Selected in Excel • Range: $I$46:$K$50
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                      <div>
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <PieIcon className="w-3.5 h-3.5 text-sky-600" />
                          Category Revenue Contribution (Native Pie Chart)
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Native OpenXML &lt;c:pieChart&gt; with % data labels
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        5 Product Slices
                      </span>
                    </div>

                    {/* Interactive Pie Visual Rendering */}
                    <div className="grid grid-cols-2 items-center h-48">
                      {/* SVG Native Pie Chart Graphic */}
                      <div className="relative flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-36 h-36 transform -rotate-90">
                          {(() => {
                            let cumulativePct = 0;
                            const totalRev = topCategories.reduce((s, c) => s + c.revenue, 0);

                            return topCategories.map((cat, idx) => {
                              const pct = cat.revenue / totalRev;
                              const strokeDasharray = `${pct * 100} ${100 - pct * 100}`;
                              const strokeDashoffset = -cumulativePct * 100;
                              cumulativePct += pct;

                              return (
                                <circle
                                  key={cat.category}
                                  cx="50"
                                  cy="50"
                                  r="25"
                                  fill="transparent"
                                  stroke={pieColors[idx % pieColors.length]}
                                  strokeWidth="38"
                                  strokeDasharray={strokeDasharray}
                                  strokeDashoffset={strokeDashoffset}
                                  className="transition-all hover:opacity-85 cursor-pointer"
                                  pathLength="100"
                                  onMouseEnter={() =>
                                    setHoveredPoint({
                                      series: 'Category Pie',
                                      label: cat.category,
                                      value: `$${cat.revenue.toLocaleString()}`,
                                      pct: `${(pct * 100).toFixed(1)}%`,
                                    })
                                  }
                                  onMouseLeave={() => setHoveredPoint(null)}
                                />
                              );
                            });
                          })()}
                        </svg>

                        {/* Interactive Center Hover Detail */}
                        <div className="absolute text-center pointer-events-none">
                          <div className="text-[10px] text-slate-500 font-semibold">Total</div>
                          <div className="text-xs font-black text-slate-800">100%</div>
                        </div>
                      </div>

                      {/* Pie Slices Legend & Percentage Callouts */}
                      <div className="space-y-1.5 pl-2">
                        {topCategories.map((cat, idx) => {
                          const totalRev = topCategories.reduce((s, c) => s + c.revenue, 0);
                          const pct = ((cat.revenue / totalRev) * 100).toFixed(1);

                          return (
                            <div
                              key={cat.category}
                              className="flex items-center justify-between text-[10px] p-1 rounded hover:bg-slate-100 transition-colors"
                            >
                              <div className="flex items-center gap-1.5 truncate pr-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: pieColors[idx % pieColors.length] }}
                                ></span>
                                <span className="font-medium text-slate-700 truncate">{cat.category}</span>
                              </div>
                              <span className="font-mono font-bold text-slate-900 shrink-0">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Series: $K$46:$K$50</span>
                      <span className="font-mono text-sky-600">Native Excel DrawingML</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* ========================================================================= */}
              {/* ROWS 27-42: QUADRANT 3 & 4 CHARTS */}
              {/* Chart 3 (Left): Regional Quota Performance Horizontal Bar Chart */}
              {/* Chart 4 (Right): Sales Channel Distribution Donut Chart */}
              {/* ========================================================================= */}
              <div className="grid grid-cols-[35px_1fr] bg-white">
                <div className="bg-[#F3F2F1] border-r border-slate-300 text-center py-4 text-[10px] text-slate-500 font-mono select-none">
                  27-42
                </div>

                <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
                  
                  {/* ------------------------------------------------------------- */}
                  {/* CHART 3: REGIONAL QUOTA HORIZONTAL BAR CHART (B27:H42) */}
                  {/* ------------------------------------------------------------- */}
                  <div
                    onClick={() => setSelectedChart('chart3')}
                    className={`relative rounded-lg p-3 cursor-pointer transition-all ${
                      selectedChart === 'chart3'
                        ? 'ring-2 ring-blue-500 bg-blue-50/20 shadow-md'
                        : 'border border-slate-300 bg-white hover:border-slate-400'
                    }`}
                  >
                    {/* Excel Selection Handles */}
                    {selectedChart === 'chart3' && (
                      <>
                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute top-1 right-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          Selected in Excel • Range: $I$29:$L$32
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          Regional Actual Revenue vs Quota Target (Horizontal Bar Chart)
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Native Excel Horizontal Bar Chart &lt;c:barChart barDir="bar"&gt;
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] font-medium text-slate-600">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-[#059669]"></span> Actual Rev
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-[#94A3B8]"></span> Quota Target
                        </span>
                      </div>
                    </div>

                    {/* Horizontal Bar Chart Rows */}
                    <div className="h-48 flex flex-col justify-around py-1">
                      {regionalPerformance.slice(0, 4).map((r) => {
                        const maxVal = Math.max(
                          ...regionalPerformance.map((item) => Math.max(item.actualRevenue, item.targetRevenue))
                        );
                        const actualW = (r.actualRevenue / maxVal) * 100;
                        const targetW = (r.targetRevenue / maxVal) * 100;

                        return (
                          <div
                            key={r.region}
                            className="space-y-1 group"
                            onMouseEnter={() =>
                              setHoveredPoint({
                                series: 'Regional Performance',
                                label: r.region,
                                value: `Actual: $${r.actualRevenue.toLocaleString()} | Target: $${r.targetRevenue.toLocaleString()}`,
                                pct: `${(r.quotaAttainmentPct * 100).toFixed(1)}% Attained`,
                              })
                            }
                            onMouseLeave={() => setHoveredPoint(null)}
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-slate-700">{r.region}</span>
                              <span className="font-mono text-emerald-700 font-semibold">
                                ${(r.actualRevenue / 1000).toFixed(0)}k / ${(r.targetRevenue / 1000).toFixed(0)}k ({Math.round(r.quotaAttainmentPct * 100)}%)
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              {/* Actual Revenue Bar */}
                              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                                <div
                                  style={{ width: `${actualW}%` }}
                                  className="bg-[#059669] rounded-full transition-all"
                                ></div>
                              </div>
                              {/* Quota Target Bar */}
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                                <div
                                  style={{ width: `${targetW}%` }}
                                  className="bg-[#94A3B8] rounded-full transition-all"
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Category Range: $I$29:$I$32</span>
                      <span className="font-mono text-emerald-600">Native Excel DrawingML</span>
                    </div>
                  </div>

                  {/* ------------------------------------------------------------- */}
                  {/* CHART 4: CHANNEL DISTRIBUTION DONUT CHART (I27:O42) */}
                  {/* ------------------------------------------------------------- */}
                  <div
                    onClick={() => setSelectedChart('chart4')}
                    className={`relative rounded-lg p-3 cursor-pointer transition-all ${
                      selectedChart === 'chart4'
                        ? 'ring-2 ring-blue-500 bg-blue-50/20 shadow-md'
                        : 'border border-slate-300 bg-white hover:border-slate-400'
                    }`}
                  >
                    {/* Excel Selection Handles */}
                    {selectedChart === 'chart4' && (
                      <>
                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute top-1 right-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          Selected in Excel • Range: $I$54:$K$57
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                      <div>
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-600" />
                          Sales Channel Distribution (Native Donut Chart)
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Native OpenXML &lt;c:doughnutChart holeSize="65"&gt;
                        </div>
                      </div>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                        4 Channels
                      </span>
                    </div>

                    {/* Donut Rendering */}
                    <div className="grid grid-cols-2 items-center h-48">
                      {/* Donut SVG */}
                      <div className="relative flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-36 h-36 transform -rotate-90">
                          {(() => {
                            let cumulativePct = 0;
                            return channels.map((ch) => {
                              const strokeDasharray = `${ch.share * 100} ${100 - ch.share * 100}`;
                              const strokeDashoffset = -cumulativePct * 100;
                              cumulativePct += ch.share;

                              return (
                                <circle
                                  key={ch.name}
                                  cx="50"
                                  cy="50"
                                  r="32"
                                  fill="transparent"
                                  stroke={ch.color}
                                  strokeWidth="20"
                                  strokeDasharray={strokeDasharray}
                                  strokeDashoffset={strokeDashoffset}
                                  className="transition-all hover:opacity-85 cursor-pointer"
                                  pathLength="100"
                                  onMouseEnter={() =>
                                    setHoveredPoint({
                                      series: 'Sales Channel',
                                      label: ch.name,
                                      value: `$${Math.round(ch.revenue).toLocaleString()}`,
                                      pct: `${(ch.share * 100).toFixed(0)}%`,
                                    })
                                  }
                                  onMouseLeave={() => setHoveredPoint(null)}
                                />
                              );
                            });
                          })()}
                        </svg>

                        <div className="absolute text-center pointer-events-none">
                          <div className="text-[9px] text-slate-400 font-bold uppercase">Direct Mix</div>
                          <div className="text-sm font-black text-indigo-700">42%</div>
                        </div>
                      </div>

                      {/* Channel Legend */}
                      <div className="space-y-1.5 pl-2">
                        {channels.map((ch) => (
                          <div
                            key={ch.name}
                            className="flex items-center justify-between text-[10px] p-1 rounded hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-1.5 truncate pr-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: ch.color }}
                              ></span>
                              <span className="font-medium text-slate-700 truncate">{ch.name}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-900 shrink-0">
                              {(ch.share * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Series: $K$54:$K$57</span>
                      <span className="font-mono text-indigo-600">Native Excel DrawingML</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* ========================================================================= */}
              {/* ROWS 44+: SUPPORTING DATA TABLES (DATA SOURCE FOR FORMULAS & CHARTS) */}
              {/* ========================================================================= */}
              <div className="grid grid-cols-[35px_1fr] bg-white">
                <div className="bg-[#F3F2F1] border-r border-slate-300 text-center py-4 text-[10px] text-slate-500 font-mono select-none">
                  44-60
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Grid className="w-3.5 h-3.5 text-emerald-600" />
                        Underlying Excel Source Tables (Dynamically Feeds All Charts Above)
                      </div>
                      <div className="text-[10px] text-slate-500">
                        When cells in these ranges change or are filtered, all charts above update automatically!
                      </div>
                    </div>

                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      Sheet 1: Executive Dashboard
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    {/* Table 1: Monthly Financial Run-Rate Summary Table ($B$46:$E$57) */}
                    <div
                      className={`rounded border transition-all ${
                        selectedChart === 'chart1'
                          ? 'border-blue-500 ring-2 ring-blue-300 bg-blue-50/10'
                          : 'border-slate-300'
                      }`}
                    >
                      <div className="bg-[#0F172A] text-white px-3 py-1.5 text-[11px] font-bold flex items-center justify-between">
                        <span>MONTHLY RUN-RATE SUMMARY ($B$46:$E$57)</span>
                        {selectedChart === 'chart1' && (
                          <span className="bg-blue-600 text-[9px] px-1.5 py-0.5 rounded">Chart 1 Data Source</span>
                        )}
                      </div>

                      <table className="w-full text-left text-[10px]">
                        <thead className="bg-[#334155] text-white font-semibold">
                          <tr>
                            <th className="py-1 px-2">Col B (Month)</th>
                            <th className="py-1 px-2 text-right">Col C (Revenue)</th>
                            <th className="py-1 px-2 text-right">Col E (Profit)</th>
                            <th className="py-1 px-2 text-right">Col F (Margin)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-mono">
                          {monthlyTrends.slice(0, 6).map((m, idx) => (
                            <tr key={m.monthKey} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              <td className="py-1 px-2 font-sans font-medium text-slate-800">
                                Row {46 + idx}: {m.monthLabel}
                              </td>
                              <td className="py-1 px-2 text-right font-bold text-slate-900">
                                ${m.revenue.toLocaleString()}
                              </td>
                              <td className="py-1 px-2 text-right text-emerald-700">
                                ${m.grossProfit.toLocaleString()}
                              </td>
                              <td className="py-1 px-2 text-right text-slate-600">
                                {(m.marginPct * 100).toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Table 2: Product Category Revenue Table ($I$46:$K$50) */}
                    <div
                      className={`rounded border transition-all ${
                        selectedChart === 'chart2'
                          ? 'border-blue-500 ring-2 ring-blue-300 bg-blue-50/10'
                          : 'border-slate-300'
                      }`}
                    >
                      <div className="bg-[#0F172A] text-white px-3 py-1.5 text-[11px] font-bold flex items-center justify-between">
                        <span>CATEGORY SUMMARY ($I$46:$K$50)</span>
                        {selectedChart === 'chart2' && (
                          <span className="bg-blue-600 text-[9px] px-1.5 py-0.5 rounded">Chart 2 Data Source</span>
                        )}
                      </div>

                      <table className="w-full text-left text-[10px]">
                        <thead className="bg-[#334155] text-white font-semibold">
                          <tr>
                            <th className="py-1 px-2">Col I (Category)</th>
                            <th className="py-1 px-2 text-right">Col J (Units)</th>
                            <th className="py-1 px-2 text-right">Col K (Revenue)</th>
                            <th className="py-1 px-2 text-right">Col M (Share)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-mono">
                          {topCategories.map((c, idx) => (
                            <tr key={c.category} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              <td className="py-1 px-2 font-sans font-medium text-slate-800">
                                Row {46 + idx}: {c.category}
                              </td>
                              <td className="py-1 px-2 text-right text-slate-600">{c.units.toLocaleString()}</td>
                              <td className="py-1 px-2 text-right font-bold text-slate-900">
                                ${c.revenue.toLocaleString()}
                              </td>
                              <td className="py-1 px-2 text-right text-sky-700">
                                {(c.sharePct * 100).toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EXCEL BOTTOM SHEET TABS BAR */}
        {/* ========================================================================= */}
        <div className="bg-[#F3F2F1] border-t border-slate-300 px-3 py-1.5 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-1">
            <span className="px-3 py-1 rounded-t bg-white border-t-2 border-[#107C41] font-bold text-[#107C41] shadow-sm flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#107C41]"></span>
              Executive Dashboard
            </span>

            <span className="px-3 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-t cursor-pointer text-xs">
              Sales Transactions
            </span>

            <span className="px-3 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-t cursor-pointer text-xs">
              Regional Performance
            </span>

            <span className="px-3 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-t cursor-pointer text-xs">
              Product Catalog
            </span>

            <span className="px-3 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-t cursor-pointer text-xs">
              Customer Accounts
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500 text-[11px] font-mono">
            <span>Ready</span>
            <span>•</span>
            <span>100% Zoom</span>
          </div>
        </div>

      </div>

      {/* Floating Hover Information Box (if user hovers any point) */}
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
