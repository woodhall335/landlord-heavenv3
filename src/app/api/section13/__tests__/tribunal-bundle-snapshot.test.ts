import { beforeEach, describe, expect, it, vi } from 'vitest';

const caseId = '11111111-1111-1111-1111-111111111111';
const orderId = '22222222-2222-2222-2222-222222222222';
const snapshotId = '33333333-3333-3333-3333-333333333333';

const mockCaseRow = {
  id: caseId,
  user_id: 'user-1',
  session_token: null,
  case_type: 'rent_increase',
  workflow_status: 'fulfilled',
  collected_facts: {},
};

const mockPaidOrder = {
  id: orderId,
  product_type: 'section13_defensive',
  payment_status: 'paid',
  user_id: 'user-1',
};

const mockSnapshot = {
  id: snapshotId,
  orderId,
  caseId,
  rulesVersion: 'england_assured_section13_2026-05-01',
  formAssetVersion: 'england_form_4a_2026-05-01_v1',
  formAssetSha256: 'abc123',
  stateSnapshot: {
    rulesVersion: 'england_assured_section13_2026-05-01',
    selectedPlan: 'section13_defensive',
    tenancy: {},
    landlord: {},
    proposal: {},
    comparablesMeta: {},
    adjustments: {},
    includedCharges: [],
  },
  previewMetrics: {},
  defensibilitySummarySentence: 'Summary',
  justificationSummaryText: 'Summary',
  justificationNarrativeText: 'Narrative',
  comparableSnapshot: [],
};

const mocks = vi.hoisted(() => ({
  generateSection13CoreDocuments: vi.fn(),
  createOrGetSection13BundleJob: vi.fn(),
  claimSection13BundleJob: vi.fn(),
  getSection13ActiveBundleJob: vi.fn(),
  getSection13BundleJobByIdempotencyKey: vi.fn(),
  getSection13DocumentsForSnapshot: vi.fn(),
  generateSection13TribunalBundle: vi.fn(),
  replaceSection13BundleAssets: vi.fn(),
  updateSection13BundleJob: vi.fn(),
  getSection13BundleAssets: vi.fn(),
  getSection13LatestBundleJob: vi.fn(),
  getSection13EvidenceUploads: vi.fn(),
}));

function createQuery(table: string) {
  const builder: any = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: () => builder,
    single: async () => {
      if (table === 'cases') {
        return { data: mockCaseRow, error: null };
      }

      return { data: null, error: null };
    },
    maybeSingle: async () => {
      if (table === 'orders') {
        return { data: mockPaidOrder, error: null };
      }

      return { data: null, error: null };
    },
    update: () => ({
      eq: async () => ({ data: null, error: null }),
    }),
    upsert: async () => ({ data: null, error: null }),
  };

  return builder;
}

vi.mock('@/lib/auth/case-access', () => ({
  assertCaseWriteAccess: vi.fn(() => null),
}));

vi.mock('@/lib/supabase/server', () => ({
  getServerUser: vi.fn(async () => ({ id: 'user-1' })),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: vi.fn(() => ({
    from: (table: string) => createQuery(table),
    storage: {
      from: () => ({
        download: async () => ({
          data: new Blob([new Uint8Array([1, 2, 3])], { type: 'application/pdf' }),
          error: null,
        }),
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/bundle.pdf' } }),
      }),
    },
  })),
  logSupabaseAdminDiagnostics: vi.fn(),
}));

vi.mock('@/lib/documents/section13-generator', () => ({
  SECTION13_BUNDLE_SOURCE_DOCUMENT_TYPES: ['section13_form_4a'],
  generateSection13CoreDocuments: mocks.generateSection13CoreDocuments,
  generateSection13TribunalBundle: mocks.generateSection13TribunalBundle,
  getSection13Form4AAssetMetadata: vi.fn(async () => ({
    version: 'england_form_4a_2026-05-01_v1',
    sha256: 'abc123',
  })),
}));

vi.mock('@/lib/section13/server', () => ({
  buildSection13BundleJobIdempotencyKey: vi.fn(() => 'derived-idempotency-key'),
  buildSection13EvidenceSetHash: vi.fn(() => 'evidence-hash'),
  claimSection13BundleJob: mocks.claimSection13BundleJob,
  createOrGetSection13BundleJob: mocks.createOrGetSection13BundleJob,
  createSection13OutputSnapshot: vi.fn(),
  getDefaultSection13StateForCase: vi.fn(),
  getSection13ActiveBundleJob: mocks.getSection13ActiveBundleJob,
  getSection13BundleAssets: mocks.getSection13BundleAssets,
  getSection13BundleJobByIdempotencyKey: mocks.getSection13BundleJobByIdempotencyKey,
  getSection13Comparables: vi.fn(async () => []),
  getSection13DocumentsForSnapshot: mocks.getSection13DocumentsForSnapshot,
  getSection13EvidenceUploads: mocks.getSection13EvidenceUploads,
  getSection13LatestBundleJob: mocks.getSection13LatestBundleJob,
  getSection13OutputSnapshotByOrderId: vi.fn(async () => mockSnapshot),
  replaceSection13BundleAssets: mocks.replaceSection13BundleAssets,
  updateSection13BundleJob: mocks.updateSection13BundleJob,
}));

