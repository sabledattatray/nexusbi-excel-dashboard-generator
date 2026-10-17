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
  Mail,
  Github,
} from 'lucide-react';
import { ExcelLogo } from './ExcelLogo';

interface FooterProps {
  onSelectTab?: (tab: 'dashboard' | 'excel-preview' | 'pivot' | 'transactions' | 'regions' | 'products' | 'customers') => void;
  onOpenUploadModal?: () => void;
  onOpenLegal?: (tab: 'about' | 'privacy' | 'terms' | 'disclaimer' | 'refund' | 'contact') => void;
  onNavigateLegal?: (route: 'about' | 'privacy' | 'terms' | 'disclaimer' | 'refund' | 'contact') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenUploadModal, onOpenLegal, onNavigateLegal }) => {
  const currentYear = new Date().getFullYear();

  const handleLegalNavigation = (route: 'about' | 'privacy' | 'terms' | 'disclaimer' | 'refund' | 'contact') => {
    if (onNavigateLegal) {
      onNavigateLegal(route);
    } else if (onOpenLegal) {
      onOpenLegal(route);
    }
  };

  return (
    <footer className="workspace-footer-custom bg-[#172b2a] text-[#b6c7c2] border-t border-[#29423b] pt-10 pb-8 px-4 sm:px-8 md:px-12 transition-all">
      <div className="max-w-7xl mx-auto">
        {/* Top Section with Brand & Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 pb-10 border-b border-[#29423b]">
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
                aria-label="Visit Datta Sable's Official Website"
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
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Executive Overview
                </button>
              </li>
              <li>
                <a
                  href="/amazon-sales-dashboard"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onSelectTab) {
                      (onSelectTab as any)('amazon-sales');
                    }
                    if (typeof window !== 'undefined') {
                      window.history.pushState(null, '', '/amazon-sales-dashboard');
                    }
                  }}
                  className="hover:text-emerald-300 transition-colors text-left flex items-center gap-1.5"
                >
                  <span>Amazon Sales Executive</span>
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    New
                  </span>
                </a>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab?.('excel-preview')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Live Excel Workbook
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab?.('pivot')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Grouped Pivot Analysis
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab?.('transactions')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Source Records
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
                <span>Auto Schema Engine</span>
              </li>
            </ul>
          </div>

            {/* Column 3: Legal & Trust Center */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-semibold tracking-wider uppercase text-emerald-400">
                About &amp; Legal
              </h4>
              <ul className="space-y-2 text-xs text-[#9bb0a7]">
                <li>
                  <a
                    href="/about"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLegalNavigation('about');
                    }}
                    className="hover:text-white transition-colors block text-left"
                  >
                    About Us &amp; Mission
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLegalNavigation('privacy');
                    }}
                    className="hover:text-white transition-colors block text-left"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLegalNavigation('terms');
                    }}
                    className="hover:text-white transition-colors block text-left"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/disclaimer"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLegalNavigation('disclaimer');
                    }}
                    className="hover:text-white transition-colors block text-left"
                  >
                    Disclaimer &amp; Liability
                  </a>
                </li>
                <li>
                  <a
                    href="/refund-policy"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLegalNavigation('refund');
                    }}
                    className="hover:text-white transition-colors block text-left"
                  >
                    Refund &amp; Cancellation
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLegalNavigation('contact');
                    }}
                    className="hover:text-white transition-colors block text-left"
                  >
                    Contact &amp; Grievance
                  </a>
                </li>
              </ul>
            </div>

          {/* Column 4: Creator & Network */}
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
                  aria-label="Datta Sable Analytics and Engineering Portfolio"
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
                  title="Fabric Master — Microsoft Fabric Platform"
                >
                  <Cpu size={12} className="text-sky-400" />
                  <span>Fabric Master</span>
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
                <a
                  href="https://github.com/sabledattatray"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Github size={13} className="text-slate-300 shrink-0" />
                  <span>GitHub (@sabledattatray)</span>
                  <ExternalLink size={11} className="opacity-70" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Trust, Legal & Copyright Section - Mobile Optimized */}
        <div className="pt-8 mt-2 flex flex-col lg:flex-row items-center justify-between gap-5 text-[12px] text-[#80998f] border-t border-[#233b35]">
          {/* Copyright, Domain & Legal Links */}
          <div className="w-full lg:w-auto flex flex-col md:flex-row items-center gap-3 md:gap-4 text-center md:text-left">
            <div className="flex items-center justify-center gap-2 flex-wrap text-slate-300 text-xs">
              <span>© {currentYear} Datta Sable</span>
              <span className="text-[#3d5c52]">·</span>
              <span className="font-mono text-emerald-300 font-semibold bg-[#16332a] border border-[#275345] px-2 py-0.5 rounded text-[11px]">
                excel.dattasable.com
              </span>
            </div>

            {/* Legal Links with comfortable touch targets */}
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap text-[11.5px] text-[#95afa5]">
              <span className="hidden md:inline text-[#3d5c52]">·</span>
              <a
                href="/about"
                onClick={(e) => {
                  e.preventDefault();
                  handleLegalNavigation('about');
                }}
                className="py-1 px-2 rounded hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer"
              >
                About Us
              </a>
              <span className="text-[#3d5c52]">·</span>
              <a
                href="/privacy"
                onClick={(e) => {
                  e.preventDefault();
                  handleLegalNavigation('privacy');
                }}
                className="py-1 px-2 rounded hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer"
              >
                Privacy Policy
              </a>
              <span className="text-[#3d5c52]">·</span>
              <a
                href="/terms"
                onClick={(e) => {
                  e.preventDefault();
                  handleLegalNavigation('terms');
                }}
                className="py-1 px-2 rounded hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer"
              >
                Terms
              </a>
              <span className="text-[#3d5c52]">·</span>
              <a
                href="/disclaimer"
                onClick={(e) => {
                  e.preventDefault();
                  handleLegalNavigation('disclaimer');
                }}
                className="py-1 px-2 rounded hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer"
              >
                Disclaimer
              </a>
              <span className="text-[#3d5c52]">·</span>
              <a
                href="/refund-policy"
                onClick={(e) => {
                  e.preventDefault();
                  handleLegalNavigation('refund');
                }}
                className="py-1 px-2 rounded hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer"
              >
                Refunds
              </a>
              <span className="text-[#3d5c52]">·</span>
              <a
                href="/contact"
                onClick={(e) => {
                  e.preventDefault();
                  handleLegalNavigation('contact');
                }}
                className="py-1 px-2 rounded hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer"
              >
                Contact
              </a>
            </div>
          </div>

          {/* Support Email & Verified Payment Badge */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-3 sm:gap-4 text-[11.5px] text-[#95afa5]">
            <a
              href="mailto:support@dattasable.com"
              className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 transition-colors py-1 px-2 rounded hover:bg-white/5"
            >
              <Mail size={13} className="text-emerald-400 shrink-0" />
              <span>support@dattasable.com</span>
            </a>
            <span className="hidden sm:inline text-[#3d5c52]">·</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18362d] border border-[#2d5c4e] text-emerald-200 text-[11px] font-mono shadow-xs">
              <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
              <span>UPI: 8010803756@upi</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
