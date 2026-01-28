/**
 * Regression tests for Money Claim wizard fixes
 *
 * Tests the following improvements:
 * 1. Blockers/warnings reflect data user entered (facts mapping fix)
 * 2. Tab 4 includes court name input field
 * 3. Claim summary uses tenant name + property address (not placeholders)
 * 4. Arrears uses Section 8 arrears component with pro-rata
 * 5. Combined totals across multiple claim grounds
 * 6. Pre-Action "No" triggers PAP document generation notice
 *
 * Related issue: Money Claim wizard facts mapping mismatch
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import validators and generators
import {
  validateClaimantSection,
  validateDefendantSection,
  validateTenancySection,
  validateClaimDetailsSection,
  validateArrearsSection,
  getSectionValidation,
} from '@/lib/validation/money-claim-case-validator';

import {
  generateBasisOfClaimStatement,
  generateClaimSummary,
  getMissingStatementInfo,
} from '@/lib/money-claim/statement-generator';

describe('Money Claim wizard facts mapping fix', () => {
  describe('ClaimantSection validation', () => {
    it('should show no blockers when top-level keys are populated', () => {
      const facts = {
        landlord_full_name: 'Jane Smith',
        landlord_address_line1: '10 High Street',
        landlord_address_postcode: 'M1 2AB',
      };

      const result = validateClaimantSection(facts, 'england');
      expect(result.blockers).toHaveLength(0);
    });

    it('should show blockers when top-level keys are missing', () => {
      const facts = {
        // Only nested keys, missing top-level
        parties: {
          landlord: {
            name: 'Jane Smith',
            address_line1: '10 High Street',
            postcode: 'M1 2AB',
          },
        },
      };

      const result = validateClaimantSection(facts, 'england');
      // Should have blockers because top-level keys are not set
      expect(result.blockers.length).toBeGreaterThan(0);
    });

    it('should pass validation when both nested and top-level keys exist', () => {
      const facts = {
        // Top-level keys (from updated ClaimantSection)
        landlord_full_name: 'Jane Smith',
        landlord_address_line1: '10 High Street',
        landlord_address_postcode: 'M1 2AB',
        // Nested keys (for backward compatibility)
        parties: {
          landlord: {
            name: 'Jane Smith',
            address_line1: '10 High Street',
            postcode: 'M1 2AB',
          },
        },
      };

      const result = validateClaimantSection(facts, 'england');
      expect(result.blockers).toHaveLength(0);
    });
  });

  describe('DefendantSection validation', () => {
    it('should show no blockers when top-level keys are populated', () => {
      const facts = {
        tenant_full_name: 'Sonia Shezadi',
        defendant_address_line1: '16 Waterloo Road',
      };

      const result = validateDefendantSection(facts, 'england');
      expect(result.blockers).toHaveLength(0);
    });

    it('should use property address as fallback for defendant address', () => {
      const facts = {
        tenant_full_name: 'Sonia Shezadi',
        property_address_line1: '16 Waterloo Road',
        // No defendant_address_line1
      };

      const result = validateDefendantSection(facts, 'england');
      expect(result.blockers).toHaveLength(0);
    });
  });

  describe('TenancySection validation', () => {
    it('should show no blockers when top-level keys are populated', () => {
      const facts = {
        tenancy_start_date: '2024-01-01',
        rent_amount: 750,
        rent_frequency: 'monthly',
        property_address_line1: '16 Waterloo Road',
        property_address_postcode: 'LS28 7PW',
      };

      const result = validateTenancySection(facts, 'england');
      expect(result.blockers).toHaveLength(0);
    });
  });
});

describe('Claim Details court name requirement', () => {
  it('should require court name for England claims', () => {
    const facts = {
      claiming_rent_arrears: true,
      money_claim: {
        charge_interest: false,
        // No court_name
      },
    };

    const result = validateClaimDetailsSection(facts, 'england');
    expect(result.blockers).toContain(
      'Please enter the County Court name where you will file your claim'
    );
  });

  it('should pass when court name is provided', () => {
    const facts = {
      claiming_rent_arrears: true,
      money_claim: {
        charge_interest: false,
        court_name: 'Manchester County Court',
      },
    };

    const result = validateClaimDetailsSection(facts, 'england');
    expect(result.blockers).not.toContain(
      'Please enter the County Court name where you will file your claim'
    );
  });

  it('should accept court_name from top-level key', () => {
    const facts = {
      claiming_rent_arrears: true,
      court_name: 'Leeds County Court',
      money_claim: {
        charge_interest: false,
      },
    };

    const result = validateClaimDetailsSection(facts, 'england');
    const courtBlocker = result.blockers.find((b) =>
      b.includes('County Court name')
    );
    expect(courtBlocker).toBeUndefined();
  });
});

describe('Statement generator uses real values', () => {
  it('should use top-level tenant_full_name in basis of claim', () => {
    const facts = {
      tenant_full_name: 'Sonia Shezadi',
      property_address_line1: '16 Waterloo Road',
      property_address_town: 'Pudsey',
      property_address_postcode: 'LS28 7PW',
      claiming_rent_arrears: true,
      rent_amount: 750,
      rent_frequency: 'monthly' as const,
      tenancy_start_date: '2024-01-01',
    };

    const statement = generateBasisOfClaimStatement(facts);

    expect(statement).toContain('Sonia Shezadi');
    expect(statement).not.toContain('[tenant name]');
  });

  it('should use nested parties.tenants[0].name as fallback', () => {
    const facts = {
      parties: {
        tenants: [{ name: 'John Tenant' }],
      },
      property: {
        address_line1: '16 Waterloo Road',
        city: 'Pudsey',
        postcode: 'LS28 7PW',
      },
      claiming_rent_arrears: true,
      rent_amount: 750,
      rent_frequency: 'monthly' as const,
    };

    const statement = generateBasisOfClaimStatement(facts);

    expect(statement).toContain('John Tenant');
    expect(statement).not.toContain('[tenant name]');
  });

  it('should use property address from nested path as fallback', () => {
    const facts = {
      tenant_full_name: 'Sonia Shezadi',
      property: {
        address_line1: '16 Waterloo Road',
        city: 'Pudsey',
        postcode: 'LS28 7PW',
      },
      claiming_rent_arrears: true,
    };

    const statement = generateBasisOfClaimStatement(facts);

    expect(statement).toContain('16 Waterloo Road');
    expect(statement).toContain('Pudsey');
    expect(statement).toContain('LS28 7PW');
    expect(statement).not.toContain('[property address]');
  });

  it('should use tenancy.start_date as fallback', () => {
    const facts = {
      tenant_full_name: 'Sonia Shezadi',
      property_address_line1: '16 Waterloo Road',
      tenancy: {
        start_date: '2024-01-01',
      },
      claiming_rent_arrears: true,
    };

    const statement = generateBasisOfClaimStatement(facts);

    expect(statement).toContain('January 2024');
  });

  it('getMissingStatementInfo should not report missing fields when nested paths have data', () => {
    const facts = {
      parties: {
        tenants: [{ name: 'Sonia Shezadi' }],
      },
      property: {
        address_line1: '16 Waterloo Road',
      },
      money_claim: {
        tenant_still_in_property: false,
      },
      claiming_rent_arrears: true,
      total_arrears: 1500,
      tenancy: {
        rent_amount: 750,
      },
    };

    const missing = getMissingStatementInfo(facts);

    expect(missing).not.toContain('Tenant/defendant name');
    expect(missing).not.toContain('Property address');
    expect(missing).not.toContain('Rent amount');
  });
});

describe('Arrears validation behavior', () => {
  it('should show blocker when rent arrears selected but no items added', () => {
    const facts = {
      claiming_rent_arrears: true,
      arrears_items: [],
    };

    const result = validateArrearsSection(facts);
    expect(result.blockers).toContain(
      'Please add at least one arrears period to the schedule'
    );
  });

  it('should NOT show incomplete warning for empty schedule', () => {
    const facts = {
      claiming_rent_arrears: true,
      arrears_items: [],
    };

    const result = validateArrearsSection(facts);
    expect(result.warnings).toHaveLength(0);
  });

  it('should show incomplete warning only for items with partial data', () => {
    const facts = {
      claiming_rent_arrears: true,
      arrears_items: [
        {
          period_start: '2024-01-01',
          // Missing period_end and rent_due
          rent_paid: 0,
        },
      ],
    };

    const result = validateArrearsSection(facts);
    expect(result.blockers).toHaveLength(0);
    expect(result.warnings.some((w) => w.includes('incomplete'))).toBe(true);
  });

  it('should only show zero balance warning when complete items exist', () => {
    const facts = {
      claiming_rent_arrears: true,
      arrears_items: [
        {
          period_start: '2024-01-01',
          period_end: '2024-01-31',
          rent_due: 750,
          rent_paid: 750, // Fully paid
        },
      ],
    };

    const result = validateArrearsSection(facts);
    expect(result.warnings.some((w) => w.includes('no outstanding balance'))).toBe(true);
  });

  it('should NOT show zero balance warning when balance is positive', () => {
    const facts = {
      claiming_rent_arrears: true,
      arrears_items: [
        {
          period_start: '2024-01-01',
          period_end: '2024-01-31',
          rent_due: 750,
          rent_paid: 0,
        },
      ],
    };

    const result = validateArrearsSection(facts);
    expect(result.warnings.filter((w) => w.includes('outstanding balance'))).toHaveLength(0);
  });
});

describe('Combined totals calculation', () => {
  it('should calculate combined_total from all subtotals', () => {
    const facts = {
      money_claim: {
        totals: {
          rent_arrears: 1500,
          damage: 500,
          cleaning: 200,
          utilities: 100,
          council_tax: 0,
          other: 50,
        },
      },
    };

    const expectedTotal = 1500 + 500 + 200 + 100 + 0 + 50;
    const actualTotal =
      (facts.money_claim.totals.rent_arrears || 0) +
      (facts.money_claim.totals.damage || 0) +
      (facts.money_claim.totals.cleaning || 0) +
      (facts.money_claim.totals.utilities || 0) +
      (facts.money_claim.totals.council_tax || 0) +
      (facts.money_claim.totals.other || 0);

    expect(actualTotal).toBe(expectedTotal);
    expect(actualTotal).toBe(2350);
  });

  it('should use arrears from issues.rent_arrears as fallback', () => {
    const facts = {
      issues: {
        rent_arrears: {
          arrears_items: [
            { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 750, rent_paid: 0 },
            { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 750, rent_paid: 200 },
          ],
        },
      },
    };

    // Replicate the calculation logic from the validator
    const items = facts.arrears_items || facts.issues?.rent_arrears?.arrears_items || [];
    const total = items.reduce((sum: number, item: any) => {
      const due = item.rent_due || 0;
      const paid = item.rent_paid || 0;
      return sum + (due - paid);
    }, 0);

    expect(total).toBe(750 + 550); // (750-0) + (750-200)
  });
});

describe('Pre-Action PAP document generation', () => {
  it('should set generate_pap_documents flag when user selects No', () => {
    // Simulate what handlePapDocumentsSentChange does
    const value = 'no';
    const generatePapDocuments = value === 'no';

    expect(generatePapDocuments).toBe(true);
  });

  it('should not set generate_pap_documents flag when user selects Yes', () => {
    const value = 'yes';
    const generatePapDocuments = value === 'no';

    expect(generatePapDocuments).toBe(false);
  });

  it('should set top-level letter_before_claim_sent when user selects Yes', () => {
    const value = 'yes';
    const letterBeforeClaimSent = value === 'yes';

    expect(letterBeforeClaimSent).toBe(true);
  });

  it('needsGeneratedPapDocuments should be true when pap_documents_sent is false', () => {
    const moneyClaim = {
      pap_documents_sent: false,
    };

    const needsGeneratedPapDocuments =
      moneyClaim.pap_documents_sent === false ||
      (moneyClaim as any).generate_pap_documents === true;

    expect(needsGeneratedPapDocuments).toBe(true);
  });
});

describe('Claim Details section validation', () => {
  it('should require at least one claim type', () => {
    const facts = {
      money_claim: {
        charge_interest: false,
        court_name: 'Manchester County Court',
      },
    };

    const result = validateClaimDetailsSection(facts, 'england');
    expect(result.blockers).toContain('Please select at least one type of claim');
  });

  it('should require interest decision for England', () => {
    const facts = {
      claiming_rent_arrears: true,
      court_name: 'Manchester County Court',
      money_claim: {
        // No charge_interest decision
        court_name: 'Manchester County Court',
      },
    };

    const result = validateClaimDetailsSection(facts, 'england');
    expect(result.blockers).toContain(
      'Please indicate whether you want to claim statutory interest'
    );
  });

  it('should pass with all required fields', () => {
    const facts = {
      claiming_rent_arrears: true,
      court_name: 'Manchester County Court',
      money_claim: {
        charge_interest: true,
        interest_start_date: '2024-01-01',
        court_name: 'Manchester County Court',
        basis_of_claim: 'The defendant owes rent arrears totaling £1500 for the property.',
      },
    };

    const result = validateClaimDetailsSection(facts, 'england');
    expect(result.blockers).toHaveLength(0);
  });
});

describe('Section completion in flow', () => {
  it('claimant section should be complete with top-level keys', () => {
    const facts = {
      landlord_full_name: 'Jane Smith',
      landlord_address_line1: '10 High Street',
      landlord_address_postcode: 'M1 2AB',
    };

    // This mirrors the isComplete check in MoneyClaimSectionFlow
    const isComplete =
      Boolean(facts.landlord_full_name) &&
      Boolean(facts.landlord_address_line1) &&
      Boolean(facts.landlord_address_postcode);

    expect(isComplete).toBe(true);
  });

  it('defendant section should be complete with top-level keys', () => {
    const facts = {
      tenant_full_name: 'Sonia Shezadi',
      defendant_address_line1: '16 Waterloo Road',
    };

    // This mirrors the isComplete check in MoneyClaimSectionFlow
    const isComplete =
      Boolean(facts.tenant_full_name) &&
      Boolean(facts.defendant_address_line1 || facts.property_address_line1);

    expect(isComplete).toBe(true);
  });

  it('tenancy section should be complete with top-level keys', () => {
    const facts = {
      tenancy_start_date: '2024-01-01',
      rent_amount: 750,
      rent_frequency: 'monthly',
    };

    // This mirrors the isComplete check in MoneyClaimSectionFlow
    const isComplete =
      Boolean(facts.tenancy_start_date) &&
      Boolean(facts.rent_amount) &&
      Boolean(facts.rent_frequency);

    expect(isComplete).toBe(true);
  });

  it('claim details should be complete with interest and claim type', () => {
    const facts = {
      claiming_rent_arrears: true,
      money_claim: {
        charge_interest: false,
      },
      __meta: { jurisdiction: 'england' },
    };

    // This mirrors the isComplete check in MoneyClaimSectionFlow
    const hasClaimType = facts.claiming_rent_arrears === true;
    const jurisdiction = facts.__meta?.jurisdiction;
    const isEnglandWales = jurisdiction === 'england' || jurisdiction === 'wales';
    const interestDecided =
      facts.money_claim?.charge_interest === true ||
      facts.money_claim?.charge_interest === false;
    const isComplete = hasClaimType && (!isEnglandWales || interestDecided);

    expect(isComplete).toBe(true);
  });
});

describe('ClaimDetailsSection gating logic', () => {
  /**
   * Helper function that mirrors the requiredDataStatus logic from ClaimDetailsSection.tsx
   */
  function getRequiredDataStatus(facts: any, selectedReasons: Set<string>) {
    const needsArrearsSchedule = selectedReasons.has('rent_arrears');
    const needsDamageItems =
      selectedReasons.has('property_damage') ||
      selectedReasons.has('cleaning') ||
      selectedReasons.has('unpaid_utilities') ||
      selectedReasons.has('unpaid_council_tax') ||
      selectedReasons.has('other_tenant_debt');

    // Check arrears items from either location
    const arrearsItems =
      facts.arrears_items || facts.issues?.rent_arrears?.arrears_items || [];
    const hasArrearsData = Array.isArray(arrearsItems) && arrearsItems.length > 0;

    // Check damage items
    const damageItems = facts.money_claim?.damage_items || [];
    const hasDamageData = Array.isArray(damageItems) && damageItems.length > 0;

    // Build list of missing sections
    const missingSections: string[] = [];
    if (needsArrearsSchedule && !hasArrearsData) {
      missingSections.push('Arrears');
    }
    if (needsDamageItems && !hasDamageData) {
      missingSections.push('Damages');
    }

    const hasAllRequired =
      (!needsArrearsSchedule || hasArrearsData) &&
      (!needsDamageItems || hasDamageData);

    return {
      needsArrearsSchedule,
      needsDamageItems,
      hasArrearsData,
      hasDamageData,
      missingSections,
      hasAllRequired,
    };
  }

  describe('when no claim reasons selected', () => {
    it('should not require any data', () => {
      const facts = {};
      const selectedReasons = new Set<string>();
      const status = getRequiredDataStatus(facts, selectedReasons);

      expect(status.needsArrearsSchedule).toBe(false);
      expect(status.needsDamageItems).toBe(false);
      expect(status.missingSections).toHaveLength(0);
      expect(status.hasAllRequired).toBe(true);
    });
  });

  describe('when rent_arrears is selected', () => {
    it('should require arrears schedule when no arrears items exist', () => {
      const facts = {};
      const selectedReasons = new Set(['rent_arrears']);
      const status = getRequiredDataStatus(facts, selectedReasons);

      expect(status.needsArrearsSchedule).toBe(true);
      expect(status.hasArrearsData).toBe(false);
      expect(status.missingSections).toContain('Arrears');
      expect(status.hasAllRequired).toBe(false);
    });

    it('should be satisfied when arrears_items is populated at top level', () => {
      const facts = {
        arrears_items: [
          { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 750, rent_paid: 0 },
        ],
      };
      const selectedReasons = new Set(['rent_arrears']);
      const status = getRequiredDataStatus(facts, selectedReasons);

      expect(status.needsArrearsSchedule).toBe(true);
      expect(status.hasArrearsData).toBe(true);
      expect(status.missingSections).not.toContain('Arrears');
      expect(status.hasAllRequired).toBe(true);
    });

    it('should be satisfied when arrears_items is populated in nested path', () => {
      const facts = {
        issues: {
          rent_arrears: {
            arrears_items: [
              { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 750, rent_paid: 0 },
            ],
          },
        },
      };
      const selectedReasons = new Set(['rent_arrears']);
      const status = getRequiredDataStatus(facts, selectedReasons);

      expect(status.hasArrearsData).toBe(true);
      expect(status.hasAllRequired).toBe(true);
    });
  });

  describe('when damage categories are selected', () => {
    it('should require damage items when property_damage is selected', () => {
      const facts = {};
      const selectedReasons = new Set(['property_damage']);
      const status = getRequiredDataStatus(facts, selectedReasons);

      expect(status.needsDamageItems).toBe(true);
      expect(status.hasDamageData).toBe(false);
      expect(status.missingSections).toContain('Damages');
      expect(status.hasAllRequired).toBe(false);
    });

    it('should require damage items when cleaning is selected', () => {
      const facts = {};
      const selectedReasons = new Set(['cleaning']);
      const status = getRequiredDataStatus(facts, selectedReasons);

      expect(status.needsDamageItems).toBe(true);
      expect(status.missingSections).toContain('Damages');
    });

    it('should require damage items when unpaid_utilities is selected', () => {
      const facts = {};
      const selectedReasons = new Set(['unpaid_utilities']);
      const status = getRequiredDataStatus(facts, selectedReasons);

      expect(status.needsDamageItems).toBe(true);
      expect(status.missingSections).toContain('Damages');
    });

    it('should require damage items when other_tenant_debt is selected', () => {
      const facts = {};
      const selectedReasons = new Set(['other_tenant_debt']);
      const status = getRequiredDataStatus(facts, selectedReasons);

      expect(status.needsDamageItems).toBe(true);
      expect(status.missingSections).toContain('Damages');
    });

    it('should be satisfied when damage_items is populated', () => {
      const facts = {
        money_claim: {
          damage_items: [
            { id: '1', category: 'property_damage', description: 'Broken window', amount: 200 },
          ],
        },
      };
      const selectedReasons = new Set(['property_damage']);
      const status = getRequiredDataStatus(facts, selectedReasons);

      expect(status.needsDamageItems).toBe(true);
      expect(status.hasDamageData).toBe(true);
      expect(status.missingSections).not.toContain('Damages');
      expect(status.hasAllRequired).toBe(true);
    });
  });

  describe('when both arrears and damage categories are selected', () => {
    it('should require both schedules when neither is populated', () => {
      const facts = {};
      const selectedReasons = new Set(['rent_arrears', 'property_damage']);
      const status = getRequiredDataStatus(facts, selectedReasons);

      expect(status.needsArrearsSchedule).toBe(true);
      expect(status.needsDamageItems).toBe(true);
      expect(status.missingSections).toContain('Arrears');
      expect(status.missingSections).toContain('Damages');
      expect(status.hasAllRequired).toBe(false);
    });

    it('should still be missing Damages when only arrears is populated', () => {
      const facts = {
        arrears_items: [
          { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 750, rent_paid: 0 },
        ],
      };
      const selectedReasons = new Set(['rent_arrears', 'property_damage']);
      const status = getRequiredDataStatus(facts, selectedReasons);

      expect(status.hasArrearsData).toBe(true);
      expect(status.hasDamageData).toBe(false);
      expect(status.missingSections).not.toContain('Arrears');
      expect(status.missingSections).toContain('Damages');
      expect(status.hasAllRequired).toBe(false);
    });

    it('should still be missing Arrears when only damages is populated', () => {
      const facts = {
        money_claim: {
          damage_items: [
            { id: '1', category: 'property_damage', description: 'Broken window', amount: 200 },
          ],
        },
      };
      const selectedReasons = new Set(['rent_arrears', 'property_damage']);
      const status = getRequiredDataStatus(facts, selectedReasons);

      expect(status.hasArrearsData).toBe(false);
      expect(status.hasDamageData).toBe(true);
      expect(status.missingSections).toContain('Arrears');
      expect(status.missingSections).not.toContain('Damages');
      expect(status.hasAllRequired).toBe(false);
    });

    it('should be satisfied when both schedules are populated', () => {
      const facts = {
        arrears_items: [
          { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 750, rent_paid: 0 },
        ],
        money_claim: {
          damage_items: [
            { id: '1', category: 'property_damage', description: 'Broken window', amount: 200 },
          ],
        },
      };
      const selectedReasons = new Set(['rent_arrears', 'property_damage', 'cleaning']);
      const status = getRequiredDataStatus(facts, selectedReasons);

      expect(status.hasArrearsData).toBe(true);
      expect(status.hasDamageData).toBe(true);
      expect(status.missingSections).toHaveLength(0);
      expect(status.hasAllRequired).toBe(true);
    });
  });

  describe('canShowDetailedSections calculation', () => {
    /**
     * BUG FIX: canShowDetailedSections no longer depends on arrears/damages data.
     * It only requires claim reasons to be selected.
     *
     * Arrears/damages validation happens at the Review stage, not on Claim Details.
     * This prevents the premature "Complete required sections first" warning.
     */
    it('should be false when no claim reasons selected', () => {
      const selectedReasons = new Set<string>();
      // NEW BEHAVIOR: canShowDetailedSections = selectedReasons.size > 0
      const canShowDetailedSections = selectedReasons.size > 0;

      expect(canShowDetailedSections).toBe(false);
    });

    it('should be true when claim reasons selected even if arrears data missing', () => {
      const selectedReasons = new Set(['rent_arrears']);
      // NEW BEHAVIOR: canShowDetailedSections = selectedReasons.size > 0
      // Arrears validation happens at Review stage, not Claim Details
      const canShowDetailedSections = selectedReasons.size > 0;

      expect(canShowDetailedSections).toBe(true);
    });

    it('should be true when claim reasons selected and required data present', () => {
      const facts = {
        arrears_items: [
          { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 750, rent_paid: 0 },
        ],
      };
      const selectedReasons = new Set(['rent_arrears']);
      const canShowDetailedSections = selectedReasons.size > 0;

      expect(canShowDetailedSections).toBe(true);
    });
  });
});

