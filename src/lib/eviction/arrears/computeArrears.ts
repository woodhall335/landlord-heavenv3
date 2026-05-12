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

function parseISODateUTC(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function formatISODateUTC(date: Date): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${date.getUTCDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDaysUTC(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function addCalendarMonthsUTC(date: Date, months: number): Date {
  const next = new Date(date.getTime());
  const originalDay = next.getUTCDate();
  next.setUTCMonth(next.getUTCMonth() + months);
  if (next.getUTCDate() !== originalDay) {
    next.setUTCDate(0);
  }
  return next;
}

function daysInclusiveUTC(startDate: Date, endDate: Date): number {
  const start = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
  const end = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function formatCurrencyAscii(amount: number): string {
  return `GBP ${amount.toFixed(2)}`;
}

function repairMonthlyGeneratedItems(params: {
  items: ArrearsItem[];
  rentAmount: number;
  rentFrequency: TenancyFacts['rent_frequency'];
  scheduleEndDate?: string | null;
}): ArrearsItem[] {
  const { items, rentAmount, rentFrequency, scheduleEndDate } = params;
  if (rentFrequency !== 'monthly' || items.length === 0 || rentAmount <= 0) {
    return items;
  }

  const firstStart = parseISODateUTC(items[0]?.period_start);
  if (!firstStart) return items;

  const scheduleEnd = parseISODateUTC(scheduleEndDate || undefined);
  const expected = items.map((item, index) => {
    const start = addCalendarMonthsUTC(firstStart, index);
    const fullEnd = addDaysUTC(addCalendarMonthsUTC(start, 1), -1);
    const end = scheduleEnd && scheduleEnd >= start && scheduleEnd < fullEnd ? scheduleEnd : fullEnd;
    const fullPeriodDays = daysInclusiveUTC(start, fullEnd);
    const actualDays = daysInclusiveUTC(start, end);
    const isPartial = actualDays < fullPeriodDays;
    const rentDue = isPartial ? roundToPennies((rentAmount / fullPeriodDays) * actualDays) : rentAmount;
    const rentPaid = Math.min(roundToPennies(Number(item.rent_paid) || 0), rentDue);
    const dailyRate = rentAmount / fullPeriodDays;

    return {
      item,
      start,
      end,
      fullPeriodDays,
      actualDays,
      isPartial,
      rentDue,
      rentPaid,
      dailyRate,
    };
  });

  const isGeneratedMonthlyShape = expected.every(({ item, start, end }, index) => {
    const actualStart = parseISODateUTC(item.period_start);
    const actualEnd = parseISODateUTC(item.period_end);
    if (!actualStart || !actualEnd) return false;

    const startDrift = Math.abs(daysInclusiveUTC(actualStart < start ? actualStart : start, actualStart < start ? start : actualStart) - 1);
    const endDrift = Math.abs(daysInclusiveUTC(actualEnd < end ? actualEnd : end, actualEnd < end ? end : actualEnd) - 1);
    return index === 0 || (startDrift <= 2 && endDrift <= 2);
  });

  if (!isGeneratedMonthlyShape) {
    return items;
  }

  return expected.map(({ item, start, end, fullPeriodDays, actualDays, isPartial, rentDue, rentPaid, dailyRate }) => ({
    ...item,
    period_start: formatISODateUTC(start),
    period_end: formatISODateUTC(end),
    rent_due: rentDue,
    rent_paid: rentPaid,
    amount_owed: roundToPennies(rentDue - rentPaid),
    is_pro_rated: isPartial || undefined,
    days_in_period: actualDays,
    notes: isPartial
      ? `Pro-rated for ${actualDays} day${actualDays === 1 ? '' : 's'} at ${formatCurrencyAscii(dailyRate)} per day over a ${fullPeriodDays}-day rent period.`
      : item.notes,
  }));
}

function alignItemsWithSchedule(
  items: ArrearsItem[],
  schedule: CanonicalArrearsResult['schedule']
): ArrearsItem[] {
  if (items.length === 0 || schedule.length === 0) {
    return items;
  }

  return items.map((item, index) => {
    const entry = schedule[index];
    if (!entry) {
      return item;
    }

    const rentDue = roundToPennies(Number(entry.amount_due) || 0);
    const rentPaid = roundToPennies(Number(entry.amount_paid) || 0);
    const amountOwed = roundToPennies(
      Number.isFinite(Number(entry.arrears)) ? Number(entry.arrears) : rentDue - rentPaid
    );
    const rentDueChanged = Math.abs(rentDue - Number(item.rent_due || 0)) > 0.005;

    return {
      ...item,
      rent_due: rentDue,
      rent_paid: rentPaid,
      amount_owed: amountOwed,
      is_pro_rated: item.is_pro_rated || (rentDueChanged && index === schedule.length - 1) || undefined,
      notes: entry.notes || item.notes,
    };
  });
}

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
  rentFrequency: TenancyFacts['rent_frequency'] | null,
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
  if (!schedule || schedule.length === 0 || !scheduleEndDate || !rentFrequency) {
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
    return new Date(Date.UTC(year, month, day));
  };

  const periodStart = parseUKDate(periodStartStr);
  const periodEnd = parseUKDate(periodEndStr);

  if (!periodStart || !periodEnd) {
    return schedule;
  }

  const daysBetween = (startDate: Date, endDate: Date): number => {
    const start = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
    const end = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const daysInMonth = (date: Date): number => {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  };

  // Calculate expected full period length (days in the month)
  const fullPeriodDays = daysInMonth(periodStart);

  // Calculate actual period days
  const actualDays = daysBetween(periodStart, periodEnd);

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
    notes: `Pro-rated for ${actualDays} day${actualDays === 1 ? '' : 's'} at ${formatCurrencyAscii(dailyRate)} per day.`,
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
  const preparedArrearsItems = repairMonthlyGeneratedItems({
    items: arrears_items || [],
    rentAmount: rent_amount,
    rentFrequency: rent_frequency,
    scheduleEndDate: schedule_end_date,
  });

  const scheduleData = getArrearsScheduleData({
    arrears_items: preparedArrearsItems,
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
  const normalizedItems = normalizeArrearsItems(preparedArrearsItems);
  const canonicalItems = alignItemsWithSchedule(normalizedItems, proratedSchedule);

  if (
    Array.isArray(preparedArrearsItems) &&
    preparedArrearsItems.length > 0 &&
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
    items: canonicalItems,
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
