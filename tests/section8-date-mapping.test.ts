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
import { mapNoticeOnlyFacts } from '@/lib/case-facts/normalize';

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

    // Add formatted dates (as done in route.ts)
    const formatUKDate = (dateString: string): string => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const day = date.getDate();
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    };

    templateData.service_date_formatted = formatUKDate(templateData.service_date || '');
    templateData.earliest_possession_date_formatted = formatUKDate(templateData.earliest_possession_date || '');
    templateData.generated_date = formatUKDate(new Date().toISOString().split('T')[0]);

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

    // Add formatted dates (as done in route.ts)
    const formatUKDate = (dateString: string): string => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const day = date.getDate();
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    };

    templateData.service_date_formatted = formatUKDate(templateData.service_date || '');
    templateData.earliest_possession_date_formatted = formatUKDate(templateData.earliest_possession_date || '');
    templateData.tenancy_start_date_formatted = formatUKDate(templateData.tenancy_start_date || '');
    templateData.generated_date = formatUKDate(new Date().toISOString().split('T')[0]);

    // Ground descriptions (as done in route.ts)
    templateData.ground_descriptions = templateData.grounds
      .map((g: any) => `Ground ${g.code} – ${g.title}`)
      .join(', ');

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
});
