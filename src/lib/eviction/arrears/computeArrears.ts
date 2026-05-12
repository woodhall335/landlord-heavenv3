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
    const fullPeriodDays = daysInclusiveUTC(start, fullEnd);
    const rentDue = rentAmount;
    const rentPaid = Math.min(roundToPennies(Number(item.rent_paid) || 0), rentDue);
    const shouldInclude = !scheduleEnd || start <= scheduleEnd;

    return {
      item,
      start,
      end: fullEnd,
      fullPeriodDays,
      rentDue,
      rentPaid,
      shouldInclude,
    };
  });

  const isGeneratedMonthlyShape = expected.every(({ item, start, end }, index) => {
    const actualStart = parseISODateUTC(item.period_start);
    const actualEnd = parseISODateUTC(item.period_end);
    if (!actualStart || !actualEnd) return false;

    const startDrift = Math.abs(daysInclusiveUTC(actualStart < start ? actualStart : start, actualStart < start ? start : actualStart) - 1);
    const endDrift = Math.abs(daysInclusiveUTC(actualEnd < end ? actualEnd : end, actualEnd < end ? end : actualEnd) - 1);
    const scheduleEndDrift = scheduleEnd
      ? Math.abs(daysInclusiveUTC(actualEnd < scheduleEnd ? actualEnd : scheduleEnd, actualEnd < scheduleEnd ? scheduleEnd : actualEnd) - 1)
      : Number.POSITIVE_INFINITY;
    const isTruncatedFinalPeriod = Boolean(
      index === expected.length - 1 &&
      scheduleEnd &&
      actualEnd >= start &&
      actualEnd <= end &&
      scheduleEndDrift <= 2
    );

    return index === 0 || (startDrift <= 2 && (endDrift <= 2 || isTruncatedFinalPeriod));
  });

  if (!isGeneratedMonthlyShape) {
    return items;
  }

  return expected.filter(({ shouldInclude }) => shouldInclude).map(({ item, start, end, fullPeriodDays, rentDue, rentPaid }) => ({
    ...item,
    period_start: formatISODateUTC(start),
    period_end: formatISODateUTC(end),
    rent_due: rentDue,
    rent_paid: rentPaid,
    amount_owed: roundToPennies(rentDue - rentPaid),
    is_pro_rated: undefined,
    days_in_period: fullPeriodDays,
    notes: item.notes && /pro-?rated|pro rata/i.test(item.notes) ? undefined : item.notes,
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
    return {
      ...item,
      rent_due: rentDue,
      rent_paid: rentPaid,
      amount_owed: amountOwed,
      is_pro_rated: undefined,
      notes: (entry.notes || item.notes) && /pro-?rated|pro rata/i.test(entry.notes || item.notes || '')
        ? undefined
        : entry.notes || item.notes,
    };
  });
}

/**
 * Preserve full-period arrears schedules.
 *
 * Kept as a compatibility export for callers/tests that imported the old helper.
 * Rent due in advance is no longer prorated merely because a notice date falls
 * before the end of a started rental period.
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
  void rentAmount;
  void rentFrequency;
  void scheduleEndDate;
  return schedule;
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

  const canonicalSchedule = baseSchedule;
  const canonicalTotal = baseTotal;
  const arrearsInMonths = calculateArrearsInMonths(canonicalTotal, rent_amount, rent_frequency);
  const normalizedItems = normalizeArrearsItems(preparedArrearsItems);
  const canonicalItems = alignItemsWithSchedule(normalizedItems, canonicalSchedule);

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
    schedule: canonicalSchedule,
    total: canonicalTotal,
    totalFormatted: formatCurrency(canonicalTotal),
    arrearsAtNoticeDate: canonicalTotal,
    arrearsInMonths,
    hasProrating: false,
    isAuthoritative: scheduleData.is_authoritative,
    legacyWarning: scheduleData.legacy_warning,
    scheduleData: {
      ...scheduleData,
      arrears_schedule: canonicalSchedule,
      arrears_total: canonicalTotal,
      arrears_in_months: arrearsInMonths,
      include_schedule_pdf: scheduleData.include_schedule_pdf && canonicalSchedule.length > 0,
    },
  };
}
