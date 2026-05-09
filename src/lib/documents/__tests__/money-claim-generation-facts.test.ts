import { describe, expect, it } from 'vitest';
import {
  buildMoneyClaimGenerationFacts,
  buildMoneyClaimGenerationInput,
} from '../money-claim-generation-facts';

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
});
