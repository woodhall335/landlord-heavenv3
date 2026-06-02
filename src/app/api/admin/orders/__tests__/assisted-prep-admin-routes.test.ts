import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

const ORDER_ID = '11111111-1111-4111-8111-111111111111';
const SELF_SERVE_ORDER_ID = '22222222-2222-4222-8222-222222222222';
const UNPAID_ORDER_ID = '33333333-3333-4333-8333-333333333333';
const REFUNDED_ORDER_ID = '44444444-4444-4444-8444-444444444444';
const CASE_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const USER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ADMIN_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

type TableName = 'orders' | 'users' | 'cases' | 'email_events' | 'webhook_logs';

const mocks = vi.hoisted(() => ({
  requireServerAuth: vi.fn(),
  isAdmin: vi.fn(),
  sendAssistedPrepLifecycleEmail: vi.fn(),
  sendAssistedPrepPackReady: vi.fn(),
  safeUpdateOrderWithMetadata: vi.fn(),
  tables: {
    orders: [] as any[],
    users: [] as any[],
    cases: [] as any[],
    email_events: [] as any[],
    webhook_logs: [] as any[],
  } as Record<TableName, any[]>,
  updates: [] as Array<{ table: TableName; payload: Record<string, unknown>; filters: Array<{ column: string; value: unknown }> }>,
}));

vi.mock('@/lib/supabase/server', () => {
  function createBuilder(table: TableName) {
    const filters: Array<{ column: string; value: unknown }> = [];
    let updatePayload: Record<string, unknown> | null = null;

    const findRows = () =>
      mocks.tables[table].filter((row) =>
        filters.every((filter) => row[filter.column] === filter.value)
      );

    const builder: any = {
      select: vi.fn(() => builder),
      eq: vi.fn((column: string, value: unknown) => {
        filters.push({ column, value });
        if (updatePayload) {
          mocks.updates.push({ table, payload: updatePayload, filters: [...filters] });
          mocks.tables[table].forEach((row) => {
            if (filters.every((filter) => row[filter.column] === filter.value)) {
              Object.assign(row, updatePayload);
            }
          });
        }
        return builder;
      }),
      single: vi.fn(async () => {
        const row = findRows()[0] || null;
        return row ? { data: row, error: null } : { data: null, error: { message: 'Not found' } };
      }),
      update: vi.fn((payload: Record<string, unknown>) => {
        updatePayload = payload;
        return builder;
      }),
      insert: vi.fn(async (payload: Record<string, unknown>) => {
        mocks.tables[table].push(payload);
        return { data: null, error: null };
      }),
    };

    return builder;
  }

  return {
    requireServerAuth: mocks.requireServerAuth,
    createAdminClient: vi.fn(() => ({
      from: vi.fn((table: TableName) => createBuilder(table)),
    })),
  };
});

vi.mock('@/lib/auth', () => ({
  isAdmin: mocks.isAdmin,
}));

vi.mock('@/lib/email/resend', () => ({
  sendAssistedPrepLifecycleEmail: mocks.sendAssistedPrepLifecycleEmail,
  sendAssistedPrepPackReady: mocks.sendAssistedPrepPackReady,
}));

