import { describe, expect, it } from 'vitest';

import { evaluateWizardGate } from '@/lib/wizard/gating';

const baseInput = {
  case_type: 'eviction',
  product: 'notice_only',
  facts: {},
};

describe('evaluateWizardGate (eviction jurisdiction gating)', () => {
  it('blocks Northern Ireland eviction attempts', () => {
    const result = evaluateWizardGate({
      ...baseInput,
      jurisdiction: 'northern-ireland',
    });

    expect(result.blocking.map((b) => b.code)).toContain('JURISDICTION_EVICTION_UNSUPPORTED');
  });

  it('fails closed for invalid jurisdictions', () => {
    const result = evaluateWizardGate({
      ...baseInput,
      jurisdiction: 'france',
    });

    expect(result.blocking.map((b) => b.code)).toContain('JURISDICTION_INVALID');
  });

  it('normalizes legacy england-wales cases for backwards compatibility', () => {
    const result = evaluateWizardGate({
      ...baseInput,
      jurisdiction: 'england-wales',
    });

    const codes = result.blocking.map((b) => b.code);
    expect(codes).not.toContain('JURISDICTION_INVALID');
    expect(codes).not.toContain('JURISDICTION_REQUIRED');
  });
});
