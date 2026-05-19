/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('GA4 analytics dispatch', () => {
  const gtag = vi.fn();
  const fbq = vi.fn();

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    window.sessionStorage.clear();
    (window as any).gtag = gtag;
    (window as any).fbq = fbq;

    const { resetTrackedAnalyticsEvents } = await import('../ga4-dispatch');
    resetTrackedAnalyticsEvents();
  });

  afterEach(() => {
    delete (window as any).gtag;
    delete (window as any).fbq;
    window.sessionStorage.clear();
  });

  it('suppresses duplicate page-scoped view events with the same dedupe key', async () => {
    const { trackEvent } = await import('../../analytics');

    trackEvent(
      'landing_view',
      {
        page_path: '/how-to-evict-tenant',
        page_title: 'How to Evict a Tenant',
      },
      {
        dedupeScope: 'page',
        dedupeKey: '/how-to-evict-tenant:all',
      }
    );
    trackEvent(
      'landing_view',
      {
        page_path: '/how-to-evict-tenant',
        page_title: 'How to Evict a Tenant',
      },
      {
        dedupeScope: 'page',
        dedupeKey: '/how-to-evict-tenant:all',
      }
    );

    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith(
      'event',
      'landing_view',
      expect.objectContaining({
        event_family: 'landing_view',
        page_path: '/how-to-evict-tenant',
      })
    );
  });

  it('sends normalised page_view events for private wizard stages', async () => {
    const { trackPageView } = await import('../../analytics');

    window.history.replaceState({}, '', '/wizard/preview/case-123?product=notice_only');

    trackPageView('/wizard/preview/[caseId]', {
      title: 'Locked document preview',
      pageType: 'wizard_preview',
      product: 'notice_only',
      jurisdiction: 'england',
      route: 'section_8',
    });

    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith(
      'event',
      'page_view',
      expect.objectContaining({
        page_path: '/wizard/preview/[caseId]',
        page_location: `${window.location.origin}/wizard/preview/[caseId]`,
        page_title: 'Locked document preview',
        page_type: 'wizard_preview',
        product: 'notice_only',
        jurisdiction: 'england',
        route: 'section_8',
      })
    );
  });

  it('can send case-specific page_view events for private wizard stages', async () => {
    const { trackPageView } = await import('../../analytics');

    window.history.replaceState(
      {},
      '',
      '/wizard/preview/case-123?payment=cancelled&product=notice_only'
    );

    trackPageView('/wizard/preview/case-123?payment=cancelled&product=notice_only', {
      title: 'Locked document preview - case-123',
      location: window.location.href,
      pageType: 'wizard_preview',
      product: 'notice_only',
      jurisdiction: 'england',
      route: 'section_8',
      caseId: 'case-123',
      paymentStatus: 'cancelled',
    });

    expect(gtag).toHaveBeenCalledWith(
      'event',
      'page_view',
      expect.objectContaining({
        page_path: '/wizard/preview/case-123?payment=cancelled&product=notice_only',
        page_location: `${window.location.origin}/wizard/preview/case-123?payment=cancelled&product=notice_only`,
        page_title: 'Locked document preview - case-123',
        page_type: 'wizard_preview',
        product: 'notice_only',
        jurisdiction: 'england',
        route: 'section_8',
        case_id: 'case-123',
        payment_status: 'cancelled',
      })
    );
  });

  it('sends case id on wizard review events', async () => {
    const { trackWizardReviewViewWithAttribution } = await import('../../analytics');

    trackWizardReviewViewWithAttribution({
      product: 'notice_only',
      jurisdiction: 'england',
      hasBlockers: false,
      hasWarnings: false,
      caseId: 'case-review-1',
      src: 'product_page',
      topic: 'eviction',
    });

    expect(gtag).toHaveBeenCalledWith(
      'event',
      'wizard_review_view',
      expect.objectContaining({
        product: 'notice_only',
        jurisdiction: 'england',
        case_id: 'case-review-1',
        source: 'product_page',
        topic: 'eviction',
      })
    );
  });

  it('does not suppress interaction events by default', async () => {
    const { trackEvent } = await import('../../analytics');

    trackEvent('cta_click', { cta_variant: 'hero' });
    trackEvent('cta_click', { cta_variant: 'hero' });

    expect(gtag).toHaveBeenCalledTimes(2);
  });

  it('emits canonical and normalized wizard step events with reporting metadata', async () => {
    const { trackWizardStepCompleteWithAttribution } = await import('../../analytics');

    trackWizardStepCompleteWithAttribution({
      product: 'notice_only',
      jurisdiction: 'england',
      step: 'property',
      stepIndex: 2,
      totalSteps: 7,
      caseId: 'case-1',
      src: 'direct',
      topic: 'eviction',
    });

    expect(gtag).toHaveBeenCalledTimes(2);
    expect(gtag).toHaveBeenNthCalledWith(
      1,
      'event',
      'wizard_step_complete',
      expect.objectContaining({
        step_name: 'property',
        step_group: 'property',
        event_family: 'wizard_step_complete',
        event_variant: 'canonical',
      })
    );
    expect(gtag).toHaveBeenNthCalledWith(
      2,
      'event',
      'wizard_step_property_complete',
      expect.objectContaining({
        step_name: 'property',
        step_group: 'property',
        event_family: 'wizard_step_complete',
        event_variant: 'derived',
      })
    );
  });

  it('normalizes Section 13 preview checkout as a review step event', async () => {
    const { trackWizardStepCompleteWithAttribution } = await import('../../analytics');

    trackWizardStepCompleteWithAttribution({
      product: 'section13_standard',
      jurisdiction: 'england',
      step: 'preview_checkout',
      stepIndex: 5,
      totalSteps: 7,
      caseId: 'case-section13-1',
      src: 'rent_increase_hub',
      topic: 'rent_increase',
    });

    expect(gtag).toHaveBeenCalledTimes(2);
    expect(gtag).toHaveBeenNthCalledWith(
      1,
      'event',
      'wizard_step_complete',
      expect.objectContaining({
        product: 'section13_standard',
        step_name: 'preview_checkout',
        step_group: 'review',
      })
    );
    expect(gtag).toHaveBeenNthCalledWith(
      2,
      'event',
      'wizard_step_review_complete',
      expect.objectContaining({
        product: 'section13_standard',
        step_name: 'preview_checkout',
        step_group: 'review',
      })
    );
  });

  it('suppresses duplicate wizard step dispatches for the same case and step group', async () => {
    const { trackWizardStepCompleteWithAttribution } = await import('../../analytics');

    const params = {
      product: 'notice_only',
      jurisdiction: 'england',
      step: 'section21_compliance',
      stepIndex: 4,
      totalSteps: 7,
      caseId: 'case-1',
      src: 'direct',
      topic: 'eviction',
    } as const;

    trackWizardStepCompleteWithAttribution(params);
    trackWizardStepCompleteWithAttribution(params);

    expect(gtag).toHaveBeenCalledTimes(2);
    expect(gtag).toHaveBeenNthCalledWith(
      1,
      'event',
      'wizard_step_complete',
      expect.objectContaining({
        step_group: 'compliance',
      })
    );
    expect(gtag).toHaveBeenNthCalledWith(
      2,
      'event',
      'wizard_step_compliance_complete',
      expect.objectContaining({
        step_group: 'compliance',
      })
    );
  });
});
