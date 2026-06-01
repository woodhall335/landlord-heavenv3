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

  it('does not penalise a money claim for missing uploads when the wizard no longer collects them', () => {
    const facts = createEmptyCaseFacts();

    facts.meta.product = 'money_claim';
    facts.court.route = 'money_claim';
    facts.property.country = 'england';
    facts.issues.rent_arrears.has_arrears = true;
    facts.issues.rent_arrears.total_arrears = 1775;
    facts.money_claim.arrears_schedule_confirmed = true;
    facts.money_claim.generate_pap_documents = true;
    facts.money_claim.charge_interest = true;
    facts.money_claim.interest_rate = 8;

    const result = computeStrength(facts);

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.red_flags).toEqual([]);
    expect(result.compliance.join(' ')).not.toMatch(/upload|not uploaded/i);
    expect(result.compliance).toContain(
      'Have the tenancy agreement ready to attach or exhibit if the tenant disputes the rent terms.'
    );
  });

  it('does not show possession-notice warnings for tenancy agreement reviews', () => {
    const facts = createEmptyCaseFacts();

    facts.meta.product = 'england_standard_tenancy_agreement';
    facts.property.country = 'england';
    facts.property.address_line1 = '19 Lambourne Road';
    facts.property.postcode = 'IG3 8BD';
    facts.parties.landlord.name = 'Landlord Name';
    facts.parties.tenants = [
      {
        name: 'Neeta Tenant',
        email: null,
        phone: null,
        address_line1: null,
        address_line2: null,
        city: null,
        postcode: null,
      },
    ];
    facts.tenancy.rent_amount = 1900;
    facts.tenancy.rent_frequency = 'monthly';
    facts.tenancy.start_date = '2026-05-01';

    const result = computeStrength(facts, 'tenancy_agreement');
    const text = [...result.red_flags, ...result.compliance].join(' ');

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(text).not.toMatch(/notice|possession|grounds|court bundle/i);
  });

  it('does not show possession warnings for Section 13 rent increase reviews', () => {
    const facts = createEmptyCaseFacts() as any;

    facts.meta.product = 'section13_standard';
    facts.property.country = 'england';
    facts.section13 = {
      tenancy: { currentRentAmount: 1200 },
      proposal: {
        proposedRentAmount: 1300,
        proposedStartDate: '2026-09-01',
        serviceDate: '2026-06-15',
      },
    };

    const result = computeStrength(facts, 'rent_increase');
    const text = [...result.red_flags, ...result.compliance].join(' ');

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(text).not.toMatch(/possession|grounds|court bundle|section 8/i);
  });
});