vi.mock('@/lib/section13/rules', () => ({
  buildSection13JustificationSummaryText: vi.fn(() => 'Summary'),
  computeSection13Preview: vi.fn(() => ({})),
}));

import { POST as postTribunalBundle } from '../tribunal-bundle/route';

describe('Section 13 tribunal bundle snapshot scoping', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.createOrGetSection13BundleJob.mockResolvedValue({
      id: 'job-1',
      caseId,
      orderId,
      outputSnapshotId: snapshotId,
      idempotencyKey: 'derived-idempotency-key',
      status: 'queued',
      generationMode: 'sync',
      attemptCount: 0,
      maxAttempts: 3,
      warningCount: 0,
    });
    mocks.claimSection13BundleJob.mockResolvedValue({
      id: 'job-1',
      caseId,
      orderId,
      outputSnapshotId: snapshotId,
      idempotencyKey: 'derived-idempotency-key',
      status: 'running',
      generationMode: 'sync',
      attemptCount: 1,
      maxAttempts: 3,
      warningCount: 0,
    });
    mocks.getSection13BundleJobByIdempotencyKey.mockResolvedValue(null);
    mocks.getSection13ActiveBundleJob.mockResolvedValue(null);
    mocks.getSection13EvidenceUploads.mockResolvedValue([]);
    mocks.generateSection13CoreDocuments.mockResolvedValue([]);
    mocks.getSection13DocumentsForSnapshot.mockResolvedValue([
      {
        id: 'doc-1',
        order_id: orderId,
        output_snapshot_id: snapshotId,
        document_type: 'section13_form_4a',
        document_title: 'Form 4A',
        pdf_url: 'https://example.com/documents/user-1/case-1/snapshot/form-4a.pdf',
        metadata: {},
        created_at: '2026-04-09T10:00:00.000Z',
      },
    ]);
    mocks.generateSection13TribunalBundle.mockResolvedValue({
      documents: [],
      bundleAssets: [],
      workflowStatus: 'bundle_ready',
      bundleWarnings: [],
    });
    mocks.getSection13BundleAssets.mockResolvedValue([]);
    mocks.getSection13LatestBundleJob.mockResolvedValue({
      id: 'job-1',
      caseId,
      orderId,
      outputSnapshotId: snapshotId,
      status: 'succeeded',
      idempotencyKey: 'derived-idempotency-key',
      generationMode: 'sync',
      attemptCount: 1,
      maxAttempts: 3,
      warningCount: 0,
    });
    mocks.updateSection13BundleJob.mockImplementation(async (_supabase: unknown, _jobId: string, updates: Record<string, unknown>) => ({
      id: 'job-1',
      caseId,
      orderId,
      outputSnapshotId: snapshotId,
      status: updates.status || 'succeeded',
      idempotencyKey: 'derived-idempotency-key',
      generationMode: 'sync',
      attemptCount: 1,
      maxAttempts: 3,
      warningCount: 0,
    }));
    mocks.replaceSection13BundleAssets.mockResolvedValue(undefined);
  });

  it('loads bundle source documents using the active output snapshot id', async () => {
    const response = await postTribunalBundle(
      new Request('http://localhost/api/section13/tribunal-bundle', {
        method: 'POST',
        body: JSON.stringify({ caseId }),
        headers: { 'Content-Type': 'application/json' },
      })
    );

    expect(response.status).toBe(200);
    expect(mocks.getSection13DocumentsForSnapshot).toHaveBeenCalledWith(expect.anything(), {
      caseId,
      outputSnapshotId: snapshotId,
      documentTypes: ['section13_form_4a'],
    });

    expect(mocks.generateSection13TribunalBundle).toHaveBeenCalledWith(
      expect.objectContaining({
        caseId,
        snapshot: mockSnapshot,
      })
    );

    expect(mocks.generateSection13CoreDocuments).toHaveBeenCalledWith(
      expect.objectContaining({
        caseId,
        productType: 'section13_defensive',
        state: mockSnapshot.stateSnapshot,
        comparables: mockSnapshot.comparableSnapshot,
        snapshot: mockSnapshot,
      })
    );
  });

  it('handles same-key concurrent POST requests without duplicate bundle generation', async () => {
    let claimed = false;
    const sharedJob = {
      id: 'job-shared',
      caseId,
      orderId,
      outputSnapshotId: snapshotId,
      idempotencyKey: 'same-key',
      status: 'queued',
      generationMode: 'sync',
      attemptCount: 0,
      maxAttempts: 3,
      warningCount: 0,
    };

    mocks.createOrGetSection13BundleJob.mockImplementation(async () => sharedJob);
    mocks.claimSection13BundleJob.mockImplementation(async () => {
      if (claimed) {
        return null;
      }
      claimed = true;
      return {
        ...sharedJob,
        status: 'running',
        attemptCount: 1,
      };
    });
    mocks.getSection13ActiveBundleJob.mockImplementation(async () =>
      claimed
        ? {
            ...sharedJob,
            status: 'running',
            attemptCount: 1,
          }
        : null
    );
    mocks.generateSection13TribunalBundle.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 25));
      return {
        documents: [],
        bundleAssets: [],
        workflowStatus: 'bundle_ready',
        bundleWarnings: [],
      };
    });

    const [responseA, responseB] = await Promise.all([
      postTribunalBundle(
        new Request('http://localhost/api/section13/tribunal-bundle', {
          method: 'POST',
          body: JSON.stringify({ caseId, idempotencyKey: 'same-key' }),
          headers: { 'Content-Type': 'application/json' },
        })
      ),
      postTribunalBundle(
        new Request('http://localhost/api/section13/tribunal-bundle', {
          method: 'POST',
          body: JSON.stringify({ caseId, idempotencyKey: 'same-key' }),
          headers: { 'Content-Type': 'application/json' },
        })
      ),
    ]);

    expect(responseA.status).toBe(200);
    expect(responseB.status).toBe(200);
    expect(mocks.generateSection13TribunalBundle).toHaveBeenCalledTimes(1);
  });

  it('handles different-key concurrent POST requests by reusing the active job', async () => {
    const sharedJob = {
      id: 'job-active',
      caseId,
      orderId,
      outputSnapshotId: snapshotId,
      idempotencyKey: 'key-alpha',
      status: 'queued',
      generationMode: 'sync',
      attemptCount: 0,
      maxAttempts: 3,
      warningCount: 0,
    };

    mocks.createOrGetSection13BundleJob.mockImplementation(async (_supabase: unknown, job: Record<string, any>) => {
      if (job.idempotencyKey === 'key-bravo') {
        return {
          ...sharedJob,
          idempotencyKey: 'key-alpha',
          status: 'running',
          attemptCount: 1,
        };
      }
      return sharedJob;
    });
    mocks.claimSection13BundleJob.mockResolvedValue({
      ...sharedJob,
      status: 'running',
      attemptCount: 1,
    });

    const [responseA, responseB] = await Promise.all([
      postTribunalBundle(
        new Request('http://localhost/api/section13/tribunal-bundle', {
          method: 'POST',
          body: JSON.stringify({ caseId, idempotencyKey: 'key-alpha' }),
          headers: { 'Content-Type': 'application/json' },
        })
      ),
      postTribunalBundle(
        new Request('http://localhost/api/section13/tribunal-bundle', {
          method: 'POST',
          body: JSON.stringify({ caseId, idempotencyKey: 'key-bravo' }),
          headers: { 'Content-Type': 'application/json' },
        })
      ),
    ]);

    expect(responseA.status).toBe(200);
    expect(responseB.status).toBe(200);
    expect(mocks.generateSection13TribunalBundle).toHaveBeenCalledTimes(1);
  });

  it('returns a non-500 response when create-or-get hits a unique conflict', async () => {
    mocks.createOrGetSection13BundleJob.mockRejectedValueOnce({
      code: '23505',
      message: 'duplicate key value violates unique constraint',
    });
    mocks.getSection13BundleJobByIdempotencyKey.mockResolvedValue({
      id: 'job-existing',
      caseId,
      orderId,
      outputSnapshotId: snapshotId,
      idempotencyKey: 'derived-idempotency-key',
      status: 'running',
      generationMode: 'sync',
      attemptCount: 1,
      maxAttempts: 3,
      warningCount: 0,
    });

    const response = await postTribunalBundle(
      new Request('http://localhost/api/section13/tribunal-bundle', {
        method: 'POST',
        body: JSON.stringify({ caseId }),
        headers: { 'Content-Type': 'application/json' },
      })
    );

    expect(response.status).toBe(200);
    expect(mocks.generateSection13TribunalBundle).not.toHaveBeenCalled();
  });
});
