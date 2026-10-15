import React, { useState } from 'react';
import {
  Home,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Download,
  FileSpreadsheet,
  LayoutDashboard,
  Layers3,
  RefreshCw,
  Settings2,
  Table2,
  TrendingUp,
  Upload,
  CircleCheck,
  Globe,
  Menu,
  X,
} from 'lucide-react';
import { DatasetConfig } from '../types/dataset';
import { ExcelLogo } from './ExcelLogo';

interface NavbarProps {
  config: DatasetConfig;
  onOpenCustomizer: () => void;
  onOpenUploadModal: () => void;
  onDownloadExcel: () => void;
  isDownloading: boolean;
  onRegenerateData: () => void;
  activeTab: 'home' | 'dashboard' | 'excel-preview' | 'pivot' | 'transactions' | 'regions' | 'products' | 'customers';
  setActiveTab: (tab: NavbarProps['activeTab']) => void;
  isCustomDataActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  onOpenCustomizer,
  onOpenUploadModal,
  onDownloadExcel,
  isDownloading,
  onRegenerateData,
  activeTab,
  setActiveTab,
  isCustomDataActive,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const views: { id: NavbarProps['activeTab']; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'home', label: 'Home Page', icon: Home },
    { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'excel-preview', label: 'Live Excel Workbook', icon: FileSpreadsheet },
    { id: 'pivot', label: 'Grouped Pivot Analysis', icon: Layers3 },
    { id: 'transactions', label: 'Source Records', icon: Table2 },
    { id: 'regions', label: 'Time & Regional Trends', icon: TrendingUp },
    { id: 'products', label: 'Category Breakdowns', icon: BarChart3 },
    { id: 'customers', label: 'Data Verification', icon: CircleCheck },
  ];

  const handleSelectView = (id: NavbarProps['activeTab']) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Persistent Sidebar (Desktop) / Slide-Out Drawer (Mobile & Tablet) */}
      <aside
        className={`workspace-sidebar ${isMobileMenuOpen ? 'mobile-drawer-open' : ''}`}
        aria-label="Application sidebar"
      >
        {/* Top Header inside Sidebar: Logo & Close Button on Mobile */}
        <div className="flex items-center justify-between w-full mb-1">
          <button
            onClick={() => handleSelectView('home')}
            className="brand-lockup cursor-pointer text-left flex-1"
            title="excel.dattasable.com — Home"
          >
            <ExcelLogo size={30} tagline="excel.dattasable.com" />
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-[#203a33] transition-colors"
            aria-label="Close sidebar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Workspace Identity Pill */}
        <div className="sidebar-workspace">
          <span className="workspace-avatar font-bold text-emerald-400">DS</span>
          <div>
            <strong>excel.dattasable.com</strong>
            <small>Executive BI Workspace</small>
          </div>
          <ChevronRight size={13} className="text-emerald-500/70 shrink-0" />
        </div>

        {/* Navigation Section */}
        <div className="sidebar-label">WORKSPACE VIEWS</div>
        <nav aria-label="Workspace views" className="sidebar-nav">
          {views.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              aria-current={activeTab === id ? 'page' : undefined}
              className={activeTab === id ? 'nav-item active' : 'nav-item'}
              onClick={() => handleSelectView(id)}
              title={label}
            >
              <Icon size={15} />
              <span>{label}</span>
              {activeTab === id && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>

        {/* Tools Section */}
        <div className="sidebar-label sidebar-tools-label">REPORT TOOLS</div>
        <button
          className="nav-item"
          onClick={() => {
            onOpenUploadModal();
            setIsMobileMenuOpen(false);
          }}
          title="Import your CSV or Excel dataset"
        >
          <Upload size={15} />
          <span>Import CSV / Excel</span>
          <ArrowUpRight size={12} className="ml-auto opacity-60" />
        </button>
        <button
          className="nav-item"
          onClick={() => {
            onOpenCustomizer();
            setIsMobileMenuOpen(false);
          }}
          title="Customize company, report title and industry"
        >
          <Settings2 size={15} />
          <span>Report Configuration</span>
        </button>

        {/* Compact Bottom Author Lockup */}
        <div className="sidebar-bottom">
          <a
            href="https://dattasable.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-signature hover:bg-[#1e3630] transition-colors rounded-lg p-1.5 flex items-center gap-2"
            title="Visit Datta Sable's portfolio"
          >
            <span className="workspace-avatar text-emerald-300 font-semibold">DS</span>
            <div className="min-w-0 flex-1">
              <strong>Datta Sable</strong>
              <small className="flex items-center gap-1 text-[9.5px]">
                BI Expert &amp; Engineer <ArrowUpRight size={10} className="opacity-70" />
              </small>
            </div>
          </a>
        </div>
      </aside>

      {/* Workspace Sticky Topbar Header */}
      <header className="workspace-topbar" role="banner">
        <div className="breadcrumb min-w-0 flex-1">
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center shrink-0"
            aria-label="Toggle navigation menu"
            title="Open Menu"
          >
            <Menu size={18} />
          </button>

          <button
            onClick={() => handleSelectView('home')}
            className="hover:text-emerald-700 transition-colors font-mono font-medium text-left truncate max-w-[120px] sm:max-w-none"
          >
            excel.dattasable.com
          </button>
          <ChevronRight size={13} className="shrink-0 text-slate-400" />
          <strong className="truncate">{views.find((v) => v.id === activeTab)?.label}</strong>
        </div>

        <div className="topbar-actions shrink-0">
          {/* Main Portfolio Link */}
          <a
            href="https://dattasable.com/dashboards"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 rounded-full font-medium transition-colors"
            title="Explore Datta Sable's Business Intelligence Dashboards Portfolio"
          >
            <Globe size={13} />
            <span>dattasable.com</span>
            <ArrowUpRight size={11} />
          </a>

          <span className="local-status hidden xs:flex">
            <i />
            {isCustomDataActive ? 'Custom Data' : 'Sample Data'}
          </span>

          <button
            className="icon-button"
            aria-label="Report Settings"
            onClick={onOpenCustomizer}
            title="Configure Report Settings"
          >
            <Settings2 size={17} />
          </button>
        </div>
      </header>

      {/* Action Toolbar */}
      <div className="workspace-toolbar">
        <div className="dataset-breadcrumb min-w-0 flex-1">
          <FileSpreadsheet size={16} className="text-emerald-700 shrink-0" />
          <span className="font-semibold text-slate-800 truncate">{config.companyName}</span>
          <span className="dataset-mode hidden sm:inline-block">
            {isCustomDataActive ? 'Imported Dataset' : 'Automated Model'}
          </span>
        </div>

        <div className="toolbar-actions flex-wrap">
          {activeTab !== 'home' && (
            <button
              className="text-button"
              onClick={() => handleSelectView('home')}
              title="Return to Landing Page"
            >
              <Home size={14} />
              <span className="hidden xs:inline">Home Guide</span>
            </button>
          )}

          {!isCustomDataActive && (
            <button
              className="text-button hidden sm:inline-flex"
              onClick={onRegenerateData}
              title="Generate new seed random transactions"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          )}
          <button className="secondary-button" onClick={onOpenUploadModal} title="Import CSV or Excel files">
            <Upload size={14} />
            <span>Import</span>
          </button>
          <button
            className="primary-button"
            onClick={onDownloadExcel}
            disabled={isDownloading}
            title="Compile & Download multi-sheet .xlsx workbook"
          >
            <Download size={14} />
            <span>{isDownloading ? 'Compiling…' : 'Export .XLSX'}</span>
          </button>
        </div>
      </div>
    </>
  );
};
