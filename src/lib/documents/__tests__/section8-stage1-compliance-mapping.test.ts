import { describe, expect, test } from 'vitest';

import { generateNoticeOnlyPack } from '../eviction-pack-generator';
import { buildEnglandSection8CompletePackFacts } from '@/lib/testing/fixtures/complete-pack';

describe('Section 8 Stage 1 compliance mapping', () => {
  test('treats date and rating aliases as recorded compliance in the Stage 1 summary', async () => {
    const facts = buildEnglandSection8CompletePackFacts({
      overrides: {
        total_arrears: 3600,
        rent_arrears_amount: 3600,
        arrears_items: [
          { period_start: '2026-01-01', period_end: '2026-01-31', rent_due: 1200, rent_paid: 0, amount_owed: 1200 },
          { period_start: '2026-02-01', period_end: '2026-02-28', rent_due: 1200, rent_paid: 0, amount_owed: 1200 },
          { period_start: '2026-03-01', period_end: '2026-03-31', rent_due: 1200, rent_paid: 0, amount_owed: 1200 },
        ],
        prescribed_info_served: undefined,
        prescribed_info_given: undefined,
        epc_provided: undefined,
        gas_safety_provided: undefined,
        gas_safety_check_date: undefined,
        how_to_rent_date: undefined,
      },
    });

    const pack = await generateNoticeOnlyPack(facts);
    const caseSummaryHtml =
      pack.documents.find((document) => document.document_type === 'case_summary')?.html || '';

    expect(caseSummaryHtml).toContain('Deposit compliance recorded');
    expect(caseSummaryHtml).not.toContain('Prescribed information not confirmed');

    expect(caseSummaryHtml).toContain('Gas safety evidence recorded');
    expect(caseSummaryHtml).not.toContain('Gas safety record not confirmed');

    expect(caseSummaryHtml).toContain('EPC record recorded');
    expect(caseSummaryHtml).not.toContain('EPC record not confirmed');

    expect(caseSummaryHtml).toContain('How to Rent record recorded');
    expect(caseSummaryHtml).not.toContain('How to Rent record not confirmed');
  });

  test('uses a clean-pass canonical Section 8 fixture by default', () => {
    const facts = buildEnglandSection8CompletePackFacts();

    expect(facts.prescribed_info_served).toBe(true);
    expect(facts.prescribed_information_date).toBe('2024-01-15');
    expect(facts.gas_safety_certificate).toBe(true);
    expect(facts.gas_safety_provided).toBe(true);
    expect(facts.epc_provided).toBe(true);
    expect(facts.epc_rating).toBe('C');
    expect(facts.how_to_rent_provided).toBe(true);
  });

  test('does not generate arrears support documents or arrears summary copy for non-arrears grounds', async () => {
    const facts = buildEnglandSection8CompletePackFacts({
      overrides: {
        section8_grounds: ['Ground 1A'],
        ground_codes: ['Ground 1A'],
        selected_grounds: ['Ground 1A'],
        notice_served_date: '2026-05-30',
        notice_service_date: '2026-05-30',
        notice_date: '2026-05-30',
        notice_expiry_date: '2026-09-30',
        earliest_possession_date: '2026-09-30',
        total_arrears: 2400,
        rent_arrears_amount: 2400,
        arrears_items: [
          { period_start: '2026-01-01', period_end: '2026-01-31', rent_due: 1200, rent_paid: 0, amount_owed: 1200 },
        ],
        ground_1a: {
          sale_reason: 'The landlord intends to sell the property.',
          sale_steps_taken: 'Valuation and agent discussions.',
          sale_decision_date: '2026-05-01',
          sale_timetable: 'Marketing after notice expiry.',
          sale_evidence: 'Valuation record and agent correspondence.',
        },
        ground_particulars: {
          ground_1a: {
            summary: 'Ground 1A: the landlord intends to sell the property and has obtained valuation evidence.',
          },
        },
      },
    });

    const pack = await generateNoticeOnlyPack(facts);
    const documentTypes = pack.documents.map((document) => document.document_type);
    const caseSummaryHtml =
      pack.documents.find((document) => document.document_type === 'case_summary')?.html || '';
    const serviceInstructionsHtml =
      pack.documents.find((document) => document.document_type === 'service_instructions')?.html || '';

    expect(documentTypes).not.toContain('arrears_schedule');
    expect(caseSummaryHtml).not.toContain('Arrears at notice date');
    expect(serviceInstructionsHtml).toContain('ground-specific evidence');
    expect(serviceInstructionsHtml).not.toContain('arrears schedule line up');
  });
});
