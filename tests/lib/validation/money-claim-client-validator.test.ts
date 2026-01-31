import { describe, expect, it } from 'vitest';
import {
  validateMoneyClaimClient,
  getClaimTypesFromFacts,
  groupBySection,
  getSectionLabel,
  type MoneyClaimFacts,
} from '@/lib/validation/money-claim-client-validator';

// =============================================================================
// TEST DATA FIXTURES
// =============================================================================

const completeValidFacts: MoneyClaimFacts = {
  landlord_full_name: 'Alice Landlord',
  landlord_address_line1: '1 High Street',
  landlord_address_postcode: 'E1 1AA',
  tenant_full_name: 'Tom Tenant',
  defendant_address_line1: '2 High Street',
  property_address_line1: '2 High Street',
  tenancy_start_date: '2024-01-01',
  rent_amount: 1000,
  rent_frequency: 'monthly',
  claiming_rent_arrears: true,
  arrears_items: [
    { period_start: '2024-06-01', period_end: '2024-06-30', rent_due: 1000, rent_paid: 0 },
  ],
  letter_before_claim_sent: true,
  money_claim: {
    other_amounts_types: [],
    damage_items: [],
    basis_of_claim: 'The tenant failed to pay rent, resulting in arrears.',
    charge_interest: true,
  },
};

const emptyFacts: MoneyClaimFacts = {};

// =============================================================================
// TESTS
// =============================================================================

describe('Money Claim Client Validator', () => {
  describe('validateMoneyClaimClient', () => {
    it('returns no blockers for complete valid facts', () => {
      const result = validateMoneyClaimClient(completeValidFacts);

      expect(result.isValid).toBe(true);
      expect(result.blockers).toHaveLength(0);
    });

    it('returns multiple blockers for empty facts', () => {
      const result = validateMoneyClaimClient(emptyFacts);

      expect(result.isValid).toBe(false);
      expect(result.blockers.length).toBeGreaterThan(0);
    });

    it('calculates total claim amount correctly', () => {
      const result = validateMoneyClaimClient(completeValidFacts);

      expect(result.totalClaimAmount).toBe(1000);
    });

    it('identifies claim types correctly', () => {
      const result = validateMoneyClaimClient(completeValidFacts);

      expect(result.claimTypes).toContain('rent_arrears');
    });
  });

  describe('getClaimTypesFromFacts', () => {
    it('returns empty array for empty facts', () => {
      const types = getClaimTypesFromFacts({});
      expect(types).toEqual([]);
    });

    it('detects rent_arrears from claiming_rent_arrears flag', () => {
      const types = getClaimTypesFromFacts({ claiming_rent_arrears: true });
      expect(types).toContain('rent_arrears');
    });

    it('detects property_damage from other_amounts_types', () => {
      const types = getClaimTypesFromFacts({
        money_claim: { other_amounts_types: ['property_damage'] },
      });
      expect(types).toContain('property_damage');
    });

    it('detects council_tax from other_amounts_types', () => {
      const types = getClaimTypesFromFacts({
        money_claim: { other_amounts_types: ['unpaid_council_tax'] },
      });
      expect(types).toContain('unpaid_council_tax');
    });
  });

  describe('groupBySection', () => {
    it('groups issues by section', () => {
      const result = validateMoneyClaimClient(emptyFacts);
      const grouped = groupBySection(result);

      expect(typeof grouped).toBe('object');
      expect(grouped.claimant).toBeDefined();
    });

    it('puts claimant issues in claimant section', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        landlord_full_name: undefined,
      };
      const result = validateMoneyClaimClient(facts);
      const grouped = groupBySection(result);

      expect(grouped.claimant?.blockers.length).toBeGreaterThan(0);
    });
  });

  describe('getSectionLabel', () => {
    it('returns correct labels for known sections', () => {
      expect(getSectionLabel('claimant')).toBe('Claimant Details');
      expect(getSectionLabel('defendant')).toBe('Defendant Details');
      expect(getSectionLabel('tenancy')).toBe('Tenancy Information');
      expect(getSectionLabel('claim_details')).toBe('Claim Details');
      expect(getSectionLabel('arrears')).toBe('Rent Arrears Schedule');
      expect(getSectionLabel('damages')).toBe('Other Amounts Schedule');
      expect(getSectionLabel('preaction')).toBe('Pre-Action Protocol');
      expect(getSectionLabel('evidence')).toBe('Evidence');
    });

    it('returns section ID for unknown sections', () => {
      expect(getSectionLabel('unknown_section')).toBe('unknown_section');
    });
  });

  describe('blocker validation', () => {
    it('requires claimant name', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        landlord_full_name: undefined,
        company_name: undefined,
      };
      const result = validateMoneyClaimClient(facts);

      const blocker = result.blockers.find((b) => b.id === 'claimant_name_required');
      expect(blocker).toBeDefined();
    });

    it('requires defendant name', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        tenant_full_name: undefined,
      };
      const result = validateMoneyClaimClient(facts);

      const blocker = result.blockers.find((b) => b.id === 'defendant_name_required');
      expect(blocker).toBeDefined();
    });

    it('requires interest decision', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        money_claim: {
          ...completeValidFacts.money_claim,
          charge_interest: undefined,
        },
      };
      const result = validateMoneyClaimClient(facts);

      const blocker = result.blockers.find((b) => b.id === 'interest_decision_required');
      expect(blocker).toBeDefined();
    });

    it('requires PAP letter', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        letter_before_claim_sent: false,
        pap_letter_date: undefined,
      };
      const result = validateMoneyClaimClient(facts);

      const blocker = result.blockers.find((b) => b.id === 'pap_letter_required');
      expect(blocker).toBeDefined();
    });
  });

  describe('warning validation', () => {
    it('warns when basis of claim is missing', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        money_claim: {
          ...completeValidFacts.money_claim,
          basis_of_claim: undefined,
        },
      };
      const result = validateMoneyClaimClient(facts);

      const warning = result.warnings.find((w) => w.id === 'basis_of_claim_missing');
      expect(warning).toBeDefined();
    });

    it('warns when basis of claim is too short', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        money_claim: {
          ...completeValidFacts.money_claim,
          basis_of_claim: 'Short.',
        },
      };
      const result = validateMoneyClaimClient(facts);

      const warning = result.warnings.find((w) => w.id === 'basis_of_claim_short');
      expect(warning).toBeDefined();
    });

    it('warns about council tax liability', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        claiming_rent_arrears: false,
        arrears_items: [],
        money_claim: {
          ...completeValidFacts.money_claim,
          other_amounts_types: ['unpaid_council_tax'],
          damage_items: [{ id: '1', description: 'Council tax', amount: 500 }],
        },
      };
      const result = validateMoneyClaimClient(facts);

      const warning = result.warnings.find((w) => w.id === 'council_tax_liability_warning');
      expect(warning).toBeDefined();
    });
  });

  describe('suggestion validation', () => {
    it('suggests interest start date when claiming interest', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        money_claim: {
          ...completeValidFacts.money_claim,
          charge_interest: true,
          interest_start_date: undefined,
        },
      };
      const result = validateMoneyClaimClient(facts);

      const suggestion = result.suggestions.find((s) => s.id === 'interest_start_date_suggested');
      expect(suggestion).toBeDefined();
    });

    it('suggests enforcement review', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        enforcement_reviewed: false,
        enforcement_preference: undefined,
      };
      const result = validateMoneyClaimClient(facts);

      const suggestion = result.suggestions.find((s) => s.id === 'enforcement_review_suggested');
      expect(suggestion).toBeDefined();
    });
  });
});
