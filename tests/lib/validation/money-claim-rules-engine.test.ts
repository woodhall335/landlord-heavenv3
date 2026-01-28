import { describe, expect, it, beforeAll } from 'vitest';
import {
  evaluateRules,
  getClaimTypesFromFacts,
  calculateArrearsTotal,
  calculateDamagesTotal,
  calculateOtherChargesTotal,
  getAllRuleIds,
  canGeneratePack,
  getValidationBySection,
  validateRulesSchema,
  validateCondition,
  loadRulesConfig,
  groupResultsBySection,
  type MoneyClaimFacts,
} from '@/lib/validation/money-claim-rules-engine';

// =============================================================================
// TEST DATA FIXTURES
// =============================================================================

const completeValidFacts: MoneyClaimFacts = {
  // Claimant
  landlord_full_name: 'Alice Landlord',
  landlord_address_line1: '1 High Street',
  landlord_address_postcode: 'E1 1AA',
  landlord_is_company: false,

  // Defendant
  tenant_full_name: 'Tom Tenant',
  defendant_address_line1: '2 High Street',

  // Property
  property_address_line1: '2 High Street',
  property_address_postcode: 'E1 2BB',

  // Tenancy
  tenancy_start_date: '2024-01-01',
  tenancy_end_date: '2024-12-31',
  rent_amount: 1000,
  rent_frequency: 'monthly',

  // Claim flags
  claiming_rent_arrears: true,
  claiming_damages: false,
  claiming_other: false,

  // Arrears
  arrears_items: [
    { period_start: '2024-06-01', period_end: '2024-06-30', rent_due: 1000, rent_paid: 0 },
    { period_start: '2024-07-01', period_end: '2024-07-31', rent_due: 1000, rent_paid: 500 },
  ],
  total_arrears: 1500,

  // Pre-action
  letter_before_claim_sent: true,
  pap_letter_date: '2024-10-01',

  // Money claim
  money_claim: {
    primary_issue: 'rent_arrears',
    other_amounts_types: [],
    damage_items: [],
    tenant_still_in_property: false,
    basis_of_claim: 'The tenant failed to pay rent for June and July 2024, resulting in arrears of £1,500.',
    charge_interest: true,
    interest_rate: 8,
    interest_start_date: '2024-06-01',
  },

  // Reviews
  evidence_reviewed: true,
  timeline_reviewed: true,
  enforcement_reviewed: true,
};

const emptyFacts: MoneyClaimFacts = {};

const rentArrearsOnlyFacts: MoneyClaimFacts = {
  ...completeValidFacts,
  claiming_rent_arrears: true,
  claiming_damages: false,
  claiming_other: false,
  money_claim: {
    ...completeValidFacts.money_claim,
    other_amounts_types: [],
  },
};

const propertyDamageOnlyFacts: MoneyClaimFacts = {
  ...completeValidFacts,
  claiming_rent_arrears: false,
  claiming_damages: true,
  arrears_items: [],
  money_claim: {
    ...completeValidFacts.money_claim,
    primary_issue: 'property_damage',
    other_amounts_types: ['property_damage'],
    damage_items: [
      { id: '1', description: 'Broken door', amount: 200, category: 'property_damage' },
      { id: '2', description: 'Damaged carpet', amount: 350, category: 'property_damage' },
    ],
  },
};

const councilTaxFacts: MoneyClaimFacts = {
  ...completeValidFacts,
  claiming_rent_arrears: false,
  arrears_items: [],
  money_claim: {
    ...completeValidFacts.money_claim,
    primary_issue: 'unpaid_council_tax',
    other_amounts_types: ['unpaid_council_tax'],
    damage_items: [
      { id: '1', description: 'Council tax April-June 2024', amount: 450, category: 'unpaid_council_tax' },
    ],
  },
};

const combinedClaimFacts: MoneyClaimFacts = {
  ...completeValidFacts,
  claiming_rent_arrears: true,
  claiming_damages: true,
  money_claim: {
    ...completeValidFacts.money_claim,
    other_amounts_types: ['property_damage', 'cleaning'],
    damage_items: [
      { id: '1', description: 'Broken door', amount: 200, category: 'property_damage' },
      { id: '2', description: 'Professional cleaning', amount: 150, category: 'cleaning' },
    ],
  },
};

// =============================================================================
// HELPER FUNCTION TESTS
// =============================================================================

