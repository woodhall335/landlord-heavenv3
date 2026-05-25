import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const MOCK_CRON_SECRET = 'test-cron-secret';

let mockCheckoutOrders: any[] = [];
let mockCaseOrders: any[] = [];
let mockCases: any[] = [];
let mockDocuments: any[] = [];
let mockUsers: any[] = [];
let mockCheckoutEvents: any[] = [];
let mockCaseEvents: any[] = [];
let insertedEmailEvents: any[] = [];
let checkoutEmails: any[] = [];
let previewEmails: any[] = [];
let wizardEmails: any[] = [];

function ordersBuilder() {
  const ordersForThisCall = ordersBuilder.calls === 0 ? mockCheckoutOrders : mockCaseOrders;
  ordersBuilder.calls += 1;

  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    not: vi.fn(() => builder),
    lte: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    in: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => Promise.resolve({ data: ordersForThisCall, error: null })),
  };

  return builder;
}
ordersBuilder.calls = 0;

function casesBuilder() {
  const builder: any = {
    select: vi.fn(() => builder),
    lte: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => Promise.resolve({ data: mockCases, error: null })),
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
  const selectData = emailEventsBuilder.selectCalls === 0 ? mockCheckoutEvents : mockCaseEvents;

  const builder: any = {
    select: vi.fn(() => {
      emailEventsBuilder.selectCalls += 1;
      return builder;
    }),
    eq: vi.fn(() => builder),
    in: vi.fn(() => builder),
    gte: vi.fn(() => Promise.resolve({ data: selectData, error: null })),
    limit: vi.fn(() => Promise.resolve({ data: selectData, error: null })),
    insert: vi.fn((payload: any) => {
      insertedEmailEvents.push(payload);
      return Promise.resolve({ data: null, error: null });
    }),
  };

  return builder;
}
emailEventsBuilder.selectCalls = 0;

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'orders') return ordersBuilder();
      if (table === 'cases') return casesBuilder();
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
  sendAbandonedCheckoutRecoveryEmail: vi.fn((params: any) => {
    checkoutEmails.push(params);
    return Promise.resolve({ success: true });
  }),
  sendCasePreviewRecoveryEmail: vi.fn((params: any) => {
    previewEmails.push(params);
    return Promise.resolve({ success: true });
  }),
  sendWizardAbandonmentRecoveryEmail: vi.fn((params: any) => {
    wizardEmails.push(params);
    return Promise.resolve({ success: true });
  }),
}));

vi.mock('@/lib/validation/cron-run-tracker', () => ({
  startCronRun: vi.fn(() =>
    Promise.resolve({
      id: 'recovery-orchestrator-run-id',
      jobName: 'recovery:orchestrate',
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

function previewCase(overrides: Record<string, any> = {}) {
  return {
    id: 'case-1',
    user_id: null,
    case_type: 'eviction',
    jurisdiction: 'england',
    status: 'in_progress',
    workflow_status: 'preview_ready',
    wizard_progress: 95,
    wizard_completed_at: null,
    collected_facts: {
      __meta: { product: 'notice_only' },
      landlord_email: 'alex@example.com',
      landlord_full_name: 'Alex Landlord',
    },
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

describe('recovery orchestrator cron', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.CRON_SECRET = MOCK_CRON_SECRET;
    ordersBuilder.calls = 0;
    emailEventsBuilder.selectCalls = 0;
    mockCheckoutOrders = [];
    mockCaseOrders = [];
    mockCases = [];
    mockDocuments = [];
    mockUsers = [];
    mockCheckoutEvents = [];
    mockCaseEvents = [];
    insertedEmailEvents = [];
    checkoutEmails = [];
    previewEmails = [];
    wizardEmails = [];
  });

  it('reports the unified recovery priority in the health check', async () => {
    const { GET } = await import('@/app/api/cron/recovery-orchestrator/route');
    const response = await GET(request('http://localhost/api/cron/recovery-orchestrator'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.job).toBe('recovery:orchestrate');
    expect(data.priority).toEqual(['checkout_started', 'preview_reached', 'draft_started']);
  });

  it('sends checkout recovery first and suppresses lower-intent recovery for the same customer', async () => {
    mockCheckoutOrders = [
      {
        id: 'order-1',
        user_id: 'user-1',
        case_id: 'case-1',
        product_type: 'notice_only',
        product_name: 'Notice Pack',
        total_amount: 49,
        payment_status: 'pending',
        stripe_checkout_url: 'https://checkout.example/session',
        stripe_session_id: 'cs_123',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];
    mockCases = [previewCase()];
    mockCaseOrders = [mockCheckoutOrders[0]];
    mockUsers = [{ id: 'user-1', email: 'alex@example.com', full_name: 'Alex Landlord' }];

    const { GET } = await import('@/app/api/cron/recovery-orchestrator/route');
    const response = await GET(
      request('http://localhost/api/cron/recovery-orchestrator', {
        authorization: `Bearer ${MOCK_CRON_SECRET}`,
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.emails_sent).toBe(1);
    expect(data.checkout_sent_order_ids).toEqual(['order-1']);
    expect(checkoutEmails).toHaveLength(1);
    expect(checkoutEmails[0].unsubscribeUrl).toContain('/api/recovery/unsubscribe?token=');
    expect(previewEmails).toHaveLength(0);
    expect(wizardEmails).toHaveLength(0);
    expect(insertedEmailEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          event_type: 'checkout_recovery_sent',
          event_data: expect.objectContaining({ recovery_kind: 'checkout', case_id: 'case-1' }),
        }),
      ])
    );
  });

  it('does not send recovery emails to an unsubscribed address', async () => {
    mockCheckoutOrders = [
      {
        id: 'order-1',
        user_id: 'user-1',
        case_id: 'case-1',
        product_type: 'notice_only',
        product_name: 'Notice Pack',
        total_amount: 49,
        payment_status: 'pending',
        stripe_checkout_url: 'https://checkout.example/session',
        stripe_session_id: 'cs_123',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];
    mockUsers = [{ id: 'user-1', email: 'alex@example.com', full_name: 'Alex Landlord' }];
    mockCheckoutEvents = [
      {
        email: 'alex@example.com',
        event_type: 'recovery_unsubscribed',
        event_data: { source: 'recovery_unsubscribe_link' },
      },
    ];

    const { GET } = await import('@/app/api/cron/recovery-orchestrator/route');
    const response = await GET(
      request('http://localhost/api/cron/recovery-orchestrator', {
        authorization: `Bearer ${MOCK_CRON_SECRET}`,
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.emails_sent).toBe(0);
    expect(data.skipped).toBe(1);
    expect(checkoutEmails).toEqual([]);
    expect(previewEmails).toEqual([]);
    expect(wizardEmails).toEqual([]);
    expect(insertedEmailEvents).toEqual([]);
  });
});
