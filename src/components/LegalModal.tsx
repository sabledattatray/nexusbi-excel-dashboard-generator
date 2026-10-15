import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  RotateCcw,
  Mail,
  Lock,
  CheckCircle2,
  ExternalLink,
  Phone,
  MapPin,
  Clock,
  Printer,
} from 'lucide-react';

export type LegalTab = 'privacy' | 'terms' | 'refund' | 'contact';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: LegalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(defaultTab);

  // Sync state if defaultTab changes when modal opens
  React.useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#f8faf7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                Legal Documentation &amp; Trust Center
              </h2>
              <p className="text-xs text-slate-500">
                Official policies governing excel.dattasable.com · Updated October 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors"
              title="Print Policy"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-slate-200 bg-slate-50 overflow-x-auto text-xs font-medium no-scrollbar">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock size={14} />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'terms'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText size={14} />
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => setActiveTab('refund')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'refund'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCcw size={14} />
            <span>Refund &amp; Cancellation</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'contact'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail size={14} />
            <span>Contact &amp; Grievance</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-4 text-emerald-950 text-xs flex items-start gap-3">
                <ShieldCheck size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-emerald-900 font-semibold mb-0.5">
                    100% In-Browser Privacy Guarantee (Zero Cloud Storage)
                  </strong>
                  When you upload or parse CSV, Excel, or tabular spreadsheets at excel.dattasable.com, your files are processed entirely in your web browser memory sandbox. No customer data or financial ledgers are ever uploaded, saved, or transmitted to any external cloud database or server.
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  1. Information We Do Not Collect
                </h3>
                <p>
                  Unlike legacy business intelligence platforms, <strong>excel.dattasable.com</strong> does not maintain an account database of your raw business metrics. We do not inspect, log, sell, monetize, or train AI models on your uploaded spreadsheet data. Closing the browser tab instantly flushes your session data from local browser memory.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  2. Payment &amp; Transaction Information
                </h3>
                <p>
                  Payments for single unlocked Excel workbooks (₹9) or Lifetime VIP access (₹49) are conducted peer-to-peer via official Unified Payments Interface (UPI) banking rails in India. The application does not collect or store sensitive banking credentials, debit card PINs, or card CVVs. License activation keys are held securely in your device's browser <code>localStorage</code> for verification.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  3. Cookies and Local Browser Storage
                </h3>
                <p>
                  We do not use invasive third-party advertising cookies. We use browser <code>localStorage</code> exclusively to save:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>Your VIP license key or download credits status</li>
                  <li>Workspace UI preferences (e.g., active view, formula visibility)</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  4. Regulatory Compliance &amp; Rights
                </h3>
                <p>
                  This Privacy Policy complies with the Information Technology Act, 2000 (India), the Digital Personal Data Protection Act (DPDP), and international GDPR privacy principles. For any privacy inquiries, reach our Data Grievance Officer at <code>dattasable1999@gmail.com</code>.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-6">
              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  1. Acceptance of Terms
                </h3>
                <p>
                  By accessing or using <strong>excel.dattasable.com</strong> ("the Service"), operated by Datta Sable Analytics, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must refrain from using the platform.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  2. Permitted Commercial and Personal License
                </h3>
                <p>
                  When you download an unlocked Microsoft Excel workbook (.xlsx) via a Single File License (₹9) or Lifetime VIP License (₹49), you are granted a non-exclusive, perpetual, royalty-free commercial license to:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>Edit, modify, re-brand, and extend the generated Excel spreadsheets and formulas.</li>
                  <li>Present and distribute the workbooks to clients, stakeholders, and executive management.</li>
                  <li>Integrate the resulting dashboards into corporate reporting cycles and monthly MIS workflows.</li>
                </ul>
                <p className="mt-2 text-slate-500">
                  <em>Restriction:</em> You may not resell, sublicense, or distribute the underlying application software source code or automated export engine as a competing SaaS product.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  3. Disclaimer of Financial &amp; Analytical Warranty
                </h3>
                <p>
                  The automated metrics, industry presets, and KPI scorecards are generated using mathematical aggregation logic. While calculations are strictly checked for accuracy, users are responsible for independently auditing calculations against their firm's financial, tax, or regulatory requirements before finalizing corporate filings. The service is provided on an "as-is" and "as-available" basis.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  4. Governing Law and Jurisdiction
                </h3>
                <p>
                  These Terms are governed by and construed in accordance with the laws of India. Any disputes arising in connection with the platform shall be subject to the exclusive jurisdiction of the competent courts in Pune, Maharashtra, India.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-950 text-xs flex items-start gap-3">
                <RotateCcw size={18} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-900 font-semibold mb-0.5">
                    Digital Product Refund Policy
                  </strong>
                  Because excel.dattasable.com provides immediate access to digital assets and downloadable Excel (.xlsx) files, standard returns do not apply once files are downloaded. However, customer fairness and transparency are our highest priorities.
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  1. Eligibility for Full Refund
                </h3>
                <p>You are 100% entitled to a full refund or credit replacement under the following conditions:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                    <strong className="text-slate-900 block text-xs mb-1">Double / Duplicate Payment</strong>
                    <p className="text-[11px] text-slate-600">
                      If your bank or UPI app deducted payment twice for the same order, the excess payment will be refunded immediately.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                    <strong className="text-slate-900 block text-xs mb-1">Technical Failure to Unlock</strong>
                    <p className="text-[11px] text-slate-600">
                      If you paid successfully but were unable to download or unlock the spreadsheet due to a technical glitch, we provide immediate VIP key replacement or full refund.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  2. Refund Request Timeline &amp; SLA
                </h3>
                <p>
                  Refund requests must be submitted within <strong>7 days</strong> of transaction. All verified refund claims are processed back to the original source UPI account / VPA within <strong>24 to 48 business hours</strong>.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  3. How to Request a Refund
                </h3>
                <p>
                  Simply message us on WhatsApp at <strong>+91 8010803756</strong> or email <strong>dattasable1999@gmail.com</strong> with your UPI Reference ID / UTR Number and payment timestamp.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-emerald-800 font-semibold">Operator / Developer</span>
                  <h4 className="text-sm font-bold text-slate-900">Dattatray Gorakh Sable</h4>
                  <p className="text-xs text-slate-600">Business Intelligence Expert &amp; Analytics Engineer</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-emerald-800 font-semibold">Official UPI VPA</span>
                  <h4 className="text-sm font-bold text-slate-900 font-mono">8010803756@upi</h4>
                  <p className="text-xs text-slate-600">Verified Payee: DATTATRAY GORAKH SABLE</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <Mail size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Official Email:</strong>{' '}
                    <a href="mailto:dattasable1999@gmail.com" className="text-emerald-700 hover:underline">
                      dattasable1999@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <Phone size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Support &amp; WhatsApp:</strong>{' '}
                    <a
                      href="https://wa.me/918010803756?text=Hi%20Datta%2C%20I%20have%20an%20inquiry%20regarding%20excel.dattasable.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline font-mono"
                    >
                      +91 8010803756
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <MapPin size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Location:</strong> Pune, Maharashtra, India · 411014
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <Clock size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Response SLA:</strong> Inquiries answered within 2 to 12 hours (Mon–Sat, 9 AM – 8 PM IST).
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <a
                  href="https://dattasable.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                >
                  <span>Main Website: dattasable.com</span>
                  <ExternalLink size={12} />
                </a>
                <a
                  href="https://fabric.dattasable.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200 transition-colors"
                >
                  <span>Fabric Master</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <span>excel.dattasable.com · Powered by Datta Sable Analytics</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
