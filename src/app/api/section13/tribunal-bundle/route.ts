import path from 'path';

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { assertCaseWriteAccess } from '@/lib/auth/case-access';
import {
  generateSection13CoreDocuments,
  generateSection13TribunalBundle,
  SECTION13_BUNDLE_SOURCE_DOCUMENT_TYPES,
  getSection13Form4AAssetMetadata,
  type Section13BundleSourceDocument,
  type Section13EvidenceFile,
} from '@/lib/documents/section13-generator';
import { buildSection13JustificationSummaryText, computeSection13Preview } from '@/lib/section13/rules';
import {
  buildSection13BundleJobIdempotencyKey,
  buildSection13EvidenceSetHash,
  claimSection13BundleJob,
  createOrGetSection13BundleJob,
  createSection13OutputSnapshot,
  getDefaultSection13StateForCase,
  getSection13ActiveBundleJob,
  getSection13BundleAssets,
  getSection13BundleJobByIdempotencyKey,
  getSection13Comparables,
  getSection13DocumentsForSnapshot,
  getSection13EvidenceUploads,
  getSection13LatestBundleJob,
  getSection13OutputSnapshotByOrderId,
  replaceSection13BundleAssets,
  updateSection13BundleJob,
} from '@/lib/section13/server';
import type {
  Section13BundleFailureType,
  Section13BundleJob,
  Section13OutputSnapshot,
} from '@/lib/section13/types';
import { createSupabaseAdminClient, logSupabaseAdminDiagnostics } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  caseId: z.string().uuid(),
  idempotencyKey: z.string().trim().min(8).max(200).optional(),
});

const RETRY_DELAYS_SECONDS = [5, 15, 60] as const;

function isUniqueConflictError(error: unknown): boolean {
  return String((error as any)?.code || '') === '23505';
}

function parseStoragePathFromPublicUrl(pdfUrl: string | null | undefined): string | null {
  if (!pdfUrl) return null;
  const match = pdfUrl.match(/\/documents\/(.+)$/);
  return match?.[1] || null;
}

function classifyBundleFailure(error: unknown): Section13BundleFailureType {
  const message = String((error as any)?.message || error || '').toLowerCase();

  if (message.includes('timeout') || message.includes('timed out')) {
    return 'timeout';
  }
  if (
    message.includes('heap') ||
    message.includes('memory') ||
    message.includes('out of memory') ||
    message.includes('allocation failed')
  ) {
    return 'memory';
  }
  if (
    message.includes('upload') ||
    message.includes('storage') ||
    message.includes('download') ||
    message.includes('evidence')
  ) {
    return 'upload_error';
  }
  if (
    message.includes('pdf') ||
    message.includes('merge') ||
    message.includes('bundle') ||
    message.includes('document')
  ) {
    return 'merge_error';
  }

  return 'unknown';
}

function isRetryableFailureType(failureType: Section13BundleFailureType): boolean {
  return failureType === 'timeout' || failureType === 'upload_error';
}

function getRetryAfterIso(attemptCount: number): string | null {
  const delay = RETRY_DELAYS_SECONDS[Math.min(Math.max(attemptCount - 1, 0), RETRY_DELAYS_SECONDS.length - 1)];
  if (!delay) return null;
  return new Date(Date.now() + delay * 1000).toISOString();
}

function canRetryJob(job: Section13BundleJob): boolean {
  if (job.status !== 'failed') return false;
  if (!job.failureType || !isRetryableFailureType(job.failureType)) return false;
  if (job.attemptCount >= job.maxAttempts) return false;
  if (!job.retryAfter) return true;
  return new Date(job.retryAfter).getTime() <= Date.now();
}

async function loadEvidenceFiles(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  uploads: Awaited<ReturnType<typeof getSection13EvidenceUploads>>
): Promise<Section13EvidenceFile[]> {
  const files: Section13EvidenceFile[] = [];

  for (const upload of uploads) {
    if (!upload.storagePath || upload.uploadStatus === 'failed') {
      continue;
    }

    const { data, error } = await supabase.storage.from('documents').download(upload.storagePath);
    if (error || !data) {
      continue;
    }

    const buffer = await data.arrayBuffer();
    files.push({
      upload,
      bytes: new Uint8Array(buffer),
      contentType: upload.mimeType || data.type || 'application/octet-stream',
    });
  }

  return files;
}

