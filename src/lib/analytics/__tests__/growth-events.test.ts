import { describe, expect, it } from 'vitest';

import { normalizeMarketingGrowthEvent } from '../growth-events';

describe('growth event normalization', () => {
  it('accepts allowlisted revenue funnel events and strips unknown fields', () => {
    const event = normalizeMarketingGrowthEvent({
      eventName: 'commercial_bridge_clicked',
      marketingSessionId: 'mkt_test',
      payload: {
        sourcePage: '/rent-increase',
        intent: 'rent_increase',
        ctaPosition: 'top',
        destination: '/tools/rent-increase-challenge-checker',
        recommendedProduct: 'section13_standard',
        productClicked: 'section13_standard',
        userType: 'landlord',
        email: 'landlord@example.com',
        postcode: 'SW1A 1AA',
      },
    });

    expect(event).toMatchObject({
      eventName: 'commercial_bridge_clicked',
      marketingSessionId: 'mkt_test',
      sourcePage: '/rent-increase',
      pagePath: '/rent-increase',
      intent: 'rent_increase',
      ctaPosition: 'top',
      destination: '/tools/rent-increase-challenge-checker',
      recommendedProduct: 'section13_standard',
      productClicked: 'section13_standard',
      userType: 'landlord',
    });
    expect(event?.eventPayload).not.toHaveProperty('email');
    expect(event?.eventPayload).not.toHaveProperty('postcode');
  });

  it('rejects unsupported event names and empty session ids', () => {
    expect(
      normalizeMarketingGrowthEvent({
        eventName: 'random_event',
        marketingSessionId: 'mkt_test',
        payload: {},
      })
    ).toBeNull();

    expect(
      normalizeMarketingGrowthEvent({
        eventName: 'tool_started',
        marketingSessionId: '',
        payload: {},
      })
    ).toBeNull();
  });
});
