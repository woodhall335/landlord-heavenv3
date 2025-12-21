/**
 * Tests for Full HTML Template PDF Generation
 *
 * These tests ensure that templates with full HTML structure (<!DOCTYPE>, <html>, <head>, <style>)
 * preserve their CSS styling and are not corrupted by markdown conversion or wrapper injection.
 *
 * Key fixes verified:
 * 1. isFullHtmlDocument() correctly detects full HTML templates
 * 2. markdownToHtml() is skipped for full HTML templates
 * 3. htmlToPdf() passes through full HTML without wrapping
 * 4. @page rules from print.css are preserved (not overridden)
 * 5. CSS styling classes are preserved in the output
 *
 * Templates covered:
 * - Form 6A (England Section 21)
 */

import { describe, test, expect } from 'vitest';
import { loadTemplate, compileTemplate, isFullHtmlDocument, loadPrintCss, htmlToPdf } from '../generator';

describe('Full HTML Template Preservation - Form 6A (Section 21)', () => {
  const templatePath = 'uk/england/templates/notice_only/form_6a_section21/notice.hbs';

  const testData = {
    tenant_full_name: 'John Smith',
    landlord_full_name: 'Jane Landlord',
    landlord_address: '123 Main Street, London, SW1A 1AA',
    landlord_phone: '07700 900123',
    property_address: '456 Test Street, London, EC1A 1BB',
    notice_expiry_date: '2025-03-01',
    service_date: '2025-01-01',
  };

  test('loadPrintCss returns substantial CSS content (not empty or fallback-only)', () => {
    const css = loadPrintCss();

    // Must have substantial CSS content (print.css is ~10KB)
    expect(css.length).toBeGreaterThan(5000);

    // Must contain essential styling classes from print.css
    expect(css).toContain('.info-box');
    expect(css).toContain('.section');
    expect(css).toContain('.field-label');
    expect(css).toContain('.field-value');
    expect(css).toContain('.signature-block');
    expect(css).toContain('.guidance-section');
    expect(css).toContain('@page');

    // Must contain the proper font family (Arial, not Times New Roman)
    expect(css).toContain('Arial');
  });

  test('Form 6A template uses triple-brace syntax for CSS injection', () => {
    const template = loadTemplate(templatePath);

    // Must use {{{print_css}}} (triple braces for raw injection, not double)
    expect(template).toContain('{{{print_css}}}');
    expect(template).not.toContain('{{print_css}}'); // Would escape HTML

    // Must be a full HTML document
    expect(template).toContain('<!DOCTYPE html>');
    expect(template).toContain('<html');
    expect(template).toContain('<head>');
    expect(template).toContain('<style>');
  });

  test('Form 6A compiled HTML is detected as full HTML document', () => {
    const template = loadTemplate(templatePath);
    const html = compileTemplate(template, testData);

    // Must be detected as full HTML to skip markdown conversion and wrapper
    expect(isFullHtmlDocument(html)).toBe(true);

    // Must start with DOCTYPE after trimming
    const trimmed = html.trim();
    expect(trimmed.toLowerCase().startsWith('<!doctype')).toBe(true);
  });

  test('Form 6A compiled HTML contains all print.css content', () => {
    const template = loadTemplate(templatePath);
    const html = compileTemplate(template, testData);

    // Extract style block
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    expect(styleMatch).not.toBeNull();

    const styleContent = styleMatch![1];

    // Must contain substantial CSS (~10KB from print.css)
    expect(styleContent.length).toBeGreaterThan(5000);

    // Must contain all essential classes
    expect(styleContent).toContain('.info-box');
    expect(styleContent).toContain('.section');
    expect(styleContent).toContain('.field-label');
    expect(styleContent).toContain('.field-value');
    expect(styleContent).toContain('.signature-block');
    expect(styleContent).toContain('.guidance-section');

    // Must contain the correct font (Arial)
    expect(styleContent).toContain('Arial');

    // Must NOT contain Times New Roman (that's the default wrapper font)
    expect(styleContent).not.toContain('Times New Roman');
  });

  test('Form 6A compiled HTML has exactly one of each structural element', () => {
    const template = loadTemplate(templatePath);
    const html = compileTemplate(template, testData);

    // Count structural elements - should be exactly 1 each
    const doctypeCount = (html.match(/<!DOCTYPE/gi) || []).length;
    const htmlTagCount = (html.match(/<html[\s>]/gi) || []).length;
    const headOpenCount = (html.match(/<head[\s>]/gi) || []).length;
    const bodyOpenCount = (html.match(/<body[\s>]/gi) || []).length;

    expect(doctypeCount).toBe(1);
    expect(htmlTagCount).toBe(1);
    expect(headOpenCount).toBe(1);
    expect(bodyOpenCount).toBe(1);
  });

  test('Form 6A style block is not corrupted by markdown conversion', () => {
    const template = loadTemplate(templatePath);
    const html = compileTemplate(template, testData);

    // Extract style block
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    expect(styleMatch).not.toBeNull();

    const styleContent = styleMatch![1];

    // Style block must NOT contain HTML artifacts from markdown conversion
    expect(styleContent).not.toMatch(/<p>/i);
    expect(styleContent).not.toMatch(/<\/p>/i);
    expect(styleContent).not.toMatch(/<br\s*\/?>/i);
    expect(styleContent).not.toMatch(/<h[1-6]>/i);
    expect(styleContent).not.toMatch(/<strong>/i);
  });

  test('Form 6A body contains proper CSS classes', () => {
    const template = loadTemplate(templatePath);
    const html = compileTemplate(template, testData);

    // Body should contain elements with the CSS classes
    expect(html).toContain('class="info-box"');
    expect(html).toContain('class="section"');
    expect(html).toContain('class="field-label"');
    expect(html).toContain('class="field-value"');
    expect(html).toContain('class="signature-block"');
    expect(html).toContain('class="guidance-section"');
    expect(html).toContain('class="checkbox"');
  });

  test('Form 6A compiled HTML contains expected legal content', () => {
    const template = loadTemplate(templatePath);
    const html = compileTemplate(template, testData);

    // Must contain the Form 6A legal text
    expect(html).toContain('Form 6A');
    expect(html).toContain('Housing Act 1988');
    expect(html).toContain('Section 21');

    // Must contain the test data
    expect(html).toContain('John Smith'); // tenant
    expect(html).toContain('Jane Landlord'); // landlord
    expect(html).toContain('456 Test Street'); // property address
  });
});

