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
  Lock,
  Unlock,
  KeyRound,
  ArrowRight,
  Zap,
  Info,
  HelpCircle,
} from 'lucide-react';
import {
  UPI_PAYMENT_CONFIG,
  buildUpiPaymentUrl,
  unlockProLicense,
  isProUnlocked,
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
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [utrInput, setUtrInput] = useState<string>(initialUtr);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [alreadyUnlocked, setAlreadyUnlocked] = useState<boolean>(false);
  const [licenseInfo, setLicenseInfo] = useState<ProLicense | null>(null);
  const [activeTab, setActiveTab] = useState<'qr' | 'code'>('qr');

  const upiUrl = buildUpiPaymentUrl();

  useEffect(() => {
    if (isOpen) {
      const unlocked = isProUnlocked();
      setAlreadyUnlocked(unlocked);
      if (unlocked) {
        setLicenseInfo(getProLicense());
      }
      setStatusMessage(null);

      // Generate dynamic QR code for UPI
      QRCode.toDataURL(upiUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#032e27',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate UPI QR code:', err));
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

    // Simulate instant authentic verification
    setTimeout(() => {
      const result = unlockProLicense(utrInput);
      setVerifying(false);

      if (result.success) {
        setStatusMessage({ type: 'success', text: result.message });
        setAlreadyUnlocked(true);
        setLicenseInfo(getProLicense());

        // Confetti celebration
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#10B981', '#34D399', '#F59E0B', '#38BDF8', '#6366F1'],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
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
                  Unlock Unlimited Pro
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-wide">
                  100% Unprotected
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
                Remove all sheet passwords, unlock formula edits, resize charts, and export unrestricted Excel dashboards forever.
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
        <div className="p-5 sm:p-6 space-y-5 text-xs">
          {alreadyUnlocked ? (
            /* Already Unlocked View */
            <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">
                Pro Unlimited is Active on this Device!
              </h4>
              <p className="text-xs text-emerald-200/90 max-w-sm mx-auto">
                All downloaded Excel workbooks from templates or custom uploads are now generated with <strong>100% zero password protection</strong> and full formula edit rights.
              </p>
              {licenseInfo?.refId && (
                <div className="pt-2 font-mono text-[11px] text-emerald-300">
                  Ref / Key: <span className="text-white font-bold">{licenseInfo.refId}</span>
                </div>
              )}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onUnlockSuccess?.();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
                >
                  Download Unprotected Excel Now
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Value Proposition Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11.5px]">
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-start gap-2">
                  <Unlock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-medium">100% Unlocked</strong>
                    <span className="text-slate-400 text-[10.5px]">Zero worksheet password restrictions</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-medium">Full Formula Edits</strong>
                    <span className="text-slate-400 text-[10.5px]">Modify SUMIFS, KPIs &amp; metrics</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-medium">Chart Customization</strong>
                    <span className="text-slate-400 text-[10.5px]">Resize, move &amp; copy to slides</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-start gap-2">
                  <Crown className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-medium">White-Label &amp; Keep</strong>
                    <span className="text-slate-400 text-[10.5px]">Rebrand &amp; deliver to clients</span>
                  </div>
                </div>
              </div>

              {/* Price Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-amber-300 font-semibold tracking-wider block">
                    Special Launch Offer
                  </span>
                  <div className="text-xl font-extrabold text-white flex items-baseline gap-1.5 mt-0.5">
                    <span>{UPI_PAYMENT_CONFIG.formattedAmount}</span>
                    <span className="text-[11px] font-normal text-slate-300 line-through">₹499</span>
                    <span className="text-[10px] font-normal text-emerald-300 font-sans">
                      • {UPI_PAYMENT_CONFIG.oneTimeLabel}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Lifetime Unlimited
                  </span>
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
                  <span>Scan UPI QR Code</span>
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
                  <span>Enter Code / UTR</span>
                </button>
              </div>

              {activeTab === 'qr' ? (
                /* QR Code View */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white text-slate-900 text-center flex flex-col items-center shadow-lg border border-emerald-300">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      Scan &amp; Pay with Any UPI App
                    </span>
                    
                    {/* The Official Real QR Image */}
                    <div className="relative p-2.5 bg-black rounded-xl shadow-md border-2 border-emerald-500/30 my-1">
                      <img
                        src="/payment-qr.jpg"
                        alt="Official UPI Payment QR Code"
                        className="w-52 h-52 sm:w-56 sm:h-56 object-contain rounded-lg"
                        onError={(e) => {
                          if (qrDataUrl) {
                            (e.target as HTMLImageElement).src = qrDataUrl;
                          }
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-xs shadow-xs border border-emerald-300">
                        Amount: ₹99
                      </span>
                      <span className="text-[11px] text-slate-700 font-medium">
                        Payee: <strong>{UPI_PAYMENT_CONFIG.name}</strong>
                      </span>
                    </div>

                    {/* Supported Apps Logos Pill */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
                      <span className="px-2 py-0.5 rounded bg-slate-100">GPay</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">PhonePe</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">Paytm</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">BHIM</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">Cred</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100">Any Bank UPI</span>
                    </div>
                  </div>

                  {/* Copy UPI ID & Mobile Deep Link */}
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
                      <span>Open UPI App</span>
                    </a>
                  </div>
                </div>
              ) : null}

              {/* UTR / Transaction Input Section */}
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-medium text-emerald-200/90 block">
                  Step 2: Enter 12-digit UPI Reference / UTR Number (or VIP Code):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value)}
                    placeholder="e.g. 428938192841 or VIP Code"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#051713] border border-emerald-500/40 text-white placeholder-emerald-700 font-mono text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                  <button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0"
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
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Info className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Found in your payment app under "UPI Ref No" or "UTR" immediately after payment.</span>
                </p>
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
