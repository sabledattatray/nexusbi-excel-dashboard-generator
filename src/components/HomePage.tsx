import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Layers,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap,
  BarChart3,
  ArrowRight,
  Upload,
  Download,
  LayoutDashboard,
  Building2,
  HeartPulse,
  ShoppingBag,
  Landmark,
  Factory,
  Table,
  Check,
  Cpu,
  Crown,
  Unlock,
  Users,
} from 'lucide-react';
import { ExcelLogo } from './ExcelLogo';
import { IndustryType } from '../types/dataset';

interface HomePageProps {
  onOpenDashboard: () => void;
  onOpenExcelView: () => void;
  onOpenUploadModal: () => void;
  onDownloadExcel: () => void;
  isDownloading: boolean;
  onSelectIndustry: (industry: IndustryType) => void;
  currentIndustry?: IndustryType;
  isProUnlocked?: boolean;
  onOpenUnlockModal?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenDashboard,
  onOpenExcelView,
  onOpenUploadModal,
  onDownloadExcel,
  isDownloading,
  onSelectIndustry,
  currentIndustry = 'enterprise_tech',
  isProUnlocked = false,
  onOpenUnlockModal,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const industries: {
    id: IndustryType;
    name: string;
    icon: typeof Building2;
    tagline: string;
    metric: string;
  }[] = [
    {
      id: 'enterprise_tech',
      name: 'Sales and Revenue Dashboards',
      icon: Building2,
      tagline: 'ARR, Net Revenue Retention, Subscription Cohorts, ACV',
      metric: '$9.84M ARR · 114% NRR',
    },
    {
      id: 'human_resources',
      name: 'HR and Workforce Analytics',
      icon: Users,
      tagline: 'Headcount, Attrition Rate, Average Salary, Diversity, Engagement Score',
      metric: '480 FTE · 96.2% Retention',
    },
    {
      id: 'finance_wealth',
      name: 'Financial Performance Reports',
      icon: Landmark,
      tagline: 'Loan Originations, Net Interest Margin, Default Rates, AUM',
      metric: '$42.5M Originations · 3.8% NIM',
    },
    {
      id: 'industrial_manufacturing',
      name: 'Inventory and Operations Dashboards',
      icon: Factory,
      tagline: 'Units Produced, OEE Efficiency, Scrap Rate, Lead Time',
      metric: '124K Units · 88.6% OEE',
    },
    {
      id: 'ecommerce_retail',
      name: 'Retail & E-Commerce Dashboards',
      icon: ShoppingBag,
      tagline: 'GMV, Average Order Value, Return Rate, Repeat Customers',
      metric: '$6.72M GMV · $142 AOV',
    },
    {
      id: 'healthcare_pharma',
      name: 'Healthcare & Patient Analytics',
      icon: HeartPulse,
      tagline: 'Patient Encounters, Treatment Value, Clinic Capacity, Bed Days',
      metric: '18,420 Patients · 94.2% Capacity',
    },
  ];

  const features = [
    {
      icon: BarChart3,
      title: 'Excel Charts and Data Visualization',
      desc: 'Automatic generation of native Excel chart objects including clustered columns, stacked bars, trendlines, and pie breakdowns.',
      tag: 'Native Excel Visuals',
    },
    {
      icon: Zap,
      title: 'Live Native Excel Formulas',
      desc: 'Formulas like SUMIFS, AVERAGEIFS, and ROUND remain completely active in Excel, enabling dynamic recalculations when data updates.',
      tag: 'Native Formula Engine',
    },
    {
      icon: FileSpreadsheet,
      title: 'Multi-Sheet Architecture (.xlsx)',
      desc: 'Structured into an Executive Overview, Grouped Pivot Summaries, Source Records, and Verification tabs for boardroom presentation.',
      tag: 'Multi-Tab Workbooks',
    },
    {
      icon: ShieldCheck,
      title: '100% Client-Side Privacy',
      desc: 'Zero server uploads. Your confidential sales, payroll, or business spreadsheets never leave your local browser sandbox.',
      tag: 'Zero Cloud Storage',
    },
    {
      icon: Layers,
      title: 'Automated MIS Reporting from CSV',
      desc: 'Intelligent schema engine that infers dates, measures, and dimensions automatically without complex manual configuration.',
      tag: 'Automated MIS Tool',
    },
    {
      icon: TrendingUp,
      title: 'Universal Cross-Platform Spreadsheets',
      desc: 'Generated .xlsx files open flawlessly across Microsoft Office 365, Excel Desktop, Google Sheets, Apple Numbers, and LibreOffice.',
      tag: 'Universal .XLSX',
    },
  ];

