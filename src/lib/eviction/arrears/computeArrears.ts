import type { ArrearsItem, TenancyFacts } from '@/lib/case-facts/schema';
import type { ArrearsEntry } from '@/lib/documents/money-claim-pack-generator';
import { getArrearsScheduleData } from '@/lib/documents/arrears-schedule-mapper';
import {
  calculateArrearsInMonths,
  normalizeArrearsItems,
} from '@/lib/arrears-engine';
import { formatCurrency } from '@/lib/utils';

export interface CanonicalArrearsResult {
  items: ArrearsItem[];
  schedule: ArrearsEntry[];
  total: number;
  totalFormatted: string;
  arrearsAtNoticeDate: number | null;
  arrearsInMonths: number;
  hasProrating: boolean;
  isAuthoritative: boolean;
  legacyWarning?: string;
  scheduleData: ReturnType<typeof getArrearsScheduleData>;
}

export interface ComputeEvictionArrearsParams {
  arrears_items?: ArrearsItem[];
  total_arrears?: number | null;
  rent_amount: number;
  rent_frequency: TenancyFacts['rent_frequency'];
  rent_due_day?: number | null;
  schedule_end_date?: string | null;
}

const roundToPennies = (value: number) => Math.round(value * 100) / 100;

/**
 * Pro-rate partial periods in an arrears schedule.
 *
 * For monthly rent, if the last period is less than a full month, pro-rate the rent due amount.
 */
export function proRatePartialPeriods(
  schedule: Array<{
    period: string;
    due_date: string;
    amount_due: number;
    amount_paid: number;
    arrears: number;
    running_balance?: number;
    notes?: string;
  }>,
  rentAmount: number,
  rentFrequency: string,
  scheduleEndDate?: string | null
): Array<{
  period: string;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  arrears: number;
  running_balance?: number;
  notes?: string;
}> {
  if (!schedule || schedule.length === 0 || !scheduleEndDate) {
    return schedule;
  }

  // Only handle monthly frequency for now (most common)
  if (rentFrequency !== 'monthly') {
    return schedule;
  }

  // Work on a copy
  const result = [...schedule];
  const lastIndex = result.length - 1;
  const lastEntry = result[lastIndex];

  // Parse period dates from the "X to Y" format
  // Format is "D Month YYYY to D Month YYYY" (UK legal format)
  const periodMatch = lastEntry.period.match(/^(.+?)\s+to\s+(.+)$/i);
  if (!periodMatch) {
    return schedule;
  }

  const periodStartStr = periodMatch[1].trim();
  const periodEndStr = periodMatch[2].trim();

  // Parse UK date format (e.g., "14 January 2026") to Date
  const parseUKDate = (ukDateStr: string): Date | null => {
    const months: Record<string, number> = {
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
    };
    const match = ukDateStr.match(/(\d+)\s+(\w+)\s+(\d{4})/);
    if (!match) return null;
    const day = parseInt(match[1], 10);
    const month = months[match[2].toLowerCase()];
    const year = parseInt(match[3], 10);
    if (month === undefined) return null;
    return new Date(year, month, day);
  };

  const periodStart = parseUKDate(periodStartStr);
  const periodEnd = parseUKDate(periodEndStr);

  if (!periodStart || !periodEnd) {
    return schedule;
  }

  const daysBetween = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const daysInMonth = (dateStr: string): number => {
    const date = new Date(dateStr);
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Calculate expected full period length (days in the month)
  const fullPeriodDays = daysInMonth(periodStart.toISOString().split('T')[0]);

  // Calculate actual period days
  const actualDays = daysBetween(
    periodStart.toISOString().split('T')[0],
    periodEnd.toISOString().split('T')[0]
  );

  // Check if this is a partial period (less than full month)
  // Allow 3 day tolerance (for months with 28-31 days)
  if (actualDays >= fullPeriodDays - 3) {
    return schedule;
  }

  // Pro-rate the rent
  const dailyRate = rentAmount / fullPeriodDays;
  const proRatedAmount = roundToPennies(dailyRate * actualDays);

  // Calculate the difference from what was originally charged
  const originalAmount = lastEntry.amount_due;
  const adjustment = originalAmount - proRatedAmount;

  // Update the last entry
  result[lastIndex] = {
    ...lastEntry,
    amount_due: proRatedAmount,
    arrears: roundToPennies(lastEntry.arrears - adjustment),
    notes: `Pro-rated for ${actualDays} days (daily rate: £${dailyRate.toFixed(2)})`,
  };

  // Recalculate running balances
  let runningBalance = 0;
  for (let i = 0; i < result.length; i += 1) {
    runningBalance += result[i].arrears;
    result[i] = {
      ...result[i],
      running_balance: roundToPennies(runningBalance),
    };
  }

  return result;
}

/**
 * Canonical arrears computation for eviction pack generation.
 */
export function computeEvictionArrears(
  params: ComputeEvictionArrearsParams
): CanonicalArrearsResult {
  const {
    arrears_items,
    total_arrears,
    rent_amount,
    rent_frequency,
    rent_due_day,
    schedule_end_date,
  } = params;

  const scheduleData = getArrearsScheduleData({
    arrears_items,
    total_arrears,
    rent_amount,
    rent_frequency,
    rent_due_day,
    include_schedule: true,
  });

  const baseSchedule = scheduleData.arrears_schedule;
  const baseTotalFromSchedule = baseSchedule.reduce((sum, entry) => sum + entry.arrears, 0);
  const baseTotal = baseSchedule.length > 0 ? roundToPennies(baseTotalFromSchedule) : scheduleData.arrears_total;

  const proratedSchedule = proRatePartialPeriods(
    baseSchedule,
    rent_amount,
    rent_frequency,
    schedule_end_date
  );

  const proratedTotalFromSchedule = proratedSchedule.reduce((sum, entry) => sum + entry.arrears, 0);
  const proratedTotal = proratedSchedule.length > 0 ? roundToPennies(proratedTotalFromSchedule) : baseTotal;

  const hasProrating =
    proratedSchedule.length > 0 && Math.abs(proratedTotal - baseTotal) > 0.005;

  const canonicalTotal = proratedSchedule.length > 0 ? proratedTotal : baseTotal;
  const arrearsInMonths = calculateArrearsInMonths(canonicalTotal, rent_amount, rent_frequency);
  const normalizedItems = normalizeArrearsItems(arrears_items || []);

  if (
    Array.isArray(arrears_items) &&
    arrears_items.length > 0 &&
    typeof total_arrears === 'number' &&
    Math.abs(canonicalTotal - total_arrears) > 0.01 &&
    process.env.NODE_ENV !== 'production'
  ) {
    console.warn(
      '[arrears] Canonical total differs from provided total_arrears',
      { canonicalTotal, providedTotal: total_arrears }
    );
  }

  return {
    items: normalizedItems,
    schedule: proratedSchedule,
    total: canonicalTotal,
    totalFormatted: formatCurrency(canonicalTotal),
    arrearsAtNoticeDate: canonicalTotal,
    arrearsInMonths,
    hasProrating,
    isAuthoritative: scheduleData.is_authoritative,
    legacyWarning: scheduleData.legacy_warning,
    scheduleData: {
      ...scheduleData,
      arrears_schedule: proratedSchedule,
      arrears_total: canonicalTotal,
      arrears_in_months: arrearsInMonths,
      include_schedule_pdf: scheduleData.include_schedule_pdf && proratedSchedule.length > 0,
    },
  };
}
