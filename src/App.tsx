import React, { useState, useMemo, useCallback, useEffect, Suspense, lazy } from 'react';
import confetti from 'canvas-confetti';
import {
  Download,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Layers,
  Sparkles,
  LayoutTemplate,
  ExternalLink,
  Table,
  Zap,
  PieChart as PieIcon,
  AlignLeft,
  Upload,
  RotateCcw,
} from 'lucide-react';
import { generateProfessionalDataset } from './utils/professionalPresentation';
import { AnalysisSelection, initialSelection } from './utils/adaptiveAnalysis';
import { DatasetConfig } from './types/dataset';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { Footer } from './components/Footer';
import { INDUSTRY_PRESETS } from './utils/dataGenerator';
import { ImportResult, parseUploadedFile, inferColumnMapping, buildDatasetFromUpload } from './utils/dataImporter';
import { isProUnlocked, consumeDownloadCredit, resetProLicense, PRO_LICENSE_EVENT } from './utils/proLicenseManager';

// Lazy-loaded heavy components for lightning-fast initial load & maximum smoothness
const ExcelLiveViewer = lazy(() => import('./components/ExcelLiveViewer').then((m) => ({ default: m.ExcelLiveViewer })));
const IndustryDashboard = lazy(() => import('./components/IndustryDashboard').then((m) => ({ default: m.IndustryDashboard })));
const AdaptiveDashboard = lazy(() => import('./components/AdaptiveDashboard').then((m) => ({ default: m.AdaptiveDashboard })));
const CustomizerModal = lazy(() => import('./components/CustomizerModal').then((m) => ({ default: m.CustomizerModal })));
const DownloadSuccessModal = lazy(() => import('./components/DownloadSuccessModal').then((m) => ({ default: m.DownloadSuccessModal })));
const DataUploadModal = lazy(() => import('./components/DataUploadModal').then((m) => ({ default: m.DataUploadModal })));
const LegalModal = lazy(() => import('./components/LegalModal').then((m) => ({ default: m.LegalModal })));
import { LegalPage, LegalRoute } from './components/LegalPage';
import { trackEvent, trackPageView } from './utils/analytics';

const WorkspaceLoader = () => (
  <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[340px] text-center" aria-live="polite">
    <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mb-3" />
    <span className="text-xs font-mono font-medium text-emerald-800">Loading analytics workspace…</span>
    <span className="text-[11px] text-slate-500 mt-1">Preparing interactive charts and datasets</span>
  </div>
);

// Helper to synchronously resolve initial route state from URL to prevent post-mount re-render flicker
const getInitialRouteState = () => {
  if (typeof window === 'undefined') {
    return {
      tab: 'home' as const,
      industry: 'enterprise_tech' as keyof typeof INDUSTRY_PRESETS,
      legalRoute: null as LegalRoute | null,
    };
  }
  const path = window.location.pathname.toLowerCase();
  let legalRoute: LegalRoute | null = null;
  let tab: 'home' | 'dashboard' | 'excel-preview' | 'pivot' | 'transactions' | 'regions' | 'products' | 'customers' = 'home';
  let ind: keyof typeof INDUSTRY_PRESETS = 'enterprise_tech';

  if (path.includes('disclaimer')) { legalRoute = 'disclaimer'; }
  else if (path.includes('privacy')) { legalRoute = 'privacy'; }
  else if (path.includes('terms')) { legalRoute = 'terms'; }
  else if (path.includes('refund')) { legalRoute = 'refund'; }
  else if (path.includes('contact')) { legalRoute = 'contact'; }
  else if (path.includes('about')) { legalRoute = 'about'; }

  if (path.includes('sales-dashboard')) {
    tab = 'dashboard';
    ind = 'enterprise_tech';
  } else if (path.includes('hr-dashboard')) {
    tab = 'dashboard';
    ind = 'human_resources';
  } else if (path.includes('financial-dashboard')) {
    tab = 'dashboard';
    ind = 'finance_wealth';
  } else if (path.includes('kpi-dashboard') || path.includes('excel-dashboard-examples')) {
    tab = 'dashboard';
  } else if (path.includes('mis-report-generator') || path.includes('excel-dashboard-generator')) {
    tab = 'excel-preview';
  }

  return { tab, industry: ind, legalRoute };
};

