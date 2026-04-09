import { describe, expect, it, vi } from 'vitest';

import {
  createOrGetSection13BundleJob,
  createSection13OutputSnapshot,
  getSection13DocumentsForSnapshot,
} from '@/lib/section13/server';

function buildBundleJobRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'job-1',
    case_id: 'case-1',
    order_id: 'order-1',
    output_snapshot_id: 'snapshot-1',
    idempotency_key: 'idem-1',
    status: 'queued',
    generation_mode: 'sync',
    attempt_count: 1,
    max_attempts: 3,
    retry_after: null,
    started_at: null,
    completed_at: null,
    duration_ms: null,
    peak_rss_mb: null,
    warning_count: 0,
    failure_type: null,
    error_message: null,
    created_at: '2026-04-08T10:00:00.000Z',
    updated_at: '2026-04-08T10:00:00.000Z',
    ...overrides,
  };
}

function buildSnapshotRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'snapshot-1',
    order_id: 'order-1',
    case_id: 'case-1',
    rules_version: 'england_assured_section13_2026-05-01',
    form_asset_version: '2026-05-01',
    form_asset_sha256: 'abc123',
    state_snapshot_json: {},
    preview_metrics_json: {},
    defensibility_summary_sentence: 'Summary',
    justification_summary_text: 'Summary text',
    justification_narrative_text: 'Narrative text',
    comparable_snapshot_json: [],
    created_at: '2026-04-08T10:00:00.000Z',
    ...overrides,
  };
}

function createBundleJobSupabaseMock(existingRow = buildBundleJobRow()) {
  const maybeSingle = vi
    .fn()
    .mockResolvedValue({ data: existingRow, error: null });

  const selectBuilder: any = {
    eq: vi.fn(() => selectBuilder),
    in: vi.fn(() => selectBuilder),
    order: vi.fn(() => selectBuilder),
    limit: vi.fn(() => selectBuilder),
    maybeSingle,
  };

  const insertSingle = vi.fn().mockResolvedValue({
    data: null,
    error: { code: '23505', message: 'duplicate key value violates unique constraint' },
  });

  const from = vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: insertSingle,
      })),
    })),
    select: vi.fn(() => selectBuilder),
  }));

  return {
    supabase: { from } as any,
    maybeSingle,
    insertSingle,
  };
}

