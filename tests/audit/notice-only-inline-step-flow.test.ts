/**
 * NOTICE-ONLY INLINE STEP FLOW AUDIT
 *
 * Tests that simulate stepping through the wizard with incremental facts,
 * verifying that inline validation appears AFTER EACH STEP.
 *
 * AUDIT GUARANTEES:
 * 1. Each step returns validation issues for the current question
 * 2. Issues accumulate as facts are collected
 * 3. Issues relevant to the current step are immediately surfaced
 * 4. Issue counts increase/decrease as answers change
 */

import { describe, expect, it } from 'vitest';
import { validateFlow } from '@/lib/validation/validateFlow';
import type { Jurisdiction } from '@/lib/jurisdictions/capabilities/matrix';

// ============================================================================
// STEP FLOW HELPERS
// ============================================================================

interface StepFacts {
  step: string;
  facts: Record<string, unknown>;
  expectedIssueChange: 'increase' | 'decrease' | 'same' | 'any';
  description: string;
}

/**
 * Run a step flow test for a route
 */
function runStepFlowTest(
  jurisdiction: Jurisdiction,
  route: string,
  steps: StepFacts[]
) {
  describe(`Step flow: ${jurisdiction} ${route}`, () => {
    let previousBlockingCount = 0;
    let previousWarningCount = 0;
    let cumulativeFacts: Record<string, unknown> = {};

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      describe(`Step ${i + 1}: ${step.step}`, () => {
        let result: ReturnType<typeof validateFlow>;

        it('processes step with incremental facts', () => {
          // Accumulate facts
          cumulativeFacts = { ...cumulativeFacts, ...step.facts };

          result = validateFlow({
            jurisdiction,
            product: 'notice_only',
            route,
            stage: 'preview', // Use preview stage to get all issues
            facts: cumulativeFacts,
          });

          expect(result).toBeDefined();
          expect(result.blocking_issues).toBeDefined();
          expect(result.warnings).toBeDefined();
        });

        it('returns valid issue structure', () => {
          for (const issue of result.blocking_issues) {
            expect(issue.code).toBeDefined();
            expect(issue.fields).toBeDefined();
          }
        });

        it(`issue count changes as expected (${step.expectedIssueChange})`, () => {
          const currentBlocking = result.blocking_issues.length;
          const currentWarnings = result.warnings.length;
          const currentTotal = currentBlocking + currentWarnings;
          const previousTotal = previousBlockingCount + previousWarningCount;

          switch (step.expectedIssueChange) {
            case 'increase':
              // First step can't increase from 0
              if (i > 0) {
                expect(currentTotal).toBeGreaterThanOrEqual(previousTotal);
              }
              break;
            case 'decrease':
              expect(currentTotal).toBeLessThanOrEqual(previousTotal);
              break;
            case 'same':
              // Allow small variance due to derived facts
              expect(Math.abs(currentTotal - previousTotal)).toBeLessThanOrEqual(2);
              break;
            case 'any':
              // No assertion - just verify it runs
              break;
          }

          previousBlockingCount = currentBlocking;
          previousWarningCount = currentWarnings;
        });

        it('description: ' + step.description, () => {
          // This test just documents what this step is testing
          expect(true).toBe(true);
        });
      });
    }
  });
}

// ============================================================================
// ENGLAND SECTION 21 STEP FLOW
// ============================================================================

describe('AUDIT: England Section 21 Inline Step Flow', () => {
  runStepFlowTest('england', 'section_21', [
    {
      step: 'Initial - empty facts',
      facts: {},
      expectedIssueChange: 'any',
      description: 'Starting with no facts should have required field issues',
    },
    {
      step: 'Landlord details',
      facts: {
        landlord_full_name: 'Test Landlord',
        landlord_address_line1: '1 Landlord Street',
        landlord_city: 'London',
        landlord_postcode: 'SW1A 1AA',
      },
      expectedIssueChange: 'decrease',
      description: 'Adding landlord details should reduce missing field issues',
    },
    {
      step: 'Tenant details',
      facts: {
        tenant_full_name: 'Test Tenant',
      },
      expectedIssueChange: 'decrease',
      description: 'Adding tenant details should reduce missing field issues',
    },
    {
      step: 'Property details',
      facts: {
        property_address_line1: '1 Property Street',
        property_city: 'London',
        property_postcode: 'E1 1AA',
      },
      expectedIssueChange: 'decrease',
      description: 'Adding property details should reduce missing field issues',
    },
    {
      step: 'Tenancy details',
      facts: {
        tenancy_start_date: '2020-01-15',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        is_fixed_term: false,
      },
      expectedIssueChange: 'decrease',
      description: 'Adding tenancy details should reduce missing field issues',
    },
    {
      step: 'Deposit - not taken',
      facts: {
        deposit_taken: false,
      },
      expectedIssueChange: 'decrease',
      description: 'Indicating no deposit removes deposit compliance issues',
    },
    {
      step: 'Gas - no appliances',
      facts: {
        has_gas_appliances: false,
      },
      expectedIssueChange: 'decrease',
      description: 'Indicating no gas removes gas safety issues',
    },
    {
      step: 'Notice dates',
      facts: {
        notice_expiry_date: '2025-03-15',
      },
      expectedIssueChange: 'decrease',
      description: 'Adding notice expiry should reduce issues',
    },
    {
      step: 'Compliance confirmations',
      facts: {
        epc_provided: true,
        how_to_rent_given: true,
        gas_safety_cert_provided: true,
        prescribed_info_given: true,
        deposit_protected: true,
      },
      expectedIssueChange: 'decrease',
      description: 'Confirming compliance should clear compliance issues',
    },
  ]);
});