  const faqs = [
    {
      q: 'How to create a dashboard from Excel or CSV automatically?',
      a: 'Simply click "Import CSV / Excel" or select an industry benchmark at excel.dattasable.com. The automated schema engine analyzes your columns, detects metrics, dates, and dimensions, and compiles a complete multi-sheet Microsoft Excel (.xlsx) dashboard with native formulas and visual charts in seconds without writing code.',
    },
    {
      q: 'Is there a free Excel dashboard generator online?',
      a: 'Yes. excel.dattasable.com is an online Excel dashboard maker created by Datta Sable. You can explore interactive KPI dashboards, upload your own datasets, inspect live native spreadsheet formulas, and preview charts directly in your web browser with zero signup required.',
    },
    {
      q: 'How does automated MIS report generation in Excel work?',
      a: 'The automated MIS generator converts raw transaction ledgers into structured Executive KPI Overviews, Grouped Pivot Summaries, Category Breakdowns, and Audit Records. Calculations are powered by authentic native formulas (SUMIFS, AVERAGEIFS) so monthly MIS reports stay dynamically updated as numbers change.',
    },
    {
      q: 'Can I generate Sales, HR, Finance, and Operations dashboards?',
      a: 'Yes. excel.dattasable.com includes tailored enterprise dashboard templates for SaaS & Sales (ARR, NRR, ACV), Healthcare (Patient Encounters, Treatment Value), Retail & E-Commerce (GMV, AOV), Finance & Wealth (Loan Originations, NIM), and Operations/Manufacturing (OEE, Units Produced, Scrap Rate). Custom CSV uploads for any domain are also fully supported.',
    },
    {
      q: 'Are formulas and charts in the downloaded Excel file real and editable?',
      a: 'Yes! Unlike flat static images or basic CSV exports, all workbooks generated by excel.dattasable.com contain real, native Excel formulas and genuine Excel chart objects. When opened in Microsoft Excel, Google Sheets, or Apple Numbers, all formulas recalculate dynamically upon editing data.',
    },
    {
      q: 'Can I download 100% editable and unprotected Excel files?',
      a: 'Yes. You can unlock fully unprotected and unrestricted .xlsx downloads starting from ₹9 for a single workbook pass, or ₹49 for unlimited lifetime access across all 12 templates and custom file uploads via UPI QR code.',
    },
    {
      q: 'Is my company data private and secure?',
      a: '100% private. All parsing, metric inference, and spreadsheet compilation execute strictly client-side inside your browser sandbox. None of your confidential business records, employee rosters, or revenue numbers are ever transmitted to or stored on external servers.',
    },
    {
      q: 'Who built excel.dattasable.com?',
      a: 'This platform was engineered by Datta Sable, a Business Intelligence Expert, Data Engineer, and analytics content creator. Explore more BI templates at dattasable.com, or check out Fabric Master (fabric.dattasable.com) for enterprise Microsoft Fabric architecture planning.',
    },
  ];