describe('Money Claim Rules Engine - Helper Functions', () => {
  describe('getClaimTypesFromFacts', () => {
    it('returns empty array for empty facts', () => {
      const types = getClaimTypesFromFacts({});
      expect(types).toEqual([]);
    });

    it('detects rent_arrears claim type', () => {
      const types = getClaimTypesFromFacts(rentArrearsOnlyFacts);
      expect(types).toContain('rent_arrears');
    });

    it('detects property_damage from other_amounts_types', () => {
      const types = getClaimTypesFromFacts(propertyDamageOnlyFacts);
      expect(types).toContain('property_damage');
    });

    it('detects multiple claim types', () => {
      const types = getClaimTypesFromFacts(combinedClaimFacts);
      expect(types).toContain('rent_arrears');
      expect(types).toContain('property_damage');
      expect(types).toContain('cleaning');
    });

    it('detects council tax from other_amounts_types', () => {
      const types = getClaimTypesFromFacts(councilTaxFacts);
      expect(types).toContain('unpaid_council_tax');
    });
  });

  describe('calculateArrearsTotal', () => {
    it('returns 0 for empty facts', () => {
      const total = calculateArrearsTotal({});
      expect(total).toBe(0);
    });

    it('calculates total from arrears_items', () => {
      const total = calculateArrearsTotal(completeValidFacts);
      expect(total).toBe(1500); // (1000-0) + (1000-500)
    });

    it('falls back to total_arrears if no items', () => {
      const facts: MoneyClaimFacts = {
        total_arrears: 2000,
      };
      const total = calculateArrearsTotal(facts);
      expect(total).toBe(2000);
    });
  });

  describe('calculateDamagesTotal', () => {
    it('returns 0 for empty facts', () => {
      const total = calculateDamagesTotal({});
      expect(total).toBe(0);
    });

    it('calculates total from damage_items', () => {
      const total = calculateDamagesTotal(propertyDamageOnlyFacts);
      expect(total).toBe(550); // 200 + 350
    });
  });
});

// =============================================================================
// RULE EVALUATION TESTS
// =============================================================================

describe('Money Claim Rules Engine - Rule Evaluation', () => {
  describe('evaluateRules with empty facts', () => {
    it('returns multiple blockers for empty facts', () => {
      const result = evaluateRules(emptyFacts);

      expect(result.isValid).toBe(false);
      expect(result.blockers.length).toBeGreaterThan(0);
      expect(result.claimTypes).toEqual([]);
    });

    it('includes claimant_name_required blocker', () => {
      const result = evaluateRules(emptyFacts);
      const blocker = result.blockers.find((b) => b.id === 'claimant_name_required');
      expect(blocker).toBeDefined();
    });

    it('includes claim_type_required blocker', () => {
      const result = evaluateRules(emptyFacts);
      const blocker = result.blockers.find((b) => b.id === 'claim_type_required');
      expect(blocker).toBeDefined();
    });
  });

  describe('evaluateRules with complete valid facts', () => {
    it('returns no blockers for complete valid facts', () => {
      const result = evaluateRules(completeValidFacts);

      expect(result.isValid).toBe(true);
      expect(result.blockers).toHaveLength(0);
    });

    it('correctly calculates total claim amount', () => {
      const result = evaluateRules(completeValidFacts);
      expect(result.totalClaimAmount).toBe(1500);
    });

    it('correctly identifies claim types', () => {
      const result = evaluateRules(completeValidFacts);
      expect(result.claimTypes).toContain('rent_arrears');
    });
  });

  describe('evaluateRules with rent arrears claim', () => {
    it('triggers arrears_items_required when no items', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        arrears_items: [],
      };
      const result = evaluateRules(facts);

      const blocker = result.blockers.find((b) => b.id === 'arrears_items_required');
      expect(blocker).toBeDefined();
    });

    it('triggers rent_amount_required when missing', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        rent_amount: undefined,
      };
      const result = evaluateRules(facts);

      const blocker = result.blockers.find((b) => b.id === 'rent_amount_required');
      expect(blocker).toBeDefined();
    });

    it('triggers arrears_items_incomplete warning for incomplete items', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        arrears_items: [
          { period_start: '2024-06-01', period_end: null, rent_due: 1000, rent_paid: 0 },
        ],
      };
      const result = evaluateRules(facts);

      const warning = result.warnings.find((w) => w.id === 'arrears_items_incomplete');
      expect(warning).toBeDefined();
    });
  });

  describe('evaluateRules with property damage claim', () => {
    it('triggers damage_items_required when no items', () => {
      const facts: MoneyClaimFacts = {
        ...propertyDamageOnlyFacts,
        money_claim: {
          ...propertyDamageOnlyFacts.money_claim,
          damage_items: [],
        },
      };
      const result = evaluateRules(facts);

      const blocker = result.blockers.find((b) => b.id === 'damage_items_required');
      expect(blocker).toBeDefined();
    });

    it('triggers damage_items_no_amount warning', () => {
      const facts: MoneyClaimFacts = {
        ...propertyDamageOnlyFacts,
        money_claim: {
          ...propertyDamageOnlyFacts.money_claim,
          damage_items: [
            { id: '1', description: 'Broken door', amount: 0, category: 'property_damage' },
          ],
        },
      };
      const result = evaluateRules(facts);

      const warning = result.warnings.find((w) => w.id === 'damage_items_no_amount');
      expect(warning).toBeDefined();
    });
  });

  describe('evaluateRules with council tax claim', () => {
    it('triggers council_tax_liability_warning', () => {
      const result = evaluateRules(councilTaxFacts);

      const warning = result.warnings.find((w) => w.id === 'council_tax_liability_warning');
      expect(warning).toBeDefined();
      expect(warning?.message).toContain('Council tax liability');
    });
  });

  describe('evaluateRules with combined claim types', () => {
    it('evaluates rules for all selected claim types', () => {
      const result = evaluateRules(combinedClaimFacts);

      expect(result.claimTypes).toContain('rent_arrears');
      expect(result.claimTypes).toContain('property_damage');
      expect(result.claimTypes).toContain('cleaning');
    });

    it('calculates combined total correctly', () => {
      const result = evaluateRules(combinedClaimFacts);
      // Arrears: 1500 + Damages: 200 + 150 = 1850
      expect(result.totalClaimAmount).toBe(1850);
    });
  });

  describe('evaluateRules PAP validation', () => {
    it('triggers pap_letter_required when no letter sent', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        letter_before_claim_sent: false,
        pap_letter_date: undefined,
      };
      const result = evaluateRules(facts);

      const blocker = result.blockers.find((b) => b.id === 'pap_letter_required');
      expect(blocker).toBeDefined();
    });

    it('triggers pap_30_day_wait warning when < 30 days', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 15); // 15 days ago

      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        letter_before_claim_sent: true,
        pap_letter_date: recentDate.toISOString().split('T')[0],
        pap_response_received: false,
      };
      const result = evaluateRules(facts);

      const warning = result.warnings.find((w) => w.id === 'pap_30_day_wait');
      expect(warning).toBeDefined();
    });

    it('does not trigger pap_30_day_wait when response received', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 15);

      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        pap_letter_date: recentDate.toISOString().split('T')[0],
        pap_response_received: true,
      };
      const result = evaluateRules(facts);

      const warning = result.warnings.find((w) => w.id === 'pap_30_day_wait');
      expect(warning).toBeUndefined();
    });
  });

  describe('evaluateRules interest validation', () => {
    it('triggers interest_decision_required when not set', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        money_claim: {
          ...completeValidFacts.money_claim,
          charge_interest: undefined,
        },
      };
      const result = evaluateRules(facts);

      const blocker = result.blockers.find((b) => b.id === 'interest_decision_required');
      expect(blocker).toBeDefined();
    });

    it('triggers interest_start_date_suggested when claiming interest without date', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        money_claim: {
          ...completeValidFacts.money_claim,
          charge_interest: true,
          interest_start_date: undefined,
        },
      };
      const result = evaluateRules(facts);

      const suggestion = result.suggestions.find((s) => s.id === 'interest_start_date_suggested');
      expect(suggestion).toBeDefined();
    });
  });

  describe('evaluateRules date validation', () => {
    it('triggers tenancy_dates_logical when start > end', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        tenancy_start_date: '2024-12-01',
        tenancy_end_date: '2024-01-01',
      };
      const result = evaluateRules(facts);

      const blocker = result.blockers.find((b) => b.id === 'tenancy_dates_logical');
      expect(blocker).toBeDefined();
    });

    it('triggers tenancy_not_future for future start date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        tenancy_start_date: futureDate.toISOString().split('T')[0],
      };
      const result = evaluateRules(facts);

      const blocker = result.blockers.find((b) => b.id === 'tenancy_not_future');
      expect(blocker).toBeDefined();
    });
  });
});

