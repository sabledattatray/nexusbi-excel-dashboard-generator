// Google Analytics 4 (GA4) Event Dispatcher

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID = 'G-Q4GEY4N9WN';

/**
 * Safely send an event to Google Analytics
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  try {
    window.gtag('event', eventName, {
      ...params,
      page_location: window.location.href,
      page_title: document.title,
    });
  } catch (err) {
    // Silently suppress tracking errors to protect user experience
    console.debug('Analytics error:', err);
  }
}

/**
 * Track virtual page views on tab / view switches
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  try {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      page_location: window.location.origin + pagePath,
    });
  } catch {
    // ignore
  }
}
