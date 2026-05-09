import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PDFDocument, PDFTextField } from 'pdf-lib';

import { fillN119Form } from '@/lib/documents/official-forms-filler';

const BANNED_INSTRUCTIONAL_TEXT =
  /The landlord should provide|You should add|Please specify|This note should|claimant should|should exhibit|should keep/i;

function countOccurrences(text: string, needle: string): number {
  return text.split(needle).length - 1;
}

describe('N119 defendant circumstances field', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        'england-and-wales': {
          events: [],
        },
      }),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fills question 7 with cleaned Complete Pack defendant circumstances text', async () => {
    const pdfBytes = await fillN119Form({
      jurisdiction: 'england',
      claim_type: 'section_8',
      court_name: 'York County Court',
      landlord_full_name: 'Alex Landlord',
      landlord_address: '1 High Street, York, YO1 1AA',
      tenant_full_name: 'Tina Tenant',
      property_address: '16 Willow Mews, York, YO24 3HX',
      tenancy_start_date: '2024-02-01',
      rent_amount: 1200,
      rent_frequency: 'monthly',
      ground_codes: ['8', '10'],
      ground_numbers: '8, 10',
      notice_service_date: '2026-03-05',
      notice_served_date: '2026-03-05',
      notice_expiry_date: '2026-03-19',
      notice_service_method: 'first_class_post',
      total_arrears: 3600,
      tenant_vulnerability_details: 'The defendant has disclosed financial difficulty.',
      known_tenant_defences:
        'The defendant says DWP delayed Universal Credit. The landlord should provide a factual note.',
      benefit_delays: true,
      tenant_benefits_details:
        'The defendant says DWP delayed Universal Credit. The defendant says DWP delayed Universal Credit.',
      payment_plan_offered: true,
      payment_plan_response: 'The defendant didnt accept installements.',
    } as any);

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const defendantField = pdfDoc
      .getForm()
      .getFields()
      .find((field) => field.getName().startsWith('7. The following information is known about the defendant'));

    expect(defendantField).toBeInstanceOf(PDFTextField);
    const text = (defendantField as PDFTextField).getText() || '';

    expect(text).toContain('financial difficulty');
    expect(text).toContain('The defendant says DWP delayed Universal Credit');
    expect(countOccurrences(text, 'The defendant says DWP delayed Universal Credit')).toBe(1);
    expect(text).toContain('did not accept instalments');
    expect(text).not.toMatch(BANNED_INSTRUCTIONAL_TEXT);
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('[object Object]');
  });
});
