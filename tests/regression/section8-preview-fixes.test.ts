/**
 * Regression tests for Section 8 preview fixes
 *
 * Tests the following fixes:
 * 1. Ground codes canonicalization (section8_grounds → ground_codes)
 * 2. Route-aware decision engine (Section 8 should not block on deposit issues)
 * 3. UNKNOWN_FACT_KEY not in user-facing warnings
 */

import { validateFlow } from '@/lib/validation/validateFlow';
import type { FlowValidationInput } from '@/lib/validation/validateFlow';

describe('Section 8 Preview Fixes', () => {
  describe('Ground codes canonicalization', () => {
    it('should normalize section8_grounds to ground_codes', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_8',
        stage: 'preview',
        facts: {
          selected_notice_route: 'section_8',
          section8_grounds: ['ground_8', 'ground_11'],
          deposit_taken: true,
          deposit_protected: false,
          prescribed_info_given: false,
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
          notice_expiry_date: '2024-06-01',
        },
      };

      const result = validateFlow(input);

      // Should NOT have REQUIRED_FACT_MISSING for ground_codes
      const groundCodesMissing = result.blocking_issues.find(
        issue => issue.code === 'REQUIRED_FACT_MISSING' && issue.fields.includes('ground_codes')
      );
      expect(groundCodesMissing).toBeUndefined();
    });

    it('should normalize various ground key variants', () => {
      const variants = [
        'section8_grounds',
        'section_8_grounds',
        'selected_grounds',
        'grounds',
        'eviction_grounds',
        'section8_grounds_selection',
      ];

      for (const variant of variants) {
        const input: FlowValidationInput = {
          jurisdiction: 'england',
          product: 'notice_only',
          route: 'section_8',
          stage: 'preview',
          facts: {
            selected_notice_route: 'section_8',
            [variant]: ['ground_8', 'ground_11'],
            deposit_taken: true,
            deposit_protected: false,
            prescribed_info_given: false,
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
            notice_expiry_date: '2024-06-01',
          },
        };

        const result = validateFlow(input);

        // Should NOT have REQUIRED_FACT_MISSING for ground_codes
        const groundCodesMissing = result.blocking_issues.find(
          issue => issue.code === 'REQUIRED_FACT_MISSING' && issue.fields.includes('ground_codes')
        );
        expect(groundCodesMissing).toBeUndefined();
      }
    });

    it('should not overwrite existing ground_codes', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_8',
        stage: 'preview',
        facts: {
          selected_notice_route: 'section_8',
          ground_codes: ['ground_10'],
          section8_grounds: ['ground_8', 'ground_11'],
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
          notice_expiry_date: '2024-06-01',
        },
      };

      const result = validateFlow(input);

      // Should not have missing ground_codes error
      const groundCodesMissing = result.blocking_issues.find(
        issue => issue.code === 'REQUIRED_FACT_MISSING' && issue.fields.includes('ground_codes')
      );
      expect(groundCodesMissing).toBeUndefined();
    });
  });

  describe('Route-aware decision engine', () => {
    it('should NOT block Section 8 on deposit protection issues', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_8',
        stage: 'preview',
        facts: {
          selected_notice_route: 'section_8',
          section8_grounds: ['ground_8', 'ground_11'],
          deposit_taken: true,
          deposit_protected: false,
          prescribed_info_given: false,
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
          notice_expiry_date: '2024-06-01',
        },
      };

      const result = validateFlow(input);

      // Should NOT have DEPOSIT_NOT_PROTECTED as blocking issue
      const depositBlocking = result.blocking_issues.find(
        issue => issue.code === 'DEPOSIT_NOT_PROTECTED'
      );
      expect(depositBlocking).toBeUndefined();

      // Should NOT have PRESCRIBED_INFO_NOT_GIVEN as blocking issue
      const prescribedBlocking = result.blocking_issues.find(
        issue => issue.code === 'PRESCRIBED_INFO_NOT_GIVEN'
      );
      expect(prescribedBlocking).toBeUndefined();
    });

    it('should STILL block Section 21 on deposit protection issues', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'preview',
        facts: {
          selected_notice_route: 'section_21',
          deposit_taken: true,
          deposit_amount: 1000,
          deposit_protected: false,
          prescribed_info_given: false,
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
          notice_expiry_date: '2024-06-01',
        },
      };

      const result = validateFlow(input);

      // Should have DEPOSIT_NOT_PROTECTED as blocking issue
      const depositBlocking = result.blocking_issues.find(
        issue => issue.code === 'DEPOSIT_NOT_PROTECTED'
      );
      expect(depositBlocking).toBeDefined();

      // Should have PRESCRIBED_INFO_NOT_GIVEN as blocking issue
      const prescribedBlocking = result.blocking_issues.find(
        issue => issue.code === 'PRESCRIBED_INFO_NOT_GIVEN'
      );
      expect(prescribedBlocking).toBeDefined();
    });
  });

  describe('UNKNOWN_FACT_KEY filtering', () => {
    it('should NOT include UNKNOWN_FACT_KEY in user-facing warnings', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_8',
        stage: 'preview',
        facts: {
          selected_notice_route: 'section_8',
          section8_grounds: ['ground_8', 'ground_11'],
          deposit_taken: true,
          deposit_protected: false,
          prescribed_info_given: false,
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
          notice_expiry_date: '2024-06-01',
          // UI/meta/computed keys that trigger UNKNOWN_FACT_KEY
          __meta: { some: 'metadata' },
          jurisdiction: 'england',
          'property.country': 'England',
          property_country: 'England',
          calculated_expiry_date: '2024-06-01',
          date_calculation_explanation: 'Some explanation',
          section21_intro: 'Some intro text',
          how_to_rent_info: 'Some info',
        },
      };

      const result = validateFlow(input);

      // Should NOT have UNKNOWN_FACT_KEY in warnings
      const unknownFactWarnings = result.warnings.filter(
        warning => warning.code === 'UNKNOWN_FACT_KEY'
      );
      expect(unknownFactWarnings).toHaveLength(0);
    });
  });

  describe('End-to-end Section 8 preview', () => {
    it('should pass validation for complete Section 8 facts with section8_grounds', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_8',
        stage: 'preview',
        facts: {
          selected_notice_route: 'section_8',
          section8_grounds: ['ground_8', 'ground_11'],
          deposit_taken: true,
          deposit_protected: false,
          prescribed_info_given: false,
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
          notice_expiry_date: '2024-06-01',
          __meta: { some: 'metadata' },
          jurisdiction: 'england',
          'property.country': 'England',
          property_country: 'England',
          calculated_expiry_date: '2024-06-01',
        },
      };

      const result = validateFlow(input);

      // Should pass validation (ok: true or no blocking issues)
      expect(result.blocking_issues.length).toBe(0);
      expect(result.ok).toBe(true);
    });
  });
});
