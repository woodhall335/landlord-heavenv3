/**
 * End-to-end validator integration tests
 *
 * Tests the full pipeline from PDF analysis to validation:
 * - PDF text extraction with timeout protection
 * - Document classification
 * - Legal validator routing (Section 8 / Section 21)
 *
 * Uses real PDFs from /artifacts directory.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { analyzeEvidence } from '../analyze-evidence';
import { classifyDocument } from '../classify-document';
import { runLegalValidator } from '@/lib/validators/run-legal-validator';

// Paths to test artifacts
const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts');
const SECTION_8_PDF = path.join(ARTIFACTS_DIR, 'notice_only/england/section_8.pdf');
const SECTION_21_PDF = path.join(ARTIFACTS_DIR, 'notice_only/england/section_21.pdf');

// Test timeout (analysis should complete well under this)
const TEST_TIMEOUT_MS = 15000;

// Max allowed analysis time (should be much faster for text PDFs)
const MAX_ANALYSIS_TIME_MS = 10000;

describe('Validator Integration Tests', () => {
  let section8Buffer: Buffer | null = null;
  let section21Buffer: Buffer | null = null;

  beforeAll(() => {
    // Load test PDFs if they exist
    if (fs.existsSync(SECTION_8_PDF)) {
      section8Buffer = fs.readFileSync(SECTION_8_PDF);
    }
    if (fs.existsSync(SECTION_21_PDF)) {
      section21Buffer = fs.readFileSync(SECTION_21_PDF);
    }
  });

  describe('Section 8 PDF Analysis', () => {
    it('should analyze Section 8 PDF within time limit', async () => {
      if (!section8Buffer) {
        console.warn('Section 8 PDF not found at:', SECTION_8_PDF);
        return;
      }

      const startTime = Date.now();

      const result = await analyzeEvidence({
        storageBucket: 'test',
        storagePath: 'test/section_8.pdf',
        mimeType: 'application/pdf',
        filename: 'section_8.pdf',
        caseId: 'test-case-123',
        questionId: 'validator_section_8',
        category: 'notice_s8',
        fileBuffer: section8Buffer,
        validatorKey: 'section_8',
        debugId: 'test-s8-analysis',
      });

      const duration = Date.now() - startTime;

      // Should complete within time limit
      expect(duration).toBeLessThan(MAX_ANALYSIS_TIME_MS);

      // Should have debug info
      expect(result.debug_id).toBeDefined();
      expect(result.duration_ms).toBeDefined();
      expect(result.final_stage).toBeDefined();

      // Should return a valid result (even if extraction failed)
      expect(result.detected_type).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.extraction_quality).toBeDefined();

      console.log('Section 8 analysis result:', {
        detected_type: result.detected_type,
        confidence: result.confidence,
        duration_ms: result.duration_ms,
        final_stage: result.final_stage,
        fields_count: Object.keys(result.extracted_fields || {}).length,
        extraction_method: result.extraction_quality?.text_extraction_method,
      });
    }, TEST_TIMEOUT_MS);

    it('should classify Section 8 PDF correctly', async () => {
      if (!section8Buffer) {
        console.warn('Section 8 PDF not found, skipping classification test');
        return;
      }

      // First analyze to get text
      const analysis = await analyzeEvidence({
        storageBucket: 'test',
        storagePath: 'test/section_8.pdf',
        mimeType: 'application/pdf',
        filename: 'section_8.pdf',
        caseId: 'test-case-123',
        fileBuffer: section8Buffer,
        validatorKey: 'section_8',
        debugId: 'test-s8-classify',
      });

      // Classify the document
      const classification = classifyDocument({
        fileName: 'section_8.pdf',
        mimeType: 'application/pdf',
        extractedText: analysis.raw_text || null,
        categoryHint: 'notice_s8',
        extractionQuality: analysis.extraction_quality,
      });

      expect(classification).toBeDefined();
      expect(classification.docType).toBeDefined();
      expect(classification.confidence).toBeGreaterThan(0);
      expect(classification.reasons).toBeInstanceOf(Array);

      // Should recognize as Section 8 related if text was extracted
      if (analysis.raw_text && analysis.raw_text.length > 100) {
        expect(['s8_notice', 'notice', 'legal_notice']).toContain(classification.docType);
      }

      console.log('Section 8 classification:', classification);
    }, TEST_TIMEOUT_MS);

    it('should route to Section 8 validator', async () => {
      if (!section8Buffer) {
        console.warn('Section 8 PDF not found, skipping validator routing test');
        return;
      }

      const analysis = await analyzeEvidence({
        storageBucket: 'test',
        storagePath: 'test/section_8.pdf',
        mimeType: 'application/pdf',
        filename: 'section_8.pdf',
        caseId: 'test-case-123',
        fileBuffer: section8Buffer,
        validatorKey: 'section_8',
        debugId: 'test-s8-validate',
      });

      // Run legal validator with Section 8 route
      const validatorResult = runLegalValidator({
        product: 'notice_only',
        jurisdiction: 'england',
        facts: {
          selected_notice_route: 'section_8',
          ...analysis.extracted_fields,
        },
        analysis,
      });

      expect(validatorResult.validator_key).toBe('section_8');
      expect(validatorResult.result).toBeDefined();
      expect(validatorResult.result?.status).toBeDefined();

      console.log('Section 8 validator result:', {
        validator_key: validatorResult.validator_key,
        status: validatorResult.result?.status,
        blockers_count: validatorResult.result?.blockers?.length || 0,
        warnings_count: validatorResult.result?.warnings?.length || 0,
      });
    }, TEST_TIMEOUT_MS);
  });

  describe('Section 21 PDF Analysis', () => {
    it('should analyze Section 21 PDF within time limit', async () => {
      if (!section21Buffer) {
        console.warn('Section 21 PDF not found at:', SECTION_21_PDF);
        return;
      }

      const startTime = Date.now();

      const result = await analyzeEvidence({
        storageBucket: 'test',
        storagePath: 'test/section_21.pdf',
        mimeType: 'application/pdf',
        filename: 'section_21.pdf',
        caseId: 'test-case-456',
        questionId: 'validator_section_21',
        category: 'notice_s21',
        fileBuffer: section21Buffer,
        validatorKey: 'section_21',
        debugId: 'test-s21-analysis',
      });

      const duration = Date.now() - startTime;

      // Should complete within time limit
      expect(duration).toBeLessThan(MAX_ANALYSIS_TIME_MS);

      // Should have debug info
      expect(result.debug_id).toBeDefined();
      expect(result.duration_ms).toBeDefined();
      expect(result.final_stage).toBeDefined();

      // Should return a valid result
      expect(result.detected_type).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.extraction_quality).toBeDefined();

      console.log('Section 21 analysis result:', {
        detected_type: result.detected_type,
        confidence: result.confidence,
        duration_ms: result.duration_ms,
        final_stage: result.final_stage,
        fields_count: Object.keys(result.extracted_fields || {}).length,
        extraction_method: result.extraction_quality?.text_extraction_method,
      });
    }, TEST_TIMEOUT_MS);

    it('should classify Section 21 PDF correctly', async () => {
      if (!section21Buffer) {
        console.warn('Section 21 PDF not found, skipping classification test');
        return;
      }

      const analysis = await analyzeEvidence({
        storageBucket: 'test',
        storagePath: 'test/section_21.pdf',
        mimeType: 'application/pdf',
        filename: 'section_21.pdf',
        caseId: 'test-case-456',
        fileBuffer: section21Buffer,
        validatorKey: 'section_21',
        debugId: 'test-s21-classify',
      });

      const classification = classifyDocument({
        fileName: 'section_21.pdf',
        mimeType: 'application/pdf',
        extractedText: analysis.raw_text || null,
        categoryHint: 'notice_s21',
        extractionQuality: analysis.extraction_quality,
      });

      expect(classification).toBeDefined();
      expect(classification.docType).toBeDefined();
      expect(classification.confidence).toBeGreaterThan(0);
      expect(classification.reasons).toBeInstanceOf(Array);

      // Should recognize as Section 21 related if text was extracted
      if (analysis.raw_text && analysis.raw_text.length > 100) {
        expect(['s21_notice', 'notice', 'legal_notice']).toContain(classification.docType);
      }

      console.log('Section 21 classification:', classification);
    }, TEST_TIMEOUT_MS);

    it('should route to Section 21 validator', async () => {
      if (!section21Buffer) {
        console.warn('Section 21 PDF not found, skipping validator routing test');
        return;
      }

      const analysis = await analyzeEvidence({
        storageBucket: 'test',
        storagePath: 'test/section_21.pdf',
        mimeType: 'application/pdf',
        filename: 'section_21.pdf',
        caseId: 'test-case-456',
        fileBuffer: section21Buffer,
        validatorKey: 'section_21',
        debugId: 'test-s21-validate',
      });

      const validatorResult = runLegalValidator({
        product: 'notice_only',
        jurisdiction: 'england',
        facts: {
          selected_notice_route: 'section_21',
          ...analysis.extracted_fields,
        },
        analysis,
      });

      expect(validatorResult.validator_key).toBe('section_21');
      expect(validatorResult.result).toBeDefined();
      expect(validatorResult.result?.status).toBeDefined();

      console.log('Section 21 validator result:', {
        validator_key: validatorResult.validator_key,
        status: validatorResult.result?.status,
        blockers_count: validatorResult.result?.blockers?.length || 0,
        warnings_count: validatorResult.result?.warnings?.length || 0,
      });
    }, TEST_TIMEOUT_MS);
  });

  describe('Timeout Protection', () => {
    it('should not hang on analysis - always returns within master timeout', async () => {
      // Create a minimal valid PDF buffer (may not parse but should not hang)
      const minimalPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\nxref\n0 1\n0000000000 65535 f \ntrailer\n<<>>\nstartxref\n9\n%%EOF');

      const startTime = Date.now();

      const result = await analyzeEvidence({
        storageBucket: 'test',
        storagePath: 'test/minimal.pdf',
        mimeType: 'application/pdf',
        filename: 'minimal.pdf',
        caseId: 'test-case-timeout',
        fileBuffer: minimalPdf,
        debugId: 'test-timeout',
      });

      const duration = Date.now() - startTime;

      // Should complete (even with failure) within reasonable time
      expect(duration).toBeLessThan(MAX_ANALYSIS_TIME_MS);

      // Should return a result (even if degraded)
      expect(result).toBeDefined();
      expect(result.debug_id).toBeDefined();
      expect(result.final_stage).toBeDefined();

      console.log('Timeout protection test:', {
        duration_ms: duration,
        final_stage: result.final_stage,
        warnings: result.warnings,
      });
    }, TEST_TIMEOUT_MS);

    it('should return debug_id in all responses', async () => {
      const testBuffer = Buffer.from('Not a PDF');

      const result = await analyzeEvidence({
        storageBucket: 'test',
        storagePath: 'test/invalid.pdf',
        mimeType: 'application/pdf',
        filename: 'invalid.pdf',
        caseId: 'test-case-debug',
        fileBuffer: testBuffer,
        debugId: 'custom-debug-id',
      });

      // Should use provided debug_id
      expect(result.debug_id).toBe('custom-debug-id');
      expect(result.duration_ms).toBeDefined();
      expect(result.final_stage).toBeDefined();
    });
  });
});
