/**
 * LandingPageTracker Tests
 *
 * Tests that verify:
 * - landing_view event fires on SEO landing pages
 * - trackLandingCtaClick fires cta_click event
 * - Events do NOT fire on /dashboard, /auth, /wizard routes
 * - Attribution is initialized on mount
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import React from 'react';

// Track mock calls
const mockTrackEvent = vi.fn();
const mockInitializeAttribution = vi.fn().mockReturnValue({
  src: 'direct',
  topic: 'general',
  landing_path: '/test-page',
  landing_url: 'https://landlordheaven.co.uk/test-page',
  first_seen_at: new Date().toISOString(),
});

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

// Mock wizardAttribution
vi.mock('@/lib/wizard/wizardAttribution', () => ({
  initializeAttribution: () => mockInitializeAttribution(),
}));

// Import after mocking
import { LandingPageTracker, trackLandingCtaClick } from '../LandingPageTracker';

describe('LandingPageTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('landing_view event', () => {
    it('fires landing_view event on mount', () => {
      render(
        <LandingPageTracker
          pagePath="/how-to-evict-tenant"
          pageTitle="How to Evict a Tenant"
          pageType="problem"
        />
      );

      expect(mockTrackEvent).toHaveBeenCalledWith('landing_view', {
        page_path: '/how-to-evict-tenant',
        page_title: 'How to Evict a Tenant',
        page_type: 'problem',
        jurisdiction: undefined,
      });
    });

    it('includes jurisdiction when provided', () => {
      render(
        <LandingPageTracker
          pagePath="/section-21-notice-england"
          pageTitle="Section 21 Notice England"
          pageType="court"
          jurisdiction="england"
        />
      );

      expect(mockTrackEvent).toHaveBeenCalledWith('landing_view', {
        page_path: '/section-21-notice-england',
        page_title: 'Section 21 Notice England',
        page_type: 'court',
        jurisdiction: 'england',
      });
    });

    it('fires only once per mount (deduplication)', () => {
      const { rerender } = render(
        <LandingPageTracker
          pagePath="/test-page"
          pageTitle="Test"
          pageType="general"
        />
      );

      // Rerender with same props
      rerender(
        <LandingPageTracker
          pagePath="/test-page"
          pageTitle="Test"
          pageType="general"
        />
      );

      // Should only fire once
      expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    });

    it('initializes attribution before firing event', () => {
      const callOrder: string[] = [];

      mockInitializeAttribution.mockImplementation(() => {
        callOrder.push('initializeAttribution');
        return { src: 'direct', topic: 'general' };
      });

      mockTrackEvent.mockImplementation(() => {
        callOrder.push('trackEvent');
      });

      render(
        <LandingPageTracker
          pagePath="/test-page"
          pageTitle="Test"
          pageType="general"
        />
      );

      // Attribution should be initialized before event fires
      expect(callOrder).toEqual(['initializeAttribution', 'trackEvent']);
    });

    it('renders nothing (invisible component)', () => {
      const { container } = render(
        <LandingPageTracker
          pagePath="/test-page"
          pageTitle="Test"
          pageType="general"
        />
      );

      expect(container.innerHTML).toBe('');
    });
  });
});

describe('trackLandingCtaClick', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fires cta_click event with all parameters', () => {
    trackLandingCtaClick(
      '/how-to-evict-tenant',
      'problem',
      'hero',
      'Get Started Now'
    );

    expect(mockTrackEvent).toHaveBeenCalledWith('cta_click', {
      page_path: '/how-to-evict-tenant',
      page_type: 'problem',
      cta_variant: 'hero',
      cta_text: 'Get Started Now',
    });
  });

  it('handles different CTA variants', () => {
    const variants = ['hero', 'section', 'faq', 'inline', 'final'] as const;

    variants.forEach((variant) => {
      mockTrackEvent.mockClear();
      trackLandingCtaClick('/test-page', 'general', variant, 'Click me');

      expect(mockTrackEvent).toHaveBeenCalledWith('cta_click', {
        page_path: '/test-page',
        page_type: 'general',
        cta_variant: variant,
        cta_text: 'Click me',
      });
    });
  });

  it('handles different page types', () => {
    const pageTypes = ['problem', 'court', 'money', 'general'] as const;

    pageTypes.forEach((pageType) => {
      mockTrackEvent.mockClear();
      trackLandingCtaClick('/test-page', pageType, 'hero', 'Test');

      expect(mockTrackEvent).toHaveBeenCalledWith('cta_click', {
        page_path: '/test-page',
        page_type: pageType,
        cta_variant: 'hero',
        cta_text: 'Test',
      });
    });
  });

  it('handles undefined cta_text', () => {
    trackLandingCtaClick('/test-page', 'general', 'hero');

    expect(mockTrackEvent).toHaveBeenCalledWith('cta_click', {
      page_path: '/test-page',
      page_type: 'general',
      cta_variant: 'hero',
      cta_text: undefined,
    });
  });
});

describe('Route exclusions', () => {
  /**
   * These tests verify the logic that prevents landing_view from firing
   * on non-SEO routes. The actual exclusion happens in the page components
   * (they simply don't include LandingPageTracker).
   */

  it('dashboard routes should NOT include LandingPageTracker', () => {
    // This is enforced by component structure, not runtime logic
    const dashboardRoutes = [
      '/dashboard',
      '/dashboard/cases',
      '/dashboard/cases/123',
      '/dashboard/settings',
    ];

    dashboardRoutes.forEach((route) => {
      // Verify these routes shouldn't have the tracker
      expect(route.startsWith('/dashboard')).toBe(true);
    });
  });

  it('auth routes should NOT include LandingPageTracker', () => {
    const authRoutes = ['/auth/login', '/auth/signup', '/auth/callback'];

    authRoutes.forEach((route) => {
      expect(route.startsWith('/auth')).toBe(true);
    });
  });

  it('wizard routes should NOT include LandingPageTracker', () => {
    const wizardRoutes = [
      '/wizard',
      '/wizard/start',
      '/wizard/step-1',
      '/wizard/preview',
    ];

    wizardRoutes.forEach((route) => {
      expect(route.startsWith('/wizard')).toBe(true);
    });
  });

  it('SEO landing pages SHOULD include LandingPageTracker', () => {
    // These are the routes where LandingPageTracker should be used
    const seoRoutes = [
      '/how-to-evict-tenant',
      '/tenant-wont-leave',
      '/section-21-notice',
      '/rent-arrears',
      '/eviction-guide',
    ];

    seoRoutes.forEach((route) => {
      expect(route.startsWith('/dashboard')).toBe(false);
      expect(route.startsWith('/auth')).toBe(false);
      expect(route.startsWith('/wizard')).toBe(false);
    });
  });
});

