/**
 * Pre-emptive Defence Rules Tests
 *
 * Tests that the pre-emptive defence warning rules are correctly loaded
 * and evaluated for different claim types.
 */

import {
  loadRulesConfig,
  getAllRules,
  evaluateRules,
  validateRulesSchema,
  type MoneyClaimFacts,
} from '@/lib/validation/money-claim-rules-engine';

describe('Pre-emptive Defence Rules', () => {
  describe('rules loading', () => {
    it('loads preemptive_defence_rules from YAML config', () => {
      const config = loadRulesConfig(true); // Force reload
      expect(config.preemptive_defence_rules).toBeDefined();
      expect(Array.isArray(config.preemptive_defence_rules)).toBe(true);
      expect(config.preemptive_defence_rules!.length).toBeGreaterThan(0);
    });

    it('includes defence rules in getAllRules', () => {
      const allRules = getAllRules();
      const defenceRules = allRules.filter((r) => r.id.startsWith('defence_'));
      expect(defenceRules.length).toBeGreaterThan(0);
    });

    it('passes schema validation with new defence rules', () => {
      const errors = validateRulesSchema();
      // Filter out any errors not related to defence rules
      const defenceErrors = errors.filter((e) => e.ruleId?.startsWith('defence_'));
      expect(defenceErrors).toHaveLength(0);
    });
  });

  describe('property damage defences', () => {
    const baseFacts: MoneyClaimFacts = {
      landlord_full_name: 'John Landlord',
      landlord_address_line1: '123 Owner Street',
      landlord_address_postcode: 'AB1 2CD',
      tenant_full_name: 'Jane Tenant',
      property_address_line1: '456 Rented Road',
      tenancy_start_date: '2024-01-01',
      claiming_damages: true,
      money_claim: {
        other_amounts_types: ['property_damage'],
        damage_items: [{ description: 'Broken window', amount: 200, category: 'damage' }],
        charge_interest: false,
      },
      letter_before_claim_sent: true,
      pap_letter_date: '2025-01-01',
    };

    it('triggers wear and tear warning for property damage claims', () => {
      const result = evaluateRules(baseFacts);
      const wearAndTear = result.warnings.find((w) => w.id === 'defence_wear_and_tear');
      expect(wearAndTear).toBeDefined();
      expect(wearAndTear?.message).toContain('Wear & Tear');
    });

    it('triggers betterment warning for property damage claims', () => {
      const result = evaluateRules(baseFacts);
      const betterment = result.warnings.find((w) => w.id === 'defence_betterment');
      expect(betterment).toBeDefined();
      expect(betterment?.message).toContain('Betterment');
      expect(betterment?.message).toContain('depreciated value');
    });

    it('triggers pre-existing damage warning when no inventory evidence', () => {
      const factsNoInventory: MoneyClaimFacts = {
        ...baseFacts,
        uploaded_documents: [],
      };
      const result = evaluateRules(factsNoInventory);
      const preExisting = result.warnings.find((w) => w.id === 'defence_pre_existing_damage');
      expect(preExisting).toBeDefined();
      expect(preExisting?.message).toContain('Pre-existing Damage');
    });

    it('does NOT trigger property damage defences for rent arrears only', () => {
      const arrearsOnlyFacts: MoneyClaimFacts = {
        ...baseFacts,
        claiming_damages: false,
        claiming_rent_arrears: true,
        money_claim: {
          other_amounts_types: [],
          charge_interest: false,
        },
        arrears_items: [
          { period_start: '2025-01-01', period_end: '2025-01-31', rent_due: 1000, rent_paid: 0 },
        ],
        rent_amount: 1000,
        rent_frequency: 'monthly',
      };
      const result = evaluateRules(arrearsOnlyFacts);
      const wearAndTear = result.warnings.find((w) => w.id === 'defence_wear_and_tear');
      expect(wearAndTear).toBeUndefined();
    });
  });

  describe('cleaning defences', () => {
    const cleaningFacts: MoneyClaimFacts = {
      landlord_full_name: 'John Landlord',
      landlord_address_line1: '123 Owner Street',
      landlord_address_postcode: 'AB1 2CD',
      tenant_full_name: 'Jane Tenant',
      property_address_line1: '456 Rented Road',
      tenancy_start_date: '2024-01-01',
      money_claim: {
        other_amounts_types: ['cleaning'],
        damage_items: [{ description: 'Professional clean', amount: 300, category: 'cleaning' }],
        charge_interest: false,
      },
      letter_before_claim_sent: true,
      pap_letter_date: '2025-01-01',
    };

    it('triggers cleaning standard warning for cleaning claims', () => {
      const result = evaluateRules(cleaningFacts);
      const cleaningStandard = result.warnings.find((w) => w.id === 'defence_cleaning_standard');
      expect(cleaningStandard).toBeDefined();
      expect(cleaningStandard?.message.toLowerCase()).toContain('professional cleaning not required');
    });

    it('triggers already dirty warning when no checkin evidence', () => {
      const factsNoInventory: MoneyClaimFacts = {
        ...cleaningFacts,
        uploaded_documents: [],
      };
      const result = evaluateRules(factsNoInventory);
      const alreadyDirty = result.warnings.find((w) => w.id === 'defence_cleaning_already_dirty');
      expect(alreadyDirty).toBeDefined();
      expect(alreadyDirty?.message).toContain('wasn\'t clean at check-in');
    });
  });

  describe('utilities defences', () => {
    const utilitiesFacts: MoneyClaimFacts = {
      landlord_full_name: 'John Landlord',
      landlord_address_line1: '123 Owner Street',
      landlord_address_postcode: 'AB1 2CD',
      tenant_full_name: 'Jane Tenant',
      property_address_line1: '456 Rented Road',
      tenancy_start_date: '2024-01-01',
      money_claim: {
        other_amounts_types: ['unpaid_utilities'],
        damage_items: [{ description: 'Electricity bill', amount: 150, category: 'utilities' }],
        charge_interest: false,
      },
      letter_before_claim_sent: true,
      pap_letter_date: '2025-01-01',
    };

    it('triggers no contractual liability warning for utilities claims', () => {
      const result = evaluateRules(utilitiesFacts);
      const noLiability = result.warnings.find(
        (w) => w.id === 'defence_utilities_no_contractual_liability'
      );
      expect(noLiability).toBeDefined();
      expect(noLiability?.message).toContain('No contractual liability');
    });

    it('triggers disputed amounts warning for utilities claims', () => {
      const result = evaluateRules(utilitiesFacts);
      const disputed = result.warnings.find((w) => w.id === 'defence_utilities_disputed_amounts');
      expect(disputed).toBeDefined();
      expect(disputed?.message).toContain('Disputed meter readings');
    });
  });

  describe('rent arrears defences', () => {
    const arrearsFacts: MoneyClaimFacts = {
      landlord_full_name: 'John Landlord',
      landlord_address_line1: '123 Owner Street',
      landlord_address_postcode: 'AB1 2CD',
      tenant_full_name: 'Jane Tenant',
      property_address_line1: '456 Rented Road',
      tenancy_start_date: '2024-01-01',
      claiming_rent_arrears: true,
      money_claim: {
        charge_interest: false,
      },
      arrears_items: [
        { period_start: '2025-01-01', period_end: '2025-01-31', rent_due: 1000, rent_paid: 0 },
      ],
      rent_amount: 1000,
      rent_frequency: 'monthly',
      letter_before_claim_sent: true,
      pap_letter_date: '2025-01-01',
    };

    it('triggers payments made warning for rent arrears claims', () => {
      const result = evaluateRules(arrearsFacts);
      const paymentsMade = result.warnings.find((w) => w.id === 'defence_rent_payments_made');
      expect(paymentsMade).toBeDefined();
      expect(paymentsMade?.message).toContain('Payments were made');
    });

    it('triggers disrepair counterclaim warning for rent arrears claims', () => {
      const result = evaluateRules(arrearsFacts);
      const disrepair = result.warnings.find((w) => w.id === 'defence_rent_disrepair_counterclaim');
      expect(disrepair).toBeDefined();
      expect(disrepair?.message).toContain('Set-off for disrepair');
    });
  });

  describe('council tax defences', () => {
    const councilTaxFacts: MoneyClaimFacts = {
      landlord_full_name: 'John Landlord',
      landlord_address_line1: '123 Owner Street',
      landlord_address_postcode: 'AB1 2CD',
      tenant_full_name: 'Jane Tenant',
      property_address_line1: '456 Rented Road',
      tenancy_start_date: '2024-01-01',
      money_claim: {
        other_amounts_types: ['unpaid_council_tax'],
        damage_items: [{ description: 'Council tax', amount: 500, category: 'council_tax' }],
        charge_interest: false,
      },
      letter_before_claim_sent: true,
      pap_letter_date: '2025-01-01',
    };

    it('triggers liability unclear warning for council tax claims', () => {
      const result = evaluateRules(councilTaxFacts);
      const liabilityUnclear = result.warnings.find(
        (w) => w.id === 'defence_council_tax_liability_unclear'
      );
      expect(liabilityUnclear).toBeDefined();
      expect(liabilityUnclear?.message).toContain('Tenant was not liable');
    });
  });

  describe('defence warnings are educational (not blocking)', () => {
    it('all defence rules have severity "warning"', () => {
      const allRules = getAllRules();
      const defenceRules = allRules.filter((r) => r.id.startsWith('defence_'));

      defenceRules.forEach((rule) => {
        expect(rule.severity).toBe('warning');
      });
    });

    it('defence warnings do not prevent case from being valid', () => {
      const validCaseWithDefences: MoneyClaimFacts = {
        landlord_full_name: 'John Landlord',
        landlord_address_line1: '123 Owner Street',
        landlord_address_postcode: 'AB1 2CD',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '456 Rented Road',
        tenancy_start_date: '2024-01-01',
        claiming_damages: true,
        money_claim: {
          other_amounts_types: ['property_damage'],
          damage_items: [{ description: 'Broken window', amount: 200, category: 'damage' }],
          charge_interest: false,
        },
        letter_before_claim_sent: true,
        pap_letter_date: '2025-01-01',
      };

      const result = evaluateRules(validCaseWithDefences);

      // Should have defence warnings
      const defenceWarnings = result.warnings.filter((w) => w.id.startsWith('defence_'));
      expect(defenceWarnings.length).toBeGreaterThan(0);

      // But should still be valid (no blockers)
      expect(result.isValid).toBe(true);
    });
  });
});
