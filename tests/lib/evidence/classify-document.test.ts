import { describe, expect, it } from 'vitest';
import { classifyDocument } from '@/lib/evidence/classify-document';

describe('classifyDocument', () => {
  describe('basic classification', () => {
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

  describe('strong marker detection', () => {
    it('classifies Form 6A + Section 21 with high confidence >= 0.88', () => {
      const result = classifyDocument({
        fileName: 'notice.pdf',
        mimeType: 'application/pdf',
        extractedText: 'This is a Form 6A notice under Section 21 of the Housing Act 1988.',
      });

      expect(result.docType).toBe('notice_s21');
      expect(result.confidence).toBeGreaterThanOrEqual(0.88);
      expect(result.strongMarkersFound).toBeDefined();
      expect(result.strongMarkersFound).toContain('form 6a');
      expect(result.strongMarkersFound).toContain('section 21');
    });

    it('classifies Form 3 + Section 8 with high confidence >= 0.88', () => {
      const result = classifyDocument({
        fileName: 'section8_notice.pdf',
        mimeType: 'application/pdf',
        extractedText: 'Form 3 - Notice seeking possession under Section 8 of the Housing Act 1988',
      });

      expect(result.docType).toBe('notice_s8');
      expect(result.confidence).toBeGreaterThanOrEqual(0.88);
      expect(result.strongMarkersFound).toBeDefined();
    });

    it('classifies Scotland Notice to Leave with high confidence', () => {
      const result = classifyDocument({
        fileName: 'scotland_notice.pdf',
        mimeType: 'application/pdf',
        extractedText: 'Notice to Leave - First-tier Tribunal for Scotland Housing and Property Chamber',
      });

      expect(result.docType).toBe('scotland_notice_to_leave');
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    it('classifies Wales RHW16 notice with high confidence', () => {
      const result = classifyDocument({
        fileName: 'wales_notice.pdf',
        mimeType: 'application/pdf',
        extractedText: 'RHW16 - Notice under the Renting Homes (Wales) Act for occupation contract',
      });

      expect(result.docType).toBe('wales_notice');
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });
  });

  describe('keyword fallback', () => {
    it('classifies with lower confidence when only one keyword matches', () => {
      const result = classifyDocument({
        fileName: 'document.pdf',
        mimeType: 'application/pdf',
        extractedText: 'This is a section 21 notice.',
      });

      expect(result.docType).toBe('notice_s21');
      expect(result.confidence).toBeGreaterThanOrEqual(0.4);
      expect(result.confidence).toBeLessThan(0.88);
      expect(result.strongMarkersFound).toBeUndefined();
    });
  });

  describe('categoryHint fallback', () => {
    it('uses categoryHint when no keywords match', () => {
      const result = classifyDocument({
        fileName: '3a871a41-1474-4051-9739-a309f494aca0.pdf', // UUID filename
        mimeType: 'application/pdf',
        extractedText: null, // No text extracted
        categoryHint: 'notice_s21',
      });

      expect(result.docType).toBe('notice_s21');
      expect(result.confidence).toBeGreaterThanOrEqual(0.65); // At least 0.65, now returns 0.70
      expect(result.reasons.some(r => r.includes('validator context'))).toBe(true);
    });

    it('boosts confidence when categoryHint matches detected type', () => {
      const result = classifyDocument({
        fileName: 'document.pdf',
        mimeType: 'application/pdf',
        extractedText: 'This is a section 21 notice.',
        categoryHint: 'notice_s21',
      });

      expect(result.docType).toBe('notice_s21');
      expect(result.confidence).toBeGreaterThanOrEqual(0.55); // Base + boost
      // With new logic, categoryHint may override weak keyword match or boost it
      expect(result.confidence).toBeGreaterThanOrEqual(0.55);
    });

    it('ignores invalid categoryHint', () => {
      const result = classifyDocument({
        fileName: 'random-file.pdf',
        mimeType: 'application/pdf',
        extractedText: null,
        categoryHint: 'invalid_category_type',
      });

      expect(result.docType).toBe('other');
      expect(result.confidence).toBe(0.2);
    });

    it('does not use categoryHint when strong markers are found', () => {
      const result = classifyDocument({
        fileName: 'notice.pdf',
        extractedText: 'This is a Form 6A notice under Section 21 of the Housing Act 1988.',
        categoryHint: 'notice_s8', // Wrong hint - should be ignored
      });

      expect(result.docType).toBe('notice_s21'); // Strong markers win
      expect(result.confidence).toBeGreaterThanOrEqual(0.88);
    });
  });

  describe('filename normalization', () => {
    it('classifies Section_21 filename with underscores', () => {
      const result = classifyDocument({
        fileName: 'Section_21_Notice.pdf',
        mimeType: 'application/pdf',
        extractedText: null,
      });

      expect(result.docType).toBe('notice_s21');
      expect(result.confidence).toBeGreaterThanOrEqual(0.4);
    });

    it('classifies Section-21 filename with hyphens', () => {
      const result = classifyDocument({
        fileName: 'Section-21-Notice.pdf',
        mimeType: 'application/pdf',
        extractedText: null,
      });

      expect(result.docType).toBe('notice_s21');
      expect(result.confidence).toBeGreaterThanOrEqual(0.4);
    });

    it('classifies Form_6A_Section_21 filename with high confidence', () => {
      const result = classifyDocument({
        fileName: 'Form_6A_Section_21_Notice.pdf',
        mimeType: 'application/pdf',
        extractedText: null,
      });

      expect(result.docType).toBe('notice_s21');
      expect(result.confidence).toBeGreaterThanOrEqual(0.88);
      expect(result.strongMarkersFound).toContain('form 6a');
      expect(result.strongMarkersFound).toContain('section 21');
    });

    it('classifies Section_8 filename correctly', () => {
      const result = classifyDocument({
        fileName: 'Section_8_Form_3_Notice.pdf',
        mimeType: 'application/pdf',
        extractedText: null,
      });

      expect(result.docType).toBe('notice_s8');
      expect(result.confidence).toBeGreaterThanOrEqual(0.88);
    });

    it('classifies RHW16 Wales notice filename', () => {
      const result = classifyDocument({
        fileName: 'RHW16_Occupation_Contract_Notice.pdf',
        mimeType: 'application/pdf',
        extractedText: null,
      });

      expect(result.docType).toBe('wales_notice');
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });
  });
});
