/**
 * Regression tests for Section 21 retaliatory eviction mapping
 *
 * Ensure the "more than 6 months after repair complaint" wizard toggle
 * maps to the canonical recent_repair_complaints flag used by validation
 * and the decision engine.
 */

import { runDecisionEngine } from '@/lib/decision-engine';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import { validateFlow } from '@/lib/validation/validateFlow';
import type { FlowValidationInput } from '@/lib/validation/validateFlow';

describe('Section 21 Retaliatory Complaint Mapping', () => {
  const baseWizardFacts = {
    selected_notice_route: 'section_21',
    deposit_taken: true,
    deposit_amount: 1200,
    deposit_protected: true,
    deposit_protected_scheme: 'DPS',
    prescribed_info_given: true,
    landlord_full_name: 'John Smith',
    landlord_address_line1: '123 Main St',
    landlord_city: 'London',
    landlord_postcode: 'SW1A 1AA',
    tenant_full_name: 'Jane Doe',
    property_address_line1: '456 Rental Ave',
    property_city: 'London',
    property_postcode: 'SW1A 2BB',
    tenancy_start_date: '2023-01-01',
  };

  it('allows Section 21 when notice is more than 6 months after complaint', () => {
    const caseFacts = wizardFactsToCaseFacts({
      ...baseWizardFacts,
      no_retaliatory_notice: true,
    });

    const result = runDecisionEngine({
      jurisdiction: 'england',
      product: 'notice_only',
      case_type: 'eviction',
      facts: caseFacts,
      stage: 'preview',
    });

    const retaliatoryBlock = result.blocking_issues.find(
      (issue) => issue.issue === 'retaliatory_eviction'
    );
    expect(retaliatoryBlock).toBeUndefined();
  });

  it('blocks Section 21 when notice is within 6 months of complaint', () => {
    const caseFacts = wizardFactsToCaseFacts({
      ...baseWizardFacts,
      no_retaliatory_notice: false,
    });

    const result = runDecisionEngine({
      jurisdiction: 'england',
      product: 'notice_only',
      case_type: 'eviction',
      facts: caseFacts,
      stage: 'preview',
    });

    const retaliatoryBlock = result.blocking_issues.find(
      (issue) => issue.issue === 'retaliatory_eviction'
    );
    expect(retaliatoryBlock).toBeDefined();
    expect(retaliatoryBlock?.severity).toBe('blocking');
  });

  it('surfaces retaliatory eviction in unified validation when within 6 months', () => {
    const input: FlowValidationInput = {
      jurisdiction: 'england',
      product: 'notice_only',
      route: 'section_21',
      stage: 'preview',
      facts: {
        ...baseWizardFacts,
        no_retaliatory_notice: false,
      },
    };

    const result = validateFlow(input);
    const retaliatoryIssue = result.blocking_issues.find(
      (issue) => issue.code === 'RETALIATORY_EVICTION'
    );
    expect(retaliatoryIssue).toBeDefined();
  });
});