vi.mock('@/lib/payments/safe-order-metadata', () => ({
  extractOrderMetadata: (order: any) =>
    order && typeof order.metadata === 'object' ? order.metadata : null,
  safeUpdateOrderWithMetadata: mocks.safeUpdateOrderWithMetadata,
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost.test/api/admin/orders/assisted-test', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function seedTables() {
  mocks.tables.orders = [
    {
      id: ORDER_ID,
      user_id: USER_ID,
      case_id: CASE_ID,
      product_type: 'section8_assisted_prep',
      product_name: 'Section 8 Notice Assisted Prep',
      payment_status: 'paid',
      fulfillment_status: 'callback_pending',
      total_amount: 149,
      metadata: { assisted_status_history: [] },
    },
    {
      id: SELF_SERVE_ORDER_ID,
      user_id: USER_ID,
      case_id: CASE_ID,
      product_type: 'notice_only',
      product_name: 'Notice Only',
      payment_status: 'paid',
      fulfillment_status: 'fulfilled',
      metadata: {},
    },
    {
      id: UNPAID_ORDER_ID,
      user_id: USER_ID,
      case_id: CASE_ID,
      product_type: 'money_claim_assisted_prep',
      product_name: 'Money Claim Assisted Prep',
      payment_status: 'pending',
      fulfillment_status: 'callback_pending',
      metadata: {},
    },
    {
      id: REFUNDED_ORDER_ID,
      user_id: USER_ID,
      case_id: CASE_ID,
      product_type: 'possession_claim_assisted_prep',
      product_name: 'Possession Claim Assisted Prep',
      payment_status: 'refunded',
      fulfillment_status: 'blocked_refund_due',
      metadata: {},
    },
  ];
  mocks.tables.users = [
    {
      id: USER_ID,
      email: 'landlord@example.com',
      full_name: 'Charlotte Landlord',
    },
  ];
  mocks.tables.cases = [{ id: CASE_ID, workflow_status: 'callback_pending' }];
  mocks.tables.email_events = [];
  mocks.tables.webhook_logs = [];
  mocks.updates = [];
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  seedTables();
  process.env.NEXT_PUBLIC_APP_URL = 'https://landlordheaven.co.uk';
  process.env.NEXT_PUBLIC_CALENDLY_ASSISTED_PREP_URL =
    'https://calendly.com/landlordheaven/assisted-prep';

  mocks.requireServerAuth.mockResolvedValue({ id: ADMIN_ID, email: 'admin@example.com' });
  mocks.isAdmin.mockReturnValue(true);
  mocks.sendAssistedPrepLifecycleEmail.mockResolvedValue({ success: true, id: 'email_lifecycle' });
  mocks.sendAssistedPrepPackReady.mockResolvedValue({ success: true, id: 'email_ready' });
  mocks.safeUpdateOrderWithMetadata.mockImplementation(
    async (_client: unknown, orderId: string, orderPatch: Record<string, unknown>, metadata: Record<string, unknown>) => {
      const order = mocks.tables.orders.find((row) => row.id === orderId);
      if (!order) return { error: { message: 'Not found' } };
      Object.assign(order, orderPatch, { metadata });
      mocks.updates.push({
        table: 'orders',
        payload: { ...orderPatch, metadata },
        filters: [{ column: 'id', value: orderId }],
      });
      return { error: null };
    }
  );
});

describe('POST /api/admin/orders/assisted-status', () => {
  it('returns 401 when the admin session has expired', async () => {
    mocks.requireServerAuth.mockRejectedValueOnce(new Error('Unauthorized - Please log in'));

    const { POST } = await import('@/app/api/admin/orders/assisted-status/route');
    const response = await POST(makeRequest({ orderId: ORDER_ID, status: 'in_review' }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'Unauthorized' });
  });

  it('returns 403 for authenticated non-admin users', async () => {
    mocks.isAdmin.mockReturnValueOnce(false);

    const { POST } = await import('@/app/api/admin/orders/assisted-status/route');
    const response = await POST(makeRequest({ orderId: ORDER_ID, status: 'in_review' }));

    expect(response.status).toBe(403);
  });

  it('rejects non-assisted orders', async () => {
    const { POST } = await import('@/app/api/admin/orders/assisted-status/route');
    const response = await POST(makeRequest({ orderId: SELF_SERVE_ORDER_ID, status: 'in_review' }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('assisted prep');
  });

  it('updates the order status, linked case workflow status, metadata history, and audit log', async () => {
    const { POST } = await import('@/app/api/admin/orders/assisted-status/route');
    const response = await POST(makeRequest({ orderId: ORDER_ID, status: 'pack_prepared', note: 'Documents checked' }));
    const data = await response.json();

    const order = mocks.tables.orders.find((row) => row.id === ORDER_ID);
    const linkedCase = mocks.tables.cases.find((row) => row.id === CASE_ID);

    expect(response.status).toBe(200);
    expect(data).toMatchObject({ ok: true, status: 'pack_prepared' });
    expect(order.fulfillment_status).toBe('pack_prepared');
    expect(order.metadata.assisted_status).toBe('pack_prepared');
    expect(order.metadata.assisted_status_note).toBe('Documents checked');
    expect(order.metadata.assisted_status_history).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ status: 'pack_prepared', note: 'Documents checked', admin_user_id: ADMIN_ID }),
      ])
    );
    expect(linkedCase.workflow_status).toBe('pack_prepared');
    expect(mocks.tables.webhook_logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          event_type: 'admin.assisted_status_updated',
          status: 'completed',
          payload: expect.objectContaining({ order_id: ORDER_ID, assisted_status: 'pack_prepared' }),
        }),
      ])
    );
  });

  it('rejects unpaid assisted orders for normal workflow updates', async () => {
    const { POST } = await import('@/app/api/admin/orders/assisted-status/route');
    const response = await POST(makeRequest({ orderId: UNPAID_ORDER_ID, status: 'in_review' }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Assisted status can only be updated on paid orders.',
    });
  });
});

