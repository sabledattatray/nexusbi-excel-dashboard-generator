import React, { useState } from 'react';
import { AlignLeft, TrendingUp, CheckCircle, ArrowUpDown } from 'lucide-react';
import { RegionalPerformance } from '../types/dataset';

interface InteractiveHorizontalBarChartProps {
  regionalPerformance: RegionalPerformance[];
  onSelectRegion?: (region: string) => void;
  selectedRegion?: string;
  title?: string;
  subtitle?: string;
  metricLabel?: string;
  primaryColor?: string;
}

export const InteractiveHorizontalBarChart: React.FC<InteractiveHorizontalBarChartProps> = ({
  regionalPerformance,
  onSelectRegion,
  selectedRegion,
  title = 'Division Target vs Actual (Horizontal Bar Chart)',
  subtitle = 'Comparative horizontal bars evaluating booked performance against targets',
  metricLabel = 'Value',
  primaryColor = '#0284c7',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'revenue' | 'attainment' | 'profit'>('revenue');

  const sortedRegions = [...regionalPerformance].sort((a, b) => {
    if (sortBy === 'revenue') return b.actualRevenue - a.actualRevenue;
    if (sortBy === 'attainment') return b.quotaAttainmentPct - a.quotaAttainmentPct;
    return b.actualProfit - a.actualProfit;
  });

  const maxVal = Math.max(...regionalPerformance.map((r) => Math.max(r.actualRevenue, r.targetRevenue))) * 1.12;

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-lg flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <AlignLeft className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setSortBy('revenue')}
            className={`px-2 py-1 rounded transition-colors ${
              sortBy === 'revenue' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            By Revenue
          </button>
          <button
            onClick={() => setSortBy('attainment')}
            className={`px-2 py-1 rounded transition-colors ${
              sortBy === 'attainment' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            By Attainment %
          </button>
          <button
            onClick={() => setSortBy('profit')}
            className={`px-2 py-1 rounded transition-colors ${
              sortBy === 'profit' ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            By Profit
          </button>
        </div>
      </div>

      {/* Horizontal Bar Rows */}
      <div className="space-y-4 pt-1">
        {sortedRegions.map((r, idx) => {
          const isHovered = hoveredIdx === idx;
          const isSelected = selectedRegion === r.region;
          const actualPct = (r.actualRevenue / maxVal) * 100;
          const targetPct = (r.targetRevenue / maxVal) * 100;
          const attainment = Math.round(r.quotaAttainmentPct * 100);
          const isOver = attainment >= 100;
          const variance = r.actualRevenue - r.targetRevenue;

          return (
            <div
              key={r.region}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => onSelectRegion && onSelectRegion(r.region)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                isSelected || isHovered
                  ? 'bg-slate-800/80 border-sky-500/60 shadow-md'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Row Title */}
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{r.region}</span>
                  <span className="text-slate-500 text-[11px]">Dir: {r.regionalDirector}</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-white font-bold text-sm">
                    ${(r.actualRevenue / 1000).toFixed(0)}k
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    / ${(r.targetRevenue / 1000).toFixed(0)}k target
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      isOver
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {attainment}% Quota
                  </span>
                </div>
              </div>

              {/* Horizontal Bar Graphic Track */}
              <div className="relative w-full bg-slate-800 h-6 rounded-lg overflow-hidden flex items-center">
                {/* Target Marker Background Track */}
                <div
                  className="absolute top-0 bottom-0 bg-slate-700/40 rounded-lg"
                  style={{ width: `${targetPct}%` }}
                />

                {/* Actual Revenue Bar Fill */}
                <div
                  className={`h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white font-mono ${
                    isOver
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500'
                      : 'bg-gradient-to-r from-sky-600 to-sky-500'
                  }`}
                  style={{ width: `${actualPct}%` }}
                >
                  {actualPct > 18 && `$${(r.actualRevenue / 1000).toFixed(0)}k`}
                </div>

                {/* Target Pin Marker Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none z-10"
                  style={{ left: `${targetPct}%` }}
                  title={`Target: $${(r.targetRevenue / 1000).toFixed(0)}k`}
                />
              </div>

              {/* Detail Metrics below bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                <span className="flex items-center gap-1">
                  <span>Gross Profit:</span>
                  <strong className="text-emerald-400">${(r.actualProfit / 1000).toFixed(0)}k</strong>
                  <span>({((r.actualProfit / r.actualRevenue) * 100).toFixed(1)}% Mgn)</span>
                </span>
                <span className={variance >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  Variance: {variance >= 0 ? '+' : ''}${(variance / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Legend */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-emerald-500" />
            <span>Actual Revenue Bar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-3 bg-white" />
            <span>Target Quota Pin</span>
          </div>
        </div>
        <span className="text-slate-500 text-[11px]">Click territory to filter</span>
      </div>
    </div>
  );
};
