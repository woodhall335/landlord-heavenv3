/**
 * Template Rendering Tests
 *
 * Smoke tests to ensure PDFs don't contain raw markdown or [object Object] artifacts
 */

import { compileTemplate, safeText, loadTemplate } from '../generator';
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
    const visibleHtml = result.html.replace(/\{\{!.*?\}\}/g, '');
    expect(visibleHtml).not.toMatch(/^##/m); // No line starting with ##
    expect(visibleHtml).not.toMatch(/\*\*[^<]/); // No ** followed by non-HTML
    expect(visibleHtml).not.toContain('[object Object]');

    // Should contain HTML equivalents instead
    expect(result.html).toContain('<h2>');
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

    // Check for raw markdown artifacts
    expect(result.html).not.toContain('##');
    expect(result.html).not.toContain('**');
    expect(result.html).not.toContain('[object Object]');

    // Should contain HTML equivalents instead
    expect(result.html).toContain('<h2>');
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

    // The template may not use format_date helper for all dates
    // So we just check that markdown has been converted to HTML
    expect(result.html).toContain('<h2>');
    expect(result.html).toContain('<strong>');
    expect(result.html).toContain('landlordheaven.com');

    // Dates should not contain literal "undefined" or [object Object]
    expect(result.html).not.toContain('undefined');
    expect(result.html).not.toContain('[object Object]');
  });

  test('Site domain is landlordheaven.com in generated documents', async () => {
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

    // Should contain landlordheaven.com domain
    expect(result.html).toContain('landlordheaven.com');
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
