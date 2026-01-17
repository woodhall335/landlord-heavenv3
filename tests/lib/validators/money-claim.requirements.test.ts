import { describe, expect, it } from 'vitest';
import { REQUIREMENTS } from '@/lib/validators/requirements';

describe('money claim requirements', () => {
  it('includes LBA evidence and questions', () => {
    const requirements = REQUIREMENTS.money_claim;

    expect(requirements.requiredEvidence).toContain('lba_letter');
    expect(requirements.requiredFacts.some((q) => q.factKey === 'pre_action_steps')).toBe(true);
  });
});
