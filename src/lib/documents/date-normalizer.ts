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

/**
 * Patterns that should be EXCLUDED from ISO date replacement.
 * These are machine-readable contexts where ISO format is expected.
 */
const ISO_EXCLUDE_PATTERNS = [
  // JSON data blocks (e.g., <script type="application/json">)
  /<script[^>]*type\s*=\s*["']application\/json["'][^>]*>[\s\S]*?<\/script>/gi,
  // HTML data attributes (e.g., data-date="2026-01-15")
  /data-[a-z-]+\s*=\s*["'][^"']*\d{4}-\d{2}-\d{2}[^"']*["']/gi,
  // datetime attributes (e.g., datetime="2026-01-15")
  /datetime\s*=\s*["']\d{4}-\d{2}-\d{2}[^"']*["']/gi,
  // ISO timestamp attributes (e.g., data-timestamp="2026-01-15T10:30:00")
  /data-timestamp\s*=\s*["'][^"']*["']/gi,
];

/**
 * Sanitize HTML content by replacing visible ISO dates with UK formatted dates.
 * This is a final safeguard to catch any ISO dates that slip through normalization.
 *
 * IMPORTANT: This function ONLY replaces ISO dates in visible text content.
 * It preserves ISO dates in:
 * - JSON script blocks
 * - HTML data-* attributes
 * - datetime attributes (accessibility)
 *
 * @param html - The HTML content to sanitize
 * @param options - Options for the sanitizer
 * @returns Sanitized HTML with ISO dates replaced
 */
export function sanitizeISODatesInHTML(
  html: string,
  options?: {
    /** If true, throw an error when ISO dates are found instead of replacing */
    throwOnFound?: boolean;
    /** Document type identifier for error messages */
    documentType?: string;
  }
): { html: string; replacements: Array<{ iso: string; uk: string; context: string }> } {
  const replacements: Array<{ iso: string; uk: string; context: string }> = [];

  // First, identify regions to exclude from replacement
  const exclusionRanges: Array<{ start: number; end: number }> = [];

  for (const pattern of ISO_EXCLUDE_PATTERNS) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(html)) !== null) {
      exclusionRanges.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  // Function to check if a position is within an exclusion range
  const isExcluded = (pos: number): boolean => {
    return exclusionRanges.some(range => pos >= range.start && pos < range.end);
  };

  // Find all ISO dates and their positions
  const isoPattern = /\b(19|20)(\d{2})-(\d{2})-(\d{2})\b/g;
  let result = html;
  let offset = 0;
  let match;

  // Reset regex
  isoPattern.lastIndex = 0;

  while ((match = isoPattern.exec(html)) !== null) {
    // Check if this match is in an excluded region
    if (isExcluded(match.index)) {
      continue;
    }

    const isoDate = match[0];
    const century = match[1];
    const year = match[2];
    const monthStr = match[3];
    const dayStr = match[4];

    // Parse and format to UK
    const fullYear = century + year;
    const monthNum = parseInt(monthStr, 10);
    const dayNum = parseInt(dayStr, 10);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const ukDate = `${dayNum} ${monthNames[monthNum - 1]} ${fullYear}`;

    // Get context (surrounding text for logging)
    const contextStart = Math.max(0, match.index - 20);
    const contextEnd = Math.min(html.length, match.index + isoDate.length + 20);
    const context = html.substring(contextStart, contextEnd).replace(/\n/g, ' ').trim();

    replacements.push({ iso: isoDate, uk: ukDate, context });

    // Replace in result (accounting for offset from previous replacements)
    const posInResult = match.index + offset;
    result = result.substring(0, posInResult) + ukDate + result.substring(posInResult + isoDate.length);

    // Update offset for next replacement (UK date is longer than ISO date)
    offset += ukDate.length - isoDate.length;
  }

  // If throwOnFound is true and we found ISO dates, throw an error
  if (options?.throwOnFound && replacements.length > 0) {
    const docType = options.documentType || 'unknown';
    const examples = replacements.slice(0, 3).map(r => `${r.iso} → ${r.uk}`).join(', ');
    throw new Error(
      `ISO_DATE_LEAK_DETECTED: Found ${replacements.length} ISO date(s) in ${docType} document. ` +
      `Examples: ${examples}. This indicates a date normalization gap.`
    );
  }

  // Log replacements in development
  if (replacements.length > 0 && (process.env.NODE_ENV === 'development' || process.env.DATE_SANITIZE_DEBUG === '1')) {
    console.warn(
      `[DATE_SANITIZER] Replaced ${replacements.length} ISO date(s) in HTML:`,
      replacements.map(r => `${r.iso} → ${r.uk}`)
    );
  }

  return { html: result, replacements };
}

/**
 * Known date field labels that appear in document templates.
 * Used to detect blank date fields in rendered HTML.
 */
const DATE_FIELD_LABELS = [
  'Tenancy Start Date',
  'Contract Start Date',
  'Service Date',
  'Notice Date',
  'Expiry Date',
  'Generated',
  'Audit Date',
  'Assessment Date',
  'Date Signed',
  'Protection Date',
  'Gas Certificate Expiry',
  'EPC Expires',
];

/**
 * Detect blank date fields in rendered HTML.
 * A blank date field is where a STRUCTURED label like "Tenancy Start Date:" exists
 * but the corresponding value is empty or whitespace-only.
 *
 * This catches cases where:
 * - <dt>Label:</dt><dd></dd> (empty definition list)
 * - <p><strong>Label:</strong></p> (empty paragraph with strong label)
 *
 * IMPORTANT: Only detects STRUCTURED field patterns, not prose text.
 * For example, "wait until the expiry date:" in a sentence is NOT a blank field.
 *
 * @param html - The rendered HTML to check
 * @returns Array of blank field labels found
 */
export function findBlankDateFields(html: string): string[] {
  const blankFields: string[] = [];

  for (const label of DATE_FIELD_LABELS) {
    // Pattern 1: <dt>Label:</dt><dd></dd> or <dt>Label:</dt><dd>   </dd>
    // This is a structured definition list field
    const dtDdPattern = new RegExp(
      `<dt[^>]*>\\s*${escapeRegex(label)}[:\\s]*<\\/dt>\\s*<dd[^>]*>\\s*<\\/dd>`,
      'gi'
    );
    if (dtDdPattern.test(html)) {
      blankFields.push(label);
      continue;
    }

    // Pattern 2: <p><strong>Label:</strong></p> or <p><strong>Label:</strong> </p>
    // This is a structured paragraph with a strong label but no value
    // Must be at the START of a paragraph to distinguish from prose text
    const pStrongPattern = new RegExp(
      `<p[^>]*>\\s*<strong[^>]*>\\s*${escapeRegex(label)}[:\\s]*<\\/strong>\\s*<\\/p>`,
      'gi'
    );
    if (pStrongPattern.test(html)) {
      blankFields.push(label);
      continue;
    }

    // Pattern 3: <td><strong>Label:</strong></td><td></td> (empty table cell)
    // This is a structured table field
    const tablePattern = new RegExp(
      `<td[^>]*>\\s*<strong[^>]*>\\s*${escapeRegex(label)}[:\\s]*<\\/strong>\\s*<\\/td>\\s*<td[^>]*>\\s*<\\/td>`,
      'gi'
    );
    if (tablePattern.test(html)) {
      blankFields.push(label);
    }
  }

  return [...new Set(blankFields)]; // Deduplicate
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Comprehensive validation of HTML content for PDF text layer consistency.
 * Checks for both ISO date leaks and blank date fields.
 *
 * This is a final safeguard run before PDF generation (non-Form 3 only).
 *
 * @param html - The rendered HTML to validate
 * @param options - Validation options
 * @returns Validation result with any issues found
 */
export function validateHtmlForPdfTextLayer(
  html: string,
  options?: {
    /** Document type for error messages */
    documentType?: string;
    /** Whether to throw on critical issues */
    throwOnCritical?: boolean;
  }
): {
  valid: boolean;
  isoDateLeaks: string[];
  blankDateFields: string[];
  warnings: string[];
} {
  const isoDateLeaks = findISODatesInContent(html);
  const blankDateFields = findBlankDateFields(html);
  const warnings: string[] = [];

  // Check for ISO date leaks
  if (isoDateLeaks.length > 0) {
    warnings.push(
      `ISO_DATE_LEAK: Found ${isoDateLeaks.length} ISO date(s): ${isoDateLeaks.slice(0, 3).join(', ')}`
    );
  }

  // Check for blank date fields
  if (blankDateFields.length > 0) {
    warnings.push(
      `BLANK_DATE_FIELD: Found ${blankDateFields.length} empty date field(s): ${blankDateFields.join(', ')}`
    );
  }

  const valid = isoDateLeaks.length === 0 && blankDateFields.length === 0;

  // Log warnings in development
  if (warnings.length > 0 && (process.env.NODE_ENV === 'development' || process.env.PDF_TEXT_LAYER_DEBUG === '1')) {
    const docType = options?.documentType || 'unknown';
    console.warn(`[PDF_TEXT_LAYER] Validation issues in ${docType}:`, warnings);
  }

  // Throw on critical issues if requested
  if (options?.throwOnCritical && !valid) {
    throw new Error(
      `PDF_TEXT_LAYER_VALIDATION_FAILED: ${warnings.join('; ')}`
    );
  }

  return {
    valid,
    isoDateLeaks,
    blankDateFields,
    warnings,
  };
}

export default normalizeDatesForRender;
