// src/app/api/wizard/upload-evidence/route.ts
// Evidence upload endpoint with robust error handling and correlation IDs.
// All errors return structured JSON responses with debug_id for tracing.

import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getServerUser } from '@/lib/supabase/server';
import { createSupabaseAdminClient, logSupabaseAdminDiagnostics } from '@/lib/supabase/admin';
import { updateWizardFacts, getOrCreateWizardFacts } from '@/lib/case-facts/store';
import { isEvidenceCategory, EvidenceCategory } from '@/lib/evidence/schema';
import { analyzeEvidence } from '@/lib/evidence/analyze-evidence';
import { applyDocumentIntelligence } from '@/lib/wizard/document-intel';
import { runLegalValidator } from '@/lib/validators/run-legal-validator';
import { mapEvidenceToFacts } from '@/lib/evidence/map-evidence-to-facts';
import { classifyDocument } from '@/lib/evidence/classify-document';
import {
  mergeExtractedFacts,
  applyMergedFacts,
  generateConfirmationQuestions,
} from '@/lib/evidence/merge-extracted-facts';

export const runtime = 'nodejs';

/**
 * Structured error response format for tracing
 */
interface ErrorResponse {
  ok: false;
  error: string;
  error_code: string;
  stage: string;
  debug_id: string;
  details?: Record<string, any>;
}

/**
 * Create a structured error response with correlation ID
 */
function createErrorResponse(
  error: string,
  errorCode: string,
  stage: string,
  debugId: string,
  status: number,
  details?: Record<string, any>
): NextResponse<ErrorResponse> {
  const body: ErrorResponse = {
    ok: false,
    error,
    error_code: errorCode,
    stage,
    debug_id: debugId,
    ...(details && { details }),
  };

  console.error('[upload-evidence][error]', JSON.stringify({
    ...body,
    status,
  }));

  return NextResponse.json(body, {
    status,
    headers: { 'x-debug-id': debugId },
  });
}

function sanitizeFilename(name: string) {
  const trimmed = name?.trim() || 'upload';
  return trimmed.replace(/[^a-zA-Z0-9_.-]+/g, '_');
}

const MAX_ANALYSIS_FACTS_KEYS = [
  'tenant_full_name',
  'landlord_full_name',
  'rent_amount',
  'rent_frequency',
  'tenancy_start_date',
  'deposit_amount',
  'deposit_scheme',
  'property_address_line1',
  'notice_date',
  'notice_expiry_date',
];

function pickFactsSnapshot(facts: Record<string, any>) {
  const snapshot: Record<string, any> = {};
  MAX_ANALYSIS_FACTS_KEYS.forEach((key) => {
    if (facts[key] !== undefined) snapshot[key] = facts[key];
  });
  return snapshot;
}

function mapQuestionToEvidenceFlags(questionId: string, explicitCategory?: string) {
  const normalized = questionId.toLowerCase();

  if (explicitCategory) {
    return [`${explicitCategory}_uploaded`];
  }

  switch (normalized) {
    case 'upload_tenancy_agreement':
    case 'tenancy_agreement_upload':
      return ['tenancy_agreement_uploaded'];
    case 'upload_rent_schedule':
    case 'arrears_schedule_upload':
    case 'rent_schedule_upload':
      return ['rent_schedule_uploaded'];
    case 'upload_correspondence':
    case 'correspondence_upload':
      return ['correspondence_uploaded'];
    case 'upload_damage_photos':
    case 'damage_photos_upload':
      return ['damage_photos_uploaded'];
    case 'upload_authority_letters':
    case 'authority_letters_upload':
      return ['authority_letters_uploaded'];
    case 'upload_bank_statements':
    case 'bank_statements_upload':
      return ['bank_statements_uploaded'];
    case 'upload_safety_certificates':
    case 'safety_certificates_upload':
      return ['safety_certificates_uploaded'];
    case 'upload_asb_evidence':
    case 'asb_evidence_upload':
      return ['asb_evidence_uploaded', 'authority_letters_uploaded'];
    case 'upload_damage_evidence':
    case 'upload_other_evidence':
      return ['other_evidence_uploaded'];
    default: {
      const inferred: string[] = [];
      if (normalized.includes('tenancy')) {
        inferred.push('tenancy_agreement_uploaded');
      }
      if (normalized.includes('rent') || normalized.includes('arrears')) {
        inferred.push('rent_schedule_uploaded');
      }
      if (normalized.includes('correspondence') || normalized.includes('message')) {
        inferred.push('correspondence_uploaded');
      }
      if (normalized.includes('photo') || normalized.includes('damage')) {
        inferred.push('damage_photos_uploaded');
      }
      if (normalized.includes('authority') || normalized.includes('council')) {
        inferred.push('authority_letters_uploaded');
      }
      if (normalized.includes('bank')) {
        inferred.push('bank_statements_uploaded');
      }
      if (normalized.includes('safety')) {
        inferred.push('safety_certificates_uploaded');
      }
      if (normalized.includes('asb')) {
        inferred.push('asb_evidence_uploaded', 'authority_letters_uploaded');
      }
      if (inferred.length === 0) {
        inferred.push('other_evidence_uploaded');
      }
      return inferred;
    }
  }
}

