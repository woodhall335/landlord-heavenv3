import { describe, expect, it } from 'vitest';

import { calculateRentArrearsTotals } from '@/lib/tools/rent-arrears';

describe('calculateRentArrearsTotals', () => {
  it('calculates interest separately from each unpaid period due date', () => {
    const totals = calculateRentArrearsTotals(
      [
        { dueDate: '2026-01-01', dueAmount: 1_000, paidAmount: 0 },
        { dueDate: '2026-01-31', dueAmount: 1_000, paidAmount: 500 },
      ],
      new Date('2026-03-02T12:00:00'),
    );

    expect(totals.totalOutstanding).toBe(1_500);
    expect(totals.totalInterest).toBeCloseTo(
      1_000 * 0.08 * (60 / 365) + 500 * 0.08 * (30 / 365),
      8,
    );
    expect(totals.earliestOutstandingDueDate).toBe('2026-01-01');
    expect(totals.maxDaysOutstanding).toBe(60);
  });

  it('does not charge interest before a due date or on a fully paid period', () => {
    const totals = calculateRentArrearsTotals(
      [
        { dueDate: '2026-03-10', dueAmount: 1_000, paidAmount: 0 },
        { dueDate: '2026-01-01', dueAmount: 800, paidAmount: 800 },
      ],
      new Date('2026-03-02T12:00:00'),
    );

    expect(totals.totalOutstanding).toBe(1_000);
    expect(totals.totalInterest).toBe(0);
  });
});
