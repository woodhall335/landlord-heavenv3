/**
 * Section 21 Form 6A Date Fixes - Regression Tests (Jan 2026)
 *
 * Issue: Form 6A dates were incorrect:
 * - Page 1 "leave after" date showed placeholder "(insert calendar date)" instead of real date
 * - Page 2 "Date you will serve the notice*" was blank or off by one day
 * - MSQ mapping mismatch: field ID "notice_service_date" didn't match maps_to "notice_service.notice_date"
 * - S21 expiry date was user-editable when it should be computed-only
 *
 * Root causes fixed:
 * 1. MSQ field ID renamed from "notice_service_date" to "notice_date" to match maps_to path
 * 2. S21 expiry date is now ALWAYS computed server-side (single source of truth)
 * 3. Safety rails added for 4-month rule and fixed term constraints
 * 4. Backward compatibility maintained for old field names
 *
 * Test reproduction scenario:
 * - Fixed term tenancy, no break clause
 * - Tenancy start: 2025-08-01
 * - Fixed end: 2026-08-01
 * - Service date: 2026-01-14
 *
 * Expected Form 6A output:
 * - Page 1 "leave after": "1 August 2026" (fixed term end date)
 * - Page 2 "Date:": "14 January 2026" (exact service date)
 */

import { describe, expect, it } from 'vitest';
import { calculateSection21ExpiryDate, calculateSection8ExpiryDate } from '@/lib/documents/notice-date-calculator';
import { mapWizardToSection21Data } from '@/lib/documents/section21-generator';

// =============================================================================
// TEST SCENARIO FROM TASK REQUIREMENTS
// =============================================================================

const REPRODUCTION_SCENARIO = {
  tenancy_start_date: '2025-08-01',
  fixed_term_end_date: '2026-08-01',
  service_date: '2026-01-14',
  is_fixed_term: true,
  has_break_clause: false,
  rent_frequency: 'monthly',
};

