import React, { useState } from 'react';
import { PieChart as PieIcon, Percent, DollarSign, Check } from 'lucide-react';
import { CategorySummary } from '../types/dataset';

interface InteractivePieChartProps {
  categories: CategorySummary[];
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
}

const PIE_COLORS = [
  '#0284c7', // Sky
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#14b8a6', // Teal
];

export const InteractivePieChart: React.FC<InteractivePieChartProps> = ({
  categories,
  onSelectCategory,
  selectedCategory,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const totalRev = categories.reduce((s, c) => s + c.revenue, 0) || 1;

  const size = 300;
  const center = size / 2;
  const radius = 120;

  let startAngle = -Math.PI / 2;

  const slices = categories.map((cat, idx) => {
    const fraction = cat.revenue / totalRev;
    const angle = fraction * Math.PI * 2;
    const endAngle = startAngle + angle;

    const isHovered = hoveredIdx === idx;
    const isSelected = selectedCategory === cat.category;

    // Explode effect: shift slice center slightly along its bisector angle
    const midAngle = startAngle + angle / 2;
    const explodeDist = isHovered || isSelected ? 8 : 0;
    const cx = center + explodeDist * Math.cos(midAngle);
    const cy = center + explodeDist * Math.sin(midAngle);

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    // Label position along bisector
    const labelDist = radius * 0.65;
    const lx = cx + labelDist * Math.cos(midAngle);
    const ly = cy + labelDist * Math.sin(midAngle);

    const sliceData = {
      pathData,
      color: PIE_COLORS[idx % PIE_COLORS.length],
      category: cat,
      idx,
      fraction,
      lx,
      ly,
      pctStr: `${(fraction * 100).toFixed(0)}%`,
    };

    startAngle = endAngle;
    return sliceData;
  });

  const active = hoveredIdx !== null ? categories[hoveredIdx] : categories[0];

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-lg flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Revenue Breakdown (Interactive Pie Chart)
            </h3>
            <p className="text-xs text-slate-400">
              Native slice explosion &amp; interactive percentage distribution
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
          Pie Chart
        </span>
      </div>

      {/* Pie Chart SVG and Legend */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* SVG Graphic */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="overflow-visible select-none">
            <defs>
              <filter id="pie-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.5" />
              </filter>
            </defs>

            {slices.map((s) => {
              const isHovered = hoveredIdx === s.idx;
              const isSelected = selectedCategory === s.category.category;

              return (
                <g key={s.idx}>
                  <path
                    d={s.pathData}
                    fill={s.color}
                    stroke="#0f172a"
                    strokeWidth={2}
                    className="cursor-pointer transition-all duration-200"
                    style={{
                      filter: isHovered || isSelected ? 'url(#pie-shadow) brightness(1.15)' : 'none',
                      opacity: hoveredIdx !== null && !isHovered ? 0.65 : 1,
                    }}
                    onMouseEnter={() => setHoveredIdx(s.idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() => onSelectCategory && onSelectCategory(s.category.category)}
                  />

                  {/* Percentage label inside slice if large enough */}
                  {s.fraction > 0.08 && (
                    <text
                      x={s.lx}
                      y={s.ly + 4}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="11"
                      fontWeight="bold"
                      className="pointer-events-none drop-shadow"
                    >
                      {s.pctStr}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend List */}
        <div className="flex-1 w-full space-y-2">
          {categories.map((c, idx) => {
            const isHovered = hoveredIdx === idx;
            const isSelected = selectedCategory === c.category;
            const color = PIE_COLORS[idx % PIE_COLORS.length];

            return (
              <div
                key={c.category}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectCategory && onSelectCategory(c.category)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                  isHovered || isSelected
                    ? 'bg-slate-800/90 border-slate-600 shadow-md'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate max-w-[150px]">
                      {c.category}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Margin: {(c.marginPct * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 font-mono text-right shrink-0">
                  <span className="text-xs font-bold text-white">
                    ${(c.revenue / 1000).toFixed(0)}k
                  </span>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 min-w-[44px] text-center">
                    {(c.sharePct * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>Click slice to isolate category</span>
        <span className="text-emerald-400 font-mono">
          Hover for slice explosion
        </span>
      </div>
    </div>
  );
};
