import { describe, expect, it } from 'vitest';
import { shouldTrackPurchaseOnCheckoutReturn } from '@/lib/analytics/purchase-gating';

const now = Date.parse('2026-09-15T12:00:00.000Z');

describe('purchase analytics checkout-return gate', () => {
  it('tracks a recently confirmed purchase on the checkout return', () => {
    expect(
      shouldTrackPurchaseOnCheckoutReturn({
        arrivedFromCheckout: true,
        paid: true,
        paidAt: '2026-09-15T11:55:00.000Z',
        now,
      })
    ).toBe(true);
  });

  it('does not replay a purchase when an old paid case is opened', () => {
    expect(
      shouldTrackPurchaseOnCheckoutReturn({
        arrivedFromCheckout: false,
        paid: true,
        paidAt: '2026-08-15T12:00:00.000Z',
        now,
      })
    ).toBe(false);

    expect(
      shouldTrackPurchaseOnCheckoutReturn({
        arrivedFromCheckout: true,
        paid: true,
        paidAt: '2026-08-15T12:00:00.000Z',
        now,
      })
    ).toBe(false);
  });

  it('waits for authoritative payment confirmation', () => {
    expect(
      shouldTrackPurchaseOnCheckoutReturn({
        arrivedFromCheckout: true,
        paid: false,
        paidAt: null,
        now,
      })
    ).toBe(false);
  });
});
