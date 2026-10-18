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
  Crown,
  Unlock,
  ShieldCheck,
  SlidersHorizontal,
  Database,
  Lock,
  FileText,
  AlertTriangle,
  User,
  Mail,
  RotateCcw,
  Printer,
  ArrowLeft,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import { DatasetConfig } from '../types/dataset';
import { ExcelLogo } from './ExcelLogo';

export type LegalRoute = 'about' | 'privacy' | 'terms' | 'disclaimer' | 'refund' | 'contact';

interface NavbarProps {
  config: DatasetConfig;
  onOpenCustomizer: () => void;
  onOpenUploadModal: () => void;
  onDownloadExcel: () => void;
  isDownloading: boolean;
  onRegenerateData: () => void;
  activeTab: 'home' | 'dashboard' | 'excel-preview' | 'pivot' | 'transactions' | 'regions' | 'products' | 'customers' | 'amazon-sales';
  setActiveTab: (tab: NavbarProps['activeTab']) => void;
  isCustomDataActive?: boolean;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
  isProUnlocked?: boolean;
  onOpenUnlockModal?: () => void;
  activeLegalRoute?: LegalRoute | null;
  onNavigateLegal?: (route: LegalRoute) => void;
  onBackToApp?: () => void;
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
  isProUnlocked = false,
  onOpenUnlockModal,
  activeLegalRoute,
  onNavigateLegal,
  onBackToApp,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Single active accordion: null by default (closed at initial load & refresh)
  // At most ONE submenu can be open at any time; opening any submenu closes all others.
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSectionId((prev) => (prev === id ? null : id));
  };

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
    id: NavbarProps['activeTab'] | string;
    label: string;
    icon: React.ElementType;
    badge?: string;
    isLegal?: boolean;
    legalRoute?: LegalRoute;
    path?: string;
  }

  interface NavGroupDef {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    colorTheme: 'emerald' | 'sky' | 'violet' | 'amber';
    items: NavItemDef[];
  }

  const navGroups: NavGroupDef[] = [
    {
      id: 'core',
      title: 'Core Dashboards',
      subtitle: 'Executive & Live Workbooks',
      icon: LayoutDashboard,
      colorTheme: 'emerald',
      items: [
        { id: 'home', label: 'Home Page', icon: Home },
        { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard, badge: 'Live' },
        { id: 'amazon-sales', label: 'Amazon Sales Executive', icon: ShoppingBag, badge: 'New', path: '/amazon-sales-dashboard' },
        { id: 'excel-preview', label: 'Live Excel Workbook', icon: FileSpreadsheet, badge: '.XLSX' },
      ],
    },
    {
      id: 'analytics',
      title: 'Analytics & Records',
      subtitle: 'Pivots, Trends & Verification',
      icon: BarChart3,
      colorTheme: 'sky',
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
    {
      id: 'legal',
      title: 'Legal & Compliance',
      subtitle: 'Privacy, Terms & Grievance',
      icon: ShieldCheck,
      colorTheme: 'violet',
      items: [
        { id: 'privacy', label: 'Privacy Policy', icon: Lock, badge: 'Zero Cloud', isLegal: true, legalRoute: 'privacy', path: '/privacy' },
        { id: 'terms', label: 'Terms of Service', icon: FileText, isLegal: true, legalRoute: 'terms', path: '/terms' },
        { id: 'disclaimer', label: 'Disclaimer & Liability', icon: AlertTriangle, badge: 'Audit', isLegal: true, legalRoute: 'disclaimer', path: '/disclaimer' },
        { id: 'about', label: 'About Us & Creator', icon: User, isLegal: true, legalRoute: 'about', path: '/about' },
        { id: 'contact', label: 'Contact & Grievance', icon: Mail, isLegal: true, legalRoute: 'contact', path: '/contact' },
        { id: 'refund', label: 'Refund Policy', icon: RotateCcw, isLegal: true, legalRoute: 'refund', path: '/refund-policy' },
      ],
    },
  ];

  const views = navGroups.flatMap((group) => group.items);

  const handleItemClick = (item: NavItemDef) => {
    if (item.isLegal && item.legalRoute) {
      onNavigateLegal?.(item.legalRoute);
    } else if (item.id === 'amazon-sales') {
      onBackToApp?.();
      setActiveTab('amazon-sales');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/amazon-sales-dashboard');
      }
    } else {
      onBackToApp?.();
      setActiveTab(item.id as NavbarProps['activeTab']);
      if (typeof window !== 'undefined' && item.id === 'home') {
        window.history.pushState(null, '', '/');
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleSelectView = (id: NavbarProps['activeTab']) => {
    onBackToApp?.();
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
        <div className="flex items-center justify-between w-full mb-2 pb-2.5 border-b border-white/[0.08]">
          <button
            onClick={() => handleSelectView('home')}
            className="brand-lockup cursor-pointer text-left flex-1"
            title="excel.dattasable.com — Home"
          >
            <ExcelLogo size={28} tagline="EXECUTIVE BI STUDIO" />
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
            className="sidebar-toggle-btn ml-1 cursor-pointer"
            aria-label="Hide sidebar"
            title="Hide sidebar (Ctrl+B)"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        {/* Active Dataset / Model Context Glass Card */}
        <div className="sidebar-model-card group">
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[9.5px] font-bold tracking-wider uppercase text-emerald-400/90 font-mono truncate">
                {isCustomDataActive ? 'LOCAL DATASET' : 'SAMPLE TEMPLATE'}
              </span>
            </div>
            <button
              onClick={() => {
                onOpenCustomizer();
                setIsMobileMenuOpen(false);
              }}
              className="text-[10px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-white/[0.06] cursor-pointer"
              title="Change industry template / configuration"
            >
              <SlidersHorizontal size={11} />
              <span>Change</span>
            </button>
          </div>

          <div className="mt-1">
            <span className="sidebar-model-title" title={config.companyName}>
              {config.companyName}
            </span>
          </div>

          <div className="sidebar-model-meta">
            <span className="flex items-center gap-1 min-w-0">
              <Database size={11} className="text-emerald-400 shrink-0" />
              <span>{config.recordCount ? (config.recordCount >= 1000 ? `${(config.recordCount / 1000).toFixed(0)}k rows` : `${config.recordCount} rows`) : '1,000 rows'}</span>
            </span>
            <span className="text-white/20">•</span>
            <span className="truncate capitalize text-emerald-300">
              {isCustomDataActive ? 'Local CSV / Excel' : `${config.industry.replace(/_/g, ' ')} Demo`}
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav aria-label="Workspace views" className="sidebar-nav">
          {navGroups.map((group, groupIdx) => {
            const isOpen = openSectionId === group.id;
            const GroupIcon = group.icon;
            const hasActiveInside = group.items.some((item) =>
              item.isLegal
                ? activeLegalRoute === item.legalRoute
                : (!activeLegalRoute && activeTab === item.id)
            );
            return (
              <React.Fragment key={group.id}>
                {groupIdx > 0 && <div className="sidebar-divider" role="separator" />}
                <button
                  type="button"
                  onClick={() => toggleSection(group.id)}
                  className={`sidebar-accordion-btn group cursor-pointer ${
                    isOpen ? 'open' : ''
                  } ${hasActiveInside && !isOpen ? 'has-active' : ''}`}
                  aria-expanded={isOpen}
                  title={`${isOpen ? 'Collapse' : 'Expand'} ${group.title} Submenu (${group.items.length} items)`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`accordion-icon-box ${group.colorTheme}`}>
                      <GroupIcon size={14} />
                    </div>
                    <div className="flex flex-col min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="accordion-title">{group.title}</span>
                        {hasActiveInside && !isOpen && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"
                            title="Active page inside this submenu"
                          />
                        )}
                      </div>
                      <span className="accordion-subtitle">{group.subtitle}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    <span className="accordion-pill-badge">
                      <span className="font-semibold text-emerald-400">{group.items.length}</span>
                      <span>Submenu</span>
                      <ChevronDown
                        size={11}
                        className={`transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-emerald-400' : 'text-slate-400 group-hover:text-emerald-300'
                        }`}
                      />
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="sidebar-submenu-wrapper animate-in fade-in slide-in-from-top-1 duration-200">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = item.isLegal
                        ? activeLegalRoute === item.legalRoute
                        : (!activeLegalRoute && activeTab === item.id);
                      return (
                        <button
                          key={item.id}
                          aria-current={isActive ? 'page' : undefined}
                          className={`nav-item group cursor-pointer ${isActive ? 'active' : ''}`}
                          onClick={() => handleItemClick(item)}
                          title={item.label}
                        >
                          {isActive && <span className="nav-item-active-bar" />}
                          <div className="nav-item-icon-box">
                            <Icon size={14.5} />
                          </div>
                          <span className="truncate font-medium flex-1 min-w-0 text-left">{item.label}</span>
                          {item.badge && <span className="nav-badge">{item.badge}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Tools Section */}
          <div className="sidebar-divider" role="separator" />
          {(() => {
            const isToolsOpen = openSectionId === 'tools';
            return (
              <>
                <button
                  type="button"
                  onClick={() => toggleSection('tools')}
                  className={`sidebar-accordion-btn group cursor-pointer ${
                    isToolsOpen ? 'open' : ''
                  }`}
                  aria-expanded={isToolsOpen}
                  title={`${isToolsOpen ? 'Collapse' : 'Expand'} Studio Tools Submenu (3 tools)`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="accordion-icon-box amber">
                      <SlidersHorizontal size={14} />
                    </div>
                    <div className="flex flex-col min-w-0 text-left">
                      <span className="accordion-title">Studio Tools</span>
                      <span className="accordion-subtitle">Import, Templates &amp; Fabric</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    <span className="accordion-pill-badge">
                      <span className="font-semibold text-emerald-400">3</span>
                      <span>Submenu</span>
                      <ChevronDown
                        size={11}
                        className={`transition-transform duration-200 ${
                          isToolsOpen ? 'rotate-180 text-emerald-400' : 'text-slate-400 group-hover:text-emerald-300'
                        }`}
                      />
                    </span>
                  </div>
                </button>

                {isToolsOpen && (
                  <div className="sidebar-submenu-wrapper animate-in fade-in slide-in-from-top-1 duration-200">
                    <button
                      className="sidebar-tool-card group cursor-pointer"
                      onClick={() => {
                        onOpenUploadModal();
                        setIsMobileMenuOpen(false);
                      }}
                      title="Import your CSV or Excel dataset"
                    >
                      <div className="nav-item-icon-box group-hover:bg-emerald-500/10 group-hover:border-emerald-500/25 group-hover:text-emerald-300">
                        <Upload size={14} />
                      </div>
                      <div className="flex flex-col min-w-0 text-left flex-1">
                        <span className="text-slate-200 group-hover:text-white font-medium text-[12.5px] truncate flex items-center justify-between">
                          Import Dataset
                          <ArrowUpRight size={12} className="opacity-40 group-hover:opacity-100 text-emerald-400 transition-opacity" />
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">CSV, XLSX, XLS</span>
                      </div>
                    </button>

                    <button
                      className="sidebar-tool-card group cursor-pointer"
                      onClick={() => {
                        onOpenCustomizer();
                        setIsMobileMenuOpen(false);
                      }}
                      title="Browse 32 ready-to-use industry dashboard templates"
                    >
                      <div className="nav-item-icon-box group-hover:bg-emerald-500/10 group-hover:border-emerald-500/25 group-hover:text-emerald-300">
                        <LayoutTemplate size={14} />
                      </div>
                      <div className="flex flex-col min-w-0 text-left flex-1">
                        <span className="text-slate-200 group-hover:text-white font-medium text-[12.5px] truncate flex items-center justify-between">
                          32 BI Templates
                          <span className="nav-badge">Ready</span>
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">Sales, Finance, SaaS…</span>
                      </div>
                    </button>

                    <a
                      href="https://fabric.dattasable.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sidebar-tool-card group border-sky-500/20 hover:border-sky-500/40 hover:bg-sky-950/20"
                      title="Fabric Master — Microsoft Fabric Architecture, Capacity Estimator & FinOps Platform"
                    >
                      <div className="nav-item-icon-box text-sky-400 group-hover:bg-sky-500/20 group-hover:border-sky-500/30 group-hover:text-sky-300">
                        <Cpu size={14} />
                      </div>
                      <div className="flex flex-col min-w-0 text-left flex-1">
                        <span className="text-slate-200 group-hover:text-white font-medium text-[12.5px] truncate flex items-center justify-between">
                          Fabric Master
                          <span className="nav-badge text-sky-300 border-sky-500/30 bg-sky-950/50">FinOps</span>
                        </span>
                        <span className="text-[10px] text-sky-400/80 truncate">Capacity &amp; Arch</span>
                      </div>
                    </a>

                    {/* Privacy & Air-Gapped Trust Box */}
                    <div className="sidebar-trust-box">
                      <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                      <div className="flex flex-col min-w-0 text-left">
                        <span className="text-[10.5px] font-semibold text-emerald-200 leading-tight">100% In-Browser Privacy</span>
                        <span className="text-[9px] text-slate-400 leading-tight">Zero cloud data retention</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </nav>

        {/* Ultra-Premium Profile & Keyboard Shortcut Lockup */}
        <div className="sidebar-bottom">
          <a
            href="https://dattasable.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-signature group"
            title="Visit Datta Sable's portfolio"
          >
            <span className="workspace-avatar overflow-hidden rounded-full border border-emerald-500/50 p-0 shadow-sm">
              <img
                src="/dattasable.webp"
                alt="Datta Sable"
                width={30}
                height={30}
                loading="lazy"
                className="w-full h-full object-cover object-top rounded-full"
              />
            </span>
            <div className="min-w-0 flex-1">
              <strong className="group-hover:text-emerald-300 transition-colors flex items-center gap-1 text-[11.5px]">
                Datta Sable <ArrowUpRight size={11} className="opacity-50 group-hover:opacity-100 transition-opacity" />
              </strong>
              <small className="text-[9.5px] text-slate-400 block truncate">
                Principal BI Architect
              </small>
            </div>
          </a>

          <div className="flex items-center justify-between px-1.5 py-0.5 text-[9.5px] text-slate-500 font-mono">
            <span>Sidebar Toggle</span>
            <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] text-slate-400 shadow-xs">
              Ctrl + B
            </kbd>
          </div>
        </div>
      </aside>

      {/* Sticky Top Bar for All Devices */}
      <div className="top-announcement-banner" role="region" aria-label="Announcement">
        <span>✨ <strong>Free Excel &amp; CSV Dashboard Generator</strong> — Instant Automated KPI Reports</span>
        <span className="banner-dot">•</span>
        <span className="banner-tag">100% In-Browser &amp; Private</span>
      </div>

      {/* Workspace Topbar Header */}
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

          {activeLegalRoute ? (
            <>
              <button
                onClick={() => {
                  onBackToApp?.();
                  setIsMobileMenuOpen(false);
                }}
                className="text-slate-800 hover:text-emerald-700 transition-colors font-mono font-semibold text-left truncate max-w-[120px] sm:max-w-none"
                aria-label="excel.dattasable.com Home"
              >
                excel.dattasable.com
              </button>
              <ChevronRight size={13} className="shrink-0 text-slate-500" />
              <span className="text-slate-500 hidden sm:inline">Legal &amp; Trust</span>
              <ChevronRight size={13} className="shrink-0 text-slate-500 hidden sm:inline" />
              <strong className="truncate text-slate-900 font-semibold">
                {activeLegalRoute === 'privacy'
                  ? 'Privacy Policy'
                  : activeLegalRoute === 'terms'
                  ? 'Terms of Service'
                  : activeLegalRoute === 'disclaimer'
                  ? 'Disclaimer & Liability'
                  : activeLegalRoute === 'about'
                  ? 'About Us & Creator'
                  : activeLegalRoute === 'contact'
                  ? 'Contact & Grievance'
                  : 'Refund Policy'}
              </strong>
            </>
          ) : (
            <>
              <button
                onClick={() => handleSelectView('home')}
                className="text-slate-800 hover:text-emerald-700 transition-colors font-mono font-semibold text-left truncate max-w-[120px] sm:max-w-none"
                aria-label="excel.dattasable.com Home"
              >
                excel.dattasable.com
              </button>
              <ChevronRight size={13} className="shrink-0 text-slate-500" />
              <strong className="truncate text-slate-900 font-semibold">{views.find((v) => v.id === activeTab)?.label}</strong>
            </>
          )}
        </div>

        <div className="topbar-actions shrink-0">
          {/* Fabric Master Subdomain Link */}
          <a
            href="https://fabric.dattasable.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 text-xs text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-300 px-2.5 py-1 rounded-full font-medium transition-colors"
            title="Explore Fabric Master — Microsoft Fabric Architecture & FinOps Platform"
            aria-label="Explore Fabric Master Platform"
          >
            <Cpu size={13} className="text-sky-700" />
            <span>fabric.dattasable.com</span>
            <ArrowUpRight size={11} className="text-sky-600" />
          </a>

          {/* Portfolio Link */}
          <a
            href="https://dattasable.com/dashboards"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full font-medium transition-colors"
            title="Explore Datta Sable's Business Intelligence Dashboards Portfolio"
            aria-label="Datta Sable Business Intelligence Dashboards Portfolio"
          >
            <Globe size={13} className="text-emerald-800" />
            <span>dattasable.com/dashboards</span>
            <ArrowUpRight size={11} className="text-emerald-700" />
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
        {activeLegalRoute ? (
          <>
            <div className="dataset-breadcrumb min-w-0 flex-1">
              <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
              <span className="font-semibold text-slate-800 truncate">
                Legal &amp; Trust Center ·{' '}
                {activeLegalRoute === 'privacy'
                  ? 'Privacy Policy'
                  : activeLegalRoute === 'terms'
                  ? 'Terms of Service'
                  : activeLegalRoute === 'disclaimer'
                  ? 'Disclaimer & Liability'
                  : activeLegalRoute === 'about'
                  ? 'About Us & Creator'
                  : activeLegalRoute === 'contact'
                  ? 'Contact & Grievance'
                  : 'Refund Policy'}
              </span>
              <span className="dataset-mode hidden sm:inline-block">
                Official Compliance Document
              </span>
            </div>

            <div className="toolbar-actions flex-wrap">
              <button
                className="text-button"
                onClick={() => window.print()}
                title="Print this official document"
              >
                <Printer size={14} />
                <span className="hidden xs:inline">Print Document</span>
              </button>

              <button
                className="primary-button"
                onClick={() => {
                  onBackToApp?.();
                  setIsMobileMenuOpen(false);
                }}
                title="Return to Executive Dashboard Generator"
              >
                <ArrowLeft size={14} />
                <span>Return to Dashboards</span>
              </button>
            </div>
          </>
        ) : (
          <>
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
                title="Download Executive Excel Dashboard (.xlsx)"
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
          </>
        )}
      </div>
    </>
  );
};
