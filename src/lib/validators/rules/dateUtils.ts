/**
 * Date Utilities for Legal Validation
 *
 * Provides robust UK date parsing and legal notice period calculations.
 * Handles various date formats commonly found in legal documents.
 */

/**
 * Parse a UK date string into a Date object.
 * Handles multiple formats:
 * - DD/MM/YYYY
 * - DD-MM-YYYY
 * - DD.MM.YYYY
 * - DD Month YYYY (e.g., "15 January 2025")
 * - YYYY-MM-DD (ISO format)
 *
 * Returns null if parsing fails.
 */
export function parseUKDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }

  const trimmed = dateStr.trim();
  if (!trimmed) {
    return null;
  }

  // Try ISO format first (YYYY-MM-DD)
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    if (isValidDate(date)) {
      return date;
    }
  }

  // Try DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY formats
  const ukMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (ukMatch) {
    const [, day, month, year] = ukMatch;
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    if (isValidDate(date)) {
      return date;
    }
  }

  // Try "DD Month YYYY" format
  const monthNames: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
    jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
  };

  const textMatch = trimmed.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/i);
  if (textMatch) {
    const [, day, monthText, year] = textMatch;
    const monthIndex = monthNames[monthText.toLowerCase()];
    if (monthIndex !== undefined) {
      const date = new Date(parseInt(year, 10), monthIndex, parseInt(day, 10));
      if (isValidDate(date)) {
        return date;
      }
    }
  }

  // Try "Month DD, YYYY" format (US style sometimes found in documents)
  const usMatch = trimmed.match(/^([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})$/i);
  if (usMatch) {
    const [, monthText, day, year] = usMatch;
    const monthIndex = monthNames[monthText.toLowerCase()];
    if (monthIndex !== undefined) {
      const date = new Date(parseInt(year, 10), monthIndex, parseInt(day, 10));
      if (isValidDate(date)) {
        return date;
      }
    }
  }

  return null;
}

/**
 * Check if a Date object is valid (not NaN)
 */
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Format a date as DD/MM/YYYY (UK format)
 */
export function formatUKDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Check if the notice period is at least 2 calendar months.
 *
 * LEGAL RULE (Section 21, Housing Act 1988 as amended):
 * Notice must give at least 2 months' notice. This is calculated as
 * calendar months, not 60 days. The expiry date must be at least
 * 2 full calendar months after the service date.
 *
 * Example:
 * - Service: 15 January 2025
 * - Minimum expiry: 15 March 2025 (exactly 2 months later)
 *
 * Returns:
 * - { valid: true } if notice period is sufficient
 * - { valid: false, message: string } if insufficient
 * - { valid: null, message: string } if dates cannot be parsed
 */
export function checkTwoMonthNoticePeriod(
  serviceDate: string | Date | null | undefined,
  expiryDate: string | Date | null | undefined
): { valid: boolean | null; message: string; minimumExpiry?: Date } {
  const service = serviceDate instanceof Date ? serviceDate : parseUKDate(serviceDate as string);
  const expiry = expiryDate instanceof Date ? expiryDate : parseUKDate(expiryDate as string);

  if (!service) {
    return { valid: null, message: 'Service date could not be parsed' };
  }
  if (!expiry) {
    return { valid: null, message: 'Expiry date could not be parsed' };
  }

  // Calculate minimum expiry date (2 calendar months from service)
  const minimumExpiry = addCalendarMonths(service, 2);

  // Expiry must be on or after the minimum expiry date
  if (expiry >= minimumExpiry) {
    return {
      valid: true,
      message: `Notice period is valid (expires ${formatUKDate(expiry)}, minimum required ${formatUKDate(minimumExpiry)})`,
      minimumExpiry,
    };
  }

  return {
    valid: false,
    message: `Notice period too short. Served ${formatUKDate(service)}, expires ${formatUKDate(expiry)}, but minimum 2 months requires expiry on or after ${formatUKDate(minimumExpiry)}`,
    minimumExpiry,
  };
}

/**
 * Add calendar months to a date.
 *
 * Handles month-end edge cases:
 * - 31 January + 1 month = 28/29 February (last day of month)
 * - 30 January + 1 month = 28/29 February (last day of month)
 */
