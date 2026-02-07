/**
 * Arrears Schedule Mapper
 *
 * This is the ONLY place where arrears_items are converted to document format.
 * All document generators MUST use this mapper - they MUST NOT compute arrears independently.
 *
 * Responsibilities:
 * - Accept canonical arrears_items
 * - Output money claim ArrearsEntry[]
 * - Derive totals once, centrally
 * - Be the only place arrears totals are calculated for documents
 *
 * @module arrears-schedule-mapper
 */

import type { ArrearsItem, CaseFacts, TenancyFacts } from '@/lib/case-facts/schema';
import type { ArrearsEntry } from './money-claim-pack-generator';
import {
  computeArrears,
  getAuthoritativeArrears,
  hasAuthoritativeArrearsData,
  type ComputedArrears,
} from '@/lib/arrears-engine';
import { formatUkLegalDate } from '@/lib/case-facts/normalize';

// ============================================================================
// TYPES
// ============================================================================

export interface ArrearsScheduleData {
  /** Formatted schedule for document templates */
  arrears_schedule: ArrearsEntry[];
  /** Total arrears (derived from schedule) */
  arrears_total: number;
  /** Arrears at notice date */
  arrears_at_notice_date: number | null;
  /** Arrears in months (for Ground 8 display) */
  arrears_in_months: number;
  /** Whether data is authoritative (from schedule) or legacy (flat total) */
  is_authoritative: boolean;
  /** Warning message if using legacy data */
  legacy_warning?: string;
  /** Whether schedule should be included in document pack */
  include_schedule_pdf: boolean;
}

export interface ParticularsText {
  /** Formatted particulars text for notices */
  particulars: string;
  /** Whether this is a full schedule or summary */
  is_summary: boolean;
  /** Total amount for display */
  total_amount: number;
}

// ============================================================================
// CORE MAPPING FUNCTIONS
// ============================================================================

/**
 * Convert ArrearsItem to ArrearsEntry for document templates.
 *
 * This is the ONLY place where this conversion should happen.
 * Uses UK legal date format (e.g., "15 January 2026") for document clarity.
 *
 * @param item - The arrears item to convert
 * @param rentDueDay - The day of month rent is due (1-31), from wizard tenancy 'Day rent is due'
 */
export function mapArrearsItemToEntry(item: ArrearsItem, rentDueDay?: number | null): ArrearsEntry {
  const amount_owed = item.amount_owed ?? (item.rent_due - item.rent_paid);

  // Format dates using UK legal format for document display
  const startFormatted = formatUkLegalDate(item.period_start) || item.period_start;
  const endFormatted = formatUkLegalDate(item.period_end) || item.period_end;

  // Compute the actual due date based on rent_due_day within the period
  let dueDate = item.period_end; // fallback to period_end if no rent_due_day
  if (rentDueDay && rentDueDay >= 1 && rentDueDay <= 31) {
    try {
      // Use the period_start's month/year and apply the rent_due_day
      const periodStart = new Date(item.period_start + 'T00:00:00.000Z');
      const year = periodStart.getUTCFullYear();
      const month = periodStart.getUTCMonth();
      // Clamp to last day of month if rent_due_day exceeds days in month
      const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      const actualDay = Math.min(rentDueDay, lastDayOfMonth);
      const dueDateObj = new Date(Date.UTC(year, month, actualDay));
      dueDate = dueDateObj.toISOString().split('T')[0];
    } catch {
      // Keep fallback on error
    }
  }

  const dueDateFormatted = formatUkLegalDate(dueDate) || dueDate;

  return {
    period: `${startFormatted} to ${endFormatted}`,
    due_date: dueDateFormatted,
    amount_due: item.rent_due,
    amount_paid: item.rent_paid,
    arrears: amount_owed,
    notes: item.notes || (item.is_pro_rated ? `Pro-rated (${item.days_in_period} days)` : undefined),
  };
}

/**
 * Map all arrears items to document entries with running balance.
 *
 * @param items - Array of arrears items to convert
 * @param rentDueDay - The day of month rent is due (1-31), from wizard tenancy 'Day rent is due'
 */
