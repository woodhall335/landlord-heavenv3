/**
 * Document Generator
 *
 * Generates legal documents (Section 8 notices, ASTs, letters) from Handlebars templates.
 * Converts to PDF using Puppeteer (with @sparticuz/chromium for serverless/Vercel).
 */

import Handlebars from 'handlebars';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import puppeteerCore from 'puppeteer-core';
import { SITE_CONFIG } from '@/lib/site-config';
import { normalizeDatesForRender, sanitizeISODatesInHTML, validateHtmlForPdfTextLayer } from './date-normalizer';

// Use 'any' for browser type to avoid conflicts between puppeteer and puppeteer-core types
type BrowserInstance = Awaited<ReturnType<typeof puppeteerCore.launch>>;

/**
 * Get a browser instance that works in both local dev and Vercel serverless.
 * - Local: Uses system Chrome or puppeteer's bundled Chromium
 * - Vercel: Uses @sparticuz/chromium which bundles a serverless-compatible Chromium
 */
async function getBrowser(): Promise<BrowserInstance> {
  const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (isVercel) {
    // Use @sparticuz/chromium for Vercel/AWS Lambda
    // This package bundles a serverless-compatible Chromium binary
    console.log('[getBrowser] Vercel environment detected, loading @sparticuz/chromium');

    try {
      const chromium = await import('@sparticuz/chromium');
      const execPath = await chromium.default.executablePath();

      console.log('[getBrowser] Chromium executable path:', execPath);
      console.log('[getBrowser] Chromium args:', chromium.default.args.length, 'args');

      return puppeteerCore.launch({
        args: chromium.default.args,
        defaultViewport: { width: 1200, height: 1600 },
        executablePath: execPath,
        headless: true,
      });
    } catch (err: any) {
      console.error('[getBrowser] Failed to load @sparticuz/chromium:', err.message);
      throw new Error(`Vercel Chromium initialization failed: ${err.message}`);
    }
  } else {
    // Local development - try to find Chrome in common locations
    const possiblePaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      process.env.PUPPETEER_EXECUTABLE_PATH,
    ].filter(Boolean) as string[];

    let executablePath: string | undefined;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        executablePath = path;
        break;
      }
    }

    // If no system Chrome found, try using puppeteer's bundled version
    if (!executablePath) {
      try {
        const puppeteer = await import('puppeteer');
        const browser = await puppeteer.default.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        // Cast to our type - the APIs are compatible at runtime
        return browser as unknown as BrowserInstance;
      } catch (e) {
        throw new Error(
          'No Chrome browser found. Please install Chrome or set PUPPETEER_EXECUTABLE_PATH environment variable.'
        );
      }
    }

    return puppeteerCore.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath,
    });
  }
}

/**
 * Get diagnostics about browser/chromium setup for debugging
 * Safe for production - does not expose secrets
 */
export async function getBrowserDiagnostics(): Promise<Record<string, unknown>> {
  const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;

  const diagnostics: Record<string, unknown> = {
    isVercel,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };

  if (isVercel) {
    try {
      const chromium = await import('@sparticuz/chromium');
      const execPath = await chromium.default.executablePath();
      diagnostics.chromiumLoaded = true;
      diagnostics.executablePath = execPath;
      diagnostics.executableExists = existsSync(execPath);
      diagnostics.argsCount = chromium.default.args.length;
    } catch (err: any) {
      diagnostics.chromiumLoaded = false;
      diagnostics.chromiumError = err.message;
    }
  } else {
    // Local: check for available browsers
    const possiblePaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
    ];
    diagnostics.localBrowsers = possiblePaths.filter(p => existsSync(p));
  }

  return diagnostics;
}

// ESM compatibility: Get __dirname equivalent
const __filename_esm = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const __dirname_esm = typeof __dirname !== 'undefined' ? __dirname : dirname(__filename_esm);

// ============================================================================
// TYPES
// ============================================================================

export interface DocumentGenerationOptions {
  templatePath: string;
  data: Record<string, any>;
  isPreview?: boolean;
  outputFormat?: 'html' | 'pdf' | 'both';
  /**
   * Debug stamp configuration for development tracing.
   * When provided, adds a footer with git SHA, generator name, templates, and case_id.
   */
  debugStamp?: {
    generatorName: string;
    caseId?: string;
    /** Additional template files to list (besides templatePath) */
    additionalTemplates?: string[];
  };
}

export interface GeneratedDocument {
  html: string;
  pdf?: Buffer;
  /**
   * Additional generated artifacts (e.g. multiple PDFs within a pack).
   * These are kept permissive to accommodate the various generators.
   */
  documents?: Array<Record<string, any>>;
  /**
   * Optional validation errors collected during generation.
   */
  validation_errors?: string[];
  metadata: {
    templateUsed: string;
    generatedAt: string;
    documentId: string;
    isPreview: boolean;
    jurisdiction?: string;
    /** Whether inventory schedule is included in the document */
    inventoryIncluded?: boolean;
    /** Type of inventory: 'blank' (standard) or 'wizard-completed' (premium) */
    inventoryType?: 'blank' | 'wizard-completed';
    /** Whether compliance checklist is included in the document */
    complianceChecklistIncluded?: boolean;
  };
}

// ============================================================================
// HANDLEBARS HELPERS
// ============================================================================

/**
 * Register custom Handlebars helpers
 */
