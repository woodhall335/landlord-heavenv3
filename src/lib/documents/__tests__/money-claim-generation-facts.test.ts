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
    expect(() => assertValidMoneyClaimData(moneyClaimCase)).not.toThrow();
  });
});
