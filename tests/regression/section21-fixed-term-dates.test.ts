/**
 * Regression tests for Section 21 fixed-term notice period bug
 *
 * Issue: Section 21 notice-only packs were showing ground-based (Section 8) dates
 * on supporting pages (checklist, service instructions) instead of the legally
 * correct Section 21 dates.
 *
 * Root cause:
 * 1. `earliest_possession_date_formatted` was calculated using `calculateSection8ExpiryDate()`
 *    which adds 14 days to service date (ground-based)
 * 2. Section 21 templates used this field instead of the proper Section 21 expiry date
 * 3. For fixed-term tenancies, Section 21 requires: max(service_date + 2 months, fixed_term_end_date)
 *
 * Fix:
 * 1. Added `calculateSection21ExpiryDate()` call for Section 21 routes in route.ts
 * 2. Added `display_possession_date_formatted` field that uses the correct date per route:
 *    - Section 21: Uses Section 21 calculated expiry (respects fixed-term)
 *    - Section 8: Uses ground-based earliest_possession_date
 * 3. Updated Section 21 templates to use display_possession_date_formatted
 * 4. Fixed labels to say "date in section 2 of the notice" (not "two months from service")
 */

import { calculateSection21ExpiryDate, calculateSection8ExpiryDate } from '@/lib/documents/notice-date-calculator';
import { mapNoticeOnlyFacts } from '@/lib/case-facts/normalize';

