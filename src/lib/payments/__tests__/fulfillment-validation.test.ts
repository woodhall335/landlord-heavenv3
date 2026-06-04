import { describe, expect, it } from 'vitest';
import { computeMissingDocumentKeys, getExpectedDocumentKeys } from '@/lib/payments/fulfillment';

describe('fulfillment validation canonical matching', () => {
  it('treats section 8 notice-only docs as complete when legacy titles exist', () => {
    const expectedKeys = [
      'section8_notice',
      'service_instructions',
      'service_checklist',
      'compliance_declaration',
    ];

    const actualDocs = [
      { document_type: 'Section 8 Notice', document_title: 'Section 8 Notice' },
      { document_type: 'Service Instructions', document_title: 'Service Instructions' },
      { document_type: 'Service & Validity Checklist', document_title: 'Service & Validity Checklist' },
      { document_type: 'Pre-Service Compliance Declaration', document_title: 'Pre-Service Compliance Declaration' },
      { document_type: 'Rent Schedule / Arrears Statement', document_title: 'Rent Schedule / Arrears Statement' },
    ];

    const result = computeMissingDocumentKeys(expectedKeys, actualDocs);
    expect(result.missingKeys).toEqual([]);
    expect(result.actualCanonicalKeys).toContain('service_checklist');
    expect(result.actualCanonicalKeys).toContain('arrears_schedule');
  });

  it('supports arrears schedule as optional by not requiring it when absent from expected keys', () => {
    const result = computeMissingDocumentKeys(
      ['section8_notice', 'service_instructions', 'service_checklist', 'compliance_declaration'],
      [
        { document_type: 'section8_notice', document_title: 'Section 8 Notice' },
        { document_type: 'service_instructions', document_title: 'Service Instructions' },
        { document_type: 'service_checklist', document_title: 'Service & Validity Checklist' },
        { document_type: 'compliance_declaration', document_title: 'Pre-Service Compliance Declaration' },
      ]
    );

    expect(result.missingKeys).toEqual([]);
  });

  it('does not require optional money-claim interest workings when interest is not generated', () => {
    const expectedKeys = getExpectedDocumentKeys('money_claim', 'england');

    expect(expectedKeys).toContain('n1_claim');
    expect(expectedKeys).toContain('particulars_of_claim');
    expect(expectedKeys).not.toContain('interest_calculation');

    const result = computeMissingDocumentKeys(expectedKeys, [
      { document_type: 'particulars_of_claim', document_title: 'Particulars of claim' },
      { document_type: 'letter_before_claim', document_title: 'Letter Before Claim (PAP-DEBT)' },
      { document_type: 'reply_form', document_title: 'Reply Form' },
      { document_type: 'court_filing_guide', document_title: 'Money Claims Filing Guide' },
      { document_type: 'n1_claim', document_title: 'Form N1 (official PDF)' },
      { document_type: 'arrears_schedule', document_title: 'Schedule of arrears' },
      { document_type: 'defendant_info_sheet', document_title: 'Information Sheet for Defendants' },
      { document_type: 'financial_statement_form', document_title: 'Financial Statement Form' },
      { document_type: 'enforcement_guide', document_title: 'Enforcement Guide' },
    ]);

    expect(result.missingKeys).toEqual([]);
  });
});