function registerHandlebarsHelpers() {
  // Equality check (supports both inline and block usage)
  Handlebars.registerHelper('eq', function (this: any, a: any, b: any, options?: any) {
    if (arguments.length === 3 && options && typeof options.fn === 'function') {
      // Block helper: {{#eq a b}}...{{/eq}}
      return a === b ? options.fn(this) : (options.inverse ? options.inverse(this) : '');
    }
    // Inline helper: {{eq a b}}
    return a === b;
  });

  // Logical OR (supports subexpressions: {{#if (or a b)}})
  Handlebars.registerHelper('or', function (...args) {
    const values = args.slice(0, -1);
    return values.some(Boolean);
  });

  // Join array with separator
  Handlebars.registerHelper('join', function (array, separator) {
    return Array.isArray(array) ? array.join(separator) : '';
  });

  // Ordinal suffix (1st, 2nd, 3rd, etc.)
  Handlebars.registerHelper('ordinal_suffix', function (num) {
    const n = parseInt(num);
    if (isNaN(n)) return '';
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  });

  // Format currency
  Handlebars.registerHelper('currency', function (amount) {
    if (typeof amount !== 'number') return '£0.00';
    return `£${amount.toFixed(2)}`;
  });

  // Format number for MCOL (Money Claim Online) - 2 decimal places, no £ symbol
  // Used in Filing Guide Step 5 where MCOL requires plain numbers only
  // Prevents float artifacts like "3622.3900000000003" → outputs "3622.39"
  Handlebars.registerHelper('mcol_number', function (amount) {
    if (typeof amount !== 'number') return '0.00';
    return amount.toFixed(2);
  });

  // Format date (UK format: DD/MM/YYYY or "D Month YYYY" for long format)
  // UPDATED: Now handles pre-normalized UK dates (e.g., "1 January 2026") gracefully
  // If the date is already in UK long format, it passes through unchanged for "long" format
  Handlebars.registerHelper('format_date', function (date, format) {
    if (!date) return '';

    const dateStr = String(date);

    // Check if already in UK long format: "D Month YYYY" or "DD Month YYYY"
    // Pattern: 1-2 digits + space + month name + space + 4 digits
    const ukLongPattern = /^(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/i;
    const ukLongMatch = dateStr.match(ukLongPattern);

    if (ukLongMatch) {
      // Already UK formatted - pass through for "long", convert for short
      if (format === 'long') {
        return dateStr;
      }
      // Convert to DD/MM/YYYY
      const [, dayPart, monthName, yearPart] = ukLongMatch;
      const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'];
      const monthNum = monthNames.indexOf(monthName.toLowerCase()) + 1;
      return `${String(dayPart).padStart(2, '0')}/${String(monthNum).padStart(2, '0')}/${yearPart}`;
    }

    // Check if already in DD/MM/YYYY format
    const ukShortPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const ukShortMatch = dateStr.match(ukShortPattern);

    if (ukShortMatch) {
      // Already UK short format
      if (format === 'long') {
        const [, dayPart, monthPart, yearPart] = ukShortMatch;
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIdx = parseInt(monthPart, 10) - 1;
        return `${parseInt(dayPart, 10)} ${monthNames[monthIdx]} ${yearPart}`;
      }
      return dateStr;
    }

    // Try parsing as ISO date (YYYY-MM-DD) - parse as local time to avoid timezone issues
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, year, monthPart, dayPart] = isoMatch;
      const dayNum = parseInt(dayPart, 10);
      const monthIdx = parseInt(monthPart, 10) - 1;

      if (format === 'long') {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        return `${dayNum} ${monthNames[monthIdx]} ${year}`;
      }
      return `${dayPart}/${monthPart}/${year}`;
    }

    // Last resort: try native Date parsing (may have timezone issues)
    const d = new Date(dateStr + (!dateStr.includes('T') ? 'T00:00:00.000Z' : ''));
    if (isNaN(d.getTime())) return '';

    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();

    if (format === 'long') {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      return `${parseInt(day, 10)} ${monthNames[d.getUTCMonth()]} ${year}`;
    }

    return `${day}/${month}/${year}`;
  });

  // Conditional class
  Handlebars.registerHelper('if_eq', function (this: any, a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('if_gte', function (this: any, a: any, b: any, options: Handlebars.HelperOptions) {
    const left = Number(a);
    const right = Number(b);

    if (!Number.isNaN(left) && !Number.isNaN(right) && left >= right) {
      return options.fn(this);
    }

    return options.inverse(this);
  });

  Handlebars.registerHelper('gt', function (a: any, b: any) {
    const left = Number(a);
    const right = Number(b);
    if (Number.isNaN(left) || Number.isNaN(right)) return false;
    return left > right;
  });

  Handlebars.registerHelper('gte', function (a: any, b: any) {
    const left = Number(a);
    const right = Number(b);
    if (Number.isNaN(left) || Number.isNaN(right)) return false;
    return left >= right;
  });

  // Create an array from arguments (for use with contains/includes helpers)
  // Usage: {{#if (contains (array "a" "b" "c") someValue)}}
  Handlebars.registerHelper('array', function (...args) {
    // Remove the last argument which is the Handlebars options object
    return args.slice(0, -1);
  });

  // Array contains
  Handlebars.registerHelper('contains', function (array, value) {
    return Array.isArray(array) && array.includes(value);
  });

  // Array/string includes (alias for contains with string support)
  Handlebars.registerHelper('includes', function (haystack, needle) {
    if (Array.isArray(haystack)) {
      return haystack.includes(needle);
    }
    if (typeof haystack === 'string' && typeof needle === 'string') {
      return haystack.includes(needle);
    }
    return false;
  });

  // Add days to a date (returns UK format "D Month YYYY")
  // UPDATED: Now returns formatted UK date instead of ISO to prevent ISO date leakage
  Handlebars.registerHelper('add_days', function (dateString, days) {
    if (!dateString) return '';
    try {
      // Handle both ISO dates and already-formatted UK dates
      let date: Date;

      // Check if it's an ISO date (YYYY-MM-DD)
      const isoMatch = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) {
        // Parse as local date to avoid timezone issues
        const [, year, month, day] = isoMatch;
        date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      } else {
        // Try parsing as-is (handles UK format like "1 January 2026")
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) return '';

      date.setDate(date.getDate() + Number(days));

      // Return UK long format: "D Month YYYY"
      const dayNum = date.getDate();
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();

      return `${dayNum} ${month} ${year}`;
    } catch (error) {
      console.error('[add_days] Error adding days:', error);
      return '';
    }
  });

  // Calculate days between dates
  Handlebars.registerHelper('days_between', function (date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  });

  // Add numbers (for array indexing, etc.)
  Handlebars.registerHelper('add', function (a, b) {
    return Number(a) + Number(b);
  });

  // Multiply numbers
  Handlebars.registerHelper('multiply', function (a, b) {
    return Number(a) * Number(b);
  });

  // Safe text helper - prevents [object Object] leaks in templates
  Handlebars.registerHelper('safe', function (value) {
    return safeText(value);
  });

  /**
   * formatUKDate - Format dates in UK legal document format (D Month YYYY)
   *
   * This is the REQUIRED helper for all tenancy agreement date fields.
   * Renders dates like "1 February 2026" instead of "2026-02-01" (ISO format).
   *
   * Handles:
   * - YYYY-MM-DD strings (parsed as local time to avoid timezone issues)
   * - Date objects
   * - null/undefined (returns empty string, no placeholder)
   * - Invalid dates (returns empty string, no "Invalid Date")
   *
   * @example {{formatUKDate tenancy_start_date}} → "1 February 2026"
   */
  Handlebars.registerHelper('formatUKDate', function (date: any) {
    // Handle null/undefined - return empty string, no placeholder
    if (date === null || date === undefined || date === '') {
      return '';
    }

    let d: Date;

    if (typeof date === 'string') {
      // Parse YYYY-MM-DD format as local time (not UTC)
      // This avoids the timezone off-by-one issue where "2026-02-01" becomes "31 January 2026"
      const isoMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (isoMatch) {
        const [, year, month, day] = isoMatch;
        d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      } else {
        // Try parsing as a Date string (handles ISO with time, etc.)
        d = new Date(date);
      }
    } else if (date instanceof Date) {
      d = date;
    } else {
      // Unknown type - return empty string
      return '';
    }

    // Check for invalid date
    if (isNaN(d.getTime())) {
      return '';
    }

    // Format as UK long form: "D Month YYYY" (no leading zero on day)
    const day = d.getDate();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();

    return `${day} ${month} ${year}`;
  });
}

// Register helpers once
registerHandlebarsHelpers();

// ============================================================================
// PRINT DESIGN SYSTEM
// ============================================================================

/**
 * Essential inline CSS fallback when print.css cannot be loaded.
 * This ensures notice PDFs are still styled even if file loading fails.
 * Matches the core rules from config/jurisdictions/_shared/print/print.css
 */
const FALLBACK_PRINT_CSS = `
/* Fallback print styles - used if print.css file cannot be loaded */
* { margin: 0; padding: 0; box-sizing: border-box; }
@page { size: A4; margin: 0.75in 0.75in 1in 0.75in; }
html { font-size: 12pt; }
body { font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; font-size: 12pt; line-height: 1.5; color: #000; background: #fff; max-width: 8.5in; margin: 0 auto; padding: 0.5in; word-wrap: break-word; }
h1 { font-size: 14pt; font-weight: bold; line-height: 1.3; text-align: center; text-transform: uppercase; margin: 0 0 1em 0; page-break-after: avoid; }
h2 { font-size: 12pt; font-weight: bold; line-height: 1.4; text-align: center; margin: 0 0 1em 0; page-break-after: avoid; }
h3 { font-size: 12pt; font-weight: bold; line-height: 1.4; margin: 1.5em 0 0.5em 0; page-break-after: avoid; }
p { margin: 0 0 0.75em 0; line-height: 1.5; }
ul, ol { margin: 0.75em 0; padding-left: 1.5em; }
li { margin-bottom: 0.5em; line-height: 1.5; }
strong { font-weight: bold; }
.link, a { color: #0066cc; text-decoration: underline; word-break: break-all; }
.info-box { border: 2px solid #000; padding: 1em; margin: 1em 0 1.5em 0; background-color: #f9f9f9; page-break-inside: avoid; }
.section { margin: 1.5em 0; page-break-inside: avoid; break-inside: avoid; }
.field-label { font-weight: bold; margin-top: 0.75em; margin-bottom: 0.25em; display: block; }
.field-value { margin-left: 0.25in; border-bottom: 1px dotted #666; min-height: 1.5em; padding: 0.25em 0; display: block; }
.signature-block { margin-top: 2em; page-break-inside: avoid; break-inside: avoid; }
.checkbox { display: inline-block; width: 1em; height: 1em; border: 1px solid #000; margin-right: 0.5em; vertical-align: middle; background-color: #fff; }
.guidance-section { margin-top: 2em; padding-top: 1.5em; border-top: 2px solid #000; }
.avoid-break { page-break-inside: avoid; break-inside: avoid; }
table { width: 100%; border-collapse: collapse; margin: 1em 0; page-break-inside: avoid; }
th, td { padding: 0.5em; border: 1px solid #ccc; text-align: left; vertical-align: top; }
th { font-weight: bold; background-color: #f0f0f0; }
`.trim();

/**
 * Load and cache the centralized print.css stylesheet
 */
let cachedPrintCss: string | null = null;

