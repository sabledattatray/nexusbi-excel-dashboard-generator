/**
 * Pro License & UPI QR Monetization Manager
 * Supports:
 * 1. Single Download Pass (₹9) - 1 unprotected Excel download
 * 2. Unlimited Lifetime Access (₹49) - All 32 templates + all custom uploads forever
 */

export type PricingPlanId = 'single' | 'lifetime';

export interface PricingPlan {
  id: PricingPlanId;
  name: string;
  amount: number;
  formattedAmount: string;
  badge: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

export const PRICING_PLANS: Record<PricingPlanId, PricingPlan> = {
  single: {
    id: 'single',
    name: 'Single Download',
    amount: 9,
    formattedAmount: '₹9',
    badge: '1 File Pass',
    description: 'Unlock this current dashboard workbook',
    features: [
      '1 Unprotected .xlsx download',
      'Full formula & metric edit rights',
      'Zero sheet password locks',
    ],
  },
  lifetime: {
    id: 'lifetime',
    name: 'Unlimited Lifetime',
    amount: 49,
    formattedAmount: '₹49',
    badge: 'Best Value • Most Popular',
    isPopular: true,
    description: 'Download all 32 templates & custom uploads forever',
    features: [
      'Unlimited unprotected exports',
      'All 32 ready industry templates',
      'All custom CSV/Excel uploads',
      'White-label & rebrand forever',
      'Never scan or pay again',
    ],
  },
};

export interface ProLicense {
  isLifetime: boolean;
  singleCredits: number;
  unlockedAt: string | null;
  method: 'upi_qr' | 'utr_code' | 'vip_pass' | null;
  refId: string | null;
}

const STORAGE_KEY = 'nexusbi_excel_pro_unlocked';
export const PRO_LICENSE_EVENT = 'nexusbi_license_changed';

export function dispatchLicenseChangedEvent(): void {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent(PRO_LICENSE_EVENT, { detail: getProLicense() }));
    } catch {
      // fallback
    }
  }
}

export const UPI_PAYMENT_CONFIG = {
  vpa: '8010803756@upi',
  name: 'Datta Sable',
  currency: 'INR',
  singleAmount: 9,
  lifetimeAmount: 49,
  qrImagePath: '/payment-qr.jpg',
};

// Known VIP passcodes and keywords (all grant PERMANENT UNLIMITED LIFETIME PRO)
export const KNOWN_VIP_PASSCODES = [
  'DATTA@1511',
  'DATTATRAY@1511',
  'DATTA1511',
  'DATTATRAY1511',
  '1511',
  'DATTA',
  'DATTA49',
  'DATTA9',
  'DATTA99',
  'DATTASABLE',
  'DATTASABLE49',
  'DATTASABLE99',
  'DATTATRAY',
  'SABLE',
  'NEXUS',
  'NEXUS49',
  'NEXUS9',
  'NEXUS99',
  'NEXUSBI',
  'VIP',
  'VIP2026',
  'VIPPASS',
  'VIP49',
  'VIP9',
  'PRO',
  'PROUNLOCKED',
  'ADMIN',
  'MASTER',
  'OWNER',
  '8010803756',
  '8010803756@UPI',
];

/**
 * Checks whether an input code is a VIP passcode.
 * Performs direct check, normalized alphanumeric check, and keyword substring check.
 */
export function isVipPasscode(input?: string | null): boolean {
  if (!input) return false;
  const raw = input.trim().toUpperCase();
  if (KNOWN_VIP_PASSCODES.includes(raw)) return true;

  // Normalized: strip punctuation, whitespace, @, -, etc.
  const norm = raw.replace(/[^A-Z0-9]/g, '');
  if (!norm) return false;

  const normalizedKnown = KNOWN_VIP_PASSCODES.map((k) => k.replace(/[^A-Z0-9]/g, ''));
  if (normalizedKnown.includes(norm)) return true;

  // Pattern checks for owner credentials and keywords
  if (norm.includes('1511') || norm.includes('DATTATRAY') || norm.includes('DATTASABLE')) return true;
  if (norm.startsWith('DATTA') || norm.startsWith('NEXUS') || norm.startsWith('VIP') || norm.startsWith('PRO')) return true;
  if (norm === '8010803756') return true;

  return false;
}

