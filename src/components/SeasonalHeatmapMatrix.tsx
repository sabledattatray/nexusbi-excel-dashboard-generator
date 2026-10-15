import React, { useState, useMemo } from 'react';
import { Calendar, Flame, Layers } from 'lucide-react';
import { Transaction, CategorySummary } from '../types/dataset';

interface SeasonalHeatmapMatrixProps {
  transactions: Transaction[];
  categories: CategorySummary[];
}

export const SeasonalHeatmapMatrix: React.FC<SeasonalHeatmapMatrixProps> = ({
  transactions,
  categories,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{
    quarter: string;
    category: string;
    revenue: number;
    profit: number;
  } | null>(null);

  // Distinct quarters
  const quarters = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.quarter))).sort();
  }, [transactions]);

  // Aggregate matrix: category -> quarter -> { revenue, profit }
  const matrixData = useMemo(() => {
    const map = new Map<string, Map<string, { revenue: number; profit: number }>>();
    let maxRev = 1;

    categories.forEach((cat) => {
      map.set(cat.category, new Map());
      quarters.forEach((q) => {
        map.get(cat.category)!.set(q, { revenue: 0, profit: 0 });
      });
    });

    transactions.forEach((tx) => {
      if (map.has(tx.productCategory) && map.get(tx.productCategory)!.has(tx.quarter)) {
        const item = map.get(tx.productCategory)!.get(tx.quarter)!;
        item.revenue += tx.revenue;
        item.profit += tx.grossProfit;
        if (item.revenue > maxRev) maxRev = item.revenue;
      }
    });

    return { map, maxRev };
  }, [transactions, categories, quarters]);

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Quarterly Category Velocity Heatmap
            </h3>
            <p className="text-xs text-slate-400">
              Seasonal performance matrix showing revenue concentration and acceleration across quarters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">Intensity:</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-slate-800" title="Low" />
            <span className="w-3 h-3 rounded bg-indigo-900/60" />
            <span className="w-3 h-3 rounded bg-indigo-700" />
            <span className="w-3 h-3 rounded bg-indigo-500" />
            <span className="w-3 h-3 rounded bg-emerald-500" title="Peak" />
          </div>
        </div>
      </div>

      {/* Hover Info Callout */}
      {hoveredCell && (
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs flex items-center justify-between animate-in fade-in">
          <div>
            <span className="font-bold text-white">{hoveredCell.category}</span>
            <span className="text-slate-400 ml-2">({hoveredCell.quarter}):</span>
          </div>
          <div className="font-mono text-right flex items-center gap-4">
            <span className="text-white font-bold">
              Rev: ${(hoveredCell.revenue / 1000).toFixed(1)}k
            </span>
            <span className="text-emerald-400 font-bold">
              Profit: ${(hoveredCell.profit / 1000).toFixed(1)}k
            </span>
            <span className="text-indigo-400 font-bold">
              Margin: {hoveredCell.revenue > 0 ? ((hoveredCell.profit / hoveredCell.revenue) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      )}

      {/* Heatmap Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="py-2.5 px-3 font-semibold text-slate-400 w-44">Product Category</th>
              {quarters.map((q) => (
                <th key={q} className="py-2.5 px-3 font-semibold text-center text-slate-300 font-mono">
                  {q}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {categories.map((cat) => (
              <tr key={cat.category} className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-bold text-slate-200 truncate max-w-[170px]" title={cat.category}>
                  {cat.category}
                </td>
                {quarters.map((q) => {
                  const cell = matrixData.map.get(cat.category)?.get(q) || { revenue: 0, profit: 0 };
                  const intensity = Math.min(1, cell.revenue / (matrixData.maxRev * 0.9));

                  // Calculate background color based on intensity
                  let bgColor = '#0f172a'; // slate-900
                  let textColor = '#64748b'; // slate-500
                  if (intensity > 0.8) {
                    bgColor = '#047857'; // emerald-700
                    textColor = '#ffffff';
                  } else if (intensity > 0.6) {
                    bgColor = '#4338ca'; // indigo-700
                    textColor = '#ffffff';
                  } else if (intensity > 0.35) {
                    bgColor = '#312e81'; // indigo-900
                    textColor = '#e0e7ff';
                  } else if (intensity > 0.1) {
                    bgColor = '#1e1b4b'; // indigo-950
                    textColor = '#94a3b8';
                  }

                  return (
                    <td
                      key={q}
                      onMouseEnter={() =>
                        setHoveredCell({
                          quarter: q,
                          category: cat.category,
                          revenue: cell.revenue,
                          profit: cell.profit,
                        })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                      className="py-2 px-3 text-center cursor-pointer transition-all duration-150 rounded"
                      style={{ backgroundColor: bgColor, color: textColor }}
                    >
                      <div className="font-bold">
                        ${(cell.revenue / 1000).toFixed(0)}k
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
