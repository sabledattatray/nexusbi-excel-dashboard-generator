import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  TrendingUp,
  Lightbulb,
  Filter,
  RotateCcw,
  DollarSign,
  ShoppingBag,
  Award,
  Calendar,
  Layers,
  ChevronDown,
  Shield,
  Database,
  ArrowUpRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { ReportPalette } from '../types/amazonPalettes';
import {
  MONTHLY_TREND_DATA,
  CATEGORY_REVENUE_DATA,
  COUNTRY_VOLUME_DATA,
  CHANNEL_DATA,
  SCATTER_POINTS,
  CUSTOMER_RECORDS,
  CustomerRecord,
} from '../data/amazonSalesData';

interface AmazonSalesDashboardProps {
  palette: ReportPalette;
  isCompact?: boolean; // For preview inside card vs full screen
  onOpenLiveReport?: () => void;
}

export const AmazonSalesDashboard: React.FC<AmazonSalesDashboardProps> = ({
  palette,
  isCompact = false,
  onOpenLiveReport,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [activeNav, setActiveNav] = useState<string>('Customers Analysis');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedSegment, setSelectedSegment] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Filtered customer records
  const filteredCustomers = useMemo(() => {
    return CUSTOMER_RECORDS.filter((cust) => {
      if (selectedCountry !== 'All' && cust.country !== selectedCountry) return false;
      if (selectedSegment !== 'All' && cust.segment !== selectedSegment) return false;
      if (searchQuery.trim() && !cust.customerName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [selectedCountry, selectedSegment, searchQuery]);

  // Dynamic KPI adjustments based on month
  const activeMonthData = useMemo(() => {
    if (selectedMonth === 'All') {
      return {
        active: 125,
        activeLY: 105,
        ytd: 277,
        growth: 19.0,
        revPerCust: 170.6,
        revPerCustLY: 176.0,
        unitsPerCust: 2.62,
        unitsPerCustLY: 2.68,
        retention: 49.6,
        retentionLY: 45.67,
        lifespan: '$11.13K',
        lifespanLY: '$11.5K',
      };
    }
    const idx = months.indexOf(selectedMonth);
    const item = MONTHLY_TREND_DATA[idx] || MONTHLY_TREND_DATA[7];
    const growth = Number((((item.active - item.activeLY) / item.activeLY) * 100).toFixed(1));
    return {
      active: item.active,
      activeLY: item.activeLY,
      ytd: item.active * 2 + 20,
      growth,
      revPerCust: Number((item.revenue / item.orders).toFixed(1)),
      revPerCustLY: Number(((item.revenue * 0.95) / item.orders).toFixed(1)),
      unitsPerCust: Number((item.orders / item.active * 1.8).toFixed(2)),
      unitsPerCustLY: 2.55,
      retention: Number((45 + (idx % 6) * 1.5).toFixed(2)),
      retentionLY: 44.5,
      lifespan: `$${(item.revenue / 2.2 / 1000).toFixed(2)}K`,
      lifespanLY: `$${(item.revenue / 2.4 / 1000).toFixed(2)}K`,
    };
  }, [selectedMonth]);

  const handleClearFilters = () => {
    setSelectedMonth('All');
    setSelectedCountry('All');
    setSelectedSegment('All');
    setSearchQuery('');
  };

  return (
    <div
      className={`w-full overflow-hidden transition-all duration-300 font-sans select-none ${
        isCompact ? 'rounded-xl text-[11px]' : 'rounded-2xl text-xs'
      }`}
      style={{ backgroundColor: palette.bg, color: palette.textPrimary }}
    >
      <div className="flex flex-col lg:flex-row min-h-[580px]">
        {/* ========================================================================= */}
        {/* LEFT BRAND / NAVIGATION SIDEBAR                                           */}
        {/* ========================================================================= */}
        <aside
          className="w-full lg:w-48 xl:w-52 shrink-0 p-3.5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r transition-colors"
          style={{
            backgroundColor: palette.sidebarBg,
            borderColor: palette.sidebarBorder,
            color: palette.sidebarText,
          }}
        >
          <div>
            {/* Logo area */}
            <div className="flex items-center gap-2.5 px-2 py-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-md"
                style={{ backgroundColor: palette.primary, color: '#ffffff' }}
              >
                amz
              </div>
              <div>
                <span className="font-heading font-black text-sm tracking-tight text-white block leading-tight">
                  Amazon BI
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">
                  Seller Studio
                </span>
              </div>
            </div>

            {/* Navigation label */}
            <div className="px-2 mb-1.5 text-[9px] font-mono tracking-widest uppercase opacity-60">
              NAVIGATION
            </div>

            {/* Navigation tabs */}
            <nav className="space-y-1">
              {[
                { name: 'Overview', icon: LayoutDashboard },
                { name: 'Customers Analysis', icon: Users },
                { name: 'Products Analysis', icon: Package },
                { name: 'Performance', icon: TrendingUp },
                { name: 'Insights', icon: Lightbulb },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveNav(item.name)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all text-left cursor-pointer"
                    style={{
                      backgroundColor: isActive ? palette.sidebarActiveBg : 'transparent',
                      color: isActive ? palette.sidebarActiveText : palette.sidebarText,
                      boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
                    }}
                  >
                    <Icon size={14} className={isActive ? 'opacity-100' : 'opacity-70'} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer badges */}
          <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 text-[9px] text-slate-300 font-mono">
              <Database size={11} className="opacity-70" />
              <span>Raw Live Data</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 text-[9px] text-slate-400 font-mono">
              <Shield size={11} className="opacity-70" />
              <span>Confidential FBA</span>
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* MAIN DASHBOARD CONTENT AREA                                               */}
        {/* ========================================================================= */}
        <div className="flex-1 p-3.5 sm:p-5 flex flex-col gap-4 overflow-x-auto min-w-0">
          {/* Header Row: Title & Month Filter Selector */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-heading" style={{ color: palette.textPrimary }}>
                  {activeNav}
                </h2>
                <span
                  className="px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider"
                  style={{ backgroundColor: palette.badgeBg, color: palette.badgeText }}
                >
                  LIVE FBA DATA
                </span>
              </div>
              <p className="text-[10px] mt-0.5" style={{ color: palette.textSecondary }}>
                Global FBA Marketplace Sales, Repeat Cohorts &amp; Customer Acquisition Velocity
              </p>
            </div>

            {/* Month Selector Pills (Jan - Dec) */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
              <button
                onClick={() => setSelectedMonth('All')}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedMonth === 'All' ? 'shadow-xs' : 'opacity-75 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: selectedMonth === 'All' ? palette.primary : palette.cardBg,
                  color: selectedMonth === 'All' ? '#ffffff' : palette.textPrimary,
                  border: `1px solid ${palette.cardBorder}`,
                }}
              >
                All
              </button>
              {months.map((m) => {
                const isSelected = selectedMonth === m;
                return (
                  <button
                    key={m}
                    onClick={() => setSelectedMonth(m)}
                    className={`px-2 py-1 rounded text-[10px] font-medium transition-all shrink-0 cursor-pointer ${
                      isSelected ? 'font-bold shadow-xs' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: isSelected ? palette.primary : palette.cardBg,
                      color: isSelected ? '#ffffff' : palette.textPrimary,
                      border: `1px solid ${isSelected ? palette.primary : palette.cardBorder}`,
                    }}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters Bar Row */}
          <div
            className="rounded-xl p-2.5 flex flex-wrap items-center gap-2 text-[10px] border"
            style={{ backgroundColor: palette.cardBg, borderColor: palette.cardBorder }}
          >
            <div className="flex items-center gap-1.5 font-bold mr-1" style={{ color: palette.primary }}>
              <Filter size={12} />
              <span>Filters</span>
            </div>

            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[9.5px] font-medium hover:bg-slate-100/50 transition-colors cursor-pointer mr-2"
              style={{ color: palette.textSecondary }}
            >
              <RotateCcw size={10} />
              <span>Clear all filters</span>
            </button>

            {/* Country Filter */}
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-2 py-1 rounded border text-[10px] bg-transparent outline-none cursor-pointer"
              style={{ borderColor: palette.cardBorder, color: palette.textPrimary }}
            >
              <option value="All">Country: All</option>
              <option value="Germany">Germany (DE)</option>
              <option value="United States">United States (US)</option>
              <option value="United Kingdom">United Kingdom (UK)</option>
              <option value="South Korea">South Korea (KR)</option>
              <option value="France">France (FR)</option>
              <option value="Brazil">Brazil (BR)</option>
              <option value="Italy">Italy (IT)</option>
            </select>

            {/* Segment Filter */}
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="px-2 py-1 rounded border text-[10px] bg-transparent outline-none cursor-pointer"
              style={{ borderColor: palette.cardBorder, color: palette.textPrimary }}
            >
              <option value="All">Segment: All</option>
              <option value="VIP">VIP Prime (14%)</option>
              <option value="Returning">Returning Buyer (50%)</option>
              <option value="New">New Buyer (36%)</option>
            </select>

            {/* Year selector */}
            <select
              defaultValue="2024"
              className="px-2 py-1 rounded border text-[10px] bg-transparent outline-none cursor-pointer"
              style={{ borderColor: palette.cardBorder, color: palette.textPrimary }}
            >
              <option value="2024">Year: 2024</option>
              <option value="2023">Year: 2023</option>
            </select>

            {/* Fulfillment Mode */}
            <select
              defaultValue="FBA"
              className="px-2 py-1 rounded border text-[10px] bg-transparent outline-none cursor-pointer"
              style={{ borderColor: palette.cardBorder, color: palette.textPrimary }}
            >
              <option value="FBA">Fulfillment: FBA</option>
              <option value="FBM">Fulfillment: FBM</option>
              <option value="All">All Channels</option>
            </select>
          </div>

          {/* ========================================================================= */}
          {/* 5 KPI SCORECARDS ROW                                                      */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* KPI 1: Active Customers */}
            <div
              className="rounded-xl p-3 border relative overflow-hidden transition-all hover:-translate-y-0.5 shadow-xs"
              style={{
                background: palette.kpiBg,
                borderColor: palette.kpiBorder,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-slate-700">Active Customers</span>
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px]"
                  style={{ backgroundColor: palette.primary }}
                >
                  <Users size={11} />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black font-heading tracking-tight" style={{ color: palette.primary }}>
                {activeMonthData.active}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-600 font-mono">
                <span>LY: {activeMonthData.activeLY}</span>
                <span className="text-slate-300">|</span>
                <span>YTD: {activeMonthData.ytd}</span>
              </div>
              <span
                className="inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold text-white shadow-xs"
                style={{ backgroundColor: palette.primary }}
              >
                +{activeMonthData.growth}%
              </span>
            </div>

            {/* KPI 2: Revenue per Customer */}
            <div
              className="rounded-xl p-3 border relative overflow-hidden transition-all hover:-translate-y-0.5 shadow-xs"
              style={{
                background: palette.kpiBg,
                borderColor: palette.kpiBorder,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-slate-700">Revenue per Customer</span>
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px]"
                  style={{ backgroundColor: palette.primary }}
                >
                  <DollarSign size={11} />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black font-heading tracking-tight" style={{ color: palette.primary }}>
                ${activeMonthData.revPerCust}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-600 font-mono">
                <span>LY: ${activeMonthData.revPerCustLY}</span>
                <span className="text-slate-300">|</span>
                <span>YTD: $185.0</span>
              </div>
              <span
                className="inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold text-white shadow-xs"
                style={{ backgroundColor: palette.accent }}
              >
                +3.20%
              </span>
            </div>

            {/* KPI 3: Units per Customer */}
            <div
              className="rounded-xl p-3 border relative overflow-hidden transition-all hover:-translate-y-0.5 shadow-xs"
              style={{
                background: palette.kpiBg,
                borderColor: palette.kpiBorder,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-slate-700">Units per Customer</span>
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px]"
                  style={{ backgroundColor: palette.primary }}
                >
                  <ShoppingBag size={11} />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black font-heading tracking-tight" style={{ color: palette.primary }}>
                {activeMonthData.unitsPerCust}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-600 font-mono">
                <span>LY: {activeMonthData.unitsPerCustLY}</span>
                <span className="text-slate-300">|</span>
                <span>YTD: 3.15</span>
              </div>
              <span
                className="inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold text-white shadow-xs"
                style={{ backgroundColor: palette.primary }}
              >
                +2.28%
              </span>
            </div>

            {/* KPI 4: Retention Rate */}
            <div
              className="rounded-xl p-3 border relative overflow-hidden transition-all hover:-translate-y-0.5 shadow-xs"
              style={{
                background: palette.kpiBg,
                borderColor: palette.kpiBorder,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-slate-700">Retention Rate</span>
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px]"
                  style={{ backgroundColor: palette.primary }}
                >
                  <Award size={11} />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black font-heading tracking-tight" style={{ color: palette.primary }}>
                {activeMonthData.retention}%
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-600 font-mono">
                <span>LY: {activeMonthData.retentionLY}%</span>
                <span className="text-slate-300">|</span>
                <span>YTD: 46.2%</span>
              </div>
              <span
                className="inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold text-white shadow-xs"
                style={{ backgroundColor: palette.accent }}
              >
                +2.93%
              </span>
            </div>

            {/* KPI 5: Customer Lifespan / LTV */}
            <div
              className="rounded-xl p-3 border relative overflow-hidden transition-all hover:-translate-y-0.5 shadow-xs col-span-2 sm:col-span-1"
              style={{
                background: palette.kpiBg,
                borderColor: palette.kpiBorder,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-slate-700">Customer Lifespan</span>
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px]"
                  style={{ backgroundColor: palette.primary }}
                >
                  <TrendingUp size={11} />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black font-heading tracking-tight" style={{ color: palette.primary }}>
                {activeMonthData.lifespan}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-600 font-mono">
                <span>LY: {activeMonthData.lifespanLY}</span>
                <span className="text-slate-300">|</span>
                <span>YTD: $16.0K</span>
              </div>
              <span
                className="inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold text-white shadow-xs"
                style={{ backgroundColor: palette.primary }}
              >
                +4.16%
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* VISUALS ROW 1: ACTIVE CUSTOMERS OVER TIME + REVENUE BY SEGMENT             */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Visual 1: Active Customers Over Time (Dual Spline + Area Curve) */}
            <div
              className="lg:col-span-7 rounded-xl p-4 border shadow-xs flex flex-col justify-between"
              style={{ backgroundColor: palette.cardBg, borderColor: palette.cardBorder }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold font-heading" style={{ color: palette.textPrimary }}>
                    Active Customers Over Time
                  </h3>
                  <div className="flex items-center gap-3 text-[9px] mt-0.5 font-mono" style={{ color: palette.textSecondary }}>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: palette.chartLine }} />
                      Active Customers
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5 border-b border-dashed border-slate-400" />
                      Active Customers LY
                    </span>
                  </div>
                </div>

                <div
                  className="px-2.5 py-1 rounded-md text-[9px] font-bold font-mono tracking-wide flex items-center gap-1 shadow-xs"
                  style={{ backgroundColor: palette.badgeBg, color: palette.badgeText }}
                >
                  <ArrowUpRight size={11} />
                  <span>19.0% VS L YEAR</span>
                </div>
              </div>

              {/* Dynamic SVG Spline Chart */}
              <div className="w-full h-44 sm:h-48 relative">
                <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id={`areaGrad-${palette.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette.primary} stopOpacity="0.45" />
                      <stop offset="100%" stopColor={palette.primary} stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  <line x1="30" y1="20" x2="490" y2="20" stroke={palette.cardBorder} strokeDasharray="3 3" />
                  <line x1="30" y1="65" x2="490" y2="65" stroke={palette.cardBorder} strokeDasharray="3 3" />
                  <line x1="30" y1="110" x2="490" y2="110" stroke={palette.cardBorder} strokeDasharray="3 3" />
                  <line x1="30" y1="150" x2="490" y2="150" stroke={palette.cardBorder} />

                  {/* Y-axis labels */}
                  <text x="5" y="24" fontSize="8" fill={palette.textSecondary} fontFamily="monospace">200</text>
                  <text x="5" y="69" fontSize="8" fill={palette.textSecondary} fontFamily="monospace">150</text>
                  <text x="5" y="114" fontSize="8" fill={palette.textSecondary} fontFamily="monospace">100</text>
                  <text x="12" y="153" fontSize="8" fill={palette.textSecondary} fontFamily="monospace">0</text>

                  {/* Prior Year Dotted Line */}
                  <path
                    d="M 40 120 Q 80 115 120 100 T 200 80 T 280 90 T 360 85 T 440 60 T 485 50"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1.7"
                    strokeDasharray="4 4"
                  />

                  {/* Area fill under curve */}
                  <path
                    d="M 40 108 C 80 95, 120 70, 160 80 C 200 90, 240 50, 280 60 C 320 70, 360 45, 400 35 C 440 25, 465 20, 485 15 L 485 150 L 40 150 Z"
                    fill={`url(#areaGrad-${palette.id})`}
                  />

                  {/* Active Spline Line */}
                  <path
                    d="M 40 108 C 80 95, 120 70, 160 80 C 200 90, 240 50, 280 60 C 320 70, 360 45, 400 35 C 440 25, 465 20, 485 15"
                    fill="none"
                    stroke={palette.primary}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Data Points & Value Callouts */}
                  {[
                    { x: 40, y: 108, val: '95' },
                    { x: 120, y: 70, val: '135' },
                    { x: 200, y: 90, val: '142' },
                    { x: 280, y: 60, val: '125' },
                    { x: 360, y: 45, val: '162' },
                    { x: 440, y: 25, val: '188' },
                    { x: 485, y: 15, val: '205' },
                  ].map((pt, i) => (
                    <g key={i}>
                      <circle cx={pt.x} cy={pt.y} r="3.5" fill="#ffffff" stroke={palette.primary} strokeWidth="2" />
                      <rect
                        x={pt.x - 11}
                        y={pt.y - 14}
                        width="22"
                        height="10"
                        rx="3"
                        fill={palette.primary}
                        opacity="0.9"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 7}
                        fontSize="7"
                        fontWeight="bold"
                        fill="#ffffff"
                        textAnchor="middle"
                      >
                        {pt.val}
                      </text>
                    </g>
                  ))}

                  {/* X-axis Month labels */}
                  {['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov', 'Dec'].map((lbl, idx) => (
                    <text
                      key={lbl}
                      x={40 + idx * 74}
                      y="160"
                      fontSize="8"
                      fill={palette.textSecondary}
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {lbl}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            {/* Visual 2: Revenue and Customer Segments (Column + Donut Breakdown) */}
            <div
              className="lg:col-span-5 rounded-xl p-4 border shadow-xs flex flex-col justify-between"
              style={{ backgroundColor: palette.cardBg, borderColor: palette.cardBorder }}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold font-heading" style={{ color: palette.textPrimary }}>
                    Revenue &amp; Customer Segments
                  </h3>
                  {/* Legend badges */}
                  <div className="flex items-center gap-2 text-[9px] font-mono">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.primary }} />
                      Returning
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.accent }} />
                      New
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      VIP
                    </span>
                  </div>
                </div>
                <p className="text-[10px]" style={{ color: palette.textSecondary }}>
                  Share of wallet by buyer tier and marketplace repetition
                </p>
              </div>

              {/* Layout with column bars and segment donut */}
              <div className="grid grid-cols-12 gap-3 items-center my-auto pt-2">
                {/* 3 Columns */}
                <div className="col-span-7 flex items-end justify-around h-36 px-2 border-b" style={{ borderColor: palette.cardBorder }}>
                  {[
                    { label: 'Returning', height: '82%', val: '$62K', color: palette.primary },
                    { label: 'New', height: '58%', val: '$45K', color: palette.accent },
                    { label: 'VIP Prime', height: '28%', val: '$18K', color: '#f59e0b' },
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 w-1/3">
                      <span className="text-[9px] font-bold font-mono" style={{ color: palette.textPrimary }}>
                        {bar.val}
                      </span>
                      <div
                        className="w-8 rounded-t-md transition-all duration-500 shadow-sm"
                        style={{ height: bar.height, backgroundColor: bar.color }}
                      />
                      <span className="text-[8.5px] font-medium text-slate-500 whitespace-nowrap mt-1 truncate max-w-[50px]">
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Donut Chart representation */}
                <div className="col-span-5 flex flex-col items-center justify-center relative">
                  <svg viewBox="0 0 100 100" className="w-28 h-28">
                    {/* Returning Segment: 50% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke={palette.primary}
                      strokeWidth="14"
                      strokeDasharray="113.1 226.2"
                      strokeDashoffset="0"
                    />
                    {/* New Segment: 36% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke={palette.accent}
                      strokeWidth="14"
                      strokeDasharray="81.4 226.2"
                      strokeDashoffset="-113.1"
                    />
                    {/* VIP Segment: 14% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth="14"
                      strokeDasharray="31.7 226.2"
                      strokeDashoffset="-194.5"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-black font-heading leading-none" style={{ color: palette.primary }}>
                      50%
                    </span>
                    <span className="text-[8px] font-mono text-slate-400">Returning</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono pt-2 border-t" style={{ borderColor: palette.cardBorder, color: palette.textSecondary }}>
                <span>Repeat Purchase Rate: <strong>68.4%</strong></span>
                <span>Prime Penetration: <strong>82%</strong></span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* VISUALS ROW 2: TOP 5 CATEGORIES, TOP COUNTRIES, CHANNELS, SCATTER, TABLE   */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Visual 3: Top 5 Categories / ASINs Donut Chart */}
            <div
              className="rounded-xl p-4 border shadow-xs flex flex-col justify-between"
              style={{ backgroundColor: palette.cardBg, borderColor: palette.cardBorder }}
            >
              <div>
                <h3 className="text-xs font-bold font-heading mb-1" style={{ color: palette.textPrimary }}>
                  Top 5 Categories by Revenue
                </h3>
                <p className="text-[10px]" style={{ color: palette.textSecondary }}>
                  Share of Amazon marketplace gross revenue
                </p>
              </div>

              <div className="flex items-center justify-center my-3">
                <svg viewBox="0 0 100 100" className="w-32 h-32">
                  {/* Segment 1: Echo (37.12%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="34"
                    fill="transparent"
                    stroke={palette.donutColors[0]}
                    strokeWidth="16"
                    strokeDasharray="79.3 213.6"
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: Kindle (24.62%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="34"
                    fill="transparent"
                    stroke={palette.donutColors[1]}
                    strokeWidth="16"
                    strokeDasharray="52.6 213.6"
                    strokeDashoffset="-79.3"
                  />
                  {/* Segment 3: Fire TV (21.49%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="34"
                    fill="transparent"
                    stroke={palette.donutColors[2]}
                    strokeWidth="16"
                    strokeDasharray="45.9 213.6"
                    strokeDashoffset="-131.9"
                  />
                  {/* Segment 4: Ring (10.51%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="34"
                    fill="transparent"
                    stroke={palette.donutColors[3]}
                    strokeWidth="16"
                    strokeDasharray="22.5 213.6"
                    strokeDashoffset="-177.8"
                  />
                  {/* Segment 5: Essentials (6.26%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="34"
                    fill="transparent"
                    stroke={palette.donutColors[4]}
                    strokeWidth="16"
                    strokeDasharray="13.3 213.6"
                    strokeDashoffset="-200.3"
                  />
                </svg>
              </div>

              {/* Legend with percentages */}
              <div className="space-y-1 text-[9.5px]">
                {CATEGORY_REVENUE_DATA.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: palette.donutColors[idx % palette.donutColors.length] }}
                      />
                      <span className="truncate" style={{ color: palette.textPrimary }}>
                        {cat.name}
                      </span>
                    </span>
                    <span className="font-mono font-bold shrink-0 ml-2" style={{ color: palette.textPrimary }}>
                      {cat.pct}% (${cat.revenue})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual 4: Top Countries by Customers (Horizontal Bar Chart) */}
            <div
              className="rounded-xl p-4 border shadow-xs flex flex-col justify-between"
              style={{ backgroundColor: palette.cardBg, borderColor: palette.cardBorder }}
            >
              <div>
                <h3 className="text-xs font-bold font-heading mb-1" style={{ color: palette.textPrimary }}>
                  Top Countries by Customers
                </h3>
                <p className="text-[10px]" style={{ color: palette.textSecondary }}>
                  Active unique buyer count per Amazon marketplace
                </p>
              </div>

              <div className="space-y-2 my-2">
                {COUNTRY_VOLUME_DATA.slice(0, 7).map((c) => {
                  const maxVal = 24;
                  const pct = (c.customers / maxVal) * 100;
                  return (
                    <div key={c.country} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1.5 font-medium truncate">
                          <span>{c.flag}</span>
                          <span className="truncate" style={{ color: palette.textPrimary }}>
                            {c.country}
                          </span>
                        </span>
                        <span className="font-mono font-bold ml-2" style={{ color: palette.primary }}>
                          {c.customers}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: palette.primary }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[9px] text-right font-mono" style={{ color: palette.textSecondary }}>
                Global Cross-Border Index: <strong>94.2</strong>
              </div>
            </div>

            {/* Visual 5 & 6: Acquisition Channels & Scatter Plot */}
            <div
              className="rounded-xl p-4 border shadow-xs flex flex-col justify-between"
              style={{ backgroundColor: palette.cardBg, borderColor: palette.cardBorder }}
            >
              <div>
                <h3 className="text-xs font-bold font-heading mb-1" style={{ color: palette.textPrimary }}>
                  Customer Acquisition Channels
                </h3>
                <p className="text-[10px]" style={{ color: palette.textSecondary }}>
                  Traffic attribution &amp; paid advertising volume
                </p>
              </div>

              {/* Column Bar chart */}
              <div className="flex items-end justify-around h-24 pt-2 border-b" style={{ borderColor: palette.cardBorder }}>
                {CHANNEL_DATA.map((ch, idx) => (
                  <div key={ch.channel} className="flex flex-col items-center gap-1 w-1/6">
                    <span className="text-[8px] font-mono font-bold" style={{ color: palette.textPrimary }}>
                      {ch.volume}
                    </span>
                    <div
                      className="w-4 rounded-t-sm transition-all shadow-xs"
                      style={{
                        height: `${(ch.volume / 40) * 100}%`,
                        backgroundColor: idx === 0 ? palette.primary : palette.chartBarSecondary,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[7px] text-slate-500 font-mono pt-1">
                <span>Search</span>
                <span>Social</span>
                <span>PPC</span>
                <span>Email</span>
                <span>Affil</span>
                <span>Direct</span>
              </div>

              {/* Scatter Plot Simulation: Revenue vs Order Volume */}
              <div className="pt-2 mt-2 border-t" style={{ borderColor: palette.cardBorder }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9.5px] font-bold" style={{ color: palette.textPrimary }}>
                    Revenue vs Order Volume
                  </span>
                  <span className="text-[8px] font-mono text-slate-400">Distribution</span>
                </div>
                <div className="w-full h-20 bg-slate-50/60 rounded-lg border relative overflow-hidden p-1.5" style={{ borderColor: palette.cardBorder }}>
                  {SCATTER_POINTS.slice(0, 14).map((pt, i) => {
                    const leftPct = (pt.orders / 5) * 85 + 5;
                    const topPct = 85 - (pt.revenue / 700) * 80;
                    return (
                      <div
                        key={pt.id}
                        className="absolute rounded-full transition-all hover:scale-125 cursor-pointer"
                        style={{
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          width: `${pt.size / 3.5}px`,
                          height: `${pt.size / 3.5}px`,
                          backgroundColor: palette.scatterColors[i % palette.scatterColors.length],
                          opacity: 0.75,
                        }}
                        title={`Orders: ${pt.orders} · Revenue: $${pt.revenue}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* VISUAL 7: HIGH-DENSITY LIVE DATA TABLE                                     */}
          {/* ========================================================================= */}
          <div
            className="rounded-xl border shadow-xs overflow-hidden"
            style={{ backgroundColor: palette.cardBg, borderColor: palette.cardBorder }}
          >
            <div className="p-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2" style={{ borderColor: palette.cardBorder }}>
              <div>
                <h3 className="text-xs font-bold font-heading" style={{ color: palette.textPrimary }}>
                  Customer Order Ledger &amp; Segmentation Breakdown
                </h3>
                <p className="text-[10px]" style={{ color: palette.textSecondary }}>
                  Showing {filteredCustomers.length} verified transactions matching current marketplace filters
                </p>
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer name…"
                className="px-2.5 py-1 rounded-lg border text-[10px] bg-slate-50/80 outline-none w-full sm:w-48"
                style={{ borderColor: palette.cardBorder, color: palette.textPrimary }}
              />
            </div>

            <div className="overflow-x-auto max-h-56 scrollbar-thin">
              <table className="w-full text-[10px] text-left">
                <thead
                  className="sticky top-0 font-semibold font-mono uppercase text-[9px] border-b"
                  style={{
                    backgroundColor: palette.tableHeaderBg,
                    borderColor: palette.cardBorder,
                    color: palette.textSecondary,
                  }}
                >
                  <tr>
                    <th className="py-2 px-3">Customer Name</th>
                    <th className="py-2 px-3">Region</th>
                    <th className="py-2 px-3">Country</th>
                    <th className="py-2 px-3 text-right">Units</th>
                    <th className="py-2 px-3 text-right">Revenue</th>
                    <th className="py-2 px-3 text-center">Segment</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: palette.cardBorder }}>
                  {filteredCustomers.map((cust) => (
                    <tr
                      key={cust.id}
                      className="hover:bg-slate-50/80 transition-colors"
                      style={{ color: palette.textPrimary }}
                    >
                      <td className="py-1.5 px-3 font-semibold">{cust.customerName}</td>
                      <td className="py-1.5 px-3 text-slate-500">{cust.regionName}</td>
                      <td className="py-1.5 px-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span>{cust.flag}</span>
                          <span>{cust.country}</span>
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono">{cust.units}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold" style={{ color: palette.primary }}>
                        ${cust.revenue}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[8.5px] font-bold font-mono ${
                            cust.segment === 'VIP'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : cust.segment === 'Returning'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {cust.segment}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
