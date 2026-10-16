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
  ShieldCheck,
} from 'lucide-react';

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

          {/* Protected File Banner */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-start gap-3 text-emerald-950">
            <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold text-emerald-900">Protected Excel Workbook:</strong> Worksheets, charts, and formula cells are locked with password protection to preserve executive layout and formula integrity. Slicers and filter dropdowns remain interactive.
            </div>
          </div>

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
