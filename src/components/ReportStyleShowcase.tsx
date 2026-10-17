import React, { useState } from 'react';
import { ZoomIn, Play, ExternalLink, X, Maximize2, Sparkles, Check } from 'lucide-react';
import { REPORT_PALETTES, ReportPalette } from '../types/amazonPalettes';
import { AmazonSalesDashboard } from './AmazonSalesDashboard';

interface ReportStyleShowcaseProps {
  onOpenLiveReport: () => void;
}

export const ReportStyleShowcase: React.FC<ReportStyleShowcaseProps> = ({ onOpenLiveReport }) => {
  const [activePaletteKey, setActivePaletteKey] = useState<string>('blue');
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);

  const activePalette: ReportPalette = REPORT_PALETTES[activePaletteKey] || REPORT_PALETTES.blue;
  const paletteKeys = Object.keys(REPORT_PALETTES);

  return (
    <section id="report-showcase" className="w-full bg-[#090b0e] border border-[#1f242d] rounded-3xl p-6 sm:p-10 shadow-2xl text-white space-y-8 my-4">
      {/* ========================================================================= */}
      {/* SECTION HEADER                                                            */}
      {/* ========================================================================= */}
      <div className="max-w-4xl space-y-3">
        <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-[#ff6b4a]">
          <span className="w-2 h-2 rounded-full bg-[#ff6b4a] animate-pulse" />
          <span>SEE THE PRODUCT BEFORE YOU BUY</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.1] font-heading">
          One report structure.
          <span className="block italic font-serif font-normal text-[#f97316] text-3xl sm:text-5xl tracking-normal mt-1">
            Ten visual directions.
          </span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Choose a named style below, inspect the real dashboard image, and tap it to zoom. The text stays outside the image so it remains readable on mobile.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* MAIN SHOWCASE CONTAINER (DARK OBSIDIAN CARD)                             */}
      {/* ========================================================================= */}
      <div className="bg-[#101318] border border-[#232934] rounded-2xl p-3 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Top Control Bar: CHOOSE A REPORT STYLE + 10 Palette Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#1e232b]">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400 shrink-0">
            <span>CHOOSE A REPORT STYLE</span>
          </div>

          {/* 10 Palette Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {paletteKeys.map((key) => {
              const pal = REPORT_PALETTES[key];
              const isActive = activePaletteKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setActivePaletteKey(key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#181d24] text-white shadow-md border-2'
                      : 'bg-[#101317] text-slate-400 hover:text-slate-200 hover:bg-[#15191f] border border-[#222832]'
                  }`}
                  style={{
                    borderColor: isActive ? (key === 'black' ? '#ffffff' : pal.dotColor) : undefined,
                  }}
                  title={`Switch to ${pal.name}`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{
                      backgroundColor: pal.dotColor,
                      border: key === 'black' ? '1px solid #71717a' : undefined,
                    }}
                  />
                  <span>{pal.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Interactive Dashboard Preview Canvas */}
        <div
          onClick={() => setIsZoomModalOpen(true)}
          className="relative group cursor-pointer rounded-xl overflow-hidden border border-[#262c36] shadow-inner transition-transform duration-200"
          title="Click to inspect full resolution dashboard"
        >
          <AmazonSalesDashboard
            palette={activePalette}
            activePaletteKey={activePaletteKey}
            onPaletteChange={(key) => setActivePaletteKey(key)}
            isCompact={true}
            onOpenLiveReport={onOpenLiveReport}
          />

          {/* Subtle Hover Overlay to encourage inspecting */}
          <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg border border-white/20 backdrop-blur-xs">
              <ZoomIn size={13} />
              <span>Click to Zoom &amp; Inspect</span>
            </span>
          </div>
        </div>

        {/* Bottom Bar: Style Name, Description, Zoom Trigger & Live Report Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-5 mt-4 border-t border-[#1e232b]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                {activePalette.name}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                {activePalette.tagline}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              {activePalette.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            {/* Inspect / Zoom button */}
            <button
              onClick={() => setIsZoomModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ZoomIn size={14} className="text-[#f97316]" />
              <span className="uppercase tracking-wider">TAP IMAGE TO INSPECT</span>
            </button>

            {/* Try a live report button (Yellow accent matching snapshot) */}
            <button
              onClick={onOpenLiveReport}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#facc15] hover:bg-[#eab308] active:scale-[0.98] text-slate-950 font-extrabold text-xs tracking-tight shadow-lg shadow-yellow-500/20 transition-all cursor-pointer w-full sm:w-auto"
            >
              <Play size={13} className="fill-slate-950" />
              <span>Try a live report</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL-SCREEN ZOOM / HIGH RESOLUTION INSPECTION MODAL                       */}
      {/* ========================================================================= */}
      {isZoomModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <div
            className="w-full max-w-6xl max-h-[92vh] bg-[#0c0f13] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#13181f]">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: activePalette.dotColor }}
                />
                <h3 className="text-sm font-bold text-white font-heading">
                  High-Resolution Dashboard Inspector — {activePalette.name}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsZoomModalOpen(false);
                    onOpenLiveReport();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#facc15] text-slate-950 text-xs font-bold hover:bg-yellow-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Play size={11} className="fill-slate-950" />
                  <span>Open Full Dashboard</span>
                </button>
                <button
                  onClick={() => setIsZoomModalOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Close inspector"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body: Full resolution scrollable dashboard */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(92vh-70px)] bg-[#090b0e]">
              <AmazonSalesDashboard
                palette={activePalette}
                activePaletteKey={activePaletteKey}
                onPaletteChange={(key) => setActivePaletteKey(key)}
                isCompact={false}
                onOpenLiveReport={onOpenLiveReport}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
