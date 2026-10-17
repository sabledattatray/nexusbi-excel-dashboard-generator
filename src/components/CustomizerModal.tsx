import React, { useState, useMemo } from 'react';
import {
  X,
  LayoutTemplate,
  Check,
  CheckCircle2,
  Building2,
  FileSpreadsheet,
  BarChart3,
  Sparkles,
  Search,
  Laptop,
  Coins,
  ShoppingBag,
  HeartPulse,
  Factory,
  Briefcase,
  ShieldCheck,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { DatasetConfig, IndustryType } from '../types/dataset';
import { INDUSTRY_PRESETS } from '../utils/dataGenerator';

interface CustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DatasetConfig;
  onSaveConfig: (newConfig: DatasetConfig) => void;
}

export type TemplateCategory =
  | 'all'
  | 'tech'
  | 'finance'
  | 'retail'
  | 'healthcare'
  | 'industrial'
  | 'services';

interface CategoryDef {
  id: TemplateCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORY_DEFINITIONS: CategoryDef[] = [
  { id: 'all', label: 'All Models', icon: LayoutTemplate },
  { id: 'tech', label: 'Tech & SaaS', icon: Laptop },
  { id: 'finance', label: 'Finance & Legal', icon: Coins },
  { id: 'retail', label: 'Retail & Consumer', icon: ShoppingBag },
  { id: 'healthcare', label: 'Healthcare & Bio', icon: HeartPulse },
  { id: 'industrial', label: 'Industrial & Energy', icon: Factory },
  { id: 'services', label: 'Services & Ops', icon: Briefcase },
];

const INDUSTRY_METADATA: Record<
  IndustryType,
  {
    category: TemplateCategory;
    sector: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
    bgClass: string;
  }
> = {
  // Tech & SaaS
  enterprise_tech: {
    category: 'tech',
    sector: 'Enterprise Tech',
    icon: Laptop,
    colorClass: 'text-indigo-600',
    bgClass: 'bg-indigo-50 border-indigo-200',
  },
  saas_product_ops: {
    category: 'tech',
    sector: 'Cloud SaaS',
    icon: Laptop,
    colorClass: 'text-sky-600',
    bgClass: 'bg-sky-50 border-sky-200',
  },
  cybersecurity_secops: {
    category: 'tech',
    sector: 'Cybersecurity',
    icon: Laptop,
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50 border-emerald-200',
  },
  telecom_networks: {
    category: 'tech',
    sector: 'Telecommunications',
    icon: Laptop,
    colorClass: 'text-cyan-600',
    bgClass: 'bg-cyan-50 border-cyan-200',
  },

  // Finance & Legal
  finance_wealth: {
    category: 'finance',
    sector: 'Banking & Wealth',
    icon: Coins,
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50 border-amber-200',
  },
  insurance_underwriting: {
    category: 'finance',
    sector: 'Insurance & Risk',
    icon: Coins,
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50 border-blue-200',
  },
  legal_compliance: {
    category: 'finance',
    sector: 'Legal & Compliance',
    icon: Coins,
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-50 border-purple-200',
  },

  // Retail & Consumer
  ecommerce_retail: {
    category: 'retail',
    sector: 'Omnichannel Retail',
    icon: ShoppingBag,
    colorClass: 'text-rose-600',
    bgClass: 'bg-rose-50 border-rose-200',
  },
  fashion_luxury: {
    category: 'retail',
    sector: 'Fashion & Luxury',
    icon: ShoppingBag,
    colorClass: 'text-pink-600',
    bgClass: 'bg-pink-50 border-pink-200',
  },
  food_beverage: {
    category: 'retail',
    sector: 'Food & Beverage',
    icon: ShoppingBag,
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50 border-orange-200',
  },

  // Healthcare & Bio
  healthcare_pharma: {
    category: 'healthcare',
    sector: 'Healthcare & Devices',
    icon: HeartPulse,
    colorClass: 'text-teal-600',
    bgClass: 'bg-teal-50 border-teal-200',
  },
  pharmaceutical_biotech: {
    category: 'healthcare',
    sector: 'Biopharma & Rx',
    icon: HeartPulse,
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50 border-emerald-200',
  },
  biomedical_genomics: {
    category: 'healthcare',
    sector: 'Genomics & Diagnostics',
    icon: HeartPulse,
    colorClass: 'text-cyan-600',
    bgClass: 'bg-cyan-50 border-cyan-200',
  },
  fitness_wellness: {
    category: 'healthcare',
    sector: 'Fitness & Wellness',
    icon: HeartPulse,
    colorClass: 'text-lime-600',
    bgClass: 'bg-lime-50 border-lime-200',
  },

  // Industrial & Energy
  industrial_manufacturing: {
    category: 'industrial',
    sector: 'Manufacturing',
    icon: Factory,
    colorClass: 'text-slate-700',
    bgClass: 'bg-slate-100 border-slate-300',
  },
  automotive_ev: {
    category: 'industrial',
    sector: 'Automotive & EV',
    icon: Factory,
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50 border-red-200',
  },
  aerospace_defense: {
    category: 'industrial',
    sector: 'Aerospace & Defense',
    icon: Factory,
    colorClass: 'text-blue-700',
    bgClass: 'bg-blue-50 border-blue-200',
  },
  energy_utilities: {
    category: 'industrial',
    sector: 'Energy & Utilities',
    icon: Factory,
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50 border-amber-200',
  },
  oil_gas_mining: {
    category: 'industrial',
    sector: 'Resources & Mining',
    icon: Factory,
    colorClass: 'text-stone-700',
    bgClass: 'bg-stone-100 border-stone-300',
  },
  construction_engineering: {
    category: 'industrial',
    sector: 'Construction & Infra',
    icon: Factory,
    colorClass: 'text-yellow-700',
    bgClass: 'bg-yellow-50 border-yellow-200',
  },
  logistics_supply_chain: {
    category: 'industrial',
    sector: 'Logistics & Freight',
    icon: Factory,
    colorClass: 'text-sky-700',
    bgClass: 'bg-sky-50 border-sky-200',
  },
  agriculture_agritech: {
    category: 'industrial',
    sector: 'Agriculture Tech',
    icon: Factory,
    colorClass: 'text-green-700',
    bgClass: 'bg-green-50 border-green-200',
  },

  // Services & Operations
  real_estate: {
    category: 'services',
    sector: 'Real Estate',
    icon: Briefcase,
    colorClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50 border-emerald-200',
  },
  human_resources: {
    category: 'services',
    sector: 'HR & People Ops',
    icon: Briefcase,
    colorClass: 'text-violet-600',
    bgClass: 'bg-violet-50 border-violet-200',
  },
  hospitality_travel: {
    category: 'services',
    sector: 'Hospitality & Travel',
    icon: Briefcase,
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50 border-amber-200',
  },
  marketing_media: {
    category: 'services',
    sector: 'Growth & Marketing',
    icon: Briefcase,
    colorClass: 'text-fuchsia-600',
    bgClass: 'bg-fuchsia-50 border-fuchsia-200',
  },
  media_entertainment: {
    category: 'services',
    sector: 'Media & Entertainment',
    icon: Briefcase,
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-50 border-purple-200',
  },
  nonprofit_charity: {
    category: 'services',
    sector: 'Nonprofit & NGO',
    icon: Briefcase,
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50 border-emerald-200',
  },
  professional_services: {
    category: 'services',
    sector: 'Consulting & Advisory',
    icon: Briefcase,
    colorClass: 'text-slate-700',
    bgClass: 'bg-slate-100 border-slate-300',
  },
  education_academic: {
    category: 'services',
    sector: 'Higher Education',
    icon: Briefcase,
    colorClass: 'text-indigo-600',
    bgClass: 'bg-indigo-50 border-indigo-200',
  },
  customer_support_ops: {
    category: 'services',
    sector: 'Customer Experience',
    icon: Briefcase,
    colorClass: 'text-teal-600',
    bgClass: 'bg-teal-50 border-teal-200',
  },
  general_business: {
    category: 'services',
    sector: 'General Enterprise',
    icon: Briefcase,
    colorClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50 border-emerald-200',
  },
};

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [industry, setIndustry] = useState<IndustryType>(config.industry);
  const [companyName, setCompanyName] = useState<string>(config.companyName);
  const [recordCount, setRecordCount] = useState<number>(config.recordCount);
  const [includeCharts, setIncludeCharts] = useState<boolean>(config.includeChartsInExcel);
  const [useFormulas, setUseFormulas] = useState<boolean>(config.useLiveExcelFormulas);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('all');
  const [mobileTab, setMobileTab] = useState<'templates' | 'settings'>('templates');

