/**
 * GA4 Measurement Protocol - Server-side Event Tracking
 *
 * Sends events directly to GA4 from the server, bypassing ad blockers.
 * Used as a fallback for critical events like purchases.
 *
 * Requires:
 * - NEXT_PUBLIC_GA_MEASUREMENT_ID: GA4 measurement ID (G-XXXXXXXXXX)
 * - GA_MEASUREMENT_PROTOCOL_SECRET: API secret from GA4 Admin > Data Streams > Measurement Protocol API secrets
 *
 * @see https://developers.google.com/analytics/devguides/collection/protocol/ga4
 */

import { logger } from '@/lib/logger';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_API_SECRET = process.env.GA_MEASUREMENT_PROTOCOL_SECRET;

// GA4 Measurement Protocol endpoint
const GA4_MP_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

// For debugging (sends to validation endpoint, returns response)
const GA4_MP_DEBUG_ENDPOINT = 'https://www.google-analytics.com/debug/mp/collect';

interface GA4PurchaseItem {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
  item_category?: string;
}

interface GA4PurchaseParams {
  /** GA client ID (from _ga cookie or generated) */
  clientId: string;
  /** Unique transaction ID for deduplication */
  transactionId: string;
  /** Purchase value */
  value: number;
  /** Currency code (default: GBP) */
  currency?: string;
  /** Purchased items */
  items?: GA4PurchaseItem[];
  /** UTM source */
  utm_source?: string;
  /** UTM medium */
  utm_medium?: string;
  /** UTM campaign */
  utm_campaign?: string;
  /** UTM term */
  utm_term?: string;
  /** UTM content */
  utm_content?: string;
  /** Landing page path */
  landing_path?: string;
  /** Product type */
  product_type?: string;
  /** Jurisdiction */
  jurisdiction?: string;
  /** User ID (optional, for user-ID tracking) */
  userId?: string;
  /** Session ID (optional) */
  sessionId?: string;
  /** Engagement time in milliseconds (optional, helps with metrics) */
  engagementTimeMsec?: number;
}

interface GA4EventPayload {
  client_id: string;
  user_id?: string;
  events: Array<{
    name: string;
    params: Record<string, any>;
  }>;
}

/**
 * Check if Measurement Protocol is configured
 */
export function isMeasurementProtocolConfigured(): boolean {
  return Boolean(GA_MEASUREMENT_ID && GA_API_SECRET);
}

/**
 * Generate a pseudo-random client ID for server-side events
 * This is used when no client ID is available (e.g., from cookies)
 *
 * Format: random.timestamp (similar to GA cookie format)
 */
export function generateClientId(): string {
  const random = Math.floor(Math.random() * 2147483647);
  const timestamp = Math.floor(Date.now() / 1000);
  return `${random}.${timestamp}`;
}

/**
 * Send a purchase event to GA4 via Measurement Protocol
 *
 * This bypasses client-side ad blockers by sending directly to GA4.
 * Use the same transaction_id as client-side events for deduplication.
 *
 * @param params - Purchase event parameters
 * @param debug - If true, uses validation endpoint (returns errors but doesn't record)
 * @returns Promise resolving to success status
 */
export async function sendServerPurchaseEvent(
  params: GA4PurchaseParams,
  debug: boolean = false
): Promise<{ success: boolean; error?: string }> {
  // Check configuration
  if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
    logger.warn('GA4 Measurement Protocol not configured, skipping server-side purchase event', {
      hasMeasurementId: Boolean(GA_MEASUREMENT_ID),
      hasApiSecret: Boolean(GA_API_SECRET),
    });
    return { success: false, error: 'Measurement Protocol not configured' };
  }

  const {
    clientId,
    transactionId,
    value,
    currency = 'GBP',
    items = [],
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
    landing_path,
    product_type,
    jurisdiction,
    userId,
    sessionId,
    engagementTimeMsec = 1000, // Default 1 second engagement
  } = params;

  // Build the event payload
  const payload: GA4EventPayload = {
    client_id: clientId,
    ...(userId && { user_id: userId }),
    events: [
      {
        name: 'purchase',
        params: {
          // Required ecommerce params
          transaction_id: transactionId,
          value,
          currency,
          items: items.map((item) => ({
            item_id: item.item_id,
            item_name: item.item_name,
            price: item.price,
            quantity: item.quantity || 1,
            item_category: item.item_category || 'legal_document',
          })),
          // Attribution params (custom dimensions in GA4)
          utm_source: utm_source || undefined,
          utm_medium: utm_medium || undefined,
          utm_campaign: utm_campaign || undefined,
          utm_term: utm_term || undefined,
          utm_content: utm_content || undefined,
          landing_path: landing_path || undefined,
          product_type: product_type || undefined,
          jurisdiction: jurisdiction || undefined,
          // Session params
          ...(sessionId && { session_id: sessionId }),
          engagement_time_msec: engagementTimeMsec,
          // Mark as server-side event for analysis
          event_source: 'server',
        },
      },
    ],
  };

  // Build the URL with query params
  const endpoint = debug ? GA4_MP_DEBUG_ENDPOINT : GA4_MP_ENDPOINT;
  const url = `${endpoint}?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Debug endpoint returns validation results
    if (debug) {
      const result = await response.json();
      if (result.validationMessages && result.validationMessages.length > 0) {
        logger.error('GA4 Measurement Protocol validation errors', {
          transactionId,
          errors: result.validationMessages,
        });
        return {
          success: false,
          error: result.validationMessages.map((m: any) => m.description).join(', '),
        };
      }
    }

    // Non-debug endpoint returns empty body on success (204 or 2xx)
    if (response.ok) {
      logger.info('GA4 server-side purchase event sent', {
        transactionId,
        value,
        currency,
        clientId,
        hasItems: items.length > 0,
      });
      return { success: true };
    }

    // Log error for non-OK response
    const errorText = await response.text();
    logger.error('GA4 Measurement Protocol request failed', {
      transactionId,
      status: response.status,
      error: errorText,
    });
    return { success: false, error: `HTTP ${response.status}: ${errorText}` };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('GA4 Measurement Protocol network error', {
      transactionId,
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Send a purchase event with retry logic
 *
 * @param params - Purchase event parameters
 * @param maxRetries - Maximum number of retries (default: 2)
 * @returns Promise resolving to success status
 */
export async function sendServerPurchaseEventWithRetry(
  params: GA4PurchaseParams,
  maxRetries: number = 2
): Promise<{ success: boolean; error?: string }> {
  let lastError: string | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await sendServerPurchaseEvent(params);

    if (result.success) {
      return result;
    }

    lastError = result.error;

    // Don't retry if not configured
    if (result.error === 'Measurement Protocol not configured') {
      return result;
    }

    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }

  return { success: false, error: lastError };
}