describe('POST /api/admin/orders/assisted-email', () => {
  it('sends assisted lifecycle emails only for paid assisted orders', async () => {
    const { POST } = await import('@/app/api/admin/orders/assisted-email/route');
    const response = await POST(makeRequest({
      orderId: ORDER_ID,
      emailType: 'no_show_reschedule',
      note: 'Please book another callback.',
    }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({ ok: true, sent_to: 'landlord@example.com', email_type: 'no_show_reschedule' });
    expect(mocks.sendAssistedPrepLifecycleEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'landlord@example.com',
        customerName: 'Charlotte Landlord',
        productName: 'Section 8 Notice Assisted Prep',
        emailType: 'no_show_reschedule',
        caseUrl: `https://landlordheaven.co.uk/dashboard/cases/${CASE_ID}`,
        bookingUrl: 'https://calendly.com/landlordheaven/assisted-prep',
        note: 'Please book another callback.',
      })
    );
    expect(mocks.tables.email_events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: 'landlord@example.com',
          event_type: 'assisted_no_show_reschedule_sent',
        }),
      ])
    );
  });

  it('rejects lifecycle emails for self-serve orders', async () => {
    const { POST } = await import('@/app/api/admin/orders/assisted-email/route');
    const response = await POST(makeRequest({ orderId: SELF_SERVE_ORDER_ID, emailType: 'missing_information' }));

    expect(response.status).toBe(400);
    expect(mocks.sendAssistedPrepLifecycleEmail).not.toHaveBeenCalled();
  });

  it('allows refund processed email for refunded assisted orders', async () => {
    const { POST } = await import('@/app/api/admin/orders/assisted-email/route');
    const response = await POST(makeRequest({ orderId: REFUNDED_ORDER_ID, emailType: 'refund_processed' }));

    expect(response.status).toBe(200);
    expect(mocks.sendAssistedPrepLifecycleEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        productName: 'Possession Claim Assisted Prep',
        emailType: 'refund_processed',
      })
    );
  });

  it('blocks non-refund lifecycle emails for unpaid assisted orders', async () => {
    const { POST } = await import('@/app/api/admin/orders/assisted-email/route');
    const response = await POST(makeRequest({ orderId: UNPAID_ORDER_ID, emailType: 'missing_information' }));

    expect(response.status).toBe(400);
    expect(mocks.sendAssistedPrepLifecycleEmail).not.toHaveBeenCalled();
  });
});

describe('POST /api/admin/orders/send-assisted-ready', () => {
  it('sends the pack-ready email and marks order/case as sent to customer', async () => {
    const { POST } = await import('@/app/api/admin/orders/send-assisted-ready/route');
    const response = await POST(makeRequest({ orderId: ORDER_ID }));
    const data = await response.json();

    const order = mocks.tables.orders.find((row) => row.id === ORDER_ID);
    const linkedCase = mocks.tables.cases.find((row) => row.id === CASE_ID);

    expect(response.status).toBe(200);
    expect(data).toMatchObject({ ok: true, sent_to: 'landlord@example.com' });
    expect(mocks.sendAssistedPrepPackReady).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'landlord@example.com',
        productName: 'Section 8 Notice Assisted Prep',
        caseUrl: `https://landlordheaven.co.uk/dashboard/cases/${CASE_ID}`,
      })
    );
    expect(order.fulfillment_status).toBe('sent_to_customer');
    expect(linkedCase.workflow_status).toBe('sent_to_customer');
    expect(mocks.tables.email_events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ event_type: 'assisted_pack_ready_sent' }),
      ])
    );
  });

  it('rejects unpaid assisted orders before sending pack-ready email', async () => {
    const { POST } = await import('@/app/api/admin/orders/send-assisted-ready/route');
    const response = await POST(makeRequest({ orderId: UNPAID_ORDER_ID }));

    expect(response.status).toBe(400);
    expect(mocks.sendAssistedPrepPackReady).not.toHaveBeenCalled();
  });
});
