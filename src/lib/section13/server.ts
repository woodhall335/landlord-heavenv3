import crypto from 'crypto';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/types';

import {
  getMonthlyEquivalent,
  getWeeklyEquivalent,
} from './rules';
import {
  createEmptySection13State,
  getSection13StateFromFacts,
  setSection13StateOnFacts,
  sortSection13Comparables,
} from './facts';
import type {
  Section13BundleAsset,
  Section13BundleFailureType,
  Section13BundleGenerationMode,
  Section13BundleJob,
  Section13BundleJobStatus,
  Section13Comparable,
  Section13ComparableAdjustment,
  Section13EvidenceUpload,
  Section13OutputSnapshot,
  Section13ProductSku,
  Section13State,
  Section13SupportHandlingMode,
  Section13SupportPriority,
  Section13SupportRequest,
  Section13SupportStatus,
  Section13WorkflowStatus,
} from './types';

type AdminClient = SupabaseClient<Database>;
const SECTION13_BUNDLE_JOB_CONFLICT_CONSTRAINTS = [
  'idx_section13_bundle_jobs_case_idempotency',
  'idx_section13_bundle_jobs_case_active',
];
const SECTION13_BUNDLE_JOB_CONFLICT_RECOVERY_MS = [10, 30, 60] as const;

function isSupabaseUniqueViolation(error: any, constraintNames: string[] = []): boolean {
  if (!error || error.code !== '23505') {
    return false;
  }

  if (constraintNames.length === 0) {
    return true;
  }

  const message = String(error.message || error.details || error.hint || '');
  return constraintNames.some((constraintName) => message.includes(constraintName));
}