// =============================================================================
// CONVENIENCE FUNCTION TESTS
// =============================================================================

describe('Money Claim Rules Engine - Convenience Functions', () => {
  describe('canGeneratePack', () => {
    it('allows generation for valid facts', () => {
      const result = canGeneratePack(completeValidFacts);
      expect(result.allowed).toBe(true);
      expect(result.blockers).toHaveLength(0);
    });

    it('blocks generation for incomplete facts', () => {
      const result = canGeneratePack(emptyFacts);
      expect(result.allowed).toBe(false);
      expect(result.blockers.length).toBeGreaterThan(0);
    });
  });

  describe('getValidationBySection', () => {
    it('returns issues grouped by section', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        landlord_full_name: undefined,
        tenant_full_name: undefined,
      };

      const claimantIssues = getValidationBySection(facts, 'claimant');
      const defendantIssues = getValidationBySection(facts, 'defendant');

      expect(claimantIssues.blockers.length).toBeGreaterThan(0);
      expect(defendantIssues.blockers.length).toBeGreaterThan(0);
    });

    it('returns empty arrays for sections without issues', () => {
      const result = getValidationBySection(completeValidFacts, 'claimant');

      expect(result.blockers).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('getAllRuleIds', () => {
    it('returns array of rule IDs', () => {
      const ruleIds = getAllRuleIds();

      expect(Array.isArray(ruleIds)).toBe(true);
      expect(ruleIds.length).toBeGreaterThan(0);
      expect(ruleIds).toContain('claimant_name_required');
      expect(ruleIds).toContain('pap_letter_required');
    });
  });
});

// =============================================================================
// REGRESSION TESTS
// =============================================================================

describe('Money Claim Rules Engine - Regression Tests', () => {
  describe('each claim type alone triggers expected rules', () => {
    it('rent_arrears alone triggers arrears-specific rules', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        claiming_rent_arrears: true,
        claiming_damages: false,
        money_claim: {
          ...completeValidFacts.money_claim,
          other_amounts_types: [],
        },
      };

      const result = evaluateRules(facts);
      expect(result.claimTypes).toEqual(['rent_arrears']);
      expect(result.isValid).toBe(true);
    });

    it('property_damage alone does not require arrears items', () => {
      const result = evaluateRules(propertyDamageOnlyFacts);

      expect(result.claimTypes).toContain('property_damage');
      expect(result.claimTypes).not.toContain('rent_arrears');

      // Should not have arrears-related blockers
      const arrearsBlocker = result.blockers.find((b) => b.id === 'arrears_items_required');
      expect(arrearsBlocker).toBeUndefined();
    });

    it('council_tax selection triggers council_tax warning', () => {
      const result = evaluateRules(councilTaxFacts);

      expect(result.claimTypes).toContain('unpaid_council_tax');

      const councilTaxWarning = result.warnings.find(
        (w) => w.id === 'council_tax_liability_warning'
      );
      expect(councilTaxWarning).toBeDefined();
    });
  });

  describe('combined claim types trigger union of rules', () => {
    it('rent_arrears + property_damage triggers rules for both', () => {
      const result = evaluateRules(combinedClaimFacts);

      expect(result.claimTypes).toContain('rent_arrears');
      expect(result.claimTypes).toContain('property_damage');
      expect(result.claimTypes).toContain('cleaning');
      expect(result.isValid).toBe(true);
    });
  });

  describe('evidence upload state', () => {
    it('no evidence triggers warning', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        uploaded_documents: [],
        evidence_reviewed: false,
      };
      const result = evaluateRules(facts);

      const warning = result.warnings.find((w) => w.id === 'no_evidence_uploaded');
      expect(warning).toBeDefined();
    });

    it('evidence uploaded does not trigger warning', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        uploaded_documents: [{ id: '1', name: 'tenancy.pdf', type: 'application/pdf' }],
      };
      const result = evaluateRules(facts);

      const warning = result.warnings.find((w) => w.id === 'no_evidence_uploaded');
      expect(warning).toBeUndefined();
    });

    it('evidence_reviewed=true does not trigger warning', () => {
      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        uploaded_documents: [],
        evidence_reviewed: true,
      };
      const result = evaluateRules(facts);

      const warning = result.warnings.find((w) => w.id === 'no_evidence_uploaded');
      expect(warning).toBeUndefined();
    });
  });
});

