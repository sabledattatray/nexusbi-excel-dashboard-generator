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
  Layers,
  ChevronDown,
  Check,
  ShieldCheck,
  Tag,
  Hash,
  Calendar,
  DollarSign,
  PieChart,
} from 'lucide-react';
import {
  parseUploadedFile,
  inferColumnMapping,
  buildDatasetFromUpload,
  RawParsedTable,
  ColumnMapping,
  ImportResult,
  MAX_UPLOAD_FILE_SIZE_BYTES,
  MAX_UPLOAD_FILE_SIZE_MB,
} from '../utils/dataImporter';
import { DatasetConfig, IndustryType, ColumnDataType } from '../types/dataset';
import { getIndustryTheme, INDUSTRY_THEMES } from '../utils/industryTheme';

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
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>('general_business');
  const [activeView, setActiveView] = useState<'schema' | 'preview'>('schema');
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

      if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        throw new Error(
          `File size (${sizeMb} MB) exceeds the ${MAX_UPLOAD_FILE_SIZE_MB} MB limit for in-browser processing. Please upload a dataset under ${MAX_UPLOAD_FILE_SIZE_MB} MB (up to ~50,000 records) to ensure smooth performance and Excel formula recalculation.`
        );
      }

      const table = await parseUploadedFile(file);

      if (table.totalRows === 0) {
        throw new Error('The selected file appears to be empty or has no readable data rows.');
      }

      const inferred = inferColumnMapping(table);
      setParsedTable(table);
      setMapping(inferred);
      if (table.schema?.detectedIndustry) {
        setSelectedIndustry(table.schema.detectedIndustry);
      }
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
      // Pass the selected industry in baseConfig
      const result = buildDatasetFromUpload(parsedTable, mapping, {
        ...baseConfig,
        industry: selectedIndustry,
      });
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

  const currentTheme = getIndustryTheme(selectedIndustry);
  const schema = parsedTable?.schema;

  // Helper for type badges
  const renderTypeBadge = (type: ColumnDataType) => {
    switch (type) {
      case 'currency':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
            <DollarSign className="w-3 h-3" /> Currency
          </span>
        );
      case 'numeric':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-sky-500/10 text-sky-800 border border-sky-500/20">
            <Hash className="w-3 h-3" /> Number
          </span>
        );
      case 'percentage':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/10 text-indigo-800 border border-indigo-500/20">
            % Rate
          </span>
        );
      case 'date':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-700 border border-blue-500/20">
            <Calendar className="w-3 h-3" /> Date
          </span>
        );
      case 'categorical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/10 text-violet-800 border border-purple-500/20">
            <Tag className="w-3 h-3" /> Category
          </span>
        );
      case 'identifier':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-500/10 text-slate-500 border border-slate-500/20">
            ID Code
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-700/40 text-slate-600 border border-slate-200">
            Text
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-lg overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Import your data</span>
                <span className="text-xs px-2 py-0.5 rounded font-medium bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
                  CSV, Excel (.xlsx, .xls), TSV • Max 25 MB
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Choose your file, review its fields, and create your executive report.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close import dialog"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
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
                    : 'border-slate-200 hover:border-slate-500 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.tsv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 shadow-inner">
                  {isProcessing ? (
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-8 h-8" />
                  )}
                </div>

                <div className="space-y-1 max-w-md">
                  <div className="text-sm sm:text-base font-bold text-slate-900">
                    {isProcessing ? 'Inspecting column types & profiling schema...' : 'Drop your CSV or Excel file here, or browse local drive'}
                  </div>
                  <p className="text-xs text-slate-500">
                    Works with any dataset: Healthcare, Real Estate, Banking, SaaS, HR, Logistics, Education, Retail, or custom operations.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-medium">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      ⚡ Max File Size: 25 MB
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      📊 Up to 50,000 Records
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                      🔒 100% Client-Side Private
                    </span>
                  </div>
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
              <div className="flex items-center justify-between text-xs text-slate-500 p-3 rounded-xl bg-slate-100 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-700" />
                  <span>Don't have a dataset ready? You can test with a sample CSV template:</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sky-800 hover:text-slate-900 border border-slate-200 font-medium flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: File Loaded - Review, Detected Industry & Schema Inspection */}
          {parsedTable && (
            <div className="space-y-6">
              {/* File Info Bar */}
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>{parsedTable.fileName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-800 font-mono uppercase">
                        {parsedTable.fileType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {parsedTable.totalRows >= 50000 ? (
                        <span className="text-amber-800 font-medium">
                          50,000 records (optimized for browser speed &amp; live Excel formulas) • {parsedTable.headers.length} columns • {(parsedTable.fileSize / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      ) : (
                        <span>
                          {parsedTable.totalRows.toLocaleString()} records • {parsedTable.headers.length} columns • {(parsedTable.fileSize / 1024).toFixed(1)} KB
                        </span>
                      )}
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
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-600 hover:text-slate-900 border border-slate-600 transition"
                  >
                    Upload Different File
                  </button>
                </div>
              </div>

              {/* Detected Industry & Grading Banner */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: currentTheme.colors.primary }}
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Detected Industry Domain &amp; Color Grading
                      </div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{currentTheme.name}</span>
                        {schema?.industryConfidence && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                            {schema.industryConfidence}% Match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Industry override selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Report domain:</span>
                    <select
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value as IndustryType)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-900 font-medium focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                    >
                      {(Object.keys(INDUSTRY_THEMES) as IndustryType[]).map((ind) => (
                        <option key={ind} value={ind}>
                          {INDUSTRY_THEMES[ind].name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  {currentTheme.description} Available charts and summaries depend on your source fields. The selected domain is{' '}
                  <span className="font-semibold text-slate-700">{currentTheme.badge}</span> report context.
                </p>
              </div>

              {/* Tab Selector: Schema Inspection vs Sample Preview */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveView('schema')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      activeView === 'schema'
                        ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/30'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Data Types &amp; Column Inspection ({parsedTable.headers.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      activeView === 'preview'
                        ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/30'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Table2 className="w-3.5 h-3.5" />
                    <span>Raw Data Sample Preview</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-500">
                  Real columns preserved • No artificial field forcing
                </div>
              </div>

              {/* VIEW 1: DATA TYPES & SCHEMA INSPECTOR */}
              {activeView === 'schema' && schema && (
                <div className="space-y-4">
                  {/* Summary Type Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Rows</div>
                      <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                        {schema.totalRecords.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-[10px] text-emerald-700 uppercase font-semibold">Currency / Value</div>
                      <div className="text-sm font-bold text-emerald-800 font-mono mt-0.5">
                        {schema.columns.filter((c) => c.dataType === 'currency').length} cols
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-[10px] text-sky-700 uppercase font-semibold">Numeric / Count</div>
                      <div className="text-sm font-bold text-sky-800 font-mono mt-0.5">
                        {schema.columns.filter((c) => c.dataType === 'numeric').length} cols
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-[10px] text-violet-700 uppercase font-semibold">Categories</div>
                      <div className="text-sm font-bold text-violet-800 font-mono mt-0.5">
                        {schema.columns.filter((c) => c.dataType === 'categorical').length} cols
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-[10px] text-blue-700 uppercase font-semibold">Dates</div>
                      <div className="text-sm font-bold text-blue-700 font-mono mt-0.5">
                        {schema.columns.filter((c) => c.dataType === 'date').length} cols
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Identifiers</div>
                      <div className="text-sm font-bold text-slate-600 font-mono mt-0.5">
                        {schema.columns.filter((c) => c.dataType === 'identifier').length} cols
                      </div>
                    </div>
                  </div>

                  {/* Schema Inspector Table */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 font-semibold">Field Name</th>
                          <th className="py-2.5 px-3 font-semibold">Detected Data Type</th>
                          <th className="py-2.5 px-3 font-semibold">Distinct Values</th>
                          <th className="py-2.5 px-3 font-semibold">Sample Value</th>
                          <th className="py-2.5 px-3 font-semibold">Assigned Dashboard Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {schema.columns.map((col) => {
                          const isPrimaryMetric = mapping.primaryMetricCol === col.name;
                          const isSecondaryMetric = mapping.secondaryMetricCol === col.name;
                          const isCategory = mapping.primaryCategoryCol === col.name;
                          const isDimension = mapping.secondaryCategoryCol === col.name;
                          const isDate = mapping.dateCol === col.name;
                          const isEntity = mapping.entityCol === col.name;

                          return (
                            <tr key={col.name} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-bold text-slate-900 font-mono flex items-center gap-1.5">
                                <span>{col.name}</span>
                                {isPrimaryMetric && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-800 font-sans">
                                    Primary Value
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">{renderTypeBadge(col.dataType)}</td>
                              <td className="py-2.5 px-3 text-slate-500 font-mono">
                                {col.distinctCount.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 font-mono truncate max-w-[180px]">
                                {col.sampleValues[0] !== undefined ? String(col.sampleValues[0]) : '—'}
                              </td>
                              <td className="py-2.5 px-3">
                                <select
                                  value={
                                    isPrimaryMetric
                                      ? 'primaryMetric'
                                      : isSecondaryMetric
                                      ? 'secondaryMetric'
                                      : isCategory
                                      ? 'primaryCategory'
                                      : isDimension
                                      ? 'secondaryCategory'
                                      : isDate
                                      ? 'date'
                                      : isEntity
                                      ? 'entity'
                                      : '__DEFAULT__'
                                  }
                                  onChange={(e) => {
                                    const role = e.target.value;
                                    const roles: Record<string, keyof ColumnMapping> = { primaryMetric: 'primaryMetricCol', secondaryMetric: 'secondaryMetricCol', primaryCategory: 'primaryCategoryCol', secondaryCategory: 'secondaryCategoryCol', date: 'dateCol', entity: 'entityCol' };
                                    setMapping(prev => {
                                      const next = { ...prev };
                                      for (const key of Object.values(roles)) if (next[key] === col.name) next[key] = undefined;
                                      if (roles[role]) next[roles[role]] = col.name;
                                      return next;
                                    });
                                  }}
                                  className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-medium"
                                >
                                  <option value="__DEFAULT__">No assigned role</option>
                                  <option value="primaryMetric">Core Metric (Primary Value)</option>
                                  <option value="secondaryMetric">Secondary Numeric Measure</option>
                                  <option value="primaryCategory">Primary Category (Breakdowns)</option>
                                  <option value="secondaryCategory">Secondary Category</option>
                                  <option value="date">Time / Date (Monthly Trend)</option>
                                  <option value="entity">Entity / Account Name</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW 2: RAW DATA SAMPLE PREVIEW */}
              {activeView === 'preview' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Table2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>File Sample Preview (First 5 Rows)</span>
                    </span>
                    <span className="text-slate-500 font-mono">
                      Showing {Math.min(5, parsedTable.rows.length)} of {parsedTable.totalRows} rows
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-x-auto max-h-60">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-100 text-slate-600 sticky top-0">
                        <tr>
                          <th className="py-2 px-3">#</th>
                          {parsedTable.headers.map((h) => (
                            <th key={h} className="py-2 px-3 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-600">
                        {parsedTable.rows.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 text-slate-500">{idx + 1}</td>
                            {parsedTable.headers.map((h) => (
                              <td key={h} className="py-1.5 px-3 whitespace-nowrap text-slate-700">
                                {row[h] !== undefined && row[h] !== null ? String(row[h]) : '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cancel import"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold border border-slate-200 transition"
          >
            Cancel
          </button>

          {parsedTable && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl text-slate-900 text-xs sm:text-sm font-bold shadow-lg border flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                borderColor: currentTheme.colors.accent,
              }}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validating source fields...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate {currentTheme.badge} Dashboard &amp; Excel</span>
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
