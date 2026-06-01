import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateGenericSmallClaimPack, isGenericSmallClaimFacts } from '../generic-claim-pack-generator';

vi.mock('../generator', () => ({
  generateDocument: vi.fn(async ({ templatePath, data }: { templatePath: string; data: any }) => ({
    html: [
      `template:${templatePath}`,
      `brand:${data.brand_name}`,
      `defendant_email:${data.defendant_email ?? ''}`,
      `pre_action_sent_date:${data.pre_action_sent_date ?? ''}`,
      `response_deadline:${data.response_deadline ?? ''}`,
      `interest_start_date:${data.interest_start_date ?? ''}`,
      `filing_route:${data.preferred_filing_route ?? ''}`,
      `evidence:${data.evidence_rows?.map((row: any) => row.description).join('|')}`,
    ].join(';'),
    pdf: Buffer.from(`pdf:${templatePath}`),
    metadata: {},
  })),
}));

vi.mock('../official-forms-filler', () => ({
  assertOfficialFormExists: vi.fn(async () => undefined),
  fillN1Form: vi.fn(async (data: any) => Buffer.from(`n1:${data.landlord_full_name}:${data.tenant_full_name}:${data.particulars_of_claim}`)),
}));

describe('generic small-claim pack generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('detects generic claims from stored claims app facts', () => {
    expect(isGenericSmallClaimFacts({ claim_flow_mode: 'generic_small_claim' })).toBe(true);
    expect(isGenericSmallClaimFacts({ __meta: { generic_claim_pack: true } })).toBe(true);
    expect(isGenericSmallClaimFacts({ claim_flow_mode: 'landlord_money_claim' })).toBe(false);
  });

  it('generates the generic evidence index with user descriptions', async () => {
    const pack = await generateGenericSmallClaimPack({
      claim_category: 'unpaid_invoice',
      claim_flow_mode: 'generic_small_claim',
      claimant: { name: 'Acme Ltd', address: '1 High Street, London, SW1A 1AA', postcode: 'SW1A 1AA' },
      defendant: { name: 'Beta Ltd', address: '2 Low Street, London, SW1A 2AA', postcode: 'SW1A 2AA', email: 'accounts@example.com' },
      generic_claim: {
        category: 'unpaid_invoice',
        flow_mode: 'generic_small_claim',
        value_estimate: '450',
        summary: 'Invoice 1042 was issued for completed work and remains unpaid after reminders.',
        line_items: 'Invoice 1042 - 450.00',
        pre_action: 'Payment was chased by email twice.',
        key_dates: {
          pre_action_sent_date: '2026-05-01',
          response_deadline: '2026-05-15',
          interest_start_date: '2026-04-15',
        },
        preferred_filing_route: 'paper_n1',
        interest: true,
        evidence_items: ['invoice', 'chaser_emails'],
        evidence_descriptions: {
          invoice: 'Shows the invoice amount, date, and due date.',
          chaser_emails: 'Shows payment was requested after the due date.',
        },
      },
      'generic_claim.chasing_history': 'I chased payment by email.',
    });

    expect(pack.documents).toHaveLength(10);
    expect(pack.metadata.brand).toBe('Claims by Landlord Heaven');
    expect(pack.metadata.includes_official_pdf).toBe(true);
    const evidenceIndex = pack.documents.find((doc) => doc.document_type === 'generic_evidence_index');
    expect(evidenceIndex?.file_name).toBe('04-evidence-index.pdf');
    expect(evidenceIndex?.html).toContain('Shows the invoice amount, date, and due date.');
    expect(evidenceIndex?.html).toContain('Shows payment was requested after the due date.');
    expect(evidenceIndex?.html).toContain('defendant_email:accounts@example.com');
    expect(evidenceIndex?.html).toContain('pre_action_sent_date:1 May 2026');
    expect(evidenceIndex?.html).toContain('response_deadline:15 May 2026');
    expect(evidenceIndex?.html).toContain('interest_start_date:15 April 2026');
    expect(evidenceIndex?.html).toContain('filing_route:Paper Form N1');
    expect(evidenceIndex?.pdf).toBeInstanceOf(Buffer);

    const n1 = pack.documents.find((doc) => doc.document_type === 'n1_claim');
    expect(n1?.file_name).toBe('10-n1-claim-form.pdf');
    expect(n1?.pdf?.toString()).toContain('n1:Acme Ltd:Beta Ltd');
  });

  it('omits the interest document when interest is not selected', async () => {
    const pack = await generateGenericSmallClaimPack({
      claim_category: 'faulty_goods_refund',
      claim_flow_mode: 'generic_small_claim',
      claimant: { name: 'Jane Buyer', address: '1 High Street, York, YO1 1AA', postcode: 'YO1 1AA' },
      defendant: { name: 'Retailer Ltd', address: '2 Low Street, Leeds, LS1 1AA', postcode: 'LS1 1AA' },
      generic_claim: {
        category: 'faulty_goods_refund',
        flow_mode: 'generic_small_claim',
        value_estimate: '250',
        summary: 'The goods were faulty and the seller refused a refund after complaint.',
        line_items: 'Refund - 250.00',
        pre_action: 'A refund request was sent by email.',
        interest: false,
        evidence_items: ['receipt'],
        evidence_descriptions: {
          receipt: 'Shows the item bought and price paid.',
        },
      },
    });

    expect(pack.documents.map((doc) => doc.document_type)).not.toContain('generic_interest_calculation');
    expect(pack.documents.map((doc) => doc.document_type)).toContain('n1_claim');
  });
});
