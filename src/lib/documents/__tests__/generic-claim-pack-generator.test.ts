import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EVIDENCE_INDEX_FOOTER } from '@/lib/claims/evidence';
import { generateGenericSmallClaimPack, isGenericSmallClaimFacts } from '../generic-claim-pack-generator';

vi.mock('../generator', () => ({
  htmlToPdf: vi.fn(async (html: string) => Buffer.from(`pdf:${html.slice(0, 12)}`)),
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
      claimant: { name: 'Acme Ltd', address: '1 High Street' },
      defendant: { name: 'Beta Ltd', address: '2 Low Street' },
      generic_claim: {
        category: 'unpaid_invoice',
        flow_mode: 'generic_small_claim',
        value_estimate: '450',
        summary: 'Invoice 1042 was issued for completed work and remains unpaid after reminders.',
        line_items: 'Invoice 1042 - 450.00',
        pre_action: 'Payment was chased by email twice.',
        interest: true,
        evidence_items: ['invoice', 'chaser_emails'],
        evidence_descriptions: {
          invoice: 'Shows the invoice amount, date, and due date.',
          chaser_emails: 'Shows payment was requested after the due date.',
        },
      },
      'generic_claim.chasing_history': 'I chased payment by email.',
    });

    expect(pack.documents).toHaveLength(8);
    const evidenceIndex = pack.documents.find((doc) => doc.document_type === 'generic_evidence_index');
    expect(evidenceIndex?.file_name).toBe('04-evidence-index.pdf');
    expect(evidenceIndex?.html).toContain('Shows the invoice amount, date, and due date.');
    expect(evidenceIndex?.html).toContain('Shows payment was requested after the due date.');
    expect(evidenceIndex?.html).toContain(EVIDENCE_INDEX_FOOTER);
    expect(evidenceIndex?.pdf).toBeInstanceOf(Buffer);
  });
});
