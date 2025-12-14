/**
 * Google Analytics 4 Tracking Utilities
 *
 * Provides helper functions for tracking events in GA4
 */

// Type definitions are in src/types/gtag.d.ts
type GtagCommand = 'config' | 'event' | 'js' | 'set';
type GtagEventParams = Record<string, any>;

/**
 * Track a custom event in Google Analytics
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
}

/**
 * Track a page view in Google Analytics
 */
export function trackPageView(url: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: url,
    });
  }
}

/**
 * Track a purchase/transaction in Google Analytics
 */
export function trackPurchase(
  transactionId: string,
  value: number,
  currency: string = 'GBP',
  items?: Array<{
    item_id: string;
    item_name: string;
    item_category?: string;
    price: number;
    quantity?: number;
  }>
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items,
    });
  }
}

/**
 * Track product view
 */
export function trackProductView(
  productId: string,
  productName: string,
  category?: string,
  price?: number
): void {
  trackEvent('view_item', {
    currency: 'GBP',
    value: price || 0,
    items: [
      {
        item_id: productId,
        item_name: productName,
        item_category: category,
        price: price || 0,
      },
    ],
  });
}

/**
 * Track wizard/checkout start
 */
export function trackBeginCheckout(
  productId: string,
  productName: string,
  value: number
): void {
  trackEvent('begin_checkout', {
    currency: 'GBP',
    value,
    items: [
      {
        item_id: productId,
        item_name: productName,
        price: value,
      },
    ],
  });
}

/**
 * Track document download
 */
export function trackDownload(
  documentId: string,
  documentName: string,
  documentType: string
): void {
  trackEvent('file_download', {
    file_name: documentName,
    file_extension: 'pdf',
    file_type: documentType,
    item_id: documentId,
  });
}