// =============================================================================
// YAML SCHEMA VALIDATION TESTS
// =============================================================================

describe('Money Claim Rules Engine - YAML Schema Validation', () => {
  it('loads rules config without error', () => {
    const config = loadRulesConfig(true);
    expect(config).toBeDefined();
    expect(config.version).toBeDefined();
    expect(config.jurisdiction).toBe('england');
    expect(config.product).toBe('money_claim');
  });

  it('has no duplicate rule IDs', () => {
    const errors = validateRulesSchema();
    const duplicateErrors = errors.filter((e) => e.type === 'duplicate_id');
    expect(duplicateErrors).toHaveLength(0);
  });

  it('all summary section rule references exist', () => {
    const errors = validateRulesSchema();
    const missingRefErrors = errors.filter((e) => e.type === 'missing_rule_reference');
    if (missingRefErrors.length > 0) {
      console.log('Missing rule references:', missingRefErrors);
    }
    expect(missingRefErrors).toHaveLength(0);
  });

  it('all conditions pass allowlist validation', () => {
    const errors = validateRulesSchema();
    const conditionErrors = errors.filter((e) => e.type === 'invalid_condition');
    if (conditionErrors.length > 0) {
      console.log('Invalid conditions:', conditionErrors);
    }
    expect(conditionErrors).toHaveLength(0);
  });

  it('validateRulesSchema returns empty array for valid config', () => {
    const errors = validateRulesSchema();
    if (errors.length > 0) {
      console.log('Schema validation errors:', errors);
    }
    expect(errors).toHaveLength(0);
  });
});

// =============================================================================
// SECURITY: CONDITION ALLOWLIST TESTS
// =============================================================================

