/**
 * Tests for Merge Extracted Facts
 *
 * Tests the mergeExtractedFacts function which maps AI-extracted fields
 * to canonical fact keys used by validators.
 */

import { describe, it, expect } from 'vitest';
import {
  mergeExtractedFacts,
  applyMergedFacts,
  generateConfirmationQuestions,
} from '../merge-extracted-facts';
import type { WizardFacts } from '@/lib/case-facts/schema';

describe('mergeExtractedFacts', () => {
  describe('basic extraction mapping', () => {
    it('should map tenant_names to tenant_full_name', () => {
      const result = mergeExtractedFacts({
        caseId: 'case-123',
        evidenceId: 'evidence-456',
        analysisResult: {
          detected_type: 's21_notice',
          extracted_fields: {
            tenant_names: ['John Smith', 'Jane Doe'],
          },
          confidence: 0.8,
          warnings: [],
        },
      });

      expect(result.mergedFactsPatch.tenant_full_name).toBe('John Smith, Jane Doe');
    });

    it('should map landlord_name to landlord_full_name', () => {
      const result = mergeExtractedFacts({
        caseId: 'case-123',
        evidenceId: 'evidence-456',
        analysisResult: {
          detected_type: 's21_notice',
          extracted_fields: {
            landlord_name: 'Robert Jones',
          },
          confidence: 0.8,
          warnings: [],
        },
      });

      expect(result.mergedFactsPatch.landlord_full_name).toBe('Robert Jones');
    });

    it('should map property_address to property_address_line1', () => {
      const result = mergeExtractedFacts({
        caseId: 'case-123',
        evidenceId: 'evidence-456',
        analysisResult: {
          detected_type: 's21_notice',
          extracted_fields: {
            property_address: '123 High Street, London, SW1A 1AA',
          },
          confidence: 0.8,
          warnings: [],
        },
      });

      expect(result.mergedFactsPatch.property_address_line1).toBe('123 High Street, London, SW1A 1AA');
    });

    it('should map date_served to notice_date', () => {
      const result = mergeExtractedFacts({
        caseId: 'case-123',
        evidenceId: 'evidence-456',
        analysisResult: {
          detected_type: 's21_notice',
          extracted_fields: {
            date_served: '2024-04-01',
          },
          confidence: 0.8,
          warnings: [],
        },
      });

      expect(result.mergedFactsPatch.notice_date).toBe('2024-04-01');
    });

    it('should map expiry_date to notice_expiry_date', () => {
      const result = mergeExtractedFacts({
        caseId: 'case-123',
        evidenceId: 'evidence-456',
        analysisResult: {
          detected_type: 's21_notice',
          extracted_fields: {
            expiry_date: '2024-06-01',
          },
          confidence: 0.8,
          warnings: [],
        },
      });

      expect(result.mergedFactsPatch.notice_expiry_date).toBe('2024-06-01');
    });
  });

  describe('boolean field mapping', () => {
    it('should map form_6a_used correctly', () => {
      const result = mergeExtractedFacts({
        caseId: 'case-123',
        evidenceId: 'evidence-456',
        analysisResult: {
          detected_type: 's21_notice',
          extracted_fields: {
            form_6a_used: true,
          },
          confidence: 0.8,
          warnings: [],
        },
      });

      expect(result.mergedFactsPatch.form_6a_used).toBe(true);
    });

    it('should map signature_present correctly', () => {
      const result = mergeExtractedFacts({
        caseId: 'case-123',
        evidenceId: 'evidence-456',
        analysisResult: {
          detected_type: 's21_notice',
          extracted_fields: {
            signature_present: true,
          },
          confidence: 0.8,
          warnings: [],
        },
      });

      expect(result.mergedFactsPatch.signature_present).toBe(true);
    });

    it('should map deposit_protected correctly', () => {
      const result = mergeExtractedFacts({
        caseId: 'case-123',
        evidenceId: 'evidence-456',
        analysisResult: {
          detected_type: 's21_notice',
          extracted_fields: {
            deposit_protected: true,
          },
          confidence: 0.8,
          warnings: [],
        },
      });

      expect(result.mergedFactsPatch.deposit_protected).toBe(true);
    });
  });

  describe('confidence thresholds', () => {
    it('should only merge high confidence values', () => {
      const result = mergeExtractedFacts({
        caseId: 'case-123',
        evidenceId: 'evidence-456',
        analysisResult: {
          detected_type: 's21_notice',
          extracted_fields: {
            landlord_name: 'High Confidence Name',
          },
          confidence: 0.8, // High confidence
          warnings: [],
        },
      });

      expect(result.mergedFactsPatch.landlord_full_name).toBe('High Confidence Name');
    });

    it('should track low confidence values for confirmation', () => {
      const result = mergeExtractedFacts({
        caseId: 'case-123',
        evidenceId: 'evidence-456',
        analysisResult: {
          detected_type: 's21_notice',
          extracted_fields: {
            deposit_protected: true,
          },
          confidence: 0.5, // Low confidence
          warnings: [],
        },
      });

      // Should not be in merged patch
      expect(result.mergedFactsPatch.deposit_protected).toBeUndefined();
      // Should be in low confidence keys
      expect(result.lowConfidenceKeys).toContain('deposit_protected');
    });
  });

  describe('provenance tracking', () => {
    it('should track provenance for merged facts', () => {
      const result = mergeExtractedFacts({
        caseId: 'case-123',
        evidenceId: 'evidence-456',
        analysisResult: {
          detected_type: 's21_notice',
          extracted_fields: {
            landlord_name: 'Robert Jones',
          },
          confidence: 0.8,
          warnings: [],
          source: 'pdf_text',
        },
      });

      expect(result.provenance.landlord_full_name).toBeDefined();
      expect(result.provenance.landlord_full_name.evidence_id).toBe('evidence-456');
      expect(result.provenance.landlord_full_name.method).toBe('pdf_text');
      expect(result.provenance.landlord_full_name.original_key).toBe('landlord_name');
    });
  });

  describe('amount normalization', () => {
    it('should normalize rent_amount with currency symbol', () => {
      const result = mergeExtractedFacts({
        caseId: 'case-123',
        evidenceId: 'evidence-456',
        analysisResult: {
          detected_type: 'tenancy_agreement',
          extracted_fields: {
            rent_amount: '£1,500.00',
          },
          confidence: 0.8,
          warnings: [],
        },
      });

      expect(result.mergedFactsPatch.rent_amount).toBe(1500);
    });

    it('should normalize deposit_amount', () => {
      const result = mergeExtractedFacts({
        caseId: 'case-123',
        evidenceId: 'evidence-456',
        analysisResult: {
          detected_type: 'tenancy_agreement',
          extracted_fields: {
            deposit_amount: '£2,000',
          },
          confidence: 0.8,
          warnings: [],
        },
      });

      expect(result.mergedFactsPatch.deposit_amount).toBe(2000);
    });
  });
});