export async function POST(request: Request) {
  // Generate correlation ID for this request (use client-provided or generate new)
  const clientDebugId = request.headers.get('x-debug-id');
  const debugId = clientDebugId || randomUUID().slice(0, 8);
  const startTime = Date.now();

  console.log('[upload-evidence][start]', JSON.stringify({
    debug_id: debugId,
    timestamp: new Date().toISOString(),
  }));

  try {
    // Admin client bypasses Supabase RLS for this route
    logSupabaseAdminDiagnostics({ route: '/api/wizard/upload-evidence', writesUsingAdmin: true });
    const supabase = createSupabaseAdminClient();

    // Cookie-based server user (may be null if anonymous)
    const user = await getServerUser();

    const formData = await request.formData();
    const caseId = formData.get('caseId');
    const questionId = formData.get('questionId');
    const category = formData.get('category');
    const file = formData.get('file');

    if (typeof caseId !== 'string' || !caseId) {
      return createErrorResponse(
        'caseId is required',
        'MISSING_CASE_ID',
        'validation',
        debugId,
        400
      );
    }

    if (typeof questionId !== 'string' || !questionId) {
      return createErrorResponse(
        'questionId is required',
        'MISSING_QUESTION_ID',
        'validation',
        debugId,
        400
      );
    }

    if (!(file instanceof File)) {
      return createErrorResponse(
        'file is required',
        'MISSING_FILE',
        'validation',
        debugId,
        400
      );
    }

    // =========================================================================
    // P0-C: CATEGORY VALIDATION (prevent schema pollution)
    // =========================================================================
    // If a category is provided, it MUST be a canonical EvidenceCategory.
    // This prevents arbitrary categories from creating dynamic flags.
    const categoryString = typeof category === 'string' && category.length > 0 ? category : undefined;

    if (categoryString && !isEvidenceCategory(categoryString)) {
      return createErrorResponse(
        `Invalid evidence category: "${categoryString}"`,
        'INVALID_CATEGORY',
        'validation',
        debugId,
        400,
        { valid_categories: Object.values(EvidenceCategory) }
      );
    }

    // Use the validated canonical category (undefined if not provided)
    const validatedCategory = categoryString as EvidenceCategory | undefined;

    // =========================================================================
    // FILE VALIDATION (P1 hardening - included in P0 rollout)
    // =========================================================================
    const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    const ALLOWED_MIME_TYPES = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    const fileSize = (file as any).size;
    if (typeof fileSize === 'number' && fileSize > MAX_FILE_SIZE_BYTES) {
      return createErrorResponse(
        `File too large. Maximum size is 10MB, received ${(fileSize / 1024 / 1024).toFixed(2)}MB`,
        'FILE_TOO_LARGE',
        'validation',
        debugId,
        400,
        { max_size_mb: 10, received_size_mb: fileSize / 1024 / 1024 }
      );
    }

    const mimeType = ((file as any).type || '').toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return createErrorResponse(
        `File type not allowed. Accepted types: PDF, JPEG, PNG, WebP, GIF. Received: ${mimeType || 'unknown'}`,
        'INVALID_FILE_TYPE',
        'validation',
        debugId,
        400,
        { allowed_types: ALLOWED_MIME_TYPES, received_type: mimeType }
      );
    }

    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select('id, user_id, jurisdiction')
      .eq('id', caseId)
      .maybeSingle();

    if (caseError) {
      console.error('Failed to load case', caseError);
      return createErrorResponse(
        'Could not load case',
        'CASE_LOAD_ERROR',
        'case_lookup',
        debugId,
        500,
        { supabase_error: caseError.message }
      );
    }

    if (!caseRow) {
      return createErrorResponse(
        'Case not found',
        'CASE_NOT_FOUND',
        'case_lookup',
        debugId,
        404
      );
    }

    // If the case is owned, enforce that only the owning user can upload to it
    if (caseRow.user_id) {
      if (!user) {
        return createErrorResponse(
          'Please sign in to upload evidence for this case',
          'UNAUTHORIZED',
          'auth',
          debugId,
          401
        );
      }
      if (caseRow.user_id !== user.id) {
        return createErrorResponse(
          'You do not have permission to upload evidence to this case',
          'FORBIDDEN',
          'auth',
          debugId,
          403
        );
      }
    }

    // Namespace uploads by "owner" – owned cases use the case owner, otherwise fall back
    const ownerId = caseRow.user_id || user?.id || 'anonymous';

    const safeFilename = sanitizeFilename(file.name || 'upload');
    const objectKey = `${ownerId}/${caseId}/evidence/${randomUUID()}-${safeFilename}`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(objectKey, fileBuffer, {
        contentType: (file as any).type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      console.error('Failed to upload file to storage', uploadError);
      return createErrorResponse(
        'Could not upload file to storage',
        'STORAGE_UPLOAD_ERROR',
        'storage_upload',
        debugId,
        500,
        { storage_error: uploadError.message }
      );
    }

    // SECURITY: Do NOT use getPublicUrl() for evidence files.
    // Store only the storage path (objectKey) - never expose public URLs.
    // Downloads will be served via signed URLs through /api/evidence/download endpoint.

    // Generate unique document type with UUID to avoid constraint violations
    // Format: evidence_{category}_{uuid}
    let evidenceDocumentType = `evidence_${validatedCategory ?? 'upload'}_${randomUUID()}`;

    // Insert document record with retry on collision (belt + braces for edge cases)
    let documentRow: { id: string; document_title: string; document_type: string; pdf_url: string; created_at: string } | null = null;
    let documentError: any = null;
    const MAX_INSERT_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_INSERT_RETRIES; attempt++) {
      const { data: insertedDoc, error: insertError } = await supabase
        .from('documents')
        .insert({
          user_id: caseRow.user_id || user?.id || null,
          case_id: caseId,
          document_type: evidenceDocumentType,
          document_title: file.name || safeFilename,
          jurisdiction: caseRow.jurisdiction,
          pdf_url: objectKey, // Store storage path only, NOT public URL
          is_preview: false,
        })
        .select('id, document_title, document_type, pdf_url, created_at')
        .single();

      if (insertError) {
        // Handle 23505 duplicate key error by generating new unique type and retrying
        if (insertError.code === '23505' && attempt < MAX_INSERT_RETRIES) {
          console.warn(`[upload-evidence] Duplicate document type collision on attempt ${attempt}, retrying with new UUID`, {
            debug_id: debugId,
            document_type: evidenceDocumentType,
            attempt,
          });
          // Generate new unique type and retry
          evidenceDocumentType = `evidence_${validatedCategory ?? 'upload'}_${randomUUID()}`;
          continue;
        }
        documentError = insertError;
        break;
      }

      documentRow = insertedDoc;
      break;
    }

    if (documentError || !documentRow) {
      console.error('Failed to insert document record', documentError);
      return createErrorResponse(
        'Could not save document record',
        'DOCUMENT_INSERT_ERROR',
        'document_insert',
        debugId,
        500,
        { db_error: documentError?.message }
      );
    }

    const evidenceEntry = {
      id: randomUUID(),
      document_id: documentRow.id,
      question_id: questionId,
      category: validatedCategory, // P0-C: Use validated canonical category
      file_name: file.name || safeFilename,
      storage_bucket: 'documents',
      storage_path: objectKey,
      mime_type: (file as any).type || null,
      size_bytes: typeof (file as any).size === 'number' ? (file as any).size : null,
      doc_type: null,
      doc_type_confidence: null,
      doc_type_reasons: null,
      uploaded_at: new Date().toISOString(),
    };

    const updatedFacts = await updateWizardFacts(supabase as any, caseId, (currentRaw) => {
      const current = (currentRaw as any) || {};
      const existingEvidence = (current as any).evidence || {};

      const evidenceFlags = {
        tenancy_agreement_uploaded: !!existingEvidence.tenancy_agreement_uploaded,
        rent_schedule_uploaded: !!existingEvidence.rent_schedule_uploaded,
        correspondence_uploaded: !!existingEvidence.correspondence_uploaded,
        damage_photos_uploaded: !!existingEvidence.damage_photos_uploaded,
        authority_letters_uploaded: !!existingEvidence.authority_letters_uploaded,
        bank_statements_uploaded: !!existingEvidence.bank_statements_uploaded,
        safety_certificates_uploaded: !!existingEvidence.safety_certificates_uploaded,
        asb_evidence_uploaded: !!existingEvidence.asb_evidence_uploaded,
        other_evidence_uploaded: !!existingEvidence.other_evidence_uploaded,
      };

      const files = Array.isArray(existingEvidence.files) ? [...existingEvidence.files] : [];
      files.push(evidenceEntry);

      const flagsToSet = mapQuestionToEvidenceFlags(
        questionId,
        validatedCategory, // P0-C: Use validated canonical category
      );
      for (const flag of flagsToSet) {
        (evidenceFlags as any)[flag] = true;
      }

      return {
        ...current,
        evidence: {
          ...existingEvidence,
          ...evidenceFlags,
          files,
        },
      } as typeof current;
    });

    // ------------------------------------------------------------------
    // AI analysis + document intelligence + legal validation (non-blocking)
    // ------------------------------------------------------------------
    let analysisResult: any = null;
    let validationResult: any = null;
    let validationKey: any = null;
    let validationRecommendations: Array<{ code: string; message: string }> = [];
    let validationNextQuestions: Array<{ id: string; question: string }> = [];
    let validationSummary: any = null;
    let intelligenceSnapshot: any = null;
    let documentIntel: any = null;
    let docClassification: { docType: string; confidence: number; reasons: string[] } | null =
      classifyDocument({
        fileName: file.name || safeFilename,
        mimeType: (file as any).type || null,
        extractedText: null,
        categoryHint: validatedCategory || null, // Use evidence category as hint for classification
      });
    let extractionMeta: {
      merged_facts_count: number;
      low_confidence_keys: string[];
      provenance_count: number;
    } | null = null;
    let confirmationQuestions: Array<{ factKey: string; question: string; type: string; helpText?: string }> = [];

    try {
      const signed = await supabase.storage
        .from('documents')
        .createSignedUrl(objectKey, 60);

      // Extract validatorKey from questionId (e.g., "validator_tenancy_agreement" -> "tenancy_agreement")
      const validatorKey = questionId.startsWith('validator_')
        ? questionId.replace('validator_', '')
        : validatedCategory ?? null;

      console.log('[upload-evidence][analysis_start]', JSON.stringify({
        debug_id: debugId,
        filename: file.name,
        mimeType: (file as any).type,
        validatorKey,
      }));

      const analysis = await analyzeEvidence({
        storageBucket: 'documents',
        storagePath: objectKey,
        mimeType: (file as any).type || 'application/octet-stream',
        filename: file.name || safeFilename,
        caseId,
        questionId,
        category: validatedCategory,
        signedUrl: signed.data?.signedUrl ?? null,
        fileBuffer,
        validatorKey,
        jurisdiction: caseRow.jurisdiction,
        debugId, // Pass correlation ID for tracing
      });

      console.log('[upload-evidence][analysis_complete]', JSON.stringify({
        debug_id: debugId,
        analysis_debug_id: analysis.debug_id,
        detected_type: analysis.detected_type,
        confidence: analysis.confidence,
        duration_ms: analysis.duration_ms,
        final_stage: analysis.final_stage,
      }));

      analysisResult = analysis;

      // Debug logging for extracted fields - helps diagnose validator field matching issues
      console.log('[upload-evidence] Extracted fields:', JSON.stringify(analysis.extracted_fields, null, 2));
      console.log('[upload-evidence] Extraction quality:', JSON.stringify(analysis.extraction_quality, null, 2));

      docClassification = classifyDocument({
        fileName: file.name || safeFilename,
        mimeType: (file as any).type || null,
        extractedText: analysis.raw_text || null,
        categoryHint: validatedCategory || null, // Use evidence category as hint for classification
        extractionQuality: analysis.extraction_quality || undefined, // Pass extraction quality for better classification
      });

      console.log('[upload-evidence] Classification result:', {
        docType: docClassification.docType,
        confidence: docClassification.confidence,
        reasons: docClassification.reasons,
        rawTextLength: analysis.raw_text?.length ?? 0,
        categoryHint: validatedCategory,
      });

      // =========================================================================
      // EARLY TERMINAL BLOCKER: Wrong document type detection
      // Short-circuit immediately if classification detects wrong doc type
      // with high confidence (>= 0.70). This prevents Q&A block from rendering.
      // =========================================================================
      const WRONG_DOC_CONFIDENCE_THRESHOLD = 0.70;
      const classifiedDocType = docClassification.docType?.toLowerCase() ?? '';
      const normalizedValidatorKey = validatorKey?.toLowerCase() ?? '';

      // Check for S21 validator receiving S8 notice
      const isS21ValidatorWithS8Doc =
        (normalizedValidatorKey === 'notice_s21' || normalizedValidatorKey.includes('section_21')) &&
        (classifiedDocType === 'notice_s8' || classifiedDocType.includes('section_8') || classifiedDocType.includes('section 8'));

      // Check for S8 validator receiving S21 notice
      const isS8ValidatorWithS21Doc =
        (normalizedValidatorKey === 'notice_s8' || normalizedValidatorKey.includes('section_8')) &&
        (classifiedDocType === 'notice_s21' || classifiedDocType.includes('section_21') || classifiedDocType.includes('section 21'));

      if ((isS21ValidatorWithS8Doc || isS8ValidatorWithS21Doc) && docClassification.confidence >= WRONG_DOC_CONFIDENCE_THRESHOLD) {
        const blockerCode = isS21ValidatorWithS8Doc ? 'S21-WRONG-DOC-TYPE' : 'S8-WRONG-DOC-TYPE';
        const blockerMessage = isS21ValidatorWithS8Doc
          ? 'This appears to be a Section 8 notice (Form 3), but you are using the Section 21 validator. Please use the Section 8 validator instead.'
          : 'This appears to be a Section 21 notice (Form 6A), but you are using the Section 8 validator. Please use the Section 21 validator instead.';

        console.log('[upload-evidence][terminal_blocker] Wrong document type detected early:', {
          debug_id: debugId,
          validatorKey,
          classifiedDocType: docClassification.docType,
          confidence: docClassification.confidence,
          blockerCode,
        });

        const totalDuration = Date.now() - startTime;

        // Return terminal_blocker response immediately - no questions, no evidence list, no upsell
        return NextResponse.json({
          success: true,
          debug_id: debugId,
          document: documentRow,
          evidence: {
            files: [evidenceEntry],
            flags: {},
            analysis: analysisResult,
            classification: docClassification,
          },
          validation: {
            validator_key: validatorKey,
            status: 'invalid',
            blockers: [{ code: blockerCode, message: blockerMessage }],
            warnings: [],
            upsell: null,
            recommendations: [],
            next_questions: [], // CRITICAL: Empty - no Q&A block
            terminal_blocker: true,
          },
          validation_summary: {
            validator_key: validatorKey,
            status: 'invalid',
            blockers: [{ code: blockerCode, message: blockerMessage }],
            warnings: [],
            upsell: null,
            terminal_blocker: true,
          },
          recommendations: [],
          next_questions: [], // CRITICAL: Empty - no Q&A block
          document_intel: null,
          fact_snapshot: null,
          extraction: null,
          duration_ms: totalDuration,
        }, {
          headers: { 'x-debug-id': debugId },
        });
      }

      await updateWizardFacts(supabase as any, caseId, (currentRaw) => {
        const current = (currentRaw as any) || {};
        const existingEvidence = (current as any).evidence || {};
        const files = Array.isArray(existingEvidence.files) ? [...existingEvidence.files] : [];
        const updatedFiles = files.map((entry: any) =>
          entry.id === evidenceEntry.id
            ? {
                ...entry,
                doc_type: docClassification?.docType ?? entry.doc_type,
                doc_type_confidence: docClassification?.confidence ?? entry.doc_type_confidence,
                doc_type_reasons: docClassification?.reasons ?? entry.doc_type_reasons,
              }
            : entry
        );
        return {
          ...current,
          evidence: {
            ...existingEvidence,
            files: updatedFiles,
          },
        } as typeof current;
      });

      await updateWizardFacts(supabase as any, caseId, (currentRaw) => {
        const current = (currentRaw as any) || {};
        const existingEvidence = (current as any).evidence || {};
        const analysisMap = { ...(existingEvidence.analysis || {}) };
        analysisMap[evidenceEntry.id] = analysis;
        return {
          ...current,
          evidence: {
            ...existingEvidence,
            analysis: analysisMap,
          },
        } as typeof current;
      });

      // =========================================================================
      // NEW: SMART EXTRACTION MERGE
      // Merge AI-extracted fields into canonical facts BEFORE document intel
      // =========================================================================
      const mergeOutput = mergeExtractedFacts({
        caseId,
        evidenceId: evidenceEntry.id,
        jurisdiction: caseRow.jurisdiction,
        docType: docClassification?.docType ?? analysis.detected_type,
        validatorKey,
        analysisResult: analysis,
      });

      // Apply merged facts to case
      await updateWizardFacts(supabase as any, caseId, (currentRaw) => {
        const current = (currentRaw as any) || {};
        return applyMergedFacts(current, mergeOutput) as typeof current;
      });

      // Generate confirmation questions for low-confidence extractions
      confirmationQuestions = generateConfirmationQuestions(
        mergeOutput.lowConfidenceKeys,
        validatorKey
      );

      // Track extraction metadata for response
      extractionMeta = {
        merged_facts_count: Object.keys(mergeOutput.mergedFactsPatch).length,
        low_confidence_keys: mergeOutput.lowConfidenceKeys,
        provenance_count: Object.keys(mergeOutput.provenance).length,
      };

      const factsSnapshot = await getOrCreateWizardFacts(supabase as any, caseId);
      const evidenceFiles = ((factsSnapshot as any)?.evidence?.files || []) as any[];
      const analysisMapForFlags = ((factsSnapshot as any)?.evidence?.analysis || {}) as Record<string, any>;
      const mappedFacts = mapEvidenceToFacts({
        facts: (factsSnapshot as any) || {},
        evidenceFiles,
        analysisMap: analysisMapForFlags,
      });

      // Apply document intelligence on top of merged facts
      const intelligence = applyDocumentIntelligence(mappedFacts as any);
      intelligenceSnapshot = pickFactsSnapshot(intelligence.facts as any);
      documentIntel = {
        derived_routes: intelligence.derivedRoutes,
        inconsistencies: intelligence.inconsistencies,
        compliance_hints: intelligence.complianceHints,
        recommended_uploads: intelligence.recommendedUploads,
      };

      await updateWizardFacts(supabase as any, caseId, (currentRaw) => {
        const current = (currentRaw as any) || {};
        return {
          ...current,
          ...(intelligence.facts as any),
        } as typeof current;
      });

      // Only run notice validator (S8/S21) when the uploaded document is actually a notice
      // Supporting documents (bank statements, rent schedules, correspondence, etc.) should NOT
      // be validated as notices - they're evidence for the case, not the notice itself
      const noticeCategories = ['notice_s8', 'notice_s21'];
      const noticeDocTypes = ['notice_s8', 'notice_s21', 's8_notice', 's21_notice'];
      const classifiedType = docClassification?.docType?.toLowerCase() ?? '';
      const categoryLower = validatedCategory?.toLowerCase() ?? '';

      const isNoticeDocument =
        noticeCategories.includes(categoryLower) ||
        noticeDocTypes.includes(classifiedType) ||
        classifiedType.includes('section_8') ||
        classifiedType.includes('section_21') ||
        classifiedType.includes('form_6a') ||
        classifiedType.includes('form_3');

      // Skip validator for non-notice supporting documents
      if (!isNoticeDocument) {
        console.log('[upload-evidence] Skipping notice validator for supporting document', {
          debug_id: debugId,
          category: validatedCategory,
          classifiedType: docClassification?.docType,
          reason: 'Not a notice document',
        });
      }

      const validatorOutcome = isNoticeDocument
        ? runLegalValidator({
            product: (factsSnapshot as any)?.__meta?.product || (factsSnapshot as any)?.product,
            jurisdiction: caseRow.jurisdiction,
            facts: intelligence.facts as any,
            analysis,
          })
        : { result: null, validator_key: null, recommendations: [], level_a_questions: [], level_a_mode: false };

      validationResult = validatorOutcome.result;
      validationKey = validatorOutcome.validator_key;
      validationRecommendations = validatorOutcome.recommendations ?? [];

      // Level A mode: Use follow-up questions instead of evidence upload requirements
      const isLevelAMode = validatorOutcome.level_a_mode === true;
      const levelAQuestions = validatorOutcome.level_a_questions ?? [];

      if (isLevelAMode && levelAQuestions.length > 0) {
        // In Level A mode, use the Level A questions as next questions
        // Map them to have id property for compatibility
        validationNextQuestions = levelAQuestions.map((q: any) => ({
          id: q.factKey,
          factKey: q.factKey,
          question: q.question,
          type: q.type || 'yes_no_unsure',
          helpText: q.helpText,
          options: q.options, // Include options for select/multi_select types
          isLevelA: true,
        }));
      } else {
        // Legacy mode: Merge validator questions with low-confidence confirmation questions
        const validatorQuestions = validatorOutcome.missing_questions ?? [];
        // Filter out confirmation questions for facts that validator already has questions for
        const validatorFactKeys = new Set(validatorQuestions.map((q: any) => q.factKey || q.id));
        const filteredConfirmationQuestions = confirmationQuestions.filter(
          q => !validatorFactKeys.has(q.factKey)
        );
        // Map confirmation questions to have id property for compatibility
        const mappedConfirmationQuestions = filteredConfirmationQuestions.map(q => ({
          id: q.factKey,
          question: q.question,
        }));
        validationNextQuestions = [...validatorQuestions, ...mappedConfirmationQuestions];
      }

      if (validationResult) {
        validationSummary = {
          validator_key: validationKey,
          status: validationResult.status,
          blockers: validationResult.blockers,
          warnings: validationResult.warnings,
          upsell: validationResult.upsell ?? null,
          terminal_blocker: validationResult.terminal_blocker ?? false,
          level_a_mode: isLevelAMode,
        };

        await updateWizardFacts(supabase as any, caseId, (currentRaw) => {
          const current = (currentRaw as any) || {};
          return {
            ...current,
            validation_summary: validationSummary,
            recommendations: validationRecommendations,
            next_questions: validationNextQuestions,
            validation_version: 'upload_v1',
            level_a_mode: isLevelAMode,
          } as typeof current;
        });
      }
    } catch (analysisErr) {
      console.warn('Evidence analysis skipped due to error', analysisErr);
      analysisResult = analysisResult || {
        detected_type: validatedCategory || 'unknown',
        extracted_fields: {},
        confidence: 0,
        warnings: ['Analysis failed; upload saved without extraction.'],
      };
    }

    if (docClassification) {
      await updateWizardFacts(supabase as any, caseId, (currentRaw) => {
        const current = (currentRaw as any) || {};
        const existingEvidence = (current as any).evidence || {};
        const files = Array.isArray(existingEvidence.files) ? [...existingEvidence.files] : [];
        const updatedFiles = files.map((entry: any) =>
          entry.id === evidenceEntry.id
            ? {
                ...entry,
                doc_type: entry.doc_type ?? docClassification.docType,
                doc_type_confidence: entry.doc_type_confidence ?? docClassification.confidence,
                doc_type_reasons: entry.doc_type_reasons ?? docClassification.reasons,
              }
            : entry
        );
        return {
          ...current,
          evidence: {
            ...existingEvidence,
            files: updatedFiles,
          },
        } as typeof current;
      });
    }

    const evidenceFacts: any = (updatedFacts as any).evidence || {};

    const latestFacts = await getOrCreateWizardFacts(supabase as any, caseId);
    const latestEvidenceFacts: any = (latestFacts as any).evidence || evidenceFacts;

    const totalDuration = Date.now() - startTime;
    console.log('[upload-evidence][success]', JSON.stringify({
      debug_id: debugId,
      duration_ms: totalDuration,
      validator_key: validationKey,
      validation_status: validationResult?.status,
    }));

    return NextResponse.json({
      success: true,
      debug_id: debugId,
      document: documentRow,
      evidence: {
        files: latestEvidenceFacts.files || evidenceFacts.files || [],
        flags: {
          tenancy_agreement_uploaded: !!latestEvidenceFacts.tenancy_agreement_uploaded,
          rent_schedule_uploaded: !!latestEvidenceFacts.rent_schedule_uploaded,
          correspondence_uploaded: !!latestEvidenceFacts.correspondence_uploaded,
          damage_photos_uploaded: !!latestEvidenceFacts.damage_photos_uploaded,
          authority_letters_uploaded: !!latestEvidenceFacts.authority_letters_uploaded,
          bank_statements_uploaded: !!latestEvidenceFacts.bank_statements_uploaded,
          safety_certificates_uploaded: !!latestEvidenceFacts.safety_certificates_uploaded,
          asb_evidence_uploaded: !!latestEvidenceFacts.asb_evidence_uploaded,
          other_evidence_uploaded: !!latestEvidenceFacts.other_evidence_uploaded,
        },
        analysis: analysisResult,
        classification: docClassification,
      },
      validation: validationResult
        ? {
            validator_key: validationKey,
            status: validationResult.status,
            blockers: validationResult.blockers,
            warnings: validationResult.warnings,
            upsell: validationResult.upsell ?? null,
            recommendations: validationRecommendations,
            next_questions: validationNextQuestions,
            terminal_blocker: validationResult.terminal_blocker ?? false,
            level_a_mode: validationSummary?.level_a_mode ?? false,
          }
        : null,
      validation_summary: validationSummary,
      recommendations: validationRecommendations,
      next_questions: validationNextQuestions,
      document_intel: documentIntel,
      fact_snapshot: intelligenceSnapshot,
      extraction: extractionMeta,
      duration_ms: totalDuration,
    }, {
      headers: { 'x-debug-id': debugId },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[upload-evidence][unexpected_error]', JSON.stringify({
      debug_id: debugId,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: duration,
    }));

    return createErrorResponse(
      'Internal server error',
      'INTERNAL_ERROR',
      'unknown',
      debugId,
      500,
      { error_message: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}
