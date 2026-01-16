import { describe, expect, it } from 'vitest';
import { mapEvidenceToFacts } from '@/lib/evidence/map-evidence-to-facts';
import type { CaseFacts } from '@/lib/case-facts/schema';

// Use type assertion through unknown since we're creating a minimal mock
const baseFacts = {
  evidence: {
    files: [],
  },
} as unknown as CaseFacts;

describe('mapEvidenceToFacts', () => {
  it('sets evidence flags based on categories', () => {
    const mapped = mapEvidenceToFacts({
      facts: baseFacts,
      evidenceFiles: [{ id: '1', category: 'bank_statements' }],
    });

    expect(mapped.evidence.bank_statements_uploaded).toBe(true);
  });

  it('sets flags based on detected doc type when category missing', () => {
    const mapped = mapEvidenceToFacts({
      facts: baseFacts,
      evidenceFiles: [{ id: '2', category: null }],
      analysisMap: {
        '2': { detected_type: 'rent_schedule', extracted_fields: {}, confidence: 0.8 },
      },
    });

    expect(mapped.evidence.rent_schedule_uploaded).toBe(true);
  });

  it('prefers classified doc type when confidence is high', () => {
    const mapped = mapEvidenceToFacts({
      facts: baseFacts,
      evidenceFiles: [{ id: '3', category: null, doc_type: 'notice_s21', doc_type_confidence: 0.9 }],
      analysisMap: {},
    });

    expect(mapped.evidence.correspondence_uploaded).toBe(true);
  });
});
