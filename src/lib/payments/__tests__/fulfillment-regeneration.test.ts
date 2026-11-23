import { describe, expect, it } from 'vitest';

import {
  buildFulfillmentPackContext,
  getExpectedDocumentKeys,
  hasCanonicalArrearsFacts,
  shouldReuseExistingFulfillment,
} from '../fulfillment';

describe('paid-pack regeneration safeguards', () => {
  it('does not reuse a complete existing pack during forced regeneration', () => {
    const existingPack = { isComplete: true, actualCount: 8 };

    expect(shouldReuseExistingFulfillment(existingPack, false)).toBe(true);
    expect(shouldReuseExistingFulfillment(existingPack, true)).toBe(false);
  });

  it('recognises arrears from the canonical schedule without legacy flags', () => {
    expect(
      hasCanonicalArrearsFacts({
        selected_grounds: ['8', '10'],
        arrears_items: [
          { period_start: '2026-09-18', period_end: '2026-10-17', amount_owed: 1000 },
          { period_start: '2026-10-18', period_end: '2026-11-17', amount_owed: 1000 },
          { period_start: '2026-11-18', period_end: '2026-12-17', amount_owed: 1000 },
        ],
        total_arrears: 3000,
      })
    ).toBe(true);
  });

  it('does not add an arrears schedule to a non-arrears case', () => {
    expect(hasCanonicalArrearsFacts({ selected_grounds: ['12', '14'] })).toBe(false);
  });

  it('expects the generated arrears schedule for an arrears notice pack', () => {
    expect(
      getExpectedDocumentKeys('notice_only', 'england', 'section_8', true)
    ).toContain('arrears_schedule');
    expect(
      getExpectedDocumentKeys('notice_only', 'england', 'section_8', false)
    ).not.toContain('arrears_schedule');
  });

  it('does not expect an arrears schedule for non-arrears grounds merely because a balance was recorded', () => {
    const facts = {
      selected_grounds: ['13', '14'],
      total_arrears: 450,
    };
    const context = buildFulfillmentPackContext(facts, 'complete_pack');

    expect(context.has_arrears).toBe(false);
    expect(
      getExpectedDocumentKeys('complete_pack', 'england', 'section_8', true, context)
    ).not.toContain('arrears_schedule');
  });

  it('uses the written-statement manifest for an existing verbal England tenancy', () => {
    const context = buildFulfillmentPackContext(
      { england_tenancy_purpose: 'existing_verbal_tenancy' },
      'england_standard_tenancy_agreement'
    );
    const expected = getExpectedDocumentKeys(
      'england_standard_tenancy_agreement',
      'england',
      undefined,
      false,
      context
    );

    expect(expected).toContain('england_written_statement_of_terms');
    expect(expected).not.toContain('england_standard_tenancy_agreement');
    expect(expected).not.toContain('england_tenancy_setup_summary');
  });

  it('matches generator rules for conditional deposit and guarantor documents', () => {
    const context = buildFulfillmentPackContext(
      {
        deposit_taken: true,
        deposit_amount: 1200,
        guarantor_required: 'yes',
      },
      'england_student_tenancy_agreement'
    );
    const expected = getExpectedDocumentKeys(
      'england_student_tenancy_agreement',
      'england',
      undefined,
      false,
      context
    );

    expect(expected).toEqual(
      expect.arrayContaining([
        'deposit_protection_certificate',
        'tenancy_deposit_information',
        'guarantor_agreement',
      ])
    );
  });
});
