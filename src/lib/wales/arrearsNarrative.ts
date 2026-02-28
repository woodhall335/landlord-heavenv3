/**
 * Wales Section 157 Arrears Narrative Builder
 *
 * Generates Wales-specific narrative text for serious rent arrears notices
 * under the Renting Homes (Wales) Act 2016, Section 157.
 *
 * IMPORTANT: This module must NEVER reference:
 * - Housing Act 1988
 * - Section 8 / Ground 8
 * - Form 3 / Form 6A
 * - Any England-specific terminology
 *
 * All output must use Wales terminology:
 * - "Contract-holder" (not "tenant")
 * - "Occupation contract" (not "tenancy agreement")
 * - "Renting Homes (Wales) Act 2016" (not "Housing Act 1988")
 * - "Section 157" / "Section 159" (not "Section 8")
 */

import type { TenancyFacts, ArrearsItem } from '@/lib/case-facts/schema';
import { isWalesSection157ThresholdMet, calculateWalesArrearsInMonths } from './seriousArrearsThreshold';
import { computeArrears } from '@/lib/arrears-engine';

// ============================================================================
// TYPES
// ============================================================================

export interface WalesArrearsNarrativeParams {
  /** Total arrears amount in pounds */
  totalArrears: number;
  /** Number of rental periods with arrears (unpaid or part-paid) */
  unpaidPeriodCount: number;
  /** Rent amount per period */
  rentAmount: number;
  /** Rent payment frequency */
  rentFrequency: TenancyFacts['rent_frequency'];
  /** Day of period rent is due (e.g., 1 for 1st of month) */
  rentDueDay?: number;
  /** Date notice is being served (YYYY-MM-DD) */
  noticeServiceDate?: string;
  /** Whether this is Section 157 (serious) or Section 159 (other) arrears */
  isSerious: boolean;
  /** Whether threshold calculator confirms threshold is met */
  thresholdMet?: boolean;
  /** Optional arrears items for schedule reference */
  arrearsItems?: ArrearsItem[];
}

export interface WalesArrearsNarrativeResult {
  /** The generated narrative text */
  narrative: string;
  /** The section reference (157 or 159) */
  sectionRef: string;
  /** Whether threshold sentence was included */
  includesThresholdClaim: boolean;
  /** Warning if any issues with the narrative */
  warning?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format a date for display in narrative text.
 */
function formatDateForNarrative(dateStr: string | undefined): string {
  if (!dateStr) {
    return '[DATE NOT PROVIDED]';
  }
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return '[INVALID DATE]';
    }
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '[DATE ERROR]';
  }
}

/**
 * Get human-readable rent frequency label.
 */
function getRentFrequencyLabel(frequency: TenancyFacts['rent_frequency']): string {
  switch (frequency) {
    case 'weekly':
      return 'per week';
    case 'fortnightly':
      return 'per fortnight';
    case 'monthly':
      return 'per calendar month';
    case 'quarterly':
      return 'per quarter';
    case 'yearly':
      return 'per annum';
    default:
      return 'per period';
  }
}

/**
 * Get ordinal suffix for day number (1st, 2nd, 3rd, etc.).
 */
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/**
 * Format currency with thousand separators for UK locale.
 * Returns formatted number string (without £ symbol) e.g., "2,500.00"
 */
function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format rent due day for display.
 */
function formatRentDueDay(
  day: number | undefined,
  frequency: TenancyFacts['rent_frequency']
): string {
  if (!day || day < 1 || day > 31) {
    return '';
  }

  if (frequency === 'weekly' || frequency === 'fortnightly') {
    // For weekly, day might refer to day of week (1=Mon, 7=Sun)
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (day >= 1 && day <= 7) {
      return `every ${days[day - 1]}`;
    }
    return '';
  }

  // For monthly or longer, use day of month
  return `on the ${day}${getOrdinalSuffix(day)} of each payment period`;
}

// ============================================================================
// MAIN NARRATIVE BUILDER
// ============================================================================

/**
 * Build a Wales-specific arrears narrative for Section 157 or Section 159.
 *
 * This generates the standard text template for serious rent arrears notices
 * under the Renting Homes (Wales) Act 2016.
 *
 * The narrative NEVER includes:
 * - Housing Act 1988 references
 * - Section 8 / Ground 8 references
 * - Form 3 / Form 6A references
 * - Any England-specific terminology
 *
 * @param params - The narrative parameters
 * @returns The generated narrative with metadata
 */
