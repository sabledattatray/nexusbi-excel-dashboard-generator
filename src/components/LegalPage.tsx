import React, { useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  RotateCcw,
  Mail,
  Lock,
  ExternalLink,
  Phone,
  MapPin,
  Clock,
  Printer,
  Sparkles,
  User,
  Cpu,
  Globe,
  Youtube,
  Award,
  Layers,
  Zap,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Scale,
  Github,
} from 'lucide-react';
import { ExcelLogo } from './ExcelLogo';

export type LegalRoute = 'about' | 'privacy' | 'terms' | 'disclaimer' | 'refund' | 'contact';

interface LegalPageProps {
  currentRoute: LegalRoute;
  onNavigate: (route: LegalRoute) => void;
  onBackToApp: () => void;
}

const PAGE_METADATA: Record<LegalRoute, { title: string; subtitle: string; icon: React.ElementType; path: string }> = {
  about: {
    title: 'About Us & Creator',
    subtitle: 'Learn about Datta Sable, the mission, and our 100% client-side BI architecture',
    icon: User,
    path: '/about',
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: '100% In-Browser Privacy Guarantee — Zero cloud storage and zero telemetry',
    icon: Lock,
    path: '/privacy',
  },
  terms: {
    title: 'Terms of Service',
    subtitle: 'Commercial licensing, workbook usage rights, and platform terms',
    icon: FileText,
    path: '/terms',
  },
  disclaimer: {
    title: 'Disclaimer & Liability',
    subtitle: 'Limitation of liability, financial calculations disclaimer, and audit responsibilities',
    icon: AlertTriangle,
    path: '/disclaimer',
  },
  refund: {
    title: 'Refund & Cancellation Policy',
    subtitle: 'Transparent terms for digital downloads, dispute resolution, and UPI refunds',
    icon: RotateCcw,
    path: '/refund-policy',
  },
  contact: {
    title: 'Contact Us & Grievance',
    subtitle: 'Direct support, official WhatsApp desk, office address, and grievance officer',
    icon: Mail,
    path: '/contact',
  },
};

