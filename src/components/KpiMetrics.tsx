import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Package,
  ShoppingCart,
  Award,
  Layers,
} from 'lucide-react';
import { generateRealisticDataset } from '../utils/dataGenerator';

interface KpiMetricsProps {
  data: ReturnType<typeof generateRealisticDataset>;
  useLiveFormulas: boolean;
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({ data, useLiveFormulas }) => {
  const { kpi, transactions } = data;
  const n = transactions.length + 2;

  const cards = [
    {
      title: 'Gross Revenue',
      value: `$${(kpi.totalRevenue / 1_000_000).toFixed(2)}M`,
      rawValue: `$${kpi.totalRevenue.toLocaleString()}`,
      formula: useLiveFormulas ? `=SUM('Sales Transactions'!T3:T${n})` : null,
      trend: '+16.8% YoY',
      trendPositive: true,
      subtext: `From ${kpi.orderCount} enterprise contracts`,
      icon: DollarSign,
      color: 'text-sky-400',
      bgGlow: 'from-sky-500/10 to-transparent',
      borderColor: 'border-sky-500/20',
    },
    {
      title: 'Gross Profit',
      value: `$${(kpi.totalGrossProfit / 1_000_000).toFixed(2)}M`,
      rawValue: `$${kpi.totalGrossProfit.toLocaleString()}`,
      formula: useLiveFormulas ? `=SUM('Sales Transactions'!V3:V${n})` : null,
      trend: '+21.4% YoY',
      trendPositive: true,
      subtext: `Net after $${(kpi.totalCogs / 1_000_000).toFixed(2)}M COGS`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgGlow: 'from-emerald-500/10 to-transparent',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Blended Gross Margin',
      value: `${(kpi.overallMarginPct * 100).toFixed(1)}%`,
      rawValue: `${(kpi.overallMarginPct * 100).toFixed(2)}%`,
      formula: useLiveFormulas ? `=AVERAGE('Sales Transactions'!W3:W${n})` : null,
      trend: '+2.8 bps vs Target',
      trendPositive: true,
      subtext: 'High-margin software & services mix',
      icon: Percent,
      color: 'text-indigo-400',
      bgGlow: 'from-indigo-500/10 to-transparent',
      borderColor: 'border-indigo-500/20',
    },
    {
      title: 'Units Sold / Licenses',
      value: kpi.totalUnits.toLocaleString(),
      rawValue: `${kpi.totalUnits} items`,
      formula: useLiveFormulas ? `=SUM('Sales Transactions'!R3:R${n})` : null,
      trend: '+9.2% QoQ',
      trendPositive: true,
      subtext: `Across ${data.categorySummaries.length} product lines`,
      icon: Package,
      color: 'text-purple-400',
      bgGlow: 'from-purple-500/10 to-transparent',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Total Transaction Volume',
      value: kpi.orderCount.toLocaleString(),
      rawValue: `${kpi.orderCount} orders`,
      formula: useLiveFormulas ? `=COUNTA('Sales Transactions'!A3:A${n})` : null,
      trend: '100% Verified',
      trendPositive: true,
      subtext: `${data.customerAccounts.length} global client accounts`,
      icon: ShoppingCart,
      color: 'text-amber-400',
      bgGlow: 'from-amber-500/10 to-transparent',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Average Deal Size',
      value: `$${Math.round(kpi.averageDealSize).toLocaleString()}`,
      rawValue: `$${kpi.averageDealSize.toFixed(2)}`,
      formula: useLiveFormulas ? `=AVERAGE('Sales Transactions'!T3:T${n})` : null,
      trend: '+12.5% YoY',
      trendPositive: true,
      subtext: `Top theater: ${kpi.topRegion}`,
      icon: Award,
      color: 'text-teal-400',
      bgGlow: 'from-teal-500/10 to-transparent',
      borderColor: 'border-teal-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`relative rounded-xl p-4 bg-slate-900/80 border ${c.borderColor} shadow-sm overflow-hidden flex flex-col justify-between group hover:border-slate-600 transition-all`}
          >
            {/* Background subtle gradient */}
            <div className={`absolute inset-0 bg-gradient-to-b ${c.bgGlow} opacity-60 pointer-events-none`} />

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                  {c.title}
                </span>
                <div className={`p-1.5 rounded-lg bg-slate-800/80 ${c.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">
                  {c.value}
                </span>
              </div>

              {/* Excel formula badge */}
              {c.formula && (
                <div className="mt-1 flex items-center gap-1 font-mono text-[10px] text-emerald-400/90 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded truncate" title={`Excel Live Formula: ${c.formula}`}>
                  <span className="text-emerald-500">fx</span>
                  <span className="truncate">{c.formula}</span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-medium">
                {c.trend}
              </span>
              <span className="text-slate-500 truncate max-w-[100px]" title={c.subtext}>
                {c.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