  if (!isOpen) return null;

  const handleIndustryChange = (ind: IndustryType) => {
    setIndustry(ind);
    if (INDUSTRY_PRESETS[ind]) {
      setCompanyName(INDUSTRY_PRESETS[ind].companyDefault);
    }
  };

  const handleApply = () => {
    onSaveConfig({
      ...config,
      industry,
      companyName: companyName.trim() || 'Nexus Enterprise Systems Inc.',
      recordCount,
      includeChartsInExcel: includeCharts,
      useLiveExcelFormulas: useFormulas,
    });
    onClose();
  };

  // Filter industry presets based on category and search query
  const allIndustryKeys = Object.keys(INDUSTRY_PRESETS) as IndustryType[];

  const filteredKeys = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allIndustryKeys.filter((key) => {
      const item = INDUSTRY_PRESETS[key];
      const meta = INDUSTRY_METADATA[key];

      // Category check
      if (selectedCategory !== 'all' && meta?.category !== selectedCategory) {
        return false;
      }

      // Search query check
      if (!q) return true;

      const nameMatch = item?.name.toLowerCase().includes(q);
      const descMatch = item?.description.toLowerCase().includes(q);
      const sectorMatch = meta?.sector.toLowerCase().includes(q);
      const companyMatch = item?.companyDefault.toLowerCase().includes(q);

      return nameMatch || descMatch || sectorMatch || companyMatch;
    });
  }, [allIndustryKeys, searchQuery, selectedCategory]);

  const activePreset = INDUSTRY_PRESETS[industry];
  const activeMeta = INDUSTRY_METADATA[industry];
  const ActiveIcon = activeMeta?.icon || LayoutTemplate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 lg:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl xl:max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden text-slate-800">
        
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/15 text-emerald-700 border border-emerald-500/25 shadow-sm">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  32 Ready Dashboard Templates
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  32 Models
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-500 mt-0.5">
                Pick an industry model with live formulas, or customize dataset parameters and company branding.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-b border-slate-200/80 shrink-0 space-y-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates (e.g. SaaS, FinTech, Healthcare, Logistics)..."
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-9 pr-9 py-1.5 sm:py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile View Switcher (< 1024px) */}
            <div className="flex lg:hidden rounded-xl bg-slate-100 p-1 border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setMobileTab('templates')}
                className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  mobileTab === 'templates'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Templates ({filteredKeys.length})
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('settings')}
                className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  mobileTab === 'settings'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Workbook Settings
              </button>
            </div>
          </div>

          {/* Category Filter Pills (Always on Desktop, only on Templates tab on Mobile) */}
          <div className={`items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs ${mobileTab === 'settings' ? 'hidden lg:flex' : 'flex'}`}>
            {CATEGORY_DEFINITIONS.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              const count =
                cat.id === 'all'
                  ? allIndustryKeys.length
                  : allIndustryKeys.filter((k) => INDUSTRY_METADATA[k]?.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium whitespace-nowrap text-xs transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                      : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {/* Desktop Two-Panel Layout */}
          <div className="hidden lg:grid lg:grid-cols-12 h-full min-h-0">
            {/* Left Column: 2-Column Template Grid (60% width) */}
            <div className="lg:col-span-7 xl:col-span-7 flex flex-col border-r border-slate-200 min-h-0 h-full">
              {/* Template Count Header */}
              <div className="px-5 py-2.5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
                <span>
                  Showing <strong className="text-slate-800">{filteredKeys.length}</strong> of 32 industry models
                </span>
                {selectedCategory !== 'all' || searchQuery ? (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="text-emerald-700 hover:text-emerald-800 font-medium text-[11px] flex items-center gap-1 hover:underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset filters
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400">Click any card to select</span>
                )}
              </div>

              {/* Scrollable Templates Grid */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
                {filteredKeys.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <Search className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-slate-600">No matching templates found</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Try searching for different keywords or select "All Models" to browse the full catalog.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                    >
                      Clear search filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {filteredKeys.map((indKey) => {
                      const item = INDUSTRY_PRESETS[indKey];
                      const meta = INDUSTRY_METADATA[indKey];
                      const isSelected = industry === indKey;
                      const Icon = meta?.icon || LayoutTemplate;

                      return (
                        <div
                          key={indKey}
                          onClick={() => handleIndustryChange(indKey)}
                          className={`group relative p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                              : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70 hover:shadow-sm'
                          }`}
                        >
                          <div>
                            {/* Card Top: Sector Badge & Selection Pill */}
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                                  meta?.bgClass || 'bg-slate-100 text-slate-600 border-slate-200'
                                } ${meta?.colorClass || 'text-slate-700'}`}
                              >
                                <Icon className="w-3 h-3" />
                                <span>{meta?.sector || 'Industry'}</span>
                              </span>

                              {isSelected ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  ACTIVE
                                </span>
                              ) : (
                                <span className="w-4 h-4 rounded-full border border-slate-300 group-hover:border-slate-400 group-hover:bg-slate-100/60 transition-colors shrink-0" />
                              )}
                            </div>

                            {/* Card Title */}
                            <h3
                              className={`text-xs font-bold leading-tight ${
                                isSelected ? 'text-emerald-950' : 'text-slate-900 group-hover:text-emerald-800'
                              }`}
                            >
                              {item.name}
                            </h3>

                            {/* Description clamp */}
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          {/* Default company preview */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{item.companyDefault}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Workbook Configuration & Customization (40% width) */}
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col bg-slate-50/70 p-4 xl:p-5 overflow-y-auto custom-scrollbar space-y-3">
              {/* Active Selection Hero Banner */}
              <div className="p-4 rounded-xl bg-white border border-emerald-500/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
                
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-700 border border-emerald-500/20 shrink-0">
                    <ActiveIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                        Selected Model
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {activeMeta?.sector}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                      {activePreset?.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {activePreset?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Organization / Company Branding Input */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Organization / Company Name
                  </label>
                  {companyName !== activePreset?.companyDefault && (
                    <button
                      type="button"
                      onClick={() => setCompanyName(activePreset?.companyDefault || '')}
                      className="text-[10px] text-emerald-700 hover:text-emerald-800 font-semibold hover:underline flex items-center gap-1"
                      title="Reset to template default"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Reset to default
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Nexus Enterprise Systems Inc."
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Will appear on the Excel workbook cover, worksheet title banners, and generated headers.
                </p>
              </div>

              {/* Record Volume Selector */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Dataset Volume (Source Rows)
                  </label>
                  <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                    {recordCount.toLocaleString()} rows
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[250, 500, 1000, 2500].map((count) => {
                    const isSel = recordCount === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setRecordCount(count)}
                        className={`py-2 px-1 rounded-lg border text-xs font-bold font-mono transition-all text-center ${
                          isSel
                            ? 'bg-sky-500/15 border-sky-500 text-sky-900 shadow-sm ring-1 ring-sky-500/20'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {count.toLocaleString()}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Larger datasets provide richer statistical sample depth for KPI trends and charts.
                </p>
              </div>

              {/* Excel Specific Options */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm space-y-2.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Excel Engine Configuration
                </label>

                {/* Visual Charts Toggle */}
                <div
                  onClick={() => setIncludeCharts(!includeCharts)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    includeCharts
                      ? 'bg-emerald-50/50 border-emerald-500/40 text-slate-900'
                      : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        includeCharts ? 'bg-emerald-500/15 text-emerald-700' : 'bg-slate-200/60 text-slate-500'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Embed Visual Charts in Excel Sheet</div>
                      <div className="text-[11px] text-slate-500">
                        Interactive native charts for summary groups. Full raw rows preserved.
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                      includeCharts ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {includeCharts && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                {/* Live Formulas Toggle */}
                <div
                  onClick={() => setUseFormulas(!useFormulas)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    useFormulas
                      ? 'bg-sky-50/50 border-sky-500/40 text-slate-900'
                      : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        useFormulas ? 'bg-sky-500/15 text-sky-700' : 'bg-slate-200/60 text-slate-500'
                      }`}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Use Live Excel Mathematical Formulas</div>
                      <div className="text-[11px] text-slate-500">
                        KPI metrics dynamically calculate from source rows via SUM, AVERAGE & COUNT formulas.
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                      useFormulas ? 'bg-sky-600 text-white' : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {useFormulas && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>

              {/* Privacy Trust Card */}
              <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200/80 flex items-center gap-2.5 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-[11px] leading-tight">
                  <strong className="text-slate-800">100% In-Browser Privacy:</strong> All data is generated client-side. Zero telemetry or server transmission.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile View (< 1024px) */}
          <div className="lg:hidden h-full flex flex-col min-h-0">
            {mobileTab === 'templates' ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>
                    Showing <strong className="text-slate-800">{filteredKeys.length}</strong> templates
                  </span>
                  <button
                    onClick={() => setMobileTab('settings')}
                    className="text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
                  >
                    Configure Settings →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredKeys.map((indKey) => {
                    const item = INDUSTRY_PRESETS[indKey];
                    const meta = INDUSTRY_METADATA[indKey];
                    const isSelected = industry === indKey;
                    const Icon = meta?.icon || LayoutTemplate;

                    return (
                      <div
                        key={indKey}
                        onClick={() => handleIndustryChange(indKey)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                                meta?.bgClass || 'bg-slate-100 text-slate-600 border-slate-200'
                              } ${meta?.colorClass || 'text-slate-700'}`}
                            >
                              <Icon className="w-3 h-3" />
                              <span>{meta?.sector || 'Industry'}</span>
                            </span>

                            {isSelected && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3 stroke-[3]" />
                                ACTIVE
                              </span>
                            )}
                          </div>

                          <h3 className="text-xs font-bold text-slate-900 leading-tight">
                            {item.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate flex items-center gap-1">
                            <Building2 className="w-3 h-3 shrink-0" />
                            {item.companyDefault}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/60">
                {/* Active Selection Hero Banner */}
                <div className="p-3.5 rounded-xl bg-white border border-emerald-500/30 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                      Selected Model
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {activeMeta?.sector}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{activePreset?.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{activePreset?.description}</p>
                </div>

                {/* Company Name */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Organization / Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Nexus Enterprise Systems Inc."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Record Volume */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Dataset Volume (Source Rows)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[250, 500, 1000, 2500].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setRecordCount(count)}
                        className={`py-2 px-1 rounded-lg border text-xs font-bold font-mono transition-all text-center ${
                          recordCount === count
                            ? 'bg-sky-500/15 border-sky-500 text-sky-900'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        {count.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Engine Options */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Excel Engine Configuration
                  </label>
                  <div
                    onClick={() => setIncludeCharts(!includeCharts)}
                    className="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-semibold text-slate-800">Embed Visual Charts</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center ${
                        includeCharts ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {includeCharts && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <div
                    onClick={() => setUseFormulas(!useFormulas)}
                    className="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-sky-700" />
                      <span className="text-xs font-semibold text-slate-800">Use Live Formulas</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center ${
                        useFormulas ? 'bg-sky-600 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {useFormulas && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Active selection snippet */}
          <div className="flex items-center gap-2 text-xs text-slate-600 truncate w-full sm:w-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">
              Model: <strong className="text-slate-900">{activePreset?.name}</strong> •{' '}
              <span className="font-mono text-slate-700">{recordCount.toLocaleString()} rows</span>
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply & Regenerate Dataset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