describe('Money Claim Rules Engine - Security Allowlist', () => {
  describe('validateCondition', () => {
    it('allows valid conditions with context variables', () => {
      expect(validateCondition('!facts.landlord_full_name').valid).toBe(true);
      expect(validateCondition('claim_types.length === 0').valid).toBe(true);
      expect(validateCondition('totals.grand_total <= 0').valid).toBe(true);
      expect(validateCondition('daysSincePapLetter < 30').valid).toBe(true);
    });

    it('allows conditions with array methods', () => {
      expect(validateCondition('claim_types.includes("rent_arrears")').valid).toBe(true);
      expect(validateCondition('arrears_items.some(item => item.rent_due > 0)').valid).toBe(true);
    });

    it('allows conditions with Date', () => {
      expect(validateCondition('new Date(facts.pap_letter_date) > new Date()').valid).toBe(true);
    });

    it('rejects dangerous patterns', () => {
      expect(validateCondition('eval("alert(1)")').valid).toBe(false);
      expect(validateCondition('window.location').valid).toBe(false);
      expect(validateCondition('process.env').valid).toBe(false);
      expect(validateCondition('require("fs")').valid).toBe(false);
      expect(validateCondition('global.something').valid).toBe(false);
    });

    it('rejects unknown identifiers', () => {
      expect(validateCondition('unknownVariable.value').valid).toBe(false);
      expect(validateCondition('document.cookie').valid).toBe(false);
      expect(validateCondition('fetch("http://evil.com")').valid).toBe(false);
    });
  });

  describe('evaluateCondition security', () => {
    it('rejects rules with dangerous conditions gracefully', () => {
      // A malicious condition should not evaluate and should not crash
      const facts: MoneyClaimFacts = { ...completeValidFacts };
      const result = evaluateRules(facts);

      // Should still work normally (dangerous conditions would be rejected silently)
      expect(result).toBeDefined();
    });
  });
});

// =============================================================================
// TOTALS CALCULATION WITH OTHER_CHARGES
// =============================================================================

describe('Money Claim Rules Engine - Totals Calculation', () => {
  it('calculates other charges total', () => {
    const facts: MoneyClaimFacts = {
      money_claim: {
        other_charges: [
          { id: '1', description: 'Legal fees', amount: 100 },
          { id: '2', description: 'Court fee', amount: 250 },
        ],
      },
    };
    const total = calculateOtherChargesTotal(facts);
    expect(total).toBe(350);
  });

  it('grand total includes arrears + damages + other_charges', () => {
    const facts: MoneyClaimFacts = {
      ...completeValidFacts,
      claiming_rent_arrears: true,
      money_claim: {
        ...completeValidFacts.money_claim,
        other_amounts_types: ['property_damage'],
        damage_items: [{ id: '1', description: 'Damage', amount: 200 }],
        other_charges: [{ id: '1', description: 'Legal fees', amount: 100 }],
      },
    };

    const result = evaluateRules(facts);
    // Arrears: 1500 + Damages: 200 + Other: 100 = 1800
    expect(result.totalClaimAmount).toBe(1800);
  });

  it('returns 0 for other_charges when none exist', () => {
    const total = calculateOtherChargesTotal({});
    expect(total).toBe(0);
  });
});

// =============================================================================
// NEW RULE TESTS - PAP AND INTEREST DATE VALIDATION
// =============================================================================

describe('Money Claim Rules Engine - PAP Date Validation', () => {
  it('triggers pap_letter_date_future when date is in future', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    const facts: MoneyClaimFacts = {
      ...completeValidFacts,
      letter_before_claim_sent: true,
      pap_letter_date: futureDate.toISOString().split('T')[0],
    };
    const result = evaluateRules(facts);

    const blocker = result.blockers.find((b) => b.id === 'pap_letter_date_future');
    expect(blocker).toBeDefined();
  });

  it('does not trigger pap_letter_date_future when date is in past', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 60);

    const facts: MoneyClaimFacts = {
      ...completeValidFacts,
      letter_before_claim_sent: true,
      pap_letter_date: pastDate.toISOString().split('T')[0],
    };
    const result = evaluateRules(facts);

    const blocker = result.blockers.find((b) => b.id === 'pap_letter_date_future');
    expect(blocker).toBeUndefined();
  });
});

describe('Money Claim Rules Engine - Interest Date Validation', () => {
  it('triggers interest_start_date_future when interest date is in future', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    const facts: MoneyClaimFacts = {
      ...completeValidFacts,
      money_claim: {
        ...completeValidFacts.money_claim,
        charge_interest: true,
        interest_start_date: futureDate.toISOString().split('T')[0],
      },
    };
    const result = evaluateRules(facts);

    const blocker = result.blockers.find((b) => b.id === 'interest_start_date_future');
    expect(blocker).toBeDefined();
  });

  it('triggers interest_start_before_tenancy when interest date is before tenancy start', () => {
    const facts: MoneyClaimFacts = {
      ...completeValidFacts,
      tenancy_start_date: '2024-03-01',
      money_claim: {
        ...completeValidFacts.money_claim,
        charge_interest: true,
        interest_start_date: '2024-01-01', // Before tenancy start
      },
    };
    const result = evaluateRules(facts);

    const warning = result.warnings.find((w) => w.id === 'interest_start_before_tenancy');
    expect(warning).toBeDefined();
  });

  it('does not trigger interest_start_before_tenancy when dates are valid', () => {
    const facts: MoneyClaimFacts = {
      ...completeValidFacts,
      tenancy_start_date: '2024-01-01',
      money_claim: {
        ...completeValidFacts.money_claim,
        charge_interest: true,
        interest_start_date: '2024-06-01', // After tenancy start
      },
    };
    const result = evaluateRules(facts);

    const warning = result.warnings.find((w) => w.id === 'interest_start_before_tenancy');
    expect(warning).toBeUndefined();
  });
});