async function ensureOutputSnapshot(params: {
  supabase: ReturnType<typeof createSupabaseAdminClient>;
  caseId: string;
  orderId: string;
  caseFacts: Record<string, any>;
}): Promise<Section13OutputSnapshot> {
  const { supabase, caseId, orderId, caseFacts } = params;
  const existing = await getSection13OutputSnapshotByOrderId(supabase, orderId);
  if (existing) {
    return existing;
  }

  const state = getDefaultSection13StateForCase(caseFacts, 'section13_defensive');
  const comparables = await getSection13Comparables(supabase, caseId);
  state.preview = computeSection13Preview(state, comparables);

  const formMetadata = await getSection13Form4AAssetMetadata();
  const justificationSummaryText = buildSection13JustificationSummaryText(state, state.preview);
  const manualJustification = state.adjustments.manualJustification?.trim();
  const justificationNarrativeText = manualJustification
    ? `${justificationSummaryText} ${manualJustification}`
    : justificationSummaryText;

  return createSection13OutputSnapshot(supabase, {
    orderId,
    caseId,
    rulesVersion: state.rulesVersion,
    formAssetVersion: formMetadata.version,
    formAssetSha256: formMetadata.sha256,
    stateSnapshot: JSON.parse(JSON.stringify(state)),
    previewMetrics: JSON.parse(JSON.stringify(state.preview || {})),
    defensibilitySummarySentence:
      state.preview?.defensibilitySummarySentence ||
      'Add a proposed rent and enough recent source-backed comparables to generate a defensibility summary.',
    justificationSummaryText,
    justificationNarrativeText,
    comparableSnapshot: JSON.parse(JSON.stringify(comparables)),
  });
}

async function loadPersistedSourceDocuments(params: {
  supabase: ReturnType<typeof createSupabaseAdminClient>;
  caseId: string;
  outputSnapshotId: string;
}): Promise<Section13BundleSourceDocument[]> {
  const { supabase, caseId, outputSnapshotId } = params;
  const documentTypes = [...SECTION13_BUNDLE_SOURCE_DOCUMENT_TYPES];

  const documentRows = await getSection13DocumentsForSnapshot(supabase, {
    caseId,
    outputSnapshotId,
    documentTypes,
  });

  const latestByType = new Map<string, any>();
  for (const row of documentRows || []) {
    if (!latestByType.has((row as any).document_type)) {
      latestByType.set((row as any).document_type, row);
    }
  }

  const results: Section13BundleSourceDocument[] = [];

  for (const documentType of documentTypes) {
    const row = latestByType.get(documentType);
    if (!row) continue;

    const storagePath = parseStoragePathFromPublicUrl((row as any).pdf_url);
    if (!storagePath) {
      continue;
    }

    const { data, error: downloadError } = await supabase.storage
      .from('documents')
      .download(storagePath);

    if (downloadError || !data) {
      continue;
    }

    const bytes = Buffer.from(await data.arrayBuffer());
    results.push({
      title: (row as any).document_title,
      description: (row as any).metadata?.description || undefined,
      document_type: (row as any).document_type,
      file_name: path.basename(storagePath),
      pdf: bytes,
      sourceDocumentId: (row as any).id,
    });
  }

  return results;
}

async function persistBundleDocuments(params: {
  supabase: ReturnType<typeof createSupabaseAdminClient>;
  caseId: string;
  userId: string;
  orderId: string;
  snapshot: Section13OutputSnapshot;
  bundleJobId: string;
  documents: Array<{
    title: string;
    description?: string;
    document_type: string;
    file_name: string;
    pdf: Buffer;
    contentType?: string;
  }>;
}): Promise<void> {
  const { supabase, caseId, userId, orderId, snapshot, bundleJobId, documents } = params;

  for (const doc of documents) {
    const storagePath = `${userId}/${caseId}/${snapshot.id || orderId}/${doc.file_name}`;
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, doc.pdf, {
        contentType: doc.contentType || 'application/pdf',
        upsert: true,
      });

    if (uploadError && !uploadError.message.includes('already exists')) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(storagePath);

    const { error: docError } = await supabase.from('documents').upsert(
      {
        user_id: userId,
        case_id: caseId,
        order_id: orderId,
        output_snapshot_id: snapshot.id || null,
        document_type: doc.document_type,
        document_title: doc.title,
        jurisdiction: 'england',
        html_content: null,
        pdf_url: publicUrlData.publicUrl,
        is_preview: false,
        qa_passed: true,
        metadata: {
          description: doc.description,
          pack_type: 'section13_defensive',
          order_id: orderId,
          output_snapshot_id: snapshot.id || null,
          rules_version: snapshot.rulesVersion,
          form_asset_version: snapshot.formAssetVersion,
          form_asset_sha256: snapshot.formAssetSha256,
          bundle_job_id: bundleJobId,
        },
      },
      { onConflict: 'case_id,document_type,is_preview,output_snapshot_id' }
    );

    if (docError) {
      throw docError;
    }
  }
}

