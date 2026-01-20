/**
 * PDF Safe Text Utility
 *
 * Sanitizes text for use with PDF standard fonts (Helvetica, Times, etc.)
 * that use WinAnsi (Windows-1252) encoding.
 *
 * WinAnsi cannot encode Unicode symbols like:
 * - Warning symbols (⚠, ⚠️)
 * - Emojis
 * - Smart quotes and special punctuation
 * - Characters outside the Windows-1252 range
 *
 * This utility replaces unsupported characters with ASCII equivalents
 * to prevent "WinAnsi cannot encode" errors during PDF generation.
 */

/**
 * Map of Unicode characters to their WinAnsi-safe ASCII replacements
 */
const UNICODE_REPLACEMENTS: Record<string, string> = {
  // Warning symbols
  '\u26A0': 'WARNING:', // ⚠ Warning Sign
  '\u26A0\uFE0F': 'WARNING:', // ⚠️ Warning Sign with variation selector

  // Common emojis that might appear in text
  '\u2705': '[OK]', // ✅ Check Mark
  '\u274C': '[X]', // ❌ Cross Mark
  '\u2714': '[OK]', // ✔ Check Mark
  '\u2716': '[X]', // ✖ Heavy Multiplication X
  '\u2713': '[OK]', // ✓ Check Mark
  '\u2717': '[X]', // ✗ Ballot X
  '\u2718': '[X]', // ✘ Heavy Ballot X
  '\u2757': '(!)', // ❗ Exclamation Mark
  '\u2755': '(?)', // ❕ White Exclamation Mark
  '\u2753': '(?)', // ❓ Question Mark
  '\u2754': '(?)', // ❔ White Question Mark
  '\u2B50': '*', // ⭐ Star
  '\u2605': '*', // ★ Black Star
  '\u2606': '*', // ☆ White Star
  '\u27A1': '->', // ➡ Right Arrow
  '\u2192': '->', // → Rightwards Arrow
  '\u2190': '<-', // ← Leftwards Arrow
  '\u2191': '^', // ↑ Upwards Arrow
  '\u2193': 'v', // ↓ Downwards Arrow
  '\u2022': '*', // • Bullet
  '\u25CF': '*', // ● Black Circle
  '\u25CB': 'o', // ○ White Circle
  '\u25A0': '[]', // ■ Black Square
  '\u25A1': '[]', // □ White Square
  '\u25AA': '*', // ▪ Black Small Square
  '\u25AB': '*', // ▫ White Small Square
  '\u2588': '#', // █ Full Block
  '\u2591': '.', // ░ Light Shade
  '\u2592': ':', // ▒ Medium Shade
  '\u2593': '#', // ▓ Dark Shade

  // Smart quotes and apostrophes -> straight equivalents
  '\u2018': "'", // ' Left Single Quotation Mark
  '\u2019': "'", // ' Right Single Quotation Mark
  '\u201A': "'", // ‚ Single Low-9 Quotation Mark
  '\u201B': "'", // ‛ Single High-Reversed-9 Quotation Mark
  '\u201C': '"', // " Left Double Quotation Mark
  '\u201D': '"', // " Right Double Quotation Mark
  '\u201E': '"', // „ Double Low-9 Quotation Mark
  '\u201F': '"', // ‟ Double High-Reversed-9 Quotation Mark
  '\u2032': "'", // ′ Prime
  '\u2033': '"', // ″ Double Prime
  '\u2039': '<', // ‹ Single Left-Pointing Angle Quotation Mark
  '\u203A': '>', // › Single Right-Pointing Angle Quotation Mark
  '\u00AB': '<<', // « Left-Pointing Double Angle Quotation Mark
  '\u00BB': '>>', // » Right-Pointing Double Angle Quotation Mark

  // Dashes and hyphens
  '\u2013': '-', // – En Dash
  '\u2014': '--', // — Em Dash
  '\u2015': '--', // ― Horizontal Bar
  '\u2212': '-', // − Minus Sign

  // Ellipsis
  '\u2026': '...', // … Horizontal Ellipsis

  // Currency symbols (most are in WinAnsi, but some aren't)
  '\u20AC': 'EUR', // € Euro Sign (actually in WinAnsi at 0x80, but being safe)

  // Mathematical symbols
  '\u2248': '~=', // ≈ Almost Equal To
  '\u2260': '!=', // ≠ Not Equal To
  '\u2264': '<=', // ≤ Less Than or Equal To
  '\u2265': '>=', // ≥ Greater Than or Equal To
  '\u00D7': 'x', // × Multiplication Sign
  '\u00F7': '/', // ÷ Division Sign
  '\u221E': 'infinity', // ∞ Infinity

  // Miscellaneous
  '\u00A0': ' ', // Non-Breaking Space -> regular space
  '\u00AD': '', // Soft Hyphen -> remove
  '\u200B': '', // Zero Width Space -> remove
  '\u200C': '', // Zero Width Non-Joiner -> remove
  '\u200D': '', // Zero Width Joiner -> remove
  '\uFEFF': '', // Zero Width No-Break Space (BOM) -> remove
};

/**
 * Build a regex pattern from the replacement map keys
 * This is more efficient than iterating character by character
 */