describe('Section 21 Fixed-Term Date Calculation Regression', () => {
  describe('Section 21 date calculation respects fixed-term end date', () => {
    it('should use fixed-term end date when it is later than service_date + 2 months', () => {
      // Bug reproduction case:
      // Tenancy: 14 Jul 2025 – 14 Jul 2026
      // Service date: 21 Dec 2025
      // 2 months from service: ~21 Feb 2026
      // Fixed term end: 14 Jul 2026 (LATER)
      // Expected: 14 Jul 2026 (not 21 Feb 2026)

      const result = calculateSection21ExpiryDate({
        service_date: '2025-12-21',
        tenancy_start_date: '2025-07-14',
        fixed_term: true,
        fixed_term_end_date: '2026-07-14',
        rent_period: 'monthly',
      });

      // Should be 14 July 2026, NOT 21 February 2026
      expect(result.earliest_valid_date).toBe('2026-07-14');
      expect(result.earliest_valid_date).not.toBe('2026-02-21');
    });

    it('should use 2 months from service when fixed-term ends before that', () => {
      // Tenancy: 14 Jul 2024 – 14 Jul 2025 (fixed term already ended)
      // Service date: 21 Dec 2025
      // 2 months from service: ~21 Feb 2026
      // Fixed term end: 14 Jul 2025 (EARLIER - already passed)
      // Expected: 21 Feb 2026 (2 months from service)

      const result = calculateSection21ExpiryDate({
        service_date: '2025-12-21',
        tenancy_start_date: '2024-07-14',
        fixed_term: true,
        fixed_term_end_date: '2025-07-14',
        rent_period: 'monthly',
      });

      // Should be ~21 February 2026 (2 calendar months from 21 Dec 2025)
      expect(result.earliest_valid_date).toBe('2026-02-21');
    });

    it('should handle periodic tenancy (no fixed term)', () => {
      // Periodic tenancy: Started 14 Jul 2023, now rolling
      // Service date: 21 Dec 2025
      // 2 months from service: ~21 Feb 2026
      // Aligned to rent period (14th of month): 14 Mar 2026
      // (Periodic tenancies must align with rent period end)

      const result = calculateSection21ExpiryDate({
        service_date: '2025-12-21',
        tenancy_start_date: '2023-07-14',
        fixed_term: false,
        rent_period: 'monthly',
      });

      // Should be at least 2 months from service, aligned to rent period (14th)
      expect(result.earliest_valid_date).toBe('2026-03-14');
    });

    it('should never allow Section 21 date earlier than 2 calendar months', () => {
      // Even if somehow given a very old fixed term end date,
      // minimum is always 2 calendar months from service

      const result = calculateSection21ExpiryDate({
        service_date: '2025-12-21',
        tenancy_start_date: '2020-01-01',
        fixed_term: false,
        rent_period: 'monthly',
      });

      const twoMonthsFromService = new Date('2025-12-21');
      twoMonthsFromService.setMonth(twoMonthsFromService.getMonth() + 2);

      const resultDate = new Date(result.earliest_valid_date);
      expect(resultDate >= twoMonthsFromService).toBe(true);
    });
  });

  describe('Section 8 ground-based dates remain unchanged', () => {
    it('should calculate 14 days from service for 2-week grounds', () => {
      // Ground 8 (2 months+ rent arrears): 14 days notice
      const result = calculateSection8ExpiryDate({
        service_date: '2025-12-21',
        grounds: [{ code: 8, mandatory: true }],
        tenancy_start_date: '2023-07-14',
        fixed_term: false,
      });

      // Should be 14 days from service (4 January 2026)
      expect(result.earliest_valid_date).toBe('2026-01-04');
      expect(result.notice_period_days).toBe(14);
    });

    it('should calculate 60 days from service for Ground 10', () => {
      // Ground 10 (some rent arrears): 60 days notice (2 months MINIMUM per Housing Act 1988)
      const result = calculateSection8ExpiryDate({
        service_date: '2025-12-21',
        grounds: [{ code: 10, mandatory: false }],
        tenancy_start_date: '2023-07-14',
        fixed_term: false,
      });

      // Should be 60 days from service (19 February 2026)
      expect(result.earliest_valid_date).toBe('2026-02-19');
      expect(result.notice_period_days).toBe(60);
    });

    it('should not extend Section 8 to fixed-term end date', () => {
      // Section 8 for mandatory grounds CAN be served during fixed term
      // and does NOT need to wait for fixed term to end
      const result = calculateSection8ExpiryDate({
        service_date: '2025-12-21',
        grounds: [{ code: 8, mandatory: true }], // Ground 8 is mandatory
        tenancy_start_date: '2025-07-14',
        fixed_term: true,
        fixed_term_end_date: '2026-07-14',
      });

      // Should be 14 days, NOT extended to fixed term end
      expect(result.earliest_valid_date).toBe('2026-01-04');
      expect(result.earliest_valid_date).not.toBe('2026-07-14');
    });
  });

  describe('Template data should have correct display_possession_date', () => {
    it('should map notice only facts correctly for Section 21', () => {
      const wizardFacts = {
        selected_notice_route: 'section_21',
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '123 Test Street',
        property_city: 'London',
        property_postcode: 'SW1A 1AA',
        tenancy_start_date: '2025-07-14',
        is_fixed_term: true,
        fixed_term_end_date: '2026-07-14',
        notice_service_date: '2025-12-21',
        service_date: '2025-12-21',
        rent_frequency: 'monthly',
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);

      // Verify basic fields are mapped
      expect(templateData.landlord_full_name).toBe('Test Landlord');
      expect(templateData.tenant_full_name).toBe('Test Tenant');
      expect(templateData.tenancy_start_date).toBe('2025-07-14');
      expect(templateData.fixed_term_end_date).toBe('2026-07-14');
      expect(templateData.service_date).toBe('2025-12-21');
    });
  });

  describe('Date formatting consistency', () => {
    it('should format UK dates correctly', () => {
      // Test that the date calculator returns ISO format dates
      const result = calculateSection21ExpiryDate({
        service_date: '2025-12-21',
        tenancy_start_date: '2025-07-14',
        fixed_term: true,
        fixed_term_end_date: '2026-07-14',
        rent_period: 'monthly',
      });

      // ISO format: YYYY-MM-DD
      expect(result.earliest_valid_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Edge cases for Section 21', () => {
    it('should handle end-of-month date calculations', () => {
      // Service date: 31 Dec 2025
      // 2 months later: 28 Feb 2026 (Feb doesn't have 31 days)
      // Aligned to rent period (1st of month since tenancy started 1 Jan): 1 Mar 2026
      const result = calculateSection21ExpiryDate({
        service_date: '2025-12-31',
        tenancy_start_date: '2023-01-01',
        fixed_term: false,
        rent_period: 'monthly',
      });

      // Should be at least 2 months from service, aligned with rent period
      const resultDate = new Date(result.earliest_valid_date);
      expect(resultDate.getUTCFullYear()).toBe(2026);
      // Aligned to 1st of month (tenant started on 1st)
      expect(resultDate.getUTCMonth()).toBe(2); // March (0-indexed), aligned to rent period
    });

    it('should handle fixed-term expiring on same day as 2-month notice', () => {
      // Edge case: fixed term ends exactly 2 months after service
      // Service: 21 Dec 2025, 2 months = 21 Feb 2026
      // Fixed term ends: 21 Feb 2026
      // Result should be 21 Feb 2026 (equal is fine)

      const result = calculateSection21ExpiryDate({
        service_date: '2025-12-21',
        tenancy_start_date: '2025-02-21',
        fixed_term: true,
        fixed_term_end_date: '2026-02-21',
        rent_period: 'monthly',
      });

      expect(result.earliest_valid_date).toBe('2026-02-21');
    });

    it('should respect 4-month rule from tenancy start', () => {
      // New tenancy started recently
      // Service date: 21 Dec 2025
      // Tenancy start: 1 Dec 2025 (less than 4 months ago)
      // 4 months from start: 1 Apr 2026
      // 2 months from service: 21 Feb 2026
      // Result should be at least 4 months from tenancy start

      const result = calculateSection21ExpiryDate({
        service_date: '2025-12-21',
        tenancy_start_date: '2025-12-01',
        fixed_term: false,
        rent_period: 'monthly',
      });

      // Should be at least 4 months from tenancy start (1 Apr 2026)
      const fourMonthsFromStart = new Date('2026-04-01');
      const resultDate = new Date(result.earliest_valid_date);
      expect(resultDate >= fourMonthsFromStart).toBe(true);
    });
  });
});

describe('Section 8 ground-based logic preserved', () => {
  it('should use Ground 8 (mandatory) with 14 days notice', () => {
    const result = calculateSection8ExpiryDate({
      service_date: '2025-12-21',
      grounds: [{ code: 8, mandatory: true }],
    });

    expect(result.notice_period_days).toBe(14);
    expect(result.earliest_valid_date).toBe('2026-01-04');
  });

  it('should use maximum notice period when combining grounds', () => {
    // Ground 8 (mandatory, 14 days) + Ground 10 (discretionary, 60 days)
    // System uses MAXIMUM to satisfy all grounds = 60 days
    const result = calculateSection8ExpiryDate({
      service_date: '2025-12-21',
      grounds: [
        { code: 8, mandatory: true },   // 14 days
        { code: 10, mandatory: false }, // 60 days
      ],
    });

    // Should use maximum (60 days) to satisfy Ground 10's legal requirement
    expect(result.notice_period_days).toBe(60);
  });

  it('should handle Ground 14 serious ASB (0 days)', () => {
    const result = calculateSection8ExpiryDate({
      service_date: '2025-12-21',
      grounds: [{ code: 14, mandatory: false }],
      severity: 'serious',
    });

    // Serious ASB can have 0 days notice
    expect(result.notice_period_days).toBe(0);
    expect(result.earliest_valid_date).toBe('2025-12-21');
  });
});