function createAtomicRpcSupabaseMock(
  seedRows: Array<Record<string, unknown>> = []
): {
  supabase: any;
  jobs: any[];
  rpc: ReturnType<typeof vi.fn>;
} {
  const jobs = seedRows.map((row) =>
    buildBundleJobRow({
      ...row,
      case_id: String(row.case_id || 'case-1'),
      order_id: String(row.order_id || 'order-1'),
      output_snapshot_id: String(row.output_snapshot_id || 'snapshot-1'),
      idempotency_key: String(row.idempotency_key || 'idem-seed'),
      status: String(row.status || 'queued'),
    })
  );

  let counter = jobs.length + 1;
  const rpc = vi.fn(async (fnName: string, args: Record<string, any>) => {
    if (fnName !== 'section13_create_or_get_bundle_job') {
      return { data: null, error: { code: '42883', message: 'function does not exist' } };
    }

    const caseId = String(args.p_case_id);
    const idempotencyKey = String(args.p_idempotency_key);
    const sameKey = [...jobs]
      .reverse()
      .find((job) => job.case_id === caseId && job.idempotency_key === idempotencyKey);
    if (sameKey) {
      return { data: sameKey, error: null };
    }

    const active = [...jobs]
      .reverse()
      .find(
        (job) =>
          job.case_id === caseId &&
          (job.status === 'queued' || job.status === 'running')
      );
    if (active) {
      return { data: active, error: null };
    }

    const created = buildBundleJobRow({
      id: `job-created-${counter++}`,
      case_id: caseId,
      order_id: String(args.p_order_id),
      output_snapshot_id: String(args.p_output_snapshot_id),
      idempotency_key: idempotencyKey,
      status: String(args.p_status || 'queued'),
      generation_mode: String(args.p_generation_mode || 'sync'),
      attempt_count: Number(args.p_attempt_count || 0),
      max_attempts: Number(args.p_max_attempts || 3),
      warning_count: Number(args.p_warning_count || 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    jobs.push(created);
    return { data: created, error: null };
  });

  return {
    supabase: { rpc, from: vi.fn() } as any,
    jobs,
    rpc,
  };
}

describe('section13 server helpers', () => {
  it('returns one job for concurrent create calls with the same idempotency key', async () => {
    const { supabase, jobs } = createAtomicRpcSupabaseMock();
    const jobInput = {
      caseId: 'case-1',
      orderId: 'order-1',
      outputSnapshotId: 'snapshot-1',
      status: 'queued' as const,
      generationMode: 'sync' as const,
      attemptCount: 0,
      maxAttempts: 3,
      warningCount: 0,
    };

    const [jobA, jobB] = await Promise.all([
      createOrGetSection13BundleJob(supabase, { ...jobInput, idempotencyKey: 'idem-same' }),
      createOrGetSection13BundleJob(supabase, { ...jobInput, idempotencyKey: 'idem-same' }),
    ]);

    expect(jobA.id).toBe(jobB.id);
    expect(jobs).toHaveLength(1);
  });

  it('returns the active job for concurrent create calls with different idempotency keys', async () => {
    const { supabase, jobs } = createAtomicRpcSupabaseMock();
    const jobInput = {
      caseId: 'case-1',
      orderId: 'order-1',
      outputSnapshotId: 'snapshot-1',
      status: 'queued' as const,
      generationMode: 'sync' as const,
      attemptCount: 0,
      maxAttempts: 3,
      warningCount: 0,
    };

    const [jobA, jobB] = await Promise.all([
      createOrGetSection13BundleJob(supabase, { ...jobInput, idempotencyKey: 'idem-a' }),
      createOrGetSection13BundleJob(supabase, { ...jobInput, idempotencyKey: 'idem-b' }),
    ]);

    expect(jobA.id).toBe(jobB.id);
    expect(jobs).toHaveLength(1);
  });

  it('creates a new job after prior job failed and no active job exists', async () => {
    const { supabase, jobs } = createAtomicRpcSupabaseMock([
      {
        id: 'job-failed-1',
        case_id: 'case-1',
        order_id: 'order-1',
        output_snapshot_id: 'snapshot-1',
        idempotency_key: 'idem-old',
        status: 'failed',
      },
    ]);

    const created = await createOrGetSection13BundleJob(supabase, {
      caseId: 'case-1',
      orderId: 'order-1',
      outputSnapshotId: 'snapshot-1',
      idempotencyKey: 'idem-new',
      status: 'queued',
      generationMode: 'sync',
      attemptCount: 0,
      maxAttempts: 3,
      warningCount: 0,
    });

    expect(created.id).not.toBe('job-failed-1');
    expect(created.status).toBe('queued');
    expect(jobs).toHaveLength(2);
  });

  it('does not create duplicate jobs for repeated requests with the same idempotency key', async () => {
    const { supabase, jobs } = createAtomicRpcSupabaseMock();
    const jobInput = {
      caseId: 'case-1',
      orderId: 'order-1',
      outputSnapshotId: 'snapshot-1',
      idempotencyKey: 'idem-repeat',
      status: 'queued' as const,
      generationMode: 'sync' as const,
      attemptCount: 0,
      maxAttempts: 3,
      warningCount: 0,
    };

    const first = await createOrGetSection13BundleJob(supabase, jobInput);
    const second = await createOrGetSection13BundleJob(supabase, jobInput);

    expect(first.id).toBe(second.id);
    expect(jobs).toHaveLength(1);
  });

  it('returns the existing bundle job after a concurrent idempotency conflict', async () => {
    const existingRow = buildBundleJobRow({
      id: 'job-existing',
      status: 'queued',
      attempt_count: 0,
    });
    const { supabase, maybeSingle, insertSingle } = createBundleJobSupabaseMock(existingRow);

    const result = await createOrGetSection13BundleJob(supabase, {
      caseId: 'case-1',
      orderId: 'order-1',
      outputSnapshotId: 'snapshot-1',
      idempotencyKey: 'idem-1',
      status: 'queued',
      generationMode: 'sync',
      attemptCount: 0,
      maxAttempts: 3,
      warningCount: 0,
    });

    expect(insertSingle).toHaveBeenCalledTimes(1);
    expect(maybeSingle.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(result.id).toBe('job-existing');
    expect(result.idempotencyKey).toBe('idem-1');
  });

  it('returns the existing output snapshot after a duplicate-order conflict', async () => {
    const existingRow = buildSnapshotRow({ id: 'snapshot-existing' });
    const maybeSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: existingRow, error: null });

    const selectBuilder: any = {
      eq: vi.fn(() => selectBuilder),
      maybeSingle,
    };

    const insertSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate key value violates unique constraint' },
    });

    const supabase: any = {
      from: vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: insertSingle,
          })),
        })),
        select: vi.fn(() => selectBuilder),
      })),
    };

    const result = await createSection13OutputSnapshot(supabase, {
      orderId: 'order-1',
      caseId: 'case-1',
      rulesVersion: 'england_assured_section13_2026-05-01',
      formAssetVersion: '2026-05-01',
      formAssetSha256: 'abc123',
      stateSnapshot: {} as any,
      previewMetrics: {} as any,
      defensibilitySummarySentence: 'Summary',
      justificationSummaryText: 'Summary text',
      justificationNarrativeText: 'Narrative text',
      comparableSnapshot: [],
    });

    expect(insertSingle).toHaveBeenCalledTimes(1);
    expect(maybeSingle).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('snapshot-existing');
  });

  it('filters persisted source documents by output_snapshot_id', async () => {
    const eqCalls: Array<[string, unknown]> = [];
    const queryResult = [
      {
        id: 'doc-1',
        output_snapshot_id: 'snapshot-2',
        document_type: 'section13_form_4a',
        document_title: 'Form 4A',
        pdf_url: 'https://example.com/form-4a.pdf',
        metadata: {},
        created_at: '2026-04-08T10:00:00.000Z',
      },
    ];

    const query: any = {
      eq: vi.fn((column: string, value: unknown) => {
        eqCalls.push([column, value]);
        return query;
      }),
      order: vi.fn(() => query),
      in: vi.fn(() => query),
      then: (resolve: (value: any) => void) => resolve({ data: queryResult, error: null }),
    };

    const supabase: any = {
      from: vi.fn(() => ({
        select: vi.fn(() => query),
      })),
    };

    const rows = await getSection13DocumentsForSnapshot(supabase, {
      caseId: 'case-1',
      outputSnapshotId: 'snapshot-2',
      documentTypes: ['section13_form_4a'],
    });

    expect(rows).toHaveLength(1);
    expect(eqCalls).toContainEqual(['case_id', 'case-1']);
    expect(eqCalls).toContainEqual(['is_preview', false]);
    expect(eqCalls).toContainEqual(['output_snapshot_id', 'snapshot-2']);
  });
});
