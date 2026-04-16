import { describe, expect, it } from 'vitest';

import { buildEnglandSection8CompletePackFacts } from './complete-pack';

describe('buildEnglandSection8CompletePackFacts', () => {
  it('keeps the arrears breakdown aligned with overridden arrears totals', () => {
    const facts = buildEnglandSection8CompletePackFacts({
      overrides: {
        total_arrears: 3600,
        rent_arrears_amount: 3600,
      },
    });

    expect(facts.arrears_breakdown).toBe('Total arrears £3600');
  });
});
