import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

const MOCK_CRON_SECRET = 'test-cron-secret';

let mockCandidateRows: Array<{ id: string }> = [];
let mockOrderRows: Array<{ case_id: string | null }> = [];
let deletedIds: string[] = [];
let caseQueryFilters: Array<[string, unknown]> = [];
let cronStarted = false;
let cronCompleted: Array<{ status: string; summary: string; metrics?: unknown }> = [];

function createCasesBuilder() {
  const builder: any = {
    select: vi.fn(() => builder),
    is: vi.fn((field: string, value: unknown) => {
      caseQueryFilters.push([field, value]);
      return builder;
    }),
    in: vi.fn((field: string, value: unknown) => {
      caseQueryFilters.push([field, value]);
      return builder;
    }),
    lt: vi.fn((field: string, value: unknown) => {
      caseQueryFilters.push([field, value]);
      return builder;
    }),
    order: vi.fn(() => builder),
    limit: vi.fn(() => Promise.resolve({ data: mockCandidateRows, error: null })),
    delete: vi.fn(() => ({
      in: vi.fn((_field: string, ids: string[]) => ({
        select: vi.fn(() => {
          deletedIds = ids;
          return Promise.resolve({ data: ids.map((id) => ({ id })), error: null });
        }),
      })),
    })),
  };
  return builder;
}

function createOrdersBuilder() {
  const builder: any = {
    select: vi.fn(() => builder),
    in: vi.fn(() => Promise.resolve({ data: mockOrderRows, error: null })),
  };
  return builder;
}

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'cases') return createCasesBuilder();
      if (table === 'orders') return createOrdersBuilder();
      throw new Error(`Unexpected table ${table}`);
    }),
  })),
}));

vi.mock('@/lib/validation/cron-run-tracker', () => ({
  startCronRun: vi.fn(() => {
    cronStarted = true;
    return Promise.resolve({
      id: 'cleanup-run-id',
      jobName: 'cases:cleanup-stale-unclaimed',
      startedAt: new Date().toISOString(),
      status: 'running',
      sourcesChecked: 0,
      eventsCreated: 0,
      eventsUpdated: 0,
      errors: [],
      warnings: [],
      summary: '',
      triggeredBy: 'cron',
    });
  }),
  completeCronRun: vi.fn((_id: string, status: string, summary: string, metrics?: unknown) => {
    cronCompleted.push({ status, summary, metrics });
    return Promise.resolve(undefined);
  }),
}));

function request(url: string, headers: Record<string, string> = {}) {
  return new NextRequest(url, { method: 'GET', headers });
}

describe('stale cases cleanup cron', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.CRON_SECRET = MOCK_CRON_SECRET;
    mockCandidateRows = [];
    mockOrderRows = [];
    deletedIds = [];
    caseQueryFilters = [];
    cronStarted = false;
    cronCompleted = [];
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
    vi.clearAllMocks();
  });

  it('returns a health check without auth and does not execute cleanup', async () => {
    const { GET } = await import('@/app/api/cron/stale-cases-cleanup/route');

    const response = await GET(request('http://localhost/api/cron/stale-cases-cleanup'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.job).toBe('cases:cleanup-stale-unclaimed');
    expect(data.retention_days).toBe(14);
    expect(cronStarted).toBe(false);
  });

  it('rejects unauthenticated cron execution', async () => {
    const { GET } = await import('@/app/api/cron/stale-cases-cleanup/route');

    const response = await GET(
      request('http://localhost/api/cron/stale-cases-cleanup', {
        authorization: 'Bearer wrong-secret',
      })
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(cronStarted).toBe(false);
  });

  it('deletes only stale anonymous cases that have no linked orders', async () => {
    mockCandidateRows = [{ id: 'case-a' }, { id: 'case-b' }, { id: 'case-c' }];
    mockOrderRows = [{ case_id: 'case-b' }];

    const { GET } = await import('@/app/api/cron/stale-cases-cleanup/route');
    const response = await GET(
      request('http://localhost/api/cron/stale-cases-cleanup', {
        authorization: `Bearer ${MOCK_CRON_SECRET}`,
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.retention_days).toBe(14);
    expect(data.candidates_checked).toBe(3);
    expect(data.skipped_with_orders).toBe(1);
    expect(data.cases_deleted).toBe(2);
    expect(deletedIds).toEqual(['case-a', 'case-c']);
    expect(caseQueryFilters).toContainEqual(['user_id', null]);
    expect(caseQueryFilters).toContainEqual(['status', ['in_progress', 'completed']]);
    expect(cronCompleted[0].status).toBe('success');
  });

  it('supports dry runs without deleting matching cases', async () => {
    mockCandidateRows = [{ id: 'case-a' }];
    mockOrderRows = [];

    const { GET } = await import('@/app/api/cron/stale-cases-cleanup/route');
    const response = await GET(
      request('http://localhost/api/cron/stale-cases-cleanup?dry_run=1', {
        authorization: `Bearer ${MOCK_CRON_SECRET}`,
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.dry_run).toBe(true);
    expect(data.cases_deleted).toBe(0);
    expect(data.cases_would_delete).toBe(1);
    expect(deletedIds).toEqual([]);
  });
});
