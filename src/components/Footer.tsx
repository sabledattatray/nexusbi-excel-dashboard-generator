import React from 'react';
import {
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Youtube,
  Linkedin,
  Cpu,
} from 'lucide-react';
import { ExcelLogo } from './ExcelLogo';

interface FooterProps {
  onSelectTab?: (tab: 'dashboard' | 'excel-preview' | 'pivot' | 'transactions' | 'regions' | 'products' | 'customers') => void;
  onOpenUploadModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenUploadModal }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="workspace-footer-custom bg-[#172b2a] text-[#b6c7c2] border-t border-[#29423b] pt-10 pb-8 px-4 sm:px-8 md:px-12 transition-all">
      <div className="max-w-7xl mx-auto">
        {/* Top Section with Brand & Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-[#29423b]">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-4">
            <a href="/" className="inline-block" title="excel.dattasable.com">
              <ExcelLogo size={30} tagline="excel.dattasable.com" />
            </a>
            <p className="text-xs text-[#8da69d] max-w-sm leading-relaxed">
              Automated Excel and Executive KPI Dashboard Generator. Transform raw CSV, XLSX files, or synthetic models into boardroom-ready spreadsheets with native live formulas and visual analytics.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://dattasable.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#203b35] hover:bg-[#284a43] text-emerald-300 text-xs font-medium border border-[#31574e] transition-colors"
                title="Visit Datta Sable's Official Website"
              >
                <Globe size={13} />
                <span>dattasable.com</span>
                <ExternalLink size={11} />
              </a>
              <a
                href="https://fabric.dattasable.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#19323d] hover:bg-[#224452] text-sky-300 text-xs font-medium border border-[#2a5566] transition-colors"
                title="Fabric Master — Microsoft Fabric Architecture & FinOps Platform"
              >
                <Cpu size={13} className="text-sky-400" />
                <span>fabric.dattasable.com</span>
                <ExternalLink size={11} />
              </a>
              <a
                href="https://dattasable.com/dashboards"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#203b35] hover:bg-[#284a43] text-emerald-300 text-xs font-medium border border-[#31574e] transition-colors"
                title="Explore BI Portfolio"
              >
                <span>BI Dashboards</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* Column 1: Workspace Views */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold tracking-wider uppercase text-emerald-400">
              Workspace Views
            </h4>
            <ul className="space-y-2 text-xs text-[#9bb0a7]">
              <li>
                <button
                  onClick={() => onSelectTab?.('dashboard')}
                  className="hover:text-white transition-colors text-left"
                >
                  Executive Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab?.('excel-preview')}
                  className="hover:text-white transition-colors text-left"
                >
                  Live Excel Workbook
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab?.('pivot')}
                  className="hover:text-white transition-colors text-left"
                >
                  Grouped Pivot Analysis
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab?.('transactions')}
                  className="hover:text-white transition-colors text-left"
                >
                  Source Records
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab?.('regions')}
                  className="hover:text-white transition-colors text-left"
                >
                  Time Trends
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Core Capabilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold tracking-wider uppercase text-emerald-400">
              Capabilities
            </h4>
            <ul className="space-y-2 text-xs text-[#9bb0a7]">
              <li className="flex items-center gap-1.5">
                <FileSpreadsheet size={13} className="text-emerald-400 shrink-0" />
                <span>Multi-Sheet .XLSX</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Zap size={13} className="text-emerald-400 shrink-0" />
                <span>Native Excel Formulas</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                <span>Client-Side Privacy</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Layers size={13} className="text-emerald-400 shrink-0" />
                <span>Auto Schema Detection</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>Dynamic Slicers</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Datta Sable Network */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold tracking-wider uppercase text-emerald-400">
              Creator &amp; Network
            </h4>
            <ul className="space-y-2 text-xs text-[#9bb0a7]">
              <li>
                <a
                  href="https://dattasable.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>Datta Sable Portfolio</span>
                  <ExternalLink size={11} className="opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="https://fabric.dattasable.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1.5 transition-colors text-sky-300 hover:text-sky-200"
                  title="Fabric Master — Microsoft Fabric Architecture, Capacity Estimator & FinOps Platform"
                >
                  <Cpu size={12} className="text-sky-400" />
                  <span>Fabric Master (MS Fabric)</span>
                  <ExternalLink size={11} className="opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="https://dattasable.com/dashboards"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>BI Projects Showcase</span>
                  <ExternalLink size={11} className="opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@sabledatttatray"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Youtube size={13} className="text-red-400 shrink-0" />
                  <span>YouTube Tutorials</span>
                  <ExternalLink size={11} className="opacity-70" />
                </a>
              </li>
              <li>
                <span className="text-[11px] text-[#789187] block mt-1">
                  Built by Datta Sable, BI Expert &amp; Data Engineer.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Trust & Copyright Row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#80998f]">
          <div className="flex items-center gap-2">
            <span>© {currentYear} Datta Sable</span>
            <span>·</span>
            <span className="font-mono text-emerald-300">excel.dattasable.com</span>
            <span>·</span>
            <span>All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-300">
              <ShieldCheck size={13} />
              100% Private (No Cloud Storage)
            </span>
            <span>·</span>
            <span>Compatible with Excel, Sheets &amp; Numbers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
