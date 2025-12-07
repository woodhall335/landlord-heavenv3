// src/app/api/wizard/upload-evidence/route.ts

/**
 * Wizard Evidence Upload API
 *
 * POST /api/wizard/upload-evidence
 *
 * - Accepts multipart/form-data with:
 *   - case_id: string (UUID)
 *   - question_id: string (MQS upload question id)
 *   - label?: string
 *   - file: File | File[] (one or more)
 *
 * - Stores files in Supabase Storage under:
 *   bucket: "cases"
 *   path:   "{case_id}/evidence/{uuid}-{originalName}"
 *
 * - Updates WizardFacts (case_facts.facts) with:
 *   - evidence.files: array of uploaded file metadata
 *   - evidence.<flag>_uploaded = true (based on question_id)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { updateWizardFacts } from '@/lib/case-facts/store';

export const dynamic = 'force-dynamic';

const uploadEvidenceSchema = z.object({
  case_id: z.string().uuid(),
  question_id: z.string().min(1),
  label: z.string().optional(),
});

// Map MQS upload question IDs → evidence boolean flags used by CaseFacts
const EVIDENCE_FLAG_BY_QUESTION: Record<string, string> = {
  // Money claim / rent arrears
  upload_rent_ledger: 'rent_schedule_uploaded',
  upload_rent_schedule: 'rent_schedule_uploaded',
  upload_rent_ledger_or_schedule: 'rent_schedule_uploaded',

  // Tenancy agreement
  upload_tenancy_agreement: 'tenancy_agreement_uploaded',
  upload_signed_tenancy_agreement: 'tenancy_agreement_uploaded',

  // Bank statements / payment history
  upload_bank_statements: 'bank_statements_uploaded',
  upload_bank_statements_or_transactions: 'bank_statements_uploaded',

  // Safety certificates
  upload_safety_certificates: 'safety_certificates_uploaded',
  upload_gas_safety_certificates: 'safety_certificates_uploaded',
  upload_safety_evidence: 'safety_certificates_uploaded',

  // ASB / nuisance
  upload_asb_evidence: 'asb_evidence_uploaded',
  upload_asb_logs: 'asb_evidence_uploaded',

  // Generic / other evidence
  upload_other_evidence: 'other_evidence_uploaded',
};

function mapQuestionToEvidenceFlag(questionId: string): string | null {
  if (EVIDENCE_FLAG_BY_QUESTION[questionId]) {
    return EVIDENCE_FLAG_BY_QUESTION[questionId];
  }

  // Fallback: if question id contains a known token, try to infer
  if (questionId.includes('tenancy') || questionId.includes('agreement')) {
    return 'tenancy_agreement_uploaded';
  }
  if (questionId.includes('rent') || questionId.includes('ledger') || questionId.includes('schedule')) {
    return 'rent_schedule_uploaded';
  }
  if (questionId.includes('bank')) {
    return 'bank_statements_uploaded';
  }
  if (questionId.includes('safety') || questionId.includes('certificate')) {
    return 'safety_certificates_uploaded';
  }
  if (questionId.includes('asb') || questionId.includes('antisocial')) {
    return 'asb_evidence_uploaded';
  }
  if (questionId.includes('other_evidence')) {
    return 'other_evidence_uploaded';
  }

  return null;
}

function getFilesFromFormData(formData: FormData): File[] {
  const files: File[] = [];

  // Support both "file" and "file[]" naming conventions
  for (const [key, value] of formData.entries()) {
    if (!value) continue;
    if (!(value instanceof File)) continue;
    if (!value.size) continue;

    if (key === 'file' || key.startsWith('file[')) {
      files.push(value);
    }
  }

  return files;
}

/**
 * POST /api/wizard/upload-evidence
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const formData = await request.formData();

    const case_id_raw = formData.get('case_id');
    const question_id_raw = formData.get('question_id');
    const label_raw = formData.get('label');

    const parsed = uploadEvidenceSchema.safeParse({
      case_id: typeof case_id_raw === 'string' ? case_id_raw : '',
      question_id: typeof question_id_raw === 'string' ? question_id_raw : '',
      label: typeof label_raw === 'string' ? label_raw : undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { case_id, question_id, label } = parsed.data;

    const files = getFilesFromFormData(formData);
    if (!files.length) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    const uploadedAt = new Date().toISOString();
    const uploadedItems: any[] = [];

    for (const file of files) {
      const safeName = file.name || 'evidence';
      const ext = safeName.includes('.') ? `.${safeName.split('.').pop()}` : '';
      const uuid = crypto.randomUUID();
      const objectPath = `${case_id}/evidence/${uuid}-${safeName.replace(/\s+/g, '_')}`;

      const { data: storageResult, error: storageError } = await supabase.storage
        .from('cases')
        .upload(objectPath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || undefined,
        });

      if (storageError || !storageResult?.path) {
        console.error('Evidence upload failed', storageError);
        return NextResponse.json(
          { error: 'Failed to upload evidence file' },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from('cases')
        .getPublicUrl(storageResult.path);

      uploadedItems.push({
        id: uuid,
        question_id,
        label: label ?? null,
        file_name: safeName,
        file_size: file.size,
        mime_type: file.type || null,
        storage_bucket: 'cases',
        storage_path: storageResult.path,
        public_url: publicUrlData?.publicUrl ?? null,
        uploaded_at: uploadedAt,
      });
    }

    // Update WizardFacts (case_facts.facts + cases.collected_facts)
    const updatedFacts = await updateWizardFacts(
      supabase,
      case_id,
      (current) => {
        const facts = { ...current };

        const existingFiles =
          (facts['evidence.files'] as any[]) ||
          (facts.evidence?.files as any[]) ||
          [];

        facts['evidence.files'] = [...existingFiles, ...uploadedItems];

        const flagKey = mapQuestionToEvidenceFlag(question_id);
        if (flagKey) {
          // Primary canonical key used by normalize.ts
          facts[`evidence.${flagKey}`] = true;

          // Optional additional aliases for robustness
          facts[`case_facts.evidence.${flagKey}`] ??= true;
          facts[flagKey] ??= true;
        }

        return facts;
      }
    );

    return NextResponse.json(
      {
        success: true,
        files: uploadedItems,
        facts: updatedFacts,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Unexpected error in upload-evidence route', err);
    return NextResponse.json(
      {
        error: 'Unexpected server error during evidence upload',
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
