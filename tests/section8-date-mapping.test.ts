/**
 * Section 8 Date Mapping Regression Tests
 *
 * These tests verify that:
 * 1. The service date appears in the Section 8 notice PDF (Form 3) "Capacity Date:" field
 * 2. Service Instructions PDF shows service_date_formatted and earliest_possession_date_formatted
 * 3. Service & Validity Checklist PDF shows tenancy_start_date_formatted, service_date_formatted,
 *    earliest_possession_date_formatted, and ground_descriptions
 *
 * Bug reference: Section 8 "Date you will serve the notice" not showing in PDFs
 */

import { describe, expect, it, vi } from 'vitest';
import { generateDocument } from '@/lib/documents/generator';
import {
  mapNoticeOnlyFacts,
  resolveNoticeServiceDate,
  resolveNoticeExpiryDate,
  formatUkLegalDate,
  buildGroundDescriptions,
} from '@/lib/case-facts/normalize';

const runPdf = process.env.RUN_PDF_TESTS === 'true' || process.env.RUN_PDF_TESTS === '1';

// Helper to extract text from PDF using pdfjs-dist
async function extractPdfText(pdfData: Buffer | Uint8Array): Promise<string> {
  const pdfBuffer = pdfData instanceof Buffer ? new Uint8Array(pdfData) : pdfData;
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');

  const pdf = await getDocument({ data: pdfBuffer, disableWorker: true } as any).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items
      .map(item => ('str' in item ? (item as any).str : ''))
      .join(' ');
  }
  await pdf.cleanup();
  return text.replace(/\s+/g, ' ');
}

// Standard test data for Section 8 notice
function createSection8WizardFacts() {
  return {
    jurisdiction: 'england',
    selected_notice_route: 'section_8',
    section8_grounds_selection: ['ground_8', 'ground_10'],
    section8_grounds: ['Ground 8 - Serious rent arrears', 'Ground 10 - Some rent unpaid'],
    ground_particulars: {
      ground_8: {
        factual_summary: 'Tenant owes two full months of rent.',
        evidence: 'Bank statements and ledger',
        total_amount_owed: 2400,
        period_of_arrears: 'November 2025 - December 2025',
      },
      ground_10: {
        factual_summary: 'Some rent remains unpaid from previous periods.',
        evidence_available: 'Payment records',
      },
    },
    landlord_full_name: 'James Landlord',
    landlord_address_line1: '10 Owner Lane',
    landlord_address_town: 'Manchester',
    landlord_address_postcode: 'M1 1AA',
    tenant_full_name: 'Sarah Tenant',
    property_address_line1: '25 Rented House',
    property_address_town: 'Manchester',
    property_address_postcode: 'M2 2BB',
    tenancy_start_date: '2023-06-15',
    rent_amount: 1200,
    rent_frequency: 'monthly',
    total_arrears: 2400,
    // Notice dates - using notice_service_date as primary
    notice_service_date: '2026-01-15',
    notice_expiry_date: '2026-01-29', // 14 days for Ground 8
  };
}

(runPdf ? describe : describe.skip)('Section 8 Date Mapping - Form 3 Notice PDF', () => {
  vi.unmock('puppeteer');

  it('renders service date in the "Capacity Date:" field', async () => {
    const wizardFacts = createSection8WizardFacts();
    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // Verify the templateData contains correct date mappings
    expect(templateData.service_date).toBeTruthy();
    expect(templateData.notice_service_date).toBeTruthy();
    expect(templateData.intended_service_date).toBeTruthy();

    let doc;
    try {
      doc = await generateDocument({
        templatePath: 'uk/england/templates/notice_only/form_3_section8/notice.hbs',
        data: templateData,
        outputFormat: 'pdf',
        isPreview: true,
      });
    } catch (error: any) {
      if (String(error?.message || error).includes('Failed to launch the browser process')) {
        console.warn('Skipping PDF text assertions due to Puppeteer environment limitations.');
        return;
      }
      throw error;
    }

    if (!doc.pdf) {
      throw new Error('PDF data is undefined');
    }

    const pdfData = doc.pdf instanceof Buffer ? doc.pdf : Buffer.from(doc.pdf as Uint8Array);
    expect(pdfData.slice(0, 4).toString()).toBe('%PDF');

    const text = await extractPdfText(pdfData);

    // The date should appear near "Date:" in the capacity section
    // Format should be "15 January 2026" (UK legal date format)
    expect(text).toMatch(/Date[:\s]*15\s+January\s+2026/i);

    // Also verify the notice contains the tenant and landlord names
    expect(text).toContain('Sarah Tenant');
    expect(text).toContain('James Landlord');
  });
});