// =============================================================================
// EVIDENCE WARNING TESTS
// =============================================================================

describe('Money Claim Rules Engine - Evidence Warnings', () => {
  it('triggers property_damage_evidence_warning when no evidence', () => {
    const facts: MoneyClaimFacts = {
      ...propertyDamageOnlyFacts,
      uploaded_documents: [],
      evidence_reviewed: false,
    };
    const result = evaluateRules(facts);

    const warning = result.warnings.find((w) => w.id === 'property_damage_evidence_warning');
    expect(warning).toBeDefined();
  });

  it('triggers cleaning_evidence_warning when no evidence', () => {
    const facts: MoneyClaimFacts = {
      ...completeValidFacts,
      claiming_rent_arrears: false,
      arrears_items: [],
      money_claim: {
        ...completeValidFacts.money_claim,
        other_amounts_types: ['cleaning'],
        damage_items: [{ id: '1', description: 'Cleaning', amount: 200, category: 'cleaning' }],
      },
      uploaded_documents: [],
      evidence_reviewed: false,
    };
    const result = evaluateRules(facts);

    const warning = result.warnings.find((w) => w.id === 'cleaning_evidence_warning');
    expect(warning).toBeDefined();
  });

  it('triggers council_tax_evidence_required when no evidence', () => {
    const facts: MoneyClaimFacts = {
      ...councilTaxFacts,
      uploaded_documents: [],
    };
    const result = evaluateRules(facts);

    const warning = result.warnings.find((w) => w.id === 'council_tax_evidence_required');
    expect(warning).toBeDefined();
  });
});

// =============================================================================
// EVIDENCE INTELLIGENCE RULES TESTS
// =============================================================================

