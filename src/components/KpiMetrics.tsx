import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Package,
  Layers,
  Award,
  Activity,
  Landmark,
  Building2,
  Users,
  Zap,
  GraduationCap,
  Target,
  BarChart3,
} from 'lucide-react';
import { AppDataset } from '../types/dataset';
import { getIndustryTheme, getAdaptedKpiLabels } from '../utils/industryTheme';

interface KpiMetricsProps {
  data: AppDataset;
  useLiveFormulas: boolean;
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({ data, useLiveFormulas }) => {
  const { kpi, transactions, config, schemaProfile } = data;
  const n = transactions.length + 2;

  const industryTheme = getIndustryTheme(config.industry);
  const labels = getAdaptedKpiLabels(config.industry, schemaProfile);

  // Format large values nicely
  const formatVal = (val: number, isCurrency = true) => {
    const symbol = isCurrency ? config.currencySymbol || '$' : '';
    if (Math.abs(val) >= 1_000_000) {
      return `${symbol}${(val / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(val) >= 10_000) {
      return `${symbol}${(val / 1_000).toFixed(1)}k`;
    }
    return `${symbol}${Math.round(val).toLocaleString()}`;
  };

  const cards = [
    {
      title: labels.metric1,
      value: formatVal(kpi.totalRevenue, true),
      rawValue: `${config.currencySymbol}${kpi.totalRevenue.toLocaleString()}`,
      formula: useLiveFormulas ? `=SUM('Sales Transactions'!T3:T${n})` : null,
      trend: 'Sample calculation',
      trendPositive: true,
      subtext: `${kpi.orderCount} records`,
      icon: DollarSign,
      color: 'text-emerald-700',
      bgGlow: `from-[${industryTheme.colors.primary}]/15 to-transparent`,
      borderColor: 'border-emerald-500/30',
      accentColor: '#6a9580',
    },
    {
      title: labels.metric2,
      value: formatVal(kpi.totalGrossProfit, true),
      rawValue: `${config.currencySymbol}${kpi.totalGrossProfit.toLocaleString()}`,
      formula: useLiveFormulas ? `=SUM('Sales Transactions'!V3:V${n})` : null,
      trend: 'Sample calculation',
      trendPositive: true,
      subtext: `Net after ${formatVal(kpi.totalCogs, true)}`,
      icon: TrendingUp,
      color: 'text-sky-700',
      bgGlow: `from-[${industryTheme.colors.secondary}]/15 to-transparent`,
      borderColor: 'border-sky-500/30',
      accentColor: '#6a9580',
    },
    {
      title: labels.metric3,
      value: `${(kpi.overallMarginPct * 100).toFixed(1)}%`,
      rawValue: `${(kpi.overallMarginPct * 100).toFixed(2)}%`,
      formula: useLiveFormulas ? `=AVERAGE('Sales Transactions'!W3:W${n})` : null,
      trend: 'Sample calculation',
      trendPositive: true,
      subtext: `${labels.categoryLabel} mix`,
      icon: Percent,
      color: 'text-indigo-700',
      bgGlow: `from-[${industryTheme.colors.accent}]/15 to-transparent`,
      borderColor: 'border-indigo-500/30',
      accentColor: '#6a9580',
    },
    {
      title: labels.metric4,
      value: kpi.totalUnits.toLocaleString(),
      rawValue: `${kpi.totalUnits} items`,
      formula: useLiveFormulas ? `=SUM('Sales Transactions'!R3:R${n})` : null,
      trend: 'Sample calculation',
      trendPositive: true,
      subtext: `Across ${data.categorySummaries.length} ${labels.categoryLabel.toLowerCase()}s`,
      icon: Package,
      color: 'text-violet-700',
      bgGlow: 'from-purple-500/10 to-transparent',
      borderColor: 'border-purple-500/20',
      accentColor: '#6a9580',
    },
    {
      title: labels.metric5,
      value: kpi.orderCount.toLocaleString(),
      rawValue: `${kpi.orderCount} entries`,
      formula: useLiveFormulas ? `=COUNTA('Sales Transactions'!A3:A${n})` : null,
      trend: 'Sample calculation',
      trendPositive: true,
      subtext: `${data.customerAccounts.length} ${labels.entityLabel.toLowerCase()}s`,
      icon: Layers,
      color: 'text-amber-700',
      bgGlow: 'from-amber-500/10 to-transparent',
      borderColor: 'border-amber-500/20',
      accentColor: '#6a9580',
    },
    {
      title: labels.metric6,
      value: formatVal(kpi.averageDealSize, true),
      rawValue: `${config.currencySymbol}${kpi.averageDealSize.toFixed(2)}`,
      formula: useLiveFormulas ? `=AVERAGE('Sales Transactions'!T3:T${n})` : null,
      trend: 'Sample calculation',
      trendPositive: true,
      subtext: `Top: ${kpi.topRegion}`,
      icon: Award,
      color: 'text-teal-700',
      bgGlow: 'from-teal-500/10 to-transparent',
      borderColor: 'border-teal-500/20',
      accentColor: '#6a9580',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3.5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`relative rounded-xl p-4 bg-white/85 border ${c.borderColor} shadow-sm overflow-hidden flex flex-col justify-between group hover:border-slate-500 transition-all`}
          >
            {/* Top color indicator line */}
            <div
              className="absolute top-0 left-0 right-0 h-1 opacity-80"
              style={{ backgroundColor: c.accentColor }}
            />

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase truncate" title={c.title}>
                  {c.title}
                </span>
                <div
                  className="p-1.5 rounded-lg shrink-0"
                  style={{
                    backgroundColor: `${c.accentColor}20`,
                    color: c.accentColor,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  {c.value}
                </span>
              </div>

              {c.formula && <span className="text-[10px] text-slate-400 mt-1" title={c.formula}>Excel calculation available</span>}
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
              <span className="text-emerald-700 font-medium">
                {c.trend}
              </span>
              <span className="text-slate-500 truncate max-w-[105px]" title={c.subtext}>
                {c.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