export default function App() {
  const initialRoute = useMemo(getInitialRouteState, []);

  // Dataset Configuration State
  const [config, setConfig] = useState<DatasetConfig>(() => {
    const preset = INDUSTRY_PRESETS[initialRoute.industry];
    return {
      companyName: preset?.companyDefault || 'Nexus Enterprise Systems Inc.',
      reportTitle: 'FY2024-2025 Global Sales Performance & Executive Dashboard',
      industry: initialRoute.industry,
      recordCount: 1000,
      currency: 'USD',
      currencySymbol: '$',
      includeChartsInExcel: true,
      useLiveExcelFormulas: true,
    };
  });

  // Active Worksheet View Tab
  const [activeTab, setActiveTab] = useState<
    'home' | 'dashboard' | 'excel-preview' | 'pivot' | 'transactions' | 'regions' | 'products' | 'customers'
  >(initialRoute.tab);

  // Randomization Seed offset to allow "Refresh Data"
  const [seedOffset, setSeedOffset] = useState<number>(0);

  // Modals state
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [activeLegalRoute, setActiveLegalRoute] = useState<LegalRoute | null>(initialRoute.legalRoute);
  const [isProUser, setIsProUser] = useState<boolean>(false);
  const [lastDownloadedFilename, setLastDownloadedFilename] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleNavigateToLegal = useCallback((route: LegalRoute) => {
    const pathMap: Record<LegalRoute, string> = {
      privacy: '/privacy',
      terms: '/terms',
      disclaimer: '/disclaimer',
      about: '/about',
      contact: '/contact',
      refund: '/refund-policy',
    };
    const targetPath = pathMap[route] || `/${route}`;
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    setActiveLegalRoute(route);
    trackPageView(targetPath, `Legal: ${route}`);
  }, []);

  const handleBackToApp = useCallback(() => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
    setActiveLegalRoute(null);
    document.title = 'Free Excel Dashboard Generator | Automated KPI Reports';
    trackPageView('/', 'Home / Generator');
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('disclaimer')) {
        setActiveLegalRoute('disclaimer');
      } else if (path.includes('privacy')) {
        setActiveLegalRoute('privacy');
      } else if (path.includes('terms')) {
        setActiveLegalRoute('terms');
      } else if (path.includes('refund')) {
        setActiveLegalRoute('refund');
      } else if (path.includes('contact')) {
        setActiveLegalRoute('contact');
      } else if (path.includes('about')) {
        setActiveLegalRoute('about');
      } else {
        setActiveLegalRoute(null);
        document.title = 'Free Excel Dashboard Generator | Automated KPI Reports';
        if (path.includes('sales-dashboard') || path.includes('hr-dashboard') || path.includes('financial-dashboard') || path.includes('kpi-dashboard')) {
          setActiveTab('dashboard');
        } else if (path.includes('mis-report-generator') || path.includes('excel-dashboard-generator')) {
          setActiveTab('excel-preview');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('reset=1')) {
      resetProLicense();
    }
    const syncLicenseStatus = () => {
      setIsProUser(isProUnlocked());
    };
    syncLicenseStatus();
    window.addEventListener(PRO_LICENSE_EVENT, syncLicenseStatus);
    window.addEventListener('storage', syncLicenseStatus);

    return () => {
      window.removeEventListener(PRO_LICENSE_EVENT, syncLicenseStatus);
      window.removeEventListener('storage', syncLicenseStatus);
    };
  }, []);

  useEffect(() => {
    trackPageView('/' + activeTab, 'Tab: ' + activeTab);
  }, [activeTab]);

  // Custom Uploaded Dataset state
  const [customImportResult, setCustomImportResult] = useState<ImportResult | null>(null);

  // Desktop sidebar toggle visibility state (Hide / Show Sidebar)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

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

  // Handle Download Excel with dynamic chunk import to keep initial bundle tiny
  const handleDownloadExcel = useCallback(async () => {
    try {
      setIsDownloading(true);
      // Yield to browser event loop to flush DOM repaint and immediately display spinner
      await new Promise((resolve) => setTimeout(resolve, 60));

      let blob: Blob;
      let filename: string;

      // Completely lock and password-protect the downloaded workbook
      const shouldBeUnprotected = false;

      const { exportToProfessionalExcel } = await import('./utils/excelExporter');
      const res = await exportToProfessionalExcel(
        dataset,
        dataset.config || config,
        { unprotected: shouldBeUnprotected }
      );
      blob = res.blob;
      filename = res.filename;

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      trackEvent('download_excel_success', {
        filename,
        industry: config.industry,
        recordCount: config.recordCount,
        isCustom: !!customImportResult,
      });

      // Confetti celebration
      confetti({
        particleCount: shouldBeUnprotected ? 130 : 90,
        spread: 75,
        origin: { y: 0.65 },
        colors: shouldBeUnprotected
          ? ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#38BDF8']
          : ['#10B981', '#0284C7', '#6366F1', '#F59E0B'],
      });

      setLastDownloadedFilename(filename);
      setIsSuccessOpen(true);

      if (shouldBeUnprotected) {
        consumeDownloadCredit();
        setIsProUser(isProUnlocked());
      }
    } catch (error) {
      console.error('Failed to export Excel file:', error);
      alert('Could not compile Excel file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [dataset, config, customImportResult, analysisSelection, isProUser]);

  const handleRegenerateData = () => {
    if (customImportResult) {
      return;
    }
    trackEvent('regenerate_sample_data', { industry: config.industry });
    setSeedOffset((prev) => (prev + 1) % 100);
  };

  const handleSaveConfig = (newConfig: DatasetConfig) => {
    trackEvent('customize_dashboard_config', { industry: newConfig.industry, records: newConfig.recordCount });
    setCustomImportResult(null);
    setConfig(newConfig);
    setActiveTab('dashboard');
  };

  const handleImportComplete = (result: ImportResult) => {
    trackEvent('upload_dataset_success', {
      fileName: result.summary.fileName,
      recordCount: result.summary.rowCount || result.dataset.transactions.length,
    });
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

  const handleResetToSample = () => {
    setCustomImportResult(null);
    setConfig({
      companyName: 'Nexus Enterprise Systems Inc.',
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
    <div className={`premium-workspace min-h-screen flex flex-col font-sans ${isSidebarVisible ? '' : 'sidebar-hidden'}`}>
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
        isSidebarVisible={isSidebarVisible}
        onToggleSidebar={() => setIsSidebarVisible((prev) => !prev)}
        activeLegalRoute={activeLegalRoute}
        onNavigateLegal={handleNavigateToLegal}
        onBackToApp={handleBackToApp}
      />

      {/* Main Content Area */}
      <main id="main-content" className={`workspace-main space-y-7 ${activeTab === 'excel-preview' ? 'excel-preview-main' : ''}`}>
        {activeLegalRoute ? (
          <LegalPage
            currentRoute={activeLegalRoute}
            onNavigate={handleNavigateToLegal}
            onBackToApp={handleBackToApp}
          />
        ) : activeTab === 'home' ? (
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
          <Suspense fallback={<WorkspaceLoader />}>
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
                    <LayoutTemplate size={14} />
                    Ready Templates
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

            {activeTab === 'excel-preview' ? (
              <ExcelLiveViewer
                key={(customImportResult ? customImportResult.summary.fileName : config.industry) + seedOffset}
                data={dataset}
                config={dataset.config || config}
                onDownloadExcel={handleDownloadExcel}
                isDownloading={isDownloading}
              />
            ) : activeTab === 'dashboard' ? (
              <IndustryDashboard
                key={(customImportResult ? customImportResult.summary.fileName : config.industry) + seedOffset}
                data={dataset}
                onRecords={() => setActiveTab('transactions')}
              />
            ) : (
              <AdaptiveDashboard
                key={(customImportResult ? customImportResult.summary.fileName : config.industry) + seedOffset}
                data={dataset}
                selection={analysisSelection}
                onChange={setAnalysisSelection}
                view={activeTab}
              />
            )}
          </Suspense>
        )}
      </main>

      {/* Comprehensive Modern Footer */}
      <Footer
        onSelectTab={setActiveTab}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onNavigateLegal={handleNavigateToLegal}
        onOpenLegal={handleNavigateToLegal}
      />

      {/* Lazy-Loaded Modals */}
      <Suspense fallback={null}>
        {isCustomizerOpen && (
          <CustomizerModal
            key={config.industry + config.companyName + isCustomizerOpen}
            isOpen={isCustomizerOpen}
            onClose={() => setIsCustomizerOpen(false)}
            config={config}
            onSaveConfig={handleSaveConfig}
          />
        )}

        {isUploadModalOpen && (
          <DataUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            baseConfig={config}
            onImportComplete={handleImportComplete}
          />
        )}

        {isSuccessOpen && (
          <DownloadSuccessModal
            isOpen={isSuccessOpen}
            onClose={() => setIsSuccessOpen(false)}
            filename={lastDownloadedFilename}
            rowCount={config.recordCount}
            onReDownload={handleDownloadExcel}
            sourceBased={!!customImportResult}
            isProUnlocked={true}
          />
        )}
      </Suspense>
    </div>
  );
}
