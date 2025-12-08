// src/app/api/wizard/upload-evidence/route.ts

/**
 * Wizard Evidence Upload API
 *
 * POST /api/wizard/upload-evidence
 *
 * Responsibilities:
 * - Accept multipart/form-data with:
 *     - case_id: string (UUID)
 *     - question_id: string (MQS upload question id, e.g. `upload_tenancy_agreement`)
 *     - label?: string (optional human label)
 *     - file: File | File[] (one or more files)
 * - Store files in Supabase Storage (bucket: "cases" by default)
 * - Update WizardFacts (case_facts.facts + cases.collected_facts) with:
 *     - evidence.files[]: array of uploaded file metadata
 *     - evidence.<flag>_uploaded = true, mapped from question_id
 *
 * NOTE:
 * - If your actual storage bucket is different (e.g. "documents"),
 *   update the BUCKET_NAME constant below.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { updateWizardFacts } from '@/lib/case-facts/store';

export const dynamic = 'force-dynamic';

const BUCKET_NAME = 'cases'; // 🔧 Change to 'documents' or your actual bucket if needed

const uploadEvidenceSchema = z.object({
  case_id: z.string().uuid(),
  question_id: z.string().min(1),
  label: z.string().optional(),
});

// Map MQS upload question IDs → evidence boolean flags used in CaseFacts
// These names line up with EvidenceFacts in case-facts + money-claim-health.ts
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

  // Fallbacks – try to infer from id if new MQS IDs appear later
  const q = questionId.toLowerCase();

  if (q.includes('tenancy') || q.includes('agreement')) {
    return 'tenancy_agreement_uploaded';
  }
  if (q.includes('rent') && (q.includes('ledger') || q.includes('schedule'))) {
    return 'rent_schedule_uploaded';
  }
  if (q.includes('bank')) {
    return 'bank_statements_uploaded';
  }
  if (q.includes('safety') || q.includes('certificate')) {
    return 'safety_certificates_uploaded';
  }
  if (q.includes('asb') || q.includes('antisocial')) {
    return 'asb_evidence_uploaded';
  }
  if (q.includes('other_evidence')) {
    return 'other_evidence_uploaded';
  }

  return null;
}

function getFilesFromFormData(formData: FormData): File[] {
  const files: File[] = [];

  // Support both "file" and "file[]" naming conventions
  for (const [key, value] of formData.entries()) {
    if (!(value instanceof File)) continue;
    if (!value.size) continue;

    if (key === 'file' || key.startsWith('file[')) {
      files.push(value);
    }
  }

  return files;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 },
      );
    }

    const supabase = createServerSupabaseClient();
    const formData = await request.formData();

    const caseIdRaw = formData.get('case_id');
    const questionIdRaw = formData.get('question_id');
    const labelRaw = formData.get('label');

    const parsed = uploadEvidenceSchema.safeParse({
      case_id: typeof caseIdRaw === 'string' ? caseIdRaw : '',
      question_id: typeof questionIdRaw === 'string' ? questionIdRaw : '',
      label: typeof labelRaw === 'string' ? labelRaw : undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { case_id, question_id, label } = parsed.data;

    const files = getFilesFromFormData(formData);
    if (!files.length) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 },
      );
    }

    const uploadedAt = new Date().toISOString();
    const uploadedItems: any[] = [];

    for (const file of files) {
      const originalName = file.name || 'evidence';
      const safeName = originalName.replace(/\s+/g, '_');
      const uuid = crypto.randomUUID();
      const objectPath = `${case_id}/evidence/${uuid}-${safeName}`;

      const { data: storageResult, error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(objectPath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || undefined,
        });

      if (storageError || !storageResult?.path) {
        console.error('Evidence upload failed', storageError);
        return NextResponse.json(
          { error: 'Failed to upload evidence file' },
          { status: 500 },
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storageResult.path);

      uploadedItems.push({
        id: uuid,
        question_id,
        label: label ?? null,
        file_name: originalName,
        file_size: file.size,
        mime_type: file.type || null,
        storage_bucket: BUCKET_NAME,
        storage_path: storageResult.path,
        public_url: publicUrlData?.publicUrl ?? null,
        uploaded_at: uploadedAt,
      });
    }

    // 🔁 Update WizardFacts (flat facts) so normalize() + money-claim-health
    // can see the evidence flags and files.
    const updatedFacts = await updateWizardFacts(
      supabase,
      case_id,
      (current) => {
        const facts = { ...current };

        // Existing list of files
        const existingFiles =
          (facts['evidence.files'] as any[]) ||
          (facts.evidence?.files as any[]) ||
          [];

        facts['evidence.files'] = [...existingFiles, ...uploadedItems];

        const flagKey = mapQuestionToEvidenceFlag(question_id);
        if (flagKey) {
          // Canonical key used by normalize.ts / money-claim-health.ts
          facts[`evidence.${flagKey}`] = true;
        }

        return facts;
      },
      // You can put optional meta here if you want to track origin
      { meta: { last_evidence_upload_question: question_id } },
    );

    return NextResponse.json(
      {
        success: true,
        files: uploadedItems,
        facts: updatedFacts,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error('Unexpected error in /api/wizard/upload-evidence', err);
    return NextResponse.json(
      {
        error: 'Unexpected server error during evidence upload',
        details: err?.message || String(err),
      },
      { status: 500 },
    );
  }
}
