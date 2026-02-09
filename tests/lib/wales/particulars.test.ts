import { describe, expect, it, vi } from 'vitest';
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

    expect(extractWalesParticularsFromWizardFacts(facts)).toEqual({
      text: 'Nested details',
      sourceKey: 'notice_only.particulars',
    });
  });

  it('extractWalesParticularsFromWizardFacts returns sourceKey for matched text', () => {
    const facts = {
      breach_details: 'Specific breach',
    };

    expect(extractWalesParticularsFromWizardFacts(facts)).toEqual({
      text: 'Specific breach',
      sourceKey: 'breach_details',
    });
  });

  it('warns in dev when generic particulars are used for specific grounds', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const facts = {
      wales_fault_grounds: ['antisocial_behaviour'],
      particulars: 'Generic details',
    };

    extractWalesParticularsFromWizardFacts(facts);

    expect(warnSpy).toHaveBeenCalledWith(
      '[wales/particulars] Generic particulars key matched for specific grounds:',
      expect.objectContaining({
        sourceKey: 'particulars',
        wales_fault_grounds: ['antisocial_behaviour'],
      })
    );

    warnSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  it('does not warn in production for generic particulars', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const facts = {
      wales_fault_grounds: ['false_statement'],
      particulars: 'Generic details',
    };

    extractWalesParticularsFromWizardFacts(facts);

    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });
});