function isSupabaseFunctionMissing(error: any): boolean {
  return String(error?.code || '') === '42883';
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function recoverBundleJobAfterConflict(
  supabase: AdminClient,
  params: {
    caseId: string;
    idempotencyKey: string;
  }
): Promise<Section13BundleJob | null> {
  const { caseId, idempotencyKey } = params;

  for (const waitMs of SECTION13_BUNDLE_JOB_CONFLICT_RECOVERY_MS) {
    const [byIdempotency, activeJob] = await Promise.all([
      getSection13BundleJobByIdempotencyKey(supabase, caseId, idempotencyKey),
      getSection13ActiveBundleJob(supabase, caseId),
    ]);

    if (byIdempotency) {
      return byIdempotency;
    }
    if (activeJob) {
      return activeJob;
    }

    if (waitMs > 0) {
      await delay(waitMs);
    }
  }

  return getSection13LatestBundleJob(supabase, caseId);
}

function toComparable(row: any, adjustments: Section13ComparableAdjustment[]): Section13Comparable {
  return {
    id: row.id,
    caseId: row.case_id,
    postcodeRaw: row.postcode_raw,
    postcodeNormalized: row.postcode_normalized,
    bedrooms: row.bedrooms,
    source: row.source,
    sourceUrl: row.source_url,
    sourceDomain: row.source_domain,
    sourceDateValue: row.source_date_value,
    sourceDateKind: row.source_date_kind,
    addressSnippet: row.address_snippet || '',
    propertyType: row.property_type,
    listedAt: row.listed_at,
    distanceMiles: row.distance_miles == null ? null : Number(row.distance_miles),
    rawRentValue: Number(row.raw_rent_value || 0),
    rawRentFrequency: row.raw_rent_frequency,
    monthlyEquivalent: Number(row.monthly_equivalent || 0),
    weeklyEquivalent: Number(row.weekly_equivalent || 0),
    adjustedMonthlyEquivalent: Number(row.adjusted_monthly_equivalent || 0),
    isManual: Boolean(row.is_manual),
    scrapeBatchId: row.scrape_batch_id,
    sortOrder: Number(row.sort_order || 0),
    adjustments: adjustments
      .filter((item) => item.comparableId === row.id)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    metadata: row.metadata || {},
  };
}

function toAdjustment(row: any): Section13ComparableAdjustment {
  return {
    id: row.id,
    comparableId: row.comparable_id,
    category: row.category,
    method: row.method,
    inputValue: row.input_value == null ? null : Number(row.input_value),
    normalizedMonthlyDelta: Number(row.normalized_monthly_delta || 0),
    reason: row.reason || '',
    sourceKind: row.source_kind === 'user' ? 'user' : 'system',
    isOverride: Boolean(row.is_override),
    sortOrder: Number(row.sort_order || 0),
  };
}

function toOutputSnapshot(row: any): Section13OutputSnapshot {
  return {
    id: row.id,
    orderId: row.order_id,
    caseId: row.case_id,
    rulesVersion: row.rules_version,
    formAssetVersion: row.form_asset_version,
    formAssetSha256: row.form_asset_sha256,
    stateSnapshot: row.state_snapshot_json || {},
    previewMetrics: row.preview_metrics_json || {},
    defensibilitySummarySentence: row.defensibility_summary_sentence || '',
    justificationSummaryText: row.justification_summary_text || '',
    justificationNarrativeText: row.justification_narrative_text || '',
    comparableSnapshot: Array.isArray(row.comparable_snapshot_json)
      ? row.comparable_snapshot_json
      : [],
    createdAt: row.created_at || null,
  };
}

function toBundleJob(row: any): Section13BundleJob {
  return {
    id: row.id,
    caseId: row.case_id,
    orderId: row.order_id,
    outputSnapshotId: row.output_snapshot_id,
    idempotencyKey: row.idempotency_key,
    status: row.status,
    generationMode: row.generation_mode,
    attemptCount: Number(row.attempt_count || 0),
    maxAttempts: Number(row.max_attempts || 3),
    retryAfter: row.retry_after || null,
    startedAt: row.started_at || null,
    completedAt: row.completed_at || null,
    durationMs: row.duration_ms == null ? null : Number(row.duration_ms),
    peakRssMb: row.peak_rss_mb == null ? null : Number(row.peak_rss_mb),
    warningCount: row.warning_count == null ? null : Number(row.warning_count),
    failureType: row.failure_type || null,
    errorMessage: row.error_message || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}

function toSupportRequest(row: any): Section13SupportRequest {
  return {
    id: row.id,
    caseId: row.case_id,
    latestConversationId: row.latest_conversation_id || null,
    handlingMode: row.handling_mode,
    intentCode: row.intent_code,
    blockedReason: row.blocked_reason || null,
    priority: row.priority,
    deadlineAt: row.deadline_at || null,
    status: row.status,
    assignedTo: row.assigned_to || null,
    createdAt: row.created_at || null,
    resolvedAt: row.resolved_at || null,
    metadata: row.metadata || {},
  };
}

export async function getSection13CaseData(
  supabase: AdminClient,
  caseId: string,
  selectedPlan: Section13ProductSku = 'section13_standard'
): Promise<{
  caseRow: any;
  facts: Record<string, any>;
  state: Section13State;
  comparables: Section13Comparable[];
}> {
  const { data: caseRow, error: caseError } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .single();

  if (caseError || !caseRow) {
    throw new Error('Case not found');
  }

  const facts = ((caseRow as any).collected_facts || {}) as Record<string, any>;
  const state = getSection13StateFromFacts(facts, selectedPlan);
  const comparables = await getSection13Comparables(supabase, caseId);

  return { caseRow, facts, state, comparables };
}

export async function saveSection13State(params: {
  supabase: AdminClient;
  caseId: string;
  existingFacts: Record<string, any>;
  state: Section13State;
  workflowStatus?: Section13WorkflowStatus;
}): Promise<void> {
  const { supabase, caseId, existingFacts, state, workflowStatus } = params;
  const mergedFacts = setSection13StateOnFacts(existingFacts, state, {
    caseId,
    product: state.selectedPlan,
    workflowStatus,
  });
  const timestamp = new Date().toISOString();
  const caseUpdate: Record<string, unknown> = {
    collected_facts: mergedFacts,
    updated_at: timestamp,
  };

  if (workflowStatus) {
    caseUpdate.workflow_status = workflowStatus;
    caseUpdate.workflow_status_updated_at = timestamp;
  }

  await supabase
    .from('cases')
    .update(caseUpdate as any)
    .eq('id', caseId);

  const { data: caseFactsRow } = await supabase
    .from('case_facts')
    .select('version')
    .eq('case_id', caseId)
    .maybeSingle();

  if (caseFactsRow) {
    await supabase
      .from('case_facts')
      .update({
        facts: mergedFacts,
        version: (caseFactsRow.version ?? 0) + 1,
        updated_at: timestamp,
      } as any)
      .eq('case_id', caseId);
  } else {
    await supabase
      .from('case_facts')
      .insert({
        case_id: caseId,
        facts: mergedFacts,
        version: 1,
      } as any);
  }
}

export async function getSection13Comparables(
  supabase: AdminClient,
  caseId: string
): Promise<Section13Comparable[]> {
  const [{ data: comparableRows, error: comparablesError }, { data: adjustmentRows, error: adjustmentsError }] =
    await Promise.all([
      supabase
        .from('section13_comparables')
        .select('*')
        .eq('case_id', caseId)
        .order('sort_order', { ascending: true }),
      supabase
        .from('section13_comparable_adjustments')
        .select('*')
        .eq('case_id', caseId)
        .order('sort_order', { ascending: true }),
    ]);

  if (comparablesError) {
    throw comparablesError;
  }
  if (adjustmentsError) {
    throw adjustmentsError;
  }

  const adjustments = (adjustmentRows || []).map(toAdjustment);
  return sortSection13Comparables((comparableRows || []).map((row) => toComparable(row, adjustments)));
}

export async function replaceSection13Comparables(
  supabase: AdminClient,
  caseId: string,
  comparables: Section13Comparable[]
): Promise<Section13Comparable[]> {
  await supabase.from('section13_comparable_adjustments').delete().eq('case_id', caseId);
  await supabase.from('section13_comparables').delete().eq('case_id', caseId);

  if (comparables.length === 0) {
    return [];
  }

  const comparableRows = comparables.map((item, index) => ({
    case_id: caseId,
    postcode_raw: item.postcodeRaw || null,
    postcode_normalized: item.postcodeNormalized || null,
    bedrooms: item.bedrooms ?? null,
    source: item.source,
    source_url: item.sourceUrl || null,
    source_domain: item.sourceDomain || null,
    source_date_value: item.sourceDateValue || null,
    source_date_kind: item.sourceDateKind,
    address_snippet: item.addressSnippet,
    property_type: item.propertyType || null,
    listed_at: item.listedAt || null,
    distance_miles: item.distanceMiles ?? null,
    raw_rent_value: item.rawRentValue,
    raw_rent_frequency: item.rawRentFrequency,
    monthly_equivalent: item.monthlyEquivalent,
    weekly_equivalent: item.weeklyEquivalent,
    adjusted_monthly_equivalent: item.adjustedMonthlyEquivalent,
    is_manual: item.isManual,
    scrape_batch_id: item.scrapeBatchId || null,
    sort_order: item.sortOrder ?? index,
    metadata: item.metadata || {},
  }));

  const { data: insertedComparables, error: insertComparableError } = await supabase
    .from('section13_comparables')
    .insert(comparableRows as any)
    .select('*');

  if (insertComparableError) {
    throw insertComparableError;
  }

  const insertedByOrder = sortSection13Comparables(
    (insertedComparables || []).map((row) =>
      toComparable(row, [])
    )
  );

  const comparableIdBySortOrder = new Map<number, string>();
  insertedByOrder.forEach((item) => {
    if (item.id) {
      comparableIdBySortOrder.set(item.sortOrder, item.id);
    }
  });

  const adjustmentRows = comparables.flatMap((item, itemIndex) =>
    (item.adjustments || []).map((adjustment, adjustmentIndex) => ({
      case_id: caseId,
      comparable_id: comparableIdBySortOrder.get(item.sortOrder ?? itemIndex),
      category: adjustment.category,
      method: adjustment.method || null,
      input_value: adjustment.inputValue ?? null,
      normalized_monthly_delta: adjustment.normalizedMonthlyDelta,
      reason: adjustment.reason,
      source_kind: adjustment.sourceKind,
      is_override: adjustment.isOverride,
      sort_order: adjustment.sortOrder ?? adjustmentIndex,
    }))
  ).filter((item) => Boolean(item.comparable_id));

  if (adjustmentRows.length > 0) {
    const { error: insertAdjustmentError } = await supabase
      .from('section13_comparable_adjustments')
      .insert(adjustmentRows as any);

    if (insertAdjustmentError) {
      throw insertAdjustmentError;
    }
  }

  return getSection13Comparables(supabase, caseId);
}

export async function getSection13EvidenceUploads(
  supabase: AdminClient,
  caseId: string
): Promise<Section13EvidenceUpload[]> {
  const { data, error } = await supabase
    .from('section13_evidence_uploads')
    .select('*')
    .eq('case_id', caseId)
    .order('order_index', { ascending: true });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    fileName: row.file_name,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    byteSize: Number(row.byte_size),
    title: row.title,
    exhibitLabel: row.exhibit_label,
    orderIndex: Number(row.order_index || 0),
    uploadStatus: row.upload_status,
    warningMessage: row.warning_message,
    metadata: row.metadata || {},
  }));
}

