import crypto from 'crypto';

import { NextResponse } from 'next/server';

import { assertCaseWriteAccess } from '@/lib/auth/case-access';
import { getSection13EvidenceUploads } from '@/lib/section13/server';
import { createSupabaseAdminClient, logSupabaseAdminDiagnostics } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const MAX_FILES = 15;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
]);

function sanitizeFilename(fileName: string): string {
  const cleaned = fileName.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-');
  return cleaned.length > 0 ? cleaned : 'evidence-file';
}

function detectMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'application/pdf';
  }
  if (bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47) {
    return 'image/png';
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  return null;
}

async function getSection13CaseForEvidenceAccess(params: {
  request: Request;
  caseId: string;
}) {
  const { request, caseId } = params;
  const user = await getServerUser().catch(() => null);
  const supabase = createSupabaseAdminClient();
  const { data: caseRow, error: caseError } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .single();

  if (caseError || !caseRow) {
    return { response: NextResponse.json({ error: 'Case not found' }, { status: 404 }) };
  }

  const accessError = assertCaseWriteAccess({
    request,
    user,
    caseRow: caseRow as { user_id: string | null; session_token?: string | null },
  });
  if (accessError) {
    return { response: accessError };
  }

  if ((caseRow as any).case_type !== 'rent_increase') {
    return { response: NextResponse.json({ error: 'Case is not a Section 13 case' }, { status: 400 }) };
  }

  const { data: paidOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('case_id', caseId)
    .eq('payment_status', 'paid')
    .eq('product_type', 'section13_defensive')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!paidOrder) {
    return {
      response: NextResponse.json(
        { error: 'Evidence uploads unlock after a paid Defensive Pack order.' },
        { status: 403 }
      ),
    };
  }

  return {
    supabase,
    caseRow,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = String(searchParams.get('caseId') || '').trim();

    if (!caseId) {
      return NextResponse.json({ error: 'caseId is required' }, { status: 400 });
    }

    const result = await getSection13CaseForEvidenceAccess({ request, caseId });
    if ('response' in result) {
      return result.response;
    }

    const uploads = await getSection13EvidenceUploads(result.supabase, caseId);
    return NextResponse.json({
      success: true,
      uploads,
    });
  } catch (error: any) {
    console.error('[section13/upload-evidence] GET error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load evidence uploads' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    logSupabaseAdminDiagnostics({ route: '/api/section13/upload-evidence', writesUsingAdmin: true });
    const formData = await request.formData();
    const caseId = String(formData.get('caseId') || '').trim();
    const files = formData.getAll('files').filter((value): value is File => value instanceof File);

    if (!caseId) {
      return NextResponse.json({ error: 'caseId is required' }, { status: 400 });
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'Add at least one evidence file.' }, { status: 400 });
    }

    const result = await getSection13CaseForEvidenceAccess({ request, caseId });
    if ('response' in result) {
      return result.response;
    }
    const { supabase, caseRow } = result;

    const existingUploads = await getSection13EvidenceUploads(supabase, caseId);
    if (existingUploads.length + files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `You can upload up to ${MAX_FILES} evidence files.` },
        { status: 400 }
      );
    }

    const existingTotal = existingUploads.reduce((sum, item) => sum + item.byteSize, 0);
    const requestTotal = files.reduce((sum, file) => sum + file.size, 0);
    if (existingTotal + requestTotal > MAX_TOTAL_BYTES) {
      return NextResponse.json(
        { error: 'Total evidence uploads cannot exceed 50 MB.' },
        { status: 400 }
      );
    }

    const existingHashes = new Set(
      existingUploads
        .map((item) => (item.metadata || {}) as Record<string, unknown>)
        .map((metadata) => metadata.file_hash)
        .filter((value): value is string => typeof value === 'string' && value.length > 0)
    );

    const createdRows: any[] = [];
    const warnings: string[] = [];
    let nextOrderIndex = existingUploads.length;

    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        warnings.push(`${file.name} was skipped because it is larger than 10 MB.`);
        continue;
      }

      const bytes = new Uint8Array(await file.arrayBuffer());
      const detectedMime = detectMime(bytes);
      if (!detectedMime || !ALLOWED_MIME_TYPES.has(detectedMime)) {
        warnings.push(`${file.name} was skipped because only PDF, JPG, and PNG files are supported.`);
        continue;
      }

      const fileHash = crypto.createHash('sha256').update(bytes).digest('hex');
      if (existingHashes.has(fileHash)) {
        warnings.push(`${file.name} matches an evidence file that is already uploaded.`);
        continue;
      }

      const safeName = sanitizeFilename(file.name);
      const storagePath = `${(caseRow as any).user_id || 'anonymous'}/${caseId}/section13-evidence/${Date.now()}-${safeName}`;
      const exhibitLabel = `Exhibit ${String.fromCharCode(65 + nextOrderIndex)}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, Buffer.from(bytes), {
          contentType: detectedMime,
          upsert: false,
        });

      if (uploadError) {
        warnings.push(`${file.name} could not be uploaded.`);
        continue;
      }

      const { data: inserted, error: insertError } = await supabase
        .from('section13_evidence_uploads')
        .insert({
          case_id: caseId,
          file_name: safeName,
          storage_path: storagePath,
          mime_type: detectedMime,
          byte_size: file.size,
          title: safeName,
          exhibit_label: exhibitLabel,
          order_index: nextOrderIndex,
          upload_status: 'uploaded',
          metadata: {
            original_name: file.name,
            file_hash: fileHash,
          },
        } as any)
        .select('*')
        .single();

      if (insertError || !inserted) {
        warnings.push(`${file.name} was uploaded but its evidence record could not be saved.`);
        continue;
      }

      existingHashes.add(fileHash);
      createdRows.push(inserted);
      nextOrderIndex += 1;
    }

    return NextResponse.json({
      success: true,
      uploads: createdRows,
      warnings,
    });
  } catch (error: any) {
    console.error('[section13/upload-evidence] error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload evidence files' },
      { status: 500 }
    );
  }
}
