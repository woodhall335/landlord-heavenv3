import { describe, expect, it } from 'vitest';
import { classifyDocument } from '@/lib/evidence/classify-document';

describe('classifyDocument', () => {
  it('classifies section 21 notices deterministically', () => {
    const result = classifyDocument({
      fileName: 'Form 6A Section 21 Notice.pdf',
      mimeType: 'application/pdf',
      extractedText: 'This is a Section 21 notice served using Form 6A.',
    });

    expect(result.docType).toBe('notice_s21');
    expect(result.confidence).toBeGreaterThan(0.3);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('returns other when no keywords match', () => {
    const result = classifyDocument({
      fileName: 'random.pdf',
      mimeType: 'application/pdf',
      extractedText: 'miscellaneous notes without keywords',
    });

    expect(result.docType).toBe('other');
  });
});
