import React from 'react';
import {
  CheckCircle2,
  FileSpreadsheet,
  Download,
  X,
  ExternalLink,
  Layers,
  Sparkles,
  BarChart,
  Table,
} from 'lucide-react';

interface DownloadSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string;
  rowCount: number;
  onReDownload: () => void;
}

export const DownloadSuccessModal: React.FC<DownloadSuccessModalProps> = ({
  isOpen,
  onClose,
  filename,
  rowCount,
  onReDownload,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-b border-emerald-500/20 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Excel (.xlsx) Generated Successfully!
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Your download has started automatically
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-300">
          {/* File Badge */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 font-mono">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-white font-bold truncate text-xs">{filename}</div>
              <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                Format: Microsoft Excel OpenXML Spreadsheet (.xlsx) • {rowCount.toLocaleString()} records
              </div>
            </div>
          </div>

          {/* Included Features Checklist */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Workbook Architecture &amp; Features Inside:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/80">
                <BarChart className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Real Native Excel Charts (Not Images!)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/80">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pie &amp; Horizontal Bar Charts</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/80">
                <Table className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Frozen Panes &amp; Dropdown Slicers</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/80">
                <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Live Excel Formulas (`=SUM`, `=AVG`, `=IF`)</span>
              </div>
            </div>
          </div>

          {/* Opening Tips */}
          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-200">How to open:</strong> You can open this file directly in <strong>Microsoft 365 / Excel</strong>, upload to <strong>Google Drive / Sheets</strong>, or view in <strong>Apple Numbers</strong>. All formulas, charts, and colors render natively.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onReDownload}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Again</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
