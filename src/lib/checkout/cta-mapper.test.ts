import { describe, expect, it } from 'vitest';
import { getWizardCta } from '@/lib/checkout/cta-mapper';

describe('getWizardCta', () => {
  it('returns tenancy CTAs for Northern Ireland', () => {
    const result = getWizardCta({
      jurisdiction: 'ni',
      validation_summary: { status: 'warning', blockers: [], warnings: [] },
      caseId: 'case-1',
      source: 'validator',
    });

    expect(result.primary.productKey).toBe('ast_premium');
    expect(result.secondary?.productKey).toBe('ast_standard');
  });

  it('returns complete pack as primary when eviction is invalid', () => {
    const result = getWizardCta({
      jurisdiction: 'england',
      validator_key: 'section_21',
      validation_summary: { status: 'invalid', blockers: [], warnings: [] },
      caseId: 'case-1',
      source: 'validator',
    });

    expect(result.primary.productKey).toBe('complete_pack');
    expect(result.secondary?.productKey).toBe('notice_only');
  });

  it('returns tenancy premium primary', () => {
    const result = getWizardCta({
      jurisdiction: 'wales',
      validator_key: 'tenancy_agreement',
      validation_summary: { status: 'pass', blockers: [], warnings: [] },
      caseId: 'case-1',
      source: 'validator',
    });

    expect(result.primary.productKey).toBe('ast_premium');
    expect(result.secondary?.productKey).toBe('ast_standard');
  });
});
