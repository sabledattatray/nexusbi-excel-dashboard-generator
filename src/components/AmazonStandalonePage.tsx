import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  Download,
  Sparkles,
  Check,
  LayoutTemplate,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { REPORT_PALETTES, ReportPalette } from '../types/amazonPalettes';
import { AmazonSalesDashboard } from './AmazonSalesDashboard';

interface AmazonStandalonePageProps {
  onBackToHome: () => void;
  onDownloadExcel?: () => void;
}

export const AmazonStandalonePage: React.FC<AmazonStandalonePageProps> = ({
  onBackToHome,
  onDownloadExcel,
}) => {
  const [activePaletteKey, setActivePaletteKey] = useState<string>('blue');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const activePalette: ReportPalette = REPORT_PALETTES[activePaletteKey] || REPORT_PALETTES.blue;
  const paletteKeys = Object.keys(REPORT_PALETTES);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/amazon-sales-dashboard`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Navigation & Direct Link Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#dfe5da]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </button>
          <div className="h-4 w-px bg-slate-300" />
          <div className="text-xs text-slate-500 font-mono">
            <span>Marketplace Models</span>
            <span className="mx-1 text-slate-300">/</span>
            <strong className="text-slate-900 font-semibold">Amazon FBA Sales Performance</strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors cursor-pointer shadow-2xs"
            title="Copy direct link to this report"
          >
            {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
            <span>{copiedLink ? 'Link Copied!' : 'Share / Direct Link'}</span>
          </button>

          {onDownloadExcel && (
            <button
              onClick={onDownloadExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Download size={14} />
              <span>Download Excel Model</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Header for Amazon Sales Dashboard */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold tracking-wider uppercase mb-2">
            <ShoppingBag size={12} />
            <span>Interactive Amazon Seller &amp; Aggregator Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">
            Amazon Sales Performance &amp; Customer Retention Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            Multi-currency marketplace reporting tracking repeat buyer cohorts, customer lifetime value, FBA vs FBM unit velocity, and advertising ROI across 10 specialized design directions.
          </p>
        </div>

        {/* Model Specs Strip */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
          <div className="bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-700/80 text-xs font-mono flex items-center gap-2.5">
            <Sparkles size={14} className="text-amber-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Theme System</span>
              <span className="text-white font-bold text-xs">10 Visual Directions</span>
            </div>
          </div>
          <div className="bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-700/80 text-xs font-mono flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div>
              <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Full Screen</span>
              <span className="text-white font-bold text-xs">1-Click Responsive View</span>
            </div>
          </div>
        </div>
      </div>

      {/* The Full Interactive Amazon Dashboard */}
      <div className="shadow-lg border border-slate-200/80 rounded-2xl overflow-hidden">
        <AmazonSalesDashboard
          palette={activePalette}
          activePaletteKey={activePaletteKey}
          onPaletteChange={(key) => setActivePaletteKey(key)}
          isCompact={false}
        />
      </div>

      {/* Explanatory Features Strip for Amazon BI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-mono font-bold text-emerald-800 mb-1">01 · MULTI-MARKETPLACE COHORTS</div>
          <h3 className="text-sm font-bold text-slate-900 mb-1.5 font-heading">Cross-Border Country Benchmarks</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Consolidate sales from North America, Europe (DE, UK, FR, IT), and Asia-Pacific. Compare units sold, VAT-inclusive pricing, and country volume distributions.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-mono font-bold text-emerald-800 mb-1">02 · RETENTION &amp; PRIME METRICS</div>
          <h3 className="text-sm font-bold text-slate-900 mb-1.5 font-heading">Returning vs New vs VIP Prime</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Monitor repeat buyer loyalty over time with automated percentage breakdowns, average order values, and customer lifetime value trajectories.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-mono font-bold text-emerald-800 mb-1">03 · EXCEL FORMULA EXPORT</div>
          <h3 className="text-sm font-bold text-slate-900 mb-1.5 font-heading">Boardroom-Ready Spreadsheet</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Export every chart, pivot grouping, and customer ledger into an unlocked .xlsx file powered by live SUMIFS formulas and zero VBA dependencies.
          </p>
        </div>
      </div>
    </div>
  );
};