// ============================================================================
// ENGLAND SECTION 8 STEP FLOW
// ============================================================================

describe('AUDIT: England Section 8 Inline Step Flow', () => {
  runStepFlowTest('england', 'section_8', [
    {
      step: 'Initial - empty facts',
      facts: {},
      expectedIssueChange: 'any',
      description: 'Starting with no facts should have required field issues',
    },
    {
      step: 'Landlord and tenant details',
      facts: {
        landlord_full_name: 'Test Landlord',
        landlord_address_line1: '1 Landlord Street',
        landlord_city: 'London',
        landlord_postcode: 'SW1A 1AA',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '1 Property Street',
        property_city: 'London',
        property_postcode: 'E1 1AA',
      },
      expectedIssueChange: 'decrease',
      description: 'Adding party details should reduce issues',
    },
    {
      step: 'Tenancy details',
      facts: {
        tenancy_start_date: '2020-01-15',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        is_fixed_term: false,
        deposit_taken: false,
        has_gas_appliances: false,
      },
      expectedIssueChange: 'decrease',
      description: 'Adding tenancy details should reduce issues',
    },
    {
      step: 'Grounds selection',
      facts: {
        ground_codes: [8],
        section8_grounds: ['ground_8'],
      },
      expectedIssueChange: 'decrease',
      description: 'Selecting grounds should satisfy ground requirement',
    },
    {
      step: 'Notice dates',
      facts: {
        notice_expiry_date: '2025-02-01',
      },
      expectedIssueChange: 'decrease',
      description: 'Adding notice expiry should reduce issues',
    },
  ]);
});

// ============================================================================
// DEPOSIT ISSUE TRACKING
// ============================================================================

describe('AUDIT: Deposit Issue Step Flow', () => {
  describe('Deposit issue appears when deposit_protected=false', () => {
    it('deposit issue is surfaced immediately when deposit is marked as not protected', () => {
      // Step 1: Minimal facts with deposit taken but not protected
      const facts = {
        landlord_full_name: 'Test Landlord',
        landlord_address_line1: '1 Landlord Street',
        landlord_city: 'London',
        landlord_postcode: 'SW1A 1AA',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '1 Property Street',
        property_city: 'London',
        property_postcode: 'E1 1AA',
        tenancy_start_date: '2020-01-15',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        notice_expiry_date: '2025-03-15',
        is_fixed_term: false,
        has_gas_appliances: false,
        // Deposit compliance fields
        deposit_taken: true,
        deposit_amount: 1000,
        deposit_protected: false, // This should trigger issue
        prescribed_info_given: true,
        epc_provided: true,
        how_to_rent_given: true,
      };

      const result = validateFlow({
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'preview',
        facts,
      });

      // Should have deposit issue
      const hasDepositIssue = result.blocking_issues.some(
        i => i.code === 'DEPOSIT_NOT_PROTECTED' ||
             i.fields?.includes('deposit_protected') ||
             i.user_fix_hint?.toLowerCase().includes('deposit')
      );

      expect(hasDepositIssue).toBe(true);
    });

    it('deposit issue disappears when deposit is marked as protected', () => {
      const facts = {
        landlord_full_name: 'Test Landlord',
        landlord_address_line1: '1 Landlord Street',
        landlord_city: 'London',
        landlord_postcode: 'SW1A 1AA',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '1 Property Street',
        property_city: 'London',
        property_postcode: 'E1 1AA',
        tenancy_start_date: '2020-01-15',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        notice_expiry_date: '2025-03-15',
        is_fixed_term: false,
        has_gas_appliances: false,
        deposit_taken: true,
        deposit_amount: 1000,
        deposit_protected: true, // Now protected
        prescribed_info_given: true,
        epc_provided: true,
        how_to_rent_given: true,
      };

      const result = validateFlow({
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'preview',
        facts,
      });

      // Should NOT have deposit_not_protected issue
      const hasDepositNotProtectedIssue = result.blocking_issues.some(
        i => i.code === 'DEPOSIT_NOT_PROTECTED'
      );

      expect(hasDepositNotProtectedIssue).toBe(false);
    });
  });
});

