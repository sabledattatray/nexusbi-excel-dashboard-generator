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
  Lock,
} from 'lucide-react';
import { WORKBOOK_PROTECTION_PASSWORD } from '../utils/excelExporter';

interface DownloadSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string;
  rowCount: number;
  onReDownload: () => void;
  sourceBased?: boolean;
}

export const DownloadSuccessModal: React.FC<DownloadSuccessModalProps> = ({
  isOpen,
  onClose,
  filename,
  rowCount,
  onReDownload,
  sourceBased = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-emerald-500/40 rounded-2xl w-full max-w-lg shadow-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-50 via-white to-white border-b border-emerald-500/20 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Excel (.xlsx) Generated Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Your download has started automatically
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-600">
          {/* File Badge */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-slate-200 flex items-center gap-3 font-mono">
            <FileSpreadsheet className="w-6 h-6 text-emerald-700 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-slate-900 font-bold truncate text-xs">{filename}</div>
              <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                Format: Microsoft Excel OpenXML Spreadsheet (.xlsx) • {rowCount.toLocaleString()} records
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
                <span>Real Native Excel Charts (Not Images!)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{sourceBased ? 'Charts matched to available source fields' : 'Pie & Horizontal Bar Charts'}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <Table className="w-4 h-4 text-indigo-700 shrink-0" />
                <span>{sourceBased ? 'Original records & field verification' : 'Frozen Panes & Dropdown Slicers'}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <Layers className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{sourceBased ? 'Analysis snapshot with source-linked charts' : 'Live Excel Formulas (=SUM, =AVERAGE, =IF)'}</span>
              </div>
            </div>
          </div>

          {/* Password Protection Badge */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-950">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold text-amber-950">Password-Protected:</strong> Worksheets &amp; structure are locked to protect formulas and charts. <strong>Filter dropdowns remain fully interactive.</strong> Password to unprotect: <code className="px-1.5 py-0.5 rounded bg-amber-200/60 font-mono font-bold text-amber-950 text-[11px] select-all">{WORKBOOK_PROTECTION_PASSWORD}</code>
            </div>
          </div>

          {/* Opening Tips */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <strong className="text-slate-700">How to open:</strong> You can open this file directly in <strong>Microsoft 365 / Excel</strong>, upload to <strong>Google Drive / Sheets</strong>, or view in <strong>Apple Numbers</strong>. Chart support and appearance may vary between spreadsheet applications.
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
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