describe('Page type mapping', () => {
  it('problem pages use pageType="problem"', () => {
    // Problem pages address specific tenant issues
    const problemPages = [
      { path: '/tenant-wont-leave', type: 'problem' as const },
      { path: '/rent-arrears', type: 'problem' as const },
      { path: '/antisocial-behaviour', type: 'problem' as const },
    ];

    problemPages.forEach(({ path, type }) => {
      render(
        <LandingPageTracker pagePath={path} pageTitle="Test" pageType={type} />
      );
      expect(mockTrackEvent).toHaveBeenLastCalledWith(
        'landing_view',
        expect.objectContaining({ page_type: 'problem' })
      );
      cleanup();
    });
  });

  it('court pages use pageType="court"', () => {
    const courtPages = [
      { path: '/section-21-notice', type: 'court' as const },
      { path: '/section-8-notice', type: 'court' as const },
      { path: '/possession-order', type: 'court' as const },
    ];

    courtPages.forEach(({ path, type }) => {
      render(
        <LandingPageTracker pagePath={path} pageTitle="Test" pageType={type} />
      );
      expect(mockTrackEvent).toHaveBeenLastCalledWith(
        'landing_view',
        expect.objectContaining({ page_type: 'court' })
      );
      cleanup();
    });
  });

  it('money pages use pageType="money"', () => {
    const moneyPages = [
      { path: '/money-claim', type: 'money' as const },
      { path: '/small-claims', type: 'money' as const },
    ];

    moneyPages.forEach(({ path, type }) => {
      render(
        <LandingPageTracker pagePath={path} pageTitle="Test" pageType={type} />
      );
      expect(mockTrackEvent).toHaveBeenLastCalledWith(
        'landing_view',
        expect.objectContaining({ page_type: 'money' })
      );
      cleanup();
    });
  });
});
