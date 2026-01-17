/**
 * Arrears Schedule Mapper Tests
 *
 * Tests for the document mapping layer that converts arrears_items to document format.
 */

import {
  mapArrearsItemToEntry,
  mapArrearsItemsToEntries,
  getArrearsScheduleData,
  generateArrearsParticulars,
  generateArrearsBreakdownForCourt,
  shouldIncludeSchedulePdf,
  getLegacyArrearsWarning,
} from '@/lib/documents/arrears-schedule-mapper';
import type { ArrearsItem } from '@/lib/case-facts/schema';

describe('Arrears Schedule Mapper', () => {
  // ============================================================================
  // MAPPING TESTS
  // ============================================================================
  describe('mapArrearsItemToEntry', () => {
    it('should convert ArrearsItem to ArrearsEntry format', () => {
      const item: ArrearsItem = {
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        rent_due: 1000,
        rent_paid: 300,
        amount_owed: 700,
      };

      const entry = mapArrearsItemToEntry(item);

      expect(entry.period).toBe('2024-01-01 to 2024-01-31');
      expect(entry.due_date).toBe('2024-01-31');
      expect(entry.amount_due).toBe(1000);
      expect(entry.amount_paid).toBe(300);
      expect(entry.arrears).toBe(700);
    });

    it('should calculate amount_owed if not provided', () => {
      const item: ArrearsItem = {
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        rent_due: 1000,
        rent_paid: 400,
      };

      const entry = mapArrearsItemToEntry(item);

      expect(entry.arrears).toBe(600);
    });
  });

  describe('mapArrearsItemsToEntries', () => {
    it('should map all items correctly', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
        { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 1000, rent_paid: 1000, amount_owed: 0 },
      ];

      const entries = mapArrearsItemsToEntries(items);

      expect(entries.length).toBe(2);
      expect(entries[0].arrears).toBe(1000);
      expect(entries[1].arrears).toBe(0);
    });

    it('should handle empty array', () => {
      const entries = mapArrearsItemsToEntries([]);
      expect(entries).toEqual([]);
    });
  });

  // ============================================================================
  // SCHEDULE DATA TESTS
  // ============================================================================
  describe('getArrearsScheduleData', () => {
    it('should return authoritative data when schedule exists', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
        { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 1000, rent_paid: 500, amount_owed: 500 },
      ];

      const data = getArrearsScheduleData({
        arrears_items: items,
        total_arrears: null,
        rent_amount: 1000,
        rent_frequency: 'monthly',
        include_schedule: true,
      });

      expect(data.is_authoritative).toBe(true);
      expect(data.arrears_total).toBe(1500);
      expect(data.arrears_schedule.length).toBe(2);
      expect(data.include_schedule_pdf).toBe(true);
    });

    it('should return legacy warning when only flat total exists', () => {
      const data = getArrearsScheduleData({
        arrears_items: [],
        total_arrears: 2000,
        rent_amount: 1000,
        rent_frequency: 'monthly',
        include_schedule: true,
      });

      expect(data.is_authoritative).toBe(false);
      expect(data.arrears_total).toBe(2000);
      expect(data.legacy_warning).toBeDefined();
      expect(data.include_schedule_pdf).toBe(false);
    });
  });

  // ============================================================================
  // PARTICULARS GENERATION TESTS
  // ============================================================================
  describe('generateArrearsParticulars', () => {
    it('should generate summary particulars from schedule', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
        { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
      ];

      const result = generateArrearsParticulars({
        arrears_items: items,
        total_arrears: null,
        rent_amount: 1000,
        rent_frequency: 'monthly',
        include_full_schedule: false,
      });

      expect(result.is_summary).toBe(true);
      expect(result.total_amount).toBe(2000);
      expect(result.particulars).toContain('£2000.00');
      expect(result.particulars).toContain('2 payment period');
    });

    it('should generate legacy particulars when no schedule', () => {
      const result = generateArrearsParticulars({
        arrears_items: [],
        total_arrears: 3000,
        rent_amount: 1000,
        rent_frequency: 'monthly',
        include_full_schedule: false,
      });

      expect(result.particulars).toBe('Rent arrears outstanding: £3000.00');
      expect(result.is_summary).toBe(true);
      expect(result.total_amount).toBe(3000);
    });

    it('should generate full schedule when requested', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
      ];

      const result = generateArrearsParticulars({
        arrears_items: items,
        total_arrears: null,
        rent_amount: 1000,
        rent_frequency: 'monthly',
        include_full_schedule: true,
      });

      expect(result.is_summary).toBe(false);
      expect(result.particulars).toContain('SCHEDULE OF RENT ARREARS');
    });
  });

  describe('generateArrearsBreakdownForCourt', () => {
    it('should generate breakdown with legacy warning when applicable', () => {
      const result = generateArrearsBreakdownForCourt({
        arrears_items: [],
        total_arrears: 2500,
        rent_amount: 1000,
        rent_frequency: 'monthly',
      });

      expect(result).toContain('£2500.00');
      expect(result).toContain('Note:');
    });

    it('should generate clean breakdown from schedule', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
      ];

      const result = generateArrearsBreakdownForCourt({
        arrears_items: items,
        total_arrears: null,
        rent_amount: 1000,
        rent_frequency: 'monthly',
      });

      expect(result).toContain('£1000.00');
      expect(result).not.toContain('Note:');
    });
  });

  // ============================================================================
  // HELPER FUNCTION TESTS
  // ============================================================================
  describe('shouldIncludeSchedulePdf', () => {
    it('should return true when arrears grounds selected and schedule exists', () => {
      const result = shouldIncludeSchedulePdf({
        arrears_items: [
          { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0 },
        ],
        has_arrears_grounds: true,
      });

      expect(result).toBe(true);
    });

    it('should return false when no arrears grounds selected', () => {
      const result = shouldIncludeSchedulePdf({
        arrears_items: [
          { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0 },
        ],
        has_arrears_grounds: false,
      });

      expect(result).toBe(false);
    });

    it('should return false when no schedule data', () => {
      const result = shouldIncludeSchedulePdf({
        arrears_items: [],
        has_arrears_grounds: true,
      });

      expect(result).toBe(false);
    });
  });

  describe('getLegacyArrearsWarning', () => {
    it('should return warning when only flat total exists', () => {
      const warning = getLegacyArrearsWarning({
        arrears_items: [],
        total_arrears: 2000,
      });

      expect(warning).toBeDefined();
      expect(warning).toContain('legacy');
    });

    it('should return null when schedule exists', () => {
      const warning = getLegacyArrearsWarning({
        arrears_items: [
          { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0 },
        ],
        total_arrears: 1000,
      });

      expect(warning).toBeNull();
    });

    it('should return null when no arrears at all', () => {
      const warning = getLegacyArrearsWarning({
        arrears_items: [],
        total_arrears: 0,
      });

      expect(warning).toBeNull();
    });
  });

  // ============================================================================
  // CONSISTENCY TESTS
  // ============================================================================
  describe('Consistency between schedule and totals', () => {
    it('should produce consistent totals from schedule and computed values', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
        { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 1000, rent_paid: 250, amount_owed: 750 },
        { period_start: '2024-03-01', period_end: '2024-03-31', rent_due: 1000, rent_paid: 1000, amount_owed: 0 },
      ];

      const data = getArrearsScheduleData({
        arrears_items: items,
        total_arrears: null,
        rent_amount: 1000,
        rent_frequency: 'monthly',
        include_schedule: true,
      });

      // Total from schedule entries
      const entryTotal = data.arrears_schedule.reduce((sum, e) => sum + e.arrears, 0);

      expect(entryTotal).toBe(data.arrears_total);
      expect(data.arrears_total).toBe(1750);
    });
  });

  // ============================================================================
  // RENT SCHEDULE NON-BLANK TESTS
  // Ensures rent schedule documents are never blank when valid data exists
  // ============================================================================
  describe('Rent schedule non-blank enforcement', () => {
    it('should have at least one row when arrears_items exist', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-05-01', period_end: '2024-05-31', rent_due: 1200, rent_paid: 200, amount_owed: 1000 },
      ];

      const data = getArrearsScheduleData({
        arrears_items: items,
        total_arrears: null,
        rent_amount: 1200,
        rent_frequency: 'monthly',
        include_schedule: true,
      });

      // CRITICAL: Schedule must have at least one row
      expect(data.arrears_schedule.length).toBeGreaterThanOrEqual(1);
      expect(data.include_schedule_pdf).toBe(true);
    });

    it('should populate all required fields for each row', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-06-01', period_end: '2024-06-30', rent_due: 850, rent_paid: 0, amount_owed: 850 },
        { period_start: '2024-07-01', period_end: '2024-07-31', rent_due: 850, rent_paid: 400, amount_owed: 450 },
      ];

      const data = getArrearsScheduleData({
        arrears_items: items,
        total_arrears: null,
        rent_amount: 850,
        rent_frequency: 'monthly',
        include_schedule: true,
      });

      // Each row must have all required fields for template rendering
      for (const row of data.arrears_schedule) {
        expect(row.period).toBeDefined();
        expect(row.period).not.toBe('');
        expect(row.due_date).toBeDefined();
        expect(row.due_date).not.toBe('');
        expect(typeof row.amount_due).toBe('number');
        expect(typeof row.amount_paid).toBe('number');
        expect(typeof row.arrears).toBe('number');
      }
    });

    it('should have non-zero total when arrears exist', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-08-01', period_end: '2024-08-31', rent_due: 950, rent_paid: 0, amount_owed: 950 },
      ];

      const data = getArrearsScheduleData({
        arrears_items: items,
        total_arrears: null,
        rent_amount: 950,
        rent_frequency: 'monthly',
        include_schedule: true,
      });

      expect(data.arrears_total).toBeGreaterThan(0);
      expect(data.arrears_schedule.some(row => row.arrears > 0)).toBe(true);
    });

    it('should not include schedule PDF when arrears_items is empty', () => {
      const data = getArrearsScheduleData({
        arrears_items: [],
        total_arrears: 1500, // Legacy flat total
        rent_amount: 750,
        rent_frequency: 'monthly',
        include_schedule: true,
      });

      // Even with include_schedule=true, if no items, no PDF should be generated
      // This prevents blank documents
      expect(data.include_schedule_pdf).toBe(false);
      expect(data.arrears_schedule.length).toBe(0);
    });

    it('should preserve user-entered data exactly in schedule rows', () => {
      const userEnteredItems: ArrearsItem[] = [
        {
          period_start: '2024-03-15',
          period_end: '2024-04-14',
          rent_due: 1275.50,
          rent_paid: 500,
          amount_owed: 775.50,
        },
      ];

      const data = getArrearsScheduleData({
        arrears_items: userEnteredItems,
        total_arrears: null,
        rent_amount: 1275.50,
        rent_frequency: 'monthly',
        include_schedule: true,
      });

      // User-entered amounts must be preserved exactly
      const row = data.arrears_schedule[0];
      expect(row.amount_due).toBe(1275.50);
      expect(row.amount_paid).toBe(500);
      expect(row.arrears).toBe(775.50);
      expect(row.period).toContain('2024-03-15');
      expect(row.period).toContain('2024-04-14');
    });

    it('should correctly aggregate multiple periods for total arrears', () => {
      const items: ArrearsItem[] = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
        { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
        { period_start: '2024-03-01', period_end: '2024-03-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
        { period_start: '2024-04-01', period_end: '2024-04-30', rent_due: 1000, rent_paid: 500, amount_owed: 500 },
      ];

      const data = getArrearsScheduleData({
        arrears_items: items,
        total_arrears: null,
        rent_amount: 1000,
        rent_frequency: 'monthly',
        include_schedule: true,
      });

      // Total should be sum of all rows
      expect(data.arrears_total).toBe(3500);
      expect(data.arrears_schedule.length).toBe(4);

      // Individual row amounts should be preserved
      expect(data.arrears_schedule[0].arrears).toBe(1000);
      expect(data.arrears_schedule[1].arrears).toBe(1000);
      expect(data.arrears_schedule[2].arrears).toBe(1000);
      expect(data.arrears_schedule[3].arrears).toBe(500);
    });
  });
});
