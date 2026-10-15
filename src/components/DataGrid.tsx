import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Database,
  Calculator,
} from 'lucide-react';
import { Transaction } from '../types/dataset';

interface DataGridProps {
  transactions: Transaction[];
  useLiveFormulas: boolean;
}

type SortField = keyof Transaction;

export const DataGrid: React.FC<DataGridProps> = ({ transactions, useLiveFormulas }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('orderDate');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedCellInfo, setSelectedCellInfo] = useState<{
    cellId: string;
    colName: string;
    value: string;
    formula?: string;
  }>({
    cellId: 'T3',
    colName: 'Gross Revenue',
    value: transactions[0] ? `$${transactions[0].revenue.toLocaleString()}` : '',
    formula: useLiveFormulas ? '=R3*Q3*(1-S3)' : undefined,
  });
  const [copied, setCopied] = useState(false);

  // Filtered & Sorted Transactions
  const filteredData = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.salesRep.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.country.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRegion = selectedRegion === 'ALL' || tx.region === selectedRegion;
      const matchChannel = selectedChannel === 'ALL' || tx.salesChannel === selectedChannel;

      return matchSearch && matchRegion && matchChannel;
    });
  }, [transactions, searchTerm, selectedRegion, selectedChannel]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortField, sortAsc]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleCellClick = (
    cellId: string,
    colName: string,
    value: string,
    formula?: string
  ) => {
    setSelectedCellInfo({ cellId, colName, value, formula });
  };

  // Export filtered CSV
  const handleExportCSV = () => {
    const headers = [
      'Transaction ID',
      'Date',
      'Customer',
      'Tier',
      'Region',
      'Country',
      'City',
      'Rep',
      'Channel',
      'Product SKU',
      'Product Name',
      'Category',
      'Unit Cost',
      'Unit Price',
      'Qty',
      'Discount %',
      'Revenue',
      'COGS',
      'Gross Profit',
      'Margin %',
      'Status',
    ];

    const rows = sortedData.map((t) => [
      t.id,
      t.orderDate,
      `"${t.customerName}"`,
      t.customerTier,
      t.region,
      `"${t.country}"`,
      `"${t.city}"`,
      `"${t.salesRep}"`,
      `"${t.salesChannel}"`,
      t.sku,
      `"${t.productName}"`,
      `"${t.productCategory}"`,
      t.unitCost,
      t.unitPrice,
      t.quantity,
      t.discountPct,
      t.revenue,
      t.cogs,
      t.grossProfit,
      t.marginPct,
      t.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sales_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyRowSample = () => {
    if (paginatedData.length > 0) {
      const sample = JSON.stringify(paginatedData.slice(0, 3), null, 2);
      navigator.clipboard.writeText(sample);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 shadow-lg overflow-hidden flex flex-col">
      {/* Top Filter and Search Bar */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by customer, SKU, rep, city, or ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Regions</option>
            <option value="North America">North America</option>
            <option value="EMEA">EMEA</option>
            <option value="APAC">APAC</option>
            <option value="LATAM">LATAM</option>
          </select>

          <select
            value={selectedChannel}
            onChange={(e) => {
              setSelectedChannel(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Channels</option>
            <option value="Direct Enterprise">Direct Enterprise</option>
            <option value="Partner Ecosystem">Partner Ecosystem</option>
            <option value="Inside Sales">Inside Sales</option>
            <option value="Online Enterprise">Online Enterprise</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            title="Download current filtered view as CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={copyRowSample}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            title="Copy JSON sample of visible rows"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'JSON'}</span>
          </button>
        </div>
      </div>

      {/* Simulated Excel Formula Bar */}
      <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-3 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-sky-400 font-bold min-w-[70px] justify-center">
          <span>{selectedCellInfo.cellId}</span>
        </div>

        <div className="flex items-center gap-1 text-slate-500 font-bold select-none">
          <Calculator className="w-3.5 h-3.5 text-emerald-400" />
          <span>fx</span>
        </div>

        <div className="flex-1 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded text-slate-200 overflow-x-auto truncate">
          {selectedCellInfo.formula ? (
            <span className="text-emerald-400 font-semibold">{selectedCellInfo.formula}</span>
          ) : (
            <span>{selectedCellInfo.value}</span>
          )}
          <span className="text-slate-500 ml-2 font-sans text-[11px]">
            ({selectedCellInfo.colName})
          </span>
        </div>

        <div className="text-[11px] font-sans text-slate-400 hidden md:block">
          Click any cell to inspect Excel formula / value
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="overflow-x-auto max-h-[580px] overflow-y-auto relative">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead className="bg-slate-800 text-slate-200 sticky top-0 z-10 border-b border-slate-700 select-none shadow-sm">
            <tr>
              <th className="py-2.5 px-3 font-semibold text-center w-12 bg-slate-800/90">#</th>
              <th
                onClick={() => handleSort('id')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:bg-slate-700/60"
              >
                <div className="flex items-center gap-1">
                  <span>Order ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('orderDate')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:bg-slate-700/60"
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('customerName')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:bg-slate-700/60"
              >
                <div className="flex items-center gap-1">
                  <span>Client Organization</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold">Tier</th>
              <th
                onClick={() => handleSort('region')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:bg-slate-700/60"
              >
                <div className="flex items-center gap-1">
                  <span>Region</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold">City, Country</th>
              <th className="py-2.5 px-3 font-semibold">Product</th>
              <th
                onClick={() => handleSort('unitPrice')}
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:bg-slate-700/60"
              >
                Price
              </th>
              <th
                onClick={() => handleSort('quantity')}
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:bg-slate-700/60"
              >
                Qty
              </th>
              <th className="py-2.5 px-3 font-semibold text-right">Disc %</th>
              <th
                onClick={() => handleSort('revenue')}
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:bg-slate-700/60 text-sky-300"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Gross Rev</span>
                  <ArrowUpDown className="w-3 h-3 text-sky-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('grossProfit')}
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:bg-slate-700/60 text-emerald-300"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Profit</span>
                  <ArrowUpDown className="w-3 h-3 text-emerald-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('marginPct')}
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:bg-slate-700/60"
              >
                Margin
              </th>
              <th className="py-2.5 px-3 font-semibold">Sales Rep</th>
              <th className="py-2.5 px-3 font-semibold text-center">Status</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-800/80 font-mono">
            {paginatedData.map((tx, idx) => {
              const rowIndex = (currentPage - 1) * pageSize + idx + 3; // Excel row numbering
              const isSelectedRow = selectedCellInfo.cellId.includes(String(rowIndex));

              return (
                <tr
                  key={tx.id}
                  className={`hover:bg-slate-800/50 transition-colors ${
                    isSelectedRow ? 'bg-slate-800/40' : ''
                  }`}
                >
                  <td className="py-2 px-3 text-slate-500 text-center font-sans text-[11px] bg-slate-950/40">
                    {rowIndex}
                  </td>
                  <td
                    onClick={() =>
                      handleCellClick(`A${rowIndex}`, 'Transaction ID', tx.id)
                    }
                    className="py-2 px-3 font-semibold text-sky-400 cursor-pointer hover:underline"
                  >
                    {tx.id}
                  </td>
                  <td
                    onClick={() =>
                      handleCellClick(`B${rowIndex}`, 'Order Date', tx.orderDate)
                    }
                    className="py-2 px-3 text-slate-300 cursor-pointer"
                  >
                    {tx.orderDate}
                  </td>
                  <td
                    onClick={() =>
                      handleCellClick(`E${rowIndex}`, 'Client Organization', tx.customerName)
                    }
                    className="py-2 px-3 font-sans font-medium text-white max-w-[200px] truncate cursor-pointer hover:text-sky-300"
                    title={tx.customerName}
                  >
                    {tx.customerName}
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-400 text-[11px] truncate">
                    {tx.customerTier.replace('Enterprise Strategic', 'Strategic')}
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-300">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        tx.region === 'North America'
                          ? 'bg-blue-500/10 text-blue-400'
                          : tx.region === 'EMEA'
                          ? 'bg-purple-500/10 text-purple-400'
                          : tx.region === 'APAC'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {tx.region}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-400 text-[11px] max-w-[140px] truncate">
                    {tx.city}
                  </td>
                  <td
                    className="py-2 px-3 font-sans text-slate-200 max-w-[180px] truncate"
                    title={`${tx.productName} (${tx.sku})`}
                  >
                    {tx.productName}
                  </td>
                  <td
                    onClick={() =>
                      handleCellClick(`Q${rowIndex}`, 'Unit Price', `$${tx.unitPrice}`)
                    }
                    className="py-2 px-3 text-right text-slate-300 cursor-pointer"
                  >
                    ${tx.unitPrice.toLocaleString()}
                  </td>
                  <td
                    onClick={() =>
                      handleCellClick(`R${rowIndex}`, 'Quantity', `${tx.quantity}`)
                    }
                    className="py-2 px-3 text-right text-slate-300 cursor-pointer"
                  >
                    {tx.quantity}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-400">
                    {(tx.discountPct * 100).toFixed(0)}%
                  </td>
                  <td
                    onClick={() =>
                      handleCellClick(
                        `T${rowIndex}`,
                        'Gross Revenue',
                        `$${tx.revenue.toLocaleString()}`,
                        useLiveFormulas ? `=R${rowIndex}*Q${rowIndex}*(1-S${rowIndex})` : undefined
                      )
                    }
                    className="py-2 px-3 text-right font-bold text-white cursor-pointer hover:bg-slate-700/50"
                  >
                    ${tx.revenue.toLocaleString()}
                  </td>
                  <td
                    onClick={() =>
                      handleCellClick(
                        `V${rowIndex}`,
                        'Gross Profit',
                        `$${tx.grossProfit.toLocaleString()}`,
                        useLiveFormulas ? `=T${rowIndex}-U${rowIndex}` : undefined
                      )
                    }
                    className="py-2 px-3 text-right font-bold text-emerald-400 cursor-pointer hover:bg-slate-700/50"
                  >
                    ${tx.grossProfit.toLocaleString()}
                  </td>
                  <td
                    onClick={() =>
                      handleCellClick(
                        `W${rowIndex}`,
                        'Margin %',
                        `${(tx.marginPct * 100).toFixed(1)}%`,
                        useLiveFormulas ? `=V${rowIndex}/T${rowIndex}` : undefined
                      )
                    }
                    className="py-2 px-3 text-right text-indigo-300 cursor-pointer"
                  >
                    {(tx.marginPct * 100).toFixed(1)}%
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-300 text-[11px] truncate">
                    {tx.salesRep}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-medium ${
                        tx.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
            <strong className="text-white">{sortedData.length.toLocaleString()}</strong> rows
          </span>
          {filteredData.length < transactions.length && (
            <span className="text-emerald-400">(Filtered from {transactions.length})</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
