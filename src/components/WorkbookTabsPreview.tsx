import React from 'react';
import { Globe, Package, Users, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { generateRealisticDataset } from '../utils/dataGenerator';

interface WorkbookTabsPreviewProps {
  data: ReturnType<typeof generateRealisticDataset>;
  activeTab: 'regions' | 'products' | 'customers';
  useLiveFormulas: boolean;
}

export const WorkbookTabsPreview: React.FC<WorkbookTabsPreviewProps> = ({
  data,
  activeTab,
  useLiveFormulas,
}) => {
  const { regionalPerformance, productCatalog, customerAccounts, kpi } = data;

  if (activeTab === 'regions') {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              Sheet #3: Regional Quota Performance & Territorial Attainment
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-country consolidation, quota variance calculations, and operating margins.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded">
            Live Formulas Enabled: `=Actual-Target`, `=Actual/Target`
          </span>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto shadow-md">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-800 text-slate-200 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4 font-semibold">Global Region</th>
                <th className="py-3 px-4 font-semibold">Managing Director</th>
                <th className="py-3 px-4 font-semibold">Markets Covered</th>
                <th className="py-3 px-4 font-semibold text-right">Orders</th>
                <th className="py-3 px-4 font-semibold text-right">Target ($)</th>
                <th className="py-3 px-4 font-semibold text-right text-sky-400">Actual Revenue ($)</th>
                <th className="py-3 px-4 font-semibold text-right">Attainment %</th>
                <th className="py-3 px-4 font-semibold text-right text-emerald-400">Gross Profit ($)</th>
                <th className="py-3 px-4 font-semibold text-right">Margin %</th>
                <th className="py-3 px-4 font-semibold text-right">YoY Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {regionalPerformance.map((r, i) => {
                const isOver = r.quotaAttainmentPct >= 1;
                return (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-sans font-bold text-white">{r.region}</td>
                    <td className="py-3 px-4 font-sans text-slate-300">{r.regionalDirector}</td>
                    <td className="py-3 px-4 font-sans text-slate-400 text-[11px] max-w-[200px] truncate">
                      {r.countries}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">{r.orderCount}</td>
                    <td className="py-3 px-4 text-right text-slate-400">${r.targetRevenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-white">${r.actualRevenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          isOver ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {(r.quotaAttainmentPct * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      ${r.actualProfit.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-indigo-300">
                      {((r.actualProfit / r.actualRevenue) * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400">
                      +{(r.growthRateYoY * 100).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeTab === 'products') {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              Sheet #4: Product Catalog, Standard Costs & Margins
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              SKU directory with list pricing, warehouse inventory buffers, and lead times.
            </p>
          </div>
          <span className="text-xs font-mono text-purple-400 bg-purple-950 border border-purple-800 px-3 py-1 rounded">
            Formula: `=(ListPrice - Cost)/ListPrice`
          </span>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto shadow-md">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-800 text-slate-200 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4 font-semibold">Product SKU</th>
                <th className="py-3 px-4 font-semibold">Product Name</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-right">Standard Cost</th>
                <th className="py-3 px-4 font-semibold text-right text-sky-400">List Price</th>
                <th className="py-3 px-4 font-semibold text-right text-emerald-400">Target Margin %</th>
                <th className="py-3 px-4 font-semibold text-right">Lead Time</th>
                <th className="py-3 px-4 font-semibold text-right">Warehouse Stock</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {productCatalog.map((p, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-sky-400">{p.sku}</td>
                  <td className="py-3 px-4 font-sans font-medium text-white">{p.productName}</td>
                  <td className="py-3 px-4 font-sans text-slate-300">{p.category}</td>
                  <td className="py-3 px-4 text-right text-slate-400">${p.unitCost.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-white">${p.listPrice.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">
                    {(p.standardMarginPct * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300">{p.leadTimeDays} days</td>
                  <td className="py-3 px-4 text-right text-slate-200">{p.stockLevel} units</td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                        p.status === 'High Demand'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Customers
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-400" />
            Sheet #5: Strategic Client Accounts & Retention Scorecard
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Key enterprise customer lifetime revenue, health indicators, and contract renewal horizon.
          </p>
        </div>
        <span className="text-xs font-mono text-pink-400 bg-pink-950 border border-pink-800 px-3 py-1 rounded">
          {customerAccounts.length} Enterprise Portfolios
        </span>
      </div>

      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto shadow-md">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-800 text-slate-200 border-b border-slate-700">
            <tr>
              <th className="py-3 px-4 font-semibold">Account ID</th>
              <th className="py-3 px-4 font-semibold">Client Organization</th>
              <th className="py-3 px-4 font-semibold">Tier</th>
              <th className="py-3 px-4 font-semibold">Vertical Industry</th>
              <th className="py-3 px-4 font-semibold">Country</th>
              <th className="py-3 px-4 font-semibold">Executive Rep</th>
              <th className="py-3 px-4 font-semibold text-right">Orders</th>
              <th className="py-3 px-4 font-semibold text-right text-sky-400">Lifetime Revenue</th>
              <th className="py-3 px-4 font-semibold text-right text-emerald-400">Lifetime Profit</th>
              <th className="py-3 px-4 font-semibold text-center">Account Health</th>
              <th className="py-3 px-4 font-semibold text-center">Renewal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono">
            {customerAccounts.map((c, i) => (
              <tr key={i} className="hover:bg-slate-800/40">
                <td className="py-3 px-4 text-slate-400 font-bold">{c.customerId}</td>
                <td className="py-3 px-4 font-sans font-bold text-white">{c.customerName}</td>
                <td className="py-3 px-4 font-sans text-slate-300 text-[11px]">
                  {c.tier.replace('Enterprise Strategic', 'Strategic')}
                </td>
                <td className="py-3 px-4 font-sans text-slate-400">{c.industry}</td>
                <td className="py-3 px-4 font-sans text-slate-300">{c.country}</td>
                <td className="py-3 px-4 font-sans text-slate-300">{c.accountExecutive}</td>
                <td className="py-3 px-4 text-right text-slate-300">{c.totalOrders}</td>
                <td className="py-3 px-4 text-right font-bold text-white">${c.lifetimeRevenue.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-400">
                  ${c.lifetimeProfit.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-center font-sans">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      c.accountHealth === 'Optimal'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {c.accountHealth}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-slate-400">{c.contractRenewal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