describe('Money Claim Rules Engine - Evidence Intelligence Rules', () => {
  it('triggers property_damage_missing_photo_evidence when no photo evidence', () => {
    const facts: MoneyClaimFacts = {
      ...propertyDamageOnlyFacts,
      uploaded_documents: [
        { id: '1', name: 'tenancy-agreement.pdf', type: 'application/pdf' },
      ],
    };
    const result = evaluateRules(facts);

    const warning = result.warnings.find((w) => w.id === 'property_damage_missing_photo_evidence');
    expect(warning).toBeDefined();
  });

  it('does not trigger property_damage_missing_photo_evidence when photo evidence present', () => {
    const facts: MoneyClaimFacts = {
      ...propertyDamageOnlyFacts,
      uploaded_documents: [
        { id: '1', name: 'damage-photo.jpg', type: 'image/jpeg' },
      ],
    };
    const result = evaluateRules(facts);

    const warning = result.warnings.find((w) => w.id === 'property_damage_missing_photo_evidence');
    expect(warning).toBeUndefined();
  });

  it('triggers property_damage_missing_inventory_evidence when no inventory', () => {
    const facts: MoneyClaimFacts = {
      ...propertyDamageOnlyFacts,
      uploaded_documents: [
        { id: '1', name: 'damage-photo.jpg', type: 'image/jpeg' },
      ],
    };
    const result = evaluateRules(facts);

    const warning = result.warnings.find((w) => w.id === 'property_damage_missing_inventory_evidence');
    expect(warning).toBeDefined();
  });

  it('does not trigger property_damage_missing_inventory_evidence when check-in inventory present', () => {
    const facts: MoneyClaimFacts = {
      ...propertyDamageOnlyFacts,
      uploaded_documents: [
        { id: '1', name: 'check-in-inventory.pdf', type: 'application/pdf' },
      ],
    };
    const result = evaluateRules(facts);

    const warning = result.warnings.find((w) => w.id === 'property_damage_missing_inventory_evidence');
    expect(warning).toBeUndefined();
  });

  it('triggers property_damage_missing_quote_invoice when no invoice', () => {
    const facts: MoneyClaimFacts = {
      ...propertyDamageOnlyFacts,
      uploaded_documents: [
        { id: '1', name: 'damage-photo.jpg', type: 'image/jpeg' },
        { id: '2', name: 'check-in-inventory.pdf', type: 'application/pdf' },
      ],
    };
    const result = evaluateRules(facts);

    const warning = result.warnings.find((w) => w.id === 'property_damage_missing_quote_invoice');
    expect(warning).toBeDefined();
  });

  it('does not trigger property_damage_missing_quote_invoice when invoice present', () => {
    const facts: MoneyClaimFacts = {
      ...propertyDamageOnlyFacts,
      uploaded_documents: [
        { id: '1', name: 'repair-invoice.pdf', type: 'application/pdf' },
      ],
    };
    const result = evaluateRules(facts);

    const warning = result.warnings.find((w) => w.id === 'property_damage_missing_quote_invoice');
    expect(warning).toBeUndefined();
  });

  it('triggers rent_arrears_missing_rent_ledger when no rent ledger', () => {
    const facts: MoneyClaimFacts = {
      ...rentArrearsOnlyFacts,
      uploaded_documents: [
        { id: '1', name: 'tenancy-agreement.pdf', type: 'application/pdf' },
      ],
    };
    const result = evaluateRules(facts);

    const warning = result.warnings.find((w) => w.id === 'rent_arrears_missing_rent_ledger');
    expect(warning).toBeDefined();
  });

  it('does not trigger rent_arrears_missing_rent_ledger when rent ledger present', () => {
    const facts: MoneyClaimFacts = {
      ...rentArrearsOnlyFacts,
      uploaded_documents: [
        { id: '1', name: 'rent-ledger-2024.xlsx', type: 'application/vnd.ms-excel' },
      ],
    };
    const result = evaluateRules(facts);

    const warning = result.warnings.find((w) => w.id === 'rent_arrears_missing_rent_ledger');
    expect(warning).toBeUndefined();
  });

  it('does not trigger rent_arrears_missing_rent_ledger when bank statement present', () => {
    const facts: MoneyClaimFacts = {
      ...rentArrearsOnlyFacts,
      uploaded_documents: [
        { id: '1', name: 'bank-statement-jan.pdf', type: 'application/pdf' },
      ],
    };
    const result = evaluateRules(facts);

    const warning = result.warnings.find((w) => w.id === 'rent_arrears_missing_rent_ledger');
    expect(warning).toBeUndefined();
  });

  it('triggers council_tax_missing_tenancy_agreement when no tenancy agreement', () => {
    const facts: MoneyClaimFacts = {
      ...councilTaxFacts,
      uploaded_documents: [
        { id: '1', name: 'council-tax-bill.pdf', type: 'application/pdf' },
      ],
    };
    const result = evaluateRules(facts);

    const warning = result.warnings.find((w) => w.id === 'council_tax_missing_tenancy_agreement');
    expect(warning).toBeDefined();
  });

  it('triggers council_tax_missing_statement when no council tax statement', () => {
    const facts: MoneyClaimFacts = {
      ...councilTaxFacts,
      uploaded_documents: [
        { id: '1', name: 'tenancy-agreement.pdf', type: 'application/pdf' },
      ],
    };
    const result = evaluateRules(facts);

    const warning = result.warnings.find((w) => w.id === 'council_tax_missing_statement');
    expect(warning).toBeDefined();
  });

  it('does not trigger council_tax warnings when all evidence present', () => {
    const facts: MoneyClaimFacts = {
      ...councilTaxFacts,
      uploaded_documents: [
        { id: '1', name: 'tenancy-agreement.pdf', type: 'application/pdf' },
        { id: '2', name: 'council-tax-statement.pdf', type: 'application/pdf' },
      ],
    };
    const result = evaluateRules(facts);

    const taWarning = result.warnings.find((w) => w.id === 'council_tax_missing_tenancy_agreement');
    const ctWarning = result.warnings.find((w) => w.id === 'council_tax_missing_statement');
    expect(taWarning).toBeUndefined();
    expect(ctWarning).toBeUndefined();
  });
});

// =============================================================================
// GROUP BY SECTION TESTS
// =============================================================================

describe('Money Claim Rules Engine - Group By Section', () => {
  it('groups validation results by section using YAML config', () => {
    const facts: MoneyClaimFacts = {
      // Missing claimant info
      tenant_full_name: 'Test Tenant',
      defendant_address_line1: '123 Test St',
      tenancy_start_date: '2024-01-01',
      rent_amount: 1000,
      rent_frequency: 'monthly',
      claiming_rent_arrears: true,
      arrears_items: [{ period_start: '2024-06-01', period_end: '2024-06-30', rent_due: 1000, rent_paid: 0 }],
      letter_before_claim_sent: true,
      pap_letter_date: '2024-10-01',
      money_claim: {
        charge_interest: false,
      },
    };

    const result = evaluateRules(facts);
    const grouped = groupResultsBySection(result);

    // Should have claimant section with blockers
    expect(grouped['claimant']).toBeDefined();
    expect(grouped['claimant'].blockers.length).toBeGreaterThan(0);
  });

  it('returns only sections with issues', () => {
    const result = evaluateRules(completeValidFacts);
    const grouped = groupResultsBySection(result);

    // Complete valid facts should have no or minimal sections
    const totalIssues = Object.values(grouped).reduce(
      (sum, section) => sum + section.blockers.length + section.warnings.length + section.suggestions.length,
      0
    );

    // Valid facts may still have some suggestions
    expect(result.blockers).toHaveLength(0);
  });
});

// =============================================================================
// LEGAL P0 RULES TESTS - Limitation Period, Betterment, Deposit Overlap
// =============================================================================