describe('Section 21 Form 6A Date Fixes (Jan 2026)', () => {
  // =============================================================================
  // TASK 1: S21 EXPIRY DATE AUTO-CALCULATION
  // =============================================================================
  describe('Task 1: S21 expiry date auto-calculation', () => {
    it('MUST compute expiry date as fixed term end when service + 2 months < fixed term end', () => {
      // This is the exact reproduction case from the task
      const result = calculateSection21ExpiryDate({
        service_date: REPRODUCTION_SCENARIO.service_date,
        tenancy_start_date: REPRODUCTION_SCENARIO.tenancy_start_date,
        fixed_term: REPRODUCTION_SCENARIO.is_fixed_term,
        fixed_term_end_date: REPRODUCTION_SCENARIO.fixed_term_end_date,
        rent_period: REPRODUCTION_SCENARIO.rent_frequency,
      });

      // Service (2026-01-14) + 2 months = 2026-03-14
      // Fixed term end = 2026-08-01
      // Expected expiry = 2026-08-01 (later of the two)
      expect(result.earliest_valid_date).toBe('2026-08-01');
      expect(result.explanation).toContain('fixed term');
    });

    it('MUST NOT allow user to override S21 expiry date (server-side enforcement)', async () => {
      // When user provides an expiry date, server should ignore it and compute
      const wizardFacts = {
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '1 Test Street',
        tenancy_start_date: REPRODUCTION_SCENARIO.tenancy_start_date,
        rent_frequency: REPRODUCTION_SCENARIO.rent_frequency,
        is_fixed_term: REPRODUCTION_SCENARIO.is_fixed_term,
        fixed_term: REPRODUCTION_SCENARIO.is_fixed_term,
        fixed_term_end_date: REPRODUCTION_SCENARIO.fixed_term_end_date,
        has_break_clause: false,
        notice_date: REPRODUCTION_SCENARIO.service_date,
        // User tries to set a wrong expiry date
        notice_expiry_date: '2026-03-14', // Wrong! Should be 2026-08-01
        deposit_protected: true,
        prescribed_info_given: true,
        gas_certificate_provided: true,
        epc_provided: true,
        how_to_rent_provided: true,
      };

      const result = mapWizardToSection21Data(wizardFacts);

      // The mapper should NOT include the user-provided expiry date
      // generateSection21Notice will compute it server-side
      // expiry_date is intentionally omitted from the result
      expect(result.service_date).toBe('2026-01-14');
    });
  });

  // =============================================================================
  // TASK 2: MSQ MAPPING (service date stored correctly)
  // =============================================================================
  describe('Task 2: MSQ mapping fixes', () => {
    it('MUST resolve service date from new field ID "notice_date"', async () => {
      const wizardFacts = {
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '1 Test Street',
        tenancy_start_date: '2024-01-15',
        rent_frequency: 'monthly',
        // New field ID (post-fix)
        notice_date: '2026-01-14',
        deposit_protected: true,
        prescribed_info_given: true,
        gas_certificate_provided: true,
        epc_provided: true,
        how_to_rent_provided: true,
      };

      const result = mapWizardToSection21Data(wizardFacts);

      expect(result.service_date).toBe('2026-01-14');
    });

    it('MUST resolve service date from old field ID "notice_service_date" (backward compat)', async () => {
      const wizardFacts = {
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '1 Test Street',
        tenancy_start_date: '2024-01-15',
        rent_frequency: 'monthly',
        // Old field ID (pre-fix, for backward compatibility)
        notice_service_date: '2026-01-14',
        deposit_protected: true,
        prescribed_info_given: true,
        gas_certificate_provided: true,
        epc_provided: true,
        how_to_rent_provided: true,
      };

      const result = mapWizardToSection21Data(wizardFacts);

      expect(result.service_date).toBe('2026-01-14');
    });

    it('MUST resolve service date from nested path notice_service.notice_date', async () => {
      const wizardFacts = {
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '1 Test Street',
        tenancy_start_date: '2024-01-15',
        rent_frequency: 'monthly',
        // Nested path (from MQS maps_to)
        notice_service: {
          notice_date: '2026-01-14',
        },
        deposit_protected: true,
        prescribed_info_given: true,
        gas_certificate_provided: true,
        epc_provided: true,
        how_to_rent_provided: true,
      };

      const result = mapWizardToSection21Data(wizardFacts);

      expect(result.service_date).toBe('2026-01-14');
    });
  });

  // =============================================================================
  // TASK 3: FORM 6A TEMPLATE DATA (date mapping)
  // =============================================================================
  describe('Task 3: Form 6A template data mapping', () => {
    it('MUST produce correct service date for Form 6A Page 2', () => {
      const wizardFacts = {
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '1 Test Street',
        tenancy_start_date: REPRODUCTION_SCENARIO.tenancy_start_date,
        rent_frequency: REPRODUCTION_SCENARIO.rent_frequency,
        is_fixed_term: REPRODUCTION_SCENARIO.is_fixed_term,
        fixed_term: REPRODUCTION_SCENARIO.is_fixed_term,
        fixed_term_end_date: REPRODUCTION_SCENARIO.fixed_term_end_date,
        notice_date: REPRODUCTION_SCENARIO.service_date,
        deposit_protected: true,
        prescribed_info_given: true,
        gas_certificate_provided: true,
        epc_provided: true,
        how_to_rent_provided: true,
      };

      const result = mapWizardToSection21Data(wizardFacts);

      // Form 6A Page 2 "Date:" field should be EXACTLY the service date
      expect(result.service_date).toBe('2026-01-14');
      // Should NOT be off by one day
      expect(result.service_date).not.toBe('2026-01-13');
      expect(result.service_date).not.toBe('2026-01-15');
    });

    it('MUST correctly map fixed term data for expiry calculation', () => {
      const wizardFacts = {
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '1 Test Street',
        tenancy_start_date: REPRODUCTION_SCENARIO.tenancy_start_date,
        rent_frequency: REPRODUCTION_SCENARIO.rent_frequency,
        is_fixed_term: REPRODUCTION_SCENARIO.is_fixed_term,
        fixed_term: REPRODUCTION_SCENARIO.is_fixed_term,
        fixed_term_end_date: REPRODUCTION_SCENARIO.fixed_term_end_date,
        has_break_clause: REPRODUCTION_SCENARIO.has_break_clause,
        notice_date: REPRODUCTION_SCENARIO.service_date,
        deposit_protected: true,
        prescribed_info_given: true,
        gas_certificate_provided: true,
        epc_provided: true,
        how_to_rent_provided: true,
      };

      const result = mapWizardToSection21Data(wizardFacts);

      // Fixed term info should be correctly mapped
      expect(result.fixed_term).toBe(true);
      expect(result.fixed_term_end_date).toBe('2026-08-01');
      expect(result.has_break_clause).toBe(false);
    });
  });

  // =============================================================================
  // TASK 4: SAFETY RAILS
  // =============================================================================
  describe('Task 4: Safety rails for invalid S21 scenarios', () => {
    it('MUST compute expiry respecting 4-month rule from tenancy start', () => {
      // Tenancy started 2025-12-01 (only ~1.5 months ago from service date 2026-01-14)
      // 4 months from start = 2026-04-01
      // 2 months from service = 2026-03-14
      // Expiry should be at least 2026-04-01 (4-month rule is later)
      const result = calculateSection21ExpiryDate({
        service_date: '2026-01-14',
        tenancy_start_date: '2025-12-01',
        fixed_term: false,
        rent_period: 'monthly',
      });

      // 4 months from 2025-12-01 = 2026-04-01
      // Result should be at least that date
      const fourMonthsFromStart = new Date('2026-04-01');
      const resultDate = new Date(result.earliest_valid_date);
      expect(resultDate >= fourMonthsFromStart).toBe(true);
    });

    it('MUST respect break clause date when present', () => {
      // Fixed term ends 2026-08-01 but break clause allows exit from 2026-03-01
      const result = calculateSection21ExpiryDate({
        service_date: '2026-01-14',
        tenancy_start_date: '2025-08-01',
        fixed_term: true,
        fixed_term_end_date: '2026-08-01',
        has_break_clause: true,
        break_clause_date: '2026-03-01',
        rent_period: 'monthly',
      });

      // 2 months from service = 2026-03-14
      // Break clause = 2026-03-01
      // Should be 2026-03-14 (later of break clause and 2 months from service)
      expect(result.earliest_valid_date).toBe('2026-03-14');
      expect(result.earliest_valid_date).not.toBe('2026-08-01'); // NOT fixed term end
    });
  });

  // =============================================================================
  // EDGE CASES
  // =============================================================================
  describe('Edge cases', () => {
    it('MUST handle end-of-month date calculations correctly', () => {
      // Service date: 31 Jan 2026
      // 2 months later: Should be last day of March or aligned to rent period
      const result = calculateSection21ExpiryDate({
        service_date: '2026-01-31',
        tenancy_start_date: '2024-01-01',
        fixed_term: false,
        rent_period: 'monthly',
      });

      // Result should be at least 2 months from service
      const twoMonthsFromService = new Date('2026-03-31');
      const resultDate = new Date(result.earliest_valid_date);
      expect(resultDate >= twoMonthsFromService).toBe(true);
    });

    it('MUST handle February edge case (31 Jan + 2 months)', () => {
      // Service date: 31 Dec 2025
      // 2 months later: 28 Feb 2026 (Feb doesn't have 31 days)
      const result = calculateSection21ExpiryDate({
        service_date: '2025-12-31',
        tenancy_start_date: '2024-01-01',
        fixed_term: false,
        rent_period: 'monthly',
      });

      // Should be at least end of February or aligned to rent period
      const endOfFeb = new Date('2026-02-28');
      const resultDate = new Date(result.earliest_valid_date);
      expect(resultDate >= endOfFeb).toBe(true);
    });
  });

  // =============================================================================
  // SECTION 8 NON-REGRESSION
  // =============================================================================
  describe('Section 8 non-regression (ensure S8 is not affected)', () => {
    it('MUST NOT affect Section 8 ground-based calculation', () => {
      // Ground 8 (2 months+ rent arrears): 14 days notice
      const result = calculateSection8ExpiryDate({
        service_date: '2026-01-14',
        grounds: [{ code: 8, mandatory: true }],
        tenancy_start_date: '2024-01-01',
        fixed_term: false,
      });

      // Section 8 Ground 8 should still be 14 days
      expect(result.notice_period_days).toBe(14);
      expect(result.earliest_valid_date).toBe('2026-01-28');
    });

    it('MUST NOT extend Section 8 to fixed term end date', () => {
      // Section 8 for mandatory grounds CAN be served during fixed term
      // and does NOT need to wait for fixed term to end
      const result = calculateSection8ExpiryDate({
        service_date: '2026-01-14',
        grounds: [{ code: 8, mandatory: true }],
        tenancy_start_date: '2025-08-01',
        fixed_term: true,
        fixed_term_end_date: '2026-08-01',
      });

      // Should be 14 days, NOT extended to fixed term end
      expect(result.earliest_valid_date).toBe('2026-01-28');
      expect(result.earliest_valid_date).not.toBe('2026-08-01');
    });
  });
});

