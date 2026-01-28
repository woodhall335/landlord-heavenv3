/**
 * GA4 Measurement Protocol Tests
 *
 * Tests for server-side GA4 event tracking:
 * - Configuration validation
 * - Client ID generation
 * - Purchase event payload structure
 * - Attribution inclusion in events
 * - Retry logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Store original env
const originalEnv = process.env;

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Measurement Protocol', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockFetch.mockReset();

    // Set env vars
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-TESTID123',
      GA_MEASUREMENT_PROTOCOL_SECRET: 'test_secret_key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('isMeasurementProtocolConfigured', () => {
    it('returns true when both env vars are set', async () => {
      const { isMeasurementProtocolConfigured } = await import(
        '../measurement-protocol'
      );

      expect(isMeasurementProtocolConfigured()).toBe(true);
    });

    it('returns false when measurement ID is missing', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = '';

      vi.resetModules();
      const { isMeasurementProtocolConfigured } = await import(
        '../measurement-protocol'
      );

      expect(isMeasurementProtocolConfigured()).toBe(false);
    });

    it('returns false when API secret is missing', async () => {
      process.env.GA_MEASUREMENT_PROTOCOL_SECRET = '';

      vi.resetModules();
      const { isMeasurementProtocolConfigured } = await import(
        '../measurement-protocol'
      );

      expect(isMeasurementProtocolConfigured()).toBe(false);
    });
  });

  describe('generateClientId', () => {
    it('generates client ID in GA format (random.timestamp)', async () => {
      const { generateClientId } = await import('../measurement-protocol');

      const clientId = generateClientId();

      expect(clientId).toMatch(/^\d+\.\d+$/);
    });

    it('generates unique client IDs', async () => {
      const { generateClientId } = await import('../measurement-protocol');

      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateClientId());
      }

      // Should have many unique IDs (allowing for some timestamp collision)
      expect(ids.size).toBeGreaterThan(90);
    });
  });

  describe('sendServerPurchaseEvent', () => {
    it('sends purchase event to GA4 endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const { sendServerPurchaseEvent } = await import(
        '../measurement-protocol'
      );

      const result = await sendServerPurchaseEvent({
        clientId: '1234567890.1705226400',
        transactionId: 'order-123',
        value: 29.99,
        currency: 'GBP',
      });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Verify URL
      const fetchUrl = mockFetch.mock.calls[0][0];
      expect(fetchUrl).toContain('https://www.google-analytics.com/mp/collect');
      expect(fetchUrl).toContain('measurement_id=G-TESTID123');
      expect(fetchUrl).toContain('api_secret=test_secret_key');
    });

    it('includes attribution in event params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const { sendServerPurchaseEvent } = await import(
        '../measurement-protocol'
      );

      await sendServerPurchaseEvent({
        clientId: '1234567890.1705226400',
        transactionId: 'order-123',
        value: 29.99,
        currency: 'GBP',
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'eviction_jan_2026',
        utm_term: 'evict tenant',
        utm_content: 'headline_v1',
        landing_path: '/how-to-evict-tenant',
        product_type: 'notice_only',
        jurisdiction: 'england',
      });

      // Parse the request body
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);

      expect(requestBody.events[0].params.utm_source).toBe('google');
      expect(requestBody.events[0].params.utm_medium).toBe('cpc');
      expect(requestBody.events[0].params.utm_campaign).toBe('eviction_jan_2026');
      expect(requestBody.events[0].params.utm_term).toBe('evict tenant');
      expect(requestBody.events[0].params.utm_content).toBe('headline_v1');
      expect(requestBody.events[0].params.landing_path).toBe(
        '/how-to-evict-tenant'
      );
      expect(requestBody.events[0].params.product_type).toBe('notice_only');
      expect(requestBody.events[0].params.jurisdiction).toBe('england');
    });

    it('includes transaction details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const { sendServerPurchaseEvent } = await import(
        '../measurement-protocol'
      );

      await sendServerPurchaseEvent({
        clientId: '1234567890.1705226400',
        transactionId: 'order-abc-123',
        value: 49.99,
        currency: 'GBP',
        items: [
          {
            item_id: 'complete_pack',
            item_name: 'Complete Eviction Pack',
            price: 49.99,
            quantity: 1,
            item_category: 'legal_document',
          },
        ],
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);

      expect(requestBody.events[0].name).toBe('purchase');
      expect(requestBody.events[0].params.transaction_id).toBe('order-abc-123');
      expect(requestBody.events[0].params.value).toBe(49.99);
      expect(requestBody.events[0].params.currency).toBe('GBP');
      expect(requestBody.events[0].params.items).toHaveLength(1);
      expect(requestBody.events[0].params.items[0].item_id).toBe('complete_pack');
    });

    it('includes client_id in payload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const { sendServerPurchaseEvent } = await import(
        '../measurement-protocol'
      );

      await sendServerPurchaseEvent({
        clientId: '9876543210.1705226400',
        transactionId: 'order-123',
        value: 29.99,
        currency: 'GBP',
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);

      expect(requestBody.client_id).toBe('9876543210.1705226400');
    });

    it('includes user_id when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const { sendServerPurchaseEvent } = await import(
        '../measurement-protocol'
      );

      await sendServerPurchaseEvent({
        clientId: '1234567890.1705226400',
        transactionId: 'order-123',
        value: 29.99,
        currency: 'GBP',
        userId: 'user-abc-123',
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);

      expect(requestBody.user_id).toBe('user-abc-123');
    });

    it('marks event as server-side', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const { sendServerPurchaseEvent } = await import(
        '../measurement-protocol'
      );

      await sendServerPurchaseEvent({
        clientId: '1234567890.1705226400',
        transactionId: 'order-123',
        value: 29.99,
        currency: 'GBP',
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);

      expect(requestBody.events[0].params.event_source).toBe('server');
    });

    it('returns error when not configured', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = '';

      vi.resetModules();
      const { sendServerPurchaseEvent } = await import(
        '../measurement-protocol'
      );

      const result = await sendServerPurchaseEvent({
        clientId: '1234567890.1705226400',
        transactionId: 'order-123',
        value: 29.99,
        currency: 'GBP',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Measurement Protocol not configured');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('handles fetch errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { sendServerPurchaseEvent } = await import(
        '../measurement-protocol'
      );

      const result = await sendServerPurchaseEvent({
        clientId: '1234567890.1705226400',
        transactionId: 'order-123',
        value: 29.99,
        currency: 'GBP',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('handles non-OK responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      const { sendServerPurchaseEvent } = await import(
        '../measurement-protocol'
      );

      const result = await sendServerPurchaseEvent({
        clientId: '1234567890.1705226400',
        transactionId: 'order-123',
        value: 29.99,
        currency: 'GBP',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('500');
    });
  });

  describe('sendServerPurchaseEventWithRetry', () => {
    it('succeeds on first attempt', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const { sendServerPurchaseEventWithRetry } = await import(
        '../measurement-protocol'
      );

      const result = await sendServerPurchaseEventWithRetry({
        clientId: '1234567890.1705226400',
        transactionId: 'order-123',
        value: 29.99,
        currency: 'GBP',
      });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('retries on failure and succeeds', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 204,
        });

      const { sendServerPurchaseEventWithRetry } = await import(
        '../measurement-protocol'
      );

      const result = await sendServerPurchaseEventWithRetry({
        clientId: '1234567890.1705226400',
        transactionId: 'order-123',
        value: 29.99,
        currency: 'GBP',
      });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('does not retry when not configured', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = '';

      vi.resetModules();
      const { sendServerPurchaseEventWithRetry } = await import(
        '../measurement-protocol'
      );

      const result = await sendServerPurchaseEventWithRetry({
        clientId: '1234567890.1705226400',
        transactionId: 'order-123',
        value: 29.99,
        currency: 'GBP',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Measurement Protocol not configured');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('respects max retries', async () => {
      mockFetch.mockRejectedValue(new Error('Persistent network error'));

      const { sendServerPurchaseEventWithRetry } = await import(
        '../measurement-protocol'
      );

      const result = await sendServerPurchaseEventWithRetry(
        {
          clientId: '1234567890.1705226400',
          transactionId: 'order-123',
          value: 29.99,
          currency: 'GBP',
        },
        2 // max 2 retries
      );

      expect(result.success).toBe(false);
      // 1 initial + 2 retries = 3 total calls
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Debug mode', () => {
    it('uses debug endpoint when debug=true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ validationMessages: [] }),
      });

      const { sendServerPurchaseEvent } = await import(
        '../measurement-protocol'
      );

      await sendServerPurchaseEvent(
        {
          clientId: '1234567890.1705226400',
          transactionId: 'order-123',
          value: 29.99,
          currency: 'GBP',
        },
        true // debug mode
      );

      const fetchUrl = mockFetch.mock.calls[0][0];
      expect(fetchUrl).toContain(
        'https://www.google-analytics.com/debug/mp/collect'
      );
    });

    it('returns validation errors from debug endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            validationMessages: [
              {
                fieldPath: 'events[0].params.value',
                description: 'Value must be a number',
              },
            ],
          }),
      });

      const { sendServerPurchaseEvent } = await import(
        '../measurement-protocol'
      );

      const result = await sendServerPurchaseEvent(
        {
          clientId: '1234567890.1705226400',
          transactionId: 'order-123',
          value: 29.99,
          currency: 'GBP',
        },
        true
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Value must be a number');
    });
  });
});

describe('GA4 purchase event payload structure', () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-TESTID123',
      GA_MEASUREMENT_PROTOCOL_SECRET: 'test_secret_key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('conforms to GA4 Measurement Protocol spec', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const { sendServerPurchaseEvent } = await import('../measurement-protocol');

    await sendServerPurchaseEvent({
      clientId: '1234567890.1705226400',
      transactionId: 'order-123',
      value: 29.99,
      currency: 'GBP',
      items: [
        {
          item_id: 'notice_only',
          item_name: 'Notice Only Pack',
          price: 29.99,
          quantity: 1,
        },
      ],
    });

    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);

    // Required top-level fields
    expect(requestBody).toHaveProperty('client_id');
    expect(requestBody).toHaveProperty('events');
    expect(Array.isArray(requestBody.events)).toBe(true);

    // Event structure
    const event = requestBody.events[0];
    expect(event).toHaveProperty('name', 'purchase');
    expect(event).toHaveProperty('params');

    // Required ecommerce params
    expect(event.params).toHaveProperty('transaction_id');
    expect(event.params).toHaveProperty('value');
    expect(event.params).toHaveProperty('currency');
    expect(event.params).toHaveProperty('items');

    // Item structure
    expect(event.params.items[0]).toHaveProperty('item_id');
    expect(event.params.items[0]).toHaveProperty('item_name');
    expect(event.params.items[0]).toHaveProperty('price');
    expect(event.params.items[0]).toHaveProperty('quantity');
  });

  it('excludes undefined attribution values from payload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const { sendServerPurchaseEvent } = await import('../measurement-protocol');

    await sendServerPurchaseEvent({
      clientId: '1234567890.1705226400',
      transactionId: 'order-123',
      value: 29.99,
      currency: 'GBP',
      // Only utm_source provided, others undefined
      utm_source: 'google',
    });

    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    const params = requestBody.events[0].params;

    // utm_source should be present
    expect(params.utm_source).toBe('google');

    // Others should be undefined (excluded from payload by || undefined)
    expect(params.utm_medium).toBeUndefined();
    expect(params.utm_campaign).toBeUndefined();
  });
});
