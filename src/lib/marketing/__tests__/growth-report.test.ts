import { describe, expect, it } from 'vitest';

import { buildGrowthReport } from '../growth-report';

describe('growth report builder', () => {
  it('includes zero-order days, null attribution buckets, AOV, rolling revenue, and target gap', () => {
    const report = buildGrowthReport({
      days: 7,
      now: new Date('2026-05-05T12:00:00.000Z'),
      orders: [
        {
          id: 'order-1',
          payment_status: 'paid',
          fulfillment_status: 'fulfilled',
          product_type: 'money_claim',
          total_amount: 49,
          paid_at: '2026-05-05T09:00:00.000Z',
          landing_path: null,
          utm_source: null,
          utm_medium: null,
          referrer: null,
        },
        {
          id: 'order-2',
          payment_status: 'paid',
          product_type: 'complete_pack',
          total_amount: 179,
          paid_at: '2026-05-03T10:00:00.000Z',
          landing_path: '/n5-n119-possession-claim',
          utm_source: 'google',
          utm_medium: 'organic',
        },
        {
          id: 'order-3',
          payment_status: 'paid',
          product_type: 'notice_only',
          total_amount: 39,
          paid_at: '2026-05-02T10:00:00.000Z',
          referrer: 'https://checkout.stripe.com/c/pay/example',
        },
        {
          id: 'pending-order',
          payment_status: 'pending',
          product_type: 'notice_only',
          total_amount: 49,
          created_at: '2026-05-05T09:00:00.000Z',
        },
      ],
      events: [],
    });

    expect(report.revenueByDay).toHaveLength(7);
    expect(report.revenueByDay.find((day) => day.date === '2026-05-04')).toMatchObject({
      revenue: 0,
      orders: 0,
      aov: 0,
      gapToDailyTarget: 250,
    });
    expect(report.summary).toMatchObject({
      revenue: 267,
      orders: 3,
      aov: 89,
      rolling7DayRevenue: 267,
      rolling7DayGap: 1483,
    });
    expect(report.revenueByProduct).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'money_claim', label: 'Money Claim Pack' }),
        expect.objectContaining({ key: 'complete_pack', label: 'Complete Eviction Pack' }),
      ])
    );
    expect(report.revenueByLandingPath).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'unknown', revenue: 88, orders: 2 }),
        expect.objectContaining({ key: '/n5-n119-possession-claim', revenue: 179, orders: 1 }),
      ])
    );
    expect(report.revenueBySourceMedium).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'direct / none', revenue: 49, orders: 1 }),
        expect.objectContaining({ key: 'google / organic', revenue: 179, orders: 1 }),
        expect.objectContaining({ key: 'unknown / unattributed', revenue: 39, orders: 1 }),
      ])
    );
    expect(report.funnelStages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ event: 'payment_succeeded', count: 3 }),
        expect.objectContaining({ event: 'document_delivered', count: 1 }),
      ])
    );
    expect(report.dataQuality).toMatchObject({
      paidOrders: 3,
      clientPaymentEvents: 0,
      attributedPaidOrders: 0,
      fulfilledOrders: 1,
      usesAuthoritativeOrderOutcomes: true,
    });
  });

  it('calculates CTA, tool, product, and checkout rates', () => {
    const report = buildGrowthReport({
      days: 7,
      now: new Date('2026-05-05T12:00:00.000Z'),
      orders: [],
      events: [
        {
          event_name: 'commercial_bridge_viewed',
          marketing_session_id: 'mkt_1',
          source_page: '/rent-increase',
          intent: 'rent_increase',
          created_at: '2026-05-05T09:00:00.000Z',
        },
        {
          event_name: 'commercial_bridge_clicked',
          marketing_session_id: 'mkt_1',
          source_page: '/rent-increase',
          intent: 'rent_increase',
          destination: '/tools/rent-increase-challenge-checker',
          tool_name: 'rent_increase_challenge_checker',
          created_at: '2026-05-05T09:01:00.000Z',
        },
        {
          event_name: 'tool_started',
          marketing_session_id: 'mkt_1',
          tool_name: 'rent_increase_challenge_checker',
          created_at: '2026-05-05T09:02:00.000Z',
        },
        {
          event_name: 'tool_completed',
          marketing_session_id: 'mkt_1',
          tool_name: 'rent_increase_challenge_checker',
          created_at: '2026-05-05T09:03:00.000Z',
        },
        {
          event_name: 'product_cta_clicked',
          marketing_session_id: 'mkt_1',
          product_clicked: 'section13_standard',
          intent: 'rent_increase',
          event_payload: { canonicalEventName: 'product_primary_cta_click' },
          created_at: '2026-05-05T09:04:00.000Z',
        },
        {
          event_name: 'checkout_started',
          marketing_session_id: 'mkt_1',
          product_clicked: 'section13_standard',
          intent: 'rent_increase',
          created_at: '2026-05-05T09:05:00.000Z',
        },
        {
          event_name: 'builder_step_viewed',
          marketing_session_id: 'mkt_1',
          event_payload: { builderStep: 'parties' },
          created_at: '2026-05-05T09:06:00.000Z',
        },
        {
          event_name: 'builder_step_completed',
          marketing_session_id: 'mkt_1',
          event_payload: { builderStep: 'parties' },
          created_at: '2026-05-05T09:07:00.000Z',
        },
      ],
    });

    expect(report.funnelRates.ctaClickRateByPage[0]).toMatchObject({
      key: '/rent-increase',
      views: 1,
      clicks: 1,
      rate: 100,
    });
    expect(report.funnelRates.toolStartRate[0]).toMatchObject({
      key: 'rent_increase_challenge_checker',
      clicks: 1,
      starts: 1,
      rate: 100,
    });
    expect(report.funnelRates.toolCompletionRate[0]).toMatchObject({
      key: 'rent_increase_challenge_checker',
      starts: 1,
      completions: 1,
      rate: 100,
    });
    expect(report.funnelRates.productPageConversionRate[0]).toMatchObject({
      key: 'section13_standard',
      productClicks: 1,
      checkoutStarts: 1,
      rate: 100,
    });
    expect(report.funnelRates.builderStepCompletionRate[0]).toMatchObject({
      key: 'parties',
      views: 1,
      completions: 1,
      rate: 100,
    });
  });

  it('applies the product filter to revenue as well as funnel events', () => {
    const report = buildGrowthReport({
      days: 7,
      now: new Date('2026-05-05T12:00:00.000Z'),
      filters: { product: 'notice_only' },
      orders: [
        {
          id: 'notice-order',
          payment_status: 'paid',
          product_type: 'notice_only',
          total_amount: 39.99,
          paid_at: '2026-05-05T09:00:00.000Z',
          landing_path: '/form-3-section-8',
        },
        {
          id: 'other-order',
          payment_status: 'paid',
          product_type: 'complete_pack',
          total_amount: 179,
          paid_at: '2026-05-05T10:00:00.000Z',
          landing_path: '/products/complete-pack',
        },
      ],
      events: [],
    });

    expect(report.summary).toMatchObject({ revenue: 39.99, orders: 1, aov: 39.99 });
    expect(report.revenueByProduct).toEqual([
      expect.objectContaining({ key: 'notice_only', revenue: 39.99, orders: 1 }),
    ]);
    expect(report.revenueByLandingPath).toEqual([
      expect.objectContaining({ key: '/form-3-section-8', revenue: 39.99, orders: 1 }),
    ]);
  });

  it('includes journey CTA impressions and clicks in entry-page CTR', () => {
    const report = buildGrowthReport({
      days: 7,
      now: new Date('2026-05-05T12:00:00.000Z'),
      orders: [],
      events: [
        {
          event_name: 'journey_cta_impression',
          source_page: '/form-3-section-8',
          created_at: '2026-05-05T09:00:00.000Z',
        },
        {
          event_name: 'journey_cta_click',
          source_page: '/form-3-section-8',
          created_at: '2026-05-05T09:01:00.000Z',
        },
      ],
    });

    expect(report.funnelRates.ctaClickRateByPage).toContainEqual(
      expect.objectContaining({
        key: '/form-3-section-8',
        views: 1,
        clicks: 1,
        rate: 100,
      })
    );
    expect(report.journeyRates.find((rate) => rate.key === 'offer_ctr')).toMatchObject({
      label: 'Offer / entry CTA CTR',
      numerator: 1,
      denominator: 1,
      rate: 100,
    });
  });

  it('counts canonical funnel stages when a legacy database event name is used', () => {
    const report = buildGrowthReport({
      days: 7,
      now: new Date('2026-05-05T12:00:00.000Z'),
      orders: [],
      events: [
        {
          event_name: 'commercial_bridge_viewed',
          marketing_session_id: 'qa_alias',
          event_payload: { canonicalEventName: 'contextual_offer_view' },
          created_at: '2026-05-05T09:00:00.000Z',
        },
        {
          event_name: 'product_cta_clicked',
          marketing_session_id: 'qa_alias',
          event_payload: { canonicalEventName: 'product_primary_cta_click' },
          created_at: '2026-05-05T09:01:00.000Z',
        },
      ],
    });

    expect(report.funnelStages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ event: 'contextual_offer_view', count: 1 }),
        expect.objectContaining({ event: 'product_primary_cta_click', count: 1 }),
      ])
    );
  });

  it('excludes QA campaigns by default and includes an exact marker when requested', () => {
    const event = {
      event_name: 'product_page_viewed',
      marketing_session_id: 'qa_filtered',
      event_payload: {
        campaign: 'qa-sales003c-marker',
        canonicalEventName: 'product_view',
      },
      created_at: '2026-05-05T09:00:00.000Z',
    };
    const base = {
      days: 7 as const,
      now: new Date('2026-05-05T12:00:00.000Z'),
      orders: [],
      events: [event],
    };

    const commercialReport = buildGrowthReport(base);
    const qaReport = buildGrowthReport({
      ...base,
      filters: { qaMarker: 'qa-sales003c-marker' },
    });

    expect(
      commercialReport.funnelStages.find((stage) => stage.event === 'product_view')?.count
    ).toBe(0);
    expect(qaReport.funnelStages.find((stage) => stage.event === 'product_view')?.count).toBe(1);
  });

  it('returns privacy-safe real-store certification diagnostics for an exact QA marker', () => {
    const marker = 'qa-sales003c-secure-marker';
    const report = buildGrowthReport({
      days: 7,
      now: new Date('2026-05-05T12:00:00.000Z'),
      orders: [],
      filters: { qaMarker: marker },
      events: [
        {
          event_name: 'commercial_bridge_viewed',
          source_page: '/products/notice-only',
          product_clicked: 'notice-only',
          event_payload: {
            campaign: marker,
            canonicalEventName: 'contextual_offer_view',
            productSlug: 'notice-only',
            experimentId: 'sales003c-certification',
            variantId: 'control',
          },
          created_at: '2026-05-05T09:00:00.000Z',
        },
        {
          event_name: 'commercial_bridge_clicked',
          source_page: '/products/notice-only',
          product_clicked: 'notice-only',
          event_payload: {
            campaign: marker,
            canonicalEventName: 'contextual_offer_click',
            productSlug: 'notice-only',
            experimentId: 'sales003c-certification',
            variantId: 'control',
          },
          created_at: '2026-05-05T09:01:00.000Z',
        },
      ],
    });

    expect(report.certificationDiagnostics).toMatchObject({
      persistentStore: 'marketing_events',
      qaMarker: marker,
      eventCount: 2,
      sourcePageCounts: [{ key: '/products/notice-only', count: 2 }],
      productCounts: [{ key: 'notice-only', count: 2 }],
      experimentControlDimensions: [
        { experimentId: 'sales003c-certification', variantId: 'control', count: 2 },
      ],
      sensitivePayloadDetected: false,
    });
    expect(report.certificationDiagnostics?.eventStageCounts).toEqual(
      expect.arrayContaining([
        { key: 'contextual_offer_view', count: 1 },
        { key: 'contextual_offer_click', count: 1 },
      ])
    );
    expect(JSON.stringify(report.certificationDiagnostics)).not.toContain('event_payload');
  });
});
