/**
 * England Fixed-Term Removal Tests
 *
 * Tests for the removal of the "Is this a fixed term tenancy?" question
 * from the England tenancy start step.
 *
 * Per the Renters' Rights Act rollout, new England self-serve agreements
 * should be created as assured periodic tenancies rather than fixed-term tenancies.
 */

import { describe, expect, it } from 'vitest';
import { validateTenancyRequiredFacts } from '@/lib/validation/tenancy-details-validator';

describe('England Tenancy Section Validation', () => {
  // Mirrors the tenancy section completion logic in TenancySectionFlow
  const tenancySectionIsComplete = (facts: any): boolean => {
    if (!facts.tenancy_start_date) return false;
    const jurisdiction = facts.__meta?.jurisdiction;
    if (jurisdiction === 'scotland' || jurisdiction === 'england') {
      return true;
    }
    return facts.is_fixed_term !== undefined;
  };

  it('should complete the England section with only start date', () => {
    const facts = {
      __meta: { jurisdiction: 'england', product: 'ast_standard' },
      tenancy_start_date: '2026-05-02',
    };

    expect(tenancySectionIsComplete(facts)).toBe(true);
  });

  it('should not complete the England section without a start date', () => {
    const facts = {
      __meta: { jurisdiction: 'england', product: 'ast_standard' },
    };

    expect(tenancySectionIsComplete(facts)).toBe(false);
  });

  it('should still require fixed term selection for Wales', () => {
    const facts = {
      __meta: { jurisdiction: 'wales', product: 'occupation_standard' },
      tenancy_start_date: '2026-05-02',
    };

    expect(tenancySectionIsComplete(facts)).toBe(false);
  });

  it('should still require fixed term selection for Northern Ireland', () => {
    const facts = {
      __meta: { jurisdiction: 'northern-ireland', product: 'ni_standard' },
      tenancy_start_date: '2026-05-02',
    };

    expect(tenancySectionIsComplete(facts)).toBe(false);
  });
});

describe('England validation guard', () => {
  it('should reject legacy fixed-term data for England post-reform tenancies', () => {
    const facts = {
      __meta: { jurisdiction: 'england' },
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'new_agreement',
      is_fixed_term: true,
    };

    const result = validateTenancyRequiredFacts(facts, { jurisdiction: 'england' });

    expect(result.invalid_fields).toContain('is_fixed_term');
  });

  it('should not require is_fixed_term for England post-reform tenancies', () => {
    const facts = {
      __meta: { jurisdiction: 'england' },
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'new_agreement',
    };

    const result = validateTenancyRequiredFacts(facts, { jurisdiction: 'england' });

    expect(result.missing_fields).not.toContain('is_fixed_term');
    expect(result.invalid_fields).not.toContain('is_fixed_term');
  });
});

describe('England tenancy step copy contract', () => {
  it('should use England-specific start-date copy and remove fixed-term UI copy', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/components/wizard/flows/TenancySectionFlow.tsx'),
      'utf8',
    );

    expect(source).toContain(
      "For new England tenancies from 1 May 2026, the agreement is created as an assured periodic tenancy. Enter the tenancy start date below.",
    );
    expect(source).toContain("{isEngland ? 'Tenancy Start Date' : 'Tenancy Start and Term'}");
    expect(source).toContain('!isScotland && !isEngland && (');
  });
});
