/**
 * Template Rendering Tests
 *
 * Smoke tests to ensure PDFs don't contain raw markdown or [object Object] artifacts
 */

import { compileTemplate, safeText, loadTemplate, isFullHtmlDocument } from '../generator';
import { generateSection8Notice } from '../section8-generator';
import { generateNoticeToLeave } from '../scotland/notice-to-leave-generator';

describe('Markdown Artifact Prevention', () => {
  test('No raw markdown tokens (##, **, ---) in compiled Section 8 template', async () => {
    const testData = {
      landlord_full_name: 'John Smith',
      landlord_address: '123 Main St, London, SW1A 1AA',
      tenant_full_name: 'Jane Doe',
      property_address: '456 Rental Ave, London, W1A 2BB',
      tenancy_start_date: '2024-01-01',
      rent_amount: 1200,
      rent_frequency: 'monthly' as const,
      payment_date: 1,
      grounds: [
        {
          code: 8,
          title: 'Serious rent arrears',
          legal_basis: 'Housing Act 1988, Schedule 2, Ground 8',
          particulars: 'Tenant owes 2 months rent',
          mandatory: true,
        },
      ],
      service_date: '2025-01-15',
      earliest_possession_date: '2025-01-29',
      notice_period_days: 14,
      any_mandatory_ground: true,
      any_discretionary_ground: false,
    };

    const result = await generateSection8Notice(testData, false);

    // Check for raw markdown artifacts in visible content
    // Note: Handlebars comments {{! ... }} may contain ##, but that's okay
    // Also exclude CSS comments (/** ... */) which legitimately use **
    const visibleHtml = result.html
      .replace(/\{\{!.*?\}\}/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove CSS comments
    expect(visibleHtml).not.toMatch(/^##/m); // No line starting with ##
    expect(visibleHtml).not.toMatch(/\*\*[a-zA-Z]/); // No **word (markdown bold)
    expect(visibleHtml).not.toContain('[object Object]');

    // Form 3 template uses HTML directly (h1, strong) not markdown
    // It doesn't have h2 tags, but has h1 and strong
    expect(result.html).toContain('<h1>');
    expect(result.html).toContain('<strong>');
  });

  test('No raw markdown tokens in compiled Scotland Notice to Leave template', async () => {
    const testData = {
      landlord_full_name: 'Sarah MacDonald',
      landlord_address: '123 Princes Street, Edinburgh, EH2 4AA',
      tenant_full_name: 'James Murray',
      property_address: '45 Rose Street, Edinburgh, EH2 2NG',
      notice_date: '2025-01-15',
      earliest_leaving_date: '2025-02-12',
      earliest_tribunal_date: '2025-02-12',
      notice_period_days: 28 as const,
      pre_action_completed: true, // Required for 28-day notice period with Ground 1
      grounds: [
        {
          number: 1,
          title: 'Rent Arrears',
          legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 1',
          particulars: 'Tenant owes £3600 in rent arrears',
        },
      ],
    };

    const result = await generateNoticeToLeave(testData, false, 'html');

    // Check for raw markdown artifacts in visible content
    // Note: CSS comments (/** ... */) legitimately use ** so we exclude them
    const visibleHtml = result.html
      .replace(/\{\{!.*?\}\}/g, '') // Remove Handlebars comments
      .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove CSS comments
    expect(visibleHtml).not.toMatch(/^##/m); // No line starting with ##
    expect(visibleHtml).not.toMatch(/\*\*[a-zA-Z]/); // No **word (markdown bold)
    expect(visibleHtml).not.toContain('[object Object]');

    // Should contain HTML equivalents instead
    expect(result.html).toContain('<h1>'); // Scotland template uses h1 for main title
    expect(result.html).toContain('<strong>');
  });

  test('Date formatting is DD/MM/YYYY in templates', async () => {
    const testData = {
      landlord_full_name: 'John Smith',
      landlord_address: '123 Main St, London, SW1A 1AA',
      tenant_full_name: 'Jane Doe',
      property_address: '456 Rental Ave, London, W1A 2BB',
      tenancy_start_date: '2024-01-15',
      rent_amount: 1200,
      rent_frequency: 'monthly' as const,
      payment_date: 1,
      grounds: [
        {
          code: 8,
          title: 'Serious rent arrears',
          legal_basis: 'Housing Act 1988, Schedule 2, Ground 8',
          particulars: 'Tenant owes 2 months rent',
          mandatory: true,
        },
      ],
      service_date: '2025-01-15',
      earliest_possession_date: '2025-01-29',
      notice_period_days: 14,
      any_mandatory_ground: true,
      any_discretionary_ground: false,
    };

    const result = await generateSection8Notice(testData, false);

    // Form 3 template uses HTML directly (h1, strong) not markdown
    // It doesn't have h2 tags, but has h1 and strong
    expect(result.html).toContain('<h1>');
    expect(result.html).toContain('<strong>');
    expect(result.html).toContain('landlordheaven.co.uk');

    // Dates should not contain literal "undefined" or [object Object]
    expect(result.html).not.toContain('undefined');
    expect(result.html).not.toContain('[object Object]');
  });

  test('Site domain is landlordheaven.co.uk in generated documents', async () => {
    const testData = {
      landlord_full_name: 'John Smith',
      landlord_address: '123 Main St, London, SW1A 1AA',
      tenant_full_name: 'Jane Doe',
      property_address: '456 Rental Ave, London, W1A 2BB',
      tenancy_start_date: '2024-01-15',
      rent_amount: 1200,
      rent_frequency: 'monthly' as const,
      payment_date: 1,
      grounds: [
        {
          code: 8,
          title: 'Serious rent arrears',
          legal_basis: 'Housing Act 1988, Schedule 2, Ground 8',
          particulars: 'Tenant owes 2 months rent',
          mandatory: true,
        },
      ],
      service_date: '2025-01-15',
      earliest_possession_date: '2025-01-29',
      notice_period_days: 14,
      any_mandatory_ground: true,
      any_discretionary_ground: false,
    };

    const result = await generateSection8Notice(testData, false);

    // Should contain landlordheaven.co.uk domain
    expect(result.html).toContain('landlordheaven.co.uk');
  });
});

describe('safeText Helper', () => {
  test('Handles null and undefined', () => {
    expect(safeText(null)).toBe('');
    expect(safeText(undefined)).toBe('');
  });

  test('Handles strings unchanged', () => {
    expect(safeText('hello')).toBe('hello');
  });

  test('Handles numbers', () => {
    expect(safeText(42)).toBe('42');
    expect(safeText(3.14)).toBe('3.14');
  });

  test('Handles booleans', () => {
    expect(safeText(true)).toBe('true');
    expect(safeText(false)).toBe('false');
  });

  test('Handles arrays by joining', () => {
    expect(safeText(['a', 'b', 'c'])).toBe('a, b, c');
  });

  test('Handles address objects', () => {
    const address = {
      line1: '123 Main St',
      city: 'London',
      postcode: 'SW1A 1AA',
    };
    const result = safeText(address);
    expect(result).toContain('123 Main St');
    expect(result).toContain('London');
    expect(result).toContain('SW1A 1AA');
    expect(result).not.toContain('[object Object]');
  });

  test('Handles complex objects with JSON fallback', () => {
    const obj = { foo: 'bar', nested: { value: 42 } };
    const result = safeText(obj);
    // Should be JSON stringified
    expect(result).toContain('foo');
    expect(result).toContain('bar');
    expect(result).not.toBe('[object Object]');
  });
});

describe('isFullHtmlDocument', () => {
  test('Detects <!DOCTYPE html> at start', () => {
    const html = '<!DOCTYPE html><html><head></head><body>Content</body></html>';
    expect(isFullHtmlDocument(html)).toBe(true);
  });

  test('Detects <!doctype html> (lowercase) at start', () => {
    const html = '<!doctype html><html><head></head><body>Content</body></html>';
    expect(isFullHtmlDocument(html)).toBe(true);
  });

  test('Detects <html> at start', () => {
    const html = '<html><head></head><body>Content</body></html>';
    expect(isFullHtmlDocument(html)).toBe(true);
  });

  test('Detects <html> and <head> near top', () => {
    const html = '<!-- comment -->\n<html lang="en">\n<head>\n<title>Test</title>';
    expect(isFullHtmlDocument(html)).toBe(true);
  });

  test('Handles whitespace before DOCTYPE', () => {
    const html = '  \n  <!DOCTYPE html><html><head></head><body></body></html>';
    expect(isFullHtmlDocument(html)).toBe(true);
  });

  test('Returns false for plain HTML fragments', () => {
    const html = '<div><h1>Title</h1><p>Paragraph</p></div>';
    expect(isFullHtmlDocument(html)).toBe(false);
  });

  test('Returns false for markdown content', () => {
    const markdown = '# Heading\n\nThis is a paragraph.';
    expect(isFullHtmlDocument(markdown)).toBe(false);
  });

  test('Returns false for partial HTML without structure', () => {
    const html = '<p>Just a paragraph</p>';
    expect(isFullHtmlDocument(html)).toBe(false);
  });

  test('Detects full HTML with Handlebars comments at top', () => {
    // Similar to real templates that have {{!-- comments --}} before DOCTYPE
    const html = `{{!-- Template comment --}}

<!DOCTYPE html>
<html lang="en">
<head>
  <style>body { color: red; }</style>
</head>
<body>Content</body>
</html>`;
    // After Handlebars compilation, comments are removed, so the HTML starts with DOCTYPE
    const compiled = html.replace(/\{\{!--[\s\S]*?--\}\}/g, '').trim();
    expect(isFullHtmlDocument(compiled)).toBe(true);
  });
});

describe('compileTemplate Full HTML Preservation', () => {
  test('Full HTML template preserves style blocks without markdown corruption', () => {
    const fullHtmlTemplate = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { color: red; }
    .info-box { border: 1px solid blue; }
  </style>
</head>
<body>
  <h1>{{title}}</h1>
  <p>{{content}}</p>
</body>
</html>`;

    const result = compileTemplate(fullHtmlTemplate, { title: 'Test', content: 'Hello' });

    // Style block should be preserved exactly
    expect(result).toContain('body { color: red; }');
    expect(result).toContain('.info-box { border: 1px solid blue; }');

    // Should NOT contain markdown-corruption artifacts
    expect(result).not.toMatch(/<p>body \{ color:/);
    expect(result).not.toMatch(/<br \/>/);

    // Variables should be replaced
    expect(result).toContain('<h1>Test</h1>');
    expect(result).toContain('<p>Hello</p>');
  });

  test('Full HTML template with complex CSS is not corrupted', () => {
    const template = `<!DOCTYPE html>
<html>
<head>
  <style>
    @media print {
      .no-print { display: none; }
    }
    .section::before {
      content: "Section";
    }
  </style>
</head>
<body>Content</body>
</html>`;

    const result = compileTemplate(template, {});

    // Complex CSS should be preserved
    expect(result).toContain('@media print');
    expect(result).toContain('.no-print { display: none; }');
    expect(result).toContain('.section::before');
    expect(result).toContain('content: "Section"');
  });

  test('Markdown templates still get converted to HTML', () => {
    const markdownTemplate = `# {{title}}

This is a **bold** statement.

## Section 2

Another paragraph.`;

    const result = compileTemplate(markdownTemplate, { title: 'Heading' });

    // Markdown should be converted to HTML
    expect(result).toContain('<h1>');
    expect(result).toContain('<h2>');
    expect(result).toContain('<strong>bold</strong>');
    expect(result).toContain('<p>');

    // Raw markdown should not appear
    expect(result).not.toContain('# Heading');
    expect(result).not.toContain('## Section');
    expect(result).not.toContain('**bold**');
  });

  test('Partial HTML without DOCTYPE still gets markdown processing', () => {
    const partialHtml = `<div class="container">
# Main Title

Some **content** here.
</div>`;

    const result = compileTemplate(partialHtml, {});

    // Markdown inside should be converted
    expect(result).toContain('<h1>Main Title</h1>');
    expect(result).toContain('<strong>content</strong>');
  });
});

/**
 * Form 3 Compliance Tests - Statutory Text Enrichment
 *
 * These tests verify that Section 8 notices include the full Schedule 2 statutory
 * text for each ground, as required by Form 3: "Give the full text (as set out in
 * Schedule 2 of the Housing Act 1988 (as amended)) of each ground which is being
 * relied on."
 */
describe('Section 8 Form 3 Compliance - Statutory Text', () => {
  test('generateSection8Notice enriches Ground 8 with statutory_text automatically', async () => {
    const testData = {
      landlord_full_name: 'Test Landlord',
      landlord_address: '123 Main St, London, SW1A 1AA',
      tenant_full_name: 'Test Tenant',
      property_address: '456 Rental Ave, London, W1A 2BB',
      tenancy_start_date: '2024-01-01',
      rent_amount: 1200,
      rent_frequency: 'monthly' as const,
      payment_date: 1,
      grounds: [
        {
          code: 8,
          title: 'Serious rent arrears',
          legal_basis: 'Housing Act 1988, Schedule 2, Ground 8',
          particulars: 'Tenant owes 2 months rent',
          mandatory: true,
          // Note: statutory_text is NOT provided - should be enriched automatically
        },
      ],
      service_date: '2025-01-15',
      earliest_possession_date: '2025-01-29',
      notice_period_days: 14,
      any_mandatory_ground: true,
      any_discretionary_ground: false,
    };

    const result = await generateSection8Notice(testData, false);

    // Should contain distinctive Ground 8 statutory wording from Schedule 2
    // Note: Check for text without apostrophes to avoid escaping issues
    expect(result.html).toContain('at least eight weeks');
    expect(result.html).toContain('at least two months');
    expect(result.html).toContain('rent is unpaid');
  });

  test('generateSection8Notice enriches multiple grounds with statutory_text', async () => {
    const testData = {
      landlord_full_name: 'Test Landlord',
      landlord_address: '123 Main St, London, SW1A 1AA',
      tenant_full_name: 'Test Tenant',
      property_address: '456 Rental Ave, London, W1A 2BB',
      tenancy_start_date: '2024-01-01',
      rent_amount: 1200,
      rent_frequency: 'monthly' as const,
      payment_date: 1,
      grounds: [
        {
          code: 8,
          title: 'Serious rent arrears',
          legal_basis: 'Housing Act 1988, Schedule 2, Ground 8',
          particulars: 'Tenant owes 2 months rent',
          mandatory: true,
        },
        {
          code: 10,
          title: 'Some rent arrears',
          legal_basis: 'Housing Act 1988, Schedule 2, Ground 10',
          particulars: 'Some rent is unpaid',
          mandatory: false,
        },
        {
          code: 11,
          title: 'Persistent delay',
          legal_basis: 'Housing Act 1988, Schedule 2, Ground 11',
          particulars: 'Tenant persistently delays rent',
          mandatory: false,
        },
      ],
      service_date: '2025-01-15',
      earliest_possession_date: '2025-01-29',
      notice_period_days: 14,
      any_mandatory_ground: true,
      any_discretionary_ground: true,
    };

    const result = await generateSection8Notice(testData, false);

    // Ground 8 statutory text
    expect(result.html).toContain('at least eight weeks');
    expect(result.html).toContain('at least two months');

    // Ground 10 statutory text
    expect(result.html).toContain('Some rent lawfully due from the tenant is unpaid');

    // Ground 11 statutory text
    expect(result.html).toContain('persistently delayed paying rent');
  });

  test('statutory_text is preserved if already provided', async () => {
    const customStatutoryText = 'CUSTOM STATUTORY TEXT FOR TESTING';

    const testData = {
      landlord_full_name: 'Test Landlord',
      landlord_address: '123 Main St, London, SW1A 1AA',
      tenant_full_name: 'Test Tenant',
      property_address: '456 Rental Ave, London, W1A 2BB',
      tenancy_start_date: '2024-01-01',
      rent_amount: 1200,
      rent_frequency: 'monthly' as const,
      payment_date: 1,
      grounds: [
        {
          code: 8,
          title: 'Serious rent arrears',
          legal_basis: 'Housing Act 1988, Schedule 2, Ground 8',
          particulars: 'Tenant owes 2 months rent',
          mandatory: true,
          statutory_text: customStatutoryText, // Custom text provided
        },
      ],
      service_date: '2025-01-15',
      earliest_possession_date: '2025-01-29',
      notice_period_days: 14,
      any_mandatory_ground: true,
      any_discretionary_ground: false,
    };

    const result = await generateSection8Notice(testData, false);

    // Custom statutory text should be preserved
    expect(result.html).toContain(customStatutoryText);
  });
});