export async function getSection13BundleAssets(
  supabase: AdminClient,
  caseId: string
): Promise<Section13BundleAsset[]> {
  const { data, error } = await supabase
    .from('section13_bundle_assets')
    .select('*')
    .eq('case_id', caseId)
    .order('order_index', { ascending: true });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    caseId: row.case_id,
    rulesVersion: row.rules_version,
    logicalSection: row.logical_section,
    assetType: row.asset_type,
    title: row.title,
    sourceKind: row.source_kind,
    exhibitLabel: row.exhibit_label,
    orderIndex: Number(row.order_index || 0),
    includeInMerged: Boolean(row.include_in_merged),
    status: row.status,
    pageCount: row.page_count == null ? null : Number(row.page_count),
    generationError: row.generation_error,
    sourceDocumentId: row.source_document_id,
    sourceUploadId: row.source_upload_id,
    metadata: row.metadata || {},
  }));
}

export async function replaceSection13BundleAssets(
  supabase: AdminClient,
  caseId: string,
  assets: Section13BundleAsset[]
): Promise<void> {
  await supabase.from('section13_bundle_assets').delete().eq('case_id', caseId);
  if (assets.length === 0) return;
  await supabase.from('section13_bundle_assets').insert(
    assets.map((asset) => ({
      case_id: caseId,
      rules_version: asset.rulesVersion,
      logical_section: asset.logicalSection,
      asset_type: asset.assetType,
      title: asset.title,
      source_kind: asset.sourceKind,
      exhibit_label: asset.exhibitLabel || null,
      order_index: asset.orderIndex,
      include_in_merged: asset.includeInMerged,
      status: asset.status,
      page_count: asset.pageCount ?? null,
      generation_error: asset.generationError ?? null,
      source_document_id: asset.sourceDocumentId ?? null,
      source_upload_id: asset.sourceUploadId ?? null,
      metadata: asset.metadata || {},
    })) as any
  );
}