export function mapArrearsItemsToEntries(items: ArrearsItem[], rentDueDay?: number | null): ArrearsEntry[] {
  let runningBalance = 0;
  return (items || []).map((item) => {
    const entry = mapArrearsItemToEntry(item, rentDueDay);
    runningBalance += entry.arrears;
    return {
      ...entry,
      running_balance: Math.round(runningBalance * 100) / 100,
    };
  });
}

/**
 * Get complete arrears schedule data for documents.
 *
 * This is the primary function for document generators to use.
 * It provides all arrears data needed for templates.
 */
export function getArrearsScheduleData(params: {
  arrears_items?: ArrearsItem[];
  total_arrears?: number | null;
  rent_amount: number;
  rent_frequency: TenancyFacts['rent_frequency'];
  rent_due_day?: number | null;
  include_schedule: boolean;
}): ArrearsScheduleData {
  const {
    arrears_items,
    total_arrears,
    rent_amount,
    rent_frequency,
    rent_due_day,
    include_schedule,
  } = params;

  // Get authoritative arrears data from the engine
  const computed = getAuthoritativeArrears({
    arrears_items,
    total_arrears,
    rent_amount,
    rent_frequency,
  });

  // Map to document format, passing rent_due_day for proper due date computation
  const arrears_schedule = mapArrearsItemsToEntries(computed.arrears_items, rent_due_day);

  return {
    arrears_schedule,
    arrears_total: computed.total_arrears,
    arrears_at_notice_date: computed.arrears_at_notice_date,
    arrears_in_months: computed.arrears_in_months,
    is_authoritative: computed.is_authoritative,
    legacy_warning: computed.legacy_warning,
    include_schedule_pdf: include_schedule && arrears_schedule.length > 0,
  };
}

/**
 * Get arrears data from CaseFacts.
 *
 * Convenience function for document generators that have full CaseFacts.
 */
export function getArrearsScheduleFromFacts(
  facts: CaseFacts,
  options: {
    include_schedule?: boolean;
  } = {}
): ArrearsScheduleData {
  const { include_schedule = true } = options;

  return getArrearsScheduleData({
    arrears_items: facts.issues.rent_arrears.arrears_items,
    total_arrears: facts.issues.rent_arrears.total_arrears,
    rent_amount: facts.tenancy.rent_amount || 0,
    rent_frequency: facts.tenancy.rent_frequency,
    rent_due_day: facts.tenancy.rent_due_day,
    include_schedule,
  });
}

// ============================================================================
// PARTICULARS TEXT GENERATION
// ============================================================================

/**
 * Generate arrears particulars text for notices.
 *
 * This creates the formatted text for Ground 8/10/11 particulars on Section 8 notices.
 */
export function generateArrearsParticulars(params: {
  arrears_items?: ArrearsItem[];
  total_arrears?: number | null;
  rent_amount: number;
  rent_frequency: TenancyFacts['rent_frequency'];
  include_full_schedule?: boolean;
  schedule_data?: ArrearsScheduleData;
}): ParticularsText {
  const {
    arrears_items,
    total_arrears,
    rent_amount,
    rent_frequency,
    include_full_schedule = false,
    schedule_data,
  } = params;

  const scheduleData = schedule_data || getArrearsScheduleData({
    arrears_items,
    total_arrears,
    rent_amount,
    rent_frequency,
    include_schedule: true,
  });

  if (scheduleData.arrears_schedule.length === 0) {
    // No schedule data - use legacy total
    const amount = total_arrears || 0;
    return {
      particulars: `Rent arrears outstanding: £${amount.toFixed(2)}`,
      is_summary: true,
      total_amount: amount,
    };
  }

  if (!include_full_schedule) {
    // Summary format for notice
    return {
      particulars: formatArrearsSummary(scheduleData),
      is_summary: true,
      total_amount: scheduleData.arrears_total,
    };
  }

  // Full schedule format
  return {
    particulars: formatArrearsFullSchedule(scheduleData),
    is_summary: false,
    total_amount: scheduleData.arrears_total,
  };
}

/**
 * Format arrears as a month-by-month bullet list.
 * Uses UK legal date format for clarity.
 */
