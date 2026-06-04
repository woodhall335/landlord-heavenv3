import { describe, expect, it } from 'vitest';
import {
  buildMoneyClaimGenerationFacts,
  buildMoneyClaimGenerationInput,
} from '../money-claim-generation-facts';
import { assertValidMoneyClaimData } from '../money-claim-validator';

const baseMoneyClaimWizardFacts = {
  landlord_name: 'Alex Landlord',
  landlord_address_line1: '1 High Street',
  landlord_postcode: 'SW1A 1AA',
  tenant_full_name: 'Sam Tenant',
  property_address_line1: '2 Rental Road',
  property_address_postcode: 'SW1A 2AA',
  tenancy_start_date: '2025-01-01',
  rent_amount: 1200,
  rent_frequency: 'monthly',
  charge_interest: false,
};

describe('money claim generation facts', () => {
  it('injects row-level context used by preview and final pack generation', () => {
    const facts = buildMoneyClaimGenerationFacts({
      facts: {
        landlord_name: 'Alex Landlord',
        tenant_full_name: 'Sam Tenant',
      },
      caseId: 'case-123',
      jurisdiction: 'england',
    });

    expect(facts.id).toBe('case-123');
    expect(facts.case_id).toBe('case-123');
    expect(facts.jurisdiction).toBe('england');
    expect(facts.product).toBe('money_claim');
    expect(facts.__meta.case_id).toBe('case-123');
  });

  it('uses the case id as the generated claimant reference when the wizard has none', () => {
    const { moneyClaimCase } = buildMoneyClaimGenerationInput({
      facts: {
        landlord_name: 'Alex Landlord',
        tenant_full_name: 'Sam Tenant',
        rent_amount: 1200,
        total_arrears: 2400,
      },
      caseId: 'case-123',
      jurisdiction: 'england',
    });

    expect(moneyClaimCase.case_id).toBe('case-123');
    expect(moneyClaimCase.claimant_reference).toBe('case-123');
  });

  it('keeps an explicit claimant reference from the wizard', () => {
    const { moneyClaimCase } = buildMoneyClaimGenerationInput({
      facts: {
        claimant_reference: 'MC-2026-001',
      },
      caseId: 'case-123',
      jurisdiction: 'england',
    });

    expect(moneyClaimCase.case_id).toBe('case-123');
    expect(moneyClaimCase.claimant_reference).toBe('MC-2026-001');
  });

  it('uses a saved flat total claim amount when no itemised schedule exists', () => {
    const { moneyClaimCase } = buildMoneyClaimGenerationInput({
      facts: {
        ...baseMoneyClaimWizardFacts,
        claiming_other: true,
        total_claim_amount: '1450.00',
      },
      caseId: 'case-123',
      jurisdiction: 'england',
    });

    expect(moneyClaimCase.other_charges).toEqual([
      { description: 'Amount claimed from the tenant', amount: 1450 },
    ]);
    expect(moneyClaimCase.total_claim_amount).toBe(1450);
    expect(() => assertValidMoneyClaimData(moneyClaimCase)).not.toThrow();
  });

  it('uses a saved rent claim amount as arrears when rent arrears are selected', () => {
    const { moneyClaimCase } = buildMoneyClaimGenerationInput({
      facts: {
        ...baseMoneyClaimWizardFacts,
        claiming_rent_arrears: true,
        claim_amount_rent: '900.50',
      },
      caseId: 'case-123',
      jurisdiction: 'england',
    });

    expect(moneyClaimCase.arrears_total).toBe(900.5);
    expect(moneyClaimCase.total_claim_amount).toBe(900.5);
    expect(() => assertValidMoneyClaimData(moneyClaimCase)).not.toThrow();
  });

  it('uses the money claim rent arrears total saved by the review wizard', () => {
    const { moneyClaimCase } = buildMoneyClaimGenerationInput({
      facts: {
        ...baseMoneyClaimWizardFacts,
        claiming_rent_arrears: true,
        money_claim: {
          totals: {
            rent_arrears: 3900,
            combined_total: 3900,
          },
          charge_interest: false,
        },
      },
      caseId: 'e98e4ab8-5da7-479b-a843-7aa8c07fd5e2',
      jurisdiction: 'england',
    });

    expect(moneyClaimCase.arrears_total).toBe(3900);
    expect(moneyClaimCase.total_claim_amount).toBe(3900);
    expect(() => assertValidMoneyClaimData(moneyClaimCase)).not.toThrow();
  });

  it('preserves the detailed money claim arrears schedule rows entered in the wizard', () => {
    const { moneyClaimCase } = buildMoneyClaimGenerationInput({
      facts: {
        ...baseMoneyClaimWizardFacts,
        claiming_rent_arrears: true,
        rent_amount: 1950,
        rent_frequency: 'monthly',
        rent_due_day: 13,
        arrears_items: [
          {
            period_start: '2026-03-13',
            period_end: '2026-04-12',
            rent_due: 1950,
            rent_paid: 1950,
            amount_owed: 0,
          },
          {
            period_start: '2026-04-13',
            period_end: '2026-05-12',
            rent_due: 1950,
            rent_paid: 0,
            amount_owed: 1950,
          },
          {
            period_start: '2026-05-13',
            period_end: '2026-06-12',
            rent_due: 1950,
            rent_paid: 0,
            amount_owed: 1950,
          },
        ],
      },
      caseId: 'case-money-claim-arrears-rows',
      jurisdiction: 'england',
    });

    expect(moneyClaimCase.arrears_total).toBe(3900);
    expect(moneyClaimCase.total_claim_amount).toBe(3900);
    expect(moneyClaimCase.arrears_schedule).toHaveLength(3);
    expect(moneyClaimCase.arrears_schedule[0]).toMatchObject({
      amount_due: 1950,
      amount_paid: 1950,
      arrears: 0,
      running_balance: 0,
    });
    expect(moneyClaimCase.arrears_schedule[1]).toMatchObject({
      amount_due: 1950,
      amount_paid: 0,
      arrears: 1950,
      running_balance: 1950,
    });
    expect(moneyClaimCase.arrears_schedule[2]).toMatchObject({
      amount_due: 1950,
      amount_paid: 0,
      arrears: 1950,
      running_balance: 3900,
    });
    expect(() => assertValidMoneyClaimData(moneyClaimCase)).not.toThrow();
  });
});