export async function getSection13OutputSnapshotByOrderId(
  supabase: AdminClient,
  orderId: string
): Promise<Section13OutputSnapshot | null> {
  const { data, error } = await supabase
    .from('section13_output_snapshots')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();

  if (error) throw error;
  return data ? toOutputSnapshot(data) : null;
}

export async function getLatestSection13OutputSnapshot(
  supabase: AdminClient,
  caseId: string
): Promise<Section13OutputSnapshot | null> {
  const { data, error } = await supabase
    .from('section13_output_snapshots')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? toOutputSnapshot(data) : null;
}

export async function createSection13OutputSnapshot(
  supabase: AdminClient,
  snapshot: Section13OutputSnapshot
): Promise<Section13OutputSnapshot> {
  const { data, error } = await supabase
    .from('section13_output_snapshots')
    .insert({
      order_id: snapshot.orderId,
      case_id: snapshot.caseId,
      rules_version: snapshot.rulesVersion,
      form_asset_version: snapshot.formAssetVersion,
      form_asset_sha256: snapshot.formAssetSha256,
      state_snapshot_json: snapshot.stateSnapshot,
      preview_metrics_json: snapshot.previewMetrics,
      defensibility_summary_sentence: snapshot.defensibilitySummarySentence,
      justification_summary_text: snapshot.justificationSummaryText,
      justification_narrative_text: snapshot.justificationNarrativeText,
      comparable_snapshot_json: snapshot.comparableSnapshot,
    } as any)
    .select('*')
    .single();

  if (error || !data) {
    if (isSupabaseUniqueViolation(error)) {
      const existing = await getSection13OutputSnapshotByOrderId(supabase, snapshot.orderId);
      if (existing) {
        return existing;
      }
    }

    throw error || new Error('Unable to create Section 13 output snapshot');
  }

  return toOutputSnapshot(data);
}

