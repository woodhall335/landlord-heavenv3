// src/app/api/wizard/upload-evidence/route.ts
// Thin wrapper that re-uses the canonical API implementation.
// This keeps any legacy /wizard/upload-evidence calls working,
// but ensures all logic lives in one place.      

import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createAdminClient, getServerUser } from '@/lib/supabase/server';
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
  try {
    // Admin client bypasses Supabase RLS for this route
    const supabase = createAdminClient();

    // Cookie-based server user (may be null if anonymous)
    const user = await getServerUser();

    const formData = await request.formData();
    const caseId = formData.get('caseId');
    const questionId = formData.get('questionId');
    const category = formData.get('category');
    const file = formData.get('file');

    if (typeof caseId !== 'string' || !caseId) {
      return NextResponse.json({ error: 'caseId is required' }, { status: 400 });
    }

    if (typeof questionId !== 'string' || !questionId) {
      return NextResponse.json({ error: 'questionId is required' }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    // =========================================================================
    // P0-C: CATEGORY VALIDATION (prevent schema pollution)
    // =========================================================================
    // If a category is provided, it MUST be a canonical EvidenceCategory.
    // This prevents arbitrary categories from creating dynamic flags.
    const categoryString = typeof category === 'string' && category.length > 0 ? category : undefined;

    if (categoryString && !isEvidenceCategory(categoryString)) {
      const validCategories = Object.values(EvidenceCategory).join(', ');
      return NextResponse.json(
        {
          error: `Invalid evidence category: "${categoryString}". ` +
                 `Must be one of: ${validCategories}`,
          valid_categories: Object.values(EvidenceCategory),
        },
        { status: 400 }
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
      return NextResponse.json(
        { error: `File too large. Maximum size is 10MB, received ${(fileSize / 1024 / 1024).toFixed(2)}MB` },
        { status: 400 }
      );
    }

    const mimeType = ((file as any).type || '').toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        {
          error: `File type not allowed. Accepted types: PDF, JPEG, PNG, WebP, GIF. Received: ${mimeType || 'unknown'}`,
        },
        { status: 400 }
      );
    }

    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select('id, user_id, jurisdiction')
      .eq('id', caseId)
      .maybeSingle();

    if (caseError) {
      console.error('Failed to load case', caseError);
      return NextResponse.json({ error: 'Could not load case' }, { status: 500 });
    }

    if (!caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // If the case is owned, enforce that only the owning user can upload to it
    if (caseRow.user_id) {
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (caseRow.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
      return NextResponse.json({ error: 'Could not upload file' }, { status: 500 });
    }

    // SECURITY: Do NOT use getPublicUrl() for evidence files.
    // Store only the storage path (objectKey) - never expose public URLs.
    // Downloads will be served via signed URLs through /api/evidence/download endpoint.

    const { data: documentRow, error: documentError } = await supabase
      .from('documents')
      .insert({
        user_id: caseRow.user_id || user?.id || null,
        case_id: caseId,
        document_type: 'evidence',
        document_title: file.name || safeFilename,
        jurisdiction: caseRow.jurisdiction,
        pdf_url: objectKey, // Store storage path only, NOT public URL
        is_preview: false,
      })
      .select('id, document_title, document_type, pdf_url, created_at')
      .single();

    if (documentError || !documentRow) {
      console.error('Failed to insert document record', documentError);
      return NextResponse.json({ error: 'Could not save document' }, { status: 500 });
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
      });

      analysisResult = analysis;

      docClassification = classifyDocument({
        fileName: file.name || safeFilename,
        mimeType: (file as any).type || null,
        extractedText: analysis.raw_text || null,
        categoryHint: validatedCategory || null, // Use evidence category as hint for classification
      });

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

      const validatorOutcome = runLegalValidator({
        product: (factsSnapshot as any)?.__meta?.product || (factsSnapshot as any)?.product,
        jurisdiction: caseRow.jurisdiction,
        facts: intelligence.facts as any,
        analysis,
      });

      validationResult = validatorOutcome.result;
      validationKey = validatorOutcome.validator_key;
      validationRecommendations = validatorOutcome.recommendations ?? [];
      // Merge validator questions with low-confidence confirmation questions
      const validatorQuestions = validatorOutcome.missing_questions ?? [];
      // Filter out confirmation questions for facts that validator already has questions for
      const validatorFactKeys = new Set(validatorQuestions.map((q: any) => q.factKey || q.id));
      const filteredConfirmationQuestions = confirmationQuestions.filter(
        q => !validatorFactKeys.has(q.factKey)
      );
      validationNextQuestions = [...validatorQuestions, ...filteredConfirmationQuestions];

      if (validationResult) {
        validationSummary = {
          validator_key: validationKey,
          status: validationResult.status,
          blockers: validationResult.blockers,
          warnings: validationResult.warnings,
          upsell: validationResult.upsell ?? null,
        };

        await updateWizardFacts(supabase as any, caseId, (currentRaw) => {
          const current = (currentRaw as any) || {};
          return {
            ...current,
            validation_summary: validationSummary,
            recommendations: validationRecommendations,
            next_questions: validationNextQuestions,
            validation_version: 'upload_v1',
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

    return NextResponse.json({
      success: true,
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
          }
        : null,
      validation_summary: validationSummary,
      recommendations: validationRecommendations,
      next_questions: validationNextQuestions,
      document_intel: documentIntel,
      fact_snapshot: intelligenceSnapshot,
      // New: extraction metadata for transparency
      extraction: extractionMeta,
    });
  } catch (error) {
    console.error('Unexpected error in upload-evidence route', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