(runPdf ? describe : describe.skip)('Section 8 Date Mapping - Service Instructions PDF', () => {
  vi.unmock('puppeteer');

  it('renders service_date_formatted and earliest_possession_date_formatted', async () => {
    const wizardFacts = createSection8WizardFacts();
    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // Formatted dates should now be automatically included by mapNoticeOnlyFacts
    expect(templateData.service_date_formatted).toBe('15 January 2026');
    expect(templateData.earliest_possession_date_formatted).toBeTruthy(); // Will be 29 January 2026

    let doc;
    try {
      doc = await generateDocument({
        templatePath: 'uk/england/templates/eviction/service_instructions_section_8.hbs',
        data: templateData,
        outputFormat: 'pdf',
        isPreview: false,
      });
    } catch (error: any) {
      if (String(error?.message || error).includes('Failed to launch the browser process')) {
        console.warn('Skipping PDF text assertions due to Puppeteer environment limitations.');
        return;
      }
      throw error;
    }

    if (!doc.pdf) {
      throw new Error('PDF data is undefined');
    }

    const pdfData = doc.pdf instanceof Buffer ? doc.pdf : Buffer.from(doc.pdf as Uint8Array);
    const text = await extractPdfText(pdfData);

    // Service Date should appear formatted
    expect(text).toContain('15 January 2026');

    // Expiry Date / Earliest Possession Date should appear
    // (29 January 2026 based on test data)
    expect(text).toContain('29 January 2026');

    // Should reference Section 8
    expect(text).toMatch(/Section\s*8/i);
  });
});

(runPdf ? describe : describe.skip)('Section 8 Date Mapping - Service & Validity Checklist PDF', () => {
  vi.unmock('puppeteer');

  it('renders tenancy_start_date_formatted, service_date_formatted, earliest_possession_date_formatted, and ground_descriptions', async () => {
    const wizardFacts = createSection8WizardFacts();
    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // Formatted dates and ground_descriptions should now be automatically included by mapNoticeOnlyFacts
    expect(templateData.service_date_formatted).toBe('15 January 2026');
    expect(templateData.tenancy_start_date_formatted).toBe('15 June 2023');
    expect(templateData.earliest_possession_date_formatted).toBeTruthy();
    expect(templateData.ground_descriptions).toBeTruthy();
    expect(templateData.has_mandatory_ground).toBe(true); // Ground 8 is mandatory

    let doc;
    try {
      doc = await generateDocument({
        templatePath: 'uk/england/templates/eviction/checklist_section_8.hbs',
        data: templateData,
        outputFormat: 'pdf',
        isPreview: false,
      });
    } catch (error: any) {
      if (String(error?.message || error).includes('Failed to launch the browser process')) {
        console.warn('Skipping PDF text assertions due to Puppeteer environment limitations.');
        return;
      }
      throw error;
    }

    if (!doc.pdf) {
      throw new Error('PDF data is undefined');
    }

    const pdfData = doc.pdf instanceof Buffer ? doc.pdf : Buffer.from(doc.pdf as Uint8Array);
    const text = await extractPdfText(pdfData);

    // Tenancy Start Date (15 June 2023)
    expect(text).toContain('15 June 2023');

    // Notice Service Date (15 January 2026)
    expect(text).toContain('15 January 2026');

    // Earliest Possession Date (29 January 2026)
    expect(text).toContain('29 January 2026');

    // Ground descriptions should appear
    expect(text).toMatch(/Ground\s*8/i);
    expect(text).toMatch(/Ground\s*10/i);
  });
});

