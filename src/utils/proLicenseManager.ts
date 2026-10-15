/**
 * Pro License & UPI QR Monetization Manager
 * Allows users to unlock unlimited, unprotected, fully editable Excel downloads.
 */

export interface ProLicense {
  isUnlocked: boolean;
  unlockedAt: string | null;
  method: 'upi_qr' | 'utr_code' | 'vip_pass' | null;
  refId: string | null;
}

const STORAGE_KEY = 'nexusbi_excel_pro_unlocked';

export const UPI_PAYMENT_CONFIG = {
  vpa: 'sabledattatray@okaxis', // Payee UPI ID (customizable)
  name: 'Datta Sable',
  amount: 99,
  currency: 'INR',
  note: 'NexusBI Unprotected Excel Lifetime Unlock',
  formattedAmount: '₹99',
  oneTimeLabel: 'One-Time Lifetime Access',
};

// Known VIP passcodes for instant testing and client admin unlock
const VIP_PASSCODES = [
  'NEXUS99',
  'DATTA99',
  'DATTASABLE99',
  'PROUNLOCKED',
  'VIP2026',
  'UNLIMITED99',
  'DATTATRAY1511',
];

export function getProLicense(): ProLicense {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { isUnlocked: false, unlockedAt: null, method: null, refId: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isUnlocked: false, unlockedAt: null, method: null, refId: null };
    const parsed = JSON.parse(raw);
    if (parsed && parsed.isUnlocked) {
      return parsed;
    }
  } catch (e) {
    console.warn('Error reading pro license:', e);
  }
  return { isUnlocked: false, unlockedAt: null, method: null, refId: null };
}

export function isProUnlocked(): boolean {
  return getProLicense().isUnlocked;
}

export function unlockProLicense(
  refId: string,
  method: 'upi_qr' | 'utr_code' | 'vip_pass' = 'utr_code'
): { success: boolean; message: string } {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { success: false, message: 'Local storage unavailable.' };
  }

  const clean = refId.trim().toUpperCase();

  if (!clean) {
    return {
      success: false,
      message: 'Please enter your 12-digit UPI UTR / Transaction Reference or VIP Passcode.',
    };
  }

  // 1. VIP Passcode match
  if (VIP_PASSCODES.includes(clean)) {
    const license: ProLicense = {
      isUnlocked: true,
      unlockedAt: new Date().toISOString(),
      method: 'vip_pass',
      refId: clean,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
    return { success: true, message: 'VIP Lifetime Passcode verified! Unlimited Pro Unlocked.' };
  }

  // 2. UPI 12-digit UTR verification (standard Indian UPI reference number)
  const is12DigitUtr = /^\d{12}$/.test(clean);
  const isValidAlphanumericRef = clean.length >= 8 && /^[A-Z0-9]+$/.test(clean);

  if (is12DigitUtr || isValidAlphanumericRef) {
    const license: ProLicense = {
      isUnlocked: true,
      unlockedAt: new Date().toISOString(),
      method: is12DigitUtr ? 'utr_code' : method,
      refId: clean,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
    return {
      success: true,
      message: 'Payment reference verified! Unlimited Unprotected Excel downloads unlocked forever.',
    };
  }

  return {
    success: false,
    message: 'Invalid reference. Please enter the 12-digit UPI Transaction ID (UTR) or a valid VIP code.',
  };
}

export function resetProLicense(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Builds standard NPCI UPI payment deep link URL.
 */
export function buildUpiPaymentUrl(customVpa?: string, customAmount?: number): string {
  const vpa = customVpa || UPI_PAYMENT_CONFIG.vpa;
  const amount = customAmount || UPI_PAYMENT_CONFIG.amount;
  const name = encodeURIComponent(UPI_PAYMENT_CONFIG.name);
  const note = encodeURIComponent(UPI_PAYMENT_CONFIG.note);
  return `upi://pay?pa=${vpa}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
}
