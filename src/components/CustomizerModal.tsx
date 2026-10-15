import React, { useState } from 'react';
import {
  X,
  LayoutTemplate,
  Check,
  Building2,
  FileSpreadsheet,
  BarChart3,
  Hash,
  Sparkles,
} from 'lucide-react';
import { DatasetConfig, IndustryType } from '../types/dataset';
import { INDUSTRY_PRESETS } from '../utils/dataGenerator';

interface CustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DatasetConfig;
  onSaveConfig: (newConfig: DatasetConfig) => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [industry, setIndustry] = useState<IndustryType>(config.industry);
  const [companyName, setCompanyName] = useState<string>(config.companyName);
  const [recordCount, setRecordCount] = useState<number>(config.recordCount);
  const [includeCharts, setIncludeCharts] = useState<boolean>(config.includeChartsInExcel);
  const [useFormulas, setUseFormulas] = useState<boolean>(config.useLiveExcelFormulas);

  if (!isOpen) return null;

  const handleIndustryChange = (ind: IndustryType) => {
    setIndustry(ind);
    // Suggest default company name for selected industry if unchanged or default
    if (INDUSTRY_PRESETS[ind]) {
      setCompanyName(INDUSTRY_PRESETS[ind].companyDefault);
    }
  };

  const handleApply = () => {
    onSaveConfig({
      ...config,
      industry,
      companyName: companyName.trim() || 'Enterprise Analytics Global Inc.',
      recordCount,
      includeChartsInExcel: includeCharts,
      useLiveExcelFormulas: useFormulas,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">12 Ready Dashboard Templates</h2>
              <p className="text-xs text-slate-500">Pick from 12 pre-built industry dashboard models with live formulas, or customize company branding.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600">
          {/* Industry Preset */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
              Select from 12 Ready Industry Templates
            </label>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(INDUSTRY_PRESETS) as IndustryType[]).map((indKey) => {
                const item = INDUSTRY_PRESETS[indKey];
                const isSelected = industry === indKey;
                return (
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    key={indKey}
                    onClick={() => handleIndustryChange(indKey)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between text-left ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500/80 text-emerald-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-200 text-slate-600'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-2">
                        <span>{item.name}</span>
                        {isSelected && <span className="text-[10px] bg-emerald-500/20 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">ACTIVE</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Organization / Company Name
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Global Systems Corp."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Will appear on the Excel workbook cover, worksheet title banners, and generated headers.
            </span>
          </div>

          {/* Record Volume */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Dataset volume (source records)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[250, 500, 1000, 2500].map((count) => {
                const isSel = recordCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setRecordCount(count)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold font-mono transition-all ${
                      isSel
                        ? 'bg-sky-500/15 border-sky-500 text-sky-800 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-200 text-slate-500'
                    }`}
                  >
                    {count.toLocaleString()} rows
                  </button>
                );
              })}
            </div>
          </div>

          {/* Excel Specific Options */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Excel Workbook Engine Configuration
            </label>

            <div
              onClick={() => setIncludeCharts(!includeCharts)}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-emerald-700" />
                <div>
                  <div className="font-semibold text-slate-900">Embed Visual Charts in Excel Sheet</div>
                  <div className="text-[11px] text-slate-500">
                    Includes editable charts of industry-specific grouped summaries. Full source rows are preserved.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={() => {}}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-white border-slate-200 cursor-pointer"
              />
            </div>

            <div
              onClick={() => setUseFormulas(!useFormulas)}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-sky-700" />
                <div>
                  <div className="font-semibold text-slate-900">Use Live Excel Mathematical Formulas</div>
                  <div className="text-[11px] text-slate-500">
                    Business KPIs recalculate from source rows. Chart summaries are export-time snapshots.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={useFormulas}
                onChange={() => {}}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-white border-slate-200 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
          >
            Apply & Regenerate Dataset
          </button>
        </div>
      </div>
    </div>
  );
};