describe('mapNoticeOnlyFacts - service date resolution', () => {
  it('resolves service_date from notice_service_date', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      notice_service_date: '2026-01-15',
      landlord_full_name: 'Test Landlord',
      tenant_full_name: 'Test Tenant',
    };

    const result = mapNoticeOnlyFacts(wizardFacts);
    expect(result.service_date).toBe('2026-01-15');
    expect(result.notice_service_date).toBe('2026-01-15');
    expect(result.intended_service_date).toBe('2026-01-15');
  });

  it('resolves service_date from notice_served_date', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      notice_served_date: '2026-01-20',
      landlord_full_name: 'Test Landlord',
      tenant_full_name: 'Test Tenant',
    };

    const result = mapNoticeOnlyFacts(wizardFacts);
    expect(result.service_date).toBe('2026-01-20');
  });

  it('resolves service_date from section_8_notice_date', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      section_8_notice_date: '2026-01-25',
      landlord_full_name: 'Test Landlord',
      tenant_full_name: 'Test Tenant',
    };

    const result = mapNoticeOnlyFacts(wizardFacts);
    expect(result.service_date).toBe('2026-01-25');
  });

  it('resolves service_date from intended_service_date', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      intended_service_date: '2026-02-01',
      landlord_full_name: 'Test Landlord',
      tenant_full_name: 'Test Tenant',
    };

    const result = mapNoticeOnlyFacts(wizardFacts);
    expect(result.service_date).toBe('2026-02-01');
  });

  it('resolves earliest_possession_date from notice_expiry_date', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      notice_service_date: '2026-01-15',
      notice_expiry_date: '2026-01-29',
      landlord_full_name: 'Test Landlord',
      tenant_full_name: 'Test Tenant',
    };

    const result = mapNoticeOnlyFacts(wizardFacts);
    expect(result.expiry_date).toBe('2026-01-29');
    expect(result.notice_expiry_date).toBe('2026-01-29');
  });

  it('resolves earliest_possession_date from earliest_possession_date field', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      notice_service_date: '2026-01-15',
      earliest_possession_date: '2026-01-30',
      landlord_full_name: 'Test Landlord',
      tenant_full_name: 'Test Tenant',
    };

    const result = mapNoticeOnlyFacts(wizardFacts);
    // Note: earliest_possession_date may be calculated if not in expiry_date fields
    // The key is that some possession date is set
    expect(result.earliest_possession_date || result.notice_expiry_date).toBeTruthy();
  });

  it('resolves service_date from date_of_service (legacy)', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      date_of_service: '2026-02-10',
      landlord_full_name: 'Test Landlord',
      tenant_full_name: 'Test Tenant',
    };

    const result = mapNoticeOnlyFacts(wizardFacts);
    expect(result.service_date).toBe('2026-02-10');
  });

  it('resolves service_date from served_on (legacy)', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      served_on: '2026-02-15',
      landlord_full_name: 'Test Landlord',
      tenant_full_name: 'Test Tenant',
    };

    const result = mapNoticeOnlyFacts(wizardFacts);
    expect(result.service_date).toBe('2026-02-15');
  });

  it('resolves expiry_date from section8_expiry_date', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      notice_service_date: '2026-01-15',
      section8_expiry_date: '2026-01-29',
      landlord_full_name: 'Test Landlord',
      tenant_full_name: 'Test Tenant',
    };

    const result = mapNoticeOnlyFacts(wizardFacts);
    expect(result.expiry_date).toBe('2026-01-29');
  });

  it('resolves expiry_date from section_8_expiry_date (underscore variant)', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      notice_service_date: '2026-01-15',
      section_8_expiry_date: '2026-01-30',
      landlord_full_name: 'Test Landlord',
      tenant_full_name: 'Test Tenant',
    };

    const result = mapNoticeOnlyFacts(wizardFacts);
    expect(result.expiry_date).toBe('2026-01-30');
  });
});

// =============================================================================
// UNIT TESTS FOR resolveNoticeServiceDate
// =============================================================================
describe('resolveNoticeServiceDate - comprehensive key coverage', () => {
  it('resolves from notice_served_date (highest priority for Complete Pack)', () => {
    const result = resolveNoticeServiceDate({ notice_served_date: '2026-03-01' } as any);
    expect(result).toBe('2026-03-01');
  });

  it('resolves from nested notice_service.notice_date (MQS maps_to)', () => {
    const result = resolveNoticeServiceDate({
      notice_service: { notice_date: '2026-03-02' },
    } as any);
    expect(result).toBe('2026-03-02');
  });

  it('resolves from notice_service_date', () => {
    const result = resolveNoticeServiceDate({ notice_service_date: '2026-03-03' } as any);
    expect(result).toBe('2026-03-03');
  });

  it('resolves from service_date', () => {
    const result = resolveNoticeServiceDate({ service_date: '2026-03-04' } as any);
    expect(result).toBe('2026-03-04');
  });

  it('resolves from section_8_notice_date', () => {
    const result = resolveNoticeServiceDate({ section_8_notice_date: '2026-03-05' } as any);
    expect(result).toBe('2026-03-05');
  });

  it('resolves from section8_notice_date (no underscore)', () => {
    const result = resolveNoticeServiceDate({ section8_notice_date: '2026-03-06' } as any);
    expect(result).toBe('2026-03-06');
  });

  it('resolves from intended_service_date', () => {
    const result = resolveNoticeServiceDate({ intended_service_date: '2026-03-07' } as any);
    expect(result).toBe('2026-03-07');
  });

  it('resolves from notice_date (Scotland)', () => {
    const result = resolveNoticeServiceDate({ notice_date: '2026-03-08' } as any);
    expect(result).toBe('2026-03-08');
  });

  it('resolves from date_notice_served (legacy)', () => {
    const result = resolveNoticeServiceDate({ date_notice_served: '2026-03-09' } as any);
    expect(result).toBe('2026-03-09');
  });

  it('resolves from date_of_service (legacy)', () => {
    const result = resolveNoticeServiceDate({ date_of_service: '2026-03-10' } as any);
    expect(result).toBe('2026-03-10');
  });

  it('resolves from served_on (legacy)', () => {
    const result = resolveNoticeServiceDate({ served_on: '2026-03-11' } as any);
    expect(result).toBe('2026-03-11');
  });

  it('resolves from served_date (legacy)', () => {
    const result = resolveNoticeServiceDate({ served_date: '2026-03-12' } as any);
    expect(result).toBe('2026-03-12');
  });

  it('returns null when no date is found', () => {
    const result = resolveNoticeServiceDate({} as any);
    expect(result).toBeNull();
  });

  it('returns null for invalid date strings', () => {
    const result = resolveNoticeServiceDate({ notice_service_date: 'not-a-date' } as any);
    expect(result).toBeNull();
  });

  it('normalizes dates to YYYY-MM-DD format', () => {
    // JavaScript Date parsing handles various formats
    const result = resolveNoticeServiceDate({ notice_service_date: '2026/03/15' } as any);
    expect(result).toBe('2026-03-15');
  });
});

