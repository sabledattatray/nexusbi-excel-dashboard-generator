/**
 * Universal Julius Chart Visuals Suite
 * Authoritative source: PRD v10.1 Sections B, C, D
 *
 * Implements 10 genuinely distinct, accessible SVG visual encodings:
 * 1. SvgLineAreaChart (Hero time trajectory)
 * 2. SvgDonutChart (Category & channel share with central total & %)
 * 3. SvgHorizontalBarChart (Sorted rankings with contribution %)
 * 4. SvgFinancialWaterfallChart (Canonical gross-to-profit bridge)
 * 5. SvgTreemapChart (Proportional rectangular partition with margin)
 * 6. SvgComboChart (Dual-axis monthly sales bars & profit line)
 * 7. SvgStackedColumnChart (Fulfillment status stacked by channel)
 * 8. SvgScatterBubbleChart (Product revenue vs margin % ratio-of-sums)
 * 9. SvgHeatmapChart (Month x region matrix grid)
 *
 * Strictly 100% browser-local, zero-AI, zero-CDN, colorblind-safe.
 */

import React, { useState } from 'react';
import { ChartViewModel, ChartDataPoint } from '../../analytics/composer/dashboardComposer';
import { ChartPalette, formatChartValue } from '../../analytics/composer/chartAdapter';

export function formatAxisDate(label: string): string {
  if (!label) return '';
  const match = label.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (match) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIdx = parseInt(match[2], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${months[monthIdx]} '${match[1].slice(2)}`;
    }
  }
  return label;
}

export interface UniversalChartVisualProps {
  chart: ChartViewModel;
  activeFilter: { field: string; value: string } | null;
  onSelectFilter: (field: string, value: string) => void;
  isDark: boolean;
  palette: ChartPalette;
  currencyPrefix?: string;
}

