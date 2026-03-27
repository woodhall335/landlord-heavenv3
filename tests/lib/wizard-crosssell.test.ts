import { describe, expect, it } from 'vitest';

import {
  buildMoneyClaimAddOnRecommendation,
  isMoneyClaimAddOnEligible,
} from '@/lib/wizard-crosssell';

describe('wizard cross-sell helpers', () => {
  it('shows the money claim add-on for eligible England arrears eviction flows', () => {
    expect(
      isMoneyClaimAddOnEligible({
        productFlow: 'notice_only',
        jurisdiction: 'england',
        caseType: 'eviction',
        collectedFacts: {
          section8_grounds: [{ code: 8 }],
        },
      })
    ).toBe(true);
  });

  it('does not show the money claim add-on for non-arrears cases', () => {
    expect(
      isMoneyClaimAddOnEligible({
        productFlow: 'complete_pack',
        jurisdiction: 'england',
        caseType: 'eviction',
        collectedFacts: {
          section8_grounds: [{ code: 12 }],
        },
      })
    ).toBe(false);
  });

  it('keeps the add-on unavailable outside England', () => {
    expect(
      isMoneyClaimAddOnEligible({
        productFlow: 'notice_only',
        jurisdiction: 'wales',
        caseType: 'eviction',
        collectedFacts: {
          section8_grounds: [{ code: 8 }],
        },
      })
    ).toBe(false);
  });

  it('builds the recommendation from canonical pricing', () => {
    expect(buildMoneyClaimAddOnRecommendation().displayPrice).toBe('£29.99');
  });
});
