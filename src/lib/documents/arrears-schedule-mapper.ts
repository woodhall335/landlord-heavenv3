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
 */
export function mapArrearsItemToEntry(item: ArrearsItem): ArrearsEntry {
  const amount_owed = item.amount_owed ?? (item.rent_due - item.rent_paid);

  // Format dates using UK legal format for document display
  const startFormatted = formatUkLegalDate(item.period_start) || item.period_start;
  const endFormatted = formatUkLegalDate(item.period_end) || item.period_end;

  return {
    period: `${startFormatted} to ${endFormatted}`,
    due_date: item.period_end,
    amount_due: item.rent_due,
    amount_paid: item.rent_paid,
    arrears: amount_owed,
  };
}

/**
 * Map all arrears items to document entries.
 */
export function mapArrearsItemsToEntries(items: ArrearsItem[]): ArrearsEntry[] {
  return (items || []).map(mapArrearsItemToEntry);
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
  include_schedule: boolean;
}): ArrearsScheduleData {
  const {
    arrears_items,
    total_arrears,
    rent_amount,
    rent_frequency,
    include_schedule,
  } = params;

  // Get authoritative arrears data from the engine
  const computed = getAuthoritativeArrears({
    arrears_items,
    total_arrears,
    rent_amount,
    rent_frequency,
  });

  // Map to document format
  const arrears_schedule = mapArrearsItemsToEntries(computed.arrears_items);

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
}): ParticularsText {
  const {
    arrears_items,
    total_arrears,
    rent_amount,
    rent_frequency,
    include_full_schedule = false,
  } = params;

  const scheduleData = getArrearsScheduleData({
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
 * Format arrears as a summary paragraph.
 * Uses UK legal date format for clarity.
 */
function formatArrearsSummary(data: ArrearsScheduleData): string {
  const { arrears_schedule, arrears_total, arrears_in_months } = data;

  if (arrears_schedule.length === 0) {
    return `No arrears schedule provided.`;
  }

  const periodsWithArrears = arrears_schedule.filter((p) => p.arrears > 0).length;

  // Extract first and last period dates for a cleaner summary
  // The period field is now formatted as "15 January 2026 to 14 February 2026"
  const firstPeriodStart = arrears_schedule[0].period.split(' to ')[0];
  const lastPeriodEnd = arrears_schedule[arrears_schedule.length - 1].period.split(' to ')[1];

  let summary = `Rent arrears of £${arrears_total.toFixed(2)} are outstanding `;
  summary += `(approximately ${arrears_in_months.toFixed(1)} months' rent). `;
  summary += `The arrears have accrued over ${periodsWithArrears} payment period(s), `;
  summary += `covering the period from ${firstPeriodStart} to ${lastPeriodEnd}. `;
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
