import React, { useState } from 'react';
import { PieChart, Layers, Percent, DollarSign, ArrowUpRight } from 'lucide-react';
import { CategorySummary } from '../types/dataset';

interface InteractiveDonutChartProps {
  categories: CategorySummary[];
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
  palette?: string[];
  title?: string;
  subtitle?: string;
}

const DEFAULT_DONUT_COLORS = [
  '#0284c7', // Sky
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#14b8a6', // Teal
];

export const InteractiveDonutChart: React.FC<InteractiveDonutChartProps> = ({
  categories,
  onSelectCategory,
  selectedCategory,
  palette,
  title = 'Category Revenue Share & Margin Donut',
  subtitle = 'Hover slices to inspect unit margin spread and dollar contribution',
}) => {
  const activePalette = palette && palette.length > 0 ? palette : DEFAULT_DONUT_COLORS;
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const totalRev = categories.reduce((s, c) => s + c.revenue, 0) || 1;

  // Compute SVG arc paths
  const size = 320;
  const center = size / 2;
  const outerRadius = 130;
  const innerRadius = 82;

  let startAngle = -Math.PI / 2;

  const slices = categories.map((cat, idx) => {
    const fraction = cat.revenue / totalRev;
    const angle = fraction * Math.PI * 2;
    const endAngle = startAngle + angle;

    const isHovered = hoveredIdx === idx;
    const isSelected = selectedCategory === cat.category;
    const currentOuter = isHovered || isSelected ? outerRadius + 8 : outerRadius;

    // Outer Arc
    const x1 = center + currentOuter * Math.cos(startAngle);
    const y1 = center + currentOuter * Math.sin(startAngle);
    const x2 = center + currentOuter * Math.cos(endAngle);
    const y2 = center + currentOuter * Math.sin(endAngle);

    // Inner Arc
    const ix1 = center + innerRadius * Math.cos(endAngle);
    const iy1 = center + innerRadius * Math.sin(endAngle);
    const ix2 = center + innerRadius * Math.cos(startAngle);
    const iy2 = center + innerRadius * Math.sin(startAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${currentOuter} ${currentOuter} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ');

    const sliceData = {
      pathData,
      color: activePalette[idx % activePalette.length],
      category: cat,
      idx,
      fraction,
    };

    startAngle = endAngle;
    return sliceData;
  });

  const activeCategory = hoveredIdx !== null ? categories[hoveredIdx] : categories[0];

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-lg flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <PieChart className="w-4 h-4" />
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

        <span className="text-[11px] font-mono text-sky-400 bg-sky-950/60 border border-sky-800/40 px-2 py-0.5 rounded">
          Interactive Donut
        </span>
      </div>

      {/* Main Container: Donut SVG on Left + Category Breakdown on Right */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* SVG Donut Graphic */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="overflow-visible select-none">
            <defs>
              <filter id="donut-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.5" />
              </filter>
            </defs>

            {slices.map((s) => {
              const isHovered = hoveredIdx === s.idx;
              const isSelected = selectedCategory === s.category.category;

              return (
                <path
                  key={s.idx}
                  d={s.pathData}
                  fill={s.color}
                  stroke="#0f172a"
                  strokeWidth={2.5}
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    filter: isHovered || isSelected ? 'url(#donut-shadow) brightness(1.15)' : 'none',
                    opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1,
                  }}
                  onMouseEnter={() => setHoveredIdx(s.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => onSelectCategory && onSelectCategory(s.category.category)}
                />
              );
            })}
          </svg>

          {/* Center Callout inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[120px]">
              {activeCategory ? activeCategory.category : 'Total'}
            </span>
            <span className="text-lg font-extrabold text-white font-mono mt-0.5">
              ${activeCategory ? (activeCategory.revenue / 1000).toFixed(0) : 0}k
            </span>
            <span className="text-[11px] font-bold text-emerald-400 mt-0.5">
              {activeCategory ? `${(activeCategory.marginPct * 100).toFixed(1)}% Mgn` : ''}
            </span>
          </div>
        </div>

        {/* Legend & Breakdown on Right */}
        <div className="flex-1 w-full space-y-2">
          {categories.map((c, idx) => {
            const isHovered = hoveredIdx === idx;
            const isSelected = selectedCategory === c.category;
            const color = activePalette[idx % activePalette.length];

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
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate max-w-[160px]">
                      {c.category}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {c.units.toLocaleString()} units sold
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-right shrink-0">
                  <div className="text-xs font-bold text-white">
                    ${(c.revenue / 1000).toFixed(1)}k
                  </div>
                  <div className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 min-w-[45px] text-center">
                    {(c.sharePct * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>Click any category to filter</span>
        <span className="text-sky-400 font-mono">
          Top Category: {categories[0]?.category} ({((categories[0]?.sharePct || 0) * 100).toFixed(1)}%)
        </span>
      </div>
    </div>
  );
};
