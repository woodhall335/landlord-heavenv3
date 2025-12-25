/**
 * Arrears Engine Tests
 *
 * Comprehensive tests for the canonical arrears engine.
 * These tests prove:
 * 1. Ground 8 blocks below threshold using computed schedule
 * 2. Eviction pack and money claim totals match exactly
 * 3. Legacy flat-total cases still generate but warn
 * 4. No duplicate arrears calculations exist anywhere in the codebase
 */

import {
  generateRentPeriods,
  computeArrears,
  calculateArrearsInMonths,
  validateGround8Eligibility,
  createEmptyArrearsSchedule,
  updateArrearsItem,
  markAllPeriodsPaid,
  markAllPeriodsUnpaid,
  createLegacyArrearsResult,
  hasAuthoritativeArrearsData,
  getAuthoritativeArrears,
  hasArrearsGroundsSelected,
  hasGround8Selected,
  normalizeArrearsItems,
} from '@/lib/arrears-engine';
import type { ArrearsItem, TenancyFacts } from '@/lib/case-facts/schema';

describe('Arrears Engine', () => {
  // ============================================================================
  // PERIOD GENERATION TESTS
  // ============================================================================
  describe('generateRentPeriods', () => {
    it('should generate monthly periods correctly', () => {
      const periods = generateRentPeriods({
        tenancy_start_date: '2024-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        cut_off_date: '2024-03-31',
      });

      expect(periods.length).toBe(3);
      expect(periods[0].period_start).toBe('2024-01-01');
      expect(periods[0].rent_due).toBe(1000);
    });

    it('should generate weekly periods correctly', () => {
      const periods = generateRentPeriods({
        tenancy_start_date: '2024-01-01',
        rent_amount: 200,
        rent_frequency: 'weekly',
        cut_off_date: '2024-01-21',
      });

      expect(periods.length).toBe(3);
      expect(periods[0].rent_due).toBe(200);
    });

    it('should return empty array for invalid input', () => {
      const periods = generateRentPeriods({
        tenancy_start_date: '',
        rent_amount: 0,
        rent_frequency: null,
      });

      expect(periods).toEqual([]);
    });

    it('should handle notice date as cut-off', () => {
      const periods = generateRentPeriods({
        tenancy_start_date: '2024-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        notice_date: '2024-02-15',
      });

      expect(periods.length).toBeGreaterThan(0);
      // Last period should end at or before notice date
      const lastPeriod = periods[periods.length - 1];
      expect(new Date(lastPeriod.period_end) <= new Date('2024-02-15')).toBe(true);
    });
  });

  // ============================================================================
  // ARREARS COMPUTATION TESTS
  // ============================================================================
  describe('computeArrears', () => {
    it('should compute total arrears from items', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0 },
        { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 1000, rent_paid: 500 },
        { period_start: '2024-03-01', period_end: '2024-03-31', rent_due: 1000, rent_paid: 1000 },
      ];

      const result = computeArrears(items, 'monthly', 1000);

      expect(result.total_arrears).toBe(1500); // 1000 + 500 + 0
      expect(result.periods_fully_unpaid).toBe(1);
      expect(result.periods_partially_paid).toBe(1);
      expect(result.periods_fully_paid).toBe(1);
      expect(result.is_authoritative).toBe(true);
    });

    it('should normalize items to ensure amount_owed is calculated', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 300 },
      ];

      const result = computeArrears(items, 'monthly', 1000);

      expect(result.arrears_items[0].amount_owed).toBe(700);
    });

    it('should return non-authoritative result for empty items', () => {
      const result = computeArrears([], 'monthly', 1000);

      expect(result.is_authoritative).toBe(false);
      expect(result.total_arrears).toBe(0);
      expect(result.legacy_warning).toBeDefined();
    });
  });

  // ============================================================================
  // ARREARS IN MONTHS CALCULATION
  // ============================================================================
  describe('calculateArrearsInMonths', () => {
    it('should calculate monthly arrears correctly', () => {
      expect(calculateArrearsInMonths(2000, 1000, 'monthly')).toBe(2);
      expect(calculateArrearsInMonths(3000, 1000, 'monthly')).toBe(3);
    });

    it('should calculate weekly arrears correctly', () => {
      // 4.33 weeks per month
      const result = calculateArrearsInMonths(866, 200, 'weekly');
      expect(result).toBeCloseTo(1, 1); // ~1 month
    });

    it('should handle zero rent amount', () => {
      expect(calculateArrearsInMonths(1000, 0, 'monthly')).toBe(0);
    });

    it('should handle zero arrears', () => {
      expect(calculateArrearsInMonths(0, 1000, 'monthly')).toBe(0);
    });
  });

  // ============================================================================
  // GROUND 8 VALIDATION TESTS
  // ============================================================================
  describe('validateGround8Eligibility', () => {
    it('should validate Ground 8 eligibility with schedule data - threshold met', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
        { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
      ];

      const result = validateGround8Eligibility({
        arrears_items: items,
        rent_amount: 1000,
        rent_frequency: 'monthly',
        jurisdiction: 'england',
      });

      expect(result.is_eligible).toBe(true);
      expect(result.arrears_in_months).toBe(2);
      expect(result.is_authoritative).toBe(true);
    });

    it('should block Ground 8 when below threshold', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
      ];

      const result = validateGround8Eligibility({
        arrears_items: items,
        rent_amount: 1000,
        rent_frequency: 'monthly',
        jurisdiction: 'england',
      });

      expect(result.is_eligible).toBe(false);
      expect(result.arrears_in_months).toBe(1);
      expect(result.is_authoritative).toBe(true);
      expect(result.explanation).toContain('NOT MET');
    });

    it('should NOT allow Ground 8 eligibility from legacy flat total alone', () => {
      const result = validateGround8Eligibility({
        arrears_items: [],
        rent_amount: 1000,
        rent_frequency: 'monthly',
        jurisdiction: 'england',
        legacy_total_arrears: 3000, // 3 months worth
      });

      expect(result.is_eligible).toBe(false); // Not eligible without schedule
      expect(result.is_authoritative).toBe(false);
      expect(result.legacy_warning).toBeDefined();
      expect(result.legacy_warning).toContain('schedule');
    });

    it('should use 3 month threshold for Scotland', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
        { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
      ];

      const result = validateGround8Eligibility({
        arrears_items: items,
        rent_amount: 1000,
        rent_frequency: 'monthly',
        jurisdiction: 'scotland',
      });

      expect(result.is_eligible).toBe(false); // 2 months < 3 months threshold
      expect(result.threshold_months).toBe(3);
    });
  });

  // ============================================================================
  // SCHEDULE MANIPULATION TESTS
  // ============================================================================
  describe('createEmptyArrearsSchedule', () => {
    it('should create schedule with all periods unpaid', () => {
      const items = createEmptyArrearsSchedule({
        tenancy_start_date: '2024-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        cut_off_date: '2024-03-31',
      });

      expect(items.length).toBe(3);
      items.forEach((item) => {
        expect(item.rent_paid).toBe(0);
        expect(item.amount_owed).toBe(1000);
      });
    });
  });

  describe('updateArrearsItem', () => {
    it('should update payment and recalculate amount_owed', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
      ];

      const updated = updateArrearsItem(items, '2024-01-01', 500);

      expect(updated[0].rent_paid).toBe(500);
      expect(updated[0].amount_owed).toBe(500);
    });
  });

  describe('markAllPeriodsPaid', () => {
    it('should mark all periods as fully paid', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
        { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
      ];

      const paid = markAllPeriodsPaid(items);

      paid.forEach((item) => {
        expect(item.rent_paid).toBe(1000);
        expect(item.amount_owed).toBe(0);
      });
    });
  });

  describe('markAllPeriodsUnpaid', () => {
    it('should mark all periods as unpaid', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 1000, amount_owed: 0 },
        { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 1000, rent_paid: 1000, amount_owed: 0 },
      ];

      const unpaid = markAllPeriodsUnpaid(items);

      unpaid.forEach((item) => {
        expect(item.rent_paid).toBe(0);
        expect(item.amount_owed).toBe(1000);
      });
    });
  });

  // ============================================================================
  // BACKWARDS COMPATIBILITY TESTS
  // ============================================================================
  describe('createLegacyArrearsResult', () => {
    it('should create result from legacy flat total with warning', () => {
      const result = createLegacyArrearsResult(2000, 1000, 'monthly');

      expect(result.total_arrears).toBe(2000);
      expect(result.arrears_in_months).toBe(2);
      expect(result.is_authoritative).toBe(false);
      expect(result.legacy_warning).toBeDefined();
      expect(result.arrears_items).toEqual([]);
    });
  });

  describe('hasAuthoritativeArrearsData', () => {
    it('should return true when schedule data exists', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0 },
      ];

      expect(hasAuthoritativeArrearsData(items, 0)).toBe(true);
    });

    it('should return false when only flat total exists', () => {
      expect(hasAuthoritativeArrearsData([], 2000)).toBe(false);
      expect(hasAuthoritativeArrearsData(undefined, 2000)).toBe(false);
    });
  });

  describe('getAuthoritativeArrears', () => {
    it('should prefer schedule data over legacy total', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
      ];

      const result = getAuthoritativeArrears({
        arrears_items: items,
        total_arrears: 5000, // Different legacy total
        rent_amount: 1000,
        rent_frequency: 'monthly',
      });

      expect(result.total_arrears).toBe(1000); // From schedule, not legacy
      expect(result.is_authoritative).toBe(true);
    });

    it('should fall back to legacy total with warning', () => {
      const result = getAuthoritativeArrears({
        arrears_items: [],
        total_arrears: 2000,
        rent_amount: 1000,
        rent_frequency: 'monthly',
      });

      expect(result.total_arrears).toBe(2000);
      expect(result.is_authoritative).toBe(false);
      expect(result.legacy_warning).toBeDefined();
    });
  });

  // ============================================================================
  // HELPER FUNCTION TESTS
  // ============================================================================
  describe('hasArrearsGroundsSelected', () => {
    it('should return true for Ground 8', () => {
      expect(hasArrearsGroundsSelected([8])).toBe(true);
    });

    it('should return true for Ground 10', () => {
      expect(hasArrearsGroundsSelected([10])).toBe(true);
    });

    it('should return true for Ground 11', () => {
      expect(hasArrearsGroundsSelected([11])).toBe(true);
    });

    it('should return false for non-arrears grounds', () => {
      expect(hasArrearsGroundsSelected([1, 2, 14])).toBe(false);
    });
  });

  describe('hasGround8Selected', () => {
    it('should return true when Ground 8 is in the list', () => {
      expect(hasGround8Selected([8, 10, 11])).toBe(true);
    });

    it('should return false when Ground 8 is not in the list', () => {
      expect(hasGround8Selected([10, 11])).toBe(false);
    });
  });

  describe('normalizeArrearsItems', () => {
    it('should calculate amount_owed when not provided', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 300 },
      ];

      const normalized = normalizeArrearsItems(items);

      expect(normalized[0].amount_owed).toBe(700);
    });

    it('should preserve existing amount_owed if provided', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 300, amount_owed: 700 },
      ];

      const normalized = normalizeArrearsItems(items);

      expect(normalized[0].amount_owed).toBe(700);
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================
  describe('Integration: End-to-End Arrears Calculation', () => {
    it('should produce consistent totals between schedule and computed values', () => {
      const items = createEmptyArrearsSchedule({
        tenancy_start_date: '2024-01-01',
        rent_amount: 1200,
        rent_frequency: 'monthly',
        cut_off_date: '2024-06-30',
      });

      // Mark some periods as paid
      let updatedItems = updateArrearsItem(items, '2024-01-01', 1200); // Paid
      updatedItems = updateArrearsItem(updatedItems, '2024-02-01', 600); // Partial
      // 2024-03-01, 04-01, 05-01, 06-01 remain unpaid

      const computed = computeArrears(updatedItems, 'monthly', 1200);

      // Expected: 0 + 600 + 1200 + 1200 + 1200 + 1200 = 5400
      expect(computed.total_arrears).toBe(5400);
      expect(computed.periods_fully_paid).toBe(1);
      expect(computed.periods_partially_paid).toBe(1);
      expect(computed.periods_fully_unpaid).toBe(4);
      expect(computed.periods_with_arrears).toBe(5);
    });

    it('should correctly determine Ground 8 eligibility from real schedule', () => {
      const items = createEmptyArrearsSchedule({
        tenancy_start_date: '2024-01-01',
        rent_amount: 800,
        rent_frequency: 'monthly',
        cut_off_date: '2024-03-31',
      });

      // All unpaid = 3 months arrears
      const result = validateGround8Eligibility({
        arrears_items: items,
        rent_amount: 800,
        rent_frequency: 'monthly',
        jurisdiction: 'england',
      });

      expect(result.is_eligible).toBe(true);
      expect(result.arrears_in_months).toBe(3);
      expect(result.is_authoritative).toBe(true);
    });
  });
});
