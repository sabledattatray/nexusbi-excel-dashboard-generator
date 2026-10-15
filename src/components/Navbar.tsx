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
  PanelLeftClose,
  PanelLeftOpen,
  LayoutTemplate,
  Cpu,
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
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
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
  isSidebarVisible,
  onToggleSidebar,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (window.innerWidth <= 1024) {
          setIsMobileMenuOpen((prev) => !prev);
        } else {
          onToggleSidebar();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleSidebar]);

  interface NavItemDef {
    id: NavbarProps['activeTab'];
    label: string;
    icon: typeof LayoutDashboard;
    badge?: string;
  }

  interface NavGroupDef {
    title: string;
    items: NavItemDef[];
  }

  const navGroups: NavGroupDef[] = [
    {
      title: 'Core Dashboards',
      items: [
        { id: 'home', label: 'Home Page', icon: Home },
        { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard, badge: 'Live' },
        { id: 'excel-preview', label: 'Live Excel Workbook', icon: FileSpreadsheet, badge: '.XLSX' },
      ],
    },
    {
      title: 'Analytics & Records',
      items: [
        { id: 'pivot', label: 'Grouped Pivot Analysis', icon: Layers3, badge: 'Pivot' },
        {
          id: 'transactions',
          label: 'Source Records',
          icon: Table2,
          badge: config.recordCount ? (config.recordCount >= 1000 ? `${(config.recordCount / 1000).toFixed(0)}k` : `${config.recordCount}`) : '1k',
        },
        { id: 'regions', label: 'Time & Regional Trends', icon: TrendingUp },
        { id: 'products', label: 'Category Breakdowns', icon: BarChart3 },
        { id: 'customers', label: 'Data Verification', icon: CircleCheck, badge: 'Audit' },
      ],
    },
  ];

  const views = navGroups.flatMap((group) => group.items);

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
        {/* Top Header inside Sidebar: Logo & Hide Button */}
        <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-[#243e37]">
          <button
            onClick={() => handleSelectView('home')}
            className="brand-lockup cursor-pointer text-left flex-1"
            title="excel.dattasable.com — Home"
          >
            <ExcelLogo size={28} tagline="excel.dattasable.com" />
          </button>

          {/* Hide Sidebar button inside sidebar */}
          <button
            onClick={() => {
              if (window.innerWidth <= 1024) {
                setIsMobileMenuOpen(false);
              } else {
                onToggleSidebar();
              }
            }}
            className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-[#203a33] active:scale-95 transition-all ml-1 shrink-0"
            aria-label="Hide sidebar"
            title="Hide sidebar (Ctrl+B)"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav aria-label="Workspace views" className="sidebar-nav">
          {navGroups.map((group, groupIdx) => (
            <React.Fragment key={group.title}>
              {groupIdx > 0 && <div className="sidebar-divider" role="separator" />}
              <div className="sidebar-label">
                <span className="sidebar-label-dot" />
                <span>{group.title}</span>
              </div>
              {group.items.map(({ id, label, icon: Icon, badge }) => (
                <button
                  key={id}
                  aria-current={activeTab === id ? 'page' : undefined}
                  className={activeTab === id ? 'nav-item active' : 'nav-item'}
                  onClick={() => handleSelectView(id)}
                  title={label}
                >
                  <Icon size={14.5} />
                  <span className="truncate">{label}</span>
                  {badge && <span className="nav-badge">{badge}</span>}
                  {activeTab === id && <span className="nav-active-dot" />}
                </button>
              ))}
            </React.Fragment>
          ))}

          {/* Tools Section */}
          <div className="sidebar-divider" role="separator" />
          <div className="sidebar-label sidebar-tools-label">
            <span className="sidebar-label-dot" />
            <span>Report Tools</span>
          </div>
          <button
            className="nav-item group"
            onClick={() => {
              onOpenUploadModal();
              setIsMobileMenuOpen(false);
            }}
            title="Import your CSV or Excel dataset"
          >
            <Upload size={14.5} />
            <span className="truncate">Import CSV / Excel</span>
            <span className="nav-badge">Upload</span>
            <ArrowUpRight size={11} className="ml-1 opacity-60 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            className="nav-item group"
            onClick={() => {
              onOpenCustomizer();
              setIsMobileMenuOpen(false);
            }}
            title="Browse 12 ready-to-use industry dashboard templates"
          >
            <LayoutTemplate size={14.5} />
            <span className="truncate">Ready Templates</span>
            <span className="nav-badge">12 Ready</span>
          </button>
          <a
            href="https://fabric.dattasable.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item group"
            title="Fabric Master — Microsoft Fabric Architecture, Capacity Estimator & FinOps Platform"
          >
            <Cpu size={14.5} className="text-sky-400 group-hover:text-sky-300" />
            <span className="truncate">Fabric Master</span>
            <span className="nav-badge text-sky-300 border-sky-500/30 bg-sky-950/40">Fabric</span>
            <ArrowUpRight size={11} className="ml-1 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
        </nav>

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
        <div className="breadcrumb min-w-0 flex-1 flex items-center gap-2 sm:gap-2.5">
          {/* Show Sidebar Button (only visible when sidebar is collapsed on desktop, or on mobile) */}
          <button
            onClick={() => {
              if (window.innerWidth <= 1024) {
                setIsMobileMenuOpen(!isMobileMenuOpen);
              } else {
                onToggleSidebar();
              }
            }}
            className={`p-1.5 -ml-1 rounded-lg text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 active:scale-95 transition-all items-center justify-center shrink-0 border border-slate-200/80 hover:border-emerald-300 shadow-xs ${
              isSidebarVisible ? 'hidden max-lg:flex' : 'flex'
            }`}
            aria-label="Show sidebar"
            title="Show sidebar (Ctrl+B)"
          >
            <PanelLeftOpen size={17} className="text-emerald-700 font-semibold" />
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
          {/* Fabric Master Subdomain Link */}
          <a
            href="https://fabric.dattasable.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 text-xs text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 px-2.5 py-1 rounded-full font-medium transition-colors"
            title="Explore Fabric Master — Microsoft Fabric Architecture & FinOps Platform"
          >
            <Cpu size={13} className="text-sky-600" />
            <span>fabric.dattasable.com</span>
            <ArrowUpRight size={11} className="text-sky-500" />
          </a>

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
            aria-label="Ready Templates"
            onClick={onOpenCustomizer}
            title="Browse Ready Templates"
          >
            <LayoutTemplate size={17} />
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
            title="Download full 6-sheet Excel dashboard workbook with native charts"
          >
            <Download size={14} />
            <span className="hidden sm:inline">
              {isDownloading ? 'Compiling Dashboard…' : 'Download Excel Dashboard'}
            </span>
            <span className="sm:hidden">
              {isDownloading ? 'Compiling…' : 'Download Excel'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};
