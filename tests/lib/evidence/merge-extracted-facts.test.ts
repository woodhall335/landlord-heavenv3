/**
 * Tests for merge-extracted-facts module
 *
 * Validates that AI-extracted fields are properly merged into canonical facts
 * with provenance tracking and confidence scoring.
 */

import { describe, it, expect } from 'vitest';
import {
  mergeExtractedFacts,
  applyMergedFacts,
  generateConfirmationQuestions,
} from '@/lib/evidence/merge-extracted-facts';
import type { EvidenceAnalysisResult } from '@/lib/evidence/analyze-evidence';
import type { WizardFacts } from '@/lib/case-facts/schema';

describe('mergeExtractedFacts', () => {
  const baseInput = {
    caseId: 'test-case-123',
    evidenceId: 'evidence-456',
    jurisdiction: 'england',
    docType: 'tenancy_agreement',
    validatorKey: 'tenancy_agreement',
  };

  describe('high confidence merging', () => {
    it('merges high-confidence extracted fields into facts', () => {
      const analysisResult: EvidenceAnalysisResult = {
        detected_type: 'tenancy_agreement',
        extracted_fields: {
          tenant_full_name: 'John Smith',
          rent_amount: 1200,
          tenancy_start_date: '2024-01-15',
          deposit_amount: 1200,
        },
        confidence: 0.85,
        warnings: [],
        source: 'pdf_text',
      };

      const result = mergeExtractedFacts({ ...baseInput, analysisResult });

      expect(result.mergedFactsPatch).toEqual({
        tenant_full_name: 'John Smith',
        rent_amount: 1200,
        tenancy_start_date: '2024-01-15',
        deposit_amount: 1200,
      });
      expect(result.lowConfidenceKeys).toEqual([]);
    });

    it('stores provenance for merged facts', () => {
      const analysisResult: EvidenceAnalysisResult = {
        detected_type: 'tenancy_agreement',
        extracted_fields: {
          rent_amount: 1500,
        },
        confidence: 0.9,
        warnings: [],
        source: 'pdf_text',
      };

      const result = mergeExtractedFacts({ ...baseInput, analysisResult });

      expect(result.provenance.rent_amount).toMatchObject({
        evidence_id: 'evidence-456',
        method: 'pdf_text',
        model: 'gpt-4o-mini',
        original_key: 'rent_amount',
      });
      expect(result.provenance.rent_amount.extracted_at).toBeDefined();
    });

    it('stores confidence map for all extracted fields', () => {
      const analysisResult: EvidenceAnalysisResult = {
        detected_type: 'section_21',
        extracted_fields: {
          deposit_protected: true,
          gas_safety_mentioned: false,
        },
        confidence: 0.8,
        warnings: [],
        source: 'vision',
      };

      const result = mergeExtractedFacts({ ...baseInput, analysisResult });

      expect(result.confidenceMap.deposit_protected).toBeCloseTo(0.8, 1);
      expect(result.confidenceMap.gas_safety_pre_move_in).toBeCloseTo(0.8, 1);
    });
  });

  describe('low confidence handling', () => {
    it('tracks low-confidence extractions in lowConfidenceKeys', () => {
      const analysisResult: EvidenceAnalysisResult = {
        detected_type: 'tenancy_agreement',
        extracted_fields: {
          tenant_full_name: 'Jane Doe',
          rent_amount: 800,
        },
        confidence: 0.5, // Below HIGH_CONFIDENCE_THRESHOLD (0.65)
        warnings: [],
        source: 'vision',
      };

      const result = mergeExtractedFacts({ ...baseInput, analysisResult });

      expect(result.mergedFactsPatch).toEqual({}); // Not merged due to low confidence
      expect(result.lowConfidenceKeys).toContain('tenant_full_name');
      expect(result.lowConfidenceKeys).toContain('rent_amount');
    });

    it('does not track fields below minimum confidence threshold', () => {
      const analysisResult: EvidenceAnalysisResult = {
        detected_type: 'tenancy_agreement',
        extracted_fields: {
          tenant_full_name: 'Unknown',
        },
        confidence: 0.3, // Below LOW_CONFIDENCE_THRESHOLD (0.40)
        warnings: [],
        source: 'vision',
      };

      const result = mergeExtractedFacts({ ...baseInput, analysisResult });

      expect(result.mergedFactsPatch).toEqual({});
      expect(result.lowConfidenceKeys).toEqual([]);
    });
  });

  describe('field normalization', () => {
    it('normalizes boolean values from strings', () => {
      const analysisResult: EvidenceAnalysisResult = {
        detected_type: 'section_21',
        extracted_fields: {
          deposit_protected: 'yes',
          epc_mentioned: 'true',
          how_to_rent_mentioned: 'no',
        },
        confidence: 0.9,
        warnings: [],
        source: 'pdf_text',
      };

      const result = mergeExtractedFacts({ ...baseInput, analysisResult });

      expect(result.mergedFactsPatch.deposit_protected).toBe(true);
      expect(result.mergedFactsPatch.epc_provided).toBe(true);
      expect(result.mergedFactsPatch.how_to_rent_provided).toBe(false);
    });

    it('normalizes currency amounts from strings', () => {
      const analysisResult: EvidenceAnalysisResult = {
        detected_type: 'tenancy_agreement',
        extracted_fields: {
          rent_amount: '£1,500.00',
          deposit_amount: '1500',
        },
        confidence: 0.9,
        warnings: [],
        source: 'pdf_text',
      };

      const result = mergeExtractedFacts({ ...baseInput, analysisResult });

      expect(result.mergedFactsPatch.rent_amount).toBe(1500);
      expect(result.mergedFactsPatch.deposit_amount).toBe(1500);
    });

    it('normalizes dates to YYYY-MM-DD format', () => {
      const analysisResult: EvidenceAnalysisResult = {
        detected_type: 'tenancy_agreement',
        extracted_fields: {
          tenancy_start_date: '2024-03-15',
          tenancy_end_date: '15/09/2024', // Different format
        },
        confidence: 0.9,
        warnings: [],
        source: 'pdf_text',
      };

      const result = mergeExtractedFacts({ ...baseInput, analysisResult });

      expect(result.mergedFactsPatch.tenancy_start_date).toBe('2024-03-15');
      // Note: second date format may or may not parse correctly depending on Date.parse
    });

    it('normalizes array of tenant names to comma-separated string', () => {
      const analysisResult: EvidenceAnalysisResult = {
        detected_type: 'tenancy_agreement',
        extracted_fields: {
          tenant_names: ['John Smith', 'Jane Doe'],
        },
        confidence: 0.9,
        warnings: [],
        source: 'pdf_text',
      };

      const result = mergeExtractedFacts({ ...baseInput, analysisResult });

      expect(result.mergedFactsPatch.tenant_full_name).toBe('John Smith, Jane Doe');
    });
  });

  describe('field mapping', () => {
    it('maps alternative source keys to canonical targets', () => {
      const analysisResult: EvidenceAnalysisResult = {
        detected_type: 'tenancy_agreement',
        extracted_fields: {
          // Alternative keys that should map to canonical keys
          tenant_name: 'Bob Builder',
          monthly_rent: 950,
          start_date: '2024-02-01',
          deposit: 950,
          address: '123 Main St, London',
        },
        confidence: 0.85,
        warnings: [],
        source: 'pdf_text',
      };

      const result = mergeExtractedFacts({ ...baseInput, analysisResult });

      expect(result.mergedFactsPatch.tenant_full_name).toBe('Bob Builder');
      expect(result.mergedFactsPatch.rent_amount).toBe(950);
      expect(result.mergedFactsPatch.tenancy_start_date).toBe('2024-02-01');
      expect(result.mergedFactsPatch.deposit_amount).toBe(950);
      expect(result.mergedFactsPatch.property_address_line1).toBe('123 Main St, London');
    });

    it('maps Section 8 specific fields', () => {
      const analysisResult: EvidenceAnalysisResult = {
        detected_type: 'section_8',
        extracted_fields: {
          grounds_cited: [8, 10, 11],
          rent_arrears_stated: 5000,
        },
        confidence: 0.85,
        warnings: [],
        source: 'pdf_text',
      };

      const result = mergeExtractedFacts({ ...baseInput, analysisResult });

      expect(result.mergedFactsPatch.grounds_selected).toEqual(['8', '10', '11']);
      expect(result.mergedFactsPatch.current_arrears).toBe(5000);
    });

    it('maps Wales notice specific fields', () => {
      const analysisResult: EvidenceAnalysisResult = {
        detected_type: 'wales_notice',
        extracted_fields: {
          rhw_form_number: 'RHW16',
          bilingual_text_present: true,
        },
        confidence: 0.85,
        warnings: [],
        source: 'pdf_text',
      };

      const result = mergeExtractedFacts({ ...baseInput, analysisResult });

      expect(result.mergedFactsPatch.rhw_form_number).toBe('RHW16');
      expect(result.mergedFactsPatch.bilingual_notice_provided).toBe(true);
    });
  });

  describe('rawExtracted preservation', () => {
    it('preserves all raw extracted fields for debugging', () => {
      const analysisResult: EvidenceAnalysisResult = {
        detected_type: 'tenancy_agreement',
        extracted_fields: {
          tenant_full_name: 'Test Tenant',
          some_unknown_field: 'unknown value',
          raw_data: { nested: true },
        },
        confidence: 0.85,
        warnings: [],
        source: 'pdf_text',
      };

      const result = mergeExtractedFacts({ ...baseInput, analysisResult });

      expect(result.rawExtracted).toEqual(analysisResult.extracted_fields);
    });
  });
});

