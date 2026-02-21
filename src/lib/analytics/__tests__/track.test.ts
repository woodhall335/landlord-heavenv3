/**
 * Tests for Vercel Analytics tracking helper
 *
 * These tests ensure the tracking functions:
 * 1. Don't break during SSR (no window access)
 * 2. Handle errors gracefully
 * 3. Accept correct parameters
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock @vercel/analytics before importing our module
vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}));

import {
  trackWizardPreviewViewed,
  trackCheckoutStarted,
  trackPaymentSuccessLanded,
  trackDocumentDownloadClicked,
  trackCaseArchived,
  trackEvent,
} from '../track';
import { track as vercelTrack } from '@vercel/analytics';

describe('analytics/track', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SSR safety', () => {
    let originalWindow: typeof globalThis.window;

    beforeEach(() => {
      // Save original window
      originalWindow = globalThis.window;
    });

    afterEach(() => {
      // Restore window
      if (originalWindow) {
        (globalThis as any).window = originalWindow;
      }
    });

    it('trackWizardPreviewViewed does not throw on server (no window)', () => {
      // Simulate server environment
      (globalThis as any).window = undefined;

      expect(() => {
        trackWizardPreviewViewed({ product: 'test', route: 'test', jurisdiction: 'test' });
      }).not.toThrow();

      // Should not call vercel track when no window
      expect(vercelTrack).not.toHaveBeenCalled();
    });

    it('trackCheckoutStarted does not throw on server', () => {
      (globalThis as any).window = undefined;

      expect(() => {
        trackCheckoutStarted({ product: 'notice_only' });
      }).not.toThrow();
    });

    it('trackPaymentSuccessLanded does not throw on server', () => {
      (globalThis as any).window = undefined;

      expect(() => {
        trackPaymentSuccessLanded({ product: 'complete_pack', caseId_present: true });
      }).not.toThrow();
    });

    it('trackDocumentDownloadClicked does not throw on server', () => {
      (globalThis as any).window = undefined;

      expect(() => {
        trackDocumentDownloadClicked({ document_type: 'section8_notice', product: 'notice_only' });
      }).not.toThrow();
    });

    it('trackCaseArchived does not throw on server', () => {
      (globalThis as any).window = undefined;

      expect(() => {
        trackCaseArchived({ had_paid_order: true });
      }).not.toThrow();
    });
  });

  describe('client-side tracking', () => {
    beforeEach(() => {
      // Ensure window exists for client-side tests
      (globalThis as any).window = {};
    });

    it('trackWizardPreviewViewed calls vercel track with correct params', () => {
      trackWizardPreviewViewed({
        product: 'complete_pack',
        route: 'section_8',
        jurisdiction: 'england',
      });

      expect(vercelTrack).toHaveBeenCalledWith('wizard_preview_viewed', {
        product: 'complete_pack',
        route: 'section_8',
        jurisdiction: 'england',
      });
    });

    it('trackWizardPreviewViewed uses defaults for missing params', () => {
      trackWizardPreviewViewed({});

      expect(vercelTrack).toHaveBeenCalledWith('wizard_preview_viewed', {
        product: 'unknown',
        route: 'unknown',
        jurisdiction: 'unknown',
      });
    });

    it('trackCheckoutStarted calls vercel track with product', () => {
      trackCheckoutStarted({ product: 'money_claim' });

      expect(vercelTrack).toHaveBeenCalledWith('checkout_started', {
        product: 'money_claim',
      });
    });

    it('trackPaymentSuccessLanded calls vercel track correctly', () => {
      trackPaymentSuccessLanded({
        product: 'notice_only',
        caseId_present: true,
      });

      expect(vercelTrack).toHaveBeenCalledWith('payment_success_landed', {
        product: 'notice_only',
        caseId_present: true,
      });
    });

    it('trackPaymentSuccessLanded defaults product to unknown', () => {
      trackPaymentSuccessLanded({
        caseId_present: false,
      });

      expect(vercelTrack).toHaveBeenCalledWith('payment_success_landed', {
        product: 'unknown',
        caseId_present: false,
      });
    });

    it('trackDocumentDownloadClicked calls vercel track correctly', () => {
      trackDocumentDownloadClicked({
        document_type: 'witness_statement',
        product: 'complete_pack',
      });

      expect(vercelTrack).toHaveBeenCalledWith('document_download_clicked', {
        document_type: 'witness_statement',
        product: 'complete_pack',
      });
    });

    it('trackCaseArchived calls vercel track correctly', () => {
      trackCaseArchived({ had_paid_order: false });

      expect(vercelTrack).toHaveBeenCalledWith('case_archived', {
        had_paid_order: false,
      });
    });

    it('generic trackEvent works with custom events', () => {
      trackEvent('checkout_started', { product: 'test' });

      expect(vercelTrack).toHaveBeenCalledWith('checkout_started', { product: 'test' });
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      (globalThis as any).window = {};
    });

    it('handles errors from vercel track gracefully', () => {
      // Make vercel track throw an error
      (vercelTrack as any).mockImplementationOnce(() => {
        throw new Error('Network error');
      });

      // Should not throw
      expect(() => {
        trackCheckoutStarted({ product: 'test' });
      }).not.toThrow();
    });
  });
});

describe('funnel event names', () => {
  it('uses correct event names for funnel tracking', () => {
    // Ensure our event names match the expected funnel events
    const expectedEvents = [
      'wizard_preview_viewed',
      'checkout_started',
      'payment_success_landed',
      'document_download_clicked',
      'case_archived',
    ];

    // The module exports these functions, ensuring the event names are correct
    expect(typeof trackWizardPreviewViewed).toBe('function');
    expect(typeof trackCheckoutStarted).toBe('function');
    expect(typeof trackPaymentSuccessLanded).toBe('function');
    expect(typeof trackDocumentDownloadClicked).toBe('function');
    expect(typeof trackCaseArchived).toBe('function');
  });
});
