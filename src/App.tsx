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
import { HomePage } from './components/HomePage';
import { Footer } from './components/Footer';
import { INDUSTRY_PRESETS } from './utils/dataGenerator';
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

  // Active Worksheet View Tab - Default to 'home' landing page
  const [activeTab, setActiveTab] = useState<
    'home' | 'dashboard' | 'excel-preview' | 'pivot' | 'transactions' | 'regions' | 'products' | 'customers'
  >('home');

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
        {activeTab === 'home' ? (
          <HomePage
            onOpenDashboard={() => setActiveTab('dashboard')}
            onOpenExcelView={() => setActiveTab('excel-preview')}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onDownloadExcel={handleDownloadExcel}
            isDownloading={isDownloading}
            onSelectIndustry={(ind) => {
              const preset = INDUSTRY_PRESETS[ind];
              setConfig((prev) => ({
                ...prev,
                industry: ind,
                companyName: preset ? preset.companyDefault : prev.companyName,
              }));
              setActiveTab('dashboard');
            }}
            currentIndustry={config.industry}
          />
        ) : (
          <>
            <div className="section-heading">
              <div>
                <div className="eyebrow">YOUR WORKSPACE</div>
                <h2>{customImportResult ? 'The story in your data' : 'Executive Analytics Workspace'}</h2>
              </div>
              <div className="report-section-actions">
                <span className="quiet-badge">
                  <span />
                  {customImportResult ? `${config.recordCount.toLocaleString()} source records` : 'Live Sample Data'}
                </span>
                {!customImportResult && (
                  <button className="secondary-button" onClick={() => setIsCustomizerOpen(true)}>
                    <Sliders size={14} />
                    Choose industry
                  </button>
                )}
              </div>
            </div>

            {customImportResult && (
              <div className="source-file-strip">
                <span className="source-file-icon">
                  <FileSpreadsheet size={20} />
                </span>
                <div>
                  <strong>{customImportResult.summary.fileName}</strong>
                  <small>
                    {customImportResult.summary.rowCount.toLocaleString()} records ·{' '}
                    {customImportResult.schema.columns.length} original fields · {customImportResult.summary.dateSpan}
                  </small>
                </div>
                <span className="source-file-label">SOURCE DATA</span>
                <button className="text-button" onClick={() => setIsUploadModalOpen(true)}>
                  Replace file <Upload size={13} />
                </button>
                <button className="text-button" onClick={handleResetToSample}>
                  Reset
                </button>
              </div>
            )}

            {customImportResult && (
              <AdaptiveDashboard
                key={customImportResult.summary.fileName + customImportResult.summary.rowCount}
                data={dataset}
                selection={analysisSelection}
                onChange={setAnalysisSelection}
                view={activeTab}
              />
            )}

            {!customImportResult &&
              (activeTab === 'excel-preview' ? (
                <ExcelLiveViewer
                  key={config.industry + seedOffset}
                  data={dataset}
                  config={config}
                  onDownloadExcel={handleDownloadExcel}
                  isDownloading={isDownloading}
                />
              ) : activeTab === 'dashboard' ? (
                <IndustryDashboard
                  key={config.industry + seedOffset}
                  data={dataset}
                  onRecords={() => setActiveTab('transactions')}
                />
              ) : (
                <AdaptiveDashboard
                  key={config.industry + seedOffset}
                  data={dataset}
                  selection={analysisSelection}
                  onChange={setAnalysisSelection}
                  view={activeTab}
                />
              ))}
          </>
        )}
      </main>

      {/* Comprehensive Modern Footer */}
      <Footer onSelectTab={setActiveTab} onOpenUploadModal={() => setIsUploadModalOpen(true)} />

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
