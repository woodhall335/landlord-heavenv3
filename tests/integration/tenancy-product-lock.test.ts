import { describe, test, expect, beforeEach, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

interface MockDatabase {
  cases: Map<string, any>;
  case_facts: Map<string, any>;
  orders: Map<string, any>;
}

const { mockSupabase, mockDb } = vi.hoisted(() => {
  const db: MockDatabase = {
    cases: new Map(),
    case_facts: new Map(),
    orders: new Map(),
  };

  const createQueryBuilder = (tableName: keyof MockDatabase) => {
    let filters: Array<{ column: string; operator: string; value: any }> = [];
    let orderBy: { column: string; ascending: boolean } | null = null;

    const applyFilters = (items: any[]) =>
      items.filter((item) =>
        filters.every((f) => {
          if (f.operator === 'eq') return item[f.column] === f.value;
          if (f.operator === 'is') return item[f.column] === f.value;
          return true;
        })
      );

    const builder = {
      select: () => builder,
      eq: (column: string, value: any) => {
        filters.push({ column, operator: 'eq', value });
        return builder;
      },
      is: (column: string, value: any) => {
        filters.push({ column, operator: 'is', value });
        return builder;
      },
      order: (column: string, { ascending }: { ascending: boolean }) => {
        orderBy = { column, ascending };
        return builder;
      },
      limit: () => builder,
      maybeSingle: async () => {
        let items = Array.from(db[tableName].values());
        items = applyFilters(items);
        if (orderBy) {
          items.sort((a, b) => {
            const left = a[orderBy!.column];
            const right = b[orderBy!.column];
            if (left === right) return 0;
            if (left === null || left === undefined) return 1;
            if (right === null || right === undefined) return -1;
            return orderBy!.ascending ? (left > right ? 1 : -1) : (left > right ? -1 : 1);
          });
        }
        return items.length === 0
          ? { data: null, error: null }
          : { data: items[0], error: null };
      },
      single: async () => {
        const items = applyFilters(Array.from(db[tableName].values()));
        return items.length === 0
          ? { data: null, error: new Error('Not found') }
          : { data: items[0], error: null };
      },
    };
    return builder;
  };

  const client = {
    from: (tableName: keyof MockDatabase) => ({
      select: () => createQueryBuilder(tableName),
      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            const id = data.id || crypto.randomUUID();
            const record = { ...data, id, created_at: new Date().toISOString() };
            const mapKey = tableName === 'case_facts' && data.case_id ? data.case_id : id;
            db[tableName].set(mapKey, record);
            return { data: record, error: null };
          },
        }),
      }),
      update: (data: any) => {
        let updateFilters: Array<{ column: string; value: any }> = [];
        return {
          eq: (column: string, value: any) => {
            updateFilters.push({ column, value });
            const items = Array.from(db[tableName].entries());
            items
              .filter(([, item]) => updateFilters.every((f) => item[f.column] === f.value))
              .forEach(([id, item]) =>
                db[tableName].set(id, { ...item, ...data, updated_at: new Date().toISOString() })
              );
            return { data: null, error: null };
          },
        };
      },
    }),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  } as unknown as SupabaseClient<Database>;

  return { mockSupabase: client, mockDb: db };
});

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => mockSupabase,
  createAdminClient: () => mockSupabase,
  getServerUser: async () => null,
  requireServerAuth: async () => ({ id: 'user-1' }),
  tryGetServerUser: async () => ({ id: 'user-1' }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => mockSupabase,
  logSupabaseAdminDiagnostics: () => {},
}));

vi.mock('@/lib/payments/edit-window-enforcement', () => ({
  checkMutationAllowed: async () => ({ allowed: true }),
}));

vi.mock('@/lib/payments/entitlement', () => ({
  getCasePaymentStatus: async (caseId: string) => {
    const orders = Array.from(mockDb.orders.values()).filter(
      (order) => order.case_id === caseId && order.payment_status === 'paid'
    );
    const sorted = orders.sort((a, b) => {
      if (!a.paid_at || !b.paid_at) return 0;
      return a.paid_at > b.paid_at ? -1 : 1;
    });
    return {
      hasPaidOrder: sorted.length > 0,
      paidProducts: sorted.map((order) => order.product_type).filter(Boolean),
      latestOrder: sorted[0] || null,
    };
  },
}));

vi.mock('@/lib/ai/ask-heaven', () => ({
  enhanceAnswer: vi.fn(async () => null),
}));

import { POST as wizardAnswer } from '@/app/api/wizard/answer/route';
import { POST as saveFacts } from '@/app/api/wizard/save-facts/route';

describe('Tenancy product lock enforcement', () => {
  beforeEach(() => {
    mockDb.cases.clear();
    mockDb.case_facts.clear();
    mockDb.orders.clear();
  });

  test('blocks premium upgrade via save-facts when standard entitlement exists', async () => {
    const caseId = 'case-standard';

    mockDb.cases.set(caseId, {
      id: caseId,
      case_type: 'tenancy_agreement',
      jurisdiction: 'england',
      collected_facts: {},
    });

    mockDb.orders.set('order-1', {
      id: 'order-1',
      case_id: caseId,
      payment_status: 'paid',
      product_type: 'ast_standard',
      paid_at: '2026-01-10T10:00:00.000Z',
    });

    const request = new Request('http://localhost/api/wizard/save-facts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        case_id: caseId,
        facts: { product_tier: 'Premium AST' },
      }),
    });

    const response = await saveFacts(request);
    expect(response.status).toBe(402);
    const data = await response.json();
    expect(data.code).toBe('UPGRADE_REQUIRED');
  });

  test('blocks premium upgrade via wizard answer when standard entitlement exists', async () => {
    const caseId = 'case-standard-answer';

    mockDb.cases.set(caseId, {
      id: caseId,
      case_type: 'tenancy_agreement',
      jurisdiction: 'england',
      collected_facts: {},
    });

    mockDb.orders.set('order-2', {
      id: 'order-2',
      case_id: caseId,
      payment_status: 'paid',
      product_type: 'ast_standard',
      paid_at: '2026-01-10T10:00:00.000Z',
    });

    const request = new Request('http://localhost/api/wizard/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        case_id: caseId,
        question_id: 'ast_tier',
        answer: 'Premium AST',
      }),
    });

    const response = await wizardAnswer(request);
    expect(response.status).toBe(402);
    const data = await response.json();
    expect(data.code).toBe('UPGRADE_REQUIRED');
  });
});
