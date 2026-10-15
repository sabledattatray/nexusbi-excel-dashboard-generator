import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  Upload,
  RotateCcw,
} from 'lucide-react';
import { ExcelLiveViewer } from './components/ExcelLiveViewer';
import { IndustryDashboard } from './components/IndustryDashboard';
import { generateProfessionalDataset } from './utils/professionalPresentation';
import { exportToProfessionalExcel } from './utils/excelExporter';
import { AdaptiveDashboard } from './components/AdaptiveDashboard';
import { AnalysisSelection, initialSelection } from './utils/adaptiveAnalysis';
import { exportAdaptiveExcel } from './utils/adaptiveExcelExporter';
import { DatasetConfig } from './types/dataset';
import { Navbar } from './components/Navbar';
import { CustomizerModal } from './components/CustomizerModal';
import { DownloadSuccessModal } from './components/DownloadSuccessModal';
import { DataUploadModal } from './components/DataUploadModal';
import { ImportResult, parseUploadedFile, inferColumnMapping, buildDatasetFromUpload } from './utils/dataImporter';

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
    'dashboard' | 'excel-preview' | 'pivot' | 'transactions' | 'regions' | 'products' | 'customers'
  >('dashboard');

  // Randomization Seed offset to allow "Refresh Data"
  const [seedOffset, setSeedOffset] = useState<number>(0);

  // Slicer Filters

  // Modals state
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [lastDownloadedFilename, setLastDownloadedFilename] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Custom Uploaded Dataset state
  const [customImportResult, setCustomImportResult] = useState<ImportResult | null>(null);

  const [analysisSelection, setAnalysisSelection] = useState<AnalysisSelection>({ metric: '', dimension: '', aggregation: 'count' });

  // Synthetic Realistic Dataset (default)
  const syntheticDataset = useMemo(() => {
    return generateProfessionalDataset(config, seedOffset);
  }, [config, seedOffset]);

  // Active Dataset (either custom uploaded data or synthetic model)
  const dataset = useMemo(() => {
    if (customImportResult) {
      return customImportResult.dataset;
    }
    return syntheticDataset;
  }, [customImportResult, syntheticDataset]);

  useEffect(() => { setAnalysisSelection(initialSelection(dataset)); }, [dataset]);

  // Handle Download Excel
  const handleDownloadExcel = useCallback(async () => {
    try {
      setIsDownloading(true);
      const { blob, filename } = await (customImportResult ? exportAdaptiveExcel(dataset, dataset.config, analysisSelection) : exportToProfessionalExcel(dataset, config));

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
  }, [dataset, config, customImportResult, analysisSelection]);

  const handleRegenerateData = () => {
    if (customImportResult) {
      // Re-trigger import synthesis
      return;
    }
    setSeedOffset((prev) => (prev + 1) % 100);
  };

  const handleSaveConfig = (newConfig: DatasetConfig) => {
    setCustomImportResult(null);
    setConfig(newConfig);
    setActiveTab('dashboard');
  };

  const handleImportComplete = (result: ImportResult) => {
    setCustomImportResult(result);
    setAnalysisSelection(initialSelection(result.dataset));
    setConfig(result.config);
    setActiveTab('dashboard');
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.55 },
      colors: ['#6366F1', '#10B981', '#38BDF8', '#F59E0B'],
    });
  };

  const handleExample = async (name: 'workforce' | 'sales') => {
    try {
      const response = await fetch(`/examples/${name}.csv`);
      if (!response.ok) throw new Error('Example file could not be loaded.');
      const table = await parseUploadedFile(new File([await response.text()], `${name}.csv`, { type: 'text/csv' }));
      handleImportComplete(buildDatasetFromUpload(table, inferColumnMapping(table), { ...config, industry: table.schema!.detectedIndustry }));
    } catch (error) { alert(error instanceof Error ? error.message : 'Could not load example.'); }
  };

  const handleResetToSample = () => {
    setCustomImportResult(null);
    setConfig({
      companyName: 'Nexus Cloud Technologies Inc.',
      reportTitle: 'FY2024-2025 Global Sales Performance & Executive Dashboard',
      industry: 'enterprise_tech',
      recordCount: 1000,
      currency: 'USD',
      currencySymbol: '$',
      includeChartsInExcel: true,
      useLiveExcelFormulas: true,
    });
  };

  return (
    <div className="premium-workspace min-h-screen flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        config={config}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onDownloadExcel={handleDownloadExcel}
        isDownloading={isDownloading}
        onRegenerateData={handleRegenerateData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCustomDataActive={!!customImportResult}
      />

      {/* Main Content Area */}
      <main id="main-content" className={`workspace-main space-y-7 ${activeTab === 'excel-preview' ? 'excel-preview-main' : ''}`}>
        <details className="studio-intro"><summary><span><Layers size={15}/> Excel & CSV workspace guide</span><span>Examples & import tools +</span></summary><section className="workspace-hero">
          <div className="hero-editorial"><div className="eyebrow"><span/> THE ANALYTICS STUDIO</div><h1>Your data.<br/><em>A clearer perspective.</em></h1><p>Turn the details in your spreadsheets into a story you can act on. Explore your numbers, understand the patterns, and build a report worth sharing.</p><div className="hero-actions"><button className="primary-button" onClick={() => setIsUploadModalOpen(true)}><Upload size={16}/>Bring your data</button><button className="text-button" onClick={() => setActiveTab('excel-preview')}>Explore the workbook <span>↗</span></button></div><div className="hero-formats"><FileSpreadsheet size={14}/><span>EXCEL & CSV</span><i/> <span>EDITABLE .XLSX EXPORT</span></div></div>
          <div className="hero-art" aria-hidden="true"><div className="art-grid"/><span className="art-orbit orbit-one"/><span className="art-orbit orbit-two"/><div className="art-chart-card"><div className="art-card-top"><span className="art-card-icon"><BarChart3 size={17}/></span><span>Clarity in every column</span><span className="art-card-dot"/></div><div className="art-chart"><svg viewBox="0 0 320 110" fill="none"><path d="M0 90H320M0 55H320M0 20H320" stroke="#e5ece8" strokeDasharray="4 5"/><path d="M0 93L35 76L65 82L100 53L135 62L170 35L205 42L245 13L280 25L320 5V110H0Z" fill="url(#hero-area)"/><path d="M0 93L35 76L65 82L100 53L135 62L170 35L205 42L245 13L280 25L320 5" stroke="#218573" strokeWidth="2.5"/><defs><linearGradient id="hero-area" x1="160" y1="0" x2="160" y2="110" gradientUnits="userSpaceOnUse"><stop stopColor="#71b8a4" stopOpacity=".35"/><stop offset="1" stopColor="#71b8a4" stopOpacity="0"/></linearGradient></defs></svg></div><div className="art-card-bottom"><span>THE DETAILS</span><span>THE BIGGER PICTURE ↗</span></div></div><div className="art-mini-card"><span className="art-mini-icon"><Layers size={18}/></span><div><strong>Built around your data</strong><small>From raw rows to meaningful reports</small></div><CheckCircle2 size={17}/></div><span className="art-caption">A NEW POINT OF VIEW</span></div>
        </section>
        <div className="example-strip"><div><span className="example-icon"><Layers size={17}/></span><span><strong>A little inspiration to get started</strong><small>Explore two examples with different fields and perspectives.</small></span></div><div><button onClick={() => handleExample('workforce')}>Workforce analytics <span>↗</span></button><button onClick={() => handleExample('sales')}>Sales performance <span>↗</span></button></div></div>
        </details>
        <div className="section-heading"><div><div className="eyebrow">YOUR WORKSPACE</div><h2>{customImportResult ? 'The story in your data' : 'Industry intelligence'}</h2></div><div className="report-section-actions"><span className="quiet-badge"><span/>{customImportResult ? `${config.recordCount.toLocaleString()} source records` : 'Illustrative sample data'}</span>{!customImportResult && <button className="secondary-button" onClick={() => setIsCustomizerOpen(true)}><Sliders size={14}/>Choose industry</button>}</div></div>

        {customImportResult && <div className="source-file-strip"><span className="source-file-icon"><FileSpreadsheet size={20}/></span><div><strong>{customImportResult.summary.fileName}</strong><small>{customImportResult.summary.rowCount.toLocaleString()} records · {customImportResult.schema.columns.length} original fields · {customImportResult.summary.dateSpan}</small></div><span className="source-file-label">SOURCE DATA</span><button className="text-button" onClick={() => setIsUploadModalOpen(true)}>Replace file <Upload size={13}/></button><button className="text-button" onClick={handleResetToSample}>Reset</button></div>}

        {customImportResult && <AdaptiveDashboard key={customImportResult.summary.fileName + customImportResult.summary.rowCount} data={dataset} selection={analysisSelection} onChange={setAnalysisSelection} view={activeTab} />}

        {!customImportResult && (activeTab === 'excel-preview'
          ? <ExcelLiveViewer key={config.industry + seedOffset} data={dataset} config={config} onDownloadExcel={handleDownloadExcel} isDownloading={isDownloading} />
          : activeTab === 'dashboard'
          ? <IndustryDashboard key={config.industry + seedOffset} data={dataset} onRecords={() => setActiveTab('transactions')} />
          : <AdaptiveDashboard key={config.industry + seedOffset} data={dataset} selection={analysisSelection} onChange={setAnalysisSelection} view={activeTab} />)}
      </main>

      <footer className="workspace-footer"><div className="footer-top"><div><div className="footer-brand"><BarChart3 size={18}/>NexusBI</div><p>Make sense of your spreadsheets.</p></div><div className="footer-principles"><span><FileSpreadsheet size={15}/>Open Excel format</span><span><Layers size={15}/>Original data preserved</span><span><CheckCircle2 size={15}/>Transparent calculations</span></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} NexusBI · Crafted by Datta Sable</span><span>Thoughtful tools. Clearer decisions.</span></div></footer>

      {/* Modals */}
      <CustomizerModal key={config.industry + config.companyName + isCustomizerOpen}
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        baseConfig={config}
        onImportComplete={handleImportComplete}
      />

      <DownloadSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        filename={lastDownloadedFilename}
        rowCount={config.recordCount}
        onReDownload={handleDownloadExcel}
        sourceBased={!!customImportResult}
      />
    </div>
  );
}