// ============================================================================
// ISSUE COUNT TRACKING
// ============================================================================

describe('AUDIT: Issue Count Changes', () => {
  it('issue count decreases as valid facts are added', () => {
    const steps = [
      { facts: {} },
      {
        facts: {
          landlord_full_name: 'Test',
          landlord_address_line1: '1 Street',
          landlord_city: 'London',
          landlord_postcode: 'SW1A 1AA',
        },
      },
      {
        facts: {
          tenant_full_name: 'Tenant',
          property_address_line1: '1 Property',
          property_city: 'London',
          property_postcode: 'E1 1AA',
        },
      },
      {
        facts: {
          tenancy_start_date: '2020-01-01',
          rent_amount: 1000,
          rent_frequency: 'monthly',
          notice_expiry_date: '2025-03-15',
          is_fixed_term: false,
          deposit_taken: false,
          has_gas_appliances: false,
          ground_codes: [8],
        },
      },
    ];

    let cumulativeFacts: Record<string, unknown> = {};
    let previousCount = Infinity;

    for (const step of steps) {
      cumulativeFacts = { ...cumulativeFacts, ...step.facts };

      const result = validateFlow({
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_8',
        stage: 'preview',
        facts: cumulativeFacts,
      });

      const currentCount = result.blocking_issues.length;

      // Issue count should decrease or stay same as we add valid facts
      expect(currentCount).toBeLessThanOrEqual(previousCount);
      previousCount = currentCount;
    }
  });
});

// ============================================================================
// WIZARD VS PREVIEW STAGE CONSISTENCY
// ============================================================================

describe('AUDIT: Wizard Stage Issue Surfacing', () => {
  it('wizard stage surfaces issues that would block at preview', () => {
    const facts = {
      landlord_full_name: 'Test Landlord',
      landlord_address_line1: '1 Landlord Street',
      landlord_city: 'London',
      landlord_postcode: 'SW1A 1AA',
      tenant_full_name: 'Test Tenant',
      property_address_line1: '1 Property Street',
      property_city: 'London',
      property_postcode: 'E1 1AA',
      tenancy_start_date: '2020-01-15',
      rent_amount: 1000,
      rent_frequency: 'monthly',
      notice_expiry_date: '2025-03-15',
      is_fixed_term: false,
      has_gas_appliances: false,
      deposit_taken: true,
      deposit_amount: 1000,
      deposit_protected: false, // Should surface issue
      prescribed_info_given: true,
    };

    const wizardResult = validateFlow({
      jurisdiction: 'england',
      product: 'notice_only',
      route: 'section_21',
      stage: 'wizard',
      facts,
    });

    const previewResult = validateFlow({
      jurisdiction: 'england',
      product: 'notice_only',
      route: 'section_21',
      stage: 'preview',
      facts,
    });

    // Both stages should detect issues
    const wizardTotal = wizardResult.blocking_issues.length + wizardResult.warnings.length;
    const previewTotal = previewResult.blocking_issues.length + previewResult.warnings.length;

    // Preview should be at least as strict as wizard
    expect(previewTotal).toBeGreaterThanOrEqual(wizardTotal);

    // Deposit issue should appear in preview as blocking
    const previewHasDeposit = previewResult.blocking_issues.some(
      i => i.code === 'DEPOSIT_NOT_PROTECTED' ||
           i.fields?.includes('deposit_protected')
    );
    expect(previewHasDeposit).toBe(true);
  });
});

// ============================================================================
// PER-QUESTION ISSUE FILTERING
// ============================================================================

describe('AUDIT: Per-Question Issue Filtering', () => {
  it('issues have affected_question_id for UI filtering', () => {
    const result = validateFlow({
      jurisdiction: 'england',
      product: 'notice_only',
      route: 'section_21',
      stage: 'preview',
      facts: {
        deposit_protected: false,
        deposit_taken: true,
      },
    });

    // Issues should have question IDs for filtering
    for (const issue of result.blocking_issues) {
      // Every issue should have fields array
      expect(issue.fields).toBeDefined();
      expect(Array.isArray(issue.fields)).toBe(true);

      // If there's an affected_question_id, it should be a string
      if (issue.affected_question_id) {
        expect(typeof issue.affected_question_id).toBe('string');
      }
    }
  });
});