export function loadPrintCss(): string {
  if (cachedPrintCss) {
    return cachedPrintCss;
  }

  // Try multiple possible paths for print.css
  // This covers different runtime environments (dev, production, tests)
  const possiblePaths = [
    join(process.cwd(), 'config', 'jurisdictions', '_shared', 'print', 'print.css'),
    join(__dirname_esm, '..', '..', '..', '..', 'config', 'jurisdictions', '_shared', 'print', 'print.css'),
    join(process.cwd(), '..', 'config', 'jurisdictions', '_shared', 'print', 'print.css'),
  ];

  for (const printCssPath of possiblePaths) {
    try {
      cachedPrintCss = readFileSync(printCssPath, 'utf-8');
      console.log('[PRINT SYSTEM] ✅ Loaded print.css from:', printCssPath);
      console.log('[PRINT SYSTEM] CSS length:', cachedPrintCss.length, 'characters');
      return cachedPrintCss;
    } catch {
      // Try next path
    }
  }

  // Use fallback CSS if file cannot be loaded from any path
  console.warn('[PRINT SYSTEM] ⚠️  Could not load print.css from any path, using fallback CSS');
  console.warn('[PRINT SYSTEM] Tried paths:', possiblePaths);
  cachedPrintCss = FALLBACK_PRINT_CSS;
  return cachedPrintCss;
}

/**
 * Register print component partials (from components.hbs)
 * These partials provide reusable layout components for notices
 */
let partialsRegistered = false;
let tenancyPartialsRegistered = false;

export function registerPrintPartials(): void {
  if (partialsRegistered) {
    return; // Only register once
  }

  try {
    const componentsPath = join(process.cwd(), 'config', 'jurisdictions', '_shared', 'print', 'components.hbs');
    const componentsContent = readFileSync(componentsPath, 'utf-8');

    // Parse and register all inline partials defined in components.hbs
    // Handlebars {{#*inline "name"}} syntax defines partials that can be registered
    const partialPattern = /\{\{#\*inline "([^"]+)"\}\}([\s\S]*?)\{\{\/inline\}\}/g;
    let match;
    let count = 0;

    while ((match = partialPattern.exec(componentsContent)) !== null) {
      const [, partialName, partialContent] = match;
      Handlebars.registerPartial(partialName, partialContent);
      count++;
    }

    partialsRegistered = true;
    console.log(`[PRINT SYSTEM] ✅ Registered ${count} print component partials`);
  } catch (error: any) {
    console.warn('[PRINT SYSTEM] ⚠️  Could not load components.hbs:', error.message);
    // Graceful fallback - templates will work without partials if they don't use them
  }
}

export function registerTenancyPartials(): void {
  if (tenancyPartialsRegistered) {
    return;
  }

  try {
    const partialPath = join(
      process.cwd(),
      'config',
      'jurisdictions',
      'uk',
      '_partials',
      'statutory_acknowledgements.hbs'
    );
    const partialContent = readFileSync(partialPath, 'utf-8');
    Handlebars.registerPartial('statutory_acknowledgements', partialContent);
    tenancyPartialsRegistered = true;
    console.log('[TEMPLATE SYSTEM] ✅ Registered tenancy partials');
  } catch (error: any) {
    throw new Error(
      `[TEMPLATE SYSTEM] ❌ Failed to load tenancy partials (statutory_acknowledgements). ` +
      `Document generation will fail until this partial is available. ` +
      `Original error: ${error.message}`
    );
  }
}

// Initialize print system on module load
registerPrintPartials();
registerTenancyPartials();

// ============================================================================
// TEMPLATE LOADER
// ============================================================================

/**
 * Load a Handlebars template from the file system
 *
 * SINGLE SOURCE OF TRUTH: All templates must come from /config/jurisdictions
 * This function enforces the contract that templatePath is relative to config/jurisdictions/
 */
export function loadTemplate(templatePath: string): string {
  // ============================================================================
  // RUNTIME GUARD: Prevent loading from legacy /public/official-forms
  // ============================================================================
  if (templatePath.includes('official-forms') || templatePath.startsWith('public/')) {
    throw new Error(
      `[TEMPLATE GUARD] Attempted to load legacy template: ${templatePath}\n` +
      `BLOCKED: All templates must come from /config/jurisdictions\n` +
      `This is a legacy path and must not be used for generation.\n` +
      `Template paths must be relative to config/jurisdictions/ (e.g., "uk/england/templates/...")`
    );
  }

  // ============================================================================
  // WALES TEMPLATE GUARD: Block deleted bilingual/legacy templates
  // ============================================================================
  if (templatePath.includes('rhw20_section173_bilingual')) {
    throw new Error(
      `[TEMPLATE GUARD] Attempted to load deleted Wales bilingual template: ${templatePath}\n` +
      `BLOCKED: Wales bilingual templates have been removed.\n` +
      `Use English-only prescribed forms:\n` +
      `  - For Section 173: Use generateWalesSection173Notice() (HARD-LOCKED to RHW16, 6-month notice)\n` +
      `  - For fault-based: Use 'uk/wales/templates/notice_only/rhw23_notice_before_possession_claim/notice.hbs'`
    );
  }

  if (templatePath.includes('uk/wales/templates/notice_only/fault_based/notice.hbs') ||
      templatePath.includes('/wales/templates/notice_only/fault_based/')) {
    throw new Error(
      `[TEMPLATE GUARD] Attempted to load deleted Wales legacy fault-based template: ${templatePath}\n` +
      `BLOCKED: Legacy Wales fault-based templates have been removed.\n` +
      `Use the prescribed form RHW23:\n` +
      `  'uk/wales/templates/notice_only/rhw23_notice_before_possession_claim/notice.hbs'`
    );
  }

  if (templatePath.toLowerCase().includes('bilingual') && templatePath.includes('/wales/')) {
    throw new Error(
      `[TEMPLATE GUARD] Attempted to load bilingual Wales template: ${templatePath}\n` +
      `BLOCKED: Bilingual templates are not available.\n` +
      `Wales templates are English-only prescribed forms (RHW16 for Section 173, RHW23 for fault-based).`
    );
  }

  // Prevent absolute paths
  if (templatePath.startsWith('/')) {
    throw new Error(
      `[TEMPLATE GUARD] Template path must be relative to config/jurisdictions/\n` +
      `Received absolute path: ${templatePath}\n` +
      `Use relative paths like "uk/england/templates/notice_only/form_3_section8/notice.hbs"`
    );
  }

  // Prevent directory traversal attempts
  if (templatePath.includes('..')) {
    throw new Error(
      `[TEMPLATE GUARD] Directory traversal not allowed in template paths.\n` +
      `Received: ${templatePath}\n` +
      `Templates must be within config/jurisdictions/`
    );
  }

  // ============================================================================
  // LOAD TEMPLATE from /config/jurisdictions
  // ============================================================================
  const fullPath = join(process.cwd(), 'config', 'jurisdictions', templatePath);

  try {
    const templateContent = readFileSync(fullPath, 'utf-8');
    console.log(`[TEMPLATE] ✅ Loading from: ${fullPath}`);
    return templateContent;
  } catch (error: any) {
    throw new Error(`Failed to load template ${templatePath}: ${error.message}`);
  }
}

/**
 * Convert markdown to HTML (simplified for legal documents)
 * Handles the markdown syntax used in templates: ##, **, ---, etc.
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Convert headings (# to <h1>, ## to <h2>, ### to <h3>, #### to <h4>)
  // Process longer patterns first to avoid partial matches
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Convert bold text (**text** to <strong>text</strong>)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Convert italic text (*text* to <em>text</em>)  // Must be after bold to avoid conflicts
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Convert horizontal rules (--- to <hr />)
  html = html.replace(/^---$/gm, '<hr />');

  // Convert line breaks to paragraphs (preserve existing structure)
  // Split by double newlines and wrap in <p> tags if not already wrapped
  const paragraphs = html.split('\n\n');
  html = paragraphs.map(para => {
    para = para.trim();
    if (!para) return '';
    // Don't wrap if already has HTML tags
    if (para.startsWith('<h') || para.startsWith('<hr') || para.startsWith('<div') || para.startsWith('<p') || para.startsWith('<table')) {
      return para;
    }
    // Don't wrap standalone --- lines
    if (para === '---' || para === '<hr />') {
      return para;
    }
    return `<p>${para.replace(/\n/g, '<br />')}</p>`;
  }).join('\n');

  return html;
}

/**
 * Detect if HTML content is a full HTML document (with <!DOCTYPE>, <html>, <head>, etc.)
 * These templates should NOT be processed with markdownToHtml or wrapped in another HTML shell.
 *
 * Detection is case-insensitive and based on trimmed content.
 * Returns true if:
 *   - starts with <!DOCTYPE or <html
 *   - OR contains <html and <head> near the top of the document
 */
export function isFullHtmlDocument(html: string): boolean {
  const trimmed = html.trim().toLowerCase();

  // Check if starts with <!doctype or <html
  if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')) {
    return true;
  }

  // Check for <html and <head> near the top (within first 500 chars after trimming)
  const topPortion = trimmed.substring(0, 500);
  if (topPortion.includes('<html') && topPortion.includes('<head')) {
    return true;
  }

  return false;
}

/**
 * Safe text helper - converts objects to strings, prevents [object Object]
 */
export function safeText(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(v => safeText(v)).join(', ');
  }
  if (typeof value === 'object') {
    // If it's an address object, try to format it
    if (value.line1 || value.street || value.address_line_1) {
      const parts = [
        value.line1 || value.street || value.address_line_1,
        value.line2 || value.address_line_2,
        value.city || value.town,
        value.state || value.county,
        value.postcode || value.postal_code || value.zip,
        value.country,
      ].filter(Boolean);
      return parts.join(', ');
    }
    // Fallback: try JSON stringify
    try {
      return JSON.stringify(value);
    } catch {
      return '[Complex Object]';
    }
  }
  return String(value);
}