function formatArrearsSummary(data: ArrearsScheduleData): string {
  const { arrears_schedule, arrears_total, arrears_in_months } = data;

  if (arrears_schedule.length === 0) {
    return `No arrears schedule provided.`;
  }

  const periodsWithArrears = arrears_schedule.filter((p) => p.arrears > 0);

  // Header with total
  let summary = `Rent arrears of £${arrears_total.toFixed(2)} are outstanding `;
  summary += `(approximately ${arrears_in_months.toFixed(1)} months' rent):\n\n`;

  // Month-by-month bullet list
  for (const entry of periodsWithArrears) {
    // Extract period label (e.g., "1 January 2025 to 31 January 2025")
    const periodParts = entry.period.split(' to ');
    const periodLabel = periodParts.length === 2
      ? `${periodParts[0]} – ${periodParts[1]}`
      : entry.period;

    summary += `• ${periodLabel}: £${entry.arrears.toFixed(2)} outstanding`;
    summary += ` (due: £${entry.amount_due.toFixed(2)}, paid: £${entry.amount_paid.toFixed(2)})\n`;
  }

  summary += `\nTotal arrears: £${arrears_total.toFixed(2)}. `;
  summary += `A detailed schedule of arrears is attached.`;

  return summary;
}

/**
 * Format arrears as a full schedule table in text format.
 */
function formatArrearsFullSchedule(data: ArrearsScheduleData): string {
  const { arrears_schedule, arrears_total } = data;

  let text = 'SCHEDULE OF RENT ARREARS\n\n';
  text += 'Period                      | Due      | Paid     | Arrears\n';
  text += '---------------------------|----------|----------|----------\n';

  for (const entry of arrears_schedule) {
    const period = entry.period.padEnd(27);
    const due = `£${entry.amount_due.toFixed(2)}`.padStart(8);
    const paid = `£${entry.amount_paid.toFixed(2)}`.padStart(8);
    const arrears = `£${entry.arrears.toFixed(2)}`.padStart(8);
    text += `${period}| ${due} | ${paid} | ${arrears}\n`;
  }

  text += '---------------------------|----------|----------|----------\n';
  text += `TOTAL ARREARS:                                      £${arrears_total.toFixed(2)}\n`;

  return text;
}

/**
 * Generate arrears breakdown text for N119 and other court forms.
 */
export function generateArrearsBreakdownForCourt(params: {
  arrears_items?: ArrearsItem[];
  total_arrears?: number | null;
  rent_amount: number;
  rent_frequency: TenancyFacts['rent_frequency'];
}): string {
  const { arrears_items, total_arrears, rent_amount, rent_frequency } = params;

  const scheduleData = getArrearsScheduleData({
    arrears_items,
    total_arrears,
    rent_amount,
    rent_frequency,
    include_schedule: true,
  });

  if (!scheduleData.is_authoritative && scheduleData.legacy_warning) {
    // Include warning for legacy data
    return (
      `Rent arrears outstanding: £${scheduleData.arrears_total.toFixed(2)}\n\n` +
      `Note: ${scheduleData.legacy_warning}`
    );
  }

  return formatArrearsSummary(scheduleData);
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if arrears data should include a schedule PDF.
 */
export function shouldIncludeSchedulePdf(params: {
  arrears_items?: ArrearsItem[];
  has_arrears_grounds: boolean;
}): boolean {
  const { arrears_items, has_arrears_grounds } = params;

  // Only include if:
  // 1. Arrears grounds are selected
  // 2. We have actual schedule data
  return has_arrears_grounds && (arrears_items?.length ?? 0) > 0;
}

/**
 * Get legacy warning if applicable.
 */
export function getLegacyArrearsWarning(params: {
  arrears_items?: ArrearsItem[];
  total_arrears?: number | null;
}): string | null {
  const { arrears_items, total_arrears } = params;

  const hasSchedule = hasAuthoritativeArrearsData(arrears_items, total_arrears);

  if (!hasSchedule && total_arrears && total_arrears > 0) {
    return (
      'This case uses a legacy flat arrears total without detailed schedule data. ' +
      'For court proceedings, completing a detailed period-by-period schedule is strongly recommended.'
    );
  }

  return null;
}
