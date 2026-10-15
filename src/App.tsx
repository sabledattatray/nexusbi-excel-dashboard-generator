import React, { useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Download,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Layers,
  Sparkles,
  Sliders,
  ExternalLink,
  Table,
  Zap,
  PieChart as PieIcon,
  AlignLeft,
} from 'lucide-react';
import { DatasetConfig } from './types/dataset';
import { generateRealisticDataset, INDUSTRY_PRESETS } from './utils/dataGenerator';
import { exportToProfessionalExcel } from './utils/excelExporter';
import { Navbar } from './components/Navbar';
import { KpiMetrics } from './components/KpiMetrics';
import { InteractivePieChart } from './components/InteractivePieChart';
import { InteractiveHorizontalBarChart } from './components/InteractiveHorizontalBarChart';
import { InteractiveDonutChart } from './components/InteractiveDonutChart';
import { InteractiveWaterfallChart } from './components/InteractiveWaterfallChart';
import { InteractiveGaugeMeter } from './components/InteractiveGaugeMeter';
import { SeasonalHeatmapMatrix } from './components/SeasonalHeatmapMatrix';
import { InteractiveCharts } from './components/InteractiveCharts';
import { ExecutiveInsights } from './components/ExecutiveInsights';
import { ExcelLiveViewer } from './components/ExcelLiveViewer';
import { DataGrid } from './components/DataGrid';
import { WorkbookTabsPreview } from './components/WorkbookTabsPreview';
import { CustomizerModal } from './components/CustomizerModal';
import { DownloadSuccessModal } from './components/DownloadSuccessModal';

