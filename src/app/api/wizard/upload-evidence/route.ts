// src/app/api/wizard/upload-evidence/route.ts
// Thin wrapper that re-uses the canonical API implementation.
// This keeps any legacy /wizard/upload-evidence calls working,
// but ensures all logic lives in one place.      

import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createAdminClient, getServerUser } from '@/lib/supabase/server';
import { updateWizardFacts, getOrCreateWizardFacts } from '@/lib/case-facts/store';
import { chatCompletion } from '@/lib/ai/openai-client';
import { isEvidenceCategory, EvidenceCategory } from '@/lib/evidence/schema';

export const runtime = 'nodejs';

function sanitizeFilename(name: string) {
  const trimmed = name?.trim() || 'upload';
  return trimmed.replace(/[^a-zA-Z0-9_.-]+/g, '_');
}

async function analyseDocument(
  fileBuffer: Buffer,
  metadata: { fileName: string; mimeType: string; category?: string },
  facts: Record<string, any>,
): Promise<Record<string, any> | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  const snippet = (() => {
    if (metadata.mimeType?.startsWith('text/')) {
      const text = fileBuffer.toString('utf8');
      return text.slice(0, 2000);
    }
    return `Binary file preview unavailable. Name: ${metadata.fileName}.`;
  })();

  try {
    const aiResponse = await chatCompletion(
      [
        {
          role: 'system',
          content:
            'You are a legal evidence triage assistant. Return JSON only with keys detected_type, extracted_fields, confidence (0-1) and warnings (array). Do not invent facts; if unsure, keep fields empty.',
        },
        {
          role: 'user',
          content: `Jurisdiction: ${facts?.property?.country || 'unknown'}. Category: ${
            metadata.category || 'unspecified'
          }. File name: ${metadata.fileName}. Mime: ${metadata.mimeType}. Known parties: landlord ${
            facts?.landlord?.name || ''
          }, tenant ${facts?.tenant?.name || ''}. Property: ${
            facts?.property?.address_line1 || facts?.property?.property_address_line1 || ''
          }. Known arrears: ${facts?.issues?.rent_arrears?.total_arrears ?? 'unknown'}. Snippet: ${snippet}`,
        },
      ],
      { model: 'gpt-4o-mini', max_tokens: 300, temperature: 0 },
    );

    const parsed = JSON.parse(aiResponse.content || '{}');
    if (!parsed.detected_type) {
      parsed.detected_type = metadata.category || metadata.mimeType || 'unknown';
    }
    parsed.confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.35;
    return parsed;
  } catch (err) {
    console.warn('Evidence analysis failed, continuing without AI flags', err);
    return null;
  }
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
    // Optional AI analysis (non-blocking)
    // ------------------------------------------------------------------
    try {
      const factsSnapshot = await getOrCreateWizardFacts(supabase as any, caseId);
      const analysis = await analyseDocument(
        fileBuffer,
        {
          fileName: file.name || safeFilename,
          mimeType: (file as any).type || 'application/octet-stream',
          category: validatedCategory, // P0-C: Use validated canonical category
        },
        (factsSnapshot as any) || {},
      );

      if (analysis) {
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
      }
    } catch (analysisErr) {
      console.warn('Evidence analysis skipped due to error', analysisErr);
    }

    const evidenceFacts: any = (updatedFacts as any).evidence || {};

    return NextResponse.json({
      success: true,
      document: documentRow,
      evidence: {
        files: evidenceFacts.files || [],
        flags: {
          tenancy_agreement_uploaded: !!evidenceFacts.tenancy_agreement_uploaded,
          rent_schedule_uploaded: !!evidenceFacts.rent_schedule_uploaded,
          correspondence_uploaded: !!evidenceFacts.correspondence_uploaded,
          damage_photos_uploaded: !!evidenceFacts.damage_photos_uploaded,
          authority_letters_uploaded: !!evidenceFacts.authority_letters_uploaded,
          bank_statements_uploaded: !!evidenceFacts.bank_statements_uploaded,
          safety_certificates_uploaded: !!evidenceFacts.safety_certificates_uploaded,
          asb_evidence_uploaded: !!evidenceFacts.asb_evidence_uploaded,
          other_evidence_uploaded: !!evidenceFacts.other_evidence_uploaded,
        },
      },
    });
  } catch (error) {
    console.error('Unexpected error in upload-evidence route', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
