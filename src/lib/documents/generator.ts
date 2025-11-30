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

  // Format date
  Handlebars.registerHelper('format_date', function (date, format) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    if (format === 'DD/MM/YYYY') {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }

    return d.toLocaleDateString('en-GB');
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

  // Array contains
  Handlebars.registerHelper('contains', function (array, value) {
    return Array.isArray(array) && array.includes(value);
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
}

// Register helpers once
registerHandlebarsHelpers();

// ============================================================================
// TEMPLATE LOADER
// ============================================================================

/**
 * Load a Handlebars template from the file system
 */
export function loadTemplate(templatePath: string): string {
  const fullPath = join(process.cwd(), 'config', 'jurisdictions', templatePath);

  try {
    const templateContent = readFileSync(fullPath, 'utf-8');
    return templateContent;
  } catch (error: any) {
    throw new Error(`Failed to load template ${templatePath}: ${error.message}`);
  }
}

/**
 * Compile a template with data
 */
export function compileTemplate(templateContent: string, data: Record<string, any>): string {
  try {
    // Add generation metadata
    const enrichedData = {
      ...data,
      generation_date: new Date().toISOString().split('T')[0],
      generation_timestamp: new Date().toISOString(),
      document_id: generateDocumentId(),
    };

    const template = Handlebars.compile(templateContent);
    const html = template(enrichedData);

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
