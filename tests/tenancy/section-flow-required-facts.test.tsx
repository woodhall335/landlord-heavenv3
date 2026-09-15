import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { SupplementalTenancyFields } from '@/components/wizard/flows/TenancySectionFlow';
import catalog from '@/lib/wizard/tenancy-supplemental-fields.json';
import { getIncompleteTenancyQuestionnaireFields, getTenancyQuestionProgress, supplementalFieldApplies, tenancyFieldSection, tenancyQuestionnaireSectionComplete } from '@/lib/wizard/tenancy-review-fields';
import { validateTenancyRequiredFacts } from '@/lib/validation/tenancy-details-validator';

const base = {
  landlord_full_name: 'Landlord', landlord_address_line1: '1 Road', landlord_email: 'a@example.com', landlord_phone: '07000000000',
  property_address_line1: '2 Road', property_address_town: 'Cardiff', property_address_postcode: 'CF10 1AA',
  tenants: [{ full_name: 'Tenant', email: 'b@example.com', phone: '07000000001' }],
  tenancy_start_date: '2026-10-01', rent_amount: 900, deposit_amount: 0, is_fixed_term: false,
};

describe('section tenancy flows required facts and recovery', () => {
  it('keeps the generated jurisdiction field audit in sync with MQS and the flow', () => {
    expect(() => execFileSync(process.execPath, ['scripts/audit-tenancy-section-fields.mjs', '--check'], { cwd: process.cwd() })).not.toThrow();
  });
  it('reproduces the Wales blocker and clears all six facts using rendered question values', () => {
    const missing = validateTenancyRequiredFacts(base, { jurisdiction: 'wales' }).missing_fields;
    const fields = ['inventory_delivery_method', 'inventory_due_date', 'first_payment', 'first_payment_date', 'occupation_exclusion_applies', 'written_statement_provided'];
    expect(missing).toEqual(expect.arrayContaining(fields));
    for (const id of fields) expect(catalog.wales.some(field => field.id === id)).toBe(true);
    const result = validateTenancyRequiredFacts({ ...base, inventory_delivery_method: 'later', inventory_due_date: '2026-10-01', first_payment: 900, first_payment_date: '2026-10-01', occupation_exclusion_applies: false, written_statement_provided: true }, { jurisdiction: 'wales' });
    expect(result).toEqual({ missing_fields: [], invalid_fields: [] });
  });
  it.each(Object.keys(catalog) as (keyof typeof catalog)[])('renders applicable missing questions in their recovery section: %s', jurisdiction => {
    for (const field of catalog[jurisdiction]) {
      expect(tenancyFieldSection(field.id)).toBe(field.section);
      if (field.renderedInSectionFlow || !supplementalFieldApplies(field, {})) continue;
      const html = renderToStaticMarkup(<SupplementalTenancyFields section={field.section} jurisdiction={jurisdiction} facts={{}} onUpdate={() => {}} />);
      expect(html).toContain(`tenancy-field-${field.id}`);
    }
  });
  it('shows excluded dates only after yes and accepts explicit no', () => {
    const field = catalog.wales.find(f => f.id === 'occupation_exclusion_start_date')!;
    expect(supplementalFieldApplies(field, { occupation_exclusion_applies: false })).toBe(false);
    expect(supplementalFieldApplies(field, { occupation_exclusion_applies: true })).toBe(true);
    expect(tenancyFieldSection('tenants[2].address')).toBe('tenants');
  });
  it('does not mark a section complete while an applicable MQS-required answer is blank', () => {
    expect(tenancyQuestionnaireSectionComplete('wales', 'tenancy', {})).toBe(false);
    expect(tenancyQuestionnaireSectionComplete('wales', 'tenancy', {
      tenancy_start_date: '2026-10-01',
      is_fixed_term: false,
      occupation_exclusion_applies: false,
      written_statement_provided: false,
    })).toBe(true);
  });
  it('returns every missing question separately when a section has multiple issues', () => {
    const issues = getIncompleteTenancyQuestionnaireFields('wales', {
      tenancy_start_date: '2026-10-01',
      is_fixed_term: false,
      occupation_exclusion_applies: false,
    });
    expect(issues.map(issue => issue.id)).toEqual(expect.arrayContaining([
      'written_statement_provided',
      'first_payment',
      'first_payment_date',
    ]));
  });
  it('offers explicit shortcuts for safe first-payment values without silently changing them', () => {
    const html = renderToStaticMarkup(<SupplementalTenancyFields
      section="rent"
      jurisdiction="wales"
      facts={{ rent_amount: 900, tenancy_start_date: '2026-10-01' }}
      onUpdate={() => {}}
    />);
    expect(html).toContain('Use regular rent amount');
    expect(html).toContain('Use tenancy start date');
  });
  it('calculates progress from required questions and counts invalid answers as remaining', () => {
    const facts = {
      number_of_tenants: '1',
      tenants: [{ full_name: 'Tenant', dob: '2000-01-01', email: 't@example.com', phone: '07000000001' }],
      tenancy_start_date: '2026-10-01',
      is_fixed_term: false,
      occupation_exclusion_applies: false,
      written_statement_provided: true,
    };
    const baseline = getTenancyQuestionProgress('wales', facts, ['tenants', 'tenancy']);
    const progress = getTenancyQuestionProgress('wales', facts, ['tenants', 'tenancy'], ['tenancy_start_date']);
    expect(progress.total).toBeGreaterThan(5);
    expect(progress.total).toBe(baseline.total);
    expect(progress.remaining).toBe(baseline.remaining + 1);
    expect(progress.completed).toBe(baseline.completed - 1);
    expect(progress.percent).toBeLessThan(100);
  });
  it('includes active England premium requirements and understands the product-tier alias', () => {
    expect(catalog.england.some(field => field.id === 'late_payment_interest_applicable')).toBe(true);
    expect(tenancyQuestionnaireSectionComplete('england', 'premium', {
      product_tier: 'Premium Assured Periodic Tenancy Agreement',
      guarantor_required: false,
      is_hmo: false,
    })).toBe(false);
  });
  it.each([
    ['wales', 'Legacy Premium Occupation Contract'],
    ['scotland', 'Legacy Premium PRT'],
    ['northern-ireland', 'Legacy Premium NI Private Tenancy'],
  ] as const)('keeps legacy %s premium edit requirements reachable', (jurisdiction, productTier) => {
    const premiumFields = catalog[jurisdiction].filter(field => field.section === 'premium');
    expect(premiumFields.length).toBeGreaterThan(0);
    expect(tenancyQuestionnaireSectionComplete(jurisdiction, 'premium', {
      product_tier: productTier,
      guarantor_required: false,
      is_hmo: false,
    })).toBe(false);
  });
});