export function addCalendarMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const targetMonth = result.getMonth() + months;
  const targetYear = result.getFullYear() + Math.floor(targetMonth / 12);
  const adjustedMonth = ((targetMonth % 12) + 12) % 12;

  result.setFullYear(targetYear);
  result.setMonth(adjustedMonth);

  // Handle month-end edge cases (e.g., Jan 31 + 1 month should be Feb 28/29)
  // If the day of month doesn't exist in target month, use last day of target month
  if (result.getDate() !== date.getDate()) {
    // Roll back to last day of previous month
    result.setDate(0);
  }

  return result;
}

/**
 * Calculate the number of full calendar months between two dates.
 */
export function monthsBetween(startDate: Date, endDate: Date): number {
  const years = endDate.getFullYear() - startDate.getFullYear();
  const months = endDate.getMonth() - startDate.getMonth();
  let totalMonths = years * 12 + months;

  // Adjust if end day is before start day
  if (endDate.getDate() < startDate.getDate()) {
    totalMonths -= 1;
  }

  return totalMonths;
}

/**
 * Calculate the number of days between two dates.
 */
export function daysBetween(startDate: Date, endDate: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay);
}

/**
 * Check if date A is on or after date B.
 */
export function isOnOrAfter(dateA: Date, dateB: Date): boolean {
  return dateA.getTime() >= dateB.getTime();
}

/**
 * Check if date A is before date B.
 */
export function isBefore(dateA: Date, dateB: Date): boolean {
  return dateA.getTime() < dateB.getTime();
}

/**
 * Get today's date at midnight (start of day).
 */
export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Check if a date is in the past (before today).
 */
export function isInPast(date: Date): boolean {
  return isBefore(date, today());
}

/**
 * Check if a date is in the future (after today).
 */
export function isInFuture(date: Date): boolean {
  return date.getTime() > today().getTime();
}

/**
 * Calculate Ground 8 arrears threshold based on rent frequency.
 *
 * LEGAL RULE (Schedule 2, Ground 8, Housing Act 1988):
 * At the time of service AND at the hearing, rent must be unpaid for:
 * - Weekly rent: at least 8 weeks
 * - Fortnightly rent: at least 4 fortnights (8 weeks)
 * - Monthly rent: at least 2 months
 * - Quarterly rent: at least one quarter (3 months) - but 2 months threshold commonly used
 * - Yearly rent: at least 3 months (but 2 months threshold commonly used)
 *
 * Returns the threshold amount that arrears must meet or exceed.
 */
export function calculateGround8Threshold(
  rentAmount: number,
  frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly' | string
): { threshold: number; description: string } | null {
  if (!rentAmount || rentAmount <= 0) {
    return null;
  }

  const freq = frequency.toLowerCase();

  switch (freq) {
    case 'weekly':
      return {
        threshold: rentAmount * 8,
        description: 'at least 8 weeks rent',
      };
    case 'fortnightly':
      return {
        threshold: rentAmount * 4,
        description: 'at least 4 fortnightly payments (8 weeks)',
      };
    case 'monthly':
      return {
        threshold: rentAmount * 2,
        description: 'at least 2 months rent',
      };
    case 'quarterly':
      // Conservative: use 2 months equivalent even though technically 1 quarter
      return {
        threshold: (rentAmount / 3) * 2,
        description: 'at least 2 months rent equivalent',
      };
    case 'yearly':
    case 'annual':
      // 2 months of annual rent
      return {
        threshold: (rentAmount / 12) * 2,
        description: 'at least 2 months rent equivalent',
      };
    default:
      return null;
  }
}

/**
 * Check if Ground 8 arrears threshold is satisfied.
 */
export function isGround8Satisfied(
  arrearsAmount: number,
  rentAmount: number,
  frequency: string
): { satisfied: boolean; threshold: number; description: string } | null {
  const thresholdResult = calculateGround8Threshold(rentAmount, frequency);
  if (!thresholdResult) {
    return null;
  }

  return {
    satisfied: arrearsAmount >= thresholdResult.threshold,
    threshold: thresholdResult.threshold,
    description: thresholdResult.description,
  };
}
