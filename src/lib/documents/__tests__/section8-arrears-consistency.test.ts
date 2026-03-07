/**
 * Section 8 Arrears Consistency Tests
 *
 * Regression tests to ensure the Section 8 Notice "Ground Particulars"
 * figures match the Rent Schedule / Arrears Statement exactly.
 *
 * Issue: The Notice showed £4,000.00 total / £1,000.00 final period while
 * the Rent Schedule showed £3,645.16 total / £645.16 pro-rated final period.
 *
 * Fix: Both documents now use the canonical arrears data from arrears-engine.ts
 * via the arrears-schedule-mapper.ts, ensuring identical figures.
 */

import { mapNoticeOnlyFacts } from '@/lib/case-facts/normalize';
import { getArrearsScheduleData } from '@/lib/documents/arrears-schedule-mapper';
import type { ArrearsItem } from '@/lib/case-facts/schema';

describe('Section 8 Notice Arrears Consistency', () => {
  /**
   * Test case with pro-rated final period:
   * - Monthly rent: £1,000
   * - Full periods: Oct, Nov, Dec (£1,000 each)
   * - Pro-rated final period: 14 Jan – 2 Feb (20/31 days = £645.16)
   * - No payments made
   * - Expected total: £3,645.16
   */
  const createProRatedTestCase = () => {
    const arrearsItems: ArrearsItem[] = [
      {
        period_start: '2025-10-14',
        period_end: '2025-11-13',
        rent_due: 1000,
        rent_paid: 0,
        amount_owed: 1000,
      },
      {
        period_start: '2025-11-14',
        period_end: '2025-12-13',
        rent_due: 1000,
        rent_paid: 0,
        amount_owed: 1000,
      },
      {
        period_start: '2025-12-14',
        period_end: '2026-01-13',
        rent_due: 1000,
        rent_paid: 0,
        amount_owed: 1000,
      },
      {
        // Pro-rated final period: 20 days of 31-day period
        period_start: '2026-01-14',
        period_end: '2026-02-02',
        rent_due: 645.16, // (1000 / 31) * 20 ≈ 645.16
        rent_paid: 0,
        amount_owed: 645.16,
        is_pro_rated: true,
        days_in_period: 20,
        notes: 'Pro-rated (20 days)',
      },
    ];

    return {
      arrearsItems,
      rentAmount: 1000,
      rentFrequency: 'monthly' as const,
      expectedTotal: 3645.16,
      expectedFinalPeriodArrears: 645.16,
    };
  };

  /**
   * Test case with partial payments (FIFO allocation):
   * - Monthly rent: £1,000
   * - Periods: Oct, Nov, Dec
   * - Oct: £800 paid (£200 outstanding)
   * - Nov: £500 paid (£500 outstanding)
   * - Dec: £0 paid (£1,000 outstanding)
   * - Expected total: £1,700
   */
  const createPartialPaymentTestCase = () => {
    const arrearsItems: ArrearsItem[] = [
      {
        period_start: '2025-10-14',
        period_end: '2025-11-13',
        rent_due: 1000,
        rent_paid: 800,
        amount_owed: 200,
      },
      {
        period_start: '2025-11-14',
        period_end: '2025-12-13',
        rent_due: 1000,
        rent_paid: 500,
        amount_owed: 500,
      },
      {
        period_start: '2025-12-14',
        period_end: '2026-01-13',
        rent_due: 1000,
        rent_paid: 0,
        amount_owed: 1000,
      },
    ];

    return {
      arrearsItems,
      rentAmount: 1000,
      rentFrequency: 'monthly' as const,
      expectedTotal: 1700,
    };
  };

  const createBelowThresholdMonthlyCase = () => {
    const arrearsItems: ArrearsItem[] = [
      {
        period_start: '2025-11-01',
        period_end: '2025-11-30',
        rent_due: 1200,
        rent_paid: 0,
        amount_owed: 1200,
      },
      {
        period_start: '2025-12-01',
        period_end: '2025-12-31',
        rent_due: 967.74,
        rent_paid: 0,
        amount_owed: 967.74,
      },
    ];

    return {
      arrearsItems,
      rentAmount: 1200,
      rentFrequency: 'monthly' as const,
      expectedTotal: 2167.74,
    };
  };

  const createAboveThresholdMonthlyCase = () => {
    const arrearsItems: ArrearsItem[] = [
      {
        period_start: '2025-11-01',
        period_end: '2025-11-30',
        rent_due: 1250,
        rent_paid: 0,
        amount_owed: 1250,
      },
      {
        period_start: '2025-12-01',
        period_end: '2025-12-31',
        rent_due: 1250,
        rent_paid: 0,
        amount_owed: 1250,
      },
    ];

    return {
      arrearsItems,
      rentAmount: 1200,
      rentFrequency: 'monthly' as const,
      expectedTotal: 2500,
    };
  };

  describe('Pro-rated final period', () => {
    test('Notice total arrears equals schedule total arrears', () => {
      const testCase = createProRatedTestCase();

      // Get canonical schedule data (same source used by Rent Schedule)
      const scheduleData = getArrearsScheduleData({
        arrears_items: testCase.arrearsItems,
        total_arrears: null, // Let it compute from schedule
        rent_amount: testCase.rentAmount,
        rent_frequency: testCase.rentFrequency,
        include_schedule: true,
      });

      // Build notice template data (which feeds Ground Particulars)
      const wizardFacts = {
        rent_amount: testCase.rentAmount,
        rent_frequency: testCase.rentFrequency,
        arrears_items: testCase.arrearsItems,
        section8_grounds: ['8'],
        landlord_name: 'Test Landlord',
        tenant_name: 'Test Tenant',
        property_address_line_1: '123 Test Street',
        property_city: 'London',
        property_postcode: 'SW1A 1AA',
        tenancy_start_date: '2020-01-01',
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);

      // The grounds array should contain Ground 8 with correct particulars
      const ground8 = templateData.grounds?.find((g: any) => g.code === 8);

      // Verify both use same total
      expect(scheduleData.arrears_total).toBeCloseTo(testCase.expectedTotal, 2);

      // Verify Ground 8 particulars contain the correct total
      expect(ground8).toBeDefined();
      expect(ground8.particulars).toContain(`£${testCase.expectedTotal.toFixed(2)}`);
    });

    test('Notice itemized period amounts equal schedule line items', () => {
      const testCase = createProRatedTestCase();

      const scheduleData = getArrearsScheduleData({
        arrears_items: testCase.arrearsItems,
        total_arrears: null,
        rent_amount: testCase.rentAmount,
        rent_frequency: testCase.rentFrequency,
        include_schedule: true,
      });

      const wizardFacts = {
        rent_amount: testCase.rentAmount,
        rent_frequency: testCase.rentFrequency,
        arrears_items: testCase.arrearsItems,
        section8_grounds: ['8'],
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);
      const ground8 = templateData.grounds?.find((g: any) => g.code === 8);

      // Verify pro-rated final period amount is in particulars
      expect(ground8.particulars).toContain(`£${testCase.expectedFinalPeriodArrears.toFixed(2)}`);

      // Verify the schedule has the same pro-rated amount
      const finalPeriod = scheduleData.arrears_schedule[scheduleData.arrears_schedule.length - 1];
      expect(finalPeriod.arrears).toBeCloseTo(testCase.expectedFinalPeriodArrears, 2);
    });

    test('months rent approximation is derived from schedule total', () => {
      const testCase = createProRatedTestCase();

      const scheduleData = getArrearsScheduleData({
        arrears_items: testCase.arrearsItems,
        total_arrears: null,
        rent_amount: testCase.rentAmount,
        rent_frequency: testCase.rentFrequency,
        include_schedule: true,
      });

      // Expected months: 3645.16 / 1000 ≈ 3.6
      const expectedMonths = testCase.expectedTotal / testCase.rentAmount;
      expect(scheduleData.arrears_in_months).toBeCloseTo(expectedMonths, 1);
    });

    test('Notice-only template uses canonical total when total_arrears disagrees', () => {
      const testCase = createProRatedTestCase();

      const wizardFacts = {
        rent_amount: testCase.rentAmount,
        rent_frequency: testCase.rentFrequency,
        arrears_items: testCase.arrearsItems,
        total_arrears: 4000,
        section8_grounds: ['8'],
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);

      expect(templateData.total_arrears).toBeCloseTo(testCase.expectedTotal, 2);
    });
  });

  describe('Partial payments with multiple part-paid periods', () => {
    test('Notice total arrears equals schedule total with FIFO-allocated payments', () => {
      const testCase = createPartialPaymentTestCase();

      const scheduleData = getArrearsScheduleData({
        arrears_items: testCase.arrearsItems,
        total_arrears: null,
        rent_amount: testCase.rentAmount,
        rent_frequency: testCase.rentFrequency,
        include_schedule: true,
      });

      const wizardFacts = {
        rent_amount: testCase.rentAmount,
        rent_frequency: testCase.rentFrequency,
        arrears_items: testCase.arrearsItems,
        section8_grounds: ['10'],
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);
      const ground10 = templateData.grounds?.find((g: any) => g.code === 10);

      // Both should show £1,700
      expect(scheduleData.arrears_total).toBe(testCase.expectedTotal);
      expect(ground10.particulars).toContain(`£${testCase.expectedTotal.toFixed(2)}`);
    });

    test('Individual period amounts match in both Notice and Schedule', () => {
      const testCase = createPartialPaymentTestCase();

      const scheduleData = getArrearsScheduleData({
        arrears_items: testCase.arrearsItems,
        total_arrears: null,
        rent_amount: testCase.rentAmount,
        rent_frequency: testCase.rentFrequency,
        include_schedule: true,
      });

      const wizardFacts = {
        rent_amount: testCase.rentAmount,
        rent_frequency: testCase.rentFrequency,
        arrears_items: testCase.arrearsItems,
        section8_grounds: ['10'],
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);
      const ground10 = templateData.grounds?.find((g: any) => g.code === 10);

      // Verify each period amount appears in the particulars
      expect(ground10.particulars).toContain('£200.00'); // Oct outstanding
      expect(ground10.particulars).toContain('£500.00'); // Nov outstanding
      expect(ground10.particulars).toContain('£1000.00'); // Dec outstanding

      // Verify schedule has same amounts
      expect(scheduleData.arrears_schedule[0].arrears).toBe(200);
      expect(scheduleData.arrears_schedule[1].arrears).toBe(500);
      expect(scheduleData.arrears_schedule[2].arrears).toBe(1000);
    });
  });

  describe('Legacy data fallback', () => {
    test('Falls back to total_arrears when no schedule data provided', () => {
      const wizardFacts = {
        rent_amount: 1000,
        rent_frequency: 'monthly',
        total_arrears: 4000, // Legacy flat total
        section8_grounds: ['8'],
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);
      const ground8 = templateData.grounds?.find((g: any) => g.code === 8);

      // Should use the legacy total
      expect(ground8.particulars).toContain('£4000.00');
    });
  });

  describe('Ground 8 gating with canonical totals', () => {
    test('Ground 8 omitted when arrears below threshold, Ground 10 remains', () => {
      const testCase = createBelowThresholdMonthlyCase();

      const wizardFacts = {
        rent_amount: testCase.rentAmount,
        rent_frequency: testCase.rentFrequency,
        arrears_items: testCase.arrearsItems,
        section8_grounds: ['8', '10'],
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);
      const ground8 = templateData.grounds?.find((g: any) => g.code === 8);
      const ground10 = templateData.grounds?.find((g: any) => g.code === 10);

      expect(ground8).toBeUndefined();
      expect(ground10).toBeDefined();
      expect(ground10.particulars).toContain(`£${testCase.expectedTotal.toFixed(2)}`);
    });

    test('Ground 8 included when arrears meet threshold', () => {
      const testCase = createAboveThresholdMonthlyCase();

      const wizardFacts = {
        rent_amount: testCase.rentAmount,
        rent_frequency: testCase.rentFrequency,
        arrears_items: testCase.arrearsItems,
        section8_grounds: ['8', '10'],
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);
      const ground8 = templateData.grounds?.find((g: any) => g.code === 8);

      expect(ground8).toBeDefined();
      expect(ground8.particulars).toContain(`£${testCase.expectedTotal.toFixed(2)}`);
    });
  });

  describe('Ground 11 consistency', () => {
    test('Ground 11 uses same arrears data as Ground 8 and 10', () => {
      const testCase = createProRatedTestCase();

      const wizardFacts = {
        rent_amount: testCase.rentAmount,
        rent_frequency: testCase.rentFrequency,
        arrears_items: testCase.arrearsItems,
        section8_grounds: ['11'],
      };

      const templateData = mapNoticeOnlyFacts(wizardFacts);
      const ground11 = templateData.grounds?.find((g: any) => g.code === 11);

      expect(ground11.particulars).toContain(`£${testCase.expectedTotal.toFixed(2)}`);
    });
  });
});