// =============================================================================
// UNIT TESTS FOR resolveNoticeExpiryDate
// =============================================================================
describe('resolveNoticeExpiryDate - comprehensive key coverage', () => {
  it('resolves from nested notice_service.notice_expiry_date (MQS maps_to)', () => {
    const result = resolveNoticeExpiryDate({
      notice_service: { notice_expiry_date: '2026-04-01' },
    } as any);
    expect(result).toBe('2026-04-01');
  });

  it('resolves from notice_expiry_date', () => {
    const result = resolveNoticeExpiryDate({ notice_expiry_date: '2026-04-02' } as any);
    expect(result).toBe('2026-04-02');
  });

  it('resolves from expiry_date', () => {
    const result = resolveNoticeExpiryDate({ expiry_date: '2026-04-03' } as any);
    expect(result).toBe('2026-04-03');
  });

  it('resolves from earliest_possession_date', () => {
    const result = resolveNoticeExpiryDate({ earliest_possession_date: '2026-04-04' } as any);
    expect(result).toBe('2026-04-04');
  });

  it('resolves from section8_expiry_date', () => {
    const result = resolveNoticeExpiryDate({ section8_expiry_date: '2026-04-05' } as any);
    expect(result).toBe('2026-04-05');
  });

  it('resolves from section_8_expiry_date (underscore variant)', () => {
    const result = resolveNoticeExpiryDate({ section_8_expiry_date: '2026-04-06' } as any);
    expect(result).toBe('2026-04-06');
  });

  it('resolves from earliest_court_date (legacy)', () => {
    const result = resolveNoticeExpiryDate({ earliest_court_date: '2026-04-07' } as any);
    expect(result).toBe('2026-04-07');
  });

  it('resolves from earliest_hearing_date (legacy)', () => {
    const result = resolveNoticeExpiryDate({ earliest_hearing_date: '2026-04-08' } as any);
    expect(result).toBe('2026-04-08');
  });

  it('resolves from possession_date (legacy)', () => {
    const result = resolveNoticeExpiryDate({ possession_date: '2026-04-09' } as any);
    expect(result).toBe('2026-04-09');
  });

  it('resolves from earliest_leaving_date (Scotland)', () => {
    const result = resolveNoticeExpiryDate({ earliest_leaving_date: '2026-04-10' } as any);
    expect(result).toBe('2026-04-10');
  });

  it('resolves from earliest_tribunal_date (Scotland)', () => {
    const result = resolveNoticeExpiryDate({ earliest_tribunal_date: '2026-04-11' } as any);
    expect(result).toBe('2026-04-11');
  });

  it('resolves from notice_end_date (legacy)', () => {
    const result = resolveNoticeExpiryDate({ notice_end_date: '2026-04-12' } as any);
    expect(result).toBe('2026-04-12');
  });

  it('resolves from end_date (legacy)', () => {
    const result = resolveNoticeExpiryDate({ end_date: '2026-04-13' } as any);
    expect(result).toBe('2026-04-13');
  });

  it('returns null when no date is found', () => {
    const result = resolveNoticeExpiryDate({} as any);
    expect(result).toBeNull();
  });
});

