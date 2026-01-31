/**
 * Jurisdiction Resolution Tests
 *
 * These tests ensure that:
 * 1. Wales cases ALWAYS generate Wales documents (never England documents)
 * 2. Jurisdiction resolver never defaults to England
 * 3. Each jurisdiction produces correct legal framework references
 * 4. Missing jurisdiction throws an error (no silent fallback)
 */

import {
  resolveEffectiveJurisdiction,
  JurisdictionResolutionError,
  validateJurisdiction,
  requireJurisdiction,
  lockJurisdictionForCase,
} from '../jurisdiction';
import type { WizardFacts, CaseFacts } from '@/lib/case-facts/schema';
import { createEmptyCaseFacts, createEmptyWizardFacts } from '@/lib/case-facts/schema';

describe('resolveEffectiveJurisdiction', () => {
  describe('Priority Order', () => {
    it('should prioritize caseData.jurisdiction over other sources', () => {
      const result = resolveEffectiveJurisdiction({
        caseData: { jurisdiction: 'wales' },
        wizardFacts: {
          __meta: { jurisdiction: 'england', product: null, original_product: null },
        },
        caseFacts: {
          ...createEmptyCaseFacts(),
          property: { ...createEmptyCaseFacts().property, country: 'england' },
        },
        queryParam: 'england',
        context: 'test',
      });

      expect(result.jurisdiction).toBe('wales');
      expect(result.source).toBe('caseData');
    });

    it('should use wizardFacts.__meta.jurisdiction when caseData is empty', () => {
      const result = resolveEffectiveJurisdiction({
        caseData: null,
        wizardFacts: {
          __meta: { jurisdiction: 'wales', product: null, original_product: null },
        },
        context: 'test',
      });

      expect(result.jurisdiction).toBe('wales');
      expect(result.source).toBe('wizardMeta');
    });

    it('should use caseFacts.property.country when meta is empty', () => {
      const caseFacts = createEmptyCaseFacts();
      caseFacts.property.country = 'scotland';

      const result = resolveEffectiveJurisdiction({
        caseData: null,
        wizardFacts: { __meta: { product: null, original_product: null } },
        caseFacts,
        context: 'test',
      });

      expect(result.jurisdiction).toBe('scotland');
      expect(result.source).toBe('propertyCountry');
    });

    it('should use queryParam only when not purchased and other sources empty', () => {
      const result = resolveEffectiveJurisdiction({
        caseData: null,
        wizardFacts: null,
        caseFacts: null,
        queryParam: 'northern-ireland',
        isPurchased: false,
        context: 'test',
      });

      expect(result.jurisdiction).toBe('northern-ireland');
      expect(result.source).toBe('queryParam');
    });

    it('should ignore queryParam when isPurchased is true', () => {
      expect(() =>
        resolveEffectiveJurisdiction({
          caseData: null,
          wizardFacts: null,
          caseFacts: null,
          queryParam: 'wales',
          isPurchased: true,
          context: 'test',
        })
      ).toThrow(JurisdictionResolutionError);
    });
  });

  describe('CRITICAL: No England Fallback', () => {
    it('should THROW when no jurisdiction can be resolved (not default to England)', () => {
      expect(() =>
        resolveEffectiveJurisdiction({
          caseData: null,
          wizardFacts: null,
          caseFacts: null,
          queryParam: null,
          context: 'test-no-fallback',
        })
      ).toThrow(JurisdictionResolutionError);
    });

    it('should THROW when all sources are undefined', () => {
      expect(() =>
        resolveEffectiveJurisdiction({
          caseData: { jurisdiction: undefined },
          wizardFacts: { __meta: { jurisdiction: undefined, product: null, original_product: null } },
          context: 'test-undefined',
        })
      ).toThrow(JurisdictionResolutionError);
    });

    it('should THROW when all sources are null', () => {
      expect(() =>
        resolveEffectiveJurisdiction({
          caseData: { jurisdiction: null },
          wizardFacts: { __meta: { jurisdiction: null, product: null, original_product: null } },
          context: 'test-null',
        })
      ).toThrow(JurisdictionResolutionError);
    });

    it('should THROW when all sources are empty strings', () => {
      expect(() =>
        resolveEffectiveJurisdiction({
          caseData: { jurisdiction: '' },
          wizardFacts: { __meta: { jurisdiction: '' as any, product: null, original_product: null } },
          context: 'test-empty-string',
        })
      ).toThrow(JurisdictionResolutionError);
    });

    it('should include context in error message', () => {
      try {
        resolveEffectiveJurisdiction({
          caseData: null,
          context: 'my-test-context',
        });
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(JurisdictionResolutionError);
        expect((error as JurisdictionResolutionError).context).toBe('my-test-context');
        expect((error as JurisdictionResolutionError).message).toContain('my-test-context');
      }
    });
  });

  describe('Wales-specific scenarios', () => {
    it('should resolve Wales from caseData.jurisdiction', () => {
      const result = resolveEffectiveJurisdiction({
        caseData: { jurisdiction: 'wales' },
        context: 'wales-test',
      });

      expect(result.jurisdiction).toBe('wales');
    });

    it('should resolve Wales from property.country', () => {
      const caseFacts = createEmptyCaseFacts();
      caseFacts.property.country = 'wales';

      const result = resolveEffectiveJurisdiction({
        caseFacts,
        context: 'wales-property-test',
      });

      expect(result.jurisdiction).toBe('wales');
    });

    it('should resolve Wales from __meta.jurisdiction', () => {
      const result = resolveEffectiveJurisdiction({
        wizardFacts: {
          __meta: { jurisdiction: 'wales', product: null, original_product: null },
        },
        context: 'wales-meta-test',
      });

      expect(result.jurisdiction).toBe('wales');
    });

    it('should resolve Wales even with mixed-case input', () => {
      const result = resolveEffectiveJurisdiction({
        caseData: { jurisdiction: 'WALES' },
        context: 'wales-uppercase-test',
      });

      expect(result.jurisdiction).toBe('wales');
    });

    it('should resolve Wales with whitespace', () => {
      const result = resolveEffectiveJurisdiction({
        caseData: { jurisdiction: '  wales  ' },
        context: 'wales-whitespace-test',
      });

      expect(result.jurisdiction).toBe('wales');
    });
  });

  describe('All jurisdictions', () => {
    const jurisdictions = ['england', 'wales', 'scotland', 'northern-ireland'] as const;

    jurisdictions.forEach((jurisdiction) => {
      it(`should correctly resolve ${jurisdiction}`, () => {
        const result = resolveEffectiveJurisdiction({
          caseData: { jurisdiction },
          context: `test-${jurisdiction}`,
        });

        expect(result.jurisdiction).toBe(jurisdiction);
      });
    });
  });
});

