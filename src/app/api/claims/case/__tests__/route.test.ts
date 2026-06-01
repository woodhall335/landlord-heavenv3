import { describe, expect, it } from 'vitest';

import { buildCollectedFacts } from '../route';

describe('claims case fact collection', () => {
  it('normalises landlord debt answers into the existing money-claim document model', () => {
    const facts = buildCollectedFacts('landlord_debt_claim', {
      claim_category: 'landlord_debt_claim',
      claim_flow_mode: 'landlord_money_claim',
      landlord_full_name: 'Charlotte Warren',
      landlord_address_line1: '33 Greenway Close',
      landlord_address_postcode: 'BA9 9RH',
      tenant_full_name: 'Bradley Young',
      defendant_address_line1: '64 Peach Pie Street',
      defendant_address_postcode: 'BA9 9FP',
      property_address_line1: '64 Peach Pie Street',
      property_address_postcode: 'BA9 9FP',
      tenancy_start_date: '2020-11-16',
      rent_amount: '650',
      rent_frequency: 'monthly',
      rent_due_day: '16',
      arrears_items: 'May 2026 rent - 650.00; June 2026 rent - 650.00',
      'money_claim.damage_items': 'Cleaning - 120.00',
      'money_claim.basis_of_claim': 'The tenant left rent and cleaning charges unpaid.',
      'money_claim.attempts_to_resolve': 'Payment was chased twice by email.',
      'money_claim.charge_interest': true,
      'money_claim.interest_start_date': '2026-06-16',
      'money_claim.evidence_items': ['tenancy_agreement', 'rent_schedule', 'chaser_correspondence'],
    });

    expect(facts.claim_flow_mode).toBe('landlord_money_claim');
    expect(facts.claiming_rent_arrears).toBe(true);
    expect(facts.arrears_items).toHaveLength(2);
    expect(facts.total_arrears).toBe(1300);
    expect(facts.issues.rent_arrears.arrears_items).toEqual(facts.arrears_items);
    expect(facts.money_claim.damage_items).toEqual([{ description: 'Cleaning', amount: 120 }]);
    expect(facts.money_claim.interest_rate).toBe(8);
    expect(facts.evidence.tenancy_agreement_uploaded).toBe(true);
    expect(facts.evidence.rent_schedule_uploaded).toBe(true);
    expect(facts.evidence.correspondence_uploaded).toBe(true);
  });
});
