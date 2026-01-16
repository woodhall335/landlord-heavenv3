/**
 * End-to-end validator integration tests
 *
 * Tests the full pipeline from PDF analysis to validation:
 * - PDF text extraction with timeout protection
 * - Document classification
 * - Legal validator routing (Section 8 / Section 21)
 * - Wrong document type detection
 *
 * Uses real PDFs from /artifacts directory.
 *
 * IMPORTANT: Tests focus on LEGAL STRUCTURE ONLY.
 * Watermarks, preview language, and other non-structural elements are IGNORED.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { analyzeEvidence } from '../analyze-evidence';
import { classifyDocument } from '../classify-document';
import { runLegalValidator } from '@/lib/validators/run-legal-validator';
import { validateSection21Notice, validateSection8Notice } from '@/lib/validators/legal-validators';

// Paths to test artifacts
const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts');
const SECTION_8_PDF = path.join(ARTIFACTS_DIR, 'notice_only/england/section_8.pdf');
const SECTION_21_PDF = path.join(ARTIFACTS_DIR, 'notice_only/england/section_21.pdf');
// Specific artifact from issue - Section 21 Form 6A preview
const ARTIFACT_PDF = path.join(ARTIFACTS_DIR, 'f9a34a18-6b94-46eb-a58d-1d90c0875829.pdf');

// Test timeout (analysis should complete well under this)
const TEST_TIMEOUT_MS = 15000;

// Max allowed analysis time (should be much faster for text PDFs)
const MAX_ANALYSIS_TIME_MS = 10000;

describe('Validator Integration Tests', () => {
  let section8Buffer: Buffer | null = null;
  let section21Buffer: Buffer | null = null;
  let artifactBuffer: Buffer | null = null;

  beforeAll(() => {
    // Load test PDFs if they exist
    if (fs.existsSync(SECTION_8_PDF)) {
      section8Buffer = fs.readFileSync(SECTION_8_PDF);
    }
    if (fs.existsSync(SECTION_21_PDF)) {
      section21Buffer = fs.readFileSync(SECTION_21_PDF);
    }
    if (fs.existsSync(ARTIFACT_PDF)) {
      artifactBuffer = fs.readFileSync(ARTIFACT_PDF);
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

  /**
   * Deterministic Validator Tests
   *
   * These tests validate the rule engine directly with synthetic inputs.
   * NO AI calls, NO PDF parsing - purely testing legal structure validation.
   *
   * IMPORTANT: Focus on LEGAL STRUCTURE ONLY:
   * - Form type detection (Form 6A vs Form 3)
   * - Grounds cited (Section 8 only)
   * - Required fields presence
   *
   * IGNORE: Watermarks, preview text, commercial language
   */
  describe('Deterministic Validator Tests', () => {
    /**
     * Case A: Section 21 Correct - Valid Form 6A structure
     * A properly structured Section 21 Form 6A should NOT trigger wrong_doc_type blocker
     */
    it('Case A: Section 21 correct - valid Form 6A should pass structure check', () => {
      const result = validateSection21Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 21 Notice',
          form_6a_detected: true,
          section_21_detected: true,
          date_served: '22/12/2025',
          expiry_date: '14/07/2026',
          property_address: '16 waterloo road, pudsey, ls28 7pw',
          tenant_names: 'sonia',
          landlord_name: 'Tariq',
          signature_present: true,
        },
        answers: {
          deposit_protected: 'yes',
          prescribed_info_served: 'yes',
          gas_safety_pre_move_in: 'yes',
          epc_provided: 'yes',
          how_to_rent_provided: 'yes',
        },
      });

      // Should NOT have wrong_doc_type blocker
      const wrongDocTypeBlocker = result.blockers.find((b) => b.code === 'S21-WRONG-DOC-TYPE');
      expect(wrongDocTypeBlocker).toBeUndefined();

      // Should NOT have wrong_form blocker (it IS a Form 6A)
      const wrongFormBlocker = result.blockers.find((b) => b.code === 'S21-WRONG-FORM');
      expect(wrongFormBlocker).toBeUndefined();

      // With all answers provided as 'yes', should pass or have only minor warnings
      expect(['pass', 'warning']).toContain(result.status);

      console.log('Case A (S21 correct):', {
        status: result.status,
        blockers: result.blockers.map((b) => b.code),
        warnings_count: result.warnings.length,
      });
    });

    /**
     * Case B: Section 21 Incorrect - Section 8 Form 3 submitted for Section 21 validation
     * Should trigger S21-WRONG-DOC-TYPE blocker
     * IMPORTANT: This is a TERMINAL blocker - no warnings or compliance questions shown
     */
    it('Case B: Section 21 incorrect - Section 8 Form 3 should fail with wrong_doc_type (terminal)', () => {
      const result = validateSection21Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 8 Notice',
          form_3_detected: true,
          section_8_detected: true,
          grounds_cited: [8, 10, 11], // Section 8 grounds - NOT valid for S21
          date_served: '01/01/2026',
          property_address: '123 Test Street',
          tenant_names: 'John Doe',
        },
        answers: {},
      });

      // MUST have wrong_doc_type blocker
      const wrongDocTypeBlocker = result.blockers.find((b) => b.code === 'S21-WRONG-DOC-TYPE');
      expect(wrongDocTypeBlocker).toBeDefined();
      expect(wrongDocTypeBlocker?.message).toContain('Section 8');

      // Status should be invalid
      expect(result.status).toBe('invalid');

      // TERMINAL BLOCKER: No warnings should be present (short-circuit)
      expect(result.warnings).toHaveLength(0);

      // TERMINAL BLOCKER: Flag should be set
      expect(result.terminal_blocker).toBe(true);

      // Should only have ONE blocker (the wrong_doc_type)
      expect(result.blockers).toHaveLength(1);

      console.log('Case B (S21 incorrect - wrong doc type, TERMINAL):', {
        status: result.status,
        blockers: result.blockers.map((b) => b.code),
        warnings: result.warnings.map((w) => w.code),
        terminal_blocker: result.terminal_blocker,
        wrongDocTypeMessage: wrongDocTypeBlocker?.message,
      });
    });

    /**
     * Case C: Section 8 Correct - Valid Form 3 structure with grounds
     * A properly structured Section 8 Form 3 should NOT trigger wrong_doc_type blocker
     */
    it('Case C: Section 8 correct - valid Form 3 with grounds should pass structure check', () => {
      const result = validateSection8Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 8 Notice',
          form_3_detected: true,
          section_8_detected: true,
          grounds_cited: [8], // Ground 8 - mandatory ground for rent arrears
          date_served: '01/01/2026',
          property_address: '123 Test Street',
          tenant_names: 'John Doe',
          rent_arrears_stated: 3000,
        },
        answers: {
          rent_frequency: 'monthly',
          rent_amount: 1000,
          current_arrears: 3000,
        },
      });

      // Should NOT have wrong_doc_type blocker
      const wrongDocTypeBlocker = result.blockers.find((b) => b.code === 'S8-WRONG-DOC-TYPE');
      expect(wrongDocTypeBlocker).toBeUndefined();

      // Should NOT have grounds_missing blocker
      const groundsMissingBlocker = result.blockers.find((b) => b.code === 'S8-GROUNDS-MISSING');
      expect(groundsMissingBlocker).toBeUndefined();

      // Should have a valid status (ground_8_satisfied, discretionary_only, etc)
      expect(['ground_8_satisfied', 'discretionary_only', 'high_risk', 'warning']).toContain(result.status);

      console.log('Case C (S8 correct):', {
        status: result.status,
        blockers: result.blockers.map((b) => b.code),
        warnings_count: result.warnings.length,
      });
    });

    /**
     * Case D: Section 8 Incorrect - Section 21 Form 6A submitted for Section 8 validation
     * Should trigger S8-WRONG-DOC-TYPE blocker
     * IMPORTANT: This is a TERMINAL blocker - no warnings or compliance questions shown
     */
    it('Case D: Section 8 incorrect - Section 21 Form 6A should fail with wrong_doc_type (terminal)', () => {
      const result = validateSection8Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 21 Notice',
          form_6a_detected: true,
          section_21_detected: true,
          date_served: '22/12/2025',
          expiry_date: '14/07/2026',
          property_address: '16 waterloo road, pudsey',
          tenant_names: 'sonia',
          landlord_name: 'Tariq',
          signature_present: true,
          // NO grounds_cited - this is a Section 21, not Section 8
        },
        answers: {},
      });

      // MUST have wrong_doc_type blocker
      const wrongDocTypeBlocker = result.blockers.find((b) => b.code === 'S8-WRONG-DOC-TYPE');
      expect(wrongDocTypeBlocker).toBeDefined();
      expect(wrongDocTypeBlocker?.message).toContain('Section 21');

      // Status should be invalid
      expect(result.status).toBe('invalid');

      // TERMINAL BLOCKER: No warnings should be present (short-circuit)
      expect(result.warnings).toHaveLength(0);

      // TERMINAL BLOCKER: Flag should be set
      expect(result.terminal_blocker).toBe(true);

      // Should only have ONE blocker (the wrong_doc_type)
      expect(result.blockers).toHaveLength(1);

      console.log('Case D (S8 incorrect - wrong doc type, TERMINAL):', {
        status: result.status,
        blockers: result.blockers.map((b) => b.code),
        warnings: result.warnings.map((w) => w.code),
        terminal_blocker: result.terminal_blocker,
        wrongDocTypeMessage: wrongDocTypeBlocker?.message,
      });
    });

    /**
     * Case: Section 21 with no form indicators should trigger WRONG-FORM (not WRONG-DOC-TYPE)
     */
    it('Section 21 with no form indicators should fail with WRONG-FORM', () => {
      const result = validateSection21Notice({
        jurisdiction: 'england',
        extracted: {
          // No form indicators at all
          date_served: '01/01/2026',
          property_address: '123 Test Street',
        },
        answers: {},
      });

      // Should have WRONG-FORM blocker (not WRONG-DOC-TYPE since we don't know what it is)
      const wrongFormBlocker = result.blockers.find((b) => b.code === 'S21-WRONG-FORM');
      expect(wrongFormBlocker).toBeDefined();

      // Should NOT have wrong_doc_type (unknown doc, not confirmed as S8)
      const wrongDocTypeBlocker = result.blockers.find((b) => b.code === 'S21-WRONG-DOC-TYPE');
      expect(wrongDocTypeBlocker).toBeUndefined();

      console.log('S21 no form indicators:', {
        status: result.status,
        blockers: result.blockers.map((b) => b.code),
      });
    });
  });

  /**
   * Structural Invalid Tests - Section 21 (Form 6A)
   *
   * These tests verify that validators catch missing mandatory fields and invalid
   * structure within the CORRECT document type. The document IS recognized as
   * Section 21 (Form 6A) but fails due to structural issues.
   *
   * IMPORTANT: These tests should NOT trigger S21-WRONG-DOC-TYPE since the
   * document is correctly identified as a Section 21 notice.
   */
  describe('Section 21 Structural Invalid Tests', () => {
    /**
     * Test S21-SI-1: Missing property address
     * Document is Form 6A but lacks property address field
     */
    it('S21-SI-1: Missing property address should fail with address-missing warning', () => {
      const result = validateSection21Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 21 Notice',
          form_6a_detected: true,
          section_21_detected: true,
          date_served: '01/01/2026', // UK format DD/MM/YYYY
          expiry_date: '01/03/2026', // UK format - 2 months later (1 March)
          tenant_names: 'John Doe',
          landlord_name: 'Jane Landlord',
          signature_present: true,
          // property_address: MISSING
        },
        answers: {
          deposit_protected: 'yes',
          prescribed_info_served: 'yes',
          gas_safety_pre_move_in: 'yes',
          epc_provided: 'yes',
          how_to_rent_provided: 'yes',
        },
      });

      // Should NOT have wrong_doc_type blocker
      const wrongDocTypeBlocker = result.blockers.find((b) => b.code === 'S21-WRONG-DOC-TYPE');
      expect(wrongDocTypeBlocker).toBeUndefined();

      // Should have property address warning
      const addressWarning = result.warnings.find((w) => w.code === 'S21-PROPERTY-ADDRESS-MISSING');
      expect(addressWarning).toBeDefined();
      expect(addressWarning?.message).toContain('address');

      console.log('S21-SI-1 (missing address):', {
        status: result.status,
        blockers: result.blockers.map((b) => b.code),
        warnings: result.warnings.map((w) => w.code),
        addressWarning: addressWarning?.message,
      });
    });

    /**
     * Test S21-SI-2: Missing service date and expiry date
     * Document is Form 6A but lacks critical dates
     */
    it('S21-SI-2: Missing service date and expiry date should fail with date warnings', () => {
      const result = validateSection21Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 21 Notice',
          form_6a_detected: true,
          section_21_detected: true,
          property_address: '123 Test Street, London, SW1A 1AA',
          tenant_names: 'John Doe',
          landlord_name: 'Jane Landlord',
          signature_present: true,
          // date_served: MISSING
          // expiry_date: MISSING
        },
        answers: {
          deposit_protected: 'yes',
          prescribed_info_served: 'yes',
          gas_safety_pre_move_in: 'yes',
          epc_provided: 'yes',
          how_to_rent_provided: 'yes',
        },
      });

      // Should NOT have wrong_doc_type blocker
      const wrongDocTypeBlocker = result.blockers.find((b) => b.code === 'S21-WRONG-DOC-TYPE');
      expect(wrongDocTypeBlocker).toBeUndefined();

      // Should have service date and expiry date warnings
      const serviceDateWarning = result.warnings.find((w) => w.code === 'S21-SERVICE-DATE-MISSING');
      const expiryDateWarning = result.warnings.find((w) => w.code === 'S21-EXPIRY-DATE-MISSING');
      expect(serviceDateWarning).toBeDefined();
      expect(expiryDateWarning).toBeDefined();

      // Status should be warning (not invalid since these are warnings)
      expect(result.status).toBe('warning');

      console.log('S21-SI-2 (missing dates):', {
        status: result.status,
        blockers: result.blockers.map((b) => b.code),
        warnings: result.warnings.map((w) => w.code),
        serviceDateWarning: serviceDateWarning?.message,
        expiryDateWarning: expiryDateWarning?.message,
      });
    });

    /**
     * Test S21-SI-3: Missing signature
     * Document is Form 6A but lacks landlord signature - this is a BLOCKER
     */
    it('S21-SI-3: Missing signature should fail with signature blocker', () => {
      const result = validateSection21Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 21 Notice',
          form_6a_detected: true,
          section_21_detected: true,
          date_served: '01/01/2026', // UK format DD/MM/YYYY
          expiry_date: '01/03/2026', // UK format - 2 months later (1 March)
          property_address: '123 Test Street, London, SW1A 1AA',
          tenant_names: 'John Doe',
          landlord_name: 'Jane Landlord',
          signature_present: false, // Explicitly NOT signed
        },
        answers: {
          deposit_protected: 'yes',
          prescribed_info_served: 'yes',
          gas_safety_pre_move_in: 'yes',
          epc_provided: 'yes',
          how_to_rent_provided: 'yes',
        },
      });

      // Should NOT have wrong_doc_type blocker
      const wrongDocTypeBlocker = result.blockers.find((b) => b.code === 'S21-WRONG-DOC-TYPE');
      expect(wrongDocTypeBlocker).toBeUndefined();

      // Should have signature blocker
      const signatureBlocker = result.blockers.find((b) => b.code === 'S21-SIGNATURE-MISSING');
      expect(signatureBlocker).toBeDefined();
      expect(signatureBlocker?.message).toContain('signed');

      // Status should be invalid (blocker present)
      expect(result.status).toBe('invalid');

      console.log('S21-SI-3 (missing signature):', {
        status: result.status,
        blockers: result.blockers.map((b) => b.code),
        warnings: result.warnings.map((w) => w.code),
        signatureBlocker: signatureBlocker?.message,
      });
    });

    /**
     * Test S21-SI-4: Invalid notice period (less than 2 months)
     * Document is Form 6A but expiry date is too soon
     */
    it('S21-SI-4: Insufficient notice period should fail with notice-period blocker', () => {
      const result = validateSection21Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 21 Notice',
          form_6a_detected: true,
          section_21_detected: true,
          date_served: '01/01/2026', // UK format DD/MM/YYYY
          expiry_date: '15/01/2026', // Only 2 weeks - needs 2 months!
          property_address: '123 Test Street, London, SW1A 1AA',
          tenant_names: 'John Doe',
          landlord_name: 'Jane Landlord',
          signature_present: true,
        },
        answers: {
          deposit_protected: 'yes',
          prescribed_info_served: 'yes',
          gas_safety_pre_move_in: 'yes',
          epc_provided: 'yes',
          how_to_rent_provided: 'yes',
        },
      });

      // Should NOT have wrong_doc_type blocker
      const wrongDocTypeBlocker = result.blockers.find((b) => b.code === 'S21-WRONG-DOC-TYPE');
      expect(wrongDocTypeBlocker).toBeUndefined();

      // Should have notice period blocker
      const noticePeriodBlocker = result.blockers.find((b) => b.code === 'S21-NOTICE-PERIOD');
      expect(noticePeriodBlocker).toBeDefined();
      expect(noticePeriodBlocker?.message).toContain('two-month');

      // Status should be invalid (blocker present)
      expect(result.status).toBe('invalid');

      console.log('S21-SI-4 (insufficient notice period):', {
        status: result.status,
        blockers: result.blockers.map((b) => b.code),
        warnings: result.warnings.map((w) => w.code),
        noticePeriodBlocker: noticePeriodBlocker?.message,
      });
    });

    /**
     * Test S21-SI-5: Missing landlord name
     * Document is Form 6A but lacks landlord name field
     */
    it('S21-SI-5: Missing landlord name should fail with landlord-name warning', () => {
      const result = validateSection21Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 21 Notice',
          form_6a_detected: true,
          section_21_detected: true,
          date_served: '01/01/2026', // UK format DD/MM/YYYY
          expiry_date: '01/03/2026', // UK format - 2 months later (1 March)
          property_address: '123 Test Street, London, SW1A 1AA',
          tenant_names: 'John Doe',
          // landlord_name: MISSING
          signature_present: true,
        },
        answers: {
          deposit_protected: 'yes',
          prescribed_info_served: 'yes',
          gas_safety_pre_move_in: 'yes',
          epc_provided: 'yes',
          how_to_rent_provided: 'yes',
        },
      });

      // Should NOT have wrong_doc_type blocker
      const wrongDocTypeBlocker = result.blockers.find((b) => b.code === 'S21-WRONG-DOC-TYPE');
      expect(wrongDocTypeBlocker).toBeUndefined();

      // Should have landlord name warning
      const landlordWarning = result.warnings.find((w) => w.code === 'S21-LANDLORD-NAME-MISSING');
      expect(landlordWarning).toBeDefined();
      expect(landlordWarning?.message).toContain('Landlord');

      console.log('S21-SI-5 (missing landlord name):', {
        status: result.status,
        blockers: result.blockers.map((b) => b.code),
        warnings: result.warnings.map((w) => w.code),
        landlordWarning: landlordWarning?.message,
      });
    });

    /**
     * Test S21-SI-6: Multiple structural issues combined
     * Document is Form 6A but has multiple problems
     */
    it('S21-SI-6: Multiple structural issues should accumulate', () => {
      const result = validateSection21Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 21 Notice',
          form_6a_detected: true,
          section_21_detected: true,
          date_served: '01/01/2026', // UK format DD/MM/YYYY
          expiry_date: '20/01/2026', // Only 19 days - insufficient notice period (blocker)
          // property_address: MISSING (warning)
          // tenant_names: MISSING (warning)
          // landlord_name: MISSING (warning)
          signature_present: false, // Missing (blocker)
        },
        answers: {
          deposit_protected: 'yes',
          prescribed_info_served: 'yes',
          gas_safety_pre_move_in: 'yes',
          epc_provided: 'yes',
          how_to_rent_provided: 'yes',
        },
      });

      // Should NOT have wrong_doc_type blocker
      const wrongDocTypeBlocker = result.blockers.find((b) => b.code === 'S21-WRONG-DOC-TYPE');
      expect(wrongDocTypeBlocker).toBeUndefined();

      // Should have multiple blockers (signature + notice period)
      expect(result.blockers.length).toBeGreaterThanOrEqual(2);
      expect(result.blockers.map((b) => b.code)).toContain('S21-SIGNATURE-MISSING');
      expect(result.blockers.map((b) => b.code)).toContain('S21-NOTICE-PERIOD');

      // Should have multiple warnings
      expect(result.warnings.length).toBeGreaterThanOrEqual(2);

      // Status should be invalid
      expect(result.status).toBe('invalid');

      console.log('S21-SI-6 (multiple issues):', {
        status: result.status,
        blockers: result.blockers.map((b) => b.code),
        warnings: result.warnings.map((w) => w.code),
        blockerCount: result.blockers.length,
        warningCount: result.warnings.length,
      });
    });
  });

  /**
   * Structural Invalid Tests - Section 8 (Form 3)
   *
   * These tests verify that validators catch missing mandatory fields and invalid
   * structure within the CORRECT document type. The document IS recognized as
   * Section 8 (Form 3) but fails due to structural issues.
   *
   * IMPORTANT: These tests should NOT trigger S8-WRONG-DOC-TYPE since the
   * document is correctly identified as a Section 8 notice.
   */
  describe('Section 8 Structural Invalid Tests', () => {
    /**
     * Test S8-SI-1: Missing grounds section
     * Document is Form 3 but no grounds are cited - BLOCKER
     */
    it('S8-SI-1: Missing grounds should fail with grounds-missing blocker', () => {
      const result = validateSection8Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 8 Notice',
          form_3_detected: true,
          section_8_detected: true,
          date_served: '01/01/2026', // UK format DD/MM/YYYY
          property_address: '123 Test Street, London, SW1A 1AA',
          tenant_details: 'John Doe',
          rent_arrears_stated: 5000,
          // grounds_cited: MISSING - no grounds cited!
        },
        answers: {
          rent_frequency: 'monthly',
          rent_amount: 1500,
          current_arrears: 5000,
        },
      });

      // Should NOT have wrong_doc_type blocker
      const wrongDocTypeBlocker = result.blockers.find((b) => b.code === 'S8-WRONG-DOC-TYPE');
      expect(wrongDocTypeBlocker).toBeUndefined();

      // Should have grounds-missing blocker
      const groundsBlocker = result.blockers.find((b) => b.code === 'S8-GROUNDS-MISSING');
      expect(groundsBlocker).toBeDefined();
      expect(groundsBlocker?.message).toContain('ground');

      // Status should be invalid
      expect(result.status).toBe('invalid');

      console.log('S8-SI-1 (missing grounds):', {
        status: result.status,
        blockers: result.blockers.map((b) => b.code),
        warnings: result.warnings.map((w) => w.code),
        groundsBlocker: groundsBlocker?.message,
      });
    });

    /**
     * Test S8-SI-2: Missing service date
     * Document is Form 3 but service date is missing
     */
    it('S8-SI-2: Missing service date should fail with service-date warning', () => {
      const result = validateSection8Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 8 Notice',
          form_3_detected: true,
          section_8_detected: true,
          grounds_cited: [8, 10],
          property_address: '123 Test Street, London, SW1A 1AA',
          tenant_details: 'John Doe',
          rent_arrears_stated: 5000,
          // date_served: MISSING
        },
        answers: {
          rent_frequency: 'monthly',
          rent_amount: 1500,
          current_arrears: 5000,
        },
      });

      // Should NOT have wrong_doc_type blocker
      const wrongDocTypeBlocker = result.blockers.find((b) => b.code === 'S8-WRONG-DOC-TYPE');
      expect(wrongDocTypeBlocker).toBeUndefined();

      // Should have service date warning
      const serviceDateWarning = result.warnings.find((w) => w.code === 'S8-SERVICE-DATE-MISSING');
      expect(serviceDateWarning).toBeDefined();
      expect(serviceDateWarning?.message).toContain('Service date');

      console.log('S8-SI-2 (missing service date):', {
        status: result.status,
        blockers: result.blockers.map((b) => b.code),
        warnings: result.warnings.map((w) => w.code),
        serviceDateWarning: serviceDateWarning?.message,
      });
    });

    /**
     * Test S8-SI-3: Missing tenant details
     * Document is Form 3 but tenant details are missing
     */
    it('S8-SI-3: Missing tenant details should fail with tenant-details warning', () => {
      const result = validateSection8Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 8 Notice',
          form_3_detected: true,
          section_8_detected: true,
          grounds_cited: [10, 11],
          date_served: '01/01/2026', // UK format DD/MM/YYYY
          property_address: '123 Test Street, London, SW1A 1AA',
          rent_arrears_stated: 3000,
          // tenant_details: MISSING
        },
        answers: {
          rent_frequency: 'monthly',
          rent_amount: 1500,
          current_arrears: 3000,
        },
      });

      // Should NOT have wrong_doc_type blocker
      const wrongDocTypeBlocker = result.blockers.find((b) => b.code === 'S8-WRONG-DOC-TYPE');
      expect(wrongDocTypeBlocker).toBeUndefined();

      // Should have tenant details warning
      const tenantWarning = result.warnings.find((w) => w.code === 'S8-TENANT-DETAILS-MISSING');
      expect(tenantWarning).toBeDefined();
      expect(tenantWarning?.message).toContain('Tenant');

      console.log('S8-SI-3 (missing tenant details):', {
        status: result.status,
        blockers: result.blockers.map((b) => b.code),
        warnings: result.warnings.map((w) => w.code),
        tenantWarning: tenantWarning?.message,
      });
    });

    /**
     * Test S8-SI-4: Ground 8 cited but arrears below threshold
     * Document is Form 3 with Ground 8 but arrears don't meet 2-month threshold
     */
    it('S8-SI-4: Ground 8 with insufficient arrears should show high_risk status', () => {
      const result = validateSection8Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 8 Notice',
          form_3_detected: true,
          section_8_detected: true,
          grounds_cited: [8], // Ground 8 - mandatory ground requiring 2 months arrears
          date_served: '01/01/2026', // UK format DD/MM/YYYY
          property_address: '123 Test Street, London, SW1A 1AA',
          tenant_details: 'John Doe',
          rent_arrears_stated: 1000, // Only £1000 arrears
        },
        answers: {
          rent_frequency: 'monthly',
          rent_amount: 1500, // £1500/month = £3000 threshold for Ground 8
          current_arrears: 1000, // Below the 2-month threshold
        },
      });

      // Should NOT have wrong_doc_type blocker
      const wrongDocTypeBlocker = result.blockers.find((b) => b.code === 'S8-WRONG-DOC-TYPE');
      expect(wrongDocTypeBlocker).toBeUndefined();

      // Should NOT be ground_8_satisfied since arrears (£1000) < threshold (£3000)
      expect(result.status).not.toBe('ground_8_satisfied');

      // Status should be discretionary_only or high_risk (since Ground 8 threshold not met)
      expect(['discretionary_only', 'high_risk', 'warning']).toContain(result.status);

      console.log('S8-SI-4 (Ground 8 below threshold):', {
        status: result.status,
        blockers: result.blockers.map((b) => b.code),
        warnings: result.warnings.map((w) => w.code),
        note: 'Ground 8 requires £3000 (2x £1500), only £1000 arrears',
      });
    });

    /**
     * Test S8-SI-5: Missing rent arrears amount
     * Document is Form 3 with Ground 8 but no arrears stated
     */
    it('S8-SI-5: Missing arrears amount should fail with arrears-missing warning', () => {
      const result = validateSection8Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 8 Notice',
          form_3_detected: true,
          section_8_detected: true,
          grounds_cited: [8, 10],
          date_served: '01/01/2026', // UK format DD/MM/YYYY
          property_address: '123 Test Street, London, SW1A 1AA',
          tenant_details: 'John Doe',
          // rent_arrears_stated: MISSING
        },
        answers: {
          rent_frequency: 'monthly',
          rent_amount: 1500,
          // current_arrears: MISSING
        },
      });

      // Should NOT have wrong_doc_type blocker
      const wrongDocTypeBlocker = result.blockers.find((b) => b.code === 'S8-WRONG-DOC-TYPE');
      expect(wrongDocTypeBlocker).toBeUndefined();

      // Should have arrears warning
      const arrearsWarning = result.warnings.find((w) => w.code === 'S8-ARREARS-MISSING');
      expect(arrearsWarning).toBeDefined();
      expect(arrearsWarning?.message).toContain('arrears');

      // Should also have incomplete Ground 8 warning
      const ground8Warning = result.warnings.find((w) => w.code === 'S8-GROUND8-INCOMPLETE');
      expect(ground8Warning).toBeDefined();

      console.log('S8-SI-5 (missing arrears):', {
        status: result.status,
        blockers: result.blockers.map((b) => b.code),
        warnings: result.warnings.map((w) => w.code),
        arrearsWarning: arrearsWarning?.message,
        ground8Warning: ground8Warning?.message,
      });
    });

    /**
     * Test S8-SI-6: Multiple structural issues combined
     * Document is Form 3 but has multiple problems
     */
    it('S8-SI-6: Multiple structural issues should accumulate', () => {
      const result = validateSection8Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 8 Notice',
          form_3_detected: true,
          section_8_detected: true,
          grounds_cited: [], // Empty grounds array - BLOCKER
          // date_served: MISSING (warning)
          // tenant_details: MISSING (warning)
          // rent_arrears_stated: MISSING (warning)
        },
        answers: {},
      });

      // Should NOT have wrong_doc_type blocker
      const wrongDocTypeBlocker = result.blockers.find((b) => b.code === 'S8-WRONG-DOC-TYPE');
      expect(wrongDocTypeBlocker).toBeUndefined();

      // Should have grounds-missing blocker
      const groundsBlocker = result.blockers.find((b) => b.code === 'S8-GROUNDS-MISSING');
      expect(groundsBlocker).toBeDefined();

      // Should have multiple warnings
      expect(result.warnings.length).toBeGreaterThanOrEqual(2);

      // Status should be invalid
      expect(result.status).toBe('invalid');

      console.log('S8-SI-6 (multiple issues):', {
        status: result.status,
        blockers: result.blockers.map((b) => b.code),
        warnings: result.warnings.map((w) => w.code),
        blockerCount: result.blockers.length,
        warningCount: result.warnings.length,
      });
    });

    /**
     * Test S8-SI-7: Valid Form 3 with Ground 8 satisfied
     * Verify that a properly filled Form 3 passes when Ground 8 threshold IS met
     */
    it('S8-SI-7: Valid Form 3 with Ground 8 threshold met should pass', () => {
      const result = validateSection8Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 8 Notice',
          form_3_detected: true,
          section_8_detected: true,
          grounds_cited: [8],
          date_served: '01/01/2026', // UK format DD/MM/YYYY
          property_address: '123 Test Street, London, SW1A 1AA',
          tenant_details: 'John Doe',
          rent_arrears_stated: 5000,
        },
        answers: {
          rent_frequency: 'monthly',
          rent_amount: 1500, // £1500/month = £3000 threshold
          current_arrears: 5000, // £5000 > £3000 - threshold met!
        },
      });

      // Should NOT have wrong_doc_type blocker
      const wrongDocTypeBlocker = result.blockers.find((b) => b.code === 'S8-WRONG-DOC-TYPE');
      expect(wrongDocTypeBlocker).toBeUndefined();

      // Should NOT have grounds-missing blocker
      const groundsBlocker = result.blockers.find((b) => b.code === 'S8-GROUNDS-MISSING');
      expect(groundsBlocker).toBeUndefined();

      // Status should be ground_8_satisfied
      expect(result.status).toBe('ground_8_satisfied');

      console.log('S8-SI-7 (valid Form 3, Ground 8 met):', {
        status: result.status,
        blockers: result.blockers.map((b) => b.code),
        warnings: result.warnings.map((w) => w.code),
      });
    });
  });

  /**
   * Artifact PDF Integration Test
   *
   * Tests the specific artifact PDF: f9a34a18-6b94-46eb-a58d-1d90c0875829.pdf
   * This is a Section 21 Form 6A notice (preview version).
   *
   * Key structure elements to validate:
   * - Form 6A header
   * - Housing Act 1988, Section 21(1) and (4)
   * - Tenant name: sonia
   * - Property: 16 waterloo road, pudsey, ls28 7pw
   * - Landlord: Tariq
   * - Valid 2+ month notice period
   */
  describe('Artifact PDF Tests (f9a34a18-6b94-46eb-a58d-1d90c0875829.pdf)', () => {
    it('Case E: Artifact should be recognized as Section 21 Form 6A', async () => {
      if (!artifactBuffer) {
        console.warn('Artifact PDF not found at:', ARTIFACT_PDF);
        return;
      }

      const startTime = Date.now();

      const result = await analyzeEvidence({
        storageBucket: 'test',
        storagePath: 'test/artifact.pdf',
        mimeType: 'application/pdf',
        filename: 'f9a34a18-6b94-46eb-a58d-1d90c0875829.pdf',
        caseId: 'test-artifact',
        fileBuffer: artifactBuffer,
        validatorKey: 'section_21',
        debugId: 'test-artifact-s21',
      });

      const duration = Date.now() - startTime;

      // Should complete within time limit
      expect(duration).toBeLessThan(MAX_ANALYSIS_TIME_MS);

      // Check if extraction actually worked (depends on env having API key)
      const extractionWorked = result.extraction_quality?.text_extraction_method !== 'failed' &&
                               (result.extraction_quality?.text_length || 0) > 100;

      if (!extractionWorked) {
        console.warn('Skipping extraction assertions - OPENAI_API_KEY not available');
        // Still verify basic structure
        expect(result.debug_id).toBeDefined();
        expect(result.final_stage).toBeDefined();
        return;
      }

      // Should extract text (this is a text-based PDF)
      expect(result.extraction_quality?.text_extraction_method).toBeDefined();
      expect(result.extraction_quality?.text_length).toBeGreaterThan(100);

      console.log('Artifact PDF analysis:', {
        duration_ms: duration,
        detected_type: result.detected_type,
        confidence: result.confidence,
        text_length: result.extraction_quality?.text_length,
        extraction_method: result.extraction_quality?.text_extraction_method,
        extracted_fields: Object.keys(result.extracted_fields || {}),
      });
    }, TEST_TIMEOUT_MS);

    it('Case E: Artifact should pass Section 21 validator without wrong_doc_type blocker', async () => {
      if (!artifactBuffer) {
        console.warn('Artifact PDF not found, skipping validator test');
        return;
      }

      const analysis = await analyzeEvidence({
        storageBucket: 'test',
        storagePath: 'test/artifact.pdf',
        mimeType: 'application/pdf',
        filename: 'f9a34a18-6b94-46eb-a58d-1d90c0875829.pdf',
        caseId: 'test-artifact-validate',
        fileBuffer: artifactBuffer,
        validatorKey: 'section_21',
        debugId: 'test-artifact-validate',
      });

      // Check if extraction worked - if not, skip detailed assertions
      const extractionWorked = analysis.extraction_quality?.text_extraction_method !== 'failed' &&
                               Object.keys(analysis.extracted_fields || {}).length > 0;

      if (!extractionWorked) {
        console.warn('Skipping validator assertions - extraction failed (likely no OPENAI_API_KEY)');
        // Run a direct validator test with synthetic data matching the artifact PDF
        const directResult = validateSection21Notice({
          jurisdiction: 'england',
          extracted: {
            notice_type: 'Section 21 Notice',
            form_6a_detected: true,
            section_21_detected: true,
            date_served: '22/12/2025',
            expiry_date: '14/07/2026',
            property_address: '16 waterloo road, pudsey, ls28 7pw',
            tenant_names: 'sonia',
            landlord_name: 'Tariq',
          },
          answers: {},
        });
        // Verify no wrong_doc_type in direct test
        const wrongDocBlocker = directResult.blockers.find((b) => b.code === 'S21-WRONG-DOC-TYPE');
        expect(wrongDocBlocker).toBeUndefined();
        console.log('Used synthetic data matching artifact (extraction unavailable)');
        return;
      }

      // Run validator with Section 21 route
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

      // Should NOT have wrong_doc_type blocker - this IS a Section 21
      const wrongDocTypeBlocker = validatorResult.result?.blockers.find(
        (b) => b.code === 'S21-WRONG-DOC-TYPE'
      );
      expect(wrongDocTypeBlocker).toBeUndefined();

      // Should NOT have wrong_form blocker - this IS a Form 6A
      const wrongFormBlocker = validatorResult.result?.blockers.find(
        (b) => b.code === 'S21-WRONG-FORM'
      );
      expect(wrongFormBlocker).toBeUndefined();

      console.log('Artifact PDF validator result:', {
        validator_key: validatorResult.validator_key,
        status: validatorResult.result?.status,
        blockers: validatorResult.result?.blockers.map((b) => b.code),
        warnings_count: validatorResult.result?.warnings.length,
        extracted_notice_type: analysis.extracted_fields?.notice_type,
        form_6a_detected: analysis.extracted_fields?.form_6a_detected,
      });
    }, TEST_TIMEOUT_MS);

    it('Case E: Artifact should FAIL Section 8 validator with wrong_doc_type blocker', async () => {
      if (!artifactBuffer) {
        console.warn('Artifact PDF not found, skipping wrong-type test');
        return;
      }

      const analysis = await analyzeEvidence({
        storageBucket: 'test',
        storagePath: 'test/artifact.pdf',
        mimeType: 'application/pdf',
        filename: 'f9a34a18-6b94-46eb-a58d-1d90c0875829.pdf',
        caseId: 'test-artifact-wrong-type',
        fileBuffer: artifactBuffer,
        validatorKey: 'section_8', // Intentionally wrong validator!
        debugId: 'test-artifact-wrong-type',
      });

      // Check if extraction worked - if not, use synthetic data
      const extractionWorked = analysis.extraction_quality?.text_extraction_method !== 'failed' &&
                               Object.keys(analysis.extracted_fields || {}).length > 0;

      if (!extractionWorked) {
        console.warn('Skipping live analysis - extraction failed (likely no OPENAI_API_KEY)');
        // Run a direct validator test with synthetic data matching the artifact PDF
        const directResult = validateSection8Notice({
          jurisdiction: 'england',
          extracted: {
            // This is Section 21 data being validated as Section 8 - should fail!
            notice_type: 'Section 21 Notice',
            form_6a_detected: true,
            section_21_detected: true,
            date_served: '22/12/2025',
            expiry_date: '14/07/2026',
            property_address: '16 waterloo road, pudsey, ls28 7pw',
            tenant_names: 'sonia',
            landlord_name: 'Tariq',
          },
          answers: {},
        });
        // Verify wrong_doc_type blocker IS present
        const wrongDocBlocker = directResult.blockers.find((b) => b.code === 'S8-WRONG-DOC-TYPE');
        expect(wrongDocBlocker).toBeDefined();
        expect(wrongDocBlocker?.message).toContain('Section 21');
        expect(directResult.status).toBe('invalid');
        console.log('Used synthetic data matching artifact (extraction unavailable)', {
          status: directResult.status,
          blockers: directResult.blockers.map((b) => b.code),
        });
        return;
      }

      // Run validator with Section 8 route (WRONG for this document!)
      const validatorResult = runLegalValidator({
        product: 'notice_only',
        jurisdiction: 'england',
        facts: {
          selected_notice_route: 'section_8', // Wrong route for Form 6A
          ...analysis.extracted_fields,
        },
        analysis,
      });

      expect(validatorResult.validator_key).toBe('section_8');
      expect(validatorResult.result).toBeDefined();

      // SHOULD have wrong_doc_type blocker - this is NOT a Section 8!
      const wrongDocTypeBlocker = validatorResult.result?.blockers.find(
        (b) => b.code === 'S8-WRONG-DOC-TYPE'
      );
      expect(wrongDocTypeBlocker).toBeDefined();
      expect(wrongDocTypeBlocker?.message).toContain('Section 21');

      // Status should be invalid
      expect(validatorResult.result?.status).toBe('invalid');

      console.log('Artifact PDF wrong-type test:', {
        validator_key: validatorResult.validator_key,
        status: validatorResult.result?.status,
        blockers: validatorResult.result?.blockers.map((b) => b.code),
        wrongDocTypeMessage: wrongDocTypeBlocker?.message,
      });
    }, TEST_TIMEOUT_MS);
  });
});
