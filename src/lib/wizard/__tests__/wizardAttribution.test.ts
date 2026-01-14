/**
 * Wizard Attribution Tests
 *
 * Tests for UTM capture, persistence, and checkout attribution flow.
 * Verifies:
 * - UTMs/landing_path captured at entry
 * - Attribution persisted to sessionStorage and localStorage
 * - getCheckoutAttribution() returns correct format for checkout API
 * - First-touch attribution strategy (never overwrites original values)
 * - GA client ID extraction from _ga cookie
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock storage
let mockSessionStorage: Record<string, string> = {};
let mockLocalStorage: Record<string, string> = {};
let mockCookies = '';

// Mock window and document
const createMockWindow = (search = '', pathname = '/test-page') => ({
  location: {
    search,
    pathname,
    href: `https://landlordheaven.co.uk${pathname}${search}`,
    hostname: 'landlordheaven.co.uk',
  },
  sessionStorage: {
    getItem: vi.fn((key: string) => mockSessionStorage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      mockSessionStorage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete mockSessionStorage[key];
    }),
  },
  localStorage: {
    getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      mockLocalStorage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete mockLocalStorage[key];
    }),
  },
});

describe('wizardAttribution', () => {
  beforeEach(() => {
    vi.resetModules();
    mockSessionStorage = {};
    mockLocalStorage = {};
    mockCookies = '';

    // Setup default window mock
    (globalThis as any).window = createMockWindow();
    (globalThis as any).document = {
      referrer: '',
      cookie: mockCookies,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete (globalThis as any).window;
    delete (globalThis as any).document;
  });

  describe('extractAttributionFromUrl', () => {
    it('extracts all UTM parameters from URL', async () => {
      const { extractAttributionFromUrl } = await import('../wizardAttribution');

      const searchParams = new URLSearchParams(
        '?utm_source=google&utm_medium=cpc&utm_campaign=eviction_2024&utm_term=evict+tenant&utm_content=ad_v1'
      );

      const attribution = extractAttributionFromUrl(searchParams);

      expect(attribution.utm_source).toBe('google');
      expect(attribution.utm_medium).toBe('cpc');
      expect(attribution.utm_campaign).toBe('eviction_2024');
      expect(attribution.utm_term).toBe('evict tenant');
      expect(attribution.utm_content).toBe('ad_v1');
    });

    it('extracts src and topic parameters', async () => {
      const { extractAttributionFromUrl } = await import('../wizardAttribution');

      const searchParams = new URLSearchParams('?src=seo&topic=rent_arrears');
      const attribution = extractAttributionFromUrl(searchParams);

      expect(attribution.src).toBe('seo');
      expect(attribution.topic).toBe('rent_arrears');
    });

    it('handles missing parameters gracefully', async () => {
      const { extractAttributionFromUrl } = await import('../wizardAttribution');

      const searchParams = new URLSearchParams('');
      const attribution = extractAttributionFromUrl(searchParams);

      expect(attribution.utm_source).toBeUndefined();
      expect(attribution.utm_medium).toBeUndefined();
      expect(attribution.utm_campaign).toBeUndefined();
    });
  });

  describe('initializeAttribution', () => {
    it('captures UTMs from URL and stores in sessionStorage', async () => {
      const mockWindow = createMockWindow(
        '?utm_source=google&utm_medium=cpc&utm_campaign=eviction_jan_2026',
        '/how-to-evict-tenant'
      );
      (globalThis as any).window = mockWindow;

      const { initializeAttribution, getWizardAttribution } = await import(
        '../wizardAttribution'
      );

      const result = initializeAttribution();

      expect(result.utm_source).toBe('google');
      expect(result.utm_medium).toBe('cpc');
      expect(result.utm_campaign).toBe('eviction_jan_2026');
      expect(result.landing_path).toBe('/how-to-evict-tenant');

      // Verify stored in sessionStorage
      expect(mockWindow.sessionStorage.setItem).toHaveBeenCalledWith(
        'wizard_attribution',
        expect.stringContaining('google')
      );
    });

    it('captures landing_path from current URL pathname', async () => {
      const mockWindow = createMockWindow('', '/tenant-wont-leave');
      (globalThis as any).window = mockWindow;

      const { initializeAttribution } = await import('../wizardAttribution');
      const result = initializeAttribution();

      expect(result.landing_path).toBe('/tenant-wont-leave');
    });

    it('persists attribution to both sessionStorage and localStorage', async () => {
      const mockWindow = createMockWindow('?utm_source=facebook', '/eviction-guide');
      (globalThis as any).window = mockWindow;

      const { initializeAttribution } = await import('../wizardAttribution');
      initializeAttribution();

      expect(mockWindow.sessionStorage.setItem).toHaveBeenCalled();
      expect(mockWindow.localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('First-touch attribution strategy', () => {
    it('does NOT overwrite landing_path once set', async () => {
      // Setup existing attribution
      mockSessionStorage['wizard_attribution'] = JSON.stringify({
        src: 'seo',
        topic: 'general',
        landing_path: '/original-landing-page',
        landing_url: 'https://landlordheaven.co.uk/original-landing-page',
        first_seen_at: '2026-01-01T00:00:00.000Z',
      });

      const mockWindow = createMockWindow('?utm_source=google', '/new-page');
      (globalThis as any).window = mockWindow;

      const { initializeAttribution } = await import('../wizardAttribution');
      const result = initializeAttribution();

      // Original landing_path should be preserved
      expect(result.landing_path).toBe('/original-landing-page');
    });

    it('does NOT overwrite first_seen_at once set', async () => {
      const originalTimestamp = '2026-01-01T00:00:00.000Z';
      mockSessionStorage['wizard_attribution'] = JSON.stringify({
        src: 'direct',
        topic: 'general',
        landing_path: '/page',
        landing_url: 'https://landlordheaven.co.uk/page',
        first_seen_at: originalTimestamp,
      });

      const mockWindow = createMockWindow('?utm_source=google', '/new-page');
      (globalThis as any).window = mockWindow;

      const { setWizardAttribution } = await import('../wizardAttribution');
      const result = setWizardAttribution({ utm_source: 'google' });

      expect(result.first_seen_at).toBe(originalTimestamp);
    });

    it('does NOT overwrite referrer once set', async () => {
      mockSessionStorage['wizard_attribution'] = JSON.stringify({
        src: 'direct',
        topic: 'general',
        landing_path: '/page',
        landing_url: 'https://landlordheaven.co.uk/page',
        first_seen_at: '2026-01-01T00:00:00.000Z',
        referrer: 'google.com',
      });

      const mockWindow = createMockWindow('', '/another-page');
      (globalThis as any).window = mockWindow;
      (globalThis as any).document = {
        referrer: 'https://facebook.com/post',
        cookie: '',
      };

      const { setWizardAttribution } = await import('../wizardAttribution');
      const result = setWizardAttribution({});

      // Original referrer should be preserved
      expect(result.referrer).toBe('google.com');
    });

    it('DOES update UTMs on subsequent visits (allows multi-touch analysis)', async () => {
      mockSessionStorage['wizard_attribution'] = JSON.stringify({
        src: 'seo',
        topic: 'general',
        landing_path: '/original-page',
        landing_url: 'https://landlordheaven.co.uk/original-page',
        first_seen_at: '2026-01-01T00:00:00.000Z',
        utm_source: 'google',
        utm_medium: 'organic',
      });

      const mockWindow = createMockWindow(
        '?utm_source=facebook&utm_medium=paid',
        '/new-page'
      );
      (globalThis as any).window = mockWindow;

      const { initializeAttribution } = await import('../wizardAttribution');
      const result = initializeAttribution();

      // UTMs should be updated
      expect(result.utm_source).toBe('facebook');
      expect(result.utm_medium).toBe('paid');
      // But landing_path should remain unchanged
      expect(result.landing_path).toBe('/original-page');
    });
  });

  describe('getCheckoutAttribution', () => {
    it('returns attribution formatted for checkout API', async () => {
      mockSessionStorage['wizard_attribution'] = JSON.stringify({
        src: 'seo',
        topic: 'rent_arrears',
        landing_path: '/how-to-evict-tenant',
        landing_url: 'https://landlordheaven.co.uk/how-to-evict-tenant?utm_source=google',
        first_seen_at: '2026-01-14T10:00:00.000Z',
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'eviction_jan_2026',
        utm_term: 'evict tenant fast',
        utm_content: 'headline_v2',
        referrer: 'google.com',
        ga_client_id: '1234567890.1705226400',
      });

      const mockWindow = createMockWindow('', '/checkout');
      (globalThis as any).window = mockWindow;

      const { getCheckoutAttribution } = await import('../wizardAttribution');
      const checkoutData = getCheckoutAttribution();

      expect(checkoutData).toEqual({
        landing_path: '/how-to-evict-tenant',
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'eviction_jan_2026',
        utm_term: 'evict tenant fast',
        utm_content: 'headline_v2',
        referrer: 'google.com',
        first_touch_at: '2026-01-14T10:00:00.000Z',
        ga_client_id: '1234567890.1705226400',
      });
    });

    it('returns null for missing attribution fields', async () => {
      // Empty storage - no attribution set
      const mockWindow = createMockWindow('', '/checkout');
      (globalThis as any).window = mockWindow;

      const { getCheckoutAttribution } = await import('../wizardAttribution');
      const checkoutData = getCheckoutAttribution();

      expect(checkoutData.utm_source).toBeNull();
      expect(checkoutData.utm_medium).toBeNull();
      expect(checkoutData.utm_campaign).toBeNull();
      expect(checkoutData.utm_term).toBeNull();
      expect(checkoutData.utm_content).toBeNull();
      expect(checkoutData.referrer).toBeNull();
    });
  });

  describe('GA Client ID extraction', () => {
    it('extracts client ID from _ga cookie', async () => {
      const mockWindow = createMockWindow('', '/page');
      (globalThis as any).window = mockWindow;
      (globalThis as any).document = {
        referrer: '',
        cookie: '_ga=GA1.1.1234567890.1705226400; other_cookie=value',
      };

      const { initializeAttribution } = await import('../wizardAttribution');
      const result = initializeAttribution();

      expect(result.ga_client_id).toBe('1234567890.1705226400');
    });

    it('handles missing _ga cookie gracefully', async () => {
      const mockWindow = createMockWindow('', '/page');
      (globalThis as any).window = mockWindow;
      (globalThis as any).document = {
        referrer: '',
        cookie: 'other_cookie=value',
      };

      const { initializeAttribution } = await import('../wizardAttribution');
      const result = initializeAttribution();

      expect(result.ga_client_id).toBeUndefined();
    });
  });

  describe('localStorage fallback', () => {
    it('reads from localStorage when sessionStorage is empty', async () => {
      // Only set in localStorage
      mockLocalStorage['lh_attribution'] = JSON.stringify({
        src: 'email',
        topic: 'general',
        landing_path: '/old-visit',
        landing_url: 'https://landlordheaven.co.uk/old-visit',
        first_seen_at: '2026-01-01T00:00:00.000Z',
        utm_source: 'newsletter',
      });

      const mockWindow = createMockWindow('', '/return-visit');
      (globalThis as any).window = mockWindow;

      const { getWizardAttribution } = await import('../wizardAttribution');
      const result = getWizardAttribution();

      expect(result.utm_source).toBe('newsletter');
      expect(result.landing_path).toBe('/old-visit');
    });

    it('prefers sessionStorage over localStorage', async () => {
      mockSessionStorage['wizard_attribution'] = JSON.stringify({
        src: 'seo',
        topic: 'general',
        landing_path: '/session-page',
        landing_url: 'https://landlordheaven.co.uk/session-page',
        first_seen_at: '2026-01-14T00:00:00.000Z',
        utm_source: 'google',
      });
      mockLocalStorage['lh_attribution'] = JSON.stringify({
        src: 'email',
        topic: 'general',
        landing_path: '/local-page',
        landing_url: 'https://landlordheaven.co.uk/local-page',
        first_seen_at: '2026-01-01T00:00:00.000Z',
        utm_source: 'newsletter',
      });

      const mockWindow = createMockWindow('', '/current-page');
      (globalThis as any).window = mockWindow;

      const { getWizardAttribution } = await import('../wizardAttribution');
      const result = getWizardAttribution();

      // Should use sessionStorage value
      expect(result.utm_source).toBe('google');
      expect(result.landing_path).toBe('/session-page');
    });
  });

  describe('SSR safety', () => {
    it('handles server-side rendering gracefully', async () => {
      delete (globalThis as any).window;
      delete (globalThis as any).document;

      const { getWizardAttribution, initializeAttribution, getCheckoutAttribution } =
        await import('../wizardAttribution');

      // Should not throw
      expect(() => getWizardAttribution()).not.toThrow();
      expect(() => initializeAttribution()).not.toThrow();
      expect(() => getCheckoutAttribution()).not.toThrow();
    });
  });
});

describe('Attribution end-to-end flow', () => {
  beforeEach(() => {
    vi.resetModules();
    mockSessionStorage = {};
    mockLocalStorage = {};
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete (globalThis as any).window;
    delete (globalThis as any).document;
  });

  it('full flow: landing page → wizard → checkout preserves attribution', async () => {
    // Step 1: User lands on SEO page with UTMs
    const landingWindow = createMockWindow(
      '?utm_source=google&utm_medium=cpc&utm_campaign=eviction_jan_2026',
      '/how-to-evict-tenant'
    );
    (globalThis as any).window = landingWindow;
    (globalThis as any).document = {
      referrer: 'https://www.google.com/',
      cookie: '_ga=GA1.1.9876543210.1705226400',
    };

    const { initializeAttribution: initLanding } = await import(
      '../wizardAttribution'
    );
    initLanding();

    // Verify attribution was captured
    expect(mockSessionStorage['wizard_attribution']).toBeDefined();
    const landingAttribution = JSON.parse(mockSessionStorage['wizard_attribution']);
    expect(landingAttribution.utm_source).toBe('google');
    expect(landingAttribution.landing_path).toBe('/how-to-evict-tenant');

    // Step 2: User navigates to wizard (new page, same session)
    vi.resetModules();
    const wizardWindow = createMockWindow('', '/wizard/step-1');
    (globalThis as any).window = wizardWindow;

    const { getWizardAttribution } = await import('../wizardAttribution');
    const wizardAttribution = getWizardAttribution();

    // Attribution should persist
    expect(wizardAttribution.utm_source).toBe('google');
    expect(wizardAttribution.landing_path).toBe('/how-to-evict-tenant');

    // Step 3: User goes to checkout
    vi.resetModules();
    const checkoutWindow = createMockWindow('', '/checkout');
    (globalThis as any).window = checkoutWindow;

    const { getCheckoutAttribution } = await import('../wizardAttribution');
    const checkoutData = getCheckoutAttribution();

    // Checkout should have all attribution data
    expect(checkoutData.utm_source).toBe('google');
    expect(checkoutData.utm_medium).toBe('cpc');
    expect(checkoutData.utm_campaign).toBe('eviction_jan_2026');
    expect(checkoutData.landing_path).toBe('/how-to-evict-tenant');
    expect(checkoutData.ga_client_id).toBe('9876543210.1705226400');
  });
});
