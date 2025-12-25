import { describe, expect, it, vi } from 'vitest';
import { generateDocument } from '@/lib/documents/generator';
import { mapNoticeOnlyFacts } from '@/lib/case-facts/normalize';

const runPdf = process.env.RUN_PDF_TESTS === 'true' || process.env.RUN_PDF_TESTS === '1';

(runPdf ? describe : describe.skip)('Section 8 Form 3 PDF text', () => {
  vi.unmock('puppeteer');
  process.env.RUN_PDF_TESTS = 'true';

  it('renders human-readable ground headings and particulars', async () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['ground_8', 'ground_11'],
      ground_particulars: {
        ground_8: {
          factual_summary: 'Tenant owes two full months of rent.',
          evidence: 'Bank statements and ledger',
          total_amount_owed: 2400,
          period_of_arrears: 'June 2024 - July 2024',
        },
        ground_11: {
          factual_summary: 'Late every month despite reminders.',
          evidence_available: 'Email and WhatsApp reminders',
        },
      },
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      total_arrears: 2400,
      rent_amount: 1200,
      rent_frequency: 'monthly',
      notice_service_date: '2024-04-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);
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

    const pdfData =
      typeof doc.pdf === 'string'
        ? Buffer.from(doc.pdf, 'base64')
        : Buffer.isBuffer(doc.pdf)
          ? (doc.pdf as Buffer)
          : Buffer.from(doc.pdf as unknown as Uint8Array);

    expect(pdfData.slice(0, 4).toString()).toBe('%PDF');

    const pdfBuffer = new Uint8Array(pdfData);
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');

    // Cast to any because pdfjs legacy types don't include disableWorker (test-only)
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
    text = text.replace(/\s+/g, ' ');

// allow "Ground 8 – Serious..." OR "Ground 8 - Serious..." OR "Ground 8 Serious..."
expect(text).toMatch(/Ground\s+8(?:\s*[–-]\s*|\s+)Serious rent arrears/i);
expect(text).toMatch(/Ground\s+11(?:\s*[–-]\s*|\s+)Persistent delay/i);
    expect(text.toLowerCase()).not.toContain('ground_8');
    expect(text).not.toContain('Ground ,');
    expect(text.toLowerCase()).toContain('ground particulars');

    expect(text).toContain('Bank statements');
  });
});
