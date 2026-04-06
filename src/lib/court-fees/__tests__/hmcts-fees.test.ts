import { describe, expect, it } from 'vitest';

import { calculatePossessionFees, POSSESSION_FEES } from '@/lib/court-fees/hmcts-fees';

describe('HMCTS possession fee calculator', () => {
  it('uses the current county court recovery-of-land fee', () => {
    expect(POSSESSION_FEES.STANDARD_POSSESSION).toBe(404);
    expect(POSSESSION_FEES.ACCELERATED_POSSESSION).toBe(404);
    expect(POSSESSION_FEES.ONLINE_POSSESSION).toBe(404);
  });

  it('does not add a separate money-claim issue fee inside a possession claim', () => {
    const fees = calculatePossessionFees('section_8', 4200);

    expect(fees.possessionFee).toBe(404);
    expect(fees.moneyClaimFee).toBe(0);
    expect(fees.totalFee).toBe(404);
    expect(fees.description).toContain('including any rent arrears sought within the same possession claim');
  });
});
