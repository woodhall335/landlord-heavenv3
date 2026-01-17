/**
 * Regression tests for Section 21 prescribed_info_given validation
 *
 * Issue: Section 21 preview was blocking even when prescribed_info_given=true
 * because the decision engine was checking the wrong location for the field.
 *
 * Root cause:
 * 1. The decision engine checked facts.tenancy?.deposit_protection_date as a proxy (wrong)
 * 2. It also checked (input.facts as any).prescribed_info_given at root level
 * 3. But wizardFactsToCaseFacts didn't copy prescribed_info_given to tenancy
 * 4. So when the field was at root level in wizard facts, it wasn't found after normalization
 *
 * Fix:
 * 1. Added prescribed_info_given normalization in wizardFactsToCaseFacts (normalize.ts)
 * 2. Updated decision engine to check tenancy.prescribed_info_given first (index.ts)
 * 3. Added fallback checks for alternative field names (prescribed_info_provided, prescribed_info_served)
 */

import { validateFlow } from '@/lib/validation/validateFlow';
import type { FlowValidationInput } from '@/lib/validation/validateFlow';
import { runDecisionEngine } from '@/lib/decision-engine';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';

describe('Section 21 Prescribed Info Regression', () => {
  describe('Field normalization', () => {
    it('should normalize prescribed_info_given from root to tenancy', () => {
      const wizardFacts = {
        prescribed_info_given: true,
        deposit_amount: 1200,
        deposit_protected: true,
        tenancy_start_date: '2023-01-01',
      };

      const caseFacts = wizardFactsToCaseFacts(wizardFacts);

      // Should be normalized to tenancy.prescribed_info_given
      expect(caseFacts.tenancy.prescribed_info_given).toBe(true);
    });

    it('should normalize prescribed_info_provided to tenancy.prescribed_info_given', () => {
      const wizardFacts = {
        prescribed_info_provided: true,
        deposit_amount: 1200,
        deposit_protected: true,
        tenancy_start_date: '2023-01-01',
      };

      const caseFacts = wizardFactsToCaseFacts(wizardFacts);

      expect(caseFacts.tenancy.prescribed_info_given).toBe(true);
    });

    it('should normalize prescribed_info_served to tenancy.prescribed_info_given', () => {
      const wizardFacts = {
        prescribed_info_served: true,
        deposit_amount: 1200,
        deposit_protected: true,
        tenancy_start_date: '2023-01-01',
      };

      const caseFacts = wizardFactsToCaseFacts(wizardFacts);

      expect(caseFacts.tenancy.prescribed_info_given).toBe(true);
    });

    it('should prefer case_facts.tenancy.prescribed_info_given over root', () => {
      const wizardFacts = {
        'case_facts.tenancy.prescribed_info_given': true,
        prescribed_info_given: false, // Root should be ignored
        deposit_amount: 1200,
        deposit_protected: true,
        tenancy_start_date: '2023-01-01',
      };

      const caseFacts = wizardFactsToCaseFacts(wizardFacts);

      // Should use the canonical path value
      expect(caseFacts.tenancy.prescribed_info_given).toBe(true);
    });
  });

  describe('Decision engine prescribed info check', () => {
    it('should NOT block Section 21 when prescribed_info_given=true (root level)', () => {
      const caseFacts = wizardFactsToCaseFacts({
        prescribed_info_given: true,
        deposit_amount: 1200,
        deposit_protected: true,
        tenancy_start_date: '2023-01-01',
      });

      const result = runDecisionEngine({
        jurisdiction: 'england',
        product: 'notice_only',
        case_type: 'eviction',
        facts: caseFacts,
        stage: 'preview',
      });

      // Should NOT have prescribed_info_not_given blocking issue
      const prescribedBlock = result.blocking_issues.find(
        issue => issue.issue === 'prescribed_info_not_given'
      );
      expect(prescribedBlock).toBeUndefined();
    });

    it('should NOT block Section 21 when prescribed_info_given=true (normalized to tenancy)', () => {
      const caseFacts = wizardFactsToCaseFacts({
        'case_facts.tenancy.prescribed_info_given': true,
        deposit_amount: 1200,
        deposit_protected: true,
        tenancy_start_date: '2023-01-01',
      });

      const result = runDecisionEngine({
        jurisdiction: 'england',
        product: 'notice_only',
        case_type: 'eviction',
        facts: caseFacts,
        stage: 'preview',
      });

      const prescribedBlock = result.blocking_issues.find(
        issue => issue.issue === 'prescribed_info_not_given'
      );
      expect(prescribedBlock).toBeUndefined();
    });

    it('should BLOCK Section 21 when prescribed_info_given=false', () => {
      const caseFacts = wizardFactsToCaseFacts({
        prescribed_info_given: false,
        deposit_amount: 1200,
        deposit_protected: true,
        tenancy_start_date: '2023-01-01',
      });

      const result = runDecisionEngine({
        jurisdiction: 'england',
        product: 'notice_only',
        case_type: 'eviction',
        facts: caseFacts,
        stage: 'preview',
      });

      const prescribedBlock = result.blocking_issues.find(
        issue => issue.issue === 'prescribed_info_not_given'
      );
      expect(prescribedBlock).toBeDefined();
      expect(prescribedBlock?.severity).toBe('blocking');
    });

    it('should warn (not block) when prescribed_info_given is undefined', () => {
      const caseFacts = wizardFactsToCaseFacts({
        deposit_amount: 1200,
        deposit_protected: true,
        tenancy_start_date: '2023-01-01',
        // prescribed_info_given is intentionally missing
      });

      const result = runDecisionEngine({
        jurisdiction: 'england',
        product: 'notice_only',
        case_type: 'eviction',
        facts: caseFacts,
        stage: 'preview',
      });

      // Should NOT have prescribed_info_not_given as BLOCKING issue
      const prescribedBlock = result.blocking_issues.find(
        issue => issue.issue === 'prescribed_info_not_given'
      );
      expect(prescribedBlock).toBeUndefined();

      // Should have warning about prescribed info status
      expect(result.warnings).toContain('Prescribed information status not confirmed');
    });
  });

  describe('Full validation flow', () => {
    it('should NOT block Section 21 preview when prescribed_info_given=true', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'preview',
        facts: {
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
          rent_amount: 1200,
          rent_frequency: 'monthly',
          epc_provided: true,
          how_to_rent_provided: true,
          gas_certificate_provided: true,
          notice_service: {
            notice_date: '2024-06-01',
            notice_expiry_date: '2024-08-01',
          },
        },
      };

      const result = validateFlow(input);

      // Should NOT have PRESCRIBED_INFO_NOT_GIVEN blocking
      const prescribedBlocking = result.blocking_issues.find(
        issue => issue.code === 'PRESCRIBED_INFO_NOT_GIVEN'
      );
      expect(prescribedBlocking).toBeUndefined();
    });

    it('should BLOCK Section 21 preview when prescribed_info_given=false', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'preview',
        facts: {
          selected_notice_route: 'section_21',
          deposit_taken: true,
          deposit_amount: 1200,
          deposit_protected: true,
          deposit_protected_scheme: 'DPS',
          prescribed_info_given: false, // Explicitly false
          landlord_full_name: 'John Smith',
          landlord_address_line1: '123 Main St',
          landlord_city: 'London',
          landlord_postcode: 'SW1A 1AA',
          tenant_full_name: 'Jane Doe',
          property_address_line1: '456 Rental Ave',
          property_city: 'London',
          property_postcode: 'SW1A 2BB',
          tenancy_start_date: '2023-01-01',
          rent_amount: 1200,
          rent_frequency: 'monthly',
          epc_provided: true,
          how_to_rent_provided: true,
          gas_certificate_provided: true,
          notice_service: {
            notice_date: '2024-06-01',
            notice_expiry_date: '2024-08-01',
          },
        },
      };

      const result = validateFlow(input);

      // Should have PRESCRIBED_INFO_NOT_GIVEN blocking
      const prescribedBlocking = result.blocking_issues.find(
        issue => issue.code === 'PRESCRIBED_INFO_NOT_GIVEN'
      );
      expect(prescribedBlocking).toBeDefined();
    });

    it('should handle alternative field name prescribed_info_provided', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'preview',
        facts: {
          selected_notice_route: 'section_21',
          deposit_taken: true,
          deposit_amount: 1200,
          deposit_protected: true,
          deposit_protected_scheme: 'DPS',
          prescribed_info_provided: true, // Alternative field name
          landlord_full_name: 'John Smith',
          landlord_address_line1: '123 Main St',
          landlord_city: 'London',
          landlord_postcode: 'SW1A 1AA',
          tenant_full_name: 'Jane Doe',
          property_address_line1: '456 Rental Ave',
          property_city: 'London',
          property_postcode: 'SW1A 2BB',
          tenancy_start_date: '2023-01-01',
          rent_amount: 1200,
          rent_frequency: 'monthly',
          epc_provided: true,
          how_to_rent_provided: true,
          gas_certificate_provided: true,
          notice_service: {
            notice_date: '2024-06-01',
            notice_expiry_date: '2024-08-01',
          },
        },
      };

      const result = validateFlow(input);

      const prescribedBlocking = result.blocking_issues.find(
        issue => issue.code === 'PRESCRIBED_INFO_NOT_GIVEN'
      );
      expect(prescribedBlocking).toBeUndefined();
    });

    it('repro case: collected_facts.prescribed_info_given: true with selected_notice_route=section_21', () => {
      // This is the exact repro case from the bug report
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'preview',
        facts: {
          // Simulating collected_facts structure
          prescribed_info_given: true,
          selected_notice_route: 'section_21',
          deposit_taken: true,
          deposit_amount: 1200,
          deposit_protected: true,
          deposit_protected_scheme: 'TDS',
          landlord_full_name: 'Test Landlord',
          landlord_address_line1: '1 Landlord Street',
          landlord_city: 'London',
          landlord_postcode: 'W1 1AA',
          tenant_full_name: 'Test Tenant',
          property_address_line1: '1 Rental Property',
          property_city: 'London',
          property_postcode: 'E1 1AA',
          tenancy_start_date: '2023-06-01',
          rent_amount: 1500,
          rent_frequency: 'monthly',
          epc_provided: true,
          how_to_rent_provided: true,
          gas_certificate_provided: true,
          notice_service: {
            notice_date: '2024-12-01',
            notice_expiry_date: '2025-02-01',
          },
        },
      };

      const result = validateFlow(input);

      // Should NOT have PRESCRIBED_INFO_NOT_GIVEN blocking
      const prescribedBlocking = result.blocking_issues.find(
        issue => issue.code === 'PRESCRIBED_INFO_NOT_GIVEN'
      );
      expect(prescribedBlocking).toBeUndefined();

      // Should NOT have any blocking issues related to prescribed info
      const anyPrescribedBlocking = result.blocking_issues.filter(
        issue => issue.code.toLowerCase().includes('prescribed')
      );
      expect(anyPrescribedBlocking).toHaveLength(0);
    });
  });
});