describe('applyMergedFacts', () => {
  it('should apply merged facts to current facts', () => {
    const currentFacts: WizardFacts = {
      jurisdiction: 'england',
    };

    const mergeOutput = {
      mergedFactsPatch: {
        landlord_full_name: 'Robert Jones',
        notice_date: '2024-04-01',
      },
      provenance: {},
      confidenceMap: {},
      lowConfidenceKeys: [],
      rawExtracted: {},
    };

    const result = applyMergedFacts(currentFacts, mergeOutput);

    expect(result.landlord_full_name).toBe('Robert Jones');
    expect((result as any).notice_date).toBe('2024-04-01');
    expect(result.jurisdiction).toBe('england'); // Preserved existing
  });

  it('should not overwrite existing values', () => {
    const currentFacts: WizardFacts = {
      landlord_full_name: 'Existing Name',
    };

    const mergeOutput = {
      mergedFactsPatch: {
        landlord_full_name: 'New Name',
      },
      provenance: {},
      confidenceMap: {},
      lowConfidenceKeys: [],
      rawExtracted: {},
    };

    const result = applyMergedFacts(currentFacts, mergeOutput);

    expect(result.landlord_full_name).toBe('Existing Name'); // Not overwritten
  });

  it('should store extraction metadata', () => {
    const currentFacts: WizardFacts = {};

    const mergeOutput = {
      mergedFactsPatch: {
        landlord_full_name: 'Robert Jones',
      },
      provenance: {
        landlord_full_name: {
          evidence_id: 'evidence-123',
          method: 'pdf_text' as const,
          model: 'gpt-4o-mini',
          extracted_at: '2024-04-01T00:00:00Z',
          original_key: 'landlord_name',
        },
      },
      confidenceMap: {
        landlord_full_name: 0.85,
      },
      lowConfidenceKeys: [],
      rawExtracted: {},
    };

    const result = applyMergedFacts(currentFacts, mergeOutput);

    expect((result as any).__extraction).toBeDefined();
    expect((result as any).__extraction.provenance.landlord_full_name).toBeDefined();
    expect((result as any).__extraction.confidence.landlord_full_name).toBe(0.85);
  });
});

describe('generateConfirmationQuestions', () => {
  it('should generate questions for known low confidence keys', () => {
    const questions = generateConfirmationQuestions(['deposit_protected', 'gas_safety_pre_move_in']);

    expect(questions).toHaveLength(2);
    expect(questions.find(q => q.factKey === 'deposit_protected')).toBeDefined();
    expect(questions.find(q => q.factKey === 'gas_safety_pre_move_in')).toBeDefined();
  });

  it('should include correct question text', () => {
    const questions = generateConfirmationQuestions(['deposit_protected']);

    const depositQuestion = questions.find(q => q.factKey === 'deposit_protected');
    expect(depositQuestion?.question).toContain('deposit protected');
    expect(depositQuestion?.type).toBe('yes_no');
  });

  it('should filter out unknown keys', () => {
    const questions = generateConfirmationQuestions(['unknown_key', 'deposit_protected']);

    expect(questions).toHaveLength(1);
    expect(questions[0].factKey).toBe('deposit_protected');
  });

  it('should include helpText where available', () => {
    const questions = generateConfirmationQuestions(['deposit_protected']);

    const depositQuestion = questions.find(q => q.factKey === 'deposit_protected');
    expect(depositQuestion?.helpText).toBeDefined();
  });
});