// Debug flag for PDF generation tracing
const PDF_DEBUG = process.env.PDF_DEBUG === '1';

/**
 * Compile a template with data
 */
export function compileTemplate(templateContent: string, data: Record<string, any>): string {
  try {
    // Load print CSS
    const printCssContent = loadPrintCss();

    if (PDF_DEBUG) {
      console.log('[PDF_DEBUG] compileTemplate() called');
      console.log('[PDF_DEBUG] print_css length:', printCssContent.length);
      console.log('[PDF_DEBUG] print_css first 200 chars:', printCssContent.substring(0, 200));
    }

    // CRITICAL: Normalize all ISO date strings to UK format BEFORE template rendering
    // This ensures human-facing documents never display raw ISO dates (YYYY-MM-DD)
    // The normalizer:
    // - Converts *_date fields from "2026-02-01" to "1 February 2026"
    // - Preserves *_iso and machine-readable fields
    // - Adds *_formatted variants for flexibility
    const normalizedData = normalizeDatesForRender(data);

    // Add generation metadata + site config + print system
    // IMPORTANT: Only set generation_date/current_date as fallback if not already provided by the generator
    // Money claim generator passes pre-formatted UK legal dates that must not be overwritten
    //
    // CRITICAL FIX (Feb 2026): Templates use both 'current_date' and 'generation_date'.
    // - Compliance checklist, audit reports use: {{format_date current_date "long"}}
    // - Footer stamps use: {{generation_date}}
    // Both must be set and formatted as UK dates to prevent blank fields in PDF text layer.
    const ukFormattedNow = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const isoNow = new Date().toISOString().split('T')[0];
    const enrichedData = {
      ...normalizedData,
      // 'current_date' - used by compliance checklist, audit reports, etc.
      // If already provided and normalized, keep it; otherwise use UK-formatted now
      current_date: normalizedData.current_date || ukFormattedNow,
      // 'generation_date' - used by footer stamps, metadata (ISO fallback preferred)
      generation_date: normalizedData.generation_date || isoNow,
      generation_timestamp: new Date().toISOString(),
      document_id: generateDocumentId(),
      // Site configuration (for footer, domain, etc.)
      site_domain: SITE_CONFIG.domain,
      site_name: SITE_CONFIG.name,
      site_url: SITE_CONFIG.url,
      support_email: SITE_CONFIG.support_email,
      // Print Design System CSS (for templates that use {{> print_head}} or {{{print_css}}})
      print_css: printCssContent,
    };

    // Safe-convert data values to prevent [object Object] leaks
    // IMPORTANT: Preserve certain nested objects that templates expect to access with dot notation
    // e.g., witness_statement.introduction, arrears.items, etc.
    const PRESERVE_NESTED_KEYS = [
      'witness_statement', // Used by witness-statement.hbs: {{{witness_statement.introduction}}}
      'arrears',           // Used for arrears breakdown: {{arrears.total}}
      'grounds',           // Used for grounds arrays: {{#each grounds}}
      'sections',          // Used for section-based templates
      'compliance',        // Used for compliance data display
      'metadata',          // Used by service_instructions.hbs: {{format_date metadata.generated_at}}
      'tenancy',           // Used by compliance_checklist.hbs: {{tenancy.start_date}}
    ];

    const safeData = Object.entries(enrichedData).reduce((acc, [key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Preserve nested objects that templates expect
        if (PRESERVE_NESTED_KEYS.includes(key)) {
          acc[key] = value;
        } else {
          // Convert other objects to strings to prevent [object Object] in output
          acc[key] = safeText(value);
        }
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const template = Handlebars.compile(templateContent);
    let html = template(safeData);

    if (PDF_DEBUG) {
      console.log('[PDF_DEBUG] Compiled HTML first 300 chars:', html.substring(0, 300));
      console.log('[PDF_DEBUG] isFullHtmlDocument:', isFullHtmlDocument(html));
    }

    // Skip markdown conversion for full HTML documents (those with <!DOCTYPE>, <html>, <head>)
    // These templates have their own structure and styles that would be corrupted by markdownToHtml
    if (!isFullHtmlDocument(html)) {
      // Convert markdown to HTML for PDF rendering
      html = markdownToHtml(html);
      if (PDF_DEBUG) {
        console.log('[PDF_DEBUG] Applied markdownToHtml (not a full HTML doc)');
      }
    } else {
      if (PDF_DEBUG) {
        console.log('[PDF_DEBUG] Skipped markdownToHtml (full HTML doc detected)');
      }
    }

    return html;
  } catch (error: any) {
    throw new Error(`Failed to compile template: ${error.message}`);
  }
}

// ============================================================================
// DOCUMENT MERGING
// ============================================================================

/**
 * Merge multiple HTML documents into one
 * Used to combine AST + bonus documents into a single PDF
 */
export function mergeHtmlDocuments(htmlDocuments: string[]): string {
  return htmlDocuments.join('\n');
}

/**
 * Compile multiple templates with the same data and merge them
 */
export async function compileAndMergeTemplates(
  templatePaths: string[],
  data: Record<string, any>
): Promise<string> {
  const htmlDocuments: string[] = [];

  for (const templatePath of templatePaths) {
    try {
      const templateContent = loadTemplate(templatePath);
      const html = compileTemplate(templateContent, data);
      htmlDocuments.push(html);
    } catch (error: any) {
      console.error(`Failed to compile template ${templatePath}:`, error.message);
      // Continue with other templates even if one fails
    }
  }

  return mergeHtmlDocuments(htmlDocuments);
}

// ============================================================================
// HTML TO PDF CONVERTER
// ============================================================================

/**
 * Prepare HTML for preview - limits content and adds preview notices
 */
export function preparePreviewHtml(html: string, maxPages: number = 2): string {
  // Calculate approximate character limit for 2 pages
  // A4 page is roughly 3000-3500 characters with normal formatting
  const charsPerPage = 3500;
  const maxChars = maxPages * charsPerPage;

  // Truncate HTML intelligently (try to break at paragraph or section end)
  let truncatedHtml = html;
  if (html.length > maxChars) {
    truncatedHtml = html.substring(0, maxChars);

    // Try to end at a closing tag
    const lastClosingTag = Math.max(
      truncatedHtml.lastIndexOf('</p>'),
      truncatedHtml.lastIndexOf('</div>'),
      truncatedHtml.lastIndexOf('</section>'),
      truncatedHtml.lastIndexOf('</h1>'),
      truncatedHtml.lastIndexOf('</h2>'),
      truncatedHtml.lastIndexOf('</h3>')
    );

    if (lastClosingTag > maxChars * 0.8) {
      truncatedHtml = truncatedHtml.substring(0, lastClosingTag + 4); // Include closing tag
    }
  }

  // Add preview header
  const previewHeader = `
    <div style="background-color: #ffebee; border: 3px solid #c62828; padding: 20px; margin-bottom: 30px; text-align: center;">
      <h2 style="color: #c62828; margin: 0 0 10px 0; font-size: 24pt;">
        🔒 PREVIEW ONLY - LIMITED VIEW
      </h2>
      <p style="margin: 0; font-size: 12pt; color: #333;">
        This preview shows only the first ${maxPages} page${maxPages > 1 ? 's' : ''} of your complete document.<br/>
        <strong>Purchase to unlock the full document plus bonus materials.</strong>
      </p>
    </div>
  `;

  // Add preview footer with bonus documents info
  const previewFooter = `
    <div class="page-break"></div>
    <div style="background-color: #e3f2fd; border: 2px solid #1976d2; padding: 25px; margin-top: 30px;">
      <h2 style="color: #1976d2; margin: 0 0 15px 0; font-size: 18pt; text-align: center;">
        ✨ What You Get With Full Purchase
      </h2>
      <div style="font-size: 11pt; line-height: 1.8;">
        <p style="margin: 10px 0;"><strong style="color: #1976d2;">✓</strong> Complete ${html.length > maxChars ? 'multi-page' : ''} tenancy agreement (not just ${maxPages} pages)</p>
        <p style="margin: 10px 0;"><strong style="color: #1976d2;">✓</strong> Government model tenancy clauses (official template)</p>
        <p style="margin: 10px 0;"><strong style="color: #1976d2;">✓</strong> Deposit protection certificate template</p>
        <p style="margin: 10px 0;"><strong style="color: #1976d2;">✓</strong> Professional inventory template</p>
        <p style="margin: 10px 0;"><strong style="color: #1976d2;">✓</strong> How-to-Rent booklet (government required)</p>
        <p style="margin: 10px 0;"><strong style="color: #1976d2;">✓</strong> Unlimited revisions for 12 months</p>
        <p style="margin: 10px 0;"><strong style="color: #1976d2;">✓</strong> Expert support from qualified legal professionals</p>
      </div>
      <div style="background-color: #fff; padding: 15px; margin-top: 20px; text-align: center; border-radius: 5px;">
        <p style="margin: 0; font-size: 13pt; color: #c62828; font-weight: bold;">
          🔒 This is a PREVIEW ONLY - Not valid for legal use
        </p>
        <p style="margin: 10px 0 0 0; font-size: 10pt; color: #666;">
          Purchase required to receive court-ready documents
        </p>
      </div>
    </div>
  `;

  return previewHeader + truncatedHtml + previewFooter;
}

/**
 * Convert HTML to PDF using Puppeteer
 */
export async function htmlToPdf(
  html: string,
  options?: {
    watermark?: string;
    pageSize?: 'A4' | 'Letter';
    margins?: { top: string; right: string; bottom: string; left: string };
  }
): Promise<Buffer> {
  let browser;

  if (PDF_DEBUG) {
    console.log('[PDF_DEBUG] htmlToPdf() called');
    console.log('[PDF_DEBUG] Input HTML length:', html.length);
    console.log('[PDF_DEBUG] Input HTML first 300 chars:', html.substring(0, 300));
    console.log('[PDF_DEBUG] isFullHtmlDocument in htmlToPdf:', isFullHtmlDocument(html));
  }

  try {
    browser = await getBrowser();

    const page = await browser.newPage();

    // Determine what HTML to use for PDF generation
    let finalHtml: string;

    if (isFullHtmlDocument(html)) {
      if (PDF_DEBUG) {
        console.log('[PDF_DEBUG] Full HTML document detected - passing through without wrapper');
      }
      // Full HTML documents already have their own structure and styles
      // Pass them directly to Puppeteer without wrapping in another HTML shell

      // Only inject @page rules if NOT already present in the HTML
      // This preserves the template's intended margins (e.g., from print.css)
      const hasPageRules = /@page\s*\{/i.test(html);

      if (hasPageRules) {
        // Template has its own @page rules - use HTML as-is
        // The template (via print.css or embedded styles) controls margins
        if (PDF_DEBUG) {
          console.log('[PDF_DEBUG] @page rules already present - using HTML as-is');
        }
        finalHtml = html;
      } else {
        // No @page rules in template
        // Only inject @page rules when explicitly requested via options.margins
        // Otherwise, use minimal rules (margin: 0) to let template CSS control spacing
        if (PDF_DEBUG) {
          console.log('[PDF_DEBUG] No @page rules found - checking if margins explicitly requested');
        }

        if (options?.margins) {
          // Explicit margins requested - inject them
          if (PDF_DEBUG) {
            console.log('[PDF_DEBUG] Explicit margins provided - injecting @page rules');
          }
          const pageRules = `
    @page {
      size: ${options?.pageSize || 'A4'};
      margin: ${options.margins.top} ${options.margins.right} ${options.margins.bottom} ${options.margins.left};
    }`;

          // Inject @page rules before </style> or </head> if they exist
          if (html.includes('</style>')) {
            finalHtml = html.replace('</style>', `${pageRules}\n  </style>`);
          } else if (html.toLowerCase().includes('</head>')) {
            // Inject a style block before </head>
            finalHtml = html.replace(
              /<\/head>/i,
              `<style>${pageRules}\n  </style>\n</head>`
            );
          } else {
            // Fallback: use as-is (rare case)
            finalHtml = html;
          }
        } else {
          // No explicit margins - inject minimal @page with 0 margins
          // Let the template's CSS (body padding, etc.) control spacing
          if (PDF_DEBUG) {
            console.log('[PDF_DEBUG] No explicit margins - injecting @page with margin: 0');
          }
          const pageRules = `
    @page {
      size: ${options?.pageSize || 'A4'};
      margin: 0;
    }`;

          // Inject @page rules before </style> or </head> if they exist
          if (html.includes('</style>')) {
            finalHtml = html.replace('</style>', `${pageRules}\n  </style>`);
          } else if (html.toLowerCase().includes('</head>')) {
            // Inject a style block before </head>
            finalHtml = html.replace(
              /<\/head>/i,
              `<style>${pageRules}\n  </style>\n</head>`
            );
          } else {
            // Fallback: use as-is (rare case)
            finalHtml = html;
          }
        }
      }
    } else {
      if (PDF_DEBUG) {
        console.log('[PDF_DEBUG] NOT a full HTML document - wrapping in default HTML structure');
      }
      // Wrap non-full HTML in proper HTML structure with styling
      finalHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      max-width: 100%;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 16pt;
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
    }
    h2 {
      font-size: 14pt;
      font-weight: bold;
      margin: 15px 0 10px 0;
      border-bottom: 1px solid #000;
      padding-bottom: 5px;
    }
    h3 {
      font-size: 13pt;
      font-weight: bold;
      margin: 12px 0 8px 0;
    }
    h4 {
      font-size: 12pt;
      font-weight: bold;
      margin: 10px 0 5px 0;
    }
    p {
      margin: 8px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    table, th, td {
      border: 1px solid #000;
    }
    th, td {
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    strong {
      font-weight: bold;
    }
    ul, ol {
      margin: 10px 0;
      padding-left: 30px;
    }
    li {
      margin: 5px 0;
    }
    hr {
      border: none;
      border-top: 2px solid #000;
      margin: 20px 0;
    }
    .page-break {
      page-break-after: always;
    }
    .page-break-before {
      page-break-before: always;
      break-before: page;
    }
    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .ground-block {
      page-break-before: always;
      break-before: page;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    /* Prevent ugly page splits for key content blocks */
    table {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    h2, h3, h4 {
      page-break-after: avoid;
      break-after: avoid;
    }
    h2 + p, h3 + p, h4 + p, h2 + ul, h3 + ul, h4 + ul {
      page-break-before: avoid;
      break-before: avoid;
    }
    .section, .warning, .critical, .info-box, .success, .checklist, .evidence-item {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .ground, .ground-detail, .clause {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .timeline, .timeline-step, .cost-breakdown, .checklist-item {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    /* Ensure arrears tables don't split */
    .arrears-table, .arrears-breakdown {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    @page {
      size: ${options?.pageSize || 'A4'};
      margin: ${options?.margins?.top || '2cm'} ${options?.margins?.right || '2cm'} ${options?.margins?.bottom || '2cm'} ${options?.margins?.left || '2cm'};
    }
    @media print {
      body {
        margin: 0;
      }
    }
  </style>
</head>
<body>
${html}
</body>
</html>
      `;
    }

    // Debug: Write final HTML to file for inspection
    if (PDF_DEBUG) {
      console.log('[PDF_DEBUG] finalHtml length:', finalHtml.length);
      console.log('[PDF_DEBUG] finalHtml first 500 chars:', finalHtml.substring(0, 500));
      // Check if styles are present
      const styleMatch = finalHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      if (styleMatch) {
        console.log('[PDF_DEBUG] Style block found, length:', styleMatch[1].length);
        console.log('[PDF_DEBUG] Style block first 300 chars:', styleMatch[1].substring(0, 300));
      } else {
        console.log('[PDF_DEBUG] WARNING: No style block found in finalHtml!');
      }
      // Write to /tmp for inspection
      try {
        const fs = await import('fs/promises');
        await fs.writeFile('/tmp/form6a.final.html', finalHtml, 'utf-8');
        console.log('[PDF_DEBUG] Wrote finalHtml to /tmp/form6a.final.html');
      } catch (writeErr) {
        console.log('[PDF_DEBUG] Failed to write debug file:', writeErr);
      }
    }

    // Use networkidle2 instead of networkidle0 for more resilient waiting
    // networkidle2 waits for ≤2 network connections vs 0, preventing timeout
    // on complex templates like Form 6A with embedded resources
    await page.setContent(finalHtml, {
      waitUntil: 'networkidle2',
      timeout: 45000  // Explicit 45s timeout (up from default 30s)
    });

    // ====================================================================================
    // WATERMARK REMOVED - Simplified UX Change
    // ====================================================================================
    // Watermarks have been removed from all PDFs as part of the simplified notice-only
    // validation UX. Preview and final PDFs are now generated without watermarks.
    // Server-side validation at /api/wizard/generate remains the hard stop for compliance.
    // See docs/pdf-watermark-audit.md for details on the removal.
    // ====================================================================================

    // For full HTML templates, prefer CSS @page rules so template controls margins
    // For non-full HTML (wrapped content), use format option
    const isFullHtml = isFullHtmlDocument(html);

    // IMPORTANT: For full HTML templates, do NOT pass margin option at all.
    // Let the template's @page CSS rules control margins entirely.
    // Only pass margin for non-full-HTML where we inject our own @page rules.
    const pdfOptions: Parameters<typeof page.pdf>[0] = {
      format: options?.pageSize || 'A4',
      printBackground: true,
      preferCSSPageSize: isFullHtml,
    };

    // For non-full-HTML, the injected @page rules handle margins via CSS,
    // so we still don't need to pass Puppeteer margin options.
    // The @page CSS rules are already in the finalHtml.

    const pdf = await page.pdf(pdfOptions);

    return Buffer.from(pdf);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// ============================================================================
// DOCUMENT GENERATOR
// ============================================================================

/**
 * Generate a document from a template
 */
export async function generateDocument(
  options: DocumentGenerationOptions
): Promise<GeneratedDocument> {
  const { templatePath, data, isPreview = false, outputFormat = 'both', debugStamp } = options;

  // Load template
  const templateContent = loadTemplate(templatePath);

  // Add preview flag to data
  const enrichedData = {
    ...data,
    is_preview: isPreview,
  };

  // Compile template
  let html = compileTemplate(templateContent, enrichedData);

  // Inject debug stamp if enabled (dev only)
  if (debugStamp) {
    const { addDebugStampToHtml } = await import('./debug-stamp');
    const templateFiles = [templatePath, ...(debugStamp.additionalTemplates || [])];
    html = addDebugStampToHtml(html, {
      generatorName: debugStamp.generatorName,
      templateFiles,
      caseId: debugStamp.caseId,
    });
  }

  // =============================================================================
  // ISO DATE SANITIZATION SAFEGUARD (Feb 2026)
  // Final check to catch any ISO dates (YYYY-MM-DD) that slip through normalization.
  // IMPORTANT: Form 3 (Section 8) is EXCLUDED from this check per requirements.
  // =============================================================================
  const isForm3Section8 = templatePath.toLowerCase().includes('form_3') ||
                          templatePath.toLowerCase().includes('section8') ||
                          templatePath.toLowerCase().includes('section_8');

  if (!isForm3Section8) {
    const { html: sanitizedHtml, replacements } = sanitizeISODatesInHTML(html, {
      documentType: templatePath,
    });
    html = sanitizedHtml;

    // Log if we had to fix any dates (indicates a normalization gap that should be fixed upstream)
    if (replacements.length > 0) {
      console.warn(
        `[generateDocument] ISO date sanitizer fixed ${replacements.length} date(s) in ${templatePath}. ` +
        `This indicates a normalization gap that should be fixed upstream.`
      );
    }

    // =============================================================================
    // PDF TEXT LAYER VALIDATION (Feb 2026)
    // Ensure consistency between visual content and PDF text layer:
    // - No ISO dates (YYYY-MM-DD) in visible text
    // - No blank date fields where labels exist without values
    // This prevents cases where "Generated:" appears visually but extracts as blank.
    // =============================================================================
    const validation = validateHtmlForPdfTextLayer(html, {
      documentType: templatePath,
    });

    if (!validation.valid) {
      // Log validation warnings but don't fail - the sanitizer already fixed ISO dates
      console.warn(
        `[generateDocument] PDF text layer validation warnings for ${templatePath}:`,
        validation.warnings
      );
    }
  }

  const metadata = {
    templateUsed: templatePath,
    generatedAt: new Date().toISOString(),
    documentId: generateDocumentId(),
    isPreview,
  };

  // Generate PDF if requested
  let pdf: Buffer | undefined;
  if (outputFormat === 'pdf' || outputFormat === 'both') {
    try {
      // WATERMARK REMOVED - Simplified UX Change
      // All PDFs are now generated without watermarks (preview and final)
      // See docs/pdf-watermark-audit.md for details
      pdf = await htmlToPdf(html, {});
    } catch (error: any) {
      console.warn(`⚠️  PDF generation skipped: ${error.message}`);
      console.warn('   HTML output will still be generated.');
      if (outputFormat === 'pdf') {
        throw new Error(`PDF generation failed: ${error.message}`);
      }
    }
  }

  return {
    html,
    pdf,
    metadata,
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Generate a unique document ID
 */
function generateDocumentId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `DOC-${timestamp}-${random}`.toUpperCase();
}

/**
 * Save a PDF to file
 */
export async function savePdf(pdfBuffer: Buffer, outputPath: string): Promise<void> {
  const fs = await import('fs/promises');
  await fs.writeFile(outputPath, pdfBuffer);
}

// ============================================================================
// PREVIEW THUMBNAIL GENERATION
// ============================================================================

/**
 * Generate a watermarked JPEG thumbnail of the first page of a document
 * Used for document preview cards on the checkout page
 */
export async function htmlToPreviewThumbnail(
  html: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    watermarkText?: string;
  }
): Promise<Buffer> {
  const width = options?.width || 400;
  const height = options?.height || 566; // A4 aspect ratio (1:1.414)
  const quality = options?.quality || 80;
  const watermarkText = options?.watermarkText || 'PREVIEW';

  let browser;

  try {
    browser = await getBrowser();

    const page = await browser.newPage();

    // Set viewport to A4-like dimensions for rendering
    await page.setViewport({
      width: 794, // A4 width at 96 DPI
      height: 1123, // A4 height at 96 DPI
      deviceScaleFactor: 1,
    });

    // Add watermark overlay to the HTML
    const watermarkedHtml = addWatermarkOverlay(html, watermarkText);

    // Check if it's a full HTML document or fragment
    const finalHtml = isFullHtmlDocument(watermarkedHtml)
      ? watermarkedHtml
      : wrapHtmlFragment(watermarkedHtml);

    // Use 'domcontentloaded' instead of 'networkidle0' for faster rendering
    // since we're setting content directly, not loading external resources
    await page.setContent(finalHtml, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    // Take screenshot of the first page only
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality,
      clip: {
        x: 0,
        y: 0,
        width: 794,
        height: 1123,
      },
    });

    // Close browser
    await browser.close();

    // Resize if needed (Puppeteer returns full size, we may want smaller)
    // For now, return as-is - can add sharp/jimp for resizing if needed
    return screenshot as Buffer;
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

/**
 * Add a diagonal watermark overlay to HTML content
 */
function addWatermarkOverlay(html: string, watermarkText: string): string {
  const watermarkStyles = `
    <style>
      .preview-watermark-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
      }
      .preview-watermark-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 120px;
        font-weight: bold;
        color: rgba(200, 200, 200, 0.3);
        white-space: nowrap;
        font-family: Arial, sans-serif;
        text-transform: uppercase;
        letter-spacing: 20px;
      }
      .preview-watermark-repeat {
        position: absolute;
        width: 200%;
        height: 200%;
        top: -50%;
        left: -50%;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        transform: rotate(-45deg);
      }
      .preview-watermark-item {
        font-size: 48px;
        font-weight: bold;
        color: rgba(180, 180, 180, 0.15);
        padding: 60px 80px;
        font-family: Arial, sans-serif;
        text-transform: uppercase;
      }
    </style>
  `;

  // Create repeating watermark pattern
  const watermarkItems = Array(20).fill(`<span class="preview-watermark-item">${watermarkText}</span>`).join('');

  const watermarkOverlay = `
    <div class="preview-watermark-overlay">
      <div class="preview-watermark-text">${watermarkText}</div>
      <div class="preview-watermark-repeat">
        ${watermarkItems}
      </div>
    </div>
  `;

  // Inject watermark into HTML
  if (html.toLowerCase().includes('</body>')) {
    // Insert before closing body tag
    return html.replace(
      /<\/body>/i,
      `${watermarkStyles}${watermarkOverlay}</body>`
    );
  } else if (html.toLowerCase().includes('</html>')) {
    // Insert before closing html tag
    return html.replace(
      /<\/html>/i,
      `${watermarkStyles}${watermarkOverlay}</html>`
    );
  } else {
    // Append to end
    return html + watermarkStyles + watermarkOverlay;
  }
}

/**
 * Wrap an HTML fragment in a basic document structure for thumbnail rendering
 */
function wrapHtmlFragment(fragment: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.5;
          margin: 0;
          padding: 40px;
          background: white;
        }
        h1 { font-size: 18pt; font-weight: bold; margin: 0 0 15px 0; }
        h2 { font-size: 14pt; font-weight: bold; margin: 15px 0 10px 0; }
        h3 { font-size: 13pt; font-weight: bold; margin: 12px 0 8px 0; }
        p { margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        table, th, td { border: 1px solid #000; }
        th, td { padding: 8px; text-align: left; }
        th { background-color: #f0f0f0; font-weight: bold; }
      </style>
    </head>
    <body>
      ${fragment}
    </body>
    </html>
  `;
}

/**
 * Download PDF bytes from URL with timeout and retry
 * Handles Supabase signed URLs which may have Content-Disposition: attachment
 */
async function downloadPdfBytes(
  pdfUrl: string,
  options?: {
    timeoutMs?: number;
    maxRetries?: number;
  }
): Promise<{ bytes: Buffer; contentType: string; size: number }> {
  const timeoutMs = options?.timeoutMs || 10000;
  const maxRetries = options?.maxRetries || 1;

  const transientErrors = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN', 'ERR_ABORTED'];

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[PDF Download] Attempt ${attempt + 1}/${maxRetries + 1} for URL: ${pdfUrl.substring(0, 100)}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(pdfUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/pdf, */*',
          'User-Agent': 'LandlordHeavenPDFThumbnail/1.0',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || 'application/pdf';
      const arrayBuffer = await response.arrayBuffer();
      const bytes = Buffer.from(arrayBuffer);

      console.log(`[PDF Download] Success: ${bytes.length} bytes, type: ${contentType}`);

      return {
        bytes,
        contentType,
        size: bytes.length,
      };
    } catch (error: any) {
      lastError = error;
      const errorMsg = error.message || String(error);
      const isTransient = transientErrors.some(te => errorMsg.includes(te)) || error.name === 'AbortError';

      console.error(`[PDF Download] Attempt ${attempt + 1} failed:`, errorMsg);

      if (!isTransient || attempt >= maxRetries) {
        throw new Error(`PDF download failed after ${attempt + 1} attempts: ${errorMsg}`);
      }

      // Exponential backoff: 1s, 2s
      const delay = 1000 * (attempt + 1);
      console.log(`[PDF Download] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('PDF download failed');
}

/**
 * Generate a watermarked JPEG thumbnail from a PDF URL
 *
 * FIXED: Uses PDF.js in-browser rendering instead of page.goto(pdfUrl)
 * which fails with net::ERR_ABORTED on both remote and local PDF URLs
 * in Vercel's serverless Chromium environment.
 *
 * New approach:
 * 1. Download PDF bytes using fetch (with timeout + retry)
 * 2. Create HTML page with PDF.js that renders PDF from base64
 * 3. Use Puppeteer to render the HTML page (works reliably)
 * 4. Add watermark overlay
 */
export async function pdfToPreviewThumbnail(
  pdfUrl: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    watermarkText?: string;
    documentId?: string;
  }
): Promise<Buffer> {
  const width = options?.width || 400;
  const height = options?.height || 566; // A4 aspect ratio (1:1.414)
  const quality = options?.quality || 80;
  const watermarkText = options?.watermarkText || 'PREVIEW';
  const documentId = options?.documentId || `pdf-${Date.now()}`;

  let browser;
  const startTime = Date.now();

  try {
    // Step 1: Download PDF bytes (avoids net::ERR_ABORTED from Chromium navigation)
    console.log(`[pdfToPreviewThumbnail] Starting for document: ${documentId}`);
    console.log(`[pdfToPreviewThumbnail] URL hostname: ${new URL(pdfUrl).hostname}`);

    const downloadStart = Date.now();
    const { bytes: pdfBytes, size: pdfSize } = await downloadPdfBytes(pdfUrl);
    const downloadTime = Date.now() - downloadStart;

    console.log(`[pdfToPreviewThumbnail] Downloaded ${pdfSize} bytes in ${downloadTime}ms`);

    // Validate PDF header
    const pdfHeader = pdfBytes.slice(0, 5).toString('utf-8');
    if (!pdfHeader.startsWith('%PDF-')) {
      throw new Error(`Invalid PDF: Header "${pdfHeader}" does not start with %PDF-`);
    }

    // Step 2: Convert PDF bytes to base64 for embedding in HTML
    const pdfBase64 = pdfBytes.toString('base64');
    console.log(`[pdfToPreviewThumbnail] PDF base64 length: ${pdfBase64.length}`);

    // Step 3: Create HTML page with PDF.js that renders PDF from base64
    // This avoids any file:// or http:// navigation - everything is inline
    const renderStart = Date.now();
    browser = await getBrowser();

    const page = await browser.newPage();

    // Set viewport to A4-like dimensions for rendering
    await page.setViewport({
      width: 794, // A4 width at 96 DPI
      height: 1123, // A4 height at 96 DPI
      deviceScaleFactor: 1,
    });

    // Create HTML with inline PDF.js that renders the PDF to canvas
    // Using unpkg CDN for PDF.js (loaded via script tag)
    const pdfJsHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 794px;
      height: 1123px;
      background: white;
      overflow: hidden;
    }
    #pdf-container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      background: white;
    }
    canvas {
      max-width: 100%;
      max-height: 100%;
    }
    #error {
      color: red;
      padding: 20px;
      font-family: sans-serif;
    }
    #loading {
      padding: 20px;
      font-family: sans-serif;
      color: #666;
    }
  </style>
</head>
<body>
  <div id="pdf-container">
    <div id="loading">Loading PDF...</div>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs" type="module"></script>
  <script type="module">
    // PDF.js worker
    const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

    const container = document.getElementById('pdf-container');

    try {
      // Decode base64 PDF
      const pdfData = atob('${pdfBase64}');
      const pdfBytes = new Uint8Array(pdfData.length);
      for (let i = 0; i < pdfData.length; i++) {
        pdfBytes[i] = pdfData.charCodeAt(i);
      }

      // Load PDF
      const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
      const pdf = await loadingTask.promise;

      // Render first page
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 }); // Higher scale for quality

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext('2d');
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // Replace loading with canvas
      container.innerHTML = '';
      container.appendChild(canvas);

      // Signal render complete
      window.pdfRendered = true;
    } catch (err) {
      container.innerHTML = '<div id="error">Failed to render PDF: ' + err.message + '</div>';
      window.pdfError = err.message;
    }
  </script>
</body>
</html>
`;

    // Set content and wait for PDF.js to render
    await page.setContent(pdfJsHtml, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for PDF.js to finish rendering (check for pdfRendered flag)
    await page.waitForFunction('window.pdfRendered === true || window.pdfError', {
      timeout: 15000,
    });

    // Check for errors
    const pdfError = await page.evaluate(() => (window as any).pdfError);
    if (pdfError) {
      throw new Error(`PDF.js rendering failed: ${pdfError}`);
    }

    // Additional wait for canvas to fully paint
    await new Promise(resolve => setTimeout(resolve, 500));

    // Take screenshot of first page
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality,
      clip: {
        x: 0,
        y: 0,
        width: 794,
        height: 1123,
      },
    });

    const renderTime = Date.now() - renderStart;
    console.log(`[pdfToPreviewThumbnail] Screenshot captured in ${renderTime}ms`);

    await browser.close();

    // Step 4: Add watermark overlay
    browser = await getBrowser();

    const watermarkPage = await browser.newPage();
    await watermarkPage.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1,
    });

    // Create HTML with the screenshot as background and watermark overlay
    const base64Image = (screenshot as Buffer).toString('base64');
    const watermarkHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 794px;
            height: 1123px;
            position: relative;
            background-image: url(data:image/jpeg;base64,${base64Image});
            background-size: cover;
            background-position: top left;
          }
          .watermark-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            overflow: hidden;
          }
          .watermark-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            font-weight: bold;
            color: rgba(200, 200, 200, 0.4);
            white-space: nowrap;
            font-family: Arial, sans-serif;
            text-transform: uppercase;
            letter-spacing: 20px;
          }
          .watermark-repeat {
            position: absolute;
            width: 200%;
            height: 200%;
            top: -50%;
            left: -50%;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            transform: rotate(-45deg);
          }
          .watermark-item {
            font-size: 48px;
            font-weight: bold;
            color: rgba(180, 180, 180, 0.2);
            padding: 60px 80px;
            font-family: Arial, sans-serif;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="watermark-overlay">
          <div class="watermark-text">${watermarkText}</div>
          <div class="watermark-repeat">
            ${Array(20).fill(`<span class="watermark-item">${watermarkText}</span>`).join('')}
          </div>
        </div>
      </body>
      </html>
    `;

    await watermarkPage.setContent(watermarkHtml, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    // Take final screenshot with watermark
    const finalScreenshot = await watermarkPage.screenshot({
      type: 'jpeg',
      quality,
      clip: {
        x: 0,
        y: 0,
        width: width,
        height: height,
      },
    });

    await browser.close();
    browser = null;

    const totalTime = Date.now() - startTime;
    console.log(`[pdfToPreviewThumbnail] Complete in ${totalTime}ms (download: ${downloadTime}ms, render: ${renderTime}ms)`);

    return finalScreenshot as Buffer;
  } catch (error: any) {
    console.error(`[pdfToPreviewThumbnail] Error:`, error.message);
    throw error;
  } finally {
    // Cleanup: close browser
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Convert PDF bytes directly to a preview thumbnail JPEG.
 * Similar to pdfToPreviewThumbnail but takes raw bytes instead of URL.
 * Used for generating thumbnails from filled official PDFs (like N1 form).
 */
export async function pdfBytesToPreviewThumbnail(
  pdfBytes: Buffer | Uint8Array,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    watermarkText?: string;
    documentId?: string;
  }
): Promise<Buffer> {
  const width = options?.width || 400;
  const height = options?.height || 566; // A4 aspect ratio (1:1.414)
  const quality = options?.quality || 80;
  const watermarkText = options?.watermarkText || 'PREVIEW';
  const documentId = options?.documentId || `pdf-bytes-${Date.now()}`;

  let browser;
  const startTime = Date.now();

  try {
    console.log(`[pdfBytesToPreviewThumbnail] Starting for document: ${documentId}`);
    console.log(`[pdfBytesToPreviewThumbnail] Input size: ${pdfBytes.length} bytes`);

    // Validate PDF header
    const pdfBuffer = Buffer.isBuffer(pdfBytes) ? pdfBytes : Buffer.from(pdfBytes);
    const pdfHeader = pdfBuffer.slice(0, 5).toString('utf-8');
    if (!pdfHeader.startsWith('%PDF-')) {
      throw new Error(`Invalid PDF: Header "${pdfHeader}" does not start with %PDF-`);
    }

    // Convert PDF bytes to base64 for embedding in HTML
    const pdfBase64 = pdfBuffer.toString('base64');
    console.log(`[pdfBytesToPreviewThumbnail] PDF base64 length: ${pdfBase64.length}`);

    // Create HTML page with PDF.js that renders PDF from base64
    const renderStart = Date.now();
    browser = await getBrowser();

    const page = await browser.newPage();

    // Set viewport to A4-like dimensions for rendering
    await page.setViewport({
      width: 794, // A4 width at 96 DPI
      height: 1123, // A4 height at 96 DPI
      deviceScaleFactor: 1,
    });

    // Create HTML with inline PDF.js that renders the PDF to canvas
    const pdfJsHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 794px;
      height: 1123px;
      background: white;
      overflow: hidden;
    }
    #pdf-container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      background: white;
    }
    canvas {
      max-width: 100%;
      max-height: 100%;
    }
    #error {
      color: red;
      padding: 20px;
      font-family: sans-serif;
    }
    #loading {
      padding: 20px;
      font-family: sans-serif;
      color: #666;
    }
  </style>
</head>
<body>
  <div id="pdf-container">
    <div id="loading">Loading PDF...</div>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs" type="module"></script>
  <script type="module">
    // PDF.js worker
    const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

    const container = document.getElementById('pdf-container');

    try {
      // Decode base64 PDF
      const pdfData = atob('${pdfBase64}');
      const pdfBytes = new Uint8Array(pdfData.length);
      for (let i = 0; i < pdfData.length; i++) {
        pdfBytes[i] = pdfData.charCodeAt(i);
      }

      // Load PDF
      const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
      const pdf = await loadingTask.promise;

      // Render first page
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 }); // Higher scale for quality

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext('2d');
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // Replace loading with canvas
      container.innerHTML = '';
      container.appendChild(canvas);

      // Signal render complete
      window.pdfRendered = true;
    } catch (err) {
      container.innerHTML = '<div id="error">Failed to render PDF: ' + err.message + '</div>';
      window.pdfError = err.message;
    }
  </script>
</body>
</html>
`;

    // Set content and wait for PDF.js to render
    await page.setContent(pdfJsHtml, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for PDF.js to finish rendering (check for pdfRendered flag)
    await page.waitForFunction('window.pdfRendered === true || window.pdfError', {
      timeout: 15000,
    });

    // Check for errors
    const pdfError = await page.evaluate(() => (window as any).pdfError);
    if (pdfError) {
      throw new Error(`PDF.js rendering failed: ${pdfError}`);
    }

    // Additional wait for canvas to fully paint
    await new Promise(resolve => setTimeout(resolve, 500));

    // Take screenshot of first page
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality,
      clip: {
        x: 0,
        y: 0,
        width: 794,
        height: 1123,
      },
    });

    const renderTime = Date.now() - renderStart;
    console.log(`[pdfBytesToPreviewThumbnail] Screenshot captured in ${renderTime}ms`);

    await browser.close();

    // Add watermark overlay
    browser = await getBrowser();

    const watermarkPage = await browser.newPage();
    await watermarkPage.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1,
    });

    // Create HTML with the screenshot as background and watermark overlay
    const base64Image = (screenshot as Buffer).toString('base64');
    const watermarkHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 794px;
            height: 1123px;
            position: relative;
            background-image: url(data:image/jpeg;base64,${base64Image});
            background-size: cover;
            background-position: top left;
          }
          .watermark-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            overflow: hidden;
          }
          .watermark-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            font-weight: bold;
            color: rgba(200, 200, 200, 0.4);
            white-space: nowrap;
            font-family: Arial, sans-serif;
            text-transform: uppercase;
            letter-spacing: 20px;
          }
          .watermark-repeat {
            position: absolute;
            width: 200%;
            height: 200%;
            top: -50%;
            left: -50%;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            transform: rotate(-45deg);
          }
          .watermark-item {
            font-size: 48px;
            font-weight: bold;
            color: rgba(180, 180, 180, 0.2);
            padding: 60px 80px;
            font-family: Arial, sans-serif;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="watermark-overlay">
          <div class="watermark-text">${watermarkText}</div>
          <div class="watermark-repeat">
            ${Array(20).fill(`<span class="watermark-item">${watermarkText}</span>`).join('')}
          </div>
        </div>
      </body>
      </html>
    `;

    await watermarkPage.setContent(watermarkHtml, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    // Take final screenshot with watermark
    const finalScreenshot = await watermarkPage.screenshot({
      type: 'jpeg',
      quality,
      clip: {
        x: 0,
        y: 0,
        width: width,
        height: height,
      },
    });

    await browser.close();
    browser = null;

    const totalTime = Date.now() - startTime;
    console.log(`[pdfBytesToPreviewThumbnail] Complete in ${totalTime}ms (render: ${renderTime}ms)`);

    return finalScreenshot as Buffer;
  } catch (error: any) {
    console.error(`[pdfBytesToPreviewThumbnail] Error:`, error.message);
    throw error;
  } finally {
    // Cleanup: close browser
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}
