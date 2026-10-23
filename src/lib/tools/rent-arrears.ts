export interface RentScheduleEntry {
  dueDate: string;
  dueAmount: number;
  paidAmount: number;
}

export interface RentArrearsTotals {
  totalDue: number;
  totalPaid: number;
  totalOutstanding: number;
  totalInterest: number;
  earliestOutstandingDueDate: string;
  maxDaysOutstanding: number;
}

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const STATUTORY_INTEREST_RATE = 0.08;

export function calculateRentArrearsTotals(
  schedule: RentScheduleEntry[],
  asOf = new Date(),
): RentArrearsTotals {
  const calculationDate = new Date(asOf);
  calculationDate.setHours(0, 0, 0, 0);

  return schedule.reduce<RentArrearsTotals>(
    (totals, item) => {
      const due = Number(item.dueAmount) || 0;
      const paid = Number(item.paidAmount) || 0;
      const outstanding = Math.max(due - paid, 0);
      const dueDate = item.dueDate ? new Date(`${item.dueDate}T00:00:00`) : calculationDate;
      const daysOutstanding = Math.max(
        0,
        Math.floor((calculationDate.getTime() - dueDate.getTime()) / MILLISECONDS_PER_DAY),
      );

      totals.totalDue += due;
      totals.totalPaid += paid;
      totals.totalOutstanding += outstanding;
      totals.totalInterest +=
        outstanding > 0 ? outstanding * STATUTORY_INTEREST_RATE * (daysOutstanding / 365) : 0;

      if (outstanding > 0 && item.dueDate) {
        if (!totals.earliestOutstandingDueDate || item.dueDate < totals.earliestOutstandingDueDate) {
          totals.earliestOutstandingDueDate = item.dueDate;
        }
        totals.maxDaysOutstanding = Math.max(totals.maxDaysOutstanding, daysOutstanding);
      }

      return totals;
    },
    {
      totalDue: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      totalInterest: 0,
      earliestOutstandingDueDate: '',
      maxDaysOutstanding: 0,
    },
  );
}
