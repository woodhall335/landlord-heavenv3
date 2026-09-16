import { describe, expect, it } from 'vitest';

import { resolveStoredTenancyFacts } from '../stored-facts';

describe('resolveStoredTenancyFacts', () => {
  it('does not let an empty collected facts object hide wizard facts', () => {
    expect(
      resolveStoredTenancyFacts({
        collected_facts: {},
        wizard_facts: { jurisdiction: 'wales', landlord_full_name: 'Alex Morgan' },
      })
    ).toEqual({ jurisdiction: 'wales', landlord_full_name: 'Alex Morgan' });
  });

  it('keeps populated collected facts ahead of legacy containers', () => {
    expect(
      resolveStoredTenancyFacts({
        collected_facts: { jurisdiction: 'scotland' },
        wizard_facts: { jurisdiction: 'england' },
      })
    ).toEqual({ jurisdiction: 'scotland' });
  });
});