const REPLACEMENT_PATTERN = new RegExp(
  Object.keys(UNICODE_REPLACEMENTS)
    .map((key) => key.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
    .join('|'),
  'g'
);

/**
 * WinAnsi (Windows-1252) safe character range check
 * Characters 0x20-0x7E are standard ASCII
 * Characters 0x80-0xFF are extended WinAnsi
 *
 * Note: 0x7F (DEL) and 0x81, 0x8D, 0x8F, 0x90, 0x9D are undefined in WinAnsi
 */
function isWinAnsiSafe(charCode: number): boolean {
  // Standard ASCII printable range (space to tilde)
  if (charCode >= 0x20 && charCode <= 0x7e) {
    return true;
  }

  // Extended WinAnsi characters (Latin-1 Supplement + Windows-specific)
  // These are the defined characters in the 0x80-0xFF range
  // Undefined positions: 0x81, 0x8D, 0x8F, 0x90, 0x9D
  if (charCode >= 0x80 && charCode <= 0xff) {
    const undefinedPositions = [0x81, 0x8d, 0x8f, 0x90, 0x9d];
    return !undefinedPositions.includes(charCode);
  }

  // Newline and tab are safe
  if (charCode === 0x09 || charCode === 0x0a || charCode === 0x0d) {
    return true;
  }

  return false;
}

/**
 * Convert text to WinAnsi-safe format for use with PDF standard fonts
 *
 * This function:
 * 1. Replaces known Unicode symbols with ASCII equivalents
 * 2. Strips any remaining characters outside the WinAnsi range
 *
 * @param input - The text to sanitize
 * @returns WinAnsi-safe text string
 *
 * @example
 * ```typescript
 * import { toWinAnsiSafeText } from '@/lib/documents/pdf-safe-text';
 *
 * // In a pdf-lib document:
 * page.drawText(toWinAnsiSafeText('⚠ IMPORTANT: Check this'), { ... });
 * // Outputs: "WARNING: IMPORTANT: Check this"
 *
 * page.drawText(toWinAnsiSafeText('Status: ✅ Complete'), { ... });
 * // Outputs: "Status: [OK] Complete"
 * ```
 */
export function toWinAnsiSafeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Step 1: Replace known Unicode symbols with ASCII equivalents
  let result = input.replace(REPLACEMENT_PATTERN, (match) => {
    return UNICODE_REPLACEMENTS[match] || '';
  });

  // Step 2: Strip any remaining non-WinAnsi characters
  // This catches any Unicode characters not in our replacement map
  let sanitized = '';
  for (let i = 0; i < result.length; i++) {
    const charCode = result.charCodeAt(i);

    // Check for surrogate pairs (emoji and other high Unicode)
    if (charCode >= 0xd800 && charCode <= 0xdbff) {
      // This is a high surrogate - skip it and the following low surrogate
      i++; // Skip the low surrogate
      continue;
    }

    // Skip low surrogates (shouldn't appear alone, but just in case)
    if (charCode >= 0xdc00 && charCode <= 0xdfff) {
      continue;
    }

    if (isWinAnsiSafe(charCode)) {
      sanitized += result[i];
    }
    // Silently drop non-WinAnsi characters
  }

  return sanitized;
}

/**
 * Check if a string contains any characters that are not WinAnsi-safe
 *
 * @param input - The text to check
 * @returns true if the text contains non-WinAnsi characters
 */
export function hasUnsafeUnicodeCharacters(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);

    // Check for surrogate pairs (emoji)
    if (charCode >= 0xd800 && charCode <= 0xdfff) {
      return true;
    }

    if (!isWinAnsiSafe(charCode)) {
      return true;
    }
  }

  return false;
}

/**
 * Get a list of unsafe characters in a string (for debugging)
 *
 * @param input - The text to analyze
 * @returns Array of objects containing unsafe characters and their positions
 */
export function findUnsafeCharacters(
  input: string
): Array<{ char: string; codePoint: string; position: number }> {
  const unsafeChars: Array<{ char: string; codePoint: string; position: number }> = [];

  if (!input || typeof input !== 'string') {
    return unsafeChars;
  }

  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);

    // Check for surrogate pairs
    if (charCode >= 0xd800 && charCode <= 0xdbff && i + 1 < input.length) {
      const lowSurrogate = input.charCodeAt(i + 1);
      if (lowSurrogate >= 0xdc00 && lowSurrogate <= 0xdfff) {
        // Calculate full code point
        const codePoint = (charCode - 0xd800) * 0x400 + (lowSurrogate - 0xdc00) + 0x10000;
        unsafeChars.push({
          char: input.substring(i, i + 2),
          codePoint: `U+${codePoint.toString(16).toUpperCase().padStart(5, '0')}`,
          position: i,
        });
        i++; // Skip low surrogate
        continue;
      }
    }

    if (!isWinAnsiSafe(charCode)) {
      unsafeChars.push({
        char: input[i],
        codePoint: `U+${charCode.toString(16).toUpperCase().padStart(4, '0')}`,
        position: i,
      });
    }
  }

  return unsafeChars;
}

/**
 * Custom error class for PDF text encoding errors
 */
export class PDFTextEncodingError extends Error {
  public readonly code = 'PDF_TEXT_ENCODING_ERROR';
  public readonly unsafeCharacters: Array<{ char: string; codePoint: string; position: number }>;

  constructor(message: string, unsafeCharacters: Array<{ char: string; codePoint: string; position: number }>) {
    super(message);
    this.name = 'PDFTextEncodingError';
    this.unsafeCharacters = unsafeCharacters;
  }
}
