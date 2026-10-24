/**
 * Universal Julius Analytics View
 * Authoritative source: PRD v9.0 Phase 9C/9D/9E
 *
 * Implements full universal browser-driven workspace for arbitrary CSV/XLSX datasets.
 * Features:
 *  - Primary entry point: Upload CSV / XLSX
 *  - Zero sample preset tabs in production navigation
 *  - Schema-agnostic profiling and automatic classification without industry prompt
 *  - Generic statistical mode when unclassified without inventing business metrics
 *  - Developer-only testing fixtures isolated behind ?dev=1 query parameter
 *  - 100% in-browser, zero-AI, zero-telemetry
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  UNIVERSAL_PRESET_CATALOG,
  loadUniversalDataset,
} from '../analytics/universalPresets';
import { profileDataset } from '../analytics/profiler/datasetProfiler';
import { detectSemanticRoles } from '../analytics/profiler/semanticDetector';
import { resolveDomainRulePack } from '../analytics/rules/rulePacks';
import {
  composeUniversalDashboard,
  UniversalDashboardModel,
} from '../analytics/composer/dashboardComposer';
import { CanonicalExporter } from '../analytics/export/canonicalExporter';
import { PdfReportExporter } from '../analytics/export/pdfReportExporter';
import { TruePdfExporter } from '../analytics/export/truePdfExporter';
import { parseUploadedFile } from '../utils/dataImporter';
import { ChartThemeMode } from '../analytics/composer/chartAdapter';
import { UniversalJuliusDashboard } from './UniversalJuliusDashboard';
import {
  Database,
  Upload,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Lock,
  Code2,
} from 'lucide-react';

interface UniversalAnalyticsViewProps {
  onBackToApp: () => void;
  initialPreset?: string;
}

export function UniversalAnalyticsView({ onBackToApp, initialPreset }: UniversalAnalyticsViewProps) {
  // Check if developer testing mode is active (?dev=1, ?fixtures=1, or ?fixtures=true)
  const isDevMode = typeof window !== 'undefined' && (
    window.location.search.includes('dev=1') ||
    window.location.search.includes('fixtures=1') ||
    window.location.search.includes('fixtures=true') ||
    window.location.hash.includes('dev')
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Analyzing dataset locally in browser...');
  const [dashboardModel, setDashboardModel] = useState<UniversalDashboardModel | null>(null);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [datasetName, setDatasetName] = useState<string>('');
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [devMenuOpen, setDevMenuOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<ChartThemeMode>('dark');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processRows = useCallback(async (name: string, headers: string[], rows: Record<string, any>[]) => {
    setLoading(true);
    setLoadingMessage('Profiling schema, detecting additivity & composing analytical model...');
    await new Promise((r) => setTimeout(r, 40));

    try {
      const profile = profileDataset(headers, rows);
      const semantics = detectSemanticRoles(profile);
      const rulePack = resolveDomainRulePack(profile, semantics);
      const model = await composeUniversalDashboard('active_dataset', rows, profile, semantics, rulePack);

      setRawRows(rows);
      setDashboardModel(model);
      setDatasetName(name);
    } catch (err: any) {
      console.error('Failed to compose universal dashboard:', err);
      alert(`Error analyzing dataset: ${err?.message || 'Please verify data format.'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Developer fixture loader (isolated to dev mode or explicit initialPreset)
  const handleSelectPreset = useCallback(async (id: string) => {
    setLoading(true);
    setLoadingMessage(`Loading regression test fixture: ${id}...`);
    try {
      const ds = await loadUniversalDataset(id);
      await processRows(ds.name, ds.headers, ds.rows);
    } catch (err) {
      console.error('Failed to load preset:', err);
      setLoading(false);
    }
  }, [processRows]);

  // Load initial preset ONLY if explicitly requested via prop or query parameter in dev mode
  useEffect(() => {
    if (initialPreset) {
      handleSelectPreset(initialPreset);
    } else if (isDevMode) {
      const params = new URLSearchParams(window.location.search);
      const requestedPreset = params.get('preset');
      if (requestedPreset) {
        handleSelectPreset(requestedPreset);
      }
    }
  }, [initialPreset, isDevMode, handleSelectPreset]);

  // Unified File Handler for CSV, XLSX, XLS, TSV
  const handleFileSelection = async (file: File) => {
    if (!file) return;
    setLoading(true);
    setLoadingMessage(`Reading ${file.name} (${(file.size / 1024).toFixed(0)} KB)...`);

    try {
      const table = await parseUploadedFile(file);
      if (!table.rows || table.rows.length === 0) {
        alert('The uploaded file does not contain any readable data rows.');
        setLoading(false);
        return;
      }
      setLoadingMessage(`Auditing ${table.rows.length.toLocaleString()} records across ${table.headers.length} fields...`);
      await processRows(table.fileName, table.headers, table.rows);
    } catch (err: any) {
      console.error('Upload processing error:', err);
      alert(err.message || 'Failed to process file. Please ensure it is a valid CSV or XLSX spreadsheet.');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
    // Reset file input so the same file can be re-uploaded if desired
    if (e.target) e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const [activeFilter, setActiveFilter] = useState<{ field: string; value: string } | null>(null);

  const handleResetToUpload = () => {
    setDashboardModel(null);
    setRawRows([]);
    setDatasetName('');
    setActiveFilter(null);
  };

  // Export handlers with filter snapshot & error handling
  const handleDownloadExcel = useCallback(async (filterParam?: { field: string; value: string } | null) => {
    if (!dashboardModel || rawRows.length === 0) return;
    try {
      const filter = filterParam !== undefined ? filterParam : activeFilter;
      const exporter = new CanonicalExporter();
      const buf = await exporter.exportToExcel(dashboardModel, rawRows, {
        activeFilter: filter || undefined,
        datasetName,
      });
      const blob = new Blob([new Uint8Array(buf)], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(datasetName || 'universal').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}_universal_dashboard.xlsx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1500);
    } catch (err) {
      console.error('Failed to export Excel workbook:', err);
      alert('Error exporting Excel workbook. Please try again.');
    }
  }, [dashboardModel, rawRows, datasetName, activeFilter]);

  const handleDownloadHtml = useCallback((filterParam?: { field: string; value: string } | null) => {
    if (!dashboardModel) return;
    try {
      const filter = filterParam !== undefined ? filterParam : activeFilter;
      const exporter = new CanonicalExporter();
      const htmlStr = exporter.exportToHtml(dashboardModel, rawRows, {
        activeFilter: filter || undefined,
        datasetName,
      });
      const blob = new Blob([htmlStr], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(datasetName || 'universal').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}_universal_dashboard.html`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1500);
    } catch (err) {
      console.error('Failed to export HTML:', err);
      alert('Error exporting HTML dashboard. Please try again.');
    }
  }, [dashboardModel, rawRows, datasetName, activeFilter]);

  const handleDownloadPdf = useCallback((filterParam?: { field: string; value: string } | null) => {
    if (!dashboardModel) return;
    try {
      const filter = filterParam !== undefined ? filterParam : activeFilter;
      const exporter = new TruePdfExporter();
      const pdfBuf = exporter.exportToPdf(dashboardModel, rawRows, {
        activeFilter: filter || undefined,
        datasetName,
      });
      const u8 = new Uint8Array(pdfBuf);
      const blob = new Blob([u8.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(datasetName || 'universal').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1500);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Error exporting PDF document. Please verify data.');
    }
  }, [dashboardModel, rawRows, datasetName, activeFilter]);

  const handlePrintReportHtml = useCallback((filterParam?: { field: string; value: string } | null) => {
    if (!dashboardModel) return;
    try {
      const filter = filterParam !== undefined ? filterParam : activeFilter;
      const exporter = new PdfReportExporter();
      const pdfHtmlStr = exporter.generatePrintReadyPdfHtml(dashboardModel, rawRows, {
        activeFilter: filter || undefined,
        datasetName,
      });
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(pdfHtmlStr);
        printWindow.document.close();
        printWindow.focus();
      }
    } catch (err) {
      console.error('Failed to open print view:', err);
    }
  }, [dashboardModel, rawRows, datasetName, activeFilter]);

  const isDark = theme === 'dark';

  return (
    <div className={`w-full min-h-screen font-sans transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Top Universal Analytics Header Bar */}
      <header className={`border-b backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3.5 transition-colors duration-200 ${
        isDark ? 'border-slate-800/80 bg-slate-900/95 text-slate-100' : 'border-slate-200 bg-white/95 text-slate-900 shadow-2xs'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToApp}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors shadow-sm ${
                isDark ? 'border-slate-700/80 hover:bg-slate-800 text-slate-300' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <ArrowLeft size={14} /> Back to Classic Mode
            </button>
            <div className={`h-4 w-px hidden sm:block ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className="flex items-center gap-2">
              <span className={`p-1.5 rounded-lg ${isDark ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-50 text-sky-600'}`}>
                <Database size={16} />
              </span>
              <div>
                <h2 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                  Universal Julius Analytics <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isDark ? 'text-sky-400 bg-sky-500/10 border border-sky-500/20' : 'text-sky-700 bg-sky-50 border border-sky-200'
                  }`}>PRD v9.0</span>
                </h2>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Zero-AI Browser-Local Analytical Engine</p>
              </div>
            </div>
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* When a dataset is active: show file badge & replace button */}
            {dashboardModel && (
              <div className="flex items-center gap-2">
                <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-lg border text-xs ${
                  isDark ? 'bg-slate-800/70 border-slate-700/60 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}>
                  <FileSpreadsheet size={13} className={isDark ? "text-emerald-400" : "text-emerald-600"} />
                  <span className={`font-semibold max-w-[200px] truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`} title={datasetName}>
                    {datasetName}
                  </span>
                  <span className={`font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    ({rawRows.length.toLocaleString()} rows)
                  </span>
                </div>

                <label className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 transition-all shadow-sm">
                  <Upload size={13} />
                  <span>Upload New File</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls,.tsv"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleResetToUpload}
                  title="Clear active dataset and return to file upload screen"
                  className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                    isDark ? 'border-slate-700/80 hover:bg-slate-800 text-slate-300' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <RotateCcw size={12} />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            )}

            {/* Developer Testing Mode Dropdown (only visible with ?dev=1 query parameter) */}
            {isDevMode && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDevMenuOpen(!devMenuOpen)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors flex items-center gap-1"
                >
                  <Code2 size={13} />
                  <span>Dev Fixtures</span>
                </button>
                {devMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
                      Regression Fixtures
                    </div>
                    {UNIVERSAL_PRESET_CATALOG.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setDevMenuOpen(false);
                          handleSelectPreset(p.id);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[65vh] text-center p-6">
          <div className="w-12 h-12 border-3 border-sky-500/20 border-t-sky-400 rounded-full animate-spin mb-4" />
          <h3 className="text-sm font-bold text-slate-200">{loadingMessage}</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Profiling columns, classifying additivity, compiling deterministic query plans, and establishing exact cross-format parity...
          </p>
        </div>
      ) : dashboardModel ? (
        <UniversalJuliusDashboard
          model={dashboardModel}
          rawRows={rawRows}
          theme={theme}
          onThemeChange={setTheme}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onDownloadExcel={handleDownloadExcel}
          onDownloadHtml={handleDownloadHtml}
          onDownloadPdf={handleDownloadPdf}
          onPrintReportHtml={handlePrintReportHtml}
        />
      ) : (
        /* Primary Entry Point: Upload CSV / XLSX Dropzone & Capabilities */
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-4">
              <Sparkles size={13} />
              <span>Universal Automated Analytics & Executive Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
              Instant Executive Analytics from Raw Data
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Upload any business or operational dataset (.CSV, .XLSX, .XLS). Automatically profiled, analyzed, and synthesized into an executive dashboard in seconds — 100% in-browser with zero AI hallucination.
            </p>
          </div>

          {/* Interactive Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer relative rounded-2xl border-2 border-dashed transition-all p-8 sm:p-12 text-center ${
              isDragActive
                ? 'border-sky-400 bg-sky-950/30 scale-[1.01] shadow-2xl shadow-sky-500/10'
                : 'border-slate-700/80 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.tsv"
              onChange={handleInputChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                <Upload size={28} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-1">
                Drop your CSV or Excel file here, or click to browse
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Supports CSV, XLSX, XLS, and TSV spreadsheets up to 25 MB
              </p>

              {/* Supported Format Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">.CSV</span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">.XLSX</span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">.XLS</span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">.TSV</span>
              </div>

              {/* Instant Demo Dataset Trigger */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                <button
                  type="button"
                  id="try-demo-sales-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPreset('sales');
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Load the 5,000+ row commercial sales dataset"
                >
                  <Sparkles size={14} />
                  <span>Try Demo Commercial Sales Dataset (5,000+ Rows)</span>
                </button>
              </div>

              {/* Privacy & Locality Guarantee */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <ShieldCheck size={14} />
                <span>100% Client-Side In-Browser Processing • Zero server uploads • Your data never leaves your device</span>
              </div>
            </div>
          </div>

          {/* Engine Capabilities Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
                <Layers size={18} />
              </div>
              <h4 className="text-sm font-bold text-slate-200 mb-1.5">Schema-Agnostic Profiling</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Discovers column types, discrete vs continuous measures, additivity tiers, and distributions automatically without manual field mapping.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <ShieldCheck size={18} />
              </div>
              <h4 className="text-sm font-bold text-slate-200 mb-1.5">Zero-AI Deterministic Parity</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Aggregations use verified mathematical formulas and strict denominator rules. Unclassified datasets fall back to safe statistical summaries.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                <FileSpreadsheet size={18} />
              </div>
              <h4 className="text-sm font-bold text-slate-200 mb-1.5">Boardroom-Ready Exports</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instantly export 5-sheet native Excel (.xlsx) workbooks with formulas, genuine binary vector PDF reports (.pdf), and offline interactive HTML.
              </p>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
