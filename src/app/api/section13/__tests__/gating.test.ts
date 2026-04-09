import { beforeEach, describe, expect, it, vi } from 'vitest';

let mockPaidOrder: Record<string, unknown> | null = null;

const mockCaseRow = {
  id: '11111111-1111-1111-1111-111111111111',
  user_id: 'user-1',
  session_token: null,
  case_type: 'rent_increase',
  workflow_status: 'fulfilled',
  collected_facts: {},
};

function createQuery(table: string) {
  const state: Record<string, unknown> = {};

  const builder: any = {
    select: () => builder,
    eq: (column: string, value: unknown) => {
      state[column] = value;
      return builder;
    },
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
        const matches =
          mockPaidOrder &&
          mockPaidOrder.case_id === state.case_id &&
          mockPaidOrder.payment_status === state.payment_status &&
          mockPaidOrder.product_type === state.product_type;

        return { data: matches ? mockPaidOrder : null, error: null };
      }

      return { data: null, error: null };
    },
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
  })),
  logSupabaseAdminDiagnostics: vi.fn(),
}));

import { GET as getSection13Support, POST as postSection13Support } from '../ask-heaven/route';
import { GET as getTribunalBundle, POST as postTribunalBundle } from '../tribunal-bundle/route';

describe('Section 13 paid-feature gating', () => {
  beforeEach(() => {
    mockPaidOrder = null;
    vi.clearAllMocks();
  });

  it('blocks Section 13 support GET for a paid Standard order', async () => {
    mockPaidOrder = {
      id: 'order-standard',
      case_id: mockCaseRow.id,
      payment_status: 'paid',
      product_type: 'section13_standard',
    };

    const response = await getSection13Support(
      new Request(`http://localhost/api/section13/ask-heaven?caseId=${mockCaseRow.id}`)
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toContain('Defensive Pack');
  });

  it('blocks Section 13 support POST when there is no paid Defensive order', async () => {
    const response = await postSection13Support(
      new Request('http://localhost/api/section13/ask-heaven', {
        method: 'POST',
        body: JSON.stringify({
          caseId: mockCaseRow.id,
          message: 'Please explain the bundle.',
        }),
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toContain('paid Defensive Pack');
  });

  it('blocks tribunal bundle GET for a paid Standard order', async () => {
    mockPaidOrder = {
      id: 'order-standard',
      case_id: mockCaseRow.id,
      payment_status: 'paid',
      product_type: 'section13_standard',
    };

    const response = await getTribunalBundle(
      new Request(`http://localhost/api/section13/tribunal-bundle?caseId=${mockCaseRow.id}`)
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toContain('Defensive Pack');
  });

  it('blocks tribunal bundle POST when there is no paid Defensive order', async () => {
    const response = await postTribunalBundle(
      new Request('http://localhost/api/section13/tribunal-bundle', {
        method: 'POST',
        body: JSON.stringify({
          caseId: mockCaseRow.id,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toContain('paid Defensive Pack order');
  });
});
