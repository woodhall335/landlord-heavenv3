import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const MOCK_CRON_SECRET = 'test-cron-secret';

let mockOrders: any[] = [];
let mockUsers: any[] = [];
let mockRecoveryEvents: any[] = [];
let sentEmails: any[] = [];
let insertedEmailEvents: any[] = [];
let cronStarted = false;
let cronCompleted: Array<{ status: string; summary: string; metrics?: unknown }> = [];

function createOrdersBuilder() {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    not: vi.fn(() => builder),
    lte: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => Promise.resolve({ data: mockOrders, error: null })),
  };
  return builder;
}

function createUsersBuilder() {
  const builder: any = {
    select: vi.fn(() => builder),
    in: vi.fn(() => Promise.resolve({ data: mockUsers, error: null })),
  };
  return builder;
}

function createEmailEventsBuilder() {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    in: vi.fn(() => builder),
    gte: vi.fn(() => Promise.resolve({ data: mockRecoveryEvents, error: null })),
    limit: vi.fn(() => Promise.resolve({ data: mockRecoveryEvents, error: null })),
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
      if (table === 'orders') return createOrdersBuilder();
      if (table === 'users') return createUsersBuilder();
      if (table === 'email_events') return createEmailEventsBuilder();
      throw new Error(`Unexpected table ${table}`);
    }),
  })),
}));

vi.mock('@/lib/email/resend', () => ({
  sendAbandonedCheckoutRecoveryEmail: vi.fn((params: any) => {
    sentEmails.push(params);
    return Promise.resolve({ success: true });
  }),
}));

vi.mock('@/lib/validation/cron-run-tracker', () => ({
  startCronRun: vi.fn(() => {
    cronStarted = true;
    return Promise.resolve({
      id: 'checkout-recovery-run-id',
      jobName: 'checkout:recover-abandoned',
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

describe('checkout recovery cron', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.CRON_SECRET = MOCK_CRON_SECRET;
    mockOrders = [];
    mockUsers = [];
    mockRecoveryEvents = [];
    sentEmails = [];
    insertedEmailEvents = [];
    cronStarted = false;
    cronCompleted = [];
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
    vi.clearAllMocks();
  });

  it('returns a health check without sending recovery email', async () => {
    const { GET } = await import('@/app/api/cron/checkout-recovery/route');

    const response = await GET(request('http://localhost/api/cron/checkout-recovery'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.job).toBe('checkout:recover-abandoned');
    expect(data.min_age_minutes).toBe(45);
    expect(cronStarted).toBe(false);
    expect(sentEmails).toEqual([]);
  });

  it('sends one recovery email for a pending checkout with known email and logs dedupe event', async () => {
    mockOrders = [
      {
        id: 'order-1',
        user_id: 'user-1',
        case_id: 'case-1',
        product_type: 'notice_only',
        product_name: 'Stage 1 Notice',
        total_amount: '39.99',
        payment_status: 'pending',
        stripe_checkout_url: 'https://checkout.stripe.com/c/session',
        stripe_session_id: 'cs_test_123',
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
    ];
    mockUsers = [{ id: 'user-1', email: 'landlord@example.com', full_name: 'Alex Landlord' }];

    const { GET } = await import('@/app/api/cron/checkout-recovery/route');
    const response = await GET(
      request('http://localhost/api/cron/checkout-recovery', {
        authorization: `Bearer ${MOCK_CRON_SECRET}`,
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.emails_sent).toBe(1);
    expect(sentEmails).toEqual([
      expect.objectContaining({
        to: 'landlord@example.com',
        customerName: 'Alex Landlord',
        productName: 'Stage 1: Section 8 Notice & Service Pack',
        amount: 39.99,
        checkoutUrl: 'https://checkout.stripe.com/c/session',
        unsubscribeUrl: expect.stringContaining('/api/recovery/unsubscribe?token='),
      }),
    ]);
    expect(insertedEmailEvents).toEqual([
      expect.objectContaining({
        email: 'landlord@example.com',
        event_type: 'checkout_recovery_sent',
        event_data: expect.objectContaining({
          order_id: 'order-1',
          source: 'checkout:recover-abandoned',
        }),
      }),
    ]);
    expect(cronCompleted[0].status).toBe('success');
  });

  it('skips orders that already have a checkout recovery event', async () => {
    mockOrders = [
      {
        id: 'order-1',
        user_id: 'user-1',
        case_id: 'case-1',
        product_type: 'notice_only',
        product_name: 'Stage 1 Notice',
        total_amount: '39.99',
        payment_status: 'pending',
        stripe_checkout_url: 'https://checkout.stripe.com/c/session',
        stripe_session_id: 'cs_test_123',
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
    ];
    mockUsers = [{ id: 'user-1', email: 'landlord@example.com', full_name: 'Alex Landlord' }];
    mockRecoveryEvents = [
      {
        email: 'landlord@example.com',
        event_type: 'checkout_recovery_sent',
        event_data: { order_id: 'order-1' },
      },
    ];

    const { GET } = await import('@/app/api/cron/checkout-recovery/route');
    const response = await GET(
      request('http://localhost/api/cron/checkout-recovery', {
        authorization: `Bearer ${MOCK_CRON_SECRET}`,
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.emails_sent).toBe(0);
    expect(data.skipped).toBe(1);
    expect(sentEmails).toEqual([]);
    expect(insertedEmailEvents).toEqual([]);
  });

  it('skips checkout recovery when the email has unsubscribed from recovery reminders', async () => {
    mockOrders = [
      {
        id: 'order-1',
        user_id: 'user-1',
        case_id: 'case-1',
        product_type: 'notice_only',
        product_name: 'Stage 1 Notice',
        total_amount: '39.99',
        payment_status: 'pending',
        stripe_checkout_url: 'https://checkout.stripe.com/c/session',
        stripe_session_id: 'cs_test_123',
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
    ];
    mockUsers = [{ id: 'user-1', email: 'landlord@example.com', full_name: 'Alex Landlord' }];
    mockRecoveryEvents = [
      {
        email: 'landlord@example.com',
        event_type: 'recovery_unsubscribed',
        event_data: { source: 'recovery_unsubscribe_link' },
      },
    ];

    const { GET } = await import('@/app/api/cron/checkout-recovery/route');
    const response = await GET(
      request('http://localhost/api/cron/checkout-recovery', {
        authorization: `Bearer ${MOCK_CRON_SECRET}`,
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.emails_sent).toBe(0);
    expect(data.skipped).toBe(1);
    expect(sentEmails).toEqual([]);
    expect(insertedEmailEvents).toEqual([]);
  });
});
