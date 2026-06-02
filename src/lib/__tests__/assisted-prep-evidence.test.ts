import { describe, expect, it } from 'vitest';
import { EvidenceCategory } from '@/lib/evidence/schema';
import {
  buildAssistedEvidenceSummary,
  getAssistedEvidenceUploadSlots,
} from '@/lib/assisted-prep';

describe('assisted prep evidence helpers', () => {
  it('returns service-specific upload slots', () => {
    const section8 = getAssistedEvidenceUploadSlots('section8');
    const moneyClaim = getAssistedEvidenceUploadSlots('money_claim');

    expect(section8.some((slot) => slot.category === EvidenceCategory.NOTICE_SERVED_PROOF)).toBe(true);
    expect(moneyClaim.some((slot) => slot.category === EvidenceCategory.LBA_LETTER)).toBe(true);
    expect(moneyClaim.some((slot) => slot.category === EvidenceCategory.NOTICE_SERVED_PROOF)).toBe(false);
  });

  it('marks recommended evidence as uploaded when matching categories exist', () => {
    const summary = buildAssistedEvidenceSummary({
      service: 'possession',
      evidence: {
        files: [
          {
            id: 'evidence-1',
            document_id: 'doc-1',
            file_name: 'notice.pdf',
            category: EvidenceCategory.NOTICE_S8,
            uploaded_at: '2026-06-02T10:00:00.000Z',
          },
          {
            id: 'evidence-2',
            document_id: 'doc-2',
            file_name: 'proof.pdf',
            category: EvidenceCategory.NOTICE_SERVED_PROOF,
            uploaded_at: '2026-06-02T11:00:00.000Z',
          },
        ],
      },
    });

    expect(summary.uploaded_evidence_count).toBe(2);
    expect(summary.latest_upload_at).toBe('2026-06-02T11:00:00.000Z');
    expect(summary.missing_recommended_evidence.map((slot) => slot.category)).not.toContain(EvidenceCategory.NOTICE_S8);
    expect(summary.missing_recommended_evidence.map((slot) => slot.category)).not.toContain(EvidenceCategory.NOTICE_SERVED_PROOF);
  });
});
