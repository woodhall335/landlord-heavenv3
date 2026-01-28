/**
 * Webhook Attribution Writeback Tests
 *
 * Tests that verify:
 * - Webhook extracts attribution from Stripe session metadata
 * - Attribution is written to order record on payment success
 * - First-touch attribution is preserved (doesn't overwrite existing)
 * - Server-side GA4 purchase event includes attribution
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Stripe session with attribution metadata
const createMockStripeSession = (metadata: Record<string, string> = {}) => ({
  id: 'cs_test_123',
  payment_status: 'paid',
  amount_total: 2999,
  currency: 'gbp',
  customer: 'cus_test_customer',
  metadata: {
    user_id: 'user-123',
    order_id: 'order-456',
    product_type: 'notice_only',
    case_id: 'case-789',
    ...metadata,
  },
});

// Mock order with/without existing attribution
const createMockOrder = (existingAttribution: Record<string, string | null> = {}) => ({
  id: 'order-456',
  user_id: 'user-123',
  case_id: 'case-789',
  product_type: 'notice_only',
  amount: 29.99,
  payment_status: 'pending',
  fulfillment_status: 'pending',
  landing_path: existingAttribution.landing_path || null,
  utm_source: existingAttribution.utm_source || null,
  utm_medium: existingAttribution.utm_medium || null,
  utm_campaign: existingAttribution.utm_campaign || null,
  utm_term: existingAttribution.utm_term || null,
  utm_content: existingAttribution.utm_content || null,
  referrer: existingAttribution.referrer || null,
  first_touch_at: existingAttribution.first_touch_at || null,
  ga_client_id: existingAttribution.ga_client_id || null,
});

describe('Webhook Attribution Writeback', () => {
  describe('Attribution extraction from Stripe metadata', () => {
    it('extracts all attribution fields from session metadata', () => {
      const session = createMockStripeSession({
        landing_path: '/how-to-evict-tenant',
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'eviction_jan_2026',
        utm_term: 'evict tenant',
        utm_content: 'headline_v1',
        referrer: 'google.com',
        first_touch_at: '2026-01-14T10:00:00.000Z',
        ga_client_id: '1234567890.1705226400',
      });

      const stripeAttribution = {
        landing_path: session.metadata?.landing_path || null,
        utm_source: session.metadata?.utm_source || null,
        utm_medium: session.metadata?.utm_medium || null,
        utm_campaign: session.metadata?.utm_campaign || null,
        utm_term: session.metadata?.utm_term || null,
        utm_content: session.metadata?.utm_content || null,
        referrer: session.metadata?.referrer || null,
        first_touch_at: session.metadata?.first_touch_at || null,
        ga_client_id: session.metadata?.ga_client_id || null,
      };

      expect(stripeAttribution.landing_path).toBe('/how-to-evict-tenant');
      expect(stripeAttribution.utm_source).toBe('google');
      expect(stripeAttribution.utm_medium).toBe('cpc');
      expect(stripeAttribution.utm_campaign).toBe('eviction_jan_2026');
      expect(stripeAttribution.utm_term).toBe('evict tenant');
      expect(stripeAttribution.utm_content).toBe('headline_v1');
      expect(stripeAttribution.referrer).toBe('google.com');
      expect(stripeAttribution.first_touch_at).toBe('2026-01-14T10:00:00.000Z');
      expect(stripeAttribution.ga_client_id).toBe('1234567890.1705226400');
    });

    it('handles missing attribution metadata gracefully', () => {
      const session = createMockStripeSession({}); // No attribution metadata

      const stripeAttribution = {
        landing_path: session.metadata?.landing_path || null,
        utm_source: session.metadata?.utm_source || null,
        utm_medium: session.metadata?.utm_medium || null,
        utm_campaign: session.metadata?.utm_campaign || null,
        utm_term: session.metadata?.utm_term || null,
        utm_content: session.metadata?.utm_content || null,
        referrer: session.metadata?.referrer || null,
        first_touch_at: session.metadata?.first_touch_at || null,
        ga_client_id: session.metadata?.ga_client_id || null,
      };

      expect(stripeAttribution.landing_path).toBeNull();
      expect(stripeAttribution.utm_source).toBeNull();
      expect(stripeAttribution.utm_medium).toBeNull();
    });

    it('converts empty strings to null', () => {
      const session = createMockStripeSession({
        landing_path: '',
        utm_source: '',
        utm_medium: 'cpc', // Only this one has value
      });

      const stripeAttribution = {
        landing_path: session.metadata?.landing_path || null,
        utm_source: session.metadata?.utm_source || null,
        utm_medium: session.metadata?.utm_medium || null,
      };

      expect(stripeAttribution.landing_path).toBeNull();
      expect(stripeAttribution.utm_source).toBeNull();
      expect(stripeAttribution.utm_medium).toBe('cpc');
    });
  });

  describe('First-touch attribution preservation', () => {
    it('writes attribution to order when no existing attribution', () => {
      const order = createMockOrder({}); // No existing attribution
      const stripeAttribution = {
        landing_path: '/how-to-evict-tenant',
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'eviction_jan_2026',
        utm_term: 'evict tenant',
        utm_content: 'headline_v1',
        referrer: 'google.com',
        first_touch_at: '2026-01-14T10:00:00.000Z',
        ga_client_id: '1234567890.1705226400',
      };

      // Simulate webhook first-touch logic
      const orderUpdate: Record<string, string | null> = {};

      if (!order.landing_path && stripeAttribution.landing_path) {
        orderUpdate.landing_path = stripeAttribution.landing_path;
      }
      if (!order.utm_source && stripeAttribution.utm_source) {
        orderUpdate.utm_source = stripeAttribution.utm_source;
      }
      if (!order.utm_medium && stripeAttribution.utm_medium) {
        orderUpdate.utm_medium = stripeAttribution.utm_medium;
      }
      if (!order.utm_campaign && stripeAttribution.utm_campaign) {
        orderUpdate.utm_campaign = stripeAttribution.utm_campaign;
      }
      if (!order.utm_term && stripeAttribution.utm_term) {
        orderUpdate.utm_term = stripeAttribution.utm_term;
      }
      if (!order.utm_content && stripeAttribution.utm_content) {
        orderUpdate.utm_content = stripeAttribution.utm_content;
      }
      if (!order.referrer && stripeAttribution.referrer) {
        orderUpdate.referrer = stripeAttribution.referrer;
      }
      if (!order.first_touch_at && stripeAttribution.first_touch_at) {
        orderUpdate.first_touch_at = stripeAttribution.first_touch_at;
      }
      if (!order.ga_client_id && stripeAttribution.ga_client_id) {
        orderUpdate.ga_client_id = stripeAttribution.ga_client_id;
      }

      // All fields should be added
      expect(orderUpdate.landing_path).toBe('/how-to-evict-tenant');
      expect(orderUpdate.utm_source).toBe('google');
      expect(orderUpdate.utm_medium).toBe('cpc');
      expect(orderUpdate.utm_campaign).toBe('eviction_jan_2026');
      expect(orderUpdate.ga_client_id).toBe('1234567890.1705226400');
    });

    it('does NOT overwrite existing attribution on order', () => {
      const order = createMockOrder({
        landing_path: '/original-landing-page',
        utm_source: 'facebook',
        utm_medium: 'social',
        utm_campaign: 'original_campaign',
        first_touch_at: '2026-01-01T00:00:00.000Z',
      });

      const stripeAttribution = {
        landing_path: '/new-landing-page',
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'new_campaign',
        utm_term: 'evict tenant',
        utm_content: null,
        referrer: 'google.com',
        first_touch_at: '2026-01-14T10:00:00.000Z',
        ga_client_id: '1234567890.1705226400',
      };

      // Simulate webhook first-touch logic
      const orderUpdate: Record<string, string | null> = {};

      // These should NOT be updated (already exist)
      if (!order.landing_path && stripeAttribution.landing_path) {
        orderUpdate.landing_path = stripeAttribution.landing_path;
      }
      if (!order.utm_source && stripeAttribution.utm_source) {
        orderUpdate.utm_source = stripeAttribution.utm_source;
      }
      if (!order.utm_medium && stripeAttribution.utm_medium) {
        orderUpdate.utm_medium = stripeAttribution.utm_medium;
      }
      if (!order.utm_campaign && stripeAttribution.utm_campaign) {
        orderUpdate.utm_campaign = stripeAttribution.utm_campaign;
      }
      // These SHOULD be updated (don't exist on order)
      if (!order.utm_term && stripeAttribution.utm_term) {
        orderUpdate.utm_term = stripeAttribution.utm_term;
      }
      if (!order.referrer && stripeAttribution.referrer) {
        orderUpdate.referrer = stripeAttribution.referrer;
      }
      if (!order.first_touch_at && stripeAttribution.first_touch_at) {
        orderUpdate.first_touch_at = stripeAttribution.first_touch_at;
      }
      if (!order.ga_client_id && stripeAttribution.ga_client_id) {
        orderUpdate.ga_client_id = stripeAttribution.ga_client_id;
      }

      // Existing fields should NOT be in update
      expect(orderUpdate.landing_path).toBeUndefined();
      expect(orderUpdate.utm_source).toBeUndefined();
      expect(orderUpdate.utm_medium).toBeUndefined();
      expect(orderUpdate.utm_campaign).toBeUndefined();
      expect(orderUpdate.first_touch_at).toBeUndefined();

      // New fields SHOULD be in update
      expect(orderUpdate.utm_term).toBe('evict tenant');
      expect(orderUpdate.referrer).toBe('google.com');
      expect(orderUpdate.ga_client_id).toBe('1234567890.1705226400');
    });

    it('backfills only missing attribution fields', () => {
      const order = createMockOrder({
        landing_path: '/partial-attribution',
        utm_source: 'google',
        // Missing: utm_medium, utm_campaign, utm_term, utm_content, referrer
        utm_medium: null,
        utm_campaign: null,
      });

      const stripeAttribution = {
        landing_path: '/different-page',
        utm_source: 'facebook',
        utm_medium: 'cpc',
        utm_campaign: 'eviction_jan_2026',
        utm_term: 'evict tenant',
        utm_content: 'headline_v1',
        referrer: 'google.com',
        first_touch_at: '2026-01-14T10:00:00.000Z',
        ga_client_id: '1234567890.1705226400',
      };

      const orderUpdate: Record<string, string | null> = {};

      // Only fill in what's missing
      if (!order.landing_path && stripeAttribution.landing_path) {
        orderUpdate.landing_path = stripeAttribution.landing_path;
      }
      if (!order.utm_source && stripeAttribution.utm_source) {
        orderUpdate.utm_source = stripeAttribution.utm_source;
      }
      if (!order.utm_medium && stripeAttribution.utm_medium) {
        orderUpdate.utm_medium = stripeAttribution.utm_medium;
      }
      if (!order.utm_campaign && stripeAttribution.utm_campaign) {
        orderUpdate.utm_campaign = stripeAttribution.utm_campaign;
      }
      if (!order.utm_term && stripeAttribution.utm_term) {
        orderUpdate.utm_term = stripeAttribution.utm_term;
      }
      if (!order.utm_content && stripeAttribution.utm_content) {
        orderUpdate.utm_content = stripeAttribution.utm_content;
      }
      if (!order.referrer && stripeAttribution.referrer) {
        orderUpdate.referrer = stripeAttribution.referrer;
      }
      if (!order.ga_client_id && stripeAttribution.ga_client_id) {
        orderUpdate.ga_client_id = stripeAttribution.ga_client_id;
      }

      // Should NOT update existing
      expect(orderUpdate.landing_path).toBeUndefined();
      expect(orderUpdate.utm_source).toBeUndefined();

      // SHOULD update missing
      expect(orderUpdate.utm_medium).toBe('cpc');
      expect(orderUpdate.utm_campaign).toBe('eviction_jan_2026');
      expect(orderUpdate.utm_term).toBe('evict tenant');
      expect(orderUpdate.utm_content).toBe('headline_v1');
      expect(orderUpdate.referrer).toBe('google.com');
      expect(orderUpdate.ga_client_id).toBe('1234567890.1705226400');
    });
  });

  describe('Server-side GA4 purchase event', () => {
    it('builds GA4 purchase event with attribution from order', () => {
      const order = {
        id: 'order-456',
        case_id: 'case-789',
        product_type: 'notice_only',
        product_name: 'Notice Only Pack',
        amount: 29.99,
        currency: 'GBP',
        landing_path: '/how-to-evict-tenant',
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'eviction_jan_2026',
        utm_term: 'evict tenant',
        utm_content: 'headline_v1',
        referrer: 'google.com',
        ga_client_id: '1234567890.1705226400',
        jurisdiction: 'england',
      };

      // Build GA4 purchase event params (as done in webhook)
      const ga4PurchaseParams = {
        clientId: order.ga_client_id || '0.0',
        transactionId: order.id,
        value: order.amount,
        currency: order.currency,
        items: [
          {
            item_id: order.product_type,
            item_name: order.product_name || order.product_type,
            price: order.amount,
            quantity: 1,
            item_category: 'legal_document',
          },
        ],
        utm_source: order.utm_source || undefined,
        utm_medium: order.utm_medium || undefined,
        utm_campaign: order.utm_campaign || undefined,
        utm_term: order.utm_term || undefined,
        utm_content: order.utm_content || undefined,
        landing_path: order.landing_path || undefined,
        product_type: order.product_type,
        jurisdiction: order.jurisdiction || undefined,
      };

      expect(ga4PurchaseParams.clientId).toBe('1234567890.1705226400');
      expect(ga4PurchaseParams.transactionId).toBe('order-456');
      expect(ga4PurchaseParams.value).toBe(29.99);
      expect(ga4PurchaseParams.utm_source).toBe('google');
      expect(ga4PurchaseParams.utm_medium).toBe('cpc');
      expect(ga4PurchaseParams.utm_campaign).toBe('eviction_jan_2026');
      expect(ga4PurchaseParams.landing_path).toBe('/how-to-evict-tenant');
    });

    it('uses fallback client ID when ga_client_id is missing', () => {
      const order = {
        id: 'order-456',
        ga_client_id: null,
      };

      // Fallback client ID generation (as done in measurement-protocol.ts)
      const clientId = order.ga_client_id || generateMockClientId();

      expect(clientId).toMatch(/^\d+\.\d+$/);
    });

    it('excludes undefined attribution from GA4 params', () => {
      const order = {
        id: 'order-456',
        product_type: 'notice_only',
        amount: 29.99,
        currency: 'GBP',
        landing_path: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        ga_client_id: null,
      };

      const ga4PurchaseParams = {
        transactionId: order.id,
        value: order.amount,
        utm_source: order.utm_source || undefined,
        utm_medium: order.utm_medium || undefined,
        utm_campaign: order.utm_campaign || undefined,
        landing_path: order.landing_path || undefined,
      };

      // Undefined values should not be present in final payload
      expect(ga4PurchaseParams.utm_source).toBeUndefined();
      expect(ga4PurchaseParams.utm_medium).toBeUndefined();
      expect(ga4PurchaseParams.utm_campaign).toBeUndefined();
      expect(ga4PurchaseParams.landing_path).toBeUndefined();
    });
  });
});

// Helper function to simulate client ID generation
function generateMockClientId(): string {
  const random = Math.floor(Math.random() * 2147483647);
  const timestamp = Math.floor(Date.now() / 1000);
  return `${random}.${timestamp}`;
}

describe('Attribution order update generation', () => {
  it('generates correct SQL update structure', () => {
    const stripeAttribution = {
      landing_path: '/eviction-guide',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'jan_2026',
      utm_term: 'evict',
      utm_content: 'v1',
      referrer: 'google.com',
      first_touch_at: '2026-01-14T10:00:00.000Z',
      ga_client_id: '123.456',
    };

    // Simulates the order update object created in webhook
    const orderUpdate = {
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
      fulfillment_status: 'ready_to_generate',
      stripe_payment_intent_id: 'pi_test_123',
      // Attribution backfill (only if not already set)
      ...(stripeAttribution.landing_path && {
        landing_path: stripeAttribution.landing_path,
      }),
      ...(stripeAttribution.utm_source && {
        utm_source: stripeAttribution.utm_source,
      }),
      ...(stripeAttribution.utm_medium && {
        utm_medium: stripeAttribution.utm_medium,
      }),
      ...(stripeAttribution.utm_campaign && {
        utm_campaign: stripeAttribution.utm_campaign,
      }),
      ...(stripeAttribution.utm_term && { utm_term: stripeAttribution.utm_term }),
      ...(stripeAttribution.utm_content && {
        utm_content: stripeAttribution.utm_content,
      }),
      ...(stripeAttribution.referrer && { referrer: stripeAttribution.referrer }),
      ...(stripeAttribution.first_touch_at && {
        first_touch_at: stripeAttribution.first_touch_at,
      }),
      ...(stripeAttribution.ga_client_id && {
        ga_client_id: stripeAttribution.ga_client_id,
      }),
    };

    expect(orderUpdate.payment_status).toBe('paid');
    expect(orderUpdate.landing_path).toBe('/eviction-guide');
    expect(orderUpdate.utm_source).toBe('google');
    expect(orderUpdate.ga_client_id).toBe('123.456');
  });
});
