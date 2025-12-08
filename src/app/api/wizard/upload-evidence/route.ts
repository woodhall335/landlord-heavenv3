import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { updateWizardFacts } from '@/lib/case-facts/store';

export const runtime = 'nodejs';

function sanitizeFilename(name: string) {
  const trimmed = name?.trim() || 'upload';
  return trimmed.replace(/[^a-zA-Z0-9_.-]+/g, '_');
}

function mapQuestionToEvidenceFlags(questionId: string) {
  switch (questionId) {
    case 'upload_tenancy_agreement':
      return ['tenancy_agreement_uploaded'];
    case 'upload_rent_schedule':
    case 'arrears_schedule_upload':
      return ['rent_schedule_uploaded'];
    case 'upload_bank_statements':
      return ['bank_statements_uploaded'];
    case 'upload_damage_evidence':
    case 'upload_other_evidence':
      return ['other_evidence_uploaded'];
    default:
      return [];
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    if (caseRow.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const safeFilename = sanitizeFilename(file.name || 'upload');
    const objectKey = `${user.id}/${caseId}/evidence/${randomUUID()}-${safeFilename}`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage.from('documents').upload(objectKey, fileBuffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

    if (uploadError) {
      console.error('Failed to upload file to storage', uploadError);
      return NextResponse.json({ error: 'Could not upload file' }, { status: 500 });
    }

    const { data: documentRow, error: documentError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        case_id: caseId,
        document_type: 'evidence',
        document_title: file.name || safeFilename,
        jurisdiction: caseRow.jurisdiction,
        pdf_url: objectKey,
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
      category: typeof category === 'string' && category.length > 0 ? category : undefined,
      file_name: file.name || safeFilename,
      storage_bucket: 'documents',
      storage_path: objectKey,
      mime_type: file.type || null,
      size_bytes: typeof file.size === 'number' ? file.size : null,
      uploaded_at: new Date().toISOString(),
    };

    const updatedFacts = await updateWizardFacts(supabase, caseId, (currentRaw) => {
      const current = (currentRaw as any) || {};
      const currentEvidence = (current as any).evidence || {};
      const nextEvidence = {
        ...currentEvidence,
        files: Array.isArray(currentEvidence.files) ? [...currentEvidence.files] : [],
      };

      nextEvidence.files.push(evidenceEntry);

      const flags = mapQuestionToEvidenceFlags(questionId);
      for (const flag of flags) {
        nextEvidence[flag] = true;
      }

      return {
        ...current,
        evidence: nextEvidence,
      } as typeof current;
    });

    const evidenceFacts: any = (updatedFacts as any).evidence || {};

    return NextResponse.json({
      success: true,
      document: documentRow,
      evidence: {
        files: evidenceFacts.files || [],
        flags: {
          tenancy_agreement_uploaded: !!evidenceFacts.tenancy_agreement_uploaded,
          rent_schedule_uploaded: !!evidenceFacts.rent_schedule_uploaded,
          bank_statements_uploaded: !!evidenceFacts.bank_statements_uploaded,
          other_evidence_uploaded: !!evidenceFacts.other_evidence_uploaded,
        },
      },
    });
  } catch (error) {
    console.error('Unexpected error in upload-evidence route', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
