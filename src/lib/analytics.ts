/**
 * Analytics Tracking Utilities
 *
 * Provides helper functions for tracking events in:
 * - Google Analytics 4 (GA4)
 * - Google Ads conversion tracking
 * - Facebook Pixel
 *
 * Type definitions are in src/types/gtag.d.ts
 */

/**
 * Track a custom event in both Google Analytics and Facebook Pixel
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
): void {
  // Google Analytics / Google Ads
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }

  // Facebook Pixel - map common events
  if (typeof window !== 'undefined' && window.fbq) {
    const fbEventName = mapToFacebookEvent(eventName);
    if (fbEventName) {
      window.fbq('track', fbEventName, eventParams);
    }
  }
}

/**
 * Map GA4 event names to Facebook standard events
 */
function mapToFacebookEvent(gaEventName: string): string | null {
  const eventMap: Record<string, string> = {
    page_view: 'PageView',
    view_item: 'ViewContent',
    add_to_cart: 'AddToCart',
    begin_checkout: 'InitiateCheckout',
    purchase: 'Purchase',
    lead: 'Lead',
    sign_up: 'CompleteRegistration',
    search: 'Search',
  };
  return eventMap[gaEventName.toLowerCase()] || null;
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
 * Track a purchase/transaction in Google Analytics and Facebook Pixel
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
  // Google Analytics / Google Ads
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items,
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value,
      currency,
      content_ids: items?.map(i => i.item_id) || [],
      content_name: items?.map(i => i.item_name).join(', ') || '',
      content_type: 'product',
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
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
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

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value,
      currency: 'GBP',
      content_ids: [productId],
      content_name: productName,
      content_type: 'product',
    });
  }
}

/**
 * Track lead capture (email signups from free tools)
 */
export function trackLead(source: string, email?: string): void {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'generate_lead', {
      event_category: 'engagement',
      event_label: source,
      value: 1,
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: source,
      content_category: 'free_tool',
    });
  }
}

/**
 * Track add to cart (wizard start)
 */
export function trackAddToCart(
  productId: string,
  productName: string,
  value: number
): void {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
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

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      value,
      currency: 'GBP',
      content_ids: [productId],
      content_name: productName,
      content_type: 'product',
    });
  }
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