export async function getSection13DocumentsForSnapshot(
  supabase: AdminClient,
  params: {
    caseId: string;
    outputSnapshotId: string;
    documentTypes?: readonly string[];
  }
): Promise<any[]> {
  const { caseId, outputSnapshotId, documentTypes } = params;

  let query = supabase
    .from('documents')
    .select('id, order_id, output_snapshot_id, document_title, document_type, pdf_url, metadata, created_at')
    .eq('case_id', caseId)
    .eq('is_preview', false)
    .eq('output_snapshot_id', outputSnapshotId)
    .order('created_at', { ascending: false });

  if (documentTypes && documentTypes.length > 0) {
    query = query.in('document_type', [...documentTypes]);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getSection13LatestBundleJob(
  supabase: AdminClient,
  caseId: string
): Promise<Section13BundleJob | null> {
  const { data, error } = await supabase
    .from('section13_bundle_jobs')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? toBundleJob(data) : null;
}

export async function getSection13ActiveBundleJob(
  supabase: AdminClient,
  caseId: string
): Promise<Section13BundleJob | null> {
  const { data, error } = await supabase
    .from('section13_bundle_jobs')
    .select('*')
    .eq('case_id', caseId)
    .in('status', ['queued', 'running'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? toBundleJob(data) : null;
}

export async function getSection13BundleJobByIdempotencyKey(
  supabase: AdminClient,
  caseId: string,
  idempotencyKey: string
): Promise<Section13BundleJob | null> {
  const { data, error } = await supabase
    .from('section13_bundle_jobs')
    .select('*')
    .eq('case_id', caseId)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (error) throw error;
  return data ? toBundleJob(data) : null;
}

export async function createSection13BundleJob(
  supabase: AdminClient,
  job: Section13BundleJob
): Promise<Section13BundleJob> {
  const { data, error } = await supabase
    .from('section13_bundle_jobs')
    .insert({
      case_id: job.caseId,
      order_id: job.orderId,
      output_snapshot_id: job.outputSnapshotId,
      idempotency_key: job.idempotencyKey,
      status: job.status,
      generation_mode: job.generationMode,
      attempt_count: job.attemptCount,
      max_attempts: job.maxAttempts,
      retry_after: job.retryAfter || null,
      started_at: job.startedAt || null,
      completed_at: job.completedAt || null,
      duration_ms: job.durationMs ?? null,
      peak_rss_mb: job.peakRssMb ?? null,
      warning_count: job.warningCount ?? 0,
      failure_type: job.failureType || null,
      error_message: job.errorMessage || null,
    } as any)
    .select('*')
    .single();

  if (error || !data) {
    throw error || new Error('Unable to create Section 13 bundle job');
  }

  return toBundleJob(data);
}

export async function createOrGetSection13BundleJob(
  supabase: AdminClient,
  job: Section13BundleJob
): Promise<Section13BundleJob> {
  const rpc = (supabase as any).rpc;

  if (typeof rpc === 'function') {
    const { data, error } = await rpc('section13_create_or_get_bundle_job', {
      p_case_id: job.caseId,
      p_order_id: job.orderId,
      p_output_snapshot_id: job.outputSnapshotId,
      p_idempotency_key: job.idempotencyKey,
      p_status: job.status,
      p_generation_mode: job.generationMode,
      p_attempt_count: job.attemptCount,
      p_max_attempts: job.maxAttempts,
      p_warning_count: job.warningCount ?? 0,
    });

    if (!error) {
      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        return toBundleJob(row);
      }

      const recovered = await recoverBundleJobAfterConflict(supabase, {
        caseId: job.caseId,
        idempotencyKey: job.idempotencyKey,
      });
      if (recovered) {
        return recovered;
      }
    } else if (
      isSupabaseUniqueViolation(error, SECTION13_BUNDLE_JOB_CONFLICT_CONSTRAINTS) ||
      isSupabaseUniqueViolation(error)
    ) {
      const recovered = await recoverBundleJobAfterConflict(supabase, {
        caseId: job.caseId,
        idempotencyKey: job.idempotencyKey,
      });
      if (recovered) {
        return recovered;
      }
    } else if (!isSupabaseFunctionMissing(error)) {
      throw error;
    }
  }

  try {
    return await createSection13BundleJob(supabase, job);
  } catch (error: any) {
    if (
      isSupabaseUniqueViolation(error, SECTION13_BUNDLE_JOB_CONFLICT_CONSTRAINTS) ||
      isSupabaseUniqueViolation(error)
    ) {
      const recovered = await recoverBundleJobAfterConflict(supabase, {
        caseId: job.caseId,
        idempotencyKey: job.idempotencyKey,
      });
      if (recovered) {
        return recovered;
      }
    }

    throw error;
  }
}

export async function claimSection13BundleJob(
  supabase: AdminClient,
  params: {
    jobId: string;
    allowedStatuses: Section13BundleJobStatus[];
    attemptCount: number;
    generationMode?: Section13BundleGenerationMode;
    startedAt: string;
    peakRssMb?: number | null;
  }
): Promise<Section13BundleJob | null> {
  const { jobId, allowedStatuses, attemptCount, generationMode, startedAt, peakRssMb } = params;

  let query = supabase
    .from('section13_bundle_jobs')
    .update({
      status: 'running',
      attempt_count: attemptCount,
      generation_mode: generationMode,
      started_at: startedAt,
      completed_at: null,
      duration_ms: null,
      peak_rss_mb: peakRssMb ?? null,
      warning_count: 0,
      failure_type: null,
      error_message: null,
      retry_after: null,
    } as any)
    .eq('id', jobId);

  if (allowedStatuses.length === 1) {
    query = query.eq('status', allowedStatuses[0]);
  } else {
    query = query.in('status', allowedStatuses as string[]);
  }

  const { data, error } = await query.select('*').maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toBundleJob(data) : null;
}

export async function updateSection13BundleJob(
  supabase: AdminClient,
  jobId: string,
  patch: Partial<{
    status: Section13BundleJobStatus;
    generationMode: Section13BundleGenerationMode;
    attemptCount: number;
    maxAttempts: number;
    retryAfter: string | null;
    startedAt: string | null;
    completedAt: string | null;
    durationMs: number | null;
    peakRssMb: number | null;
    warningCount: number | null;
    failureType: Section13BundleFailureType | null;
    errorMessage: string | null;
  }>
): Promise<Section13BundleJob> {
  const updatePayload: Record<string, unknown> = {};

  if (patch.status !== undefined) updatePayload.status = patch.status;
  if (patch.generationMode !== undefined) updatePayload.generation_mode = patch.generationMode;
  if (patch.attemptCount !== undefined) updatePayload.attempt_count = patch.attemptCount;
  if (patch.maxAttempts !== undefined) updatePayload.max_attempts = patch.maxAttempts;
  if (patch.retryAfter !== undefined) updatePayload.retry_after = patch.retryAfter;
  if (patch.startedAt !== undefined) updatePayload.started_at = patch.startedAt;
  if (patch.completedAt !== undefined) updatePayload.completed_at = patch.completedAt;
  if (patch.durationMs !== undefined) updatePayload.duration_ms = patch.durationMs;
  if (patch.peakRssMb !== undefined) updatePayload.peak_rss_mb = patch.peakRssMb;
  if (patch.warningCount !== undefined) updatePayload.warning_count = patch.warningCount;
  if (patch.failureType !== undefined) updatePayload.failure_type = patch.failureType;
  if (patch.errorMessage !== undefined) updatePayload.error_message = patch.errorMessage;

  const { data, error } = await supabase
    .from('section13_bundle_jobs')
    .update(updatePayload as any)
    .eq('id', jobId)
    .select('*')
    .single();

  if (error || !data) {
    throw error || new Error('Unable to update Section 13 bundle job');
  }

  return toBundleJob(data);
}

export async function getLatestSection13SupportRequest(
  supabase: AdminClient,
  caseId: string
): Promise<Section13SupportRequest | null> {
  const { data, error } = await supabase
    .from('section13_support_requests')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? toSupportRequest(data) : null;
}

export async function createSection13SupportRequest(
  supabase: AdminClient,
  request: Section13SupportRequest
): Promise<Section13SupportRequest> {
  const { data, error } = await supabase
    .from('section13_support_requests')
    .insert({
      case_id: request.caseId,
      latest_conversation_id: request.latestConversationId || null,
      handling_mode: request.handlingMode,
      intent_code: request.intentCode,
      blocked_reason: request.blockedReason || null,
      priority: request.priority,
      deadline_at: request.deadlineAt || null,
      status: request.status,
      assigned_to: request.assignedTo || null,
      metadata: request.metadata || {},
      resolved_at: request.resolvedAt || null,
    } as any)
    .select('*')
    .single();

  if (error || !data) {
    throw error || new Error('Unable to create Section 13 support request');
  }

  return toSupportRequest(data);
}

export async function updateSection13SupportRequest(
  supabase: AdminClient,
  requestId: string,
  patch: Partial<{
    latestConversationId: string | null;
    handlingMode: Section13SupportHandlingMode;
    intentCode: string;
    blockedReason: string | null;
    priority: Section13SupportPriority;
    deadlineAt: string | null;
    status: Section13SupportStatus;
    assignedTo: string | null;
    metadata: Record<string, unknown>;
    resolvedAt: string | null;
  }>
): Promise<Section13SupportRequest> {
  const updatePayload: Record<string, unknown> = {};

  if (patch.latestConversationId !== undefined) updatePayload.latest_conversation_id = patch.latestConversationId;
  if (patch.handlingMode !== undefined) updatePayload.handling_mode = patch.handlingMode;
  if (patch.intentCode !== undefined) updatePayload.intent_code = patch.intentCode;
  if (patch.blockedReason !== undefined) updatePayload.blocked_reason = patch.blockedReason;
  if (patch.priority !== undefined) updatePayload.priority = patch.priority;
  if (patch.deadlineAt !== undefined) updatePayload.deadline_at = patch.deadlineAt;
  if (patch.status !== undefined) updatePayload.status = patch.status;
  if (patch.assignedTo !== undefined) updatePayload.assigned_to = patch.assignedTo;
  if (patch.metadata !== undefined) updatePayload.metadata = patch.metadata;
  if (patch.resolvedAt !== undefined) updatePayload.resolved_at = patch.resolvedAt;

  const { data, error } = await supabase
    .from('section13_support_requests')
    .update(updatePayload as any)
    .eq('id', requestId)
    .select('*')
    .single();

  if (error || !data) {
    throw error || new Error('Unable to update Section 13 support request');
  }

  return toSupportRequest(data);
}

export function createSection13RecoveryToken(): {
  token: string;
  tokenHash: string;
} {
  const token = crypto.randomBytes(24).toString('hex');
  return {
    token,
    tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
  };
}

export function buildSection13EvidenceSetHash(
  uploads: Section13EvidenceUpload[]
): string {
  const payload = uploads
    .map((upload) => ({
      id: upload.id || null,
      fileName: upload.fileName,
      storagePath: upload.storagePath,
      byteSize: upload.byteSize,
      title: upload.title || null,
      exhibitLabel: upload.exhibitLabel || null,
      orderIndex: upload.orderIndex,
      uploadStatus: upload.uploadStatus,
    }))
    .sort((a, b) => {
      if (a.orderIndex !== b.orderIndex) {
        return a.orderIndex - b.orderIndex;
      }

      return a.fileName.localeCompare(b.fileName);
    });

  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export function buildSection13BundleJobIdempotencyKey(input: {
  caseId: string;
  orderId: string;
  outputSnapshotId: string;
  evidenceSetHash: string;
}): string {
  return crypto
    .createHash('sha256')
    .update(
      [
        input.caseId,
        input.orderId,
        input.outputSnapshotId,
        input.evidenceSetHash,
      ].join(':')
    )
    .digest('hex');
}

export function buildComparableFromPartial(
  input: Partial<Section13Comparable>,
  index: number
): Section13Comparable {
  const rawRentValue = Number(input.rawRentValue || 0);
  const rawRentFrequency = input.rawRentFrequency || 'pcm';
  const monthlyEquivalent =
    input.monthlyEquivalent ?? getMonthlyEquivalent(rawRentValue, rawRentFrequency);
  const weeklyEquivalent =
    input.weeklyEquivalent ?? getWeeklyEquivalent(rawRentValue, rawRentFrequency);
  const adjustments = (input.adjustments || []).map((adjustment, adjustmentIndex) => ({
    ...adjustment,
    sortOrder: adjustment.sortOrder ?? adjustmentIndex,
  }));
  const adjustedMonthlyEquivalent =
    input.adjustedMonthlyEquivalent ??
    Number((monthlyEquivalent + adjustments.reduce((sum, item) => sum + item.normalizedMonthlyDelta, 0)).toFixed(2));

  return {
    ...buildEmptyComparable(index),
    ...input,
    rawRentValue,
    rawRentFrequency,
    monthlyEquivalent: Number(monthlyEquivalent.toFixed(2)),
    weeklyEquivalent: Number(weeklyEquivalent.toFixed(2)),
    adjustedMonthlyEquivalent,
    adjustments,
    sourceDateKind: input.sourceDateKind || 'unknown',
    sortOrder: input.sortOrder ?? index,
    addressSnippet: input.addressSnippet || `Comparable ${index + 1}`,
    source: input.source || 'manual_unlinked',
    isManual: input.isManual ?? true,
    metadata: input.metadata || {},
  };
}

export function buildEmptyComparable(index = 0): Section13Comparable {
  return {
    source: 'manual_unlinked',
    sourceDateKind: 'unknown',
    addressSnippet: '',
    rawRentValue: 0,
    rawRentFrequency: 'pcm',
    monthlyEquivalent: 0,
    weeklyEquivalent: 0,
    adjustedMonthlyEquivalent: 0,
    isManual: true,
    sortOrder: index,
    adjustments: [],
    metadata: {},
  };
}

export function getDefaultSection13StateForCase(
  facts: Record<string, any> | null | undefined,
  product?: string | null
): Section13State {
  if (product === 'section13_defensive' || product === 'section13_standard') {
    return getSection13StateFromFacts(facts, product);
  }

  return getSection13StateFromFacts(facts, createEmptySection13State().selectedPlan);
}

export function deriveSection13WorkflowStatus(options: {
  explicit?: Section13WorkflowStatus;
  hasPreview?: boolean;
  awaitingPayment?: boolean;
}): Section13WorkflowStatus {
  if (options.explicit) {
    return options.explicit;
  }

  if (options.awaitingPayment) {
    return 'awaiting_payment';
  }

  if (options.hasPreview) {
    return 'preview_ready';
  }

  return 'draft';
}
