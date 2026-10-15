import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Table2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Download,
  Info,
} from 'lucide-react';
import {
  parseUploadedFile,
  inferColumnMapping,
  buildDatasetFromUpload,
  RawParsedTable,
  ColumnMapping,
  ImportResult,
} from '../utils/dataImporter';
import { DatasetConfig } from '../types/dataset';

interface DataUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseConfig: DatasetConfig;
  onImportComplete: (result: ImportResult) => void;
}

export const DataUploadModal: React.FC<DataUploadModalProps> = ({
  isOpen,
  onClose,
  baseConfig,
  onImportComplete,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parsed state
  const [parsedTable, setParsedTable] = useState<RawParsedTable | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when opening/closing
  const handleClose = () => {
    setParsedTable(null);
    setMapping({});
    setErrorMsg(null);
    setIsProcessing(false);
    onClose();
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        await processFile(e.dataTransfer.files[0]);
      }
    },
    []
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    try {
      setIsProcessing(true);
      setErrorMsg(null);

      const table = await parseUploadedFile(file);

      if (table.totalRows === 0) {
        throw new Error('The selected file appears to be empty or has no readable data rows.');
      }

      const inferred = inferColumnMapping(table);
      setParsedTable(table);
      setMapping(inferred);
    } catch (err: any) {
      console.error('Error processing uploaded file:', err);
      setErrorMsg(err.message || 'Failed to read the file. Please ensure it is a valid CSV or Excel file.');
      setParsedTable(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    setMapping((prev) => ({
      ...prev,
      [field]: value === '__NONE__' ? undefined : value,
    }));
  };

  const handleGenerate = () => {
    if (!parsedTable) return;
    try {
      setIsProcessing(true);
      const result = buildDatasetFromUpload(parsedTable, mapping, baseConfig);
      onImportComplete(result);
      handleClose();
    } catch (err: any) {
      console.error('Failed to build dataset:', err);
      setErrorMsg(err.message || 'Failed to generate dashboard dataset from this mapping.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSample = () => {
    const csvContent = [
      'Date,Customer,Region,Channel,Product,Category,Quantity,Revenue,Cost,Profit,Status',
      '2024-01-15,Apex Global Financial,North America,Direct Enterprise,Cloud Kubernetes Cluster,Cloud Infrastructure,4,16800,5800,11000,Completed',
      '2024-02-18,Vanguard Biopharma,EMEA,Partner Ecosystem,Predictive AI Model,AI Solutions,2,11800,4200,7600,Completed',
      '2024-03-22,OmniStream Networks,APAC,Inside Sales,Zero-Trust Identity Suite,Enterprise Security,5,10750,3400,7350,Invoiced',
      '2024-04-10,Stratosphere Aerospace,LATAM,Online Enterprise,Lakehouse Analytics Node,Data Analytics,3,8550,2760,5790,Completed',
      '2024-05-14,Beacon Health Systems,North America,Direct Enterprise,DevOps Pipeline Suite,Developer Tools,8,8800,2720,6080,Delivered',
      '2024-06-20,Horizon Utilities,EMEA,Partner Ecosystem,Cloud Microservices Mesh,Cloud Infrastructure,6,9900,3060,6840,Completed',
      '2024-07-12,Pinnacle Logistics,APAC,Inside Sales,Compliance & Audit Radar,Enterprise Security,3,7200,2220,4980,Completed',
      '2024-08-25,Aegis Cyber Defense,LATAM,Direct Enterprise,Executive BI Automated Node,Data Analytics,4,6200,1920,4280,Completed',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_enterprise_sales_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Upload Data from Local Drive</span>
                <span className="text-xs px-2 py-0.5 rounded font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  CSV, Excel (.xlsx, .xls), TSV
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Import your own sales records or financial transactions to generate the complete interactive Excel workbook &amp; dashboard.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold">Import Error</div>
                <div className="mt-0.5">{errorMsg}</div>
              </div>
            </div>
          )}

          {/* STEP 1: Upload Dropzone (if no table loaded yet or replacing) */}
          {!parsedTable && (
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${
                  dragActive
                    ? 'border-emerald-400 bg-emerald-500/10 ring-4 ring-emerald-500/20 scale-[0.99]'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-950/40 hover:bg-slate-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.tsv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                  {isProcessing ? (
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-8 h-8" />
                  )}
                </div>

                <div className="space-y-1 max-w-md">
                  <div className="text-sm sm:text-base font-bold text-white">
                    {isProcessing ? 'Reading and parsing file...' : 'Drop your CSV or Excel file here, or browse local drive'}
                  </div>
                  <p className="text-xs text-slate-400">
                    Supports any transaction ledger, ERP export, Shopify, Stripe, Salesforce, QuickBooks, or custom spreadsheet format.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/30 transition flex items-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose File from Computer</span>
                  </button>
                </div>
              </div>

              {/* Sample template assist bar */}
              <div className="flex items-center justify-between text-xs text-slate-400 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-400" />
                  <span>Don't have a dataset ready? You can test with a sample CSV template:</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 font-medium flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: File Loaded - Review & Column Mapping */}
          {parsedTable && (
            <div className="space-y-6">
              {/* File Info Bar */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{parsedTable.fileName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono uppercase">
                        {parsedTable.fileType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {parsedTable.totalRows.toLocaleString()} rows detected • {parsedTable.headers.length} columns • {(parsedTable.fileSize / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setParsedTable(null);
                      setMapping({});
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-600 transition"
                  >
                    Upload Different File
                  </button>
                </div>
              </div>

              {/* Smart Auto-Detection Indicator */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Smart Column Mapping Active: </span>
                  We automatically mapped your columns based on names and content. You can fine-tune or reassign any field below before generating the Excel dashboard.
                </div>
              </div>

              {/* Mapping Grid */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span>Match Columns to BI Model Fields</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {/* Revenue */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-bold text-slate-300 flex items-center justify-between">
                      <span>Revenue / Amount *</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Core Metric</span>
                    </label>
                    <select
                      value={mapping.revenueCol || '__NONE__'}
                      onChange={(e) => handleMappingChange('revenueCol', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 font-medium focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                    >
                      <option value="__NONE__">— None (Auto-Estimate) —</option>
                      {parsedTable.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-bold text-slate-300 flex items-center justify-between">
                      <span>Transaction Date</span>
                      <span className="text-[10px] text-blue-400 font-mono">Monthly Trends</span>
                    </label>
                    <select
                      value={mapping.dateCol || '__NONE__'}
                      onChange={(e) => handleMappingChange('dateCol', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 font-medium focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                    >
                      <option value="__NONE__">— None (Auto-Distribute) —</option>
                      {parsedTable.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-bold text-slate-300 flex items-center justify-between">
                      <span>Product Category</span>
                      <span className="text-[10px] text-indigo-400 font-mono">Pie Chart</span>
                    </label>
                    <select
                      value={mapping.categoryCol || '__NONE__'}
                      onChange={(e) => handleMappingChange('categoryCol', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 font-medium focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                    >
                      <option value="__NONE__">— None (Auto-Infer) —</option>
                      {parsedTable.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Region */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-bold text-slate-300 flex items-center justify-between">
                      <span>Region / Theater</span>
                      <span className="text-[10px] text-purple-400 font-mono">Bar Chart</span>
                    </label>
                    <select
                      value={mapping.regionCol || '__NONE__'}
                      onChange={(e) => handleMappingChange('regionCol', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 font-medium focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                    >
                      <option value="__NONE__">— None (Global Theaters) —</option>
                      {parsedTable.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Channel */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-bold text-slate-300 flex items-center justify-between">
                      <span>Sales Channel</span>
                      <span className="text-[10px] text-amber-400 font-mono">Donut Chart</span>
                    </label>
                    <select
                      value={mapping.channelCol || '__NONE__'}
                      onChange={(e) => handleMappingChange('channelCol', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 font-medium focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                    >
                      <option value="__NONE__">— None (Direct/Partner Mix) —</option>
                      {parsedTable.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Customer */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-bold text-slate-300 flex items-center justify-between">
                      <span>Customer / Account</span>
                      <span className="text-[10px] text-sky-400 font-mono">Strategic Clients</span>
                    </label>
                    <select
                      value={mapping.customerCol || '__NONE__'}
                      onChange={(e) => handleMappingChange('customerCol', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 font-medium focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                    >
                      <option value="__NONE__">— None (Auto-Generate) —</option>
                      {parsedTable.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-bold text-slate-300 flex items-center justify-between">
                      <span>Quantity / Units</span>
                      <span className="text-[10px] text-slate-400 font-mono">Volume</span>
                    </label>
                    <select
                      value={mapping.quantityCol || '__NONE__'}
                      onChange={(e) => handleMappingChange('quantityCol', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 font-medium focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                    >
                      <option value="__NONE__">— None (Default 1) —</option>
                      {parsedTable.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Product */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-bold text-slate-300 flex items-center justify-between">
                      <span>Product / Item Name</span>
                      <span className="text-[10px] text-slate-400 font-mono">Catalog</span>
                    </label>
                    <select
                      value={mapping.productCol || '__NONE__'}
                      onChange={(e) => handleMappingChange('productCol', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 font-medium focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                    >
                      <option value="__NONE__">— None (Auto-Fill) —</option>
                      {parsedTable.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* Profit or Cost */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="font-bold text-slate-300 flex items-center justify-between">
                      <span>Profit or COGS</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Margins</span>
                    </label>
                    <select
                      value={mapping.profitCol || mapping.cogsCol || '__NONE__'}
                      onChange={(e) => handleMappingChange('profitCol', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 font-medium focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                    >
                      <option value="__NONE__">— None (Benchmark 48% Margin) —</option>
                      {parsedTable.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Table2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>File Sample Preview (First 5 Rows)</span>
                  </span>
                  <span className="text-slate-500 font-mono">
                    Showing {Math.min(5, parsedTable.rows.length)} of {parsedTable.totalRows} rows
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-x-auto max-h-48">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-800/80 text-slate-300 sticky top-0">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        {parsedTable.headers.map((h) => (
                          <th key={h} className="py-2 px-3 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {parsedTable.rows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="py-1.5 px-3 text-slate-500">{idx + 1}</td>
                          {parsedTable.headers.map((h) => (
                            <td key={h} className="py-1.5 px-3 whitespace-nowrap text-slate-200">
                              {row[h] !== undefined && row[h] !== null ? String(row[h]) : '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            Cancel
          </button>

          {parsedTable && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 border border-emerald-400/40 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing &amp; Synthesizing BI Model...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Dashboard &amp; Excel From My Data</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
