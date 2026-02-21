import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUserId = '11111111-1111-1111-1111-111111111111';
const mockCaseId = '22222222-2222-4222-8222-222222222222';

const mockCaseData = {
  jurisdiction: 'england',
  case_type: 'tenancy_agreement',
  user_id: mockUserId,
  collected_facts: {
    tenancy_start_date: '2026-01-01',
    rent_amount: 1200,
    // intentionally missing deposit_amount and tenants
  },
};

vi.mock('@/lib/supabase/ensure-user', () => ({
  ensureUserProfileExists: vi.fn().mockResolvedValue({ success: true }),
}));

const createChain = (table: string) => {
  const chain: Record<string, any> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.single = vi.fn(async () => {
    if (table === 'users') {
      return { data: { stripe_customer_id: 'cus_123', email: 'test@example.com' }, error: null };
    }
    if (table === 'cases') {
      return { data: mockCaseData, error: null };
    }
    return { data: null, error: null };
  });
  chain.insert = vi.fn(() => chain);
  chain.update = vi.fn(() => chain);
  return chain;
};

vi.mock('@/lib/supabase/server', () => ({
  requireServerAuth: vi.fn().mockResolvedValue({ id: mockUserId, email: 'test@example.com', user_metadata: {} }),
  createServerSupabaseClient: vi.fn().mockResolvedValue({ from: vi.fn((t: string) => createChain(t)) }),
  createAdminClient: vi.fn(() => ({ from: vi.fn((t: string) => createChain(t)) })),
}));

vi.mock('@/lib/stripe', () => ({
  stripe: {
    customers: { create: vi.fn() },
    checkout: { sessions: { create: vi.fn(), retrieve: vi.fn() } },
  },
  PRICE_IDS: {
    NOTICE_ONLY: 'price_notice',
    EVICTION_PACK: 'price_pack',
    MONEY_CLAIM: 'price_claim',
    STANDARD_AST: 'price_ast_std',
    PREMIUM_AST: 'price_ast_pre',
  },
  assertValidPriceId: vi.fn(),
  StripePriceIdError: class extends Error {},
}));

vi.mock('@/lib/logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

describe('POST /api/checkout/create tenancy gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 and missing_fields for incomplete tenancy facts', async () => {
    const { POST } = await import('@/app/api/checkout/create/route');

    const request = new Request('http://localhost/api/checkout/create', {
      method: 'POST',
      body: JSON.stringify({
        product_type: 'ast_standard',
        case_id: mockCaseId,
      }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Incomplete tenancy details');
    expect(body.missing_fields).toEqual(expect.arrayContaining(['deposit_amount', 'tenants']));
  });
});
