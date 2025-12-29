import { beforeEach, describe, expect, it, vi } from 'vitest';

const { db, constructEventMock, fulfillOrderMock } = vi.hoisted(() => {
  const database = {
    orders: [] as Array<any>,
    webhook_logs: [] as Array<any>,
    users: [] as Array<any>,
  };

  const constructEvent = vi.fn();
  const fulfillOrder = vi.fn(async ({ orderId }: { orderId: string }) => {
    const order = database.orders.find((row) => row.id === orderId);
    if (order) {
      order.fulfillment_status = 'fulfilled';
    }
    return { status: 'fulfilled' };
  });

  return { db: database, constructEventMock: constructEvent, fulfillOrderMock: fulfillOrder };
});

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: constructEventMock,
    },
    subscriptions: {
      retrieve: vi.fn(async () => ({ metadata: { user_id: 'user-1' } })),
    },
  })),
}));

vi.mock('@/lib/email/resend', () => ({
  sendPurchaseConfirmation: vi.fn(async () => undefined),
}));

vi.mock('@/lib/payments/fulfillment', () => ({
  fulfillOrder: fulfillOrderMock,
}));

vi.mock('@/lib/supabase/server', () => {
  const createQueryBuilder = (tableName: keyof typeof db) => {
    let filters: Array<{ column: string; value: any }> = [];
    const builder = {
      select: () => builder,
      eq: (column: string, value: any) => {
        filters.push({ column, value });
        return builder;
      },
      order: () => builder,
      limit: () => builder,
      maybeSingle: async () => {
        const match = db[tableName].find((row) =>
          filters.every((filter) => row[filter.column] === filter.value)
        );
        return { data: match ?? null, error: null };
      },
      single: async () => {
        const match = db[tableName].find((row) =>
          filters.every((filter) => row[filter.column] === filter.value)
        );
        return match
          ? { data: match, error: null }
          : { data: null, error: new Error('Not found') };
      },
      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            const row = { id: data.id ?? `log-${db.webhook_logs.length + 1}`, ...data };
            db[tableName].push(row);
            return { data: row, error: null };
          },
        }),
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => {
          db[tableName]
            .filter((row) => row[column] === value)
            .forEach((row) => Object.assign(row, data));
          return { data: null, error: null };
        },
      }),
    };
    return builder;
  };

  return {
    createAdminClient: () => ({
      from: (tableName: keyof typeof db) => createQueryBuilder(tableName),
    }),
  };
});

describe('Stripe webhook handler', () => {
  beforeEach(() => {
    db.orders.length = 0;
    db.webhook_logs.length = 0;
    db.users.length = 0;
    constructEventMock.mockReset();
    fulfillOrderMock.mockClear();

    process.env.STRIPE_SECRET_KEY = 'sk_test';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  });

  it('rejects invalid webhook signatures', async () => {
    constructEventMock.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const { POST } = await import('@/app/api/webhooks/stripe/route');
    const response = await POST(
      new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 'invalid',
        },
        body: JSON.stringify({}),
      })
    );

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toContain('Webhook Error');
  });

  it('marks orders paid and fulfills on checkout completion', async () => {
    const order = {
      id: 'order-1',
      case_id: 'case-1',
      product_type: 'notice_only',
      payment_status: 'pending',
      fulfillment_status: 'pending',
    };
    db.orders.push(order);

    const event = {
      id: 'evt_1',
      type: 'checkout.session.completed',
      created: Date.now(),
      data: {
        object: {
          id: 'cs_1',
          mode: 'payment',
          payment_intent: 'pi_1',
          metadata: {
            order_id: 'order-1',
            case_id: 'case-1',
            product_type: 'notice_only',
            user_id: 'user-1',
          },
        },
      },
    };

    constructEventMock.mockReturnValue(event);

    const { POST } = await import('@/app/api/webhooks/stripe/route');
    const response = await POST(
      new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': 'valid',
        },
        body: JSON.stringify(event),
      })
    );

    expect(response.status).toBe(200);
    expect(order.payment_status).toBe('paid');
    expect(order.fulfillment_status).toBe('fulfilled');
    expect(fulfillOrderMock).toHaveBeenCalledTimes(1);
    expect(db.webhook_logs).toHaveLength(1);
    expect(db.webhook_logs[0].processing_result).toBe('fulfilled');
  });

  it('is idempotent for replayed webhook events', async () => {
    const order = {
      id: 'order-2',
      case_id: 'case-2',
      product_type: 'notice_only',
      payment_status: 'pending',
      fulfillment_status: 'pending',
    };
    db.orders.push(order);

    const event = {
      id: 'evt_2',
      type: 'checkout.session.completed',
      created: Date.now(),
      data: {
        object: {
          id: 'cs_2',
          mode: 'payment',
          payment_intent: 'pi_2',
          metadata: {
            order_id: 'order-2',
            case_id: 'case-2',
            product_type: 'notice_only',
            user_id: 'user-2',
          },
        },
      },
    };

    constructEventMock.mockReturnValue(event);

    const { POST } = await import('@/app/api/webhooks/stripe/route');

    const firstResponse = await POST(
      new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': 'valid' },
        body: JSON.stringify(event),
      })
    );

    const secondResponse = await POST(
      new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': 'valid' },
        body: JSON.stringify(event),
      })
    );

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);
    expect(fulfillOrderMock).toHaveBeenCalledTimes(1);
    expect(db.webhook_logs).toHaveLength(1);
  });
});
