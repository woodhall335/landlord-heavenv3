import { describe, expect, it } from 'vitest';

import { validateCompletePackDocuments } from '@/lib/test-artifacts/validateCompletePackDocuments';

function makeDoc(document_type: string) {
  return { document_type } as any;
}

describe('validateCompletePackDocuments', () => {
  it('accepts the England post-1 May 2026 complete pack on the N5/N119 route even for legacy section_21 inputs', () => {
    const result = validateCompletePackDocuments({
      documents: [
        makeDoc('section8_notice'),
        makeDoc('n5_claim'),
        makeDoc('n119_particulars'),
        makeDoc('proof_of_service'),
        makeDoc('court_filing_guide'),
      ],
      jurisdiction: 'england',
      route: 'section_21',
    });

    expect(result).toEqual({ ok: true });
  });

  it('requires the supporting proof-of-service record when the canonical complete pack includes it', () => {
    const result = validateCompletePackDocuments({
      documents: [
        makeDoc('section8_notice'),
        makeDoc('n5_claim'),
        makeDoc('n119_particulars'),
        makeDoc('court_filing_guide'),
      ],
      jurisdiction: 'england',
      route: 'section_8',
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain('supporting proof-of-service record');
  });

  it('rejects N5B if it appears in the England post-1 May 2026 complete pack', () => {
    const result = validateCompletePackDocuments({
      documents: [
        makeDoc('section8_notice'),
        makeDoc('n5_claim'),
        makeDoc('n119_particulars'),
        makeDoc('proof_of_service'),
        makeDoc('court_filing_guide'),
        makeDoc('n5b_claim'),
      ],
      jurisdiction: 'england',
      route: 'section_8',
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain('N5B');
  });
});
