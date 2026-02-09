import { describe, expect, it } from 'vitest';
import {
  extractWalesParticularsFromWizardFacts,
  pickFirstNonEmptyString,
} from '@/lib/wales/particulars';

describe('Wales particulars helpers', () => {
  it('pickFirstNonEmptyString returns the first normalized string', () => {
    const facts = {
      breach_description: '   ',
      wales_breach_particulars: '  Line 1 \n  Line 2  ',
    };

    const result = pickFirstNonEmptyString(facts, [
      'breach_description',
      'wales_breach_particulars',
    ]);

    expect(result).toBe('Line 1\nLine 2');
  });

  it('pickFirstNonEmptyString returns null when no usable strings are found', () => {
    const facts = {
      breach_description: '   ',
      breach_details: '',
      particulars: undefined,
    };

    const result = pickFirstNonEmptyString(facts, [
      'breach_description',
      'breach_details',
      'particulars',
    ]);

    expect(result).toBeNull();
  });

  it('extractWalesParticularsFromWizardFacts supports nested keys', () => {
    const facts = {
      notice_only: {
        particulars: 'Nested details',
      },
    };

    expect(extractWalesParticularsFromWizardFacts(facts)).toBe('Nested details');
  });
});