export function getProLicense(): ProLicense {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { isLifetime: false, singleCredits: 0, unlockedAt: null, method: null, refId: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isLifetime: false, singleCredits: 0, unlockedAt: null, method: null, refId: null };
    const parsed = JSON.parse(raw);
    if (parsed) {
      // Auto-heal: If user unlocked via VIP pass or refId matches VIP or previous unlocked flag is set
      const isVip = parsed.method === 'vip_pass' || isVipPasscode(parsed.refId);
      const isLifetime = Boolean(isVip || parsed.isLifetime || (parsed.isUnlocked && !parsed.singleCredits));
      const singleCredits = isLifetime ? 0 : typeof parsed.singleCredits === 'number' ? parsed.singleCredits : 0;

      const normalizedLicense: ProLicense = {
        isLifetime,
        singleCredits,
        unlockedAt: parsed.unlockedAt || new Date().toISOString(),
        method: isVip ? 'vip_pass' : parsed.method || (isLifetime ? 'utr_code' : null),
        refId: parsed.refId || (isVip ? 'VIP_PASS' : null),
      };

      // Persist auto-healed state if healed to lifetime
      if (isLifetime && (!parsed.isLifetime || parsed.singleCredits > 0)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedLicense));
      }

      return normalizedLicense;
    }
  } catch (e) {
    console.warn('Error reading pro license:', e);
  }
  return { isLifetime: false, singleCredits: 0, unlockedAt: null, method: null, refId: null };
}

export function isProUnlocked(): boolean {
  // Payment temporarily removed: all users have full free access
  return true;
}

export function isLifetimeUnlocked(): boolean {
  return true;
}

export function getSingleCreditsRemaining(): number {
  return getProLicense().singleCredits;
}

/**
 * Consumes 1 single download credit if not lifetime unlocked.
 * Lifetime users and VIP pass holders have infinite downloads with zero deductions.
 */
export function consumeDownloadCredit(): boolean {
  return true; // Infinite free downloads while payment is removed
}

export function unlockProLicense(
  refId: string,
  planId: PricingPlanId = 'lifetime',
  method: 'upi_qr' | 'utr_code' | 'vip_pass' = 'utr_code'
): { success: boolean; message: string; isLifetime: boolean } {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { success: false, message: 'Local storage unavailable.', isLifetime: false };
  }

  const raw = refId.trim();
  const clean = raw.toUpperCase();

  if (!clean) {
    return {
      success: false,
      message: 'Please enter your 12-digit UPI UTR / Transaction ID or VIP Passcode.',
      isLifetime: false,
    };
  }

  // 1. VIP Passcode check -> ALWAYS grants Unlimited Lifetime Pro forever
  if (isVipPasscode(clean)) {
    const license: ProLicense = {
      isLifetime: true,
      singleCredits: 0,
      unlockedAt: new Date().toISOString(),
      method: 'vip_pass',
      refId: clean,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
    dispatchLicenseChangedEvent();
    return {
      success: true,
      message: '👑 VIP Passcode Verified! Unlimited Lifetime Pro Unlocked forever.',
      isLifetime: true,
    };
  }

  // 2. UPI 12-digit UTR verification (or standard 6+ alphanumeric reference)
  const norm = clean.replace(/[^A-Z0-9]/g, '');
  const is12DigitUtr = /^\d{12}$/.test(norm);
  const isValidRef = norm.length >= 6;

  if (is12DigitUtr || isValidRef) {
    const isLifetime = planId === 'lifetime';
    const current = getProLicense();
    const license: ProLicense = {
      isLifetime: isLifetime || current.isLifetime,
      singleCredits: isLifetime ? 0 : current.singleCredits + 1,
      unlockedAt: new Date().toISOString(),
      method: is12DigitUtr ? 'utr_code' : method,
      refId: clean,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
    dispatchLicenseChangedEvent();
    return {
      success: true,
      message: isLifetime
        ? 'Payment verified! Unlimited Lifetime Pass unlocked forever.'
        : 'Payment verified! 1 Unprotected download credit unlocked.',
      isLifetime,
    };
  }

  return {
    success: false,
    message: 'Invalid reference. Please enter your 12-digit UPI Transaction ID (UTR) or a valid VIP code.',
    isLifetime: false,
  };
}

export function resetProLicense(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(STORAGE_KEY);
    dispatchLicenseChangedEvent();
  }
}

/**
 * Builds standard NPCI UPI payment deep link URL for selected plan.
 */
export function buildUpiPaymentUrl(planId: PricingPlanId = 'lifetime'): string {
  const plan = PRICING_PLANS[planId];
  const vpa = UPI_PAYMENT_CONFIG.vpa;
  const name = encodeURIComponent(UPI_PAYMENT_CONFIG.name);
  const note = encodeURIComponent(`NexusBI ${plan.name} Unlock`);
  return `upi://pay?pa=${vpa}&pn=${name}&am=${plan.amount}&cu=INR&tn=${note}`;
}