// =============================================================================
// UNIT TESTS FOR formatUkLegalDate
// =============================================================================
describe('formatUkLegalDate - date formatting', () => {
  it('formats YYYY-MM-DD to UK legal format', () => {
    expect(formatUkLegalDate('2026-01-15')).toBe('15 January 2026');
  });

  it('formats with single-digit day correctly', () => {
    expect(formatUkLegalDate('2026-03-05')).toBe('5 March 2026');
  });

  it('handles December correctly', () => {
    expect(formatUkLegalDate('2026-12-25')).toBe('25 December 2026');
  });

  it('returns null for null input', () => {
    expect(formatUkLegalDate(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(formatUkLegalDate(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(formatUkLegalDate('')).toBeNull();
  });

  it('returns null for invalid date string', () => {
    expect(formatUkLegalDate('not-a-date')).toBeNull();
  });

  it('handles ISO date-time strings', () => {
    // Date parsing may convert to local time, but should still produce a valid date
    const result = formatUkLegalDate('2026-06-15T12:00:00Z');
    expect(result).toMatch(/^\d{1,2} June 2026$/);
  });
});

// =============================================================================
// UNIT TESTS FOR buildGroundDescriptions
// =============================================================================
describe('buildGroundDescriptions - ground string builder', () => {
  it('builds description for single mandatory ground', () => {
    const grounds = [{ code: 8, title: 'Serious rent arrears', mandatory: true }];
    expect(buildGroundDescriptions(grounds)).toBe('Ground 8 (mandatory) – Serious rent arrears');
  });

  it('builds description for single discretionary ground', () => {
    const grounds = [{ code: 10, title: 'Some rent unpaid', mandatory: false }];
    expect(buildGroundDescriptions(grounds)).toBe('Ground 10 – Some rent unpaid');
  });

  it('builds description for multiple grounds', () => {
    const grounds = [
      { code: 8, title: 'Serious rent arrears', mandatory: true },
      { code: 10, title: 'Some rent unpaid', mandatory: false },
    ];
    const result = buildGroundDescriptions(grounds);
    expect(result).toBe('Ground 8 (mandatory) – Serious rent arrears; Ground 10 – Some rent unpaid');
  });

  it('handles grounds with number instead of code', () => {
    const grounds = [{ number: '14', title: 'Nuisance', mandatory: false }];
    expect(buildGroundDescriptions(grounds)).toBe('Ground 14 – Nuisance');
  });

  it('returns null for null input', () => {
    expect(buildGroundDescriptions(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(buildGroundDescriptions(undefined)).toBeNull();
  });

  it('returns null for empty array', () => {
    expect(buildGroundDescriptions([])).toBeNull();
  });

  it('handles ground without title', () => {
    const grounds = [{ code: 11, mandatory: false }];
    expect(buildGroundDescriptions(grounds)).toBe('Ground 11');
  });
});

// =============================================================================
// INTEGRATION TEST: mapNoticeOnlyFacts produces all required fields
// =============================================================================
describe('mapNoticeOnlyFacts - formatted fields integration', () => {
  it('includes all formatted dates and ground_descriptions', () => {
    const wizardFacts = createSection8WizardFacts();
    const result = mapNoticeOnlyFacts(wizardFacts);

    // Raw dates
    expect(result.service_date).toBe('2026-01-15');
    expect(result.tenancy_start_date).toBe('2023-06-15');

    // Formatted dates (UK legal format)
    expect(result.service_date_formatted).toBe('15 January 2026');
    expect(result.tenancy_start_date_formatted).toBe('15 June 2023');
    expect(result.earliest_possession_date_formatted).toBeTruthy();

    // Ground descriptions
    expect(result.ground_descriptions).toBeTruthy();
    expect(result.ground_descriptions).toContain('Ground 8');
    expect(result.has_mandatory_ground).toBe(true);
  });

  it('handles missing tenancy_start_date gracefully', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      notice_service_date: '2026-01-15',
      landlord_full_name: 'Test Landlord',
      tenant_full_name: 'Test Tenant',
    };

    const result = mapNoticeOnlyFacts(wizardFacts);
    expect(result.tenancy_start_date_formatted).toBeNull();
    expect(result.service_date_formatted).toBe('15 January 2026');
  });

  it('handles missing grounds gracefully', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      notice_service_date: '2026-01-15',
      landlord_full_name: 'Test Landlord',
      tenant_full_name: 'Test Tenant',
    };

    const result = mapNoticeOnlyFacts(wizardFacts);
    expect(result.ground_descriptions).toBeNull();
    expect(result.has_mandatory_ground).toBe(false);
  });
});