export function buildWalesSection157ArrearsNarrative(
  params: WalesArrearsNarrativeParams
): WalesArrearsNarrativeResult {
  const {
    totalArrears,
    unpaidPeriodCount,
    rentAmount,
    rentFrequency,
    rentDueDay,
    noticeServiceDate,
    isSerious,
    thresholdMet,
    arrearsItems,
  } = params;

  const sectionRef = isSerious ? 'section 157' : 'section 159';
  const sectionNumber = isSerious ? '157' : '159';
  const frequencyLabel = getRentFrequencyLabel(rentFrequency);
  const formattedDate = formatDateForNarrative(noticeServiceDate);
  const dueDayText = formatRentDueDay(rentDueDay, rentFrequency);

  // Build the narrative parts
  const parts: string[] = [];

  // Opening statement with Wales Act reference
  if (isSerious) {
    parts.push(
      `The contract-holder is in serious rent arrears within the meaning of ${sectionRef} ` +
        'of the Renting Homes (Wales) Act 2016.'
    );
  } else {
    parts.push(
      `The contract-holder has rent arrears under ${sectionRef} ` +
        'of the Renting Homes (Wales) Act 2016.'
    );
  }

  // Arrears amount and period count
  parts.push(
    `As at ${formattedDate}, rent arrears total £${formatCurrency(totalArrears)}, ` +
      `arising from ${unpaidPeriodCount} rent period(s) that are unpaid or part-paid.`
  );

  // Rent terms
  let rentTerms = `The rent due is £${formatCurrency(rentAmount)} ${frequencyLabel}`;
  if (dueDayText) {
    rentTerms += `, payable ${dueDayText}`;
  }
  rentTerms += '.';
  parts.push(rentTerms);

  // Schedule reference
  parts.push(
    'A schedule of arrears is provided setting out each rent period, ' +
      'the amount due, payments received (if any), and the amount outstanding.'
  );

  // Threshold sentence - ONLY include if calculator confirms threshold is met
  let includesThresholdClaim = false;
  if (isSerious && thresholdMet === true) {
    parts.push(
      'The level of arrears meets the statutory threshold for serious rent arrears ' +
        'applicable to this occupation contract.'
    );
    includesThresholdClaim = true;
  } else if (isSerious && thresholdMet === false) {
    // If threshold is NOT met, add a neutral statement
    parts.push('A detailed arrears schedule is provided for review.');
  }
  // If thresholdMet is undefined, we don't claim anything about the threshold

  // Build warning if applicable
  let warning: string | undefined;
  if (isSerious && thresholdMet === undefined) {
    warning =
      'Threshold status unknown. Please verify that arrears meet the statutory threshold ' +
      'for Section 157 before serving notice.';
  }

  return {
    narrative: parts.join('\n\n'),
    sectionRef: `Section ${sectionNumber}`,
    includesThresholdClaim,
    warning,
  };
}

/**
 * Build Wales arrears narrative from arrears items and wizard facts.
 *
 * This is a convenience function that extracts data from arrears schedule
 * and calculates the threshold before building the narrative.
 *
 * @param arrearsItems - The arrears schedule items
 * @param rentAmount - Rent amount per period
 * @param rentFrequency - Rent payment frequency
 * @param noticeServiceDate - Date notice is being served
 * @param isSerious - Whether Section 157 (serious) or Section 159 (other)
 * @param rentDueDay - Optional day of period rent is due
 * @returns The generated narrative with metadata
 */
export function buildWalesArrearsNarrativeFromSchedule(
  arrearsItems: ArrearsItem[],
  rentAmount: number,
  rentFrequency: TenancyFacts['rent_frequency'],
  noticeServiceDate: string | undefined,
  isSerious: boolean,
  rentDueDay?: number
): WalesArrearsNarrativeResult {
  // Compute arrears from schedule
  const computed = computeArrears(arrearsItems, rentFrequency, rentAmount);

  // Check threshold for serious arrears
  let thresholdMet: boolean | undefined;
  if (isSerious && computed.total_arrears > 0) {
    const thresholdResult = isWalesSection157ThresholdMet(
      computed.total_arrears,
      rentFrequency,
      rentAmount
    );
    thresholdMet = thresholdResult.met;
  }

  // Count periods with arrears (fully unpaid + partially paid)
  const unpaidPeriodCount = computed.periods_fully_unpaid + computed.periods_partially_paid;

  return buildWalesSection157ArrearsNarrative({
    totalArrears: computed.total_arrears,
    unpaidPeriodCount,
    rentAmount,
    rentFrequency,
    rentDueDay,
    noticeServiceDate,
    isSerious,
    thresholdMet,
    arrearsItems,
  });
}

/**
 * Generate a quick summary for Wales arrears (used by Quick Start button).
 *
 * This produces a concise Wales-specific summary suitable for the breach
 * description field, without claiming threshold status unless verified.
 *
 * @param totalArrears - Total arrears amount
 * @param arrearsInMonths - Arrears expressed in months
 * @param periodsFullyUnpaid - Number of fully unpaid periods
 * @param isSerious - Whether Section 157 (serious) or Section 159 (other)
 * @param thresholdMet - Whether threshold calculator confirms threshold is met
 * @returns Formatted summary text
 */
export function generateWalesArrearsSummary(
  totalArrears: number,
  arrearsInMonths: number,
  periodsFullyUnpaid: number,
  isSerious: boolean,
  thresholdMet?: boolean
): string {
  const sectionRef = isSerious ? 'Section 157' : 'Section 159';

  let summary = `RENT ARREARS (${sectionRef}):\n`;
  summary += `The contract-holder owes £${formatCurrency(totalArrears)} in rent arrears, `;
  summary += `representing ${arrearsInMonths.toFixed(1)} months of unpaid rent. `;

  if (periodsFullyUnpaid > 0) {
    summary += `There are ${periodsFullyUnpaid} rental period(s) that are fully unpaid. `;
  }

  if (isSerious && thresholdMet === true) {
    summary += `This meets the threshold for serious arrears under Section 157 of the Renting Homes (Wales) Act 2016.`;
  } else if (isSerious && thresholdMet === false) {
    summary += `The arrears are documented under the Renting Homes (Wales) Act 2016. A detailed schedule is provided.`;
  } else if (!isSerious) {
    summary += `This constitutes rent arrears under Section 159 of the Renting Homes (Wales) Act 2016.`;
  }

  return summary;
}
