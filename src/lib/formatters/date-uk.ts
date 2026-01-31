/**
 * UK Date Formatting Utility
 *
 * SINGLE SOURCE OF TRUTH for UK date formatting across all tenancy agreements,
 * PDF generators, and document templates.
 *
 * This module ensures consistent date formatting across:
 * - England Standard + Premium (AST)
 * - Wales Standard + Premium (Occupation Contract)
 * - Scotland Standard (PRT)
 * - All shared generators and utilities
 *
 * UK Legal Document Format: "D Month YYYY" (e.g., "1 February 2026")
 * - No leading zeros on day
 * - Full month name
 * - Four-digit year
 *
 * @module formatters/date-uk
 */

/**
 * UK months in full (used for manual formatting)
 */
const UK_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Parse a date string in YYYY-MM-DD format as a LOCAL date (not UTC).
 *
 * CRITICAL: Using `new Date('YYYY-MM-DD')` parses as UTC, which can shift
 * the date backward in non-UTC timezones. This function always interprets
 * YYYY-MM-DD as local time to prevent off-by-one errors.
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object in local time, or null if invalid/empty
 *
 * @example
 * parseLocalDate('2026-02-01') // Returns Date for Feb 1, 2026 in local time
 * parseLocalDate('invalid') // Returns null
 * parseLocalDate('') // Returns null
 */
export function parseLocalDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }

  // Trim whitespace
  const trimmed = dateStr.trim();
  if (!trimmed) {
    return null;
  }

  // Handle YYYY-MM-DD format explicitly as local time
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    return isNaN(d.getTime()) ? null : d;
  }

  // Handle DD/MM/YYYY format (common UK input format)
  const ukMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ukMatch) {
    const [, day, month, year] = ukMatch;
    const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    return isNaN(d.getTime()) ? null : d;
  }

  // Handle Date objects passed as strings (ISO format with time)
  if (trimmed.includes('T') || trimmed.includes('Z')) {
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }

  // Fallback: try native parsing
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format a date value to UK legal document format: "D Month YYYY"
 *
 * This is the PRIMARY date formatting function for all tenancy agreements.
 * Use this for:
 * - Agreement dates
 * - Tenancy start/end dates
 * - Dates of birth
 * - Right to Rent check dates
 * - Certificate expiry dates
 * - Any date appearing in legal documents
 *
 * @param date - Date value (Date object, YYYY-MM-DD string, DD/MM/YYYY string, or ISO timestamp)
 * @returns Formatted string like "1 February 2026", or empty string for invalid/null dates
 *
 * @example
 * formatUKDateLong('2026-02-01') // "1 February 2026"
 * formatUKDateLong(new Date(2026, 1, 1)) // "1 February 2026"
 * formatUKDateLong('01/02/2026') // "1 February 2026"
 * formatUKDateLong(null) // ""
 * formatUKDateLong('invalid') // ""
 */
export function formatUKDateLong(date: Date | string | null | undefined): string {
  // Handle null/undefined/empty - return empty string
  if (date === null || date === undefined || date === '') {
    return '';
  }

  let d: Date;

  if (date instanceof Date) {
    d = date;
  } else if (typeof date === 'string') {
    const parsed = parseLocalDate(date);
    if (!parsed) {
      return '';
    }
    d = parsed;
  } else {
    return '';
  }

  // Validate the date
  if (isNaN(d.getTime())) {
    return '';
  }

  // Format: "D Month YYYY" (no leading zero on day)
  const day = d.getDate();
  const month = UK_MONTHS[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Format a date value to short UK format: "DD/MM/YYYY"
 *
 * Use for compact displays, tables, or where space is limited.
 * Prefer formatUKDateLong for legal document text.
 *
 * @param date - Date value (Date object or string)
 * @returns Formatted string like "01/02/2026", or empty string for invalid
 *
 * @example
 * formatUKDateShort('2026-02-01') // "01/02/2026"
 * formatUKDateShort(new Date(2026, 1, 1)) // "01/02/2026"
 */
export function formatUKDateShort(date: Date | string | null | undefined): string {
  if (date === null || date === undefined || date === '') {
    return '';
  }

  let d: Date;

  if (date instanceof Date) {
    d = date;
  } else if (typeof date === 'string') {
    const parsed = parseLocalDate(date);
    if (!parsed) {
      return '';
    }
    d = parsed;
  } else {
    return '';
  }

  if (isNaN(d.getTime())) {
    return '';
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Check if a string is in ISO date format (YYYY-MM-DD)
 *
 * Use this in tests to detect unformatted dates that should have been
 * processed through formatUKDateLong.
 *
 * @param str - String to check
 * @returns true if string matches YYYY-MM-DD pattern
 *
 * @example
 * isISODateFormat('2026-02-01') // true
 * isISODateFormat('1 February 2026') // false
 * isISODateFormat('01/02/2026') // false
 */
export function isISODateFormat(str: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(str);
}

/**
 * Regular expression to detect ISO date formats in generated documents.
 * Use in tests to ensure no raw ISO dates appear in PDFs.
 *
 * Matches patterns like:
 * - 2026-02-01
 * - 2026-12-31
 *
 * Does NOT match:
 * - ISO timestamps with time (2026-02-01T12:00:00)
 * - Partial matches in longer strings
 */
export const ISO_DATE_REGEX = /\b\d{4}-\d{2}-\d{2}\b/g;

/**
 * Check if any ISO dates exist in a string (for validation/testing)
 *
 * @param text - Text to search
 * @returns Array of ISO date strings found, or empty array if none
 *
 * @example
 * findISODates('Start: 2026-02-01, End: 2026-08-01') // ['2026-02-01', '2026-08-01']
 * findISODates('Start: 1 February 2026') // []
 */
export function findISODates(text: string): string[] {
  const matches = text.match(ISO_DATE_REGEX);
  return matches || [];
}

/**
 * Format a date with a fallback placeholder for missing data.
 *
 * Use this for fields that MUST have a value in the final document.
 * Returns "TO BE COMPLETED BEFORE SIGNING" if the date is missing.
 *
 * @param date - Date value or null/undefined
 * @param fieldName - Optional field name for the placeholder
 * @returns Formatted date or placeholder text
 *
 * @example
 * formatUKDateOrPlaceholder('2026-02-01') // "1 February 2026"
 * formatUKDateOrPlaceholder(null) // "TO BE COMPLETED BEFORE SIGNING"
 * formatUKDateOrPlaceholder(null, 'Start Date') // "[Start Date: TO BE COMPLETED BEFORE SIGNING]"
 */
export function formatUKDateOrPlaceholder(
  date: Date | string | null | undefined,
  fieldName?: string
): string {
  const formatted = formatUKDateLong(date);

  if (formatted) {
    return formatted;
  }

  if (fieldName) {
    return `[${fieldName}: TO BE COMPLETED BEFORE SIGNING]`;
  }

  return 'TO BE COMPLETED BEFORE SIGNING';
}

/**
 * Get current date formatted for UK legal documents.
 *
 * @returns Current date in "D Month YYYY" format
 *
 * @example
 * getCurrentUKDate() // "31 January 2026" (on Jan 31, 2026)
 */
export function getCurrentUKDate(): string {
  return formatUKDateLong(new Date());
}

// Default export for convenience
export default {
  formatUKDateLong,
  formatUKDateShort,
  parseLocalDate,
  isISODateFormat,
  findISODates,
  formatUKDateOrPlaceholder,
  getCurrentUKDate,
  ISO_DATE_REGEX,
};
