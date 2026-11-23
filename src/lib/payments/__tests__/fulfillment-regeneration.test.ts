import { describe, expect, it } from 'vitest';

import {
  hasCanonicalArrearsFacts,
  shouldReuseExistingFulfillment,
} from '../fulfillment';

describe('paid-pack regeneration safeguards', () => {
  it('does not reuse a complete existing pack during forced regeneration', () => {
    const existingPack = { isComplete: true, actualCount: 8 };

    expect(shouldReuseExistingFulfillment(existingPack, false)).toBe(true);
    expect(shouldReuseExistingFulfillment(existingPack, true)).toBe(false);
  });

  it('recognises arrears from the canonical schedule without legacy flags', () => {
    expect(
      hasCanonicalArrearsFacts({
        selected_grounds: ['8', '10'],
        arrears_items: [
          { period_start: '2026-09-18', period_end: '2026-10-17', amount_owed: 1000 },
          { period_start: '2026-10-18', period_end: '2026-11-17', amount_owed: 1000 },
          { period_start: '2026-11-18', period_end: '2026-12-17', amount_owed: 1000 },
        ],
        total_arrears: 3000,
      })
    ).toBe(true);
  });

  it('does not add an arrears schedule to a non-arrears case', () => {
    expect(hasCanonicalArrearsFacts({ selected_grounds: ['12', '14'] })).toBe(false);
  });
});