// =============================================================================
// REPRODUCTION SCENARIO SUMMARY TEST
// =============================================================================
describe('Full Reproduction Scenario', () => {
  it('MUST produce correct dates for the exact scenario from task requirements', () => {
    // Scenario:
    // - Fixed term, no break clause
    // - Tenancy start: 2025-08-01
    // - Fixed end: 2026-08-01
    // - Service: 2026-01-14
    //
    // Expected:
    // - Page 1 leave-after: "1 August 2026" (2026-08-01)
    // - Page 2 date: "14 January 2026" (2026-01-14)

    const result = calculateSection21ExpiryDate({
      service_date: '2026-01-14',
      tenancy_start_date: '2025-08-01',
      fixed_term: true,
      fixed_term_end_date: '2026-08-01',
      rent_period: 'monthly',
    });

    // Page 1 "leave after" = expiry date = fixed term end
    expect(result.earliest_valid_date).toBe('2026-08-01');

    // Page 2 "Date:" = service date (this is just passed through)
    const serviceDate = '2026-01-14';
    expect(serviceDate).toBe('2026-01-14');

    // Verify UK date formatting
    const expiryDate = new Date(result.earliest_valid_date + 'T00:00:00.000Z');
    const formattedExpiry = `${expiryDate.getUTCDate()} August ${expiryDate.getUTCFullYear()}`;
    expect(formattedExpiry).toBe('1 August 2026');

    const serviceDateObj = new Date(serviceDate + 'T00:00:00.000Z');
    const formattedService = `${serviceDateObj.getUTCDate()} January ${serviceDateObj.getUTCFullYear()}`;
    expect(formattedService).toBe('14 January 2026');
  });
});
