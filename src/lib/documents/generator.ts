/**
 * Document Generator
 *
 * Generates legal documents (Section 8 notices, ASTs, letters) from Handlebars templates.
 * Converts to PDF using Puppeteer.
 */

import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
import puppeteer from 'puppeteer';
import { SITE_CONFIG } from '@/config/site';

// ============================================================================
// TYPES
// ============================================================================

export interface DocumentGenerationOptions {
  templatePath: string;
  data: Record<string, any>;
  isPreview?: boolean;
  outputFormat?: 'html' | 'pdf' | 'both';
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

  // Format date (UK format: DD/MM/YYYY, using UTC to avoid DST issues)
  Handlebars.registerHelper('format_date', function (date, format) {
    if (!date) return '';

    // Parse as UTC date-only
    const d = new Date(date + (typeof date === 'string' && !date.includes('T') ? 'T00:00:00.000Z' : ''));
    if (isNaN(d.getTime())) return '';

    // Always use DD/MM/YYYY for UK legal documents
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();

    if (format === 'long') {
      // "DD Month YYYY" format
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `${parseInt(day)} ${monthNames[d.getUTCMonth()]} ${year}`;
    }

    // Default: DD/MM/YYYY
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

  // Add days to a date (returns ISO format YYYY-MM-DD)
  Handlebars.registerHelper('add_days', function (dateString, days) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      date.setDate(date.getDate() + Number(days));
      return date.toISOString().split('T')[0];
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
}

// Register helpers once
registerHandlebarsHelpers();

// ============================================================================
// PRINT DESIGN SYSTEM
// ============================================================================

/**
 * Load and cache the centralized print.css stylesheet
 */
let cachedPrintCss: string | null = null;

export function loadPrintCss(): string {
  if (cachedPrintCss) {
    return cachedPrintCss;
  }

  try {
    const printCssPath = join(process.cwd(), 'config', 'jurisdictions', '_shared', 'print', 'print.css');
    cachedPrintCss = readFileSync(printCssPath, 'utf-8');
    console.log('[PRINT SYSTEM] ✅ Loaded print.css');
    return cachedPrintCss;
  } catch (error: any) {
    console.warn('[PRINT SYSTEM] ⚠️  Could not load print.css:', error.message);
    return ''; // Graceful fallback - templates will use inline styles
  }
}

/**
 * Register print component partials (from components.hbs)
 * These partials provide reusable layout components for notices
 */
let partialsRegistered = false;

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

// Initialize print system on module load
registerPrintPartials();

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
      `  - For Section 173: Use generateWalesSection173Notice() (auto-selects RHW16 or RHW17)\n` +
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
      `Wales templates are English-only prescribed forms (RHW16, RHW17, RHW23).`
    );
  }

  // Prevent absolute paths
  if (templatePath.startsWith('/')) {
    throw new Error(
      `[TEMPLATE GUARD] Template path must be relative to config/jurisdictions/\n` +
      `Received absolute path: ${templatePath}\n` +
      `Use relative paths like "uk/england/templates/eviction/section8_notice.hbs"`
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

/**
 * Compile a template with data
 */
export function compileTemplate(templateContent: string, data: Record<string, any>): string {
  try {
    // Add generation metadata + site config + print system
    const enrichedData = {
      ...data,
      generation_date: new Date().toISOString().split('T')[0],
      generation_timestamp: new Date().toISOString(),
      document_id: generateDocumentId(),
      // Site configuration (for footer, domain, etc.)
      site_domain: SITE_CONFIG.domain,
      site_name: SITE_CONFIG.name,
      site_url: SITE_CONFIG.url,
      support_email: SITE_CONFIG.support_email,
      // Print Design System CSS (for templates that use {{> print_head}} or {{{print_css}}})
      print_css: loadPrintCss(),
    };

    // Safe-convert all data values to prevent [object Object] leaks
    const safeData = Object.entries(enrichedData).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'object' && value !== null && !Array.isArray(value)
        ? safeText(value)
        : value;
      return acc;
    }, {} as Record<string, any>);

    const template = Handlebars.compile(templateContent);
    let html = template(safeData);

    // Convert markdown to HTML for PDF rendering
    html = markdownToHtml(html);

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

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Wrap in proper HTML structure with styling
    const styledHtml = `
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

    await page.setContent(styledHtml, { waitUntil: 'networkidle0' });

    // Add watermark if specified
    if (options?.watermark) {
      await page.evaluate((watermarkText) => {
        // Create watermark style that appears on EVERY page
        const style = document.createElement('style');
        style.textContent = `
          @media print {
            body::before {
              content: "${watermarkText}";
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 80px;
              font-weight: bold;
              color: rgba(255, 0, 0, 0.15);
              pointer-events: none;
              z-index: 9999;
              white-space: nowrap;
              text-transform: uppercase;
              letter-spacing: 5px;
            }
          }
          body::before {
            content: "${watermarkText}";
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            font-weight: bold;
            color: rgba(255, 0, 0, 0.15);
            pointer-events: none;
            z-index: 9999;
            white-space: nowrap;
            text-transform: uppercase;
            letter-spacing: 5px;
          }
        `;
        document.head.appendChild(style);
      }, options.watermark);
    }

    const pdf = await page.pdf({
      format: options?.pageSize || 'A4',
      printBackground: true,
      preferCSSPageSize: false,
    });

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
  const { templatePath, data, isPreview = false, outputFormat = 'both' } = options;

  // Load template
  const templateContent = loadTemplate(templatePath);

  // Add preview flag to data
  const enrichedData = {
    ...data,
    is_preview: isPreview,
  };

  // Compile template
  const html = compileTemplate(templateContent, enrichedData);

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
      const watermark = isPreview ? 'PREVIEW - NOT FOR COURT USE' : undefined;
      pdf = await htmlToPdf(html, { watermark });
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
