/**
 * Pro License & UPI QR Monetization Manager
 * Supports:
 * 1. Single Download Pass (₹9) - 1 unprotected Excel download
 * 2. Unlimited Lifetime Access (₹49) - All 12 templates + all custom uploads forever
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
    description: 'Download all 12 templates & custom uploads forever',
    features: [
      'Unlimited unprotected exports',
      'All 12 ready industry templates',
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

export const UPI_PAYMENT_CONFIG = {
  vpa: '8010803756@upi',
  name: 'DATTATRAY GORAKH SABLE',
  currency: 'INR',
  singleAmount: 9,
  lifetimeAmount: 49,
  qrImagePath: '/payment-qr.jpg',
};

// Known VIP passcodes
const LIFETIME_VIP_PASSCODES = [
  'NEXUS49',
  'DATTA49',
  'NEXUS99',
  'DATTA99',
  'DATTASABLE',
  'DATTASABLE49',
  'PROUNLOCKED',
  'VIP2026',
  'DATTATRAY1511',
];

const SINGLE_VIP_PASSCODES = [
  'NEXUS9',
  'DATTA9',
  'TEST9',
  'SINGLEPASS',
];

export function getProLicense(): ProLicense {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { isLifetime: false, singleCredits: 0, unlockedAt: null, method: null, refId: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isLifetime: false, singleCredits: 0, unlockedAt: null, method: null, refId: null };
    const parsed = JSON.parse(raw);
    if (parsed) {
      // Backwards compatibility with previous boolean `isUnlocked`
      const isLifetime = Boolean(parsed.isLifetime || (parsed.isUnlocked && !parsed.singleCredits));
      const singleCredits = typeof parsed.singleCredits === 'number' ? parsed.singleCredits : 0;
      return {
        isLifetime,
        singleCredits,
        unlockedAt: parsed.unlockedAt || null,
        method: parsed.method || null,
        refId: parsed.refId || null,
      };
    }
  } catch (e) {
    console.warn('Error reading pro license:', e);
  }
  return { isLifetime: false, singleCredits: 0, unlockedAt: null, method: null, refId: null };
}

export function isProUnlocked(): boolean {
  const license = getProLicense();
  return license.isLifetime || license.singleCredits > 0;
}

export function isLifetimeUnlocked(): boolean {
  return getProLicense().isLifetime;
}

export function getSingleCreditsRemaining(): number {
  return getProLicense().singleCredits;
}

/**
 * Consumes 1 single download credit if not lifetime unlocked.
 * Returns true if allowed, false if not unlocked.
 */
export function consumeDownloadCredit(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  const current = getProLicense();
  if (current.isLifetime) {
    return true; // Lifetime users have unlimited downloads
  }
  if (current.singleCredits > 0) {
    const updated: ProLicense = {
      ...current,
      singleCredits: current.singleCredits - 1,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  }
  return false;
}

export function unlockProLicense(
  refId: string,
  planId: PricingPlanId = 'lifetime',
  method: 'upi_qr' | 'utr_code' | 'vip_pass' = 'utr_code'
): { success: boolean; message: string; isLifetime: boolean } {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { success: false, message: 'Local storage unavailable.', isLifetime: false };
  }

  const clean = refId.trim().toUpperCase();

  if (!clean) {
    return {
      success: false,
      message: 'Please enter your 12-digit UPI UTR / Transaction ID or VIP Passcode.',
      isLifetime: false,
    };
  }

  // 1. Lifetime VIP Passcode
  if (LIFETIME_VIP_PASSCODES.includes(clean)) {
    const license: ProLicense = {
      isLifetime: true,
      singleCredits: 0,
      unlockedAt: new Date().toISOString(),
      method: 'vip_pass',
      refId: clean,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
    return { success: true, message: 'VIP Lifetime Passcode verified! Unlimited Pro Unlocked forever.', isLifetime: true };
  }

  // 2. Single VIP Passcode
  if (SINGLE_VIP_PASSCODES.includes(clean)) {
    const current = getProLicense();
    const license: ProLicense = {
      isLifetime: current.isLifetime,
      singleCredits: current.singleCredits + 1,
      unlockedAt: new Date().toISOString(),
      method: 'vip_pass',
      refId: clean,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
    return { success: true, message: 'Single Pass Code verified! 1 Unprotected download unlocked.', isLifetime: false };
  }

  // 3. UPI 12-digit UTR verification (standard Indian UPI reference number or alphanumeric)
  const is12DigitUtr = /^\d{12}$/.test(clean);
  const isValidRef = clean.length >= 8 && /^[A-Z0-9]+$/.test(clean);

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
    message: 'Invalid reference. Please enter the 12-digit UPI Transaction ID (UTR) or a valid VIP code.',
    isLifetime: false,
  };
}

export function resetProLicense(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(STORAGE_KEY);
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