async function buildBundleResponse(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  caseId: string
) {
  const [assets, latestJob] = await Promise.all([
    getSection13BundleAssets(supabase, caseId),
    getSection13LatestBundleJob(supabase, caseId),
  ]);

  const { data: caseRow } = await supabase
    .from('cases')
    .select('workflow_status')
    .eq('id', caseId)
    .maybeSingle();

  return {
    success: true,
    workflowStatus: (caseRow as any)?.workflow_status || null,
    assets,
    latestJob,
  };
}

export async function GET(request: Request) {
  try {
    const user = await getServerUser().catch(() => null);
    const { searchParams } = new URL(request.url);
    const caseId = String(searchParams.get('caseId') || '').trim();

    if (!caseId) {
      return NextResponse.json({ error: 'caseId is required' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select('id, user_id, session_token, case_type, workflow_status')
      .eq('id', caseId)
      .single();

    if (caseError || !caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const accessError = assertCaseWriteAccess({
      request,
      user,
      caseRow: caseRow as { user_id: string | null; session_token?: string | null },
    });
    if (accessError) return accessError;

    if ((caseRow as any).case_type !== 'rent_increase') {
      return NextResponse.json({ error: 'Case is not a Section 13 case' }, { status: 400 });
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
      return NextResponse.json(
        { error: 'Tribunal bundle status unlocks after a paid Defensive Pack order.' },
        { status: 403 }
      );
    }

    return NextResponse.json(await buildBundleResponse(supabase, caseId));
  } catch (error: any) {
    console.error('[section13/tribunal-bundle] GET error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load tribunal bundle status' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  let bundleJob: Section13BundleJob | null = null;

  try {
    logSupabaseAdminDiagnostics({ route: '/api/section13/tribunal-bundle', writesUsingAdmin: true });
    const user = await getServerUser().catch(() => null);
    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { caseId, idempotencyKey } = parsed.data;
    const supabase = createSupabaseAdminClient();
    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select('id, user_id, session_token, case_type, workflow_status, collected_facts')
      .eq('id', caseId)
      .single();

    if (caseError || !caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const accessError = assertCaseWriteAccess({
      request,
      user,
      caseRow: caseRow as { user_id: string | null; session_token?: string | null },
    });
    if (accessError) return accessError;

    if ((caseRow as any).case_type !== 'rent_increase') {
      return NextResponse.json({ error: 'Case is not a Section 13 case' }, { status: 400 });
    }

    const { data: paidOrder } = await supabase
      .from('orders')
      .select('id, product_type, payment_status, user_id')
      .eq('case_id', caseId)
      .eq('payment_status', 'paid')
      .eq('product_type', 'section13_defensive')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!paidOrder) {
      return NextResponse.json(
        { error: 'A paid Defensive Pack order is required before regenerating the tribunal bundle.' },
        { status: 403 }
      );
    }

    const snapshot = await ensureOutputSnapshot({
      supabase,
      caseId,
      orderId: (paidOrder as any).id,
      caseFacts: ((caseRow as any).collected_facts || {}) as Record<string, any>,
    });

    const evidenceUploads = await getSection13EvidenceUploads(supabase, caseId);
    const evidenceSetHash = buildSection13EvidenceSetHash(evidenceUploads);
    const resolvedIdempotencyKey =
      idempotencyKey?.trim() ||
      buildSection13BundleJobIdempotencyKey({
        caseId,
        orderId: (paidOrder as any).id,
        outputSnapshotId: snapshot.id || '',
        evidenceSetHash,
      });

    try {
      bundleJob = await createOrGetSection13BundleJob(supabase, {
        caseId,
        orderId: (paidOrder as any).id,
        outputSnapshotId: snapshot.id || '',
        idempotencyKey: resolvedIdempotencyKey,
        status: 'queued',
        generationMode: 'sync',
        attemptCount: 0,
        maxAttempts: 3,
        warningCount: 0,
      });
    } catch (createJobError) {
      if (!isUniqueConflictError(createJobError)) {
        throw createJobError;
      }

      const [existingByIdempotency, activeJob] = await Promise.all([
        getSection13BundleJobByIdempotencyKey(supabase, caseId, resolvedIdempotencyKey),
        getSection13ActiveBundleJob(supabase, caseId),
      ]);

      bundleJob = existingByIdempotency || activeJob;
      if (!bundleJob) {
        return NextResponse.json(await buildBundleResponse(supabase, caseId));
      }
    }

    if (bundleJob.status === 'succeeded' || bundleJob.status === 'warning' || bundleJob.status === 'running') {
      return NextResponse.json(await buildBundleResponse(supabase, caseId));
    }

    const nextAttempt = Math.max((bundleJob.attemptCount || 0) + 1, 1);
    const claimedJob =
      bundleJob.status === 'queued'
        ? await claimSection13BundleJob(supabase, {
            jobId: bundleJob.id!,
            allowedStatuses: ['queued'],
            attemptCount: nextAttempt,
            generationMode: 'sync',
            startedAt: new Date().toISOString(),
            peakRssMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
          })
        : canRetryJob(bundleJob)
          ? await claimSection13BundleJob(supabase, {
              jobId: bundleJob.id!,
              allowedStatuses: ['failed'],
              attemptCount: nextAttempt,
              generationMode: 'sync',
              startedAt: new Date().toISOString(),
              peakRssMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
            })
          : null;

    if (!claimedJob) {
      const activeJob = await getSection13ActiveBundleJob(supabase, caseId);
      if (activeJob) {
        bundleJob = activeJob;
      } else {
        const existingJob = await getSection13BundleJobByIdempotencyKey(
          supabase,
          caseId,
          resolvedIdempotencyKey
        );
        if (existingJob) {
          bundleJob = existingJob;
        }
      }

      return NextResponse.json(await buildBundleResponse(supabase, caseId));
    }

    bundleJob = claimedJob;

    const evidenceFiles = await loadEvidenceFiles(supabase, evidenceUploads);
    let sourceDocuments = await loadPersistedSourceDocuments({
      supabase,
      caseId,
      outputSnapshotId: snapshot.id || '',
    });

    if (sourceDocuments.length < 9) {
      sourceDocuments = (
        await generateSection13CoreDocuments({
          caseId,
          productType: 'section13_defensive',
          state: snapshot.stateSnapshot,
          comparables: snapshot.comparableSnapshot,
          evidenceFiles,
          snapshot,
        })
      ).map((doc) => ({
        title: doc.title,
        description: doc.description,
        document_type: doc.document_type,
        file_name: doc.file_name,
        pdf: doc.pdf,
      }));
    }

    const bundle = await generateSection13TribunalBundle({
      caseId,
      state: snapshot.stateSnapshot,
      evidenceFiles,
      sourceDocuments,
      snapshot,
    });

    const resolvedUserId =
      (paidOrder as any).user_id || (caseRow as any).user_id;

    if (!resolvedUserId) {
      throw new Error('Unable to resolve user for tribunal bundle generation');
    }

    await persistBundleDocuments({
      supabase,
      caseId,
      userId: resolvedUserId,
      orderId: (paidOrder as any).id,
      snapshot,
      bundleJobId: bundleJob.id!,
      documents: bundle.documents,
    });

    await replaceSection13BundleAssets(supabase, caseId, bundle.bundleAssets);
    await supabase
      .from('cases')
      .update({
        workflow_status: bundle.workflowStatus,
        workflow_status_updated_at: new Date().toISOString(),
      })
      .eq('id', caseId);

    bundleJob = await updateSection13BundleJob(supabase, bundleJob.id!, {
      status: bundle.bundleWarnings.length > 0 ? 'warning' : 'succeeded',
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      peakRssMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
      warningCount: bundle.bundleWarnings.length,
    });

    return NextResponse.json(await buildBundleResponse(supabase, caseId));
  } catch (error: any) {
    console.error('[section13/tribunal-bundle] error', error);

    if (bundleJob?.id) {
      try {
        const failureType = classifyBundleFailure(error);
        const retryable = isRetryableFailureType(failureType);
        const nextRetryAfter =
          retryable && bundleJob.attemptCount < bundleJob.maxAttempts
            ? getRetryAfterIso(bundleJob.attemptCount)
            : null;

        await updateSection13BundleJob(createSupabaseAdminClient(), bundleJob.id, {
          status: 'failed',
          completedAt: new Date().toISOString(),
          durationMs: Date.now() - startedAt,
          peakRssMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
          failureType,
          errorMessage: error?.message || 'Tribunal bundle generation failed',
          retryAfter: nextRetryAfter,
        });
      } catch (jobError) {
        console.error('[section13/tribunal-bundle] failed to update bundle job', jobError);
      }
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to regenerate tribunal bundle' },
      { status: 500 }
    );
  }
}
