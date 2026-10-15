import React from 'react';
import { Target, ShieldCheck, TrendingUp, Award } from 'lucide-react';

interface InteractiveGaugeMeterProps {
  attainmentPct: number; // e.g. 1.042 (104.2%)
  totalRevenue: number;
  targetRevenue: number;
}

export const InteractiveGaugeMeter: React.FC<InteractiveGaugeMeterProps> = ({
  attainmentPct,
  totalRevenue,
  targetRevenue,
}) => {
  const pct = Math.min(150, Math.max(0, attainmentPct * 100));
  // Map 0 - 150% to -180 deg to 0 deg in SVG semi-circle
  const angle = -180 + (pct / 150) * 180;
  const isOver = attainmentPct >= 1;

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-lg flex flex-col justify-between space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Global Quota Attainment Speedometer
            </h3>
            <p className="text-xs text-slate-400">Actual bookings vs board target</p>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
            isOver
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
          }`}
        >
          {isOver ? 'TARGET SURPASSED' : 'PACING'}
        </span>
      </div>

      {/* SVG Semi-Circle Speedometer */}
      <div className="relative flex flex-col items-center justify-center pt-2">
        <svg width="240" height="130" viewBox="0 0 240 130" className="overflow-visible select-none">
          {/* Background Track Arc */}
          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            stroke="#1e293b"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Color Gradient Track Arc */}
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="60%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Active Attainment Arc */}
          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray="314"
            strokeDashoffset={314 - (314 * Math.min(100, (pct / 150) * 100)) / 100}
            className="transition-all duration-700"
          />

          {/* Target 100% Indicator Marker Pin (at 100/150 = 66.6% -> -60 deg) */}
          <line
            x1="120"
            y1="120"
            x2="175"
            y2="33"
            stroke="#e2e8f0"
            strokeWidth="2.5"
            strokeDasharray="3 3"
          />

          {/* Center Hub */}
          <circle cx="120" cy="120" r="10" fill="#0f172a" stroke="#475569" strokeWidth="3" />
        </svg>

        {/* Needle Value Callout */}
        <div className="text-center mt-[-35px]">
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {(attainmentPct * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Quota Attainment Rate
          </div>
        </div>
      </div>

      {/* Target Breakdown Stats */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-slate-500 text-[10px] block">Actual Revenue</span>
          <span className="font-bold text-white">${(totalRevenue / 1000).toFixed(0)}k</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-slate-500 text-[10px] block">Target Quota</span>
          <span className="font-bold text-slate-300">${(targetRevenue / 1000).toFixed(0)}k</span>
        </div>
      </div>
    </div>
  );
};
