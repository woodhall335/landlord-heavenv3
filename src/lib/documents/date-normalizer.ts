/**
 * Date Normalizer for Document Rendering
 *
 * Transforms ISO date strings (YYYY-MM-DD) into UK format before template rendering.
 * This ensures human-facing documents never display raw ISO dates.
 *
 * Strategy:
 * - All fields ending with *_date are formatted to UK long format (e.g., "1 January 2026")
 * - Fields ending with *_date_iso are left as ISO (for machine-readable contexts)
 * - Formatted values are stored alongside originals with *_formatted suffix
 * - Arrays and nested objects are processed recursively
 *
 * This runs BEFORE template compilation, so templates receive pre-formatted values.
 */

// ISO date pattern: YYYY-MM-DD (optionally with time component)
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}.*)?$/;

/**
 * Parse a YYYY-MM-DD date string as a local date to avoid timezone off-by-one issues.
 */
function parseLocalDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Handle YYYY-MM-DD format explicitly as local time
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  }

  return null;
}

/**
 * Format a Date object to UK long format: "1 January 2026"
 */
function formatUKLong(date: Date): string {
  const day = date.getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Format a Date object to UK short format: "01/01/2026"
 */
function formatUKShort(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Check if a string looks like an ISO date
 */
function isISODateString(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE_PATTERN.test(value);
}

/**
 * Keys that should remain in ISO format (machine-readable contexts)
 */
const MACHINE_DATE_KEYS = new Set([
  // Internal/API fields
  'created_at',
  'updated_at',
  'deleted_at',
  'timestamp',
  'generation_timestamp',
  // Fields explicitly marked as ISO
  // (any field ending in _iso will also be preserved)
]);

/**
 * Keys that should use short DD/MM/YYYY format instead of long format
 */
const SHORT_FORMAT_KEYS = new Set([
  // Tabular data fields that benefit from compact format
  'date',        // Generic date in arrays (e.g., rent ledger)
  'due_date',
  'payment_date',
]);

/**
 * Determine if a key should preserve ISO format
 */
function shouldPreserveISO(key: string): boolean {
  // Explicit ISO suffix
  if (key.endsWith('_iso')) return true;

  // Known machine-readable fields
  if (MACHINE_DATE_KEYS.has(key)) return true;

  return false;
}

/**
 * Determine if a key should use short format
 */
function shouldUseShortFormat(key: string): boolean {
  return SHORT_FORMAT_KEYS.has(key);
}

/**
 * Normalize a single date value
 */
function normalizeDate(value: string, key: string): { formatted: string; original: string } {
  const date = parseLocalDate(value);

  if (!date || isNaN(date.getTime())) {
    // Return original if unparseable
    return { formatted: value, original: value };
  }

  const formatted = shouldUseShortFormat(key)
    ? formatUKShort(date)
    : formatUKLong(date);

  return { formatted, original: value };
}

/**
 * Recursively process an object, normalizing all date fields.
 *
 * For each field ending with *_date that contains an ISO string:
 * - The original value is preserved
 * - A new field *_formatted is added with the UK-formatted value
 * - The original field is ALSO replaced with the formatted value (for direct template use)
 *
 * @param data - The data object to normalize
 * @param depth - Current recursion depth (to prevent infinite loops)
 * @returns Normalized data with formatted dates
 */
export function normalizeDatesForRender<T extends Record<string, unknown>>(
  data: T,
  depth: number = 0
): T {
  // Prevent infinite recursion
  if (depth > 10) return data;

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip null/undefined
    if (value === null || value === undefined) {
      result[key] = value;
      continue;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return normalizeDatesForRender(item as Record<string, unknown>, depth + 1);
        }
        return item;
      });
      continue;
    }

    // Handle nested objects (but not Date objects)
    if (typeof value === 'object' && !(value instanceof Date)) {
      result[key] = normalizeDatesForRender(value as Record<string, unknown>, depth + 1);
      continue;
    }

    // Check if this is a date field with an ISO string
    if (key.endsWith('_date') && isISODateString(value)) {
      // Check if this should remain ISO
      if (shouldPreserveISO(key)) {
        result[key] = value;
        continue;
      }

      // Normalize the date
      const { formatted, original } = normalizeDate(value, key);

      // Store both the formatted value AND add a _formatted suffix variant
      result[key] = formatted;
      result[`${key}_formatted`] = formatted;
      result[`${key}_iso`] = original;
      continue;
    }

    // Check for standalone 'date' field in arrays (e.g., rent ledger rows)
    if (key === 'date' && isISODateString(value)) {
      const { formatted } = normalizeDate(value, key);
      result[key] = formatted;
      continue;
    }

    // Pass through non-date fields unchanged
    result[key] = value;
  }

  return result as T;
}

/**
 * Format a single date string to UK format.
 * Useful for one-off formatting in generators.
 *
 * @param dateStr - ISO date string (YYYY-MM-DD)
 * @param format - 'long' for "1 January 2026" or 'short' for "01/01/2026"
 * @returns Formatted date string, or original if invalid
 */
export function formatDateUK(
  dateStr: string | undefined | null,
  format: 'long' | 'short' = 'long'
): string {
  if (!dateStr) return '';

  const date = parseLocalDate(dateStr);
  if (!date || isNaN(date.getTime())) {
    return dateStr;
  }

  return format === 'short' ? formatUKShort(date) : formatUKLong(date);
}

/**
 * Check if a rendered HTML/text contains any ISO dates (YYYY-MM-DD pattern)
 * Useful for validation/testing.
 *
 * @param content - The rendered content to check
 * @returns Array of ISO date matches found
 */
export function findISODatesInContent(content: string): string[] {
  const matches = content.match(/\b(19|20)\d{2}-\d{2}-\d{2}\b/g);
  return matches || [];
}

export default normalizeDatesForRender;
