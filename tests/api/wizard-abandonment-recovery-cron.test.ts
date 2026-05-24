import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const MOCK_CRON_SECRET = 'test-cron-secret';

let mockCases: any[] = [];
let mockOrders: any[] = [];
let mockDocuments: any[] = [];
let mockUsers: any[] = [];
let mockEvents: any[] = [];
let sentEmails: any[] = [];
let insertedEmailEvents: any[] = [];

function casesBuilder() {
  const builder: any = {
    select: vi.fn(() => builder),
    lte: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => Promise.resolve({ data: mockCases, error: null })),
  };
  return builder;
}

function ordersBuilder() {
  const builder: any = {
    select: vi.fn(() => builder),
    in: vi.fn(() => builder),
    order: vi.fn(() => Promise.resolve({ data: mockOrders, error: null })),
  };
  return builder;
}

function documentsBuilder() {
  const builder: any = {
    select: vi.fn(() => builder),
    in: vi.fn(() => Promise.resolve({ data: mockDocuments, error: null })),
  };
  return builder;
}

function usersBuilder() {
  const builder: any = {
    select: vi.fn(() => builder),
    in: vi.fn(() => Promise.resolve({ data: mockUsers, error: null })),
  };
  return builder;
}

function emailEventsBuilder() {
  const builder: any = {
    select: vi.fn(() => builder),
    in: vi.fn(() => builder),
    gte: vi.fn(() => Promise.resolve({ data: mockEvents, error: null })),
    insert: vi.fn((payload: any) => {
      insertedEmailEvents.push(payload);
      return Promise.resolve({ data: null, error: null });
    }),
  };
  return builder;
}

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'cases') return casesBuilder();
      if (table === 'orders') return ordersBuilder();
      if (table === 'documents') return documentsBuilder();
      if (table === 'users') return usersBuilder();
      if (table === 'email_events') return emailEventsBuilder();
      throw new Error(`Unexpected table ${table}`);
    }),
  })),
}));

vi.mock('@/lib/cases/recovery-server', () => ({
  createCaseRecoveryLink: vi.fn((params: any) =>
    Promise.resolve({
      resumeUrl: `https://landlordheaven.co.uk/wizard/flow?case_id=${params.caseRow.id}&recovery_token=test-token`,
      productType: 'notice_only',
      productName: 'Stage 1 Notice Pack',
    })
  ),
}));

vi.mock('@/lib/email/resend', () => ({
  sendWizardAbandonmentRecoveryEmail: vi.fn((params: any) => {
    sentEmails.push(params);
    return Promise.resolve({ success: true });
  }),
}));

vi.mock('@/lib/validation/cron-run-tracker', () => ({
  startCronRun: vi.fn(() =>
    Promise.resolve({
      id: 'wizard-recovery-run-id',
      jobName: 'wizard:recover-incomplete',
      startedAt: new Date().toISOString(),
      status: 'running',
      sourcesChecked: 0,
      eventsCreated: 0,
      eventsUpdated: 0,
      errors: [],
      warnings: [],
      summary: '',
      triggeredBy: 'cron',
    })
  ),
  completeCronRun: vi.fn(() => Promise.resolve(undefined)),
}));

function request(url: string, headers: Record<string, string> = {}) {
  return new NextRequest(url, { method: 'GET', headers });
}

function incompleteCase(overrides: Record<string, any> = {}) {
  return {
    id: 'case-1',
    user_id: null,
    case_type: 'eviction',
    jurisdiction: 'england',
    status: 'in_progress',
    workflow_status: 'draft',
    wizard_progress: 35,
    wizard_completed_at: null,
    collected_facts: {
      __meta: { product: 'notice_only' },
      landlord_email: 'alex@example.com',
      landlord_full_name: 'Alex Landlord',
      property_address_line1: '1 Test Street',
    },
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

describe('wizard abandonment recovery cron', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.CRON_SECRET = MOCK_CRON_SECRET;
    mockCases = [];
    mockOrders = [];
    mockDocuments = [];
    mockUsers = [];
    mockEvents = [];
    sentEmails = [];
    insertedEmailEvents = [];
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
    vi.clearAllMocks();
  });

  it('sends day-1 continuation email for a started incomplete case', async () => {
    mockCases = [incompleteCase({ updated_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString() })];

    const { GET } = await import('@/app/api/cron/wizard-abandonment-recovery/route');
    const response = await GET(
      request('http://localhost/api/cron/wizard-abandonment-recovery', {
        authorization: `Bearer ${MOCK_CRON_SECRET}`,
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.emails_sent).toBe(1);
    expect(sentEmails[0]).toEqual(expect.objectContaining({ to: 'alex@example.com', stage: 'day_1' }));
    expect(insertedEmailEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ event_type: 'case_wizard_recovery_day_1_attempted' }),
        expect.objectContaining({ event_type: 'case_wizard_recovery_day_1_sent' }),
      ])
    );
  });

  it('does not resend day-1 when a legacy email-only day-1 event exists', async () => {
    mockCases = [incompleteCase({ updated_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString() })];
    mockEvents = [
      {
        email: 'alex@example.com',
        event_type: 'case_wizard_recovery_day_1_sent',
        event_data: { status: 'sent' },
      },
    ];

    const { GET } = await import('@/app/api/cron/wizard-abandonment-recovery/route');
    const response = await GET(
      request('http://localhost/api/cron/wizard-abandonment-recovery', {
        authorization: `Bearer ${MOCK_CRON_SECRET}`,
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.emails_sent).toBe(0);
    expect(sentEmails).toEqual([]);
    expect(insertedEmailEvents).toEqual([]);
  });

  it('does not resend day-3 when the case id was stored as caseId', async () => {
    mockCases = [incompleteCase()];
    mockEvents = [
      {
        email: 'alex@example.com',
        event_type: 'case_wizard_recovery_day_1_sent',
        event_data: { case_id: 'case-1' },
      },
      {
        email: 'alex@example.com',
        event_type: 'case_wizard_recovery_day_3_sent',
        event_data: { caseId: 'case-1' },
      },
    ];

    const { GET } = await import('@/app/api/cron/wizard-abandonment-recovery/route');
    const response = await GET(
      request('http://localhost/api/cron/wizard-abandonment-recovery', {
        authorization: `Bearer ${MOCK_CRON_SECRET}`,
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.emails_sent).toBe(0);
    expect(sentEmails).toEqual([]);
    expect(insertedEmailEvents).toEqual([]);
  });

  it('skips incomplete wizard recovery when a fresh pending checkout can handle the sales nudge', async () => {
    mockCases = [incompleteCase({ updated_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString() })];
    mockOrders = [
      {
        id: 'order-1',
        case_id: 'case-1',
        user_id: 'user-1',
        product_type: 'notice_only',
        payment_status: 'pending',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const { GET } = await import('@/app/api/cron/wizard-abandonment-recovery/route');
    const response = await GET(
      request('http://localhost/api/cron/wizard-abandonment-recovery', {
        authorization: `Bearer ${MOCK_CRON_SECRET}`,
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.emails_sent).toBe(0);
    expect(sentEmails).toEqual([]);
    expect(insertedEmailEvents).toEqual([]);
  });
});