describe('validateJurisdiction', () => {
  it('should return canonical jurisdiction for valid input', () => {
    expect(validateJurisdiction('wales')).toBe('wales');
    expect(validateJurisdiction('england')).toBe('england');
    expect(validateJurisdiction('scotland')).toBe('scotland');
    expect(validateJurisdiction('northern-ireland')).toBe('northern-ireland');
  });

  it('should return null for invalid input', () => {
    expect(validateJurisdiction(null)).toBeNull();
    expect(validateJurisdiction(undefined)).toBeNull();
    expect(validateJurisdiction('')).toBeNull();
    expect(validateJurisdiction('uk')).toBeNull();
    expect(validateJurisdiction('england-wales')).toBeNull();
  });

  it('should handle case insensitivity', () => {
    expect(validateJurisdiction('WALES')).toBe('wales');
    expect(validateJurisdiction('Wales')).toBe('wales');
    expect(validateJurisdiction('ENGLAND')).toBe('england');
  });
});

describe('requireJurisdiction', () => {
  it('should return jurisdiction for valid input', () => {
    expect(requireJurisdiction('wales', 'test')).toBe('wales');
  });

  it('should throw for invalid input', () => {
    expect(() => requireJurisdiction(null, 'test')).toThrow(JurisdictionResolutionError);
    expect(() => requireJurisdiction(undefined, 'test')).toThrow(JurisdictionResolutionError);
    expect(() => requireJurisdiction('', 'test')).toThrow(JurisdictionResolutionError);
    expect(() => requireJurisdiction('uk', 'test')).toThrow(JurisdictionResolutionError);
  });
});

describe('lockJurisdictionForCase', () => {
  it('should return resolved jurisdiction for locking', () => {
    const jurisdiction = lockJurisdictionForCase({
      caseData: { jurisdiction: 'wales' },
      context: 'lock-test',
    });

    expect(jurisdiction).toBe('wales');
  });

  it('should throw if no jurisdiction can be resolved', () => {
    expect(() =>
      lockJurisdictionForCase({
        caseData: null,
        context: 'lock-test-fail',
      })
    ).toThrow(JurisdictionResolutionError);
  });
});
