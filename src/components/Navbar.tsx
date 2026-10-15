import React from 'react';
import {
  Download,
  FileSpreadsheet,
  Sliders,
  RefreshCw,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { DatasetConfig } from '../types/dataset';
import { INDUSTRY_PRESETS } from '../utils/dataGenerator';

interface NavbarProps {
  config: DatasetConfig;
  onOpenCustomizer: () => void;
  onDownloadExcel: () => void;
  isDownloading: boolean;
  onRegenerateData: () => void;
  activeTab: 'dashboard' | 'excel-preview' | 'transactions' | 'regions' | 'products' | 'customers';
  setActiveTab: (tab: 'dashboard' | 'excel-preview' | 'transactions' | 'regions' | 'products' | 'customers') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  onOpenCustomizer,
  onDownloadExcel,
  isDownloading,
  onRegenerateData,
  activeTab,
  setActiveTab,
}) => {
  const currentIndustry = INDUSTRY_PRESETS[config.industry];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Banner / Status Line */}
      <div className="px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 bg-slate-950/60 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-slate-300">Ready for Excel (.xlsx) Export</span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline text-slate-400">5 Sheets included</span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden md:inline text-slate-400">Live formulas (`=SUM`, `=AVERAGE`) & embedded visual charts</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-300 font-mono">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>{config.recordCount.toLocaleString()} Rows</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Microsoft 365 & Google Sheets Compatible</span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Organization Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="h-full w-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {config.companyName}
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {currentIndustry.name}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Executive BI Reporting & Automated Professional Excel Suite
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setActiveTab('excel-preview')}
            className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all shadow-sm ${
              activeTab === 'excel-preview'
                ? 'bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-400/50'
                : 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border-emerald-500/40 hover:border-emerald-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>See How Charts Look in Excel (.xlsx)</span>
          </button>

          <button
            onClick={onRegenerateData}
            title="Generate fresh random records"
            className="p-2 sm:px-3 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          <button
            onClick={onOpenCustomizer}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Customize Dataset</span>
          </button>

          <button
            onClick={onDownloadExcel}
            disabled={isDownloading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-600/30 border border-emerald-400/30 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Compiling Excel Workbook...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Excel (.xlsx)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Excel Sheet Navigation Tabs Bar (Simulating Excel Worksheet Tabs at the top) */}
      <div className="px-4 sm:px-6 bg-slate-900 border-t border-slate-800/80 flex items-center overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-3 flex items-center gap-1 shrink-0">
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
          Worksheets:
        </span>
        <div className="flex items-center gap-1 py-1.5">
          <button
            onClick={() => setActiveTab('excel-preview')}
            className={`px-3 py-1.5 rounded-t text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'excel-preview'
                ? 'bg-emerald-500/20 text-emerald-300 border-b-2 border-emerald-400 font-bold'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40'
            }`}
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>👀 See How Charts Look in Excel</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-t text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/15 text-emerald-300 border-b-2 border-emerald-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            1. Executive Dashboard (Visuals &amp; KPIs)
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-t text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'transactions'
                ? 'bg-sky-500/15 text-sky-300 border-b-2 border-sky-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            2. Sales Transactions ({config.recordCount} rows)
          </button>

          <button
            onClick={() => setActiveTab('regions')}
            className={`px-3 py-1.5 rounded-t text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'regions'
                ? 'bg-indigo-500/15 text-indigo-300 border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            3. Regional Performance & Quota
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-t text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'products'
                ? 'bg-purple-500/15 text-purple-300 border-b-2 border-purple-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            4. Product Catalog & Margins
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 rounded-t text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'customers'
                ? 'bg-pink-500/15 text-pink-300 border-b-2 border-pink-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
            5. Key Customer Accounts
          </button>
        </div>
      </div>
    </header>
  );
};