export const LegalPage: React.FC<LegalPageProps> = ({ currentRoute, onNavigate, onBackToApp }) => {
  const currentMeta = PAGE_METADATA[currentRoute] || PAGE_METADATA.about;
  const CurrentIcon = currentMeta.icon;

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = `${currentMeta.title} | excel.dattasable.com`;
  }, [currentRoute, currentMeta.title]);

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, route: LegalRoute) => {
    e.preventDefault();
    onNavigate(route);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Sub-Navigation Tabs */}
      <div className="bg-[#10221e] border border-[#23453b] rounded-xl px-3 py-2 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 text-xs font-medium">
          {(
            [
              { id: 'privacy', label: 'Privacy Policy', icon: Lock, path: '/privacy' },
              { id: 'terms', label: 'Terms of Service', icon: FileText, path: '/terms' },
              { id: 'disclaimer', label: 'Disclaimer & Liability', icon: AlertTriangle, path: '/disclaimer' },
              { id: 'about', label: 'About Us & Creator', icon: User, path: '/about' },
              { id: 'contact', label: 'Contact & Grievance', icon: Mail, path: '/contact' },
              { id: 'refund', label: 'Refund Policy', icon: RotateCcw, path: '/refund-policy' },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = currentRoute === tab.id;
            return (
              <a
                key={tab.id}
                href={tab.path}
                onClick={(e) => handleTabClick(e, tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-[#8daaa1] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-emerald-200' : 'opacity-70'} />
                <span>{tab.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Header Info Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
            <CurrentIcon size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Official Compliance
              </span>
              <span className="text-xs text-slate-500">excel.dattasable.com</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              {currentMeta.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {currentMeta.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <Clock size={13} className="text-emerald-700" />
          <span>Effective: 2024–2025</span>
        </div>
      </div>

      {/* Dynamic Page Views */}
      <article className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-10 space-y-8 text-slate-700 text-sm leading-relaxed">
          {/* ==================== PRIVACY POLICY ==================== */}
          {currentRoute === 'privacy' && (
            <div className="space-y-8">
              {/* Highlight Privacy Guarantee */}
              <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl p-5 text-emerald-950 text-xs sm:text-sm flex items-start gap-4">
                <ShieldCheck size={26} className="text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block text-emerald-900 font-bold text-sm">
                    100% Client-Side In-Browser Privacy Guarantee
                  </strong>
                  <p className="text-emerald-800 leading-relaxed">
                    When you upload, paste, or process CSV, XLSX, or financial spreadsheets on <strong>excel.dattasable.com</strong>, all data parsing, statistical aggregation, formula compilation, and file generation take place entirely inside your web browser sandbox (memory). <strong>No rows, customer names, or transaction figures are ever transmitted to or stored on any external server or cloud database.</strong>
                  </p>
                </div>
              </div>

              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  1. Information We Do Not Collect
                </h2>
                <p>
                  We operate on a strict zero-knowledge, zero-telemetry architecture for user data:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                  <li><strong>Your Source Spreadsheets:</strong> Raw files uploaded through the browser interface remain in your local JavaScript heap memory. Closing the browser tab instantly flushes all session data.</li>
                  <li><strong>Financial &amp; Business Metrics:</strong> We do not log revenue amounts, customer lists, HR employee rosters, or banking records.</li>
                  <li><strong>Personal Identifiable Information (PII):</strong> We do not mandate registration, passwords, phone numbers, or user accounts to generate and download Excel reports.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  2. Local Storage and Client Preferences
                </h2>
                <p>
                  We do not use tracking or advertising cookies. The application uses browser <code>localStorage</code> exclusively for non-sensitive interface state:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <strong className="text-slate-900 block font-semibold mb-1">UI Configuration</strong>
                    <p className="text-slate-600">Saves your chosen industry preset, report titles, and table visual preferences between page visits.</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <strong className="text-slate-900 block font-semibold mb-1">Session License Cache</strong>
                    <p className="text-slate-600">Locally stores anonymous license unlock tokens to enable unlocked template downloads without server roundtrips.</p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  3. Client-Side Software Dependencies
                </h2>
                <p>
                  Our client-side dashboard engine is powered by standard open-source libraries:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>ExcelJS:</strong> Assembles OpenXML (.xlsx) files directly inside client browser memory.</li>
                  <li><strong>PapaParse:</strong> Streams and parses CSV text locally on your computer.</li>
                  <li><strong>Lucide Icons &amp; Canvas-Confetti:</strong> Rendering visual icons and celebratory user interface animations.</li>
                </ul>
                <p className="text-xs text-slate-500 mt-2">
                  None of these libraries transmit your data or phone home.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  4. Regulatory Alignment &amp; Data Rights
                </h2>
                <p>
                  Our platform is engineered in compliance with global data protection principles, including the Indian Digital Personal Data Protection Act (DPDP Act, 2023), the Information Technology Act, 2000, and the European Union General Data Protection Regulation (GDPR). Because we never store your data on our servers, there is zero risk of server data breaches or corporate credential leakage.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  5. Contact Data Privacy Officer
                </h2>
                <p>
                  For any privacy questions or security feedback, reach our developer desk at:
                </p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 font-mono">
                  <div><strong>Email:</strong> <a href="mailto:support@dattasable.com" className="text-emerald-700 hover:underline">support@dattasable.com</a></div>
                  <div><strong>Entity:</strong> Datta Sable Analytics</div>
                  <div><strong>Location:</strong> Thane, Maharashtra, India</div>
                </div>
              </section>
            </div>
          )}

          {/* ==================== DISCLAIMER ==================== */}
          {currentRoute === 'disclaimer' && (
            <div className="space-y-8">
              {/* Highlight Disclaimer Banner */}
              <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-5 text-amber-950 text-xs sm:text-sm flex items-start gap-4">
                <AlertTriangle size={26} className="text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block text-amber-900 font-bold text-sm">
                    Important Analytical &amp; Financial Disclaimer
                  </strong>
                  <p className="text-amber-900/90 leading-relaxed">
                    The spreadsheets, financial projections, KPI metrics, formulas, and dashboards generated by <strong>excel.dattasable.com</strong> are provided for informational, organizational, and computational assistance only. They do not constitute certified financial, tax, investment, accounting, or legal advice.
                  </p>
                </div>
              </div>

              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  1. No Financial, Investment, or Legal Advice
                </h2>
                <p>
                  All synthetic models, industry presets (e.g., Enterprise Tech ARR, Healthcare Clinical Throughput, Financial Loan Portfolios, Manufacturing OEE), and automated formulas are generic structural templates. Nothing on this website or in the downloaded workbooks should be construed as an invitation, endorsement, or recommendation to buy or sell securities, execute corporate acquisitions, or prepare official tax filings without independent certified review.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  2. User Responsibility &amp; Audit Duty
                </h2>
                <p>
                  Spreadsheet computations (such as <code>SUMIFS</code>, <code>AVERAGEIFS</code>, ratios, and margins) are generated automatically based on column type inference and user-provided datasets. You as the user assume full responsibility to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                  <li>Independently audit and verify all formulas, cross-totals, and currency conversions before presenting them to executive committees, boards of directors, lenders, or regulatory auditors.</li>
                  <li>Verify that source data uploaded to your browser is properly formatted, sanitised, and free from internal corruption or truncation.</li>
                  <li>Ensure that mathematical assumptions meet your organization's specific accounting policies (e.g., GAAP, IFRS, Ind AS).</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  3. Limitation of Liability
                </h2>
                <p>
                  To the fullest extent permitted by applicable law, <strong>Datta Sable</strong>, Datta Sable Analytics, and affiliated associates shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>Loss of profits, revenue, or business opportunities.</li>
                  <li>Financial misstatements, budgeting variances, or tax penalties resulting from user reliance on generated spreadsheet outputs.</li>
                  <li>Data discrepancies resulting from corrupt or malformed CSV/Excel source files.</li>
                  <li>Temporary service downtime or browser compatibility issues.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  4. Trademark &amp; Third-Party Notice
                </h2>
                <p>
                  <strong>Microsoft Excel®</strong>, <strong>Microsoft Office®</strong>, <strong>Microsoft Fabric®</strong>, and <strong>Power BI®</strong> are registered trademarks of Microsoft Corporation in the United States and other countries. <strong>excel.dattasable.com</strong> is an independent software tool created by Datta Sable and is neither affiliated with, endorsed by, nor sponsored by Microsoft Corporation.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  5. External Hyperlinks
                </h2>
                <p>
                  This site may contain links to external web properties (including <code>dattasable.com</code>, <code>fabric.dattasable.com</code>, YouTube, and LinkedIn). We do not assume responsibility for the content, privacy practices, or availability of third-party websites.
                </p>
              </section>
            </div>
          )}

          {/* ==================== TERMS OF SERVICE ==================== */}
          {currentRoute === 'terms' && (
            <div className="space-y-8">
              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  1. Acceptance of Terms
                </h2>
                <p>
                  By visiting, accessing, or using <strong>excel.dattasable.com</strong> ("the Service"), operated by Datta Sable Analytics, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree to these terms, you must discontinue using the platform.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  2. Commercial &amp; Personal License Grant
                </h2>
                <p>
                  When you generate and download a Microsoft Excel workbook (.xlsx) from this platform, you receive a perpetual, irrevocable, worldwide, royalty-free commercial license to:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <strong className="text-slate-900 block font-semibold mb-1">Corporate Reporting</strong>
                    <p className="text-slate-600">Present, distribute, and embed the generated dashboards into executive presentations, investor decks, and monthly MIS packs.</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <strong className="text-slate-900 block font-semibold mb-1">Client Deliverables</strong>
                    <p className="text-slate-600">Deliver completed Excel workbooks to external clients, consulting stakeholders, and accounting partners.</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <strong className="text-slate-900 block font-semibold mb-1">Modifications &amp; Re-branding</strong>
                    <p className="text-slate-600">Freely customize styling, add company logos, write custom formulas, and extend data tables.</p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  3. Prohibited Use &amp; Intellectual Property
                </h2>
                <p>
                  The website, branding, design system, underlying automated schema detection logic, and generator source code are the intellectual property of Datta Sable. You may not:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>Scrape, clone, or mirror the core web application engine to build a competing spreadsheet SaaS platform.</li>
                  <li>Attempt to decompile or attack the website infrastructure or disrupt service for other users.</li>
                  <li>Use the generator to create or distribute malicious scripts, macro viruses, or fraudulent financial representations.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  4. Warranty &amp; "As-Is" Provision
                </h2>
                <p>
                  The platform is provided strictly on an <strong>"AS-IS" and "AS-AVAILABLE"</strong> basis without warranties of any kind, whether express or implied. Datta Sable Analytics does not warrant that the service will be uninterrupted, error-free, or compatible with all versions of spreadsheet software.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  5. Governing Law and Jurisdiction
                </h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India. Any legal action or dispute arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the competent courts located in <strong>Thane, Maharashtra, India</strong>.
                </p>
              </section>
            </div>
          )}

          {/* ==================== ABOUT US ==================== */}
          {currentRoute === 'about' && (
            <div className="space-y-8">
              {/* Executive Founder Spotlight Hero */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1f1a] via-[#132c25] to-[#0a1814] border border-[#2d5246] p-6 sm:p-8 lg:p-10 shadow-xl text-white">
                {/* Decorative background glow accents */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Photo Column with Executive Frame */}
                  <div className="lg:col-span-5 flex justify-center">
                    <div className="relative group max-w-sm w-full">
                      {/* Ambient Glow */}
                      <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500/40 via-sky-500/30 to-emerald-400/20 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-300" />
                      
                      {/* Image Container Card */}
                      <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-slate-950 shadow-2xl">
                        <img
                          src="/dattasable.com_about.webp"
                          alt="Datta Sable — Founder & Principal Business Intelligence Architect"
                          className="w-full h-auto object-cover object-top aspect-[3/4] transition-transform duration-500 group-hover:scale-[1.02]"
                          loading="eager"
                        />
                        {/* Glassmorphic Gradient Overlay at bottom */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4 pt-12 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-semibold">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Live Executive Analytics</span>
                            </span>
                            <span className="text-[10.5px] font-mono text-slate-300">Power BI &amp; Excel</span>
                          </div>
                          <p className="text-white font-semibold text-sm">Datta Sable</p>
                          <p className="text-[11px] text-emerald-200/90 leading-tight">Principal BI Architect · Thane, India</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio & Credentials Column */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
                      <Sparkles size={13} className="text-emerald-400" />
                      <span>FOUNDER, ARCHITECT &amp; LEAD DEVELOPER</span>
                    </div>

                    <div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-heading tracking-tight">
                        Datta Sable
                      </h2>
                      <p className="text-sm sm:text-base text-emerald-300/90 font-medium mt-1">
                        Business Intelligence Architect, Data Engineer &amp; Spreadsheet Automation Specialist
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      With over a decade of hands-on architectural experience bridging enterprise cloud ecosystems 
                      (Microsoft Fabric, Azure Synapse, Power BI) and real-world executive operations, Datta built 
                      <strong className="text-white"> excel.dattasable.com</strong> to liberate analysts, finance leaders, and founders 
                      from repetitive spreadsheet formatting. His vision delivers boardroom-ready, multi-sheet Excel workbooks with live editable formulas in seconds — with 
                      <strong className="text-emerald-300"> 100% in-browser client-side privacy</strong>.
                    </p>

                    {/* Stats & Capability Highlights */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs">
                        <div className="text-lg font-bold text-emerald-300 font-mono">10+ Yrs</div>
                        <div className="text-[11px] text-slate-400 leading-tight">BI Architecture &amp; Data Engineering</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs">
                        <div className="text-lg font-bold text-emerald-300 font-mono">32+ Ready</div>
                        <div className="text-[11px] text-slate-400 leading-tight">Industry MIS Templates</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs col-span-2 sm:col-span-1">
                        <div className="text-lg font-bold text-sky-300 font-mono">100% Private</div>
                        <div className="text-[11px] text-slate-400 leading-tight">Zero-Cloud Sandboxed Heap</div>
                      </div>
                    </div>

                    {/* Portfolio & Ecosystem CTA Buttons - Uniform Size & Responsive Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full pt-2">
                      <a
                        href="https://dattasable.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-11 px-3.5 sm:px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-950/40 hover:scale-[1.01] flex items-center justify-between group"
                        title="Visit Datta Sable's Official Website & Portfolio"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Globe size={14} className="shrink-0" />
                          <span className="truncate">dattasable.com</span>
                        </div>
                        <ExternalLink size={12} className="opacity-75 group-hover:opacity-100 transition-opacity shrink-0 ml-1.5" />
                      </a>

                      <a
                        href="https://fabric.dattasable.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-11 px-3.5 sm:px-4 rounded-xl bg-sky-950/80 hover:bg-sky-900/90 text-sky-200 text-xs font-bold border border-sky-400/40 transition-all shadow-sm hover:scale-[1.01] flex items-center justify-between group"
                        title="Fabric Master — Microsoft Fabric Architecture, Capacity Estimator & FinOps Platform"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Cpu size={14} className="text-sky-400 shrink-0" />
                          <span className="truncate">Fabric Master (FinOps)</span>
                        </div>
                        <ExternalLink size={12} className="opacity-75 group-hover:opacity-100 transition-opacity shrink-0 ml-1.5" />
                      </a>

                      <a
                        href="https://www.youtube.com/@sabledatttatray"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-11 px-3.5 sm:px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white text-xs font-semibold border border-white/[0.12] transition-all shadow-sm hover:scale-[1.01] flex items-center justify-between group"
                        title="Watch Business Intelligence & Analytics Tutorials on YouTube"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Youtube size={14} className="text-red-400 shrink-0" />
                          <span className="truncate">YouTube Tutorials</span>
                        </div>
                        <ExternalLink size={12} className="opacity-75 group-hover:opacity-100 transition-opacity shrink-0 ml-1.5" />
                      </a>

                      <a
                        href="https://github.com/sabledattatray"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-11 px-3.5 sm:px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 hover:text-white text-xs font-semibold border border-white/15 transition-all shadow-sm hover:scale-[1.01] flex items-center justify-between group"
                        title="Explore Datta Sable's Code Repositories on GitHub"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Github size={14} className="text-white shrink-0" />
                          <span className="truncate">GitHub (@sabledattatray)</span>
                        </div>
                        <ExternalLink size={12} className="opacity-75 group-hover:opacity-100 transition-opacity shrink-0 ml-1.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mission Statement */}
              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  Our Mission: Democratizing Executive-Grade Business Intelligence
                </h2>
                <p>
                  Traditional Enterprise BI platforms like Microsoft Power BI, Tableau, and Looker are exceptionally capable, but they frequently require costly recurring licenses, intricate access management, and steep learning curves. Conversely, constructing manual Excel MIS reports from scratch demands hours of repetitive copy-pasting, conditional formatting, and formula debugging every single reporting period.
                </p>
                <p>
                  <strong>excel.dattasable.com</strong> was conceived and developed by Datta Sable to resolve this dilemma: to empower financial analysts, founders, operations managers, and business leaders to convert raw tabular datasets into boardroom-ready spreadsheets equipped with dynamic live formulas and interactive visual dashboards in seconds.
                </p>
              </section>

              {/* 4 Architectural Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs font-mono">
                    <ShieldCheck size={16} />
                    <span>100% IN-BROWSER PRIVACY</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Zero cloud data storage. File parsing, statistics, and Excel workbook compilation execute purely within your browser memory sandbox. Your business numbers never touch a remote server.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs font-mono">
                    <Zap size={16} />
                    <span>LIVE NATIVE FORMULAS</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    We compile real, editable Excel formulas (such as SUMIFS, AVERAGEIFS, ROUND). When you edit transactions in Excel, all KPI cards and charts recalculate instantly.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs font-mono">
                    <Layers size={16} />
                    <span>AUTOMATIC SCHEMA ENGINE</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Intelligent type detection identifies dates, financial currencies, percentages, and categorical dimensions automatically, generating pivot summaries without manual configuration.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs font-mono">
                    <Award size={16} />
                    <span>100% FREE ACCESS</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enjoy full interactive dashboards, pivot analytics, and complete multi-sheet Excel file downloads completely free. No subscription or credit card required.
                  </p>
                </div>
              </div>

              {/* Founder Profile Details */}
              <section className="space-y-3 pt-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  About Datta Sable
                </h2>
                <p>
                  Datta Sable is a certified Business Intelligence Specialist, Data Engineer, and analytics consultant based in Thane, Maharashtra. His engineering footprint spans enterprise cloud architectures, Microsoft Fabric, Azure Data Factory, Power BI DAX modeling, and automated spreadsheet reporting engines.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 w-full">
                  <a
                    href="https://dattasable.com/dashboards"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-medium transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Globe size={13} className="shrink-0" />
                      <span className="truncate">BI Dashboards</span>
                    </div>
                    <ExternalLink size={11} className="opacity-70 shrink-0 ml-1" />
                  </a>
                  <a
                    href="https://www.youtube.com/@sabledatttatray"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 hover:border-red-400 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-medium transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Youtube size={13} className="text-red-500 shrink-0" />
                      <span className="truncate">YouTube</span>
                    </div>
                    <ExternalLink size={11} className="opacity-70 shrink-0 ml-1" />
                  </a>
                  <a
                    href="https://github.com/sabledattatray"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-100 text-slate-800 text-xs font-medium transition-colors flex items-center justify-between group"
                    title="View GitHub Profile & Open-Source Projects"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Github size={13} className="text-slate-900 shrink-0" />
                      <span className="truncate">GitHub</span>
                    </div>
                    <ExternalLink size={11} className="opacity-70 shrink-0 ml-1" />
                  </a>
                  <a
                    href="mailto:support@dattasable.com"
                    className="w-full h-10 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Mail size={13} className="shrink-0" />
                    <span className="truncate">support@dattasable.com</span>
                  </a>
                </div>
              </section>
            </div>
          )}

          {/* ==================== CONTACT US ==================== */}
          {currentRoute === 'contact' && (
            <div className="space-y-8">
              {/* Quick Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold tracking-wider">DEVELOPER &amp; ARCHITECT</span>
                  <h3 className="text-base font-bold text-slate-900">Datta Sable</h3>
                  <p className="text-xs text-slate-600">Business Intelligence Architect &amp; Analytics Consultant</p>
                </div>

                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold tracking-wider">OFFICIAL DESK</span>
                  <h3 className="text-base font-bold text-slate-900">Direct Support Desk</h3>
                  <p className="text-xs text-slate-600">WhatsApp &amp; Email Support (Mon–Sat, 9 AM – 8 PM IST)</p>
                </div>
              </div>

              {/* Contact Details List */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
                  <Mail size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 text-xs font-semibold">Official Email Support</strong>
                    <a href="mailto:support@dattasable.com" className="text-emerald-700 hover:underline font-mono text-xs">
                      support@dattasable.com
                    </a>
                    <p className="text-[11px] text-slate-500 mt-0.5">Recommended for technical inquiries, feature suggestions, or business partnerships.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
                  <Phone size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 text-xs font-semibold">WhatsApp &amp; Phone Desk</strong>
                    <a
                      href="https://wa.me/918010803756?text=Hi%20Datta%2C%20I%20have%20an%20inquiry%20regarding%20excel.dattasable.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline font-mono text-xs font-medium inline-flex items-center gap-1.5 mt-0.5"
                    >
                      <span>+91 8010803756</span>
                      <ExternalLink size={11} />
                    </a>
                    <p className="text-[11px] text-slate-500 mt-0.5">Quick assistance for workbook downloads and live template questions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
                  <MapPin size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 text-xs font-semibold">Registered Location</strong>
                    <span className="text-slate-700 text-xs">Thane, Maharashtra, India — PIN 421503</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
                  <Clock size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 text-xs font-semibold">Response SLA</strong>
                    <span className="text-slate-700 text-xs">All inquiries answered within 2 to 12 business hours.</span>
                  </div>
                </div>
              </div>

              {/* Statutory Grievance Redressal */}
              <section className="space-y-3 pt-3 border-t border-slate-100">
                <h2 className="text-base font-bold text-slate-900 font-heading">
                  Grievance Redressal Officer (India IT Rules)
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In accordance with the Information Technology Act, 2000 and the Rules made thereunder, the contact details of the Grievance Officer for excel.dattasable.com are:
                </p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-700">
                  <div><strong>Name:</strong> Datta Sable</div>
                  <div><strong>Designation:</strong> Grievance Redressal Officer</div>
                  <div><strong>Email:</strong> <a href="mailto:support@dattasable.com" className="text-emerald-700 hover:underline">support@dattasable.com</a></div>
                  <div><strong>Address:</strong> Thane, Maharashtra, India 421503</div>
                  <div><strong>Grievance Acknowledgement:</strong> Within 24 hours · Final Resolution: Within 15 business days.</div>
                </div>
              </section>

              {/* External Links */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="https://dattasable.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                >
                  <Globe size={13} />
                  <span>dattasable.com</span>
                  <ExternalLink size={12} />
                </a>
                <a
                  href="https://fabric.dattasable.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200 transition-colors"
                >
                  <Cpu size={13} className="text-sky-600" />
                  <span>Fabric Master</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}

          {/* ==================== REFUND POLICY ==================== */}
          {currentRoute === 'refund' && (
            <div className="space-y-8">
              <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-5 text-amber-950 text-xs sm:text-sm flex items-start gap-4">
                <RotateCcw size={26} className="text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block text-amber-900 font-bold text-sm">
                    Transparent Digital Products Refund Guarantee
                  </strong>
                  <p className="text-amber-900/90 leading-relaxed">
                    Because excel.dattasable.com provides immediate access to digital templates and downloadable Excel (.xlsx) files, standard physical returns do not apply. However, customer fairness and satisfaction are guaranteed under our duplicate payment and technical failure protections.
                  </p>
                </div>
              </div>

              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  1. Automatic Refund Eligibility
                </h2>
                <p>You are 100% entitled to an immediate replacement or full refund under the following conditions:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <strong className="text-slate-900 block text-xs font-semibold">Duplicate / Erroneous Payment</strong>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      If your bank, credit card, or UPI app deducted payment more than once for the same order, the excess amount is refunded in full without hassle.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <strong className="text-slate-900 block text-xs font-semibold">Technical Failure to Unlock</strong>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      If you paid successfully but were unable to download or unlock the spreadsheet due to a technical glitch, we provide immediate VIP key replacement or full refund.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  2. Claim Window &amp; Processing SLA
                </h2>
                <p>
                  Refund requests must be submitted within <strong>7 calendar days</strong> from the transaction timestamp. Verified claims are processed directly to the original payment source (UPI VPA or bank account) within <strong>24 to 48 business hours</strong>.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading border-b border-slate-100 pb-2">
                  3. How to Submit a Refund Claim
                </h2>
                <p>
                  Contact us via WhatsApp at <strong>+91 8010803756</strong> or email <strong>support@dattasable.com</strong> with your payment timestamp and UPI Reference / Transaction ID.
                </p>
              </section>
            </div>
          )}
        </article>

        {/* Bottom Back Button & Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <button
            onClick={onBackToApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>Return to Dashboard Generator</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Official Policy Center · excel.dattasable.com</span>
          </div>
        </div>
      </div>
    );
  };