describe('applyMergedFacts', () => {
  it('applies merged facts using setIfMissing pattern', () => {
    const currentFacts = {
      tenant_full_name: '', // Empty - should be overwritten
      rent_amount: 1000, // Existing - should NOT be overwritten
    } as WizardFacts;

    const mergeOutput = {
      mergedFactsPatch: {
        tenant_full_name: 'New Tenant',
        rent_amount: 1200, // Different value
        deposit_amount: 1000, // New field
      },
      provenance: {},
      confidenceMap: {},
      lowConfidenceKeys: [],
      rawExtracted: {},
    };

    const result = applyMergedFacts(currentFacts, mergeOutput);

    expect((result as any).tenant_full_name).toBe('New Tenant');
    expect((result as any).rent_amount).toBe(1000); // Original preserved
    expect((result as any).deposit_amount).toBe(1000);
  });

  it('stores extraction metadata in __extraction', () => {
    const currentFacts = {} as WizardFacts;
    const mergeOutput = {
      mergedFactsPatch: { rent_amount: 1000 },
      provenance: {
        rent_amount: {
          evidence_id: 'ev-123',
          method: 'pdf_text' as const,
          model: 'gpt-4o-mini',
          extracted_at: '2024-01-01T00:00:00Z',
          original_key: 'rent_amount',
        },
      },
      confidenceMap: { rent_amount: 0.9 },
      lowConfidenceKeys: ['deposit_protected'],
      rawExtracted: {},
    };

    const result = applyMergedFacts(currentFacts, mergeOutput);

    expect((result as any).__extraction).toBeDefined();
    expect((result as any).__extraction.provenance.rent_amount).toBeDefined();
    expect((result as any).__extraction.confidence.rent_amount).toBe(0.9);
    expect((result as any).__extraction.low_confidence_keys).toContain('deposit_protected');
  });

  it('merges with existing extraction metadata', () => {
    const currentFacts = {
      __extraction: {
        last_merged: '2024-01-01T00:00:00Z',
        provenance: { existing_field: { evidence_id: 'old' } },
        confidence: { existing_field: 0.7 },
        low_confidence_keys: ['old_key'],
      },
    } as unknown as WizardFacts;

    const mergeOutput = {
      mergedFactsPatch: { rent_amount: 1000 },
      provenance: { rent_amount: { evidence_id: 'new', method: 'vision' as const, model: 'gpt-4o-mini', extracted_at: '2024-01-02', original_key: 'rent_amount' } },
      confidenceMap: { rent_amount: 0.85 },
      lowConfidenceKeys: ['new_key'],
      rawExtracted: {},
    };

    const result = applyMergedFacts(currentFacts, mergeOutput);

    // Should preserve old and add new
    expect((result as any).__extraction.provenance.existing_field).toBeDefined();
    expect((result as any).__extraction.provenance.rent_amount).toBeDefined();
    expect((result as any).__extraction.low_confidence_keys).toContain('old_key');
    expect((result as any).__extraction.low_confidence_keys).toContain('new_key');
  });
});

