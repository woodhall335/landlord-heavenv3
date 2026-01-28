/**
 * Tests for Document Classification
 *
 * Tests the classifyDocument function which classifies uploaded documents
 * based on filename, extracted text, and category hints.
 */

import { describe, it, expect } from 'vitest';
import { classifyDocument } from '../classify-document';

describe('classifyDocument', () => {
  describe('strong marker matching', () => {
    it('should classify Form 6A Section 21 with high confidence', () => {
      const result = classifyDocument({
        fileName: 'document.pdf',
        extractedText: 'This is a Form 6A notice under Section 21 of the Housing Act 1988',
      });

      expect(result.docType).toBe('notice_s21');
      expect(result.confidence).toBeGreaterThanOrEqual(0.88);
      expect(result.strongMarkersFound).toContain('form 6a');
      expect(result.strongMarkersFound).toContain('section 21');
    });

    it('should classify Section 8 Ground 8 notice correctly', () => {
      const result = classifyDocument({
        fileName: 'notice.pdf',
        extractedText: 'Notice seeking possession under Section 8 Ground 8 for rent arrears',
      });

      expect(result.docType).toBe('notice_s8');
      expect(result.confidence).toBeGreaterThanOrEqual(0.88);
    });

    it('should classify Wales RHW16 notice correctly', () => {
      const result = classifyDocument({
        fileName: 'welsh-notice.pdf',
        extractedText: 'RHW16 form under occupation contract as per Renting Homes (Wales) Act',
      });

      expect(result.docType).toBe('wales_notice');
      expect(result.confidence).toBeGreaterThanOrEqual(0.90);
    });

    it('should classify Scotland Notice to Leave correctly', () => {
      const result = classifyDocument({
        fileName: 'notice.pdf',
        extractedText: 'Notice to Leave under Private Residential Tenancy for First-Tier Tribunal',
      });

      expect(result.docType).toBe('scotland_notice_to_leave');
      expect(result.confidence).toBeGreaterThanOrEqual(0.88);
    });
  });

  describe('keyword matching', () => {
    it('should classify tenancy agreement from filename', () => {
      const result = classifyDocument({
        fileName: 'tenancy_agreement_2024.pdf',
        extractedText: '',
      });

      expect(result.docType).toBe('tenancy_agreement');
      expect(result.confidence).toBeGreaterThanOrEqual(0.4);
    });

    it('should classify gas safety certificate', () => {
      const result = classifyDocument({
        fileName: 'cp12.pdf',
        extractedText: 'Gas Safety Record CP12 inspection completed',
      });

      expect(result.docType).toBe('gas_safety');
    });

    it('should classify EPC from content', () => {
      const result = classifyDocument({
        fileName: 'certificate.pdf',
        extractedText: 'Energy Performance Certificate Rating B',
      });

      expect(result.docType).toBe('epc');
    });
  });

  describe('categoryHint usage', () => {
    it('should use categoryHint when filename is UUID and text is empty', () => {
      const result = classifyDocument({
        fileName: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf',
        extractedText: '',
        categoryHint: 'notice_s21',
      });

      expect(result.docType).toBe('notice_s21');
      expect(result.confidence).toBeGreaterThanOrEqual(0.65);
      expect(result.usedCategoryHint).toBe(true);
    });

    it('should use categoryHint when extraction quality is poor', () => {
      const result = classifyDocument({
        fileName: 'abc123def456789012345678.pdf',
        extractedText: 'short',
        categoryHint: 'notice_s8',
        extractionQuality: {
          text_extraction_method: 'failed',
          text_length: 5,
        },
      });

      expect(result.docType).toBe('notice_s8');
      expect(result.confidence).toBeGreaterThanOrEqual(0.70);
      expect(result.usedCategoryHint).toBe(true);
    });

    it('should boost confidence when categoryHint matches detected type', () => {
      const result = classifyDocument({
        fileName: 'section21-notice.pdf',
        extractedText: 'Section 21 notice',
        categoryHint: 'notice_s21',
      });

      expect(result.docType).toBe('notice_s21');
      expect(result.confidence).toBeGreaterThanOrEqual(0.6);
    });

    it('should use categoryHint when keyword match is weak', () => {
      const result = classifyDocument({
        fileName: 'document.pdf',
        extractedText: 'some notice',
        categoryHint: 'notice_s21',
      });

      expect(result.docType).toBe('notice_s21');
      expect(result.confidence).toBeGreaterThanOrEqual(0.70);
      expect(result.usedCategoryHint).toBe(true);
    });
  });

  describe('fallback to other', () => {
    it('should return other with low confidence when no matches', () => {
      const result = classifyDocument({
        fileName: 'random-file.pdf',
        extractedText: 'This is some random text with no keywords',
      });

      expect(result.docType).toBe('other');
      expect(result.confidence).toBe(0.2);
    });
  });

  describe('filename normalization', () => {
    it('should handle underscores in filenames', () => {
      const result = classifyDocument({
        fileName: 'Section_21_Notice.pdf',
        extractedText: '',
      });

      expect(result.docType).toBe('notice_s21');
    });

    it('should handle hyphens in filenames', () => {
      const result = classifyDocument({
        fileName: 'section-21-form.pdf',
        extractedText: '',
      });

      expect(result.docType).toBe('notice_s21');
    });
  });
});
