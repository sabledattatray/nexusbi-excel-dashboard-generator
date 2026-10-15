import React, { useState } from 'react';
import { BarChart3, TrendingDown, TrendingUp, Info } from 'lucide-react';

interface InteractiveWaterfallChartProps {
  kpi: {
    totalRevenue: number;
    totalGrossProfit: number;
    totalCogs: number;
  };
}

export const InteractiveWaterfallChart: React.FC<InteractiveWaterfallChartProps> = ({ kpi }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Financial steps
  const grossBookings = Math.round(kpi.totalRevenue * 1.075);
  const discounts = -Math.round(kpi.totalRevenue * 0.075);
  const netRevenue = kpi.totalRevenue;
  const cogs = -kpi.totalCogs;
  const grossProfit = kpi.totalGrossProfit;
  const salesMarketing = -Math.round(kpi.totalRevenue * 0.15);
  const rdEngineering = -Math.round(kpi.totalRevenue * 0.11);
  const netEbitda = grossProfit + salesMarketing + rdEngineering;

  const steps = [
    {
      label: 'Gross Bookings',
      value: grossBookings,
      type: 'total' as const,
      color: '#0284c7', // Sky
      description: 'Initial pipeline contract valuation before standard tier discounts',
    },
    {
      label: 'Discounts & Rebates',
      value: discounts,
      type: 'subtraction' as const,
      color: '#f43f5e', // Rose/Red
      description: 'Average 7.5% corporate pricing allowances and multi-year prepay incentives',
    },
    {
      label: 'Net Billed Revenue',
      value: netRevenue,
      type: 'subtotal' as const,
      color: '#6366f1', // Indigo
      description: 'Realized recognized top-line invoiced revenue across all regional theaters',
    },
    {
      label: 'COGS & Hosting',
      value: cogs,
      type: 'subtraction' as const,
      color: '#f43f5e',
      description: 'Direct infrastructure, production licenses, and datacenter provisioning costs',
    },
    {
      label: 'Gross Profit',
      value: grossProfit,
      type: 'subtotal' as const,
      color: '#059669', // Emerald
      description: 'Commercial operating spread delivering high blended profit margin',
    },
    {
      label: 'Sales & Marketing',
      value: salesMarketing,
      type: 'subtraction' as const,
      color: '#f43f5e',
      description: 'Customer acquisition cost, account executive commissions, and partner programs',
    },
    {
      label: 'R&D Engineering',
      value: rdEngineering,
      type: 'subtraction' as const,
      color: '#f43f5e',
      description: 'Core product innovation, developer APIs, security audits, and feature sprints',
    },
    {
      label: 'Operating EBITDA',
      value: netEbitda,
      type: 'final' as const,
      color: '#10b981', // Emerald
      description: 'Retained operational earnings before tax, interest, and depreciation',
    },
  ];

  const maxVal = grossBookings * 1.15;
  const chartHeight = 220;

  // Running total calculation for waterfall steps
  let runningTotal = 0;
  const processedSteps = steps.map((s, idx) => {
    let startVal = runningTotal;
    let endVal = runningTotal;

    if (s.type === 'total' || s.type === 'subtotal' || s.type === 'final') {
      startVal = 0;
      endVal = s.value;
      runningTotal = s.value;
    } else {
      endVal = runningTotal + s.value;
      runningTotal = endVal;
    }

    const yTop = chartHeight - (Math.max(startVal, endVal) / maxVal) * chartHeight;
    const yBottom = chartHeight - (Math.min(startVal, endVal) / maxVal) * chartHeight;
    const height = Math.max(6, yBottom - yTop);

    return {
      ...s,
      startVal,
      endVal,
      yTop,
      height,
    };
  });

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              P&L Commercial Waterfall Bridge (Bookings to Operating EBITDA)
            </h3>
            <p className="text-xs text-slate-500">
              Interactive financial bridge connecting gross contracts, discounts, direct COGS, and retained EBITDA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-sky-500" />
            <span className="text-slate-500">Total / Subtotal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500" />
            <span className="text-slate-500">Deductions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
            <span className="text-slate-500">EBITDA</span>
          </div>
        </div>
      </div>

      {/* Floating Hover Details Box */}
      {hoveredIdx !== null && processedSteps[hoveredIdx] && (
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-4 animate-in fade-in">
          <div>
            <span className="font-bold text-slate-900 text-sm">
              {processedSteps[hoveredIdx].label}:
            </span>
            <span className="text-slate-500 ml-2">
              {processedSteps[hoveredIdx].description}
            </span>
          </div>
          <div className="font-mono text-right shrink-0">
            <span className="text-base font-extrabold text-slate-900">
              {processedSteps[hoveredIdx].value >= 0 ? '+' : ''}${(processedSteps[hoveredIdx].value / 1000).toFixed(0)}k
            </span>
            <span className="text-slate-500 text-[11px] block">
              Impact: {((Math.abs(processedSteps[hoveredIdx].value) / netRevenue) * 100).toFixed(1)}% of Revenue
            </span>
          </div>
        </div>
      )}

      {/* Waterfall Visual Bars */}
      <div className="h-64 flex items-end gap-2 sm:gap-4 px-2 pt-6 pb-2 border-b border-slate-200 relative select-none">
        {/* Background Guidelines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-15">
          <div className="border-b border-dashed border-slate-400 w-full" />
          <div className="border-b border-dashed border-slate-400 w-full" />
          <div className="border-b border-dashed border-slate-400 w-full" />
          <div className="border-b border-slate-600 w-full" />
        </div>

        {processedSteps.map((s, idx) => {
          const isHovered = hoveredIdx === idx;
          const barHeightPct = (s.height / chartHeight) * 100;
          const barBottomPct = ((chartHeight - s.yTop - s.height) / chartHeight) * 100;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group relative"
            >
              {/* Value Tag above bar */}
              <div
                className={`text-[10px] sm:text-xs font-mono font-bold transition-all mb-1 ${
                  s.type === 'subtraction' ? 'text-rose-700' : 'text-white'
                } ${isHovered ? 'scale-110' : ''}`}
                style={{ bottom: `${barBottomPct + barHeightPct}%`, position: 'absolute' }}
              >
                {s.value >= 0 ? '' : '-'}${(Math.abs(s.value) / 1000).toFixed(0)}k
              </div>

              {/* Bar Fill */}
              <div
                className={`w-full rounded transition-all duration-200 ${
                  isHovered ? 'brightness-125 shadow-lg' : ''
                }`}
                style={{
                  height: `${barHeightPct}%`,
                  marginBottom: `${barBottomPct}%`,
                  backgroundColor: s.color,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* X-Axis Step Labels */}
      <div className="flex items-start justify-between px-2 pt-2 text-[10px] sm:text-xs text-slate-500 font-sans">
        {processedSteps.map((s, idx) => (
          <div
            key={idx}
            className={`flex-1 text-center font-medium leading-tight truncate px-0.5 ${
              hoveredIdx === idx ? 'text-white font-bold' : ''
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* Bottom Insights Note */}
      <div className="pt-2 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>Operating EBITDA Margin: <strong>{((netEbitda / netRevenue) * 100).toFixed(1)}%</strong></span>
        <span className="text-emerald-700 font-mono font-bold">+3.2 bps Operational Leverage</span>
      </div>
    </div>
  );
};
