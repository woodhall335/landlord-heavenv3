import { describe, expect, it } from 'vitest';

import { getScotlandGrounds } from '@/lib/scotland/grounds';

/**
 * Regression test: ensure Scotland grounds config stays reachable and complete.
 */
describe('getScotlandGrounds', () => {
  it('loads all configured Scotland eviction grounds', () => {
    const grounds = getScotlandGrounds();

    expect(grounds).toHaveLength(18);
    expect(grounds[0]?.number).toBe(1);
    expect(grounds.every(ground => ground.type === 'discretionary')).toBe(true);
  });
});