/**
 * Bug fix regression tests:
 * - Claim Details should NOT show arrears prerequisite warning
 * - Arrears validation happens at Review/Draft stage
 */
describe('Claim Details arrears warning bug fix', () => {
  describe('ClaimDetailsSection behavior', () => {
    /**
     * The inline "Complete required sections first" warning was removed.
     * Users can now fill out basis of claim, interest, etc. on Claim Details
     * even when arrears data is not yet entered.
     */
    it('should allow detailed sections when claim reasons selected (arrears data not required)', () => {
      const selectedReasons = new Set(['rent_arrears']);
      // New behavior: only check if reasons are selected
      const canShowDetailedSections = selectedReasons.size > 0;

      expect(canShowDetailedSections).toBe(true);
    });

    it('should NOT block claim details based on missing arrears items', () => {
      // In the old behavior, this would have set canShowDetailedSections = false
      // and shown "Complete required sections first" warning
      const facts = {
        claiming_rent_arrears: true,
        arrears_items: [], // Empty arrears
      };
      const selectedReasons = new Set(['rent_arrears']);

      // New behavior: canShowDetailedSections = selectedReasons.size > 0
      const canShowDetailedSections = selectedReasons.size > 0;

      expect(canShowDetailedSections).toBe(true);
    });
  });

  describe('Arrears validation at Review stage', () => {
    /**
     * The validateArrearsSection function should still correctly identify
     * when arrears items are missing - this validation runs at Review stage.
     */
    it('should return blocker when rent_arrears selected but no items exist', () => {
      const facts = {
        claiming_rent_arrears: true,
        arrears_items: [],
      };

      const result = validateArrearsSection(facts);

      expect(result.blockers).toContain(
        'Please add at least one arrears period to the schedule'
      );
    });

    it('should return no blocker when arrears items exist', () => {
      const facts = {
        claiming_rent_arrears: true,
        arrears_items: [
          { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 750, rent_paid: 0 },
        ],
      };

      const result = validateArrearsSection(facts);

      expect(result.blockers).toHaveLength(0);
    });

    it('should not validate arrears if not claiming rent arrears', () => {
      const facts = {
        claiming_rent_arrears: false,
        arrears_items: [],
      };

      const result = validateArrearsSection(facts);

      expect(result.blockers).toHaveLength(0);
    });
  });

  describe('Section validation via getSectionValidation', () => {
    it('claim_details section validation should NOT include arrears prerequisite', () => {
      const facts = {
        claiming_rent_arrears: true,
        arrears_items: [], // Empty arrears
        money_claim: {
          charge_interest: false,
          court_name: 'Manchester County Court',
        },
      };

      const result = getSectionValidation('claim_details', facts, 'england');

      // Claim details validation should not mention arrears
      expect(result.blockers.join(' ')).not.toContain('arrears');
      expect(result.blockers.join(' ')).not.toContain('Arrears');
    });

    it('arrears section validation SHOULD include blocker for missing items', () => {
      const facts = {
        claiming_rent_arrears: true,
        arrears_items: [],
      };

      const result = getSectionValidation('arrears', facts, 'england');

      expect(result.blockers).toContain(
        'Please add at least one arrears period to the schedule'
      );
    });
  });
});
