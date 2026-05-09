import { describe, expect, it } from 'vitest';

import { computeStrength } from '../route';
import { createEmptyCaseFacts } from '@/lib/case-facts/schema';

describe('wizard analyze case strength', () => {
  it('scores a well-supported England Section 8 arrears case as strong', () => {
    const facts = createEmptyCaseFacts();

    facts.meta.product = 'complete_pack';
    facts.property.country = 'england';
    facts.property.address_line1 = '1 High Street';
    facts.property.postcode = 'SW1A 1AA';
    facts.parties.landlord.name = 'Sam Landlord';
    facts.parties.tenants = [
      {
        name: 'Alex Tenant',
        email: null,
        phone: null,
        address_line1: null,
        address_line2: null,
        city: null,
        postcode: null,
      },
    ];
    facts.tenancy.rent_amount = 1000;
    facts.tenancy.rent_frequency = 'monthly';
    facts.tenancy.deposit_protected = true;
    facts.issues.rent_arrears.has_arrears = true;
    facts.issues.rent_arrears.total_arrears = 4333.33;
    facts.issues.rent_arrears.arrears_items = [
      { period_start: '2026-01-01', period_end: '2026-01-31', rent_due: 1000, rent_paid: 0 },
      { period_start: '2026-02-01', period_end: '2026-02-28', rent_due: 1000, rent_paid: 0 },
      { period_start: '2026-03-01', period_end: '2026-03-31', rent_due: 1000, rent_paid: 0 },
    ];
    facts.issues.section8_grounds.selected_grounds = ['Ground 8', 'Ground 10'];
    facts.notice.notice_type = 'section_8';
    facts.notice.notice_date = '2026-05-01';
    facts.notice.service_date = '2026-05-01';
    facts.notice.service_method = 'first_class_post';

    const result = computeStrength(facts);

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.red_flags).toEqual([]);
  });

  it('keeps an incomplete eviction case below strong until the evidence is filled in', () => {
    const facts = createEmptyCaseFacts();

    facts.meta.product = 'complete_pack';
    facts.property.country = 'england';
    facts.issues.rent_arrears.has_arrears = true;
    facts.issues.rent_arrears.total_arrears = 2500;
    facts.notice.notice_date = '2026-05-01';

    const result = computeStrength(facts);

    expect(result.score).toBeLessThan(70);
    expect(result.compliance.length).toBeGreaterThan(0);
  });
});