  return (
    <div className="landing-page-wrapper space-y-12 pb-10">
      {/* ========================================================================= */}
      {/* HERO SECTION                                                             */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#122421] via-[#1a332d] to-[#0e201b] border border-[#2b4c42] p-8 sm:p-12 lg:p-16 text-white shadow-xl">
        {/* Subtle Background Glow & Grid */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#86efac 1px, transparent 1px), linear-gradient(90deg, #86efac 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#34d399]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e4238] border border-[#376b5b] text-[#86efac] text-xs font-mono font-medium mb-6 shadow-sm">
            <Sparkles size={14} className="text-[#86efac] animate-pulse" />
            <span>EXCEL.DATTASABLE.COM</span>
            <span className="text-[#a7f3d0]/60">· Free Online Analytics Tool</span>
          </div>

          {/* Main H1 Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] mb-6 font-heading">
            Free Excel Dashboard Generator{' '}
            <span className="hidden sm:inline text-emerald-400 font-light">–</span>{' '}
            <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-[#86efac] via-[#6ee7b7] to-[#34d399]">
              Create Automated KPI &amp; MIS Reports
            </span>
          </h1>

          {/* Value Proposition Description */}
          <p className="text-base sm:text-lg text-[#c5ded5] leading-relaxed max-w-2xl mb-8 font-normal">
            Welcome to <strong className="text-white font-semibold">excel.dattasable.com</strong>, the free online Excel dashboard generator and automated MIS reporting tool designed by{' '}
            <a
              href="https://dattasable.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#86efac] underline underline-offset-4 hover:text-white font-medium transition-colors"
            >
              Datta Sable
            </a>{' '}
            to turn raw spreadsheet data into executive-grade Microsoft Excel (.xlsx) workbooks with live native formulas,
            interactive KPI metrics, and boardroom presentation layouts.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5 mb-8">
            <button
              onClick={onOpenDashboard}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] active:scale-[0.98] text-slate-950 text-sm font-bold shadow-lg shadow-emerald-950/40 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
            >
              <LayoutDashboard size={17} />
              <span>Launch Live Dashboard</span>
              <ArrowRight size={15} />
            </button>

            <button
              onClick={onOpenUploadModal}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-[#244b3f] hover:bg-[#2e5e4f] active:scale-[0.98] text-white text-sm font-semibold border border-[#3b7563] shadow-md transition-all w-full sm:w-auto"
            >
              <Upload size={17} />
              <span>Import CSV / Excel</span>
            </button>

            {!isProUnlocked ? (
              <button
                onClick={onOpenUnlockModal}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-sm font-extrabold shadow-lg shadow-amber-950/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all w-full sm:w-auto cursor-pointer"
                title="Get Excel Dashboard (.xlsx) — ₹9 Single File / ₹49 Lifetime Unlimited"
              >
                <Download size={17} className="stroke-[2.5]" />
                <span>Get Excel (.xlsx) — ₹9 / ₹49</span>
              </button>
            ) : (
              <button
                onClick={onDownloadExcel}
                disabled={isDownloading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-sm font-bold shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all w-full sm:w-auto cursor-pointer"
                title="Download 100% Unprotected & Editable Excel Dashboard"
              >
                <Unlock size={17} />
                <span>{isDownloading ? 'Compiling…' : 'Download Unprotected Excel'}</span>
              </button>
            )}
          </div>

          {/* Quick Trust Checks */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-[#9bb3a8]">
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-[#86efac] shrink-0" />
              <span>No signup required</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-[#86efac] shrink-0" />
              <span>100% Client-side privacy</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-[#86efac] shrink-0" />
              <span>Live editable formulas</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-[#86efac] shrink-0" />
              <span>Multi-sheet .xlsx</span>
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* WORKBOOK ARCHITECTURE PREVIEW CARD (Visual representation of what you get) */}
      {/* ========================================================================= */}
      <section className="bg-white border border-[#dfe5da] rounded-2xl p-5 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-emerald-800">
              <FileSpreadsheet size={15} />
              <span>Generated Workbook Architecture</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-1 font-heading">
              Create Professional Excel Dashboards Automatically
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore the multi-tab architecture, formulas, and visual scorecards inside your downloaded .xlsx spreadsheet.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onOpenExcelView}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors"
            >
              <Table size={14} />
              <span>Spreadsheet View</span>
            </button>
            <button
              onClick={onOpenDashboard}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#172b2a] hover:bg-[#203a35] text-white text-xs font-semibold transition-colors"
            >
              <span>Live Dashboard</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Mock Excel Sheet Container */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-inner">
          {/* Simulated Workbook Tabs Bar */}
          <div className="flex items-center gap-1 px-4 py-2.5 bg-slate-200/80 border-b border-slate-300 overflow-x-auto text-xs font-medium scrollbar-thin">
            <span className="px-3 py-1 rounded bg-white text-slate-900 border border-slate-300 font-semibold shadow-xs flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              1. Executive Dashboard
            </span>
            <span className="px-3 py-1 rounded text-slate-600 hover:bg-slate-100/70 shrink-0">
              2. Pivot Analysis
            </span>
            <span className="px-3 py-1 rounded text-slate-600 hover:bg-slate-100/70 shrink-0">
              3. Source Records
            </span>
            <span className="px-3 py-1 rounded text-slate-600 hover:bg-slate-100/70 shrink-0">
              4. Regional Trends
            </span>
            <span className="px-3 py-1 rounded text-slate-600 hover:bg-slate-100/70 shrink-0">
              5. Category Breakdown
            </span>
            <span className="px-3 py-1 rounded text-slate-600 hover:bg-slate-100/70 shrink-0">
              6. Audit &amp; Verification
            </span>
          </div>

          {/* Simulated Excel Grid & KPI Cards */}
          <div className="p-4 sm:p-6 bg-[#fbfdfa] space-y-5 sm:space-y-6">
            {/* Live Formula Bar Preview */}
            <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-slate-200 font-mono text-xs text-slate-600 overflow-x-auto">
              <span className="font-bold text-slate-400 select-none shrink-0">fx</span>
              <span className="text-slate-400 select-none shrink-0">|</span>
              <span className="text-emerald-700 font-medium whitespace-nowrap">
                =SUMIFS(Transactions!$G:$G, Transactions!$C:$C, $B$4, Transactions!$E:$E, C$2)
              </span>
            </div>

            {/* Simulated 4 High-Impact KPI Scorecards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Gross Revenue
                </span>
                <span className="text-lg sm:text-2xl font-extrabold text-slate-900 block mt-1">
                  $9,842,500
                </span>
                <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-1">
                  ▲ +14.2% YoY
                </span>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Gross Margin %
                </span>
                <span className="text-lg sm:text-2xl font-extrabold text-slate-900 block mt-1">
                  76.4%
                </span>
                <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-1">
                  ▲ +2.8 pts
                </span>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Active Accounts
                </span>
                <span className="text-lg sm:text-2xl font-extrabold text-slate-900 block mt-1">
                  1,420
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block mt-1">
                  Enterprise Base
                </span>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Avg Order Value
                </span>
                <span className="text-lg sm:text-2xl font-extrabold text-slate-900 block mt-1">
                  $6,930
                </span>
                <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-1">
                  ▲ +8.4% MoM
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* KEY CAPABILITIES - 6 DISTINCT VALUE PILLARS (Clean Cards)                 */}
      {/* ========================================================================= */}
      <section className="bg-white border border-[#dfe5da] rounded-2xl p-6 sm:p-10 shadow-xs">
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 font-mono">
            Interactive Business Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-heading">
            Turn Excel Data into Interactive Business Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Engineered for financial analysts, business intelligence developers, managers, and data engineers who need automated, reliable Excel reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-[#fafbf9] border border-[#e1e7de] rounded-xl p-6 hover:border-emerald-600/60 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100/70 border border-emerald-300/60 flex items-center justify-center text-emerald-800 shadow-xs">
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-700 border border-slate-300/60">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 font-heading">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* AUTOMATE MIS REPORTING & KPI TRACKING SECTION                             */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-br from-[#172b2a] via-[#1c3830] to-[#142823] text-white border border-[#2d5246] rounded-2xl p-6 sm:p-10 shadow-lg">
        <div className="max-w-3xl mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#86efac] font-mono">
            Excel MIS Automation
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 font-heading">
            Automate MIS Reporting and KPI Tracking
          </h2>
          <p className="text-xs sm:text-sm text-[#c5ded5] mt-2 leading-relaxed">
            Eliminate manual copy-pasting and formula debugging. excel.dattasable.com automatically compiles raw transaction ledgers into standardized monthly MIS reports, executive summaries, and dynamic KPI scorecards powered by live formulas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#1f3f36]/70 border border-[#346255] rounded-xl p-5">
            <div className="text-[#86efac] font-mono text-xs font-semibold mb-2">01 · DYNAMIC FORMULAS</div>
            <h3 className="text-base font-bold text-white mb-2 font-heading">Authentic SUMIFS &amp; AVERAGEIFS</h3>
            <p className="text-xs text-[#a9c4b9] leading-relaxed">
              Calculations are linked with real Excel formulas. When you update your source rows, executive KPIs and category breakdowns update dynamically.
            </p>
          </div>

          <div className="bg-[#1f3f36]/70 border border-[#346255] rounded-xl p-5">
            <div className="text-[#86efac] font-mono text-xs font-semibold mb-2">02 · STANDARDIZED MIS TABS</div>
            <h3 className="text-base font-bold text-white mb-2 font-heading">Multi-Sheet MIS Architecture</h3>
            <p className="text-xs text-[#a9c4b9] leading-relaxed">
              Every exported spreadsheet includes an Executive KPI Overview, Grouped Pivot Breakdowns, clean Raw Data Records, and Verification tabs.
            </p>
          </div>

          <div className="bg-[#1f3f36]/70 border border-[#346255] rounded-xl p-5">
            <div className="text-[#86efac] font-mono text-xs font-semibold mb-2">03 · ZERO CODE &amp; ZERO MACROS</div>
            <h3 className="text-base font-bold text-white mb-2 font-heading">Universal Compatibility</h3>
            <p className="text-xs text-[#a9c4b9] leading-relaxed">
              No VBA macros, no security warnings, and no plugins needed. Workbooks open smoothly in Microsoft Excel 365, Google Sheets, and Apple Numbers.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* INDUSTRY BENCHMARKS PRESETS                                               */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-[#f7f9f6] to-white border border-[#dfe5da] rounded-2xl p-6 sm:p-10 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 font-mono">
              Pre-Configured Models
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-heading">
              Excel Dashboard Examples for Different Industries
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Test realistic transaction ledgers, KPI ratios, and charts tailored to your sector.
            </p>
          </div>

          <button
            onClick={onOpenUploadModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Upload size={14} />
            <span>Or Bring Your Own CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {industries.map((ind) => {
            const Icon = ind.icon;
            const isSelected = currentIndustry === ind.id;
            return (
              <div
                key={ind.id}
                className={`p-5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-emerald-50/60 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-heading">{ind.name}</h3>
                    <span className="text-[10px] font-mono text-emerald-700 font-medium">
                      {ind.metric}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                  {ind.tagline}
                </p>

                <button
                  onClick={() => {
                    onSelectIndustry(ind.id);
                    onOpenDashboard();
                  }}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    isSelected
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <span>Launch {ind.name.split(' ')[0]} Model</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3-STEP WORKFLOW GUIDE                                                     */}
      {/* ========================================================================= */}
      <section className="bg-white border border-[#dfe5da] rounded-2xl p-6 sm:p-10 shadow-xs">
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 font-mono">
            Workflow Guide
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-heading">
            How to Generate an Excel Dashboard
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/90 relative">
            <span className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center mb-4 shadow-sm">
              1
            </span>
            <h3 className="text-base font-bold text-slate-900 mb-2 font-heading">
              Upload or Choose Benchmark
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Drag-and-drop your custom CSV/Excel dataset, or select from pre-tuned industry models (SaaS, Healthcare, Retail, Finance, Operations).
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/90 relative">
            <span className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center mb-4 shadow-sm">
              2
            </span>
            <h3 className="text-base font-bold text-slate-900 mb-2 font-heading">
              Explore Live Analytics
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Review KPI scorecards, interactive charts, and grouped pivot breakdowns directly inside your browser without running Excel yet.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/90 relative">
            <span className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center mb-4 shadow-sm">
              3
            </span>
            <h3 className="text-base font-bold text-slate-900 mb-2 font-heading">
              Export .XLSX Workbook
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Click "Export Workbook" to receive a multi-sheet spreadsheet loaded with live Excel formulas, visual charts, and clean formatting.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FAQ SECTION (SCHEMA-ALIGNED)                                              */}
      {/* ========================================================================= */}
      <section className="bg-white border border-[#dfe5da] rounded-2xl p-6 sm:p-10 shadow-xs">
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 font-mono">
            Common Inquiries
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-heading">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Everything you need to know about excel.dattasable.com features, data security, and formatting.
          </p>
        </div>

        <div className="space-y-3 max-w-4xl">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-[#e2e8df] rounded-xl bg-white overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-medium text-slate-800 text-sm hover:bg-slate-50/80 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-slate-900">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp size={18} className="text-emerald-700 shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-[#fbfdfa]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* AUTHOR / DEVELOPER CARD (DATTA SABLE)                                     */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-r from-[#172b2a] via-[#1b342e] to-[#142823] text-white rounded-2xl p-5 sm:p-10 border border-[#2e5044] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#23433a] border-2 border-[#4ade80]/40 flex items-center justify-center text-[#86efac] font-bold text-xl sm:text-2xl shrink-0 shadow-sm">
            DS
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading">
              Created by Datta Sable
            </h3>
            <p className="text-xs text-[#a9c4b9] mt-1 max-w-xl leading-relaxed">
              Business Intelligence Expert, Data Engineer, and analytics consultant. Building modern, high-impact data visualization tools and automated business intelligence systems.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
          <a
            href="https://fabric.dattasable.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#183742] hover:bg-[#204957] active:scale-[0.98] text-sky-200 text-xs font-bold border border-sky-400/40 transition-all shadow-md w-full sm:w-auto"
            title="Fabric Master — Microsoft Fabric Architecture, Capacity Estimator & FinOps Platform"
          >
            <Cpu size={14} className="text-sky-400" />
            <span>Fabric Master</span>
            <ExternalLink size={12} className="opacity-70" />
          </a>
          <a
            href="https://dattasable.com/dashboards"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] active:scale-[0.98] text-slate-950 text-xs font-bold transition-all shadow-md w-full sm:w-auto"
          >
            <span>BI Portfolio</span>
            <ExternalLink size={12} />
          </a>
          <a
            href="https://dattasable.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-emerald-500/40 hover:bg-white/10 active:scale-[0.98] text-emerald-200 text-xs font-semibold transition-colors w-full sm:w-auto"
          >
            <span>dattasable.com</span>
            <ArrowRight size={12} />
          </a>
        </div>
      </section>
    </div>
  );
};
