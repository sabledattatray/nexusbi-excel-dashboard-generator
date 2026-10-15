import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  X,
  Crown,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  Unlock,
  KeyRound,
  ArrowRight,
  Zap,
  Info,
  HelpCircle,
  FileSpreadsheet,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import {
  UPI_PAYMENT_CONFIG,
  PRICING_PLANS,
  PricingPlanId,
  buildUpiPaymentUrl,
  unlockProLicense,
  isProUnlocked,
  isLifetimeUnlocked,
  getSingleCreditsRemaining,
  ProLicense,
  getProLicense,
} from '../utils/proLicenseManager';

interface ProUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess?: () => void;
  initialUtr?: string;
}

export const ProUnlockModal: React.FC<ProUnlockModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess,
  initialUtr = '',
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlanId>('lifetime');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [utrInput, setUtrInput] = useState<string>(initialUtr);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [alreadyUnlocked, setAlreadyUnlocked] = useState<boolean>(false);
  const [licenseInfo, setLicenseInfo] = useState<ProLicense | null>(null);
  const [activeTab, setActiveTab] = useState<'qr' | 'code'>('qr');
  const [qrFallbackUrl, setQrFallbackUrl] = useState<string>('');
  const [showForgotHelp, setShowForgotHelp] = useState<boolean>(false);

  const currentPlan = PRICING_PLANS[selectedPlan];
  const upiUrl = buildUpiPaymentUrl(selectedPlan);

  useEffect(() => {
    if (isOpen) {
      const unlocked = isProUnlocked();
      setAlreadyUnlocked(unlocked);
      if (unlocked) {
        setLicenseInfo(getProLicense());
      }
      setStatusMessage(null);

      // Generate fallback QR in case /payment-qr.jpg is not reached
      QRCode.toDataURL(upiUrl, {
        width: 260,
        margin: 2,
        color: { dark: '#032e27', light: '#ffffff' },
      })
        .then((url) => setQrFallbackUrl(url))
        .catch((err) => console.error('Fallback QR error:', err));
    }
  }, [isOpen, upiUrl]);

  if (!isOpen) return null;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(UPI_PAYMENT_CONFIG.vpa);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleVerify = () => {
    if (!utrInput.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter your 12-digit UPI UTR / Transaction Reference or VIP Passcode.',
      });
      return;
    }

    setVerifying(true);
    setStatusMessage(null);

    setTimeout(() => {
      const result = unlockProLicense(utrInput, selectedPlan);
      setVerifying(false);

      if (result.success) {
        setStatusMessage({ type: 'success', text: result.message });
        setAlreadyUnlocked(true);
        setLicenseInfo(getProLicense());

        try {
          confetti({
            particleCount: 130,
            spread: 85,
            origin: { y: 0.6 },
            colors: ['#F59E0B', '#10B981', '#34D399', '#38BDF8', '#6366F1'],
          });
        } catch {
          // ignore
        }

        setTimeout(() => {
          onUnlockSuccess?.();
        }, 1200);
      } else {
        setStatusMessage({ type: 'error', text: result.message });
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-gradient-to-b from-[#0b211b] via-[#091b17] to-[#061411] border border-emerald-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-100 my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#13352c] via-[#0f2c24] to-[#0c241e] border-b border-emerald-500/30 flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-start gap-3.5 relative z-10">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400/20 to-emerald-500/20 text-amber-300 border border-amber-400/30 shadow-inner">
              <Crown className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Get Excel (.xlsx) Dashboard
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-wide">
                  ₹9 or ₹49
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
                Choose a plan below to download your 100% unlocked workbook with live native formulas, charts, and zero passwords.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300/70 hover:text-white hover:bg-emerald-500/20 transition-colors relative z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          {alreadyUnlocked ? (
            /* Already Unlocked View */
            <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">
                {licenseInfo?.isLifetime
                  ? '👑 Unlimited Lifetime Pass is Active!'
                  : `🎉 You have ${licenseInfo?.singleCredits || 1} Unprotected Download Available!`}
              </h4>
              <p className="text-xs text-emerald-200/90 max-w-sm mx-auto">
                {licenseInfo?.isLifetime
                  ? 'All 12 templates and custom uploads are completely unlocked with zero passwords forever.'
                  : 'Your single file download is authorized. Click below to download your 100% unprotected Excel workbook.'}
              </p>
              {licenseInfo?.refId && (
                <div className="pt-1 font-mono text-[11px] text-emerald-300">
                  Ref: <span className="text-white font-bold">{licenseInfo.refId}</span>
                </div>
              )}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    onUnlockSuccess?.();
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
                >
                  Download Unprotected Excel (.xlsx)
                </button>
                {!licenseInfo?.isLifetime && (
                  <button
                    onClick={() => {
                      setAlreadyUnlocked(false);
                      setSelectedPlan('lifetime');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-400/30 transition-all"
                  >
                    Upgrade to Lifetime (₹49)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Dual Plan Selector */}
              <div>
                <label className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block mb-2">
                  Select Your Plan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Plan 1: Single Download (₹9) */}
                  <div
                    onClick={() => setSelectedPlan('single')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                      selectedPlan === 'single'
                        ? 'bg-gradient-to-br from-emerald-950/80 to-[#0e2c24] border-emerald-400 shadow-md ring-1 ring-emerald-400'
                        : 'bg-emerald-950/30 border-emerald-500/20 hover:border-emerald-500/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        Single Pass
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        1 Download
                      </span>
                    </div>
                    <div className="my-1">
                      <div className="text-2xl font-extrabold text-white">
                        ₹9 <span className="text-[11px] font-normal text-slate-400">/ file</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-1 leading-snug">
                        Unlock this specific dashboard. Full formula &amp; chart edit rights.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-emerald-500/15 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Pay each time needed</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedPlan === 'single'
                            ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                            : 'border-slate-500'
                        }`}
                      >
                        {selectedPlan === 'single' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>

                  {/* Plan 2: Unlimited Lifetime (₹49) */}
                  <div
                    onClick={() => setSelectedPlan('lifetime')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                      selectedPlan === 'lifetime'
                        ? 'bg-gradient-to-br from-amber-950/50 via-[#103027] to-[#0c241e] border-amber-400 shadow-xl ring-2 ring-amber-400/80'
                        : 'bg-emerald-950/30 border-emerald-500/20 hover:border-amber-400/40 text-slate-300'
                    }`}
                  >
                    <div className="absolute -top-1 -right-1 px-2.5 py-0.5 rounded-bl-lg bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold text-[9px] uppercase tracking-wider shadow-sm">
                      Best Value
                    </div>

                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-400" />
                        Unlimited Lifetime
                      </span>
                    </div>

                    <div className="my-1">
                      <div className="text-2xl font-extrabold text-white flex items-baseline gap-1.5">
                        <span>₹49</span>
                        <span className="text-xs text-slate-400 line-through">₹499</span>
                        <span className="text-[10px] font-normal text-amber-300">One-Time Forever</span>
                      </div>
                      <p className="text-[10.5px] text-amber-100/80 mt-1 leading-snug">
                        All 12 templates + all custom CSV uploads. Never scan or pay again!
                      </p>
                    </div>

                    <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px]">
                      <span className="text-amber-300/90 font-medium">Permanent Access</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedPlan === 'lifetime'
                            ? 'border-amber-400 bg-amber-400 text-slate-950'
                            : 'border-slate-500'
                        }`}
                      >
                        {selectedPlan === 'lifetime' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[#071612] border border-emerald-500/20 text-xs">
                <button
                  onClick={() => setActiveTab('qr')}
                  className={`py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'qr'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Scan QR Code ({currentPlan.formattedAmount})</span>
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'code'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Enter UTR / VIP Code</span>
                </button>
              </div>

              {activeTab === 'qr' ? (
                /* QR Code Display */
                <div className="space-y-3.5">
                  <div className="p-4 rounded-2xl bg-white text-slate-900 text-center flex flex-col items-center shadow-lg border border-emerald-300">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      Scan with GPay, PhonePe, Paytm, or BHIM
                    </span>
                    
                    {/* The Official Real QR Image */}
                    <div className="relative p-2 bg-black rounded-xl shadow-md border-2 border-emerald-500/30 my-1">
                      <img
                        src={UPI_PAYMENT_CONFIG.qrImagePath}
                        alt="Official UPI Payment QR Code"
                        className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg"
                        onError={(e) => {
                          if (qrFallbackUrl) {
                            (e.target as HTMLImageElement).src = qrFallbackUrl;
                          }
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs shadow-sm">
                        Pay {currentPlan.formattedAmount} ({currentPlan.name})
                      </span>
                      <span className="text-[11px] text-slate-700 font-medium">
                        Payee: <strong>{UPI_PAYMENT_CONFIG.name}</strong>
                      </span>
                    </div>

                    {/* Supported Apps */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-center gap-1 text-[10px] text-slate-500 font-medium">
                      <span className="px-2 py-0.5 rounded bg-slate-100">Google Pay</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">PhonePe</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">Paytm</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">BHIM UPI</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">Cred</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">Any Bank App</span>
                    </div>
                  </div>

                  {/* Copy UPI & Open App */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleCopyUpiId}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 hover:text-white flex items-center justify-center gap-2 transition-colors text-xs font-mono"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUpi ? 'Copied UPI ID!' : `Copy: ${UPI_PAYMENT_CONFIG.vpa}`}</span>
                    </button>

                    <a
                      href={upiUrl}
                      className="py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold flex items-center justify-center gap-1.5 transition-all text-xs"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Open UPI App ({currentPlan.formattedAmount})</span>
                    </a>
                  </div>
                </div>
              ) : null}

              {/* UTR / Transaction Input Section */}
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-medium text-emerald-200/90 block">
                  Step 2: Enter 12-digit UPI Transaction / UTR ID after paying {currentPlan.formattedAmount}:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleVerify();
                      }
                    }}
                    placeholder="e.g. 12-digit UTR or VIP Code (e.g. Dattatray@1511)"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#051713] border border-emerald-500/40 text-white placeholder-emerald-700 font-mono text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                  <button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0 cursor-pointer"
                  >
                    {verifying ? (
                      <span>Verifying…</span>
                    ) : (
                      <>
                        <span>Verify &amp; Unlock</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Info className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>UPI Ref No / UTR or VIP Passcode</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-400 font-medium">VIP Quick:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setUtrInput('Dattatray@1511');
                        setTimeout(handleVerify, 50);
                      }}
                      className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 font-mono text-[9.5px] border border-emerald-500/30 transition-colors"
                      title="Quick Unlock with Dattatray@1511"
                    >
                      Dattatray@1511
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUtrInput('DATTA49');
                        setTimeout(handleVerify, 50);
                      }}
                      className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 font-mono text-[9.5px] border border-amber-500/30 transition-colors"
                      title="Quick Unlock with DATTA49"
                    >
                      DATTA49
                    </button>
                  </div>
                </div>

                {/* Collapsible Forgot VIP Code / Help Section */}
                <div className="pt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowForgotHelp((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer group"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="underline underline-offset-2">Forgot your VIP Code or UPI Transaction ID?</span>
                    {showForgotHelp ? (
                      <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </button>

                  {showForgotHelp && (
                    <div className="mt-2 p-3.5 rounded-xl bg-[#031510] border border-emerald-500/30 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200 text-left">
                      {/* For UPI Payers */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Paid via Google Pay, PhonePe, or Paytm?</span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 leading-relaxed pl-5">
                          Open your UPI payment app &rarr; go to <strong>History / Transactions</strong> &rarr; find the payment to <strong>{UPI_PAYMENT_CONFIG.name}</strong> &rarr; copy the <strong>12-digit UPI Ref / UTR No</strong>. Paste it into the box above anytime to re-activate instantly.
                        </p>
                      </div>

                      <div className="border-t border-emerald-500/20 pt-2.5 space-y-2">
                        {/* For VIP Code Holders */}
                        <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          <span>Forgot your custom VIP Passcode?</span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 leading-relaxed pl-5">
                          You can try your master phone passcode{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setUtrInput('8010803756');
                              setTimeout(handleVerify, 50);
                            }}
                            className="text-amber-300 font-mono font-bold underline hover:text-amber-200"
                            title="Auto-fill 8010803756"
                          >
                            8010803756
                          </button>{' '}
                          or message Datta Sable directly on WhatsApp for instant 1-on-1 code recovery.
                        </p>
                        <div className="pl-5 pt-1">
                          <a
                            href="https://wa.me/918010803756?text=Hi%20Datta%2C%20I%20need%20help%20recovering%20my%20VIP%20code%20or%20verifying%20my%20UPI%20payment%20on%20excel.dattasable.com."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Datta (+91 8010803756)</span>
                            <ExternalLink className="w-3 h-3 opacity-80" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <HelpCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Trust Footer */}
              <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  NPCI UPI Verified
                </span>
                <span>•</span>
                <span>Instant Automatic Activation</span>
                <span>•</span>
                <span>100% Satisfaction Guarantee</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