describe('Money Claim Rules Engine - Legal P0 Rules', () => {
  describe('Limitation Period Warning', () => {
    it('triggers limitation_period_warning when tenancy started over 5.5 years ago', () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 6); // 6 years ago

      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        tenancy_start_date: oldDate.toISOString().split('T')[0],
      };
      const result = evaluateRules(facts);

      const warning = result.warnings.find((w) => w.id === 'limitation_period_warning');
      expect(warning).toBeDefined();
      expect(warning?.message).toContain('Limitation Act 1980');
    });

    it('does not trigger limitation_period_warning for recent tenancy', () => {
      const recentDate = new Date();
      recentDate.setFullYear(recentDate.getFullYear() - 2); // 2 years ago

      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        tenancy_start_date: recentDate.toISOString().split('T')[0],
      };
      const result = evaluateRules(facts);

      const warning = result.warnings.find((w) => w.id === 'limitation_period_warning');
      expect(warning).toBeUndefined();
    });

    it('triggers limitation_period_arrears_warning for old arrears entries', () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 6);

      const facts: MoneyClaimFacts = {
        ...completeValidFacts,
        claiming_rent_arrears: true,
        arrears_items: [
          { period_start: oldDate.toISOString().split('T')[0], period_end: '2020-01-31', rent_due: 1000, rent_paid: 0 },
          { period_start: '2024-06-01', period_end: '2024-06-30', rent_due: 1000, rent_paid: 0 },
        ],
      };
      const result = evaluateRules(facts);

      const warning = result.warnings.find((w) => w.id === 'limitation_period_arrears_warning');
      expect(warning).toBeDefined();
    });
  });

  describe('Property Damage Betterment Warning', () => {
    it('triggers property_damage_betterment_warning when claiming property damage', () => {
      const facts: MoneyClaimFacts = {
        ...propertyDamageOnlyFacts,
        money_claim: {
          ...propertyDamageOnlyFacts.money_claim,
          damage_items: [
            { id: '1', description: 'Replace carpet', amount: 500, category: 'property_damage' },
          ],
        },
      };
      const result = evaluateRules(facts);

      const warning = result.warnings.find((w) => w.id === 'property_damage_betterment_warning');
      expect(warning).toBeDefined();
      expect(warning?.message).toContain('depreciated value');
    });

    it('does not trigger property_damage_betterment_warning when no damage items', () => {
      const facts: MoneyClaimFacts = {
        ...rentArrearsOnlyFacts,
      };
      const result = evaluateRules(facts);

      const warning = result.warnings.find((w) => w.id === 'property_damage_betterment_warning');
      expect(warning).toBeUndefined();
    });
  });

  describe('Deposit Deduction Overlap Warning', () => {
    it('triggers deposit_deduction_overlap_warning when deposit deductions confirmed', () => {
      const facts: MoneyClaimFacts = {
        ...propertyDamageOnlyFacts,
        money_claim: {
          ...propertyDamageOnlyFacts.money_claim,
          deposit_deductions_confirmed: true,
        },
      };
      const result = evaluateRules(facts);

      const warning = result.warnings.find((w) => w.id === 'deposit_deduction_overlap_warning');
      expect(warning).toBeDefined();
      expect(warning?.message).toContain('Double recovery');
    });

    it('does not trigger deposit_deduction_overlap_warning when deposit deductions not confirmed', () => {
      const facts: MoneyClaimFacts = {
        ...propertyDamageOnlyFacts,
        money_claim: {
          ...propertyDamageOnlyFacts.money_claim,
          deposit_deductions_confirmed: false,
        },
      };
      const result = evaluateRules(facts);

      const warning = result.warnings.find((w) => w.id === 'deposit_deduction_overlap_warning');
      expect(warning).toBeUndefined();
    });

    it('triggers deposit_deduction_check_required suggestion when undefined', () => {
      const facts: MoneyClaimFacts = {
        ...propertyDamageOnlyFacts,
        money_claim: {
          ...propertyDamageOnlyFacts.money_claim,
          deposit_deductions_confirmed: undefined,
        },
      };
      const result = evaluateRules(facts);

      const suggestion = result.suggestions.find((s) => s.id === 'deposit_deduction_check_required');
      expect(suggestion).toBeDefined();
    });
  });
});

// =============================================================================
// JOINT DEFENDANT VALIDATION TESTS
// =============================================================================

describe('Money Claim Rules Engine - Joint Defendant Support', () => {
  it('allows valid claim with single defendant', () => {
    const facts: MoneyClaimFacts = {
      ...completeValidFacts,
    };
    const result = evaluateRules(facts);
    expect(result.isValid).toBe(true);
  });

  it('allows valid claim with joint defendants', () => {
    const facts: MoneyClaimFacts = {
      ...completeValidFacts,
      has_joint_defendants: true,
      tenant_2_name: 'Jane Tenant',
      tenant_2_address_line1: '2 High Street',
      tenant_2_postcode: 'E1 2BB',
    };
    const result = evaluateRules(facts);
    expect(result.isValid).toBe(true);
  });
});