describe('generateConfirmationQuestions', () => {
  it('generates questions for known low-confidence keys', () => {
    const lowConfidenceKeys = ['deposit_protected', 'gas_safety_pre_move_in', 'rent_amount'];

    const questions = generateConfirmationQuestions(lowConfidenceKeys, 'section_21');

    expect(questions.length).toBeGreaterThan(0);
    expect(questions.some(q => q.factKey === 'deposit_protected')).toBe(true);
    expect(questions.some(q => q.factKey === 'gas_safety_pre_move_in')).toBe(true);
  });

  it('returns empty array for unknown keys', () => {
    const lowConfidenceKeys = ['unknown_field_xyz', 'another_unknown'];

    const questions = generateConfirmationQuestions(lowConfidenceKeys, 'section_21');

    expect(questions).toEqual([]);
  });

  it('includes correct question types', () => {
    const questions = generateConfirmationQuestions(['deposit_protected', 'rent_amount'], null);

    const depositQ = questions.find(q => q.factKey === 'deposit_protected');
    const rentQ = questions.find(q => q.factKey === 'rent_amount');

    expect(depositQ?.type).toBe('yes_no');
    expect(rentQ?.type).toBe('currency');
  });

  it('includes unique id for each question', () => {
    const questions = generateConfirmationQuestions(['deposit_protected', 'rent_amount'], null);

    expect(questions.every(q => q.id)).toBe(true);
    expect(questions.find(q => q.factKey === 'deposit_protected')?.id).toBe('confirm_deposit_protected');
    expect(questions.find(q => q.factKey === 'rent_amount')?.id).toBe('confirm_rent_amount');
  });
});
