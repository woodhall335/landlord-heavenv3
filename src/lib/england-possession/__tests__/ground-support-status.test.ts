import { describe, expect, it } from 'vitest';

import { listEnglandGroundDefinitions } from '@/lib/england-possession/ground-catalog';
import {
  ENGLAND_GROUND_SUPPORT_STATUS,
  listEnglandGroundSupportEntries,
} from '@/lib/england-possession/ground-support-status';

describe('England ground support status registry', () => {
  it('covers every ground in the post-1 May 2026 England catalog', () => {
    const catalogCodes = listEnglandGroundDefinitions().map((definition) => definition.code).sort();
    const supportCodes = Object.keys(ENGLAND_GROUND_SUPPORT_STATUS).sort();

    expect(supportCodes).toEqual(catalogCodes);
  });

  it('lists every enabled ground as fully supported in the current England possession flows', () => {
    const entries = listEnglandGroundSupportEntries();

    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((entry) => entry.status === 'full')).toBe(true);
    expect(entries.every((entry) => entry.outputCoverage.length >= 4)).toBe(true);
  });
});
