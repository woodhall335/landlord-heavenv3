import { describe, expect, it } from 'vitest';
import { getCapabilityMatrix } from '../../src/lib/jurisdictions/capabilities/matrix';
import { getRequirements } from '../../src/lib/jurisdictions/requirements';

const matrix = getCapabilityMatrix();

describe('requirements engine scaffolding', () => {
  it('returns sets for every supported flow', () => {
    for (const [jurisdiction, products] of Object.entries(matrix)) {
      for (const [product, flow] of Object.entries(products)) {
        if (flow.status !== 'supported') continue;
        const result = getRequirements({
          jurisdiction,
          product,
          route: flow.routes[0],
          stage: 'wizard',
          facts: {},
          matrix,
        });

        expect(result).toBeDefined();
        expect(result.requiredNow).toBeInstanceOf(Set);
        expect(result.warnNow).toBeInstanceOf(Set);
        expect(result.derived).toBeInstanceOf(Set);
      }
    }
  });
});