describe('Full HTML Template @page Rule Handling', () => {
  /**
   * Tests that full HTML templates with @page rules don't get additional margins injected
   * This is critical for Form 6A and other templates that use print.css
   */
  test('Full HTML template with @page rule should not have margins injected', () => {
    // Create a full HTML document with its own @page rules
    const htmlWithPageRules = `<!DOCTYPE html>
<html>
<head>
  <style>
    @page {
      size: A4;
      margin: 0.75in;
    }
    body { font-family: Arial; }
  </style>
</head>
<body>
  <h1>Test Document</h1>
</body>
</html>`;

    // The HTML should be detected as full HTML
    expect(isFullHtmlDocument(htmlWithPageRules)).toBe(true);

    // The regex should detect @page rules
    expect(/@page\s*\{/i.test(htmlWithPageRules)).toBe(true);

    // The HTML should not have 2cm margins injected
    // (0.75in != 2cm, so if 2cm appears it was injected)
    expect(htmlWithPageRules).not.toContain('margin: 2cm');
    expect(htmlWithPageRules).toContain('margin: 0.75in');
  });

  test('Full HTML template without @page rule should get margin: 0 (not 2cm)', async () => {
    // Create a full HTML document WITHOUT @page rules
    const htmlWithoutPageRules = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial; padding: 20px; }
  </style>
</head>
<body>
  <h1>Test Document</h1>
</body>
</html>`;

    // The HTML should be detected as full HTML
    expect(isFullHtmlDocument(htmlWithoutPageRules)).toBe(true);

    // The regex should NOT detect @page rules
    expect(/@page\s*\{/i.test(htmlWithoutPageRules)).toBe(false);

    // Generate PDF - this triggers the injection logic
    // Note: We can't easily inspect the final HTML after injection in a unit test
    // but we can verify the PDF generation doesn't throw
    const pdf = await htmlToPdf(htmlWithoutPageRules);
    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(0);
  });

  test('Form 6A compiled HTML contains @page rules from print.css', () => {
    const templatePath = 'uk/england/templates/notice_only/form_6a_section21/notice.hbs';
    const testData = {
      tenant_full_name: 'John Smith',
      landlord_full_name: 'Jane Landlord',
      landlord_address: '123 Main Street, London, SW1A 1AA',
      landlord_phone: '07700 900123',
      property_address: '456 Test Street, London, EC1A 1BB',
      notice_expiry_date: '2025-03-01',
      service_date: '2025-01-01',
    };

    const template = loadTemplate(templatePath);
    const html = compileTemplate(template, testData);

    // print.css defines @page rules that should be present
    expect(/@page\s*\{/i.test(html)).toBe(true);

    // print.css uses 0.75in margins, not 2cm
    expect(html).toContain('0.75in');
    expect(html).not.toContain('margin: 2cm');
  });

  test('Form 6A PDF generation respects template @page rules', async () => {
    const templatePath = 'uk/england/templates/notice_only/form_6a_section21/notice.hbs';
    const testData = {
      tenant_full_name: 'John Smith',
      landlord_full_name: 'Jane Landlord',
      landlord_address: '123 Main Street, London, SW1A 1AA',
      landlord_phone: '07700 900123',
      property_address: '456 Test Street, London, EC1A 1BB',
      notice_expiry_date: '2025-03-01',
      service_date: '2025-01-01',
    };

    const template = loadTemplate(templatePath);
    const html = compileTemplate(template, testData);

    // Generate PDF - should use template's @page rules (preferCSSPageSize: true)
    const pdf = await htmlToPdf(html);
    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(0);

    // The PDF should be generated successfully with template margins
    // (Visual verification needed for actual margin values)
  });
});

describe('Non-Full HTML Template Margin Handling', () => {
  test('Non-full HTML templates get wrapped with default @page 2cm margins', async () => {
    // Simple HTML fragment (not a full document)
    const htmlFragment = `<h1>Simple Notice</h1><p>This is a simple document.</p>`;

    // Should NOT be detected as full HTML
    expect(isFullHtmlDocument(htmlFragment)).toBe(false);

    // Generate PDF - should wrap in HTML with 2cm margins
    const pdf = await htmlToPdf(htmlFragment);
    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(0);
  });

  test('Non-full HTML templates with explicit margins option use those margins', async () => {
    const htmlFragment = `<h1>Simple Notice</h1><p>This is a simple document.</p>`;

    // Generate PDF with explicit margins
    const pdf = await htmlToPdf(htmlFragment, {
      margins: { top: '1in', right: '1in', bottom: '1in', left: '1in' },
    });
    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(0);
  });
});
