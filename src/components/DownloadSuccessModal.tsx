import React from 'react';
import {
  CheckCircle2,
  FileSpreadsheet,
  Download,
  X,
  Layers,
  Sparkles,
  BarChart,
  Table,
  Lock,
  Unlock,
  Crown,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { UPI_PAYMENT_CONFIG } from '../utils/proLicenseManager';

interface DownloadSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string;
  rowCount: number;
  onReDownload: () => void;
  sourceBased?: boolean;
  isProUnlocked?: boolean;
  onOpenUnlockModal?: () => void;
}

export const DownloadSuccessModal: React.FC<DownloadSuccessModalProps> = ({
  isOpen,
  onClose,
  filename,
  rowCount,
  onReDownload,
  sourceBased = false,
  isProUnlocked = false,
  onOpenUnlockModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-emerald-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-emerald-500/20 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Excel (.xlsx) Generated Successfully!
                </h3>
                {isProUnlocked && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    👑 PRO UNLOCKED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Your download has started automatically
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs text-slate-600">
          {/* File Badge */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 font-mono">
            <FileSpreadsheet className="w-6 h-6 text-emerald-700 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-slate-900 font-bold truncate text-xs">{filename}</div>
              <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                Format: Microsoft Excel OpenXML (.xlsx) • {rowCount.toLocaleString()} records
              </div>
            </div>
          </div>

          {/* Included Features Checklist */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Workbook Architecture &amp; Features Inside:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <BarChart className="w-4 h-4 text-sky-700 shrink-0" />
                <span>Real Native Excel Charts</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{sourceBased ? 'Source-matched KPI visuals' : 'Pie & Horizontal Bar Charts'}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <Table className="w-4 h-4 text-indigo-700 shrink-0" />
                <span>{sourceBased ? 'Original records verification' : 'Frozen Panes & Dropdown Slicers'}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <Layers className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{sourceBased ? 'Live grouped summaries' : 'Live Excel Formulas (=SUM, =AVERAGE)'}</span>
              </div>
            </div>
          </div>

          {/* Protection Status Banner */}
          {isProUnlocked ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-start gap-3 text-emerald-950">
              <Unlock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="font-semibold text-emerald-900">100% Unlocked Pro File:</strong> All worksheets, formula cells, and chart objects are completely unlocked with zero password restrictions. You can freely edit formulas, modify charts, and white-label for your clients.
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-emerald-50/50 to-teal-50 border border-amber-300/80 shadow-xs space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-800 shrink-0 mt-0.5">
                  <Lock className="w-4 h-4 text-amber-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 font-bold text-xs">
                      Standard Protected Version
                    </strong>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Free Tier
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Formulas and charts are locked to preserve original layout integrity. Filter dropdowns remain interactive.
                  </p>
                </div>
              </div>

              {/* Upsell Call to Action Card */}
              <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[11px]">
                  <span className="font-bold text-slate-800 block">Want 100% Editable &amp; Unprotected Excel?</span>
                  <span className="text-slate-500">Single file for <strong>₹9</strong> · Unlimited Lifetime for <strong>₹49</strong></span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenUnlockModal?.();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>Unlock from ₹9</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Opening Tips */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Compatible with Microsoft Excel, Google Sheets, Apple Numbers &amp; LibreOffice.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onReDownload}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Again</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