export default function App() {
  // Dataset Configuration State
  const [config, setConfig] = useState<DatasetConfig>({
    companyName: 'Nexus Cloud Technologies Inc.',
    reportTitle: 'FY2024-2025 Global Sales Performance & Executive Dashboard',
    industry: 'enterprise_tech',
    recordCount: 1000,
    currency: 'USD',
    currencySymbol: '$',
    includeChartsInExcel: true,
    useLiveExcelFormulas: true,
  });

  // Active Worksheet View Tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'excel-preview' | 'transactions' | 'regions' | 'products' | 'customers'
  >('dashboard');

  // Randomization Seed offset to allow "Refresh Data"
  const [seedOffset, setSeedOffset] = useState<number>(0);

  // Slicer Filters
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('ALL');
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals state
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [lastDownloadedFilename, setLastDownloadedFilename] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Generate realistic dataset
  const dataset = useMemo(() => {
    return generateRealisticDataset({
      ...config,
      recordCount: config.recordCount + seedOffset,
    });
  }, [config, seedOffset]);

  // Overall quota attainment rate
  const globalTargetRevenue = useMemo(() => {
    return dataset.regionalPerformance.reduce((s, r) => s + r.targetRevenue, 0);
  }, [dataset]);

  const globalAttainmentPct = globalTargetRevenue > 0 ? dataset.kpi.totalRevenue / globalTargetRevenue : 1;

  // Handle Download Excel
  const handleDownloadExcel = useCallback(async () => {
    try {
      setIsDownloading(true);
      const { blob, filename } = await exportToProfessionalExcel(dataset, config);

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Confetti celebration
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#10B981', '#0284C7', '#6366F1', '#F59E0B'],
      });

      setLastDownloadedFilename(filename);
      setIsSuccessOpen(true);
    } catch (error) {
      console.error('Failed to export Excel file:', error);
      alert('Could not compile Excel file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [dataset, config]);

  const handleRegenerateData = () => {
    setSeedOffset((prev) => (prev + 1) % 100);
  };

  const handleSaveConfig = (newConfig: DatasetConfig) => {
    setConfig(newConfig);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        config={config}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onDownloadExcel={handleDownloadExcel}
        isDownloading={isDownloading}
        onRegenerateData={handleRegenerateData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Executive Announcement / Quick Download Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/70 border border-slate-800 p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Native Excel Format (.xlsx) • Interactive Visual Charts
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  v2025.4 • Verified Data
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                {config.reportTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Realistic enterprise business dataset with {config.recordCount.toLocaleString()} transactions across 4 global regions. Download as an authentic multi-sheet <strong>.xlsx</strong> file featuring <strong>real native Excel charts (Pie, Horizontal Bar, Column)</strong>, automated KPI tiles, live formulas, and dropdown slicers!
              </p>
            </div>

            {/* Quick Actions in Banner */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveTab('excel-preview')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border flex items-center gap-2 transition-all shadow-md ${
                  activeTab === 'excel-preview'
                    ? 'bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-400/50'
                    : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/40 hover:border-emerald-400'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>👀 See How Charts Look in Excel</span>
              </button>

              <button
                onClick={() => setIsCustomizerOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 flex items-center gap-2 transition-colors"
              >
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>Customize Model</span>
              </button>

              <button
                onClick={handleDownloadExcel}
                disabled={isDownloading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/25 border border-emerald-400/30 flex items-center gap-2.5 transition-all transform active:scale-95 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Master Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Quick Features Row */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real Native Excel Charts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pie, Donut &amp; Horizontal Bar Charts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dropdown Excel Slicers (Data Validation)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Excel Mathematical Formulas</span>
            </div>
          </div>
        </div>

        {/* Tab 0: See How Charts Look in Excel (.xlsx Live Simulator) */}
        {activeTab === 'excel-preview' && (
          <ExcelLiveViewer
            data={dataset}
            config={config}
            onDownloadExcel={handleDownloadExcel}
            isDownloading={isDownloading}
          />
        )}

        {/* Tab 1: Executive Dashboard (Full Visuals Suite) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top KPI Metric Tiles */}
            <KpiMetrics data={dataset} useLiveFormulas={config.useLiveExcelFormulas} />

            {/* Visuals Showcase Row 1: Pie Chart & Horizontal Bar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InteractivePieChart
                categories={dataset.categorySummaries}
                onSelectCategory={(cat) => setSelectedCategory(selectedCategory === cat ? 'ALL' : cat)}
                selectedCategory={selectedCategory}
              />

              <InteractiveHorizontalBarChart
                regionalPerformance={dataset.regionalPerformance}
                onSelectRegion={(reg) => setSelectedRegion(selectedRegion === reg ? 'ALL' : reg)}
                selectedRegion={selectedRegion}
              />
            </div>

            {/* Visuals Showcase Row 2: Donut Chart & Speedometer Gauge */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <InteractiveDonutChart
                  categories={dataset.categorySummaries}
                  onSelectCategory={(cat) => setSelectedCategory(selectedCategory === cat ? 'ALL' : cat)}
                  selectedCategory={selectedCategory}
                />
              </div>

              <div>
                <InteractiveGaugeMeter
                  attainmentPct={globalAttainmentPct}
                  totalRevenue={dataset.kpi.totalRevenue}
                  targetRevenue={globalTargetRevenue}
                />
              </div>
            </div>

            {/* Financial Waterfall P&L Bridge Chart */}
            <InteractiveWaterfallChart kpi={dataset.kpi} />

            {/* Proper & Informative Strategic Diagnostics Memo */}
            <ExecutiveInsights data={dataset} selectedRegion={selectedRegion} />

            {/* Monthly Trajectory, Regional Bullet Quotas & Sales Leaderboard */}
            <InteractiveCharts
              data={dataset}
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
              selectedQuarter={selectedQuarter}
              setSelectedQuarter={setSelectedQuarter}
              selectedChannel={selectedChannel}
              setSelectedChannel={setSelectedChannel}
            />

            {/* Seasonal Velocity Heatmap Matrix */}
            <SeasonalHeatmapMatrix
              transactions={dataset.transactions}
              categories={dataset.categorySummaries}
            />

            {/* Quick Preview of the Sales Transactions Table inside Dashboard */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Table className="w-4 h-4 text-sky-400" />
                    Sales Transactions Preview (Sheet #2)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live sample of the underlying {config.recordCount.toLocaleString()} transaction rows exported in the Excel file
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 transition-colors"
                >
                  <span>Open Full Spreadsheet View</span>
                  <span>→</span>
                </button>
              </div>

              <DataGrid transactions={dataset.transactions} useLiveFormulas={config.useLiveExcelFormulas} />
            </div>
          </div>
        )}

        {/* Tab 2: Full Sales Transactions Spreadsheet View */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-sky-400" />
                  Sheet #2: Certified Sales Transactions Ledger
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete dataset of {config.recordCount.toLocaleString()} transactions with automated calculations for Revenue, COGS, Profit, and Margins.
                </p>
              </div>

              <button
                onClick={handleDownloadExcel}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export This Sheet in .xlsx</span>
              </button>
            </div>

            <DataGrid transactions={dataset.transactions} useLiveFormulas={config.useLiveExcelFormulas} />
          </div>
        )}

        {/* Tabs 3, 4, 5: Regional, Products, Customers */}
        {(activeTab === 'regions' || activeTab === 'products' || activeTab === 'customers') && (
          <WorkbookTabsPreview
            data={dataset}
            activeTab={activeTab}
            useLiveFormulas={config.useLiveExcelFormulas}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-400">NexusBI Excel Generator</span>
            <span>• Enterprise Data & Spreadsheet Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Format: Excel OpenXML (.xlsx)</span>
            <span>•</span>
            <span>Visuals: Native Pie, Horizontal Bar, Donut, Waterfall & Heatmap Charts</span>
            <span>•</span>
            <span>Formulas: Standard Live Excel Syntax</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      <DownloadSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        filename={lastDownloadedFilename}
        rowCount={config.recordCount}
        onReDownload={handleDownloadExcel}
      />
    </div>
  );
}
