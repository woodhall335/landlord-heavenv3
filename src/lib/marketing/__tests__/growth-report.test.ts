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
      revenue: 228,
      orders: 2,
      aov: 114,
      rolling7DayRevenue: 228,
      rolling7DayGap: 1522,
    });
    expect(report.revenueByLandingPath).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'unknown', revenue: 49, orders: 1 }),
        expect.objectContaining({ key: '/n5-n119-possession-claim', revenue: 179, orders: 1 }),
      ])
    );
    expect(report.revenueBySourceMedium).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'direct / none', revenue: 49, orders: 1 }),
        expect.objectContaining({ key: 'google / organic', revenue: 179, orders: 1 }),
      ])
    );
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
          created_at: '2026-05-05T09:04:00.000Z',
        },
        {
          event_name: 'checkout_started',
          marketing_session_id: 'mkt_1',
          product_clicked: 'section13_standard',
          intent: 'rent_increase',
          created_at: '2026-05-05T09:05:00.000Z',
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
  });
});