// =========================================================================
// 1. SvgLineAreaChart — Hero Chronological Time Trajectory
// =========================================================================
export function SvgLineAreaChart({
  chart,
  activeFilter,
  onSelectFilter,
  isDark,
  palette,
  currencyPrefix = '',
}: UniversalChartVisualProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const data = chart.data;

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-xs text-slate-500">No data points available</div>;
  }

  const svgWidth = 640;
  const svgHeight = 220;
  const pad = { top: 20, right: 24, bottom: 38, left: 56 };
  const plotW = svgWidth - pad.left - pad.right;
  const plotH = svgHeight - pad.top - pad.bottom;

  const rawVals = data.map((d) => (Number.isFinite(d.value) ? d.value : 0));
  const minVal = Math.min(0, ...rawVals);
  const maxVal = Math.max(...rawVals, 1) * 1.08;
  const range = maxVal - minVal || 1;

  const getX = (idx: number) => pad.left + (idx / Math.max(data.length - 1, 1)) * plotW;
  const getY = (val: number) => pad.top + plotH - ((val - minVal) / range) * plotH;

  const points = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.value),
    label: d.label,
    value: d.value,
    idx: i,
  }));

  const linePath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(pad.top + plotH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(pad.top + plotH).toFixed(1)} Z`;

  const yTicks = [0, 0.33, 0.66, 1].map((pct) => {
    const val = minVal + pct * (maxVal - minVal);
    const yPos = getY(val);
    return { val, yPos };
  });

  const xStride = data.length > 24 ? 4 : data.length > 16 ? 3 : data.length > 8 ? 2 : 1;
  const hoveredPoint = hoveredIdx !== null ? points[hoveredIdx] : null;
  const color = palette.primary || '#38bdf8';

  return (
    <div className="relative w-full">
      <div className="h-6 flex justify-between items-center text-xs mb-1 px-1">
        {hoveredPoint ? (
          <span className={`font-medium ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>
            {formatAxisDate(hoveredPoint.label)}: <strong className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{currencyPrefix}{hoveredPoint.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}</strong>
          </span>
        ) : (
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {data.length} chronological periods • Click point to cross-filter
          </span>
        )}
        <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Peak: {currencyPrefix}{formatChartValue(Math.max(...rawVals))}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible select-none"
        role="img"
        aria-label={`${chart.title} chronological trend line`}
      >
        <defs>
          <linearGradient id={`area-grad-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.38" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {yTicks.map((t, idx) => (
          <g key={idx}>
            <line
              x1={pad.left}
              y1={t.yPos}
              x2={pad.left + plotW}
              y2={t.yPos}
              stroke={isDark ? '#26354A' : '#DCE3EC'}
              strokeDasharray={idx === 0 ? undefined : '3 3'}
              strokeWidth="1"
            />
            <text
              x={pad.left - 6}
              y={t.yPos + 3.5}
              textAnchor="end"
              fontSize="9"
              fontFamily="monospace"
              fill={isDark ? '#A8B6C9' : '#52637B'}
            >
              {currencyPrefix}{formatChartValue(t.val)}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={`url(#area-grad-${chart.id})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {hoveredPoint && (
          <line
            x1={hoveredPoint.x}
            y1={pad.top}
            x2={hoveredPoint.x}
            y2={pad.top + plotH}
            stroke={color}
            strokeDasharray="2 2"
            strokeWidth="1.5"
            opacity="0.8"
          />
        )}

        {points.map((p) => {
          const isSelected = activeFilter && activeFilter.field === chart.dimensionLabel && activeFilter.value === p.label;
          const isHovered = hoveredIdx === p.idx;

          return (
            <g
              key={p.label}
              onClick={() => onSelectFilter(chart.dimensionLabel, p.label)}
              onMouseEnter={() => setHoveredIdx(p.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
              {isSelected && (
                <circle cx={p.x} cy={p.y} r="9" fill="none" stroke="#38bdf8" strokeWidth="2.5" className="animate-pulse" />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={isSelected ? 5.5 : isHovered ? 5.5 : 3.5}
                fill={isSelected ? '#38bdf8' : color}
                stroke={isDark ? '#111B2E' : '#FFFFFF'}
                strokeWidth={isSelected || isHovered ? '2' : '1.5'}
              />
            </g>
          );
        })}

        {points.map((p, idx) => {
          if (idx % xStride !== 0 && idx !== points.length - 1) return null;
          return (
            <text
              key={p.label}
              x={p.x}
              y={pad.top + plotH + 18}
              textAnchor="middle"
              fontSize="9"
              fill={isDark ? '#A8B6C9' : '#52637B'}
              className="select-none"
            >
              {formatAxisDate(p.label)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// =========================================================================
// 2. SvgDonutChart — Market Share Donut with Central Total & Percentages
// =========================================================================
export function SvgDonutChart({
  chart,
  activeFilter,
  onSelectFilter,
  isDark,
  palette,
  currencyPrefix = '',
}: UniversalChartVisualProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const data = chart.data;
  const isCurrency = chart.unit === 'currency' || (!chart.unit && currencyPrefix);

  const total = data.reduce((acc, d) => acc + (Number.isFinite(d.value) ? d.value : 0), 0);
  if (total <= 0) {
    return <div className="p-8 text-center text-xs text-slate-500">No share data available</div>;
  }

  const size = 260;
  const center = size / 2;
  const outerRadius = 100;
  const innerRadius = 64;

  let currentAngle = -Math.PI / 2;

  const slices = data.map((d, idx) => {
    const fraction = total > 0 ? Math.max(0, d.value) / total : 0;
    const angle = fraction * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = startAngle + angle;
    currentAngle = endAngle;

    const isSelected = activeFilter && activeFilter.field === chart.dimensionLabel && activeFilter.value === d.label;
    const isHovered = hoveredIdx === idx;
    const rOuter = isHovered || isSelected ? outerRadius + 6 : outerRadius;

    // Outer arc coords
    const x1 = center + rOuter * Math.cos(startAngle);
    const y1 = center + rOuter * Math.sin(startAngle);
    const x2 = center + rOuter * Math.cos(endAngle);
    const y2 = center + rOuter * Math.sin(endAngle);

    // Inner arc coords
    const ix1 = center + innerRadius * Math.cos(endAngle);
    const iy1 = center + innerRadius * Math.sin(endAngle);
    const ix2 = center + innerRadius * Math.cos(startAngle);
    const iy2 = center + innerRadius * Math.sin(startAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const pathData = fraction >= 0.999
      ? `M ${center} ${center - rOuter} A ${rOuter} ${rOuter} 0 1 1 ${center - 0.01} ${center - rOuter} Z`
      : `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;

    const sliceColor = palette.series[idx % palette.series.length];
    const pct = d.percentage ? d.percentage.toFixed(1) : ((fraction * 100).toFixed(1));

    return {
      d,
      idx,
      pathData,
      sliceColor,
      pct,
      isSelected,
      isHovered,
    };
  });

  const activeSlice = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 w-full">
      {/* SVG Donut Visualizer */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-48 h-48 md:w-56 md:h-56 overflow-visible select-none"
          role="img"
          aria-label={`${chart.title} donut chart`}
        >
          {slices.map((s) => (
            <path
              key={s.d.label}
              d={s.pathData}
              fill={s.sliceColor}
              stroke={isDark ? '#111B2E' : '#FFFFFF'}
              strokeWidth={s.isSelected || s.isHovered ? 2.5 : 1.5}
              className="cursor-pointer transition-all duration-200 hover:opacity-90"
              onClick={() => onSelectFilter(chart.dimensionLabel, s.d.label)}
              onMouseEnter={() => setHoveredIdx(s.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}

          {/* Center Hole Badge */}
          <circle cx={center} cy={center} r={innerRadius - 4} fill={isDark ? '#111B2E' : '#FFFFFF'} />
          <text
            x={center}
            y={center - 8}
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill={isDark ? '#A8B6C9' : '#52637B'}
            className="uppercase tracking-wider select-none"
          >
            {activeSlice ? activeSlice.d.label.slice(0, 14) : 'TOTAL'}
          </text>
          <text
            x={center}
            y={center + 12}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fontFamily="monospace"
            fill={isDark ? '#F4F7FC' : '#172033'}
            className="select-none"
          >
            {activeSlice
              ? `${isCurrency ? currencyPrefix : ''}${formatChartValue(activeSlice.d.value)}`
              : `${isCurrency ? currencyPrefix : ''}${formatChartValue(total)}`}
          </text>
          <text
            x={center}
            y={center + 26}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill={activeSlice ? activeSlice.sliceColor : isDark ? '#38BDF8' : '#0284C7'}
            className="select-none"
          >
            {activeSlice ? `${activeSlice.pct}% Share` : `${data.length} Segments`}
          </text>
        </svg>
      </div>

      {/* Interactive Legend with Exact Contribution % */}
      <div className="flex-1 w-full space-y-2">
        {slices.map((s) => (
          <button
            key={s.d.label}
            type="button"
            onClick={() => onSelectFilter(chart.dimensionLabel, s.d.label)}
            onMouseEnter={() => setHoveredIdx(s.idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all ${
              s.isSelected
                ? isDark
                  ? 'bg-sky-500/20 border border-sky-400 shadow-sm'
                  : 'bg-sky-50 border border-sky-400 shadow-sm'
                : isDark
                ? 'hover:bg-slate-800/60'
                : 'hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.sliceColor }} />
              <span className={`font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`} title={s.d.label}>
                {s.d.label}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`font-mono font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {isCurrency ? currencyPrefix : ''}{formatChartValue(s.d.value)}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isDark ? 'bg-slate-800 text-sky-400' : 'bg-slate-200 text-sky-800'
              }`}>
                {s.pct}%
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// 3. SvgHorizontalBarChart — Ranked Performance with Contribution %
// =========================================================================
export function SvgHorizontalBarChart({
  chart,
  activeFilter,
  onSelectFilter,
  isDark,
  palette,
  currencyPrefix = '',
}: UniversalChartVisualProps) {
  const data = chart.data;
  const isCurrency = chart.unit === 'currency' || (!chart.unit && currencyPrefix);
  const maxVal = Math.max(...data.map((d) => (Number.isFinite(d.value) ? d.value : 0)), 1);
  const totalVal = data.reduce((acc, d) => acc + (Number.isFinite(d.value) ? d.value : 0), 0);

  return (
    <div className="space-y-2.5 w-full">
      {data.map((point, idx) => {
        const isSelected = activeFilter && activeFilter.field === chart.dimensionLabel && activeFilter.value === point.label;
        const pctWidth = Math.max(4, Math.round((point.value / maxVal) * 100));
        const sharePct = point.percentage !== undefined
          ? point.percentage.toFixed(1)
          : totalVal > 0 ? ((point.value / totalVal) * 100).toFixed(1) : '0.0';
        const color = palette.series[idx % palette.series.length];

        return (
          <button
            key={point.label}
            type="button"
            onClick={() => onSelectFilter(chart.dimensionLabel, point.label)}
            className={`w-full text-left p-2 rounded-lg transition-all flex items-center gap-3 ${
              isSelected
                ? isDark
                  ? 'bg-sky-500/20 border border-sky-400'
                  : 'bg-sky-50 border border-sky-400 shadow-sm'
                : isDark
                ? 'hover:bg-slate-800/40'
                : 'hover:bg-slate-100/70'
            }`}
          >
            <span className={`w-28 sm:w-36 text-xs truncate font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`} title={point.label}>
              {point.label}
            </span>
            <div className={`flex-1 h-4 rounded overflow-hidden ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`}>
              <div
                className="h-full rounded transition-all duration-300"
                style={{ width: `${pctWidth}%`, backgroundColor: color }}
              />
            </div>
            <div className="flex items-center gap-2 w-28 sm:w-32 justify-end shrink-0">
              <span className={`text-xs font-mono font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {isCurrency ? currencyPrefix : ''}{formatChartValue(point.value)}
              </span>
              <span className={`text-[10px] px-1 rounded font-bold ${isDark ? 'bg-slate-800 text-sky-400' : 'bg-slate-200 text-sky-800'}`}>
                {sharePct}%
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// =========================================================================
// 4. SvgFinancialWaterfallChart — Canonical Financial Bridge
// =========================================================================
export function SvgFinancialWaterfallChart({
  chart,
  isDark,
  currencyPrefix = '$',
}: UniversalChartVisualProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const data = chart.data;

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-xs text-slate-500">No bridge data available</div>;
  }

  const svgWidth = 600;
  const svgHeight = 220;
  const pad = { top: 24, right: 20, bottom: 44, left: 60 };
  const plotW = svgWidth - pad.left - pad.right;
  const plotH = svgHeight - pad.top - pad.bottom;

  // Compute waterfall running steps
  let running = 0;
  const steps = data.map((pt, i) => {
    const val = pt.value;
    let startVal = running;
    let endVal = running;

    if (pt.stepType === 'start' || pt.stepType === 'total' || pt.isSubtotal) {
      startVal = 0;
      endVal = Math.abs(val);
      running = Math.abs(val);
    } else {
      endVal = running + val;
      running = endVal;
    }

    return {
      pt,
      startVal,
      endVal,
      val,
      idx: i,
    };
  });

  const allVals = steps.flatMap((s) => [s.startVal, s.endVal, 0]);
  const minVal = 0;
  const maxVal = Math.max(...allVals, 1) * 1.12;
  const range = maxVal - minVal || 1;

  const getY = (val: number) => pad.top + plotH - ((val - minVal) / range) * plotH;
  const colW = (plotW / data.length) * 0.65;
  const colGap = plotW / data.length;

  const yTicks = [0, 0.33, 0.66, 1].map((pct) => {
    const val = minVal + pct * (maxVal - minVal);
    const yPos = getY(val);
    return { val, yPos };
  });

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between text-xs mb-1 px-1">
        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
          Commercial Operating Bridge: Gross Revenue to Retained Profit
        </span>
        <span className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-sky-500" /> Base / Subtotal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Deduction / COGS
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Retained Profit
          </span>
        </span>
      </div>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible select-none"
        role="img"
        aria-label="Financial Waterfall Chart"
      >
        {/* Y-axis gridlines */}
        {yTicks.map((t, idx) => (
          <g key={idx}>
            <line
              x1={pad.left}
              y1={t.yPos}
              x2={pad.left + plotW}
              y2={t.yPos}
              stroke={isDark ? '#26354A' : '#DCE3EC'}
              strokeDasharray={idx === 0 ? undefined : '3 3'}
              strokeWidth="1"
            />
            <text
              x={pad.left - 6}
              y={t.yPos + 3.5}
              textAnchor="end"
              fontSize="9"
              fontFamily="monospace"
              fill={isDark ? '#A8B6C9' : '#52637B'}
            >
              {currencyPrefix}{formatChartValue(t.val)}
            </text>
          </g>
        ))}

        {/* Steps and connector bridge lines */}
        {steps.map((s, idx) => {
          const x = pad.left + idx * colGap + (colGap - colW) / 2;
          const yTop = getY(Math.max(s.startVal, s.endVal));
          const yBottom = getY(Math.min(s.startVal, s.endVal));
          const h = Math.max(3, yBottom - yTop);

          let barColor = '#38BDF8'; // Sky
          if (s.pt.stepType === 'decrease' || s.val < 0) {
            barColor = '#F43F5E'; // Rose
          } else if (idx === steps.length - 1 || s.pt.label.toLowerCase().includes('profit')) {
            barColor = '#10B981'; // Emerald
          } else if (s.pt.isSubtotal) {
            barColor = '#818CF8'; // Indigo
          }

          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={s.pt.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              {/* Connector line to next step */}
              {idx < steps.length - 1 && (
                <line
                  x1={x + colW}
                  y1={getY(s.endVal)}
                  x2={x + colGap + (colGap - colW) / 2}
                  y2={getY(s.endVal)}
                  stroke={isDark ? '#64748B' : '#94A3B8'}
                  strokeDasharray="2 2"
                  strokeWidth="1.2"
                />
              )}

              {/* Step Bar */}
              <rect
                x={x}
                y={yTop}
                width={colW}
                height={h}
                rx="3"
                fill={barColor}
                opacity={isHovered ? 1 : 0.9}
                stroke={isDark ? '#111B2E' : '#FFFFFF'}
                strokeWidth={isHovered ? 2 : 1}
                className="transition-all duration-150"
              />

              {/* Value Label above/below bar */}
              <text
                x={x + colW / 2}
                y={yTop - 6}
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
                fill={barColor}
              >
                {s.val < 0 ? '-' : s.val > 0 && s.pt.stepType === 'decrease' ? '-' : ''}
                {currencyPrefix}{formatChartValue(Math.abs(s.val))}
              </text>

              {/* Step X-axis Label */}
              <text
                x={x + colW / 2}
                y={pad.top + plotH + 16}
                textAnchor="middle"
                fontSize="8.5"
                fontWeight="500"
                fill={isDark ? '#A8B6C9' : '#52637B'}
              >
                {s.pt.label.split(' ')[0]}
              </text>
              <text
                x={x + colW / 2}
                y={pad.top + plotH + 28}
                textAnchor="middle"
                fontSize="8"
                fill={isDark ? '#64748B' : '#94A3B8'}
              >
                {s.pt.label.split(' ').slice(1, 3).join(' ')}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// =========================================================================
// 5. SvgTreemapChart — Product Category Mix & Margins
// =========================================================================
export function SvgTreemapChart({
  chart,
  activeFilter,
  onSelectFilter,
  isDark,
  palette,
  currencyPrefix = '$',
}: UniversalChartVisualProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const data = chart.data;

  const totalVal = data.reduce((acc, d) => acc + (Number.isFinite(d.value) ? d.value : 0), 0);
  if (totalVal <= 0) {
    return <div className="p-8 text-center text-xs text-slate-500">No category mix available</div>;
  }

  // Squarified 4-box layout for standard category count
  const svgW = 560;
  const svgH = 200;

  // Sort descending
  const sorted = [...data].sort((a, b) => b.value - a.value);

  // Divide into layout partitions
  // Primary (largest) gets left half or top half
  const p1 = sorted[0];
  const p2 = sorted[1];
  const p3 = sorted[2];
  const p4 = sorted[3];

  const w1 = (p1.value / totalVal) * svgW;
  const remW = svgW - w1;
  const remTotal = totalVal - p1.value || 1;

  const rects = [
    {
      pt: p1,
      x: 0,
      y: 0,
      w: w1 - 3,
      h: svgH,
      color: palette.series[0],
      idx: 0,
    },
    {
      pt: p2,
      x: w1,
      y: 0,
      w: remW,
      h: p3 ? (p2.value / remTotal) * svgH - 2 : svgH,
      color: palette.series[1],
      idx: 1,
    },
    ...(p3 ? [{
      pt: p3,
      x: w1,
      y: (p2.value / remTotal) * svgH + 1,
      w: p4 ? remW * 0.55 - 2 : remW,
      h: svgH - ((p2.value / remTotal) * svgH + 1),
      color: palette.series[2],
      idx: 2,
    }] : []),
    ...(p4 ? [{
      pt: p4,
      x: w1 + remW * 0.55 + 1,
      y: (p2.value / remTotal) * svgH + 1,
      w: remW * 0.45 - 1,
      h: svgH - ((p2.value / remTotal) * svgH + 1),
      color: palette.series[3],
      idx: 3,
    }] : []),
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xs mb-1 px-1">
        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
          Area proportional to Net Sales • Click category tile to cross-filter
        </span>
        <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Total Mix: {currencyPrefix}{formatChartValue(totalVal)}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full h-auto overflow-hidden select-none rounded-xl"
        role="img"
        aria-label="Category Treemap"
      >
        {rects.map((r) => {
          const isSelected = activeFilter && activeFilter.field === chart.dimensionLabel && activeFilter.value === r.pt.label;
          const isHovered = hoveredIdx === r.idx;
          const pct = ((r.pt.value / totalVal) * 100).toFixed(1);
          const profit = r.pt.secondaryValue !== undefined ? r.pt.secondaryValue : null;

          return (
            <g
              key={r.pt.label}
              onClick={() => onSelectFilter(chart.dimensionLabel, r.pt.label)}
              onMouseEnter={() => setHoveredIdx(r.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <rect
                x={r.x}
                y={r.y}
                width={Math.max(4, r.w)}
                height={Math.max(4, r.h)}
                rx="6"
                fill={r.color}
                opacity={isSelected ? 1 : isHovered ? 0.95 : 0.85}
                stroke={isSelected ? '#38BDF8' : isDark ? '#111B2E' : '#FFFFFF'}
                strokeWidth={isSelected ? 3 : 2}
                className="transition-all duration-200"
              />

              {r.w > 60 && r.h > 40 && (
                <>
                  <text
                    x={r.x + 12}
                    y={r.y + 22}
                    fontSize="12"
                    fontWeight="bold"
                    fill="#FFFFFF"
                    className="select-none"
                  >
                    {r.pt.label}
                  </text>
                  <text
                    x={r.x + 12}
                    y={r.y + 40}
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="monospace"
                    fill="#FFFFFF"
                    className="select-none"
                  >
                    {currencyPrefix}{formatChartValue(r.pt.value)} ({pct}%)
                  </text>
                  {profit !== null && r.h > 65 && (
                    <text
                      x={r.x + 12}
                      y={r.y + 58}
                      fontSize="10"
                      fill="#E2E8F0"
                      className="select-none"
                    >
                      Profit: {currencyPrefix}{formatChartValue(profit)}
                    </text>
                  )}
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// =========================================================================
// 6. SvgComboChart — Dual-Axis Monthly Sales (Bars) & Profit (Line)
// =========================================================================
export function SvgComboChart({
  chart,
  activeFilter,
  onSelectFilter,
  isDark,
  palette,
  currencyPrefix = '$',
}: UniversalChartVisualProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const data = chart.data;

  const svgWidth = 640;
  const svgHeight = 220;
  const pad = { top: 20, right: 54, bottom: 38, left: 54 };
  const plotW = svgWidth - pad.left - pad.right;
  const plotH = svgHeight - pad.top - pad.bottom;

  const salesVals = data.map((d) => (Number.isFinite(d.value) ? d.value : 0));
  const profitVals = data.map((d) => (d.secondaryValue !== undefined && Number.isFinite(d.secondaryValue) ? d.secondaryValue : 0));

  const maxSales = Math.max(...salesVals, 1) * 1.15;
  const maxProfit = Math.max(...profitVals, 1) * 1.25;

  const getX = (idx: number) => pad.left + (idx / Math.max(data.length - 1, 1)) * plotW;
  const getYSales = (val: number) => pad.top + plotH - (val / maxSales) * plotH;
  const getYProfit = (val: number) => pad.top + plotH - (val / maxProfit) * plotH;

  const barWidth = Math.max(3, (plotW / data.length) * 0.55);

  const profitPoints = data.map((d, i) => ({
    x: getX(i),
    y: getYProfit(d.secondaryValue || 0),
    label: d.label,
    profit: d.secondaryValue || 0,
    sales: d.value,
    idx: i,
  }));

  const linePath = profitPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
  const xStride = data.length > 24 ? 4 : data.length > 16 ? 3 : data.length > 8 ? 2 : 1;
  const hovered = hoveredIdx !== null ? profitPoints[hoveredIdx] : null;

  return (
    <div className="relative w-full">
      <div className="h-6 flex justify-between items-center text-xs mb-1 px-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-sky-400">
            <span className="w-2.5 h-2.5 rounded bg-sky-500" /> Net Sales (Bars, Left)
          </span>
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Gross Profit (Line, Right)
          </span>
        </div>
        {hovered && (
          <span className={`text-[11px] font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {formatAxisDate(hovered.label)}: Sales {currencyPrefix}{formatChartValue(hovered.sales)} | Profit {currencyPrefix}{formatChartValue(hovered.profit)}
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible select-none"
        role="img"
        aria-label="Combo Chart Dual Axis"
      >
        {/* Left Y ticks (Sales) */}
        {[0, 0.5, 1].map((pct, idx) => {
          const val = pct * maxSales;
          const y = getYSales(val);
          return (
            <g key={idx}>
              <line x1={pad.left} y1={y} x2={pad.left + plotW} y2={y} stroke={isDark ? '#26354A' : '#DCE3EC'} strokeDasharray="3 3" />
              <text x={pad.left - 6} y={y + 3.5} textAnchor="end" fontSize="8.5" fontFamily="monospace" fill={palette.primary}>
                {currencyPrefix}{formatChartValue(val)}
              </text>
            </g>
          );
        })}

        {/* Right Y ticks (Profit) */}
        {[0, 0.5, 1].map((pct, idx) => {
          const val = pct * maxProfit;
          const y = getYProfit(val);
          return (
            <text key={idx} x={pad.left + plotW + 6} y={y + 3.5} textAnchor="start" fontSize="8.5" fontFamily="monospace" fill="#10B981">
              {currencyPrefix}{formatChartValue(val)}
            </text>
          );
        })}

        {/* Sales Bars */}
        {data.map((d, i) => {
          const x = getX(i) - barWidth / 2;
          const y = getYSales(d.value);
          const h = pad.top + plotH - y;
          const isSelected = activeFilter && activeFilter.field === chart.dimensionLabel && activeFilter.value === d.label;

          return (
            <rect
              key={d.label}
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(1, h)}
              rx="2"
              fill={isSelected ? '#38BDF8' : isDark ? '#1E3A8A' : '#93C5FD'}
              opacity={hoveredIdx === i ? 1 : 0.85}
              className="cursor-pointer transition-all"
              onClick={() => onSelectFilter(chart.dimensionLabel, d.label)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          );
        })}

        {/* Profit Line */}
        <path d={linePath} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Profit Dots */}
        {profitPoints.map((p) => (
          <circle
            key={p.label}
            cx={p.x}
            cy={p.y}
            r={hoveredIdx === p.idx ? 5 : 3}
            fill="#10B981"
            stroke={isDark ? '#111B2E' : '#FFFFFF'}
            strokeWidth="1.5"
            className="cursor-pointer"
            onClick={() => onSelectFilter(chart.dimensionLabel, p.label)}
            onMouseEnter={() => setHoveredIdx(p.idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          />
        ))}

        {/* X Ticks */}
        {data.map((d, i) => {
          if (i % xStride !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={d.label}
              x={getX(i)}
              y={pad.top + plotH + 18}
              textAnchor="middle"
              fontSize="9"
              fill={isDark ? '#A8B6C9' : '#52637B'}
            >
              {formatAxisDate(d.label)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// =========================================================================
// 7. SvgStackedColumnChart — Fulfillment Status by Sales Channel
// =========================================================================
export function SvgStackedColumnChart({
  chart,
  activeFilter,
  onSelectFilter,
  isDark,
  palette,
}: UniversalChartVisualProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const data = chart.data;

  // Extract channels and statuses
  const channels = Array.from(new Set(data.map((d) => d.stackGroup || d.label.split(' - ')[0])));
  const statuses = Array.from(new Set(data.map((d) => d.label.includes(' - ') ? d.label.split(' - ')[1] : d.label)));

  // Aggregate matrix: channel -> status -> value
  const matrix: Record<string, Record<string, number>> = {};
  channels.forEach((c) => {
    matrix[c] = {};
    statuses.forEach((s) => { matrix[c][s] = 0; });
  });

  data.forEach((d) => {
    const ch = d.stackGroup || d.label.split(' - ')[0];
    const st = d.label.includes(' - ') ? d.label.split(' - ')[1] : d.label;
    if (matrix[ch]) {
      matrix[ch][st] = (matrix[ch][st] || 0) + d.value;
    }
  });

  const totals = channels.map((c) => statuses.reduce((sum, s) => sum + (matrix[c]?.[s] || 0), 0));
  const maxTotal = Math.max(...totals, 1) * 1.1;

  const svgWidth = 520;
  const svgHeight = 220;
  const pad = { top: 20, right: 24, bottom: 40, left: 50 };
  const plotW = svgWidth - pad.left - pad.right;
  const plotH = svgHeight - pad.top - pad.bottom;

  const colWidth = (plotW / channels.length) * 0.55;

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs mb-2 px-1">
        {statuses.map((st, idx) => (
          <span key={st} className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: palette.series[idx % palette.series.length] }} />
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{st}</span>
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible select-none"
        role="img"
        aria-label="Stacked Column Chart"
      >
        {/* Y ticks */}
        {[0, 0.5, 1].map((pct, idx) => {
          const val = pct * maxTotal;
          const y = pad.top + plotH - (val / maxTotal) * plotH;
          return (
            <g key={idx}>
              <line x1={pad.left} y1={y} x2={pad.left + plotW} y2={y} stroke={isDark ? '#26354A' : '#DCE3EC'} strokeDasharray="3 3" />
              <text x={pad.left - 6} y={y + 3.5} textAnchor="end" fontSize="9" fontFamily="monospace" fill={isDark ? '#A8B6C9' : '#52637B'}>
                {formatChartValue(val)}
              </text>
            </g>
          );
        })}

        {/* Stacked columns */}
        {channels.map((ch, chIdx) => {
          const x = pad.left + chIdx * (plotW / channels.length) + (plotW / channels.length - colWidth) / 2;
          let runningY = pad.top + plotH;

          return (
            <g key={ch}>
              {statuses.map((st, stIdx) => {
                const count = matrix[ch]?.[st] || 0;
                const segH = (count / maxTotal) * plotH;
                const y = runningY - segH;
                runningY = y;
                const color = palette.series[stIdx % palette.series.length];
                const segKey = `${ch}-${st}`;
                const isHovered = hoveredSegment === segKey;

                return (
                  <rect
                    key={st}
                    x={x}
                    y={y}
                    width={colWidth}
                    height={Math.max(1, segH)}
                    fill={color}
                    opacity={isHovered ? 1 : 0.9}
                    stroke={isDark ? '#111B2E' : '#FFFFFF'}
                    strokeWidth={isHovered ? 1.5 : 0.5}
                    className="cursor-pointer transition-all"
                    onClick={() => onSelectFilter(chart.dimensionLabel, ch)}
                    onMouseEnter={() => setHoveredSegment(segKey)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                );
              })}

              {/* Channel X label */}
              <text
                x={x + colWidth / 2}
                y={pad.top + plotH + 18}
                textAnchor="middle"
                fontSize="10"
                fontWeight="500"
                fill={isDark ? '#A8B6C9' : '#52637B'}
              >
                {ch}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// =========================================================================
// 8. SvgScatterBubbleChart — Product Revenue Scale vs Margin %
// =========================================================================
export function SvgScatterBubbleChart({
  chart,
  activeFilter,
  onSelectFilter,
  isDark,
  palette,
  currencyPrefix = '$',
}: UniversalChartVisualProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const data = chart.data;

  const svgWidth = 580;
  const svgHeight = 220;
  const pad = { top: 20, right: 30, bottom: 40, left: 54 };
  const plotW = svgWidth - pad.left - pad.right;
  const plotH = svgHeight - pad.top - pad.bottom;

  const xVals = data.map((d) => d.value);
  const yVals = data.map((d) => d.secondaryValue || 0);
  const rVals = data.map((d) => d.tertiaryValue || 100);

  const minX = 0;
  const maxX = Math.max(...xVals, 1) * 1.1;
  const minY = 0;
  const maxY = Math.max(...yVals, 1) * 1.25;
  const maxR = Math.max(...rVals, 1);

  const getX = (val: number) => pad.left + (val / maxX) * plotW;
  const getY = (val: number) => pad.top + plotH - (val / maxY) * plotH;
  const getRadius = (val: number) => Math.max(5, Math.min(18, (val / maxR) * 16 + 5));

  const hoveredPt = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="relative w-full">
      <div className="h-6 flex justify-between items-center text-xs mb-1 px-1">
        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
          X: Net Sales • Y: Profit Margin % (Ratio-of-Sums) • Bubble Size: Volume
        </span>
        {hoveredPt && (
          <span className={`font-mono font-bold ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>
            {hoveredPt.label}: {currencyPrefix}{formatChartValue(hoveredPt.value)} | Margin: {hoveredPt.secondaryValue}% | Units: {hoveredPt.tertiaryValue?.toLocaleString()}
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible select-none"
        role="img"
        aria-label="Product Scatter Chart"
      >
        {/* Y ticks (Margin %) */}
        {[0, 0.5, 1].map((pct, idx) => {
          const val = pct * maxY;
          const y = getY(val);
          return (
            <g key={idx}>
              <line x1={pad.left} y1={y} x2={pad.left + plotW} y2={y} stroke={isDark ? '#26354A' : '#DCE3EC'} strokeDasharray="3 3" />
              <text x={pad.left - 6} y={y + 3.5} textAnchor="end" fontSize="9" fontFamily="monospace" fill={isDark ? '#A8B6C9' : '#52637B'}>
                {val.toFixed(0)}%
              </text>
            </g>
          );
        })}

        {/* X ticks (Sales) */}
        {[0, 0.5, 1].map((pct, idx) => {
          const val = pct * maxX;
          const x = getX(val);
          return (
            <g key={idx}>
              <line x1={x} y1={pad.top} x2={x} y2={pad.top + plotH} stroke={isDark ? '#26354A' : '#DCE3EC'} strokeDasharray="3 3" />
              <text x={x} y={pad.top + plotH + 16} textAnchor="middle" fontSize="9" fontFamily="monospace" fill={isDark ? '#A8B6C9' : '#52637B'}>
                {currencyPrefix}{formatChartValue(val)}
              </text>
            </g>
          );
        })}

        {/* Scatter Bubbles */}
        {data.map((pt, idx) => {
          const x = getX(pt.value);
          const y = getY(pt.secondaryValue || 0);
          const r = getRadius(pt.tertiaryValue || 100);
          const isSelected = activeFilter && activeFilter.field === chart.dimensionLabel && activeFilter.value === pt.label;
          const color = palette.series[idx % palette.series.length];

          return (
            <g
              key={pt.label}
              onClick={() => onSelectFilter(chart.dimensionLabel, pt.label)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={color}
                opacity={isSelected ? 1 : hoveredIdx === idx ? 0.95 : 0.75}
                stroke={isSelected ? '#38BDF8' : isDark ? '#111B2E' : '#FFFFFF'}
                strokeWidth={isSelected ? 2.5 : 1.5}
                className="transition-all duration-150"
              />
              <text
                x={x}
                y={y + 3.5}
                textAnchor="middle"
                fontSize="8"
                fontWeight="bold"
                fill="#FFFFFF"
                className="select-none pointer-events-none"
              >
                {pt.label.slice(0, 3)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// =========================================================================
// 9. SvgHeatmapChart — Regional Revenue Heatmap (Month vs Region)
// =========================================================================
export function SvgHeatmapChart({
  chart,
  activeFilter,
  onSelectFilter,
  isDark,
  currencyPrefix = '$',
}: UniversalChartVisualProps) {
  const [hoveredCell, setHoveredCell] = useState<{ month: string; region: string; val: number } | null>(null);
  const data = chart.data;

  // Extract regions and months
  const regions = ['South', 'North', 'East', 'West'];
  const months = Array.from(new Set(data.map((d) => d.label.split(' - ')[0]))).sort();

  // Matrix: month -> region -> value
  const matrix: Record<string, Record<string, number>> = {};
  data.forEach((d) => {
    const parts = d.label.split(' - ');
    const m = parts[0];
    const r = d.stackGroup || parts[1] || 'Unknown';
    if (!matrix[m]) matrix[m] = {};
    matrix[m][r] = d.value;
  });

  const maxVal = Math.max(...data.map((d) => d.value), 1);

  const svgWidth = 620;
  const svgHeight = 220;
  const pad = { top: 20, right: 20, bottom: 40, left: 60 };
  const plotW = svgWidth - pad.left - pad.right;
  const plotH = svgHeight - pad.top - pad.bottom;

  const cellW = plotW / Math.max(months.length, 1);
  const cellH = plotH / regions.length;
  const xStride = months.length > 20 ? 4 : months.length > 12 ? 3 : 2;

  return (
    <div className="relative w-full">
      <div className="h-6 flex justify-between items-center text-xs mb-1 px-1">
        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
          Color density scales with Net Sales • Click cell to cross-filter by region
        </span>
        {hoveredCell && (
          <span className={`font-mono font-bold ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>
            {formatAxisDate(hoveredCell.month)} • {hoveredCell.region}: {currencyPrefix}{formatChartValue(hoveredCell.val)}
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible select-none"
        role="img"
        aria-label="Heatmap Matrix"
      >
        {regions.map((reg, rIdx) => {
          const y = pad.top + rIdx * cellH;
          return (
            <g key={reg}>
              {/* Region Label */}
              <text
                x={pad.left - 8}
                y={y + cellH / 2 + 3.5}
                textAnchor="end"
                fontSize="9.5"
                fontWeight="bold"
                fill={isDark ? '#F4F7FC' : '#172033'}
              >
                {reg}
              </text>

              {/* Month Cells */}
              {months.map((m, mIdx) => {
                const x = pad.left + mIdx * cellW;
                const val = matrix[m]?.[reg] || 0;
                const intensity = Math.min(1, Math.max(0.08, val / maxVal));

                return (
                  <rect
                    key={m}
                    x={x + 0.5}
                    y={y + 0.5}
                    width={cellW - 1}
                    height={cellH - 1}
                    rx="2"
                    fill={isDark ? '#38BDF8' : '#0284C7'}
                    opacity={intensity}
                    className="cursor-pointer transition-all duration-150 hover:stroke-white hover:stroke-1"
                    onClick={() => onSelectFilter('Region', reg)}
                    onMouseEnter={() => setHoveredCell({ month: m, region: reg, val })}
                    onMouseLeave={() => setHoveredCell(null)}
                  />
                );
              })}
            </g>
          );
        })}

        {/* X Ticks (Months) */}
        {months.map((m, mIdx) => {
          if (mIdx % xStride !== 0 && mIdx !== months.length - 1) return null;
          const x = pad.left + mIdx * cellW + cellW / 2;
          return (
            <text
              key={m}
              x={x}
              y={pad.top + plotH + 18}
              textAnchor="middle"
              fontSize="8.5"
              fill={isDark ? '#A8B6C9' : '#52637B'}
            >
              {formatAxisDate(m)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// =========================================================================
// Dispatcher: UniversalChartRenderer
// =========================================================================
export function UniversalChartRenderer(props: UniversalChartVisualProps) {
  const { chart } = props;

  switch (chart.chartType) {
    case 'area':
    case 'line':
      return <SvgLineAreaChart {...props} />;
    case 'donut':
    case 'pie':
      return <SvgDonutChart {...props} />;
    case 'horizontal_bar':
      return <SvgHorizontalBarChart {...props} />;
    case 'waterfall':
      return <SvgFinancialWaterfallChart {...props} />;
    case 'treemap':
      return <SvgTreemapChart {...props} />;
    case 'combo':
      return <SvgComboChart {...props} />;
    case 'stacked_column':
      return <SvgStackedColumnChart {...props} />;
    case 'scatter':
      return <SvgScatterBubbleChart {...props} />;
    case 'heatmap':
    case 'matrix':
      return <SvgHeatmapChart {...props} />;
    case 'bar':
    default:
      return <SvgHorizontalBarChart {...props} />;
  }
}
