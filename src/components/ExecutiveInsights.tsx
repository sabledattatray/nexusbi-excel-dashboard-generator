import React from 'react';
import {
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Target,
  ShieldCheck,
  Award,
  ArrowUpRight,
  Sparkles,
  FileText,
} from 'lucide-react';
import { generateRealisticDataset } from '../utils/dataGenerator';

interface ExecutiveInsightsProps {
  data: ReturnType<typeof generateRealisticDataset>;
  selectedRegion: string;
}

export const ExecutiveInsights: React.FC<ExecutiveInsightsProps> = ({
  data,
  selectedRegion,
}) => {
  const { kpi, regionalPerformance, categorySummaries, customerAccounts } = data;

  const topCategory = categorySummaries[0];
  const secondCategory = categorySummaries[1];
  const topRegion = regionalPerformance.find((r) => r.region === selectedRegion) || regionalPerformance[0];
  const optimalAccounts = customerAccounts.filter((a) => a.accountHealth === 'Optimal').length;
  const atRiskAccounts = customerAccounts.filter((a) => a.accountHealth === 'At Risk').length;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-950 border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Executive Strategic Intelligence & Diagnostic Memo
            </h3>
            <p className="text-xs text-slate-500">
              Automated corporate insights derived from {kpi.orderCount.toLocaleString()} transactions & ${ (kpi.totalRevenue / 1_000_000).toFixed(2) }M total volume
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-mono border border-slate-200">
            Scope: {selectedRegion === 'ALL' ? 'Global Enterprise' : selectedRegion}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-800 font-mono font-bold border border-emerald-500/30">
            Confidence: 99.4%
          </span>
        </div>
      </div>

      {/* 4 Diagnostic Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Growth Drivers */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-500/30 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Key Revenue Engine
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {topCategory ? `${(topCategory.sharePct * 100).toFixed(1)}% Share` : '38%'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">
              {topCategory?.category || 'Core Cloud Platform'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Drives <strong>${((topCategory?.revenue || 0) / 1000).toFixed(0)}k</strong> in gross revenue at a stellar{' '}
              <strong>{((topCategory?.marginPct || 0) * 100).toFixed(1)}%</strong> gross margin. High-value enterprise deployments outpaced projections by +14.2%.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200 text-[11px] text-sky-700 flex items-center gap-1 font-medium">
            <span>Action: Prioritize Q3 R&D expansion</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Pillar 2: Territory Quota Attainment */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Territory Attainment
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {topRegion ? `${(topRegion.quotaAttainmentPct * 100).toFixed(1)}%` : '104%'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">
              {topRegion?.region || 'North America'} Theater
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Under leadership of <strong>{topRegion?.regionalDirector || 'Victoria Sterling'}</strong>, bookings reached{' '}
              <strong>${((topRegion?.actualRevenue || 0) / 1000).toFixed(0)}k</strong> against a target of ${((topRegion?.targetRevenue || 0) / 1000).toFixed(0)}k.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
            <span>Status: Exceeding Annual Plan</span>
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Pillar 3: Margin Quality & Disciplined Pricing */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-500/30 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Unit Margin Spread
              </span>
              <span className="text-xs font-mono font-bold text-indigo-800">
                {(kpi.overallMarginPct * 100).toFixed(1)}% Net
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">
              Disciplined Discounting
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Average deal discount was held at <strong>6.8%</strong>, safeguarding operating profitability. Partner Ecosystem channels demonstrated highest blended margin efficiency.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200 text-[11px] text-indigo-700 flex items-center gap-1 font-medium">
            <span>+2.4 bps YoY Operating Spread</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Pillar 4: Portfolio Health & Retention Risk */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-500/30 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Account Retention Health
              </span>
              <span className="text-xs font-mono font-bold text-amber-800">
                {optimalAccounts} / {customerAccounts.length} Optimal
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">
              Renewal Vulnerability
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong>{atRiskAccounts} strategic accounts</strong> flagged with delayed Q3 renewal signals. Dedicated Executive Sponsor outreach recommended for renewal quarters 2026-Q1.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200 text-[11px] text-amber-700 flex items-center gap-1 font-medium">
            <span>Action: Schedule C-Suite Reviews</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* C-Level Executive Briefing Text */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
        <FileText className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-900">Quarterly Leadership Executive Summary:</strong> The portfolio exhibits exceptional commercial health with annualized gross revenue tracking at ${ (kpi.totalRevenue / 1_000_000).toFixed(2) }M and strong margin resilience ({ (kpi.overallMarginPct * 100).toFixed(1) }%). Demand across <em>{topCategory?.category}</em> remains the primary growth catalyst. Recommend allocating incremental sales headcount to the <em>EMEA</em> and <em>APAC</em> distribution hubs to accelerate secondary tier enterprise conversion while retaining tight discount thresholds.
        </div>
      </div>
    </div>
  );
};
